/*
 * Snakes and Ladders - Lesson Arcade System
 * Complete file with all original features preserved + CSS FIX for mini-games
 * Location: /assets/js/lesson-arcade.js
 */

(function () {
    // ==========================================
    // INJECT CSS STYLES - UPDATED WITH FIX
    // ==========================================
    var css = `
/* ===================================
   Main Arcade Zone Container
   =================================== */

.arcade-zone, .lesson-arcade {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1.5rem;
    border-radius: 12px;
    margin: 1.5rem 0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: relative;
}

.arcade-zone.compact, .lesson-arcade.compact {
    padding: 1.2rem;
}

.arcade-zone.completed {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

/* ===================================
   Arcade Header
   =================================== */

.arcade-header {
    margin-bottom: 1rem;
}

.arcade-header h2 {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.arcade-header h2::before {
    content: '🎮';
}

.arcade-header p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    line-height: 1.4;
}

/* ===================================
   Arcade Grid - FIXED FOR ALL GAMES
   =================================== */

.arcade-grid {
    background: rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
    min-height: 450px;
    max-height: 650px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
}

.arcade-grid * {
    visibility: visible;
    opacity: 1;
}

/* Custom scrollbar for arcade grid */
.arcade-grid::-webkit-scrollbar {
    width: 8px;
}

.arcade-grid::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.arcade-grid::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
}

.arcade-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
}

/* ===================================
   Arcade Status Display
   =================================== */

.arcade-status {
    color: white;
    text-align: center;
    font-size: 1rem;
    margin-top: 1rem;
    font-weight: 500;
    padding: 0.5rem;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.arcade-status.complete {
    background: rgba(46, 204, 113, 0.3);
    color: #2ecc71;
    font-weight: bold;
    animation: successPulse 0.5s ease;
}

@keyframes successPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* ===================================
   Mini-Game Containers
   =================================== */

.arcade-grid .game-container {
    width: 100%;
    max-width: 700px;
    margin: 0 auto;
}

.arcade-grid canvas {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* ===================================
   Game UI Elements
   =================================== */

.arcade-grid .timer,
.arcade-grid .score,
.arcade-grid .lives {
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* ===================================
   Game Buttons
   =================================== */

.arcade-grid button {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.arcade-grid button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.arcade-grid button:active {
    transform: translateY(0);
}

.arcade-grid button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.arcade-retry-btn {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: inline-block;
}

.arcade-retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #5dade2, #3498db);
}

/* ===================================
   Legacy Game Modes
   =================================== */

.mode-orb .arcade-grid {
    display: grid;
    grid-template-columns: repeat(var(--arcade-grid-size, 5), 1fr);
    gap: 4px;
    padding: 1rem;
}

.arcade-cell {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all 0.2s ease;
}

.arcade-cell.player {
    background: rgba(52, 152, 219, 0.5);
    animation: playerPulse 1s infinite;
}

.arcade-cell.orb {
    background: radial-gradient(circle, rgba(241, 196, 15, 0.8) 0%, rgba(243, 156, 18, 0.4) 100%);
    animation: orbGlow 1.5s infinite;
}

@keyframes playerPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

@keyframes orbGlow {
    0%, 100% { box-shadow: 0 0 10px rgba(241, 196, 15, 0.5); }
    50% { box-shadow: 0 0 20px rgba(241, 196, 15, 1); }
}

.sequence-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.sequence-display {
    font-size: 2rem;
    color: white;
    text-align: center;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem 2rem;
    border-radius: 8px;
}

.sequence-input {
    font-size: 1.5rem;
    color: white;
    text-align: center;
    min-height: 40px;
}

.sequence-btn {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sequence-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(46, 204, 113, 0.4);
}

.tic-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-width: 300px;
    margin: 0 auto;
}

.tic-cell {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    font-size: 2rem;
    font-weight: bold;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tic-cell:hover:not(:disabled):not(.taken) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
}

.tic-cell.taken {
    cursor: not-allowed;
    background: rgba(52, 152, 219, 0.3);
}

.tic-cell:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.arcade-quiz {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.quiz-card {
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.quiz-card h3 {
    color: white;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
}

.quiz-card button {
    display: block;
    width: 100%;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 0.75rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.quiz-card button:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: white;
    transform: translateX(5px);
}

@keyframes celebrationBounce {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-10px); }
    50% { transform: translateY(-5px); }
    75% { transform: translateY(-15px); }
}

.arcade-zone.completed .arcade-grid {
    animation: celebrationBounce 0.6s ease;
}

.arcade-grid.loading {
    display: flex;
    align-items: center;
    justify-content: center;
}

.arcade-grid.loading::after {
    content: 'Loading game...';
    color: white;
    font-size: 1.2rem;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

/* ===================================
   Responsive Design
   =================================== */

@media (max-width: 768px) {
    .arcade-zone, .lesson-arcade {
        padding: 1rem;
        margin: 1rem 0;
    }
    
    .arcade-header h2 {
        font-size: 1.3rem;
    }
    
    .arcade-grid {
        padding: 1rem;
        min-height: 350px;
        max-height: 550px;
    }
    
    .arcade-cell {
        font-size: 1.2rem;
    }
    
    .tic-cell {
        font-size: 1.5rem;
    }
    
    .sequence-display {
        font-size: 1.5rem;
        padding: 0.75rem 1.5rem;
    }
}

@media (max-width: 480px) {
    .arcade-zone, .lesson-arcade {
        padding: 0.75rem;
        margin: 0.75rem 0;
    }
    
    .arcade-header h2 {
        font-size: 1.1rem;
    }
    
    .arcade-grid {
        padding: 0.75rem;
        min-height: 300px;
        max-height: 450px;
    }
    
    .quiz-card {
        padding: 1.5rem;
        margin: 1rem;
    }
}

.arcade-grid {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

.arcade-zone {
    position: relative;
    z-index: 1;
}

.arcade-grid {
    position: relative;
    z-index: 2;
}

.arcade-zone * {
    box-sizing: border-box;
}

.arcade-grid button:focus {
    outline: 2px solid white;
    outline-offset: 2px;
}

@media print {
    .arcade-zone, .lesson-arcade {
        display: none;
    }
}
`;

    // Inject CSS into page
    var styleEl = document.createElement('style');
    styleEl.id = 'lesson-arcade-styles';
    styleEl.textContent = css;
    
    // Only inject if not already present
    if (!document.getElementById('lesson-arcade-styles')) {
        document.head.appendChild(styleEl);
    }

    // ==========================================
    // JAVASCRIPT GAME LOGIC (ALL ORIGINAL FEATURES PRESERVED)
    // ==========================================

    var ICONS = {
        knight: '🛡️',
        wizard: '🧙',
        archer: '🏹',
        warrior: '⚔️'
    };

    var DIR_MAP = {
        arrowleft: { dx: -1, dy: 0, name: 'left' },
        a: { dx: -1, dy: 0, name: 'left' },
        arrowright: { dx: 1, dy: 0, name: 'right' },
        d: { dx: 1, dy: 0, name: 'right' },
        arrowup: { dx: 0, dy: -1, name: 'up' },
        w: { dx: 0, dy: -1, name: 'up' },
        arrowdown: { dx: 0, dy: 1, name: 'down' },
        s: { dx: 0, dy: 1, name: 'down' }
    };

    var TIC_QUIZ_BANK = [
        { prompt: 'Which data type stores true or false?', options: ['Boolean', 'String', 'List'], answer: 0 },
        { prompt: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Central Styling System', 'Creative Style Syntax'], answer: 0 },
        { prompt: 'Which base is binary?', options: ['Base 2', 'Base 8', 'Base 10'], answer: 0 },
        { prompt: 'HTML is used to...', options: ['Structure webpages', 'Style data', 'Compile programs'], answer: 0 },
        { prompt: 'A loop that never stops is called...', options: ['Infinite loop', 'For loop', 'While loop'], answer: 0 },
        { prompt: 'API stands for...', options: ['Application Programming Interface', 'Advanced Program Interaction', 'Applied Protocol Input'], answer: 0 }
    ];

    // Lesson to row mapping for game distribution
    var LESSON_ROW_MAP = {
        1: 1, // Lesson 1 -> Row 1 (Programming Basics)
        2: 2, // Lesson 2 -> Row 2 (Data Structures)
        3: 3, // Lesson 3 -> Row 3 (Internet & Networking)
        4: 4, // Lesson 4 -> Row 4 (Cybersecurity)
        5: 5  // Lesson 5 -> Row 5 (Data & Ethics)
    };

    function getCharacterIcon(fallback) {
        try {
            var saved = localStorage.getItem('snakes_selected_character');
            if (saved && ICONS[saved]) return ICONS[saved];
        } catch (e) { /* ignore */ }
        return ICONS[fallback] || '😺';
    }

    function updateZoneStatus(zone, message, complete) {
        var status = zone.querySelector('.arcade-status');
        if (!status) return;
        status.textContent = message;
        if (complete) {
            status.classList.add('complete');
            status.style.color = '#2ecc71';
            status.style.fontWeight = 'bold';
        } else {
            status.classList.remove('complete');
            status.style.color = '';
            status.style.fontWeight = '';
        }
    }

    function directionFromKey(key) {
        if (!key) return null;
        return DIR_MAP[key.toLowerCase()] || null;
    }

    function iconForDirection(name) {
        return {
            up: '↑',
            down: '↓',
            left: '←',
            right: '→'
        }[name] || '?';
    }

    var Arcade = {
        keyState: null,
        claimKeyboard: function (state) {
            if (state && typeof state.handleKey === 'function') {
                Arcade.keyState = state;
            }
        }
    };

    /* === MODE: Grid Collect (legacy orb chase) === */
    function initOrbMode(zone) {
        var grid = zone.querySelector('.arcade-grid');
        if (!grid) return null;
        zone.classList.add('mode-orb');
        var size = Number(zone.dataset.arcadeSize || 5);
        var target = Number(zone.dataset.arcadeTarget || 3);
        var icon = getCharacterIcon(zone.dataset.arcadeIcon);
        zone.style.setProperty('--arcade-grid-size', size);

        var player = { x: Math.floor(size / 2), y: size - 1 };
        var orbs = [];

        function randomPosition() {
            var pos;
            var taken = {};
            taken[player.x + '-' + player.y] = true;
            orbs.forEach(function (orb) { taken[orb.x + '-' + orb.y] = true; });
            do {
                pos = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
            } while (taken[pos.x + '-' + pos.y]);
            return pos;
        }

        for (var i = 0; i < target; i++) {
            orbs.push(randomPosition());
        }

        function render() {
            grid.innerHTML = '';
            for (var y = 0; y < size; y++) {
                for (var x = 0; x < size; x++) {
                    var cell = document.createElement('div');
                    cell.className = 'arcade-cell';
                    if (player.x === x && player.y === y) {
                        cell.classList.add('player');
                        cell.textContent = icon;
                    } else if (orbs.some(function (orb) { return orb.x === x && orb.y === y; })) {
                        cell.classList.add('orb');
                    }
                    grid.appendChild(cell);
                }
            }
        }

        function move(dx, dy, state) {
            var nx = player.x + dx;
            var ny = player.y + dy;
            if (nx < 0 || nx >= size || ny < 0 || ny >= size) return;
            player.x = nx;
            player.y = ny;
            var hitIndex = orbs.findIndex(function (orb) { return orb.x === nx && orb.y === ny; });
            if (hitIndex !== -1) {
                orbs.splice(hitIndex, 1);
                state.collected++;
                if (state.collected >= state.target) {
                    updateZoneStatus(zone, state.completeMessage, true);
                    zone.dataset.arcadeCompleted = 'true';
                } else {
                    updateZoneStatus(zone, 'Orb secured! ' + (state.target - state.collected) + ' left.');
                }
            }
            render();
        }

        var state = {
            zone: zone,
            type: 'orb',
            grid: grid,
            collected: 0,
            target: target,
            completeMessage: zone.dataset.arcadeComplete || 'All knowledge orbs secured! Continue below.',
            handleKey: function (event) {
                var dir = directionFromKey(event.key);
                if (!dir) return false;
                move(dir.dx, dir.dy, state);
                return true;
            }
        };

        render();
        updateZoneStatus(zone, zone.dataset.arcadeMessage || 'Use WASD or arrow keys to collect the glowing orbs.');
        zone.addEventListener('mouseenter', function () { Arcade.claimKeyboard(state); });
        zone.addEventListener('click', function () { Arcade.claimKeyboard(state); });
        Arcade.claimKeyboard(state);
        zone.__arcadeState = state;
        return state;
    }

    /* === MODE: Memory Sequence === */
    function initSequenceMode(zone) {
        var grid = zone.querySelector('.arcade-grid');
        if (!grid) return null;
        zone.classList.add('mode-sequence');
        grid.innerHTML = '';
        grid.classList.add('sequence-grid');

        var display = document.createElement('div');
        display.className = 'sequence-display';
        display.textContent = 'Ready?';
        var entered = document.createElement('div');
        entered.className = 'sequence-input';
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'sequence-btn';
        button.textContent = 'Play Sequence';

        grid.appendChild(display);
        grid.appendChild(entered);
        grid.appendChild(button);

        var state = {
            zone: zone,
            type: 'sequence',
            sequence: [],
            currentIndex: 0,
            accepting: false,
            level: 0,
            target: Number(zone.dataset.arcadeTarget || 3),
            display: display,
            entered: entered,
            button: button,
            completeMessage: zone.dataset.arcadeComplete || 'Sequence mastered! Great focus.'
        };

        function nextDirection() {
            var dirs = ['up', 'down', 'left', 'right'];
            return dirs[Math.floor(Math.random() * dirs.length)];
        }

        function playback() {
            state.accepting = false;
            state.entered.textContent = '';
            state.currentIndex = 0;
            state.sequence.push(nextDirection());
            var seq = state.sequence.slice();
            var idx = 0;
            state.button.disabled = true;
            updateZoneStatus(zone, 'Watch carefully...');

            function showStep() {
                if (idx >= seq.length) {
                    state.display.textContent = seq.map(iconForDirection).join(' ');
                    state.accepting = true;
                    state.button.disabled = false;
                    updateZoneStatus(zone, 'Now repeat the sequence using WASD or arrow keys.');
                    return;
                }
                state.display.textContent = iconForDirection(seq[idx]);
                setTimeout(function () {
                    state.display.textContent = '';
                    idx++;
                    setTimeout(showStep, 120);
                }, 450);
            }

            showStep();
        }

        state.handleKey = function (event) {
            var dir = directionFromKey(event.key);
            if (!dir) return false;
            if (!state.accepting) return true;
            var expected = state.sequence[state.currentIndex];
            state.entered.textContent += iconForDirection(dir.name) + ' ';

            if (dir.name === expected) {
                state.currentIndex++;
                if (state.currentIndex >= state.sequence.length) {
                    state.level++;
                    state.accepting = false;
                    if (state.level >= state.target) {
                        updateZoneStatus(zone, state.completeMessage, true);
                        zone.dataset.arcadeCompleted = 'true';
                        state.button.disabled = true;
                    } else {
                        updateZoneStatus(zone, 'Great memory! Click play for level ' + (state.level + 1) + '.');
                    }
                }
            } else {
                state.accepting = false;
                updateZoneStatus(zone, 'Oops! Sequence reset. Try again.');
                state.sequence = [];
                state.level = 0;
                state.button.disabled = false;
            }
            return true;
        };

        button.addEventListener('click', function () {
            if (state.level >= state.target) return;
            state.sequence = state.sequence.slice(0, state.level);
            playback();
        });

        zone.addEventListener('mouseenter', function () { Arcade.claimKeyboard(state); });
        zone.addEventListener('click', function () { Arcade.claimKeyboard(state); });
        updateZoneStatus(zone, zone.dataset.arcadeMessage || 'Press play to begin a memory pattern challenge.');
        zone.__arcadeState = state;
        return state;
    }

    /* === MODE: Quiz Tic-Tac-Toe === */
    function initTicMode(zone) {
        var grid = zone.querySelector('.arcade-grid');
        if (!grid) return null;
        zone.classList.add('mode-tic');
        grid.innerHTML = '';
        grid.classList.add('tic-grid');

        var cells = [];
        for (var i = 0; i < 9; i++) {
            var cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'tic-cell';
            cell.dataset.index = i;
            grid.appendChild(cell);
            cells.push(cell);
        }

        var state = {
            zone: zone,
            type: 'tic',
            board: Array(9).fill(null),
            cells: cells,
            playerSymbol: 'X',
            cpuSymbol: 'O',
            active: 'player',
            waiting: false,
            complete: false,
            completeMessage: zone.dataset.arcadeComplete || 'Victory! CPU defeated.'
        };

        function setCell(index, symbol) {
            state.board[index] = symbol;
            state.cells[index].textContent = symbol;
            state.cells[index].classList.add('taken');
            state.cells[index].disabled = true;
        }

        function evaluate(board, symbol) {
            var wins = [
                [0,1,2],[3,4,5],[6,7,8],
                [0,3,6],[1,4,7],[2,5,8],
                [0,4,8],[2,4,6]
            ];
            return wins.some(function (combo) {
                return combo.every(function (idx) { return board[idx] === symbol; });
            });
        }

        function openSpots(board) {
            var spots = [];
            board.forEach(function (val, idx) {
                if (!val) spots.push(idx);
            });
            return spots;
        }

        function findWinningMove(board, symbol) {
            var empty = openSpots(board);
            for (var i = 0; i < empty.length; i++) {
                var idx = empty[i];
                board[idx] = symbol;
                var win = evaluate(board, symbol);
                board[idx] = null;
                if (win) return idx;
            }
            return null;
        }

        function finish(result) {
            state.complete = true;
            state.cells.forEach(function (cell) { cell.disabled = true; });
            if (result === 'player') {
                updateZoneStatus(zone, state.completeMessage, true);
                zone.dataset.arcadeCompleted = 'true';
            } else if (result === 'cpu') {
                updateZoneStatus(zone, 'CPU wins! Study the board and try again next square.', true);
            } else {
                updateZoneStatus(zone, 'Draw game! Nice defense.', true);
            }
        }

        function checkOutcome() {
            if (evaluate(state.board, state.playerSymbol)) {
                finish('player');
                return true;
            }
            if (evaluate(state.board, state.cpuSymbol)) {
                finish('cpu');
                return true;
            }
            if (openSpots(state.board).length === 0) {
                finish('draw');
                return true;
            }
            return false;
        }

        function cpuMove() {
            if (state.complete) return;
            var move = findWinningMove(state.board, state.cpuSymbol) ||
                findWinningMove(state.board, state.playerSymbol) ||
                (state.board[4] ? null : 4);
            if (move === null || typeof move === 'undefined') {
                var options = openSpots(state.board);
                move = options[Math.floor(Math.random() * options.length)];
            }
            setCell(move, state.cpuSymbol);
            checkOutcome();
        }

        function promptQuiz(callback) {
            var quiz = TIC_QUIZ_BANK[Math.floor(Math.random() * TIC_QUIZ_BANK.length)];
            var overlay = document.createElement('div');
            overlay.className = 'arcade-quiz';
            overlay.innerHTML = '';

            var card = document.createElement('div');
            card.className = 'quiz-card';
            var title = document.createElement('h3');
            title.textContent = quiz.prompt;
            card.appendChild(title);

            quiz.options.forEach(function (opt, idx) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = opt;
                btn.addEventListener('click', function () {
                    overlay.remove();
                    callback(idx === quiz.answer);
                });
                card.appendChild(btn);
            });

            overlay.appendChild(card);
            zone.appendChild(overlay);
        }

        function handleCellClick(index) {
            if (state.complete || state.waiting || state.board[index]) return;
            state.waiting = true;
            promptQuiz(function (correct) {
                state.waiting = false;
                if (correct) {
                    setCell(index, state.playerSymbol);
                    if (!checkOutcome()) {
                        updateZoneStatus(zone, 'Great move! CPU thinking...');
                        setTimeout(cpuMove, 400);
                    }
                } else {
                    updateZoneStatus(zone, 'Missed it! CPU gets an extra move.');
                    setTimeout(cpuMove, 400);
                }
            });
        }

        cells.forEach(function (cell, idx) {
            cell.addEventListener('click', function () { handleCellClick(idx); });
        });

        updateZoneStatus(zone, zone.dataset.arcadeMessage || 'Beat the CPU in tic-tac-toe by answering each quiz!');
        zone.__arcadeState = state;
        return state;
    }

    var MODES = {
        orb: initOrbMode,
        sequence: initSequenceMode,
        tic: initTicMode
    };

    function chooseMode(zone) {
        var pool = (zone.dataset.arcadePool || '')
            .split(',')
            .map(function (m) { return m.trim().toLowerCase(); })
            .filter(Boolean);
        var list = pool.length ? pool : Object.keys(MODES);
        return list[Math.floor(Math.random() * list.length)];
    }

    /* === MODE: Custom Mini-Game from MiniGames system === */
    function initCustomMiniGame(zone, lessonNumber, gameName, retryCount) {
        retryCount = retryCount || 0;
        var maxRetries = 30;

        if (!window.MiniGames) {
            if (retryCount < maxRetries) {
                console.log('MiniGames not loaded yet, retrying... (' + (retryCount + 1) + '/' + maxRetries + ')');
                setTimeout(function() {
                    initCustomMiniGame(zone, lessonNumber, gameName, retryCount + 1);
                }, 400);
                return null;
            }
            console.error('MiniGames failed to load after ' + maxRetries + ' retries');
            updateZoneStatus(zone, 'Error: Game system failed to load. Please refresh the page.');
            return null;
        }

        var grid = zone.querySelector('.arcade-grid');
        if (!grid) {
            console.error('No .arcade-grid found in zone');
            updateZoneStatus(zone, 'Error: Game container missing. Please refresh.');
            return null;
        }

        grid.innerHTML = '';
        zone.classList.add('mode-custom');

        var game;
        if (gameName) {
            game = window.MiniGames.getGame(lessonNumber, gameName);
        } else {
            game = window.MiniGames.getLessonMiniGame(lessonNumber);
        }

        if (!game) {
            console.error('Game not found for lesson ' + lessonNumber + ' with name ' + gameName);
            updateZoneStatus(zone, 'Error: Game not found. Please refresh the page.');
            return null;
        }

        console.log('✓ Game found:', game.name, 'for lesson', lessonNumber);

        var header = zone.querySelector('.arcade-header');
        if (header) {
            var h2 = header.querySelector('h2');
            var p = header.querySelector('p');
            if (h2) h2.textContent = game.name;
            if (p) p.textContent = game.description;
        }

        var state = {
            zone: zone,
            type: 'custom',
            lessonNumber: lessonNumber,
            gameName: gameName || 'lesson-game',
            completed: false,
            completeMessage: zone.dataset.arcadeComplete || 'Challenge complete! Continue below.'
        };

        try {
            console.log('Initializing game in grid:', grid);
            
            game.init(grid, function(success, score) {
                console.log('Game callback triggered:', success, score);
                state.completed = success;
                
                zone.dataset.arcadeCompleted = success ? 'true' : 'false';
                zone.dataset.arcadeScore = score || 0;
                
                if (success) {
                    updateZoneStatus(zone, state.completeMessage, true);
                    console.log('✓ Mini-game completed successfully!');
                    
                    zone.classList.add('completed');
                    
                    grid.style.transition = 'all 0.3s ease';
                    grid.style.transform = 'scale(1.05)';
                    setTimeout(function() {
                        grid.style.transform = 'scale(1)';
                    }, 300);
                } else {
                    updateZoneStatus(zone, 'Time\'s up! Try again to unlock the quiz.', false);
                    
                    var retryBtn = document.createElement('button');
                    retryBtn.textContent = '🔄 Try Again';
                    retryBtn.className = 'arcade-retry-btn';
                    retryBtn.style.cssText = 'margin-top: 10px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;';
                    
                    retryBtn.addEventListener('click', function() {
                        retryBtn.remove();
                        grid.innerHTML = '';
                        zone.dataset.arcadeCompleted = 'false';
                        initCustomMiniGame(zone, lessonNumber, gameName, 0);
                    });
                    
                    var existingRetry = zone.querySelector('.arcade-retry-btn');
                    if (existingRetry) existingRetry.remove();
                    
                    var statusEl = zone.querySelector('.arcade-status');
                    if (statusEl && statusEl.parentNode) {
                        statusEl.parentNode.insertBefore(retryBtn, statusEl.nextSibling);
                    }
                }
            });
            
            console.log('✓ Game initialized successfully');
            updateZoneStatus(zone, 'Complete the challenge to unlock the content below.');
            
            grid.style.minHeight = '450px';
            grid.style.width = '100%';
            grid.style.display = 'block';
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            updateZoneStatus(zone, 'Error initializing game. Please refresh.');
            return null;
        }

        zone.__arcadeState = state;
        return state;
    }

    function initZone(zone) {
        console.log('Initializing arcade zone...', zone);
        
        if (zone.dataset.arcadeDefer === 'true') {
            console.log('Skipping deferred arcade zone');
            return null;
        }

        var lessonNumber = parseInt(zone.dataset.arcadeLesson || zone.dataset.lesson || 0);
        var gameName = zone.dataset.arcadeGame || zone.dataset.game || '';

        console.log('Lesson number:', lessonNumber, 'Game name:', gameName);

        if (lessonNumber > 0) {
            return initCustomMiniGame(zone, lessonNumber, gameName);
        }

        console.warn('Arcade zone without lesson number found. Old modes are disabled.');
        updateZoneStatus(zone, 'Error: Game configuration missing. Please refresh.');
        return null;
    }

    /**
     * Initialize a mini-game for a specific lesson and game
     * @param {HTMLElement} container - The container element
     * @param {number} lessonNumber - The lesson number (1-5)
     * @param {string} gameName - Optional specific game name
     * @param {function} onComplete - Callback when game completes
     */
    function initLessonMiniGame(container, lessonNumber, gameName, onComplete) {
        if (!window.MiniGames) {
            console.error('MiniGames not loaded');
            return null;
        }

        var game;
        if (gameName) {
            game = window.MiniGames.getGame(lessonNumber, gameName);
        } else {
            game = window.MiniGames.getLessonMiniGame(lessonNumber);
        }

        if (!game) {
            console.error('Game not found for lesson ' + lessonNumber);
            return null;
        }

        container.innerHTML = '<div class="arcade-grid"></div>';
        var grid = container.querySelector('.arcade-grid');

        return game.init(grid, onComplete || function() {});
    }

    /**
     * Get a random game for a question square based on row
     * @param {number} rowNumber - The row number (1-5)
     * @returns {Object} Game info with name and game object
     */
    function getQuestionSquareGame(rowNumber) {
        if (!window.MiniGames) return null;

        var game = window.MiniGames.getRandomGameForLesson(rowNumber);
        return game;
    }

    // Global keyboard handler
    document.addEventListener('keydown', function (event) {
        var state = Arcade.keyState;
        if (!state || typeof state.handleKey !== 'function') return;
        if (state.handleKey(event)) event.preventDefault();
    });

    // Initialize all arcade zones on DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        console.log('DOM loaded, initializing arcade zones...');
        
        var initAttempts = 0;
        var maxAttempts = 50;
        
        function tryInit() {
            initAttempts++;
            
            if (window.MiniGames) {
                console.log('✓ MiniGames loaded, initializing zones');
                
                var zones = document.querySelectorAll('.arcade-zone, .lesson-arcade');
                console.log('Found', zones.length, 'arcade zones');
                
                zones.forEach(function(zone, index) {
                    console.log('Initializing zone', index + 1);
                    
                    setTimeout(function() {
                        initZone(zone);
                    }, index * 100);
                });
                
                return;
            }
            
            if (initAttempts < maxAttempts) {
                console.log('Waiting for MiniGames... attempt', initAttempts);
                setTimeout(tryInit, 100);
            } else {
                console.error('MiniGames failed to load after', maxAttempts, 'attempts');
            }
        }
        
        setTimeout(tryInit, 100);
    });

    // Expose functions globally
    window.SnakesArcade = Arcade;
    window.initArcadeZone = initZone;
    window.initLessonMiniGame = initLessonMiniGame;
    window.getQuestionSquareGame = getQuestionSquareGame;
    
    // Manual reinit function for debugging
    window.reinitializeAllArcades = function() {
        console.log('🔄 Manually reinitializing all arcade zones...');
        var zones = document.querySelectorAll('.arcade-zone, .lesson-arcade');
        zones.forEach(function(zone, index) {
            if (!zone.__arcadeState) {
                console.log('Initializing zone', index + 1);
                initZone(zone);
            } else {
                console.log('Zone', index + 1, 'already initialized');
            }
        });
    };
    
    console.log('✓ Arcade system loaded and ready');
})();