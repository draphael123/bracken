// src/tomb-king.js - THE COFFIN KING, THE SEALED PYRAMID's boss (claude/pyramidboss, the OPUS lane B, 2026-10-13). Daniel approved the design
// (scratch/briefs-sealedpyramid-1013.md LANE B): a man-sized stone sarcophagus with arms that walks on stone legs and leaps; the pharaoh inside shows only when
// the lid is off. Working name - the report proposes a better one. Built to the design standard B1-B17 (B17: his central mechanic is the level's own plates and
// switches) and B6 amended (tuned WITH FLASKS, 60-70%).
//
// WHAT HE IS (B11/B14/B15): A CONSTRUCT, A PUZZLE BOSS. His LID is never a wall (B13/B15): closed it takes TK.resist of a blow (a told CLANK: "SEALED"; x0.55
//   in phase three, the lid cracked for good). HIS OPENING IS THE LEVEL'S VERB (B1/B17): THE TOMB IS A MACHINE. The burial chamber holds the level's own
//   machine in one room:
//     THE SWITCHES  a lever on each wall, struck from its side ledge (or a jump from the floor under it), throws THAT SIDE'S COUNTERWEIGHT: a stone on a chain
//                   swings across the floor's near half (TK.lever) - a sarcophagus in its sweep is TIPPED OVER onto his back. Works from phase one (it teaches it);
//                   phase three resets the levers twice as fast.
//     THE PLATES    three pale plates in the floor (from phase two: THE TRAPS ARM). Each fires the tomb's own trap into its reach - the west block, the east block,
//                   and the middle plate's dart walls (both thirds). A trap that lands on him FLIPS him. If HE stands on a plate (a windup, a landing, the end of a
//                   roll - he steps OVER them while he walks) it fires on him, and on you if you are in its reach. His thrown lid presses the plates it rolls over.
//   FLIPPED (B10): the lid is thrown off, he lies on his back - OPEN: a gold ring and a timer bar, TK.openT s, a blow x TK.openMul (one window TK.openCap of
//   him at most, counted on what LANDS: src/main.js calls take() in wardedDamage, after every multiplier - claude/capsfix). B4: flipped he lies still. B3: the
//   lid CLAMPS back (TK.clampT) and a TOLD TK.wardT s WARD follows (a pale ring, WARDED x TK.wardMul, a trap or a counterweight glances off).
// THE MOVES (each told: a windup pose, a mark, a word, a colour, a sound; one windup at a time; he picks by WHERE YOU STAND, never a fixed rotation - B16 each its
//   own windup and release pose, placeholders until lane C):
//   PHASE ONE (closed):  LID SLAM '!' (rears, brings his body down in front, a shock line runs the floor - block it, jump the line) | BANDAGE LASH '!' (a floor or
//     ledge whip that pulls you a step - block it) | COFFIN LEAP '!!' (he crouches, then jumps onto the platform you have stood on longer than TK.dwell s: its
//     shadow + a roar - THE ANTI-CROWD MOVE: get off it) | CHAIN REEL '!' (a chain from his chest at you or your ledge; it hauls you in - block it, or cut it)
//   PHASE TWO (TK.p2, THE TRAPS ARM): + GRAVE CALL (told, no blow: the lid cracks, TK.call.n of the dead climb out of the floor alcoves - never more than
//     TK.call.max; mummies tread the plates) | LID THROW '!' (a spinning disc along the floor that returns: answered twice; it presses the plates) | CANOPIC
//     VOLLEY '!' (four jars on told marks: each bursts into a small poison cloud)
//   PHASE THREE (TK.p3, THE LID CRACKS FOR GOOD: weaker closed, faster, the levers reset twice as fast): + TOMB ROLL '!!' (he rolls the floor's length: jump
//     him; over a plate he trips on it) | SAND BREATH '!' (a cone: blinds the screen's edge and slows) | SAND PIT '!' (his stomp opens a sinkhole on your
//     spot) | CURSE MARK '!!' (he glows; your spot is marked; a column of sand strikes it TK.curse.delay s later)
//   STATED CHANGE to B5 (one new move a phase): the brief asks for eleven attacks, so phases two and three add three and four (tools/sealed-pyramid.mjs says so).
//   REDS are only the leap, the roll and the curse (so a shield answers most of him).
// PURE: no DOM, no main.js. The world is a context `c` (src/tomb-king-hands.js binds it). tkPlan is the boss lab's HUMAN bot (src/lab.js).

export const TK = {
  hp: 5000, w: 30, h: 40, markH: 54,
  openMul: 1.7, openCap: 0.09, openT: 3.6, clampT: 0.6, wardT: 3.0, wardMul: 0.4, resist: 0.4, resist3: 0.55, lidless: 0.4,
  p2: 0.6, p3: 0.3,
  walk: 42, walk3: 56, keep: 52, gap: [1.6, 1.5, 1.15], firstGap: 1.2,
  dwell: 3.5, leapCd: 6.0, callCd: 16, curseCd: 5,
  lever: { delay: 0.55, swing: 0.7, reset: [13, 13, 6.5], h: 34 },
  slam: { tell: 0.7, reach: 58, shockV: 260, shockLen: 150, shockH: 10 },
  lash: { tell: 0.6, reach: 124, pull: 22 },
  leap: { tell: 0.9, air: 0.7, r: 34, perch: 0.5, drop: 0.35 },
  reel: { tell: 0.6, v: 420, range: 220, haul: 170, haulT: 1.4, crushR: 34 },
  call: { tell: 1.0, n: [0, 2, 3], max: 3 },
  thrw: { tell: 0.7, v: 280, r: 10, catchT: 0.4 },
  volley: { tell: 0.8, fly: 0.7, n: 4, r: 12, cloudR: 18, cloudT: 1.6, tick: 0.5 },
  roll: { tell: 0.9, v: 300, h: 24, trip: 0.4 },
  breath: { tell: 0.7, t: 0.6, len: 124, blind: 1.0, slow: 1.0 },
  pit: { tell: 0.8, r: 22, sandT: 3.0 },
  curse: { tell: 0.6, delay: 1.5, r: 14 },
  dmg: { slam: 42, shock: 24, lash: 31, leap: 64, chain: 13, crush: 35, lid: 33, jar: 24, cloud: 8, roll: 62, breath: 22, pit: 27, curse: 66, weight: 30 },
};
/* THE MOVES: the mode while it is told, its mark ('' = told but no blow), the answer (src/marks.js keeps the same rows), and the phase it comes in */
export const MOVES = {
  slamTell: { mark: '!', answer: 'block', ph: 1 }, lashTell: { mark: '!', answer: 'block', ph: 1 }, leapTell: { mark: '!!', answer: 'dodge', ph: 1 }, reelTell: { mark: '!', answer: 'block', ph: 1 },
  callTell: { mark: '', answer: '', ph: 2 }, throwTell: { mark: '!', answer: 'block', ph: 2 }, volleyTell: { mark: '!', answer: 'block', ph: 2 },
  rollTell: { mark: '!!', answer: 'jump', ph: 3 }, breathTell: { mark: '!', answer: 'block', ph: 3 }, pitTell: { mark: '!', answer: 'block', ph: 3 }, curseTell: { mark: '!!', answer: 'dodge', ph: 3 },
};
export const ATTACKS = Object.keys(MOVES).map(k => k.replace(/Tell$/, ''));
export const MOVE_NAME = { slam: 'THE LID SLAM', shock: 'THE SHOCK LINE', lash: 'THE BANDAGE LASH', leap: 'THE COFFIN LEAP', chain: 'THE CHAIN', crush: 'THE CHAIN REEL', lid: 'THE THROWN LID',
  jar: 'A CANOPIC JAR', cloud: 'THE CANOPIC POISON', roll: 'THE TOMB ROLL', breath: 'THE SAND BREATH', pit: 'THE SAND PIT', curse: 'THE CURSE', weight: 'THE COUNTERWEIGHT' };
