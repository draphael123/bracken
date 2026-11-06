// src/flying-carpet.js - THE FLYING CARPET, desert act V level 6 (claude/carpet, 11-06, the OPUS GREYBOX: geometry, the ride's air, the cast and the arena;
// code-only, NOT on the live road). Sources: scratch/plan-desert-1105.md s1.6 / s3.g / s4 (Daniel approved 11-05 14:07), scratch/brief-flyingcarpet.md (the
// plan wins where they differ), lane-reports kingspyramid / suntemple / ksar3 (the flag pattern).
//
// THE FLAG: CARPET_SHIPS = false. Off, src/level.js does not even append the row, so LEVELS is master's array exactly (no index, no save, no tool moves).
// On (?carpet=1 on the page, globalThis.BRACKEN_CARPET, or CARPET=1 in a Node tool's env) the row is appended HIDDEN (no map node): play it with
// ?carpet=1&level=carpet. The road insert (glasssea > carpet > ksar: ksar.needs = 'carpet', old saves past the Glass Sea keep the Ksar open) is the road
// lane's, append-only, through the one road-insert migration test, at the art merge (art before live).
//
// THE RULE: THE CARPET RIDES THE WIND - IT ONLY HOLDS YOU WHILE IT'S MOVING. (src/carpet.js CARPET 2: the ride; src/carpet-hands.js its hands.)
// The Djinn's carpet (he owes you since the Well Town) waits at the Glass Sea's edge. Walk onto it and it flies, always forward: UP climbs and costs
// speed, DOWN dives and gains it, RIGHT pushes, LEFT brakes, BLOCK lies flat; too slow and it SAGS, then drops you - it follows under you a breath
// later, so height is your margin. Stone frays it (the bar). THERMALS lift for free, DOWNDRAFTS press behind the spires.
// FIVE PARTS (columns; rows: smaller is higher; ground surfaces are the solid rows):
//     0-21   THE GLASS SEA'S EDGE   the launch: the carpet waits on the cliff top (the level's start)
//    22-147  THE SAFE DUNES         TEACH: pitch, the stall (you land on sand: cheap), a thermal, a ROCK ARCH (lie flat through it, or ride a thermal over)
//   148-351  THE NECROPOLIS SPIRES  TEST: no sand below - the MIST; tomb spires, two GATE WALLS (lie flat through the arch), the tomb bridge (a tunnel), downdrafts; hawks + kites
//   352-364  THE FIRST LEDGE        a mesa top: SHRINE (CHECKPOINT ONE); the carpet lies beside you
//   366-571  THE STORM              REMIX: the SANDSTORM rule (src/desert-rules.js): a headwind gust eats your speed (dive or lie flat), the view closes
//   572-584  THE SECOND LEDGE       SHRINE (CHECKPOINT TWO) before her
//   585-619  THE HIGH GATE          THE SPHINX OF THE HIGH GATE (src/sphinx.js): the sky over the Ksar's cliff gate, the gate's stone apron under it
//   620-639  THE KSAR'S CLIFF GATE  the level's gate (opens on her death) -> THE BANDIT KSAR
// CHECKPOINTS: two (Daniel's fewer-checkpoints direction; the brief's "shrines on landing ledges"). The start is the third place you come back to only on a fresh load.
// CAST (0 new foes - plan s1.6: the carpet + the Sphinx are the novelty): THE HAWK SCOUT (the Ksar's hawk: her birds range this far out) and THE VULTURE
// (the desert's: here it circles a spire top and stoops on the carpet). Both COME TO YOU. No goblins, no wood: limestone spires, sandstone mesas, rope + carved
// stone only (plan s4: sky indigo dusk, necropolis spires, the Ksar cliff gate on the horizon - greybox colours now, art owed).

