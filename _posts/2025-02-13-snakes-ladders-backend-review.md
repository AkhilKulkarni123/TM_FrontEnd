---
layout: post
title: "Snakes & Ladders - Backend Review Blog"
description: A technical deep-dive into the backend architecture, API endpoints, database design, deployment pipeline, and College Board alignment for our Snakes & Ladders educational game.
permalink: /snakes-ladders-backend-review
toc: true
comments: true
categories: ['Backend', 'Game Development']
---

<style>
.arch-diagram {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 24px 0;
    padding: 20px;
    background: rgba(0,0,0,0.3);
    border-radius: 16px;
    border: 2px solid rgba(102, 126, 234, 0.3);
}
.arch-row {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}
.arch-box {
    padding: 12px 18px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.85em;
    text-align: center;
    min-width: 140px;
    color: white;
}
.arch-frontend { background: linear-gradient(135deg, #667eea, #764ba2); }
.arch-api { background: linear-gradient(135deg, #f093fb, #f5576c); }
.arch-socket { background: linear-gradient(135deg, #4facfe, #00f2fe); color: #111; }
.arch-db { background: linear-gradient(135deg, #43e97b, #38f9d7); color: #111; }
.arch-infra { background: linear-gradient(135deg, #fa709a, #fee140); color: #111; }
.arch-arrow {
    text-align: center;
    font-size: 1.3em;
    color: #667eea;
    letter-spacing: 8px;
}
.explain-box {
    background: rgba(102, 126, 234, 0.08);
    border-left: 4px solid #667eea;
    border-radius: 0 10px 10px 0;
    padding: 14px 18px;
    margin: 14px 0;
    font-size: 0.9em;
    line-height: 1.6;
}
.explain-box strong { color: #4facfe; }
.endpoint-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 0.85em;
}
.endpoint-table th, .endpoint-table td {
    padding: 10px 12px;
    border: 1px solid rgba(255,255,255,0.12);
    text-align: left;
}
.endpoint-table th {
    background: rgba(102, 126, 234, 0.25);
    color: #667eea;
    font-weight: 700;
}
.endpoint-table tr:nth-child(even) {
    background: rgba(255,255,255,0.03);
}
.method-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 0.78em;
    letter-spacing: 0.5px;
}
.method-get { background: #43e97b22; color: #43e97b; border: 1px solid #43e97b44; }
.method-post { background: #4facfe22; color: #4facfe; border: 1px solid #4facfe44; }
.method-put { background: #ffd70022; color: #ffd700; border: 1px solid #ffd70044; }
.method-delete { background: #f5576c22; color: #f5576c; border: 1px solid #f5576c44; }
.flow-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 18px 0;
    padding: 14px;
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
}
.flow-step {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 0.82em;
    font-weight: 600;
    text-align: center;
    min-width: 110px;
}
.flow-arrow { font-size: 1.3em; color: #667eea; }
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
    margin: 18px 0;
}
.info-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 16px 18px;
}
.info-card h4 {
    margin: 0 0 8px 0;
    color: #4facfe;
}
.info-card p, .info-card ul {
    margin: 0;
    font-size: 0.88em;
}
.team-banner {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    margin: 20px 0;
}
.team-pill {
    padding: 10px 20px;
    border-radius: 30px;
    font-weight: 700;
    font-size: 0.85em;
    color: white;
}
.pill-lead { background: linear-gradient(135deg, #f093fb, #f5576c); }
.pill-assist { background: linear-gradient(135deg, #4facfe, #00f2fe); color: #111; }
.csp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    margin: 16px 0;
}
.csp-card {
    background: rgba(255,255,255,0.05);
    border-left: 4px solid #667eea;
    border-radius: 0 8px 8px 0;
    padding: 12px 14px;
}
.csp-card h4 { margin: 0 0 4px 0; font-size: 0.9em; color: #4facfe; }
.csp-card p { margin: 0; font-size: 0.83em; opacity: 0.9; }
.snippet-explain {
    background: rgba(67, 233, 123, 0.06);
    border: 1px solid rgba(67, 233, 123, 0.2);
    border-radius: 10px;
    padding: 14px 18px;
    margin: -8px 0 18px 0;
    font-size: 0.88em;
    line-height: 1.65;
}
.snippet-explain strong { color: #43e97b; }
.line-explain {
    display: block;
    margin: 6px 0;
    padding-left: 12px;
    border-left: 2px solid rgba(67, 233, 123, 0.3);
}
</style>

## Backend Team

<div class="team-banner">
    <div class="team-pill pill-lead">Moiz — Lead Deployer & DevOps</div>
    <div class="team-pill pill-assist">Arnav — Assistant Backend Developer</div>
</div>

**Moiz** led deployment, Docker/Nginx configuration, JWT authentication, CORS, and production environment setup. **Arnav** assisted with backend API development, database models for boss battles, and server-side game logic.

**Deployed at:** [snakes.opencodingsociety.com](https://snakes.opencodingsociety.com)

---

## System Architecture Overview

<div class="arch-diagram">
    <div class="arch-row">
        <div class="arch-box arch-frontend">Jekyll Frontend<br><small>GitHub Pages</small></div>
    </div>
    <div class="arch-arrow">&#8595; &#8595; &#8595;</div>
    <div class="arch-row">
        <div class="arch-box arch-api">Flask REST API<br><small>Port 8306</small></div>
        <div class="arch-box arch-socket">Socket.IO<br><small>WebSockets (eventlet)</small></div>
    </div>
    <div class="arch-arrow">&#8595; &#8595; &#8595;</div>
    <div class="arch-row">
        <div class="arch-box arch-db">SQLAlchemy ORM<br><small>SQLite / MySQL</small></div>
    </div>
    <div class="arch-arrow">&#8595; &#8595; &#8595;</div>
    <div class="arch-row">
        <div class="arch-box arch-infra">Docker + Nginx<br><small>Gunicorn (eventlet worker)</small></div>
    </div>
</div>

<div class="explain-box">
<strong>What each layer does in plain English:</strong><br><br>
<strong>Jekyll Frontend</strong> — This is what the user sees. Jekyll is a static site generator that turns our HTML/CSS/JS files into a website hosted for free on GitHub Pages. It has zero backend logic — it just sends requests to our server.<br><br>
<strong>Flask REST API</strong> — Flask is a Python web framework. "REST API" means our server exposes URLs (like <code>/api/snakes/leaderboard</code>) that the frontend can call to read or write data. Think of it like a waiter: the frontend places an order (request), Flask processes it, and sends back the result (response) as JSON.<br><br>
<strong>Socket.IO (WebSockets)</strong> — Normal HTTP is one-way: the frontend asks, the server answers. WebSockets open a two-way connection that stays open, so the server can push updates to players instantly. This is how multiplayer works — when Player A moves, the server immediately tells Player B without Player B having to ask. Eventlet is the async engine that lets one server handle many simultaneous socket connections.<br><br>
<strong>SQLAlchemy ORM</strong> — ORM stands for Object-Relational Mapping. Instead of writing raw SQL queries like <code>SELECT * FROM users WHERE id=5</code>, we write Python: <code>User.query.filter_by(id=5).first()</code>. SQLAlchemy translates our Python classes into database tables automatically.<br><br>
<strong>Docker + Nginx</strong> — Docker packages our entire app (code + Python + all dependencies) into a container, so it runs identically on any machine. Nginx is a web server that sits in front of our app — when someone visits <code>snakes.opencodingsociety.com</code>, Nginx receives the request and forwards it to our Flask container on port 8306. Gunicorn is the production-grade server that actually runs our Flask code inside the container.
</div>

---

## App Routes & Blueprint Registration

<div class="explain-box">
<strong>What are app routes?</strong> A route is a URL pattern that maps to a Python function. When someone visits <code>/api/snakes/leaderboard</code>, Flask looks up which function handles that URL and runs it. <strong>Blueprints</strong> are Flask's way of organizing routes into groups — instead of putting all 20+ endpoints in one file, we split them into logical modules (game routes, admin routes, user routes, etc.) and register each blueprint with the main app.
</div>

```python
# main.py — Blueprint registration
# Each line connects a group of URL routes to the main app
app.register_blueprint(snakes_game_api)   # /api/snakes — core game CRUD
app.register_blueprint(snakes_bp)         # /api/snakes — extended endpoints
app.register_blueprint(admin_api)         # /api/admin  — admin dashboard
app.register_blueprint(boss_api)          # /api/boss   — boss battle rooms
app.register_blueprint(game_api)          # /api/game   — game progress
app.register_blueprint(user_api)          # /api/user   — user management
```

<div class="snippet-explain">
<strong>Line-by-line:</strong> Each <code>register_blueprint()</code> call takes all the routes defined in a separate file and attaches them to the main Flask app. For example, <code>snakes_game_api</code> is defined in <code>api/snakes_game.py</code> — it contains all the game endpoints like leaderboard, champions, etc. When the app starts, Flask knows: "if a request comes in for <code>/api/snakes/leaderboard</code>, run the function in the snakes_game_api blueprint." This keeps our code modular — each file handles one responsibility.
</div>

| Route Pattern | Purpose |
|---|---|
| `/api/snakes/*` | All game state, leaderboard, progress, completion |
| `/api/admin/*` | Admin dashboard, player management |
| `/api/boss/*` | Boss room creation and joining |
| `/api/user/*` | Registration, login, profile CRUD |
| `/api/authenticate` | JWT token generation |
| `/api/health` | Health check for monitoring |

---

## API Endpoints

<div class="explain-box">
<strong>What is an API endpoint?</strong> An endpoint is a specific URL + HTTP method combination that does one thing. The frontend calls these endpoints using <code>fetch()</code> in JavaScript. The four main HTTP methods are:<br>
- <strong>GET</strong> = Read data (like loading your game progress)<br>
- <strong>POST</strong> = Create or submit data (like answering a question)<br>
- <strong>PUT</strong> = Update existing data (like autosaving your position)<br>
- <strong>DELETE</strong> = Remove data (like deleting a game record)
</div>

### Game State Endpoints (`/api/snakes/`)

<table class="endpoint-table">
<tr><th>Endpoint</th><th>Method</th><th>Purpose</th><th>Payload / Params</th></tr>
<tr><td><code>/api/snakes/</code></td><td><span class="method-badge method-get">GET</span></td><td>Load current user's game progress</td><td>—</td></tr>
<tr><td><code>/api/snakes/</code></td><td><span class="method-badge method-post">POST</span></td><td>Create new game record</td><td><code>{username, selected_character}</code></td></tr>
<tr><td><code>/api/snakes/</code></td><td><span class="method-badge method-put">PUT</span></td><td>Autosave full game state (every 10s)</td><td><code>{current_square, lives, total_bullets, time_played, ...}</code></td></tr>
<tr><td><code>/api/snakes/</code></td><td><span class="method-badge method-delete">DELETE</span></td><td>Delete game record</td><td>—</td></tr>
<tr><td><code>/api/snakes/progress</code></td><td><span class="method-badge method-get">GET</span></td><td>Get progress (auto-creates if missing)</td><td>—</td></tr>
<tr><td><code>/api/snakes/complete-lesson</code></td><td><span class="method-badge method-post">POST</span></td><td>Mark lesson complete, award bullets</td><td><code>{lesson_number, bullets_earned}</code></td></tr>
<tr><td><code>/api/snakes/answer-question</code></td><td><span class="method-badge method-post">POST</span></td><td>Record answer, update position</td><td><code>{square, bullets_earned, correct}</code></td></tr>
<tr><td><code>/api/snakes/update-square</code></td><td><span class="method-badge method-post">POST</span></td><td>Update board position</td><td><code>{square}</code></td></tr>
<tr><td><code>/api/snakes/add-bullets</code></td><td><span class="method-badge method-post">POST</span></td><td>Award bullets to player</td><td><code>{bullets}</code></td></tr>
<tr><td><code>/api/snakes/complete</code></td><td><span class="method-badge method-post">POST</span></td><td>Mark game as completed</td><td>—</td></tr>
<tr><td><code>/api/snakes/reset</code></td><td><span class="method-badge method-post">POST</span></td><td>Full reset (preserves champion status)</td><td>—</td></tr>
<tr><td><code>/api/snakes/leaderboard</code></td><td><span class="method-badge method-get">GET</span></td><td>Top 10 players by bullets</td><td><code>?limit=10</code></td></tr>
<tr><td><code>/api/snakes/champions</code></td><td><span class="method-badge method-get">GET</span></td><td>All game completers (Hall of Champions)</td><td>—</td></tr>
<tr><td><code>/api/snakes/active-players</code></td><td><span class="method-badge method-get">GET</span></td><td>Players updated in last 10s</td><td>—</td></tr>
<tr><td><code>/api/snakes/unvisited-squares</code></td><td><span class="method-badge method-get">GET</span></td><td>List of unvisited question squares</td><td>—</td></tr>
</table>

<div class="explain-box">
<strong>How the frontend uses these:</strong> When a player finishes a lesson, the JavaScript on the page runs <code>fetch('https://snakes.opencodingsociety.com/api/snakes/complete-lesson', { method: 'POST', body: JSON.stringify({lesson_number: 3, bullets_earned: 10}) })</code>. The Flask server receives this, finds the player's database record, adds lesson 3 to their <code>completed_lessons</code> list, adds 10 to their bullet count, checks if all 5 lessons are done (and if so, unlocks the next board section), saves to the database, and sends back the updated state as JSON.
</div>

### Admin Endpoints (`/api/admin/`)

<table class="endpoint-table">
<tr><th>Endpoint</th><th>Method</th><th>Purpose</th></tr>
<tr><td><code>/api/admin/dashboard</code></td><td><span class="method-badge method-get">GET</span></td><td>Overview stats — total users, players, bullets, time, boss stats</td></tr>
<tr><td><code>/api/admin/players</code></td><td><span class="method-badge method-get">GET</span></td><td>List all active players with progress details</td></tr>
<tr><td><code>/api/admin/users</code></td><td><span class="method-badge method-get">GET</span> <span class="method-badge method-post">POST</span></td><td>User management — list all, create new</td></tr>
<tr><td><code>/api/admin/user/&lt;uid&gt;</code></td><td><span class="method-badge method-put">PUT</span> <span class="method-badge method-delete">DELETE</span></td><td>Edit or delete individual user</td></tr>
</table>

### User & Auth Endpoints

<table class="endpoint-table">
<tr><th>Endpoint</th><th>Method</th><th>Purpose</th></tr>
<tr><td><code>/api/authenticate</code></td><td><span class="method-badge method-post">POST</span></td><td>Login — returns JWT token in HttpOnly cookie</td></tr>
<tr><td><code>/api/user/</code></td><td><span class="method-badge method-post">POST</span></td><td>Register new user</td></tr>
<tr><td><code>/api/user/</code></td><td><span class="method-badge method-get">GET</span></td><td>Get current user profile</td></tr>
<tr><td><code>/api/user/</code></td><td><span class="method-badge method-put">PUT</span></td><td>Update user profile</td></tr>
</table>

---

## How the Backend Works

### Authentication Flow

<div class="flow-container">
    <div class="flow-step">User enters credentials</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">POST /api/authenticate</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Server validates + creates JWT</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">JWT stored in HttpOnly cookie</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">@token_required() on every API call</div>
</div>

<div class="explain-box">
<strong>What is this flow showing?</strong> When a user logs in, their username and password are sent to the server. The server checks if they match a record in the database. If yes, it creates a <strong>JWT (JSON Web Token)</strong> — a small encrypted string that contains the user's ID. This token gets stored in an <strong>HttpOnly cookie</strong> (a cookie that JavaScript cannot read, making it safe from XSS attacks). From now on, every time the frontend makes an API call, the browser automatically sends this cookie along. The server reads the token, decodes who the user is, and knows which game data to load or update.
</div>

```python
# api/jwt_authorize.py — Token decorator
def token_required():
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.cookies.get('jwt')
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            g.current_user = User.query.filter_by(_uid=data['_uid']).first()
            return f(*args, **kwargs)
        return decorated
    return decorator
```

<div class="snippet-explain">
<strong>What this code does step by step:</strong>
<span class="line-explain"><code>token = request.cookies.get('jwt')</code> — Grabs the JWT token from the browser's cookies that were sent with the request.</span>
<span class="line-explain"><code>jwt.decode(token, SECRET_KEY, algorithms=['HS256'])</code> — Decodes (decrypts) the token using our secret key. HS256 is the encryption algorithm. If someone tampered with the token, this line would fail and reject the request.</span>
<span class="line-explain"><code>g.current_user = User.query.filter_by(_uid=data['_uid']).first()</code> — Uses the user ID from inside the token to look up the full user record from the database, then stores it in Flask's <code>g</code> object so any endpoint function can access <code>g.current_user</code>.</span>
<span class="line-explain"><strong>The decorator pattern:</strong> <code>@token_required()</code> is placed above any endpoint function that needs authentication. It runs this validation code <em>before</em> the endpoint's actual logic — like a security guard checking your ID before letting you into a building.</span>
</div>

### Game Progression Pipeline

<div class="flow-container">
    <div class="flow-step">Login/Guest</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Lessons 1-5<br><small>POST /complete-lesson</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Unlock half2</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Questions (sq 7-56)<br><small>POST /answer-question</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Unlock boss</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Battle Mode<br><small>WebSocket events</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">POST /complete</div>
</div>

<div class="explain-box">
<strong>What is section gating?</strong> The backend enforces a strict order of progression. The player's <code>unlocked_sections</code> list starts as <code>['half1']</code> — they can only access the first part of the board (lessons). After completing all 5 lessons, the server appends <code>'half2'</code> to the list, unlocking the question section. After reaching square 56, <code>'boss'</code> gets appended, unlocking battle modes. The frontend checks this list to show/hide sections — but critically, the <strong>backend also validates</strong> every request, so even if someone tried to hack the frontend to skip ahead, the server would reject it.
</div>

### Real-Time Multiplayer (Socket.IO)

<div class="explain-box">
<strong>Why WebSockets instead of regular HTTP?</strong> Regular HTTP works like texting — the frontend sends a message, waits for a reply, conversation over. For multiplayer gaming, we need a phone call — both sides can talk at any time. Socket.IO keeps a persistent connection open between each player and the server. When Player A moves their character, the server instantly pushes that position to all other players in the same room, without them having to ask "did anyone move?" every few milliseconds.
</div>

Three multiplayer modes run over WebSocket connections:

<div class="card-grid">

<div class="info-card">
<h4>Boss Battle (Co-op, up to 10 players)</h4>
<ul>
<li><code>boss_join_lobby</code> → Pre-battle chat room</li>
<li><code>boss_join_room</code> → Enter arena (server allocates spawn)</li>
<li><code>boss_player_move</code> → Position broadcast (50ms interval)</li>
<li><code>boss_shoot</code> → Fire bullet, server validates collision</li>
<li><code>boss_defeated</code> → Aggregate all player stats</li>
<li>Powerups spawn every 5s (server-controlled rate limiting)</li>
</ul>
</div>

<div class="info-card">
<h4>PvP Arena (1v1 Competitive)</h4>
<ul>
<li><code>pvp_join</code> → Auto-matchmaking via <code>get_or_create_open_room()</code></li>
<li><code>pvp_ready</code> → Dual-ready confirmation system</li>
<li><code>pvp_battle_start</code> → Server starts the match</li>
<li>Server-authoritative collision: <code>resolve_player_collision()</code></li>
<li>Tab-away detection + position authority corrections</li>
</ul>
</div>

<div class="info-card">
<h4>SlitherRush (32-player Snake Arena)</h4>
<ul>
<li><code>slitherrush_join</code> → Arena auto-assignment (max 32)</li>
<li><code>slitherrush_input</code> → Direction + shoot</li>
<li><strong>30Hz server tick loop</strong> — full simulation server-side</li>
<li>State snapshots emitted at 15fps</li>
<li>Leaderboard broadcasts every 450ms</li>
<li>Party system groups friends into same arena</li>
</ul>
</div>

</div>

<div class="explain-box">
<strong>"Server-authoritative" — what does that mean?</strong> The server is the single source of truth. Players send their inputs (key presses, mouse clicks) to the server, and the <em>server</em> calculates all positions, collisions, and damage. The server then tells every client what happened. This prevents cheating — a player can't modify their local code to say "I have 999 health" because the server tracks health, not the client. The SlitherRush mode takes this furthest: the entire game simulation (30 frames per second) runs on the server. Clients just send steering input and receive the game state to render.
</div>

**WebSocket JWT auth** — Socket connections authenticate via cookies using `_resolve_socket_user()`:

```python
# socketio_handlers/slitherrush_events.py
def _resolve_socket_user():
    token = request.cookies.get(current_app.config.get('JWT_TOKEN_NAME', 'jwt'))
    if not token: return None
    decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    return User.query.filter_by(_uid=decoded.get('_uid')).first()
```

<div class="snippet-explain">
<strong>Why is this needed?</strong> WebSocket connections don't automatically come with authentication like HTTP requests. This function manually checks: does this socket connection have a valid JWT cookie attached? If yes, decode it and look up the user in the database. If no token exists, return <code>None</code> (the player connects as a guest). This is how the server knows <em>who</em> is sending each <code>boss_shoot</code> or <code>slitherrush_input</code> event.
</div>

---

## Database Design

<div class="explain-box">
<strong>Why do we need a database?</strong> Without a database, all game progress would vanish when the server restarts. The database is a permanent storage file on the server. Every time a player completes a lesson, answers a question, or earns bullets, we write that change to the database. When they log back in tomorrow, we read it back. SQLAlchemy lets us define database tables as Python classes — each class becomes a table, each attribute becomes a column.
</div>

### SnakesGameData Model

```python
# model/snakes_game.py — Core game state per user
class SnakesGameData(db.Model):
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    username        = db.Column(db.String(255))
    total_bullets   = db.Column(db.Integer, default=0)
    current_square  = db.Column(db.Integer, default=1)
    lives           = db.Column(db.Integer, default=5)
    time_played     = db.Column(db.Float, default=0.0)
    selected_character    = db.Column(db.String(50))
    visited_squares       = db.Column(MutableList)
    completed_lessons     = db.Column(MutableList)
    unlocked_sections     = db.Column(MutableList)
    boss_battle_attempts  = db.Column(db.Integer, default=0)
    game_status     = db.Column(db.String(20), default='active')
    completed_at    = db.Column(db.DateTime, nullable=True)
    last_updated    = db.Column(db.DateTime)
```

<div class="snippet-explain">
<strong>Reading this model like a spreadsheet:</strong> Each row in this table is one player's game save. The columns are:
<span class="line-explain"><code>id</code> / <code>user_id</code> — Unique identifiers. <code>user_id</code> links to the Users table (<code>ForeignKey</code>) and is <code>unique=True</code> so each user gets exactly one game record.</span>
<span class="line-explain"><code>total_bullets</code> — Currency earned from lessons and correct answers. Carries over to boss battle as ammo.</span>
<span class="line-explain"><code>current_square</code> — Player's position on the board (1–56). Defaults to square 1.</span>
<span class="line-explain"><code>visited_squares</code> — A JSON list like <code>[7, 12, 23, 34]</code> tracking which question squares the player has landed on. <code>MutableList</code> means SQLAlchemy detects when we <code>.append()</code> to it and auto-saves the change.</span>
<span class="line-explain"><code>completed_lessons</code> — A JSON list like <code>[1, 2, 3, 4, 5]</code>. When all 5 are present, the server unlocks the next section.</span>
<span class="line-explain"><code>unlocked_sections</code> — Controls what parts of the game the player can access: <code>['half1']</code> → <code>['half1','half2']</code> → <code>['half1','half2','boss']</code>.</span>
<span class="line-explain"><code>game_status</code> / <code>completed_at</code> — Flips to <code>'completed'</code> with a timestamp when the player finishes. Used by the Hall of Champions to list winners in order.</span>
</div>

### Entity Relationships

<div class="flow-container">
    <div class="flow-step">User</div>
    <span class="flow-arrow">1:1</span>
    <div class="flow-step">SnakesGameData</div>
    <span class="flow-arrow">1:N</span>
    <div class="flow-step">SquareCompletion</div>
</div>

<div class="flow-container">
    <div class="flow-step">BossRoom</div>
    <span class="flow-arrow">1:N</span>
    <div class="flow-step">BossPlayer</div>
    <span class="flow-arrow">1:1</span>
    <div class="flow-step">BossBattleStats</div>
</div>

<div class="explain-box">
<strong>What do 1:1 and 1:N mean?</strong><br>
- <strong>1:1 (one-to-one):</strong> Each User has exactly one SnakesGameData record. One player, one save file.<br>
- <strong>1:N (one-to-many):</strong> One SnakesGameData record can have many SquareCompletion records — because one player visits many squares. Similarly, one BossRoom can have many BossPlayers (up to 10 in co-op).
</div>

---

## User Management

<div class="card-grid">

<div class="info-card">
<h4>Registration & Login</h4>
<p><code>POST /api/user/</code> creates a user with hashed password (bcrypt). <code>POST /api/authenticate</code> validates credentials and returns a JWT token in a secure HttpOnly cookie with SameSite flags.</p>
</div>

<div class="info-card">
<h4>Role-Based Access</h4>
<p>Users have a <code>role</code> field — <code>'User'</code> or <code>'Admin'</code>. The <code>@admin_required()</code> decorator chains with <code>@token_required()</code> to verify admin privileges before allowing access to <code>/api/admin/*</code> endpoints.</p>
</div>

<div class="info-card">
<h4>Profile Management</h4>
<p><code>GET/PUT /api/user/</code> allows users to view and update their profile. Admins can manage any user via <code>/api/admin/user/&lt;uid&gt;</code> — including password reset and account deletion.</p>
</div>

</div>

<div class="explain-box">
<strong>Why bcrypt?</strong> We never store passwords as plain text. Bcrypt is a hashing algorithm that turns "mypassword123" into an unreadable string like <code>$2b$12$LJ3m4...</code>. Even if someone stole the database, they couldn't reverse the hashes back into passwords. When a user logs in, we hash what they typed and compare it to the stored hash.
</div>

---

## Admin Panel

```python
@admin_api.route('/dashboard', methods=['GET'])
@admin_required()
def admin_dashboard():
    total_users = User.query.count()
    total_players = GameProgress.query.count()
    total_bullets = db.session.query(db.func.sum(GameProgress.bullets)).scalar() or 0
    total_time = db.session.query(db.func.sum(GameProgress.time_played_minutes)).scalar() or 0
    # + boss battle stats, squares completed, etc.
```

<div class="snippet-explain">
<strong>Line-by-line:</strong>
<span class="line-explain"><code>@admin_api.route('/dashboard', methods=['GET'])</code> — This function runs when someone visits <code>/api/admin/dashboard</code> with a GET request.</span>
<span class="line-explain"><code>@admin_required()</code> — Before running, it checks: (1) is the user logged in? (2) is their role <code>'Admin'</code>? If not, it returns a 403 Forbidden error. Regular players can never access this.</span>
<span class="line-explain"><code>User.query.count()</code> — Counts every row in the Users table (total registered users).</span>
<span class="line-explain"><code>db.func.sum(GameProgress.bullets).scalar()</code> — SQL SUM function — adds up the <code>bullets</code> column across all players. <code>.scalar()</code> returns a single number. The <code>or 0</code> handles the case where no records exist (returns 0 instead of <code>None</code>).</span>
</div>

**Admin capabilities:**
- View total users, active players, total bullets earned, total time played
- List all player progress records with game state details
- Create, edit, and delete user accounts
- View boss battle statistics (rooms, players, completion rates)

---

## Docker & Deployment

<div class="explain-box">
<strong>Why Docker?</strong> "It works on my machine" is a classic developer problem. Docker solves this by packaging the app, Python 3.11, and every library into a <strong>container</strong> — a lightweight, isolated environment. The container runs the same way on a developer's laptop, on a teammate's laptop, and on the production server. Think of it like shipping a product in a sealed box instead of loose parts.
</div>

### Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn eventlet

COPY . /app

ENV GUNICORN_CMD_ARGS="--worker-class eventlet --workers=1 \
    --bind=0.0.0.0:8306 --timeout=120"

EXPOSE 8306
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", \
     "--bind", "0.0.0.0:8306", "main:app"]
```

<div class="snippet-explain">
<strong>Line-by-line:</strong>
<span class="line-explain"><code>FROM python:3.11-slim</code> — Start with a minimal Linux image that has Python 3.11 pre-installed. "slim" means no extra tools we don't need, keeping the image small.</span>
<span class="line-explain"><code>WORKDIR /app</code> — Set the working directory inside the container to <code>/app</code>. All following commands run from here.</span>
<span class="line-explain"><code>COPY requirements.txt .</code> then <code>RUN pip install</code> — Copy the dependency list first and install packages. Docker caches this layer — so if we change our code but not our dependencies, it skips reinstalling (much faster rebuilds).</span>
<span class="line-explain"><code>COPY . /app</code> — Copy our actual source code into the container.</span>
<span class="line-explain"><code>--worker-class eventlet --workers=1</code> — Use eventlet (async) instead of default sync workers. We need exactly 1 worker because Socket.IO keeps state in memory — multiple workers would create separate copies and players couldn't see each other.</span>
<span class="line-explain"><code>--bind=0.0.0.0:8306</code> — Listen on all network interfaces on port 8306. <code>0.0.0.0</code> means "accept connections from anywhere," not just localhost.</span>
<span class="line-explain"><code>CMD ["gunicorn", ...]</code> — The command that runs when the container starts. Gunicorn is a production WSGI server — unlike Flask's built-in dev server, it can handle many concurrent requests reliably.</span>
</div>

### docker-compose.yml

```yaml
version: '3'
services:
  web:
    image: flask_open
    build: .
    env_file: .env
    ports:
      - "8306:8306"
    volumes:
      - ./instance:/app/instance   # Persist SQLite DB
    restart: unless-stopped
```

<div class="snippet-explain">
<strong>What this does:</strong> Docker Compose defines how to run our container. <code>build: .</code> means "build the Dockerfile in the current directory." <code>ports: "8306:8306"</code> maps the container's internal port to the host machine's port so outside traffic can reach it. <code>volumes</code> mounts a folder from the host into the container — this is critical because it keeps the SQLite database file on the host machine, so the data survives even if we rebuild the container. <code>restart: unless-stopped</code> means if the container crashes, Docker automatically restarts it.
</div>

### Common Docker Commands

```bash
# Build the image and start the container in detached (background) mode
docker-compose up --build -d

# Stream live server logs (Ctrl+C to stop watching)
docker-compose logs -f web

# Stop the container, rebuild with new code, and restart
docker-compose down && docker-compose up --build -d

# Open a terminal inside the running container (for debugging)
docker exec -it <container_id> /bin/bash

# List all running containers (find container IDs here)
docker ps

# Rebuild from scratch, ignoring cached layers
docker-compose build --no-cache

# Monitor CPU/memory usage of running containers
docker stats
```

### Nginx Reverse Proxy

<div class="explain-box">
<strong>What is a reverse proxy?</strong> Our Flask app runs on port 8306, but users visit <code>snakes.opencodingsociety.com</code> (port 80/443). Nginx sits between the internet and our app — it receives requests on the standard web port and forwards them to Flask on 8306. It also handles SSL (HTTPS), load balancing, and serving static files faster than Python can.
</div>

```nginx
server {
    listen 80;
    server_name snakes.opencodingsociety.com;

    location / {
        proxy_pass http://localhost:8306;
        proxy_http_version 1.1;

        # WebSocket support — these headers tell Nginx to upgrade
        # the HTTP connection to a persistent WebSocket connection
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

<div class="snippet-explain">
<strong>Key lines:</strong>
<span class="line-explain"><code>listen 80</code> — Nginx listens on port 80 (standard HTTP port).</span>
<span class="line-explain"><code>server_name snakes.opencodingsociety.com</code> — Only handle requests for this domain.</span>
<span class="line-explain"><code>proxy_pass http://localhost:8306</code> — Forward all requests to Flask running on port 8306.</span>
<span class="line-explain"><code>Upgrade</code> / <code>Connection "upgrade"</code> — These headers are <strong>essential for WebSocket</strong>. Without them, Socket.IO connections would fail and fall back to slow HTTP polling. These headers tell Nginx: "this isn't a normal request — upgrade it to a persistent two-way connection."</span>
<span class="line-explain"><code>X-Real-IP</code> — Passes the user's real IP address to Flask (otherwise Flask would only see Nginx's local IP).</span>
</div>

---

## How Everything Flows (Visual Summary)

### Request Lifecycle

<div class="flow-container">
    <div class="flow-step">Browser</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Nginx<br><small>snakes.opencodingsociety.com</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Gunicorn<br><small>:8306</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Flask App<br><small>Blueprint routing</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">@token_required<br><small>JWT validation</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">SQLAlchemy<br><small>DB read/write</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">JSON Response</div>
</div>

<div class="explain-box">
<strong>Walking through a real request:</strong> A player clicks "Roll Dice" and lands on square 23. Here's what happens:<br>
1. <strong>Browser</strong> sends <code>POST /api/snakes/answer-question</code> with <code>{square: 23, correct: true, bullets_earned: 5}</code><br>
2. <strong>Nginx</strong> receives the HTTPS request at <code>snakes.opencodingsociety.com</code> and forwards it to <code>localhost:8306</code><br>
3. <strong>Gunicorn</strong> hands the request to the Flask app<br>
4. <strong>Flask</strong> looks at the URL and matches it to the <code>answer_question()</code> function in the <code>snakes_bp</code> blueprint<br>
5. <strong>@token_required</strong> runs first — extracts the JWT from the cookie, decodes it, loads the user from the DB<br>
6. <strong>SQLAlchemy</strong> finds the player's <code>SnakesGameData</code> record, updates <code>current_square=23</code>, appends 23 to <code>visited_squares</code>, adds 5 to <code>total_bullets</code>, and commits to the database<br>
7. <strong>JSON Response</strong> is sent back: <code>{"current_square": 23, "total_bullets": 45, "visited_squares": [7,12,18,23], ...}</code>
</div>

### Multiplayer Data Flow

<div class="flow-container">
    <div class="flow-step">Player Input<br><small>WASD / Mouse</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Socket.IO emit</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Server validates<br><small>Collision + bounds</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Broadcast to room</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">All clients render</div>
</div>

<div class="explain-box">
<strong>Example — Boss Battle:</strong> Player A presses W to move up and clicks to shoot. Their browser emits a <code>boss_player_move</code> and <code>boss_shoot</code> event via Socket.IO. The server receives these, checks if the new position is within arena bounds, runs collision detection against the boss and other players using <code>resolve_player_collision()</code>, then broadcasts the validated positions to <em>every player in the room</em>. All clients receive this and update their canvas to show Player A's new position and bullet. This happens 20 times per second (50ms intervals).
</div>

### Section Unlocking Logic

<div class="flow-container">
    <div class="flow-step">Start<br><small>unlocked: ['half1']</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Complete 5 lessons<br><small>+= 'half2'</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Reach square 56<br><small>+= 'boss'</small></div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Defeat boss<br><small>game_status = 'completed'</small></div>
</div>

<div class="explain-box">
<strong>Why this matters:</strong> This is the <strong>sequencing</strong> that College Board requires. The game isn't just "click any page" — there's a forced order enforced by the backend. The <code>unlocked_sections</code> list in the database acts as a key ring. You start with one key (<code>half1</code>). Completing all lessons gives you the second key (<code>half2</code>). Reaching square 56 gives you the boss key. The frontend hides locked sections, and the backend rejects any API calls that try to access locked content.
</div>

---

## College Board AP CSP Requirements

<div class="csp-grid">

<div class="csp-card">
<h4>Big Idea 3: Input</h4>
<p>HTML forms, keyboard events (WASD/arrows), mouse aiming, click/spacebar shooting — all captured via event listeners and sent to backend via REST or WebSocket.</p>
</div>

<div class="csp-card">
<h4>Big Idea 3: Persistent Data Storage</h4>
<p>SQLAlchemy ORM persists all game state to SQLite/MySQL. Player progress (<code>current_square</code>, <code>total_bullets</code>, <code>completed_lessons</code>, <code>visited_squares</code>) survives across sessions via authenticated API calls.</p>
</div>

<div class="csp-card">
<h4>Big Idea 3: Sequencing</h4>
<p>Server enforces ordered progression: lessons must complete before questions unlock, questions before boss. API calls execute sequentially: fetch → validate → update → respond.</p>
</div>

<div class="csp-card">
<h4>Big Idea 3: Selection</h4>
<p><code>if correct: award bullets</code>, <code>if lives <= 0: game over</code>, <code>if square >= 56: unlock boss</code>, <code>if bossHealth <= 0: victory</code>. Backend validates all conditions before state changes.</p>
</div>

<div class="csp-card">
<h4>Big Idea 3: Iteration</h4>
<p>SlitherRush 30Hz tick loop iterates all arenas/players/bullets per frame. <code>requestAnimationFrame</code> for rendering. <code>setInterval</code> for autosave (10s), position broadcast (50ms), powerup spawning (5s).</p>
</div>

<div class="csp-card">
<h4>Big Idea 3: Lists / Collections</h4>
<p><code>visited_squares[]</code>, <code>completed_lessons[]</code>, <code>unlocked_sections[]</code>, <code>arena['bullets']</code>, <code>slither_segments[]</code> — all managed as MutableList/JSON columns or in-memory arrays with server-side mutation.</p>
</div>

<div class="csp-card">
<h4>Big Idea 3: Procedures</h4>
<p><code>resolve_player_collision(x, y, ox, oy, min_dist)</code> — 5 parameters, returns adjusted coordinates. <code>allocate_boss_spawn()</code>, <code>spawn_powerup_for_room()</code>, <code>@token_required()</code> decorator with nested functions.</p>
</div>

<div class="csp-card">
<h4>Big Idea 3: Algorithms</h4>
<p>Boss AI with pattern switching (dash, zigzag, chase, circle). Collision detection via distance formula (<code>math.sqrt</code>). SlitherRush bullet-hit uses squared-distance optimization. Safe spawn uses random sampling + grid fallback.</p>
</div>

<div class="csp-card">
<h4>Big Idea 4: The Internet</h4>
<p>HTTP/HTTPS REST APIs (GET, POST, PUT, DELETE). WebSocket via Socket.IO with eventlet async. JWT tokens authenticate both HTTP and socket connections. CORS controls cross-origin access. Nginx reverse proxies all traffic.</p>
</div>

<div class="csp-card">
<h4>Big Idea 5: Impact of Computing</h4>
<p>Game teaches CS ethics and data privacy through lesson content. Guest mode demonstrates data minimization — zero personal data collected without authentication.</p>
</div>

</div>

### CPT (Create Performance Task) Mapping

| CPT Requirement | Our Implementation |
|---|---|
| **Program Purpose** | Teach AP CSP through gamified learning |
| **Input → Output** | Answers → bullet rewards; keyboard/mouse → character movement |
| **List Usage** | `visited_squares[]` tracks answered questions; `completed_lessons[]` gates progression |
| **Procedure with Parameters** | `resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)` — 5 params, returns adjusted coords |
| **Algorithm (Seq + Sel + Iter)** | `_step_bullets()` — sequences bullet movement, iterates all bullets vs. all players, selects action via distance check |

---

## Key Backend Code Snippets

### 1. Server-Authoritative Collision Resolution

```python
# socketio_handlers/boss_battle.py
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

<div class="snippet-explain">
<strong>What this does in plain English:</strong> This function checks if two players are overlapping and pushes them apart if so. It takes 5 parameters — the position a player wants to move to (<code>desired_x/y</code>), the other player's position (<code>other_x/y</code>), and the minimum allowed distance between them (<code>min_dist</code>).
<span class="line-explain"><code>dx</code> / <code>dy</code> — Calculate the horizontal and vertical distance between the two players.</span>
<span class="line-explain"><code>dist = math.sqrt(dx*dx + dy*dy)</code> — Use the <strong>Pythagorean theorem</strong> (distance formula) to get the actual straight-line distance between them.</span>
<span class="line-explain"><code>if dist < 0.001</code> — Edge case: if both players are in the exact same spot (distance ~0), push one to the right by <code>min_dist</code> to avoid division by zero.</span>
<span class="line-explain"><code>if dist >= min_dist</code> — If they're far enough apart, no collision. Return the desired position unchanged, with <code>False</code> meaning "no collision happened."</span>
<span class="line-explain"><code>overlap = min_dist - dist</code> — How much they're overlapping (e.g., if they need 56px apart but are only 40px apart, overlap = 16px).</span>
<span class="line-explain"><code>nx, ny = dx/dist, dy/dist</code> — Normalize the direction vector (make it length 1) so we can push in the right direction.</span>
<span class="line-explain"><strong>Return:</strong> Push the player's position outward along that direction by the overlap amount. Return <code>True</code> meaning "collision was resolved."</span>
</div>

### 2. Section Unlock on Lesson Completion

```python
# api/snakes_extended.py
if lesson_number not in record.completed_lessons:
    record.completed_lessons.append(lesson_number)
    record.total_bullets += bullets_earned
    if len(set(record.completed_lessons)) >= 5 and 'half2' not in record.unlocked_sections:
        record.unlocked_sections.append('half2')
```

<div class="snippet-explain">
<strong>What this does:</strong>
<span class="line-explain"><code>if lesson_number not in record.completed_lessons</code> — Only process if this lesson hasn't been completed before (prevents exploiting the same lesson for infinite bullets).</span>
<span class="line-explain"><code>record.completed_lessons.append(lesson_number)</code> — Add this lesson number (e.g., 3) to the player's completed list. Since this is a <code>MutableList</code> column, SQLAlchemy detects the change and will save it to the database.</span>
<span class="line-explain"><code>record.total_bullets += bullets_earned</code> — Add the bullet reward to the player's total.</span>
<span class="line-explain"><code>len(set(record.completed_lessons)) >= 5</code> — <code>set()</code> removes duplicates, then check if they've completed at least 5 unique lessons. If yes, and <code>'half2'</code> isn't already unlocked, unlock it. This is the <strong>gating logic</strong> — you can't skip to the questions without finishing all lessons first.</span>
</div>

### 3. Admin Dashboard Aggregation

```python
# api/admin.py
@admin_api.route('/dashboard', methods=['GET'])
@admin_required()
def admin_dashboard():
    total_users = User.query.count()
    total_players = GameProgress.query.count()
    total_bullets = db.session.query(db.func.sum(GameProgress.bullets)).scalar() or 0
```

<div class="snippet-explain">
<strong>What this does:</strong> This powers the admin dashboard with site-wide statistics.
<span class="line-explain"><code>@admin_required()</code> — Two checks happen before this function runs: (1) is the user logged in? (2) is their role <code>'Admin'</code>? If either fails, the request is rejected with 403 Forbidden.</span>
<span class="line-explain"><code>User.query.count()</code> — SQL <code>SELECT COUNT(*) FROM users</code> — counts every registered user.</span>
<span class="line-explain"><code>db.func.sum(GameProgress.bullets).scalar()</code> — SQL <code>SELECT SUM(bullets) FROM game_progress</code> — adds up all bullets across all players. <code>.scalar()</code> extracts a single number from the result. <code>or 0</code> returns 0 if there are no records (instead of <code>None</code>).</span>
</div>

---

## Summary

| Layer | Technology | What It Does |
|---|---|---|
| **Frontend** | Jekyll + vanilla JS | Static site on GitHub Pages — what users see and interact with |
| **Backend** | Flask + Flask-RESTful | Python web server with 15+ Blueprints and 20+ REST endpoints |
| **Real-time** | Socket.IO + eventlet | Persistent two-way connections for 3 multiplayer game modes |
| **Database** | SQLAlchemy (SQLite/MySQL) | Stores all player progress, game state, and user accounts permanently |
| **Auth** | JWT (PyJWT) + bcrypt | Secure login via encrypted tokens; passwords hashed before storage |
| **Admin** | `@admin_required()` | Role-gated dashboard with site-wide stats and user management |
| **Deployment** | Docker + Gunicorn + Nginx | Containerized app with production server and reverse proxy |
| **Domain** | snakes.opencodingsociety.com | Nginx routes traffic to Docker container with WebSocket support |
