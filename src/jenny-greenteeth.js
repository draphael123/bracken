// src/jenny-greenteeth.js - JENNY GREENTEETH, the boss at the end of THE FOG CANAL (claude/lockkeeper; Daniel's pivot 2026-09-30: the river hag of the
// English tales, who drags people under with long green arms, in place of a human lock-keeper).
// claude/jenny2 (Daniel 10-02: "very repetitive and kind of annoying" - FIGHT HER, NOT THE PLUMBING): the openings come from fighting HER, and the lock
// changes ONCE a phase. She is fought INSIDE A LOCK CHAMBER: stone and iron, a timber mitre gate at each end with walers up its face and a walkway at
// its top, a sunken narrowboat on the bed, and the water goes up and down.
//
// HER BLOWS (every one told, every one answerable - src/marks.js rows):
//   THE GRAB   (!!, step out)  a bubbling ring on the water where you are; the arm bursts up there and drags you under. Mash, or strike the arm.
//   THE LASH   (!!, jump)      an arm sweeps along the water's skin: jump it (or dive under it).
//   THE REACH  (!!, duck)      an arm comes up beside the ledge you stand on and swipes at head height: duck.
//   THE BITE   (!, block)      she comes up at the edge of the water with her green teeth: a shield turns it - and A BITE MET (blocked, flared, rolled
//                              through) LEAVES HER DAZED at the surface: open (GT.dazeT).
//   THE TEAR   (!!, step off)  the bright weed under you shivers dark and is pulled under.
//   THE SLAM   (!!, step out)  PHASE ONE'S NEW BLOW. Her long arms rise over the ledge you stand on (a red ring on the timber) and she heaves herself up and
//                              brings her claws down there. Step out of it and her claws go into the TIMBER: her arm is STUCK, she hangs off the ledge,
//                              open (GT.stuckT). Caught, it hurts; on the weed it tears the mat.
//   THE CHARGE (!!, jump)      PHASE TWO'S NEW BLOW. She sinks, and a bow-wave runs along the lock at you with her under it: jump it. Where the water is
//                              shallow (the narrowboat's back in phase three) she runs aground on it - STRANDED, open: THE LURE.
//   THE NET    (!!, step out)  PHASE THREE'S NEW BLOW. She gathers a dripping mass of weed and throws it where you stand: caught, you are tangled a moment
//                              (a brief slow) - and her next blow comes quick.
//   A PAIR     her arms two at a time, always answerable: high then low, a ring then a reach, two rings with a way out between (the fog).
//
// THE LOCK CHANGES ONCE A PHASE (one machine beat, never every cycle; a paddle is ONE timed strike, never worked):
//   PHASE 1  THE GREEN LAWN (to 2/3)  low water under a lawn of weed. THE DRAIN: strike the lower paddle while she is at its gate and the water runs out
//            from under her - STRANDED where she is. She drags herself to the culvert and lets the water back in, HIGHER (half): the lock is changed.
//   PHASE 2  THE FLOOD (to 1/3)       she floods the lock to the walkways and hides in a gate's CULVERT (her eyes in its grate): strike THAT gate's
//            paddle and the rush throws her out - open. Once: then she hunts you in the deep water.
//   PHASE 3  THE FOG (to 0)           the fog comes down and the water goes out until the narrowboat's back is a SHALLOW: only her eyes show. Stand on
//            the boat and draw her charge across it - she runs aground, STRANDED.
// EVERY CYCLE CHANGES (a cycle ends with an opening): the weed's pattern, and what she leans on (the slam, the bite, the charge, the net; the lure on
//   or off). AFTER EVERY OPENING SHE IS WARY (GT.wardT, told: a ring of weed about her): the blow that opened her is not thrown again until it passes.
// Health is never the lever. A blow on her anywhere but an opening lands at GT.ward.
//
// PURE: no DOM, no main.js. The world is a context `c` (src/jenny-greenteeth-hands.js binds it); the frame's events are returned for
// tools/greenteeth.mjs. The chamber is laid by stageGreenteeth (THE FOG CANAL calls it, src/fog-canal.js section 7).

export const GT = {
  hp: 720, w: 30, h: 46, markH: 54,   /* (claude/jenny2: redrawn at her own size - the box is her head, shoulders and the body under the water's skin) */
  ward: 0.05, openMul: 1.25, beatMul: 1.7,
  /* THE WATER: its heights over the bed. SHOAL leaves the narrowboat's back (two rows high) a hand under the surface */
  lv: { dry: 0, shoal: 40, low: 48, half: 80, high: 112 },
  drainRate: 40, fillRate: 60, wakeRate: 32, aground: 26,
  /* THE OPENINGS: each at least three seconds */
  stuckT: 3.2, dazeT: 3.0, strandT: 3.2, flushT: 3.2, crawl: 30, dragT: 0.7, wrenchT: 0.45, wardT: 3.0,
  /* HER BODY */
  swim: { low: 100, half: 125, high: 150 }, keep: 26, boatCrawl: 40, armRange: 170,
  /* HER BLOWS */
  armUp: 40, armDown: 72,
  grabTell: 0.9, grabFollow: 0.45, grabT: 0.25, grabHold: 1.4, grabR: 12, grabTick: 0.5,
  lashTell: 0.8, lashT: 0.35, lashReach: 200, gateLashReach: 260,
  reachTell: 0.8, reachT: 0.3, reachSpan: 64,
  biteTell: 0.75, biteT: 0.25, biteRange: 80, biteLunge: 40,
  tearTell: 0.8, weedHold: 2.5, weedRegrow: 3.5,
  slamTell: 1.0, slamFollow: 0.55, slamT: 0.22, slamR: 15, slamRange: 150, slamUp: 120,
  chargeTell: 0.9, chargeSpeed: 270, chargeOver: 70,
  netTell: 0.8, netFollow: 0.6, netT: 0.35, netR: 22, netRoot: 0.9, netQuick: 0.3,
  surgeTell: 1.0, surgeSpeed: 300, surgeT: 0.4,
  hideMax: 9.0, gateNear: 120,
  floodTell: 2.0, fogTell: 2.0,
  gap: [0.6, 0.5, 0.45], pairEvery: 3, pairGap: 0.55,
  dmg: { grab: 14, drag: 4, lash: 20, reach: 20, bite: 22, surge: 18, slam: 24, charge: 20, net: 8 },
  p2: 2 / 3, p3: 1 / 3,
  /* SHE FIGHTS IN THE BEAT'S OPENINGS: stranded or flushed she still SNAPS (a yellow !: the shield turns it, or step back) and SWIPES low (a red !!:
     jump it) at a hero beside her. Stuck by her claws or dazed she does nothing (stagger means still) */
  oa: { first: 0.8, every: 1.1, snapTell: 0.5, snapR: 52, snapDmg: 16, swipeTell: 0.55, swipeR: 64, swipeDmg: 16, near: 90 },
};
/* THE MOVES: tell (s), blow (s), the mark's promise, the answer, the height (the marks table's rows are src/marks.js) */
export const MOVES = {
  grab:   { tell: GT.grabTell,   blow: GT.grabT,  mark: '!!', answer: 'dodge', h: 'low' },
  lash:   { tell: GT.lashTell,   blow: GT.lashT,  mark: '!!', answer: 'jump',  h: 'low' },
  reach:  { tell: GT.reachTell,  blow: GT.reachT, mark: '!!', answer: 'duck',  h: 'high' },
  bite:   { tell: GT.biteTell,   blow: GT.biteT,  mark: '!',  answer: 'block', h: 'low' },
  tear:   { tell: GT.tearTell,   blow: 0.2,       mark: '!!', answer: 'dodge', h: 'low' },
  slam:   { tell: GT.slamTell,   blow: GT.slamT,  mark: '!!', answer: 'dodge', h: 'low' },
  charge: { tell: GT.chargeTell, blow: 1.2,       mark: '!!', answer: 'jump',  h: 'low' },
  net:    { tell: GT.netTell,    blow: GT.netT,   mark: '!!', answer: 'dodge', h: 'low' },
};
export const MOVE_NAME = { grab: 'HER ARM', lash: 'THE LASH', reach: 'THE REACH', bite: 'HER TEETH', surge: 'THE SURGE', slam: 'HER CLAWS', charge: 'HER CHARGE', net: 'THE WEED NET' };
/* THE NEW BLOW OF EACH PHASE */
export const NEW_MOVE = { 1: 'slam', 2: 'charge', 3: 'net' };
/* THE WEED: [col0, col1, bright] in chamber columns (1..38 inside the gates; the weed lies on 5..33, clear of the gates' walers) */
export const WEED = {
  A: [[5, 7, 1], [8, 10, 0], [11, 13, 1], [14, 16, 0], [17, 20, 1], [21, 23, 0], [24, 26, 1], [27, 29, 0], [30, 33, 1]],
  B: [[5, 6, 0], [7, 9, 1], [10, 13, 0], [14, 15, 1], [16, 19, 0], [20, 22, 1], [23, 26, 0], [27, 28, 1], [29, 33, 0]],
  C: [[5, 8, 1], [9, 11, 0], [12, 13, 1], [14, 18, 0], [19, 20, 1], [21, 24, 0], [25, 27, 1], [28, 30, 0], [31, 33, 1]],
  R: [[8, 10, 1], [18, 21, 1], [28, 30, 1]],
  D: [[6, 8, 1], [12, 14, 0], [22, 24, 1], [31, 33, 1]],
  F: [[5, 7, 0], [8, 10, 1], [11, 14, 0], [25, 28, 0], [29, 31, 1], [32, 33, 0]],
  G: [[5, 6, 1], [7, 9, 0], [10, 12, 1], [26, 28, 1], [29, 31, 0], [32, 33, 1]],
};
export const WEED_MOVERS = 6;   /* the bright patches are movers (you stand on them); the most any pattern has */
/* THE CYCLES, phase by phase (the last of each repeats). weed: the pattern; lean: the blow she leans on (her deck below); tear/pairs/doubles: what
   she has learnt; lure: the narrowboat's shallow draws her charge (phase three) */
