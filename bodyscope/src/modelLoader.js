/**
 * BodyScope 3D - High-Precision Anatomical Model Loader
 * 1:1 Sub-Millimeter True Coordinate Alignment (Z-Anatomy & BodyParts3D Standards)
 * Full Male & Female Sex-Specific Reproductive & Mammary Anatomy
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
    this.stomachMesh = null;
    this.milkParticles = null;

    this.skinMaleParts = [];
    this.skinFemaleParts = [];

    // System Container Groups
    this.systems = {
      skin: new THREE.Group(),
      skeleton: new THREE.Group(),
      muscles: new THREE.Group(),
      cardiovascular: new THREE.Group(),
      respiratory: new THREE.Group(),
      digestive: new THREE.Group(),
      renal: new THREE.Group(),
      nervous: new THREE.Group(),
      femaleReproductive: new THREE.Group(),
      femaleMammary: new THREE.Group(),
      maleReproductive: new THREE.Group()
    };

    // Add all system groups to scene root
    Object.entries(this.systems).forEach(([name, group]) => {
      group.name = `System_${name}`;
      this.sceneManager.bodyRoot.add(group);
    });

    // Default female systems to hidden on start (male is default)
    this.systems.femaleReproductive.visible = false;
    this.systems.femaleMammary.visible = false;
    this.systems.maleReproductive.visible = true;

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
    // 1. Build Anatomically Contoured Skin Shell (Male & Female variants)
    this.buildProceduralSkinShell();

    // 2. Build High-Precision Female Reproductive System (Uterus, Ovaries, Fallopian Tubes, Vagina)
    this.buildFemaleReproductiveSystem();

    // 3. Build High-Precision Female Mammary System (Breasts, Glandular Lobules, Lactiferous Ducts)
    this.buildFemaleMammarySystem();

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

    // 4. Load Body (Full 206-bone Skeleton + 440+ Striated Muscles)
    this.gltfLoader.load(modelPaths.body, (gltf) => {
      this.processBodyModel(gltf.scene);
    }, null, (err) => console.warn('Could not load body.glb:', err));

    // 5. Load Cardiovascular System (Heart, Aorta, Vena Cava, Peripheral Vessels)
    this.gltfLoader.load(modelPaths.cardiovascular, (gltf) => {
      this.processCardiovascularModel(gltf.scene);
    }, null, (err) => console.warn('Could not load cardiovascular.glb:', err));

    // 6. Load Respiratory System (Lungs, Bronchial Trees, Trachea)
    this.gltfLoader.load(modelPaths.respiratory, (gltf) => {
      this.processRespiratoryModel(gltf.scene);
    }, null, (err) => console.warn('Could not load respiratory.glb:', err));

    // 7. Load Visceral Digestive & Male Reproductive Systems
    this.gltfLoader.load(modelPaths.digestive, (gltf) => {
      this.processDigestiveModel(gltf.scene);
    }, null, (err) => console.warn('Could not load visceral_male.glb:', err));

    // 8. Load Renal System (Kidneys, Ureters, Bladder)
    this.gltfLoader.load(modelPaths.renal, (gltf) => {
      this.processRenalModel(gltf.scene);
    }, null, (err) => console.warn('Could not load renal.glb:', err));

    // 9. Load Nervous System (Brain, Spinal Cord, Cranial & Peripheral Nerves)
    this.gltfLoader.load(modelPaths.nervous, (gltf) => {
      this.processNervousModel(gltf.scene);
    }, null, (err) => console.warn('Could not load nervous.glb:', err));
  }

  /**
   * Anatomically Contoured Skin Shell with Dynamic Sex Dimorphism
   * Male: Broad muscular pectorals
   * Female: Natural feminine breast mounds, tapered waist & curvaceous hips
   */
  buildProceduralSkinShell() {
    const skinMat = this.materials.skinActive;

    // 1. Head & Facial Cranium
    const headGeo = new THREE.SphereGeometry(1, 32, 24);
    headGeo.scale(0.095, 0.115, 0.105);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 1.62, 0.01);
    this.systems.skin.add(headMesh);

    // 2. Jaw & Chin
    const jawGeo = new THREE.CylinderGeometry(0.075, 0.05, 0.10, 24);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, 1.53, 0.035);
    this.systems.skin.add(jawMesh);

    // 3. Neck
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 24);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 1.45, 0.00);
    this.systems.skin.add(neckMesh);

    // 4A. MALE CHEST (Flatter, muscular pectorals)
    const maleChestGeo = new THREE.CylinderGeometry(0.18, 0.165, 0.20, 28);
    maleChestGeo.scale(1.15, 1.0, 0.70);
    const maleChestMesh = new THREE.Mesh(maleChestGeo, skinMat);
    maleChestMesh.position.set(0, 1.34, 0.01);
    this.systems.skin.add(maleChestMesh);
    this.skinMaleParts.push(maleChestMesh);

    // 4B. FEMALE CHEST (Thorax + Curvaceous Breast Contours)
    const femaleChestGroup = new THREE.Group();
    femaleChestGroup.name = "FemaleSkinChest";

    const femaleThoraxGeo = new THREE.CylinderGeometry(0.165, 0.150, 0.20, 28);
    femaleThoraxGeo.scale(1.08, 1.0, 0.68);
    const femaleThoraxMesh = new THREE.Mesh(femaleThoraxGeo, skinMat);
    femaleThoraxMesh.position.set(0, 1.34, 0.005);
    femaleChestGroup.add(femaleThoraxMesh);

    // Feminine Outer Breast Mounds for Skin Shell
    [-1, 1].forEach(side => {
      const breastSkinGeo = new THREE.SphereGeometry(1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      breastSkinGeo.scale(0.068, 0.065, 0.062);
      const breastSkinMesh = new THREE.Mesh(breastSkinGeo, skinMat);
      breastSkinMesh.position.set(side * 0.088, 1.30, 0.118);
      breastSkinMesh.rotation.x = Math.PI * 0.5;
      breastSkinMesh.rotation.y = side * 0.1;
      femaleChestGroup.add(breastSkinMesh);

      // Areola / Nipple skin protrusion
      const nipGeo = new THREE.CylinderGeometry(0.006, 0.007, 0.008, 16);
      const nipMesh = new THREE.Mesh(nipGeo, skinMat);
      nipMesh.position.set(side * 0.088, 1.30, 0.180);
      nipMesh.rotation.x = Math.PI * 0.5;
      femaleChestGroup.add(nipMesh);
    });

    femaleChestGroup.visible = false; // Start hidden (male default)
    this.systems.skin.add(femaleChestGroup);
    this.skinFemaleParts.push(femaleChestGroup);

    // 5. Abdominal Waist
    const abdomenGeo = new THREE.CylinderGeometry(0.155, 0.165, 0.22, 28);
    abdomenGeo.scale(1.05, 1.0, 0.72);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, skinMat);
    abdomenMesh.position.set(0, 1.15, 0.00);
    this.systems.skin.add(abdomenMesh);

    // 6. Pelvis & Hips
    const pelvisGeo = new THREE.CylinderGeometry(0.170, 0.155, 0.20, 28);
    pelvisGeo.scale(1.10, 1.0, 0.75);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, skinMat);
    pelvisMesh.position.set(0, 0.95, -0.01);
    this.systems.skin.add(pelvisMesh);

    // 7. Arms (Upper arm, forearm, hand) - Bilateral
    [-1, 1].forEach(side => {
      const uArmGeo = new THREE.CylinderGeometry(0.052, 0.045, 0.28, 20);
      const uArmMesh = new THREE.Mesh(uArmGeo, skinMat);
      uArmMesh.position.set(side * 0.225, 1.25, -0.01);
      uArmMesh.rotation.z = side * -0.08;
      this.systems.skin.add(uArmMesh);

      const fArmGeo = new THREE.CylinderGeometry(0.044, 0.036, 0.26, 20);
      const fArmMesh = new THREE.Mesh(fArmGeo, skinMat);
      fArmMesh.position.set(side * 0.25, 0.99, -0.01);
      fArmMesh.rotation.z = side * -0.05;
      this.systems.skin.add(fArmMesh);

      const handGeo = new THREE.BoxGeometry(0.04, 0.16, 0.08);
      const handMesh = new THREE.Mesh(handGeo, skinMat);
      handMesh.position.set(side * 0.265, 0.78, -0.01);
      this.systems.skin.add(handMesh);
    });

    // 8. Legs (Thigh, calf, foot) - Bilateral
    [-1, 1].forEach(side => {
      const thighGeo = new THREE.CylinderGeometry(0.088, 0.065, 0.40, 24);
      const thighMesh = new THREE.Mesh(thighGeo, skinMat);
      thighMesh.position.set(side * 0.095, 0.68, 0.00);
      this.systems.skin.add(thighMesh);

      const calfGeo = new THREE.CylinderGeometry(0.062, 0.045, 0.38, 24);
      const calfMesh = new THREE.Mesh(calfGeo, skinMat);
      calfMesh.position.set(side * 0.095, 0.29, -0.01);
      this.systems.skin.add(calfMesh);

      const footGeo = new THREE.BoxGeometry(0.075, 0.06, 0.20);
      const footMesh = new THREE.Mesh(footGeo, skinMat);
      footMesh.position.set(side * 0.095, 0.04, 0.04);
      this.systems.skin.add(footMesh);
    });

    // Configure all skin meshes
    this.systems.skin.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.userData = { id: "skin", system: "skin", name: "Integumentary Skin Shell" };
      }
    });
  }

  /**
   * Anatomically Accurate Female Reproductive System
   * Uterus (Fundus, Corpus, Cervix), Ovaries, Fallopian Tubes & Vagina
   */
  buildFemaleReproductiveSystem() {
    const group = this.systems.femaleReproductive;

    // 1. Uterus (Inverted pear shape with anatomical anteverted tilt)
    const uterusPoints = [
      new THREE.Vector2(0.012, -0.038), // Cervical os
      new THREE.Vector2(0.015, -0.018), // Cervix
      new THREE.Vector2(0.022, 0.002),  // Isthmus
      new THREE.Vector2(0.029, 0.022),  // Corpus (widest)
      new THREE.Vector2(0.026, 0.036),  // Cornua level
      new THREE.Vector2(0.0, 0.042)     // Fundus dome apex
    ];
    const uterusGeo = new THREE.LatheGeometry(uterusPoints, 24);
    uterusGeo.scale(1.0, 1.0, 0.65);
    const uterusMesh = new THREE.Mesh(uterusGeo, this.materials.uterus);
    uterusMesh.position.set(0, 0.865, 0.015);
    uterusMesh.rotation.x = -0.15; // Natural anteverted position over bladder
    uterusMesh.castShadow = true;
    uterusMesh.receiveShadow = true;
    uterusMesh.userData = { id: "uterus", system: "femaleReproductive", name: "Uterus (Womb) & Myometrium" };
    group.add(uterusMesh);
    this.registerClickableMesh(uterusMesh);
    this.uterusMesh = uterusMesh;

    // 2. Vaginal Canal & Cervix
    const vaginaGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.075, 20);
    vaginaGeo.scale(1.0, 1.0, 0.6);
    const vaginaMesh = new THREE.Mesh(vaginaGeo, this.materials.uterus);
    vaginaMesh.position.set(0, 0.805, 0.022);
    vaginaMesh.rotation.x = 0.25; // Normal pelvic vaginal incline
    vaginaMesh.castShadow = true;
    vaginaMesh.userData = { id: "uterus", system: "femaleReproductive", name: "Cervix & Vaginal Canal" };
    group.add(vaginaMesh);
    this.registerClickableMesh(vaginaMesh);

    // 3. Bilateral Fallopian (Uterine) Tubes & Ovaries
    [-1, 1].forEach(side => {
      // Fallopian Tube arching from uterine cornua to ovarian fimbriae
      const tubeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.022, 0.895, 0.015), // Uterine horn
        new THREE.Vector3(side * 0.038, 0.908, 0.012), // Isthmus arch
        new THREE.Vector3(side * 0.054, 0.900, 0.005), // Ampulla
        new THREE.Vector3(side * 0.058, 0.880, -0.005) // Infundibulum / Fimbriae
      ]);
      const tubeGeo = new THREE.TubeGeometry(tubeCurve, 24, 0.0035, 12, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, this.materials.fallopian);
      tubeMesh.castShadow = true;
      tubeMesh.userData = { id: "ovaries", system: "femaleReproductive", name: side > 0 ? "Right Fallopian Tube" : "Left Fallopian Tube" };
      group.add(tubeMesh);
      this.registerClickableMesh(tubeMesh);

      // Fimbriae rosette at ovary interface
      const fimbriaGeo = new THREE.ConeGeometry(0.007, 0.010, 12, 1, true);
      const fimbriaMesh = new THREE.Mesh(fimbriaGeo, this.materials.fallopian);
      fimbriaMesh.position.set(side * 0.058, 0.880, -0.005);
      fimbriaMesh.rotation.x = Math.PI;
      fimbriaMesh.userData = { id: "ovaries", system: "femaleReproductive", name: "Ovarian Fimbriae" };
      group.add(fimbriaMesh);
      this.registerClickableMesh(fimbriaMesh);

      // Ovary (Almond-shaped primary female gonad)
      const ovaryGeo = new THREE.SphereGeometry(1, 20, 16);
      ovaryGeo.scale(0.016, 0.011, 0.008);
      const ovaryMesh = new THREE.Mesh(ovaryGeo, this.materials.ovary);
      ovaryMesh.position.set(side * 0.054, 0.875, -0.005);
      ovaryMesh.rotation.z = side * 0.2;
      ovaryMesh.castShadow = true;
      ovaryMesh.userData = { id: "ovaries", system: "femaleReproductive", name: side > 0 ? "Right Ovary (Ovarium)" : "Left Ovary (Ovarium)" };
      group.add(ovaryMesh);
      this.registerClickableMesh(ovaryMesh);
    });
  }

  /**
   * Anatomically Accurate Female Mammary System (Breasts & Lactation Glands)
   * Mammary lobules, lactiferous ducts, areola, nipple, and flowing milk particles
   */
  buildFemaleMammarySystem() {
    const group = this.systems.femaleMammary;
    const milkPoints = [];

    [-1, 1].forEach(side => {
      // 1. Breast Glandular Mound on anterior ribs 2-6
      const breastGeo = new THREE.SphereGeometry(1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
      breastGeo.scale(0.062, 0.060, 0.055);
      const breastMesh = new THREE.Mesh(breastGeo, this.materials.mammary);
      breastMesh.position.set(side * 0.088, 1.30, 0.118);
      breastMesh.rotation.x = Math.PI * 0.5;
      breastMesh.rotation.y = side * 0.1;
      breastMesh.castShadow = true;
      breastMesh.userData = { id: "mammary_glands", system: "femaleMammary", name: side > 0 ? "Right Mammary Gland" : "Left Mammary Gland" };
      group.add(breastMesh);
      this.registerClickableMesh(breastMesh);

      // 2. Areola (Pigmented circular disc)
      const areolaGeo = new THREE.CircleGeometry(0.016, 24);
      const areolaMesh = new THREE.Mesh(areolaGeo, this.materials.areola);
      areolaMesh.position.set(side * 0.088, 1.30, 0.173);
      areolaMesh.userData = { id: "mammary_glands", system: "femaleMammary", name: "Areola Mammae" };
      group.add(areolaMesh);
      this.registerClickableMesh(areolaMesh);

      // 3. Nipple (Papilla mammaria)
      const nippleGeo = new THREE.CylinderGeometry(0.005, 0.006, 0.008, 16);
      const nippleMesh = new THREE.Mesh(nippleGeo, this.materials.areola);
      nippleMesh.position.set(side * 0.088, 1.30, 0.177);
      nippleMesh.rotation.x = Math.PI * 0.5;
      nippleMesh.userData = { id: "mammary_glands", system: "femaleMammary", name: "Nipple (Papilla Mammaria)" };
      group.add(nippleMesh);
      this.registerClickableMesh(nippleMesh);

      // 4. Internal Glandular Lobules (14 secretory lobes per breast)
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2;
        const r = 0.026 + (i % 2) * 0.012;
        const lobeGeo = new THREE.SphereGeometry(0.0085, 12, 10);
        lobeGeo.scale(1.2, 0.9, 0.7);
        const lobeMesh = new THREE.Mesh(lobeGeo, this.materials.mammary);
        const lx = side * 0.088 + Math.cos(angle) * r * 0.8;
        const ly = 1.30 + Math.sin(angle) * r * 0.8;
        const lz = 0.138 + (i % 3) * 0.006;
        lobeMesh.position.set(lx, ly, lz);
        lobeMesh.userData = { id: "mammary_glands", system: "femaleMammary", name: `Mammary Glandular Lobule #${i + 1}` };
        group.add(lobeMesh);
        this.registerClickableMesh(lobeMesh);

        // Lactiferous Duct connecting lobule to nipple
        const ductCurve = new THREE.LineCurve3(
          new THREE.Vector3(lx, ly, lz),
          new THREE.Vector3(side * 0.088, 1.30, 0.175)
        );
        const ductGeo = new THREE.TubeGeometry(ductCurve, 8, 0.0012, 6, false);
        const ductMesh = new THREE.Mesh(ductGeo, this.materials.fallopian);
        group.add(ductMesh);

        // Collect path points for active milk particle flow
        for (let t = 0; t <= 1; t += 0.25) {
          milkPoints.push(ductCurve.getPoint(t));
        }
      }
    });

    // 5. Active Lactation Milk Particle Drops (Glowing white droplets)
    if (milkPoints.length > 0) {
      const milkGeo = new THREE.BufferGeometry().setFromPoints(milkPoints);
      const milkMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.0035,
        transparent: true,
        opacity: 0.95
      });
      this.milkParticles = new THREE.Points(milkGeo, milkMat);
      this.milkParticles.userData = { initialPositions: milkPoints.slice() };
      group.add(this.milkParticles);
    }
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
        // Muscle Mesh (Flesh / Maas)
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
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);

    const maleKeywords = ["penis", "testis", "prostate", "epididym", "ductus deferens", "seminal", "cavernosum", "spongiosum", "glans"];
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      const name = (child.name || "").toLowerCase();
      const isMaleRepro = maleKeywords.some(k => name.includes(k));

      if (isMaleRepro) {
        // Male-Specific Genital & Reproductive Node
        child.material = this.materials.getMaterialForNode(child.name, "reproductive");
        const data = getAnatomyDataForMesh(child.name);
        child.userData = { id: "male_reproductive", system: "maleReproductive", name: child.name };
        this.systems.maleReproductive.add(child);
        this.registerClickableMesh(child);
      } else {
        // Visceral Digestive Organ (Liver, Stomach, Intestines, etc.)
        child.material = this.materials.getMaterialForNode(child.name, "digestive");
        const data = getAnatomyDataForMesh(child.name);
        child.userData = { id: data.id || "stomach", system: "digestive", name: child.name };
        if (name.includes("stomach") || name.includes("gaster")) {
          this.stomachMesh = child;
        }
        this.systems.digestive.add(child);
        this.registerClickableMesh(child);
      }
    });
  }

  processRenalModel(scene) {
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

  /**
   * Set Biological Gender & Dynamically Switch Sex-Specific Organs
   * Male: Shows testes, prostate, penis; hides uterus, ovaries, breasts
   * Female: Shows uterus, ovaries, breasts; hides penis, testes, prostate
   */
  setGender(gender) {
    const isFemale = gender === 'female';

    // 1. Toggle Sex-Specific Visceral Groups
    this.systems.maleReproductive.visible = !isFemale;
    this.systems.femaleReproductive.visible = isFemale;
    this.systems.femaleMammary.visible = isFemale;

    // 2. Toggle Skin Shell Sex Morphology
    if (this.skinMaleParts) {
      this.skinMaleParts.forEach(p => p.visible = !isFemale);
    }
    if (this.skinFemaleParts) {
      this.skinFemaleParts.forEach(p => p.visible = isFemale);
    }

    // 3. Apply Pelvic and Skeletal Dimorphic Morphing
    this.applyGenderMorph(isFemale ? 1.0 : 0.0);
  }

  applyGenderMorph(morphVal) {
    // 0.0 = Male, 1.0 = Female
    // Female pelvis is broader (wider pelvic inlet and subpubic arch >90°)
    // Male shoulders are broader, female ribcage is slightly narrower
    const shoulderScale = THREE.MathUtils.lerp(1.0, 0.92, morphVal);
    const hipScale = THREE.MathUtils.lerp(1.0, 1.18, morphVal);

    if (this.systems.skeleton) {
      this.systems.skeleton.scale.set(hipScale, 1.0, 1.0);
    }
    if (this.systems.femaleReproductive) {
      this.systems.femaleReproductive.scale.set(hipScale, 1.0, 1.0);
    }
    if (this.systems.skin) {
      this.systems.skin.scale.set(hipScale * 1.01, 1.0, shoulderScale);
    }
  }
}
