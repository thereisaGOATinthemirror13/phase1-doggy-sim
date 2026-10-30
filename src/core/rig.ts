import * as THREE from 'three';
import type { BoneName } from './types';

export interface BoneSpec {
  name: BoneName;
  parent: BoneName | null;
  offset: [number, number, number];
  restRot: [number, number, number];
}

export const BONE_ORDER: BoneName[] = [
  'hips',
  'spine', 'chest', 'neck', 'head',
  'shoulderL', 'upperArmL', 'forearmL', 'handL',
  'shoulderR', 'upperArmR', 'forearmR', 'handR',
  'upperLegL', 'lowerLegL', 'footL',
  'upperLegR', 'lowerLegR', 'footR',
];

const O = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

export function defaultRig(): BoneSpec[] {
  return [
    { name: 'hips', parent: null, offset: O(0, 0.98, 0), restRot: [0, 0, 0] },
    { name: 'spine', parent: 'hips', offset: O(0, 0.14, 0), restRot: [0, 0, 0] },
    { name: 'chest', parent: 'spine', offset: O(0, 0.18, 0), restRot: [0, 0, 0] },
    { name: 'neck', parent: 'chest', offset: O(0, 0.16, 0), restRot: [0, 0, 0] },
    { name: 'head', parent: 'neck', offset: O(0, 0.12, 0), restRot: [0, 0, 0] },
    { name: 'shoulderL', parent: 'chest', offset: O(0.09, 0.13, 0), restRot: [0, 0, 0] },
    { name: 'upperArmL', parent: 'shoulderL', offset: O(0.11, 0, 0), restRot: [0, 0, -1.35] },
    { name: 'forearmL', parent: 'upperArmL', offset: O(0.26, 0, 0), restRot: [0, 0, 0] },
    { name: 'handL', parent: 'forearmL', offset: O(0.24, 0, 0), restRot: [0, 0, 0] },
    { name: 'shoulderR', parent: 'chest', offset: O(-0.09, 0.13, 0), restRot: [0, 0, 0] },
    { name: 'upperArmR', parent: 'shoulderR', offset: O(-0.11, 0, 0), restRot: [0, 0, 1.35] },
    { name: 'forearmR', parent: 'upperArmR', offset: O(0.26, 0, 0), restRot: [0, 0, 0] },
    { name: 'handR', parent: 'forearmR', offset: O(0.24, 0, 0), restRot: [0, 0, 0] },
    { name: 'upperLegL', parent: 'hips', offset: O(0.11, -0.05, 0), restRot: [0, 0, 0] },
    { name: 'lowerLegL', parent: 'upperLegL', offset: O(0, -0.42, 0), restRot: [0, 0, 0] },
    { name: 'footL', parent: 'lowerLegL', offset: O(0, -0.42, 0), restRot: [0, 0, 0] },
    { name: 'upperLegR', parent: 'hips', offset: O(-0.11, -0.05, 0), restRot: [0, 0, 0] },
    { name: 'lowerLegR', parent: 'upperLegR', offset: O(0, -0.42, 0), restRot: [0, 0, 0] },
    { name: 'footR', parent: 'lowerLegR', offset: O(0, -0.42, 0), restRot: [0, 0, 0] },
  ];
}

export function buildSkeleton(specs: BoneSpec[] = defaultRig()): {
  bones: Map<BoneName, THREE.Bone>;
  root: THREE.Group;
} {
  const bones = new Map<BoneName, THREE.Bone>();
  const byName = new Map(specs.map((s) => [s.name, s]));
  const root = new THREE.Group();
  const created = new Map<BoneName, THREE.Bone>();

  const make = (name: BoneName): THREE.Bone => {
    const cached = created.get(name);
    if (cached) return cached;
    const spec = byName.get(name)!;
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(...spec.offset);
    bone.rotation.set(...spec.restRot);
    if (spec.parent) {
      make(spec.parent).add(bone);
    } else {
      root.add(bone);
    }
    created.set(name, bone);
    bones.set(name, bone);
    return bone;
  };

  for (const s of specs) make(s.name);
  return { bones, root };
}
