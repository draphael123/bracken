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
//                  full pump; (deeprails3) foes that come TO your line: a goblin on a roof timber who chops down as you pass, a rider who swings his hook in
//                  across your tub (duck, or knock him off), a goblin who LEAPS onto your line ahead (brake off his shadow, then ram him)
//   DUCK + SWITCH  (deeprails3, Daniel 10-10) under a LOW ROOF (the cart cannot jump there) a beam to duck and a SWITCH whose bridge is out until it is struck
//                  (or E): taught in the yard, tested in the dark, remixed off the works' deep gap, examined over the flood (a real death there)
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
//   786-899  THE FLOODED RUN   EXAM     over black water, real deaths: the junction under the pair, a deep gap, THE FOREMAN - THE MINI (deeprails3, src/foreman.js:
//                                      an endless loop, his armoured cart shuttles; jump on it and stomp him, three boardings), duck + switch, the last deep gap
//   900-959  THE SMELTER       the points that want 8 ore (silver three); THE BORE, the drill's own tunnel (it sets him up)
//   960-     THE GREAT DRILL   BOSS     src/great-drill.js (a goblin in a drill rig, an endless chase tunnel: ram an ore cart into its gears)
import { stageDrill, DRILL_STAGE } from './great-drill.js';
import { FOREMAN as FM } from './foreman.js';

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
  crushDmg: 18, rockDmg: 26, beamDmg: 22, gateDmg: 22,
  arrowDmg: 16, arrowV: 230, runeDmg: 22, runeT: 1.25, runeR: 15,
  archerTell: 0.7, archerCd: 2.1, casterTell: 0.6, casterCd: 2.8,
  throwTell: 0.75, throwT: 1.0, throwCd: 2.8, throwDmg: 20, throwR: 16,   /* A THROW off a ledge (deeprails2): told ('!' and the arm back), then a pick lobbed at where your cart WILL be (a mark on the rail) - brake short of it, or pump past */
  rampV0: 300, rampK: 0.5,   /* a ramp's launch: vy = -(rampV0 + rampK * pace): a cruising launch flies ~7 tiles, a pumped one ~12 (tools/minecart.mjs measures the lava ramp) */
  breakV: 170, breakLead: 56, breakLag: 0.05,   /* THE RAIL BREAKS (deeprails2): the break runs up the line behind you at breakV from breakLead px back - a cruising cart (150) is caught, a pumping one gets away */
  /* (deeprails3) THE FOREMAN is the level's MINI now: his numbers are src/foreman.js FOREMAN */
  perchTell: 0.5, perchT: 0.28, perchDmg: 18, perchReach: 64,   /* A GOBLIN ON A ROOF TIMBER: told ('!' and the pick up) when you are this close, then a chop down across the line - duck it */
  swingTell: 0.6, swingT: 0.3, swingDmg: 16, swingCd: 2.4,      /* A RIDER WHO SWINGS IN: from the parallel line, his hook up (told), then down across your tub - duck it, or knock him off */
  leapTell: 0.55, leapT: 0.85, leapDmg: 18, leapLead: 40,        /* A GOBLIN WHO LEAPS: told ('!' and his shadow where he lands, ahead of where your cart will be), then he lands on your line */
  raidTell: 0.7, boardTell: 0.85, raidCd: 1.4, raidDmg: 16, raidOff: 8, raidNear: 60,   /* (deeprails4) A RAIL RAIDER alongside on the other line: told ('!' and the arm back) a THROW at your mark, or told ('!!' a crouch, a plank) a BOARDING leap onto your line ahead (the leaper's leap and shadow) */
  leverReach: 30,     /* px: E (or a blow) throws a lever this close */
  swReach: 46,        /* (deeprails4, Daniel 10-12 'duck + switch too tight') a bridge SWITCH answers E this far off (and a blow lands on its whole stand): with the beam moved
                         back and the bridge on, a cruising cart has ~0.9 s from the beam to the bridge (was ~0.3) */
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

export const MINE = { W: 1348, H: 52, base: 30 };   /* (claude/forgemaster: 1170 -> 1348, THE SMELTER FLOOR and THE FORGE went in after the spoil pits, 178 columns) */   /* (deeprails5: 1070 -> 1170, THE SPOIL PITS went in after the flooded run) */
export const SECTIONS = [['THE LAMP YARD', 0], ['THE DARK DRIFT', 171], ['THE GOBLIN LINE', 310], ['THE GLOW CAVERN', 472], ['THE WRECK', 625], ['THE CRUSHER WORKS', 676], ['THE LIFT', 758], ['THE TWIN LINES', 786], ['THE FLOODED RUN', 856], ['THE SPOIL PITS', 970], ['THE SMELTER FLOOR', 1062], ['THE FORGE', 1180], ['THE SMELTER', 1248], ['THE GREAT DRILL', 1308]];
/* THE ON-FOOT STRETCHES (Daniel 10-09: mostly cart, plus two short stretches on foot on big platforms): from x0 the hero is out of the cart, from board he is back in one */
export const FOOT = [{ id: 'wreck', name: 'THE WRECK', x0: 632, board: 674, derail: true }, { id: 'lift', name: 'THE LIFT', x0: 763, board: 783 }, { id: 'pits', name: 'THE SPOIL PITS', x0: 974, board: 1240 }];   /* (deeprails5) the third: THE SPOIL PITS */
/* (deeprails5, Daniel 10-14 #4) THE HAND-OFF: at the end of every on-foot stretch its cart stands PARKED on the rail (board) and a GATE shuts the line just past its nose (gateCol, drawn) -
   walking up to it does not board it: you JUMP INTO the cart (a landing in its tub), and the gate swings open; until then the gate holds you (src/minecart-hands.js footStep) */
