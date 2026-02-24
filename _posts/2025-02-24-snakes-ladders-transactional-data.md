---
layout: post
title: "Snakes & Ladders - Transactional Data & College Board Requirements"
description: A look at how every player action in our game creates a database transaction, covering sequencing, selection, iteration, the leaderboard system, and how it all maps to AP CSP requirements.
permalink: /snakes-transactional
toc: true
comments: true
categories: ['Game Development', 'AP CSP']
---

Every time a player does something in our Snakes & Ladders game — rolling the dice, finishing a lesson, or defeating the boss — the game saves that action to a database. This post explains how that works and how it connects to AP CSP requirements.

---

## What Is Transactional Data?

**Transactional data** is information that gets created whenever a user does something in an app. Unlike fixed data (like a username), transactional data changes constantly — it gets created, read, updated, and deleted (CRUD) as players interact with the game.

In our game, every meaningful action a player takes creates a transaction that gets saved to a SQLite database through Flask-SQLAlchemy.

---

## The Database Model: What We Store

The `SnakesGameData` table stores all transactional data. Each row holds **one player's full game state**.

| Column | Type | Purpose | Updated By |
|---|---|---|---|
| `current_square` | Integer | Which board square the player is on | Answer question, update square |
| `total_bullets` | Integer | Total ammo earned from lessons and questions | Complete lesson, correct answer |
| `visited_squares` | JSON List | All squares ever landed on — stops repeat questions | Answer question |
| `completed_lessons` | JSON List | Which of the 5 lessons are done | Complete lesson |
| `unlocked_sections` | JSON List | Which board sections are open: `half1`, `half2`, `boss` | Lesson completion, reaching sq 56 |
| `lives` | Integer | Lives remaining (starts at 5) | Boss battle, PvP, reset |
| `game_status` | String | `'active'` or `'completed'` | Complete game |
| `completed_at` | DateTime | When the game was beaten | Complete game API |
| `last_updated` | DateTime | Time of last change — powers Active Players | Auto on every update |
| `time_played` | Float | Total seconds spent playing | Autosave every 10 seconds |
| `boss_battle_attempts` | Integer | How many times a player has tried the boss | Boss battle entry |
| `selected_character` | String | Knight / Wizard / Archer / Warrior | Character selection screen |

---

## CRUD: The Four Operations

Every transactional system is built on four basic operations. Here is where each one appears in our game:

**CREATE — POST**
A new row is added when a player registers and starts the game. The `SnakesGameAPI.post()` method creates the row with default values: square 1, 0 bullets, 5 lives, only `half1` unlocked.
`POST /api/snakes/` → `game_data.create()` → `db.session.add()`

**READ — GET**
Progress is fetched every time a page loads, or every 10 seconds during autosave. The `game_data.read()` method turns the database row into a JSON dictionary. The leaderboard, champions list, and active players list are all read operations.
`GET /api/snakes/` · `GET /api/snakes/leaderboard` · `GET /api/snakes/champions`

**UPDATE — PUT / POST**
The most common operation. Every lesson completion, correct answer, position change, and autosave writes back to the database. The `game_data.update(data)` method only changes the fields that need updating.
`PUT /api/snakes/update-game` · `POST /api/snakes/complete-lesson` · `POST /api/snakes/answer-question`

**DELETE — DELETE**
A full delete removes the player's row entirely (used for admin/testing). The `ResetProgressAPI` does a soft reset — it sets all fields back to their default values instead of deleting the row, so champion status is preserved.
`DELETE /api/snakes/` · `POST /api/snakes/reset`

---

## Sequencing: Steps in Order

**Sequencing** means instructions run in a specific, required order. Our game enforces this at multiple levels.

**Game Progression**
The whole game is a sequence you can't skip:

```
Login / Guest → Character Select → 5 Lessons → 50 Questions → Mode Selection → Boss / PvP / SlitherRush → Victory Page → Hall of Champions
```

This is enforced by the `unlocked_sections` array. Each page checks which sections are unlocked before loading — if you haven't finished all 5 lessons, `half2` isn't in your `unlocked_sections` and you can't access the question section.

**API Transaction Order**
Every backend operation runs in strict order:

