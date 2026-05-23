/**
 * Neon Snake Arena - Cyber Synthwave Arcade Game Engine (v3)
 * Decoupled modular architecture with 13 clear Maintainable Sections.
 */

// ============================================================================
// 1. CONFIGURATION
// ============================================================================
const GAME_CONFIG = {
  DIFFICULTIES: {
    EASY: { baseSpeed: 180, label: 'Easy' },
    NORMAL: { baseSpeed: 130, label: 'Normal' },
    HARD: { baseSpeed: 90, label: 'Hard' },
    EXTREME: { baseSpeed: 60, label: 'Extreme' }
  },
  BOARD_SIZES: {
    SMALL: { size: 15, label: 'Small (15x15)' },
    MEDIUM: { size: 20, label: 'Medium (20x20)' },
    LARGE: { size: 25, label: 'Large (25x25)' }
  },
  WALL_MODES: {
    CLASSIC: 'CLASSIC', 
    WRAP: 'WRAP'       
  },
  OBSTACLES: {
    OFF: { density: 0, label: 'Off' },
    LIGHT: { density: 0.04, label: 'Light' },
    MEDIUM: { density: 0.08, label: 'Medium' },
    HARD: { density: 0.12, label: 'Hard' }
  },
  POWER_UPS: {
    GOLDEN: { type: 'GOLDEN', name: 'Golden Energy', chance: 0.09, duration: 5000, color: '#ffe600', icon: '⭐' },
    SLOW: { type: 'SLOW', name: 'Temporal Dilator', chance: 0.10, duration: 6000, color: '#00f3ff', icon: '⏳' },
    SHIELD: { type: 'SHIELD', name: 'Shield Deflector', chance: 0.08, duration: null, color: '#9d00ff', icon: '🛡️' },
    MULTIPLIER: { type: 'MULTIPLIER', name: 'Hyper Score (2x)', chance: 0.10, duration: 7000, color: '#39ff14', icon: '⚡' }
  },
  THEMES: {
    CYBERPUNK: 'CYBERPUNK',
    OCEAN: 'OCEAN',
    LAVA: 'LAVA',
    FOREST: 'FOREST',
    ICE: 'ICE'
  },
  COLOR_PALETTE: {
    bg: '#04040d',
    grid: 'rgba(0, 243, 255, 0.035)',
    snakeCyan: '#00f3ff',
    snakePink: '#ff007f',
    obstacle: '#ff0055'
  }
};

// ============================================================================
// 2. STATE
// ============================================================================
// State Variables
let snake = [];
let food = { x: 0, y: 0 };
let obstacles = [];
let activePowerUp = null; // { x, y, type, expiresAt, color, icon }
let particles = [];
let floatingTexts = [];
let bgStars = [];

// Active Settings Configuration Loaded dynamically
let activeTheme = 'CYBERPUNK';
let activeDifficulty = 'NORMAL';
let activeWallMode = 'CLASSIC';
let activeBoardSize = 'MEDIUM';
let activeObstacleMode = 'OFF';

// Game Engine State
let isStarted = false;
let isPaused = false;
let isGameOver = false;
let isMuted = true;

// Direction Queue
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let inputQueue = [];

// Core Game Metrics
let score = 0;
let level = 1;
let foodsEatenThisLevel = 0;
let currentTickSpeed = 130;
let highScore = 0;
let lastTickTime = 0;
let gameLoopTimer = null;

// Touch Gestures Coordinates
let touchStartX = 0;
let touchStartY = 0;

// Power-up counters
let slowMoExpires = 0;
let scoreMultExpires = 0;
let shieldActive = false;

// Survival Timers
let survivalStartTime = 0;
let survivalTimeElapsed = 0; // Cumulative ms active play

// Leaderboards lists & Player lifetime statistics database
let localLeaderboard = [];
let playerStats = {
  gamesPlayed: 0,
  foodsEaten: 0,
  bestScore: 0,
  longestSurvival: 0,
  powerupsCollected: 0
};

// AudioContext reference
let audioCtx = null;

