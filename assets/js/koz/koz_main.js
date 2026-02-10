/*
 * KOZ bootstrap/orchestration module.
 * Responsibility:
 * - Detects local player profile (name, hero, weapon, avatar).
 * - Wires together KOZ client networking, renderer, input, and UI modules.
 * - Runs the frame loop that sends input, requests state, and renders each frame.
 * Fit in overall game:
 * - This is the entry point for King of Zone; other KOZ files expose focused services.
 */
(function (window) {
    'use strict';

    var IS_LOCAL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    var SOCKET_URL = IS_LOCAL ? 'http://localhost:8306' : 'https://snakes.opencodingsociety.com';

    // Defensive storage accessor (prevents mode failure when storage is unavailable).
    function safeGet(storage, key) {
        try {
            return storage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    // Choose a player name from guest/session data, then authenticated profile, then fallback.
    function detectPlayerName() {
        var name = safeGet(sessionStorage, 'snakes_guest_name') || safeGet(localStorage, 'snakes_guest_name');
        if (name) return name;

        try {
            var userData = JSON.parse(safeGet(localStorage, 'user_data') || safeGet(sessionStorage, 'user_data') || '{}');
            if (userData && userData.name) return userData.name;
            if (userData && userData.username) return userData.username;
        } catch (error) {
            // ignore malformed storage value
        }

        return 'Guest_' + Math.floor(Math.random() * 1000);
    }

    // Build the profile payload KOZ sends when joining lobby.
    function detectProfile() {
        var profile = {
            name: detectPlayerName(),
            hero: 'knight',
            weaponType: 'bulwark-disc',
            avatar: ''
        };

        if (window.SnakesLoadout) {
            profile.hero = window.SnakesLoadout.getSelectedHero();
            profile.weaponType = window.SnakesLoadout.getStoredWeaponType(profile.hero);
            profile.avatar = window.SnakesLoadout.getAvatarUrl() || window.SnakesLoadout.getAvatarData() || '';
        } else {
            profile.hero = (safeGet(sessionStorage, 'snakes_selected_character') || 'knight').toLowerCase();
            profile.weaponType = (safeGet(sessionStorage, 'snakes_selected_weapon') || 'bulwark-disc').toLowerCase();
            profile.avatar = safeGet(sessionStorage, 'snakes_avatar_url') || '';
        }

        return profile;
    }

    // Main app bootstrap: validate dependencies, initialize modules, and start loop.
    function boot() {
        if (!window.KOZ || !window.KOZ.Client || !window.KOZ.Input || !window.KOZ.Renderer || !window.KOZ.UI) {
            console.error('[KOZ] Modules not loaded.');
            return;
        }

        var canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('[KOZ] Missing #gameCanvas');
            return;
        }

        var profile = detectProfile();

        var renderer = new window.KOZ.Renderer(canvas);
        var client = new window.KOZ.Client({ socketUrl: SOCKET_URL });
        var ui = new window.KOZ.UI();
        var input = new window.KOZ.Input(canvas, function (sx, sy) {
            return renderer.screenToWorld(sx, sy);
        });
        var exitingToModes = false;

        function goToModeSelection() {
            if (exitingToModes) return;
            exitingToModes = true;
            window.location.href = './mode-selection.html';
        }

        input.bind();

        ui.bindActions({
            onPlayAgain: function () {
                client.playAgain();
                client.requestState();
            },
            onLeave: function () {
                client.leaveLobby();
                // Brief delay gives socket emit a chance to flush before page navigation.
                setTimeout(goToModeSelection, 80);
            },
            onBack: function () {
                goToModeSelection();
            }
        });

        client.on('connected', function () {
            client.joinLobby(profile);
            ui.lobbyText.textContent = 'Connected. Joining lobby...';
        });

        client.on('connection_error', function () {
            ui.lobbyText.textContent = 'Connection issue. Retrying...';
        });

        client.on('hit', function (payload) {
            renderer.notifyHit(payload, client.local);
            if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('hit');
            }
        });

        client.on('killfeed', function (entry) {
            ui.pushKillfeed(entry);
        });

        client.on('results', function (payload) {
            ui.handleResults(payload);
        });

        client.on('match_end', function () {
            if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('game-over');
            }
        });

        client.on('core_pickup', function (payload) {
            if (payload && payload.sid === client.selfId && window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('powerup');
            }
        });

        client.connect();

        var lastFrame = performance.now();
        var inputAccumulator = 0;
        var statePollAccumulator = 0;

        // Frame loop: local prediction + throttled network sends + render/UI updates.
        function frame(now) {
            var dt = Math.min(0.05, Math.max(0.001, (now - lastFrame) / 1000));
            lastFrame = now;

            var movement = input.getMovement();
            var aimWorld = input.getAimWorld();

            client.predictLocal(movement, dt);

            inputAccumulator += dt;
            // Send movement snapshots at fixed 30 Hz for stable bandwidth/latency behavior.
            while (inputAccumulator >= (1 / 30)) {
                client.sendInput(movement);
                inputAccumulator -= (1 / 30);
            }

            var queuedShot = input.consumeShoot();
            if (queuedShot && client.role !== 'spectator') {
                client.shoot(queuedShot.x, queuedShot.y);
                if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                    window.SnakesSFX.play('shoot');
                }
            }

            statePollAccumulator += dt;
            // Safety poll in case one-off network events are missed.
            if (statePollAccumulator >= 4) {
                client.requestState();
                statePollAccumulator = 0;
            }

            var renderState = client.getRenderState(now / 1000);
            renderer.render(renderState, dt, aimWorld);
            ui.render(renderState);

            window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
    }

    // Boot on DOM readiness so all KOZ canvas/UI elements exist.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
