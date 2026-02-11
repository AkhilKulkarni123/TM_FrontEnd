(function (window) {
    'use strict';

    var SlitherRush = window.SlitherRush = window.SlitherRush || {};

    function Emitter() {
        this.handlers = {};
    }

    Emitter.prototype.on = function (eventName, handler) {
        if (!this.handlers[eventName]) this.handlers[eventName] = [];
        this.handlers[eventName].push(handler);
    };

    Emitter.prototype.emit = function (eventName, payload) {
        var listeners = this.handlers[eventName] || [];
        listeners.forEach(function (handler) {
            try {
                handler(payload);
            } catch (error) {
                console.error('[SLITHERRUSH] Listener error', eventName, error);
            }
        });
    };

    function Client(options) {
        Emitter.call(this);

        options = options || {};
        this.socketUrl = options.socketUrl || '';

        this.socket = null;
        this.connected = false;

        this.selfId = null;
        this.selfUserName = 'Guest';
        this.joinProfile = {};
        this.lastJoinSentAt = 0;

        this.state = null;
        this.death = null;
        this.results = null;
    }

    Client.prototype = Object.create(Emitter.prototype);
    Client.prototype.constructor = Client;

    Client.prototype._cloneJoinProfile = function (profile) {
        var src = profile || {};
        return {
            username: String(src.username || src.name || 'Guest'),
            avatar: String(src.avatar || ''),
            character: String(src.character || 'knight'),
            party_id: src.party_id ? String(src.party_id).slice(0, 64) : null
        };
    };

    Client.prototype._buildJoinPayload = function () {
        var profile = this.joinProfile || {};
        var payload = {
            username: String(profile.username || 'Guest'),
            avatar: profile.avatar || '',
            character: profile.character || 'knight'
        };
        if (profile.party_id) payload.party_id = profile.party_id;
        return payload;
    };

    Client.prototype.requestJoin = function (profile, force) {
        if (profile) {
            this.joinProfile = this._cloneJoinProfile(profile);
            this.selfUserName = this.joinProfile.username || 'Guest';
        } else if (!this.joinProfile || !this.joinProfile.username) {
            this.joinProfile = this._cloneJoinProfile({ username: this.selfUserName || 'Guest' });
        }

        if (!this.socket || !this.connected) return false;

        var now = Date.now();
        if (!force && now - this.lastJoinSentAt < 450) return false;

        this.lastJoinSentAt = now;
        this.socket.emit('slitherrush_join', this._buildJoinPayload());
        return true;
    };

    Client.prototype.connect = function (profile) {
        if (this.socket) return;

        var self = this;
        this.joinProfile = this._cloneJoinProfile(profile || {});
        this.selfUserName = this.joinProfile.username || 'Guest';
        this.lastJoinSentAt = 0;

        this.socket = window.io(this.socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 30,
            reconnectionDelay: 400
        });

        this.socket.on('connect', function () {
            self.connected = true;
            self.selfId = self.socket.id;
            self.requestJoin(null, true);
            self.emit('connected', { sid: self.selfId });
        });

        this.socket.on('disconnect', function () {
            self.connected = false;
            self.emit('disconnected', {});
        });

        this.socket.on('connect_error', function (error) {
            self.emit('connection_error', error);
        });

        this.socket.on('slitherrush_joined', function (payload) {
            if (payload && payload.player_id) {
                self.selfId = payload.player_id;
            }
            self.emit('joined', payload || {});
        });

        this.socket.on('slitherrush_state', function (payload) {
            self.state = payload || null;
            self.emit('state', self.state || {});
        });

        this.socket.on('slitherrush_death', function (payload) {
            self.death = payload || null;
            self.emit('death', payload || {});
        });

        this.socket.on('slitherrush_leaderboard_update', function (payload) {
            if (self.state && payload && Array.isArray(payload.leaderboard)) {
                self.state.leaderboard = payload.leaderboard;
            }
            self.emit('leaderboard', payload || {});
        });

        this.socket.on('slitherrush_end', function (payload) {
            self.results = payload || null;
            self.emit('end', payload || {});
        });
    };

    Client.prototype.disconnect = function () {
        if (!this.socket) {
            this.connected = false;
            return;
        }
        try {
            if (typeof this.socket.removeAllListeners === 'function') {
                this.socket.removeAllListeners();
            }
        } catch (error) {}

        try {
            this.socket.disconnect();
        } catch (error) {}

        this.socket = null;
        this.connected = false;
        this.state = null;
        this.death = null;
        this.results = null;
        this.selfId = null;
        this.lastJoinSentAt = 0;
    };

    Client.prototype.reconnect = function (socketUrl, profile) {
        if (socketUrl) this.socketUrl = String(socketUrl);
        this.disconnect();
        this.connect(profile || {});
    };

    Client.prototype.getSocketUrl = function () {
        return this.socketUrl;
    };

    Client.prototype.isConnected = function () {
        return !!(this.socket && this.connected);
    };

    Client.prototype.sendInput = function (payload) {
        if (!this.socket || !this.connected) return;
        this.socket.emit('slitherrush_input', payload || {});
    };

    Client.prototype.playAgain = function () {
        if (!this.socket || !this.connected) return;
        this.results = null;
        this.socket.emit('slitherrush_play_again', {});
    };

    Client.prototype.leave = function () {
        if (!this.socket || !this.connected) return;
        this.socket.emit('slitherrush_leave', {});
    };

    Client.prototype.getState = function () {
        return this.state;
    };

    Client.prototype.getResults = function () {
        return this.results;
    };

    SlitherRush.Client = Client;
})(window);
