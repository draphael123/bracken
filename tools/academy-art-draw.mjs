// tools/academy-art-draw.mjs (claude/academyart; node only, no browser): THE MAGE ACADEMY's art draws. Every SOLID / ONEWAY cell of the built level gets a tile (no magenta fallback), the rooms
// wear their own ground, the rails / floating stones / galleries / bookstacks / the exit gate take their own tile, a non-academy level takes none; the props draw (lecterns lit and dark in
// all three spells, ward rails, conjured steps, runes, the shutter, the auras, the pits, the backdrop and its decor); THE SPELLBOOK FLOCK draws every mode; THE HEADMISTRESS draws in every
// mode of the POSE table (+ the dead pose), every lesson, left and right, flashed; and the hands' drawBack / drawOver / drawFlock / drawBoss run in a fake world.
//   node tools/academy-art-draw.mjs
globalThis.__AC = true;
import { readFileSync } from 'node:fs';
const { install, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const ART = await import('../src/redraw/academy_art.js'), HMA = await import('../src/redraw/headmistress_art.js');
const { makeAcademyHands, FLOCK } = await import('../src/academy-hands.js');
const { makeHeadmistressHands, POSE } = await import('../src/headmistress-hands.js');
const TS = 16;
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\r').join('');
const lit = c => { const d = c._d; let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k; };
const sig = c => Buffer.from(c._d).toString('base64');
const L = LEVELS.find(l => l.id === 'academy').build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);

/* ---- the tiles ---- */
let n = 0, miss = 0; const seen = new Set(), byZone = {}; let rails = 0, rail0 = 0, shelves = 0, galleries = 0, gates = 0, hull0 = 0;
const isRail = (x, y) => L.ac.rails.some(r => r.x === x && y >= r.y0 && y <= r.y1), inHull = (x, y) => L.hullZones.some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]);
for (let y = 0; y < L.H; y++) for (let x = 0; x < W; x++) { const t = at(x, y); if (t !== T.SOLID && t !== T.ONEWAY) continue; n++;
  const c = ART.academyTile(t, x, y, at, T, L); if (!c) { miss++; continue; } seen.add(c); const z = ART.zoneOf(x, L); byZone[z] = (byZone[z] || 0) + 1;
  if (t === T.ONEWAY) galleries++; else if (isRail(x, y)) { rail0++; if (c === ART.railTile(!isRail(x, y - 1), !isRail(x, y + 1))) rails++; }
  else if (x === L.arena.wallR && y >= 35 && y <= 39) gates++;
  else if (inHull(x, y) && (at(x, y - 1) === T.AIR || at(x, y + 1) === T.AIR)) hull0++;
  if (z === 'library' && y >= 14 && y < 40) shelves++; }
ok(n > 5000 && !miss, 'every solid / one-way cell of the level has a tile: ' + n + ' cells, ' + miss + ' missing, ' + seen.size + ' distinct tiles baked');
ok(['steps', 'library', 'lecture', 'yard', 'exam'].every(z => byZone[z] > 100), 'all five grounds are in use: ' + JSON.stringify(byZone));
ok(rail0 === L.ac.rails.reduce((a, r) => a + r.y1 - r.y0 + 1, 0) && rails === rail0, 'every ward-rail cell is the dark-glass column: ' + rails);
ok(gates === 5, "the exit gate: 5 tiles in the Examination's east wall");
ok(hull0 > 6, 'the summoned floating stones are runestones: ' + hull0 + ' cells');
ok(shelves > 250, 'the bookstacks are shelving: ' + shelves + ' cells (rows of spines, a crown on top)');
ok(galleries > 10, 'the one-way galleries are corbelled slabs: ' + galleries);
{ const a = ART.academyTile(T.SOLID, 50, 41, at, T, L), b = ART.academyTile(T.SOLID, 110, 21, at, T, L), c2 = ART.academyTile(T.SOLID, 200, 41, at, T, L), d2 = ART.academyTile(T.SOLID, 270, 41, at, T, L); ok(new Set([a, b, c2, d2]).size === 4, 'the rooms do not share a face (library / lecture / yard / exam ground tiles differ)'); }
ok(ART.academyTile(T.SOLID, 5, 5, at, T, { ...L, academy: false }) === null && ART.academyTile(T.SOLID, 5, 5, at, T, {}) === null, 'not an academy level: no tile');
ok(ART.academyTile(T.SPIKE, 5, 5, at, T, L) === null && ART.academyTile(T.AIR, 5, 5, at, T, L) === null, 'only solids and one-ways are kitted');
{ const up = ART.stoneTile('lecture', 3, 3, { up: true }), mid = ART.stoneTile('lecture', 3, 3, {}); ok(sig(up) !== sig(mid) && lit(up) === 256, 'a floor has its own lip (not the interior): opaque 16x16'); }
for (const [k, f] of [['shelf', () => ART.shelfTile(3, 20, true, false, false)], ['gallery', () => ART.galleryTile('exam', 3, true, true)], ['float', () => ART.floatTile(1, 1, true, true, true, true)], ['rail', () => ART.railTile(true, true)], ['shutter', () => ART.shutterTile(1)], ['gate', () => ART.gateTile(2, 5)]]) { const c = f(); ok(c.width === 16 && c.height === 16 && lit(c) > 100, k + ' tile 16x16 draws (' + lit(c) + ' px)'); }

