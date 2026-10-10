// src/minecart.js - THE DEEP RAILS, ON THE MAIN ROAD between THE ORE ROAD and STORMHOLD (claude/minecart, the OPUS GREYBOX; DEEP RAILS 2, claude/deeprails2,
// Daniel's live playtest 10-09: "I like the concept, it just needs work" - model: the DONKEY KONG COUNTRY mine-cart levels). Brief: scratch/brief-deeprails2.md.
// The runtime is src/minecart-hands.js (the cart, the points, the hazards, the goblin carts, the on-foot stretches); the boss is src/great-drill.js.
//
// THE RULE: THE CART NEVER STOPS. HOLD RIGHT TO PUMP, LEFT TO BRAKE, AND THROW THE POINTS AT THE JUNCTIONS.
// ALWAYS FORWARD (DKC): the cart rolls on its own at cruise (MC.cruise) and never stops or backs - RIGHT held PUMPS it (to MC.boost: a longer jump, a ram,
// a rider caught), LEFT held BRAKES hard (sparks and a screech, down to a crawl - MC.crawl - never to a stop: a crusher's beat, a throw dodged), JUMP
// jumps it, DOWN ducks into the tub, DOWN + JUMP drops through to the line below. AT FULL PUMP (MC.ramV) THE CART RAMS: a goblin on the line, a goblin
// cart from behind, the foreman's armoured cart; slower, it is a bump (it hurts you and slows you). Mostly cart, and TWO short ON-FOOT stretches on big
// platforms between rides - THE WRECK (a derailment) and THE LIFT - still pushing forward.
// THE VERB is THROW THE POINTS: a LEVER beside the line before every junction - a blow, or E as you pass. OPEN points drop you to the low line; SET points
// keep you on the high one. Each lever's disc shows which (an arrow), and the fork itself is drawn open or set.
// THE MECHANICS (each taught, tested, remixed, examined - tools/minecart.mjs reads ARCS):
//   SWITCH TRACKS  told junctions (risk / reward), a hidden lever in the roof, junctions whose default line is FALLEN IN (a crash puts you back before the lever)
//   SPEED          pump for long gaps and LAUNCH RAMPS, brake for crushers and gates, RAILS THAT BREAK UP BEHIND YOU (out-pump the break), falling rock
//   CART COMBAT    swing from the cart; goblins THROW from ledges (told marks: brake off them) and RIDE carts on parallel lines (pump to catch a rider); RAM at
//                  full pump; THE FOREMAN (the exam's elite) in an armoured cart only a ram dents
// THE AREAS (A8): THE LAMP YARD (lantern-lit), THE DARK DRIFT (pitch: your headlamp's cone and the goblins' lanterns), THE GOBLIN LINE (the goblins' green
// lamps), THE GLOW CAVERN (an open cavern lit by a lava glow - the cave-in, the ramp over the lava), THE WRECK and THE CRUSHER WORKS (the works yard, hot),
// THE LIFT, THE FLOODED RUN (trestles over black water - the exam), THE SMELTER and THE BORE.
// THE COLLECTIBLE: ten ORE NUGGETS on the risky lines (L.quest counts ten; eight open THE SMELTER's points - a silver, no relic). 3 silvers in all.
//
// SECTIONS (columns):
//   0-170    THE LAMP YARD     TEACH    a gap (jump), a beam (duck), THE PUMP GAP, A MINER ON THE LINE (ram), THE FIRST CRUSHER (brake), THE FIRST POINTS (required)
//   171-309  THE DARK DRIFT    TEST     pitch dark: fork A (high: ore and gaps / low: crushers and a gate), THE HIDDEN LEVER (a spur to silver one), a sapper
//   310-471  THE GOBLIN LINE   TEST     THE RAIL BREAKS (teach), a thrower on a ledge, a rider to catch, a caster, a slow cart to ram, the pair; its exam
//   472-624  THE GLOW CAVERN   SET PIECE the roof comes down behind you (src/chase.js), the rail breaking under the high line, the junction at speed; THE RAMP over the lava
//   625-675  THE WRECK         ON FOOT  the cart derails at a buffer: the works yard on foot (a fight on a deck), a cart waits at its end
//   676-757  THE CRUSHER WORKS REMIX    crushers off the beat, a timed gate, a real-death gap under a tippler, a rider pacing you; the high workings (silver two)
//   758-785  THE LIFT          ON FOOT  the line ends at a cage lift: up ten rows on foot, a cart waits at the top
//   786-899  THE FLOODED RUN   EXAM     over black water, real deaths: the junction under the pair, a rune on a deep gap, THE FOREMAN (ram him), the last deep gap
//   900-959  THE SMELTER       the points that want 8 ore (silver three); THE BORE, the drill's own tunnel (it sets him up)
//   960-     THE GREAT DRILL   BOSS     src/great-drill.js (a goblin in a drill rig, an endless chase tunnel: ram an ore cart into its gears)
import { stageDrill, DRILL_STAGE } from './great-drill.js';

/* THE CART (px/s, px/s/s): cruise on its own, pump held, brake held (to a crawl - never a stop, never back). A cruising jump flies ~6 tiles, a pumped one ~9
   (JUMPV -320, GRAV 1000: 0.64 s in the air) - the pump gaps are 8 wide: a cruising jump falls in, a pumped one clears with ~1.2 tiles of slack, and the lip is
   MARKED (lanterns and chevrons; tools/minecart-route.mjs measures both). A LAUNCH RAMP throws the cart up at rampV0 + rampK x its pace */
