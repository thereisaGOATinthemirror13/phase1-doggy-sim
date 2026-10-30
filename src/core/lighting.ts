import * as THREE from 'three';
import type { LightingPreset, LightingPresetId } from './types';

export const LIGHTING_PRESETS: Record<LightingPresetId, LightingPreset> = {
  warm: {
    id: 'warm', label: 'Soft Warm',
    ambient: { color: 0x40342a, intensity: 0.7 },
    key: { color: 0xffd9b0, intensity: 55, position: [2.5, 3.2, 2.2] },
    rim: { color: 0xff9a5c, intensity: 38, position: [-2.2, 2.4, -2.6] },
    fill: { color: 0x9db4d6, intensity: 14, position: [-2.5, 1.6, 2.8] },
    fog: { color: 0x0d0a08, near: 6, far: 16 },
    background: 0x0d0a08,
  },
  moody: {
    id: 'moody', label: 'Moody Dark',
    ambient: { color: 0x1c1a22, intensity: 0.5 },
    key: { color: 0xffc890, intensity: 30, position: [1.8, 3.4, 1.4] },
    rim: { color: 0x7a5cff, intensity: 34, position: [-2.4, 2.0, -2.4] },
    fill: { color: 0x36507a, intensity: 9, position: [-2.0, 1.4, 2.6] },
    fog: { color: 0x07060a, near: 5, far: 14 },
    background: 0x07060a,
  },
  neon: {
    id: 'neon', label: 'Neon',
    ambient: { color: 0x141428, intensity: 0.55 },
    key: { color: 0x66e0ff, intensity: 34, position: [2.6, 2.8, 1.8] },
    rim: { color: 0xff4fd8, intensity: 48, position: [-2.4, 2.2, -2.6] },
    fill: { color: 0x8a5cff, intensity: 16, position: [-1.8, 1.5, 2.6] },
    fog: { color: 0x0a0714, near: 5, far: 15 },
    background: 0x0a0714,
  },
};

export interface LightRig {
  ambient: THREE.HemisphereLight;
  key: THREE.SpotLight;
  rim: THREE.SpotLight;
  fill: THREE.PointLight;
  apply(preset: LightingPreset, scene: THREE.Scene): void;
}

export function createLightRig(): LightRig {
  const ambient = new THREE.HemisphereLight(0xffffff, 0x222222, 0.6);
  const key = new THREE.SpotLight(0xffffff, 50, 20, Math.PI / 5.2, 0.45, 1.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  const rim = new THREE.SpotLight(0xffffff, 40, 20, Math.PI / 4.5, 0.5, 1.8);
  const fill = new THREE.PointLight(0xffffff, 12, 15, 1.9);
  return {
    ambient, key, rim, fill,
    apply(preset: LightingPreset, scene: THREE.Scene) {
      ambient.color.setHex(preset.ambient.color);
      ambient.intensity = preset.ambient.intensity;
      key.color.setHex(preset.key.color);
      key.intensity = preset.key.intensity;
      key.position.set(...preset.key.position);
      key.target.position.set(0, 1, 0.3);
      rim.color.setHex(preset.rim.color);
      rim.intensity = preset.rim.intensity;
      rim.position.set(...preset.rim.position);
      rim.target.position.set(0, 1.1, 0.2);
      fill.color.setHex(preset.fill.color);
      fill.intensity = preset.fill.intensity;
      fill.position.set(...preset.fill.position);
      scene.fog = new THREE.Fog(preset.fog.color, preset.fog.near, preset.fog.far);
      scene.background = new THREE.Color(preset.background);
    },
  };
}
