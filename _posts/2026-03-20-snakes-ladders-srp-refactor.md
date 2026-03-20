---
layout: post
title: "Snakes & Ladders - SRP Code Refactor Blog"
description: A detailed walkthrough of applying the Single Responsibility Principle across our Snakes and Ladders game codebase, with before-and-after code snippets.
permalink: /snakes-ladders-srp-refactor
toc: true
comments: true
categories: ['Game Development', 'Code Quality']
---

## Why We Refactored for SRP

The **Single Responsibility Principle (SRP)** states that every function, class, or module should have exactly **one reason to change**. Our Snakes & Ladders codebase had grown organically and accumulated several violations: functions that serialized *and* deserialized data, functions that built UI *and* managed state, and backend endpoints that mixed validation with business logic. We refactored a good chunk of the codebase to adhere to SRP — without changing a single pixel of UI or line of game behavior.

---

## 1. Progress Serialization & Deserialization (Frontend)

**File:** `TM_FrontEnd/assets/js/snakes-game.js`

### The Problem

`saveGuestProgress()`, `saveDemoProgress()`, `loadGuestProgress()`, and `loadDemoProgress()` each **manually listed the same 12 fields** when converting between `gameState` and a JSON snapshot. This meant four near-identical blocks of property assignments, all with the same responsibility (serialize/deserialize progress) duplicated across functions that each had a *different* primary responsibility (save vs. load, guest vs. demo).

### Old Code (repeated in 4 functions)

```javascript
// Each save function manually built a snapshot:
var guestData = {
    bullets: gameState.bullets,
    currentSquare: gameState.currentSquare,
    visitedSquares: gameState.visitedSquares,
    completedLessons: gameState.completedLessons,
    completedQuestions: gameState.completedQuestions,
    unlockedSections: gameState.unlockedSections,
    lives: gameState.lives,
    timeElapsed: gameState.timeElapsed,
    character: gameState.character,
    weaponType: gameState.weaponType,
    avatarData: gameState.avatarData,
    avatarUrl: gameState.avatarUrl
};

// Each load function manually applied the same fields:
gameState.bullets = data.bullets || 0;
gameState.currentSquare = data.currentSquare || 0;
gameState.visitedSquares = data.visitedSquares || [0];
// ... 9 more lines identical across all load functions
```

### New Code

```javascript
// One function to serialize:
function serializeProgressSnapshot() {
    return {
        bullets: gameState.bullets,
        currentSquare: gameState.currentSquare,
        visitedSquares: gameState.visitedSquares,
        completedLessons: gameState.completedLessons,
        completedQuestions: gameState.completedQuestions,
        unlockedSections: gameState.unlockedSections,
        lives: gameState.lives,
        timeElapsed: gameState.timeElapsed,
        character: gameState.character,
        weaponType: gameState.weaponType,
        avatarData: gameState.avatarData,
        avatarUrl: gameState.avatarUrl
    };
}

// One function to deserialize:
function applyProgressSnapshot(data) {
    gameState.bullets = data.bullets || 0;
    gameState.currentSquare = data.currentSquare || 0;
    gameState.visitedSquares = data.visitedSquares || [0];
    gameState.completedLessons = data.completedLessons || [];
    gameState.completedQuestions = data.completedQuestions || [];
    gameState.unlockedSections = data.unlockedSections || ['half1'];
    gameState.lives = data.lives || BASE_MAX_LIVES;
    gameState.timeElapsed = data.timeElapsed || 0;
    if (data.character) gameState.character = data.character;
    gameState.weaponType = resolveWeaponType(gameState.character, data.weaponType);
    if (data.avatarData) gameState.avatarData = data.avatarData;
    if (data.avatarUrl) gameState.avatarUrl = data.avatarUrl;
    applyCharacterPerks();
}

// Now save/load are each one-liners:
function saveGuestProgress() {
    if (!gameState.isGuest) return;
    try {
        sessionStorage.setItem('snakes_guest_progress',
            JSON.stringify(serializeProgressSnapshot()));
    } catch (e) { console.error('Error saving guest progress:', e); }
}

function loadGuestProgress() {
    try {
        var stored = sessionStorage.getItem('snakes_guest_progress');
        if (stored) { applyProgressSnapshot(JSON.parse(stored)); return true; }
    } catch (e) { console.error('Error loading guest progress:', e); }
    if (gameState.isDemoMode) return loadDemoProgress();
    return false;
}
```

