/*
 * Snakes and Ladders – Custom Game Logic for AP CS Principles
 * Integrated version with question modals and all original features
 */

var API_URL = 'http://localhost:8301/api';
var FIRST_LESSON_COUNT = 5;
var FIRST_SECTION_SIZE = FIRST_LESSON_COUNT + 1;
var SECOND_SECTION_SIZE = 50;
var BOARD_TOTAL_SQUARES = FIRST_SECTION_SIZE + SECOND_SECTION_SIZE + 1;

var LESSON_BULLETS = 5;
var QUESTION_BULLETS = 5;
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

var multiplayerState = {
    otherPlayers: [],
    refreshInterval: null,
    REFRESH_RATE_MS: 5000,
    MAX_PLAYERS_ON_BOARD: 50
};

function $(selector) { return document.querySelector(selector); }
function $all(selector) { return document.querySelectorAll(selector); }

document.addEventListener('DOMContentLoaded', function () {
    // DON'T hide character selection here - let autoResumeIfReady handle it
    initializeEventListeners();
    checkExistingLogin().then(function () {
        autoResumeIfReady();
    });
});

function initializeEventListeners() {
    var btnUseLogin = document.getElementById('use-existing-login');
    if (btnUseLogin) btnUseLogin.addEventListener('click', useExistingLogin);

    var btnGuest = document.getElementById('play-as-guest');
    if (btnGuest) btnGuest.addEventListener('click', playAsGuest);

    // DON'T add click handlers to character cards here - carousel handles it
    // The carousel will call selectCharacter only for the centered card

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

    // Question modal close handlers
    var questionModalClose = document.querySelector('.question-modal-close');
    if (questionModalClose) {
        questionModalClose.addEventListener('click', function() {
            closeQuestionModal();
        });
    }
    
    var questionModal = document.getElementById('question-modal');
    if (questionModal) {
        questionModal.addEventListener('click', function(e) {
            if (e.target === questionModal) {
                closeQuestionModal();
            }
        });
    }

    var bossAttackBtn = document.getElementById('boss-attack-btn');
    if (bossAttackBtn) bossAttackBtn.addEventListener('click', function () {
        if (gameState.bullets < 10) { alert('You need at least 10 bullets to attack the boss.'); return; }
        gameState.bullets -= 10;
        document.getElementById('boss-player-bullets').textContent = gameState.bullets;
        updatePlayerInfo();
        saveProgress();

        fetch(API_URL + '/boss/attack', {
            method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ damage: 50 })
        }).catch(function () {});
    });

    // Close overlay button handler
    var closeOverlayBtn = document.getElementById('close-overlay-btn');
    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', function() {
            var overlay = document.getElementById('locked-overlay');
            if (overlay) overlay.style.display = 'none';
            window.location.href = 'game-board-part1.html';
        });
    }

    // Player info popup close handlers
    var closePlayerInfo = document.querySelector('.close-player-info');
    if (closePlayerInfo) {
        closePlayerInfo.addEventListener('click', closePlayerInfoPopup);
    }

    var playerInfoModal = document.getElementById('player-info-modal');
    if (playerInfoModal) {
        playerInfoModal.addEventListener('click', function(e) {
            if (e.target === playerInfoModal) {
                closePlayerInfoPopup();
            }
        });
    }
}

