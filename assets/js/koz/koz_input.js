(function (window) {
    'use strict';

    var KOZ = window.KOZ = window.KOZ || {};

    function KOZInput(canvas, screenToWorld) {
        this.canvas = canvas;
        this.screenToWorld = typeof screenToWorld === 'function' ? screenToWorld : function (x, y) {
            return { x: x, y: y };
        };

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        this.aimScreen = { x: 0, y: 0 };
        this.aimWorld = { x: 0, y: 0 };

        this.shootQueued = false;
        this.touchActive = false;
    }

    KOZInput.prototype._setKey = function (key, value) {
        if (key === 'w' || key === 'arrowup') this.keys.up = value;
        if (key === 's' || key === 'arrowdown') this.keys.down = value;
        if (key === 'a' || key === 'arrowleft') this.keys.left = value;
        if (key === 'd' || key === 'arrowright') this.keys.right = value;
    };

    KOZInput.prototype._updateAim = function (clientX, clientY) {
        var rect = this.canvas.getBoundingClientRect();
        this.aimScreen.x = clientX - rect.left;
        this.aimScreen.y = clientY - rect.top;
        this.aimWorld = this.screenToWorld(this.aimScreen.x, this.aimScreen.y);
    };

    KOZInput.prototype.bind = function () {
        var self = this;

        window.addEventListener('keydown', function (event) {
            self._setKey(event.key.toLowerCase(), true);
            if (event.code === 'Space') {
                event.preventDefault();
                self.shootQueued = true;
            }
        });

        window.addEventListener('keyup', function (event) {
            self._setKey(event.key.toLowerCase(), false);
        });

        window.addEventListener('blur', function () {
            self.keys.up = false;
            self.keys.down = false;
            self.keys.left = false;
            self.keys.right = false;
            self.touchActive = false;
        });

        this.canvas.addEventListener('mousemove', function (event) {
            self._updateAim(event.clientX, event.clientY);
        });

        this.canvas.addEventListener('mousedown', function (event) {
            if (event.button !== 0) return;
            self._updateAim(event.clientX, event.clientY);
            self.shootQueued = true;
        });

        this.canvas.addEventListener('contextmenu', function (event) {
            event.preventDefault();
        });

        this.canvas.addEventListener('touchstart', function (event) {
            var touch = event.changedTouches && event.changedTouches[0];
            if (!touch) return;
            self.touchActive = true;
            self._updateAim(touch.clientX, touch.clientY);
            self.shootQueued = true;
            event.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', function (event) {
            var touch = event.changedTouches && event.changedTouches[0];
            if (!touch) return;
            self._updateAim(touch.clientX, touch.clientY);
            event.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', function () {
            self.touchActive = false;
        }, { passive: true });
    };

    KOZInput.prototype.getMovement = function () {
        return {
            up: this.keys.up,
            down: this.keys.down,
            left: this.keys.left,
            right: this.keys.right
        };
    };

    KOZInput.prototype.getAimWorld = function () {
        return {
            x: this.aimWorld.x,
            y: this.aimWorld.y
        };
    };

    KOZInput.prototype.consumeShoot = function () {
        if (!this.shootQueued) return null;
        this.shootQueued = false;
        return {
            x: this.aimWorld.x,
            y: this.aimWorld.y
        };
    };

    KOZ.Input = KOZInput;
})(window);
