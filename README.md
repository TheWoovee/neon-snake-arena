# 🌌 Neon Snake Arena v3

A highly polished, self-contained browser-based arcade game that blends classic Snake mechanics with a vibrant **Synthwave & Cyberpunk** aesthetic. Built entirely using vanilla **HTML5**, **CSS3**, and **modern JavaScript (ES6+)**—completely client-side with zero external dependencies, libraries, or CDNs.

Featuring multiple visual themes, real-time procedural Web Audio sound synthesis, level progressions, electric obstacles, swipe touch controllers, dynamic power-up systems, local leaderboard, and lifetime statistics.

---

## 🎨 Game Features

*   **Responsive Hybrid Architecture**: Displays beautifully on everything from 4K desktop screens to compact mobile viewports.
*   **Procedural Web Audio Engine**: Generates 8-bit synth sound effects (Eating, Leveling up, Crashing, Shields breaking) programmatically in real-time. No static `.mp3` assets required.
*   **Glassmorphic HUD & Starfield Background**: Sleek glass widgets over a dynamically drifting starfield background.
*   **High-Performance Canvas Rendering**: Draws the play area on a logical 400x400 grid with responsive aspect-ratio scaling.
*   **Buffer Input Queue**: Prevents "instant reversal suicide" by queuing inputs (WASD, Arrows, Swipes, on-screen D-Pad) sequentially across game ticks.
*   **Dynamic Visual Juice**: Employs structural canvas particle explosions, screen flashes, camera shake vibrations, and floating indicators (e.g. `+10`, `+80 BONUS!`) rising and fading.

---

## 🚀 How to Run

Because the project is entirely client-side, it has no build system or package requirements.

