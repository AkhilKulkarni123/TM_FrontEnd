/*
 * Snakes and Ladders – Custom Game Logic for AP CS Principles
 *
 * Split board (updated):
 *  - First section: square 0 = START, squares 1–5 = 5 lesson squares (one per lesson)
 *  - Second section (6–55): 5 rows × 10 columns = 50 question squares
 *  - After section 2: boss battle (unlocked for top 5 leaderboard players)
 */

var API_URL = 'http://localhost:8001/api';
// New explicit sizes
var FIRST_LESSON_COUNT = 5; // number of lesson squares (1..5)
var FIRST_SECTION_SIZE = FIRST_LESSON_COUNT + 1;   // includes START at square 0, so section size = 6
var SECOND_SECTION_SIZE = 50; // questions: squares 6..55 (5 rows x 10 cols)
var BOARD_TOTAL_SQUARES = FIRST_SECTION_SIZE + SECOND_SECTION_SIZE + 1; // +1 reserved for boss end

var LESSON_BULLETS = 5;
var QUESTION_BULLETS = 5; // CHANGED FROM 2 TO 5

var AUTOSAVE_EVERY_SECONDS = 10;

var gameState = {
    isGuest: false,
    userId: null,
    username: '',
    character: '',
    bullets: 0,
    lives: 3,
    currentSquare: 0,
    visitedSquares: [0],
    completedLessons: [],
    unlockedSections: ['half1'],
    timeStarted: null,
    timeElapsed: 0,
    bossAttempts: 0,
    socket: null
};

function $(selector) { return document.querySelector(selector); }
function $all(selector) { return document.querySelectorAll(selector); }

document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    // Check login then attempt to auto-resume if the player has already selected a character
    checkExistingLogin().then(function () {
        autoResumeIfReady();
    });
});

function initializeEventListeners() {
    var btnUseLogin = document.getElementById('use-existing-login');
    if (btnUseLogin) btnUseLogin.addEventListener('click', useExistingLogin);

    var btnGuest = document.getElementById('play-as-guest');
    if (btnGuest) btnGuest.addEventListener('click', playAsGuest);

    var characterCards = $all('.character-card');
    for (var i = 0; i < characterCards.length; i++) {
        (function (card) {
            card.addEventListener('click', function () { selectCharacter(card); });
        })(characterCards[i]);
    }

    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.addEventListener('click', startGame);

    var rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) rollBtn.addEventListener('click', rollDice);

    var leaderboardBtn = document.getElementById('view-leaderboard-btn');
    if (leaderboardBtn) leaderboardBtn.addEventListener('click', viewLeaderboard);

    var prevBtn = document.getElementById('prev-section-btn');
    if (prevBtn) prevBtn.addEventListener('click', navigatePrev);

    var nextBtn = document.getElementById('next-section-btn');
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);

    var closeButtons = $all('.close-modal');
    for (var j = 0; j < closeButtons.length; j++) {
        closeButtons[j].addEventListener('click', function () {
            var modals = $all('.modal');
            for (var k = 0; k < modals.length; k++) modals[k].classList.add('hidden');
        });
    }

    // Boss attack handler (in modal on section 2)
    var bossAttackBtn = document.getElementById('boss-attack-btn');
    if (bossAttackBtn) bossAttackBtn.addEventListener('click', function () {
        if (gameState.bullets < 10) { alert('You need at least 10 bullets to attack the boss.'); return; }
        // spend bullets locally and update server
        gameState.bullets -= 10;
        document.getElementById('boss-player-bullets').textContent = gameState.bullets;
        updatePlayerInfo();
        saveProgress();

        fetch(API_URL + '/boss/attack', {
            method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ damage: 50 })
        }).catch(function () {});
    });
}

function checkExistingLogin() {
    return fetch(API_URL + '/id', { credentials: 'include' })
        .then(function (response) { if (!response.ok) return null; return response.json(); })
        .then(function (userData) {
            if (!userData) return null;
            gameState.userId = userData.id;
            gameState.username = userData.name;
            return userData;
        })
        .catch(function () { return null; });
}