**Result:** Serialization has one home. Each save/load function now only manages *where* data goes (sessionStorage key choice, fallback logic).

---

## 2. localStorage Cleanup & Landing URL (Frontend)

**File:** `TM_FrontEnd/assets/js/snakes-game.js`

### The Problem

The same block of 9 `localStorage.removeItem()` / `sessionStorage.removeItem()` calls was copy-pasted **5 times** across `autoResumeIfReady()`. Similarly, the landing page URL was rebuilt from `window.location.pathname` in 4 different places.

### Old Code (appeared 5 times)

```javascript
try {
    localStorage.removeItem('snakes_selected_character');
    localStorage.removeItem('snakes_selected_weapon');
    localStorage.removeItem('snakes_avatar_data');
    localStorage.removeItem('snakes_avatar_url');
    localStorage.removeItem('snakes_started');
    localStorage.removeItem('snakes_user_id');
    sessionStorage.removeItem('snakes_isGuest');
    sessionStorage.removeItem('snakes_guest_name');
    sessionStorage.removeItem('snakes_user_id');
} catch (e) {}
var base = window.location.pathname.replace(/\/hacks\/snakes\/.*$/, '');
window.location.replace(base + '/snakes-game');
```

### New Code

```javascript
function clearSnakesLocalStorage() {
    try {
        localStorage.removeItem('snakes_selected_character');
        localStorage.removeItem('snakes_selected_weapon');
        localStorage.removeItem('snakes_avatar_data');
        localStorage.removeItem('snakes_avatar_url');
        localStorage.removeItem('snakes_started');
        localStorage.removeItem('snakes_user_id');
        sessionStorage.removeItem('snakes_isGuest');
        sessionStorage.removeItem('snakes_guest_name');
        sessionStorage.removeItem('snakes_user_id');
    } catch (e) {}
}

function getSnakesLandingUrl() {
    var base = window.location.pathname.replace(/\/hacks\/snakes\/.*$/, '');
    return base + '/snakes-game';
}

// Usage (5 call sites now read like plain English):
clearSnakesLocalStorage();
window.location.replace(getSnakesLandingUrl());
```

**Result:** Storage cleanup has one definition. URL construction has one definition. Each caller only decides *when* to invoke them.

---

## 3. Game Launch UI Transition (Frontend)

**File:** `TM_FrontEnd/assets/js/snakes-game.js`

### The Problem

The sequence of hiding login, showing game container, initializing the timer, autosave, board, HUD, section lock, multiplayer, and bullet refresh was **inlined in 5 different places** (`useExistingLogin`, `startGame`, `autoResumeIfReady` for guest, for localStorage match, and for backend match).

### Old Code (appeared 5 times)

```javascript
var characterSelection = document.getElementById('character-selection');
var gameContainer = document.getElementById('game-container');
var loginContainer = document.getElementById('login-container');
if (characterSelection) characterSelection.classList.add('hidden');
if (gameContainer) gameContainer.classList.remove('hidden');
if (loginContainer) loginContainer.classList.add('hidden');

if (gameState.timeStarted === null)
    gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo();
checkSectionLock(); startMultiplayerRefresh(); startBulletRefresh();
```

### New Code

```javascript
function launchGameplayUI() {
    var characterSelection = document.getElementById('character-selection');
    var gameContainer = document.getElementById('game-container');
    var loginContainer = document.getElementById('login-container');
    if (characterSelection) characterSelection.classList.add('hidden');
    if (gameContainer) gameContainer.classList.remove('hidden');
    if (loginContainer) loginContainer.classList.add('hidden');

    if (gameState.timeStarted === null)
        gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
    startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo();
    checkSectionLock(); startMultiplayerRefresh(); startBulletRefresh();
}

// All 5 call sites now just:
launchGameplayUI();
```

