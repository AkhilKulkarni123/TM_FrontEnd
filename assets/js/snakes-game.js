// Configuration
const API_URL = 'http://127.0.0.1:8587/api';
const SOCKET_URL = 'http://127.0.0.1:8587';
const BOARD_SIZE = 100;

// Game state
let gameState = {
    isGuest: false,
    userId: null,
    username: '',
    character: '',
    bullets: 0,
    lives: 3,
    currentSquare: 1,
    visitedSquares: [1],
    timeStarted: null,
    timeElapsed: 0,
    bossAttempts: 0,
    socket: null
};

// Snakes and Ladders positions
const snakes = {
    16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};

const ladders = {
    1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
};

const bossBattleSquare = 100;

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkExistingLogin();
});

function initializeEventListeners() {
    // Login buttons
    document.getElementById('use-existing-login')?.addEventListener('click', useExistingLogin);
    document.getElementById('play-as-guest')?.addEventListener('click', playAsGuest);
    
    // Character selection
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => selectCharacter(card));
    });
    
    document.getElementById('start-game-btn')?.addEventListener('click', startGame);
    
    // Game controls
    document.getElementById('roll-dice-btn')?.addEventListener('click', rollDice);
    document.getElementById('view-leaderboard-btn')?.addEventListener('click', viewLeaderboard);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
        });
    });
}

async function checkExistingLogin() {
    try {
        const response = await fetch(`${API_URL}/user/current`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            gameState.userId = userData.id;
            gameState.username = userData.name;
            // User is already logged in
        }
    } catch (error) {
        console.log('No existing login found');
    }
}

async function useExistingLogin() {
    try {
        const response = await fetch(`${API_URL}/user/current`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            alert('Please log in to the website first, then return to the game.');
            window.location.href = '/login';  // Adjust this to your login page
            return;
        }
        
        const userData = await response.json();
        gameState.isGuest = false;
        gameState.userId = userData.id;
        gameState.username = userData.name;
        
        // Check if game data exists
        await loadOrCreateGameData();
        
        // Show character selection
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('character-selection').classList.remove('hidden');
    } catch (error) {
        console.error('Login error:', error);
        alert('Error connecting to server. Please try again.');
    }
}

function playAsGuest() {
    gameState.isGuest = true;
    gameState.userId = 'guest_' + Date.now();
    gameState.username = 'Guest_' + Math.floor(Math.random() * 1000);
    
    // Show character selection
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('character-selection').classList.remove('hidden');
}

