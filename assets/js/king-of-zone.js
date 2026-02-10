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

    const loadoutApi = window.SnakesLoadout || null;

    // Visual tuning for server-authoritative weapon projectiles.
    const WEAPON_VISUALS = {
        'bulwark-disc': { color: '#8ed7ff', glow: '#53c5ff', size: 10, shape: 'disc' },
        'arcane-orb': { color: '#ff9f5a', glow: '#ff6b6b', size: 11, shape: 'orb' },
        'piercing-arrow': { color: '#8ef7cc', glow: '#4de8af', size: 8, shape: 'arrow' },
        'rage-axe': { color: '#ffc46b', glow: '#ffb347', size: 12, shape: 'axe' }
    };

    const POWERUP_VISUALS = {
        'speed-boost': { color: '#7dff9b', label: 'Speed Boost' },
        'shield': { color: '#6fc3ff', label: 'Shield' },
        'rapid-fire': { color: '#ff9c6f', label: 'Rapid Fire' },
        'heal': { color: '#8dffa6', label: 'Heal' },
        'vision-ping': { color: '#d8a6ff', label: 'Vision Ping' },
        'ammo-pack': { color: '#ffe07a', label: 'Ammo Pack' }
    };

    const state = {
        connected: false,
        joined: false,
        offline: false,
        roomId: null,
        selfId: null,
        localId: null,
        map: { width: 9800, height: 7600 },
        rules: {
            targetScore: 220,
            timeLimit: 300,
            scorePerSec: 4,
            coreBonus: 3,
            stormMax: 100
        },
        storm: { level: 1, damage: 9, regen: 5 },
        player: {
            username: 'Player',
            character: 'knight',
            weaponType: 'bulwark-disc',
            x: 4800,
            y: 3800,
            speed: 7.4,
            speedMultiplier: 1,
            zoneHp: 100,
            combatHp: 100,
            bullets: 60,
            shield: 0,
            outside: false,
            radius: 18,
            vx: 0,
            vy: 0
        },
        players: {},
        zone: { x: 4900, y: 3800, radius: 3400, base_radius: 3400, core_radius: 1180 },
        teamScores: {},
        scoreLabels: {},
        controller: null,
        controllerName: null,
        contested: false,
        timeLeft: 0,
        nextShrinkIn: 0,
        shrink: { active: false, progress: 0, fromRadius: 0, toRadius: 0 },
        round: 1,
        phase: 1,
        keys: {},
        mouse: { x: 0, y: 0, worldX: 0, worldY: 0, inCanvas: false },
        aimAngle: 0,
        targetAimAngle: 0,
        lastShotAt: 0,
        playerBullets: [],
        foreignBullets: [],
        projectiles: {},
        obstacles: {},
        powerups: {},
        visionPing: { until: 0, reveals: [] },
        damageIndicator: { until: 0, angle: 0, strength: 0 },
        camera: { x: 4900, y: 3800 },
        view: { width: canvas.clientWidth || 1100, height: canvas.clientHeight || 680, dpr: 1 },
        fx: { shake: 0, pulse: 0, hitFlash: 0 },
        debug: { enabled: false, hitboxes: false, zone: false, obstacles: false }
    };

    const SHOT_COOLDOWN = 160; // Offline fallback cooldown.
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

    function normalizeHero(hero) {
        const key = String(hero || '').trim().toLowerCase();
        if (key === 'knight' || key === 'wizard' || key === 'archer' || key === 'warrior') return key;
        return 'knight';
    }

    function resolveWeaponType(character, explicitWeaponType) {
        if (loadoutApi && typeof loadoutApi.normalizeWeaponType === 'function') {
            return loadoutApi.normalizeWeaponType(character, explicitWeaponType);
        }
        const hero = normalizeHero(character);
        const explicit = String(explicitWeaponType || '').trim().toLowerCase();
        if (WEAPON_VISUALS[explicit]) return explicit;
        const defaults = {
            knight: 'bulwark-disc',
            wizard: 'arcane-orb',
            archer: 'piercing-arrow',
            warrior: 'rage-axe'
        };
        return defaults[hero] || 'bulwark-disc';
    }

    function getWeaponVisual(weaponType) {
        return WEAPON_VISUALS[weaponType] || WEAPON_VISUALS['bulwark-disc'];
    }

    function themeVar(name, fallback) {
        try {
            const root = document.body || document.documentElement;
            if (!root) return fallback;
            const value = getComputedStyle(root).getPropertyValue(name).trim();
            return value || fallback;
        } catch (e) {
            return fallback;
        }
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
        setUI('nextShrink', formatTime(Math.max(0, Math.floor(state.nextShrinkIn || 0))));
        setUI('bulletCount', state.player.bullets);
        setUI('hpCount', Math.max(0, Math.round(state.player.combatHp)));
        setUI('shieldCount', Math.max(0, Math.round(state.player.shield || 0)));
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
        if (Array.isArray(data.obstacles)) {
            state.obstacles = keyedById(data.obstacles, 'id');
        }
        if (Array.isArray(data.powerups)) {
            state.powerups = keyedById(data.powerups, 'id');
        }
        if (Array.isArray(data.players)) {
            data.players.forEach((entry) => {
                if (!entry || !entry.sid) return;
                if (entry.sid === state.selfId) {
                    if (typeof entry.x === 'number') state.player.x = entry.x;
                    if (typeof entry.y === 'number') state.player.y = entry.y;
                    if (entry.character) state.player.character = normalizeHero(entry.character);
                    state.player.weaponType = resolveWeaponType(entry.character || state.player.character, entry.weapon_type || state.player.weaponType);
                    if (typeof entry.hp !== 'undefined') state.player.combatHp = Number(entry.hp) || state.player.combatHp;
                    return;
                }
                state.players[entry.sid] = {
                    x: Number(entry.x || 0),
                    y: Number(entry.y || 0),
                    character: normalizeHero(entry.character),
                    weaponType: resolveWeaponType(entry.character, entry.weapon_type),
                    username: entry.username || state.players[entry.sid]?.username,
                    combatHp: typeof entry.hp !== 'undefined' ? Number(entry.hp) : (state.players[entry.sid]?.combatHp || 100)
                };
            });
        }
        if (data.teamScores) state.teamScores = data.teamScores;
        if (data.scoreLabels) state.scoreLabels = data.scoreLabels;
        if (typeof data.timeLeft !== 'undefined') state.timeLeft = data.timeLeft;
        if (typeof data.nextShrinkIn !== 'undefined') state.nextShrinkIn = Math.max(0, Number(data.nextShrinkIn || 0));
        if (data.shrink) state.shrink = Object.assign({}, state.shrink, data.shrink);
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

    function keyedById(list, keyName) {
        const out = {};
        if (!Array.isArray(list)) return out;
        list.forEach((item) => {
            if (!item || typeof item !== 'object') return;
            const key = item[keyName || 'id'];
            if (!key) return;
            out[key] = item;
        });
        return out;
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
        let storedCharacter = '';
        let storedWeaponType = '';
        try {
            storedCharacter = localStorage.getItem('snakes_selected_character')
                || sessionStorage.getItem('snakes_selected_character')
                || '';
            storedWeaponType = localStorage.getItem('snakes_selected_weapon')
                || sessionStorage.getItem('snakes_selected_weapon')
                || '';
        } catch (e) {}

        if (storedCharacter) {
            state.player.character = normalizeHero(storedCharacter);
        }
        state.player.weaponType = resolveWeaponType(state.player.character, storedWeaponType);

        try {
            if (sessionStorage.getItem('snakes_isGuest') === '1') {
                state.player.username = sessionStorage.getItem('snakes_guest_name') || 'Guest';
                state.player.character = normalizeHero(sessionStorage.getItem('snakes_selected_character') || 'knight');
                state.player.weaponType = resolveWeaponType(
                    state.player.character,
                    sessionStorage.getItem('snakes_selected_weapon') || state.player.weaponType
                );
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
                    state.player.character = normalizeHero(gameData.selected_character);
                }
                if (gameData && (gameData.weapon_type || gameData.selected_weapon)) {
                    state.player.weaponType = resolveWeaponType(
                        state.player.character,
                        gameData.weapon_type || gameData.selected_weapon
                    );
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
                if (demoData.character) state.player.character = normalizeHero(demoData.character);
                if (demoData.weaponType || demoData.weapon_type || demoData.selected_weapon) {
                    state.player.weaponType = resolveWeaponType(
                        state.player.character,
                        demoData.weaponType || demoData.weapon_type || demoData.selected_weapon
                    );
                }
                if (typeof demoData.bullets !== 'undefined') state.player.bullets = Number(demoData.bullets || state.player.bullets);
            }
            if (state.player.username === 'Player') {
                state.player.username = 'Guest_' + Math.floor(Math.random() * 1000);
            }
        }

        if (loadoutApi && typeof loadoutApi.getStoredWeaponType === 'function') {
            state.player.weaponType = resolveWeaponType(
                state.player.character,
                loadoutApi.getStoredWeaponType(state.player.character)
            );
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
            weapon_type: state.player.weaponType,
            selected_weapon: state.player.weaponType,
            bullets: state.player.bullets,
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

    function upsertServerProjectile(item) {
        if (!item || !item.id) return;
        const weaponType = resolveWeaponType(item.character, item.weaponType || item.weapon_type);
        const visual = getWeaponVisual(weaponType);
        const existing = state.projectiles[item.id];
        const next = Object.assign({}, existing || {}, {
            id: item.id,
            x: Number(item.x || 0),
            y: Number(item.y || 0),
            vx: Number(item.vx || 0),
            vy: Number(item.vy || 0),
            shooter: item.shooter || existing?.shooter || null,
            weaponType,
            color: item.color || visual.color,
            size: Number(item.radius || visual.size || 9),
            shape: visual.shape,
            age: Number(item.age || existing?.age || 0)
        });
        state.projectiles[item.id] = next;
    }

    function applyDamageIndicator(payload) {
        if (!payload) return;
        const sx = Number(payload.shooterX);
        const sy = Number(payload.shooterY);
        if (Number.isFinite(sx) && Number.isFinite(sy)) {
            state.damageIndicator.angle = Math.atan2(sy - state.player.y, sx - state.player.x);
        } else {
            const vx = Number(payload.vx || 0);
            const vy = Number(payload.vy || 0);
            if (vx || vy) {
                state.damageIndicator.angle = Math.atan2(vy, vx);
            }
        }
        state.damageIndicator.strength = clamp(Number(payload.damage || 10) / 28, 0.25, 1.0);
        state.damageIndicator.until = performance.now() + 900;
        state.fx.hitFlash = 1.0;
        state.fx.shake = Math.max(state.fx.shake, 0.75);
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
            const wasJoined = state.joined;
            state.joined = true;
            state.roomId = data.roomId || state.roomId;
            if (data.selfId) state.selfId = data.selfId;
            state.projectiles = {};
            state.players = {};
            mergeRoomState(data);
            if (!wasJoined) {
                state.camera.x = state.player.x;
                state.camera.y = state.player.y;
            }
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
            if (data.type === 'shrink' || data.type === 'shrink_start') {
                state.fx.pulse = 1.0;
                showZoneEvent('Zone collapsing!', 'powerup');
            } else if (data.type === 'shrink_end') {
                showZoneEvent('Zone shrink complete', 'click');
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
                weaponType: resolveWeaponType(data.character, data.weapon_type || data.weaponType),
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
            if (typeof data.bullets !== 'undefined') state.player.bullets = Number(data.bullets) || state.player.bullets;
            if (typeof data.shield !== 'undefined') state.player.shield = Number(data.shield) || 0;
            if (typeof data.nextShrinkIn !== 'undefined') state.nextShrinkIn = Math.max(0, Number(data.nextShrinkIn || 0));
            if (data.storm) state.storm = Object.assign({}, state.storm, data.storm);
            if (typeof data.phase !== 'undefined') state.phase = data.phase;
            updateStatus();
        });

        socket.on('koz_damage_feedback', (data) => {
            if (!data || data.target !== state.selfId) return;
            if (typeof data.hp !== 'undefined') state.player.combatHp = data.hp;
            applyDamageIndicator(data);
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

        socket.on('koz_player_down', (data) => {
            if (!data) return;
            if (data.sid === state.selfId) {
                state.fx.shake = 1.1;
                state.fx.hitFlash = 0.7;
            }
            showZoneEvent((data.username || 'Player') + ' down (' + (data.reason || 'combat') + ')', 'hurt');
        });

        socket.on('koz_shot_rejected', (data) => {
            if (!data) return;
            if (data.reason === 'ammo') showZoneEvent('Out of ammo', 'wrong');
            if (data.reason === 'cooldown') {
                const msLeft = Math.max(80, Math.floor((Number(data.remaining || 0) * 1000)));
                state.lastShotAt = Date.now() - SHOT_COOLDOWN + msLeft;
            }
        });

        socket.on('koz_projectile_spawned', (data) => {
            if (!data || !Array.isArray(data.projectiles)) return;
            data.projectiles.forEach((item) => upsertServerProjectile(item));
        });

        socket.on('koz_projectile_positions', (data) => {
            if (!data || !Array.isArray(data.updates)) return;
            data.updates.forEach((item) => upsertServerProjectile(item));
        });

        socket.on('koz_projectile_removed', (data) => {
            if (!data || !Array.isArray(data.items)) return;
            data.items.forEach((item) => {
                const id = typeof item === 'string' ? item : item.id;
                if (!id) return;
                delete state.projectiles[id];
            });
        });

        socket.on('koz_obstacles_removed', (data) => {
            if (!data || !Array.isArray(data.ids)) return;
            data.ids.forEach((id) => {
                delete state.obstacles[id];
            });
        });

        socket.on('koz_powerup_spawned', (data) => {
            if (!data || !data.id) return;
            state.powerups[data.id] = data;
        });

        socket.on('koz_powerup_collected', (data) => {
            if (!data || !data.id) return;
            delete state.powerups[data.id];
            if (data.by === state.selfId) playCue('powerup');
        });

        socket.on('koz_powerup_effect', (data) => {
            if (!data) return;
            const visual = POWERUP_VISUALS[data.type];
            const name = visual ? visual.label : (data.label || 'Powerup');
            showZoneEvent(name + ' activated', 'powerup');
            if (typeof data.bullets !== 'undefined') state.player.bullets = Number(data.bullets) || state.player.bullets;
            if (typeof data.shield !== 'undefined') state.player.shield = Number(data.shield) || state.player.shield;
            if (typeof data.combatHp !== 'undefined') state.player.combatHp = Number(data.combatHp) || state.player.combatHp;
            updateStatus();
        });

        socket.on('koz_vision_ping', (data) => {
            if (!data) return;
            state.visionPing.until = performance.now() + (Number(data.duration || 0) * 1000);
            state.visionPing.reveals = Array.isArray(data.reveals) ? data.reveals : [];
        });

        socket.on('koz_bullet', (data) => {
            if (!data) return;
            if (data.shooter === state.selfId) return;
            upsertServerProjectile({
                id: 'legacy_' + data.shooter + '_' + Date.now(),
                x: data.bulletX,
                y: data.bulletY,
                vx: data.dx,
                vy: data.dy,
                shooter: data.shooter,
                character: data.character,
                weaponType: resolveWeaponType(data.character)
            });
        });

        socket.on('koz_player_joined', (data) => {
            if (data && data.sid && data.username) {
                state.scoreLabels[data.sid] = data.username;
                if (!state.players[data.sid]) {
                    state.players[data.sid] = {
                        x: 0,
                        y: 0,
                        character: normalizeHero(data.character),
                        weaponType: resolveWeaponType(data.character, data.weapon_type),
                        username: data.username,
                        combatHp: 100
                    };
                }
            }
            playCue('click');
            updateScoreboard();
        });

        socket.on('koz_player_left', (data) => {
            if (data && data.sid) {
                delete state.players[data.sid];
                delete state.scoreLabels[data.sid];
                delete state.teamScores[data.sid];
                Object.keys(state.projectiles).forEach((projId) => {
                    if (state.projectiles[projId] && state.projectiles[projId].shooter === data.sid) {
                        delete state.projectiles[projId];
                    }
                });
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

    function resolveCircleObstacleCollision(x, y, radius, obstacle) {
        const ox = Number(obstacle.x || 0);
        const oy = Number(obstacle.y || 0);
        const rr = radius + Number(obstacle.radius || 0);
        let dx = x - ox;
        let dy = y - oy;
        const distSq = dx * dx + dy * dy;
        if (distSq >= rr * rr) return { x, y, corrected: false };
        let dist = Math.sqrt(distSq);
        if (dist < 0.0001) {
            dx = 1;
            dy = 0;
            dist = 1;
        }
        const overlap = rr - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        return {
            x: x + nx * overlap,
            y: y + ny * overlap,
            corrected: true
        };
    }

    function drawBackground() {
        const bg1 = themeVar('--bg-1', '#0b0f1e');
        const bg2 = themeVar('--bg-2', '#121a2b');
        const accentRgb = themeVar('--accent-rgb', '48, 215, 255');
        ctx.save();
        const gradient = ctx.createLinearGradient(0, 0, state.view.width, state.view.height);
        gradient.addColorStop(0, bg1);
        gradient.addColorStop(1, bg2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, state.view.width, state.view.height);

        const grid = 140;
        const start = screenToWorld(0, 0);
        const end = screenToWorld(state.view.width, state.view.height);
        const startX = Math.floor(start.x / grid) * grid;
        const endX = Math.ceil(end.x / grid) * grid;
        const startY = Math.floor(start.y / grid) * grid;
        const endY = Math.ceil(end.y / grid) * grid;

        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
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

        const centerGlow = worldToScreen(state.zone.x, state.zone.y);
        const glow = ctx.createRadialGradient(centerGlow.x, centerGlow.y, 40, centerGlow.x, centerGlow.y, Math.max(700, state.zone.radius * 0.35));
        glow.addColorStop(0, 'rgba(' + accentRgb + ', 0.12)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, state.view.width, state.view.height);

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
        const accentRgb = themeVar('--accent-rgb', '48, 215, 255');
        const borderRgb = themeVar('--card-border-rgb', '46, 204, 113');
        const baseColor = state.contested ? 'rgba(241,196,15,0.9)' : 'rgba(' + accentRgb + ',0.9)';
        const fillColor = state.contested ? 'rgba(241,196,15,0.16)' : 'rgba(' + borderRgb + ',0.14)';

        ctx.save();
        const fillGrad = ctx.createRadialGradient(zoneScreen.x, zoneScreen.y, coreRadius * 0.2, zoneScreen.x, zoneScreen.y, radius);
        fillGrad.addColorStop(0, fillColor);
        fillGrad.addColorStop(1, 'rgba(0,0,0,0)');
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

        if (state.debug.zone) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 96, 96, 0.65)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(zoneScreen.x, zoneScreen.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = '12px Rajdhani, sans-serif';
            ctx.fillText('R:' + Math.round(radius), zoneScreen.x + 8, zoneScreen.y - 8);
            ctx.restore();
        }
    }

    function drawObstacles() {
        const entries = Object.values(state.obstacles || {});
        if (!entries.length) return;
        entries.forEach((obs) => {
            const radius = Number(obs.radius || 40);
            const screen = worldToScreen(Number(obs.x || 0), Number(obs.y || 0));
            if (screen.x < -radius - 20 || screen.x > state.view.width + radius + 20 || screen.y < -radius - 20 || screen.y > state.view.height + radius + 20) {
                return;
            }
            const type = String(obs.type || 'rock');
            let fill = 'rgba(92, 104, 122, 0.7)';
            if (type === 'crate') fill = 'rgba(124, 92, 59, 0.78)';
            if (type === 'pillar') fill = 'rgba(82, 98, 122, 0.78)';
            if (type === 'wall') fill = 'rgba(78, 84, 97, 0.78)';

            ctx.save();
            ctx.fillStyle = fill;
            ctx.strokeStyle = 'rgba(255,255,255,0.24)';
            ctx.lineWidth = 2;
            if (type === 'wall') {
                const w = radius * 2.2;
                const h = radius * 0.95;
                ctx.fillRect(screen.x - w / 2, screen.y - h / 2, w, h);
                ctx.strokeRect(screen.x - w / 2, screen.y - h / 2, w, h);
            } else if (type === 'crate') {
                const side = radius * 1.9;
                ctx.fillRect(screen.x - side / 2, screen.y - side / 2, side, side);
                ctx.strokeRect(screen.x - side / 2, screen.y - side / 2, side, side);
            } else {
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            if (obs.destructible) {
                ctx.fillStyle = 'rgba(255,236,199,0.9)';
                ctx.font = '12px Rajdhani, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(obs.hp || 0), screen.x, screen.y);
            }
            if (state.debug.hitboxes || state.debug.obstacles) {
                ctx.strokeStyle = 'rgba(255, 80, 80, 0.55)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    function drawPowerups(time) {
        const entries = Object.values(state.powerups || {});
        if (!entries.length) return;
        entries.forEach((powerup) => {
            const radius = Number(powerup.radius || 16);
            const screen = worldToScreen(Number(powerup.x || 0), Number(powerup.y || 0));
            if (screen.x < -radius - 20 || screen.x > state.view.width + radius + 20 || screen.y < -radius - 20 || screen.y > state.view.height + radius + 20) {
                return;
            }
            const visual = POWERUP_VISUALS[powerup.type] || { color: '#ffffff', label: '?' };
            const spawnedAt = Number(powerup.spawnedAt || powerup.spawned_at || 0);
            const pulse = 1 + Math.sin((time + spawnedAt * 20) / 200) * 0.15;
            const drawRadius = radius * pulse;
            ctx.save();
            const grad = ctx.createRadialGradient(screen.x, screen.y, 2, screen.x, screen.y, drawRadius + 10);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.35, visual.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, drawRadius + 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = visual.color;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, drawRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0b0f1e';
            ctx.font = 'bold 11px Rajdhani, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const symbol = (visual.label || '?').charAt(0).toUpperCase();
            ctx.fillText(symbol, screen.x, screen.y);
            ctx.restore();
        });
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

        Object.values(state.obstacles || {}).forEach((obs) => {
            ctx.fillStyle = 'rgba(170, 180, 200, 0.7)';
            ctx.beginPath();
            ctx.arc(x + obs.x * scaleX, y + obs.y * scaleY, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        Object.values(state.powerups || {}).forEach((powerup) => {
            const visual = POWERUP_VISUALS[powerup.type] || { color: '#fff' };
            ctx.fillStyle = visual.color;
            ctx.beginPath();
            ctx.arc(x + powerup.x * scaleX, y + powerup.y * scaleY, 2.2, 0, Math.PI * 2);
            ctx.fill();
        });

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
        const drawCircleBullet = (bullet) => {
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

        const drawServerProjectile = (projectile) => {
            const screen = worldToScreen(projectile.x, projectile.y);
            if (screen.x < -60 || screen.x > state.view.width + 60 || screen.y < -60 || screen.y > state.view.height + 60) {
                return;
            }
            const shape = projectile.shape || getWeaponVisual(projectile.weaponType).shape;
            const radius = projectile.size || getWeaponVisual(projectile.weaponType).size;
            const angle = Math.atan2(projectile.vy || 0, projectile.vx || 1);

            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(angle);
            ctx.shadowBlur = 14;
            ctx.shadowColor = projectile.color || '#ffffff';
            ctx.fillStyle = projectile.color || '#ffffff';
            ctx.strokeStyle = 'rgba(255,255,255,0.72)';
            ctx.lineWidth = 1.2;

            if (shape === 'arrow') {
                ctx.beginPath();
                ctx.moveTo(radius * 1.8, 0);
                ctx.lineTo(-radius * 1.2, radius * 0.78);
                ctx.lineTo(-radius * 0.55, 0);
                ctx.lineTo(-radius * 1.2, -radius * 0.78);
                ctx.closePath();
                ctx.fill();
            } else if (shape === 'axe') {
                ctx.fillRect(-radius * 1.1, -radius * 0.26, radius * 1.2, radius * 0.52);
                ctx.beginPath();
                ctx.moveTo(radius * 0.2, -radius);
                ctx.lineTo(radius * 1.35, -radius * 0.55);
                ctx.lineTo(radius * 1.35, radius * 0.55);
                ctx.lineTo(radius * 0.2, radius);
                ctx.closePath();
                ctx.fill();
            } else {
                const orbGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, radius + 4);
                orbGrad.addColorStop(0, '#ffffff');
                orbGrad.addColorStop(0.35, projectile.color || '#ffffff');
                orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = orbGrad;
                ctx.beginPath();
                ctx.arc(0, 0, radius + (shape === 'orb' ? 1.5 : 0), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            if (state.debug.hitboxes) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 80, 80, 0.55)';
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        };

        Object.values(state.projectiles).forEach(drawServerProjectile);
        if (state.offline) {
            state.playerBullets.forEach(drawCircleBullet);
            state.foreignBullets.forEach(drawCircleBullet);
        }
    }

    function drawDamageIndicator(now) {
        if (!state.damageIndicator.until || now > state.damageIndicator.until) return;
        const remaining = clamp((state.damageIndicator.until - now) / 900, 0, 1);
        const alpha = remaining * 0.65 * Math.max(0.4, state.damageIndicator.strength || 0.8);
        const angle = state.damageIndicator.angle || 0;
        const cx = state.view.width / 2;
        const cy = state.view.height / 2;
        const radius = Math.min(state.view.width, state.view.height) * 0.42;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(255, 70, 85, ' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(radius - 12, 0);
        ctx.lineTo(radius - 80, -26);
        ctx.lineTo(radius - 80, 26);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawVisionPings(now) {
        if (!state.visionPing.until || now > state.visionPing.until) return;
        const ttl = clamp((state.visionPing.until - now) / 3500, 0, 1);
        state.visionPing.reveals.forEach((reveal) => {
            const screen = worldToScreen(Number(reveal.x || 0), Number(reveal.y || 0));
            if (screen.x < -40 || screen.x > state.view.width + 40 || screen.y < -40 || screen.y > state.view.height + 40) return;
            const base = 20 + (1 - ttl) * 34;
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 93, 131, ' + (0.42 * ttl).toFixed(3) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, base, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 180, 208, ' + (0.55 * ttl).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
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
        state.nextShrinkIn = Math.max(0, (state.nextShrinkIn || 0) - dt);
        setUI('nextShrink', formatTime(Math.max(0, Math.floor(state.nextShrinkIn || 0))));

        movePlayer(dt);

        updateCamera();
        const localOutside = !isInsideZone(state.player.x, state.player.y);
        if (state.offline && localOutside !== state.player.outside) {
            state.player.outside = localOutside;
            updateStormMeter();
        }

        if (state.offline) {
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
        drawObstacles();
        drawPowerups(now);

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

        drawVisionPings(now);
        drawBullets();
        drawAimIndicator();
        drawDirectionalArrow();
        drawDamageIndicator(now);
        drawMiniMap();
        drawVignette();
        if (state.fx.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255, 66, 79, ' + (state.fx.hitFlash * 0.18).toFixed(3) + ')';
            ctx.fillRect(0, 0, state.view.width, state.view.height);
        }
        ctx.restore();

        if (state.offline) {
            moveBullets();
            checkBulletHits();
        }

        if (socket && state.connected && state.joined && now - lastMoveSentAt > 60) {
            lastMoveSentAt = now;
            socket.emit('koz_move', { x: state.player.x, y: state.player.y, inZone: !state.player.outside });
        }

        if (state.offline) {
            updateLocalControl(dt);
        }

        state.fx.pulse = Math.max(0, state.fx.pulse - 0.02);
        state.fx.shake = Math.max(0, state.fx.shake - 0.02);
        state.fx.hitFlash = Math.max(0, state.fx.hitFlash - 0.03);

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

        Object.values(state.obstacles || {}).forEach((obs) => {
            const next = resolveCircleObstacleCollision(state.player.x, state.player.y, state.player.radius, obs);
            if (next.corrected) {
                state.player.x = next.x;
                state.player.y = next.y;
            }
        });
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
        const weaponType = resolveWeaponType(character, state.player.weaponType);
        const visual = getWeaponVisual(weaponType);
        const isWizard = weaponType === 'arcane-orb';
        const isArcher = weaponType === 'piercing-arrow';
        const color = fromRemote ? getColor(shooter || 'enemy') : '#ffffff';
        return {
            x,
            y,
            dx,
            dy,
            size: visual.size || (isWizard ? 9 : 7),
            speed: BULLET_SPEED,
            life: 0,
            maxLife: BULLET_MAX_LIFE,
            color: isWizard ? '#ff3b30' : (visual.color || color),
            glow: isWizard ? '#ff6b6b' : (visual.glow || color),
            isFireball: isWizard,
            homing: isArcher,
            shape: visual.shape,
            weaponType,
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
        const weaponType = resolveWeaponType(state.player.character, state.player.weaponType);
        state.player.weaponType = weaponType;

        const isWizard = weaponType === 'arcane-orb';
        const isArcher = weaponType === 'piercing-arrow';
        const shots = isWizard ? [-0.12, 0.12] : [0];
        const targetId = isArcher ? getNearestTargetId() : null;

        if (state.offline) {
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
        }

        if (state.offline) {
            state.player.bullets -= 1;
            scheduleBulletSave();
        }
        updateStatus();

        if (socket && socket.connected && !state.offline) {
            socket.emit('koz_shoot', {
                aimX: state.mouse.inCanvas ? state.mouse.worldX : (state.player.x + Math.cos(shotAngle) * 1200),
                aimY: state.mouse.inCanvas ? state.mouse.worldY : (state.player.y + Math.sin(shotAngle) * 1200),
                character: state.player.character,
                weapon_type: weaponType,
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
            if (e.code === 'F6') {
                e.preventDefault();
                state.debug.hitboxes = !state.debug.hitboxes;
                showZoneEvent('Debug hitboxes ' + (state.debug.hitboxes ? 'on' : 'off'));
                return;
            }
            if (e.code === 'F7') {
                e.preventDefault();
                state.debug.zone = !state.debug.zone;
                showZoneEvent('Debug zone bounds ' + (state.debug.zone ? 'on' : 'off'));
                return;
            }
            if (e.code === 'F8') {
                e.preventDefault();
                state.debug.obstacles = !state.debug.obstacles;
                showZoneEvent('Debug obstacle bounds ' + (state.debug.obstacles ? 'on' : 'off'));
                return;
            }
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