export const gateX = (f, TS = 16) => (f.board + 1) * TS + 6;
/* each mechanic's arc (columns): TAUGHT, TESTED, REMIXED, EXAMINED - read by tools/minecart.mjs */
export const ARCS = {
  points: { teach: [118, 160], test: [186, 256], remix: [538, 552], exam: [859, 870], boss: [1308, 1338] },   /* the fallen-in low line; fork A in the dark; the junction at speed in the cave-in; the exam's junction */
  speed: { teach: [52, 112], test: [314, 338], remix: [592, 624], exam: [883, 952], boss: [1308, 1338] },     /* the pump gap and the first crusher; THE RAIL BREAKS; the lava ramp; the exam's deep gaps */
  combat: { teach: [76, 90], test: [340, 440], remix: [690, 750], exam: [892, 921], boss: [1308, 1338] },    /* the miner rammed; the thrower, the rider, the caster, the slow cart, the perched goblin; the works' swinging rider; THE FOREMAN (the mini) */
  switch: { teach: [143, 163], test: [172, 189], remix: [748, 763], exam: [927, 943], boss: [1308, 1338] },
  pits: { teach: [976, 999], test: [1000, 1012], remix: [1013, 1028], exam: [1029, 1056] },   /* (deeprails5) THE SPOIL PITS on foot: high or low, the pits, the spoil, the crushers over the catwalk (A14) */
  forge: { teach: [1064, 1093], test: [1095, 1121], remix: [1123, 1150], exam: [1152, 1176], boss: [1181, 1238] },   /* (claude/forgemaster) THE SMELTER FLOOR's junction levers: a cart dropped into a plug, onto a brute, back at the loader, past the elite through the last plug; THE FORGEMASTER */
  sides: { teach: [790, 800], test: [804, 814], remix: [830, 841], exam: [859, 882], boss: [1308, 1338] },   /* (deeprails4) SWITCH SIDES: THE TWIN LINES' three splits (high: a gap, low: a beam) and the flooded run's fork; the drill's three lines */   /* (deeprails3) DUCK + SWITCH under a low roof: the yard's tunnel, the dark, off the works' deep gap, over the flood; the drill's chute points */
};
export const ARENA_X = 1308;   /* (claude/forgemaster: -> 1308, THE SMELTER FLOOR and THE FORGE before the smelter's points) */   /* (deeprails4: 960 -> 1030, THE TWIN LINES went in before the flooded run; deeprails5: -> 1130, THE SPOIL PITS after it) */
/* THE TELLS' LINES (review MF1): every tell() says one of these - five words or fewer (src/hint-lines.js routes them to the hint box) */
export const TELL_LINES = ['A GAP AHEAD: JUMP', 'LOW BEAM: HOLD DOWN', 'LONG GAP: PUMP, THEN JUMP', 'MINER ON THE LINE: RAM', 'CRUSHER: BRAKE FOR ITS BEAT', 'POINTS: STRIKE TO STAY HIGH',
  'DUCK, THEN STRIKE THE SWITCH', 'DARK: DUCK, THEN THE SWITCH', 'FORK: ORE UP, CRUSHERS DOWN', 'THE RAIL BREAKS: PUMP!', 'ROCKFALL: BRAKE OR PUMP', 'THROWER: BRAKE OFF HIS MARK',
  'RIDER: PUMP TO CATCH HIM', 'RUNES: CHANGE PACE OR JUMP', 'SLOW CART: RAM IT', 'GOBLIN ON A BEAM: DUCK', 'A DEEP GAP: PUMP HARD', 'THE ROOF IS GOING: RIDE', 'LOW LINE FALLING: GO HIGH',
  'SET THE POINTS, THEN PUMP', 'A RAMP: PUMP, THEN FLY', 'BUFFER AHEAD: YOU DERAIL', 'TWO CRUSHERS, OFF THE BEAT', 'A GATE: WATCH ITS GAUGE', 'DEEP GAP, THEN DUCK, SWITCH',
  'BRIDGE OUT, THEN THE LIFT', 'HIGH: JUMP. LOW: DUCK', 'RAIDERS ALONGSIDE: RAM OR STRIKE', 'HIGH CRUSHER, LOW GATE', 'DEEP GAP: PUMP AND JUMP', 'THE FOREMAN: JUMP ON HIM', 'DUCK, SWITCH, PUMP, JUMP', 'THE SMELTER WANTS 8 ORE', 'SOMETHING BORES TOWARD YOU',
  /* (deeprails5) */ 'A CART: JUMP INTO IT', 'THE LINE ENDS: ON FOOT', 'THE DEEP PITS KILL',
  /* (claude/forgemaster) */ 'POINTS DROP A CART: STRIKE', 'A CART RUNS HIM DOWN', 'LOADER: JUMP HIS CARTS', 'THE SLAG GUTTER KILLS', 'SEND THE SMITH A CART'];