export const CYCLES = {
  1: [{ name: 'THE GREEN LAWN', weed: 'A', lean: 'slam' },
      { name: 'THE TORN LAWN', weed: 'B', lean: 'bite', tear: true },
      { name: 'THE TANGLE', weed: 'C', lean: 'slam', tear: true, pairs: true }],
  2: [{ name: 'THE FLOOD', weed: 'R', lean: 'charge', pairs: true },
      { name: 'THE DEEP', weed: 'D', lean: 'slam', pairs: true },
      { name: 'THE UNDERTOW', weed: 'R', lean: 'bite', pairs: true }],
  3: [{ name: 'THE SHALLOWS', weed: 'F', lean: 'charge', lure: true, pairs: true },
      { name: 'THE DARK', weed: 'G', lean: 'net', pairs: true, doubles: true },
      { name: 'THE SHALLOWS', weed: 'F', lean: 'bite', lure: true, pairs: true, doubles: true },
      { name: 'THE DARK', weed: 'G', lean: 'slam', pairs: true, doubles: true }],
};
/* HER DECKS: the order she throws her blows in, by what she leans on (a blow she cannot throw where you stand is skipped) */
const DECK = {
  slam:   ['slam', 'grab', 'lash', 'bite', 'slam', 'reach', 'grab', 'slam', 'lash'],
  bite:   ['bite', 'grab', 'reach', 'bite', 'lash', 'slam', 'bite', 'grab'],
  charge: ['charge', 'grab', 'bite', 'lash', 'charge', 'slam', 'reach', 'charge', 'grab'],
  net:    ['net', 'grab', 'bite', 'slam', 'net', 'lash', 'charge', 'reach'],
};
export const cycleOf = (ph, k) => { const L = CYCLES[ph]; return L[Math.min(k, L.length - 1)]; };
/* the water each phase keeps: phase one's drain changes it once (low -> half) */
export const phaseLvl = (show, ph) => (ph === 1 ? (show.beat[1] === 'done' ? 'half' : 'low') : ph === 2 ? 'high' : 'shoal');
/* the frames of her sprite (src/redraw/greenteeth_art.js) */
export const GT_F = { swim: [0, 1], tell: 2, lunge: 3, reach: 4, grab: 5, stranded: [6, 7], hurt: 8, dead: 9, flushed: 10, hide: 11, drag: 12,
  slamTell: 13, stuck: 14, dazed: 15, chargeTell: 16, netTell: 17, net: 18 };

export const gtPhase = e => (e.hp <= e.maxHp * GT.p3 ? 3 : e.hp <= e.maxHp * GT.p2 ? 2 : 1);
export const OPEN_MODES = new Set(['stranded', 'flushed', 'stuck', 'dazed']);
export const gtOpen = e => !!e && OPEN_MODES.has(e.mode);
export const gtTake = e => (gtOpen(e) ? (e.big ? GT.beatMul : GT.openMul) : GT.ward);
export const surfY = show => show.A.bed - show.water.depth;
const SPECIAL = new Set(['wake', 'stranded', 'drag', 'surgeTell', 'surge', 'flushed', 'dive', 'floodTell', 'fogTell', 'stuck', 'wrench', 'dazed', 'charge', 'slamBack']);
export const special = e => SPECIAL.has(e.mode);
const armMode = m => typeof m === 'string' && (MOVES[m] || MOVES[m.replace(/Tell$/, '')]) && !SPECIAL.has(m);

/* ---------- THE CHAMBER'S GEOMETRY (world px) ---------- */
export const STAGE = { W: 40, walk: 8, walers: [2, 4, 6], door: 6, top: 15, wreck: [15, 24], hook: 5 };   /* (walers two rows apart: every hero's jump makes the next one) */
export function geom(sx, R, TS) {
  const ex = sx + STAGE.W - 1, bed = R * TS, walk = (R - STAGE.walk) * TS;
  const gate = (side) => { const w = side === 'W', face = w ? (sx + 1) * TS : ex * TS, dir = w ? 1 : -1, col = w ? sx + 2 : ex - 2, hc = w ? sx + STAGE.hook : ex - STAGE.hook;
    return { side, face, dir, walk, walers: STAGE.walers.map(r => (R - r) * TS), paddle: { x: col * TS + 8, y: walk }, hook: { x: hc * TS + 8, y: walk - TS },
      cul: { x: face + dir * 10, y: bed }, lampX: hc * TS + 8, stand: col * TS + 8 }; };
  return { sx, R, TS, x0: (sx + 1) * TS, x1: ex * TS, bed, top: (R - STAGE.top) * TS, walk, mid: (sx + 20) * TS,
    W: gate('W'), E: gate('E'), wreck: { x0: (sx + STAGE.wreck[0]) * TS, x1: (sx + STAGE.wreck[1] + 1) * TS, y: (R - 2) * TS } };
}
export const colX = (A, col) => (A.sx + col) * A.TS;
/* THE LEDGE a hero stands on at a gate (a waler or the walkway): its height and its outer end (where her body can hang), or null */
export function ledgeAt(A, x, y) {
  for (const side of ['W', 'E']) { const G = A[side];
    for (const [ly, n] of [...G.walers.map(v => [v, 3]), [A.walk, 4]]) { const x0 = G.dir > 0 ? G.face : G.face - n * A.TS, x1 = x0 + n * A.TS;
      if (Math.abs(y - ly) < 3 && x >= x0 - 2 && x <= x1 + 2) return { side, y: ly, x0, x1, end: G.dir > 0 ? x1 : x0, dir: G.dir }; } }
  return null;
}
const onWreck = (A, x) => x > A.wreck.x0 && x < A.wreck.x1;
/* the water over the narrowboat's back: under her aground depth she cannot cross it */
export const wreckShallow = show => show.water.depth <= GT.lv.shoal + 2 && show.water.depth > 2 && show.water.depth - (show.A.bed - show.A.wreck.y) < GT.aground;   /* (the fog's SHOAL only: at phase one's low water she swims over it) */

/* ---------- THE SHOW ---------- */
export function newShow(A) {
  return { A, water: { depth: 0, target: 0, rate: 0 }, pad: { W: { open: false, cd: 0, to: 0 }, E: { open: false, cd: 0 } }, lastPad: null,
    weed: [], arms: [], armN: 0, surge: null, charge: null, net: null, lamps: { W: { st: 'hook' }, E: { st: 'hook' } }, fog: 0, hide: null, hideT: 0,
    beat: { 1: 'ready', 2: 'ready', 3: 'ready' }, wary: null, cyc: { 1: 0, 2: 0, 3: 0 }, cycle: 0, gap: 1.2, turns: 0, rot: 0, told: {}, last: null, quick: 0,
    n: { grab: 0, held: 0, freed: 0, lash: 0, reach: 0, bite: 0, tear: 0, surge: 0, pair: 0, slam: 0, charge: 0, net: 0, netted: 0,
      stuck: 0, dazed: 0, lure: 0, strand: 0, flush: 0, drain: 0, flood: 0, fog: 0, wrongCulvert: 0, early: 0, spent: 0, cycle: 0, openAtk: 0, slamHit: 0, weedGive: 0, refill: 0, big: 0 } };
}
export function newGreenteeth(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, base: 'lurk', phase: 1, open: 0, anim: 0, vx: 0, face: -1, big: false });
}
export function layWeed(show, key) {
  const A = show.A; let m = 0;
  show.weedKey = key;
  show.weed = WEED[key].map(([c0, c1, bright]) => ({ x0: colX(A, c0), x1: colX(A, c1 + 1), firm: !!bright, sink: 0, broken: 0, torn: 0, m: bright ? m++ : -1 }));
}
/* which cycle, and lay it: the weed and what she leans on. The water is the phase's (it changes once a phase, never a cycle) */
export function applyCycle(show, ph, c) {
  const C = cycleOf(ph, show.cyc[ph]); show.C = C; layWeed(show, C.weed);
  show.water.target = GT.lv[phaseLvl(show, ph)]; show.water.rate = GT.fillRate; show.turns = 0; show.rot = 0; show.gap = Math.max(show.gap, 1.0);
  if (c && c.cycle) c.cycle(C);
  return C;
}
export function startFight(show) { show.cyc = { 1: 0, 2: 0, 3: 0 }; const C = applyCycle(show, 1, null); show.water.target = 0; show.water.depth = 0; return C; }   /* (the lock stands empty until she wakes and floods it) */

/* ---------- THE WATER ---------- */
function stepWater(show, dt, ev, c) {
  const w = show.water, P = show.pad;
  for (const s of ['W', 'E']) if (P[s].cd > 0) P[s].cd -= dt;
  if (P.E.open) { w.target = 0; w.rate = GT.drainRate; }
  const d = w.target - w.depth; if (Math.abs(d) > 0.01) w.depth += Math.sign(d) * Math.min(Math.abs(d), w.rate * dt);
  if (P.E.open && w.depth <= 0.01) { P.E.open = false; w.depth = 0; ev.push({ t: 'dry' }); c.sound('drainDone'); }
  c.water(w.depth);
}