async function loadOrCreateGameData() {
    if (gameState.isGuest) return;
    
    try {
        let response = await fetch(`${API_URL}/snakes/`, {
            credentials: 'include'
        });
        
        if (response.status === 404) {
            // Create new game data
            response = await fetch(`${API_URL}/snakes/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ selected_character: gameState.character })
            });
        }
        
        if (response.ok) {
            const data = await response.json();
            gameState.bullets = data.total_bullets || 0;
            gameState.currentSquare = data.current_square || 1;
            gameState.visitedSquares = data.visited_squares || [1];
            gameState.lives = data.lives || 3;
            gameState.bossAttempts = data.boss_battle_attempts || 0;
            gameState.timeElapsed = data.time_played || 0;
            gameState.character = data.selected_character || gameState.character;
        }
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

function selectCharacter(card) {
    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    gameState.character = card.dataset.character;
    document.getElementById('start-game-btn').disabled = false;
}

async function startGame() {
    if (!gameState.character) {
        alert('Please select a character!');
        return;
    }
    
    // Load or create game data
    await loadOrCreateGameData();
    
    // Hide character selection and show game
    document.getElementById('character-selection').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    // Initialize game board
    createGameBoard();
    updatePlayerInfo();
    
    // Start timer
    gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
    startTimer();
    
    // Initialize socket for boss battle
    if (!gameState.isGuest) {
        initializeSocket();
    }
}

function createGameBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Create squares (100 to 1, going right-to-left, bottom-to-top)
    for (let row = 9; row >= 0; row--) {
        for (let col = 0; col < 10; col++) {
            let squareNum;
            if (row % 2 === 1) {
                // Odd rows go right to left
                squareNum = row * 10 + (10 - col);
            } else {
                // Even rows go left to right
                squareNum = row * 10 + (col + 1);
            }
            
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.square = squareNum;
            
            // Check if visited
            if (gameState.visitedSquares.includes(squareNum)) {
                square.classList.add('visited');
            }
            
            // Check if current
            if (squareNum === gameState.currentSquare) {
                square.classList.add('current');
            }
            
            // Add square number
            const numberSpan = document.createElement('span');
            numberSpan.className = 'square-number';
            numberSpan.textContent = squareNum;
            square.appendChild(numberSpan);
            
            // Add icon based on type
            const icon = document.createElement('div');
            icon.className = 'square-icon';
            
            if (squareNum === bossBattleSquare) {
                icon.textContent = '🐉';
                square.classList.add('boss');
            } else if (snakes[squareNum]) {
                icon.textContent = '🐍';
                square.classList.add('snake');
            } else if (ladders[squareNum]) {
                icon.textContent = '🪜';
                square.classList.add('ladder');
            } else {
                icon.textContent = '⭐';
            }
            
            square.appendChild(icon);
            
            // Add player marker if current square
            if (squareNum === gameState.currentSquare) {
                const marker = document.createElement('div');
                marker.className = 'player-marker';
                marker.textContent = getCharacterIcon(gameState.character);
                square.appendChild(marker);
            }
            
            board.appendChild(square);
        }
    }
}

function getCharacterIcon(character) {
    const icons = {
        knight: '🛡️',
        wizard: '🧙',
        archer: '🏹',
        warrior: '⚔️'
    };
    return icons[character] || '🛡️';
}

function updatePlayerInfo() {
    document.getElementById('player-name').textContent = gameState.username;
    document.getElementById('player-character').textContent = getCharacterIcon(gameState.character);
    document.getElementById('player-bullets').textContent = gameState.bullets;
    document.getElementById('player-lives').textContent = gameState.lives;
    document.getElementById('current-square').textContent = gameState.currentSquare;
}

function startTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('time-played').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        gameState.timeElapsed = elapsed;
    }, 1000);
}

async function rollDice() {
    const diceBtn = document.getElementById('roll-dice-btn');
    diceBtn.disabled = true;
    
    // Show dice animation
    const diceAnim = document.getElementById('dice-animation');
    diceAnim.classList.remove('hidden');

    // Simulate rolling
    const roll = Math.floor(Math.random() * 5) + 1;

    setTimeout(async () => {
        document.querySelector('.dice-result').textContent = `You rolled a ${roll}!`;
        
        setTimeout(async () => {
            diceAnim.classList.add('hidden');
            await movePlayer(roll);
            diceBtn.disabled = false;
        }, 1500);
    }, 1000);
}

async function movePlayer(steps) {
    let newSquare = gameState.currentSquare + steps;
    
    // Check if exceeded board
    if (newSquare > BOARD_SIZE) {
        newSquare = BOARD_SIZE - (newSquare - BOARD_SIZE);
    }

    // Animate movement
    await animateMovement(gameState.currentSquare, newSquare);

    gameState.currentSquare = newSquare;

    // Check for snake
    if (snakes[newSquare]) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert(`Oh no! You hit a snake! Sliding down to square ${snakes[newSquare]}`);
        await animateMovement(newSquare, snakes[newSquare]);
        gameState.currentSquare = snakes[newSquare];
    }

    // Check for ladder
    if (ladders[newSquare]) {
        await new Promise(resolve => setTimeout(resolve, 500));
        alert(`Great! You found a ladder! Climbing up to square ${ladders[newSquare]}`);
        await animateMovement(newSquare, ladders[newSquare]);
        gameState.currentSquare = ladders[newSquare];
    }

    // Add to visited squares
    if (!gameState.visitedSquares.includes(gameState.currentSquare)) {
        gameState.visitedSquares.push(gameState.currentSquare);
    }

    // Update board and player info
    createGameBoard();
    updatePlayerInfo();

    // Save progress
    await saveGameProgress();

    // Check if boss battle
    if (gameState.currentSquare === bossBattleSquare) {
        startBossBattle();
    } else {
        // Show activity for the square
        showSquareActivity();
    }
}

async function animateMovement(from, to) {
    // Simple animation - could be enhanced
    return new Promise(resolve => {
        setTimeout(resolve, 500);
    });
}

function showSquareActivity() {
    const activities = ['quiz', 'memory', 'math'];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const modal = document.getElementById('activity-modal');
    const content = document.getElementById('activity-content');

    if (activity === 'quiz') {
        showQuizActivity(content);
    } else if (activity === 'memory') {
        showMemoryActivity(content);
    } else if (activity === 'math') {
        showMathActivity(content);
    }

    modal.classList.remove('hidden');
}

function showQuizActivity(container) {
    const quizzes = [
        {
            question: "What is the capital of France?",
            options: ["London", "Paris", "Berlin", "Madrid"],
            correct: 1,
            bullets: 10
        },
        {
            question: "What is 7 x 8?",
            options: ["54", "56", "58", "60"],
            correct: 1,
            bullets: 15
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            correct: 1,
            bullets: 12
        }
    ];
    
    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];

    container.innerHTML = `
        <div class="activity-game">
            <h3>Quiz Challenge</h3>
            <p><strong>${quiz.question}</strong></p>
            <div class="quiz-options">
                ${quiz.options.map((opt, idx) => `
                    <div class="quiz-option" data-index="${idx}">${opt}</div>
                `).join('')}
            </div>
            <div id="quiz-result" class="activity-result hidden"></div>
        </div>
    `;

    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            const selected = parseInt(this.dataset.index);
            const result = document.getElementById('quiz-result');
            
            if (selected === quiz.correct) {
                this.classList.add('correct');
                result.className = 'activity-result success';
                result.textContent = `Correct! You earned ${quiz.bullets} bullets!`;
                gameState.bullets += quiz.bullets;
                updatePlayerInfo();
                saveGameProgress();
            } else {
                this.classList.add('incorrect');
                document.querySelectorAll('.quiz-option')[quiz.correct].classList.add('correct');
                result.className = 'activity-result failure';
                result.textContent = 'Incorrect! No bullets earned.';
            }
            
            result.classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('activity-modal').classList.add('hidden');
            }, 2000);
        });
    });
}

function showMemoryActivity(container) {
    const emojis = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧'];
    const selected = [];
    
    // Select 4 pairs
    for (let i = 0; i < 4; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        selected.push(emoji, emoji);
    }

    // Shuffle
    selected.sort(() => Math.random() - 0.5);

    let flipped = [];
    let matched = [];
    let bullets = 20;

    container.innerHTML = `
        <div class="activity-game">
            <h3>Memory Match</h3>
            <p>Find all matching pairs! Reward: ${bullets} bullets</p>
            <div class="memory-game-grid">
                ${selected.map((emoji, idx) => `
                    <div class="memory-card" data-emoji="${emoji}" data-index="${idx}"></div>
                `).join('')}
            </div>
            <div id="memory-result" class="activity-result hidden"></div>
        </div>
    `;

    document.querySelectorAll('.memory-card').forEach(card => {
        card.addEventListener('click', function() {
            if (flipped.length >= 2 || this.classList.contains('flipped') || 
                this.classList.contains('matched')) return;
            
            this.classList.add('flipped');
            this.textContent = this.dataset.emoji;
            flipped.push(this);
            
            if (flipped.length === 2) {
                if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
                    // Match!
                    flipped.forEach(c => c.classList.add('matched'));
                    matched.push(...flipped);
                    flipped = [];
                    
                    // Check if all matched
                    if (matched.length === selected.length) {
                        const result = document.getElementById('memory-result');
                        result.className = 'activity-result success';
                        result.textContent = `Perfect! You earned ${bullets} bullets!`;
                        result.classList.remove('hidden');
                        gameState.bullets += bullets;
                        updatePlayerInfo();
                        saveGameProgress();
                        
                        setTimeout(() => {
                            document.getElementById('activity-modal').classList.add('hidden');
                        }, 2000);
                    }
                } else {
                    // No match
                    setTimeout(() => {
                        flipped.forEach(c => {
                            c.classList.remove('flipped');
                            c.textContent = '';
                        });
                        flipped = [];
                    }, 1000);
                }
            }
        });
    });
}

function showMathActivity(container) {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let answer;
    
    if (op === '+') answer = num1 + num2;
    else if (op === '-') answer = num1 - num2;
    else answer = num1 * num2;

    const bullets = 15;

    container.innerHTML = `
        <div class="activity-game math-challenge">
            <h3>Math Challenge</h3>
            <p>Solve the problem to earn ${bullets} bullets!</p>
            <div class="math-problem">${num1} ${op} ${num2} = ?</div>
            <input type="number" class="math-input" id="math-answer" placeholder="Your answer">
            <br><br>
            <button class="btn btn-primary" id="submit-math">Submit</button>
            <div id="math-result" class="activity-result hidden"></div>
        </div>
    `;

    document.getElementById('submit-math').addEventListener('click', () => {
        const userAnswer = parseInt(document.getElementById('math-answer').value);
        const result = document.getElementById('math-result');
        
        if (userAnswer === answer) {
            result.className = 'activity-result success';
            result.textContent = `Correct! You earned ${bullets} bullets!`;
            gameState.bullets += bullets;
            updatePlayerInfo();
            saveGameProgress();
        } else {
            result.className = 'activity-result failure';
            result.textContent = `Incorrect! The answer was ${answer}. No bullets earned.`;
        }
        
        result.classList.remove('hidden');
        
        setTimeout(() => {
            document.getElementById('activity-modal').classList.add('hidden');
        }, 2000);
    });
}

async function saveGameProgress() {
    if (gameState.isGuest) return;
    
    try {
        await fetch(`${API_URL}/snakes/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                total_bullets: gameState.bullets,
                time_played: gameState.timeElapsed,
                current_square: gameState.currentSquare,
                visited_squares: gameState.visitedSquares,
                lives: gameState.lives,
                boss_battle_attempts: gameState.bossAttempts,
                selected_character: gameState.character
            })
        });
        
        await fetch(`${API_URL}/snakes/update-square`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                square: gameState.currentSquare
            })
        });
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