export const MC = {
  cruise: 150, boost: 230, accUp: 260, accCruise: 220, brake: 340,
  crawl: 50,            /* (deeprails2) a held brake takes the cart down to this and no further: the cart never stops and never backs (Daniel 10-09: always forward) */
  ramV: 200,            /* at or over this pace the cart RAMS what is on its line ahead (a goblin, a goblin cart from behind, the foreman's cart); under it, a bump */
  ramDmg: 60, bumpDmg: 12, bumpBack: 40,
  fallCost: 0.27,       /* a fall outside an exam: this share of max health, and back on the rail ~1.5 s behind (A10 amended) */
  retryBack: 128,       /* px behind the lip a fall puts you back (room to pump up to speed again) */
  crashDmg: 18, crashCd: 0.7, wallDmg: 20,   /* (deeprails2, on the main road at L13: every hit about a quarter heavier - the walker arrived at its stations with ~60%, the target is under 50) */
  crushDmg: 34, rockDmg: 26, beamDmg: 22, gateDmg: 22,
  arrowDmg: 16, arrowV: 230, runeDmg: 22, runeT: 1.25, runeR: 15,
  archerTell: 0.7, archerCd: 2.1, casterTell: 0.6, casterCd: 2.8,
  throwTell: 0.75, throwT: 1.0, throwCd: 2.8, throwDmg: 20, throwR: 16,   /* A THROW off a ledge (deeprails2): told ('!' and the arm back), then a pick lobbed at where your cart WILL be (a mark on the rail) - brake short of it, or pump past */
  rampV0: 300, rampK: 0.5,   /* a ramp's launch: vy = -(rampV0 + rampK * pace): a cruising launch flies ~7 tiles, a pumped one ~12 (tools/minecart.mjs measures the lava ramp) */
  breakV: 170, breakLead: 56, breakLag: 0.05,   /* THE RAIL BREAKS (deeprails2): the break runs up the line behind you at breakV from breakLead px back - a cruising cart (150) is caught, a pumping one gets away */
  foremanRams: 3, foremanPace: 120, foremanArmour: 0.35,   /* THE FOREMAN (the exam's elite): three rams take his cart apart; a blade dents it (x0.35, a told clank) */
  leverReach: 30,     /* px: E (or a blow) throws a lever this close */
  softCrash: 100,
  treadBack: 110, treadAcc: 560,   /* THE DRILL's tunnel: held brake drifts you back at most this fast; the pace eases this quick */
  hold: 1.2,            /* s: at the start and at a station the cart waits this long before it rolls off on its own (RIGHT goes at once) - the first tell is read standing */
  tellGap: 1.6,         /* s: the least time between two tells in the hint box (one is never written over another) */
};
export const BOOST_GAP = 8;   /* columns */
/* THE CASTER'S RUNE (review MF2): laid where YOUR cart will be when it bursts - x + v * runeT - so holding your pace is a hit and a change of pace
   (a jump over it, a brake short of it, a pump past it) is the dodge. A THROW is the same idea with its own clock (MC.throwT) */
export const runeAt = (x, v, T = MC.runeT) => x + Math.max(0, v) * T;
/* does a cart at x0 and pace v0, riding `keys` ({ boost, brake, jump: at t s }), stand on the mark when it bursts? (the pure check the tool runs) */
export function runeHits(x0, v0, keys, dt = 1 / 60, T = MC.runeT, R = MC.runeR) { const rx = runeAt(x0, v0, T); let x = x0, v = v0, t = 0, y = 0, vy = 0, air = false;
  for (; t < T - 1e-9; t += dt) { if (keys.jump !== undefined && !air && t >= keys.jump) { air = true; vy = -320; }
    if (air) { vy += 1000 * dt; y += vy * dt; if (y >= 0) { y = 0; vy = 0; air = false; } }
    v = cartSpeed(v, keys, dt); x += v * dt; }
  return Math.abs(x - rx) < R + 4 && y > -26; }

/* THE CART'S SPEED one step: keys { boost, brake }. The brake stops at MC.crawl (deeprails2: always forward); under the crawl (a start, a crash) it pulls up to it */
export function cartSpeed(v, keys, dt) {
  if (keys.brake) return v > MC.crawl ? Math.max(MC.crawl, v - MC.brake * dt) : Math.min(MC.crawl, v + MC.accCruise * dt);
  if (keys.boost) return v < MC.boost ? Math.min(MC.boost, v + MC.accUp * dt) : Math.max(MC.boost, v - MC.brake * dt);
  return v < MC.cruise ? Math.min(MC.cruise, v + MC.accCruise * dt) : Math.max(MC.cruise, v - MC.accCruise * 0.6 * dt);
}
/* A LAUNCH RAMP's flight from its lip (px, same height both sides): what a pace v carries */
export const rampFlight = v => { const vy = MC.rampV0 + MC.rampK * v; return v * (2 * vy / 1000); };

export const MINE = { W: 1000, H: 52, base: 30 };
export const SECTIONS = [['THE LAMP YARD', 0], ['THE DARK DRIFT', 171], ['THE GOBLIN LINE', 310], ['THE GLOW CAVERN', 472], ['THE WRECK', 625], ['THE CRUSHER WORKS', 676], ['THE LIFT', 758], ['THE FLOODED RUN', 786], ['THE SMELTER', 900], ['THE GREAT DRILL', 960]];
/* THE ON-FOOT STRETCHES (Daniel 10-09: mostly cart, plus two short stretches on foot on big platforms): from x0 the hero is out of the cart, from board he is back in one */
export const FOOT = [{ id: 'wreck', name: 'THE WRECK', x0: 632, board: 674, derail: true }, { id: 'lift', name: 'THE LIFT', x0: 758, board: 783 }];
/* each mechanic's arc (columns): TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/minecart.mjs */
export const ARCS = {
  points: { teach: [118, 160], test: [186, 256], remix: [538, 552], exam: [789, 800], boss: [960, 990] },   /* the fallen-in low line; fork A in the dark; the junction at speed in the cave-in; the exam's junction */
  speed: { teach: [52, 112], test: [314, 338], remix: [592, 624], exam: [813, 877], boss: [960, 990] },     /* the pump gap and the first crusher; THE RAIL BREAKS; the lava ramp; the exam's deep gaps */
  combat: { teach: [76, 90], test: [340, 440], remix: [690, 750], exam: [821, 866], boss: [960, 990] },    /* the miner rammed; the thrower, the rider, the caster, the slow cart; the works' pacer; THE FOREMAN */
};
export const ARENA_X = 960;
/* THE TELLS' LINES (review MF1): every tell() says one of these - five words or fewer (src/hint-lines.js routes them to the hint box) */
export const TELL_LINES = ['A GAP AHEAD: JUMP', 'LOW BEAM: HOLD DOWN', 'LONG GAP: PUMP, THEN JUMP', 'MINER ON THE LINE: RAM', 'CRUSHER: BRAKE FOR ITS BEAT', 'POINTS: STRIKE TO STAY HIGH',
  'DARK DRIFT: WATCH YOUR LAMP', 'FORK: ORE UP, CRUSHERS DOWN', 'THE RAIL BREAKS: PUMP!', 'ROCKFALL: BRAKE OR PUMP', 'THROWER: BRAKE OFF HIS MARK', 'RIDER: PUMP TO CATCH HIM', 'RUNES: CHANGE PACE OR JUMP',
  'SLOW CART: RAM IT', 'LOW BEAM UNDER FIRE: DUCK', 'A DEEP GAP: PUMP HARD', 'THE ROOF IS GOING: RIDE', 'LOW LINE FALLING: GO HIGH', 'SET THE POINTS, THEN PUMP', 'A RAMP: PUMP, THEN FLY',
  'BUFFER AHEAD: YOU DERAIL', 'TWO CRUSHERS, OFF THE BEAT', 'A GATE: WATCH ITS GAUGE', 'DEEP GAP: PUMP AND JUMP', 'LINE ENDS: TAKE THE LIFT', 'HIGH CRUSHER, LOW GATE', 'DEEP GAP, RUNE ON LIP',
  'THE FOREMAN: RAM HIS CART', 'ANOTHER DEEP GAP: PUMP', 'THE SMELTER WANTS 8 ORE', 'SOMETHING BORES TOWARD YOU'];

