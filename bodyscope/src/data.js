/**
 * BodyScope 3D - Anatomical & Physiological Knowledge Base
 * Standardized Terminologia Anatomica (TA2), English, Urdu, Functional Physiology & Pathology
 */

export const ANATOMY_DATA = {
  // ==========================================
  // 1. CARDIOVASCULAR SYSTEM
  // ==========================================
  heart: {
    id: "heart",
    name: "Heart",
    latin: "Cor",
    urdu: "دل (قلب)",
    system: "Cardiovascular",
    region: "Thorax (Mediastinum)",
    type: "Vital Muscular Organ",
    function: "Central muscular pump composed of four chambers (right/left atria, right/left ventricles) that drives the systemic and pulmonary circulatory circuits.",
    facts: "Beats approximately 100,000 times daily, ejecting roughly 7,500 liters of blood through a 100,000 km vascular network.",
    conditions: "Coronary artery disease, Myocardial infarction, Congestive heart failure, Atrial fibrillation, Valvular stenosis."
  },
  aorta: {
    id: "aorta",
    name: "Aorta & Systemic Arterial Trunk",
    latin: "Aorta",
    urdu: "شہ رگ (شہ رگِ اعظم)",
    system: "Cardiovascular",
    region: "Thorax & Abdomen",
    type: "Elastic Conduit Artery",
    function: "The body's primary arterial trunk, carrying oxygenated blood under high hydrostatic pressure from the left ventricle into systemic circulation.",
    facts: "Withstands cyclical systolic pressures exceeding 120 mmHg; its elastic Windkessel effect dampens pulsatile pressure spikes.",
    conditions: "Aortic aneurysm, Aortic dissection, Atherosclerosis, Coarctation of the aorta."
  },
  vena_cava: {
    id: "vena_cava",
    name: "Vena Cava (Superior & Inferior)",
    latin: "Vena cava",
    urdu: "بڑی ورید (وریدِ اعظم)",
    system: "Cardiovascular",
    region: "Thorax & Abdomen",
    type: "Central Low-Pressure Vein",
    function: "Returns deoxygenated systemic venous blood from the upper body (SVC) and lower body (IVC) into the right atrium of the heart.",
    facts: "Contains approximately 60-70% of total systemic blood volume under baseline resting conditions (capacitance vessel).",
    conditions: "Superior vena cava syndrome, Deep vein thrombosis (DVT), Budd-Chiari syndrome."
  },
  pulmonary_artery: {
    id: "pulmonary_artery",
    name: "Pulmonary Arterial Trunk",
    latin: "Truncus pulmonalis",
    urdu: "پھیپھڑوں کی شریان",
    system: "Cardiovascular",
    region: "Thorax",
    type: "Pulmonary Artery",
    function: "Carries deoxygenated blood from the right ventricle into the alveolar capillary beds of the left and right lungs for gas exchange.",
    facts: "The only adult arteries carrying deoxygenated blood; operates under low hydrostatic pressure (~25/10 mmHg).",
    conditions: "Pulmonary embolism (PE), Pulmonary hypertension, Patent ductus arteriosus (PDA)."
  },
  coronary_arteries: {
    id: "coronary_arteries",
    name: "Coronary Arterial Network",
    latin: "Arteriae coronariae",
    urdu: "دل کی شریانیں (تاجی شریانیں)",
    system: "Cardiovascular",
    region: "Heart Wall",
    type: "Myocardial Perfusion Arteries",
    function: "Supplies oxygen-rich arterial blood directly to the continuously working myocardium of the heart walls.",
    facts: "Perfused primarily during ventricular diastole (when the heart muscle relaxes and aortic valves close).",
    conditions: "Coronary artery disease (CAD), Angina pectoris, Acute coronary syndrome (ACS)."
  },

  // ==========================================
  // 2. RESPIRATORY SYSTEM
  // ==========================================
  lungs: {
    id: "lungs",
    name: "Lungs (Left & Right)",
    latin: "Pulmones",
    urdu: "پھیپھڑے",
    system: "Respiratory",
    region: "Thoracic Cavity",
    type: "Primary Respiratory Organ",
    function: "Facilitates alveolar gas exchange: extracting atmospheric O2 into the bloodstream and expelling metabolic CO2 waste.",
    facts: "Contains roughly 300-500 million microscopic alveoli providing a vast gas exchange surface area equivalent to half a tennis court (~75 m²).",
    conditions: "Asthma, Chronic Obstructive Pulmonary Disease (COPD), Pneumonia, Acute Respiratory Distress Syndrome (ARDS), Lung cancer."
  },
  trachea: {
    id: "trachea",
    name: "Trachea (Windpipe) & Bronchi",
    latin: "Trachea et bronchi",
    urdu: "ہوا کی نالی (حلقوم)",
    system: "Respiratory",
    region: "Neck & Upper Mediastinum",
    type: "Cartilaginous Airway",
    function: "Rigid yet flexible conduit lined with ciliated pseudostratified epithelium to filter, humidify, and deliver ambient air to bronchial trees.",
    facts: "Supported by 16-20 C-shaped hyaline cartilage rings that prevent collapse during deep negative-pressure inhalation.",
    conditions: "Tracheitis, Bronchitis, Tracheal stenosis, Foreign body aspiration."
  },
  diaphragm: {
    id: "diaphragm",
    name: "Diaphragm",
    latin: "Diaphragma",
    urdu: "حجابِ حاجز (ڈایافرام)",
    system: "Respiratory / Muscular",
    region: "Thoracoabdominal Junction",
    type: "Dome-shaped Skeletal Muscle",
    function: "The primary muscle of respiration; contracts downward during inhalation to expand thoracic volume and create negative intrathoracic pressure.",
    facts: "Innervated by the phrenic nerve (roots C3, C4, C5: 'keeps the diaphragm alive').",
    conditions: "Diaphragmatic hernia, Phrenic nerve palsy, Singultus (hiccups)."
  },

  // ==========================================
  // 3. DIGESTIVE SYSTEM
  // ==========================================
  stomach: {
    id: "stomach",
    name: "Stomach",
    latin: "Gaster / Ventriculus",
    urdu: "معدہ",
    system: "Digestive",
    region: "Left Upper Quadrant (Epigastrium)",
    type: "Gastrointestinal Organ",
    function: "Mechanical churning and chemical digestion of ingested food via gastric hydrochloric acid (pH 1.5-2.0) and pepsinogen.",
    facts: "A thick mucosal barrier of alkaline bicarbonate prevents the stomach from digesting its own muscular wall.",
    conditions: "Peptic ulcer disease, Gastritis, Gastroesophageal reflux (GERD), Gastric adenocarcinoma."
  },
  liver: {
    id: "liver",
    name: "Liver",
    latin: "Hepar",
    urdu: "جگر",
    system: "Digestive / Metabolic",
    region: "Right Upper Quadrant",
    type: "Metabolic & Exocrine Gland",
    function: "Largest internal organ; carries out >500 vital biochemical functions including glycogen storage, bile synthesis, drug detoxification, and albumin production.",
    facts: "Receives dual blood supply: 75% venous blood from portal vein (rich in nutrients) and 25% oxygenated arterial blood from hepatic artery.",
    conditions: "Cirrhosis, Non-alcoholic fatty liver disease (NAFLD), Viral hepatitis, Jaundice, Hepatic failure."
  },
  gallbladder: {
    id: "gallbladder",
    name: "Gallbladder",
    latin: "Vesica biliaris",
    urdu: "پتہ",
    system: "Digestive",
    region: "Inferior Surface of Liver",
    type: "Bile Storage Reservoir",
    function: "Concentrates and stores hepatic bile, contracting postprandially under cholecystokinin (CCK) stimulation to emulsify dietary fats.",
    facts: "Can concentrate hepatic bile up to 10-fold by actively absorbing water and electrolytes.",
    conditions: "Cholelithiasis (gallstones), Cholecystitis, Biliary colic, Choledocholithiasis."
  },
  pancreas: {
    id: "pancreas",
    name: "Pancreas",
    latin: "Pancreas",
    urdu: "لوبلوبہ (پینکریئاس)",
    system: "Digestive / Endocrine",
    region: "Retroperitoneum (C-loop of Duodenum)",
    type: "Dual Exocrine/Endocrine Gland",
    function: "Exocrine acini secrete alkaline digestive enzymes (amylase, lipase, trypsin); endocrine Islets of Langerhans secrete insulin and glucagon.",
    facts: "Beta cells synthesize insulin to drive glucose into cells, directly governing systemic glycemic homeostasis.",
    conditions: "Type 1 & Type 2 Diabetes Mellitus, Acute and chronic pancreatitis, Pancreatic adenocarcinoma."
  },
  spleen: {
    id: "spleen",
    name: "Spleen",
    latin: "Splen / Lien",
    urdu: "تلی",
    system: "Digestive / Lymphatic",
    region: "Left Hypochondrium (Ribs 9-11)",
    type: "Secondary Lymphoid Organ",
    function: "Filters blood, degrades senescent erythrocytes, recycles iron, and houses dense reserves of B and T lymphocytes for antibody synthesis.",
    facts: "Holds a reserve pool of up to 250 mL of concentrated erythrocytes released during severe hemorrhagic shock.",
    conditions: "Splenomegaly, Splenic rupture (traumatic abdominal injury), Asplenia / immune susceptibility."
  },
  intestines: {
    id: "intestines",
    name: "Intestines (Small & Large Colon)",
    latin: "Intestinum tenue et crassum",
    urdu: "آنتیں (چھوٹی اور بڑی آنت)",
    system: "Digestive",
    region: "Abdomen & Pelvis",
    type: "Nutrient & Water Absorption Canal",
    function: "Duodenum, jejunum, and ileum absorb amino acids, sugars, and lipids; colon reabsorbs water/electrolytes and ferments fiber via microbiome.",
    facts: "Total length spans approximately 7.5 meters, lined with circular folds and microvilli multiplying absorption area to ~32 m².",
    conditions: "Irritable bowel syndrome (IBS), Crohn's disease, Ulcerative colitis, Appendicitis, Colorectal carcinoma."
  },

  // ==========================================
  // 4. RENAL & URINARY SYSTEM
  // ==========================================
  kidneys: {
    id: "kidneys",
    name: "Kidneys (Left & Right)",
    latin: "Renes",
    urdu: "گردے",
    system: "Renal / Excretory",
    region: "Retroperitoneal Space (T12-L3)",
    type: "Blood Filtration Organ",
    function: "Filters ~180 L of blood plasma daily via 2 million nephrons; regulates blood pressure (renin), acid-base balance, electrolytes, and erythropoietin.",
    facts: "Consumes over 20% of resting cardiac output despite making up less than 0.5% of total body mass.",
    conditions: "Chronic kidney disease (CKD), Nephrolithiasis (kidney stones), Glomerulonephritis, Polycystic kidney disease."
  },
  bladder: {
    id: "bladder",
    name: "Urinary Bladder & Ureters",
    latin: "Vesica urinaria",
    urdu: "مثانہ",
    system: "Renal / Urinary",
    region: "True Pelvis",
    type: "Distensible Muscular Sac",
    function: "Collects and stores urine transported via peristaltic ureters; contracts detrusor muscle under parasympathetic control during micturition.",
    facts: "Capable of expanding from empty state (0 mL) to over 500-600 mL before triggering urgent stretch receptors.",
    conditions: "Urinary tract infection (Cystitis), Urinary incontinence, Bladder calculi, Urothelial carcinoma."
  },

  // ==========================================
  // 5. NERVOUS SYSTEM
  // ==========================================
  brain: {
    id: "brain",
    name: "Brain (Cerebrum, Cerebellum & Brainstem)",
    latin: "Encephalon",
    urdu: "دماغ (مغز)",
    system: "Nervous",
    region: "Cranial Cavity",
    type: "Central Nervous System Control Center",
    function: "Governs conscious perception, voluntary movement, cognition, speech, autonomic homeostasis, emotional regulation, and memory consolidation.",
    facts: "Contains roughly 86 billion neurons connected by over 100 trillion synapses; consumes 20% of baseline bodily oxygen and glucose.",
    conditions: "Ischemic / hemorrhagic stroke, Traumatic brain injury, Alzheimer's disease, Parkinson's disease, Epilepsy, Meningitis."
  },
  spinal_cord: {
    id: "spinal_cord",
    name: "Spinal Cord & Peripheral Nerves",
    latin: "Medulla spinalis",
    urdu: "حرام مغز (نخاع)",
    system: "Nervous",
    region: "Vertebral Canal",
    type: "High-Speed Neural Highway",
    function: "Transmits ascending sensory tracts to cerebral cortex and descending motor impulses to neuromuscular junctions; processes spinal reflexes.",
    facts: "Terminates at lumbar level L1-L2 in adults as the conus medullaris, continuing inferiorly as the cauda equina ('horse's tail').",
    conditions: "Spinal cord injury (paraplegia/tetraplegia), Radiculopathy (sciatica), Multiple sclerosis, Amyotrophic lateral sclerosis (ALS)."
  },

  // ==========================================
  // 6. SKELETAL SYSTEM (AUTHENTIC ANATOMY)
  // ==========================================
  cranium: {
    id: "cranium",
    name: "Cranium & Facial Skeleton (Skull)",
    latin: "Cranium",
    urdu: "کھوپڑی (جمجمہ)",
    system: "Skeletal",
    region: "Head & Neck",
    type: "Neurocranium & Viscerocranium",
    function: "Encloses and shields the brain, pituitary gland, and cranial nerves; houses ocular orbits, auditory apparatus, and nasal airway.",
    facts: "Formed by 22 fused bones (excluding 6 auditory ossicles) interconnected by immovable fibrous cranial sutures (coronal, sagittal, lambdoid).",
    conditions: "Skull fractures, Craniosynostosis, Intracranial hemorrhage, TMJ disorder."
  },
  mandible: {
    id: "mandible",
    name: "Mandible (Lower Jawbone)",
    latin: "Mandibula",
    urdu: "نچلا جبڑا",
    system: "Skeletal",
    region: "Lower Face",
    type: "Movable Facial Bone",
    function: "Holds lower dental arch; articulates with temporal bones at the bilateral temporomandibular joints (TMJ) for mastication and speech.",
    facts: "The strongest and largest bone of the human face, and the only movable cranial bone.",
    conditions: "Mandibular fracture, Temporomandibular joint dysfunction, Malocclusion."
  },
  cervical_spine: {
    id: "cervical_spine",
    name: "Cervical Spine (C1-C7)",
    latin: "Vertebrae cervicales",
    urdu: "گردن کے مہرے",
    system: "Skeletal",
    region: "Neck",
    type: "Axial Skeleton (Vertebral Column)",
    function: "Supports head mass (~5 kg), protects ascending/descending spinal cord, and facilitates wide-range head rotation and flexion/extension.",
    facts: "Atlas (C1) and Axis (C2) feature specialized pivot dens articulation enabling 50% of all neck rotation.",
    conditions: "Cervical spondylosis, Herniated cervical disc, Whiplash injury."
  },
  thoracic_spine: {
    id: "thoracic_spine",
    name: "Thoracic Spine (T1-T12)",
    latin: "Vertebrae thoracicae",
    urdu: "سینے کے مہرے",
    system: "Skeletal",
    region: "Thorax / Upper Back",
    type: "Axial Skeleton (Vertebral Column)",
    function: "Provides sturdy posterior scaffolding articulatory facets for the 12 pairs of ribs, anchoring the rigid thoracic cage.",
    facts: "Features costal demifacets on vertebral bodies and transverse processes to articulate with rib heads and tubercles.",
    conditions: "Thoracic kyphosis, Compression fractures (osteoporosis), Scoliosis."
  },
  lumbar_spine: {
    id: "lumbar_spine",
    name: "Lumbar Spine (L1-L5)",
    latin: "Vertebrae lumbales",
    urdu: "کمر کے مہرے",
    system: "Skeletal",
    region: "Lower Back",
    type: "Weight-Bearing Vertebrae",
    function: "Bears the predominant static and dynamic weight of the upper body, allowing spinal flexion, extension, and lateral rotation.",
    facts: "Has the thickest and widest vertebral bodies (L5 is the largest single vertebra in the human body).",
    conditions: "Lumbar disc herniation, Spondylolisthesis, Sciatica, Spinal stenosis."
  },
  pelvis: {
    id: "pelvis",
    name: "Pelvis (Pelvic Girdle & Sacrum)",
    latin: "Pelvis",
    urdu: "حوض کی ہڈی (کولہے کا حلقہ)",
    system: "Skeletal",
    region: "Lower Trunk",
    type: "Appendicular / Axial Anchor",
    function: "Transfers upper-body mass to femoral lower extremities; protects pelvic reproductive, urinary, and lower gastrointestinal viscera.",
    facts: "Exhibits prominent sexual dimorphism: female pelvis is broader, shallower, and features a wider subpubic angle (>90°) to accommodate childbirth.",
    conditions: "Pelvic fractures, Sacroiliac joint dysfunction, Pubic symphysis diastasis."
  },
  ribcage: {
    id: "ribcage",
    name: "Rib Cage & Sternum",
    latin: "Cavea thoracis",
    urdu: "پسلیوں کا پنجرہ اور ہنسلی",
    system: "Skeletal",
    region: "Thorax",
    type: "Protective Thoracic Cage",
    function: "Shields cardiopulmonary viscera (heart, lungs, great vessels); dynamically expands and contracts during breathing excursions.",
    facts: "Consists of 12 rib pairs (7 true vertebrosternal, 3 false vertebrochondral, 2 floating ribs) bound anteriorly by costal hyaline cartilages.",
    conditions: "Rib fractures, Flail chest, Costochondritis, Pectus excavatum."
  },
  clavicle_scapula: {
    id: "clavicle_scapula",
    name: "Shoulder Girdle (Clavicle & Scapula)",
    latin: "Cingulum pectorale",
    urdu: "کندھے کا حلقہ (ہنسلی اور شانہ)",
    system: "Skeletal",
    region: "Shoulder",
    type: "Pectoral Girdle",
    function: "Connects upper limb to axial skeleton with remarkable multi-axial range of motion at the glenohumeral ball-and-socket joint.",
    facts: "The clavicle (collarbone) is the first bone to begin ossification in embryonic development and the most frequently fractured bone in humans.",
    conditions: "Clavicular fracture, Glenohumeral shoulder dislocation, Rotator cuff impingement."
  },
  arm_bones: {
    id: "arm_bones",
    name: "Arm & Forearm Bones (Humerus, Radius & Ulna)",
    latin: "Ossa membri superioris",
    urdu: "بازو اور کلائی کی ہڈیاں",
    system: "Skeletal",
    region: "Upper Limb",
    type: "Long Bones",
    function: "Allows powerful arm elevation, elbow hinge flexion/extension, and forearm pronation/supination to orient the hand in 3D space.",
    facts: "The radial head pivots smoothly against the capitulum and radial notch of ulna during everyday twisting (pronation/supination).",
    conditions: "Humerus shaft fracture, Colles' wrist fracture, Nursemaid's elbow."
  },
  hand_bones: {
    id: "hand_bones",
    name: "Hand Bones (Carpals, Metacarpals & Phalanges)",
    latin: "Ossa manus",
    urdu: "ہاتھ اور انگلیوں کی ہڈیاں",
    system: "Skeletal",
    region: "Hand & Wrist",
    type: "Precision Manipulative Skeleton",
    function: "Provides intricate tactile dexterity, precision pinch, power grip, and fine motor manipulation via 27 individual bones per hand.",
    facts: "The 8 carpal bones arrange in two functional rows: Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate.",
    conditions: "Carpal tunnel syndrome, Scaphoid non-union fracture, Boxer's metacarpal fracture, Rheumatoid arthritis."
  },
  leg_bones: {
    id: "leg_bones",
    name: "Leg Bones (Femur, Patella, Tibia & Fibula)",
    latin: "Ossa membri inferioris",
    urdu: "ٹانگ اور گھٹنے کی ہڈیاں",
    system: "Skeletal",
    region: "Lower Limb",
    type: "Heavy Load-Bearing Bones",
    function: "Supports entire upright body weight during bipedal standing, walking, sprinting, and vertical jumping.",
    facts: "Femur is the longest, heaviest, and strongest bone in the human body; capable of supporting up to 30 times human body weight in compression.",
    conditions: "Femoral neck hip fracture, Meniscus / ACL tears, Patellar tendinitis, Tibial shaft fracture."
  },
  foot_bones: {
    id: "foot_bones",
    name: "Foot Bones (Tarsals, Metatarsals & Phalanges)",
    latin: "Ossa pedis",
    urdu: "پاؤں اور پنجے کی ہڈیاں",
    system: "Skeletal",
    region: "Ankle & Foot",
    type: "Dynamic Arched Skeleton",
    function: "Acts as a spring-loaded dynamic lever: absorbs ground-reaction impact forces and propels body forward during gait cycle.",
    facts: "Contains 26 bones, 33 joints, and over 100 muscles/tendons forming longitudinal and transverse arches.",
    conditions: "Plantar fasciitis, Ankle inversion sprain, Hallux valgus (bunion), Stress fractures."
  },

  // ==========================================
  // 7. MUSCULAR SYSTEM
  // ==========================================
  muscles_major: {
    id: "muscles_major",
    name: "Major Skeletal Muscles",
    latin: "Systema musculare",
    urdu: "بڑے عضلات (پٹھے)",
    system: "Muscular",
    region: "Whole Body",
    type: "Striated Skeletal Muscle",
    function: "Generates voluntary force, locomotor propulsion, upright postural stability, and involuntary metabolic thermogenesis (shivering).",
    facts: "Skeletal muscle accounts for roughly 40% of total adult body mass and represents the primary reservoir for systemic glucose disposal.",
    conditions: "Muscle strain / tears, Sarcopenia, Myasthenia gravis, Rhabdomyolysis, Muscular dystrophy."
  },

  // ==========================================
  // 8. INTEGUMENTARY SYSTEM (SKIN)
  // ==========================================
  skin: {
    id: "skin",
    name: "Integumentary System (Skin Shell)",
    latin: "Integumentum commune",
    urdu: "جلد (کھال)",
    system: "Integumentary",
    region: "External Body",
    type: "Protective Sensory Barrier",
    function: "Shields internal viscera from mechanical trauma, ultraviolet radiation, and microbial pathogens; regulates core body temperature.",
    facts: "The human body's largest organ by surface area (~1.8 m² in adults) and weight (~16% of total body weight).",
    conditions: "Atopic dermatitis, Burns, Melanoma, Psoriasis, Cutaneous infections."
  }
};