```
Receive Request → Validate JWT Token → Query Database → Apply Logic → Commit to DB → Return JSON Response
```

If the JWT is invalid, execution stops at step 2 (returns 401). If no game record exists, it stops at step 3 (returns 404). The database is only written to after all checks pass.

**Autosave (Every 10 Seconds)**

```
setInterval fires → Collect current state → PUT /api/snakes/update-game → Server updates last_updated → ActivePlayers API reflects change
```

The `last_updated` timestamp is set automatically on every save via `onupdate=datetime.utcnow`. This powers the `ActivePlayersAPI`, which shows anyone whose record was updated in the last 10 seconds.

---

## Selection: Choosing a Path

**Selection** is when the program takes a different action based on a condition. Our game uses selection to control what players can do and what they earn.

**Lesson Completion — Preventing Duplicates**
Before awarding bullets, the server checks: `if lesson_number not in record.completed_lessons`. If the lesson is already done, no bullets are added.

**Section Unlocking — Progression Gate**
After adding a lesson: `if len(set(record.completed_lessons)) >= 5 and 'half2' not in record.unlocked_sections` — only when all 5 unique lessons are done does the question section unlock. A second check unlocks the boss section when square 56 is reached.

**Question Answers — Bullet Awards**
Correct answers go to `if correct: record.total_bullets += bullets_earned`. Wrong answers skip this entirely. The server also checks the square range: `if square >= QUESTION_SECTION_MAX_SQUARE`, the boss section is unlocked.

**Game Completion — Status Change**
When the game is beaten, `game_status` changes from `'active'` to `'completed'` and `completed_at` is recorded. The `ResetProgressAPI` checks `was_champion = game_data.game_status == 'completed'` to decide whether to keep the champion timestamp.

**JWT Authentication — Access Control**
Every protected endpoint starts with: `if not token: return {"message": "Token missing"}, 401`. If the token is expired, a 403 is returned. Only valid tokens reach the database.

**Boss Battle — Collision & Health**
Server-side: `if dist >= min_dist: return desired_x, desired_y, False` — if players are far enough apart, no correction is needed. If `boss_health <= 0`, the defeat event fires. Per player: `if lives <= 0` triggers elimination.

---

## Iteration: Repeating Operations

**Iteration** means running the same block of code repeatedly — either a set number of times or until a condition is met. Our game uses iteration throughout, from drawing the board to running the 30 Hz game simulation.

**Autosave Loop — Frontend**
`setInterval(saveProgress, 10000)` fires every 10 seconds for the whole session. Each call sends a `PUT` to update the database with the current square, bullets, lives, and time played.

**Board Rendering — 56 Squares**
A `for` loop goes from square 1 to 56, drawing each cell with CSS classes based on whether it appears in `visited_squares`.

**Unvisited Squares — List Comprehension**
The backend finds remaining questions with: `unvisited = [sq for sq in range(1, 101) if sq not in visited]`. This loops through all 100 squares and filters out the ones already visited.

**Bullet Physics — Per-Frame Update**
In both the boss arena and SlitherRush, every frame loops through the bullets array. Each bullet's position updates, out-of-bounds bullets are removed, and remaining bullets are checked for collisions. This runs at 60 fps on the client.

**Leaderboard Query — Sorted Iteration**
`SnakesGameData.query.order_by(total_bullets.desc()).limit(10).all()` reads the database sorted by bullet count, returning the top 10. The frontend then loops through the list to display each row.

**SlitherRush — 30 Hz Tick Loop**
The server runs a background thread looping at `TICK_RATE = 30` Hz. Each tick: loop all arenas → loop all players → move positions → loop all bullets → check collisions → send state snapshots every other tick (15 fps). This handles up to 32 players per arena at once.

---

## The Leaderboard: Transactional Data in Action

The leaderboard is the clearest example of transactional data flowing end-to-end. There are three different leaderboard-style endpoints, each serving a different purpose.

### 1. Bullets Leaderboard — `GET /api/snakes/leaderboard`

Ranks all players by `total_bullets` earned across lessons and questions. This is a **read-only transaction** — it reads the database but writes nothing.

```python
# model/snakes_game.py
@staticmethod
def get_leaderboard(limit=10):
    return SnakesGameData.query.order_by(
        SnakesGameData.total_bullets.desc()
    ).limit(limit).all()
```