export const OPEN_NAME = { block: 'CRUSHED OVER', darts: 'DARTED OVER', weight: 'TIPPED OVER', stone: 'FLIPPED' };
/* every line he says (the hint box shows them: src/hint-lines.js spreads TK_SAY) */
export const TK_SAY = {
  wake: 'THE COFFIN KING RISES IN HIS SARCOPHAGUS', rule: 'STRIKE A WALL SWITCH WHEN HE IS IN ITS SWEEP: THE COUNTERWEIGHT TIPS HIM',
  p2: 'THE TRAPS ARM: A PLATE FIRES ON WHATEVER STANDS IN ITS REACH - HIM TOO', p3: 'THE LID CRACKS FOR GOOD: THE SWITCHES RESET TWICE AS FAST',
  weight: 'THE COUNTERWEIGHT TIPS HIM OVER - STRIKE', block: 'THE BLOCK KNOCKS HIM FLAT - STRIKE', darts: 'THE DARTS TOPPLE HIM - STRIKE', onPlate: 'HE STANDS ON THE PLATE: IT FIRES ON HIM',
  clamp: 'THE LID CLAMPS BACK ON: WARDED', glance: 'HIS LID IS CLAMPED: IT GLANCES OFF', cap: 'HE HEAVES HIS LID BACK',
  lever: 'THE SWITCH IS THROWN: THE COUNTERWEIGHT SWINGS', leverWait: 'THE COUNTERWEIGHT IS STILL WINDING UP',
  call: 'THE LID CRACKS: THE DEAD ANSWER HIS CALL', cut: 'YOU CUT THE CHAIN', reeled: 'THE CHAIN HAS YOU: STRIKE IT', trip: 'HE ROLLS ONTO THE PLATE', wall: 'HE HITS THE WALL',
  sealed: 'SEALED: TIP HIM WITH A SWITCH', sealed2: 'SEALED', lidless: 'HIS ARMS GUARD HIM',
};

/* ---------- THE BURIAL CHAMBER (src/sealed-pyramid-tombs.js BOSS_SLOT: the arena = { ..., tk: BOSS_SLOT }) in world px ---------- */
export function geom(A, TS = 16) {
  const q = A.tk, X = c => c * TS;
  return { TS, x0: X(q.x0), x1: X(q.x1 + 1), floorY: q.floor * TS, roofY: q.roof * TS,
    ledges: q.ledges.map((l, i) => ({ side: i ? 1 : -1, x0: X(l.x0), x1: X(l.x1 + 1), y: l.y * TS })),
    levers: q.switches.map((s, i) => ({ side: i ? 1 : -1, x: X(s.x) + 8, y0: X(s.y), y1: X(s.y + 3), sweep: [X(s.sweep[0]), X(s.sweep[1] + 1)], anchor: X(s.anchor) + 8 })),
    plates: q.plates.map(([a, b], i) => ({ id: q.plateTraps[i][0], traps: q.plateTraps[i], x0: X(a), x1: X(b + 1), reach: q.plateReach[i].map(([r0, r1]) => [X(r0), X(r1 + 1)]) })),
    alcoves: q.alcoves.map(c => X(c) + 8), start: X(q.king) + 8 };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, act: 0, ward: 0, openTaken: 0, clamp: 0, last: null, gapT: 0, told: {}, mark: null,
    levers: G.levers.map(l => ({ side: l.side, st: 'ready', t: 0, ang: 0, key: '' })), dwell: { plat: null, t: 0, x: 0 }, leapCdT: 2.0, callCdT: 4.0, curseCdT: 0,
    leap: null, shock: null, chain: null, reel: null, lid: null, jars: [], clouds: [], pits: [], curses: [], roll: null, breath: null, slamAt: null, dead: [],
    n: { opens: 0, byKind: { block: 0, darts: 0, weight: 0 }, glanced: 0, wards: 0, warded: 0, sealed: 0, levers: 0, leverHits: 0, onPlate: 0, trips: 0, called: 0, cuts: 0, reels: 0, moves: {}, capped: 0 } };
}
export const tPhase = e => (e.hp <= e.maxHp * TK.p3 ? 3 : e.hp <= e.maxHp * TK.p2 ? 2 : 1);
export const tkOpen = e => !!e && e.mode === 'flipped' && (e.open || 0) > 0;
export const tkLidless = e => !!e && (e.mode === 'lidless' || e.mode === 'throw');
/* he PRESSES a plate (heavy stone) whenever he is not walking or in the air: he steps over them as he walks (src/sealed-pyramid-hands.js pressedBy asks this) */
export const tkPresses = e => !!e && e.alive && !['walk', 'leap', 'sleep', 'wake', 'flipped', 'clamp', 'die', 'drop'].includes(e.mode);
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x, pad = 20) => Math.max(G.x0 + pad, Math.min(G.x1 - pad, x));
/* which platform a hero stands on: 'W' / 'E' (the side ledges), 'F' the floor, null in the air */
export function platOf(G, h) { if (!h || !h.ground) return null; if (Math.abs(h.y - G.floorY) < 6) return 'F';
  for (const l of G.ledges) if (Math.abs(h.y - l.y) < 6 && h.x > l.x0 - 6 && h.x < l.x1 + 6) return l.side < 0 ? 'W' : 'E'; return null; }
const ledgeOf = (G, p) => G.ledges.find(l => (l.side < 0 ? 'W' : 'E') === p);
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }

