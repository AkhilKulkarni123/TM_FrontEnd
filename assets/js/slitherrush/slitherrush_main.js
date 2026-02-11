(function (window) {
    'use strict';

    var HOSTNAME = window.location.hostname || '';
    var IPV4_PRIVATE_RE = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
    var BASE_FROM_GLOBAL = String(window.GAME_API_BASE || window.SNAKES_API_BASE || '').trim();
    var IS_LOCAL = (
        HOSTNAME === 'localhost' ||
        HOSTNAME === '127.0.0.1' ||
        HOSTNAME === '::1' ||
        HOSTNAME === '0.0.0.0' ||
        IPV4_PRIVATE_RE.test(HOSTNAME) ||
        /\.local$/i.test(HOSTNAME)
    );
    var SOCKET_URL = (function () {
        var configuredBase = BASE_FROM_GLOBAL.replace(/\/api\/?$/i, '');
        if (configuredBase) return configuredBase;
        if (IS_LOCAL) return window.location.protocol + '//' + HOSTNAME + ':8306';
        return 'https://snakes.opencodingsociety.com';
    })();

    function setSocialActivity(mode, target, label) {
        if (!window.SnakesSocial || typeof window.SnakesSocial.setActivity !== 'function') return;
        window.SnakesSocial.setActivity({
            mode: mode || '',
            target: target || '',
            label: label || ''
        });
    }

    function safeGet(storage, key) {
        try {
            return storage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function detectPartyId() {
        var queryParty = null;
        try {
            var params = new URLSearchParams(window.location.search || '');
            queryParty = params.get('party_id') || params.get('partyId') || params.get('party');
        } catch (error) {
            queryParty = null;
        }

        var storedParty =
            safeGet(sessionStorage, 'snakes_party_id') ||
            safeGet(sessionStorage, 'party_id') ||
            safeGet(sessionStorage, 'partyId') ||
            safeGet(localStorage, 'snakes_party_id') ||
            safeGet(localStorage, 'party_id') ||
            safeGet(localStorage, 'partyId');

        var party = queryParty || storedParty;
        if (!party) return null;
        party = String(party).trim();
        return party ? party.slice(0, 64) : null;
    }

    function detectProfile() {
        var name = safeGet(sessionStorage, 'snakes_guest_name') || safeGet(localStorage, 'snakes_guest_name');
        if (!name) {
            try {
                var userData = JSON.parse(safeGet(localStorage, 'user_data') || safeGet(sessionStorage, 'user_data') || '{}');
                name = userData.name || userData.username;
            } catch (error) {
                name = null;
            }
        }

        return {
            username: name || ('Guest_' + Math.floor(Math.random() * 1000)),
            character: (safeGet(sessionStorage, 'snakes_selected_character') || 'knight').toLowerCase(),
            avatar: safeGet(sessionStorage, 'snakes_avatar_url') || '',
            party_id: detectPartyId()
        };
    }

    function boot() {
        if (!window.SlitherRush || !window.SlitherRush.Client || !window.SlitherRush.Input || !window.SlitherRush.Renderer || !window.SlitherRush.UI) {
            console.error('[SLITHERRUSH] Required modules are missing.');
            return;
        }

        var canvas = document.getElementById('srCanvas');
        if (!canvas) {
            console.error('[SLITHERRUSH] Missing #srCanvas');
            return;
        }

        var profile = detectProfile();
        setSocialActivity('slitherrush', profile.party_id || '', 'Joining SLITHERRUSH');
        var client = new window.SlitherRush.Client({ socketUrl: SOCKET_URL });
        var renderer = new window.SlitherRush.Renderer(canvas);
        var ui = new window.SlitherRush.UI();

        var lastInputPayload = null;
        var selectedSpectateId = null;
        var autoRespawnTimerId = null;
        var autoRespawnAt = 0;
        var spectatorRecoveryAt = 0;
        var spectatorRecoveryAttempts = 0;
        var joinedPayloadSeen = false;

        var input = new window.SlitherRush.Input(function (payload) {
            var serialized = JSON.stringify(payload || {});
            if (serialized === lastInputPayload) return;
            lastInputPayload = serialized;
            client.sendInput(payload);
        });
        input.bind();

        function goModeSelection() {
            setSocialActivity('arcade', '', 'Browsing Battle Arcade');
            window.location.href = 'mode-selection.html';
        }

        ui.bindActions({
            onLeave: function () {
                client.leave();
                setTimeout(goModeSelection, 80);
            },
            onBack: function () {
                goModeSelection();
            },
            onPlayAgain: function () {
                selectedSpectateId = null;
                autoRespawnAt = 0;
                if (autoRespawnTimerId) {
                    window.clearTimeout(autoRespawnTimerId);
                    autoRespawnTimerId = null;
                }
                client.playAgain();
            }
        });

        client.on('joined', function (payload) {
            joinedPayloadSeen = true;
            var status = document.getElementById('srConnectionStatus');
            if (status) {
                status.textContent = payload && payload.role === 'spectator'
                    ? 'Connected • spectating'
                    : 'Connected • live arena';
            }
            var target = profile.party_id || (payload && payload.arena_id) || '';
            setSocialActivity('slitherrush', target, 'In SLITHERRUSH');
        });

        client.on('state', function (payload) {
            if (joinedPayloadSeen || !payload) return;
            var players = Array.isArray(payload.players) ? payload.players : [];
            var selfPlayer = players.find(function (p) { return p.id === payload.self_id; }) || null;
            var status = document.getElementById('srConnectionStatus');
            if (!status) return;

            if (selfPlayer && selfPlayer.status === 'alive') {
                status.textContent = 'Connected • live arena';
            } else if (selfPlayer && selfPlayer.status === 'spectator') {
                status.textContent = 'Connected • syncing player state';
            } else {
                status.textContent = 'Connected • waiting for arena sync';
            }
        });

        client.on('connection_error', function () {
            var status = document.getElementById('srConnectionStatus');
            if (status) status.textContent = 'Connection issue... retrying';
            setSocialActivity('slitherrush', profile.party_id || '', 'Reconnecting...');
        });

        client.connect(profile);

        function getAlivePlayers(state) {
            var players = Array.isArray(state && state.players) ? state.players : [];
            return players.filter(function (p) {
                return p && p.status === 'alive' && p.head;
            });
        }

        function pickSpectateTarget(state, selfPlayer) {
            var alivePlayers = getAlivePlayers(state);
            if (!alivePlayers.length) {
                selectedSpectateId = null;
                return null;
            }

            if (selectedSpectateId) {
                var keep = alivePlayers.find(function (p) { return p.id === selectedSpectateId; });
                if (keep) return keep.id;
            }

            if (selfPlayer && selfPlayer.spectating) {
                var assigned = alivePlayers.find(function (p) { return p.id === selfPlayer.spectating; });
                if (assigned) {
                    selectedSpectateId = assigned.id;
                    return assigned.id;
                }
            }

            selectedSpectateId = alivePlayers[0].id;
            return selectedSpectateId;
        }

        function cycleSpectate(state, delta) {
            if (!delta) return;

            var alivePlayers = getAlivePlayers(state);
            if (alivePlayers.length <= 1) return;

            var currentIndex = alivePlayers.findIndex(function (p) { return p.id === selectedSpectateId; });
            if (currentIndex < 0) currentIndex = 0;

            var nextIndex = (currentIndex + delta + alivePlayers.length) % alivePlayers.length;
            selectedSpectateId = alivePlayers[nextIndex].id;
        }

        function frame() {
            var state = client.getState();
            if (!state) {
                window.requestAnimationFrame(frame);
                return;
            }

            var delta = input.consumeSpectateDelta();
            cycleSpectate(state, delta);

            var players = Array.isArray(state.players) ? state.players : [];
            var selfPlayer = players.find(function (p) { return p.id === state.self_id; }) || null;
            var isEliminated = !!(selfPlayer && selfPlayer.status === 'spectator' && state.state === 'active');
            var alivePlayers = getAlivePlayers(state);

            var shouldRecoverSpectator = (
                state.state === 'active' &&
                (!selfPlayer || selfPlayer.status !== 'alive') &&
                alivePlayers.length === 0
            );
            if (shouldRecoverSpectator) {
                if (!spectatorRecoveryAt) spectatorRecoveryAt = Date.now() + 300;
                if (Date.now() >= spectatorRecoveryAt && spectatorRecoveryAttempts < 6) {
                    spectatorRecoveryAttempts += 1;
                    spectatorRecoveryAt = Date.now() + 1000;
                    client.playAgain();

                    var status = document.getElementById('srConnectionStatus');
                    if (status) status.textContent = 'Syncing with live arena...';
                }
            } else {
                spectatorRecoveryAt = 0;
                spectatorRecoveryAttempts = 0;
            }

            var cameraTargetId = state.self_id;
            if (!selfPlayer || selfPlayer.status !== 'alive') {
                cameraTargetId = pickSpectateTarget(state, selfPlayer);
            }

            renderer.render(state, cameraTargetId);

            var spectatingName = '--';
            if (cameraTargetId) {
                var targetPlayer = players.find(function (p) { return p.id === cameraTargetId; });
                if (targetPlayer) spectatingName = targetPlayer.username || '--';
            }

            if (isEliminated && !autoRespawnTimerId) {
                autoRespawnAt = Date.now() + 1400;
                autoRespawnTimerId = window.setTimeout(function () {
                    autoRespawnTimerId = null;
                    autoRespawnAt = 0;
                    selectedSpectateId = null;
                    client.playAgain();
                }, 1400);
            } else if (!isEliminated && autoRespawnTimerId) {
                window.clearTimeout(autoRespawnTimerId);
                autoRespawnTimerId = null;
                autoRespawnAt = 0;
            }

            ui.render(state, {
                spectatingName: spectatingName,
                respawnInSeconds: autoRespawnAt ? Math.max(0, Math.ceil((autoRespawnAt - Date.now()) / 1000)) : 0,
                results: client.getResults()
            });

            window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
