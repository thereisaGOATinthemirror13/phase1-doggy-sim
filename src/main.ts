import * as THREE from 'three';
import { createCharacter } from './characters/character';
import { createBedroom } from './environment/bedroom';
import { createDust } from './environment/dust';
import { createLightRig, LIGHTING_PRESETS } from './core/lighting';
import { CameraRig } from './core/cameraRig';
import { createPost, addVignette } from './core/post';
import { applyPose, applySecondary, captureRest, sampleCycle } from './animation/pose';
import { doggyPoses } from './positions/doggy';
import { getPosition } from './positions/registry';
import { createSettingsUI } from './ui/settings';
import { Ambience } from './audio/ambience';
import type { AppState, PoseKeyframe } from './core/types';


function showErrorOverlay(title: string, message: string, stack?: string): void {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:9999', 'background:#fff', 'color:#c00',
    'font:13px/1.5 monospace', 'padding:16px', 'overflow:auto', 'white-space:pre-wrap',
    'word-break:break-word',
  ].join(';');
  el.textContent = `${title}\n${message}${stack ? '\n\n' + stack : ''}`;
  document.body.appendChild(el);
}

window.addEventListener('error', (e) => {
  showErrorOverlay('JS Error', String(e.message), e.error?.stack);
});
window.addEventListener('unhandledrejection', (e) => {
  const r = e.reason as { message?: string; stack?: string } | undefined;
  showErrorOverlay('Unhandled Promise Rejection', String(r?.message ?? e.reason), r?.stack);
});

function initApp(): void {
const app = document.getElementById('app')!;

const state: AppState = {
  anim: { playing: true, speed: 1, intensity: 0.65, phase: 0 },
  lighting: 'warm',
  fov: 45,
  muted: true,
  charA: { skinTone: 0.45, bodyHair: 0.7, heightScale: 1.0, build: 0.55 },
  charB: { skinTone: 0.75, bodyHair: 0.85, heightScale: 1.02, build: 0.8 },
  quality: { pixelRatio: 1, shadows: true, shadowMapSize: 2048, bloom: true, dust: true },
};

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);
addVignette(renderer.domElement);

const scene = new THREE.Scene();
const cameraRig = new CameraRig(renderer.domElement, state.fov);

const bedroom = createBedroom();
scene.add(bedroom.group);
const dust = createDust();
scene.add(dust);

const lights = createLightRig();
scene.add(lights.ambient, lights.key, lights.key.target, lights.rim, lights.rim.target, lights.fill);
lights.apply(LIGHTING_PRESETS[state.lighting], scene);

const post = createPost(renderer, scene, cameraRig.camera);

const position = getPosition('doggy');

const charA = createCharacter(state.charA);
const charB = createCharacter(state.charB);
charA.group.position.set(0, bedroom.bedTopY, 0.55);
charB.group.position.set(0, bedroom.bedTopY, -0.28);
scene.add(charA.group, charB.group);

const restA = captureRest(charA);
const restB = captureRest(charB);

const ambience = new Ambience();
ambience.setMuted(true);

createSettingsUI(state, {
  presetNames: position.cameraPresets.map((p) => p.name),
  onAnim(a) {
    Object.assign(state.anim, a);
  },
  onLighting(id) {
    state.lighting = id;
    lights.apply(LIGHTING_PRESETS[id], scene);
  },
  onFov(f) {
    state.fov = f;
    cameraRig.setFov(f);
  },
  onMute(m) {
    state.muted = m;
    ambience.setMuted(m);
  },
  onCharA(o) {
    Object.assign(state.charA, o);
    charA.setOptions(state.charA);
  },
  onCharB(o) {
    Object.assign(state.charB, o);
    charB.setOptions(state.charB);
  },
  onPreset(i) {
    const p = position.cameraPresets[i];
    if (p) cameraRig.goToPreset(p);
  },
});

function adaptQuality(dtMs: number) {
  if (dtMs > 22 && state.quality.pixelRatio > 0.6) {
    state.quality.pixelRatio = Math.max(0.6, state.quality.pixelRatio - 0.15);
    renderer.setPixelRatio(state.quality.pixelRatio);
  } else if (dtMs < 14 && state.quality.pixelRatio < 1) {
    state.quality.pixelRatio = Math.min(1, state.quality.pixelRatio + 0.05);
    renderer.setPixelRatio(state.quality.pixelRatio);
  }
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

const clock = new THREE.Clock();
let lastMs = 16;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  lastMs = lastMs * 0.95 + dt * 1000 * 0.05;
  adaptQuality(lastMs);

  if (state.anim.playing) {
    state.anim.phase = (state.anim.phase + (dt * state.anim.speed) / position.cycleDuration) % 1;
  }

  const poseA = sampleCycle(doggyPoses.cycleA, state.anim.phase);
  const poseB = sampleCycle(doggyPoses.cycleB, state.anim.phase);
  applyPose(charA, mergePose(doggyPoses.baseA, poseA), doggyPoses.intensityA, state.anim.intensity, restA);
  applyPose(charB, mergePose(doggyPoses.baseB, poseB), doggyPoses.intensityB, state.anim.intensity, restB);
  applySecondary(charA, t, state.anim.speed, state.anim.intensity, state.charA);
  applySecondary(charB, t * 1.07 + 2, state.anim.speed, state.anim.intensity, state.charB);

  dust.userData.update(t);
  cameraRig.update(dt);
  post.composer.render();
}

function mergePose(a: PoseKeyframe, b: PoseKeyframe): PoseKeyframe {
  const out: Record<string, { pos?: [number, number, number]; rot?: [number, number, number] }> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const ka = (a as Record<string, { pos?: [number, number, number]; rot?: [number, number, number] }>)[k];
    const kb = (b as Record<string, { pos?: [number, number, number]; rot?: [number, number, number] }>)[k];
    out[k] = {
      pos: (kb?.pos ?? ka?.pos) as [number, number, number] | undefined,
      rot: (kb?.rot ?? ka?.rot) as [number, number, number] | undefined,
    };
  }
  return out as PoseKeyframe;
}

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  cameraRig.resize(innerWidth, innerHeight);
  post.resize(innerWidth, innerHeight);
});

frame();
}

try {
  initApp();
} catch (err) {
  showErrorOverlay('Bootstrap Exception', String(err instanceof Error ? err.message : err), err instanceof Error ? err.stack : undefined);
}