/* ---------- THE RULE ON HIM: a counterweight's sweep or one of the chamber's traps lands on him ('open' | 'ward' | 'busy') ---------- */
export function flip(e, S, c, kind) {
  if (!e || !e.alive || ['sleep', 'wake', 'die', 'leap', 'perch', 'drop'].includes(e.mode)) return 'busy';
  if (tkOpen(e) || e.mode === 'clamp') return 'busy';
  if (S.ward > 0) { S.n.glanced++; c.number(e.x, e.y - 64, TK_SAY.glance, '#9aa39a'); return 'ward'; }
  if (S.lid) S.lid.home = true;   /* (his thrown lid comes home on its own: it lands on him as he lies) */
  S.roll = null; S.chain = null; S.reel = null; S.breath = null; S.mark = null; e.y = S.G.floorY;
  S.n.opens++; S.n.byKind[kind] = (S.n.byKind[kind] || 0) + 1;
  setMode(e, 'flipped', TK.openT + 0.05); e.open = TK.openT; e.openKind = kind; S.openTaken = 0;
  c.fx('open', e.x, e.y); c.sound('open'); c.shake(5);
  c.number(e.x, e.y - 64, kind === 'weight' ? TK_SAY.weight : kind === 'block' ? TK_SAY.block : TK_SAY.darts, '#8fd160');
  return 'open';
}
function endOpen(e, S, c) { e.open = 0; e.openKind = null; S.openTaken = 0; setMode(e, 'clamp', TK.clampT); c.sound('clamp'); }
function startWard(e, S, c) { S.ward = TK.wardT; S.n.wards++; c.number(e.x, e.y - 64, TK_SAY.clamp, '#c8d8e8'); c.fx('ward', e.x, e.y); }

/* ---------- THE SWITCHES (a hero's blow on a lever: the hands call this) ---------- */
export function strikeLever(S, c, side) {
  const L = S.levers.find(l => l.side === side); if (!L) return false;
  if (L.st !== 'ready') { if (L.st === 'reset') c.number(S.G.levers.find(l => l.side === side).x, S.G.levers[0].y0 - 8, TK_SAY.leverWait, '#9aa39a'); return false; }
  L.st = 'pulled'; L.t = TK.lever.delay; L.key = 'weight' + (++S.n.levers); c.sound('lever'); c.number(S.G.levers.find(l => l.side === side).x, S.G.levers[0].y0 - 8, TK_SAY.lever, '#ffd36b'); return true;
}
function stepLevers(e, S, dt, c) {
  for (const L of S.levers) { const g = S.G.levers.find(l => l.side === L.side);
    if (L.st === 'pulled') { L.t -= dt; L.ang = Math.min(1, L.ang + dt * 3); if (L.t <= 0) { L.st = 'swing'; L.t = TK.lever.swing; c.sound('swing'); } continue; }
    if (L.st === 'swing') { L.t -= dt; const k = 1 - Math.max(0, L.t) / TK.lever.swing, a = g.side < 0 ? g.sweep[0] : g.sweep[1], b = g.side < 0 ? g.sweep[1] : g.sweep[0], x = a + (b - a) * k;
      L.x = x; const box = [Math.min(x, a) - 4, Math.max(x, a) + 4, S.G.floorY - TK.lever.h, S.G.floorY];
      c.hit([x - 14, x + 14, S.G.floorY - TK.lever.h, S.G.floorY], TK.dmg.weight, MOVE_NAME.weight, { key: L.key });
      if (e && e.alive && e.x + TK.w / 2 > box[0] && e.x - TK.w / 2 < box[1] && !L.done) { if (Math.abs(e.x - x) < TK.w / 2 + 16 && e.y > S.G.floorY - 20) { L.done = true; S.n.leverHits++; flip(e, S, c, 'weight'); } }
      if (L.t <= 0) { L.st = 'reset'; L.t = TK.lever.reset[S.ph - 1]; L.done = false; L.x = null; c.shake(3); c.sound('thud'); } continue; }
    if (L.st === 'reset') { L.t -= dt; L.ang = Math.max(0, L.ang - dt / Math.max(0.5, TK.lever.reset[S.ph - 1])); if (L.t <= 0) { L.st = 'ready'; L.ang = 0; c.sound('ratchet'); } } }
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, pp, atk }], c = the world:
   c.hit(box, dmg, name, o) -> [{pp, res}]  c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)  c.traps(on)  c.call(n, xs)
   c.deadAlive() -> n  c.haul(pp, dx)  c.cutting(pp) -> bool  c.blind(pp, t)  c.slow(pp, t)  c.time()  c.rng() ---------- */