**Data flow:**
```
GET /api/snakes/leaderboard?limit=10 → Query DB sorted by total_bullets → Serialize each row → Return JSON {leaderboard: [...], count: N}
```

Every time a player answers correctly or finishes a lesson, their `total_bullets` updates — and the next leaderboard fetch shows the change right away.

---

### 2. Hall of Champions — `GET /api/snakes/champions`

Records every player who has beaten the game, ordered by earliest completion time. The bullets leaderboard shows who studied most; the champions list shows who finished first.

```python
# api/snakes_game.py — ChampionsAPI
champions = SnakesGameData.query.filter_by(
    game_status='completed'
).order_by(SnakesGameData.completed_at.asc()).all()
```

The **write side** happens in `CompleteGameAPI.post()`:

```python
game_data.game_status = 'completed'
game_data.completed_at = datetime.utcnow()
db.session.commit()
```

This is a two-part transaction: `POST /api/snakes/complete` **writes** the completion, and `GET /api/snakes/champions` **reads** it for the Victory page. The Hall of Champions shows all champions sorted by `completed_at`, with username, character, bullets earned, and time played.

---

### 3. Active Players — `GET /api/snakes/active-players`

Shows who is playing right now. This works because the `last_updated` timestamp is automatically refreshed on every database write.

```python
# api/snakes_game.py — ActivePlayersAPI
active_threshold = datetime.utcnow() - timedelta(seconds=10)
active_players = SnakesGameData.query.filter(
    SnakesGameData.last_updated >= active_threshold
).order_by(SnakesGameData.last_updated.desc()).all()
```

If a player hasn't triggered any database update in 10 seconds, they drop off the active list. Every autosave, question answer, and lesson completion keeps the player visible.

---

### Full Leaderboard Transaction Chain

| Action | Endpoint | DB Column Changed | Leaderboard Effect |
|---|---|---|---|
| Complete a lesson | `POST /complete-lesson` | `total_bullets`, `completed_lessons` | Bullets leaderboard rank may change |
| Answer question correctly | `POST /answer-question` | `total_bullets`, `visited_squares`, `current_square` | Bullets leaderboard rank may change |
| Autosave fires (10s) | `PUT /update-game` | `last_updated`, `time_played` | Player stays on active players list |
| Defeat boss / finish game | `POST /complete` | `game_status`, `completed_at` | Player appears in Hall of Champions |
| Reset progress | `POST /reset` | All fields reset to defaults | Drops from active + bullets leaderboard; champions preserved |
| View leaderboard | `GET /leaderboard` | None (read only) | Returns current top-N by bullets |

---

## All Game Features & Their Transactions

**Lessons (Samarth)**
Five interactive lessons (programming basics, data structures, networking, cybersecurity, data ethics) each create a POST transaction on completion. The server adds the lesson number to `completed_lessons[]`, awards bullets, and unlocks `half2` when all 5 are done. Selection stops duplicate completions; sequencing makes sure lessons come before questions.

**Question Gauntlet (Ethan)**
50 multiple-choice questions across 5 CS topics. Each square landing creates a POST. The server checks the square is in range (7–56), records it in `visited_squares[]`, and awards bullets if the answer is correct. At square 56, the boss section is unlocked. The `GetUnvisitedSquaresAPI` reads the list to show remaining progress.

**Game Board & Dice (Aneesh)**
Every dice roll updates `current_square` via `POST /api/snakes/update-square`. The board draws by looping through all 56 squares, styling each based on whether it's in `visited_squares`. The Mode Selection page reads real-time player counts via Socket.IO before showing battle options.

**Boss Battle & PvP (Arnav)**
When a boss room is created, a BossRoom record is inserted. Player positions flow through WebSocket events — not saved to SQL every frame, but tracked in memory in the `boss_battles` dictionary. On boss defeat, all players' battle stats are collected and sent to the victory screen. Lives are updated at the end of each battle.

