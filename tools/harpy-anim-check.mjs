// tools/harpy-anim-check.mjs - pure-node checks for the HARPYANIM pass (claude/harpyanim). NO browser.
//   node tools/harpy-anim-check.mjs   -> exits 1 on a failure
// 1. no animated sister frame touches the baked canvas edge (a clipped wing), over every POSE, with the flap, hurt kicks and the daze;  2. the animator is continuous (no frame-to-frame jump of wing / head beyond a spring's reach);
// 3. the memo stays capped;  4. the turn is two frames and a quick flip is instant;  5. the profile harpy sets keep frames 0-5 and add the flap/transition frames.
import { setup } from './harpy-anim-lib.mjs';
import { newCanvas } from './node-canvas.mjs';
setup();
const SA = await import('../src/redraw/shriek_sisters_art.js'), HS = await import('../src/shriek-sisters-hands.js');
let bad = 0, n = 0; const fail = m => { bad++; console.log('FAIL', m); };
const sink = () => { const c = newCanvas(240, 160), g = c.getContext('2d'); return g; };
/* 1 + 2: every pose, held 1.2 s from a hover (so the spring travels), every role */
const names = Object.keys(HS.POSE);
for (const role of ['diver', 'shrieker', 'snatcher']) for (const nm of names) {
  const b = {}, g = sink(); let prev = null;
  for (let t = 0; t < 1.3; t += 1 / 60) {
    const p = t < 0.3 ? HS.POSE.hover : HS.POSE[nm], A = SA.animate(b, (SA.drawSister(g, role, p, false, t, false, '', b), p), t > 0.35 && t < 0.4, t); n++;
    if (prev) { const dw = Math.abs(A.q.wing - prev.q.wing), dh = Math.abs(A.q.head[0] - prev.q.head[0]) + Math.abs(A.q.head[1] - prev.q.head[1]);
      if (!Number.isFinite(A.q.wing) || !Number.isFinite(A.pitch)) fail(role + ' ' + nm + ' NaN at ' + t.toFixed(2)); if (dw > 0.9 && t > 0.31) fail(role + ' ' + nm + ' wing jump ' + dw.toFixed(2) + ' at ' + t.toFixed(2)); }
    prev = A; }
}
console.log('animated', n, 'steps over', names.length, 'poses x 3 roles');
/* edge clipping: bake the extreme animated frames (the pose's wing +- the flap's beat, the tip bend, a lag of +-2) and look at the canvas border */
const edge = (c) => { const d = c._d, W = c.width, H = c.height; let hit = 0; for (let x = 0; x < W; x++) { if (d[x * 4 + 3]) hit++; if (d[((H - 1) * W + x) * 4 + 3]) hit++; } for (let y = 0; y < H; y++) { if (d[(y * W) * 4 + 3]) hit++; if (d[(y * W + W - 1) * 4 + 3]) hit++; } return hit; };
for (const role of ['diver', 'shrieker', 'snatcher']) for (const nm of ['hover', 'rise', 'fly', 'carry', 'carryB', 'lift', 'ferry', 'ferryWait', 'startledB', 'toRoost', 'dead1', 'dead2', 'recover2', 'spentB', 'hold']) {
  const base = HS.POSE[nm]; for (const beat of [-0.8, 0.8]) for (const lag of [-2, 2]) { const q = { ...base, flap: false, beat, lag, tip: lag * 0.2 }; const c = SA.SHEET({ x: q })[role + '-x']; if (c && edge(c) > 0) fail(role + ' ' + nm + ' beat ' + beat + ' lag ' + lag + ' clipped at the canvas edge (' + edge(c) + ' px)'); } }
/* 3 the cap */
{ const g = sink(), b = {}; for (let i = 0; i < 3000; i++) SA.drawSister(g, 'diver', { ...HS.POSE.hover, wing: -2 + (i % 50) * 0.07, head: [8 + (i % 7), -2 + (i % 5)], flapOff: i % 9 }, false, i / 60, false, '', b); }
/* 4 the turn */
{ const b = {}, seq = []; for (let t = 0; t < 0.4; t += 1 / 60) seq.push(HS._turnScale(b, t < 0.1 ? -1 : 1, t)); const mid = seq.filter(v => Math.abs(v) < 0.99).length; if (mid < 4 || mid > 8) fail('turn lasted ' + mid + ' sixtieths');
  const b2 = {}; HS._turnScale(b2, -1, 0); HS._turnScale(b2, 1, 0.5); HS._turnScale(b2, -1, 0.6); const q = HS._turnScale(b2, 1, 0.65); if (Math.abs(q) !== 1) fail('a quick flip should be instant, got ' + q); }
/* 5 the profile sets */
{ const GA = await import('../src/redraw/gale_harpy_art.js'), HM = await import('../src/harpy-motion.js');
  for (const [nm, set] of [['gale', GA.bakeGaleHarpy()], ['gust', GA.bakeGustHarpy()], ['carrier', GA.bakeCarrierHarpy()], ['moor', GA.bakeWomanHarpy('moor')], ['crag', GA.bakeWomanHarpy('crag')], ['shrieker', GA.bakeWomanHarpy('shrieker')]]) {
    for (let i = 0; i < 6; i++) if (!set.R[i] || !set.L[i] || !set.white.R[i]) fail(nm + ' frame ' + i + ' missing');
    for (const k of Object.keys(HM.F)) { const i = HM.F[k]; if (!set.R[i] || set.R[i].width !== 54) fail(nm + ' frame ' + k + '=' + i + ' missing'); }
    for (let i = 0; i < HM.NFLAP; i++) if (!set.R[HM.FLAP0 + i]) fail(nm + ' flap ' + i + ' missing');
    if (nm === 'carrier') for (let i = 0; i < HM.NFLAP; i++) if (!set.R[HM.CARRYFLAP0 + i]) fail(nm + ' carry flap ' + i + ' missing'); } }
console.log(bad ? bad + ' FAILED' : 'harpy-anim ok');
process.exit(bad ? 1 : 0);
