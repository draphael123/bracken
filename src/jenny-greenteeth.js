// src/jenny-greenteeth.js - JENNY GREENTEETH, the boss at the end of THE FOG CANAL (claude/lockkeeper; Daniel's pivot 2026-09-30: the river hag of the
// English tales, who drags people under with long green arms, in place of a human lock-keeper).
// She is fought INSIDE A LOCK CHAMBER: stone and iron, a timber mitre gate at each end, and the water in it goes up and down. The rule of the fight:
// SHE IS THE WATER'S. Flooded she swims fast and her arms come up anywhere the water is; DRAINED she is stranded in the mud and drags herself for the
// culvert - OPEN. The sluices are yours to work, and she fights you for them.
//
// THE LOCK. Two gates, each with a PADDLE on its walkway (strike the paddle's gear to work it): the UPPER (west) paddle FLOODS the chamber, the LOWER
// (east) paddle DRAINS it. Each gate has a CULVERT at its foot (her way in and out) and timber WALERS up its face (three rows apart: jumpable). A sunken
// narrowboat lies on the bed in the middle. BLANKET WEED lies on the water: BRIGHT weed (a pale mat, flowers in it) holds you a few seconds and then
// gives; DARK weed (glossy, bubbling) is only water with a skin on it.
//
// HER ARMS (every blow told, every one answerable - src/marks.js rows):
//   THE GRAB   (!!, step out)  a bubbling ring on the water where you are; the arm bursts up there and drags you under. Mash, or strike the arm.
//   THE LASH   (!!, jump)      an arm sweeps along the water's skin: jump it (or dive under it).
//   THE REACH  (!!, duck)      an arm comes up beside the ledge you stand on (up the gate's face, at a gate) and swipes at head height: duck.
//   THE BITE   (!, block)      she comes up at the edge of the water with her green teeth: a shield turns it.
//   THE TEAR   (!!, step off)  the bright weed under you shivers dark and is pulled under.
//   THE SURGE  (!!, jump)      a gate's culvert boils and a wave runs the length of the lock along the water: jump it, or be above it.
//   HER HAND   (no blow)       you opened the drain: her arm goes up the gate to the paddle to shut it. Strike the hand.
//
// EVERY CYCLE CHANGES (a cycle ends with an opening): the water's height, the weed's pattern, which paddle is choked or running, what she does.
//   PHASE 1  THE GREEN LAWN (to 2/3)  low water under a lawn of weed. She hunts you and comes to the gate you stand on. DRAIN THE LOCK WHILE SHE IS AT
//            THE GATE: the water runs out and she is aground where she is - STRANDED, open (GT.strandT). Drained while she rests in the wreck, she is
//            stranded out of your reach. Cycle 2: she has knotted the UPPER paddle open (cut it, or the drain cannot win); cycle 3: the drain is choked.
//   PHASE 2  THE FLOOD (to 1/3)       she floods the lock to the walkways and hides in a gate's CULVERT (her eyes in its grate), her arms coming out of
//            it along the water and up the gate. OPEN THE PADDLE OF HER CULVERT: the rush throws her out, dazed on the water - open (GT.flushT).
//            She shifts culverts (told) - and from her second cycle she pairs her arms (high, then low).
//   PHASE 3  THE FOG (to 0)           the fog comes down: only her eyes show in the lantern light. A lamp hangs over each gate's water: strike its hook
//            and it falls in, and she goes for the light and will not leave it. Work THAT gate's paddle - the drain strands her, the flood throws her -
//            and this time she cannot get away: THE BIG ONE (GT.bigT at GT.bigMul). Paired grabs from the dark.
// Health is never the lever. A blow on her anywhere else lands at GT.ward.
//
// PURE: no DOM, no main.js. The world is a context `c` (src/jenny-greenteeth-hands.js binds it); the frame's events are returned for
// tools/greenteeth.mjs. The chamber is laid by stageGreenteeth (THE FOG CANAL calls it, src/fog-canal.js section 7: the hidden standalone level 'greenlock' is gone, claude/greenwire).

export const GT = {
  hp: 720, w: 18, h: 24, markH: 34,
  ward: 0.05, openMul: 1.3, bigMul: 2.5,   /* (claude/greenwire: the stranded and flushed windows are 3.0 s, so x1.3 (was 1.8 s at x2.4) and the big one x2.5 (was 2.8): tuned with the human-bot pilot to 67% wins over 24 fights) */
  /* THE WATER: its heights over the bed, and how fast it moves */
  lv: { dry: 0, low: 48, half: 80, high: 112 },   /* (each leaves one waler a row over the water, and HIGH a row under the walkways) */
  drainRate: 36, fillRate: 60, wakeRate: 32, aground: 26,
  /* THE OPENINGS (Daniel: short, earned, obvious; the big one about three seconds) */
  strandT: 3.0, flushT: 3.0, bigT: 3.0, crawl: 30, dragT: 0.7,
  /* HER BODY */
  swim: { low: 105, half: 135, high: 165 }, keep: 24, lairRest: 2.2, visits: [3, 3, 2],
  /* HER ARMS */
  armUp: 40, armDown: 72,
  grabTell: 0.9, grabFollow: 0.45, grabT: 0.25, grabHold: 1.4, grabR: 12, grabTick: 0.5,
  lashTell: 0.8, lashT: 0.35, lashReach: 200, gateLashReach: 260,
  reachTell: 0.8, reachT: 0.3, reachSpan: 64,
  biteTell: 0.7, biteT: 0.25, biteRange: 76, biteLunge: 44,
  tearTell: 0.8, weedHold: 2.5, weedRegrow: 3.5,
  surgeTell: 1.0, surgeSpeed: 300, surgeT: 0.4,
  handTell: 1.0, handReact: 0.25, recoilT: 0.5,
  shiftEvery: 7.0, shiftTell: 0.8,
  lampFall: 260, lampBurn: 7.0,
  wakeT: 1.6, floodTell: 2.0, fogTell: 2.0, knotHp: 2,
  gap: [0.55, 0.45, 0.4], pairEvery: 3, pairGap: 0.55,
  dmg: { grab: 10, drag: 3, lash: 14, reach: 14, bite: 16, surge: 12 },
  p2: 2 / 3, p3: 1 / 3,
};
/* THE MOVES: tell (s), blow (s), the mark's promise, the answer, the height (the marks table's rows are src/marks.js) */
export const MOVES = {
  grab:  { tell: GT.grabTell,  blow: GT.grabT,  mark: '!!', answer: 'dodge', h: 'low' },
  lash:  { tell: GT.lashTell,  blow: GT.lashT,  mark: '!!', answer: 'jump',  h: 'low' },
  reach: { tell: GT.reachTell, blow: GT.reachT, mark: '!!', answer: 'duck',  h: 'high' },
  bite:  { tell: GT.biteTell,  blow: GT.biteT,  mark: '!',  answer: 'block', h: 'low' },
  tear:  { tell: GT.tearTell,  blow: 0.2,       mark: '!!', answer: 'dodge', h: 'low' },
};
export const MOVE_NAME = { grab: 'HER ARM', lash: 'THE LASH', reach: 'THE REACH', bite: 'HER TEETH', surge: 'THE SURGE' };
/* THE WEED: [col0, col1, bright] in chamber columns (1..38 inside the gates; the weed lies on 5..33, clear of the gates' walers) */
export const WEED = {
  A: [[5, 7, 1], [8, 10, 0], [11, 13, 1], [14, 16, 0], [17, 20, 1], [21, 23, 0], [24, 26, 1], [27, 29, 0], [30, 33, 1]],
  B: [[5, 6, 0], [7, 9, 1], [10, 13, 0], [14, 15, 1], [16, 19, 0], [20, 22, 1], [23, 26, 0], [27, 28, 1], [29, 33, 0]],
  C: [[5, 8, 1], [9, 11, 0], [12, 13, 1], [14, 18, 0], [19, 20, 1], [21, 24, 0], [25, 27, 1], [28, 30, 0], [31, 33, 1]],
  R: [[8, 10, 1], [18, 21, 1], [28, 30, 1]],
  F: [[5, 7, 0], [8, 10, 1], [11, 14, 0], [15, 17, 1], [18, 21, 0], [22, 24, 1], [25, 28, 0], [29, 31, 1], [32, 33, 0]],
};
export const WEED_MOVERS = 6;   /* the bright patches are movers (you stand on them); the most any pattern has */
/* THE CYCLES, phase by phase (the last of each repeats). lvl: the water she keeps; flood: she has knotted the UPPER paddle open; knot: the LOWER paddle
   is choked with weed; lair: where she rests (chamber column); tear/pairs: what she has learnt */
