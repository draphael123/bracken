// src/fallen-sun.js - THE FALLEN SUN PRIEST, THE SUN TEMPLE's boss - THE HERO AS THE BOSS (claude/suntemple, 11-06, the OPUS GREYBOX; Daniel 10-14 "THE BOSS IS THE
// HERO": a hero-turned-boss on THE DESERT PRIEST's OWN KIT (B5), like the Paladin / Blood Knight / Chieftain bosses; plan-desert-1105 s5, APPROVED 11-05).
//
// WHO HE IS: the hero Desert Priest (src/chars.js bakeSunPriest, drawn x FS.scale by main.js - the man you will play; ART: a fallen palette owed) with ONLY the
//   hero's kit (src/desert-priest.js DP is his numbers, scaled to a boss): his STAFF RUN (X), THE SUNBEAM (hold X: a beam along his row - from his second phase a
//   MIRROR in its path turns it away), THE FLARE (hold C: a burst round him that catches a swing in it), CONSECRATE (DOWN+C: a patch of sun at his feet that mends
//   him and is LIGHT to him), SUNFALL (his plunge: a told leap, a ring where he lands), THE DISC (tap C: his guard, by angle) and, in the third phase, SUNRISE
//   (his ultimate, on a full bar: every window open, every mirror his, six seconds). He walks at a hero's pace and never teleports.
// THE CENTRAL MECHANIC (B17, the temple's light REVERSED): he has the hero's RADIANCE - it FILLS while he stands in the sun and DRAINS in shade, and every cast but
//   the staff costs it. PUT HIM IN SHADE: strike a window's CORD and its SHUTTER falls (the window goes dark for FS.shut.t s, told before it opens), strike a MIRROR
//   and it throws its window's light the other way (it stays). A cast whose wind-up ends in SHADE with too little radiance FIZZLES - "HIS LIGHT FAILS" - and he is
//   OPEN (B10: the gold ring + timer, x FS.open.mul, at most FS.open.cap of him; B4 he stands still; B3 then a told FS.ward.t s WARD). Run his bar dry in shade and
//   he GUTTERS - the same opening. HE SEEKS THE LIGHT: in shade he walks to the nearest lit floor, so the light you leave is where he goes. P2 (THE NOON) a fight
//   over the light: he walks to a turned mirror or a shut window and TURNS IT BACK (a told move: a blow that lands in its wind-up stays his hand). P3 (SUNRISE): his
//   full bar throws every shutter open and every mirror back for six seconds of his light; when the sun sets on him he is OPEN.
// A DUELIST (B11, B15): ALWAYS HITTABLE. On guard (walking, seeking, recovering) THE DISC turns a blow from his FRONT at FS.guard.front (0.4); from behind it lands
//   whole; while COMMITTED (every told move, its release) a blow lands whole. The told ward after an opening takes blows at FS.ward.take (0.4) - never zero.
// HIS TOLD MOVES (each its own windup + release frame off the hero sheet, FS_POSES - B16; one windup at a time):
//   STAFF RUN     !   two or three blows stepping in (a shield turns each; ON THE BEAT he reels)              answer: block / parry / back off
//   SUNBEAM       !   planted, a dotted line along his row, then the beam (to the wall, or the first mirror)   answer: jump it, a gallery, a mirror between
//   THE FLARE     !   (you close and swing in front of him) the sun goes off round him                        answer: do not swing into it - step out
//   CONSECRATE    !   down on his knees: a patch of sun at his feet (his light: it mends him)                 answer: draw him off it; burn it out
//   SUNFALL       !!  a red ring at your feet, he leaps and comes down staff-first in a ring of light            answer: off the ring
//   P2 THE TURN   (told stance) he walks to a mirror / a cord and turns the light back                         answer: strike him in the wind-up
//   P3 SUNRISE    !!  (a full bar) the whole sanctum in his light for six seconds, his beams x FS.rise.beamMul  answer: survive it - then he is open
// PURE: no DOM, no main.js. The world is a context `c` (src/fallen-sun-hands.js binds it; simFights below binds a node one).
import { trace, litBox } from './light.js';

export const FS = {
  hp: 1900, w: 12, h: 24, scale: 1.5, markH: 50,
  walk: 62, seekV: 78, keep: 34, turn: 0.4, gap: [0.6, 0.5, 0.42],
  rad: { start: 0.6, fill: 0.4, drain: 0.08, ward: 0.5 },   /* his RADIANCE: fills 0.4/s in the sun (2.5 s empty -> full), drains 0.08/s in shade; the ward gives him back at least 0.5 */
  guard: { front: 0.4 },                                     /* B11/B15: THE DISC turns a blow from his front at x0.4 on guard; behind, whole */
  open: { t: 3.2, mul: 1.7, cap: 0.12 }, ward: { t: 2.5, take: 0.4 }, reelT: 0.8,
  staff: { tell: 0.5, t: 0.16, beat: 0.32, n: [2, 3, 3], reach: 34, step: 90, dmg: 16 },
  beam: { tell: 0.7, t: 1.0, tick: 0.2, dmg: 6, cost: 0.3, y0: 22, y1: 8, cd: 3 },   /* the beam's band: his feet - y0 .. feet - y1 (chest height: jump it) */
  flare: { tell: 0.45, r: 44, dmg: 12, swingMul: 1.6, cost: 0.4, cd: 5, near: 40 },
  consec: { tell: 0.6, cost: 0.33, r: 24, t: 6, mend: 0.006, burn: 5, cd: 10 },
  fall: { tell: 0.8, fly: 0.55, r: 28, dmg: 24, cost: 0.25, patch: 2 },
  rise: { tell: 1.2, t: 6, need: 0.9, beamMul: 1.5, cd: 20 },
  turnB: { tell: 0.7, walkT: 3.2, cd: 6, reach: 14 },
  shut: { t: [9, 7, 7], warn: 1.2 },                         /* a struck cord: the shutter shut this long (by phase), told FS.shut.warn s before it opens */
  seek: { below: 0.6, walkT: 3, tries: 2 },
  p2: 0.65, p3: 0.3,
};
export const CYCLES = {
  1: [['staff', 'beam', 'staff', 'consec'], ['beam', 'staff', 'flare', 'staff'], ['staff', 'fall', 'beam', 'staff']],
  2: [['beam', 'staff', 'fall', 'staff', 'beam'], ['staff', 'consec', 'beam', 'staff'], ['fall', 'beam', 'staff', 'flare', 'staff']],
  3: [['beam', 'staff', 'fall', 'staff'], ['beam', 'staff', 'beam', 'fall', 'staff'], ['staff', 'consec', 'beam', 'fall']],   /* (SUNRISE is not in them: it comes off his full bar - nextMove) */
};
export const MOVES = {
  staffTell: { mark: '!', answer: 'block' }, staffBeatTell: { mark: '!', answer: 'block' }, beamTell: { mark: '!', answer: 'jump' }, flareTell: { mark: '!', answer: 'dodge' },
  consecTell: { mark: '!', answer: 'dodge' }, fallTell: { mark: '!!', answer: 'dodge' }, riseTell: { mark: '!!', answer: 'dodge' }, turnTell: { mark: '', answer: '' },
};
export const MOVE_NAME = { staff: 'HIS STAFF', beam: 'THE SUNBEAM', flare: 'THE FLARE', consec: 'HIS CONSECRATED GROUND', fall: 'SUNFALL', rise: 'SUNRISE' };
export const PHASE_NAME = { 1: 'THE DAWN', 2: 'THE NOON', 3: 'SUNRISE' };
const CASTS = { beamTell: 'beam', flareTell: 'flare', consecTell: 'consec', fallTell: 'fall' };
const GUARD_MODES = new Set(['walk', 'recover', 'seek', 'turnWalk']);
export const isGuardMode = m => GUARD_MODES.has(m);

