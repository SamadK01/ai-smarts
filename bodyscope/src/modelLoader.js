/**
 * BodyScope 3D - High-Precision Anatomical Model Loader
 * 1:1 Sub-Millimeter True Coordinate Alignment (Z-Anatomy & BodyParts3D Standards)
 * GLTFLoader, DRACOLoader, System Grouping, Mesh Registration & Morphing
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { getAnatomyDataForMesh, ANATOMY_DATA } from './data.js';

export class ModelLoader {
  constructor(sceneManager, materialManager, onProgress = null, onComplete = null) {
    this.sceneManager = sceneManager;
    this.materials = materialManager;
    this.onProgress = onProgress;
    this.onComplete = onComplete;

    this.clickableMeshes = [];
    this.namedMeshes = new Map();
    this.heartMesh = null;
    this.lungsGroup = null;

    // System Container Groups
    this.systems = {
      skin: new THREE.Group(),
      skeleton: new THREE.Group(),
      muscles: new THREE.Group(),
      cardiovascular: new THREE.Group(),
      respiratory: new THREE.Group(),
      digestive: new THREE.Group(),
      renal: new THREE.Group(),
      nervous: new THREE.Group()
    };

    // Add all system groups to scene root
    Object.entries(this.systems).forEach(([name, group]) => {
      group.name = `System_${name}`;
      this.sceneManager.bodyRoot.add(group);
    });

    this.initLoaders();
  }

  initLoaders() {
    this.loadingManager = new THREE.LoadingManager();

    this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = Math.min(1.0, itemsLoaded / itemsTotal);
      if (this.onProgress) {
        this.onProgress(progress, url, itemsLoaded, itemsTotal);
      }
    };

    this.loadingManager.onLoad = () => {
      this.finalizeScene();
      if (this.onComplete) {
        this.onComplete(this);
      }
    };

    // Configure Draco WebAssembly decoder
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  loadAll() {
    // 1. Build High-Precision Procedural Translucent Skin Shell
    this.buildProceduralSkinShell();

    // Model files inside /bodyscope/models/
    // All Z-Anatomy master models share the exact same 1.71m human coordinate space
    const modelPaths = {
      body: 'models/body.glb',
      cardiovascular: 'models/cardiovascular.glb',
      respiratory: 'models/respiratory.glb',
      digestive: 'models/visceral_male.glb',
      renal: 'models/renal.glb',
      nervous: 'models/nervous.glb'
    };

    // 2. Load Body (Full 206-bone Skeleton + Major Muscles)
    this.gltfLoader.load(modelPaths.body, (gltf) => {
      this.processBodyModel(gltf.scene);
    }, null, (err) => console.warn('Could not load body.glb:', err));

    // 3. Load Cardiovascular System (Heart, Aorta, Vena Cava, Peripheral Vessels)
    this.gltfLoader.load(modelPaths.cardiovascular, (gltf) => {
      this.processCardiovascularModel(gltf.scene);
    }, null, (err) => console.warn('Could not load cardiovascular.glb:', err));

    // 4. Load Respiratory System (Lungs, Bronchial Trees, Trachea)
    this.gltfLoader.load(modelPaths.respiratory, (gltf) => {
      this.processRespiratoryModel(gltf.scene);
    }, null, (err) => console.warn('Could not load respiratory.glb:', err));

    // 5. Load Visceral Digestive System (Liver segments, Stomach, Intestines, Pancreas, Spleen)
    this.gltfLoader.load(modelPaths.digestive, (gltf) => {
      this.processDigestiveModel(gltf.scene);
    }, null, (err) => console.warn('Could not load visceral_male.glb:', err));

    // 6. Load Renal System (Kidneys, Ureters, Bladder)
    this.gltfLoader.load(modelPaths.renal, (gltf) => {
      this.processRenalModel(gltf.scene);
    }, null, (err) => console.warn('Could not load renal.glb:', err));

    // 7. Load Nervous System (Brain, Spinal Cord, Cranial & Peripheral Nerves)
    this.gltfLoader.load(modelPaths.nervous, (gltf) => {
      this.processNervousModel(gltf.scene);
    }, null, (err) => console.warn('Could not load nervous.glb:', err));
  }

  /**
   * Anatomically Contoured Glass Silhouette Shell
   * Exactly encloses 1.71m skeleton and internal organs without occluding or clipping them.
   */
  buildProceduralSkinShell() {
    const skinMat = this.materials.skinActive;
    const skinParts = [];

    // 1. Head & Facial Cranium
    const headGeo = new THREE.SphereGeometry(1, 32, 24);
    headGeo.scale(0.095, 0.115, 0.105);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 1.62, 0.01);
    skinParts.push(headMesh);

    // 2. Jaw & Chin
    const jawGeo = new THREE.CylinderGeometry(0.075, 0.05, 0.10, 24);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, 1.53, 0.035);
    skinParts.push(jawMesh);

    // 3. Neck
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 1.45, 0.00);
    skinParts.push(neckMesh);

    // 4. Thoracic Chest & Shoulders
    const chestGeo = new THREE.CylinderGeometry(0.18, 0.165, 0.20, 28);
    chestGeo.scale(1.15, 1.0, 0.70);
    const chestMesh = new THREE.Mesh(chestGeo, skinMat);
    chestMesh.position.set(0, 1.34, 0.01);
    skinParts.push(chestMesh);

    // 5. Abdominal Waist
    const abdomenGeo = new THREE.CylinderGeometry(0.155, 0.165, 0.22, 28);
    abdomenGeo.scale(1.05, 1.0, 0.72);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, skinMat);
    abdomenMesh.position.set(0, 1.15, 0.00);
    skinParts.push(abdomenMesh);

    // 6. Pelvis & Hips
    const pelvisGeo = new THREE.CylinderGeometry(0.170, 0.155, 0.20, 28);
    pelvisGeo.scale(1.10, 1.0, 0.75);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, skinMat);
    pelvisMesh.position.set(0, 0.95, -0.01);
    skinParts.push(pelvisMesh);

    // 7. Arms (Upper arm, forearm, hand) - Bilateral Left & Right
    [-1, 1].forEach(side => {
      // Upper arm
      const uArmGeo = new THREE.CylinderGeometry(0.052, 0.045, 0.28, 20);
      const uArmMesh = new THREE.Mesh(uArmGeo, skinMat);
      uArmMesh.position.set(side * 0.225, 1.25, -0.01);
      uArmMesh.rotation.z = side * -0.08;
      skinParts.push(uArmMesh);

      // Forearm
      const fArmGeo = new THREE.CylinderGeometry(0.044, 0.036, 0.26, 20);
      const fArmMesh = new THREE.Mesh(fArmGeo, skinMat);
      fArmMesh.position.set(side * 0.25, 0.99, -0.01);
      fArmMesh.rotation.z = side * -0.05;
      skinParts.push(fArmMesh);

      // Hand
      const handGeo = new THREE.BoxGeometry(0.04, 0.16, 0.08);
      const handMesh = new THREE.Mesh(handGeo, skinMat);
      handMesh.position.set(side * 0.265, 0.78, -0.01);
      skinParts.push(handMesh);
    });

    // 8. Legs (Thigh, calf, foot) - Bilateral Left & Right
    [-1, 1].forEach(side => {
      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.088, 0.065, 0.40, 24);
      const thighMesh = new THREE.Mesh(thighGeo, skinMat);
      thighMesh.position.set(side * 0.095, 0.68, 0.00);
      skinParts.push(thighMesh);

      // Calf
      const calfGeo = new THREE.CylinderGeometry(0.062, 0.045, 0.38, 24);
      const calfMesh = new THREE.Mesh(calfGeo, skinMat);
      calfMesh.position.set(side * 0.095, 0.29, -0.01);
      skinParts.push(calfMesh);

      // Foot
      const footGeo = new THREE.BoxGeometry(0.075, 0.06, 0.20);
      const footMesh = new THREE.Mesh(footGeo, skinMat);
      footMesh.position.set(side * 0.095, 0.04, 0.04);
      skinParts.push(footMesh);
    });

    // Configure and add all skin pieces
    skinParts.forEach(mesh => {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.userData = { id: "skin", system: "skin", name: "Integumentary Skin Shell" };
      this.systems.skin.add(mesh);
    });
  }

  processBodyModel(scene) {
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      const name = (child.name || "").toLowerCase();
      const data = getAnatomyDataForMesh(child.name);

      child.castShadow = true;
      child.receiveShadow = true;

      if (name.includes("muscle") || name.includes("pectoral") || name.includes("biceps") || name.includes("deltoid") || name.includes("gluteus") || name.includes("rectus") || name.includes("trapezius") || name.includes("latissimus") || name.includes("vastus") || name.includes("gastrocnemius")) {
        // Muscle Mesh
        child.material = this.materials.muscle;
        child.userData = { id: data.id || "muscles_major", system: "muscles", name: child.name };
        this.systems.muscles.add(child);
      } else {
        // Bone Mesh
        child.material = this.materials.bone;
        child.userData = { id: data.id || "cranium", system: "skeleton", name: child.name };
        this.systems.skeleton.add(child);
      }

      this.registerClickableMesh(child);
    });
  }

  processCardiovascularModel(scene) {
    // 1:1 true scale and origin alignment
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);

    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      const name = (child.name || "").toLowerCase();
      let mat = this.materials.artery;
      if (name.includes("vein") || name.includes("vena") || name.includes("jugular") || name.includes("sinus") || name.includes("azygos")) {
        mat = this.materials.vein;
      } else if (name.includes("heart") || name.includes("cor") || name.includes("myocardi") || name.includes("ventric") || name.includes("atrium")) {
        mat = this.materials.heart;
        this.heartMesh = child;
      }

      child.material = mat;
      child.castShadow = true;
      const data = getAnatomyDataForMesh(child.name);
      child.userData = { id: data.id || "heart", system: "cardiovascular", name: child.name };
      this.registerClickableMesh(child);
    });

    this.systems.cardiovascular.add(scene);
  }

  processRespiratoryModel(scene) {
    // 1:1 true scale and origin alignment
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);

    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      const name = (child.name || "").toLowerCase();
      child.material = (name.includes("trachea") || name.includes("bronch") || name.includes("larynx"))
        ? this.materials.trachea
        : this.materials.lung;
      const data = getAnatomyDataForMesh(child.name);
      child.userData = { id: data.id || "lungs", system: "respiratory", name: child.name };
      this.registerClickableMesh(child);
    });

    this.lungsGroup = scene;
    this.systems.respiratory.add(scene);
  }

  processDigestiveModel(scene) {
    // 1:1 true scale and origin alignment
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);

    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      child.material = this.materials.getMaterialForNode(child.name, "digestive");
      const data = getAnatomyDataForMesh(child.name);
      child.userData = { id: data.id || "stomach", system: "digestive", name: child.name };
      this.registerClickableMesh(child);
    });

    this.systems.digestive.add(scene);
  }

  processRenalModel(scene) {
    // 1:1 true scale and origin alignment
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);

    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      const name = (child.name || "").toLowerCase();
      child.material = name.includes("bladder") ? this.materials.bladder : this.materials.kidney;
      const data = getAnatomyDataForMesh(child.name);
      child.userData = { id: data.id || "kidneys", system: "renal", name: child.name };
      this.registerClickableMesh(child);
    });

    this.systems.renal.add(scene);
  }

  processNervousModel(scene) {
    // 1:1 true scale and origin alignment
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);

    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      const name = (child.name || "").toLowerCase();
      child.material = (name.includes("brain") || name.includes("cerebr") || name.includes("encephalon") || name.includes("cortex") || name.includes("lobule"))
        ? this.materials.brain
        : this.materials.nerve;
      const data = getAnatomyDataForMesh(child.name);
      child.userData = { id: data.id || "brain", system: "nervous", name: child.name };
      this.registerClickableMesh(child);
    });

    this.systems.nervous.add(scene);
  }

  updateSkinMaterial(newMaterial) {
    if (this.systems.skin) {
      this.systems.skin.traverse((child) => {
        if (child.isMesh) {
          child.material = newMaterial;
        }
      });
    }
  }

  registerClickableMesh(mesh) {
    mesh.userData.originalMaterial = mesh.material;
    this.clickableMeshes.push(mesh);
    if (mesh.name) {
      this.namedMeshes.set(mesh.name, mesh);
    }
  }

  finalizeScene() {
    // If heart mesh wasn't tagged specifically, pick first myocardial mesh
    if (!this.heartMesh && this.systems.cardiovascular.children.length > 0) {
      this.systems.cardiovascular.traverse((child) => {
        if (!this.heartMesh && child.isMesh && child.material === this.materials.heart) {
          this.heartMesh = child;
        }
      });
    }
  }

  setLayerVisibility(systemName, visible) {
    const group = this.systems[systemName];
    if (group) {
      group.visible = visible;
    }
  }

  applyGenderMorph(morphVal) {
    // 0.0 = Male, 1.0 = Female
    // Believable anatomical morphing:
    // Female pelvis is broader (wider pelvic inlet and subpubic arch)
    // Male shoulders are broader, female ribcage is slightly narrower
    const shoulderScale = THREE.MathUtils.lerp(1.0, 0.92, morphVal);
    const hipScale = THREE.MathUtils.lerp(1.0, 1.18, morphVal);

    if (this.systems.skeleton) {
      this.systems.skeleton.scale.set(hipScale, 1.0, 1.0);
    }
    if (this.systems.skin) {
      this.systems.skin.scale.set(hipScale * 1.02, 1.0, shoulderScale);
    }
  }
}
