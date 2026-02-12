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
        // Social feature removed
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

        // ========== Ammo system ==========
        var MAX_AMMO = 6;
        var ammo = MAX_AMMO;
        var ammoRechargeRate = 1200; // ms per bullet recharge
        var lastAmmoRechargeAt = Date.now();
        var localDeath = false;
        var localDeathKiller = '';
        var localDeathTime = 0;
        var DEATH_REDIRECT_DELAY = 2500; // ms before redirecting after death
        var userClickedPlay = false; // gate: don't join/hide intro until user picks pattern & clicks play

        // ========== Growth Orbs (client-side) ==========
        var GROWTH_ORB_COUNT = 35;           // orbs active on map at any time
        var GROWTH_ORB_PICKUP_RADIUS = 28;   // how close head must be to collect
        var GROWTH_ORB_RESPAWN_MS = 3000;    // delay before a collected orb respawns
        var growthOrbs = [];                 // { x, y, value, alive, respawnAt }
        var localLengthBonus = 0;            // extra length from collected orbs
        var MAP_W = 4800, MAP_H = 3000;

        function spawnGrowthOrb() {
            var margin = 80;
            var value = Math.random() < 0.2 ? 2 : 1; // 20% chance for +2
            if (Math.random() < 0.05) value = 3;      // 5% chance for +3
            return {
                x: margin + Math.random() * (MAP_W - margin * 2),
                y: margin + Math.random() * (MAP_H - margin * 2),
                value: value,
                alive: true,
                respawnAt: 0
            };
        }

        // Initialize growth orbs
        for (var gi = 0; gi < GROWTH_ORB_COUNT; gi++) {
            growthOrbs.push(spawnGrowthOrb());
        }

        function tickGrowthOrbs(state, now) {
            if (!state) return;
            var players = Array.isArray(state.players) ? state.players : [];
            var self = players.find(function (p) { return p.id === state.self_id; }) || null;
            if (!self || !self.head || self.status !== 'alive') return;

            var hx = self.head.x;
            var hy = self.head.y;

            for (var i = 0; i < growthOrbs.length; i++) {
                var orb = growthOrbs[i];
                if (!orb.alive) {
                    // Respawn check
                    if (now >= orb.respawnAt) {
                        var fresh = spawnGrowthOrb();
                        orb.x = fresh.x;
                        orb.y = fresh.y;
                        orb.value = fresh.value;
                        orb.alive = true;
                    }
                    continue;
                }
                // Pickup check
                var dx = hx - orb.x;
                var dy = hy - orb.y;
                if (Math.sqrt(dx * dx + dy * dy) < GROWTH_ORB_PICKUP_RADIUS) {
                    localLengthBonus += orb.value;
                    orb.alive = false;
                    orb.respawnAt = now + GROWTH_ORB_RESPAWN_MS;
                }
            }
        }

        // ========== Pattern chooser ==========
        window.SlitherRush._selectedPattern = 'solid';
        var patternGrid = document.getElementById('srPatternGrid');
        if (patternGrid) {
            var patternOptions = patternGrid.querySelectorAll('.sr-pattern-option');
            patternOptions.forEach(function (opt) {
                opt.addEventListener('click', function () {
                    patternOptions.forEach(function (o) { o.classList.remove('selected'); });
                    opt.classList.add('selected');
                    window.SlitherRush._selectedPattern = opt.getAttribute('data-pattern') || 'solid';
                });
            });

            // Draw pattern previews
            _drawPatternPreviews();
        }

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
            if (!userClickedPlay) return; // don't hide until user has clicked Enter Arena
            introOverlay.classList.remove('active');
        }

        function openSocialPanel() {
            // Social feature removed
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
            // Ammo gate: only allow shooting if we have ammo
            if (payload && payload.shoot && ammo <= 0) {
                payload.shoot = false;
            }
            // Consume ammo when shooting
            if (payload && payload.shoot && ammo > 0) {
                ammo--;
                lastAmmoRechargeAt = Date.now();
            }

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
            userClickedPlay = true;
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
            if (userClickedPlay) {
                setStatus('Connected to ' + currentEndpointLabel() + ' • joining arena...');
            } else {
                setStatus('Connected • choose your pattern and click Enter Arena');
            }
        });

        client.on('joined', function (payload) {
            stateSeenAt = Date.now();
            if (userClickedPlay) {
                setStatus('Connected • live arena');
                hideIntroOverlay();
            }
            var target = profile.party_id || (payload && payload.arena_id) || '';
            setSocialActivity('slitherrush', target, 'In SLITHERRUSH FFA');
        });

        client.on('state', function (payload) {
            if (!payload) return;
            stateSeenAt = Date.now();
            var players = Array.isArray(payload.players) ? payload.players : [];
            var selfPlayer = players.find(function (p) { return p.id === payload.self_id; }) || null;
            if (userClickedPlay && selfPlayer && selfPlayer.status === 'alive') hideIntroOverlay();
            if (userClickedPlay) setStatus('Live arena • ' + players.length + ' players');
        });

        client.on('death', function (payload) {
            if (!payload) return;
            var state = client.getState();
            if (state && payload.player_id === state.self_id) {
                setStatus('You died! Redirecting...');
                localDeath = true;
                localDeathKiller = payload.killer_name || payload.killed_by || 'another snake';
                localDeathTime = Date.now();
                // Redirect to minigame page after delay
                setTimeout(function () {
                    window.location.href = 'mode-selection.html';
                }, DEATH_REDIRECT_DELAY);
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
            var now = Date.now();

            // Ammo recharge over time
            if (ammo < MAX_AMMO && now - lastAmmoRechargeAt >= ammoRechargeRate) {
                ammo = Math.min(MAX_AMMO, ammo + 1);
                lastAmmoRechargeAt = now;
            }

            if (!state) {
                if (userClickedPlay && client.isConnected() && now - lastJoinNudgeAt > 1200) {
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

            // Head-to-body collision check (slither.io style)
            if (!localDeath) {
                var collision = renderer.checkHeadCollisions(state);
                if (collision) {
                    localDeath = true;
                    localDeathKiller = collision.killerName || 'another snake';
                    localDeathTime = Date.now();
                    setStatus('You crashed into ' + localDeathKiller + '! Redirecting...');
                    // Notify server of death
                    client.sendInput({ death: true, killed_by: collision.killedBy });
                    // Redirect after delay
                    setTimeout(function () {
                        window.location.href = 'mode-selection.html';
                    }, DEATH_REDIRECT_DELAY);
                }
            }

            // Tick growth orb pickups
            tickGrowthOrbs(state, now);

            renderer.render(state, state.self_id, growthOrbs);
            ui.render(state, {
                spectatingName: '--',
                respawnInSeconds: 0,
                results: client.getResults(),
                ammo: ammo,
                maxAmmo: MAX_AMMO,
                localDeath: localDeath,
                localDeathKiller: localDeathKiller,
                localLengthBonus: localLengthBonus
            });

            window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
    }

    // Pattern preview drawer
    function _drawPatternPreviews() {
        var patterns = {
            solid: function (ctx, w, h) {
                ctx.fillStyle = '#7ad0ff';
                ctx.fillRect(0, 0, w, h);
            },
            stripes: function (ctx, w, h) {
                ctx.fillStyle = '#7ad0ff';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                for (var x = 0; x < w; x += 8) ctx.fillRect(x, 0, 4, h);
            },
            scales: function (ctx, w, h) {
                ctx.fillStyle = '#7ad0ff';
                ctx.fillRect(0, 0, w, h);
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                for (var y = 0; y < h; y += 10) {
                    for (var x = 0; x < w; x += 10) {
                        ctx.beginPath();
                        ctx.arc(x + (y % 20 === 0 ? 0 : 5), y, 5, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                }
            },
            neon: function (ctx, w, h) {
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, w, h);
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                for (var x = 0; x < w; x += 8) ctx.strokeRect(x, 0, 6, h);
            },
            lava: function (ctx, w, h) {
                var g = ctx.createLinearGradient(0, 0, w, h);
                g.addColorStop(0, '#ff4500');
                g.addColorStop(0.5, '#ff8c00');
                g.addColorStop(1, '#8b0000');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = 'rgba(255,255,0,0.3)';
                ctx.beginPath(); ctx.arc(w * 0.3, h * 0.5, 4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(w * 0.7, h * 0.3, 3, 0, Math.PI * 2); ctx.fill();
            },
            ice: function (ctx, w, h) {
                var g = ctx.createLinearGradient(0, 0, w, 0);
                g.addColorStop(0, '#a8d8ea');
                g.addColorStop(0.5, '#e0f7fa');
                g.addColorStop(1, '#80deea');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillRect(5, 8, 8, 2);
                ctx.fillRect(25, 15, 6, 2);
                ctx.fillRect(45, 5, 10, 2);
            },
            galaxy: function (ctx, w, h) {
                var g = ctx.createLinearGradient(0, 0, w, h);
                g.addColorStop(0, '#4a148c');
                g.addColorStop(0.5, '#1a237e');
                g.addColorStop(1, '#0d0030');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                for (var i = 0; i < 8; i++) {
                    ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
                }
                ctx.fillStyle = 'rgba(200, 150, 255, 0.3)';
                ctx.beginPath(); ctx.arc(w * 0.5, h * 0.5, 6, 0, Math.PI * 2); ctx.fill();
            },
            toxic: function (ctx, w, h) {
                ctx.fillStyle = '#1b5e20';
                ctx.fillRect(0, 0, w, h);
                ctx.fillStyle = '#76ff03';
                ctx.beginPath(); ctx.arc(w * 0.25, h * 0.5, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#64dd17';
                ctx.beginPath(); ctx.arc(w * 0.6, h * 0.3, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(w * 0.8, h * 0.7, 3.5, 0, Math.PI * 2); ctx.fill();
            }
        };

        Object.keys(patterns).forEach(function (name) {
            var canvasEl = document.getElementById('prev' + name.charAt(0).toUpperCase() + name.slice(1));
            if (!canvasEl) return;
            var rect = canvasEl.getBoundingClientRect();
            canvasEl.width = Math.max(60, rect.width || 60);
            canvasEl.height = Math.max(32, rect.height || 32);
            var pctx = canvasEl.getContext('2d');
            if (!pctx) return;
            pctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            // Round corners via clipping
            var r = 6;
            pctx.beginPath();
            pctx.moveTo(r, 0);
            pctx.lineTo(canvasEl.width - r, 0);
            pctx.quadraticCurveTo(canvasEl.width, 0, canvasEl.width, r);
            pctx.lineTo(canvasEl.width, canvasEl.height - r);
            pctx.quadraticCurveTo(canvasEl.width, canvasEl.height, canvasEl.width - r, canvasEl.height);
            pctx.lineTo(r, canvasEl.height);
            pctx.quadraticCurveTo(0, canvasEl.height, 0, canvasEl.height - r);
            pctx.lineTo(0, r);
            pctx.quadraticCurveTo(0, 0, r, 0);
            pctx.closePath();
            pctx.clip();
            patterns[name](pctx, canvasEl.width, canvasEl.height);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
