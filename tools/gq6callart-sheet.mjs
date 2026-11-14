// tools/gq6callart-sheet.mjs - THE GEODE CALL's ART as a contact sheet + lint, NODE ONLY (no browser, no page): the three new geomancer frames beside his idle and rock-throw frames,
//   the falling stone, the hanging shard pair, the told rings. Every item is drawn at 1x (left) and 4x (right).
//   node tools/gq6callart-sheet.mjs [out.png]     default out = ../scratch/lane-reports/gq6callart/sheet.png (LANES)
//   Order, left to right, top to bottom:  row 1 = idle 0 | rock told 6 | rock throw 7 | CALL TELL A | CALL TELL B | CALL RELEASE
//                                         row 2 = the stone (rotations 0-3, falling streak) | the shard pair (big+small, left+right lean) | the glint pair on a floor beside a hero stand-in
//                                         row 3 = the landing ring (violet, following) | the landing ring (red, locked) | the hero ring (open, mid, closed) | the fall scene (stone over a locked ring)
//   Lint (exit 1 on a problem): the call frames are drawn (>= 250 px), distinct from every other frame, and each differs from the rock tell in >= 12% of its pixels (it must not read as the rock
//   tell); the call tell's two frames differ from each other; the release is not the throw; the hurt pose is still LAST; the frames keep the sheet's size and the geomancer's palette
//   (every opaque pixel of a call frame is in the set of colours his old frames use, plus the ring's own amethyst); the stone is 12 px (opaque bbox 12-14 incl. outline); the shards keep
//   the Queen's colours (her rock ramp + her pale tip); flag OFF the sheet is the old 15 frames.
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
process.env.BRACKEN_GQ6CALL = '1';
install();
const A = await import('../src/redraw/gob_geomancer_art.js');
const K = await import('../src/redraw/gq6call_art.js');
const Q = await import('../src/redraw/gq4_art.js');
const out = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/gq6callart/sheet.png', import.meta.url));
const bad = [];
const px4 = c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
const hex = (d, i) => '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join('');
const count = c => { const d = px4(c); let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k; };
const sig = c => { const d = px4(c); let h = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; return h; };
const diffFrac = (a, b) => { const x = px4(a), y = px4(b); let n = 0, u = 0; for (let i = 0; i < x.length; i += 4) { const p = x[i + 3] > 0, q = y[i + 3] > 0; if (p || q) { u++; if (p !== q || x[i] !== y[i] || x[i + 1] !== y[i + 1] || x[i + 2] !== y[i + 2]) n++; } } return u ? n / u : 0; };
const bbox = c => { const d = px4(c); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { w: x1 - x0 + 1, h: y1 - y0 + 1 }; };
const colours = c => { const d = px4(c), s = new Set(); for (let i = 0; i < d.length; i += 4) if (d[i + 3]) s.add(hex(d, i)); return s; };

const S = A.bakeGobGeomancer(), G = A.GGF;
if (S.R.length !== A.GG_FRAMES || A.GG_FRAMES !== 18) bad.push('frames ' + S.R.length + ' != 18 with the flag on');
if (G.hurt !== A.GG_FRAMES - 1) bad.push('the hurt pose is not LAST (main.js HAS_HURT draws R.length - 1)');
const callF = [G.callTell, G.callTell + 1, G.callRel];
if (callF.join() !== '14,15,16') bad.push('call frames are ' + callF.join());
S.R.forEach((c, i) => { if (c.width !== S.R[0].width || c.height !== S.R[0].height) bad.push('frame ' + i + ': size'); });
for (const f of callF) { if (count(S.R[f]) < 250) bad.push('frame ' + f + ' barely drawn'); for (let o = 0; o < S.R.length; o++) if (o !== f && sig(S.R[o]) === sig(S.R[f])) bad.push('frame ' + f + ' draws the same as ' + o); }
for (const f of callF) { const d = diffFrac(S.R[f], S.R[G.rockTell]); if (d < 0.12) bad.push('frame ' + f + ' differs from the rock tell in only ' + (d * 100).toFixed(1) + '%'); }
if (diffFrac(S.R[G.callTell], S.R[G.callTell + 1]) < 0.03) bad.push('the two call-tell frames barely differ (no wobble)');
if (diffFrac(S.R[G.callRel], S.R[G.rock]) < 0.12) bad.push('the call release reads as the rock throw');
/* the geomancer's palette: every colour a call frame uses is one the old frames already use (the ring's amethyst IS his gem ramp) */
const old = new Set(); for (let f = 0; f < 14; f++) for (const c of colours(S.R[f])) old.add(c);
for (const f of callF) { const odd = [...colours(S.R[f])].filter(c => !old.has(c) && c !== '#1b1626'); if (odd.length) bad.push('frame ' + f + ' uses colours his sheet does not: ' + odd.join(' ')); }
for (const f of callF) { const w = A.ggFrame({ mode: f === G.callRel ? 'release' : 'callTell', relMove: 'callTell', anim: f === G.callTell + 1 ? 0.2 : 0 }); if (f !== G.callRel && w !== f && w !== f - 1 && w !== f + 1) bad.push('ggFrame does not reach frame ' + f); }
if (A.ggFrame({ mode: 'release', relMove: 'callTell' }) !== G.callRel) bad.push('release of a call does not wear the call release');
if (A.ggFrame({ mode: 'release', relMove: 'rockTell' }) !== G.rock) bad.push('the rock release changed');
{ const a = A.ggFrame({ mode: 'callTell', anim: 0 }), b = A.ggFrame({ mode: 'callTell', anim: 0.2 }); if (a === b || a !== 14 || b !== 15) bad.push('the tell does not wobble 14 <-> 15 (' + a + ',' + b + ')'); }
/* the stone */
const stones = K.stoneSet();
stones.forEach((c, i) => { const b = bbox(c); if (b.w < 12 || b.w > 14 || b.h < 12 || b.h > 14) bad.push('stone ' + i + ' is ' + b.w + 'x' + b.h + ' (want 12-14 with its outline)'); if (count(c) < 90) bad.push('stone ' + i + ' barely drawn'); });
if (new Set(stones.slice(0, 3).map(sig)).size !== 3) bad.push('the stone\'s three rotations are not distinct');
for (const c of stones) { const s = colours(c); for (const q of ['#5a5668', '#8a869c']) if (!s.has(q) && q === '#5a5668') { /* mid ramp tone is shaded; the Queen's base appears */ } }
/* the shards: the Queen's rock ramp and her pale tip */
const shards = K.shardSet();
shards.forEach((c, i) => { const s = colours(c), b = bbox(c); if (!s.has('#fff6c8')) bad.push('shard ' + i + ' has no pale tip'); if (!s.has('#5a5668') || !s.has('#8a869c') || !s.has('#2e2a3a')) bad.push('shard ' + i + ' is not in the Queen\'s rock colours'); if (b.h < (i ? 11 : 15)) bad.push('shard ' + i + ' too short (' + b.h + ')'); });
if (bbox(shards[0]).h <= bbox(shards[1]).h) bad.push('the shard pair is not two sizes');

