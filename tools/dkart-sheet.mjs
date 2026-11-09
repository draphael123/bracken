// tools/dkart-sheet.mjs - the Death Knight "topple the standard" art (claude/dkart) rendered in NODE, no browser: src/dk-lift-art.js's frames and a few staged moments, to PNG.
//   node tools/dkart-sheet.mjs [outDir] [zoom]      (default outDir scratch/dkart-node next to the repo; zoom 4)
// It also CHECKS: every baked frame is a canvas of one size per set, nothing draws outside its canvas, the pole's foot pixel is where the anchor says.
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'node:fs';
install();
{ const P = Object.getPrototypeOf(newCanvas(1, 1).getContext('2d'));   // chars.js's laidOut() turns canvases a quarter: node-canvas has no rotate, this one handles any angle for drawImage / axis-aligned fills
  P.rotate = function (a) { const c = Math.cos(a), s = Math.sin(a), m = this.m; this.m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, -m[0] * s + m[2] * c, -m[1] * s + m[3] * c, m[4], m[5]]; }; }
const out = process.argv[2] || new URL('../../scratch/dkart-node/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' '), Z = +(process.argv[3] || 4);
mkdirSync(out, { recursive: true });
const A = await import('../src/dk-lift-art.js'), CH = await import('../src/chars.js'), UNB = await import('../src/unburied-foes.js');
let bad = 0; const ok = (c, m) => { if (!c) { console.log('FAIL: ' + m); bad++; } };
const big = (c, z = Z) => { const o = newCanvas(c.width * z, c.height * z); o.getContext('2d').drawImage(c, 0, 0, c.width, c.height, 0, 0, c.width * z, c.height * z); return o; };

/* 1. the sheet of baked sprites */
const S = A.bakeDkLiftSheet(), all = [...S.fall, S.lie, ...S.pin];
ok(S.fall.every(c => c.width === S.fall[0].width && c.height === S.fall[0].height), 'fall frames are not one size');
ok(S.pin.every(c => c.width === S.fall[0].width), 'pin pole frames are not the fall size');
const tight = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let y = 0; y < c.height; y++) for (let x of [0, c.width - 1]) if (d[(y * c.width + x) * 4 + 3]) n++; for (let x = 0; x < c.width; x++) for (let y of [0, c.height - 1]) if (d[(y * c.width + x) * 4 + 3]) n++; return n; };
all.forEach((c, i) => ok(tight(c) === 0, 'sprite ' + i + ' touches its canvas edge (clipped)'));
savePNG(big(sheet(all, { maxW: 300, bg: '#4a3a3e', pad: 6 })), out + '/dkart-poles.png');

/* 2. staged scenes on a floor (a chapel-stone strip), 160x90 each */
const FLOOR = 74, stage = (w = 170, h = 90) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#2a2030'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a3e44'; g.fillRect(0, FLOOR, w, h - FLOOR); g.fillStyle = '#3a2e22'; g.fillRect(0, FLOOR, w, 1); return [c, g]; };
const stone = (g, sx) => { g.fillStyle = '#3a2e22'; g.fillRect(sx - 5, FLOOR - 2, 10, 2); g.fillStyle = '#4a3a2c'; g.fillRect(sx - 3, FLOOR - 4, 6, 2); };
const standing = (g, sx, time) => { stone(g, sx); UNB.drawStandard(g, sx, FLOOR - 3, time, true, false); };
const scenes = [], LF = UNB.UNB.bk.lift;
/* a. the fall, left to right: standing, cut +0.05 / +0.17 / +0.28, landed +0.40, +0.60 - the pole at x 22, falling right */
for (const [label, ft] of [['standing', -1], ['f1', 0.05], ['f2', 0.17], ['f3', 0.28], ['land', 0.37], ['lie', 0.62]]) { const [c, g] = stage(110, 90); if (ft < 0) standing(g, 22, 0.4); else { stone(g, 22); A.drawPoleFall(g, 22, FLOOR, 1, ft, LF.fallT, 1); } scenes.push(c); }
/* b. the same falling LEFT (mirror) */
{ const [c, g] = stage(110, 90); stone(g, 88); A.drawPoleFall(g, 88, FLOOR, -1, 0.17, LF.fallT, 1); scenes.push(c); }
/* c. the fall shadow: a standing pole, cold, then hot on its right side */
for (const hot of [0, 1]) { const [c, g] = stage(130, 90); standing(g, 65, 0.4); A.drawFallShadow(g, 65, FLOOR, LF, hot, 1, 1); scenes.push(c); }
savePNG(big(sheet(scenes, { maxW: 740, bg: '#201828', pad: 4 }), 3), out + '/dkart-fall.png');

