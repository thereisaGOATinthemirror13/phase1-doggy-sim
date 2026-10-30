export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface PositionModule {
  id: string;
  label: string;
  basePose: PoseKeyframe;
  cycle: PoseKeyframe[];
  cycleDuration: number;
  intensityOffsets: IntensityMap;
  cameraPresets: CameraPreset[];
}

export type BoneName =
  | 'hips' | 'spine' | 'chest' | 'neck' | 'head'
  | 'shoulderL' | 'upperArmL' | 'forearmL' | 'handL'
  | 'shoulderR' | 'upperArmR' | 'forearmR' | 'handR'
  | 'upperLegL' | 'lowerLegL' | 'footL'
  | 'upperLegR' | 'lowerLegR' | 'footR';

export interface BonePose {
  pos?: [number, number, number];
  rot?: [number, number, number];
}

export type PoseKeyframe = Partial<Record<BoneName, BonePose>>;

export type IntensityMap = Partial<Record<BoneName, BonePose>>;

export interface CharacterOptions {
  skinTone: number;
  bodyHair: number;
  heightScale: number;
  build: number;
}

export interface AnimState {
  playing: boolean;
  speed: number;
  intensity: number;
  phase: number;
}

export interface QualitySettings {
  pixelRatio: number;
  shadows: boolean;
  shadowMapSize: number;
  bloom: boolean;
  dust: boolean;
}

export type LightingPresetId = 'warm' | 'moody' | 'neon';

export interface LightingPreset {
  id: LightingPresetId;
  label: string;
  ambient: { color: number; intensity: number };
  key: { color: number; intensity: number; position: [number, number, number] };
  rim: { color: number; intensity: number; position: [number, number, number] };
  fill: { color: number; intensity: number; position: [number, number, number] };
  fog: { color: number; near: number; far: number };
  background: number;
}

export interface AppState {
  anim: AnimState;
  lighting: LightingPresetId;
  fov: number;
  muted: boolean;
  charA: CharacterOptions;
  charB: CharacterOptions;
  quality: QualitySettings;
}