function initializeSocket() {
    gameState.socket = io(SOCKET_URL);
    
    gameState.socket.on('connect', () => {
        console.log('Connected to socket server');
    });

    gameState.socket.on('player_joined', (data) => {
        console.log('Player joined:', data);
        updateBossBattle(data);
    });

    gameState.socket.on('boss_state_update', (data) => {
        updateBossBattle(data);
    });

    gameState.socket.on('player_died', (data) => {
        addBattleLog(`💀 ${data.username} has been defeated!`, 'death');
    });

    gameState.socket.on('boss_defeated', (data) => {
        alert('🎉 Congratulations! The boss has been defeated!');
        document.getElementById('boss-battle-modal').classList.add('hidden');
        // Reset and continue game
        gameState.currentSquare = 100;
        updatePlayerInfo();
    });

    gameState.socket.on('player_left', (data) => {
        console.log('Player left:', data);
    });
}

function startBossBattle() {
    gameState.bossAttempts++;
    const modal = document.getElementById('boss-battle-modal');
    modal.classList.remove('hidden');

    document.getElementById('battle-bullets').textContent = gameState.bullets;
    document.getElementById('battle-lives').textContent = gameState.lives;

    // Join boss battle room
    if (gameState.socket && !gameState.isGuest) {
        gameState.socket.emit('join_boss_battle', {
            username: gameState.username,
            user_id: gameState.userId,
            bullets: gameState.bullets,
            character: gameState.character
        });
    } else {
        // Guest mode - simulated boss battle
        updateBossBattle({
            boss_health: 1000,
            max_health: 1000,
            active_players: 1,
            players: [{
                username: gameState.username,
                bullets: gameState.bullets,
                lives: gameState.lives,
                character: gameState.character,
                status: 'alive'
            }]
        });
    }

    // Attack button
    document.getElementById('attack-boss-btn').addEventListener('click', attackBoss);
}

