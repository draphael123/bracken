// src/fog-knight.js - THE FOG KNIGHT, THE TOWPATH's boss (claude/towpath, the Opus greybox, 2026-10-08). Daniel 10-07 ~12:45 (scratch/concept-towpath.md):
// "the fog personified - a DUELIST, a paladin-style stance fight; conventional fantasy, slightly eerie". Not a mini: the Towpath's main boss.
//
// WHAT HE IS: an EMPTY suit of old rust-black plate, fog pouring from its joints, visor and mail and holding the shape of the man; a long pitted sword, a
//   corroded shield with its device gone. He moves too smoothly for his weight - he GLIDES (over the cut's water too: he is fog). Not the Crusader, not the
//   Paladin, not a sworn sword: nobody is inside.
// WHAT HE IS (design standard B11): A DUELIST, ALWAYS HITTABLE, GUARDING BY ANGLE - THE STANCE FIGHT. On guard he holds one of three stances, told as he takes
//   it (the word over him, the pose, the fog): GUARDS HIGH (shield up, the visor glowing) - a LOW blow lands (a crouched cut, the sweep, a low poke); GUARDS
//   LOW (sword planted, fog pooling round his greaves) - a HIGH blow lands (a jump attack, the rising cut, the air up-swing) or a plunge; FULL GUARD (the fog
//   wrapped round him like a cloak) - only a PLUNGE lands, and it BREAKS the guard: he REELS (every blow lands). The wrong angle CLANKS and names the stance
//   (src/boss-read.js's shared read, B10). In his own blows - the swing, the lunge and the recovery after them - he is committed: every blow lands.
//   He is on src/boss-greed.js FULL_DAMAGE (no global chip; greed is still counted - the mash bot's reprisal).
// HIS OPENINGS ARE THE RULE'S (B1): FOG IS HIS BODY -
//   THE LANTERN BURNS IT: lit and near him, your lantern burns the fog out of the armour (a BURN bar fills: FK.burnT s of light within FK.burnR). Full, the
//     armour STANDS EMPTY, the plates sag: OPEN (FK.openT s; B10: a gold ring and a timer bar), a blow x FK.openMul, one opening FK.openCap of him at most. A
//     blow that lands on you gutters the lantern (src/towpath-hands.js: E lights it again). Lit, he SEES you (the lunge finds you); dim, he LOSES you (he walks
//     to where you were, his lunge goes there - but his tells come late, and nothing burns).
//   THE SWING BRIDGE SCATTERS HIM: struck while he is in its arc (crossing the cut, gliding over it), the swinging deck goes through him: the fog blows out
//     of the plate and it stands EMPTY - OPEN FK.scatterT s.
//   B3: when an opening ends the fog pours back - a TOLD FK.wardT s WARD (every blow clanks WARDED; nothing burns). B4: open, he stands where he is.
//   B12: when hurt he may DISSOLVE and re-form beside you - once a cycle at most, never in or right after his own opening, always where you can follow.
// PHASE ONE - THE TOWPATH AT DUSK (to FK.p2): his stances, THE CUT (! a shield turns it), THE FOG LUNGE (!! a told thrust in a rush of mist - no shield
//   turns it; ROLL only in its last beat: a roll begun sooner is spent before the point arrives - TOO SOON).
// PHASE TWO - THE LOCK GATES, THE FOG RISING (FK.p2 to FK.p3). NEW MOVE: THE FOG DOUBLE - he draws a second knight out of the lock's mist: it takes his
//   stance and his swing A BEAT LATE from the other side of you (its blows are real; a blade finds nothing in it). The real one's VISOR GLOWS. DRAINING THE
//   LOCK (its paddle on the gate) GROUNDS the double: it sinks with the water, and he cannot draw another until the lock fills again (FK.refill s, its
//   leaking gates: the gauge shows it). The arena changes: the lock is part of the fight.
// PHASE THREE - NIGHT, THE ARMOUR MOSTLY EMPTY (FK.p3 to 0). NEW MOVE: THE SHROUD - the fog floods the towpath (clear only in light: your lantern, the two
//   LOCK LAMPS struck alight), and once a cycle he goes into it and steps out at your back with a told cut. Lighting the lamps thins it.
// PURE: no DOM, no main.js. The world is a context `c` (src/fog-knight-hands.js binds it). fkPlan is the boss lab's HUMAN bot (src/lab.js).