/* ---- the props ---- */
{ const out = {}; for (const sp of ['levitate', 'blink', 'conjure']) for (const on of [true, false]) { const c = newCanvas(40, 50), g = c.getContext('2d'); ART.drawLectern(g, 20, 46, sp, on, 0.4); out[sp + on] = sig(c); ok(lit(c) > 150, 'lectern ' + sp + (on ? ' lit' : ' dark') + ' draws (' + lit(c) + ' px)'); }
  ok(new Set(Object.values(out)).size === 6, 'the six lecterns (3 spells x lit / dark) are all different'); }
{ const c = newCanvas(40, 160), g = c.getContext('2d'); ART.drawRail(g, 12, 4, 150, 0.3, 0, false); const c2 = newCanvas(40, 160); ART.drawRail(c2.getContext('2d'), 12, 4, 150, 0.9, 0, true); ok(lit(c) > 1200 && sig(c) !== sig(c2), 'ward rail draws and animates (' + lit(c) + ' px)'); }
{ const c = newCanvas(60, 30), g = c.getContext('2d'); [0, 1, 2].forEach(i => ART.drawStep(g, 6 + i * 16, 8, i === 0, i === 2, false, 0.2, i)); const c2 = newCanvas(60, 30); [0, 1, 2].forEach(i => ART.drawStep(c2.getContext('2d'), 6 + i * 16, 8, i === 0, i === 2, true, 0.2, i)); ok(lit(c) > 250 && sig(c) !== sig(c2), 'a conjured step draws, and flickers before it goes'); }
{ const a = newCanvas(24, 24), b = newCanvas(24, 24); ART.drawRune(a.getContext('2d'), 12, 22, false, 0.3); ART.drawRune(b.getContext('2d'), 12, 22, true, 0.3); ok(lit(a) > 80 && lit(b) > 80 && sig(a) !== sig(b), 'the rune: live glyph / struck and cracked'); }
for (const sp of ['levitate', 'blink', 'conjure']) { const c = newCanvas(30, 70), g = c.getContext('2d'); ART.drawAura(g, 15, 10, sp, { float: sp === 'levitate', meter: 0.6 }, 0.3); ok(lit(c) > 60, 'aura ' + sp + ' draws'); }
for (const nm of ['THE ARCHIVE', 'THE ORCHESTRA PIT', 'THE SUMMONING WELL', 'THE EXAM GAP']) { const c = newCanvas(300, 160), g = c.getContext('2d'); ART.drawBackdrop(g, 18 * 16, 0, 300, 160, 0.3, { wells: [{ x0: 20, x1: 34, name: nm }], catchY: 2 * 16 + 80 }, { hullZones: [], arena: null }, {}); const base = newCanvas(300, 160); ART.drawBackdrop(base.getContext('2d'), 18 * 16, 0, 300, 160, 0.3, { wells: [] }, { hullZones: [], arena: null }, {}); ok(sig(c) !== sig(base), 'the pit "' + nm + '" draws its own dark'); }
{ const out = new Set(); for (let i = 0; i < 5; i++) { const c = newCanvas(300, 160), g = c.getContext('2d'); ART.drawBackdrop(g, [8 * 16, 40 * 16, 120 * 16, 200 * 16, 270 * 16][i], 200, 300, 160, 0.4, null, null, {}); out.add(sig(c)); ok(lit(c) > 20000, 'the back wall of room ' + i + ' fills the screen (' + lit(c) + ' px)'); } ok(out.size === 5, 'every room has its own back wall'); }
{ const c = newCanvas(480, 280), g = c.getContext('2d'); for (const [c0, r0] of [[18, 26], [100, 26], [184, 26], [252, 26]]) ART.drawDecor(g, c0 * 16, r0 * 16, 480, 280, 0.3, L, at, T); ok(lit(c) > 300, 'decor (candelabra, globes, book piles, easels, desks) stands on the floors: ' + lit(c) + ' px over four windows'); }

