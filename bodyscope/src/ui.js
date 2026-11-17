/**
 * BodyScope 3D - High-Precision Interactive UI Controller
 * Anatomical Parts Explorer, 3D Multi-Mesh Highlighter, HUD Navigator,
 * Search Autocomplete, Leader-Line Labels, Quiz, Layers & Bilingual Language Switcher
 */

import * as THREE from 'three';
import { ANATOMY_DATA } from './data.js';
import { CONFIG } from './config.js';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.selectedMeshes = [];
    this.selectedMesh = null;
    this.hoveredMesh = null;
    this.isolatedMesh = null;

    this.organKeys = Object.keys(ANATOMY_DATA);
    this.selectedId = 'heart';
    this.organIndex = this.organKeys.indexOf('heart');
    this.activeFilter = 'all';
    this.searchQuery = '';

    this.initDOMElements();
    this.setupEventListeners();
    this.buildPartsExplorer();
    this.buildQuickOrgansBar();
    this.buildAnatomyTree();
  }

  initDOMElements() {
    this.dom = {
      canvas: document.getElementById('webgl-canvas'),
      tooltip: document.getElementById('hover-tooltip'),
      ttName: document.getElementById('tt-name'),
      ttSub: document.getElementById('tt-sub'),

      // Top Floating Active Part HUD
      activePartHud: document.getElementById('active-part-hud'),
      hudIcon: document.getElementById('hud-icon'),
      hudName: document.getElementById('hud-name'),
      hudUrdu: document.getElementById('hud-urdu'),
      hudSystem: document.getElementById('hud-system'),
      hudLatin: document.getElementById('hud-latin'),
      hudDetailsBtn: document.getElementById('hud-details-btn'),
      prevPartBtn: document.getElementById('prev-part-btn'),
      nextPartBtn: document.getElementById('next-part-btn'),

      // Left Drawer Tabs & Views
      drawerTabParts: document.getElementById('drawer-tab-parts'),
      drawerTabControls: document.getElementById('drawer-tab-controls'),
      drawerPartsView: document.getElementById('drawer-parts-view'),
      drawerControlsView: document.getElementById('drawer-controls-view'),
      partsSearchInput: document.getElementById('parts-search-input'),
      partsFilterChips: document.getElementById('parts-filter-chips'),
      partsListContainer: document.getElementById('parts-list-container'),

      // Right Drawer / Info Card
      infoCard: document.getElementById('info-card'),
      closeInfoBtn: document.getElementById('close-info-btn'),
      quickOrgansContainer: document.getElementById('quick-organs-container'),
      infoName: document.getElementById('info-name'),
      infoLatin: document.getElementById('info-latin'),
      infoUrdu: document.getElementById('info-urdu'),
      infoSystem: document.getElementById('info-system'),
      infoRegion: document.getElementById('info-region'),
      infoType: document.getElementById('info-type'),
      infoFunction: document.getElementById('info-function'),
      infoFacts: document.getElementById('info-facts'),
      infoConditions: document.getElementById('info-conditions'),
      infoActionBox: document.getElementById('info-action-box'),
      infoActionText: document.getElementById('info-action-text'),
      demonstrateActionBtn: document.getElementById('demonstrate-action-btn'),

      // Top Search & Autocomplete
      searchInput: document.getElementById('search-input'),
      searchDropdown: document.getElementById('search-dropdown'),

      // Legacy Tree Container
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
      skinOpacityVal: document.getElementById('skin-opacity-val'),
      bodyRealBtn: document.getElementById('body-real-btn'),
      bodyCrystalBtn: document.getElementById('body-crystal-btn'),
      bodyFleshBtn: document.getElementById('body-flesh-btn'),
      bodyGhostBtn: document.getElementById('body-ghost-btn'),
      bodyXrayBtn: document.getElementById('body-xray-btn'),
      bodyBareBtn: document.getElementById('body-bare-btn'),
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

  getOrganIcon(id) {
    const icons = {
      lungs: '🫁',
      trachea: '🌬️',
      diaphragm: '🌬️',
      heart: '❤️',
      aorta: '🩸',
      vena_cava: '🔵',
      pulmonary_artery: '🔴',
      coronary_arteries: '🫀',
      brain: '🧠',
      spinal_cord: '⚡',
      cranium: '💀',
      mandible: '🦴',
      cervical_spine: '🦴',
      thoracic_spine: '🦴',
      lumbar_spine: '🦴',
      pelvis: '🦴',
      ribcage: '🩻',
      clavicle_scapula: '🦴',
      arm_bones: '🦾',
      hand_bones: '🖐️',
      leg_bones: '🦵',
      foot_bones: '🦶',
      stomach: '🥣',
      liver: '🫀',
      gallbladder: '💧',
      pancreas: '🧬',
      spleen: '🟣',
      intestines: '🧬',
      kidneys: '🥜',
      bladder: '💧',
      muscles_major: '💪',
      skin: '👤',
      mammary_glands: '🌸',
      uterus: '🤰',
      ovaries: '🥚',
      male_reproductive: '♂️'
    };
    return icons[id] || '🩺';
  }

  getSystemForOrgan(id, data) {
    const sysMap = {
      lungs: 'respiratory', trachea: 'respiratory', diaphragm: 'respiratory',
      heart: 'cardiovascular', aorta: 'cardiovascular', vena_cava: 'cardiovascular',
      pulmonary_artery: 'cardiovascular', coronary_arteries: 'cardiovascular',
      stomach: 'digestive', liver: 'digestive', gallbladder: 'digestive',
      pancreas: 'digestive', spleen: 'digestive', intestines: 'digestive',
      kidneys: 'renal', bladder: 'renal',
      brain: 'nervous', spinal_cord: 'nervous',
      cranium: 'skeleton', mandible: 'skeleton', cervical_spine: 'skeleton',
      thoracic_spine: 'skeleton', lumbar_spine: 'skeleton', pelvis: 'skeleton',
      ribcage: 'skeleton', clavicle_scapula: 'skeleton', arm_bones: 'skeleton',
      hand_bones: 'skeleton', leg_bones: 'skeleton', foot_bones: 'skeleton',
      muscles_major: 'muscles',
      mammary_glands: 'femaleMammary', uterus: 'femaleReproductive', ovaries: 'femaleReproductive',
      male_reproductive: 'maleReproductive'
    };
    return sysMap[id] || (data && data.system ? data.system.toLowerCase() : null);
  }

  setupEventListeners() {
    const canvas = this.dom.canvas;

    // Pointer move for hover tooltips
    canvas.addEventListener('pointermove', (e) => {
      if (this.app.scene.controls.state !== -1) {
        this.hideTooltip();
        return;
      }
      this.handlePointerMove(e);
    });

    // Raycast on click with drag suppression (avoids misfires during orbit/drag)
    let pointerDownPos = { x: 0, y: 0 };
    canvas.addEventListener('pointerdown', (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('click', (e) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist < 8) {
        this.handleClick(e);
      }
    });

    // Double-click focus
    canvas.addEventListener('dblclick', (e) => {
      this.handleDoubleClick(e);
    });

    // HUD Navigation Buttons
    if (this.dom.prevPartBtn) {
      this.dom.prevPartBtn.addEventListener('click', () => this.navigateOrgan(-1));
    }
    if (this.dom.nextPartBtn) {
      this.dom.nextPartBtn.addEventListener('click', () => this.navigateOrgan(1));
    }
    if (this.dom.hudDetailsBtn) {
      this.dom.hudDetailsBtn.addEventListener('click', () => {
        this.dom.infoCard.classList.toggle('visible');
      });
    }

    // Close Details Panel Button
    if (this.dom.closeInfoBtn) {
      this.dom.closeInfoBtn.addEventListener('click', () => {
        this.dom.infoCard.classList.remove('visible');
      });
    }

    // Left Drawer Tabs (Parts Explorer vs Controls)
    if (this.dom.drawerTabParts && this.dom.drawerTabControls) {
      this.dom.drawerTabParts.addEventListener('click', () => {
        this.dom.drawerTabParts.classList.add('active');
        this.dom.drawerTabControls.classList.remove('active');
        if (this.dom.drawerPartsView) this.dom.drawerPartsView.style.display = 'block';
        if (this.dom.drawerControlsView) this.dom.drawerControlsView.style.display = 'none';
      });

      this.dom.drawerTabControls.addEventListener('click', () => {
        this.dom.drawerTabControls.classList.add('active');
        this.dom.drawerTabParts.classList.remove('active');
        if (this.dom.drawerPartsView) this.dom.drawerPartsView.style.display = 'none';
        if (this.dom.drawerControlsView) this.dom.drawerControlsView.style.display = 'block';
      });
    }

    // Parts Search Input in Left Drawer
    if (this.dom.partsSearchInput) {
      this.dom.partsSearchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target.value || '').trim().toLowerCase();
        this.renderPartsList();
      });
    }

    // Filter Chips in Left Drawer
    if (this.dom.partsFilterChips) {
      this.dom.partsFilterChips.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.dom.partsFilterChips.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.activeFilter = chip.getAttribute('data-filter') || 'all';
          this.renderPartsList();
        });
      });
    }

    // Top Search Input
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Physiology BPM Slider
    if (this.dom.bpmSlider) {
      this.dom.bpmSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        this.app.physiology.setBPM(val);
        this.dom.bpmValue.textContent = `${val} BPM`;
        this.updatePhysiologyExplanations();
      });
    }

    // Physiology Glucose Slider
    if (this.dom.glucoseSlider) {
      this.dom.glucoseSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        this.app.physiology.setGlucose(val);
        this.dom.glucoseValue.textContent = `${val} mg/dL`;
        this.updatePhysiologyExplanations();
      });
    }

    // Skin Opacity
    if (this.dom.skinOpacitySlider) {
      this.dom.skinOpacitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.app.materials.setSkinOpacity(val);
        if (this.dom.skinOpacityVal) {
          this.dom.skinOpacityVal.textContent = `${Math.round(val * 100)}%`;
        }
        if (val <= 0.01) {
          this.app.models.setLayerVisibility('skin', false);
        } else {
          this.app.models.setLayerVisibility('skin', true);
        }
      });
    }

    // Body Appearance & Flesh (Maas) Controls
    if (this.dom.bodyRealBtn) {
      this.dom.bodyRealBtn.addEventListener('click', () => {
        const mat = this.app.materials.setSkinMode('realistic');
        this.app.models.updateSkinMaterial(mat);
        this.app.materials.setSkinOpacity(1.0);
        this.app.models.setLayerVisibility('skin', true);
        if (this.dom.skinOpacitySlider) this.dom.skinOpacitySlider.value = 1.0;
        if (this.dom.skinOpacityVal) this.dom.skinOpacityVal.textContent = '100%';
        const skinCb = document.querySelector('input[data-system="skin"]');
        if (skinCb) skinCb.checked = true;
      });
    }

    if (this.dom.bodyCrystalBtn) {
      this.dom.bodyCrystalBtn.addEventListener('click', () => {
        const mat = this.app.materials.setSkinMode('crystal');
        this.app.models.updateSkinMaterial(mat);
        this.app.materials.setSkinOpacity(0.22);
        this.app.models.setLayerVisibility('skin', true);
        if (this.dom.skinOpacitySlider) this.dom.skinOpacitySlider.value = 0.22;
        if (this.dom.skinOpacityVal) this.dom.skinOpacityVal.textContent = '22%';
        const skinCb = document.querySelector('input[data-system="skin"]');
        if (skinCb) skinCb.checked = true;
      });
    }

    if (this.dom.bodyFleshBtn) {
      this.dom.bodyFleshBtn.addEventListener('click', () => {
        this.app.models.setLayerVisibility('muscles', true);
        const muscCb = document.querySelector('input[data-system="muscles"]');
        if (muscCb) muscCb.checked = true;
        this.app.materials.setSkinOpacity(0.12);
        if (this.dom.skinOpacitySlider) this.dom.skinOpacitySlider.value = 0.12;
        if (this.dom.skinOpacityVal) this.dom.skinOpacityVal.textContent = '12%';
      });
    }

    if (this.dom.bodyGhostBtn) {
      this.dom.bodyGhostBtn.addEventListener('click', () => {
        const mat = this.app.materials.setSkinMode('peach');
        this.app.models.updateSkinMaterial(mat);
        this.app.materials.setSkinOpacity(0.18);
        this.app.models.setLayerVisibility('skin', true);
        if (this.dom.skinOpacitySlider) this.dom.skinOpacitySlider.value = 0.18;
        if (this.dom.skinOpacityVal) this.dom.skinOpacityVal.textContent = '18%';
        const skinCb = document.querySelector('input[data-system="skin"]');
        if (skinCb) skinCb.checked = true;
      });
    }

    if (this.dom.bodyXrayBtn) {
      this.dom.bodyXrayBtn.addEventListener('click', () => {
        const mat = this.app.materials.setSkinMode('xray');
        this.app.models.updateSkinMaterial(mat);
        this.app.materials.setSkinOpacity(0.22);
        this.app.models.setLayerVisibility('skin', true);
        if (this.dom.skinOpacitySlider) this.dom.skinOpacitySlider.value = 0.22;
        if (this.dom.skinOpacityVal) this.dom.skinOpacityVal.textContent = '22%';
        const skinCb = document.querySelector('input[data-system="skin"]');
        if (skinCb) skinCb.checked = true;
      });
    }

    if (this.dom.bodyBareBtn) {
      this.dom.bodyBareBtn.addEventListener('click', () => {
        this.app.materials.setSkinOpacity(0.0);
        this.app.models.setLayerVisibility('skin', false);
        if (this.dom.skinOpacitySlider) this.dom.skinOpacitySlider.value = 0.0;
        if (this.dom.skinOpacityVal) this.dom.skinOpacityVal.textContent = '0%';
        const skinCb = document.querySelector('input[data-system="skin"]');
        if (skinCb) skinCb.checked = false;
      });
    }

    // Interactive Organ Action Buttons
    document.querySelectorAll('.organ-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const organId = btn.getAttribute('data-organ');
        this.selectById(organId, true);
        this.app.physiology.triggerOrganAction(organId);
      });
    });

    // Demonstrate Biological Action in Info Card
    if (this.dom.demonstrateActionBtn) {
      this.dom.demonstrateActionBtn.addEventListener('click', () => {
        const id = this.selectedId || 'heart';
        this.app.physiology.triggerOrganAction(id);
      });
    }

    // Slicing Tool
    if (this.dom.sliceToggle) {
      this.dom.sliceToggle.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        const axis = this.dom.sliceAxisSelect.value;
        const offset = parseFloat(this.dom.sliceSlider.value);
        this.app.materials.setClipping(enabled, axis, offset);
      });
    }

    if (this.dom.sliceSlider) {
      this.dom.sliceSlider.addEventListener('input', (e) => {
        const offset = parseFloat(e.target.value);
        const axis = this.dom.sliceAxisSelect.value;
        if (this.dom.sliceToggle && this.dom.sliceToggle.checked) {
          this.app.materials.setClipping(true, axis, offset);
        }
      });
    }

    if (this.dom.sliceAxisSelect) {
      this.dom.sliceAxisSelect.addEventListener('change', (e) => {
        const axis = e.target.value;
        const offset = parseFloat(this.dom.sliceSlider.value);
        if (this.dom.sliceToggle && this.dom.sliceToggle.checked) {
          this.app.materials.setClipping(true, axis, offset);
        }
      });
    }
  }

  buildQuickOrgansBar() {
    const container = this.dom.quickOrgansContainer;
    if (!container) return;

    const quickList = [
      { id: 'lungs', name: 'Lungs', urdu: 'پھیپھڑے', icon: '🫁' },
      { id: 'heart', name: 'Heart', urdu: 'دل', icon: '❤️' },
      { id: 'brain', name: 'Brain', urdu: 'دماغ', icon: '🧠' },
      { id: 'ribcage', name: 'Ribcage', urdu: 'پسلیوں کا پنجرہ', icon: '🩻' },
      { id: 'liver', name: 'Liver', urdu: 'جگر', icon: '🫀' },
      { id: 'stomach', name: 'Stomach', urdu: 'معدہ', icon: '🥣' },
      { id: 'kidneys', name: 'Kidneys', urdu: 'گردے', icon: '🥜' },
      { id: 'intestines', name: 'Intestines', urdu: 'آنتیں', icon: '🧬' },
      { id: 'cranium', name: 'Skull', urdu: 'کھوپڑی', icon: '💀' },
      { id: 'thoracic_spine', name: 'Spine', urdu: 'ریڑھ کی ہڈی', icon: '🦴' },
      { id: 'muscles_major', name: 'Muscles', urdu: 'عضلات', icon: '💪' },
      { id: 'aorta', name: 'Aorta', urdu: 'شہ رگ', icon: '🩸' }
    ];

    container.innerHTML = quickList.map(item => `
      <div class="quick-organ-pill ${item.id === this.selectedId ? 'active' : ''}" data-id="${item.id}">
        <span>${item.icon}</span>
        <span>${item.name}</span>
        <small style="opacity:0.8;">(${item.urdu})</small>
      </div>
    `).join('');

    container.querySelectorAll('.quick-organ-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-id');
        this.selectById(id, true);
      });
    });
  }

  buildPartsExplorer() {
    this.renderPartsList();
  }

  renderPartsList() {
    const container = this.dom.partsListContainer;
    if (!container) return;

    let items = Object.values(ANATOMY_DATA);

    // Apply category filter
    if (this.activeFilter !== 'all') {
      items = items.filter(it => {
        const s = (it.system || '').toLowerCase();
        if (this.activeFilter === 'respiratory') return s.includes('respiratory');
        if (this.activeFilter === 'cardiovascular') return s.includes('cardio');
        if (this.activeFilter === 'nervous') return s.includes('nervous');
        if (this.activeFilter === 'skeletal') return s.includes('skeletal');
        if (this.activeFilter === 'digestive') return s.includes('digestive');
        if (this.activeFilter === 'renal') return s.includes('renal') || s.includes('excretory') || s.includes('urinary');
        if (this.activeFilter === 'muscular') return s.includes('muscular');
        return true;
      });
    }

    // Apply search query
    if (this.searchQuery) {
      items = items.filter(it => {
        const name = (it.name || '').toLowerCase();
        const urdu = (it.urdu || '').toLowerCase();
        const latin = (it.latin || '').toLowerCase();
        const sys = (it.system || '').toLowerCase();
        return name.includes(this.searchQuery) || urdu.includes(this.searchQuery) || latin.includes(this.searchQuery) || sys.includes(this.searchQuery);
      });
    }

    if (items.length === 0) {
      container.innerHTML = `<div style="padding:14px; color:#94a3b8; font-size:0.8rem; text-align:center;">No matching anatomical parts found.</div>`;
      return;
    }

    container.innerHTML = items.map(it => {
      const icon = this.getOrganIcon(it.id);
      const isActive = it.id === this.selectedId;
      return `
        <div class="part-card-item ${isActive ? 'active' : ''}" data-id="${it.id}">
          <div class="part-card-left">
            <span class="part-card-icon">${icon}</span>
            <div class="part-card-info">
              <span class="part-card-name">${it.name}</span>
              <span class="part-card-urdu">${it.urdu}</span>
            </div>
          </div>
          <span class="part-card-badge">${it.system.split('/')[0].trim()}</span>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.part-card-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        this.selectById(id, true);
      });
    });
  }

  updatePartsListActive(selectedId) {
    if (!this.dom.partsListContainer) return;
    this.dom.partsListContainer.querySelectorAll('.part-card-item').forEach(card => {
      card.classList.toggle('active', card.getAttribute('data-id') === selectedId);
    });
  }

  updateQuickOrgansActive(selectedId) {
    if (!this.dom.quickOrgansContainer) return;
    this.dom.quickOrgansContainer.querySelectorAll('.quick-organ-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-id') === selectedId);
    });
  }

  updateActiveHUD(data) {
    if (!data) return;
    const isUr = this.app.state.language === 'ur';
    const icon = this.getOrganIcon(data.id);

    if (this.dom.hudIcon) this.dom.hudIcon.textContent = icon;
    if (this.dom.hudName) this.dom.hudName.textContent = isUr ? data.urdu : data.name;
    if (this.dom.hudUrdu) this.dom.hudUrdu.textContent = isUr ? data.name : data.urdu;
    if (this.dom.hudSystem) this.dom.hudSystem.textContent = data.system;
    if (this.dom.hudLatin) this.dom.hudLatin.textContent = data.latin || '';
  }

  navigateOrgan(direction) {
    if (!this.organKeys || this.organKeys.length === 0) return;
    this.organIndex = (this.organIndex + direction + this.organKeys.length) % this.organKeys.length;
    const nextId = this.organKeys[this.organIndex];
    this.selectById(nextId, true);
  }

  isMeshVisible(mesh) {
    let curr = mesh;
    while (curr) {
      if (curr.visible === false) return false;
      curr = curr.parent;
    }
    return true;
  }

  handlePointerMove(e) {
    const rect = this.dom.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.app.scene.camera);
    const visibleMeshes = this.app.models.clickableMeshes.filter(m => this.isMeshVisible(m));
    const hits = this.raycaster.intersectObjects(visibleMeshes, false);

    if (hits.length > 0) {
      const hit = hits[0].object;
      const dataId = hit.userData.id;
      const data = ANATOMY_DATA[dataId] || ANATOMY_DATA.cranium;

      this.dom.tooltip.style.display = 'block';
      this.dom.tooltip.style.left = `${e.clientX + 14}px`;
      this.dom.tooltip.style.top = `${e.clientY + 14}px`;
      this.dom.ttName.textContent = this.app.state.language === 'ur' ? data.urdu : data.name;
      this.dom.ttSub.textContent = `${data.system} (Click to inspect)`;
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
    const visibleMeshes = this.app.models.clickableMeshes.filter(m => this.isMeshVisible(m));
    const hits = this.raycaster.intersectObjects(visibleMeshes, false);

    if (hits.length > 0) {
      const hit = hits[0].object;
      const dataId = hit.userData.id;
      if (dataId) {
        this.selectById(dataId, true);
      } else {
        this.selectMesh(hit, true);
      }
    }
  }

  handleDoubleClick(e) {
    if (this.selectedMeshes && this.selectedMeshes.length > 0) {
      const box = new THREE.Box3();
      this.selectedMeshes.forEach(m => box.expandByObject(m));
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      this.app.scene.flyTo(center, Math.max(0.42, maxDim * 2.0), null, null, 0.8);
    }
  }

  selectMesh(mesh, flyCamera = true) {
    if (!mesh) return;
    const dataId = mesh.userData.id;
    if (dataId && ANATOMY_DATA[dataId]) {
      this.selectById(dataId, flyCamera);
    } else {
      // Revert previous highlights
      if (this.selectedMeshes && this.selectedMeshes.length > 0) {
        this.selectedMeshes.forEach(m => {
          if (m.userData && m.userData.originalMaterial) {
            m.material = m.userData.originalMaterial;
          }
        });
        this.selectedMeshes = [];
      }

      if (!mesh.userData.originalMaterial) {
        mesh.userData.originalMaterial = mesh.material;
      }
      mesh.material = this.app.materials.highlight;
      this.selectedMeshes = [mesh];
      this.selectedMesh = mesh;

      const data = ANATOMY_DATA[dataId] || ANATOMY_DATA.cranium;
      this.displayInfoCard(data);
      this.updateActiveHUD(data);

      if (flyCamera) {
        const box = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        this.app.scene.flyTo(center, Math.max(0.48, maxDim * 2.2), null, null, 0.85);
      }
    }
  }

  selectById(dataId, flyCamera = true) {
    if (!dataId) return;
    const data = ANATOMY_DATA[dataId] || ANATOMY_DATA.heart;
    this.selectedId = dataId;
    this.organIndex = this.organKeys.indexOf(dataId);
    if (this.organIndex === -1) this.organIndex = 0;

    // 1. Revert previous selected meshes
    if (this.selectedMeshes && this.selectedMeshes.length > 0) {
      this.selectedMeshes.forEach(m => {
        if (m.userData && m.userData.originalMaterial) {
          m.material = m.userData.originalMaterial;
        }
      });
      this.selectedMeshes = [];
    }

    // 2. Find ALL matching meshes for this organ id (e.g. all 5 lung lobes, both kidneys, all ribs)
    let targetMeshes = this.app.models.clickableMeshes.filter(m => m.userData && m.userData.id === dataId);
    if (targetMeshes.length === 0) {
      const matchSub = this.app.models.clickableMeshes.find(m => m.name && m.name.toLowerCase().includes(dataId.toLowerCase()));
      if (matchSub) targetMeshes = [matchSub];
    }

    // 3. Highlight all matching meshes with bioluminescent glowing material
    targetMeshes.forEach(m => {
      if (!m.userData.originalMaterial) {
        m.userData.originalMaterial = m.material;
      }
      m.material = this.app.materials.highlight;
    });
    this.selectedMeshes = targetMeshes;
    this.selectedMesh = targetMeshes[0] || null;

    // 4. Ensure system layer is visible
    const sys = this.getSystemForOrgan(dataId, data);
    if (sys && this.app.models.systems[sys]) {
      this.app.models.systems[sys].visible = true;
      const cb = document.querySelector(`input[data-system="${sys}"]`);
      if (cb) cb.checked = true;
    }

    // 5. Adjust skin opacity if needed so internal organs are clearly seen
    const isInternal = sys !== 'skeleton' && sys !== 'muscles' && dataId !== 'skin';
    if (isInternal && this.app.materials.skinActive && this.app.materials.skinActive.opacity > 0.35) {
      this.app.materials.setSkinOpacity(0.22);
      if (this.dom.skinOpacitySlider) this.dom.skinOpacitySlider.value = 0.22;
      if (this.dom.skinOpacityVal) this.dom.skinOpacityVal.textContent = '22%';
    }

    // 6. Camera fly-to unified bounding box
    if (flyCamera && targetMeshes.length > 0) {
      const box = new THREE.Box3();
      targetMeshes.forEach(m => box.expandByObject(m));
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const camDist = Math.max(0.48, Math.min(2.2, maxDim * 2.3));
      this.app.scene.flyTo(center, camDist, null, null, 0.85);
    }

    // 7. Update UI panels
    this.displayInfoCard(data);
    this.updateActiveHUD(data);
    this.updateQuickOrgansActive(dataId);
    this.updatePartsListActive(dataId);
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

    if (this.dom.infoActionText) {
      this.dom.infoActionText.textContent = data.action || data.function || "Active physiological metabolism and perfusion.";
    }

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

    const activeData = ANATOMY_DATA[this.selectedId];
    if (activeData) {
      this.displayInfoCard(activeData);
      this.updateActiveHUD(activeData);
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
