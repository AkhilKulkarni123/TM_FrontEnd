(function (window) {
    'use strict';

    var KOZ = window.KOZ = window.KOZ || {};

    var HERO_SPEED = {
        knight: 312,
        wizard: 302,
        archer: 332,
        warrior: 296
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function distance(ax, ay, bx, by) {
        var dx = ax - bx;
        var dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function circleRectIntersects(cx, cy, radius, rect) {
        var nearestX = clamp(cx, rect.x, rect.x + rect.w);
        var nearestY = clamp(cy, rect.y, rect.y + rect.h);
        var dx = cx - nearestX;
        var dy = cy - nearestY;
        return (dx * dx + dy * dy) <= (radius * radius);
    }

    function normalizeHero(hero) {
        var key = String(hero || '').trim().toLowerCase();
        if (HERO_SPEED[key]) return key;
        return 'knight';
    }

    function Emitter() {
        this.handlers = {};
    }

    Emitter.prototype.on = function (eventName, handler) {
        if (!this.handlers[eventName]) this.handlers[eventName] = [];
        this.handlers[eventName].push(handler);
        return this;
    };

    Emitter.prototype.emit = function (eventName, payload) {
        var list = this.handlers[eventName] || [];
        list.forEach(function (handler) {
            try {
                handler(payload);
            } catch (error) {
                console.error('[KOZ] Event handler error for', eventName, error);
            }
        });
    };

    function KOZClient(options) {
        Emitter.call(this);

        options = options || {};
        this.socketUrl = options.socketUrl;

        this.socket = null;
        this.connected = false;

        this.selfId = null;
        this.role = 'spectator';

        this.profile = {
            name: 'Guest',
            avatar: '',
            hero: 'knight',
            weaponType: 'bulwark-disc'
        };

        this.map = { width: 4200, height: 2800 };
        this.match = {
            state: 'LOBBY',
            timeLeft: 0,
            countdown: 0,
            nextShrinkIn: 0,
            scoreTarget: 70,
            minPlayers: 4,
            activePlayers: 0
        };

        this.zone = { x: 2100, y: 1400, radius: 1260 };
        this.storm = { damage: 8, tickSeconds: 1.0 };
        this.core = { x: 2100, y: 1400, radius: 20, heldBy: null };

        this.obstacles = [];
        this.scoreboard = [];
        this.killfeed = [];
        this.lobby = {
            state: 'LOBBY',
            minPlayers: 4,
            activePlayers: 0,
            spectators: 0,
            countdown: 0,
            players: []
        };

        this.remoteHistory = {};
        this.remoteMeta = {};
        this.projectiles = {};
        this.powerups = {};

        this.local = {
            sid: null,
            hero: 'knight',
            weaponType: 'bulwark-disc',
            x: this.map.width / 2,
            y: this.map.height / 2,
            vx: 0,
            vy: 0,
            hp: 100,
            maxHp: 100,
            ammo: 3,
            alive: false,
            score: 0,
            kills: 0,
            deaths: 0,
            overclockMeter: 0,
            overclockActive: false,
            coreHolder: false,
            outside: false,
            name: 'Guest',
            avatar: ''
        };

        this.inputSeq = 0;
        this.lastServerAck = 0;
        this.interpolateDelay = 0.10;
    }

    KOZClient.prototype = Object.create(Emitter.prototype);
    KOZClient.prototype.constructor = KOZClient;

    KOZClient.prototype.connect = function () {
        var self = this;
        if (this.socket) return;

        this.socket = window.io(this.socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 20,
            reconnectionDelay: 500
        });

        this.socket.on('connect', function () {
            self.connected = true;
            self.selfId = self.socket.id;
            self.emit('connected', { sid: self.selfId });
        });

        this.socket.on('disconnect', function () {
            self.connected = false;
            self.emit('connection', { connected: false });
        });

        this.socket.on('connect_error', function (error) {
            self.emit('connection_error', error);
        });

        this.socket.on('koz:joined', function (payload) {
            self.selfId = payload.sid || self.selfId;
            self.role = payload.role || 'spectator';
            if (payload.map) self.map = payload.map;
            if (payload.minPlayers) self.match.minPlayers = payload.minPlayers;
            self.local.sid = self.selfId;
            self.emit('joined', payload);
        });

        this.socket.on('koz:lobby_update', function (payload) {
            self.lobby = payload || self.lobby;
            self.emit('lobby_update', self.lobby);
        });

        this.socket.on('koz:match_state', function (payload) {
            self.match = Object.assign({}, self.match, payload || {});
            self.emit('match_state', self.match);
        });

        this.socket.on('koz:countdown_start', function (payload) {
            if (payload && typeof payload.seconds !== 'undefined') {
                self.match.countdown = payload.seconds;
            }
            self.emit('countdown', payload || {});
        });

        this.socket.on('koz:countdown_cancelled', function (payload) {
            self.match.countdown = 0;
            self.emit('countdown_cancelled', payload || {});
        });

        this.socket.on('koz:state', function (snapshot) {
            self._applySnapshot(snapshot || {});
        });

        this.socket.on('koz:projectile_spawn', function (payload) {
            var list = payload && payload.projectiles ? payload.projectiles : [];
            list.forEach(function (projectile) {
                if (!projectile || !projectile.id) return;
                self.projectiles[projectile.id] = projectile;
            });
        });

        this.socket.on('koz:powerup_spawn', function (payload) {
            if (!payload || !payload.id) return;
            self.powerups[payload.id] = payload;
            self.emit('powerup_spawn', payload);
        });

        this.socket.on('koz:powerup_picked', function (payload) {
            if (payload && payload.id) delete self.powerups[payload.id];
            self.emit('powerup_picked', payload || {});
        });

        this.socket.on('koz:hit', function (payload) {
            if (payload && payload.target === self.selfId && typeof payload.hp !== 'undefined') {
                self.local.hp = payload.hp;
            }
            self.emit('hit', payload || {});
        });

        this.socket.on('koz:player_died', function (payload) {
            self.emit('player_died', payload || {});
        });

        this.socket.on('koz:killfeed', function (payload) {
            self.killfeed.push(payload || {});
            if (self.killfeed.length > 12) self.killfeed = self.killfeed.slice(-12);
            self.emit('killfeed', payload || {});
        });

        this.socket.on('koz:overclock', function (payload) {
            self.emit('overclock', payload || {});
        });

        this.socket.on('koz:shot_rejected', function (payload) {
            self.emit('shot_rejected', payload || {});
        });

        this.socket.on('koz:match_end', function (payload) {
            self.emit('match_end', payload || {});
        });

        this.socket.on('koz:results', function (payload) {
            self.emit('results', payload || {});
        });

        this.socket.on('koz:core_pickup', function (payload) {
            self.emit('core_pickup', payload || {});
        });

        this.socket.on('koz:zone_event', function (payload) {
            self.emit('zone_event', payload || {});
        });
    };

    KOZClient.prototype.joinLobby = function (profile) {
        if (!this.socket) return;
        this.profile = Object.assign({}, this.profile, profile || {});
        this.local.hero = normalizeHero(this.profile.hero);
        this.local.weaponType = this.profile.weaponType || this.local.weaponType;
        this.local.name = this.profile.name || this.local.name;
        this.local.avatar = this.profile.avatar || this.local.avatar;

        this.socket.emit('koz:join_lobby', {
            name: this.profile.name,
            avatar: this.profile.avatar,
            hero: this.local.hero,
            weaponType: this.local.weaponType
        });
    };

    KOZClient.prototype.leaveLobby = function () {
        if (!this.socket) return;
        this.socket.emit('koz:leave_lobby', {});
    };

    KOZClient.prototype.playAgain = function () {
        if (!this.socket) return;
        this.socket.emit('koz:play_again', {});
    };

    KOZClient.prototype.requestState = function () {
        if (!this.socket) return;
        this.socket.emit('koz:request_state', {});
    };

    KOZClient.prototype.sendInput = function (inputState) {
        if (!this.socket || !this.connected) return;
        this.inputSeq += 1;
        this.socket.emit('koz:input', {
            seq: this.inputSeq,
            up: !!inputState.up,
            down: !!inputState.down,
            left: !!inputState.left,
            right: !!inputState.right
        });
    };

    KOZClient.prototype.shoot = function (aimX, aimY) {
        if (!this.socket || !this.connected) return;
        this.socket.emit('koz:shoot', {
            aimX: aimX,
            aimY: aimY
        });
    };

    KOZClient.prototype._applySnapshot = function (snapshot) {
        var self = this;
        if (!snapshot) return;

        if (snapshot.map) this.map = snapshot.map;
        if (snapshot.match) this.match = Object.assign({}, this.match, snapshot.match);
        if (snapshot.zone) this.zone = Object.assign({}, this.zone, snapshot.zone);
        if (snapshot.storm) this.storm = Object.assign({}, this.storm, snapshot.storm);
        if (snapshot.core) this.core = Object.assign({}, this.core, snapshot.core);

        this.obstacles = Array.isArray(snapshot.obstacles) ? snapshot.obstacles.slice() : this.obstacles;
        this.scoreboard = Array.isArray(snapshot.scoreboard) ? snapshot.scoreboard.slice() : this.scoreboard;
        this.killfeed = Array.isArray(snapshot.killfeed) ? snapshot.killfeed.slice() : this.killfeed;

        this.projectiles = {};
        (snapshot.projectiles || []).forEach(function (projectile) {
            if (projectile && projectile.id) self.projectiles[projectile.id] = projectile;
        });

        this.powerups = {};
        (snapshot.powerups || []).forEach(function (powerup) {
            if (powerup && powerup.id) self.powerups[powerup.id] = powerup;
        });

        var now = Number(snapshot.serverTime || 0);
        var liveSids = {};

        (snapshot.players || []).forEach(function (player) {
            if (!player || !player.sid) return;
            var sid = player.sid;
            liveSids[sid] = true;

            self.remoteMeta[sid] = {
                sid: sid,
                name: player.name,
                avatar: player.avatar || '',
                hero: player.hero,
                weaponType: player.weaponType,
                hp: player.hp,
                maxHp: player.maxHp,
                alive: !!player.alive,
                spectator: !!player.spectator,
                score: player.score,
                kills: player.kills,
                deaths: player.deaths,
                ammo: player.ammo,
                coreHolder: !!player.coreHolder,
                overclockMeter: Number(player.overclockMeter || 0),
                overclockActive: !!player.overclockActive,
                lastInputSeq: Number(player.lastInputSeq || 0)
            };

            if (sid === self.selfId) {
                self._reconcileSelf(player);
                return;
            }

            if (!self.remoteHistory[sid]) self.remoteHistory[sid] = [];
            self.remoteHistory[sid].push({
                t: now,
                x: Number(player.x || 0),
                y: Number(player.y || 0),
                vx: Number(player.vx || 0),
                vy: Number(player.vy || 0),
                hp: Number(player.hp || 0),
                alive: !!player.alive,
                coreHolder: !!player.coreHolder,
                overclockActive: !!player.overclockActive
            });

            if (self.remoteHistory[sid].length > 40) {
                self.remoteHistory[sid] = self.remoteHistory[sid].slice(-40);
            }
        });

        Object.keys(this.remoteHistory).forEach(function (sid) {
            if (!liveSids[sid]) {
                delete self.remoteHistory[sid];
                delete self.remoteMeta[sid];
            }
        });

        this.emit('snapshot', snapshot);
    };

    KOZClient.prototype._reconcileSelf = function (serverPlayer) {
        var sx = Number(serverPlayer.x || 0);
        var sy = Number(serverPlayer.y || 0);
        var svx = Number(serverPlayer.vx || 0);
        var svy = Number(serverPlayer.vy || 0);

        if (!this.local.sid) {
            this.local.x = sx;
            this.local.y = sy;
        }

        var errorDistance = distance(this.local.x, this.local.y, sx, sy);
        if (errorDistance > 110) {
            this.local.x = sx;
            this.local.y = sy;
            this.local.vx = svx;
            this.local.vy = svy;
        } else {
            this.local.x += (sx - this.local.x) * 0.24;
            this.local.y += (sy - this.local.y) * 0.24;
            this.local.vx += (svx - this.local.vx) * 0.34;
            this.local.vy += (svy - this.local.vy) * 0.34;
        }

        this.local.sid = serverPlayer.sid;
        this.local.name = serverPlayer.name || this.local.name;
        this.local.avatar = serverPlayer.avatar || this.local.avatar;
        this.local.hero = normalizeHero(serverPlayer.hero || this.local.hero);
        this.local.weaponType = serverPlayer.weaponType || this.local.weaponType;
        this.local.hp = Number(serverPlayer.hp || this.local.hp);
        this.local.maxHp = Number(serverPlayer.maxHp || this.local.maxHp);
        this.local.alive = !!serverPlayer.alive;
        this.local.score = Number(serverPlayer.score || 0);
        this.local.kills = Number(serverPlayer.kills || 0);
        this.local.deaths = Number(serverPlayer.deaths || 0);
        this.local.ammo = Number(serverPlayer.ammo || this.local.ammo);
        this.local.coreHolder = !!serverPlayer.coreHolder;
        this.local.overclockMeter = Number(serverPlayer.overclockMeter || 0);
        this.local.overclockActive = !!serverPlayer.overclockActive;

        this.lastServerAck = Number(serverPlayer.lastInputSeq || 0);
    };

    KOZClient.prototype._resolveLocalObstacleCollision = function () {
        var player = this.local;
        var radius = 22;

        player.x = clamp(player.x, radius, this.map.width - radius);
        player.y = clamp(player.y, radius, this.map.height - radius);

        for (var i = 0; i < this.obstacles.length; i++) {
            var wall = this.obstacles[i];
            if (!circleRectIntersects(player.x, player.y, radius, wall)) continue;

            var nearestX = clamp(player.x, wall.x, wall.x + wall.w);
            var nearestY = clamp(player.y, wall.y, wall.y + wall.h);
            var dx = player.x - nearestX;
            var dy = player.y - nearestY;

            if (Math.abs(dx) > Math.abs(dy)) {
                player.x = nearestX + (dx >= 0 ? radius : -radius);
                player.vx = 0;
            } else {
                player.y = nearestY + (dy >= 0 ? radius : -radius);
                player.vy = 0;
            }

            player.x = clamp(player.x, radius, this.map.width - radius);
            player.y = clamp(player.y, radius, this.map.height - radius);
        }
    };

    KOZClient.prototype.predictLocal = function (inputState, dt) {
        if (this.role === 'spectator') return;
        if (this.match.state !== 'ACTIVE') return;
        if (!this.local.alive) return;

        var axisX = (inputState.right ? 1 : 0) - (inputState.left ? 1 : 0);
        var axisY = (inputState.down ? 1 : 0) - (inputState.up ? 1 : 0);

        var mag = Math.sqrt(axisX * axisX + axisY * axisY);
        if (mag > 0) {
            axisX /= mag;
            axisY /= mag;
        }

        var speed = HERO_SPEED[this.local.hero] || 310;
        if (this.local.overclockActive) speed *= 1.2;

        var targetVx = axisX * speed;
        var targetVy = axisY * speed;

        var accel = Math.min(1, dt * 16);
        this.local.vx += (targetVx - this.local.vx) * accel;
        this.local.vy += (targetVy - this.local.vy) * accel;

        if (mag === 0) {
            var friction = Math.max(0, 1 - (10 * dt));
            this.local.vx *= friction;
            this.local.vy *= friction;
        }

        this.local.x += this.local.vx * dt;
        this.local.y += this.local.vy * dt;

        this._resolveLocalObstacleCollision();

        var dist = distance(this.local.x, this.local.y, this.zone.x, this.zone.y);
        this.local.outside = dist > this.zone.radius;
    };

    KOZClient.prototype.getRemotePlayers = function (renderTime) {
        var result = [];
        var self = this;

        Object.keys(this.remoteHistory).forEach(function (sid) {
            var history = self.remoteHistory[sid] || [];
            if (!history.length) return;

            var meta = self.remoteMeta[sid] || { sid: sid };
            var point = history[history.length - 1];

            for (var i = history.length - 1; i > 0; i--) {
                var newer = history[i];
                var older = history[i - 1];
                if (older.t <= renderTime && renderTime <= newer.t) {
                    var t = newer.t === older.t ? 1 : (renderTime - older.t) / (newer.t - older.t);
                    t = clamp(t, 0, 1);
                    point = {
                        x: older.x + (newer.x - older.x) * t,
                        y: older.y + (newer.y - older.y) * t,
                        vx: older.vx + (newer.vx - older.vx) * t,
                        vy: older.vy + (newer.vy - older.vy) * t,
                        hp: older.hp + (newer.hp - older.hp) * t,
                        alive: newer.alive,
                        coreHolder: newer.coreHolder,
                        overclockActive: newer.overclockActive
                    };
                    break;
                }
            }

            result.push(Object.assign({}, meta, point));
        });

        return result;
    };

    KOZClient.prototype.getRenderState = function (nowSeconds) {
        var renderTime = nowSeconds - this.interpolateDelay;
        var remote = this.getRemotePlayers(renderTime);

        return {
            connected: this.connected,
            selfId: this.selfId,
            role: this.role,
            profile: this.profile,
            map: this.map,
            match: this.match,
            lobby: this.lobby,
            zone: this.zone,
            storm: this.storm,
            core: this.core,
            obstacles: this.obstacles,
            projectiles: Object.values(this.projectiles),
            powerups: Object.values(this.powerups),
            scoreboard: this.scoreboard,
            killfeed: this.killfeed,
            localPlayer: this.local,
            remotePlayers: remote
        };
    };

    KOZ.Client = KOZClient;
})(window);
