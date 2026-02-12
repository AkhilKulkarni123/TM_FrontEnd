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
    margin-bottom: 6px;
    font-weight: 600;
}
.team-card .superpower {
    font-size: 0.75em;
    color: #ffd700;
    margin-bottom: 10px;
    font-style: italic;
    padding: 4px 8px;
    background: rgba(255, 215, 0, 0.1);
    border-radius: 4px;
    display: inline-block;
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

Our Snakes and Ladders game is a **gamified educational platform** that teaches AP Computer Science Principles through an interactive board game. Players learn CS concepts by progressing through the board — and the knowledge they gain directly translates into firepower for the final battles.

### Game Flow

<div class="flow-container">
    <div class="flow-step">Login / Guest Mode</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Character Select</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Lessons (1-5)</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Questions (7-56)</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Mode Selection</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Boss Battle / PvP / SlitherRush</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Victory Page</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Hall of Champions</div>
</div>

### Seven Sections of the Board

<div class="section-card">
<h4>Section 1 — Lessons (Squares 1–6)</h4>
Five interactive lessons covering programming basics, data structures, networking, cybersecurity, and data ethics. Each completed lesson awards <strong>bullets</strong> that carry over to the boss fight. Completion of all five lessons unlocks the <code>'half2'</code> board section via the <code>unlocked_sections</code> array.
</div>

<div class="section-card">
<h4>Section 2 — Question Gauntlet (Squares 7–56)</h4>
Players roll a dice to advance across 50 squares, each containing a multiple-choice question from one of five CS topics. Correct answers earn additional bullets. Wrong answers? No penalty, but no ammo either. Reaching square 56 unlocks the <code>'boss'</code> section. The server validates square ranges (<code>QUESTION_SECTION_MIN_SQUARE = 7</code>, <code>QUESTION_SECTION_MAX_SQUARE = 56</code>) before processing answers.
</div>

<div class="section-card">
<h4>Section 3 — Mode Selection Hub</h4>
After completing enough questions, players reach the <strong>Mode Selection</strong> page (<code>mode-selection.html</code>) where they choose between cooperative Boss Battle, competitive PvP Arena, or the SlitherRush minigame. Real-time Socket.IO status events (<code>pvp_status</code>, <code>slitherrush_status</code>) show live player counts, active rooms, and open slots for each mode.
</div>

<div class="section-card">
<h4>Section 4 — Boss Battle (Co-op Multiplayer)</h4>
Up to 10 players cooperate in real-time via WebSockets to defeat a dragon boss. The boss has complex AI with multiple movement patterns (dash, zigzag, chase, circle). Four powerup types (damage, speed, rapidfire, heal) spawn every 5 seconds via server-controlled rate limiting. A pre-battle <strong>lobby chat</strong> system lets players coordinate before entering (<code>boss_join_lobby</code>/<code>boss_leave_lobby</code>). In-battle group chat, tab-away detection (<code>boss_player_away</code>/<code>boss_player_returned</code>), server-authoritative spawn allocation, player-to-boss and player-to-player <strong>collision resolution</strong>, and per-player <strong>battle stats tracking</strong> (damage dealt, bullets fired, bullets hit, powerups collected) all run server-side. On boss defeat, a <strong>victory stats screen</strong> aggregates every player's contributions.
</div>

<div class="section-card">
<h4>Section 5 — PvP Arena (1v1 Competitive)</h4>
Two players battle head-to-head in a real-time duel with <strong>server-authoritative collision resolution</strong>. Auto-matchmaking assigns players to open rooms via <code>get_or_create_open_room()</code>, and a <strong>dual-ready system</strong> ensures both players confirm before battle starts (<code>pvp_ready</code> → <code>pvp_battle_start</code>). Players are separated by a center wall barrier, using earned bullets as ammo. Movement via WASD/arrows, mouse aiming, and click/spacebar to shoot. The server resolves player-to-player overlap using <code>resolve_player_collision()</code> with a minimum distance of <code>PVP_PLAYER_RADIUS * 2</code> (56 px). Lives tracked with health bars, in-arena chat (<code>pvp_chat_send</code>), tab-away detection (<code>pvp_player_away</code>/<code>pvp_player_returned</code>), authoritative position corrections (<code>pvp_self_position</code>), and aggregate status broadcasting keep all clients in sync.
</div>

<div class="section-card">
<h4>Section 6 — SlitherRush (Multiplayer Snake Arena)</h4>
A slither.io-inspired minigame supporting up to <strong>32 players per arena</strong>. Each snake is a chain of segments that grows on kills and shrinks on deaths. Players steer with directional input and hold fire to shoot bullets from the snake's head. The entire simulation is <strong>server-authoritative</strong>: a background tick loop runs at <strong>30 Hz</strong> (<code>SlitherRushManager.TICK_RATE = 30</code>), state snapshots emit at 15 fps, and leaderboard updates broadcast every 450 ms. Key parameters include <code>PLAYER_SPEED = 225</code>, <code>BULLET_SPEED = 640</code>, <code>FIRE_COOLDOWN = 0.22s</code>, <code>MAX_HP = 3</code>, and <code>SPAWN_PROTECT_SECONDS = 0.6</code>. Arena management auto-creates rooms when all existing ones are full, and a party system (<code>party_to_arena</code> mapping) groups friends into the same arena. The real-time leaderboard ranks players by score, kills, and snake length.
</div>

<div class="section-card">
<h4>Section 7 — Victory Page & Hall of Champions</h4>
Winners are directed to <code>victory.html</code> with animated confetti, player stats summary (bullets earned, time played, win mode), and the <strong>Hall of Champions</strong> leaderboard showing all game completers (queried via <code>ChampionsAPI</code> ordered by <code>completed_at</code>). Players can cement their victory or <strong>reset all progress</strong> via <code>ResetProgressAPI</code> — which preserves champion status while resetting position, bullets, lives, lessons, and character selection back to defaults.
</div>

### Characters & Powerups

Players choose from four pixel-art characters, each with a unique visual identity:

| Character | Icon | Color |
|-----------|------|-------|
| Knight | Shield | Blue |
| Wizard | Magic | Purple |
| Archer | Bow | Green |
| Warrior | Sword | Orange |

During the boss battle, four powerup types spawn on the arena (rate-limited to one spawn every `POWERUP_SPAWN_INTERVAL = 5` seconds per room):
- **Damage Boost** — 2x damage for 8 seconds
- **Speed Boost** — 1.5x movement speed for 10 seconds
- **Rapid Fire** — +15 bullets instantly
- **Health Restore** — Recover 1 life (or +10 bullets if full)

Powerup collection is tracked server-side per player (`powerups_collected[]`) and broadcast to all room members via the `boss_powerup_collected` event.

### Lives & Game State System

Every player starts with **5 lives** and a `game_status` of `'active'`. The `SnakesGameData` model tracks `lives`, `boss_battle_attempts`, and `completed_at` timestamp. When a player reaches square 100 or defeats the boss, the `CompleteGameAPI` sets `game_status = 'completed'` and records the completion time. The `ResetPositionAPI` resets position, lives, and status for boss-battle retries.

### Active Players Tracking

The `ActivePlayersAPI` endpoint queries all `SnakesGameData` records updated within the last **10 seconds** (`timedelta(seconds=10)`) to show who is currently playing in real-time. This powers the live player count displays on the game board and mode selection pages.

---

## Technical Architecture & Transactional Data

The system uses a **Jekyll static frontend** communicating with a **Flask (Python) backend** via REST APIs and WebSocket connections.

### File Structure

<table class="tech-table">
<tr><th>Layer</th><th>File</th><th>Purpose</th></tr>
<tr><td rowspan="6">Frontend</td><td><code>game-board-part1.html</code></td><td>Lessons, character selection, login</td></tr>
<tr><td><code>game-board-part2.html</code></td><td>Question board with dice rolling</td></tr>
<tr><td><code>mode-selection.html</code></td><td>Battle mode hub (Boss vs PvP vs SlitherRush)</td></tr>
<tr><td><code>boss-battle.html</code></td><td>Co-op boss arena with canvas rendering</td></tr>
<tr><td><code>pvp-arena.html</code></td><td>1v1 competitive arena with center wall</td></tr>
<tr><td><code>victory.html</code></td><td>Victory celebration, Hall of Champions</td></tr>
<tr><td rowspan="2">Shared JS</td><td><code>snakes-game.js</code></td><td>Core game logic, API calls, autosave</td></tr>
<tr><td><code>questions_bank.js</code></td><td>50 questions across 5 CS topics</td></tr>
<tr><td rowspan="3">Backend API</td><td><code>api/snakes_game.py</code></td><td>CRUD, leaderboard, champions, active players, reset</td></tr>
<tr><td><code>api/snakes_extended.py</code></td><td>Lessons, questions, section unlocking, progress</td></tr>
<tr><td><code>api/boss_battle.py</code></td><td>Battle room creation/joining</td></tr>
<tr><td rowspan="4">WebSocket</td><td><code>socketio_handlers/boss_battle.py</code></td><td>Boss battle + PvP sync, lobby chat, powerups, collision resolution</td></tr>
<tr><td><code>socketio_handlers/slitherrush_manager.py</code></td><td>SlitherRush arena state, 30Hz tick, bullet physics, snake segments</td></tr>
<tr><td><code>socketio_handlers/slitherrush_events.py</code></td><td>SlitherRush Socket.IO event handlers, JWT auth for sockets</td></tr>
<tr><td><code>socketio_handlers/socket_server.py</code></td><td>Dedicated Socket.IO server (port 8500, eventlet async)</td></tr>
<tr><td rowspan="3">Models</td><td><code>model/snakes_game.py</code></td><td>SnakesGameData (progress, bullets, lives, sections, lessons)</td></tr>
<tr><td><code>model/game_progress.py</code></td><td>GameProgress, SquareCompletion tracking</td></tr>
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
    <div class="flow-step">boss_join_lobby</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Pre-battle Chat</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">boss_join_room</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Server spawn allocation</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Position sync + Collision resolution + Powerup spawn (5s)</div>
</div>

**PvP Arena (Real-time):**
<div class="flow-container">
    <div class="flow-step">pvp_join</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Auto-matchmaking</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">pvp_ready (both players)</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">pvp_battle_start</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Server collision + Position authority</div>
</div>

**SlitherRush (Real-time):**
<div class="flow-container">
    <div class="flow-step">slitherrush_join</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Arena assignment (≤32 players)</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">slitherrush_input (direction + shoot)</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Server tick loop (30Hz) → State snapshot (15fps)</div>
</div>

**Game Completion:**
<div class="flow-container">
    <div class="flow-step">Reach end / Defeat boss</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">POST /api/snakes/complete</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Set game_status='completed', record completed_at</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Victory page → Hall of Champions</div>
</div>

### Key API Transactions

| Action | Method & Endpoint | Payload | Server Response |
|--------|-------------------|---------|-----------------|
| Load progress | `GET /api/snakes/` | — | Full game state |
| Get progress | `GET /api/snakes/progress` | — | Auto-creates record if missing |
| Complete lesson | `POST /api/snakes/complete-lesson` | `{lesson_number, bullets_earned}` | Updated totals + unlocked_sections |
| Answer question | `POST /api/snakes/answer-question` | `{square, bullets_earned, correct}` | Updated position + section unlocks |
| Update game state | `PUT /api/snakes/update-game` | `{current_square, lives, ...}` | Full game state |
| Complete game | `POST /api/snakes/complete` | — | `game_status='completed'` + timestamp |
| Reset progress | `POST /api/snakes/reset` | — | Fresh state, preserves champion history |
| Get active players | `GET /api/snakes/active-players` | — | Players updated within last 10s |
| Get champions | `GET /api/snakes/champions` | — | All completers ordered by time |
| Get leaderboard | `GET /api/snakes/leaderboard` | `?limit=10` | Top players by bullets |
| Add bullets | `POST /api/snakes/add-bullets` | `{bullets}` | Updated total_bullets |
| Update square | `POST /api/snakes/update-square` | `{square}` | Updated position + visited list |
| Get unvisited | `GET /api/snakes/unvisited-squares` | — | Unvisited count + list |

### Authentication Flow

All API calls are secured with **JWT tokens** stored in HttpOnly cookies. The `@token_required()` decorator extracts the user ID from the token payload and associates all game data with the correct `SnakesGameData` database record. Guest/demo mode uses `sessionStorage` as a fallback with no server persistence.

---

## Team Work Split

<div class="team-grid">

<div class="team-card">
<h4>Akhil</h4>
<div class="role">Scrum Master / Multiplayer & Victory System Developer</div>
<div class="superpower">⚡ Real-time Multiplayer Sync — connects players across the world in milliseconds</div>
<ul>
<li>Project coordination, sprint planning, and stand-ups</li>
<li>WebSocket handler (<code>socketio_handlers/boss_battle.py</code>) — Boss Battle, PvP Arena, lobby chat, powerup system</li>
<li>Server-authoritative collision resolution (<code>resolve_player_collision()</code>) for Boss and PvP</li>
<li>Server-authoritative spawn allocation (<code>allocate_boss_spawn()</code>) with grid fallback</li>
<li>Pre-battle lobby system (<code>boss_join_lobby</code>/<code>boss_leave_lobby</code>) with member tracking</li>
<li>Tab-away detection (<code>boss_player_away</code>/<code>boss_player_returned</code>) for Boss and PvP</li>
<li>Per-player battle stats tracking (damage_dealt, bullets_fired, bullets_hit, powerups_collected)</li>
<li>PvP auto-matchmaking (<code>get_or_create_open_room()</code>) and dual-ready system</li>
<li>In-arena chat for both Boss Battle and PvP modes</li>
<li><code>victory.html</code> with confetti animation, Hall of Champions, and victory stats screen</li>
<li>Leaderboard API, Champions API, Active Players API, Complete Game and Reset Progress endpoints</li>
<li>Autosave mechanism (10s interval) and demo/guest mode</li>
<li>Dedicated Socket.IO server (<code>socket_server.py</code>, port 8500, eventlet async)</li>
</ul>
<details><summary><strong>Code Snippet</strong></summary>

```python
# Server-authoritative collision resolution (socketio_handlers/boss_battle.py)
def resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist):
    dx = desired_x - other_x
    dy = desired_y - other_y
    dist = math.sqrt(dx * dx + dy * dy)
    if dist < 0.001:
        return other_x + min_dist, desired_y, True
    if dist >= min_dist:
        return desired_x, desired_y, False
    overlap = min_dist - dist
    nx, ny = dx / dist, dy / dist
    return desired_x + nx * overlap, desired_y + ny * overlap, True
```
</details>
</div>

<div class="team-card">
<h4>Moiz</h4>
<div class="role">DevOps / Authentication Lead</div>
<div class="superpower">🔐 Secure Sessions — JWT tokens keep your game data safe across devices</div>
<ul>
<li>Backend deployment: Dockerfile, docker-compose, Nginx</li>
<li>Production environment variables and CORS config</li>
<li>JWT authentication system (<code>api/jwt_authorize.py</code>)</li>
<li>Cookie management and <code>@token_required()</code> decorator</li>
<li>WebSocket JWT authentication (<code>_resolve_socket_user()</code> in <code>slitherrush_events.py</code>) — decodes JWT from cookies for socket connections</li>
<li>Snakes SFX system (procedural audio + toggle)</li>
<li>Flask application factory, server configuration, and database initialization (<code>scripts/game_init.py</code>)</li>
</ul>
<details><summary><strong>Code Snippet</strong></summary>

```python
# WebSocket JWT auth (socketio_handlers/slitherrush_events.py)
def _resolve_socket_user():
    token_name = current_app.config.get('JWT_TOKEN_NAME', 'jwt')
    token = request.cookies.get(token_name)
    if not token:
        return None
    decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    uid = decoded.get('_uid')
    return User.query.filter_by(_uid=uid).first()
```
</details>
</div>

<div class="team-card">
<h4>Samarth</h4>
<div class="role">Lesson System Developer</div>
<div class="superpower">📚 Progressive Learning — turns CS education into unlockable game achievements</div>
<ul>
<li>Five interactive lesson pages (<code>lessons/lesson1-5.html</code>)</li>
<li>Arcade-style lesson CSS and UI animations</li>
<li><code>POST /api/snakes/complete-lesson</code> endpoint with server-side validation (lesson 1–5 range check)</li>
<li>Section unlocking logic: <code>half1</code> → <code>half2</code> (after all 5 lessons) → <code>boss</code> (after reaching square 56)</li>
<li>Lesson completion tracking via <code>completed_lessons[]</code> (MutableList/JSON column) and bullet rewards</li>
<li>Progress persistence across sessions via <code>GET /api/snakes/progress</code> (auto-creates record if missing)</li>
</ul>
<details><summary><strong>Code Snippet</strong></summary>

```python
# Section unlocking on lesson completion (api/snakes_extended.py)
if lesson_number not in record.completed_lessons:
    record.completed_lessons.append(lesson_number)
    record.total_bullets += bullets_earned
    # Unlock second half after completing all five lessons
    if len(set(record.completed_lessons)) >= 5 and 'half2' not in record.unlocked_sections:
        record.unlocked_sections.append('half2')
```
</details>
</div>

<div class="team-card">
<h4>Arnav</h4>
<div class="role">Boss Battle & PvP Developer</div>
<div class="superpower">🐉 Combat Systems — brings intense boss AI and competitive PvP to educational gaming</div>
<ul>
<li>Full <code>boss-battle.html</code> with canvas-based rendering and server-authoritative position sync</li>
<li>Pixel-art character sprites and boss AI movement patterns (normal, dash, zigzag, chase, circle)</li>
<li>Bullet physics and collision detection (<code>Math.hypot</code>) with server-validated bounds clamping</li>
<li><code>pvp-arena.html</code> with center wall, 1v1 mechanics, and server-authoritative position corrections</li>
<li>Powerup system: 4 types (damage, speed, rapidfire, heal), server-controlled spawn rate, per-player collection tracking</li>
<li>Boss victory stats aggregation — collects all players' damage_dealt, bullets_used, lives, and powerups on boss defeat</li>
<li>SlitherRush frontend — slither.io-inspired multiplayer snake arena with directional steering and shooting</li>
<li>Database models: BossRoom, BossPlayer, BossBattleStats, GameProgress, SquareCompletion</li>
</ul>
<details><summary><strong>Code Snippet</strong></summary>

```python
# Boss defeated — aggregate all player stats (socketio_handlers/boss_battle.py)
if boss_battles[room_id]['boss_health'] <= 0:
    all_player_stats = []
    for player_sid, player_data in boss_battles[room_id]['players'].items():
        all_player_stats.append({
            'username': player_data.get('username', 'Unknown'),
            'damage_dealt': player_data.get('damage_dealt', 0),
            'lives': player_data.get('lives', 0),
            'powerups_collected': player_data.get('powerups_collected', [])
        })
    emit('boss_defeated', {'all_player_stats': all_player_stats}, room=room_id)
```
</details>
</div>

<div class="team-card">
<h4>Ethan</h4>
<div class="role">Question System Developer</div>
<div class="superpower">🧠 Knowledge Testing — 50 unique questions that make learning feel like a game</div>
<ul>
<li>50-question bank across 5 CS topics (<code>questions_bank.js</code>)</li>
<li>Question modal template and answer validation</li>
<li><code>POST /api/snakes/answer-question</code> endpoint with server-side square range validation (<code>QUESTION_SECTION_MIN_SQUARE</code> to <code>QUESTION_SECTION_MAX_SQUARE</code>)</li>
<li>Bullet-awarding logic for correct answers; automatic <code>'boss'</code> section unlock when reaching square 56</li>
<li>Square visit tracking via <code>visited_squares[]</code> (MutableList/JSON) to prevent re-answering</li>
<li>Unvisited squares API (<code>GET /api/snakes/unvisited-squares</code>) returning visited/unvisited counts</li>
<li>Visual feedback for correct/incorrect answers</li>
</ul>
<details><summary><strong>Code Snippet</strong></summary>

```python
# Answer question with section unlock (api/snakes_extended.py)
record.current_square = square
if square not in record.visited_squares:
    record.visited_squares.append(square)
if correct:
    record.total_bullets += bullets_earned
# Unlock boss battle when reaching square 56
if square >= QUESTION_SECTION_MAX_SQUARE and 'boss' not in record.unlocked_sections:
    record.unlocked_sections.append('boss')
```
</details>
</div>

<div class="team-card">
<h4>Aneesh</h4>
<div class="role">Game Board Lead</div>
<div class="superpower">🎲 User Experience — smooth navigation and satisfying dice mechanics that make the game addictive</div>
<ul>
<li>Main game board UI and dice-rolling mechanics</li>
<li>Character selection carousel with pixel-art sprites</li>
<li>Character perks (knight/wizard/archer/warrior)</li>
<li>Mode Selection hub page (<code>mode-selection.html</code>) — now shows Boss Battle, PvP Arena, and SlitherRush with live player counts via Socket.IO status events</li>
<li>Frontend navigation flow between all game pages</li>
<li><code>game-board-part1.html</code>, <code>game-board-part2.html</code></li>
<li>Board square rendering and progression visualization with split-board unlock indicators (<code>half1</code>/<code>half2</code>/<code>boss</code>)</li>
<li>SlitherRush manager and simulation (<code>slitherrush_manager.py</code>, <code>slitherrush_simulation.py</code>) — 30Hz server tick loop, arena auto-creation, party system, snake segment physics, bullet spawning</li>
<li>Guest mode (sessionStorage-based progress)</li>
</ul>
<details><summary><strong>Code Snippet</strong></summary>

```python
# SlitherRush 30Hz tick loop (socketio_handlers/slitherrush_events.py)
def _tick_loop():
    while _manager is not None:
        now = time.time()
        dt = max(0.0, min(0.1, now - last))
        with _manager.lock:
            _simulation.step(now, dt)
            for arena in list(_manager.arenas.values()):
                if now - arena['last_snapshot_at'] >= _manager.SNAPSHOT_INTERVAL:
                    arena['last_snapshot_at'] = now
                    _manager.emit_state(arena, now)
        time.sleep(_manager.TICK_INTERVAL)  # 1/30s
```
</details>
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
<p>Loops run the game: <code>requestAnimationFrame</code> drives the render loop, <code>setInterval</code> handles autosave (10s), position broadcasting (50ms), and powerup spawning (5s). The SlitherRush server tick loop runs at 30 Hz, iterating all arenas, players, and bullets each frame. The question system iterates through <code>visited_squares</code> to track progress.</p>
</div>

<div class="csp-card">
<h4>Lists / Collections (Big Idea 3)</h4>
<p>Arrays and JSON objects store structured data: <code>visited_squares[]</code>, <code>completed_lessons[]</code>, <code>unlocked_sections[]</code>, <code>powerups[]</code>, <code>otherPlayers{}</code>, <code>slither_segments[]</code>, <code>arena['bullets']</code>. The backend manages <code>MutableList/JSON</code> columns for in-place list mutation with SQLAlchemy persistence.</p>
</div>

<div class="csp-card">
<h4>Procedures / Functions (Big Idea 3)</h4>
<p>Modular functions with parameters and return values: <code>resolve_player_collision(x, y, ox, oy, dist)</code>, <code>allocate_boss_spawn(room_id, radius, bounds)</code>, <code>spawn_powerup_for_room(room_id)</code>, <code>_step_bullets(arena, now, dt)</code>. Backend uses decorated route handlers with request parsing and WebSocket event handlers.</p>
</div>

<div class="csp-card">
<h4>Algorithms (Big Idea 3)</h4>
<p>The boss AI implements pathfinding with pattern switching (normal, dash, zigzag, chase, circle). Collision detection uses the distance formula (<code>Math.hypot</code>, <code>math.sqrt</code>). SlitherRush bullet-hit detection uses squared-distance comparison against <code>hit_radius_sq</code>. Safe spawn allocation tries random positions then falls back to grid scan. The leaderboard sorts players by (score, kills, length).</p>
</div>

<div class="csp-card">
<h4>The Internet (Big Idea 4)</h4>
<p>The game operates over HTTP/HTTPS with RESTful APIs (GET, POST, PUT) and WebSocket connections for real-time multiplayer. A dedicated Socket.IO server runs on port 8500 with eventlet async mode. JWT tokens authenticate both HTTP requests and WebSocket connections (via cookie-based <code>_resolve_socket_user()</code>). CORS headers control access, and Nginx handles reverse proxying.</p>
</div>

<div class="csp-card">
<h4>Impact of Computing (Big Idea 5)</h4>
<p>The game itself teaches CS ethics and data privacy concepts through its lesson content. Guest mode demonstrates data minimization principles — no personal data is collected for unauthenticated users.</p>
</div>

</div>

---

## Individual AP CSP Requirements by Team Member

Each team member's contribution demonstrates specific College Board requirements:

<div class="team-grid">

<div class="team-card">
<h4>Akhil — AP CSP Alignment</h4>
<div class="role">Multiplayer & Victory</div>
<ul>
<li><strong>The Internet:</strong> WebSocket events (<code>emit</code>/<code>on</code>) for real-time sync; dedicated Socket.IO server on port 8500 with eventlet async</li>
<li><strong>Iteration:</strong> <code>setInterval</code> broadcasts position every 50ms; autosave every 10s; powerup spawn rate-limiting loop</li>
<li><strong>List:</strong> <code>boss_battles[room_id]['players']</code> dict; <code>lobby_members{}</code>; <code>pvp_rooms{}</code>; <code>champions[]</code></li>
<li><strong>Procedure:</strong> <code>resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)</code> with 5 parameters and return tuple</li>
<li><strong>Algorithm:</strong> Collision resolution calculates distance, detects overlap, normalizes push vector — uses sequencing, selection (<code>if dist >= min_dist</code>), and math (<code>math.sqrt</code>)</li>
<li><strong>Data Storage:</strong> <code>ChampionsAPI</code> queries completed games; <code>ResetProgressAPI</code> clears state while preserving champion history; <code>ActivePlayersAPI</code> filters by 10-second threshold</li>
</ul>
</div>

