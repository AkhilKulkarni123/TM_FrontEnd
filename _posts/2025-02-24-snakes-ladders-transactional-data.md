---
layout: post
title: "Snakes & Ladders - Transactional Data & College Board Requirements"
description: A deep dive into how every user action in our game creates a database transaction, covering sequencing, selection, iteration, the leaderboard system, and how all of it maps to AP CSP College Board requirements.
permalink: /snakes-ladders-transactional-data
toc: true
comments: true
categories: ['Game Development', 'AP CSP']
---

<style>
.td-hero {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: 2px solid #667eea;
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
    text-align: center;
}
.td-hero h3 {
    color: #667eea;
    margin: 0 0 8px 0;
    font-size: 1.2em;
}
.td-hero p {
    color: rgba(255,255,255,0.8);
    margin: 0;
    font-size: 0.95em;
}
.flow-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 16px 0;
}
.flow-step {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 9px 14px;
    border-radius: 8px;
    font-size: 0.82em;
    font-weight: 600;
    text-align: center;
    min-width: 110px;
}
.flow-arrow {
    font-size: 1.3em;
    color: #667eea;
}
.crud-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin: 18px 0;
}
.crud-card {
    border-radius: 10px;
    padding: 16px;
    font-size: 0.88em;
}
.crud-create { background: rgba(67, 233, 123, 0.12); border-left: 4px solid #43e97b; }
.crud-read   { background: rgba(79, 172, 254, 0.12); border-left: 4px solid #4facfe; }
.crud-update { background: rgba(240, 147, 251, 0.12); border-left: 4px solid #f093fb; }
.crud-delete { background: rgba(245, 87, 108, 0.12); border-left: 4px solid #f5576c; }
.crud-card h4 { margin: 0 0 8px 0; font-size: 1em; }
.crud-create h4 { color: #43e97b; }
.crud-read   h4 { color: #4facfe; }
.crud-update h4 { color: #f093fb; }
.crud-delete h4 { color: #f5576c; }
.crud-card code { font-size: 0.8em; background: rgba(255,255,255,0.07); padding: 1px 5px; border-radius: 3px; }
.section-block {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 18px 20px;
    margin: 14px 0;
}
.section-block h4 { color: #667eea; margin: 0 0 8px 0; }
.concept-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 14px;
    margin: 18px 0;
}
.concept-card {
    background: rgba(255,255,255,0.04);
    border-left: 4px solid #667eea;
    border-radius: 0 10px 10px 0;
    padding: 14px 16px;
    font-size: 0.88em;
}
.concept-card h4 { margin: 0 0 6px 0; color: #4facfe; font-size: 0.95em; }
.concept-card p { margin: 0; line-height: 1.55; }
.concept-card code { background: rgba(255,255,255,0.07); padding: 1px 4px; border-radius: 3px; font-size: 0.85em; }
.lb-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 0.88em;
}
.lb-table th, .lb-table td {
    padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.12);
    text-align: left;
}
.lb-table th {
    background: rgba(102, 126, 234, 0.22);
    color: #667eea;
    font-weight: 700;
}
.lb-table tr:nth-child(even) { background: rgba(255,255,255,0.03); }
.badge {
    display: inline-block;
    padding: 2px 9px;
    border-radius: 10px;
    font-size: 0.75em;
    font-weight: 700;
    margin-right: 4px;
}
.badge-get    { background: rgba(67,233,123,0.25);  color: #43e97b; }
.badge-post   { background: rgba(240,147,251,0.25); color: #f093fb; }
.badge-put    { background: rgba(79,172,254,0.25);  color: #4facfe; }
.badge-delete { background: rgba(245,87,108,0.25);  color: #f5576c; }
.member-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 12px;
    padding: 18px;
    margin: 16px 0;
}
.member-card h3 { color: #4facfe; margin: 0 0 2px 0; }
.member-card .role { font-size: 0.8em; color: #f093fb; font-weight: 600; margin-bottom: 10px; }
.script-box {
    background: linear-gradient(135deg, #0f3460, #1a1a2e);
    border: 1px solid #667eea;
    border-radius: 10px;
    padding: 16px;
    margin: 10px 0;
    font-size: 0.9em;
    line-height: 1.6;
}
.script-box h4 { color: #667eea; margin: 0 0 8px 0; }
.time-badge {
    background: #e94560;
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.72em;
    font-weight: 700;
}
.model-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 0.85em;
}
.model-table th, .model-table td {
    padding: 9px 12px;
    border: 1px solid rgba(255,255,255,0.12);
    text-align: left;
}
.model-table th {
    background: rgba(79,172,254,0.18);
    color: #4facfe;
    font-weight: 700;
}
</style>

<div class="td-hero">
<h3>Every Action Is a Transaction</h3>
<p>From rolling the dice to defeating the boss, each player interaction triggers a structured database transaction — storing progress, updating state, and powering features like the leaderboard. This blog breaks down how it all works and how it maps to AP CSP College Board requirements.</p>
</div>

---

## What Is Transactional Data?

**Transactional data** is information created whenever a user performs an action in a system. Unlike static data (like a player's username), transactional data changes continuously — it is created, read, updated, and deleted (CRUD) as users interact with the application.

In our Snakes & Ladders game, every meaningful action the player takes — completing a lesson, answering a question, moving a square, collecting a powerup, or finishing the game — produces a transaction that is persisted to the SQLite database through Flask-SQLAlchemy.

---

## The Database Model: What We Store

The `SnakesGameData` table is the backbone of all transactional data in the game. Each row represents **one player's full game state**.

<table class="model-table">
<tr><th>Column</th><th>Type</th><th>Purpose</th><th>Updated By</th></tr>
<tr><td><code>current_square</code></td><td>Integer</td><td>Which board square the player is on</td><td>Answer question, update square</td></tr>
<tr><td><code>total_bullets</code></td><td>Integer</td><td>Accumulated ammo (from lessons + questions)</td><td>Complete lesson, correct answer</td></tr>
<tr><td><code>visited_squares</code></td><td>JSON List</td><td>All squares ever landed on — prevents re-answering</td><td>Answer question</td></tr>
<tr><td><code>completed_lessons</code></td><td>JSON List</td><td>Which of the 5 lessons have been finished</td><td>Complete lesson</td></tr>
<tr><td><code>unlocked_sections</code></td><td>JSON List</td><td>Which board sections are accessible: <code>half1</code>, <code>half2</code>, <code>boss</code></td><td>Lesson completion, reaching sq 56</td></tr>
<tr><td><code>lives</code></td><td>Integer</td><td>Remaining lives (starts at 5)</td><td>Boss battle, PvP, reset</td></tr>
<tr><td><code>game_status</code></td><td>String</td><td><code>'active'</code> or <code>'completed'</code></td><td>Complete game</td></tr>
<tr><td><code>completed_at</code></td><td>DateTime</td><td>Timestamp when the game was beaten</td><td>Complete game API</td></tr>
<tr><td><code>last_updated</code></td><td>DateTime</td><td>Timestamp of last state change — powers ActivePlayers</td><td>Auto on every update</td></tr>
<tr><td><code>time_played</code></td><td>Float</td><td>Total seconds spent in-game</td><td>Autosave every 10 seconds</td></tr>
<tr><td><code>boss_battle_attempts</code></td><td>Integer</td><td>How many times a player has tried the boss</td><td>Boss battle entry</td></tr>
<tr><td><code>selected_character</code></td><td>String</td><td>Knight / Wizard / Archer / Warrior</td><td>Character selection screen</td></tr>
</table>

---

## CRUD: The Four Operations

Every transactional data system is built on four operations. Here is exactly where each one appears in our game:

<div class="crud-grid">

<div class="crud-card crud-create">
<h4>CREATE — POST</h4>
A new record is inserted when a player first registers and starts the game. The <code>SnakesGameAPI.post()</code> method creates the row with default values: square 1, 0 bullets, 5 lives, only <code>half1</code> unlocked.
<br><br>
<code>POST /api/snakes/</code> → <code>game_data.create()</code> → <code>db.session.add()</code>
</div>

<div class="crud-card crud-read">
<h4>READ — GET</h4>
Progress is fetched every time a page loads, or every 10 seconds during autosave. The <code>game_data.read()</code> method serializes the full database row into a JSON dictionary. The leaderboard, champions list, and active players list are all read operations.
<br><br>
<code>GET /api/snakes/</code> · <code>GET /api/snakes/leaderboard</code> · <code>GET /api/snakes/champions</code>
</div>

<div class="crud-card crud-update">
<h4>UPDATE — PUT / POST</h4>
The most frequent operation. Every lesson completion, correct answer, position change, and autosave writes back to the database. The <code>game_data.update(data)</code> method accepts a dictionary and selectively patches only the fields that changed.
<br><br>
<code>PUT /api/snakes/update-game</code> · <code>POST /api/snakes/complete-lesson</code> · <code>POST /api/snakes/answer-question</code>
</div>

<div class="crud-card crud-delete">
<h4>DELETE — DELETE</h4>
A full delete wipes the player's row entirely (admin/testing use). The <code>ResetProgressAPI</code> performs a soft reset — it <em>updates</em> all fields back to defaults rather than deleting the row, preserving champion status in the Hall of Champions.
<br><br>
<code>DELETE /api/snakes/</code> · <code>POST /api/snakes/reset</code>
</div>

</div>

---

## Sequencing: Ordered Execution

**Sequencing** means instructions run in a specific, required order. Our game enforces sequencing at multiple levels.

<div class="section-block">
<h4>Game Progression Sequence</h4>

The entire game is a sequenced pipeline. You cannot skip steps:

<div class="flow-row">
  <div class="flow-step">Login / Guest</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Character Select</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">5 Lessons</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">50 Questions</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Mode Selection</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Boss / PvP / SlitherRush</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Victory Page</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Hall of Champions</div>
</div>

This sequence is enforced by the `unlocked_sections` array. Each page checks which sections are unlocked before rendering — if you have not completed all 5 lessons, `half2` is not in your `unlocked_sections` and you cannot access the question gauntlet.
</div>

<div class="section-block">
<h4>API Transaction Sequence</h4>

Every backend operation executes in strict order:

<div class="flow-row">
  <div class="flow-step">Receive Request</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Validate JWT Token</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Query Database</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Apply Logic / Validation</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Commit to DB</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Return JSON Response</div>
</div>

If the JWT is invalid, execution stops at step 2 (returns 401). If no game record exists, it stops at step 3 (returns 404). The database is only written to after all validations pass.
</div>

<div class="section-block">
<h4>Autosave Sequence (Every 10 Seconds)</h4>

<div class="flow-row">
  <div class="flow-step">setInterval fires</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Collect current state</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">PUT /api/snakes/update-game</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Server updates last_updated</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">ActivePlayers API reflects change</div>
</div>

The `last_updated` timestamp is set automatically on every commit via `onupdate=datetime.utcnow`. This powers the `ActivePlayersAPI`, which queries all rows updated within the last 10 seconds to show who is currently playing.
</div>

---

## Selection: Conditional Branching

**Selection** is when the program chooses a different path based on a condition. Our game uses selection to gate actions, award resources, and control game state.

<div class="concept-grid">

<div class="concept-card">
<h4>Lesson Completion — Preventing Duplicates</h4>
<p>Before awarding bullets, the server checks: <code>if lesson_number not in record.completed_lessons</code>. If the lesson is already in the list, no bullets are added and no duplicate entry is made. This prevents farming the same lesson repeatedly.</p>
</div>

<div class="concept-card">
<h4>Section Unlocking — Progression Gate</h4>
<p>After appending a lesson: <code>if len(set(record.completed_lessons)) >= 5 and 'half2' not in record.unlocked_sections</code> — only when all 5 unique lessons are done does the game unlock the question gauntlet. A nested second check unlocks the boss section when square 56 is reached.</p>
</div>

<div class="concept-card">
<h4>Question Answers — Bullet Awards</h4>
<p>Correct answers branch to <code>if correct: record.total_bullets += bullets_earned</code>. Wrong answers skip this block entirely. The server also validates the square range: <code>if square >= QUESTION_SECTION_MAX_SQUARE</code>, the boss section is unlocked.</p>
</div>

<div class="concept-card">
<h4>Game Completion — Status Change</h4>
<p>When the game is beaten, <code>game_status</code> changes from <code>'active'</code> to <code>'completed'</code> and <code>completed_at</code> is set. The <code>ResetProgressAPI</code> uses <code>was_champion = game_data.game_status == 'completed'</code> to decide whether to preserve the champion timestamp.</p>
</div>

<div class="concept-card">
<h4>JWT Authentication — Access Control</h4>
<p>Every protected endpoint starts with: <code>if not token: return {"message": "Token missing"}, 401</code>. If the token is expired, a 403 is returned. Only valid tokens reach the database layer. Guest mode checks <code>if isDemoMode()</code> and uses sessionStorage instead of API calls.</p>
</div>

<div class="concept-card">
<h4>Boss Battle — Collision & Health</h4>
<p>Server-side: <code>if dist >= min_dist: return desired_x, desired_y, False</code> — if players are far enough apart, no correction is needed. If <code>boss_health <= 0</code>, the defeat event fires. Per player: <code>if lives <= 0</code> triggers elimination.</p>
</div>

</div>

---

## Iteration: Repeating Operations

**Iteration** means executing the same block of code repeatedly — either a fixed number of times or until a condition is met. Our game uses iteration at every layer, from rendering the board to running the 30 Hz game simulation.

<div class="concept-grid">

<div class="concept-card">
<h4>Autosave Loop — Frontend</h4>
<p><code>setInterval(saveProgress, 10000)</code> fires every 10 seconds for the entire session. Each call sends a <code>PUT</code> to update the database with the current square, bullets, lives, and time played. This loop is the heartbeat of progress persistence.</p>
</div>

<div class="concept-card">
<h4>Board Rendering — 56 Squares</h4>
<p>A <code>for</code> loop iterates from square 1 to 56, rendering each board cell with dynamic CSS classes based on whether it appears in <code>visited_squares</code>. The loop also determines which squares are highlighted for the current player position.</p>
</div>

<div class="concept-card">
<h4>Unvisited Squares — List Comprehension</h4>
<p>The backend computes remaining questions with: <code>unvisited = [sq for sq in range(1, 101) if sq not in visited]</code>. This iterates all 100 squares, filtering those not yet in <code>visited_squares</code>, and returns the count for the progress tracker.</p>
</div>

<div class="concept-card">
<h4>Bullet Physics — Per-Frame Update</h4>
<p>In both the boss arena and SlitherRush, every frame iterates through the bullets array. Each bullet's position is updated, out-of-bounds bullets are removed, and remaining bullets are checked for collisions. The canvas <code>requestAnimationFrame</code> loop drives this at 60 fps on the client.</p>
</div>

<div class="concept-card">
<h4>Leaderboard Query — Sorted Iteration</h4>
<p><code>SnakesGameData.query.order_by(total_bullets.desc()).limit(10).all()</code> iterates the database sorted by bullet count descending, returning the top 10. The frontend then iterates the returned list to render each leaderboard row with rank, username, and score.</p>
</div>

<div class="concept-card">
<h4>SlitherRush — 30 Hz Tick Loop</h4>
<p>The server runs a background thread looping at <code>TICK_RATE = 30</code> Hz. Each tick: iterate all arenas → iterate all players → move positions → iterate all bullets → check collisions → emit state snapshots every other tick (15 fps). This loop processes up to 32 players simultaneously per arena.</p>
</div>

</div>

---

## The Leaderboard: Transactional Data in Action

The leaderboard system is the clearest demonstration of transactional data flowing end-to-end. There are actually **three distinct leaderboard-style endpoints**, each serving a different purpose.

### 1. Bullets Leaderboard — `GET /api/snakes/leaderboard`

Ranks all players by `total_bullets` accumulated across lessons and questions. This is a **read-only transaction** — it queries the database but writes nothing.

```python
# model/snakes_game.py
@staticmethod
def get_leaderboard(limit=10):
    return SnakesGameData.query.order_by(
        SnakesGameData.total_bullets.desc()
    ).limit(limit).all()
```

**Data flow:**
<div class="flow-row">
  <div class="flow-step">GET /api/snakes/leaderboard?limit=10</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Query DB sorted by total_bullets</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Serialize each row via .read()</div>
  <span class="flow-arrow">→</span>
  <div class="flow-step">Return JSON {leaderboard: [...], count: N}</div>
</div>

Every time a player answers a question correctly or completes a lesson, their `total_bullets` updates — and the next leaderboard fetch reflects that change immediately.

---

### 2. Hall of Champions — `GET /api/snakes/champions`

Records every player who has beaten the game, ordered by earliest completion time. Whereas the bullets leaderboard shows *who studied hardest*, champions shows *who finished first*.

```python
# api/snakes_game.py — ChampionsAPI
champions = SnakesGameData.query.filter_by(
    game_status='completed'
).order_by(SnakesGameData.completed_at.asc()).all()
```

The **write side** of this transaction happens in `CompleteGameAPI.post()`:

```python
game_data.game_status = 'completed'
game_data.completed_at = datetime.utcnow()
db.session.commit()
```

This is a two-part transaction: a `POST /api/snakes/complete` **writes** the completion, and a `GET /api/snakes/champions` **reads** it for the leaderboard display on the Victory page. The Hall of Champions on `victory.html` shows all champion rows sorted by `completed_at`, with username, character, bullets earned, and time played.

---

### 3. Active Players — `GET /api/snakes/active-players`

Shows who is playing *right now*. This is transactional because it depends on the `last_updated` timestamp, which is automatically refreshed by every database write.

```python
# api/snakes_game.py — ActivePlayersAPI
active_threshold = datetime.utcnow() - timedelta(seconds=10)
active_players = SnakesGameData.query.filter(
    SnakesGameData.last_updated >= active_threshold
).order_by(SnakesGameData.last_updated.desc()).all()
```

If a player has not triggered any database update in 10 seconds, they drop off the active list. Every autosave, question answer, and lesson completion keeps the player visible as "active."

---

### Full Leaderboard Transaction Chain

<table class="lb-table">
<tr>
  <th>Action</th>
  <th>Endpoint</th>
  <th>DB Column Changed</th>
  <th>Leaderboard Effect</th>
</tr>
<tr>
  <td>Complete a lesson</td>
  <td><span class="badge badge-post">POST</span><code>/complete-lesson</code></td>
  <td><code>total_bullets</code>, <code>completed_lessons</code></td>
  <td>Bullets leaderboard rank may change</td>
</tr>
<tr>
  <td>Answer question correctly</td>
  <td><span class="badge badge-post">POST</span><code>/answer-question</code></td>
  <td><code>total_bullets</code>, <code>visited_squares</code>, <code>current_square</code></td>
  <td>Bullets leaderboard rank may change</td>
</tr>
<tr>
  <td>Autosave fires (10s)</td>
  <td><span class="badge badge-put">PUT</span><code>/update-game</code></td>
  <td><code>last_updated</code>, <code>time_played</code></td>
  <td>Player stays on active players list</td>
</tr>
<tr>
  <td>Defeat boss / finish game</td>
  <td><span class="badge badge-post">POST</span><code>/complete</code></td>
  <td><code>game_status</code>, <code>completed_at</code></td>
  <td>Player appears in Hall of Champions</td>
</tr>
<tr>
  <td>Reset progress</td>
  <td><span class="badge badge-post">POST</span><code>/reset</code></td>
  <td>All fields reset to defaults</td>
  <td>Drops from active + bullets leaderboard; champions preserved</td>
</tr>
<tr>
  <td>View leaderboard</td>
  <td><span class="badge badge-get">GET</span><code>/leaderboard</code></td>
  <td>None (read only)</td>
  <td>Returns current top-N by bullets</td>
</tr>
</table>

---

## All Game Features & Their Transactions

<div class="section-block">
<h4>Lessons (Samarth)</h4>
Five interactive lessons (programming basics, data structures, networking, cybersecurity, data ethics) each produce a POST transaction on completion. The server appends the lesson number to <code>completed_lessons[]</code>, awards bullets, and unlocks <code>half2</code> when all 5 are done. Selection prevents duplicate completions; sequencing enforces that lessons must be done before questions unlock.
</div>

<div class="section-block">
<h4>Question Gauntlet (Ethan)</h4>
50 multiple-choice questions across 5 CS topics. Each landing on a square fires a POST. The server validates the square is in range (7–56), records the square in <code>visited_squares[]</code>, and conditionally awards bullets if correct. At square 56, the boss section is unlocked. The <code>GetUnvisitedSquaresAPI</code> reads the list to show remaining progress.
</div>

<div class="section-block">
<h4>Game Board & Dice (Aneesh)</h4>
Every dice roll updates the player's <code>current_square</code> via <code>POST /api/snakes/update-square</code>. The board renders by iterating all 56 squares in a loop, styling each based on whether it appears in <code>visited_squares</code>. The Mode Selection page reads real-time player counts via Socket.IO status events before showing battle options.
</div>

<div class="section-block">
<h4>Boss Battle & PvP (Arnav)</h4>
When a boss room is created, a BossRoom record is inserted. Player position data flows through WebSocket events — not persisted to SQL per-frame, but synced in-memory in the <code>boss_battles</code> dictionary. On boss defeat, all players' battle stats (damage dealt, bullets used, powerups collected) are aggregated and sent to the victory screen. Lives are decremented each time a player is hit; the <code>lives</code> column is updated at the end of each battle.
</div>

<div class="section-block">
<h4>Real-time Multiplayer — WebSocket (Akhil)</h4>
Multiplayer state (positions, bullets, collisions) is managed in server memory for low latency — transactional writes happen only at key moments (battle end, game completion, champion recording). The <code>resolve_player_collision()</code> function runs on every movement event, using sequencing (calculate distance → check overlap → apply push) and selection (only push if overlap detected). Player stats are aggregated into a final transaction on boss defeat.
</div>

<div class="section-block">
<h4>Authentication & DevOps (Moiz)</h4>
The JWT authentication layer is the gateway to all transactional data. Every API write requires a valid token. The <code>@token_required()</code> decorator performs a two-step selection: (1) check token exists, (2) check token is valid. Only then is the database accessible. Deployment on Docker + Nginx ensures the transaction pipeline is always live at <code>snakes.opencodingsociety.com</code>.
</div>

<div class="section-block">
<h4>Victory Page & Hall of Champions (Akhil)</h4>
The victory page triggers two transactions: <code>POST /api/snakes/complete</code> sets <code>game_status='completed'</code> and timestamps <code>completed_at</code>. Then <code>GET /api/snakes/champions</code> reads all completed rows sorted by time to render the Hall of Champions leaderboard. The reset button fires <code>POST /api/snakes/reset</code>, a comprehensive UPDATE that restores defaults while preserving the champion timestamp.
</div>

<div class="section-block">
<h4>SlitherRush (Aneesh)</h4>
A 32-player snake arena running at 30 Hz server-side. The <code>SlitherRushManager</code> maintains arena state in memory (snake segments, bullet positions, scores). The tick loop iterates all arenas, all players, and all bullets each frame — applying movement, collision detection (squared-distance comparison against <code>hit_radius_sq</code>), and kill/death/score logic. The in-arena leaderboard is broadcast every 450 ms, ranking players by score, kills, and snake length.
</div>

---

## College Board AP CSP Requirements

<div class="concept-grid">

<div class="concept-card">
<h4>Sequencing</h4>
<p>Every API transaction executes in order: validate token → query record → apply logic → commit → respond. The game itself enforces a mandatory sequence: lessons → questions → battle → victory. The autosave flow sequences: collect state → serialize → PUT request → server commit → timestamp update.</p>
</div>

<div class="concept-card">
<h4>Selection</h4>
<p><code>if lesson_number not in completed_lessons</code> prevents duplicate credit. <code>if correct: award bullets</code> gates rewards. <code>if square >= 56: unlock boss</code> opens progression. <code>if game_status == 'completed': preserve champion_at</code> on reset. Every data write is wrapped in conditional logic that validates before persisting.</p>
</div>

<div class="concept-card">
<h4>Iteration</h4>
<p>The autosave <code>setInterval</code> loops every 10 seconds. Board rendering iterates 56 squares. The leaderboard query iterates sorted rows. SlitherRush's 30 Hz tick iterates all arenas, players, and bullets each cycle. The list comprehension for unvisited squares iterates 100 squares to find the remainder. Bullet collision checks iterate the bullets array every frame.</p>
</div>

<div class="concept-card">
<h4>Lists / Collections</h4>
<p><code>visited_squares[]</code>, <code>completed_lessons[]</code>, <code>unlocked_sections[]</code> are <code>MutableList/JSON</code> columns — they persist as JSON arrays in the database and are modified in-place. On the frontend: <code>QUESTIONS[]</code> (50 question objects), <code>arena['bullets']</code>, <code>slither_segments[]</code>, <code>boss_battles[room_id]['players']</code>.</p>
</div>

<div class="concept-card">
<h4>Procedures / Functions</h4>
<p><code>resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)</code> — 5 parameters, returns adjusted coordinates. <code>get_leaderboard(limit)</code> — parameterized query. <code>complete_lesson()</code> — validates, appends, awards, unlocks. <code>answer_question()</code> — validates range, records visit, awards, unlocks. Each has defined parameters, a clear body, and a return value.</p>
</div>

<div class="concept-card">
<h4>Persistent Data Storage</h4>
<p>All game state lives in a SQLite/MySQL relational database via Flask-SQLAlchemy. Progress survives page refreshes, browser restarts, and multiple sessions — because it is server-side, not just in localStorage. Guest mode uses <code>sessionStorage</code> as a deliberate contrast: it disappears when the tab closes, demonstrating the value of authenticated persistent storage.</p>
</div>

<div class="concept-card">
<h4>The Internet (Big Idea 4)</h4>
<p>The game communicates over HTTPS using RESTful APIs (GET, POST, PUT, DELETE) and WebSocket connections (Socket.IO). JWT tokens authenticate both HTTP requests and WebSocket connections. REST handles persistent data transactions; WebSockets handle real-time multiplayer state. Nginx reverse-proxies port 443 to Flask on port 8306.</p>
</div>

<div class="concept-card">
<h4>Impact of Computing (Big Idea 5)</h4>
<p>Guest mode demonstrates data minimization — no PII is collected for unauthenticated users. The game teaches data ethics as one of its five lesson topics. The <code>ResetProgressAPI</code> gives users the right to delete their data. The leaderboard raises questions about competition, privacy, and what data we choose to display publicly.</p>
</div>

</div>

---

## Presentation Scripts

### Team Overview Script (1 minute) <span class="time-badge">ALL MEMBERS</span>

<div class="script-box">
<h4>Speaker: Any team member</h4>
<p><strong>[0:00–0:15]</strong> "Our Snakes and Ladders game isn't just a board game — it's a fully transactional system. Every action a player takes, from completing a lesson to defeating the boss, creates a database transaction that persists their progress."</p>
<p><strong>[0:15–0:30]</strong> "The core model is a single database table — SnakesGameData — that stores each player's square, bullets, lives, completed lessons, and game status. CRUD operations wire every feature to that table through authenticated REST APIs."</p>
<p><strong>[0:30–0:45]</strong> "Sequencing, selection, and iteration run through every layer. Lessons must be completed in order. Questions conditionally award bullets. Loops autosave progress every 10 seconds and drive a 30 Hz real-time simulation for SlitherRush."</p>
<p><strong>[0:45–1:00]</strong> "The leaderboard and Hall of Champions are the most visible result — a live read of that transactional data, updated every time someone answers a question or beats the game. Let's walk through how each of us built a piece of this system."</p>
</div>

---

<div class="member-card">
<h3>Akhil</h3>
<div class="role">Scrum Master / Multiplayer & Victory System Developer</div>

<div class="script-box">
<h4>Topic: Leaderboard, Champions API & Multiplayer Transactions <span class="time-badge">1 MIN</span></h4>
<p><strong>[0:00–0:15]</strong> "I built the Hall of Champions and the leaderboard. When you beat the game, a POST to <code>/api/snakes/complete</code> sets your <code>game_status</code> to 'completed' and records a <code>completed_at</code> timestamp. That's the transaction that puts you on the board."</p>
<p><strong>[0:15–0:30]</strong> "The ChampionsAPI reads all completed rows ordered by <code>completed_at</code> ascending — so the earliest finisher sits at the top. The LeaderboardAPI sorts by <code>total_bullets</code> descending. Two different reads of the same table, two different rankings."</p>
<p><strong>[0:30–0:45]</strong> "For the boss battle, player positions are synced through WebSockets every 50 ms — that's iteration. Collision resolution uses selection: if the distance between two players is less than the minimum, push them apart. Only the final battle result writes to the database."</p>
<p><strong>[0:45–1:00]</strong> "The Active Players API is my favorite transactional trick: it filters rows where <code>last_updated</code> is within the last 10 seconds. Every autosave keeps a player 'alive' on that list — stop playing and you disappear in 10 seconds."</p>
</div>
</div>

---

<div class="member-card">
<h3>Moiz</h3>
<div class="role">DevOps / Authentication Lead</div>

<div class="script-box">
<h4>Topic: JWT Authentication & Securing Transactions <span class="time-badge">1 MIN</span></h4>
<p><strong>[0:00–0:15]</strong> "Every single database transaction in this game goes through my authentication layer. When you log in, the server signs a JWT token and stores it in an HttpOnly cookie — secure from JavaScript injection."</p>
<p><strong>[0:15–0:30]</strong> "The <code>@token_required()</code> decorator wraps every write endpoint. It sequences three steps: extract the token from the cookie, decode it with the secret key, load the matching User from the database. If any step fails, a 401 or 403 is returned before touching game data."</p>
<p><strong>[0:30–0:45]</strong> "This selection chain — <code>if not token → 401</code>, <code>if expired → 403</code>, <code>else → proceed</code> — ensures that no transaction can corrupt another player's data. Your JWT ties every API call to exactly your <code>SnakesGameData</code> row."</p>
<p><strong>[0:45–1:00]</strong> "Guest mode is the contrast: <code>isDemoMode()</code> returns true, all API calls are skipped, and progress lives only in <code>sessionStorage</code>. No server transactions, no persistence — illustrating exactly why authenticated storage matters."</p>
</div>
</div>

---

<div class="member-card">
<h3>Samarth</h3>
<div class="role">Lesson System Developer</div>

<div class="script-box">
<h4>Topic: Lesson Completion Transactions & Sequencing <span class="time-badge">1 MIN</span></h4>
<p><strong>[0:00–0:15]</strong> "I built the lesson system, which is the first stage of the transactional pipeline. When you finish a lesson, a POST to <code>/complete-lesson</code> fires. The server appends the lesson number to <code>completed_lessons[]</code> and adds bullets to your total."</p>
<p><strong>[0:15–0:30]</strong> "There's selection preventing abuse: <code>if lesson_number not in record.completed_lessons</code> — if you've already done that lesson, no bullets are awarded. The check runs before the write, keeping the data clean."</p>
<p><strong>[0:30–0:45]</strong> "The unlock logic sequences automatically: after the fifth unique lesson, the server checks <code>if len(set(completed_lessons)) >= 5</code> and appends 'half2' to <code>unlocked_sections</code>. That single array field controls what the entire frontend renders."</p>
<p><strong>[0:45–1:00]</strong> "The <code>GET /api/snakes/progress</code> endpoint auto-creates a record if none exists — so new players always have a row. This is a create-or-read transaction: query first, insert if missing. Progress always persists."</p>
</div>
</div>

---

<div class="member-card">
<h3>Arnav</h3>
<div class="role">Boss Battle & PvP Developer</div>

<div class="script-box">
<h4>Topic: Combat Transactions & Battle Stats <span class="time-badge">1 MIN</span></h4>
<p><strong>[0:00–0:15]</strong> "My systems — boss battle and PvP — generate a lot of in-flight data, but I designed them to only write to the database at meaningful moments. Position updates are WebSocket events, not SQL writes. That's intentional."</p>
<p><strong>[0:15–0:30]</strong> "During battle, player stats — damage dealt, bullets used, lives remaining, powerups collected — are tracked in the server's <code>boss_battles</code> dictionary. That's iteration: every hit updates a counter in memory. When the boss dies, all stats are aggregated into one payload."</p>
<p><strong>[0:30–0:45]</strong> "The powerup system uses selection extensively: <code>if type === 'damage'</code>, double bullet power. <code>If 'heal'</code> and lives < max, restore a life; otherwise add ammo. Four branches, one function — <code>applyPowerup(type)</code>."</p>
<p><strong>[0:45–1:00]</strong> "After PvP, the winner's <code>total_bullets</code> is updated and the loser's <code>lives</code> column reflects their losses. The database records the final state — not every frame, just the result. Efficient and clean transactional design."</p>
</div>
</div>

---

<div class="member-card">
<h3>Ethan</h3>
<div class="role">Question System Developer</div>

<div class="script-box">
<h4>Topic: Question Bank Transactions & visited_squares <span class="time-badge">1 MIN</span></h4>
<p><strong>[0:00–0:15]</strong> "The question system is where most of the bullet-earning transactions happen. Every time you land on a square, the frontend looks up your square number in the <code>QUESTIONS[]</code> array — iteration — to find the matching question object."</p>
<p><strong>[0:15–0:30]</strong> "When you answer, a POST to <code>/answer-question</code> sends the square number, whether you got it right, and the bullet reward. The server first validates the square is in the legal range — selection. Then it appends the square to <code>visited_squares[]</code> regardless of correctness."</p>
<p><strong>[0:30–0:45]</strong> "The list is critical: before showing a question, the frontend checks <code>if square in visitedSquares</code>. If true, no modal appears — you can't farm the same question. This selection protects the integrity of the transactional data."</p>
<p><strong>[0:45–1:00]</strong> "The <code>GetUnvisitedSquaresAPI</code> computes remaining questions: <code>[sq for sq in range(1, 101) if sq not in visited]</code>. That list comprehension is iteration and selection combined — showing players how many questions remain in one clean read transaction."</p>
</div>
</div>

---

<div class="member-card">
<h3>Aneesh</h3>
<div class="role">Game Board Lead & SlitherRush Developer</div>

<div class="script-box">
<h4>Topic: Board State Transactions & SlitherRush Simulation <span class="time-badge">1 MIN</span></h4>
<p><strong>[0:00–0:15]</strong> "Every dice roll I built creates a transaction: POST to <code>/update-square</code> records the new square and appends it to <code>visited_squares</code>. The board re-renders by iterating all 56 squares in a loop, applying CSS classes based on that list."</p>
<p><strong>[0:15–0:30]</strong> "Character selection is a small but clean CREATE: when you pick Knight, Wizard, Archer, or Warrior, that choice is written to <code>selected_character</code> and persisted. When you load back in, it's restored — that's the read side of the same transaction."</p>
<p><strong>[0:30–0:45]</strong> "SlitherRush is the most iteration-heavy feature. A background thread loops at 30 Hz. Each tick iterates all arenas, all players, and all bullets. Selection decides if a bullet hit: <code>if dist_sq <= hit_radius_sq</code>, apply kill. Otherwise keep the bullet alive."</p>
<p><strong>[0:45–1:00]</strong> "The SlitherRush leaderboard broadcasts every 450 ms — that's a read transaction on the in-memory arena state, sorted by score, kills, and snake length. Real-time, live, iterated on a timer. It shows transactional data doesn't always mean a database — sometimes it's memory, updated by a loop."</p>
</div>
</div>

---

## Summary: How It All Connects

Every feature in Snakes & Ladders contributes to the same underlying transactional model. Lessons and questions generate the **write** transactions that fill `total_bullets`. The leaderboard and champions page are the **read** transactions that surface that data publicly. Sequencing ensures the pipeline runs in the right order. Selection guards every write with conditions. Iteration drives both the user-facing game loop and the server's real-time simulation.

The result is a system where **playing the game and generating data are the same thing** — and the College Board requirements are not checked boxes, but natural consequences of building software that works.

| CB Requirement | Where It Lives |
|---|---|
| **Sequencing** | Game progression gates, API transaction chain, autosave flow |
| **Selection** | Duplicate prevention, bullet awards, section unlocking, JWT auth |
| **Iteration** | Autosave timer, board rendering, leaderboard query, 30 Hz tick loop |
| **Lists** | `visited_squares[]`, `completed_lessons[]`, `unlocked_sections[]`, `QUESTIONS[]` |
| **Procedures** | `resolve_player_collision()`, `get_leaderboard()`, `complete_lesson()`, `answer_question()` |
| **Persistent Storage** | `SnakesGameData` table, SQLite/MySQL via SQLAlchemy, JWT-protected CRUD |
| **The Internet** | REST APIs (HTTPS), WebSockets (Socket.IO), JWT in HttpOnly cookies |
| **Impact** | Guest mode data minimization, data ethics lesson content, user-controlled reset |