export const FK = {
  hp: 1400, w: 18, h: 34, markH: 50,
  openMul: 1.6, openCap: 0.13, openT: 3.4, scatterT: 3.0, wardT: 3.0, reelT: 1.3, burnT: 3.2, burnR: 84, burnDecay: 0.35, arcR: 34,
  p2: 0.66, p3: 0.33,
  walk: 62, keep: 40, turn: 0.3, gap: [0.55, 0.48, 0.42],
  stanceTell: [0.5, 0.42, 0.36], litEarly: 0.18, darkLate: 0.14,
  cutTell: 0.5, cutT: 0.16, cutReach: 46, cutRec: 0.55,
  lungeTell: 0.8, lungeT: 0.26, lungeV: 420, lungeRec: 0.7, lungeRange: 150, lungeBeat: 0.22,
  doubleTell: 0.7, doubleLag: 0.55, refill: 12, drainT: 1.4,
  shroudTell: 1.0, stepTell: 0.55, dissolveT: 0.5, reformD: 60, chainHits: 3, chainT: 2.0,
  lastSeenEvery: 1.2,
  dmg: { cut: 30, lunge: 38, double: 20, step: 32 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]); 'high' / 'low' / 'full' = take that stance (told) */
export const CYCLES = {
  1: [['high', 'cut', 'lunge', 'low', 'cut'], ['low', 'lunge', 'full', 'cut', 'high', 'cut'], ['full', 'cut', 'high', 'lunge', 'low', 'cut']],
  2: [['double', 'high', 'cut', 'lunge', 'low', 'cut'], ['low', 'cut', 'full', 'lunge', 'double', 'high', 'cut'], ['high', 'lunge', 'double', 'low', 'cut', 'full', 'cut']],
  3: [['step', 'high', 'cut', 'low', 'lunge'], ['full', 'cut', 'step', 'low', 'cut', 'high', 'lunge'], ['low', 'lunge', 'high', 'step', 'full', 'cut']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  stanceTell: { mark: '', answer: '' }, cutTell: { mark: '!', answer: 'block' }, lungeTell: { mark: '!!', answer: 'dodge' }, doubleTell: { mark: '', answer: '' },
  shroudTell: { mark: '', answer: '' }, stepTell: { mark: '!', answer: 'block' },
};
export const MOVE_NAME = { cut: 'HIS SWORD', lunge: 'THE FOG LUNGE', double: 'THE FOG DOUBLE', step: 'OUT OF THE SHROUD' };
export const STANCE_WORD = { high: 'GUARDS HIGH', low: 'GUARDS LOW', full: 'FULL GUARD' };
export const STANCE_HOW = { high: 'GUARDS HIGH: HIT LOW', low: 'GUARDS LOW: HIT HIGH', full: 'FULL GUARD: PLUNGE ON HIM' };

/* ---------- THE TOWPATH'S END (the arena) ----------
   local columns 0..43, the floor's surface row R (the hero stands on R-1). THE CUT (cols 18-20) under its SWING BRIDGE (capstans on both banks: 16, 22);
   the LOCK GATE at the east end, its BALANCE BEAMS (one-way, the plunge's heights), its PADDLE (drains the lock: the double sinks), two LOCK LAMPS (P3). */
export const FK_STAGE = { W: 44, door: 5, cut: [18, 20], caps: [16, 22], beams: [{ x0: 3, x1: 9, dy: 4 }, { x0: 27, x1: 33, dy: 4 }, { x0: 35, x1: 41, dy: 7 }], paddle: 42, lamps: [6, 37], him: 31, lockX: [36, 43] };
export function stageFogKnight(W, T, TS, sx, R, O = 10) {
  const { set, block, ent, air, boards } = W, S = FK_STAGE, ex = sx + S.W;
  const pools = [], bridges = [], lamps = [], locks = [];
  const carve = () => {
    air(sx, ex - 1, R - 18, R - 1); block(sx, ex - 1, R, R + 40);
    block(sx - 1, sx - 1, R - 22, R - S.door - 1);                       /* the west wall over the way in (shut behind you) */
    block(sx - 1, ex, R - 22, R - 19);                                    /* the night sky's lid: the lock-house's eaves, the warehouse lintels */
    const [c0, c1] = S.cut; air(sx + c0, sx + c1, R, R + 5);
    pools.push({ x0: (sx + c0) * TS, x1: (sx + c1 + 1) * TS, y: (R + 1 + O) * TS + 4, shallow: false, swim: false, clear: true, bottom: (R + 6 + O) * TS, tp: 'fkCut' });
    bridges.push({ id: 'fkBridge', x0: sx + c0, x1: sx + c1, row: R, init: 'across', arena: true }); boards(sx + c0, sx + c1, R);
    for (const c of S.caps) ent('tpcapstan', sx + c, R - 1, { bridge: 'fkBridge', arena: true });
    for (const b of S.beams) boards(sx + b.x0, sx + b.x1, R - b.dy);
    ent('tppaddle', sx + S.paddle, R - 1, { lock: 'fkLock', arena: true });
    locks.push({ id: 'fkLock', virtual: true, x0: sx + S.lockX[0], x1: sx + S.lockX[1], bed: R + 4, lo: R + 2, hi: R - 6, init: 'hi', arena: true, refill: FK.refill });   /* (no pool: the lock is behind the gate, drawn; its water is the double's) */
    for (const c of S.lamps) { lamps.push({ x: sx + c, y: R - 1, lit: false, arena: true }); ent('tplamp', sx + c, R - 1, { arena: true }); }
    ent('fogknight', sx + S.him, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: (R + O) * TS, trigger: (sx + 3) * TS, wallL: sx - 1, wallR: ex, boss: 'fogknight', music: 'fogknight',
    tint: '#5a6a78', tintA: 0.08, start: [sx + 2, R - 1 + O], y0: (R - 18 + O) * TS, y1: (R + 1 + O) * TS, fk: { sx, R: R + O } };
  return { arena, carve, pools, bridges, lamps, locks };
}
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.fk, X = c => (q.sx + c) * TS, S = FK_STAGE;
  return { TS, x0: X(0), x1: X(S.W), floorY: q.R * TS, cut: [X(S.cut[0]), X(S.cut[1] + 1)], cutMid: (X(S.cut[0]) + X(S.cut[1] + 1)) / 2, caps: S.caps.map(c => X(c) + 8),
    paddle: X(S.paddle) + 8, lamps: S.lamps.map(c => X(c) + 8), beams: S.beams.map(b => ({ x0: X(b.x0), x1: X(b.x1 + 1), y: (q.R - b.dy) * TS })) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, openTaken: 0, burn: 0, behindT: 0, why: '', stance: 'high', want: null,
    seenX: null, seenT: 0, dbl: null, hist: [], clock: 0, reformUsed: false, chain: [], told: {}, shroud: 0, lunge: null, stepTo: null,
    n: { cycles: 0, opens: 0, burns: 0, scatters: 0, wards: 0, warded: 0, turned: 0, landed: 0, reels: 0, plunges: 0, lunges: 0, cuts: 0, doubles: 0, grounded: 0, steps: 0, reforms: 0, soon: 0, moves: {} } };
}
export const fPhase = e => (e.hp <= e.maxHp * FK.p3 ? 3 : e.hp <= e.maxHp * FK.p2 ? 2 : 1);
export const fkOpen = e => !!e && (e.mode === 'empty') && (e.open || 0) > 0;
const STRIKE = new Set(['cut', 'lunge', 'stepCut']);
const COMMITTED = new Set(['cut', 'cutRec', 'lunge', 'lungeRec', 'stepCut', 'reel']);
const GUARD_MODES = new Set(['walk', 'recover', 'stanceTell', 'cutTell', 'lungeTell', 'doubleTell', 'shroudTell', 'stepTell']);
export const committed = e => !!e && COMMITTED.has(e.mode);
/* THE ANGLE a blow beats a stance with: true = it lands */
export const beatsStance = (stance, angle) => stance === 'high' ? angle === 'low' : stance === 'low' ? (angle === 'high' || angle === 'plunge') : stance === 'full' ? angle === 'plunge' : true;
/* WHAT A BLOW TAKES OFF HIM: { k (multiplier), word (when turned), reel (a plunge broke the full guard) }. angle: 'low' | 'mid' | 'high' | 'plunge' | 'burn' */
export function takeAt(e, S, angle) {
  if (!e || e.mode === 'sleep' || e.mode === 'wake') return { k: 0, word: '' };
  if (e.mode === 'dissolve' || e.mode === 'gone') return { k: 0, word: 'NOT THERE' };
  if (S.ward > 0) return { k: 0, word: 'WARDED' };
  if (fkOpen(e)) return { k: FK.openMul, word: '' };
  if (angle === 'burn') return { k: 0.5, word: '' };   /* (fire burns fog: a burn tick lands at half, whatever his stance) */
  if (COMMITTED.has(e.mode)) return { k: 1, word: '' };
  if (GUARD_MODES.has(e.mode)) { if (beatsStance(S.stance, angle)) return { k: 1, word: '', reel: S.stance === 'full' }; return { k: 0, word: STANCE_WORD[S.stance] }; }
  return { k: 1, word: '' };
}

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 16, Math.min(G.x1 - 16, x));
const tellLen = (S, base, lit) => Math.max(0.2, base + (lit ? 0 : -FK.darkLate) - (S.ph === 3 && !lit ? 0.04 : 0));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); }
function endOpen(e, S, c) { e.open = 0; S.ward = FK.wardT; S.n.wards++; S.openTaken = 0; S.burn = 0; c.number(e.x, e.y - 74, 'THE FOG POURS BACK INTO HIM', '#9ab0c0'); c.sound('tell'); c.fx('ward', e.x, e.y); }
function open(e, S, c, why) { setMode(e, 'empty', (why === 'scatter' ? FK.scatterT : FK.openT) + 0.05); e.open = why === 'scatter' ? FK.scatterT : FK.openT; S.openTaken = 0; S.n.opens++; S.burn = 0; S.lunge = null;
  if (why === 'scatter') S.n.scatters++; else S.n.burns++; c.fx('open', e.x, e.y); c.sound('open');
  c.number(e.x, e.y - 74, why === 'scatter' ? 'THE BRIDGE SCATTERS THE FOG: THE ARMOUR STANDS EMPTY - CUT IT' : 'THE LANTERN BURNS THE FOG OUT OF HIM: THE ARMOUR STANDS EMPTY - CUT IT', '#8fd160'); }
