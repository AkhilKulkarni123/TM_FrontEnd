(function (window) {
    'use strict';

    var IS_LOCAL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    var SOCKET_URL = IS_LOCAL ? 'http://localhost:8306' : 'https://snakes.opencodingsociety.com';

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
                client.playAgain();
            }
        });

        client.on('joined', function (payload) {
            var status = document.getElementById('srConnectionStatus');
            if (status) {
                status.textContent = payload && payload.role === 'spectator'
                    ? 'Joined as spectator'
                    : 'Connected to arena';
            }
            var target = profile.party_id || (payload && payload.arena_id) || '';
            setSocialActivity('slitherrush', target, 'In SLITHERRUSH');
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

            ui.render(state, {
                spectatingName: spectatingName,
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
