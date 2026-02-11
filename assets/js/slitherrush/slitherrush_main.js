(function (window) {
    'use strict';

    var HOSTNAME = window.location.hostname || '';
    var IPV4_PRIVATE_RE = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;
    var BASE_FROM_GLOBAL = String(window.GAME_API_BASE || window.SNAKES_API_BASE || '').trim();
    var LOCAL_PORT_CANDIDATES = [8306, 8301, 8500];
    var REMOTE_DEFAULT_BASE = 'https://snakes.opencodingsociety.com';
    var IS_LOCAL = (
        HOSTNAME === 'localhost' ||
        HOSTNAME === '127.0.0.1' ||
        HOSTNAME === '::1' ||
        HOSTNAME === '0.0.0.0' ||
        IPV4_PRIVATE_RE.test(HOSTNAME) ||
        /\.local$/i.test(HOSTNAME)
    );

    function pushUnique(list, value) {
        if (!value) return;
        if (list.indexOf(value) >= 0) return;
        list.push(value);
    }

    function normalizeBaseUrl(raw) {
        if (!raw) return '';
        try {
            var url = new URL(String(raw), window.location.origin);
            return url.origin.replace(/\/+$/, '');
        } catch (error) {
            return '';
        }
    }

    function buildSocketCandidates() {
        var list = [];
        var configuredBase = normalizeBaseUrl(BASE_FROM_GLOBAL.replace(/\/api\/?$/i, ''));
        var originBase = normalizeBaseUrl(window.location.origin);
        var scheme = window.location.protocol || 'http:';
        var host = HOSTNAME || 'localhost';

        if (IS_LOCAL) {
            for (var i = 0; i < LOCAL_PORT_CANDIDATES.length; i += 1) {
                var port = LOCAL_PORT_CANDIDATES[i];
                pushUnique(list, scheme + '//' + host + ':' + port);
                if (host !== 'localhost') pushUnique(list, scheme + '//localhost:' + port);
            }
            pushUnique(list, configuredBase);
            pushUnique(list, originBase);
            pushUnique(list, REMOTE_DEFAULT_BASE);
            return list;
        }

        pushUnique(list, configuredBase);
        pushUnique(list, REMOTE_DEFAULT_BASE);
        pushUnique(list, originBase);
        return list;
    }

    var SOCKET_CANDIDATES = buildSocketCandidates();

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
        // Only trust explicit URL intent to avoid stale storage forcing players
        // into old arenas where they can get stuck spectating.
        var party = queryParty;
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
        var client = new window.SlitherRush.Client({ socketUrl: SOCKET_CANDIDATES[0] || '' });
        var renderer = new window.SlitherRush.Renderer(canvas);
        var ui = new window.SlitherRush.UI();
        var statusEl = document.getElementById('srConnectionStatus');
        var retryBtn = document.getElementById('srRetryBtn');
        var introOverlay = document.getElementById('srIntroOverlay');
        var introCloseBtn = document.getElementById('srIntroCloseBtn');
        var introPlayBtn = document.getElementById('srIntroPlayBtn');

        var lastInputPayload = null;
        var selectedSpectateId = null;
        var autoRespawnTimerId = null;
        var autoRespawnAt = 0;
        var spectatorRecoveryAt = 0;
        var spectatorRecoveryAttempts = 0;
        var joinedPayloadSeen = false;
        var endpointIndex = 0;
        var stateSeenAt = Date.now();
        var waitingForJoin = true;
        var selfMissingSince = 0;
        var connectAttempt = 0;
        var lastJoinNudgeAt = 0;

        function setStatus(text) {
            if (statusEl) statusEl.textContent = text;
        }

        function resetJoinTracking() {
            waitingForJoin = true;
            joinedPayloadSeen = false;
            stateSeenAt = Date.now();
            selfMissingSince = 0;
            lastJoinNudgeAt = 0;
        }

        function currentEndpointLabel() {
            var endpoint = SOCKET_CANDIDATES[endpointIndex] || '';
            try {
                var parsed = new URL(endpoint);
                return parsed.host || endpoint;
            } catch (error) {
                return endpoint || 'server';
            }
        }

        function tryNextEndpoint(reason) {
            if (endpointIndex >= SOCKET_CANDIDATES.length - 1) {
                var hostHint = currentEndpointLabel();
                setStatus('No arena state from ' + hostHint + '. Click Retry Spawn.');
                return false;
            }
            endpointIndex += 1;
            resetJoinTracking();
            connectAttempt += 1;
            setStatus('Reconnecting (' + connectAttempt + ') • ' + currentEndpointLabel());
            client.reconnect(SOCKET_CANDIDATES[endpointIndex], profile);
            client.requestJoin(profile, true);
            setSocialActivity('slitherrush', profile.party_id || '', 'Reconnecting...');
            return true;
        }

        function retrySpawn() {
            endpointIndex = 0;
            resetJoinTracking();
            connectAttempt += 1;
            setStatus('Retrying spawn (' + connectAttempt + ') • ' + currentEndpointLabel());
            client.reconnect(SOCKET_CANDIDATES[endpointIndex], profile);
            client.requestJoin(profile, true);
            setSocialActivity('slitherrush', profile.party_id || '', 'Reconnecting...');
        }

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

        function hideIntroOverlay() {
            if (!introOverlay) return;
            introOverlay.classList.remove('active');
        }

        function enterArenaNow() {
            hideIntroOverlay();
            spectatorRecoveryAttempts = 0;
            if (client.getState()) {
                client.playAgain();
            } else {
                retrySpawn();
            }
        }

        if (introCloseBtn) introCloseBtn.addEventListener('click', hideIntroOverlay);
        if (introPlayBtn) introPlayBtn.addEventListener('click', enterArenaNow);
        if (retryBtn) retryBtn.addEventListener('click', retrySpawn);
        if (introOverlay) {
            introOverlay.addEventListener('click', function (event) {
                if (event.target === introOverlay) hideIntroOverlay();
            });
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
                spectatorRecoveryAttempts = 0;
                client.playAgain();
            }
        });

        client.on('connected', function () {
            waitingForJoin = true;
            stateSeenAt = Date.now();
            lastJoinNudgeAt = 0;
            setStatus('Joining live arena... (' + currentEndpointLabel() + ')');
        });

        client.on('joined', function (payload) {
            joinedPayloadSeen = true;
            waitingForJoin = false;
            stateSeenAt = Date.now();
            var isSpectator = !!(payload && payload.role === 'spectator');
            setStatus(
                isSpectator
                    ? 'Connected • spectating'
                    : 'Connected • live arena'
            );
            if (isSpectator) client.playAgain();
            var target = profile.party_id || (payload && payload.arena_id) || '';
            setSocialActivity('slitherrush', target, 'In SLITHERRUSH');
        });

        client.on('state', function (payload) {
            if (!payload) return;
            stateSeenAt = Date.now();
            var players = Array.isArray(payload.players) ? payload.players : [];
            var selfPlayer = players.find(function (p) { return p.id === payload.self_id; }) || null;
            if (selfPlayer) waitingForJoin = false;
            if (selfPlayer && selfPlayer.status === 'alive') hideIntroOverlay();
            if (joinedPayloadSeen) return;

            if (selfPlayer && selfPlayer.status === 'alive') {
                setStatus('Connected • live arena');
            } else if (selfPlayer && selfPlayer.status === 'spectator') {
                setStatus('Connected • syncing player state');
            } else {
                setStatus('Connected • waiting for arena sync');
            }
        });

        client.on('connection_error', function () {
            setStatus('Connection issue... retrying');
            tryNextEndpoint('connection_error');
            setSocialActivity('slitherrush', profile.party_id || '', 'Reconnecting...');
        });

        connectAttempt = 1;
        stateSeenAt = Date.now();
        setStatus('Joining live arena... (' + currentEndpointLabel() + ')');
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
                var now = Date.now();
                if (client.isConnected() && now - lastJoinNudgeAt > 1200) {
                    client.requestJoin(profile);
                    lastJoinNudgeAt = now;
                }
                if (now - stateSeenAt > 2800) {
                    tryNextEndpoint('state_timeout');
                    stateSeenAt = now;
                }
                renderer.renderBoot({
                    statusText: statusEl ? statusEl.textContent : 'Joining live arena...',
                    detailText: client.isConnected()
                        ? (
                            waitingForJoin
                                ? ('Connected to ' + currentEndpointLabel() + ', requesting join...')
                                : ('Connected to ' + currentEndpointLabel() + ', waiting for arena snapshot')
                        )
                        : ('Connecting to ' + currentEndpointLabel())
                });
                window.requestAnimationFrame(frame);
                return;
            }

            var delta = input.consumeSpectateDelta();
            cycleSpectate(state, delta);

            var players = Array.isArray(state.players) ? state.players : [];
            var selfPlayer = players.find(function (p) { return p.id === state.self_id; }) || null;
            var isEliminated = !!(selfPlayer && selfPlayer.status === 'spectator' && state.state === 'active');
            var alivePlayers = getAlivePlayers(state);

            if (!selfPlayer) {
                if (!selfMissingSince) selfMissingSince = Date.now();
                if (Date.now() - selfMissingSince > 2500) {
                    if (!tryNextEndpoint('self_missing')) {
                        setStatus('Connected but self state is missing. Click Retry Spawn.');
                    }
                    selfMissingSince = Date.now();
                }
            } else {
                selfMissingSince = 0;
            }

            var shouldRecoverSpectator = (
                state.state === 'active' &&
                selfPlayer &&
                selfPlayer.status !== 'alive'
            );
            if (shouldRecoverSpectator) {
                if (!spectatorRecoveryAt) spectatorRecoveryAt = Date.now() + 300;
                if (Date.now() >= spectatorRecoveryAt && spectatorRecoveryAttempts < 8) {
                    spectatorRecoveryAttempts += 1;
                    spectatorRecoveryAt = Date.now() + 900;
                    client.playAgain();
                    setStatus(alivePlayers.length ? 'Joining active match...' : 'Syncing with live arena...');
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
