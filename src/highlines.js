// src/highlines.js - THE HIGH LINES (claude/highlines1, the OPUS GREYBOX, 11-05). Plan: scratch/lane-reports/zipclimb-plan.md as amended by Daniel 11-05 15:27:
// THE SKY ROAD -> THE HIGH LINES -> THE ORE ROAD; "mostly on the lines, mostly up"; ONE rule (the lines) varied EVERY band; the backdrop is the mountain's CAVE
// MOUTH you climb toward the whole way (it grows as you rise) and it leads into the Ore Road; hand-winch / counterweight up-lines; wind in its own sections.
// The engine is THE LINE KIT (src/line-kit.js, docs/linekit.md); the new foe is THE HOOKJACK (src/hookjack.js); src/highlines-hands.js wires them to main.js.
// DEV ONLY: on no road (src/level.js: hidden, no `needs`) - reached with ?level=highlines - until its art lane and proof land (art before live).
//
// THE RULE (L.rule): HANG ON AND STRIKE: EVERY BLOW HAULS A WINCH LINE UP AND THE RATCHET HOLDS YOU. MISS A LINE AND YOU DROP A LEVEL.
// BANDS, bottom to top (rows: smaller is higher; the level is 80 x 240 tiles, a shaft between two cliff walls):
//   1 FOOTHOLD        232-206  TEACH: grip winches over cargo nets (a miss costs a climb, no hp). CHECKPOINT 1 at the line-yard
//   2 JUNCTIONS       206-188  POINTS (hold UP: the side glide to SILVER ONE), a fast GLIDE down, a KICK line to line across a gap, a winch up
//   3 THE WIND GORGE  188-164  told crosswind boxes (glides only), LEE ROCKS at both walls, winches only in the lee; gale harpies beat at riders
//   4 THE AMBUSH      171-133  HOOKJACKS: one rides at you (taught over the gorge glide), a CUTTER saws your line from its station (a level down),
//                              one more on the short line to the hut; points onto a side winch to SILVER TWO
//   5 THE LEE HUT     134-118  ON FOOT, no lines: CHECKPOINT 2, then the crevice climb (rock lips, told rockfall), crag rams on the shelf
//   6 THE COUNTERWEIGHT 118-102  stand in the cage, strike the hopper: the stone outweighs the party and the cage goes up (co-op: ride weight A down)
//   7 THE GONDOLA     102-  85  SET PIECE: board the cab, it hauls up, CREAKS (told), SNAPS, falls and hooks onto the glide below, docks at the far station
//   8 THE EXAM        104-  57  winch + exam wind + Hookjacks, NO NETS (a miss falls bands): the cutter's race (E1), two riders on E2 in the gale, one on E3
//   THE CAVE MOUTH     58-  44  CHECKPOINT 3 (before the boss, always), a short on-foot climb, and THE HEAD STATION: SKYHOOK's arena (claude/skyhook)
//                              (the boss is a LATER lane) and the way on into the Ore Road (the gate)
// Landings are ONE-WAY decks (iron gantries / rock lips, art owed) so the node sweep (tools/highlines.mjs) and the page agree: nothing bonks a rider from below.
import { endSupports } from './line-kit.js';   /* (claude/hlfix) what holds each rope end (a drawn mast, hanger or wall bracket) */
export const HL = { W: 80, H: 240 };
/* (claude/hlswitch, 11-12) THE SWITCH RULE, behind HL_SWITCH (default OFF: with it off every byte of this level is as before). ON: ONE BLOW starts a line and carries it the whole way (the kit's latch,
   src/line-kit.js rule 'switch'), and LEVERS - never hold-UP - set the points (Daniel 11-12: levers only). A test door: globalThis.__HLSW = true (node) or ?hlsw=1 (page). */
