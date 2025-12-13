---
layout: post
title: Snakes and Ladders Game
description: A multiplayer snakes and ladders game with mini-games and boss battle!
categories: [Games]
permalink: /snakes-game
type: hacks
---

<style>
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  
  .game-landing-container {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background: #0f0f23;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Press Start 2P', cursive;
  }
  
  .pixel-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  
  .game-content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 40px;
    background: rgba(15, 15, 35, 0.9);
    border: 6px solid #5c4033;
    box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.6);
    max-width: 600px;
  }
  
  .pixel-title {
    font-size: 32px;
    color: #FFD700;
    text-shadow: 4px 4px 0 #000;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  
  .pixel-subtitle {
    font-size: 14px;
    color: #a0aec0;
    margin-bottom: 30px;
    line-height: 1.8;
  }
  
  /* Brown blocky button with wood-like shading */
  .pixel-button {
    display: inline-block;
    padding: 20px 40px;
    background: linear-gradient(180deg, #8B6914 0%, #6B4423 50%, #4a3728 100%);
    color: #FFE4B5;
    text-decoration: none;
    font-size: 16px;
    font-family: 'Press Start 2P', cursive;
    border: none;
    border-top: 6px solid #A0522D;
    border-left: 6px solid #8B4513;
    border-right: 6px solid #3d2817;
    border-bottom: 6px solid #2d1f14;
    box-shadow: 
      inset 0 2px 0 #CD853F,
      inset 0 -2px 0 #3d2314,
      8px 8px 0 #1a1a1a;
    cursor: pointer;
    transition: all 0.1s;
    text-shadow: 2px 2px 0 #000;
  }
  
  .pixel-button:hover {
    background: linear-gradient(180deg, #A0522D 0%, #8B4513 50%, #5c3d2e 100%);
    transform: translate(2px, 2px);
    box-shadow: 
      inset 0 2px 0 #DEB887,
      inset 0 -2px 0 #3d2314,
      6px 6px 0 #1a1a1a;
  }
  
  .pixel-button:active {
    transform: translate(6px, 6px);
    box-shadow: 
      inset 0 2px 0 #8B4513,
      inset 0 -2px 0 #2d1f14,
      2px 2px 0 #1a1a1a;
  }
  
  /* Loading overlay */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 15, 35, 0.95);
    z-index: 100;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  
  .loading-overlay.active {
    display: flex;
  }
  
  .loading-text {
    color: #FFD700;
    font-family: 'Press Start 2P', cursive;
    font-size: 18px;
    margin-top: 30px;
    text-shadow: 2px 2px 0 #000;
  }
</style>

<div class="game-landing-container">
  <canvas id="pixelCanvas" class="pixel-background"></canvas>
  
  <div class="game-content">
    <h1 class="pixel-title">🎲 SNAKES<br>AND<br>LADDERS</h1>
    <p class="pixel-subtitle">ANSWER QUESTIONS<br>COLLECT BULLETS<br>DEFEAT THE BOSS!</p>
    <a href="{{ site.baseurl }}/hacks/snakes/game-board-part1.html" class="pixel-button" id="startButton">
      ▶ START GAME
    </a>
  </div>
  
  <div class="loading-overlay" id="loadingOverlay">
    <canvas id="loadingCanvas" width="150" height="150"></canvas>
    <p class="loading-text">LOADING...</p>
  </div>
</div>

<script>
  // Main canvas
  const canvas = document.getElementById('pixelCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const objects = [];
  
  // Draw slithering snake with wavy body
  function drawSlitherSnake(snake) {
    const segments = 12;
    const segmentSize = 14;
    const time = Date.now() / 200;
    
    for (let i = 0; i < segments; i++) {
      // Calculate wavy offset for slithering effect
      const wave = Math.sin(time + i * 0.5) * 8;
      const segX = snake.x - (i * segmentSize * Math.cos(snake.angle));
      const segY = snake.y - (i * segmentSize * Math.sin(snake.angle)) + wave;
      
      // Gradient colors from head to tail
      const greenVal = Math.floor(180 - i * 8);
      ctx.fillStyle = `rgb(${30 + i * 5}, ${greenVal}, ${50})`;
      
      // Draw segment
      const size = segmentSize - (i * 0.5);
      ctx.fillRect(segX - size/2, segY - size/2, size, size);
      
      // Pattern on even segments
      if (i % 2 === 0 && i > 0) {
        ctx.fillStyle = '#000';
        ctx.fillRect(segX - 2, segY - 2, 4, 4);
      }
      
      // Head details
      if (i === 0) {
        ctx.fillStyle = '#000';
        // Eyes
        ctx.fillRect(segX - 4, segY - 4, 3, 3);
        ctx.fillRect(segX + 2, segY - 4, 3, 3);
        // Tongue (flicking)
        if (Math.sin(time * 3) > 0) {
          ctx.fillStyle = '#ff4444';
          const tongueX = segX + Math.cos(snake.angle) * 10;
          const tongueY = segY + Math.sin(snake.angle) * 10;
          ctx.fillRect(tongueX, tongueY - 1, 8, 2);
          ctx.fillRect(tongueX + 6, tongueY - 3, 4, 2);
          ctx.fillRect(tongueX + 6, tongueY + 1, 4, 2);
        }
      }
    }
  }
  
  // Draw wooden pixel ladder
  function drawPixelLadder(x, y, rotation) {
    ctx.save();
    ctx.translate(x + 15, y + 25);
    ctx.rotate(rotation);
    ctx.translate(-15, -25);
    
    // Wood grain colors
    const woodDark = '#5c3d2e';
    const woodMid = '#8B4513';
    const woodLight = '#A0522D';
    
    // Side rails with shading
    ctx.fillStyle = woodMid;
    ctx.fillRect(0, 0, 8, 50);
    ctx.fillRect(22, 0, 8, 50);
    
    // Highlights
    ctx.fillStyle = woodLight;
    ctx.fillRect(0, 0, 3, 50);
    ctx.fillRect(22, 0, 3, 50);
    
    // Shadows
    ctx.fillStyle = woodDark;
    ctx.fillRect(5, 0, 3, 50);
    ctx.fillRect(27, 0, 3, 50);
    
    // Rungs
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = woodMid;
      ctx.fillRect(0, 5 + (i * 10), 30, 5);
      ctx.fillStyle = woodLight;
      ctx.fillRect(0, 5 + (i * 10), 30, 2);
    }
    
    ctx.restore();
  }
  
  // Draw 3D-ish pixel dice
  function drawPixelDice(x, y, num, rotation) {
    ctx.save();
    ctx.translate(x + 15, y + 15);
    ctx.rotate(rotation);
    ctx.translate(-15, -15);
    
    // Dice body with shading
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 30, 30);
    
    // Top highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 30, 4);
    ctx.fillRect(0, 0, 4, 30);
    
    // Bottom shadow
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 26, 30, 4);
    ctx.fillRect(26, 0, 4, 30);
    
    // Border
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 30, 2);
    ctx.fillRect(0, 0, 2, 30);
    ctx.fillRect(0, 28, 30, 2);
    ctx.fillRect(28, 0, 2, 30);
    
    // Dots
    ctx.fillStyle = '#1a1a1a';
    const dotPositions = {
      1: [[15, 15]],
      2: [[8, 8], [22, 22]],
      3: [[8, 8], [15, 15], [22, 22]],
      4: [[8, 8], [22, 8], [8, 22], [22, 22]],
      5: [[8, 8], [22, 8], [15, 15], [8, 22], [22, 22]],
      6: [[8, 8], [22, 8], [8, 15], [22, 15], [8, 22], [22, 22]]
    };
    
    (dotPositions[num] || []).forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(dx, dy, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }
  
  // Create snakes with direction
  for (let i = 0; i < 5; i++) {
    const startFromLeft = Math.random() > 0.5;
    objects.push({
      type: 'snake',
      x: startFromLeft ? -150 : canvas.width + 150,
      y: 100 + Math.random() * (canvas.height - 200),
      speedX: (startFromLeft ? 1 : -1) * (1.5 + Math.random() * 1.5),
      speedY: (Math.random() - 0.5) * 0.5,
      angle: startFromLeft ? 0 : Math.PI,
      delay: i * 1500
    });
  }
  
  // Create ladders
  for (let i = 0; i < 4; i++) {
    objects.push({
      type: 'ladder',
      x: 100 + Math.random() * (canvas.width - 200),
      y: canvas.height + 50,
      speedY: -(0.8 + Math.random() * 0.5),
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      delay: i * 2000
    });
  }
  
  // Create DVD-style bouncing dice
  for (let i = 0; i < 6; i++) {
    objects.push({
      type: 'dice',
      x: 50 + Math.random() * (canvas.width - 100),
      y: 50 + Math.random() * (canvas.height - 100),
      speedX: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()),
      speedY: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random()),
      num: Math.floor(Math.random() * 6) + 1,
      rotation: 0,
      rotationSpeed: 0.02,
      delay: i * 800
    });
  }
  
  // Create stars
  for (let i = 0; i < 40; i++) {
    objects.push({
      type: 'star',
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.004,
      size: 2 + Math.random() * 3
    });
  }
  
  let startTime = Date.now();
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;
    
    objects.forEach(obj => {
      if (elapsed < obj.delay) return;
      
      if (obj.type === 'snake') {
        drawSlitherSnake(obj);
        obj.x += obj.speedX;
        obj.y += obj.speedY;
        
        // Bounce off top/bottom
        if (obj.y < 50 || obj.y > canvas.height - 50) {
          obj.speedY *= -1;
        }
        
        // Reset when off screen
        if (obj.speedX > 0 && obj.x > canvas.width + 200) {
          obj.x = -150;
          obj.y = 100 + Math.random() * (canvas.height - 200);
        } else if (obj.speedX < 0 && obj.x < -200) {
          obj.x = canvas.width + 150;
          obj.y = 100 + Math.random() * (canvas.height - 200);
        }
        
      } else if (obj.type === 'ladder') {
        drawPixelLadder(obj.x, obj.y, obj.rotation);
        obj.y += obj.speedY;
        obj.rotation += obj.rotationSpeed;
        
        if (obj.y < -60) {
          obj.y = canvas.height + 50;
          obj.x = 100 + Math.random() * (canvas.width - 200);
        }
        
      } else if (obj.type === 'dice') {
        // DVD-style bouncing
        obj.x += obj.speedX;
        obj.y += obj.speedY;
        obj.rotation += obj.rotationSpeed;
        
        // Bounce off walls
        if (obj.x <= 0 || obj.x >= canvas.width - 30) {
          obj.speedX *= -1;
          obj.num = Math.floor(Math.random() * 6) + 1;
          obj.rotationSpeed = (Math.random() - 0.5) * 0.05;
        }
        if (obj.y <= 0 || obj.y >= canvas.height - 30) {
          obj.speedY *= -1;
          obj.num = Math.floor(Math.random() * 6) + 1;
          obj.rotationSpeed = (Math.random() - 0.5) * 0.05;
        }
        
        drawPixelDice(obj.x, obj.y, obj.num, obj.rotation);
        
      } else if (obj.type === 'star') {
        const alpha = 0.2 + Math.sin(elapsed * obj.speed + obj.phase) * 0.6;
        ctx.fillStyle = `rgba(255, 215, 0, ${Math.max(0, alpha)})`;
        ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
      }
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
  
  // Loading snake animation
  const startButton = document.getElementById('startButton');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingCanvas = document.getElementById('loadingCanvas');
  const loadingCtx = loadingCanvas.getContext('2d');
  
  startButton.addEventListener('click', function(e) {
    e.preventDefault();
    const targetUrl = this.href;
    
    loadingOverlay.classList.add('active');
    
    let loadingAngle = 0;
    const snakeLength = 8;
    
    function drawLoadingSnake() {
      loadingCtx.clearRect(0, 0, 150, 150);
      
      const centerX = 75;
      const centerY = 75;
      const radius = 40;
      
      // Draw snake segments in a circle
      for (let i = 0; i < snakeLength; i++) {
        const angle = loadingAngle - (i * 0.4);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const greenVal = 180 - i * 15;
        loadingCtx.fillStyle = `rgb(${30 + i * 5}, ${greenVal}, ${50})`;
        
        const size = 16 - i;
        loadingCtx.fillRect(x - size/2, y - size/2, size, size);
        
        // Head
        if (i === 0) {
          loadingCtx.fillStyle = '#000';
          const eyeAngle = angle + Math.PI/2;
          loadingCtx.fillRect(x + Math.cos(eyeAngle) * 3 - 2, y + Math.sin(eyeAngle) * 3 - 2, 3, 3);
          loadingCtx.fillRect(x - Math.cos(eyeAngle) * 3 - 2, y - Math.sin(eyeAngle) * 3 - 2, 3, 3);
        }
      }
      
      loadingAngle += 0.1;
      
      if (loadingAngle < Math.PI * 4) {
        requestAnimationFrame(drawLoadingSnake);
      } else {
        window.location.href = targetUrl;
      }
    }
    
    drawLoadingSnake();
  });
</script>