// src/admirals-champion.js - THE ADMIRAL'S CHAMPION, THE FLOTILLA's boss (claude/flotilla2, the OPUS greybox, 2026-10-17; scratch/brief-flotilla2.md '!! 10-16':
// Daniel's interview - the Quartermaster is CUT (benched, src/benched/quartermaster.js) and the fleet's last word is its CHAMPION: a Salt & Sanctuary
// 'Sodden Knight'-style duel, but LIVING - the act already has the Sunken Crew, the Drowned King and the drowned knights).
//
// WHAT HE IS: a huge salt-crusted plate knight, the fleet's champion, with a two-handed BOARDING GREATSWORD. Heavy, slow, every swing COMMITTED; bigger
//   than any foe on the road (the art lane draws him at ~1.5x the Crusader). He stands where the four hulls are lashed together - on THE LASHINGS, two decks
//   with a gap of foul harbour between them, and he LEAPS from one lashed hull to the other (the level's rule: FOUR HULLS LASHED TOGETHER).
// WHAT HE IS (design standard B11/B15): A DUELIST, ALWAYS HITTABLE. On guard his PLATE turns most of a blow: x CH.plate (a told clank, HIS PLATE - never
//   nothing, B15). In the recovery after each of his committed blows he is just a man in armour: x1. His openings are EARNED:
//   THE BLADE IN THE DECK (B14 recovery opening): his OVERHEAD SLAM that meets only planking sticks in the deck for CH.stuckT s - x CH.stuckMul (gold ring + timer).
//     In phase two the ANCHOR does the same after its slam (it bites the deck).
//   THE DECK CANNON (B14 KEY, B1/B17 - the level's verb: THE POWDER SHIP teaches it): strike a deck gun's breech while he stands in its line and the round shot
//     KNOCKS HIM FLAT - OPEN x CH.flatMul for CH.flatT s (gold ring + timer, B10), one knockdown CH.flatCap of him at most. Then a TOLD CH.wardT s WARD (B3:
//     a grey ring; a ball glances off it, blades land at CH.ward - never totally invulnerable, B15). B4: flat, he lies where he fell.
// HIS MOVES (B17: seven told answers; B16: each its own windup + release pose - src/redraw/champion_art.js; one windup at a time):
//   PHASE ONE - THE GREATSWORD:
//     THE COMBO   (! a shield turns each cut)   two or three heavy cuts, a step in between; the recovery after the last is his (x1)
//     THE OVERHEAD SLAM (!! step out of it)     the blade raised two-handed over the deck in front of him (a red mark where it falls); caught, it hurts; missed,
//                                               THE BLADE STICKS: the opening
//     THE LUNGING THRUST (!! roll through it)   he draws the point back to his hip and drives the length of the deck; no shield turns it; a roll passes it
//     THE LEAP    (!! move off the mark)        he crouches and goes over the lashing to the hull you are on (a told mark where he lands); the landing throws
//                                               the planks up round him - be off the mark or in the air. He always leaps when you stand on the other hull.
//   PHASE TWO (at CH.p2 of him) - THE ANCHOR: he tears THE ANCHOR off the rail (told) and swings it on its chain. Every move changes (Daniel's call, the brief):
//     THE ANCHOR SWEEP (!! jump it)             the anchor goes round him on its chain at your knees, a wide arc, front and back; a jump or a roll clears it
//     THE CHAIN HOOK (!! roll or jump it)       he hurls the anchor at you on its chain: it HOOKS you and he HAULS you in, then sweeps
//     THE ANCHOR SLAM (!! step out; the deck tilts) the anchor two-handed over the deck: it bites the planks (the opening, x CH.stuckMul) and THE DECK TILTS -
//                                               the hull he stands on heels toward the lashing for CH.tiltT s (you slide toward the gap unless you walk against
//                                               it or hold a line) and THE HULLS ROCK APART: the lashing gap opens a tile each side, then they come together
//     THE LEAP (as phase one)
// FIERCER IN PHASE TWO: quicker between blows (CH.gap). Every tell at least half a second.
// PURE: no DOM, no main.js. The world is a context `c` (src/admirals-champion-hands.js binds it). chPlan is the boss lab's HUMAN bot (src/lab.js).

