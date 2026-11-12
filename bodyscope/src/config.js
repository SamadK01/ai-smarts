/**
 * BodyScope 3D - Global Configuration
 * Pinned Constants, Presets, and Application State Defaults
 */

export const CONFIG = {
  version: "2.0.0",
  targetFPS: 60,
  maxPixelRatio: 2,

  // Camera defaults
  camera: {
    fov: 42,
    near: 0.1,
    far: 200,
    initialPos: [0, 1.15, 3.2],
    initialTarget: [0, 0.95, 0],
    minDistance: 0.25,
    maxDistance: 6.5
  },

  // View presets (target [x, y, z], radius, theta, phi)
  cameraPresets: {
    front: { target: [0, 0.95, 0], radius: 2.8, theta: 0, phi: Math.PI / 2 },
    back: { target: [0, 0.95, 0], radius: 2.8, theta: Math.PI, phi: Math.PI / 2 },
    left: { target: [0, 0.95, 0], radius: 2.8, theta: -Math.PI / 2, phi: Math.PI / 2 },
    right: { target: [0, 0.95, 0], radius: 2.8, theta: Math.PI / 2, phi: Math.PI / 2 },
    head: { target: [0, 1.58, 0], radius: 0.72, theta: 0.15, phi: 1.45 },
    chest: { target: [0, 1.28, 0], radius: 0.95, theta: 0.1, phi: 1.48 },
    abdomen: { target: [0, 1.02, 0], radius: 0.85, theta: 0.1, phi: 1.52 },
    hands: { target: [0.42, 0.88, 0], radius: 0.65, theta: 0.2, phi: 1.5 },
    legs: { target: [0, 0.45, 0], radius: 1.4, theta: 0.05, phi: 1.55 }
  },

  // Physiological presets
  heartRatePresets: {
    sleeping: { bpm: 55, label: "Sleeping", urdu: "سوتے وقت", desc: "Parasympathetic vagal dominance; minimal myocardial oxygen demand." },
    rest: { bpm: 72, label: "Resting", urdu: "پرسکون", desc: "Healthy baseline adult sinus rhythm. Stroke volume ~70 mL/beat." },
    walk: { bpm: 95, label: "Walking", urdu: "پیدل چلنا", desc: "Mild aerobic excursion; cardiac output increases to ~8 L/min." },
    fear: { bpm: 130, label: "Fear / Alarm", urdu: "خوف / گھبراہٹ", desc: "Sympathetic surge (fight-or-flight): acute epinephrine secretion." },
    run: { bpm: 150, label: "Running", urdu: "دوڑنا", desc: "Strenuous aerobic workload; coronary perfusion tripling." },
    intense: { bpm: 180, label: "Peak Sprint", urdu: "شدید ورزش", desc: "Near-maximal chronotropic capacity; diastolic filling time shortened." },
    fever: { bpm: 110, label: "High Fever", urdu: "تیز بخار", desc: "Systemic pyrexia; metabolic rate up 10-13% per °C elevation." }
  },

  glucosePresets: {
    low: { mgdl: 55, label: "Hypoglycemia (Low)", urdu: "کم شوگر", desc: "Neuroglycopenia: neurocognitive slowing, diaphoresis, autonomic tremor." },
    normal: { mgdl: 90, label: "Fasting Normal", urdu: "نارمل شوگر", desc: "Homeostatic equilibrium maintained by basal pancreatic beta-cell insulin." },
    after_meal: { mgdl: 140, label: "Postprandial", urdu: "کھانے کے بعد", desc: "Intestinal absorption wave; insulin-mediated muscle glucose storage." },
    high: { mgdl: 250, label: "Hyperglycemia", urdu: "زیادہ شوگر", desc: "Renal glucose threshold exceeded (~180 mg/dL), osmotic polyuria." },
    very_high: { mgdl: 350, label: "Severe Crisis (DKA)", urdu: "خطرناک شوگر", desc: "Ketoacidosis hazard: endothelial shear stress, severe dehydration." }
  },

  // Color theme definitions
  themes: {
    dark: {
      id: "dark",
      name: "Studio Obsidian",
      background: 0x0a0c10,
      clearColor: "#0a0c10",
      fogColor: 0x0a0c10
    },
    white: {
      id: "white",
      name: "Clinical White",
      background: 0xf5f7fa,
      clearColor: "#f5f7fa",
      fogColor: 0xf5f7fa
    },
    gradient: {
      id: "gradient",
      name: "Surgical Neon",
      background: 0x07111e,
      clearColor: "#07111e",
      fogColor: 0x07111e
    }
  },

  // Skin appearance modes
  skinModes: {
    peach: {
      name: "Translucent Peach (PBR)",
      roughness: 0.22,
      transmission: 0.88,
      thickness: 1.8,
      color: 0xffd9ce,
      attenuationColor: 0xffa490
    },
    xray: {
      name: "Cyan X-Ray Hologram",
      roughness: 0.15,
      transmission: 0.82,
      thickness: 2.2,
      color: 0x2de2e6,
      attenuationColor: 0x0284c7
    }
  }
};

export const INITIAL_STATE = {
  gender: "male",            // "male" | "female"
  morphProgress: 0.0,        // 0.0 = male, 1.0 = female
  morphTarget: 0.0,
  
  // Physiology
  bpm: 72,
  glucose: 90,
  bloodPressureSys: 120,
  bloodPressureDia: 80,
  spo2: 99,
  temperature: 37.0,
  respirationRate: 16,
  cardiacPhase: 0.0,
  breathingPhase: 0.0,

  // Visual Controls
  skinMode: "peach",         // "peach" | "xray"
  skinOpacity: 0.55,
  backgroundTheme: "dark",   // "dark" | "white" | "gradient"
  postProcessing: true,
  bloomStrength: 0.45,
  autoRotate: false,
  soundEnabled: true,
  particlesEnabled: true,
  labelsVisible: false,
  bloodPathActive: false,

  // Cross-section slicing
  sliceEnabled: false,
  sliceAxis: "y",            // "x" | "y" | "z"
  sliceOffset: 1.25,

  // Selection & UI
  selectedId: "heart",
  isolatedId: null,
  language: "en",            // "en" | "ur"
  activeTab: "explore",      // "explore" | "layers" | "physiology" | "quiz" | "tree"

  // Active layer visibility toggles
  layers: {
    skin: true,
    skeleton: true,
    muscles: false,
    cardiovascular: true,
    respiratory: true,
    digestive: true,
    renal: true,
    nervous: true
  }
};
