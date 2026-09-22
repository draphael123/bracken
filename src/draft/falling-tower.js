// src/draft/falling-tower.js — THE FALLING TOWER, LONGER (a draft for Daniel's 2026-09-21 notes, not wired in):
//   "the level can be a bit longer, and should use gravity mechanics like the level before, and still have some platforming over
//    the pendulums that were in the level earlier. It can also have fewer zombies and a new enemy type - floating books."
// The live tower (src/tower-ascent.js, 5 floors) with two floors added and its garrison re-cast. Seven floors, bottom to top:
//   1 THE LIBRARY STACKS     as live; the TOMES (floating books, src/tome.js) are met here
//   2 THE READING ROOM       NEW: the Folly's gravity. Tiers climb halfway to a GLYPH; the room turns over and you fall UP onto
//                            the underside of a stone gallery, walk the ceiling to its gap, fall up through it, walk to the
//                            ceiling glyph and the room rights itself, dropping you on the gallery. (setFlip / the 'glyph' prop:
//                            main.js ~9723 and ~9795; the tower already carries L.mage, so MG exists and glyphs work.)
//   3 THE ORRERY CAGE        as live
//   4 THE PENDULUM GALLERY   NEW: three clock pendulums ('swing' movers, as Marsh and Kingswood use) cross a 21-tile gap over the
//                            spiked gear pit; a wall stair up each side between them
//   5 THE BURST CISTERN      as live (poison between the stones)
//   6 THE BELL LOFT          as live (the frames' lifts)
//   7 THE OPEN CROWN         as live, and the carpet to the Undead Archmage
// Fewer zombies: 3 zombies and 1 husk in the whole tower (the live one has 8 and 6); tomes and the Folly's own foes carry the rest.
// BUILT 2026-09-22 (src/tower-ascent.js, the integration plan's step 4). What the shipped level does differently, and why:
//   the greybox's 3 strays and its relic are the draft kit's F7 rule (every NEW level carries them); the Falling Tower is not a
//   new level and has never had either, so the shipped tower keeps its own three silvers and pays the second pendulum landing in
//   COINS instead. Its one husk is the cistern's ELITE (level.js ELITES), which stands on this roster's husk rather than beside it.
// Checked by `node tools/draft-level.mjs falling-tower` (+ meta.extra: both new floors are LOAD-BEARING - without the flip, or
// without the pendulums, nothing above them is reached). Map: `node tools/draft-map.mjs falling-tower`.
export const FT = { W: 72, X0: 12, X1: 59, SKY: 50, FLOOR: 36, N: 7 };
const SPINE = [[14, 10], [22, 9], [30, 10], [39, 9], [47, 10], [40, 9], [32, 10], [24, 9]];
const NAMES = ['library', 'reading', 'orrery', 'pendulum', 'cistern', 'loft', 'crown'];
const TITLES = ['THE LIBRARY STACKS', 'THE READING ROOM', 'THE ORRERY CAGE', 'THE PENDULUM GALLERY', 'THE BURST CISTERN', 'THE BELL LOFT', 'THE OPEN CROWN'];
export const SWING = { arm: 12 * 16, th: 0.9, w: 48 };   // a pendulum: 12-tile arm, swings +-0.9 rad, a 3-tile platform
const endRise = () => Math.round(SWING.arm * (1 - Math.cos(SWING.th)) / 16);   // rows its ends stand over its bottom

