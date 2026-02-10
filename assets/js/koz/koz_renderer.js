/*
 * KOZ canvas renderer.
 * Responsibility:
 * - Draws the full King of Zone scene (map, zone, players, projectiles, UI overlays).
 * - Handles camera tracking, world/screen coordinate conversion, and visual effects.
 * Fit in overall game:
 * - Receives normalized render state from `koz_client.js` each animation frame.
 * - Provides visual-only feedback (hit flash, minimap, indicators) without game authority.
 */
(function (window) {
    'use strict';

    var KOZ = window.KOZ = window.KOZ || {};

    // Reusable math helpers for rendering, interpolation, and effect calculations.
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function distance(ax, ay, bx, by) {
        var dx = ax - bx;
        var dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Character color identity keeps heroes visually distinct in combat.
    var HERO_COLORS = {
        knight: '#83b8ff',
        wizard: '#f5a25f',
        archer: '#7affc5',
        warrior: '#ffd16f'
    };

    var POWERUP_COLORS = {
        heal: '#82ffad',
        speed: '#6ed8ff',
        shield: '#7c9dff',
        damage: '#ff8d6e',
        ammo: '#ffe189'
    };

    var MAP_THEMES = {
        'nebula-night': {
            bgA: '#06101f',
            bgB: '#112a4a',
            bgC: '#1a3c64',
            glowA: 'rgba(122, 219, 255, 0.22)',
            glowB: 'rgba(79, 154, 255, 0.18)',
            stripe: 'rgba(145, 208, 255, 0.08)',
            grid: 'rgba(171, 219, 255, 0.08)',
            wallFill: '#344a69',
            wallStroke: 'rgba(214, 238, 255, 0.42)',
            zoneStroke: 'rgba(110, 202, 255, 0.9)',
            zoneFill: 'rgba(83, 179, 255, 0.10)',
            minimapBg: 'rgba(9, 15, 26, 0.74)',
            minimapStroke: 'rgba(175, 223, 255, 0.22)'
        },
        'sunset-dunes': {
            bgA: '#24130b',
            bgB: '#4a2414',
            bgC: '#6d381b',
            glowA: 'rgba(255, 194, 116, 0.22)',
            glowB: 'rgba(255, 142, 102, 0.18)',
            stripe: 'rgba(255, 206, 142, 0.09)',
            grid: 'rgba(255, 214, 162, 0.075)',
            wallFill: '#7a4a31',
            wallStroke: 'rgba(255, 222, 186, 0.36)',
            zoneStroke: 'rgba(255, 186, 114, 0.92)',
            zoneFill: 'rgba(255, 175, 104, 0.11)',
            minimapBg: 'rgba(24, 12, 7, 0.74)',
            minimapStroke: 'rgba(255, 218, 178, 0.24)'
        },
        'neon-grid': {
            bgA: '#05061b',
            bgB: '#0d1230',
            bgC: '#141f4f',
            glowA: 'rgba(132, 215, 255, 0.2)',
            glowB: 'rgba(159, 146, 255, 0.18)',
            stripe: 'rgba(142, 157, 255, 0.10)',
            grid: 'rgba(154, 209, 255, 0.09)',
            wallFill: '#2f3f7b',
            wallStroke: 'rgba(213, 230, 255, 0.4)',
            zoneStroke: 'rgba(136, 206, 255, 0.94)',
            zoneFill: 'rgba(132, 174, 255, 0.10)',
            minimapBg: 'rgba(8, 10, 26, 0.74)',
            minimapStroke: 'rgba(184, 213, 255, 0.24)'
        },
        'jungle-monsoon': {
            bgA: '#071711',
            bgB: '#143228',
            bgC: '#21503f',
            glowA: 'rgba(124, 255, 198, 0.2)',
            glowB: 'rgba(102, 214, 255, 0.14)',
            stripe: 'rgba(145, 255, 204, 0.08)',
            grid: 'rgba(178, 242, 219, 0.075)',
            wallFill: '#2f5e4f',
            wallStroke: 'rgba(209, 245, 228, 0.36)',
            zoneStroke: 'rgba(130, 244, 199, 0.88)',
            zoneFill: 'rgba(106, 234, 190, 0.10)',
            minimapBg: 'rgba(6, 18, 14, 0.75)',
            minimapStroke: 'rgba(187, 239, 220, 0.24)'
        }
    };

    // Renderer stores camera/view state plus lightweight transient visual effects.
    function KOZRenderer(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.view = {
            width: canvas.clientWidth || 1280,
            height: canvas.clientHeight || 720,
            dpr: Math.max(1, window.devicePixelRatio || 1)
        };

        this.camera = {
            x: 2100,
            y: 1400,
            zoom: 1
        };

        this.avatarCache = {};

        this.hitFlash = 0;
        this.shake = 0;
        this.damageIndicator = {
            until: 0,
            angle: 0
        };

        this.floatTexts = [];

        this.resize();
        this.bindResize();
    }

    // Keep backing canvas resolution aligned with viewport changes.
    KOZRenderer.prototype.bindResize = function () {
        var self = this;
        window.addEventListener('resize', function () {
            self.resize();
        });
    };

    // Resize with DPR scaling to keep visuals sharp on high-density displays.
    KOZRenderer.prototype.resize = function () {
        var rect = this.canvas.getBoundingClientRect();
        this.view.width = Math.max(360, Math.round(rect.width || window.innerWidth));
        this.view.height = Math.max(240, Math.round(rect.height || window.innerHeight));
        this.view.dpr = Math.max(1, window.devicePixelRatio || 1);

        this.canvas.width = Math.round(this.view.width * this.view.dpr);
        this.canvas.height = Math.round(this.view.height * this.view.dpr);
        this.canvas.style.width = this.view.width + 'px';
        this.canvas.style.height = this.view.height + 'px';
    };

    KOZRenderer.prototype._getTheme = function (state) {
        var mapTheme = state && state.map && state.map.theme ? String(state.map.theme) : 'nebula-night';
        return MAP_THEMES[mapTheme] || MAP_THEMES['nebula-night'];
    };

    // Convert world coordinates to current camera-relative screen coordinates.
    KOZRenderer.prototype.worldToScreen = function (x, y) {
        return {
            x: (x - this.camera.x) + (this.view.width / 2),
            y: (y - this.camera.y) + (this.view.height / 2)
        };
    };

    // Convert pointer screen coordinates back to world space (for aiming logic).
    KOZRenderer.prototype.screenToWorld = function (x, y) {
        return {
            x: x + this.camera.x - (this.view.width / 2),
            y: y + this.camera.y - (this.view.height / 2)
        };
    };

    // Smooth camera follow constrained so view never leaves map bounds.
    KOZRenderer.prototype._updateCamera = function (localPlayer, map) {
        if (!localPlayer) return;
        var halfW = this.view.width / 2;
        var halfH = this.view.height / 2;

        var targetX = clamp(localPlayer.x, halfW, map.width - halfW);
        var targetY = clamp(localPlayer.y, halfH, map.height - halfH);

        this.camera.x = lerp(this.camera.x, targetX, 0.16);
        this.camera.y = lerp(this.camera.y, targetY, 0.16);
    };

    // Draw base gradient + moving world grid for spatial orientation.
    KOZRenderer.prototype._drawBackground = function (ctx, state) {
        var theme = this._getTheme(state);
        var grad = ctx.createLinearGradient(0, 0, this.view.width, this.view.height);
        grad.addColorStop(0, theme.bgA);
        grad.addColorStop(0.58, theme.bgB);
        grad.addColorStop(1, theme.bgC);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.view.width, this.view.height);

        var glowTop = ctx.createRadialGradient(this.view.width * 0.22, this.view.height * 0.16, 30, this.view.width * 0.22, this.view.height * 0.16, this.view.width * 0.55);
        glowTop.addColorStop(0, theme.glowA);
        glowTop.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowTop;
        ctx.fillRect(0, 0, this.view.width, this.view.height);

        var glowBottom = ctx.createRadialGradient(this.view.width * 0.80, this.view.height * 0.86, 24, this.view.width * 0.80, this.view.height * 0.86, this.view.width * 0.48);
        glowBottom.addColorStop(0, theme.glowB);
        glowBottom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowBottom;
        ctx.fillRect(0, 0, this.view.width, this.view.height);

        var start = this.screenToWorld(0, 0);
        var end = this.screenToWorld(this.view.width, this.view.height);

        ctx.save();
        ctx.strokeStyle = theme.stripe;
        ctx.lineWidth = 1;
        var stripeStep = 120;
        var stripeOffset = ((start.x + start.y) % stripeStep + stripeStep) % stripeStep;
        for (var stripe = -stripeOffset; stripe < this.view.width + this.view.height; stripe += stripeStep) {
            ctx.beginPath();
            ctx.moveTo(stripe, 0);
            ctx.lineTo(stripe - this.view.height, this.view.height);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = theme.grid;
        ctx.lineWidth = 1;

        var grid = 140;
        var gx = Math.floor(start.x / grid) * grid;
        while (gx <= end.x + grid) {
            var sx = this.worldToScreen(gx, 0).x;
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, this.view.height);
            ctx.stroke();
            gx += grid;
        }

        var gy = Math.floor(start.y / grid) * grid;
        while (gy <= end.y + grid) {
            var sy = this.worldToScreen(0, gy).y;
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(this.view.width, sy);
            ctx.stroke();
            gy += grid;
        }
        ctx.restore();
    };

    // Draw storm overlay and safe zone circle cutout.
    KOZRenderer.prototype._drawStormAndZone = function (ctx, state) {
        var zoneScreen = this.worldToScreen(state.zone.x, state.zone.y);
        var r = Math.max(1, state.zone.radius);
        var theme = this._getTheme(state);

        ctx.save();
        ctx.fillStyle = 'rgba(8, 15, 24, 0.54)';
        ctx.fillRect(0, 0, this.view.width, this.view.height);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(zoneScreen.x, zoneScreen.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = theme.zoneStroke;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(zoneScreen.x, zoneScreen.y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = theme.zoneFill;
        ctx.beginPath();
        ctx.arc(zoneScreen.x, zoneScreen.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    // Draw static collision walls only when they are inside/near viewport.
    KOZRenderer.prototype._drawObstacles = function (ctx, obstacles, state) {
        var theme = this._getTheme(state);
        ctx.save();
        obstacles.forEach(function (wall) {
            var screen = this.worldToScreen(wall.x, wall.y);
            var w = wall.w;
            var h = wall.h;

            if (screen.x > this.view.width + 20 || screen.y > this.view.height + 20 || screen.x + w < -20 || screen.y + h < -20) {
                return;
            }

            ctx.fillStyle = theme.wallFill;
            ctx.fillRect(screen.x, screen.y, w, h);
            ctx.strokeStyle = theme.wallStroke;
            ctx.lineWidth = 2;
            ctx.strokeRect(screen.x + 1, screen.y + 1, w - 2, h - 2);
        }, this);
        ctx.restore();
    };

    // Draw pulsing powerups with type-based colors for quick readability.
    KOZRenderer.prototype._drawPowerups = function (ctx, powerups, t) {
        ctx.save();
        powerups.forEach(function (powerup) {
            var screen = this.worldToScreen(powerup.x, powerup.y);
            if (screen.x < -30 || screen.x > this.view.width + 30 || screen.y < -30 || screen.y > this.view.height + 30) return;

            var pulse = 1 + Math.sin(t / 170 + powerup.x * 0.01) * 0.12;
            var color = POWERUP_COLORS[powerup.type] || '#ffffff';

            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.85;
            ctx.arc(screen.x, screen.y, (powerup.radius || 16) * 0.7 * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.globalAlpha = 0.28;
            ctx.arc(screen.x, screen.y, (powerup.radius || 16) * 1.2 * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }, this);
        ctx.restore();
    };

    // Draw active projectiles as simple performant circles.
    KOZRenderer.prototype._drawProjectiles = function (ctx, projectiles) {
        ctx.save();
        projectiles.forEach(function (projectile) {
            var screen = this.worldToScreen(projectile.x, projectile.y);
            if (screen.x < -30 || screen.x > this.view.width + 30 || screen.y < -30 || screen.y > this.view.height + 30) return;

            var radius = projectile.radius || 6;
            ctx.beginPath();
            ctx.fillStyle = projectile.color || '#ffffff';
            ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }, this);
        ctx.restore();
    };

    // Cache avatar images so repeated draws avoid re-creating Image objects.
    KOZRenderer.prototype._getAvatar = function (url) {
        if (!url) return null;
        if (this.avatarCache[url] && this.avatarCache[url].complete) return this.avatarCache[url];
        if (this.avatarCache[url]) return null;

        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        this.avatarCache[url] = img;
        return null;
    };

    // Draw one player token with hero color, HP bar, labels, and status rings.
    KOZRenderer.prototype._drawPlayer = function (ctx, player, localPlayer) {
        var screen = this.worldToScreen(player.x, player.y);
        var r = 22;

        if (screen.x < -70 || screen.x > this.view.width + 70 || screen.y < -70 || screen.y > this.view.height + 70) return;

        var heroColor = HERO_COLORS[player.hero] || '#dddddd';

        ctx.save();

        if (!player.alive) {
            ctx.globalAlpha = 0.35;
        }

        ctx.beginPath();
        ctx.fillStyle = heroColor;
        ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.lineWidth = player.sid === localPlayer.sid ? 4 : 2;
        ctx.strokeStyle = player.sid === localPlayer.sid ? '#e8fbff' : '#f7faff';
        ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
        ctx.stroke();

        if (player.overclockActive) {
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255, 205, 112, 0.95)';
            ctx.arc(screen.x, screen.y, r + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (player.coreHolder) {
            ctx.font = '16px "Oxanium", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffd96a';
            ctx.fillText('👑', screen.x, screen.y - r - 14);
        }

        var hpRatio = player.maxHp > 0 ? clamp(player.hp / player.maxHp, 0, 1) : 0;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(screen.x - 24, screen.y + r + 8, 48, 6);
        ctx.fillStyle = hpRatio > 0.4 ? '#7ef5ad' : '#ff8181';
        ctx.fillRect(screen.x - 24, screen.y + r + 8, 48 * hpRatio, 6);

        ctx.font = '12px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8fbff';
        ctx.fillText(player.name || 'Player', screen.x, screen.y - r - 22);

        if (player.avatar) {
            var img = this._getAvatar(player.avatar);
            if (img) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(screen.x - 30, screen.y - 30, 9, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, screen.x - 39, screen.y - 39, 18, 18);
                ctx.restore();
            }
        }

        ctx.restore();
    };

    // Draw objective core with animated glow.
    KOZRenderer.prototype._drawCore = function (ctx, core, t, state) {
        var screen = this.worldToScreen(core.x, core.y);
        if (screen.x < -80 || screen.x > this.view.width + 80 || screen.y < -80 || screen.y > this.view.height + 80) return;
        var theme = this._getTheme(state);

        var glowRadius = 32 + Math.sin(t / 180) * 5;

        ctx.save();
        var glow = ctx.createRadialGradient(screen.x, screen.y, 2, screen.x, screen.y, glowRadius);
        glow.addColorStop(0, 'rgba(124, 255, 255, 0.95)');
        glow.addColorStop(1, 'rgba(124, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = theme.zoneStroke;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, core.radius || 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ebffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    };

    // Draw aim reticle at world-space target selected by input module.
    KOZRenderer.prototype._drawCrosshair = function (ctx, aimWorld) {
        var screen = this.worldToScreen(aimWorld.x, aimWorld.y);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(screen.x - 15, screen.y);
        ctx.lineTo(screen.x + 15, screen.y);
        ctx.moveTo(screen.x, screen.y - 15);
        ctx.lineTo(screen.x, screen.y + 15);
        ctx.stroke();
        ctx.restore();
    };

    // Draw compact minimap with obstacles, zone, core, and player dots.
    KOZRenderer.prototype._drawMinimap = function (ctx, state) {
        var w = 190;
        var h = 132;
        var x = this.view.width - w - 18;
        var y = 18;
        var theme = this._getTheme(state);

        ctx.save();
        ctx.fillStyle = theme.minimapBg;
        ctx.strokeStyle = theme.minimapStroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, 10);
        } else {
            ctx.rect(x, y, w, h);
        }
        ctx.fill();
        ctx.stroke();

        var sx = w / state.map.width;
        var sy = h / state.map.height;

        state.obstacles.forEach(function (wall) {
            ctx.fillStyle = 'rgba(220, 236, 255, 0.28)';
            ctx.fillRect(x + wall.x * sx, y + wall.y * sy, wall.w * sx, wall.h * sy);
        });

        var zoneX = x + state.zone.x * sx;
        var zoneY = y + state.zone.y * sy;
        var zoneR = state.zone.radius * sx;
        ctx.strokeStyle = theme.zoneStroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(zoneX, zoneY, zoneR, 0, Math.PI * 2);
        ctx.stroke();

        if (state.core) {
            ctx.fillStyle = '#8efeff';
            ctx.beginPath();
            ctx.arc(x + state.core.x * sx, y + state.core.y * sy, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        state.remotePlayers.forEach(function (player) {
            if (!player.alive || player.spectator) return;
            ctx.fillStyle = player.coreHolder ? '#ffd96a' : 'rgba(240, 246, 255, 0.86)';
            ctx.beginPath();
            ctx.arc(x + player.x * sx, y + player.y * sy, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        if (state.localPlayer) {
            ctx.fillStyle = '#ff8f8f';
            ctx.beginPath();
            ctx.arc(x + state.localPlayer.x * sx, y + state.localPlayer.y * sy, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (state.core && state.core.heldBy) {
            var holder = state.remotePlayers.find(function (p) { return p.sid === state.core.heldBy; }) || (state.localPlayer.sid === state.core.heldBy ? state.localPlayer : null);
            if (holder) {
                ctx.fillStyle = '#ffd96a';
                ctx.font = '11px "Rajdhani", sans-serif';
                ctx.fillText('CORE', x + holder.x * sx + 5, y + holder.y * sy - 5);
            }
        }

        ctx.fillStyle = 'rgba(223, 241, 255, 0.9)';
        ctx.font = '11px "Rajdhani", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText((state.map && state.map.name) ? state.map.name : 'Arena', x + 8, y + 14);

        ctx.restore();
    };

    // Directional damage arrow points toward shooter when local player is hit.
    KOZRenderer.prototype._drawDamageIndicator = function (ctx, now) {
        if (now > this.damageIndicator.until) return;

        var remain = (this.damageIndicator.until - now) / 800;
        var alpha = clamp(remain, 0, 1) * 0.7;
        var cx = this.view.width / 2;
        var cy = this.view.height / 2;
        var dist = Math.min(this.view.width, this.view.height) * 0.42;

        var angle = this.damageIndicator.angle;
        var x = cx + Math.cos(angle) * dist;
        var y = cy + Math.sin(angle) * dist;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);

        ctx.fillStyle = 'rgba(255, 79, 79, ' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(12, 8);
        ctx.lineTo(-12, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    // Floating combat text (e.g., damage numbers) fades over short lifetime.
    KOZRenderer.prototype._drawFloatTexts = function (ctx, dt) {
        this.floatTexts.forEach(function (entry) {
            entry.ttl -= dt;
            entry.y -= dt * 24;
        });
        this.floatTexts = this.floatTexts.filter(function (entry) { return entry.ttl > 0; });

        ctx.save();
        this.floatTexts.forEach(function (entry) {
            var alpha = clamp(entry.ttl / entry.maxTtl, 0, 1);
            ctx.fillStyle = 'rgba(255, 120, 120, ' + alpha.toFixed(3) + ')';
            ctx.font = 'bold 16px "Oxanium", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(entry.text, entry.x, entry.y);
        });
        ctx.restore();
    };

    // Trigger temporary hit visual effects from client hit events.
    KOZRenderer.prototype.notifyHit = function (payload, localPlayer) {
        this.hitFlash = 0.8;
        this.shake = Math.max(this.shake, 0.9);

        var sx = Number(payload && payload.shooterX);
        var sy = Number(payload && payload.shooterY);
        if (isFinite(sx) && isFinite(sy) && localPlayer) {
            this.damageIndicator.angle = Math.atan2(sy - localPlayer.y, sx - localPlayer.x);
        }
        this.damageIndicator.until = performance.now() + 800;

        if (payload && typeof payload.damage !== 'undefined') {
            this.floatTexts.push({
                text: '-' + payload.damage,
                x: this.view.width / 2,
                y: (this.view.height / 2) - 40,
                ttl: 0.65,
                maxTtl: 0.65
            });
        }
    };

    // Master render pipeline called once per frame by KOZ main loop.
    KOZRenderer.prototype.render = function (state, dt, aimWorld) {
        var ctx = this.ctx;
        var now = performance.now();

        this._updateCamera(state.localPlayer, state.map);

        this.hitFlash = Math.max(0, this.hitFlash - dt * 1.8);
        this.shake = Math.max(0, this.shake - dt * 2.2);

        var shakeX = (Math.random() - 0.5) * this.shake * 6;
        var shakeY = (Math.random() - 0.5) * this.shake * 6;

        ctx.setTransform(this.view.dpr, 0, 0, this.view.dpr, 0, 0);
        ctx.clearRect(0, 0, this.view.width, this.view.height);

        ctx.save();
        ctx.translate(shakeX, shakeY);

        this._drawBackground(ctx, state);
        this._drawStormAndZone(ctx, state);
        this._drawObstacles(ctx, state.obstacles || [], state);
        this._drawPowerups(ctx, state.powerups || [], now);
        this._drawCore(ctx, state.core || {}, now, state);
        this._drawProjectiles(ctx, state.projectiles || []);

        (state.remotePlayers || []).forEach(function (player) {
            this._drawPlayer(ctx, player, state.localPlayer || {});
        }, this);

        if (state.localPlayer) {
            this._drawPlayer(ctx, state.localPlayer, state.localPlayer);
        }

        if (aimWorld) {
            this._drawCrosshair(ctx, aimWorld);
        }

        ctx.restore();

        this._drawDamageIndicator(ctx, now);
        this._drawFloatTexts(ctx, dt);

        this._drawMinimap(ctx, state);

        if (state.localPlayer && state.localPlayer.outside) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 94, 94, 0.17)';
            ctx.fillRect(0, 0, this.view.width, this.view.height);
            ctx.restore();
        }

        if (this.hitFlash > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 92, 92, ' + (this.hitFlash * 0.20).toFixed(3) + ')';
            ctx.fillRect(0, 0, this.view.width, this.view.height);
            ctx.restore();
        }
    };

    // Expose renderer constructor on KOZ namespace.
    KOZ.Renderer = KOZRenderer;
})(window);
