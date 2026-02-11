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
        pctx.fillStyle = 'rgba(132, 202, 255, 0.07)';
        for (var y = 18; y < size; y += 34) {
            for (var x = 18; x < size; x += 34) {
                pctx.beginPath();
                pctx.arc(x, y, 1.35, 0, Math.PI * 2);
                pctx.fill();
            }
        }

        // Minimal diagonal hash accents.
        pctx.strokeStyle = 'rgba(140, 210, 255, 0.06)';
        pctx.lineWidth = 1;
        for (var i = -1; i < 7; i += 1) {
            var sx = i * 44;
            pctx.beginPath();
            pctx.moveTo(sx, 0);
            pctx.lineTo(sx + 54, 54);
            pctx.stroke();
        }

        pctx.strokeStyle = 'rgba(100, 170, 240, 0.05)';
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
        radial.addColorStop(0, '#0f2842');
        radial.addColorStop(0.42, '#091a2f');
        radial.addColorStop(1, '#040a17');
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
        ctx.strokeStyle = 'rgba(133, 206, 255, 0.09)';
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
            g.addColorStop(0, 'rgba(96, 195, 255, 0.16)');
            g.addColorStop(0.62, 'rgba(69, 140, 234, 0.06)');
            g.addColorStop(1, 'rgba(18, 39, 74, 0)');
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
        this.ctx.strokeStyle = 'rgba(122, 214, 255, 0.55)';
        this.ctx.lineWidth = 2.5;
        this.ctx.setLineDash([12, 9]);
        this.ctx.strokeRect(x, y, w, h);

        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'rgba(194, 239, 255, 0.2)';
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

            var core = '#86f8ff';
            var glow = 'rgba(134, 248, 255, 0.35)';
            if (value >= 4) {
                core = '#ffd576';
                glow = 'rgba(255, 213, 118, 0.35)';
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
            ctx.strokeStyle = 'rgba(255, 205, 108, 0.95)';
            ctx.lineWidth = 3;
            ctx.arc(head.x, head.y, 18, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (isLocal) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(240, 253, 255, 0.95)';
            ctx.lineWidth = 2.5;
            ctx.arc(head.x, head.y, 24, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(232, 248, 255, 0.92)';
        ctx.font = '13px Oxanium, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.username || 'Player', head.x, head.y - 22);

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
