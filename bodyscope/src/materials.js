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
      ior: 1.45,
      attenuationColor: new THREE.Color(CONFIG.skinModes.peach.attenuationColor),
      attenuationDistance: 2.2,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 2. SKIN SHELL: Cyan Blue X-Ray Hologram Mode
    this.skinXRay = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(CONFIG.skinModes.xray.color),
      emissive: new THREE.Color(0x0a2540),
      emissiveIntensity: 0.45,
      roughness: CONFIG.skinModes.xray.roughness,
      metalness: 0.05,
      transmission: CONFIG.skinModes.xray.transmission,
      thickness: CONFIG.skinModes.xray.thickness,
      ior: 1.45,
      attenuationColor: new THREE.Color(CONFIG.skinModes.xray.attenuationColor),
      attenuationDistance: 2.0,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Active skin material pointer
    this.skinActive = this.skinPeach;

    // 3. SKELETON: Polished Ivory Bone with subtle specular highlights
    this.bone = new THREE.MeshStandardMaterial({
      color: 0xf3eedf,
      roughness: 0.38,
      metalness: 0.06,
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
      color: 0xe52538,
      emissive: 0x800816,
      emissiveIntensity: 0.40,
      roughness: 0.25,
      metalness: 0.12,
      clippingPlanes: [clippingPlane]
    });

    this.vein = new THREE.MeshStandardMaterial({
      color: 0x1e50bb,
      emissive: 0x0c2560,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.12,
      clippingPlanes: [clippingPlane]
    });

    this.heart = new THREE.MeshStandardMaterial({
      color: 0xa81c2d,
      roughness: 0.32,
      metalness: 0.08,
      clippingPlanes: [clippingPlane]
    });

    // 6. RESPIRATORY MATERIALS
    this.lung = new THREE.MeshStandardMaterial({
      color: 0xd47b85,
      roughness: 0.45,
      metalness: 0.04,
      transparent: true,
      opacity: 0.88,
      clippingPlanes: [clippingPlane]
    });

    this.trachea = new THREE.MeshStandardMaterial({
      color: 0xe2d6c9,
      roughness: 0.5,
      clippingPlanes: [clippingPlane]
    });

    // 7. DIGESTIVE ORGANS
    this.liver = new THREE.MeshStandardMaterial({
      color: 0x6e2727,
      roughness: 0.35,
      metalness: 0.05,
      clippingPlanes: [clippingPlane]
    });

    this.stomach = new THREE.MeshStandardMaterial({
      color: 0xcf7a65,
      roughness: 0.40,
      clippingPlanes: [clippingPlane]
    });

    this.pancreas = new THREE.MeshStandardMaterial({
      color: 0xd9a84e,
      roughness: 0.52,
      clippingPlanes: [clippingPlane]
    });

    this.spleen = new THREE.MeshStandardMaterial({
      color: 0x581e2e,
      roughness: 0.36,
      clippingPlanes: [clippingPlane]
    });

    this.gallbladder = new THREE.MeshStandardMaterial({
      color: 0x3d6e35,
      roughness: 0.30,
      clippingPlanes: [clippingPlane]
    });

    this.intestines = new THREE.MeshStandardMaterial({
      color: 0xc98063,
      roughness: 0.50,
      clippingPlanes: [clippingPlane]
    });

    // 8. RENAL MATERIALS
    this.kidney = new THREE.MeshStandardMaterial({
      color: 0x7b2828,
      roughness: 0.32,
      clippingPlanes: [clippingPlane]
    });

    this.bladder = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.38,
      transparent: true,
      opacity: 0.85,
      clippingPlanes: [clippingPlane]
    });

    // 9. NERVOUS MATERIALS
    this.brain = new THREE.MeshStandardMaterial({
      color: 0xdfa5a5,
      roughness: 0.55,
      metalness: 0.04,
      clippingPlanes: [clippingPlane]
    });

    this.nerve = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.70,
      roughness: 0.22,
      clippingPlanes: [clippingPlane]
    });

    // 10. MUSCLES
    this.muscle = new THREE.MeshStandardMaterial({
      color: 0xa8423f,
      roughness: 0.65,
      metalness: 0.05,
      transparent: true,
      opacity: 0.62,
      clippingPlanes: [clippingPlane]
    });
  }

  setSkinMode(mode) {
    if (mode === "xray") {
      this.skinActive = this.skinXRay;
    } else {
      this.skinActive = this.skinPeach;
    }
    return this.skinActive;
  }

  setSkinOpacity(val) {
    this.skinPeach.opacity = val;
    this.skinXRay.opacity = val;
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