function attackBoss() {
    if (gameState.bullets < 10) {
        alert('You need at least 10 bullets to attack!');
        return;
    }
    
    gameState.bullets -= 10;
    document.getElementById('battle-bullets').textContent = gameState.bullets;
    document.getElementById('player-bullets').textContent = gameState.bullets;

    const damage = Math.floor(Math.random() * 20) + 10;

    if (gameState.socket && !gameState.isGuest) {
        gameState.socket.emit('attack_boss', {
            user_id: gameState.userId,
            username: gameState.username,
            damage: damage
        });
    } else {
        // Guest mode - simulate attack
        const currentHealth = parseInt(document.getElementById('boss-health').textContent);
        const newHealth = Math.max(0, currentHealth - damage);
        document.getElementById('boss-health').textContent = newHealth;
        
        const healthPercent = (newHealth / 1000) * 100;
        document.getElementById('boss-health-fill').style.width = healthPercent + '%';
        
        addBattleLog(`⚔️ ${gameState.username} attacked for ${damage} damage!`, 'attack');
        
        if (newHealth <= 0) {
            alert('🎉 You defeated the boss!');
            document.getElementById('boss-battle-modal').classList.add('hidden');
        } else {
            // Boss counter-attack
            setTimeout(() => {
                const bossDamage = 1;
                gameState.lives -= bossDamage;
                document.getElementById('battle-lives').textContent = gameState.lives;
                document.getElementById('player-lives').textContent = gameState.lives;
                
                if (gameState.lives <= 0) {
                    alert('💀 You have been defeated! Returning to square 1...');
                    resetAfterBossDefeat();
                }
            }, 1000);
        }
    }

    saveGameProgress();
}

