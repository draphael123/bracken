// src/deep3.js - THE DEEP 3: "YOU ARE TOO LIGHT TO BE DOWN HERE." (claude/deep3, the OPUS GREYBOX, 11-06). Behind its flag; the live Deep is unchanged with it off.
// Sources: scratch/plan-water-1105.md item 7 (Drowned Tower, CURRENTS + weight, ride the bell down, WALL EEL the one new foe; THE SUNKEN CREW -> THE CURSED SAILOR),
// scratch/brief-sunkencrew.md (Daniel's own design 10-08), HANDOFF 10-16 (Daniel: a DROWNED TOWER with crushers and poison on the sides; Q1 WALL EELS told by bubbles in
// the tower walls; Q3 the old Bell as a RIDE-DOWN set piece; Q4 the order TRENCH -> TOWER -> BELL RIDE -> WRECK + ARENA). Daniel 11-06: fewer checkpoints.
//
// THE FLAG: DEEP3_SHIPS = false. OFF, src/level.js builds master's Deep exactly (tools/deep3.mjs holds its grid + ents + pools hash). ON (?deep3=1 on the page,
// globalThis.BRACKEN_DEEP3, or DEEP3=1 in a Node tool's env) the SAME ROAD SLOT ('deep', needs 'lamplit': no index, no save moves) builds DEEP 3:
//   rows   0-157  master's Deep, cell for cell: the shelf, the wreck stack, the kelp forest, the coral garden down to its last throat (and master's kelp-forest shrine)
//   rows 158-235  THE DROWNED TOWER (new). Four floors, each a CRACKED SLAB only weight breaks: carry a stone onto it (YOU ARE TOO LIGHT) and the floor gives.
//                   F1 TEACH  the stone, the slab, one WALL EEL taught by its bubbles
//                   F2 TEST   a CURRENT through the broken windows runs you at the ROT VENTS (poison on the sides); the slab sits by them
//                   F3 REMIX  a SETTLING STONE hangs over the slab: lure it down and it breaks the floor for you (the crusher is the weight)
//                   F4 EXAM   THE COLLAPSING STAIR over the ROT PIT: each cracked step gives under a heavy step; eels in the pillar, a second settling stone
//   rows 236-291  THE BELL SHAFT: the old Diving Bell hangs in the tower's well. The rot UPWELLS here: a light swimmer is thrown back up, only weight goes down - stand in
//                   the bell with your stone and she rides you down (air under her rim); WALL EELS in the shaft's walls strike at the bell as it passes
//   rows 274-291  THE CREW'S WRECK (the intro, the boss door's shrine) and THE WRECK'S GRAVE (the arena): THE SUNKEN CREW -> THE CURSED SAILOR (src/sunken-crew.js)
// Theme: drowned stone, rot green, the bell's brass, black-blue + bioluminescence (plan s4). Timber only where it IS a ship (the crew's wreck). No goblins.
// Checkpoints: master had 4; Deep 3 has 3 (master's kelp-forest shrine, the tower's foot at the bell, the wreck's door shrine before the crew).

export const DEEP3_SHIPS = false;
export function deep3On() {
  if (DEEP3_SHIPS) return true;
  try { if (globalThis.BRACKEN_DEEP3 === true || globalThis.BRACKEN_DEEP3 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]deep3=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.DEEP3 === '1') return true; } catch { /* no node */ }
  return false;
}