export const CARPET_SHIPS = false;
export function carpetOn() {
  if (CARPET_SHIPS) return true;
  try { if (globalThis.BRACKEN_CARPET === true || globalThis.BRACKEN_CARPET === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]carpet=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.CARPET === '1') return true; } catch { /* no node */ }
  return false;
}
const RIDE_HEAD = 24;   /* the ridden hero's head room under the sky's top (px) */
export const CR_RULE = "THE CARPET RIDES THE WIND - IT ONLY HOLDS YOU WHILE IT'S MOVING. CLIMB IN THE UPDRAFTS, DIVE TO GAIN SPEED.";
export const CR = { W: 640, H: 60, launchF: 32, ceil: 3, mist: 48, ledgeA: [352, 364, 33], ledgeB: [572, 584, 31], apron: 46, arena: [588, 617], gateX: 620 };
export const SECTIONS = [["THE GLASS SEA'S EDGE", 0], ['THE SAFE DUNES', 22], ['THE NECROPOLIS SPIRES', 148], ['THE FIRST LEDGE', 352], ['THE STORM', 366], ['THE SECOND LEDGE', 572], ['THE HIGH GATE', 585]];
/* each mechanic's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED (tools/carpet.mjs reads them) */
export const ARCS = {
  stall: { teach: [24, 80], test: [148, 351], remix: [366, 571], boss: [585, 619] },     /* on sand it costs a walk; over the mist a life; in the storm the wind does it to you */
  thermal: { teach: [44, 100], test: [148, 351], remix: [366, 571], boss: [585, 619] },
  arch: { teach: [96, 104], test: [192, 344], remix: [404, 556] },                       /* lie flat through a gate wall's hole */
  fray: { teach: [22, 147], test: [148, 351], remix: [366, 571] },
  gust: { remix: [366, 571], boss: [585, 619] },                                         /* the sandstorm rule: the storm, then her wing gust + P3 glyph storm */
};