function useExistingLogin() {
    fetch(API_URL + '/id', { credentials: 'include' })
        .then(function (response) {
            if (!response.ok) {
                alert('Please log in to the website first, then return to the game.');
                window.location.href = '/login';
                return null;
            }
            return response.json();
        })
        .then(function (userData) {
            if (!userData) return;
            gameState.isGuest = false;
            gameState.userId = userData.id;
            gameState.username = userData.name;
            return loadOrCreateGameData();
        })
        .then(function () { return loadProgress(); })
        .then(function () {
            var loginContainer = document.getElementById('login-container');
            var characterSelection = document.getElementById('character-selection');
            if (loginContainer) loginContainer.classList.add('hidden');
            if (characterSelection) characterSelection.classList.remove('hidden');
        })
        .catch(function (error) {
            console.error('Login error:', error);
            alert('Error connecting to server. Please try again.');
        });
}

function playAsGuest() {
    gameState.isGuest = true;
    gameState.userId = 'guest_' + Date.now();
    gameState.username = 'Guest_' + Math.floor(Math.random() * 1000);
    // persist guest choice across pages
    try { localStorage.setItem('snakes_isGuest', '1'); } catch (e) {}

    var loginContainer = document.getElementById('login-container');
    var characterSelection = document.getElementById('character-selection');
    if (loginContainer) loginContainer.classList.add('hidden');
    if (characterSelection) characterSelection.classList.remove('hidden');
}

function loadOrCreateGameData() {
    if (gameState.isGuest) return Promise.resolve();

    return fetch(API_URL + '/snakes/', { credentials: 'include' })
        .then(function (response) {
            if (response.status === 404) {
                return fetch(API_URL + '/snakes/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ selected_character: gameState.character })
                });
            }
            return response;
        })
        .then(function (response) { if (!response || !response.ok) return null; return response.json(); })
        .then(function (data) {
            if (!data) return;
            gameState.bullets = Number(data.total_bullets || 0);
            // convert server 1-based square values to internal 0-based
            if (typeof data.current_square !== 'undefined' && data.current_square !== null) {
                gameState.currentSquare = Number(data.current_square) - 1;
            }
            if (Array.isArray(data.visited_squares)) {
                gameState.visitedSquares = data.visited_squares.map(function (s) { return Number(s) - 1; });
            } else {
                gameState.visitedSquares = [gameState.currentSquare];
            }
            gameState.lives = Number(data.lives || 3);
            gameState.bossAttempts = Number(data.boss_battle_attempts || 0);
            gameState.timeElapsed = Math.floor(Number(data.time_played || 0));
            gameState.character = data.selected_character || gameState.character;

            if (gameState.timeStarted === null) {
                gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            }
        })
        .catch(function (error) { console.error('Error loading game data:', error); });
}

function loadProgress() {
    if (gameState.isGuest) return Promise.resolve();

    return fetch(API_URL + '/snakes/progress', { credentials: 'include' })
        .then(function (response) { if (!response.ok) return null; return response.json(); })
        .then(function (data) {
            if (!data) return;
            // Server stores squares 1-based. Convert to 0-based internally.
            if (typeof data.current_square !== 'undefined' && data.current_square !== null) {
                gameState.currentSquare = Number(data.current_square) - 1;
            }
            // Convert server 1-based visited_squares to internal 0-based indices
            if (Array.isArray(data.visited_squares)) {
                gameState.visitedSquares = data.visited_squares.map(function (s) { return Number(s) - 1; });
            } else {
                gameState.visitedSquares = gameState.visitedSquares;
            }
            gameState.bullets = Number(data.total_bullets || gameState.bullets);
            gameState.lives = Number(data.lives || gameState.lives);
            gameState.completedLessons = data.completed_lessons || [];
            gameState.unlockedSections = data.unlocked_sections || gameState.unlockedSections;
            // Ensure selected character from server is adopted
            if (data.selected_character) gameState.character = data.selected_character;

            if (typeof data.time_played !== 'undefined' && data.time_played !== null) {
                gameState.timeElapsed = Math.floor(Number(data.time_played || gameState.timeElapsed));
                if (gameState.timeStarted !== null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            }
        })
        .catch(function (error) { console.error('Error loading progress:', error); });
}

function saveProgress() {
    if (gameState.isGuest) return Promise.resolve();

    if (gameState.timeStarted !== null) gameState.timeElapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);

    return fetch(API_URL + '/snakes/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            // Convert internal 0-based square to server 1-based before saving
            current_square: Number(gameState.currentSquare) + 1,
            // send visited squares as 1-based values to server
            visited_squares: (gameState.visitedSquares || []).map(function (s) { return Number(s) + 1; }),
            total_bullets: gameState.bullets,
            time_played: gameState.timeElapsed,
            lives: gameState.lives,
            boss_battle_attempts: gameState.bossAttempts,
            selected_character: gameState.character
        })
    }).catch(function (error) { console.error('Error saving progress:', error); });
}

