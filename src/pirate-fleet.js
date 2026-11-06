// src/pirate-fleet.js - THE PIRATE FLEET (claude/water1, the OPUS GREYBOX of the level, 2026-11-05; scratch/plan-water-1105.md section 1 item 3 + section 5 lane A
// "THU 11-12 OPUS Pirate Fleet + Freebooter", Daniel approved 11-05 14:56; the concept interview scratch/brief-piratefleet.md !! 10-12 07:40, all recs).
// A HIDDEN level off THE FLOTILLA (the Freebooter's own sea). OFF THE ROAD: hidden row in src/level.js, no map node, dev only (?level=piratefleet) until its art pass
// merges and the browser proofs run (art before live). THE FREEBOOTER (src/freebooter-boss.js, his hands src/freebooter-hands.js) is its boss.
//
// THE RULE (L.rule): THE SWELL + GRAPPLE.
//   THE SWELL is THE TIDE KIT (src/tide-kit.js) run fast: a told cycle (low -> warn: the foam runs white and the hulls creak -> rise -> high -> turn -> fall). It moves the
//     open SEA (pool 'sea') and every SWELL BOAT riding it (a float of the kit: tarred hull, no loose logs). Two swells run against each other ('swell' and 'swellB',
//     first 'high'): two boats side by side meet at the same height only twice a cycle. The deck of a boat at HIGH swell is a short jump under a hull's deck; at LOW it is
//     a wall you cannot jump. GAPS OPEN AND CLOSE WITH THE SWELL. The storm stretch has its own faster, bigger swell ('storm' / 'stormB', rate 1.3).
//   THE GRAPPLE is the verb: strike a GRAPPLE WINCH and its line flies to a PRIZE riding out at sea (drawn small in the background, not footing); the winch hauls her in
//     ALONGSIDE (into the play plane, ~2 s, told) and she rides the swell there. A hauled prize stays hauled (a mark, through death and reload). A winch can stand on a
//     bobbing boat (the remix) - its line flies from where the boat is.
//   THE SEA is THE PULL FIELD (src/pull-field.js): fall in and a CURRENT carries you back to the hull you left (a NET down its side: the way out, always - no soft-lock).
//     TEACH a drift, TEST a channel that runs with the swell (west on the rise, east on the fall), REMIX THE SINKING PRIZE (a whirl where she went down - mast-stump
//     posts to hold, a release window to swim out, a silver in its eye), EXAM a rip under the storm's prize (anchor chains to hold, a release window).
//
// FIVE NAMED AREAS (TEACH -> TEST -> REMIX -> EXAM). Columns; rows: smaller is higher. Low hulls stand on row 30. START + TWO shrines (fewer checkpoints, Daniel).
//      0-96   THE FLEET'S WAKE    TEACH THE SWELL: one boat (board at high), two boats on two swells, a drift back to the net
//     97-196  THE GRAPPLE         TEACH THE GRAPPLE (a prize hauled alongside from a hull) / TEST (from a stern castle, a channel current, grapnel boarders) / SHRINE ONE
//    197-296  THE SINKING PRIZE   REMIX: the winch on a bobbing longboat, the whirl where the prize went down, the powder hulk (a deck gun, monkeys), the captain's cabin
//    297-378  THE STORM SWELL     EXAM: a 3-ship hop at storm swell, a grapple over the rip, two storm boats on two swells, SHRINE TWO
//    379-439  THE FREEBOOTER'S FLAGSHIP  THE FREEBOOTER (his deck, then his sloop hauled alongside - two decks on the swell)
// Foes: pirates only (cutlass, pistoleer marine, bosun, netter, grapnel boarder, powder monkey). NO NEW FOE (plan: "none"). NO GOBLINS. Timber only where it IS a ship.
export const PF = { W: 440, H: 44, BED: 41, DECK: 30, AS: 380, AW: 52 };
export const PF_RULE = 'THE SWELL LIFTS THE BOATS: BOARD WHEN SHE RISES. STRIKE A WINCH AND HAUL A SHIP ALONGSIDE.';
export const SECTIONS = [["THE FLEET'S WAKE", 0, 96], ['THE GRAPPLE', 97, 196], ['THE SINKING PRIZE', 197, 296], ['THE STORM SWELL', 297, 378], ["THE FREEBOOTER'S FLAGSHIP", 379, 439]];
/* the rule's arc in COLUMNS - TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/pirate-fleet.mjs */
export const ARCS = {
  swell: { teach: [19, 26], test: [51, 62], remix: [197, 228], exam: [297, 364] },
  grapple: { teach: [94, 110], test: [148, 164], remix: [198, 216], exam: [320, 338] },
  current: { teach: [19, 26], test: [151, 164], remix: [217, 227], exam: [323, 338] },
};
export const PF_SIGNS = {
  lore: "THE FREEBOOTER'S FLEET RIDES OPEN SEA OFF THE FLOTILLA. NO LASHINGS OUT HERE: ONLY THE SWELL.",
  swell: 'THE SWELL LIFTS THE BOAT. WAIT FOR HER TO RISE, THEN JUMP UP ONTO THE NEXT DECK. WHITE FOAM: SHE IS COMING UP.',
  two: 'TWO BOATS, TWO SWELLS. THEY MEET AT ONE HEIGHT TWICE A SWELL: CROSS THEN.',
  net: 'FALL IN AND THE SEA CARRIES YOU BACK. CLIMB THE NET.',
  grapple: 'A GRAPPLE WINCH. STRIKE IT: ITS LINE TAKES THE PRIZE OUT THERE AND HAULS HER ALONGSIDE.',
  channel: 'THE CHANNEL RUNS WITH THE SWELL: BACK ON THE RISE, ON WITH THE FALL.',
  boarders: 'THEIR BOARDERS WAIT ON THE NEXT DECK. CUT THEM OFF THEIR LINES.',
  longboat: 'HER LONGBOAT CARRIES A WINCH. STRIKE IT FROM THE BOAT, WHATEVER THE SWELL IS DOING.',
  sinking: 'THE PRIZE WENT DOWN HERE. HER WATER PULLS YOU ROUND AND DOWN: HOLD A MAST STUMP, SWIM OUT WHEN IT SLACKS.',
  hulk: 'THE POWDER HULK. HER DECK GUN CLEARS HER DECK: STRIKE THE BREECH.',
  storm: 'THE STORM SWELL. FASTER, AND TWICE THE HEIGHT.',
  rip: 'A RIP UNDER THE PRIZE. HOLD AN ANCHOR CHAIN, OR WAIT FOR IT TO SLACK.',
  boss: 'THE FREEBOOTER. HIS PISTOL GOES THROUGH ANY GUARD - THEN HE MUST RELOAD.',
};
/* THE SWELL (src/tide-kit.js): seconds per phase; warn + turn are the tells (>= 1.5 s at the rate - lintTide) */
export const SWELL = { low: 2.2, warn: 1.6, rise: 1.3, high: 2.4, turn: 1.6, fall: 1.3 };
export const STORM = { low: 2.0, warn: 2.1, rise: 1.6, high: 2.0, turn: 2.1, fall: 1.6, rate: 1.3 };

