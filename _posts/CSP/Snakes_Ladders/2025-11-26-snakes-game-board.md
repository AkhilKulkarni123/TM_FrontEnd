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

<style>
  .game-landing-container {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background: #0f0f23;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .pixel-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .hidden { display: none !important; }

  #login-container {
    position: relative;
    z-index: 10;
  }

  #character-selection {
    background: transparent;
    z-index: 10;
  }

  #character-selection::before {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background:
      radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  #character-selection > * {
    position: relative;
    z-index: 1;
  }

  .display-name-modal { z-index: 10003; }

  .login-options {
    background: rgba(15, 15, 35, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.15);
  }

  .login-divider span {
    background: rgba(15, 15, 35, 0.85);
    color: rgba(255,255,255,0.6);
  }

  .login-divider::before,
  .login-divider::after {
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
  }
</style>

<div class="game-landing-container">
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
    </div>
    <div class="login-footer">
      <p class="login-notice">
        <span class="notice-icon">ℹ️</span>
        Guest mode is perfect for trying out the game, but your progress won't be saved
      </p>
    </div>
  </div>

  <div id="display-name-modal" class="display-name-modal hidden">
    <div class="display-name-card">
      <h2>Choose Your Screen Name</h2>
      <p>This will appear on the leaderboard and in multiplayer.</p>
      <input id="display-name-input" type="text" maxlength="20" placeholder="e.g. SnakeMaster" />
      <div class="display-name-actions">
        <button id="display-name-save">Continue</button>
        <button id="display-name-skip">Use Default</button>
      </div>
    </div>
  </div>

  <div id="character-selection" class="hidden">
    <h2>Choose Your Hero</h2>
    <p class="character-select-instruction">Click arrows to browse - Click centered character twice to select</p>
    <div class="character-carousel">
      <button class="carousel-btn prev-btn" id="prev-character">&#9668;</button>
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
      <button class="carousel-btn next-btn" id="next-character">&#9658;</button>
    </div>
    <div id="character-perk-display" class="character-perk-display">
      <div class="perk-header">Character Perk</div>
      <div class="perk-name" id="perk-name-display">Shielded</div>
      <div class="perk-description" id="perk-desc-display">+1 Max Life (starts with 6)</div>
    </div>
    <button id="start-game-btn" class="game-start-btn" disabled>START ADVENTURE</button>
  </div>