function closeQuestionModal() {
    var modal = document.getElementById('question-modal');
    if (modal) {
        modal.classList.remove('active');
    }
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
                // Create new game with current character
                console.log('Creating new game data with character:', gameState.character);
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
            
            // IMPORTANT: Only load character from server if we don't have one selected yet
            if (!gameState.character && data.selected_character) {
                console.log('Loading character from server:', data.selected_character);
                gameState.character = data.selected_character;
            } else if (gameState.character) {
                console.log('Keeping locally selected character:', gameState.character);
            }

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
            if (typeof data.current_square !== 'undefined' && data.current_square !== null) {
                gameState.currentSquare = Number(data.current_square) - 1;
            }
            if (Array.isArray(data.visited_squares)) {
                gameState.visitedSquares = data.visited_squares.map(function (s) { return Number(s) - 1; });
            } else {
                gameState.visitedSquares = gameState.visitedSquares;
            }
            gameState.bullets = Number(data.total_bullets || gameState.bullets);
            gameState.lives = Number(data.lives || gameState.lives);
            gameState.completedLessons = data.completed_lessons || [];
            gameState.unlockedSections = data.unlocked_sections || gameState.unlockedSections;
            
            // IMPORTANT: Only load character from server if we don't have one selected yet
            if (!gameState.character && data.selected_character) {
                console.log('Loading character from progress:', data.selected_character);
                gameState.character = data.selected_character;
            } else if (gameState.character) {
                console.log('Preserving selected character:', gameState.character);
            }

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
            current_square: Number(gameState.currentSquare) + 1,
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
    
    console.log('======================');
    console.log('CHARACTER SELECTED:', gameState.character);
    console.log('Card data-character:', card.getAttribute('data-character'));
    console.log('Character name displayed:', card.querySelector('.character-name').textContent);
    console.log('======================');
    
    // Visual feedback
    var characterName = card.querySelector('.character-name').textContent;
    alert('✓ ' + characterName + ' selected! Click START ADVENTURE to begin.');
    
    // Update UI immediately
    updatePlayerInfo();
    
    // Save to backend if not guest
    if (!gameState.isGuest && gameState.userId) {
        console.log('Saving character to backend:', gameState.character);
        // First, create or load game data with the selected character
        fetch(API_URL + '/snakes/', { credentials: 'include' })
            .then(function (response) {
                if (response.status === 404) {
                    // Create new game entry with selected character
                    console.log('Creating new game entry with character:', gameState.character);
                    return fetch(API_URL + '/snakes/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ selected_character: gameState.character })
                    });
                } else {
                    // Update existing game entry with selected character
                    console.log('Updating existing game with character:', gameState.character);
                    return fetch(API_URL + '/snakes/', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            selected_character: gameState.character,
                            current_square: gameState.currentSquare + 1,
                            visited_squares: gameState.visitedSquares.map(function (s) { return s + 1; }),
                            total_bullets: gameState.bullets,
                            time_played: gameState.timeElapsed,
                            lives: gameState.lives,
                            boss_battle_attempts: gameState.bossAttempts
                        })
                    });
                }
            })
            .then(function(response) {
                if (response && response.ok) {
                    console.log('✓ Character saved successfully to backend');
                } else {
                    console.warn('⚠ Failed to save character to backend');
                }
            })
            .catch(function (error) {
                console.error('❌ Error saving character:', error);
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

    console.log('Starting game with character:', gameState.character);

    loadOrCreateGameData()
        .then(function () { 
            console.log('Game data loaded, character is:', gameState.character);
            return loadProgress(); 
        })
        .then(function () {
            console.log('Progress loaded, character is:', gameState.character);
            
            // Ensure character is saved after loading progress
            if (gameState.character) {
                return saveProgress();
            }
        })
        .then(function () {
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');
            var loginContainer = document.getElementById('login-container');
            if (characterSelection) characterSelection.classList.add('hidden');
            if (gameContainer) gameContainer.classList.remove('hidden');
            if (loginContainer) loginContainer.classList.add('hidden');

            try { localStorage.setItem('snakes_started', '1'); } catch (e) {}

            if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);

            startTimer();
            startAutosave();
            createGameBoard();
            updatePlayerInfo();
            checkSectionLock();
            startMultiplayerRefresh();

            console.log('Game started successfully with character:', gameState.character);
        });
}

function autoResumeIfReady() {
    // Check if user has previously selected a character AND started the game
    var storedChar = null;
    try { storedChar = localStorage.getItem('snakes_selected_character'); } catch (e) {}
    
    var hasStarted = false;
    try { hasStarted = (localStorage.getItem('snakes_started') === '1'); } catch (e) {}
    
    // Only auto-resume if BOTH character is selected AND game was started
    if (storedChar && hasStarted && gameState.userId) {
        gameState.character = storedChar;
        gameState.isGuest = (localStorage.getItem('snakes_isGuest') === '1');

        return loadOrCreateGameData().then(function () { return loadProgress(); }).then(function () {
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');
            var loginContainer = document.getElementById('login-container');
            if (characterSelection) characterSelection.classList.add('hidden');
            if (gameContainer) gameContainer.classList.remove('hidden');
            if (loginContainer) loginContainer.classList.add('hidden');

            if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo(); checkSectionLock(); startMultiplayerRefresh();
        }).catch(function () {});
    }
    
    // Otherwise, show the appropriate screen (login or character selection)
    return Promise.resolve();
}

