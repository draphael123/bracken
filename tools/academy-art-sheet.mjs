// tools/academy-art-sheet.mjs (claude/academyart; pure node, no browser): THE MAGE ACADEMY's art on a contact sheet. The REAL level is built (flag on), and windows of it are drawn with the real
// tile maker (src/redraw/academy_art.js academyTile) and the real hands' drawBack / drawOver / drawFlock (a fake world, as tools/academy.mjs): the steps and the library's first stacks, the
// reading gallery and the flock, the archive pit and the library door, the lecture hall's tiers, the rails and the duel, the summoning well with two conjured steps and a levitating / blinking
// hero, the exam hall, the Examination in lesson one (rafters, shield books, chalk rain), lesson two (her ward rail, a chalk bolt), lesson three (the floor dismissed, her desk, the dispel),
// and the gate open with her seated. Then the props, the foes (the flock in every mode) and THE HEADMISTRESS in every pose.
//   node tools/academy-art-sheet.mjs [out.png] [scale]
globalThis.__AC = true;
const { install, savePNG, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T, TS } = await import('../src/level.js');
const ART = await import('../src/redraw/academy_art.js');
const HMA = await import('../src/redraw/headmistress_art.js');
const { makeAcademyHands, FLOCK } = await import('../src/academy-hands.js');
const { POSE } = await import('../src/headmistress-hands.js');
const { HM } = await import('../src/headmistress.js');
const out = process.argv[2] || 'academy-art-sheet.png', SC = +(process.argv[3] || 1);
const lv = LEVELS.find(l => l.id === 'academy'); if (!lv) { console.error('no academy level (flag?)'); process.exit(1); }
let bad = 0; const fail = (m, e) => { bad++; console.error('FAILED', m, e && e.message); };

