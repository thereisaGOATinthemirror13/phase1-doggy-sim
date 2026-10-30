import type { AppState, LightingPresetId } from '../core/types';

export interface UiCallbacks {
  onAnim(anim: Partial<AppState['anim']>): void;
  onLighting(id: LightingPresetId): void;
  onFov(f: number): void;
  onMute(m: boolean): void;
  onCharA(o: Partial<AppState['charA']>): void;
  onCharB(o: Partial<AppState['charB']>): void;
  onPreset(index: number): void;
  presetNames: string[];
}

const css = `
.ui-root { position: fixed; z-index: 10; font-family: 'Segoe UI', system-ui, sans-serif; color: #ddd; user-select: none; }
.panel {
  position: absolute; bottom: 18px; left: 18px; width: 250px;
  background: rgba(14,14,18,0.72); backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 16px;
  transition: opacity .35s, transform .35s;
}
.panel.hidden { opacity: 0; transform: translateY(8px); pointer-events: none; }
.panel h3 { margin: 0 0 10px; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: #8f8fa3; font-weight: 600; }
.row { margin: 9px 0; }
.row label { display: flex; justify-content: space-between; font-size: 11.5px; color: #b9b9c9; margin-bottom: 4px; }
.row label span { color: #e8e8f2; font-variant-numeric: tabular-nums; }
input[type=range] { width: 100%; accent-color: #c98f5f; height: 14px; cursor: pointer; }
.btns { display: flex; gap: 6px; margin: 10px 0 2px; flex-wrap: wrap; }
button {
  background: rgba(255,255,255,0.07); color: #ddd; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 5px 10px; font-size: 11.5px; cursor: pointer; transition: background .15s;
}
button:hover { background: rgba(255,255,255,0.14); }
button.active { background: #c98f5f; color: #16121a; border-color: #c98f5f; font-weight: 600; }
.toggle-btn { position: absolute; top: 18px; left: 18px; z-index: 11; }
.cams { position: absolute; top: 18px; right: 18px; display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; max-width: 46vw; }
.hr { height: 1px; background: rgba(255,255,255,0.08); margin: 12px 0 4px; }
`;

function slider(label: string, min: number, max: number, step: number, value: number, fmt: (v: number) => string, onInput: (v: number) => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'row';
  const lab = document.createElement('label');
  const name = document.createElement('span');
  name.textContent = label;
  const val = document.createElement('span');
  val.textContent = fmt(value);
  lab.append(name, val);
  const inp = document.createElement('input');
  inp.type = 'range';
  inp.min = String(min); inp.max = String(max); inp.step = String(step); inp.value = String(value);
  inp.addEventListener('input', () => {
    const v = parseFloat(inp.value);
    val.textContent = fmt(v);
    onInput(v);
  });
  row.append(lab, inp);
  return row;
}

export function createSettingsUI(state: AppState, cb: UiCallbacks): { root: HTMLElement; toggle: () => void } {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'ui-root';

  const panel = document.createElement('div');
  panel.className = 'panel';
  const h = document.createElement('h3');
  h.textContent = 'Controls';
  panel.appendChild(h);

  const btns = document.createElement('div');
  btns.className = 'btns';
  const playBtn = document.createElement('button');
  playBtn.textContent = state.anim.playing ? '⏸ Pause' : '▶ Play';
  playBtn.addEventListener('click', () => {
    cb.onAnim({ playing: !state.anim.playing });
    playBtn.textContent = state.anim.playing ? '⏸ Pause' : '▶ Play';
  });
  btns.appendChild(playBtn);
  panel.appendChild(btns);

  panel.appendChild(slider('Speed', 0.25, 2, 0.05, state.anim.speed, (v) => `${v.toFixed(2)}×`, (v) => cb.onAnim({ speed: v })));
  panel.appendChild(slider('Intensity / Depth', 0, 1, 0.01, state.anim.intensity, (v) => `${Math.round(v * 100)}%`, (v) => cb.onAnim({ intensity: v })));
  panel.appendChild(slider('Camera FOV', 25, 75, 1, state.fov, (v) => `${Math.round(v)}°`, (v) => cb.onFov(v)));

  const hr1 = document.createElement('div');
  hr1.className = 'hr';
  panel.appendChild(hr1);
  const h2 = document.createElement('h3');
  h2.textContent = 'Lighting';
  panel.appendChild(h2);
  const lightBtns = document.createElement('div');
  lightBtns.className = 'btns';
  for (const id of ['warm', 'moody', 'neon'] as LightingPresetId[]) {
    const b = document.createElement('button');
    b.textContent = id === 'warm' ? 'Soft Warm' : id === 'moody' ? 'Moody Dark' : 'Neon';
    if (state.lighting === id) b.classList.add('active');
    b.addEventListener('click', () => {
      cb.onLighting(id);
      lightBtns.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
    });
    lightBtns.appendChild(b);
  }
  panel.appendChild(lightBtns);

  const hr2 = document.createElement('div');
  hr2.className = 'hr';
  panel.appendChild(hr2);
  const h3 = document.createElement('h3');
  h3.textContent = 'Partner A (front)';
  panel.appendChild(h3);
  panel.appendChild(slider('Skin tone', 0, 1, 0.01, state.charA.skinTone, (v) => `${Math.round(v * 100)}%`, (v) => cb.onCharA({ skinTone: v })));
  panel.appendChild(slider('Body hair', 0, 1, 0.01, state.charA.bodyHair, (v) => `${Math.round(v * 100)}%`, (v) => cb.onCharA({ bodyHair: v })));

  const h4 = document.createElement('h3');
  h4.textContent = 'Partner B (behind)';
  panel.appendChild(h4);
  panel.appendChild(slider('Skin tone', 0, 1, 0.01, state.charB.skinTone, (v) => `${Math.round(v * 100)}%`, (v) => cb.onCharB({ skinTone: v })));
  panel.appendChild(slider('Body hair', 0, 1, 0.01, state.charB.bodyHair, (v) => `${Math.round(v * 100)}%`, (v) => cb.onCharB({ bodyHair: v })));

  const hr3 = document.createElement('div');
  hr3.className = 'hr';
  panel.appendChild(hr3);
  const muteBtn = document.createElement('button');
  muteBtn.textContent = state.muted ? '🔇 Sound off' : '🔊 Sound on';
  muteBtn.addEventListener('click', () => {
    cb.onMute(!state.muted);
    muteBtn.textContent = state.muted ? '🔇 Sound off' : '🔊 Sound on';
  });
  panel.appendChild(muteBtn);

  const toggle = document.createElement('button');
  toggle.className = 'toggle-btn';
  toggle.textContent = '⚙';
  toggle.title = 'Toggle controls';
  toggle.addEventListener('click', () => panel.classList.toggle('hidden'));

  const cams = document.createElement('div');
  cams.className = 'cams ui-root';
  cb.presetNames.forEach((name, i) => {
    const b = document.createElement('button');
    b.textContent = name;
    b.addEventListener('click', () => cb.onPreset(i));
    cams.appendChild(b);
  });

  root.append(panel, toggle, cams);
  document.body.appendChild(root);
  return { root, toggle: () => panel.classList.toggle('hidden') };
}
