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
.individual-card .role{color:#f093fb;font-size:0.85em;font-weight:600;margin-bottom:6px}
.individual-card .superpower{color:#ffd700;font-size:0.9em;font-weight:600;margin-bottom:10px;font-style:italic}
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

**Superpower:** Learn Computer Science by playing — bullets earned from lessons become ammo in boss battles and PvP duels.

<div class="feature-grid">
<div class="feature-box"><strong>5 Lessons</strong>CS Principles Topics</div>
<div class="feature-box"><strong>50 Questions</strong>Multiple Choice Bank</div>
<div class="feature-box"><strong>10-Player</strong>Co-op Boss Battle</div>
<div class="feature-box"><strong>1v1 PvP</strong>Competitive Arena</div>
<div class="feature-box"><strong>Real-time</strong>WebSocket Sync</div>
<div class="feature-box"><strong>4 Characters</strong>Pixel Art Sprites</div>
<div class="feature-box"><strong>4 Powerups</strong>Damage/Speed/Rapidfire/Heal</div>
<div class="feature-box"><strong>Hall of Champions</strong>Victory Leaderboard</div>
</div>
</div>

### Complete Game Flow

<div class="flow-mini">
<span>Login/Guest</span>
<span class="arrow">→</span>
<span>Character Select</span>
<span class="arrow">→</span>
<span>5 Lessons</span>
<span class="arrow">→</span>
<span>50 Questions</span>
<span class="arrow">→</span>
<span>Mode Selection</span>
<span class="arrow">→</span>
<span>Boss/PvP Battle</span>
<span class="arrow">→</span>
<span>Victory Page</span>
<span class="arrow">→</span>
<span>Hall of Champions</span>
</div>

### Data Flow Architecture

<div class="flow-mini">
<span>Frontend (Jekyll)</span>
<span class="arrow">→</span>
<span>REST API (Flask:8306)</span>
<span class="arrow">→</span>
<span>SQLite DB</span>
<span class="arrow">↔</span>
<span>WebSocket (Socket.IO)</span>
</div>

---

## Individual Tasks (Skill A + Skill B)

---

<div class="individual-card">
<h3>Akhil</h3>
<div class="role">Scrum Master / Multiplayer & Victory System Developer</div>
<div class="superpower"> Superpower: Real-time Multiplayer Sync — connects players across the world in milliseconds</div>

<div class="skill-section">
<h4>Skill A: Task — WebSocket Multiplayer & Victory System <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Enable real-time multiplayer gameplay with instant position sync, group chat, and persistent victory tracking in the Hall of Champions.

**Demo Flow:**
1. Join boss battle → WebSocket connects → see other players appear
2. Move around → position broadcasts to all players every 50ms
3. Defeat boss → Victory page with confetti animation
4. Champions API records completion → Hall of Champions displays all winners

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Player position data, chat messages, game completion
**Output:** Broadcast to all players, victory recording, champions list

<div class="code-ref">
# socketio_handlers/boss_battle.py
@socketio.on('boss_player_move')
def handle_player_move(data):
    room_id = data.get('room_id')
    boss_battles[room_id]['players'][request.sid]['x'] = data['x']
    boss_battles[room_id]['players'][request.sid]['y'] = data['y']
    emit('boss_player_position', {'sid': request.sid, 'x': data['x'], 'y': data['y']},
         room=room_id, include_self=False)
</div>

**List Used:** `boss_battles[room_id]['players']` — dict tracking all players in each room; `champions[]` for leaderboard

<div class="code-ref">
# api/snakes_game.py - ChampionsAPI
champions = SnakesGameData.query.filter_by(game_status='completed')
    .order_by(SnakesGameData.completed_at.asc()).all()
</div>

**Procedure:** `handle_player_move(data)` — extracts room_id, updates player position, broadcasts to all other players

**Files:** `socketio_handlers/boss_battle.py`, `victory.html`, `api/snakes_game.py` (ChampionsAPI, CompleteGameAPI)
</div>
</div>

---

<div class="individual-card">
<h3>Moiz</h3>
<div class="role">DevOps / Authentication Lead</div>
<div class="superpower"> Superpower: Secure Sessions — JWT tokens keep your game data safe across devices</div>

<div class="skill-section">
<h4>Skill A: Task — JWT Authentication & Guest Mode <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Secure user sessions without exposing credentials; provide guest mode for quick demos without signup.

**Demo Flow:**
1. Login → JWT token stored in HttpOnly cookie
2. API call → `@token_required()` validates token
3. User ID extracted → correct game data loaded
4. Guest mode → sessionStorage fallback, no server persistence

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Login credentials (POST /api/authenticate)
**Output:** JWT token + user session; or sessionStorage for guests

<div class="code-ref">
# api/jwt_authorize.py
def token_required():
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.cookies.get('jwt')
            if not token:
                return {"message": "Token missing"}, 401
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.current_user = User.query.get(data['user_id'])
            return f(*args, **kwargs)
        return decorated
    return decorator
</div>

**List Used:** User roles/permissions stored in token payload

<div class="code-ref">
// Demo mode check (frontend)
function isDemoMode() {
    return sessionStorage.getItem('snakes_demo_mode') === '1';
}
</div>

**Procedure:** `@token_required()` decorator — extracts user from JWT, attaches to request context

**Files:** `api/jwt_authorize.py`, `api/authenticate.py`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`
</div>
</div>

---

<div class="individual-card">
<h3>Samarth</h3>
<div class="role">Lesson System Developer</div>
<div class="superpower"> Superpower: Progressive Learning — turns CS education into unlockable game achievements</div>

<div class="skill-section">
<h4>Skill A: Task — Interactive Lesson Completion & Section Unlocking <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Teach CS concepts and reward learning with in-game currency (bullets); enforce learning before playing.

**Demo Flow:**
1. Open lesson → read content → complete quiz
2. POST /complete-lesson → server awards bullets
3. Progress bar fills → `unlocked_sections` updates
4. All 5 lessons done → boss section unlocks automatically

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Lesson completion (lesson_number, bullets_earned)
**Output:** Updated total_bullets, completed_lessons[], unlocked_sections[]

<div class="code-ref">
# api/snakes_extended.py
@snakes_bp.route('/complete-lesson', methods=['POST'])
def complete_lesson():
    lesson_number = data.get('lesson_number')
    if lesson_number not in record.completed_lessons:
        record.completed_lessons.append(lesson_number)
        record.total_bullets += bullets_earned
    # Check if all lessons complete → unlock next section
    if len(record.completed_lessons) >= 5:
        if 'half2' not in record.unlocked_sections:
            record.unlocked_sections.append('half2')
</div>

**List Used:** `completed_lessons[]` — prevents re-completing same lesson; `unlocked_sections[]` — controls game progression

**Procedure:** `completeLesson(lessonNum)` — validates completion, updates DB, returns new totals

**Files:** `lessons/lesson1.html` - `lesson5.html`, `api/snakes_extended.py`
</div>
</div>

---

<div class="individual-card">
<h3>Arnav</h3>
<div class="role">Boss Battle & PvP Developer</div>
<div class="superpower"> Superpower: Combat Systems — brings intense boss AI and competitive PvP to educational gaming</div>

<div class="skill-section">
<h4>Skill A: Task — Boss Battle Arena & PvP Combat <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Create engaging final challenges with smooth boss AI movement, powerup mechanics, and competitive 1v1 PvP duels.

**Demo Flow:**
1. Enter boss arena → boss spawns with 1000 HP, slithering movement
2. WASD move, click to shoot → bullets reduce boss HP
3. Collect powerups → damage boost/speed/rapidfire/heal
4. PvP mode → 1v1 duel with center wall, first to eliminate wins

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Player position, shoot command, powerup collection
**Output:** Boss damage, powerup effects, PvP hit detection

<div class="code-ref">
// boss-battle.html - Boss AI Movement
function updateBossPosition() {
    if (pattern === 'chase') {
        const dx = targetPlayer.x - boss.x;
        const dy = targetPlayer.y - boss.y;
        boss.x += dx * 0.02;  // Smooth interpolation
        boss.y += dy * 0.02;
    } else if (pattern === 'zigzag') {
        boss.x += Math.sin(Date.now() / 200) * 5;
        boss.y += bossSpeed;
    }
}
</div>

**List Used:** `playerBullets[]`, `opponentBullets[]`, `powerups[]` — arrays tracking projectiles and collectibles

<div class="code-ref">
// Collision detection with distance formula
function checkCollisions() {
    gameState.playerBullets = gameState.playerBullets.filter(bullet => {
        const distance = Math.hypot(bullet.x - boss.x, bullet.y - boss.y);
        if (distance < boss.size) {
            damageBoss(bullet.damage);
            return false;  // Remove bullet
        }
        return true;
    });
}
</div>

**Procedure:** `applyPowerup(type)` — uses selection logic to apply correct buff; `checkCollisions()` iterates bullets for hit detection

**Files:** `boss-battle.html`, `pvp-arena.html`, `api/boss_battle.py`, `model/boss_room.py`
</div>
</div>

---

<div class="individual-card">
<h3>Ethan</h3>
<div class="role">Question System Developer</div>
<div class="superpower"> Superpower: Knowledge Testing — 50 unique questions that make learning feel like a game</div>

<div class="skill-section">
<h4>Skill A: Task — Question Bank & Answer Validation <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Test knowledge with 50 unique questions across 5 CS topics; reward correct answers with bullets; prevent re-answering.

**Demo Flow:**
1. Land on square → question modal appears
2. Select answer → validation runs against correct index
3. Correct = +5 bullets + green feedback | Wrong = red feedback
4. Square added to `visited_squares` → can't answer again

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Answer selection (square, answer_index)
**Output:** Bullet reward, updated visited_squares[], visual feedback

<div class="code-ref">
// questions/questions_bank.js
const QUESTIONS = [
  {square: 7, topic: "Programming Basics",
   question: "What keyword declares a variable in Python?",
   options: ["var", "let", "def", "None of these"],
   correct: 3, bullets: 5},
  // ... 49 more questions across 5 topics
];
</div>

**List Used:** `QUESTIONS[]` — array of 50 question objects; `visited_squares[]` — prevents repeat answers

<div class="code-ref">
# api/snakes_extended.py
@snakes_bp.route('/answer-question', methods=['POST'])
def answer_question():
    if correct:
        record.total_bullets += bullets_earned
    if square not in record.visited_squares:
        record.visited_squares.append(square)
    db.session.commit()
</div>

**Procedure:** `validateAnswer(squareNum, selectedIndex)` — compares to correct index, returns boolean; `checkAnswer()` updates backend

**Files:** `questions/questions_bank.js`, `question_template.html`, `api/snakes_extended.py`
</div>
</div>

---

<div class="individual-card">
<h3>Aneesh</h3>
<div class="role">Game Board Lead</div>
<div class="superpower"> Superpower: User Experience — smooth navigation and satisfying dice mechanics that make the game addictive</div>

<div class="skill-section">
<h4>Skill A: Task — Game Board UI, Dice Rolling & Mode Selection <span class="time-badge">1 MIN</span></h4>

**Problem Solved:** Players need intuitive navigation across 56 squares with visual feedback, character selection, and clear mode choices.

**Demo Flow:**
1. Select character from carousel → pixel-art sprites
2. Click dice → animated roll → land on square
3. Square highlights → question modal opens
4. Reach square 56 → Mode Selection hub → choose Boss Battle or PvP

</div>

<div class="skill-section">
<h4>Skill B: Code Reference (PPR)</h4>

**Input:** Dice click event, character selection, mode choice
**Output:** New square position, character assignment, navigation to battle

<div class="code-ref">
// game-board-part2.html - Dice Roll
function rollDice() {
    const roll = Math.floor(Math.random() * 6) + 1;
    diceElement.classList.add('rolling');
    setTimeout(() => {
        diceElement.textContent = roll;
        movePlayer(currentSquare + roll);
    }, 800);
}
</div>

**List Used:** `['knight','wizard','archer','warrior']` — character array for carousel; `visitedSquares[]` — tracks progress

<div class="code-ref">
// mode-selection.html - Mode Selection
function selectMode(mode) {
    if (mode === 'boss') {
        window.location.href = 'boss-battle.html';
    } else if (mode === 'pvp') {
        window.location.href = 'pvp-arena.html';
    }
}
</div>

**Procedure:** `rollDice()` — generates random 1-6, animates, calls movePlayer; `selectMode(mode)` — navigates to chosen battle

**Files:** `game-board-part1.html`, `game-board-part2.html`, `mode-selection.html`, `snakes-game.js`
</div>
</div>

---

## Visual Demos

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image.png" alt="Character Selection">
</div>

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image-1.png" alt="Game Board">
</div>

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image-7.png" alt="Lesson Page">
</div>

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image-2.png" alt="Question Modal">
</div>

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image-3.png" alt="Mode Selection">
</div>

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image-4.png" alt="Boss Battle">
</div>

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image-5.png" alt="PvP Arena">
</div>

<div class="visual-placeholder">
<img src="{{site.baseurl}}/images/snakes-ladders/image-6.png" alt="Victory Page">
</div>

---

## Presentation Scripts

### Team Overview Script (1 minute)

<div class="script-box">
<h4>Speaker: Any team member</h4>

<p><strong>[0:00-0:15]</strong> "This is Snakes and Ladders, an educational game that teaches AP Computer Science Principles. The twist? Knowledge is power — bullets earned from lessons become ammo in boss battles and PvP duels."</p>

<p><strong>[0:15-0:30]</strong> "Players complete 5 interactive lessons, then roll dice across 50 question squares. Each correct answer adds to their bullet count. When ready, they choose between a 10-player cooperative boss fight or a 1v1 PvP arena."</p>

<p><strong>[0:30-0:45]</strong> "Winners reach the Victory page with confetti animation and join the Hall of Champions — a permanent leaderboard of everyone who's beaten the game."</p>

<p><strong>[0:45-0:60]</strong> "Tech stack: Jekyll frontend, Flask backend, SQLite database, and Socket.IO for real-time multiplayer. Everything persists via JWT-authenticated APIs. Let me show you how it works..."</p>
</div>

---

### Akhil's Script (1 minute)

<div class="script-box">
<h4>Topic: Multiplayer & Victory System</h4>

<p><strong>[0:00-0:15]</strong> "I built the real-time multiplayer system. When you join a boss battle, WebSocket connects you to a room. Every 50 milliseconds, your position broadcasts to all other players."</p>

<p><strong>[0:15-0:30]</strong> "The `boss_battles` dictionary tracks every room with its players. When `handle_player_move` fires, it updates your position and emits to everyone else in the room — instant sync."</p>

<p><strong>[0:30-0:45]</strong> "I also built the Victory page. When you beat the boss or win PvP, confetti animates and your stats display. The `CompleteGameAPI` marks your game as finished and records your completion time."</p>

<p><strong>[0:45-0:60]</strong> "The Hall of Champions queries all completed games sorted by completion date. Your username appears forever in the leaderboard — proof you mastered the game."</p>
</div>

---

### Moiz's Script (1 minute)

<div class="script-box">
<h4>Topic: Authentication & Deployment</h4>

<p><strong>[0:00-0:15]</strong> "I handled authentication and deployment. When you log in, the server generates a JWT token stored in an HttpOnly cookie — secure and invisible to JavaScript attacks."</p>

<p><strong>[0:15-0:30]</strong> "Every API call passes through the `@token_required()` decorator. It decodes the JWT, extracts your user ID, and loads your specific game data from the database."</p>

<p><strong>[0:30-0:45]</strong> "For deployment, I configured Docker containers, Nginx reverse proxy, and environment variables. The backend runs on port 8306 with integrated Socket.IO."</p>

<p><strong>[0:45-0:60]</strong> "Guest mode bypasses auth using sessionStorage — no server calls, perfect for quick demos at N@tM, but progress doesn't persist across sessions."</p>
</div>

---

### Samarth's Script (1 minute)

<div class="script-box">
<h4>Topic: Lesson System & Progression</h4>

<p><strong>[0:00-0:15]</strong> "I created 5 interactive lessons covering AP CSP topics — programming basics, data structures, networking, cybersecurity, and ethics. Each has content plus a mini-quiz."</p>

<p><strong>[0:15-0:30]</strong> "When you complete a lesson, POST `/complete-lesson` fires. The server checks `completed_lessons` array — if this lesson isn't already there, it gets appended and you earn 5 bullets."</p>

<p><strong>[0:30-0:45]</strong> "The selection logic checks if all 5 lessons are done. If so, it adds 'half2' to `unlocked_sections`, opening the question gauntlet. Finish questions, and 'boss' unlocks."</p>

<p><strong>[0:45-0:60]</strong> "This sequencing ensures players learn before they battle. The bullets they earn become real firepower against the boss."</p>
</div>

---

### Arnav's Script (1 minute)

<div class="script-box">
<h4>Topic: Boss Battle & PvP Combat</h4>

<p><strong>[0:00-0:15]</strong> "I built both battle systems. The boss has 1000 HP and moves with smooth AI patterns — chase, zigzag, dash, and circle. It targets the nearest player using the distance formula."</p>

<p><strong>[0:15-0:30]</strong> "Collision detection iterates through `playerBullets[]` array. For each bullet, `Math.hypot(dx, dy)` calculates distance to the boss. If within hit radius, damage applies and the bullet is filtered out."</p>

<p><strong>[0:30-0:45]</strong> "The `applyPowerup(type)` procedure uses selection — 'damage' doubles your bullets' power, 'speed' increases movement, 'rapidfire' adds ammo, 'heal' restores a life."</p>

<p><strong>[0:45-0:60]</strong> "PvP arena is similar but 1v1 with a center wall. Players can't cross — they must shoot over it. First to deplete the opponent's lives wins."</p>
</div>

---

### Ethan's Script (1 minute)

<div class="script-box">
<h4>Topic: Question System</h4>

<p><strong>[0:00-0:15]</strong> "I built the question bank with 50 unique questions across 5 CS topics. Each question object has the prompt, four options, the correct index, and bullet reward."</p>

<p><strong>[0:15-0:30]</strong> "When a player lands on a square, JavaScript iterates through the `QUESTIONS` array using a filter to find the matching square number. That question's modal appears."</p>

<p><strong>[0:30-0:45]</strong> "Answer validation is simple selection: if `selectedIndex === correct`, award bullets. The backend POST to `/answer-question` records this and appends to `visited_squares`."</p>

<p><strong>[0:45-0:60]</strong> "The list prevents farming — before showing a question, we check if the square exists in `visited_squares`. If it does, no repeat answer allowed."</p>
</div>

---

### Aneesh's Script (1 minute)

<div class="script-box">
<h4>Topic: Game Board & Navigation</h4>

<p><strong>[0:00-0:15]</strong> "I built the game board interface. Watch as I click the dice — it animates with a rolling effect, lands on 1-6, and my character moves to that square with smooth transitions."</p>

<p><strong>[0:15-0:30]</strong> "Character selection uses an array of four pixel-art sprites — knight, wizard, archer, warrior. A `for` loop renders all 56 board squares with dynamic CSS classes based on visit state."</p>

<p><strong>[0:30-0:45]</strong> "When you reach square 56, the Mode Selection hub appears. I built this page to show both options — Boss Battle for co-op or PvP Arena for 1v1 — with real-time player counts via Socket.IO."</p>

<p><strong>[0:45-0:60]</strong> "The navigation flow connects all pages seamlessly — from login to character select to board to battle to victory. Every transition saves your progress."</p>
</div>

---

## Happy Moments / Eureka Events

| Team Member | Eureka Moment |
|-------------|---------------|
| **Akhil** | "First time seeing 5 players move simultaneously in the boss arena — the WebSocket sync was flawless. Real multiplayer magic!" |
| **Moiz** | "First successful authenticated request after fighting CORS for hours. Seeing my user data load from the JWT was relief and triumph." |
| **Samarth** | "Completing all 5 lessons and watching the boss section unlock automatically. The progression gating actually worked!" |
| **Arnav** | "The boss slithering movement looked so realistic. Watching it chase players across the arena was terrifying and awesome." |
| **Ethan** | "Writing question #50 and seeing the entire bank render correctly. 50 unique CS questions validated in one test run." |
| **Aneesh** | "When the dice animation synced perfectly with the square highlighting and character movement — the game felt *alive*." |

---

## Feature Lifecycle Example: Victory System

| Stage | Description |
|-------|-------------|
| **Origin** | Players needed a satisfying ending and permanent recognition |
| **Early Visual** | Simple "You Win" alert box |
| **Early Code** | Basic redirect after boss HP = 0 |
| **Polish** | Confetti animation, stats display, Hall of Champions API |
| **Recent** | Auto-complete on first visit, play again with progress reset |

---

## Quick Reference: Key Files

| Component | Owner | Frontend | Backend |
|-----------|-------|----------|---------|
| Game Board | Aneesh | `game-board-part1.html`, `game-board-part2.html`, `mode-selection.html` | `api/snakes_game.py` |
| Lessons | Samarth | `lessons/lesson1-5.html` | `api/snakes_extended.py` |
| Questions | Ethan | `questions/questions_bank.js`, `question_template.html` | `api/snakes_extended.py` |
| Boss Battle & PvP | Arnav | `boss-battle.html`, `pvp-arena.html` | `api/boss_battle.py`, `model/boss_room.py` |
| Multiplayer & Victory | Akhil | `victory.html` | `socketio_handlers/boss_battle.py`, `api/snakes_game.py` |
| Auth & DevOps | Moiz | — | `api/jwt_authorize.py`, `Dockerfile`, `nginx.conf` |

---

## Deployment Info

| Service | Local Port | Production URL |
|---------|-----------|----------------|
| Flask Backend + Socket.IO | 8306 | `https://snakes.opencodingsociety.com` |
| Frontend | 4100 | Jekyll GitHub Pages |

---

## N@tM Checklist

| Requirement | Status | Owner |
|-------------|--------|-------|
| Team 1-min overview | ✅ | All |
| Individual 1-min videos (6) | ✅ | Each member |
| Input/Output demonstrated | ✅ | All tasks |
| List usage shown | ✅ | All tasks |
| Procedure with parameter | ✅ | All tasks |
| Algorithm (seq + sel + iter) | ✅ | Arnav (collision), Ethan (question lookup), Samarth (Game Flow/Progression) |
| Transactional data (CRUD) | ✅ | Samarth (lessons), Ethan (questions), Akhil (champions) |
| Deployment demo ready | ✅ | Moiz |
