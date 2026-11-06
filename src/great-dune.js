// src/great-dune.js - THE GREAT DUNE, desert act V level 9 (claude/greatdune, 11-06, the OPUS GREYBOX: geometry, the board road, the cast, the race; code-only,
// NOT on the live road). Sources: scratch/plan-desert-1105.md s1.9 / s3e / s3f / s3i / s4 (Daniel approved 11-05 14:07; plan Q2 rec: the 10-14 brief as
// written, no interview), scratch/brief-greatdune-1014.md (Mario-style run, shield sand-board, stomp, coin arcs, sinkholes, the obelisk, the Sun Scarab,
// medal times, the skiff chief race, no boss). Where the two differ the 11-05 plan wins.
//
// THE FLAG: GD_SHIPS = false. Off, src/level.js does not append the row: LEVELS is master's array exactly (no index, no save, no tool moves).
// On (?gd=1 on the page, globalThis.BRACKEN_GD, or GD=1 in a Node tool's env) the row is appended LAST and HIDDEN (no map node): ?gd=1&level=greatdune.
// THE ROAD INSERT (buriedcity > greatdune > sealedpyramid) is data in src/road-insert.js, live with GD_SHIPS (art before live) - proved by tools/road-insert.mjs.
//
// THE RULE: THE SAND IS A ROAD IF YOU'RE FAST ENOUGH. Stand still on soft sand and the dune takes you (src/quicksand.js: jump, and keep jumping - never a
// kill); on the big dunes you drop onto your SHIELD and ride (src/shield-board.js); a wind-skiff bandit rides the dunes beside you (src/sand-skiff.js).
// FIVE PARTS (columns are measured by the builder; the marks below are the piece names):
//   THE LAST STREET    the Buried City's edge: the rule, the first SOFT SAND (stand still and sink: the teach), the butt-slide on a small dune
//   THE FIRST DUNES    the BOARD taught: a big dune, a coast, a quicksand basin you jump, a scorpion you bowl, soft sand you must keep moving on
//   THE ROLLING SEA    the board road: basins under vultures (stomp chains), the first SAND-SKIFF, SINKHOLE ONE (a cave: a silver), the first SUN SCARAB
//                      and a run of the cast to plough. CHECKPOINT ONE.
//   THE SKIFF ROAD     two skiffs on the long flats, sand-worm beds, SINKHOLE TWO, the scarab chain (each within reach of the next at the board's speed)
//   THE RACE           CHECKPOINT TWO at the start line; THE SKIFF CHIEF sails for the obelisk (his pots, his rubber band); the kicker dune and THE OBELISK
//                      (strike it as high as you can: a bonus by height); the gate.
// CHECKPOINTS: two (Daniel's fewer-checkpoints direction) + the start. CAST (act V, one new foe): SAND-SKIFF BANDIT (new); scorpion, cutthroat, vulture,
// sand-worm (proven). No goblins, no wood: gold dunes, sandstone outcrops, the obelisk (greybox colours; art owed: plan s4 "gold dunes, heat shimmer, obelisk").
/* the slope tile ids (src/slopes.js SLOPE - copied, not imported: slopes.js imports level.js, and level.js imports this file; tools/great-dune.mjs asserts the copy) */
export const SLOPE = { R1: 20, L1: 21, R2A: 22, R2B: 23, L2A: 24, L2B: 25 };

export const GD_SHIPS = false;
export function gdOn() {
  if (GD_SHIPS) return true;
  try { if (globalThis.BRACKEN_GD === true || globalThis.BRACKEN_GD === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gd=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.GD === '1') return true; } catch { /* no node */ }
  return false;
}
export const GD_RULE = "THE SAND IS A ROAD IF YOU'RE FAST ENOUGH. STAND STILL AND THE DUNE TAKES YOU.";
export const GD = { H: 46, base: 32, lvl0: 8, maxLvl: 18 };

/* THE STILL SAND (soft sand and the sinkholes): stand on it slower than `speed` for `warn` s and it shivers (told: a ring of grains), for `sink` s and it
   takes you - the quicksand's own hold (src/quicksand.js: jump, and keep jumping; never a kill). A sinkhole's swirl drops you through instead (the cave). */
