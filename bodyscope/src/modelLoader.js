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
      nervous: 'models/nervous.glb',
      skin: 'models/skin.glb'
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

    // 10. Load Visible Human Female Mammary & Fat Anatomy
    this.gltfLoader.load(modelPaths.skin, (gltf) => {
      this.processSkinModel(gltf.scene);
    }, null, (err) => console.warn('Could not load skin.glb:', err));
  }

  /**
   * Anatomically Contoured Skin Shell with Dynamic Sex Dimorphism
   * Male: Broad muscular pectorals
   * Female: Natural feminine breast mounds, tapered waist & curvaceous hips
   */
  buildProceduralSkinShell() {
    const skinMat = this.materials.skinActive;

    // Helper to configure and register each skin mesh
    const addSkinMesh = (geo, mat, pos, rot = null, scale = null, parent = this.systems.skin, preserveMat = false) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
      if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { id: "skin", system: "skin", name: "Integumentary Skin Shell", preserveMaterial: preserveMat };
      parent.add(mesh);
      return mesh;
    };

    // ----------------------------------------------------
    // 1. HEAD & FACIAL ANATOMY (Cranium, Brow, Nose, Lips, Jaw, Ears)
    // ----------------------------------------------------
    // 1A. Cranium Dome (Neurocranium & Forehead)
    const craniumGeo = new THREE.SphereGeometry(1, 36, 28);
    craniumGeo.scale(0.098, 0.122, 0.114);
    addSkinMesh(craniumGeo, skinMat, [0, 1.62, 0.01]);

    // 1B. Brow ridge / Forehead slope
    const browGeo = new THREE.SphereGeometry(1, 24, 16);
    browGeo.scale(0.084, 0.038, 0.045);
    addSkinMesh(browGeo, skinMat, [0, 1.635, 0.080]);

    // 1C. Zygomatic Arches (Cheekbones) & Ears - Bilateral
    [-1, 1].forEach(side => {
      const cheekGeo = new THREE.SphereGeometry(1, 20, 14);
      cheekGeo.scale(0.024, 0.026, 0.032);
      addSkinMesh(cheekGeo, skinMat, [side * 0.062, 1.585, 0.068]);

      // Orbital rim / brow arch
      const orbitGeo = new THREE.SphereGeometry(1, 16, 12);
      orbitGeo.scale(0.020, 0.012, 0.016);
      addSkinMesh(orbitGeo, skinMat, [side * 0.036, 1.608, 0.088]);

      // Ear Auricle (Pinna & Lobule)
      const earGeo = new THREE.SphereGeometry(1, 20, 14);
      earGeo.scale(0.012, 0.032, 0.022);
      addSkinMesh(earGeo, skinMat, [side * 0.098, 1.585, -0.012], [0, side * 0.15, 0]);
    });

    // 1D. Anatomical 3D Nose (Dorsum bridge, lobule tip, alar nostrils)
    const noseBridgeGeo = new THREE.CylinderGeometry(0.007, 0.012, 0.040, 16);
    addSkinMesh(noseBridgeGeo, skinMat, [0, 1.590, 0.098], [0.45, 0, 0]);

    const noseTipGeo = new THREE.SphereGeometry(0.011, 16, 14);
    addSkinMesh(noseTipGeo, skinMat, [0, 1.572, 0.114]);

    [-1, 1].forEach(side => {
      const alarGeo = new THREE.SphereGeometry(0.008, 12, 10);
      addSkinMesh(alarGeo, skinMat, [side * 0.014, 1.568, 0.104]);
    });

    // 1E. Contoured Lips (Philtrum, upper lip cupid's bow, lower lip vermilion)
    const upperLipGeo = new THREE.CylinderGeometry(0.006, 0.007, 0.038, 16);
    addSkinMesh(upperLipGeo, this.materials.lips || skinMat, [0, 1.542, 0.098], [0, 0, Math.PI / 2], null, this.systems.skin, true);

    const lowerLipGeo = new THREE.CylinderGeometry(0.007, 0.008, 0.034, 16);
    addSkinMesh(lowerLipGeo, this.materials.lips || skinMat, [0, 1.528, 0.095], [0, 0, Math.PI / 2], null, this.systems.skin, true);

    // 1F. Chin (Mental protuberance) & Mandibular Jawline
    const chinGeo = new THREE.SphereGeometry(1, 24, 18);
    chinGeo.scale(0.028, 0.024, 0.030);
    addSkinMesh(chinGeo, skinMat, [0, 1.498, 0.088]);

    [-1, 1].forEach(side => {
      const jawAngleGeo = new THREE.CylinderGeometry(0.018, 0.016, 0.085, 16);
      addSkinMesh(jawAngleGeo, skinMat, [side * 0.052, 1.520, 0.040], [0.40, side * 0.35, side * -0.55]);
    });

    // ----------------------------------------------------
    // 2. NECK & THROAT (Sternocleidomastoid, Clavicular Notch, Adam's Apple)
    // ----------------------------------------------------
    const neckGeo = new THREE.CylinderGeometry(0.062, 0.076, 0.14, 28);
    neckGeo.scale(1.0, 1.0, 0.90);
    addSkinMesh(neckGeo, skinMat, [0, 1.455, -0.005]);

    // Bilateral Sternocleidomastoid Muscle Ridges
    [-1, 1].forEach(side => {
      const scmGeo = new THREE.CylinderGeometry(0.014, 0.012, 0.13, 16);
      addSkinMesh(scmGeo, skinMat, [side * 0.045, 1.455, 0.022], [0.22, 0, side * -0.25]);
    });

    // Male Adam's Apple (Thyroid prominence)
    const adamsAppleGeo = new THREE.SphereGeometry(0.009, 14, 12);
    adamsAppleGeo.scale(0.9, 1.1, 1.3);
    const adamsAppleMesh = addSkinMesh(adamsAppleGeo, skinMat, [0, 1.465, 0.062]);
    this.skinMaleParts.push(adamsAppleMesh);

    // Clavicular Notch (Jugular notch) & Clavicle Collarbone Ridge
    [-1, 1].forEach(side => {
      const clavicleGeo = new THREE.CylinderGeometry(0.014, 0.012, 0.18, 16);
      addSkinMesh(clavicleGeo, skinMat, [side * 0.095, 1.392, 0.040], [0.15, side * 0.10, side * -1.45]);
    });

    // Bilateral Deltoid Muscle Shoulder Caps
    [-1, 1].forEach(side => {
      const deltoidGeo = new THREE.SphereGeometry(1, 24, 20);
      deltoidGeo.scale(0.064, 0.085, 0.070);
      addSkinMesh(deltoidGeo, skinMat, [side * 0.215, 1.345, -0.005]);
    });

    // ----------------------------------------------------
    // 3. THORAX / CHEST (Male vs Female Morphology)
    // ----------------------------------------------------
    // 3A. MALE CHEST (Broad muscular pectorals & athletic ribcage)
    const maleChestGroup = new THREE.Group();
    maleChestGroup.name = "MaleSkinChest";

    const maleTorsoGeo = new THREE.CylinderGeometry(0.182, 0.165, 0.22, 32);
    maleTorsoGeo.scale(1.18, 1.0, 0.72);
    addSkinMesh(maleTorsoGeo, skinMat, [0, 1.335, 0.008], null, null, maleChestGroup);

    // Bilateral Pectoralis Major Muscle Slabs with Sternal Cleavage
    [-1, 1].forEach(side => {
      const pecGeo = new THREE.SphereGeometry(1, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
      pecGeo.scale(0.092, 0.075, 0.048);
      addSkinMesh(pecGeo, skinMat, [side * 0.088, 1.315, 0.072], [Math.PI * 0.48, side * 0.08, 0], null, maleChestGroup);

      // Male areola/nipple flat disc
      const maleAreolaGeo = new THREE.CircleGeometry(0.010, 18);
      addSkinMesh(maleAreolaGeo, this.materials.areola || skinMat, [side * 0.108, 1.295, 0.118], [0, side * 0.12, 0], null, maleChestGroup, true);
    });

    this.systems.skin.add(maleChestGroup);
    this.skinMaleParts.push(maleChestGroup);

    // 3B. FEMALE CHEST (Contoured feminine thorax & natural teardrop breast mounds)
    const femaleChestGroup = new THREE.Group();
    femaleChestGroup.name = "FemaleSkinChest";

    const femaleTorsoGeo = new THREE.CylinderGeometry(0.162, 0.148, 0.22, 32);
    femaleTorsoGeo.scale(1.08, 1.0, 0.68);
    addSkinMesh(femaleTorsoGeo, skinMat, [0, 1.335, 0.005], null, null, femaleChestGroup);

    // Bilateral Natural Feminine Breast Mounds (Teardrop slope, natural gravity, inframammary fold)
    [-1, 1].forEach(side => {
      const breastSkinGeo = new THREE.SphereGeometry(1, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.62);
      breastSkinGeo.scale(0.078, 0.075, 0.070);
      addSkinMesh(breastSkinGeo, skinMat, [side * 0.088, 1.295, 0.115], [Math.PI * 0.52, side * 0.08, 0], null, femaleChestGroup);

      // Areola disc (pigmented circle with Montgomery tubercles)
      const areolaGeo = new THREE.CircleGeometry(0.018, 24);
      addSkinMesh(areolaGeo, this.materials.areola, [side * 0.088, 1.290, 0.183], [0, side * 0.08, 0], null, femaleChestGroup, true);

      // Papilla (Nipple) forward protrusion
      const nipGeo = new THREE.CylinderGeometry(0.0055, 0.0065, 0.008, 18);
      addSkinMesh(nipGeo, this.materials.areola, [side * 0.088, 1.290, 0.187], [Math.PI * 0.5, 0, 0], null, femaleChestGroup, true);
    });

    femaleChestGroup.visible = false; // Start hidden (male default)
    this.systems.skin.add(femaleChestGroup);
    this.skinFemaleParts.push(femaleChestGroup);

    // ----------------------------------------------------
    // 4. ABDOMEN, WAIST & NAVEL (Linea Alba, Rectus Abdominis, Umbilicus)
    // ----------------------------------------------------
    const abdomenGeo = new THREE.CylinderGeometry(0.150, 0.162, 0.22, 32);
    abdomenGeo.scale(1.06, 1.0, 0.72);
    addSkinMesh(abdomenGeo, skinMat, [0, 1.15, 0.002]);

    // Rectus Abdominis Muscle Relief (Bilateral cushions)
    [-1, 1].forEach(side => {
      [1.19, 1.13, 1.07].forEach(y => {
        const absGeo = new THREE.SphereGeometry(1, 16, 12);
        absGeo.scale(0.038, 0.024, 0.016);
        addSkinMesh(absGeo, skinMat, [side * 0.044, y, 0.076]);
      });
    });

    // Anatomical Umbilicus (Navel / Belly Button) - Realistic ring and indentation
    const navelRingGeo = new THREE.TorusGeometry(0.007, 0.003, 12, 20);
    addSkinMesh(navelRingGeo, skinMat, [0, 1.085, 0.082], [0, 0, 0]);

    const navelPitGeo = new THREE.SphereGeometry(0.005, 12, 10);
    addSkinMesh(navelPitGeo, this.materials.areola || skinMat, [0, 1.085, 0.080]);

    // Posterior Spinal Furrow (Vertebral groove down the back)
    const spineFurrowGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.40, 16);
    addSkinMesh(spineFurrowGeo, skinMat, [0, 1.18, -0.078]);

    // ----------------------------------------------------
    // 5. PELVIS, HIPS & SCULPTED GLUTEALS (Buttocks & Iliac Crests)
    // ----------------------------------------------------
    const pelvisGeo = new THREE.CylinderGeometry(0.165, 0.150, 0.20, 32);
    pelvisGeo.scale(1.10, 1.0, 0.76);
    addSkinMesh(pelvisGeo, skinMat, [0, 0.95, -0.01]);

    // Bilateral Sculpted Gluteus Maximus Mounds (Buttocks) with intergluteal cleft
    [-1, 1].forEach(side => {
      const gluteGeo = new THREE.SphereGeometry(1, 28, 22);
      gluteGeo.scale(0.078, 0.095, 0.074);
      addSkinMesh(gluteGeo, skinMat, [side * 0.082, 0.935, -0.075], [0.15, side * -0.08, 0]);
    });

    // ----------------------------------------------------
    // 6. UPPER LIMBS & ARTICULATED HANDS (NO FLAT BOXES!)
    // ----------------------------------------------------
    [-1, 1].forEach(side => {
      // 6A. Upper Arm (Brachium) with Biceps & Triceps Contours
      const uArmGeo = new THREE.CylinderGeometry(0.050, 0.042, 0.26, 24);
      addSkinMesh(uArmGeo, skinMat, [side * 0.222, 1.24, -0.012], [0, 0, side * -0.08]);

      // Biceps anterior muscular bulge
      const bicepsGeo = new THREE.SphereGeometry(1, 18, 14);
      bicepsGeo.scale(0.026, 0.085, 0.030);
      addSkinMesh(bicepsGeo, skinMat, [side * 0.222, 1.25, 0.018], [0, 0, side * -0.08]);

      // Triceps posterior contour
      const tricepsGeo = new THREE.SphereGeometry(1, 18, 14);
      tricepsGeo.scale(0.024, 0.090, 0.028);
      addSkinMesh(tricepsGeo, skinMat, [side * 0.220, 1.24, -0.032], [0, 0, side * -0.08]);

      // 6B. Elbow Joint & Olecranon Bone Bump
      const olecranonGeo = new THREE.SphereGeometry(0.014, 14, 12);
      addSkinMesh(olecranonGeo, skinMat, [side * 0.240, 1.11, -0.038]);

      // 6C. Forearm (Antebrachium) with Brachioradialis Muscular Taper
      const fArmGeo = new THREE.CylinderGeometry(0.042, 0.031, 0.25, 24);
      addSkinMesh(fArmGeo, skinMat, [side * 0.252, 0.985, -0.010], [0, 0, side * -0.05]);

      const brachiGeo = new THREE.SphereGeometry(1, 16, 12);
      brachiGeo.scale(0.022, 0.075, 0.026);
      addSkinMesh(brachiGeo, skinMat, [side * 0.268, 1.03, 0.005], [0, 0, side * -0.05]);

      // 6D. Wrist (Carpus) & Styloid Bone Landmarks
      const wristGeo = new THREE.CylinderGeometry(0.031, 0.027, 0.05, 20);
      wristGeo.scale(1.0, 1.0, 0.65);
      addSkinMesh(wristGeo, skinMat, [side * 0.260, 0.865, -0.005]);

      // 6E. ARTICULATED HAND & FINGERS (Anatomical Palm, Opposed Thumb & 4 Curled Fingers)
      const palmGeo = new THREE.SphereGeometry(1, 20, 16);
      palmGeo.scale(0.024, 0.042, 0.036);
      addSkinMesh(palmGeo, skinMat, [side * 0.264, 0.825, 0.005]);

      const thenarGeo = new THREE.SphereGeometry(0.015, 14, 12);
      addSkinMesh(thenarGeo, skinMat, [side * 0.250, 0.835, 0.022]);

      const hypothenarGeo = new THREE.SphereGeometry(0.013, 14, 12);
      addSkinMesh(hypothenarGeo, skinMat, [side * 0.276, 0.825, 0.005]);

      // Opposed Anatomical Thumb (Angled naturally forward and outward)
      const thumbProxGeo = new THREE.CylinderGeometry(0.0065, 0.0055, 0.026, 12);
      addSkinMesh(thumbProxGeo, skinMat, [side * 0.242, 0.815, 0.030], [0.35, side * 0.25, side * -0.55]);

      const thumbDistGeo = new THREE.CylinderGeometry(0.0055, 0.0045, 0.020, 12);
      addSkinMesh(thumbDistGeo, skinMat, [side * 0.238, 0.796, 0.038], [0.55, side * 0.25, side * -0.45]);

      // Four Articulated Anatomical Fingers (Index, Middle, Ring, Pinky in relaxed curve)
      const fingers = [
        { name: "index",  xOff: 0.252, yTop: 0.802, len: 0.072, rad: 0.0055, zOff: 0.014 },
        { name: "middle", xOff: 0.262, yTop: 0.800, len: 0.078, rad: 0.0058, zOff: 0.012 },
        { name: "ring",   xOff: 0.271, yTop: 0.802, len: 0.072, rad: 0.0054, zOff: 0.009 },
        { name: "pinky",  xOff: 0.279, yTop: 0.805, len: 0.058, rad: 0.0048, zOff: 0.006 }
      ];

      fingers.forEach(f => {
        const proxGeo = new THREE.CylinderGeometry(f.rad, f.rad * 0.92, f.len * 0.52, 12);
        addSkinMesh(proxGeo, skinMat, [side * f.xOff, f.yTop - f.len * 0.26, f.zOff], [0.12, 0, 0]);

        const distGeo = new THREE.CylinderGeometry(f.rad * 0.92, f.rad * 0.75, f.len * 0.48, 12);
        addSkinMesh(distGeo, skinMat, [side * f.xOff, f.yTop - f.len * 0.72, f.zOff + 0.006], [0.32, 0, 0]);
      });
    });

    // ----------------------------------------------------
    // 7. LOWER LIMBS & ARTICULATED FEET (NO FLAT BOXES!)
    // ----------------------------------------------------
    [-1, 1].forEach(side => {
      // 7A. Thigh (Femur region) with Quadriceps Muscle Group
      const thighGeo = new THREE.CylinderGeometry(0.086, 0.062, 0.40, 28);
      addSkinMesh(thighGeo, skinMat, [side * 0.092, 0.71, 0.005]);

      // Rectus femoris anterior swell
      const rectusGeo = new THREE.SphereGeometry(1, 20, 16);
      rectusGeo.scale(0.045, 0.16, 0.042);
      addSkinMesh(rectusGeo, skinMat, [side * 0.092, 0.72, 0.048]);

      // Vastus lateralis side sweep
      const vastusLatGeo = new THREE.SphereGeometry(1, 18, 14);
      vastusLatGeo.scale(0.038, 0.14, 0.036);
      addSkinMesh(vastusLatGeo, skinMat, [side * 0.124, 0.70, 0.015]);

      // Vastus medialis teardrop bulge just above inner knee
      const vastusMedGeo = new THREE.SphereGeometry(1, 18, 14);
      vastusMedGeo.scale(0.032, 0.085, 0.032);
      addSkinMesh(vastusMedGeo, skinMat, [side * 0.064, 0.56, 0.038]);

      // Hamstrings posterior curve
      const hamstringsGeo = new THREE.SphereGeometry(1, 20, 16);
      hamstringsGeo.scale(0.042, 0.15, 0.040);
      addSkinMesh(hamstringsGeo, skinMat, [side * 0.092, 0.71, -0.042]);

      // 7B. Knee Joint & Patella (Kneecap) Plate
      const kneeGeo = new THREE.CylinderGeometry(0.062, 0.058, 0.08, 24);
      addSkinMesh(kneeGeo, skinMat, [side * 0.092, 0.51, 0.005]);

      const patellaGeo = new THREE.SphereGeometry(1, 18, 14);
      patellaGeo.scale(0.024, 0.032, 0.016);
      addSkinMesh(patellaGeo, skinMat, [side * 0.092, 0.515, 0.052]);

      // 7C. Lower Leg / Calf (Crus) with Gastrocnemius Muscle Bellies & Achilles
      const calfGeo = new THREE.CylinderGeometry(0.058, 0.038, 0.38, 28);
      addSkinMesh(calfGeo, skinMat, [side * 0.092, 0.30, -0.010]);

      // Medial calf belly (fuller and lower)
      const gastrocMedGeo = new THREE.SphereGeometry(1, 20, 16);
      gastrocMedGeo.scale(0.032, 0.090, 0.042);
      addSkinMesh(gastrocMedGeo, skinMat, [side * 0.075, 0.35, -0.042]);

      // Lateral calf belly
      const gastrocLatGeo = new THREE.SphereGeometry(1, 20, 16);
      gastrocLatGeo.scale(0.028, 0.085, 0.038);
      addSkinMesh(gastrocLatGeo, skinMat, [side * 0.110, 0.37, -0.040]);

      // Tibial anterior crest (shin bone ridge)
      const shinGeo = new THREE.CylinderGeometry(0.008, 0.007, 0.30, 14);
      addSkinMesh(shinGeo, skinMat, [side * 0.092, 0.30, 0.036]);

      // Achilles tendon posterior cord
      const achillesGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.18, 16);
      addSkinMesh(achillesGeo, skinMat, [side * 0.092, 0.18, -0.048]);

      // 7D. Ankle Malleoli (Medial higher, lateral lower)
      const medialMalleolusGeo = new THREE.SphereGeometry(0.014, 14, 12);
      addSkinMesh(medialMalleolusGeo, skinMat, [side * 0.068, 0.115, -0.012]);

      const lateralMalleolusGeo = new THREE.SphereGeometry(0.014, 14, 12);
      addSkinMesh(lateralMalleolusGeo, skinMat, [side * 0.115, 0.096, -0.015]);

      // 7E. ARTICULATED FOOT (Heel, Plantar Arch, Dorsal Instep, Hallux & Toes)
      // Calcaneus (Heel bone prominence)
      const heelGeo = new THREE.SphereGeometry(1, 18, 14);
      heelGeo.scale(0.028, 0.032, 0.042);
      addSkinMesh(heelGeo, skinMat, [side * 0.092, 0.042, -0.058]);

      // Midfoot & Plantar Longitudinal Arch
      const midfootGeo = new THREE.CylinderGeometry(0.040, 0.046, 0.09, 20);
      midfootGeo.scale(1.0, 0.65, 1.4);
      addSkinMesh(midfootGeo, skinMat, [side * 0.092, 0.038, 0.010]);

      // Metatarsal Ball of the Foot
      const ballGeo = new THREE.SphereGeometry(1, 18, 14);
      ballGeo.scale(0.044, 0.020, 0.032);
      addSkinMesh(ballGeo, skinMat, [side * 0.092, 0.022, 0.065]);

      // Hallux (Big Toe on medial side)
      const bigToeGeo = new THREE.CylinderGeometry(0.0095, 0.0085, 0.032, 14);
      addSkinMesh(bigToeGeo, skinMat, [side * 0.072, 0.018, 0.095], [Math.PI * 0.5, 0, 0]);

      // Lateral 4 Toes
      const toes = [
        { x: 0.085, z: 0.096, len: 0.028, rad: 0.0075 },
        { x: 0.096, z: 0.094, len: 0.026, rad: 0.0070 },
        { x: 0.106, z: 0.088, len: 0.023, rad: 0.0065 },
        { x: 0.115, z: 0.080, len: 0.019, rad: 0.0058 }
      ];

      toes.forEach(t => {
        const toeGeo = new THREE.CylinderGeometry(t.rad, t.rad * 0.9, t.len, 12);
        addSkinMesh(toeGeo, skinMat, [side * t.x, 0.016, t.z], [Math.PI * 0.5, 0, 0]);
      });
    });

    // Final pass on all skin meshes
    this.systems.skin.traverse((child) => {
      if (child.isMesh) {
        child.userData = child.userData || {};
        child.userData.id = "skin";
        child.userData.system = "skin";
        child.userData.name = child.userData.name || "Integumentary Skin Shell";
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

  processSkinModel(scene) {
    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0.90, 0.0);

    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    meshes.forEach((child) => {
      const name = (child.name || '').toLowerCase();
      if (name.includes('areola') || name.includes('nipple')) {
        child.material = this.materials.areola;
      } else if (name.includes('duct') || name.includes('sinus')) {
        child.material = this.materials.fallopian;
      } else if (name.includes('lobe') || name.includes('gland')) {
        child.material = this.materials.mammary;
      } else {
        child.material = this.materials.skinPeach;
      }
      child.castShadow = true;
      child.userData = { id: 'mammary_glands', system: 'femaleMammary', name: child.name };
      this.systems.femaleMammary.add(child);
      this.registerClickableMesh(child);
    });
  }

  updateSkinMaterial(newMaterial) {
    if (this.systems.skin) {
      this.systems.skin.traverse((child) => {
        if (child.isMesh && !child.userData.preserveMaterial) {
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