/* ---------- THE WEED ---------- */
function stepWeed(show, dt, heroes, ev) {
  const surf = surfY(show), dry = show.water.depth < 3, A = show.A;
  for (const [i, p] of show.weed.entries()) {
    if (p.broken > 0) { p.broken -= dt; if (p.broken <= 0) { p.broken = 0; p.sink = 0; } }
    else if (p.firm && !dry) { const on = heroes.some(h => h.onWeed === i);
      p.sink = Math.max(0, Math.min(1, p.sink + (on ? dt / GT.weedHold : -0.6 * dt)));
      if (p.sink >= 1) { p.broken = GT.weedRegrow; show.n.weedGive++; ev.push({ t: 'weedGive', i }); } }
    const mid = (p.x0 + p.x1) / 2, wr = onWreck(A, mid);
    p.y = dry || (wr && surf > A.wreck.y) ? (wr ? A.wreck.y : A.bed) : surf + Math.round(p.sink * 3); }
}
export const weedAt = (show, x) => show.weed.findIndex(p => x >= p.x0 && x < p.x1);

/* ---------- THE SURGE (a wave from a gate's culvert as she lets the water back in) ---------- */
function stepSurge(show, dt, heroes, ev, c) {
  const s = show.surge; if (!s) return; const A = show.A, surf = surfY(show);
  s.x += s.dir * GT.surgeSpeed * dt;
  c.band('low', [surf - 18, surf + 10], s.x - 14, s.x + 14, GT.dmg.surge, MOVE_NAME.surge, 'surge' + s.id, { push: s.dir * 220, from: s.x - s.dir * 20 });
  if ((s.dir > 0 && s.x > A.x1) || (s.dir < 0 && s.x < A.x0)) { show.surge = null; ev.push({ t: 'surgeDone' }); }
}
function launchSurge(show, side, ev, c) {
  const G = show.A[side]; show.surge = { x: G.face, dir: G.dir, side, id: ++show.armN }; show.n.surge++; ev.push({ t: 'surge', side }); c.sound('surge');
}

/* ---------- WHO IS WHERE ---------- */
/* h = { x, y, ground, swim, onWeed, onTile, alive } from the hands */
export function heroState(show, h) {
  const A = show.A, surf = surfY(show), depth = show.water.depth, inPool = h.x > A.x0 && h.x < A.x1;
  const wet = depth > 12 && inPool;
  const grabbable = wet && !h.onTile && (h.swim || h.onWeed >= 0 || (h.y > surf - GT.armUp && h.y < surf + GT.armDown));
  const atSurface = wet && (h.onWeed >= 0 || (h.swim && h.y < surf + 30) || (h.ground && Math.abs(h.y - surf) < 8));
  const footing = h.ground && (h.onTile || h.onWeed >= 0) && h.y <= surf + 2;
  const atGate = h.x < A.W.face + 5 * A.TS ? 'W' : h.x > A.E.face - 5 * A.TS ? 'E' : null;
  const reachable = footing && (atGate ? h.y >= A.walk - 2 : h.y >= surf - 80);
  const ledge = h.ground && h.onTile ? ledgeAt(A, h.x, h.y) : null;
  const onBoat = h.ground && h.onTile && onWreck(A, h.x) && Math.abs(h.y - A.wreck.y) < 3;
  return { surf, wet, grabbable, atSurface, footing, atGate, reachable, ledge, onBoat };
}
const nearestHero = (heroes, x) => heroes.slice().sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;

/* ---------- AN ARM (and the blows of her body: the slam, the charge, the net) ---------- */
function startArm(e, show, k, h, c, ev, o = {}) {
  const M = MOVES[k], A = show.A, surf = surfY(show), hs = heroState(show, h), dir = Math.sign(h.x - e.x) || e.face || 1;
  const a = { k, st: 'tell', t: M.tell + (o.extra || 0), len: M.tell + (o.extra || 0), id: ++show.armN, hero: h, pair: !!o.pair, x: h.x, dir };
  if (k === 'grab') { a.x = h.x + (o.dx || 0); a.follow = !o.dx; }
  if (k === 'lash') { const gate = o.gate || (hs.footing && hs.atGate) || null; a.ox = gate ? A[gate].face : e.x; a.dir = gate ? A[gate].dir : dir; a.reach = gate ? GT.gateLashReach : GT.lashReach; a.fy = hs.footing && hs.atGate ? h.y : surf; }
  if (k === 'reach') { a.fy = hs.footing ? h.y : surf; a.x = h.x; a.gate = hs.atGate; a.ox = a.gate ? A[a.gate].face : h.x - dir * 20; }
  if (k === 'bite') { a.dir = dir; e.face = dir; }
  if (k === 'tear') { a.patch = h.onWeed; if (a.patch >= 0) show.weed[a.patch].torn = a.len; }
  if (k === 'slam') { a.fy = h.y; a.ledge = hs.ledge; a.weed = h.onWeed; a.follow = true; }
  if (k === 'net') { a.fy = h.y; a.follow = true; }
  if (k === 'charge') { a.dir = dir; a.ox = e.x; }
  show.arms.push(a); e.face = dir; show.last = k; show.n[k + 'Told'] = (show.n[k + 'Told'] || 0) + 1; ev.push({ t: k + 'Tell', pair: a.pair }); c.say(M.mark); c.sound(k + 'Tell');
  if (k === NEW_MOVE[e.phase] && !show.told[k]) { show.told[k] = true; c.number(e.x, surf - 50, NEW_LINE[k], '#ffd36b'); }
  return a;
}
const NEW_LINE = { slam: 'STEP OUT OF HER SLAM: HER CLAWS STICK', charge: 'SHE CHARGES UNDER THE WATER: JUMP THE WAVE', net: 'HER WEED NET TANGLES: STEP OUT OF IT' };
const blowBox = (a, show, e) => { const A = show.A, surf = surfY(show);
  if (a.k === 'reach') { const x0 = a.gate ? (a.gate === 'W' ? A.x0 : a.x - GT.reachSpan) : a.x - GT.reachSpan, x1 = a.gate ? (a.gate === 'E' ? A.x1 : a.x + GT.reachSpan) : a.x + GT.reachSpan; return [x0, x1, a.fy - 24, a.fy - 10]; }
  if (a.k === 'bite') { const x0 = a.dir > 0 ? e.x : e.x - GT.biteLunge - 10, x1 = a.dir > 0 ? e.x + GT.biteLunge + 10 : e.x; return [x0, x1, surf - 40, surf + 14]; }
  if (a.k === 'grab') return [a.x - GT.grabR, a.x + GT.grabR, surf - GT.armUp - 22, surf + GT.armDown];
  if (a.k === 'slam') return [a.x - GT.slamR, a.x + GT.slamR, a.fy - 30, a.fy + 2];
  if (a.k === 'net') return [a.x - GT.netR, a.x + GT.netR, a.fy - 26, a.fy + 4];
  return null; };
export { blowBox };
function stepArms(e, show, dt, c, ev) {
  const surf = surfY(show), A = show.A;
  for (const a of show.arms) {
    a.t -= dt;
    if (a.st === 'tell') {
      if ((a.k === 'grab' || a.k === 'slam' || a.k === 'net') && a.follow && a.hero && a.t > a.len * (1 - (a.k === 'slam' ? GT.slamFollow : a.k === 'net' ? GT.netFollow : GT.grabFollow))) {
        const d = a.hero.x - a.x; a.x += Math.sign(d) * Math.min(Math.abs(d), 90 * dt);
        if (a.k !== 'grab' && Math.abs(a.hero.y - a.fy) > 3 && a.hero.ground) { a.fy = a.hero.y; const hs = heroState(show, a.hero); a.ledge = hs.ledge; a.weed = a.hero.onWeed; } }
      if (a.k === 'bite' && a.hero) { const d = a.hero.x - a.dir * 30 - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), 60 * dt); }
      if (a.k === 'slam') { const tx = clampX(A, a.x + (a.ledge ? a.ledge.dir * 0 : 0)); e.x += (clampIn(A, tx) - e.x) * Math.min(1, dt * 1.5); }
      if (a.k === 'tear' && a.patch >= 0 && show.weed[a.patch]) show.weed[a.patch].torn = Math.max(0, a.t);
      if (a.t > 0) continue;
      a.st = 'blow'; a.t = MOVES[a.k].blow; show.n[a.k]++; ev.push({ t: a.k, pair: a.pair }); c.sound(a.k);
      if (a.k === 'grab') { const w = weedAt(show, a.x); if (w >= 0 && show.weed[w].firm && !(show.weed[w].broken > 0)) { show.weed[w].broken = GT.weedRegrow; show.weed[w].sink = 1; }
        const held = show.water.depth > 12 ? c.grab(blowBox(a, show, e), GT.dmg.grab, a) : null;
        if (held) { a.st = 'hold'; a.t = GT.grabHold; a.held = held; a.tick = GT.grabTick; show.n.held++; ev.push({ t: 'held' }); c.sound('held'); c.number(held.x, held.y - 40, 'STRIKE THE ARM THAT HOLDS YOU', '#ff6b6b'); } }
      else if (a.k === 'reach') c.hit(blowBox(a, show, e), GT.dmg.reach, MOVE_NAME.reach, { from: a.ox, unblockable: true, duck: true });
      else if (a.k === 'bite') { e.x += a.dir * 20; const res = c.hit(blowBox(a, show, e), GT.dmg.bite, MOVE_NAME.bite, { from: e.x, meet: true });
        if (res === 'met' && !waryOf(show, 'bite')) { a.st = 'back'; a.t = 0; dazeHer(e, show, ev, c); return; } }
      else if (a.k === 'tear') { const p = show.weed[a.patch]; if (p && p.firm) { p.broken = GT.weedRegrow; p.sink = 1; p.torn = 0; ev.push({ t: 'torn' }); } }
      else if (a.k === 'slam') { if (slamLands(e, show, a, c, ev)) return; }
      else if (a.k === 'net') { const caught = c.net(blowBox(a, show, e), GT.dmg.net, GT.netRoot); if (caught) { show.n.netted++; show.quick = GT.netQuick; ev.push({ t: 'netted' }); } }
      else if (a.k === 'charge') { a.st = 'back'; a.t = 0; startCharge(e, show, a, c, ev); return; }
      continue; }
    if (a.st === 'blow' && a.k === 'lash') { const r = a.reach * Math.min(1, 1 - Math.max(0, a.t) / GT.lashT); a.r = r;
      const tip = a.ox + a.dir * r, tail = a.ox + a.dir * Math.max(0, r - 56);   /* (what strikes is the arm's end sweeping past: once it is by you, you can land) */
      c.band('low', [a.fy - 14, a.fy + 6], Math.min(tip, tail), Math.max(tip, tail), GT.dmg.lash, MOVE_NAME.lash, 'lash' + a.id, { from: a.ox }); }
    if (a.st === 'hold') { a.tick -= dt; const still = c.hold(a, dt); if (!still) { a.st = 'back'; a.t = 0.3; show.n.freed++; ev.push({ t: 'freed' }); continue; }
      if (a.tick <= 0) { a.tick = GT.grabTick; c.drag(a, GT.dmg.drag); }
      if (a.t <= 0) { c.release(a); a.st = 'back'; a.t = 0.3; ev.push({ t: 'letGo' }); } continue; }
    if (a.st === 'blow' && a.t <= 0) { a.st = 'back'; a.t = 0.25; }
  }
  show.arms = show.arms.filter(a => !(a.st === 'back' && a.t <= 0));
  /* her mode says the arm that lands first (the mark over her is that one's) */
  const tells = show.arms.filter(a => a.st === 'tell').sort((p, q) => p.t - q.t), blows = show.arms.filter(a => a.st === 'blow' || a.st === 'hold');
  if (tells.length) { const L = tells[0]; if (e.mode !== L.k + 'Tell' || e.leadId !== L.id) { e.mode = L.k + 'Tell'; e.leadId = L.id; e.tellLen = L.len; } e.modeT = L.t; }
  else if (blows.length) { e.mode = blows[0].k; e.modeT = Math.max(0, blows[0].t); }
  else if (armMode(e.mode)) e.mode = e.base;
}
function clearArms(show, c) { for (const a of show.arms) if (a.st === 'hold') c.release(a); show.arms = []; for (const p of show.weed) p.torn = 0; }
const armsBusy = show => show.arms.length > 0;