/* ---------- HIS SPRITE IS THE HERO'S OWN SHEET (src/chars.js bakeSunPriest): main.js bakes this list into SPR.fallensun, a pose per frame, drawn x FS.scale.
   [pose, frame]; the LAST row is his hurt. Every told move has its OWN windup + release here (B16). A pose the sheet lacks falls back to idle (main.js) ---------- */
export const FS_POSES = [['idle', 0], ['run', 0], ['run', 2], ['run', 4],
  ['atk', 0], ['atk', 1], ['atk', 2],                        /* 4-6   the staff run: drawn back, the jab, the sweep */
  ['spBeam', 0], ['spBeam', 1],                              /* 7,8   THE SUNBEAM: planted (the tell), the beam */
  ['spFlare', 0], ['spFlare', 1],                            /* 9,10  THE FLARE: drawn in, flung wide */
  ['spConsec', 0], ['spConsec', 1],                          /* 11,12 CONSECRATE: kneeling, the gold along the floor */
  ['jump', 0], ['plunge', 0],                                /* 13,14 SUNFALL: the leap, staff-first down */
  ['spRise', 0], ['spRise', 1],                              /* 15,16 SUNRISE: gathered low, the sun stood behind him */
  ['spDisc', 0],                                             /* 17    THE DISC raised (his guard read) */
  ['heavy', 0], ['heavy', 1],                                /* 18,19 THE TURN: the staff hauled back, swung into the mirror / the cord */
  ['slump', 0], ['hurt', 0]];                                /* 20 slump (his light fails) | 21 hurt */