</div>

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
  var CHARACTER_PERKS = {
    knight: { name: 'Shielded', desc: '+1 Max Life (starts with 6)' },
    wizard: { name: 'Firebrand', desc: 'Slightly higher damage; bullets are red' },
    archer: { name: 'Keen Aim', desc: 'Slight aim assist in boss & PvP' },
    warrior: { name: 'Bravery', desc: 'Slightly higher damage' }
  };

  var gameState = { isGuest: false, userId: null, username: '', character: '' };

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

  function ensureDisplayName() {
    return new Promise(function(resolve) {
      var stored = getStoredDisplayName();
      if (stored) { gameState.username = stored; resolve(); return; }
      if (gameState.username) { resolve(); return; }
      var modal = document.getElementById('display-name-modal');
      if (!modal) { resolve(); return; }
      modal.classList.remove('hidden');
      window._displayNameResolve = resolve;
    });
  }

  function submitDisplayName() {
    var input = document.getElementById('display-name-input');
    var name = input ? input.value.trim() : '';
    if (!name) { alert('Please enter a name.'); return; }
    gameState.username = name;
    try {
      if (gameState.isGuest) { sessionStorage.setItem(DISPLAY_NAME_KEY, name); }
      else { localStorage.setItem(DISPLAY_NAME_KEY, name); }
    } catch(e) {}
    var modal = document.getElementById('display-name-modal');
    if (modal) modal.classList.add('hidden');
    if (window._displayNameResolve) { window._displayNameResolve(); window._displayNameResolve = null; }
  }

  function skipDisplayName() {
    if (!gameState.username) gameState.username = 'Player_' + Math.floor(Math.random() * 1000);
    var modal = document.getElementById('display-name-modal');
    if (modal) modal.classList.add('hidden');
    if (window._displayNameResolve) { window._displayNameResolve(); window._displayNameResolve = null; }
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
        return fetch(API_URL + '/snakes/', { method: 'GET', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers })
          .then(function(r) { return r.ok ? r.json() : null; })
          .then(function(data) {
            var hasChar = data && data.selected_character && data.selected_character !== 'default' && data.selected_character !== '';
            if (hasChar) {
              try { localStorage.setItem('snakes_selected_character', data.selected_character); localStorage.setItem('snakes_started', '1'); localStorage.setItem('snakes_user_id', String(gameState.userId)); } catch(e) {}
              window.location.href = GAME_URL;
              return;
            }
            return ensureDisplayName().then(function() {
              document.getElementById('login-container').classList.add('hidden');
              document.getElementById('character-selection').classList.remove('hidden');
            });
          });
      })
      .catch(function(err) { console.error('Login error:', err); alert('Error connecting to server.'); });
  }

  function playAsGuest() {
    gameState.isGuest = true;
    gameState.userId = 'guest_' + Date.now();
    gameState.username = 'Guest_' + Math.floor(Math.random() * 1000);
    try { sessionStorage.setItem('snakes_isGuest', '1'); sessionStorage.setItem('snakes_user_id', String(gameState.userId)); sessionStorage.setItem('snakes_guest_name', gameState.username); } catch(e) {}
    ensureDisplayName().then(function() {
      document.getElementById('login-container').classList.add('hidden');
      document.getElementById('character-selection').classList.remove('hidden');
    });
  }

  // ---- Character Selection ----
  function selectCharacter(card) {
    var cards = document.querySelectorAll('.character-card');
    for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selected');
    card.classList.add('selected');
    gameState.character = card.getAttribute('data-character');
    try {
      if (gameState.isGuest) { sessionStorage.setItem('snakes_selected_character', gameState.character); }
      else { localStorage.setItem('snakes_selected_character', gameState.character); if (gameState.userId) localStorage.setItem('snakes_user_id', String(gameState.userId)); }
    } catch(e) {}
    var charName = card.querySelector('.character-name').textContent;
    alert(charName + ' selected! Click START ADVENTURE to begin.');
    if (!gameState.isGuest && gameState.userId) {
      fetch(API_URL + '/snakes/', { method: 'GET', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers })
        .then(function(r) {
          if (r.status === 404) return fetch(API_URL + '/snakes/', { method: 'POST', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers, body: JSON.stringify({ selected_character: gameState.character }) });
          else return fetch(API_URL + '/snakes/', { method: 'PUT', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers, body: JSON.stringify({ selected_character: gameState.character, current_square: 1, visited_squares: [1], total_bullets: 0, time_played: 0, lives: 5, boss_battle_attempts: 0 }) });
        }).catch(function(e) { console.error('Save character error:', e); });
    }
    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.disabled = false;
  }

  function startGame() {
    if (!gameState.character) { alert('Please select a character!'); return; }
    try {
      if (gameState.isGuest) { sessionStorage.setItem('snakes_started', '1'); }
      else { localStorage.setItem('snakes_started', '1'); if (gameState.userId) localStorage.setItem('snakes_user_id', String(gameState.userId)); }
    } catch(e) {}
    window.location.href = GAME_URL;
  }

  // ---- Event Listeners ----
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('use-existing-login').addEventListener('click', useExistingLogin);
    document.getElementById('play-as-guest').addEventListener('click', playAsGuest);
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('display-name-save').addEventListener('click', submitDisplayName);
    document.getElementById('display-name-skip').addEventListener('click', skipDisplayName);
    var dnInput = document.getElementById('display-name-input');
    if (dnInput) dnInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') submitDisplayName(); });
    fetch(API_URL + '/id', { method: 'GET', mode: fetchOpts.mode, cache: fetchOpts.cache, credentials: fetchOpts.credentials, headers: fetchOpts.headers })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(u) { if (u) { gameState.userId = u.id; gameState.username = u.name; } })
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
    function updatePerkDisplay(charType) {
      var pn = document.getElementById('perk-name-display'), pd = document.getElementById('perk-desc-display');
      if (pn && pd && CHARACTER_PERKS[charType]) { pn.textContent = CHARACTER_PERKS[charType].name; pd.textContent = CHARACTER_PERKS[charType].desc; }
    }
    function updateCarousel() {
      cards.forEach(function(card, index) {
        card.classList.remove('center', 'left', 'right');
        if (index === currentIndex) { card.classList.add('center'); updatePerkDisplay(card.getAttribute('data-character')); }
        else if (index === currentIndex - 1 || (currentIndex === 0 && index === cards.length - 1)) card.classList.add('left');
        else if (index === currentIndex + 1 || (currentIndex === cards.length - 1 && index === 0)) card.classList.add('right');
      });
    }
    prevBtn.addEventListener('click', function() { currentIndex = (currentIndex - 1 + cards.length) % cards.length; updateCarousel(); lastClickedIndex = -1; });
    nextBtn.addEventListener('click', function() { currentIndex = (currentIndex + 1) % cards.length; updateCarousel(); lastClickedIndex = -1; });
    cards.forEach(function(card, index) {
      card.addEventListener('click', function() {
        if (index !== currentIndex) { currentIndex = index; updateCarousel(); lastClickedIndex = -1; }
        else if (lastClickedIndex === index) { selectCharacter(card); lastClickedIndex = -1; }
        else { lastClickedIndex = index; card.style.transform = 'scale(1.2)'; setTimeout(function() { card.style.transform = ''; }, 200); if (clickTimer) clearTimeout(clickTimer); clickTimer = setTimeout(function() { lastClickedIndex = -1; }, 2000); }
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
