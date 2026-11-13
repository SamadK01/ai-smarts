# BodyScope 3D - High-Precision Medical Anatomy Explorer 🫀🧠💀

A production-grade, photorealistic 3D human anatomy and physiology visualization built with modern **Three.js (v0.160.0)**, open-licensed biomedical research geometry (**BodyParts3D** & **Z-Anatomy**), synthesized **Web Audio API** heart acoustics, live scrolling **ECG**, and glycemic biophysics simulation.

---

## 🚀 Quick Run Instructions

Because modern browsers restrict ES modules and GLB model loading via the `file://` protocol (CORS), run BodyScope using any standard local static HTTP server:

### Option 1: Python 3 (Pre-installed on macOS/Linux)
```bash
cd bodyscope
python3 -m http.server 8080
```
Then open your browser at: **`http://localhost:8080`**

### Option 2: Node.js (npx serve)
```bash
cd bodyscope
npx serve .
```

---

## 📁 Project Architecture

```
bodyscope/
├── index.html               # Main HTML5 entry point with Three.js Import Map & UI
├── README.md                # Documentation, run instructions & open-source credits
├── models/                  # Open-licensed GLB models (Total size < 30 MB)
│   ├── body.glb             # Complete 206+ bone skeleton + major muscles (Z-Anatomy)
│   ├── skeleton.glb         # 242 named individual bones with hands & feet (BodyParts3D)
│   ├── cardiovascular.glb   # Heart, aorta, pulmonary and systemic arterial/venous trees
│   ├── respiratory.glb      # Lungs with lobes, trachea, and bronchial subdivisions
│   ├── visceral_male.glb    # Complete 120 visceral digestive organs: liver segments, stomach, intestines, pancreas, spleen
│   ├── renal.glb            # Kidneys, ureters, urinary bladder
│   ├── nervous.glb          # Brain, brainstem, spinal cord, peripheral nerves
│   ├── manifest.json        # 3,478 Terminologia Anatomica entries & hierarchy
│   ├── LICENSE              # CC BY-SA 4.0 License text
│   └── NOTICE               # Comprehensive attribution records
└── src/                     # Modular JavaScript (ES Modules)
    ├── config.js            # Global configuration, presets, and initial application state
    ├── data.js              # Standardized anatomical dictionary (English, Latin, Urdu, function, facts)
    ├── materials.js         # PBR MeshPhysicalMaterial translucent peach skin, ivory bones, organs
    ├── scene.js             # PerspectiveCamera, studio multi-point lighting + front cavity light, controls
    ├── postprocessing.js    # EffectComposer, RenderPass, UnrealBloomPass, OutputPass
    ├── modelLoader.js       # 1:1 True metric alignment, procedural glass silhouette shell, raycast registration
    ├── bloodFlow.js         # Centerline curves, instanced arterial/venous flow, "Blood Path" tour
    ├── physiology.js        # Cardiac lub-dub mechanics, lung respiration, live ECG, glucose simulation
    ├── audio.js             # Web Audio API synthesized S1/S2 heart valve closure acoustics
    ├── ui.js                # Search autocomplete, Anatomy Tree, non-overlapping labels, quiz, Urdu RTL
    └── main.js              # App coordinator, 60 FPS animation loop, tab pause handler
```

---

## 🧬 3D Models & Ethical Open Attribution

All 3D models integrated into BodyScope are authentic, open-licensed biomedical geometry derived from leading research projects:

| System | Source Project | License | Key Features |
|---|---|---|---|
| **Full Skeleton** | [BodyParts3D (DBCLS, Japan)](https://lifesciencedb.jp/bp3d/) | [CC BY-SA 2.1 JP](https://creativecommons.org/licenses/by-sa/2.1/jp/) | All 206+ bones with individual names, complete skull, mandible, rib cage, vertebrae, full hands and feet with all phalanges. |
| **Cardiovascular & Viscera** | [Z-Anatomy (Open Anatomy)](https://github.com/Z-Anatomy) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Heart chambers, aortic arch, coronary arteries, systemic veins reaching limbs, lungs with bronchial subdivisions, digestive tract, kidneys. |
| **Female Reference Data** | [NIH Visible Human Project (NLM)](https://www.nlm.nih.gov/research/visible/visible_human.html) | Public Domain / CC BY 4.0 | Female reference pelvic inlet and thoracic dimensions. |
| **Terminology** | *Terminologia Anatomica (TA2)* | FIPAT | Official international Latin anatomical nomenclature. |

### ⚧ Sex-Specific Reproductive & Mammary Anatomy
- **Male Anatomy**: Anatomically complete male reproductive system including bilateral testes, epididymis, ductus deferens, prostate, seminal glands, and penile erectile structures (corpus cavernosum, corpus spongiosum, glans penis).
- **Female Anatomy**:
  - **Pelvic Reproductive Organs**: Anteverted muscular uterus (fundus, body, cervix), bilateral ovaries in ovarian fossae, arched fallopian tubes with fimbriae, and vaginal canal. All male structures are strictly hidden in female mode.
  - **Mammary Glands & Breasts (پستان / دودھ کے غدود)**: Situated over anterior ribs 2–6, featuring natural feminine breast contours, areola, nipple, 14–16 internal glandular lobules, and lactiferous ducts with active lactation milk particle flow.
  - **Skeletal Dimorphism**: Expanded pelvic inlet and wider subpubic angle (>90°).

---

## ✨ Core Technological Innovations

1. **Multiple Body Appearance & Flesh (Maas) Modes**:
   - **Realistic Human Body (👤 حقیقی جسم)**: Solid, photorealistic human skin with warm epidermis, natural specular reflections, and realistic feminine breast contours or male torso.
   - **Flesh & Muscles (🥩 گوشت / عضلات)**: Activates 440+ striated skeletal muscles from Z-Anatomy in rich anatomical detail.
   - **Translucent Peach (🍑 نیم شفاف شیشہ)**: 18% ghost physical transmission revealing internal skeleton and organs.
   - **Cyan X-Ray Hologram (💎 ایکس رے ہولوگرام)**: Sci-fi medical hologram with edge rim fresnel.
   - **Bare Organs (🫀 خالص اعضاء)**: 100% skin transparency for direct organ visibility.

2. **Organs in Action ⚡ (اعضاء کی فعال کارکردگی)**:
   - Live, animated physiological demonstrations for each vital organ:
     - 🫀 **Heart**: Vigorous chamber pumping, lub-dub audio, and live ECG synchrony.
     - 🫁 **Lungs**: Rhythmic respiratory inhalation/exhalation expansion and recoil.
     - 🧠 **Brain**: Neural electrical synaptic impulse flashing across the cerebral cortex.
     - 🥩 **Stomach**: Peristaltic gastric churning contractions for food digestion.
     - 🫘 **Kidneys**: Filtration flow through ureters to the urinary bladder.
     - 🤱 **Mammary Glands / Breasts (Female)**: Lactation milk droplet transit through lactiferous ducts toward the nipple.
     - 🤰 **Uterus & Ovaries (Female)**: Cyclic follicular maturation and uterine gestational support.
     - ♂️ **Male Reproductive (Male)**: Active spermatogenesis and androgen perfusion.

3. **Cardiovascular Blood Flow & "Blood Path" Tour**:
   - Over 1,400 instanced glowing blood particles travelling along arterial (crimson) and venous (royal blue) centerline trajectories down to the hands and feet.
   - "Blood Path" closed-loop tour smoothly guides the camera through the full cycle: *Right Ventricle ➔ Pulmonary Arteries ➔ Lungs (Oxygenation) ➔ Left Heart ➔ Aorta ➔ Systemic Organs & Limbs ➔ Vena Cava ➔ Right Atrium*.
3. **Synchronized Cardiac Lub-Dub & Synthesized Acoustics**:
   - Multi-phase cardiac cycle: Atrial kick followed by vigorous ventricular ejection (systole) and diastolic recoil.
   - Web Audio API synthesizes low-frequency S1 (mitral/tricuspid valve closure, ~60 Hz) and crisper S2 (aortic/pulmonic valve closure, ~90 Hz) in exact sync with the visual heartbeat.
4. **Live Scrolling Electrocardiogram (ECG Lead II)**:
   - Real-time oscilloscope canvas plotting genuine P, Q, R, S, and T waves dynamically timed to the active Heart Rate (BPM).
5. **Glycemic Biophysics Simulation**:
   - Real-time blood glucose model (40 to 400 mg/dL).
   - "Eat Sugar 🍬" triggers a postprandial glucose surge followed by simulated pancreatic insulin clearance.
   - Low sugar (<70 mg/dL) visibly dims the brain (neuroglycopenia); high sugar (>180 mg/dL) triggers renal osmotic glow.
6. **Interaction & Urdu Language Support**:
   - Click/tap any bone, organ, vessel, or nerve to trigger smooth camera fly-to, glowing cyan outline, and detailed medical card.
   - Real-time search with instant autocomplete.
   - Collapsible Anatomy Tree.
   - Non-overlapping leader lines for 3D labels.
   - Interactive Anatomy Mastery Quiz.
   - Full English and Urdu toggle (with native Nastaliq RTL layout).

---

## ⚠️ Medical Disclaimer
> **Educational Visualization Only:** BodyScope 3D is designed strictly for academic, educational, and medical-visualization research purposes. It does not provide clinical medical diagnosis, triage, or personalized therapeutic advice.