// ============================================================================
// 3. DOM REFERENCES
// ============================================================================
const DOM = {
  canvas: document.getElementById('gameCanvas'),
  ctx: document.getElementById('gameCanvas').getContext('2d'),
  canvasWrapper: document.getElementById('canvasWrapper'),
  screenFlash: document.getElementById('screenFlash'),
  
  // Cabinet Screens & Overlays
  startOverlay: document.getElementById('startOverlay'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  leaderboardOverlay: document.getElementById('leaderboardOverlay'),
  helpOverlay: document.getElementById('helpOverlay'),
  pauseOverlay: document.getElementById('pauseOverlay'),
  gameOverOverlay: document.getElementById('gameOverOverlay'),
  
  // HUD Displays
  scoreVal: document.getElementById('scoreVal'),
  highScoreVal: document.getElementById('highScoreVal'),
  levelVal: document.getElementById('levelVal'),
  foodEatenVal: document.getElementById('foodEatenVal'),
  levelProgressBar: document.getElementById('levelProgressBar'),
  speedGaugeVal: document.getElementById('speedGaugeVal'),
  survivalTimerVal: document.getElementById('survivalTimerVal'),
  
  // Active systems indicators
  hudShield: document.getElementById('hudShield'),
  shieldStatusVal: document.getElementById('shieldStatusVal'),
  hudSlow: document.getElementById('hudSlow'),
  timerBarSlow: document.getElementById('timerBarSlow'),
  hudMult: document.getElementById('hudMult'),
  timerBarMult: document.getElementById('timerBarMult'),
  
  // Game Over Details
  finalScoreVal: document.getElementById('finalScoreVal'),
  finalTimeVal: document.getElementById('finalTimeVal'),
  finalDiffVal: document.getElementById('finalDiffVal'),
  newHighScoreAlert: document.getElementById('newHighScoreAlert'),
  pauseScoreVal: document.getElementById('pauseScoreVal'),
  
  // Rankings overlay
  leaderboardBody: document.getElementById('leaderboardBody'),
  clearLeaderboardBtn: document.getElementById('clearLeaderboardBtn'),
  clearStatsBtn: document.getElementById('clearStatsBtn'),
  tabRankingsBtn: document.getElementById('tabRankingsBtn'),
  tabStatsBtn: document.getElementById('tabStatsBtn'),
  tabRankingsContent: document.getElementById('tabRankingsContent'),
  tabStatsContent: document.getElementById('tabStatsContent'),
  
  // Lifetime Statistics widgets
  statGamesPlayed: document.getElementById('statGamesPlayed'),
  statFoodsEaten: document.getElementById('statFoodsEaten'),
  statBestScore: document.getElementById('statBestScore'),
  statLongestSurvival: document.getElementById('statLongestSurvival'),
  statPowerupsCollected: document.getElementById('statPowerupsCollected'),
  
  // Control Panel Buttons
  startGameBtn: document.getElementById('startGameBtn'),
  pauseGameBtn: document.getElementById('pauseGameBtn'),
  restartGameBtn: document.getElementById('restartGameBtn'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  soundOnIcon: document.getElementById('sound-on-icon'),
  soundOffIcon: document.getElementById('sound-off-icon'),
  
  // Menu Buttons
  menuStartBtn: document.getElementById('menuStartBtn'),
  menuConfigBtn: document.getElementById('menuConfigBtn'),
  menuRankingsBtn: document.getElementById('menuRankingsBtn'),
  menuHelpBtn: document.getElementById('menuHelpBtn'),
  
  // Overlay Resume / Restart buttons
  overlayResumeBtn: document.getElementById('overlayResumeBtn'),
  overlayRestartBtn: document.getElementById('overlayRestartBtn'),
  gameOverMenuBtn: document.getElementById('gameOverMenuBtn'),
  settingsBackBtn: document.getElementById('settingsBackBtn'),
  leaderboardBackBtn: document.getElementById('leaderboardBackBtn'),
  helpBackBtn: document.getElementById('helpBackBtn'),
  
  // Mobile Arrow Keys
  dpadUp: document.getElementById('dpadUp'),
  dpadLeft: document.getElementById('dpadLeft'),
  dpadRight: document.getElementById('dpadRight'),
  dpadDown: document.getElementById('dpadDown')
};

// ============================================================================
// 4. INITIALIZATION
// ============================================================================

/**
 * Syncs the dynamic color values directly from loaded CSS Variable tokens
 */
function syncThemeColorsBridge() {
  const style = window.getComputedStyle(document.body);
  GAME_CONFIG.COLOR_PALETTE.bg = style.getPropertyValue('--bg-primary').trim() || '#04040d';
  GAME_CONFIG.COLOR_PALETTE.grid = style.getPropertyValue('--bg-grid').trim() || '#090a1a';
  GAME_CONFIG.COLOR_PALETTE.snakeCyan = style.getPropertyValue('--neon-cyan').trim() || '#00f3ff';
  GAME_CONFIG.COLOR_PALETTE.snakePink = style.getPropertyValue('--neon-pink').trim() || '#ff007f';
  GAME_CONFIG.COLOR_PALETTE.obstacle = style.getPropertyValue('--neon-obstacle').trim() || '#ff0055';
}

/**
 * Loads high score depending on settings panel grids
 */
function loadSelectedHighScore() {
  const key = getHighScoreStorageKey();
  const saved = localStorage.getItem(key);
  highScore = saved ? parseInt(saved, 10) : 0;
  DOM.highScoreVal.textContent = highScore;
}

/**
 * Loads preferences on load
 */
function loadUserPreferences() {
  // Load configuration options safely if present with strict validation against defined config maps
  if (localStorage.getItem('neonTheme')) {
    const val = localStorage.getItem('neonTheme');
    if (GAME_CONFIG.THEMES[val]) activeTheme = val;
  }
  if (localStorage.getItem('neonDifficulty')) {
    const val = localStorage.getItem('neonDifficulty');
    if (GAME_CONFIG.DIFFICULTIES[val]) activeDifficulty = val;
  }
  if (localStorage.getItem('neonWallMode')) {
    const val = localStorage.getItem('neonWallMode');
    if (GAME_CONFIG.WALL_MODES[val]) activeWallMode = val;
  }
  if (localStorage.getItem('neonBoardSize')) {
    const val = localStorage.getItem('neonBoardSize');
    if (GAME_CONFIG.BOARD_SIZES[val]) activeBoardSize = val;
  }
  if (localStorage.getItem('neonObstacles')) {
    const val = localStorage.getItem('neonObstacles');
    if (GAME_CONFIG.OBSTACLES[val]) activeObstacleMode = val;
  }
  if (localStorage.getItem('neonMuted') !== null) {
    isMuted = localStorage.getItem('neonMuted') === 'true';
  }
  
  // Set theme class on body
  document.body.className = `theme-${activeTheme.toLowerCase()}`;
  syncThemeColorsBridge();
  
  // Set UI tags status active
  setSelectedTag('themeGroup', activeTheme);
  setSelectedTag('diffGroup', activeDifficulty);
  setSelectedTag('wallGroup', activeWallMode);
  setSelectedTag('sizeGroup', activeBoardSize);
  setSelectedTag('obsGroup', activeObstacleMode);
  
  // Sync Audio control icons
  if (isMuted) {
    DOM.soundOnIcon.style.display = 'none';
    DOM.soundOffIcon.style.display = 'block';
  } else {
    DOM.soundOnIcon.style.display = 'block';
    DOM.soundOffIcon.style.display = 'none';
  }
  
  // Load high scores and databases logs
  loadSelectedHighScore();
  loadLeaderboard();
  loadPlayerStats();
}

/**
 * Highlight helper tags buttons
 */
function setSelectedTag(groupId, value) {
  const container = document.getElementById(groupId);
  if (!container) return;
  const buttons = container.querySelectorAll('.btn-tag');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-value') === value) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// ============================================================================
// 5. INPUT HANDLING
// ============================================================================

function handleInput(event) {
  let keyDir = null;
  
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      keyDir = 'UP';
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      keyDir = 'DOWN';
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      keyDir = 'LEFT';
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      keyDir = 'RIGHT';
      break;
    
    // Space Pause Core
    case ' ':
      event.preventDefault();
      // Block pauses during open configuration screens
      const activeOverlay = document.querySelector('.canvas-overlay.active:not(#pauseOverlay):not(#gameOverOverlay)');
      if (activeOverlay) return;
      
      if (isStarted && !isGameOver) {
        if (isPaused) {
          startGame();
        } else {
          pauseGame();
        }
      } else if (!isStarted && !isGameOver) {
        startGame();
      }
      break;
      
    // Escape key closes modals safely
    case 'Escape':
      event.preventDefault();
      closeAllModals();
      break;
  }
  
  if (keyDir) {
    event.preventDefault(); // Intercept window scrolls
    queueDirectionInput(keyDir);
  }
}

function queueDirectionInput(keyDir) {
  if (inputQueue.length < 3) {
    const last = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;
    if (keyDir !== last) {
      // Prevents instant double-axis backwards suicide reversing
      if (
        (keyDir === 'UP' && last !== 'DOWN') ||
        (keyDir === 'DOWN' && last !== 'UP') ||
        (keyDir === 'LEFT' && last !== 'RIGHT') ||
        (keyDir === 'RIGHT' && last !== 'LEFT')
      ) {
        inputQueue.push(keyDir);
      }
    }
  }
}

// Touch swipe gestures
DOM.canvas.addEventListener('touchstart', (e) => {
  if (isStarted && !isPaused && !isGameOver) {
    e.preventDefault(); // Intercept browser scroll
  }
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: false });

DOM.canvas.addEventListener('touchmove', (e) => {
  if (isStarted && !isPaused && !isGameOver) {
    e.preventDefault();
  }
}, { passive: false });

DOM.canvas.addEventListener('touchend', (e) => {
  if (isStarted && !isPaused && !isGameOver) {
    e.preventDefault();
  }
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  
  const minSwipeDist = 30; // Min pixels coordinates
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (Math.abs(deltaX) > minSwipeDist) {
      if (deltaX > 0) {
        queueDirectionInput('RIGHT');
      } else {
        queueDirectionInput('LEFT');
      }
    }
  } else {
    if (Math.abs(deltaY) > minSwipeDist) {
      if (deltaY > 0) {
        queueDirectionInput('DOWN');
      } else {
        queueDirectionInput('UP');
      }
    }
  }
}, { passive: false });

// Mobile Arrow clicks
const registerDpadBtn = (element, keyDir) => {
  element.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    queueDirectionInput(keyDir);
  });
};