export const CYCLES = {
  1: [{ name: 'THE GREEN LAWN', lvl: 'low', weed: 'A', lair: 20 },
      { name: 'THE UPPER PADDLE RUNS', lvl: 'half', weed: 'B', lair: 12, flood: true, tear: true },
      { name: 'THE CHOKED PADDLE', lvl: 'low', weed: 'C', lair: 26, knot: true, tear: true, pairs: true }],
  2: [{ name: 'THE FLOOD', lvl: 'high', weed: 'R' },
      { name: 'THE FLOOD', lvl: 'high', weed: 'R', pairs: true }],
  3: [{ name: 'THE FOG', lvl: 'half', weed: 'F', pairs: true, doubles: true }],
};
export const cycleOf = (ph, k) => { const L = CYCLES[ph]; return L[Math.min(k, L.length - 1)]; };
/* the frames of her sprite (src/redraw/greenteeth_art.js) */
export const GT_F = { swim: [0, 1], tell: 2, lunge: 3, reach: 4, grab: 5, stranded: [6, 7], hurt: 8, dead: 9, flushed: 10, hide: 11, drag: 12 };

export const gtPhase = e => (e.hp <= e.maxHp * GT.p3 ? 3 : e.hp <= e.maxHp * GT.p2 ? 2 : 1);
export const gtOpen = e => !!e && (e.mode === 'stranded' || e.mode === 'flushed');
export const gtTake = e => (gtOpen(e) ? (e.big ? GT.bigMul : GT.openMul) : GT.ward);
export const surfY = show => show.A.bed - show.water.depth;
const SPECIAL = new Set(['wake', 'handTell', 'recoil', 'stranded', 'drag', 'hideIn', 'surgeTell', 'surge', 'flushed', 'dive', 'shiftTell', 'floodTell', 'fogTell']);
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

/* ---------- THE SHOW ---------- */
export function newShow(A) {
  return { A, water: { depth: 0, target: 0, rate: 0 }, pad: { W: { open: false, knot: 0, cd: 0, to: 0 }, E: { open: false, knot: 0, cd: 0 } },
    weed: [], arms: [], armN: 0, surge: null, lamps: { W: { st: 'none' }, E: { st: 'none' } }, fog: 0, hide: null, shiftT: GT.shiftEvery,
    cyc: { 1: 0, 2: 0, 3: 0 }, cycle: 0, gap: 1.2, turns: 0, rot: 0, visit: 0, rest: 0, handWait: -1, told: {},
    n: { grab: 0, held: 0, freed: 0, lash: 0, reach: 0, bite: 0, tear: 0, surge: 0, pair: 0, hand: 0, handCut: 0, shut: 0, drain: 0, flood: 0, running: 0, knot: 0,
      strand: 0, big: 0, flush: 0, wrongCulvert: 0, shift: 0, lamp: 0, lured: 0, lightOut: 0, weedGive: 0, refill: 0, cycle: 0, fast: 0 } };
}
export function newGreenteeth(e) {
  return Object.assign(e, { mode: 'sleep', modeT: 0, base: 'lurk', phase: 1, open: 0, anim: 0, vx: 0, face: -1, big: false, lured: false });
}
export function layWeed(show, key) {
  const A = show.A; let m = 0;
  show.weedKey = key;
  show.weed = WEED[key].map(([c0, c1, bright]) => ({ x0: colX(A, c0), x1: colX(A, c1 + 1), firm: !!bright, sink: 0, broken: 0, torn: 0, m: bright ? m++ : -1 }));
}
/* which cycle, and lay it: the weed, the paddles, the water she keeps */
export function applyCycle(show, ph, c) {
  const C = cycleOf(ph, show.cyc[ph]); show.C = C; layWeed(show, C.weed);
  show.pad.W.knot = 0; show.pad.E.knot = C.knot ? GT.knotHp : 0; show.pad.E.open = false;
  show.pad.W.open = !!C.flood; if (C.flood) { show.pad.W.knot = GT.knotHp; show.pad.W.to = GT.lv[C.lvl]; }
  show.water.target = GT.lv[C.lvl]; show.water.rate = GT.fillRate; show.visit = 0; show.rest = 0; show.turns = 0; show.gap = Math.max(show.gap, 1.0);
  if (ph === 3) for (const s of ['W', 'E']) show.lamps[s] = { st: 'hook' };
  if (c && c.cycle) c.cycle(C);
  return C;
}
export function startFight(show) { show.cyc = { 1: 0, 2: 0, 3: 0 }; const C = applyCycle(show, 1, null); show.water.target = 0; show.water.depth = 0; return C; }   /* (the lock stands empty until she wakes and floods it) */

/* ---------- THE WATER, THE PADDLES ---------- */
function stepWater(show, dt, ev, c) {
  const w = show.water, P = show.pad;
  for (const s of ['W', 'E']) if (P[s].cd > 0) P[s].cd -= dt;
  if (P.E.open && P.W.open) { w.target = w.depth; if (!show.told.running) { show.told.running = true; show.n.running++; c.number(show.A.E.paddle.x, show.A.walk - 40, 'THE UPPER PADDLE IS RUNNING: SHUT IT FIRST', '#ffd36b'); } }
  else if (P.E.open) { w.target = 0; w.rate = GT.drainRate; show.told.running = false; }
  else if (P.W.open) { w.target = P.W.to; w.rate = GT.fillRate; }
  const d = w.target - w.depth; if (Math.abs(d) > 0.01) w.depth += Math.sign(d) * Math.min(Math.abs(d), w.rate * dt);
  if (P.E.open && w.depth <= 0.01) { P.E.open = false; w.depth = 0; ev.push({ t: 'dry' }); c.sound('drainDone'); }
  if (P.W.open && !P.W.knot && w.depth >= P.W.to - 0.01) { P.W.open = false; ev.push({ t: 'floodDone' }); }
  c.water(w.depth);
}
/* the next height up, for a flood the hero lets in */
const nextUp = d => (d < GT.lv.low - 2 ? GT.lv.low : d < GT.lv.half - 2 ? GT.lv.half : GT.lv.high);

