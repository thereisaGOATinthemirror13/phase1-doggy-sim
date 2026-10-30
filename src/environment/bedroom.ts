import * as THREE from 'three';

function woodMat(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.02 });
}

function fabricMat(color: number, rough = 0.95): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });
}

export interface Bedroom {
  group: THREE.Group;
  bedTopY: number;
}

export function createBedroom(): Bedroom {
  const g = new THREE.Group();

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x2a2320, roughness: 0.85, metalness: 0.05 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x35302e, roughness: 0.95 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMat);
  backWall.position.set(0, 3, -4);
  backWall.receiveShadow = true;
  g.add(backWall);
  const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), wallMat);
  sideWall.position.set(-4, 3, 0);
  sideWall.rotation.y = Math.PI / 2;
  g.add(sideWall);

  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 40),
    new THREE.MeshStandardMaterial({ color: 0x4a2f35, roughness: 1 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.005;
  rug.receiveShadow = true;
  g.add(rug);

  const frameMat = woodMat(0x4a3626);
  const bed = new THREE.Group();
  const W = 1.7, L = 2.3, H = 0.32;
  const headboard = new THREE.Mesh(new THREE.BoxGeometry(W + 0.16, 1.0, 0.1), frameMat);
  headboard.position.set(0, H + 0.5, -L / 2 - 0.05);
  headboard.castShadow = headboard.receiveShadow = true;
  bed.add(headboard);
  const base = new THREE.Mesh(new THREE.BoxGeometry(W, H, L), frameMat);
  base.position.y = H / 2;
  base.castShadow = base.receiveShadow = true;
  bed.add(base);
  for (const [x, z] of [[-W / 2 + 0.05, -L / 2 + 0.05], [W / 2 - 0.05, -L / 2 + 0.05], [-W / 2 + 0.05, L / 2 - 0.05], [W / 2 - 0.05, L / 2 - 0.05]] as const) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), frameMat);
    leg.position.set(x, 0.06, z);
    bed.add(leg);
  }

  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.06, 0.24, L - 0.06),
    fabricMat(0xe8e2d8, 0.9),
  );
  mattress.position.y = H + 0.12;
  mattress.castShadow = mattress.receiveShadow = true;
  bed.add(mattress);

  const duvet = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.04, 0.09, L * 0.62),
    fabricMat(0x7a4a52, 0.92),
  );
  duvet.position.set(0, H + 0.26, L * 0.19);
  duvet.castShadow = duvet.receiveShadow = true;
  bed.add(duvet);

  const pillowMat = fabricMat(0xf0ebe0, 0.95);
  for (const x of [-0.42, 0.42]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.13, 0.4), pillowMat);
    p.position.set(x, H + 0.31, -L / 2 + 0.32);
    p.rotation.x = -0.18;
    p.castShadow = p.receiveShadow = true;
    bed.add(p);
  }

  bed.position.set(0, 0, 0.4);
  g.add(bed);

  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.4), frameMat);
  stand.position.set(-1.35, 0.225, -1.3);
  stand.castShadow = stand.receiveShadow = true;
  g.add(stand);
  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.12, 0.03, 16),
    new THREE.MeshStandardMaterial({ color: 0xc9a86a, roughness: 0.4, metalness: 0.6 }),
  );
  lampBase.position.set(-1.35, 0.465, -1.3);
  g.add(lampBase);
  const lampShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.18, 0.22, 20, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xffd9a0,
      emissive: 0xffb46b,
      emissiveIntensity: 1.6,
      side: THREE.DoubleSide,
      roughness: 0.9,
    }),
  );
  lampShade.position.set(-1.35, 0.6, -1.3);
  g.add(lampShade);
  const lampLight = new THREE.PointLight(0xffb46b, 12, 6, 2);
  lampLight.position.set(-1.35, 0.62, -1.3);
  g.add(lampLight);

  const windowFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.8, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1d2733, emissive: 0x16222e, emissiveIntensity: 0.8, roughness: 0.6 }),
  );
  windowFrame.position.set(3.95, 2.2, -0.5);
  windowFrame.rotation.y = -Math.PI / 2;
  g.add(windowFrame);

  return { group: g, bedTopY: H + 0.26 + 0.045 };
}
