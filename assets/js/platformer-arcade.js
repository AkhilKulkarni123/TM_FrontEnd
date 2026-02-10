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

    const state = {
        ready: false,
        won: false,
        death: { active: false, start: 0 },
        keys: {},
        view: { width: 0, height: 0, dpr: 1 },
        world: { width: 2400, height: 900 },
        camera: { x: 0, y: 0 },
        goalX: 0,
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
        platforms: []
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

    function resetRun() {
        state.won = false;
        state.death.active = false;
        state.player.x = 80;
        state.player.y = state.world.height - 160;
        state.player.vx = 0;
        state.player.vy = 0;
        state.player.onGround = false;
        state.camera.x = 0;
        state.camera.y = 0;
        const overlay = document.getElementById('winOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    function buildPlatforms() {
        const groundY = state.world.height - 80;
        state.platforms = [
            { x: 0, y: groundY, w: 460, h: 80 },
            { x: 220, y: groundY - 140, w: 220, h: 24 },
            { x: 520, y: groundY - 240, w: 200, h: 24 },
            { x: 820, y: groundY - 180, w: 180, h: 24 },
            { x: 1040, y: groundY - 320, w: 220, h: 24 },
            { x: 1320, y: groundY - 220, w: 240, h: 24 },
            { x: 1620, y: groundY - 120, w: 220, h: 24 },
            { x: 1880, y: groundY - 200, w: 240, h: 24 },
            { x: 2080, y: groundY - 320, w: 170, h: 24 },
            { x: 2270, y: groundY - 420, w: 140, h: 24 }
        ];
        state.goalX = state.world.width - 120;
        resetRun();
    }

    function updateCamera() {
        const targetX = clamp(state.player.x - state.view.width * 0.4, 0, state.world.width - state.view.width);
        const targetY = clamp(state.player.y - state.view.height * 0.6, 0, state.world.height - state.view.height);
        state.camera.x += (targetX - state.camera.x) * 0.1;
        state.camera.y += (targetY - state.camera.y) * 0.1;
    }

    function movePlayer(dt) {
        if (state.death.active) {
            const gravity = 1600;
            state.player.vy += gravity * dt;
            state.player.y += state.player.vy * dt;
            return;
        }
        const accel = 1200;
        const maxSpeed = 320;
        const friction = 0.85;
        const gravity = 1400;
        const jumpVel = 720;

        const left = state.keys['a'] || state.keys['arrowleft'];
        const right = state.keys['d'] || state.keys['arrowright'];

        if (left) state.player.vx -= accel * dt;
        if (right) state.player.vx += accel * dt;
        if (!left && !right) state.player.vx *= friction;
        state.player.vx = clamp(state.player.vx, -maxSpeed, maxSpeed);

        state.player.vy += gravity * dt;

        let nextX = state.player.x + state.player.vx * dt;
        let nextY = state.player.y + state.player.vy * dt;

        // Horizontal collisions
        const rect = { x: nextX, y: state.player.y, w: state.player.w, h: state.player.h };
        state.platforms.forEach((p) => {
            if (!rectsOverlap(rect, p)) return;
            if (state.player.vx > 0) {
                nextX = p.x - state.player.w;
            } else if (state.player.vx < 0) {
                nextX = p.x + p.w;
            }
            state.player.vx = 0;
            rect.x = nextX;
        });

        // Vertical collisions
        const rectY = { x: nextX, y: nextY, w: state.player.w, h: state.player.h };
        state.player.onGround = false;
        state.platforms.forEach((p) => {
            if (!rectsOverlap(rectY, p)) return;
            if (state.player.vy > 0) {
                nextY = p.y - state.player.h;
                state.player.onGround = true;
            } else if (state.player.vy < 0) {
                nextY = p.y + p.h;
            }
            state.player.vy = 0;
            rectY.y = nextY;
        });

        state.player.x = clamp(nextX, 0, state.world.width - state.player.w);
        state.player.y = clamp(nextY, 0, state.world.height + 300);

        if (state.player.onGround && (state.keys[' '] || state.keys['space'])) {
            state.player.vy = -jumpVel;
            state.player.onGround = false;
        }
    }

    function rectsOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function drawBackground() {
        const grd = ctx.createLinearGradient(0, 0, 0, state.view.height);
        grd.addColorStop(0, '#0b1126');
        grd.addColorStop(1, '#05060e');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, state.view.width, state.view.height);

        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
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
        state.platforms.forEach((p) => {
            const x = p.x - state.camera.x;
            const y = p.y - state.camera.y;
            ctx.fillStyle = p.h > 40 ? '#1a1f33' : '#111826';
            ctx.fillRect(x, y, p.w, p.h);
            ctx.strokeStyle = 'rgba(48,215,255,0.35)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, p.w, p.h);
        });
    }

    function drawSpikes() {
        const spikeY = state.world.height - 20 - state.camera.y;
        const spikeW = 28;
        const spikeH = 26;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 77, 90, 0.85)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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

    function drawGoal() {
        const gateX = state.goalX - state.camera.x;
        const gateY = state.world.height - 500 - state.camera.y;
        ctx.save();
        ctx.strokeStyle = '#30d7ff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#30d7ff';
        ctx.strokeRect(gateX, gateY, 60, 140);
        ctx.fillStyle = 'rgba(48,215,255,0.15)';
        ctx.fillRect(gateX, gateY, 60, 140);
        ctx.restore();
    }

    function drawPlayer() {
        const screenX = state.player.x - state.camera.x;
        const screenY = state.player.y - state.camera.y;
        const spriteImg = PLAYER_IMAGES[state.player.character];
        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth) {
            ctx.drawImage(spriteImg, screenX - 6, screenY - 8, state.player.w + 12, state.player.h + 16);
            return;
        }
        drawPixelSprite(screenX + state.player.w / 2, screenY + state.player.h / 2, state.player.h);
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

    function checkWin() {
        if (state.won) return;
        if (state.death.active) return;
        const gateRect = { x: state.goalX, y: state.world.height - 210, w: 60, h: 140 };
        const playerRect = { x: state.player.x, y: state.player.y, w: state.player.w, h: state.player.h };
        if (rectsOverlap(playerRect, gateRect)) {
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
    }

    function checkFallDeath() {
        if (state.death.active || state.won) return;
        if (state.player.y > state.world.height + 120) {
            state.death.active = true;
            state.death.start = performance.now();
            state.player.vx = 0;
            state.player.vy = 200;
            if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
                window.SnakesSFX.play('hurt');
            }
        }
    }

    function loop(last) {
        if (!state.ready) return;
        const now = performance.now();
        const dt = Math.min(0.03, Math.max(0.008, (now - (last || now)) / 1000));

        movePlayer(dt);
        updateCamera();
        checkFallDeath();
        checkWin();

        ctx.setTransform(state.view.dpr, 0, 0, state.view.dpr, 0, 0);
        ctx.clearRect(0, 0, state.view.width, state.view.height);
        drawBackground();
        drawPlatforms();
        drawSpikes();
        drawGoal();
        drawPlayer();

        if (state.death.active) {
            const elapsed = now - state.death.start;
            if (elapsed > 900) {
                resetRun();
            }
        }

        requestAnimationFrame(() => loop(now));
    }

    function bindInputs() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            state.keys[key] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                state.keys[' '] = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            delete state.keys[key];
            if (e.code === 'Space') delete state.keys[' '];
        });
        window.addEventListener('blur', () => { state.keys = {}; });
        document.addEventListener('visibilitychange', () => { if (document.hidden) state.keys = {}; });

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
        window.addEventListener('resize', resizeCanvas);
        buildPlatforms();
        bindInputs();
        loadPlayerData().then(() => {
            updateHud();
            state.ready = true;
            requestAnimationFrame(() => loop());
        });
    }

    init();
})();