/* THE NUMBERS. Rows are absolute (the level's own), columns too. KEEP = the last master row kept; H = the new height */
export const D3 = {
  KEEP: 157, H: 298, TS: 16,
  tower: { x0: 10, x1: 69, top: 160, base: 234 },
  hatch: [14, 22],   /* master's coral-garden throat comes down through the tower's roof here */
  floors: [   /* each floor: its rows, its slab (the floor under it) and the slab's CRACK (cols) - the way down */
    { id: 'f1', name: 'THE BELFRY', y0: 160, y1: 175, slab: 176, crack: [52, 57] },
    { id: 'f2', name: 'THE WINDOW HALL', y0: 178, y1: 193, slab: 194, crack: [14, 19] },
    { id: 'f3', name: 'THE SETTLING ROOM', y0: 196, y1: 211, slab: 212, crack: [46, 51], stoneOnly: true },
    { id: 'f4', name: 'THE COLLAPSING STAIR', y0: 214, y1: 233, slab: 234, crack: null },
  ],
  /* F4's stair: cracked steps, west landing to the east landing over the rot pit */
  stair: { landing: [40, 53, 218], steps: [[54, 56, 220], [57, 59, 222], [60, 62, 224], [63, 65, 226]], east: [58, 69, 228] },   /* the east landing (its top row 229) with THE HATCH cut through it (the shaft's columns) */
  rotPit: [18, 57, 229, 233],
  shaft: { x0: 62, x1: 67, y0: 236, y1: 273 },
  bell: { x: 63, w: 4, y0: 229, y1: 292, speed: 52 },   /* the deck rides from flush with the east landing (in its hatch) to flush with the wreck's floor (rows, its top) */
  cavern: { x0: 40, x1: 156, y0: 274, y1: 291, floor: 292 },
  arena: { x0: 104, x1: 152, wallL: 103, wallR: 153, trigger: 106 },
  wreck: { deck: [70, 96, 286] },
  checks: [[56, 291, 'wreck'], [40, 218, 'stair']],   /* the boss door's shrine on the wreck's floor; the tower's foot (F4's west landing, under F3's crack) */
  /* the timings (s) */
  slab: { stand: 0.8, crumble: 0.35 },   /* a heavy step on a crack: it creaks for `stand`, then gives in `crumble` */
  step: { stand: 0.45, crumble: 0.25 },
  settle: { tell: 0.85, fall: 520, dmg: 14, w: 3, h: 2, sense: 2 },   /* grit runs for `tell` s, then it falls at `fall` px/s; `sense` cols either side wakes it */
  rot: { dmg: 4, every: 0.5, tell: 0.8, on: 1.6, off: 2.6, reach: 3 },   /* a vent: told `tell` s (bubbling green), breathes `on` s out `reach` tiles, rests `off`; the pit: always on */
};

/* THE SUNKEN CREW's stage, in the arena's own pixels (src/sunken-crew.js geom reads it) */
export function crewStage(TS = 16) {
  const A = D3.arena, C = D3.cavern;
  return { x0: A.x0 * TS, x1: A.x1 * TS, floor: C.floor * TS, top: C.y0 * TS, trigger: A.trigger * TS };
}

/* BUILD: master's built Deep (R, from crabTrench) in, Deep 3 out. Everything master keeps above row KEEP is left exactly as it is; everything below is dropped and
   laid again here. Pure on R (no main.js), so a Node tool builds both. */
