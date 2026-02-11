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

        this.camera.x = lerp(this.camera.x, targetX, 0.22);
        this.camera.y = lerp(this.camera.y, targetY, 0.22);
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
            if (p.x < -30 || p.x > this.view.width + 30 || p.y < -30 || p.y > this.view.height + 30) continue;

            var value = Math.max(1, Number(orb.value || 1));
            var radius = 4 + Math.min(7, value);
            var pulse = 1 + (Math.sin(pulseTime + (i * 0.2)) * 0.17);

            var core = '#ffd35c';
            var glow = 'rgba(255, 211, 92, 0.35)';
            if (value >= 4) {
                core = '#ff964f';
                glow = 'rgba(255, 150, 79, 0.34)';
            }

            ctx.beginPath();
            ctx.fillStyle = glow;
            ctx.arc(p.x, p.y, radius * 2.2 * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = core;
            ctx.arc(p.x, p.y, radius * pulse, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    Renderer.prototype._getBodyPoints = function (player) {
        if (!player || !Array.isArray(player.body) || !player.body.length) {
            if (player && player.head) return [player.head];
            return [];
        }
        return player.body;
    };

    Renderer.prototype._drawSlither = function (player, localId) {
        if (!player || !player.head) return;

        var ctx = this.ctx;
        var body = this._getBodyPoints(player);
        if (!body.length) return;

        var color = player.color || '#7ad0ff';
        var isLocal = player.id === localId;
        var isAlive = player.status === 'alive';
        var alpha = isAlive ? 1 : 0.4;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (body.length > 1) {
            ctx.beginPath();
            for (var i = 0; i < body.length; i++) {
                var screenPoint = this.worldToScreen(body[i].x, body[i].y);
                if (i === 0) ctx.moveTo(screenPoint.x, screenPoint.y);
                else ctx.lineTo(screenPoint.x, screenPoint.y);
            }
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 18;
            ctx.strokeStyle = color;
            ctx.stroke();

            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.stroke();
        }

        var headKey = player.id || ('anon-' + Math.random());
        var smooth = this.smoothedHeads[headKey];
        if (!smooth) {
            smooth = { x: player.head.x, y: player.head.y };
            this.smoothedHeads[headKey] = smooth;
        }
        smooth.x = lerp(smooth.x, player.head.x, 0.35);
        smooth.y = lerp(smooth.y, player.head.y, 0.35);

        var head = this.worldToScreen(smooth.x, smooth.y);

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,255,255,0.26)';
        ctx.arc(head.x, head.y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
        ctx.fill();

        if (player.boost_active) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 214, 70, 0.95)';
            ctx.lineWidth = 3;
            ctx.arc(head.x, head.y, 18, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (isLocal) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 236, 182, 0.95)';
            ctx.lineWidth = 2.5;
            ctx.arc(head.x, head.y, 24, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255, 241, 198, 0.94)';
        ctx.font = '13px Oxanium, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.username || 'Player', head.x, head.y - 22);

        ctx.restore();
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

        for (var i = 0; i < players.length; i++) {
            this._drawSlither(players[i], state.self_id);
        }
    };

    SlitherRush.Renderer = Renderer;
})(window);