**Result:** The UI transition is defined once. Each caller (login flow, guest flow, auto-resume) just calls it.

---

## 4. Board Rendering Split (Frontend)

**File:** `TM_FrontEnd/assets/js/snakes-game.js`

### The Problem

`createGameBoard()` was a single 120-line function that handled **two completely different board layouts** (Section 1: linear lesson track, Section 2: 5x10 snake/ladder grid) inside one `if/else` block.

### Old Code

```javascript
function createGameBoard() {
    // ... shared setup ...
    if (section === 1) {
        // 55 lines: build linear lesson row
    }
    // 65 lines: build 5x10 grid with snake/ladder classes
    // ... draw SVG connections ...
}
```

### New Code

```javascript
function buildLessonBoard(board) {
    // 50 lines: build linear lesson row only
}

function buildQuestionBoard(board) {
    // 55 lines: build 5x10 grid only
}

function createGameBoard() {
    // ... shared setup (data-scale attributes) ...
    if (section === 1) {
        buildLessonBoard(board);
        return;
    }
    buildQuestionBoard(board);
    // ... draw SVG connections ...
}
```

**Result:** Each board type has its own builder. `createGameBoard` only decides which builder to call.

---

## 5. Leaderboard Rendering Decomposition (Frontend)

**File:** `TM_FrontEnd/assets/js/snakes-game-hint-leaderboard.js`

### The Problem

`viewLeaderboardEnhanced()` was a 130-line function that fetched data, found the user's position, rendered the top-10 section, rendered the user's position with neighbors, and built a synthetic row for unranked users — all in one function.

### Old Code

```javascript
function viewLeaderboardEnhanced() {
    // Show loading state
    // Fetch leaderboard
    // Find current user index
    // Build top 10 rows
    // Build divider + "Your Position" header
    // Build user's row + neighbor rows
    // Build synthetic row for unranked users
    // Error handling
}
```

### New Code

```javascript
function getLeaderboardApiUrl() { ... }
function findCurrentUserIndex(leaderboardData, currentUserId) { ... }
function renderTopTenSection(tbody, leaderboardData, currentUserId) { ... }
function appendYourPositionHeader(tbody) { ... }
function renderUserPositionSection(tbody, leaderboardData, currentUserIndex, currentUserId) { ... }
function renderSyntheticUserRow(tbody, leaderboardData) { ... }

function viewLeaderboardEnhanced() {
    // Show loading, fetch, then:
    renderTopTenSection(tbody, leaderboardData, currentUserId);
    if (currentUserIndex >= 10) {
        renderUserPositionSection(tbody, leaderboardData, currentUserIndex, currentUserId);
    }
    if (currentUserIndex === -1 && currentUserId) {
        renderSyntheticUserRow(tbody, leaderboardData);
    }
}
```

Also extracted a `getRankClass(index)` helper and `LEADERBOARD_CHARACTER_ICONS` constant from `createLeaderboardRow()` to eliminate the repeated if/else rank-class chain.

**Result:** The orchestrator function reads like a recipe. Each rendering step is independently testable.

---

## 6. Model `update()` Field Application (Backend)

**File:** `TM_Flask/model/snakes_game.py`

### The Problem

`update()` did two things: applied field values from a dict onto the model *and* committed the transaction. This made it impossible to apply fields without committing (e.g., in batch operations or tests).

### Old Code

```python
def update(self, data):
    if 'total_bullets' in data:
        self.total_bullets = data['total_bullets']
    if 'time_played' in data:
        self.time_played = data['time_played']
    # ... 9 more if-blocks ...
    db.session.commit()
    return self
```

### New Code

```python
UPDATABLE_FIELDS = [
    'total_bullets', 'time_played', 'current_square',
    'boss_battle_attempts', 'selected_character', 'username',
    'visited_squares', 'completed_lessons', 'unlocked_sections',
    'lives', 'game_status',
]

def apply_fields(self, data):
    """Apply matching fields from data without committing."""
    for field in self.UPDATABLE_FIELDS:
        if field in data:
            setattr(self, field, data[field])
    return self

def update(self, data):
    """Apply fields and persist."""
    self.apply_fields(data)
    db.session.commit()
    return self
```