export function build(T) {
  const { W, X0, X1, SKY, FLOOR, N } = FT, H = SKY + N * FLOOR + 4, TS = 16;
  const grid = new Uint8Array(W * H).fill(T.SOLID), set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const rect = (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  const ents = [], ent = (t, x, y, o = {}) => ents.push({ t, x, y, ...o }), deco = (kind, x, y, o) => ent('deco', x, y, { kind, ...o });
  const foe = (t, x, y) => ent(t, x, y, { face: x < 36 ? 1 : -1 }), FLY = new Set(['tome', 'imp', 'bat', 'boo', 'haunt', 'broom']);
  const put = (t, x0, len, row) => foe(t, x0 + (len >> 1), FLY.has(t) ? row - 3 : row - 1);
  const ledge = (x0, len, row, t = T.ONEWAY) => rect(x0, x0 + len - 1, row, row, t);
  const nets = [], net = (x, y0, y1) => nets.push([x, y0, y1]), moversExtra = [], pools = [], interiors = [], flips = [];
  rect(0, W - 1, 0, SKY - 1, T.AIR);
  for (const [a, b] of [[X0 - 2, X0 - 1], [X1 + 1, X1 + 2]]) for (let y = SKY - 4; y < SKY; y++) if (((y - SKY) & 1) === 0 || y >= SKY - 2) rect(a, b, y, y, T.SOLID);
  // the floors, bottom (k 0) to top (k 6): each 34 rows of room over a two-row stone floor that is the divider of the one under it
  const floors = NAMES.map((name, k) => { const top = SKY + (N - 1 - k) * FLOOR, bot = top + FLOOR - 2; rect(X0, X1, top, bot - 1, T.AIR); interiors.push([X0, X1, top, bot - 1, name]); return { name, title: TITLES[k], k, top, bot, tiers: [] }; });
  const spine = (F, from, to, i0, kind = () => T.ONEWAY) => { let i = i0; for (let row = from; row >= to; row -= 3, i++) { const [x0, len] = SPINE[i % SPINE.length]; F.tiers.push([x0, len, row]); ledge(x0, len, row, kind(F.tiers.length - 1)); } };
  const sections = {}, marks = {};
  floors.forEach(F => { sections[F.name] = F.bot - 1; marks[F.name] = F.bot - 1; });
  sections.arena = SKY;

  // ---- 1. THE LIBRARY STACKS ----
  { const F = floors[0]; for (const [x0, x1, h] of [[X0, X0 + 1, 22], [X1 - 1, X1, 18], [X0, X0 + 3, 6], [X1 - 3, X1, 8]]) rect(x0, x1, F.bot - h, F.bot - 1, T.SOLID);
    spine(F, F.bot - 3, F.top + 3, 0, () => T.PLANK);
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE TOWER IS FALLING. CLIMB. EVERY FLOOR YOU LEAVE GOES DOWN BEHIND YOU.' });
    deco('lectern', 22, F.bot - 1); deco('bookpile', 38, F.bot - 1); deco('desk', 44, F.bot - 1);
    const who = ['tome', 'apprentice', 'broom', 'armour', 'tome', 'zombie', 'apprentice', 'tome', 'imp', 'broom', 'tome'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row)); foe('apprentice', 14, F.bot - 7);
    ent('silver', X0 + 1, F.bot - 23); }

  // ---- 2. THE READING ROOM: the room turns over ----
  { const F = floors[1], slab = F.top + 10, under = slab + 2, gap = [14, 16];   /* the gallery: rows slab..slab+1, its underside walked at `under` */
    rect(X0, X1, slab, slab + 1, T.SOLID); rect(gap[0], gap[1], slab, slab + 1, T.AIR);
    /* the lower half: five tiers up from the floor to the glyph; the top one stands nine rows under the gallery's top, so nothing climbs to it */
    for (const [x0, len, row] of [[20, 10, F.bot - 3], [28, 10, F.bot - 6], [36, 9, F.bot - 9], [44, 9, F.bot - 12], [36, 12, under + 7]]) { F.tiers.push([x0, len, row]); ledge(x0, len, row); }
    const g1 = { x: 46, y: under + 6 }; ent('glyph', g1.x, g1.y);                                  /* on the top lower tier: FALL UP */
    const g2 = { x: 50, y: F.top }; ent('glyph', g2.x, g2.y, { ceiling: true, hung: true });                  /* on the divider's underside: FALL DOWN, onto the gallery */
    flips.push({ from: g1, up: under, walk: [gap[0] + 1, g1.x], through: gap[0] + 1, ceil: F.top, to: g2 });
    /* the upper half, on the gallery: two tiers to the rope */
    for (const [x0, len, row] of [[32, 10, slab - 3], [22, 10, slab - 6]]) { F.tiers.push([x0, len, row]); ledge(x0, len, row); }
    for (let x = g1.x - 2; x >= gap[1] + 1; x -= 3) ent('coin', x, under);                         /* a trail along the ceiling walk: the way, said in coins */
    ent('check', 24, F.bot - 1); ent('sign', 20, F.bot - 1, { text: 'THE READING ROOM. THE GLYPHS TURN THE ROOM OVER: STAND ON ONE, AND FALL UP.' });
    ent('check', 40, slab - 1);                                                                     /* on the gallery: the flip is not asked twice */
    deco('readingDesk', 30, F.bot - 1); deco('globe', 52, F.bot - 1); deco('candelabra', 26, slab - 1);
    for (const [t, x, y] of [['tome', 24, F.bot - 7], ['apprentice', 32, F.bot - 7], ['tome', 40, F.bot - 12], ['armour', 48, F.bot - 13], ['tome', 30, under + 3], ['imp', 20, under + 4],
      ['tome', 36, under + 5], ['armour', 46, slab - 1], ['tome', 28, slab - 8], ['apprentice', 26, slab - 7], ['tome', 52, slab - 4], ['boo', 18, F.bot - 12]]) foe(t, x, y);
    ent('stray', 56, slab - 1); }

  // ---- 3. THE ORRERY CAGE ----
  { const F = floors[2]; spine(F, F.bot - 3, F.top + 3, 4, j => j % 3 === 2 ? T.CRYST : T.ONEWAY);
    ent('check', 20, F.bot - 1); ent('sign', 16, F.bot - 1, { text: 'THE ORRERY. CRYSTAL CRAZES UNDER YOU: DO NOT STAND ON IT LONG.' });
    deco('orreryBase', 36, F.bot - 1); deco('telescope', 28, F.bot - 1);
    const who = ['imp', 'apprentice', 'tome', 'armour', 'bat', 'apprentice', 'haunt', 'tome', 'zombie', 'boo', 'apprentice'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row));
    const [px0, plen, prow] = F.tiers[5]; ledge(px0 + plen + 4 <= X1 - 3 ? px0 + plen + 4 : px0 - 7, 3, prow); ent('silver', px0 + plen + 4 <= X1 - 3 ? px0 + plen + 5 : px0 - 6, prow - 1); }

  // ---- 4. THE PENDULUM GALLERY: over the gear pit on the clock's pendulums ----
  { const F = floors[3], rise = endRise(), mid = 36;
    rect(26, 41, F.bot - 1, F.bot - 1, T.SPIKE);                                                     /* the gear pit: the floor under the swings bites */
    const stairL = [[13, 6], [19, 7]], stairR = [[53, 6], [47, 7]];                                  /* each wall's stair: a step by the wall, then the boarding ledge */
    let row = F.bot - 3; const swings = [];
    for (let s = 0; s < 3; s++) {
      const fromLeft = s % 2 === 1, st = fromLeft ? stairL : stairR;   /* the first from the right: the orrery's rope comes up at x 44, past the pit */
      ledge(st[0][0], st[0][1], row); F.tiers.push([st[0][0], st[0][1], row]); row -= 3;
      ledge(st[1][0], st[1][1], row); F.tiers.push([st[1][0], st[1][1], row]);                       /* the boarding ledge, at the arc's end */
      const other = fromLeft ? stairR[1] : stairL[1]; ledge(other[0], other[1], row); F.tiers.push([other[0], other[1], row]);   /* the landing across the gap */
      const yb = row + rise; moversExtra.push({ kind: 'swing', px: mid * TS + 8, py: (yb - 12) * TS, arm: SWING.arm, x: 0, y: 0, w: SWING.w, h: 8, period: 3.4 + s * 0.3, phase: s * 1.3 });
      swings.push({ row, yb, land: fromLeft ? stairR[1] : stairL[1] }); if (s === 0) ent('check', 50, row - 1); row -= 3;
    }
    const endL = swings[2].land === stairL[1], lt = endL ? [15, 8] : [49, 8]; ledge(lt[0], lt[1], row); F.tiers.push([lt[0], lt[1], row]);   /* the last tier, off the third landing: the rope */
    ent('check', 15, F.bot - 1); ent('sign', 20, F.bot - 1, { text: 'THE PENDULUM GALLERY. THE CLOCK STILL KEEPS TIME. RIDE THE WEIGHTS OVER THE GEARS.' });
    deco('clockface', 36, F.top + 2, { hang: true, hung: true }); deco('gears', 34, F.bot - 2, { hung: true });   /* the gears turn behind the pit */
    for (const [t, x, y] of [['armour', 15, F.bot - 1], ['tome', 22, swings[0].row - 3], ['bat', 50, swings[0].row - 2], ['apprentice', 50, swings[0].row - 1], ['tome', 56, swings[1].row + 2],
      ['haunt', 30, swings[1].row - 4], ['armour', 22, swings[1].row - 1], ['tome', 15, swings[2].row + 2], ['imp', 44, swings[2].row - 4], ['apprentice', 50, swings[2].row - 1], ['tome', 43, row - 3]]) foe(t, x, y);
    { const [lx, ll] = swings[1].land; ent('relic', lx + (ll >> 1), swings[1].row - 1); } F.swings = swings; }

  // ---- 5. THE BURST CISTERN ----
  { const F = floors[4], surf = F.bot - 4;
    const [hx0, hlen] = floors[3].tiers[floors[3].tiers.length - 1], hx = hx0 + (hlen >> 1);
    for (let x = hx - 1 - 6 * 8; x < X1 - 2; x += 6) if (x > X0 + 10) rect(x, x + 1, surf - 2, F.bot - 1, T.SOLID);
    rect(X0, X0 + 8, surf - 2, F.bot - 1, T.SOLID); rect(X1 - 2, X1, surf - 2, F.bot - 1, T.SOLID);
    let i = 2; for (let r = F.bot - 3; r >= F.top + 3; r -= 3, i++) { if (r >= surf - 2) continue; const [x0, len] = SPINE[i % SPINE.length]; F.tiers.push([x0, len, r]); ledge(x0, len, r); }
    ent('check', X0 + 2, surf - 3); ent('sign', X0 + 5, surf - 3, { text: 'THE CISTERN BURST. THE WATER IS POISON.' });
    const who = ['husk', 'apprentice', 'imp', 'tome', 'zombie', 'apprentice', 'broom', 'tome', 'apprentice', 'imp'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row));
    F.cistern = { surf }; ent('silver', 57, surf - 3); }

  // ---- 6. THE BELL LOFT ----
  { const F = floors[5], b = F.bot;
    F.tiers = [[21, 10, b - 12], [34, 10, b - 21], [42, 10, b - 24], [34, 9, b - 27], [26, 9, b - 30]];
    for (const [x0, len, row] of F.tiers) ledge(x0, len, row);
    ent('mover', 18, b - 1, { len: 3, vert: true, rise: 11, period: 4.6 }); ent('mover', 31, b - 12, { len: 3, vert: true, rise: 9, period: 4.2, hung: true });
    ledge(46, 8, b - 9); ledge(12, 6, b - 18);
    ent('check', 50, b - 1); ent('sign', 54, b - 1, { text: 'THE BELL LOFT. RIDE THE FRAMES UP.' });
    for (const [t, x, y] of [['armour', 50, b - 10], ['apprentice', 14, b - 19], ['bat', 24, b - 8], ['boo', 40, b - 16], ['haunt', 52, b - 20], ['tome', 26, b - 15], ['armour', 38, b - 22], ['tome', 46, b - 28], ['apprentice', 30, b - 31], ['tome', 20, b - 33]]) foe(t, x, y);
    ent('stray', 49, b - 25); }

  // ---- 7. THE OPEN CROWN ----
  { const F = floors[6]; spine(F, F.bot - 3, F.top + 3, 12, j => j % 4 === 3 ? T.CRYST : T.ONEWAY);
    rect(28, 43, SKY + 1, SKY + 1, T.SOLID);
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE CROWN. THE ROOF IS GONE. A CARPET WAITS AT THE TOP.' });
    ent('check', 31, SKY); deco('telescope', 36, F.bot - 1);
    const who = ['imp', 'apprentice', 'bat', 'armour', 'tome', 'apprentice', 'haunt', 'imp', 'tome', 'bat', 'armour'];
    F.tiers.forEach(([x0, len, row], j) => put(who[j % who.length], x0, len, row)); ent('stray', 15, F.bot - 1); }
  /* THE SEAMS between floors, where a screen was empty: books over the cistern's poison, the gallery's top, the loft's floor, the crown's parapet */
  for (const [t, x, y] of [['tome', 28, floors[4].bot - 6], ['tome', 42, floors[4].bot - 7], ['tome', 26, floors[3].top + 3], ['bat', 50, floors[3].top + 2], ['apprentice', 14, floors[3].bot - 1],
    ['armour', 40, floors[5].bot - 1], ['tome', 30, floors[5].bot - 4], ['tome', 20, floors[0].top + 3], ['boo', 46, floors[0].top + 2], ['imp', 22, SKY + 3], ['tome', 48, SKY + 2]]) foe(t, x, y);
  ent('gate', 34, SKY); ent('undeadmage', 36, 42, { face: -1, hung: true });

  // ---- THE ROPES through each divider, from each floor's last tier ----
  for (let k = 0; k < N - 1; k++) { const F = floors[k], [x0, len, row] = F.tiers[F.tiers.length - 1], rx = x0 + (len >> 1);
    let top = F.top - 2; while (grid[(top - 1) * W + rx] === T.SOLID) top--; net(rx, top, row - 1); F.hole = [rx, F.top - 2, F.top - 1]; }
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);
  { const F = floors[4], surf = F.cistern.surf, open = x => grid[surf * W + x] === T.AIR && grid[(surf + 1) * W + x] === T.AIR;
    for (let x = X0; x <= X1; x++) { if (!open(x)) continue; let x1 = x; while (x1 + 1 <= X1 && open(x1 + 1)) x1++; pools.push({ x0: x * TS, x1: (x1 + 1) * TS, y: surf * TS + 4, depth: 3 * TS, bottom: F.bot * TS, harm: true, poison: true, deadly: true }); x = x1; } }

  const START = { x: 20, y: floors[0].bot - 1 };
  return { W, H, grid, ents, START, pools, falls: [], moversExtra, interiors, sections, marks, flips, floors: floors.map(({ name, title, top, bot, hole, swings }) => ({ name, title, top, bot, hole, swings })),
    arena: { x0: 4 * TS, x1: 68 * TS, y0: 34 * TS, floor: SKY * TS, trigger: 1e9, wallL: 0, wallR: W - 1, boss: 'undeadmage', carpet: true },
    towerAscent: true, fallingTower: true, stackedFloors: true, skyRow: SKY, carpetAt: { x: 36 * TS, y: SKY * TS }, hasCryst: true,
    mage: { shelves: [], hung: [], dais: [30, 40] }, draft: true, palette: { set: 'mage' } };
}
/* AS PLAYED: the reach model walks upright, so the Reading Room's turned-over walk is written in for it: the fall up from the glyph (a
   rope), the ceiling walk (a ledge just under the gallery), the fall up through the gap (a rope), the walk on the divider's underside
   (a ledge), and the drop from the ceiling glyph onto the gallery (a rope). A model of the flip's route, not the flip. */
