/*
 * Main Snakes game controller.
 * Responsibility:
 * - Owns board progression state (position, visited squares, lessons/questions completed, bullets, lives).
 * - Coordinates login/guest flows, loading/saving progress, and section unlock rules.
 * - Handles turn flow: roll -> move -> resolve square event (lesson, question, snake/ladder, finish checks).
 * - Updates multiplayer board presence, leaderboard access, and boss-entry gating.
 * Fit in overall game:
 * - Works with `player-loadout.js` for character/weapon/avatar profile data.
 * - Works with `snakes-game-hint-leaderboard.js` for enhanced hints/leaderboard presentation.
 * - Uses shared SFX from `snakes/sfx.js` and question mini-game hooks exposed globally.
 */
/*
 * Snakes and Ladders – Custom Game Logic for AP CS Principles
 * Integrated version with question modals and all original features
 */

var API_URL;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    API_URL = "http://localhost:8306/api";  // Local Flask backend
} else {
    API_URL = "https://snakes.opencodingsociety.com/api";  // Deployed backend
}

function getLoginUrl() {
    var path = window.location.pathname || '';
    var base = path.startsWith('/TM_FrontEnd') ? '/TM_FrontEnd' : '';
    return window.location.origin + base + '/login';
}

// Standard fetch options for CORS requests - matches config.js
var fetchOptions = {
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json',
        'X-Origin': 'client'
    }
};
var FIRST_LESSON_COUNT = 5;
var FIRST_SECTION_SIZE = FIRST_LESSON_COUNT + 1;
var SECOND_SECTION_SIZE = 50;
var BOARD_TOTAL_SQUARES = FIRST_SECTION_SIZE + SECOND_SECTION_SIZE + 1;

var LESSON_BULLETS = 5;
var QUESTION_BULLETS = 5;
var AUTOSAVE_EVERY_SECONDS = 10;
var BASE_MAX_LIVES = 5;
var DISPLAY_NAME_KEY = 'snakes_display_name';

// Character perks are passive bonuses displayed in the HUD and applied to stats.
var CHARACTER_PERKS = {
    knight: {
        name: 'Shielded',
        desc: '+1 extra life'
    },
    wizard: {
        name: 'Firebrand',
        desc: 'Double shot'
    },
    archer: {
        name: 'Keen Aim',
        desc: 'Homing bullets'
    },
    warrior: {
        name: 'Bravery',
        desc: 'Slightly higher damage + bleeding effect'
    }
};

var loadoutApi = window.SnakesLoadout || null;
// Fallback weapon metadata used when shared loadout utility is unavailable.
var CHARACTER_WEAPONS = {
    knight: {
        weaponType: 'bulwark-disc',
        weaponName: 'Bulwark Disc',
        weaponDescription: 'Throws a reinforced shield-disc that ricochets off one wall before fading.',
        weaponEffect: 'Bounce'
    },
    wizard: {
        weaponType: 'arcane-orb',
        weaponName: 'Arcane Orb',
        weaponDescription: 'Launches volatile magic that bursts on impact and splashes nearby targets.',
        weaponEffect: 'Splash'
    },
    archer: {
        weaponType: 'piercing-arrow',
        weaponName: 'Piercing Arrow',
        weaponDescription: 'Fires a fast precision bolt with light guidance and excellent travel speed.',
        weaponEffect: 'Piercing'
    },
    warrior: {
        weaponType: 'rage-axe',
        weaponName: 'Rage Axe',
        weaponDescription: 'Hurls a heavy axe that hits hard and tears through front-line defenses.',
        weaponEffect: 'Cleave'
    }
};

function resolveWeaponType(character, explicitWeaponType) {
    if (loadoutApi && typeof loadoutApi.normalizeWeaponType === 'function') {
        return loadoutApi.normalizeWeaponType(character, explicitWeaponType);
    }
    var key = String(character || '').toLowerCase();
    var fallback = CHARACTER_WEAPONS[key] ? CHARACTER_WEAPONS[key].weaponType : 'bulwark-disc';
    return explicitWeaponType || fallback;
}

// Returns weapon label/description payload for UI tooltips and popups.
function getWeaponInfo(character, explicitWeaponType) {
    var key = String(character || '').toLowerCase();
    var base = CHARACTER_WEAPONS[key] || CHARACTER_WEAPONS.knight;
    var resolvedWeaponType = resolveWeaponType(key, explicitWeaponType);
    return {
        weaponType: resolvedWeaponType,
        weaponName: base.weaponName,
        weaponDescription: base.weaponDescription,
        weaponEffect: base.weaponEffect
    };
}

// Core game session state used by nearly every flow in this file.
var gameState = {
    isGuest: false,
    isDemoMode: false,  // Demo mode: data only saved in session, not to backend or leaderboard
    userId: null,
    username: '',
    character: '',
    weaponType: '',
    avatarData: '',
    avatarUrl: '',
    bullets: 0,
    lives: BASE_MAX_LIVES,
    maxLives: BASE_MAX_LIVES,
    currentSquare: 0,
    visitedSquares: [0],
    completedLessons: [],
    completedQuestions: [],  // Track completed question squares for demo mode
    unlockedSections: ['half1'],
    timeStarted: null,
    timeElapsed: 0,
    bossAttempts: 0,
    socket: null
};

// Interval guards to prevent duplicate timers
var timerIntervalId = null;
var autosaveIntervalId = null;
var bulletRefreshIntervalId = null;

// Perk lookup helpers keep perk logic centralized.
function getPerkConfig() {
    return CHARACTER_PERKS[gameState.character] || null;
}

function getPerkDescription() {
    var perk = getPerkConfig();
    return perk ? (perk.name + ': ' + perk.desc) : 'None';
}

function applyCharacterPerks() {
    var perk = getPerkConfig();
    gameState.maxLives = BASE_MAX_LIVES;
    if (perk && gameState.character === 'knight') {
        gameState.maxLives = BASE_MAX_LIVES + 1;
        if (gameState.lives < gameState.maxLives) {
            gameState.lives = gameState.maxLives;
        }
    }
}

// Restore hero/weapon/avatar profile from storage and shared loadout API.
function loadProfileFromStorage() {
    var storedCharacter = '';
    var storedWeapon = '';
    var avatarData = '';
    var avatarUrl = '';

    try { storedCharacter = localStorage.getItem('snakes_selected_character') || ''; } catch (e) {}
    try { if (!storedCharacter) storedCharacter = sessionStorage.getItem('snakes_selected_character') || ''; } catch (e) {}
    try { storedWeapon = localStorage.getItem('snakes_selected_weapon') || ''; } catch (e) {}
    try { if (!storedWeapon) storedWeapon = sessionStorage.getItem('snakes_selected_weapon') || ''; } catch (e) {}
    try { avatarData = localStorage.getItem('snakes_avatar_data') || ''; } catch (e) {}
    try { if (!avatarData) avatarData = sessionStorage.getItem('snakes_avatar_data') || ''; } catch (e) {}
    try { avatarUrl = localStorage.getItem('snakes_avatar_url') || ''; } catch (e) {}
    try { if (!avatarUrl) avatarUrl = sessionStorage.getItem('snakes_avatar_url') || ''; } catch (e) {}

    if (loadoutApi && typeof loadoutApi.getAvatarData === 'function') {
        avatarData = avatarData || loadoutApi.getAvatarData();
    }
    if (loadoutApi && typeof loadoutApi.getAvatarUrl === 'function') {
        avatarUrl = avatarUrl || loadoutApi.getAvatarUrl();
    }

    if (storedCharacter) {
        gameState.character = storedCharacter;
    }
    gameState.weaponType = resolveWeaponType(gameState.character || storedCharacter, storedWeapon || gameState.weaponType);
    gameState.avatarData = avatarData || gameState.avatarData || '';
    gameState.avatarUrl = avatarUrl || gameState.avatarUrl || '';
}

// Persist selected loadout to appropriate storage scope (guest vs logged-in).
function persistLoadoutToStorage() {
    var useSession = !!gameState.isGuest;
    var storage = useSession ? sessionStorage : localStorage;
    try {
        storage.setItem('snakes_selected_character', gameState.character || 'knight');
        storage.setItem('snakes_selected_weapon', gameState.weaponType || resolveWeaponType(gameState.character));
        if (gameState.avatarData) storage.setItem('snakes_avatar_data', gameState.avatarData);
        if (gameState.avatarUrl) storage.setItem('snakes_avatar_url', gameState.avatarUrl);
    } catch (e) {}

    if (loadoutApi && typeof loadoutApi.saveLoadout === 'function') {
        loadoutApi.saveLoadout(gameState.character || 'knight', gameState.weaponType || resolveWeaponType(gameState.character), { useSession: useSession });
    }
}