export function stepTombKing(e, S, dt, h, c) {
  const G = S.G, alive = h.filter(q => q.alive), P = alive.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  S.leapCdT -= dt; S.callCdT -= dt; S.curseCdT -= dt;
  stepLevers(e, S, dt, c); stepShock(S, dt, c); stepLid(e, S, dt, c); stepJars(S, dt, c); stepClouds(S, dt, c); stepPits(S, dt, c); stepCurses(S, dt, c); stepReel(e, S, dt, h, c);
  /* WHERE YOU STAND, and for how long (the leap's question) */
  { const pl = platOf(G, P); if (pl) { if (pl !== S.dwell.plat || (pl === 'F' && Math.abs(P.x - S.dwell.x) > 56)) S.dwell = { plat: pl, t: 0, x: P.x }; else S.dwell.t += dt; } }
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { setMode(e, 'walk', TK.firstGap); } return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts a window short */
  const want = tPhase(e);
  if (want > S.ph && !tkOpen(e) && e.mode !== 'clamp' && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; e.phase = want; c.music(want); c.shake(5); c.sound('rumble');
    if (want === 2) { c.traps(true); c.number((G.x0 + G.x1) / 2, G.floorY - 150, TK_SAY.p2, '#ff9a5c'); }
    if (want === 3) { c.number((G.x0 + G.x1) / 2, G.floorY - 150, TK_SAY.p3, '#ff6b6b'); for (const L of S.levers) if (L.st === 'reset') L.t = Math.min(L.t, TK.lever.reset[2]); }
    setMode(e, 'recover', 1.0); return; }
  switch (e.mode) {
    case 'flipped': if (e.open <= 0) endOpen(e, S, c); return;   /* B4: he lies where it tipped him */
    case 'clamp': if (e.modeT <= 0) { startWard(e, S, c); setMode(e, 'recover', 0.6); } return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c, h); return;
    case 'walk': {
      const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face; e.y = G.floorY;
      const v = S.ph >= 3 ? TK.walk3 : TK.walk; if (ad > TK.keep) e.x = clampX(G, e.x + Math.sign(d) * v * dt);
      if (e.modeT <= 0) nextMove(e, S, P, c, h); return; }
  }
  stepMove(e, S, dt, P, c, h);
}
/* HE PICKS BY WHERE YOU STAND (never a fixed rotation): the moves his phase has, weighted by your platform and your distance; never the same twice running */
export function pickMove(e, S, P, rng = Math.random, deadN = 0) {
  const G = S.G, ph = S.ph, pl = platOf(G, P) || (P.y < G.floorY - 20 ? (P.x < (G.x0 + G.x1) / 2 ? 'W' : 'E') : 'F'), ad = Math.abs(P.x - e.x), w = {};
  const has = m => MOVES[m + 'Tell'].ph <= ph;
  if (S.dwell.t >= TK.dwell && S.leapCdT <= 0 && S.dwell.plat) return 'leap';   /* THE ANTI-CROWD MOVE: you have stood there too long */
  if (pl === 'W' || pl === 'E') { w.reel = 3; w.lash = ad < TK.lash.reach + 30 ? 2 : 0; w.volley = 1.5; w.curse = 2; w.call = 1; w.throw = 0.5; }
  else if (ad < 72) { w.slam = 4; w.lash = 1.5; w.breath = 3; w.pit = 1.5; w.curse = 0.5; w.volley = 1; w.call = 0.8; }
  else if (ad < 180) { w.lash = 3; w.reel = 2; w.volley = 2; w.throw = 1.5; w.pit = 2; w.curse = 1.5; w.call = 1.2; w.roll = 1; w.slam = 0.5; }
  else { w.throw = 3; w.reel = 2.5; w.roll = 3; w.volley = 2; w.call = 1.5; w.curse = 1.5; }
  if (deadN > 0 || S.callCdT > 0) w.call = 0;
  if (S.curseCdT > 0) w.curse = 0;
  if (S.lid) w.throw = 0;
  let tot = 0; const list = [];
  for (const [m, v] of Object.entries(w)) { if (!v || !has(m) || m === S.last) continue; list.push([m, v]); tot += v; }
  if (!list.length) return ad < 72 && S.last !== 'slam' ? 'slam' : S.last !== 'lash' ? 'lash' : 'reel';
  let r = rng() * tot; for (const [m, v] of list) { r -= v; if (r <= 0) return m; } return list[list.length - 1][0];
}
function nextMove(e, S, P, c, h) {
  const G = S.G, m = pickMove(e, S, P, c.rng || Math.random, c.deadAlive ? c.deadAlive() : 0), dx = P.x - e.x; e.face = Math.sign(dx) || e.face; S.last = m; e.y = G.floorY;
  switch (m) {
    case 'slam': tell(e, S, c, 'slamTell', TK.slam.tell); return;
    case 'lash': tell(e, S, c, 'lashTell', TK.lash.tell); S.lashY = P.y; return;
    case 'leap': { const pl = S.dwell.plat, L = ledgeOf(G, pl), tx = L ? clampX(G, Math.max(L.x0 + 18, Math.min(L.x1 - 18, P.x))) : clampX(G, P.x, 24), ty = L ? L.y : G.floorY;
      S.leap = { x0: e.x, y0: G.floorY, tx, ty, t: 0, key: 'leap' + (S.act + 1), plat: pl }; S.leapCdT = TK.leapCd + TK.leap.tell; S.dwell.t = 0; tell(e, S, c, 'leapTell', TK.leap.tell); return; }
    case 'reel': tell(e, S, c, 'reelTell', TK.reel.tell); return;
    case 'call': S.callCdT = TK.callCd; tell(e, S, c, 'callTell', TK.call.tell); c.number(e.x, e.y - 70, TK_SAY.call, '#ff9a5c'); return;
    case 'throw': tell(e, S, c, 'throwTell', TK.thrw.tell); return;
    case 'volley': { tell(e, S, c, 'volleyTell', TK.volley.tell); const r = c.rng || Math.random, xs = [clampX(G, P.x, 24)];
      for (let k = 1; k < TK.volley.n; k++) { let x = G.x0 + 30 + r() * (G.x1 - G.x0 - 60), tries = 0; while (xs.some(q => Math.abs(q - x) < 44) && tries++ < 8) x = G.x0 + 30 + r() * (G.x1 - G.x0 - 60); xs.push(x); }
      S.jarMarks = xs.map((x, i) => ({ x, y: landY(G, x, P, i === 0) })); return; }
    case 'roll': tell(e, S, c, 'rollTell', TK.roll.tell); return;
    case 'breath': tell(e, S, c, 'breathTell', TK.breath.tell); return;
    case 'pit': tell(e, S, c, 'pitTell', TK.pit.tell); S.pitMark = { x: clampX(G, P.x, 24), y: platOf(G, P) === 'W' || platOf(G, P) === 'E' ? ledgeOf(G, platOf(G, P)).y : G.floorY }; return;
    case 'curse': S.curseCdT = TK.curseCd; tell(e, S, c, 'curseTell', TK.curse.tell); return;
  }
  setMode(e, 'walk', 0.5);
}
/* where a jar comes down: the ledge under it if it is over one and you are up there, else the floor */
function landY(G, x, P, onYou) { if (onYou && P.ground) return P.y; for (const l of G.ledges) if (x > l.x0 && x < l.x1 && P.y < G.floorY - 20) return l.y; return G.floorY; }
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, c, h) {
  const G = S.G, f = e.face || 1, gap = () => setMode(e, 'walk', TK.gap[S.ph - 1]);   /* (the gap between his blows: he walks at you - so he walks into a switch's sweep, or over a plate) */
  switch (e.mode) {
    case 'slamTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const f2 = e.face || 1; setMode(e, 'slam', 0.4); c.sound('slam'); c.shake(5);
        c.hit([f2 > 0 ? e.x : e.x - TK.slam.reach - TK.w / 2, f2 > 0 ? e.x + TK.slam.reach + TK.w / 2 : e.x, G.floorY - 44, G.floorY], TK.dmg.slam, MOVE_NAME.slam, { blockable: true, key: 'slam' + S.act });
        S.shock = { x: e.x + f2 * (TK.slam.reach + TK.w / 2), x0: e.x + f2 * (TK.slam.reach + TK.w / 2), dir: f2, key: 'shock' + S.act }; c.fx('slam', e.x + f2 * 30, G.floorY); } return;
    case 'slam': if (e.modeT <= 0) gap(); return;
    case 'lashTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const f2 = e.face || 1, y = Math.min(G.floorY, (S.lashY ?? G.floorY)); setMode(e, 'lash', 0.3); c.sound('lash');
        const res = c.hit([f2 > 0 ? e.x : e.x - TK.lash.reach - TK.w / 2, f2 > 0 ? e.x + TK.lash.reach + TK.w / 2 : e.x, y - 24, y + 2], TK.dmg.lash, MOVE_NAME.lash, { blockable: true, key: 'lash' + S.act });
        for (const r of res || []) if (r.res === 'hit') c.haul(r.pp, -f2 * TK.lash.pull); S.lashAt = { x0: e.x, x1: e.x + f2 * (TK.lash.reach + TK.w / 2), y, t: 0.3 }; } return;
    case 'lash': if (e.modeT <= 0) { S.lashAt = null; gap(); } return;
    case 'leapTell': if (e.modeT <= 0) { setMode(e, 'leap', TK.leap.air); c.sound('roar'); } return;
    case 'leap': { const q = S.leap; if (!q) { gap(); return; } q.t += dt; const k = Math.min(1, q.t / TK.leap.air); e.x = q.x0 + (q.tx - q.x0) * k; e.y = q.y0 + (q.ty - q.y0) * k - Math.sin(k * Math.PI) * 90; e.face = Math.sign(q.tx - q.x0) || e.face;
      if (k >= 1) { e.x = q.tx; e.y = q.ty; c.shake(7); c.sound('thud'); c.fx('land', e.x, e.y);
        c.hit([e.x - TK.leap.r, e.x + TK.leap.r, e.y - 48, e.y + 2], TK.dmg.leap, MOVE_NAME.leap, { key: q.key });
        if (q.ty < G.floorY - 4) setMode(e, 'perch', TK.leap.perch); else { S.leap = null; gap(); } } return; }
    case 'perch': if (e.modeT <= 0) { const q = S.leap; setMode(e, 'drop', TK.leap.drop); S.drop = { x0: e.x, y0: e.y, tx: clampX(G, e.x + (e.x < (G.x0 + G.x1) / 2 ? 1 : -1) * 64, 30), t: 0 }; S.leap = null; } return;
    case 'drop': { const q = S.drop; q.t += dt; const k = Math.min(1, q.t / TK.leap.drop); e.x = q.x0 + (q.tx - q.x0) * k; e.y = q.y0 + (G.floorY - q.y0) * k * k; if (k >= 1) { e.y = G.floorY; S.drop = null; c.shake(3); gap(); } return; }
    case 'reelTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { setMode(e, 'reel', 1.6); c.sound('chain');
        S.chain = { x: e.x, y: e.y - 26, tx: P.x, ty: P.y - 10, dir: e.face || 1, out: true, key: 'chain' + S.act, len: 0 }; S.n.reels++; } return;
    case 'reel': if (!S.chain && !S.reel) { gap(); return; } if (e.modeT <= 0) { S.chain = null; S.reel = null; gap(); } return;
    case 'callTell': if (e.modeT <= 0) { setMode(e, 'call', 0.5); const n = Math.min(TK.call.n[S.ph - 1], TK.call.max - (c.deadAlive ? c.deadAlive() : 0));
        const xs = G.alcoves.slice().sort((a, b) => Math.abs(b - P.x) - Math.abs(a - P.x)).slice(0, Math.max(0, n));   /* (the alcoves farthest from you: they walk the room to you, over the plates) */
        if (n > 0) { c.call(n, xs); S.n.called += n; } c.sound('rumble'); } return;
    case 'call': if (e.modeT <= 0) gap(); return;
    case 'throwTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const f2 = e.face || 1; setMode(e, 'throw', 0.35); c.sound('throw');
        S.lid = { x: e.x + f2 * 20, dir: f2, out: true, passes: 0, key: 'lid' + S.act, spin: 0, home: false }; } return;
    case 'throw': if (e.modeT <= 0) setMode(e, 'lidless', 8); return;
    case 'lidless': e.face = S.lid ? (Math.sign(S.lid.x - e.x) || e.face) : e.face; if (!S.lid || e.modeT <= 0) { S.lid = null; setMode(e, 'catch', TK.thrw.catchT); c.sound('clamp'); } return;
    case 'catch': if (e.modeT <= 0) gap(); return;
    case 'volleyTell': if (e.modeT <= 0) { setMode(e, 'volley', 0.4); c.sound('throw'); const f2 = e.face || 1;
        S.jars = (S.jarMarks || []).map((m, i) => ({ x0: e.x + f2 * 10, y0: e.y - 40, x: e.x, y: e.y - 40, tx: m.x, ty: m.y, t: -i * 0.08, key: 'jar' + S.act + '.' + i })); S.jarMarks = null; } return;
    case 'volley': if (e.modeT <= 0) gap(); return;
    case 'rollTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const f2 = e.face || 1; setMode(e, 'roll', 4); c.sound('roll'); S.roll = { dir: f2, key: 'roll' + S.act }; } return;
    case 'roll': { const q = S.roll; if (!q) { gap(); return; } const nx = e.x + q.dir * TK.roll.v * dt, wall = q.dir > 0 ? G.x1 - 22 : G.x0 + 22;
      c.hit([e.x - TK.w / 2 - 4, e.x + TK.w / 2 + 4, G.floorY - TK.roll.h, G.floorY], TK.dmg.roll, MOVE_NAME.roll, { key: q.key });
      if ((wall - nx) * q.dir <= 0) { e.x = wall; S.roll = null; setMode(e, 'rollEnd', 0.8); c.shake(4); c.sound('thud'); c.number(e.x, e.y - 64, TK_SAY.wall, '#e8d0a0'); return; }
      e.x = nx; return; }
    case 'rollEnd': if (e.modeT <= 0) gap(); return;
    case 'breathTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { setMode(e, 'breath', TK.breath.t); c.sound('breath'); S.breath = { dir: e.face || 1, key: 'breath' + S.act, x: e.x }; } return;
    case 'breath': { const q = S.breath; if (q) { const x0 = e.x + q.dir * 12, x1 = e.x + q.dir * (12 + TK.breath.len);
        const res = c.hit([Math.min(x0, x1), Math.max(x0, x1), G.floorY - 60, G.floorY], TK.dmg.breath, MOVE_NAME.breath, { blockable: true, key: q.key, noKnock: true });
        for (const r of res || []) if (r.res === 'hit') { c.blind(r.pp, TK.breath.blind); c.slow(r.pp, TK.breath.slow); } }
      if (e.modeT <= 0) { S.breath = null; gap(); } return; }
    case 'pitTell': if (e.modeT <= 0) { setMode(e, 'pit', 0.4); c.sound('slam'); c.shake(4); const m = S.pitMark || { x: P.x, y: G.floorY };
        c.hit([m.x - TK.pit.r, m.x + TK.pit.r, m.y - 30, m.y + 2], TK.dmg.pit, MOVE_NAME.pit, { blockable: true, key: 'pit' + S.act });
        S.pits.push({ x: m.x, y: m.y, t: TK.pit.sandT }); S.pitMark = null; c.fx('pit', m.x, m.y); } return;
    case 'pit': if (e.modeT <= 0) gap(); return;
    case 'curseTell': if (e.modeT <= 0) { setMode(e, 'curse', 0.4); c.sound('curse'); const y = P.ground ? P.y : G.floorY;
        S.curses.push({ x: clampX(G, P.x, 16), y, t: TK.curse.delay, key: 'curse' + S.act }); } return;
    case 'curse': if (e.modeT <= 0) setMode(e, 'recover', Math.max(TK.gap[S.ph - 1], TK.curse.delay + 0.2)); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* the slam's SHOCK LINE: it runs the floor away from him (low: jump it) */
