/*
 * King of the Zone - Multiplayer capture mode (FFA)
 *
 * Integration guide:
 * 1) Add a mode card in `hacks/snakes/mode-selection.html` that links to `king-of-zone.html`.
 * 2) Ensure Socket.IO server exposes KOZ events (see `TM_Flask/socketio_handlers/boss_battle.py`).
 * 3) Include this script + `assets/js/snakes/sfx.js` in `king-of-zone.html`.
 */
(function () {
    'use strict';

    const IS_LOCAL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const GAME_API_BASE = IS_LOCAL ? 'http://localhost:8306' : 'https://snakes.opencodingsociety.com';
    const SOCKET_URL = GAME_API_BASE;

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const CHARACTER_ICONS = {
        knight: '🛡️',
        wizard: '🧙',
        archer: '🏹',
        warrior: '⚔️',
        default: '🙂'
    };

    const PLAYER_IMAGES = {
        knight: new Image(),
        wizard: new Image(),
        archer: new Image(),
        warrior: new Image()
    };

    Object.entries(PLAYER_IMAGES).forEach(([key, img]) => {
        img.src = `../../images/snakes/characters/${key}.png`;
    });

    const PLAYER_SPRITES = {
        knight: {
            colors: { m: '#c7cdd4', d: '#6b7785', b: '#2e5caa', r: '#b23b3b', s: '#f5cdaa', h: '#eef2f6', k: '#3b3b3b', y: '#f1c40f', o: '#4a4a4a' },
            pattern: [
                "........rrr.........",
                ".......rrrrr........",
                "......rmmhhmr.......",
                ".....rmmhhhhhmr.....",
                ".....mmhkkkkhmm.....",
                ".....mmhskkshmm.....",
                ".....mmhssssshm.....",
                ".....mmhbddbhmm.....",
                ".....bbbdddbbb......",
                "....bbbbbdbbbbb.....",
                "....bbbbbdbbbbb.....",
                "....bbbbbdbbbbb.....",
                "....bbybbdbybb......",
                ".....bbddddbb.......",
                ".....dd....dd.......",
                "....ddd....ddd......",
                "...ddddd..ddddd.....",
                "...ddddd..ddddd.....",
                "....dd......dd......",
                "...................."
            ]
        },
        wizard: {
            colors: { p: '#7d3c98', v: '#9b59b6', s: '#f5cdaa', g: '#f1c40f', b: '#4e342e', l: '#c39bd3', k: '#3b3b3b', t: '#a569bd', w: '#e6e6e6' },
            pattern: [
                "........ggg.........",
                ".......gpppg........",
                "......gpppppg.......",
                ".....gpppppppg......",
                ".....ppplppppp......",
                ".....pppskksp.......",
                ".....pppssssp.......",
                ".....ppvvvvlp.......",
                "....ppvvvvvvp.......",
                "....ppvvvvvvp.......",
                "....ppvv..vvp.......",
                "....wvvv..vvw.......",
                "....wwwwwwwww.......",
                "....vvv....vv.......",
                "....vv......vv......",
                "....vv..gg..vv......",
                "....vv..gg..vv......",
                "....vv......vv......",
                "...vvvv....vvvv.....",
                "...................."
            ]
        },
        archer: {
            colors: { g: '#2ecc71', d: '#1e9e5a', s: '#f5cdaa', b: '#8e6b3e', k: '#3d3d3d', l: '#7bdca3', t: '#2c3e50', q: '#9b7653', h: '#1b5e3a' },
            pattern: [
                "........hhhh........",
                ".......hggggh.......",
                "......hggggggh......",
                "......hggssggh......",
                "......hgskkggh......",
                "......hgsqqsgh......",
                "......hddddddh..q...",
                "......hddddddh..q...",
                "......hdd..ddh..q...",
                ".......dd..dd...q...",
                "......tdd..ddt..q...",
                "......tddddddt..q...",
                "......tdd..ddt..q...",
                ".......d....d.......",
                ".......d....d.......",
                ".......d....d.......",
                "......bb....bb......",
                ".....bbb....bbb.....",
                "....................",
                "...................."
            ]
        },
        warrior: {
            colors: { o: '#e67e22', d: '#b05b16', s: '#f5cdaa', k: '#5d6d7e', r: '#7f8c8d', h: '#f2a460', t: '#3b3b3b', a: '#95a5a6' },
            pattern: [
                "........oooo........",
                ".......oooooo.......",
                "......ooohhhoo......",
                "......oohkkhoo......",
                "......oohskkso......",
                "......oohssssso.....",
                "......odddddd..a....",
                "......odddddd..a....",
                "......odr..rdo.a....",
                ".......dr..rd..a....",
                "......tdr..rdt.a....",
                "......tddddddt.a....",
                "......tdd..ddt.a....",
                ".......d....d.......",
                ".......d....d.......",
                ".......d....d.......",
                "......rr....rr......",
                ".....rrr....rrr.....",
                "....................",
                "...................."
            ]
        }
    };

    const state = {
        connected: false,
        joined: false,
        offline: false,
        roomId: null,
        selfId: null,
        localId: null,
        map: { width: 2000, height: 1300 },
        rules: {
            targetScore: 180,
            timeLimit: 240,
            scorePerSec: 4,
            coreBonus: 2,
            stormMax: 100
        },
        storm: { level: 1, damage: 8, regen: 4 },
        player: {
            username: 'Player',
            character: 'knight',
            x: 600,
            y: 600,
            speed: 5.8,
            speedMultiplier: 1,
            zoneHp: 100,
            combatHp: 100,
            bullets: 60,
            outside: false,
            radius: 18,
            vx: 0,
            vy: 0
        },
        players: {},
        zone: { x: 900, y: 650, radius: 520, base_radius: 520, core_radius: 180 },
        teamScores: {},
        scoreLabels: {},
        controller: null,
        controllerName: null,
        contested: false,
        timeLeft: 0,
        round: 1,
        phase: 1,
        keys: {},
        mouse: { x: 0, y: 0, worldX: 0, worldY: 0, inCanvas: false },
        aimAngle: 0,
        targetAimAngle: 0,
        lastShotAt: 0,
        playerBullets: [],
        foreignBullets: [],
        camera: { x: 900, y: 650 },
        view: { width: canvas.clientWidth || 1100, height: canvas.clientHeight || 680, dpr: 1 },
        fx: { shake: 0, pulse: 0 }
    };

    const SHOT_COOLDOWN = 160;
    const BULLET_SPEED = 16;
    const BULLET_MAX_LIFE = 220;

    let socket = null;
    let lastMoveSentAt = 0;
    let lastFrameAt = 0;
    let zoneEventTimeout = null;
    let saveBulletsTimer = null;
    let offlineTimer = null;

    function playCue(name) {
        if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
            window.SnakesSFX.play(name);
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerpAngle(current, target, factor) {
        let diff = target - current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return current + diff * factor;
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.max(0, seconds % 60);
        return mins + ':' + String(secs).padStart(2, '0');
    }

    function resizeCanvas() {
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        state.view.width = width;
        state.view.height = height;
        state.view.dpr = dpr;
    }

    function setUI(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function showZoneEvent(message, tone) {
        const el = document.getElementById('zoneEvent');
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
        if (zoneEventTimeout) clearTimeout(zoneEventTimeout);
        zoneEventTimeout = setTimeout(() => {
            el.classList.remove('show');
        }, 2200);
        if (tone) playCue(tone);
    }

    function updateStormMeter() {
        const fill = document.getElementById('stormFill');
        const label = document.getElementById('stormValue');
        const pct = clamp((state.player.zoneHp / (state.rules.stormMax || 100)) * 100, 0, 100);
        if (fill) fill.style.width = pct.toFixed(0) + '%';
        if (label) label.textContent = pct.toFixed(0) + '%';
        const warning = document.getElementById('zoneWarning');
        if (warning) warning.classList.toggle('active', state.player.outside);
    }

    function scheduleBulletSave() {
        if (saveBulletsTimer) clearTimeout(saveBulletsTimer);
        saveBulletsTimer = setTimeout(() => {
            saveBulletsTimer = null;
            savePlayerBullets();
        }, 1000);
    }

    function savePlayerBullets() {
        if (!state.connected || !state.joined) return;
        if (isDemoMode()) return;
        fetch(GAME_API_BASE + '/api/snakes/', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total_bullets: Math.max(0, state.player.bullets) })
        }).catch(() => {});
    }

    function updateScoreboard() {
        const board = document.getElementById('scoreBoard');
        if (!board) return;
        board.innerHTML = '<h3>Scoreboard</h3>';
        const entries = Object.entries(state.teamScores).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) {
            const row = document.createElement('div');
            row.className = 'score-row';
            row.textContent = 'No scores yet';
            board.appendChild(row);
            return;
        }
        entries.forEach(([playerId, score]) => {
            const row = document.createElement('div');
            row.className = 'score-row' + (playerId === state.controller && !state.contested ? ' active' : '');
            const top = document.createElement('div');
            top.className = 'row-top';
            const label = getLabel(playerId);
            top.innerHTML = `<span>${label}</span><span>${score}</span>`;
            const progress = document.createElement('div');
            progress.className = 'progress';
            const bar = document.createElement('span');
            bar.style.width = clamp((score / (state.rules.targetScore || 180)) * 100, 0, 100) + '%';
            bar.style.background = getColor(playerId);
            progress.appendChild(bar);
            row.appendChild(top);
            row.appendChild(progress);
            board.appendChild(row);
        });
    }

    function updateStatus() {
        const controllerLabel = state.controllerName || (state.controller ? getLabel(state.controller) : null);
        const statusText = state.contested ? 'Contested' : (controllerLabel || 'Neutral');
        const badge = document.getElementById('controlStatus');
        if (badge) {
            badge.textContent = statusText;
            badge.className = 'badge ' + (state.contested ? 'contested' : (state.controller ? 'controlled' : 'neutral'));
            if (state.controller && !state.contested) {
                badge.style.borderColor = getColor(state.controller);
                badge.style.color = '#ffffff';
            } else {
                badge.style.borderColor = '';
                badge.style.color = '';
            }
        }
        const detail = document.getElementById('controlDetail');
        if (detail) {
            if (state.contested) detail.textContent = 'Contested zone - no points awarded.';
            else if (controllerLabel) detail.textContent = controllerLabel + ' scoring +' + (state.rules.scorePerSec || 4) + '/s';
            else detail.textContent = 'No player holds the zone.';
        }
        setUI('zoneRadius', Math.max(0, Math.round(state.zone.radius)) + 'm');
        setUI('timeLeft', formatTime(state.timeLeft || 0));
        setUI('roomId', state.roomId || '--');
        setUI('phaseBadge', state.phase || 1);
        setUI('stormLevel', state.storm.level || 1);
        setUI('bulletCount', state.player.bullets);
        setUI('hpCount', Math.max(0, Math.round(state.player.combatHp)));
        setUI('playerName', state.player.username);
        updateStormMeter();
    }

    function mergeRoomState(data) {
        if (!data) return;
        if (data.map) {
            state.map.width = data.map.width || state.map.width;
            state.map.height = data.map.height || state.map.height;
        }
        if (data.rules) {
            state.rules = Object.assign({}, state.rules, data.rules);
        }
        if (data.storm) {
            state.storm = Object.assign({}, state.storm, data.storm);
        }
        if (data.zone) {
            state.zone = Object.assign({}, state.zone, data.zone);
        }
        if (data.teamScores) state.teamScores = data.teamScores;
        if (data.scoreLabels) state.scoreLabels = data.scoreLabels;
        if (typeof data.timeLeft !== 'undefined') state.timeLeft = data.timeLeft;
        if (typeof data.round !== 'undefined') state.round = data.round;
        if (typeof data.phase !== 'undefined') state.phase = data.phase;
        if (typeof data.controller !== 'undefined') state.controller = data.controller;
        if (typeof data.controllerName !== 'undefined') state.controllerName = data.controllerName;
        if (typeof data.contested !== 'undefined') state.contested = !!data.contested;
    }

    function getColor(id) {
        if (!id) return '#30d7ff';
        let hash = 0;
        for (let i = 0; i < id.length; i += 1) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 55%)`;
    }

    function getLabel(id) {
        return state.scoreLabels[id] || (state.players[id] && state.players[id].username) || 'Player';
    }

    function isDemoMode() {
        try {
            return sessionStorage.getItem('snakes_demo_mode') === '1';
        } catch (e) {
            return false;
        }
    }

    function ensureLocalId() {
        if (state.localId) return state.localId;
        try {
            const stored = sessionStorage.getItem('koz_local_id');
            if (stored) {
                state.localId = stored;
                return stored;
            }
        } catch (e) {}
        const generated = 'local_' + Math.random().toString(36).slice(2, 10);
        state.localId = generated;
        try {
            sessionStorage.setItem('koz_local_id', generated);
        } catch (e) {}
        return generated;
    }

    function enableOffline(reason) {
        if (state.offline) return;
        state.offline = true;
        state.connected = false;
        state.joined = true;
        state.selfId = ensureLocalId();
        state.roomId = 'LOCAL';
        state.teamScores = state.teamScores || {};
        state.teamScores[state.selfId] = state.teamScores[state.selfId] || 0;
        state.scoreLabels[state.selfId] = state.player.username;
        if (!state.timeLeft) state.timeLeft = state.rules.timeLimit || 240;
        if (reason) showZoneEvent(reason, 'wrong');
        updateStatus();
        updateScoreboard();
    }

    function loadDemoProgress() {
        try {
            const stored = sessionStorage.getItem('snakes_demo_progress');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return null;
    }

    async function loadPlayerData() {
        try {
            if (sessionStorage.getItem('snakes_isGuest') === '1') {
                state.player.username = sessionStorage.getItem('snakes_guest_name') || 'Guest';
                state.player.character = sessionStorage.getItem('snakes_selected_character') || 'knight';
                const storedBullets = sessionStorage.getItem('snakes_selected_bullets');
                if (storedBullets) state.player.bullets = Number(storedBullets) || state.player.bullets;
                return;
            }
        } catch (e) {}

        try {
            const userRes = await fetch(GAME_API_BASE + '/api/id', { credentials: 'include' });
            if (userRes.ok) {
                const userData = await userRes.json();
                if (userData && userData.name) state.player.username = userData.name;
            }
            const gameRes = await fetch(GAME_API_BASE + '/api/snakes/', { credentials: 'include' });
            if (gameRes.ok) {
                const gameData = await gameRes.json();
                if (gameData && gameData.selected_character) {
                    state.player.character = gameData.selected_character;
                }
                if (typeof gameData.total_bullets !== 'undefined') {
                    const fetchedBullets = Number(gameData.total_bullets);
                    if (Number.isFinite(fetchedBullets)) {
                        state.player.bullets = Math.max(state.player.bullets, fetchedBullets);
                    }
                }
            }
        } catch (e) {}

        if (isDemoMode()) {
            const demoData = loadDemoProgress();
            if (demoData) {
                if (demoData.character) state.player.character = demoData.character;
                if (typeof demoData.bullets !== 'undefined') state.player.bullets = Number(demoData.bullets || state.player.bullets);
            }
            if (state.player.username === 'Player') {
                state.player.username = 'Guest_' + Math.floor(Math.random() * 1000);
            }
        }
    }

    function joinMatch() {
        if (!socket || !state.connected) {
            enableOffline('Offline training mode');
            return;
        }
        socket.emit('koz_join', {
            username: state.player.username,
            character: state.player.character,
            x: state.player.x,
            y: state.player.y
        });
    }

    function leaveMatch() {
        if (socket && state.connected) {
            socket.emit('koz_leave', {});
        }
        window.location.href = 'mode-selection.html';
    }

    function connectSocket() {
        socket = io(SOCKET_URL, { transports: ['polling', 'websocket'], upgrade: true });

        socket.on('connect', () => {
            state.connected = true;
            state.selfId = socket.id;
            if (state.offline) {
                state.offline = false;
                state.joined = false;
            }
            if (offlineTimer) {
                clearTimeout(offlineTimer);
                offlineTimer = null;
            }
            playCue('battle');
            if (!state.joined) {
                joinMatch();
            }
        });

        socket.on('connect_error', () => {
            enableOffline('Server unreachable');
        });

        socket.on('disconnect', () => {
            if (!state.offline) enableOffline('Connection lost');
        });

        socket.on('koz_room_state', (data) => {
            state.joined = true;
            state.roomId = data.roomId || state.roomId;
            if (data.selfId) state.selfId = data.selfId;
            mergeRoomState(data);
            updateStatus();
            updateScoreboard();
        });

        socket.on('koz_state', (data) => {
            mergeRoomState(data);
            updateStatus();
            updateScoreboard();
        });

        socket.on('koz_zone_event', (data) => {
            if (data && data.zone) state.zone = Object.assign({}, state.zone, data.zone);
            if (!data || !data.type) {
                playCue('powerup');
                return;
            }
            if (data.type === 'shrink') {
                state.fx.pulse = 1.0;
                showZoneEvent('Zone collapsing!', 'powerup');
            } else if (data.type === 'relocate') {
                state.fx.shake = 1.2;
                showZoneEvent('Zone relocating - move!', 'battle');
            } else if (data.type === 'contested_relocate') {
                state.fx.shake = 0.9;
                showZoneEvent('Zone unstable - relocating!', 'wrong');
            } else if (data.type === 'pulse') {
                state.fx.shake = 0.8;
                showZoneEvent('Storm pulse incoming', 'hurt');
            } else if (data.type === 'finale') {
                state.fx.shake = 1.4;
                showZoneEvent('Final stand! Storm accelerating', 'battle');
            }
        });

        socket.on('koz_control_changed', (data) => {
            state.controller = data.controller || null;
            state.controllerName = data.controllerName || null;
            state.contested = !!data.contested;
            if (state.contested) {
                playCue('wrong');
            } else if (state.controller) {
                playCue('correct');
            }
            updateStatus();
            updateScoreboard();
        });

        socket.on('koz_player_position', (data) => {
            if (!data || !data.sid) return;
            if (data.sid === state.selfId) return;
            state.players[data.sid] = {
                x: data.x,
                y: data.y,
                character: data.character,
                username: data.username || state.players[data.sid]?.username,
                combatHp: typeof data.hp !== 'undefined' ? data.hp : (state.players[data.sid]?.combatHp || 100)
            };
        });

        socket.on('koz_self_position', (data) => {
            if (!data) return;
            const dx = (data.x || 0) - state.player.x;
            const dy = (data.y || 0) - state.player.y;
            if (Math.hypot(dx, dy) > 0.5) {
                state.player.x = data.x;
                state.player.y = data.y;
            }
        });

        socket.on('koz_self_state', (data) => {
            if (!data) return;
            if (typeof data.zoneHp !== 'undefined') state.player.zoneHp = data.zoneHp;
            if (typeof data.outside !== 'undefined') state.player.outside = data.outside;
            if (typeof data.speedMultiplier !== 'undefined') state.player.speedMultiplier = data.speedMultiplier;
            if (typeof data.combatHp !== 'undefined') state.player.combatHp = data.combatHp;
            if (data.storm) state.storm = Object.assign({}, state.storm, data.storm);
            if (typeof data.phase !== 'undefined') state.phase = data.phase;
            updateStatus();
        });

        socket.on('koz_player_hit', (data) => {
            if (!data || !data.target) return;
            if (data.target === state.selfId) {
                state.player.combatHp = data.hp;
            } else if (state.players[data.target]) {
                state.players[data.target].combatHp = data.hp;
            }
            if (data.down) {
                showZoneEvent((data.targetName || 'Player') + ' was eliminated!', 'hurt');
            }
            updateStatus();
            updateScoreboard();
        });

        socket.on('koz_bullet', (data) => {
            if (!data) return;
            if (data.shooter === state.selfId) return;
            const bullet = buildBullet({
                x: data.bulletX,
                y: data.bulletY,
                dx: data.dx,
                dy: data.dy,
                character: data.character,
                shooter: data.shooter,
                target: data.target,
                fromRemote: true
            });
            if (bullet) state.foreignBullets.push(bullet);
        });

        socket.on('koz_player_joined', (data) => {
            if (data && data.sid && data.username) {
                state.scoreLabels[data.sid] = data.username;
            }
            playCue('click');
            updateScoreboard();
        });

        socket.on('koz_player_left', (data) => {
            if (data && data.sid) {
                delete state.players[data.sid];
                delete state.scoreLabels[data.sid];
                delete state.teamScores[data.sid];
            }
            playCue('click');
            updateScoreboard();
        });

        socket.on('koz_match_end', (data) => {
            const overlay = document.getElementById('endOverlay');
            const title = document.getElementById('endTitle');
            const subtitle = document.getElementById('endSubtitle');
            title.textContent = 'Match Ended';
            subtitle.textContent = 'Winner: ' + (data.winnerName || data.winner || 'None');
            overlay.classList.add('active');
            playCue('win');
        });
    }

    function worldToScreen(x, y) {
        return {
            x: (x - state.camera.x) + state.view.width / 2,
            y: (y - state.camera.y) + state.view.height / 2
        };
    }

    function screenToWorld(x, y) {
        return {
            x: x + state.camera.x - state.view.width / 2,
            y: y + state.camera.y - state.view.height / 2
        };
    }

    function updateCamera() {
        const halfW = state.view.width / 2;
        const halfH = state.view.height / 2;
        const targetX = clamp(state.player.x, halfW, state.map.width - halfW);
        const targetY = clamp(state.player.y, halfH, state.map.height - halfH);
        state.camera.x += (targetX - state.camera.x) * 0.12;
        state.camera.y += (targetY - state.camera.y) * 0.12;
    }

    function isInsideZone(x, y) {
        const dx = x - state.zone.x;
        const dy = y - state.zone.y;
        return (dx * dx + dy * dy) <= (state.zone.radius * state.zone.radius);
    }

    function drawBackground() {
        ctx.save();
        ctx.fillStyle = '#0b0f1e';
        ctx.fillRect(0, 0, state.view.width, state.view.height);

        const grid = 140;
        const start = screenToWorld(0, 0);
        const end = screenToWorld(state.view.width, state.view.height);
        const startX = Math.floor(start.x / grid) * grid;
        const endX = Math.ceil(end.x / grid) * grid;
        const startY = Math.floor(start.y / grid) * grid;
        const endY = Math.ceil(end.y / grid) * grid;

        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let x = startX; x <= endX; x += grid) {
            const sx = worldToScreen(x, 0).x;
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, state.view.height);
            ctx.stroke();
        }
        for (let y = startY; y <= endY; y += grid) {
            const sy = worldToScreen(0, y).y;
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(state.view.width, sy);
            ctx.stroke();
        }

        ctx.restore();
    }

    function drawStormOverlay() {
        const zoneScreen = worldToScreen(state.zone.x, state.zone.y);
        const radius = state.zone.radius;
        ctx.save();
        ctx.fillStyle = 'rgba(5, 8, 16, 0.72)';
        ctx.fillRect(0, 0, state.view.width, state.view.height);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(zoneScreen.x, zoneScreen.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawZone(time) {
        const zoneScreen = worldToScreen(state.zone.x, state.zone.y);
        const radius = state.zone.radius;
        const coreRadius = state.zone.core_radius || radius * 0.35;
        const pulse = Math.sin(time / 260) * 3 + state.fx.pulse * 6;
        const baseColor = state.contested ? 'rgba(241,196,15,0.9)' : 'rgba(48,215,255,0.9)';

        ctx.save();
        const fillGrad = ctx.createRadialGradient(zoneScreen.x, zoneScreen.y, coreRadius * 0.2, zoneScreen.x, zoneScreen.y, radius);
        fillGrad.addColorStop(0, 'rgba(48,215,255,0.18)');
        fillGrad.addColorStop(1, 'rgba(48,215,255,0.02)');
        ctx.fillStyle = fillGrad;
        ctx.beginPath();
        ctx.arc(zoneScreen.x, zoneScreen.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(zoneScreen.x, zoneScreen.y, coreRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(zoneScreen.x, zoneScreen.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 6 + pulse * 0.2;
        ctx.shadowBlur = 30;
        ctx.shadowColor = baseColor;
        ctx.stroke();
        ctx.restore();
    }

    function drawPixelSprite(ctx, x, y, size, sprite) {
        const rows = sprite.pattern.length;
        const cols = sprite.pattern[0].length;
        const pixel = Math.max(2, Math.round(size / cols));
        const startX = Math.round(x - (cols * pixel) / 2);
        const startY = Math.round(y - (rows * pixel) / 2);

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        const outline = '#1c1c1c';

        for (let row = 0; row < rows; row++) {
            const line = sprite.pattern[row];
            for (let col = 0; col < cols; col++) {
                const code = line[col];
                if (code === '.') continue;
                const neighbors = [
                    [row - 1, col],
                    [row + 1, col],
                    [row, col - 1],
                    [row, col + 1]
                ];
                for (const [nr, nc] of neighbors) {
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || sprite.pattern[nr][nc] === '.') {
                        ctx.fillStyle = outline;
                        ctx.fillRect(startX + nc * pixel, startY + nr * pixel, pixel, pixel);
                    }
                }
            }
        }

        for (let row = 0; row < rows; row++) {
            const line = sprite.pattern[row];
            for (let col = 0; col < cols; col++) {
                const code = line[col];
                if (code === '.') continue;
                const color = sprite.colors[code];
                if (!color) continue;
                ctx.fillStyle = color;
                ctx.fillRect(startX + col * pixel, startY + row * pixel, pixel, pixel);
            }
        }
        ctx.restore();
    }

    function drawPlayer(p, isSelf) {
        const screen = worldToScreen(p.x, p.y);
        const inside = isInsideZone(p.x, p.y);
        const sprite = PLAYER_SPRITES[p.character] || PLAYER_SPRITES.knight;
        const spriteImg = PLAYER_IMAGES[p.character];
        const cols = sprite.pattern[0].length;
        const rows = sprite.pattern.length;
        const size = state.player.radius * 2.2;
        const pixel = Math.max(2, Math.round(size / cols));
        const spriteW = cols * pixel;
        const spriteH = rows * pixel;

        ctx.save();
        if (!inside) ctx.globalAlpha = 0.65;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + spriteH * 0.35, spriteW * 0.28, spriteH * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth) {
            const target = size * 2;
            ctx.drawImage(spriteImg, Math.round(screen.x - target / 2), Math.round(screen.y - target / 2), target, target);
        } else {
            drawPixelSprite(ctx, screen.x, screen.y, size, sprite);
        }
        ctx.restore();

        if (inside && isSelf) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y + 2, spriteW * 0.35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        const label = p.username || 'Player';
        ctx.font = '12px Rajdhani, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(label, screen.x + spriteW / 2 + 10, screen.y + 2);

        const hp = typeof p.combatHp !== 'undefined' ? p.combatHp : 100;
        const barWidth = Math.max(42, spriteW * 0.7);
        const barHeight = 6;
        const barX = screen.x - barWidth / 2;
        const barY = screen.y - spriteH * 0.6;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = 'rgba(255, 77, 90, 0.9)';
        ctx.fillRect(barX, barY, barWidth * clamp(hp / 100, 0, 1), barHeight);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    function drawDirectionalArrow() {
        if (!state.player.outside) return;
        const dx = state.zone.x - state.player.x;
        const dy = state.zone.y - state.player.y;
        const angle = Math.atan2(dy, dx);
        const centerX = state.view.width / 2;
        const centerY = 80;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(255, 77, 90, 0.9)';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '12px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RETURN TO ZONE', centerX, centerY + 26);
        ctx.restore();
    }

    function drawMiniMap() {
        const mapW = 170;
        const mapH = 110;
        const x = state.view.width - mapW - 16;
        const y = 120;
        ctx.save();
        ctx.fillStyle = 'rgba(5,8,16,0.7)';
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, mapW, mapH);
        ctx.strokeRect(x, y, mapW, mapH);

        const scaleX = mapW / state.map.width;
        const scaleY = mapH / state.map.height;
        const zoneX = x + state.zone.x * scaleX;
        const zoneY = y + state.zone.y * scaleY;
        const zoneR = state.zone.radius * scaleX;
        ctx.beginPath();
        ctx.arc(zoneX, zoneY, zoneR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(48,215,255,0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        Object.keys(state.players).forEach((pid) => {
            const p = state.players[pid];
            if (!p) return;
            ctx.fillStyle = getColor(pid);
            ctx.beginPath();
            ctx.arc(x + p.x * scaleX, y + p.y * scaleY, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x + state.player.x * scaleX, y + state.player.y * scaleY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawVignette() {
        if (!state.player.outside) return;
        const gradient = ctx.createRadialGradient(
            state.view.width / 2,
            state.view.height / 2,
            state.view.width * 0.2,
            state.view.width / 2,
            state.view.height / 2,
            state.view.width * 0.7
        );
        gradient.addColorStop(0, 'rgba(255,77,90,0)');
        gradient.addColorStop(1, 'rgba(255,77,90,0.35)');
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, state.view.width, state.view.height);
        ctx.restore();
    }

    function drawBullets() {
        const drawBullet = (bullet) => {
            const screen = worldToScreen(bullet.x, bullet.y);
            if (bullet.isFireball) {
                const grd = ctx.createRadialGradient(screen.x, screen.y, 2, screen.x, screen.y, 10);
                grd.addColorStop(0, '#fff2a8');
                grd.addColorStop(0.4, '#ff9f1c');
                grd.addColorStop(1, '#ff3b30');
                ctx.shadowBlur = 18;
                ctx.shadowColor = '#ff6b6b';
                ctx.fillStyle = grd;
            } else {
                ctx.fillStyle = bullet.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = bullet.glow;
            }
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, bullet.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        };

        state.playerBullets.forEach(drawBullet);
        state.foreignBullets.forEach(drawBullet);
    }

    function drawAimIndicator() {
        if (!state.mouse.inCanvas) return;
        const start = worldToScreen(state.player.x, state.player.y);
        const end = worldToScreen(state.mouse.worldX, state.mouse.worldY);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function gameLoop(time) {
        ctx.setTransform(state.view.dpr, 0, 0, state.view.dpr, 0, 0);
        ctx.clearRect(0, 0, state.view.width, state.view.height);

        const now = time || performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - (lastFrameAt || now)) / 1000));
        lastFrameAt = now;

        movePlayer(dt);

        updateCamera();
        const localOutside = !isInsideZone(state.player.x, state.player.y);
        if (localOutside !== state.player.outside) {
            state.player.outside = localOutside;
            updateStormMeter();
        }

        if (state.joined || state.offline) {
            const stormMax = state.rules.stormMax || 100;
            if (state.player.outside) {
                state.player.zoneHp = clamp(state.player.zoneHp - (state.storm.damage || 8) * dt, 0, stormMax);
            } else {
                state.player.zoneHp = clamp(state.player.zoneHp + (state.storm.regen || 4) * dt, 0, stormMax);
            }
            updateStormMeter();
        }

        const shakeAmount = state.fx.shake > 0 ? state.fx.shake * 6 : 0;
        const shakeX = shakeAmount ? (Math.random() * 2 - 1) * shakeAmount : 0;
        const shakeY = shakeAmount ? (Math.random() * 2 - 1) * shakeAmount : 0;

        ctx.save();
        ctx.translate(shakeX, shakeY);
        drawBackground();
        drawStormOverlay();
        drawZone(time || 0);

        drawPlayer({
            x: state.player.x,
            y: state.player.y,
            character: state.player.character,
            username: state.player.username,
            combatHp: state.player.combatHp
        }, true);

        Object.keys(state.players).forEach((sid) => {
            const p = state.players[sid];
            if (!p) return;
            drawPlayer({
                x: p.x,
                y: p.y,
                character: p.character,
                username: p.username || getLabel(sid),
                combatHp: p.combatHp,
                sid: sid
            }, false);
        });

        drawBullets();
        drawAimIndicator();
        drawDirectionalArrow();
        drawMiniMap();
        drawVignette();
        ctx.restore();

        moveBullets();
        checkBulletHits();

        if (socket && state.connected && state.joined && now - lastMoveSentAt > 60) {
            lastMoveSentAt = now;
            socket.emit('koz_move', { x: state.player.x, y: state.player.y, inZone: !state.player.outside });
        }

        if (state.offline) {
            updateLocalControl(dt);
        }

        state.fx.pulse = Math.max(0, state.fx.pulse - 0.02);
        state.fx.shake = Math.max(0, state.fx.shake - 0.02);

        requestAnimationFrame(gameLoop);
    }

    function movePlayer(dt) {
        let speed = state.player.speed * 20 * (state.player.speedMultiplier || 1);
        if (state.player.outside) speed *= 0.85;
        if (state.keys['shift']) speed *= 1.1;

        const inputX = (state.keys['d'] || state.keys['arrowright'] ? 1 : 0) - (state.keys['a'] || state.keys['arrowleft'] ? 1 : 0);
        const inputY = (state.keys['s'] || state.keys['arrowdown'] ? 1 : 0) - (state.keys['w'] || state.keys['arrowup'] ? 1 : 0);
        const mag = Math.hypot(inputX, inputY) || 1;
        const targetVx = (inputX / mag) * speed;
        const targetVy = (inputY / mag) * speed;
        const accel = 18;
        const lerpFactor = Math.min(1, accel * dt);
        state.player.vx += (targetVx - state.player.vx) * lerpFactor;
        state.player.vy += (targetVy - state.player.vy) * lerpFactor;

        state.player.x += state.player.vx * dt;
        state.player.y += state.player.vy * dt;

        const margin = state.player.radius + 6;
        state.player.x = clamp(state.player.x, margin, state.map.width - margin);
        state.player.y = clamp(state.player.y, margin, state.map.height - margin);
    }

    function updateLocalControl(dt) {
        if (!state.offline) return;
        if (!state.selfId) state.selfId = ensureLocalId();
        if (!state.timeLeft) state.timeLeft = state.rules.timeLimit || 240;
        const inside = isInsideZone(state.player.x, state.player.y);
        if (inside) {
            state.controller = state.selfId;
            state.controllerName = state.player.username;
            state.contested = false;
            const coreRadius = state.zone.core_radius || state.zone.radius * 0.35;
            const inCore = Math.hypot(state.player.x - state.zone.x, state.player.y - state.zone.y) <= coreRadius;
            const base = state.rules.scorePerSec || 4;
            const bonus = inCore ? (state.rules.coreBonus || 2) : 0;
            const add = (base + bonus) * dt;
            state.teamScores[state.selfId] = (state.teamScores[state.selfId] || 0) + add;
        } else {
            state.controller = null;
            state.controllerName = null;
            state.contested = false;
        }
        state.timeLeft = Math.max(0, state.timeLeft - dt);
        updateStatus();
        updateScoreboard();
        if (state.timeLeft === 0) {
            const overlay = document.getElementById('endOverlay');
            const title = document.getElementById('endTitle');
            const subtitle = document.getElementById('endSubtitle');
            if (title) title.textContent = 'Training Complete';
            if (subtitle) subtitle.textContent = 'Score: ' + Math.round(state.teamScores[state.selfId] || 0);
            if (overlay) overlay.classList.add('active');
        }
    }

    function getNearestTargetId() {
        let bestId = null;
        let bestDist = Infinity;
        Object.keys(state.players).forEach((sid) => {
            const p = state.players[sid];
            if (!p) return;
            const dx = p.x - state.player.x;
            const dy = p.y - state.player.y;
            const dist = Math.hypot(dx, dy);
            if (dist < bestDist) {
                bestDist = dist;
                bestId = sid;
            }
        });
        return bestId;
    }

    function buildBullet({ x, y, dx, dy, character, shooter, target, fromRemote }) {
        if (typeof x !== 'number' || typeof y !== 'number') return null;
        const isWizard = character === 'wizard';
        const isArcher = character === 'archer';
        const color = fromRemote ? getColor(shooter || 'enemy') : '#ffffff';
        return {
            x,
            y,
            dx,
            dy,
            size: isWizard ? 9 : 7,
            speed: BULLET_SPEED,
            life: 0,
            maxLife: BULLET_MAX_LIFE,
            color: isWizard ? '#ff3b30' : color,
            glow: isWizard ? '#ff6b6b' : color,
            isFireball: isWizard,
            homing: isArcher,
            target: target || null,
            owner: shooter || state.selfId
        };
    }

    function shoot() {
        if (!state.joined && !state.offline) return;
        const now = Date.now();
        if (now - state.lastShotAt < SHOT_COOLDOWN) return;
        if (state.player.bullets <= 0) return;

        state.lastShotAt = now;

        if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
            window.SnakesSFX.play(state.player.character === 'wizard' ? 'fireball' : 'shoot');
        }

        const shotAngle = state.mouse.inCanvas ? Math.atan2(state.mouse.worldY - state.player.y, state.mouse.worldX - state.player.x) : state.aimAngle;
        state.aimAngle = shotAngle;

        const spawnOffset = state.player.radius + 6;
        const spawnX = state.player.x + Math.cos(shotAngle) * spawnOffset;
        const spawnY = state.player.y + Math.sin(shotAngle) * spawnOffset;

        const isWizard = state.player.character === 'wizard';
        const isArcher = state.player.character === 'archer';
        const shots = isWizard ? [-0.12, 0.12] : [0];
        const targetId = isArcher ? getNearestTargetId() : null;

        shots.forEach((offset) => {
            const angle = shotAngle + offset;
            const dx = Math.cos(angle) * BULLET_SPEED;
            const dy = Math.sin(angle) * BULLET_SPEED;
            const bullet = buildBullet({
                x: spawnX,
                y: spawnY,
                dx,
                dy,
                character: state.player.character,
                shooter: state.selfId,
                target: targetId
            });
            if (bullet) state.playerBullets.push(bullet);
        });

        state.player.bullets -= 1;
        updateStatus();
        scheduleBulletSave();

        if (socket && socket.connected && !state.offline) {
            socket.emit('koz_shoot', {
                bulletX: spawnX,
                bulletY: spawnY,
                dx: Math.cos(shotAngle) * BULLET_SPEED,
                dy: Math.sin(shotAngle) * BULLET_SPEED,
                character: state.player.character,
                target: targetId
            });
        }
    }

    function moveBullets() {
        const step = (bullet) => {
            if (bullet.homing && bullet.target) {
                const target = bullet.target === state.selfId
                    ? { x: state.player.x, y: state.player.y }
                    : state.players[bullet.target];
                if (target) {
                    const desired = Math.atan2(target.y - bullet.y, target.x - bullet.x);
                    const current = Math.atan2(bullet.dy, bullet.dx);
                    const adjusted = lerpAngle(current, desired, 0.05);
                    const speed = Math.hypot(bullet.dx, bullet.dy) || BULLET_SPEED;
                    bullet.dx = Math.cos(adjusted) * speed;
                    bullet.dy = Math.sin(adjusted) * speed;
                }
            }
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            bullet.life += 1;
            return bullet.x > 0 && bullet.x < state.map.width && bullet.y > 0 && bullet.y < state.map.height && bullet.life < bullet.maxLife;
        };

        state.playerBullets = state.playerBullets.filter(step);
        state.foreignBullets = state.foreignBullets.filter(step);
    }

    function checkBulletHits() {
        const hitRadius = state.player.radius + 6;
        state.playerBullets = state.playerBullets.filter((bullet) => {
            let hit = false;
            Object.keys(state.players).forEach((sid) => {
                if (hit) return;
                const p = state.players[sid];
                if (!p) return;
                const dist = Math.hypot(bullet.x - p.x, bullet.y - p.y);
                if (dist < hitRadius) {
                    hit = true;
                    if (socket && socket.connected) {
                        socket.emit('koz_hit_player', { target: sid, damage: 20 });
                    }
                }
            });
            return !hit;
        });
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        state.mouse.x = sx;
        state.mouse.y = sy;
        state.mouse.inCanvas = true;
        const world = screenToWorld(sx, sy);
        state.mouse.worldX = world.x;
        state.mouse.worldY = world.y;
        state.targetAimAngle = Math.atan2(world.y - state.player.y, world.x - state.player.x);
        state.aimAngle = lerpAngle(state.aimAngle, state.targetAimAngle, 0.4);
    }

    function bindInputs() {
        document.addEventListener('keydown', (e) => {
            state.keys[e.key.toLowerCase()] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                shoot();
            }
        });
        document.addEventListener('keyup', (e) => {
            delete state.keys[e.key.toLowerCase()];
        });
        window.addEventListener('blur', () => {
            state.keys = {};
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) state.keys = {};
        });

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                e.preventDefault();
                shoot();
            }
        });
        canvas.addEventListener('mouseleave', () => { state.mouse.inCanvas = false; });
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        const joinBtn = document.getElementById('joinBtn');
        if (joinBtn) joinBtn.addEventListener('click', joinMatch);
        const leaveBtn = document.getElementById('leaveBtn');
        if (leaveBtn) leaveBtn.addEventListener('click', leaveMatch);
        const endBack = document.getElementById('endBack');
        if (endBack) endBack.addEventListener('click', () => {
            window.location.href = 'mode-selection.html';
        });
    }

    function init() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        bindInputs();
        ensureLocalId();
        loadPlayerData().then(connectSocket);
        offlineTimer = setTimeout(() => {
            if (!state.connected) enableOffline('Server unavailable');
        }, 3000);
        updateStatus();
        requestAnimationFrame(gameLoop);
    }

    init();
})();
