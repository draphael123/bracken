// src/fog-knight.js - THE FOG KNIGHT, THE TOWPATH's boss. THE FOG KNIGHT 2 (claude/towpath2, the OPUS rework, 2026-10-14; scratch/brief-towpath2.md section 5 -
// Daniel 10-10: "he must look like an armoured knight CONSUMED BY FOG, play into the mechanic and use the canals, and have 3-5 MORE attacks (he really has two)".
// The interview: all four new moves). The first greybox (claude/towpath, 10-08) gave his stance fight, the burn, the bridge, the double and the shroud: kept.
//
// WHAT HE IS: an armoured knight the fog of the locks has CONSUMED - rust-black plate hung with weed, a cracked great helm with fog spilling from the eye slit,
//   plates missing where the fog shows through, the lower body dissolving into mist (he GLIDES - over the cut's water too), the sword trailing mist. Nobody
//   is inside any more. (The art lane draws him at the Crusader's scale; this file draws the greybox.)
// WHAT HE IS (design standard B11): A DUELIST, ALWAYS HITTABLE, GUARDING BY ANGLE - THE STANCE FIGHT. On guard he holds one of three stances, told as he takes
//   it (the word over him, the pose, the fog, and an arrow at where to hit): GUARDS HIGH (shield up, the visor glowing) - a LOW blow lands (a crouched cut,
//   the sweep, a low poke); GUARDS LOW (sword planted, fog pooling round his greaves) - a HIGH blow lands (a jump attack, the rising cut, the air up-swing) or
//   a plunge; FULL GUARD (the fog wrapped round him like a cloak) - only a PLUNGE lands, and it BREAKS the guard: he REELS (every blow lands). The wrong angle
//   CLANKS and names the stance (src/boss-read.js's shared read, B10). In his own blows - the swing, the lunge, the lash, the surge, the spears, the plunge and
//   the recovery after each - he is committed: every blow lands. He is on src/boss-greed.js FULL_DAMAGE (no global chip; greed is still counted).
// HIS OPENINGS ARE THE RULE'S (B1): FOG IS HIS BODY -
//   THE LANTERN BURNS IT: lit and near him, your lantern burns the fog out of the armour (a BURN bar fills: FK.burnT s of light within FK.burnR). Full, the
//     armour STANDS EMPTY: OPEN (FK.openT s; B10: a gold ring and a timer bar), a blow x FK.openMul, one opening FK.openCap of him at most. A blow that lands
//     on you gutters the lantern (E lights it again).
//   THE SWING BRIDGE SCATTERS HIM: struck while he is in its arc, the swinging deck goes through him: the armour stands EMPTY - OPEN FK.scatterT s.
//   B3: when an opening ends the fog pours back - a TOLD FK.wardT s WARD. B4: open, he stands where he is.
// THE LEVEL'S RULE IN THE FIGHT (B17: the central mechanic is the level's own): THE FOG LIES ON THE LOW WATER. The arena's FOG LINE lies over the cut's water -
//   knee-deep at dusk (phase one), over your head as the fog rises (phase two: FK.fogH rows), and the shroud over everything at night (phase three). IN THE
//   FOG and dim, he loses you (his lunge and his lash go where he last saw you) and his tells come late; ABOVE IT - on a bollard, a gate beam, the upper quay,
//   or THE ARENA LOCK's punt FILLED up out of the fog - the air is clear: his tells come early, and he sees you (and lashes you down). The lock's paddle
//   fills or drains it: FILL to see, DRAIN to hide. The lock drained also grounds his double.
// HIS MOVES (B17: eight distinct told answers; B16: each its own windup and release pose; one windup at a time). DANIEL'S EXPLICIT CALL (10-10 interview): MORE
//   THAN B5's one new move a phase - phase one brings the lash, two the surge and the double, three the spears, the dissolve plunge and the shroud's step:
//   HIS SWORD (! a shield turns it, a parry opens him) - THE FOG LUNGE (!! no shield: roll in its last beat) - THE TOWROPE LASH (!! a rusted mooring chain
//   hurled at you: it HOOKS you and DRAGS you to him across the water - roll it or jump it, no shield; up high and seen, it hooks you down) - THE LOCK SURGE
//   (!! he strikes the lock gate and a wall of canal water sweeps the towpath: get up high - a bollard, a gate beam, the quay, a punt) - THE FOG SPEARS (!! a
//   told line of lances bursting from the bank: the spots show in a light; step off the line or get up on a beam) - THE DISSOLVE PLUNGE (!! he melts into the
//   fog and drops, sword down, onto a LIT spot - your lantern, or a lamp if you dim it; a told shadow and glow first; move off it - it is his once-a-cycle
//   blink: never in or right after his opening, and he lands where you can follow, stuck in the stones) - THE FOG DOUBLE (phase two: a second knight of mist
//   a beat late from the other side of you; the real one's visor glows; draining the lock grounds it) - OUT OF THE SHROUD (phase three: he steps out of the
//   fog at your back with a told cut; the two lock lamps struck alight thin the shroud).
// PURE: no DOM, no main.js. The world is a context `c` (src/fog-knight-hands.js binds it). fkPlan is the boss lab's HUMAN bot (src/lab.js).