### Option 1: Direct Execution
1. Download or clone this directory.
2. Double-click [index.html](file:///d:/ai-games/snake/index.html) to open the game instantly in any modern web browser.

### Option 2: Local Server (Recommended for Audio Permissions)
1. Open your terminal in the project directory.
2. Spin up a lightweight local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server -p 8000
   ```
3. Navigate to `http://localhost:8000` in your web browser.

---

## 🕹️ Controls

| Control | Keyboard Input | Touchscreen Gesture / Virtual Input |
| :--- | :--- | :--- |
| **Move Up** | `W` or `▲ Arrow` | **Swipe Up** / Click **Virtual D-Pad Up** |
| **Move Down** | `S` or `▼ Arrow` | **Swipe Down** / Click **Virtual D-Pad Down** |
| **Move Left** | `A` or `◀ Arrow` | **Swipe Left** / Click **Virtual D-Pad Left** |
| **Move Right** | `D` or `▶ Arrow` | **Swipe Right** / Click **Virtual D-Pad Right** |
| **Pause/Resume** | `Spacebar` | Click **Pause/Start HUD Button** |
| **Close Modals** | `Escape` | Click **Back to Menu** |

---

## 🎮 Game Configurations (Game Modes)

Tailor your gameplay vectors through the **Grid Config** dashboard:

1.  **Difficulty & Speed**: Sets the base clock-speed of the matrix.
    *   `Easy` (180 ms ticks)
    *   `Normal` (130 ms ticks)
    *   `Hard` (90 ms ticks)
    *   `Extreme` (60 ms ticks)
2.  **Wall Physics**:
    *   `Classic`: The arena boundary is highly electric; touching it causes an instant crash.
    *   `Wrap`: Boundaries wrap. Exiting one side places the snake at the opposite edge.
3.  **Arena Scale**: Configures grid cell count.
    *   `Small` (15x15 grid)
    *   `Medium` (20x20 grid)
    *   `Large` (25x25 grid)
4.  **Electric Obstacles**: Generates dangerous neon pink hazard blocks that destroy the snake on contact.
    *   `Off` (0% density)
    *   `Light` (4% density)
    *   `Medium` (8% density)
    *   `Hard` (12% density)
5.  **Graphics Modes**: Switch between two completely different native canvas rendering architectures (persisted in `localStorage` key `neonGraphicsMode`):
    *   ⚡ **Neon Arcade** (Default): Premium retro grid glow theme with gradient square blocks and circular neon food items.
    *   🐍 **Realistic Snake**: Organic tapered snake rendering with green/brown radial snake scales, side eyes, red animating tongue, bite-swell head animations, organic red apple food items, and impact flat crash squash animations.
6.  **Visual Themes**: Dynamically shifts styling tokens on the body and color hooks in the canvas loop:
    *   🌌 **Cyberpunk**: Cyan head, pink tail, deep obsidian board.
    *   🐠 **Ocean Glow**: Teal head, royal blue tail, aquatic black-blue board.
    *   🌋 **Lava Core**: Crimson head, orange-yellow tail, ash black board.
    *   🌲 **Forest Night**: Lime head, emerald tail, charcoal-green board.
    *   ❄️ **Ice Crystal**: Frost white head, ice-blue tail, glacial navy board.

---

## 🛡️ Active Power-Up Systems

Power-ups spawn periodically on free cells with highly optimized sequential fallback checks to ensure they never spawn on the snake or obstacles:

*   ⭐ **Golden Energy (Golden Food)**: Pulsing gold sphere. Despawns in 5.0 seconds. Awards a massive **+40 points** boost.
*   ⏳ **Temporal Dilator (Slow Motion)**: Pulsing cyan diamond. Slows movement speed by **35%** for 6.0 seconds.
*   🛡️ **Shield Deflector (Collision Protection)**: Pulsing purple star. Permanently shields you from **one collision** (wall, body, or obstacle). The shield breaks with a high-pass frequency crash rumble, flashes the screen, and continues play.
*   ⚡ **Hyper Score (2x Multiplier)**: Pulsing green square. **Doubles all scores** collected for 7.0 seconds.

---

## 📈 Scoring & Progression

*   **Standard Energy Cells (Food)**: Adds **+10 points** (+20 points if Multiplier is active).
*   **Golden Cells**: Adds **+40 points** (+80 points if Multiplier is active).
*   **Level Progression**: Eating **5 food cells** triggers a Level Up. This fires a bright level-up screen flash, plays a five-note chime, and increases the game speed by **6%** (compounding) to increase the challenge.
*   **High-Score HUD**: The HUD's high score updates **in real-time** during play the exact instant you break your previous personal record, rather than waiting for the game over screen.

---

## 💾 LocalStorage Schema

The game automatically saves user configurations, achievements, and stats client-side in the browser's `localStorage` namespace:

| Key | Format | Purpose |
| :--- | :--- | :--- |
| `neonTheme` | `String` (`"CYBERPUNK"`, `"OCEAN"`, etc.) | Stored visual aesthetic. |
| `neonDifficulty` | `String` (`"NORMAL"`, `"HARD"`, etc.) | Stored base speed difficulty. |
| `neonWallMode` | `String` (`"CLASSIC"`, `"WRAP"`) | Stored wall physics configuration. |
| `neonBoardSize` | `String` (`"SMALL"`, `"MEDIUM"`, `"LARGE"`) | Stored grid board dimensions. |
| `neonObstacles` | `String` (`"OFF"`, `"LIGHT"`, etc.) | Stored electric hazard block density. |
| `neonMuted` | `Boolean` (`true` / `false`) | Sound synthesizer mute state. |
| `neonLeaderboard` | `Array` (List of up to 10 entries) | Sorted ranks: `[{ score, survivalTime, difficulty, wallMode, obstacleMode, date }]` |
| `neonStats` | `Object` (Aggregated statistics) | Persistent metrics: `{ gamesPlayed, foodsEaten, bestScore, longestSurvival, powerupsCollected }` |
| `neonHighScore_{Diff}_{Wall}_{Obs}` | `Integer` (Dynamic key combinations) | Stores high scores achieved under specific, individual difficulty and rule combinations. |

---

## 🌐 Browser Compatibility

Neon Snake Arena is engineered to run at a lock-step 60FPS on all HTML5 standard-compliant renderers.

*   **Supported Browsers**: Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, Opera, and Android/iOS mobile webviews.
*   **Hardware Scaling**: Utilizes GPU-accelerated CSS filters for premium neon glow styling and canvas rendering operations.
*   **Web Audio API**: Real-time sound rendering requires standard audio context permission (the game boots muted; clicking the unmute speaker icon or starting the game activates browser audio context safely).

---

## 📋 Detailed Manual Testing Checklist

Follow this checklist to audit the entire game experience:

### 1. Environment & Initialization
- [ ] **Direct File Launch**: Double-click [index.html](file:///d:/ai-games/snake/index.html). Verify page loads immediately with no console errors and stars start drifting.
- [ ] **Web Audio Unlock**: Ensure game starts muted. Click the sound toggle button in the top right header. Verify speaker icon switches, a sine click sound plays, and audio is enabled.

### 2. UI Modals & Navigation
- [ ] **Menu Layout**: Verify "Start Simulation", "Grid Config", "Rankings & Stats", and "System Manual" buttons load inside the menu.
- [ ] **Back Buttons**: Open each modal and click its "Back to Menu" button. Confirm you return to the start screen.
- [ ] **Escape Key Hook**: Open any modal, press `Escape` on the keyboard, and check that you return to the main Start Menu overlay.

### 3. Settings & Theme Changes
- [ ] **Theme Switching**: Switch to Lava, Forest, Ocean, and Ice crystal themes. Verify body tags, buttons, grid meshes, and snake colors change immediately.
- [ ] **Graphics Mode Options**: Select **Realistic Snake** in settings. Check that the sidebar "Graphics Core" HUD updates to "Realistic Snake" immediately. Reload the page and verify that the setting persists from `localStorage`.
- [ ] **Board Scaling**: Toggle Small, Medium, and Large sizes. Confirm the grid spacing updates instantly.
- [ ] **High Score Dynamic Load**: Toggle difficulty to Hard. Confirm that the High Score HUD resets to 0 (or its corresponding stored score) and reloads Hard records.

### 4. Real-time Slithering Mechanics
- [ ] **Suicide Collision Lock**: Slither right, then double-tap Left arrow. Verify the input queue blocks self-collision reversals.
- [ ] **Multi-buffered Input Queue**: Tap Up then Right in rapid succession between game clock ticks. Confirm both movements execute on successive frames.
- [ ] **Wall Wrapping**: Set Wall Physics to "Wrap". Slither off the right edge and check that the snake emerges from the left edge.

### 5. Hazards & Game Over Screen
- [ ] **Hazard Blocks**: Turn obstacles to Hard. Check that dangerous crosshatched pink hazard blocks render. Slither into one; check that the canvas container vibrates, a red flash triggers, and the System Crash screen loads.
- [ ] **Dual Buttons Verification**: On the game over screen:
    - [ ] Verify **Reboot Grid** starts a new game immediately with identical configuration.
    - [ ] Verify **Return to Menu** resets states cleanly and takes you back to the start overlay so you can adjust settings.

### 6. Power-ups & Statistics Auditing
- [ ] **Shield Immunity**: Grab a Shield Deflector power-up. HUD status should show "DEFLECTOR ARMED". Slither directly into a wall; verify play continues, the shield breaks with a gritty audio sweep, HUD status switches to "OFFLINE", and a shield broken text pops up.
- [ ] **Live High Score HUD**: Break your high score. Verify that the High Score HUD increments dynamically in real-time during live play.
- [ ] **Lifetime Stats**: Open rankings Stats tab. Verify Games Played, Foods Eaten, and Power-ups Collected increment correctly.
- [ ] **Realistic Snake Aesthetics**: Slither in realistic mode. Verify the organic olive green/brown gradient circles, tapered tail segments, spade head, animated red tongue, and yellow slit eyes.
- [ ] **Bite & Grow swell**: Consume a red apple in realistic mode. Verify the food breathes, and the snake head dynamically swells and settles on consumption.
- [ ] **Crash impact squash**: Crash in realistic mode. Verify grey/brown dust particles burst, the snake head appears squashed flat with shock impact indicator lines, and game over overlay loads.

---

## 🔮 Future Improvement Ideas

Should you wish to expand the arcade cabinet engine, consider the following roadmap hooks:

1.  **Online Multi-Player Vectoring**: Implement real-time client-to-client versus or co-op multiplayer modes using a zero-backend WebRTC networking coordinate broadcaster.
2.  **Custom Synthwave Tracks**: Program a procedural synthesised, looping chiptune synthwave bassline and drums sequence directly inside the Web Audio engine.
3.  **Snake Skin Customizer**: Add options to purchase or unlock unique retro vector patterns, flashing RGB neon patterns, or custom ASCII skin textures using points earned during gameplay.
4.  **Boss Level Encounters**: Introduce boss fights where automated AI snakes or moving grid-cutter lazers sweep the canvas, requiring fast reflexes and shielding collectables to survive.
