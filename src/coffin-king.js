// src/coffin-king.js - THE COFFIN KING, 'ESCAPE + BREAK THE SEALS' (claude/sealedpyramid3, OPUS greybox, 11-05). The rework of src/tomb-king.js the brief asks for
// (scratch/brief-sealedpyramid3-1014.md item 4 + plan-desert-1105 section 1.10 / section 2: seal 4 = a SAND-POUR, not the falling slab). Behind SP3 (src/sealed-pyramid3.js):
// with the flag off the burial chamber is master's and src/tomb-king.js runs; with it on, the chamber carries CK_SLOT and src/tomb-king-hands.js hands the fight here.
//
// WHAT HE IS: a GIANT SEALED COFFIN with the old king CLAWING TO GET OUT - bandaged hands punch through the lid, a face presses at the cracks, chains and wax seals
//   strain. NOT a man fused with a coffin (art owed: the coffin + the escaping king in all three stages is the art lane's centrepiece; greybox here).
// THE PHASES ARE ESCAPE STAGES (each its own body and its own new move - B5):
//   P1 SEALED   (to CK.p2): the coffin HOPS after you (he chases: no waiting for him), tumbles end over end, slams; his hands burst out to grab.
//               Bound by THE ROPE SEALS (THE OIL burns them) and THE CHAIN SEALS (THE DARTS snap them).
//   P2 HALF OUT (to CK.p3): the lid hangs, his arms are free, the chains WHIP (+1 move). Bound by THE HOURGLASS SEAL (THE SAND-POUR fills its glass) and
//               THE WAX SEALS (THE SLUICE's bore dissolves them).
//   P3 FREE     (to 0): he tears out - a fast, fragile mummy king; the coffin becomes a THROWN weapon (+1 move; the slam becomes his claw LUNGE, the tumble goes
//               with the coffin's weight). No seals left: ANY trap that lands on him DOWNS him.
// THE RULE (B1/B17 - the level's verb, THE TOMB IS A MACHINE): the PLAYER fires the chamber's traps from their plates and AIMS them at where he is - he chases you,
//   so you stand where his walk to you carries him into a trap's line, and tread its plate. Traps are told (the click, the hiss, the brazier tips) and hurt YOU too
//   in their line. A trap whose seal binds him now BREAKS it (told, a stagger); ALL OF A PHASE'S SEALS BROKEN -> THE LID BURSTS = OPEN (B10: gold ring + timer,
//   CK.openT s, x CK.openMul, one window CK.openCap of him), then he DRAGS HIMSELF BACK IN (clamp) and a TOLD CK.wardT s WARD follows (B3); the seals knit again.
//   THE FLIP (the big payoff, phase two): the sand first, then the sluice - the bore breaks the wax, the lid bursts, and the RISING WATER floats the open coffin and
//   tips it onto its back: a long helpless window (CK.flipT s, cap CK.flipCap). The sluice first, then the sand, is a plain burst.
//   THE TWIST: every phase you break him open he gets MORE of himself out - freeing him makes him more dangerous (P2 whips, P3 throws the coffin and runs).
// B15: never a wall - outside his openings a blow takes CK.resist[phase] (>= 0.4); warded x CK.wardMul (0.4). NO falling-pillar opening: nothing drops on him.
// PURE: no DOM, no main.js. The world is a context `c` (src/coffin-king-hands.js binds it). ckPlan is the boss lab's HUMAN bot (src/lab.js via tomb-king.js tkPlan).
export const CK = {
  hp: 5000, w: 44, h: 56, w3: 22, h3: 40, markH: 74,
  openMul: 1.7, openCap: 0.09, openT: 3.6, flipT: 5.4, flipCap: 0.14, downT: 3.0, downCap: 0.08, clampT: 0.7, wardT: 3.0, wardMul: 0.4,
  resist: [0.4, 0.45, 0.6], p2: 0.65, p3: 0.3,
  walk: [62, 72, 104], keep: [44, 44, 30], gap: [1.5, 1.3, 1.0], firstGap: 1.2, stagger: 0.6, escapeT: 1.6,
  dwell: 3.5, leapCd: 7.0, throwCd: 6.5,
  slam: { tell: 0.75, reach: 62, h: 42, t: 0.45 },
  tumble: { tell: 0.9, v: 250, len: 280, h: 28, end: 0.7 },
  grab: { tell: 0.7, reach: 58, h: 70, t: 0.35, hold: 1.5, tick: 0.45, pull: 160 },
  leap: { tell: 0.9, air: 0.7, r: 34, perch: 0.5, drop: 0.35 },
  whip: { tell: 0.65, reach: 170, top: 66, bot: 9, t: 0.4 },   /* (a hero stands 14 px, ducked 8 - src/duck.js: the band clears a crouch on the floor; a ledge it sweeps) */
  lunge: { tell: 0.55, dist: 110, t: 0.3 },
  thrw: { tell: 1.0, fly: 0.7, r: 36, lift: 0.8 },
  dmg: { slam: 40, tumble: 50, grab: 12, squeeze: 9, toss: 18, leap: 60, whip: 30, lunge: 34, coffin: 56 },
};
export const SEALS = { 1: ['rope', 'chain'], 2: ['glass', 'wax'], 3: [] };
export const SEAL_OF = { oil: 'rope', darts: 'chain', gas: 'glass', flood: 'wax' };
export const SEAL_NAME = { rope: 'THE ROPE SEALS', chain: 'THE CHAIN SEALS', glass: 'THE HOURGLASS SEAL', wax: 'THE WAX SEALS' };
export const TRAP_OF = { rope: 'THE OIL', chain: 'THE DARTS', glass: 'THE SAND-POUR', wax: 'THE SLUICE' };
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows), and the phases he has it in */
export const MOVES = {
  slamTell: { mark: '!', answer: 'block', ph: [1, 2] }, tumbleTell: { mark: '!!', answer: 'jump', ph: [1, 2] }, grabTell: { mark: '!', answer: 'block', ph: [1, 2, 3] },
  leapTell: { mark: '!!', answer: 'dodge', ph: [1, 2, 3] }, whipTell: { mark: '!', answer: 'duck', ph: [2, 3] }, lungeTell: { mark: '!', answer: 'block', ph: [3] },
  hurlTell: { mark: '!!', answer: 'dodge', ph: [3] },
};
export const ATTACKS = Object.keys(MOVES).map(k => k.replace(/Tell$/, ''));
export const MOVE_NAME = { slam: 'THE COFFIN SLAM', tumble: 'THE TUMBLE', grab: 'HIS HANDS', squeeze: 'HIS GRIP', toss: 'HIS GRIP', leap: 'THE COFFIN LEAP', whip: 'THE CHAIN WHIP',
  lunge: 'HIS CLAWS', coffin: 'THE THROWN COFFIN' };