export const FK = {
  hp: 1850, w: 18, h: 34, markH: 50,
  openMul: 1.6, openCap: 0.12, openT: 3.4, scatterT: 3.0, wardT: 3.0, reelT: 1.1, burnT: 3.6, fireBurn: 0.06, burnR: 84, burnDecay: 0.35, arcR: 34,
  p2: 0.66, p3: 0.33,
  walk: 62, keep: 40, turn: 0.3, gap: [0.75, 0.65, 0.55],
  stanceTell: [0.5, 0.42, 0.36], litEarly: 0.18, darkLate: 0.14, cutDark: 0.06,
  cutTell: 0.62, cutT: 0.16, cutReach: 46, cutRec: 0.55,
  lungeTell: 0.8, lungeT: 0.26, lungeV: 420, lungeRec: 0.7, lungeRange: 150, lungeBeat: 0.22,
  /* THE TOWROPE LASH: told lashTell s; the chain's head flies lashV px/s up to lashLen px toward where he sees you; a hook drags you dragV px/s toward him for at
     most dragT s (to dragTo px off him), and he follows it with a told cut; lashRec s committed after. highLash: a seen hero this far over his floor is lashed down */
  lashTell: 0.85, lashV: 360, lashLen: 230, dragV: 300, dragT: 0.7, dragTo: 30, lashRec: 0.6, highLash: 40, highLashCd: 2.6,
  /* THE LOCK SURGE: told surgeTell s at the gate; the wall of water runs surgeV px/s west from the lower gate, surgeH px deep; surgeRec s committed */
  surgeTell: 1.2, surgeV: 300, surgeH: 26, surgeRec: 1.0, surgeKnock: 170,
  /* THE FOG SPEARS: told spearTell s; spearN spots spearGap px apart round you; each lance stands spearT s, spearH px tall, the next spearStep s after; spearRec s */
  spearTell: 1.1, spearN: 5, spearGap: 22, spearT: 0.26, spearH: 46, spearStep: 0.06, spearRec: 0.8,
  /* THE DISSOLVE PLUNGE: sinkTell s melting into the fog, goneT s gone, plungeTell s of shadow and glow on the lit spot, the drop, plungeR px, plungeRec s stuck */
  sinkTell: 0.6, goneT: 0.7, plungeTell: 0.75, plungeR: 24, plungeRec: 1.2, plungeAfterOpen: 3.0,
  doubleTell: 0.7, doubleLag: 0.55, refill: 12, drainT: 1.4,
  shroudTell: 1.0, stepTell: 0.55, dissolveT: 0.5, reformD: 60, chainHits: 3, chainT: 2.0,
  fogH: [1, 3], lastSeenEvery: 1.2,
  dmg: { cut: 30, lunge: 32, double: 20, step: 32, lash: 14, surge: 26, spear: 24, plunge: 34 },
};
/* EVERY CYCLE CHANGES: the order of each pass, by phase (cycle k uses [k % n]); 'high' / 'low' / 'full' = take that stance (told) */
export const CYCLES = {
  1: [['high', 'cut', 'lash', 'low', 'cut'], ['low', 'lunge', 'full', 'cut', 'lash'], ['full', 'lash', 'high', 'cut', 'lunge', 'low', 'cut']],
  2: [['surge', 'high', 'cut', 'double', 'lash', 'low', 'cut'], ['low', 'lunge', 'full', 'surge', 'cut', 'high', 'lash'], ['double', 'high', 'cut', 'lunge', 'surge', 'low', 'cut']],
  3: [['spears', 'high', 'cut', 'dplunge', 'low', 'lunge'], ['full', 'lash', 'step', 'spears', 'low', 'cut', 'surge'], ['low', 'dplunge', 'high', 'spears', 'cut', 'full', 'lunge', 'double']],
};
/* the move each phase brings (tools/towpath.mjs: Daniel's call - more than one a phase) */
export const PHASE_NEW = { 1: ['lash'], 2: ['surge', 'double'], 3: ['spears', 'dplunge', 'step'] };
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  stanceTell: { mark: '', answer: '' }, cutTell: { mark: '!', answer: 'block' }, lungeTell: { mark: '!!', answer: 'dodge' }, doubleTell: { mark: '', answer: '' },
  shroudTell: { mark: '', answer: '' }, stepTell: { mark: '!', answer: 'block' },
  lashTell: { mark: '!!', answer: 'jump' }, surgeTell: { mark: '!!', answer: 'jump' }, spearTell: { mark: '!!', answer: 'dodge' }, sinkTell: { mark: '!!', answer: 'dodge' }, plungeTell: { mark: '!!', answer: 'dodge' },
};
export const MOVE_NAME = { cut: 'HIS SWORD', lunge: 'THE FOG LUNGE', double: 'THE FOG DOUBLE', step: 'OUT OF THE SHROUD', lash: 'THE TOWROPE LASH', surge: 'THE LOCK SURGE', spear: 'THE FOG SPEARS', plunge: 'THE DISSOLVE PLUNGE' };
/* each told move's word over him as it winds up (B5: sound + word + colour) */
export const MOVE_WORD = { lashTell: 'THE TOWROPE: ROLL OR JUMP IT', surgeTell: 'THE LOCK SURGE: GET UP HIGH', spearTell: 'FOG SPEARS: OFF THE LINE', sinkTell: 'HE SINKS INTO THE FOG', plungeTell: 'HE DROPS ON THE LIGHT: MOVE' };
export const STANCE_WORD = { high: 'GUARDS HIGH', low: 'GUARDS LOW', full: 'FULL GUARD' };
export const STANCE_HOW = { high: 'GUARDS HIGH: HIT LOW', low: 'GUARDS LOW: HIT HIGH', full: 'FULL GUARD: PLUNGE ON HIM' };

/* ---------- THE TOWPATH'S END (the arena) ----------
   local columns 0..51, the floor's surface row R (the hero stands on R-1). THE CUT (16-20) under its SWING BRIDGE (capstans 14 and 22); three BOLLARDS (two rows
   high: over the surge); the GATE BEAMS (one-way: the plunge's heights, over the surge and the spears); THE ARENA LOCK (41-47) with its punt - its lower gate at
   40, its upper quay (48-51) six rows up; its paddles: on the bank (39), on the punt (47), on the quay (49); two LOCK LAMPS (phase three) */
export const FK_STAGE = { W: 52, door: 5, cut: [16, 20], caps: [14, 22], bollards: [8, 27, 34],
  beams: [{ x0: 3, x1: 9, dy: 4 }, { x0: 24, x1: 31, dy: 4 }, { x0: 33, x1: 39, dy: 5 }, { x0: 44, x1: 51, dy: 9 }],
  lock: { x0: 41, x1: 47, gate: 40, bed: 4, lo: 1, hi: -6, quay: 48 }, paddles: [39, 47, 49], lamps: [6, 36], him: 30 };
