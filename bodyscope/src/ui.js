/**
 * BodyScope 3D - High-Precision Interactive UI Controller
 * Search Autocomplete, Anatomy Tree, Leader-Line Labels, Quiz, Layers & Language Switcher
 */

import * as THREE from 'three';
import { ANATOMY_DATA } from './data.js';
import { CONFIG } from './config.js';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.selectedMesh = null;
    this.hoveredMesh = null;
    this.isolatedMesh = null;

    this.initDOMElements();
    this.setupEventListeners();
    this.buildAnatomyTree();
  }

  initDOMElements() {
    this.dom = {
      canvas: document.getElementById('webgl-canvas'),
      tooltip: document.getElementById('hover-tooltip'),
      ttName: document.getElementById('tt-name'),
      ttSub: document.getElementById('tt-sub'),

      // Info Card
      infoCard: document.getElementById('info-card'),
      infoName: document.getElementById('info-name'),
      infoLatin: document.getElementById('info-latin'),
      infoUrdu: document.getElementById('info-urdu'),
      infoSystem: document.getElementById('info-system'),
      infoRegion: document.getElementById('info-region'),
      infoType: document.getElementById('info-type'),
      infoFunction: document.getElementById('info-function'),
      infoFacts: document.getElementById('info-facts'),
      infoConditions: document.getElementById('info-conditions'),

      // Search & Autocomplete
      searchInput: document.getElementById('search-input'),
      searchDropdown: document.getElementById('search-dropdown'),

      // Anatomy Tree
      treeContainer: document.getElementById('anatomy-tree-content'),

      // Physiology Controls
      bpmSlider: document.getElementById('bpm-slider'),
      bpmValue: document.getElementById('bpm-val'),
      glucoseSlider: document.getElementById('glucose-slider'),
      glucoseValue: document.getElementById('glucose-val'),
      hrExplanation: document.getElementById('hr-explanation'),
      glucExplanation: document.getElementById('gluc-explanation'),

      // Sliders & Toggles
      skinOpacitySlider: document.getElementById('skin-opacity-slider'),
      sliceSlider: document.getElementById('slice-slider'),
      sliceToggle: document.getElementById('slice-toggle'),
      sliceAxisSelect: document.getElementById('slice-axis-select'),

      // Labels Overlay
      labelsOverlay: document.getElementById('labels-overlay'),

      // Quiz Modal
      quizCard: document.getElementById('quiz-card'),
      quizQuestion: document.getElementById('quiz-question'),
      quizOptions: document.getElementById('quiz-options'),
      quizScore: document.getElementById('quiz-score'),

      // Credits Modal
      creditsModal: document.getElementById('credits-modal')
    };
  }

  setupEventListeners() {
    const canvas = this.dom.canvas;

    // Raycast on pointer move (hover tooltip)
    canvas.addEventListener('pointermove', (e) => {
      if (this.app.scene.controls.state !== -1) {
        this.hideTooltip();
        return;
      }
      this.handlePointerMove(e);
    });

    // Raycast on click (selection)
    canvas.addEventListener('click', (e) => {
      this.handleClick(e);
    });

    // Double-click focus
    canvas.addEventListener('dblclick', (e) => {
      this.handleDoubleClick(e);
    });

    // Search input
    this.dom.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // Physiology BPM Slider
    this.dom.bpmSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      this.app.physiology.setBPM(val);
      this.dom.bpmValue.textContent = `${val} BPM`;
      this.updatePhysiologyExplanations();
    });

    // Physiology Glucose Slider
    this.dom.glucoseSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      this.app.physiology.setGlucose(val);
      this.dom.glucoseValue.textContent = `${val} mg/dL`;
      this.updatePhysiologyExplanations();
    });

    // Skin Opacity
    this.dom.skinOpacitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.app.materials.setSkinOpacity(val);
    });

    // Slicing Tool
    this.dom.sliceToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      const axis = this.dom.sliceAxisSelect.value;
      const offset = parseFloat(this.dom.sliceSlider.value);
      this.app.materials.setClipping(enabled, axis, offset);
    });

    this.dom.sliceSlider.addEventListener('input', (e) => {
      const offset = parseFloat(e.target.value);
      const axis = this.dom.sliceAxisSelect.value;
      if (this.dom.sliceToggle.checked) {
        this.app.materials.setClipping(true, axis, offset);
      }
    });

    this.dom.sliceAxisSelect.addEventListener('change', (e) => {
      const axis = e.target.value;
      const offset = parseFloat(this.dom.sliceSlider.value);
      if (this.dom.sliceToggle.checked) {
        this.app.materials.setClipping(true, axis, offset);
      }
    });
  }

  handlePointerMove(e) {
    const rect = this.dom.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.app.scene.camera);
    const visibleMeshes = this.app.models.clickableMeshes.filter(m => m.parent && m.parent.visible);
    const hits = this.raycaster.intersectObjects(visibleMeshes, false);

    if (hits.length > 0) {
      const hit = hits[0].object;
      const dataId = hit.userData.id;
      const data = ANATOMY_DATA[dataId] || ANATOMY_DATA.cranium;

      this.dom.tooltip.style.display = 'block';
      this.dom.tooltip.style.left = `${e.clientX + 14}px`;
      this.dom.tooltip.style.top = `${e.clientY + 14}px`;
      this.dom.ttName.textContent = this.app.state.language === 'ur' ? data.urdu : data.name;
      this.dom.ttSub.textContent = data.system;
    } else {
      this.hideTooltip();
    }
  }

  hideTooltip() {
    this.dom.tooltip.style.display = 'none';
  }

  handleClick(e) {
    const rect = this.dom.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.app.scene.camera);
    const visibleMeshes = this.app.models.clickableMeshes.filter(m => m.parent && m.parent.visible);
    const hits = this.raycaster.intersectObjects(visibleMeshes, false);

    if (hits.length > 0) {
      const hit = hits[0].object;
      this.selectMesh(hit);
    }
  }

  handleDoubleClick(e) {
    if (this.selectedMesh) {
      const box = new THREE.Box3().setFromObject(this.selectedMesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      this.app.scene.flyTo(center, Math.max(0.45, maxDim * 2.2), null, null, 0.8);
    }
  }

  selectMesh(mesh, flyCamera = true) {
    // Un-highlight previous
    if (this.selectedMesh && this.selectedMesh.material === this.app.materials.highlight) {
      this.selectedMesh.material = this.selectedMesh.userData.originalMaterial;
    }

    this.selectedMesh = mesh;
    if (!mesh) return;

    // Apply cyan highlight
    mesh.material = this.app.materials.highlight;

    const dataId = mesh.userData.id;
    const data = ANATOMY_DATA[dataId] || ANATOMY_DATA.cranium;

    this.displayInfoCard(data);

    if (flyCamera) {
      const box = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      this.app.scene.flyTo(center, Math.max(0.55, maxDim * 2.5), null, null, 0.85);
    }
  }

  selectById(dataId, flyCamera = true) {
    const mesh = this.app.models.clickableMeshes.find(m => m.userData.id === dataId);
    if (mesh) {
      this.selectMesh(mesh, flyCamera);
    } else {
      const data = ANATOMY_DATA[dataId];
      if (data) this.displayInfoCard(data);
    }
  }

  displayInfoCard(data) {
    if (!data) return;

    const isUr = this.app.state.language === 'ur';
    this.dom.infoName.textContent = isUr ? data.urdu : data.name;
    this.dom.infoLatin.textContent = data.latin || '';
    this.dom.infoUrdu.textContent = isUr ? data.name : data.urdu;
    this.dom.infoSystem.textContent = data.system;
    this.dom.infoRegion.textContent = data.region;
    this.dom.infoType.textContent = data.type || '';
    this.dom.infoFunction.textContent = data.function;
    this.dom.infoFacts.textContent = data.facts;
    this.dom.infoConditions.innerHTML = `<b>Clinical Conditions:</b> ${data.conditions}`;

    this.dom.infoCard.classList.add('visible');
  }

  handleSearch(query) {
    const q = (query || "").trim().toLowerCase();
    const dropdown = this.dom.searchDropdown;

    if (q.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    const matches = Object.values(ANATOMY_DATA).filter(item => {
      return item.name.toLowerCase().includes(q) ||
             (item.latin && item.latin.toLowerCase().includes(q)) ||
             (item.urdu && item.urdu.includes(q)) ||
             item.system.toLowerCase().includes(q);
    }).slice(0, 8);

    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    dropdown.innerHTML = matches.map(m => `
      <div class="search-item" data-id="${m.id}">
        <b>${m.name}</b> <small>(${m.latin || m.system})</small>
        <span class="urdu-tag">${m.urdu}</span>
      </div>
    `).join('');

    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        this.selectById(id, true);
        dropdown.style.display = 'none';
        this.dom.searchInput.value = '';
      });
    });
  }

  buildAnatomyTree() {
    const container = this.dom.treeContainer;
    if (!container) return;

    const systems = {};
    Object.values(ANATOMY_DATA).forEach(item => {
      const s = item.system || "Other";
      if (!systems[s]) systems[s] = [];
      systems[s].push(item);
    });

    container.innerHTML = Object.entries(systems).map(([sysName, items]) => `
      <div class="tree-group">
        <div class="tree-system-header">
          <span>${sysName}</span>
          <small>${items.length} structures</small>
        </div>
        <div class="tree-items">
          ${items.map(it => `
            <div class="tree-leaf" data-id="${it.id}">
              <span>${it.name}</span>
              <small>${it.urdu}</small>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.tree-leaf').forEach(leaf => {
      leaf.addEventListener('click', () => {
        const id = leaf.getAttribute('data-id');
        this.selectById(id, true);
      });
    });
  }

  updatePhysiologyExplanations() {
    const { hrInfo, glucInfo } = this.app.physiology.getExplanation();
    if (this.dom.hrExplanation) this.dom.hrExplanation.textContent = hrInfo;
    if (this.dom.glucExplanation) this.dom.glucExplanation.textContent = glucInfo;
  }

  setLanguage(lang) {
    this.app.state.language = lang;
    const isUr = lang === 'ur';
    document.body.classList.toggle('urdu-mode', isUr);

    if (this.selectedMesh) {
      const data = ANATOMY_DATA[this.selectedMesh.userData.id];
      if (data) this.displayInfoCard(data);
    }
  }

  /**
   * Non-overlapping 3D Leader Line Labels Renderer
   */
  updateLabels() {
    if (!this.app.state.labelsVisible || !this.dom.labelsOverlay) return;

    const keyLandmarks = [
      { id: 'cranium', pos: new THREE.Vector3(0, 1.62, 0.08) },
      { id: 'heart', pos: new THREE.Vector3(0.01, 1.28, 0.04) },
      { id: 'lungs', pos: new THREE.Vector3(0.12, 1.32, 0.0) },
      { id: 'liver', pos: new THREE.Vector3(0.08, 1.15, 0.04) },
      { id: 'stomach', pos: new THREE.Vector3(-0.06, 1.16, 0.04) },
      { id: 'kidneys', pos: new THREE.Vector3(-0.08, 1.05, -0.02) },
      { id: 'pelvis', pos: new THREE.Vector3(0, 0.94, 0.04) },
      { id: 'hand_bones', pos: new THREE.Vector3(0.36, 0.82, 0.02) },
      { id: 'leg_bones', pos: new THREE.Vector3(0.10, 0.55, 0.02) }
    ];

    const camera = this.app.scene.camera;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const screenPoints = keyLandmarks.map(lm => {
      const p = lm.pos.clone().project(camera);
      return {
        id: lm.id,
        name: ANATOMY_DATA[lm.id] ? ANATOMY_DATA[lm.id].name : lm.id,
        x: (p.x * 0.5 + 0.5) * w,
        y: (-p.y * 0.5 + 0.5) * h,
        z: p.z,
        visible: p.z < 1.0
      };
    });

    // Relax overlapping labels vertically to prevent line crossing
    screenPoints.sort((a, b) => a.y - b.y);
    for (let i = 1; i < screenPoints.length; i++) {
      if (screenPoints[i].y - screenPoints[i - 1].y < 28) {
        screenPoints[i].y = screenPoints[i - 1].y + 28;
      }
    }

    this.dom.labelsOverlay.innerHTML = screenPoints
      .filter(p => p.visible && p.x > 20 && p.x < w - 20 && p.y > 20 && p.y < h - 20)
      .map(p => `
        <div class="leader-label" style="left:${p.x}px; top:${p.y}px;" data-id="${p.id}">
          <span class="label-dot"></span>
          <span class="label-text">${p.name}</span>
        </div>
      `).join('');

    this.dom.labelsOverlay.querySelectorAll('.leader-label').forEach(el => {
      el.addEventListener('click', () => {
        this.selectById(el.getAttribute('data-id'), true);
      });
    });
  }

  // Quiz Mode
  startQuiz() {
    this.quizScoreVal = 0;
    this.quizTotalVal = 0;
    this.nextQuizQuestion();
    this.dom.quizCard.style.display = 'block';
  }

  nextQuizQuestion() {
    const keys = Object.keys(ANATOMY_DATA);
    const targetKey = keys[Math.floor(Math.random() * keys.length)];
    const targetData = ANATOMY_DATA[targetKey];

    // Pick 3 distractors
    const distractors = keys.filter(k => k !== targetKey).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [targetKey, ...distractors].sort(() => 0.5 - Math.random());

    this.dom.quizQuestion.textContent = `Which anatomical structure is described as: "${targetData.function.substring(0, 95)}..."?`;
    this.dom.quizOptions.innerHTML = options.map(optKey => {
      const opt = ANATOMY_DATA[optKey];
      return `<button class="quiz-btn" data-key="${optKey}">${opt.name} (${opt.latin || opt.system})</button>`;
    }).join('');

    this.dom.quizOptions.querySelectorAll('.quiz-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chosen = btn.getAttribute('data-key');
        this.quizTotalVal++;
        if (chosen === targetKey) {
          this.quizScoreVal++;
          btn.style.background = '#10b981';
          this.selectById(targetKey, true);
        } else {
          btn.style.background = '#ef4444';
          this.selectById(targetKey, true);
        }
        this.dom.quizScore.textContent = `Score: ${this.quizScoreVal} / ${this.quizTotalVal}`;
        setTimeout(() => this.nextQuizQuestion(), 1600);
      });
    });
  }

  captureScreenshot() {
    this.app.scene.renderer.render(this.app.scene.scene, this.app.scene.camera);
    const dataURL = this.dom.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `BodyScope-Anatomy-${Date.now()}.png`;
    a.click();
  }
}

