// tools/harpy-anim-sheet.mjs - node-only strips + loops for the HARPYANIM pass (claude/harpyanim). NO browser, NO cdp.
//   node tools/harpy-anim-sheet.mjs <out-prefix> [only]   -> <prefix>-<name>.png (strips) + .gif (loops): flap, dive, attack, stun, turn, hurt, death
import { setup, rgbaOf } from './harpy-anim-lib.mjs';
import { newCanvas, sheet, savePNG } from './node-canvas.mjs';
import { gif } from './gif-lib.mjs';
import { writeFileSync } from 'node:fs';
setup();
const SA = await import('../src/redraw/shriek_sisters_art.js'), HS = await import('../src/shriek-sisters-hands.js');
const out = process.argv[2] || 'harpyanim', only = process.argv[3];
const CWd = 160, CHt = 112, BG = '#7aa0c8', DT = 1 / 30;
/* one sister, a script of { t, s: state patch, flash } segments, sampled every DT; returns canvases (160x112) */
function run(role, script, T, opt = {}) {
  const b = {}, s = { mode: 'hover', face: -1, y: -20 }, frames = [], G = { floorY: 0 };
  let seg = 0, flashAt = -9;
  for (let t = 0; t < T; t += DT) {
    while (seg < script.length && script[seg].t <= t + 1e-9) { Object.assign(s, script[seg].s); if (script[seg].flash) flashAt = t; seg++; }
    const flash = t - flashAt < DT * 1.5;
    const p = HS.poseOf(s, b, t, flash, G), c = newCanvas(CWd, CHt), g = c.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, CWd, CHt);
    g.fillStyle = '#5a7a5a'; g.fillRect(0, 104, CWd, 8);
    const px = opt.path ? opt.path(t, s) : [0, 0];
    g.save(); g.translate(Math.round(80 + (px[0] || 0)), Math.round(100 + (px[1] || 0))); g.scale(HS._turnScale(b, s.face, t) * -1, 1);
    SA.drawSister(g, role, p, flash, t, false, '', b); g.restore();
    frames.push(c);
  }
  return frames;
}
const ROLES = ['diver', 'shrieker', 'snatcher'];
const save = (name, framesByRole, pickEvery, delayCs) => {
  const n = framesByRole[0].length, W = CWd * framesByRole.length, rg = [];
  for (let i = 0; i < n; i++) { const c = newCanvas(W, CHt), g = c.getContext('2d'); framesByRole.forEach((fr, k) => g.drawImage(fr[i], k * CWd, 0)); rg.push(rgbaOf(c, 2)); }
  writeFileSync(`${out}-${name}.gif`, gif(rg, W * 2, CHt * 2, delayCs));
  const rows = framesByRole.map(fr => { const pk = []; for (let i = 0; i < fr.length; i += pickEvery) pk.push(fr[i]); return sheet(pk, { maxW: 6 * (CWd + 2) + 2, bg: BG, pad: 2 }); });
  const H = rows.reduce((a, c) => a + c.height, 0), c = newCanvas(rows[0].width, H), g = c.getContext('2d'); let y = 0; for (const r of rows) { g.drawImage(r, 0, y); y += r.height; }
  savePNG(c, `${out}-${name}.png`);
  console.log(name, n, 'frames');
};
const diveSim = (t) => t < 1.05 ? [-35, -10 + Math.sin(t * 6)] : t < 1.5 ? (() => { const k = (t - 1.05) / 0.45; return [-35 + k * 55, -10 + k * k * 48]; })() : t < 2.15 ? [20 - (t - 1.5) / 0.65 * 15, 38 - (t - 1.5) / 0.65 * 10] : [5 - Math.min(1, (t - 2.15) / 0.7) * 40, 28 - Math.min(1, (t - 2.15) / 0.7) * 38];
const sisters = {
  flap: () => ROLES.map(r => run(r, [], 1.4)),
  dive: () => ROLES.map(r => run(r, [{ t: 0.3, s: { mode: 'diveTell' } }, { t: 1.05, s: { mode: 'dive' } }, { t: 1.5, s: { mode: 'land' } }, { t: 2.15, s: { mode: 'hover' } }], 2.9, { path: diveSim })),
  attack: () => ROLES.map((r, i) => run(r, [{ t: 0.3, s: { mode: ['shockTell', 'screamTell', 'snatchTell'][i] } }, { t: 1.4, s: { mode: ['shock', 'scream', 'snatch'][i] } }, { t: 2.0, s: { mode: 'hover' } }], 2.7)),
  stun: () => ROLES.map(r => run(r, [{ t: 0.15, s: { mode: 'stuck' }, flash: true }, { t: 2.3, s: { mode: 'hover' } }], 3.0)),
  turn: () => ROLES.map(r => run(r, [{ t: 0.6, s: { face: 1 } }, { t: 1.6, s: { face: -1 } }], 2.4)),
  hurt: () => ROLES.map(r => run(r, [{ t: 0.4, s: {}, flash: true }, { t: 1.2, s: {}, flash: true }], 1.8)),
};
for (const [name, mk] of Object.entries(sisters)) {
  if (only && only !== name) continue;
  save(name, mk(), name === 'flap' ? 2 : name === 'attack' || name === 'dive' ? 3 : 4, name === 'flap' ? 3 : 4);
}
if (!only || only === 'death') {
  const rows = ROLES.map(r => { const frs = [], b = {}; const DEATH = { T: 1.9, struck: 0.28, fall: 0.8 };
    for (let t = 0; t < 1.9; t += DT) { const c = newCanvas(CWd, CHt), g = c.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, CWd, CHt); g.fillStyle = '#5a7a5a'; g.fillRect(0, 100, CWd, 12);
      const fl = 100; let sy = 40, rot = 0, pn = 'dead1', gx = 0; const fall = t - DEATH.struck;
      if (t < DEATH.struck) { sy -= Math.round(Math.sin(t / DEATH.struck * Math.PI) * 7); rot = -0.25 * (t / DEATH.struck); }
      else if (fall < DEATH.fall) { pn = 'dead2'; const tt = fall, y0 = sy, dist = Math.max(1, fl - y0), tL = Math.min(DEATH.fall, (-60 + Math.sqrt(3600 + 680 * dist)) / 340); sy = Math.min(fl, y0 + Math.round(60 * tt + 340 * tt * tt * 0.5)); rot = -0.25 + (Math.PI * 2 + 0.25) * Math.min(1, tt / Math.max(0.2, tL)); gx = Math.round(22 * tt); if (sy >= fl && tt > 0.3) { pn = 'dead3'; rot = 0; } }
      else { pn = 'dead3'; sy = fl; gx = 18; }
      g.save(); g.translate(60 + gx, sy); g.scale(-1, 1); g.translate(0, -15); g.rotate(rot); g.translate(0, 15); SA.drawSister(g, r, HS.POSE[pn], false, t, false, '', b); g.restore(); frs.push(c); }
    return frs; });
  save('death', rows, 3, 4);
}