/* THE SLAM LANDS: on a hero, it hurts and she drops back; stepped out of on the timber, her claws go into it and she HANGS there, open; on the weed it
   tears the mat; in the water it is only a splash */
function slamLands(e, show, a, c, ev) {
  const A = show.A, box = blowBox(a, show, e), hit = c.slam(box, GT.dmg.slam);
  if (hit) { show.n.slamHit++; a.st = 'back'; a.t = 0; e.mode = 'slamBack'; e.modeT = 0.45; ev.push({ t: 'slamHit' }); clearArms(show, c); return true; }
  if (a.ledge && !waryOf(show, 'slam')) {   /* STUCK: her claws in the timber where you stood, her body hanging off the ledge's end */
    clearArms(show, c); const L = a.ledge, hx = Math.max(Math.min(a.x, Math.max(L.x0, L.x1) - 6), Math.min(L.x0, L.x1) + 6);
    const bx = L.dir > 0 ? Math.max(hx + 10, L.end + 12) : Math.min(hx - 10, L.end - 12);
    openHer(e, show, 'stuck', GT.stuckT, false, ev, c); e.x = clampX(A, bx); e.y = L.y + GT.h - 12; e.claw = { x: hx, y: L.y }; e.face = Math.sign(hx - e.x) || -L.dir;
    show.n.stuck++; ev.push({ t: 'stuck' }); c.sound('stuck'); c.number(hx, L.y - 40, 'HER CLAWS ARE STUCK: CUT HER', '#ffd36b'); return true; }
  if (a.weed >= 0 && show.weed[a.weed] && show.weed[a.weed].firm) { const p = show.weed[a.weed]; p.broken = GT.weedRegrow; p.sink = 1; ev.push({ t: 'torn' }); }
  return false;
}
/* THE CHARGE: she goes under and comes along the lock behind a bow-wave, through where you are and on; the narrowboat's shallow stops her dead */
function startCharge(e, show, a, c, ev) {
  const A = show.A, h = a.hero, dir = Math.sign((h ? h.x : A.mid) - e.x) || a.dir || 1, lo = A.x0 + 5 * A.TS, hi = A.x1 - 5 * A.TS;
  let to = Math.max(lo, Math.min(hi, (h ? h.x : e.x) + dir * GT.chargeOver));
  if (wreckShallow(show) && !(show.C || {}).lure) { if (dir > 0 && e.x < A.wreck.x0) to = Math.min(to, A.wreck.x0 - 20); if (dir < 0 && e.x > A.wreck.x1) to = Math.max(to, A.wreck.x1 + 20); }   /* (no lure this cycle: she will not cross the boat's back) */
  show.charge = { x: e.x, dir, to, id: a.id }; e.mode = 'charge'; e.modeT = 3; e.hidden = true; ev.push({ t: 'charge' }); c.sound('charge');
}
function stepCharge(e, show, dt, c, ev) {
  const ch = show.charge, A = show.A, surf = surfY(show); if (!ch) { e.mode = e.base; e.hidden = false; return; }
  const nx = ch.x + ch.dir * GT.chargeSpeed * dt;
  /* THE LURE: the boat's back is a shallow - she runs aground on it */
  if (wreckShallow(show) && ((ch.dir > 0 && ch.x < A.wreck.x0 + 6 && nx >= A.wreck.x0 + 6) || (ch.dir < 0 && ch.x > A.wreck.x1 - 6 && nx <= A.wreck.x1 - 6)) && (show.C || {}).lure && !waryOf(show, 'charge')) {
    show.charge = null; e.hidden = false; e.x = ch.dir > 0 ? A.wreck.x0 + 14 : A.wreck.x1 - 14; e.y = A.wreck.y; show.n.lure++;
    openHer(e, show, 'stranded', GT.strandT, false, ev, c); e.lure = true; show.n.strand++; ev.push({ t: 'stranded', lure: true }); c.sound('stranded'); c.number(e.x, A.wreck.y - 50, 'AGROUND ON THE BOAT: CUT HER', '#ffd36b'); return; }
  ch.x = nx; e.x = ch.x; e.y = Math.min(A.bed, surf + GT.h); e.vx = ch.dir * GT.chargeSpeed;
  c.band('low', [surf - 18, surf + 10], ch.x - 10 + ch.dir * 8, ch.x + 10 + ch.dir * 8, GT.dmg.charge, MOVE_NAME.charge, 'charge' + ch.id, { push: ch.dir * 200, from: ch.x - ch.dir * 20 });
  if ((ch.dir > 0 && ch.x >= ch.to) || (ch.dir < 0 && ch.x <= ch.to) || ch.x < A.x0 + 5 * A.TS - 2 || ch.x > A.x1 - 5 * A.TS + 2) { show.charge = null; e.hidden = false; e.mode = e.base; ev.push({ t: 'chargeDone' }); show.gap = Math.max(show.gap, 0.5); }
}

/* ---------- THE OPENINGS ---------- */
/* each opening: open for at least three seconds (the boss rule), then she is WARY of what opened her (GT.wardT, told) */
function openHer(e, show, mode, t, big, ev, c) {
  clearArms(show, c); show.charge = null; show.net = null; e.hidden = false;
  e.mode = mode; e.modeT = t; e.openLen = t; e.big = !!big; e.open = t; e.lure = false; e.oa = null; e.newCycle = true; e.openKind = mode;
}
function dazeHer(e, show, ev, c) {
  const surf = surfY(show); openHer(e, show, 'dazed', GT.dazeT, false, ev, c); e.y = surf + Math.round(GT.h * 0.5); show.n.dazed++;
  ev.push({ t: 'dazed' }); c.sound('dazed'); c.number(e.x, surf - 50, 'HER BITE MET: SHE IS DAZED', '#ffd36b');
}
/* what opened her, so she will not be had by it again at once */
const OPENED_BY = { stuck: 'slam', dazed: 'bite', stranded: 'charge', flushed: 'flush' };
const waryOf = (show, k) => !!(show.wary && show.wary.t > 0 && show.wary.k === k);
/* an opening ends: the cycle turns (a new weed, a new lean) and she is wary */
function closeOpening(e, show, ev, c) {
  const k = OPENED_BY[e.openKind] || null; show.wary = { k, t: GT.wardT }; e.big = false; e.open = 0;
  if (!show.told.wary) { show.told.wary = true; c.number(e.x, surfY(show) - 50, 'SHE IS WARY: NOT THE SAME TRICK TWICE', '#9aa39a'); }
  if (e.newCycle) { e.newCycle = false; show.cyc[e.phase]++; show.cycle++; show.n.cycle++; applyCycle(show, e.phase, c); ev.push({ t: 'cycle', cycle: show.cycle, name: show.C.name });
    if (e.refill) show.water.target = show.water.depth; }   /* (the drained lock comes back with her surge, not before) */
  ev.push({ t: 'wary', k });
}