registerDpadBtn(DOM.dpadUp, 'UP');
registerDpadBtn(DOM.dpadLeft, 'LEFT');
registerDpadBtn(DOM.dpadRight, 'RIGHT');
registerDpadBtn(DOM.dpadDown, 'DOWN');

// ============================================================================
// 6. GAME LOOP
// ============================================================================

function gameEngineLoop(timestamp) {
  if (!isStarted || isPaused || isGameOver) return;
  
  gameLoopTimer = requestAnimationFrame(gameEngineLoop);
  
  const elapsed = timestamp - lastTickTime;
  
  // Calculate slow motion speed modifiers
  const now = Date.now();
  const isSlow = slowMoExpires > now;
  const tickDuration = isSlow ? Math.floor(currentTickSpeed * 1.35) : currentTickSpeed;
  
  if (elapsed >= tickDuration) {
    lastTickTime = timestamp - (elapsed % tickDuration);
    updateGame();
  }
  
  // Sync speed HUD dynamically if slow mo ends
  if (!isSlow && DOM.speedGaugeVal.textContent !== `${currentTickSpeed} ms`) {
    DOM.speedGaugeVal.textContent = `${currentTickSpeed} ms`;
  }
  
  // Live survival timer ticking
  if (survivalStartTime > 0) {
    const elapsedSecs = Math.floor((survivalTimeElapsed + (Date.now() - survivalStartTime)) / 1000);
    DOM.survivalTimerVal.textContent = `${elapsedSecs}s`;
  }
  
  // Updates visuals particles background drifting
  updateParticles();
  updateFloatingTexts();
  updatePowerUpTimers();
  updateHUDStatus();
  
  // Draw canvas graphics
  drawGame();
}

// ============================================================================
// 7. DRAWING
// ============================================================================

function drawGame() {
  const currentSize = GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  const cellSize = DOM.canvas.width / currentSize;
  
  // Clear Grid Canvas
  DOM.ctx.fillStyle = GAME_CONFIG.COLOR_PALETTE.bg;
  DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
  
  // 1. Drifting background star particles
  drawBackgroundStars();
  
  // 2. Mesh lines grid
  drawArenaGrid(currentSize, cellSize);
  
  // 3. Obstacles hazard blocks
  drawObstacles(cellSize);
  
  // 4. pulsing energy cells
  drawFood(cellSize);
  
  // 5. custom powerup shapes
  drawPowerUps(cellSize);
  
  // 6. active particle bursts
  drawParticles();
  
  // 7. Shifting neon snake body
  drawSnake(cellSize);
  
  // 8. Rising indicators labels
  drawFloatingTexts();
}

function drawArenaGrid(size, cellSize) {
  DOM.ctx.strokeStyle = GAME_CONFIG.COLOR_PALETTE.grid;
  DOM.ctx.lineWidth = 1;
  
  for (let i = 0; i <= size; i++) {
    // Vertical
    DOM.ctx.beginPath();
    DOM.ctx.moveTo(i * cellSize, 0);
    DOM.ctx.lineTo(i * cellSize, DOM.canvas.height);
    DOM.ctx.stroke();
    
    // Horizontal
    DOM.ctx.beginPath();
    DOM.ctx.moveTo(0, i * cellSize);
    DOM.ctx.lineTo(DOM.canvas.width, i * cellSize);
    DOM.ctx.stroke();
  }
}

function drawObstacles(cellSize) {
  obstacles.forEach(o => {
    DOM.ctx.save();
    const x = o.x * cellSize;
    const y = o.y * cellSize;
    const pad = 2;
    
    // Render hazard diagonal hatch pattern inside obstacle block
    DOM.ctx.fillStyle = 'rgba(255, 0, 85, 0.08)';
    DOM.ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
    
    DOM.ctx.strokeStyle = GAME_CONFIG.COLOR_PALETTE.obstacle;
    DOM.ctx.lineWidth = 2;
    DOM.ctx.shadowBlur = 10;
    DOM.ctx.shadowColor = GAME_CONFIG.COLOR_PALETTE.obstacle;
    
    DOM.ctx.strokeRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
    
    // Draw neon core indicator dot
    DOM.ctx.fillStyle = '#ffffff';
    DOM.ctx.shadowBlur = 0;
    DOM.ctx.beginPath();
    DOM.ctx.arc(x + cellSize / 2, y + cellSize / 2, 2.5, 0, Math.PI * 2);
    DOM.ctx.fill();
    
    DOM.ctx.restore();
  });
}

function drawFood(cellSize) {
  const pulseFactor = Math.sin(Date.now() / 130) * 1.5 + 1.5;
  const radius = (cellSize - 6) / 2 + (pulseFactor * 0.35);
  const cx = food.x * cellSize + cellSize / 2;
  const cy = food.y * cellSize + cellSize / 2;
  
  DOM.ctx.save();
  DOM.ctx.fillStyle = GAME_CONFIG.COLOR_PALETTE.snakePink;
  DOM.ctx.shadowBlur = 12 + pulseFactor * 3;
  DOM.ctx.shadowColor = GAME_CONFIG.COLOR_PALETTE.snakePink;
  
  DOM.ctx.beginPath();
  DOM.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  DOM.ctx.fill();
  
  // White core spark
  DOM.ctx.fillStyle = '#ffffff';
  DOM.ctx.shadowBlur = 0;
  DOM.ctx.beginPath();
  DOM.ctx.arc(cx - radius / 3, cy - radius / 3, radius / 4, 0, Math.PI * 2);
  DOM.ctx.fill();
  
  DOM.ctx.restore();
}

function drawPowerUps(cellSize) {
  if (!activePowerUp) return;
  
  const pulse = Math.sin(Date.now() / 100) * 2 + 2;
  const cx = activePowerUp.x * cellSize + cellSize / 2;
  const cy = activePowerUp.y * cellSize + cellSize / 2;
  const size = (cellSize - 6) / 2 + (pulse * 0.4);
  
  DOM.ctx.save();
  DOM.ctx.fillStyle = activePowerUp.color;
  DOM.ctx.strokeStyle = '#ffffff';
  DOM.ctx.lineWidth = 1;
  DOM.ctx.shadowBlur = 15 + pulse * 2;
  DOM.ctx.shadowColor = activePowerUp.color;
  
  DOM.ctx.beginPath();
  if (activePowerUp.type === 'GOLDEN') {
    DOM.ctx.arc(cx, cy, size, 0, Math.PI * 2);
  } else if (activePowerUp.type === 'SLOW') {
    DOM.ctx.moveTo(cx, cy - size);
    DOM.ctx.lineTo(cx + size, cy);
    DOM.ctx.lineTo(cx, cy + size);
    DOM.ctx.lineTo(cx - size, cy);
  } else if (activePowerUp.type === 'SHIELD') {
    for (let i = 0; i < 5; i++) {
      DOM.ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * size + cx,
                 -Math.sin((18 + i * 72) * Math.PI / 180) * size + cy);
      DOM.ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (size/2) + cx,
                 -Math.sin((54 + i * 72) * Math.PI / 180) * (size/2) + cy);
    }
  } else if (activePowerUp.type === 'MULTIPLIER') {
    DOM.ctx.rect(cx - size, cy - size, size * 2, size * 2);
  }
  DOM.ctx.closePath();
  DOM.ctx.fill();
  DOM.ctx.stroke();
  
  // glyph center text
  DOM.ctx.fillStyle = '#05050f';
  DOM.ctx.shadowBlur = 0;
  DOM.ctx.font = 'bold 9px Arial';
  DOM.ctx.textAlign = 'center';
  DOM.ctx.textBaseline = 'middle';
  DOM.ctx.fillText(activePowerUp.icon, cx, cy);
  
  DOM.ctx.restore();
}