function createGameBoard() {
    var board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';

    var section = window.snakesGameSection || 1;
    board.setAttribute('data-scale', section === 1 ? 'lesson' : 'question');
    if (board.parentElement) {
        board.parentElement.setAttribute('data-scale', section === 1 ? 'lesson' : 'question');
        if (board.parentElement.parentElement) {
            var stage = board.parentElement.parentElement;
            if (stage.classList.contains('board-stage')) {
                stage.setAttribute('data-scale', section === 1 ? 'lesson' : 'question');
            }
        }
    }
    
    if (section === 1) {
        var row = document.createElement('div');
        row.className = 'board-row single-row';
        row.style.setProperty('--first-size', FIRST_SECTION_SIZE);
        row.style.setProperty('--board-scale', 'lesson');
        for (var i = 0; i < FIRST_SECTION_SIZE; i++) {
            var squareNum = i;
            var square = document.createElement('div');
            square.className = 'square small-lesson';
            square.setAttribute('data-square', squareNum);

            if (gameState.visitedSquares.indexOf(squareNum) !== -1) square.classList.add('visited');
            if (squareNum === gameState.currentSquare) square.classList.add('current');

            var numSpan = document.createElement('span');
            numSpan.className = 'square-number';
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

            renderOtherPlayersOnSquare(square, squareNum);

            row.appendChild(square);
        }
        board.appendChild(row);
        return;
    }

    var start = FIRST_SECTION_SIZE;
    var cols = 10;
    var rows = 5;

    for (var r = rows - 1; r >= 0; r--) {
        var rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';
        for (var c = 0; c < cols; c++) {
            var squareNum;
            var globalIdx = (r * cols) + c;
            if (r % 2 === 1) {
                squareNum = start + (r * cols) + (cols - 1 - c);
            } else {
                squareNum = start + (r * cols) + c;
            }

            var square = document.createElement('div');
            square.className = 'square medium';
            square.setAttribute('data-square', squareNum);

            if (gameState.visitedSquares.indexOf(squareNum) !== -1) square.classList.add('visited');
            if (squareNum === gameState.currentSquare) square.classList.add('current');

            var numSpan = document.createElement('span');
            numSpan.className = 'square-number';
            numSpan.textContent = (squareNum === 0) ? 'START' : squareNum;
            square.appendChild(numSpan);

            var icon = document.createElement('div');
            icon.className = 'square-icon';
            if (snakesAndLaddersMap[squareNum]) {
                if (snakesAndLaddersMap[squareNum] > squareNum) icon.textContent = '🪜';
                else icon.textContent = '🐍';
                if (snakesAndLaddersMap[squareNum] > squareNum) square.classList.add('ladder'); else square.classList.add('snake');
            } else if (squareNum === (FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1)) {
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

            renderOtherPlayersOnSquare(square, squareNum);

            rowDiv.appendChild(square);
        }
        board.appendChild(rowDiv);
    }
}

function getCharacterIcon(character) {
    var icons = { knight: '🛡️', wizard: '🧙', archer: '🏹', warrior: '⚔️' };
    var icon = icons[character] || '🙂';
    if (icon === '🙂') {
        console.warn('Character not recognized:', character, '- available characters:', Object.keys(icons));
    }
    return icon;
}

// ============================================
// MULTIPLAYER FUNCTIONS
// ============================================

function fetchAllPlayers() {
    return fetch(API_URL + '/snakes/leaderboard?limit=' + multiplayerState.MAX_PLAYERS_ON_BOARD, {
        credentials: 'include'
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Failed to fetch players');
        return response.json();
    })
    .then(function(data) {
        multiplayerState.otherPlayers = (data.leaderboard || []).filter(function(player) {
            return player.user_id !== gameState.userId;
        });
        return multiplayerState.otherPlayers;
    })
    .catch(function(error) {
        console.error('Error fetching players:', error);
        return [];
    });
}

function getPlayersOnSquare(squareNum) {
    var apiSquareNum = squareNum + 1;
    return multiplayerState.otherPlayers.filter(function(player) {
        return player.current_square === apiSquareNum;
    });
}

function renderOtherPlayersOnSquare(square, squareNum) {
    var playersHere = getPlayersOnSquare(squareNum);
    if (playersHere.length === 0) return;

    var container = document.createElement('div');
    container.className = 'other-players-container';

    var maxVisible = 3;
    var visiblePlayers = playersHere.slice(0, maxVisible);
    var hiddenCount = playersHere.length - maxVisible;

    visiblePlayers.forEach(function(player, index) {
        var marker = document.createElement('div');
        marker.className = 'other-player-marker';
        marker.setAttribute('data-player-id', player.user_id);
        marker.setAttribute('data-player-name', player.username);
        marker.textContent = getCharacterIcon(player.selected_character);
        marker.style.transform = 'translate(' + (index * 8) + 'px, ' + (index * -4) + 'px)';

        marker.addEventListener('click', function(e) {
            e.stopPropagation();
            showPlayerInfoPopup(player);
        });

        container.appendChild(marker);
    });

    if (hiddenCount > 0) {
        var badge = document.createElement('div');
        badge.className = 'player-count-badge';
        badge.textContent = '+' + hiddenCount;
        container.appendChild(badge);
    }

    square.appendChild(container);
}

function startMultiplayerRefresh() {
    fetchAllPlayers().then(function() {
        createGameBoard();
    });

    if (multiplayerState.refreshInterval) {
        clearInterval(multiplayerState.refreshInterval);
    }
    multiplayerState.refreshInterval = setInterval(function() {
        fetchAllPlayers().then(function() {
            createGameBoard();
        });
    }, multiplayerState.REFRESH_RATE_MS);
}

function stopMultiplayerRefresh() {
    if (multiplayerState.refreshInterval) {
        clearInterval(multiplayerState.refreshInterval);
        multiplayerState.refreshInterval = null;
    }
}

function showPlayerInfoPopup(player) {
    var modal = document.getElementById('player-info-modal');
    if (!modal) return;

    var characterIcon = document.getElementById('popup-character-icon');
    var playerName = document.getElementById('popup-player-name');
    var characterName = document.getElementById('popup-character-name');
    var position = document.getElementById('popup-position');
    var bullets = document.getElementById('popup-bullets');
    var time = document.getElementById('popup-time');
    var lives = document.getElementById('popup-lives');
    var visited = document.getElementById('popup-visited');

    if (characterIcon) characterIcon.textContent = getCharacterIcon(player.selected_character);
    if (playerName) playerName.textContent = player.username || 'Unknown Player';
    if (characterName) {
        var charNames = { knight: 'Knight', wizard: 'Wizard', archer: 'Archer', warrior: 'Warrior' };
        characterName.textContent = charNames[player.selected_character] || 'Unknown';
    }
    if (position) position.textContent = 'Square ' + (player.current_square || 1);
    if (bullets) bullets.textContent = (player.total_bullets || 0) + ' bullets';
    if (time) time.textContent = formatTime(player.time_played || 0);
    if (lives) lives.textContent = (player.lives || 0) + ' remaining';
    if (visited) {
        var visitedCount = (player.visited_squares || []).length;
        visited.textContent = visitedCount + ' squares';
    }

    modal.classList.remove('hidden');
}

function closePlayerInfoPopup() {
    var modal = document.getElementById('player-info-modal');
    if (modal) modal.classList.add('hidden');
}

function updatePlayerInfo() {
    var charSpan = document.getElementById('player-character');
    var bulletsSpan = document.getElementById('player-bullets');
    var livesSpan = document.getElementById('player-lives');
    var squareSpan = document.getElementById('player-square');
    var timeSpan = document.getElementById('player-time');

    console.log('Updating player info with character:', gameState.character);
    
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
        roll = 1;
    } else {
        roll = Math.floor(Math.random() * 6) + 1;
    }

    showDiceAnimation(roll).then(function() {
        movePlayer(roll).then(function () {
            if (diceBtn) diceBtn.disabled = false;
        });
    });
}

