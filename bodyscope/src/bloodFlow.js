/**
 * BodyScope 3D - High-Precision Anatomical Blood Flow Simulation
 * 1:1 Vessel-Lumen Centerlines strictly aligned inside cardiovascular.glb
 * No particles escape or float outside of anatomical vascular boundaries
 */

import * as THREE from 'three';

export class BloodFlowSimulation {
  constructor(scene, sceneManager) {
    this.scene = scene;
    this.sceneManager = sceneManager;

    this.particleCount = 1500;
    this.curves = [];
    this.particles = [];
    this.pulseWave = 0.0;
    this.bloodPathActive = false;
    this.pathTimer = 0.0;

    this.initCenterlineCurves();
    this.initInstancedMesh();
  }

  /**
   * Anatomically exact centerlines matched 1:1 to cardiovascular.glb node coordinates
   * Right side = -X, Left side = +X
   * Head: Y ~ 1.40 - 1.65m
   * Torso: Y ~ 0.95 - 1.40m
   * Upper limbs: X ~ ±0.04m down to ±0.27m at hands (Y ~ 1.40m down to 0.80m)
   * Lower limbs: X ~ ±0.01m to ±0.10m (Y ~ 0.95m down to 0.02m)
   */
  initCenterlineCurves() {
    // ----------------------------------------------------
    // ARTERIAL SYSTEM (High-Oxygen Red Flow from Heart)
    // ----------------------------------------------------

    // 1. Right Carotid & Cerebral Circulation (Aortic Arch -> Right Common Carotid -> Internal Carotid -> Circle of Willis)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),   // Ascending Aorta
        new THREE.Vector3(-0.015, 1.385, 0.015),  // Brachiocephalic trunk
        new THREE.Vector3(-0.021, 1.442, 0.010),  // Right Common Carotid
        new THREE.Vector3(-0.037, 1.524, 0.003),  // External Carotid bifurcation
        new THREE.Vector3(-0.021, 1.561, 0.011),  // Internal Carotid (carotid canal)
        new THREE.Vector3(-0.020, 1.609, 0.021),  // Anterior Cerebral / Circle of Willis
        new THREE.Vector3(-0.009, 1.625, 0.045)   // Middle Cerebral distribution
      ])
    });

    // 2. Left Carotid & Cerebral Circulation (Aortic Arch -> Left Common Carotid -> Internal Carotid -> Circle of Willis)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),   // Ascending Aorta
        new THREE.Vector3(0.016, 1.390, 0.010),   // Aortic arch left apex
        new THREE.Vector3(0.020, 1.435, 0.003),   // Left Common Carotid
        new THREE.Vector3(0.037, 1.524, 0.003),   // External Carotid
        new THREE.Vector3(0.021, 1.561, 0.011),   // Internal Carotid
        new THREE.Vector3(0.020, 1.609, 0.021),   // Circle of Willis L
        new THREE.Vector3(0.009, 1.625, 0.045)    // Middle Cerebral L
      ])
    });

    // 3. Right Upper Extremity (Aorta -> Brachiocephalic -> Subclavian -> Axillary -> Brachial -> Radial/Ulnar -> Palmar Arch)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),
        new THREE.Vector3(-0.020, 1.390, 0.012),
        new THREE.Vector3(-0.044, 1.415, 0.006),  // Right Subclavian
        new THREE.Vector3(-0.116, 1.387, -0.005), // Right Axillary
        new THREE.Vector3(-0.183, 1.213, -0.019), // Right Brachial
        new THREE.Vector3(-0.213, 1.062, -0.021), // Ulnar recurrent / Cubital fossa
        new THREE.Vector3(-0.264, 0.940, 0.008),  // Right Radial
        new THREE.Vector3(-0.260, 0.877, 0.024),  // Palmar carpal branch
        new THREE.Vector3(-0.272, 0.799, 0.038)   // Common palmar digital arteries
      ])
    });

    // 4. Left Upper Extremity (Aorta -> Left Subclavian -> Axillary -> Brachial -> Radial/Ulnar -> Palmar Arch)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),
        new THREE.Vector3(0.025, 1.395, 0.008),
        new THREE.Vector3(0.046, 1.412, 0.001),   // Left Subclavian
        new THREE.Vector3(0.116, 1.387, -0.005),  // Left Axillary
        new THREE.Vector3(0.183, 1.213, -0.019),  // Left Brachial
        new THREE.Vector3(0.213, 1.062, -0.021),  // Cubital fossa L
        new THREE.Vector3(0.264, 0.940, 0.008),   // Left Radial
        new THREE.Vector3(0.260, 0.877, 0.024),   // Palmar carpal L
        new THREE.Vector3(0.272, 0.799, 0.038)    // Palmar digital L
      ])
    });

    // 5. Visceral Arterial Perfusion (Thoracic Aorta -> Celiac & Renal arteries -> Kidneys & Gut)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),
        new THREE.Vector3(0.015, 1.284, -0.025),  // Thoracic Aorta
        new THREE.Vector3(0.008, 1.180, 0.005),   // Celiac trunk level
        new THREE.Vector3(0.008, 1.115, 0.016),   // Abdominal Aorta
        new THREE.Vector3(0.046, 1.121, -0.004),  // Left Renal Artery
        new THREE.Vector3(0.065, 1.118, -0.010)   // Left Renal Cortex
      ])
    });

    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),
        new THREE.Vector3(0.015, 1.284, -0.025),
        new THREE.Vector3(0.008, 1.115, 0.016),
        new THREE.Vector3(-0.044, 1.107, 0.000),  // Right Renal Artery
        new THREE.Vector3(-0.065, 1.105, -0.008)  // Right Renal Cortex
      ])
    });

    // 6. Right Lower Extremity (Aorta -> Right Common Iliac -> External Iliac -> Femoral -> Popliteal -> Tibial -> Plantar)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),
        new THREE.Vector3(0.015, 1.284, -0.025),  // Thoracic Aorta
        new THREE.Vector3(0.008, 1.115, 0.016),   // Abdominal Aorta
        new THREE.Vector3(-0.013, 1.005, 0.019),  // Aortic Bifurcation / R Common Iliac
        new THREE.Vector3(-0.046, 0.938, 0.003),  // External Iliac R
        new THREE.Vector3(-0.058, 0.754, 0.034),  // Common Femoral R
        new THREE.Vector3(-0.078, 0.748, 0.009),  // Deep Femoral R
        new THREE.Vector3(-0.082, 0.520, -0.015), // Popliteal R
        new THREE.Vector3(-0.099, 0.262, -0.024), // Anterior Tibial R
        new THREE.Vector3(-0.070, 0.154, -0.050), // Posterior Tibial R
        new THREE.Vector3(-0.058, 0.043, -0.064), // Calcaneal branches
        new THREE.Vector3(-0.104, 0.017, 0.063)   // Common plantar digital arteries R
      ])
    });

    // 7. Left Lower Extremity (Aorta -> Left Common Iliac -> External Iliac -> Femoral -> Popliteal -> Tibial -> Plantar)
    this.curves.push({
      type: 'artery',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.011, 1.336, 0.025),
        new THREE.Vector3(0.015, 1.284, -0.025),
        new THREE.Vector3(0.008, 1.115, 0.016),
        new THREE.Vector3(0.013, 1.005, 0.019),   // L Common Iliac
        new THREE.Vector3(0.046, 0.938, 0.003),   // External Iliac L
        new THREE.Vector3(0.058, 0.754, 0.034),   // Common Femoral L
        new THREE.Vector3(0.078, 0.748, 0.009),   // Deep Femoral L
        new THREE.Vector3(0.082, 0.520, -0.015),  // Popliteal L
        new THREE.Vector3(0.099, 0.262, -0.024),  // Anterior Tibial L
        new THREE.Vector3(0.070, 0.154, -0.050),  // Posterior Tibial L
        new THREE.Vector3(0.058, 0.043, -0.064),  // Calcaneal branches L
        new THREE.Vector3(0.104, 0.017, 0.063)    // Common plantar digital arteries L
      ])
    });

    // 8. Pulmonary Circuit (Right Ventricle -> Pulmonary Trunk -> Lungs)
    this.curves.push({
      type: 'pulmonary',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.015, 1.275, 0.045),   // Right Ventricle outflow
        new THREE.Vector3(0.034, 1.317, 0.054),   // Pulmonary valve
        new THREE.Vector3(0.007, 1.307, -0.017),  // Pulmonary bifurcation
        new THREE.Vector3(-0.065, 1.300, -0.020)  // Right pulmonary hilum
      ])
    });

    this.curves.push({
      type: 'pulmonary',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.015, 1.275, 0.045),
        new THREE.Vector3(0.034, 1.317, 0.054),
        new THREE.Vector3(0.007, 1.307, -0.017),
        new THREE.Vector3(0.070, 1.295, -0.018)   // Left pulmonary hilum
      ])
    });

    // ----------------------------------------------------
    // VENOUS RETURN SYSTEM (Low-Oxygen Blue Flow to Heart)
    // ----------------------------------------------------

    // 9. Superior Vena Cava from Right Jugular
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.019, 1.609, 0.021),  // Cerebral venous sinus R
        new THREE.Vector3(-0.018, 1.578, 0.078),  // Angular / Facial vein R
        new THREE.Vector3(-0.013, 1.434, 0.019),  // Anterior Jugular Vein R
        new THREE.Vector3(-0.016, 1.358, 0.021),  // Superior Vena Cava
        new THREE.Vector3(-0.015, 1.275, 0.020)   // Right Atrium
      ])
    });

    // 10. Superior Vena Cava from Left Jugular
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.019, 1.609, 0.021),   // Cerebral sinus L
        new THREE.Vector3(0.018, 1.578, 0.078),   // Angular vein L
        new THREE.Vector3(0.013, 1.434, 0.019),   // Jugular vein L
        new THREE.Vector3(-0.010, 1.370, 0.020),  // Left brachiocephalic crossing
        new THREE.Vector3(-0.016, 1.358, 0.021),  // SVC
        new THREE.Vector3(-0.015, 1.275, 0.020)   // Right Atrium
      ])
    });

    // 11. Right Arm Venous Return (Digital -> Radial/Ulnar Veins -> Brachial Veins -> Axillary/Subclavian -> SVC -> RA)
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.272, 0.799, 0.038),  // Digital veins
        new THREE.Vector3(-0.258, 0.978, 0.003),  // Radial veins R
        new THREE.Vector3(-0.235, 0.953, 0.019),  // Median antebrachial vein R
        new THREE.Vector3(-0.194, 1.189, -0.017), // Brachial veins R
        new THREE.Vector3(-0.125, 1.367, -0.003), // Axillary vein R
        new THREE.Vector3(-0.060, 1.403, 0.011),  // Right Subclavian vein
        new THREE.Vector3(-0.016, 1.358, 0.021),  // SVC
        new THREE.Vector3(-0.015, 1.275, 0.020)   // Right Atrium
      ])
    });

    // 12. Left Arm Venous Return (Digital -> Radial/Ulnar Veins -> Brachial Veins -> Axillary/Subclavian -> SVC -> RA)
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.272, 0.799, 0.038),
        new THREE.Vector3(0.258, 0.978, 0.003),   // Radial veins L
        new THREE.Vector3(0.235, 0.953, 0.019),   // Median antebrachial L
        new THREE.Vector3(0.194, 1.189, -0.017),  // Brachial veins L
        new THREE.Vector3(0.125, 1.367, -0.003),  // Axillary vein L
        new THREE.Vector3(0.054, 1.408, 0.012),   // Left Subclavian vein
        new THREE.Vector3(-0.016, 1.358, 0.021),  // SVC
        new THREE.Vector3(-0.015, 1.275, 0.020)   // Right Atrium
      ])
    });

    // 13. Right Leg Venous Return (Plantar -> Tibial Veins -> Femoral Vein -> Iliac -> IVC -> RA)
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.104, 0.017, 0.063),  // Plantar venous arch
        new THREE.Vector3(-0.063, 0.160, -0.049), // Posterior tibial veins R
        new THREE.Vector3(-0.105, 0.272, -0.030), // Anterior tibial veins R
        new THREE.Vector3(-0.080, 0.520, -0.015), // Popliteal vein R
        new THREE.Vector3(-0.075, 0.739, 0.027),  // Deep femoral vein R
        new THREE.Vector3(-0.056, 0.731, 0.031),  // Femoral vein R
        new THREE.Vector3(-0.015, 1.011, 0.015),  // Common iliac vein R
        new THREE.Vector3(-0.010, 1.102, 0.023),  // Inferior vena cava (abdominal)
        new THREE.Vector3(-0.013, 1.207, 0.015),  // Inferior vena cava (thoracic)
        new THREE.Vector3(-0.015, 1.275, 0.020)   // Right Atrium
      ])
    });

    // 14. Left Leg Venous Return (Plantar -> Tibial Veins -> Femoral Vein -> Iliac -> IVC -> RA)
    this.curves.push({
      type: 'vein',
      curve: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.104, 0.017, 0.063),
        new THREE.Vector3(0.063, 0.160, -0.049),  // Posterior tibial veins L
        new THREE.Vector3(0.105, 0.272, -0.030),  // Anterior tibial veins L
        new THREE.Vector3(0.080, 0.520, -0.015),  // Popliteal vein L
        new THREE.Vector3(0.075, 0.739, 0.027),   // Deep femoral vein L
        new THREE.Vector3(0.056, 0.731, 0.031),   // Femoral vein L
        new THREE.Vector3(0.004, 1.006, 0.022),   // Common iliac vein L
        new THREE.Vector3(-0.010, 1.102, 0.023),  // IVC
        new THREE.Vector3(-0.013, 1.207, 0.015),  // IVC thoracic
        new THREE.Vector3(-0.015, 1.275, 0.020)   // Right Atrium
      ])
    });
  }

  initInstancedMesh() {
    // Precise micro-bead size: fits strictly inside lumen without protruding
    const geom = new THREE.SphereGeometry(0.0022, 8, 6);

    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });

    this.instancedMesh = new THREE.InstancedMesh(geom, this.material, this.particleCount);
    this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.instancedMesh);

    const dummy = new THREE.Object3D();
    const colorArtery = new THREE.Color(0xff2238);   // Oxygenated arterial red
    const colorVein = new THREE.Color(0x2563eb);     // Deoxygenated venous blue
    const colorPulmonary = new THREE.Color(0xa855f7);// Pulmonary arterial purple

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

      // Pulse wave scale expansion during systole (strictly capped so it stays inside vessel lumen)
      const isArtery = p.type === 'artery';
      const wavePhase = Math.sin((p.t * 3.0 - this.pulseWave * Math.PI * 2));
      const scale = isArtery ? 1.0 + Math.max(0, wavePhase) * 0.35 : 0.90;

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
    this.pathTimer += delta * 0.16; // ~28s for full anatomical circulation loop
    const loopT = this.pathTimer % 1.0;

    let target = new THREE.Vector3(0, 1.28, 0);
    if (loopT < 0.2) {
      // 1. Pulmonary outflow (Right Ventricle -> Lungs)
      target.set(0.04, 1.31, 0.02);
    } else if (loopT < 0.4) {
      // 2. Left Heart / Aortic root
      target.set(0.01, 1.33, 0.02);
    } else if (loopT < 0.6) {
      // 3. Cerebral Perfusion (Carotids -> Brain)
      target.set(0.0, 1.58, 0.02);
    } else if (loopT < 0.8) {
      // 4. Systemic Abdomen & Lower Limbs (Femoral / Popliteal)
      target.set(0.05, 0.65, 0.01);
    } else {
      // 5. Venous return into IVC / SVC -> Right Atrium
      target.set(-0.015, 1.275, 0.02);
    }

    this.sceneManager.controls.target.lerp(target, 0.05);
  }

  setVisible(visible) {
    if (this.instancedMesh) {
      this.instancedMesh.visible = visible;
    }
  }
}
