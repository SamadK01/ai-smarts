/**
 * BodyScope 3D - Photorealistic PBR Material Library
 * High-end Medical Visualization Shaders & Transmission Physical Materials
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';

// Global Cross-Section Clipping Plane
export const clippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10.0);

export class MaterialManager {
  constructor() {
    this.clippingEnabled = false;
    this.initMaterials();
  }

  initMaterials() {
    // 1. SKIN SHELL: Photorealistic Translucent Peach/Pink Physical Material
    this.skinPeach = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(CONFIG.skinModes.peach.color),
      roughness: CONFIG.skinModes.peach.roughness,
      metalness: 0.02,
      transmission: CONFIG.skinModes.peach.transmission,
      thickness: CONFIG.skinModes.peach.thickness,
      ior: 1.35,
      attenuationColor: new THREE.Color(CONFIG.skinModes.peach.attenuationColor),
      attenuationDistance: 1.5,
      transparent: true,
      opacity: CONFIG.skinModes.peach.opacity || 0.18,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide
    });

    // 2. SKIN SHELL: Cyan Blue X-Ray Hologram Mode
    this.skinXRay = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(CONFIG.skinModes.xray.color),
      emissive: new THREE.Color(0x0a2540),
      emissiveIntensity: 0.35,
      roughness: CONFIG.skinModes.xray.roughness,
      metalness: 0.05,
      transmission: CONFIG.skinModes.xray.transmission,
      thickness: CONFIG.skinModes.xray.thickness,
      ior: 1.35,
      attenuationColor: new THREE.Color(CONFIG.skinModes.xray.attenuationColor),
      attenuationDistance: 1.8,
      transparent: true,
      opacity: CONFIG.skinModes.xray.opacity || 0.22,
      depthWrite: false,
      depthTest: true,
      side: THREE.FrontSide
    });

    // 2b. SKIN SHELL: Realistic Human Flesh/Skin (Solid PBR Epidermis)
    this.skinRealistic = new THREE.MeshStandardMaterial({
      color: 0xefb8a5,
      roughness: 0.44,
      metalness: 0.02,
      transparent: false,
      opacity: 1.0,
      side: THREE.FrontSide
    });

    // Active skin material pointer
    this.skinActive = this.skinPeach;

    // 3. SKELETON: Polished Ivory Bone with subtle specular highlights
    this.bone = new THREE.MeshStandardMaterial({
      color: 0xf6f1e5,
      roughness: 0.35,
      metalness: 0.05,
      clippingPlanes: [clippingPlane],
      clipShadows: true
    });

    // 4. HIGHLIGHT SELECTION MATERIAL: Soft Electric Cyan Glow
    this.highlight = new THREE.MeshStandardMaterial({
      color: 0x2de2e6,
      emissive: 0x2de2e6,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.2,
      clippingPlanes: [clippingPlane]
    });

    // 5. CARDIOVASCULAR MATERIALS
    this.artery = new THREE.MeshStandardMaterial({
      color: 0xef233c,
      emissive: 0x900c1e,
      emissiveIntensity: 0.45,
      roughness: 0.22,
      metalness: 0.15,
      clippingPlanes: [clippingPlane]
    });

    this.vein = new THREE.MeshStandardMaterial({
      color: 0x1d64e8,
      emissive: 0x09307d,
      emissiveIntensity: 0.40,
      roughness: 0.22,
      metalness: 0.15,
      clippingPlanes: [clippingPlane]
    });

    this.heart = new THREE.MeshStandardMaterial({
      color: 0xba1a2b,
      emissive: 0x550a14,
      emissiveIntensity: 0.25,
      roughness: 0.28,
      metalness: 0.10,
      clippingPlanes: [clippingPlane]
    });

    // 6. RESPIRATORY MATERIALS
    this.lung = new THREE.MeshStandardMaterial({
      color: 0xe07a8b,
      emissive: 0x4a1820,
      emissiveIntensity: 0.15,
      roughness: 0.38,
      metalness: 0.04,
      transparent: true,
      opacity: 0.92,
      clippingPlanes: [clippingPlane]
    });

    this.trachea = new THREE.MeshStandardMaterial({
      color: 0xe8ddd0,
      roughness: 0.45,
      clippingPlanes: [clippingPlane]
    });

    // 7. DIGESTIVE ORGANS
    this.liver = new THREE.MeshStandardMaterial({
      color: 0x7c2424,
      emissive: 0x2d0808,
      emissiveIntensity: 0.15,
      roughness: 0.28,
      metalness: 0.08,
      clippingPlanes: [clippingPlane]
    });

    this.stomach = new THREE.MeshStandardMaterial({
      color: 0xdb826e,
      roughness: 0.38,
      clippingPlanes: [clippingPlane]
    });

    this.pancreas = new THREE.MeshStandardMaterial({
      color: 0xdfaa4d,
      roughness: 0.45,
      clippingPlanes: [clippingPlane]
    });

    this.spleen = new THREE.MeshStandardMaterial({
      color: 0x5a1928,
      roughness: 0.30,
      clippingPlanes: [clippingPlane]
    });

    this.gallbladder = new THREE.MeshStandardMaterial({
      color: 0x2e6e32,
      roughness: 0.25,
      clippingPlanes: [clippingPlane]
    });

    this.intestines = new THREE.MeshStandardMaterial({
      color: 0xcf7e68,
      roughness: 0.45,
      clippingPlanes: [clippingPlane]
    });

    // 8. RENAL MATERIALS
    this.kidney = new THREE.MeshStandardMaterial({
      color: 0x8b2222,
      roughness: 0.28,
      clippingPlanes: [clippingPlane]
    });

    this.bladder = new THREE.MeshStandardMaterial({
      color: 0xdfb47e,
      roughness: 0.35,
      transparent: true,
      opacity: 0.90,
      clippingPlanes: [clippingPlane]
    });

    // 9. NERVOUS MATERIALS
    this.brain = new THREE.MeshStandardMaterial({
      color: 0xe8a6a6,
      emissive: 0x3d1b1b,
      emissiveIntensity: 0.18,
      roughness: 0.45,
      metalness: 0.04,
      clippingPlanes: [clippingPlane]
    });

    this.nerve = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.85,
      roughness: 0.20,
      clippingPlanes: [clippingPlane]
    });

    // 10. MUSCLES (Maas / Striated Muscle)
    this.muscle = new THREE.MeshStandardMaterial({
      color: 0xaa3838,
      roughness: 0.52,
      metalness: 0.05,
      clippingPlanes: [clippingPlane]
    });

    // 11. FEMALE REPRODUCTIVE & MAMMARY MATERIALS
    this.uterus = new THREE.MeshStandardMaterial({
      color: 0xc84c68,
      roughness: 0.35,
      metalness: 0.05,
      clippingPlanes: [clippingPlane]
    });

    this.ovary = new THREE.MeshStandardMaterial({
      color: 0xf2a7b8,
      roughness: 0.30,
      metalness: 0.08,
      clippingPlanes: [clippingPlane]
    });

    this.fallopian = new THREE.MeshStandardMaterial({
      color: 0xd9687e,
      roughness: 0.38,
      clippingPlanes: [clippingPlane]
    });

    this.mammary = new THREE.MeshStandardMaterial({
      color: 0xf5989d,
      roughness: 0.32,
      metalness: 0.02,
      transparent: true,
      opacity: 0.88,
      clippingPlanes: [clippingPlane]
    });

    this.areola = new THREE.MeshStandardMaterial({
      color: 0xb55a68,
      roughness: 0.40,
      metalness: 0.02,
      clippingPlanes: [clippingPlane]
    });

    this.milk = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffae0,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.05
    });

    // 12. MALE REPRODUCTIVE MATERIALS
    this.testis = new THREE.MeshStandardMaterial({
      color: 0xc76a75,
      roughness: 0.35,
      clippingPlanes: [clippingPlane]
    });

    this.prostate = new THREE.MeshStandardMaterial({
      color: 0xa87050,
      roughness: 0.45,
      clippingPlanes: [clippingPlane]
    });

    this.penis = new THREE.MeshStandardMaterial({
      color: 0xb04558,
      roughness: 0.36,
      metalness: 0.04,
      clippingPlanes: [clippingPlane]
    });
  }

  setSkinMode(mode) {
    if (mode === "realistic") {
      this.skinActive = this.skinRealistic;
    } else if (mode === "xray") {
      this.skinActive = this.skinXRay;
    } else {
      this.skinActive = this.skinPeach;
    }
    return this.skinActive;
  }

  setSkinOpacity(val) {
    this.skinPeach.opacity = val;
    this.skinXRay.opacity = val;
    this.skinRealistic.opacity = val;
    if (val >= 0.8) {
      this.skinRealistic.transparent = false;
    } else {
      this.skinRealistic.transparent = true;
    }
  }

  setClipping(enabled, axis = "y", offset = 1.25) {
    this.clippingEnabled = enabled;
    if (!enabled) {
      clippingPlane.constant = 100.0;
      return;
    }

    if (axis === "x") {
      clippingPlane.normal.set(-1, 0, 0);
      clippingPlane.constant = offset;
    } else if (axis === "z") {
      clippingPlane.normal.set(0, 0, -1);
      clippingPlane.constant = offset;
    } else {
      // Y axis
      clippingPlane.normal.set(0, -1, 0);
      clippingPlane.constant = offset;
    }
  }

  /**
   * Automatically select best material for a mesh based on its name and system
   */
  getMaterialForNode(nodeName, system = "") {
    const n = (nodeName || "").toLowerCase();
    const s = (system || "").toLowerCase();

    // Female Reproductive & Breasts
    if (n.includes("mammary") || n.includes("breast") || n.includes("lactiferous")) return this.mammary;
    if (n.includes("areola") || n.includes("nipple")) return this.areola;
    if (n.includes("uterus") || n.includes("cervix") || n.includes("womb") || n.includes("vagina")) return this.uterus;
    if (n.includes("ovary") || n.includes("ovarium")) return this.ovary;
    if (n.includes("fallopian") || n.includes("tuba")) return this.fallopian;

    // Male Reproductive
    if (n.includes("testis") || n.includes("testicle") || n.includes("epididym")) return this.testis;
    if (n.includes("prostate") || n.includes("seminal")) return this.prostate;
    if (n.includes("penis") || n.includes("cavernosum") || n.includes("spongiosum") || n.includes("glans")) return this.penis;

    // Cardiovascular
    if (n.includes("artery") || n.includes("arteria") || n.includes("aorta")) return this.artery;
    if (n.includes("vein") || n.includes("vena") || n.includes("jugular")) return this.vein;
    if (n.includes("heart") || n.includes("cor") || n.includes("myocardi") || n.includes("ventric") || n.includes("atrium")) return this.heart;

    // Respiratory
    if (n.includes("lung") || n.includes("pulmo")) return this.lung;
    if (n.includes("trachea") || n.includes("bronch") || n.includes("larynx")) return this.trachea;

    // Digestive
    if (n.includes("liver") || n.includes("hepar")) return this.liver;
    if (n.includes("stomach") || n.includes("gaster")) return this.stomach;
    if (n.includes("pancrea")) return this.pancreas;
    if (n.includes("spleen") || n.includes("splen") || n.includes("lien")) return this.spleen;
    if (n.includes("gall") || n.includes("biliar")) return this.gallbladder;
    if (n.includes("intestin") || n.includes("colon") || n.includes("cecum") || n.includes("duoden")) return this.intestines;

    // Renal
    if (n.includes("kidney") || n.includes("ren") || n.includes("neph")) return this.kidney;
    if (n.includes("bladder") || n.includes("ureter")) return this.bladder;

    // Nervous
    if (n.includes("brain") || n.includes("cerebr") || n.includes("encephalon")) return this.brain;
    if (n.includes("nerve") || n.includes("spinal_cord") || n.includes("plexus")) return this.nerve;

    // Muscles
    if (n.includes("muscle") || s.includes("muscular")) return this.muscle;

    // Skin
    if (n.includes("skin") || n.includes("body") || n.includes("integument")) return this.skinActive;

    // Default to Bone for skeletal meshes
    return this.bone;
  }
}