function stepShock(S, dt, c) { const q = S.shock; if (!q) return; const nx = q.x + q.dir * TK.slam.shockV * dt;
  c.hit([Math.min(q.x, nx) - 6, Math.max(q.x, nx) + 6, S.G.floorY - TK.slam.shockH, S.G.floorY + 2], TK.dmg.shock, MOVE_NAME.shock, { blockable: true, key: q.key, noKnock: true });
  q.x = nx; if (Math.abs(q.x - q.x0) > TK.slam.shockLen || q.x < S.G.x0 + 8 || q.x > S.G.x1 - 8) S.shock = null; }
/* the CHAIN REEL: the chain flies at its mark; a hero it catches (not on a shield) is hauled in until he cuts it with a blow or is crushed against the lid */
function stepReel(e, S, dt, h, c) {
  const q = S.chain; if (q && q.out) { const dx = q.tx - q.x, dy = q.ty - q.y, d = Math.hypot(dx, dy), st = TK.reel.v * dt;
    if (d <= st || q.len > TK.reel.range) { q.x = q.tx; q.y = q.ty; q.out = false;
      const res = c.hit([q.x - 10, q.x + 10, q.y - 14, q.y + 14], TK.dmg.chain, MOVE_NAME.chain, { blockable: true, key: q.key, noKnock: true }) || [];
      const got = res.find(r => r.res === 'hit'); if (got) { S.reel = { pp: got.pp, t: TK.reel.haulT, key: q.key + 'c' }; c.number(got.pp.x, got.pp.y - 40, TK_SAY.reeled, '#ff9a5c'); } else S.chain = null; }
    else { q.x += dx / d * st; q.y += dy / d * st; q.len += st; } }
  const r = S.reel; if (!r || !e) return; r.t -= dt; const pp = r.pp, side = Math.sign(pp.x - e.x) || 1;
  if (S.chain) { S.chain.x = pp.x; S.chain.y = pp.y - 10; }
  if (c.cutting(pp)) { S.reel = null; S.chain = null; S.n.cuts++; c.number(pp.x, pp.y - 40, TK_SAY.cut, '#8fd160'); c.sound('cut'); return; }
  if (Math.abs(pp.x - e.x) <= TK.reel.crushR + TK.w / 2) { c.hit([e.x - 40, e.x + 40, e.y - 50, e.y + 4], TK.dmg.crush, MOVE_NAME.crush, { key: r.key }); S.reel = null; S.chain = null; return; }
  c.haul(pp, -side * TK.reel.haul * dt);
  if (r.t <= 0) { S.reel = null; S.chain = null; }
}
/* THE THROWN LID: a spinning disc along the floor to the far wall and back (answered twice); it presses the plates it rolls over (the hands read S.lid) */
function stepLid(e, S, dt, c) { const q = S.lid; if (!q) return; q.spin += dt * 20;
  if (q.home && e) { q.x += Math.sign(e.x - q.x) * TK.thrw.v * 1.4 * dt; if (Math.abs(q.x - e.x) < 12) S.lid = null; return; }
  q.x += q.dir * TK.thrw.v * dt;
  c.hit([q.x - TK.thrw.r, q.x + TK.thrw.r, S.G.floorY - 2 * TK.thrw.r, S.G.floorY], TK.dmg.lid, MOVE_NAME.lid, { blockable: true, key: q.key + '.' + q.passes, noKnock: false });
  const wall = q.dir > 0 ? S.G.x1 - 12 : S.G.x0 + 12;
  if ((wall - q.x) * q.dir <= 0) { q.x = wall; q.dir = -q.dir; q.passes++; c.sound('thud'); }
  if (q.passes >= 1 && e && Math.abs(q.x - e.x) < 14) S.lid = null; }