function drawSnake(cellSize) {
  if (snake.length === 0) return;
  
  snake.forEach((segment, idx) => {
    DOM.ctx.save();
    
    // Gradient coloring blends Cyan head to Pink tail
    const ratio = idx / (snake.length - 1 || 1);
    const r = Math.floor(0 + ratio * 255);
    const g = Math.floor(243 * (1 - ratio));
    const b = Math.floor(255 * (1 - ratio) + ratio * 127);
    const colorStyle = `rgb(${r}, ${g}, ${b})`;
    
    DOM.ctx.fillStyle = colorStyle;
    DOM.ctx.shadowBlur = idx === 0 ? 18 : 8;
    DOM.ctx.shadowColor = idx === 0 ? GAME_CONFIG.COLOR_PALETTE.snakeCyan : colorStyle;
    
    const x = segment.x * cellSize;
    const y = segment.y * cellSize;
    const pad = 2;
    
    drawRoundedRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, idx === 0 ? 6 : 4);
    DOM.ctx.fill();
    
    // Multipliers sparks trailing tails
    if (idx === snake.length - 1 && scoreMultExpires > Date.now() && Math.random() < 0.25) {
      spawnParticles(segment.x, segment.y, GAME_CONFIG.POWER_UPS.MULTIPLIER.color, 1);
    }
    
    // Head direction indicators eyes
    if (idx === 0) {
      DOM.ctx.fillStyle = '#05050f';
      DOM.ctx.shadowBlur = 0;
      
      const eyeSize = Math.max(2, cellSize * 0.15);
      const eyeOffset = Math.max(3, cellSize * 0.22);
      
      let e1 = { x: 0, y: 0 }, e2 = { x: 0, y: 0 };
      switch (direction) {
        case 'UP':
          e1 = { x: x + eyeOffset, y: y + eyeOffset };
          e2 = { x: x + cellSize - eyeOffset - eyeSize, y: y + eyeOffset };
          break;
        case 'DOWN':
          e1 = { x: x + eyeOffset, y: y + cellSize - eyeOffset - eyeSize };
          e2 = { x: x + cellSize - eyeOffset - eyeSize, y: y + cellSize - eyeOffset - eyeSize };
          break;
        case 'LEFT':
          e1 = { x: x + eyeOffset, y: y + eyeOffset };
          e2 = { x: x + eyeOffset, y: y + cellSize - eyeOffset - eyeSize };
          break;
        case 'RIGHT':
          e1 = { x: x + cellSize - eyeOffset - eyeSize, y: y + eyeOffset };
          e2 = { x: x + cellSize - eyeOffset - eyeSize, y: y + cellSize - eyeOffset - eyeSize };
          break;
      }
      DOM.ctx.fillRect(e1.x, e1.y, eyeSize, eyeSize);
      DOM.ctx.fillRect(e2.x, e2.y, eyeSize, eyeSize);
    }
    DOM.ctx.restore();
  });
}

function drawRoundedRect(x, y, w, h, radius) {
  DOM.ctx.beginPath();
  DOM.ctx.moveTo(x + radius, y);
  DOM.ctx.arcTo(x + w, y, x + w, y + h, radius);
  DOM.ctx.arcTo(x + w, y + h, x, y + h, radius);
  DOM.ctx.arcTo(x, y + h, x, y, radius);
  DOM.ctx.arcTo(x, y, x + w, y, radius);
  DOM.ctx.closePath();
}

function drawBackgroundStars() {
  DOM.ctx.save();
  bgStars.forEach(s => {
    s.alpha += s.speed;
    if (s.alpha > 0.65 || s.alpha < 0.1) {
      s.speed = -s.speed;
    }
    DOM.ctx.fillStyle = `rgba(0, 243, 255, ${Math.max(0, s.alpha)})`;
    DOM.ctx.beginPath();
    DOM.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    DOM.ctx.fill();
  });
  DOM.ctx.restore();
}

function drawParticles() {
  particles.forEach(p => {
    DOM.ctx.save();
    DOM.ctx.globalAlpha = p.alpha;
    DOM.ctx.beginPath();
    DOM.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    DOM.ctx.shadowBlur = 8;
    DOM.ctx.shadowColor = p.color;
    DOM.ctx.fillStyle = p.color;
    DOM.ctx.fill();
    DOM.ctx.restore();
  });
}

function drawFloatingTexts() {
  DOM.ctx.save();
  floatingTexts.forEach(t => {
    DOM.ctx.globalAlpha = t.alpha;
    DOM.ctx.font = 'bold 10px Orbitron';
    DOM.ctx.textAlign = 'center';
    DOM.ctx.fillStyle = t.color;
    DOM.ctx.shadowBlur = 8;
    DOM.ctx.shadowColor = t.color;
    DOM.ctx.fillText(t.text, t.x, t.y);
  });
  DOM.ctx.restore();
}

// ============================================================================
// 8. COLLISION
// ============================================================================

function addScore(gained) {
  score += gained;
  DOM.scoreVal.textContent = score;
  if (score > highScore) {
    highScore = score;
    DOM.highScoreVal.textContent = highScore;
  }
}

function updateGame() {
  // Pull queued inputs
  if (inputQueue.length > 0) {
    const targetDir = inputQueue.shift();
    if (
      (targetDir === 'UP' && direction !== 'DOWN') ||
      (targetDir === 'DOWN' && direction !== 'UP') ||
      (targetDir === 'LEFT' && direction !== 'RIGHT') ||
      (targetDir === 'RIGHT' && direction !== 'LEFT')
    ) {
      direction = targetDir;
    }
  }
  
  const head = { ...snake[0] };
  const currentSize = GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  
  // Calculate next coordinate positions
  switch (direction) {
    case 'UP': head.y -= 1; break;
    case 'DOWN': head.y += 1; break;
    case 'LEFT': head.x -= 1; break;
    case 'RIGHT': head.x += 1; break;
  }
  
  // Boundary Collisions Checks
  if (head.x < 0 || head.y < 0 || head.x >= currentSize || head.y >= currentSize) {
    if (activeWallMode === 'WRAP') {
      head.x = (head.x + currentSize) % currentSize;
      head.y = (head.y + currentSize) % currentSize;
    } else {
      if (handleCollisionCrash()) return;
    }
  }
  
  // Obstacles Collisions Checks
  let obstacleHit = false;
  obstacles.forEach(o => {
    if (o.x === head.x && o.y === head.y) obstacleHit = true;
  });
  if (obstacleHit) {
    if (handleCollisionCrash()) return;
    return; // Block move updates
  }
  
  // Body self Collisions Checks
  let selfHit = false;
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) selfHit = true;
  }
  if (selfHit) {
    if (handleCollisionCrash()) return;
    return;
  }
  
  // Safe coordinate push
  snake.unshift(head);
  
  // Collect powerups
  if (activePowerUp && head.x === activePowerUp.x && head.y === activePowerUp.y) {
    collectPowerUp(activePowerUp.type, activePowerUp.x, activePowerUp.y);
  }
  
  // Collect standard energy cells
  if (head.x === food.x && head.y === food.y) {
    foodsEatenThisLevel += 1;
    DOM.foodEatenVal.textContent = foodsEatenThisLevel;
    
    // Statistics increments
    playerStats.foodsEaten += 1;
    
    const doubleFactor = scoreMultExpires > Date.now() ? 2 : 1;
    const gained = 10 * doubleFactor;
    addScore(gained);
    
    playEatSound();
    spawnFloatingText(food.x, food.y, `+${gained}`, GAME_CONFIG.POWER_UPS.MULTIPLIER.color);
    spawnParticles(food.x, food.y, GAME_CONFIG.COLOR_PALETTE.snakeCyan, 12);
    
    // Level progress check
    if (foodsEatenThisLevel >= 5) {
      handleLevelUp();
    }
    
    placeFood();
    spawnPowerUp();
  } else {
    // Standard translate
    snake.pop();
  }
}