function saveProgressSilently() { try { saveProgress(); } catch (e) {} }

function selectCharacter(card) {
    var cards = $all('.character-card');
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selected');
    card.classList.add('selected');
    gameState.character = card.getAttribute('data-character');
    try { localStorage.setItem('snakes_selected_character', gameState.character); } catch (e) {}
    // Immediately update UI and try to persist selection to the server if logged in
    updatePlayerInfo();
    if (!gameState.isGuest) {
        // Attempt to create record or update server with selected character
        loadOrCreateGameData().then(function () {
            // saveProgress will PUT selected_character
            saveProgress().catch(function () {});
        }).catch(function () {
            // Fallback: still try to save progress
            saveProgress().catch(function () {});
        });
    }

    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.disabled = false;
}

function startGame() {
    if (!gameState.character) {
        alert('Please select a character!');
        return;
    }

    loadOrCreateGameData()
        .then(function () { return loadProgress(); })
        .then(function () {
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');
            var loginContainer = document.getElementById('login-container');
            if (characterSelection) characterSelection.classList.add('hidden');
            if (gameContainer) gameContainer.classList.remove('hidden');
            if (loginContainer) loginContainer.classList.add('hidden');

            // remember that the user started the game (so returning pages auto-resume)
            try { localStorage.setItem('snakes_started', '1'); } catch (e) {}

            if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);

            startTimer();
            startAutosave();
            createGameBoard();
            updatePlayerInfo();
            checkSectionLock();
        });
}

function autoResumeIfReady() {
    // Check if the player has previously started the game (localStorage flag)
    var hasStarted = false;
    try { hasStarted = (localStorage.getItem('snakes_started') === '1'); } catch (e) { hasStarted = false; }
    
    // Only auto-resume if the player has started playing before
    if (!hasStarted) {
        return Promise.resolve();
    }
    
    // If the player previously selected a character (localStorage) or server has saved a selected character, resume game UI
    var storedChar = null;
    try { storedChar = localStorage.getItem('snakes_selected_character'); } catch (e) { storedChar = null; }

    if (storedChar) {
        gameState.character = storedChar;
        gameState.isGuest = (localStorage.getItem('snakes_isGuest') === '1');

        return loadOrCreateGameData().then(function () { return loadProgress(); }).then(function () {
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');
            if (characterSelection) characterSelection.classList.add('hidden');
            if (gameContainer) gameContainer.classList.remove('hidden');

            if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo(); checkSectionLock();
        }).catch(function () { /* ignore errors while auto-resuming */ });
    }

    // If logged in and server has a selected character, resume
    if (gameState.userId) {
        return loadProgress().then(function () {
            if (gameState.character) {
                var characterSelection = document.getElementById('character-selection');
                var gameContainer = document.getElementById('game-container');
                var loginContainer = document.getElementById('login-container');
                if (characterSelection) characterSelection.classList.add('hidden');
                if (gameContainer) gameContainer.classList.remove('hidden');
                if (loginContainer) loginContainer.classList.add('hidden');

                if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
                startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo(); checkSectionLock();
            }
        }).catch(function () {});
    }

    return Promise.resolve();
}