**Real-time Multiplayer — WebSocket (Akhil)**
Multiplayer state (positions, bullets, collisions) is handled in server memory for speed — database writes only happen at key moments (battle end, game completion, champion recording). The `resolve_player_collision()` function runs on every movement event, using sequencing (calculate distance → check overlap → apply push) and selection (only push if there's an overlap). Player stats are saved in one final transaction on boss defeat.

**Authentication & DevOps (Moiz)**
The JWT layer controls access to all transactional data. Every API write requires a valid token. The `@token_required()` decorator does a two-step check: (1) does the token exist, (2) is it valid. Only then can the database be reached. The app runs on Docker + Nginx at `snakes.opencodingsociety.com`.

**Victory Page & Hall of Champions (Akhil)**
The victory page triggers two transactions: `POST /api/snakes/complete` sets `game_status='completed'` and records `completed_at`. Then `GET /api/snakes/champions` reads all completed rows sorted by time to show the Hall of Champions. The reset button fires `POST /api/snakes/reset`, which restores all defaults while keeping the champion timestamp.

**SlitherRush (Aneesh)**
A 32-player snake arena running at 30 Hz server-side. The `SlitherRushManager` keeps arena state in memory (snake positions, bullets, scores). The tick loop goes through all arenas, players, and bullets each frame — handling movement, collision detection, and scoring. The in-arena leaderboard updates every 450 ms, ranking players by score, kills, and snake length.

---

## College Board AP CSP Requirements

**Sequencing**
Every API transaction runs in order: validate token → query record → apply logic → commit → respond. The game enforces a mandatory sequence: lessons → questions → battle → victory. The autosave flow sequences: collect state → serialize → PUT request → server commit → timestamp update.

**Selection**
`if lesson_number not in completed_lessons` stops duplicate credit. `if correct: award bullets` controls rewards. `if square >= 56: unlock boss` opens progression. `if game_status == 'completed': preserve champion_at` on reset. Every data write has a conditional check before saving.

**Iteration**
The autosave `setInterval` loops every 10 seconds. Board rendering loops through 56 squares. The leaderboard query loops through sorted rows. SlitherRush's 30 Hz tick loops through all arenas, players, and bullets. The list comprehension for unvisited squares loops through 100 squares. Bullet collision checks loop through the bullets array every frame.

**Lists / Collections**
`visited_squares[]`, `completed_lessons[]`, `unlocked_sections[]` are JSON columns that persist as arrays in the database. On the frontend: `QUESTIONS[]` (50 question objects), `arena['bullets']`, `slither_segments[]`, `boss_battles[room_id]['players']`.

**Procedures / Functions**
`resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)` — 5 parameters, returns adjusted coordinates. `get_leaderboard(limit)` — a query with a parameter. `complete_lesson()` — validates, appends, awards, unlocks. `answer_question()` — validates range, records the visit, awards bullets, unlocks sections. Each has defined inputs, a body, and a return value.

**Persistent Data Storage**
All game state lives in a SQLite/MySQL database via Flask-SQLAlchemy. Progress survives page refreshes, browser restarts, and multiple sessions because it's saved server-side. Guest mode uses `sessionStorage` as a contrast — it disappears when the tab closes, showing why authenticated persistent storage matters.

**The Internet (Big Idea 4)**
The game communicates over HTTPS using REST APIs (GET, POST, PUT, DELETE) and WebSocket connections (Socket.IO). JWT tokens authenticate both HTTP requests and WebSocket connections. REST handles saved data; WebSockets handle real-time multiplayer. Nginx reverse-proxies port 443 to Flask on port 8306.

**Impact of Computing (Big Idea 5)**
Guest mode shows data minimization — no personal info is collected for users who aren't logged in. The game teaches data ethics as one of its five lesson topics. The `ResetProgressAPI` lets users delete their own data. The leaderboard raises questions about competition, privacy, and what data we choose to share publicly.

---

## Summary: How It All Connects

Every feature in Snakes & Ladders feeds into the same transactional model. Lessons and questions generate the **write** transactions that fill `total_bullets`. The leaderboard and champions page are the **read** transactions that show that data publicly. Sequencing keeps the pipeline in the right order. Selection guards every write with checks. Iteration drives both the game loop and the real-time server simulation.

The result is a system where **playing the game and generating data are the same thing** — and the College Board requirements aren't just checked boxes, they're natural consequences of building software that works.

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