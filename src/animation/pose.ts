import * as THREE from 'three';
import type { BoneName, PoseKeyframe, IntensityMap, CharacterOptions } from '../core/types';
import type { Character } from '../characters/character';

const _e = new THREE.Euler();
const _p = new THREE.Vector3();

export function applyPose(
  char: Character,
  pose: PoseKeyframe,
  intensityPose: IntensityMap | null,
  intensity: number,
  restOffsets: Map<BoneName, { p: THREE.Vector3; q: THREE.Quaternion }>,
): void {
  for (const [name, bp] of Object.entries(pose) as [BoneName, { pos?: [number, number, number]; rot?: [number, number, number] }][]) {
    const bone = char.bones.get(name);
    if (!bone) continue;
    const rest = restOffsets.get(name)!;
    if (bp.pos) _p.set(...bp.pos);
    else _p.copy(rest.p);
    if (bp.rot) _e.set(...bp.rot);
    else _e.setFromQuaternion(rest.q);
    if (intensityPose && intensity > 0) {
      const ip = intensityPose[name];
      if (ip) {
        if (ip.pos) _p.addScaledVector(new THREE.Vector3(...ip.pos), intensity);
        if (ip.rot) _e.x += ip.rot[0] * intensity, _e.y += ip.rot[1] * intensity, _e.z += ip.rot[2] * intensity;
      }
    }
    bone.position.copy(_p);
    bone.quaternion.setFromEuler(_e);
  }
}

export function captureRest(char: Character): Map<BoneName, { p: THREE.Vector3; q: THREE.Quaternion }> {
  const map = new Map<BoneName, { p: THREE.Vector3; q: THREE.Quaternion }>();
  for (const [name, bone] of char.bones) {
    map.set(name, { p: bone.position.clone(), q: bone.quaternion.clone() });
  }
  return map;
}

export function sampleCycle(cycle: PoseKeyframe[], phase: number): PoseKeyframe {
  const n = cycle.length;
  const t = ((phase % 1) + 1) % 1 * n;
  const i0 = Math.floor(t) % n;
  const i1 = (i0 + 1) % n;
  const f = t - Math.floor(t);
  const s = f * f * (3 - 2 * f);
  const a = cycle[i0];
  const b = cycle[i1];
  const out: PoseKeyframe = {};
  const keys = new Set<BoneName>([...Object.keys(a), ...Object.keys(b)] as BoneName[]);
  for (const k of keys) {
    const ka = a[k];
    const kb = b[k];
    const rotA = ka?.rot ?? kb?.rot;
    const rotB = kb?.rot ?? ka?.rot;
    const posA = ka?.pos ?? kb?.pos;
    const posB = kb?.pos ?? ka?.pos;
    const rot: [number, number, number] = [
      lerpAngle(rotA![0], rotB![0], s),
      lerpAngle(rotA![1], rotB![1], s),
      lerpAngle(rotA![2], rotB![2], s),
    ];
    const pos: [number, number, number] = [
      THREE.MathUtils.lerp(posA![0], posB![0], s),
      THREE.MathUtils.lerp(posA![1], posB![1], s),
      THREE.MathUtils.lerp(posA![2], posB![2], s),
    ];
    out[k] = { rot, pos };
  }
  return out;
}

function lerpAngle(a: number, b: number, t: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export function applySecondary(
  char: Character,
  time: number,
  speed: number,
  intensity: number,
  opts: CharacterOptions,
): void {
  const breathe = Math.sin(time * 1.9) * 0.012 + Math.sin(time * 0.7) * 0.006;
  const chest = char.bones.get('chest')!;
  chest.scale.setScalar(1 + breathe * (1 + intensity));
  const hips = char.bones.get('hips')!;
  const jig = Math.sin(time * 6.1) * 0.004 * (0.3 + intensity);
  hips.position.y += jig * (0.5 + opts.build * 0.5);
  const head = char.bones.get('head')!;
  head.rotation.z += Math.sin(time * 1.3) * 0.008;
}
