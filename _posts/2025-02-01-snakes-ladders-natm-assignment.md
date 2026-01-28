---
layout: post
title: "Snakes & Ladders - N@tM Assignment & Create PT"
description: Team overview, individual tasks, and presentation scripts for Night at the Museum
permalink: /snakes-natm
toc: true
comments: true
categories: ['Game Development', 'N@tM']
---

<style>
.team-overview{background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:20px;margin:20px 0;border:2px solid #e94560}
.overview-title{color:#e94560;font-size:1.3em;margin-bottom:12px;font-weight:700}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:15px 0}
.feature-box{background:rgba(233,69,96,0.15);padding:12px;border-radius:8px;text-align:center;font-size:0.85em}
.feature-box strong{color:#4facfe;display:block;margin-bottom:4px}
.individual-card{background:rgba(255,255,255,0.05);border-left:4px solid #667eea;border-radius:0 12px 12px 0;padding:16px;margin:16px 0}
.individual-card h3{color:#4facfe;margin:0 0 4px 0}
.individual-card .role{color:#f093fb;font-size:0.85em;font-weight:600;margin-bottom:10px}
.skill-section{background:rgba(102,126,234,0.1);border-radius:8px;padding:12px;margin:10px 0}
.skill-section h4{color:#667eea;margin:0 0 6px 0;font-size:0.95em}
.code-ref{background:#1e1e1e;padding:8px 12px;border-radius:6px;font-family:monospace;font-size:0.8em;margin:8px 0;overflow-x:auto}
.script-box{background:linear-gradient(135deg,#0f3460,#1a1a2e);border:1px solid #e94560;border-radius:12px;padding:16px;margin:12px 0}
.script-box h4{color:#e94560;margin:0 0 8px 0}
.script-box p{margin:4px 0;font-size:0.9em;line-height:1.5}
.flow-mini{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0;font-size:0.8em}
.flow-mini span{background:#667eea;color:white;padding:4px 8px;border-radius:4px}
.flow-mini .arrow{background:none;color:#667eea}
.visual-placeholder{background:linear-gradient(45deg,#1a1a2e,#16213e);border:2px dashed #667eea;border-radius:12px;padding:40px;text-align:center;color:#667eea;margin:15px 0}
.time-badge{background:#e94560;color:white;padding:2px 8px;border-radius:12px;font-size:0.75em;font-weight:600}
</style>

## Skill C: Team Project Overview <span class="time-badge">1 MIN</span>

<div class="team-overview">
<div class="overview-title">Snakes & Ladders: Gamified AP CSP Learning</div>

**Superpower:** Learn Computer Science by playing — bullets earned from lessons become ammo in the boss fight.

<div class="feature-grid">
<div class="feature-box"><strong>5 Lessons</strong>CS Principles Topics</div>
<div class="feature-box"><strong>50 Questions</strong>Multiple Choice Bank</div>
<div class="feature-box"><strong>10-Player</strong>Multiplayer Boss</div>
<div class="feature-box"><strong>Real-time</strong>WebSocket Sync</div>
<div class="feature-box"><strong>4 Characters</strong>Pixel Art Sprites</div>
<div class="feature-box"><strong>4 Powerups</strong>Damage/Speed/Rapidfire/Heal</div>
</div>
</div>

### Data Flow Architecture

<div class="flow-mini">
<span>Frontend (Jekyll)</span>
<span class="arrow">→</span>
<span>REST API (Flask)</span>
<span class="arrow">→</span>
<span>SQLite DB</span>
<span class="arrow">↔</span>
<span>WebSocket (Port 8500)</span>
</div>

<div class="visual-placeholder">
[SCREENSHOT: Game board with character on square, showing bullets/lives HUD]
</div>

---

## Individual Tasks (Skill A + Skill B)

---

<div class="individual-card">
<h3>Akhil</h3>
<div class="role">Scrum Master — Game Board UI & Navigation</div>

<div class="skill-section">
<h4>Skill A: Task — Boss Battle & Combat System <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Create engaging final challenge with smooth boss movement and powerup mechanics.

**Demo Flow:**
1. Enter arena → boss spawns with 1000 HP
2. WASD move, click to shoot → bullets reduce boss HP
3. Collect powerups → damage boost/speed/rapidfire/heal
4. Boss defeated → victory screen

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Player position, shoot command
**Output:** Boss damage, powerup effects, game state

<div class="code-ref">
// boss-battle.html - Boss Movement
function moveBoss() {
    boss.patternTimer++;
    boss.slitherPhase += 0.12;
    // Smooth targeting with bias toward player
    const biasToPlayer = Math.random() < 0.35;
    boss.targetX = biasToPlayer ? player.x : randomX;
}
</div>

**List Used:** `powerups[]` — spawned powerups tracked, removed on collection

<div class="code-ref">
// Powerup collection algorithm
gameState.powerups = gameState.powerups.filter(p => {
    if (distance(player, p) < 30) {
        applyPowerup(p.type); // Selection: damage/speed/rapidfire/heal
        return false;
    }
    return true;
});
</div>

**Procedure:** `applyPowerup(type)` — uses selection to apply correct buff based on type parameter

**Files:** `boss-battle.html`, `api/boss_battle.py`, `model/boss_room.py`
</div>
</div>

---

<div class="individual-card">
<h3>Aneesh</h3>
<div class="role">DevOps — Authentication & Deployment</div>

<div class="skill-section">
<h4>Skill A: Task — JWT Authentication System <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Secure user sessions without exposing credentials; persist game data per user.

**Demo Flow:**
1. Login → JWT token stored in HttpOnly cookie
2. API call → `@token_required()` validates token
3. User ID extracted → correct game data loaded

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Login credentials (POST /api/authenticate)
**Output:** JWT token + user session

<div class="code-ref">
# api/jwt_authorize.py
def token_required():
    def decorator(f):
        token = request.cookies.get('jwt_token')
        data = jwt.decode(token, SECRET_KEY)
        g.current_user = User.query.get(data['user_id'])
        return f(*args, **kwargs)
</div>

**List Used:** User roles/permissions stored in token payload

**Procedure:** `@token_required()` decorator — extracts user from JWT, attaches to request context

**Files:** `api/jwt_authorize.py`, `api/authenticate.py`, `Dockerfile`, `docker-compose.yml`
</div>
</div>

---

<div class="individual-card">
<h3>Samarth</h3>
<div class="role">Lesson System Developer</div>

<div class="skill-section">
<h4>Skill A: Task — Interactive Lesson Completion <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Teach CS concepts and reward learning with in-game currency (bullets).

**Demo Flow:**
1. Open lesson → read content → complete quiz
2. POST /complete-lesson → server awards bullets
3. Progress bar fills → next section unlocks

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Lesson completion (lesson_number, bullets_earned)
**Output:** Updated total_bullets, unlocked_sections[]

<div class="code-ref">
# api/snakes_extended.py
@snakes_bp.route('/complete-lesson', methods=['POST'])
def complete_lesson():
    lesson_number = data.get('lesson_number')
    if lesson_number not in record.completed_lessons:
        record.completed_lessons.append(lesson_number)
        record.total_bullets += bullets_earned
</div>

**List Used:** `completed_lessons[]` — prevents re-completing same lesson

**Procedure:** `completeLesson(lessonNum)` — validates completion, updates DB, returns new totals

**Files:** `lessons/lesson1.html` - `lesson5.html`, `api/snakes_extended.py`
</div>
</div>

---

<div class="individual-card">
<h3>Arnav</h3>
<div class="role">Question System Developer</div>

<div class="skill-section">
<h4>Skill A: Task — Question Bank & Answer Validation <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Test knowledge with 50 unique questions; reward correct answers with bullets.

**Demo Flow:**
1. Land on square → question modal appears
2. Select answer → validation runs
3. Correct = +5 bullets + green feedback | Wrong = red feedback

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Answer selection (square, answer_index, correct boolean)
**Output:** Bullet reward, updated visited_squares

<div class="code-ref">
// questions/questions_bank.js
const QUESTIONS = {
    1: [ // Row 1: Programming Basics
      { prompt: "Which keyword declares a constant?",
        options: ["var", "const", "let", "static"], answer: 1 },
      // ... 9 more per row, 5 rows total
    ],
};
</div>

<div class="code-ref">
# api/snakes_extended.py
@snakes_bp.route('/answer-question', methods=['POST'])
def answer_question():
    if correct:
        record.total_bullets += bullets_earned
    if square not in record.visited_squares:
        record.visited_squares.append(square)
</div>

**List Used:** `questions[]` array — iterated to find question by square number

**Procedure:** `validateAnswer(squareNum, selectedIndex)` — compares to correct index, returns result

**Files:** `questions/questions_bank.js`, `api/snakes_extended.py`
</div>
</div>

---

<div class="individual-card">
<h3>Ethan</h3>
<div class="role">Boss Battle Developer</div>

<div class="skill-section">
<h4>Skill A: Task — Dice Rolling & Board Navigation <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Players need intuitive way to move across 56 squares with visual feedback.

**Demo Flow:**
1. Click dice → animated roll → land on square
2. Square highlights → question modal opens
3. Answer correctly → bullets awarded → next square unlocks

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Dice click event
**Output:** New square position + question display

<div class="code-ref">
// snakes-game.js:rollDice()
var roll = Math.floor(Math.random() * 6) + 1;
showDiceAnimation(roll).then(function() {
    movePlayer(roll);
});
</div>

**List Used:** `visitedSquares[]` — tracks answered questions

<div class="code-ref">
// snakes-game.js - movePlayer()
if (gameState.visitedSquares.indexOf(newSquare) === -1) {
    gameState.visitedSquares.push(newSquare);
}
createGameBoard();
updatePlayerInfo();
saveProgress();
</div>

**Procedure:** `showQuestionModal(square, row, index)` — retrieves question from bank, displays modal

**Files:** `game-board-part1.html`, `game-board-part2.html`, `snakes-game.js`
</div>
</div>

---

<div class="individual-card">
<h3>Moiz</h3>
<div class="role">Leaderboard & UI Features Developer</div>

<div class="skill-section">
<h4>Skill A: Task — Leaderboard & Player Stats Display <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Players need to see rankings and compare progress with others.

**Demo Flow:**
1. Click leaderboard button → modal opens
2. Top 10 players displayed with rank badges (gold/silver/bronze)
3. Current user highlighted → shows their position
4. Stats include bullets, time played, character

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Leaderboard request (GET /api/snakes/leaderboard)
**Output:** Sorted list of top players by bullets

<div class="code-ref">
# api/snakes_extended.py
@snakes_bp.route('/leaderboard', methods=['GET'])
def leaderboard():
    players = SnakesGameData.get_leaderboard(limit=10)
    result = [{'username': p.username,
               'total_bullets': p.total_bullets,
               'time_played': p.time_played} for p in players]
</div>

**List Used:** `leaderboardData[]` — array of player objects sorted by bullets

<div class="code-ref">
// snakes-game.js - viewLeaderboard()
for (var i = 0; i < leaderboardData.length; i++) {
    var entry = leaderboardData[i];
    if (entry.user_id === gameState.userId)
        tr.className = 'current-user-row';
}
</div>

**Procedure:** `viewLeaderboard()` — fetches rankings, renders table with rank badges

**Files:** `snakes-game.js`, `api/snakes_extended.py`, `model/snakes_game.py`
</div>
</div>

---

## Visual Demos

<div class="visual-placeholder">
[SCREENSHOT: Character selection screen with 4 pixel-art characters]
</div>

<div class="visual-placeholder">
[SCREENSHOT: Lesson page showing CS content with "Complete" button]
</div>

<div class="visual-placeholder">
[SCREENSHOT: Question modal with multiple choice answers]
</div>

<div class="visual-placeholder">
[SCREENSHOT: Boss battle arena with multiple players, boss, powerups, and chat sidebar]
</div>

<div class="visual-placeholder">
[SCREENSHOT: Leaderboard showing top players by bullets]
</div>

---

## Presentation Scripts

### Team Overview Script (1 minute)

<div class="script-box">
<h4>Speaker: Any team member</h4>

<p><strong>[0:00-0:15]</strong> "This is Snakes and Ladders, an educational game that teaches AP Computer Science Principles. The twist? Knowledge is power — bullets earned from lessons become ammo in the final boss fight."</p>

<p><strong>[0:15-0:30]</strong> "Players start by completing 5 interactive lessons on programming, data structures, networking, cybersecurity, and ethics. Then they roll dice across 50 question squares. Each correct answer adds to their bullet count."</p>

<p><strong>[0:30-0:45]</strong> "The finale is a 10-player multiplayer boss battle using WebSockets. Players shoot the boss, collect powerups, and coordinate via group chat — all in real-time."</p>

<p><strong>[0:45-0:60]</strong> "Tech stack: Jekyll frontend, Flask backend, SQLite database, and Socket.IO for multiplayer. Everything persists via JWT-authenticated APIs. Let me show you how it works..."</p>
</div>

---

### Akhil's Script (1 minute)

<div class="script-box">
<h4>Topic: Boss Battle & Combat</h4>

<p><strong>[0:00-0:15]</strong> "I built the boss battle arena with canvas rendering. The boss has 1000 HP and moves with smooth snake-like slithering, occasionally targeting the player."</p>

<p><strong>[0:15-0:30]</strong> "The boss smoothly targets points on the screen, sometimes biasing toward the nearest player. The slither animation uses sine waves for realistic movement."</p>

<p><strong>[0:30-0:45]</strong> "Powerups spawn every 5 seconds. The `applyPowerup(type)` function uses selection logic — 'damage' doubles your damage, 'speed' increases movement, 'rapidfire' adds bullets, 'heal' restores a life."</p>

<p><strong>[0:45-0:60]</strong> "When boss HP hits zero, victory triggers. The server resets the room for the next group. All player stats get saved to BossBattleStats."</p>
</div>

---

### Aneesh's Script (1 minute)

<div class="script-box">
<h4>Topic: Authentication & Deployment</h4>

<p><strong>[0:00-0:15]</strong> "I handled authentication and deployment. When you log in, the server generates a JWT token stored in an HttpOnly cookie — secure and invisible to JavaScript attacks."</p>

<p><strong>[0:15-0:30]</strong> "Every API call passes through the `@token_required()` decorator. It decodes the JWT, extracts your user ID, and loads your specific game data from the database."</p>

<p><strong>[0:30-0:45]</strong> "For deployment, I configured Docker containers, Nginx reverse proxy, and environment variables. The backend runs on port 8306, WebSocket on 8500."</p>

<p><strong>[0:45-0:60]</strong> "Guest mode bypasses auth using sessionStorage — no server calls, perfect for quick demos, but progress doesn't persist across sessions."</p>
</div>

---

### Samarth's Script (1 minute)

<div class="script-box">
<h4>Topic: Lesson System</h4>

<p><strong>[0:00-0:15]</strong> "I created 5 interactive lessons covering AP CSP topics. Each lesson has content explaining a concept plus a mini-quiz at the end."</p>

<p><strong>[0:15-0:30]</strong> "When you complete a lesson, a POST request hits `/api/snakes/complete-lesson`. The server checks the `completed_lessons` array — if this lesson isn't already in there, it gets added."</p>

<p><strong>[0:30-0:45]</strong> "The server then awards 5 bullets and checks if all 5 lessons are done. If so, it unlocks the next section by adding 'half2' to `unlocked_sections`."</p>

<p><strong>[0:45-0:60]</strong> "This sequencing ensures players learn before they play. The bullets they earn become real firepower in the boss battle."</p>
</div>

---

### Arnav's Script (1 minute)

<div class="script-box">
<h4>Topic: Question System</h4>

<p><strong>[0:00-0:15]</strong> "I built the question bank with 50 multiple-choice questions across 5 CS topics. Each question object has the prompt, four answers, the correct index, and its topic."</p>

<p><strong>[0:15-0:30]</strong> "When a player lands on a square, JavaScript iterates through the questions array to find the matching square number. That question's modal appears."</p>

<p><strong>[0:30-0:45]</strong> "Answer validation uses a simple selection: if `selectedIndex === correct`, award bullets. The backend POST to `/answer-question` records this and updates `visited_squares`."</p>

<p><strong>[0:45-0:60]</strong> "The list prevents repeat answers — before showing a question, we check if the square is already in `visited_squares`. No farming allowed."</p>
</div>

---

### Ethan's Script (1 minute)

<div class="script-box">
<h4>Topic: Game Board UI & Dice Rolling</h4>

<p><strong>[0:00-0:15]</strong> "I built the main game board interface. Watch as I click the dice — it animates with a 3D roll and lands on a random 1-6. My character moves to that square."</p>

<p><strong>[0:15-0:30]</strong> "Each square triggers a question modal. The `showQuestionModal()` function retrieves the question from our 50-question bank and displays it with a mini-game challenge first."</p>

<p><strong>[0:30-0:45]</strong> "When I answer correctly, the backend adds 5 bullets to my total. The `visitedSquares` array tracks which questions I've answered so I can't farm the same one."</p>

<p><strong>[0:45-0:60]</strong> "This iteration through the board teaches CS concepts progressively. By square 56, players have enough bullets and knowledge to challenge the boss."</p>
</div>

---

### Moiz's Script (1 minute)

<div class="script-box">
<h4>Topic: Leaderboard & UI</h4>

<p><strong>[0:00-0:15]</strong> "I built the leaderboard system. When you click the leaderboard button, JavaScript fetches `/api/snakes/leaderboard` which returns the top 10 players sorted by bullets."</p>

<p><strong>[0:15-0:30]</strong> "The backend uses `SnakesGameData.get_leaderboard()` which runs a SQLAlchemy query ordering by `total_bullets` descending. Simple but effective ranking."</p>

<p><strong>[0:30-0:45]</strong> "The frontend iterates through the results and adds rank badges — gold for first, silver for second, bronze for third. If your user ID matches, your row gets highlighted."</p>

<p><strong>[0:45-0:60]</strong> "I also added the online players display showing who's currently playing, with their character icons and current square positions."</p>
</div>

---

## Happy Moments / Eureka Events

| Team Member | Eureka Moment |
|-------------|---------------|
| **Akhil** | "The boss slithering movement looked so realistic. Watching it smoothly track players across the arena was terrifying and awesome." |
| **Aneesh** | "First successful authenticated request after fighting CORS for hours. Seeing my user data load was magic." |
| **Samarth** | "Completing all 5 lessons and watching the boss section unlock automatically. The progression system worked!" |
| **Arnav** | "Writing question #50 and seeing the entire bank render correctly. 50 unique CS questions in one file." |
| **Ethan** | "When the 3D dice animation finally synced perfectly with the square highlighting — the game felt *real*." |
| **Moiz** | "When I saw the leaderboard rank by bullets and no player was missing from the leaderboard, I was so happy!" |

---

## Feature Lifecycle Example: Leaderboard

| Stage | Description |
|-------|-------------|
| **Origin** | Players wanted to compare progress and see rankings |
| **Early Visual** | Simple table with names and bullet counts |
| **Early Code** | Basic `SELECT * ORDER BY bullets DESC LIMIT 10` query |
| **Polish** | Added rank badges (gold/silver/bronze), character icons, time played |
| **Recent** | Highlighted current user's row, added online players count display |

---

## Quick Reference: Key Files

| Component | Owner | Frontend | Backend |
|-----------|-------|----------|---------|
| Game Board | Ethan | `game-board-part1.html`, `game-board-part2.html` | `api/snakes_game.py` |
| Lessons | Samarth | `lessons/lesson1-5.html` | `api/snakes_extended.py` |
| Questions | Arnav | `questions/questions_bank.js` | `api/snakes_extended.py` |
| Boss Battle | Akhil | `boss-battle.html` | `api/boss_battle.py`, `socket/boss_battle.py` |
| Auth | Aneesh | — | `api/jwt_authorize.py`, `api/authenticate.py` |
| Leaderboard & UI | Moiz | `snakes-game.js` | `api/snakes_extended.py` |
| Models | — | — | `model/snakes_game.py`, `model/boss_room.py` |

## Deployment Info

| Service | Local Port | Production URL |
|---------|-----------|----------------|
| Flask Backend | 8306 | `https://snakes.opencodingsociety.com` |
| WebSocket (Multiplayer) | 8500 | — |
