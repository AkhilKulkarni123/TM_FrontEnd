---
layout: post
title: Snakes and Ladders Game
description: A multiplayer snakes and ladders game with mini-games and a boss battle!
categories: [Games]
permalink: /snakes-game
type: hacks
microblog: True
---

<link rel="stylesheet" href="{{site.baseurl}}/assets/css/snakes-entry-flow.css">
<link rel="stylesheet" href="{{site.baseurl}}/assets/css/snakes-theme.css">

<div class="game-landing-container snakes-theme">
  <canvas id="pixelCanvas" class="pixel-background"></canvas>

  <div id="login-container">
    <div class="login-hero">
      <div class="login-icon">🐍</div>
      <h1 class="login-title">Welcome to Snakes & Ladders!</h1>
      <p class="login-subtitle">Choose how you'd like to start your adventure</p>
    </div>
    <div class="login-options">
      <button id="use-existing-login" class="login-btn primary-login">
        <span class="btn-icon">🔐</span>
        <div class="btn-content">
          <span class="btn-title">Use Website Login</span>
          <span class="btn-description">Save your progress and compete on leaderboards</span>
        </div>
      </button>
      <div class="login-divider"><span>or</span></div>
      <button id="play-as-guest" class="login-btn guest-login">
        <span class="btn-icon">👤</span>
        <div class="btn-content">
          <span class="btn-title">Play as Guest</span>
          <span class="btn-description">Quick play - Progress not saved</span>
        </div>
      </button>
      <div id="guest-display-panel" class="guest-display-panel hidden">
        <h3>Choose Your Screen Name</h3>
        <p>This name will show on the leaderboard and in multiplayer.</p>
        <input id="guest-display-name" type="text" maxlength="20" placeholder="e.g. SnakeMaster" />
        <div class="guest-display-actions">
          <button id="guest-name-continue" type="button">Continue</button>
          <button id="guest-name-default" type="button">Use Default</button>
        </div>
      </div>
    </div>
    <div class="login-footer">
      <p class="login-notice">
        <span class="notice-icon">ℹ️</span>
        Guest mode is perfect for trying out the game, but your progress won't be saved
      </p>
    </div>
  </div>

  <div id="character-selection" class="hidden theme-layout-v2">
    <div class="hero-selection-layout">
      <section class="hero-selector-main" aria-labelledby="hero-selection-title">
        <h2 id="hero-selection-title">Choose Your Hero</h2>
        <p class="character-select-instruction">Click arrows to browse - Click and hold on your desired character to select</p>
        <div class="character-carousel">
          <button class="carousel-btn prev-btn" id="prev-character" aria-label="Previous hero">&#9668;</button>
          <div class="carousel-container">
            <div class="carousel-track">
              <div class="character-card" data-character="knight" data-index="0">
                <div class="pixel-character knight-pixel"></div>
                <span class="character-name">Knight</span>
                <p class="character-description">Defensive Specialist</p>
              </div>
              <div class="character-card" data-character="wizard" data-index="1">
                <div class="pixel-character wizard-pixel"></div>
                <span class="character-name">Wizard</span>
                <p class="character-description">Magic Master</p>
              </div>
              <div class="character-card" data-character="archer" data-index="2">
                <div class="pixel-character archer-pixel"></div>
                <span class="character-name">Archer</span>
                <p class="character-description">Ranged Expert</p>
              </div>
              <div class="character-card" data-character="warrior" data-index="3">
                <div class="pixel-character warrior-pixel"></div>
                <span class="character-name">Warrior</span>
                <p class="character-description">Melee Berserker</p>
              </div>
            </div>
          </div>
          <button class="carousel-btn next-btn" id="next-character" aria-label="Next hero">&#9658;</button>
        </div>
        <div id="character-perk-display" class="character-perk-display">
          <div class="perk-header">Character Perk</div>
          <div class="perk-name" id="perk-name-display">Shielded</div>
          <div class="perk-description" id="perk-desc-display">+1 Max Life (starts with 6)</div>
        </div>
        <div id="character-weapon-display" class="character-weapon-display">
          <div class="weapon-header">Weapon</div>
          <div class="weapon-name" id="weapon-name-display">Bulwark Disc</div>
          <div class="weapon-description" id="weapon-desc-display">Throws a reinforced shield-disc that ricochets off one wall before fading.</div>
          <div class="weapon-effect">Effect: <span id="weapon-effect-display">Bounce</span></div>
        </div>
        <div id="avatar-upload-panel" class="avatar-upload-panel" aria-labelledby="avatar-upload-title">
          <div id="avatar-upload-title" class="avatar-upload-title">Upload Profile Picture</div>
          <div class="avatar-upload-row">
            <div id="avatar-preview" class="avatar-preview" aria-label="Profile picture preview">
              <span id="avatar-preview-fallback" class="avatar-preview-fallback">P</span>
            </div>
            <div class="avatar-upload-meta">
              <p>Shown in PvP, board tiles, and player lists.</p>
              <p class="avatar-upload-help">PNG/JPG/WEBP up to 2MB.</p>
            </div>
          </div>
          <input id="avatar-file-input" type="file" accept="image/png,image/jpeg,image/webp" hidden>
          <div class="avatar-upload-actions">
            <button type="button" id="avatar-upload-btn" class="avatar-btn" aria-label="Upload profile picture">Upload</button>
            <button type="button" id="avatar-reset-btn" class="avatar-btn secondary" aria-label="Remove profile picture">Remove</button>
          </div>
        </div>
        <button id="start-game-btn" class="game-start-btn" disabled>START ADVENTURE</button>
      </section>

      <aside class="theme-selector-panel" aria-labelledby="themes-heading">
        <h3 id="themes-heading" class="theme-panel-title">Themes</h3>
        <p class="theme-panel-subtitle">Pick a style for your full adventure.</p>
        <div class="theme-options" role="radiogroup" aria-label="Theme options">
          <button type="button" class="theme-option is-selected" role="radio" aria-checked="true" data-theme="default" data-theme-name="Default" aria-label="Default theme">
            <span class="theme-swatch" style="--swatch-1:#667eea; --swatch-2:#764ba2;" aria-hidden="true"></span>
            <span class="theme-option-label">Default</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="aurora-mint" data-theme-name="Aurora Mint" aria-label="Aurora Mint theme">
            <span class="theme-swatch" style="--swatch-1:#3dd6b0; --swatch-2:#0f766e;" aria-hidden="true"></span>
            <span class="theme-option-label">Aurora Mint</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="emberforge" data-theme-name="Emberforge" aria-label="Emberforge theme">
            <span class="theme-swatch" style="--swatch-1:#ff7a3d; --swatch-2:#c0392b;" aria-hidden="true"></span>
            <span class="theme-option-label">Emberforge</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="midnight-violet" data-theme-name="Midnight Violet" aria-label="Midnight Violet theme">
            <span class="theme-swatch" style="--swatch-1:#8b5cf6; --swatch-2:#4c1d95;" aria-hidden="true"></span>
            <span class="theme-option-label">Midnight Violet</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="solar-flare" data-theme-name="Solar Flare" aria-label="Solar Flare theme">
            <span class="theme-swatch" style="--swatch-1:#ffb703; --swatch-2:#fb8500;" aria-hidden="true"></span>
            <span class="theme-option-label">Solar Flare</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="oceanic-depths" data-theme-name="Oceanic Depths" aria-label="Oceanic Depths theme">
            <span class="theme-swatch" style="--swatch-1:#00b4d8; --swatch-2:#0077b6;" aria-hidden="true"></span>
            <span class="theme-option-label">Oceanic Depths</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="rose-nebula" data-theme-name="Rose Nebula" aria-label="Rose Nebula theme">
            <span class="theme-swatch" style="--swatch-1:#ff5ca8; --swatch-2:#c9184a;" aria-hidden="true"></span>
            <span class="theme-option-label">Rose Nebula</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="cyber-lime" data-theme-name="Cyber Lime" aria-label="Cyber Lime theme">
            <span class="theme-swatch" style="--swatch-1:#a3e635; --swatch-2:#4d7c0f;" aria-hidden="true"></span>
            <span class="theme-option-label">Cyber Lime</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="glacier-blue" data-theme-name="Glacier Blue" aria-label="Glacier Blue theme">
            <span class="theme-swatch" style="--swatch-1:#60a5fa; --swatch-2:#1d4ed8;" aria-hidden="true"></span>
            <span class="theme-option-label">Glacier Blue</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
          <button type="button" class="theme-option" role="radio" aria-checked="false" data-theme="sandstone-gold" data-theme-name="Sandstone Gold" aria-label="Sandstone Gold theme">
            <span class="theme-swatch" style="--swatch-1:#d4a373; --swatch-2:#a97142;" aria-hidden="true"></span>
            <span class="theme-option-label">Sandstone Gold</span>
            <span class="theme-check" aria-hidden="true">✓</span>
          </button>
        </div>
      </aside>
    </div>
  </div>
