# Backend Review Presentation — Snakes & Ladders

**Blog:** `/snakes-ladders-backend-review`
**Live site:** [snakes.opencodingsociety.com](https://snakes.opencodingsociety.com)

---

## Presenting: What to Say for Each Section

### 1. Backend Team

> Moiz was our lead deployer — he handled getting the app onto the server, setting up Docker and Nginx, building the JWT authentication system, and configuring CORS so our frontend could talk to the backend securely. Arnav was the assistant backend developer — he worked on writing the API endpoints, creating the database models for boss battles, and building out the server-side game logic like collision detection and powerup spawning.

---

### 2. System Architecture (the diagram)

> This diagram shows how all the pieces of our app connect, top to bottom.
>
> At the top is our **Jekyll frontend** — that's the website users actually see. It's a static site hosted on GitHub Pages, meaning it's just HTML, CSS, and JavaScript with no server logic. When a player does something like complete a lesson or answer a question, the frontend sends a request down to our backend.
>
> The backend has two parts. The **Flask REST API** handles normal requests — the frontend sends a request to a URL like `/api/snakes/complete-lesson`, Flask runs the Python function for that URL, does whatever database work is needed, and sends back a JSON response. Think of it like ordering at a restaurant: the frontend places the order, Flask is the kitchen that processes it, and the JSON response is the food that comes back.
>
> Next to Flask is **Socket.IO**, which handles real-time multiplayer. Normal HTTP is like texting — you send a message, get a reply, and the conversation ends. Socket.IO opens a phone call that stays open, so the server can push updates to every player instantly. When Player A moves in the boss battle, the server immediately tells Players B through J where Player A is now, without them having to keep asking.
>
> Below that is **SQLAlchemy**, our ORM. ORM stands for Object-Relational Mapping — instead of writing raw SQL like `SELECT * FROM users`, we write Python like `User.query.filter_by(id=5).first()`. SQLAlchemy translates our Python classes into database tables automatically, so the `SnakesGameData` class becomes the `snakes_game_data` table.
>
> At the bottom is **Docker and Nginx**. Docker packages our entire app — the code, Python, and every library — into a container that runs the same way on any machine. Nginx is a web server that sits in front of our app. When someone visits `snakes.opencodingsociety.com`, Nginx receives that request on port 80 and forwards it to our Flask container running on port 8306. Gunicorn is the production server that actually runs Flask inside the container.

---

### 3. App Routes & Blueprints

> Routes are how Flask knows what code to run when a request comes in. Every URL in our API maps to a specific Python function. For example, when the frontend hits `/api/snakes/leaderboard`, Flask matches that URL to the leaderboard function and runs it.
>
> We organize these routes using **Blueprints**, which is Flask's way of splitting code into modules. Instead of one massive file with 20+ endpoints, we have separate files: `snakes_game.py` handles all the game endpoints, `admin.py` handles the admin dashboard, `user.py` handles registration and login. Each file defines a Blueprint, and in `main.py` we register them all with `app.register_blueprint()`. This keeps the codebase clean and modular — each file has one job.

---

### 4. API Endpoints

> Our backend has over 20 REST API endpoints. REST means we use standard HTTP methods — **GET** to read data, **POST** to create or submit data, **PUT** to update existing data, and **DELETE** to remove data.
>
> For the game, the core endpoints are all under `/api/snakes/`. `GET /api/snakes/` loads your saved progress. `PUT /api/snakes/` is the autosave — every 10 seconds the frontend sends your current state to the server. `POST /complete-lesson` marks a lesson as done and awards bullets. `POST /answer-question` records your answer, updates your board position, and gives bullets if you got it right. `GET /leaderboard` returns the top 10 players sorted by bullets. `GET /champions` returns everyone who completed the game for the Hall of Champions.
>
> The admin endpoints under `/api/admin/` are protected — only users with the Admin role can access them. The dashboard aggregates stats like total users, total bullets earned across all players, and boss battle completion rates.
>
> For authentication, `POST /api/authenticate` is the login endpoint — it checks your credentials and returns a JWT token. `POST /api/user/` registers a new account.

---

### 5. Authentication Flow

> When a user logs in, their username and password are sent to `POST /api/authenticate`. The server checks if the credentials match a record in the database — passwords are hashed with bcrypt, so we never store them as plain text. If valid, the server creates a **JWT** — a JSON Web Token — which is basically an encrypted string containing the user's ID.
>
> This token gets stored in an **HttpOnly cookie**. HttpOnly means JavaScript on the page can't read it, which protects against XSS attacks. From that point on, every time the frontend makes an API call, the browser automatically attaches that cookie.
>
> On the server side, we have a `@token_required()` decorator that we put above every endpoint that needs authentication. Before the endpoint's actual code runs, the decorator grabs the JWT from the cookie, decodes it using our secret key, looks up the user in the database, and stores them in `g.current_user`. It's like a security guard checking your ID before letting you into a building — if the token is missing or tampered with, the request gets rejected.
>
> For WebSocket connections, we built `_resolve_socket_user()` which does the same thing — reads the JWT from the cookie on the socket connection and looks up who the player is. This is how the server knows which player is sending each `boss_shoot` or `slitherrush_input` event.

---

### 6. Game Progression & Section Gating

> The game enforces a strict order that the backend controls. Every player has an `unlocked_sections` list in their database record. It starts as just `['half1']`, meaning you can only access the lesson section.
>
> When you complete all 5 lessons, the server checks `if len(set(completed_lessons)) >= 5` and appends `'half2'` to your unlocked sections. Now you can access the question board. When you reach square 56, the server appends `'boss'`, unlocking the battle modes.
>
> The key thing is this is **server-enforced**. The frontend hides locked sections visually, but even if someone tried to hack the frontend and call the boss battle endpoints directly, the server would check their `unlocked_sections` list and reject the request. You can't cheat your way past the progression.

---

### 7. Real-Time Multiplayer (Socket.IO)

> We have three multiplayer modes, all running over WebSockets.
>
> **Boss Battle** is co-op for up to 10 players. Players join a lobby first where they can chat, then enter the arena. The server allocates spawn positions, tracks everyone's location, handles collision detection between players and the boss, and spawns powerups every 5 seconds. When the boss is defeated, the server aggregates every player's stats — damage dealt, bullets fired, powerups collected — and sends the victory screen.
>
> **PvP Arena** is 1v1. The server handles auto-matchmaking — when you click join, `get_or_create_open_room()` either puts you in an existing room that needs a second player or creates a new one. Both players have to confirm they're ready before the battle starts. The server runs collision detection between the two players and validates all positions.
>
> **SlitherRush** is the most technically complex — it's a 32-player snake arena. The entire game simulation runs on the server at **30 frames per second**. Players only send their input (direction and shoot), and the server calculates all movement, bullet physics, collisions, kills, and score. State snapshots are sent to clients at 15fps for rendering, and the leaderboard updates every 450 milliseconds.
>
> All three modes are **server-authoritative**, meaning the server is the single source of truth. Players can't cheat by modifying their client because the server calculates everything. If a client says "I'm at position 999,999", the server ignores it and uses its own calculated position.

---

### 8. Database Design

> Our main model is `SnakesGameData`. Think of it like a spreadsheet — each row is one player's save file. The columns store everything: `total_bullets` (currency from lessons and questions), `current_square` (board position), `lives` (starts at 5), `visited_squares` (a JSON list of which squares you've been to), `completed_lessons` (which of the 5 lessons you've finished), and `unlocked_sections` (which parts of the game you can access).
>
> We use **MutableList** columns, which are JSON arrays stored in the database. The nice thing is SQLAlchemy automatically detects when we `.append()` to these lists and saves the changes — we don't need to manually serialize and deserialize.
>
> The `user_id` column has a **foreign key** linking to the Users table and is marked `unique=True`, so each user gets exactly one game record. That's a **one-to-one relationship**. A SnakesGameData record can have many SquareCompletion records — that's **one-to-many** — because one player visits many squares. Same with BossRoom to BossPlayer: one room holds up to 10 players.

---

### 9. Admin Panel

> The admin panel is at `/api/admin/dashboard` and it's protected by `@admin_required()`. This decorator first checks if you're logged in using `@token_required()`, then checks if your role is `'Admin'`. If you're a regular user, you get a 403 Forbidden error.
>
> The dashboard runs SQL aggregation queries — `User.query.count()` counts total users, `db.func.sum(GameProgress.bullets)` adds up every player's bullets to show total bullets earned site-wide. Admins can also list all player progress records, create or delete user accounts, and view boss battle statistics.

---

### 10. Docker & Deployment

> Our **Dockerfile** starts from a Python 3.11-slim base image — "slim" keeps it small by excluding tools we don't need. We copy `requirements.txt` first and install dependencies as a separate step because Docker caches layers — if we only change our code but not our dependencies, Docker skips reinstalling packages, making rebuilds much faster. Then we copy our actual source code.
>
> We use **Gunicorn** as our production server with an **eventlet** worker. Eventlet is an async library that lets one server handle many WebSocket connections at the same time. We specifically use 1 worker because Socket.IO keeps game state in memory — if we had multiple workers, each would have its own separate copy of the game rooms and players wouldn't be able to see each other.
>
> The **docker-compose.yml** defines how to run the container. The `volumes` line is critical — it mounts the `instance/` folder from the host machine into the container, so our SQLite database file persists even when we rebuild. `restart: unless-stopped` means Docker automatically restarts the container if it crashes.
>
> Common commands we use: `docker-compose up --build -d` to build and start, `docker-compose logs -f web` to watch live logs, and `docker exec -it <id> /bin/bash` to open a shell inside the container for debugging.
>
> **Nginx** acts as a reverse proxy. Users visit `snakes.opencodingsociety.com` on port 80, and Nginx forwards those requests to Flask on port 8306. The key lines in the Nginx config are the `Upgrade` and `Connection "upgrade"` headers — without these, WebSocket connections fail and Socket.IO falls back to slow HTTP polling. These headers tell Nginx to upgrade the connection from a normal one-time request to a persistent two-way WebSocket connection.

---

### 11. Request Lifecycle (the visual)

> Let me walk through what happens when a player rolls the dice and lands on square 23 with a correct answer.
>
> First, the **browser** sends `POST /api/snakes/answer-question` with the data: square 23, correct is true, 5 bullets earned. **Nginx** receives this at `snakes.opencodingsociety.com` and forwards it to localhost port 8306. **Gunicorn** hands it to **Flask**, which matches the URL to the `answer_question()` function in the snakes blueprint.
>
> Before that function runs, the **`@token_required` decorator** kicks in — it reads the JWT cookie, decodes the token, and loads the user from the database. Now Flask knows who this player is.
>
> The function then uses **SQLAlchemy** to find that player's `SnakesGameData` record, updates `current_square` to 23, appends 23 to `visited_squares`, adds 5 to `total_bullets`, and commits to the database. Finally, it sends back a **JSON response** with the full updated game state.

---

### 12. Multiplayer Data Flow (the visual)

> For multiplayer, the flow is: player presses a key or clicks → the browser emits a Socket.IO event → the server validates the action (checks bounds, runs collision detection) → broadcasts the result to every player in that room → all clients update their canvas.
>
> In Boss Battle specifically, this happens 20 times per second. Player A presses W and clicks to shoot — the browser sends `boss_player_move` and `boss_shoot`. The server runs `resolve_player_collision()` to make sure nobody is overlapping, checks the bullet trajectory against the boss hitbox, and sends the validated state to all 10 players in the room.

---

### 13. College Board Requirements

> Our project hits every AP CSP Big Idea requirement.
>
> **Input** — keyboard WASD for movement, mouse for aiming, clicks for shooting and answering questions, all sent to the backend.
>
> **Data Storage** — SQLAlchemy persists everything to the database. Your progress, bullets, lessons, visited squares all survive across sessions.
>
> **Sequencing** — the section gating system. Lessons before questions before boss, enforced server-side.
>
> **Selection** — if statements everywhere: `if correct: award bullets`, `if square >= 56: unlock boss`, `if bossHealth <= 0: trigger victory`.
>
> **Iteration** — the SlitherRush 30Hz tick loop iterates every arena, player, and bullet each frame. Autosave runs on a 10-second interval. Position broadcasting every 50ms.
>
> **Lists** — `visited_squares[]`, `completed_lessons[]`, `unlocked_sections[]` are all JSON lists stored in the database and manipulated with `.append()`.
>
> **Procedures** — `resolve_player_collision()` takes 5 parameters and returns adjusted coordinates. The `@token_required()` decorator is a procedure with nested functions.
>
> **Algorithms** — collision detection uses the distance formula (Pythagorean theorem). Boss AI switches between movement patterns. SlitherRush bullet-hit detection uses squared-distance optimization for performance.
>
> **The Internet** — REST APIs over HTTP/HTTPS, WebSockets for real-time, JWT for auth, CORS for cross-origin security, Nginx for reverse proxying.
>
> **Impact** — the game teaches CS ethics and data privacy through its lesson content. Guest mode shows data minimization — no personal data is stored without authentication.

---

### 14. CPT Mapping

> For the Create Performance Task specifically:
>
> Our **program purpose** is teaching AP CSP through gamified learning. **Input to output** — answering questions produces bullet rewards, keyboard and mouse input produces character movement and shooting.
>
> For **list usage**, `visited_squares[]` tracks which question squares you've answered so you can't re-answer them, and `completed_lessons[]` gates progression — the server checks its length to decide whether to unlock the next section.
>
> Our **procedure with parameters** is `resolve_player_collision(desired_x, desired_y, other_x, other_y, min_dist)` — 5 parameters. It uses the Pythagorean theorem to calculate distance, checks if players are overlapping, and returns the adjusted position.
>
> Our **algorithm combining sequencing, selection, and iteration** is `_step_bullets()` in SlitherRush. It sequences through bullet position updates, iterates every bullet against every player in the arena, and uses selection (an if-statement distance check) to determine if a bullet hit someone.
