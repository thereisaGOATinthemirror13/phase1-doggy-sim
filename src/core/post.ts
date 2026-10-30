import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface Post {
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  setEnabled(on: boolean): void;
  resize(w: number, h: number): void;
}

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): Post {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.55, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  return {
    composer, bloom,
    setEnabled(on: boolean) { bloom.enabled = on; },
    resize(w: number, h: number) { composer.setSize(w, h); },
  };
}

export function addVignette(rendererDom: HTMLElement): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'inset:0', 'pointer-events:none', 'z-index:5',
    'background:radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.42) 100%)',
  ].join(';');
  rendererDom.parentElement?.appendChild(el);
  return el;
}