<div class="team-card">
<h4>Moiz — AP CSP Alignment</h4>
<div class="role">Authentication & DevOps</div>
<ul>
<li><strong>The Internet:</strong> JWT tokens over HTTPS, CORS configuration, cookie security flags; WebSocket JWT auth via <code>_resolve_socket_user()</code></li>
<li><strong>Selection:</strong> <code>if not token</code> returns 401; <code>if token_expired</code> returns 403; socket auth falls back through <code>current_user</code> → cookie → <code>None</code></li>
<li><strong>Procedure:</strong> <code>@token_required()</code> decorator with nested function and return; <code>_resolve_user_identity(payload)</code> resolves user from socket context</li>
<li><strong>Data Storage:</strong> User credentials hashed with bcrypt, stored in SQLAlchemy; <code>game_init.py</code> manages DB initialization and test data creation</li>
<li><strong>Impact:</strong> Guest mode protects privacy; no data stored without authentication</li>
</ul>
</div>

<div class="team-card">
<h4>Samarth — AP CSP Alignment</h4>
<div class="role">Lesson System</div>
<ul>
<li><strong>Sequencing:</strong> Lessons 1-5 must complete; all 5 trigger <code>half2</code> unlock; section progression enforces <code>half1</code> → <code>half2</code> → <code>boss</code></li>
<li><strong>Selection:</strong> <code>if lesson_number not in record.completed_lessons</code> prevents duplicate completion; <code>if len(set(completed_lessons)) >= 5</code> unlocks half2</li>
<li><strong>List:</strong> <code>completed_lessons[]</code> (MutableList/JSON column) and <code>unlocked_sections[]</code> tracked server-side</li>
<li><strong>Procedure:</strong> <code>complete_lesson()</code> validates lesson range (1–5), appends to list, awards bullets, checks unlock condition</li>
<li><strong>Data Storage:</strong> Lesson progress persists via <code>POST /api/snakes/complete-lesson</code>; auto-creates record via <code>GET /api/snakes/progress</code></li>
</ul>
</div>

