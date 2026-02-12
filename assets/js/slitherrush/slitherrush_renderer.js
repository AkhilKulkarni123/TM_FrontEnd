(function (window) {
    'use strict';

    var SlitherRush = window.SlitherRush = window.SlitherRush || {};

    function clamp(v, lo, hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function Renderer(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.view = {
            width: canvas.clientWidth || window.innerWidth,
            height: canvas.clientHeight || window.innerHeight,
            dpr: Math.max(1, window.devicePixelRatio || 1)
        };

        this.camera = { x: 0, y: 0 };
        this.smoothedHeads = {};
        this.smoothedBodies = {}; // per-player smoothed body positions
        this.backgroundPattern = null;

        this.resize();
        this.bindResize();
    }

    Renderer.prototype.bindResize = function () {
        var self = this;
        window.addEventListener('resize', function () {
            self.resize();
        });
    };

    Renderer.prototype.resize = function () {
        var rect = this.canvas.getBoundingClientRect();
        this.view.width = Math.max(360, Math.round(rect.width || window.innerWidth));
        this.view.height = Math.max(240, Math.round(rect.height || window.innerHeight));
        this.view.dpr = Math.max(1, window.devicePixelRatio || 1);

        this.canvas.width = Math.round(this.view.width * this.view.dpr);
        this.canvas.height = Math.round(this.view.height * this.view.dpr);
        this.canvas.style.width = this.view.width + 'px';
        this.canvas.style.height = this.view.height + 'px';

        this._rebuildBackgroundPattern();
    };

    Renderer.prototype._rebuildBackgroundPattern = function () {
        var tile = document.createElement('canvas');
        var size = 220;
        tile.width = size;
        tile.height = size;
        var pctx = tile.getContext('2d');
        if (!pctx) {
            this.backgroundPattern = null;
            return;
        }

        pctx.clearRect(0, 0, size, size);

        // Dot lattice.
        pctx.fillStyle = 'rgba(255, 214, 70, 0.08)';
        for (var y = 18; y < size; y += 34) {
            for (var x = 18; x < size; x += 34) {
                pctx.beginPath();
                pctx.arc(x, y, 1.35, 0, Math.PI * 2);
                pctx.fill();
            }
        }

        // Minimal diagonal hash accents.
        pctx.strokeStyle = 'rgba(255, 214, 70, 0.09)';
        pctx.lineWidth = 1;
        for (var i = -1; i < 7; i += 1) {
            var sx = i * 44;
            pctx.beginPath();
            pctx.moveTo(sx, 0);
            pctx.lineTo(sx + 54, 54);
            pctx.stroke();
        }

        pctx.strokeStyle = 'rgba(255, 188, 68, 0.08)';
        pctx.lineWidth = 1.2;
        pctx.beginPath();
        pctx.moveTo(0, size * 0.72);
        pctx.bezierCurveTo(size * 0.22, size * 0.63, size * 0.38, size * 0.83, size * 0.6, size * 0.73);
        pctx.bezierCurveTo(size * 0.76, size * 0.64, size * 0.9, size * 0.82, size, size * 0.7);
        pctx.stroke();

        this.backgroundPattern = this.ctx.createPattern(tile, 'repeat');
    };

    Renderer.prototype.worldToScreen = function (x, y) {
        return {
            x: (x - this.camera.x) + (this.view.width / 2),
            y: (y - this.camera.y) + (this.view.height / 2)
        };
    };

    Renderer.prototype._updateCamera = function (bounds, target) {
        if (!bounds || !target) return;

        var halfW = this.view.width / 2;
        var halfH = this.view.height / 2;

        var targetX = clamp(target.x, halfW, Math.max(halfW, bounds.width - halfW));
        var targetY = clamp(target.y, halfH, Math.max(halfH, bounds.height - halfH));

        this.camera.x = lerp(this.camera.x, targetX, 0.12);
        this.camera.y = lerp(this.camera.y, targetY, 0.12);
    };

    Renderer.prototype._drawBackground = function () {
        var ctx = this.ctx;
        var w = this.view.width;
        var h = this.view.height;

        var radial = ctx.createRadialGradient(w * 0.2, h * 0.14, 0, w * 0.5, h * 0.52, Math.max(w, h));
        radial.addColorStop(0, '#2a1f08');
        radial.addColorStop(0.44, '#17141b');
        radial.addColorStop(1, '#090b12');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, w, h);

        if (this.backgroundPattern) {
            var tileDriftX = ((-this.camera.x * 0.055) % 220 + 220) % 220;
            var tileDriftY = ((-this.camera.y * 0.055) % 220 + 220) % 220;
            ctx.save();
            ctx.translate(tileDriftX - 220, tileDriftY - 220);
            ctx.fillStyle = this.backgroundPattern;
            ctx.fillRect(0, 0, w + 440, h + 440);
            ctx.restore();
        }

        // Contour-like wave lines for motion depth.
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 214, 70, 0.1)';
        ctx.lineWidth = 1.15;
        for (var row = 0; row < 7; row += 1) {
            var baseY = row * (h / 6) + ((-this.camera.y * 0.08 + row * 17) % 50);
            ctx.beginPath();
            for (var x = -36; x <= w + 36; x += 18) {
                var wave =
                    Math.sin((x * 0.011) + (this.camera.x * 0.0032) + row) * 10 +
                    Math.cos((x * 0.0065) - (this.camera.y * 0.0027) + row * 0.8) * 6;
                var py = baseY + wave;
                if (x <= -36) ctx.moveTo(x, py);
                else ctx.lineTo(x, py);
            }
            ctx.stroke();
        }
        ctx.restore();

        // Soft glows anchored to world coordinates.
        ctx.save();
        for (var i = 0; i < 6; i += 1) {
            var worldX = ((i * 857) % 5400) + 120;
            var worldY = ((i * 613) % 3600) + 120;
            var glow = this.worldToScreen(worldX, worldY);
            if (glow.x < -260 || glow.x > w + 260 || glow.y < -260 || glow.y > h + 260) continue;
            var g = ctx.createRadialGradient(glow.x, glow.y, 8, glow.x, glow.y, 170);
            g.addColorStop(0, 'rgba(255, 214, 70, 0.2)');
            g.addColorStop(0.62, 'rgba(255, 188, 64, 0.08)');
            g.addColorStop(1, 'rgba(40, 28, 10, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(glow.x, glow.y, 170, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Gentle vignette to keep HUD readable.
        var vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.24, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.36)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    };

    Renderer.prototype._drawBounds = function (bounds) {
        if (!bounds) return;

        var topLeft = this.worldToScreen(0, 0);
        var bottomRight = this.worldToScreen(bounds.width, bounds.height);

        var x = topLeft.x;
        var y = topLeft.y;
        var w = bottomRight.x - topLeft.x;
        var h = bottomRight.y - topLeft.y;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 214, 70, 0.7)';
        this.ctx.lineWidth = 2.5;
        this.ctx.setLineDash([12, 9]);
        this.ctx.strokeRect(x, y, w, h);

        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'rgba(255, 231, 167, 0.23)';
        this.ctx.lineWidth = 6;
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.restore();
    };

    Renderer.prototype._drawEnergy = function (energyOrbs, nowMs) {
        var ctx = this.ctx;
        var pulseTime = nowMs / 250;

        ctx.save();
        for (var i = 0; i < energyOrbs.length; i++) {
            var orb = energyOrbs[i];
            var p = this.worldToScreen(orb.x, orb.y);
            if (p.x < -40 || p.x > this.view.width + 40 || p.y < -40 || p.y > this.view.height + 40) continue;

            var value = Math.max(1, Number(orb.value || 1));
            var radius = 5 + Math.min(9, value * 1.3);
            var pulse = 1 + (Math.sin(pulseTime + (i * 0.2)) * 0.2);
            var rotation = nowMs * 0.001 + i * 0.5;

            var core, glow, ringColor;
            if (value >= 5) {
                core = '#ff6040';
                glow = 'rgba(255, 96, 64, 0.4)';
                ringColor = 'rgba(255, 140, 80, 0.6)';
            } else if (value >= 3) {
                core = '#ff964f';
                glow = 'rgba(255, 150, 79, 0.35)';
                ringColor = 'rgba(255, 180, 100, 0.5)';
            } else {
                core = '#7eff6a';
                glow = 'rgba(126, 255, 106, 0.3)';
                ringColor = 'rgba(160, 255, 140, 0.45)';
            }

            // Outer glow
            var glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3 * pulse);
            glowGrad.addColorStop(0, glow);
            glowGrad.addColorStop(0.5, glow.replace(/[\d.]+\)$/, '0.12)'));
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.beginPath();
            ctx.fillStyle = glowGrad;
            ctx.arc(p.x, p.y, radius * 3 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Orbiting ring particles
            for (var r = 0; r < 4; r++) {
                var ringAngle = rotation + r * (Math.PI / 2);
                var rx = p.x + Math.cos(ringAngle) * (radius * 1.8);
                var ry = p.y + Math.sin(ringAngle) * (radius * 1.8);
                ctx.beginPath();
                ctx.fillStyle = ringColor;
                ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Core orb with gradient
            var coreGrad = ctx.createRadialGradient(p.x - radius * 0.2, p.y - radius * 0.2, 0, p.x, p.y, radius * pulse);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.3, core);
            coreGrad.addColorStop(1, core);
            ctx.beginPath();
            ctx.fillStyle = coreGrad;
            ctx.arc(p.x, p.y, radius * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Shine highlight
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.arc(p.x - radius * 0.25, p.y - radius * 0.25, radius * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // Length value text for bigger orbs
            if (value >= 2) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = 'bold ' + Math.max(9, radius * 0.9) + 'px Oxanium, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('+' + value, p.x, p.y);
            }
        }
        ctx.restore();
    };

    Renderer.prototype._drawBullets = function (bullets) {
        var ctx = this.ctx;
        var list = Array.isArray(bullets) ? bullets : [];
        if (!list.length) return;
        var nowMs = performance.now();

        ctx.save();
        for (var i = 0; i < list.length; i++) {
            var bullet = list[i];
            var bx = Number(bullet.x || 0);
            var by = Number(bullet.y || 0);
            var p = this.worldToScreen(bx, by);
            if (p.x < -60 || p.x > this.view.width + 60 || p.y < -60 || p.y > this.view.height + 60) continue;

            var dx = Number(bullet.dx || bullet.direction_x || 0);
            var dy = Number(bullet.dy || bullet.direction_y || 0);
            var mag = Math.sqrt(dx * dx + dy * dy) || 1;
            dx /= mag;
            dy /= mag;

            var pulse = 0.88 + Math.sin(nowMs * 0.01 + i * 1.7) * 0.12;
            var ownerColor = bullet.color || '#ffe58a';
            var angle = Math.atan2(dy, dx);

            // === Comet trail (long, fading) ===
            var trailLen = 7;
            for (var t = trailLen; t >= 1; t--) {
                var trailX = p.x - dx * t * 8;
                var trailY = p.y - dy * t * 8;
                var trailAlpha = (1 - t / trailLen) * 0.35;
                var trailR = (1 - t / trailLen) * 4.5 + 1;
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 230, 140, ' + trailAlpha.toFixed(3) + ')';
                ctx.arc(trailX, trailY, Math.max(0.8, trailR), 0, Math.PI * 2);
                ctx.fill();
            }

            // === Expanding energy ring ===
            var ringPhase = (nowMs * 0.004 + i * 2.3) % 1;
            var ringRadius = 8 + ringPhase * 22;
            var ringAlpha = (1 - ringPhase) * 0.25;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 220, 100, ' + ringAlpha.toFixed(3) + ')';
            ctx.lineWidth = 1.5 * (1 - ringPhase);
            ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Second staggered ring
            var ringPhase2 = (nowMs * 0.004 + i * 2.3 + 0.5) % 1;
            var ringRadius2 = 8 + ringPhase2 * 22;
            var ringAlpha2 = (1 - ringPhase2) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 200, 80, ' + ringAlpha2.toFixed(3) + ')';
            ctx.lineWidth = 1.2 * (1 - ringPhase2);
            ctx.arc(p.x, p.y, ringRadius2, 0, Math.PI * 2);
            ctx.stroke();

            // === Outer glow halo ===
            var glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22 * pulse);
            glowGrad.addColorStop(0, 'rgba(255, 245, 200, 0.45)');
            glowGrad.addColorStop(0.3, 'rgba(255, 210, 90, 0.2)');
            glowGrad.addColorStop(0.7, 'rgba(255, 180, 60, 0.06)');
            glowGrad.addColorStop(1, 'rgba(255, 180, 60, 0)');
            ctx.beginPath();
            ctx.fillStyle = glowGrad;
            ctx.arc(p.x, p.y, 22 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // === Core bullet — elongated comet shape ===
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(angle);

            // Motion streak behind core
            var streakGrad = ctx.createLinearGradient(-18, 0, 8, 0);
            streakGrad.addColorStop(0, 'rgba(255, 230, 150, 0)');
            streakGrad.addColorStop(0.6, 'rgba(255, 230, 150, 0.2)');
            streakGrad.addColorStop(1, ownerColor);
            ctx.beginPath();
            ctx.ellipse(-3, 0, 14 * pulse, 3 * pulse, 0, 0, Math.PI * 2);
            ctx.fillStyle = streakGrad;
            ctx.fill();

            // Bright core ellipse
            ctx.beginPath();
            ctx.ellipse(0, 0, 8 * pulse, 4 * pulse, 0, 0, Math.PI * 2);
            ctx.fillStyle = ownerColor;
            ctx.fill();

            // Hot white center
            ctx.beginPath();
            ctx.ellipse(1.5, -0.5, 4 * pulse, 2 * pulse, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fill();

            ctx.restore();

            // === Orbiting spark particles ===
            for (var s = 0; s < 5; s++) {
                var sparkAngle = (nowMs * 0.006 + s * 1.26 + i * 0.7) % (Math.PI * 2);
                var sparkDist = 10 + Math.sin(nowMs * 0.012 + s * 1.3) * 5;
                var sx = p.x + Math.cos(sparkAngle) * sparkDist;
                var sy = p.y + Math.sin(sparkAngle) * sparkDist;
                var sparkBright = 0.35 + Math.sin(nowMs * 0.008 + s * 0.9) * 0.25;
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 230, 140, ' + sparkBright.toFixed(3) + ')';
                ctx.arc(sx, sy, 1.3 + Math.sin(nowMs * 0.01 + s) * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    // Pattern definitions for snake skins
    var SNAKE_PATTERNS = {
        solid: function () { return null; },
        stripes: function (ctx, color, length) {
            var pat = document.createElement('canvas');
            pat.width = 20; pat.height = 20;
            var pc = pat.getContext('2d');
            pc.fillStyle = color;
            pc.fillRect(0, 0, 20, 20);
            pc.fillStyle = 'rgba(255,255,255,0.25)';
            for (var s = -20; s < 40; s += 8) {
                pc.fillRect(s, 0, 4, 20);
            }
            return ctx.createPattern(pat, 'repeat');
        },
        scales: function (ctx, color) {
            var pat = document.createElement('canvas');
            pat.width = 16; pat.height = 16;
            var pc = pat.getContext('2d');
            pc.fillStyle = color;
            pc.fillRect(0, 0, 16, 16);
            pc.strokeStyle = 'rgba(255,255,255,0.2)';
            pc.lineWidth = 1;
            pc.beginPath(); pc.arc(4, 4, 5, 0, Math.PI * 2); pc.stroke();
            pc.beginPath(); pc.arc(12, 12, 5, 0, Math.PI * 2); pc.stroke();
            return ctx.createPattern(pat, 'repeat');
        },
        neon: function (ctx, color) {
            var pat = document.createElement('canvas');
            pat.width = 8; pat.height = 8;
            var pc = pat.getContext('2d');
            pc.fillStyle = '#000';
            pc.fillRect(0, 0, 8, 8);
            pc.strokeStyle = color;
            pc.lineWidth = 2;
            pc.strokeRect(1, 1, 6, 6);
            return ctx.createPattern(pat, 'repeat');
        },
        lava: function (ctx) {
            var pat = document.createElement('canvas');
            pat.width = 20; pat.height = 20;
            var pc = pat.getContext('2d');
            var g = pc.createLinearGradient(0, 0, 20, 20);
            g.addColorStop(0, '#ff4500');
            g.addColorStop(0.4, '#ff8c00');
            g.addColorStop(0.7, '#ff4500');
            g.addColorStop(1, '#8b0000');
            pc.fillStyle = g;
            pc.fillRect(0, 0, 20, 20);
            pc.fillStyle = 'rgba(255,255,0,0.3)';
            pc.beginPath(); pc.arc(6, 10, 3, 0, Math.PI * 2); pc.fill();
            pc.beginPath(); pc.arc(14, 5, 2, 0, Math.PI * 2); pc.fill();
            return ctx.createPattern(pat, 'repeat');
        },
        ice: function (ctx) {
            var pat = document.createElement('canvas');
            pat.width = 16; pat.height = 16;
            var pc = pat.getContext('2d');
            var g = pc.createLinearGradient(0, 0, 16, 16);
            g.addColorStop(0, '#a8d8ea');
            g.addColorStop(0.5, '#e0f7fa');
            g.addColorStop(1, '#80deea');
            pc.fillStyle = g;
            pc.fillRect(0, 0, 16, 16);
            pc.fillStyle = 'rgba(255,255,255,0.5)';
            pc.fillRect(2, 2, 3, 1);
            pc.fillRect(10, 8, 4, 1);
            pc.fillRect(5, 13, 2, 1);
            return ctx.createPattern(pat, 'repeat');
        },
        galaxy: function (ctx) {
            var pat = document.createElement('canvas');
            pat.width = 24; pat.height = 24;
            var pc = pat.getContext('2d');
            var g = pc.createRadialGradient(12, 12, 0, 12, 12, 16);
            g.addColorStop(0, '#4a148c');
            g.addColorStop(0.5, '#1a237e');
            g.addColorStop(1, '#0d0030');
            pc.fillStyle = g;
            pc.fillRect(0, 0, 24, 24);
            pc.fillStyle = 'rgba(255,255,255,0.7)';
            pc.fillRect(4, 6, 1.5, 1.5);
            pc.fillRect(18, 3, 1, 1);
            pc.fillRect(10, 18, 1.5, 1.5);
            pc.fillRect(20, 15, 1, 1);
            pc.fillStyle = 'rgba(200, 150, 255, 0.4)';
            pc.beginPath(); pc.arc(12, 12, 5, 0, Math.PI * 2); pc.fill();
            return ctx.createPattern(pat, 'repeat');
        },
        toxic: function (ctx) {
            var pat = document.createElement('canvas');
            pat.width = 18; pat.height = 18;
            var pc = pat.getContext('2d');
            pc.fillStyle = '#1b5e20';
            pc.fillRect(0, 0, 18, 18);
            pc.fillStyle = '#76ff03';
            pc.beginPath(); pc.arc(5, 5, 3, 0, Math.PI * 2); pc.fill();
            pc.fillStyle = '#64dd17';
            pc.beginPath(); pc.arc(13, 13, 2.5, 0, Math.PI * 2); pc.fill();
            pc.fillStyle = 'rgba(200, 255, 0, 0.2)';
            pc.fillRect(0, 0, 18, 18);
            return ctx.createPattern(pat, 'repeat');
        }
    };

    Renderer.prototype._getBodyPoints = function (player) {
        if (!player || !Array.isArray(player.body) || !player.body.length) {
            if (player && player.head) return [player.head];
            return [];
        }
        return player.body;
    };

    // Smooth all body segment positions for a player
    Renderer.prototype._getSmoothedBody = function (player) {
        var raw = this._getBodyPoints(player);
        if (!raw.length) return raw;

        var key = player.id || 'anon';
        var cached = this.smoothedBodies[key];
        var bodyLerp = 0.25; // how quickly body catches up (lower = smoother)

        if (!cached || cached.length !== raw.length) {
            // Initialize or reset on length change
            this.smoothedBodies[key] = raw.map(function (pt) {
                return { x: pt.x, y: pt.y };
            });
            return this.smoothedBodies[key];
        }

        for (var i = 0; i < raw.length; i++) {
            cached[i].x = lerp(cached[i].x, raw[i].x, bodyLerp);
            cached[i].y = lerp(cached[i].y, raw[i].y, bodyLerp);
        }
        return cached;
    };

    // Catmull-Rom spline through body points for smooth curves
    Renderer.prototype._drawSmoothBodyPath = function (ctx, body) {
        if (body.length < 2) return;

        var points = [];
        for (var i = 0; i < body.length; i++) {
            points.push(this.worldToScreen(body[i].x, body[i].y));
        }

        if (points.length === 2) {
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            return;
        }

        // Move to first point
        ctx.moveTo(points[0].x, points[0].y);

        // Use Catmull-Rom splines converted to cubic beziers
        for (var j = 0; j < points.length - 1; j++) {
            var p0 = points[Math.max(0, j - 1)];
            var p1 = points[j];
            var p2 = points[Math.min(points.length - 1, j + 1)];
            var p3 = points[Math.min(points.length - 1, j + 2)];

            // Catmull-Rom to cubic bezier control points
            var tension = 0.35;
            var cp1x = p1.x + (p2.x - p0.x) * tension;
            var cp1y = p1.y + (p2.y - p0.y) * tension;
            var cp2x = p2.x - (p3.x - p1.x) * tension;
            var cp2y = p2.y - (p3.y - p1.y) * tension;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
    };

    Renderer.prototype._drawSlither = function (player, localId) {
        if (!player || !player.head) return;

        var ctx = this.ctx;
        var body = this._getSmoothedBody(player);
        if (!body.length) return;

        var color = player.color || '#7ad0ff';
        var isLocal = player.id === localId;
        var isAlive = player.status === 'alive';
        var alpha = isAlive ? 1 : 0.4;
        var snakeLength = Number(player.length || body.length || 1);

        // Determine pattern to use
        var patternName = 'solid';
        if (isLocal && window.SlitherRush && window.SlitherRush._selectedPattern) {
            patternName = window.SlitherRush._selectedPattern;
        }

        ctx.save();
        ctx.globalAlpha = alpha;

        if (body.length > 1) {
            // Draw body segments with thickness based on snake length
            var baseWidth = 18 + Math.min(12, snakeLength * 0.3);

            ctx.beginPath();
            this._drawSmoothBodyPath(ctx, body);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = baseWidth;

            // Apply pattern or solid color
            var patternFn = SNAKE_PATTERNS[patternName];
            var pattern = patternFn ? patternFn(ctx, color, snakeLength) : null;
            ctx.strokeStyle = pattern || color;
            ctx.stroke();

            // Pattern overlay shimmer for non-solid
            if (patternName !== 'solid') {
                ctx.lineWidth = baseWidth - 2;
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.stroke();
            }

            // Highlight spine
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.stroke();

            // Segment markers for length > 10
            if (snakeLength > 10) {
                for (var seg = 0; seg < body.length; seg += 5) {
                    var sp = this.worldToScreen(body[seg].x, body[seg].y);
                    ctx.beginPath();
                    ctx.fillStyle = 'rgba(255,255,255,0.12)';
                    ctx.arc(sp.x, sp.y, baseWidth * 0.55, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        var headKey = player.id || ('anon-' + Math.random());
        var smooth = this.smoothedHeads[headKey];
        if (!smooth) {
            smooth = { x: player.head.x, y: player.head.y };
            this.smoothedHeads[headKey] = smooth;
        }
        smooth.x = lerp(smooth.x, player.head.x, 0.22);
        smooth.y = lerp(smooth.y, player.head.y, 0.22);

        var head = this.worldToScreen(smooth.x, smooth.y);
        var headRadius = 12 + Math.min(6, snakeLength * 0.15);

        // Head glow
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.26)';
        ctx.arc(head.x, head.y, headRadius + 8, 0, Math.PI * 2);
        ctx.fill();

        // Head fill with gradient
        var headGrad = ctx.createRadialGradient(head.x - 2, head.y - 2, 0, head.x, head.y, headRadius);
        headGrad.addColorStop(0, '#ffffff');
        headGrad.addColorStop(0.35, color);
        headGrad.addColorStop(1, color);
        ctx.beginPath();
        ctx.fillStyle = headGrad;
        ctx.arc(head.x, head.y, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eyes on the head
        var dir = { x: 1, y: 0 };
        if (body.length > 1) {
            var b1 = body[0], b2 = body[1];
            var edx = b1.x - b2.x, edy = b1.y - b2.y;
            var emag = Math.sqrt(edx * edx + edy * edy) || 1;
            dir = { x: edx / emag, y: edy / emag };
        }
        var perpX = -dir.y, perpY = dir.x;
        var eyeOff = headRadius * 0.45;
        var eyeSize = headRadius * 0.28;
        // Left eye
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(head.x + perpX * eyeOff + dir.x * eyeOff * 0.5, head.y + perpY * eyeOff + dir.y * eyeOff * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#111';
        ctx.arc(head.x + perpX * eyeOff + dir.x * eyeOff * 0.8, head.y + perpY * eyeOff + dir.y * eyeOff * 0.8, eyeSize * 0.55, 0, Math.PI * 2);
        ctx.fill();
        // Right eye
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(head.x - perpX * eyeOff + dir.x * eyeOff * 0.5, head.y - perpY * eyeOff + dir.y * eyeOff * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#111';
        ctx.arc(head.x - perpX * eyeOff + dir.x * eyeOff * 0.8, head.y - perpY * eyeOff + dir.y * eyeOff * 0.8, eyeSize * 0.55, 0, Math.PI * 2);
        ctx.fill();

        if (player.boost_active) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 214, 70, 0.95)';
            ctx.lineWidth = 3;
            ctx.arc(head.x, head.y, headRadius + 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (isLocal) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 236, 182, 0.95)';
            ctx.lineWidth = 2.5;
            ctx.arc(head.x, head.y, headRadius + 12, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Name + length indicator
        ctx.fillStyle = 'rgba(255, 241, 198, 0.94)';
        ctx.font = '13px Oxanium, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.username || 'Player', head.x, head.y - headRadius - 14);

        if (snakeLength > 1) {
            ctx.fillStyle = 'rgba(255, 180, 80, 0.85)';
            ctx.font = '11px Oxanium, sans-serif';
            ctx.fillText('L' + snakeLength, head.x, head.y - headRadius - 3);
        }

        ctx.restore();
    };

    // Head-to-body collision detection (slither.io style)
    Renderer.prototype.checkHeadCollisions = function (state) {
        if (!state) return null;
        var players = Array.isArray(state.players) ? state.players : [];
        var selfId = state.self_id;
        var self = null;

        for (var i = 0; i < players.length; i++) {
            if (players[i].id === selfId && players[i].status === 'alive') {
                self = players[i];
                break;
            }
        }
        if (!self || !self.head) return null;

        var hx = self.head.x;
        var hy = self.head.y;
        var snakeLength = Number(self.length || 1);
        var headRadius = 12 + Math.min(6, snakeLength * 0.15);
        var collisionDist = headRadius + 9; // head radius + body half-width

        for (var j = 0; j < players.length; j++) {
            var other = players[j];
            if (other.id === selfId) continue; // skip self
            if (other.status !== 'alive') continue;
            if (!Array.isArray(other.body) || other.body.length < 2) continue;

            for (var k = 0; k < other.body.length; k++) {
                var seg = other.body[k];
                var dx = hx - seg.x;
                var dy = hy - seg.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < collisionDist) {
                    return { killedBy: other.id, killerName: other.username || 'Player' };
                }
            }
        }
        return null;
    };

    Renderer.prototype.renderBoot = function (context) {
        var info = context || {};
        var statusText = String(info.statusText || 'Connecting to arena...');
        var detailText = String(info.detailText || 'Waiting for live state from server');
        var now = performance.now() / 1000;

        // Keep camera near center so bounds still read naturally while booting.
        this.camera.x = lerp(this.camera.x, 2400, 0.08);
        this.camera.y = lerp(this.camera.y, 1500, 0.08);

        var ctx = this.ctx;
        ctx.setTransform(this.view.dpr, 0, 0, this.view.dpr, 0, 0);
        ctx.clearRect(0, 0, this.view.width, this.view.height);

        this._drawBackground();
        this._drawBounds({ width: 4800, height: 3000 });

        var cx = this.view.width * 0.5 + Math.cos(now * 0.85) * 58;
        var cy = this.view.height * 0.58 + Math.sin(now * 1.05) * 38;
        var body = [];
        for (var i = 0; i < 24; i += 1) {
            var bend = now * 4.2 - (i * 0.42);
            body.push({
                x: cx - (i * 11.5) + (Math.sin(bend) * 8),
                y: cy + (Math.cos(bend * 0.92) * 7)
            });
        }

        ctx.save();
        ctx.beginPath();
        for (var j = 0; j < body.length; j += 1) {
            var p = body[j];
            if (j === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 18;
        ctx.strokeStyle = '#ffd35c';
        ctx.stroke();

        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
        ctx.stroke();

        var head = body[0];
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.24)';
        ctx.arc(head.x, head.y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = '#ffb457';
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 236, 182, 0.95)';
        ctx.lineWidth = 2.5;
        ctx.arc(head.x, head.y, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        var panelW = Math.min(620, this.view.width - 40);
        var panelX = (this.view.width - panelW) / 2;
        var panelY = Math.max(18, this.view.height * 0.17);

        ctx.save();
        ctx.fillStyle = 'rgba(8, 10, 18, 0.72)';
        ctx.strokeStyle = 'rgba(255, 214, 70, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.fillRect(panelX, panelY, panelW, 92);
        ctx.strokeRect(panelX, panelY, panelW, 92);

        ctx.fillStyle = '#ffe9a8';
        ctx.font = '700 18px Oxanium, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(statusText, this.view.width / 2, panelY + 34);

        ctx.fillStyle = 'rgba(245, 230, 186, 0.92)';
        ctx.font = '500 14px Rajdhani, sans-serif';
        ctx.fillText(detailText, this.view.width / 2, panelY + 58);

        ctx.fillStyle = 'rgba(245, 230, 186, 0.78)';
        ctx.font = '500 13px Rajdhani, sans-serif';
        ctx.fillText('You can still move your pointer/WASD. Spawn starts as soon as state syncs.', this.view.width / 2, panelY + 78);
        ctx.restore();
    };

    Renderer.prototype.render = function (state, cameraTargetId) {
        if (!state) return;

        var bounds = state.bounds || { width: 4800, height: 3000 };
        var players = Array.isArray(state.players) ? state.players : [];
        var energyOrbs = Array.isArray(state.energy_orbs) ? state.energy_orbs : [];
        var bullets = Array.isArray(state.bullets) ? state.bullets : [];

        var cameraTarget = null;
        if (cameraTargetId) {
            cameraTarget = players.find(function (p) { return p.id === cameraTargetId && p.head; }) || null;
        }
        if (!cameraTarget) {
            cameraTarget = players.find(function (p) { return p.status === 'alive' && p.head; }) || null;
        }

        if (cameraTarget && cameraTarget.head) {
            this._updateCamera(bounds, cameraTarget.head);
        }

        var ctx = this.ctx;
        ctx.setTransform(this.view.dpr, 0, 0, this.view.dpr, 0, 0);
        ctx.clearRect(0, 0, this.view.width, this.view.height);

        this._drawBackground();
        this._drawBounds(bounds);
        this._drawEnergy(energyOrbs, performance.now());
        this._drawBullets(bullets);

        for (var i = 0; i < players.length; i++) {
            this._drawSlither(players[i], state.self_id);
        }
    };

    SlitherRush.Renderer = Renderer;
})(window);
