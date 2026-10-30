import * as THREE from 'three';

export function createDust(count = 220): THREE.Points {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 7;
    pos[i * 3 + 1] = Math.random() * 3.4;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 7 - 0.5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffd9a8,
    size: 0.012,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.userData.update = (t: number) => {
    const a = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      a.array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0004;
      a.array[i * 3] += Math.cos(t * 0.22 + i * 1.7) * 0.0003;
    }
    a.needsUpdate = true;
  };
  return points;
}
