---
layout: post
title: "Snakes and Ladders - Game Overview & Development Blog"
description: A comprehensive breakdown of how our Snakes and Ladders educational game works, its technical architecture, and how the team split the work.
permalink: /snakes-ladders-blog
toc: true
comments: true
categories: ['Game Development']
---

<style>
.flow-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 20px 0;
    padding: 15px;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
}
.flow-step {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 0.85em;
    font-weight: 600;
    text-align: center;
    min-width: 120px;
}
.flow-arrow {
    font-size: 1.4em;
    color: #667eea;
}
.section-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 16px 20px;
    margin: 12px 0;
}
.section-card h4 {
    margin: 0 0 8px 0;
    color: #667eea;
}
.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin: 20px 0;
}
.team-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 18px;
}
.team-card h4 {
    margin: 0 0 4px 0;
    color: #4facfe;
}
.team-card .role {
    font-size: 0.8em;
    color: #f093fb;
    margin-bottom: 10px;
    font-weight: 600;
}
.team-card ul {
    margin: 0;
    padding-left: 18px;
    font-size: 0.9em;
}
.team-card li {
    margin-bottom: 4px;
}
.tech-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 0.9em;
}
.tech-table th, .tech-table td {
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.15);
    text-align: left;
}
.tech-table th {
    background: rgba(102, 126, 234, 0.2);
    color: #667eea;
    font-weight: 600;
}
.csp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 14px;
    margin: 16px 0;
}
.csp-card {
    background: rgba(255,255,255,0.05);
    border-left: 4px solid #667eea;
    border-radius: 0 8px 8px 0;
    padding: 14px 16px;
}
.csp-card h4 {
    margin: 0 0 6px 0;
    font-size: 0.95em;
    color: #4facfe;
}
.csp-card p {
    margin: 0;
    font-size: 0.85em;
    opacity: 0.9;
}
</style>

## How the Game Works

Our Snakes and Ladders game is a **gamified educational platform** that teaches AP Computer Science Principles through an interactive board game. Players learn CS concepts by progressing through the board — and the knowledge they gain directly translates into firepower for the final boss battle.

### Game Flow

<div class="flow-container">
    <div class="flow-step">Login / Guest Mode</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Character Select</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Lessons (1-6)</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Questions (7-56)</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Boss Battle</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Leaderboard</div>
</div>

### Three Sections of the Board

<div class="section-card">
<h4>Section 1 — Lessons (Squares 1–6)</h4>
Five interactive lessons covering programming basics, data structures, networking, cybersecurity, and data ethics. Each completed lesson awards <strong>bullets</strong> that carry over to the boss fight.
</div>

<div class="section-card">
<h4>Section 2 — Question Gauntlet (Squares 7–56)</h4>
Players roll a dice to advance across 50 squares, each containing a multiple-choice question from one of five CS topics. Correct answers earn additional bullets. Wrong answers? No penalty, but no ammo either.
</div>

<div class="section-card">
<h4>Section 3 — Boss Battle (Multiplayer Arena)</h4>
Up to 7 players cooperate in real-time via WebSockets to defeat a dragon boss. The boss has complex AI with multiple movement patterns (dash, zigzag, chase, circle). Powerups spawn every 5 seconds, and a group chat allows coordination. Notifications appear on-screen for player joins, powerup pickups, and defeats.
</div>

### Characters & Powerups

Players choose from four pixel-art characters, each with a unique visual identity:

| Character | Icon | Color |
|-----------|------|-------|
| Knight | Shield | Blue |
| Wizard | Magic | Purple |
| Archer | Bow | Green |
| Warrior | Sword | Orange |

During the boss battle, four powerup types spawn on the arena:
- **Damage Boost** — 2x damage for 8 seconds
- **Speed Boost** — 1.5x movement speed for 10 seconds
- **Rapid Fire** — +15 bullets instantly
- **Health Restore** — Recover 1 life (or +10 bullets if full)

---

## Technical Architecture & Transactional Data

The system uses a **Jekyll static frontend** communicating with a **Flask (Python) backend** via REST APIs and WebSocket connections.

### File Structure

<table class="tech-table">
<tr><th>Layer</th><th>File</th><th>Purpose</th></tr>
<tr><td rowspan="3">Frontend</td><td><code>game-board-part1.html</code></td><td>Lessons, character selection, login</td></tr>
<tr><td><code>game-board-part2.html</code></td><td>Question board with dice rolling</td></tr>
<tr><td><code>boss-battle.html</code></td><td>Multiplayer boss arena with canvas rendering</td></tr>
<tr><td rowspan="2">Shared JS</td><td><code>snakes-game.js</code></td><td>Core game logic, API calls, autosave</td></tr>
<tr><td><code>questions_bank.js</code></td><td>50 questions across 5 CS topics</td></tr>
<tr><td rowspan="3">Backend API</td><td><code>api/snakes_game.py</code></td><td>CRUD endpoints for game progress</td></tr>
<tr><td><code>api/snakes_extended.py</code></td><td>Lessons, questions, leaderboard endpoints</td></tr>
<tr><td><code>api/boss_battle.py</code></td><td>Battle room creation/joining</td></tr>
<tr><td>WebSocket</td><td><code>socket/boss_battle.py</code></td><td>Real-time multiplayer sync, chat, powerups</td></tr>
<tr><td rowspan="2">Models</td><td><code>model/snakes_game.py</code></td><td>SnakesGameData (progress, bullets, lives)</td></tr>
<tr><td><code>model/boss_room.py</code></td><td>BossRoom, BossPlayer, BossBattleStats</td></tr>
</table>

