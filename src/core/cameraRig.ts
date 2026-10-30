import * as THREE from 'three';
import type { CameraPreset } from './types';

export class CameraRig {
  camera: THREE.PerspectiveCamera;
  private dom: HTMLElement;
  private target = new THREE.Vector3(0, 1, 0.3);
  private desiredTarget = this.target.clone();
  private spherical = new THREE.Spherical(2.6, 1.15, 0.6);
  private desiredSpherical = this.spherical.clone();
  private transition: { from: THREE.Vector3; to: THREE.Vector3; fromT: THREE.Vector3; toT: THREE.Vector3; fovFrom: number; fovTo: number; t: number; dur: number } | null = null;

  constructor(dom: HTMLElement, fov = 45) {
    this.dom = dom;
    this.camera = new THREE.PerspectiveCamera(fov, dom.clientWidth / dom.clientHeight, 0.05, 60);
    this.updateFromSpherical();
    this.bindInput();
  }

  private updateFromSpherical() {
    const p = new THREE.Vector3().setFromSpherical(this.spherical).add(this.target);
    this.camera.position.copy(p);
    this.camera.lookAt(this.target);
  }

  private bindInput() {
    let dragging = false;
    let panning = false;
    let px = 0, py = 0;
    this.dom.addEventListener('pointerdown', (e) => {
      dragging = true;
      panning = e.button === 2 || e.shiftKey;
      px = e.clientX; py = e.clientY;
      this.transition = null;
      this.dom.setPointerCapture(e.pointerId);
    });
    this.dom.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      px = e.clientX; py = e.clientY;
      if (panning) {
        const dist = this.camera.position.distanceTo(this.desiredTarget);
        const panScale = dist * 0.0016;
        const fwd = new THREE.Vector3();
        this.camera.getWorldDirection(fwd);
        const right = new THREE.Vector3().crossVectors(fwd, this.camera.up).normalize();
        const up = new THREE.Vector3().crossVectors(right, fwd);
        this.desiredTarget.addScaledVector(right, -dx * panScale).addScaledVector(up, dy * panScale);
      } else {
        this.desiredSpherical.theta -= dx * 0.005;
        this.desiredSpherical.phi = THREE.MathUtils.clamp(this.desiredSpherical.phi - dy * 0.005, 0.12, Math.PI - 0.12);
      }
    });
    const end = () => { dragging = false; };
    this.dom.addEventListener('pointerup', end);
    this.dom.addEventListener('pointercancel', end);
    this.dom.addEventListener('contextmenu', (e) => e.preventDefault());
    this.dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.transition = null;
      this.desiredSpherical.radius = THREE.MathUtils.clamp(this.desiredSpherical.radius * (1 + Math.sign(e.deltaY) * 0.09), 0.5, 8);
    }, { passive: false });
  }

  goToPreset(preset: CameraPreset, duration = 1.4) {
    const toPos = new THREE.Vector3(...preset.position);
    const toTarget = new THREE.Vector3(...preset.target);
    this.transition = {
      from: this.camera.position.clone(),
      to: toPos,
      fromT: this.target.clone(),
      toT: toTarget,
      fovFrom: this.camera.fov,
      fovTo: preset.fov,
      t: 0,
      dur: duration,
    };
    this.desiredTarget.copy(toTarget);
    const offset = toPos.clone().sub(toTarget);
    this.desiredSpherical.setFromVector3(offset);
  }

  setFov(fov: number) {
    if (!this.transition) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  update(dt: number) {
    if (this.transition) {
      const tr = this.transition;
      tr.t += dt / tr.dur;
      const k = tr.t >= 1 ? 1 : tr.t * tr.t * (3 - 2 * tr.t);
      this.camera.position.lerpVectors(tr.from, tr.to, k);
      this.target.lerpVectors(tr.fromT, tr.toT, k);
      this.camera.fov = THREE.MathUtils.lerp(tr.fovFrom, tr.fovTo, k);
      this.camera.updateProjectionMatrix();
      if (tr.t >= 1) {
        this.spherical.setFromVector3(tr.to.clone().sub(tr.toT));
        this.transition = null;
      }
      this.camera.lookAt(this.target);
      return;
    }
    const damp = 1 - Math.exp(-dt * 10);
    this.spherical.theta += (this.desiredSpherical.theta - this.spherical.theta) * damp;
    this.spherical.phi += (this.desiredSpherical.phi - this.spherical.phi) * damp;
    this.spherical.radius += (this.desiredSpherical.radius - this.spherical.radius) * damp;
    this.target.lerp(this.desiredTarget, damp);
    this.updateFromSpherical();
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