/**
 * Helper to match mesh identifiers from GLTF/GLB models to ANATOMY_DATA
 */
export function getAnatomyDataForMesh(meshName) {
  if (!meshName) return ANATOMY_DATA.heart;
  const name = meshName.toLowerCase();

  // 1. Cardiovascular checks
  if (name.includes("heart") || name.includes("myocardi") || name.includes("atrium") || name.includes("ventricle") || name.includes("cor")) {
    return ANATOMY_DATA.heart;
  }
  if (name.includes("aorta")) return ANATOMY_DATA.aorta;
  if (name.includes("vena_cava") || name.includes("cava") || name.includes("jugular") || name.includes("vein")) return ANATOMY_DATA.vena_cava;
  if (name.includes("pulmonary") && name.includes("arter")) return ANATOMY_DATA.pulmonary_artery;
  if (name.includes("coronary")) return ANATOMY_DATA.coronary_arteries;
  if (name.includes("artery") || name.includes("arteria")) return ANATOMY_DATA.aorta;

  // 2. Respiratory checks
  if (name.includes("lung") || name.includes("pulmo")) return ANATOMY_DATA.lungs;
  if (name.includes("trachea") || name.includes("bronch")) return ANATOMY_DATA.trachea;
  if (name.includes("diaphragm")) return ANATOMY_DATA.diaphragm;

  // 3. Digestive checks
  if (name.includes("stomach") || name.includes("gaster") || name.includes("ventriculus")) return ANATOMY_DATA.stomach;
  if (name.includes("liver") || name.includes("hepar") || name.includes("hepatic")) return ANATOMY_DATA.liver;
  if (name.includes("gall") || name.includes("vesica_biliaris")) return ANATOMY_DATA.gallbladder;
  if (name.includes("pancrea")) return ANATOMY_DATA.pancreas;
  if (name.includes("spleen") || name.includes("splen") || name.includes("lien")) return ANATOMY_DATA.spleen;
  if (name.includes("intestin") || name.includes("colon") || name.includes("cecum") || name.includes("ileum") || name.includes("duoden")) return ANATOMY_DATA.intestines;

  // 4. Renal checks
  if (name.includes("kidney") || name.includes("ren") || name.includes("neph")) return ANATOMY_DATA.kidneys;
  if (name.includes("bladder") || name.includes("ureter") || name.includes("vesica_urinaria")) return ANATOMY_DATA.bladder;

  // 5. Nervous checks
  if (name.includes("brain") || name.includes("cerebr") || name.includes("encephalon") || name.includes("cortex")) return ANATOMY_DATA.brain;
  if (name.includes("spinal_cord") || name.includes("nerve") || name.includes("plexus")) return ANATOMY_DATA.spinal_cord;

  // 6. Skeletal checks
  if (name.includes("mandib")) return ANATOMY_DATA.mandible;
  if (name.includes("skull") || name.includes("cranium") || name.includes("frontal") || name.includes("parietal") || name.includes("temporal") || name.includes("occipital") || name.includes("sphenoid") || name.includes("ethmoid") || name.includes("maxilla") || name.includes("zygomat") || name.includes("nasal")) {
    return ANATOMY_DATA.cranium;
  }
  if (name.includes("cervical") || name.includes("atlas") || name.includes("axis")) return ANATOMY_DATA.cervical_spine;
  if (name.includes("thoracic_vert") || name.includes("thoracic-vert")) return ANATOMY_DATA.thoracic_spine;
  if (name.includes("lumbar")) return ANATOMY_DATA.lumbar_spine;
  if (name.includes("pelvi") || name.includes("sacrum") || name.includes("ilium") || name.includes("ischium") || name.includes("pubis") || name.includes("hip")) return ANATOMY_DATA.pelvis;
  if (name.includes("rib") || name.includes("costa") || name.includes("sternum") || name.includes("xiphoid") || name.includes("manubrium")) return ANATOMY_DATA.ribcage;
  if (name.includes("clavicle") || name.includes("scapula")) return ANATOMY_DATA.clavicle_scapula;
  if (name.includes("humerus") || name.includes("radius") || name.includes("ulna")) return ANATOMY_DATA.arm_bones;
  if (name.includes("carpal") || name.includes("metacarpal") || name.includes("phalanx") || name.includes("finger") || name.includes("thumb") || name.includes("hand")) return ANATOMY_DATA.hand_bones;
  if (name.includes("femur") || name.includes("patella") || name.includes("tibia") || name.includes("fibula")) return ANATOMY_DATA.leg_bones;
  if (name.includes("tarsal") || name.includes("metatarsal") || name.includes("calcaneus") || name.includes("talus") || name.includes("toe") || name.includes("foot")) return ANATOMY_DATA.foot_bones;

  // 7. Muscular checks
  if (name.includes("muscle") || name.includes("pectoral") || name.includes("biceps") || name.includes("deltoid") || name.includes("gluteus") || name.includes("rectus")) {
    return ANATOMY_DATA.muscles_major;
  }

  // 8. Skin
  if (name.includes("skin") || name.includes("body") || name.includes("integument")) {
    return ANATOMY_DATA.skin;
  }

  return ANATOMY_DATA.skeleton_general || ANATOMY_DATA.cranium;
}

