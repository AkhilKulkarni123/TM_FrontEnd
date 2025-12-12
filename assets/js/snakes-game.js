/*
 * Snakes and Ladders – Custom Game Logic for AP CS Principles
 *
 * Split board:
 *  - First half (1–25): 5 lesson rows (AP CSP topics)
 *  - Second half (26–50): questions based on those lessons
 *  - After 50: boss battle
 *
 * This script:
 *  - Uses website login via JWT cookie (/api/id)
 *  - Loads/saves progress via /api/snakes and /api/snakes/progress
 *  - Handles lessons (/snakes/complete-lesson) and questions
 *    (/snakes/answer-question)
 */

// ============================================================
// Configuration
// ============================================================

// IMPORTANT: Always use localhost (not 127.0.0.1) so cookies match domain.
var API_URL = 'http://localhost:8001/api';

// Board constants
var BOARD_TOTAL_SQUARES = 50;
var HALF_SIZE = 25;

// Bullets
var LESSON_BULLETS = 5;
var QUESTION_BULLETS = 2;

// Autosave cadence (seconds)
var AUTOSAVE_EVERY_SECONDS = 10;

// ============================================================
// Game State
// ============================================================

var gameState = {
    isGuest: false,
    userId: null,
    username: '',
    character: '',
    bullets: 0,
    lives: 3,
    currentSquare: 1,
    visitedSquares: [1],
    completedLessons: [],
    unlockedSections: ['half1'], // 'half1', 'half2', 'boss'
    timeStarted: null,
    timeElapsed: 0,
    bossAttempts: 0,
    socket: null
};

// Helper: safe querySelector
function $(selector) {
    return document.querySelector(selector);
}
function $all(selector) {
    return document.querySelectorAll(selector);
}

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    checkExistingLogin();
});

function initializeEventListeners() {
    var btnUseLogin = document.getElementById('use-existing-login');
    if (btnUseLogin) {
        btnUseLogin.addEventListener('click', useExistingLogin);
    }

    var btnGuest = document.getElementById('play-as-guest');
    if (btnGuest) {
        btnGuest.addEventListener('click', playAsGuest);
    }

    var characterCards = $all('.character-card');
    for (var i = 0; i < characterCards.length; i++) {
        (function (card) {
            card.addEventListener('click', function () {
                selectCharacter(card);
            });
        })(characterCards[i]);
    }

    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }

    var rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) {
        rollBtn.addEventListener('click', rollDice);
    }

    var leaderboardBtn = document.getElementById('view-leaderboard-btn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', viewLeaderboard);
    }

    var prevBtn = document.getElementById('prev-section-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', navigatePrev);
    }

    var nextBtn = document.getElementById('next-section-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', navigateNext);
    }

    var closeButtons = $all('.close-modal');
    for (var j = 0; j < closeButtons.length; j++) {
        closeButtons[j].addEventListener('click', function () {
            var modals = $all('.modal');
            for (var k = 0; k < modals.length; k++) {
                modals[k].classList.add('hidden');
            }
        });
    }
}

// ============================================================
// Login / User handling
// ============================================================

function checkExistingLogin() {
    fetch(API_URL + '/id', { credentials: 'include' })
        .then(function (response) {
            if (!response.ok) return null;
            return response.json();
        })
        .then(function (userData) {
            if (!userData) return;
            gameState.userId = userData.id;
            gameState.username = userData.name;
        })
        .catch(function () {
            // ignore
        });
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
        .then(function () {
            return loadProgress();
        })
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

    var loginContainer = document.getElementById('login-container');
    var characterSelection = document.getElementById('character-selection');
    if (loginContainer) loginContainer.classList.add('hidden');
    if (characterSelection) characterSelection.classList.remove('hidden');
}

// ============================================================
// Game data load/save
// ============================================================

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
        .then(function (response) {
            if (!response || !response.ok) return null;
            return response.json();
        })
        .then(function (data) {
            if (!data) return;

            gameState.bullets = Number(data.total_bullets || 0);
            gameState.currentSquare = Number(data.current_square || 1);
            gameState.visitedSquares = data.visited_squares || [1];
            gameState.lives = Number(data.lives || 3);
            gameState.bossAttempts = Number(data.boss_battle_attempts || 0);
            gameState.timeElapsed = Math.floor(Number(data.time_played || 0));
            gameState.character = data.selected_character || gameState.character;

            // Ensure timeStarted syncs to stored elapsed
            if (gameState.timeStarted === null) {
                gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            }
        })
        .catch(function (error) {
            console.error('Error loading game data:', error);
        });
}