export const CH = {
  hp: 2300, w: 24, h: 44, markH: 70,
  plate: 0.5, ward: 0.4, stuckMul: 1.5, flatMul: 2, flatCap: 0.11, flatT: 3.2, wardT: 3.0, stuckT: 1.6, stuckAT: 1.4,
  p2: 0.5,
  walk: 44, keep: 40, turn: 0.45, gap: [0.62, 0.5],
  /* THE COMBO: first cut told comboTell s, the next comboNext s; each cut comboT s at comboReach px; a step of comboStep px between */
  comboTell: 0.62, comboNext: 0.44, comboT: 0.16, comboReach: 60, comboStep: 14, comboRec: 0.75,
  /* THE OVERHEAD SLAM: told slamTell s; the blade falls slamT s over [slamNear, slamFar] px in front of him */
  slamTell: 0.95, slamT: 0.14, slamNear: 6, slamFar: 58, slamRec: 0.55,
  /* THE LUNGING THRUST: told thrustTell s; he drives thrustV px/s for thrustT s (at most thrustRange px); thrustRec s after */
  thrustTell: 0.8, thrustT: 0.32, thrustV: 400, thrustRange: 180, thrustRec: 0.75,
  /* THE LEAP: told leapTell s (the mark where he lands, fixed), leapT s in the air (leapH px over the deck), the landing's throw landR px; landRec s after */
  leapTell: 0.72, leapT: 0.78, leapH: 96, landR: 34, landRec: 0.8, otherHull: 0.7,
  /* PHASE TWO: the anchor torn off the rail (tearTell s, told); THE SWEEP (sweepR px round him at the knees, sweepT s, sweepH px over the deck clears it) */
  tearTell: 1.5, sweepTell: 0.9, sweepT: 0.6, sweepR: 100, sweepH: 22, sweepRec: 0.7,
  /* THE CHAIN HOOK: told hookTell s; the anchor flies hookV px/s up to hookLen px; a hook drags dragV px/s for at most dragT s to dragTo px off him */
  hookTell: 0.85, hookV: 380, hookLen: 250, dragV: 280, dragT: 0.75, dragTo: 34, hookRec: 0.6,
  /* THE ANCHOR SLAM: told tiltTell s; the anchor falls slamT s over [slamNear, slamFar]; THE TILT: tiltT s, heroes on that deck slide tiltV px/s to the lashing; gapOpen s apart */
  tiltTell: 1.0, tiltT: 2.2, tiltV: 64, gapOpen: 2.6,
  dmg: { combo: 30, slam: 44, thrust: 38, leap: 38, sweep: 34, hook: 18, tilt: 42 },
};
/* EVERY CYCLE CHANGES: the order of each pass by phase (cycle k uses [k % n]); 'combo3' = the three-cut combo */
export const CYCLES = {
  1: [['combo', 'thrust', 'slam'], ['combo3', 'leap', 'combo', 'slam'], ['thrust', 'combo3', 'slam', 'leap']],
  2: [['sweep', 'hook', 'tilt'], ['hook', 'sweep', 'leap', 'tilt'], ['sweep', 'tilt', 'hook', 'leap', 'sweep']],
};
/* the move each phase brings: phase two changes his whole hand (the brief: he tears the anchor off the rail) */
export const PHASE_NEW = { 1: ['combo', 'slam', 'thrust', 'leap'], 2: ['sweep', 'hook', 'tilt'] };
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js keeps the same rows) */
export const MOVES = {
  comboTell: { mark: '!', answer: 'block' }, slamTell: { mark: '!!', answer: 'dodge' }, thrustTell: { mark: '!!', answer: 'dodge' }, leapTell: { mark: '!!', answer: 'dodge' },
  tearTell: { mark: '', answer: '' }, sweepTell: { mark: '!!', answer: 'jump' }, hookTell: { mark: '!!', answer: 'jump' }, tiltTell: { mark: '!!', answer: 'dodge' },
};
export const MOVE_NAME = { combo: 'THE GREATSWORD', slam: 'THE OVERHEAD SLAM', thrust: 'THE LUNGING THRUST', leap: 'THE LEAP', sweep: 'THE ANCHOR SWEEP', hook: 'THE CHAIN HOOK', tilt: 'THE ANCHOR SLAM' };
/* each told move's word over him as it winds up (B5: sound + word + colour) */
export const MOVE_WORD = { slamTell: 'OVERHEAD: STEP OUT OF IT', thrustTell: 'THE THRUST: ROLL THROUGH IT', leapTell: 'HE LEAPS: OFF THE MARK', tearTell: 'HE TEARS THE ANCHOR OFF THE RAIL',
  sweepTell: 'THE ANCHOR: JUMP IT', hookTell: 'THE CHAIN: ROLL OR JUMP IT', tiltTell: 'THE ANCHOR SLAM: THE DECK WILL TILT' };

/* ---------- THE LASHINGS (the arena) ----------
   local columns 0..S.W-1, the decks' surface row R (the hero stands on R-1): THE FLAGSHIP's main deck (west hull, 0..g0-1), THE LASHING (g0..g1: foul
   harbour, two lines drawn over it), THE CONSORT's deck (east hull, g1+1..W-1); a DECK GUN at each hull's outer end laid along the deck toward the lashing;
   a NET down each hull's inner side (out of the water). Nothing solid stands on the decks: a round shot runs their length. */
