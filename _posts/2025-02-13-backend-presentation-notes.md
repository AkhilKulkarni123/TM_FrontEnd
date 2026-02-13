---
layout: post
title: "Backend Presentation Speaking Notes"
description: What to say when presenting each section of the Snakes & Ladders backend review blog.
permalink: /issues/new
toc: true
comments: false
categories: ['Backend', 'Presentation']
---

<style>
.say-box {
    background: rgba(102, 126, 234, 0.08);
    border-left: 4px solid #667eea;
    border-radius: 0 12px 12px 0;
    padding: 16px 20px;
    margin: 12px 0 24px 0;
    font-size: 0.92em;
    line-height: 1.75;
    color: #e0e0e0;
}
.say-box strong { color: #4facfe; }
.say-box code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-size: 0.88em; }
.section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 32px;
}
.section-num {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.85em;
    flex-shrink: 0;
}
.ref-link {
    display: inline-block;
    margin-top: 6px;
    font-size: 0.8em;
    opacity: 0.6;
    font-style: italic;
}
.tip-box {
    background: rgba(67, 233, 123, 0.06);
    border: 1px solid rgba(67, 233, 123, 0.2);
    border-radius: 10px;
    padding: 12px 16px;
    margin: 10px 0;
    font-size: 0.85em;
}
.tip-box strong { color: #43e97b; }
</style>

**Blog being presented:** [/snakes-ladders-backend-review](/snakes-ladders-backend-review)
**Live game:** [snakes.opencodingsociety.com](https://snakes.opencodingsociety.com)

<div class="tip-box">
<strong>How to use this page:</strong> Each section below matches a section on the backend review blog. The quoted text is what you can say out loud to your teacher. Open the blog on screen and scroll to each section as you speak.
</div>

---

<div class="section-header"><span class="section-num">1</span><h2 id="backend-team" style="margin:0">Backend Team</h2></div>
<span class="ref-link">Blog section: "Backend Team"</span>

<div class="say-box">
Moiz was our lead deployer — he handled getting the app onto the server, setting up Docker and Nginx, building the JWT authentication system, and configuring CORS so our frontend could talk to the backend securely. Arnav was the assistant backend developer — he worked on writing the API endpoints, creating the database models for boss battles, and building out the server-side game logic like collision detection and powerup spawning.
</div>

---

<div class="section-header"><span class="section-num">2</span><h2 id="architecture" style="margin:0">System Architecture</h2></div>
<span class="ref-link">Blog section: "System Architecture Overview" — point at the diagram as you talk</span>

<div class="say-box">
This diagram shows how all the pieces of our app connect, top to bottom.<br><br>

At the top is our <strong>Jekyll frontend</strong> — that's the website users actually see. It's a static site hosted on GitHub Pages, meaning it's just HTML, CSS, and JavaScript with no server logic. When a player does something like complete a lesson or answer a question, the frontend sends a request down to our backend.<br><br>

The backend has two parts. The <strong>Flask REST API</strong> handles normal requests — the frontend sends a request to a URL like <code>/api/snakes/complete-lesson</code>, Flask runs the Python function for that URL, does whatever database work is needed, and sends back a JSON response. Think of it like ordering at a restaurant: the frontend places the order, Flask is the kitchen that processes it, and the JSON response is the food that comes back.<br><br>

Next to Flask is <strong>Socket.IO</strong>, which handles real-time multiplayer. Normal HTTP is like texting — you send a message, get a reply, and the conversation ends. Socket.IO opens a phone call that stays open, so the server can push updates to every player instantly. When Player A moves in the boss battle, the server immediately tells Players B through J where Player A is now, without them having to keep asking.<br><br>

Below that is <strong>SQLAlchemy</strong>, our ORM. ORM stands for Object-Relational Mapping — instead of writing raw SQL like <code>SELECT * FROM users</code>, we write Python like <code>User.query.filter_by(id=5).first()</code>. SQLAlchemy translates our Python classes into database tables automatically.<br><br>

At the bottom is <strong>Docker and Nginx</strong>. Docker packages our entire app — the code, Python, and every library — into a container that runs the same way on any machine. Nginx is a web server that sits in front of our app. When someone visits <code>snakes.opencodingsociety.com</code>, Nginx receives that request on port 80 and forwards it to our Flask container running on port 8306. Gunicorn is the production server that actually runs Flask inside the container.
</div>

---

<div class="section-header"><span class="section-num">3</span><h2 id="routes" style="margin:0">App Routes & Blueprints</h2></div>
<span class="ref-link">Blog section: "App Routes & Blueprint Registration" — point at the code snippet</span>

<div class="say-box">
Routes are how Flask knows what code to run when a request comes in. Every URL in our API maps to a specific Python function. For example, when the frontend hits <code>/api/snakes/leaderboard</code>, Flask matches that URL to the leaderboard function and runs it.<br><br>

We organize these routes using <strong>Blueprints</strong>, which is Flask's way of splitting code into modules. Instead of one massive file with 20+ endpoints, we have separate files: <code>snakes_game.py</code> handles all the game endpoints, <code>admin.py</code> handles the admin dashboard, <code>user.py</code> handles registration and login. Each file defines a Blueprint, and in <code>main.py</code> we register them all with <code>app.register_blueprint()</code>. This keeps the codebase clean and modular — each file has one job.
</div>

---

<div class="section-header"><span class="section-num">4</span><h2 id="endpoints" style="margin:0">API Endpoints</h2></div>
<span class="ref-link">Blog section: "API Endpoints" — scroll through the endpoint tables</span>

<div class="say-box">
Our backend has over 20 REST API endpoints. REST means we use standard HTTP methods — <strong>GET</strong> to read data, <strong>POST</strong> to create or submit data, <strong>PUT</strong> to update existing data, and <strong>DELETE</strong> to remove data.<br><br>

For the game, the core endpoints are all under <code>/api/snakes/</code>. <code>GET /api/snakes/</code> loads your saved progress. <code>PUT /api/snakes/</code> is the autosave — every 10 seconds the frontend sends your current state to the server. <code>POST /complete-lesson</code> marks a lesson as done and awards bullets. <code>POST /answer-question</code> records your answer, updates your board position, and gives bullets if you got it right. <code>GET /leaderboard</code> returns the top 10 players sorted by bullets. <code>GET /champions</code> returns everyone who completed the game for the Hall of Champions.<br><br>

The admin endpoints under <code>/api/admin/</code> are protected — only users with the Admin role can access them. The dashboard aggregates stats like total users, total bullets earned across all players, and boss battle completion rates.<br><br>

For authentication, <code>POST /api/authenticate</code> is the login endpoint — it checks your credentials and returns a JWT token. <code>POST /api/user/</code> registers a new account.
</div>

---

<div class="section-header"><span class="section-num">5</span><h2 id="auth" style="margin:0">Authentication Flow</h2></div>
<span class="ref-link">Blog section: "Authentication Flow" — point at the flow diagram, then the code snippet</span>

<div class="say-box">
When a user logs in, their username and password are sent to <code>POST /api/authenticate</code>. The server checks if the credentials match a record in the database — passwords are hashed with bcrypt, so we never store them as plain text. If valid, the server creates a <strong>JWT</strong> — a JSON Web Token — which is basically an encrypted string containing the user's ID.<br><br>

This token gets stored in an <strong>HttpOnly cookie</strong>. HttpOnly means JavaScript on the page can't read it, which protects against XSS attacks. From that point on, every time the frontend makes an API call, the browser automatically attaches that cookie.<br><br>

On the server side, we have a <code>@token_required()</code> decorator that we put above every endpoint that needs authentication. Before the endpoint's actual code runs, the decorator grabs the JWT from the cookie, decodes it using our secret key, looks up the user in the database, and stores them in <code>g.current_user</code>. It's like a security guard checking your ID before letting you into a building — if the token is missing or tampered with, the request gets rejected.<br><br>

For WebSocket connections, we built <code>_resolve_socket_user()</code> which does the same thing — reads the JWT from the cookie on the socket connection and looks up who the player is. This is how the server knows which player is sending each <code>boss_shoot</code> or <code>slitherrush_input</code> event.
</div>

---

<div class="section-header"><span class="section-num">6</span><h2 id="gating" style="margin:0">Game Progression & Section Gating</h2></div>
<span class="ref-link">Blog section: "Game Progression Pipeline" + "Section Unlocking Logic"</span>

<div class="say-box">
The game enforces a strict order that the backend controls. Every player has an <code>unlocked_sections</code> list in their database record. It starts as just <code>['half1']</code>, meaning you can only access the lesson section.<br><br>

When you complete all 5 lessons, the server checks <code>if len(set(completed_lessons)) >= 5</code> and appends <code>'half2'</code> to your unlocked sections. Now you can access the question board. When you reach square 56, the server appends <code>'boss'</code>, unlocking the battle modes.<br><br>

The key thing is this is <strong>server-enforced</strong>. The frontend hides locked sections visually, but even if someone tried to hack the frontend and call the boss battle endpoints directly, the server would check their <code>unlocked_sections</code> list and reject the request. You can't cheat your way past the progression.
</div>

---

<div class="section-header"><span class="section-num">7</span><h2 id="multiplayer" style="margin:0">Real-Time Multiplayer</h2></div>
<span class="ref-link">Blog section: "Real-Time Multiplayer (Socket.IO)" — point at the three mode cards</span>

<div class="say-box">
We have three multiplayer modes, all running over WebSockets.<br><br>

<strong>Boss Battle</strong> is co-op for up to 10 players. Players join a lobby first where they can chat, then enter the arena. The server allocates spawn positions, tracks everyone's location, handles collision detection between players and the boss, and spawns powerups every 5 seconds. When the boss is defeated, the server aggregates every player's stats — damage dealt, bullets fired, powerups collected — and sends the victory screen.<br><br>

<strong>PvP Arena</strong> is 1v1. The server handles auto-matchmaking — when you click join, <code>get_or_create_open_room()</code> either puts you in an existing room that needs a second player or creates a new one. Both players have to confirm they're ready before the battle starts. The server runs collision detection between the two players and validates all positions.<br><br>

<strong>SlitherRush</strong> is the most technically complex — it's a 32-player snake arena. The entire game simulation runs on the server at <strong>30 frames per second</strong>. Players only send their input — direction and shoot — and the server calculates all movement, bullet physics, collisions, kills, and score. State snapshots are sent to clients at 15fps for rendering, and the leaderboard updates every 450 milliseconds.<br><br>

All three modes are <strong>server-authoritative</strong>, meaning the server is the single source of truth. Players can't cheat by modifying their client because the server calculates everything. If a client says "I'm at position 999,999", the server ignores it and uses its own calculated position.
</div>

---

<div class="section-header"><span class="section-num">8</span><h2 id="database" style="margin:0">Database Design</h2></div>
<span class="ref-link">Blog section: "Database Design" — point at the model code and relationship diagrams</span>

<div class="say-box">
Our main model is <code>SnakesGameData</code>. Think of it like a spreadsheet — each row is one player's save file. The columns store everything: <code>total_bullets</code> which is currency from lessons and questions, <code>current_square</code> which is their board position, <code>lives</code> which starts at 5, <code>visited_squares</code> which is a JSON list of which squares you've been to, <code>completed_lessons</code> which tracks which of the 5 lessons you've finished, and <code>unlocked_sections</code> which controls what parts of the game you can access.<br><br>

We use <strong>MutableList</strong> columns, which are JSON arrays stored in the database. The nice thing is SQLAlchemy automatically detects when we <code>.append()</code> to these lists and saves the changes — we don't need to manually serialize and deserialize.<br><br>

The <code>user_id</code> column has a <strong>foreign key</strong> linking to the Users table and is marked <code>unique=True</code>, so each user gets exactly one game record. That's a <strong>one-to-one relationship</strong>. A SnakesGameData record can have many SquareCompletion records — that's <strong>one-to-many</strong> — because one player visits many squares. Same with BossRoom to BossPlayer: one room holds up to 10 players.
</div>

---

<div class="section-header"><span class="section-num">9</span><h2 id="admin" style="margin:0">Admin Panel</h2></div>
<span class="ref-link">Blog section: "Admin Panel" — point at the code snippet</span>

<div class="say-box">
The admin panel is at <code>/api/admin/dashboard</code> and it's protected by <code>@admin_required()</code>. This decorator first checks if you're logged in using <code>@token_required()</code>, then checks if your role is <code>'Admin'</code>. If you're a regular user, you get a 403 Forbidden error.<br><br>

The dashboard runs SQL aggregation queries — <code>User.query.count()</code> counts total users, <code>db.func.sum(GameProgress.bullets)</code> adds up every player's bullets to show total bullets earned site-wide. Admins can also list all player progress records, create or delete user accounts, and view boss battle statistics.
</div>

---

<div class="section-header"><span class="section-num">10</span><h2 id="docker" style="margin:0">Docker & Deployment</h2></div>
<span class="ref-link">Blog section: "Docker & Deployment" — scroll through Dockerfile, compose, and Nginx snippets</span>

<div class="say-box">
Our <strong>Dockerfile</strong> starts from a Python 3.11-slim base image — "slim" keeps it small by excluding tools we don't need. We copy <code>requirements.txt</code> first and install dependencies as a separate step because Docker caches layers — if we only change our code but not our dependencies, Docker skips reinstalling packages, making rebuilds much faster. Then we copy our actual source code.<br><br>

We use <strong>Gunicorn</strong> as our production server with an <strong>eventlet</strong> worker. Eventlet is an async library that lets one server handle many WebSocket connections at the same time. We specifically use 1 worker because Socket.IO keeps game state in memory — if we had multiple workers, each would have its own separate copy of the game rooms and players wouldn't be able to see each other.<br><br>

The <strong>docker-compose.yml</strong> defines how to run the container. The <code>volumes</code> line is critical — it mounts the <code>instance/</code> folder from the host machine into the container, so our SQLite database file persists even when we rebuild the container. <code>restart: unless-stopped</code> means Docker automatically restarts the container if it crashes.<br><br>

Common commands we use: <code>docker-compose up --build -d</code> to build and start, <code>docker-compose logs -f web</code> to watch live logs, and <code>docker exec -it &lt;id&gt; /bin/bash</code> to open a shell inside the container for debugging.<br><br>

<strong>Nginx</strong> acts as a reverse proxy. Users visit <code>snakes.opencodingsociety.com</code> on port 80, and Nginx forwards those requests to Flask on port 8306. The key lines in the Nginx config are the <code>Upgrade</code> and <code>Connection "upgrade"</code> headers — without these, WebSocket connections fail and Socket.IO falls back to slow HTTP polling. These headers tell Nginx to upgrade the connection from a normal one-time request to a persistent two-way WebSocket connection.
</div>

---

<div class="section-header"><span class="section-num">11</span><h2 id="lifecycle" style="margin:0">Request Lifecycle</h2></div>
<span class="ref-link">Blog section: "Request Lifecycle" — trace through each box in the flow diagram</span>

<div class="say-box">
Let me walk through what happens when a player rolls the dice and lands on square 23 with a correct answer.<br><br>

First, the <strong>browser</strong> sends <code>POST /api/snakes/answer-question</code> with the data: square 23, correct is true, 5 bullets earned. <strong>Nginx</strong> receives this at <code>snakes.opencodingsociety.com</code> and forwards it to localhost port 8306. <strong>Gunicorn</strong> hands it to <strong>Flask</strong>, which matches the URL to the <code>answer_question()</code> function in the snakes blueprint.<br><br>

Before that function runs, the <strong><code>@token_required</code> decorator</strong> kicks in — it reads the JWT cookie, decodes the token, and loads the user from the database. Now Flask knows who this player is.<br><br>

The function then uses <strong>SQLAlchemy</strong> to find that player's <code>SnakesGameData</code> record, updates <code>current_square</code> to 23, appends 23 to <code>visited_squares</code>, adds 5 to <code>total_bullets</code>, and commits to the database. Finally, it sends back a <strong>JSON response</strong> with the full updated game state.
</div>

---

<div class="section-header"><span class="section-num">12</span><h2 id="mp-flow" style="margin:0">Multiplayer Data Flow</h2></div>
<span class="ref-link">Blog section: "Multiplayer Data Flow" — trace through the flow diagram</span>

<div class="say-box">
For multiplayer, the flow is: player presses a key or clicks, the browser emits a Socket.IO event, the server validates the action by checking bounds and running collision detection, then broadcasts the result to every player in that room, and all clients update their canvas.<br><br>

In Boss Battle specifically, this happens 20 times per second. Player A presses W and clicks to shoot — the browser sends <code>boss_player_move</code> and <code>boss_shoot</code>. The server runs <code>resolve_player_collision()</code> to make sure nobody is overlapping, checks the bullet trajectory against the boss hitbox, and sends the validated state to all 10 players in the room.
</div>

---

<div class="section-header"><span class="section-num">13</span><h2 id="college-board" style="margin:0">College Board Requirements</h2></div>
<span class="ref-link">Blog section: "College Board AP CSP Requirements" — point at each card as you talk</span>

<div class="say-box">
Our project hits every AP CSP Big Idea requirement.<br><br>

<strong>Input</strong> — keyboard WASD for movement, mouse for aiming, clicks for shooting and answering questions, all sent to the backend.<br><br>

<strong>Data Storage</strong> — SQLAlchemy persists everything to the database. Your progress, bullets, lessons, visited squares all survive across sessions.<br><br>

<strong>Sequencing</strong> — the section gating system. Lessons before questions before boss, enforced server-side.<br><br>

<strong>Selection</strong> — if statements everywhere: <code>if correct: award bullets</code>, <code>if square >= 56: unlock boss</code>, <code>if bossHealth <= 0: trigger victory</code>.<br><br>

<strong>Iteration</strong> — the SlitherRush 30Hz tick loop iterates every arena, player, and bullet each frame. Autosave runs on a 10-second interval. Position broadcasting every 50ms.<br><br>

<strong>Lists</strong> — <code>visited_squares[]</code>, <code>completed_lessons[]</code>, <code>unlocked_sections[]</code> are all JSON lists stored in the database and manipulated with <code>.append()</code>.<br><br>

<strong>Procedures</strong> — <code>resolve_player_collision()</code> takes 5 parameters and returns adjusted coordinates. The <code>@token_required()</code> decorator is a procedure with nested functions.<br><br>

<strong>Algorithms</strong> — collision detection uses the distance formula, which is the Pythagorean theorem. Boss AI switches between movement patterns. SlitherRush bullet-hit detection uses squared-distance optimization for performance.<br><br>

<strong>The Internet</strong> — REST APIs over HTTP/HTTPS, WebSockets for real-time, JWT for auth, CORS for cross-origin security, Nginx for reverse proxying.<br><br>

<strong>Impact</strong> — the game teaches CS ethics and data privacy through its lesson content. Guest mode shows data minimization — no personal data is stored without authentication.
</div>

---

<div class="section-header"><span class="section-num">14</span><h2 id="cpt" style="margin:0">CPT Mapping</h2></div>
<span class="ref-link">Blog section: "CPT (Create Performance Task) Mapping" — point at the table</span>

<div class="say-box">
For the Create Performance Task specifically:<br><br>

Our <strong>program purpose</strong> is teaching AP CSP through gamified learning. <strong>Input to output</strong> — answering questions produces bullet rewards, keyboard and mouse input produces character movement and shooting.<br><br>

For <strong>list usage</strong>, <code>visited_squares[]</code> tracks which question squares you've answered so you can't re-answer them, and <code>completed_lessons[]</code> gates progression — the server checks its length to decide whether to unlock the next section.<br><br>

Our <strong>procedure with parameters</strong> is <code>resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)</code> — 5 parameters. It uses the Pythagorean theorem to calculate distance, checks if players are overlapping, and returns the adjusted position.<br><br>

Our <strong>algorithm combining sequencing, selection, and iteration</strong> is <code>_step_bullets()</code> in SlitherRush. It sequences through bullet position updates, iterates every bullet against every player in the arena, and uses selection — an if-statement distance check — to determine if a bullet hit someone.
</div>

---

<div class="section-header"><span class="section-num">15</span><h2 id="code-snippets" style="margin:0">Code Snippets</h2></div>
<span class="ref-link">Blog section: "Key Backend Code Snippets" — walk through each one</span>

<div class="say-box">
<strong>The collision resolution function</strong> — this checks if two players are overlapping and pushes them apart. It calculates the distance between two positions using the Pythagorean theorem with <code>math.sqrt(dx*dx + dy*dy)</code>. If the distance is less than the minimum allowed, it calculates how much they overlap, normalizes the direction, and pushes the player outward by the overlap amount. This runs on the server so no one can cheat.<br><br>

<strong>The section unlock code</strong> — when a player completes a lesson, first it checks if they've already completed it to prevent exploiting the same lesson for infinite bullets. Then it appends the lesson number to <code>completed_lessons</code> and adds the bullet reward. The if-statement <code>len(set(completed_lessons)) >= 5</code> uses <code>set()</code> to remove duplicates and checks if they've done all 5 unique lessons. If yes, it unlocks the <code>'half2'</code> section.<br><br>

<strong>The admin dashboard</strong> — protected by <code>@admin_required()</code> which chains two checks: are you logged in, and are you an admin. Then it runs SQL aggregation: <code>User.query.count()</code> for total users, <code>db.func.sum()</code> to add up all bullets across every player. The <code>.scalar()</code> extracts a single number, and <code>or 0</code> handles empty tables gracefully.
</div>