/* ---------- THE WEED ---------- */
function stepWeed(show, dt, heroes, ev) {
  const surf = surfY(show), dry = show.water.depth < 3;
  for (const [i, p] of show.weed.entries()) {
    if (p.broken > 0) { p.broken -= dt; if (p.broken <= 0) { p.broken = 0; p.sink = 0; } }
    else if (p.firm && !dry) { const on = heroes.some(h => h.onWeed === i);
      p.sink = Math.max(0, Math.min(1, p.sink + (on ? dt / GT.weedHold : -0.6 * dt)));
      if (p.sink >= 1) { p.broken = GT.weedRegrow; show.n.weedGive++; ev.push({ t: 'weedGive', i }); } }
    const mid = (p.x0 + p.x1) / 2, onWreck = mid > show.A.wreck.x0 && mid < show.A.wreck.x1;
    p.y = dry || (onWreck && surf > show.A.wreck.y) ? (onWreck ? show.A.wreck.y : show.A.bed) : surf + Math.round(p.sink * 3); }
}
export const weedAt = (show, x) => show.weed.findIndex(p => x >= p.x0 && x < p.x1);

/* ---------- THE SURGE (a wave from a gate's culvert, along the water) ---------- */
function stepSurge(show, dt, heroes, ev, c) {
  const s = show.surge; if (!s) return; const A = show.A, surf = surfY(show);
  s.x += s.dir * GT.surgeSpeed * dt;
  const band = [surf - 18, surf + 10];
  c.band('low', band, s.x - 14, s.x + 14, GT.dmg.surge, MOVE_NAME.surge, 'surge' + s.id, { push: s.dir * 220, from: s.x - s.dir * 20 });
  if ((s.dir > 0 && s.x > A.x1) || (s.dir < 0 && s.x < A.x0)) { show.surge = null; ev.push({ t: 'surgeDone' }); }
}
function launchSurge(show, side, ev, c) {
  const G = show.A[side]; show.surge = { x: G.face, dir: G.dir, side, id: ++show.armN }; show.n.surge++; ev.push({ t: 'surge', side }); c.sound('surge');
}

/* ---------- THE LAMPS (phase 3) ---------- */
function stepLamps(show, dt, ev, c) {
  const surf = surfY(show);
  for (const side of ['W', 'E']) { const L = show.lamps[side], G = show.A[side];
    if (L.st === 'fall') { L.vy = (L.vy || 0) + 900 * dt; L.y += L.vy * dt; if (L.y >= surf - 3) { L.y = surf - 3; L.st = 'lit'; L.t = GT.lampBurn; ev.push({ t: 'lampIn', side }); c.sound('lampIn'); } }
    else if (L.st === 'lit') { L.y = surf - 3; L.t -= dt; if (L.t <= 0) { L.st = 'out'; show.n.lightOut++; ev.push({ t: 'lightOut', side }); c.sound('lightOut'); c.number(L.x, surf - 40, 'THE LIGHT GOES OUT', '#9aa39a'); } }
    if (L.st === 'hook') { L.x = G.hook.x; L.y = G.hook.y + 10; } }
}
const litLamp = show => ['W', 'E'].map(s => show.lamps[s]).find(L => L.st === 'lit') || null;
const litSide = show => ['W', 'E'].find(s => show.lamps[s].st === 'lit') || null;

/* ---------- WHO IS WHERE ---------- */
/* h = { x, y, ground, swim, onWeed, onTile, alive, held } from the hands */
export function heroState(show, h) {
  const A = show.A, surf = surfY(show), depth = show.water.depth, inPool = h.x > A.x0 && h.x < A.x1;
  const wet = depth > 12 && inPool;
  const grabbable = wet && !h.onTile && (h.swim || h.onWeed >= 0 || (h.y > surf - GT.armUp && h.y < surf + GT.armDown));
  const atSurface = wet && (h.onWeed >= 0 || (h.swim && h.y < surf + 30) || (h.ground && Math.abs(h.y - surf) < 8));
  const footing = h.ground && (h.onTile || h.onWeed >= 0) && h.y <= surf + 2;
  const atGate = h.x < A.W.face + 5 * A.TS ? 'W' : h.x > A.E.face - 5 * A.TS ? 'E' : null;
  const reachable = footing && (atGate ? h.y >= A.walk - 2 : h.y >= surf - 80);
  return { surf, wet, grabbable, atSurface, footing, atGate, reachable };
}
const nearestHero = (heroes, x) => heroes.slice().sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;

/* ---------- AN ARM ---------- */
function startArm(e, show, k, h, c, ev, o = {}) {
  const M = MOVES[k], A = show.A, surf = surfY(show), hs = heroState(show, h), dir = Math.sign(h.x - e.x) || e.face || 1;
  const a = { k, st: 'tell', t: M.tell + (o.extra || 0), len: M.tell + (o.extra || 0), id: ++show.armN, hero: h, pair: !!o.pair, x: h.x, dir };
  if (k === 'grab') { a.x = h.x + (o.dx || 0); a.follow = !o.dx; }
  if (k === 'lash') { const gate = o.gate || (hs.footing && hs.atGate) || null; a.ox = gate ? A[gate].face : e.x; a.dir = gate ? A[gate].dir : dir; a.reach = gate ? GT.gateLashReach : GT.lashReach; }
  if (k === 'reach') { a.fy = hs.footing ? h.y : surf; a.x = h.x; a.gate = hs.atGate; a.ox = a.gate ? A[a.gate].face : h.x - dir * 20; }
  if (k === 'bite') { a.dir = dir; e.face = dir; }
  if (k === 'tear') { a.patch = h.onWeed; if (a.patch >= 0) show.weed[a.patch].torn = a.len; }
  if (k === 'lash') a.fy = hs.footing && hs.atGate ? h.y : surf;
  show.arms.push(a); e.face = dir; ev.push({ t: k + 'Tell', pair: a.pair }); c.say(M.mark); c.sound(k + 'Tell');
  return a;
}
const blowBox = (a, show, e) => { const A = show.A, surf = surfY(show);
  if (a.k === 'reach') { const x0 = a.gate ? (a.gate === 'W' ? A.x0 : a.x - GT.reachSpan) : a.x - GT.reachSpan, x1 = a.gate ? (a.gate === 'E' ? A.x1 : a.x + GT.reachSpan) : a.x + GT.reachSpan; return [x0, x1, a.fy - 24, a.fy - 10]; }
  if (a.k === 'bite') { const x0 = a.dir > 0 ? e.x : e.x - GT.biteLunge - 10, x1 = a.dir > 0 ? e.x + GT.biteLunge + 10 : e.x; return [x0, x1, surf - 40, surf + 14]; }
  if (a.k === 'grab') return [a.x - GT.grabR, a.x + GT.grabR, surf - GT.armUp - 22, surf + GT.armDown];
  return null; };
