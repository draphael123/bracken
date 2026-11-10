// tools/gq4art-sheet.mjs - THE GQ4 ART PASS (claude/gq4art-d), rendered and linted in Node. NO browser.
//   node tools/gq4art-sheet.mjs [out.png]  -> a labelled contact sheet of every new sprite / frame / prop (default work/claude/lane-done/gq4art-sheet.png)
// Lint: every cell paints pixels; the new Princess frames (38-44) and Queen frames (43-58) are all drawn, all different from each other and the rest, flash silhouette = sprite; the sheets end hurt, body (Princess)
// and keep their old indices; the gobknight sheet has the hedge knight's 7 frames in the same size and anchor.
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
{ const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d')); P.rotate = function () {}; }
const out = process.argv[2] || 'work/claude/lane-done/gq4art-sheet.png';
const GPA = await import('../src/redraw/goblin_princess_art.js');
const CH = await import('../src/chars.js');
const A = await import('../src/redraw/gq4_art.js');
const FV = await import('../src/redraw/foes_v2.js');
const bad = [];
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) | 0; } return { h, k }; };
// ---- a 3x5 pixel font for the labels ----
const FONT = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110', '-': '000000111000000', '+': '000010111010000', '/': '001001010100100', ':': '000010000010000', '.': '000000000000010', ',': '000000000010100', '(': '010100100100010', ')': '010001001001010', ' ': '000000000000000', '&': '010101010101011', "'": '010010000000000' };
function label(g, x, y, s, col = '#ffffff') { let cx = x; for (const ch of s.toUpperCase()) { const gl = FONT[ch] || FONT[' ']; for (let i = 0; i < 15; i++) if (gl[i] === '1') { g.fillStyle = col; g.fillRect(cx + (i % 3), y + ((i / 3) | 0), 1, 1); } cx += 4; } return cx - x; }
const cells = [];   // { sec, name, canvas (already at native size), scale }
const cell = (sec, name, w, h, bg, fn, scale = 2) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g, w, h); if (sig(c).k < w * h * 0.01 + 8 && bg === 'x') bad.push('empty: ' + name); cells.push({ sec, name, c, scale }); return c; };
const spr = (sec, name, c, scale = 3, bg = '#4a4a5a') => { const w = c.width, h = c.height; const k = sig(c); if (k.k < 30) bad.push('barely drawn: ' + name); cells.push({ sec, name, c, scale, bg }); return k; };
const FLOOR = '#363949', WALL = '#23252f';
const floor = (g, w, y) => { g.fillStyle = FLOOR; g.fillRect(0, y, w, 40); g.fillStyle = '#74788e'; g.fillRect(0, y, w, 1); };

// ---------------- 1. THE QUEEN'S KNIGHT ----------------
{ const K = A.bakeGobKnight(), H = FV.bakeHedgeKnightV2();
  if (K.R.length !== H.R.length) bad.push('gobknight: ' + K.R.length + ' frames vs hedgeknight ' + H.R.length);
  if (K.ax !== H.ax || K.ay !== H.ay || K.w !== H.w || K.h !== H.h || K.R[0].width !== H.R[0].width || K.R[0].height !== H.R[0].height) bad.push('gobknight: size / anchor / box differ from hedgeknight');
  const names = ['stand', 'walk', 'swingTell', 'swing', 'leap', 'walk2', 'hurt']; const seen = new Map();
  K.R.forEach((c, i) => { const s = sig(c); if (seen.has(s.h)) bad.push('gobknight ' + i + ' draws as ' + seen.get(s.h)); seen.set(s.h, i); if (sig(K.white.R[i]).k !== s.k) bad.push('gobknight ' + i + ': flash silhouette'); spr('1 THE QUEENS KNIGHT (GOBKNIGHT)', 'KNIGHT ' + names[i], c, 4); });
  H.R.forEach((c, i) => spr('1 THE QUEENS KNIGHT (GOBKNIGHT)', 'HEDGE ' + names[i] + ' (WAS)', c, 2, '#3a3a4a')); }

// ---------------- 2. THE GOBLIN PRINCESS ----------------
const P = GPA.bakeGoblinPrincess();
if (P.R.length !== GPA.GP_FRAMES) bad.push('princess frames ' + P.R.length);
if (GPA.GPF.hurt !== P.R.length - 2 || GPA.GPF.body !== P.R.length - 1) bad.push('princess: sheet must end hurt, body');
{ const seen = new Map(); P.R.forEach((c, i) => { const s = sig(c); if (seen.has(s.h)) bad.push('princess ' + i + ' draws as ' + seen.get(s.h)); seen.set(s.h, i); if (sig(P.white.R[i]).k !== s.k) bad.push('princess ' + i + ': flash silhouette'); });
  const nm = { 38: 'KEY TURN A', 39: 'KEY TURN B', 40: 'PIROUETTE TELL', 41: 'PIROUETTE SPIN A', 42: 'PIROUETTE SPIN B', 43: 'DIZZY A', 44: 'DIZZY B' };
  for (const i of [38, 39, 40, 41, 42, 43, 44]) spr('2 THE GOBLIN PRINCESS - NEW FRAMES', 'PRINCESS ' + nm[i] + ' (' + i + ')', P.R[i], 2); }