const L = lv.build(), W = L.W, F = 40;
const P = { x: 0, y: 0, hp: 400, ground: true, face: 1, vx: 0, vy: 0 };
const fx = { L, TS, T, players: () => fx.heroes, enemies: () => [], heroes: [P], time: () => 0, number() {}, hint() {}, asPlayer: (p, fn) => fn(), damage: () => 'hit', cellSet: (x, y, t) => { L.grid[y * W + x] = t; }, upright: () => true, hitOnce: () => true, shake() {}, ring() {}, hero: () => P, arenaLit: id => fx.lit === id };
const A = makeAcademyHands(fx); A.reset();
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
const bg = (g, w, h) => { g.fillStyle = '#0a0a10'; g.fillRect(0, 0, w, h); };
const man = (g, x, y, face = 1) => { g.fillStyle = '#5a7ab4'; g.fillRect(x - 3, y - 14, 6, 10); g.fillStyle = '#d4b090'; g.fillRect(x - 2, y - 18, 5, 4); g.fillStyle = '#3a3a4c'; g.fillRect(x - 3, y - 4, 6, 4); g.fillStyle = '#c8c8d8'; g.fillRect(x + face * 4, y - 12, 2, 8); };
function scene(c0, r0, cols, rows, mutate, o = {}) {
  const VW = cols * TS, VH = rows * TS, c = newCanvas(VW, VH), g = c.getContext('2d'), cx = c0 * TS, cy = r0 * TS, time = 1.3;
  bg(g, VW, VH);
  try { A.drawBack(g, cx, cy, VW, VH, time); } catch (e) { fail('drawBack', e); }
  const dyn = A.show() ? A.show().cells : new Map();
  for (let y = r0; y < r0 + rows; y++) for (let x = c0; x < c0 + cols; x++) { const t = at(x, y); if (t === T.AIR || dyn.has(y * W + x)) continue; let ts = null; try { ts = ART.academyTile(t, x, y, at, T, L); } catch (e) { fail('tile ' + t, e); }
    if (ts) g.drawImage(ts, (x - c0) * TS, (y - r0) * TS); else { g.fillStyle = '#ff00ff'; g.fillRect((x - c0) * TS, (y - r0) * TS, TS, TS); } }
  for (const e of L.ents) { if (e.x < c0 - 2 || e.x > c0 + cols + 2) continue; const sx = e.x * TS + 8 - cx, sy = (e.y + 1) * TS - cy;
    if (e.t === 'acbooks') { const modes = ['wheel', 'gatherTell', 'stream', 'scattered', 'regroup']; const m = o.flockMode || modes[(e.x >> 2) % 5]; try { A.drawFlock(g, { x: e.x * TS + 8, y: e.y * TS, hp: 30, mode: m, anim: 0.4 + e.x, face: -1 }, cx, cy, time); } catch (er) { fail('flock', er); } }
    if (e.t === 'check') { g.fillStyle = '#d8b040'; g.fillRect(sx - 2, sy - 26, 4, 26); g.fillStyle = '#ffe9a0'; g.fillRect(sx - 2, sy - 28, 8, 4); }
    if (e.t === 'silver') { g.fillStyle = '#e8e8f4'; g.fillRect(sx - 3, sy - 8, 6, 6); }
    if (e.t === 'sign') { g.fillStyle = '#6a6488'; g.fillRect(sx - 1, sy - 12, 2, 12); g.fillRect(sx - 6, sy - 18, 12, 7); g.fillStyle = '#c8c0e0'; g.fillRect(sx - 4, sy - 16, 8, 1); g.fillRect(sx - 4, sy - 14, 6, 1); } }
  if (mutate) mutate(g, cx, cy);
  try { A.drawOver(g, cx, cy, VW, VH, time); } catch (e) { fail('drawOver', e); }
  return c;
}
const scenes = [];
/* 1: the steps and the library's first stacks, a hero with LEVITATION floating up the stacks */
fx.heroes = [P]; P.x = 29 * TS; P.y = 34 * TS; P.ground = false; A.teach(P, 'levitate', 'library'); P.acFloat = true; A.show().hero.get(P).floatT = 0.5;
scenes.push(scene(0, 26, 44, 20, (g, cx, cy) => { man(g, P.x - cx + 0, P.y - cy); }));
P.acFloat = false;
/* 2: the reading gallery, the first flock, the archive pit */
scenes.push(scene(40, 16, 44, 28, null));
/* 3: the tall stack, the east wall and the high door */
scenes.push(scene(66, 14, 44, 28, null));
/* 4: the lecture hall's tiers and the first rail (the hero BLINKING through it) */
A.forget(P, true); A.teach(P, 'blink', 'lecture'); P.x = 126 * TS; P.y = 40 * TS; P.ground = true;
scenes.push(scene(100, 20, 44, 26, (g, cx, cy) => { man(g, P.x - cx, P.y - cy); man(g, P.x + 90 - cx, P.y - cy, -1); }));
/* 5: the rails, the duel, the orchestra pit */
P.x = 128 * TS; scenes.push(scene(128, 20, 44, 26, null));
/* 6: the summoning well, two conjured steps chained */
A.forget(P, true); A.teach(P, 'conjure', 'yard'); fx.heroes = [P]; P.ground = false; P.coyote = 0; P.x = 197 * TS + 8; P.y = 38 * TS; P.jbuf = 1; A.player(0.3, P, false);
P.x = 202 * TS; P.y = 36 * TS - 4; P.jbuf = 1; A.player(0.3, P, false); P.x = 207 * TS; P.y = 33 * TS; P.jbuf = 1; A.update(0.4); A.player(0.3, P, false);
scenes.push(scene(184, 22, 44, 26, (g, cx, cy) => man(g, P.x - cx, P.y - cy)));
scenes.push(scene(210, 20, 44, 28, null));
/* 7: the exam hall */
A.forget(P, true); fx.heroes = [P]; scenes.push(scene(250, 18, 44, 26, null));
/* 8: the Examination - lesson one (rafters, shield books, chalk rain) */
const Ar = L.arena, arenaLec = L.ac.lecterns.filter(l => l.arena);
const hmAt = (g, cx, cy, x, y, mode, lesson, face = -1, o = {}) => HMA.drawHeadmistress(g, x - cx, y - cy, mode, POSE[mode] || POSE.lecture, face, 1.3, { lesson, ...o });
const GG = { floorY: Ar.floor, ceil: Ar.ceil, rafterY: Ar.rafterY };
fx.lit = arenaLec[0].id; P.x = 308 * TS; P.y = F * TS; P.ground = true;
scenes.push(scene(300, 22, 44, 22, (g, cx, cy) => { for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; HMA.drawShieldBook(g, 319 * TS + Math.cos(a) * 30 - cx, Ar.rafterY - 16 + Math.sin(a) * 30 * 0.6 - cy, 1.3, i); }
  hmAt(g, cx, cy, 319 * TS, Ar.rafterY, 'chalkTell', 1); HMA.drawSigil(g, 310 * TS - cx, GG.floorY - cy, HM.chalk.w, false, 0, 1.3); HMA.drawSigil(g, 326 * TS - cx, GG.floorY - cy, HM.chalk.w, true, GG.floorY - 60 - cy, 1.3); man(g, P.x - cx, P.y - cy); }));
