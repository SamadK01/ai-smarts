/**
 * BodyScope 3D - Human Physiology & Biophysics Engine
 * Cardiac Lub-Dub Mechanics, Respiration, Real-time ECG, Glycemic Homeostasis & Visual Effects
 */

import * as THREE from 'three';

export class PhysiologyEngine {
  constructor(modelLoader, audioEngine, ecgCanvas, glucoseCanvas) {
    this.models = modelLoader;
    this.audio = audioEngine;
    this.ecgCanvas = ecgCanvas;
    this.glucoseCanvas = glucoseCanvas;

    // Physiological Metrics
    this.bpm = 72;
    this.glucose = 90;
    this.bloodPressureSys = 120;
    this.bloodPressureDia = 80;
    this.respirationRate = 16; // Breaths per minute
    this.temperature = 37.0;

    // Cycle Timers
    this.cardiacPhase = 0.0;    // 0.0 to 1.0 per heartbeat
    this.breathingPhase = 0.0;  // 0.0 to 1.0 per respiratory cycle
    this.s1Fired = false;
    this.s2Fired = false;

    // Glycemic Simulation State
    this.glucoseHistory = new Array(80).fill(90);
    this.insulinLevel = 1.0;
    this.glucoseDeltaRate = 0.0;

    // ECG Canvas Buffer
    this.ecgBuffer = [];
    this.ecgMaxPoints = 280;

    this.initCanvases();
  }

  initCanvases() {
    if (this.ecgCanvas) {
      this.ecgCtx = this.ecgCanvas.getContext('2d');
      this.ecgCanvas.width = 300;
      this.ecgCanvas.height = 70;
    }
    if (this.glucoseCanvas) {
      this.glucoseCtx = this.glucoseCanvas.getContext('2d');
      this.glucoseCanvas.width = 240;
      this.glucoseCanvas.height = 65;
    }
  }

  setBPM(bpm) {
    this.bpm = Math.max(40, Math.min(220, bpm));
    // Approximate physiological blood pressure & respiration correlation
    this.bloodPressureSys = Math.round(105 + (this.bpm - 60) * 0.45);
    this.bloodPressureDia = Math.round(70 + (this.bpm - 60) * 0.22);
    this.respirationRate = Math.round(12 + (this.bpm - 60) * 0.12);
  }

  setGlucose(mgdl) {
    this.glucose = Math.max(40, Math.min(400, mgdl));
    this.glucoseDeltaRate = 0.0;
  }

  eatSugar() {
    // Rapid carbohydrate intake wave
    this.glucoseDeltaRate += 3.2;
  }

  injectInsulin() {
    // Exogenous insulin dose accelerates intracellular uptake
    this.glucoseDeltaRate -= 4.0;
  }