function handleCollisionCrash() {
  if (shieldActive) {
    shieldActive = false;
    playShieldBreakSound();
    triggerScreenShake();
    triggerScreenFlash(true);
    
    spawnFloatingText(snake[0].x, snake[0].y, '🛡️ SHIELD BROKEN', GAME_CONFIG.POWER_UPS.SHIELD.color);
    updateHUDStatus();
    return false;
  } else {
    handleGameOver();
    return true;
  }
}

// ============================================================================
// 9. FOOD AND POWER-UPS
// ============================================================================

function placeFood() {
  const currentSize = GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  let overlap = true;
  let attempts = 0;
  
  while (overlap && attempts < 300) {
    const rx = Math.floor(Math.random() * currentSize);
    const ry = Math.floor(Math.random() * currentSize);
    
    overlap = false;
    
    // Snake body
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === rx && snake[i].y === ry) {
        overlap = true;
        break;
      }
    }
    
    // Obstacles
    obstacles.forEach(o => {
      if (o.x === rx && o.y === ry) overlap = true;
    });
    
    // Active power-up
    if (activePowerUp && activePowerUp.x === rx && activePowerUp.y === ry) {
      overlap = true;
    }
    
    if (!overlap) {
      food.x = rx;
      food.y = ry;
      break;
    }
    attempts++;
  }
  
  if (overlap) {
    // Sequential fallback scan to guarantee free coordinates
    for (let x = 0; x < currentSize; x++) {
      for (let y = 0; y < currentSize; y++) {
        let cellOverlap = false;
        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === x && snake[i].y === y) { cellOverlap = true; break; }
        }
        if (cellOverlap) continue;
        for (let i = 0; i < obstacles.length; i++) {
          if (obstacles[i].x === x && obstacles[i].y === y) { cellOverlap = true; break; }
        }
        if (cellOverlap) continue;
        if (activePowerUp && activePowerUp.x === x && activePowerUp.y === y) continue;
        
        food.x = x;
        food.y = y;
        overlap = false;
        return;
      }
    }
  }
}

function spawnPowerUp() {
  if (activePowerUp) return;
  
  const keys = Object.keys(GAME_CONFIG.POWER_UPS);
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];
  const pConf = GAME_CONFIG.POWER_UPS[selectedKey];
  
  if (Math.random() > pConf.chance) return;
  
  const currentSize = GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  let overlap = true;
  let attempts = 0;
  let rx = 0, ry = 0;
  
  while (overlap && attempts < 200) {
    rx = Math.floor(Math.random() * currentSize);
    ry = Math.floor(Math.random() * currentSize);
    
    overlap = false;
    
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === rx && snake[i].y === ry) {
        overlap = true;
        break;
      }
    }
    obstacles.forEach(o => {
      if (o.x === rx && o.y === ry) overlap = true;
    });
    if (food.x === rx && food.y === ry) overlap = true;
    
    attempts++;
  }
  
  if (overlap) {
    // Sequential fallback scan to guarantee free coordinates
    for (let x = 0; x < currentSize; x++) {
      for (let y = 0; y < currentSize; y++) {
        let cellOverlap = false;
        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === x && snake[i].y === y) { cellOverlap = true; break; }
        }
        if (cellOverlap) continue;
        for (let i = 0; i < obstacles.length; i++) {
          if (obstacles[i].x === x && obstacles[i].y === y) { cellOverlap = true; break; }
        }
        if (cellOverlap) continue;
        if (food.x === x && food.y === y) continue;
        
        rx = x;
        ry = y;
        overlap = false;
        break;
      }
      if (!overlap) break;
    }
  }
  
  if (!overlap) {
    activePowerUp = {
      x: rx,
      y: ry,
      type: pConf.type,
      color: pConf.color,
      icon: pConf.icon,
      expiresAt: Date.now() + 6500
    };
  }
}

function updatePowerUpTimers() {
  const now = Date.now();
  if (activePowerUp && activePowerUp.expiresAt < now) {
    activePowerUp = null;
  }
}

function collectPowerUp(type, px, py) {
  playPowerUpSound();
  const now = Date.now();
  
  playerStats.powerupsCollected += 1;
  
  if (type === 'GOLDEN') {
    const doubleFactor = scoreMultExpires > now ? 2 : 1;
    const gained = 40 * doubleFactor;
    addScore(gained);
    
    spawnFloatingText(px, py, `+${gained} BONUS!`, GAME_CONFIG.POWER_UPS.GOLDEN.color);
    spawnParticles(px, py, GAME_CONFIG.POWER_UPS.GOLDEN.color, 20);
    
  } else if (type === 'SLOW') {
    slowMoExpires = now + 6000;
    const displaySpeed = Math.floor(currentTickSpeed * 1.35);
    DOM.speedGaugeVal.textContent = `${displaySpeed} ms`;
    
    spawnFloatingText(px, py, 'SLOW MOTION', GAME_CONFIG.POWER_UPS.SLOW.color);
    spawnParticles(px, py, GAME_CONFIG.POWER_UPS.SLOW.color, 18);
    
  } else if (type === 'SHIELD') {
    shieldActive = true;
    spawnFloatingText(px, py, 'DEFLECTOR ARMED', GAME_CONFIG.POWER_UPS.SHIELD.color);
    spawnParticles(px, py, GAME_CONFIG.POWER_UPS.SHIELD.color, 18);
    
  } else if (type === 'MULTIPLIER') {
    scoreMultExpires = now + 7000;
    spawnFloatingText(px, py, '2x SCORE ACTIVE', GAME_CONFIG.POWER_UPS.MULTIPLIER.color);
    spawnParticles(px, py, GAME_CONFIG.POWER_UPS.MULTIPLIER.color, 18);
  }
  
  activePowerUp = null;
  savePlayerStats();
  updateHUDStatus();
}