/* ---------- CHOOSING A BLOW ---------- */
function chooseBlow(e, show, h, c, ev) {
  const hs = heroState(show, h), C = show.C || {}, ph = e.phase, A = show.A, surf = surfY(show);
  const dist = Math.abs(h.x - e.x), opts = new Set();
  if (hs.grabbable) opts.add('grab');
  const gateNear = hs.atGate && Math.abs(e.x - A[hs.atGate].face) < GT.armRange;
  if ((hs.atSurface && dist < GT.lashReach) || (hs.footing && hs.atGate && gateNear)) opts.add('lash');
  if (hs.reachable && dist < GT.armRange) opts.add('reach');
  if (dist < GT.biteRange && h.y > surf - 44 && h.y < surf + 30 && show.water.depth > 12 && !waryOf(show, 'bite')) opts.add('bite');
  if (C.tear && h.onWeed >= 0 && show.weed[h.onWeed] && show.weed[h.onWeed].firm) opts.add('tear');
  if (!waryOf(show, 'slam') && h.ground && (hs.ledge || h.onWeed >= 0) && !hs.onBoat && dist < GT.slamRange && h.y >= surf - GT.slamUp && h.y <= surf + 4) opts.add('slam');
  if (ph >= 2 && !waryOf(show, 'charge') && show.water.depth > 20 && dist > 50 && h.y > surf - 30 && !hs.ledge) opts.add('charge');
  if (ph >= 3 && dist < 170 && (h.ground || h.swim)) opts.add('net');
  if (e.onBoat) opts.clear();   /* (dragging herself over the boat's back, her arms are busy) */
  if (!opts.size) return false;
  show.turns++;
  /* A PAIR: two arms told together, always answerable - high then low, or a ring then a reach, or (the fog) two rings with a way out between */
  if (C.pairs && show.turns % GT.pairEvery === 0) {
    const pair = C.doubles && opts.has('grab') && show.turns % (GT.pairEvery * 2) === 0 ? ['grab', 'grab2']
      : opts.has('reach') && opts.has('lash') ? ['reach', 'lash'] : opts.has('grab') && opts.has('reach') ? ['grab', 'reach'] : opts.has('grab') && opts.has('lash') ? ['grab', 'lash'] : null;
    if (pair) { show.n.pair++; ev.push({ t: 'pair', ks: pair });
      if (pair[1] === 'grab2') { const side = h.x - A.x0 < 60 ? 1 : A.x1 - h.x < 60 ? -1 : (e.x < h.x ? 1 : -1);   /* the second ring on the side she comes from: step away from her */
        startArm(e, show, 'grab', h, c, ev, { pair: true }); startArm(e, show, 'grab', h, c, ev, { pair: true, dx: -side * 34, extra: 0.1 }); }
      else { const first = pair[0], second = pair[1], gap = MOVES[first].tell + GT.pairGap - MOVES[second].tell;
        startArm(e, show, first, h, c, ev, { pair: true }); startArm(e, show, second, h, c, ev, { pair: true, extra: Math.max(0, gap) }); }
      return true; } }
  /* HER DECK: what she leans on this cycle comes round most; a blow she cannot throw where you stand is skipped, and never the same one three times running */
  const deck = DECK[C.lean] || DECK.slam; let k = opts.has('tear') && show.turns % 3 === 1 ? 'tear' : null;
  for (let i = 0; i < deck.length && !k; i++) { const q = deck[(show.rot + i) % deck.length]; if (opts.has(q) && !(q === show.last && q === show.last2)) { k = q; show.rot = (show.rot + i + 1) % deck.length; } }
  if (!k) k = [...opts][0];
  show.last2 = show.last;
  startArm(e, show, k, h, c, ev);
  return true;
}

/* ---------- ONE FRAME ----------
   c = { heroes: [h], say(mark), sound(key), number(x, y, line, col), water(depth), band(kind, [t,b], x0, x1, dmg, name, key, {push, from}),
         hit(box [l,r,t,b], dmg, name, {from, unblockable, duck, meet}) -> 'met' (a blow blocked or rolled through) | 'hit' | null,
         slam(box, dmg) -> true if a hero was in it (rolled through is not), net(box, dmg, root) -> caught,
         grab(box, dmg, arm) -> hero|null, hold(arm, dt) -> still held, drag(arm, dmg), release(arm), cycle(C) }
   Returns the frame's events. */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const A = show.A, heroes = (c.heroes || []).filter(h => h.alive);
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0;
  if (show.wary && show.wary.t > 0) show.wary.t -= dt;
  if (show.quick > 0) show.quick -= dt;
  stepWater(show, dt, ev, c); stepWeed(show, dt, heroes, ev); stepSurge(show, dt, heroes, ev, c);
  if (show.fogTo !== undefined) show.fog += Math.sign(show.fogTo - show.fog) * Math.min(Math.abs(show.fogTo - show.fog), dt / 1.5);
  if (e.mode !== e.lastMode) { e.lastMode = e.mode; e.tellId = (e.tellId || 0) + 1; }
  if (!e.alive || e.mode === 'sleep') return ev;
  const surf = surfY(show), depth = show.water.depth, hero = nearestHero(heroes, e.x);
  e.open = gtOpen(e) ? Math.max(0, e.modeT) : 0; if (!gtOpen(e) && e.oa) e.oa = null;
  if (!special(e)) stepArms(e, show, dt, c, ev);
  switch (e.mode) {
    case 'wake': e.x += (clampIn(A, hero ? hero.x : A.mid) - e.x) * Math.min(1, dt * 0.5); e.y = A.bed; show.water.target = GT.lv.low; show.water.rate = GT.wakeRate;
      if (e.modeT <= 0) { e.mode = e.base = 'lurk'; show.gap = 1.0; c.number(e.x, surf - 50, 'THE BRIGHT WEED HOLDS. THE DARK WEED IS WATER', '#ffd36b'); show.tellDrainAt = 9; } return ev;
    case 'slamBack': swimY(e, show); if (e.modeT <= 0) e.mode = e.base; return ev;
    case 'charge': stepCharge(e, show, dt, c, ev); return ev;
    case 'stuck': if (e.modeT <= 0) { e.mode = 'wrench'; e.modeT = GT.wrenchT; e.claw = null; closeOpening(e, show, ev, c); c.sound('wrench'); } return ev;
    case 'wrench': { const tx = clampIn(A, e.x); e.x += (tx - e.x) * Math.min(1, dt * 6); e.y += (Math.min(A.bed, surf + Math.round(GT.h * 0.5)) - e.y) * Math.min(1, dt * 8); if (e.modeT <= 0) { e.mode = e.base; swimY(e, show); } return ev; }
    case 'dazed': e.y = surf + Math.round(GT.h * 0.5); if (e.modeT <= 0) { e.mode = 'dive'; e.modeT = 0.4; closeOpening(e, show, ev, c); } return ev;
    case 'stranded': { openFight(e, show, dt, c, heroes, ev, false);
      if (e.lure) { e.y = A.wreck.y; if (e.modeT <= 0) { e.mode = 'drag'; e.modeT = GT.dragT; e.dragTo = e.x < (A.wreck.x0 + A.wreck.x1) / 2 ? A.wreck.x0 - 30 : A.wreck.x1 + 30; closeOpening(e, show, ev, c); ev.push({ t: 'drag' }); c.sound('drag'); } return ev; }
      e.y = A.bed; const tx = A.W.cul.x, d = tx - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), GT.crawl * dt); e.face = Math.sign(d) || e.face;
      if (e.modeT <= 0) { e.mode = 'drag'; e.modeT = GT.dragT; e.dragTo = A.W.cul.x; closeOpening(e, show, ev, c); ev.push({ t: 'drag' }); c.sound('drag'); } return ev; }
    case 'drag': { const k = Math.min(1, dt * 6); e.x += (e.dragTo - e.x) * k;
      if (e.lure) e.y = A.wreck.y; else e.y = A.bed;
      if (e.modeT <= 0) { e.x = e.dragTo; if (e.refill) { e.mode = 'surgeTell'; e.modeT = GT.surgeTell; e.surgeSide = 'W'; e.hidden = true; ev.push({ t: 'surgeTell', refill: true }); c.say('!!'); c.sound('surgeTell'); }
        else { e.mode = e.base; swimY(e, show); } e.lure = false; } return ev; }
    case 'surgeTell': if (e.modeT <= 0) { launchSurge(show, e.surgeSide, ev, c); e.mode = 'surge'; e.modeT = GT.surgeT;
        if (e.refill) { show.n.refill++; show.water.target = GT.lv[phaseLvl(show, e.phase)]; show.water.rate = GT.fillRate; } }
      return ev;
    case 'surge': if (e.modeT <= 0) { e.refill = false; e.hidden = false; e.mode = e.base = 'lurk'; show.gap = Math.max(show.gap, 0.6); } return ev;
    case 'flushed': { openFight(e, show, dt, c, heroes, ev, false); e.y = surf + 8; e.x += (e.flushX - e.x) * Math.min(1, dt * 5);
      if (e.modeT <= 0) { e.mode = 'dive'; e.modeT = 0.4; closeOpening(e, show, ev, c); ev.push({ t: 'dive' }); } return ev; }
    case 'dive': e.y = Math.min(A.bed, e.y + 60 * dt); if (e.modeT <= 0) { e.mode = e.base = 'lurk'; swimY(e, show); } return ev;
    case 'floodTell': show.water.target = GT.lv.high; show.water.rate = GT.fillRate; if (e.modeT <= 0) { show.cyc[2] = 0; applyCycle(show, 2, c);
        show.hide = hero && hero.x > A.mid ? 'W' : 'E'; show.hideT = GT.hideMax; e.mode = e.base = 'shift'; show.n.flood++; c.number(e.x, surf - 50, 'OPEN THE PADDLE OF HER CULVERT', '#ffd36b'); } return ev;
    case 'fogTell': show.fogTo = 1; show.water.target = GT.lv.shoal; show.water.rate = GT.drainRate; if (e.modeT <= 0) { show.cyc[3] = 0; show.n.fog++; applyCycle(show, 3, c); e.mode = e.base = 'lurk';
        c.number(e.x, surf - 50, 'STAND ON THE BOAT: DRAW HER ONTO IT', '#ffd36b'); } return ev;
  }
  /* ---- THE PHASE, only between her blows ---- */
  const ph = gtPhase(e);
  if (ph > e.phase && !armsBusy(show) && (e.mode === e.base || e.base === 'culvert')) {
    e.phase = ph; ev.push({ t: 'phase', ph }); clearArms(show, c); show.pad.E.open = false; show.pad.W.open = false; show.wary = null; show.charge = null;
    if (ph === 2) { e.mode = 'floodTell'; e.modeT = GT.floodTell; e.base = 'lurk'; c.sound('floodTell'); c.number(e.x, surf - 50, 'THE LOCK FLOODS: SHE HIDES IN A CULVERT', '#ffd36b'); }
    else { e.mode = 'fogTell'; e.modeT = GT.fogTell; e.base = 'lurk'; show.hide = null; e.hidden = false; c.sound('fogTell'); c.number(e.x, surf - 50, 'THE FOG COMES DOWN AND THE WATER GOES OUT', '#ffd36b'); }
    return ev; }
  if (show.tellDrainAt !== undefined) { show.tellDrainAt -= dt; if (show.tellDrainAt <= 0) { show.tellDrainAt = undefined; if (show.beat[1] === 'ready' && e.phase === 1) c.number(A.E.paddle.x, A.walk - 40, 'DRAIN THE LOCK WHILE SHE IS AT THE GATE', '#ffd36b'); } }
  strandCheck(e, show, ev, c);
  if (special(e)) return ev;
  /* ---- WHERE SHE GOES ---- */
  if (!armsBusy(show)) show.gap -= dt;
  let tx = e.x;
  if (e.base === 'culvert') { const G = A[show.hide]; tx = G.cul.x; e.y = A.bed; show.hideT -= dt;
    if (show.hideT <= 0) { show.beat[2] = 'done'; e.base = 'lurk'; e.mode = 'surgeTell'; e.modeT = GT.surgeTell; e.surgeSide = show.hide; e.refill = false; e.hidden = true; ev.push({ t: 'surgeTell' }); c.say('!!'); c.sound('surgeTell'); show.hide = null; return ev; } }
  else if (e.base === 'shift') { const G = A[show.hide]; tx = G.cul.x; if (Math.abs(e.x - tx) < 6) { e.base = 'culvert'; if (!armsBusy(show)) e.mode = 'culvert'; ev.push({ t: 'inCulvert', side: show.hide }); } }
  else if (hero) { /* she hunts you: in the water near you, never under a gate's ledge, and (the fog's shallows) never across the boat's back unless she charges */
    tx = clampIn(A, hero.x + (hero.x > A.mid ? -GT.keep : GT.keep));
    if (wreckShallow(show)) { const m = 22, onIt = x => x > A.wreck.x0 - m && x < A.wreck.x1 + m; if (onIt(tx) && !onIt(e.x)) tx = e.x < A.wreck.x0 ? A.wreck.x0 - m : A.wreck.x1 + m;   /* (she waits off the boat for a hero on it: the charge is how she comes) */
      else if (onIt(tx) && onIt(e.x)) tx = Math.abs(e.x - (A.wreck.x0 - m)) < Math.abs(e.x - (A.wreck.x1 + m)) ? A.wreck.x0 - m : A.wreck.x1 + m; } }
  e.onBoat = wreckShallow(show) && e.x > A.wreck.x0 - 6 && e.x < A.wreck.x1 + 6;
  const sp = e.onBoat ? GT.boatCrawl : depth < 12 ? 0 : depth < GT.lv.half - 10 ? GT.swim.low : depth < GT.lv.high - 10 ? GT.swim.half : GT.swim.high, dx = tx - e.x;
  const held = show.arms.some(a => a.st === 'hold' || a.st === 'blow'), k = armsBusy(show) && e.base !== 'shift' ? (held ? 0 : 0.4) : 1;   /* (she drifts while she tells, and holds still while an arm is out) */
  if (Math.abs(dx) > 3 && k > 0 && !show.arms.some(a => a.k === 'slam' || a.k === 'bite')) { e.vx = Math.sign(dx) * sp * k; e.x += Math.sign(dx) * Math.min(Math.abs(dx), sp * k * dt); }
  if (e.base !== 'culvert') { swimY(e, show); if (e.onBoat) e.y = A.wreck.y; }
  if (hero && !show.arms.some(a => a.k === 'bite')) e.face = Math.sign(hero.x - e.x) || e.face;
  /* ---- A BLOW ---- */
  if (hero && (show.gap <= 0 || (show.quick > 0 && show.gap <= GT.gap[e.phase - 1] - GT.netQuick)) && !armsBusy(show) && e.base !== 'culvert' && e.base !== 'shift') {
    if (chooseBlow(e, show, hero, c, ev)) { show.gap = GT.gap[e.phase - 1]; show.quick = 0; } else show.gap = 0.3; }
  if (!armsBusy(show) && armMode(e.mode)) e.mode = e.base;
  if (!armsBusy(show) && !special(e) && e.mode !== e.base) e.mode = e.base;
  return ev;
}
/* SHE FIGHTS IN THE BEAT'S OPENINGS: stranded in the mud or thrown out on the water she still snaps (!: block it, or step back) and swipes low (!!: jump
   it) at a hero beside her, each told - the window is a fight, and it stays the window (her modeT runs on). Stuck by her claws she only snaps */