export const STILL = { speed: 24, warn: 0.45, sink: 0.95, patchW: 3, refill: 1.6, holeOpen: 2.0 };
/* THE SUN SCARAB: a few seconds of everything (glow, faster, plough - src/shield-board.js PLOUGH - and no hurt), placed so the best runs chain them */
export const SCARAB = { t: 4.0, speedMul: 1.15, chainMax: 3.6, boardTop: 260, order: ['scarab1', 'scarab1b', 'scarab2', 'scarab3', 'scarab4'], chain: ['scarab1', 'scarab1b', 'scarab2', 'scarab3'] };
/* THE OBELISK (the brief's flagpole): the height you strike it at pays; bands from the top of the shaft (px above its foot) */
export const OBELISK = { h: 12, bands: [[150, 50, 'THE CAPSTONE'], [110, 25, 'HIGH'], [64, 10, 'MID'], [0, 3, 'LOW']] };
export function obeliskBonus(heightPx) { for (const [at, coins, name] of OBELISK.bands) if (heightPx >= at) return { coins, name }; return { coins: 0, name: '' }; }
/* MEDAL TIMES (s) - an estimate off the board sim's fast line (tools/great-dune.mjs --pace); the tune lane times a real run */
export const GD_MEDALS = [120, 170, 240];

/* THE GROUND, as pieces (the Sunken Caravan's draft grammar): F flat, SS soft sand (a flat that takes what stands still), SK a sinkhole swirl (a flat with a
   cave under it), QS a quicksand pit (a one-row pit, the hold on its surface), R1/L1 steep up/down a row, R2/L2 gentle, Cn a cliff (the ground drops n rows); '#name' a section, '@name' a mark */
const P = s => s.trim().split(/\s+/).flatMap(t => { const m = t.match(/^([A-Z0-9]+)x(\d+)$/); return m ? Array(+m[2]).fill(m[1]) : [t]; });
export const GD_PIECES = [
  ...P(`#street @start Fx8 @still SSx10 Fx3 @slide0 R2 Fx2 L2 Fx5`),
  ...P(`#teach @boardsign Fx3 R1x6 Fx2 @crest1 L1x6 Fx2 @scorp1 Fx4 @qs1 QSx3 Fx2 R1x3 Fx1 L1x4 Fx3 @soft1 SSx6 Fx3`),
  ...P(`#sea R1x3 Fx2 R1x3 Fx2 @crest2 L1x6 @qs2 QSx4 Fx2 R1x3 Fx1 L1x3 Fx3 @skiff1 Fx20 @sink1 SKx2 Fx14 R2x2 Fx3 L2x2 Fx2 @soft2 SSx8 Fx2 R1x5 Fx2 @scarab1 L1x6 Fx2 @plough1 Fx12 @cp1 Fx8 @qs3 QSx3 Fx2 R1x2 Fx1 L1x2 Fx3`),
  ...P(`#skiffroad R1x4 Fx2 @crest3 @scarab1b L1x5 Fx2 @worm1 Fx10 @qs4 QSx4 Fx2 R1x3 Fx2 @scarab2 L1x4 Fx2 @skiff2 Fx20 @sink2 SKx2 Fx14 R2x2 Fx2 @scarab3 L1x2 Fx2 @plough2 Fx12 @qs5 QSx3 Fx2 @soft3 SSx8 Fx2 R1x4 Fx2 @crest4 L1x5 Fx2 @skiff3 Fx18 @worm2 Fx8 R1x6 Fx2 @race Fx10`),
  ...P(`#race @raceline Fx4 L1x6 Fx2 @qs6 QSx3 Fx2 R1x4 Fx2 @scarab4 L1x5 Fx8 @soft4 SSx6 Fx2 R1x3 Fx1 L1x3 Fx3 @qs7 QSx4 Fx2 R1x4 Fx2 L1x4 Fx6 @soft5 SSx5 Fx2 R1x3 Fx2 L1x3 Fx3 @qs8 QSx3 Fx2 R1x3 Fx2 @crest5 L1x4 Fx6 @kicker R1x3 @lip Fx1 C3 @gap Fx11 @obelisk Fx6 @gate Fx8`),
];

