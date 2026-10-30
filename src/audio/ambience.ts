// Procedural ambient drone via WebAudio — no external files, muted by default.
export class Ambience {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private muted = true;

  private ensure(): boolean {
    if (this.ctx) return true;
    try {
      this.ctx = new AudioContext();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 0;
      this.gain.connect(this.ctx.destination);
      const o1 = this.ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.value = 82.4;
      const o2 = this.ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = 123.5;
      const o3 = this.ctx.createOscillator();
      o3.type = 'triangle';
      o3.frequency.value = 164.8;
      const g3 = this.ctx.createGain();
      g3.gain.value = 0.25;
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain).connect(this.gain.gain);
      o1.connect(this.gain);
      o2.connect(this.gain);
      o3.connect(g3).connect(this.gain);
      o1.start(); o2.start(); o3.start(); lfo.start();
      return true;
    } catch {
      return false;
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (!m && this.ensure() && this.ctx && this.gain) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      this.gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.8);
    } else if (this.ctx && this.gain) {
      this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    }
  }

  get isMuted() { return this.muted; }
}
