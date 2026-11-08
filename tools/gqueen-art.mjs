// tools/gqueen-art.mjs - THE GOBLIN QUEEN 3's art, rendered and linted in Node (claude/gq2art). No browser.
//   node tools/gqueen-art.mjs [out-prefix]   -> <prefix>-queen.png (frames 0-27), <prefix>-parts.png (crown, shards, portals, fire, shrine, hatch, geyser, lash), <prefix>-top.png (the tower top: backdrop + deck)
// Lint: every frame drawn and one size; the new poses (17-27) all differ from each other and from 0-16; windup != release for the crown toss and both lashes (B16); the flash silhouette = the sprite;
// every part draws pixels; the backdrop paints every pixel of the view.
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
{ const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d')); P.rotate = function () {}; }   // frame 14 tilts her; the sheet shows it upright
const CH = await import('../src/chars.js');
const GA = await import('../src/redraw/gqueen_art.js');
const bad = []; let n = 0; const out = process.argv[2];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const big = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };

/* 1. the Queen */
const Q = CH.bakeGoblinQueen(), sigs = Q.R.map(sig);
Q.R.forEach((c, i) => { n++; if (c.width !== Q.R[0].width || c.height !== Q.R[0].height) bad.push('queen ' + i + ': size'); if (sigs[i].k < 3000) bad.push('queen ' + i + ': barely drawn (' + sigs[i].k + ')'); });
if (Q.R.length !== 28) bad.push('queen: ' + Q.R.length + ' frames (28 expected)');
for (let i = 17; i < Q.R.length; i++) for (let j = 0; j < i; j++) if (sigs[i] && sigs[j] && sigs[i].h === sigs[j].h) bad.push('queen ' + i + ' draws the same as ' + j);
for (const [a, b, what] of [[17, 18, 'crown toss'], [21, 22, 'lash high'], [23, 24, 'lash low']]) if (sigs[a].h === sigs[b].h) bad.push(what + ': windup == release (B16)');
Q.white.R.forEach((c, i) => { if (sig(c).k !== sigs[i].k) bad.push('queen ' + i + ': flash silhouette differs'); });
if (out) savePNG(big(Q.R, { maxW: 4 * (Q.R[0].width + 6) + 6, bg: '#2a1a3a', pad: 6 }, 1), out + '-queen.png');