export function buildDeep3(R, T, TS = 16) {
  const W = R.W, H = D3.H, K = D3.KEEP;
  const grid = new Uint8Array(W * H); grid.fill(T.SOLID);
  for (let y = 0; y <= K; y++) for (let x = 0; x < W; x++) grid[y * W + x] = R.grid[y * R.W + x];
  const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = t; };
  const cut = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const fill = (x0, x1, y0, y1, t = T.SOLID) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  const above = (y, y0 = 0) => y <= K;   /* a master thing at row y is kept */
  const keepPt = p => above(p.y);
  const keepRect = r => r[3] <= K;   /* [x0,x1,y0,y1] */
  const keepZonePx = z => z.y1 <= (K + 1) * TS;
  const ents = R.ents.filter(keepPt);   /* master's ents above the cut, every raw shrine too (src/checkpoint-thin.js CHECK_DROP thins them exactly as on master: the kelp forest's stays); its ship / cold-road shrines go with the ship */
  const ent = (t, x, y, o = {}) => ents.push({ t, x, y, ...o });
  const D = R.deep, out = {};
  for (const k of ['vents', 'clams', 'bulbs', 'wrecks', 'jellies', 'kelp', 'fish', 'props', 'banners']) out[k] = (D[k] || []).filter(keepPt);
  for (const k of ['pockets', 'masonry']) out[k] = (D[k] || []).filter(keepRect);
  out.noDress = [[0, W - 1, K + 1, H - 1]];   /* the reef's dressing stays off the tower, the shaft and the wreck */
  out.zones = (D.zones || []).filter(z => z.y1 <= K);
  out.currents = (D.currents || []).filter(z => z.y1 <= K);
  out.shafts = (D.shafts || []).filter(s => s.y1 <= K);
  out.rime = []; out.icicles = []; out.gates = [];
  const airRooms = (R.airRooms || []).filter(keepRect), interiors = (R.interiors || []).filter(keepRect);
  const pocket = (x0, x1, y0, y1) => { airRooms.push([x0, x1, y0, y1]); out.pockets.push([x0, x1, y0, y1]); };
  const vent = (x, y, h) => out.vents.push({ x, y, h, hot: false, drain: false });
  const clam = (x, y) => out.clams.push({ x, y });
  const coins = (x0, x1, y) => { for (let x = x0; x <= x1; x += 2) ent('coin', x, y); };

  // ---- THE DROWNED TOWER ----
  const Tw = D3.tower;
  cut(Tw.x0, Tw.x1, Tw.top, Tw.base - 1);
  fill(Tw.x0 - 2, Tw.x1 + 2, K + 1, Tw.top - 1); cut(D3.hatch[0], D3.hatch[1], K + 1, Tw.top - 1);   /* the roof, and master's throat on down through it */
  const slabs = [];
  for (const f of D3.floors) { fill(Tw.x0, Tw.x1, f.slab, f.slab + 1);
    if (f.crack) { slabs.push({ id: f.id, x0: f.crack[0], x1: f.crack[1], y0: f.slab, y1: f.slab + 1, kind: 'slab', stoneOnly: !!f.stoneOnly }); } }
  /* (the CRACKS are cut in the grid as built - AIR - and the hands lay them back as cracked stone at load: the reach fill and every Node tool walk the floors as
     broken, the way the buried city's sand rooms are drained in its grid. A level with no hands has open floors, never a sealed tower) */
  for (const s of slabs) cut(s.x0, s.x1, s.y0, s.y1);
  /* A HEAVY HERO CANNOT CLIMB (main.js: JUMP with a stone in your hands lets it go). So every floor a stone is carried over is FLAT or steps DOWN the way you
     walk it, and the eels a walker meets live in CURTAIN WALLS that hang from the ceiling to two rows over the floor: you pass under them, and the eel strikes DOWN */
  const curtain = (x0, x1, y0, yb) => fill(x0, x1, y0, yb);   /* yb: its foot (two clear rows under it to the floor's standing row) */
  // F1 THE BELFRY (teach): in by the roof hatch, the stone on its rack under it, one curtain with the first eel in its foot, the crack at the far end
  const f1 = D3.floors[0], f2 = D3.floors[1], f3 = D3.floors[2], f4 = D3.floors[3];
  curtain(33, 37, f1.y0, f1.y1 - 2); ent('walleel', 35, f1.y1 - 1, { dir: 'down', wall: f1.y1 - 2 });
  ent('ballast', 18, f1.y1, { kind: 'stone', rack: true });
  ent('sign', 13, f1.y1, { text: 'THE DROWNED TOWER. ITS OLD FLOORS ARE CRACKED AND YOU ARE TOO LIGHT TO BREAK THEM. CARRY A STONE ONTO A CRACK AND STAND.' });
  ent('sign', 29, f1.y1, { text: 'BUBBLES OUT OF A WALL: AN EEL LIVES IN IT. LET IT STRIKE AND MISS, THEN CUT IT BEFORE IT PULLS BACK.' });
  ent('drownedknight', 46, f1.y1, { face: -1 });
  vent(26, f1.y1, 7); vent(62, f1.y1, 6); pocket(40, 48, f1.y0, f1.y0 + 1);
  coins(40, 50, f1.y1 - 1); clam(66, f1.y1);
  // F2 THE WINDOW HALL (test): the windows in the east wall let THE SEA in - a current runs the floor WEST at the rot vents in the west wall, and the crack is by them:
  // stand on it braced (a shield holds you at 0.45) while the rot breathes
  for (const [y0, y1] of [[f2.y0 + 3, f2.y0 + 6], [f2.y0 + 9, f2.y0 + 12]]) cut(Tw.x1 + 1, Tw.x1 + 2, y0, y1);   /* broken windows (into the rock: dark) */
  out.currents.push({ x0: 21, x1: Tw.x1, y0: f2.y1 - 6, y1: f2.y1, fx: -38, fy: 0, kind: 'cold', d3: 'window' });   /* a DRIFT (38 px/s: under a heavy walk's 54 - beaten, slowly) */
  curtain(43, 46, f2.y0, f2.y1 - 2); ent('walleel', 44, f2.y1 - 1, { dir: 'down', wall: f2.y1 - 2 });
  curtain(26, 28, f2.y0, f2.y1 - 2); ent('walleel', 27, f2.y1 - 1, { dir: 'down', wall: f2.y1 - 2 });
  ent('angler', 36, f2.y0 + 5);
  ent('ballast', 64, f2.y1, { kind: 'stone', rack: true });   /* a spare, under F1's crack: a hero who lost his on the way down */
  vent(56, f2.y1, 7); vent(35, f2.y1, 6);   /* (a breath between the curtains: a heavy walk is slow) */ pocket(52, 60, f2.y0, f2.y0 + 1);
  coins(32, 40, f2.y1 - 2);
  coins(Tw.x0 + 1, Tw.x0 + 5, f2.y0 + 1);   /* (off-route) up in the window hall's west corner, over the rot: a light swimmer's purse. (NO NEW SILVER: the game counts three and a silver's place in the list is its save bit - src/level.js silverTrim, src/relics.js VAULT_SILVER - so master's three stay exactly where they are) */
  // F3 THE SETTLING ROOM (remix): THIS crack is too thick for a hero and his stone - a SETTLING STONE hangs over it. Stand under it and it falls (told):
  // step out, and it breaks the floor for you. The crusher is the weight
  curtain(29, 31, f3.y0, f3.y1 - 2); ent('walleel', 30, f3.y1 - 1, { dir: 'down', wall: f3.y1 - 2 });
  ent('lamprey', 38, f3.y0 + 6); ent('lamprey', 58, f3.y0 + 4);
  ent('drownedknight', 22, f3.y1, { face: 1 });
  vent(20, f3.y1, 7); vent(38, f3.y1, 6); pocket(14, 22, f3.y0, f3.y0 + 1); clam(60, f3.y1);
  ent('sign', 40, f3.y1, { text: 'THE TOWER SETTLES. THIS FLOOR IS TOO THICK FOR YOU: A STONE THAT FALLS WEIGHS MORE. STAND UNDER IT, THEN STEP AWAY.' });
  coins(52, 60, f3.y1 - 1);
  // F4 THE COLLAPSING STAIR (exam): F3's crack drops you on the west landing (the tower's foot: its shrine, two stones on racks); the stair runs east and down
  // over the ROT PIT to the east landing, the hatch and THE BELL. Each step gives under a heavy step (and settles back a while after); an eel in the curtain
  // over the landing's lip; a settling stone over the third step; the rot vent in the east wall
  const St = D3.stair, steps = [];
  fill(St.landing[0], St.landing[1], St.landing[2] + 1, St.landing[2] + 1);   /* the landing under F3's crack */
  fill(St.landing[0] + 1, St.landing[0] + 2, St.landing[2] + 2, f4.slab - 1);   /* on a pier down to the floor (nothing floats), through the rot pit */
  for (const [a, b, y] of St.steps) steps.push({ id: 'step' + steps.length, x0: a, x1: b, y0: y + 1, y1: y + 1, kind: 'step' });
  for (const s of steps) cut(s.x0, s.x1, s.y0, s.y1);   /* (laid back by the hands, as the cracks are) */
  fill(St.east[0], St.east[1], St.east[2] + 1, f4.slab - 1);   /* the east landing: solid down to the floor, the hatch's lip */
  curtain(51, 54, f4.y0, St.landing[2] - 2); ent('walleel', 53, St.landing[2] - 1, { dir: 'down', wall: St.landing[2] - 2 });
  ent('ballast', 42, St.landing[2], { kind: 'stone', rack: true }); ent('ballast', 44, St.landing[2], { kind: 'stone', rack: true });   /* the stair's stones: the bell needs weight too */
  ent('sign', 52, St.landing[2], { text: 'THE STAIR GIVES UNDER A HEAVY STEP. KEEP MOVING. THE PIT BELOW IS ROT.' });
  ent('jelly', 28, f4.y0 + 8); ent('urchin', 34, f4.slab - 1);
  vent(66, St.east[2], 5); vent(40, St.landing[2], 4); pocket(Tw.x0, 18, f4.y0, f4.y0 + 1);
  coins(20, 26, D3.rotPit[3]); ent('deco', 23, D3.rotPit[3], { kind: 'seaChest' });   /* (off-route) on the pit's floor: pay the rot for it */
  ent('silver', 24, D3.rotPit[3]);   /* THE TRIBUTE SHIP's SILVER's STAND-IN: master's ship (dropped) carried the fourth raw silver; src/level.js silverTrim keeps the deepest, and
     src/relics.js VAULT_SILVER moves it to the coral garden's vault (20,145) - so this one ends there too, and the level keeps master's three silvers in master's order (save bits) */
  coins(55, 66, St.steps[0][2] - 2);
  // THE ROT: the vents in the walls (F2's west wall, F3's east, F4's both) and F4's pit
  const rot = [
    { id: 'r0', kind: 'vent', x: Tw.x1, dir: -1, y0: f1.y0 + 7, y1: f1.y0 + 11, ph: 0.4 },   /* F1: the first rot, shown off the route (the east wall, over the crack's far side) */
    { id: 'r1', kind: 'vent', x: Tw.x0, dir: 1, y0: f2.y1 - 4, y1: f2.y1, ph: 0 }, { id: 'r2', kind: 'vent', x: Tw.x0, dir: 1, y0: f2.y0 + 4, y1: f2.y0 + 8, ph: 1.3 },
    { id: 'r3', kind: 'vent', x: Tw.x1, dir: -1, y0: f3.y1 - 4, y1: f3.y1, ph: 0.6 },
    { id: 'r4', kind: 'vent', x: Tw.x1, dir: -1, y0: f4.y0 + 4, y1: f4.y0 + 8, ph: 2.0 },
    { id: 'pit', kind: 'pit', x0: D3.rotPit[0], x1: D3.rotPit[1], y0: D3.rotPit[2], y1: D3.rotPit[3] },
  ];
  for (const v of rot) if (v.kind === 'vent') for (let y = v.y0; y <= v.y1; y++) set(v.x - v.dir, y, T.AIR);   /* the vent's mouth: a hole in the wall (air in the grid, the rot comes out of it) */
  // THE SETTLING STONES (crushers): a block on a chain under the ceiling; the hands drop it (told) and lay it where it lands
  const settle = [
    { id: 's3', x0: 47, y0: f3.y0, w: D3.settle.w, h: D3.settle.h, onto: 'f3' },   /* F3: over the crack (46-51): it breaks it */
    { id: 's4', x0: 60, y0: f4.y0, w: D3.settle.w, h: D3.settle.h, onto: 'step2' },   /* F4: over the third step */
  ];
  out.zones.push({ name: 'THE DROWNED TOWER', x0: Tw.x0, x1: Tw.x1, y0: Tw.top, y1: Tw.base - 1, col: [120, 170, 120], a: 0.08 });

  // ---- THE BELL SHAFT ----
  const Sh = D3.shaft, B = D3.bell;
  cut(Sh.x0, Sh.x1, B.y0, Sh.y1);   /* the hatch through the east landing and the tower's base, and the well under it */
  out.currents.push({ x0: Sh.x0, x1: Sh.x1, y0: Sh.y0, y1: Sh.y1, fx: 0, fy: -150, kind: 'hot', d3: 'upwell' });   /* THE ROT UPWELLS: 'hot' = only weight sinks through it (main.js updateDeep) */
  for (const [x, y, face] of [[Sh.x0, 244, 1], [Sh.x1, 251, -1], [Sh.x0, 258, 1], [Sh.x1, 265, -1]]) ent('walleel', x, y, { face, wall: x - face, shaft: true });
  ent('sign', 58, St.east[2], { text: 'THE OLD BELL. THE ROT RISES UP HER WELL AND THROWS THE LIGHT BACK UP. STAND IN HER WITH A STONE AND SHE TAKES YOU DOWN.' });
  cut(Sh.x0 - 3, Sh.x0 - 1, 249, 253); pocket(Sh.x0 - 3, Sh.x0 - 1, 249, 250);   /* an old hatch in the well's west wall with a breath caught in it (the bell is the air for a rider; this is for a swimmer who missed her) */
  vent(64, D3.cavern.y1, 8);   /* and bubbles where she sets down */
  out.zones.push({ name: 'THE BELL SHAFT', x0: Sh.x0, x1: Sh.x1, y0: Sh.y0, y1: Sh.y1, col: [140, 190, 150], a: 0.1 });
  const moversExtra = [{ kind: 'lift', d3bell: true, x: B.x * TS, y: B.y0 * TS, y0: B.y0 * TS, y1: B.y1 * TS, w: B.w * TS, h: 8, speed: B.speed }];

  // ---- THE CREW'S WRECK and THE WRECK'S GRAVE ----
  const C = D3.cavern, A = D3.arena;
  cut(C.x0, C.x1, C.y0, C.y1);
  const [dx0, dx1, dy] = D3.wreck.deck;
  for (let x = dx0; x <= dx1; x++) { set(x, dy, T.PLANK); fill(x, x, dy + 1, C.y1); }   /* her deck on her keel, lying on the floor (a ship: the one timber down here) */
  fill(dx0 - 1, dx0 - 1, dy - 5, dy);   /* her stern post */
  for (const [a, b, y] of [[44, 52, 287], [97, 99, 289]]) fill(a, b, y, C.y1);   /* the seabed's rubble */
  ent('sign', 60, C.y1, { text: 'THE WRECK OF THE SALT WIDOW. FOUR OF HER CREW NEVER LEFT HER. THEY KEEP HER STILL.' });
  ent('sign', A.trigger - 4, C.y1, { text: 'A SOUL LANTERN OVER A FALLEN SAILOR BURNS TEN SECONDS. FELL THE REST BEFORE IT GOES OUT, OR HIS MATES RAISE HIM.' });
  ent('crab', 82, dy - 1, { face: -1 }); ent('lamprey', 90, 280);
  coins(72, 94, dy - 1);
  out.currents.push({ x0: C.x0 + 4, x1: A.wallL - 2, y0: C.y1 - 6, y1: C.y1, fx: 30, fy: 0, kind: 'cold', d3: 'coldroad' });   /* the cold road runs on along the seabed, east to her grave (master's cold current, the wreck's floor) */
  for (const x of [112, 128, 144]) vent(x, C.y1, 9);   /* the arena's air: three vents (the Bell Grave had three) */
  vent(54, C.y1, 8); clam(98, dy - 1);
  out.wrecks.push({ x: 84, y: dy - 1 });   /* AIR IN HER CROWN: her cabin still holds a breath (src/main.js airBoxes: a wreck is always air) - the wreck crossing is one leg, not a drowning */
  out.zones.push({ name: "THE CREW'S WRECK", x0: C.x0, x1: A.wallL, y0: C.y0, y1: C.y1, col: [120, 160, 190], a: 0.08 });
  out.zones.push({ name: "THE WRECK'S GRAVE", x0: A.x0, x1: C.x1, y0: C.y0, y1: C.y1, col: [130, 200, 190], a: 0.12 });
  ent('sunkencrew', 128, C.y1, { face: -1 });
  ent('gate', C.x1 - 1, C.y1);
  for (const [x, y, why] of D3.checks) ent('check', x, y, { d3: why });

  // ---- the level's lists ----
  const pools = [];
  for (const p of R.pools || []) { const b = p.bottom ?? p.y + p.depth; if (p.y >= (K + 1) * TS) continue;
    if (b <= (K + 1) * TS) { pools.push({ ...p }); continue; }
    pools.push({ ...p, bottom: H * TS - 4 * TS, depth: H * TS - 4 * TS - p.y }); }   /* the trench's sea now runs down the tower and the well */
  pools.push({ x0: (C.x0 + 20) * TS, x1: (C.x1 + 1) * TS, y: C.y0 * TS, swim: true, bottom: (C.floor) * TS, depth: (C.floor - C.y0) * TS, clear: true, wash: 0.34, grad: false });   /* and the cavern east of it (overlapping two columns, as master's two did) */
  const darkZones = (R.darkZones || []).filter(keepZonePx);
  darkZones.push({ x0: Tw.x0 * TS, x1: (Tw.x1 + 1) * TS, y0: Tw.top * TS, y1: Tw.base * TS, dark: 0.2 }, { x0: Sh.x0 * TS, x1: (Sh.x1 + 1) * TS, y0: Tw.base * TS, y1: C.y0 * TS, dark: 0.26 },
    { x0: C.x0 * TS, x1: (C.x1 + 1) * TS, y0: C.y0 * TS, y1: C.floor * TS, dark: 0.2 });
  const L = { ...R, H, grid, ents, pools, airRooms, interiors, darkZones, deep: out, moversExtra, facades: [],
    hullZones: (R.hullZones || []).filter(keepRect), cabins: [], routeSupports: (R.routeSupports || []).filter(s => s.bottom <= K),
    tall: { ...(R.tall || {}), bottom: (H - 5) * TS },
    arena: { x0: A.x0 * TS, x1: A.x1 * TS, floor: C.floor * TS, trigger: A.trigger * TS, wallL: A.wallL, wallR: A.wallR, boss: 'sunkencrew', music: 'bellcrab', tint: '#143a34', tintA: 0.12, fx: 'motes', y0: C.y0 * TS, y1: C.floor * TS },
    deep3: { slabs, steps, rot, settle, bell: { ...B }, shaft: { ...Sh }, floors: D3.floors.map(f => ({ ...f })) },
    /* the machines as tools/level-quality.mjs counts them (col / row: a tall level's place is its row) - read by no game code */
    d3Cracks: slabs.concat(steps).map(c => ({ col: c.x0, row: c.y0, id: c.id })), d3Stones: settle.map(c => ({ col: c.x0, row: c.y0, id: c.id })),
    d3Rot: rot.map(r => ({ col: r.kind === 'pit' ? r.x0 : r.x, row: r.y0, id: r.id })), d3Currents: out.currents.filter(c => c.d3).map(c => ({ col: c.x0, row: c.y0, id: c.d3 })) };
  /* the floors' names on the deep's place line (L.deep.zones) */
  for (const f of D3.floors) out.zones.push({ name: f.name, x0: Tw.x0, x1: Tw.x1, y0: f.y0, y1: f.slab + 1, col: [120, 170, 120], a: 0.05 });
  return L;
}