/* ---- the flock ---- */
{ const px = {}; for (const mode of ['wheel', 'gatherTell', 'stream', 'scattered', 'regroup']) { const c = newCanvas(120, 60), g = c.getContext('2d'); ART.drawFlock(g, { x: 60, y: 30, hp: 30, mode, anim: 0.6, face: 1 }, 0, 0, 0.45, FLOCK); px[mode] = sig(c); ok(lit(c) > 150, 'flock ' + mode + ' draws (' + lit(c) + ' px)'); }
  ok(new Set(Object.values(px)).size === 5, 'every flock mode has its own read: ' + Object.keys(px).length);
  const n5 = newCanvas(120, 60), n2 = newCanvas(120, 60); ART.drawFlock(n5.getContext('2d'), { x: 60, y: 30, hp: 30, mode: 'wheel', anim: 0.6 }, 0, 0, 0.45, FLOCK); ART.drawFlock(n2.getContext('2d'), { x: 60, y: 30, hp: 10, mode: 'wheel', anim: 0.6 }, 0, 0, 0.45, FLOCK); ok(lit(n5) > lit(n2), 'fewer books as it takes damage');
  const l = newCanvas(120, 60), r = newCanvas(120, 60); ART.drawFlock(l.getContext('2d'), { x: 60, y: 30, hp: 30, mode: 'stream', anim: 0.6, face: -1 }, 0, 0, 0.45, FLOCK); ART.drawFlock(r.getContext('2d'), { x: 60, y: 30, hp: 30, mode: 'stream', anim: 0.6, face: 1 }, 0, 0, 0.45, FLOCK); ok(sig(l) !== sig(r), 'the stream trails behind it either way'); }

/* ---- the Headmistress ---- */
{ const modes = Object.keys(POSE).concat(['dead']), px = {}; for (const k of modes) { const c = newCanvas(120, 110), g = c.getContext('2d'); HMA.drawHeadmistress(g, 60, 80, k, POSE[k] || POSE.lecture, k.length & 1 ? 1 : -1, 0.4, { lesson: 1 }); px[k] = lit(c); ok(px[k] > 300, 'Headmistress ' + k + ' draws (' + px[k] + ' px)'); }
  const set = new Set(); for (const k of modes) { const c = newCanvas(120, 110); HMA.drawHeadmistress(c.getContext('2d'), 60, 80, k, POSE[k] || POSE.lecture, 1, 0.4, { lesson: 1 }); set.add(sig(c)); } ok(set.size === modes.length, 'every mode wears its own pose: ' + set.size + ' distinct of ' + modes.length + ' (the POSE table + dead)');
  const ls = new Set(); for (const lsn of [1, 2, 3, 4]) { const c = newCanvas(120, 110); HMA.drawHeadmistress(c.getContext('2d'), 60, 80, 'lecture', POSE.lecture, 1, 0.4, { lesson: lsn }); ls.add(sig(c)); } ok(ls.size === 4, 'each lesson (levitation / blink / conjure step / the finale) colours the air round her');
  const fl = newCanvas(120, 110), nf = newCanvas(120, 110); HMA.drawHeadmistress(fl.getContext('2d'), 60, 80, 'stagger', POSE.stagger, 1, 0.4, { flash: true }); HMA.drawHeadmistress(nf.getContext('2d'), 60, 80, 'stagger', POSE.stagger, 1, 0.4, {}); ok(lit(fl) > 300 && sig(fl) !== sig(nf), 'the hit flash draws');
  const a1 = newCanvas(120, 110), a2 = newCanvas(120, 110); HMA.drawHeadmistress(a1.getContext('2d'), 60, 80, 'dead', POSE.lecture, 1, 0.4, { alpha: 0.3 }); HMA.drawHeadmistress(a2.getContext('2d'), 60, 80, 'dead', POSE.lecture, 1, 0.4, {}); ok(sig(a1) !== sig(a2), 'she fades out');
  const c = newCanvas(80, 60), g = c.getContext('2d'); HMA.drawSigil(g, 20, 50, 12, false, 0, 0.1); HMA.drawSigil(g, 50, 50, 12, true, 30, 0.1); HMA.drawBolt(g, 40, 10, 1, 0.1); HMA.drawShieldBook(g, 15, 15, 0.2, 1); ok(lit(c) > 200, 'the chalk sigil (told / falling), the chalk bolt and the shield book draw'); }