/* 2. the parts, each on a dark ground, drawn at t = 0.3 (and a second state where there is one) */
const cell = (w, h, bg, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g); return c; };
const parts = [
  ['crown', cell(60, 40, '#1d1424', g => { GA.drawCrown(g, 15, 20, 0.3, {}); GA.drawCrown(g, 45, 20, 0.3, { home: true }); })],
  ['crown storm', cell(60, 40, '#1d1424', g => { GA.drawCrown(g, 15, 20, 0.3, { glow: 1 }); GA.drawCrown(g, 45, 20, 0.7, { glow: 1 }); })],
  ['shards', cell(80, 40, '#1d1424', g => { GA.drawShard(g, 14, 20, 0.3, { vx: 100, vy: 20, id: 0 }); GA.drawShard(g, 40, 20, 0.3, { vx: -100, vy: 0, id: 1 }); GA.drawShard(g, 66, 20, 0.3, { vx: 100, vy: 0, home: true }); })],
  ['portal hall / full', cell(90, 60, '#1d1424', g => { GA.drawPortal(g, 24, 30, 0.2, 0.4, '#b28cff'); GA.drawPortal(g, 62, 30, 0.2, 1, '#fff6c8'); })],
  ['portal step (flash)', cell(60, 60, '#1d1424', g => { GA.drawPortal(g, 30, 30, 0.5, 2, '#fff6c8'); })],
  ['flames', cell(110, 50, '#1d1424', g => { GA.drawFlame(g, 14, 46, 9, 0.3); GA.drawFlame(g, 40, 46, 16, 0.5, 2, 7); GA.drawFlame(g, 70, 46, 24, 0.9, 4, 8); })],
  ['floor fire', cell(160, 60, '#241a22', g => { g.fillStyle = '#3c3a52'; g.fillRect(0, 54, 160, 6); GA.drawFloorFire(g, 0, 160, 54, 0, 0, 0.4, 160); })],
  ['rafter fire', cell(160, 50, '#241a22', g => { g.fillStyle = '#5a3a24'; g.fillRect(8, 30, 144, 4); GA.drawRafterFire(g, { x0: 0, x1: 9, row: 2, collapse: true }, 16, 0, 0, 0.4); })],
  ['shrine cold / lit', cell(110, 80, '#1d1424', g => { GA.drawShrine(g, 28, 72, false, 0.4); GA.drawShrine(g, 80, 72, true, 0.4); })],
  ['hatch shut / open', cell(130, 50, '#241a22', g => { g.fillStyle = '#3c3a52'; g.fillRect(0, 40, 130, 10); GA.drawHatch(g, 10, 40, false, 0.3); GA.drawHatch(g, 70, 40, true, 0.3); })],
  ['geyser tell / erupt / falling', cell(190, 70, '#241a22', g => { g.fillStyle = '#3c3a52'; g.fillRect(0, 60, 190, 10); GA.drawGeyser(g, 30, 60, false, 0, 0.3); GA.drawGeyser(g, 95, 60, true, 1, 0.3); GA.drawGeyser(g, 160, 60, true, 0.35, 0.3); })],
  ['lash high / low', cell(200, 90, '#1d1424', g => { GA.drawLash(g, 10, 22, 1, 160, 0.7, 0.3, true); GA.drawLash(g, 10, 70, 1, 160, 0.7, 0.3, false); })],
  ['lash tells', cell(70, 50, '#1d1424', g => { GA.drawLashTell(g, 6, 14, 1, true, 0.3); GA.drawLashTell(g, 6, 40, 1, false, 0.3); })],
  ['stun / glint', cell(70, 30, '#1d1424', g => { GA.drawStunStars(g, 20, 15, 0.4); GA.drawGlint(g, 52, 15, 0.1); })],
];
for (const [name, c] of parts) { n++; const s = sig(c); const flat = cell(c.width, c.height, '#000', () => {}); if (s.h === sig(flat).h) bad.push('part ' + name + ': drew nothing over its ground'); }
const ground = parts.map(p => p[1]);
{ // the cells are opaque, so the "drew nothing" test above compares to black; check each differs from its own bg by counting distinct colours
  for (const [name, c] of parts) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); if (seen.size < 3) bad.push('part ' + name + ': ' + seen.size + ' colours'); } }
if (out) savePNG(big(ground, { maxW: 760, bg: '#000', pad: 6 }, 2), out + '-parts.png');

/* 3. the tower top, at the page's 320 x 180: the backdrop, then the deck dressing over a stand-in floor */
const TS = 16, A = { x0: 612 * TS, x1: 660 * TS, floor: 20 * TS, stack: [636, 637] };
const top = (cx, cy, t) => cell(320, 180, '#000', g => { GA.drawRoofBack(g, cx, cy, 320, 180, t);
  g.fillStyle = '#363949'; const fy = A.floor - cy; g.fillRect(0, fy, 320, 180 - fy); g.fillStyle = '#74788e'; g.fillRect(0, fy, 320, 1);
  g.fillStyle = '#363949'; g.fillRect(A.x0 - cx, fy - 48, 16, 48); g.fillRect(A.x1 - cx, fy - 48, 16, 48); g.fillRect(636 * TS - cx, fy - 48, 32, 48); g.fillStyle = '#23252f'; g.fillRect(0, 0, A.x0 - cx, 180);
  GA.drawRoofFront(g, A, TS, cx, cy, t, 320); GA.drawShrine(g, 640 - cx + 200, fy, true, t); });
const views = [top(612 * TS - 100, 150, 0.4), top(630 * TS, 150, 1.1), top(652 * TS - 60, 150, 2.2)];
for (const v of views) { n++; const d = v.getContext('2d').getImageData(0, 0, 320, 180).data; let holes = 0; for (let i = 3; i < d.length; i += 4) if (d[i] !== 255) holes++; if (holes) bad.push('tower top: ' + holes + ' unpainted pixels'); }
if (out) savePNG(big(views, { maxW: 960, bg: '#000', pad: 4 }, 1), out + '-top.png');

console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : ''));
process.exit(bad.length ? 1 : 0);