export function stageFogKnight(W, T, TS, sx, R, O = 22) {
  const { set, block, ent, air, boards } = W, S = FK_STAGE, ex = sx + S.W, K = S.lock;
  const pools = [], bridges = [], lamps = [], locks = [], movers = [];
  const carve = () => {
    air(sx, ex - 1, R - 18, R - 1); block(sx, ex - 1, R, R + 40);
    block(sx - 1, sx - 1, R - 22, R - S.door - 1);                       /* the west wall over the way in (shut behind you) */
    block(sx - 1, ex, R - 22, R - 19);                                    /* the night sky's lid: the lock-house's eaves, the warehouse lintels */
    const [c0, c1] = S.cut; air(sx + c0, sx + c1, R, R + 5);
    pools.push({ x0: (sx + c0) * TS, x1: (sx + c1 + 1) * TS, y: (R + 1 + O) * TS + 4, shallow: false, swim: false, clear: true, bottom: (R + 6 + O) * TS, tp: 'fkCut' });
    bridges.push({ id: 'fkBridge', x0: sx + c0, x1: sx + c1, row: R, init: 'across', arena: true }); boards(sx + c0, sx + c1, R);
    for (const c of S.caps) ent('tpcapstan', sx + c, R - 1, { bridge: 'fkBridge', arena: true });
    for (const c of S.bollards) block(sx + c, sx + c, R - 2, R - 1);
    /* THE ARENA LOCK: a real chamber - its water an engine pool, its punt riding it, its lower gate shut while the water stands over the floor; it starts FULL */
    const x0 = sx + K.x0, x1 = sx + K.x1, bed = R + K.bed, lo = R + K.lo, hi = R + K.hi;
    air(x0, x1, hi - 3, bed - 1); block(x0, x1, bed, R + 40); block(sx + K.quay, ex - 1, hi, R + 40);
    pools.push({ x0: x0 * TS, x1: (x1 + 1) * TS, y: (hi + O) * TS + 4, shallow: false, swim: false, clear: true, bottom: (bed + O) * TS, tp: 'fkLock' });
    locks.push({ id: 'fkLock', x0, x1, bed, lo, hi, init: 'hi', arena: true, refill: FK.refill, gate: { x: sx + K.gate, top: hi, bot: R - 1 }, shallowLo: false, race: false });
    movers.push({ mover: { kind: 'punt', towpath: 'fkLock', x: x0 * TS, y: 0, w: (x1 - x0 + 1) * TS, h: 8, arena: true }, band: [x0, x1, hi + O, lo + O] });
    for (const b of S.beams) boards(sx + b.x0, sx + b.x1, R - b.dy);   /* (the beams after the lock's carve: the upper gate's beam spans its chamber) */
    ent('tppaddle', sx + S.paddles[0], R - 1, { lock: 'fkLock', arena: true }); ent('tppaddle', sx + S.paddles[1], lo - 1, { lock: 'fkLock', arena: true }); ent('tppaddle', sx + S.paddles[2], hi - 1, { lock: 'fkLock', arena: true });
    for (const c of S.lamps) { lamps.push({ x: sx + c, y: R - 1, lit: false, arena: true }); ent('tplamp', sx + c, R - 1, { arena: true }); }
    ent('fogknight', sx + S.him, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: (R + O) * TS, trigger: (sx + 3) * TS, wallL: sx - 1, wallR: ex, boss: 'fogknight', music: 'fogknight',
    tint: '#5a6a78', tintA: 0.1, start: [sx + 4, R - 1 + O], y0: (R - 18 + O) * TS, y1: (R + 1 + O) * TS, fk: { sx, R: R + O } };
  return { arena, carve, pools, bridges, lamps, locks, movers };
}
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.fk, X = c => (q.sx + c) * TS, S = FK_STAGE, K = S.lock;
  return { TS, x0: X(0), x1: X(S.W), floorY: q.R * TS, cut: [X(S.cut[0]), X(S.cut[1] + 1)], cutMid: (X(S.cut[0]) + X(S.cut[1] + 1)) / 2, caps: S.caps.map(c => X(c) + 8),
    paddle: X(S.paddles[0]) + 8, paddles: S.paddles.map(c => X(c) + 8), lamps: S.lamps.map(c => X(c) + 8), beams: S.beams.map(b => ({ x0: X(b.x0), x1: X(b.x1 + 1), y: (q.R - b.dy) * TS })),
    bollards: S.bollards.map(c => ({ x0: X(c), x1: X(c + 1), y: (q.R - 2) * TS })), gateX: X(K.gate), lockX: [X(K.x0), X(K.x1 + 1)], quayY: (q.R + K.hi) * TS, quayX: X(K.quay) };
}
/* THE ARENA'S FOG LINE (px): over the cut's water, by phase (the shroud, phase three, is the hands' - it floods everything clear only in light) */
export const fogTop = (S) => S.G.floorY + 16 - 16 * (FK.fogH[Math.min(S.ph, 2) - 1] + 1);

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, openTaken: 0, burn: 0, behindT: 0, why: '', stance: 'high', want: null,
    seenX: null, seenY: null, seenT: 0, dbl: null, hist: [], clock: 0, reformUsed: false, chain: [], told: {}, shroud: 0, lunge: null, stepTo: null,
    lash: null, hooked: null, wave: null, spears: null, plunge: null, sinceOpen: 99, highLashT: 0, lashCut: false,
    n: { cycles: 0, opens: 0, burns: 0, scatters: 0, wards: 0, warded: 0, turned: 0, landed: 0, reels: 0, plunges: 0, lunges: 0, cuts: 0, doubles: 0, grounded: 0, steps: 0, reforms: 0, soon: 0,
      lashes: 0, hooks: 0, surges: 0, surgeHits: 0, spearSets: 0, spearHits: 0, dplunges: 0, dplungeHits: 0, highLashes: 0, moves: {} } };
}
export const fPhase = e => (e.hp <= e.maxHp * FK.p3 ? 3 : e.hp <= e.maxHp * FK.p2 ? 2 : 1);
export const fkOpen = e => !!e && (e.mode === 'empty') && (e.open || 0) > 0;
const STRIKE = new Set(['cut', 'lunge', 'stepCut', 'lash', 'surge', 'spears', 'plunge']);
const COMMITTED = new Set(['cut', 'cutRec', 'lunge', 'lungeRec', 'stepCut', 'reel', 'lash', 'lashRec', 'surge', 'surgeRec', 'spears', 'spearRec', 'plunge', 'plungeRec']);
const GUARD_MODES = new Set(['walk', 'recover', 'stanceTell', 'cutTell', 'lungeTell', 'doubleTell', 'shroudTell', 'stepTell', 'lashTell', 'surgeTell', 'spearTell']);
const GONE = new Set(['dissolve', 'gone', 'sinkTell', 'plungeTell']);
export const committed = e => !!e && COMMITTED.has(e.mode);
export const fkGone = e => !!e && GONE.has(e.mode);
/* THE ANGLE a blow beats a stance with: true = it lands */
export const beatsStance = (stance, angle) => stance === 'high' ? angle === 'low' : stance === 'low' ? (angle === 'high' || angle === 'plunge') : stance === 'full' ? angle === 'plunge' : true;
/* WHAT A BLOW TAKES OFF HIM: { k (multiplier), word (when turned), reel (a plunge broke the full guard) }. angle: 'low' | 'mid' | 'high' | 'plunge' | 'burn' */
export function takeAt(e, S, angle) {
  if (!e || e.mode === 'sleep' || e.mode === 'wake') return { k: 0, word: '' };
  if (GONE.has(e.mode)) return { k: 0, word: 'NOT THERE' };
  if (S.ward > 0) return { k: 0, word: 'WARDED' };
  if (fkOpen(e)) return { k: FK.openMul, word: '' };
  if (angle === 'burn') return { k: 0.5, word: '' };   /* (fire burns fog: a burn tick lands at half, whatever his stance) */
  if (angle === 'fire') { S.burn = Math.min(0.95, S.burn + FK.fireBurn); return { k: 0.5, word: '' }; }   /* (a thrown flame burns the fog as the lantern does: half a blow, and it feeds THE BURN) */
  if (COMMITTED.has(e.mode)) return { k: 1, word: '' };
  if (GUARD_MODES.has(e.mode)) { if (beatsStance(S.stance, angle)) return { k: 1, word: '', reel: S.stance === 'full' }; return { k: 0, word: STANCE_WORD[S.stance] }; }
  return { k: 1, word: '' };
}

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 16, Math.min(G.x1 - 16, x));
/* a spot he can stand on / land on: the towpath, not the cut (he lands where you can follow, B12) nor in the lock's chamber */
const footX = (G, x) => { x = clampX(G, x); const [c0, c1] = G.cut; if (x > c0 - 10 && x < c1 + 10) x = x < (c0 + c1) / 2 ? c0 - 12 : c1 + 12; if (x > G.gateX - 8) x = G.gateX - 14; return x; };
const tellLen = (S, base, lit, cut) => cut ? base - (lit ? 0 : FK.cutDark) : Math.max(0.2, base + (lit ? 0 : -FK.darkLate) - (S.ph === 3 && !lit ? 0.04 : 0));   /* HIS CUTS ARE READ BY EVERY HERO: a dim hero reads the cut at most FK.cutDark late */
const BIG_TELL = { lashTell: 1, surgeTell: 1, spearTell: 1, sinkTell: 1, plungeTell: 1 };
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell');
  if (BIG_TELL[mode] && MOVE_WORD[mode]) c.word(e, MOVE_WORD[mode], mode); }
