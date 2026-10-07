// src/minecart.js - THE DEEP RAILS, the side road off THE ORE ROAD (claude/minecart, the OPUS GREYBOX: geometry, the cart rule, the encounters, the
// wiring). Brief: .claude/briefs/the-minecart-brief.md (scratch/brief-minecart.md) after .claude/briefs/the-minecart-concept.md (its DANIEL INTERVIEW
// 2026-10-07 section rules). The runtime is src/minecart-hands.js (the cart, the points, the hazards, the goblin carts); the boss is src/great-drill.js.
//
// THE RULE: YOU RIDE THE WHOLE WAY. THROW THE POINTS TO PICK YOUR LINE; LEFT BRAKES, RIGHT BOOSTS.
// ALL CART, start to finish (Donkey Kong Country). The cart IS the hero's movement in this level: it cruises on its own (MC.cruise), RIGHT held
// boosts it (to MC.boost), LEFT held brakes it (to a stop), JUMP jumps it, DOWN ducks into the tub, DOWN + JUMP drops through to the line below.
// THE VERB is THROW THE POINTS: a LEVER beside the line before every fork - a blow, or E as you pass. OPEN points drop you to the low line;
// SET points keep you on the high one. Each lever's disc shows which (an arrow), and the fork itself is drawn open or set.
// THE THREE MECHANICS (each REQUIRED somewhere; THE EXAM combines all three):
//   SWITCH TRACKS  told forks (risk / reward), a hidden lever in the roof, forks whose default line is FALLEN IN (a crash puts you back before the lever)
//   SPEED          crushers on a told cycle, timed gates with a gauge, falling rock (dust and a shadow first), long gaps only a boosted jump clears
//   CART COMBAT    goblin archers and casters (EXISTING types) riding carts on a parallel line: knock them off, or jump into their cart and it is yours
// THE COLLECTIBLE: ten ORE NUGGETS on the risky lines (L.quest: 8 open THE SMELTER's points - a silver, no relic). 3 silvers in all.
//
// SECTIONS (columns; the line starts at row 30 and climbs and drops on slopes and trestles):
//   0-169    THE LOADING YARD   TEACH    a gap (jump), a beam (duck), THE BOOST GAP, THE FIRST CRUSHER (brake), THE FIRST POINTS (required: the low line is fallen in)
//   170-309  THE SWITCHBACKS    TEST     fork A (high: ore and gaps / low: a crusher and a gate), THE HIDDEN LEVER (a spur to silver one), the first rockfall
//   310-469  THE GOBLIN LINE    TEST     goblin carts on the parallel line: an archer, a caster, a slow cart on your own line, the pair; a brute; its exam (real deaths)
//   470-609  THE CAVE-IN        SET PIECE the roof comes down behind you (src/chase.js); rock on both lines; a boost gap; the fork thrown at speed
//   610-764  THE CRUSHER WORKS  REMIX    crusher runs, a timed gate, a tippler over a boost gap, an archer pacing you; the high line pays silver two
//   765-899  THE EXAM           EXAM     the points under the archer and the caster, a crusher or a gate, a boosted gap with a rune on its lip, a goblin cart to take
//   900-959  THE SMELTER        the points that want 8 ore (silver three); THE BORE, the drill's own tunnel (it sets him up)
//   960-981  THE GREAT DRILL    BOSS     src/great-drill.js (a CONSTRUCT: its cab always hittable; route a loaded ore cart into its gears)
import { stageDrill, DRILL_STAGE } from './great-drill.js';

/* THE CART (px/s, px/s/s): cruise on its own, boost held, brake held (to a stop). A cruising jump flies ~6 tiles, a boosted one ~9 (JUMPV -320, GRAV 1000:
   0.64 s in the air) - the boost gaps are 9 wide: a cruising jump falls in, a boosted one clears (tools/minecart-route.mjs measures both) */