  update(delta) {
    // 1. CARDIAC MECHANICS (LUB-DUB CYCLE)
    const cycleFreq = this.bpm / 60.0;
    const prevPhase = this.cardiacPhase;
    this.cardiacPhase = (this.cardiacPhase + delta * cycleFreq) % 1.0;

    // Reset sound triggers at phase wrap
    if (this.cardiacPhase < prevPhase) {
      this.s1Fired = false;
      this.s2Fired = false;
    }

    // Cardiac Cycle Milestones:
    // 0.05: Atrial Systole (P wave)
    // 0.20: Ventricular Systole Starts (QRS complex) -> S1 ("Lub")
    // 0.45: Ventricular Systole Ends / Diastole (T wave) -> S2 ("Dub")

    if (this.cardiacPhase >= 0.20 && !this.s1Fired) {
      this.s1Fired = true;
      if (this.audio) this.audio.playS1();
    }
    if (this.cardiacPhase >= 0.45 && !this.s2Fired) {
      this.s2Fired = true;
      if (this.audio) this.audio.playS2();
    }

    // Animate Myocardial Heart Mesh: sequential atrial squeeze then ventricular contraction
    if (this.models.heartMesh) {
      let heartScale = 1.0;
      if (this.cardiacPhase < 0.20) {
        // Atrial kick
        heartScale = 1.0 + Math.sin((this.cardiacPhase / 0.20) * Math.PI) * 0.04;
      } else if (this.cardiacPhase >= 0.20 && this.cardiacPhase < 0.45) {
        // Vigorous ventricular systole ejection
        const sysProgress = (this.cardiacPhase - 0.20) / 0.25;
        heartScale = 1.0 + Math.sin(sysProgress * Math.PI) * 0.09;
      } else {
        // Diastolic elastic recoil and resting fill
        heartScale = 1.0;
      }
      this.models.heartMesh.scale.set(heartScale, heartScale, heartScale);
    }

    // 2. RESPIRATION & LUNG EXPANSION
    const respFreq = this.respirationRate / 60.0;
    this.breathingPhase = (this.breathingPhase + delta * respFreq) % 1.0;
    const lungExpansion = 1.0 + Math.sin(this.breathingPhase * Math.PI * 2) * 0.035;

    if (this.models.lungsGroup) {
      this.models.lungsGroup.scale.set(lungExpansion, lungExpansion * 1.02, lungExpansion * 1.04);
    }

    // 3. GLYCEMIC METABOLIC FEEDBACK SIMULATION
    // Homeostatic pull back to baseline ~90 mg/dL via endogenous insulin/glucagon
    const homeostaticTarget = 90;
    const recoveryForce = (homeostaticTarget - this.glucose) * 0.015;
    this.glucose += (this.glucoseDeltaRate + recoveryForce) * delta * 12.0;
    this.glucoseDeltaRate *= Math.pow(0.85, delta * 10);
    this.glucose = Math.max(40, Math.min(400, this.glucose));

    // 4. UPDATE ECG & GLUCOSE CANVASES
    this.updateECG(delta);
    this.updateGlucoseGraph(delta);

    // 5. REAL-TIME SYSTEMIC VISUAL FEEDBACK
    this.applyPhysiologicalEffects();
  }