function stepArms(e, show, dt, c, ev) {
  const surf = surfY(show);
  for (const a of show.arms) {
    a.t -= dt;
    if (a.st === 'tell') {
      if (a.k === 'grab' && a.follow && a.t > a.len * (1 - GT.grabFollow) && a.hero) { const d = a.hero.x - a.x; a.x += Math.sign(d) * Math.min(Math.abs(d), 90 * dt); }
      if (a.k === 'bite' && a.hero) { const d = a.hero.x - a.dir * 30 - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), 60 * dt); }
      if (a.k === 'tear' && a.patch >= 0 && show.weed[a.patch]) show.weed[a.patch].torn = Math.max(0, a.t);
      if (a.t > 0) continue;
      a.st = 'blow'; a.t = MOVES[a.k].blow; show.n[a.k]++; ev.push({ t: a.k, pair: a.pair }); c.sound(a.k);
      if (a.k === 'grab') { const w = weedAt(show, a.x); if (w >= 0 && show.weed[w].firm && !(show.weed[w].broken > 0)) { show.weed[w].broken = GT.weedRegrow; show.weed[w].sink = 1; }
        const held = show.water.depth > 12 ? c.grab(blowBox(a, show, e), GT.dmg.grab, a) : null;
        if (held) { a.st = 'hold'; a.t = GT.grabHold; a.held = held; a.tick = GT.grabTick; show.n.held++; ev.push({ t: 'held' }); c.sound('held'); c.number(held.x, held.y - 40, 'STRIKE THE ARM THAT HOLDS YOU', '#ff6b6b'); } }
      else if (a.k === 'reach') c.hit(blowBox(a, show, e), GT.dmg.reach, MOVE_NAME.reach, { from: a.ox, unblockable: true, duck: true });
      else if (a.k === 'bite') { e.x += a.dir * 20; c.hit(blowBox(a, show, e), GT.dmg.bite, MOVE_NAME.bite, { from: e.x }); }
      else if (a.k === 'tear') { const p = show.weed[a.patch]; if (p && p.firm) { p.broken = GT.weedRegrow; p.sink = 1; p.torn = 0; ev.push({ t: 'torn' }); } }
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

/* ---------- CHOOSING A BLOW ---------- */
function chooseBlow(e, show, h, c, ev) {
  const hs = heroState(show, h), C = show.C || {}, ph = e.phase, gate = e.base === 'culvert' ? show.hide : null;
  const dist = Math.abs(h.x - e.x), opts = [];
  if (hs.grabbable) opts.push('grab');
  if (hs.atSurface || (gate && hs.wet && h.y < surfY(show) + 30) || (hs.footing && hs.atGate)) opts.push('lash');
  if (hs.reachable) opts.push('reach');
  if (!gate && dist < GT.biteRange && h.y > hs.surf - 44 && h.y < hs.surf + 30 && show.water.depth > 12) opts.push('bite');
  if (C.tear && h.onWeed >= 0 && show.weed[h.onWeed] && show.weed[h.onWeed].firm) opts.push('tear');
  if (!opts.length) return false;
  show.turns++;
  /* A PAIR: two arms told together, always answerable - high then low, or a ring then a reach, or (the fog) two rings with a way out between */
  if (C.pairs && show.turns % GT.pairEvery === 0) {
    const pair = C.doubles && opts.includes('grab') && show.turns % (GT.pairEvery * 2) === 0 ? ['grab', 'grab2']
      : opts.includes('reach') && opts.includes('lash') ? ['reach', 'lash'] : opts.includes('grab') && opts.includes('reach') ? ['grab', 'reach'] : opts.includes('grab') && opts.includes('lash') ? ['grab', 'lash'] : null;
    if (pair) { show.n.pair++; ev.push({ t: 'pair', ks: pair });
      if (pair[1] === 'grab2') { const A = show.A, side = h.x - A.x0 < 60 ? 1 : A.x1 - h.x < 60 ? -1 : (e.x < h.x ? 1 : -1);   /* the second ring on the side she comes from: step away from her */
        startArm(e, show, 'grab', h, c, ev, { pair: true }); startArm(e, show, 'grab', h, c, ev, { pair: true, dx: -side * 34, extra: 0.1 }); }
      else { const first = pair[0], second = pair[1], gap = MOVES[first].tell + GT.pairGap - MOVES[second].tell;
        startArm(e, show, first, h, c, ev, { pair: true, gate }); startArm(e, show, second, h, c, ev, { pair: true, gate, extra: Math.max(0, gap) }); }
      show.visit++; return true; } }
  const k = opts.includes('tear') && show.turns % 3 === 1 ? 'tear' : opts.includes('bite') && show.turns % 2 === 0 ? 'bite' : opts[show.rot++ % opts.length];
  startArm(e, show, k, h, c, ev, { gate: k === 'lash' ? gate : undefined });
  show.visit++; return true;
}

/* ---------- ONE FRAME ----------
   c = { heroes: [h], say(mark), sound(key), number(x, y, line, col), water(depth), band(kind, [t,b], x0, x1, dmg, name, key, {push, from}),
         hit(box [l,r,t,b], dmg, name, {from, unblockable, duck}), grab(box, dmg, arm) -> hero|null, hold(arm, dt) -> still held, drag(arm, dmg), release(arm), cycle(C) }
   Returns the frame's events. */
export function stepShow(e, show, dt, c) {
  const ev = []; if (!e || !show) return ev;
  const A = show.A, heroes = (c.heroes || []).filter(h => h.alive);
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.vx = 0;
  stepWater(show, dt, ev, c); stepWeed(show, dt, heroes, ev); stepLamps(show, dt, ev, c); stepSurge(show, dt, heroes, ev, c);
  if (show.fogTo !== undefined) show.fog += Math.sign(show.fogTo - show.fog) * Math.min(Math.abs(show.fogTo - show.fog), dt / 1.5);
  if (e.mode !== e.lastMode) { e.lastMode = e.mode; e.tellId = (e.tellId || 0) + 1; }
  if (!e.alive || e.mode === 'sleep') return ev;
  const surf = surfY(show), depth = show.water.depth, hero = nearestHero(heroes, e.x);
  e.open = gtOpen(e) ? Math.max(0, e.modeT) : 0;
  if (!special(e)) stepArms(e, show, dt, c, ev);
  switch (e.mode) {
    case 'wake': e.x += (clampIn(A, hero ? hero.x : A.mid) - e.x) * Math.min(1, dt * 0.5); e.y = A.bed; show.water.target = GT.lv.low; show.water.rate = GT.wakeRate;
      if (e.modeT <= 0) { e.mode = e.base = 'lurk'; show.gap = 1.0; c.number(e.x, surf - 50, 'THE BRIGHT WEED HOLDS. THE DARK WEED IS WATER', '#ffd36b'); show.tellDrainAt = 6; } return ev;
    case 'handTell': { const G = A.E; if (e.base !== 'culvert') { e.x += (clampIn(A, G.face + G.dir * 40) - e.x) * Math.min(1, dt * 2); swimY(e, show); }
      if (!show.pad.E.open) { e.mode = e.base; return ev; }
      strandCheck(e, show, ev, c, heroes); if (e.mode !== 'handTell') return ev;
      if (e.modeT <= 0) { show.pad.E.open = false; show.water.target = show.water.depth; show.n.shut++; ev.push({ t: 'shut' }); c.sound('paddleShut'); c.number(G.paddle.x, G.walk - 40, 'SHE SHUT THE PADDLE', '#ff6b6b');
        e.mode = 'surgeTell'; e.modeT = GT.surgeTell; e.surgeSide = 'W'; e.refill = true; ev.push({ t: 'surgeTell', refill: true }); c.say('!!'); c.sound('surgeTell'); }
      return ev; }
    case 'recoil': swimY(e, show); if (e.modeT <= 0) e.mode = e.base; return strandCheck(e, show, ev, c, heroes);
    case 'stranded': { e.y = A.bed; const tx = A.W.cul.x, d = tx - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), GT.crawl * dt); e.face = Math.sign(d) || e.face;
      if (Math.abs(d) < 8) e.modeT = Math.min(e.modeT, 0);
      if (e.modeT <= 0) { e.mode = 'drag'; e.modeT = GT.dragT; e.big = false; e.open = 0; ev.push({ t: 'drag' }); c.sound('drag'); } return ev; }
    case 'drag': { const k = Math.min(1, dt * 6); e.x += (A.W.cul.x - e.x) * k; e.y = A.bed;
      if (e.modeT <= 0) { e.x = A.W.cul.x; e.mode = 'surgeTell'; e.modeT = GT.surgeTell; e.surgeSide = 'W'; e.refill = true; e.hidden = true; ev.push({ t: 'surgeTell', refill: true }); c.say('!!'); c.sound('surgeTell'); } return ev; }
    case 'surgeTell': if (e.modeT <= 0) { launchSurge(show, e.surgeSide, ev, c); e.mode = 'surge'; e.modeT = GT.surgeT;
        if (e.refill) { show.n.refill++; if (e.newCycle) { show.cyc[e.phase]++; show.cycle++; show.n.cycle++; applyCycle(show, e.phase, c); ev.push({ t: 'cycle', cycle: show.cycle, name: show.C.name }); }
          else { show.water.target = GT.lv[(show.C || {}).lvl || 'low']; show.water.rate = GT.fillRate; } e.newCycle = false; } }
      return ev;
    case 'surge': if (e.modeT <= 0) { e.refill = false; e.hidden = false; e.mode = e.base; if (e.base === 'culvert') { const G = A[show.hide]; e.x = G.cul.x; } show.gap = Math.max(show.gap, 0.6); } return ev;
    case 'flushed': { e.y = surf + 8; e.x += (e.flushX - e.x) * Math.min(1, dt * 5);
      if (e.modeT <= 0) { e.mode = 'dive'; e.modeT = 0.4; e.big = false; e.open = 0; ev.push({ t: 'dive' }); } return ev; }
    case 'dive': e.y = Math.min(A.bed, e.y + 60 * dt); if (e.modeT <= 0) { show.cyc[e.phase]++; show.cycle++; show.n.cycle++; applyCycle(show, e.phase, c); ev.push({ t: 'cycle', cycle: show.cycle, name: show.C.name });
        if (e.phase === 2) { show.hide = show.hide === 'W' ? 'E' : 'W'; e.base = 'shift'; } else { e.base = 'lurk'; for (const s of ['W', 'E']) show.lamps[s] = { st: 'hook' }; } e.mode = e.base; e.lured = false; } return ev;
    case 'shiftTell': if (e.modeT <= 0) { e.mode = e.base = 'shift'; show.n.shift++; ev.push({ t: 'shift', to: show.hide }); } return ev;
    case 'floodTell': show.water.target = GT.lv.high; show.water.rate = GT.fillRate; if (e.modeT <= 0) { show.cyc[2] = 0; applyCycle(show, 2, c);
        show.hide = hero && hero.x > A.mid ? 'E' : 'W'; e.mode = e.base = 'shift'; c.number(e.x, surf - 50, 'OPEN THE PADDLE OF HER CULVERT', '#ffd36b'); } return ev;
    case 'fogTell': show.fogTo = 1; show.water.target = GT.lv.half; show.water.rate = GT.drainRate; if (e.modeT <= 0) { show.cyc[3] = 0; applyCycle(show, 3, c); e.mode = e.base = 'lurk';
        c.number(e.x, surf - 50, 'DROP A LAMP AT A GATE, THEN WORK ITS PADDLE', '#ffd36b'); } return ev;
  }
  /* ---- THE PHASE, only between her blows ---- */
  const ph = gtPhase(e);
  if (ph > e.phase && !armsBusy(show) && (e.mode === e.base)) {
    e.phase = ph; ev.push({ t: 'phase', ph }); clearArms(show, c); e.lured = false; show.pad.E.open = false; show.pad.W.open = false; show.pad.W.knot = show.pad.E.knot = 0; show.handWait = -1;
    if (ph === 2) { e.mode = 'floodTell'; e.modeT = GT.floodTell; c.sound('floodTell'); c.number(e.x, surf - 50, 'THE LOCK FLOODS: SHE HIDES IN THE CULVERTS', '#ffd36b'); }
    else { e.mode = 'fogTell'; e.modeT = GT.fogTell; show.hide = null; c.sound('fogTell'); c.number(e.x, surf - 50, 'THE FOG COMES DOWN: SHE GOES FOR THE LIGHT', '#ffd36b'); }
    return ev; }
  if (show.tellDrainAt !== undefined) { show.tellDrainAt -= dt; if (show.tellDrainAt <= 0) { show.tellDrainAt = undefined; c.number(A.E.paddle.x, A.walk - 40, 'DRAIN THE LOCK WHILE SHE IS AT THE GATE', '#ffd36b'); } }
  /* ---- HER HAND: the drain is open, and she will not have it ---- */
  if (show.pad.E.open && !show.pad.W.open && depth > GT.aground + 4 && !e.lured) {
    if (show.handWait < 0) show.handWait = GT.handReact;
    else { show.handWait -= dt; if (show.handWait <= 0 && !special(e)) { show.handWait = -1; clearArms(show, c); e.mode = 'handTell'; e.modeT = GT.handTell; e.tellLen = GT.handTell; show.n.hand++; ev.push({ t: 'handTell' }); c.sound('handTell');
      c.number(A.E.paddle.x, A.walk - 40, 'HER HAND IS ON THE PADDLE: STRIKE IT', '#ffd36b'); return ev; } } }
  else show.handWait = -1;
  strandCheck(e, show, ev, c, heroes);
  if (special(e)) return ev;
  /* ---- WHERE SHE GOES ---- */
  if (show.turnsBusy === undefined) show.turnsBusy = 0;
  if (!armsBusy(show)) show.gap -= dt;
  const C = show.C || {};
  let tx = e.x;
  if (e.base === 'culvert') { const G = A[show.hide]; tx = G.cul.x; e.y = A.bed; show.shiftT -= dt;
    if (show.shiftT <= 0 && !armsBusy(show)) { show.shiftT = GT.shiftEvery; const want = hero && Math.random() < 0.75 ? (hero.x > A.mid ? 'E' : 'W') : (show.hide === 'W' ? 'E' : 'W');
      if (want !== show.hide) { show.hide = want; e.mode = 'shiftTell'; e.modeT = GT.shiftTell; ev.push({ t: 'shiftTell', to: want }); c.sound('shiftTell'); return ev; } } }
  else if (e.base === 'shift') { const G = A[show.hide]; tx = G.cul.x; if (Math.abs(e.x - tx) < 6) { e.base = 'culvert'; if (!armsBusy(show)) e.mode = 'culvert'; show.shiftT = GT.shiftEvery; ev.push({ t: 'inCulvert', side: show.hide }); } }
  else if (e.base === 'lured') { const L = litLamp(show); if (!L) { e.base = 'lurk'; e.lured = false; if (!armsBusy(show)) e.mode = 'lurk'; } else { tx = L.x; if (Math.abs(e.x - L.x) < 16 && !e.lured) { e.lured = true; show.n.lured++; ev.push({ t: 'lured', side: litSide(show) }); c.number(L.x, surf - 40, 'SHE WILL NOT LEAVE THE LIGHT: CUT HER', '#ffd36b'); } } }
  else { /* lurk: she hunts you, and after a visit's worth of blows she goes back to her lair in the wreck a while */
    if (e.phase === 3 && litLamp(show) && !armsBusy(show)) { e.base = 'lured'; e.mode = 'lured'; return ev; }
    if (show.rest > 0) { show.rest -= dt; tx = colX(A, C.lair || 20); }
    else if (hero) { tx = clampIn(A, hero.x + (hero.x > A.mid ? -GT.keep : GT.keep)); if (show.visit >= GT.visits[e.phase - 1] && e.phase === 1) { show.visit = 0; show.rest = GT.lairRest; } } }
  const sp = depth < 12 ? 0 : depth < GT.lv.half - 10 ? GT.swim.low : depth < GT.lv.high - 10 ? GT.swim.half : GT.swim.high, dx = tx - e.x;
  const held = show.arms.some(a => a.st === 'hold' || a.st === 'blow'), k = armsBusy(show) && e.base !== 'shift' ? (held ? 0 : 0.4) : 1;   /* (she drifts while she tells, and holds still while an arm is out) */
  if (Math.abs(dx) > 3 && k > 0) { e.vx = Math.sign(dx) * sp * k; e.x += Math.sign(dx) * Math.min(Math.abs(dx), sp * k * dt); }
  if (e.base !== 'culvert') swimY(e, show);
  if (hero) e.face = Math.sign(hero.x - e.x) || e.face;
  /* ---- A BLOW ---- */
  if (hero && show.gap <= 0 && !armsBusy(show)) {
    const lured = e.base === 'lured' && e.lured;
    if (lured) { if (Math.abs(hero.x - e.x) < 60 && heroState(show, hero).wet) { chooseBlow(e, show, hero, c, ev); show.gap = GT.gap[e.phase - 1]; } }
    else if (e.base === 'culvert' && show.turns % 4 === 3 && !special(e)) { show.turns++; e.mode = 'surgeTell'; e.modeT = GT.surgeTell; e.surgeSide = show.hide; e.refill = false; ev.push({ t: 'surgeTell' }); c.say('!!'); c.sound('surgeTell'); show.gap = GT.gap[e.phase - 1]; return ev; }
    else if (show.rest > 0 && e.phase === 1) { if (heroState(show, hero).grabbable && show.turns % 2 === 0) { show.turns++; startArm(e, show, 'grab', hero, c, ev); } else show.turns++; show.gap = GT.gap[0] * 1.6; }
    else if (chooseBlow(e, show, hero, c, ev)) show.gap = GT.gap[e.phase - 1]; else show.gap = 0.3; }
  if (!armsBusy(show) && armMode(e.mode)) e.mode = e.base;
  if (!armsBusy(show) && !special(e) && e.mode !== e.base) e.mode = e.base;
  return ev;
}
const clampX = (A, x) => Math.max(A.x0 + 14, Math.min(A.x1 - 14, x));
/* HER WATER: she keeps five tiles off the gates' faces (her arms reach up them; her body is never under a walker's ledge) */
const clampIn = (A, x) => Math.max(A.x0 + 5 * A.TS, Math.min(A.x1 - 5 * A.TS, x));
function swimY(e, show) { const A = show.A, surf = surfY(show); e.y = Math.min(A.bed, surf + GT.h); }
/* AGROUND: the water is under her depth and she is not in a culvert - stranded where she lies */
function strandCheck(e, show, ev, c, heroes) {
  if (show.water.depth >= GT.aground || !show.pad.E.open || e.base === 'culvert' || e.hidden) return ev;   /* (aground only as the drain runs: in water coming back up she is swimming again) */
  if (!['lurk', 'lured', 'shift', 'recoil', 'handTell'].includes(e.mode) && !armMode(e.mode)) return ev;
  clearArms(show, c); const big = !!e.lured; e.lured = false; e.base = e.phase === 2 ? 'shift' : 'lurk';
  e.mode = 'stranded'; e.modeT = big ? GT.bigT : GT.strandT; e.big = big; e.open = e.modeT; e.y = show.A.bed; e.newCycle = true; show.n.strand++; if (big) show.n.big++;
  for (const s of ['W', 'E']) if (show.lamps[s].st === 'lit') show.lamps[s].st = 'out';
  ev.push({ t: 'stranded', big }); c.sound('stranded'); c.number(e.x, show.A.bed - 50, 'SHE IS STRANDED: CUT HER', '#ffd36b');
  return ev;
}