function spawnParticles(gridX, gridY, color, count = 15) {
  const cellSize = DOM.canvas.width / GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  const centerX = gridX * cellSize + cellSize / 2;
  const centerY = gridY * cellSize + cellSize / 2;
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const force = Math.random() * 3 + 1.5;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force,
      radius: Math.random() * 3.5 + 1.2,
      alpha: 1.0,
      decay: Math.random() * 0.04 + 0.025,
      color: color
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

function updateFloatingTexts() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y += t.vy;
    t.alpha -= t.decay;
    if (t.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

function createBackgroundStars() {
  bgStars = [];
  const count = 35;
  for (let i = 0; i < count; i++) {
    bgStars.push({
      x: Math.random() * DOM.canvas.width,
      y: Math.random() * DOM.canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 0.05 + 0.01
    });
  }
}

// ============================================================================
// 10. OBSTACLES AND LEVELS
// ============================================================================

function generateObstacles() {
  obstacles = [];
  const currentSize = GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  const densityPercent = GAME_CONFIG.OBSTACLES[activeObstacleMode].density;
  
  if (densityPercent === 0) return;
  
  const cellCount = currentSize * currentSize;
  const targetCount = Math.floor(cellCount * densityPercent);
  
  let attempts = 0;
  while (obstacles.length < targetCount && attempts < 400) {
    const obsX = Math.floor(Math.random() * currentSize);
    const obsY = Math.floor(Math.random() * currentSize);
    
    const isSafeRow = Math.abs(obsY - Math.floor(currentSize / 2)) >= 2;
    let collision = false;
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === obsX && snake[i].y === obsY) collision = true;
    }
    
    obstacles.forEach(o => {
      if (o.x === obsX && o.y === obsY) collision = true;
    });
    
    if (isSafeRow && !collision) {
      obstacles.push({ x: obsX, y: obsY });
    }
    attempts++;
  }
}

function handleLevelUp() {
  level += 1;
  foodsEatenThisLevel = 0;
  DOM.levelVal.textContent = level;
  DOM.foodEatenVal.textContent = '0';
  
  playLevelUpSound();
  triggerScreenFlash(false);
  
  spawnFloatingText(Math.floor(GAME_CONFIG.BOARD_SIZES[activeBoardSize].size / 2), 2, `LEVEL ${level} DETECTED!`, '#ffffff');
  
  const baseSpeedVal = GAME_CONFIG.DIFFICULTIES[activeDifficulty].baseSpeed;
  currentTickSpeed = Math.max(40, Math.floor(baseSpeedVal * Math.pow(0.94, level - 1)));
  
  const displaySpeed = slowMoExpires > Date.now() ? Math.floor(currentTickSpeed * 1.35) : currentTickSpeed;
  DOM.speedGaugeVal.textContent = `${displaySpeed} ms`;
}

// ============================================================================
// 11. UI UPDATES
// ============================================================================

function updateHUDStatus() {
  const now = Date.now();
  
  const progressRatio = Math.min(1.0, foodsEatenThisLevel / 5);
  DOM.levelProgressBar.style.width = `${progressRatio * 100}%`;
  
  // Slow countdowns
  if (slowMoExpires > now) {
    const remaining = slowMoExpires - now;
    DOM.hudSlow.classList.add('active');
    DOM.timerBarSlow.style.width = `${(remaining / 6000) * 100}%`;
  } else {
    DOM.hudSlow.classList.remove('active');
    DOM.timerBarSlow.style.width = '0%';
  }
  
  // Multiplier countdowns
  if (scoreMultExpires > now) {
    const remaining = scoreMultExpires - now;
    DOM.hudMult.classList.add('active');
    DOM.timerBarMult.style.width = `${(remaining / 7000) * 100}%`;
  } else {
    DOM.hudMult.classList.remove('active');
    DOM.timerBarMult.style.width = '0%';
  }
  
  // Shield HUD indicator
  if (shieldActive) {
    DOM.hudShield.classList.add('active');
    DOM.hudShield.style.opacity = '1';
    DOM.shieldStatusVal.textContent = 'DEFLECTOR ARMED';
    DOM.shieldStatusVal.style.color = GAME_CONFIG.POWER_UPS.SHIELD.color;
    DOM.shieldStatusVal.style.textShadow = `0 0 6px ${GAME_CONFIG.POWER_UPS.SHIELD.color}88`;
  } else {
    DOM.hudShield.classList.remove('active');
    DOM.hudShield.style.opacity = '0.35';
    DOM.shieldStatusVal.textContent = 'OFFLINE';
    DOM.shieldStatusVal.style.color = '#7d819c';
    DOM.shieldStatusVal.style.textShadow = 'none';
  }
}

function showOverlay(overlayNode) {
  // Hide active overlay screens first
  const overlays = [DOM.startOverlay, DOM.settingsOverlay, DOM.leaderboardOverlay, DOM.helpOverlay, DOM.pauseOverlay, DOM.gameOverOverlay];
  overlays.forEach(o => o.classList.remove('active'));
  
  if (overlayNode) {
    overlayNode.classList.add('active');
  }
}

function closeAllModals() {
  if (isStarted && !isPaused && !isGameOver) {
    // If game is actively slithering, Escape key does nothing or pauses
    return;
  }
  
  playClickSound();
  
  // If settings, manuals, or ranks are open, return back to starting dashboard
  const isCustomMenuOpen = DOM.settingsOverlay.classList.contains('active') ||
                           DOM.leaderboardOverlay.classList.contains('active') ||
                           DOM.helpOverlay.classList.contains('active');
  
  if (isCustomMenuOpen) {
    showOverlay(DOM.startOverlay);
  }
}

function setupModalTabsListeners() {
  // Rankings overlay rankings vs lifetime stats tabs switching
  DOM.tabRankingsBtn.addEventListener('click', () => {
    playClickSound();
    DOM.tabRankingsBtn.classList.add('active');
    DOM.tabStatsBtn.classList.remove('active');
    DOM.tabRankingsContent.classList.add('active');
    DOM.tabStatsContent.classList.remove('active');
    renderLeaderboardTable();
  });
  
  DOM.tabStatsBtn.addEventListener('click', () => {
    playClickSound();
    DOM.tabStatsBtn.classList.add('active');
    DOM.tabRankingsBtn.classList.remove('active');
    DOM.tabStatsContent.classList.add('active');
    DOM.tabRankingsContent.classList.remove('active');
    renderPlayerStatsPanel();
  });
}

function triggerScreenShake() {
  DOM.canvasWrapper.classList.remove('shake-trigger');
  void DOM.canvasWrapper.offsetWidth;
  DOM.canvasWrapper.classList.add('shake-trigger');
  setTimeout(() => DOM.canvasWrapper.classList.remove('shake-trigger'), 400);
}

function triggerScreenFlash(isCrash = false) {
  DOM.screenFlash.className = 'screen-flash';
  void DOM.screenFlash.offsetWidth;
  if (isCrash) {
    DOM.screenFlash.classList.add('crash-active');
  } else {
    DOM.screenFlash.classList.add('flash-active');
  }
}

function spawnFloatingText(gridX, gridY, text, color) {
  const cellSize = DOM.canvas.width / GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  const centerX = gridX * cellSize + cellSize / 2;
  const centerY = gridY * cellSize;
  
  floatingTexts.push({
    x: centerX,
    y: centerY,
    text: text,
    color: color,
    alpha: 1.0,
    vy: -0.8,
    decay: 0.02
  });
}

// ============================================================================
// 12. STORAGE
// ============================================================================

function getHighScoreStorageKey() {
  return `neonHighScore_${activeDifficulty}_${activeWallMode}_${activeObstacleMode}`;
}

