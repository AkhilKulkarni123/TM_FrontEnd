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

        var gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, '#07111f');
        gradient.addColorStop(0.58, '#10243a');
        gradient.addColorStop(1, '#0b1728');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        var gridSize = 80;
        var startX = (-this.camera.x % gridSize + gridSize) % gridSize;
        var startY = (-this.camera.y % gridSize + gridSize) % gridSize;

        ctx.save();
        ctx.strokeStyle = 'rgba(130, 201, 255, 0.12)';
        ctx.lineWidth = 1;

        for (var x = startX; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (var y = startY; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        ctx.restore();
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
        this.ctx.strokeStyle = 'rgba(255, 122, 122, 0.78)';
        this.ctx.lineWidth = 4;
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