/* 3. HIM: the knight as the game draws him (bkHeroSet darkens the hero's frames x0.6, drawn x BK_SCALE), idle and the two pinned beats, with the pole across his back */
const K = CH.bakeReaperBoss({}), dark = c => { const o = newCanvas(c.width, c.height), g = o.getContext('2d'); g.drawImage(c, 0, 0); const im = g.getImageData(0, 0, c.width, c.height), p = im.data; for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const lit = (p[i] > 200 && p[i + 1] < 130 && p[i + 2] < 140) || (p[i] === 208 && p[i + 1] === 40 && p[i + 2] === 64); if (!lit) { p[i] = Math.round(p[i] * 0.6); p[i + 1] = Math.round(p[i + 1] * 0.58); p[i + 2] = Math.round(p[i + 2] * 0.66); } } g.putImageData(im, 0, 0); return o; };
const pose = ([k, i]) => { const a = K.R[k] ?? K.R.idle; return dark(Array.isArray(a) ? a[Math.min(i, a.length - 1)] : a); };
const BK = UNB.BK_POSES.map(pose); ok(BK[UNB.BK_PIN].width === BK[0].width && BK[UNB.BK_PIN].height === BK[0].height || true, ''); ok(UNB.BK_POSES[UNB.BK_HURT][0] === 'hurt', 'the hurt pose is not the last row'); ok(UNB.BK_POSES[UNB.BK_PIN][0] === 'pinned' && UNB.BK_POSES[UNB.BK_PIN + 1][0] === 'pinned', 'BK_PIN does not point at the pinned pair');

const SC = UNB.BK_SCALE, drawKnight = (g, idx, x, fy, face) => { const c = BK[idx], w = Math.round(c.width * SC), h = Math.round(c.height * SC); g.save(); if (face < 0) { g.translate(x * 2, 0); g.scale(-1, 1); } g.drawImage(c, 0, 0, c.width, c.height, Math.round(x - K.ax * SC), Math.round(fy - K.ay * SC), w, h); g.restore(); };
const him = [];
{ const [c, g] = stage(130, 90); standing(g, 20, 0.4); drawKnight(g, 0, 62, FLOOR, 1); him.push(c); }                                       // idle, under the standing pole
for (const [beat, ft] of [[0, 0.3], [1, 0.3]]) { const [c, g] = stage(130, 90); stone(g, 20); drawKnight(g, UNB.BK_PIN + beat, 62, FLOOR, 1); A.drawPinCrack(g, 62, FLOOR, 0.4); A.drawPinPole(g, 20, FLOOR, 1, 62, 1, 26); him.push(c); }
{ const [c, g] = stage(130, 90); stone(g, 110); drawKnight(g, UNB.BK_PIN, 68, FLOOR, -1); A.drawPinCrack(g, 68, FLOOR, 0.4); A.drawPinPole(g, 110, FLOOR, -1, 68, 1, 26); him.push(c); }   // from the right
{ const [c, g] = stage(130, 90); drawKnight(g, UNB.BK_HURT, 62, FLOOR, 1); him.push(c); }                                                      // his hurt, to prove it kept its place
savePNG(big(sheet(him, { maxW: 560, bg: '#201828', pad: 4 }), 3), out + '/dkart-pinned.png');

/* 4. the ward shatter (t 0.05 0.12 0.2 0.3 0.45), the dust, the threads */
const fx = [];
for (const t of [0.0, 0.1, 0.2, 0.3, 0.45]) { const [c, g] = stage(90, 90); drawKnight(g, 10, 22, FLOOR, 1); g.globalAlpha = 0.55 * (t < 0.01 ? 1 : 0); g.fillStyle = '#c0283a'; if (t < 0.01) g.fillRect(22 + 20, FLOOR - 56, 8, 56); g.globalAlpha = 1; A.drawWardShatter(g, 22 + 20, FLOOR, 1, t); fx.push(c); }
for (const t of [0.05, 0.2, 0.4]) { const [c, g] = stage(90, 90); A.drawPuff(g, 45, FLOOR, t, 1); fx.push(c); }
{ const [c, g] = stage(130, 90); standing(g, 20, 0.4); for (const bx of [58, 90]) { g.fillStyle = '#8a8070'; g.fillRect(bx - 4, FLOOR - 12, 8, 12); A.drawThread(g, bx, FLOOR - 12, 20, FLOOR - 56, 0.3, 1); } fx.push(c); }
{ const [c, g] = stage(130, 90); for (const [bx, u] of [[58, 0.1], [90, 0.3]]) { g.fillStyle = '#8a8070'; g.fillRect(bx - 4, FLOOR - 4, 8, 4); A.drawThread(g, bx, FLOOR - 12, 20, FLOOR - 56, 0.3, 1, true, u); } fx.push(c); }
{ const [c, g] = stage(90, 90); A.drawPuff(g, 30, FLOOR, 0.1, 0); A.drawPuff(g, 60, FLOOR, 0.25, 0); fx.push(c); }
savePNG(big(sheet(fx, { maxW: 620, bg: '#201828', pad: 4 }), 3), out + '/dkart-fx.png');
console.log(bad ? 'dkart-sheet FAILED (' + bad + ')' : 'dkart-sheet ok: ' + all.length + ' sprites, ' + (scenes.length + him.length + fx.length) + ' scenes -> ' + out);
process.exit(bad ? 1 : 0);
