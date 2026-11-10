// tools/gq3art-sheet.mjs - THE GQ3 ART (claude/gq3art), rendered and linted in Node. NO browser.
//   node tools/gq3art-sheet.mjs [out-prefix]  -> <prefix>.png (the contact sheet) and <prefix>-parts.png (the unscaled parts)
// Lint: the Queen's 13 new frames (28-42) all drawn, one size, all different from every other frame, flash silhouette = sprite; the Princess's new frames (33-37, 39) likewise and the sheet
// ends hurt, body (main.js C3_DEAD / lastFrame rely on that); every part paints pixels; the royal portal has its 3 + 4 + 2 frames and they all differ; the tint set differs.
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
{ const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d')); P.rotate = function () {}; }   // frame 14 tilts her; the sheet shows it upright
const CH = await import('../src/chars.js');
const GPA = await import('../src/redraw/goblin_princess_art.js');
const GQ = await import('../src/redraw/gq3_art.js');
const out = process.argv[2] || 'work/claude/lane-done/gq3art-sheet';
const bad = [];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const big = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
const cell = (w, h, bg, fn, name) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g); const d = g.getImageData(0, 0, w, h).data, seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); if (seen.size < 4) bad.push((name || 'cell') + ': nothing drawn'); return c; };

/* 1. the Queen's new poses */
const Q = CH.bakeGoblinQueen(), qs = Q.R.map(sig);
if (Q.R.length !== 59) bad.push('queen: ' + Q.R.length + ' frames (59 expected: 0-27 + 28-40 + hop 41-50)');
Q.R.forEach((c, i) => { if (c.width !== Q.R[0].width || c.height !== Q.R[0].height) bad.push('queen ' + i + ': size'); if (qs[i].k < 3000) bad.push('queen ' + i + ': barely drawn'); });
for (let i = 28; i < Q.R.length; i++) for (let j = 0; j < i; j++) if (qs[i].h === qs[j].h) bad.push('queen ' + i + ' draws the same as ' + j);
Q.white.R.forEach((c, i) => { if (sig(c).k !== qs[i].k) bad.push('queen ' + i + ': flash silhouette differs'); });
const QN = ['geodeTell a', 'geodeTell b', 'geodeThrow', 'blink in a', 'blink in b', 'stumble a', 'stumble b', 'desperation', 'kneel beaten', 'rise (crown)', 'back in a', 'back in b', 'intro rage'];

/* 2. the Princess's death */
const P = GPA.bakeGoblinPrincess(), ps = P.R.map(sig);
if (P.R.length !== GPA.GP_FRAMES || GPA.GP_FRAMES !== 47) bad.push('princess: ' + P.R.length + ' frames (40 expected)');
if (GPA.GPF.hurt !== P.R.length - 2 || GPA.GPF.body !== P.R.length - 1) bad.push('princess: the sheet must end hurt, body');
ps.forEach((s, i) => { if (s.k < 250) bad.push('princess ' + i + ': barely drawn'); });
for (let i = 33; i < P.R.length; i++) for (let j = 0; j < i; j++) if (ps[i].h === ps[j].h) bad.push('princess ' + i + ' draws the same as ' + j);
P.white.R.forEach((c, i) => { if (sig(c).k !== ps[i].k) bad.push('princess ' + i + ': flash silhouette differs'); });
for (const [t, want] of [[0.1, GPA.GPF.reel], [0.35, GPA.GPF.kneelRing + 1], [0.5, GPA.GPF.kneelRing], [1.0, GPA.GPF.kneelRing + 1], [1.3, GPA.GPF.collapse], [1.7, GPA.GPF.collapse + 1]]) { const f = GPA.gpFrame({ mode: 'dying', dyT: t }); if (f !== want) bad.push('princess dying t=' + t + ' -> ' + f + ' (want ' + want + ')'); }

