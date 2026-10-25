// src/rookery.js - THE ROOKERY (claude/rookery, the OPUS GREYBOX of the level and its boss, 2026-10-25). Brief scratch/brief-rookery-1024.md (Daniel picked it 10-24
// 07:55; 10-24 21:09: this week's top priority). GALE MOOR -> HERE -> THE SKY ROAD (THE ROC). This file is the level the game runs, laid by hand (nothing sprinkled);
// src/rookery-hands.js is its rule and machines (the cracked rocks, the roosts, the harpy shrieker, the landmark); THE SHRIEK SISTERS (src/shriek-sisters.js +
// -hands.js) are its boss.
//
// THE STORY BEAT: up off the high moor the road climbs the HARPIES' CRAGS - wind-scoured rock, ledges white with guano, bone nests hung over the drops - toward
// the ROC'S PEAK ('the mother of harpies' nests on it: the Sky Road is the way up). THE MONASTERY's roof and bell tower lie far below and behind you (the
// landmark: src/rookery-hands.js drawSky), sinking as you climb; the Roc's peak ahead grows.
//
// THE RULE (L.rule): A HARPY'S DIVE BREAKS WHAT IT HITS.
//   A CRACKED ROCK (L.hoists, the Rootway's / the Palisade's data shape: `cleat` is THE MARK, the cell a hero stands in) is split and limed white, a ring on it, and
//   what it will do is DRAWN FIRST. STAND ON THE MARK: its roost's harpy SCREAMS, aims (a red line) and dives at the mark - step off or block her and she hits the
//   rock: it BREAKS, and she lies stunned in the rubble. What it breaks STAYS:
//     drop   the floor gives way: a hole into the way below        span   a cracked PILLAR topples across a gap: a bridge
//     nest   a BONE NEST's cracked arm goes: the nest drops as a platform    steps  a cracked OVERHANG slides down the cliff as steps
//   THE HARPY SHRIEKER (the level's one new foe) screams and MARKS YOUR SPOT: every harpy near dives at the mark - stand on a crack and let her.
//
// FIVE NAMED AREAS (A10c: one shrine at the end of each area's exam, one before the boss). Columns; rows: smaller is higher (every row below is r(n) = n + 6).
//     0-106  THE GUANO LEDGES      TEACH   a lone crag harpy (block her: she is stunned); THE FIRST CRACK (a floor over the only way on, under a buttress no one climbs -
//                                          REQUIRED, safe: nothing else here); the gully; exam THE FIRST ROOST (a slab over a cliff - REQUIRED, harpies, a fledgling); shrine 104
//   106-206  THE NEST TERRACES     TEST    THE FIRST NEST over a chasm (REQUIRED); egg caches; THE SHRIEKER taught; THE CRACKED PILLAR over the second chasm (REQUIRED);
//                                          exam THE EGG LEDGES (a nest under a shrieker, crows - REQUIRED); shrine 203
//   206-316  THE UPDRAFT CHIMNEYS  REMIX + A14 (the real platforming)  an updraft up a face no jump climbs; the slab bait on a NARROW LEDGE after the ride (REQUIRED);
//                                          THE WIND GAP: pillars and a timed updraft over the gully, crows and a diver on you (a fall is a climb); THE BROKEN SPAN: a pillar
//                                          with a shrieker over it (REQUIRED); shrine 312
//   316-368  THE BONE STAIR        EXAM    every use at once under the landmark: a troll and a shrieker on the ledge, THE LAST NEST (REQUIRED), THE TOP SLAB (REQUIRED); shrine 362
//   368-416  THE SISTERS' CRAG     BOSS    THE SHRIEK SISTERS on the summit
export const ROOKERY = { W: 416, H: 52, arena: [370, 411], floor: 11 };
export const SECTIONS = [['THE GUANO LEDGES', 0, 106], ['THE NEST TERRACES', 106, 206], ['THE UPDRAFT CHIMNEYS', 206, 316], ['THE BONE STAIR', 316, 368], ["THE SISTERS' CRAG", 368, 416]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/rookery.mjs and the brief */
export const ARCS = {
  drop: { teach: [44, 52], remix: [282, 290] },
  steps: { test: [92, 100], remix: [226, 232], exam: [346, 352] },
  nest: { test: [112, 124], develop: [182, 196], exam: [326, 342] },
  span: { test: [146, 162], remix: [290, 304] },
  shrieker: { teach: [128, 150], develop: [186, 196], remix: [286, 300], exam: [316, 330] },
  updraft: { teach: [208, 216], develop: [258, 268] },
};
export const RK_RULE = "A HARPY'S DIVE BREAKS WHAT IT HITS.";

export function buildRookery({ painter, T, TS }) {
  const { W, H } = ROOKERY, r = y => y + 6;
  const L = painter(W, H), { set, block, ent } = L;
  const ground = (x0, x1, top) => block(x0, x1, r(top), H - 1);
  const air = (x0, x1, y0, y1) => { for (let y = r(y0); y <= r(y1); y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const plank = (x0, x1, y) => { for (let x = x0; x <= x1; x++) set(x, r(y), T.ONEWAY); };
  const wall = (x0, x1, y0, y1) => block(x0, x1, r(y0), r(y1));
  const sign = (x, y, text) => ent('sign', x, r(y), { text });
  const FLY = new Set(['harpy', 'crow', 'bat', 'shrieker']);   /* the wings over a squad stand ABOVE its floor on purpose (tools/sprinkle-cap.mjs: a perch) */
  const foe = (t, x, y, squad, o) => ent(t, x, r(y), Object.assign({ squad }, FLY.has(t) ? { perch: true } : {}, o || {}));
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, r(y)));
  const deco = (x, y, kind, v) => ent('deco', x, r(y), { kind, v: v || 0 });
  const hoists = [], nests = [];
  /* A CRACKED ROCK: id, its load, THE MARK `cleat` [x, y] (the cell a hero stands in), `x`/`top` the pillar / arm / slab drawn over it, `roost` [x, y] where its harpy
     lives (a harpy is placed there, bound to it: the roost sends another if she dies), and what it breaks (rows here are the level's, r() applied):
       { load: 'drop', clear: [x0, x1, y0, y1] }   { load: 'span'|'nest', span: [x0, x1, row] }   { load: 'steps', steps: [[x0, x1, row, 'S'|'O']] } */
  const KIND = { drop: 'crackfloor', span: 'crackpillar', nest: 'cracknest', steps: 'crackslab' };
  const crack = (id, o) => {
    const d = Object.assign({ id, cut: false }, o, { cleat: [o.cleat[0], r(o.cleat[1])], top: o.top !== undefined ? r(o.top) : undefined, roost: o.roost ? [o.roost[0], r(o.roost[1])] : null });
    if (d.clear) d.clear = [d.clear[0], d.clear[1], r(d.clear[2]), r(d.clear[3])];
    if (d.span) d.span = [d.span[0], d.span[1], r(d.span[2])];
    if (d.steps) d.steps = d.steps.map(([a, b, row, k]) => [a, b, r(row), k]);
    hoists.push(d); ent(KIND[d.load], d.cleat[0], d.cleat[1], { id });
    if (d.roost) ent('harpy', d.roost[0], d.roost[1] - 1, { squad: 'roost-' + id, rk: { rkRoost: id } });
    return d;
  };
  const shrieker = (x, y, squad) => ent('shrieker', x, r(y), { squad, perch: true });   /* THE HARPY SHRIEKER (src/rookery-hands.js; main.js spawns her with rkShriek) */
  const egg = (x, y) => nests.push([x, r(y)]);   /* a bone nest on a ledge (greybox, drawn by the hands): an egg cache - silver or coins sit in it */

  block(0, 0, 0, H - 1);                                                            /* the world's west edge */

  // ================= 1. THE GUANO LEDGES (0-106): TEACH =================
  ground(1, 26, 38);
  sign(5, 37, "THE ROOKERY. THE HARPIES NEST ON THESE CRAGS, UNDER THE ROC'S PEAK.");
  deco(9, 37, 'bones'); coins([8, 36], [12, 36], [16, 36]);
  plank(10, 14, 35); coins([11, 34], [13, 34]);
  foe('crow', 25, 33, 'edgeCrow');
  ground(27, 40, 36);                                                               /* a step up (two) */
  /* THE LONE HARPY (taught where a miss is cheap): block her dive and she is stunned on the rock */
  sign(28, 35, 'A CRAG HARPY DIVES IN A LINE. BLOCK IT, OR STEP ASIDE: SHE HITS THE ROCK.');
  foe('harpy', 35, 30, 'lone');
  coins([31, 35], [37, 35]); egg(39, 35);
  ground(41, 66, 34);                                                               /* the ledge under THE BUTTRESS */
  wall(55, 66, 12, 33);                                                             /* THE BUTTRESS: a crag face no one climbs (twenty-two rows) */
  air(44, 66, 38, 40);                                                              /* the old way under it, roofed over by the cracked floor */
  air(40, 43, 38, 40); ent('silver', 41, r(40));                                    /* SILVER ONE: the swallows' pocket off the way under (a dead end) */
  /* THE FIRST CRACK, SAFE (REQUIRED): the floor over the way under the buttress is split. Stand on the mark: its harpy screams and dives; step off and she
     breaks the floor. Nothing else is here: a miss costs a few hit points */
  sign(43, 33, "A HARPY'S DIVE BREAKS WHAT IT HITS.");
  sign(46, 33, 'THE FLOOR IS CRACKED. STAND ON THE MARK. WHEN SHE SCREAMS, STEP OFF.');
  crack('firstFloor', { load: 'drop', cleat: [49, 33], clear: [48, 50, 34, 37], roost: [53, 26] });
  coins([45, 39], [52, 39], [59, 39], [64, 39]);
  foe('bat', 61, 38, 'under');
  ground(67, 80, 41);                                                               /* THE GULLY: out from under the buttress */
  foe('fledgling', 72, 40, 'gully', { face: -1 }); foe('crow', 79, 36, 'gully');
  coins([69, 40], [75, 40]); deco(70, 40, 'bones', 1); egg(77, 40);
  plank(70, 75, 37); coins([71, 36], [74, 36]);
  ground(81, 84, 39); ground(85, 98, 37);                                           /* up out of the gully (two, two) */
  /* THE FIRST ROOST (the area's exam, REQUIRED): a cliff five rows high (no jump); a cracked slab over it. Bait her onto the mark at its foot: the slab slides
     down as two steps. A harpy over the ledge, a fledgling on it, a crow down the wind */
  ground(99, 116, 32);
  sign(86, 36, 'THE FIRST ROOST. A CRACKED SLAB HANGS OVER THE CLIFF.');
  crack('roostSlab', { load: 'steps', x: 97, top: 27, cleat: [95, 36], steps: [[96, 97, 35, 'S'], [98, 98, 33, 'S']], roost: [102, 28] });
  foe('harpy', 89, 31, 'firstRoost'); foe('fledgling', 91, 36, 'firstRoost', { face: -1 }); foe('crow', 104, 30, 'firstRoost');
  plank(86, 90, 34); coins([87, 33], [89, 33], [93, 36]);
  ent('check', 104, r(31));                                                         /* SHRINE ONE: the first roost is behind you */

  // ================= 2. THE NEST TERRACES (106-206): TEST - the nests, the shrieker, the pillar =================
  sign(107, 31, 'THE NEST TERRACES. THE HARPIES HANG THEIR NESTS OVER THE DROP.');
  foe('goat', 111, 31, 'terraceA', { face: -1 });
  /* THE FIRST NEST (REQUIRED): a bone nest hangs off a cracked arm over the chasm (ten wide: no jump). Bait her onto the mark on the lip: the arm goes, the nest
     drops - a platform halfway. A fall is a climb (boards up the west wall); the egg cache in the pit's hollow holds a silver */
  sign(112, 31, 'A NEST HANGS ON A CRACKED ARM. BAIT HER DIVE ONTO THE MARK UNDER IT.');
  crack('firstNest', { load: 'nest', x: 117, top: 25, cleat: [115, 31], span: [119, 124, 33], roost: [114, 24] });
  ground(117, 126, 43); plank(122, 124, 40); plank(118, 120, 37); plank(117, 118, 34);
  ground(127, 150, 32);
  air(127, 130, 40, 42); ent('silver', 129, r(42)); egg(128, 42);                    /* SILVER TWO: the egg cache under the far lip (a dead end) */
  /* THE SHRIEKER (the level's new foe): she screams and marks your spot, and every harpy near dives at it */
  sign(129, 31, 'A SHRIEKER MARKS YOUR SPOT, AND EVERY HARPY NEAR DIVES AT IT. GET OFF THE MARK.');
  shrieker(140, 23, 'shriekA'); foe('harpy', 134, 26, 'shriekA'); foe('harpy', 146, 27, 'shriekA');
  plank(132, 137, 28); plank(142, 147, 28); coins([133, 27], [136, 27], [143, 27], [146, 27]); egg(144, 27);
  coins([131, 31], [138, 31], [145, 31]);
  /* THE CRACKED PILLAR (REQUIRED): on the lip of the second chasm; bait a dive onto its foot - or let the shrieker mark you there - and it topples across */
  sign(146, 31, 'THE PILLAR IS CRACKED AT ITS FOOT. LET THEM DIVE AT YOU THERE.');
  crack('firstPillar', { load: 'span', x: 150, top: 23, cleat: [149, 31], span: [151, 160, 32], roost: [154, 25] });
  ground(151, 160, 43); plank(156, 158, 40); plank(152, 154, 37); plank(151, 152, 34);
  ground(161, 174, 32);
  foe('fledgling', 165, 31, 'terraceB', { face: -1 }); foe('fledgling', 169, 31, 'terraceB', { face: -1 }); foe('crow', 172, 27, 'terraceB');
  plank(163, 168, 29); coins([164, 28], [167, 28]); deco(171, 31, 'bones');
  ground(175, 185, 29);                                                             /* up three */
  /* THE EGG LEDGES (the area's exam, REQUIRED): a nest over the third chasm, a shrieker over it, crows down the wind */
  sign(176, 28, 'THE EGG LEDGES.');
  crack('eggNest', { load: 'nest', x: 186, top: 22, cleat: [184, 28], span: [188, 193, 30], roost: [182, 21] });
  ground(186, 195, 41); plank(191, 193, 38); plank(187, 189, 35); plank(186, 187, 32);
  shrieker(191, 19, 'eggLedges'); foe('crow', 196, 24, 'eggLedges'); foe('crow', 200, 26, 'eggLedges'); foe('goat', 200, 28, 'eggLedges', { face: -1 });
  ground(196, 214, 29);
  coins([178, 28], [181, 28], [190, 29], [198, 28]); egg(199, 28);
  ent('check', 203, r(28));                                                         /* SHRINE TWO: the egg ledges are behind you */

  // ================= 3. THE UPDRAFT CHIMNEYS (206-316): REMIX + A14 (the real platforming) =================
  sign(207, 28, 'THE UPDRAFT CHIMNEYS. THE UPDRAFTS BLOW ON A BEAT: RIDE ONE UP.');
  ent('vent', 213, r(28), { wind: true, period: 4, on: 2.4, h: 13 * TS, w: 20, lift: 270 });   /* THE FIRST CHIMNEY: up a face no jump climbs */
  ground(215, 230, 20);                                                             /* the narrow ledge (nine up) */
  foe('crow', 222, 15, 'chimney'); coins([212, 24], [212, 20], [217, 19]);
  /* THE SLAB ON THE NARROW LEDGE (REMIX, REQUIRED): the next face is six high; its cracked slab comes down as steps - baited on a ledge with nowhere to step but back */
  sign(218, 19, 'THE NEXT FACE HAS A CRACKED SLAB. BAIT HER HERE.');
  crack('ledgeSlab', { load: 'steps', x: 229, top: 9, cleat: [226, 19], steps: [[228, 229, 18, 'S'], [230, 230, 16, 'S']], roost: [224, 11] });
  ground(231, 250, 14);
  foe('troll', 240, 13, 'faceTop', { face: -1 }); foe('crow', 246, 9, 'faceTop');
  coins([233, 13], [237, 13], [244, 13], [249, 13]); egg(235, 13);
  /* THE WIND GAP (A14): pillars over the gully and one timed updraft to the high pillar; a diver and a crow string while you jump. A fall is a climb (the boards
     up the gully's west side) */
  sign(250, 13, 'THE WIND GAP. A FALL IS A LONG CLIMB.');
  ground(251, 278, 26);                                                             /* the gully floor below */
  plank(251, 253, 23); plank(252, 254, 20); plank(251, 253, 17);                   /* the climb back up */
  /* the stepping shelves: wind-cut rock ledges jutting off the pillars behind (one-way: the gully floor under them is one floor, walked back to the climb) */
  plank(255, 256, 16);                                                              /* shelf one (down two) */
  plank(260, 261, 15);                                                              /* shelf two (up one) */
  ent('vent', 264, r(25), { wind: true, period: 4.5, on: 2.6, h: 18 * TS, w: 20, lift: 270 });   /* the gully's updraft: from the floor to over shelf three (five over shelf two: no jump) */
  plank(267, 269, 10);                                                              /* shelf three: the high one (the updraft's) */
  plank(273, 275, 11);                                                              /* shelf four (down one) */
  foe('harpy', 263, 6, 'windGap'); foe('crow', 270, 5, 'windGap'); foe('crow', 276, 6, 'windGap');
  coins([256, 15], [261, 14], [264, 20], [264, 14], [268, 9], [275, 10]); ent('silver', 264, r(25));   /* SILVER THREE: on the gully floor under the updraft (the fall pays) */
  ground(278, 294, 10);
  /* THE BROKEN SPAN (REMIX, REQUIRED): a cracked pillar on the lip; a shrieker over it - her mark on you there brings every dive down on its foot */
  sign(280, 9, 'THE BROKEN SPAN. A SHRIEKER HANGS OVER IT: LET HER MARK YOU ON THE CRACK.');
  crack('spanPillar', { load: 'span', x: 294, top: 2, cleat: [292, 9], span: [295, 302, 10], roost: [289, 2] });
  shrieker(296, 1, 'brokenSpan'); foe('fledgling', 285, 9, 'brokenSpan', { face: -1 });
  ground(295, 302, 18); plank(297, 299, 15); plank(295, 296, 13);                   /* under the span: a shelf, ledges back up to the NEAR lip (a fall is a climb back) */
  /* THE CRACKED FLOOR on the span's far side (REMIX: optional): it drops you into the swallows' cave - coins, and the way back out up its chimney */
  ground(303, 322, 10);
  crack('caveFloor', { load: 'drop', cleat: [306, 9], clear: [305, 307, 10, 12], roost: [309, 3] });
  air(304, 309, 13, 15); coins([305, 15], [308, 15]); egg(304, 15); block(308, 309, r(14), r(15));   /* the swallows' cave (a step up out of it) */
  air(310, 311, 10, 12); plank(310, 311, 12);                                       /* its chimney out (a ledge in it) */
  coins([284, 9], [289, 9], [299, 9], [313, 9]);
  ent('check', 315, r(9));                                                          /* SHRINE THREE: the chimneys are behind you */

  // ================= 4. THE BONE STAIR (316-368): THE EXAM - every use at once, under the landmark =================
  sign(316, 9, "THE BONE STAIR. THE SISTERS' CRAG IS AT ITS TOP.");
  foe('troll', 320, 9, 'stairA', { face: -1 }); shrieker(324, 1, 'stairA'); foe('harpy', 318, 3, 'stairA');
  plank(317, 321, 6); coins([318, 5], [320, 5]);
  /* THE LAST NEST (REQUIRED) over the fourth chasm, under the shrieker */
  crack('lastNest', { load: 'nest', x: 323, top: 3, cleat: [322, 9], span: [325, 330, 11], roost: [327, 2] });
  ground(323, 332, 22); plank(328, 330, 19); plank(324, 326, 16); plank(323, 324, 13);
  ground(333, 352, 10);
  foe('goat', 337, 9, 'stairB', { face: -1 }); foe('crow', 342, 4, 'stairB'); foe('fledgling', 345, 9, 'stairB', { face: -1 });
  coins([335, 9], [339, 9], [343, 9]); deco(340, 9, 'bones', 1); egg(334, 9);
  /* THE TOP SLAB (REQUIRED): the last face, six high, its cracked slab over it */
  crack('topSlab', { load: 'steps', x: 351, top: -3, cleat: [348, 9], steps: [[349, 350, 8, 'S'], [351, 352, 6, 'S']], roost: [345, 0] });
  sign(346, 9, 'THE TOP SLAB.');
  ground(353, W - 1, 5);
  foe('harpy', 357, -1, 'summitDoor');
  coins([355, 4], [359, 4]);
  ent('check', 362, r(4));                                                          /* SHRINE FOUR: the summit's door */
  sign(366, 4, "THE SHRIEK SISTERS: BAIT A DIVE ONTO THE CRACKED ROCK. SHE LIES STUNNED IN IT.");

  /* THE WIND-CUT SHELVES: rock ledges jutting over the road (a second height, coins on them) - never where one would climb a cliff a crack is for */
  for (const [a, b, y] of [[3, 7, 33], [18, 23, 34], [29, 33, 32], [43, 47, 30], [77, 80, 34], [102, 107, 28], [110, 114, 28], [170, 173, 28], [177, 181, 25], [198, 202, 25], [205, 209, 25], [217, 221, 16], [236, 241, 10], [244, 248, 10], [281, 285, 6], [287, 290, 6], [305, 309, 6], [335, 340, 6], [356, 360, 1]]) { plank(a, b, y); ent('coin', Math.round((a + b) / 2), r(y - 1)); }

  // ================= 5. THE SISTERS' CRAG (370-411): THE SHRIEK SISTERS =================
  /* The summit: a flat crag top, guano-white, three CRACKED SLABS in its floor (the opening: a dive baited onto one stuns the diving sister in the rubble -
     src/shriek-sisters.js), two rock shelves three rows up at its ends, THE ROC'S PEAK beyond it */
  const [A0, A1] = ROOKERY.arena, FL = r(ROOKERY.floor - 6);
  plank(A0 + 3, A0 + 7, FL - 3); plank(A1 - 7, A1 - 3, FL - 3);
  ent('torch', A0 + 1, FL - 1); ent('torch', A1 - 1, FL - 1);
  ent('shrieksisters', A0 + 21, FL - 1);
  block(W - 1, W - 1, 0, H - 1);                                                    /* the world's east edge */

  const arena = { x0: A0 * TS, x1: (A1 + 1) * TS, floor: FL * TS, y0: (FL - 9) * TS, trigger: (A0 + 5) * TS, wallL: A0 - 1, wallR: A1 + 1, boss: 'shrieksisters', music: 'boss2', tint: '#c8c0d8', tintA: 0.07,
    /* THE CRACKED SLABS (src/shriek-sisters.js geom): tile columns of each slab's middle */
    slabs: [A0 + 8, A0 + 21, A1 - 8] };
  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: r(37) }, pools: [], falls: [],
    arena, rookery: true, hoists, rkNests: nests,
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 240,                  /* four shrines, one closing each area's exam (A10c): src/level.js checkpoints() must not fill between them */
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    squadBands: [{ lo: 400, hi: W - 1, spots: 0, why: "THE SISTERS' CRAG: columns 400-415 are the boss's summit - no squad stands in a boss arena" }],
    unlocks: [
      { kind: 'hoists', opens: "a cracked rock breaks under a harpy's dive: a floor gives way, a pillar falls across, a nest drops as a platform, a slab slides down as steps", hud: "HER DIVE BREAKS THE ROCK" },
    ],
    duskStart: -1, duskLen: 1, music: 'northumberland', night: false, glowNight: false,
    interiors: [],
    palette: { sky: [[150, 160, 196], [232, 222, 214]], far: 'crag', mid: 'crag', near: 'none', dress: 'crag', noNear: true, haze: 'rgba(236,232,240,0.15)', grass: '#7a7a5a', grassL: '#a8a488', grassD: '#4e4e3a', dirt: '#8a8478', dirtL: '#b4ae9f', dirtD: '#5e594f', canopy: ['#6a6a7a', '#8a8a9a', '#b0b0be', '#e0e0e8'] },
    weather: [{ x0: 0, x1: 99999, kind: 'wind' }],
    ambient: [{ x0: 0, x1: 99999, kind: 'wind' }],
    tints: [[-24, 106, [210, 205, 225], 0.06], [106, 206, [205, 200, 220], 0.07], [206, 316, [200, 200, 225], 0.07], [316, 368, [215, 195, 210], 0.08], [368, W + 24, [220, 190, 205], 0.09]],
    reachExact: false,
  };
}