function showDiceAnimation(roll) {
    return new Promise(function(resolve) {
        var overlay = document.getElementById('dice-overlay');
        var cube = document.getElementById('dice-cube');
        var resultDisplay = document.getElementById('dice-result-display');
        var resultNumber = document.getElementById('dice-result-number');

        if (!overlay || !cube) {
            alert('You rolled a ' + roll + '!');
            resolve();
            return;
        }

        var faceRotations = {
            1: 'rotateX(0deg) rotateY(0deg)',
            2: 'rotateX(0deg) rotateY(90deg)',
            3: 'rotateX(-90deg) rotateY(0deg)',
            4: 'rotateX(90deg) rotateY(0deg)',
            5: 'rotateX(0deg) rotateY(-90deg)',
            6: 'rotateX(0deg) rotateY(180deg)'
        };

        overlay.classList.remove('hidden');
        if (resultDisplay) resultDisplay.classList.remove('show');
        cube.classList.remove('rolling');
        cube.style.transform = '';

        void cube.offsetWidth;

        cube.classList.add('rolling');

        setTimeout(function() {
            cube.classList.remove('rolling');
            cube.style.transform = faceRotations[roll];

            if (resultNumber) resultNumber.textContent = roll;
            if (resultDisplay) resultDisplay.classList.add('show');

            setTimeout(function() {
                overlay.classList.add('hidden');
                cube.style.transform = '';
                resolve();
            }, 1200);
        }, 1500);
    });
}