export const FS_IDX = { falter: 20, hurt: 21 };
export function fsFrame(e) {
  switch (e.mode) {
    case 'staffTell': case 'staffBeatTell': return 4; case 'staff': return e.modeT > FS.staff.t * 0.5 ? 5 : 6;
    case 'beamTell': return 7; case 'beam': return 8;
    case 'flareTell': return 9; case 'flare': return 10;
    case 'consecTell': return 11; case 'consec': return 12;
    case 'fallTell': return 13; case 'fall': return (e.lift || 0) > 30 ? 13 : 14; case 'land': return 14;
    case 'riseTell': return 15; case 'rise': return 16;
    case 'turnTell': return 18; case 'turn': return 19;
    case 'falter': return 20; case 'reel': return 21; case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 21;
  if (Math.abs(e.vx || 0) > 3) return 1 + Math.floor((e.anim || 0) * 7) % 3;
  return e.mode === 'recover' || e.mode === 'walk' ? (e.guardFx > 0 ? 17 : 0) : 0;
}

/* ---------- THE SANCTUM ---------- */
export function geom(A, TS) {
  const q = A.fs, X = c => (q.sx + c) * TS;
  const S0 = { windows: [8, 22, 36], mirrors: [8, 36], cords: [4, 25, 40], ledges: [[12, 16], [28, 32]], ledgeRow: 17, roof: 6 };
  return { TS, x0: A.x0, x1: A.x1, floorY: q.R * TS, roofY: (S0.roof + 1) * TS, beamRow: (q.R - 2) * TS,
    windows: S0.windows.map(c => X(c) + TS / 2), mirrors: S0.mirrors.map(c => X(c) + TS / 2),
    cords: S0.cords.map((c, i) => ({ i, x: X(c) + TS / 2, l: X(c) + 2, r: X(c) + TS - 2, t: (q.R - 3) * TS + 4, b: (q.R - 1) * TS })),
    ledges: S0.ledges.map(([a, b]) => ({ x0: X(a), x1: X(b + 1), y: S0.ledgeRow * TS })) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, rad: FS.rad.start, ward: 0, openTaken: 0, behindT: 0, staffLeft: 0, lit: true,
    shut: G.windows.map(() => 0), told: {}, riseCd: 0, seekTries: 0, patches: [], beam: null, leap: null, sunrise: 0, beamCd: 1, flareCd: 2, consecCd: 4, turnCd: 2, turnId: null,
    n: { cycles: 0, opens: 0, fizzles: 0, gutters: 0, sets: 0, wards: 0, warded: 0, guarded: 0, behind: 0, landed: 0, staffs: 0, beams: 0, flares: 0, consecs: 0, falls: 0,
      rises: 0, turns: 0, turnsCut: 0, seeks: 0, cords: 0, ripostes: 0, moves: {} } };
}
export const fPhase = e => (e.hp <= e.maxHp * FS.p3 ? 3 : e.hp <= e.maxHp * FS.p2 ? 2 : 1);
export const fsOpen = e => !!e && e.mode === 'falter' && (e.open || 0) > 0;
export const guarded = (e, S) => !!e && !fsOpen(e) && GUARD_MODES.has(e.mode);
const setMode = (e, m, t) => { e.mode = m; e.modeT = t; };
const clampX = (G, x) => Math.max(G.x0 + 14, Math.min(G.x1 - 14, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : mv && mv.mark ? 'tell' : 'glow'); }
const setRad = (S, v) => { S.rad = Math.max(0, Math.min(1, v)); };
/* IS HE IN LIGHT: the sanctum's sun on his body (c.lit), his own consecrated ground, or SUNRISE */
export function inLight(e, S, c) {
  if (S.sunrise > 0) return true;
  if (S.patches.some(p => Math.abs(p.x - e.x) <= p.r)) return true;
  const hw = FS.w * FS.scale / 2, hh = FS.h * FS.scale;
  return !!c.lit([e.x - hw, e.x + hw, e.y - hh, e.y - 2]);
}
function falter(e, S, c, why, word) { setMode(e, 'falter', FS.open.t + 0.05); e.open = FS.open.t; e.lift = 0; S.openTaken = 0; S.n.opens++; S.staffLeft = 0; S.beam = null; S.leap = null;
  c.fx('open', e.x, e.y); c.sound('falter'); c.shake(4); c.number(e.x, e.y - 72, why, '#8fd160'); if (word) c.word(word); }
function endFalter(e, S, c) { e.open = 0; S.ward = FS.ward.t; S.n.wards++; S.openTaken = 0; setRad(S, Math.max(S.rad, FS.rad.ward)); c.fx('ward', e.x, e.y); c.sound('tell');
  c.number(e.x, e.y - 72, 'THE LIGHT RETURNS TO HIM: WARDED', '#9ab0c0'); }

/* ---------- THE RULE ON HIM (the hands call these) ---------- */
/* A BLOW ON HIM. Returns { dmg, read }: 'open' (his light failed), 'ward' (x take), 'guard' (THE DISC, his front, x front), 'landed' (behind, or committed) */
export function blowOn(e, S, c, dmg, fromX) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return { dmg: 0, read: 'asleep' };
  if (fsOpen(e)) { const d = Math.max(0, Math.min(Math.round(dmg * FS.open.mul), Math.round(e.maxHp * FS.open.cap - S.openTaken))); S.openTaken += d; return { dmg: d, read: 'open' }; }
  if (S.ward > 0) { S.n.warded++; return { dmg: Math.max(1, Math.round(dmg * FS.ward.take)), read: 'ward' }; }
  const front = Math.sign((fromX ?? e.x) - e.x) === (e.face || 1) || fromX === e.x;
  if (guarded(e, S) && front) { S.n.guarded++; if (!S.told.disc || S.n.guarded % 6 === 0) { S.told.disc = 1; c.number(e.x, e.y - 64, 'HIS DISC TURNS IT: PUT HIM IN SHADE', '#ffd36b'); } return { dmg: Math.max(1, Math.round(dmg * FS.guard.front)), read: 'guard' }; }
  if (guarded(e, S)) S.n.behind++;
  S.n.landed++;
  if (e.mode === 'turnTell') { S.n.turnsCut++; setMode(e, 'recover', 0.5); S.turnCd = FS.turnB.cd * 0.6; S.turnId = null; c.number(e.x, e.y - 64, 'HIS HAND IS STAYED', '#8fd160'); }
  if (!S.told.land) { S.told.land = 1; c.number(e.x, e.y - 64, guarded(e, S) ? 'BEHIND HIS DISC: IT LANDS' : 'COMMITTED: IT LANDS', '#8fd160'); }
  return { dmg, read: 'landed' };
}
/* HIS STAFF TURNED ON THE BEAT (a parry, a perfect guard): he REELS */
export function blowTurned(e, S, c, perfect) { if (!e || !e.alive || fsOpen(e) || S.ward > 0 || !perfect) return;
  if (e.mode === 'staff' || e.mode === 'staffBeatTell') { S.n.ripostes++; S.staffLeft = 0; setMode(e, 'reel', FS.reelT); e.vx = 0; c.number(e.x, e.y - 64, 'ON THE BEAT: HE REELS', '#8fd160'); } }
/* A CORD STRUCK (any hero's blow on it): the window's SHUTTER falls */
export function cordStruck(e, S, c, i) { if (!S || S.shut[i] > 0 || S.sunrise > 0) return false; S.shut[i] = FS.shut.t[S.ph - 1]; S.n.cords++; c.sound('shutter');
  c.number(S.G.windows[i], S.G.roofY + 18, S.told.cord ? 'THE SHUTTER FALLS' : 'THE SHUTTER FALLS: THAT WINDOW IS DARK', '#c8d8e8'); S.told.cord = 1; return true; }

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, air, alive, swinging, pp }], c = the world:
   c.lit([l, r, t, b]) -> in the sanctum's sun   c.mirrors() -> [{ i, x, state, init }]   c.setMirror(i, state)   c.hit(box, dmg, name, o) -> landed
   c.number(x, y, line, col)  c.word(line)  c.mark(m)  c.sound(k)  c.fx(kind, x, y, r)  c.shake(n)  c.music(ph)  c.rng() ---------- */
