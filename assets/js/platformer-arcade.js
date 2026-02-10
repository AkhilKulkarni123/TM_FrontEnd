(function () {
    'use strict';

    const IS_LOCAL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const GAME_API_BASE = IS_LOCAL ? 'http://localhost:8306' : 'https://snakes.opencodingsociety.com';
    const GAME_API_ROOT = GAME_API_BASE + '/api';

    const canvas = document.getElementById('pfCanvas');
    const ctx = canvas.getContext('2d');

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

    const LEVELS = [
        {
            name: 'Neon Dock',
            subtitle: 'Warm up on short hops before the deep run.',
            world: { width: 2480, height: 900 },
            spawn: { x: 82, yOffset: 160 },
            palette: {
                top: '#0b1126',
                bottom: '#05060e',
                grid: 'rgba(255,255,255,0.04)',
                platformFill: '#141c30',
                platformStroke: 'rgba(48,215,255,0.35)',
                movingFill: '#1e2b44',
                movingStroke: 'rgba(131,255,236,0.65)',
                hazard: 'rgba(255, 90, 114, 0.9)'
            },
            build(groundY) {
                return {
                    platforms: [
                        { x: 0, y: groundY, w: 520, h: 80 },
                        { x: 230, y: groundY - 140, w: 220, h: 24 },
                        { x: 550, y: groundY - 240, w: 180, h: 24 },
                        { x: 820, y: groundY - 180, w: 200, h: 24 },
                        { x: 1080, y: groundY - 300, w: 190, h: 24 },
                        { x: 1360, y: groundY - 230, w: 210, h: 24 },
                        { x: 1630, y: groundY - 130, w: 220, h: 24 },
                        { x: 1900, y: groundY - 220, w: 210, h: 24 },
                        { x: 2160, y: groundY - 340, w: 170, h: 24 }
                    ],
                    hazards: [
                        { type: 'spike', x: 1415, y: groundY - 246, w: 82, h: 16 },
                        { type: 'orb', x: 1750, y: groundY - 178, r: 16, move: { axis: 'x', range: 64, speed: 1.9, phase: 0.4 } }
                    ]
                };
            }
        },
        {
            name: 'Reactor Tunnels',
            subtitle: 'Lifts drift while vents flare underneath.',
            world: { width: 3000, height: 940 },
            spawn: { x: 82, yOffset: 160 },
            palette: {
                top: '#101629',
                bottom: '#060914',
                grid: 'rgba(137,196,255,0.06)',
                platformFill: '#1a2138',
                platformStroke: 'rgba(143,179,255,0.45)',
                movingFill: '#1f3048',
                movingStroke: 'rgba(165, 255, 232, 0.72)',
                hazard: 'rgba(255, 115, 71, 0.92)'
            },
            build(groundY) {
                return {
                    platforms: [
                        { x: 0, y: groundY, w: 430, h: 80 },
                        { x: 500, y: groundY - 140, w: 160, h: 24, move: { axis: 'y', range: 72, speed: 1.6, phase: 0.2 } },
                        { x: 760, y: groundY - 250, w: 170, h: 24 },
                        { x: 1030, y: groundY - 320, w: 170, h: 24, move: { axis: 'x', range: 112, speed: 1.45, phase: 1.3 } },
                        { x: 1325, y: groundY - 210, w: 140, h: 24 },
                        { x: 1540, y: groundY - 320, w: 180, h: 24 },
                        { x: 1810, y: groundY - 420, w: 150, h: 24, move: { axis: 'y', range: 96, speed: 1.85, phase: 2.1 } },
                        { x: 2060, y: groundY - 280, w: 170, h: 24 },
                        { x: 2330, y: groundY - 380, w: 150, h: 24 },
                        { x: 2590, y: groundY - 500, w: 190, h: 24 }
                    ],
                    hazards: [
                        { type: 'spike', x: 790, y: groundY - 266, w: 82, h: 16 },
                        { type: 'spike', x: 1600, y: groundY - 336, w: 78, h: 16 },
                        { type: 'spike', x: 2360, y: groundY - 396, w: 72, h: 16 },
                        { type: 'orb', x: 1210, y: groundY - 255, r: 17, move: { axis: 'y', range: 60, speed: 2.35, phase: 0.6 } },
                        { type: 'orb', x: 2140, y: groundY - 338, r: 17, move: { axis: 'x', range: 92, speed: 2.05, phase: 1.8 } }
                    ]
                };
            }
        },
        {
            name: 'Skybridge Ruins',
            subtitle: 'Narrow ledges with roaming sentry orbs.',
            world: { width: 3500, height: 980 },
            spawn: { x: 82, yOffset: 160 },
            palette: {
                top: '#0e1423',
                bottom: '#04070f',
                grid: 'rgba(201,220,255,0.06)',
                platformFill: '#19253b',
                platformStroke: 'rgba(100,170,255,0.5)',
                movingFill: '#22314c',
                movingStroke: 'rgba(173, 255, 244, 0.74)',
                hazard: 'rgba(255, 98, 124, 0.94)'
            },
            build(groundY) {
                return {
                    platforms: [
                        { x: 0, y: groundY, w: 360, h: 80 },
                        { x: 470, y: groundY - 130, w: 120, h: 24 },
                        { x: 650, y: groundY - 230, w: 120, h: 24 },
                        { x: 860, y: groundY - 320, w: 130, h: 24, move: { axis: 'x', range: 140, speed: 1.8, phase: 0.8 } },
                        { x: 1110, y: groundY - 200, w: 110, h: 24 },
                        { x: 1310, y: groundY - 340, w: 130, h: 24, move: { axis: 'y', range: 120, speed: 1.95, phase: 1.9 } },
                        { x: 1570, y: groundY - 450, w: 120, h: 24 },
                        { x: 1770, y: groundY - 320, w: 110, h: 24 },
                        { x: 1970, y: groundY - 410, w: 130, h: 24, move: { axis: 'x', range: 130, speed: 2.1, phase: 0.2 } },
                        { x: 2245, y: groundY - 520, w: 120, h: 24 },
                        { x: 2475, y: groundY - 380, w: 130, h: 24 },
                        { x: 2700, y: groundY - 500, w: 120, h: 24, move: { axis: 'y', range: 96, speed: 2.2, phase: 2.6 } },
                        { x: 2960, y: groundY - 610, w: 170, h: 24 }
                    ],
                    hazards: [
                        { type: 'spike', x: 686, y: groundY - 246, w: 48, h: 16 },
                        { type: 'spike', x: 1598, y: groundY - 466, w: 64, h: 16 },
                        { type: 'spike', x: 2266, y: groundY - 536, w: 78, h: 16 },
                        { type: 'orb', x: 1010, y: groundY - 252, r: 18, move: { axis: 'y', range: 70, speed: 2.4, phase: 0.6 } },
                        { type: 'orb', x: 1860, y: groundY - 380, r: 18, move: { axis: 'x', range: 102, speed: 2.15, phase: 1.5 } },
                        { type: 'orb', x: 2560, y: groundY - 470, r: 18, move: { axis: 'y', range: 86, speed: 2.5, phase: 2.3 } }
                    ]
                };
            }
        },
        {
            name: 'Void Circuit',
            subtitle: 'Final ascent through chaotic moving gates.',
            world: { width: 4100, height: 1040 },
            spawn: { x: 82, yOffset: 160 },
            palette: {
                top: '#140f28',
                bottom: '#070713',
                grid: 'rgba(219,198,255,0.07)',
                platformFill: '#231f3d',
                platformStroke: 'rgba(174,143,255,0.55)',
                movingFill: '#2b2a4a',
                movingStroke: 'rgba(198, 255, 243, 0.76)',
                hazard: 'rgba(255, 88, 122, 0.96)'
            },
            build(groundY) {
                return {
                    platforms: [
                        { x: 0, y: groundY, w: 350, h: 80 },
                        { x: 420, y: groundY - 140, w: 120, h: 24, move: { axis: 'y', range: 110, speed: 2.2, phase: 0.7 } },
                        { x: 620, y: groundY - 270, w: 120, h: 24, move: { axis: 'x', range: 150, speed: 2.3, phase: 0.1 } },
                        { x: 910, y: groundY - 200, w: 100, h: 24 },
                        { x: 1060, y: groundY - 350, w: 110, h: 24, move: { axis: 'y', range: 130, speed: 2.55, phase: 1.9 } },
                        { x: 1300, y: groundY - 480, w: 120, h: 24 },
                        { x: 1540, y: groundY - 360, w: 120, h: 24, move: { axis: 'x', range: 150, speed: 2.4, phase: 0.4 } },
                        { x: 1820, y: groundY - 510, w: 110, h: 24 },
                        { x: 2010, y: groundY - 640, w: 120, h: 24, move: { axis: 'y', range: 130, speed: 2.65, phase: 2.2 } },
                        { x: 2260, y: groundY - 500, w: 115, h: 24 },
                        { x: 2470, y: groundY - 600, w: 120, h: 24, move: { axis: 'x', range: 140, speed: 2.5, phase: 1.2 } },
                        { x: 2745, y: groundY - 710, w: 115, h: 24 },
                        { x: 2970, y: groundY - 580, w: 120, h: 24, move: { axis: 'y', range: 130, speed: 2.8, phase: 0.9 } },
                        { x: 3220, y: groundY - 730, w: 125, h: 24 },
                        { x: 3520, y: groundY - 850, w: 220, h: 24 }
                    ],
                    hazards: [
                        { type: 'spike', x: 930, y: groundY - 216, w: 60, h: 16 },
                        { type: 'spike', x: 1328, y: groundY - 496, w: 68, h: 16 },
                        { type: 'spike', x: 1840, y: groundY - 526, w: 70, h: 16 },
                        { type: 'spike', x: 2278, y: groundY - 516, w: 78, h: 16 },
                        { type: 'spike', x: 2765, y: groundY - 726, w: 75, h: 16 },
                        { type: 'spike', x: 3240, y: groundY - 746, w: 84, h: 16 },
                        { type: 'orb', x: 980, y: groundY - 300, r: 19, move: { axis: 'y', range: 88, speed: 2.6, phase: 0.4 } },
                        { type: 'orb', x: 1700, y: groundY - 430, r: 19, move: { axis: 'x', range: 122, speed: 2.35, phase: 1.2 } },
                        { type: 'orb', x: 2130, y: groundY - 560, r: 19, move: { axis: 'y', range: 98, speed: 2.9, phase: 1.8 } },
                        { type: 'orb', x: 2590, y: groundY - 670, r: 19, move: { axis: 'x', range: 130, speed: 2.7, phase: 2.2 } },
                        { type: 'orb', x: 3090, y: groundY - 650, r: 19, move: { axis: 'y', range: 112, speed: 2.8, phase: 2.9 } },
                        { type: 'orb', x: 3370, y: groundY - 790, r: 19, move: { axis: 'x', range: 90, speed: 2.45, phase: 0.7 } }
                    ]
                };
            }
        }
    ];

    const HAZARD_TUNING = Object.freeze({
        playerInsetX: 8,
        playerInsetTop: 6,
        playerInsetBottom: 8,
        spikeInsetRatio: 0.16,
        spikeInsetMin: 6,
        spikeTopLethalRatio: 0.68,
        orbRadiusScale: 0.82
    });

    const state = {
        ready: false,
        won: false,
        levelIndex: 0,
        death: { active: false, start: 0, cause: '', originX: 0, originY: 0, spin: 0, particles: [] },
        transition: { active: false, timer: 0, duration: 1.8, nextLevel: 0, switched: false },
        keys: {},
        jumpBuffer: 0,
        view: { width: 0, height: 0, dpr: 1 },
        world: { width: LEVELS[0].world.width, height: LEVELS[0].world.height },
        camera: { x: 0, y: 0 },
        spawn: { x: LEVELS[0].spawn.x, y: 0 },
        goal: { x: 0, y: 0, w: 66, h: 132 },
        bonusBullets: 25,
        player: {
            username: 'Player',
            character: 'knight',
            bullets: 0,
            x: 80,
            y: 0,
            w: 48,
            h: 64,
            vx: 0,
            vy: 0,
            onGround: false
        },
        platforms: [],
        hazards: []
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        state.view.width = width;
        state.view.height = height;
        state.view.dpr = dpr;
    }

    function updateHud() {
        const nameEl = document.getElementById('playerName');
        const bulletsEl = document.getElementById('bulletCount');
        if (nameEl) nameEl.textContent = state.player.username;
        if (bulletsEl) bulletsEl.textContent = state.player.bullets;
    }

    function isDemoMode() {
        try {
            return sessionStorage.getItem('snakes_demo_mode') === '1';
        } catch (e) {
            return false;
        }
    }

    function isGuestSession() {
        try {
            return sessionStorage.getItem('snakes_isGuest') === '1';
        } catch (e) {
            return false;
        }
    }

    function loadDemoProgress() {
        try {
            const stored = sessionStorage.getItem('snakes_demo_progress');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return null;
    }

    function loadGuestProgress() {
        try {
            const stored = sessionStorage.getItem('snakes_guest_progress');
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return null;
    }

    async function loadPlayerData() {
        try {
            if (isGuestSession()) {
                state.player.username = sessionStorage.getItem('snakes_guest_name') || 'Guest';
                state.player.character = sessionStorage.getItem('snakes_selected_character') || 'knight';
                const guestData = loadGuestProgress();
                if (guestData && typeof guestData.bullets !== 'undefined') {
                    state.player.bullets = Number(guestData.bullets || 0);
                }
                updateHud();
                return;
            }
        } catch (e) {}

        try {
            const userRes = await fetch(GAME_API_ROOT.replace('/api', '') + '/api/id', { credentials: 'include' });
            if (userRes.ok) {
                const userData = await userRes.json();
                if (userData && userData.name) state.player.username = userData.name;
            }
            const gameRes = await fetch(GAME_API_ROOT + '/snakes/', { credentials: 'include' });
            if (gameRes.ok) {
                const gameData = await gameRes.json();
                if (gameData && gameData.selected_character) state.player.character = gameData.selected_character;
                if (typeof gameData.total_bullets !== 'undefined') {
                    const fetched = Number(gameData.total_bullets || 0);
                    if (Number.isFinite(fetched)) state.player.bullets = fetched;
                }
            }
        } catch (e) {}

        if (isDemoMode()) {
            const demoData = loadDemoProgress();
            if (demoData) {
                if (demoData.character) state.player.character = demoData.character;
                if (typeof demoData.bullets !== 'undefined') {
                    state.player.bullets = Number(demoData.bullets || 0);
                }
            }
            if (state.player.username === 'Player') {
                state.player.username = 'Guest_' + Math.floor(Math.random() * 1000);
            }
        }

        updateHud();
    }

    function saveBullets(newTotal) {
        state.player.bullets = newTotal;
        updateHud();

        if (isDemoMode()) {
            try {
                const stored = sessionStorage.getItem('snakes_demo_progress');
                const demoData = stored ? JSON.parse(stored) : {};
                demoData.bullets = newTotal;
                demoData.character = state.player.character;
                sessionStorage.setItem('snakes_demo_progress', JSON.stringify(demoData));
            } catch (e) {}
            return;
        }

        if (isGuestSession()) {
            try {
                const stored = sessionStorage.getItem('snakes_guest_progress');
                const guestData = stored ? JSON.parse(stored) : {};
                guestData.bullets = newTotal;
                sessionStorage.setItem('snakes_guest_progress', JSON.stringify(guestData));
            } catch (e) {}
            return;
        }

        fetch(`${GAME_API_ROOT}/snakes/`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total_bullets: Math.max(0, newTotal) })
        }).catch(() => {});
    }

    function getCurrentLevel() {
        return LEVELS[state.levelIndex] || LEVELS[0];
    }

    function updateLevelHud() {
        const level = getCurrentLevel();
        const checkpoint = document.getElementById('checkpointLabel');
        if (checkpoint) checkpoint.textContent = `L${state.levelIndex + 1}/${LEVELS.length} ${level.name}`;

        const bonus = document.getElementById('bonusLabel');
        if (bonus) bonus.textContent = `+${state.bonusBullets} bullets`;

        const controlsHint = document.getElementById('controlsHint');
        if (controlsHint) controlsHint.textContent = 'Move: A/D or Left/Right • Jump: W or Up Arrow';

        const goalTitle = document.querySelector('.goal-banner h3');
        const goalText = document.querySelector('.goal-banner p');
        if (goalTitle) {
            goalTitle.textContent = state.levelIndex === LEVELS.length - 1
                ? 'Final Gate'
                : `Portal ${state.levelIndex + 1} → ${state.levelIndex + 2}`;
        }
        if (goalText) {
            goalText.textContent = state.levelIndex === LEVELS.length - 1
                ? 'Last sector. Break through this portal to finish the gauntlet.'
                : `Reach the portal to warp into ${LEVELS[state.levelIndex + 1].name}.`;
        }
    }

    function spawnAtLevelStart() {
        state.death.active = false;
        state.death.cause = '';
        state.death.originX = 0;
        state.death.originY = 0;
        state.death.spin = 0;
        state.death.particles = [];
        state.player.x = state.spawn.x;
        state.player.y = state.spawn.y;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.onGround = false;
        state.jumpBuffer = 0;

        const maxX = Math.max(0, state.world.width - state.view.width);
        const maxY = Math.max(0, state.world.height - state.view.height);
        state.camera.x = clamp(state.player.x - state.view.width * 0.4, 0, maxX);
        state.camera.y = clamp(state.player.y - state.view.height * 0.6, 0, maxY);
    }

    function applyLevel(levelIndex) {
        const safeIndex = clamp(levelIndex, 0, LEVELS.length - 1);
        state.levelIndex = safeIndex;
        const level = getCurrentLevel();
        state.world.width = level.world.width;
        state.world.height = level.world.height;

        const groundY = state.world.height - 80;
        const layout = level.build(groundY);

        state.platforms = (layout.platforms || []).map((platform) => {
            const move = platform.move
                ? {
                    axis: platform.move.axis === 'y' ? 'y' : 'x',
                    range: Number(platform.move.range || 0),
                    speed: Number(platform.move.speed || 1),
                    phase: Number(platform.move.phase || 0)
                }
                : null;
            return {
                x: Number(platform.x || 0),
                y: Number(platform.y || 0),
                w: Number(platform.w || 0),
                h: Number(platform.h || 0),
                baseX: Number(platform.x || 0),
                baseY: Number(platform.y || 0),
                vx: 0,
                vy: 0,
                move: move
            };
        });

        state.hazards = (layout.hazards || []).map((hazard) => {
            const move = hazard.move
                ? {
                    axis: hazard.move.axis === 'y' ? 'y' : 'x',
                    range: Number(hazard.move.range || 0),
                    speed: Number(hazard.move.speed || 1),
                    phase: Number(hazard.move.phase || 0)
                }
                : null;
            return {
                type: hazard.type || 'spike',
                x: Number(hazard.x || 0),
                y: Number(hazard.y || 0),
                w: Number(hazard.w || 0),
                h: Number(hazard.h || 0),
                r: Number(hazard.r || 16),
                baseX: Number(hazard.x || 0),
                baseY: Number(hazard.y || 0),
                move: move
            };
        });

        state.spawn.x = Number(level.spawn.x || 80);
        state.spawn.y = state.world.height - Number(level.spawn.yOffset || 160);
        positionGoalOnLastPlatform();
        spawnAtLevelStart();
        updateLevelHud();
    }

    function resetRun() {
        state.won = false;
        state.transition.active = false;
        state.transition.timer = 0;
        state.transition.switched = false;
        applyLevel(state.levelIndex);
        const overlay = document.getElementById('winOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    function positionGoalOnLastPlatform() {
        if (!state.platforms.length) return;
        let lastPlatform = state.platforms[0];
        state.platforms.forEach((platform) => {
            if (platform.x > lastPlatform.x) lastPlatform = platform;
        });
        state.goal.x = lastPlatform.x + (lastPlatform.w - state.goal.w) / 2;
        state.goal.y = lastPlatform.y - state.goal.h;
    }

    function updateDynamicWorld(dt, now) {
        const t = now / 1000;
        const safeDt = dt || 0.016;

        state.platforms.forEach((platform) => {
            platform.vx = 0;
            platform.vy = 0;
            if (!platform.move) return;
            const prevX = platform.x;
            const prevY = platform.y;
            const offset = Math.sin(t * platform.move.speed + platform.move.phase) * platform.move.range;
            if (platform.move.axis === 'x') {
                platform.x = platform.baseX + offset;
            } else {
                platform.y = platform.baseY + offset;
            }
            platform.vx = (platform.x - prevX) / safeDt;
            platform.vy = (platform.y - prevY) / safeDt;
        });

        state.hazards.forEach((hazard) => {
            if (!hazard.move) return;
            const offset = Math.sin(t * hazard.move.speed + hazard.move.phase) * hazard.move.range;
            if (hazard.move.axis === 'x') {
                hazard.x = hazard.baseX + offset;
            } else {
                hazard.y = hazard.baseY + offset;
            }
        });
    }

    function updateCamera() {
        const maxX = Math.max(0, state.world.width - state.view.width);
        const maxY = Math.max(0, state.world.height - state.view.height);
        const targetX = clamp(state.player.x - state.view.width * 0.4, 0, maxX);
        const targetY = clamp(state.player.y - state.view.height * 0.6, 0, maxY);
        state.camera.x += (targetX - state.camera.x) * 0.1;
        state.camera.y += (targetY - state.camera.y) * 0.1;
    }

    function movePlayer(dt) {
        if (state.death.active) {
            if (state.death.cause === 'spike' || state.death.cause === 'orb') {
                state.player.vx = 0;
                state.player.vy = 0;
                return;
            }
            const gravity = 1600;
            state.player.vy += gravity * dt;
            state.player.y += state.player.vy * dt;
            return;
        }
        if (state.transition.active || state.won) return;

        const accel = 1200;
        const maxSpeed = 320;
        const friction = 0.85;
        const gravity = 1400;
        const jumpVel = 730;

        const left = state.keys['a'] || state.keys['arrowleft'];
        const right = state.keys['d'] || state.keys['arrowright'];

        if (left) state.player.vx -= accel * dt;
        if (right) state.player.vx += accel * dt;
        if (!left && !right) state.player.vx *= friction;
        state.player.vx = clamp(state.player.vx, -maxSpeed, maxSpeed);

        state.player.vy += gravity * dt;

        let nextX = state.player.x + state.player.vx * dt;
        let nextY = state.player.y + state.player.vy * dt;

        // Prevent "snap-back" when landing on thin/moving bars:
        // if we're essentially above/below a platform, let Y-resolution handle it.
        const sideCollisionVerticalTolerance = 10;
        const rectX = { x: nextX, y: state.player.y, w: state.player.w, h: state.player.h };
        state.platforms.forEach((platform) => {
            if (!rectsOverlap(rectX, platform)) return;
            const playerTop = state.player.y;
            const playerBottom = state.player.y + state.player.h;
            const nearTopSurface = playerBottom <= platform.y + sideCollisionVerticalTolerance;
            const nearBottomSurface = playerTop >= platform.y + platform.h - sideCollisionVerticalTolerance;
            if (nearTopSurface || nearBottomSurface) {
                return;
            }
            if (state.player.vx > 0) {
                nextX = platform.x - state.player.w;
            } else if (state.player.vx < 0) {
                nextX = platform.x + platform.w;
            }
            state.player.vx = 0;
            rectX.x = nextX;
        });

        const rectY = { x: nextX, y: nextY, w: state.player.w, h: state.player.h };
        let landedPlatform = null;
        state.player.onGround = false;
        state.platforms.forEach((platform) => {
            if (!rectsOverlap(rectY, platform)) return;
            if (state.player.vy > 0) {
                const candidateY = platform.y - state.player.h;
                if (!state.player.onGround || candidateY < nextY) {
                    nextY = candidateY;
                    landedPlatform = platform;
                }
                state.player.onGround = true;
            } else if (state.player.vy < 0) {
                nextY = platform.y + platform.h;
            }
            state.player.vy = 0;
            rectY.y = nextY;
        });

        if (landedPlatform && landedPlatform.move) {
            nextX += landedPlatform.vx * dt;
            nextY += landedPlatform.vy * dt;
        }

        const maxX = Math.max(0, state.world.width - state.player.w);
        state.player.x = clamp(nextX, 0, maxX);
        state.player.y = clamp(nextY, 0, state.world.height + 300);

        if (state.player.onGround && state.jumpBuffer > 0) {
            state.player.vy = -jumpVel;
            state.player.onGround = false;
            state.jumpBuffer = 0;
        }
    }

    function rectsOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function circleRectOverlap(cx, cy, cr, rect) {
        const nearestX = clamp(cx, rect.x, rect.x + rect.w);
        const nearestY = clamp(cy, rect.y, rect.y + rect.h);
        const dx = cx - nearestX;
        const dy = cy - nearestY;
        return (dx * dx + dy * dy) <= (cr * cr);
    }

    function getPlayerHazardRect() {
        const insetX = HAZARD_TUNING.playerInsetX;
        const insetTop = HAZARD_TUNING.playerInsetTop;
        const insetBottom = HAZARD_TUNING.playerInsetBottom;
        return {
            x: state.player.x + insetX,
            y: state.player.y + insetTop,
            w: Math.max(14, state.player.w - insetX * 2),
            h: Math.max(18, state.player.h - insetTop - insetBottom)
        };
    }

    function getSpikeLethalRect(hazard) {
        const insetX = Math.max(HAZARD_TUNING.spikeInsetMin, hazard.w * HAZARD_TUNING.spikeInsetRatio);
        const lethalHeight = Math.max(6, hazard.h * HAZARD_TUNING.spikeTopLethalRatio);
        return {
            x: hazard.x + insetX,
            y: hazard.y + 1,
            w: Math.max(8, hazard.w - insetX * 2),
            h: lethalHeight
        };
    }

    function createDeathParticles(cause) {
        const spikePalette = ['#fff6fb', '#ffc2d1', '#ff6d97', '#ff9e7a'];
        const orbPalette = ['#ffffff', '#b5f4ff', '#7ac9ff', '#ff9cd4'];
        const colors = cause === 'orb' ? orbPalette : spikePalette;
        const count = cause === 'orb' ? 18 : 24;
        const particles = [];

        for (let i = 0; i < count; i += 1) {
            const angle = cause === 'spike'
                ? (-Math.PI / 2) + (Math.random() - 0.5) * 1.1 + (Math.random() < 0.22 ? Math.PI : 0)
                : Math.random() * Math.PI * 2;
            particles.push({
                angle: angle,
                speed: (cause === 'spike' ? 190 : 150) + Math.random() * 240,
                size: 4 + Math.random() * 7,
                life: 0.48 + Math.random() * 0.55,
                spin: (Math.random() - 0.5) * 11,
                alpha: 0.72 + Math.random() * 0.28,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
        return particles;
    }

    function startDeath(cause) {
        if (state.death.active || state.transition.active || state.won) return;
        state.death.active = true;
        state.death.cause = cause || 'hazard';
        state.death.start = performance.now();
        state.death.originX = state.player.x + state.player.w * 0.5;
        state.death.originY = state.player.y + state.player.h * 0.5;
        state.death.spin = (Math.random() - 0.5) * (state.death.cause === 'orb' ? 5.2 : 7.4);
        state.death.particles = (state.death.cause === 'spike' || state.death.cause === 'orb')
            ? createDeathParticles(state.death.cause)
            : [];

        if (state.death.cause === 'spike' || state.death.cause === 'orb') {
            state.player.vx = 0;
            state.player.vy = 0;
        } else {
            state.player.vx *= 0.25;
            state.player.vy = Math.max(220, state.player.vy);
        }
        if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
            window.SnakesSFX.play('hurt');
        }
    }

    function checkHazardDeath() {
        if (state.death.active || state.transition.active || state.won) return;
        const playerRect = getPlayerHazardRect();
        for (let i = 0; i < state.hazards.length; i += 1) {
            const hazard = state.hazards[i];
            if (hazard.type === 'orb') {
                if (circleRectOverlap(hazard.x, hazard.y, hazard.r * HAZARD_TUNING.orbRadiusScale, playerRect)) {
                    startDeath('orb');
                    return;
                }
                continue;
            }
            const spikeRect = getSpikeLethalRect(hazard);
            if (rectsOverlap(playerRect, spikeRect)) {
                startDeath('spike');
                return;
            }
        }
    }

    function beginLevelTransition(nextLevel) {
        state.transition.active = true;
        state.transition.timer = 0;
        state.transition.duration = 1.8;
        state.transition.nextLevel = clamp(nextLevel, 0, LEVELS.length - 1);
        state.transition.switched = false;
        state.player.vx = 0;
        state.player.vy = 0;
        if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
            window.SnakesSFX.play('powerup');
        }
    }

    function updateLevelTransition(dt) {
        if (!state.transition.active) return;
        state.transition.timer += dt;
        const progress = state.transition.timer / state.transition.duration;
        if (!state.transition.switched && progress >= 0.5) {
            applyLevel(state.transition.nextLevel);
            state.transition.switched = true;
            if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('click');
            }
        }
        if (progress >= 1) {
            state.transition.active = false;
            state.transition.timer = 0;
            state.transition.switched = false;
        }
    }

    function drawBackground(now) {
        const level = getCurrentLevel();
        const grd = ctx.createLinearGradient(0, 0, 0, state.view.height);
        grd.addColorStop(0, level.palette.top);
        grd.addColorStop(1, level.palette.bottom);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, state.view.width, state.view.height);

        const orbTime = now * 0.00035;
        for (let i = 0; i < 4; i += 1) {
            const px = (state.view.width * (0.15 + i * 0.24)) + Math.sin(orbTime + i * 1.3) * 26;
            const py = (state.view.height * (0.2 + (i % 2) * 0.32)) + Math.cos(orbTime * 1.4 + i) * 30;
            const r = 90 + i * 12;
            const glow = ctx.createRadialGradient(px, py, 6, px, py, r);
            glow.addColorStop(0, 'rgba(144, 201, 255, 0.12)');
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(px - r, py - r, r * 2, r * 2);
        }

        ctx.strokeStyle = level.palette.grid;
        ctx.lineWidth = 1;
        const grid = 120;
        const startX = Math.floor(state.camera.x / grid) * grid;
        const endX = state.camera.x + state.view.width;
        for (let x = startX; x <= endX; x += grid) {
            ctx.beginPath();
            ctx.moveTo(x - state.camera.x, 0);
            ctx.lineTo(x - state.camera.x, state.view.height);
            ctx.stroke();
        }
    }

    function drawPlatforms() {
        const level = getCurrentLevel();
        state.platforms.forEach((platform) => {
            const x = platform.x - state.camera.x;
            const y = platform.y - state.camera.y;
            const isMoving = !!platform.move;
            ctx.fillStyle = isMoving ? level.palette.movingFill : level.palette.platformFill;
            ctx.fillRect(x, y, platform.w, platform.h);
            ctx.strokeStyle = isMoving ? level.palette.movingStroke : level.palette.platformStroke;
            ctx.lineWidth = isMoving ? 2.4 : 2;
            ctx.strokeRect(x, y, platform.w, platform.h);
        });
    }

    function drawSpikes() {
        const level = getCurrentLevel();
        const spikeY = state.world.height - 20 - state.camera.y;
        const spikeW = 28;
        const spikeH = 26;
        ctx.save();
        ctx.fillStyle = level.palette.hazard;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        for (let x = -state.camera.x; x < state.view.width + spikeW; x += spikeW) {
            ctx.beginPath();
            ctx.moveTo(x, spikeY + spikeH);
            ctx.lineTo(x + spikeW / 2, spikeY);
            ctx.lineTo(x + spikeW, spikeY + spikeH);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawHazards(now) {
        const level = getCurrentLevel();
        const t = now * 0.004;
        state.hazards.forEach((hazard) => {
            if (hazard.type === 'orb') {
                const x = hazard.x - state.camera.x;
                const y = hazard.y - state.camera.y;
                const r = hazard.r;
                if (x + r < -40 || x - r > state.view.width + 40 || y + r < -40 || y - r > state.view.height + 40) return;
                const pulse = 0.84 + Math.sin(t + hazard.baseX * 0.002) * 0.18;
                const glow = ctx.createRadialGradient(x, y, 3, x, y, r * 2.2);
                glow.addColorStop(0, 'rgba(255,255,255,0.95)');
                glow.addColorStop(0.35, 'rgba(255,130,150,0.85)');
                glow.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, r * 2.2 * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = level.palette.hazard;
                ctx.beginPath();
                ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
                ctx.fill();
                return;
            }

            const x = hazard.x - state.camera.x;
            const y = hazard.y - state.camera.y;
            if (x + hazard.w < -40 || x > state.view.width + 40 || y + hazard.h < -40 || y > state.view.height + 40) return;
            const spikeW = 18;
            const count = Math.max(1, Math.ceil(hazard.w / spikeW));
            ctx.save();
            ctx.fillStyle = level.palette.hazard;
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i < count; i += 1) {
                const sx = x + i * spikeW;
                ctx.beginPath();
                ctx.moveTo(sx, y + hazard.h);
                ctx.lineTo(sx + spikeW * 0.5, y);
                ctx.lineTo(sx + spikeW, y + hazard.h);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        });
    }

    function drawTransitionOverlay() {
        if (!state.transition.active) return;
        const progress = clamp(state.transition.timer / state.transition.duration, 0, 1);
        const nextLevel = LEVELS[state.transition.nextLevel] || getCurrentLevel();
        const midpoint = 1 - Math.abs(progress - 0.5) * 2;
        const alpha = 0.15 + Math.pow(midpoint, 0.7) * 0.78;
        const radius = Math.min(state.view.width, state.view.height) * (0.22 + progress * 0.55);

        ctx.save();
        ctx.fillStyle = `rgba(4, 6, 16, ${alpha.toFixed(3)})`;
        ctx.fillRect(0, 0, state.view.width, state.view.height);

        ctx.strokeStyle = `rgba(141, 246, 255, ${(0.28 + midpoint * 0.45).toFixed(3)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(state.view.width / 2, state.view.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();

        const textAlpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        ctx.fillStyle = `rgba(235, 245, 255, ${(0.25 + textAlpha * 0.7).toFixed(3)})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 28px Oxanium, sans-serif';
        ctx.fillText(`Warping to Level ${state.transition.nextLevel + 1}`, state.view.width / 2, state.view.height * 0.46);
        ctx.font = '600 18px Rajdhani, sans-serif';
        ctx.fillText(nextLevel.name, state.view.width / 2, state.view.height * 0.53);
        ctx.restore();
    }

    function drawRoundedRectPath(x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawGoal() {
        const gateX = state.goal.x - state.camera.x;
        const gateY = state.goal.y - state.camera.y;
        const gateW = state.goal.w;
        const gateH = state.goal.h;

        if (gateX + gateW < -120 || gateX > state.view.width + 120 || gateY + gateH < -120 || gateY > state.view.height + 120) {
            return;
        }

        const t = performance.now() * 0.004;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
        const centerX = gateX + gateW / 2;
        const centerY = gateY + gateH / 2;

        ctx.save();

        const aura = ctx.createRadialGradient(centerX, centerY, gateW * 0.2, centerX, centerY, gateH * 0.95);
        aura.addColorStop(0, `rgba(131, 255, 236, ${0.28 + pulse * 0.2})`);
        aura.addColorStop(0.55, 'rgba(68, 137, 255, 0.24)');
        aura.addColorStop(1, 'rgba(10, 16, 40, 0)');
        ctx.fillStyle = aura;
        ctx.fillRect(gateX - gateW, gateY - gateH * 0.55, gateW * 3, gateH * 2.2);

        const core = ctx.createLinearGradient(gateX, gateY, gateX + gateW, gateY + gateH);
        core.addColorStop(0, `rgba(45, 241, 226, ${0.2 + pulse * 0.1})`);
        core.addColorStop(0.45, `rgba(135, 120, 255, ${0.24 + pulse * 0.16})`);
        core.addColorStop(1, `rgba(33, 213, 255, ${0.2 + pulse * 0.1})`);
        drawRoundedRectPath(gateX, gateY, gateW, gateH, 16);
        ctx.fillStyle = core;
        ctx.fill();

        ctx.strokeStyle = '#71f7ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(113, 247, 255, 0.95)';
        ctx.shadowBlur = 18 + pulse * 14;
        drawRoundedRectPath(gateX, gateY, gateW, gateH, 16);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(80, 255, 230, ${0.22 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(centerX, gateY + gateH + 3, gateW * 0.65, 7 + pulse * 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(centerX, centerY);
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate(t * (0.7 + i * 0.28) + i);
            const arcWidth = gateW * (0.35 + i * 0.15);
            const arcHeight = gateH * (0.26 + i * 0.06);
            const alpha = Math.max(0.1, 0.28 - i * 0.06 + pulse * 0.08);
            ctx.strokeStyle = `rgba(143, 255, 243, ${alpha})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, arcWidth, arcHeight, 0, 0.2 + i * 1.5, 2.5 + i * 1.5);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    function drawPlayerSpriteAt(drawX, drawY, drawW, drawH) {
        const spriteImg = PLAYER_IMAGES[state.player.character];
        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth) {
            ctx.drawImage(spriteImg, drawX, drawY, drawW, drawH);
            return;
        }
        drawPixelSprite(drawX + drawW / 2, drawY + drawH / 2, state.player.h);
    }

    function drawHazardDeathAnimation(now) {
        if (!state.death.active) return false;
        const cause = state.death.cause;
        if (cause !== 'spike' && cause !== 'orb') return false;

        const elapsed = (now - state.death.start) / 1000;
        const progress = clamp(elapsed / 0.9, 0, 1);
        const centerX = state.death.originX - state.camera.x;
        const centerY = state.death.originY - state.camera.y;
        const drawW = state.player.w + 12;
        const drawH = state.player.h + 16;

        ctx.save();

        const ring = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 94 * (0.42 + progress * 0.82));
        if (cause === 'orb') {
            ring.addColorStop(0, `rgba(236, 255, 255, ${0.36 * (1 - progress)})`);
            ring.addColorStop(0.34, `rgba(126, 219, 255, ${0.42 * (1 - progress * 0.65)})`);
            ring.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            ring.addColorStop(0, `rgba(255, 240, 246, ${0.34 * (1 - progress)})`);
            ring.addColorStop(0.34, `rgba(255, 110, 149, ${0.44 * (1 - progress * 0.62)})`);
            ring.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 94 * (0.42 + progress * 0.82), 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(centerX, centerY);
        const spin = state.death.spin * progress + Math.sin(progress * Math.PI * 7) * 0.08;
        ctx.rotate(spin);
        ctx.scale(1 - progress * 0.34, 1 + progress * 0.08);
        ctx.globalAlpha = Math.max(0, 1 - progress * 1.2);
        drawPlayerSpriteAt(-drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        ctx.save();
        state.death.particles.forEach((particle) => {
            const lifeT = clamp(elapsed / particle.life, 0, 1);
            if (lifeT >= 1) return;
            const distance = particle.speed * elapsed * (1 - lifeT * 0.12);
            const driftX = Math.cos(particle.angle) * distance;
            const driftY = Math.sin(particle.angle) * distance + (cause === 'spike' ? 150 : 180) * elapsed * elapsed;
            const size = particle.size * (1 - lifeT);
            if (size < 0.8) return;
            ctx.save();
            ctx.translate(centerX + driftX, centerY + driftY);
            ctx.rotate(particle.spin * elapsed);
            ctx.globalAlpha = particle.alpha * (1 - lifeT);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-size * 0.5, -size * 0.8, size, size * 1.6);
            ctx.restore();
        });
        ctx.restore();

        return true;
    }

    function drawPlayer(now) {
        if (drawHazardDeathAnimation(now)) return;

        const screenX = state.player.x - state.camera.x;
        const screenY = state.player.y - state.camera.y;
        drawPlayerSpriteAt(screenX - 6, screenY - 8, state.player.w + 12, state.player.h + 16);
    }

    function drawPixelSprite(x, y, size) {
        const sprite = PLAYER_SPRITES[state.player.character] || PLAYER_SPRITES.knight;
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

    function completeRun() {
        if (state.won) return;
        state.won = true;
        const newTotal = state.player.bullets + state.bonusBullets;
        saveBullets(newTotal);
        if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
            window.SnakesSFX.play('win');
        }
        try {
            localStorage.setItem('snakes_win_mode', 'platformer');
            sessionStorage.setItem('snakes_just_won', 'true');
        } catch (e) {}
        const overlay = document.getElementById('winOverlay');
        if (overlay) overlay.classList.add('active');
        setTimeout(() => {
            window.location.href = 'victory.html?mode=platformer';
        }, 1400);
    }

    function checkWin() {
        if (state.won || state.death.active || state.transition.active) return;
        const gateRect = { x: state.goal.x + 4, y: state.goal.y + 8, w: state.goal.w - 8, h: state.goal.h - 10 };
        const playerRect = { x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h };
        if (!rectsOverlap(playerRect, gateRect)) return;

        if (state.levelIndex < LEVELS.length - 1) {
            beginLevelTransition(state.levelIndex + 1);
            return;
        }
        completeRun();
    }

    function checkFallDeath() {
        if (state.death.active || state.won || state.transition.active) return;
        if (state.player.y + state.player.h >= state.world.height - 20) {
            startDeath('floor');
            return;
        }
        if (state.player.y > state.world.height + 120) {
            startDeath('fall');
        }
    }

    function loop(last) {
        if (!state.ready) return;
        const now = performance.now();
        const dt = Math.min(0.03, Math.max(0.008, (now - (last || now)) / 1000));
        state.jumpBuffer = Math.max(0, state.jumpBuffer - dt);

        updateDynamicWorld(dt, now);
        movePlayer(dt);
        if (!state.transition.active) {
            checkHazardDeath();
            checkFallDeath();
            checkWin();
        }
        updateLevelTransition(dt);
        updateCamera();

        ctx.setTransform(state.view.dpr, 0, 0, state.view.dpr, 0, 0);
        ctx.clearRect(0, 0, state.view.width, state.view.height);
        drawBackground(now);
        drawPlatforms();
        drawSpikes();
        drawHazards(now);
        drawGoal();
        drawPlayer(now);
        drawTransitionOverlay();

        if (state.death.active) {
            const elapsed = now - state.death.start;
            if (elapsed > 900) {
                applyLevel(state.levelIndex);
            }
        }

        requestAnimationFrame(() => loop(now));
    }

    function bindInputs() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const wasDown = !!state.keys[key];
            state.keys[key] = true;

            if (e.code === 'Space') {
                e.preventDefault();
                return;
            }

            if (key === 'arrowup' || key === 'arrowleft' || key === 'arrowright') {
                e.preventDefault();
            }
            if ((key === 'arrowup' || key === 'w') && !wasDown) {
                state.jumpBuffer = 0.14;
            }
        });
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            delete state.keys[key];
        });
        window.addEventListener('blur', () => {
            state.keys = {};
            state.jumpBuffer = 0;
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                state.keys = {};
                state.jumpBuffer = 0;
            }
        });

        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) restartBtn.addEventListener('click', resetRun);
        const leaveBtn = document.getElementById('leaveBtn');
        if (leaveBtn) leaveBtn.addEventListener('click', () => {
            window.location.href = 'mode-selection.html';
        });
        const victoryBtn = document.getElementById('victoryBtn');
        if (victoryBtn) victoryBtn.addEventListener('click', () => {
            window.location.href = 'victory.html?mode=platformer';
        });
    }

    function init() {
        resizeCanvas();
        window.addEventListener('resize', () => {
            resizeCanvas();
            updateCamera();
        });
        bindInputs();
        loadPlayerData().then(() => {
            updateHud();
            applyLevel(0);
            state.ready = true;
            requestAnimationFrame(() => loop());
        });
    }

    init();
})();
