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

    function shouldSkipSocketBase(base) {
        if (!base) return true;
        try {
            var host = new URL(base).hostname || '';
            return /github\.io$/i.test(host) || /githubusercontent\.com$/i.test(host);
        } catch (error) {
            return true;
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
            if (!shouldSkipSocketBase(configuredBase)) pushUnique(list, configuredBase);
            if (!shouldSkipSocketBase(originBase)) pushUnique(list, originBase);
            pushUnique(list, REMOTE_DEFAULT_BASE);
            return list;
        }

        if (!shouldSkipSocketBase(configuredBase)) pushUnique(list, configuredBase);
        pushUnique(list, REMOTE_DEFAULT_BASE);

        // Only trust current origin as a socket endpoint when this page is
        // already served from the game backend domain.
        if (/snakes\.opencodingsociety\.com$/i.test(HOSTNAME) && !shouldSkipSocketBase(originBase)) {
            pushUnique(list, originBase);
        }

        return list;
    }

    var SOCKET_CANDIDATES = buildSocketCandidates();
    if (!SOCKET_CANDIDATES.length) SOCKET_CANDIDATES = [REMOTE_DEFAULT_BASE];

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
        setSocialActivity('slitherrush', profile.party_id || '', 'Joining SLITHERRUSH FFA');

        var endpointIndex = 0;
        var client = new window.SlitherRush.Client({ socketUrl: SOCKET_CANDIDATES[endpointIndex] || REMOTE_DEFAULT_BASE });
        var renderer = new window.SlitherRush.Renderer(canvas);
        var ui = new window.SlitherRush.UI();

        var statusEl = document.getElementById('srConnectionStatus');
        var socialBtn = document.getElementById('srSocialBtn');
        var retryBtn = document.getElementById('srRetryBtn');
        var introOverlay = document.getElementById('srIntroOverlay');
        var introCloseBtn = document.getElementById('srIntroCloseBtn');
        var introPlayBtn = document.getElementById('srIntroPlayBtn');

        var lastInputPayload = null;
        var lastJoinNudgeAt = 0;
        var stateSeenAt = Date.now();
        var connectAttempt = 0;

        function setStatus(text) {
            if (statusEl) statusEl.textContent = text;
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

        function hideIntroOverlay() {
            if (!introOverlay) return;
            introOverlay.classList.remove('active');
        }

        function openSocialPanel() {
            if (!window.SnakesSocial || typeof window.SnakesSocial.openDrawer !== 'function') {
                setStatus('Social is still loading...');
                return;
            }
            var opened = window.SnakesSocial.openDrawer('party');
            if (!opened) setStatus('Sign in to use friends, party, and chat.');
        }

        function reconnectCurrent(reasonLabel) {
            connectAttempt += 1;
            stateSeenAt = Date.now();
            setStatus((reasonLabel || 'Retrying') + ' (' + connectAttempt + ') • ' + currentEndpointLabel());
            client.reconnect(SOCKET_CANDIDATES[endpointIndex], profile);
            client.requestJoin(profile, true);
            setSocialActivity('slitherrush', profile.party_id || '', 'Reconnecting...');
        }

        function tryNextEndpoint(reasonLabel) {
            if (endpointIndex >= SOCKET_CANDIDATES.length - 1) {
                return false;
            }
            endpointIndex += 1;
            reconnectCurrent(reasonLabel || 'Switching server');
            return true;
        }

        function retrySpawn() {
            if (client.isConnected()) {
                client.playAgain();
                client.requestJoin(profile, true);
                setStatus('Respawning in live arena...');
                return;
            }
            reconnectCurrent('Retrying spawn');
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

        function enterArenaNow() {
            hideIntroOverlay();
            retrySpawn();
        }

        if (introCloseBtn) introCloseBtn.addEventListener('click', hideIntroOverlay);
        if (introPlayBtn) introPlayBtn.addEventListener('click', enterArenaNow);
        if (socialBtn) socialBtn.addEventListener('click', openSocialPanel);
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
                client.playAgain();
            }
        });

        client.on('connected', function () {
            stateSeenAt = Date.now();
            lastJoinNudgeAt = 0;
            setStatus('Connected to ' + currentEndpointLabel() + ' • joining arena...');
        });

        client.on('joined', function (payload) {
            stateSeenAt = Date.now();
            setStatus('Connected • live arena');
            hideIntroOverlay();
            var target = profile.party_id || (payload && payload.arena_id) || '';
            setSocialActivity('slitherrush', target, 'In SLITHERRUSH FFA');
        });

        client.on('state', function (payload) {
            if (!payload) return;
            stateSeenAt = Date.now();
            var players = Array.isArray(payload.players) ? payload.players : [];
            var selfPlayer = players.find(function (p) { return p.id === payload.self_id; }) || null;
            if (selfPlayer && selfPlayer.status === 'alive') hideIntroOverlay();
            setStatus('Live arena • ' + players.length + ' players');
        });

        client.on('death', function (payload) {
            if (!payload) return;
            var state = client.getState();
            if (state && payload.player_id === state.self_id) {
                setStatus('You were hit • respawning...');
            }
        });

        client.on('connection_error', function () {
            setStatus('Connection issue on ' + currentEndpointLabel() + '...');
            if (!tryNextEndpoint('Switching server')) {
                setStatus('Unable to sync arena state. Click Retry Spawn.');
            }
            setSocialActivity('slitherrush', profile.party_id || '', 'Reconnecting...');
        });

        connectAttempt = 1;
        stateSeenAt = Date.now();
        setStatus('Joining live arena... (' + currentEndpointLabel() + ')');
        client.connect(profile);

        function frame() {
            var state = client.getState();
            if (!state) {
                var now = Date.now();

                if (client.isConnected() && now - lastJoinNudgeAt > 1200) {
                    client.requestJoin(profile);
                    lastJoinNudgeAt = now;
                }

                if (now - stateSeenAt > 4200) {
                    if (!tryNextEndpoint('Switching server')) {
                        setStatus('Waiting for arena state. Click Retry Spawn.');
                    }
                    stateSeenAt = now;
                }

                renderer.renderBoot({
                    statusText: statusEl ? statusEl.textContent : 'Joining live arena...',
                    detailText: client.isConnected()
                        ? ('Connected to ' + currentEndpointLabel() + ', waiting for state sync')
                        : ('Connecting to ' + currentEndpointLabel())
                });

                window.requestAnimationFrame(frame);
                return;
            }

            renderer.render(state, state.self_id);
            ui.render(state, {
                spectatingName: '--',
                respawnInSeconds: 0,
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
