/**
 * BodyScope 3D - Main Application Entry Point
 * Orchestrates Scene, PBR Materials, Open Models, Blood Flow, Physiology & UI
 */

import * as THREE from 'three';
import { CONFIG, INITIAL_STATE } from './config.js';
import { MaterialManager } from './materials.js';
import { SceneManager } from './scene.js';
import { PostProcessingManager } from './postprocessing.js';
import { ModelLoader } from './modelLoader.js';
import { BloodFlowSimulation } from './bloodFlow.js';
import { AudioEngine } from './audio.js';
import { PhysiologyEngine } from './physiology.js';
import { UIManager } from './ui.js';

class BodyScopeApp {
  constructor() {
    this.state = { ...INITIAL_STATE };
    this.clock = new THREE.Clock();
    this.isPaused = false;

    this.init();
  }

  init() {
    const canvas = document.getElementById('webgl-canvas');
    const ecgCanvas = document.getElementById('ecg-canvas');
    const glucoseCanvas = document.getElementById('glucose-canvas');

    // 1. Initialize Subsystems
    this.materials = new MaterialManager();
    this.scene = new SceneManager(canvas);
    this.postprocessing = new PostProcessingManager(this.scene.renderer, this.scene.scene, this.scene.camera);
    this.audio = new AudioEngine();

    // 2. Initialize Model Loader
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loading-progress-bar');
    const statusText = document.getElementById('loading-status');

    this.models = new ModelLoader(
      this.scene,
      this.materials,
      (progress, url, loaded, total) => {
        const percent = Math.round(progress * 100);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (statusText) statusText.textContent = `Loading Anatomical Structures: ${percent}% (${loaded}/${total})`;
      },
      (loader) => {
        if (loadingScreen) {
          loadingScreen.style.opacity = '0';
          setTimeout(() => loadingScreen.style.display = 'none', 600);
        }
        // Initialize blood flow particles once vessels are ready
        this.bloodFlow = new BloodFlowSimulation(this.scene.scene, this.scene);
        // Default selection: Heart
        this.ui.selectById('heart', false);
      }
    );

    // 3. Initialize Physiology Simulation
    this.physiology = new PhysiologyEngine(this.models, this.audio, ecgCanvas, glucoseCanvas);

    // 4. Initialize UI Manager
    this.ui = new UIManager(this);

    // 5. Setup UI Interactions & Toolbar
    this.setupToolbar();

    // 6. Start Model Downloads
    this.models.loadAll();

    // 7. Tab Visibility Listener (Performance Optimization)
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (document.hidden) {
        this.audio.setMuted(true);
      } else {
        this.audio.setMuted(!this.state.soundEnabled);
      }
    });

    // 8. Start Animation Loop
    this.animate();
  }

  setupToolbar() {
    // Male / Female Morphing Toggle
    const genderToggle = document.getElementById('gender-toggle');
    if (genderToggle) {
      genderToggle.addEventListener('click', () => {
        const isMale = this.state.gender === 'male';
        this.state.gender = isMale ? 'female' : 'male';
        this.state.morphTarget = isMale ? 1.0 : 0.0;
        genderToggle.textContent = isMale ? '♀ Female' : '♂ Male';
        genderToggle.classList.toggle('active', isMale);
      });
    }

    // Camera View Presets
    document.querySelectorAll('.cam-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.scene.applyPreset(preset);
      });
    });

    // Skin Appearance Modes (Peach vs X-Ray)
    const skinModeBtn = document.getElementById('skin-mode-btn');
    if (skinModeBtn) {
      skinModeBtn.addEventListener('click', () => {
        const isPeach = this.state.skinMode === 'peach';
        this.state.skinMode = isPeach ? 'xray' : 'peach';
        skinModeBtn.textContent = isPeach ? '💎 X-Ray Mode' : '🍑 Translucent Peach';
        this.materials.setSkinMode(this.state.skinMode);
      });
    }

    // Studio Background Themes
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        this.scene.setTheme(theme);
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Layer Toggles
    document.querySelectorAll('.layer-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const sys = e.target.getAttribute('data-system');
        const visible = e.target.checked;
        this.state.layers[sys] = visible;
        this.models.setLayerVisibility(sys, visible);
      });
    });

    // Blood Path Closed Loop Circulation
    const bloodPathBtn = document.getElementById('blood-path-btn');
    if (bloodPathBtn) {
      bloodPathBtn.addEventListener('click', () => {
        this.state.bloodPathActive = !this.state.bloodPathActive;
        bloodPathBtn.classList.toggle('active', this.state.bloodPathActive);
        if (this.state.bloodPathActive) {
          this.bloodFlow.startBloodPath();
          bloodPathBtn.textContent = '⏹ Stop Circulation Tour';
        } else {
          this.bloodFlow.stopBloodPath();
          bloodPathBtn.textContent = '🩸 Tour Blood Circuit';
        }
      });
    }

    // Physiology Presets
    document.querySelectorAll('.hr-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const p = CONFIG.heartRatePresets[key];
        if (p) {
          this.physiology.setBPM(p.bpm);
          this.ui.dom.bpmSlider.value = p.bpm;
          this.ui.dom.bpmValue.textContent = `${p.bpm} BPM`;
          this.ui.updatePhysiologyExplanations();
        }
      });
    });

    document.querySelectorAll('.gluc-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const p = CONFIG.glucosePresets[key];
        if (p) {
          this.physiology.setGlucose(p.mgdl);
          this.ui.dom.glucoseSlider.value = p.mgdl;
          this.ui.dom.glucoseValue.textContent = `${p.mgdl} mg/dL`;
          this.ui.updatePhysiologyExplanations();
        }
      });
    });

    // Eat Sugar & Inject Insulin Actions
    const eatSugarBtn = document.getElementById('eat-sugar-btn');
    if (eatSugarBtn) {
      eatSugarBtn.addEventListener('click', () => {
        this.physiology.eatSugar();
        this.ui.dom.glucoseSlider.value = Math.round(this.physiology.glucose);
        this.ui.dom.glucoseValue.textContent = `${Math.round(this.physiology.glucose)} mg/dL`;
      });
    }

    const injectInsulinBtn = document.getElementById('inject-insulin-btn');
    if (injectInsulinBtn) {
      injectInsulinBtn.addEventListener('click', () => {
        this.physiology.injectInsulin();
        this.ui.dom.glucoseSlider.value = Math.round(this.physiology.glucose);
        this.ui.dom.glucoseValue.textContent = `${Math.round(this.physiology.glucose)} mg/dL`;
      });
    }

    // Audio Mute Toggle
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        this.state.soundEnabled = !this.state.soundEnabled;
        this.audio.setMuted(!this.state.soundEnabled);
        audioBtn.textContent = this.state.soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      });
    }

    // Auto Rotate
    const rotateBtn = document.getElementById('auto-rotate-btn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        this.state.autoRotate = !this.state.autoRotate;
        rotateBtn.classList.toggle('active', this.state.autoRotate);
      });
    }

    // Labels Mode
    const labelsBtn = document.getElementById('labels-btn');
    if (labelsBtn) {
      labelsBtn.addEventListener('click', () => {
        this.state.labelsVisible = !this.state.labelsVisible;
        labelsBtn.classList.toggle('active', this.state.labelsVisible);
        document.getElementById('labels-overlay').style.display = this.state.labelsVisible ? 'block' : 'none';
      });
    }

    // Quiz Mode
    const quizBtn = document.getElementById('quiz-btn');
    if (quizBtn) {
      quizBtn.addEventListener('click', () => {
        this.ui.startQuiz();
      });
    }

    // Screenshot
    const screenshotBtn = document.getElementById('screenshot-btn');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        this.ui.captureScreenshot();
      });
    }

    // English / Urdu Language Switcher
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const nextLang = this.state.language === 'en' ? 'ur' : 'en';
        this.ui.setLanguage(nextLang);
        langBtn.textContent = nextLang === 'ur' ? 'English' : 'اردو';
      });
    }

    // Credits Modal
    const creditsBtn = document.getElementById('credits-btn');
    if (creditsBtn) {
      creditsBtn.addEventListener('click', () => {
        this.ui.dom.creditsModal.style.display = 'flex';
      });
    }
    const closeCreditsBtn = document.getElementById('close-credits-btn');
    if (closeCreditsBtn) {
      closeCreditsBtn.addEventListener('click', () => {
        this.ui.dom.creditsModal.style.display = 'none';
      });
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.isPaused) return;

    const delta = Math.min(0.1, this.clock.getDelta());

    // 1. Male/Female Morph Interpolation
    if (Math.abs(this.state.morphProgress - this.state.morphTarget) > 0.005) {
      this.state.morphProgress += (this.state.morphTarget - this.state.morphProgress) * delta * 4.0;
      this.models.applyGenderMorph(this.state.morphProgress);
    }

    // 2. Auto-Rotation
    if (this.state.autoRotate && !this.scene.controls.state) {
      this.scene.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.006);
    }

    // 3. Update Scene & Camera Transitions
    this.scene.update(delta);

    // 4. Update Physiology (Cardiac lub-dub, Respiration, ECG, Glucose)
    this.physiology.update(delta);

    // 5. Update Blood Flow Particles
    if (this.bloodFlow) {
      this.bloodFlow.update(delta, this.physiology.bpm, this.physiology.glucose);
    }

    // 6. Update Non-Overlapping Labels
    if (this.state.labelsVisible) {
      this.ui.updateLabels();
    }

    // 7. Render with Post-Processing Bloom
    this.postprocessing.render();
  }
}

// Instantiate on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new BodyScopeApp();
});