function openFight(e, show, dt, c, heroes, ev, snapOnly) {
  const O = GT.oa, h = nearestHero(heroes, e.x);
  if (e.oa) { const a = e.oa; a.t -= dt; if (a.t > 0) return; e.oa = null; e.oaCd = O.every; show.n.openAtk++; ev.push({ t: a.k });
    if (a.k === 'snap') { const x0 = a.dir > 0 ? e.x - 6 : e.x - O.snapR, x1 = a.dir > 0 ? e.x + O.snapR : e.x + 6; c.hit([x0, x1, e.y - 44, e.y + 6], O.snapDmg, MOVE_NAME.bite, { from: e.x }); c.sound('bite'); }
    else { c.band('low', [e.y - 16, e.y + 6], e.x - O.swipeR, e.x + O.swipeR, O.swipeDmg, 'HER CLAWS', 'oa' + a.id, { from: e.x, push: a.dir * 160 }); c.sound('lash'); }
    return; }
  if (e.oaCd === undefined || e.oaFor !== e.tellId) { e.oaCd = O.first + (snapOnly ? 0.5 : 0); e.oaFor = e.tellId; }
  e.oaCd -= dt; if (e.oaCd > 0 || !h || Math.abs(h.x - e.x) > O.near || Math.abs(h.y - e.y) > 60 || e.modeT < 0.6) return;
  const k = snapOnly || show.n.openAtk % 2 === 0 ? 'snap' : 'swipe'; e.oa = { k, t: k === 'snap' ? O.snapTell : O.swipeTell, len: k === 'snap' ? O.snapTell : O.swipeTell, dir: Math.sign(h.x - e.x) || 1, id: ++show.armN };
  if (!snapOnly) e.face = e.oa.dir; c.say(k === 'snap' ? '!' : '!!'); c.sound(k === 'snap' ? 'biteTell' : 'lashTell'); ev.push({ t: k + 'Tell' });
  if (!show.told.openAtk) { show.told.openAtk = true; c.number(e.x, e.y - 60, 'SHE STILL BITES: BLOCK IT OR JUMP IT', '#ffd36b'); }
}
const clampX = (A, x) => Math.max(A.x0 + 14, Math.min(A.x1 - 14, x));
/* HER WATER: she keeps five tiles off the gates' faces (her arms reach up them; her body is never under a walker's ledge) */
const clampIn = (A, x) => Math.max(A.x0 + 5 * A.TS, Math.min(A.x1 - 5 * A.TS, x));
function swimY(e, show) { const A = show.A, surf = surfY(show); e.y = Math.min(A.bed, surf + Math.round(GT.h * 0.5)); }   /* half out of the water */
/* AGROUND: the drain runs and the water is under her depth - stranded where she lies (THE DRAIN, phase one's beat) */
function strandCheck(e, show, ev, c) {
  if (show.water.depth >= GT.aground || !show.pad.E.open || e.base === 'culvert' || e.hidden) return ev;
  if (!['lurk', 'shift', 'slamBack'].includes(e.mode) && !armMode(e.mode)) return ev;
  openHer(e, show, 'stranded', GT.strandT, true, ev, c); e.y = show.A.bed; e.refill = true; e.base = 'lurk'; show.n.strand++; show.n.big++;
  ev.push({ t: 'stranded', big: true }); c.sound('stranded'); c.number(e.x, show.A.bed - 50, 'SHE IS STRANDED: CUT HER', '#ffd36b');
  return ev;
}

/* ---------- A HERO'S SWING: the arm that holds you, the paddles ----------
   Returns [{ what, side?, res? }] for the hands to answer with sound and a line. `seen` is the swing's hit set (one of each a swing) */
export function strikeAt(e, show, hb, seen) {
  const out = []; if (!e || !show || !hb) return out; const A = show.A, once = seen || new Set();
  const inBox = (x, y, r) => x + r > hb.l && x - r < hb.r && y + r > hb.t && y - r < hb.b;
  /* the arm that holds you */
  for (const a of show.arms) { if (a.st !== 'hold' || once.has(a)) continue; const hx = a.held ? a.held.x : a.x, hy = a.held ? a.held.y - 6 : surfY(show);
    if (segHitsBox(hx, hy, e.x, e.y - 10, hb) || inBox(hx, hy, 6)) { once.add(a); a.cut = true; out.push({ what: 'arm', a }); } }
  /* HER STUCK ARM: a blow along it from the claws in the timber to her shoulder is a blow on her */
  if (e.mode === 'stuck' && e.claw && !once.has('claw')) { if (segHitsBox(e.claw.x, e.claw.y - 2, e.x, e.y - GT.h + 10, hb) || inBox(e.claw.x, e.claw.y - 2, 6)) { once.add('claw'); out.push({ what: 'claw' }); } }
  for (const side of ['W', 'E']) { const G = A[side], key = 'pad' + side;
    if (!once.has(key) && hb.r > G.paddle.x - 8 && hb.l < G.paddle.x + 8 && hb.b > G.paddle.y - 30 && hb.t < G.paddle.y) { once.add(key); out.push({ what: 'paddle', side, res: strikePaddle(e, show, side) }); } }
  return out;
}
/* A PADDLE IS ONE STRIKE, timed: the drain while she is at its gate (phase one), her culvert's paddle while she hides in it (phase two). Otherwise it
   does nothing - the lock is changed once a phase, and the rest of the fight is HER */