export const OPEN_NAME = { burst: 'THE LID BURSTS', flip: 'FLIPPED', downed: 'DOWNED' };
export const CK_SAY = {
  wake: 'THE COFFIN KING CLAWS AT HIS LID', rule: 'HIS SEALS HOLD HIM: FIRE A TRAP ON HIM - THE OIL BURNS THE ROPES, THE DARTS SNAP THE CHAINS',
  p2: 'HE BREAKS HALF OUT: NOW THE HOURGLASS AND THE WAX HOLD HIM - THE SAND-POUR, THEN THE SLUICE', flipHint: 'THE SAND FIRST, THEN THE SLUICE: THE WATER TIPS HIM',
  p3: 'HE TEARS FREE: THE COFFIN IS HIS WEAPON - ANY TRAP ON HIM DOWNS HIM',
  rope: 'THE ROPES BURN THROUGH', chain: 'THE CHAINS SNAP', glass: 'THE HOURGLASS FILLS: ITS SEAL BREAKS', wax: 'THE WAX RUNS OFF HIM',
  left: n => n === 1 ? 'ONE SEAL LEFT' : n + ' SEALS LEFT',
  burst: 'THE LID BURSTS - STRIKE', flip: 'THE WATER TIPS HIM ONTO HIS BACK - STRIKE', downed: { oil: 'HIS LINEN BURNS - STRIKE', darts: 'THE DARTS PIN HIM - STRIKE', gas: 'BURIED TO THE WAIST - STRIKE', flood: 'THE BORE KNOCKS HIM DOWN - STRIKE' },
  spent: 'THAT SEAL IS BROKEN: ', notYet: 'THE SLUICE AND THE SAND ARE NOT YET HIS', bob: 'HE BOBS: THE HOURGLASS STILL HOLDS HIS LID',
  clamp: 'HE DRAGS HIMSELF BACK IN: THE SEALS KNIT', glance: 'HE IS WARDED: IT GLANCES OFF', cap: 'HE HAULS THE LID SHUT',
  held: 'HIS HANDS HAVE YOU: STRIKE TO TEAR FREE', tore: 'YOU TEAR FREE', wall: 'THE COFFIN HITS THE WALL', fetch: 'HE GOES FOR HIS COFFIN',
  sealed: 'SEALED: BREAK HIS SEALS WITH THE TRAPS', sealed2: 'SEALED', free: 'HE IS QUICK: TRAP HIM',
};

/* ---------- THE BURIAL CHAMBER (arena.tk = BOSS_SLOT for the room, arena.ck = CK_SLOT for the seal traps) in world px ---------- */
export function geom(A, TS = 16) {
  const q = A.tk, k = A.ck, X = c => c * TS;
  return { TS, ck: true, x0: X(q.x0), x1: X(q.x1 + 1), floorY: q.floor * TS, roofY: q.roof * TS,
    ledges: q.ledges.map((l, i) => ({ side: i ? 1 : -1, x0: X(l.x0), x1: X(l.x1 + 1), y: l.y * TS })),
    levers: [], alcoves: [],
    plates: k.traps.map(t => ({ id: t.id, traps: [t.id], kind: t.kind, seal: t.seal, ph: t.ph, x0: X(t.plate[0]), x1: X(t.plate[1] + 1), y: t.plate[2] * TS, ledge: t.plate[2] !== q.floor,
      reach: [[X(t.zone[0]), X(t.zone[1] + 1)]], rows: [X(t.zone[2]), X(t.zone[3] + 1)], wait: k.wait[t.id] ? [X(k.wait[t.id][0]) + 8, k.wait[t.id][1] * TS] : null })),
    start: X(q.king) + 8 };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ck: true, ph: 1, act: 0, ward: 0, openTaken: 0, last: null, told: {}, broken: [], levers: [], dead: [], dwell: { plat: null, t: 0, x: 0 }, leapCdT: 2.5, throwCdT: 0,
    leap: null, tumble: null, hold: null, whip: null, lunge: null, coffin: null, throwQ: null, mark: null, flood: 0, flipKey: null,
    n: { opens: 0, byKind: { burst: 0, flip: 0, downed: 0 }, seals: { rope: 0, chain: 0, glass: 0, wax: 0 }, spent: 0, glanced: 0, wards: 0, warded: 0, sealed: 0, capped: 0, holds: 0, tears: 0, moves: {}, bobs: 0 } };
}
export const cPhase = e => (e.hp <= e.maxHp * CK.p3 ? 3 : e.hp <= e.maxHp * CK.p2 ? 2 : 1);
export const ckOpen = e => !!e && (e.mode === 'burst' || e.mode === 'flipped' || e.mode === 'downed') && (e.open || 0) > 0;
export const need = S => SEALS[S.ph].filter(s => !S.broken.includes(s));
const AIR = new Set(['leap', 'perch', 'drop']);
const BUSY = new Set(['sleep', 'wake', 'die', 'escape', 'clamp', 'leap', 'perch', 'drop']);
/* he presses no plate: THE PLAYER fires the traps (src/sealed-pyramid-hands.js asks the hands' pressers: none) */
export const ckPresses = () => false;
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x, pad = 24) => Math.max(G.x0 + pad, Math.min(G.x1 - pad, x));
export function platOf(G, h) { if (!h || !h.ground) return null; if (Math.abs(h.y - G.floorY) < 6) return 'F';
  for (const l of G.ledges) if (Math.abs(h.y - l.y) < 6 && h.x > l.x0 - 6 && h.x < l.x1 + 6) return l.side < 0 ? 'W' : 'E'; return null; }
