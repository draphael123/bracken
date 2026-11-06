// src/siren-rocks.js - SIREN ROCKS (claude/sirenrocks, the OPUS GREYBOX of the level, 2026-11-06; scratch/plan-water-1105.md section 1 item 4 + section 3b + section 4,
// the water arc pulled forward 11-06 with Daniel's OK; the concept brief scratch/brief-sirenrocks-1024.md, Daniel 10-24 07:55 - the 11-05 plan wins where they differ).
// A NEW level, built from nothing. OFF THE ROAD until its art pass merges and the browser proofs run (art before live): an APPENDED, HIDDEN row in src/level.js
// (no map node, not on the demo list; dev only ?level=sirenrocks). SR_SHIPS is the road switch: false = the live game is unchanged (the row is hidden, nothing
// moves). Its place when it ships (plan Q1 rec): the main road REEF -> SIREN ROCKS -> FLOTILLA, through src/route-insert.js's table (claude/greatdune; not on this
// base - the row to add is in the lane report).
//
// THE RULE (L.rule): THE SONG PULLS YOU.
//   A SINGING STONE (a pearl-veined standing stone on wet black rock) sings on a TOLD cycle: SILENT (the release window) -> HUM (the tell: it glows, the notes gather,
//     a nudge at 15%) -> SONG (it pulls everything in its reach TO it: a hero, a foe, a thrown thing). The pull is THE PULL FIELD (src/pull-field.js, kind 'toward',
//     in the air too): jump a gap too wide to jump WHILE IT SINGS and the song carries you over to the stone. Time the release: a song that ends while you are over
//     the surf drops you in it (the surf carries you back to a kelp net: never a soft-lock, Salt & Sanctuary's cost is the climb back).
//   STRIKE A STONE and it shatters SILENT for a while (SR.quiet s, told before it sings again): a silenced stretch is plain ground - a shaft you can drop down, a bridge
//     you can walk. THE SONG TAKES THEM TOO: a foe standing in a song is carried into the surf. THE NAGA (the one new foe) is never moved: it coils to the rock.
//   The tide (THE TIDE KIT, src/tide-kit.js) runs THE WRECK COVE (pumice rafts ride it; a TIDE BELL calls it in) and floods THE COILED SPIRE in the Naga Queen's phase two.
//   BLOWHOLES: the surf booms in the rock and spouts on a told cycle - stand over one when it spouts and it throws you up a chimney.
//
// FIVE NAMED AREAS (TEACH -> TEST -> REMIX -> EXAM -> BOSS). Columns; rows: smaller is higher. Ledges stand on row 28. START + TWO shrines (fewer checkpoints, Daniel).
//      0-99   THE SINGING SHORE  TEACH: two songs over the surf (the second down a step), a dive under the rock for a silver
//    100-189  THE HUSH           TEST: a song over THE SHAFT hauls you past the way down - break it and drop; the grotto (the NAGA GUARD taught alone); a BLOWHOLE up
//                                the chimney; a song that takes the brute off his ledge; SHRINE ONE
//    190-289  THE WRECK COVE     REMIX: two songs in a chain over the cove (a stack between them), THE WRECK the sirens took (mast + crow's nest silver, a hold the tide
//                                floods), pumice rafts on the tide (ring the TIDE BELL), THE HOLDING SONG - a stone that sings you BACK along the urchin bridge into a naga
//    290-351  THE CHOIR          EXAM: four songs over open surf in a rhythm, a naga on the landing stack, a siren's rock under the last gap; SHRINE TWO; a blowhole
//    352-397  THE COILED SPIRE   THE NAGA QUEEN (src/naga-queen.js): two singing stones on the shelves; P2 the tide comes in and she sings from the water
// Foes: sirens (lead), merrow (spearfisher, caller, brute), crab, petrel, THE NAGA GUARD (new, src/naga-guard.js). NO GOBLINS. Timber only where it IS a ship (the wreck).
export const SR_SHIPS = false;   /* (the road switch: flip with the art pass - plan Q1 rec, route-insert row in the lane report) */
export const SR = { W: 410, H: 40, BED: 38, LEDGE: 28, SEA: 33, AS: 352, AE: 397, AF: 30, quiet: 8, quietArena: 9 };
export const SR_RULE = 'THE SONG PULLS YOU. JUMP WHILE A STONE SINGS AND IT CARRIES YOU OVER. STRIKE IT AND IT FALLS SILENT.';
export const SECTIONS = [['THE SINGING SHORE', 0, 99], ['THE HUSH', 100, 189], ['THE WRECK COVE', 190, 289], ['THE CHOIR', 290, 351], ['THE COILED SPIRE', 352, 409]];
/* THE RULE'S ARC in columns (TAUGHT, TESTED, REMIXED, EXAMINED) - read by tools/siren-rocks.mjs */
export const ARCS = {
  song: { teach: [15, 29], test: [148, 163], remix: [187, 214], exam: [287, 342] },
  hush: { teach: [103, 114], test: [148, 163], remix: [252, 284], exam: [352, 397] },
  naga: { teach: [113, 135], test: [168, 176], remix: [226, 280], exam: [309, 315] },
};
export const SR_SIGNS = {
  lore: 'SIREN ROCKS. THE SHIPS THAT CAME THIS WAY FOR THE SINGING NEVER LEFT. THE NAGA QUEEN COILS ON HER SPIRE AT THE END OF IT.',
  stone: 'A SINGING STONE. WHEN IT SINGS IT PULLS YOU TO IT. JUMP WHILE IT SINGS: IT CARRIES YOU OVER. IT HUMS FIRST.',
  surf: 'FALL SHORT AND THE SURF CARRIES YOU BACK. CLIMB THE KELP.',
  step: 'THIS ONE SINGS YOU DOWN A STEP. WAIT FOR ITS HUM.',
  dive: 'SOMETHING GLINTS UNDER THE ROCK.',
  hush: 'STRIKE A STONE AND IT FALLS SILENT FOR A WHILE. SILENT, IT PULLS NOTHING.',
  shaft: 'THE WAY ON IS DOWN THE SHAFT. WHILE IT SINGS IT TAKES YOU PAST IT. WAIT FOR ITS SILENCE, OR BREAK IT, AND DROP.',
  naga: 'A NAGA GUARD. THE SONG NEVER MOVES IT: IT COILS TO THE ROCK. ! A GUARD TURNS ITS SPEAR. !! JUMP ITS LUNGE.',
  blowhole: 'A BLOWHOLE. THE SEA BOOMS IN THE ROCK, THEN IT SPOUTS. STAND OVER IT WHEN IT BOOMS.',
  brute: 'THE SONG TAKES THEM TOO. LET IT TAKE THE BRUTE OFF HIS LEDGE.',
  chain: 'TWO STONES, TWO SONGS. LAND ON THE STACK, WAIT FOR THE NEXT ONE.',
  wreck: 'THE SIRENS TOOK THIS ONE. HER HOLD FLOODS WHEN THE TIDE IS IN.',
  bell: 'THE RAFTS RIDE THE TIDE. RING THE BELL AND IT COMES IN NOW.',
  hold: 'THIS STONE SINGS YOU BACK. IT WILL NOT LET YOU CROSS. BREAK IT.',
  choir: 'THE CHOIR. FOUR STONES, ONE AFTER ANOTHER. KEEP TIME.',
  boss: 'THE NAGA QUEEN. HER SONG RINGS IN THE STONES: BREAK ONE WHILE SHE SINGS AND THE SONG BREAKS ON HER.',
};
/* A SONG's cycle (src/pull-field.js): off = THE RELEASE WINDOW, tell = the hum (>= 1 s, lint), on = the song. STRONG = px/s at the core (a 'rip' by the kit's
   classes: you do not walk out of a song - you break the stone or wait for its silence) */