/* ---------- A HERO'S SWING: her arms, the paddles, the lamp hooks ----------
   Returns [{ what, side?, res? }] for the hands to answer with sound and a line. `seen` is the swing's hit set (one of each a swing) */
export function strikeAt(e, show, hb, seen) {
  const out = []; if (!e || !show || !hb) return out; const A = show.A, once = seen || new Set();
  const inBox = (x, y, r) => x + r > hb.l && x - r < hb.r && y + r > hb.t && y - r < hb.b;
  /* the arm that holds you, and her hand on the paddle */
  for (const a of show.arms) { if (a.st !== 'hold' || once.has(a)) continue; const hx = a.held ? a.held.x : a.x, hy = a.held ? a.held.y - 6 : surfY(show);
    if (segHitsBox(hx, hy, e.x, e.y - 10, hb) || inBox(hx, hy, 6)) { once.add(a); a.cut = true; out.push({ what: 'arm', a }); } }
  if (e.mode === 'handTell' && !once.has('hand')) { const G = A.E, hx = G.paddle.x, hy = G.paddle.y - 14;
    if (segHitsBox(G.face, surfY(show), hx, hy, hb) || inBox(hx, hy, 7)) { once.add('hand'); out.push({ what: 'hand' }); } }
  for (const side of ['W', 'E']) { const G = A[side], key = 'pad' + side;
    if (!once.has(key) && hb.r > G.paddle.x - 8 && hb.l < G.paddle.x + 8 && hb.b > G.paddle.y - 30 && hb.t < G.paddle.y) { once.add(key); out.push({ what: 'paddle', side, res: strikePaddle(e, show, side) }); }
    const L = show.lamps[side], hk = 'hook' + side;
    if (!once.has(hk) && inBox(G.hook.x, G.hook.y, 7)) { once.add(hk); out.push({ what: 'hook', side, res: strikeHook(e, show, side) }); } }
  return out;
}
export function strikePaddle(e, show, side) {
  const p = show.pad[side], A = show.A;
  if (p.cd > 0) return 'busy'; p.cd = 0.5;
  if (p.knot > 0) { p.knot--; show.n.knot++; if (p.knot > 0) return 'knot'; if (side === 'W' && p.open) { p.open = false; show.water.target = show.water.depth; return 'unjam'; } return 'knotCut'; }
  if (e.mode === 'handTell' || e.mode === 'stranded' || e.mode === 'drag' || e.mode === 'flushed' || e.mode === 'floodTell' || e.mode === 'fogTell' || e.mode === 'wake') return p.open ? 'busy' : 'wait';
  /* SHE IS IN THIS GATE'S CULVERT (phase 2): the rush throws her out */
  if (e.base === 'culvert' && show.hide === side && !special(e)) { flush(e, show, side, false); return 'flush'; }
  /* LURED TO THIS GATE'S LAMP (phase 3): she cannot get away - the drain strands her, the flood throws her */
  const lit = litSide(show);
  if (e.lured && lit === side) { if (side === 'W') { flush(e, show, side, true); return 'flushBig'; } p.open = true; show.n.drain++; return 'drainBig'; }
  if (side === 'E') { if (p.open) return 'busy'; p.open = true; show.n.drain++; if (show.pad.W.open) return 'running'; return 'drain'; }
  if (p.open) return 'busy'; p.open = true; p.to = nextUp(show.water.depth); show.n.flood++;
  if (e.base === 'culvert') { show.n.wrongCulvert++; return 'notHere'; }
  return 'flood';
}
function flush(e, show, side, big) {
  const G = show.A[side]; for (const a of show.arms) if (a.st === 'hold') a.st = 'back'; show.arms = [];
  e.mode = 'flushed'; e.modeT = big ? GT.bigT : GT.flushT; e.big = big; e.open = e.modeT; e.flushX = G.face + G.dir * 80; e.x = G.cul.x; e.lured = false;
  show.n.flush++; if (big) show.n.big++; show.surgeFx = { side, t: 0.6 };
  for (const s of ['W', 'E']) if (show.lamps[s].st === 'lit') show.lamps[s].st = 'out';
}
export function strikeHook(e, show, side) {
  const L = show.lamps[side]; if (e.phase < 3) { show.n.fast++; return 'fast'; }
  if (L.st !== 'hook') return 'none';
  L.st = 'fall'; L.vy = 0; L.x = show.A[side].hook.x; L.y = show.A[side].hook.y + 10; show.n.lamp++; return 'drop';
}
/* the hand struck: she lets go of the paddle */
export function handCut(e, show) { if (e.mode !== 'handTell') return false; e.mode = 'recoil'; e.modeT = GT.recoilT; show.n.handCut++; return true; }
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
  /* each gate's walers (timber rails on its face, three rows apart) and its walkway, where the paddle's gear stands */
  for (const r of STAGE.walers) { plat(sx + 1, R - r, 3); plat(ex - 3, R - r, 3); }
  plat(sx + 1, R - STAGE.walk, 4); plat(ex - 4, R - STAGE.walk, 4);
  /* the sunken narrowboat on the bed: her lair */
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
   A HUMAN BOT (the Puppeteer's lesson): it sees a tell PLAN.react s after it began, misreads some (PLAN.missDodge), lets some chances go
   (PLAN.missHand: her hand on the paddle; PLAN.late: a paddle struck late), and mashes a hold like a person (not every frame).
   s = { P: { x, y, face, ground, swim, snare, atk, onWeed, onTile }, e, show, reach, shield, t (seconds), rng, mem } -> keys
   out = { gx, face, atk, jump, down, up, drop, block, why } */
export const PLAN = { react: 0.25, missDodge: 0.12, missHand: 0.22, late: 0.2, mash: 0.35 };
export function greenteethPlan(s) {
  const { P, e, show, reach } = s, A = show.A, out = { gx: null, face: P.face, atk: false, jump: false, down: false, up: false, drop: false, block: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 800) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = key => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= PLAN.react; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const surf = surfY(show), depth = show.water.depth, clamp = x => Math.max(A.x0 + 10, Math.min(A.x1 - 10, x));
  const onWalk = side => { const G = A[side]; return P.ground && Math.abs(P.y - A.walk) < 3 && (G.dir > 0 ? P.x >= G.face && P.x <= G.face + 64 : P.x <= G.face && P.x >= G.face - 64); };
  const blade = P.y - 9;
  /* ---- 0. HELD: strike the arm (and mash) ---- */
  if (P.snare > 0) { const a = show.arms.find(q => q.st === 'hold'); out.face = a ? (Math.sign(e.x - P.x) || P.face) : P.face; out.atk = rng() < PLAN.mash; out.jump = rng() < PLAN.mash; out.why = 'held'; return out; }
  /* ---- 1. THE BLOWS COMING ---- */
  const hs = heroState(show, { x: P.x, y: P.y, ground: P.ground, swim: P.swim, onWeed: P.onWeed ?? -1, onTile: !!P.onTile });
  for (const a of show.arms.filter(q => q.st === 'tell' || q.st === 'blow').sort((p, q) => p.t - q.t)) {
    const key = 'a' + a.id; if (!seenFor(key) || roll(key + 'd', PLAN.missDodge)) continue;
    if (a.k === 'grab' && Math.abs(a.x - P.x) < GT.grabR + 12 && (hs.grabbable || !P.ground)) { const other = show.arms.find(q => q !== a && q.k === 'grab' && q.st === 'tell');
      let side = a.x - A.x0 < 60 ? 1 : A.x1 - a.x < 60 ? -1 : (P.x < a.x ? -1 : 1); if (other && Math.sign(other.x - a.x) === side) side = -side;
      out.gx = clamp(a.x + side * (GT.grabR + 30)); out.why = 'out of the ring'; if (a.t < 0.5 && P.ground && P.onWeed >= 0) out.jump = true; return out; }
    if (a.k === 'lash' && a.t < 0.14 + (a.st === 'blow' ? 1 : 0)) { const inRange = a.dir > 0 ? P.x > a.ox - 10 && P.x < a.ox + a.reach + 10 : P.x < a.ox + 10 && P.x > a.ox - a.reach - 10;
      if (inRange && Math.abs(P.y - a.fy) < 30) { if (P.swim) { out.down = true; out.why = 'dive the lash'; } else { out.jump = true; out.why = 'jump the lash'; } return out; } }
    if (a.k === 'reach' && Math.abs(P.y - a.fy) < 4 && a.t < 0.3) { out.down = true; out.why = 'duck the reach'; return out; }
    if (a.k === 'bite' && Math.abs(P.x - e.x) < GT.biteLunge + 30) { if (s.shield && a.t < 0.4) { out.block = true; out.face = Math.sign(e.x - P.x) || 1; out.why = 'block the bite'; return out; }
      if (P.swim && a.t < 0.35) { out.down = true; out.why = 'dive the bite'; return out; } if (P.ground && a.t < 0.15) { out.jump = true; out.why = 'jump the bite'; return out; }
      out.gx = clamp(e.x + (P.x < e.x ? -1 : 1) * (GT.biteLunge + 36)); out.why = 'back off the bite'; return out; }
    if (a.k === 'tear' && P.onWeed === a.patch) { const firm = show.weed.map((p, i) => ({ p, i })).filter(o => o.i !== a.patch && o.p.firm && !(o.p.broken > 0)).sort((p, q) => Math.abs((p.p.x0 + p.p.x1) / 2 - P.x) - Math.abs((q.p.x0 + q.p.x1) / 2 - P.x))[0];
      out.gx = firm ? (firm.p.x0 + firm.p.x1) / 2 : clamp(P.x + 40); out.jump = P.ground; out.why = 'off the torn weed'; return out; }
  }
  if (show.surge && seenFor('surge' + show.surge.id) && Math.abs(show.surge.x - P.x) < 70 && Math.sign(P.x - show.surge.x) === show.surge.dir && Math.abs(P.y - surf) < 30) {
    if (P.swim) out.down = true; else if (Math.abs(show.surge.x - P.x) < 34) out.jump = true; out.why = 'the surge'; return out; }
  /* ---- 2. SHE IS OPEN: to her, and cut ---- */
  if (gtOpen(e) && seenFor('open' + e.tellId)) { const d = e.x - P.x; out.face = Math.sign(d) || 1;
    if (onWalk('E') || onWalk('W')) { out.gx = e.x; out.why = 'down to her'; if (Math.abs(d) < 60) out.drop = true; return out; }
    out.gx = Math.abs(d) > reach - 4 ? e.x - out.face * (reach - 8) : null; out.atk = Math.abs(d) < reach + 10 && Math.abs(P.y - e.y) < 40; if (P.swim && P.y < e.y - 8) out.down = true; out.why = 'open'; return out; }
  /* ---- 3. HER HAND ON THE PADDLE ---- */
  if (e.mode === 'handTell' && seenFor('hand' + e.tellId) && !roll('hand' + e.tellId, PLAN.missHand)) { const G = A.E;
    if (onWalk('E')) { out.gx = G.paddle.x - 14; out.face = 1; out.atk = true; out.why = 'strike the hand'; return out; } }
  /* ---- 4. THE OBJECTIVE ---- */
  const C = show.C || {};
  const climbTo = side => { const G = A[side];
    if (onWalk(side)) return true;
    out.gx = G.stand; if (Math.abs(P.x - G.stand) < 14) { out.why = 'up the gate'; if (P.swim) { out.up = true; if (P.y - surf < 26) out.jump = true; } else if (P.ground) out.jump = true; }
    else { out.why = 'to the ' + side + ' gate'; const inTrap = P.ground && !P.onTile && P.onWeed < 0; if (P.swim) out.up = P.y - surf > 18; if (P.ground && rng() < 0.02) out.jump = true; }
    return false; };
  const strikePad = side => { const G = A[side]; out.gx = G.paddle.x + (side === 'W' ? 14 : -14); out.face = side === 'W' ? -1 : 1;
    if (Math.abs(P.x - out.gx) < 4 && P.atk < 0 && !(show.pad[side].cd > 0)) out.atk = true; out.why = 'the ' + side + ' paddle'; };
  if (e.phase === 1 || (e.phase === 3 && !litSide(show) && e.mode !== 'fogTell')) {
    if (e.phase === 3 && ['W', 'E'].some(sd => show.lamps[sd].st === 'hook')) { const side = P.x > A.mid ? 'E' : 'W';
      if (show.lamps[side].st === 'hook') { if (climbTo(side)) { const G = A[side]; out.gx = G.hook.x - G.dir * 18; out.face = G.dir; if (Math.abs(P.x - out.gx) < 5 && P.atk < 0) out.atk = true; out.why = 'drop the lamp'; } return out; } }
    if (show.pad.W.open && show.pad.W.knot > 0) { if (climbTo('W')) strikePad('W'); return out; }
    if (climbTo('E')) { const near = Math.abs(e.x - A.E.face) < 110 && !special(e) && show.rest <= 0 && e.base === 'lurk';
      if (show.pad.E.knot > 0 || (near && !show.pad.E.open && seenFor('near' + Math.floor(t)) && !roll('late' + Math.floor(t * 2), PLAN.late))) strikePad('E');
      else { out.gx = A.E.stand - 10; out.face = -1; out.why = 'wait for her at the gate'; } }
    return out; }
  if (e.phase === 3 && litSide(show)) { const side = litSide(show); if (climbTo(side)) { if (e.lured) strikePad(side); else { out.gx = A[side].stand; out.face = -A[side].dir; out.why = 'wait for her at the light'; } } return out; }
  if (e.phase === 2 && show.hide) { const side = e.base === 'culvert' ? show.hide : (P.x > A.mid ? 'E' : 'W');
    if (climbTo(side)) { if (e.base === 'culvert' && show.hide === side) strikePad(side); else { out.gx = A[side].stand; out.why = 'wait on the walkway'; } } return out; }
  return out;
}

/* ---------- THE FRAME her body shows (src/redraw/greenteeth_art.js) ---------- */
export function gtFrame(e) {
  const a = e.anim || 0, m = e.mode || '';
  if (m === 'stranded') return GT_F.stranded[Math.floor(a * 3) % 2];
  if (m === 'drag') return GT_F.drag;
  if (m === 'flushed') return GT_F.flushed;
  if (m === 'grabTell' || m === 'lashTell' || m === 'surgeTell' || m === 'tearTell') return GT_F.tell;
  if (m === 'biteTell' || m === 'bite') return GT_F.lunge;
  if (m === 'reachTell' || m === 'reach' || m === 'lash' || m === 'handTell') return GT_F.reach;
  if (m === 'grab') return GT_F.grab;
  if (m === 'culvert' || m === 'hideIn') return GT_F.hide;
  if (e.flash > 0.05) return GT_F.hurt;
  return GT_F.swim[Math.floor(a * 3) % 2];
}