function loadLeaderboard() {
  const key = 'neonLeaderboard';
  const saved = localStorage.getItem(key);
  try {
    localLeaderboard = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(localLeaderboard)) localLeaderboard = [];
  } catch (e) {
    localLeaderboard = [];
  }
}

function saveLeaderboard() {
  localStorage.setItem('neonLeaderboard', JSON.stringify(localLeaderboard));
}

function loadPlayerStats() {
  const saved = localStorage.getItem('neonStats');
  try {
    playerStats = saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      foodsEaten: 0,
      bestScore: 0,
      longestSurvival: 0,
      powerupsCollected: 0
    };
  } catch (e) {
    playerStats = {
      gamesPlayed: 0,
      foodsEaten: 0,
      bestScore: 0,
      longestSurvival: 0,
      powerupsCollected: 0
    };
  }
}

function savePlayerStats() {
  localStorage.setItem('neonStats', JSON.stringify(playerStats));
}

function incrementGamesPlayed() {
  playerStats.gamesPlayed += 1;
  savePlayerStats();
}

/**
 * Adds game over metrics to top-10 list
 */
function recordLeaderboardEntry(finalScore, finalSurvivalTime) {
  const newEntry = {
    score: finalScore,
    survivalTime: finalSurvivalTime,
    difficulty: activeDifficulty,
    wallMode: activeWallMode,
    obstacleMode: activeObstacleMode,
    date: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  localLeaderboard.push(newEntry);
  
  // Sort in descending order
  localLeaderboard.sort((a, b) => b.score - a.score);
  
  // Cap at top 10 elements
  localLeaderboard = localLeaderboard.slice(0, 10);
  
  saveLeaderboard();
  
  // Sync statistics widgets as well
  playerStats.bestScore = Math.max(playerStats.bestScore, finalScore);
  playerStats.longestSurvival = Math.max(playerStats.longestSurvival, finalSurvivalTime);
  savePlayerStats();
}

function renderLeaderboardTable() {
  DOM.leaderboardBody.innerHTML = '';
  
  if (localLeaderboard.length === 0) {
    DOM.leaderboardBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No entries recorded.</td></tr>`;
    return;
  }
  
  localLeaderboard.forEach((entry, idx) => {
    const rankNum = idx + 1;
    let rankHtml = `${rankNum}`;
    
    // Stylized gold, silver, bronze icons
    if (rankNum === 1) rankHtml = `<span style="color: #ffd700;">🥇 1</span>`;
    else if (rankNum === 2) rankHtml = `<span style="color: #c0c0c0;">🥈 2</span>`;
    else if (rankNum === 3) rankHtml = `<span style="color: #cd7f32;">🥉 3</span>`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${rankHtml}</td>
      <td style="color: var(--neon-cyan); font-weight: bold;">${entry.score}</td>
      <td>${entry.survivalTime}s</td>
      <td style="font-size: 0.6rem; color: var(--text-muted);">${entry.difficulty[0]}-${entry.wallMode[0]}-Obs:${entry.obstacleMode[0]}</td>
      <td style="font-size: 0.6rem; color: var(--text-muted);">${entry.date}</td>
    `;
    DOM.leaderboardBody.appendChild(row);
  });
}

function renderPlayerStatsPanel() {
  DOM.statGamesPlayed.textContent = playerStats.gamesPlayed;
  DOM.statFoodsEaten.textContent = playerStats.foodsEaten;
  DOM.statBestScore.textContent = playerStats.bestScore;
  DOM.statLongestSurvival.textContent = `${playerStats.longestSurvival}s`;
  DOM.statPowerupsCollected.textContent = playerStats.powerupsCollected;
}

// ============================================================================
// 13. AUDIO
// ============================================================================

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playClickSound() {
  if (isMuted) return;
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.06);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.06);
  } catch (e) {}
}

function playStartSound() {
  if (isMuted) return;
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];
    
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } catch (e) {}
}

function playEatSound() {
  if (isMuted) return;
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(280, audioCtx.currentTime);
    osc.frequency.setValueAtTime(520, audioCtx.currentTime + 0.06);
    osc.frequency.exponentialRampToValueAtTime(980, audioCtx.currentTime + 0.14);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.14);
  } catch (e) {}
}

function playPowerUpSound() {
  if (isMuted) return;
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(554.37, now);
    osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.2);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc2.start();
    osc.stop(now + 0.25);
    osc2.stop(now + 0.25);
  } catch (e) {}
}

function playLevelUpSound() {
  if (isMuted) return;
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const tones = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    
    tones.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.35);
    });
  } catch (e) {}
}

function playShieldBreakSound() {
  if (isMuted) return;
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
}

function playCrashSound() {
  if (isMuted) return;
  try {
    initAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const rumble = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(30, now + 0.5);
    
    rumble.type = 'triangle';
    rumble.frequency.setValueAtTime(90, now);
    rumble.frequency.linearRampToValueAtTime(10, now + 0.5);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(60, now + 0.5);
    
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    
    osc.connect(filter);
    rumble.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    rumble.start();
    osc.stop(now + 0.55);
    rumble.stop(now + 0.55);
  } catch (e) {}
}

// ============================================================================
// STATE MACHINE CONTROL FLOW METHODS
// ============================================================================

function initGame() {
  const currentSize = GAME_CONFIG.BOARD_SIZES[activeBoardSize].size;
  
  // Clear lists
  snake = [];
  obstacles = [];
  particles = [];
  floatingTexts = [];
  activePowerUp = null;
  
  // Powerup state clears
  slowMoExpires = 0;
  scoreMultExpires = 0;
  shieldActive = false;
  
  // Timers resets
  survivalStartTime = 0;
  survivalTimeElapsed = 0;
  DOM.survivalTimerVal.textContent = '0s';
  
  // Input direction resets
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  inputQueue = [];
  
  // Metrics resets
  score = 0;
  level = 1;
  foodsEatenThisLevel = 0;
  DOM.scoreVal.textContent = '0';
  DOM.levelVal.textContent = '1';
  DOM.foodEatenVal.textContent = '0';
  
  // Set movement speed
  const baseSpeedVal = GAME_CONFIG.DIFFICULTIES[activeDifficulty].baseSpeed;
  currentTickSpeed = baseSpeedVal;
  DOM.speedGaugeVal.textContent = `${currentTickSpeed} ms`;
  
  // Snake coordinates setup center row
  const startY = Math.floor(currentSize / 2);
  snake = [
    { x: 5, y: startY },
    { x: 4, y: startY },
    { x: 3, y: startY },
    { x: 2, y: startY }
  ];
  
  generateObstacles();
  placeFood();
  createBackgroundStars();
  loadSelectedHighScore();
  updateHUDStatus();
  drawGame();
}

function startGame() {
  if (isStarted && !isPaused && !isGameOver) return;
  
  // Hide active screen overlays
  showOverlay(null);
  
  if (isGameOver) {
    initGame();
  }
  
  // Stats game tracker increments - only on fresh start, not on pause/resume
  if (!isStarted) {
    incrementGamesPlayed();
  }
  
  isStarted = true;
  isPaused = false;
  isGameOver = false;
  
  playStartSound();
  
  // Initialize survival timer clocks
  survivalStartTime = Date.now();
  
  // UI states borders
  DOM.canvasWrapper.className = 'canvas-wrapper playing';
  DOM.startGameBtn.disabled = true;
  DOM.pauseGameBtn.disabled = false;
  DOM.restartGameBtn.disabled = false;
  
  // Duplicate loops cancels
  if (gameLoopTimer) {
    cancelAnimationFrame(gameLoopTimer);
  }
  
  lastTickTime = performance.now();
  gameLoopTimer = requestAnimationFrame(gameEngineLoop);
}