function createGameBoard() {
    var board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';

    var section = window.snakesGameSection || 1;
    // Section 1: compact 1 x FIRST_SECTION_SIZE layout (display horizontally)
        if (section === 1) {
            var row = document.createElement('div');
            row.className = 'board-row single-row';
            // ensure the single-row grid uses the correct column count (START + lessons)
            row.style.setProperty('--first-size', FIRST_SECTION_SIZE);
            for (var i = 0; i < FIRST_SECTION_SIZE; i++) {
                var squareNum = i;
                var square = document.createElement('div');
                square.className = 'square small-lesson';
                square.setAttribute('data-square', squareNum);

                if (gameState.visitedSquares.indexOf(squareNum) !== -1) square.classList.add('visited');
                if (squareNum === gameState.currentSquare) square.classList.add('current');

                var numSpan = document.createElement('span');
                numSpan.className = 'square-number';
                // Label start square as START instead of numeric 0
                numSpan.textContent = (squareNum === 0) ? 'START' : squareNum;
                if (squareNum === 0) square.classList.add('start');
                square.appendChild(numSpan);

                var icon = document.createElement('div');
                icon.className = 'square-icon';
                icon.textContent = '📘';
                square.appendChild(icon);

                if (squareNum === gameState.currentSquare) {
                    var marker = document.createElement('div');
                    marker.className = 'player-marker';
                    marker.textContent = getCharacterIcon(gameState.character);
                    square.appendChild(marker);
                }

                row.appendChild(square);
            }
            board.appendChild(row);
            return;
    }

    // Section 2: 5 rows x 10 columns (50 squares)
    var start = FIRST_SECTION_SIZE; // e.g., 6 (section 2 begins at FIRST_SECTION_SIZE)
    var cols = 10;
    var rows = 5;

    for (var r = rows - 1; r >= 0; r--) {
        var rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';
        for (var c = 0; c < cols; c++) {
            var squareNum;
            var globalIdx = (r * cols) + c; // 0 based within section
            // zig-zag numbering per row parity (snake-like)
            if (r % 2 === 1) {
                squareNum = start + (r * cols) + (cols - 1 - c);
            } else {
                squareNum = start + (r * cols) + c;
            }

            var square = document.createElement('div');
            square.className = 'square';
            square.setAttribute('data-square', squareNum);

            if (gameState.visitedSquares.indexOf(squareNum) !== -1) square.classList.add('visited');
            if (squareNum === gameState.currentSquare) square.classList.add('current');

            var numSpan = document.createElement('span');
            numSpan.className = 'square-number';
            numSpan.textContent = (squareNum === 0) ? 'START' : squareNum;
            square.appendChild(numSpan);

            var icon = document.createElement('div');
            icon.className = 'square-icon';
            // decorate snakes, ladders, and final boss marker
            if (snakesAndLaddersMap[squareNum]) {
                if (snakesAndLaddersMap[squareNum] > squareNum) icon.textContent = '🪜'; // ladder
                else icon.textContent = '🐍'; // snake
                if (snakesAndLaddersMap[squareNum] > squareNum) square.classList.add('ladder'); else square.classList.add('snake');
            } else if (squareNum === (FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1)) {
                // mark the last question square with a finish flag
                icon.textContent = '🏁';
                square.classList.add('boss');
            }
            square.appendChild(icon);

            if (squareNum === gameState.currentSquare) {
                var marker = document.createElement('div');
                marker.className = 'player-marker';
                marker.textContent = getCharacterIcon(gameState.character);
                square.appendChild(marker);
            }

            rowDiv.appendChild(square);
        }
        board.appendChild(rowDiv);
    }
}

function getCharacterIcon(character) {
    var icons = { knight: '🛡️', wizard: '🧙', archer: '🏹', warrior: '⚔️' };
    return icons[character] || '🙂';
}

function updatePlayerInfo() {
    var charSpan = document.getElementById('player-character');
    var bulletsSpan = document.getElementById('player-bullets');
    var livesSpan = document.getElementById('player-lives');
    var squareSpan = document.getElementById('player-square');
    var timeSpan = document.getElementById('player-time');

    if (charSpan) charSpan.textContent = getCharacterIcon(gameState.character);
    if (bulletsSpan) bulletsSpan.textContent = gameState.bullets;
    if (livesSpan) livesSpan.textContent = gameState.lives;
    if (squareSpan) squareSpan.textContent = (gameState.currentSquare === 0) ? 'START' : gameState.currentSquare;
    if (timeSpan) timeSpan.textContent = formatTime(gameState.timeElapsed);
}

function formatTime(totalSeconds) {
    totalSeconds = Number(totalSeconds || 0);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
}

function startTimer() {
    setInterval(function () {
        if (!gameState.timeStarted) return;
        var elapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);
        gameState.timeElapsed = elapsed;
        var timeSpan = document.getElementById('player-time');
        if (timeSpan) timeSpan.textContent = formatTime(elapsed);
    }, 1000);
}