export function buildPirateFleet({ painter, T, TS }) {
  const { W, H, BED, DECK } = PF;
  const L = painter(W, H), { set, block, ent, plat } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const net = (x, y0, y1) => fill(x, x, y0, y1, T.NET);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const movers = [], floatsBy = { swell: [], swellB: [], storm: [], stormB: [] }, prizes = [], winches = [];
  /* A HULL: x0..x1 with its deck on row `deck`, solid to the sea bed (a hull in the play plane is a wall to swim round, not under). The NET hangs down its EAST side
     (the side you came from): the current carries a swimmer back to it */
  const hull = (x0, x1, deck = DECK, o = {}) => { block(x0, x1, deck, BED - 1); if (o.net !== false) net(x1 + 1, deck + 1, BED - 1); };
  /* A MAST: shrouds (a net) from the deck to its top, a fighting top to stand on */
  const mast = (x, top, deck = DECK, topW = 3) => { fill(x, x, top + 1, deck - 1, T.NET); plat(x - Math.floor(topW / 2), top, topW); ent('deco', x, deck - 1, { kind: 'mastTall', v: x % 2 }); };
  /* A SWELL BOAT (a float of the tide kit): x0..x1, rides `tide` between rest row `rest` (low) and `top` (high). The mover's y is its HIGH deck (the reach model reads
     the crossing the swell makes) and src/pirate-fleet-hands.js moves it with the kit every frame */
  const boat = (id, tide, x0, x1, rest = 35, top = 31) => { floatsBy[tide].push({ id, x0, x1, y: rest, top, free: 4 });
    movers.push({ kind: 'swellboat', pf: 'float', fid: id, tide, x: x0 * TS, x0: x0 * TS, x1: x0 * TS, y: (top + 1) * TS - 4, w: (x1 - x0 + 1) * TS, h: 8 }); };
  /* A PRIZE: a float that rides out at sea until a GRAPPLE WINCH hauls her ALONGSIDE (into the play plane at x0..x1); boss: true = the Freebooter hauls her himself */
  const prize = (id, tide, x0, x1, rest = 35, top = 31, o = {}) => { floatsBy[tide].push({ id, x0, x1, y: rest, top, free: 4 }); prizes.push({ id, tide, x0, x1, ...o });
    movers.push({ kind: 'prize', pf: 'prize', fid: id, tide, x: x0 * TS, x0: x0 * TS, x1: x0 * TS, y: (top + 1) * TS - 4, w: (x1 - x0 + 1) * TS, h: 8, boss: !!o.boss }); };
  /* A GRAPPLE WINCH at x on feet row y (or riding a boat: on = float id, x = its column on that boat) - what it hauls */
  const winch = (id, x, y, hauls, on) => { winches.push({ id, x, y, hauls, on: on || null }); ent('grapplewinch', x, y, { id, hauls, on: on || undefined }); };
  const pools = [];

  /* the sea bed under everything; past the end there is nowhere to fall */
  block(0, W - 1, BED, H - 1);
  pools.push({ id: 'sea', x0: 0, x1: 290 * TS, y: 35 * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, pf: true });
  pools.push({ id: 'storm', x0: 290 * TS, x1: 378 * TS, y: 36 * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, pf: true, storm: true });
  pools.push({ id: 'sea2', x0: 378 * TS, x1: W * TS, y: 35 * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, pf: true });

  // ================= 1. THE FLEET'S WAKE (0-96): TEACH THE SWELL =================
  hull(0, 18);                                                    /* THE FLOTILLA'S LAST HULL: you come aboard here */
  sign(2, 29, PF_SIGNS.lore); sign(6, 29, PF_RULE);
  ent('deco', 10, 29, { kind: 'coiledCable', v: 0 }); ent('deco', 14, 29, { kind: 'kegStack' });
  coins([9, 29], [12, 29], [16, 29]);
  sign(17, 29, PF_SIGNS.swell);
  boat('b1', 'swell', 21, 24);                                    /* TEACH: one boat, nothing on it. Board her at high; at low the cutter's side is a wall */
  coins([22, 30], [23, 30]);
  hull(27, 50);                                                   /* THE CUTTER */
  sign(28, 29, PF_SIGNS.net);
  foe('cutlass', 36, 29); foe('cutlass', 45, 29);
  mast(40, 19); ent('silver', 40, 18); coins([41, 18]);   /* SILVER: the cutter's fighting top */ ent('deco', 40, 12, { kind: 'pennant', v: 0 });
  sign(49, 29, PF_SIGNS.two);
  boat('b2', 'swell', 53, 56); boat('b3', 'swellB', 58, 61);      /* TEST: two boats on two swells */
  coins([54, 30], [59, 30]); foe('petrel', 57, 25);   /* a gull-petrel over the boats: it stoops while you wait on the swell */
  hull(63, 96);                                                   /* THE SLOOP-O'-WAR */
  ent('cannon', 66, 29, { deck: true, aim: 1 });                  /* her bow chaser down her own deck: strike the breech, the shot clears her men */
  foe('cutlass', 72, 29); foe('netter', 76, 29);
  mast(80, 20); foe('marine', 80, 19, { cnSkin: 'pistoleer' });
  coins([70, 29], [78, 29], [82, 29]);
  block(84, 92, 26, 29); air(86, 90, 27, 29); net(85, 26, 29);   /* (the hatch: a net through her roof) */    /* her deckhouse: in through the roof hatch (the net), a silver in it */
  plat(82, 28, 2); ent('silver', 89, 29); coins([87, 29]);   /* (a step up onto her deckhouse roof) */

  // ================= 2. THE GRAPPLE (97-196): TEACH THE GRAPPLE, TEST =================
  sign(93, 29, PF_SIGNS.grapple);
  winch('g1', 95, 29, 'p1');                                      /* TEACH: a winch on a hull, a prize riding out there */
  prize('p1', 'swell', 98, 108);
  coins([100, 30], [103, 30], [106, 30]); foe('petrel', 104, 24);
  hull(111, 150);                                                 /* THE BRIGANTINE */
  foe('cutlass', 118, 29); foe('bosun', 126, 29);
  mast(132, 18); foe('marine', 132, 17, { cnSkin: 'pistoleer' }); coins([131, 17], [133, 17]);
  block(140, 150, 26, 29);                                        /* her stern castle (four rows up), a stair of steps to it */
  plat(137, 28, 2); plat(138, 27, 2);
  coins([139, 25], [143, 25]);
  ent('silver', 150, 15); plat(149, 16, 2); mast(146, 16, 26, 1);  /* SILVER: up her mizzen from the castle, out on its yard */
  sign(141, 25, PF_SIGNS.channel);
  winch('g2', 148, 25, 'p2');                                     /* TEST: from the castle, over a channel that runs with the swell */
  prize('p2', 'swellB', 152, 162);
  coins([155, 30], [159, 30]); foe('petrel', 158, 24);
  hull(165, 196);                                                 /* THE GALLEON'S WAIST */
  sign(166, 29, PF_SIGNS.boarders);
  mast(176, 20, DECK, 3);
  foe('grapnel', 172, 29); foe('grapnel', 181, 29);
  block(186, 196, 25, 29); plat(183, 28, 2); plat(184, 27, 2);   /* her quarterdeck, five rows up: the shrine on it */
  foe('powdermonkey', 189, 24);
  coins([169, 29], [178, 29], [185, 26]);
  ent('check', 194, 24);                                          /* SHRINE ONE */

  // ================= 3. THE SINKING PRIZE (197-296): REMIX =================
  sign(196, 24, PF_SIGNS.longboat);
  boat('L1', 'swell', 198, 203);                                  /* her longboat, and a winch on it */
  winch('g3', 202, 0, 'p3', 'L1');
  prize('p3', 'swellB', 206, 215);
  sign(214, 29, PF_SIGNS.sinking);
  boat('b8', 'swell', 218, 221); boat('b9', 'swellB', 224, 227);  /* over the whirl: two boats on two swells */
  coins([219, 30], [225, 30]); foe('petrel', 210, 26); foe('petrel', 224, 25);
  ent('silver', 222, 39);                                         /* SILVER: in the eye of the sinking - dive it in the release window */
    hull(229, 262);                                                 /* THE POWDER HULK */
  sign(230, 29, PF_SIGNS.hulk);
  ent('cannon', 232, 29, { deck: true, aim: 1 });
  foe('cutlass', 240, 29); ent('keg', 248, 29); foe('powdermonkey', 245, 29); foe('powdermonkey', 252, 29);
  coins([236, 29], [243, 29], [250, 29]);
  block(254, 262, 26, 29); air(255, 260, 27, 29); net(258, 26, 29);   /* her captain's cabin under the quarterdeck: down the hatch */
  plat(252, 28, 2); plat(253, 27, 1);
  ent('silver', 256, 29); coins([257, 29], [259, 29]);            /* SILVER: THE CAPTAIN'S CABIN */
  boat('b10', 'swell', 264, 267); boat('b11', 'swellB', 269, 271);
  coins([265, 30], [270, 30]); foe('petrel', 268, 25);
  hull(273, 296);                                                 /* THE GUN BRIG */
  block(283, 288, 19, 29); net(282, 18, 29);                     /* her GREAT CABIN, stacked three decks high: up her shrouds and over it (the rigging's band) */
  foe('marine', 286, 18, { cnSkin: 'pistoleer' }); coins([284, 18], [287, 18]);
  foe('bosun', 292, 29); foe('cutlass', 278, 29);
  coins([276, 29], [290, 29], [294, 29]);

  // ================= 4. THE STORM SWELL (297-378): EXAM =================
  sign(295, 29, PF_SIGNS.storm);
  boat('s1', 'storm', 299, 303, 36, 30);
  hull(307, 322);                                                 /* EXAM DECK ONE */
  foe('cutlass', 312, 29); foe('cutlass', 316, 29); mast(314, 21); foe('marine', 314, 20, { cnSkin: 'pistoleer' });
  sign(319, 29, PF_SIGNS.rip);
  winch('g4', 321, 29, 'p4');
  prize('p4', 'storm', 324, 336, 36, 30);
    hull(339, 352);                                                 /* EXAM DECK TWO */
  foe('powdermonkey', 342, 29); foe('sapper', 345, 29, { cnSkin: 'kegroller' });
  block(348, 352, 25, 29); plat(346, 28, 1); plat(347, 27, 1);   /* her forecastle */
  foe('bosun', 350, 24);
  coins([341, 29], [349, 24]);
  boat('s2', 'storm', 355, 358, 36, 30); boat('s3', 'stormB', 360, 363, 36, 30);
  coins([356, 30], [361, 30]); foe('petrel', 359, 24);
  hull(365, 378, DECK, { net: false });                           /* THE FREEBOOTER'S TENDER (no net: his flagship's wall is the next thing east) */
  sign(367, 29, PF_SIGNS.boss);
  ent('check', 373, 29);                                          /* SHRINE TWO */
  coins([369, 29], [376, 29]);

  // ================= 5. THE FREEBOOTER'S FLAGSHIP (379-439): THE BOSS =================
  /* his deck 380-411 (32 tiles), the sea gap 412-415, HIS SLOOP 416-431 (riding swellB out at sea until phase two: he hauls her alongside himself) */
  const AS = PF.AS, AR = DECK;
  hull(379, 411, AR, { net: false });
  ent('deco', AS + 8, AR - 1, { kind: 'mastTall', v: 0 }); ent('deco', AS + 22, AR - 1, { kind: 'mastTall', v: 1 }); ent('deco', AS + 28, AR - 1, { kind: 'wheel' });
  ent('freebooter', AS + 24, AR - 1, { face: -1 });
  prize('fbsloop', 'swellB', 416, 431, 35, 31, { boss: true });
  hull(433, W - 1, AR, { net: false }); net(432, AR + 1, BED - 1);
  ent('gate', 437, 29); ent('deco', 436, 12, { kind: 'pennant', v: 1 });

  const tides = [
    { id: 'swell', pools: ['sea', 'sea2'], lo: 35, hi: 32, cycle: SWELL, rate: 1, safe: 'low', grace: 3, floats: floatsBy.swell },
    { id: 'swellB', pools: [], lo: 35, hi: 32, cycle: SWELL, rate: 1, first: 'high', firstT: SWELL.high, safe: 'high', grace: 3, floats: floatsBy.swellB },
    { id: 'storm', pools: ['storm'], lo: 36, hi: 31, cycle: STORM, rate: STORM.rate, safe: 'low', grace: 3, floats: floatsBy.storm },
    { id: 'stormB', pools: [], lo: 36, hi: 31, cycle: STORM, rate: STORM.rate, first: 'high', firstT: STORM.high / STORM.rate, safe: 'high', grace: 3, floats: floatsBy.stormB },
  ];
  const pulls = [
    { id: 'wake1', kind: 'current', box: [19, 31, 26, 40], dir: [-1, 0], strength: 36, curve: 'flat' },
    { id: 'wake2', kind: 'current', box: [51, 31, 62, 40], dir: [-1, 0], strength: 36, curve: 'flat' },
    { id: 'grapple1', kind: 'current', box: [97, 31, 110, 40], dir: [-1, 0], strength: 44, curve: 'ease' },
    { id: 'channel', kind: 'current', box: [151, 31, 164, 40], dir: [1, 0], strength: 64, curve: 'ease', tide: 'swell', phases: { warn: -1, rise: -1, high: -1, turn: 1, fall: 1, low: 1 } },
    { id: 'longboat', kind: 'current', box: [197, 31, 205, 40], dir: [-1, 0], strength: 36, curve: 'flat' },
    { id: 'sinking', kind: 'whirl', ring: [222, 37, 5], strength: 140, curve: 'edge', swirl: 0.6, cycle: { off: 3, tell: 1.5, on: 4 }, posts: [[218, 35], [226, 35]], col: '#d8eef0' },
    { id: 'brig', kind: 'current', box: [263, 31, 272, 40], dir: [-1, 0], strength: 40, curve: 'flat' },
    { id: 'storm1', kind: 'current', box: [297, 30, 306, 40], dir: [-1, 0], strength: 48, curve: 'flat' },
    { id: 'rip', kind: 'current', box: [323, 30, 338, 40], dir: [-1, 0], strength: 110, curve: 'ease', cycle: { off: 2.5, tell: 1.5, on: 4 }, posts: [[328, 33], [333, 33]] },
    { id: 'storm2', kind: 'current', box: [353, 30, 364, 40], dir: [-1, 0], strength: 44, curve: 'flat' },
  ];
  /* a winch riding a boat: its feet row is the boat's (filled at draw time) - give the static ent the boat's high deck row for the tools */
  for (const w of winches) if (w.on) { const f = Object.values(floatsBy).flat().find(q => q.id === w.on); if (f) { w.y = f.top; const e = L.ents.find(q => q.t === 'grapplewinch' && q.id === w.id); if (e) e.y = f.top; } }

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 29 }, pools, falls: [], moversExtra: movers,
    music: 'flotilla', night: false, rule: PF_RULE, pirateFleet: true, tides, pulls, pfPrizes: prizes, pfWinches: winches,
    sections: SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 })),
    palette: { set: 'ship', sky: 'harbour', far: 'harbour', mid: 'harbour', near: 'harbour', fg: 'rig', dress: 'ship', haze: 'rgba(170,200,230,0.08)',
      grass: '#8a9a5a', grassL: '#b4c47a', grassD: '#5a6a3a', dirt: '#6a5a44', dirtL: '#9a8464', dirtD: '#43382a', canopy: ['#2a4a44', '#3a5e54', '#4a7264', '#6a8a70'] },
    ambient: [{ x0: 0, x1: 99999, kind: 'ship' }],
    tints: [[0, 196, [200, 220, 255], 0.06], [197, 296, [214, 170, 120], 0.10], [297, 378, [70, 80, 120], 0.22], [379, 440, [40, 40, 90], 0.25]],
    arena: { x0: AS * TS, x1: (AS + PF.AW) * TS, floor: AR * TS, y0: (AR - 18) * TS, trigger: (AS + 3) * TS, wallL: AS - 1, wallR: AS + PF.AW, boss: 'freebooter', music: 'boss2', tint: '#2a2a5a', tintA: 0.08, fx: 'motes',
      start: [AS + 6, AR - 1], deck: [AS, 411], gap: [412, 415], sloop: [416, 431], sloopId: 'fbsloop' },
  };
}