### How Transactional Data Flows

Every user action triggers a backend transaction. Here are the key data flows:

**Lesson Completion:**
<div class="flow-container">
    <div class="flow-step">Complete Lesson</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">POST /api/snakes/complete-lesson</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Server updates completed_lessons[] & total_bullets</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Unlock next section</div>
</div>

**Answering Questions:**
<div class="flow-container">
    <div class="flow-step">Answer Question</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">POST /api/snakes/answer-question</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Update current_square, visited_squares[]</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Award bullets if correct</div>
</div>

**Autosave (Every 10 seconds):**
<div class="flow-container">
    <div class="flow-step">Timer fires</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">PUT /api/snakes/</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Save full state (square, bullets, lives, time, lessons, sections)</div>
</div>

**Boss Battle (Real-time):**
<div class="flow-container">
    <div class="flow-step">POST /api/boss/join</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Get room_id</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">WebSocket connect</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Position sync (50ms) + Powerup spawn (5s)</div>
</div>

### Key API Transactions

| Action | Method & Endpoint | Payload | Server Response |
|--------|-------------------|---------|-----------------|
| Load progress | `GET /api/snakes/` | — | Full game state |
| Complete lesson | `POST /api/snakes/complete-lesson` | `{lesson_number, bullets_earned}` | Updated totals |
| Answer question | `POST /api/snakes/answer-question` | `{square, bullets_earned, correct}` | Updated position |
| Join boss battle | `POST /api/boss/join` | `{bullets, lives, character}` | `{room_id, players}` |
| Get leaderboard | `GET /api/snakes/leaderboard` | — | Top 10 by bullets |

### Authentication Flow

All API calls are secured with **JWT tokens** stored in HttpOnly cookies. The `@token_required()` decorator extracts the user ID from the token payload and associates all game data with the correct `SnakesGameData` database record. Guest/demo mode uses `sessionStorage` as a fallback with no server persistence.

---

## Team Work Split

<div class="team-grid">

<div class="team-card">
<h4>Akhil</h4>
<div class="role">Scrum Master</div>
<ul>
<li>Project coordination, sprint planning, and stand-ups</li>
<li>Main game board UI and dice-rolling mechanics</li>
<li>Character selection carousel</li>
<li>Frontend navigation flow between all game pages</li>
<li><code>game-board-part1.html</code>, <code>game-board-part2.html</code></li>
</ul>
</div>

<div class="team-card">
<h4>Moiz</h4>
<div class="role">Assistant Scrum Master / DevOps</div>
<ul>
<li>Backend deployment: Dockerfile, docker-compose, Nginx</li>
<li>Production environment variables and CORS config</li>
<li>JWT authentication system (<code>api/authenticate.py</code>)</li>
<li>Cookie management and <code>@token_required()</code> decorator</li>
<li>Flask application factory and server configuration</li>
</ul>
</div>

<div class="team-card">
<h4>Samarth</h4>
<div class="role">Lesson System Developer</div>
<ul>
<li>Five interactive lesson pages (<code>lessons/lesson1-5.html</code>)</li>
<li>Arcade-style lesson CSS and UI</li>
<li><code>POST /api/snakes/complete-lesson</code> endpoint</li>
<li>Section unlocking logic (half1 → half2 → boss)</li>
<li>Lesson completion tracking and bullet rewards</li>
</ul>
</div>

<div class="team-card">
<h4>Arnav</h4>
<div class="role">Question System Developer</div>
<ul>
<li>50-question bank across 5 CS topics (<code>questions_bank.js</code>)</li>
<li>Question modal template and answer validation</li>
<li><code>POST /api/snakes/answer-question</code> endpoint</li>
<li>Bullet-awarding logic for correct answers</li>
<li>Square visit tracking to prevent re-answering</li>
</ul>
</div>

<div class="team-card">
<h4>Ethan</h4>
<div class="role">Boss Battle Developer</div>
<ul>
<li>Full <code>boss-battle.html</code> with canvas-based rendering</li>
<li>Pixel-art character sprites and boss AI patterns</li>
<li>Bullet physics and powerup spawning/collection</li>
<li><code>api/boss_battle.py</code> REST endpoints for room management</li>
<li>Database models: BossRoom, BossPlayer, BossBattleStats</li>
</ul>
</div>

