# AI Smarts 🧠✨

A curated suite of interactive, physics-driven, and neural-powered browser games and experiments crafted with pure WebGL, Three.js, Canvas, and synthesized Web Audio.

**Zero build tools, zero external runtime servers, 100% offline-ready.**

---

## 🎮 The 9 Experiments

| # | Experiment | Technology | Highlights |
|---|---|---|---|
| **01** | [**Slingshot Lamp**](lamp.html) | Canvas 2D, Verlet-style Physics | Tactile pull-cord slingshot with elastic physics, warm ambient glow lighting, dynamic shadows, and satisfying tactile snap. |
| **02** | [**Galaxy Giggles**](orbit.html) | Canvas 2D & Orbital Mechanics | Solar system simulator with Keplerian orbits, dynamic planetary velocity ratios, tidal trails, and interactive time-dilation. |
| **03** | [**Reef Angler**](fish.html) | Canvas 2D, Bio-kinematics, Web Audio | Deep-water fishing simulation featuring massive trophy titans (Grand Bluefin Tuna, Golden Emperor Arowana, Colossal Abyssal Angler), mouth-piercing hook physics, dynamic underwater blood plumes, slow stylish struggle reel-up with ratchet clicks, surface breach splashes, and a live swimming Jelly Livewell Aquarium Box with jelly-wobble landing physics. |
| **04** | [**Retro Laptop 2006 (ThinkRetro T42)**](wiggle.html) | Three.js WebGL, 2D Canvas Textures | Fully interactive 3D retro clamshell laptop with physical key depressions, mechanical keyboard clicks, 5400 RPM HDD seek rattling, XP startup chime, playable Minesweeper, MSN RetroChat, and Winamp chiptune synth. |
| **05** | [**Quantum & Ultimate Tic Tac Toe**](tictactoe.html) | Minimax Engine, Alpha-Beta, Web Audio | Ultimate 9x9 Super Board where moves dictate the opponent's active quadrant, plus Classic 3x3 with a live Minimax Advantage Meter (+5.0 eval bar), real-time cyber AI commentary, hint engine, and laser win lines. |
| **06** | [**NeuroLife 3D: Neural Evolution Simulator**](neuro.html) | Three.js WebGL, Real Neural Networks | 3D artificial life ecosystem powered by genuine feedforward neural networks (8 inputs, 8 hidden, 3 motor outputs). Inspect live firing neurons and synapses in real-time, trigger cosmic mutations, inject apex predators, or possess ("Mind-Jack") any organism directly. |
| **07** | [**Royal Carrom Club 3D: Master Board Lounge**](carrom.html) | Three.js WebGL, 2D Disk Physics | Luxury 3D Indian Rosewood Carrom Board with regulation snug pockets, 1P-4P local multiplayer, dynamic player-seat camera, real Carrom extra-shot rules, talcum powder glide, and acoustic wooden clacks. |
| **08** | [**Slingshot Smash: Antique Tabletop Alley**](smash.html) | Canvas 2D, 120Hz Sub-step Physics | Ultra-smooth physical destruction toy sharing the beloved tactile slingshot feel of Slingshot Lamp. Shatter crystal bottles, trigger domino cascades, ring tuned pentatonic brass bells, and fire river pebbles, steel bearings, glowing orbs, or superballs. |
| **09** | [**The Focus Candle: Atmospheric Melting Timer**](candle.html) | Canvas 2D, Dynamic Wax Physics, Web Audio | Realistic beeswax candle timer with smooth real-time melting, organic multi-harmonic flame flickering, interactive wind flutter, dripping wax tear rivulets, cotton wick crackle, wooden matchstick strike, and dual-tone digital beep alarm. |

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

### 2. High-Precision Rigid Body & Collision Physics (`carrom.html`)
- Sub-step Euler integration with disk-to-disk momentum conservation (mass-weighted impulses: striker 15.0g vs pieces 5.5g).
- Solid Sheesham wooden rail bounces with angle-dependent restitution and talcum powder boric glide friction.
- Tactile forward flick, slingshot tension pullback, real-time trajectory laser, and ghost reticle preview.

### 3. Minimax AI with Alpha-Beta Pruning (`tictactoe.html`)
- Computes optimal game tree branches with depth-weighted heuristics.
- Generates live advantage evaluation percentages mapped directly to an esports-style evaluation bar.

### 4. Organic Candle Melting & Thermal Physics (`candle.html`)
- **Proportional Wax Melting Ratio**: Cylinder height shortens continuously in real time based on active countdown progress `(totalDuration - remainingSeconds) / totalDuration`.
- **Procedural Multi-Layer Flame**: Outer orange heat halo, radiant amber body, white-hot core, and blue oxygenated root with multi-harmonic sinusoidal micro-flickers.
- **Dynamic Wax Tear Droplets**: Wax drips travel down the cylinder sides at varying viscosity speeds and solidify organically upon cooling.
- **Interactive Aerodynamics**: Cursor movement translates velocity vectors into flame tilt drag with spring-back harmonic restoration.
- **Dual-Tone Finish Alarm**: Crystal-clear B5 (987.77 Hz) and E6 (1318.51 Hz) alternating chime paired with a Tibetan bell resonance (523.25 Hz C5), plus real-time browser document title countdown flashing so users never miss their timer even when working in other tabs.

### 5. Procedural Audio Synthesizer
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
