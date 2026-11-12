/**
 * BodyScope 3D - High-Precision Anatomical Model Loader
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
    // Model files inside /bodyscope/models/
    const modelPaths = {
      body: 'models/body.glb',
      cardiovascular: 'models/cardiovascular.glb',
      respiratory: 'models/respiratory.glb',
      digestive: 'models/digestive.glb',
      renal: 'models/renal.glb',
      nervous: 'models/nervous.glb',
      skin: 'models/skin_male.glb'
    };

    // 1. Load Body (Full Skeleton + Muscles from Z-Anatomy dataset)
    this.gltfLoader.load(modelPaths.body, (gltf) => {
      this.processBodyModel(gltf.scene);
    }, null, (err) => console.warn('Could not load body.glb:', err));

    // 2. Load Cardiovascular System (Heart & Vessels)
    this.gltfLoader.load(modelPaths.cardiovascular, (gltf) => {
      this.processCardiovascularModel(gltf.scene);
    }, null, (err) => console.warn('Could not load cardiovascular.glb:', err));

    // 3. Load Respiratory System (Lungs & Bronchi)
    this.gltfLoader.load(modelPaths.respiratory, (gltf) => {
      this.processRespiratoryModel(gltf.scene);
    }, null, (err) => console.warn('Could not load respiratory.glb:', err));

    // 4. Load Digestive System (Stomach, Liver, Intestines, Pancreas)
    this.gltfLoader.load(modelPaths.digestive, (gltf) => {
      this.processDigestiveModel(gltf.scene);
    }, null, (err) => console.warn('Could not load digestive.glb:', err));

    // 5. Load Renal System (Kidneys, Bladder)
    this.gltfLoader.load(modelPaths.renal, (gltf) => {
      this.processRenalModel(gltf.scene);
    }, null, (err) => console.warn('Could not load renal.glb:', err));

    // 6. Load Nervous System (Brain, Spinal Cord, Peripheral Nerves)
    this.gltfLoader.load(modelPaths.nervous, (gltf) => {
      this.processNervousModel(gltf.scene);
    }, null, (err) => console.warn('Could not load nervous.glb:', err));

    // 7. Load Skin Shell
    this.gltfLoader.load(modelPaths.skin, (gltf) => {
      this.processSkinModel(gltf.scene);
    }, null, (err) => console.warn('Could not load skin.glb:', err));
  }

  processBodyModel(scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        const name = (child.name || "").toLowerCase();
        const data = getAnatomyDataForMesh(child.name);

        child.castShadow = true;
        child.receiveShadow = true;

        if (name.includes("muscle") || name.includes("pectoral") || name.includes("biceps") || name.includes("deltoid") || name.includes("gluteus")) {
          // Muscle Mesh
          child.material = this.materials.muscle;
          child.userData = { id: data.id || "muscles_major", system: "muscles", name: child.name };
          this.systems.muscles.add(child.clone());
        } else {
          // Bone Mesh
          child.material = this.materials.bone;
          child.userData = { id: data.id || "cranium", system: "skeleton", name: child.name };
          this.systems.skeleton.add(child.clone());
        }

        this.registerClickableMesh(child);
      }
    });
  }

  processCardiovascularModel(scene) {
    // Standardize coordinate space to align with thoracic rib cage
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Fit inside thoracic mediastinum (Y ~ 1.10 - 1.45m)
    const targetHeight = 0.55;
    const scale = targetHeight / (size.y || 1.0);
    scene.scale.set(scale, scale, scale);
    scene.position.set(-center.x * scale, 1.30 - center.y * scale, 0.02 - center.z * scale);

    scene.traverse((child) => {
      if (child.isMesh) {
        const name = (child.name || "").toLowerCase();
        let mat = this.materials.artery;
        if (name.includes("vein") || name.includes("vena") || name.includes("jugular")) {
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
      }
    });

    this.systems.cardiovascular.add(scene);
  }

  processRespiratoryModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetHeight = 0.42;
    const scale = targetHeight / (size.y || 1.0);
    scene.scale.set(scale, scale, scale);
    scene.position.set(-center.x * scale, 1.32 - center.y * scale, 0.01 - center.z * scale);

    scene.traverse((child) => {
      if (child.isMesh) {
        const name = (child.name || "").toLowerCase();
        child.material = name.includes("trachea") || name.includes("bronch") ? this.materials.trachea : this.materials.lung;
        const data = getAnatomyDataForMesh(child.name);
        child.userData = { id: data.id || "lungs", system: "respiratory", name: child.name };
        this.registerClickableMesh(child);
      }
    });

    this.lungsGroup = scene;
    this.systems.respiratory.add(scene);
  }

  processDigestiveModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetHeight = 0.52;
    const scale = targetHeight / (size.y || 1.0);
    scene.scale.set(scale, scale, scale);
    scene.position.set(-center.x * scale, 1.10 - center.y * scale, 0.04 - center.z * scale);

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = this.materials.getMaterialForNode(child.name, "digestive");
        const data = getAnatomyDataForMesh(child.name);
        child.userData = { id: data.id || "stomach", system: "digestive", name: child.name };
        this.registerClickableMesh(child);
      }
    });

    this.systems.digestive.add(scene);
  }

  processRenalModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetHeight = 0.38;
    const scale = targetHeight / (size.y || 1.0);
    scene.scale.set(scale, scale, scale);
    scene.position.set(-center.x * scale, 1.04 - center.y * scale, -0.02 - center.z * scale);

    scene.traverse((child) => {
      if (child.isMesh) {
        const name = (child.name || "").toLowerCase();
        child.material = name.includes("bladder") ? this.materials.bladder : this.materials.kidney;
        const data = getAnatomyDataForMesh(child.name);
        child.userData = { id: data.id || "kidneys", system: "renal", name: child.name };
        this.registerClickableMesh(child);
      }
    });

    this.systems.renal.add(scene);
  }

  processNervousModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const targetHeight = 1.62;
    const scale = targetHeight / (size.y || 1.0);
    scene.scale.set(scale, scale, scale);
    scene.position.set(-center.x * scale, 0.95 - center.y * scale, -center.z * scale);

    scene.traverse((child) => {
      if (child.isMesh) {
        const name = (child.name || "").toLowerCase();
        child.material = name.includes("brain") || name.includes("cerebr") || name.includes("encephalon") ? this.materials.brain : this.materials.nerve;
        const data = getAnatomyDataForMesh(child.name);
        child.userData = { id: data.id || "brain", system: "nervous", name: child.name };
        this.registerClickableMesh(child);
      }
    });

    this.systems.nervous.add(scene);
  }

  processSkinModel(scene) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Fit skin snugly around 1.71m skeleton
    const targetHeight = 1.74;
    const scale = targetHeight / (size.y || 1.0);
    scene.scale.set(scale * 1.04, scale * 1.02, scale * 1.08);
    scene.position.set(-center.x * scale, 0.88 - center.y * scale, -center.z * scale);

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = this.materials.skinActive;
        child.userData = { id: "skin", system: "skin", name: "Integumentary Skin" };
      }
    });

    this.skinMesh = scene;
    this.systems.skin.add(scene);
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