function endOpen(e, S, c) { e.open = 0; S.ward = FK.wardT; S.n.wards++; S.openTaken = 0; S.burn = 0; S.sinceOpen = 0; c.number(e.x, e.y - 74, 'THE FOG POURS BACK INTO HIM', '#9ab0c0'); c.sound('tell'); c.fx('ward', e.x, e.y); }
function open(e, S, c, why) { setMode(e, 'empty', (why === 'scatter' ? FK.scatterT : FK.openT) + 0.05); e.open = why === 'scatter' ? FK.scatterT : FK.openT; S.openTaken = 0; S.n.opens++; S.burn = 0; S.lunge = null; S.lash = null; S.hooked = null;
  if (why === 'scatter') S.n.scatters++; else S.n.burns++; c.fx('open', e.x, e.y); c.sound('open');
  c.number(e.x, e.y - 74, why === 'scatter' ? 'THE BRIDGE SCATTERS THE FOG: THE ARMOUR STANDS EMPTY' : 'THE LANTERN BURNS THE FOG OUT: THE ARMOUR STANDS EMPTY', '#8fd160'); }
const canOpen = (e, S) => !!e && e.alive && e.mode !== 'sleep' && e.mode !== 'wake' && !GONE.has(e.mode) && !fkOpen(e) && !(S.ward > 0);

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

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, lit, dodge, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.hook(pp, dmg, name, key) -> hooked   c.drag(pp, toX, v, dt)   c.knock(pp, vx)   c.number(x, y, line, col)
   c.word(e, line, mode)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)  c.time()   c.lockFull() -> the arena lock stands full
   c.lampsLit() -> how many lock lamps burn   c.lamps() -> [{ x, lit }]   c.light(x, y) -> 0..1 light on that spot   c.shrouded() -> the shroud is down ---------- */