/* 9: lesson two - her ward rail, a chalk bolt, she faces the rail */
fx.lit = arenaLec[1].id; A.tempRail('hm', 313, 23, F - 1);
scenes.push(scene(300, 22, 44, 22, (g, cx, cy) => { hmAt(g, cx, cy, 319 * TS, GG.floorY, 'boltTell', 2, -1); HMA.drawBolt(g, 306 * TS - cx, GG.floorY - 20 - cy, -1, 1.3); man(g, 304 * TS - cx, GG.floorY - cy); }));
A.dropRail('hm');
/* 10: lesson three - the floor dismissed, her desk, the dispel */
fx.lit = arenaLec[2].id; for (let x = Ar.x0 / TS + 11; x <= Ar.x0 / TS + 26; x++) for (let y = F; y < L.H; y++) A.setCell(x, y, T.AIR);
P.x = 335 * TS; P.y = F * TS; scenes.push(scene(300, 22, 44, 22, (g, cx, cy) => { hmAt(g, cx, cy, 319 * TS, Ar.deskY, 'dispelTell', 3, -1); man(g, P.x - cx, P.y - cy); const mk = (x, y) => { g.fillStyle = '#ff6b6b'; g.fillRect(x, y, 3, 7); g.fillRect(x, y + 9, 3, 3); }; mk(319 * TS - cx - 1, Ar.deskY - 66 - cy); }));
/* 11: the gate open, her seated */
for (let x = Ar.x0 / TS + 11; x <= Ar.x0 / TS + 26; x++) for (let y = F; y < L.H; y++) A.restoreCell(x, y);
fx.lit = null; A.openExit(); scenes.push(scene(300, 22, 44, 22, (g, cx, cy) => { hmAt(g, cx, cy, 331 * TS, GG.floorY, 'dead', 4, -1, {}); man(g, 318 * TS - cx, GG.floorY - cy); }));

/* ---- the props row ---- */
const cells = [];
const cell = (w, h, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = '#1a1626'; g.fillRect(0, 0, w, h); try { fn(g, h); } catch (e) { fail(fn.toString().slice(0, 60), e); } cells.push(c); return c; };
for (const sp of ['levitate', 'blink', 'conjure']) { cell(40, 50, g => ART.drawLectern(g, 20, 47, sp, true, 0.6)); cell(40, 50, g => ART.drawLectern(g, 20, 47, sp, false, 0.6)); }
for (const t of [0.0, 0.5]) cell(34, 70, g => ART.drawRail(g, 9, 2, 68, t, 1, false));
cell(34, 70, g => ART.drawRail(g, 9, 2, 68, 0.2, 1, true));
cell(56, 30, g => [0, 1, 2].forEach(i => ART.drawStep(g, 4 + i * 16, 8, i === 0, i === 2, false, 0.4, i))); cell(56, 30, g => [0, 1, 2].forEach(i => ART.drawStep(g, 4 + i * 16, 8, i === 0, i === 2, true, 0.4, i)));
cell(24, 26, g => ART.drawRune(g, 12, 24, false, 0.3)); cell(24, 26, g => ART.drawRune(g, 12, 24, true, 0.3));
for (const sp of ['levitate', 'blink', 'conjure']) cell(30, 60, g => ART.drawAura(g, 15, 10, sp, { float: sp === 'levitate', meter: 0.6 }, 0.5));
for (const k of ['candle', 'books', 'globe', 'easel', 'desk']) cell(24, 26, g => { g.drawImage(ART.decorSprite(k, 1), 0, 0); });
cell(40, 20, g => HMA.drawSigil(g, 20, 18, 12, false, 0, 0.1)); cell(40, 30, g => HMA.drawSigil(g, 20, 28, 12, true, 28, 0.1)); cell(50, 14, g => HMA.drawBolt(g, 26, 7, 1, 0.1)); cell(24, 20, g => HMA.drawShieldBook(g, 12, 10, 0.2, 1));
/* the tile kit close-up */
const tiles = [];
for (const z of ['steps', 'library', 'lecture', 'yard', 'exam']) { tiles.push(ART.stoneTile(z, 1, 1, { up: true, aL: true }), ART.stoneTile(z, 2, 1, { up: true }), ART.stoneTile(z, 3, 1, { up: true, aR: true }), ART.stoneTile(z, 2, 2, {}), ART.stoneTile(z, 2, 3, { dn: true })); }
tiles.push(ART.shelfTile(1, 20, true, true, false), ART.shelfTile(2, 21, false, false, false), ART.shelfTile(3, 22, false, false, true), ART.galleryTile('library', 1, true, false), ART.galleryTile('exam', 2, false, false), ART.galleryTile('exam', 3, false, true),
  ART.floatTile(1, 1, true, false, true, true), ART.floatTile(2, 1, false, false, true, true), ART.floatTile(3, 1, false, true, true, true), ART.railTile(true, false), ART.railTile(false, false), ART.railTile(false, true), ART.shutterTile(0), ART.shutterTile(1));
