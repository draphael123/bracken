// tools/harpy-anim-profile-sheet.mjs - node-only strips + loops for the PROFILE harpies (gust, gale, carrier, crag, moor, shrieker) in motion (claude/harpyanim). NO browser, NO cdp.
//   node tools/harpy-anim-profile-sheet.mjs <out-prefix> [only]  -> <prefix>-profile-<scene>.png/.gif
// The scenes drive the REAL frame chooser (src/harpy-motion.js frameOf / poseFx) with a scripted e.mode timeline, and draw the baked frames as main.js's drawSet does (rotation about the feet anchor, squash for the turn).
import { setup, rgbaOf } from './harpy-anim-lib.mjs';
import { newCanvas, sheet, savePNG } from './node-canvas.mjs';
import { gif } from './gif-lib.mjs';
import { writeFileSync } from 'node:fs';
setup();
const GA = await import('../src/redraw/gale_harpy_art.js'), HM = await import('../src/harpy-motion.js');
const out = process.argv[2] || 'harpyanim', only = process.argv[3];
const SETS = { gust: GA.bakeGustHarpy(), gale: GA.bakeGaleHarpy(), carrier: GA.bakeCarrierHarpy(), crag: GA.bakeWomanHarpy('crag'), moor: GA.bakeWomanHarpy('moor'), shrieker: GA.bakeWomanHarpy('shrieker') };
const CW = 96, CH = 76, BG = '#7aa0c8', DT = 1 / 30;
function drawSet(g, set, frame, x, y, o, white) {   /* like main.js drawSet: o = { face, sx, sy, rot, dx, dy } */
  const face = o.face, c = (white ? set.white : set)[face < 0 ? 'L' : 'R'][frame], ax = face < 0 ? c.width - set.ax : set.ax;
  g.save(); g.translate(Math.round(x + o.dx), Math.round(y + o.dy)); if (o.rot) g.rotate(o.rot); g.scale(o.sx, o.sy); g.drawImage(c, -ax, -set.ay); g.restore();
}
/* script: [{ t, patch }]; path(t) -> [dx, dy]; carrier option; returns canvases */
function scene(kind, script, T, o = {}) {
  const set = SETS[kind], e = { t: o.type || (kind === 'gust' ? 'gustharpy' : kind === 'gale' ? 'galeharpy' : 'harpy'), mode: 'hover', face: 1, alive: true, hx: 10 + (o.seed || 0), flash: 0, vy: 0, ...(o.e || {}) }, frames = [], names = [];
  let seg = 0, flashUntil = -9;
  for (let t = 0; t < T; t += DT) {
    while (seg < script.length && script[seg].t <= t + 1e-9) { Object.assign(e, script[seg].patch); if (script[seg].flash) flashUntil = t + 0.12; seg++; }
    e.flash = t < flashUntil ? 0.1 : 0;
    const fr = HM.frameOf(e, t, { carrier: kind === 'carrier' }), p = { dx: 0, dy: 0, sx: 1, sy: 1, face: e.face, rot: 0 };
    if (e.flash > 0) { const k = 1; p.dx += -e.face * 3.4 * k; p.dy -= 1; p.sy *= 0.89; p.sx *= 1.13; p.rot = -e.face * 0.16 * k; }   /* main.js poseOf's STRUCK recoil */
    HM.poseFx(p, e, t);
    const c = newCanvas(CW, CH), g = c.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, CW, CH); g.fillStyle = '#5a7a5a'; g.fillRect(0, CH - 6, CW, 6);
    const [px, py] = o.path ? o.path(t, e) : [0, 0];
    drawSet(g, set, fr, 40 + px, 52 + py, p, e.flash > 0); frames.push(c); names.push(fr);
  }
  return { frames, names };
}
const save = (name, rows, pickEvery, delayCs) => {
  const n = rows[0].length, W = CW * rows.length, rg = [];
  for (let i = 0; i < n; i++) { const c = newCanvas(W, CH), g = c.getContext('2d'); rows.forEach((fr, k) => g.drawImage(fr[i], k * CW, 0)); rg.push(rgbaOf(c, 3)); }
  writeFileSync(`${out}-profile-${name}.gif`, gif(rg, W * 3, CH * 3, delayCs));
  const strips = rows.map(fr => { const pk = []; for (let i = 0; i < fr.length; i += pickEvery) pk.push(fr[i]); return sheet(pk, { maxW: 8 * (CW + 2) + 2, bg: BG, pad: 2 }); });
  const H = strips.reduce((a, c) => a + c.height, 0), c = newCanvas(strips[0].width, H), g = c.getContext('2d'); let y = 0; for (const r of strips) { g.drawImage(r, 0, y); y += r.height; }
  const big = newCanvas(c.width * 2, c.height * 2); big.getContext('2d').drawImage(c, 0, 0, c.width * 2, c.height * 2); savePNG(big, `${out}-profile-${name}.png`); console.log(name, n);
};
const KINDS = ['gust', 'gale', 'carrier', 'crag', 'moor', 'shrieker'];
const S = {
  flap: () => KINDS.map(k => scene(k, k === 'carrier' ? [{ t: 0, patch: { mode: 'carry' } }] : [], 1.5).frames),
  tell: () => ['gust', 'gale', 'crag', 'shrieker'].map((k, i) => scene(k, [{ t: 0.3, patch: { mode: k === 'gust' ? 'gustTell' : k === 'gale' ? 'galeTell' : 'aim' } }, { t: 1.2, patch: { mode: k === 'crag' || k === 'shrieker' ? 'dive' : 'gust' } }, { t: 1.7, patch: { mode: k === 'crag' || k === 'shrieker' ? 'rise' : 'hover' } }], 2.6).frames),
  dive: () => ['crag', 'moor', 'shrieker'].map(k => scene(k, [{ t: 0.3, patch: { mode: 'aim' } }, { t: 1.0, patch: { mode: 'dive' } }, { t: 1.45, patch: { mode: 'rise' } }, { t: 2.45, patch: { mode: 'hover' } }], 3, { path: (t) => t < 1 ? [0, -10] : t < 1.45 ? (() => { const q = (t - 1) / 0.45; return [q * 28, -10 + q * q * 30]; })() : t < 2.45 ? [28 - (t - 1.45) * 28, 20 - (t - 1.45) * 30] : [0, -10] }).frames),
  stun: () => ['gust', 'crag', 'shrieker'].map(k => scene(k, [{ t: 0.1, patch: { mode: 'hover' }, flash: true }, { t: 0.15, patch: { mode: 'downed', gMode: 'downed', t: k === 'gust' ? 'gustharpy' : 'harpy' } }, { t: 0.95, patch: { gMode: 'grounded' } }, { t: 3.6, patch: { mode: 'hover', gMode: 'hover' } }], 4.4,
    { path: (t) => t < 0.95 ? [0, -10 + Math.min(1, Math.max(0, (t - 0.15)) / 0.8) ** 2 * 10] : [0, t > 3.6 ? -Math.min(10, (t - 3.6) * 20) : 0] }).frames),
  turn: () => ['gust', 'crag', 'gale'].map(k => scene(k, [{ t: 0.5, patch: { face: -1 } }, { t: 1.4, patch: { face: 1 } }, { t: 1.55, patch: { face: -1 } }], 2.2).frames),
  carry: () => [scene('carrier', [{ t: 0, patch: { mode: 'perch' } }, { t: 0.6, patch: { mode: 'carry' } }, { t: 2.4, patch: { mode: 'fly' } }], 3.2).frames],
};
for (const [name, mk] of Object.entries(S)) { if (only && only !== name) continue; save(name, mk(), name === 'flap' ? 2 : 3, name === 'flap' ? 3 : 4); }