const canOpen = (e, S) => !!e && e.alive && e.mode !== 'sleep' && e.mode !== 'wake' && e.mode !== 'dissolve' && e.mode !== 'gone' && !fkOpen(e) && !(S.ward > 0);

/* ---------- THE RULE ON HIM (the hands call these) ---------- */
/* THE SWING BRIDGE swung (src/towpath-hands.js, the arena's capstans): in its arc, he is scattered. Returns 'scatter' | 'miss' | 'ward' | 'busy' */
export function bridgeSwung(e, S, c) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return 'busy';
  if (Math.abs(e.x - S.G.cutMid) > FK.arcR + (S.G.cut[1] - S.G.cut[0]) / 2) return 'miss';
  if (!canOpen(e, S)) { if (S.ward > 0) c.number(e.x, e.y - 64, 'THE FOG IS BACK IN HIM: NOT YET', '#9ab0c0'); return 'ward'; }
  open(e, S, c, 'scatter'); return 'scatter';
}
/* THE LOCK DRAINED (its paddle): the double sinks with the water. Returns true if a double was grounded */
export function lockDrained(e, S, c) {
  if (!S.dbl) return false; S.dbl = null; S.n.grounded++; c.number(e.x, e.y - 64, 'THE LOCK RUNS DRY: THE DOUBLE SINKS WITH ITS MIST', '#8fd160'); c.sound('open'); return true;
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, lit, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)  c.time()
   c.lockFull() -> the arena lock stands full (a double can be drawn)   c.lampsLit() -> how many lock lamps burn   c.light(x, y) -> 0..1 light on that spot ---------- */