export const CH_STAGE = { W: 52, gap: [24, 26], guns: [3, 48], him: 40 };
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.ac, X = c => (q.sx + c) * TS, S = CH_STAGE;
  return { TS, x0: X(0), x1: X(S.W), floorY: q.R * TS, gap: [X(S.gap[0]), X(S.gap[1] + 1)], gapMid: (X(S.gap[0]) + X(S.gap[1] + 1)) / 2,
    hulls: [[X(0), X(S.gap[0])], [X(S.gap[1] + 1), X(S.W)]], guns: S.guns.map((c, i) => ({ x: X(c) + 8, aim: i === 0 ? 1 : -1 })), cols: { sx: q.sx, g0: q.sx + S.gap[0], g1: q.sx + S.gap[1], R: q.R } };
}
export const hullOf = (G, x) => (x < G.gapMid ? 0 : 1);
/* a spot he can land on: a deck, not the lashing (B12: where you can follow) */
export const footX = (G, x) => { const k = hullOf(G, x), [a, b] = G.hulls[k]; return Math.max(a + 18, Math.min(b - 18, x)); };

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, ward: 0, taken: 0, behindT: 0, otherT: 0, cuts: 0, cutsLeft: 0, told: {}, why: '',
    thrust: null, leap: null, hook: null, hooked: null, sweep: null, tilt: null, gapT: 0, anchor: false,
    n: { cycles: 0, flats: 0, stucks: 0, wards: 0, plated: 0, warded: 0, landed: 0, glanced: 0, combos: 0, cuts: 0, slams: 0, slamHits: 0, thrusts: 0, leaps: 0, landHits: 0,
      sweeps: 0, sweepHits: 0, hooks: 0, hooked: 0, tilts: 0, tiltHits: 0, slid: 0, gapOpens: 0, moves: {} } };
}
export const fPhase = e => (e.hp <= e.maxHp * CH.p2 ? 2 : 1);
export const chFlat = e => !!e && e.mode === 'flat' && (e.open || 0) > 0;
export const chStuck = e => !!e && (e.mode === 'stuck' || e.mode === 'stuckA') && (e.open || 0) > 0;
export const chOpen = e => chFlat(e) || chStuck(e);
const STRIKE = new Set(['combo', 'slam', 'thrust', 'leap', 'sweep', 'hook', 'tilt']);
/* COMMITTED: the recovery after a blow, and the tear - just a man in armour (x1) */
const COMMITTED = new Set(['comboRec', 'slamRec', 'thrustRec', 'landRec', 'sweepRec', 'hookRec', 'tearTell', 'tiltRec']);
export const committed = e => !!e && COMMITTED.has(e.mode);
export const airborne = e => !!e && e.mode === 'leap';

/* WHAT A BLOW TAKES OFF HIM: { k, word }. Every blow lands (B15): plate x CH.plate, ward x CH.ward, committed x1, stuck x CH.stuckMul, flat x CH.flatMul */
export function takeAt(e, S) {
  if (!e || e.mode === 'sleep' || e.mode === 'wake') return { k: 0, word: '' };
  if (chFlat(e)) return { k: CH.flatMul, word: '' };
  if (chStuck(e)) return { k: CH.stuckMul, word: '' };
  if (S.ward > 0) return { k: CH.ward, word: 'WARDED' };
  if (COMMITTED.has(e.mode)) return { k: 1, word: '' };
  return { k: CH.plate, word: 'HIS PLATE' };
}

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampDeck = (G, k, x) => { const [a, b] = G.hulls[k]; return Math.max(a + 14, Math.min(b - 14, x)); };
function tell(e, S, c, mode, t) { setMode(e, mode, Math.max(0.5, t)); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark);
  c.sound(mv && mv.mark === '!!' ? 'tellHard' : 'tell'); if (MOVE_WORD[mode]) c.word(e, MOVE_WORD[mode], mode); }
function endFlat(e, S, c) { e.open = 0; S.ward = CH.wardT; S.n.wards++; S.taken = 0; c.number(e.x, e.y - 80, 'HE IS UP: HIS GUARD IS SET', '#9ab0c0'); c.sound('tell'); c.fx('ward', e.x, e.y); }

/* ---------- THE RULE ON HIM (the hands call it) ----------
   A ROUND SHOT met him (src/main.js updateBalls). In the air it passes under him; in his ward it glances off; otherwise HE GOES DOWN. Returns 'flat' | 'ward' | 'air' | 'busy' */
export function cannonHit(e, S, c) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || e.mode === 'dead') return 'busy';
  if (airborne(e)) return 'air';
  if (chFlat(e)) return 'busy';
  if (S.ward > 0) { S.n.glanced++; c.number(e.x, e.y - 70, 'THE BALL GLANCES OFF HIS GUARD: NOT YET', '#9ab0c0'); c.sound('clank'); return 'ward'; }
  setMode(e, 'flat', CH.flatT + 0.05); e.open = CH.flatT; S.taken = 0; S.n.flats++; S.thrust = null; S.hook = null; S.hooked = null; S.sweep = null; S.leap = null; S.cutsLeft = 0;
  c.fx('flat', e.x, e.y); c.sound('flat'); c.shake(7); c.number(e.x, e.y - 80, 'KNOCKED FLAT: CUT HIM NOW', '#8fd160');
  if (!S.told.flat) { S.told.flat = 1; c.number((S.G.x0 + S.G.x1) / 2, S.G.floorY - 140, 'THE GUNS PUT HIM DOWN. HE GETS UP WARY: WAIT FOR HIS GUARD TO DROP', '#ffd36b'); }
  return 'flat';
}

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, dodge, holding, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.hook(pp, dmg, name, key) -> hooked   c.drag(pp, toX, v, dt)   c.slide(pp, dx)   c.number(x, y, line, col)
   c.word(e, line, mode)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)  c.gap(open) -> the lashing opened / closed ---------- */
