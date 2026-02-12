(function (window) {
    'use strict';

    var SlitherRush = window.SlitherRush = window.SlitherRush || {};

    function clamp(v, lo, hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    function normalizeVector(x, y) {
        var mag = Math.sqrt((x * x) + (y * y));
        if (!mag) return { x: 0, y: 0 };
        return {
            x: x / mag,
            y: y / mag
        };
    }

    function Input(onChange) {
        this.onChange = typeof onChange === 'function' ? onChange : function () {};
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false,
            sprint: false
        };

        this.lastDirection = { x: 1, y: 0 };
        this.lastSent = null;
        this.spectateSwitchQueue = [];
        this.pointer = {
            active: false,
            x: 0,
            y: 0
        };
    }

    Input.prototype._setMovementKey = function (key, pressed) {
        if (key === 'w' || key === 'arrowup') this.keys.up = pressed;
        if (key === 's' || key === 'arrowdown') this.keys.down = pressed;
        if (key === 'a' || key === 'arrowleft') this.keys.left = pressed;
        if (key === 'd' || key === 'arrowright') this.keys.right = pressed;
    };

    Input.prototype._computeDirection = function () {
        if (this.pointer.active) {
            var centerX = window.innerWidth / 2;
            var centerY = window.innerHeight / 2;
            var dx = this.pointer.x - centerX;
            var dy = this.pointer.y - centerY;
            if (Math.abs(dx) + Math.abs(dy) > 8) {
                var pointerDir = normalizeVector(dx, dy);
                this.lastDirection = pointerDir;
                return pointerDir;
            }
        }

        var axisX = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0);
        var axisY = (this.keys.down ? 1 : 0) - (this.keys.up ? 1 : 0);

        if (axisX === 0 && axisY === 0) {
            return this.lastDirection;
        }

        var normalized = normalizeVector(axisX, axisY);
        this.lastDirection = normalized;
        return normalized;
    };

    Input.prototype._emitIfChanged = function () {
        var direction = this._computeDirection();
        var sprintMultiplier = this.keys.sprint ? 1.45 : 1;
        var payload = {
            direction: {
                x: clamp(Number((direction.x * sprintMultiplier).toFixed(4)), -2, 2),
                y: clamp(Number((direction.y * sprintMultiplier).toFixed(4)), -2, 2)
            },
            shoot: !!this.keys.shoot,
            sprint: !!this.keys.sprint,
            boost: !!this.keys.sprint,
            boosting: !!this.keys.sprint
        };

        var serialized = JSON.stringify(payload);
        if (serialized === this.lastSent) return;

        this.lastSent = serialized;
        this.onChange(payload);
    };

    Input.prototype.bind = function () {
        var self = this;

        window.addEventListener('keydown', function (event) {
            var key = String(event.key || '').toLowerCase();

            if (key === 'shift') {
                event.preventDefault();
                self.keys.sprint = true;
                self._emitIfChanged();
                return;
            }

            if (key === ' ') {
                event.preventDefault();
                self.keys.shoot = true;
                self._emitIfChanged();
                return;
            }

            if (key === 'q') {
                self.spectateSwitchQueue.push(-1);
                return;
            }

            if (key === 'e') {
                self.spectateSwitchQueue.push(1);
                return;
            }

            self._setMovementKey(key, true);
            self._emitIfChanged();
        });

        window.addEventListener('keyup', function (event) {
            var key = String(event.key || '').toLowerCase();

            if (key === 'shift') {
                event.preventDefault();
                self.keys.sprint = false;
                self._emitIfChanged();
                return;
            }

            if (key === ' ') {
                event.preventDefault();
                self.keys.shoot = false;
                self._emitIfChanged();
                return;
            }

            self._setMovementKey(key, false);
            self._emitIfChanged();
        });

        window.addEventListener('blur', function () {
            self.keys.up = false;
            self.keys.down = false;
            self.keys.left = false;
            self.keys.right = false;
            self.keys.shoot = false;
            self.keys.sprint = false;
            self.pointer.active = false;
            self._emitIfChanged();
        });

        window.addEventListener('mousemove', function (event) {
            self.pointer.active = true;
            self.pointer.x = Number(event.clientX || 0);
            self.pointer.y = Number(event.clientY || 0);
            self._emitIfChanged();
        });

        window.addEventListener('mouseleave', function () {
            self.pointer.active = false;
            self._emitIfChanged();
        });

        window.addEventListener('mousedown', function (event) {
            if (Number(event.button || 0) !== 0) return;
            self.keys.shoot = true;
            self.pointer.active = true;
            self.pointer.x = Number(event.clientX || self.pointer.x);
            self.pointer.y = Number(event.clientY || self.pointer.y);
            self._emitIfChanged();
        });

        window.addEventListener('mouseup', function (event) {
            if (Number(event.button || 0) !== 0) return;
            self.keys.shoot = false;
            self._emitIfChanged();
        });

        window.addEventListener('touchstart', function (event) {
            if (!event.touches || !event.touches.length) return;
            var touch = event.touches[0];
            self.pointer.active = true;
            self.pointer.x = Number(touch.clientX || 0);
            self.pointer.y = Number(touch.clientY || 0);
            self.keys.shoot = true;
            self._emitIfChanged();
        }, { passive: true });

        window.addEventListener('touchmove', function (event) {
            if (!event.touches || !event.touches.length) return;
            var touch = event.touches[0];
            self.pointer.active = true;
            self.pointer.x = Number(touch.clientX || 0);
            self.pointer.y = Number(touch.clientY || 0);
            self._emitIfChanged();
        }, { passive: true });

        window.addEventListener('touchend', function () {
            self.keys.shoot = false;
            self.pointer.active = false;
            self._emitIfChanged();
        }, { passive: true });

        this._emitIfChanged();
    };

    Input.prototype.consumeSpectateDelta = function () {
        if (!this.spectateSwitchQueue.length) return 0;
        return this.spectateSwitchQueue.shift();
    };

    SlitherRush.Input = Input;
})(window);