export function stepFogKnight(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY; S.clock += dt;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  /* WHAT HE SEES: a lit hero, always; a dim one only at his elbow - otherwise the place he last saw him (refreshed now and then: the fog shows a shape) */
  const lit = !!(P && P.lit), near = P && Math.abs(P.x - e.x) < 46;
  if (P && (lit || near)) { S.seenX = P.x; S.seenT = 0; } else { S.seenT += dt; if (S.seenX === null || S.seenT > FK.lastSeenEvery) { S.seenX = P ? P.x : e.x; S.seenT = 0; } }
  const tx = S.seenX ?? (P ? P.x : e.x);
  /* THE BURN (the rule): a lit lantern within FK.burnR burns the fog out of him; out of it, the fog comes back slowly */
  if (canOpen(e, S) && !COMMITTED.has(e.mode)) { const burning = h.some(q => q.alive && q.lit && Math.abs(q.x - e.x) < FK.burnR && Math.abs(q.y - e.y) < 60);
    if (burning) S.burn = Math.min(1, S.burn + dt / FK.burnT); else S.burn = Math.max(0, S.burn - dt * FK.burnDecay);
    if (S.burn >= 1 && !STRIKE.has(e.mode)) { open(e, S, c, 'burn'); return; } }
  else if (S.ward > 0) S.burn = 0;
  stepDouble(e, S, dt, h, c);
  if (S.ph === 3) S.shroud = Math.min(1, S.shroud + dt / FK.shroudTell); else S.shroud = Math.max(0, S.shroud - dt);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = fPhase(e);
  if (want > S.ph && !fkOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want); S.reformUsed = false;
    if (want === 2) { c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'THE FOG RISES OFF THE LOCK: IT TAKES HIS SHAPE', '#ff9a5c'); c.sound('tellHard'); setMode(e, 'recover', 0.7); return; }
    if (want === 3) { c.number((G.x0 + G.x1) / 2, G.floorY - 120, 'NIGHT: THE SHROUD COMES DOWN THE TOWPATH', '#ff6b6b'); c.sound('tellHard'); c.shake(4); setMode(e, 'recover', 0.9); return; } }
  switch (e.mode) {
    case 'empty': if (e.open <= 0) { endOpen(e, S, c); setMode(e, 'recover', 0.5); } return;   /* B4: the plate stands where it is */
    case 'reel': if (e.modeT <= 0) { setMode(e, 'recover', 0.35); } return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c, lit); return;
    case 'dissolve': if (e.modeT <= 0) { e.x = S.stepTo ?? e.x; S.stepTo = null; c.fx('reform', e.x, e.y); e.face = Math.sign((P ? P.x : e.x) - e.x) || e.face;
        if (S.stepCut) { S.stepCut = false; tell(e, S, c, 'stepTell', tellLen(S, FK.stepTell, lit)); } else setMode(e, 'recover', 0.3); } return;
    case 'walk': {
      const d = tx - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > FK.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      if (Math.abs(d) > FK.keep) e.x = clampX(G, e.x + Math.sign(d) * FK.walk * dt);
      else if (Math.abs(d) < FK.keep - 22) e.x = clampX(G, e.x - Math.sign(d) * FK.walk * 0.5 * dt);
      if (e.modeT <= 0) nextMove(e, S, P, c, lit); return; }
  }
  stepMove(e, S, dt, P, h, c, lit, tx);
}
function nextMove(e, S, P, c, lit) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; S.reformUsed = false; }
  let m = S.script[S.step++]; const tx = S.seenX ?? P.x, dx = tx - e.x, ad = Math.abs(dx);
  e.face = Math.sign(dx) || e.face;
  if (m === 'double' && (S.dbl || !c.lockFull())) m = 'cut';
  if (m === 'step' && S.ph < 3) m = 'cut';
  if (m === 'cut' && ad > FK.cutReach + 30) { setMode(e, 'walk', 0.45); S.step--; return; }   /* out of his reach: he closes first */
  if (m === 'lunge' && ad > FK.lungeRange + 40) { setMode(e, 'walk', 0.45); S.step--; return; }
  switch (m) {
    case 'high': case 'low': case 'full': S.want = m; tell(e, S, c, 'stanceTell', tellLen(S, FK.stanceTell[S.ph - 1] + (lit ? FK.litEarly : 0), lit)); return;
    case 'cut': tell(e, S, c, 'cutTell', tellLen(S, FK.cutTell, lit)); return;
    case 'lunge': tell(e, S, c, 'lungeTell', tellLen(S, FK.lungeTell, lit)); S.lunge = { to: tx, t0: e.modeT }; return;
    case 'double': tell(e, S, c, 'doubleTell', FK.doubleTell); return;
    case 'step': tell(e, S, c, 'shroudTell', 0.6); S.stepTo = clampX(S.G, P.x - (P.face || 1) * 34); return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c, lit, tx) {
  const G = S.G, f = e.face || 1, after = t => setMode(e, 'recover', t ?? FK.gap[S.ph - 1]);
  switch (e.mode) {
    case 'stanceTell': if (e.modeT <= 0) { S.stance = S.want || S.stance; S.want = null; after(0.25); } return;   /* (the stance is drawn and named over him: src/fog-knight-hands.js drawOver) */
    case 'cutTell': if (e.modeT <= 0) { setMode(e, 'cut', FK.cutT); S.n.cuts++; c.sound('slash'); } return;
    case 'cut': c.hit([f > 0 ? e.x - 4 : e.x - FK.cutReach, f > 0 ? e.x + FK.cutReach : e.x + 4, e.y - 30, e.y], FK.dmg.cut, MOVE_NAME.cut, { blockable: true, key: 'cut' + S.act });
      if (e.modeT <= 0) setMode(e, 'cutRec', FK.cutRec); return;
    case 'cutRec': if (e.modeT <= 0) after(); return;
    case 'lungeTell': if (S.lunge) S.lunge.to = lit ? (P ? P.x : S.lunge.to) : S.lunge.to; e.face = Math.sign((S.lunge ? S.lunge.to : tx) - e.x) || f;
      if (e.modeT <= 0) { setMode(e, 'lunge', FK.lungeT); S.n.lunges++; c.sound('lunge'); c.fx('mist', e.x, e.y); } return;
    case 'lunge': { const x0 = e.x; e.x = clampX(G, e.x + f * FK.lungeV * dt);
      const box = [Math.min(x0, e.x) - (f < 0 ? 26 : 4), Math.max(x0, e.x) + (f > 0 ? 26 : 4), e.y - 26, e.y];
      const r = c.hit(box, FK.dmg.lunge, MOVE_NAME.lunge, { key: 'lunge' + S.act, soon: true }); if (r === 'soon') S.n.soon++;
      if (e.modeT <= 0) { S.lunge = null; setMode(e, 'lungeRec', FK.lungeRec); } return; }
    case 'lungeRec': if (e.modeT <= 0) after(); return;
    case 'doubleTell': if (e.modeT <= 0) { if (c.lockFull() && !S.dbl) { S.dbl = { x: e.x, face: -f, stance: S.stance, mode: 'walk', y: e.y }; S.n.doubles++; c.fx('double', e.x, e.y);
        if (!S.told.dbl) { S.told.dbl = 1; c.number(e.x, e.y - 80, 'A SECOND KNIGHT OUT OF THE LOCK MIST: THE REAL ONE\'S VISOR GLOWS', '#ffd36b'); } } after(0.4); } return;
    case 'shroudTell': if (e.modeT <= 0) { setMode(e, 'dissolve', FK.dissolveT); S.n.steps++; c.fx('dissolve', e.x, e.y); S.stepCut = true; } return;
    case 'stepTell': if (e.modeT <= 0) { setMode(e, 'stepCut', FK.cutT); c.sound('slash'); } return;
    case 'stepCut': c.hit([f > 0 ? e.x - 4 : e.x - FK.cutReach, f > 0 ? e.x + FK.cutReach : e.x + 4, e.y - 30, e.y], FK.dmg.step, MOVE_NAME.step, { blockable: true, key: 'step' + S.act });
      if (e.modeT <= 0) setMode(e, 'cutRec', FK.cutRec); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* A PLUNGE BROKE THE FULL GUARD: he reels (every blow lands), and comes out of it guarding high */
export function reel(e, S, c) { setMode(e, 'reel', FK.reelT); S.n.reels++; S.stance = 'high'; S.want = null; c.number(e.x, e.y - 64, 'THE GUARD BREAKS: HE REELS', '#8fd160'); c.sound('open'); }
/* THE FOG DOUBLE: on the far side of the hero from him, a beat late: his stance, and his cut */
function stepDouble(e, S, dt, h, c) {
  S.hist.push({ t: S.clock, mode: e.mode, stance: S.stance, act: S.act }); while (S.hist.length && S.clock - S.hist[0].t > FK.doubleLag + 0.2) S.hist.shift();
  const D = S.dbl; if (!D) return; const P = h.find(q => q.alive) || h[0];
  if (!e.alive || S.ph < 2) { S.dbl = null; return; }
  const past = S.hist.find(q => S.clock - q.t <= FK.doubleLag + 0.02) || S.hist[0]; if (!past) return;
  const want = clampX(S.G, P.x + (P.x - e.x > 0 ? 1 : -1) * Math.max(40, Math.min(90, Math.abs(P.x - e.x)))); D.x += Math.sign(want - D.x) * Math.min(Math.abs(want - D.x), FK.walk * 1.1 * dt);
  D.face = Math.sign(P.x - D.x) || D.face; D.stance = past.stance; D.mode = past.mode;
  if (past.mode === 'cut') c.hit([D.face > 0 ? D.x - 4 : D.x - FK.cutReach, D.face > 0 ? D.x + FK.cutReach : D.x + 4, D.y - 30, D.y], FK.dmg.double, MOVE_NAME.double, { blockable: true, key: 'dbl' + past.act });
}
/* A LANDED BLOW (the hands call it after take): the chain of blows that makes him dissolve and re-form beside you (B12: once a cycle, never in or right after an opening) */
export function landed(e, S, c, heroX) {
  S.n.landed++; const t = S.clock; S.chain = S.chain.filter(q => t - q < FK.chainT); S.chain.push(t);
  if (S.chain.length >= FK.chainHits && !S.reformUsed && !fkOpen(e) && !(S.ward > 0) && e.mode !== 'reel' && !COMMITTED.has(e.mode) && e.hp > 0) {
    S.reformUsed = true; S.chain = []; S.n.reforms++; const side = Math.sign(e.x - heroX) || 1;
    S.stepTo = clampX(S.G, heroX + side * FK.reformD); setMode(e, 'dissolve', FK.dissolveT); c.fx('dissolve', e.x, e.y); c.sound('tell'); }
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some. It keeps the LANTERN LIT (E, away from a
   capstan or a paddle - E there works the gadget) and stays near him to burn the fog out; it blocks or backs off the cut, rolls the lunge in its last beat
   (or stands outside its reach); it reads his STANCE: GUARDS HIGH -> a crouched cut (DOWN + ATTACK); GUARDS LOW -> a jump attack; FULL GUARD -> a jump and
   a plunge onto him; in his blows' recovery and when he reels, any cut. Open, it cuts him hard; warded, it waits off him. It strikes a capstan when he is in
   the bridge's arc and it stands by one; in phase two it drains the lock when a double stands and the paddle is near; in phase three it lights a lamp.
   s = { P: { x, y, face, ground, atk, lit, has }, e, S, reach, shield, t, rng, mem, v2, hero, gadgetNear, bridgeOpen, rest, noRoll } ->
       { gx, face, atk, jump, dodge, block, talk, up, down, why } */
export const PLAN = { react: 0.25, miss: 0.12, missAngle: 0.15 };
export function fkPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const [c0, c1] = G.cut, onWest = P.x < c0, lo = onWest || !s.bridgeOpen ? G.x0 + 12 : c1 + 8, hi = !onWest || !s.bridgeOpen ? G.x1 - 12 : c0 - 8;
  const clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 26, hitR = reach + FK.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* 0. THE BRIDGE IS OPEN AND HE IS ACROSS THE CUT: swing it back from this bank's capstan (it never jumps the cut) */
  const across = (kx < c0) !== (P.x < c0);
  if (s.bridgeOpen && across && !fkOpen(e)) { const cap = G.caps.slice().sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0];
    out.gx = clamp(cap + (P.x < cap ? -8 : 8)); if (Math.abs(P.x - cap) < 22 && P.ground) { out.face = Math.sign(cap - P.x) || 1; out.atk = P.atk < 0; out.gx = P.x; out.why = 'swing the bridge back'; } else out.why = 'to a capstan: the bridge is open'; return out; }
  /* 1. HIS BLOWS (a quarter-second late, some misread) - and the double's */
  const key = 'k' + S.act + e.mode;
  if (/Tell$/.test(e.mode) || e.mode === 'cut' || e.mode === 'lunge' || e.mode === 'stepCut') {
    const miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'lungeTell' || e.mode === 'lunge') && same) {
        const to = S.lunge ? S.lunge.to : P.x, inPath = Math.abs(to - P.x) < 40 || dx < FK.lungeRange;
        if (inPath) { if (e.mode === 'lungeTell' && e.modeT < FK.lungeBeat && P.ground && !s.noRoll) { out.dodge = true; out.gx = clamp(P.x + side * 30); out.why = 'roll the lunge in its last beat'; return out; }
          if (e.mode === 'lunge' && P.ground && !s.noRoll) { out.dodge = true; out.gx = clamp(P.x + side * 30); out.why = 'roll the lunge (late)'; return out; }
          if (s.noRoll) { out.gx = clamp(kx + side * (FK.lungeRange + 60)); out.why = 'out of the lunge\'s reach'; return out; }
          out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'wait for the lunge\'s last beat'; return out; } }
      if ((e.mode === 'cutTell' || e.mode === 'cut' || e.mode === 'stepTell' || e.mode === 'stepCut') && dx < FK.cutReach + 24 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block his sword'; return out; }
        out.gx = clamp(kx + side * (FK.cutReach + 34)); if (dx < FK.cutReach + 4 && e.modeT < 0.16 && !s.noRoll && e.mode !== 'cut') out.dodge = true; out.why = 'back off his sword'; return out; }
    }
  }
  if (S.dbl && S.dbl.mode === 'cutTell' && Math.abs(S.dbl.x - P.x) < FK.cutReach + 20 && seenFor('d' + S.act)) { if (s.shield) { out.block = true; out.face = Math.sign(S.dbl.x - P.x) || 1; out.why = 'block the double'; return out; }
    out.gx = clamp(P.x + (P.x > S.dbl.x ? 1 : -1) * 50); out.why = 'off the double\'s swing'; return out; }
  /* 2. OPEN: cut him (any angle); WARDED: off him */
  if (fkOpen(e)) { out.gx = clamp(kx + side * Math.min(hitR - 6, 18)); if (dx < hitR + 4 && same) swing(kx); out.why = 'cut him: the armour stands empty'; return out; }
  if (S.ward > 0) { out.gx = clamp(kx + side * 70); out.face = Math.sign(kx - P.x) || 1; out.why = 'his ward: wait'; return out; }
  /* 3. THE LANTERN: lit, always (away from a gadget: E there works it) */
  if (P.has && !P.lit) { if (s.gadgetNear) { out.gx = clamp(P.x + (P.x < (G.x0 + G.x1) / 2 ? 30 : -30)); out.why = 'off the gadget to light the lantern'; return out; }
    out.talk = true; out.gx = P.x; out.why = 'light the lantern'; return out; }
  /* 4. THE RULE: the bridge's arc (a capstan in reach); the lock under a double; a lamp in phase three */
  if (!s.bridgeOpen && Math.abs(kx - G.cutMid) < FK.arcR && S.burn < 0.7) { const cap = G.caps.find(q => Math.abs(q - P.x) < 26);
    if (cap !== undefined && P.ground) { out.face = Math.sign(cap - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'swing the bridge through him'; return out; } }
  if (S.dbl && Math.abs(G.paddle - P.x) < 150) { out.gx = clamp(G.paddle + (P.x < G.paddle ? -12 : 12)); if (Math.abs(P.x - G.paddle) < 24 && P.ground) { out.face = Math.sign(G.paddle - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'drain the lock: ground the double'; } else out.why = 'to the lock paddle'; return out; }
  if (S.ph === 3 && s.lamps) { const lp = s.lamps.find(q => !q.lit && Math.abs(q.x - P.x) < 110); if (lp && !/Tell$/.test(e.mode)) { out.gx = clamp(lp.x + (P.x < lp.x ? -12 : 12)); if (Math.abs(P.x - lp.x) < 22 && P.ground) { out.face = Math.sign(lp.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'light the lock lamp'; } else out.why = 'to a lock lamp'; return out; } }
  /* 4b. WINDED (the lab's stamina rest): off him, out of his sword, still lit (the burn goes on at FK.burnR) */
  if (s.rest) { out.gx = clamp(kx + side * (FK.cutReach + 26)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him, the lantern on him'; return out; }
  /* 5. THE STANCE FIGHT */
  const st = S.want && e.mode === 'stanceTell' ? S.stance : S.stance;
  if (committed(e) && e.mode !== 'cut' && e.mode !== 'lunge' && e.mode !== 'stepCut') { if (dx < hitR && same) { swing(kx); out.gx = P.x; out.why = 'cut him in his recovery'; return out; } out.gx = clamp(kx + side * (hitR - 8)); out.face = Math.sign(kx - P.x) || 1; out.why = 'in on his recovery'; return out; }
  const wrong = roll('ang' + S.act + st, PLAN.missAngle) && !s.v2;
  const ang = wrong ? (st === 'high' ? 'high' : 'low') : st === 'high' ? 'low' : st === 'low' ? 'high' : 'plunge';
  if (dx > hitR + 26) { out.gx = clamp(kx + side * (hitR - 6)); out.face = Math.sign(kx - P.x) || 1; out.why = 'in to him'; return out; }
  out.face = Math.sign(kx - P.x) || 1;
  if (ang === 'low') { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in for the low cut'; return out; } out.gx = P.x; if (P.ground) { out.down = true; out.atk = P.atk < 0; } out.why = 'GUARDS HIGH: hit low'; return out; }
  if (ang === 'high') { if (dx > hitR + 4) { out.gx = clamp(kx + side * (hitR - 6)); out.why = 'in for the jump cut'; return out; }
    out.gx = P.x; if (P.ground) { out.jump = true; out.why = 'GUARDS LOW: up'; return out; } if (P.y < e.y - 10) out.atk = P.atk < 0; out.why = 'GUARDS LOW: cut from the jump'; return out; }
  /* the plunge: up close, jump, and come down on him */
  if (P.ground) { if (dx > 14) { out.gx = clamp(kx + side * 6); out.why = 'under him for the plunge'; return out; } out.jump = true; out.gx = kx; out.why = 'FULL GUARD: up for the plunge'; return out; }
  out.gx = kx; if (P.y < e.y - 30 && Math.abs(P.x - kx) < 14) { out.down = true; out.atk = P.atk < 0; out.why = 'FULL GUARD: plunge'; } else out.why = 'over him'; return out;
}