function pauseGame() {
  if (!isStarted || isPaused || isGameOver) return;
  
  playClickSound();
  isPaused = true;
  
  // Freeze survival ticking
  survivalTimeElapsed += Date.now() - survivalStartTime;
  survivalStartTime = 0;
  
  DOM.canvasWrapper.className = 'canvas-wrapper paused';
  DOM.pauseScoreVal.textContent = score;
  showOverlay(DOM.pauseOverlay);
  
  DOM.startGameBtn.disabled = false;
  DOM.pauseGameBtn.disabled = true;
}

function restartGame() {
  playClickSound();
  
  isStarted = false;
  isPaused = false;
  isGameOver = false;
  
  // Freeze survival clock
  survivalStartTime = 0;
  survivalTimeElapsed = 0;
  
  if (gameLoopTimer) {
    cancelAnimationFrame(gameLoopTimer);
    gameLoopTimer = null;
  }
  
  DOM.canvasWrapper.className = 'canvas-wrapper';
  showOverlay(DOM.startOverlay);
  DOM.newHighScoreAlert.style.display = 'none';
  
  DOM.startGameBtn.disabled = false;
  DOM.pauseGameBtn.disabled = true;
  DOM.restartGameBtn.disabled = true;
  
  initGame();
}

function handleGameOver() {
  isGameOver = true;
  isStarted = false;
  
  // Calculate final survival time
  if (survivalStartTime > 0) {
    survivalTimeElapsed += Date.now() - survivalStartTime;
    survivalStartTime = 0;
  }
  const finalSurvivalSeconds = Math.floor(survivalTimeElapsed / 1000);
  
  playCrashSound();
  triggerScreenShake();
  triggerScreenFlash(true);
  
  DOM.canvasWrapper.className = 'canvas-wrapper game-over';
  DOM.finalScoreVal.textContent = score;
  DOM.finalTimeVal.textContent = `${finalSurvivalSeconds}s`;
  DOM.finalDiffVal.textContent = GAME_CONFIG.DIFFICULTIES[activeDifficulty].label;
  
  // Update Rankings Top-10
  recordLeaderboardEntry(score, finalSurvivalSeconds);
  
  // Verify high score indicators
  const key = getHighScoreStorageKey();
  const cachedHighScore = localStorage.getItem(key) ? parseInt(localStorage.getItem(key), 10) : 0;
  
  if (score > cachedHighScore) {
    highScore = score;
    DOM.highScoreVal.textContent = highScore;
    localStorage.setItem(key, score.toString());
    DOM.newHighScoreAlert.style.display = 'block';
  } else {
    DOM.newHighScoreAlert.style.display = 'none';
  }
  
  showOverlay(DOM.gameOverOverlay);
  
  DOM.startGameBtn.disabled = false;
  DOM.pauseGameBtn.disabled = true;
  DOM.restartGameBtn.disabled = true;
}

// Mute controls
function toggleSound() {
  isMuted = !isMuted;
  localStorage.setItem('neonMuted', isMuted.toString());
  
  if (isMuted) {
    DOM.soundOnIcon.style.display = 'none';
    DOM.soundOffIcon.style.display = 'block';
  } else {
    DOM.soundOnIcon.style.display = 'block';
    DOM.soundOffIcon.style.display = 'none';
    try {
      initAudio();
      playClickSound();
    } catch (e) {}
  }
}

// ============================================================================
// SYSTEM REGISTRY AND ROUTINGS
// ============================================================================

function setupSettingsListeners() {
  const bindGroup = (groupId, setter, storageKey) => {
    const container = document.getElementById(groupId);
    if (!container) return;
    
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-tag');
      if (!btn) return;
      
      playClickSound();
      const value = btn.getAttribute('data-value');
      setter(value);
      localStorage.setItem(storageKey, value);
      
      // Update Tag highlights
      const buttons = container.querySelectorAll('.btn-tag');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Theme switching updates computed bridges
      if (groupId === 'themeGroup') {
        document.body.className = `theme-${value.toLowerCase()}`;
        syncThemeColorsBridge();
      }
      
      // Safely restart if parameters shift mid-run
      if (isStarted || isPaused || isGameOver) {
        restartGame();
      } else {
        initGame();
      }
    });
  };
  
  bindGroup('themeGroup', (val) => activeTheme = val, 'neonTheme');
  bindGroup('diffGroup', (val) => activeDifficulty = val, 'neonDifficulty');
  bindGroup('wallGroup', (val) => activeWallMode = val, 'neonWallMode');
  bindGroup('sizeGroup', (val) => activeBoardSize = val, 'neonBoardSize');
  bindGroup('obsGroup', (val) => activeObstacleMode = val, 'neonObstacles');
}

function setupMenuNavigationListeners() {
  // Opening Overlay Screens from Start menu
  DOM.menuStartBtn.addEventListener('click', () => {
    if (isMuted) toggleSound();
    startGame();
  });
  DOM.menuConfigBtn.addEventListener('click', () => {
    playClickSound();
    showOverlay(DOM.settingsOverlay);
  });
  DOM.menuRankingsBtn.addEventListener('click', () => {
    playClickSound();
    showOverlay(DOM.leaderboardOverlay);
    DOM.tabRankingsBtn.click(); // Default focus Rankings list
  });
  DOM.menuHelpBtn.addEventListener('click', () => {
    playClickSound();
    showOverlay(DOM.helpOverlay);
  });
  
  // Back to Menu triggers
  const bindBackBtn = (btnNode) => {
    btnNode.addEventListener('click', () => {
      playClickSound();
      showOverlay(DOM.startOverlay);
    });
  };
  bindBackBtn(DOM.settingsBackBtn);
  bindBackBtn(DOM.leaderboardBackBtn);
  bindBackBtn(DOM.helpBackBtn);
  
  // Leaderboard wipes
  DOM.clearLeaderboardBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all Rankings high scores?')) {
      playClickSound();
      localLeaderboard = [];
      saveLeaderboard();
      renderLeaderboardTable();
    }
  });
  DOM.clearStatsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all Lifetime Statistics logs?')) {
      playClickSound();
      playerStats = { gamesPlayed: 0, foodsEaten: 0, bestScore: 0, longestSurvival: 0, powerupsCollected: 0 };
      savePlayerStats();
      renderPlayerStatsPanel();
    }
  });
}

// Registry key down & button bindings
window.addEventListener('keydown', handleInput);

DOM.startGameBtn.addEventListener('click', startGame);
DOM.pauseGameBtn.addEventListener('click', pauseGame);
DOM.restartGameBtn.addEventListener('click', restartGame);
DOM.soundToggleBtn.addEventListener('click', toggleSound);

DOM.overlayResumeBtn.addEventListener('click', startGame);
DOM.overlayRestartBtn.addEventListener('click', startGame);
DOM.gameOverMenuBtn.addEventListener('click', restartGame);

// Initialize startup configurations
loadUserPreferences();
setupSettingsListeners();
setupMenuNavigationListeners();
setupModalTabsListeners();
initGame();