const gate = (st, col, lit) => ({ x: 40, top: 40, bot: 118, pinX: 76, pinY: 100, box: { t: 24 }, col, open: st !== 'shut', lock: st === 'lock', lit: lit ? 1 : 0 });
for (const [st, lit, nm] of [['shut', 0, 'GATE SHUT'], ['open', 0, 'GATE OPEN'], ['open', 1, 'GATE OPEN, LANTERN LIT'], ['lock', 0, 'GATE LOCKED OPEN']]) cell('2 THE GOBLIN PRINCESS - THE GATES', nm, 90, 130, WALL, (g, w, h) => { floor(g, w, 118); const G = gate(st, '#8fd160', lit); A.drawGate(g, G, 0, 0, 0.3, 118); }, 1);
for (const [col, nm] of [['#8fd160', 'LANTERN GREEN (W)'], ['#ffd36b', 'LANTERN GOLD (E)'], ['#6bb8ff', 'LANTERN BLUE (U)']]) cell('2 THE GOBLIN PRINCESS - THE GATES', nm, 40, 40, WALL, g => A.drawLantern(g, 20, 20, col, 1, 0.1), 3);
for (const [mode, nm] of [['idle', 'PIN IDLE'], ['glow', 'PIN GLOW (CALL LIVE)'], ['struck', 'PIN STRUCK']]) cell('2 THE GOBLIN PRINCESS - THE GATES', nm, 40, 90, WALL, (g, w, h) => { const G = { pinX: 20, pinY: 70, box: { t: 14 }, col: '#8fd160', open: mode !== 'struck', lock: false, lit: mode === 'glow' ? 1 : 0 }; A.drawPin(g, G, 0, 0, 5, 80); if (mode === 'struck') { G.open = false; A.drawPin(g, G, 0, 0, 5.1, 80); } }, 3);
cell('2 THE GOBLIN PRINCESS - THE GATES', 'MASTER CHAIN SLACK / TAUT / ALL GATES', 260, 40, WALL, g => { A.drawMasterChain(g, { xs: [20, 80], drum: 50, y: 12, k: 0, t: 0, lit: false }); A.drawMasterChain(g, { xs: [100, 160], drum: 130, y: 12, k: 1, t: 0, lit: false }); A.drawMasterChain(g, { xs: [180, 240], drum: 210, y: 12, k: 1, t: 0.2, lit: true }); }, 3);
cell('2 THE GOBLIN PRINCESS - THE GATES', 'SHIMMER', 40, 50, '#2a2d38', g => A.drawShimmer(g, 20, 44, 0.3), 3);
cell('2 THE GOBLIN PRINCESS - THE GATES', 'SKID LINE TELL / SPIN', 130, 30, FLOOR, g => { A.drawSkid(g, 6, 60, 12, 0, true); A.drawSkid(g, 124, 70, 26, 0, false); }, 3);
cell('2 THE GOBLIN PRINCESS - THE GATES', 'KEY-TURN FX', 40, 30, WALL, g => A.drawKeyFx(g, 20, 14, 0.6, 0.2), 3);
cell('2 THE GOBLIN PRINCESS - THE GATES', 'GALLERY TRIM + LADDER', 120, 80, WALL, g => { A.drawGalleryTrim(g, 8, 108, 26, 0, 0, 200); A.drawGalleryLadder(g, 108, 26, 78, 0, 0, 200); floor(g, 120, 76); }, 2);