function loadProgress() {
    if (gameState.isGuest) return Promise.resolve();

    return fetch(API_URL + '/snakes/progress', { credentials: 'include' })
        .then(function (response) {
            if (!response.ok) return null;
            return response.json();
        })
        .then(function (data) {
            if (!data) return;

            gameState.currentSquare = Number(data.current_square || gameState.currentSquare);
            gameState.visitedSquares = data.visited_squares || gameState.visitedSquares;
            gameState.bullets = Number(data.total_bullets || gameState.bullets);
            gameState.lives = Number(data.lives || gameState.lives);
            gameState.completedLessons = data.completed_lessons || [];
            gameState.unlockedSections = data.unlocked_sections || gameState.unlockedSections;

            // some APIs also return time_played; if present, keep it synced
            if (typeof data.time_played !== 'undefined' && data.time_played !== null) {
                gameState.timeElapsed = Math.floor(Number(data.time_played || gameState.timeElapsed));
                if (gameState.timeStarted !== null) {
                    gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
                }
            }
        })
        .catch(function (error) {
            console.error('Error loading progress:', error);
        });
}

// IMPORTANT: Your old saveProgress() did NOT send time_played,
// and would often “look like it saved” but time/bullets were never committed.
// This function fixes that.
function saveProgress() {
    if (gameState.isGuest) return Promise.resolve();

    // Always keep timeElapsed in sync before saving
    if (gameState.timeStarted !== null) {
        gameState.timeElapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);
    }

    return fetch(API_URL + '/snakes/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            current_square: gameState.currentSquare,
            visited_squares: gameState.visitedSquares,
            total_bullets: gameState.bullets,
            time_played: gameState.timeElapsed, // ✅ FIX: actually persist time
            lives: gameState.lives,
            boss_battle_attempts: gameState.bossAttempts,
            selected_character: gameState.character
        })
    })
        .then(function (res) {
            if (!res.ok) {
                return res.json().then(function (j) {
                    console.error('Save progress failed:', j);
                }).catch(function () {
                    console.error('Save progress failed:', res.status);
                });
            }
        })
        .catch(function (error) {
            console.error('Error saving progress:', error);
        });
}

// Small helper: save and ignore errors
function saveProgressSilently() {
    try { saveProgress(); } catch (e) { /* ignore */ }
}

// ============================================================
// Character selection and game start
// ============================================================

function selectCharacter(card) {
    var cards = $all('.character-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('selected');
    }
    card.classList.add('selected');
    gameState.character = card.getAttribute('data-character');

    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.disabled = false;
}

function startGame() {
    if (!gameState.character) {
        alert('Please select a character!');
        return;
    }

    loadOrCreateGameData()
        .then(function () {
            return loadProgress();
        })
        .then(function () {
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');
            if (characterSelection) characterSelection.classList.add('hidden');
            if (gameContainer) gameContainer.classList.remove('hidden');

            if (gameState.timeStarted === null) {
                gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            }

            startTimer();
            startAutosave();
            createGameBoard();
            updatePlayerInfo();
            checkSectionLock();
        });
}

// ============================================================
// Rendering & UI updates
// ============================================================

function createGameBoard() {
    var board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';

    var section = window.snakesGameSection || 1;
    var start = (section === 1) ? 1 : 26;

    // 5x5 grid
    for (var row = 4; row >= 0; row--) {
        for (var col = 0; col < 5; col++) {
            var squareNum;
            var globalRow = (section === 1) ? row : row + 5;

            if (globalRow % 2 === 1) {
                squareNum = start + (row * 5) + (4 - col);
            } else {
                squareNum = start + (row * 5) + col;
            }

            var square = document.createElement('div');
            square.className = 'square';
            square.setAttribute('data-square', squareNum);

            if (gameState.visitedSquares.indexOf(squareNum) !== -1) {
                square.classList.add('visited');
            }
            if (squareNum === gameState.currentSquare) {
                square.classList.add('current');
            }

            var numSpan = document.createElement('span');
            numSpan.className = 'square-number';
            numSpan.textContent = squareNum;
            square.appendChild(numSpan);

            var icon = document.createElement('div');
            icon.className = 'square-icon';
            icon.textContent = (squareNum === 50) ? '👹' : '⭐';
            square.appendChild(icon);

            if (squareNum === gameState.currentSquare) {
                var marker = document.createElement('div');
                marker.className = 'player-marker';
                marker.textContent = getCharacterIcon(gameState.character);
                square.appendChild(marker);
            }

            board.appendChild(square);
        }
    }
}

