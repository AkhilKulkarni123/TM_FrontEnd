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
            boost: false
        };

        this.lastDirection = { x: 1, y: 0 };
        this.lastSent = null;
        this.spectateSwitchQueue = [];
    }

    Input.prototype._setMovementKey = function (key, pressed) {
        if (key === 'w' || key === 'arrowup') this.keys.up = pressed;
        if (key === 's' || key === 'arrowdown') this.keys.down = pressed;
        if (key === 'a' || key === 'arrowleft') this.keys.left = pressed;
        if (key === 'd' || key === 'arrowright') this.keys.right = pressed;
    };

    Input.prototype._computeDirection = function () {
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
        var payload = {
            direction: {
                x: clamp(Number(direction.x.toFixed(4)), -1, 1),
                y: clamp(Number(direction.y.toFixed(4)), -1, 1)
            },
            boost: !!this.keys.boost
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
                self.keys.boost = true;
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
                self.keys.boost = false;
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
            self.keys.boost = false;
            self._emitIfChanged();
        });

        this._emitIfChanged();
    };

    Input.prototype.consumeSpectateDelta = function () {
        if (!this.spectateSwitchQueue.length) return 0;
        return this.spectateSwitchQueue.shift();
    };

    SlitherRush.Input = Input;
})(window);