export const MC = {
  cruise: 150, boost: 230, accUp: 260, accCruise: 220, brake: 340,
  fallCost: 0.27,       /* a fall outside an exam: this share of max health, and back on the rail ~1.5 s behind (A10 amended) */
  retryBack: 128,       /* px behind the lip a fall puts you back (room to boost up to speed again) */
  crashDmg: 14, crashCd: 0.7, wallDmg: 18,
  crushDmg: 30, rockDmg: 22, beamDmg: 14, gateDmg: 14,
  arrowDmg: 13, arrowV: 230, runeDmg: 18, runeT: 1.25, runeR: 15,
  archerTell: 0.7, archerCd: 2.1, casterTell: 0.6, casterCd: 2.8,
  leverReach: 30,
  reverse: 70, reverseAfter: 0.35, softCrash: 100,   /* LEFT held at a stop rolls you back at this; a wall met slower than softCrash is a bump */
  treadBack: 100, treadAcc: 520,   /* THE DRILL's bore: held brake drifts you back at most this fast; the pace eases this quick (the hold is a skill, not a fight with the cart) */       /* px: E (or a blow) throws a lever this close */
};
export const BOOST_GAP = 9;   /* columns */

/* THE CART'S SPEED one step: keys { boost, brake }; arena: the treadmill (src/great-drill.js), which only moves the world, not this */
export function cartSpeed(v, keys, dt) {
  if (keys.brake) return Math.max(0, v - MC.brake * dt);
  if (keys.boost) return v < MC.boost ? Math.min(MC.boost, v + MC.accUp * dt) : Math.max(MC.boost, v - MC.brake * dt);
  return v < MC.cruise ? Math.min(MC.cruise, v + MC.accCruise * dt) : Math.max(MC.cruise, v - MC.accCruise * 0.6 * dt);
}

export const MINE = { W: 1000, H: 52, base: 30 };   /* (the line climbs to row 20 and drops to row 36: five height bands) */
export const SECTIONS = [['THE LOADING YARD', 0], ['THE SWITCHBACKS', 170], ['THE GOBLIN LINE', 310], ['THE CAVE-IN', 470], ['THE CRUSHER WORKS', 610], ['THE EXAM', 765], ['THE SMELTER', 900], ['THE GREAT DRILL', 960]];
/* each mechanic's arc (columns): TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/minecart.mjs */
export const ARCS = {
  points: { teach: [118, 160], test: [186, 256], remix: [566, 600], exam: [776, 800], boss: [960, 981] },   /* the fallen-in low line; fork A; the fork at speed in the cave-in; the exam's fork; the ore points */
  speed: { teach: [52, 112], test: [210, 240], remix: [612, 700], exam: [800, 870], boss: [960, 981] },      /* the boost gap and the first crusher; fork A's low line; the works; the exam */
  combat: { teach: [316, 360], test: [380, 440], remix: [690, 740], exam: [770, 850], boss: [960, 981] },    /* the archer, the caster; the slow cart and the pair; the pacer in the works; the exam's pair */
};
export const ARENA_X = 960;