export function buildGreatDune({ T, TS }) {
  const { H, base } = GD;
  const cols = []; let lvl = GD.lvl0; const marks = {}, sections = {};
  for (const p of GD_PIECES) {
    if (p[0] === '#') { sections[p.slice(1)] = cols.length; continue; }
    if (p[0] === '@') { marks[p.slice(1)] = cols.length; continue; }
    if (p === 'F' || p === 'SS' || p === 'SK' || p === 'QS') cols.push({ lvl, t: p });
    else if (p === 'R1') { lvl++; cols.push({ lvl, t: SLOPE.R1 }); }
    else if (p === 'L1') { cols.push({ lvl, t: SLOPE.L1 }); lvl--; }
    else if (p === 'R2') { lvl++; cols.push({ lvl, t: SLOPE.R2A }, { lvl, t: SLOPE.R2B }); }
    else if (p === 'L2') { cols.push({ lvl, t: SLOPE.L2B }, { lvl, t: SLOPE.L2A }); lvl--; }
    else if (/^C[0-9]$/.test(p)) { lvl -= +p[1]; cols.push({ lvl, t: 'F' }); }   /* a CLIFF: the ground drops n rows (the kicker's lip: you fly off it) */
    else throw new Error('great-dune: piece ' + p);
    if (lvl < 0 || lvl > GD.maxLvl) throw new Error('great-dune: the ground leaves its band at column ' + cols.length + ' (lvl ' + lvl + ')');
  }
  const W = cols.length + 2, grid = new Uint8Array(W * H);
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : grid[y * W + x];
  const rockFrom = (x, y) => { for (let yy = y; yy < H; yy++) set(x, yy, T.SOLID); };
  const top = x => base - cols[Math.min(cols.length - 1, Math.max(0, x))].lvl;   /* the ground row of column x */
  const qs = [], sinkSand = [], sinkholes = [];
  const run = (arr, x, row) => { const last = arr[arr.length - 1]; if (last && last.x1 === x - 1 && last.row === row) last.x1 = x; else arr.push({ x0: x, x1: x, row }); };
  cols.forEach((c, x) => { const r = base - c.lvl;
    if (c.t === 'F' || c.t === 'SS' || c.t === 'SK') { rockFrom(x, r); if (c.t === 'SS') run(sinkSand, x, r); if (c.t === 'SK') run(sinkholes, x, r); }
    else if (c.t === 'QS') { rockFrom(x, r + 1); const last = qs[qs.length - 1]; if (last && last.x1 === x * TS && last.y === r * TS) last.x1 = (x + 1) * TS; else qs.push({ x0: x * TS, x1: (x + 1) * TS, y: r * TS }); }
    else { set(x, r, c.t); rockFrom(x, r + 1); } });
  for (let y = 0; y < H; y++) { set(0, y, get(0, y)); set(W - 2, y, T.SOLID); set(W - 1, y, T.SOLID); }
  const ents = [], ent = (t, x, y, extra = {}) => ents.push({ t, x, y, ...extra }), on = x => top(x) - 1;
  const sign = (x, text) => ent('sign', x, on(x), { text });
  const shade = [], decor = [], rockZones = [], masonry = [], facades = [];

  /* ---- SINKHOLES: each swirl sits on a 1-row crust over a short shaft into a CAVE (3 rows high), whose far end climbs out through a one-way lip in the
     sand (a ledge, then the lip: two plain jumps). The cave keeps a silver and a cache of coins. As built the crust is solid: only STANDING STILL on the
     swirl opens it (src/dune-hands.js). The lip is one-way: a runner rides over it, a hero below jumps up through it (and DOWN+JUMP drops in from above). */
  const caves = [];
  for (const s of sinkholes) {
    const r = s.row, cx0 = s.x0, cx1 = s.x0 + 15, ex = cx1 - 1;
    if (cols.slice(cx0, cx1 + 1).some(c => c.lvl !== cols[cx0].lvl || c.t === 'QS' || typeof c.t === 'number')) throw new Error('great-dune: a sinkhole cave needs 16 flat columns at ' + cx0);
    for (let x = s.x0; x <= s.x1; x++) set(x, r + 1, T.AIR);                         /* the shaft under the swirl (the crust row r stays solid) */
    for (let y = r + 2; y <= r + 4; y++) for (let x = cx0; x <= cx1; x++) set(x, y, T.AIR);   /* the cave, floor row r + 5 */
    for (let y = r; y <= r + 1; y++) for (let x = ex; x <= ex + 1; x++) set(x, y, y === r ? T.ONEWAY : T.AIR);   /* the exit: the lip (one-way) */
    set(ex - 3, r + 2, T.ONEWAY); set(ex - 2, r + 2, T.ONEWAY);                        /* the ledge under the lip */
    ent('silver', cx0 + 5, r + 4);
    for (let i = 0; i < 5; i++) ent('coin', cx0 + 7 + i, r + 4);
    caves.push({ swirl: [s.x0, s.x1], row: r, box: [cx0, r + 1, cx1, r + 4], exit: [ex, ex + 1], ledge: [ex - 3, ex - 2, r + 2] });
    rockZones.push([cx0, cx1 + 1, r + 5, r + 5]);
  }

  /* ---- THE OBELISK: a column of sandstone on a plinth past the kicker dune; strike it as high as you can. The level's gate stands past it. ---- */
  const ob = { x: marks.obelisk, foot: top(marks.obelisk), h: OBELISK.h };
  for (let y = ob.foot - ob.h; y < ob.foot; y++) set(ob.x, y, T.SOLID);
  masonry.push([ob.x, ob.x, ob.foot - ob.h, ob.foot - 1, 'obelisk']);
  ent('gate', marks.gate, on(marks.gate));
  shade.push([(ob.x - 3) * TS, (ob.x + 1) * TS, (ob.foot - ob.h) * TS, ob.foot * TS + 1]);   /* the obelisk's shadow */

  /* ---- THE BOARD ROAD: from the first big dune to the kicker's lip (the street teaches the butt-slide; the finish walks to the gate) ---- */
  const boardZones = [{ x0: sections.teach, x1: marks.gap + 4, surface: 'sand' }];

  /* ---- SHADE (the sun drains here, floored at 1 hp): the outcrops' lee and the clouds' shadows, at the coasts and the start line ---- */
  const outcrop = (x, w) => { const r = top(x) - 4; for (let i = 0; i < w; i++) set(x + i, r, T.SOLID); rockZones.push([x, x + w - 1, r, r]); facades.push([x, x, r + 1, top(x) - 1, 'ruin']); shade.push([x * TS, (x + w) * TS, r * TS, top(x) * TS + 1]); };
  outcrop(marks.start + 2, 5);           /* the street's last arch */
  outcrop(marks.skiff1 + 14, 4);         /* a rock shelf on the first skiff's flat */
  outcrop(marks.cp1 + 2, 4);             /* over checkpoint one */
  outcrop(marks.skiff2 + 14, 4);
  outcrop(marks.race + 1, 5);            /* over the start line's shrine */
  const cloud = (x0, x1) => shade.push([x0 * TS, x1 * TS, 0, (base + 1) * TS]);   /* a cloud's shadow over a stretch (static in the greybox: see the lane report) */
  cloud(marks.plough1 + 2, marks.plough1 + 10); cloud(marks.worm1, marks.worm1 + 8); cloud(marks.plough2, marks.plough2 + 8); cloud(marks.skiff3 + 2, marks.skiff3 + 9);

  /* ---- SIGNS ---- */
  sign(marks.start + 1, "THE SAND IS A ROAD IF YOU'RE FAST ENOUGH.");
  sign(marks.still + 1, 'SOFT SAND: STAND STILL AND THE DUNE TAKES YOU. JUMP, AND KEEP JUMPING.');
  sign(marks.slide0 - 2, 'HOLD DOWN ON A SLOPE: SLIDE.');
  sign(marks.boardsign + 1, 'THE BIG DUNES: HOLD DOWN - RIDE YOUR SHIELD. JUMP, AND IT STAYS UNDER YOU.');
  sign(marks.cp1 - 2, 'A SUN SCARAB: A FEW SECONDS OF EVERYTHING. THE NEXT ONE IS NEVER FAR.');
  sign(marks.race + 6, 'THE SKIFF CHIEF RACES FOR THE OBELISK. BEAT HIM THERE - OR CUT HIM DOWN.');

  /* ---- CHECKPOINTS: two (Daniel: fewer) - on the rolling sea's last coast, and at the start line ---- */
  ent('check', marks.cp1 + 4, on(marks.cp1 + 4));
  ent('check', marks.race + 3, on(marks.race + 3));

  /* ---- THE SUN SCARABS (each a few seconds of everything; the next is in reach at the board's speed) ---- */
  const scarabs = [];
  for (const k of SCARAB.order) { const x = marks[k] - 1; scarabs.push({ id: k, x, y: on(x) - 1 }); ent('gdscarab', x, on(x) - 1, { id: k }); }

  /* ---- COIN ARCS: the fast line, drawn in coins - off each crest over the basin at its foot (a jump at board speed), and gem trails on the coasts ---- */
  const arc = (x0, x1, peak) => { const n = Math.max(4, Math.round((x1 - x0) / 2)); for (let i = 0; i <= n; i++) { const k = i / n, x = Math.round(x0 + (x1 - x0) * k);
    const g = Math.min(top(x0), top(x1)), y = Math.round(g - 2 - Math.sin(Math.PI * k) * peak); if (get(x, y) === T.AIR) ent('coin', x, y); } };
  arc(marks.qs1 - 3, marks.qs1 + 5, 3); arc(marks.qs2 - 3, marks.qs2 + 6, 3); arc(marks.qs3 - 2, marks.qs3 + 5, 3); arc(marks.qs4 - 3, marks.qs4 + 6, 3);
  arc(marks.qs5 - 2, marks.qs5 + 5, 3); arc(marks.qs6 - 2, marks.qs6 + 5, 3); arc(marks.qs7 - 3, marks.qs7 + 6, 3); arc(marks.qs8 - 2, marks.qs8 + 5, 3); arc(marks.lip, marks.obelisk - 1, 5);
  for (const k of ['crest1', 'crest2', 'crest3', 'crest4', 'crest5']) for (let i = 0; i < 3; i++) ent('coin', marks[k] - 1 + i, on(marks[k]) - 2);

  /* ---- THE CAST (placed by hand: every foe stands where the board's line meets it) ---- */
  const foe = (t, x, o) => ent(t, x, t === 'vulture' ? top(x) - 7 : on(x), Object.assign({ face: -1 }, o || {}));
  foe('scorpion', marks.slide0 + 8); foe('scorpion', marks.scorp1 + 1); foe('scorpion', marks.scorp1 + 3);
  foe('scorpion', marks.soft1 + 8);
  foe('vulture', marks.qs2 + 1); foe('vulture', marks.qs2 + 3);                               /* two heads over a basin: the stomp chain */
  foe('sandskiff', marks.skiff1 + 10, { bed: [marks.skiff1 + 1, marks.skiff1 + 19] });
  foe('cutthroat', marks.soft2 - 2);
  for (let i = 0; i < 4; i++) foe(i % 2 ? 'cutthroat' : 'scorpion', marks.plough1 + 2 + i * 3);   /* the plough run after scarab one */
  foe('vulture', marks.qs3 + 1);
  foe('sandworm', marks.worm1 + 5, { bed: [marks.worm1 + 1, marks.worm1 + 9] });
  foe('vulture', marks.qs4 + 1); foe('vulture', marks.qs4 + 3);
  foe('sandskiff', marks.skiff2 + 8, { bed: [marks.skiff2 + 1, marks.skiff2 + 19] }); foe('scorpion', marks.skiff2 + 17);
  for (let i = 0; i < 4; i++) foe(i % 2 ? 'scorpion' : 'cutthroat', marks.plough2 + 1 + i * 3);
  foe('vulture', marks.qs5 + 1); foe('cutthroat', marks.soft3 + 9);
  foe('sandskiff', marks.skiff3 + 9, { bed: [marks.skiff3 + 1, marks.skiff3 + 17] });
  foe('sandworm', marks.worm2 + 4, { bed: [marks.worm2 + 1, marks.worm2 + 7] });
  /* THE SKIFF CHIEF at the start line (he waits; you cross it and he sails) */
  const chief = { x: marks.raceline + 3, startX: marks.raceline + 1, finishX: marks.obelisk };
  ent('skiffchief', chief.x, on(chief.x), { face: 1, startX: chief.startX, finishX: chief.finishX });

  /* ---- DATA MARKERS for the level tools (tools/level-quality.mjs counts gadgets from ents; main.js spawns nothing for these kinds) ---- */
  for (const s of sinkSand) ent('gdsoftsand', s.x0, s.row - 1, { x1: s.x1 });
  for (const c of caves) ent('gdsinkhole', c.swirl[0], c.row - 1);
  ent('gdobelisk', ob.x, ob.foot - 1);

  const START = { x: 3, y: on(3) };
  return {
    W, H, grid, ents, START, pools: [], falls: [], moversExtra: [], interiors: [],
    quicksand: qs, shade, decor, rockZones, masonry, facades, masonryKit: 'limestone', ledgeKit: 'desert',
    sections, marks, greatdune: true,
    dune: { sinkSand, caves, scarabs, obelisk: ob, chief, still: STILL, ground: cols.map((c, x) => top(x)).concat([top(cols.length - 1), top(cols.length - 1)]) },   /* ground: the dune's surface row per column (under any outcrop) */
    boardZones,
    duneSlides: [],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 260,
    squadBands: [{ lo: marks.raceline, hi: W - 1, spots: 0, why: 'THE RACE: the chief and his pots are the fight here, no squad on the line' }],
    unlocks: [
      { kind: 'gdsinkhole', opens: 'a sand cave (a silver, a coin cache): STAND STILL on the swirl and the sand takes you down; the lip at its far end climbs out', hud: 'THE SAND TAKES YOU DOWN' },
      { kind: 'gdscarab', opens: 'THE SUN SCARAB: a few seconds of everything (plough, faster, no hurt)', hud: 'SUN SCARAB!' },
      { kind: 'gdobelisk', opens: "THE OBELISK's bonus by height (the capstone pays most)", hud: 'THE OBELISK' },
    ],
    music: 'caravan',   /* placeholder: the Sunken Caravan's track until the art lane's own pick (REPORT-ONLY music) */
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    palette: { set: 'desert', near: 'none', dress: 'desert', noFg: true, noNear: true, haze: 'rgba(240,206,140,0.14)' },
    sun: true, caravan: true,
  };
}

