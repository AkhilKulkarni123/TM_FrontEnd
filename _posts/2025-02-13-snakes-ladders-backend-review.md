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
.highlight-box {
    background: rgba(102, 126, 234, 0.1);
    border-left: 4px solid #667eea;
    border-radius: 0 10px 10px 0;
    padding: 14px 18px;
    margin: 16px 0;
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

The frontend (Jekyll static site) makes REST calls and WebSocket connections to the Flask backend running on port **8306**. Gunicorn serves the app with an **eventlet** worker class for async WebSocket support. Nginx reverse-proxies traffic from `snakes.opencodingsociety.com` to the container. SQLAlchemy handles all database operations.

---

## App Routes & Blueprint Registration

The backend registers **15+ Flask Blueprints** in `main.py`, each handling a domain:

```python
# main.py — Blueprint registration
app.register_blueprint(snakes_game_api)   # /api/snakes — core game CRUD
app.register_blueprint(snakes_bp)         # /api/snakes — extended endpoints
app.register_blueprint(admin_api)         # /api/admin  — admin dashboard
app.register_blueprint(boss_api)          # /api/boss   — boss battle rooms
app.register_blueprint(game_api)          # /api/game   — game progress
app.register_blueprint(user_api)          # /api/user   — user management
```

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

The `@token_required()` decorator extracts the user from the JWT payload and stores it in Flask's `g.current_user` context. Every game API call goes through this — associating data with the correct `SnakesGameData` record. **Guest mode** bypasses auth and uses `sessionStorage` (no server persistence).

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

The server enforces **section gating**: `unlocked_sections` progresses from `['half1']` → `['half1','half2']` (after 5 lessons) → `['half1','half2','boss']` (after reaching square 56). The backend validates every transition server-side — clients cannot skip ahead.

### Real-Time Multiplayer (Socket.IO)

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

**WebSocket JWT auth** — Socket connections authenticate via cookies using `_resolve_socket_user()`:

```python
# socketio_handlers/slitherrush_events.py
def _resolve_socket_user():
    token = request.cookies.get(current_app.config.get('JWT_TOKEN_NAME', 'jwt'))
    if not token: return None
    decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    return User.query.filter_by(_uid=decoded.get('_uid')).first()
```

---

## Database Design

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
    selected_character    = db.Column(db.String(50))    # knight/wizard/archer/warrior
    visited_squares       = db.Column(MutableList)      # JSON array [7, 12, 23, ...]
    completed_lessons     = db.Column(MutableList)      # JSON array [1, 2, 3, 4, 5]
    unlocked_sections     = db.Column(MutableList)      # ['half1'] → ['half1','half2','boss']
    boss_battle_attempts  = db.Column(db.Integer, default=0)
    game_status     = db.Column(db.String(20), default='active')  # 'active' or 'completed'
    completed_at    = db.Column(db.DateTime, nullable=True)
    last_updated    = db.Column(db.DateTime, auto-updated)
```

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

Key design decisions:
- **One game record per user** (`user_id` is unique) — prevents duplicate state
- **MutableList JSON columns** for `visited_squares`, `completed_lessons`, `unlocked_sections` — enables in-place list mutation without separate join tables
- **`last_updated` auto-timestamp** — powers the "active players" query (players updated within 10 seconds)
- **`completed_at` nullable** — only set when `game_status` flips to `'completed'`, used for Hall of Champions ordering

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

---

## Admin Panel

The admin panel provides a dashboard at `/api/admin/dashboard` with aggregated stats:

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

**Admin capabilities:**
- View total users, active players, total bullets earned, total time played
- List all player progress records with game state details
- Create, edit, and delete user accounts
- View boss battle statistics (rooms, players, completion rates)

---

## Docker & Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir gunicorn eventlet

COPY . /app

# Eventlet worker for WebSocket support
ENV GUNICORN_CMD_ARGS="--worker-class eventlet --workers=1 \
    --bind=0.0.0.0:8306 --timeout=120"

EXPOSE 8306
CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", \
     "--bind", "0.0.0.0:8306", "main:app"]
```

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

### Common Docker Commands

```bash
# Build and start the container
docker-compose up --build -d

# View logs
docker-compose logs -f web

# Restart after code changes
docker-compose down && docker-compose up --build -d

# Shell into the running container
docker exec -it <container_id> /bin/bash

# Check container status
docker ps

# Rebuild without cache (clean build)
docker-compose build --no-cache

# View resource usage
docker stats
```

### Nginx Reverse Proxy

Nginx routes traffic from the domain to the Docker container:

```nginx
server {
    listen 80;
    server_name snakes.opencodingsociety.com;

    location / {
        proxy_pass http://localhost:8306;
        proxy_http_version 1.1;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

The `Upgrade` and `Connection` headers are critical — without them, Socket.IO WebSocket connections fall back to long-polling.

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

**Server-authoritative collision resolution:**

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

**Section unlock on lesson completion:**

```python
# api/snakes_extended.py
if lesson_number not in record.completed_lessons:
    record.completed_lessons.append(lesson_number)
    record.total_bullets += bullets_earned
    if len(set(record.completed_lessons)) >= 5 and 'half2' not in record.unlocked_sections:
        record.unlocked_sections.append('half2')
```

**Admin dashboard aggregation:**

```python
# api/admin.py
@admin_api.route('/dashboard', methods=['GET'])
@admin_required()
def admin_dashboard():
    total_users = User.query.count()
    total_players = GameProgress.query.count()
    total_bullets = db.session.query(db.func.sum(GameProgress.bullets)).scalar() or 0
```

---

## Summary

| Layer | Technology | Key Detail |
|---|---|---|
| **Frontend** | Jekyll + vanilla JS | Static site on GitHub Pages |
| **Backend** | Flask + Flask-RESTful | 15+ Blueprints, 20+ REST endpoints |
| **Real-time** | Socket.IO + eventlet | 30Hz tick loop, 3 multiplayer modes |
| **Database** | SQLAlchemy (SQLite/MySQL) | MutableList JSON columns, auto-timestamps |
| **Auth** | JWT (PyJWT) | HttpOnly cookies, `@token_required()` decorator |
| **Admin** | `@admin_required()` | Dashboard stats, user CRUD, player management |
| **Deployment** | Docker + Gunicorn + Nginx | eventlet worker, port 8306, auto-restart |
| **Domain** | snakes.opencodingsociety.com | Nginx reverse proxy with WebSocket upgrade |