/* THE CANOPIC JARS: an arc to each told mark, then a small poison cloud */
function stepJars(S, dt, c) { for (const j of S.jars) { j.t += dt; if (j.t < 0) continue; const k = Math.min(1, j.t / TK.volley.fly); j.x = j.x0 + (j.tx - j.x0) * k; j.y = j.y0 + (j.ty - j.y0) * k - Math.sin(k * Math.PI) * 70;
    if (k >= 1 && !j.done) { j.done = true; c.hit([j.tx - TK.volley.r, j.tx + TK.volley.r, j.ty - 24, j.ty + 2], TK.dmg.jar, MOVE_NAME.jar, { blockable: true, key: j.key }); S.clouds.push({ x: j.tx, y: j.ty, t: TK.volley.cloudT, tick: TK.volley.tick, key: j.key }); c.fx('jar', j.tx, j.ty); } }
  S.jars = S.jars.filter(j => !j.done); }
function stepClouds(S, dt, c) { for (const q of S.clouds) { q.t -= dt; q.tick -= dt; if (q.tick <= 0) { q.tick = TK.volley.tick;
    c.hit([q.x - TK.volley.cloudR, q.x + TK.volley.cloudR, q.y - 26, q.y + 2], TK.dmg.cloud, MOVE_NAME.cloud, { key: q.key + 'c' + Math.round(q.t * 4), noKnock: true, venom: true }); } }
  S.clouds = S.clouds.filter(q => q.t > 0); }
/* THE SAND PIT's sinkhole: it lingers a while as sucking sand (slows, no blow) */
function stepPits(S, dt, c) { for (const p of S.pits) { p.t -= dt; c.slowIn && c.slowIn(p.x - TK.pit.r, p.x + TK.pit.r, p.y); } S.pits = S.pits.filter(p => p.t > 0); }
/* THE CURSE's column of sand */
function stepCurses(S, dt, c) { for (const q of S.curses) { q.t -= dt; if (q.t <= 0 && !q.done) { q.done = true; c.hit([q.x - TK.curse.r, q.x + TK.curse.r, S.G.roofY, q.y + 2], TK.dmg.curse, MOVE_NAME.curse, { key: q.key }); c.fx('curse', q.x, q.y); c.shake(4); } }
  S.curses = S.curses.filter(q => !q.done || q.t > -0.35); }

/* ---------- A BLOW ON HIM (B15): flipped x TK.openMul (one window TK.openCap of him at most, counted on what LANDS), clamping or warded x TK.wardMul, lid
   off (the lid thrown) x TK.lidless, closed x TK.resist (x TK.resist3 in phase three, the lid cracked). Returns [dmg, word] ---------- */