/* THE LEVEL'S OWN LINT (tools/great-dune.mjs): -> [] or the problems */
export function lintGreatDune(L, T) {
  const bad = [], at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
  const checks = L.ents.filter(e => e.t === 'check');
  if (checks.length !== 2) bad.push('two checkpoints, got ' + checks.length);
  for (const c of checks) if (at(c.x, c.y) !== T.AIR || at(c.x, c.y + 1) !== T.SOLID) bad.push('checkpoint at ' + c.x + ' does not stand on rock');
  if (!L.ents.some(e => e.t === 'gate')) bad.push('no gate');
  if (L.ents.filter(e => e.t === 'skiffchief').length !== 1) bad.push('one skiff chief');
  if (L.ents.some(e => /gob/i.test(e.t + (e.cnSkin || '')))) bad.push('a goblin in the desert');
  for (const c of L.dune.caves) { if (at(c.swirl[0], c.row) !== T.SOLID) bad.push('a sinkhole crust is open as built at ' + c.swirl[0]); if (at(c.exit[0], c.row) !== T.ONEWAY) bad.push('a cave lip is not one-way at ' + c.exit[0]); }
  for (const s of L.dune.scarabs) if (at(s.x, s.y) !== T.AIR) bad.push('a scarab in rock at ' + s.x);
  /* THE SCARAB CHAIN (the brief: "placed so the best runs chain them"): along the chain each next scarab is within chainMax s of the last at the glowing board's
     top speed (topSteep x speedMul) - picked up before the glow is out on the fast line. The race's scarab stands alone. */
  const byId = Object.fromEntries(L.dune.scarabs.map(s => [s.id, s])), reach = SCARAB.chainMax * SCARAB.boardTop * SCARAB.speedMul;
  for (let i = 1; i < SCARAB.chain.length; i++) { const a = byId[SCARAB.chain[i - 1]], b = byId[SCARAB.chain[i]]; if (!a || !b) { bad.push('scarab chain: missing ' + SCARAB.chain[i]); continue; } if ((b.x - a.x) * 16 > reach) bad.push('scarabs ' + a.id + ' -> ' + b.id + ': ' + (b.x - a.x) + ' tiles, past the glow (' + Math.floor(reach / 16) + ')'); }
  return bad;
}