function updateBossBattle(data) {
    document.getElementById('boss-health').textContent = data.boss_health;
    document.getElementById('boss-max-health').textContent = data.max_health;
    document.getElementById('active-players-count').textContent = data.active_players;
    
    const healthPercent = (data.boss_health / data.max_health) * 100;
    document.getElementById('boss-health-fill').style.width = healthPercent + '%';

    // Update players list
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';

    if (data.players) {
        data.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            if (player.status === 'dead') {
                playerCard.classList.add('dead');
            }
            playerCard.innerHTML = `
                <strong>${player.username}</strong><br>
                ${getCharacterIcon(player.character)}<br>
                Lives: ${player.lives}
            `;
            playersList.appendChild(playerCard);
        });
    }

    if (data.last_attacker && data.damage) {
        addBattleLog(`⚔️ ${data.last_attacker} attacked for ${data.damage} damage!`, 'attack');
    }
}

function addBattleLog(message, type = '') {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = message;
    log.insertBefore(entry, log.firstChild);
    
    // Keep only last 10 entries
    while (log.children.length > 10) {
        log.removeChild(log.lastChild);
    }
}

async function resetAfterBossDefeat() {
    document.getElementById('boss-battle-modal').classList.add('hidden');
    
    // Get unvisited squares
    let unvisitedSquares = [];
    if (!gameState.isGuest) {
        try {
            const response = await fetch(`${API_URL}/snakes/unvisited-squares`, {
                credentials: 'include'
            });
            const data = await response.json();
            unvisitedSquares = data.unvisited_squares || [];
        } catch (error) {
            console.error('Error getting unvisited squares:', error);
        }
    } else {
        // Guest mode - calculate locally
        const allSquares = Array.from({length: 100}, (_, i) => i + 1);
        unvisitedSquares = allSquares.filter(sq => !gameState.visitedSquares.includes(sq));
    }

    // Reset position
    gameState.currentSquare = 1;
    gameState.lives = 3;
    gameState.visitedSquares = [1];

    // Update board to show only unvisited squares for future moves
    createGameBoard();
    updatePlayerInfo();

    if (!gameState.isGuest) {
        await fetch(`${API_URL}/snakes/reset-position`, {
            method: 'POST',
            credentials: 'include'
        });
    }

    saveGameProgress();
}

async function viewLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/snakes/leaderboard?limit=10`);
        const data = await response.json();
        
        const modal = document.getElementById('leaderboard-modal');
        const content = document.getElementById('leaderboard-content');
        
        content.innerHTML = data.leaderboard.map((player, index) => `
            <div class="leaderboard-entry ${index < 3 ? 'top-' + (index + 1) : ''}">
                <div class="rank">${index + 1}</div>
                <div class="player-details">
                    <h4>${getCharacterIcon(player.selected_character)} ${player.username}</h4>
                    <div class="player-stats">
                        Square: ${player.current_square} | 
                        Time: ${Math.floor(player.time_played / 60)}m | 
                        Boss Attempts: ${player.boss_battle_attempts}
                    </div>
                </div>
                <div class="bullets-count">🔫 ${player.total_bullets}</div>
            </div>
        `).join('');
        
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        alert('Error loading leaderboard');
    }
}