<div class="team-card">
<h4>Aneesh</h4>
<div class="role">Multiplayer & Social Features Developer</div>
<ul>
<li>WebSocket handler (<code>socket/boss_battle.py</code>)</li>
<li>Real-time player synchronization and position broadcast</li>
<li>Group chat system (lobby + in-battle messaging)</li>
<li>Leaderboard API and frontend display</li>
<li>Autosave mechanism and demo/guest mode</li>
</ul>
</div>

</div>

---

## Meeting AP CSP College Board Requirements

Our game directly addresses multiple College Board AP CSP requirements through its design and implementation:

<div class="csp-grid">

<div class="csp-card">
<h4>Input (Big Idea 3)</h4>
<p>Users provide input through HTML form elements (character selection clicks, question answer buttons, chat text input) and JavaScript event listeners (keyboard WASD/arrows for movement, mouse position for aiming, spacebar/click for shooting).</p>
</div>

<div class="csp-card">
<h4>Persistent Data Storage (Big Idea 3)</h4>
<p>Game state is stored in a relational database (SQLite/MySQL) via Flask-SQLAlchemy. Player progress (<code>current_square</code>, <code>total_bullets</code>, <code>completed_lessons</code>, <code>visited_squares</code>) persists across sessions through authenticated API calls.</p>
</div>

<div class="csp-card">
<h4>Sequencing (Big Idea 3)</h4>
<p>The game enforces ordered execution: lessons must complete before questions unlock, questions must be answered before the boss section unlocks. API calls execute sequentially (fetch progress → validate → update → respond).</p>
</div>

<div class="csp-card">
<h4>Selection (Big Idea 3)</h4>
<p>Conditionals drive game logic throughout: <code>if (correct)</code> awards bullets, <code>if (lives <= 0)</code> triggers death, <code>if (square >= 56)</code> unlocks boss, <code>if (bossHealth <= 0)</code> ends the battle. The backend validates conditions before granting access.</p>
</div>

<div class="csp-card">
<h4>Iteration (Big Idea 3)</h4>
<p>Loops run the game: <code>requestAnimationFrame</code> drives the render loop, <code>setInterval</code> handles autosave (10s), position broadcasting (50ms), and powerup spawning (5s). The question system iterates through <code>visited_squares</code> to track progress.</p>
</div>

<div class="csp-card">
<h4>Lists / Collections (Big Idea 3)</h4>
<p>Arrays and JSON objects store structured data: <code>visited_squares[]</code>, <code>completed_lessons[]</code>, <code>unlocked_sections[]</code>, <code>powerups[]</code>, <code>otherPlayers{}</code>. The backend manages lists of players per room and leaderboard rankings.</p>
</div>

<div class="csp-card">
<h4>Procedures / Functions (Big Idea 3)</h4>
<p>Modular functions with parameters and return values: <code>applyPowerup(type)</code>, <code>shoot()</code>, <code>loadPlayerData()</code>, <code>sendChatMessage()</code>, <code>spawn_powerup_for_room(room_id)</code>. Backend uses decorated route handlers with request parsing.</p>
</div>

<div class="csp-card">
<h4>Algorithms (Big Idea 3)</h4>
<p>The boss AI implements pathfinding algorithms with pattern switching (normal, dash, zigzag, chase, circle). Collision detection uses the distance formula (<code>Math.hypot</code>). The leaderboard uses sorting algorithms to rank players by score.</p>
</div>

<div class="csp-card">
<h4>The Internet (Big Idea 4)</h4>
<p>The game operates over HTTP/HTTPS with RESTful APIs (GET, POST, PUT) and WebSocket connections for real-time multiplayer. JWT tokens authenticate requests, CORS headers control access, and Nginx handles reverse proxying.</p>
</div>

<div class="csp-card">
<h4>Impact of Computing (Big Idea 5)</h4>
<p>The game itself teaches CS ethics and data privacy concepts through its lesson content. Guest mode demonstrates data minimization principles — no personal data is collected for unauthenticated users.</p>
</div>

</div>

### Create Performance Task Alignment

The project structure maps directly to the CPT requirements:
- **Program Purpose:** Educate users on AP CSP concepts through gamified learning
- **Program Function:** Interactive game board with progression, questions, and multiplayer boss battle
- **Input → Output:** User answers (input) → bullet rewards and progression (output); keyboard/mouse (input) → character movement and shooting (output)
- **List Usage:** `visited_squares` array stores/retrieves which questions have been answered, iterated to show progress
- **Procedure with Parameter:** `applyPowerup(type)` takes a powerup type, applies the corresponding buff using selection logic, and modifies game state
- **Algorithm with Sequencing + Selection + Iteration:** Boss AI movement function sequences through pattern selection (`if patternTimer > threshold`), iterates to calculate new positions, and selects behavior based on player proximity
