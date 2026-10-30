import type { PositionModule, PoseKeyframe, IntensityMap } from '../core/types';

const D = Math.PI / 180;

const baseA: PoseKeyframe = {
  hips: { pos: [0, 0.06, 0.10], rot: [62 * D, 0, 0] },
  spine: { rot: [26 * D, 0, 0] },
  chest: { rot: [30 * D, 0, 0] },
  neck: { rot: [-38 * D, 0, 0] },
  head: { rot: [18 * D, 0, 0] },
  shoulderL: { rot: [0, 0, -8 * D] },
  upperArmL: { rot: [0, 0, -78 * D] },
  forearmL: { rot: [0, 0, -14 * D] },
  handL: { rot: [0, 0, 0] },
  shoulderR: { rot: [0, 0, 8 * D] },
  upperArmR: { rot: [0, 0, -78 * D] },
  forearmR: { rot: [0, 0, -14 * D] },
  handR: { rot: [0, 0, 0] },
  upperLegL: { rot: [-6 * D, 0, 4 * D] },
  lowerLegL: { rot: [86 * D, 0, 0] },
  footL: { rot: [-84 * D, 0, 0] },
  upperLegR: { rot: [-6 * D, 0, -4 * D] },
  lowerLegR: { rot: [86 * D, 0, 0] },
  footR: { rot: [-84 * D, 0, 0] },
};

const baseB: PoseKeyframe = {
  hips: { pos: [0, -0.02, -0.06], rot: [10 * D, 0, 0] },
  spine: { rot: [22 * D, 0, 0] },
  chest: { rot: [16 * D, 0, 0] },
  neck: { rot: [-14 * D, 0, 0] },
  head: { rot: [8 * D, 0, 0] },
  shoulderL: { rot: [0, 0, -4 * D] },
  upperArmL: { rot: [-6 * D, -72 * D, -10 * D] },
  forearmL: { rot: [0, 20 * D, 0] },
  handL: { rot: [0, 0, 0] },
  shoulderR: { rot: [0, 0, 4 * D] },
  upperArmR: { rot: [-6 * D, -72 * D, 10 * D] },
  forearmR: { rot: [0, 20 * D, 0] },
  handR: { rot: [0, 0, 0] },
  upperLegL: { rot: [-52 * D, 0, 6 * D] },
  lowerLegL: { rot: [88 * D, 0, 0] },
  footL: { rot: [-86 * D, 0, 0] },
  upperLegR: { rot: [-52 * D, 0, -6 * D] },
  lowerLegR: { rot: [88 * D, 0, 0] },
  footR: { rot: [-86 * D, 0, 0] },
};

const cycleA: PoseKeyframe[] = [
  { hips: { pos: [0, 0.06, 0.10], rot: [62 * D, 0, 2 * D] }, chest: { rot: [30 * D, 0, 0] } },
  { hips: { pos: [0, 0.045, 0.055], rot: [66 * D, 0, 0] }, chest: { rot: [33 * D, 0, 0] } },
  { hips: { pos: [0, 0.03, 0.02], rot: [70 * D, 0, -2 * D] }, chest: { rot: [36 * D, 0, 0] } },
  { hips: { pos: [0, 0.045, 0.055], rot: [66 * D, 0, 0] }, chest: { rot: [33 * D, 0, 0] } },
];

const cycleB: PoseKeyframe[] = [
  { hips: { pos: [0, -0.02, -0.14], rot: [10 * D, 0, 0] }, chest: { rot: [16 * D, 0, 0] }, upperArmL: { rot: [-6 * D, -72 * D, -10 * D] }, upperArmR: { rot: [-6 * D, -72 * D, 10 * D] } },
  { hips: { pos: [0, -0.03, -0.07], rot: [12 * D, 0, 0] }, chest: { rot: [19 * D, 0, 0] }, upperArmL: { rot: [-8 * D, -70 * D, -10 * D] }, upperArmR: { rot: [-8 * D, -70 * D, 10 * D] } },
  { hips: { pos: [0, -0.045, -0.02], rot: [15 * D, 0, 0] }, chest: { rot: [23 * D, 0, 0] }, upperArmL: { rot: [-10 * D, -68 * D, -10 * D] }, upperArmR: { rot: [-10 * D, -68 * D, 10 * D] } },
  { hips: { pos: [0, -0.03, -0.07], rot: [12 * D, 0, 0] }, chest: { rot: [19 * D, 0, 0] }, upperArmL: { rot: [-8 * D, -70 * D, -10 * D] }, upperArmR: { rot: [-8 * D, -70 * D, 10 * D] } },
];

const intensityA: IntensityMap = {
  hips: { pos: [0, -0.03, -0.06], rot: [6 * D, 0, 0] },
  chest: { rot: [4 * D, 0, 0] },
};

const intensityB: IntensityMap = {
  hips: { pos: [0, -0.02, 0.07], rot: [5 * D, 0, 0] },
  chest: { rot: [5 * D, 0, 0] },
};

export const doggyPosition: PositionModule = {
  id: 'doggy',
  label: 'Doggy Style',
  basePose: baseA,
  cycle: cycleA,
  cycleDuration: 1.6,
  intensityOffsets: intensityA,
  cameraPresets: [
    { name: 'Side Profile', position: [2.6, 1.35, 0.4], target: [0, 1.0, 0.15], fov: 42 },
    { name: 'Behind', position: [-0.4, 1.5, -2.6], target: [0, 1.05, 0.35], fov: 40 },
    { name: 'Top Down', position: [0.15, 3.4, 0.55], target: [0, 0.9, 0.2], fov: 45 },
    { name: 'Close Up', position: [1.15, 1.25, -1.35], target: [0, 1.0, 0.28], fov: 34 },
  ],
};

export const doggyPoses = { baseA, baseB, cycleA, cycleB, intensityA, intensityB };