function startAutosave() {
    setInterval(function () {
        if (gameState.isGuest) return;
        saveProgressSilently();
    }, AUTOSAVE_EVERY_SECONDS * 1000);
}

function rollDice() {
    var diceBtn = document.getElementById('roll-dice-btn');
    if (diceBtn) diceBtn.disabled = true;

    var section = window.snakesGameSection || 1;
    var roll;
    if (section === 1) {
        // Guarantee a 1 in the first section so players progress lesson-by-lesson
        roll = 1;
    } else {
        roll = Math.floor(Math.random() * 6) + 1;
    }

    setTimeout(function () {
        alert('You rolled a ' + roll + '!');
        movePlayer(roll).then(function () {
            if (diceBtn) diceBtn.disabled = false;
        });
    }, 300);
}

function movePlayer(steps) {
    return new Promise(function (resolve) {
        var section = window.snakesGameSection || 1;
        var sectionStart = (section === 1) ? 0 : FIRST_SECTION_SIZE;
        var sectionEnd = (section === 1) ? (FIRST_SECTION_SIZE - 1) : (FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1);

        var tentative = gameState.currentSquare + steps;
        if (section === 1) {
            // In the first section we clamp to the final square so players don't bounce back
            if (tentative > sectionEnd) tentative = sectionEnd;
        } else {
            // basic move calculation with bounce at end for section 2
            if (tentative > sectionEnd) tentative = sectionEnd - (tentative - sectionEnd);
        }

        // If in section 2, attempt to land on an unvisited square if possible
        if (section === 2) {
            var maxAttempts = SECOND_SECTION_SIZE; // avoid infinite loops
            var attempts = 0;
            var newSquare = tentative;
            // If we already visited this square and there exists unvisited squares, advance forward until unvisited
            while (gameState.visitedSquares.indexOf(newSquare) !== -1 && attempts < maxAttempts) {
                // move forward by 1, wrap within section
                newSquare++;
                if (newSquare > sectionEnd) newSquare = sectionStart;
                attempts++;
            }
            // If all squares visited, allow normal tentative
            if (attempts >= maxAttempts) newSquare = tentative;

            gameState.currentSquare = newSquare;
            if (gameState.visitedSquares.indexOf(newSquare) === -1) gameState.visitedSquares.push(newSquare);
        } else {
            // section 1 behavior
            var newSquare = tentative;
            gameState.currentSquare = newSquare;
            if (gameState.visitedSquares.indexOf(newSquare) === -1) gameState.visitedSquares.push(newSquare);
        }

        createGameBoard();
        updatePlayerInfo();
        saveProgress();

        handleSquareEvent();
        resolve();
    });
}

function handleSquareEvent() {
    var section = window.snakesGameSection || 1;
    var square = gameState.currentSquare;
    console.log('Section:', section, 'Square:', square);
    
    // SECTION 1: LESSONS (squares 1-5)
    if (section === 1) {
        
        if (square === 0) {

            alert('This is START. Roll the dice to move to the first lesson.');
            return;
        }
        
        if (square >= 1 && square <= FIRST_LESSON_COUNT) {
            var lessonNum = square;
            if (gameState.completedLessons.indexOf(lessonNum) === -1) {
                var row = 1;
                var index = square - 1;
                window.location.href = '/game/questions/questions.html?square=' + square + '&row=' + row + '&index=' + index;
                return;
            }
            
            var allDone = true;
            for (var i = 1; i <= FIRST_LESSON_COUNT; i++) {
                if (gameState.completedLessons.indexOf(i) === -1) { allDone = false; break; }
            }
            if (allDone) {
                if (gameState.unlockedSections.indexOf('half2') === -1) gameState.unlockedSections.push('half2');
                saveProgress();
                alert('All lessons completed! You can now go to the next section.');
            } else {
                alert('Lesson already complete. Finish all lessons to proceed.');
            }
            return;
        }
    }
    
    // SECTION 2: QUESTIONS (squares 6-55)
    if (section === 2) {
        var sectionStart = FIRST_SECTION_SIZE;
        var sectionEnd = FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1;
        var dest = snakesAndLaddersMap[square];
        if (dest) {
            animateMoveToSquare(square, dest);
            return;
        }
        if (square === sectionEnd) {
            checkPlayerTopFive().then(function (isTopFive) {
                if (isTopFive) {
                    if (gameState.unlockedSections.indexOf('boss') === -1) gameState.unlockedSections.push('boss');
                    saveProgress();
                    alert('You reached the end of the section! As a top player, you may now proceed to the boss.');
                } else {
                    alert('You reached the end of the questions, but only the top 5 players can proceed to the boss. Check the leaderboard and try to earn more bullets!');
                }
            }).catch(function () { alert('Unable to check leaderboard at this time. Try again later.'); });
            return;
        }
        if (square >= sectionStart && square < sectionEnd) {
            var idx = square - sectionStart;
            var row2 = Math.floor(idx / 10) + 1;
            var index2 = idx % 10;
            window.location.href = '/game/questions/questions.html?square=' + square + '&row=' + row2 + '&index=' + index2;
            return;
        }
    }
    
    // Fallback
    console.warn('Unhandled square event:', square, 'in section', section);
}


