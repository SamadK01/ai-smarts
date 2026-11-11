# AI Smarts 🧠✨

A curated suite of interactive, physics-driven, and neural-powered browser games and experiments crafted with pure WebGL, Three.js, Canvas, and synthesized Web Audio.

**Zero build tools, zero external runtime servers, 100% offline-ready.**

---

## 🎮 The 7 Experiments

| # | Experiment | Technology | Highlights |
|---|---|---|---|
| **01** | [**Slingshot Lamp**](lamp.html) | Canvas 2D, Verlet-style Physics | Tactile pull-cord slingshot with elastic physics, warm ambient glow lighting, dynamic shadows, and satisfying tactile snap. |
| **02** | [**Galaxy Giggles**](orbit.html) | Canvas 2D & Orbital Mechanics | Solar system simulator with Keplerian orbits, dynamic planetary velocity ratios, tidal trails, and interactive time-dilation. |
| **03** | [**Reef Angler**](fish.html) | Canvas 2D, Bio-kinematics | Deep-water fishing simulation with sinusoidal tail kinematics, predatory food chains (sharks/lionfish hunting small fish, pufferfish defensive inflation), 60s round timer, and parabolic catch bag physics. |
| **04** | [**Retro Laptop 2006 (ThinkRetro T42)**](wiggle.html) | Three.js WebGL, 2D Canvas Textures | Fully interactive 3D retro clamshell laptop with physical key depressions, mechanical keyboard clicks, 5400 RPM HDD seek rattling, XP startup chime, playable Minesweeper, MSN RetroChat, and Winamp chiptune synth. |
| **05** | [**Quantum & Ultimate Tic Tac Toe**](tictactoe.html) | Minimax Engine, Alpha-Beta, Web Audio | Ultimate 9x9 Super Board where moves dictate the opponent's active quadrant, plus Classic 3x3 with a live Minimax Advantage Meter (+5.0 eval bar), real-time cyber AI commentary, hint engine, and laser win lines. |
| **06** | [**NeuroLife 3D: Neural Evolution Simulator**](neuro.html) | Three.js WebGL, Real Neural Networks | 3D artificial life ecosystem powered by genuine feedforward neural networks (8 inputs, 8 hidden, 3 motor outputs). Inspect live firing neurons and synapses in real-time, trigger cosmic mutations, inject apex predators, or possess ("Mind-Jack") any organism directly. |
| **07** | [**Royal Cue Club 3D: Master Billiards**](billiards.html) | Three.js WebGL, Rigid Body Physics | Luxury 3D pool lounge with American 8-Ball, Snooker Pro, and Trick Shot challenges. Features trajectory raycasting prediction, cue ball spin control (follow, draw, english), mahogany & brass table, and procedural phenolic ball clack acoustics. |

---

## 🔬 Under the Hood

### 1. Genuine Neural Substrate (`neuro.html`)
- **Sensory Receptors (8 inputs)**: Raycasts for nearest food distance & angle, predator proximity & angle, arena wall boundary avoidance, metabolic energy level, and an internal sinusoidal biological clock.
- **Hidden Layer (8 neurons)**: Non-linear hyperbolic tangent (`tanh`) activation functions with He initialization.
- **Motor Outputs (3 actuators)**:
  - Output 0: Steering torque (`tanh`, left-to-right).
  - Output 1: Forward propulsion & thrust (`sigmoid`, speed control).
  - Output 2: Mitosis / Reproduction trigger (`sigmoid`).
- **Interactive Holographic Brain Inspector**: Clicking any entity renders the active electrical potential of every synapse, color-coding excitatory and inhibitory connections in real-time.

### 2. High-Precision Rigid Body & Collision Physics (`billiards.html`)
- Sub-step Euler integration with sphere-to-sphere momentum transfer.
- Angle-dependent cushion rail restitution with friction damping.
- Dynamic trajectory prediction raycaster with ghost ball contact visualization and target deflection lines.

### 3. Minimax AI with Alpha-Beta Pruning (`tictactoe.html`)
- Computes optimal game tree branches with depth-weighted heuristics.
- Generates live advantage evaluation percentages mapped directly to an esports-style evaluation bar.

### 4. Procedural Audio Synthesizer
- Built using the native browser **Web Audio API** (`AudioContext`).
- Generates dynamic square, sawtooth, triangle, and sine waveforms with custom ADSR envelopes for key clicks, phenolic ball collisions, biological chirps, and laser strikes without loading external `.mp3` or `.wav` files.

---

## 🚀 Running Locally

No installation or npm packages required. Simply clone the repository and open `index.html` in any modern web browser:

```bash
git clone https://github.com/SamadK01/ai-smarts.git
cd ai-smarts
open index.html   # macOS
# or xdg-open index.html (Linux) / start index.html (Windows)
```

Alternatively, run a simple local web server:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

---

## 📄 License
MIT © 2026 [Samad Khalid](https://github.com/SamadK01)