function movePlayer(steps) {
    return new Promise(function (resolve) {
        var section = window.snakesGameSection || 1;
        var sectionStart = (section === 1) ? 0 : FIRST_SECTION_SIZE;
        var sectionEnd = (section === 1) ? (FIRST_SECTION_SIZE - 1) : (FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1);

        var tentative = gameState.currentSquare + steps;
        if (section === 1) {
            if (tentative > sectionEnd) tentative = sectionEnd;
        } else {
            if (tentative > sectionEnd) {
                tentative = sectionEnd;
            }
        }

        if (section === 2) {
            var maxAttempts = SECOND_SECTION_SIZE;
            var attempts = 0;
            var newSquare = tentative;
            while (gameState.visitedSquares.indexOf(newSquare) !== -1 && attempts < maxAttempts) {
                newSquare++;
                if (newSquare > sectionEnd) newSquare = sectionStart;
                attempts++;
            }
            if (attempts >= maxAttempts) newSquare = tentative;

            gameState.currentSquare = newSquare;
            if (gameState.visitedSquares.indexOf(newSquare) === -1) gameState.visitedSquares.push(newSquare);
        } else {
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
    
    if (section === 1) {
        if (square === 0) {
            alert('This is START. Roll the dice to move to the first lesson.');
            return;
        }
        
        if (square >= 1 && square <= FIRST_LESSON_COUNT) {
            var lessonNum = square;
            if (gameState.completedLessons.indexOf(lessonNum) === -1) {
                window.location.href = 'lessons/lesson' + lessonNum + '.html';
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
            showQuestionModal(square, row2, index2);
            return;
        }
    }
    
    console.warn('Unhandled square event:', square, 'in section', section);
}

function showQuestionModal(square, row, index) {
    var modal = document.getElementById('question-modal');
    if (!modal) {
        console.error('Question modal not found');
        return;
    }
    
    if (!window.QUESTIONS_BANK) {
        alert('Question data not loaded. Please refresh the page.');
        return;
    }
    
    var BANK = window.QUESTIONS_BANK;
    if (!BANK[row] || !BANK[row][index]) {
        console.error('Question not found for row/index:', row, index);
        alert('Question not found. Please try again.');
        return;
    }
    
    var question = BANK[row][index];
    
    document.getElementById('question-title').textContent = 'Lesson ' + row + ' • Question ' + (index + 1);
    document.getElementById('question-subtitle').textContent = 'Answer correctly to earn 5 bullets!';
    document.getElementById('question-prompt').textContent = question.prompt;
    document.getElementById('question-meta').textContent = 'Square: ' + square + ' (Row ' + row + ', Index ' + index + ')';
    
    var optionsDiv = document.getElementById('question-options');
    optionsDiv.innerHTML = '';
    
    question.options.forEach(function(opt, i) {
        var label = document.createElement('label');
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'question-answer';
        radio.value = i;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + opt));
        optionsDiv.appendChild(label);
    });
    
    var arcadeZone = modal.querySelector('.question-arcade');
    if (arcadeZone) {
        // Use MiniGames system for lesson-related games
        var gameName = null;
        var gameTitle = 'Mini Challenge';
        var gameDesc = 'Complete the challenge!';

        if (window.MiniGames) {
            // Get the game distribution for this row (cached per row)
            // Each row has 10 squares, each game appears twice
            if (!window.questionGameDistributions) {
                window.questionGameDistributions = {};
            }
            if (!window.questionGameDistributions[row]) {
                // Get all 5 game names for this lesson
                var gameNames = window.MiniGames.GAME_NAMES[row] || [];
                if (gameNames.length >= 5) {
                    // Each game appears twice for 10 squares total
                    var fullDistribution = [];
                    gameNames.forEach(function(name) {
                        fullDistribution.push(name);
                        fullDistribution.push(name);
                    });
                    // Shuffle the distribution
                    for (var i = fullDistribution.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = fullDistribution[i];
                        fullDistribution[i] = fullDistribution[j];
                        fullDistribution[j] = temp;
                    }
                    window.questionGameDistributions[row] = fullDistribution;
                } else {
                    // Fallback to basic distribution
                    window.questionGameDistributions[row] = window.MiniGames.getGameDistributionForRow(row);
                }
            }
            var distribution = window.questionGameDistributions[row];
            gameName = distribution[index % distribution.length];

            // Get game display name from the game object
            var gameObj = window.MiniGames.getGame(row, gameName);
            if (gameObj && gameObj.name) {
                gameTitle = gameObj.name;
            }

            // Set attributes for MiniGames integration
            arcadeZone.dataset.arcadeLesson = row;
            arcadeZone.dataset.arcadeGame = gameName;
            arcadeZone.classList.add('compact');
            delete arcadeZone.dataset.arcadeMode; // Remove old mode attribute

            gameDesc = 'Complete the ' + gameTitle + ' challenge to unlock the question!';
        } else {
            // Fallback to old arcade modes if MiniGames not loaded
            var arcadeModes = ['orb', 'sequence', 'tic'];
            var chosenMode = arcadeModes[Math.abs(square + row + index) % arcadeModes.length];
            arcadeZone.dataset.arcadeMode = chosenMode;

            if (chosenMode === 'sequence') {
                arcadeZone.dataset.arcadeTarget = 4;
                gameDesc = 'Memorize the flashing arrow pattern to prime your brain.';
            } else if (chosenMode === 'tic') {
                gameDesc = 'Win a quiz-powered tic-tac-toe match to earn your attempt.';
            } else {
                gameDesc = 'Move your hero with WASD or arrows while you prep for row ' + row + '.';
            }
        }

        arcadeZone.querySelector('.arcade-header h3').textContent = gameTitle;
        arcadeZone.querySelector('.arcade-header p').textContent = gameDesc;
        arcadeZone.dataset.arcadeComplete = 'Challenge complete! Now answer the question to earn bullets.';

        // Initialize arcade when modal opens
        if (typeof window.initArcadeZone === 'function') {
            try {
                // Clear any existing arcade instance
                var existingGrid = arcadeZone.querySelector('.arcade-grid');
                if (existingGrid) {
                    existingGrid.innerHTML = '';
                }
                // Create new arcade instance
                window.initArcadeZone(arcadeZone);
            } catch(e) {
                console.warn('Could not initialize arcade:', e);
            }
        }
    }
    
    var submitBtn = document.getElementById('question-submit');
    var newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    
    newBtn.addEventListener('click', function() {
        var selected = document.querySelector('input[name="question-answer"]:checked');
        if (!selected) {
            alert('Please select an answer.');
            return;
        }
        
        newBtn.disabled = true;
        
        var chosen = parseInt(selected.value, 10);
        var correct = (chosen === question.answer);
        var bullets = correct ? QUESTION_BULLETS : 0;
        
        fetch(API_URL + '/snakes/answer-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                square: Number(square) + 1,
                row: row,
                question_index: index,
                correct: correct,
                bullets_earned: bullets
            })
        })
        .then(function(res) {
            if (res.ok) {
                alert(correct ? 'Correct! You earned ' + QUESTION_BULLETS + ' bullets.' : 'Incorrect. No bullets awarded.');
                
                if (correct) {
                    gameState.bullets += QUESTION_BULLETS;
                    updatePlayerInfo();
                }
                
                closeQuestionModal();
                createGameBoard();
                
                return;
            }
            
            return res.json().then(function(data) {
                alert(data.error || data.message || 'Error submitting answer.');
            });
        })
        .catch(function(err) {
            console.error(err);
            alert('Network error.');
        })
        .finally(function() {
            newBtn.disabled = false;
        });
    });
    
    modal.classList.add('active');
}

var snakesAndLaddersMap = {
    9: 19,
    13: 31,
    24: 35,
    29: 41,
    16: 8,
    38: 21,
    45: 33,
    51: 42
};

function animateMoveToSquare(from, to) {
    var board = document.getElementById('game-board');
    var fromEl = board.querySelector('[data-square="' + from + '"]');
    var toEl = board.querySelector('[data-square="' + to + '"]');
    if (!fromEl || !toEl) {
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
            checkPlayerTopFive().then(function (isTopFive) {
                if (!isTopFive) {
                    if (overlay) overlay.style.display = 'flex';
                    alert('Only the top 5 players on the leaderboard can enter the boss battle. Climb the ranks!');
                    return;
                }
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