// Snakes and ladders configuration for section 2 (squares -> destination)
var snakesAndLaddersMap = {
    // ladders (up): adjusted to account for START at 0 (shifted +1)
    9: 19,
    13: 31,
    24: 35,
    29: 41,
    // snakes (down)
    16: 8,
    38: 21,
    45: 33,
    51: 42
};

function animateMoveToSquare(from, to) {
    // Create a temporary floating marker that moves from 'from' square to 'to' square
    var board = document.getElementById('game-board');
    var fromEl = board.querySelector('[data-square="' + from + '"]');
    var toEl = board.querySelector('[data-square="' + to + '"]');
    if (!fromEl || !toEl) {
        // fallback: instant move
        gameState.currentSquare = to;
        if (gameState.visitedSquares.indexOf(to) === -1) gameState.visitedSquares.push(to);
        createGameBoard(); updatePlayerInfo(); saveProgress();
        handleSquareEvent();
        return;
    }

    var marker = document.createElement('div');
    marker.className = 'floating-marker';
    marker.textContent = getCharacterIcon(gameState.character);
    marker.style.position = 'absolute';
    marker.style.zIndex = 9999;
    document.body.appendChild(marker);

    var fromRect = fromEl.getBoundingClientRect();
    var toRect = toEl.getBoundingClientRect();

    marker.style.left = (fromRect.left + (fromRect.width / 2) - 12) + 'px';
    marker.style.top = (fromRect.top + (fromRect.height / 2) - 12) + 'px';
    marker.style.transition = 'all 0.9s cubic-bezier(.2,.8,.2,1)';

    // Add class to indicate snake or ladder
    if (to > from) marker.classList.add('ladder-anim'); else marker.classList.add('snake-anim');

    setTimeout(function () {
        marker.style.left = (toRect.left + (toRect.width / 2) - 12) + 'px';
        marker.style.top = (toRect.top + (toRect.height / 2) - 12) + 'px';
    }, 20);

    setTimeout(function () {
        document.body.removeChild(marker);
        gameState.currentSquare = to;
        if (gameState.visitedSquares.indexOf(to) === -1) gameState.visitedSquares.push(to);
        createGameBoard(); updatePlayerInfo(); saveProgress();
        // After moving due to snake/ladder, handle next square events (questions, boss)
        handleSquareEvent();
    }, 1000);
}

function navigatePrev() {
    var section = window.snakesGameSection || 1;
    if (section === 2) window.location.href = 'game-board-part1.html';
}

function navigateNext() {
    var section = window.snakesGameSection || 1;
    var overlay = document.getElementById('locked-overlay');

    if (section === 1) {
        if (gameState.unlockedSections.indexOf('half2') === -1) {
            if (overlay) overlay.style.display = 'flex';
            return;
        }
        window.location.href = 'game-board-part2.html';
    } else if (section === 2) {
        if (gameState.unlockedSections.indexOf('boss') === -1) {
            // check leaderboard for top 5
            checkPlayerTopFive().then(function (isTopFive) {
                if (!isTopFive) {
                    if (overlay) overlay.style.display = 'flex';
                    alert('Only the top 5 players on the leaderboard can enter the boss battle. Climb the ranks!');
                    return;
                }
                // unlock and go
                if (gameState.unlockedSections.indexOf('boss') === -1) gameState.unlockedSections.push('boss');
                saveProgress();
                window.location.href = 'boss-battle.html';
            }).catch(function () { if (overlay) overlay.style.display = 'flex'; });
            return;
        }
        window.location.href = 'boss-battle.html';
    }
}

