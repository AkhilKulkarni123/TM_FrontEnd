(function () {
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
        if (complete) status.classList.add('complete');
        else status.classList.remove('complete');
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
        var maxRetries = 10;

        if (!window.MiniGames) {
            if (retryCount < maxRetries) {
                console.log('MiniGames not loaded yet, retrying... (' + (retryCount + 1) + '/' + maxRetries + ')');
                setTimeout(function() {
                    initCustomMiniGame(zone, lessonNumber, gameName, retryCount + 1);
                }, 200);
                return null;
            }
            console.error('MiniGames failed to load after ' + maxRetries + ' retries');
            updateZoneStatus(zone, 'Error: Game system failed to load. Please refresh the page.');
            return null;
        }

        var grid = zone.querySelector('.arcade-grid');
        if (!grid) return null;

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

        // Update header with game info
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

        // Initialize the game
        game.init(grid, function(success, score) {
            state.completed = success;
            if (success) {
                updateZoneStatus(zone, state.completeMessage, true);
            } else {
                updateZoneStatus(zone, 'Time\'s up! You can continue, but try to do better next time.');
            }
            // Store completion state
            zone.dataset.arcadeCompleted = success ? 'true' : 'false';
            zone.dataset.arcadeScore = score || 0;
        });

        updateZoneStatus(zone, 'Complete the challenge to unlock the content below.');
        zone.__arcadeState = state;
        return state;
    }

    function initZone(zone) {
        // Skip deferred zones - they will be initialized later by JavaScript
        if (zone.dataset.arcadeDefer === 'true') {
            console.log('Skipping deferred arcade zone');
            return null;
        }

        // Check for custom mini-game mode (lesson-based games)
        var lessonNumber = parseInt(zone.dataset.arcadeLesson || zone.dataset.lesson || 0);
        var gameName = zone.dataset.arcadeGame || zone.dataset.game || '';

        // If a lesson number is specified, ALWAYS use the MiniGames system
        // This ensures the proper educational games are used with completion tracking
        if (lessonNumber > 0) {
            return initCustomMiniGame(zone, lessonNumber, gameName);
        }

        // For zones without lesson number, show error - old modes are disabled
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

    document.addEventListener('keydown', function (event) {
        var state = Arcade.keyState;
        if (!state || typeof state.handleKey !== 'function') return;
        if (state.handleKey(event)) event.preventDefault();
    });

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.arcade-zone').forEach(initZone);
    });

    window.SnakesArcade = Arcade;
    window.initArcadeZone = initZone;
    window.initLessonMiniGame = initLessonMiniGame;
    window.getQuestionSquareGame = getQuestionSquareGame;
})();