function getCharacterIcon(character) {
    var icons = {
        knight: '🛡️',
        wizard: '🧙',
        archer: '🏹',
        warrior: '⚔️'
    };
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
    if (squareSpan) squareSpan.textContent = gameState.currentSquare;
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

// Save time/bullets periodically so it never “looks like it saved but didn’t”
function startAutosave() {
    setInterval(function () {
        if (gameState.isGuest) return;
        saveProgressSilently();
    }, AUTOSAVE_EVERY_SECONDS * 1000);
}

// ============================================================
// Game logic: dice rolling and movement
// ============================================================

function rollDice() {
    var diceBtn = document.getElementById('roll-dice-btn');
    if (diceBtn) diceBtn.disabled = true;

  const diceAnim = document.getElementById('dice-animation');
  diceAnim.classList.remove('hidden');

  const roll = Math.floor(Math.random() * 5) + 1;

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
        var maxSquare = (section === 1) ? 25 : 50;

        var newSquare = gameState.currentSquare + steps;

  if (newSquare > BOARD_SIZE) {
    newSquare = BOARD_SIZE - (newSquare - BOARD_SIZE);
  }

  await animateMovement(gameState.currentSquare, newSquare);
  gameState.currentSquare = newSquare;

  // Snake
  if (snakes[newSquare]) {
    await new Promise(resolve => setTimeout(resolve, 500));
    alert(
      `Oh no! You hit a snake! Sliding down to square ${snakes[newSquare]}`
    );
    await animateMovement(newSquare, snakes[newSquare]);
    gameState.currentSquare = snakes[newSquare];
  }

  // Ladder
  if (ladders[newSquare]) {
    await new Promise(resolve => setTimeout(resolve, 500));
    alert(
      `Great! You found a ladder! Climbing up to square ${ladders[newSquare]}`
    );
    await animateMovement(newSquare, ladders[newSquare]);
    gameState.currentSquare = ladders[newSquare];
  }

  if (!gameState.visitedSquares.includes(gameState.currentSquare)) {
    gameState.visitedSquares.push(gameState.currentSquare);
  }

        createGameBoard();
        updatePlayerInfo();

        // ✅ Save progress with time_played, bullets, etc.
        saveProgress();

        handleSquareEvent();
        resolve();
    });
}

function handleSquareEvent() {
    var section = window.snakesGameSection || 1;
    var square = gameState.currentSquare;

    if (section === 1) {
        var row = Math.ceil(square / 5); // 1–5
        if (gameState.completedLessons.indexOf(row) === -1) {
            window.location.href = 'lessons/lesson' + row + '.html';
        } else {
            if (row < 5) {
                var nextRowSquare = (row * 5) + 1;
                gameState.currentSquare = nextRowSquare;
                if (gameState.visitedSquares.indexOf(nextRowSquare) === -1) {
                    gameState.visitedSquares.push(nextRowSquare);
                }
                createGameBoard();
                updatePlayerInfo();
                saveProgress();
                alert('Lesson already complete. Moving you to the next row.');
            } else {
                if (gameState.unlockedSections.indexOf('half2') === -1) {
                    gameState.unlockedSections.push('half2');
                }
                // persist unlock + time/bullets
                saveProgress();
                alert('All lessons completed! You can now go to the next section.');
            }
        }
    } else {
        var idx = square - 26;
        var row2 = Math.floor(idx / 5) + 1;
        var index = idx % 5;
        window.location.href =
            'questions/question_template.html?row=' +
            row2 +
            '&index=' +
            index +
            '&square=' +
            square;
    }
}

// ============================================================
// Navigation between sections
// ============================================================

function navigatePrev() {
    var section = window.snakesGameSection || 1;
    if (section === 2) {
        window.location.href = 'game-board-part1.html';
    }
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
            if (overlay) overlay.style.display = 'flex';
            return;
        }
        window.location.href = '../boss-battle.html';
    }
}

function checkSectionLock() {
    var section = window.snakesGameSection || 1;
    var overlay = document.getElementById('locked-overlay');
    if (!overlay) return;

    if (section === 2 && gameState.unlockedSections.indexOf('half2') === -1) {
        overlay.style.display = 'flex';
    } else if (section === 3 && gameState.unlockedSections.indexOf('boss') === -1) {
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

// ============================================================
// Leaderboard
// ============================================================

function viewLeaderboard() {
    var modal = document.getElementById('leaderboard-modal');
    var tbody = document.querySelector('#leaderboard-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    fetch(API_URL + '/snakes/leaderboard', { credentials: 'include' })
        .then(function (res) {
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            return res.json();
        })
        .then(function (data) {
            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + (i + 1) + '</td>' +
                    '<td>' + entry.username + '</td>' +
                    '<td>' + entry.total_bullets + '</td>' +
                    '<td>' + formatTime(entry.time_played) + '</td>';
                tbody.appendChild(tr);
            }
            if (modal) modal.classList.remove('hidden');
        })
        .catch(function (err) {
            console.error(err);
            alert('Error loading leaderboard.');
        });
}

// ============================================================
// Boss battle (stub)
// ============================================================

function startBossBattle() {
    var modal = document.getElementById('boss-modal');
    if (modal) modal.classList.remove('hidden');
}