/* 3. the parts */
const floor = (g, w, y, c = '#363949') => { g.fillStyle = c; g.fillRect(0, y, w, 30); g.fillStyle = '#74788e'; g.fillRect(0, y, w, 1); };
const parts = [];
parts.push(['royal portal: open x3, idle x4, snap x2', cell(9 * 40 + 8, 70, '#1a1424', g => { floor(g, 380, 62); const L = []; [0.2, 0.5, 0.9].forEach(k => L.push({ state: 'open', k })); [0, 0.13, 0.26, 0.39].forEach(t => L.push({ state: 'idle', t })); [0.9, 0.3].forEach(k => L.push({ state: 'snap', k }));
  L.forEach((o, i) => GQ.drawRoyalPortal(g, 24 + i * 40, 38, o.t || 0.2, o)); }, 'portal frames')]);
parts.push(['portal tints: royal / white exit / gold crown / green reinforcement / step shortcut', cell(5 * 44 + 8, 70, '#1a1424', g => { floor(g, 240, 62); ['royal', 'white', 'gold', 'green', 'step'].forEach((t, i) => GQ.drawRoyalPortal(g, 26 + i * 44, 38, 0.3, { tint: t })); GQ.drawShortcut(g, 26 + 5 * 44, 40, 0.5); }, 'portal tints')]);
parts.push(['rings: dormant / white / gold / green (tower top)', cell(4 * 40 + 8, 56, '#1a1424', g => { floor(g, 170, 50); [['#5a3a8a', 0.35], ['#fff6c8', 1], ['#ffd36b', 0.4], ['#8fd160', 1]].forEach(([c, k], i) => GQ.drawRing(g, 22 + i * 40, 34, 0.3, k, c)); }, 'rings')]);
parts.push(['geode: 3 rotations, sent back, tell, mark tracking / locked, shatter x3, shards', cell(430, 74, '#1a1424', g => { floor(g, 430, 64); [0, 2, 4].forEach((s, i) => GQ.drawGeode(g, 14 + i * 22, 20, 0.2, { spin: s })); GQ.drawGeode(g, 90, 20, 0.2, { spin: 0, home: true, vx: -80 }); GQ.drawGeodeTell(g, 130, 34, 0.3, 0.7);
  GQ.drawGeodeMark(g, 176, 64, false, 0.2); GQ.drawGeodeMark(g, 226, 64, true, 0.2); [0.15, 0.5, 0.9].forEach((k, i) => GQ.drawGeodeShatter(g, 270 + i * 40, 62, k)); GQ.drawGeodeBit(g, 400, 62, 1, 0.3); }, 'geode')]);
const FIRE = '#c9462a';
parts.push(['tower shaft room + floors: cold / smoke / burn, stairwell curbs, slit windows', cell(420, 250, '#000', g => { GQ.paintShaft(g, 0, 0, 420, 250, 782, 22, 0.4); [['smoke', 60], ['burn', 150]].forEach(([st, y], i) => { GQ.drawTimberFloor(g, 10, 200, y, st, 0.4, i); g.fillStyle = '#5a3a1a'; g.fillRect(10, y, 190, 4); GQ.drawTimberFloor(g, 10, 200, y, st, 0.4, i); }); GQ.drawStairwell(g, 250, 290, 100); g.fillStyle = '#5a3a1a'; g.fillRect(210, 100, 40, 4); g.fillRect(290, 100, 100, 4); GQ.drawTimberFloor(g, 210, 250, 100, 'burn', 0.4, 3); }, 'shaft')]);
parts.push(['falling beam: tell / fall / near / impact', cell(4 * 60 + 8, 190, '#1a1424', g => { g.fillStyle = '#2a1a10'; g.fillRect(0, 180, 260, 6); GQ.drawBeamTell(g, 28, 180, 0.4); GQ.drawBeamFall(g, 88, 180, 0.9, 0.2); GQ.drawBeamFall(g, 148, 180, 0.5, 0.2); GQ.drawBeamFall(g, 208, 180, 0.15, 0.2); }, 'beam')]);
parts.push(['hatch to the deck', cell(120, 80, '#1a1424', g => { g.fillStyle = '#363949'; g.fillRect(0, 50, 120, 30); g.fillStyle = '#0a0810'; g.fillRect(44, 50, 32, 30); GQ.drawTowerHatch(g, 44, 50, 0.3); }, 'hatch')]);
parts.push(['tower top: parapet walk + stone steps, bell cupola, bays idle / smoke / burn (cx 0, t 0.4)', cell(560, 190, '#14101c', g => { g.fillStyle = '#363949'; g.fillRect(0, 150, 560, 40); g.fillStyle = '#74788e'; g.fillRect(0, 150, 560, 1);
  GQ.drawParapetWalk(g, 1, 9, 6, 0, -54, 0.4); GQ.drawStoneStep(g, 10, 11, 8, 0, -22); GQ.drawCupola(g, 20, 23, 7, 19, 24, 4, 0, 6, 0.4);
  ['idle', 'smoke', 'burn'].forEach((st, i) => GQ.drawBay(g, 380 + i * 60, 436 + i * 60, 150, st, 0.4, i)); GQ.drawRing(g, 50, 128, 0.3, 0.35, '#5a3a8a'); }, 'deck')]);