export function buildMinecart({ painter, T, TS }) {
  const { W, H } = MINE;
  const L = painter(W, H), { set, block, ent } = L;
  const air = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.AIR); };
  const sign = (x, y, text) => ent('sign', x, y, { text });
  const roofRows = [], pits = [], examSpans = [];   const forge = { loops: [], points: [], plugs: [], loaders: [], mini: null };   /* (claude/forgemaster) THE SMELTER FLOOR and THE FORGE: src/forge-rails.js */   /* (deeprails5) THE SPOIL PITS: on-foot spans the roof is cut over, their pits, the exam span where they kill */
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
  /* A LOW ROOF (deeprails3): rock down to three rows over the line - under it the cart cannot jump (its head finds the rock), so a broken bridge is laid by its
     SWITCH or fallen into; a beam hangs in it to duck */
  const lowRoof = (x0, x1, row) => { block(x0, x1, Math.max(0, row - 12), row - 3); decor.push({ kind: 'lowroof', x0, x1, row }); };
  /* A GOBLIN ON A ROOF TIMBER over the line (deeprails3): an EXISTING foe perched two rows up at column x; from trig he readies a chop down across the line */
  const perch = (t, trig, x, row, o) => { decor.push({ kind: 'perch', x0: x - 1, x1: x + 1, row: row - 2 }); ent(t, x, row - 3, Object.assign({ face: -1, ride: { perch: true, row: row - 2, line: row, trig, at: x, off: 0 } }, o || {})); };
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
    foe('bat', 58, t - 2, { squad: 'yardBat' });
    boostGap(61, t);                                                        /* THE PUMP GAP (REQUIRED): 8 wide - a cruising jump falls in */
    ore(71, t - 3);                                                          /* (on the far lip: a pumped jump lands on it) */
    ground(69, 88, t);
    tell(58, 80, 'MINER ON THE LINE: RAM');                                 /* RAM, TAUGHT (deeprails2): you land off the pump gap at full pump - and he is on the line */
    sign(74, t - 1, 'AT FULL PUMP THE CART RAMS WHAT IS ON THE LINE. SLOWER, IT IS A BUMP.');
    foe('miner', 81, t - 1, { squad: 'yardMiner2' });
    fall(89, t, 2); }
  ground(93, 113, B); foe('bat', 111, B - 2, { squad: 'yardBat3' }); rail(93, 100, B - 3);
  tell(80, 104, 'CRUSHER: BRAKE FOR ITS BEAT');
  sign(95, B - 1, 'A CRUSHER: HOLD LEFT TO BRAKE. GO UNDER WHEN IT LIFTS.');
  crusher('first', 104, B, 2.6, 1.0, 0);                                   /* THE FIRST CRUSHER (REQUIRED): brake for it */
  { const t = rise(114, B, 4);                                              /* up onto the trestle: the high line at row 26 */
    rail(122, 168, t);
    tell(106, 150, 'POINTS: STRIKE TO STAY HIGH');
    /* DUCK + SWITCH, TAUGHT (deeprails3, Daniel 10-10: "sections where you must DUCK under things and HIT SWITCHES, otherwise you fall"): in the tunnel's low roof a
       beam to duck, then a SWITCH - its bridge is out until it is struck (or E). Under the low roof the cart cannot jump the gap; a fall here is cheap (A10) */
    tell(124, 145, 'DUCK, THEN STRIKE THE SWITCH');
    lowRoof(143, 163, t);
    beam(145, 146, t);
    sign(143, t - 1, 'A SWITCH AHEAD: ITS BRIDGE IS OUT. DUCK THE BEAM, THEN STRIKE THE SWITCH (OR PRESS E).');
    lever('yardSw', 151, t, 156, 161, t, 'open', { sw: true, label: 'THE BRIDGE IS OUT: STRIKE THE SWITCH' });
    sign(116, t - 1, 'POINTS AHEAD. STRIKE THE LEVER, OR PRESS E, TO SET THEM AND STAY HIGH.');
    lever('yard', 125, t, 128, 139, t, 'open', { label: 'THE LOW LINE IS FALLEN IN', retry: [118, t - 1], req: true });
    ground(122, 151, B - 1); fallIn(150, B - 1, [118, t - 1]);             /* under it: the low line (row 29) runs into the fall-in */
    for (let x = 140; x <= 149; x++) set(x, t, T.SOLID);                    /* (the trestle is rock over the last ten: a tunnel - the low line's end is a fall-in) */
    ent('mend', 147, B - 2); ent('coin', 145, B - 2); ent('coin', 146, B - 2); ent('coin', 148, B - 2); ent('coin', 149, B - 2);
    rail(70, 88, 25); for (const x of [74, 78, 82]) ent('coin', x, 24);      /* a jump-up line over the hump */
    station(164, t - 1);                                                    /* STATION ONE, on the high line past the switch (deeprails3: 148 -> 164, past the teach) */
    rise(169, t, 1); ground(171, 172, t - 1); }                            /* on up to row 25 at 171 */

  // ================= 2. THE DARK DRIFT (171-309), row 25: pitch dark - your headlamp's cone; fork A, the hidden lever =================
  B = 25;
  /* DUCK + SWITCH, TESTED (deeprails3): the same in the pitch dark - the beam and the switch show by their own lamps (src/minecart-hands.js holes) */
  ground(173, 182, B); ground(189, 189, B); ent('coin', 184, B - 2); ent('coin', 185, B - 2);
  tell(150, 174, 'DARK: DUCK, THEN THE SWITCH');
  lowRoof(172, 189, B);
  beam(174, 175, B);
  lever('driftSw', 180, B, 183, 188, B, 'open', { sw: true, label: 'THE BRIDGE IS OUT: STRIKE THE SWITCH' });
  { const t = rise(190, B, 4);                                              /* FORK A: up to the high line (row 21) */
    ground(198, 262, B);                                                    /* the low line under it */
    rail(198, 217, t); rail(222, 231, t); rail(240, 252, t);                /* the high line: a gap, then a PUMP GAP (miss it and you drop to the low line, at its gate), ore, bats in the jumps, an archer at the landing */
    tell(176, 199, 'FORK: ORE UP, CRUSHERS DOWN');
    sign(196, t - 1, 'FORK: HIGH LINE IS QUICK, WITH ORE AND ARROWS. STRIKE THE POINTS FOR LOW: CRUSHERS, A GATE.');
    lever('forkA', 199, t, 202, 213, t, 'set', { label: 'HIGH: QUICK, ORE, ARROWS / LOW: CRUSHERS, A GATE' });
    ore(220, t - 3); foe('bat', 231, t + 2, { squad: 'forkABat' }); foe('bat', 207, t - 2, { squad: 'forkABat3' });   /* (deeprails3: a bat over the fork's first gap - the screen was empty) */ ore(234, t - 3); foe('bat', 219, t + 2, { squad: 'forkABat2' });
    foe('archer', 243, t - 1, { squad: 'forkAArcher' }); foe('archer', 228, t - 1, { squad: 'forkAArcher2' });   /* (two on the dark high line: their lamps are all you see of them - pump and ram, or strike) */
    crusher('forkA', 214, B, 2.4, 0.9, 0.6); crusher('forkA2', 228, B, 2.2, 0.8, 1.5);
    gate('forkA', 238, B, 3.2, 1.5, 0); }
  ground(263, 279, B); ground(308, 313, B); rail(253, 262, B - 3);
  foe('sapper', 268, B - 1, { squad: 'hidSapper' });
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
  /* (deeprails4: the ore that hung over the caster here went to THE TWIN LINES' second gap - the high side's) */
  tell(400, 421, 'SLOW CART: RAM IT');
  rider('archer', 412, B, 150, { squad: 'gl3', slow: 64 });                 /* a SLOW cart on your own line: RAM it at full pump (or jump into it) */
  /* CART COMBAT 2 (deeprails3, Daniel 10-10: "combat doesn't work well with the cart" - foes that come TO your line): A GOBLIN ON A ROOF TIMBER over the low beam.
     He chops down as you pass (told: '!', his pick up) - duck the beam and his chop goes over you too, or cut him off his perch first (a jump-cut) */
  tell(418, 440, 'GOBLIN ON A BEAM: DUCK');
  perch('miner', 420, 437, B, { squad: 'glPerch' });
  beam(440, 441, B);                                                         /* DUCK, TESTED: under the perched goblin's chop */
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
  ore(516, B - 5); rider('archer', 494, B - 3, 50, { squad: 'cvPacer' }); foe('bat', 522, B - 2, { squad: 'cvBat' }); foe('brute', 534, B - 1, { squad: 'cvBrute' });
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
  rock('c7', 588, 596, B - 3); foe('miner', 597, B - 1, { squad: 'cvMiner' }); rider('gobmage', 580, B - 3, 70, { squad: 'cvCaster', at: 592 });
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
  sign(639, B - 1, 'THE WRECK. ON FOOT THROUGH THE YARD: A CART WAITS AT ITS END. JUMP INTO IT.');
  block(645, 662, B - 2, B - 1);             /* THE LOADING DECK: two up (a fight on footing - a big platform) */
  foe('sapper', 651, B - 3, { squad: 'wkSapper' }); foe('brute', 661, B - 3, { squad: 'wkBrute' }); foe('sapper', 669, B - 1, { squad: 'wkSapper2' });   /* (the brute holds the deck's far edge: the fight is up on the platform) */
  block(655, 660, B - 7, B - 7); foe('archer', 658, B - 8, { squad: 'wkArcher' });   /* an archer on the yard's gantry over the deck */
  ent('coin', 648, B - 3); ent('coin', 650, B - 3); ore(661, B - 5);
  tell(648, 674, 'A CART: JUMP INTO IT');                                 /* (deeprails5 #4, TAUGHT ONCE HERE - a sign, this tell, the glint: src/stuck-spots.js mc-board-wreck) */
  sign(670, B - 1, 'THE CART IS PARKED. JUMP INTO IT: THE GATE OPENS WHEN YOU ARE IN.');
  ent('mccart', FOOT[0].board, B - 1, {});                                  /* the cart that waits at the yard's end, PARKED: jump into it (deeprails5) - its gate shuts the line till you do */

  // ================= 6. THE CRUSHER WORKS (676-757), row 37: REMIX - speed, and a rider pacing you =================
  tell(676, 698, 'TWO CRUSHERS, OFF THE BEAT');
  sign(677, B - 1, 'THE CRUSHER WORKS. EVERY CRUSHER HAS ITS BEAT.');
  foe('miner', 687, B - 1, { squad: 'wkMiner' });                        /* (deeprails3) a miner on the line off the boarding: ram him at full pump (the ram remixed before the crushers) */
  crusher('w1', 698, B, 2.2, 0.8, 0); crusher('w2', 706, B, 2.2, 0.8, 1.1);   /* a pair, off the beat: one brake, one go */
  ground(677, 715, B); rail(700, 712, B - 3);
  tell(695, 722, 'A GATE: WATCH ITS GAUGE');
  gate('w', 722, B, 3.0, 1.3, 0.4);                                         /* THE TIMED GATE: its gauge says when */
  thrower(690, 714, B - 7, { squad: 'wkThrow' });                          /* A THROWER over the crusher run: brake for a beat and his pick finds you (the remix: two timings at once) */
  /* THE WORKS' EXAM: the pump gap under the tippler is a REAL DEATH, told, with a bat in the jump */
  tell(712, 736, 'DEEP GAP, THEN DUCK, SWITCH');
  ground(716, 735, B);
  boostGap(736, B); exams.push([731, 745]);
  block(737, 742, B - 7, B - 7); foe('tippler', 740, B - 8, { squad: 'wTip' });
  foe('bat', 739, B - 4, { squad: 'wGapBat' });
  /* DUCK + SWITCH, REMIXED (deeprails3): off the deep gap, under the works' low roof - a beam, the switch, its bridge (a cheap fall: the exam is the gap) */
  ground(744, 756, B);
  tell(729, 763, 'BRIDGE OUT, THEN THE LIFT');
  lowRoof(748, 763, B);
  beam(749, 750, B);
  lever('worksSw', 755, B, 757, 762, B, 'open', { sw: true, label: 'THE BRIDGE IS OUT: STRIKE THE SWITCH' });
  /* A RIDER WHO SWINGS IN (deeprails3): a goblin on the parallel line alongside you, his hook up (told '!') - he swings it down across your tub: duck it, or knock him off first */
  rail(718, 734, B - 3); rider('miner', 718, B - 3, 6, { squad: 'wSwing', swing: true });
  crusher('w3', 728, B, 2.0, 0.7, 0.5);
  /* THE HIGH WORKINGS (optional, silver two): a jump up off the parallel line onto a high trestle, and a hop off it for the silver */
  rail(720, 734, B - 6); ore(724, B - 8); ent('silver', 730, B - 9); foe('bat', 727, B - 10, { squad: 'wHighBat' });

  // ================= 7. THE LIFT (758-785): ON FOOT - the line ends at a cage lift; up ten rows, a cart waits at the top =================
  decor.push({ kind: 'buffer', x: 764, row: B, soft: true });               /* (the line's end: you step out - no crash) */
  ground(763, 764, B);
  ground(765, 767, B);                                                      /* (the cage rests on the yard floor: no pit under it) */
  ent('mover', 765, B, { len: 3, vert: true, rise: 10, period: 5.6 });      /* THE CAGE LIFT: down at the yard, up at the high line, and down again */
  decor.push({ kind: 'lift', x0: 765, x1: 767, y0: B - 10, y1: B });
  sign(763, B - 1, 'THE LIFT. RIDE IT UP: A CART WAITS AT THE TOP.');
  const TOP = B - 10;                                                       /* (row 27) */
  ground(768, 786, TOP);
  station(772, TOP - 1);                                                    /* STATION FIVE (at the top of the lift) */
  foe('archer', 779, TOP - 1, { squad: 'liftArcher' }); foe('bat', 773, TOP - 2, { squad: 'liftBat' });
  ent('mccart', FOOT[1].board, TOP - 1, {});

  // ================= 7b. THE TWIN LINES (786-856): SWITCH SIDES and THE RAIL RAIDERS (deeprails4, Daniel 10-12 live) =================
  /* Two lines side by side through the works' last yard: the HIGH line (row 27, on trestles - you come off the lift on it) and the LOW line (row 30, the yard floor).
     Each stretch is blocked on BOTH sides - a LOW BEAM on the low line (DUCK) and a GAP in the high line over it (JUMP): pick your side, per stretch. You change sides by the
     SIDE SWITCH (the level's verb: a points lever on the high line - thrown OPEN, its points drop you to the low line) or the cart's own jump (low -> high) and down + jump
     (high -> low). Some of it is only one side's: the ore over the second gap (only the high line's jump takes it), the low line's coins and a mend. A fall through a high
     gap lands you on the low line AT its beam (cheap - duck as you drop). TEACH (the first stretch, signed), TEST (the second, unsigned, the ore), THE RAIL RAIDERS (CART
     COMBAT 3: goblin carts draw alongside on the OTHER line - they throw, and they BOARD: a leap onto your line ahead, told by his shadow; strike across from a jump, ram his
     cart when you share a line), REMIX (the third stretch with a raider alongside), and the EXAM (the flooded run's fork: HIGH - a gap and a crusher / LOW - a beam and a gate) */
  { const HI = TOP, LO = 30;
    ground(787, 856, LO);                                                    /* the low line: the yard floor (no pit: a fall from the high line is a drop, not a death) */
    rail(787, 797, HI); rail(801, 811, HI); rail(815, 838, HI); rail(842, 856, HI);   /* the high line, broken over each beam: gaps 798-800, 812-814, 839-841 */
    tell(776, 798, 'HIGH: JUMP. LOW: DUCK');
    sign(787, HI - 1, 'TWIN LINES. HIGH: JUMP THE GAPS. LOW: DUCK THE BEAMS. THE SWITCH DROPS YOU LOW.');
    lever('twinA', 790, HI, 792, 794, HI, 'set', { label: 'SET: STAY HIGH / OPEN: DROP TO THE LOW LINE', side: true });   /* TEACH: the side switch, then the first split */
    beam(798, 799, LO); for (const x of [792, 794, 796]) ent('coin', x, LO - 2);
    lever('twinB', 804, HI, 806, 808, HI, 'set', { label: 'SET: STAY HIGH / OPEN: DROP TO THE LOW LINE', side: true });   /* TEST: no sign; the ore is the high side's, the mend the low side's */
    beam(812, 813, LO); ore(813, HI - 4); ent('mend', 808, LO - 2);
    /* THE RAIL RAIDERS: EXISTING foes (a goblin miner in a cart, the riders' machinery) with a raid: they roll up alongside you on the other line and, told, THROW (a pick
       at your mark) or BOARD (a crouch on the rim, a plank, then a leap onto your line ahead - his shadow on your rail: brake off it, then ram him) */
    tell(794, 816, 'RAIDERS ALONGSIDE: RAM OR STRIKE');
    rider('miner', 806, LO, -40, { squad: 'raidLo', raid: true, until: 858 });
    rider('miner', 818, HI, -30, { squad: 'raidHi', raid: true, until: 858 });   /* (they peel off down a siding at the yard's end) */
    lever('twinC', 830, HI, 832, 834, HI, 'set', { label: 'SET: STAY HIGH / OPEN: DROP TO THE LOW LINE', side: true });   /* REMIX: a split with a raider alongside */
    beam(839, 840, LO); for (const x of [843, 845]) ent('coin', x, HI - 2); }

  // ================= 8. THE FLOODED RUN (856-969): the EXAM - over black water, a fall here is the end of the cart =================
  B = 30;
  const t8 = TOP;                                                           /* the high line at row 27, the low line at row 30 */
  decor.push({ kind: 'flood', x0: 856, x1: 969, row: 36 });                /* THE FLOOD: black water under the trestles (drawn: a fall is a fall, the exam's real death) */
  exams.push([857, 966]);
  tell(830, 859, 'HIGH CRUSHER, LOW GATE');
  sign(855, t8 - 1, 'THE FLOODED RUN. EVERY GAP HERE IS DEEP.'); foe('bat', 867, t8 + 1, { squad: 'exBat0' });
  rail(857, 867, t8); rail(871, 882, t8); rail(857, 882, B);   /* (deeprails4) THE EXAM's SIDES: the high line's gap (868-870, over the low beam) then its crusher; the low line's beam then its gate */
  lever('exam', 859, t8, 861, 867, t8, 'open', { label: 'HIGH: A CRUSHER / LOW: A GATE - THEN THE DEEP GAP' });
  rider('archer', 860, B, 40, { squad: 'exPair', pace: 160 }); rider('gobmage', 861, B, 110, { squad: 'exPair' });   /* the pair on the low line, ahead (the archer at his own pace: pump past him, or he is under you at the deep gap's lip) */
  crusher('ex', 873, t8, 2.4, 0.9, 0.3); gate('ex', 876, B, 2.8, 1.2, 0.2);
  beam(868, 869, B);
  tell(860, 883, 'DEEP GAP: PUMP AND JUMP');
  boostGap(883, B); ore(888, B - 3);                                       /* (an ore on the pumped arc over the deep gap: a risk) */
  /* THE FOREMAN (deeprails3: THE DEEP RAILS' MINI - Daniel 10-10: 'a mini boss in another cart: you jump on it, it goes back and forth, an infinite repeating
     section until you complete it'). src/foreman.js: THE LOOP (892-921) - the Great Drill's treadmill: the world runs past at cruise, your cart and his hold their
     places on it until he is down. His ARMOURED cart shuttles on your line ahead of you. JUMP ON HIS CART as he drops back (or as he rams
     you) and STOMP him - a third of him; he LURCHES you back into your own cart (the loop has no gap: never an untold death). Blades from your cart clank (x0.4) */
  tell(877, 900, 'THE FOREMAN: JUMP ON HIM');
  ground(891, 936, B);   /* (one line in the loop: a high line over it caught every jump - the jump goes ON him) */
  sign(891, B - 1, 'THE FOREMAN. HIS CART IS ARMOURED: JUMP ON IT AND STOMP HIM.');
  foe('brute', FM.cols[0] + Math.round(FM.homeR / TS), B - 1, { squad: 'foreman', mini: true, wKey: 'foreman', ride: { foreman: true, row: B, trig: 886, at: FM.cols[0] + Math.round(FM.homeR / TS), off: 0 } });
  ent('mcgobcart', FM.cols[0] + Math.round(FM.homeR / TS), B - 1, {});
  for (let y = B - 9; y <= B - 1; y++) set(FM.cols[1], y, T.PORT);        /* THE WAY ON: shut while he rides (his mini gate - src/main.js miniEnd opens it) */
  /* STATION SIX (deeprails4, Daniel 10-12 live: 'redoing him after a later death is the pain'): RIGHT AFTER THE FOREMAN's gate - a death in the duck + switch exam,
     the last deep gap or at the drill comes back here, never before him (it was at 973, past the exam: one shrine moved, not one added - A10b) */
  station(924);
  /* DUCK + SWITCH, THE EXAM (deeprails3): out of his loop, under a low roof - a beam, the switch, its bridge over the black water (a REAL death here: told), then
     straight off it into the last deep gap: duck, switch, pump, jump */
  tell(905, 945, 'DUCK, SWITCH, PUMP, JUMP');
  lowRoof(927, 943, B);
  beam(929, 930, B);
  lever('examSw', 935, B, 937, 942, B, 'open', { sw: true, label: 'THE BRIDGE IS OUT: STRIKE THE SWITCH' });
  ground(943, 944, B);
  boostGap(945, B); foe('bat', 952, B - 2, { squad: 'exGapBat' });   /* (deeprails4) a bat in the last deep gap's jump (the exam's last screen was empty) */
  ground(953, 969, B); rail(955, 965, B - 3);
  foe('miner', 960, B - 1, { squad: 'exMiner' }); block(960, 964, B - 6, B - 6); foe('tippler', 962, B - 7, { squad: 'exTip' });


  // ================= 8b. THE SPOIL PITS (970-1069): ON FOOT - A14 PLATFORMING, HIGH OR LOW (deeprails5, Daniel 10-14: 'a PIT section: lots of pits; hazards you avoid by
  // jumping UP over them or dropping DOWN to a lower line') =================
  /* The flooded run's line runs out (a soft buffer: you step out) into the goblins' old SPOIL WORKINGS - a field of PITS whose floors are the spoil's broken pit-props (spikes:
     a bite and back to your last footing outside the exam - A10 amended; a REAL death in its exam, told) - and TWO WAYS ACROSS ON FOOT: the HIGH CATWALK (row 26, timber planks -
     you walk them, jump their gaps; DOWN + JUMP drops you through them) and the LOW WALK under it (row 30, on rock piers between the pits). Something is IN THE WAY on each line:
     on the catwalk SPOIL heaped on the planks (JUMP UP over it) and CRUSHERS (time them, or DROP DOWN to the low walk under them); on the low walk the PITS (jump them) and spoil
     on the walk. The low walk is four rows under the catwalk: no jump goes back up through it - a STEP at the end of a low stretch is the way up. Choose high or low, per stretch.
     TEACH 976-999 (signed: a catwalk over the first pit, spoil on the planks, a crusher over the catwalk with the low walk clear under it, a step back up), TEST 1000-1013 (the
     catwalk's first gap over a pit, a sapper on the low walk, spoil on it), REMIX 1014-1028 (a gap in BOTH lines at once, a crusher high and spoil low with a step), EXAM
     1029-1056 (examSpans: the pits kill; spoil and a crusher high, two pits low, both lines broken over the last pit, and on the last pier THE ELITE BRUTE with that pit at your
     back), STATION SEVEN (1058) after it, then THE PARKED CART (1062) - JUMP INTO IT: its gate opens (deeprails5 #4). No ore here (the quest's ten stay where they were) */
  { const D = 30, U = 26, PF = 34;
    const low = (x0, x1) => { block(x0, x1, D, H - 1); roofRows.push([x0, x1, U]); };
    const pitAt = (x0, x1) => { block(x0, x1, PF + 1, H - 1); for (let x = x0; x <= x1; x++) set(x, PF, T.SPIKE); roofRows.push([x0, x1, U]); pits.push([x0, x1]); decor.push({ kind: 'pit', x0, x1, row: PF }); };
    const walk = (x0, x1) => { for (let x = x0; x <= x1; x++) set(x, U, T.ONEWAY); roofRows.push([x0, x1, U]); decor.push({ kind: 'catwalk', x0, x1, row: U }); };
    const spoil = (x0, x1, row) => { for (let x = x0; x <= x1; x++) set(x, row - 1, T.SPIKE); decor.push({ kind: 'spoilheap', x0, x1, row }); };
    const stepUp = x => block(x, x + 1, D - 2, H - 1);   /* a two-row step off the low walk: from it a jump makes the catwalk */
    tell(950, 974, 'THE LINE ENDS: ON FOOT');
    ground(970, 975, D); decor.push({ kind: 'buffer', x: 975, row: D, soft: true });   /* the line runs out: a soft buffer, you step out (FOOT[2].x0) */
    /* TEACH (976-999) */
    low(976, 985); sign(977, D - 1, 'THE SPOIL PITS BITE. HIGH: THE CATWALK, JUMP WHAT IS ON IT. LOW: JUMP THE PITS.');
    stepUp(980); walk(982, 1001);
    pitAt(986, 988); low(989, 991); pitAt(992, 993); low(994, 999);
    for (const x of [985, 987, 989]) ent('coin', x, U - 2);   /* (the high way over the first pit pays) */
    spoil(990, 991, U); sign(984, U - 1, 'A CRUSHER OVER THE CATWALK: TIME IT, OR DOWN + JUMP TO DROP UNDER IT.');
    crusher('pt1', 995, U, 2.6, 1.0, 0.2);
    stepUp(998);
    /* TEST (1000-1013) */
    pitAt(1000, 1003); low(1004, 1012); walk(1005, 1012);   /* the catwalk's first gap (1002-1004) over the pit: jump it, or fall in */
    foe('sapper', 1006, D - 1, { squad: 'ptSapper' }); spoil(1010, 1011, D); spoil(1007, 1007, U);   /* (and one heap on the catwalk: the test asks the high line's jump too; the sapper at 1006, not 1008: fought at the heap's foot, the jump over it came from a stand) */
    foe('bat', 1003, U - 4, { squad: 'ptBat' });
    /* REMIX (1013-1028) */
    pitAt(1013, 1015); walk(1016, 1028); low(1016, 1019);    /* both lines broken over one pit: one jump, either line */
    crusher('pt2', 1017, U, 2.4, 0.9, 1.1); pitAt(1020, 1022); low(1023, 1028); spoil(1024, 1025, D); stepUp(1027);
    foe('archer', 1025, U - 1, { squad: 'ptArcher' });
    /* THE EXAM (1029-1056): the pits kill here (told) */
    tell(1004, 1029, 'THE DEEP PITS KILL');
    pitAt(1029, 1032); walk(1029, 1041); low(1033, 1034); pitAt(1035, 1036); low(1037, 1041);
    spoil(1033, 1033, U); crusher('pt3', 1037, U, 2.2, 0.8, 0.5);   /* (the heap ONE wide: two wide, a jump from a near stand came down on its last column - the curve pilot died there every run; the crusher at 1037, not 1039: the catwalk keeps a three-column run-up to the last pit) */
    pitAt(1042, 1044); walk(1045, 1049); low(1045, 1063);   /* both lines broken over the last pit: a fall from either is a death (3 wide, a run-up of five: reach-heroes) */
    foe('bat', 1042, U - 3, { squad: 'ptExBat' });
    foe('brute', 1048, D - 1, { squad: 'ptElite', elite: true });   /* THE SECTION'S EXAM (difficulty v2): one weighty elite on the last pier, the pit at your back */
    examSpans.push([1029, 1056]);
    /* STATION SEVEN after the exam, then THE PARKED CART: JUMP INTO IT (its gate opens) */
    station(1058, D - 1);
    sign(1059, D - 1, 'THE SMELTER FLOOR AHEAD, ON FOOT. THE SMITH WORKS AT ITS END.'); }   /* (claude/forgemaster: the parked cart moved on past THE FORGE - FOOT[2].board 1240) */
  forgeFloor();
  // ================= 8c. THE SMELTER FLOOR (1062-1179) and THE FORGE (1180-1239): ON FOOT - THE FORGEMASTER, the second mini (claude/forgemaster, Daniel 10-15) =================
  /* Daniel: "the Forge Master ... you'd fight him ON FOOT, but minecarts come by that LAUNCH at the boss, and he'll occasionally launch them at you". The smelter the
     backdrop's chimney has promised since the glow cavern: its floor runs on from the spoil pits' last shrine, on foot, under THE LOOP - the ore line overhead (row 26,
     four rows up: out of a jump's reach) where the smelter's carts roll mouth to mouth. In the line are POINTS, and beside them on the floor their JUNCTION LEVER (the
     level's own verb - a blow, or E): thrown, the next cart over the points DROPS to the floor and rolls on along it (src/forge-rails.js). TEACH (a slag plug shuts the
     floor: send a cart into it - the REQUIRED use), TEST (a brute on the floor: a cart runs him down), REMIX (a LOADER kicks carts down the floor at you: jump them, and
     drop one back on him), EXAM (a slag gutter at your back that kills, the ELITE, and the last plug - one cart for both), a shrine, and THE FORGE: the smith himself.
     The levers, the plugs, the loader and his lanes are src/forge-rails.js; the smith is src/main.js updateForgemaster (e.rails). */
  function forgeFloor() { const D = 30, U = 26, S = 1062;
    const loop = (id, x0, x1, zone, o) => { rail(x0, x1, U); forge.loops.push(Object.assign({ id, row: U, x0, x1, every: 2.8, speed: 120, carts: 3, zone }, o || {}));
      decor.push({ kind: 'loopmouth', x: x0, row: U, west: true }, { kind: 'loopmouth', x: x1 + 1, row: U }); };
    const junction = (id, lp, lx, px, zone) => { forge.points.push({ id, loop: lp, x: lx, lrow: D, x0: px, x1: px + 2, row: U, zone }); decor.push({ kind: 'junction', x: lx, row: D, x0: px, x1: px + 2, prow: U }); };
    const plug = (id, x0, x1) => { forge.plugs.push({ id, x0, x1, y0: D - 5, y1: D - 1 }); decor.push({ kind: 'slagplug', x0, x1, row: D }); };   /* built OPEN (the static tools read the floor through); the hands shut it on load */
    const gutter = (x0, x1) => { block(x0, x1, D + 5, H - 1); for (let x = x0; x <= x1; x++) set(x, D + 4, T.SPIKE); pits.push([x0, x1]); roofRows.push([x0, x1, U]); decor.push({ kind: 'slaggutter', x0, x1, row: D + 4 }); };
    const buffer = x => decor.push({ kind: 'buffer', x, row: D, soft: true });
    ground(S, S + 89, D); gutter(S + 90, S + 92); ground(S + 93, S + 185, D);
    decor.push({ kind: 'smelterfloor', x0: S, x1: S + 177, row: D });
    /* TEACH (1062-1093): the loop, its junction, a slag plug across the floor - send the cart into it (a failure costs a wait for the next cart) */
    sign(S + 1, D - 1, 'THE SMELTER FLOOR. THE ORE CARTS RUN THE LOOP OVER YOUR HEAD.');
    tell(S - 16, S + 7, 'POINTS DROP A CART: STRIKE');
    loop('fTeach', S + 2, S + 22, [S + 2, S + 29]);
    junction('jTeach', 'fTeach', S + 7, S + 10, [S + 2, S + 29]);
    sign(S + 5, D - 1, 'A JUNCTION LEVER: STRIKE IT, OR E. THE NEXT CART DROPS INTO THE PLUG.');
    plug('pTeach', S + 26, S + 27);
    for (const x of [S + 14, S + 17, S + 20]) ent('coin', x, D - 2);
    /* TEST (1094-1121): a brute holds the floor past the lever - a cart runs him down */
    tell(S + 10, S + 37, 'A CART RUNS HIM DOWN');
    loop('fTest', S + 33, S + 56, [S + 33, S + 59]); buffer(S + 59);
    junction('jTest', 'fTest', S + 37, S + 40, [S + 33, S + 59]);
    foe('brute', S + 50, D - 1, { squad: 'smBrute' });
    /* REMIX (1122-1151): THE LOADER - a goblin at the dock kicks carts down the floor at you (told: '!' and the lane): jump them, and drop one back on him */
    tell(S + 36, S + 62, 'LOADER: JUMP HIS CARTS');
    sign(S + 61, D - 1, 'THE LOADER KICKS CARTS DOWN THE FLOOR. JUMP THEM - AND SEND HIM ONE BACK.');
    buffer(S + 60); loop('fRemix', S + 62, S + 84, [S + 62, S + 88]);
    junction('jRemix', 'fRemix', S + 65, S + 68, [S + 62, S + 88]);
    foe('miner', S + 86, D - 1, { squad: 'smLoader', loader: true });
    forge.loaders.push({ id: 'loader', squad: 'smLoader', x: S + 86, row: D, zone: [S + 60, S + 88], every: 3.6 });
    /* EXAM (1152-1176): the SLAG GUTTER kills here (told), the ELITE on the footing past it with the gutter at your back, and the last plug - one cart can take both */
    tell(S + 66, S + 90, 'THE SLAG GUTTER KILLS');
    examSpans.push([S + 88, S + 114]);
    loop('fExam', S + 94, S + 108, [S + 94, S + 112]);
    junction('jExam', 'fExam', S + 95, S + 98, [S + 94, S + 112]);
    foe('brute', S + 104, D - 1, { squad: 'smElite', elite: true });
    plug('pExam', S + 110, S + 111);
    station(S + 115, D - 1);   /* STATION EIGHT: the exam's shrine, and the one before the smith (A10c) */
    /* THE FORGE (1180-1239): THE FORGEMASTER, THE SECOND MINI. The loop runs the length of his room; three junctions on the floor; he wakes at the furnace end */
    tell(S + 92, S + 124, 'SEND THE SMITH A CART');
    sign(S + 119, D - 1, 'THE FORGE. HIS IRON TURNS HALF A CUT. SEND A CART INTO HIM AND HE TAKES IT ALL.');
    loop('fForge', S + 120, S + 174, [S + 120, S + 174], { every: 2.4, speed: 130, carts: 4 });
    junction('jForgeA', 'fForge', S + 124, S + 127, [S + 120, S + 174]);
    junction('jForgeB', 'fForge', S + 142, S + 145, [S + 120, S + 174]);
    junction('jForgeC', 'fForge', S + 158, S + 161, [S + 120, S + 174]);
    for (const x of [S + 121, S + 150, S + 174]) ent('torch', x, D - 1);
    decor.push({ kind: 'furnace', x: S + 173, row: D });
    foe('forgemaster', S + 166, D - 1, { mini: true });
    for (let y = D - 9; y <= D - 1; y++) set(S + 177, y, T.PORT);   /* his gate onto the smelter's line: shut until the smith is down (src/main.js miniEnd) */
    forge.mini = { x0: (S + 119) * TS, x1: (S + 177) * TS, floor: D * TS, trigger: (S + 124) * TS, wallL: S + 118, gate: S + 177, boss: 'forgemaster', name: 'THE FORGEMASTER',
      y0: (D - 12) * TS, y1: (D + 1) * TS, forge: 'rails', loopRow: U };
    /* past his gate: THE PARKED CART (FOOT[2].board) - jump into it and its gate opens (taught at THE WRECK; its sign here, its glint after a stall - no tell in his room) */
    sign(S + 175, D - 1, 'A CART WAITS: JUMP INTO IT AND THE GATE OPENS.');
    ent('mccart', FOOT[2].board, D - 1, {}); }
  // ================= 9. THE SMELTER (1248-1307), row 30: 8 ore open its points (silver three); THE BORE =================
  ground(1248, 1262, B); ground(1286, 1307, B);
  tell(1239, 1260, 'THE SMELTER WANTS 8 ORE');
  sign(1256, B - 1, 'THE SMELTER: CARRY 8 ORE AND ITS POINTS WILL OPEN.'); rail(1248, 1259, B - 3); foe('bat', 1264, B - 2, { squad: 'smBat' });
  lever('smelter', 1260, B, 1263, 1267, B, 'set', { ore: 8, label: 'THE SMELTER: 8 ORE OPEN THESE POINTS' });
  rail(1268, 1285, B, { noPosts: true });
  block(1263, 1278, B + 7, H - 1); track.push([1263, 1278, B + 7]); interiors.push([1263, 1285, B + 1, B + 6, 'smelter']);
  { let tt = B + 7; for (let i = 0; i < 7; i++) { set(1279 + i, tt - 1, T.SLOPE_R1); block(1279 + i, 1279 + i, tt, H - 1); tt--; } track.push([1279, 1285, B, 'slope']); }
  ent('silver', 1272, B + 6); decor.push({ kind: 'smelter', x: 1270, row: B + 7 });
  decor.push({ kind: 'bore', x0: 1288, x1: 1307, row: B });
  /* THE APPROACH SETS HIM UP (B8): its bore SCARS in the rock from the flooded run on (round, fresh, getting bigger), fresh spoil on the line, then from 1273 the
     roof SHAKES and dusts on a beat that quickens, a rumble under it, and its HEADLIGHT flickers through the rock at the end of the bore */
  for (const [x, r] of [[932, 7], [954, 9], [1004, 10], [1046, 10], [1254, 11], [1276, 14], [1294, 18]]) decor.push({ kind: 'scar', x, row: B - 4, r });
  decor.push({ kind: 'spoil', x0: 1287, x1: 1306, row: B }); decor.push({ kind: 'rumble', x0: 1273, x1: 1316, row: B }); decor.push({ kind: 'headlight', x: 1310, row: B - 4 });
  tell(1278, 1306, 'SOMETHING BORES TOWARD YOU');
  sign(1290, B - 1, 'SOMETHING BIG BORED THESE TUNNELS. LISTEN.');
  /* A GOBLIN WHO LEAPS ONTO YOUR LINE (deeprails3): off his ledge over the bore's mouth, told ('!' and a shadow on your rail where he will land) - brake off his landing
     or pump past it, then RAM him off the line (or strike) */
  rail(1288, 1304, B - 3); block(1294, 1298, B - 7, B - 7); decor.push({ kind: 'ledge', x0: 1294, x1: 1298, row: B - 7 });
  foe('miner', 1296, B - 8, { squad: 'boreJumper', ride: { jumper: true, row: B - 7, trig: 1282, at: 1296, off: 0 } });

  // ================= THE GREAT DRILL (src/great-drill.js) =================
  const AX = ARENA_X, AF = 30;
  const stage = stageDrill({ set, block, ent, air }, T, TS, AX, AF);
  stage.carve();
  ground(AX + DRILL_STAGE.W, W - 1, AF);
  ent('gate', AX + DRILL_STAGE.W + 2, AF - 1);

  /* THE ROOF OF THE MINE: rock from the top of the map down to CEIL rows over the highest line near each column (the lowest of them across
     +-6 columns, so the roof is a vault and not a saw). THE GLOW CAVERN is the open one: its roof is far up (CEIL 16), the dark drift's is low (CEIL 7) */
  { const top = new Array(W).fill(H);
    for (const [a, b, row] of [...track, ...roofRows]) for (let x = Math.max(0, a); x <= Math.min(W - 1, b); x++) top[x] = Math.min(top[x], row);
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
    /* THE FOREMAN, THE MINI (deeprails3, src/foreman.js): his loop is the mini's room - the wall behind you shuts, the way on (its gate) opens when he falls */
    mini: { x0: FM.cols[0] * TS, x1: FM.cols[1] * TS, floor: FM.low * TS, trigger: (FM.cols[0] + 4) * TS, wallL: FM.cols[0] - 1, gate: FM.cols[1], boss: 'brute', name: 'THE FOREMAN', y0: (FM.high - 9) * TS, y1: (FM.low + 1) * TS, foreman: true },
    /* (claude/forgemaster) THE FORGEMASTER, THE SECOND MINI (src/main.js L.mini2: the game fights the Foreman first, then him - one mini at a time, each beaten for good, B18) */
    mini2: forge.mini, forgeLoops: forge.loops, forgePoints: forge.points, forgePlugs: forge.plugs, forgeLoaders: forge.loaders,
    foeHp: { foreman: 22 },   /* (the Foreman: a goblin captain in an armoured cart - stomps take him in thirds; this is what a blade chips at) */
    minecart: true,
    mcTells: tells, mcTrack: track, mcPoints: points, mcCrushers: crushers, mcGates: gates, mcRocks: rocks, mcBeams: beams, mcWalls: walls, mcExam: exams, mcBoost: boosts, mcTrestles: trestles, decor,
    mcRamps: ramps, mcBreaks: breaks, mcFoot: FOOT,
    examSpans, mcPits: pits,   /* (deeprails5) THE SPOIL PITS: where their spikes kill (src/survival.js examAt), and every pit */
    /* THE DARK DRIFT (deeprails2: dark and light stretches): pitch, but for your headlamp's cone (src/minecart-hands.js holes) and the goblins' own lamps */
    dark: 0.01, darkZones: [{ x0: DRIFT[0], x1: DRIFT[1], y0: 0, y1: H * TS, dark: 0.88 }],
    mcAreas: [['THE LAMP YARD', 0, 'lamp'], ['THE DARK DRIFT', 171, 'dark'], ['THE GOBLIN LINE', 310, 'goblin'], ['THE GLOW CAVERN', 472, 'glow'], ['THE WRECK', 625, 'works'], ['THE CRUSHER WORKS', 676, 'works'], ['THE LIFT', 758, 'works'], ['THE TWIN LINES', 786, 'works'], ['THE FLOODED RUN', 856, 'flood'], ['THE SPOIL PITS', 970, 'works'], ['THE SMELTER FLOOR', 1062, 'smelter'], ['THE FORGE', 1180, 'smelter'], ['THE SMELTER', 1248, 'smelter']],
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