// Avatar/identity helpers are shared by board markers and multiplayer popups.
function getPlayerInitials(name) {
    if (loadoutApi && typeof loadoutApi.getInitials === 'function') {
        return loadoutApi.getInitials(name);
    }
    var text = String(name || 'Player').trim();
    if (!text) return 'P';
    var parts = text.split(/\s+/).filter(Boolean);
    if (!parts.length) return 'P';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getPlayerAvatarSource(player) {
    var source = '';
    if (loadoutApi && typeof loadoutApi.getAvatarSourceForPlayer === 'function') {
        source = loadoutApi.getAvatarSourceForPlayer(player);
    } else if (player && typeof player === 'object') {
        source = player.avatar_url || player.avatar_data || player.avatarUrl || player.avatarData || '';
    }

    var sameUser = false;
    if (player && gameState.userId && typeof player.user_id !== 'undefined') {
        sameUser = String(player.user_id) === String(gameState.userId);
    }
    if (!source && sameUser) {
        source = gameState.avatarUrl || gameState.avatarData || '';
    }
    return source || '';
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderAvatarMarkup(player, className, sizePx, ringColor) {
    var size = Number(sizePx || 20);
    var ring = ringColor || 'rgba(255, 255, 255, 0.65)';
    if (loadoutApi && typeof loadoutApi.renderAvatarMarkup === 'function') {
        return loadoutApi.renderAvatarMarkup(player, {
            className: className || 'tile-avatar-bubble',
            size: size,
            ringColor: ring
        });
    }

    var avatar = getPlayerAvatarSource(player);
    var username = (player && player.username) || gameState.username || 'Player';
    var classes = className || 'tile-avatar-bubble';
    if (avatar) {
        return '<span class=\"' + escapeHtml(classes) + ' has-image\" style=\"--avatar-size:' + size + 'px;--avatar-ring:' + escapeHtml(ring) + ';\"><img src=\"' + escapeHtml(avatar) + '\" alt=\"' + escapeHtml(username) + ' avatar\"></span>';
    }
    return '<span class=\"' + escapeHtml(classes) + ' no-image\" style=\"--avatar-size:' + size + 'px;--avatar-ring:' + escapeHtml(ring) + ';\"><span class=\"avatar-fallback\">' + escapeHtml(getPlayerInitials(username)) + '</span></span>';
}

function createPlayerMarker(character, username, avatarSource) {
    var marker = document.createElement('div');
    marker.className = 'player-marker';
    if (avatarSource) {
        marker.classList.add('player-avatar-marker');
        marker.style.backgroundImage = 'url(\"' + avatarSource + '\")';
        marker.title = (username || 'Player') + ' avatar';
    } else {
        marker.textContent = getCharacterIcon(character);
        marker.title = (username || 'Player') + ' marker';
    }
    return marker;
}

// Small global surface used by UI to show current perk text.
window.SnakesPerks = {
    getDescription: getPerkDescription
};

// Demo mode: when enabled, progress is session-only and excluded from leaderboard
function enableDemoMode() {
    if (gameState.isDemoMode) return; // Already in demo mode

    gameState.isDemoMode = true;

    // Store demo mode flag in sessionStorage (cleared on browser close)
    try {
        sessionStorage.setItem('snakes_demo_mode', '1');
    } catch (e) {}

    console.log('Demo mode enabled - progress will not be saved to server or reflected in leaderboard');
}

// Guest mode: session-only progress (no server persistence)
function saveGuestProgress() {
    if (!gameState.isGuest) return;

    try {
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
        sessionStorage.setItem('snakes_guest_progress', JSON.stringify(guestData));
    } catch (e) {
        console.error('Error saving guest progress:', e);
    }
}

// Load session-only guest progress; if demo is active, fallback to demo snapshot.
function loadGuestProgress() {
    try {
        var stored = sessionStorage.getItem('snakes_guest_progress');
        if (stored) {
            var guestData = JSON.parse(stored);
            gameState.bullets = guestData.bullets || 0;
            gameState.currentSquare = guestData.currentSquare || 0;
            gameState.visitedSquares = guestData.visitedSquares || [0];
            gameState.completedLessons = guestData.completedLessons || [];
            gameState.completedQuestions = guestData.completedQuestions || [];
            gameState.unlockedSections = guestData.unlockedSections || ['half1'];
            gameState.lives = guestData.lives || BASE_MAX_LIVES;
            gameState.timeElapsed = guestData.timeElapsed || 0;
            if (guestData.character) gameState.character = guestData.character;
            gameState.weaponType = resolveWeaponType(gameState.character, guestData.weaponType);
            if (guestData.avatarData) gameState.avatarData = guestData.avatarData;
            if (guestData.avatarUrl) gameState.avatarUrl = guestData.avatarUrl;
            applyCharacterPerks();
            return true;
        }
    } catch (e) {
        console.error('Error loading guest progress:', e);
    }
    // Fallback: if demo mode is active for guest, load demo progress
    if (gameState.isDemoMode) {
        try {
            var demoStored = sessionStorage.getItem('snakes_demo_progress');
            if (demoStored) {
                var demoData = JSON.parse(demoStored);
                gameState.bullets = demoData.bullets || 0;
                gameState.currentSquare = demoData.currentSquare || 0;
                gameState.visitedSquares = demoData.visitedSquares || [0];
                gameState.completedLessons = demoData.completedLessons || [];
                gameState.completedQuestions = demoData.completedQuestions || [];
                gameState.unlockedSections = demoData.unlockedSections || ['half1'];
                gameState.lives = demoData.lives || BASE_MAX_LIVES;
                gameState.timeElapsed = demoData.timeElapsed || 0;
                if (demoData.character) gameState.character = demoData.character;
                gameState.weaponType = resolveWeaponType(gameState.character, demoData.weaponType);
                if (demoData.avatarData) gameState.avatarData = demoData.avatarData;
                if (demoData.avatarUrl) gameState.avatarUrl = demoData.avatarUrl;
                applyCharacterPerks();
                return true;
            }
        } catch (e) {
            console.error('Error loading demo progress for guest:', e);
        }
    }
    return false;
}

// Save demo progress to sessionStorage
function saveDemoProgress() {
    if (!gameState.isDemoMode) return;

    try {
        var demoData = {
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
        sessionStorage.setItem('snakes_demo_progress', JSON.stringify(demoData));
        console.log('Demo progress saved to session');
    } catch (e) {
        console.error('Error saving demo progress:', e);
    }

    if (gameState.isGuest) {
        saveGuestProgress();
    }
}

// Load demo progress from sessionStorage
function loadDemoProgress() {
    try {
        var stored = sessionStorage.getItem('snakes_demo_progress');
        if (stored) {
            var demoData = JSON.parse(stored);
            gameState.bullets = demoData.bullets || 0;
            gameState.currentSquare = demoData.currentSquare || 0;
            gameState.visitedSquares = demoData.visitedSquares || [0];
            gameState.completedLessons = demoData.completedLessons || [];
            gameState.completedQuestions = demoData.completedQuestions || [];
            gameState.unlockedSections = demoData.unlockedSections || ['half1'];
            gameState.lives = demoData.lives || BASE_MAX_LIVES;
            gameState.timeElapsed = demoData.timeElapsed || 0;
            if (demoData.character) gameState.character = demoData.character;
            gameState.weaponType = resolveWeaponType(gameState.character, demoData.weaponType);
            if (demoData.avatarData) gameState.avatarData = demoData.avatarData;
            if (demoData.avatarUrl) gameState.avatarUrl = demoData.avatarUrl;
            console.log('Demo progress loaded from session:', demoData);
            return true;
        }
    } catch (e) {
        console.error('Error loading demo progress:', e);
    }
    return false;
}

// Check if demo mode was previously enabled this session
function checkDemoModeSession() {
    try {
        if (sessionStorage.getItem('snakes_demo_mode') === '1') {
            gameState.isDemoMode = true;
            loadDemoProgress();
            console.log('Demo mode restored from session');
        }
    } catch (e) {}
}

// Call on load to restore demo mode state
checkDemoModeSession();
loadProfileFromStorage();

var multiplayerState = {
    otherPlayers: [],
    refreshInterval: null,
    REFRESH_RATE_MS: 5000,
    MAX_PLAYERS_ON_BOARD: 50
};

// Lightweight DOM helpers used throughout this script.
function $(selector) { return document.querySelector(selector); }
function $all(selector) { return document.querySelectorAll(selector); }
function playSfx(name) {
    if (window.SnakesSFX && typeof window.SnakesSFX.play === 'function') {
        window.SnakesSFX.play(name);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // DON'T hide character selection here - let autoResumeIfReady handle it
    initializeEventListeners();
    checkExistingLogin().then(function () {
        autoResumeIfReady();
    });
});

// Centralized event wiring for login, board controls, modals, and name editor.
function initializeEventListeners() {
    var btnUseLogin = document.getElementById('use-existing-login');
    if (btnUseLogin) btnUseLogin.addEventListener('click', useExistingLogin);

    var btnGuest = document.getElementById('play-as-guest');
    if (btnGuest) btnGuest.addEventListener('click', playAsGuest);

    // DON'T add click handlers to character cards here - carousel handles it
    // The carousel will call selectCharacter only for the centered card

    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.addEventListener('click', startGame);

    var rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) rollBtn.addEventListener('click', rollDice);

    var physicalDice = document.getElementById('physical-dice');
    if (physicalDice) physicalDice.addEventListener('click', rollDice);

    var leaderboardBtn = document.getElementById('view-leaderboard-btn');
    if (leaderboardBtn) leaderboardBtn.addEventListener('click', viewLeaderboard);

    var prevBtn = document.getElementById('prev-section-btn');
    if (prevBtn) prevBtn.addEventListener('click', navigatePrev);

    var nextBtn = document.getElementById('next-section-btn');
    if (nextBtn) nextBtn.addEventListener('click', navigateNext);

    var closeButtons = $all('.close-modal');
    for (var j = 0; j < closeButtons.length; j++) {
        closeButtons[j].addEventListener('click', function () {
            var modals = $all('.modal');
            for (var k = 0; k < modals.length; k++) modals[k].classList.add('hidden');
        });
    }

    // Question modal close handlers
    var questionModalClose = document.querySelector('.question-modal-close');
    if (questionModalClose) {
        questionModalClose.addEventListener('click', function() {
            closeQuestionModal();
        });
    }
    
    var questionModal = document.getElementById('question-modal');
    if (questionModal) {
        questionModal.addEventListener('click', function(e) {
            if (e.target === questionModal) {
                closeQuestionModal();
            }
        });
    }

    var bossAttackBtn = document.getElementById('boss-attack-btn');
    if (bossAttackBtn) bossAttackBtn.addEventListener('click', function () {
        if (gameState.bullets < 10) { alert('You need at least 10 bullets to attack the boss.'); return; }
        gameState.bullets -= 10;
        document.getElementById('boss-player-bullets').textContent = gameState.bullets;
        updatePlayerInfo();
        saveProgress();

        fetch(API_URL + '/boss/attack', {
            method: 'POST',
            mode: fetchOptions.mode,
            cache: fetchOptions.cache,
            credentials: fetchOptions.credentials,
            headers: fetchOptions.headers,
            body: JSON.stringify({ damage: 50 })
        }).catch(function () {});
    });

    // Close overlay button handler
    var closeOverlayBtn = document.getElementById('close-overlay-btn');
    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', function() {
            var overlay = document.getElementById('locked-overlay');
            if (overlay) overlay.style.display = 'none';
            window.location.href = 'game-board-part1.html';
        });
    }

    // Player info popup close handlers
    var closePlayerInfo = document.querySelector('.close-player-info');
    if (closePlayerInfo) {
        closePlayerInfo.addEventListener('click', closePlayerInfoPopup);
    }

    var playerInfoModal = document.getElementById('player-info-modal');
    if (playerInfoModal) {
        playerInfoModal.addEventListener('click', function(e) {
            if (e.target === playerInfoModal) {
                closePlayerInfoPopup();
            }
        });
    }

    var displayNameSave = document.getElementById('display-name-save');
    if (displayNameSave) displayNameSave.addEventListener('click', submitDisplayName);

    var displayNameSkip = document.getElementById('display-name-skip');
    if (displayNameSkip) displayNameSkip.addEventListener('click', skipDisplayName);

    var displayNameInput = document.getElementById('display-name-input');
    if (displayNameInput) {
        displayNameInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') submitDisplayName();
        });
    }

    var editNameBtn = document.getElementById('edit-name-btn');
    if (editNameBtn) editNameBtn.addEventListener('click', function () {
        showDisplayNameModal(true);
    });
}