function checkPlayerTopFive() {
    return fetch(API_URL + '/snakes/leaderboard?limit=10', { credentials: 'include' })
        .then(function (res) { if (!res.ok) throw new Error('Leaderboard fetch failed'); return res.json(); })
        .then(function (data) {
            var lb = data.leaderboard || [];
            for (var i = 0; i < lb.length && i < 5; i++) {
                if (lb[i].user_id === gameState.userId) return true;
            }
            return false;
        });
}

function checkSectionLock() {
    var section = window.snakesGameSection || 1;
    var overlay = document.getElementById('locked-overlay');
    if (!overlay) return;

    if (section === 2 && gameState.unlockedSections.indexOf('half2') === -1) overlay.style.display = 'flex';
    else if (section === 3 && gameState.unlockedSections.indexOf('boss') === -1) overlay.style.display = 'flex';
    else overlay.style.display = 'none';
}

function viewLeaderboard() {
    var modal = document.getElementById('leaderboard-modal');
    var tbody = document.querySelector('#leaderboard-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="loading-spinner">Loading leaderboard...</td></tr>';
    if (modal) modal.classList.remove('hidden');

    fetch(API_URL + '/snakes/leaderboard?limit=10', { credentials: 'include' })
        .then(function (res) { if (!res.ok) throw new Error('Failed to fetch leaderboard'); return res.json(); })
        .then(function (data) {
            tbody.innerHTML = '';
            var leaderboardData = data.leaderboard || [];
            if (leaderboardData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-leaderboard">
                            <div class="empty-leaderboard-icon">🏆</div>
                            <p>No players yet! Be the first to earn bullets!</p>
                        </td>
                    </tr>
                `;
                return;
            }
            for (var i = 0; i < leaderboardData.length; i++) {
                var entry = leaderboardData[i];
                var tr = document.createElement('tr');
                if (entry.user_id === gameState.userId) tr.className = 'current-user-row';

                var rankClass = '';
                if (i === 0) rankClass = 'gold';
                else if (i === 1) rankClass = 'silver';
                else if (i === 2) rankClass = 'bronze';
                else rankClass = 'regular';

                var rankBadge = '<span class="rank-badge ' + rankClass + '">' + (i + 1) + '</span>';
                var characterIcon = getCharacterIcon(entry.selected_character || 'knight');

                tr.innerHTML =
                    '<td class="rank-col">' + rankBadge + '</td>' +
                    '<td class="player-col">' + characterIcon + ' ' + (entry.username || 'Unknown') + '</td>' +
                    '<td class="bullets-col">' + (entry.total_bullets || 0) + '</td>' +
                    '<td class="time-col">' + formatTime(entry.time_played || 0) + '</td>';

                tbody.appendChild(tr);
            }
        })
        .catch(function (err) {
            console.error('Leaderboard error:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-leaderboard">
                        <div class="empty-leaderboard-icon">⚠️</div>
                        <p>Error loading leaderboard. Please try again.</p>
                    </td>
                </tr>
            `;
        });
}

function startBossBattle() {
    checkPlayerTopFive().then(function (isTopFive) {
        if (!isTopFive) {
            alert('Only the top 5 players can participate in the boss battle. Check the leaderboard to see where you stand.');
            return;
        }
        // Refresh latest progress from server to get up-to-date bullets/lives/character
        loadProgress().then(function () {
            var modal = document.getElementById('boss-modal');
            if (modal) {
                var pb = document.getElementById('boss-player-bullets'); if (pb) pb.textContent = gameState.bullets;
                var pl = document.getElementById('boss-player-lives'); if (pl) pl.textContent = gameState.lives;
                var ph = document.getElementById('boss-health'); if (ph) ph.textContent = '1000';
                modal.classList.remove('hidden');
            }
        });
    }).catch(function () { alert('Unable to verify leaderboard status. Try again later.'); });
}