export function takeBlow(e, S, dmg) {
  if (e.mode === 'sleep' || e.mode === 'wake') return [0, null];
  if (tkOpen(e)) { const cap = e.maxHp * TK.openCap, left = Math.max(0, cap - S.openTaken); if (left <= 0) return [0, TK_SAY.cap];   /* (the purse spent: he heaves his lid back - told, a clank and the word - the window closes in TK's 0.3 s) */
    const d = Math.min(dmg * TK.openMul, left); S.openTaken += d;
    if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; S.n.capped++; return [d, TK_SAY.cap]; } return [d, null]; }
  if (S.ward > 0 || e.mode === 'clamp') { S.n.warded++; return [dmg * TK.wardMul, 'WARDED']; }
  if (tkLidless(e)) return [dmg * TK.lidless, TK_SAY.lidless];
  S.n.sealed++; return [dmg * (S.ph >= 3 ? TK.resist3 : TK.resist), S.n.sealed < 6 ? TK_SAY.sealed : TK_SAY.sealed2];
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees his tells a reaction late (the v2 profile's eyes do that: s.v2) and misreads some; it blocks the yellows on a shield (or steps out of their
   reach), jumps the roll, the shock line and the lid, steps off the curse's mark, the jars' marks, the pit and the clouds, gets off the platform his leap is coming
   for, cuts the chain that has it - and works THE RULE: it waits on the side ledge of the half he is in and strikes the switch when he walks into its sweep; from
   phase two it treads a plate whose reach he is in (never the one whose reach it stands in). Open, it strikes him; warded, it keeps off.
   s = { P: { x, y, vy, face, ground, atk }, e, S, levers: [{side, ready}], plates: [{id, ready}], reach, shield, t, rng, mem, v2, hero, reeled, dead: [{x,y}] }
   -> { gx, face, atk, jump, dodge, block, down, up, why } */