parts.push(['roof back 2 (the hatch fire, three spires)', cell(320, 180, '#2a1020', g => { GQ.drawRoofBack2(g, 792 * 16 - 140, 0, 320, 180, 0.4, 792 * 16, 150); g.fillStyle = '#363949'; g.fillRect(0, 150, 320, 30); }, 'roofback2')]);
parts.push(["queen's stair: gate + flights, catwalk, grille intact / smashed, store room + weights + slabs, alcove, gallery", cell(1180, 290, '#14101c', g => { GQ.drawStairSet(g, 652 * 16, 64, 0.4, 1180); }, 'stair set')]);
parts.push(['stair: the geode grille, weights (3 states), slabs hung / level', cell(420, 190, '#14101c', g => { GQ.drawGrille(g, 30, 60, 0.3, false); GQ.drawGrille(g, 70, 60, 0.3, true, 0.3); [false, false, true].forEach((h, i) => GQ.drawWeight(g, 130 + i * 50, 10, 70, 180, h, 0.3)); g.fillStyle = '#363949'; g.fillRect(0, 180, 420, 10); GQ.drawSlab(g, 0, 2, 120, -300, 0, false, 0.3); GQ.drawSlab(g, 0, 2, 120, -340, 0, true, 0.3); }, 'weights')]);
parts.push(['store room', cell(304, 200, '#000', g => { GQ.paintStore(g, 0, 0, 304, 200, 685, 2, 0.3); [8, 12, 16].forEach(c => GQ.drawWeight(g, (c) * 16 - 4 * 16 + 8 - 8, 22, 60, 192, c === 16, 0.3)); }, 'store')]);

/* 4. the sheet: the Queen's poses, the Princess's death, and the parts */
const qList = Q.R.slice(28), pList = [P.R[33], P.R[34], P.R[35], P.R[36], P.R[37], P.R[39]];
const flip = P.R; void flip;
const strips = [big(qList, { maxW: 6 * 140, bg: '#2a1a3a', pad: 4 }, 1), big(pList, { maxW: 6 * 100, bg: '#2a1a3a', pad: 4 }, 2)];
void QN;
savePNG(sheet(strips.concat(parts.map(p => p[1])), { maxW: 900, bg: '#10101a', pad: 8 }), out + '.png');
savePNG(sheet(parts.map(p => p[1]), { maxW: 1200, bg: '#10101a', pad: 6 }), out + '-parts.png');
console.log(bad.length ? 'ISSUES:\n' + bad.join('\n') : 'gq3art: all ok', '(queen ' + Q.R.length + ', princess ' + P.R.length + ') ->', out + '.png');
process.exit(bad.length ? 1 : 0);