// ---------------- 3. THE BURNING TOWER ----------------
cell('3 THE BURNING TOWER', 'SLIT WINDOW SHOWING FIRE', 50, 50, '#2c2e3b', g => A.drawSlitFire(g, 25, 25, 0.4), 3);
for (const st of ['cold', 'spark', 'flare']) cell('3 THE BURNING TOWER', 'TAPESTRY ' + st.toUpperCase(), 40, 100, '#2c2e3b', g => { floor(g, 40, 90); A.drawTapestry(g, 12, 90, 80, st, 0.3); }, 3);
cell('3 THE BURNING TOWER', 'RED CEILING GLOW', 150, 40, '#2c2e3b', g => A.drawBurnGlow(g, 0, 150, 0, 30, 0.3, 1), 3);
cell('3 THE BURNING TOWER', 'THE BREACH', 70, 110, '#3a1a14', g => A.drawBreach(g, 56, 0, 110, 0.3), 2);
cell('3 THE BURNING TOWER', 'OUTER WALL FACE + CORBELS', 150, 110, '#14151d', g => { A.drawOuterFace(g, 0, 150, 0, 110, 0, 0, 0.2); A.drawCorbel(g, 10, 40, 30); A.drawCorbel(g, 90, 80, 30); }, 2);
for (const st of ['ok', 'creak', 'gone']) cell('3 THE BURNING TOWER', 'HOARDING ' + st.toUpperCase(), 50, 30, '#14151d', g => A.drawHoardBoard(g, 9, 8, st, 0.3), 3);
cell('3 THE BURNING TOWER', 'BURNING CASTLE PANORAMA', 240, 150, '#000', (g, w, h) => A.drawPanorama(g, 0, 0, w, h, 0.3), 2);
cell('3 THE BURNING TOWER', 'FALLING BURNING BEAM + RING', 70, 70, '#1a1620', g => { A.drawBurningDebris(g, 22, 34, 0.2); A.drawDebrisShadow(g, 52, 62, 0.4, 0.1); }, 3);
cell('3 THE BURNING TOWER', 'TOWER BOULDER FALL / SENT BACK', 70, 40, '#1a1620', g => { A.drawTowerBoulder(g, 18, 22, 0.1, 'fall'); A.drawTowerBoulder(g, 50, 22, 0.1, 'back'); }, 3);
{ const Q = CH.bakeGoblinQueen(); const seen = new Map(); Q.R.forEach((c, i) => { const s = sig(c); if (i >= 41) { if (seen.has(s.h)) bad.push('queen ' + i + ' draws as ' + seen.get(s.h)); } seen.set(s.h, i); if (sig(Q.white.R[i]).k !== s.k) bad.push('queen ' + i + ': flash silhouette'); });
  if (Q.R.length !== 59) bad.push('queen frames ' + Q.R.length + ' (59 expected)');
  const nm = { 43: 'HOP STRIDE', 44: 'HOP STEP-IN A', 45: 'HOP STEP-IN B', 46: 'HOP STEP-OUT A', 47: 'HOP STEP-OUT B', 48: 'HOP LOOK DOWN', 49: 'HOP TAUNT', 50: 'HOP CAST AT BRAZIER' };
  for (let i = 43; i <= 50; i++) spr('3 THE BURNING TOWER - THE QUEEN HOPS', 'QUEEN ' + nm[i] + ' (' + i + ')', Q.R[i], 2);
  const nm2 = { 51: 'HEARTH JET TELL', 52: 'HEARTH JET RELEASE', 53: 'REACH TELL', 54: 'REACH JAB', 55: 'DAZED DOWN A', 56: 'DAZED DOWN B', 57: 'RAGE A (CRACKED CROWN)', 58: 'RAGE B' };
  for (let i = 51; i <= 58; i++) spr(i <= 54 ? '4 QUEEN P1 - THE GEODE THRONE HALL' : '5 QUEEN P2 - THE ROOF', 'QUEEN ' + nm2[i] + ' (' + i + ')', Q.R[i], 2); }

// ---------------- 4. QUEEN P1 HALL ----------------
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'GEODE THRONE (COLD)', 150, 150, '#1a1218', g => { floor(g, 150, 134); A.drawGeodeThrone(g, 75, 134, false, 0.3); }, 1);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'GEODE THRONE (LIT: GRINDING)', 150, 150, '#1a1218', g => { floor(g, 150, 134); A.drawGeodeThrone(g, 75, 134, true, 0.3); }, 1);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'ROSE WINDOW', 80, 80, '#23252f', g => A.drawRoseWindow(g, 40, 40, 0.3, 30), 3);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'LIGHT PATCHES VIOLET/GOLD', 110, 30, FLOOR, g => { A.drawLightPatches(g, 4, 28, 0, 0); A.drawLightPatches(g, 40, 28, 0, 1); A.drawLightPatches(g, 76, 28, 0, 2); }, 3);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'HEARTH GRATED (CONTAINED)', 60, 60, '#2c2e3b', g => { floor(g, 60, 52); A.drawHearth(g, 30, 52, false, 0.3, false); }, 3);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'HEARTH LIVE (CALLED: HURTS)', 60, 60, '#2c2e3b', g => { floor(g, 60, 52); A.drawHearth(g, 30, 52, true, 0.3, false); }, 3);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'HEARTH SMOKE TELL', 60, 70, '#2c2e3b', g => { floor(g, 60, 62); A.drawHearth(g, 30, 62, true, 0.3, true); }, 3);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'HEARTH JET', 200, 50, '#2c2e3b', g => { floor(g, 200, 44); A.drawHearthJet(g, 8, 190, 44, 0.1, 0.6, 0.3); }, 2);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'HEARTH PORTAL', 40, 50, '#2c2e3b', g => A.drawHearthPortal(g, 20, 26, 0.8, 0.3), 3);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'REACH PORTAL', 40, 50, '#2c2e3b', g => A.drawReachPortal(g, 20, 26, 0.8, 0.3), 3);
cell('4 QUEEN P1 - THE GEODE THRONE HALL', 'SCEPTRE OUT OF THE PORTAL', 110, 40, '#2c2e3b', g => { A.drawReachPortal(g, 14, 20, 1, 0.3); A.drawSceptreJab(g, 14, 20, 1, 70, 0.3); }, 3);