const ledgeOf = (G, p) => G.ledges.find(l => (l.side < 0 ? 'W' : 'E') === p);
const bodyW = S => (S.ph >= 3 ? CK.w3 : CK.w);
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }
function clearMoves(S) { S.tumble = null; S.whip = null; S.lunge = null; S.throwQ = null; S.mark = null; if (S.hold) S.hold = null; }

/* ---------- THE RULE ON HIM: one of the chamber's seal traps lands on him. kind = the trap's kind (oil/darts/gas/flood) -> 'open' | 'seal' | 'spent' | 'ward' | 'busy' ---------- */
export function trapLands(e, S, c, kind) {
  if (!e || !e.alive || BUSY.has(e.mode) || AIR.has(e.mode)) return 'busy';
  if (ckOpen(e)) return 'busy';
  if (S.ward > 0) { S.n.glanced++; c.number(e.x, e.y - 80, CK_SAY.glance, '#9aa39a'); return 'ward'; }
  if (S.ph >= 3) return open(e, S, c, 'downed', kind);
  const seal = SEAL_OF[kind];
  if (!SEALS[S.ph].includes(seal)) { S.n.spent++; c.number(e.x, e.y - 80, S.ph === 1 ? CK_SAY.notYet : CK_SAY.spent + SEAL_NAME[seal] + ' ARE ASH', '#9aa39a'); stagger(e, S, c, 0.3); return 'spent'; }
  if (S.broken.includes(seal)) { S.n.spent++; c.number(e.x, e.y - 80, CK_SAY.spent + 'NOW ' + need(S).map(s => TRAP_OF[s]).join(' / '), '#9aa39a'); return 'spent'; }
  S.broken.push(seal); S.n.seals[seal]++; c.sound('seal'); c.fx('seal', e.x, e.y); c.shake(3);
  const left = need(S).length;
  if (!left) return open(e, S, c, 'burst', kind);
  c.number(e.x, e.y - 80, CK_SAY[seal] + ': ' + CK_SAY.left(left), '#ffd36b'); stagger(e, S, c, CK.stagger); return 'seal';
}
function stagger(e, S, c, t) { if (e.mode === 'hold') return; clearMoves(S); setMode(e, 'stagger', t); }
function open(e, S, c, kind, trap) {
  clearMoves(S); S.coffin = S.ph >= 3 ? S.coffin : null; e.y = S.G.floorY;
  const t = kind === 'downed' ? CK.downT : kind === 'flip' ? CK.flipT : CK.openT;
  setMode(e, kind === 'flip' ? 'flipped' : kind, t + 0.05); e.open = t; e.openKind = kind; S.openTaken = kind === 'flip' ? S.openTaken : 0;
  S.n.opens++; S.n.byKind[kind] = (S.n.byKind[kind] || 0) + 1;
  c.fx('open', e.x, e.y); c.sound('open'); c.shake(kind === 'flip' ? 7 : 5);
  c.number(e.x, e.y - 84, kind === 'downed' ? CK_SAY.downed[trap] || CK_SAY.downed.oil : CK_SAY[kind], '#8fd160');
  return 'open';
}
/* THE WATER (the hands pass the chamber's flood level every frame): risen past half with the lid BURST -> THE FLIP (once a flood); sealed -> he bobs (told) */
export function water(e, S, c, lvl, key) {
  S.flood = lvl; if (!e || !e.alive || S.ph !== 2 || lvl < 0.5 || S.flipKey === key) return null;
  if (e.mode === 'burst' && e.open > 0) { S.flipKey = key; return open(e, S, c, 'flip'); }
  if (!ckOpen(e) && !BUSY.has(e.mode) && !AIR.has(e.mode) && S.broken.includes('wax')) { S.flipKey = key; S.n.bobs++; c.number(e.x, e.y - 84, CK_SAY.bob, '#9fd0e8'); }
  return null;
}
function endOpen(e, S, c) { e.open = 0; e.openKind = null; S.openTaken = 0; setMode(e, 'clamp', CK.clampT); c.sound('clamp'); }
function startWard(e, S, c) { S.ward = CK.wardT; S.n.wards++; S.broken = []; c.number(e.x, e.y - 80, CK_SAY.clamp, '#c8d8e8'); c.fx('ward', e.x, e.y); }

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, pp, atk }], c = the world:
   c.hit(box, dmg, name, o) -> [{pp, res}]  c.number  c.mark  c.sound  c.fx  c.shake  c.music(ph)  c.traps(ph)  c.haul(pp, dx)  c.cutting(pp)  c.time()  c.rng() ---------- */