  updateECG(delta) {
    if (!this.ecgCtx) return;

    // Calculate electrical voltage corresponding to cardiacPhase
    let voltage = 0.0;
    const p = this.cardiacPhase;

    if (p >= 0.04 && p < 0.12) {
      // P wave (Atrial depolarization)
      voltage = Math.sin(((p - 0.04) / 0.08) * Math.PI) * 0.22;
    } else if (p >= 0.18 && p < 0.20) {
      // Q dip
      voltage = -0.15;
    } else if (p >= 0.20 && p < 0.24) {
      // R spike (Ventricular depolarization)
      voltage = 1.0 - Math.abs((p - 0.22) / 0.02) * 1.15;
    } else if (p >= 0.24 && p < 0.27) {
      // S dip
      voltage = -0.28;
    } else if (p >= 0.38 && p < 0.52) {
      // T wave (Ventricular repolarization)
      voltage = Math.sin(((p - 0.38) / 0.14) * Math.PI) * 0.32;
    }

    // Append to rolling buffer
    this.ecgBuffer.push(voltage);
    if (this.ecgBuffer.length > this.ecgMaxPoints) {
      this.ecgBuffer.shift();
    }

    // Render Clean High-End Oscilloscope Waveform
    const w = this.ecgCanvas.width;
    const h = this.ecgCanvas.height;
    const ctx = this.ecgCtx;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Subtle medical grid lines
    ctx.strokeStyle = '#122032';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Glowing Neon Cyan/Green ECG trace
    ctx.strokeStyle = '#2de2e6';
    ctx.shadowColor = '#2de2e6';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 2.2;
    ctx.beginPath();

    const baselineY = h * 0.62;
    const step = w / this.ecgMaxPoints;

    for (let i = 0; i < this.ecgBuffer.length; i++) {
      const x = i * step;
      const y = baselineY - this.ecgBuffer[i] * (h * 0.45);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  updateGlucoseGraph(delta) {
    if (!this.glucoseCtx) return;

    this.glucoseHistory.push(this.glucose);
    if (this.glucoseHistory.length > 80) {
      this.glucoseHistory.shift();
    }

    const w = this.glucoseCanvas.width;
    const h = this.glucoseCanvas.height;
    const ctx = this.glucoseCtx;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Normal zone highlight (70-140 mg/dL)
    const normalTop = h - (140 / 400) * h;
    const normalBottom = h - (70 / 400) * h;
    ctx.fillStyle = 'rgba(46, 226, 230, 0.08)';
    ctx.fillRect(0, normalTop, w, normalBottom - normalTop);

    // Threshold lines
    ctx.strokeStyle = '#1b2c40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, normalTop);
    ctx.lineTo(w, normalTop);
    ctx.moveTo(0, normalBottom);
    ctx.lineTo(w, normalBottom);
    ctx.stroke();

    // Glucose trend curve
    ctx.strokeStyle = this.glucose > 180 ? '#fbbf24' : (this.glucose < 70 ? '#ff4d6d' : '#2de2e6');
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = w / this.glucoseHistory.length;
    for (let i = 0; i < this.glucoseHistory.length; i++) {
      const val = this.glucoseHistory[i];
      const x = i * step;
      const y = h - (val / 400) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  applyPhysiologicalEffects() {
    // 1. High Blood Glucose: Renal Osmotic Glow (Kidneys filter excess sugar)
    if (this.models.materials.kidney) {
      if (this.glucose > 180) {
        const excess = (this.glucose - 180) / 220.0;
        this.models.materials.kidney.emissive = new THREE.Color(0xd97706);
        this.models.materials.kidney.emissiveIntensity = excess * 0.65;
      } else {
        this.models.materials.kidney.emissive = new THREE.Color(0x000000);
        this.models.materials.kidney.emissiveIntensity = 0.0;
      }
    }

    // 2. Low Blood Glucose (Hypoglycemia): Neuroglycopenic Brain Dimming
    if (this.models.materials.brain) {
      if (this.glucose < 70) {
        const deficit = (70 - this.glucose) / 30.0;
        this.models.materials.brain.color.setHex(0x8a7070); // Dim/pale
      } else {
        this.models.materials.brain.color.setHex(0xdfa5a5);
      }
    }

    // 3. Strenuous Heart Rate (>130 BPM): Skin Perfusion Flush
    if (this.models.materials.skinPeach) {
      if (this.bpm > 130) {
        const flush = (this.bpm - 130) / 70.0;
        this.models.materials.skinPeach.color.setRGB(1.0, 0.78 - flush * 0.12, 0.75 - flush * 0.12);
      } else {
        this.models.materials.skinPeach.color.setHex(0xffd9ce);
      }
    }
  }

  getExplanation() {
    let hrInfo = "";
    if (this.bpm < 60) hrInfo = "Sinus Bradycardia: Low oxygen demand; resting stroke volume.";
    else if (this.bpm <= 100) hrInfo = "Normal Sinus Rhythm: Optimal coronary perfusion and cardiac output.";
    else if (this.bpm <= 150) hrInfo = "Sinus Tachycardia: Increased oxygen delivery; accelerated breathing.";
    else hrInfo = "Extreme Tachycardia: Diastolic filling abbreviated; elevated myocardial work.";

    let glucInfo = "";
    if (this.glucose < 70) glucInfo = "Hypoglycemia: Neuroglycopenia warning. Cerebral glucose deficit causes tremors and cognitive dimming.";
    else if (this.glucose <= 140) glucInfo = "Euglycemia: Normal fasting and postprandial balance maintained by beta-cell insulin.";
    else if (this.glucose <= 200) glucInfo = "Hyperglycemia: Renal threshold approached. Liver stores glycogen; cells increase uptake.";
    else glucInfo = "Severe Hyperglycemia / Glucosuria: Kidneys overwhelmed by osmotic filtration. Dehydration risk.";

    return { hrInfo, glucInfo };
  }
}
