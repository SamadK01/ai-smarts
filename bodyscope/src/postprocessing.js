/**
 * BodyScope 3D - Cinematic Post-Processing Pipeline
 * Soft Studio Bloom & Tone Mapping with EffectComposer
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class PostProcessingManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;

    this.initComposer();
  }

  initComposer() {
    const size = new THREE.Vector2();
    this.renderer.getSize(size);

    this.composer = new EffectComposer(this.renderer);

    // 1. Scene Render Pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 2. Soft Studio Bloom Pass
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.x, size.y),
      0.38,   // strength
      0.45,   // radius
      0.82    // threshold
    );
    this.composer.addPass(this.bloomPass);

    // 3. Color Space & Tone Mapping Output Pass
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.composer.setSize(w, h);
    });
  }

  setBloomStrength(val) {
    if (this.bloomPass) {
      this.bloomPass.strength = val;
    }
  }

  render() {
    if (this.enabled) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