export function stepCoffinKing(e, S, dt, h, c) {
  const G = S.G, alive = h.filter(q => q.alive), P = alive.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  S.leapCdT -= dt; S.throwCdT -= dt;
  stepHold(e, S, dt, c); stepThrown(e, S, dt, c);
  { const pl = platOf(G, P); if (pl) { if (pl !== S.dwell.plat || (pl === 'F' && Math.abs(P.x - S.dwell.x) > 56)) S.dwell = { plat: pl, t: 0, x: P.x }; else S.dwell.t += dt; } }
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) setMode(e, 'walk', CK.firstGap); return; }
  /* THE ESCAPE STAGES: a new phase waits for the blow in hand and never cuts a window short */
  const want = cPhase(e);
  if (want > S.ph && !ckOpen(e) && ['walk', 'recover', 'stagger', 'fetch'].includes(e.mode)) {
    S.ph = want; e.phase = want; S.broken = []; clearMoves(S); c.music(want); c.shake(6); c.sound('rumble'); c.traps(want);
    c.number((G.x0 + G.x1) / 2, G.floorY - 160, want === 2 ? CK_SAY.p2 : CK_SAY.p3, want === 2 ? '#ff9a5c' : '#ff6b6b');
    if (want === 3) { S.coffin = { x: e.x, y: G.floorY, held: true }; e.w = CK.w3; e.h = CK.h3; }
    setMode(e, 'escape', CK.escapeT); return; }
  switch (e.mode) {
    case 'burst': case 'downed': if (e.open <= 0) endOpen(e, S, c); return;   /* B4: he lies where it caught him */
    case 'flipped': if (e.open <= 0) endOpen(e, S, c); return;
    case 'clamp': if (e.modeT <= 0) { startWard(e, S, c); setMode(e, 'recover', 0.6); } return;
    case 'escape': if (e.modeT <= 0) { if (S.ph === 2) c.number((G.x0 + G.x1) / 2, G.floorY - 140, CK_SAY.flipHint, '#ffd36b'); setMode(e, 'recover', 0.4); } return;
    case 'stagger': case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'fetch': return stepFetch(e, S, dt, c);
    case 'walk': {
      const d = P.x - e.x, ad = Math.abs(d); e.face = Math.sign(d) || e.face; e.y = G.floorY;
      if (ad > CK.keep[S.ph - 1]) e.x = clampX(G, e.x + Math.sign(d) * CK.walk[S.ph - 1] * dt, bodyW(S) / 2 + 4);
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
  }
  stepMove(e, S, dt, P, c);
}
/* HE PICKS BY WHERE YOU STAND: his phase's moves weighted by your platform and distance; never the same twice running */
export function pickMove(e, S, P, rng = Math.random) {
  const G = S.G, ph = S.ph, pl = platOf(G, P) || (P.y < G.floorY - 20 ? (P.x < (G.x0 + G.x1) / 2 ? 'W' : 'E') : 'F'), ad = Math.abs(P.x - e.x), w = {};
  const has = m => MOVES[m + 'Tell'].ph.includes(ph);
  if (S.dwell.t >= CK.dwell && S.leapCdT <= 0 && S.dwell.plat) return 'leap';   /* THE ANTI-CROWD MOVE: you have stood there too long */
  if (ph >= 3 && S.coffin && !S.coffin.held) return 'fetch';
  if (pl === 'W' || pl === 'E') { w.grab = ad < 90 ? 3 : 0; w.whip = 3; w.hurl = 2.5; w.tumble = 0.5; }
  else if (ad < 84) { w.slam = 3; w.grab = 3; w.whip = 1.5; w.lunge = 3; }
  else if (ad < 180) { w.tumble = 2.5; w.whip = 2.5; w.lunge = 2; w.grab = 0.8; w.hurl = 1.5; }
  else { w.tumble = 3; w.hurl = 3; w.whip = 0.8; w.lunge = 1; }
  if (S.throwCdT > 0 || !S.coffin || !S.coffin.held) w.hurl = 0;
  let tot = 0; const list = [];
  for (const [m, v] of Object.entries(w)) { if (!v || !has(m) || m === S.last) continue; list.push([m, v]); tot += v; }
  if (!list.length) return ph >= 3 ? (S.last !== 'lunge' ? 'lunge' : 'grab') : (S.last !== 'grab' ? 'grab' : 'slam');
  let r = rng() * tot; for (const [m, v] of list) { r -= v; if (r <= 0) return m; } return list[list.length - 1][0];
}
function nextMove(e, S, P, c) {
  const G = S.G, m = pickMove(e, S, P, c.rng || Math.random); e.face = Math.sign(P.x - e.x) || e.face; S.last = m; e.y = G.floorY;
  switch (m) {
    case 'slam': tell(e, S, c, 'slamTell', CK.slam.tell); return;
    case 'tumble': tell(e, S, c, 'tumbleTell', CK.tumble.tell); return;
    case 'grab': tell(e, S, c, 'grabTell', CK.grab.tell); S.grabY = P.y; return;
    case 'whip': tell(e, S, c, 'whipTell', CK.whip.tell); return;
    case 'lunge': tell(e, S, c, 'lungeTell', CK.lunge.tell); return;
    case 'leap': { const pl = S.dwell.plat, L = ledgeOf(G, pl), tx = L ? Math.max(L.x0 + 20, Math.min(L.x1 - 20, P.x)) : clampX(G, P.x, 26), ty = L ? L.y : G.floorY;
      S.leap = { x0: e.x, y0: G.floorY, tx, ty, t: 0, key: 'leap' + (S.act + 1), plat: pl }; S.leapCdT = CK.leapCd + CK.leap.tell; S.dwell.t = 0; tell(e, S, c, 'leapTell', CK.leap.tell); return; }
    case 'hurl': { const pl = platOf(G, P), L = pl === 'W' || pl === 'E' ? ledgeOf(G, pl) : null; S.mark = { x: clampX(G, P.x, 26), y: L ? L.y : G.floorY }; S.throwCdT = CK.throwCd;
      tell(e, S, c, 'hurlTell', CK.thrw.tell); return; }
    case 'fetch': setMode(e, 'fetch', 4); c.number(e.x, e.y - 60, CK_SAY.fetch, '#e8d0a0'); return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, c) {
  const G = S.G, gap = () => setMode(e, 'walk', CK.gap[S.ph - 1]), hw = bodyW(S) / 2;
  switch (e.mode) {
    case 'slamTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const f = e.face || 1; setMode(e, 'slam', CK.slam.t); c.sound('slam'); c.shake(5);
        c.hit([f > 0 ? e.x : e.x - CK.slam.reach - hw, f > 0 ? e.x + CK.slam.reach + hw : e.x, G.floorY - CK.slam.h, G.floorY], CK.dmg.slam, MOVE_NAME.slam, { blockable: true, key: 'slam' + S.act }); c.fx('slam', e.x + f * 36, G.floorY); } return;
    case 'slam': if (e.modeT <= 0) gap(); return;
    case 'tumbleTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { setMode(e, 'tumble', 3); c.sound('roll'); S.tumble = { dir: e.face || 1, x0: e.x, key: 'tumble' + S.act }; } return;
    case 'tumble': { const q = S.tumble; if (!q) { gap(); return; } const nx = e.x + q.dir * CK.tumble.v * dt, wall = q.dir > 0 ? G.x1 - hw - 2 : G.x0 + hw + 2;
      c.hit([e.x - hw - 4, e.x + hw + 4, G.floorY - CK.tumble.h, G.floorY], CK.dmg.tumble, MOVE_NAME.tumble, { key: q.key });
      if ((wall - nx) * q.dir <= 0) { e.x = wall; S.tumble = null; setMode(e, 'tumbleEnd', CK.tumble.end); c.shake(4); c.sound('thud'); c.number(e.x, e.y - 70, CK_SAY.wall, '#e8d0a0'); return; }
      e.x = nx; if (Math.abs(e.x - q.x0) >= CK.tumble.len) { S.tumble = null; setMode(e, 'tumbleEnd', CK.tumble.end); c.sound('thud'); } return; }
    case 'tumbleEnd': if (e.modeT <= 0) gap(); return;
    case 'grabTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const f = e.face || 1; setMode(e, 'grab', CK.grab.t); c.sound('grab');
        const res = c.hit([f > 0 ? e.x + hw - 6 : e.x - hw - CK.grab.reach, f > 0 ? e.x + hw + CK.grab.reach : e.x - hw + 6, G.floorY - CK.grab.h, G.floorY], CK.dmg.grab, MOVE_NAME.grab, { blockable: true, key: 'grab' + S.act, noKnock: true }) || [];
        const got = res.find(r => r.res === 'hit'); if (got) { S.hold = { pp: got.pp, t: CK.grab.hold, tick: CK.grab.tick, key: 'hold' + S.act }; S.n.holds++; c.number(got.pp.x, got.pp.y - 40, CK_SAY.held, '#ff9a5c'); setMode(e, 'hold', CK.grab.hold + 0.2); } } return;
    case 'grab': if (e.modeT <= 0) gap(); return;
    case 'hold': if (!S.hold || e.modeT <= 0) { S.hold = null; gap(); } return;
    case 'leapTell': if (e.modeT <= 0) { setMode(e, 'leap', CK.leap.air); c.sound('roar'); } return;
    case 'leap': { const q = S.leap; if (!q) { gap(); return; } q.t += dt; const k = Math.min(1, q.t / CK.leap.air); e.x = q.x0 + (q.tx - q.x0) * k; e.y = q.y0 + (q.ty - q.y0) * k - Math.sin(k * Math.PI) * 90; e.face = Math.sign(q.tx - q.x0) || e.face;
      if (k >= 1) { e.x = q.tx; e.y = q.ty; c.shake(7); c.sound('thud'); c.fx('land', e.x, e.y); c.hit([e.x - CK.leap.r, e.x + CK.leap.r, e.y - 50, e.y + 2], CK.dmg.leap, MOVE_NAME.leap, { key: q.key });
        if (q.ty < G.floorY - 4) setMode(e, 'perch', CK.leap.perch); else { S.leap = null; gap(); } } return; }
    case 'perch': if (e.modeT <= 0) { setMode(e, 'drop', CK.leap.drop); S.drop = { x0: e.x, y0: e.y, tx: clampX(G, e.x + (e.x < (G.x0 + G.x1) / 2 ? 1 : -1) * 70, 30), t: 0 }; S.leap = null; } return;
    case 'drop': { const q = S.drop; if (!q) { e.y = G.floorY; gap(); return; } q.t += dt; const k = Math.min(1, q.t / CK.leap.drop); e.x = q.x0 + (q.tx - q.x0) * k; e.y = q.y0 + (G.floorY - q.y0) * k * k; if (k >= 1) { e.y = G.floorY; S.drop = null; c.shake(3); gap(); } return; }
    case 'whipTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { const f = e.face || 1; setMode(e, 'whip', CK.whip.t); c.sound('chain'); S.whip = { dir: f, key: 'whip' + S.act, t: 0 }; } return;
    case 'whip': { const q = S.whip; if (q) { q.t += dt; const k = Math.min(1, q.t / (CK.whip.t * 0.6)), x1 = e.x + q.dir * (hw + CK.whip.reach * k);
        c.hit([Math.min(e.x, x1), Math.max(e.x, x1), G.floorY - CK.whip.top, G.floorY - CK.whip.bot], CK.dmg.whip, MOVE_NAME.whip, { blockable: true, high: true, key: q.key }); }
      if (e.modeT <= 0) { S.whip = null; gap(); } return; }
    case 'lungeTell': e.face = Math.sign(P.x - e.x) || e.face; if (e.modeT <= 0) { setMode(e, 'lunge', CK.lunge.t); c.sound('lash'); S.lunge = { dir: e.face || 1, x0: e.x, key: 'lunge' + S.act }; } return;
    case 'lunge': { const q = S.lunge; if (q) { e.x = clampX(G, e.x + q.dir * (CK.lunge.dist / CK.lunge.t) * dt, hw + 4);
        c.hit([e.x - hw - 10, e.x + hw + 10, G.floorY - 40, G.floorY], CK.dmg.lunge, MOVE_NAME.lunge, { blockable: true, key: q.key }); }
      if (e.modeT <= 0) { S.lunge = null; gap(); } return; }
    case 'hurlTell': if (e.modeT <= 0) { const m = S.mark || { x: P.x, y: G.floorY }; setMode(e, 'hurl', 0.4); c.sound('hurl'); S.coffin = { x: e.x, y: G.floorY - 60, held: false, fly: { x0: e.x, y0: G.floorY - 60, tx: m.x, ty: m.y, t: 0, key: 'coffin' + S.act } }; S.mark = null; } return;
    case 'hurl': if (e.modeT <= 0) gap(); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* HIS GRIP: the hands haul the held hero to the lid and squeeze; a blow tears free (c.cutting); at the end he tosses you */
function stepHold(e, S, dt, c) { const q = S.hold; if (!q || !e) return; const pp = q.pp, f = e.face || 1, want = e.x + f * (bodyW(S) / 2 + 10);
  if (c.cutting(pp)) { S.hold = null; S.n.tears++; c.number(pp.x, pp.y - 40, CK_SAY.tore, '#8fd160'); c.sound('cut'); return; }
  const dx = want - pp.x; if (Math.abs(dx) > 2) c.haul(pp, Math.sign(dx) * Math.min(Math.abs(dx), CK.grab.pull * dt));
  q.t -= dt; q.tick -= dt;
  if (q.tick <= 0) { q.tick = CK.grab.tick; c.hit([pp.x - 8, pp.x + 8, pp.y - 30, pp.y + 2], CK.dmg.squeeze, MOVE_NAME.squeeze, { key: q.key + 's' + Math.round(q.t * 10), noKnock: true }); }
  if (q.t <= 0) { S.hold = null; c.hit([pp.x - 8, pp.x + 8, pp.y - 30, pp.y + 2], CK.dmg.toss, MOVE_NAME.toss, { key: q.key + 'toss' }); c.haul(pp, f * 30); } }
/* THE THROWN COFFIN: an arc to its told mark, a crash, then it lies there until he fetches it */
function stepThrown(e, S, dt, c) { const q = S.coffin && S.coffin.fly; if (!q) return; q.t += dt; const k = Math.min(1, q.t / CK.thrw.fly);
  S.coffin.x = q.x0 + (q.tx - q.x0) * k; S.coffin.y = q.y0 + (q.ty - q.y0) * k - Math.sin(k * Math.PI) * 80;
  if (k >= 1) { c.hit([q.tx - CK.thrw.r, q.tx + CK.thrw.r, q.ty - 60, q.ty + 2], CK.dmg.coffin, MOVE_NAME.coffin, { key: q.key }); c.fx('land', q.tx, q.ty); c.shake(6); c.sound('thud');
    S.coffin = { x: q.tx, y: S.G.floorY, held: false }; } }
function stepFetch(e, S, dt, c) { const G = S.G, q = S.coffin; if (!q || q.held) { setMode(e, 'walk', 0.3); return; } if (q.fly) return;
  const d = q.x - e.x; e.face = Math.sign(d) || e.face; e.y = G.floorY;
  if (Math.abs(d) > 6) { e.x = clampX(G, e.x + Math.sign(d) * CK.walk[2] * 1.15 * dt, CK.w3 / 2 + 4); if (e.modeT <= 0) { q.held = true; setMode(e, 'walk', CK.gap[2]); } return; }
  if (!S.lift) S.lift = CK.thrw.lift; S.lift -= dt; if (S.lift <= 0) { S.lift = 0; q.held = true; setMode(e, 'walk', CK.gap[2]); } }

/* ---------- A BLOW ON HIM (B15): open x CK.openMul up to its purse; clamping or warded x CK.wardMul; else his phase's resist (>= 0.4). Returns [dmg, word] ---------- */
export function takeBlow(e, S, dmg) {
  if (e.mode === 'sleep' || e.mode === 'wake') return [0, null];
  if (ckOpen(e)) { const cap = e.maxHp * (e.openKind === 'flip' ? CK.flipCap : e.openKind === 'downed' ? CK.downCap : CK.openCap), left = Math.max(0, cap - S.openTaken);
    if (left <= 0) { if (e.open > 0.3) e.open = 0.3; return [dmg * CK.wardMul, CK_SAY.cap]; }   /* (the purse spent: still never nothing - the warded share, and the window closes) */
    const d = Math.min(dmg * CK.openMul, left); S.openTaken += d;
    if (S.openTaken >= cap - 0.01 && e.open > 0.3) { e.open = 0.3; S.n.capped++; return [d, CK_SAY.cap]; } return [d, null]; }
  if (S.ward > 0 || e.mode === 'clamp') { S.n.warded++; return [dmg * CK.wardMul, 'WARDED']; }
  S.n.sealed++; const r = CK.resist[S.ph - 1];
  return [dmg * r, S.ph >= 3 ? (S.n.sealed < 4 ? CK_SAY.free : null) : S.n.sealed < 6 ? CK_SAY.sealed : CK_SAY.sealed2];
}

/* ---------- THE BOT'S READING (src/lab.js, through tomb-king.js tkPlan when S.ck) ----------
   A HUMAN BOT: it sees his tells a reaction late (s.v2 = the v2 eyes) and misreads some; blocks or backs off the yellows, jumps the tumble, ducks the whip, steps off
   the leap's platform and the throw's mark, strikes the grip that holds it - and works THE RULE: it picks the trap whose seal binds him now (phase two: the sand
   before the sluice, for THE FLIP), waits beside its plate on the side away from the line, and treads the plate when his chase carries him into the line.
   s = { P: { x, y, vy, face, ground, atk }, e, S, plates: [{ id, ready }], reach, shield, t, rng, mem, v2, hero, held } -> { gx, face, atk, jump, dodge, block, down, up, why } */
export const PLAN = { react: 0.25, miss: 0.12, missTread: 0.15 };
export function ckPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, up: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), hw = bodyW(S) / 2, hitR = reach + hw - 2, pl = platOf(G, P), onLedge = pl === 'W' || pl === 'E', onFloor = pl === 'F';
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const offLedge = () => { const L = ledgeOf(G, pl); return L.side < 0 ? L.x1 + 18 : L.x0 - 18; };
  if (!P.ground && mem.climbT !== undefined && t - mem.climbT < 0.9) { out.gx = mem.climbX; out.why = 'climbing'; return out; }
  if (s.held || s.reeled) { out.face = Math.sign(kx - P.x) || 1; out.atk = P.atk < 0; out.why = 'tear free of his grip'; return out; }
  /* 1. HIS TELLS */
  const telling = /Tell$/.test(e.mode) || ['tumble', 'slam', 'grab', 'whip', 'lunge', 'leap'].includes(e.mode) || !!(S.coffin && S.coffin.fly);
  if (telling) { const key = 'a' + S.act + e.mode, miss = s.v2 ? false : roll(key + 'm', PLAN.miss);
    if (seenFor(key) && !miss) {
      if ((e.mode === 'leapTell' || e.mode === 'leap') && S.leap && S.leap.plat === pl && (pl !== 'F' || Math.abs(P.x - S.leap.tx) < CK.leap.r + 26)) {
        if (onLedge) { out.gx = offLedge(); out.why = 'off the ledge: his leap'; return out; } out.gx = clamp(S.leap.tx + (P.x < S.leap.tx ? -1 : 1) * (CK.leap.r + 44)); out.why = 'out from under his leap'; return out; }
      if (e.mode === 'tumble' && S.tumble && onFloor) { const toward = (P.x - kx) * S.tumble.dir > 0; if (toward && dx < 70 && P.ground) { out.jump = true; out.gx = P.x + S.tumble.dir * 20; out.why = 'jump the tumble'; return out; } out.gx = P.x; out.why = 'ready to jump the tumble'; return out; }
      if (e.mode === 'tumbleTell' && onFloor) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'his tumble is coming'; return out; }
      if ((e.mode === 'slamTell' || e.mode === 'slam') && dx < CK.slam.reach + hw + 16 && onFloor) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the slam'; return out; }
        out.gx = clamp(kx + side * (CK.slam.reach + hw + 34)); out.why = 'back off the slam'; return out; }
      if ((e.mode === 'grabTell' || e.mode === 'grab') && dx < CK.grab.reach + hw + 16 && (P.x - kx) * (e.face || 1) > 0) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block his hands'; return out; }
        out.gx = onLedge ? offLedge() : clamp(kx + side * (CK.grab.reach + hw + 30)); if (e.modeT < 0.2 && !s.noRoll && onFloor) out.dodge = true; out.why = 'out of his reach'; return out; }
      if ((e.mode === 'whipTell' || e.mode === 'whip') && dx < CK.whip.reach + hw + 20 && (P.x - kx) * (e.face || 1) > 0) { if (s.shield && roll(key + 'b', 0.5)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the whip'; return out; }
        if (onLedge) { out.gx = offLedge(); out.why = 'down off the ledge: the whip'; return out; } out.down = true; out.gx = P.x; out.why = 'duck the whip'; return out; }
      if ((e.mode === 'lungeTell' || e.mode === 'lunge') && dx < CK.lunge.dist + hw + 30 && (P.x - kx) * (e.face || 1) > 0) { if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the claws'; return out; }
        if (P.ground) { out.jump = true; out.gx = kx - side * 20; out.why = 'jump over his lunge'; return out; } }
      if (e.mode === 'hurlTell' || (S.coffin && S.coffin.fly)) { const m = S.mark || (S.coffin && S.coffin.fly ? { x: S.coffin.fly.tx, y: S.coffin.fly.ty } : null);
        if (m && Math.abs(P.x - m.x) < CK.thrw.r + 20) { out.gx = onLedge ? offLedge() : clamp(m.x + (P.x < m.x ? -1 : 1) * (CK.thrw.r + 34)); out.why = 'off the coffin\'s mark'; return out; } }
    } }
  /* 2. OPEN: strike him; WARDED: off him */
  if (ckOpen(e)) { if (onLedge && P.ground) { out.gx = offLedge(); out.why = 'down to strike him'; return out; } out.gx = clamp(kx + side * (s.tip ? 30 : 10 + hw)); if (dx < hitR + 4) swing(kx); out.why = 'strike him: ' + (OPEN_NAME[e.openKind] || 'open').toLowerCase(); return out; }
  if (S.ward > 0 || e.mode === 'clamp' || e.mode === 'escape') { out.gx = clamp(onLedge ? P.x : kx + side * 90); out.why = 'his ward: wait'; return out; }
  if (s.rest) { out.gx = clamp(onLedge ? P.x : kx + side * 120); out.why = 'winded: off him'; return out; }
  /* 3. THE RULE: the trap whose seal binds him now (phase two: the sand before the sluice); wait beside its plate, tread it when he is in its line */
  const ready = new Map((s.plates || []).map(p => [p.id, p.ready]));
  const want = G.plates.filter(p => ready.get(p.id) && p.ph <= S.ph && (S.ph >= 3 || need(S).includes(p.seal)));
  const order = p => (S.ph === 2 && p.seal === 'glass' ? 0 : 1) * 1000 + Math.abs((p.wait ? p.wait[0] : p.x0) - P.x) / 10 + (S.ph >= 3 ? Math.abs((p.wait ? p.wait[0] : p.x0) - kx) / 20 : 0);
  const pick = want.sort((a, b) => order(a) - order(b))[0];
  if (pick && pick.wait) { const [wx, wy] = pick.wait, mid = (pick.x0 + pick.x1) / 2, onRow = P.ground && Math.abs(P.y - wy) < 6, airK = AIR.has(e.mode);
    const inLine = pick.kind === 'flood' ? Math.abs(e.y - G.floorY) < 4 && !airK : kx + hw > pick.reach[0][0] + 6 && kx - hw < pick.reach[0][1] - 6 && !airK;
    const coming = pick.kind === 'flood' || (pick.kind === 'gas' ? Math.abs(kx - mid) < 120 : true);
    if (onRow && Math.abs(P.x - wx) < 40 && inLine && coming && !roll('tr' + S.act + pick.id + Math.floor(t), PLAN.missTread)) { out.gx = mid; out.face = Math.sign(kx - P.x) || 1; out.why = 'tread the plate: he is in ' + (TRAP_OF[pick.seal] || pick.id).toLowerCase() + '\'s line'; return out; }
    if (pick.ledge) { const L = G.ledges.find(l => Math.abs(l.y - pick.y) < 4 && mid > l.x0 && mid < l.x1);
      if (!onRow) { if (onLedge) { out.gx = offLedge(); out.why = 'down: the other ledge'; return out; } const under = Math.max(L.x0 + 10, Math.min(L.x1 - 10, wx)), beneath = P.x > L.x0 + 6 && P.x < L.x1 - 6;
        if (!beneath) { out.gx = clamp(under); out.why = 'to ' + (TRAP_OF[pick.seal] || '').toLowerCase() + '\'s ledge'; return out; }
        out.jump = P.ground; out.gx = wx; if (P.ground) { mem.climbT = t; mem.climbX = out.gx; } out.why = 'up onto the ledge'; return out; }
      out.gx = wx; out.face = Math.sign(kx - P.x) || 1; out.why = 'wait by the plate: let him come under'; return out; }
    if (onLedge) { out.gx = offLedge(); out.why = 'down off the ledge'; return out; }
    out.gx = clamp(wx); out.face = Math.sign(kx - P.x) || 1; out.why = 'wait by ' + (TRAP_OF[pick.seal] || pick.id).toLowerCase() + '\'s plate'; return out; }
  /* 4. no trap ready: his shell is something (B15) - cut him while he recovers close by, else keep off */
  if (onLedge) { out.gx = dx > 90 ? offLedge() : P.x; out.why = 'on the ledge: wait'; return out; }
  if (dx < hitR && /recover|walk|stagger|tumbleEnd|fetch/.test(e.mode)) { swing(kx); out.gx = P.x; out.why = 'cut his lid'; return out; }
  out.gx = clamp(kx + side * Math.max(hitR - 6, 40)); out.face = Math.sign(kx - P.x) || 1; out.why = 'close on him'; return out;
}