/* is this hero SEEN by him: lit, at his elbow, or above the fog line (not under the shroud) */
export const seesHero = (e, S, q, c) => !!q && (q.lit || Math.abs(q.x - e.x) < 46 || (S.ph < 3 && q.y - 20 < fogTop(S)));
export function stepFogKnight(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; if (!GONE.has(e.mode) && e.mode !== 'plunge') e.y = G.floorY; S.clock += dt; S.sinceOpen += dt; S.highLashT = Math.max(0, S.highLashT - dt);
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  /* WHAT HE SEES: a lit hero, one above the fog line, or one at his elbow - otherwise the place he last saw him (refreshed now and then: the fog shows a shape) */
  const seen = seesHero(e, S, P, c), lit = !!(P && (P.lit || (S.ph < 3 && P.y - 20 < fogTop(S))));
  if (P && seen) { S.seenX = P.x; S.seenY = P.y; S.seenT = 0; } else { S.seenT += dt; if (S.seenX === null || S.seenT > FK.lastSeenEvery) { S.seenX = P ? P.x : e.x; S.seenY = G.floorY; S.seenT = 0; } }
  const tx = S.seenX ?? (P ? P.x : e.x);
  /* THE BURN (the rule): a lit lantern within FK.burnR burns the fog out of him; out of it, the fog comes back slowly */
  if (canOpen(e, S) && !COMMITTED.has(e.mode)) { const burning = h.some(q => q.alive && q.lit && Math.abs(q.x - e.x) < FK.burnR && Math.abs(q.y - e.y) < 60);
    if (burning) S.burn = Math.min(1, S.burn + dt / FK.burnT); else S.burn = Math.max(0, S.burn - dt * FK.burnDecay);
    if (S.burn >= 1 && !STRIKE.has(e.mode) && !/Tell$/.test(e.mode)) { open(e, S, c, 'burn'); return; } }
  else if (S.ward > 0) S.burn = 0;
  stepDouble(e, S, dt, h, c); stepChain(e, S, dt, h, c); stepWave(e, S, dt, h, c); stepSpears(e, S, dt, h, c);
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
        if (S.stepCut) { S.stepCut = false; tell(e, S, c, 'stepTell', tellLen(S, FK.stepTell, lit, true)); } else setMode(e, 'recover', 0.3); } return;
    case 'walk': {
      const d = tx - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > FK.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      if (Math.abs(d) > FK.keep) e.x = clampX(G, e.x + Math.sign(d) * FK.walk * dt);
      else if (Math.abs(d) < FK.keep - 22) e.x = clampX(G, e.x - Math.sign(d) * FK.walk * 0.5 * dt);
      if (e.modeT <= 0) nextMove(e, S, P, c, lit); return; }
  }
  stepMove(e, S, dt, P, h, c, lit, tx);
}
/* a blink (the shroud's step, the dissolve plunge, the re-form) is his once a cycle, never in or right after his own opening (B12) */
const canBlink = S => !S.reformUsed && !(S.ward > 0) && S.sinceOpen > FK.plungeAfterOpen;
function nextMove(e, S, P, c, lit) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; S.reformUsed = false; }
  let m = S.script[S.step++]; const tx = S.seenX ?? P.x, dx = tx - e.x, ad = Math.abs(dx);
  e.face = Math.sign(dx) || e.face;
  /* UP HIGH AND SEEN: a hero STOOD over his floor (a beam, the quay, the lock filled - not one in a jump) is out of his sword - he LASHES you down (seen, not hidden in the fog) */
  if (P && P.ground && seesHero(e, S, P, c) && P.y < S.G.floorY - FK.highLash && S.highLashT <= 0 && m !== 'surge' && m !== 'dplunge') { m = 'lash'; S.highLashT = FK.highLashCd; S.n.highLashes++; S.step--; }
  if (m === 'double' && (S.dbl || !c.lockFull())) m = 'cut';
  if (m === 'step' && (S.ph < 3 || !canBlink(S))) m = 'cut';
  if (m === 'dplunge' && (S.ph < 3 || !canBlink(S))) m = 'lunge';
  if (m === 'cut' && ad > FK.cutReach + 30) { setMode(e, 'walk', 0.45); S.step--; return; }   /* out of his reach: he closes first */
  if (m === 'lunge' && ad > FK.lungeRange + 40) { setMode(e, 'walk', 0.45); S.step--; return; }
  switch (m) {
    case 'high': case 'low': case 'full': S.want = m; tell(e, S, c, 'stanceTell', tellLen(S, FK.stanceTell[S.ph - 1] + (lit ? FK.litEarly : 0), lit)); return;
    case 'cut': tell(e, S, c, 'cutTell', tellLen(S, FK.cutTell, lit, true)); return;
    case 'lunge': tell(e, S, c, 'lungeTell', tellLen(S, FK.lungeTell, lit)); S.lunge = { to: tx, t0: e.modeT }; return;
    case 'lash': tell(e, S, c, 'lashTell', tellLen(S, FK.lashTell + (lit ? FK.litEarly : 0), lit)); S.n.lashes++; return;
    case 'surge': e.face = 1; tell(e, S, c, 'surgeTell', tellLen(S, FK.surgeTell + (lit ? FK.litEarly : 0), lit)); S.n.surges++; return;
    case 'spears': { tell(e, S, c, 'spearTell', tellLen(S, FK.spearTell + (lit ? FK.litEarly : 0), lit)); S.n.spearSets++;
      const mid = Math.max(S.G.x0 + 40, Math.min(S.G.x1 - 40, tx)), n = FK.spearN, start = mid - (n - 1) / 2 * FK.spearGap, dir = Math.sign(mid - e.x) || 1;
      S.spears = { spots: Array.from({ length: n }, (_, i) => ({ x: start + i * FK.spearGap, t: 0, on: false, done: false })).sort((a, b) => dir * (a.x - b.x)), t: 0, live: false, key: S.act, hit: new Set() }; return; }
    case 'dplunge': S.reformUsed = true; tell(e, S, c, 'sinkTell', FK.sinkTell); S.n.dplunges++; S.plunge = { x: null, key: S.act }; c.fx('dissolve', e.x, e.y); return;
    case 'double': tell(e, S, c, 'doubleTell', FK.doubleTell); return;
    case 'step': S.reformUsed = true; tell(e, S, c, 'shroudTell', 0.6); S.stepTo = footX(S.G, P.x - (P.face || 1) * 34); return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c, lit, tx) {
  const G = S.G, f = e.face || 1, after = t => setMode(e, 'recover', t ?? FK.gap[S.ph - 1]);
  switch (e.mode) {
    case 'stanceTell': if (e.modeT <= 0) { S.stance = S.want || S.stance; S.want = null; after(0.25); } return;
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
    /* THE TOWROPE LASH: he whirls the chain (told), then hurls it at where he sees you - at your height, so a jump clears it on the towpath, a roll passes it */
    case 'lashTell': { const ty = (S.seenY ?? G.floorY) - 14; e.face = Math.sign(tx - e.x) || f;
      if (e.modeT <= 0) { const sx = e.x + e.face * 10, sy = e.y - 22, ddx = tx - sx, ddy = ty - sy, dd = Math.hypot(ddx, ddy) || 1;
        S.lash = { x: sx, y: sy, ux: ddx / dd, uy: ddy / dd, len: 0, back: false, key: 'lash' + S.act }; setMode(e, 'lash', 2); c.sound('lunge'); } return; }
    case 'lash': if (!S.lash && !S.hooked) { setMode(e, 'lashRec', FK.lashRec); } else if (S.hooked && S.hooked.done) { const hk = S.hooked; S.hooked = null; S.lash = null;
        e.face = Math.sign(hk.pp.x - e.x) || f; tell(e, S, c, 'cutTell', tellLen(S, FK.cutTell, true, true)); } return;
    case 'lashRec': if (e.modeT <= 0) after(); return;
    /* THE LOCK SURGE: he turns to the gate and raises the sword (told); it strikes the stones and the gate lets a wall of water down the towpath */
    case 'surgeTell': if (e.modeT <= 0) { setMode(e, 'surge', 0.3); c.sound('slash'); c.shake(5); S.wave = { x: G.gateX, v: FK.surgeV, key: 'surge' + S.act, done: new Set() }; c.fx('surge', G.gateX, G.floorY); } return;
    case 'surge': if (e.modeT <= 0) setMode(e, 'surgeRec', FK.surgeRec); return;
    case 'surgeRec': if (e.modeT <= 0) after(); return;
    /* THE FOG SPEARS: kneeling, the sword in the canal (told: the spots on the bank); the lances burst along the line */
    case 'spearTell': if (e.modeT <= 0) { setMode(e, 'spears', 0.1 + FK.spearN * FK.spearStep + FK.spearT); if (S.spears) S.spears.live = true; c.sound('slash'); } return;
    case 'spears': if (e.modeT <= 0) setMode(e, 'spearRec', FK.spearRec); return;
    case 'spearRec': if (e.modeT <= 0) after(); return;
    /* THE DISSOLVE PLUNGE: he melts into the fog bank (told), is gone, and his shadow and glow come on the lit spot - then the drop, sword down */
    case 'sinkTell': if (e.modeT <= 0) { setMode(e, 'gone', FK.goneT); } return;
    case 'gone': if (e.modeT <= 0) { const spot = litSpot(e, S, P, c); S.plunge = { x: footX(G, spot), key: S.plunge ? S.plunge.key : S.act }; tell(e, S, c, 'plungeTell', FK.plungeTell); } return;
    case 'plungeTell': if (e.modeT <= 0) { e.x = S.plunge.x; e.y = G.floorY - 120; setMode(e, 'plunge', 0.14); c.sound('lunge'); } return;
    case 'plunge': { e.y = Math.min(G.floorY, e.y + 900 * dt); if (e.y >= G.floorY - 1 || e.modeT <= 0) { e.y = G.floorY; c.shake(6); c.fx('mist', e.x, e.y); const x = e.x, r = FK.plungeR;
        if (c.hit([x - r, x + r, G.floorY - 34, G.floorY], FK.dmg.plunge, MOVE_NAME.plunge, { key: 'plunge' + S.act })) S.n.dplungeHits++; S.plunge = null; setMode(e, 'plungeRec', FK.plungeRec); } return; }
    case 'plungeRec': if (e.modeT <= 0) after(); return;
    case 'doubleTell': if (e.modeT <= 0) { if (c.lockFull() && !S.dbl) { S.dbl = { x: e.x, face: -f, stance: S.stance, mode: 'walk', y: e.y }; S.n.doubles++; c.fx('double', e.x, e.y);
        if (!S.told.dbl) { S.told.dbl = 1; c.number(e.x, e.y - 80, "A SECOND KNIGHT OF MIST: THE REAL ONE'S VISOR GLOWS", '#ffd36b'); } } after(0.4); } return;
    case 'shroudTell': if (e.modeT <= 0) { setMode(e, 'dissolve', FK.dissolveT); S.n.steps++; c.fx('dissolve', e.x, e.y); S.stepCut = true; } return;
    case 'stepTell': if (e.modeT <= 0) { setMode(e, 'stepCut', FK.cutT); c.sound('slash'); } return;
    case 'stepCut': c.hit([f > 0 ? e.x - 4 : e.x - FK.cutReach, f > 0 ? e.x + FK.cutReach : e.x + 4, e.y - 30, e.y], FK.dmg.step, MOVE_NAME.step, { blockable: true, key: 'step' + S.act });
      if (e.modeT <= 0) setMode(e, 'cutRec', FK.cutRec); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* the LIT SPOT he drops on: a lit hero; dim, the nearest lamp alight to you (a lamp is light too); no light anywhere, where he last saw you */
function litSpot(e, S, P, c) {
  if (P && P.lit) return P.x;
  const lamps = (c.lamps ? c.lamps() : []).filter(l => l.lit).sort((a, b) => Math.abs(a.x - (P ? P.x : e.x)) - Math.abs(b.x - (P ? P.x : e.x)));
  if (lamps.length && Math.abs(lamps[0].x - (P ? P.x : e.x)) < 220) return lamps[0].x;
  return S.seenX ?? (P ? P.x : e.x);
}
/* THE CHAIN in flight: its head runs out along its line; a hero it meets (not rolling) is HOOKED and dragged to him; it comes back when spent */
function stepChain(e, S, dt, h, c) {
  const L = S.lash;
  if (S.hooked) { const hk = S.hooked; hk.t += dt; const pp = hk.pp, q = h.find(z => z.pp === pp);
    if (!q || !q.alive || hk.t > FK.dragT || Math.abs(q.x - e.x) <= FK.dragTo || fkOpen(e)) { hk.done = true; return; }
    c.drag(pp, e.x + Math.sign(q.x - e.x) * FK.dragTo, FK.dragV, dt); if (L) { L.x = q.x; L.y = q.y - 14; } return; }
  if (!L) return;
  const sp = FK.lashV * dt;
  if (!L.back) { L.len += sp; L.x += L.ux * sp; L.y += L.uy * sp;
    for (const q of h) { if (!q.alive) continue; if (Math.abs(q.x - L.x) < 10 && L.y > q.y - 24 && L.y < q.y + 2) {
        if (q.dodge) { if (!L.told) { L.told = 1; c.number(q.x, q.y - 40, 'ROLLED UNDER THE CHAIN', '#8fd160'); } continue; }
        if (c.hook(q.pp, FK.dmg.lash, MOVE_NAME.lash, L.key)) { S.n.hooks++; S.hooked = { pp: q.pp, t: 0, done: false }; c.number(q.x, q.y - 40, 'HOOKED: HE DRAGS YOU IN', '#ff6b6b'); return; } } }
    if (L.len >= FK.lashLen || L.y > S.G.floorY + 4 || L.x < S.G.x0 || L.x > S.G.x1) L.back = true; }
  else { const hx = e.x + (e.face || 1) * 10, hy = e.y - 22, ddx = hx - L.x, ddy = hy - L.y, dd = Math.hypot(ddx, ddy); if (dd < sp * 1.4) { S.lash = null; return; } L.x += ddx / dd * sp * 1.4; L.y += ddy / dd * sp * 1.4; }
}
/* THE WALL OF WATER: from the lower gate west along the towpath - anyone on the floor in its front is swept (no shield); up a row or more, it passes under */
function stepWave(e, S, dt, h, c) {
  const W = S.wave; if (!W) return; const G = S.G; W.x -= W.v * dt;
  for (const q of h) { if (!q.alive) continue; const onFloor = q.y > G.floorY - FK.surgeH && q.y <= G.floorY + 4;
    if (onFloor && !W.done.has(q.pp) && q.x < W.x + 8 && q.x > W.x - 18 && !(q.x > G.gateX)) { W.done.add(q.pp); if (c.hit([q.x - 2, q.x + 2, q.y - 10, q.y], FK.dmg.surge, MOVE_NAME.surge, { key: W.key, noKnock: true })) { S.n.surgeHits++; c.knock(q.pp, -FK.surgeKnock); } } }
  if (W.x < G.x0) S.wave = null;
}
/* THE LANCES: each spot bursts in its turn along the line */
function stepSpears(e, S, dt, h, c) {
  const Sp = S.spears; if (!Sp || !Sp.live) return; Sp.t += dt; const G = S.G; let left = 0;
  Sp.spots.forEach((s, i) => { const t0 = i * FK.spearStep; if (Sp.t >= t0 && Sp.t < t0 + FK.spearT) { s.on = true; for (const q of h) if (q.alive && !Sp.hit.has(q.pp) && q.x > s.x - 12 && q.x < s.x + 12 && q.y > G.floorY - FK.spearH) { Sp.hit.add(q.pp); if (c.hit([s.x - 7, s.x + 7, G.floorY - FK.spearH, G.floorY], FK.dmg.spear, MOVE_NAME.spear, { key: 'spear' + Sp.key })) S.n.spearHits++; } }
    else { if (s.on) s.done = true; s.on = false; } if (Sp.t < t0 + FK.spearT) left++; });
  if (!left) S.spears = null;
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
  D.face = Math.sign(P.x - D.x) || D.face; D.stance = past.stance; D.mode = past.mode === 'cutTell' || past.mode === 'cut' ? past.mode : 'walk';
  if (past.mode === 'cut') c.hit([D.face > 0 ? D.x - 4 : D.x - FK.cutReach, D.face > 0 ? D.x + FK.cutReach : D.x + 4, D.y - 30, D.y], FK.dmg.double, MOVE_NAME.double, { blockable: true, key: 'dbl' + past.act });
}
/* A LANDED BLOW (the hands call it after take): the chain of blows that makes him dissolve and re-form beside you (B12: once a cycle, never in or right after an opening) */
export function landed(e, S, c, heroX) {
  S.n.landed++; const t = S.clock; S.chain = S.chain.filter(q => t - q < FK.chainT); S.chain.push(t);
  if (S.chain.length >= FK.chainHits && canBlink(S) && !fkOpen(e) && e.mode !== 'reel' && !COMMITTED.has(e.mode) && e.hp > 0) {
    S.reformUsed = true; S.chain = []; S.n.reforms++; const side = Math.sign(e.x - heroX) || 1;
    S.stepTo = footX(S.G, heroX + side * FK.reformD); setMode(e, 'dissolve', FK.dissolveT); c.fx('dissolve', e.x, e.y); c.sound('tell'); }
}

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some. It keeps the LANTERN LIT (E, away from a
   gadget - E there works it) and stays near him to burn the fog out; it blocks or backs off the cut, rolls the lunge in its last beat (or stands outside its
   reach); it JUMPS THE CHAIN as it comes (or rolls it); at THE SURGE it gets up on the nearest bollard or beam (or jumps the wave as it comes); at THE SPEARS it
   steps off the line; at THE DISSOLVE PLUNGE it moves off the shadow and cuts him stuck in the stones; it reads his STANCE: GUARDS HIGH -> a crouched cut;
   GUARDS LOW -> a jump attack; FULL GUARD -> a jump and a plunge onto him; in his blows' recovery and when he reels, any cut. Open, it cuts him hard; warded,
   it waits off him. It strikes a capstan when he is in the bridge's arc and it stands by one; in phase two it drains the lock when a double stands and the
   paddle is near; in phase three it lights a lamp.
   s = { P: { x, y, face, ground, atk, lit, has }, e, S, reach, shield, t, rng, mem, v2, hero, gadgetNear, bridgeOpen, rest, noRoll, lamps } ->
       { gx, face, atk, jump, dodge, block, talk, up, down, why } */
export const PLAN = { react: 0.25, miss: 0.12, missAngle: 0.15 };
export function fkPlan(s) { const o = fkPlan0(s); if (s.S) s.S.botWhy = o.why; return o; }   /* (the last reading, kept on the fight for the tune lane's ledger) */
function fkPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const [c0, c1] = G.cut, onWest = P.x < c0, lo = onWest || !s.bridgeOpen ? G.x0 + 12 : c1 + 8, hi = Math.min(!onWest || !s.bridgeOpen ? G.x1 - 12 : c0 - 8, G.gateX - 10);
  const clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 26, hitR = reach + FK.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* 0. THE BRIDGE IS OPEN AND HE IS ACROSS THE CUT: swing it back from this bank's capstan (it never jumps the cut) */
  const across = (kx < c0) !== (P.x < c0);
  if (s.bridgeOpen && across && !fkOpen(e) && !fkGone(e)) { const cap = G.caps.slice().sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0];
    out.gx = clamp(cap + (P.x < cap ? -8 : 8)); if (Math.abs(P.x - cap) < 22 && P.ground) { out.face = Math.sign(cap - P.x) || 1; out.atk = P.atk < 0; out.gx = P.x; out.why = 'swing the bridge back'; } else out.why = 'to a capstan: the bridge is open'; return out; }
  /* 0b. HOOKED: it is dragging you - nothing to do but brace (the cut follows) */
  if (S.hooked) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; if (s.shield) out.block = true; out.why = 'hooked: brace for the cut'; return out; }
  /* 0c. THE WALL OF WATER coming: up on the nearest bollard or beam; failing that, jump it as it comes */
  if (S.wave || e.mode === 'surgeTell') { const wx = S.wave ? S.wave.x : G.gateX, seen = seenFor('sg' + S.act, s.v2 ? 0.1 : PLAN.react);
    if (seen && P.x < G.gateX) { if (P.y < G.floorY - FK.surgeH) { out.gx = P.x; out.why = 'up out of the surge'; return out; }
      const perches = (G.bollards || []).map(b => (b.x0 + b.x1) / 2).filter(x => x < G.gateX - 4 && !(x > c0 - 8 && x < c1 + 8)).sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x)), px = perches[0];
      const time = S.wave ? Math.max(0, (wx - P.x) / FK.surgeV) : e.modeT + (G.gateX - P.x) / FK.surgeV;
      if (px !== undefined && Math.abs(px - P.x) / 90 < time - 0.25) { out.gx = clamp(px); if (Math.abs(px - P.x) < 14 && P.ground) out.jump = true; out.why = 'to a bollard: the surge'; return out; }
      if (S.wave && wx - P.x < 46 && wx - P.x > 0 && P.ground) { out.jump = true; out.gx = P.x; out.why = 'jump the wave'; return out; }
      out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'wait for the wave'; return out; } }
  /* 1. HIS BLOWS (a quarter-second late, some misread) - and the double's */
  const key = 'k' + S.act + e.mode;
  if (/Tell$/.test(e.mode) || e.mode === 'cut' || e.mode === 'lunge' || e.mode === 'stepCut' || e.mode === 'lash' || e.mode === 'gone' || e.mode === 'spears' || e.mode === 'plunge') {
    const miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      /* THE CHAIN: jump it as its head comes (a roll in its path works too) */
      if ((e.mode === 'lashTell' || e.mode === 'lash') && S.lash && !S.lash.back) { const ad = Math.abs(S.lash.x - P.x), dy = S.lash.y - (P.y - 12);
        if (ad < 140 && Math.abs(dy) < 30 && P.ground) { if (s.noRoll || rng() < 0.7) { out.jump = true; out.gx = P.x; out.why = 'jump the chain'; } else { out.dodge = true; out.gx = clamp(P.x + side * 30); out.why = 'roll the chain'; } return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'watch the chain'; return out; }
      if (e.mode === 'lashTell') { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'the chain is coming'; return out; }
      /* THE SPEARS: off the line (outside its spots, the nearer end) */
      if ((e.mode === 'spearTell' || e.mode === 'spears') && S.spears) { const xs = S.spears.spots.map(q => q.x), a = Math.min(...xs) - 18, b = Math.max(...xs) + 18;
        if (P.x > a && P.x < b) { const far = Math.sign(P.x - kx) > 0 ? b + 8 : a - 8, near = far > P.x ? a - 8 : b + 8, fits = x => x > lo + 4 && x < hi - 4;   /* (the lances run out from him: the far end bursts last) */
          const to = fits(far) && Math.abs(far - P.x) <= Math.abs(near - P.x) + 30 ? far : fits(near) ? near : far; out.gx = clamp(to); out.why = 'off the spears\' line'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'clear of the spears'; return out; }
      /* THE DISSOLVE PLUNGE: off the shadow; then in on him stuck */
      if ((e.mode === 'plungeTell' || e.mode === 'plunge') && S.plunge && S.plunge.x !== null) { const d = Math.abs(P.x - S.plunge.x);
        if (d < FK.plungeR + 26) { out.gx = clamp(S.plunge.x + (Math.sign(P.x - S.plunge.x) || 1) * (FK.plungeR + 34)); out.why = 'off the shadow'; return out; }
        out.gx = P.x; out.face = Math.sign(S.plunge.x - P.x) || 1; out.why = 'wait for the drop'; return out; }
      if (e.mode === 'sinkTell' || e.mode === 'gone') { out.gx = P.x; out.why = 'he is in the fog'; return out; }
      if ((e.mode === 'lungeTell' || e.mode === 'lunge') && !P.ground && P.y > e.y - 60) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'in the air under the lunge: come down, then roll'; return out; }   /* (claude/towpath2: the stance fight's jumps no longer carry on through his lunge) */
      if ((e.mode === 'lungeTell' || e.mode === 'lunge') && same) {
        const to = S.lunge ? S.lunge.to : P.x, inPath = Math.abs(to - P.x) < 40 || dx < FK.lungeRange;
        if (inPath) { if (e.mode === 'lungeTell' && e.modeT < FK.lungeBeat * 0.5 && P.ground && !s.noRoll) { out.dodge = true; out.gx = clamp(P.x - side * 30); out.why = 'roll THROUGH the lunge in its last beat'; return out; }
          if (e.mode === 'lunge' && P.ground && !s.noRoll) { out.dodge = true; out.gx = clamp(P.x - side * 30); out.why = 'roll through the lunge (late)'; return out; }
          if (s.noRoll) { out.gx = clamp(kx + side * (FK.lungeRange + 60)); out.why = 'out of the lunge\'s reach'; return out; }
          out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'wait for the lunge\'s last beat'; return out; } }
      if ((e.mode === 'cutTell' || e.mode === 'cut' || e.mode === 'stepTell' || e.mode === 'stepCut') && dx < FK.cutReach + 24 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block his sword'; return out; }
        out.gx = clamp(kx + side * (FK.cutReach + 34)); if (dx < FK.cutReach + 4 && e.modeT < 0.16 && !s.noRoll && e.mode !== 'cut') out.dodge = true; out.why = 'back off his sword'; return out; }
    }
  }
  if (S.dbl && S.dbl.mode === 'cutTell' && Math.abs(S.dbl.x - P.x) < FK.cutReach + 20 && seenFor('d' + S.act)) { if (s.shield) { out.block = true; out.face = Math.sign(S.dbl.x - P.x) || 1; out.why = 'block the double'; return out; }
    out.gx = clamp(P.x + (P.x > S.dbl.x ? 1 : -1) * 50); out.why = 'off the double\'s swing'; return out; }
  /* off a high spot (the surge is past): back down to him */
  if (P.y < G.floorY - 20 && !S.wave && P.ground) { out.gx = clamp(kx + side * (hitR - 4)); out.why = 'down off the perch'; return out; }
  /* 2. OPEN: cut him (any angle); WARDED: off him */
  if (fkOpen(e)) { out.gx = clamp(kx + side * Math.min(hitR - 6, 18)); if (dx < hitR + 4 && same) swing(kx); out.why = 'cut him: the armour stands empty'; return out; }
  if (S.ward > 0) { out.gx = clamp(kx + side * 70); out.face = Math.sign(kx - P.x) || 1; out.why = 'his ward: wait'; return out; }
  /* 3. THE LANTERN: lit, always (away from a gadget: E there works it) */
  if (P.has && !P.lit) { if (s.gadgetNear) { out.gx = clamp(P.x + (P.x < (G.x0 + G.x1) / 2 ? 30 : -30)); out.why = 'off the gadget to light the lantern'; return out; }
    out.talk = true; out.gx = P.x; out.why = 'light the lantern'; return out; }
  /* 4. THE RULE: the bridge's arc (a capstan in reach); the lock under a double; a lamp in phase three */
  if (!s.bridgeOpen && Math.abs(kx - G.cutMid) < FK.arcR && S.burn < 0.7 && !fkGone(e)) { const cap = G.caps.find(q => Math.abs(q - P.x) < 26);
    if (cap !== undefined && P.ground) { out.face = Math.sign(cap - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'swing the bridge through him'; return out; } }
  if (S.dbl && Math.abs(G.paddle - P.x) < 150) { out.gx = clamp(G.paddle + (P.x < G.paddle ? -12 : 12)); if (Math.abs(P.x - G.paddle) < 24 && P.ground) { out.face = Math.sign(G.paddle - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'drain the lock: ground the double'; } else out.why = 'to the lock paddle'; return out; }
  if (S.ph === 3 && s.lamps) { const lp = s.lamps.find(q => !q.lit && Math.abs(q.x - P.x) < 110); if (lp && !/Tell$/.test(e.mode)) { out.gx = clamp(lp.x + (P.x < lp.x ? -12 : 12)); if (Math.abs(P.x - lp.x) < 22 && P.ground) { out.face = Math.sign(lp.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'light the lock lamp'; } else out.why = 'to a lock lamp'; return out; } }
  /* 4b. WINDED (the lab's stamina rest): off him, out of his sword, still lit (the burn goes on at FK.burnR) */
  if (s.rest) { out.gx = clamp(kx + side * (FK.cutReach + 26)); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him, the lantern on him'; return out; }
  if (fkGone(e)) { out.gx = P.x; out.why = 'he is in the fog'; return out; }
  /* 5. THE STANCE FIGHT */
  const st = S.stance;
  if (committed(e) && !STRIKE.has(e.mode)) { if (dx < hitR && same) { swing(kx); out.gx = P.x; out.why = 'cut him in his recovery'; return out; } out.gx = clamp(kx + side * (hitR - 8)); out.face = Math.sign(kx - P.x) || 1; out.why = 'in on his recovery'; return out; }
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