/* ---- the hands run through the art (a fake world) ---- */
{ const L0 = LEVELS.find(l => l.id === 'academy').build(), p = { x: 22 * 16 + 8, y: 36 * 16, hp: 400, ground: true, face: 1, vx: 0, vy: 0 };
  const fx = { L: L0, TS, T, players: () => [p], enemies: () => [], time: () => 0, number() {}, hint() {}, asPlayer: (q, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { L0.grid[y * L0.W + x] = t; }, upright: () => true, hitOnce: () => true, shake() {}, ring() {}, hero: () => p, arenaLit: () => false, ac: null };
  const A = makeAcademyHands(fx); A.reset(); fx.ac = () => A; A.teach(p, 'conjure', 'library'); p.ground = false; p.coyote = 0; p.jbuf = 1; A.player(0.02, p, false); A.update(0.02);
  const c = newCanvas(480, 280), g = c.getContext('2d'); let err = null; try { A.drawBack(g, 0, 400, 480, 280, 0.3); A.drawOver(g, 0, 400, 480, 280, 0.3); A.drawFlock(g, { x: 100, y: 100, hp: 30, mode: 'wheel', anim: 1, face: 1 }, 0, 0, 0.3); } catch (e) { err = e; }
  ok(!err && lit(c) > 20000 && A.steps().length === 1, 'the academy hands draw back + over + flock through the art (a conjured step is up)' + (err ? ' ' + err.message : ''));
  const e = { t: 'headmistress', alive: true, x: 304 * 16, y: 400, w: 14, h: 30, face: -1, mode: 'lecture', hp: 2600, maxHp: 2600, boss: true };
  const H = makeHeadmistressHands({ ...fx, ac: () => A, boss: e, bossActive: true, EHP: {}, sfx: {} }); H.spawnBoss({ x: e.x, y: e.y }); const c2 = newCanvas(480, 280), g2 = c2.getContext('2d'); let err2 = null;
  try { H.drawBoss(g2, e, 280 * 16, 300, 0.3); H.drawOver(g2, 280 * 16, 300, 480, 280, 0.3); H.drawBoss(g2, { ...e, alive: false }, 280 * 16, 300, 1); } catch (er) { err2 = er; }
  ok(!err2 && lit(c2) > 300, 'the Headmistress hands draw her through the art' + (err2 ? ' ' + err2.message : '')); }

/* ---- the wiring ---- */
{ const m = src('src/main.js'), ah = src('src/academy-hands.js'), hh = src('src/headmistress-hands.js');
  ok(/L\.academy && \(t === T\.SOLID \|\| t === T\.ONEWAY\)\) \{ const ts = ACA\.academyTile/.test(m) && /import \* as ACA from '\.\/redraw\/academy_art\.js'/.test(m), 'main.js: the tile hook is one line guarded by L.academy (a flag-off game never has it) + one import');
  ok(/redraw\/academy_art\.js/.test(ah) && /redraw\/headmistress_art\.js/.test(hh), 'the hands draw through the art');
  ok(!/rect\(g, px - 2, py - 14, 4, 14, '#5a4a3a'\)/.test(ah) && !/rect\(g, ex - 10 \+ lean/.test(hh), 'the greybox rects are gone');
  const all = ['src/redraw/academy_art.js', 'src/redraw/headmistress_art.js'].map(src).join('\n'); ok(!/wood|plank|\blog\b|goblin/i.test(all.replace(/NO wood, no logs/g, '').replace(/no goblins/gi, '')), 'on theme: no wood, logs or goblins in the art'); }
console.log(bad ? 'FAILED' : 'all ok'); process.exitCode = bad ? 1 : 0;