export function buildMinecart({ painter, T, TS }) {
  const { W, H } = MINE;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const tells = [], track = [], points = [], crushers = [], gates = [], rocks = [], beams = [], walls = [], exams = [], boosts = [], decor = [], interiors = [], trestles = [], ramps = [], breaks = [];
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
  const lever = (id, lx, row, x0, x1, prow, dflt, o) => { const tiles = []; for (let x = x0; x <= x1; x++) { tiles.push([x, prow]); set(x, prow, dflt === 'set' ? T.RAIL : T.ONEWAY); }   /* (built as one-way boards: the reach model drops through them; the hands lay RAIL or nothing) */
    points.push(Object.assign({ id, x: lx, row, tiles, dflt, x0, x1, prow }, o || {})); ent('mcpoints', lx, row - 1, { id }); };
  const crusher = (id, x, row, period, down, phase, w = 2) => { crushers.push({ id, x, w, row, period, down, phase }); ent('mccrusher', x, row - 1, { id }); };
  const gate = (id, x, row, period, open, phase) => { gates.push({ id, x, row, period, open, phase }); ent('mcgate', x, row - 1, { id }); };
  const rock = (id, trig, x, row, o) => { rocks.push(Object.assign({ id, trig, x, row, delay: 1.0, w: 2 }, o || {})); ent('mcrock', x, row - 1, { id }); };
  const beam = (x0, x1, row) => { beams.push({ x0, x1, row }); ent('mcbeam', x0, row - 1, {}); };
  /* a FALL-IN across the line: rubble from the rail up, a crash into it puts you back at retry */
  const fallIn = (x, row, retry) => { block(x, x + 1, row - 2, row - 1); walls.push({ x, y0: row - 2, y1: row - 1, retry }); decor.push({ kind: 'fallin', x, row }); };
  const gap = (x0, x1) => air(x0, x1, 0, H - 1);
  const boostGap = (x0, row) => { gap(x0, x0 + BOOST_GAP - 1); boosts.push({ x0, x1: x0 + BOOST_GAP - 1, row }); ent('mcgap', x0, row - 1, { w: BOOST_GAP }); };
  /* A LAUNCH RAMP (deeprails2): its lip at column x on `row` (the hands throw the cart up as it crosses: MC.rampV0 + MC.rampK x pace), a pit `w` wide past it */
  const ramp = (x, row, w, o) => { gap(x + 1, x + w); ramps.push(Object.assign({ x, row, w, x1: x + w }, o || {})); boosts.push({ x0: x + 1, x1: x + w, row, ramp: true }); ent('mcramp', x, row - 1, { w }); };
  /* A RAIL THAT BREAKS (deeprails2): a trestle line from x0 to x1 on `row` - as you roll on at x0 the break starts MC.breakLead px behind you and runs up the line
     at MC.breakV; out-pump it or ride down with it (a fall). A pit under it */
  const breakaway = (id, x0, x1, row, o) => { rail(x0, x1, row); breaks.push(Object.assign({ id, x0, x1, row }, o || {})); };
  /* a GOBLIN ON A CART (an EXISTING foe: 'archer' or 'gobmage'): it waits off the screen until you pass `trig`, then rolls in on its line (`row`) and keeps
     `off` px from you (+ ahead / - behind). slow: a cart rolling at that pace on YOUR line, ahead (a hazard to ram and a platform). pace: a cart that rolls at
     its OWN pace from `off` ahead (pump to catch it). until: its line ends there */
  const rider = (t, trig, row, off, o) => { const x = o && o.at !== undefined ? o.at : trig + Math.round(off / TS); ent(t, x, row - 1, { face: -1, cnSkin: t === 'gobmage' ? 'gobcaster' : 'gobrider', ride: Object.assign({ row, off, trig }, o || {}) }); ent('mcgobcart', x, row - 1, {}); };
  /* A THROWER ON A LEDGE (deeprails2): a goblin miner (an EXISTING foe) on a rock shelf over the line; from trig he lobs his pick at where your cart will be */
  const thrower = (trig, x, ledgeRow, o) => { block(x - 2, x + 2, ledgeRow, ledgeRow); decor.push({ kind: 'ledge', x0: x - 2, x1: x + 2, row: ledgeRow }); ent('miner', x, ledgeRow - 1, Object.assign({ face: -1, ride: { ledge: true, row: ledgeRow, trig, at: x, off: 0 } }, o || {})); };
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: -1 }, o || {}));
  const station = (x, y = B - 1) => ent('check', x, y);
  /* A TELL (review MF1): the cart's teaching is never a sign you stop to read. Crossing column x (and before column at, the place it can first hurt) puts
     the line in the hint box, once a life, ~2.5 s ahead at cruise - at most five words. The posts (signs) stay, as lore you may read at a stop */
  const tell = (x, at, text) => { if (!TELL_LINES.includes(text)) throw new Error('minecart: a tell not in TELL_LINES: ' + text); tells.push({ id: tells.length, x, at, text }); };

  // ================= 1. THE LAMP YARD (0-170), row 30: TEACH, where a failure is cheap - lantern-lit =================
  let B = 30;
  ground(0, 13, B);
  sign(3, B - 1, 'THE DEEP RAILS. THE CART NEVER STOPS: HOLD RIGHT TO PUMP, LEFT TO BRAKE.');
  sign(9, B - 1, 'A GAP: JUMP. THE CART JUMPS WITH YOU.');
  tell(0, 14, 'A GAP AHEAD: JUMP');
  gap(14, 16);                                                             /* THE FIRST SCREEN ASKS: a 3-wide gap (any pace clears it) */
  ground(17, 40, B); rail(17, 24, B - 3);
  tell(15, 38, 'LOW BEAM: HOLD DOWN');
  sign(33, B - 1, 'A LOW BEAM: HOLD DOWN TO DUCK INTO THE TUB.');
  beam(38, 39, B);
  { const t = rise(41, B, 2); ground(45, 60, t);                           /* (row 28) */
    tell(36, 61, 'LONG GAP: PUMP, THEN JUMP');
    sign(50, t - 1, 'A LONG GAP WANTS SPEED: HOLD RIGHT TO PUMP, THEN JUMP AT THE LIP.');
    foe('bat', 57, t - 5, { squad: 'yardBat' });
    boostGap(61, t);                                                        /* THE PUMP GAP (REQUIRED): 8 wide - a cruising jump falls in */
    ore(71, t - 3);                                                          /* (on the far lip: a pumped jump lands on it) */
    ground(69, 88, t);
    tell(58, 80, 'MINER ON THE LINE: RAM');                                 /* RAM, TAUGHT (deeprails2): you land off the pump gap at full pump - and he is on the line */
    sign(74, t - 1, 'AT FULL PUMP THE CART RAMS WHAT IS ON THE LINE. SLOWER, IT IS A BUMP.');
    foe('miner', 80, t - 1, { squad: 'yardMiner2' });
    fall(89, t, 2); }
  ground(93, 113, B); foe('bat', 110, B - 5, { squad: 'yardBat3' }); rail(93, 100, B - 3);
  tell(80, 104, 'CRUSHER: BRAKE FOR ITS BEAT');
  sign(95, B - 1, 'A CRUSHER: HOLD LEFT TO BRAKE. GO UNDER WHEN IT LIFTS.');
  crusher('first', 104, B, 2.6, 1.0, 0);                                   /* THE FIRST CRUSHER (REQUIRED): brake for it */
  { const t = rise(114, B, 4);                                              /* up onto the trestle: the high line at row 26 */
    rail(122, 168, t);
    tell(106, 150, 'POINTS: STRIKE TO STAY HIGH');
    sign(116, t - 1, 'POINTS AHEAD. STRIKE THE LEVER, OR PRESS E, TO SET THEM AND STAY HIGH.');
    lever('yard', 125, t, 128, 139, t, 'open', { label: 'THE LOW LINE IS FALLEN IN', retry: [118, t - 1], req: true });
    ground(122, 151, B - 1); fallIn(150, B - 1, [118, t - 1]);             /* under it: the low line (row 29) runs into the fall-in */
    for (let x = 140; x <= 149; x++) set(x, t, T.SOLID);                    /* (the trestle is rock over the last ten: a tunnel - the low line's end is a fall-in) */
    ent('mend', 147, B - 2); ent('coin', 145, B - 2); ent('coin', 146, B - 2); ent('coin', 148, B - 2); ent('coin', 149, B - 2);
    rail(70, 88, 25); for (const x of [74, 78, 82]) ent('coin', x, 24);      /* a jump-up line over the hump */
    station(148, t - 1);                                                    /* STATION ONE, on the high line past the points (148: >= 140 route tiles from the start, A10b) */
    foe('bat', 158, t - 3, { squad: 'yardBat2' });
    rise(169, t, 1); ground(171, 172, t - 1); }                            /* on up to row 25 at 171 */

  // ================= 2. THE DARK DRIFT (171-309), row 25: pitch dark - your headlamp's cone; fork A, the hidden lever =================
  B = 25;
  ground(173, 189, B); rail(175, 189, B - 3); ent('coin', 180, B - 4); ent('coin', 184, B - 4);
  tell(150, 176, 'DARK DRIFT: WATCH YOUR LAMP');
  block(184, 188, B - 6, B - 6); foe('tippler', 186, B - 7, { squad: 'swTip' });   /* a tippler on his ledge over the line: his stream is told (his lamp burns in the dark) */
  { const t = rise(190, B, 4);                                              /* FORK A: up to the high line (row 21) */
    ground(198, 262, B);                                                    /* the low line under it */
    rail(198, 217, t); rail(222, 231, t); rail(240, 252, t);                /* the high line: a gap, then a PUMP GAP (miss it and you drop to the low line, at its gate), ore, bats in the jumps, an archer at the landing */
    tell(176, 199, 'FORK: ORE UP, CRUSHERS DOWN');
    sign(196, t - 1, 'FORK: HIGH LINE IS QUICK, WITH ORE AND ARROWS. STRIKE THE POINTS FOR LOW: CRUSHERS, A GATE.');
    lever('forkA', 199, t, 202, 213, t, 'set', { label: 'HIGH: QUICK, ORE, ARROWS / LOW: CRUSHERS, A GATE' });
    ore(220, t - 3); foe('bat', 233, t - 4, { squad: 'forkABat' }); ore(234, t - 3); foe('bat', 219, t - 4, { squad: 'forkABat2' });
    foe('archer', 243, t - 1, { squad: 'forkAArcher' }); foe('archer', 228, t - 1, { squad: 'forkAArcher2' });   /* (two on the dark high line: their lamps are all you see of them - pump and ram, or strike) */
    crusher('forkA', 214, B, 2.4, 0.9, 0.6); crusher('forkA2', 228, B, 2.2, 0.8, 1.5);
    gate('forkA', 238, B, 3.2, 1.5, 0); }
  ground(263, 279, B); ground(308, 313, B); rail(253, 262, B - 3);
  foe('sapper', 270, B - 1, { squad: 'hidSapper' });
  /* THE HIDDEN LEVER: up in the roof over the line (a jump and a blow). It opens the points in the line itself - down into THE OLD SPUR (silver one), a
     working seven rows under the line that climbs back up to it on a steep ramp (the line over the spur is one-way rail: no head is cracked on it) */
  block(272, 284, B - 7, B - 6); decor.push({ kind: 'roof', x0: 272, x1: 284, row: B - 7 });
  lever('hidden', 276, B - 5, 280, 284, B, 'set', { hidden: true, hang: true, label: 'A LEVER IN THE ROOF' });
  rail(285, 307, B, { noPosts: true });
  block(280, 300, B + 7, H - 1); track.push([280, 300, B + 7]); interiors.push([280, 307, B + 1, B + 6, 'spur']);
  { let tt = B + 7; for (let i = 0; i < 7; i++) { set(301 + i, tt - 1, T.SLOPE_R1); block(301 + i, 301 + i, tt, H - 1); tt--; } track.push([301, 307, B, 'slope']); }
  ore(286, B + 6); ent('silver', 296, B + 6); foe('miner', 291, B + 6, { squad: 'spurMiner' });
  station(310);                                                             /* STATION TWO (past the spur's way back up) */

  // ================= 3. THE GOBLIN LINE (310-471), row 25: the rail breaks, throwers, riders, the slow cart =================
  tell(296, 318, 'THE RAIL BREAKS: PUMP!');
  sign(312, B - 1, 'THIS RAIL IS ROTTEN. IT BREAKS BEHIND YOU: PUMP AND OUTRUN IT.');
  breakaway('first', 314, 344, B);                                          /* THE RAIL BREAKS, TAUGHT (deeprails2): 31 columns of trestle over a pit; cruise and it catches you (a fall, not a death) */
  ground(345, 451, B);
  tell(318, 346, 'ROCKFALL: BRAKE OR PUMP');
  rock('first', 338, 346, B);                                               /* THE FIRST ROCKFALL (taught alone) */
  rail(352, 438, B - 3);                                                    /* the parallel line: three rows up, one-way (jump up to it, down + jump to come down) */
  tell(338, 366, 'THROWER: BRAKE OFF HIS MARK');
  sign(348, B - 1, 'A GOBLIN THROWS WHERE YOUR CART WILL BE. BRAKE SHORT OF HIS MARK, OR PUMP PAST IT.');
  thrower(352, 372, B - 7, { squad: 'glThrow' });                          /* A THROWER, TAUGHT: his ledge over the line, his mark on your rail */
  tell(358, 384, 'RIDER: PUMP TO CATCH HIM');
  sign(368, B - 1, 'A GOBLIN RIDES AHEAD ON THE HIGH LINE. JUMP UP, PUMP TO CATCH HIM, AND STRIKE.');
  rider('archer', 376, B - 3, 200, { squad: 'gl1', pace: 172 });            /* A RIDER TO CATCH (deeprails2): his own pace (172) - cruise and he pulls away shooting; pump and you are on him */
  tell(380, 404, 'RUNES: CHANGE PACE OR JUMP');
  rider('gobmage', 396, B - 3, 56, { squad: 'gl2' });                       /* the caster: runes on YOUR rail ahead */
  ore(400, B - 7);
  tell(400, 421, 'SLOW CART: RAM IT');
  rider('archer', 412, B, 150, { squad: 'gl3', slow: 64 });                 /* a SLOW cart on your own line: RAM it at full pump (or jump into it) */
  foe('bat', 420, B - 5, { squad: 'glBat' });
  rider('archer', 422, B - 3, 40, { squad: 'gl4' }); rider('gobmage', 423, B - 3, -60, { squad: 'gl4' });   /* the pair: one ahead, one behind */
  tell(418, 440, 'LOW BEAM UNDER FIRE: DUCK');
  beam(440, 441, B);                                                         /* DUCK, TESTED: under the pair's arrows - ducked, an arrow goes over too */
  tell(435, 456, 'A DEEP GAP: PUMP HARD');
  sign(449, B - 1, 'THE GAP AHEAD IS DEEP. A FALL HERE IS THE END OF THE CART.');
  rider('archer', 444, B - 3, 60, { squad: 'glExam', at: 466 }); rail(462, 471, B - 3);   /* the section's EXAM (real deaths): a pump gap, and an archer waiting on the far side's upper line */
  ground(452, 455, B); boostGap(456, B); exams.push([451, 469]);
  ground(464, 471, B);

  // ================= 4. THE GLOW CAVERN (472-624): SET PIECE - the roof comes down behind you, all the way down the incline; the ramp over the lava =================
  station(474);                                                             /* STATION THREE (inside the chase's checkpoint gap) */
  tell(470, 494, 'THE ROOF IS GOING: RIDE');
  sign(477, B - 1, 'THE ROOF IS GOING. RIDE!');
  ground(472, 479, B); { const t = fall(480, B, 5); B = t; }                /* down the incline to row 30 at 490 */
  ground(490, 555, B);
  rail(492, 504, B - 3); breakaway('cavern', 505, 537, B - 3); rail(538, 555, B - 3);   /* the upper line: under more rock, nearer the ore - and its middle BREAKS under the falling roof (the remix: the chase pushes, the break pulls) */
  rock('c1', 488, 498, B); rock('c3', 502, 512, B); rock('c4', 508, 518, B - 3, { delay: 0.9 });
  ore(516, B - 5); rider('archer', 494, B - 3, 50, { squad: 'cvPacer' }); foe('bat', 523, B - 4, { squad: 'cvBat' }); foe('brute', 534, B - 1, { squad: 'cvBrute' });
  gap(522, 525); for (let x = 522; x <= 525; x++) set(x, B - 3, T.RAIL);   /* a short gap in the low line (the upper one bridges it) */
  /* THE FORK AT SPEED: the low line is falling in ahead; be up on the high line with its points SET (a crash here, with the roof behind you, is the end) */
  tell(500, 541, 'LOW LINE FALLING: GO HIGH'); tell(520, 556, 'SET THE POINTS, THEN PUMP');
  decor.push({ kind: 'crumble', x0: 530, x1: 553, row: B });
  sign(528, B - 1, 'THE LOW LINE IS GOING: GET UP TOP AND SET THE POINTS.');
  rock('c5', 528, 534, B);
  lever('cavein', 538, B - 3, 541, 552, B - 3, 'open', { label: 'THE LOW LINE IS GOING', retry: [528, B - 1], req: true });
  fallIn(554, B, [528, B - 1]);
  boostGap(556, B - 3); ore(567, B - 5);                                    /* THE PUMP GAP under the falling roof: off the high line, both lines broken */
  ground(567, 572, B); rail(564, 572, B - 3); air(564, 566, B, H - 1);
  rock('c6', 566, 572, B);
  { const t = fall(573, B, 7); B = t; }                                     /* and on down to row 37 at 587 */
  ground(587, 614, B); rail(588, 603, B - 3);
  rock('c7', 588, 596, B - 3); foe('miner', 598, B - 1, { squad: 'cvMiner' }); rider('gobmage', 580, B - 3, 70, { squad: 'cvCaster', at: 592 });
  /* THE RAMP OVER THE LAVA (deeprails2: a launch ramp, DKC): the cavern floor opens on the glow; the ramp at 614 throws the cart - cruising it falls short into
     the glow (a fall: health and back), pumped it clears with ~2 tiles to spare (rampFlight) */
  tell(592, 614, 'A RAMP: PUMP, THEN FLY');
  sign(600, B - 1, 'A RAMP OVER THE GLOW. PUMP HARD AND LET IT THROW YOU.');
  ramp(614, B, 10); decor.push({ kind: 'lava', x0: 615, x1: 624, row: B + 6 });

  // ================= 5. THE WRECK (625-675), row 37: ON FOOT - the cart derails at a buffer, the works yard on foot =================
  ground(625, 676, B);
  tell(610, 632, 'BUFFER AHEAD: YOU DERAIL');
  block(633, 633, B - 1, B - 1); decor.push({ kind: 'buffer', x: 633, row: B });   /* THE BUFFER STOP: the cart hits it and you go over it (src/minecart-hands.js derails you at FOOT[0].x0) */
  station(637);                                                             /* STATION FOUR (on foot, past the wreck) */
  sign(639, B - 1, 'THE WRECK. ON FOOT THROUGH THE YARD: A CART WAITS AT ITS END.');
  block(645, 662, B - 2, B - 1);             /* THE LOADING DECK: two up (a fight on footing - a big platform) */
  foe('sapper', 652, B - 3, { squad: 'wkSapper' }); foe('brute', 660, B - 3, { squad: 'wkBrute' }); foe('sapper', 669, B - 1, { squad: 'wkSapper2' });   /* (the brute holds the deck's far edge: the fight is up on the platform) */
  block(655, 660, B - 7, B - 7); foe('archer', 658, B - 8, { squad: 'wkArcher' });   /* an archer on the yard's gantry over the deck */
  ent('coin', 648, B - 3); ent('coin', 650, B - 3); ore(661, B - 5);
  ent('mccart', FOOT[0].board, B - 1, {});                                  /* the cart that waits at the yard's end: walk into it */

  // ================= 6. THE CRUSHER WORKS (676-757), row 37: REMIX - speed, and a rider pacing you =================
  tell(676, 698, 'TWO CRUSHERS, OFF THE BEAT');
  sign(677, B - 1, 'THE CRUSHER WORKS. EVERY CRUSHER HAS ITS BEAT.');
  crusher('w1', 698, B, 2.2, 0.8, 0); crusher('w2', 706, B, 2.2, 0.8, 1.1);   /* a pair, off the beat: one brake, one go */
  ground(677, 715, B); rail(700, 712, B - 3);
  tell(695, 722, 'A GATE: WATCH ITS GAUGE');
  gate('w', 722, B, 3.0, 1.3, 0.4);                                         /* THE TIMED GATE: its gauge says when */
  thrower(690, 714, B - 7, { squad: 'wkThrow' });                          /* A THROWER over the crusher run: brake for a beat and his pick finds you (the remix: two timings at once) */
  /* THE WORKS' EXAM: the pump gap under the tippler is a REAL DEATH, told, with a bat in the jump */
  tell(714, 736, 'DEEP GAP: PUMP AND JUMP');
  ground(716, 735, B);
  boostGap(736, B); exams.push([731, 745]);
  block(737, 742, B - 7, B - 7); foe('tippler', 740, B - 8, { squad: 'wTip' });
  foe('bat', 739, B - 4, { squad: 'wGapBat' });
  ground(744, 758, B);
  rail(718, 734, B - 3); rider('archer', 718, B - 3, 20, { squad: 'wPacer' });   /* an archer pacing you up to the gap */
  crusher('w3', 728, B, 2.0, 0.7, 0.5);
  /* THE HIGH WORKINGS (optional, silver two): a jump up off the parallel line onto a high trestle, and a hop off it for the silver */
  rail(720, 734, B - 6); ore(724, B - 8); ent('silver', 730, B - 9); foe('bat', 727, B - 10, { squad: 'wHighBat' });
  foe('sapper', 750, B - 1, { squad: 'wSapper' });

  // ================= 7. THE LIFT (758-785): ON FOOT - the line ends at a cage lift; up ten rows, a cart waits at the top =================
  tell(735, 758, 'LINE ENDS: TAKE THE LIFT');
  decor.push({ kind: 'buffer', x: 759, row: B, soft: true });               /* (the line's end: you step out - no crash) */
  ground(759, 764, B);
  ground(765, 767, B);                                                      /* (the cage rests on the yard floor: no pit under it) */
  ent('mover', 765, B, { len: 3, vert: true, rise: 10, period: 5.6 });      /* THE CAGE LIFT: down at the yard, up at the high line, and down again */
  decor.push({ kind: 'lift', x0: 765, x1: 767, y0: B - 10, y1: B });
  sign(761, B - 1, 'THE LIFT. RIDE IT UP: A CART WAITS AT THE TOP.');
  const TOP = B - 10;                                                       /* (row 27) */
  ground(768, 786, TOP);
  station(772, TOP - 1);                                                    /* STATION FIVE (at the top of the lift) */
  foe('archer', 779, TOP - 1, { squad: 'liftArcher' }); foe('bat', 775, TOP - 5, { squad: 'liftBat' });
  ent('mccart', FOOT[1].board, TOP - 1, {});

  // ================= 8. THE FLOODED RUN (786-899): the EXAM - over black water, a fall here is the end of the cart =================
  B = 30;
  const t8 = TOP;                                                           /* the high line at row 27, the low line at row 30 */
  decor.push({ kind: 'flood', x0: 786, x1: 899, row: 36 });                /* THE FLOOD: black water under the trestles (drawn: a fall is a fall, the exam's real death) */
  exams.push([787, 896]);
  tell(768, 789, 'HIGH CRUSHER, LOW GATE');
  sign(785, t8 - 1, 'THE FLOODED RUN. EVERY GAP HERE IS DEEP.'); foe('bat', 796, t8 - 6, { squad: 'exBat0' });
  rail(787, 812, t8); rail(787, 812, B);
  lever('exam', 789, t8, 791, 797, t8, 'open', { label: 'HIGH: A CRUSHER / LOW: A GATE - THEN THE DEEP GAP' });
  rider('archer', 790, B, 40, { squad: 'exPair', pace: 160 }); rider('gobmage', 791, B, 110, { squad: 'exPair' });   /* the pair on the low line, ahead (the archer at his own pace: pump past him, or he is under you at the deep gap's lip) */
  crusher('ex', 800, t8, 2.4, 0.9, 0.3); gate('ex', 806, B, 2.8, 1.2, 0.2);
  beam(798, 799, B);
  tell(790, 813, 'DEEP GAP, RUNE ON LIP');
  rider('gobmage', 800, B - 3, 60, { squad: 'exRune', at: 826 });
  boostGap(813, B); ore(824, B - 5);
  /* THE FOREMAN (the exam's ELITE, deeprails2 - in the cart idiom): a goblin captain in an ARMOURED cart on your line. A blade dents it (x0.35, a told clank);
     a RAM at full pump takes a third of him (and throws your cart back a length to pump again); he lobs bombs back at you. His gate shuts the line until he is down */
  rail(821, 838, B - 3);
  tell(813, 836, 'THE FOREMAN: RAM HIS CART');
  sign(822, B - 1, 'THE FOREMAN. ONLY A RAM AT FULL PUMP DENTS HIS CART.');
  foe('brute', 838, B - 1, { squad: 'foreman', elite: true, gate: 868, eliteName: 'THE FOREMAN', ride: { foreman: true, row: B, trig: 822, at: 838, off: 0 } });
  ent('mcgobcart', 838, B - 1, {});
  ground(821, 869, B);
  walls.push({ x: 868, y0: B - 10, y1: B - 1, retry: [846, B - 1], gate: true });   /* (his gate: a crash into it puts you back behind him) */
  tell(848, 870, 'ANOTHER DEEP GAP: PUMP');
  boostGap(870, B);
  ground(878, 899, B); rail(882, 894, B - 3);
  foe('miner', 886, B - 1, { squad: 'exMiner' }); block(890, 894, B - 6, B - 6); foe('tippler', 892, B - 7, { squad: 'exTip' });

  // ================= 9. THE SMELTER (900-959), row 30: 8 ore open its points (silver three); THE BORE =================
  ground(900, 914, B); ground(938, 959, B);
  station(903);                                                             /* STATION SIX (after the exam) */
  tell(890, 912, 'THE SMELTER WANTS 8 ORE');
  sign(908, B - 1, 'THE SMELTER: CARRY 8 ORE AND ITS POINTS WILL OPEN.'); rail(900, 911, B - 3); foe('bat', 918, B - 5, { squad: 'smBat' });
  lever('smelter', 912, B, 915, 919, B, 'set', { ore: 8, label: 'THE SMELTER: 8 ORE OPEN THESE POINTS' });
  rail(920, 937, B, { noPosts: true });
  block(915, 930, B + 7, H - 1); track.push([915, 930, B + 7]); interiors.push([915, 937, B + 1, B + 6, 'smelter']);
  { let tt = B + 7; for (let i = 0; i < 7; i++) { set(931 + i, tt - 1, T.SLOPE_R1); block(931 + i, 931 + i, tt, H - 1); tt--; } track.push([931, 937, B, 'slope']); }
  ent('silver', 924, B + 6); decor.push({ kind: 'smelter', x: 922, row: B + 7 });
  decor.push({ kind: 'bore', x0: 940, x1: 959, row: B });
  /* THE APPROACH SETS HIM UP (B8): its bore SCARS in the rock from the flooded run on (round, fresh, getting bigger), fresh spoil on the line, then from 925 the
     roof SHAKES and dusts on a beat that quickens, a rumble under it, and its HEADLIGHT flickers through the rock at the end of the bore */
  for (const [x, r] of [[862, 7], [884, 9], [906, 11], [928, 14], [946, 18]]) decor.push({ kind: 'scar', x, row: B - 4, r });
  decor.push({ kind: 'spoil', x0: 939, x1: 958, row: B }); decor.push({ kind: 'rumble', x0: 925, x1: 968, row: B }); decor.push({ kind: 'headlight', x: 962, row: B - 4 });
  tell(930, 958, 'SOMETHING BORES TOWARD YOU');
  sign(942, B - 1, 'SOMETHING BIG BORED THESE TUNNELS. LISTEN.');
  foe('miner', 950, B - 1, { squad: 'boreMiner' }); rail(940, 956, B - 3);

  // ================= THE GREAT DRILL (src/great-drill.js) =================
  const AX = ARENA_X, AF = 30;
  const stage = stageDrill({ set, block, ent, air }, T, TS, AX, AF);
  stage.carve();
  ground(AX + DRILL_STAGE.W, W - 1, AF);
  ent('gate', AX + DRILL_STAGE.W + 2, AF - 1);

  /* THE ROOF OF THE MINE: rock from the top of the map down to CEIL rows over the highest line near each column (the lowest of them across
     +-6 columns, so the roof is a vault and not a saw). THE GLOW CAVERN is the open one: its roof is far up (CEIL 16), the dark drift's is low (CEIL 7) */
  { const top = new Array(W).fill(H);
    for (const [a, b, row] of track) for (let x = Math.max(0, a); x <= Math.min(W - 1, b); x++) top[x] = Math.min(top[x], row);
    for (const e of L.ents) if (e.x >= 0 && e.x < W && e.t !== 'check' && e.t !== 'sign') top[e.x] = Math.min(top[e.x], e.y + 1);
    for (let x = 0; x < ARENA_X - 1; x++) { let t = H; for (let k = Math.max(0, x - 6); k <= Math.min(W - 1, x + 6); k++) t = Math.min(t, top[k]); const CEIL = x >= 586 && x <= 630 ? 16 : x >= 176 && x <= 262 ? 8 : 9, roof = t - CEIL;
      for (let y = 0; y < roof; y++) if (L.grid[y * W + x] === T.AIR) set(x, y, T.SOLID); } }
  const START = { x: 4, y: 29 };
  const DRIFT = [176 * TS, 306 * TS];
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools: [], falls: [], moversExtra: [], interiors,
    /* WHERE A FALL IS A FALL: per column, the row three under the deepest line within 14 columns (src/minecart-hands.js) */
    mcFall: (() => { const deep = new Array(W).fill(0); for (const [a, b, row] of track) for (let x = Math.max(0, a); x <= Math.min(W - 1, b); x++) deep[x] = Math.max(deep[x], row);
      const out = []; for (let x = 0; x < W; x++) { let d = 0; for (let k = Math.max(0, x - 14); k <= Math.min(W - 1, x + 14); k++) d = Math.max(d, deep[k]); out.push((d || 30) + 3); } return out; })(),
    arena: stage.arena, gateAfterBoss: true,
    minecart: true,
    mcTells: tells, mcTrack: track, mcPoints: points, mcCrushers: crushers, mcGates: gates, mcRocks: rocks, mcBeams: beams, mcWalls: walls, mcExam: exams, mcBoost: boosts, mcTrestles: trestles, decor,
    mcRamps: ramps, mcBreaks: breaks, mcFoot: FOOT,
    /* THE DARK DRIFT (deeprails2: dark and light stretches): pitch, but for your headlamp's cone (src/minecart-hands.js holes) and the goblins' own lamps */
    dark: 0.01, darkZones: [{ x0: DRIFT[0], x1: DRIFT[1], y0: 0, y1: H * TS, dark: 0.88 }],
    mcAreas: [['THE LAMP YARD', 0, 'lamp'], ['THE DARK DRIFT', 171, 'dark'], ['THE GOBLIN LINE', 310, 'goblin'], ['THE GLOW CAVERN', 472, 'glow'], ['THE WRECK', 625, 'works'], ['THE CRUSHER WORKS', 676, 'works'], ['THE LIFT', 758, 'works'], ['THE FLOODED RUN', 786, 'flood'], ['THE SMELTER', 900, 'smelter']],
    chases: [{ id: 'cavein', name: 'THE CAVE-IN', trigger: 480 * TS, end: 604 * TS, gap0: 170, curve: [[0, 128], [700, 150, 'THE ROOF GOES FASTER']], rubber: { min: 90, max: 250, slow: 0.4, catch: 1.4 },
      contact: 'kill', look: 'rock', say: 'THE ROOF IS COMING DOWN: RIDE!', autoscroll: true, glow: 260, zone: [470 * TS, 610 * TS, 12 * TS, 40 * TS] }],
    quest: { n: 10, item: 'orenugget', name: 'ORE', done: 'ALL TEN ORE: THE SMELTER IS YOURS', thanks: 'THE SMELTER IS YOURS' },   /* (the HUD counts all ten; the smelter's lever wants eight of them) */
    sections: Object.fromEntries(SECTIONS.map(([n, x]) => [n, x])),
    calm: [[0, W - 1, 0, H - 1]],   /* placed wholly by hand: nothing sprinkled */
    checkRun: 200,   /* the stations are placed by hand, one a section (the filler adds none under 200) */
    unlocks: [
      { kind: 'mcpoints', opens: 'the line ahead: OPEN drops you to the low line, SET keeps you high (a fallen-in low line, the risky high line with ore, the hidden spur, the smelter)', hud: 'THE LEVER\'S ARROW: UP = HIGH LINE, DOWN = LOW LINE' },
      { kind: 'stray', opens: 'THE SMELTER\'s points once 8 ore are carried: its line to a silver', hud: 'ORE n/10 - THE SMELTER WANTS 8 (the quest counter, and the lever says it)' },
    ],
    music: 'mineworks',
    ambient: [{ x0: 0, x1: 99999, kind: 'mineworks' }],
    rockZones: [], masonry: [],
    palette: { sky: [[10, 8, 12], [26, 20, 22]], far: 'crag', mid: 'crag', near: 'none', dress: 'none', noFg: true, noNear: true, ledges: 'staging', haze: 'rgba(30,24,22,0.2)', murkCol: '#2a1c18', murkLit: '#8a5a30',
      darkCol: '6,4,6', lampGlow: [255, 150, 60, 0.24], darkRim: ['#c8843c', 0.26, 0.12], footLip: ['#f0be7c', 0.62], grade: ['#ff8a3c', 0.1],
      grass: '#4a3426', grassL: '#6a4a34', grassD: '#2a1a12', dirt: '#3a2618', dirtL: '#5a3a24', dirtD: '#1e120a', canopy: ['#1a1620', '#241e28', '#2e2632', '#3a303e'] },
    weather: [{ x0: 0, x1: 99999, kind: 'dust' }], duskStart: -1, duskLen: 1,
  };
}