// ---------------- 5. QUEEN P2 ----------------
for (const r of [0, 1, 2]) cell('5 QUEEN P2 - THE ROOF', 'BOULDER ROTATION ' + r, 30, 30, '#1a1620', g => A.drawBoulder(g, 15, 15, r, false), 4);
cell('5 QUEEN P2 - THE ROOF', 'BOULDER SENT BACK (HOT)', 30, 30, '#1a1620', g => A.drawBoulder(g, 15, 15, 1, true), 4);
cell('5 QUEEN P2 - THE ROOF', 'BOULDER BURST + HANGING SHARDS', 80, 50, '#1a1620', g => { floor(g, 80, 44); A.drawBoulderBurst(g, 40, 44, 0.5, 0.3); }, 3);
cell('5 QUEEN P2 - THE ROOF', 'HANGING-SHARD GLINT', 30, 30, '#1a1620', g => A.drawHangGlint(g, 15, 15, 0.1), 4);
cell('5 QUEEN P2 - THE ROOF', 'ROCKFALL ROCK + SHADOW', 60, 60, '#1a1620', g => { floor(g, 60, 52); A.drawRock(g, 16, 20, 0, 0.2); A.drawRockShadow(g, 40, 52, 0.5, 0.1); }, 3);
cell('5 QUEEN P2 - THE ROOF', 'GREAT GEODE / BURST', 120, 60, '#1a1620', g => { A.drawGreatGeode(g, 30, 30, 0.2, 0); A.drawGreatGeode(g, 88, 30, 0.2, 1); }, 2);
cell('5 QUEEN P2 - THE ROOF', 'SKY PORTAL', 200, 60, '#2a2d38', g => A.drawSkyPortal(g, 10, 190, 14, 1, 0.3), 2);
cell('5 QUEEN P2 - THE ROOF', 'WARD SHELL', 100, 100, '#2a2d38', g => A.drawWardShell(g, 50, 90, 0.3), 2);
cell('5 QUEEN P2 - THE ROOF', 'RAGE AURA (BEHIND HER)', 100, 90, '#2a2d38', g => A.drawRageAura(g, 50, 80, 0.3), 2);

// ---------------- contact sheet ----------------
const PADX = 6, SECH = 9, W = 1100; let x = PADX, y = 4, rowH = 0, sec = null; const placed = [];
for (const cl of cells) {
  if (cl.sec !== sec) { sec = cl.sec; if (rowH) { y += rowH + 6; rowH = 0; x = PADX; } placed.push({ hdr: sec, y }); y += SECH + 3; }
  const w = cl.c.width * cl.scale + 4, h = cl.c.height * cl.scale + 4 + 7;
  if (x + w > W && x > PADX) { x = PADX; y += rowH + 6; rowH = 0; }
  placed.push({ cl, x, y, w, h }); x += w + 5; rowH = Math.max(rowH, h);
}
const H = y + rowH + 8, sh = newCanvas(W, H), g = sh.getContext('2d'); g.fillStyle = '#10111a'; g.fillRect(0, 0, W, H);
for (const p of placed) {
  if (p.hdr) { label(g, PADX, p.y, p.hdr, '#ffd36b'); continue; }
  const { cl, x: px0, y: py0, w, h } = p; g.fillStyle = cl.bg || '#10111a'; g.fillStyle = '#23252f'; g.fillRect(px0, py0 + 7, w, h - 7);
  const big = newCanvas(cl.c.width * cl.scale, cl.c.height * cl.scale); const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(cl.c, 0, 0, cl.c.width, cl.c.height, 0, 0, big.width, big.height);
  if (cl.bg) { g.fillStyle = cl.bg; g.fillRect(px0 + 2, py0 + 9, big.width, big.height); }
  g.drawImage(big, px0 + 2, py0 + 9); label(g, px0, py0, cl.name.length * 4 > w ? cl.name.slice(0, (w / 4) | 0) : cl.name, '#c9c9d6');
}
savePNG(sh, out);
console.log(cells.length + ' cells -> ' + out + ' (' + W + 'x' + H + ')');
if (bad.length) { console.log('LINT:'); for (const b of bad) console.log('  ' + b); process.exit(1); }
console.log('lint: every cell paints; frames distinct; flash silhouettes match; sheets keep their ends.');