export function buildFlyingCarpet({ painter, T, TS }) {
  const { W, H } = CR, MIST = CR.mist;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const thermals = [], tells = [], arches = [], decor = [];
  /* THE AIR (px): a THERMAL lifts (+), a DOWNDRAFT presses (-) - read by src/carpet-hands.js for the ridden carpet only (on foot you feel nothing) */
  const thermal = (x0, x1, y0, y1, lift = 90) => { thermals.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y0: y0 * TS, y1: (y1 + 1) * TS, lift }); ent(lift > 0 ? 'crthermal' : 'crdowndraft', x0, y1, { x1 }); };
  const tell = (x, text) => tells.push({ x: x * TS, text });
  /* a SPIRE: a limestone tomb tower up from the abyss (its top row `top`) */
  const spire = (x, w, top) => { block(x, x + w - 1, top, H - 1); decor.push({ kind: 'spire', x, w, top }); };
  /* a GATE WALL: stone from the sky to the abyss with ONE arch hole two rows high (rows hy, hy+1): lie flat (BLOCK) to slip through, or scrape */
  const gateWall = (x, hy) => { block(x, x + 1, 0, H - 1); air(x, x + 1, hy, hy + 1); arches.push({ x, hy }); decor.push({ kind: 'arch', x, hy }); ent('crarch', x, hy + 1); };
  const hawk = (x, y, x0, x1) => ent('hawkscout', x, y, { x0, x1, face: -1 });
  const kite = (x, top) => ent('vulture', x, top - 1);   /* THE VULTURE over a spire top: it circles there and stoops on your spot (its perch is the spire) */

  /* (the painter starts all AIR: what is not built below is sky, and under the spires the abyss goes to the bottom row) */

  // ================= 1. THE GLASS SEA'S EDGE (0-21): the launch =================
  block(0, 21, CR.launchF, H - 1);
  sign(2, CR.launchF - 1, 'THE FLYING CARPET. THE DJINN OWES YOU: HIS CARPET WAITS. IT RIDES THE WIND - AND IT ONLY HOLDS YOU WHILE IT IS MOVING.');
  sign(9, CR.launchF - 1, 'WALK ONTO IT. UP CLIMBS (IT COSTS SPEED), DOWN DIVES (IT GAINS SPEED). RIGHT PUSHES, LEFT BRAKES. HOLD BLOCK TO LIE FLAT. JUMP TO HOP OFF.');
  const RUG = { x: 13 * TS + 8, y: CR.launchF * TS - 2 };   /* where the carpet lies at the start (the hands park it by the checkpoint after a death) */

  // ================= 2. THE SAFE DUNES (22-147): TEACH =================
  const duneTop = x => 44 + Math.round(3 * Math.sin(x * 0.09) + 2 * Math.sin(x * 0.031));
  for (let x = 22; x <= 135; x++) block(x, x, duneTop(x), H - 1);
  tell(24, 'TOO SLOW AND IT SAGS - DIVE! OVER SAND A DROP COSTS ONLY THE WALK BACK TO IT.');
  thermal(46, 50, 12, duneTop(48) - 1);                                      /* the first thermal: a climb in it is free */
  tell(44, 'A THERMAL: HOLD UP INSIDE THE SHIMMER - IN THE UPDRAFT A CLIMB COSTS NOTHING.');
  hawk(62, 12, 52, 82);
  for (const [x, y] of [[30, 36], [33, 34], [36, 33], [39, 34], [56, 22], [59, 20], [62, 20], [65, 22], [76, 34], [80, 36]]) ent('coin', x, y);
  /* THE ROCK ARCH (100-101): a wall up off the dunes with a two-row hole; a thermal before it climbs you over instead */
  block(100, 101, 18, duneTop(100) - 1); air(100, 101, 32, 33); arches.push({ x: 100, hy: 32 }); decor.push({ kind: 'arch', x: 100, hy: 32, rock: true }); ent('crarch', 100, 33);
  thermal(90, 94, 10, duneTop(92) - 1);
  tell(92, 'A ROCK ARCH: LIE FLAT (HOLD BLOCK) AND STEER THROUGH THE HOLE - OR RIDE THE THERMAL OVER IT. STONE FRAYS THE CARPET.');
  hawk(124, 12, 110, 140);
  ent('silver', 101, 15);                                                    /* over the arch's crown: only a thermal climb gets there */
  block(136, 147, 36, H - 1); decor.push({ kind: 'mesa', x0: 136, x1: 147, top: 36 });   /* the dunes end at a mesa's lip */
  tell(140, 'PAST THIS CLIFF THERE IS NO SAND: ONLY THE MIST. LOW OVER THE MIST A DROP IS A FALL.');

  // ================= 3. THE NECROPOLIS SPIRES (148-351): TEST - the first field (148-261) =================
  spire(154, 3, 40); spire(166, 4, 34); thermal(160, 164, 14, MIST - 1); spire(178, 3, 42); thermal(182, 186, 18, MIST - 1, -90);   /* the lee of the tall one: a downdraft */
  gateWall(196, 26); tell(186, 'A GATE WALL: THE ARCH IS THE ONLY WAY ON. LIE FLAT.');
  block(204, 214, 30, H - 1); block(204, 214, 0, 21); decor.push({ kind: 'tombbridge', x0: 204, x1: 214, y: 21, floor: 30 });   /* THE TOMB BRIDGE: a great tomb's underside overhead, its crypt roofs below - an eight-row tunnel (no way over) */
  thermal(218, 222, 12, MIST - 1); spire(226, 4, 36);
  gateWall(236, 20);
  spire(244, 3, 38); thermal(248, 252, 14, MIST - 1); spire(256, 3, 40);
  kite(167, 34); kite(227, 36); hawk(182, 12, 168, 200); hawk(226, 12, 210, 248);
  for (const [x, y] of [[158, 30], [161, 28], [164, 28], [197, 27], [206, 26], [209, 26], [212, 26], [237, 21], [250, 24], [253, 24]]) ent('coin', x, y);
  ent('silver', 209, 29);                                                    /* in the tomb bridge's tunnel, low on the crypt roofs: dip for it */

  // ---- the second spire field (262-351): taller tombs, a LOW arch near the mist, a second tomb bridge ----
  spire(266, 3, 36); thermal(270, 274, 12, MIST - 1); spire(278, 4, 28); thermal(283, 286, 14, MIST - 1, -90);
  gateWall(296, 34); tell(288, 'A LOW ARCH, NEAR THE MIST: DIVE FOR IT FAST - A STALL DOWN HERE IS A FALL.');
  thermal(299, 304, 18, MIST - 1);   /* a thermal straight after the low arch: it lifts you to the tomb bridge */
  block(308, 320, 28, H - 1); block(308, 320, 0, 17); decor.push({ kind: 'tombbridge', x0: 308, x1: 320, y: 17, floor: 28 });
  thermal(324, 328, 10, MIST - 1); spire(332, 3, 34); gateWall(340, 22); spire(346, 3, 38);
  kite(279, 28); kite(333, 34); hawk(296, 12, 282, 312); hawk(338, 12, 326, 350);
  for (const [x, y] of [[271, 26], [274, 24], [297, 35], [310, 22], [314, 22], [318, 22], [326, 20], [341, 23]]) ent('coin', x, y);

  // ================= 4. THE FIRST LEDGE (352-364): CHECKPOINT ONE =================
  const [A0, A1, AY] = CR.ledgeA; block(A0, A1, AY, H - 1); decor.push({ kind: 'mesa', x0: A0, x1: A1, top: AY });
  ent('check', A0 + 4, AY - 1);
  sign(A0 + 8, AY - 1, 'A LANDING LEDGE: THE CARPET SET YOU DOWN BY THE SHRINE. WALK BACK ONTO IT. AHEAD THE SAND RISES INTO A STORM.');

  // ================= 5. THE STORM (366-571): REMIX - the sandstorm rule =================
  const STORM = { x0: 366 * TS, x1: 572 * TS, dirs: [-1, -1, 1, -1] };     /* mostly against you: a HEADWIND eats the carpet's speed (dive or lie flat); one tailwind */
  const o = 90;   /* (the storm's first field, laid at 276 and moved on by the second spire field) */
  tell(o + 278, 'THE STORM: WHEN THE SAND HISSES A GUST IS COMING. A HEADWIND EATS YOUR SPEED - DIVE, OR LIE FLAT AND BRACE.');
  spire(o + 284, 3, 36); thermal(o + 290, o + 294, 12, MIST - 1); spire(o + 298, 4, 32); spire(o + 308, 3, 40);
  gateWall(o + 318, 24);
  spire(o + 326, 3, 34); thermal(o + 332, o + 336, 14, MIST - 1); spire(o + 340, 3, 30); thermal(o + 343, o + 346, 16, MIST - 1, -90); spire(o + 350, 4, 38);
  gateWall(o + 362, 30);
  spire(o + 372, 3, 36); thermal(o + 378, o + 382, 12, MIST - 1); spire(o + 388, 3, 38); spire(o + 396, 3, 42);
  kite(o + 299, 32); hawk(o + 330, 12, o + 316, o + 346); hawk(o + 384, 12, o + 370, o + 398);
  for (const [x, y] of [[292, 22], [295, 20], [319, 25], [334, 24], [337, 22], [363, 31], [380, 22], [383, 20]]) ent('coin', o + x, y);
  // ---- the storm's second field (492-571): two arches in the sand, the thermals between ----
  spire(496, 3, 34); thermal(501, 505, 12, MIST - 1); gateWall(512, 26); spire(520, 4, 30); thermal(525, 528, 16, MIST - 1, -90);
  spire(534, 3, 38); thermal(540, 544, 12, MIST - 1); gateWall(556, 28); spire(562, 3, 36); spire(566, 3, 40);
  kite(521, 30); hawk(540, 12, 528, 556);
  for (const [x, y] of [[502, 24], [505, 22], [513, 27], [541, 24], [544, 22], [557, 29]]) ent('coin', x, y);
  ent('silver', 542, 8);                                                     /* high over the storm's last thermal: ride it all the way up */

  // ================= 6. THE SECOND LEDGE (572-584): CHECKPOINT TWO =================
  const [B0, B1, BY] = CR.ledgeB; block(B0, B1, BY, H - 1); decor.push({ kind: 'mesa', x0: B0, x1: B1, top: BY });
  ent('check', B0 + 4, BY - 1);
  sign(B0 + 8, BY - 1, 'THE HIGH GATE. SHE ASKS, YOU ANSWER: STRIKE THE STONE THAT BEARS HER GLYPH (OR FLY THROUGH IT). THE WRONG ONE AND SHE POUNCES.');

  // ================= 7. THE HIGH GATE (585-619): THE SPHINX =================
  block(B1 + 1, CR.gateX - 1, CR.apron, H - 1); decor.push({ kind: 'apron', x0: B1 + 1, x1: CR.gateX - 1, top: CR.apron });   /* the gate's stone apron: in her fight a drop lands here (her danger is her) */
  const [X0, X1] = CR.arena;
  ent('sphinx', X1 - 6, 20, { face: -1 });
  const arena = { x0: X0 * TS, x1: (X1 + 1) * TS, floor: CR.apron * TS, trigger: (X0 + 2) * TS, wallL: X0 - 1, wallR: X1 + 1, boss: 'sphinx', music: 'rocphoenix',   /* (placeholder: the Roc's sky fight track until the art lane's own - REPORT-ONLY music) */
    tint: '#6a5aa8', tintA: 0.08, start: [X0 + 2, CR.apron - 1], y0: 6 * TS, y1: (CR.apron + 1) * TS, sky: true };

  // ================= 8. THE KSAR'S CLIFF GATE (620-639) =================
  block(CR.gateX, W - 1, 0, H - 1); air(CR.gateX, W - 2, CR.apron - 5, CR.apron - 1); decor.push({ kind: 'cliffgate', x: CR.gateX, y0: CR.apron - 5, y1: CR.apron - 1 });
  ent('gate', CR.gateX + 1, CR.apron - 1);                                   /* THE LEVEL'S GATE: it opens once she is down (gateAfterBoss) */

  const START = { x: 4, y: CR.launchF - 1 };
  const px = c => c * TS;
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [],
    arena, gateAfterBoss: true, flyingCarpet: true,
    /* THE RIDE (src/carpet-hands.js): the air, the tells, the storm, where the rug lies, the mist the ridden carpet will not go under */
    cr: { thermals, tells, arches, landings: L.ents.filter(e => e.t === 'check').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS })),   /* THE LANDING LEDGES: flying over a shrine the carpet SETS YOU DOWN on it (the shrine lights; walk back onto the rug) */
       storm: STORM, rug: RUG, ceil: CR.ceil * TS + RIDE_HEAD, mist: MIST * TS, abyss: [[px(148), px(352)], [px(366), px(572)]], arena: { x0: arena.x0, x1: arena.x1, y0: arena.y0, floor: arena.floor } },
    decor, shade: [[0, W * TS, 0, H * TS + 1]],   /* up here the wind cools you: no sunstroke on the carpet (one shade box over everything) */
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])), arcs: ARCS,
    squadBands: [{ lo: X0, hi: X1, spots: 0, why: 'THE SPHINX OF THE HIGH GATE: the arena - no squad stands in a boss arena' }],
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 220,   /* two checkpoints (Daniel: fewer): the two landing ledges; a carpet run between them is ~20-25 s of flight */
    unlocks: [{ kind: 'silver', opens: 'nothing: three silvers off the safe line - over the rock arch (a thermal climb), low in the first tomb bridge, high over the last storm thermal', hud: 'SILVER' }],
    music: 'skyroad',   /* placeholder: the Sky Road's bed until the art lane's own track (REPORT-ONLY music) */
    ambient: [{ x0: 0, x1: 99999, kind: 'glasssea' }],
    rockZones: [], masonry: [[0, W - 1, 0, H - 1]], masonryKit: 'limestone', ledgeKit: 'desert',   /* greybox: limestone spires + sandstone mesas until the art lane's kit (plan s4) */
    palette: { set: 'desert', near: 'none', dress: 'none', noFg: true, noNear: true, haze: 'rgba(60,40,110,0.22)' },
    noSkyRays: true, duskStart: -1, duskLen: 1,
  };
}
