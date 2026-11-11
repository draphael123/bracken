// THE MAKER'S JUICE (claude/maker, Daniel 2026-11-09: "make it feel like Mario Maker ... satisfying"). Every edit answers:
// placing pops (and a drag climbs a scale), erasing puffs dust, picking a piece clicks, play whooshes in and out, undo
// rewinds. Small synthesized sounds (no files), drawn effects over the level; nothing here touches the game's own state.
let ac = null, out = null, vol = 0.22, stroke = 0, strokeT = 0;
/* ITS OWN DICE: the noise and the dust never draw on Math.random, which is the GAME's stream (a seeded test pins it; a
   whoosh into play spent ~12000 rolls and changed what every foe did after it - 2026-11-09) */
let seed = 0x9e3779b9; const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const FX = [];
function ctx() {
  if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A(); out = ac.createGain(); out.gain.value = vol; out.connect(ac.destination); }
  if (ac.state === 'suspended') ac.resume(); return ac;
}
export function setVolume(v) { vol = Math.max(0, Math.min(1, v)); if (out) out.gain.value = vol; }
function tone(f0, f1, dur, type = 'square', g0 = 0.5, delay = 0) {
  const c = ctx(); if (!c || vol <= 0) return; const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(g0, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, g0 = 0.4, hp = 900) {
  const c = ctx(); if (!c || vol <= 0) return; const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (rand() * 2 - 1) * (1 - i / n);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'highpass'; f.frequency.value = hp; g.gain.value = g0;
  s.buffer = b; s.connect(f); f.connect(g); g.connect(out); s.start();
}
const SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];   // a major pentatonic run: a long drag climbs it
export function strokeStart() { stroke = 0; }
export function place(kind) {   // kind: 'tile' | 'piece'
  const now = performance.now(); if (now - strokeT > 400) stroke = 0; strokeT = now;
  const f = 330 * Math.pow(2, SCALE[Math.min(stroke++, SCALE.length - 1)] / 12);
  if (kind === 'piece') { tone(f * 1.5, f * 2, 0.08, 'square', 0.35); tone(f * 2, f * 2, 0.06, 'triangle', 0.25, 0.05); }
  else tone(f, f * 1.25, 0.06, 'triangle', 0.5);
}
export function erase() { noise(0.12, 0.35, 1400); tone(260, 120, 0.09, 'triangle', 0.3); }
export function pick() { tone(880, 1320, 0.05, 'square', 0.25); }
export function undo() { tone(700, 300, 0.12, 'triangle', 0.4); tone(500, 220, 0.12, 'triangle', 0.25, 0.06); }
export function whoosh(back) { noise(0.25, 0.25, back ? 2500 : 600); tone(back ? 900 : 300, back ? 300 : 900, 0.22, 'sine', 0.35); }
export function refuse() { tone(180, 140, 0.15, 'square', 0.3); }

// ---------------- drawn effects ----------------
export function popAt(tx, ty) { FX.push({ k: 'pop', x: tx * 16 + 8, y: ty * 16 + 8, t: 0 }); }
export function poofAt(tx, ty) { for (let i = 0; i < 6; i++) { const a = rand() * Math.PI * 2; FX.push({ k: 'dust', x: tx * 16 + 8, y: ty * 16 + 8, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30 - 10, t: 0 }); } }
export function draw(g, cx, cy, dt) {
  for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.t += dt;
    if (f.k === 'pop') { if (f.t > 0.25) { FX.splice(i, 1); continue; } const k = f.t / 0.25, r = 6 + k * 10;
      g.globalAlpha = 1 - k; g.strokeStyle = '#fff6c8'; g.lineWidth = 2; g.beginPath(); g.arc(f.x - cx, f.y - cy, r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
    else { if (f.t > 0.4) { FX.splice(i, 1); continue; } f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 40 * dt;
      g.globalAlpha = 1 - f.t / 0.4; g.fillStyle = '#d8d0c0'; g.fillRect(Math.round(f.x - cx) - 1, Math.round(f.y - cy) - 1, 3, 3); g.globalAlpha = 1; } }
}