export const SONG = { off: 2.2, tell: 1.5, on: 2.6, strength: 200 };
export const SONG_COL = '#e2c8ff', SONG_TELL = '#8a70b0';
/* THE COVE'S TIDE (the kit): seconds per phase; warn + turn are the tells */
export const COVE = { low: 5, warn: 2.5, rise: 2.5, high: 6, turn: 2, fall: 2.5 };
/* A BLOWHOLE's cycle: quiet -> boom (the tell) -> spout (throws whoever is over it: vy = SPOUT.vy) */
export const SPOUT = { quiet: 2.6, boom: 1.2, spout: 0.7, vy: -560, w: 1 };

export function buildSirenRocks({ painter, T, TS }) {
  const { W, H, BED } = SR;
  const L = painter(W, H), { set, block, ent, plat } = L;
  const fill = (x0, x1, y0, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, v); };
  const air = (x0, x1, y0, y1) => fill(x0, x1, y0, y1, T.AIR);
  const net = (x, y0, y1) => fill(x, x, y0, y1, T.NET);   /* KELP (art owed: kelp ropes down wet rock) */
  const rock = (x0, x1, top) => block(x0, x1, top, BED - 1);
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const coins = (...pts) => pts.forEach(([x, y]) => ent('coin', x, y));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const rigBands = [], stones = [], pulls = [], blowholes = [], bridges = [], currents = [], movers = [], floats = [], pools = [];
  /* A SINGING STONE at x, y (y = the row it stands in) and its SONG: a 'toward' field whose eye is the stone, whose reach is [x0..x, y0..y1] (it begins a couple of
     columns before the launch lip). o.phase delays its first song (a chain keeps time); o.cycle overrides SONG; o.on = the float it rides */
  const stone = (id, x, y, reach, o = {}) => {
    stones.push({ id, x, y, on: o.on || null, arena: !!o.arena, quiet: o.quiet || SR.quiet });
    ent('singstone', x, y, { id });
    if (!reach) return;
    const c = o.cycle || SONG, [x0, y0, y1] = reach;
    pulls.push({ id, kind: 'toward', at: [x, y - (o.eyeUp ?? 1)], box: [x0, y0, x, y1], strength: o.strength || SONG.strength, curve: 'ease', water: false,
      ...(o.always ? {} : { cycle: { off: c.off, tell: c.tell, on: c.on }, firstPh: 'off', firstT: c.off + (o.phase || 0) }), weight: { hero: 1, foe: 0.6, shot: 0.6 }, col: SONG_COL, tellCol: SONG_TELL, song: true });
    /* the reach model: a song crossing is a ride from the lip to the stone (src/reachcore.js reads it as a band of footing - the game's pull is not modelled) */
    if (o.ride !== false) { const from = o.from ?? x0 + 1; let fr = 0; while (fr < H - 1 && L.grid[fr * W + from] !== T.SOLID) fr++; bridges.push([from, x, Math.min(fr, y + 1), Math.max(fr, y + 1)]); }   /* both ends: the launch rock's floor and the stone's */
  };
  /* THE SURF between two rocks: a drift back to the kelp on the rock you jumped from (every gap has a way out) */
  const surf = (id, x0, x1, y0 = 29, dir = -1) => { currents.push({ id, x: x0, x0, x1 }); pulls.push({ id, kind: 'current', box: [x0, y0, x1, BED - 1], dir: [dir, 0], strength: 36, curve: 'flat' }); };
  const blowhole = (id, x, y, top) => { blowholes.push({ id, x, y, top }); ent('blowhole', x, y, { id }); bridges.push([x - 1, x + 1, top, y + 1]); };
  /* A PUMICE RAFT (a float of the tide kit: grey-white volcanic stone, it floats - no timber): rides `tide` between rest row and top */
  const pumice = (id, x0, x1, rest, top) => { floats.push({ id, x0, x1, y: rest, top, free: 4 }); rigBands.push([x0, x1, top + 1, rest]);   /* (the reach model: a ride between its high and low stops, both footing - water1's swell boats) */
    movers.push({ kind: 'pumice', sr: 'float', fid: id, tide: 'cove', x: x0 * TS, x0: x0 * TS, x1: x0 * TS, y: (top + 1) * TS - 4, w: (x1 - x0 + 1) * TS, h: 8 }); };

  /* the sea bed under everything */
  block(0, W - 1, BED, H - 1);

  // ================= 1. THE SINGING SHORE (0-99): TEACH THE SONG =================
  rock(0, 16, 28);                                                       /* the landing rock: you come ashore here */
  sign(2, 27, SR_SIGNS.lore); sign(6, 27, SR_RULE);
  coins([9, 27], [12, 27]);
  sign(14, 27, SR_SIGNS.stone);
  net(17, 29, BED - 1); surf('surf1', 17, 26);                          /* gap one, 10 wide: too wide to jump */
  rock(27, 46, 28);
  stone('st1', 29, 27, [15, 21, 30]);                                    /* TEACH: one stone, nothing else */
  sign(31, 27, SR_SIGNS.surf);
  block(36, 39, 26, 27); foe('siren', 38, 25);                           /* a sea stack on the rock, a siren on it: her own song walks you to her */
  coins([33, 27], [37, 25]);
  foe('merrowspear', 43, 27);
  net(47, 29, BED - 1); surf('surf2', 47, 49);                          /* a plain gap: three wide, a jump */
  rock(50, 62, 27);                                                      /* two rows up */
  coins([53, 26], [58, 26]); foe('crab', 57, 26);
  sign(61, 26, SR_SIGNS.step);
  net(63, 28, BED - 1); surf('surf3', 63, 73);                          /* gap two, 11 wide, landing a step down */
  foe('petrel', 68, 22, { fly: true });
  rock(74, 104, 28);
  stone('st2', 76, 27, [60, 20, 29], { phase: 1.2 });
  /* SECRET ONE: dive in gap two and swim under the rock - a pocket under it (water: the sea's pool reaches under the rock), a silver at its end */
  air(74, 81, 35, 36); ent('silver', 80, 36); coins([77, 36]);
  sign(72, 25, SR_SIGNS.dive);
  block(88, 93, 26, 27); foe('merrowcaller', 91, 25, { squad: 'shore-caller' }); foe('merrowspear', 86, 27, { squad: 'shore-caller' });                    /* a raised shelf, a caller on it (ranged + he calls the others) */
  coins([84, 27], [90, 25], [96, 27]);
  foe('merrowspear', 99, 27, { squad: 'shore-caller' });   /* THE CALLER'S SPEARS: a designed squad - he calls them in */

  // ================= 2. THE HUSH (100-189): TEST - BREAK A STONE =================
  sign(101, 27, SR_SIGNS.hush);
  /* THE SHAFT (105-110): open from the sky to the grotto floor (row 36). The stone on THE ROOF (111-122) sings over it and hauls you past it */
  block(105, 110, 36, BED - 1);
  rock(111, 122, 28); air(111, 122, 30, 35);                             /* the roof over the grotto: rows 28-29 */
  block(123, 127, 12, BED - 1); air(123, 127, 30, 35);                   /* THE CLIFF: no way over it, only under */
  stone('st3', 114, 27, [103, 20, 31], { cycle: { off: 1.6, tell: 1.5, on: 4.5 }, ride: false });   /* a jump in its song lands on the roof (a pocket); step off in its silence - or break it - and the shaft is a plain fall */
  sign(116, 27, SR_SIGNS.shaft);
  coins([118, 27], [121, 27]); foe('merrowspear', 120, 27);
  /* THE GROTTO (105-150, rows 30-35, floor 36): dry, dark; THE NAGA GUARD taught alone */
  rock(128, 151, 28); air(128, 150, 30, 35);
  sign(112, 35, SR_SIGNS.naga);
  foe('nagaguard', 124, 35);
  coins([117, 35], [131, 35], [136, 35]);
  foe('crab', 139, 35, { face: 1 });
  /* THE BLOWHOLE up the chimney (145-147 through the roof): the only way out of the grotto, and it never stops */
  air(145, 147, 28, 29); blowhole('bh1', 146, 35, 26);
  sign(142, 35, SR_SIGNS.blowhole);
  /* the roof west of the chimney (128-144): a pocket the blowhole lands you next to - coins, a merrow */
  coins([131, 27], [135, 27]); foe('merrowspear', 133, 27, { face: 1 });
  /* THE BRUTE ON THE LIP: the next stone's song takes him into the surf if you let it */
  sign(141, 27, SR_SIGNS.brute);
  foe('merrowbrute', 149, 27, { face: -1 });
  net(152, 29, BED - 1); surf('surf4', 152, 160);
  /* THE HEADLAND (161-189): up the rock in two-row steps to its crown (row 20), the shrine on it, and down to the cove's lip */
  rock(161, 166, 28); rock(167, 170, 26); rock(171, 174, 24); rock(175, 178, 22); rock(179, 183, 20); rock(184, 186, 23); rock(187, 189, 26);
  stone('st4', 163, 27, [147, 21, 30]);
  foe('nagaguard', 165, 27, { squad: 'hush-court' });
  foe('merrowcaller', 182, 19, { squad: 'hush-court' });   /* a naga and a caller over him on the crown: the Queen's court on the shore */
  blowhole('bh2', 168, 25, 16); plat(163, 17, 4); coins([164, 16], [165, 16]);   /* a second blowhole: a ledge out over the surf (a pocket) */
  coins([162, 27], [173, 23], [185, 22]);
  ent('check', 180, 19);                                                  /* SHRINE ONE, on the headland's crown */

  // ================= 3. THE WRECK COVE (190-289): REMIX =================
  sign(188, 27, SR_SIGNS.chain);
  net(190, 29, BED - 1); surf('surf5', 190, 198); net(203, 30, BED - 1); surf('surf5b', 203, 210);
  rock(199, 202, 29);                                                    /* THE STACK between the songs */
  stone('ca', 200, 28, [186, 22, 31]);
  stone('cb', 214, 26, [200, 20, 30], { phase: 3.1 });                   /* its song comes as the first one's ends */
  /* THE WRECK (212-240): a hull the sirens put on the rocks (a ship: tarred, barnacled - the one timber here). Deck row 27. Her hold floods at high tide */
  rock(211, 240, 27); air(216, 236, 29, 33); fill(230, 230, 27, 28, T.NET);   /* the hold, down the hatch (a net) */
  sign(215, 26, SR_SIGNS.wreck);
  net(224, 13, 26); plat(222, 12, 5); ent('silver', 224, 11);            /* SECRET TWO: up her mast to the crow's nest */
  coins([223, 11], [226, 11]);
  foe('merrowspear', 220, 26); foe('nagaguard', 233, 33);               /* a naga in her hold */
  coins([219, 33], [226, 33]);
  ent('tidebell', 238, 26);                                              /* THE TIDE BELL on her stern (a verb of the kit) */
  sign(236, 26, SR_SIGNS.bell);
  foe('siren', 239, 26);
  net(241, 28, BED - 1); surf('surf6', 241, 251);
  pumice('pm1', 243, 245, 35, 29); pumice('pm2', 248, 249, 35, 29);   /* at high tide a hop each; at low the rock is a wall */
  /* THE URCHIN BAY (262-282) under a rock bridge, and THE HOLDING STONE on its west end singing you BACK */
  rock(252, 261, 28); rock(283, 289, 28);
  block(262, 282, 28, 29); air(262, 282, 30, 36); air(266, 267, 28, 29); air(276, 277, 28, 29);   /* two holes in the bridge: the bay under it */
  net(266, 28, 36); foe('crab', 271, 36);   /* kelp up through the first hole */
  stone('hs', 256, 27, [252, 22, 30], { cycle: { off: 2.0, tell: 1.5, on: 3.5 }, ride: false });
  pulls[pulls.length - 1].box = [252, 22, 284, 30];                     /* (its reach runs EAST of it, over the bridge: it sings you back to it) */
  sign(258, 27, SR_SIGNS.hold);
  foe('nagaguard', 272, 27);                                             /* anchored mid-bridge: the song drags you into his spear */
  foe('petrel', 268, 21, { fly: true });
  coins([264, 27], [278, 27]);
  foe('merrowbrute', 286, 27);

  // ================= 4. THE CHOIR (290-351): EXAM =================
  sign(288, 27, SR_SIGNS.choir);
  net(290, 29, BED - 1); surf('surf7', 290, 299); net(304, 30, BED - 1); surf('surf7b', 304, 310); net(315, 28, BED - 1); surf('surf7c', 315, 323);
  net(328, 29, BED - 1); surf('surf7d', 328, 332); net(335, 32, BED - 1); surf('surf7e', 335, 336);   /* every stack in the surf has kelp on the side the surf runs to */
  rock(300, 303, 29); rock(311, 314, 27); rock(324, 327, 28); rock(333, 334, 31);
  stone('c1', 301, 28, [286, 22, 31]);
  stone('c2', 313, 26, [300, 19, 30], { phase: 2.1 });
  stone('c3', 325, 27, [312, 20, 31], { phase: 4.2 });
  stone('c4', 339, 27, [324, 21, 31], { phase: 6.3 });
  foe('nagaguard', 311, 26, { face: -1 });                               /* the exam stack is held */
  foe('petrel', 306, 22, { fly: true }); foe('petrel', 320, 19, { fly: true });
  foe('siren', 333, 30);                                                  /* her rock under the last gap: her song is not the stone's */
  rock(337, 351, 28);
  blowhole('bh3', 349, 27, 18); plat(345, 19, 4); ent('silver', 346, 18);   /* SECRET THREE: the blowhole on the landing, a ledge over the spire's door */
  sign(343, 27, SR_SIGNS.boss);
  ent('check', 346, 27);                                                  /* SHRINE TWO: the boss door */

  // ================= 5. THE COILED SPIRE (352-397): THE NAGA QUEEN =================
  const AS = SR.AS, AE = SR.AE, AF = SR.AF;
  block(AS, AE, AF, BED - 1);                                            /* the arena floor, row 30 */
  block(AS, 358, 27, AF - 1); block(359, 359, 29, AF - 1);               /* THE WEST SHELF (top 27) and its step */
  block(391, AE, 27, AF - 1); block(390, 390, 29, AF - 1);               /* THE EAST SHELF and its step */
  stone('A1', 355, 26, null, { arena: true, quiet: SR.quietArena }); stone('A2', 394, 26, null, { arena: true, quiet: SR.quietArena });
  ent('nagaqueen', 375, AF - 1, { face: -1 });
  rock(AE + 1, W - 1, 28);
  ent('gate', 404, 27);

  pools.push({ id: 'sea1', x0: 0, x1: 105 * TS, y: SR.SEA * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, sr: true });
  pools.push({ id: 'sea2', x0: 152 * TS, x1: 190 * TS, y: SR.SEA * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, sr: true });
  pools.push({ id: 'cove', x0: 190 * TS, x1: 290 * TS, y: 35 * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, sr: true });
  pools.push({ id: 'sea3', x0: 290 * TS, x1: 352 * TS, y: SR.SEA * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, sr: true });
  pools.push({ id: 'spire', x0: AS * TS, x1: (AE + 1) * TS, y: 31 * TS, base: BED * TS, bottom: BED * TS, swim: true, sea: true, clear: true, sr: true, arenaTide: true });

  /* THE TIDES (src/tide-kit.js; kept under L.srTides, not L.tides, so a second generic wiring - claude/water1's - never steps them twice: see the lane report) */
  const tides = [
    { id: 'cove', pools: ['cove'], lo: 35, hi: 30, cycle: COVE, rate: 1, safe: 'low', grace: 4, floats, verbs: [{ t: 'bell', x: 238, y: 26 }],
      floods: [{ x0: 216, y0: 29, x1: 236, y1: 33 }], foes: { crab: 'low', nagaguard: 'swim' } },
    /* THE SPIRE: a chamber the Queen floods in her phase two (manual: src/naga-queen.js drives it - no lever) */
    { id: 'spire', mode: 'manual', pools: ['spire'], lo: 31, hi: 28, cycle: { rise: 2.5 }, boss: true },
  ];
  const sections = SECTIONS.map(([name, x0, x1]) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, '-'), name, x0, x1 }));

  return {
    W, H, grid: L.grid, ents: L.ents, START: { x: 3, y: 27 }, pools, falls: [], moversExtra: movers,
    music: 'reef', night: false, rule: SR_RULE, sirenRocks: true,
    srStones: stones, srPulls: pulls, srTides: tides, srBlowholes: blowholes, srCurrents: currents, cableBridges: bridges, rigBands,
    sections,
    palette: { set: 'reef', sky: 'storm', far: 'reef', mid: 'reef', near: 'reef', fg: 'reef', dress: 'reef', haze: 'rgba(120,90,170,0.14)',   /* violet dusk (art owed: its own kit) */
      grass: '#4a4058', grassL: '#6a5a80', grassD: '#2e2838', dirt: '#2a2830', dirtL: '#46424e', dirtD: '#18161c', canopy: ['#2a2240', '#3a2e56', '#4a3c6a', '#6a5a88'] },
    ambient: [{ x0: 0, x1: 99999, kind: 'shore' }],
    tints: [[0, 189, [170, 140, 220], 0.10], [190, 289, [150, 120, 200], 0.14], [290, 351, [110, 90, 170], 0.20], [352, 410, [80, 60, 140], 0.24]],
    arena: { x0: AS * TS, x1: (AE + 1) * TS, floor: AF * TS, y0: 14 * TS, trigger: (AS + 3) * TS, wallL: AS - 1, wallR: AE + 1, boss: 'nagaqueen', music: 'boss2', tint: '#3a2a5a', tintA: 0.1, fx: 'motes',
      shelves: [[AS, 359], [390, AE]], floorX: [360 * TS, 390 * TS], stones: ['A1', 'A2'], tide: 'spire' },
  };
}