export function asPlayed(L, T) {
  const g = L.grid.slice(), W = L.W, set = (x, y, v) => { if (g[y * W + x] === T.AIR) g[y * W + x] = v; };
  for (const f of L.flips) {
    for (let y = f.up; y <= f.from.y; y++) set(f.from.x, y, T.NET);
    for (let x = Math.min(...f.walk); x <= Math.max(...f.walk); x++) set(x, f.up + 1, T.ONEWAY);
    for (let y = f.ceil; y <= f.up; y++) set(f.through, y, T.NET);
    for (let x = Math.min(f.through, f.to.x); x <= Math.max(f.through, f.to.x); x++) set(x, f.ceil + 1, T.ONEWAY);
    for (let y = f.ceil + 1; y <= f.up - 3; y++) set(f.to.x, y, T.NET);
  }
  return { ...L, grid: g };
}
export const meta = {
  name: 'THE FALLING TOWER (longer)', orientation: 'v', flyers: ['tome', 'imp', 'boo', 'haunt', 'broom'], landmarks: ['library', 'reading', 'orrery', 'pendulum', 'cistern', 'loft', 'crown'], sun: false, density: [3.2, 4.8], skyArena: true,
  foes: ['tome', 'apprentice', 'broom', 'armour', 'zombie', 'husk', 'imp', 'bat', 'boo', 'haunt'],
  async extra(L, { ok, log, T, R, floodReach, slopeReachGrid }) {
    const cnt = t => L.ents.filter(e => e.t === t).length, foes = L.ents.filter(e => this.foes.includes(e.t)).length;
    ok(cnt('zombie') + cnt('husk') <= 4, `FEWER ZOMBIES: ${cnt('zombie')} zombies + ${cnt('husk')} husk in ${foes} foes (the live tower has 8 + 6)`);
    ok(cnt('tome') >= 12, `THE TOMES carry the tower: ${cnt('tome')} floating books, on every floor`);
    const F = Object.fromEntries(L.floors.map(f => [f.name, f])), seen = (R2, f, upper) => { for (const e of L.ents) if (e.t === 'check' && e.y <= f.bot - 1 - (upper ? 2 : 0) && e.y > f.top && R2.jumpNear(e.x, e.y)) return true; return false; };
    // THE FLIP IS LOAD-BEARING: as built (no flip), the Reading Room's gallery and everything over it is out of reach
    const Rb = floodReach(slopeReachGrid(L, T), T, { rides: true });
    ok(!seen(Rb, F.reading, true) && !seen(Rb, F.orrery), `THE ROOM TURNS OVER, or you go no further: without the flip the gallery's checkpoint and the orrery are ${seen(Rb, F.reading, true) ? 'REACHED (the flip is decoration)' : 'unreached'}`);
    ok(seen(R, F.reading, true) && seen(R, F.orrery) && seen(R, F.crown), 'and with it (as played) the gallery and every floor over it, up to the crown, are reached');
    // THE PENDULUMS ARE LOAD-BEARING: with the swings taken out, the gallery's upper stairs and the cistern are out of reach
    const noSwing = { ...this._asPlayed(L, T), moversExtra: L.moversExtra.filter(m => m.kind !== 'swing') }, Rs = floodReach(slopeReachGrid(noSwing, T), T, { rides: true });
    const upper = L.ents.filter(e => e.t === 'relic')[0];
    ok(!Rs.jumpNear(upper.x, upper.y) && !seen(Rs, F.cistern), `THE PENDULUMS carry you over the gears: without them the relic on the second landing and the cistern are ${Rs.jumpNear(upper.x, upper.y) ? 'REACHED' : 'unreached'}`);
    const gapOk = L.floors.find(f => f.name === 'pendulum').swings.every(s => s.row > 0);
    ok(gapOk, `three pendulums, each over a 21-tile gap (JUMP_ACROSS is 6): ${L.floors.find(f => f.name === 'pendulum').swings.map(s => 'row ' + s.row).join(', ')}`);
    log(`    ${L.H} rows (the live tower: 240), 7 floors (live: 5); foes ${foes}`);
  },
};
meta._asPlayed = asPlayed;