export function stepFallen(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY - (e.lift || 0); e.anim = (e.anim || 0) + dt;
  for (const k of ['beamCd', 'flareCd', 'consecCd', 'turnCd', 'riseCd']) S[k] = Math.max(0, S[k] - dt);
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  /* THE SHUTTERS: count down; told before one opens */
  S.shut.forEach((t, i) => { if (t <= 0) return; const t2 = Math.max(0, t - dt); if (t > FS.shut.warn && t2 <= FS.shut.warn) c.number(G.windows[i], G.roofY + 18, 'THE SHUTTER CREAKS', '#ff9a5c'); S.shut[i] = t2; });
  /* HIS PATCHES (consecrate, sunfall's) mend him while he stands on one, and burn the heroes on them */
  for (const p of S.patches) { p.t -= dt; p.tick = (p.tick || 0) - dt; }
  S.patches = S.patches.filter(p => p.t > 0);
  if (e.mode !== 'sleep' && e.mode !== 'wake') {
    const on = S.patches.find(p => Math.abs(p.x - e.x) <= p.r); if (on && e.hp < e.maxHp) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * FS.consec.mend * dt);
    for (const p of S.patches) if (p.tick <= 0) { p.tick = 0.5; c.hit([p.x - p.r, p.x + p.r, G.floorY - 10, G.floorY], Math.round(FS.consec.burn * 0.5), MOVE_NAME.consec, { key: 'pt' + p.id + '.' + Math.round(p.t * 2), noKnock: true }); } }
  /* SUNRISE: six seconds of his light */
  if (S.sunrise > 0) { S.sunrise = Math.max(0, S.sunrise - dt); if (S.sunrise === 0) { setRad(S, 0); S.n.sets++; falter(e, S, c, 'THE SUN SETS ON HIM: STRIKE', 'THE SUN SETS'); return; } }
  /* RADIANCE: fills in the light, drains in the shade */
  S.lit = inLight(e, S, c);
  if (e.mode !== 'sleep' && e.mode !== 'wake' && !fsOpen(e)) setRad(S, S.rad + (S.lit ? FS.rad.fill : -FS.rad.drain) * dt);
  e.rad = S.rad;
  stepWorld(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = CYCLES[1][0].slice(); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* HE GUTTERS: his bar run dry in the shade (not in his ward, not mid-cast) */
  if (!S.lit && S.rad <= 0 && S.ward <= 0 && GUARD_MODES.has(e.mode)) { S.n.gutters++; falter(e, S, c, 'HE GUTTERS OUT IN THE SHADE: STRIKE', 'HIS LIGHT FAILS'); return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = fPhase(e);
  if (want > S.ph && !fsOpen(e) && GUARD_MODES.has(e.mode)) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    if (want === 2) { c.word('THE NOON'); c.number((G.x0 + G.x1) / 2, G.floorY - 140, 'THE NOON: HE TURNS THE LIGHT BACK - STRIKE HIM AT IT', '#ffd36b'); }
    if (want === 3) { c.word('SUNRISE'); c.number((G.x0 + G.x1) / 2, G.floorY - 140, 'HE GATHERS THE SUN: A FULL BAR IS SUNRISE', '#ff6b6b'); }
    c.sound('tellHard'); c.shake(4); setMode(e, 'recover', 0.8); return; }
  /* THE FLARE, the hero's own answer to a swing in his face: you close and swing in front of him (on guard, off cooldown, light enough) */
  if (GUARD_MODES.has(e.mode) && S.flareCd <= 0 && S.ward <= 0) { const q = h.find(p => p.alive && p.swinging && Math.abs(p.x - e.x) < FS.flare.near && Math.sign(p.x - e.x) === (e.face || 1) && Math.abs(p.y - e.y) < 30);
    if (q) { S.flareCd = FS.flare.cd; S.n.flares++; tell(e, S, c, 'flareTell', FS.flare.tell); if (!S.told.flare) { S.told.flare = 1; c.number(e.x, e.y - 72, 'THE FLARE: DO NOT SWING INTO IT', '#ffd36b'); } return; } }
  switch (e.mode) {
    case 'falter': e.vx = 0; if (e.open <= 0) { endFalter(e, S, c); setMode(e, 'recover', 0.4); } return;   /* B4: on his knees, still */
    case 'reel': e.vx = 0; if (e.modeT <= 0) setMode(e, 'recover', 0.3); return;
    case 'recover': e.vx = 0; if (e.modeT <= 0) nextMove(e, S, P, h, c); return;
    case 'walk': { const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > FS.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      const x0 = e.x; if (Math.abs(d) > FS.keep + 6) e.x = clampX(G, e.x + Math.sign(d) * FS.walk * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      if (!S.lit && S.rad < FS.seek.below && S.sunrise <= 0 && maybeSeek(e, S, c)) return;
      if (e.modeT <= 0) nextMove(e, S, P, h, c); return; }
    case 'seek': { const tx = S.seekX; if (tx === undefined || S.lit) { setMode(e, 'recover', 0.15); return; }
      const d = tx - e.x; e.face = Math.sign(d) || e.face; if (Math.abs(d) < 6 || e.modeT <= 0) { setMode(e, 'recover', 0.2); return; }
      const x0 = e.x; e.x = clampX(G, e.x + Math.sign(d) * FS.seekV * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); return; }
    case 'turnWalk': { const tg = turnTarget(S, c, S.turnId); if (!tg) { setMode(e, 'walk', 0.3); S.turnId = null; return; }
      const d = tg.x - e.x; e.face = Math.sign(d) || e.face; if (Math.abs(d) > FS.turnB.reach) { const x0 = e.x; e.x = clampX(G, e.x + Math.sign(d) * FS.walk * 1.2 * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); if (e.modeT <= 0) { setMode(e, 'walk', 0.3); S.turnId = null; } return; }
      e.vx = 0; tell(e, S, c, 'turnTell', FS.turnB.tell); c.number(e.x, e.y - 64, tg.kind === 'mirror' ? 'HE TURNS THE MIRROR BACK: STAY HIS HAND' : 'HE PULLS THE SHUTTER OPEN: STAY HIS HAND', '#ffd36b'); return; }
    case 'turnTell': e.vx = 0; if (e.modeT <= 0) { const tg = turnTarget(S, c, S.turnId); if (tg) { if (tg.kind === 'mirror') c.setMirror(tg.i, tg.init); else S.shut[tg.i] = 0; S.n.turns++; c.sound('slam'); c.fx('turn', tg.x, G.beamRow); }
      S.turnId = null; S.turnCd = FS.turnB.cd; setMode(e, 'turn', 0.25); } return;
    case 'turn': e.vx = 0; if (e.modeT <= 0) setMode(e, 'recover', FS.gap[S.ph - 1]); return;
  }
  stepMove(e, S, dt, P, h, c);
}
/* WHERE IS THE LIGHT: the lit floor columns at his chest (px centres), nearest first */
function litSpots(e, S, c) { const G = S.G, out = []; for (let x = G.x0 + 16; x <= G.x1 - 16; x += 8) if (c.lit([x - 4, x + 4, G.beamRow, G.beamRow + 12])) out.push(x); return out.sort((a, b) => Math.abs(a - e.x) - Math.abs(b - e.x)); }
function maybeSeek(e, S, c) { const spots = litSpots(e, S, c); if (!spots.length) return false;
  S.seekX = spots[0]; S.n.seeks++; setMode(e, 'seek', FS.seek.walkT); if (!S.told.seek) { S.told.seek = 1; c.number(e.x, e.y - 72, 'HE SEEKS THE LIGHT: TAKE IT FROM HIM', '#ffd36b'); } return true; }
/* WHAT HE TURNS BACK (P2+): a mirror off its first setting, or a shut window - the one nearest him */
function turnTarget(S, c, id) { const G = S.G, all = [];
  for (const m of (c.mirrors() || [])) if (m.state !== m.init) all.push({ kind: 'mirror', i: m.i, x: m.x, init: m.init, id: 'm' + m.i });
  S.shut.forEach((t, i) => { if (t > FS.shut.warn) all.push({ kind: 'cord', i, x: G.cords[i].x, id: 'c' + i }); });
  return id ? all.find(q => q.id === id) || null : all; }
function nextMove(e, S, P, h, c) {
  const dx = P.x - e.x, ad = Math.abs(dx), G = S.G; e.face = Math.sign(dx) || e.face;
  /* P2+: THE TURN - in shade, off cooldown, something to turn back: he goes to it */
  if (S.ph >= 2 && !S.lit && S.turnCd <= 0 && S.ward <= 0 && S.sunrise <= 0) { const all = turnTarget(S, c).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x));
    if (all.length) { S.turnId = all[0].id; setMode(e, 'turnWalk', FS.turnB.walkT); if (!S.told.turn) { S.told.turn = 1; c.number(e.x, e.y - 72, 'HE GOES TO TURN THE LIGHT BACK', '#ffd36b'); } return; } }
  /* P3: SUNRISE comes off a FULL BAR (deny him the light and you deny him the sun) */
  if (S.ph === 3 && S.riseCd <= 0 && S.sunrise <= 0 && S.rad >= FS.rise.need && S.ward <= 0) { S.riseCd = FS.rise.cd; S.n.rises++; tell(e, S, c, 'riseTell', FS.rise.tell); c.number(e.x, e.y - 80, 'SUNRISE', '#ff6b6b'); return; }
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; const set = CYCLES[S.ph]; S.script = set[S.cycle % set.length].slice(); S.step = 0; }
  let m = S.script[S.step++];
  if (m === 'beam' && S.beamCd > 0) m = 'staff';
  if (m === 'consec' && S.consecCd > 0) m = 'staff';
  if (m === 'flare') m = ad < FS.flare.r + 10 ? 'flare' : 'beam';
  if (m === 'staff' && ad > FS.staff.reach + 40) { if (S.beamCd <= 0) m = 'beam'; else { setMode(e, 'walk', 0.45); S.step--; return; } }
  /* IN SHADE, LOW, A CAST NEXT: he goes to the light first (twice; then he casts where he stands - and it fizzles) */
  const cost = { beam: FS.beam.cost, flare: FS.flare.cost, consec: FS.consec.cost, fall: FS.fall.cost }[m];
  if (cost && !S.lit && S.rad < cost && S.sunrise <= 0 && S.ward <= 0 && S.seekTries < FS.seek.tries && maybeSeek(e, S, c)) { S.step--; S.seekTries++; return; }
  if (cost) S.seekTries = 0;
  switch (m) {
    case 'staff': S.staffLeft = FS.staff.n[S.ph - 1]; S.n.staffs++; tell(e, S, c, 'staffTell', FS.staff.tell); return;
    case 'beam': S.n.beams++; S.beamCd = FS.beam.cd; S.beam = { dir: e.face || 1, t: 0, tick: 0, end: beamEnd(e, S, c, e.face || 1) }; tell(e, S, c, 'beamTell', FS.beam.tell);
      if (!S.told.beam) { S.told.beam = 1; c.number(e.x, e.y - 72, 'THE SUNBEAM: JUMP IT, OR GET ON A GALLERY', '#ffd36b'); } return;
    case 'flare': S.n.flares++; S.flareCd = FS.flare.cd; tell(e, S, c, 'flareTell', FS.flare.tell); return;
    case 'consec': S.n.consecs++; S.consecCd = FS.consec.cd; tell(e, S, c, 'consecTell', FS.consec.tell); if (!S.told.consec) { S.told.consec = 1; c.number(e.x, e.y - 72, 'CONSECRATE: HIS OWN LIGHT - DRAW HIM OFF IT', '#ffd36b'); } return;
    case 'fall': S.n.falls++; S.leap = { x: clampX(G, P.x), fx: e.x }; tell(e, S, c, 'fallTell', FS.fall.tell); c.fx('ring', S.leap.x, G.floorY, FS.fall.r);
      if (!S.told.fall) { S.told.fall = 1; c.number(e.x, e.y - 72, 'SUNFALL: OFF THE RING', '#ff6b6b'); } return;
  }
  setMode(e, 'walk', 0.5);
}
/* HIS BEAM's far end: along his row to the wall, or - from THE NOON - to the first MIRROR in its way (a mirror turns it off the floor: a hero behind one is safe) */
export function beamEnd(e, S, c, dir) { const G = S.G; let end = dir > 0 ? G.x1 - 2 : G.x0 + 2;
  if (S.ph >= 2) for (const m of (c.mirrors() || [])) { if (dir > 0 && m.x > e.x + 8 && m.x < end) end = m.x; if (dir < 0 && m.x < e.x - 8 && m.x > end) end = m.x; }
  return end; }