/* THE LEVEL'S OWN CHECKS (tools/siren-rocks.mjs): every song's stone stands on rock; every song reach starts before a lip and ends at its stone; every surf gap has kelp
   on the rock you came from and a current to it; the shrines are few. -> [problems] */
export function lintSirenRocks(L, T) {
  const bad = [], at = (x, y) => L.grid[y * L.W + x];
  const solid = (x, y) => at(x, y) === T.SOLID;
  for (const s of L.srStones) { if (!solid(s.x, s.y + 1) && !s.on) bad.push('stone ' + s.id + ' does not stand on rock'); if (at(s.x, s.y) !== T.AIR) bad.push('stone ' + s.id + ' is buried'); }
  for (const f of L.srPulls.filter(f => f.song)) { const s = L.srStones.find(q => q.id === f.id); if (!s) { bad.push('song ' + f.id + ' has no stone'); continue; }
    if (f.box[2] < s.x - 2) bad.push('song ' + f.id + ' ends before its stone'); if (f.box[1] > s.y || f.box[3] < s.y) bad.push('song ' + f.id + ' does not reach its stone\'s row'); }
  for (const c of L.srCurrents) { const f = L.srPulls.find(q => q.id === c.id); const kelp = f.dir[0] < 0 ? c.x0 : c.x1;
    let n = 0; for (let y = f.box[1]; y <= f.box[3]; y++) if (at(kelp, y) === T.NET) n++; if (n < 3) bad.push('surf ' + c.id + ' carries you to col ' + kelp + ' with no kelp to climb'); }
  const checks = L.ents.filter(e => e.t === 'check').length; if (checks > 2) bad.push(checks + ' shrines (Daniel: fewer)');
  return bad;
}