</div>

<script src="{{site.baseurl}}/assets/js/player-loadout.js"></script>
<script src="{{site.baseurl}}/assets/js/theme-selector.js"></script>
<script>
  // ---- Config ----
  var GAME_URL = '{{ site.baseurl }}/hacks/snakes/game-board-part1.html';
  var API_URL;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    API_URL = 'http://localhost:8306/api';
  } else {
    API_URL = 'https://snakes.opencodingsociety.com/api';
  }
  var fetchOpts = { mode: 'cors', cache: 'default', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Origin': 'client' } };
  var DISPLAY_NAME_KEY = 'snakes_display_name';
  var loadoutApi = window.SnakesLoadout || null;
  var CHARACTER_PERKS = {
    knight: { name: 'Shielded', desc: '+1 Max Life' },
    wizard: { name: 'Firebrand', desc: 'Double shot' },
    archer: { name: 'Keen Aim', desc: 'Homing bullets' },
    warrior: { name: 'Bravery', desc: 'Increased damage + Bleeding effect' }
  };
  var CHARACTER_WEAPONS = {
    knight: {
      weaponType: 'bulwark-disc',
      name: 'Bulwark Disc',
      desc: 'Throws a reinforced shield-disc that ricochets off one wall before fading.',
      effect: 'Bounce'
    },
    wizard: {
      weaponType: 'arcane-orb',
      name: 'Arcane Orb',
      desc: 'Launches volatile magic that bursts on impact and splashes nearby targets.',
      effect: 'Splash'
    },
    archer: {
      weaponType: 'piercing-arrow',
      name: 'Piercing Arrow',
      desc: 'Fires a fast precision bolt with light guidance and excellent travel speed.',
      effect: 'Piercing'
    },
    warrior: {
      weaponType: 'rage-axe',
      name: 'Rage Axe',
      desc: 'Hurls a heavy axe that hits hard and tears through front-line defenses.',
      effect: 'Cleave'
    }
  };

  var gameState = {
    isGuest: false,
    userId: null,
    username: '',
    character: '',
    weaponType: '',
    avatarData: '',
    avatarUrl: ''
  };

  function getHeroLoadout(character) {
    var hero = String(character || '').toLowerCase();
    if (loadoutApi && typeof loadoutApi.getLoadoutByHero === 'function') {
      return loadoutApi.getLoadoutByHero(hero);
    }
    var fallback = CHARACTER_WEAPONS[hero] || CHARACTER_WEAPONS.knight;
    return {
      hero: hero || 'knight',
      weaponType: fallback.weaponType,
      weaponName: fallback.name,
      weaponDescription: fallback.desc,
      weaponEffect: fallback.effect
    };
  }

  function resolveWeaponType(character, explicitWeapon) {
    if (loadoutApi && typeof loadoutApi.normalizeWeaponType === 'function') {
      return loadoutApi.normalizeWeaponType(character, explicitWeapon);
    }
    var hero = String(character || '').toLowerCase();
    if (CHARACTER_WEAPONS[hero]) {
      return explicitWeapon || CHARACTER_WEAPONS[hero].weaponType;
    }
    return explicitWeapon || 'bulwark-disc';
  }

  function persistAvatarData(dataUrl) {
    gameState.avatarData = dataUrl || '';
    try {
      if (gameState.isGuest) sessionStorage.setItem('snakes_avatar_data', gameState.avatarData);
      else localStorage.setItem('snakes_avatar_data', gameState.avatarData);
    } catch (e) {}
    if (loadoutApi && typeof loadoutApi.setAvatarData === 'function') {
      loadoutApi.setAvatarData(gameState.avatarData, !!gameState.isGuest);
    }
  }

  function persistAvatarUrl(url) {
    gameState.avatarUrl = url || '';
    try {
      if (gameState.isGuest) sessionStorage.setItem('snakes_avatar_url', gameState.avatarUrl);
      else localStorage.setItem('snakes_avatar_url', gameState.avatarUrl);
    } catch (e) {}
    if (loadoutApi && typeof loadoutApi.setAvatarUrl === 'function') {
      loadoutApi.setAvatarUrl(gameState.avatarUrl, !!gameState.isGuest);
    }
  }

  function clearAvatarStorage() {
    gameState.avatarData = '';
    gameState.avatarUrl = '';
    try {
      localStorage.removeItem('snakes_avatar_data');
      localStorage.removeItem('snakes_avatar_url');
      sessionStorage.removeItem('snakes_avatar_data');
      sessionStorage.removeItem('snakes_avatar_url');
    } catch (e) {}
    if (loadoutApi && typeof loadoutApi.clearAvatar === 'function') loadoutApi.clearAvatar();
    if (loadoutApi && typeof loadoutApi.clearAvatarUrl === 'function') loadoutApi.clearAvatarUrl();
  }

  function loadStoredAvatar() {
    var avatarData = '';
    var avatarUrl = '';
    try { avatarData = localStorage.getItem('snakes_avatar_data') || sessionStorage.getItem('snakes_avatar_data') || ''; } catch(e) {}
    try { avatarUrl = localStorage.getItem('snakes_avatar_url') || sessionStorage.getItem('snakes_avatar_url') || ''; } catch(e) {}
    if (loadoutApi && typeof loadoutApi.getAvatarData === 'function') avatarData = avatarData || loadoutApi.getAvatarData();
    if (loadoutApi && typeof loadoutApi.getAvatarUrl === 'function') avatarUrl = avatarUrl || loadoutApi.getAvatarUrl();
    gameState.avatarData = avatarData || '';
    gameState.avatarUrl = avatarUrl || '';
  }

  function getAvatarSource() {
    return gameState.avatarUrl || gameState.avatarData || '';
  }

  function getInitials(name) {
    var text = String(name || 'Player').trim();
    if (!text) return 'P';
    var parts = text.split(/\s+/).filter(Boolean);
    if (!parts.length) return 'P';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function updateWeaponDisplay(character) {
    var loadout = getHeroLoadout(character);
    var weaponName = document.getElementById('weapon-name-display');
    var weaponDesc = document.getElementById('weapon-desc-display');
    var weaponEffect = document.getElementById('weapon-effect-display');
    if (weaponName) weaponName.textContent = loadout.weaponName || 'Bulwark Disc';
    if (weaponDesc) weaponDesc.textContent = loadout.weaponDescription || 'Defensive projectile';
    if (weaponEffect) weaponEffect.textContent = loadout.weaponEffect || 'Balanced';
  }

  function updatePerkDisplay(character) {
    var pn = document.getElementById('perk-name-display');
    var pd = document.getElementById('perk-desc-display');
    var perk = CHARACTER_PERKS[character];
    if (pn && pd && perk) {
      pn.textContent = perk.name;
      pd.textContent = perk.desc;
    }
  }

  function updateHeroDetails(character) {
    updatePerkDisplay(character);
    updateWeaponDisplay(character);
  }

  function updateAvatarPreview(source) {
    var preview = document.getElementById('avatar-preview');
    var fallback = document.getElementById('avatar-preview-fallback');
    if (!preview || !fallback) return;

    var avatarSource = source || getAvatarSource();
    if (avatarSource) {
      preview.style.backgroundImage = 'url(\"' + avatarSource + '\")';
      preview.classList.add('has-image');
      fallback.style.display = 'none';
      return;
    }

    preview.style.backgroundImage = '';
    preview.classList.remove('has-image');
    fallback.style.display = '';
    fallback.textContent = getInitials(gameState.username || 'Player');
  }

  // ---- Auto-redirect if already started ----
  (function() {
    var isGuest = false;
    try { isGuest = (sessionStorage.getItem('snakes_isGuest') === '1'); } catch(e) {}
    var storedChar, hasStarted, storedUserId;
    if (isGuest) {
      try { storedChar = sessionStorage.getItem('snakes_selected_character'); } catch(e) {}
      try { hasStarted = (sessionStorage.getItem('snakes_started') === '1'); } catch(e) {}
      if (storedChar && hasStarted) { window.location.href = GAME_URL; return; }
    } else {
      try { storedChar = localStorage.getItem('snakes_selected_character'); } catch(e) {}
      try { hasStarted = (localStorage.getItem('snakes_started') === '1'); } catch(e) {}
      try { storedUserId = localStorage.getItem('snakes_user_id'); } catch(e) {}
      if (storedChar && hasStarted && storedUserId) { window.location.href = GAME_URL; return; }
    }
  })();

  // ---- Login URL ----
  function getLoginUrl() {
    var path = window.location.pathname || '';
    var base = path.startsWith('/TM_FrontEnd') ? '/TM_FrontEnd' : '';
    return window.location.origin + base + '/login';
  }

  // ---- Display Name ----
  function getStoredDisplayName() {
    try { return localStorage.getItem(DISPLAY_NAME_KEY) || sessionStorage.getItem(DISPLAY_NAME_KEY) || ''; } catch(e) { return ''; }
  }

  function saveDisplayName(name) {
    if (!name) return;
    try { localStorage.setItem(DISPLAY_NAME_KEY, name); } catch(e) {}
  }

  // ---- Login ----
  function useExistingLogin() {
    fetch(API_URL + '/id', { method: 'GET', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers })
      .then(function(r) { if (!r.ok) { alert('Please log in to the website first.'); window.location.href = getLoginUrl() + '?next=' + encodeURIComponent(window.location.pathname); return null; } return r.json(); })
      .then(function(u) {
        if (!u) return;
        gameState.isGuest = false;
        gameState.userId = u.id;
        gameState.username = u.name;
        var storedName = getStoredDisplayName();
        if (storedName) saveDisplayName(storedName);
        return fetch(API_URL + '/snakes/', { method: 'GET', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers })
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(data) {
            var hasChar = data && data.selected_character && data.selected_character !== 'default' && data.selected_character !== '';
            if (data && data.selected_character) {
              gameState.character = data.selected_character;
              gameState.weaponType = resolveWeaponType(data.selected_character, data.weapon_type || data.selected_weapon);
            }
            if (data && (data.avatar_url || data.avatar_data)) {
              if (data.avatar_url) persistAvatarUrl(data.avatar_url);
              if (data.avatar_data) persistAvatarData(data.avatar_data);
            }
            if (hasChar) {
              try {
                localStorage.setItem('snakes_selected_character', data.selected_character);
                localStorage.setItem('snakes_selected_weapon', gameState.weaponType || resolveWeaponType(data.selected_character));
                localStorage.setItem('snakes_started', '1');
                localStorage.setItem('snakes_user_id', String(gameState.userId));
              } catch(e) {}
              if (loadoutApi && typeof loadoutApi.saveLoadout === 'function') {
                loadoutApi.saveLoadout(data.selected_character, gameState.weaponType || resolveWeaponType(data.selected_character), { useSession: false });
              }
              window.location.href = GAME_URL;
              return;
            }
            document.getElementById('login-container').classList.add('hidden');
            document.getElementById('character-selection').classList.remove('hidden');
            document.body.classList.add('character-select-active');
            updateHeroDetails(gameState.character || 'knight');
            updateAvatarPreview();
          });
      })
      .catch(function(err) { console.error('Login error:', err); alert('Error connecting to server.'); });
  }

  function playAsGuest() {
    gameState.isGuest = true;
    gameState.userId = 'guest_' + Date.now();
    gameState.username = 'Guest_' + Math.floor(Math.random() * 1000);
    try { sessionStorage.setItem('snakes_isGuest', '1'); sessionStorage.setItem('snakes_user_id', String(gameState.userId)); sessionStorage.setItem('snakes_guest_name', gameState.username); } catch(e) {}
    var guestPanel = document.getElementById('guest-display-panel');
    var guestInput = document.getElementById('guest-display-name');
    var storedName = getStoredDisplayName();
    if (guestPanel) guestPanel.classList.remove('hidden');
    if (guestInput && storedName) guestInput.value = storedName;
  }

  // ---- Character Selection ----
  function selectCharacter(card) {
    var cards = document.querySelectorAll('.character-card');
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selected');
    card.classList.add('selected');
    gameState.character = card.getAttribute('data-character');
    gameState.weaponType = resolveWeaponType(gameState.character);
    updateHeroDetails(gameState.character);
    try {
      if (gameState.isGuest) {
        sessionStorage.setItem('snakes_selected_character', gameState.character);
        sessionStorage.setItem('snakes_selected_weapon', gameState.weaponType);
      } else {
        localStorage.setItem('snakes_selected_character', gameState.character);
        localStorage.setItem('snakes_selected_weapon', gameState.weaponType);
        if (gameState.userId) localStorage.setItem('snakes_user_id', String(gameState.userId));
      }
    } catch(e) {}
    if (loadoutApi && typeof loadoutApi.saveLoadout === 'function') {
      loadoutApi.saveLoadout(gameState.character, gameState.weaponType, { useSession: !!gameState.isGuest });
    }
    var charName = card.querySelector('.character-name').textContent;
    var charDesc = card.querySelector('.character-description').textContent;
    showGameNotification('🎉 Congrats! You\'ve selected ' + charName + ', the amazing ' + charDesc + '. Click START ADVENTURE to begin your quest!', 'success');
    if (!gameState.isGuest && gameState.userId) {
      fetch(API_URL + '/snakes/', { method: 'GET', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers })
        .then(function(r) {
          var sharedPayload = {
            selected_character: gameState.character,
            weapon_type: gameState.weaponType,
            selected_weapon: gameState.weaponType,
            avatar_url: gameState.avatarUrl || null,
            avatar_data: gameState.avatarData || null
          };
          if (r.status === 404) {
            return fetch(API_URL + '/snakes/', {
              method: 'POST',
              mode: fetchOpts.mode,
              cache: fetchOpts.cache,
              credentials: fetchOpts.credentials,
              headers: fetchOpts.headers,
              body: JSON.stringify(sharedPayload)
            });
          }
          return fetch(API_URL + '/snakes/', {
            method: 'PUT',
            mode: fetchOpts.mode,
            cache: fetchOpts.cache,
            credentials: fetchOpts.credentials,
            headers: fetchOpts.headers,
            body: JSON.stringify({
              selected_character: gameState.character,
              weapon_type: gameState.weaponType,
              selected_weapon: gameState.weaponType,
              avatar_url: gameState.avatarUrl || null,
              avatar_data: gameState.avatarData || null,
              current_square: 1,
              visited_squares: [1],
              total_bullets: 0,
              time_played: 0,
              lives: 5,
              boss_battle_attempts: 0
            })
          });
        }).catch(function(e) { console.error('Save character error:', e); });
    }
    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.disabled = false;
  }

  function showGameNotification(message, type) {
    var existing = document.getElementById('landing-notification');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'landing-notification';
    toast.style.cssText = [
      'position: fixed',
      'top: 20px',
      'right: 20px',
      'background: ' + (type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #ff9966, #ff5e62)'),
      'color: white',
      'padding: 14px 20px',
      'border-radius: 12px',
      'font-size: 0.95rem',
      'font-weight: 600',
      'max-width: 320px',
      'box-shadow: 0 6px 20px rgba(0,0,0,0.3)',
      'z-index: 9999',
      'opacity: 0',
      'transform: translateX(40px)',
      'transition: all 0.35s ease',
      'cursor: pointer'
    ].join(';');
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function() {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    });

    toast.addEventListener('click', function() { toast.remove(); });

    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(function() { if (toast.parentNode) toast.remove(); }, 350);
    }, 4000);
  }

  function startGame() {
    if (!gameState.character) { alert('Please select a character!'); return; }
    if (!gameState.weaponType) gameState.weaponType = resolveWeaponType(gameState.character);
    try {
      if (gameState.isGuest) {
        sessionStorage.setItem('snakes_started', '1');
        sessionStorage.setItem('snakes_selected_character', gameState.character);
        sessionStorage.setItem('snakes_selected_weapon', gameState.weaponType);
      } else {
        localStorage.setItem('snakes_started', '1');
        localStorage.setItem('snakes_selected_character', gameState.character);
        localStorage.setItem('snakes_selected_weapon', gameState.weaponType);
        if (gameState.userId) localStorage.setItem('snakes_user_id', String(gameState.userId));
      }
    } catch(e) {}
    if (loadoutApi && typeof loadoutApi.saveLoadout === 'function') {
      loadoutApi.saveLoadout(gameState.character, gameState.weaponType, { useSession: !!gameState.isGuest });
    }
    window.location.href = GAME_URL;
  }

  function uploadAvatarToBackend(file, dataUrl) {
    if (gameState.isGuest || !gameState.userId) return Promise.resolve(null);
    var fd = new FormData();
    fd.append('avatar', file);
    return fetch(API_URL + '/profile/avatar', {
      method: 'POST',
      mode: fetchOpts.mode,
      cache: fetchOpts.cache,
      credentials: fetchOpts.credentials,
      headers: { 'X-Origin': 'client' },
      body: fd
    }).then(function(res) {
      if (!res.ok) return null;
      return res.json();
    }).then(function(data) {
      if (data && data.avatar_url) {
        persistAvatarUrl(data.avatar_url);
      } else if (dataUrl) {
        persistAvatarData(dataUrl);
      }
      return data;
    }).catch(function() {
      if (dataUrl) persistAvatarData(dataUrl);
      return null;
    });
  }

  function cropFileToSquareDataUrl(file, done) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var side = Math.min(img.width, img.height);
        var sx = Math.floor((img.width - side) / 2);
        var sy = Math.floor((img.height - side) / 2);
        var canvas = document.createElement('canvas');
        var size = 256;
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        done(canvas.toDataURL('image/webp', 0.92));
      };
      img.onerror = function() {
        done('');
      };
      img.src = e.target.result;
    };
    reader.onerror = function() { done(''); };
    reader.readAsDataURL(file);
  }

  function initAvatarUpload() {
    var input = document.getElementById('avatar-file-input');
    var uploadBtn = document.getElementById('avatar-upload-btn');
    var resetBtn = document.getElementById('avatar-reset-btn');
    if (!input || !uploadBtn || !resetBtn) return;

    uploadBtn.addEventListener('click', function() {
      input.click();
    });

    resetBtn.addEventListener('click', function() {
      clearAvatarStorage();
      updateAvatarPreview('');
    });

    input.addEventListener('change', function() {
      var file = input.files && input.files[0];
      if (!file) return;
      var validTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (validTypes.indexOf(file.type) === -1) {
        alert('Please upload a PNG, JPG, or WEBP image.');
        input.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be 2MB or smaller.');
        input.value = '';
        return;
      }

      cropFileToSquareDataUrl(file, function(dataUrl) {
        if (!dataUrl) {
          alert('Could not process image. Please try another file.');
          return;
        }
        persistAvatarData(dataUrl);
        updateAvatarPreview(dataUrl);
        uploadAvatarToBackend(file, dataUrl);
      });
    });
  }

  // ---- Event Listeners ----
  document.addEventListener('DOMContentLoaded', function() {
    loadStoredAvatar();
    var storedCharacter = '';
    var storedWeapon = '';
    try { storedCharacter = localStorage.getItem('snakes_selected_character') || sessionStorage.getItem('snakes_selected_character') || ''; } catch(e) {}
    try { storedWeapon = localStorage.getItem('snakes_selected_weapon') || sessionStorage.getItem('snakes_selected_weapon') || ''; } catch(e) {}
    if (storedCharacter && CHARACTER_PERKS[storedCharacter]) {
      gameState.character = storedCharacter;
      gameState.weaponType = resolveWeaponType(storedCharacter, storedWeapon);
    } else {
      gameState.character = 'knight';
      gameState.weaponType = resolveWeaponType('knight');
    }
    updateHeroDetails(gameState.character);
    initAvatarUpload();

    var useLoginBtn = document.getElementById('use-existing-login');
    if (useLoginBtn) useLoginBtn.addEventListener('click', useExistingLogin);
    var guestBtn = document.getElementById('play-as-guest');
    if (guestBtn) guestBtn.addEventListener('click', playAsGuest);
    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.addEventListener('click', startGame);
    var guestContinue = document.getElementById('guest-name-continue');
    if (guestContinue) {
      guestContinue.addEventListener('click', function() {
        var input = document.getElementById('guest-display-name');
        var name = input ? input.value.trim() : '';
        if (!name) { alert('Please enter a name.'); return; }
        gameState.username = name;
        saveDisplayName(name);
        try {
          sessionStorage.setItem(DISPLAY_NAME_KEY, name);
          sessionStorage.setItem('snakes_guest_name', name);
        } catch(e) {}
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('character-selection').classList.remove('hidden');
        document.body.classList.add('character-select-active');
        updateAvatarPreview();
      });
    }
    var guestDefault = document.getElementById('guest-name-default');
    if (guestDefault) {
      guestDefault.addEventListener('click', function() {
        saveDisplayName(gameState.username);
        try { sessionStorage.setItem(DISPLAY_NAME_KEY, gameState.username); } catch(e) {}
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('character-selection').classList.remove('hidden');
        document.body.classList.add('character-select-active');
        updateAvatarPreview();
      });
    }
    var guestInput = document.getElementById('guest-display-name');
    if (guestInput) {
      guestInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var btn = document.getElementById('guest-name-continue');
          if (btn) btn.click();
        }
      });
    }
    fetch(API_URL + '/id', { method: 'GET', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(u) {
        if (u) {
          gameState.userId = u.id;
          gameState.username = u.name;
        }
        updateAvatarPreview();
      })
      .catch(function() {});
    initCarousel();
  });

  // ---- Character Carousel ----
  function initCarousel() {
    var currentIndex = 0;
    var cards = document.querySelectorAll('.character-card');
    var prevBtn = document.getElementById('prev-character');
    var nextBtn = document.getElementById('next-character');
    var lastClickedIndex = -1, clickTimer = null;
    if (!cards.length || !prevBtn || !nextBtn) return;
    if (gameState.character) {
      cards.forEach(function(card, index) {
        if (card.getAttribute('data-character') === gameState.character) currentIndex = index;
      });
    }

    function updateCarousel() {
      cards.forEach(function(card, index) {
        card.classList.remove('center', 'left', 'right');
        if (index === currentIndex) {
          card.classList.add('center');
          updateHeroDetails(card.getAttribute('data-character'));
        }
        else if (index === currentIndex - 1 || (currentIndex === 0 && index === cards.length - 1)) card.classList.add('left');
        else if (index === currentIndex + 1 || (currentIndex === cards.length - 1 && index === 0)) card.classList.add('right');
      });
    }
    prevBtn.addEventListener('click', function() { currentIndex = (currentIndex - 1 + cards.length) % cards.length; updateCarousel(); lastClickedIndex = -1; });
    nextBtn.addEventListener('click', function() { currentIndex = (currentIndex + 1) % cards.length; updateCarousel(); lastClickedIndex = -1; });
    cards.forEach(function(card, index) {
      var holdTimer = null;
      var holding = false;

      card.addEventListener('mousedown', function() {
        if (index !== currentIndex) { currentIndex = index; updateCarousel(); return; }
        holding = false;
        card.style.transition = 'transform 0.3s ease';
        card.style.transform = 'scale(1.08)';
        holdTimer = setTimeout(function() {
          holding = true;
          card.style.transform = '';
          selectCharacter(card);
        }, 300);
      });

      card.addEventListener('mouseup', function() {
        clearTimeout(holdTimer);
        card.style.transform = '';
      });

      card.addEventListener('mouseleave', function() {
        clearTimeout(holdTimer);
        card.style.transform = '';
      });
    });
    document.addEventListener('keydown', function(e) {
      var cs = document.getElementById('character-selection');
      if (!cs || cs.classList.contains('hidden')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevBtn.click(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCharacter(cards[currentIndex]); }
    });
    updateCarousel();
  }

  // ---- Animated Canvas Background ----
  var canvas = document.getElementById('pixelCanvas');
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  var objects = [];
  function drawSlitherSnake(snake) {
    var segments = 12, segmentSize = 14, time = Date.now() / 200;
    for (var i = 0; i < segments; i++) {
      var wave = Math.sin(time + i * 0.5) * 8, segX = snake.x - (i * segmentSize * Math.cos(snake.angle)), segY = snake.y - (i * segmentSize * Math.sin(snake.angle)) + wave;
      ctx.fillStyle = 'rgb(' + (30 + i * 5) + ',' + Math.floor(180 - i * 8) + ',50)';
      var size = segmentSize - (i * 0.5); ctx.fillRect(segX - size/2, segY - size/2, size, size);
      if (i % 2 === 0 && i > 0) { ctx.fillStyle = '#000'; ctx.fillRect(segX - 2, segY - 2, 4, 4); }
      if (i === 0) { ctx.fillStyle = '#000'; ctx.fillRect(segX - 4, segY - 4, 3, 3); ctx.fillRect(segX + 2, segY - 4, 3, 3);
        if (Math.sin(time * 3) > 0) { ctx.fillStyle = '#ff4444'; var tx = segX + Math.cos(snake.angle) * 10, ty = segY + Math.sin(snake.angle) * 10; ctx.fillRect(tx, ty - 1, 8, 2); ctx.fillRect(tx + 6, ty - 3, 4, 2); ctx.fillRect(tx + 6, ty + 1, 4, 2); } }
    }
  }
  function drawPixelLadder(x, y, rot) {
    ctx.save(); ctx.translate(x + 15, y + 25); ctx.rotate(rot); ctx.translate(-15, -25);
    ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 0, 8, 50); ctx.fillRect(22, 0, 8, 50);
    ctx.fillStyle = '#A0522D'; ctx.fillRect(0, 0, 3, 50); ctx.fillRect(22, 0, 3, 50);
    ctx.fillStyle = '#5c3d2e'; ctx.fillRect(5, 0, 3, 50); ctx.fillRect(27, 0, 3, 50);
    for (var i = 0; i < 5; i++) { ctx.fillStyle = '#8B4513'; ctx.fillRect(0, 5 + i * 10, 30, 5); ctx.fillStyle = '#A0522D'; ctx.fillRect(0, 5 + i * 10, 30, 2); }
    ctx.restore();
  }
  function drawPixelDice(x, y, num, rot) {
    ctx.save(); ctx.translate(x + 15, y + 15); ctx.rotate(rot); ctx.translate(-15, -15);
    ctx.fillStyle = '#f5f5f5'; ctx.fillRect(0, 0, 30, 30);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 30, 4); ctx.fillRect(0, 0, 4, 30);
    ctx.fillStyle = '#ccc'; ctx.fillRect(0, 26, 30, 4); ctx.fillRect(26, 0, 4, 30);
    ctx.fillStyle = '#333'; ctx.fillRect(0, 0, 30, 2); ctx.fillRect(0, 0, 2, 30); ctx.fillRect(0, 28, 30, 2); ctx.fillRect(28, 0, 2, 30);
    ctx.fillStyle = '#1a1a1a';
    var dp = {1:[[15,15]],2:[[8,8],[22,22]],3:[[8,8],[15,15],[22,22]],4:[[8,8],[22,8],[8,22],[22,22]],5:[[8,8],[22,8],[15,15],[8,22],[22,22]],6:[[8,8],[22,8],[8,15],[22,15],[8,22],[22,22]]};
    (dp[num]||[]).forEach(function(d){ctx.beginPath();ctx.arc(d[0],d[1],3,0,Math.PI*2);ctx.fill();});
    ctx.restore();
  }
  for (var i = 0; i < 5; i++) { var sl = Math.random() > 0.5; objects.push({type:'snake',x:sl?-150:canvas.width+150,y:100+Math.random()*(canvas.height-200),speedX:(sl?1:-1)*(1.5+Math.random()*1.5),speedY:(Math.random()-0.5)*0.5,angle:sl?0:Math.PI,delay:i*1500}); }
  for (var i = 0; i < 4; i++) { objects.push({type:'ladder',x:100+Math.random()*(canvas.width-200),y:canvas.height+50,speedY:-(0.8+Math.random()*0.5),rotation:0,rotationSpeed:(Math.random()-0.5)*0.02,delay:i*2000}); }
  for (var i = 0; i < 6; i++) { objects.push({type:'dice',x:50+Math.random()*(canvas.width-100),y:50+Math.random()*(canvas.height-100),speedX:(Math.random()>0.5?1:-1)*(1+Math.random()),speedY:(Math.random()>0.5?1:-1)*(1+Math.random()),num:Math.floor(Math.random()*6)+1,rotation:0,rotationSpeed:0.02,delay:i*800}); }
  for (var i = 0; i < 40; i++) { objects.push({type:'star',x:Math.random()*canvas.width,y:Math.random()*canvas.height,phase:Math.random()*Math.PI*2,speed:0.002+Math.random()*0.004,size:2+Math.random()*3}); }
  var startTime = Date.now();
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var elapsed = Date.now() - startTime;
    objects.forEach(function(obj) {
      if (elapsed < obj.delay) return;
      if (obj.type === 'snake') { drawSlitherSnake(obj); obj.x += obj.speedX; obj.y += obj.speedY; if (obj.y < 50 || obj.y > canvas.height - 50) obj.speedY *= -1; if (obj.speedX > 0 && obj.x > canvas.width + 200) { obj.x = -150; obj.y = 100 + Math.random() * (canvas.height - 200); } else if (obj.speedX < 0 && obj.x < -200) { obj.x = canvas.width + 150; obj.y = 100 + Math.random() * (canvas.height - 200); } }
      else if (obj.type === 'ladder') { drawPixelLadder(obj.x, obj.y, obj.rotation); obj.y += obj.speedY; obj.rotation += obj.rotationSpeed; if (obj.y < -60) { obj.y = canvas.height + 50; obj.x = 100 + Math.random() * (canvas.width - 200); } }
      else if (obj.type === 'dice') { obj.x += obj.speedX; obj.y += obj.speedY; obj.rotation += obj.rotationSpeed; if (obj.x <= 0 || obj.x >= canvas.width - 30) { obj.speedX *= -1; obj.num = Math.floor(Math.random() * 6) + 1; } if (obj.y <= 0 || obj.y >= canvas.height - 30) { obj.speedY *= -1; obj.num = Math.floor(Math.random() * 6) + 1; } drawPixelDice(obj.x, obj.y, obj.num, obj.rotation); }
      else if (obj.type === 'star') { var alpha = 0.2 + Math.sin(elapsed * obj.speed + obj.phase) * 0.6; ctx.fillStyle = 'rgba(255,215,0,' + Math.max(0, alpha) + ')'; ctx.fillRect(obj.x, obj.y, obj.size, obj.size); }
    });
    requestAnimationFrame(animate);
  }
  animate();
  window.addEventListener('resize', function() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
</script>