const hlswForced = () => { const g = typeof globalThis !== 'undefined' ? globalThis : null; if (!g) return false; if (g.__HLSW === true) return true; return !!g.location && /[?&]hlsw=1(&|#|$)/.test(String(g.location.search || '')); };
export const HL_SWITCH_DEFAULT = false;   /* THE ONE LINE TO FLIP (after Daniel plays it and slice A's art + browser proofs land) */
export const HL_SWITCH = HL_SWITCH_DEFAULT || hlswForced();
const RULE_OLD = 'HANG ON AND STRIKE: EVERY BLOW HAULS A WINCH LINE UP AND THE RATCHET HOLDS YOU. MISS A LINE AND YOU DROP A LEVEL.';
export const RULE_SW = 'STRIKE ONCE AND THE LINE CARRIES YOU UP. THE LEVERS SET THE POINTS: READ THE LAMPS. MISS A LINE AND YOU DROP A LEVEL.';
export const RULE = HL_SWITCH ? RULE_SW : RULE_OLD;
export const SECTIONS = [['FOOTHOLD', 206, 240], ['JUNCTIONS', 188, 206], ['THE WIND GORGE', 164, 188], ['THE AMBUSH', 133, 171], ['THE LEE HUT', 118, 134], ['THE COUNTERWEIGHT', 102, 118], ['THE GONDOLA', 85, 102], ['THE EXAM', 57, 104], ['THE CAVE MOUTH', 30, 58]];   /* [name, rowTop, rowBottom] - a TALL level's sections are row bands */

/* THE LEVEL'S DATA (tiles): what the line kit, the Hookjack and the node proof read. Pure data: tools/highlines.mjs imports it without a painter. */
export const HL_DATA = {
  id: 'highlines', w: HL.W, h: HL.H,
  landings: [
    [1, 232, 14, 233],   // 0  L0  THE LINE-YARD (checkpoint 1)
    [30, 220, 40, 221],  // 1  L1
    [58, 208, 72, 209],  // 2  L2
    [38, 195, 46, 196],  // 3  L3  the junction station
    [47, 204, 52, 205],  // 4  Ls2 SILVER ONE's ledge (the points' side glide)
    [1, 202, 8, 203],    // 5  L4  the glides' west station
    [24, 189, 34, 190],  // 6  L5
    [1, 177, 12, 178],   // 7  L6  the gorge's west lee rock
    [60, 184, 78, 185],  // 8  L7  the gorge's east lee rock
    [59, 165, 66, 166],  // 9  L8  the east lee, high (checkpoint 2)
    [1, 171, 11, 172],   // 10 L9  the west lee, high (the ambush begins)
    [19, 156, 30, 157],  // 11 L10
    [24, 143, 31, 144],  // 12 Ls4 SILVER TWO's ledge (the side winch)
    [54, 142, 62, 143],  // 13 L11 the cutter's station
    [68, 134, 78, 135],  // 14 THE LEE HUT (no shrine now: claude/hllive moved checkpoint 2 to L8)
    [62, 132, 66, 133],  // 15 the crevice: rock lips
    [68, 130, 72, 131],  // 16
    [62, 128, 66, 129],  // 17
    [56, 126, 60, 127],  // 18
    [62, 124, 66, 125],  // 19
    [68, 122, 73, 123],  // 20
    [62, 120, 66, 121],  // 21
    [13, 118, 61, 119],  // 22 THE SHELF (the crevice's head; the weight house's floor)
    [13, 102, 25, 103],  // 23 THE GONDOLA STATION (the cage's top stop)
    [1, 102, 2, 103],    // 24 LA1 beside weight A at the top
    [1, 118, 2, 119],    // 25 LA2 beside weight A at the bottom
    [63, 104, 72, 105],  // 26 THE DOCK (the gondola's far station)
    [73, 92, 78, 93],    // 27 L16 the exam's east lee
    [36, 74, 46, 75],    // 28 L17 the exam's west lee
    [1, 58, 15, 59],     // 29 THE CAVE MOUTH LEDGE (checkpoint 3)
    [8, 56, 11, 57],     // 30 the last rock steps
    [3, 54, 6, 55],      // 31
    [8, 52, 11, 53],     // 32
    [3, 50, 6, 51],      // 33
    [1, 48, 40, 49],     // 34 THE CAVE MOUTH LANDING (SKYHOOK's head station floor, the exit)
    [8, 40, 12, 41],     // 35 THE WEST GALLERY (claude/skyhook: SKYHOOK's perch; his high line's low end, the west winch's top)
    [35, 40, 39, 41],    // 36 THE EAST GALLERY (claude/skyhook: his perch by the gate; the high line's high end, the east winch's top)
  ],
  nets: [[15, 234, 33, 235], [41, 222, 60, 223]],   /* the cargo nets under band 1 (rope nets: art owed). The exam has none */
  checkpoints: [{ x: 4, y: 232 }, { x: 62, y: 165 }, { x: 5, y: 58 }],   /* (claude/hllive) the middle one moved from THE LEE HUT (route 230: 230 tiles of walking from the start broke tools/checkpoint-gaps.mjs, max 200) to L8, the east lee, high (route 160: 160 / 176 either side, 19 tiles before the ambush begins at L9) */
  secrets: [[49, 203], [27, 142]],
  exit: [30, 44, 40, 48],
  /* (claude/skyhook) THE HEAD STATION: SKYHOOK's fight (src/skyhook.js). The stub (40 x 18) is shrunk to 32 x 18 inside a rock arch (cols 7 and 40 hang from the roof to row 41;
     the walls close rows 42-47 under them). Tiles: perches where he stands, the two TENSION LEVERS on the floor (one under each gallery), his high line, the winch line
     that tops out at each gallery (he cuts it in phase two), the swing rope's anchor row over the middle */
  arena: { x0: 8, x1: 39, floor: 48, boss: 'skyhook', wallL: 7, wallR: 40, trigger: 11, perchW: [10, 40], perchE: [37, 40], levers: [['W', 10], ['E', 36]], line: 'HL', winch: { W: 'SW', E: 'SE' }, swingY: 31, music: 'masthead' },
  lineKit: {
    strictEnds: true,   /* (claude/hlfix) lintLines reds an end with no mast / hanger / wall bracket (src/line-kit.js endSupports); the declared anchors below no longer count on their own */
    anchors: [[61, 199.536], [43, 151.6], [37, 97.5], [59, 85], [26, 198], [21, 198.5]],   /* (claude/hlfix) the six ends that had NO landing under them: each is now held by a drawn mast, see endSupports (S2 a: mast to L2; F1 b, F2 a: hanger from L5; S4 a: tall guyed pylon to L3; GD b: mast + foot beam to the dock; LO a: mast to the shelf) */
    lines: [
      /* 1 FOOTHOLD */
      { id: 'W1', kind: 'winch', a: [12, 231], b: [32, 218] },
      { id: 'W2', kind: 'winch', a: [38, 219], b: [60, 206] },
      /* 2 JUNCTIONS */
      { id: 'W3', kind: 'winch', a: [70, 207], b: [46, 194], points: [{ at: 58, to: 'S2' }] },
      { id: 'S2', kind: 'glide', a: [61, 199.536], b: [50, 203.07], secret: true },
      { id: 'F1', kind: 'glide', a: [40, 194], b: [26, 198] },
      { id: 'F2', kind: 'glide', a: [21, 198.5], b: [6, 201] },
      { id: 'W4', kind: 'winch', a: [4, 201], b: [24, 188] },
      /* 3 THE WIND GORGE */
      { id: 'W5', kind: 'winch', a: [27, 188], b: [6, 176] },
      { id: 'G2', kind: 'glide', a: [11, 176], b: [61, 183] },
      { id: 'W6', kind: 'winch', a: [77, 183], b: [63, 163] },
      { id: 'G3', kind: 'glide', a: [60, 164], b: [10, 170] },
      /* 4 THE AMBUSH */
      { id: 'H1', kind: 'winch', a: [7, 170], b: [21, 154.5], cut: true },
      { id: 'H2', kind: 'winch', a: [28, 155], b: [58, 141], cut: true, points: [{ at: 40, to: 'S4' }] },
      { id: 'S4', kind: 'winch', a: [43, 151.6], b: [30, 142], secret: true },
      { id: 'H3', kind: 'winch', a: [60, 141], b: [68, 132.5], cut: true },
      /* 7 THE GONDOLA (the line kit lab's set piece, laid at the station) */
      { id: 'GD', kind: 'free', a: [26, 99.5], b: [59, 85], dir: 1, snap: { at: 41 }, cab: { onto: 'LO' } },
      { id: 'LO', kind: 'glide', a: [37, 97.5], b: [65, 101] },
      /* 8 THE EXAM */
      { id: 'E1', kind: 'winch', a: [67, 103], b: [77, 90.5], cut: true },
      { id: 'E2', kind: 'winch', a: [74, 91], b: [44, 73], cut: true },
      { id: 'E3', kind: 'winch', a: [38, 73], b: [14, 57] },
      /* THE HEAD STATION (claude/skyhook): SKYHOOK's HIGH LINE (a glide west: you may ride it too; he rides it both ways on his crank trolley - a lever slips it), and a grip
         winch from the floor up to each gallery (phase two: he cuts the one under him while you haul up it; the station floor catches you) */
      { id: 'HL', kind: 'glide', a: [36.5, 38.6], b: [11, 39.2], cut: true },
      { id: 'SW', kind: 'winch', a: [20, 46.6], b: [12.5, 38.4], cut: true },
      { id: 'SE', kind: 'winch', a: [27, 46.6], b: [34.5, 38.4], cut: true },
    ],
    /* 6 THE COUNTERWEIGHT */
    weights: [{ id: 'lift', a: { x0: 3, x1: 6, top: 102, bot: 118 }, b: { x0: 9, x1: 12, top: 102, bot: 118 }, rest: 0, tare: 0.5, hopper: [13, 117] }],
    winds: [
      { id: 'gorgeLow', box: [28, 172, 58, 186], dir: 1, period: 4.4, on: 2, told: 1.2, shove: 240, sway: 10 },             /* a TAILWIND on G2 (east) */
      { id: 'gorgeHigh', box: [28, 158, 58, 171], dir: 1, period: 4, on: 2, told: 1.2, shove: 260, sway: 10, phase: 1 },    /* a HEADWIND on G3 (west) */
      { id: 'examGale', box: [40, 69, 70, 90], dir: 1, period: 3.8, on: 2.2, told: 1.2, shove: 260, sway: 12, exam: true },  /* THE EXAM: winch + wind + Hookjacks */
    ],
    lee: [[1, 160, 27, 190], [59, 160, 78, 190], [32, 61, 39, 77], [71, 87, 78, 96]],
  },
  /* THE HOOKJACKS (src/hookjack.js): line, x (tiles), dir; a CUTTER waits on foot at the line's high station */
  hookjacks: [
    { line: 'H1', x: 18, dir: -1 },                          /* 4: TAUGHT - he rides down H1 at you; the gorge glide G3 under it is the net */
    { line: 'H2', x: 57, role: 'cutter' },                   /* 4: THE AMBUSH - he saws H2 from his station when you ride it: a level down */
    { line: 'H3', x: 66, dir: -1 },                          /* 4: one more on the short line to the hut */
    { line: 'E1', x: 76, role: 'cutter' },                   /* 8: the race - E1 is short: strike hard and you top it before his saw is through */
    { line: 'E2', x: 50, dir: 1 }, { line: 'E2', x: 62, dir: 1 },   /* 8: two riders in the gale (never two swipes inside HK.noStack) */
    { line: 'E3', x: 20, dir: 1 },                           /* 8: the last line */
  ],
};

/* ---------------- (claude/hlswitch) THE SWITCH PATCH: what HL_SWITCH changes in the data (a patched deep copy; HL_DATA itself, the flag-off level, is never touched) ----------------
   BAND 2: J1, a foot lever on L2, sets W3's points at 58 (main way, or the silver line S2). BAND 3: G2 / G3 are HELD glides (parked until you strike). BAND 4: J3, a lever on a pylon beside H2 (a line swing, or
   a shot from the rider), sets H2's points at 40 onto S4 - the way off the cutter's saw - and S5 (a winch from SILVER TWO's ledge to L11) makes that branch a longer, safe route, not a dead end.
   BAND 8: J4, a foot lever on L16, sets E2's points at 64 (the gale line with two Hookjacks, or EL: a steep winch to the NEW landing LE in the lee) and EG, a held glide west from LE to L17 in the gale.
   (The plan drew EG from (70,79) to (47,74.6): that is UPHILL going west and a glide runs downhill, so LE stands higher than L17 - top 70 against 74 - and EL climbs to it.) */
const PATCH_LANDINGS = [[71, 70, 78, 71]];   /* 37 LE: the exam's east lee, high (EL tops onto it; the held glide EG leaves it). Appended: every landing index above is unchanged */
const PATCH_LINES = [
  { id: 'S5', kind: 'winch', a: [29, 142.4], b: [54, 141.6] },                 /* SILVER TWO's ledge (Ls4) -> L11: the safe way round the cutter once S4 has taken you off H2. (claude/hlswitchproof) A WINCH, not a glide: it climbs 0.8 row east, and a glide runs the way DOWNHILL (the kit's `down`), so the glide drawn a->b rode L11 -> Ls4 and the S4 branch was a dead end; its foot starts at 29 so a rider standing on the ledge is in reach (a dir -1 line is taken from xa + 12) */
  { id: 'EL', kind: 'winch', a: [63, 86.46], b: [75, 68.9] },                  /* the exam's lee branch: off E2 at 64 (J4 = 1) up to LE */
  { id: 'EG', kind: 'glide', a: [72, 69.2], b: [47, 73], hold: true },         /* a held glide LE -> L17 over the gale: parked until one blow, so you pick your gust */
];
export const SWITCHES = [
  { id: 'J1', at: [66, 207], states: 2, init: 0, from: 'foot', spring: 0, tag: 'amber' },
  { id: 'J3', at: [34, 152], states: 2, init: 0, from: 'both', spring: 0, tag: 'amber' },
  { id: 'J4', at: [75, 91], states: 2, init: 0, from: 'foot', spring: 0, tag: 'amber' },
];
export function applySwitchPatch(src) {
  const D = JSON.parse(JSON.stringify(src)), K = D.lineKit, L = id => K.lines.find(d => d.id === id);
  K.rule = 'switch'; K.switches = SWITCHES.map(s => ({ ...s, at: s.at.slice() }));
  L('W3').points = [{ at: 58, to: 'S2', sw: 'J1', on: 1 }];
  L('H2').points = [{ at: 40, to: 'S4', sw: 'J3', on: 1 }];
  L('E2').points = [{ at: 64, to: 'EL', sw: 'J4', on: 1 }];
  L('G2').hold = true; L('G3').hold = true;
  K.lines.push(...PATCH_LINES.map(d => JSON.parse(JSON.stringify(d))));
  K.lee = K.lee.map(b => (b[0] === 71 && b[1] === 87 ? [71, 66, 78, 96] : b));   /* the east lee runs up to LE */
  D.landings.push(...PATCH_LANDINGS.map(b => b.slice()));
  return D;
}
export const HL_DATA_SW = applySwitchPatch(HL_DATA);
/* the sign texts the flag changes: 'x,y' -> text (the lever's own sign stands at 62 instead of 66: see buildHighLines) */
export const SIGNS_SW = { '6,231': 'HANG ON (UP), THEN STRIKE ONCE: THE LINE CARRIES YOU ALL THE WAY UP.', '66,207': 'A LEVER SETS THE POINTS. THE LIT LAMP IS THE WAY THE LINE GOES.',
  '9,176': 'THE GORGE LINES WAIT FOR YOUR BLOW. LAUNCH WITH THE WIND, NOT INTO IT.', '24,155': 'A GOBLIN WITH A SAW. STRIKE THE LEVER AND THE POINTS TAKE YOU CLEAR.', '66,103': 'NO NETS FROM HERE. THE LEVER PICKS THE GALE OR THE LEE.' };

/* ---------------- THE DRAWN SUPPORTS (claude/hlart): every deck stands on the line crews' iron or the cliff's own stone ---------------- */
/* L.routeSupports kind 'hlgantry' (drawn by src/redraw/high_lines_tiles.js drawGantry through src/route-art.js): per landing / net run, posts at both ends and every 8 tiles. The rock lips (ROCK_LANDINGS) stand on granite
   CORBELS; an iron deck beside rock (a cliff wall, the head station's arch) hangs from a wall BRACKET (an I-beam from a bolted plate, a knee brace and a tie rod at the tip); a deck in the open shaft stands on a lattice PYLON
   with guy cables to the cliffs. No tile changes: the route, the walker and the sweep are untouched. */
export const ROCK_LANDINGS = [14, 15, 16, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32, 33];
export const FLOOR_LANDINGS = [0];   /* solid rock under it already (the line-yard); the head station floor (34) is a 1-thick slab over the shaft and gets its girder */
export function hlSupports(D, at, solid) {
  const out = [], runs = [];
  D.landings.forEach((b, i) => { if (!FLOOR_LANDINGS.includes(i)) runs.push({ x0: b[0], x1: b[2], y: b[1], rock: ROCK_LANDINGS.includes(i) }); });
  for (const b of D.nets) runs.push({ x0: b[0], x1: b[2], y: b[1], rock: false, net: true });
  for (const r of runs) {
    const wl = solid(at(r.x0 - 1, r.y)) || solid(at(r.x0 - 1, r.y + 1)), wr = solid(at(r.x1 + 1, r.y)) || solid(at(r.x1 + 1, r.y + 1)), run = [r.x0, r.x1];
    const step = r.rock && r.x1 - r.x0 > 20 ? 3 : 8, xs = new Set([r.x0, r.x1]); for (let x = r.x0 + step; x < r.x1 - (step > 3 ? 3 : 1); x += step) xs.add(x);   /* a long rock shelf stands on a corbel table (every 3 tiles: the post-reach rule) */
    for (const x of [...xs].sort((a, b) => a - b)) {
      const base = { x, y: r.y, kind: 'hlgantry', run, ...(solid(at(x, r.y)) ? { drop: 8 } : {}) };   /* drop: the deck is a 16-px granite slab, so the iron hangs 8 px lower */
      if (r.rock) out.push({ ...base, bottom: r.y + 3, st: 'corbel', len: 3 });
      else if (wl || wr) { const s = wl ? 'bracketL' : 'bracketR', wallX = wl ? r.x0 - 1 : r.x1 + 1, nearEnd = wl ? r.x0 : r.x1, farEnd = wl ? r.x1 : r.x0; out.push({ ...base, bottom: r.y + 3, st: s, len: 3, wallX, first: x === nearEnd, tip: x === farEnd }); }
      else out.push({ ...base, bottom: r.y + 6, st: 'pylon', len: 6 });
    }
  }
  return out;
}

/* ---------------- THE GAME'S LEVEL (src/level.js calls this) ---------------- */
export function buildHighLines({ painter, T, TS, sw = HL_SWITCH }) {   /* sw: the HL_SWITCH flag (a node proof passes it in) */
  const { W, H } = HL, D = sw ? HL_DATA_SW : HL_DATA, L = painter(W, H), { set, block, ent } = L;
  const sign = (x, y, text) => ent('sign', x, y, { text: sw && SIGNS_SW[x + ',' + y] !== undefined ? SIGNS_SW[x + ',' + y] : text });   /* flag on: the switch rule's words at the same spots */
  const foe = (t, x, y, o) => ent(t, x, y, o || {});
  const lineAt = (id, tx) => { const d = D.lineKit.lines.find(q => q.id === id), k = (tx - d.a[0]) / (d.b[0] - d.a[0]); return d.a[1] + (d.b[1] - d.a[1]) * k; };
  const coinOn = (id, tx) => ent('coin', tx, Math.floor(lineAt(id, tx)));   /* a coin on a rider's path (taken as you ride by) */
  /* the cliff walls (the shaft), the line-yard's rock, the cave's rock over the top */
  block(0, 0, 0, H - 1); block(W - 1, W - 1, 0, H - 1);
  block(1, 14, 233, H - 1);
  block(1, W - 2, 0, 29); block(41, W - 2, 30, 47);               /* the mountain over THE CAVE MOUTH (its chamber is cols 1-40, rows 30-47) */
  block(7, 7, 30, 41); block(40, 40, 30, 41);                      /* (claude/skyhook) THE HEAD STATION's rock arch: the walls close under it (rows 42-47) */
  block(50, 55, 119, 139);                                         /* the crevice's west wall (under the shelf) */
  /* every landing and net is a one-way deck row (a ledge's top) */
  for (const [x0, top, x1] of D.landings.concat(D.nets)) for (let x = x0; x <= x1; x++) set(x, top, T.ONEWAY);
  for (let x = 1; x <= 14; x++) set(x, 232, T.SOLID);              /* the line-yard is rock, not a deck */
  for (let x = 7; x <= 40; x++) set(x, 48, T.SOLID);               /* (claude/skyhook) THE HEAD STATION's floor is rock (no dropping out of the fight); cols 1-6 stay a deck - the way up from the steps */
  /* checkpoints (3: Daniel - fewer), the silver, the way on */
  for (const c of D.checkpoints) ent('check', c.x, c.y - 1);
  for (const [sx, sy] of D.secrets) ent('silver', sx, sy);
  ent('gate', 38, 47);
  /* ---- 1 FOOTHOLD ---- */
  sign(6, 231, 'HANG ON (UP), THEN STRIKE: EVERY BLOW HAULS THE LINE UP.');
  sign(36, 219, 'A MISS COSTS A CLIMB: THE NETS CATCH YOU.');
  foe('goat', 35, 219, { face: 1 });                               /* a crag ram on the first station: weight on foot before the lines */
  foe('crossbow', 71, 207, { face: -1 });                          /* the first bolt at a rider: he leads you up W2 */
  coinOn('W1', 22); coinOn('W2', 50); ent('coin', 64, 207);
  /* ---- 2 JUNCTIONS ---- */
  sw ? sign(62, 207, SIGNS_SW['66,207']) : sign(66, 207, 'POINTS: HOLD UP AS YOU PASS THE BOARD AND YOU TAKE THE BRANCH.');   /* (hlswitch) the lever stands at 66 */
  sign(41, 194, 'THE GLIDE IS FAST. JUMP TO KICK OFF ACROSS TO THE NEXT LINE.');
  foe('harpy', 14, 190, { face: 1 });                              /* a crag harpy dives at the glide riders */
  coinOn('S2', 55); coinOn('F2', 14); ent('coin', 30, 188);
  /* ---- 3 THE WIND GORGE ---- */
  sign(9, 176, 'THE WIND IS TOLD. RIDE WITH IT AND YOU FLY. THE LEE ROCKS ARE CALM.');
  foe('crossbow', 33, 188, { face: 1 });
  foe('galeharpy', 44, 176, { face: -1 }); foe('galeharpy', 40, 160, { face: 1 });
  coinOn('G2', 36); coinOn('G3', 30); ent('coin', 70, 183);
  /* ---- 4 THE AMBUSH ---- */
  sign(4, 170, 'GOBLIN CREWS RIDE AT YOU. HIT ONE WHEN HE DRAWS HIS HOOK BACK, OR TURN THE SWIPE.');
  sign(24, 155, 'A GOBLIN WITH A SAW: IF HE CUTS YOUR LINE YOU DROP A LEVEL.');
  foe('crossbow', 55, 141, { face: -1 });
  coinOn('H2', 48); coinOn('S4', 36); ent('coin', 60, 141);
  /* ---- 5 THE LEE HUT (on foot) ---- */
  sign(72, 133, 'THE LEE HUT. NO LINES ABOVE: CLIMB THE CREVICE. LISTEN FOR THE ROCK.');
  for (const x of [58, 64, 70]) ent('rockfall', x, 112, { every: 2.6 + (x % 3) * 0.3, tell: 1.0, seen: true });   /* THE CREVICE's loose rock: told, on screen */
  foe('goat', 40, 117, { face: -1 }); foe('goat', 26, 117, { face: 1 });
  for (const [cx, cy] of [[64, 131], [58, 125], [70, 121]]) ent('coin', cx, cy);   /* on the rock lips */
  /* ---- 6 THE COUNTERWEIGHT ---- */
  sign(15, 117, 'STAND IN THE CAGE AND STRIKE THE HOPPER: THE STONE GOES DOWN, THE CAGE GOES UP.');
  foe('crossbow', 21, 101, { face: -1 });                          /* bolts at the cage as it rises */
  /* ---- 7 THE GONDOLA ---- */
  sign(17, 101, 'THE GONDOLA. STEP IN. IF THE LINE CREAKS, HOLD ON.');
  foe('harpy', 45, 90, { face: -1 });
  /* ---- 8 THE EXAM ---- */
  sign(66, 103, 'NO NETS FROM HERE. A MISS FALLS A LONG WAY.');
  foe('galeharpy', 56, 78, { face: 1 }); foe('crossbow', 45, 73, { face: 1 });
  /* ---- THE CAVE MOUTH ---- */
  sign(9, 57, 'THE CAVE MOUTH. THE ORE ROAD RUNS INTO THE MOUNTAIN FROM HERE.');
  sign(4, 47, 'THE HEAD STATION. SKYHOOK WORKS THE HIGH LINE HERE.');
  ent('skyhook', 37, 39, { face: -1 });                           /* (claude/skyhook) SKYHOOK on his east gallery (src/skyhook.js) */
  /* (claude/hlswitch) THE LEVERS as props in main.js's foe list (src/highlines-hands.js leverSpawn): any blow or shot throws one; never harmed, never a kill. Their iron is drawn by the kit (the post) */
  if (sw) for (const s of D.lineKit.switches) ent('hllever', s.at[0], s.at[1], { sw: s.id, from: s.from, tag: s.tag });
  /* THE HOOKJACKS as foes in main.js's list (src/highlines-hands.js spawn): a rider hangs on his line; a cutter stands at his station */
  for (const hj of D.hookjacks) { const d = D.lineKit.lines.find(q => q.id === hj.line), k = (hj.x - d.a[0]) / (d.b[0] - d.a[0]), ly = d.a[1] + (d.b[1] - d.a[1]) * k;
    const land = hj.role === 'cutter' ? D.landings.find(b => hj.x >= b[0] && hj.x <= b[2] && b[1] >= ly && b[1] - ly <= 3) : null;
    ent('hookjack', hj.x, land ? land[1] - 1 : Math.floor(ly), { line: hj.line, role: hj.role, dir: hj.dir }); }
  /* the kit's moving floors as main.js movers (tagged lk: src/highlines-hands.js mover copies their place from the kit every frame; main.js carries whoever stands on them; fair: matched where it stood before this frame's move, as the fair's rides - the cab falls fast) */
  const lkMovers = [{ lk: 'cab:GD', x0: 24.5, x1: 27.5, top: 102 }, { lk: 'w:lift:A', x0: 3, x1: 7, top: 102 }, { lk: 'w:lift:B', x0: 9, x1: 13, top: 118 }]
    .map(m => ({ kind: 'lift', lk: m.lk, fair: 'lk', x: m.x0 * TS, y: m.top * TS, w: (m.x1 - m.x0) * TS, h: 6, y0: m.top * TS, y1: m.top * TS, speed: 0 }));
  const START = { x: 4, y: 231 };
  /* (claude/skyhook) THE HEAD STATION as main.js's arena (px), with what src/skyhook.js geom reads: perches, levers, the high line's rope ends, the winch lines, the swing anchor */
  const Ar = D.arena, hl = D.lineKit.lines.find(d => d.id === Ar.line), [la, lb] = hl.a[0] < hl.b[0] ? [hl.a, hl.b] : [hl.b, hl.a];
  const arena = { x0: Ar.x0 * TS, x1: (Ar.x1 + 1) * TS, floor: Ar.floor * TS, trigger: Ar.trigger * TS, wallL: Ar.wallL, wallR: Ar.wallR, boss: Ar.boss, music: Ar.music, tint: '#6a7a90', tintA: 0.08,
    perchW: { x: Ar.perchW[0] * TS + 8, y: Ar.perchW[1] * TS }, perchE: { x: Ar.perchE[0] * TS + 8, y: Ar.perchE[1] * TS }, levers: Ar.levers.map(([id, x]) => ({ id, x: x * TS + 8 })),
    line: { id: hl.id, xa: la[0] * TS, ya: la[1] * TS, xb: lb[0] * TS, yb: lb[1] * TS }, winch: { ...Ar.winch }, swingY: Ar.swingY * TS };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: lkMovers, interiors: [],
    reskin: { crossbow: 'hlgobbow' },   /* (claude/hlfix) the crossbowmen are goblins here (src/redraw/hl_goblin_skins.js; a reskin table is not in the level hash) */
    highlines: true, hlKit: true, routeSupports: hlSupports(D, (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : L.grid[y * W + x]), t => t === T.SOLID), lineKit: { ...JSON.parse(JSON.stringify(D.lineKit)), ends: endSupports(D, (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? true : L.grid[y * W + x] === T.SOLID)) }, hookjacks: D.hookjacks.map(h => ({ ...h })),
    landings: D.landings.map(b => b.slice()), nets: D.nets.map(b => b.slice()), checkpoints: D.checkpoints.map(c => ({ ...c })), secrets: D.secrets.map(s => s.slice()), exit: D.exit.slice(), w: W, h: H,
    arena,
    squadBands: [{ lo: 0, hi: 99999, spots: 0, why: 'THE HIGH LINES: every foe is placed by hand on its line or station (nothing sprinkled)' }],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 99999,                /* three checkpoints (Daniel: fewer); src/level.js must not fill between them */
    tall: true, climbCam: true,
    sections: SECTIONS.map(([name, y0, y1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, y0, y1, x0: 0, x1: W - 1 })),
    /* what L.unlocks names, as data (tools/level-quality.mjs reads L[kind]): the winches, the points boards, the hopper, the gondola */
    winch: D.lineKit.lines.filter(d => d.kind === 'winch').map(d => ({ x: d.a[0], row: Math.round((d.a[1] + d.b[1]) / 2), id: d.id })),
    points: D.lineKit.lines.flatMap(d => (d.points || []).map(p => ({ x: p.at, id: d.id, to: p.to, ...(sw ? { sw: p.sw, on: p.on } : {}) }))),
    ...(sw ? { lever: D.lineKit.switches.map(s => ({ x: s.at[0], row: s.at[1], id: s.id, from: s.from })) } : {}),
    hopper: D.lineKit.weights.map(w => ({ x: w.hopper[0], row: w.hopper[1], id: w.id })),
    gondola: D.lineKit.lines.filter(d => d.cab).map(d => ({ x: d.a[0], row: Math.round(d.a[1]), id: d.id, onto: d.cab.onto })),
    unlocks: [
      sw ? { kind: 'winch', opens: 'the way up: one blow while hanging and the line carries you', hud: 'STRIKE ONCE TO RIDE' } : { kind: 'winch', opens: 'the way up: every blow while hanging hauls the line', hud: 'STRIKE TO HAUL' },
      sw ? { kind: 'points', opens: 'a lever sets which branch is live', hud: 'A LEVER SETS THE POINTS' } : { kind: 'points', opens: 'the side line to a silver (hold UP at the board)', hud: 'HOLD UP AT THE BOARD' },
      { kind: 'hopper', opens: 'the cage up to the gondola station', hud: 'THE STONE GOES DOWN, THE CAGE GOES UP' },
      { kind: 'gondola', opens: 'the ride over the gap to the far station (it snaps, it holds)', hud: 'HOLD ON' },
    ],
    music: 'skysail',   /* "Ile Flotante / Village In The Air", Le Mandrill, CC0 (audio/CREDITS.txt) - free since the Sky Ship left the road; Daniel may pick another */
    ambient: [{ x0: 0, x1: 99999, kind: 'highair' }],
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    palette: { sky: [[86, 112, 160], [196, 206, 222]], far: 'crag', mid: 'crag', near: 'none', dress: 'crag', noNear: true, haze: 'rgba(220,228,240,0.14)', grass: '#7a8a6a', grassL: '#9aa888', grassD: '#4a5a42', dirt: '#6a6a72', dirtL: '#8a8a94', dirtD: '#44444c', canopy: ['#5a6a7a', '#7a8a9a', '#9aa8b8', '#c8d0d8'] },   /* PLACEHOLDER: blue-grey granite and rime (art owed: the CAVE MOUTH backdrop that grows as you climb) */
    duskStart: -1, duskLen: 1, night: false, glowNight: false,
    reachExact: false,
  };
}