export const PLAN = { react: 0.25, miss: 0.12, missLever: 0.15, leverWait: 6 };
export function tkPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, up: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hitR = reach + TK.w / 2 - 2, pl = platOf(G, P), onLedge = pl === 'W' || pl === 'E', onFloor = pl === 'F';
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* the ground's hazards (x, half-width), only the ones on the floor you stand on */
  const fy = onLedge ? ledgeOf(G, pl).y : G.floorY, same = y => Math.abs(y - fy) < 8;
  const hazards = [...S.clouds.filter(q => same(q.y)).map(q => [q.x, TK.volley.cloudR + 8]), ...S.curses.filter(q => !q.done && same(q.y)).map(q => [q.x, TK.curse.r + 14]), ...S.pits.filter(q => same(q.y)).map(q => [q.x, TK.pit.r + 4]),
    ...((S.jarMarks || []).concat(S.jars.map(j => ({ x: j.tx, y: j.ty }))).filter(q => same(q.y)).map(q => [q.x, TK.volley.r + 14])), ...(S.pitMark && same(S.pitMark.y) && e.mode === 'pitTell' ? [[S.pitMark.x, TK.pit.r + 14]] : [])];
  const inHaz = x => hazards.some(([hx, r]) => Math.abs(x - hx) < r);
  const safeX = x => { let q = clamp(x); for (let k = 0; k < 3; k++) for (const [hx, r] of hazards) if (Math.abs(q - hx) < r) q = clamp(q < hx ? hx - r - 4 : hx + r + 4); if (onLedge) { const L = ledgeOf(G, pl); q = Math.max(L.x0 + 4, Math.min(L.x1 - 4, q)); } return q; };
  const offLedge = () => { const L = ledgeOf(G, pl); return L.side < 0 ? L.x1 + 18 : L.x0 - 18; };
  /* 0. CLIMBING: a jump for a ledge is carried through (in the air there is no platform to read) */
  if (!P.ground && mem.climbT !== undefined && t - mem.climbT < 0.9) { out.gx = mem.climbX; out.why = 'climbing'; return out; }
  /* 0b. THE CHAIN HAS YOU: cut it */
  if (s.reeled) { out.face = Math.sign(kx - P.x) || 1; out.atk = P.atk < 0; out.why = 'cut the chain'; return out; }
  /* 1. OUT OF A CLOUD, A MARK, THE PIT */
  if (inHaz(P.x) && P.ground) { const [hx, r] = hazards.find(([x0, r0]) => Math.abs(P.x - x0) < r0); let gx = P.x + (P.x < hx ? -r - 8 : r + 8);
    if (onLedge && (gx < ledgeOf(G, pl).x0 || gx > ledgeOf(G, pl).x1)) gx = offLedge(); out.gx = onLedge ? gx : safeX(gx); out.why = 'out of it'; return out; }
  /* 2. HIS TELLS (a quarter-second late, some misread) */
  const lid = S.lid, telling = /Tell$/.test(e.mode) || ['leap', 'roll', 'slam', 'lash', 'breath'].includes(e.mode) || !!lid || !!S.shock || (S.chain && S.chain.out);
  if (telling) {
    const key = 'a' + S.act + e.mode, miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor(key);
    if (seen && !miss) {
      if (e.mode === 'leapTell' || e.mode === 'leap') { const q = S.leap; if (q && q.plat === pl && (pl !== 'F' || Math.abs(P.x - q.tx) < TK.leap.r + 26)) {
          if (onLedge) { out.gx = offLedge(); out.why = 'off the ledge: his leap'; return out; } out.gx = safeX(q.tx + (P.x < q.tx ? -1 : 1) * (TK.leap.r + 40)); if (e.mode === 'leap' && Math.abs(P.x - q.tx) < TK.leap.r + 8 && !s.noRoll) out.dodge = true; out.why = 'out from under his leap'; return out; } }
      if (e.mode === 'roll' && S.roll && onFloor) { const toward = (P.x - kx) * S.roll.dir > 0, gap = Math.abs(P.x - kx);
        if (toward && gap < 62 && P.ground) { out.jump = true; out.gx = P.x + S.roll.dir * 20; out.why = 'jump the roll'; return out; } out.gx = P.x; out.why = 'ready to jump the roll'; return out; }
      if (e.mode === 'rollTell' && onFloor) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'his roll is coming'; return out; }
      if (lid && onFloor) { const toward = (P.x - lid.x) * (lid.home && e ? Math.sign(e.x - lid.x) : lid.dir) > 0, gap = Math.abs(P.x - lid.x);
        if (toward && gap < 40) { if (s.shield && !roll(lid.key + lid.passes + 'j', 0.5)) { out.block = true; out.face = Math.sign(lid.x - P.x) || 1; out.why = 'block the lid'; return out; } if (P.ground) { out.jump = true; out.gx = P.x; out.why = 'jump the lid'; return out; } } }
      if (S.shock && onFloor) { const toward = (P.x - S.shock.x) * S.shock.dir > 0, gap = Math.abs(P.x - S.shock.x); if (toward && gap < 36) { if (s.shield) { out.block = true; out.face = Math.sign(S.shock.x - P.x) || 1; out.why = 'block the shock line'; return out; } if (P.ground) { out.jump = true; out.gx = P.x; out.why = 'jump the shock line'; return out; } } }
      if ((e.mode === 'slamTell' || e.mode === 'slam') && dx < TK.slam.reach + TK.w / 2 + 16) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the slam'; return out; }
        out.gx = safeX(kx + side * (TK.slam.reach + TK.w / 2 + 34)); if (dx < 46 && e.modeT < 0.2 && !s.noRoll) out.dodge = true; out.why = 'back off the slam'; return out; }
      if ((e.mode === 'lashTell' || e.mode === 'lash') && dx < TK.lash.reach + TK.w / 2 + 12 && Math.abs((S.lashY ?? G.floorY) - P.y) < 30) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the lash'; return out; }
        if (onLedge) { out.jump = P.ground; out.gx = P.x; out.why = 'jump the lash'; return out; } out.gx = safeX(kx + side * (TK.lash.reach + TK.w / 2 + 24)); if (e.modeT < 0.25 && !s.noRoll) out.dodge = true; out.why = 'out of the lash'; return out; }
      if (e.mode === 'reelTell' || (S.chain && S.chain.out)) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the chain'; return out; } if (e.modeT < 0.25 && P.ground && !s.noRoll) { out.dodge = true; out.gx = P.x + side * 30; out.why = 'roll the chain'; return out; } out.gx = P.x; out.why = 'the chain is coming'; return out; }
      if ((e.mode === 'breathTell' || e.mode === 'breath') && dx < TK.breath.len + 30 && (P.x - kx) * (e.face || 1) > 0) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the breath'; return out; }
        out.gx = safeX(kx + side * (TK.breath.len + 40)); out.why = 'out of the breath'; return out; }
      if (e.mode === 'pitTell' && S.pitMark && Math.abs(P.x - S.pitMark.x) < TK.pit.r + 16) { if (s.shield && e.modeT < 0.2) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'brace on the pit'; return out; } out.gx = onLedge ? offLedge() : safeX(S.pitMark.x + (P.x < S.pitMark.x ? -1 : 1) * (TK.pit.r + 24)); out.why = 'off the pit'; return out; }
      if (e.mode === 'volleyTell' || S.jars.length) { const near = (S.jarMarks || S.jars.map(j => ({ x: j.tx, y: j.ty }))).find(m => same(m.y) && Math.abs(m.x - P.x) < TK.volley.r + 14);
        if (near) { if (s.shield && S.jars.length) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the jar'; return out; } out.gx = onLedge ? offLedge() : safeX(near.x + (P.x < near.x ? -1 : 1) * (TK.volley.r + TK.volley.cloudR + 10)); out.why = 'off the jar\'s mark'; return out; } }
      if (e.mode === 'curseTell') { out.gx = onLedge ? P.x : safeX(P.x + (P.x < (G.x0 + G.x1) / 2 ? 50 : -50)); out.why = 'the curse: keep moving'; return out; }
    }
  }
  /* 3. FLIPPED: strike him; WARDED: off him */
  if (tkOpen(e)) { if (onLedge && P.ground) { out.gx = offLedge(); out.why = 'down to strike him'; return out; } out.gx = safeX(kx + side * (s.tip ? 30 : 12 + TK.w / 2)); if (dx < hitR + 4 && Math.abs(P.y - e.y) < 30) swing(kx); out.why = 'strike him: he is ' + (OPEN_NAME[e.openKind] || 'open').toLowerCase(); return out; }
  if (S.ward > 0 || e.mode === 'clamp') { out.gx = safeX(onLedge ? P.x : kx + side * 90); out.why = 'his ward: wait'; return out; }
  /* 4. THE DEAD at its feet: cut them down (they press the plates, and they bite) */
  const dd = (s.dead || []).filter(q => Math.abs(q.y - P.y) < 24).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (dd && Math.abs(dd.x - P.x) < reach + 14 && !(e.mode === 'roll' && dx < 120)) { swing(dd.x); out.gx = P.x; out.why = 'cut down the dead'; return out; }
  if (s.rest) { out.gx = safeX(onLedge ? P.x : kx + side * 120); out.why = 'winded: off him'; return out; }
  /* 5. THE RULE (phase two on): tread a ready plate whose trap's reach he stands in - never one whose reach you stand in */
  if (S.ph >= 2 && onFloor && e.mode !== 'leap' && e.mode !== 'roll') for (const p of (s.plates || [])) { if (!p.ready) continue; const g = G.plates.find(q => q.id === p.id); if (!g) continue;
    const him = g.reach.some(([a, b]) => kx + TK.w / 2 > a && kx - TK.w / 2 < b), still = /Tell$/.test(e.mode) || ['recover', 'lidless', 'catch', 'rollEnd', 'walk'].includes(e.mode);
    const mid = (g.x0 + g.x1) / 2, path = Math.abs(mid - P.x) < 120 && !(Math.abs(kx - mid) < 50);
    if (him && still && path && !roll('pl' + S.act + p.id, PLAN.missLever)) { out.gx = mid; out.face = Math.sign(kx - P.x) || 1; out.why = 'tread the plate: he is in its reach'; return out; } }
  /* 6. THE RULE: the switch on the half he is in - up on its ledge, and strike it as he walks into its sweep */
  const half = kx < (G.x0 + G.x1) / 2 ? -1 : 1, gl = G.levers.find(l => l.side === half), lv = (s.levers || []).find(l => l.side === half), L = G.ledges.find(l => l.side === half);
  if (gl && lv && L) {
    const inSweep = kx > gl.sweep[0] + 8 && kx < gl.sweep[1] - 8, onIt = pl === (half < 0 ? 'W' : 'E');
    if (lv.ready && onIt) { const atX = half < 0 ? L.x0 + 6 : L.x1 - 6; if (Math.abs(P.x - atX) > 4) { out.gx = atX; out.face = half; out.why = 'to the switch'; return out; }
      out.face = half; if (inSweep && e.mode !== 'leap' && !roll('lv' + S.act + half, PLAN.missLever)) { out.atk = P.atk < 0; out.why = 'strike the switch: he is in its sweep'; return out; } out.why = 'on the switch: wait for him in its sweep'; return out; }
    if (lv.ready && !onIt && onFloor && !(S.dwell.t > TK.dwell - 1 && S.dwell.plat !== 'F')) { const under = half < 0 ? L.x1 - 14 : L.x0 + 14, beneath = P.x > L.x0 + 6 && P.x < L.x1 - 6;   /* (anywhere under the ledge: a jump up through it lands on it) */
      if (!beneath) { out.gx = safeX(under); out.why = 'to the switch\'s ledge'; if (dx < hitR && /recover|walk/.test(e.mode) && Math.abs(P.x - under) < 60) swing(kx); return out; }
      out.jump = P.ground; out.gx = half < 0 ? L.x0 + 10 : L.x1 - 10; if (P.ground) { mem.climbT = t; mem.climbX = out.gx; } out.why = 'up onto the ledge'; return out; }
  }
  /* his lid between the rule's turns is something (B15): cut it while he recovers close by */
  if (onLedge) { if (dx > 90 || S.dwell.t > TK.dwell - 1.2) { out.gx = offLedge(); out.why = 'down off the ledge'; return out; } out.gx = P.x; out.why = 'on the ledge: wait'; return out; }
  if (dx < hitR && /recover|walk|lidless|catch|rollEnd/.test(e.mode)) { swing(kx); out.gx = P.x; out.why = 'cut his lid'; return out; }
  out.gx = safeX(kx + side * Math.max(hitR - 6, 40)); out.face = Math.sign(kx - P.x) || 1; out.why = 'close on him'; return out;
}