/* THE LINT: every crack under a floor, every step over the pit, every settling stone over the thing it is for, the bell in its well, the checkpoints on footing, the
   arena's floor flat - returns a list of faults (empty = clean) */
export function lintDeep3(L, T) {
  const f = [], W = L.W, at = (x, y) => L.grid[y * W + x], D = L.deep3;
  if (!D) return ['no L.deep3'];
  for (const s of D.slabs) { for (let x = s.x0; x <= s.x1; x++) if (at(x, s.y0) !== T.AIR) f.push('slab ' + s.id + ' not cut at ' + x);
    if (at(s.x0 - 1, s.y0) === T.AIR || at(s.x1 + 1, s.y0) === T.AIR) f.push('slab ' + s.id + ' has no floor either side'); }
  for (const s of D.steps) for (let x = s.x0; x <= s.x1; x++) { if (at(x, s.y0) !== T.AIR) f.push(s.id + ' not cut'); if (at(x, s.y0 - 1) !== T.AIR) f.push(s.id + ' has no headroom at ' + x); }
  for (const c of D.settle) { const tgt = c.onto.startsWith('step') ? D.steps.find(s => s.id === c.onto) : D.slabs.find(s => s.id === c.onto);
    if (!tgt) { f.push('settle ' + c.id + ': no ' + c.onto); continue; }
    if (c.x0 + c.w - 1 < tgt.x0 || c.x0 > tgt.x1) f.push('settle ' + c.id + ' is not over ' + c.onto);
    for (let x = c.x0; x < c.x0 + c.w; x++) for (let y = c.y0; y < c.y0 + c.h; y++) if (at(x, y) !== T.AIR) f.push('settle ' + c.id + ' sits in rock at ' + x + ',' + y); }
  const B = D.bell; for (let x = B.x; x < B.x + B.w; x++) for (let y = B.y0; y < B.y1; y++) if (at(x, y) !== T.AIR) { f.push('the bell meets rock at ' + x + ',' + y); y = B.y1; }
  for (const e of L.ents.filter(e => e.t === 'check' && e.d3)) if (at(e.x, e.y + 1) === T.AIR || at(e.x, e.y) !== T.AIR) f.push('checkpoint ' + e.d3 + ' not on footing');
  for (let x = Math.round(L.arena.x0 / 16); x <= Math.round(L.arena.x1 / 16); x++) if (at(x, L.arena.floor / 16) === T.AIR || at(x, L.arena.floor / 16 - 1) !== T.AIR) f.push('arena floor uneven at ' + x);
  for (const e of L.ents.filter(e => e.t === 'walleel')) { if ((e.dir === 'down' ? at(e.x, e.wall) : at(e.wall, e.y)) === T.AIR) f.push('walleel at ' + e.x + ',' + e.y + ' has no wall at ' + e.wall); if (at(e.x, e.y) !== T.AIR) f.push('walleel at ' + e.x + ',' + e.y + ' is in rock'); }
  return f;
}