<div class="team-card">
<h4>Arnav — AP CSP Alignment</h4>
<div class="role">Boss Battle & PvP</div>
<ul>
<li><strong>Algorithm:</strong> Boss AI uses distance formula <code>Math.hypot(dx,dy)</code> for chase pattern; server-side safe spawn uses random sampling with grid fallback (<code>allocate_boss_spawn</code>)</li>
<li><strong>Iteration:</strong> <code>requestAnimationFrame</code> game loop at 60fps; bullet array updates; powerup spawn loop with <code>POWERUP_SPAWN_INTERVAL</code> rate limiting</li>
<li><strong>Selection:</strong> <code>if (pattern === 'zigzag')</code> changes movement; <code>if (collision)</code> damages; <code>if (bossHealth <= 0)</code> triggers victory stats aggregation</li>
<li><strong>List:</strong> <code>playerBullets[]</code>, <code>opponentBullets[]</code>, <code>powerups[]</code>, <code>all_player_stats[]</code> arrays; <code>powerups_collected[]</code> per player</li>
<li><strong>Procedure:</strong> <code>spawn_powerup_for_room(room_id)</code> creates random powerup, stores in room state, returns powerup dict</li>
</ul>
</div>

<div class="team-card">
<h4>Ethan — AP CSP Alignment</h4>
<div class="role">Question System</div>
<ul>
<li><strong>List:</strong> <code>QUESTIONS[]</code> array of 50 objects; <code>visited_squares[]</code> (MutableList/JSON) for tracking; <code>unvisited_squares</code> computed as set difference</li>
<li><strong>Iteration:</strong> <code>forEach</code> to render answer options; list comprehension <code>[sq for sq in all_squares if sq not in visited]</code> for unvisited calculation</li>
<li><strong>Selection:</strong> <code>if correct: record.total_bullets += bullets_earned</code>; <code>if square >= QUESTION_SECTION_MAX_SQUARE</code> unlocks boss</li>
<li><strong>Procedure:</strong> <code>answer_question()</code> validates square range, updates position, awards bullets, checks section unlock — uses parameter and return</li>
<li><strong>Algorithm:</strong> Server validates square bounds (<code>QUESTION_SECTION_MIN_SQUARE</code> to <code>QUESTION_SECTION_MAX_SQUARE</code>) before processing</li>
</ul>
</div>

