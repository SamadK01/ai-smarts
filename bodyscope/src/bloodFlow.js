/**
 * BodyScope 3D - High-Performance Blood Flow & Circulation Simulation
 * Instanced Glowing Arterial & Venous Particles + "Blood Path" Tour
 */

import * as THREE from 'three';

export class BloodFlowSimulation {
  constructor(scene, sceneManager) {
    this.scene = scene;
    this.sceneManager = sceneManager;

    this.particleCount = 1400;
    this.arterialCount = 800;
    this.venousCount = 600;

    this.curves = [];
    this.particles = [];
    this.pulseWave = 0.0;
    this.bloodPathActive = false;
    this.pathTimer = 0.0;

    this.initCenterlineCurves();
    this.initInstancedMesh();
  }

  initCenterlineCurves() {
    // 1. Systemic Arterial Branches (Carotid, Brachial/Radial, Abdominal/Femoral)
    // Head / Carotids (Heart -> Head)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 1.30, 0.02),   // Aortic arch
        new THREE.Vector3(0.02, 1.40, 0.01),  // Common carotid
        new THREE.Vector3(0.04, 1.52, 0.02),  // Internal carotid
        new THREE.Vector3(0.02, 1.62, 0.04),  // Cerebral Circle of Willis
        new THREE.Vector3(0.0, 1.65, 0.02)
      ])
    });

    // Right Arm / Radial (Aorta -> Subclavian -> Brachial -> Hand)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 1.30, 0.02),
        new THREE.Vector3(0.12, 1.32, 0.0),   // Subclavian R
        new THREE.Vector3(0.24, 1.25, 0.0),   // Axillary R
        new THREE.Vector3(0.28, 1.10, 0.0),   // Brachial R
        new THREE.Vector3(0.32, 0.95, 0.02),  // Radial / Ulnar R
        new THREE.Vector3(0.36, 0.82, 0.02),  // Deep palmar arch R
        new THREE.Vector3(0.38, 0.78, 0.02)   // Digital arteries
      ])
    });

    // Left Arm / Radial (Aorta -> Hand L)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 1.30, 0.02),
        new THREE.Vector3(-0.12, 1.32, 0.0),
        new THREE.Vector3(-0.24, 1.25, 0.0),
        new THREE.Vector3(-0.28, 1.10, 0.0),
        new THREE.Vector3(-0.32, 0.95, 0.02),
        new THREE.Vector3(-0.36, 0.82, 0.02),
        new THREE.Vector3(-0.38, 0.78, 0.02)
      ])
    });

    // Descending Aorta & Lower Extremities (Aorta -> Femoral -> Dorsalis Pedis)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 1.30, 0.02),
        new THREE.Vector3(-0.01, 1.18, -0.01), // Thoracic aorta
        new THREE.Vector3(0.0, 1.05, -0.01),   // Abdominal aorta
        new THREE.Vector3(0.06, 0.95, 0.0),    // Common iliac R
        new THREE.Vector3(0.10, 0.82, 0.02),   // Femoral artery R
        new THREE.Vector3(0.09, 0.60, 0.0),    // Popliteal R
        new THREE.Vector3(0.08, 0.35, -0.01),  // Posterior tibial R
        new THREE.Vector3(0.07, 0.08, 0.08)    // Dorsalis pedis / Plantar arch R
      ])
    });

    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.0, 1.30, 0.02),
        new THREE.Vector3(-0.01, 1.18, -0.01),
        new THREE.Vector3(0.0, 1.05, -0.01),
        new THREE.Vector3(-0.06, 0.95, 0.0),   // Common iliac L
        new THREE.Vector3(-0.10, 0.82, 0.02),  // Femoral artery L
        new THREE.Vector3(-0.09, 0.60, 0.0),   // Popliteal L
        new THREE.Vector3(-0.08, 0.35, -0.01), // Posterior tibial L
        new THREE.Vector3(-0.07, 0.08, 0.08)   // Dorsalis pedis / Plantar arch L
      ])
    });

    // Pulmonary Circuit: Heart -> Lungs
    this.curves.push({
      type: 'pulmonary',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.01, 1.28, 0.03),   // Right Ventricle / Pulmonary Trunk
        new THREE.Vector3(0.06, 1.31, 0.0),    // Right pulmonary artery
        new THREE.Vector3(0.10, 1.30, -0.02)   // Lung parenchyma
      ])
    });

    // 2. Systemic Venous Return Curves (Back to Right Atrium)
    // Superior Vena Cava (Head/Arms -> Heart)
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.02, 1.62, 0.04),   // Jugular bulb
        new THREE.Vector3(0.03, 1.48, 0.02),   // Internal jugular vein
        new THREE.Vector3(0.02, 1.38, 0.01),   // Brachiocephalic vein
        new THREE.Vector3(0.02, 1.30, 0.01),   // Superior vena cava
        new THREE.Vector3(0.01, 1.27, 0.01)    // Right atrium
      ])
    });

    // Inferior Vena Cava (Legs/Abdomen -> Heart)
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.07, 0.08, 0.08),   // Foot veins
        new THREE.Vector3(0.08, 0.40, 0.0),    // Great saphenous vein
        new THREE.Vector3(0.09, 0.80, 0.02),   // Femoral vein
        new THREE.Vector3(0.05, 0.96, 0.0),    // Common iliac vein
        new THREE.Vector3(0.02, 1.12, -0.01),  // IVC
        new THREE.Vector3(0.02, 1.22, 0.0),    // Hepatic vein confluence
        new THREE.Vector3(0.01, 1.27, 0.01)    // Right atrium
      ])
    });
  }

  initInstancedMesh() {
    const geom = new THREE.SphereGeometry(0.0055, 8, 6);

    // Glowing particle material
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });

    this.instancedMesh = new THREE.InstancedMesh(geom, this.material, this.particleCount);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.instancedMesh);

    const dummy = new THREE.Object3D();
    const colorArtery = new THREE.Color(0xff2238);
    const colorVein = new THREE.Color(0x2563eb);
    const colorPulmonary = new THREE.Color(0x9333ea);

    for (let i = 0; i < this.particleCount; i++) {
      const curveIndex = i % this.curves.length;
      const cObj = this.curves[curveIndex];
      const t = Math.random();

      this.particles.push({
        curveIndex,
        t,
        speed: 0.12 + Math.random() * 0.08,
        type: cObj.type
      });

      let col = colorArtery;
      if (cObj.type === 'vein') col = colorVein;
      if (cObj.type === 'pulmonary') col = colorPulmonary;

      this.instancedMesh.setColorAt(i, col);
      dummy.position.set(0, 0, 0);
      dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    this.instancedMesh.instanceColor.needsUpdate = true;
  }

  update(delta, bpm, glucose) {
    if (!this.instancedMesh || !this.instancedMesh.visible) return;

    // Pulse wave speed factor proportional to heart rate
    const bpmFactor = bpm / 72.0;
    // High glucose increases fluid viscosity (slight slowdown)
    const glucoseViscosity = glucose > 180 ? 0.88 : 1.0;
    const speedMult = bpmFactor * glucoseViscosity;

    this.pulseWave = (this.pulseWave + delta * (bpm / 60.0)) % 1.0;

    const dummy = new THREE.Object3D();
    const pos = new THREE.Vector3();

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particles[i];
      p.t = (p.t + delta * p.speed * speedMult) % 1.0;

      const curve = this.curves[p.curveIndex].curve;
      curve.getPointAt(p.t, pos);

      dummy.position.copy(pos);

      // Pulse wave scale expansion during systole
      const isArtery = p.type === 'artery';
      const wavePhase = Math.sin((p.t * 3.0 - this.pulseWave * Math.PI * 2));
      const scale = isArtery ? 1.0 + Math.max(0, wavePhase) * 0.65 : 0.95;

      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Tour: "Blood Path" closed loop circulation camera tracking
    if (this.bloodPathActive) {
      this.updateBloodPath(delta);
    }
  }

  startBloodPath() {
    this.bloodPathActive = true;
    this.pathTimer = 0.0;
  }

  stopBloodPath() {
    this.bloodPathActive = false;
  }

  updateBloodPath(delta) {
    this.pathTimer += delta * 0.18; // ~25s for full anatomical circulation loop
    const loopT = this.pathTimer % 1.0;

    // Waypoints along anatomical circulation circuit:
    // 0.0: Right Ventricle (0, 1.28, 0.03)
    // 0.2: Lungs (0.12, 1.32, -0.02)
    // 0.4: Left Ventricle (0, 1.28, 0.01)
    // 0.6: Systemic Aorta / Carotid (0, 1.55, 0.02)
    // 0.8: Lower Systemic Capillaries (0.05, 0.40, 0.0)
    // 1.0: Vena Cava / Right Atrium (0.01, 1.27, 0.01)

    let target = new THREE.Vector3(0, 1.28, 0);
    if (loopT < 0.2) {
      // Pulmonary outflow
      target.set(0.08, 1.32, 0.0);
    } else if (loopT < 0.4) {
      // Left Heart / Aortic root
      target.set(0.0, 1.28, 0.02);
    } else if (loopT < 0.6) {
      // Cerebral Perfusion
      target.set(0.0, 1.55, 0.02);
    } else if (loopT < 0.8) {
      // Systemic lower limbs
      target.set(0.06, 0.45, 0.0);
    } else {
      // Venous return into IVC / SVC
      target.set(0.01, 1.27, 0.01);
    }

    this.sceneManager.controls.target.lerp(target, 0.05);
  }

  setVisible(visible) {
    if (this.instancedMesh) {
      this.instancedMesh.visible = visible;
    }
  }
}