// Close only question modal panel; board state remains unchanged.
function closeQuestionModal() {
    var modal = document.getElementById('question-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Checks active login session and stores ID/name in local gameState.
function checkExistingLogin() {
    return fetch(API_URL + '/id', {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
        .then(function (response) { if (!response.ok) return null; return response.json(); })
        .then(function (userData) {
            if (!userData) return null;
            gameState.userId = userData.id;
            gameState.username = userData.name;
            return userData;
        })
        .catch(function () { return null; });
}

// Logged-in flow: validate user, load progress, and auto-skip character selection for returning users.
function useExistingLogin() {
    playSfx('click');
    fetch(API_URL + '/id', {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
        .then(function (response) {
            if (!response.ok) {
                alert('Please log in to the website first, then return to the game.');
                var returnTo = window.location.pathname + window.location.search + window.location.hash;
                window.location.href = getLoginUrl() + '?next=' + encodeURIComponent(returnTo);
                return null;
            }
            return response.json();
        })
        .then(function (userData) {
            if (!userData) return;
            gameState.isGuest = false;
            gameState.userId = userData.id;
            gameState.username = userData.name;
            return loadOrCreateGameData();
        })
        .then(function () { return loadProgress(); })
        .then(function () { return ensureDisplayName(); })
        .then(function () {
            var loginContainer = document.getElementById('login-container');
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');

            // Check if user already has a valid character from the backend
            // Backend is the source of truth - if they have a character stored, they're a returning user
            var hasValidCharacter = gameState.character && gameState.character !== 'default' && gameState.character !== '';

            if (hasValidCharacter) {
                console.log('Returning user with character from backend:', gameState.character);
                gameState.weaponType = resolveWeaponType(gameState.character, gameState.weaponType);
                // Store in localStorage for future auto-resume (include user ID for multi-account support)
                try {
                    localStorage.setItem('snakes_selected_character', gameState.character);
                    localStorage.setItem('snakes_selected_weapon', gameState.weaponType);
                    if (gameState.avatarData) localStorage.setItem('snakes_avatar_data', gameState.avatarData);
                    if (gameState.avatarUrl) localStorage.setItem('snakes_avatar_url', gameState.avatarUrl);
                    localStorage.setItem('snakes_started', '1');
                    localStorage.setItem('snakes_user_id', String(gameState.userId));
                } catch (e) {}
                persistLoadoutToStorage();

                // Skip character selection and go directly to game
                if (loginContainer) loginContainer.classList.add('hidden');
                if (characterSelection) characterSelection.classList.add('hidden');
                if (gameContainer) gameContainer.classList.remove('hidden');

                if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
                startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo(); checkSectionLock(); startMultiplayerRefresh(); startBulletRefresh();
                return;
            }

            // User needs to select character - show character selection
            console.log('New user - showing character selection');
            if (loginContainer) loginContainer.classList.add('hidden');
            if (characterSelection) characterSelection.classList.remove('hidden');
        })
        .catch(function (error) {
            console.error('Login error:', error);
            alert('Error connecting to server. Please try again.');
        });
}

// Guest flow: creates temporary identity and uses session-only persistence.
function playAsGuest() {
    playSfx('click');
    gameState.isGuest = true;
    gameState.userId = 'guest_' + Date.now();
    gameState.username = 'Guest_' + Math.floor(Math.random() * 1000);
    try {
        sessionStorage.setItem('snakes_isGuest', '1');
        sessionStorage.setItem('snakes_user_id', String(gameState.userId));
        sessionStorage.setItem('snakes_guest_name', gameState.username);
    } catch (e) {}

    var loginContainer = document.getElementById('login-container');
    var characterSelection = document.getElementById('character-selection');
    if (loginContainer) loginContainer.classList.add('hidden');
    ensureDisplayName().then(function () {
        if (characterSelection) characterSelection.classList.remove('hidden');
    });
}

// Fetches or initializes `/snakes/` backend record and hydrates local state.
function loadOrCreateGameData() {
    if (gameState.isGuest) {
        loadGuestProgress();
        return Promise.resolve();
    }

    return fetch(API_URL + '/snakes/', {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
        .then(function (response) {
            if (response.status === 404) {
                // Only create new game if character is already selected
                if (gameState.character && gameState.character !== 'default' && gameState.character !== '') {
                    console.log('Creating new game data with character:', gameState.character);
                    return fetch(API_URL + '/snakes/', {
                        method: 'POST',
                        mode: fetchOptions.mode,
                        cache: fetchOptions.cache,
                        credentials: fetchOptions.credentials,
                        headers: fetchOptions.headers,
                        body: JSON.stringify({
                            selected_character: gameState.character,
                            weapon_type: gameState.weaponType || resolveWeaponType(gameState.character),
                            selected_weapon: gameState.weaponType || resolveWeaponType(gameState.character),
                            avatar_url: gameState.avatarUrl || null,
                            avatar_data: gameState.avatarData || null
                        })
                    });
                } else {
                    // No character selected yet - don't create game data
                    console.log('No character selected - skipping game data creation');
                    return null;
                }
            }
            return response;
        })
        .then(function (response) { if (!response || !response.ok) return null; return response.json(); })
        .then(function (data) {
            if (!data) return;
            gameState.bullets = Number(data.total_bullets || 0);
            if (typeof data.current_square !== 'undefined' && data.current_square !== null) {
                gameState.currentSquare = Number(data.current_square) - 1;
            }
            if (Array.isArray(data.visited_squares)) {
                gameState.visitedSquares = data.visited_squares.map(function (s) { return Number(s) - 1; });
            } else {
                gameState.visitedSquares = [gameState.currentSquare];
            }
            gameState.lives = Number(data.lives || BASE_MAX_LIVES);
            gameState.bossAttempts = Number(data.boss_battle_attempts || 0);
            gameState.timeElapsed = Math.floor(Number(data.time_played || 0));

            // IMPORTANT: Only load character from server if we don't have one selected yet
            // AND only if it's a valid character (not 'default' or empty)
            if (!gameState.character && data.selected_character && data.selected_character !== 'default' && data.selected_character !== '') {
                console.log('Loading character from server:', data.selected_character);
                gameState.character = data.selected_character;
            } else if (gameState.character) {
                console.log('Keeping locally selected character:', gameState.character);
            }
            gameState.weaponType = resolveWeaponType(gameState.character || data.selected_character, data.weapon_type || data.selected_weapon || gameState.weaponType);
            if (data.avatar_url) gameState.avatarUrl = data.avatar_url;
            if (data.avatar_data) gameState.avatarData = data.avatar_data;
            persistLoadoutToStorage();

            if (gameState.timeStarted === null) {
                gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            }

            // If in demo mode, override with demo progress from sessionStorage
            if (gameState.isDemoMode) {
                loadDemoProgress();
            }
            applyCharacterPerks();
        })
        .catch(function (error) { console.error('Error loading game data:', error); });
}

// Loads progression-focused data (position, bullets, completed lessons/sections).
function loadProgress() {
    if (gameState.isGuest) {
        loadGuestProgress();
        return Promise.resolve();
    }

    return fetch(API_URL + '/snakes/progress', {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
        .then(function (response) { if (!response.ok) return null; return response.json(); })
        .then(function (data) {
            if (!data) return;
            if (typeof data.current_square !== 'undefined' && data.current_square !== null) {
                gameState.currentSquare = Number(data.current_square) - 1;
            }
            if (Array.isArray(data.visited_squares)) {
                gameState.visitedSquares = data.visited_squares.map(function (s) { return Number(s) - 1; });
            } else {
                gameState.visitedSquares = gameState.visitedSquares;
            }
            gameState.bullets = Number(data.total_bullets || gameState.bullets);
            gameState.lives = Number(data.lives || gameState.lives);
            gameState.completedLessons = data.completed_lessons || [];
            gameState.unlockedSections = data.unlocked_sections || gameState.unlockedSections;

            // IMPORTANT: Only load character from server if we don't have one selected yet
            // AND only if it's a valid character (not 'default' or empty)
            if (!gameState.character && data.selected_character && data.selected_character !== 'default' && data.selected_character !== '') {
                console.log('Loading character from progress:', data.selected_character);
                gameState.character = data.selected_character;
            } else if (gameState.character) {
                console.log('Preserving selected character:', gameState.character);
            }
            gameState.weaponType = resolveWeaponType(gameState.character || data.selected_character, data.weapon_type || data.selected_weapon || gameState.weaponType);
            if (data.avatar_url) gameState.avatarUrl = data.avatar_url;
            if (data.avatar_data) gameState.avatarData = data.avatar_data;
            persistLoadoutToStorage();

            if (typeof data.time_played !== 'undefined' && data.time_played !== null) {
                gameState.timeElapsed = Math.floor(Number(data.time_played || gameState.timeElapsed));
                if (gameState.timeStarted !== null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            }

            // If in demo mode, override with demo progress from sessionStorage
            if (gameState.isDemoMode) {
                loadDemoProgress();
            }
            applyCharacterPerks();
        })
        .catch(function (error) { console.error('Error loading progress:', error); });
}

// Persists authoritative progress to backend (skipped for guest/demo).
function saveProgress() {
    if (gameState.isGuest) {
        saveGuestProgress();
        return Promise.resolve();
    }
    if (gameState.isDemoMode) return Promise.resolve();

    if (gameState.timeStarted !== null) gameState.timeElapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);

    return fetch(API_URL + '/snakes/', {
        method: 'PUT',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers,
        body: JSON.stringify({
            current_square: Number(gameState.currentSquare) + 1,
            visited_squares: (gameState.visitedSquares || []).map(function (s) { return Number(s) + 1; }),
            total_bullets: gameState.bullets,
            time_played: gameState.timeElapsed,
            lives: gameState.lives,
            boss_battle_attempts: gameState.bossAttempts,
            selected_character: gameState.character,
            weapon_type: gameState.weaponType || resolveWeaponType(gameState.character),
            selected_weapon: gameState.weaponType || resolveWeaponType(gameState.character),
            avatar_url: gameState.avatarUrl || null
        })
    }).catch(function (error) { console.error('Error saving progress:', error); });
}

function saveProgressSilently() { try { saveProgress(); } catch (e) {} }

// Character picker entry point from UI carousel/cards.
function selectCharacter(card) {
    var cards = $all('.character-card');
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selected');
    card.classList.add('selected');
    gameState.character = card.getAttribute('data-character');
    gameState.weaponType = resolveWeaponType(gameState.character);
    applyCharacterPerks();
    // Save selection for resume (localStorage for logged-in, sessionStorage for guest)
    try {
        if (gameState.isGuest) {
            sessionStorage.setItem('snakes_selected_character', gameState.character);
            sessionStorage.setItem('snakes_selected_weapon', gameState.weaponType);
            if (gameState.userId) {
                sessionStorage.setItem('snakes_user_id', String(gameState.userId));
            }
        } else {
            localStorage.setItem('snakes_selected_character', gameState.character);
            localStorage.setItem('snakes_selected_weapon', gameState.weaponType);
            if (gameState.userId) {
                localStorage.setItem('snakes_user_id', String(gameState.userId));
            }
        }
    } catch (e) {}
    persistLoadoutToStorage();

    console.log('======================');
    console.log('CHARACTER SELECTED:', gameState.character);
    console.log('Card data-character:', card.getAttribute('data-character'));
    console.log('Character name displayed:', card.querySelector('.character-name').textContent);
    console.log('======================');
    
    // Visual feedback
    var characterName = card.querySelector('.character-name').textContent;
    alert('✓ ' + characterName + ' selected! Click START ADVENTURE to begin.');
    
    // Update UI immediately
    updatePlayerInfo();
    
    // Save to backend if not guest
    if (!gameState.isGuest && gameState.userId) {
        console.log('Saving character to backend:', gameState.character);
        // First, create or load game data with the selected character
        fetch(API_URL + '/snakes/', {
            method: 'GET',
            mode: fetchOptions.mode,
            cache: fetchOptions.cache,
            credentials: fetchOptions.credentials,
            headers: fetchOptions.headers
        })
            .then(function (response) {
                if (response.status === 404) {
                    // Create new game entry with selected character
                    console.log('Creating new game entry with character:', gameState.character);
                    return fetch(API_URL + '/snakes/', {
                        method: 'POST',
                        mode: fetchOptions.mode,
                        cache: fetchOptions.cache,
                        credentials: fetchOptions.credentials,
                        headers: fetchOptions.headers,
                        body: JSON.stringify({
                            selected_character: gameState.character,
                            weapon_type: gameState.weaponType,
                            selected_weapon: gameState.weaponType,
                            avatar_url: gameState.avatarUrl || null,
                            avatar_data: gameState.avatarData || null
                        })
                    });
                } else {
                    // Update existing game entry with selected character
                    console.log('Updating existing game with character:', gameState.character);
                    return fetch(API_URL + '/snakes/', {
                        method: 'PUT',
                        mode: fetchOptions.mode,
                        cache: fetchOptions.cache,
                        credentials: fetchOptions.credentials,
                        headers: fetchOptions.headers,
                        body: JSON.stringify({
                            selected_character: gameState.character,
                            weapon_type: gameState.weaponType,
                            selected_weapon: gameState.weaponType,
                            avatar_url: gameState.avatarUrl || null,
                            avatar_data: gameState.avatarData || null,
                            current_square: gameState.currentSquare + 1,
                            visited_squares: gameState.visitedSquares.map(function (s) { return s + 1; }),
                            total_bullets: gameState.bullets,
                            time_played: gameState.timeElapsed,
                            lives: gameState.lives,
                            boss_battle_attempts: gameState.bossAttempts
                        })
                    });
                }
            })
            .then(function(response) {
                if (response && response.ok) {
                    console.log('✓ Character saved successfully to backend');
                } else {
                    console.warn('⚠ Failed to save character to backend');
                }
            })
            .catch(function (error) {
                console.error('❌ Error saving character:', error);
            });
    }

    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.disabled = false;
}

// Starts active gameplay once a character is confirmed and state is loaded.
function startGame() {
    playSfx('click');
    if (!gameState.character) {
        alert('Please select a character!');
        return;
    }

    console.log('Starting game with character:', gameState.character);
    gameState.weaponType = resolveWeaponType(gameState.character, gameState.weaponType);
    persistLoadoutToStorage();
    applyCharacterPerks();

    loadOrCreateGameData()
        .then(function () { 
            console.log('Game data loaded, character is:', gameState.character);
            return loadProgress(); 
        })
        .then(function () {
            console.log('Progress loaded, character is:', gameState.character);
            
            // Ensure character is saved after loading progress
            if (gameState.character) {
                return saveProgress();
            }
        })
        .then(function () {
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');
            var loginContainer = document.getElementById('login-container');
            if (characterSelection) characterSelection.classList.add('hidden');
            if (gameContainer) gameContainer.classList.remove('hidden');
            if (loginContainer) loginContainer.classList.add('hidden');

            try {
                if (gameState.isGuest) {
                    sessionStorage.setItem('snakes_started', '1');
                    if (gameState.userId) {
                        sessionStorage.setItem('snakes_user_id', String(gameState.userId));
                    }
                } else {
                    localStorage.setItem('snakes_started', '1');
                    if (gameState.userId) {
                        localStorage.setItem('snakes_user_id', String(gameState.userId));
                    }
                }
            } catch (e) {}

            if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);

            startTimer();
            startAutosave();
            createGameBoard();
            updatePlayerInfo();
            checkSectionLock();
            startMultiplayerRefresh();
            startBulletRefresh();

            // ADD THIS: Show roll prompt for Section 1 only on first load
            var section = window.snakesGameSection || 1;
            var hasSeenPrompt = false;
            try {
                hasSeenPrompt = localStorage.getItem('snakes_seen_roll_prompt') === '1';
            } catch (e) {}

            if (section === 1 && !hasSeenPrompt && gameState.currentSquare === 0) {
                setTimeout(function() {
                    showRollPrompt();
                }, 500);
            }

            console.log('Game started successfully with character:', gameState.character);
        });
}

// ADD THIS NEW FUNCTION at the end of snakes-game.js:

/**
 * Show the "Roll Dice to Begin" overlay
 * Automatically dismisses when user clicks Roll Dice or after 8 seconds
 */
function showRollPrompt() {
    var overlay = document.getElementById('roll-prompt-overlay');
    if (!overlay) return;

    overlay.classList.add('active');

    // Store that user has seen the prompt
    try {
        localStorage.setItem('snakes_seen_roll_prompt', '1');
    } catch (e) {}

    // Auto-dismiss after 8 seconds
    var autoDismissTimer = setTimeout(function() {
        dismissRollPrompt();
    }, 8000);

    // Dismiss when Roll Dice button is clicked
    var rollBtn = document.getElementById('roll-dice-btn');
    if (rollBtn) {
        var dismissOnRoll = function() {
            clearTimeout(autoDismissTimer);
            dismissRollPrompt();
            rollBtn.removeEventListener('click', dismissOnRoll);
        };
        rollBtn.addEventListener('click', dismissOnRoll);
    }

    // Also allow clicking the overlay to dismiss
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            clearTimeout(autoDismissTimer);
            dismissRollPrompt();
        }
    });
}

function dismissRollPrompt() {
    var overlay = document.getElementById('roll-prompt-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Expose globally for manual control if needed
window.showRollPrompt = showRollPrompt;
window.dismissRollPrompt = dismissRollPrompt;

// Resume logic for returning logged-in users and returning guest sessions.
function autoResumeIfReady() {
    var storedName = getStoredDisplayName();
    if (storedName) gameState.username = storedName;
    // Check if user has previously selected a character AND started the game
    var storedChar = null;
    var storedWeapon = null;
    try { storedChar = localStorage.getItem('snakes_selected_character'); } catch (e) {}
    try { storedWeapon = localStorage.getItem('snakes_selected_weapon'); } catch (e) {}

    var hasStarted = false;
    try { hasStarted = (localStorage.getItem('snakes_started') === '1'); } catch (e) {}

    // IMPORTANT: Check if localStorage belongs to the CURRENT user
    // If user ID changed OR localStorage has no user ID (old format), clear old data
    var storedUserId = null;
    try { storedUserId = localStorage.getItem('snakes_user_id'); } catch (e) {}

    // Guest auto-resume (session-only, no backend)
    var isGuestStored = false;
    try { isGuestStored = (sessionStorage.getItem('snakes_isGuest') === '1'); } catch (e) {}
    if (isGuestStored) {
        gameState.isGuest = true;
        try { storedChar = sessionStorage.getItem('snakes_selected_character'); } catch (e) {}
        try { storedWeapon = sessionStorage.getItem('snakes_selected_weapon'); } catch (e) {}
        try { hasStarted = (sessionStorage.getItem('snakes_started') === '1'); } catch (e) {}
        var guestUserId = null;
        try { guestUserId = sessionStorage.getItem('snakes_user_id'); } catch (e) {}
        if (!guestUserId) {
            guestUserId = 'guest_' + Date.now();
            try { sessionStorage.setItem('snakes_user_id', String(guestUserId)); } catch (e) {}
        }
        gameState.userId = guestUserId;
        try { gameState.username = sessionStorage.getItem('snakes_guest_name') || 'Guest'; } catch (e) { gameState.username = 'Guest'; }

        if (storedChar && hasStarted) {
            gameState.character = storedChar;
            gameState.weaponType = resolveWeaponType(storedChar, storedWeapon);
            loadGuestProgress();
            persistLoadoutToStorage();

            var guestCharacterSelection = document.getElementById('character-selection');
            var guestGameContainer = document.getElementById('game-container');
            var guestLoginContainer = document.getElementById('login-container');
            if (guestCharacterSelection) guestCharacterSelection.classList.add('hidden');
            if (guestGameContainer) guestGameContainer.classList.remove('hidden');
            if (guestLoginContainer) guestLoginContainer.classList.add('hidden');

            if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo(); checkSectionLock(); startMultiplayerRefresh(); startBulletRefresh();
            return Promise.resolve();
        }

        // Guest without selection/start: redirect to landing page for character selection
        var guestBase = window.location.pathname.replace(/\/hacks\/snakes\/.*$/, '');
        window.location.replace(guestBase + '/snakes-game');
        return Promise.resolve();
    }

    // Clear localStorage if:
    // 1. There's stored data but no stored user ID (old format before user ID tracking)
    // 2. User ID doesn't match current logged-in user
    var shouldClearStorage = false;
    if (gameState.userId && storedChar) {
        if (!storedUserId) {
            // Old format localStorage without user ID - clear it
            console.log('Old localStorage format detected (no user ID), clearing data');
            shouldClearStorage = true;
        } else if (storedUserId !== String(gameState.userId)) {
            // Different user logged in
            console.log('Different user detected, clearing old localStorage data');
            shouldClearStorage = true;
        }
    }

    if (shouldClearStorage) {
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
        storedChar = null;
        hasStarted = false;
        storedUserId = null;
    }

    // Only auto-resume if BOTH character is selected AND game was started AND same user
    if (storedChar && hasStarted && gameState.userId && storedUserId === String(gameState.userId)) {
        gameState.character = storedChar;
        gameState.weaponType = resolveWeaponType(storedChar, storedWeapon);
        gameState.isGuest = false;
        loadProfileFromStorage();

        return loadOrCreateGameData().then(function () { return loadProgress(); }).then(function () {
            var characterSelection = document.getElementById('character-selection');
            var gameContainer = document.getElementById('game-container');
            var loginContainer = document.getElementById('login-container');
            if (characterSelection) characterSelection.classList.add('hidden');
            if (gameContainer) gameContainer.classList.remove('hidden');
            if (loginContainer) loginContainer.classList.add('hidden');

            if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
            startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo(); checkSectionLock(); startMultiplayerRefresh(); startBulletRefresh();
        }).catch(function () {});
    }

    // If user is logged in but no valid localStorage for this user, check backend
    if (gameState.userId && (!storedChar || storedUserId !== String(gameState.userId))) {
        // First, just check if game data exists WITHOUT creating it
        return fetch(API_URL + '/snakes/', {
            method: 'GET',
            mode: fetchOptions.mode,
            cache: fetchOptions.cache,
            credentials: fetchOptions.credentials,
            headers: fetchOptions.headers
        })
        .then(function (response) {
            if (response.status === 404) {
                // No game data exists - this is a NEW user
                // Redirect to landing page for login + character selection
                console.log('New user detected - redirecting to landing page');
                try {
                    localStorage.removeItem('snakes_selected_character');
                    localStorage.removeItem('snakes_selected_weapon');
                    localStorage.removeItem('snakes_avatar_data');
                    localStorage.removeItem('snakes_avatar_url');
                    localStorage.removeItem('snakes_started');
                    localStorage.removeItem('snakes_user_id');
                } catch(e) {}
                var base = window.location.pathname.replace(/\/hacks\/snakes\/.*$/, '');
                window.location.replace(base + '/snakes-game');
                return null;
            }
            return response.json();
        })
        .then(function (data) {
            if (!data) return; // Already handled (new user)

            // Existing user - check if they have CONFIRMED character selection
            // We require BOTH: valid character in backend AND snakes_started flag in localStorage
            // This ensures user explicitly selected and started the game before
            var serverCharacter = data.selected_character;
            var wasStartedBefore = false;
            try { wasStartedBefore = (localStorage.getItem('snakes_started') === '1'); } catch (e) {}

            // Only auto-resume if:
            // 1. Server has valid character (not 'default' or empty)
            // 2. User has previously started the game (snakes_started flag)
            // This prevents auto-resuming for users who have backend data but never confirmed their selection
            if (serverCharacter && serverCharacter !== 'default' && serverCharacter !== '' && wasStartedBefore) {
                // Valid character exists AND user previously started - auto-resume
                console.log('Auto-resuming with backend character:', serverCharacter);
                gameState.character = serverCharacter;
                gameState.weaponType = resolveWeaponType(serverCharacter, data.weapon_type || data.selected_weapon || storedWeapon);
                gameState.bullets = Number(data.total_bullets || 0);
                if (typeof data.current_square !== 'undefined' && data.current_square !== null) {
                    gameState.currentSquare = Number(data.current_square) - 1;
                }
                if (Array.isArray(data.visited_squares)) {
                    gameState.visitedSquares = data.visited_squares.map(function (s) { return Number(s) - 1; });
                }
                gameState.lives = Number(data.lives || BASE_MAX_LIVES);
                gameState.bossAttempts = Number(data.boss_battle_attempts || 0);
                gameState.timeElapsed = Math.floor(Number(data.time_played || 0));

                // Store in localStorage for future (include user ID for multi-account support)
                try {
                    localStorage.setItem('snakes_selected_character', serverCharacter);
                    localStorage.setItem('snakes_selected_weapon', gameState.weaponType);
                    if (data.avatar_url) localStorage.setItem('snakes_avatar_url', data.avatar_url);
                    if (data.avatar_data) localStorage.setItem('snakes_avatar_data', data.avatar_data);
                    localStorage.setItem('snakes_started', '1');
                    localStorage.setItem('snakes_user_id', String(gameState.userId));
                } catch (e) {}

                return loadProgress().then(function () {
                    var characterSelection = document.getElementById('character-selection');
                    var gameContainer = document.getElementById('game-container');
                    var loginContainer = document.getElementById('login-container');
                    if (characterSelection) characterSelection.classList.add('hidden');
                    if (gameContainer) gameContainer.classList.remove('hidden');
                    if (loginContainer) loginContainer.classList.add('hidden');

                    if (gameState.timeStarted === null) gameState.timeStarted = Date.now() - (gameState.timeElapsed * 1000);
                    startTimer(); startAutosave(); createGameBoard(); updatePlayerInfo(); checkSectionLock(); startMultiplayerRefresh(); startBulletRefresh();
                });
            } else {
                // User needs to select character - clear stale data and redirect to landing page
                console.log('Redirecting to landing page - serverCharacter:', serverCharacter, 'wasStartedBefore:', wasStartedBefore);
                try {
                    localStorage.removeItem('snakes_selected_character');
                    localStorage.removeItem('snakes_selected_weapon');
                    localStorage.removeItem('snakes_avatar_data');
                    localStorage.removeItem('snakes_avatar_url');
                    localStorage.removeItem('snakes_started');
                    localStorage.removeItem('snakes_user_id');
                } catch(e) {}
                var base2 = window.location.pathname.replace(/\/hacks\/snakes\/.*$/, '');
                window.location.replace(base2 + '/snakes-game');
            }
        })
        .catch(function (error) {
            console.error('Error checking game data:', error);
            // On error, clear stale data and redirect to landing page as fallback
            console.log('Error occurred - redirecting to landing page');
            try {
                localStorage.removeItem('snakes_selected_character');
                localStorage.removeItem('snakes_selected_weapon');
                localStorage.removeItem('snakes_avatar_data');
                localStorage.removeItem('snakes_avatar_url');
                localStorage.removeItem('snakes_started');
                localStorage.removeItem('snakes_user_id');
            } catch(e) {}
            var base3 = window.location.pathname.replace(/\/hacks\/snakes\/.*$/, '');
            window.location.replace(base3 + '/snakes-game');
        });
    }

    // No valid session found - clear stale data and redirect to landing page
    try {
        localStorage.removeItem('snakes_selected_character');
        localStorage.removeItem('snakes_selected_weapon');
        localStorage.removeItem('snakes_avatar_data');
        localStorage.removeItem('snakes_avatar_url');
        localStorage.removeItem('snakes_started');
        localStorage.removeItem('snakes_user_id');
    } catch(e) {}
    var baseFallback = window.location.pathname.replace(/\/hacks\/snakes\/.*$/, '');
    window.location.replace(baseFallback + '/snakes-game');
    return Promise.resolve();
}

// Board renderer for both sections:
// - Section 1: linear lesson track.
// - Section 2: snake/ladder grid with question squares.
function createGameBoard() {
    var board = document.getElementById('game-board');
    if (!board) return;

    board.innerHTML = '';

    var section = window.snakesGameSection || 1;
    board.setAttribute('data-scale', section === 1 ? 'lesson' : 'question');
    if (board.parentElement) {
        board.parentElement.setAttribute('data-scale', section === 1 ? 'lesson' : 'question');
        if (board.parentElement.parentElement) {
            var stage = board.parentElement.parentElement;
            if (stage.classList.contains('board-stage')) {
                stage.setAttribute('data-scale', section === 1 ? 'lesson' : 'question');
            }
        }
    }
    
    if (section === 1) {
        var row = document.createElement('div');
        row.className = 'board-row single-row';
        row.style.setProperty('--first-size', FIRST_SECTION_SIZE);
        row.style.setProperty('--board-scale', 'lesson');
        for (var i = 0; i < FIRST_SECTION_SIZE; i++) {
            var squareNum = i;
            var square = document.createElement('div');
            square.className = 'square small-lesson';
            square.setAttribute('data-square', squareNum);

            if (gameState.visitedSquares.indexOf(squareNum) !== -1) square.classList.add('visited');
            if (squareNum === gameState.currentSquare) square.classList.add('current');

            // Check if this lesson is completed
            var lessonNum = squareNum;
            var isLessonCompleted = gameState.completedLessons.indexOf(lessonNum) !== -1;
            if (isLessonCompleted) {
                square.classList.add('lesson-completed');
            }

            var numSpan = document.createElement('span');
            numSpan.className = 'square-number';
            numSpan.textContent = (squareNum === 0) ? 'START' : squareNum;
            if (squareNum === 0) square.classList.add('start');
            square.appendChild(numSpan);

            var icon = document.createElement('div');
            icon.className = 'square-icon';
            // Show checkmark for completed lessons, book for incomplete
            if (isLessonCompleted) {
                icon.textContent = '✅';
            } else {
                icon.textContent = '📘';
            }
            square.appendChild(icon);

            if (squareNum === gameState.currentSquare) {
                var marker = createPlayerMarker(gameState.character, gameState.username, gameState.avatarUrl || gameState.avatarData);
                square.appendChild(marker);
            }

            // Add click handler for visited lesson squares (not START)
            if (squareNum > 0 && gameState.visitedSquares.indexOf(squareNum) !== -1) {
                square.style.cursor = 'pointer';
                (function(sq) {
                    square.addEventListener('click', function(e) {
                        e.stopPropagation();
                        goToLesson(sq);
                    });
                })(squareNum);
            }

            renderOtherPlayersOnSquare(square, squareNum);

            row.appendChild(square);
        }
        board.appendChild(row);
        return;
    }

    var start = FIRST_SECTION_SIZE;
    var cols = 10;
    var rows = 5;

    for (var r = rows - 1; r >= 0; r--) {
        var rowDiv = document.createElement('div');
        rowDiv.className = 'board-row';
        for (var c = 0; c < cols; c++) {
            var squareNum;
            var globalIdx = (r * cols) + c;
            if (r % 2 === 1) {
                squareNum = start + (r * cols) + (cols - 1 - c);
            } else {
                squareNum = start + (r * cols) + c;
            }

            var square = document.createElement('div');
            square.className = 'square medium';
            square.setAttribute('data-square', squareNum);

            if (gameState.visitedSquares.indexOf(squareNum) !== -1) square.classList.add('visited');
            if (squareNum === gameState.currentSquare) square.classList.add('current');

            var numSpan = document.createElement('span');
            numSpan.className = 'square-number';
            numSpan.textContent = (squareNum === 0) ? 'START' : squareNum;
            square.appendChild(numSpan);

            var icon = document.createElement('div');
            icon.className = 'square-icon';
            if (snakesAndLaddersMap[squareNum]) {
                if (snakesAndLaddersMap[squareNum] > squareNum) icon.textContent = '🪜';
                else icon.textContent = '🐍';
                if (snakesAndLaddersMap[squareNum] > squareNum) square.classList.add('ladder'); else square.classList.add('snake');
            } else if (squareNum === (FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1)) {
                icon.textContent = '🏁';
                square.classList.add('boss');
            }
            square.appendChild(icon);

            if (squareNum === gameState.currentSquare) {
                var marker = createPlayerMarker(gameState.character, gameState.username, gameState.avatarUrl || gameState.avatarData);
                square.appendChild(marker);
            }

            renderOtherPlayersOnSquare(square, squareNum);

            rowDiv.appendChild(square);
        }
        board.appendChild(rowDiv);
    }
}

function getCharacterIcon(character) {
    var icons = { knight: '🛡️', wizard: '🧙', archer: '🏹', warrior: '⚔️' };
    var icon = icons[character] || '🙂';
    if (icon === '🙂') {
        console.warn('Character not recognized:', character, '- available characters:', Object.keys(icons));
    }
    return icon;
    
}

function getCharacterDisplayName(character) {
    var names = { knight: 'Knight', wizard: 'Wizard', archer: 'Archer', warrior: 'Warrior' };
    return names[character] || 'Unknown';
}

// ============================================
// MULTIPLAYER FUNCTIONS
// ============================================

// Pulls leaderboard payload and reuses it as lightweight "players on board" data.
function fetchAllPlayers() {
    return fetch(API_URL + '/snakes/leaderboard?limit=' + multiplayerState.MAX_PLAYERS_ON_BOARD, {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
    .then(function(response) {
        if (!response.ok) throw new Error('Failed to fetch players');
        return response.json();
    })
    .then(function(data) {
        multiplayerState.otherPlayers = (data.leaderboard || []).filter(function(player) {
            return player.user_id !== gameState.userId;
        });
        return multiplayerState.otherPlayers;
    })
    .catch(function(error) {
        console.error('Error fetching players:', error);
        return [];
    });
}

// Converts local square index to API square numbering (1-based) for matching.
function getPlayersOnSquare(squareNum) {
    var apiSquareNum = squareNum + 1;
    return multiplayerState.otherPlayers.filter(function(player) {
        return player.current_square === apiSquareNum;
    });
}

// Adds avatar markers/buttons for other players currently sharing this square.
function renderOtherPlayersOnSquare(square, squareNum) {
    var playersHere = getPlayersOnSquare(squareNum);
    if (playersHere.length === 0) return;

    var container = document.createElement('div');
    container.className = 'other-players-container';

    if (playersHere.length <= 3) {
        var avatarsWrap = document.createElement('div');
        avatarsWrap.className = 'tile-avatars';

        playersHere.forEach(function(player) {
            var avatarBtn = document.createElement('button');
            avatarBtn.type = 'button';
            avatarBtn.className = 'tile-avatar-btn';
            avatarBtn.setAttribute('aria-label', 'View player details for ' + (player.username || 'Unknown'));
            avatarBtn.title = (player.username || 'Unknown') + ' • ' + getCharacterDisplayName(player.selected_character);
            avatarBtn.innerHTML = renderAvatarMarkup(player, 'tile-avatar-bubble', 18, 'rgba(255,255,255,0.6)');
            avatarBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showSquarePlayersPopup(squareNum, playersHere);
            });
            avatarsWrap.appendChild(avatarBtn);
        });

        container.appendChild(avatarsWrap);
    } else {
        var playersBtn = document.createElement('button');
        playersBtn.className = 'square-players-btn tile-avatar-count';
        playersBtn.textContent = '+' + playersHere.length;
        playersBtn.title = playersHere.length + ' players on this square';
        playersBtn.setAttribute('aria-label', 'View ' + playersHere.length + ' players on this square');

        playersBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showSquarePlayersPopup(squareNum, playersHere);
        });

        container.appendChild(playersBtn);
    }

    square.appendChild(container);
}

// Modal list of players on a square with quick drill-down to full profile popup.
function showSquarePlayersPopup(squareNum, players) {
    // Remove any existing popup
    var existingPopup = document.getElementById('square-players-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create the popup modal
    var popup = document.createElement('div');
    popup.id = 'square-players-popup';
    popup.className = 'square-players-popup';

    var content = document.createElement('div');
    content.className = 'square-players-content';

    // Header
    var header = document.createElement('div');
    header.className = 'square-players-header';
    header.innerHTML = '<h3>Players on Square ' + squareNum + '</h3><button class="square-players-close">&times;</button>';
    content.appendChild(header);

    // Players list
    var list = document.createElement('div');
    list.className = 'square-players-list';

    players.forEach(function(player) {
        var heroName = getCharacterDisplayName(player.selected_character);
        var weaponInfo = getWeaponInfo(player.selected_character, player.weapon_type || player.selected_weapon);
        var playerItem = document.createElement('div');
        playerItem.className = 'square-player-item';
        playerItem.innerHTML =
            renderAvatarMarkup(player, 'square-player-icon', 40, 'rgba(255,255,255,0.68)') +
            '<div class="square-player-info">' +
                '<div class="square-player-name">' + escapeHtml(player.username || 'Unknown') + '</div>' +
                '<div class="square-player-meta">' + escapeHtml(heroName) + ' • ' + escapeHtml(weaponInfo.weaponName) + '</div>' +
                '<div class="square-player-stats">' + (player.total_bullets || 0) + ' bullets • Effect: ' + escapeHtml(weaponInfo.weaponEffect) + '</div>' +
            '</div>' +
            '<span class="square-player-arrow">›</span>';

        playerItem.addEventListener('click', function(e) {
            e.stopPropagation();
            popup.remove();
            showPlayerInfoPopup(player);
        });

        list.appendChild(playerItem);
    });

    content.appendChild(list);
    popup.appendChild(content);
    document.body.appendChild(popup);

    // Close handlers
    var closeBtn = popup.querySelector('.square-players-close');
    closeBtn.addEventListener('click', function() {
        popup.remove();
    });

    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });

    // Show the popup with animation
    setTimeout(function() {
        popup.classList.add('active');
    }, 10);
}

// Starts periodic multiplayer refresh so board markers stay reasonably current.
function startMultiplayerRefresh() {
    fetchAllPlayers().then(function() {
        createGameBoard();
    });

    if (multiplayerState.refreshInterval) {
        clearInterval(multiplayerState.refreshInterval);
    }
    multiplayerState.refreshInterval = setInterval(function() {
        fetchAllPlayers().then(function() {
            createGameBoard();
        });
    }, multiplayerState.REFRESH_RATE_MS);
}

// Stops polling when leaving gameplay context.
function stopMultiplayerRefresh() {
    if (multiplayerState.refreshInterval) {
        clearInterval(multiplayerState.refreshInterval);
        multiplayerState.refreshInterval = null;
    }
}

// Detailed player card modal (character, bullets, time, lives, visited count).
function showPlayerInfoPopup(player) {
    var modal = document.getElementById('player-info-modal');
    if (!modal) return;

    var characterIcon = document.getElementById('popup-character-icon');
    var playerName = document.getElementById('popup-player-name');
    var characterName = document.getElementById('popup-character-name');
    var position = document.getElementById('popup-position');
    var bullets = document.getElementById('popup-bullets');
    var time = document.getElementById('popup-time');
    var lives = document.getElementById('popup-lives');
    var visited = document.getElementById('popup-visited');
    var weaponInfo = getWeaponInfo(player.selected_character, player.weapon_type || player.selected_weapon);

    if (characterIcon) {
        characterIcon.innerHTML = renderAvatarMarkup(player, 'player-info-avatar', 64, 'rgba(255,255,255,0.82)');
    }
    if (playerName) playerName.textContent = player.username || 'Unknown Player';
    if (characterName) {
        var charNames = { knight: 'Knight', wizard: 'Wizard', archer: 'Archer', warrior: 'Warrior' };
        var heroName = charNames[player.selected_character] || 'Unknown';
        characterName.textContent = heroName + ' • ' + weaponInfo.weaponName;
    }
    if (position) position.textContent = 'Square ' + (player.current_square || 1);
    if (bullets) bullets.textContent = (player.total_bullets || 0) + ' bullets • ' + weaponInfo.weaponEffect;
    if (time) time.textContent = formatTime(player.time_played || 0);
    if (lives) lives.textContent = (player.lives || 0) + ' remaining';
    if (visited) {
        var visitedCount = (player.visited_squares || []).length;
        visited.textContent = visitedCount + ' squares';
    }

    modal.classList.remove('hidden');
}

function closePlayerInfoPopup() {
    var modal = document.getElementById('player-info-modal');
    if (modal) modal.classList.add('hidden');
}

// Sync HUD widgets from canonical gameState values.
function updatePlayerInfo() {
    var charSpan = document.getElementById('player-character');
    var bulletsSpan = document.getElementById('player-bullets');
    var livesSpan = document.getElementById('player-lives');
    var squareSpan = document.getElementById('player-square');
    var timeSpan = document.getElementById('player-time');
    var perkSpan = document.getElementById('player-perk');
    var nameSpan = document.getElementById('player-name-display');

    console.log('Updating player info with character:', gameState.character);
    if (!gameState.weaponType) gameState.weaponType = resolveWeaponType(gameState.character);
    if (charSpan) charSpan.textContent = getCharacterIcon(gameState.character) + ' ' + getCharacterDisplayName(gameState.character);
    if (bulletsSpan) bulletsSpan.textContent = gameState.bullets;
    if (livesSpan) livesSpan.textContent = gameState.lives;
    if (squareSpan) squareSpan.textContent = (gameState.currentSquare === 0) ? 'START' : gameState.currentSquare;
    if (timeSpan) timeSpan.textContent = formatTime(gameState.timeElapsed);
    if (perkSpan) perkSpan.textContent = getPerkDescription();
    if (nameSpan) nameSpan.textContent = gameState.username || 'Player';
}

// Shared m:ss formatter for timers and leaderboard rows.
function formatTime(totalSeconds) {
    totalSeconds = Number(totalSeconds || 0);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
}

// Real-time clock updater for the current run.
function startTimer() {
    if (timerIntervalId) return;
    timerIntervalId = setInterval(function () {
        if (!gameState.timeStarted) return;
        var elapsed = Math.floor((Date.now() - gameState.timeStarted) / 1000);
        gameState.timeElapsed = elapsed;
        var timeSpan = document.getElementById('player-time');
        if (timeSpan) timeSpan.textContent = formatTime(elapsed);
    }, 1000);
}

// Background autosave loop for logged-in users.
function startAutosave() {
    if (autosaveIntervalId) return;
    autosaveIntervalId = setInterval(function () {
        if (gameState.isGuest) return;
        saveProgressSilently();
    }, AUTOSAVE_EVERY_SECONDS * 1000);
}

// Check if a lesson or question modal is currently open
function isLessonOrQuestionOpen() {
    // Check inline lesson container (Section 1)
    var inlineLesson = document.getElementById('inline-lesson-container');
    if (inlineLesson && inlineLesson.classList.contains('active')) {
        return true;
    }

    // Check question modal (Section 2)
    var questionModal = document.getElementById('question-modal');
    if (questionModal && questionModal.classList.contains('active')) {
        return true;
    }

    return false;
}

function rollDice() {
    playSfx('dice');
    // Block dice roll if a lesson or question is currently open
    if (isLessonOrQuestionOpen()) {
        alert('Please close the current lesson or question first before rolling the dice.\n\nYou can close it by clicking the X button to return to the game board.');
        return;
    }

    var diceBtn = document.getElementById('roll-dice-btn');
    if (diceBtn) diceBtn.disabled = true;

    var section = window.snakesGameSection || 1;
    var roll;
    // Section 1 intentionally advances one lesson at a time.
    if (section === 1) {
        roll = 1;
    } else {
        roll = Math.floor(Math.random() * 6) + 1;
    }

    showDiceAnimation(roll).then(function() {
        movePlayer(roll).then(function () {
            if (diceBtn) diceBtn.disabled = false;
        });
    });
}

// Cosmetic dice animation gate before movement is applied.
function showDiceAnimation(roll) {
    return new Promise(function(resolve) {
        var overlay = document.getElementById('dice-overlay');
        var cube = document.getElementById('dice-cube');
        var resultDisplay = document.getElementById('dice-result-display');
        var resultNumber = document.getElementById('dice-result-number');

        if (!overlay || !cube) {
            alert('You rolled a ' + roll + '!');
            resolve();
            return;
        }

        var faceRotations = {
            1: 'rotateX(0deg) rotateY(0deg)',
            2: 'rotateX(0deg) rotateY(90deg)',
            3: 'rotateX(-90deg) rotateY(0deg)',
            4: 'rotateX(90deg) rotateY(0deg)',
            5: 'rotateX(0deg) rotateY(-90deg)',
            6: 'rotateX(0deg) rotateY(180deg)'
        };

        overlay.classList.remove('hidden');
        if (resultDisplay) resultDisplay.classList.remove('show');
        cube.classList.remove('rolling');
        cube.style.transform = '';

        void cube.offsetWidth;

        cube.classList.add('rolling');

        setTimeout(function() {
            cube.classList.remove('rolling');
            cube.style.transform = faceRotations[roll];

            if (resultNumber) resultNumber.textContent = roll;
            if (resultDisplay) resultDisplay.classList.add('show');

            setTimeout(function() {
                overlay.classList.add('hidden');
                cube.style.transform = '';
                resolve();
            }, 1200);
        }, 1500);
    });
}

// Core movement update: clamp range, avoid repeats in section 2, persist, then resolve landing.
function movePlayer(steps) {
    return new Promise(function (resolve) {
        var section = window.snakesGameSection || 1;
        var sectionStart = (section === 1) ? 0 : FIRST_SECTION_SIZE;
        var sectionEnd = (section === 1) ? (FIRST_SECTION_SIZE - 1) : (FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1);

        var tentative = gameState.currentSquare + steps;
        if (section === 1) {
            if (tentative > sectionEnd) tentative = sectionEnd;
        } else {
            if (tentative > sectionEnd) {
                tentative = sectionEnd;
            }
        }

        if (section === 2) {
            var maxAttempts = SECOND_SECTION_SIZE;
            var attempts = 0;
            var newSquare = tentative;
            while (gameState.visitedSquares.indexOf(newSquare) !== -1 && attempts < maxAttempts) {
                newSquare++;
                if (newSquare > sectionEnd) newSquare = sectionStart;
                attempts++;
            }
            if (attempts >= maxAttempts) newSquare = tentative;

            gameState.currentSquare = newSquare;
            if (gameState.visitedSquares.indexOf(newSquare) === -1) gameState.visitedSquares.push(newSquare);
        } else {
            var newSquare = tentative;
            gameState.currentSquare = newSquare;
            if (gameState.visitedSquares.indexOf(newSquare) === -1) gameState.visitedSquares.push(newSquare);
        }

        createGameBoard();
        updatePlayerInfo();
        saveProgress();

        // Add landing animation to player marker
        var playerMarker = document.querySelector('.player-marker');
        if (playerMarker) {
            playerMarker.classList.add('landing');
            setTimeout(function() {
                playerMarker.classList.remove('landing');
            }, 400);
        }

        handleSquareEvent();
        resolve();
    });
}

// Function to show a lesson (for clicking on visited squares or landing)
function goToLesson(lessonNum) {
    if (lessonNum < 1 || lessonNum > FIRST_LESSON_COUNT) {
        console.warn('Invalid lesson number:', lessonNum);
        return;
    }
    // Use inline lesson system if available (stays on same page)
    if (typeof window.showInlineLesson === 'function') {
        window.showInlineLesson(lessonNum);
    } else {
        // Fallback to separate page
        window.location.href = 'lessons/lesson' + lessonNum + '.html';
    }
}

// Function to check how many lessons are completed and show status
function checkLessonProgress() {
    var completed = 0;
    var incomplete = [];
    for (var i = 1; i <= FIRST_LESSON_COUNT; i++) {
        if (gameState.completedLessons.indexOf(i) !== -1) {
            completed++;
        } else if (gameState.visitedSquares.indexOf(i) !== -1) {
            incomplete.push(i);
        }
    }
    return { completed: completed, incomplete: incomplete, total: FIRST_LESSON_COUNT };
}

// Landing resolution dispatcher for both board sections.
function handleSquareEvent() {
    var section = window.snakesGameSection || 1;
    var square = gameState.currentSquare;
    console.log('Section:', section, 'Square:', square);

    if (section === 1) {
        if (square === 0) {
            alert('This is START. Roll the dice to move to the first lesson.');
            return;
        }

        if (square >= 1 && square <= FIRST_LESSON_COUNT) {
            var lessonNum = square;

            // Always go to lesson if not completed yet
            if (gameState.completedLessons.indexOf(lessonNum) === -1) {
                goToLesson(lessonNum);
                return;
            }

            // Lesson is completed - check overall progress
            var progress = checkLessonProgress();

            if (progress.completed >= FIRST_LESSON_COUNT) {
                // All lessons done!
                if (gameState.unlockedSections.indexOf('half2') === -1) {
                    gameState.unlockedSections.push('half2');
                    saveProgress();
                }
                alert('All lessons completed! You can now go to the next section using the arrow button.');
            } else {
                // Some lessons still incomplete
                var msg = 'Lesson ' + lessonNum + ' is already complete!\n\n';
                msg += 'Progress: ' + progress.completed + '/' + progress.total + ' lessons completed.\n\n';
                if (progress.incomplete.length > 0) {
                    msg += 'Click on lesson squares ' + progress.incomplete.join(', ') + ' to complete them.\n';
                    msg += 'You can revisit any visited square by clicking on it.';
                }
                alert(msg);
            }
            return;
        }
    }
    
    if (section === 2) {
        var sectionStart = FIRST_SECTION_SIZE;
        var sectionEnd = FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1;
        var dest = snakesAndLaddersMap[square];
        // Snake/ladder teleport is animated and then re-enters square resolution.
        if (dest) {
            animateMoveToSquare(square, dest);
            return;
        }
        if (square === sectionEnd) {
            if (gameState.isGuest || gameState.isDemoMode) {
                if (gameState.unlockedSections.indexOf('boss') === -1) gameState.unlockedSections.push('boss');
                saveProgress();
                alert('You reached the end of the questions! You can now proceed to the boss.');
                return;
            }
            checkPlayerTopFive().then(function (isTopFive) {
                if (isTopFive) {
                    if (gameState.unlockedSections.indexOf('boss') === -1) gameState.unlockedSections.push('boss');
                    saveProgress();
                    alert('You reached the end of the section! As a top player, you may now proceed to the boss.');
                } else {
                    alert('You reached the end of the questions, but only the top 10 players can proceed to the boss. Check the leaderboard and try to earn more bullets!');
                }
            }).catch(function () { alert('Unable to check leaderboard at this time. Try again later.'); });
            return;
        }
        if (square >= sectionStart && square < sectionEnd) {
            var idx = square - sectionStart;
            var row2 = Math.floor(idx / 10) + 1;
            var index2 = idx % 10;
            showQuestionModal(square, row2, index2);
            return;
        }
    }
    
    console.warn('Unhandled square event:', square, 'in section', section);
}

// Question-square flow: mini-game gate -> answer submit -> bullet reward/progress update.
function showQuestionModal(square, row, index) {
    var modal = document.getElementById('question-modal');
    if (!modal) {
        console.error('Question modal not found');
        return;
    }

    if (!window.QUESTIONS_BANK) {
        alert('Question data not loaded. Please refresh the page.');
        return;
    }

    var BANK = window.QUESTIONS_BANK;
    if (!BANK[row] || !BANK[row][index]) {
        console.error('Question not found for row/index:', row, index);
        alert('Question not found. Please try again.');
        return;
    }

    var question = BANK[row][index];

    document.getElementById('question-title').textContent = 'Lesson ' + row + ' • Question ' + (index + 1);
    document.getElementById('question-subtitle').textContent = 'Complete the mini-game first, then answer to earn 5 bullets!';
    document.getElementById('question-prompt').textContent = question.prompt;
    document.getElementById('question-meta').textContent = 'Square: ' + square + ' (Row ' + row + ', Index ' + index + ')';

    var optionsDiv = document.getElementById('question-options');
    optionsDiv.innerHTML = '';

    question.options.forEach(function(opt, i) {
        var label = document.createElement('label');
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'question-answer';
        radio.value = i;
        radio.disabled = true; // Initially disabled until mini-game is completed
        label.appendChild(radio);
        label.appendChild(document.createTextNode(' ' + opt));
        optionsDiv.appendChild(label);
    });

    // Track mini-game completion for this question modal
    var miniGameCompleted = false;

    // Function to enable question UI after mini-game completion
    function enableQuestionUI() {
        miniGameCompleted = true;
        var radios = optionsDiv.querySelectorAll('input[type="radio"]');
        radios.forEach(function(radio) {
            radio.disabled = false;
        });
        var submitBtn = document.getElementById('question-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
        document.getElementById('question-subtitle').textContent = 'Answer correctly to earn 5 bullets!';
    }


    // Function to check mini-game completion periodically
    // Function to check mini-game completion periodically
    // ONLY checks for arcadeCompleted='true' which is set by MiniGames system on successful completion
    function checkMiniGameCompletion() {
        if (miniGameCompleted) return;

        var arcadeZone = modal.querySelector('.question-arcade');
        if (arcadeZone) {
            // Only unlock if the game was successfully completed (not just finished/timed out)
            if (arcadeZone.dataset.arcadeCompleted === 'true') {
                enableQuestionUI();
                return;
            }
        }
        // Keep checking if modal is still active
        if (modal.classList.contains('active')) {
            setTimeout(checkMiniGameCompletion, 500);
        }
    }

    var arcadeZone = modal.querySelector('.question-arcade');
    if (arcadeZone) {
        // Reset arcade completion state
        delete arcadeZone.dataset.arcadeCompleted;
        delete arcadeZone.dataset.arcadeMode; // Remove any old mode attribute

        // ALWAYS use MiniGames system - no fallback to old games
        if (!window.MiniGames) {
            console.error('MiniGames not loaded! Cannot show question modal.');
            alert('Game system not loaded. Please refresh the page.');
            return;
        }

        // Get the game distribution for this row (cached per row)
        // Each row has 10 squares, each game appears twice
        if (!window.questionGameDistributions) {
            window.questionGameDistributions = {};
        }
        if (!window.questionGameDistributions[row]) {
            // Get all 5 game names for this lesson
            var gameNames = window.MiniGames.GAME_NAMES[row] || [];
            if (gameNames.length >= 5) {
                // Each game appears twice for 10 squares total
                var fullDistribution = [];
                gameNames.forEach(function(name) {
                    fullDistribution.push(name);
                    fullDistribution.push(name);
                });
                // Shuffle the distribution
                for (var i = fullDistribution.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = fullDistribution[i];
                    fullDistribution[i] = fullDistribution[j];
                    fullDistribution[j] = temp;
                }
                window.questionGameDistributions[row] = fullDistribution;
            } else {
                // Fallback to basic distribution
                window.questionGameDistributions[row] = window.MiniGames.getGameDistributionForRow(row);
            }
        }
        var distribution = window.questionGameDistributions[row];
        var gameName = distribution[index % distribution.length];

        // Get game display name from the game object
        var gameObj = window.MiniGames.getGame(row, gameName);
        var gameTitle = 'Mini Challenge';
        var gameDesc = 'Complete the challenge!';
        if (gameObj && gameObj.name) {
            gameTitle = gameObj.name;
        }

        // Set attributes for MiniGames integration
        arcadeZone.dataset.arcadeLesson = row;
        arcadeZone.dataset.arcadeGame = gameName;
        arcadeZone.classList.add('arcade-zone', 'compact');
        delete arcadeZone.dataset.arcadeDefer; // Remove defer flag

        gameDesc = 'Complete the ' + gameTitle + ' challenge to unlock the question!';

        arcadeZone.querySelector('.arcade-header h3').textContent = gameTitle;
        arcadeZone.querySelector('.arcade-header p').textContent = gameDesc;
        arcadeZone.dataset.arcadeComplete = 'Challenge complete! Now answer the question to earn bullets.';

        // Initialize arcade when modal opens
        if (typeof window.initArcadeZone === 'function') {
            try {
                // Clear any existing arcade instance
                var existingGrid = arcadeZone.querySelector('.arcade-grid');
                if (existingGrid) {
                    existingGrid.innerHTML = '';
                }
                // Create new arcade instance
                window.initArcadeZone(arcadeZone);
            } catch(e) {
                console.warn('Could not initialize arcade:', e);
            }
        }
    }

    var submitBtn = document.getElementById('question-submit');
    var newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);

    // Initially disable submit button until mini-game is completed
    newBtn.disabled = true;
    newBtn.style.opacity = '0.5';
    newBtn.style.cursor = 'not-allowed';

    newBtn.addEventListener('click', function() {
        // Check if mini-game is completed
        if (!miniGameCompleted) {
            alert('Please complete the mini-game challenge first!');
            return;
        }

        var selected = document.querySelector('input[name="question-answer"]:checked');
        if (!selected) {
            alert('Please select an answer.');
            return;
        }

        newBtn.disabled = true;

        var chosen = parseInt(selected.value, 10);
        var correct = (chosen === question.answer);
        playSfx(correct ? 'correct' : 'wrong');
        var bullets = correct ? QUESTION_BULLETS : 0;

        // If in demo mode, handle locally without API call
        if (gameState.isDemoMode || gameState.isGuest) {
            alert(correct ? ('Correct! You earned ' + QUESTION_BULLETS + ' bullets.') : 'Incorrect. No bullets awarded.');

            if (correct) {
                gameState.bullets += QUESTION_BULLETS;
                if (gameState.completedQuestions.indexOf(square) === -1) {
                    gameState.completedQuestions.push(square);
                }
                // Save demo progress to sessionStorage
                if (gameState.isDemoMode) {
                    saveDemoProgress();
                }
                updatePlayerInfo();
            }

            closeQuestionModal();
            createGameBoard();
            newBtn.disabled = false;
            return;
        }

        fetch(API_URL + '/snakes/answer-question', {
            method: 'POST',
            mode: fetchOptions.mode,
            cache: fetchOptions.cache,
            credentials: fetchOptions.credentials,
            headers: fetchOptions.headers,
            body: JSON.stringify({
                square: Number(square) + 1,
                row: row,
                question_index: index,
                correct: correct,
                bullets_earned: bullets
            })
        })
        .then(function(res) {
            if (res.ok) {
                alert(correct ? ('Correct! You earned ' + QUESTION_BULLETS + ' bullets.') : 'Incorrect. No bullets awarded.');

                if (correct) {
                    gameState.bullets += QUESTION_BULLETS;
                    updatePlayerInfo();
                }

                closeQuestionModal();
                createGameBoard();

                return;
            }

            return res.json().then(function(data) {
                alert(data.error || data.message || 'Error submitting answer.');
            });
        })
        .catch(function(err) {
            console.error(err);
            alert('Network error.');
        })
        .finally(function() {
            newBtn.disabled = false;
        });
    });

    // Add autofill button handler for demo mode
    var autofillBtn = document.getElementById('question-autofill');
    if (autofillBtn) {
        // Clone to remove any existing listeners
        var newAutofillBtn = autofillBtn.cloneNode(true);
        autofillBtn.parentNode.replaceChild(newAutofillBtn, autofillBtn);

        newAutofillBtn.addEventListener('click', function() {
            autofillCurrentQuestion(square, row, index);
        });
    }

    modal.classList.add('active');

    // Start checking for mini-game completion
    setTimeout(checkMiniGameCompletion, 500);
}

var snakesAndLaddersMap = {
    // LADDERS (10 total) - go UP from lower to higher square
    7: 14,    // Ladder 1
    9: 19,    // Ladder 2
    12: 26,   // Ladder 3
    13: 31,   // Ladder 4
    21: 39,   // Ladder 5
    24: 35,   // Ladder 6
    29: 41,   // Ladder 7
    33: 47,   // Ladder 8
    36: 49,   // Ladder 9
    43: 53,   // Ladder 10

    // SNAKES (10 total) - go DOWN from higher to lower square
    16: 8,    // Snake 1
    18: 10,   // Snake 2
    27: 15,   // Snake 3
    32: 20,   // Snake 4
    38: 22,   // Snake 5
    40: 28,   // Snake 6
    45: 34,   // Snake 7
    48: 37,   // Snake 8
    51: 42,   // Snake 9
    54: 44    // Snake 10
};

// Handles snake/ladder travel animation, then commits destination square and triggers next event.
function animateMoveToSquare(from, to) {
    var board = document.getElementById('game-board');
    var fromEl = board.querySelector('[data-square="' + from + '"]');
    var toEl = board.querySelector('[data-square="' + to + '"]');
    var isLadder = to > from;

    if (!fromEl || !toEl) {
        gameState.currentSquare = to;
        if (gameState.visitedSquares.indexOf(to) === -1) gameState.visitedSquares.push(to);
        createGameBoard(); updatePlayerInfo(); saveProgress();
        handleSquareEvent();
        return;
    }

    var marker = document.createElement('div');
    marker.className = 'floating-marker';
    marker.textContent = getCharacterIcon(gameState.character);
    marker.style.position = 'absolute';
    marker.style.zIndex = 9999;
    document.body.appendChild(marker);

    var fromRect = fromEl.getBoundingClientRect();
    var toRect = toEl.getBoundingClientRect();

    // Center the larger marker properly
    marker.style.left = (fromRect.left + (fromRect.width / 2) - 20) + 'px';
    marker.style.top = (fromRect.top + (fromRect.height / 2) - 20) + 'px';
    marker.style.transition = 'all 0.9s cubic-bezier(.2,.8,.2,1)';

    if (isLadder) {
        playSfx('ladder');
        marker.classList.add('ladder-anim');
    } else {
        playSfx('snake');
        marker.classList.add('snake-anim');
    }

    setTimeout(function () {
        marker.style.left = (toRect.left + (toRect.width / 2) - 20) + 'px';
        marker.style.top = (toRect.top + (toRect.height / 2) - 20) + 'px';
    }, 20);

    setTimeout(function () {
        document.body.removeChild(marker);
        gameState.currentSquare = to;
        if (gameState.visitedSquares.indexOf(to) === -1) gameState.visitedSquares.push(to);
        createGameBoard(); updatePlayerInfo(); saveProgress();

        // Add climbing or sliding animation to the player marker after landing
        var playerMarker = document.querySelector('.player-marker');
        if (playerMarker) {
            if (isLadder) {
                playerMarker.classList.add('climbing');
                setTimeout(function() {
                    playerMarker.classList.remove('climbing');
                }, 800);
            } else {
                playerMarker.classList.add('sliding');
                setTimeout(function() {
                    playerMarker.classList.remove('sliding');
                }, 800);
            }
        }

        handleSquareEvent();
    }, 1000);
}

// Section navigation controls (part1 <-> part2).
function navigatePrev() {
    var section = window.snakesGameSection || 1;
    if (section === 2) window.location.href = 'game-board-part1.html';
}

// Gated forward navigation (lesson completion / leaderboard placement checks).
function navigateNext() {
    var section = window.snakesGameSection || 1;
    var overlay = document.getElementById('locked-overlay');

    if (section === 1) {
        if (gameState.unlockedSections.indexOf('half2') === -1) {
            if (overlay) overlay.style.display = 'flex';
            return;
        }
        window.location.href = 'game-board-part2.html';
    } else if (section === 2) {
        if (gameState.isGuest || gameState.isDemoMode) {
            if (gameState.unlockedSections.indexOf('boss') === -1) gameState.unlockedSections.push('boss');
            saveProgress();
            window.location.href = 'mode-selection.html';
            return;
        }
        if (gameState.unlockedSections.indexOf('boss') === -1) {
            checkPlayerTopFive().then(function (isTopFive) {
                if (!isTopFive) {
                    if (overlay) overlay.style.display = 'flex';
                    alert('Only the top 10 players on the leaderboard can enter the boss battle. Climb the ranks!');
                    return;
                }
                if (gameState.unlockedSections.indexOf('boss') === -1) gameState.unlockedSections.push('boss');
                saveProgress();
                window.location.href = 'mode-selection.html';
            }).catch(function () { if (overlay) overlay.style.display = 'flex'; });
            return;
        }
        window.location.href = 'mode-selection.html';
    }
}

// Boss access check uses top-10 leaderboard position.
function checkPlayerTopFive() {
    if (gameState.isGuest || gameState.isDemoMode) return Promise.resolve(true);

    return fetch(API_URL + '/snakes/leaderboard?limit=10', {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
        .then(function (res) { if (!res.ok) throw new Error('Leaderboard fetch failed'); return res.json(); })
        .then(function (data) {
            var lb = data.leaderboard || [];
            for (var i = 0; i < lb.length && i < 10; i++) {
                if (lb[i].user_id === gameState.userId) return true;
            }
            return false;
        });
}

// Locks section access overlays until prerequisites are met.
function checkSectionLock() {
    var section = window.snakesGameSection || 1;
    var overlay = document.getElementById('locked-overlay');
    if (!overlay) return;

    if (section === 2 && gameState.unlockedSections.indexOf('half2') === -1) overlay.style.display = 'flex';
    else if (section === 3 && gameState.unlockedSections.indexOf('boss') === -1) overlay.style.display = 'flex';
    else overlay.style.display = 'none';
}

// Baseline leaderboard renderer (enhanced version can override this in companion file).
function viewLeaderboard() {
    var modal = document.getElementById('leaderboard-modal');
    var tbody = document.querySelector('#leaderboard-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="loading-spinner">Loading leaderboard...</td></tr>';
    if (modal) modal.classList.remove('hidden');

    fetch(API_URL + '/snakes/leaderboard?limit=10', {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
        .then(function (res) { if (!res.ok) throw new Error('Failed to fetch leaderboard'); return res.json(); })
        .then(function (data) {
            tbody.innerHTML = '';
            var leaderboardData = data.leaderboard || [];
            if (leaderboardData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-leaderboard">
                            <div class="empty-leaderboard-icon">🏆</div>
                            <p>No players yet! Be the first to earn bullets!</p>
                        </td>
                    </tr>
                `;
                return;
            }
            for (var i = 0; i < leaderboardData.length; i++) {
                var entry = leaderboardData[i];
                var tr = document.createElement('tr');
                if (entry.user_id === gameState.userId) tr.className = 'current-user-row';

                var rankClass = '';
                if (i === 0) rankClass = 'gold';
                else if (i === 1) rankClass = 'silver';
                else if (i === 2) rankClass = 'bronze';
                else rankClass = 'regular';

                var rankBadge = '<span class="rank-badge ' + rankClass + '">' + (i + 1) + '</span>';
                var characterIcon = getCharacterIcon(entry.selected_character || 'knight');

                tr.innerHTML =
                    '<td class="rank-col">' + rankBadge + '</td>' +
                    '<td class="player-col">' + characterIcon + ' ' + (entry.username || 'Unknown') + '</td>' +
                    '<td class="bullets-col">' + (entry.total_bullets || 0) + '</td>' +
                    '<td class="time-col">' + formatTime(entry.time_played || 0) + '</td>';

                tbody.appendChild(tr);
            }
        })
        .catch(function (err) {
            console.error('Leaderboard error:', err);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-leaderboard">
                        <div class="empty-leaderboard-icon">⚠️</div>
                        <p>Error loading leaderboard. Please try again.</p>
                    </td>
                </tr>
            `;
        });

    // Display name and dice only; no extra leaderboard rank block
}

// Opens boss modal only after top-player verification.
function startBossBattle() {
    checkPlayerTopFive().then(function (isTopFive) {
        if (!isTopFive) {
            alert('Only the top 10 players can participate in the boss battle. Check the leaderboard to see where you stand.');
            return;
        }
        loadProgress().then(function () {
            var modal = document.getElementById('boss-modal');
            if (modal) {
                var pb = document.getElementById('boss-player-bullets'); if (pb) pb.textContent = gameState.bullets;
                var pl = document.getElementById('boss-player-lives'); if (pl) pl.textContent = gameState.lives;
                var ph = document.getElementById('boss-health'); if (ph) ph.textContent = '1000';
                modal.classList.remove('hidden');
            }
        });
    }).catch(function () { alert('Unable to verify leaderboard status. Try again later.'); });
}

// ============================================
// AUTOFILL / DEMO MODE FUNCTIONS
// ============================================

/**
 * Autofill a single question square in Section 2
 * Marks mini-game complete, awards bullets, and closes modal
 */
function autofillCurrentQuestion(square, row, index) {
    enableDemoMode();

    // Award bullets locally
    gameState.bullets += QUESTION_BULLETS;

    // Mark this question square as completed
    if (gameState.completedQuestions.indexOf(square) === -1) {
        gameState.completedQuestions.push(square);
    }

    // Save demo progress to sessionStorage
    saveDemoProgress();

    // Update UI
    updatePlayerInfo();

    // Close the modal
    closeQuestionModal();

    // Refresh the board
    createGameBoard();

    alert('Demo Mode: Question auto-completed! You earned ' + QUESTION_BULLETS + ' bullets.\n\nNote: This progress is for demo purposes only and will not be saved to the leaderboard.');
}

/**
 * Autofill a single lesson in Section 1
 * Marks mini-game and quiz complete, awards bullets, closes lesson
 */
function autofillCurrentLesson(lessonNum) {
    enableDemoMode();

    // Award bullets locally
    gameState.bullets += LESSON_BULLETS;

    // Mark this lesson as completed
    if (gameState.completedLessons.indexOf(lessonNum) === -1) {
        gameState.completedLessons.push(lessonNum);
    }

    // Check if all lessons are done to unlock Section 2
    var allComplete = true;
    for (var i = 1; i <= FIRST_LESSON_COUNT; i++) {
        if (gameState.completedLessons.indexOf(i) === -1) {
            allComplete = false;
            break;
        }
    }
    if (allComplete && gameState.unlockedSections.indexOf('half2') === -1) {
        gameState.unlockedSections.push('half2');
    }

    // Save demo progress to sessionStorage
    saveDemoProgress();

    // Update UI
    updatePlayerInfo();

    // Close the inline lesson
    if (typeof window.closeInlineLesson === 'function') {
        window.closeInlineLesson();
    }

    // Refresh the board
    createGameBoard();

    alert('Demo Mode: Lesson ' + lessonNum + ' auto-completed! You earned ' + LESSON_BULLETS + ' bullets.\n\nNote: This progress is for demo purposes only and will not be saved to the leaderboard.');
}

/**
 * Autofill all remaining lessons in Section 1
 * Awards bullets for all incomplete lessons
 */
function autofillSection1() {
    enableDemoMode();

    var completedCount = 0;
    var bulletsEarned = 0;

    for (var i = 1; i <= FIRST_LESSON_COUNT; i++) {
        if (gameState.completedLessons.indexOf(i) === -1) {
            gameState.completedLessons.push(i);
            gameState.bullets += LESSON_BULLETS;
            bulletsEarned += LESSON_BULLETS;
            completedCount++;

            // Also mark square as visited
            if (gameState.visitedSquares.indexOf(i) === -1) {
                gameState.visitedSquares.push(i);
            }
        }
    }

    // Unlock Section 2
    if (gameState.unlockedSections.indexOf('half2') === -1) {
        gameState.unlockedSections.push('half2');
    }

    // Move player to last lesson square
    gameState.currentSquare = FIRST_LESSON_COUNT;

    // Save demo progress to sessionStorage
    saveDemoProgress();

    // Update UI
    updatePlayerInfo();

    // Close any open lesson modal
    if (typeof window.closeInlineLesson === 'function') {
        window.closeInlineLesson();
    }

    // Refresh the board
    createGameBoard();

    if (completedCount > 0) {
        alert('Demo Mode: Section 1 auto-completed!\n\n' +
            completedCount + ' lesson(s) completed\n' +
            bulletsEarned + ' bullets earned\n' +
            'Total bullets: ' + gameState.bullets + '\n\n' +
            'Note: This progress is for demo purposes only and will not be saved to the leaderboard.');
    } else {
        alert('All lessons in Section 1 are already complete!');
    }
}

/**
 * Autofill all remaining question squares in Section 2
 * Awards bullets for all incomplete questions
 */
function autofillSection2() {
    enableDemoMode();

    var completedCount = 0;
    var bulletsEarned = 0;
    var sectionStart = FIRST_SECTION_SIZE;
    var sectionEnd = FIRST_SECTION_SIZE + SECOND_SECTION_SIZE - 1;

    for (var square = sectionStart; square <= sectionEnd; square++) {
        if (gameState.completedQuestions.indexOf(square) === -1) {
            gameState.completedQuestions.push(square);
            gameState.bullets += QUESTION_BULLETS;
            bulletsEarned += QUESTION_BULLETS;
            completedCount++;

            // Also mark square as visited
            if (gameState.visitedSquares.indexOf(square) === -1) {
                gameState.visitedSquares.push(square);
            }
        }
    }

    // Move player to last square
    gameState.currentSquare = sectionEnd;

    // Save demo progress to sessionStorage
    saveDemoProgress();

    // Update UI
    updatePlayerInfo();

    // Close any open question modal
    closeQuestionModal();

    // Refresh the board
    createGameBoard();

    if (completedCount > 0) {
        alert('Demo Mode: Section 2 auto-completed!\n\n' +
            completedCount + ' question(s) completed\n' +
            bulletsEarned + ' bullets earned\n' +
            'Total bullets: ' + gameState.bullets + '\n\n' +
            'You now have enough bullets for the boss battle!\n\n' +
            'Note: This progress is for demo purposes only and will not be saved to the leaderboard.');
    } else {
        alert('All questions in Section 2 are already complete!');
    }
}
// ============================================
// BULLET COUNT REFRESH - ADD THIS TO snakes-game.js
// ============================================

/**
 * Fetch fresh bullet count from server
 * This ensures admin changes are reflected in the game
 */
function refreshBulletCount() {
    if (gameState.isGuest || gameState.isDemoMode) return Promise.resolve();

    return fetch(API_URL + '/snakes/', {
        method: 'GET',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers
    })
    .then(function (response) { 
        if (!response.ok) return null; 
        return response.json(); 
    })
    .then(function (data) {
        if (!data) return;
        
        // Update bullets from server
        var serverBullets = Number(data.total_bullets || 0);
        
        // Only update if changed to avoid unnecessary UI updates
        if (gameState.bullets !== serverBullets) {
            console.log('Bullet count updated from server:', gameState.bullets, '->', serverBullets);
            gameState.bullets = serverBullets;
            updatePlayerInfo();
            
            // Also update boss battle display if it's open
            var bossBullets = document.getElementById('boss-player-bullets');
            if (bossBullets) {
                bossBullets.textContent = gameState.bullets;
            }
        }
    })
    .catch(function (error) { 
        console.error('Error refreshing bullet count:', error); 
    });
}

/**
 * Start periodic bullet count refresh
 * Refreshes every 5 seconds to catch admin changes
 */
function startBulletRefresh() {
    // Do initial refresh
    refreshBulletCount();
    
    // Then refresh every 5 seconds
    if (bulletRefreshIntervalId) return;
    bulletRefreshIntervalId = setInterval(function() {
        refreshBulletCount();
    }, 5000);
}

// ============================================
// DISPLAY NAME / THEMES / HINT BAR
// ============================================
// Display-name helpers keep identity prompts consistent across guest/auth sessions.
function getStoredDisplayName() {
    try {
        return gameState.isGuest
            ? sessionStorage.getItem(DISPLAY_NAME_KEY)
            : localStorage.getItem(DISPLAY_NAME_KEY);
    } catch (e) {
        return null;
    }
}

function storeDisplayName(name) {
    try {
        if (gameState.isGuest) {
            sessionStorage.setItem(DISPLAY_NAME_KEY, name);
            sessionStorage.setItem('snakes_guest_name', name);
        } else {
            localStorage.setItem(DISPLAY_NAME_KEY, name);
        }
    } catch (e) {}
}

// Save display name to profile endpoints and local UI state.
function saveDisplayName(name) {
    gameState.username = name;
    updatePlayerInfo();
    storeDisplayName(name);

    if (gameState.isGuest) return Promise.resolve();

    var updateUser = fetch(API_URL + '/user', {
        method: 'PUT',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers,
        body: JSON.stringify({ name: name })
    }).catch(function () {});

    var updateGame = fetch(API_URL + '/snakes/', {
        method: 'PUT',
        mode: fetchOptions.mode,
        cache: fetchOptions.cache,
        credentials: fetchOptions.credentials,
        headers: fetchOptions.headers,
        body: JSON.stringify({ username: name })
    }).catch(function () {});

    return Promise.all([updateUser, updateGame]);
}

var displayNameResolve = null;
// Promise gate used during startup so gameplay waits for a valid display name.
function ensureDisplayName() {
    return new Promise(function (resolve) {
        var modal = document.getElementById('display-name-modal');
        if (!modal) return resolve();

        var stored = getStoredDisplayName();
        if (stored) {
            saveDisplayName(stored).then(resolve);
            return;
        }

        displayNameResolve = resolve;
        showDisplayNameModal(false);
    });
}

// Show/hide modal controls used by initial prompt and manual edit button.
function showDisplayNameModal(allowCancel) {
    var modal = document.getElementById('display-name-modal');
    var input = document.getElementById('display-name-input');
    var skipBtn = document.getElementById('display-name-skip');
    if (!modal || !input) return;

    modal.classList.remove('hidden');
    input.value = gameState.username || '';
    input.focus();
    if (skipBtn) skipBtn.style.display = allowCancel ? 'inline-block' : 'none';
}

function hideDisplayNameModal() {
    var modal = document.getElementById('display-name-modal');
    if (modal) modal.classList.add('hidden');
}

// Validation path for submit button / Enter key.
function submitDisplayName() {
    var input = document.getElementById('display-name-input');
    if (!input) return;
    var name = String(input.value || '').trim();
    if (name.length < 2) {
        alert('Please enter at least 2 characters for your screen name.');
        return;
    }
    if (name.length > 20) name = name.slice(0, 20);
    saveDisplayName(name).then(function () {
        hideDisplayNameModal();
        if (displayNameResolve) {
            displayNameResolve();
            displayNameResolve = null;
        }
    });
}

// Skip uses current fallback username so flow can continue without blocking.
function skipDisplayName() {
    var fallback = gameState.username || 'Player';
    saveDisplayName(fallback).then(function () {
        hideDisplayNameModal();
        if (displayNameResolve) {
            displayNameResolve();
            displayNameResolve = null;
        }
    });
}


// ============================================
// EXPOSE FUNCTION GLOBALLY FOR MANUAL REFRESH
// ============================================
window.refreshBulletCount = refreshBulletCount;

// Expose autofill and demo mode functions globally
window.autofillCurrentQuestion = autofillCurrentQuestion;
window.autofillCurrentLesson = autofillCurrentLesson;
window.autofillSection1 = autofillSection1;
window.autofillSection2 = autofillSection2;
window.enableDemoMode = enableDemoMode;
window.saveDemoProgress = saveDemoProgress;
window.loadDemoProgress = loadDemoProgress;