export function stepChampion(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; if (e.mode !== 'leap') e.y = G.floorY;
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepHook(e, S, dt, h, c); stepSweep(e, S, dt, h, c); stepTilt(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* YOU ARE ON THE OTHER HULL: he comes over the lashing after you (B12: once he has stood it a moment, never in an opening) */
  if (P && hullOf(G, P.x) !== hullOf(G, e.x) && P.y > G.floorY - 60) S.otherT += dt; else S.otherT = 0;
  /* THE PHASE: it waits for the blow in hand and never cuts an opening short */
  const want = fPhase(e);
  if (want > S.ph && !chOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    c.number((G.x0 + G.x1) / 2, G.floorY - 150, 'HE THROWS DOWN THE SWORD AND TEARS THE ANCHOR OFF THE RAIL', '#ff9a5c'); tell(e, S, c, 'tearTell', CH.tearTell); return; }
  switch (e.mode) {
    case 'flat': if (e.open <= 0) { endFlat(e, S, c); setMode(e, 'recover', 0.5); } return;   /* B4: he lies where he fell */
    case 'stuck': case 'stuckA': if (e.open <= 0) { c.number(e.x, e.y - 70, e.mode === 'stuck' ? 'HE WRENCHES THE BLADE FREE' : 'HE HAULS THE ANCHOR OUT OF THE DECK', '#9aa39a'); setMode(e, 'recover', 0.4); } return;
    case 'tearTell': if (e.modeT <= 0) { S.anchor = true; c.fx('tear', e.x, e.y); c.sound('chain'); c.shake(5); setMode(e, 'recover', 0.5); } return;
    case 'recover': if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > CH.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      const k = hullOf(G, e.x);
      if (hullOf(G, P.x) === k) { if (Math.abs(d) > CH.keep) e.x = clampDeck(G, k, e.x + Math.sign(d) * CH.walk * dt); else if (Math.abs(d) < CH.keep - 20) e.x = clampDeck(G, k, e.x - Math.sign(d) * CH.walk * 0.5 * dt); }
      else e.x = clampDeck(G, k, e.x + Math.sign(G.gapMid - e.x) * CH.walk * dt);   /* to the lashing, after you */
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  const G = S.G; let m = S.script[S.step++];
  const dx = P.x - e.x, ad = Math.abs(dx); e.face = Math.sign(dx) || e.face;
  if (S.otherT > CH.otherHull && P.ground) { m = 'leap'; S.step--; }   /* across the lashing: he follows you over it */
  if (m === 'leap' && hullOf(G, P.x) === hullOf(G, e.x) && ad < 70) m = S.ph === 1 ? 'combo' : 'sweep';   /* (a leap onto your head from beside you is not a leap) */
  const reach = { combo: CH.comboReach + 30, combo3: CH.comboReach + 30, slam: CH.slamFar + 30, tilt: CH.slamFar + 30, sweep: CH.sweepR + 10, thrust: CH.thrustRange + 40, hook: CH.hookLen };
  if (reach[m] && (ad > reach[m] || hullOf(G, P.x) !== hullOf(G, e.x))) { if (m !== 'thrust' && m !== 'hook') { setMode(e, 'walk', 0.5); S.step--; return; } }   /* out of his reach: he closes first */
  switch (m) {
    case 'combo': case 'combo3': S.cutsLeft = m === 'combo3' ? 3 : 2; S.n.combos++; tell(e, S, c, 'comboTell', CH.comboTell); return;
    case 'slam': tell(e, S, c, 'slamTell', CH.slamTell); S.slamX = e.x + e.face * (CH.slamNear + CH.slamFar) / 2; return;
    case 'thrust': tell(e, S, c, 'thrustTell', CH.thrustTell); S.thrust = { from: e.x }; return;
    case 'leap': { const to = footX(G, P.x); tell(e, S, c, 'leapTell', CH.leapTell); S.leap = { x0: e.x, x1: to, t: 0 }; e.face = Math.sign(to - e.x) || e.face; return; }
    case 'sweep': tell(e, S, c, 'sweepTell', CH.sweepTell); return;
    case 'hook': tell(e, S, c, 'hookTell', CH.hookTell); return;
    case 'tilt': tell(e, S, c, 'tiltTell', CH.tiltTell); S.slamX = e.x + e.face * (CH.slamNear + CH.slamFar) / 2; return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = t => setMode(e, 'recover', t ?? CH.gap[S.ph - 1]), k = hullOf(G, e.x);
  switch (e.mode) {
    case 'comboTell': if (e.modeT <= 0) { setMode(e, 'combo', CH.comboT); S.n.cuts++; c.sound('slash'); } return;
    case 'combo': c.hit([f > 0 ? e.x - 6 : e.x - CH.comboReach, f > 0 ? e.x + CH.comboReach : e.x + 6, e.y - 40, e.y], CH.dmg.combo, MOVE_NAME.combo, { blockable: true, key: 'cut' + S.act + '.' + S.cutsLeft });
      if (e.modeT <= 0) { S.cutsLeft--; if (S.cutsLeft > 0) { e.x = clampDeck(G, k, e.x + f * CH.comboStep); e.face = Math.sign(P.x - e.x) || f; setMode(e, 'comboTell', CH.comboNext); c.mark('!'); c.sound('tell'); } else setMode(e, 'comboRec', CH.comboRec); } return;
    case 'comboRec': if (e.modeT <= 0) after(); return;
    case 'slamTell': if (e.modeT <= 0) { setMode(e, 'slam', CH.slamT); S.n.slams++; c.sound('slam'); S.slamHit = false; } return;
    case 'slam': { const a = e.x + f * CH.slamNear, b = e.x + f * CH.slamFar;
      if (c.hit([Math.min(a, b), Math.max(a, b), e.y - 46, e.y], CH.dmg.slam, MOVE_NAME.slam, { key: 'slam' + S.act })) { S.slamHit = true; S.n.slamHits++; }
      if (e.modeT <= 0) { c.shake(5); c.fx('splinter', S.slamX, G.floorY);
        if (S.slamHit) setMode(e, 'slamRec', CH.slamRec);
        else { setMode(e, 'stuck', CH.stuckT + 0.05); e.open = CH.stuckT; S.n.stucks++; c.sound('open'); c.number(e.x, e.y - 80, 'THE BLADE IS IN THE DECK: CUT HIM', '#8fd160'); } } return; }
    case 'slamRec': if (e.modeT <= 0) after(); return;
    case 'thrustTell': if (e.modeT <= 0) { setMode(e, 'thrust', CH.thrustT); S.n.thrusts++; c.sound('lunge'); } return;
    case 'thrust': { const x0 = e.x; e.x = clampDeck(G, k, e.x + f * CH.thrustV * dt); if (S.thrust && Math.abs(e.x - S.thrust.from) > CH.thrustRange) e.modeT = Math.min(e.modeT, 0);
      c.hit([Math.min(x0, e.x) - (f < 0 ? 40 : 6), Math.max(x0, e.x) + (f > 0 ? 40 : 6), e.y - 34, e.y - 4], CH.dmg.thrust, MOVE_NAME.thrust, { key: 'thrust' + S.act });
      if (e.modeT <= 0) { S.thrust = null; setMode(e, 'thrustRec', CH.thrustRec); } return; }
    case 'thrustRec': if (e.modeT <= 0) after(); return;
    case 'leapTell': if (S.leap) e.face = Math.sign(S.leap.x1 - e.x) || f; if (e.modeT <= 0) { setMode(e, 'leap', CH.leapT); S.n.leaps++; c.sound('leap'); S.otherT = 0; } return;
    case 'leap': { const L = S.leap; if (!L) { after(); return; } L.t += dt; const u = Math.min(1, L.t / CH.leapT);
      e.x = L.x0 + (L.x1 - L.x0) * u; e.y = G.floorY - CH.leapH * 4 * u * (1 - u);
      if (u >= 1) { e.y = G.floorY; e.x = L.x1; c.shake(7); c.fx('land', e.x, e.y); c.sound('land');
        if (c.hit([e.x - CH.landR, e.x + CH.landR, G.floorY - 14, G.floorY + 2], CH.dmg.leap, MOVE_NAME.leap, { key: 'leap' + S.act, ground: true })) S.n.landHits++;
        S.leap = null; e.face = Math.sign(P.x - e.x) || f; setMode(e, 'landRec', CH.landRec); } return; }
    case 'landRec': if (e.modeT <= 0) after(); return;
    case 'sweepTell': if (e.modeT <= 0) { setMode(e, 'sweep', CH.sweepT); S.n.sweeps++; c.sound('chain'); S.sweep = { t: 0, key: 'sweep' + S.act, f, x: e.x - f * CH.sweepR }; } return;
    case 'sweep': if (e.modeT <= 0) { S.sweep = null; setMode(e, 'sweepRec', CH.sweepRec); } return;
    case 'sweepRec': if (e.modeT <= 0) after(); return;
    /* THE CHAIN HOOK: he whirls it (told), then hurls it at where you stand, at your height: a jump clears it on the deck, a roll passes it */
    case 'hookTell': if (e.modeT <= 0) { const sx = e.x + f * 14, sy = e.y - 26, ty = P.y - 14, ddx = P.x - sx, ddy = ty - sy, dd = Math.hypot(ddx, ddy) || 1;
        S.hook = { x: sx, y: sy, ux: ddx / dd, uy: ddy / dd, len: 0, back: false, key: 'hook' + S.act }; S.n.hooks++; setMode(e, 'hook', 2); c.sound('chain'); } return;
    case 'hook': if (!S.hook && !S.hooked) setMode(e, 'hookRec', CH.hookRec);
      else if (S.hooked && S.hooked.done) { const hk = S.hooked; S.hooked = null; S.hook = null; e.face = Math.sign(hk.pp.x - e.x) || f; tell(e, S, c, 'sweepTell', 0.6); } return;
    case 'hookRec': if (e.modeT <= 0) after(); return;
    case 'tiltTell': if (e.modeT <= 0) { setMode(e, 'tilt', CH.slamT); S.n.tilts++; c.sound('slam'); S.slamHit = false; } return;
    case 'tilt': { const a = e.x + f * CH.slamNear, b = e.x + f * CH.slamFar;
      if (c.hit([Math.min(a, b), Math.max(a, b), e.y - 46, e.y], CH.dmg.tilt, MOVE_NAME.tilt, { key: 'tilt' + S.act })) { S.slamHit = true; S.n.tiltHits++; }
      if (e.modeT <= 0) { c.shake(8); c.fx('splinter', S.slamX, G.floorY);
        /* THE DECK TILTS toward the lashing, and THE HULLS ROCK APART */
        S.tilt = { hull: k, dir: k === 0 ? 1 : -1, t: CH.tiltT }; S.gapT = CH.gapOpen; S.n.gapOpens++; c.gap(true); c.sound('creak');
        if (!S.told.tilt) { S.told.tilt = 1; c.number((G.x0 + G.x1) / 2, G.floorY - 140, 'THE DECK TILTS TO THE LASHING: WALK UP IT, OR HOLD A LINE', '#ffd36b'); }
        if (S.slamHit) setMode(e, 'tiltRec', CH.slamRec); else { setMode(e, 'stuckA', CH.stuckAT + 0.05); e.open = CH.stuckAT; S.n.stucks++; c.sound('open'); c.number(e.x, e.y - 80, 'THE ANCHOR BIT THE DECK: CUT HIM', '#8fd160'); } } return; }
    case 'tiltRec': if (e.modeT <= 0) after(); return;
    default: setMode(e, 'walk', 0.5);
  }
}
/* THE CHAIN in flight: its anchor runs out along its line; a hero it meets (not rolling) is HOOKED and hauled in; it comes back when spent */
function stepHook(e, S, dt, h, c) {
  const L = S.hook;
  if (S.hooked) { const hk = S.hooked; hk.t += dt; const q = h.find(z => z.pp === hk.pp);
    if (!q || !q.alive || hk.t > CH.dragT || Math.abs(q.x - e.x) <= CH.dragTo || chOpen(e)) { hk.done = true; return; }
    c.drag(hk.pp, e.x + Math.sign(q.x - e.x) * CH.dragTo, CH.dragV, dt); if (L) { L.x = q.x; L.y = q.y - 14; } return; }
  if (!L) return;
  const sp = CH.hookV * dt;
  if (!L.back) { L.len += sp; L.x += L.ux * sp; L.y += L.uy * sp;
    for (const q of h) { if (!q.alive) continue; if (Math.abs(q.x - L.x) < 11 && L.y > q.y - 26 && L.y < q.y + 2) {
        if (q.dodge) { if (!L.told) { L.told = 1; c.number(q.x, q.y - 40, 'ROLLED UNDER THE CHAIN', '#8fd160'); } continue; }
        if (c.hook(q.pp, CH.dmg.hook, MOVE_NAME.hook, L.key)) { S.n.hooked++; S.hooked = { pp: q.pp, t: 0, done: false }; c.number(q.x, q.y - 40, 'HOOKED: HE HAULS YOU IN', '#ff6b6b'); return; } } }
    if (L.len >= CH.hookLen || L.y > S.G.floorY + 4 || L.x < S.G.x0 || L.x > S.G.x1) L.back = true; }
  else { const hx = e.x + (e.face || 1) * 14, hy = e.y - 26, ddx = hx - L.x, ddy = hy - L.y, dd = Math.hypot(ddx, ddy); if (dd < sp * 1.5) { S.hook = null; return; } L.x += ddx / dd * sp * 1.5; L.y += ddy / dd * sp * 1.5; }
}
/* THE SWEEP: the anchor goes round him on its chain at the knees, ONE PASS from behind him to in front of him (its x runs -R..+R over CH.sweepT) - a hero on the deck
   is struck where the anchor passes him; a jump over CH.sweepH as it comes, or a roll, clears it. W.x is where the anchor is (drawn, and read by the bot) */
export const sweepX = (e, W) => e.x - W.f * CH.sweepR * Math.cos(Math.PI * Math.min(1, W.t / CH.sweepT));
function stepSweep(e, S, dt, h, c) {
  const W = S.sweep; if (!W) return; const x0 = W.x; W.t += dt; W.x = sweepX(e, W);
  for (const q of h) { if (!q.alive || q.dodge) continue; if (q.y < S.G.floorY - CH.sweepH || q.y > S.G.floorY + 4) continue;
    if (q.x < Math.min(x0, W.x) - 10 || q.x > Math.max(x0, W.x) + 10) continue;
    if (c.hit([q.x - 2, q.x + 2, q.y - 10, q.y], CH.dmg.sweep, MOVE_NAME.sweep, { key: W.key })) S.n.sweepHits++; }
}
/* THE TILT and THE GAP: heroes on the heeling deck slide to the lashing (walking against it holds you; a line held, or the air, is not on the deck) */
function stepTilt(e, S, dt, h, c) {
  const T = S.tilt;
  if (T) { T.t -= dt; const [a, b] = S.G.hulls[T.hull];
    for (const q of h) { if (!q.alive || !q.ground || q.holding || q.x < a || q.x > b || Math.abs(q.y - S.G.floorY) > 4) continue; c.slide(q.pp, T.dir * CH.tiltV * dt); S.n.slid += CH.tiltV * dt; }
    if (T.t <= 0) S.tilt = null; }
  if (S.gapT > 0) { S.gapT -= dt; if (S.gapT <= 0) { S.gapT = 0; c.gap(false); } }
}
/* A LANDED BLOW (the hands call it after take) */
export function landed(e, S) { S.n.landed++; }

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some. It blocks or backs off the combo; steps out of
   the slam and cuts the stuck blade; rolls the thrust in its last beat (or jumps it, the warden); moves off the leap's mark; jumps the sweep; jumps or rolls
   the chain; walks up the tilting deck. THE RULE: when a deck gun is cool and he stands in its line on its deck, it goes to the breech and strikes it; flat,
   it cuts him hard; warded, it waits off him. On guard it cuts his plate now and then (a human does).
   s = { P: { x, y, face, ground, atk }, e, S, reach, shield, t, rng, mem, v2, hero, rest, noRoll, guns: [{ x, y, cool, aim }] } -> { gx, face, atk, jump, dodge, block, down, why } */
export const PLAN = { react: 0.25, miss: 0.12, gunSeen: 0.5, chip: 0.5 };
export function chPlan(s) { const o = chPlan0(s); if (s.S) s.S.botWhy = o.why; return o; }
function chPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const myHull = hullOf(G, P.x), [ha, hb] = G.hulls[myHull], clamp = x => Math.max(ha + 10, Math.min(hb - 10, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - G.floorY) < 30 && hullOf(G, kx) === myHull && !airborne(e), hitR = reach + CH.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const away = d => clamp(kx + side * d);
  /* 0. HOOKED: brace */
  if (S.hooked) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; if (s.shield) out.block = true; out.why = 'hooked: brace'; return out; }
  /* 0b. THE TILT: walk up the deck, away from the lashing */
  if (S.tilt && S.tilt.hull === myHull && P.ground) { out.gx = clamp(P.x - S.tilt.dir * 40); out.why = 'up the tilting deck'; if (chStuck(e) && dx < hitR && same) swing(kx); return out; }
  /* 0c. IN THE WATER / ON A NET: back up onto a deck (the walker's legs do the climbing) */
  if (P.y > G.floorY + 8) { const nx = myHull === 0 ? G.gap[0] - 6 : G.gap[1] + 6; out.gx = nx; out.why = 'out of the harbour'; return out; }
  /* 1. HIS BLOWS (a quarter-second late, some misread) */
  if (/Tell$/.test(e.mode) || STRIKE.has(e.mode)) {
    const miss = s.v2 ? false : roll('m' + S.act + e.mode, PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'leapTell' || e.mode === 'leap') && S.leap) { const d = Math.abs(P.x - S.leap.x1);
        if (d < CH.landR + 24) { const to = clamp(S.leap.x1 + (Math.sign(P.x - S.leap.x1) || 1) * (CH.landR + 40)); out.gx = Math.abs(to - S.leap.x1) < CH.landR + 10 ? clamp(S.leap.x1 - (Math.sign(P.x - S.leap.x1) || 1) * (CH.landR + 40)) : to; out.why = 'off the leap\'s mark'; return out; }
        out.gx = P.x; out.face = Math.sign(S.leap.x1 - P.x) || 1; out.why = 'wait for him to land'; return out; }
      if ((e.mode === 'hookTell' || e.mode === 'hook') && same) { if (S.hook && !S.hook.back) { const ad = Math.abs(S.hook.x - P.x);
          if (ad < 120 && P.ground) { if (s.noRoll || rng() < 0.7) { out.jump = true; out.gx = P.x; out.why = 'jump the chain'; } else { out.dodge = true; out.gx = clamp(P.x + side * 30); out.why = 'roll the chain'; } return out; } }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'watch the chain'; return out; }
      if ((e.mode === 'sweepTell' || e.mode === 'sweep') && dx < CH.sweepR + 20 && same) {
        if (e.mode === 'sweepTell') { if (e.modeT > 0.3 && dx > CH.sweepR - 40) { out.gx = away(CH.sweepR + 30); out.why = 'out of the sweep'; return out; } out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'watch the anchor'; return out; }
        const W = S.sweep; if (W && P.ground) { const ax = W.x, vx = (W.f || 1) * CH.sweepR * Math.PI / CH.sweepT * Math.sin(Math.PI * Math.min(1, W.t / CH.sweepT)), eta = vx ? (P.x - ax) / vx : 9;
          if (eta > 0 && eta < 0.16) { if (!s.noRoll && rng() < 0.25) { out.dodge = true; out.gx = P.x; out.why = 'roll the anchor'; } else { out.jump = true; out.gx = P.x; out.why = 'jump the anchor'; } return out; } }
        out.gx = P.x; out.why = 'the anchor is coming'; return out; }
      if ((e.mode === 'slamTell' || e.mode === 'slam' || e.mode === 'tiltTell' || e.mode === 'tilt') && same) {
        const inBox = Math.sign(P.x - kx) === (e.face || 1) && dx < CH.slamFar + 16; if (inBox) { out.gx = dx < 30 ? clamp(kx - (e.face || 1) * 30) : away(CH.slamFar + 30); out.why = 'out from under the slam'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'let it fall'; return out; }
      if ((e.mode === 'thrustTell' || e.mode === 'thrust') && same && Math.sign(P.x - kx) === (e.face || 1)) {
        if (e.mode === 'thrustTell' && e.modeT < 0.14 && P.ground) { if (s.noRoll) { out.jump = true; out.gx = P.x; out.why = 'jump the thrust'; } else { out.dodge = true; out.gx = clamp(P.x - side * 30); out.why = 'roll THROUGH the thrust'; } return out; }
        if (e.mode === 'thrust' && P.ground) { if (s.noRoll) out.jump = true; else out.dodge = true; out.gx = clamp(P.x - side * 30); out.why = 'roll through the thrust (late)'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'wait for the thrust\'s last beat'; return out; }
      if ((e.mode === 'comboTell' || e.mode === 'combo') && dx < CH.comboReach + 24 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the cut'; return out; }
        out.gx = away(CH.comboReach + 34); out.why = 'back off the combo'; return out; }
    }
  }
  /* 2. OPEN: cut him; WARDED: off him */
  if (chOpen(e)) { if (!same) { out.gx = clamp(kx); out.why = 'to him: he is open'; return out; } out.gx = clamp(kx + side * Math.min(hitR - 6, 16)); if (dx < hitR + 4) swing(kx); out.why = chFlat(e) ? 'cut him: he is flat' : 'cut him: his blade is stuck'; return out; }
  if (S.ward > 0) { out.gx = away(80); out.face = Math.sign(kx - P.x) || 1; out.why = 'his ward: wait'; return out; }
  /* 3. THE RULE: a cool gun on his deck, him in its line - to the breech and strike it */
  const guns = (s.guns || []).filter(g => !(g.cool > 0) && hullOf(G, g.x) === hullOf(G, kx) && Math.sign(kx - g.x) === g.aim && Math.abs(kx - g.x) < 360);
  if (guns.length && !airborne(e) && seenFor('gun' + guns[0].x + '.' + Math.floor(t / 6), PLAN.gunSeen)) { const g = guns.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    const at = g.x - g.aim * 14;   /* the breech side: the gun between you and nothing, him down its muzzle */
    if (hullOf(G, P.x) === hullOf(G, g.x) && Math.abs(P.x - at) < 10 && P.ground) { out.face = g.aim; out.gx = P.x; out.atk = P.atk < 0; if (s.hero === 'ranger') out.down = true; out.why = 'fire the gun down his line'; return out; }   /* (the ranger strikes the breech with her knife's low sweep, DOWN+X: an arrow is not a blow on it) */
    if (hullOf(G, P.x) === hullOf(G, g.x) && Math.abs(P.x - g.x) < Math.abs(kx - g.x)) { out.gx = at; out.why = 'to the gun: he is in its line'; return out; } }
  /* 4. WINDED: off him */
  if (s.rest) { out.gx = away(CH.comboReach + 40); out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  if (airborne(e)) { out.gx = P.x; out.why = 'he is in the air'; return out; }
  /* 5. THE DUEL: in on his recovery; on guard, chip his plate now and then */
  if (!same) { out.gx = hullOf(G, kx) === myHull ? clamp(kx + side * (hitR - 6)) : P.x; out.why = 'on the other hull: let him come'; return out; }
  if (committed(e)) { if (dx < hitR) { swing(kx); out.gx = P.x; out.why = 'cut him in his recovery'; return out; } out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in on his recovery'; return out; }
  if (dx > hitR + 26) { out.gx = clamp(kx + side * (hitR - 6)); out.face = Math.sign(kx - P.x) || 1; out.why = 'in to him'; return out; }
  out.face = Math.sign(kx - P.x) || 1;
  if (e.mode === 'walk' && roll('chip' + S.act + Math.floor(t * 2), PLAN.chip) && dx < hitR) { swing(kx); out.gx = P.x; out.why = 'chip his plate'; return out; }
  out.gx = away(hitR + 10); out.why = 'on his guard: wait for his blow'; return out;
}