export const atGate = (e, show, side) => Math.abs(e.x - show.A[side].face) < GT.gateNear && !special(e) && e.base === 'lurk' && show.water.depth > GT.aground;
export function strikePaddle(e, show, side) {
  const p = show.pad[side];
  if (p.cd > 0) return 'busy'; p.cd = 0.5;
  if (gtOpen(e) || ['stranded', 'drag', 'flushed', 'floodTell', 'fogTell', 'wake', 'surgeTell', 'surge', 'sleep'].includes(e.mode)) return 'busy';
  /* PHASE TWO: the paddle of HER culvert throws her out */
  if (e.phase === 2 && (e.base === 'culvert' || e.base === 'shift') && show.beat[2] === 'ready') {
    if (show.hide !== side) { show.n.wrongCulvert++; return 'notHere'; }
    show.beat[2] = 'done'; show.lastPad = side; flush(e, show, side); return 'flush'; }
  /* PHASE ONE: the drain, with her at this gate */
  if (e.phase === 1 && side === 'E' && show.beat[1] === 'ready') {
    if (!atGate(e, show, 'E')) { show.n.early++; return 'wait'; }
    show.beat[1] = 'done'; p.open = true; show.n.drain++; show.lastPad = side; return 'drain'; }
  show.n.spent++; return 'spent';
}
function flush(e, show, side) {
  const G = show.A[side]; for (const a of show.arms) if (a.st === 'hold') a.st = 'back'; show.arms = [];
  openHer(e, show, 'flushed', GT.flushT, true, null, { sound() {} }); e.flushX = G.face + G.dir * 80; e.x = G.cul.x; e.base = 'lurk'; show.hide = null;
  show.n.flush++; show.n.big++; show.surgeFx = { side, t: 0.6 };
}
export function segHitsBox(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1; const dx = x1 - x0, dy = y1 - y0;
  for (const [p, q] of [[-dx, x0 - b.l], [dx, b.r - x0], [-dy, y0 - b.t], [dy, b.b - y0]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } }
  return t0 <= t1;
}

/* ---------- THE STAGE ----------
   Laid into a painter-like writer (set / block / plat / ent) with its WEST GATE at column sx and its BED at row R.
   FOOTPRINT: 40 columns, sx .. sx+39 (the two gates are sx and sx+39; the water is sx+1 .. sx+38), rows R-16 .. R+1.
     - rows R and R+1 are laid solid under the whole chamber (the bed); ROW R+2 SHOULD BE SOLID TOO under it (nothing hangs from the bed);
     - the gates' columns are solid from row R-16 down to R-1, with a door at rows R-6 .. R-1 in each (the arena walls close it when she wakes);
     - nothing standable over the chamber within five rows of the walkways (R-8): the rows above R-16 over it are the sky, or the level's own rock.
     - the approach reaches the WEST door at bed level (row R-1 standing); the way on is the EAST door, opened when she dies.
   Returns { arena, movers, pools } - movers are the bright weed (for the level's moversExtra), pools the chamber's water (for its pools). */