export function buildMinecart({ painter, T, TS }) {
  const { W, H } = MINE;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const track = [], points = [], crushers = [], gates = [], rocks = [], beams = [], walls = [], exams = [], boosts = [], decor = [], interiors = [], trestles = [];
  /* THE GROUND (track on it: the hands draw the rail along every span) and the ELEVATED LINES (one-way rail on trestles: jump up through, down + jump to drop) */
  const ground = (x0, x1, top) => { block(x0, x1, top, H - 1); track.push([x0, x1, top]); };
  const rail = (x0, x1, row, o) => { for (let x = x0; x <= x1; x++) set(x, row, T.RAIL); track.push([x0, x1, row, 'rail']); if (!(o && o.noPosts)) trestles.push([x0, x1, row]); };
  const upG = (x, top) => { set(x, top - 1, T.SLOPE_R2A); set(x + 1, top - 1, T.SLOPE_R2B); block(x, x + 1, top, H - 1); };
  const dnG = (x, top) => { set(x, top, T.SLOPE_L2B); set(x + 1, top, T.SLOPE_L2A); block(x, x + 1, top + 1, H - 1); };
  const rise = (x, top, n) => { for (let i = 0; i < n; i++) upG(x + i * 2, top - i); track.push([x, x + n * 2 - 1, top - n, 'slope']); return top - n; };
  const fall = (x, top, n) => { for (let i = 0; i < n; i++) dnG(x + i * 2, top + i); track.push([x, x + n * 2 - 1, top, 'slope']); return top + n; };
  const ore = (x, y) => ent('stray', x, y, { kind: 'orenugget' });
  /* THE POINTS: a lever at (lx, row) beside the line; `tiles` are the rail the points lay or take away. dflt: 'open' (no rail: you drop to the low line)
     or 'set' (rail: you stay high). The grid is built SET (the static tools read every line as reachable); src/minecart-hands.js lays the default on load.
     ore: the lever will not move until you carry that many ore; hidden: a lever up in the roof (a jump and a blow); retry: where a crash into a fall-in
     past it puts you back */
  const lever = (id, lx, row, x0, x1, prow, dflt, o) => { const tiles = []; for (let x = x0; x <= x1; x++) { tiles.push([x, prow]); set(x, prow, T.ONEWAY); }   /* (built as one-way boards: the reach model drops through them; the hands lay RAIL or nothing) */
    points.push(Object.assign({ id, x: lx, row, tiles, dflt, x0, x1, prow }, o || {})); ent('mcpoints', lx, row - 1, { id }); };
  const crusher = (id, x, row, period, down, phase, w = 2) => { crushers.push({ id, x, w, row, period, down, phase }); ent('mccrusher', x, row - 1, { id }); };
  const gate = (id, x, row, period, open, phase) => { gates.push({ id, x, row, period, open, phase }); ent('mcgate', x, row - 1, { id }); };
  const rock = (id, trig, x, row, o) => { rocks.push(Object.assign({ id, trig, x, row, delay: 1.0, w: 2 }, o || {})); ent('mcrock', x, row - 1, { id }); };
  const beam = (x0, x1, row) => { beams.push({ x0, x1, row }); ent('mcbeam', x0, row - 1, {}); };
  /* a FALL-IN across the line: rubble from the rail up, a crash into it puts you back at retry */
  const fallIn = (x, row, retry) => { block(x, x + 1, row - 2, row - 1); walls.push({ x, y0: row - 2, y1: row - 1, retry }); decor.push({ kind: 'fallin', x, row }); };   /* (two rows: a line three rows over it runs on) */
  const gap = (x0, x1) => air(x0, x1, 0, H - 1);
  const boostGap = (x0, row) => { gap(x0, x0 + BOOST_GAP - 1); boosts.push({ x0, x1: x0 + BOOST_GAP - 1, row }); ent('mcgap', x0, row - 1, { w: BOOST_GAP }); };
  /* a GOBLIN ON A CART (an EXISTING foe: 'archer' or 'gobmage'): it waits off the screen until you pass `trig`, then rolls in on its line (`row`) and keeps
     `off` px from you (+ ahead / - behind). slow: a cart rolling at that pace on YOUR line, ahead (a hazard and a platform). until: its line ends there */
  const rider = (t, trig, row, off, o) => { const x = o && o.at !== undefined ? o.at : trig + Math.round(off / TS); ent(t, x, row - 1, { face: -1, ride: Object.assign({ row, off, trig }, o || {}) }); ent('mcgobcart', x, row - 1, {}); };
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const station = (x, y = B - 1) => ent('check', x, y);

  // ================= 1. THE LOADING YARD (0-172), row 30: TEACH, where a failure is cheap =================
  let B = 30;
  ground(0, 13, B);
  sign(3, B - 1, 'THE DEEP RAILS. YOU RIDE THE WHOLE WAY: LEFT BRAKES, RIGHT BOOSTS.');
  sign(9, B - 1, 'A GAP: JUMP. THE CART JUMPS WITH YOU.');
  gap(14, 16);                                                             /* THE FIRST SCREEN ASKS: a 3-wide gap (any pace clears it) */
  ground(17, 40, B); rail(17, 24, B - 3);
  sign(21, B - 1, 'A LOW BEAM: HOLD DOWN TO DUCK INTO THE TUB.');
  beam(27, 28, B);
  foe('miner', 36, B - 1, { squad: 'yardMiner' });                         /* the first crew: strike him as you pass, jump him, or crash */
  { const t = rise(41, B, 2); ground(45, 60, t);                           /* (row 28) */
    sign(50, t - 1, 'A LONG GAP WANTS SPEED: HOLD RIGHT TO BOOST, THEN JUMP AT THE LIP.');
    foe('bat', 57, t - 5, { squad: 'yardBat' });
    boostGap(61, t);                                                        /* THE BOOST GAP (REQUIRED): 9 wide - a cruising jump falls in */
    ore(65, t - 4);                                                          /* (high over it: the top of a boosted arc) */
    ground(70, 88, t);
    foe('miner', 80, t - 1, { squad: 'yardMiner2' });
    fall(89, t, 2); }
  ground(93, 113, B); foe('bat', 110, B - 5, { squad: 'yardBat3' }); rail(93, 100, B - 3);
  sign(95, B - 1, 'A CRUSHER: HOLD LEFT TO BRAKE. GO UNDER WHEN IT LIFTS.');
  crusher('first', 104, B, 2.6, 1.0, 0);                                   /* THE FIRST CRUSHER (REQUIRED): brake for it */
  { const t = rise(114, B, 4);                                              /* up onto the trestle: the high line at row 26 */
    rail(122, 168, t);
    sign(116, t - 1, 'POINTS AHEAD. STRIKE THE LEVER, OR PRESS E, TO SET THEM AND STAY HIGH.');
    lever('yard', 125, t, 128, 139, t, 'open', { label: 'THE LOW LINE IS FALLEN IN', retry: [118, t - 1], req: true });
    ground(122, 151, B - 1); fallIn(150, B - 1, [118, t - 1]);             /* under it: the low line (row 29) runs into the fall-in */
    for (let x = 140; x <= 149; x++) set(x, t, T.SOLID);                    /* (the trestle is rock over the last ten: a tunnel - the low line's end is a dead end, and it pays) */
    ent('mend', 147, B - 2); ent('coin', 145, B - 2); ent('coin', 146, B - 2); ent('coin', 148, B - 2); ent('coin', 149, B - 2);
    rail(70, 88, 25); for (const x of [74, 78, 82]) ent('coin', x, 24);      /* a jump-up line over the hump */
    station(144, t - 1);                                                    /* STATION ONE, on the high line past the points */
    foe('bat', 158, t - 3, { squad: 'yardBat2' }); foe('miner', 136, t - 1, { squad: 'yardTrestle' });
    rise(169, t, 1); ground(171, 172, t - 1); }                            /* on up to row 25 at 171 */

  // ================= 2. THE SWITCHBACKS (171-311), row 25: fork A, the hidden lever, the first rock =================
  B = 25;
  ground(173, 189, B); rail(175, 189, B - 3); ent('coin', 180, B - 4); ent('coin', 184, B - 4);
  block(184, 188, B - 6, B - 6); foe('tippler', 186, B - 7, { squad: 'swTip' });   /* a tippler on his ledge over the line: his stream is told */
  { const t = rise(190, B, 4);                                              /* FORK A: up to the high line (row 21) */
    ground(198, 262, B);                                                    /* the low line under it: slow and told */
    rail(198, 217, t); rail(222, 231, t); rail(236, 252, t);                /* the high line: gaps, ore, a bat, an archer at its end */
    sign(196, t - 1, 'FORK: THE HIGH LINE IS QUICK AND HAS ORE. THE LOW LINE IS SLOW AND SAFE.');
    lever('forkA', 199, t, 202, 213, t, 'open', { label: 'HIGH: QUICK, ORE / LOW: SAFE' });
    ore(220, t - 3); foe('bat', 228, t - 4, { squad: 'forkABat' }); ore(234, t - 3); foe('bat', 206, t - 4, { squad: 'forkABat2' });
    foe('archer', 246, t - 1, { squad: 'forkAArcher' });
    crusher('forkA', 214, B, 2.4, 0.9, 0.6);
    gate('forkA', 238, B, 3.2, 1.5, 0);
    foe('miner', 226, B - 1, { squad: 'forkAMiner' }); }
  ground(263, 279, B); ground(308, 313, B); rail(253, 262, B - 3);
  station(268);                                                             /* STATION TWO */
  foe('sapper', 274, B - 1, { squad: 'hidSapper' });
  /* THE HIDDEN LEVER: up in the roof over the line (a jump and a blow). It opens the points in the line itself - down into THE OLD SPUR (silver one), a
     working seven rows under the line that climbs back up to it on a steep ramp (the line over the spur is one-way rail: no head is cracked on it) */
  block(272, 284, B - 7, B - 6); decor.push({ kind: 'roof', x0: 272, x1: 284, row: B - 7 });
  lever('hidden', 276, B - 5, 280, 284, B, 'set', { hidden: true, hang: true, label: 'A LEVER IN THE ROOF' });   /* (it hangs from the roof: a full jump's blow reaches it) */
  rail(285, 307, B, { noPosts: true });
  block(280, 300, B + 7, H - 1); track.push([280, 300, B + 7]); interiors.push([280, 307, B + 1, B + 6, 'spur']);
  { let tt = B + 7; for (let i = 0; i < 7; i++) { set(301 + i, tt - 1, T.SLOPE_R1); block(301 + i, 301 + i, tt, H - 1); tt--; } track.push([301, 307, B, 'slope']); }
  ore(286, B + 6); ent('silver', 296, B + 6); foe('miner', 291, B + 6, { squad: 'spurMiner' });
  sign(304, B - 1, 'DUST FALLS BEFORE THE ROCK. BRAKE OR BOOST OFF ITS SHADOW.');
  rock('first', 306, 312, B);                                               /* THE FIRST ROCKFALL (taught alone) */

  // ================= 3. THE GOBLIN LINE (314-469), row 25: cart combat =================
  ground(314, 451, B);
  station(316);                                                             /* STATION THREE */
  rail(320, 446, B - 3);                                                    /* the parallel line: three rows up, one-way (jump up to it, down + jump to come down) */
  sign(318, B - 1, 'GOBLIN CARTS: STRIKE THE RIDER OFF, OR JUMP INTO HIS CART.');
  rider('archer', 322, B - 3, 30, { squad: 'gl1' });                        /* TEACH: one archer, a little ahead on the line above */
  foe('miner', 342, B - 1, { squad: 'glMiner' });
  sign(350, B - 1, 'A CASTER LAYS RUNES ON YOUR RAIL: JUMP THEM, OR BRAKE SHORT.');
  rider('gobmage', 352, B - 3, 56, { squad: 'gl2' });                       /* the caster: runes on YOUR rail ahead */
  ore(378, B - 7);                                                          /* (over the upper line: a jump off it) */
  foe('miner', 366, B - 1, { squad: 'glMiner2' });
  /* THE OLD DRIFT: a hatch in the line (one-way boards) down into a short drift under the rock; it ends in a fall-in. Hold LEFT at a stop and the cart rolls back */
  for (let x = 388; x <= 390; x++) set(x, B, T.ONEWAY); air(388, 402, B + 1, B + 2); block(403, 404, B + 1, B + 2); track.push([388, 402, B + 3]); interiors.push([388, 402, B + 1, B + 2, 'drift']);
  for (const x of [398, 399, 400, 401]) ent('coin', x, B + 2); ent('mend', 402, B + 2);
  rider('archer', 384, B, 150, { squad: 'gl3', slow: 64 });                 /* a SLOW cart on your own line: brake behind it, or jump into it */
  foe('bat', 398, B - 5, { squad: 'glBat' });
  rider('archer', 410, B - 3, 40, { squad: 'gl4' }); rider('gobmage', 411, B - 3, -60, { squad: 'gl4' });   /* the pair: one ahead, one behind */
  foe('brute', 436, B - 1, { squad: 'glBrute' });                           /* a brute on the rail past the pair: jump him or crash */
  sign(444, B - 1, 'THE GAP AHEAD IS DEEP. A FALL HERE IS THE END OF THE CART.');
  rider('archer', 444, B - 3, 60, { squad: 'glExam', at: 466 }); rail(462, 471, B - 3);   /* the section's EXAM (real deaths): a boost gap, and an archer waiting on the far side's upper line */
  boostGap(452, B); exams.push([447, 465]);
  ground(461, 471, B);

  // ================= 4. THE CAVE-IN (472-609): SET PIECE - the roof comes down behind you, all the way down the incline =================
  station(474);                                                             /* STATION FOUR (inside the chase's checkpoint gap) */
  sign(477, B - 1, 'THE ROOF IS GOING. RIDE!');
  ground(472, 479, B); { const t = fall(480, B, 5); B = t; }                /* down the incline to row 30 at 490 */
  ground(490, 555, B);
  rail(492, 555, B - 3);                                                    /* the upper line: under more rock, nearer the ore */
  rock('c1', 488, 498, B); rock('c2', 494, 504, B - 3); rock('c3', 502, 512, B); rock('c4', 508, 518, B - 3, { delay: 0.9 });
  ore(516, B - 5); rider('archer', 494, B - 3, 50, { squad: 'cvPacer' }); foe('bat', 523, B - 4, { squad: 'cvBat' }); foe('brute', 534, B - 1, { squad: 'cvBrute' });
  gap(522, 525); for (let x = 522; x <= 525; x++) set(x, B - 3, T.RAIL);   /* a short gap in the low line (the upper one bridges it) */
  /* THE FORK AT SPEED: the low line is falling in ahead; be up on the high line with its points SET (a crash here, with the roof behind you, is the end) */
  sign(528, B - 1, 'THE LOW LINE IS GOING: GET UP TOP AND SET THE POINTS.');
  rock('c5', 528, 534, B);
  lever('cavein', 538, B - 3, 541, 552, B - 3, 'open', { label: 'THE LOW LINE IS GOING', retry: [528, B - 1], req: true });
  fallIn(554, B, [528, B - 1]);
  boostGap(556, B - 3); ore(560, B - 6);                                    /* THE BOOST GAP under the falling roof: off the high line, both lines broken */
  ground(565, 572, B); rail(565, 572, B - 3);
  rock('c6', 566, 572, B);
  { const t = fall(573, B, 7); B = t; }                                     /* and on down to row 37 at 587 */
  ground(587, 609, B); rail(588, 603, B - 3);
  rock('c7', 588, 596, B - 3); foe('miner', 598, B - 1, { squad: 'cvMiner' }); rider('gobmage', 580, B - 3, 70, { squad: 'cvCaster', at: 592 });

  // ================= 5. THE CRUSHER WORKS (610-764), row 37: REMIX - speed =================
  ground(610, 667, B);
  station(612);                                                             /* STATION FIVE (past the cave-in's safe line) */
  sign(614, B - 1, 'THE CRUSHER WORKS. EVERY CRUSHER HAS ITS BEAT.');
  crusher('w1', 622, B, 2.2, 0.8, 0); crusher('w2', 630, B, 2.2, 0.8, 1.1);   /* a pair, off the beat: one brake, one go */
  foe('miner', 640, B - 1, { squad: 'wMiner' }); rail(640, 664, B - 3); foe('miner', 660, B - 4, { squad: 'wMiner2' });
  sign(646, B - 1, 'THE GATE OPENS ON ITS GAUGE. TIME YOUR RUN.');
  gate('w', 652, B, 3.0, 1.3, 0.4);                                         /* THE TIMED GATE: its gauge says when */
  boostGap(668, B);
  block(670, 675, B - 7, B - 7); foe('tippler', 672, B - 8, { squad: 'wTip' });   /* a tippler over the boost gap */
  ground(677, 764, B);
  rail(684, 744, B - 3); rider('archer', 684, B - 3, 20, { squad: 'wPacer' });   /* an archer pacing you through the crushers */
  foe('sapper', 702, B - 1, { squad: 'wSapper2' }); crusher('w3', 696, B, 2.0, 0.7, 0.5); crusher('w4', 712, B, 2.0, 0.7, 1.3);
  /* THE HIGH WORKINGS (optional, silver two): a jump up off the parallel line onto a high trestle, and a hop off it for the silver */
  rail(706, 744, B - 6); ore(716, B - 8); ent('silver', 728, B - 9); ore(738, B - 8); foe('bat', 722, B - 10, { squad: 'wHighBat' });
  crusher('w5', 732, B - 6, 2.2, 0.8, 0.2);
  foe('sapper', 748, B - 1, { squad: 'wSapper' });                          /* a sapper on the line: he lights a bomb where you will be */
  foe('brute', 758, B - 1, { squad: 'wBrute' }); rail(746, 762, B - 3);

  // ================= 6. THE EXAM (765-899): up the last incline, then all three at once - a fall here is the end of the cart =================
  ground(765, 766, B);
  station(765);                                                             /* STATION SIX */
  sign(766, B - 1, 'THE LAST STRETCH. EVERY GAP HERE IS DEEP.'); foe('bat', 776, B - 8, { squad: 'exBat0' });
  { const t = rise(767, B, 10); B = 30;                                      /* up ten rows to the high line (row 27) at 787; the low line is row 30 */
    exams.push([787, 896]);
    rail(787, 812, t); ground(787, 812, B);
    lever('exam', 789, t, 791, 797, t, 'open', { label: 'HIGH: A CRUSHER / LOW: A GATE - THEN THE DEEP GAP' });
    rider('archer', 790, B, 40, { squad: 'exPair' }); rider('gobmage', 791, B, 110, { squad: 'exPair' });   /* the pair on the low line, ahead: up top they shoot up at you; drop down and they are in your way */
    crusher('ex', 800, t, 2.4, 0.9, 0.3); gate('ex', 806, B, 2.8, 1.2, 0.2); }
  rider('gobmage', 800, B - 3, 60, { squad: 'exRune', at: 826 });           /* waiting on the far side: a rune on the lip of the gap */
  boostGap(813, B); ore(818, B - 6);                                        /* the exam's boost gap: both lines broken */
  ground(822, 857, B); rail(822, 838, B - 3);   /* (the upper line ends well short of the last gap: room to boost on the low one) */
  rider('archer', 822, B, 150, { squad: 'exSlow', slow: 70, at: 838 });     /* a goblin cart on your line: jump into it */
  foe('bat', 846, B - 5, { squad: 'exBat' });
  boostGap(858, B);
  ground(867, 899, B); rail(870, 884, B - 3);
  foe('miner', 878, B - 1, { squad: 'exMiner' }); block(886, 890, B - 6, B - 6); foe('tippler', 888, B - 7, { squad: 'exTip' });

  // ================= 7. THE SMELTER (900-959), row 30: 8 ore open its points (silver three); THE BORE =================
  ground(900, 914, B); ground(938, 959, B);
  station(903);                                                             /* STATION SEVEN */
  sign(908, B - 1, 'THE SMELTER: CARRY 8 ORE AND ITS POINTS WILL OPEN.'); rail(900, 911, B - 3); foe('bat', 918, B - 5, { squad: 'smBat' });
  lever('smelter', 912, B, 915, 919, B, 'set', { ore: 8, label: 'THE SMELTER: 8 ORE OPEN THESE POINTS' });
  rail(920, 937, B, { noPosts: true });
  block(915, 930, B + 7, H - 1); track.push([915, 930, B + 7]); interiors.push([915, 937, B + 1, B + 6, 'smelter']);
  { let tt = B + 7; for (let i = 0; i < 7; i++) { set(931 + i, tt - 1, T.SLOPE_R1); block(931 + i, 931 + i, tt, H - 1); tt--; } track.push([931, 937, B, 'slope']); }
  ent('silver', 924, B + 6); decor.push({ kind: 'smelter', x: 922, row: B + 7 });
  decor.push({ kind: 'bore', x0: 940, x1: 959, row: B });
  sign(942, B - 1, 'SOMETHING BIG BORED THESE TUNNELS. LISTEN.');
  foe('miner', 950, B - 1, { squad: 'boreMiner' }); rail(940, 956, B - 3); foe('archer', 952, B - 4, { squad: 'boreArcher' });

  // ================= THE GREAT DRILL (src/great-drill.js) =================
  const AX = ARENA_X, AF = 30;
  const stage = stageDrill({ set, block, ent, air }, T, TS, AX, AF);
  stage.carve();
  ground(AX + DRILL_STAGE.W, W - 1, AF);
  ent('gate', AX + DRILL_STAGE.W + 2, AF - 1);

  const START = { x: 4, y: B - 1 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors,
    /* WHERE A FALL IS A FALL: per column, the row three under the deepest line within 14 columns (src/minecart-hands.js) */
    mcFall: (() => { const deep = new Array(W).fill(0); for (const [a, b, row] of track) for (let x = Math.max(0, a); x <= Math.min(W - 1, b); x++) deep[x] = Math.max(deep[x], row);
      const out = []; for (let x = 0; x < W; x++) { let d = 0; for (let k = Math.max(0, x - 14); k <= Math.min(W - 1, x + 14); k++) d = Math.max(d, deep[k]); out.push((d || 30) + 3); } return out; })(),
    arena: stage.arena, gateAfterBoss: true,
    minecart: true,
    mcTrack: track, mcPoints: points, mcCrushers: crushers, mcGates: gates, mcRocks: rocks, mcBeams: beams, mcWalls: walls, mcExam: exams, mcBoost: boosts, mcTrestles: trestles, decor,
    chases: [{ id: 'cavein', name: 'THE CAVE-IN', trigger: 480 * TS, end: 604 * TS, gap0: 170, curve: [[0, 128], [700, 150, 'THE ROOF GOES FASTER']], rubber: { min: 90, max: 250, slow: 0.4, catch: 1.4 },
      contact: 'kill', look: 'rock', say: 'THE ROOF IS COMING DOWN: RIDE!', autoscroll: true, glow: 260, zone: [470 * TS, 610 * TS, 12 * TS, 40 * TS] }],
    quest: { n: 8, item: 'orenugget', name: 'ORE', done: 'EIGHT ORE: THE SMELTER\'S POINTS WILL SET', thanks: 'THE SMELTER\'S POINTS WILL SET' },
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,   /* the stations are placed by hand, one a section (the filler adds none under 200) */
    unlocks: [
      { kind: 'mcpoints', opens: 'the line ahead: OPEN drops you to the low line, SET keeps you high (a fallen-in low line, the risky high line with ore, the hidden spur, the smelter)', hud: 'THE LEVER\'S ARROW: UP = HIGH LINE, DOWN = LOW LINE' },
      { kind: 'stray', opens: 'THE SMELTER\'s points once 8 ore are carried: its line to a silver', hud: 'ORE n/8 - THE SMELTER (the quest counter)' },
    ],
    music: 'mineworks',
    ambient: [{ x0: 0, x1: 99999, kind: 'cave' }],
    rockZones: [], masonry: [],
    /* GREYBOX LOOK: a deep mine (the art pass gives it its own kit): the Ore Road's warm dark, deeper, with dust in the air */
    palette: { sky: [[10, 8, 12], [26, 20, 22]], far: 'crag', mid: 'crag', near: 'none', dress: 'none', ledges: 'staging', haze: 'rgba(30,24,22,0.2)', murkCol: '#2a1c18', murkLit: '#8a5a30',
      darkCol: '14,8,6', lampGlow: [255, 150, 60, 0.24], darkRim: ['#c8843c', 0.26, 0.12], footLip: ['#f0be7c', 0.62], grade: ['#ff8a3c', 0.1],
      grass: '#4a3426', grassL: '#6a4a34', grassD: '#2a1a12', dirt: '#3a2618', dirtL: '#5a3a24', dirtD: '#1e120a', canopy: ['#1a1620', '#241e28', '#2e2632', '#3a303e'] },
    weather: [{ x0: 0, x1: 99999, kind: 'dust' }], duskStart: -1, duskLen: 1,
  };
}
