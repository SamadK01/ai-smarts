/**
 * BodyScope 3D - Scene, Camera, Studio Lighting & Controls Setup
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CONFIG } from './config.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLighting();
    this.initControls();
    this.setupResize();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.themes.dark.background);
    this.scene.fog = new THREE.FogExp2(CONFIG.themes.dark.fogColor, 0.08);

    // Root model container group
    this.bodyRoot = new THREE.Group();
    this.bodyRoot.name = "BodyRoot";
    this.scene.add(this.bodyRoot);
  }

  initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      aspect,
      CONFIG.camera.near,
      CONFIG.camera.far
    );
    this.camera.position.set(...CONFIG.camera.initialPos);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.localClippingEnabled = true;

    // Enable soft contact shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Environment map for PBR specular reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = envTexture;
  }

  initLighting() {
    // 1. Soft Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x283040, 1.2);
    this.scene.add(this.ambientLight);

    // 2. Studio Key Light (Warm front-right light)
    this.keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    this.keyLight.position.set(2.5, 3.2, 3.0);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // 3. Studio Fill Light (Cool front-left soft fill)
    this.fillLight = new THREE.DirectionalLight(0xbfe0ff, 1.0);
    this.fillLight.position.set(-2.8, 2.0, 2.2);
    this.scene.add(this.fillLight);

    // 4. Studio Rim / Backlight (Crisp cyan/white silhouette rim)
    this.rimLight = new THREE.DirectionalLight(0xa5f3fc, 2.4);
    this.rimLight.position.set(0.0, 3.5, -3.2);
    this.scene.add(this.rimLight);

    // 5. Subtle Under-light (Floor bounce)
    this.bounceLight = new THREE.DirectionalLight(0x1a2638, 0.6);
    this.bounceLight.position.set(0, -2.5, 1.0);
    this.scene.add(this.bounceLight);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = CONFIG.camera.minDistance;
    this.controls.maxDistance = CONFIG.camera.maxDistance;
    this.controls.target.set(...CONFIG.camera.initialTarget);
    this.controls.maxPolarAngle = Math.PI - 0.08; // Prevent ground flip
    this.controls.minPolarAngle = 0.08;

    // Smooth camera fly-to animation state
    this.isTransitioning = false;
    this.flyStartPos = new THREE.Vector3();
    this.flyEndPos = new THREE.Vector3();
    this.flyStartTarget = new THREE.Vector3();
    this.flyEndTarget = new THREE.Vector3();
    this.flyProgress = 0.0;
  }

  setupResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
    });
  }

  setTheme(themeId) {
    const t = CONFIG.themes[themeId] || CONFIG.themes.dark;
    this.scene.background = new THREE.Color(t.background);
    this.scene.fog.color = new THREE.Color(t.fogColor);

    if (themeId === "white") {
      this.ambientLight.intensity = 1.6;
      this.keyLight.intensity = 1.4;
      this.rimLight.intensity = 1.2;
    } else {
      this.ambientLight.intensity = 1.2;
      this.keyLight.intensity = 1.8;
      this.rimLight.intensity = 2.4;
    }
  }

  flyTo(targetVec, radius = null, theta = null, phi = null, duration = 1.0) {
    this.flyStartPos.copy(this.camera.position);
    this.flyStartTarget.copy(this.controls.target);

    this.flyEndTarget.copy(targetVec);

    const currentOffset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const r = radius !== null ? radius : currentOffset.length();
    
    let th = theta;
    let ph = phi;
    if (th === null || ph === null) {
      const spherical = new THREE.Spherical().setFromVector3(currentOffset);
      if (th === null) th = spherical.theta;
      if (ph === null) ph = spherical.phi;
    }

    const endOffset = new THREE.Vector3().setFromSpherical(new THREE.Spherical(r, ph, th));
    this.flyEndPos.copy(targetVec).add(endOffset);

    this.flyProgress = 0.0;
    this.flyDuration = duration;
    this.isTransitioning = true;
  }

  applyPreset(presetName) {
    const p = CONFIG.cameraPresets[presetName];
    if (!p) return;
    this.flyTo(new THREE.Vector3(...p.target), p.radius, p.theta, p.phi, 0.9);
  }

  update(delta) {
    if (this.isTransitioning) {
      this.flyProgress += delta / (this.flyDuration || 1.0);
      const t = Math.min(1.0, this.flyProgress);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);

      this.camera.position.lerpVectors(this.flyStartPos, this.flyEndPos, ease);
      this.controls.target.lerpVectors(this.flyStartTarget, this.flyEndTarget, ease);

      if (t >= 1.0) {
        this.isTransitioning = false;
      }
    }

    this.controls.update();
  }
}
