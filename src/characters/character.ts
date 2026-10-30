import * as THREE from 'three';
import { buildSkeleton, defaultRig, type BoneSpec } from '../core/rig';
import type { BoneName, CharacterOptions } from '../core/types';

export const SKIN_TONES: number[] = [
  0xf5d5c0, 0xe8bfa0, 0xd9a67e, 0xc08552, 0x9c6b3f, 0x6f4a26, 0x4e3319,
];

export function skinColor(t: number): THREE.Color {
  const x = THREE.MathUtils.clamp(t, 0, 1) * (SKIN_TONES.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = new THREE.Color(SKIN_TONES[i]);
  const b = new THREE.Color(SKIN_TONES[Math.min(i + 1, SKIN_TONES.length - 1)]);
  return a.lerp(b, f);
}

function hairNoiseTexture(): THREE.CanvasTexture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, s, s);
  const img = ctx.getImageData(0, 0, s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 110 + Math.random() * 80;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

interface Part {
  geo: THREE.BufferGeometry;
  bone: BoneName;
  matrix: THREE.Matrix4;
}

function capsule(r1: number, r2: number, len: number, radial = 12, capSegs = 6): THREE.BufferGeometry {
  const cyl = new THREE.CylinderGeometry(r2, r1, len, radial, 1, true);
  const top = new THREE.SphereGeometry(r2, radial, capSegs, 0, Math.PI * 2, 0, Math.PI / 2);
  const bot = new THREE.SphereGeometry(r1, radial, capSegs, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  top.translate(0, len / 2, 0);
  bot.rotateX(Math.PI);
  bot.translate(0, -len / 2, 0);
  return mergeGeos([cyl, top, bot]);
}

function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let total = 0;
  const nonIndexed = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  for (const g of nonIndexed) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  let o = 0;
  for (const g of nonIndexed) {
    pos.set(g.attributes.position.array as Float32Array, o * 3);
    nor.set(g.attributes.normal.array as Float32Array, o * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array as Float32Array, o * 2);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}

function part(geo: THREE.BufferGeometry, bone: BoneName, matrix?: THREE.Matrix4): Part {
  return { geo, bone, matrix: matrix ?? new THREE.Matrix4() };
}

function compose(parts: Part[], boneIndex: Map<BoneName, number>): THREE.BufferGeometry {
  const geos: THREE.BufferGeometry[] = [];
  for (const p of parts) {
    const g = p.geo.clone();
    g.applyMatrix4(p.matrix);
    const n = g.attributes.position.count;
    const idx = new Uint16Array(n);
    const w = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      idx[i] = boneIndex.get(p.bone)!;
      w[i] = 1;
    }
    g.setAttribute('skinIndex', new THREE.BufferAttribute(idx, 4));
    g.setAttribute('skinWeight', new THREE.BufferAttribute(w, 4));
    geos.push(g);
  }
  return mergeGeos(geos);
}

const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();
function m(px: number, py: number, pz: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1): THREE.Matrix4 {
  tmpQ.setFromEuler(new THREE.Euler(rx, ry, rz));
  tmpV.set(px, py, pz);
  tmpS.set(sx, sy, sz);
  return new THREE.Matrix4().compose(tmpV, tmpQ, tmpS);
}

export interface Character {
  group: THREE.Group;
  bones: Map<BoneName, THREE.Bone>;
  mesh: THREE.SkinnedMesh;
  setOptions(o: CharacterOptions): void;
  options: CharacterOptions;
}

export function createCharacter(opts: CharacterOptions): Character {
  const specs: BoneSpec[] = defaultRig();
  const { bones, root } = buildSkeleton(specs);
  const boneList = [...bones.values()];
  const boneIndex = new Map<BoneName, number>();
  boneList.forEach((b, i) => boneIndex.set(b.name as BoneName, i));
  const skeleton = new THREE.Skeleton(boneList);

  const build = opts.build;
  const w = 1 + build * 0.22;
  const parts: Part[] = [];

  const pelvis = new THREE.SphereGeometry(0.155, 20, 16);
  parts.push(part(pelvis, 'hips', m(0, 0.02, 0.01, 0, 0, 0, w, 0.92, 1.05)));
  const buttL = new THREE.SphereGeometry(0.085, 14, 12);
  parts.push(part(buttL, 'hips', m(0.062, -0.015, -0.075, 0, 0, 0.15)));
  const buttR = new THREE.SphereGeometry(0.085, 14, 12);
  parts.push(part(buttR, 'hips', m(-0.062, -0.015, -0.075, 0, 0, -0.15)));
  parts.push(part(capsule(0.105, 0.125, 0.16, 14), 'spine', m(0, 0.06, 0.01, 0.12, 0, 0, w, 1, 0.95)));
  parts.push(part(capsule(0.125, 0.14, 0.2, 16), 'chest', m(0, 0.08, 0.01, 0.1, 0, 0, w, 1, 1)));
  const pecL = new THREE.SphereGeometry(0.068, 14, 12);
  parts.push(part(pecL, 'chest', m(0.062, 0.1, 0.1, -0.35, 0, 0, 1, 0.75, 0.55)));
  const pecR = new THREE.SphereGeometry(0.068, 14, 12);
  parts.push(part(pecR, 'chest', m(-0.062, 0.1, 0.1, -0.35, 0, 0, 1, 0.75, 0.55)));
  parts.push(part(capsule(0.045, 0.05, 0.1, 10), 'neck', m(0, 0.05, 0.01)));
  const skull = new THREE.SphereGeometry(0.105, 20, 16);
  parts.push(part(skull, 'head', m(0, 0.09, 0.01, 0, 0, 0, 0.92, 1.05, 1)));
  const jaw = new THREE.SphereGeometry(0.075, 14, 12);
  parts.push(part(jaw, 'head', m(0, 0.015, 0.045, 0, 0, 0, 0.95, 0.8, 1.05)));
  const armL: Part[] = [
    part(capsule(0.048, 0.042, 0.24, 10), 'upperArmL', m(0.13, 0, 0)),
    part(capsule(0.04, 0.033, 0.22, 10), 'forearmL', m(0.24, 0, 0)),
    part(new THREE.BoxGeometry(0.07, 0.09, 0.035), 'handL', m(0.48, 0, 0)),
  ];
  const armR: Part[] = [
    part(capsule(0.048, 0.042, 0.24, 10), 'upperArmR', m(-0.13, 0, 0)),
    part(capsule(0.04, 0.033, 0.22, 10), 'forearmR', m(0.24, 0, 0)),
    part(new THREE.BoxGeometry(0.07, 0.09, 0.035), 'handR', m(0.48, 0, 0)),
  ];
  parts.push(...armL, ...armR);
  const legL: Part[] = [
    part(capsule(0.075, 0.06, 0.4, 12), 'upperLegL', m(0, -0.21, 0, 0, 0, 0, w, 1, 1)),
    part(capsule(0.055, 0.04, 0.4, 12), 'lowerLegL', m(0, -0.42, 0)),
    part(new THREE.BoxGeometry(0.085, 0.05, 0.2), 'footL', m(0, -0.42, 0.07, -Math.PI / 2 + 0.15, 0, 0)),
  ];
  const legR: Part[] = [
    part(capsule(0.075, 0.06, 0.4, 12), 'upperLegR', m(0, -0.21, 0, 0, 0, 0, w, 1, 1)),
    part(capsule(0.055, 0.04, 0.4, 12), 'lowerLegR', m(0, -0.42, 0)),
    part(new THREE.BoxGeometry(0.085, 0.05, 0.2), 'footR', m(0, -0.42, 0.07, -Math.PI / 2 + 0.15, 0, 0)),
  ];
  parts.push(...legL, ...legR);
  const shaft = capsule(0.026, 0.03, 0.13, 10);
  parts.push(part(shaft, 'hips', m(0, -0.045, 0.13, Math.PI / 2 - 0.5, 0, 0)));
  const glans = new THREE.SphereGeometry(0.032, 12, 10);
  parts.push(part(glans, 'hips', m(0, -0.045, 0.185, 0, 0, 0, 1, 1, 1.25)));
  const testL = new THREE.SphereGeometry(0.032, 10, 8);
  parts.push(part(testL, 'hips', m(0.028, -0.075, -0.02)));
  const testR = new THREE.SphereGeometry(0.032, 10, 8);
  parts.push(part(testR, 'hips', m(-0.028, -0.075, -0.02)));

  const geo = compose(parts, boneIndex);
  const mat = new THREE.MeshPhysicalMaterial({
    color: skinColor(opts.skinTone),
    roughness: 0.62,
    metalness: 0.0,
    sheen: 0.25,
    sheenRoughness: 0.6,
    clearcoat: 0.12,
    clearcoatRoughness: 0.5,
  });
  const mesh = new THREE.SkinnedMesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);
  skeleton.calculateInverses();
  mesh.bind(skeleton);

  const group = new THREE.Group();
  group.add(root);
  group.scale.setScalar(opts.heightScale);

  const noiseTex = hairNoiseTexture();

  const char: Character = {
    group,
    bones,
    mesh,
    options: opts,
    setOptions(o: CharacterOptions) {
      char.options = o;
      group.scale.setScalar(o.heightScale);
      (mat.color as THREE.Color).copy(skinColor(o.skinTone));
      mat.bumpMap = o.bodyHair > 0.02 ? noiseTex : null;
      mat.bumpScale = 0.4 * o.bodyHair;
      mat.needsUpdate = true;
    },
  };
  char.setOptions(opts);
  return char;
}
