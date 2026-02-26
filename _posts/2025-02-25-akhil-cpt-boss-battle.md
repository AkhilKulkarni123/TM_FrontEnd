---
layout: post
title: "Akhil — CPT Skill A & B: Multiplayer Boss Battle"
description: College Board Create Performance Task writeup — Skill A video script and Skill B written response for the real-time multiplayer boss battle system
permalink: /akhil-cpt
toc: true
comments: true
categories: ['Game Development', 'CPT', 'Multiplayer']
---

<style>
/* ── page shell ─────────────────────────────────────────────── */
.cpt-hero{background:linear-gradient(135deg,#0a0015,#1a0a30,#2d1550);border-radius:16px;padding:28px 24px;margin:20px 0;border:2px solid #e94560;text-align:center}
.cpt-hero h2{color:#ffd93d;margin:0 0 6px 0;font-size:1.6em}
.cpt-hero p{color:#ccc;margin:0;font-size:0.95em}
.skill-badge{display:inline-block;background:#e94560;color:#fff;padding:4px 14px;border-radius:20px;font-size:0.8em;font-weight:700;margin:6px 4px}
.skill-badge.b{background:#4facfe}

/* ── section headers ────────────────────────────────────────── */
.section-header{background:linear-gradient(135deg,#16213e,#0f3460);border-left:5px solid #e94560;border-radius:0 12px 12px 0;padding:14px 18px;margin:28px 0 16px 0}
.section-header.blue{border-left-color:#4facfe}
.section-header h2{margin:0;color:#fff;font-size:1.25em}
.section-header p{margin:4px 0 0 0;color:#aaa;font-size:0.85em}

/* ── flow pill chain ────────────────────────────────────────── */
.flow{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:14px 0;font-size:0.85em}
.flow span{background:#667eea;color:#fff;padding:5px 12px;border-radius:6px;font-weight:600}
.flow .arr{background:none;color:#667eea;font-size:1.1em;padding:0}
.flow .hi{background:#e94560}
.flow .gold{background:#f39c12}

/* ── video script table ─────────────────────────────────────── */
.shot-table{width:100%;border-collapse:collapse;margin:16px 0;font-size:0.88em}
.shot-table th{background:#1a0a30;color:#ffd93d;padding:10px 12px;text-align:left;border-bottom:2px solid #e94560}
.shot-table td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;line-height:1.5}
.shot-table tr:nth-child(even) td{background:rgba(255,255,255,0.03)}
.ts{color:#4facfe;font-weight:700;white-space:nowrap}
.caption-pill{display:inline-block;background:rgba(0,0,0,0.7);border:1px solid #ffd93d;color:#ffd93d;padding:3px 10px;border-radius:4px;font-size:0.82em;font-style:italic}

/* ── info cards ─────────────────────────────────────────────── */
.card-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:16px 0}
.card{background:rgba(255,255,255,0.05);border-radius:10px;padding:14px;border-top:3px solid #667eea}
.card.red{border-top-color:#e94560}
.card.gold{border-top-color:#ffd93d}
.card strong{color:#4facfe;display:block;font-size:0.8em;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
.card.red strong{color:#e94560}
.card.gold strong{color:#ffd93d}

/* ── io table ───────────────────────────────────────────────── */
.io-table{width:100%;border-collapse:collapse;font-size:0.87em;margin:14px 0}
.io-table th{padding:9px 12px;text-align:left;font-size:0.8em;text-transform:uppercase;letter-spacing:.05em}
.io-table th:first-child{background:#e94560;color:#fff;width:22%}
.io-table th:nth-child(2){background:#667eea;color:#fff;width:28%}
.io-table th:last-child{background:#27ae60;color:#fff}
.io-table td{padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top}
.io-table tr:nth-child(even) td{background:rgba(255,255,255,0.03)}

/* ── cb checklist ───────────────────────────────────────────── */
.cb-table{width:100%;border-collapse:collapse;font-size:0.88em;margin:14px 0}
.cb-table th{background:#0f3460;color:#4facfe;padding:9px 12px;text-align:left}
.cb-table td{padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;line-height:1.5}
.cb-table td:first-child{color:#ffd93d;font-weight:600;width:28%;white-space:nowrap}
.check{color:#2ecc71;font-weight:700;margin-right:4px}

/* ── story block ────────────────────────────────────────────── */
.story{background:linear-gradient(135deg,#0f3460,#1a1a2e);border-radius:12px;padding:20px 22px;margin:16px 0;border:1px solid rgba(79,172,254,0.3);line-height:1.7;font-size:0.92em;color:#ddd}
.story strong{color:#4facfe}

/* ── note box ───────────────────────────────────────────────── */
.note{background:rgba(255,215,0,0.08);border-left:4px solid #ffd93d;border-radius:0 8px 8px 0;padding:12px 16px;margin:14px 0;font-size:0.87em;color:#ddd}
.note strong{color:#ffd93d}
</style>

<div class="cpt-hero">
  <h2>🐉 Multiplayer Boss Battle — CPT Reference</h2>
  <p>Akhil &nbsp;·&nbsp; Scrum Master / Multiplayer Developer</p>
  <span class="skill-badge">Skill A — 55-Second Video</span>
  <span class="skill-badge b">Skill B — Written Response</span>
</div>

<div class="note">
  <strong>How bullets connect to the boss battle:</strong> Students play the Snakes &amp; Ladders board game, land on lesson squares, learn AP CSP concepts, and answer quiz questions correctly to earn <strong>bullets</strong>. Those bullets are their ammo when they enter the Boss Battle arena — knowledge literally powers their attacks.
</div>

---

<div class="section-header">
  <h2>⏱ Skill A — 55-Second Video Script</h2>
  <p>Silent screen recording · text captions edited in post · no narration needed</p>
</div>

### What to Record

Open two browser tabs (or have a second player join). Show the full flow: **lobby → battle start → movement sync → shooting → victory**. Record your screen at normal speed — the demo is self-explanatory with captions.

### Shot-by-Shot Breakdown

<table class="shot-table">
<thead>
<tr><th>Timestamp</th><th>What You Do On Screen</th><th>Caption to Add in Editor</th><th>Caption Position</th></tr>
</thead>
<tbody>
<tr>
<td class="ts">0:00 – 0:08</td>
<td>Open <code>boss-battle.html</code>. The lobby screen appears — sidebar shows player list and chat panel. A second player is already visible in the list.</td>
<td><span class="caption-pill">Multiplayer Boss Battle · up to 10 players · real-time WebSocket</span></td>
<td>Lower-third banner</td>
</tr>
<tr>
<td class="ts">0:08 – 0:17</td>
<td>Type a message in the chat box and press Enter. The message appears instantly in both players' chat panels.</td>
<td><span class="caption-pill">Input: chat message → Output: broadcast to all players in the room</span></td>
<td>Lower-third banner</td>
</tr>
<tr>
<td class="ts">0:17 – 0:28</td>
<td>Click <strong>Start Battle</strong>. Canvas expands. Two player sprites spawn at different positions. Move with WASD — the second player's sprite moves in real time on your screen.</td>
<td><span class="caption-pill">Input: keyboard → position sent every 100ms → Output: all players update instantly</span></td>
<td>Upper banner</td>
</tr>
<tr>
<td class="ts">0:28 – 0:35</td>
<td>Click or press Space to fire at the boss. Show the boss health bar dropping for both players simultaneously.</td>
<td><span class="caption-pill">Bullets earned from AP CSP questions become ammo · Boss HP synced to all players</span></td>
<td>Lower-third banner</td>
</tr>
<tr>
<td class="ts">0:35 – 0:40</td>
<td>Let the boss hit your player — the HUD heart/lives counter visibly drops. A notification pops in the top-right corner of the screen.</td>
<td><span class="caption-pill">Output: lives lost → HUD updates instantly for that player</span></td>
<td>Lower-third banner</td>
</tr>
<tr>
<td class="ts">0:40 – 0:44</td>
<td>A powerup icon appears on the canvas — walk over it. A system notification slides in from the right edge of the screen confirming the pickup.</td>
<td><span class="caption-pill">Output: server emits powerup event → notification rendered in real time</span></td>
<td>Top-right corner label (point arrow at the notification)</td>
</tr>
<tr>
<td class="ts">0:44 – 0:48</td>
<td>Boss health hits 0. Victory overlay appears with per-player stats (damage dealt, bullets used).</td>
<td><span class="caption-pill">Boss defeated! · Server aggregates every player's stats</span></td>
<td>Center overlay caption</td>
</tr>
<tr>
<td class="ts">0:48 – 0:55</td>
<td>Show the victory screen / confetti. Pan to the Hall of Champions leaderboard if possible.</td>
<td><span class="caption-pill">Output: victory stored in Hall of Champions · knowledge = power</span></td>
<td>Lower-third banner</td>
</tr>
</tbody>
</table>

**Caption style:** White bold text on a semi-transparent black bar. Keep each caption on screen for its full timestamp range. No music or narration needed.

---

<div class="section-header blue">
  <h2>📝 Skill B — Written Response</h2>
  <p>Input · Output · Procedure · Algorithm (Sequencing, Selection, Iteration) · List · CPT Checklist</p>
</div>

### Program Purpose

The Boss Battle is the payoff moment of the Snakes & Ladders learning game. After students move around the board, land on lesson squares, and answer AP CSP questions correctly, they earn **bullets**. Those bullets are their ammunition when they enter the Boss Battle — up to 10 players fighting together in real time to defeat a dragon boss. The system is built on WebSockets (Socket.IO) so that every player's movement, shots, chat messages, and the boss's falling health bar are immediately visible to the whole team.

**Key files:**

<div class="card-row">
<div class="card"><strong>Backend Logic</strong>socketio_handlers/boss_battle.py</div>
<div class="card red"><strong>REST API</strong>api/boss_battle.py</div>
<div class="card gold"><strong>Frontend</strong>hacks/snakes/boss-battle.html</div>
<div class="card"><strong>DB Models</strong>model/boss_room.py</div>
</div>

---

### Input → Output

<table class="io-table">
<thead>
<tr><th>Input</th><th>How It Arrives</th><th>Output</th></tr>
</thead>
<tbody>
<tr>
<td>Player clicks "Start Battle"</td>
<td>POST <code>/api/boss/join</code> — sends bullets count, character, lives</td>
<td>Server creates / joins a <code>BossRoom</code> record, returns <code>room_id</code> to the browser</td>
</tr>
<tr>
<td>Browser emits <code>boss_join_room</code> socket event</td>
<td>WebSocket · includes player data (username, character, position)</td>
<td>Server allocates a safe spawn position, adds player to live <code>boss_battles</code> dict, sends <code>boss_room_state</code> to the joiner and <code>boss_player_joined</code> to everyone else already in the room</td>
</tr>
<tr>
<td>WASD / arrow keys held down</td>
<td><code>boss_player_move</code> socket event every 100 ms · carries x, y</td>
<td>Server resolves collisions, stores new position, emits <code>boss_player_position</code> to all other players — their canvases redraw the moving sprite</td>
</tr>
<tr>
<td>Mouse click / Space bar (shoot)</td>
<td><code>boss_player_shoot</code> event · bulletX, bulletY, dx, dy, character</td>
<td>Server forwards <code>boss_player_bullet</code> to all others — they render the projectile flying across their screen</td>
</tr>
<tr>
<td>Text typed in chat box, Enter pressed</td>
<td><code>boss_chat_send</code> event · content, room_id</td>
<td>Server broadcasts <code>boss_chat_message</code> to all other players in the room — message appears in their sidebar instantly</td>
</tr>
<tr>
<td>Boss health reaches 0</td>
<td>Triggered by accumulated damage from all players' shots</td>
<td>Server emits <code>boss_defeated</code> with every player's stats (damage dealt, bullets fired, lives lost) — victory screen and confetti render for the whole team</td>
</tr>
</tbody>
</table>

---

### Procedure with Parameters

`resolve_player_collision` is the core server-authoritative function that prevents players from overlapping each other or walking through the boss. It is called inside the movement handler for **every other player** in the room on every position update.

```python
# socketio_handlers/boss_battle.py

def resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist):
    """
    Pushes a player out of overlap with another player or the boss.

    Parameters:
      desired_x, desired_y  — where the player wants to move
      other_x, other_y      — position of the object they might overlap
      min_dist              — minimum allowed distance (sum of both radii)

    Returns: (adjusted_x, adjusted_y, did_collide)
    """
    dx   = desired_x - other_x
    dy   = desired_y - other_y
    dist = math.sqrt(dx * dx + dy * dy)   # distance between the two centers

    if dist < 0.001:                       # edge case: exact overlap
        return other_x + min_dist, desired_y, True

    if dist >= min_dist:                   # no collision — keep desired position
        return desired_x, desired_y, False

    overlap  = min_dist - dist            # how far they're overlapping
    nx, ny   = dx / dist, dy / dist       # unit vector pointing away
    return desired_x + nx * overlap, desired_y + ny * overlap, True
```

This function has **5 parameters** and a **return value** — meeting the College Board requirement for a student-developed procedure. It is called from the movement handler and also from the spawn allocator.

---

### Algorithm — Sequencing, Selection, and Iteration

All three appear together in `handle_player_move`, the handler that runs every time any player sends a position update:

```python
# socketio_handlers/boss_battle.py

@socketio.on('boss_player_move')
def handle_player_move(data):
    room_id = data.get('room_id')
    x, y    = data.get('x'), data.get('y')
    sid     = request.sid

    # ── SELECTION ─────────────────────────────────────────────
    # Guard: only proceed if the room exists and the player is in it
    if not room_id or room_id not in boss_battles:
        return
    if sid not in boss_battles[room_id]['players']:
        return
    if x is None or y is None:
        return

    # ── SEQUENCING ────────────────────────────────────────────
    # Step 1: clamp position to arena boundaries
    room_bounds = boss_battles[room_id].get('bounds') or normalize_boss_bounds({})
    desired_x = max(BOSS_PLAYER_RADIUS,
                    min(x, room_bounds['width'] - BOSS_PLAYER_RADIUS))
    desired_y = max(room_bounds['top'] + BOSS_PLAYER_RADIUS,
                    min(y, room_bounds['height'] - BOSS_PLAYER_RADIUS))

    # ── ITERATION ─────────────────────────────────────────────
    # Step 2: resolve collisions against every other player in the room
    for other_sid, other in boss_battles[room_id]['players'].items():
        if other_sid == sid:               # Selection: skip self
            continue
        desired_x, desired_y, _ = resolve_player_collision(
            desired_x, desired_y,
            other.get('x', desired_x), other.get('y', desired_y),
            BOSS_PLAYER_RADIUS * 2
        )

    # ── SEQUENCING (continued) ────────────────────────────────
    # Step 3: store the resolved position
    boss_battles[room_id]['players'][sid]['x'] = desired_x
    boss_battles[room_id]['players'][sid]['y'] = desired_y

    # Step 4: broadcast to everyone else — they redraw the sprite
    emit('boss_player_position',
         {'sid': sid, 'x': desired_x, 'y': desired_y},
         room=room_id, include_self=False)
```

**Sequencing** — the steps must happen in order: validate → clamp → resolve collisions → store → broadcast. Swapping any two steps would produce wrong results (e.g. broadcasting before resolving collisions would let players walk through each other).

**Selection** — the three guard `if` statements at the top stop the function early if the data is invalid, preventing crashes. The `if other_sid == sid: continue` inside the loop skips self-comparison.

**Iteration** — the `for` loop walks through every player currently in the room and calls `resolve_player_collision` for each one. As more players join, the loop naturally handles them all without any code changes.

---

### List / Data Structure

The live game state lives in a Python dictionary called `boss_battles`. It acts as the single source of truth for every room:

```python
# socketio_handlers/boss_battle.py  (in-memory, module level)

boss_battles = {
    "boss_battle_room": {
        "boss_health": 2000,
        "max_health":  2000,
        "players": {
            "socket-sid-abc": {
                "username":      "Akhil",
                "character":     "knight",
                "x": 342.5,  "y": 480.1,   # live position — updated every 100ms
                "lives":         5,
                "bullets":       30,
                "damage_dealt":  120,
                "bullets_fired": 12,
                "status":        "alive"
            },
            "socket-sid-xyz": { ... }       # up to 10 players per room
        },
        "powerups": [
            {"id": "pw1", "type": "damage", "x": 500, "y": 300}
        ],
        "bounds": {"width": 1100, "height": 600, "top": 200}
    }
}
```

This list (dict of dicts) is:
- **Iterated** every movement event to check collisions between all players
- **Read** every second to send a full player-list sync to each client
- **Mutated** when players join, move, shoot, or die
- **Aggregated** when the boss is defeated to produce the per-player stats screen

A parallel SQL table (`BossRoom` + `BossPlayer` in `model/boss_room.py`) persists join/leave records so the REST API can gate entry (you need at least 10 bullets, earned from correct answers, to fight the boss).

---

### College Board CPT Checklist

<table class="cb-table">
<thead>
<tr><th>CB Requirement</th><th>How the Boss Battle Meets It</th></tr>
</thead>
<tbody>
<tr>
<td><span class="check">✓</span>Program purpose</td>
<td>Students answer AP CSP questions on the board to earn bullets, then spend those bullets cooperatively in the Boss Battle — knowledge directly fuels gameplay</td>
</tr>
<tr>
<td><span class="check">✓</span>Input</td>
<td>Keyboard (WASD/arrows) → movement; mouse click / Space → shoot; text box → chat; POST request → room join with bullet count</td>
</tr>
<tr>
<td><span class="check">✓</span>Output</td>
<td>Other players' sprites reposition in real time; boss HP bar drops for the whole team; chat messages appear in sidebar; victory screen shows per-player damage stats</td>
</tr>
<tr>
<td><span class="check">✓</span>Procedure with parameter + return</td>
<td><code>resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)</code> — 5 parameters, returns <code>(adjusted_x, adjusted_y, did_collide)</code></td>
</tr>
<tr>
<td><span class="check">✓</span>List used meaningfully</td>
<td><code>boss_battles[room_id]['players']</code> iterated for collision checks, queried for sync, aggregated for victory stats; not hard-coded — grows/shrinks as players join and leave</td>
</tr>
<tr>
<td><span class="check">✓</span>Sequencing</td>
<td>Movement handler: validate → clamp bounds → resolve collisions → store position → broadcast — strict order, cannot be rearranged</td>
</tr>
<tr>
<td><span class="check">✓</span>Selection</td>
<td>Guards in movement handler stop processing invalid data; <code>if dist >= min_dist: return</code> in collision function skips no-overlap case; <code>if other_sid == sid: continue</code> skips self-check</td>
</tr>
<tr>
<td><span class="check">✓</span>Iteration</td>
<td><code>for other_sid, other in players.items()</code> collision loop; 80-attempt random spawn loop; <code>setInterval</code> broadcasts position every 100ms on the client; room-sync fires every 1000ms</td>
</tr>
<tr>
<td><span class="check">✓</span>The Internet (Big Idea 4)</td>
<td>WebSocket (Socket.IO) for real-time events; HTTP REST API (Flask) for join/leave/stats; JWT cookie authentication; CORS headers for cross-origin browser access; deployed at snakes.opencodingsociety.com</td>
</tr>
</tbody>
</table>

---

### The Full Story (in one paragraph)

<div class="story">

A student plays Snakes &amp; Ladders, lands on a lesson square, learns a Computer Science Principles concept, and answers a multiple-choice question correctly — they earn <strong>bullets</strong>, the game's currency. Once they've collected enough bullets and reached square 25, the Boss Battle unlocks. They click <strong>Start Battle</strong>: the browser sends a <strong>POST to <code>/api/boss/join</code></strong> (input), the server creates a <code>BossRoom</code> record, and returns a <code>room_id</code>. The browser then emits <code>boss_join_room</code> over WebSocket — the server runs <code>allocate_boss_spawn()</code> (an iterative random-sampling algorithm) to find a clear starting position, adds the player to the live <code>boss_battles</code> dict, and broadcasts their arrival to the room. From that point, every 100 ms the player's keyboard state becomes a <code>boss_player_move</code> event. The server runs the <strong>collision loop</strong> (iterating every other player, calling <code>resolve_player_collision</code> with 5 parameters), stores the resolved position, and emits <code>boss_player_position</code> — every other player's canvas redraws the sprite in its new location (<strong>output</strong>). When a bullet is fired, the same broadcast pattern delivers it to all screens. As the team chips away at the boss's 2000 HP, the health bar drops in real time for everyone. When it hits zero, the server emits <code>boss_defeated</code> with the aggregated per-player stats — bullets spent, damage dealt, lives lost — all pulled from that same <code>players</code> dict. The victory screen renders, the <code>BossRoom</code> is marked complete in the database, and the Hall of Champions leaderboard records the team's win forever. A quiz answer became a bullet; a bullet became a victory.

</div>