/* THE CAST: at the end of its wind-up - in SHADE with too little radiance it FIZZLES (the opening); otherwise it spends and goes */
function cast(e, S, c, kind) {
  const cost = kind === 'beam' ? FS.beam.cost : kind === 'flare' ? FS.flare.cost : kind === 'consec' ? FS.consec.cost : FS.fall.cost;
  if (S.sunrise <= 0 && !S.lit && S.rad < cost && S.ward <= 0) { S.n.fizzles++; falter(e, S, c, 'HIS LIGHT FAILS: THE ' + (MOVE_NAME[kind] || 'CAST').replace(/^THE /, '') + ' FIZZLES - STRIKE', 'IN SHADE'); return false; }
  if (S.sunrise <= 0) setRad(S, S.rad - cost); return true;
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = t => setMode(e, 'recover', t ?? FS.gap[S.ph - 1]);
  e.vx = 0;
  const front = (reach, y0 = 30) => [f > 0 ? e.x - 6 : e.x - reach, f > 0 ? e.x + reach : e.x + 6, e.y - y0, e.y];
  switch (e.mode) {
    case 'staffTell': case 'staffBeatTell': if (e.modeT <= 0) { setMode(e, 'staff', FS.staff.t); c.sound('swing'); } return;
    case 'staff': { const x0 = e.x; e.x = clampX(G, e.x + f * FS.staff.step * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      c.hit(front(FS.staff.reach), FS.staff.dmg, MOVE_NAME.staff, { blockable: true, key: 'st' + S.act });
      if (e.mode !== 'staff') return;
      if (e.modeT <= 0) { S.staffLeft--; if (S.staffLeft > 0) { e.face = Math.sign(P.x - e.x) || f; tell(e, S, c, 'staffBeatTell', FS.staff.beat); } else after(); } return; }
    case 'beamTell': if (S.beam) S.beam.end = beamEnd(e, S, c, S.beam.dir); if (e.modeT <= 0) { if (!cast(e, S, c, 'beam')) return; setMode(e, 'beam', FS.beam.t); c.sound('beam'); } return;
    case 'beam': { const B = S.beam; if (!B) { after(); return; } B.end = beamEnd(e, S, c, B.dir); B.tick -= dt;
      if (B.tick <= 0) { B.tick = FS.beam.tick; const l = Math.min(e.x, B.end), r = Math.max(e.x, B.end);
        c.hit([l, r, e.y - FS.beam.y0, e.y - FS.beam.y1], Math.round(FS.beam.dmg * (S.sunrise > 0 ? FS.rise.beamMul : 1)), MOVE_NAME.beam, { blockable: true, noKnock: true, key: 'bm' + S.act + '.' + Math.round(e.modeT * 10) }); }
      if (e.modeT <= 0) { S.beam = null; after(); } return; }
    case 'flareTell': if (e.modeT <= 0) { if (!cast(e, S, c, 'flare')) return; setMode(e, 'flare', 0.3); c.sound('flare'); c.fx('flare', e.x, e.y, FS.flare.r);
        for (const q of h) if (q.alive && Math.hypot(q.x - e.x, q.y - e.y) < FS.flare.r) c.hit([q.x - 2, q.x + 2, q.y - 20, q.y], Math.round(FS.flare.dmg * (q.swinging ? FS.flare.swingMul : 1)), MOVE_NAME.flare, { key: 'fl' + S.act, who: q }); } return;
    case 'flare': if (e.modeT <= 0) after(); return;
    case 'consecTell': if (e.modeT <= 0) { if (!cast(e, S, c, 'consec')) return; setMode(e, 'consec', 0.35); S.patches.push({ id: S.act, x: e.x, r: FS.consec.r, t: FS.consec.t, tick: 0.5 }); c.sound('glow'); c.fx('consec', e.x, G.floorY, FS.consec.r); } return;
    case 'consec': if (e.modeT <= 0) after(); return;
    case 'fallTell': if (e.modeT <= 0) { if (!cast(e, S, c, 'fall')) return; setMode(e, 'fall', FS.fall.fly); c.sound('leap'); } return;
    case 'fall': { const L = S.leap; if (!L) { after(); return; } const k = 1 - Math.max(0, e.modeT) / FS.fall.fly; e.x = clampX(G, L.fx + (L.x - L.fx) * k); e.lift = Math.sin(Math.PI * k) * 64; e.face = Math.sign(L.x - L.fx) || f;
      if (e.modeT <= 0) { e.lift = 0; e.x = L.x; setMode(e, 'land', 0.35); c.shake(5); c.sound('slam'); c.fx('pillar', e.x, G.floorY, FS.fall.r);
        c.hit([e.x - FS.fall.r, e.x + FS.fall.r, G.floorY - 30, G.floorY], FS.fall.dmg, MOVE_NAME.fall, { key: 'sf' + S.act });
        S.patches.push({ id: S.act, x: e.x, r: FS.fall.r, t: FS.fall.patch, tick: 0.5 }); S.leap = null; } return; }
    case 'land': if (e.modeT <= 0) after(); return;
    case 'riseTell': if (e.modeT <= 0) { setMode(e, 'rise', 0.6); S.sunrise = FS.rise.t; S.shut = S.shut.map(() => 0); for (const m of (c.mirrors() || [])) c.setMirror(m.i, m.init);
        c.word('SUNRISE'); c.sound('rise'); c.shake(6); c.fx('rise', e.x, e.y); c.number((G.x0 + G.x1) / 2, G.floorY - 140, 'SUNRISE: THE SANCTUM IS HIS - SURVIVE IT', '#ff6b6b'); } return;
    case 'rise': if (e.modeT <= 0) after(0.3); return;
  }
  if (e.modeT <= 0) setMode(e, 'walk', 0.4);
}
/* the world outside his moves: nothing yet (hook kept so the hands can add) */
function stepWorld() {}

/* ---------- NODE: THE SELF-CHECK (tools/sun-temple.mjs) and THE BOT FLOW SIM ---------- */
function testWorld(G, o = {}) { const nums = []; let lit = o.lit ?? true; const mirrors = G.mirrors.map((x, i) => ({ i, x, state: i ? '/' : '\\', init: i ? '/' : '\\' }));
  return { nums, setLit: v => { lit = v; }, lit: () => (typeof lit === 'function' ? lit() : lit), mirrors: () => mirrors, setMirror: (i, s) => { mirrors[i].state = s; },
    hit: () => false, number: (x, y, t) => nums.push(t), word: t => nums.push('#' + t), mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, rng: Math.random }; }
const newBoss = G => ({ x: (G.x0 + G.x1) / 2, y: G.floorY, w: FS.w, h: FS.h, hp: FS.hp, maxHp: FS.hp, alive: true, face: -1, mode: 'walk', modeT: 9, open: 0, phase: 1 });
export function selfCheck(A, TS) {
  const out = [], G = geom(A, TS), ok = (c, m) => out.push([!!c, m]);
  const hero = (x, o) => [{ x, y: G.floorY, ground: true, alive: true, swinging: false, ...(o || {}) }];
  { const e = newBoss(G), S = newFight(G), c = testWorld(G);
    ok(blowOn(e, S, c, 20, e.x - 30).read === 'guard' && blowOn(e, S, c, 20, e.x - 30).dmg === 8, 'on guard THE DISC turns a blow from his front at x0.4 (20 -> 8): never nothing (B15)');
    ok(blowOn(e, S, c, 20, e.x + 30).dmg === 20, 'from behind his disc a blow lands whole (B11: guard by angle)');
    e.mode = 'beamTell'; ok(blowOn(e, S, c, 20, e.x - 30).dmg === 20, 'committed (a wind-up) it lands whole from any side'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G, { lit: false }); S.rad = 0.1; S.beamCd = 0; S.script = ['beam']; S.step = 0; setMode(e, 'recover', 0);
    stepFallen(e, S, 0.016, hero(e.x - 120), c); ok(e.mode === 'beamTell', 'his beam is told (planted: a dotted line along his row)');
    for (let i = 0; i < 60 && e.mode === 'beamTell'; i++) stepFallen(e, S, 0.016, hero(e.x - 120), c);
    ok(fsOpen(e) && S.n.fizzles === 1, 'THE RULE: a cast whose wind-up ends in SHADE with too little radiance FIZZLES - he is OPEN');
    ok(c.nums.some(t => /FIZZLES/.test(t)), 'told: HIS LIGHT FAILS ... FIZZLES - STRIKE');
    const d1 = blowOn(e, S, c, 20, e.x - 30).dmg; ok(d1 === 34, `open: x${FS.open.mul} (20 -> ${d1})`);
    let tot = d1; for (let i = 0; i < 40; i++) tot += blowOn(e, S, c, 20, e.x - 30).dmg; ok(tot === Math.round(FS.hp * FS.open.cap), `an opening is capped at ${Math.round(FS.open.cap * 100)}% of him (${tot})`);
    for (let i = 0; i < 400 && fsOpen(e); i++) stepFallen(e, S, 0.016, hero(e.x - 120), c);
    ok(S.ward > 0 && c.nums.some(t => /WARDED/.test(t)), 'after the opening: a told WARD');
    ok(blowOn(e, S, c, 20, e.x + 30).dmg === 8 && blowOn(e, S, c, 20, e.x + 30).read === 'ward', 'the ward takes blows at x0.4 - never zero (Daniel 10-16 floor)');
    S.rad = 0; e.mode = 'beamTell'; e.modeT = 0; stepFallen(e, S, 0.016, hero(e.x - 120), c); ok(!fsOpen(e), 'no second opening inside the ward'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G, { lit: true }); S.rad = 0.5; S.beamCd = 0; S.script = ['beam']; S.step = 0; setMode(e, 'recover', 0);
    for (let i = 0; i < 80; i++) stepFallen(e, S, 0.016, hero(e.x - 120), c);
    ok(!fsOpen(e) && S.n.beams === 1 && S.n.fizzles === 0, 'in the sun the same cast goes (it spends his bar): the light is his'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G, { lit: false }); S.rad = 0.02; setMode(e, 'walk', 9);
    for (let i = 0; i < 30; i++) stepFallen(e, S, 0.016, hero(e.x - 20), c); ok(fsOpen(e) && S.n.gutters === 1, 'run his bar dry in shade and he GUTTERS: open'); }
  { const e = newBoss(G), S = newFight(G); let lx = G.x0 + 40; const c = testWorld(G, { lit: b => Math.abs((b[0] + b[1]) / 2 - lx) < 10 }); c.lit = b => Math.abs((b[0] + b[1]) / 2 - lx) < 10;
    S.rad = 0.3; setMode(e, 'walk', 9); stepFallen(e, S, 0.016, hero(e.x + 20), c); ok(e.mode === 'seek' && Math.abs(S.seekX - lx) < 12, 'in shade he SEEKS THE LIGHT: he walks to the nearest lit floor (the light you leave is where he goes)'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G); ok(cordStruck(e, S, c, 1) && S.shut[1] === FS.shut.t[0] && !cordStruck(e, S, c, 1), 'a struck cord shuts its window for ' + FS.shut.t[0] + ' s (once)');
    for (let i = 0; i < 9.5 / 0.05; i++) stepFallen(e, S, 0.05, hero(e.x - 200), c); ok(S.shut[1] === 0 && c.nums.includes('THE SHUTTER CREAKS'), 'it is told before it opens again'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G, { lit: false }); S.ph = 2; S.rad = 0.9; S.turnCd = 0; c.setMirror(0, '/'); setMode(e, 'recover', 0); e.x = G.mirrors[0] + 100;
    for (let i = 0; i < 300 && e.mode !== 'turnTell'; i++) stepFallen(e, S, 0.016, hero(e.x + 60), c);
    ok(e.mode === 'turnTell', 'THE NOON: in shade he walks to a turned mirror and winds up to turn it back (told)');
    const r = blowOn(e, S, c, 20, e.x + 30); ok(r.dmg === 20 && e.mode === 'recover' && c.mirrors()[0].state === '/', 'a blow that lands in that wind-up STAYS HIS HAND (the mirror stays yours)');
    S.turnCd = 0; setMode(e, 'recover', 0); for (let i = 0; i < 400 && c.mirrors()[0].state !== '\\'; i++) stepFallen(e, S, 0.016, hero(e.x + 300), c);
    ok(c.mirrors()[0].state === '\\' && S.n.turns === 1, 'left alone, he turns it back: the fight over the light'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G); S.ph = 2; const sh = { ...e, x: G.mirrors[0] + 60 }; ok(beamEnd(sh, S, c, -1) === G.mirrors[0], 'from THE NOON his beam stops at the first mirror in its way (a hero behind a mirror is safe)');
    S.ph = 1; ok(beamEnd(sh, S, c, -1) === G.x0 + 2, 'in THE DAWN it runs to the wall'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G, { lit: true }); e.hp = e.maxHp * 0.25; S.ph = 3; S.rad = 1; S.script = ['staff']; S.step = 0; setMode(e, 'recover', 0); cordStruck(e, S, c, 0); c.setMirror(1, '\\');
    for (let i = 0; i < 120 && S.sunrise <= 0; i++) stepFallen(e, S, 0.016, hero(e.x - 120), c);
    ok(S.sunrise > 0 && S.shut.every(t => t === 0) && c.mirrors()[1].state === '/', 'P3 SUNRISE on a full bar: every shutter open, every mirror his');
    c.setLit(false); for (let i = 0; i < 400 && S.sunrise > 0; i++) stepFallen(e, S, 0.016, hero(e.x - 120), c);
    ok(fsOpen(e) && S.n.sets === 1, 'when the sun sets on him he is OPEN (the reward for surviving it)'); }
  { const e = newBoss(G), S = newFight(G), c = testWorld(G); e.hp = e.maxHp * 0.6; setMode(e, 'falter', 2); e.open = 2; stepFallen(e, S, 0.016, hero(e.x - 40), c); ok(S.ph === 1, 'a phase never cuts an opening short');
    e.open = 0; e.mode = 'walk'; stepFallen(e, S, 0.016, hero(e.x - 40), c); ok(S.ph === 2, 'it comes at the next guard beat (65%)'); }
  ok(Object.keys(MOVES).every(m => /Tell$/.test(m)) && FS_POSES.length === 22 && FS_IDX.hurt === FS_POSES.length - 1, 'every told move has a tell mode; 22 poses, the last his hurt');
  ok(['staffTell', 'beamTell', 'beam', 'flareTell', 'consecTell', 'fallTell', 'fall', 'riseTell', 'turnTell', 'falter'].every(m => fsFrame({ mode: m, modeT: 0.1 }) > 0), 'every told move and the opening draw their own pose (B16)');
  ok(FS.guard.front >= 0.4 && FS.ward.take >= 0.4, 'B15 / the resist floor: x' + FS.guard.front + ' on guard, x' + FS.ward.take + ' in the ward');
  return out;
}

/* THE BOT FLOW SIM: one hero (knight-ish numbers, 3 flasks, a human's reaction) against the pure fight in the real sanctum's light (light.js on the level's
   tiles). Its plan: if he stands in light, go and take it (strike the cord of the window that lights him, or the mirror that throws it); else close and strike;
   jump the beam, leave the sunfall ring, back out of a flare. A PACE read (does the fight resolve, how long, which openings) - never the win rate. */
export function simFights(A, TS, N, env) { env = { block: 0.5, ...env };   /* block: the share of his yellow blows a shield hero takes (a knight: ~half, human-ish) */
  const G = geom(A, TS), runs = [];
  for (let seed = 1; seed <= N; seed++) {
    let s = seed * 9301 + 49297; const rng = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const room = JSON.parse(JSON.stringify(env.sanctum)); const mirrors = room.mirrors.map((m, i) => ({ ...m, i, init: m.state }));
    const e = newBoss(G); e.mode = 'walk'; e.modeT = 0.8; const S = newFight(G);
    const hero = { x: G.x0 + 40, y: G.floorY, hp: 100, flasks: 3, alive: true, ground: true, swinging: false, cd: 0, react: 0, jumpT: 0 };
    let res = null; const lightNow = () => { const srcs = room.sources.map((q, i) => ({ ...q, off: S.shut[i] > 0 })); return trace(env.at, srcs, mirrors, [], { opaque: env.opaque }); };
    const c = { lit: b => litBox(res, b), mirrors: () => mirrors.map(m => ({ i: m.i, x: (m.x + 0.5) * TS, state: m.state, init: m.init })), setMirror: (i, st) => { mirrors[i].state = st; },
      hit: (bx, d, name, o) => { if (!hero.alive) return false; if (hero.jumpT > 0 && name === MOVE_NAME.beam) return false;
        if (hero.x < bx[0] - 6 || hero.x > bx[1] + 6) return false; const k = o && o.key; if (k && hero.keys && hero.keys.has(k)) return false; (hero.keys = hero.keys || new Set()).add(k);
        if (o && o.blockable && rng() < env.block) { hero.blocked = (hero.blocked || 0) + 1; return false; } hero.hp -= d; hurtBy[name] = (hurtBy[name] || 0) + d; if (hero.hp <= 0) { if (hero.flasks > 0) { hero.flasks--; hero.hp = 60; } else hero.alive = false; } return true; },
      number: () => {}, word: () => {}, mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, rng };
    const hurtBy = {}; const dt = 1 / 30; let t = 0, opensBy = { fizzle: 0, gutter: 0, set: 0 };
    while (t < 400 && e.alive && hero.alive) {
      res = lightNow(); hero.cd -= dt; hero.jumpT = Math.max(0, hero.jumpT - dt); hero.react -= dt; hero.swinging = false;
      /* the hero's plan */
      const threat = e.mode === 'beamTell' || e.mode === 'beam', ring = S.leap && (e.mode === 'fallTell') && Math.abs(S.leap.x - hero.x) < FS.fall.r + 6;
      if (threat && e.mode === 'beam' && hero.react <= 0 && rng() < 0.75) { hero.jumpT = 0.55; hero.react = 0.8; }
      let goal = e.x - Math.sign(e.x - hero.x || 1) * 26, strike = null;
      if (ring) goal = hero.x + (hero.x < S.leap.x ? -60 : 60);
      else if (e.mode === 'flareTell') goal = hero.x + (hero.x < e.x ? -50 : 50);
      else if (S.lit && !fsOpen(e) && S.sunrise <= 0) { /* take his light: the cord over his window, or the mirror that throws it */
        const ex = Math.floor(e.x / TS), wi = G.windows.findIndex(wx => Math.abs(wx - e.x) < 12);
        if (wi >= 0 && S.shut[wi] <= 0) strike = { x: G.cords[wi].x, cord: wi };
        else { const mi = mirrors.findIndex(m => (m.state === '\\' && ex > m.x) || (m.state === '/' && ex < m.x)); if (mi >= 0 && mirrors[mi].state === mirrors[mi].init) strike = { x: (mirrors[mi].x + 0.5) * TS, mirror: mi };
          else { const ci = S.shut.findIndex((q, i) => q <= 0 && Math.abs(G.windows[i] - e.x) < 200); if (ci >= 0) strike = { x: G.cords[ci].x, cord: ci }; } }
        if (strike) goal = strike.x; }
      const d = goal - hero.x; if (Math.abs(d) > 4) hero.x += Math.sign(d) * Math.min(Math.abs(d), 92 * dt);
      hero.x = Math.max(G.x0 + 8, Math.min(G.x1 - 8, hero.x));
      if (strike && Math.abs(strike.x - hero.x) < 14 && hero.cd <= 0) { hero.cd = 0.45; if (strike.cord !== undefined) cordStruck(e, S, c, strike.cord); else mirrors[strike.mirror].state = mirrors[strike.mirror].state === '/' ? '\\' : '/'; }
      else if (Math.abs(e.x - hero.x) < 30 && hero.cd <= 0 && (e.lift || 0) < 8) { hero.cd = 0.45; hero.swinging = true; const r = blowOn(e, S, c, 14, hero.x); e.hp -= r.dmg; if (e.hp <= 0) e.alive = false; }
      const o0 = S.n.fizzles, g0 = S.n.gutters, s0 = S.n.sets;
      if (e.alive) stepFallen(e, S, dt, [{ ...hero, y: hero.y - (hero.jumpT > 0 ? 30 : 0) }], c);
      opensBy.fizzle += S.n.fizzles - o0; opensBy.gutter += S.n.gutters - g0; opensBy.set += S.n.sets - s0;
      t += dt;
    }
    runs.push({ seed, won: !e.alive, t: Math.round(t), ph: S.ph, hp: Math.max(0, Math.round(hero.hp)), flasks: hero.flasks, opens: S.n.opens, ...opensBy, cords: S.n.cords, turns: S.n.turns, turnsCut: S.n.turnsCut, seeks: S.n.seeks, rises: S.n.rises, fizzlesAt: S.n.fizzles, hurtBy, blocked: hero.blocked || 0 });
  }
  const won = runs.filter(r => r.won);
  return { wins: won.length + '/' + N, avgT: won.length ? Math.round(won.reduce((a, r) => a + r.t, 0) / won.length) : null, runs };
}