<div class="team-card">
<h4>Aneesh — AP CSP Alignment</h4>
<div class="role">Game Board & Navigation & SlitherRush</div>
<ul>
<li><strong>Input:</strong> Click handlers for dice rolls, character selection buttons, navigation links; directional input + fire for SlitherRush</li>
<li><strong>Selection:</strong> <code>if (roll + currentSquare > 56)</code> redirects to mode selection; <code>if player.status != 'alive'</code> skips movement in tick</li>
<li><strong>Iteration:</strong> <code>for</code> loop renders 56 board squares; SlitherRush 30Hz tick iterates all arenas, all players, all bullets each frame</li>
<li><strong>Procedure:</strong> <code>_step_move_players(arena, now, dt)</code> with 3 parameters — updates direction, moves head, trims/extends segments, fires bullets</li>
<li><strong>Algorithm:</strong> SlitherRush bullet-hit detection: iterates bullets, computes squared distance to each player head, checks against <code>hit_radius_sq</code>, applies kill/death/score/length updates</li>
<li><strong>List:</strong> Character array for carousel; <code>arena['players']</code> dict; <code>arena['bullets']</code> list; <code>slither_segments[]</code> per snake</li>
</ul>
</div>

</div>

---

### Create Performance Task Alignment

The project structure maps directly to the CPT requirements:
- **Program Purpose:** Educate users on AP CSP concepts through gamified learning
- **Program Function:** Interactive game board with progression, questions, multiplayer boss battle, PvP arena, and SlitherRush snake arena
- **Input → Output:** User answers (input) → bullet rewards and progression (output); keyboard/mouse (input) → character movement and shooting (output); directional input (input) → snake steering and bullet firing in SlitherRush (output)
- **List Usage:** `visited_squares[]` stores/retrieves which questions have been answered; `completed_lessons[]` tracks lesson progress; `unlocked_sections[]` controls board access; `arena['bullets']` manages projectiles; `slither_segments[]` stores snake body positions
- **Procedure with Parameter:** `resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)` takes 5 parameters, calculates distance with `math.sqrt`, uses selection to check overlap, returns adjusted coordinates — used in both Boss Battle and PvP
- **Algorithm with Sequencing + Selection + Iteration:** SlitherRush `_step_bullets()` sequences through bullet movement (update position → check bounds → detect hits), iterates all bullets against all players, selects actions based on distance check (`if dist_sq <= hit_radius_sq`), and applies kill/death/score/length changes