**Result:** Field application and persistence are separate concerns. `apply_fields` can be used in batch operations, and `UPDATABLE_FIELDS` is a single source of truth for which fields are mutable.

---

## 7. API Endpoint Logic Extraction (Backend)

**Files:** `TM_Flask/api/snakes_game.py`, `TM_Flask/api/snakes_extended.py`

### The Problem

Several API endpoints mixed input validation, business logic, serialization, and HTTP response construction into a single method body.

### Changes Made

| Endpoint | Extracted Function | Responsibility |
|---|---|---|
| `POST /reset` | `_reset_game_fields(game_data)` | Reset all mutable progress fields to defaults |
| `POST /complete-lesson` | `_is_valid_lesson_number(n)` | Validate lesson number is int 1-5 |
| `POST /complete-lesson` | `_apply_lesson_completion(record, ...)` | Mark lesson complete, award bullets, unlock Section 2 |
| `POST /answer-question` | `_is_valid_question_square(sq)` | Validate square is in question section range |
| `POST /answer-question` | `_apply_question_result(record, ...)` | Update position, visited list, bullets, boss unlock |
| `GET /active-players` | `_serialize_active_player(player)` | Serialize one player record to JSON dict |
| `GET /champions` | `_serialize_champion(champion)` | Serialize one champion record to JSON dict |

### Example: Reset Progress

**Old:**
```python
class ResetProgressAPI(Resource):
    def post(self):
        # ... lookup ...
        game_data.current_square = 1
        game_data.visited_squares = [1]
        game_data.total_bullets = 0
        game_data.time_played = 0.0
        game_data.lives = 5
        game_data.boss_battle_attempts = 0
        game_data.completed_lessons = []
        game_data.unlocked_sections = ['half1']
        game_data.selected_character = 'default'
        game_data.game_status = 'active'
        db.session.commit()
        # ... response ...
```

**New:**
```python
def _reset_game_fields(game_data):
    """Reset all mutable game progress fields to their defaults."""
    game_data.current_square = 1
    game_data.visited_squares = [1]
    game_data.total_bullets = 0
    game_data.time_played = 0.0
    game_data.lives = 5
    game_data.boss_battle_attempts = 0
    game_data.completed_lessons = []
    game_data.unlocked_sections = ['half1']
    game_data.selected_character = 'default'
    game_data.game_status = 'active'

class ResetProgressAPI(Resource):
    def post(self):
        # ... lookup ...
        _reset_game_fields(game_data)
        db.session.commit()
        # ... response ...
```

**Result:** Each endpoint reads as a thin controller: validate, delegate to a focused helper, commit, respond.

---

## Summary of Changes

| File | What Changed | Lines Saved |
|---|---|---|
| `snakes-game.js` | `serializeProgressSnapshot` + `applyProgressSnapshot` extracted | ~60 duplicated lines removed |
| `snakes-game.js` | `clearSnakesLocalStorage` + `getSnakesLandingUrl` extracted | ~45 duplicated lines removed |
| `snakes-game.js` | `launchGameplayUI` extracted | ~40 duplicated lines removed |
| `snakes-game.js` | `buildLessonBoard` + `buildQuestionBoard` split | Single-responsibility board builders |
| `snakes-game-hint-leaderboard.js` | 6 focused rendering helpers extracted | ~80 lines from monolith into named functions |
| `model/snakes_game.py` | `apply_fields` separated from `update` | Field logic reusable without commit |
| `api/snakes_game.py` | `_reset_game_fields`, `_serialize_active_player`, `_serialize_champion` | Business logic separated from HTTP handling |
| `api/snakes_extended.py` | `_is_valid_lesson_number`, `_apply_lesson_completion`, `_is_valid_question_square`, `_apply_question_result` | Validation and business logic separated from endpoints |

**Total: ~20 new focused helper functions extracted, ~225 lines of duplication removed, zero UI or functionality changes.**