export function stageGreenteeth(W, T, TS, sx, R) {
  const { set, block, plat, ent } = W, ex = sx + STAGE.W - 1, top = R - 16;
  block(sx, sx, top, R - 1); block(ex, ex, top, R - 1);
  for (let y = R - STAGE.door; y <= R - 1; y++) { set(sx, y, T.AIR); set(ex, y, T.AIR); }
  for (let x = sx + 1; x < ex; x++) for (let y = top; y < R; y++) set(x, y, T.AIR);
  block(sx + 1, ex - 1, R, R + 1);
  /* each gate's walers (timber rails on its face, two rows apart) and its walkway, where the paddle's gear stands */
  for (const r of STAGE.walers) { plat(sx + 1, R - r, 3); plat(ex - 3, R - r, 3); }
  plat(sx + 1, R - STAGE.walk, 4); plat(ex - 4, R - STAGE.walk, 4);
  /* the sunken narrowboat on the bed: in the fog its back is the shallow */
  block(sx + STAGE.wreck[0], sx + STAGE.wreck[1], R - 2, R - 1);
  ent('greenteeth', sx + 20, R - 1, { face: -1 });
  const A = geom(sx, R, TS);
  const arena = { x0: A.x0, x1: A.x1, floor: A.bed, y0: A.top, trigger: (sx + 5) * TS, wallL: sx, wallR: ex, boss: 'greenteeth', music: 'greenteeth',
    tint: '#1a3a2a', tintA: 0.12, camFrame: true, start: [sx + 6, R - 1], lock: { sx, R } };
  const movers = []; for (let i = 0; i < WEED_MOVERS; i++) movers.push({ kind: 'lift', weed: true, wi: i, x: A.x0, y: A.bed, y0: A.bed, y1: A.bed, w: 32, h: 6, speed: 0, broken: true });
  const pools = [{ x0: A.x0, x1: A.x1, y: A.bed, y0: A.bed, base: A.bed, bottom: A.bed, swim: true, clear: true, shallow: true, shallow0: true, depth: 0, depth0: 0, dry: true, grad: false, wash: 0.42, lock: true }];
  return { arena, movers, pools };
}
/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT (the Puppeteer's lesson): it sees a tell PLAN.react s after it began, misreads some (PLAN.missDodge), meets some bites late
   (PLAN.missMeet), is late to some paddles (PLAN.late), and mashes a hold like a person (not every frame).
   s = { P: { x, y, face, ground, swim, snare, atk, onWeed, onTile, dodge }, e, show, reach, shield, t (seconds), rng, mem } -> keys
   out = { gx, face, atk, jump, down, up, drop, block, dodge, why } */
export const PLAN = { react: 0.25, missDodge: 0.14, missMeet: 0.3, late: 0.25, mash: 0.35 };
export function greenteethPlan(s) {
  const { P, e, show, reach } = s, A = show.A, out = { gx: null, face: P.face, atk: false, jump: false, down: false, up: false, drop: false, block: false, dodge: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 800) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const surf = surfY(show), clamp = x => Math.max(A.x0 + 10, Math.min(A.x1 - 10, x));
  const onWalk = side => { const G = A[side]; return P.ground && Math.abs(P.y - A.walk) < 3 && (G.dir > 0 ? P.x >= G.face && P.x <= G.face + 64 : P.x <= G.face && P.x >= G.face - 64); };
  /* ---- 0. HELD: strike the arm (and mash) ---- */
  if (P.snare > 0) { const a = show.arms.find(q => q.st === 'hold'); out.face = a ? (Math.sign(e.x - P.x) || P.face) : P.face; out.atk = rng() < PLAN.mash; out.jump = rng() < PLAN.mash; out.why = 'held'; return out; }
  /* ---- 1. THE BLOWS COMING ---- */
  const hs = heroState(show, { x: P.x, y: P.y, ground: P.ground, swim: P.swim, onWeed: P.onWeed ?? -1, onTile: !!P.onTile });
  const stepOut = (x, r, why) => { const L = hs.ledge; let side;
    if (L) { const lo = Math.min(L.x0, L.x1) + 6, hi = Math.max(L.x0, L.x1) - 6; side = (x - lo > hi - x) ? -1 : 1; if (x - lo < r + 8 && hi - x < r + 8) side = L.dir; out.gx = Math.max(lo, Math.min(hi + (side === L.dir ? 30 : 0), x + side * (r + 14))); }
    else { side = x - A.x0 < 60 ? 1 : A.x1 - x < 60 ? -1 : (P.x < x ? -1 : 1); out.gx = clamp(x + side * (r + 24)); }
    out.why = why; return out; };
  for (const a of show.arms.filter(q => q.st === 'tell' || q.st === 'blow').sort((p, q) => p.t - q.t)) {
    const key = 'a' + a.id; if (!seenFor(key) || roll(key + 'd', PLAN.missDodge)) continue;
    if (a.k === 'grab' && Math.abs(a.x - P.x) < GT.grabR + 12 && (hs.grabbable || !P.ground)) { const other = show.arms.find(q => q !== a && q.k === 'grab' && q.st === 'tell');
      let side = a.x - A.x0 < 60 ? 1 : A.x1 - a.x < 60 ? -1 : (P.x < a.x ? -1 : 1); if (other && Math.sign(other.x - a.x) === side) side = -side;
      out.gx = clamp(a.x + side * (GT.grabR + 30)); out.why = 'out of the ring'; if (a.t < 0.5 && P.ground && P.onWeed >= 0) out.jump = true; return out; }
    if ((a.k === 'slam' || a.k === 'net') && a.st === 'tell' && Math.abs(a.x - P.x) < (a.k === 'slam' ? GT.slamR : GT.netR) + 12 && Math.abs(P.y - a.fy) < 30) {
      if (a.t < (a.k === 'slam' ? 1 - GT.slamFollow : 1 - GT.netFollow) * a.len) return stepOut(a.x, a.k === 'slam' ? GT.slamR : GT.netR, a.k === 'slam' ? 'out of her slam' : 'out of the net');
      out.gx = P.x; out.why = 'wait for her slam to fix'; return out; }
    if (a.k === 'lash' && a.t < 0.14 + (a.st === 'blow' ? 1 : 0)) { const inRange = a.dir > 0 ? P.x > a.ox - 10 && P.x < a.ox + a.reach + 10 : P.x < a.ox + 10 && P.x > a.ox - a.reach - 10;
      if (inRange && Math.abs(P.y - a.fy) < 30) { if (P.swim) { out.down = true; out.why = 'dive the lash'; } else { out.jump = true; out.why = 'jump the lash'; } return out; } }
    if (a.k === 'reach' && Math.abs(P.y - a.fy) < 4 && a.t < 0.3) { out.down = true; out.why = 'duck the reach'; return out; }
    if (a.k === 'bite' && Math.abs(P.x - e.x) < GT.biteLunge + 34) { const late = roll(key + 'm', PLAN.missMeet);
      if (!late && a.st === 'tell') { out.meet = a.t; out.gx = null; out.face = Math.sign(e.x - P.x) || 1; if (s.shield && a.t < 0.4) out.block = true; out.why = 'meet the bite'; return out; }
      if (P.swim && a.t < 0.35) { out.down = true; out.why = 'dive the bite'; return out; } if (P.ground && a.t < 0.15) { out.jump = true; out.why = 'jump the bite'; return out; }
      out.gx = clamp(e.x + (P.x < e.x ? -1 : 1) * (GT.biteLunge + 36)); out.why = 'back off the bite'; return out; }
    if (a.k === 'tear' && P.onWeed === a.patch) { const firm = show.weed.map((p, i) => ({ p, i })).filter(o => o.i !== a.patch && o.p.firm && !(o.p.broken > 0)).sort((p, q) => Math.abs((p.p.x0 + p.p.x1) / 2 - P.x) - Math.abs((q.p.x0 + q.p.x1) / 2 - P.x))[0];
      out.gx = firm ? (firm.p.x0 + firm.p.x1) / 2 : clamp(P.x + 40); out.jump = P.ground; out.why = 'off the torn weed'; return out; }
    if (a.k === 'charge' && a.st === 'tell') { out.gx = P.x; out.why = 'ready for the wave'; }
  }
  const crest = show.charge ? { x: show.charge.x, dir: show.charge.dir, id: 'c' + show.charge.id } : show.surge ? { x: show.surge.x, dir: show.surge.dir, id: 's' + show.surge.id } : null;
  if (crest && seenFor(crest.id) && !roll(crest.id + 'd', PLAN.missDodge) && Math.abs(crest.x - P.x) < 70 && Math.sign(P.x - crest.x) === crest.dir && Math.abs(P.y - surf) < 30) {
    if (P.swim) out.down = true; else if (Math.abs(crest.x - P.x) < 34) out.jump = true; out.why = 'the wave'; return out; }
  /* ---- 1b. SHE FIGHTS IN HER OPENINGS: her snap (block it, or step back) and her swipe (jump it) ---- */
  if (e.oa && seenFor('oa' + e.oa.id) && !roll('oa' + e.oa.id, PLAN.missDodge)) { const a = e.oa;
    if (a.k === 'swipe' && Math.abs(P.x - e.x) < GT.oa.swipeR + 8) { if (a.t < 0.16 && P.ground) out.jump = true; out.why = 'jump her swipe'; out.face = Math.sign(e.x - P.x) || 1; return out; }
    if (a.k === 'snap' && Math.abs(P.x - e.x) < GT.oa.snapR + 10) { if (s.shield && a.t < 0.4) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block her snap'; return out; }
      out.gx = clamp(e.x + (P.x < e.x ? -1 : 1) * (GT.oa.snapR + 22)); out.why = 'back off her snap'; return out; } }
  /* ---- 2. SHE IS OPEN: to her, and cut ---- */
  if (gtOpen(e) && seenFor('open' + e.tellId)) { const tx = e.mode === 'stuck' && e.claw ? (Math.abs(e.claw.x - P.x) < Math.abs(e.x - P.x) ? e.claw.x : e.x) : e.x, ty = e.mode === 'stuck' ? (e.claw ? e.claw.y : e.y) : e.y;
    const d = tx - P.x; out.face = Math.sign(d) || 1;
    if (e.mode !== 'stuck' && (onWalk('E') || onWalk('W')) && e.y > A.walk + 40) { out.gx = e.x; out.why = 'down to her'; if (Math.abs(d) < 60) out.drop = true; return out; }
    out.gx = Math.abs(d) > reach - 6 ? tx - out.face * (reach - 10) : null; out.atk = Math.abs(d) < reach + 8 && Math.abs(P.y - ty) < 44; if (P.swim && P.y < e.y - 8) out.down = true; out.why = 'open'; return out; }
  /* ---- 3. THE BEAT: a paddle, once ---- */
  const strikePad = side => { const G = A[side]; out.gx = G.paddle.x + (side === 'W' ? 14 : -14); out.face = side === 'W' ? -1 : 1;
    if (Math.abs(P.x - out.gx) < 4 && P.atk < 0 && !(show.pad[side].cd > 0)) out.atk = true; out.why = 'the ' + side + ' paddle'; };
  const climbTo = (side, ly) => { const G = A[side], L0 = P.ground ? ledgeAt(A, P.x, P.y) : null;
    if (L0 && L0.side === side && Math.abs(P.y - ly) < 4) { mem.onLedge = t; return true; }
    if (!P.ground && !P.swim && mem.onLedge !== undefined && t - mem.onLedge < 0.6 && Math.abs(P.y - ly) < 30) { out.gx = null; out.why = 'on the ledge'; return true; }   /* (a hop on the ledge - a jumped lash - is still the ledge) */
    if (L0 && P.y < ly - 3) { out.gx = G.stand; out.drop = true; out.why = 'down to the ledge'; return false; }
    out.gx = G.stand; if (Math.abs(P.x - G.stand) < 14) { out.why = 'up the gate'; if (P.swim) { out.up = true; if (P.y - surf < 26) out.jump = true; } else if (P.ground && P.y > ly + 3) out.jump = true; }
    else { out.why = 'to the ' + side + ' gate'; if (P.swim) out.up = P.y - surf > 18; if (P.ground && !L0 && rng() < 0.02) out.jump = true; }
    return false; };
  if (e.phase === 2 && (e.base === 'culvert' || e.base === 'shift') && show.beat[2] === 'ready' && show.hide) { if (climbTo(show.hide, A.walk)) strikePad(show.hide); return out; }
  /* ---- 4. WHERE TO FIGHT HER: a gate's ledge just over the water (her slam goes into its timber, her bite comes to its edge); in the fog's shallows,
     the narrowboat's back (her charge runs aground on it) ---- */
  const C = show.C || {};
  if (e.phase === 3 && C.lure && wreckShallow(show) && !roll('nolure' + show.cycle, PLAN.late)) {
    const onB = P.ground && P.x > A.wreck.x0 + 8 && P.x < A.wreck.x1 - 8 && Math.abs(P.y - A.wreck.y) < 6; const mid = (A.wreck.x0 + A.wreck.x1) / 2;
    if (onB) { out.gx = e.x < mid ? A.wreck.x1 - 30 : A.wreck.x0 + 30; out.face = Math.sign(e.x - P.x) || 1; out.why = 'on the boat'; return out; }
    out.gx = mid; out.why = 'to the boat'; if (P.swim) { out.up = true; if (Math.abs(P.x - mid) < 60) out.jump = true; } else if (P.ground && Math.abs(P.x - mid) < 120 && P.y > A.wreck.y + 2) out.jump = true; return out; }
  const lv = show.water.depth, drainUp = e.phase === 1 && show.beat[1] === 'ready';
  const ledgeY = drainUp ? A.walk : [...A.W.walers, A.walk].filter(y => A.bed - y > lv + 10).sort((p, q) => q - p)[0] ?? A.walk;   /* (phase one's drain still to work: up on the east walkway by its paddle) */
  let side = drainUp ? 'E' : (mem.side || (P.x > A.mid ? 'E' : 'W'));
  mem.side = side;
  if (climbTo(side, ledgeY)) { const G = A[side];
    if (drainUp && atGate(e, show, 'E') && !roll('late' + Math.floor(t * 2), PLAN.late)) { strikePad('E'); return out; }
    const L = ledgeAt(A, P.x, P.y), outer = L ? L.end - L.dir * 12 : G.stand; out.gx = outer; out.face = G.dir; out.why = 'hold the ledge'; }
  return out;
}

/* ---------- THE FRAME her body shows (src/redraw/greenteeth_art.js) ---------- */
export function gtFrame(e) {
  const a = e.anim || 0, m = e.mode || '';
  if (m === 'stranded') return GT_F.stranded[Math.floor(a * 3) % 2];
  if (m === 'drag' || (e.onBoat && (m === 'lurk' || m === 'shift'))) return GT_F.drag;
  if (m === 'flushed') return GT_F.flushed;
  if (m === 'stuck') return GT_F.stuck;
  if (m === 'dazed') return GT_F.dazed;
  if (m === 'slamTell') return GT_F.slamTell;
  if (m === 'slam' || m === 'wrench') return GT_F.reach;
  if (m === 'slamBack') return GT_F.grab;
  if (m === 'chargeTell' || m === 'charge') return GT_F.chargeTell;
  if (m === 'netTell') return GT_F.netTell;
  if (m === 'net') return GT_F.net;
  if (m === 'grabTell' || m === 'lashTell' || m === 'surgeTell' || m === 'tearTell') return GT_F.tell;
  if (m === 'biteTell' || m === 'bite') return GT_F.lunge;
  if (m === 'reachTell' || m === 'reach' || m === 'lash') return GT_F.reach;
  if (m === 'grab') return GT_F.grab;
  if (m === 'culvert') return GT_F.hide;
  if (e.flash > 0.05) return GT_F.hurt;
  return GT_F.swim[Math.floor(a * 3) % 2];
}