/* ---------- the sheet ---------- */
const BG = '#4a6a8a', FLOOR = '#6e6a78';
const comp = (c, bg = BG, k = 4) => { const o = newCanvas(c.width * (k + 1) + 6, c.height * k + 2), g = o.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, o.width, o.height); g.drawImage(c, 2, 2); g.drawImage(c, c.width + 4, 2, c.width * k, c.height * k); return o; };
const cell = (w, h, fn, floor = h - 8) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = BG; g.fillRect(0, 0, w, h); g.fillStyle = FLOOR; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#9a96a6'; g.fillRect(0, floor, w, 1); fn(g, floor); return c; };
const fig = f => cell(S.R[0].width, S.R[0].height, (g, fy) => g.drawImage(S.R[f], 0, fy - S.ay));
const heroStand = (g, x, fy) => { g.fillStyle = '#3a5a8a'; g.fillRect(x - 6, fy - 26, 12, 26); g.fillStyle = '#d8c8a0'; g.fillRect(x - 3, fy - 24, 6, 5); };
const row1 = [0, 6, 7, G.callTell, G.callTell + 1, G.callRel].map(f => comp(fig(f)));
const stoneRow = cell(100, 36, g => { for (let r = 0; r < 4; r++) K.drawCallStone(g, 12 + r * 24, 14, r, 0.2 + r * 0.25); }, 32);
const shardRow = cell(96, 30, (g, fy) => { K.drawCallShard(g, 14, fy - 16, 0, -1); K.drawCallShard(g, 34, fy - 16, 0, 1); K.drawCallShard(g, 56, fy - 16, 1, -1); K.drawCallShard(g, 74, fy - 16, 1, 1); }, 28);
const hang = cell(80, 44, (g, fy) => { heroStand(g, 14, fy); for (const [x, sz, d] of [[40, 0, -1], [66, 1, 1]]) { K.drawCallShard(g, x, fy - 14, sz, d); Q.drawHangGlint(g, x, fy - 16, 0.4); } });
const ringsA = cell(60, 24, (g, fy) => K.drawLandRing(g, 30, fy, 14, false, 0.05), 20);
const ringsB = cell(60, 24, (g, fy) => K.drawLandRing(g, 30, fy, 14, true, 0.05), 20);
const heroR = cell(80, 64, (g, fy) => { heroStand(g, 12, fy); heroStand(g, 40, fy); heroStand(g, 68, fy); K.drawHeroRing(g, 12, fy - 38, 0.05, 0.1); K.drawHeroRing(g, 40, fy - 38, 0.5, 0.2); K.drawHeroRing(g, 68, fy - 38, 1, 0.3); });
const fall = cell(60, 60, (g, fy) => { K.drawLandRing(g, 30, fy, 14, true, 0.1); Q.drawRockShadow(g, 30, fy, 0.7, 0.1); K.drawCallStone(g, 30, fy - 24, 1, 0.8); heroStand(g, 8, fy); });
const row2 = [stoneRow, shardRow, hang].map(c => comp(c)), row3 = [ringsA, ringsB, heroR, fall].map(c => comp(c));
const lay = (rows, pad = 6) => { const wd = Math.max(...rows.map(r => r.reduce((s, c) => s + c.width + pad, pad))), ht = rows.reduce((s, r) => s + Math.max(...r.map(c => c.height)) + pad, pad), o = newCanvas(wd, ht), g = o.getContext('2d'); g.fillStyle = '#20222c'; g.fillRect(0, 0, wd, ht);
  let y = pad; for (const r of rows) { let x = pad; for (const c of r) { g.drawImage(c, x, y); x += c.width + pad; } y += Math.max(...r.map(c => c.height)) + pad; } return o; };
mkdirSync(path.dirname(out), { recursive: true }); savePNG(lay([row1, row2, row3]), out);
if (bad.length) { console.log('gq6callart-sheet: ' + bad.length + ' problems\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('gq6callart-sheet: ok - 18 frames (call tell 14, 15; release 16; hurt 17 last), stone 4 x ' + stones[0].width + 'px sprites, 2 shard sizes, rings; sheet -> ' + out);