for (let i = 0; i < 5; i++) tiles.push(ART.gateTile(i, 5));
/* the foes: the flock in every mode */
const flock = [];
for (const hp of [30, 12]) for (const mode of ['wheel', 'gatherTell', 'stream', 'scattered', 'regroup']) { const c = newCanvas(80, 50), g = c.getContext('2d'); g.fillStyle = '#1a1626'; g.fillRect(0, 0, 80, 50); try { ART.drawFlock(g, { x: 40, y: 28, hp, mode, anim: 0.7, face: 1 }, 0, 0, 0.45, FLOCK); } catch (e) { fail('flock ' + mode, e); } flock.push(c); }
/* the Headmistress: every pose */
const hms = [];
const poseModes = Object.keys(POSE).concat(['dead']);
for (const k of poseModes) { const c = newCanvas(96, 80), g = c.getContext('2d'); g.fillStyle = '#1a1626'; g.fillRect(0, 0, 96, 80); g.fillStyle = '#2a2638'; g.fillRect(0, 70, 96, 10);
  try { HMA.drawHeadmistress(g, 48, 68, k, POSE[k] || POSE.lecture, k.length & 1 ? 1 : -1, 0.3, { lesson: ['chalkTell', 'chalk', 'rulerTell', 'ruler', 'sleep', 'wake', 'lecture'].includes(k) ? 1 : ['boltTell', 'bolt', 'aboutTell', 'about'].includes(k) ? 2 : ['dispelTell', 'dispel', 'crumbleTell'].includes(k) ? 3 : 4 }); } catch (e) { fail('headmistress ' + k, e); } hms.push(c); }
for (const [ls, fl] of [[1, false], [2, false], [3, false], [4, false], [1, true]]) { const c = newCanvas(96, 80), g = c.getContext('2d'); g.fillStyle = '#1a1626'; g.fillRect(0, 0, 96, 80); g.fillStyle = '#2a2638'; g.fillRect(0, 70, 96, 10); try { HMA.drawHeadmistress(g, 48, 66, 'lecture', POSE.lecture, 1, 0.3, { lesson: ls, flash: fl }); } catch (e) { fail('lesson', e); } hms.push(c); }
/* ---- lay it out ---- */
const strip = (items, pad, maxW = 1440) => { let x = pad, y = pad, rh = 0; const pos = []; for (const c of items) { if (x + c.width + pad > maxW && x > pad) { x = pad; y += rh + pad; rh = 0; } pos.push([x, y]); x += c.width + pad; rh = Math.max(rh, c.height); } return { items, pos, w: maxW, h: y + rh + pad }; };
const big = (c, k) => { const o = newCanvas(c.width * k, c.height * k); o.getContext('2d').drawImage(c, 0, 0, c.width * k, c.height * k); return o; };
const half = c => { const o = newCanvas(c.width >> 1, c.height >> 1); o.getContext('2d').drawImage(c, 0, 0, c.width, c.height, 0, 0, c.width >> 1, c.height >> 1); return o; };
const blocks = [strip(scenes, 6, 1440), strip(cells.map(c => big(c, 3)), 4), strip(tiles.map(c => big(c, 4)), 4), strip(flock.map(c => big(c, 2)), 4), strip(hms.map(c => big(c, 2)), 4)];
const H = blocks.reduce((a, b) => a + b.h + 8, 8), sheetC = newCanvas(1440, H), sg = sheetC.getContext('2d'); sg.fillStyle = '#3a4a6a'; sg.fillRect(0, 0, 1440, H);
let oy = 8; for (const b of blocks) { b.items.forEach((c, i) => sg.drawImage(c, b.pos[i][0], oy + b.pos[i][1])); oy += b.h + 8; }
const final = SC === 1 ? sheetC : big(sheetC, SC); savePNG(final, out);
console.log((bad ? 'FAILED ' + bad : 'ok') + ': ' + scenes.length + ' scenes, ' + cells.length + ' props, ' + tiles.length + ' tiles, ' + flock.length + ' flock frames, ' + hms.length + ' Headmistress poses -> ' + out + ' (' + final.width + ' x ' + final.height + ')');
process.exitCode = bad ? 1 : 0;
if (process.env.ACCROP !== undefined) { const i = +process.env.ACCROP, c = scenes[i]; savePNG(c, out.replace(/\.png$/, '-scene' + i + '.png')); }
