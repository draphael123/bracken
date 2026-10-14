// src/paladin-boss.js - THE PALADIN, THE LIT CHURCH's boss - THE HERO AS THE BOSS (claude/church2, LIT CHURCH 2, Daniel 10-10 brief + the Paladin 2 kit).
// Daniel: "should be the sprite of the paladin, a little bigger, similar to the death knight and pyromancer; use his moves; play like a normal player
// character. This is how you unlock him." He replaces the litchurch greybox fight (its light bar + falter moved to THE DEACON, src/deacon.js).
//
// WHO HE IS (design standard B5 + B11 + B17): the hero Paladin (src/chars.js bakePaladin, drawn x PB.scale by main.js like the Death Knight boss), with ONLY
//   the hero's kit (src/holy-ground.js HG is his numbers, scaled to a boss): the MAUL chain, CONSECRATE (his holy circle - the foe side of the same
//   makeHolyGround), the Light SPENDERS (EMPOWER 35, the HAMMER THROW 25, SMITE 20 in his circle, JUDGEMENT the full bar in his circle), the AEGIS (his ward:
//   it turns the front and the blow it turns fills his Light - the class's own trade), the VIGIL (the crouch rule: he KNEELS BY A HOLY LIGHT to fill his
//   Light), and one talent signature a phase - LIGHTBRINGER (P1) -> BASTION (P2: HOLY CHARGE) -> EARTHBREAKER (P3: HAMMER LEAP, his circle comes down with
//   him). He walks at a hero's pace, never teleports, never invents a charge (Holy Charge is his own L9 active).
// A DUELIST (B11): ALWAYS HITTABLE, GUARDS BY ANGLE - on guard (walking, recovering, his aegis raised) a blow from the FRONT by a hero at his height is
//   turned (B15: it still bites at PB.aegis.take, with a CLANK and "HIS AEGIS") and it FEEDS his Light; from BEHIND, from ABOVE (a jump), or while he is
//   COMMITTED (any told move, his vigil, a reel) it lands whole and DRAINS his Light. Low on Light (< PB.aegis.min) the aegis fails and the front lands too.
// THE CENTRAL MECHANIC (B17: the level's own verb - LIGHT and THE SNUFF): THE SANCTUARY'S THREE LAMPS feed his Light (PB.light.regen a second each that
//   burns) and they are where he kneels to fill it. SNUFF A LAMP (a blade through it) and his Light dims at once and its regen and its vigil go with it;
//   with every lamp dark he can only earn Light off you. His spenders are gated by it, so a starved Paladin throws no hammer, smites nothing and never
//   reaches Judgement. DRIVEN TO NOTHING by your blows (a landed blow or a snuffed lamp takes the last of it) HE FALTERS: PB.falterT s on one knee, OPEN
//   (B10: the gold ring + timer), x PB.falterMul, at most PB.falterCap of him; B4 he stands still; B3 then a told PB.wardT s WARD as the Light comes back to
//   PB.light.refill. (Judgement spends the whole bar too - his own choice, not a falter: the next blow that LANDS on an empty bar is the falter.)
// HIS TOLD MOVES (every one its own windup + release frame off the hero sheet, PAL_POSES; one windup at a time):
//   MAUL CHAIN   !   two or three maul blows stepping in (a shield turns each; ON THE BEAT he reels)                 answer: block / parry / back off
//   CONSECRATE   ~   (quiet: a gold glow + the word) he plants his circle at his feet: in it he hits x HG.hitMul and mends, a hero standing in it burns   answer: fight him off his ground
//   HAMMER THROW !   (25 Light) the hammer of light flies out at a hero's waist and comes back (two passes)       answer: jump it (twice) / a shield
//   SMITE        !!  (20 Light, in his circle) the overhead, and holy spires run both ways along the floor          answer: jump the spires
//   EMPOWER      !!  (35 Light, in his circle) the circle flares, grows and burns twice as hot                       answer: get out of it before the flare
//   JUDGEMENT    !!  (the full bar, in his circle) five crosses round him, then the light comes down on them        answer: stand between the columns, or far off
//   P2 HOLY CHARGE  ! the maul lowered, he charges the floor (a shield takes it and he rebounds)                   answer: jump / roll / shield
//   P3 HAMMER LEAP !! a red ring at your feet, he leaps and slams it: quakes both ways, and his circle comes with him   answer: off the ring, jump the quake
//   (his VIGIL at a lamp and his AEGIS are quiet, told stances: a word, a glow, the pose - B17's "quiet-but-told" reading)
// PHASES change the arena or the rule (B5): P2 THE BASTION - THE ROSE WINDOW KINDLES HIS LAMPS (every dark lamp lights again) + HOLY CHARGE; P3 THE
//   EARTHBREAKER - the leap, and his circle moves with him wherever he comes down.
// PURE: no DOM, no main.js. The world is a context `c` (src/paladin-boss-hands.js binds it); c.hg is a makeHolyGround instance (side 'foe').
// pbPlan is the boss lab's HUMAN bot (src/lab.js). DIAL_EXEMPT in src/boss-pressure.js (self-tuned in this lane).

export const PB = {
  hp: 2900, w: 18, h: 36, scale: 1.5, markH: 62,
  walk: 64, keep: 40, turn: 0.42, gap: [0.6, 0.5, 0.42],
  light: { max: 100, start: 55, regen: 1.4, land: 8, feed: 6, drain: 9, drainHeavy: 15, lampDim: 12, refill: 45, kneel: 26 },
  aegis: { take: 0.4, min: 8 },                       /* B15: a turned blow still bites x take; under min Light the aegis fails */
  falterT: 2.8, falterMul: 1.7, falterCap: 0.12, wardT: 3.0, reelT: 0.8, reboundT: 0.7,
  circle: { r: 56, life: 9, burnK: 0.32, mend: 0.18, cd: 7 },   /* r: HG.r x 1.27; burnK: x the hero's burn (10/s) -> ~3 a second on a hero in it (6 empowered); mend: x HG.heal (0.02/s) -> 0.36% a second of him */
  vigil: { below: 45, t: 2.0, cd: 9, walkT: 2.6 },
  chain: { tell: 0.55, beat: 0.4, t: 0.18, n: [2, 3, 3], reach: 40, step: 120, dmg: 22 },
  throw: { tell: 0.6, reach: 168, t: 1.4, dmg: 17, hy: 14, hr: 7 },     /* hy: the hammer's height off the floor (a hero's waist: a jump clears it) */
  smite: { tell: 0.8, dmg: 30, wave: 20, v: 175, life: 1.05 },
  empower: { tell: 0.75, r: 74, life: 12, flare: 22 },
  judge: { tell: 1.0, gap: 66, r: 14, t: 0.35, dmg: 40, near: 165 },
  charge: { tell: 0.6, v: 250, t: 0.8, dmg: 28 },
  leap: { tell: 0.85, fly: 0.5, r: 26, dmg: 36, wave: 18 },
  p2: 0.65, p3: 0.3,
};
/* THE CYCLES, by phase (cycle k uses [k % n]); JUDGEMENT and the VIGIL are not in them - they come when the bar is full / low (nextMove) */
export const CYCLES = {
  1: [['chain', 'plant', 'throw', 'chain', 'smite'], ['plant', 'chain', 'empower', 'chain', 'throw'], ['chain', 'throw', 'plant', 'smite', 'chain']],
  2: [['charge', 'chain', 'plant', 'smite', 'throw'], ['plant', 'empower', 'chain', 'charge', 'chain'], ['throw', 'charge', 'plant', 'smite', 'chain']],
  3: [['leap', 'chain', 'smite', 'charge', 'throw'], ['plant', 'leap', 'empower', 'chain', 'charge'], ['chain', 'leap', 'throw', 'smite', 'plant']],
};
/* THE MOVES: the mode while it is told, its mark, the answer (src/marks.js BY_HAND keeps the same rows) */
export const MOVES = {
  chainTell: { mark: '!', answer: 'block' }, chainBeatTell: { mark: '!', answer: 'block' }, throwTell: { mark: '!', answer: 'jump' },
  smiteTell: { mark: '!!', answer: 'jump' }, empowerTell: { mark: '!!', answer: 'dodge' }, judgeTell: { mark: '!!', answer: 'dodge' },
  chargeTell: { mark: '!', answer: 'jump' }, leapTell: { mark: '!!', answer: 'dodge' }, plantTell: { mark: '', answer: '' }, vigilTell: { mark: '', answer: '' },
};
export const MOVE_NAME = { chain: 'HIS MAUL', throw: 'THE HAMMER OF LIGHT', smite: 'SMITE', wave: 'THE HOLY SPIRES', flare: 'THE EMPOWERED GROUND', judge: 'JUDGEMENT', charge: 'HOLY CHARGE', leap: 'HAMMER LEAP', quake: 'THE QUAKE', ground: 'HOLY GROUND' };
/* the order the talent trees come in (the hero's own three: src/main.js TBR) */
export const PHASE_NAME = { 1: 'THE LIGHTBRINGER', 2: 'THE BASTION', 3: 'THE EARTHBREAKER' };

/* ---------- HIS SPRITE IS THE HERO'S OWN SHEET (src/chars.js bakePaladin): main.js bakes this list into SPR.paladinboss, a pose per frame, drawn x PB.scale.
   [pose, frame]; the LAST row is his hurt (HAS_HURT reads the last frame of a set). Every told move has its OWN windup + release here (B16):
   0 idle | 1-3 walk | 4 maul back (chain windup) | 5 the cut | 6 follow-through | 7,8 the overhead lifted (smite windup) | 9 driven down (smite release) |
   10,11 hallow: maul up, then set in the turf (consecrate) | 12,13 hurlH: the light gathered low, then flung (the throw) | 14,15 sanctify (empower) |
   16,17 blast: the hand up, the light called down (judgement) | 18,19 block (the aegis, raised) | 20,21 kneel (the vigil at a lamp) |
   22,23,24 charge (holy charge: maul upright, the stride, the pull-up) | 25,26,27 leap (back, top, down) | 28 leapLand | 29 slump (he falters) | 30 hurt ---------- */
export const PAL_POSES = [['idle', 0], ['run', 0], ['run', 2], ['run', 4], ['atk', 0], ['atk', 1], ['atk', 2], ['heavy', 0], ['heavy', 1], ['heavy', 2],
  ['hallow', 0], ['hallow', 1], ['hurlH', 0], ['hurlH', 1], ['sanctify', 0], ['sanctify', 1], ['blast', 0], ['blast', 1], ['block', 0], ['block', 1],
  ['kneel', 0], ['kneel', 1], ['charge', 0], ['charge', 1], ['charge', 2], ['leap', 0], ['leap', 1], ['leap', 2], ['leapLand', 0], ['slump', 0], ['hurt', 0]];
export function palFrame(e) {
  const m = e.mode, k = (a, b) => (e.modeT > a ? b : b + 1);
  switch (m) {
    case 'chainTell': case 'chainBeatTell': return 4; case 'chain': return e.modeT > PB.chain.t * 0.5 ? 5 : 6;
    case 'smiteTell': return e.modeT > PB.smite.tell * 0.5 ? 7 : 8; case 'smite': return 9;
    case 'plantTell': return 10; case 'plant': return 11;
    case 'throwTell': return 12; case 'throw': return 13;
    case 'empowerTell': return 14; case 'empower': return 15;
    case 'judgeTell': return 16; case 'judge': return 17;
    case 'aegis': return 18 + Math.floor((e.anim || 0) * 3) % 2;
    case 'vigilTell': case 'vigil': return 20 + Math.floor((e.anim || 0) * 2) % 2;
    case 'chargeTell': return 22; case 'charge': return 23; case 'rebound': return 24;
    case 'leapTell': return 25; case 'leap': return e.lift > 40 ? 26 : 27; case 'land': return 28;
    case 'falter': return 29; case 'reel': return 30; case 'sleep': case 'wake': return 0;
  }
  if (e.hurtT > 0) return 30;
  return Math.abs(e.vx || 0) > 3 ? 1 + Math.floor((e.anim || 0) * 7) % 3 : 0;
}

/* ---------- THE SANCTUARY ---------- */
/* local columns (0..41), the floor's surface row R (the hero stands on R-1). THE CHOIR STALLS (one-way ledges: the angle from above), THE ALTAR at the east
   end (drawn), THE ROSE WINDOW over it (drawn), THREE LAMPS on the floor (his Light: snuff one and it dims). He starts at `him` */
export const PB_STAGE = { W: 42, door: 6, lamps: [7, 21, 35], stalls: [{ x0: 2, x1: 9, dy: 3 }, { x0: 32, x1: 39, dy: 3 }], him: 30, roof: 20 };
export function stagePaladin(W, T, TS, sx, R) {
  const { set, block, ent, air } = W, ex = sx + PB_STAGE.W;
  const lamps = PB_STAGE.lamps.map((x, i) => ({ id: 'arena' + i, x: sx + x, y: R - 1, room: 'sanctuary', kind: 'arena', lit: true }));
  const carve = () => {
    air(sx, ex - 1, R - PB_STAGE.roof, R - 1);
    block(sx - 1, sx - 1, R - PB_STAGE.roof - 4, R - PB_STAGE.door - 1);   /* the west wall over the door you came in by (shut behind you) */
    block(ex, ex, R - PB_STAGE.roof - 4, R - 1);
    block(sx - 1, ex, R - PB_STAGE.roof - 4, R - PB_STAGE.roof - 1);        /* the vault */
    for (const l of PB_STAGE.stalls) for (let x = sx + l.x0; x <= sx + l.x1; x++) set(x, R - l.dy, T.ONEWAY);
    for (const l of lamps) ent('lclamp', l.x, l.y, { id: l.id, arena: true });
    ent('paladinboss', sx + PB_STAGE.him, R - 1, { face: -1 });
  };
  const arena = { x0: sx * TS, x1: ex * TS, floor: R * TS, trigger: (sx + 2) * TS, wallL: sx - 1, wallR: ex, boss: 'paladinboss', music: 'paladin',
    tint: '#d8c070', tintA: 0.04, start: [sx + 2, R - 1], y0: (R - PB_STAGE.roof) * TS, y1: (R + 1) * TS, pb: { sx, R } };
  return { arena, carve, lamps };
}
/* the sanctuary in world px, from the arena */
export function geom(A, TS = 16) {
  const q = A.pb, X = c => (q.sx + c) * TS;
  return { TS, x0: X(0), x1: X(PB_STAGE.W), floorY: q.R * TS, roofY: (q.R - PB_STAGE.roof) * TS,
    lamps: PB_STAGE.lamps.map((x, i) => ({ id: 'arena' + i, x: X(x) + 8 })),
    stalls: PB_STAGE.stalls.map(l => ({ x0: X(l.x0), x1: X(l.x1 + 1), y: (q.R - l.dy) * TS })) };
}

/* ---------- ONE FIGHT ---------- */
export function newFight(G) {
  return { G, ph: 1, cycle: 0, step: 0, script: null, act: 0, light: PB.light.start, ward: 0, falterTaken: 0, behindT: 0, chainLeft: 0, starved: false,
    marks: [], waves: [], hammer: null, leap: null, kneelId: null, vigilCd: 3, plantCd: 0, heat: 0, told: {}, lastLight: PB.light.start,
    n: { cycles: 0, falters: 0, wards: 0, warded: 0, guarded: 0, fed: 0, drained: 0, landed: 0, failed: 0, lampsOut: 0, vigils: 0, vigilsCut: 0, plants: 0, empowers: 0, smites: 0,
      throws: 0, judges: 0, chains: 0, charges: 0, rebounds: 0, ripostes: 0, leaps: 0, kindled: 0, moves: {} } };
}
export const pPhase = e => (e.hp <= e.maxHp * PB.p3 ? 3 : e.hp <= e.maxHp * PB.p2 ? 2 : 1);
export const pbOpen = e => !!e && e.mode === 'falter' && (e.open || 0) > 0;
const STRIKE = new Set(['chain', 'throw', 'smite', 'empower', 'judge', 'charge', 'leap', 'land']);
const GUARD_MODES = new Set(['walk', 'recover', 'aegis']);
/* HIS AEGIS: a blow from in front of him by a hero at his height (not from above, not in the air over him), while he is on guard with the Light to hold it */
export const guarded = (e, S, hx, hy, airborne) => !!e && !pbOpen(e) && !(e.broken > 0) && GUARD_MODES.has(e.mode) && S.light >= PB.aegis.min
  && (e.face || 1) * (hx - e.x) > -6 && !(airborne && hy < e.y - 14) && Math.abs(hy - e.y) < 30;
export const litLamps = c => (c.lamps ? c.lamps().filter(l => l.lit).length : 3);
/* his circle, and whether he (or a body) stands in it */
const circleOf = (e, c) => (c.hg ? c.hg.of(e) : null);
export const inHisCircle = (e, c, b) => { const ci = circleOf(e, c); return !!ci && c.hg.inside(ci, b || e); };

const nextScript = S => { const set = CYCLES[S.ph]; return set[S.cycle % set.length].slice(); };
function setMode(e, m, t) { e.mode = m; e.modeT = t; }
const clampX = (G, x) => Math.max(G.x0 + 18, Math.min(G.x1 - 18, x));
function tell(e, S, c, mode, t) { setMode(e, mode, t); S.act++; S.n.moves[mode] = (S.n.moves[mode] || 0) + 1; const mv = MOVES[mode]; if (mv && mv.mark) c.mark(mv.mark); c.sound(mv && mv.mark === '!!' ? 'tellHard' : mv && mv.mark ? 'tell' : 'glow'); }
const setLight = (S, v) => { S.light = Math.max(0, Math.min(PB.light.max, v)); };
/* LIGHT TAKEN BY THE PLAYER (a landed blow, a snuffed lamp): the last of it starves him - the falter comes at his next free beat */
function takeLight(S, n) { const was = S.light; setLight(S, S.light - n); if (was > 0 && S.light <= 0) S.starved = true; else if (was <= 0) S.starved = true; }
function falter(e, S, c) { setMode(e, 'falter', PB.falterT + 0.05); e.open = PB.falterT; S.falterTaken = 0; S.starved = false; S.n.falters++; S.chainLeft = 0; S.marks = []; S.leap = null; S.hammer = null;
  c.fx('open', e.x, e.y); c.sound('falter'); c.shake(3); c.number(e.x, e.y - 80, 'HIS LIGHT IS OUT: HE FALTERS - STRIKE', '#8fd160'); }
function endFalter(e, S, c) { e.open = 0; e.burn = 0;   /* (the light coming back up him puts out a fire on him: the old fight's rule, kept) */
  S.ward = PB.wardT; S.n.wards++; S.falterTaken = 0; setLight(S, PB.light.refill); c.fx('ward', e.x, e.y); c.sound('tell');
  c.number(e.x, e.y - 80, 'THE LIGHT RETURNS: HE IS WARDED', '#9ab0c0'); }

/* ---------- THE RULE ON HIM (the hands call these) ---------- */
/* A BLOW ON HIM from a hero at (hx, hy) (airborne: in the air). Returns { dmg, read } - read: 'aegis' (turned: it fed him), 'ward', 'open', 'landed', 'failed' (the aegis would have turned it but his Light is too low) */
export function blowOn(e, S, c, dmg, hx, hy, airborne, heavy) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake') return { dmg: 0, read: 'ward' };
  if (S.ward > 0) { S.n.warded++; return { dmg: 0, read: 'ward' }; }
  if (pbOpen(e)) { const cap = e.maxHp * PB.falterCap - S.falterTaken; const d = Math.max(0, Math.min(Math.round(dmg * PB.falterMul), Math.round(cap))); S.falterTaken += d; return { dmg: d, read: 'open' }; }
  if (guarded(e, S, hx, hy, airborne)) { S.n.guarded++; S.n.fed++; setLight(S, S.light + PB.light.feed); S.heat += 1;
    if (!S.told.aegis || S.n.guarded % 4 === 0) { S.told.aegis = 1; c.number(e.x, e.y - 70, 'HIS AEGIS DRINKS IT: GO ROUND', '#ffd36b'); } return { dmg: Math.max(1, Math.round(dmg * PB.aegis.take)), read: 'aegis' }; }
  /* the front, on guard, but his Light is too low to hold the aegis: it FAILS (told) and the blow lands whole */
  const failed = GUARD_MODES.has(e.mode) && (e.face || 1) * (hx - e.x) > -6 && !(airborne && hy < e.y - 14) && S.light < PB.aegis.min;
  if (failed) { S.n.failed++; if (!S.told.fail) { S.told.fail = 1; c.number(e.x, e.y - 70, 'HIS LIGHT IS LOW: THE AEGIS FAILS', '#8fd160'); } }
  /* it LANDS: the man takes it, and his light goes */
  S.n.landed++; S.n.drained++; takeLight(S, heavy ? PB.light.drainHeavy : PB.light.drain);
  if (e.mode === 'vigil' || e.mode === 'vigilTell') { S.n.vigilsCut++; setMode(e, 'recover', 0.5); c.number(e.x, e.y - 70, 'THE VIGIL IS CUT', '#8fd160'); }
  if (!S.told.drain) { S.told.drain = 1; c.number(e.x, e.y - 70, 'IT LANDS: HIS LIGHT DRAINS', '#8fd160'); }
  return { dmg, read: failed ? 'failed' : 'landed' };
}
/* A BURN ON HIM (the pyro's fire, a tick with no blow behind it): not a blow, so it never touches his Light (the old fight's tune: the pyro must not starve him
   for free off her fire). His ward stops it; open it pays x1 inside the falter's cap; otherwise it burns whole (B15) */
export function burnOn(e, S, dmg) {
  if (!e || !e.alive || e.mode === 'sleep' || e.mode === 'wake' || S.ward > 0) return { dmg: 0, read: 'ward' };
  S.n.burns = (S.n.burns || 0) + 1;
  if (pbOpen(e)) { const d = Math.max(0, Math.min(dmg, Math.round(e.maxHp * PB.falterCap - S.falterTaken))); S.falterTaken += d; return { dmg: d, read: 'open' }; }
  return { dmg, read: 'burn' };
}
/* HIS BLOW TURNED (the hands, off what damagePlayer said): ON THE BEAT (a parry, a perfect guard, a roll through - main.js answered) a maul blow or his charge
   is the RIPOSTE: he REELS PB.reelT (committed: everything lands); a HOLY CHARGE taken on a plain shield REBOUNDS him (the shield's own window) */
export function blowTurned(e, S, c, perfect) { if (!e || !e.alive || pbOpen(e) || S.ward > 0) return;
  if (!perfect && e.mode === 'charge') { S.n.rebounds++; setMode(e, 'rebound', PB.reboundT); e.vx = 0; c.number(e.x, e.y - 70, S.told.rebound ? 'THE CHARGE REBOUNDS' : 'HIS CHARGE ON YOUR SHIELD: HE REBOUNDS', '#8fd160'); S.told.rebound = 1; return; }
  if (perfect && (e.mode === 'chain' || e.mode === 'charge' || e.mode === 'chainBeatTell')) { S.n.ripostes++; S.chainLeft = 0; takeLight(S, 6); setMode(e, 'reel', PB.reelT); e.vx = 0;
    c.number(e.x, e.y - 70, S.told.riposte ? 'HE REELS ON THE BEAT' : 'ON THE BEAT: HE REELS', '#8fd160'); S.told.riposte = 1; } }
/* A SANCTUARY LAMP SNUFFED (a hero's blade through it): his light dims at once, and his regen with it (and a vigil at it is cut) */
export function lampOut(e, S, c, id) { if (!e || !e.alive || e.mode === 'sleep') return; S.n.lampsOut++; takeLight(S, PB.light.lampDim);
  if ((e.mode === 'vigil' || e.mode === 'vigilTell' || e.mode === 'vigilWalk') && (!id || id === S.kneelId)) { S.n.vigilsCut++; setMode(e, 'recover', 0.5); c.number(e.x, e.y - 70, 'HIS LAMP DIES UNDER HIS HANDS', '#8fd160'); return; }
  c.number(e.x, e.y - 70, S.told.lamp ? 'HIS LIGHT DIMS' : 'THE LAMP DIES: HIS LIGHT DIMS', '#8fd160'); S.told.lamp = 1; }
/* HIS MAUL LANDED on a hero (the hero's own rule: the maul landing fills the Light) */
export function maulLanded(S) { setLight(S, S.light + PB.light.land); }

/* ---------- ONE FRAME. h = the heroes [{ x, y, ground, alive, air, pp }], c = the world:
   c.hit(box, dmg, name, o) -> landed   c.number(x, y, line, col)  c.mark(m)  c.sound(k)  c.fx(kind, x, y)  c.shake(n)  c.music(ph)
   c.lamps() -> [{ id, x, lit }]   c.kindle(id) (a lamp lit again)   c.hg (makeHolyGround, side 'foe')   c.time() ---------- */
export function stepPaladin(e, S, dt, h, c) {
  const G = S.G, P = h.filter(q => q.alive).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || h[0];
  e.modeT -= dt; e.y = G.floorY - (e.lift || 0); e.anim = (e.anim || 0) + dt; S.heat = Math.max(0, S.heat - dt * 1.2);
  S.vigilCd = Math.max(0, S.vigilCd - dt); S.plantCd = Math.max(0, S.plantCd - dt);
  if (e.open > 0) e.open = Math.max(0, e.open - dt);
  if (S.ward > 0) S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; e.pbLight = S.light;   /* (not e.light: main.js's own field - a ghost's lantern) */
  stepWorld(e, S, dt, h, c);
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { if (e.modeT <= 0) { S.script = nextScript(S); S.step = 0; setMode(e, 'walk', 0.6); } return; }
  /* STARVED: you took the last of his Light - he falters, breaking off what he was telling (a blow already moving finishes first) */
  if (S.starved && S.light <= 0 && e.mode !== 'falter' && S.ward <= 0 && !STRIKE.has(e.mode)) { falter(e, S, c); return; }
  if (S.light > 0) S.starved = false;
  /* HIS LAMPS feed him (not while he falters or is warded) */
  if (!pbOpen(e) && S.ward <= 0) setLight(S, S.light + PB.light.regen * litLamps(c) * dt);
  /* BROKEN (his poise bar): he reels where he stands (B4) */
  if (e.broken > 0 && !pbOpen(e) && (GUARD_MODES.has(e.mode) || /Tell$/.test(e.mode))) { e.modeT += dt; e.vx = 0; return; }
  /* THE PHASES: a new one waits for the blow in hand and never cuts an opening short */
  const want = pPhase(e);
  if (want > S.ph && !pbOpen(e) && (e.mode === 'walk' || e.mode === 'recover')) {
    S.ph = want; S.cycle = 0; S.step = 0; S.script = null; e.phase = want; c.music(want);
    if (want === 2) { let n = 0; for (const l of (c.lamps ? c.lamps() : [])) if (!l.lit && c.kindle && c.kindle(l.id)) n++; S.n.kindled += n;
      c.number((G.x0 + G.x1) / 2, G.floorY - 150, n ? 'THE BASTION: THE ROSE WINDOW KINDLES HIS LAMPS' : 'THE BASTION: THE ROSE WINDOW BLAZES', '#ffd36b'); c.sound('tellHard'); c.shake(4); setMode(e, 'recover', 0.8); return; }
    if (want === 3) { c.number((G.x0 + G.x1) / 2, G.floorY - 150, 'THE EARTHBREAKER: THE GROUND GOES WITH HIM', '#ff6b6b'); c.sound('tellHard'); c.shake(5); setMode(e, 'recover', 0.8); return; } }
  switch (e.mode) {
    case 'falter': e.vx = 0; if (e.open <= 0) { endFalter(e, S, c); setMode(e, 'recover', 0.4); } return;   /* B4: on one knee, still */
    case 'recover': e.vx = 0; if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'aegis': e.vx = 0; if (e.modeT <= 0) nextMove(e, S, P, c); return;
    case 'walk': {
      const d = P.x - e.x;
      if ((e.face || 1) * d < -8) { S.behindT += dt; if (S.behindT > PB.turn) { e.face = Math.sign(d) || e.face; S.behindT = 0; } } else S.behindT = 0;
      const x0 = e.x; if (Math.abs(d) > PB.keep + 6) e.x = clampX(G, e.x + Math.sign(d) * PB.walk * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      /* PRESSED on his aegis (blows turned in a beat), he plants it: the stance (told: the pose and the word) */
      if (S.heat >= 2.2 && Math.abs(d) < 70) { S.heat = 0; setMode(e, 'aegis', 0.9); e.vx = 0; if (!S.told.stance) { S.told.stance = 1; c.number(e.x, e.y - 70, 'HE PLANTS HIS AEGIS: GO ROUND', '#ffd36b'); } return; }
      if (e.modeT <= 0) nextMove(e, S, P, c); return; }
    case 'vigilWalk': { const l = (c.lamps() || []).find(q => q.id === S.kneelId);
      if (!l || !l.lit) { setMode(e, 'walk', 0.3); return; }
      const d = l.x - e.x; e.face = Math.sign(d) || e.face; if (Math.abs(d) > 12) { const x0 = e.x; e.x = clampX(G, e.x + Math.sign(d) * PB.walk * 1.15 * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt); if (e.modeT <= 0) setMode(e, 'walk', 0.3); return; }
      e.vx = 0; S.n.vigils++; tell(e, S, c, 'vigilTell', 0.4); c.number(e.x, e.y - 70, 'HE KNEELS AT HIS LAMP: CUT IT OR SNUFF IT', '#ffd36b'); return; }
    case 'vigilTell': e.vx = 0; if (e.modeT <= 0) setMode(e, 'vigil', PB.vigil.t); return;
    case 'vigil': { e.vx = 0; const l = (c.lamps() || []).find(q => q.id === S.kneelId);
      if (!l || !l.lit) { setMode(e, 'recover', 0.4); return; }
      setLight(S, S.light + PB.light.kneel * dt);
      if (e.modeT <= 0 || S.light >= PB.light.max) { S.vigilCd = PB.vigil.cd; setMode(e, 'recover', 0.35); } return; }
  }
  stepMove(e, S, dt, P, h, c);
}
function nextMove(e, S, P, c) {
  const dx = P.x - e.x, ad = Math.abs(dx), G = S.G, lamps = c.lamps ? c.lamps() : [];
  e.face = Math.sign(dx) || e.face;
  /* JUDGEMENT: the full bar, standing in his circle */
  if (S.light >= PB.light.max - 0.01 && inHisCircle(e, c) && S.ward <= 0) { S.n.judges++; tell(e, S, c, 'judgeTell', PB.judge.tell); S.marks = [];
    for (let k = -2; k <= 2; k++) S.marks.push({ x: clampX(G, e.x + k * PB.judge.gap) });
    if (ad < PB.judge.near && !S.marks.some(m => Math.abs(m.x - P.x) < PB.judge.gap / 2)) S.marks.push({ x: clampX(G, P.x) });
    for (const mk of S.marks) c.fx('cross', mk.x, G.floorY);
    c.number(e.x, e.y - 80, 'JUDGEMENT: STAND BETWEEN THE LIGHTS', '#ff6b6b'); return; }
  /* THE VIGIL: low on Light, a lit lamp in the room - he goes to kneel at it (the hero's crouch rule) */
  const lit = lamps.filter(l => l.lit);
  if (S.light < PB.vigil.below && lit.length && S.vigilCd <= 0 && S.ward <= 0) { const l = lit.slice().sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0]; S.kneelId = l.id; S.vigilCd = PB.vigil.cd * 0.6; setMode(e, 'vigilWalk', PB.vigil.walkT); return; }
  if (!S.script || S.step >= S.script.length) { S.cycle++; S.n.cycles++; S.script = nextScript(S); S.step = 0; }
  let m = S.script[S.step++];
  const ci = circleOf(e, c), inC = !!ci && c.hg.inside(ci, e);
  if (m === 'plant' && (S.plantCd > 0 || (ci && inC && ci.life > 3))) m = 'chain';
  if ((m === 'smite' || m === 'empower') && !inC) m = ci ? 'chain' : 'plant';
  if (m === 'smite' && S.light < 20) m = 'chain';
  if (m === 'empower' && (S.light < 35 || (ci && ci.emp))) m = 'chain';
  if (m === 'throw' && (S.light < 25 || ad < 54)) m = 'chain';
  if (m === 'plant' && S.plantCd > 0) m = 'chain';
  if (m === 'charge' && (ad < 40 || Math.abs(P.y - e.y) > 40)) m = 'chain';
  if (m === 'chain' && ad > PB.chain.reach + 50) { setMode(e, 'walk', 0.45); S.step--; return; }   /* out of the maul's reach: he closes first (the chain stays next) */
  switch (m) {
    case 'chain': S.chainLeft = PB.chain.n[S.ph - 1]; S.n.chains++; tell(e, S, c, 'chainTell', PB.chain.tell); return;
    case 'plant': S.n.plants++; tell(e, S, c, 'plantTell', 0.5); if (!S.told.plant) { S.told.plant = 1; c.number(e.x, e.y - 70, 'HE CONSECRATES THE GROUND: FIGHT HIM OFF IT', '#ffd36b'); } return;
    case 'throw': S.n.throws++; S.light -= 25; tell(e, S, c, 'throwTell', PB.throw.tell); if (!S.told.throw) { S.told.throw = 1; c.number(e.x, e.y - 70, 'THE HAMMER OF LIGHT: JUMP IT, AND AGAIN', '#ffd36b'); } return;
    case 'smite': S.n.smites++; S.light -= 20; tell(e, S, c, 'smiteTell', PB.smite.tell); if (!S.told.smite) { S.told.smite = 1; c.number(e.x, e.y - 70, 'SMITE: THE SPIRES RUN THE FLOOR - JUMP', '#ff6b6b'); } return;
    case 'empower': S.n.empowers++; S.light -= 35; tell(e, S, c, 'empowerTell', PB.empower.tell); if (!S.told.emp) { S.told.emp = 1; c.number(e.x, e.y - 70, 'HE EMPOWERS HIS GROUND: GET OFF IT', '#ff6b6b'); } return;
    case 'charge': S.n.charges++; tell(e, S, c, 'chargeTell', PB.charge.tell); if (!S.told.charge) { S.told.charge = 1; c.number(e.x, e.y - 70, 'HOLY CHARGE: JUMP IT OR TAKE IT ON A SHIELD', '#ffd36b'); } return;
    case 'leap': S.n.leaps++; tell(e, S, c, 'leapTell', PB.leap.tell); S.leap = { x: clampX(G, P.x), fx: e.x }; c.fx('ring', S.leap.x, G.floorY); return;
  }
  setMode(e, 'walk', 0.5);
}
/* THE TOLD BLOWS */
function stepMove(e, S, dt, P, h, c) {
  const G = S.G, f = e.face || 1, after = (t) => setMode(e, 'recover', t ?? PB.gap[S.ph - 1]), mul = inHisCircle(e, c) ? HG_HIT : 1;
  e.vx = 0;
  switch (e.mode) {
    case 'chainTell': case 'chainBeatTell': if (e.modeT <= 0) { setMode(e, 'chain', PB.chain.t); c.sound('slam'); } return;
    case 'chain': { const x0 = e.x; e.x = clampX(G, e.x + f * PB.chain.step * dt); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      if (c.hit([f > 0 ? e.x - 6 : e.x - PB.chain.reach, f > 0 ? e.x + PB.chain.reach : e.x + 6, e.y - 34, e.y], Math.round(PB.chain.dmg * mul), MOVE_NAME.chain, { blockable: true, key: 'chain' + S.act })) maulLanded(S);
      if (e.modeT <= 0) { S.chainLeft--; if (S.chainLeft > 0) { e.face = Math.sign(P.x - e.x) || f; tell(e, S, c, 'chainBeatTell', PB.chain.beat); } else after(); } return; }
    case 'plantTell': if (e.modeT <= 0) { if (c.hg) c.hg.plant(e, e.x, G.floorY, { r: PB.circle.r, life: PB.circle.life, side: 'foe' }); S.plantCd = PB.circle.cd; setMode(e, 'plant', 0.3); c.sound('glow'); c.fx('plant', e.x, G.floorY); } return;
    case 'plant': if (e.modeT <= 0) after(0.3); return;
    case 'throwTell': if (e.modeT <= 0) { setMode(e, 'throw', 0.35); S.hammer = { x0: e.x + f * 10, x: e.x + f * 10, y: G.floorY - PB.throw.hy, dir: f, t: 0, act: S.act }; c.sound('throw'); } return;
    case 'throw': if (e.modeT <= 0) after(0.35); return;
    case 'smiteTell': if (e.modeT <= 0) { setMode(e, 'smite', 0.45); c.sound('slam'); c.shake(4); const hx = e.x + f * 16;
        if (c.hit([hx - 16, hx + 16, G.floorY - 30, G.floorY + 2], Math.round(PB.smite.dmg * mul), MOVE_NAME.smite, { key: 'smite' + S.act })) maulLanded(S);
        for (const d of [-1, 1]) S.waves.push({ x: hx + d * 8, dir: d, v: PB.smite.v, life: PB.smite.life, dmg: PB.smite.wave, key: 'sw' + S.act + d, name: MOVE_NAME.wave });
        c.fx('smite', hx, G.floorY); } return;
    case 'smite': if (e.modeT <= 0) after(0.4); return;
    case 'empowerTell': if (e.modeT <= 0) { setMode(e, 'empower', 0.4); c.sound('radiance'); c.shake(3); const ci = circleOf(e, c);
        if (ci) { c.hg.empower(ci, { r: PB.empower.r, life: PB.empower.life }); c.hit([ci.x - ci.r, ci.x + ci.r, G.floorY - 30, G.floorY + 2], PB.empower.flare, MOVE_NAME.flare, { key: 'flare' + S.act }); }
        c.fx('flare', e.x, G.floorY); } return;
    case 'empower': if (e.modeT <= 0) after(0.4); return;
    case 'judgeTell': if (e.modeT <= 0) { setMode(e, 'judge', PB.judge.t); c.sound('radiance'); c.shake(5); S.light = 0;   /* (the whole bar: his choice - no falter until a blow LANDS on the empty bar) */
        for (const mk of S.marks) { c.hit([mk.x - PB.judge.r, mk.x + PB.judge.r, G.roofY, G.floorY + 2], PB.judge.dmg, MOVE_NAME.judge, { key: 'judge' + S.act + '_' + Math.round(mk.x) }); c.fx('column', mk.x, G.floorY); } } return;
    case 'judge': if (e.modeT <= 0) { S.marks = []; after(0.55); } return;   /* (he stands a beat after it: the bar is empty) */
    case 'chargeTell': if (e.modeT <= 0) { setMode(e, 'charge', PB.charge.t); e.face = Math.sign(P.x - e.x) || f; c.sound('charge'); } return;
    case 'charge': { const x0 = e.x, nx = e.x + f * PB.charge.v * dt; e.x = clampX(G, nx); e.vx = (e.x - x0) / Math.max(1e-6, dt);
      if (c.hit([f > 0 ? e.x - 4 : e.x - 22, f > 0 ? e.x + 22 : e.x + 4, e.y - 34, e.y], Math.round(PB.charge.dmg * mul), MOVE_NAME.charge, { blockable: true, key: 'charge' + S.act, knock: f })) maulLanded(S);
      if (e.mode !== 'charge') return;   /* (a shield rebounded him inside c.hit) */
      if (e.x !== nx) { setMode(e, 'land', 0.6); c.shake(4); c.sound('slam'); c.number(e.x, e.y - 70, 'INTO THE WALL', '#8fd160'); return; }   /* a wall stops him: committed, a beat to punish */
      if (e.modeT <= 0) after(0.5); return; }
    case 'rebound': case 'reel': if (e.modeT <= 0) after(0.3); return;   /* (B4: he stands) */
    case 'leapTell': if (e.modeT <= 0) { setMode(e, 'leap', PB.leap.fly); S.leap.fx = e.x; c.sound('leap'); } return;
    case 'leap': { const q = Math.max(0, Math.min(1, 1 - e.modeT / PB.leap.fly)); e.x = S.leap.fx + (S.leap.x - S.leap.fx) * q; e.lift = Math.sin(q * Math.PI) * 70;
      if (e.modeT <= 0) { e.lift = 0; e.x = S.leap.x; setMode(e, 'land', 0.6); c.shake(6); c.sound('slam'); c.fx('land', S.leap.x, G.floorY);
        if (c.hit([S.leap.x - PB.leap.r, S.leap.x + PB.leap.r, G.floorY - 40, G.floorY + 4], PB.leap.dmg, MOVE_NAME.leap, { key: 'leap' + S.act })) maulLanded(S);
        for (const d of [-1, 1]) S.waves.push({ x: S.leap.x + d * (PB.leap.r - 4), dir: d, v: PB.smite.v, life: PB.smite.life, dmg: PB.leap.wave, key: 'lw' + S.act + d, name: MOVE_NAME.quake });
        const ci = circleOf(e, c); if (ci && c.hg.move) c.hg.move(ci, S.leap.x, G.floorY); else if (c.hg) c.hg.plant(e, S.leap.x, G.floorY, { r: PB.circle.r, life: PB.circle.life, side: 'foe' });   /* HAMMER LEAP: his circle comes down with him */
        S.leap = null; } return; }
    case 'land': if (e.modeT <= 0) after(0.3); return;   /* (he lands committed: a beat to punish) */
    default: setMode(e, 'walk', 0.5);
  }
}
/* HIS THINGS IN THE ROOM: the hammer of light (out and back), the holy spires and the quake running the floor */
function stepWorld(e, S, dt, h, c) {
  const G = S.G, T = PB.throw;
  const m = S.hammer; if (m) { m.t += dt; const u = Math.min(1, m.t / T.t); m.x = clampX(G, m.x0 + m.dir * T.reach * Math.sin(u * Math.PI)); const out = u < 0.5;
    c.hit([m.x - T.hr, m.x + T.hr, m.y - T.hr, m.y + T.hr], T.dmg, MOVE_NAME.throw, { blockable: true, key: 'ham' + m.act + (out ? 'o' : 'b'), noKnock: true });
    if (u >= 1) S.hammer = null; }
  for (const w of S.waves) { w.life -= dt; w.x += w.dir * w.v * dt; if (w.x < G.x0 + 4 || w.x > G.x1 - 4) w.life = 0;
    if (w.life > 0) c.hit([w.x - 6, w.x + 6, G.floorY - 14, G.floorY + 2], w.dmg, w.name, { key: w.key, noKnock: true }); }
  S.waves = S.waves.filter(w => w.life > 0);
}
const HG_HIT = 1.3;   /* (src/holy-ground.js HG.hitMul: his blows inside his own circle; a literal here so this module stays importable on its own) */

/* ---------- THE BOT'S READING (src/lab.js) ----------
   A HUMAN BOT: it sees a tell PLAN.react s late (the v2 profile's eyes already do that: s.v2) and misreads some; it blocks the maul (or backs off it), jumps the
   hammer (both ways) and the spires, steps off the judgement's crosses and the leap's ring, leaves his circle when he empowers it and keeps out of it when it
   can; between his blows it works THE RULE: it never swings into his aegis on purpose - it goes ROUND (behind him: he turns in PB.turn s) or comes DOWN on him
   from a jump; it cuts his VIGIL and SNUFFS his lamps when he is far (a blade through each); open, it hits him hard; warded, it waits off him.
   s = { P: { x, y, face, ground, atk }, e, S, circle: { x, r, emp } | null, lamps: [{ id, x, lit }], reach, shield, t, rng, mem, v2, hero, rest } -> { gx, face, atk, jump, dodge, block, why } */
export const PLAN = { react: 0.25, miss: 0.12, lampR: 120, bait: 0.55 };
export function pbPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, talk: false, up: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 12, hi = G.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || 1, dx = Math.abs(kx - P.x), same = Math.abs(P.y - e.y) < 26, hitR = reach + PB.w / 2 - 2;
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const ci = s.circle, inC = x => !!ci && Math.abs(x - ci.x) <= ci.r + 4;
  const roomDir = ax => { const away = P.x <= ax ? -1 : 1, room = d => (d < 0 ? P.x - lo : hi - P.x); return room(away) >= 50 ? away : -away; };
  /* 0. THINGS ON THE FLOOR: a spire or the quake coming at it - jump as it arrives; the hammer at waist height - jump it */
  for (const w of S.waves || []) { const ahead = (P.x - w.x) * w.dir; if (ahead > -4 && ahead < 26 + w.v * 0.05 && P.ground && same) { out.jump = true; out.gx = P.x; out.why = 'jump the spire'; return out; } }
  if (S.hammer && P.ground) { const m = S.hammer, u = m.t / PB.throw.t, vx = Math.cos(u * Math.PI) * m.dir, dd = (P.x - m.x) * (Math.sign(vx) || m.dir);
    if (Math.abs(P.x - m.x) < 34 && dd > -6 && seenFor('ham' + m.act + (u < 0.5 ? 'o' : 'b'))) { if (s.shield && roll('hb' + m.act + (u < 0.5 ? 'o' : 'b'), 0.5)) { out.block = true; out.face = Math.sign(m.x - P.x) || 1; out.why = 'block the hammer'; return out; } out.jump = true; out.gx = P.x; out.why = 'jump the hammer'; return out; } }
  /* 1. HIS BLOWS (a quarter-second late, some misread) */
  if (/Tell$/.test(e.mode) || STRIKE.has(e.mode)) {
    const miss = s.v2 ? false : roll('m' + S.act + e.mode, PLAN.miss), seen = seenFor('a' + S.act + e.mode);
    if (seen && !miss) {
      if ((e.mode === 'judgeTell' || e.mode === 'judge') && (S.marks || []).some(m => Math.abs(P.x - m.x) < PB.judge.r + 10)) { const m = S.marks.find(q => Math.abs(P.x - q.x) < PB.judge.r + 10), d = roomDir(m.x);
        let gx = clamp(m.x + d * (PB.judge.gap / 2)); out.gx = gx; out.why = 'between the lights'; return out; }
      if ((e.mode === 'leapTell' || e.mode === 'leap') && S.leap && Math.abs(P.x - S.leap.x) < PB.leap.r + 22) { const d = roomDir(S.leap.x); out.gx = clamp(S.leap.x + d * (PB.leap.r + 34)); if (e.mode === 'leap' && P.ground && !s.noRoll && Math.abs(P.x - S.leap.x) < PB.leap.r + 6) out.dodge = true; out.why = 'off the leap ring'; return out; }
      if (e.mode === 'empowerTell' && ci && inC(P.x)) { const d = Math.sign(P.x - ci.x) || roomDir(ci.x); out.gx = clamp(ci.x + d * (PB.empower.r + 14)); out.why = 'off his ground before the flare'; return out; }
      if (e.mode === 'smiteTell' && dx < 60 && same) { out.gx = clamp(kx + side * 70); out.why = 'off the smite'; return out; }
      if ((e.mode === 'chargeTell' || e.mode === 'charge') && same && (e.face || 1) * (P.x - kx) > -6 && dx < 150) {
        if (s.shield && roll('cs' + S.act, 0.6)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'take the charge on the shield'; return out; }
        if ((e.mode === 'charge' && dx < 70) || (e.mode === 'chargeTell' && e.modeT < 0.12 && dx < 60)) { if (!s.noRoll && dx < 36 && roll('cr' + S.act, 0.4)) { out.dodge = true; out.gx = clamp(kx + (e.face || 1) * 60); out.why = 'roll through the charge'; return out; } out.jump = true; out.gx = P.x; out.why = 'jump the charge'; return out; }
        out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'ready for the charge'; return out; }
      if ((e.mode === 'chainTell' || e.mode === 'chainBeatTell' || e.mode === 'chain') && dx < PB.chain.reach + 40 && same) {
        if (s.shield) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the maul'; return out; }
        out.gx = clamp(kx + side * 92); if (dx < 50 && e.modeT < 0.18 && /Tell$/.test(e.mode) && !s.noRoll) out.dodge = true; out.why = 'back off the maul'; return out; }
    }
  }
  /* 2. OPEN: hit him (any side); WARDED: off him */
  if (pbOpen(e)) { const st = s.tip ? 30 : 14; out.gx = clamp(kx + side * st); if (dx < hitR + 4 && same) swing(kx); out.why = 'hit him: he falters'; return out; }
  if (S.ward > 0) { out.gx = clamp(kx + side * 80); out.why = 'his ward: wait'; return out; }
  /* 3. HIS VIGIL: committed - cut it (or it is going to his lamp: snuff the lamp first) */
  if ((e.mode === 'vigil' || e.mode === 'vigilTell') && !roll('cut' + S.act, 0.15)) { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to cut the vigil'; return out; } swing(kx); out.gx = P.x; out.why = 'cut the vigil'; return out; }
  /* 4. STARVE HIM: snuff a lamp when he is far (a blade through it) - the one he walks to first */
  const lit = (s.lamps || []).filter(l => l.lit);
  if (lit.length && (e.mode === 'walk' || e.mode === 'recover' || e.mode === 'vigilWalk' || e.mode === 'aegis' || e.mode === 'plantTell') && (dx > 64 || e.mode === 'vigilWalk')) {
    const l = (e.mode === 'vigilWalk' && lit.find(q => q.id === S.kneelId)) || lit.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (Math.abs(l.x - P.x) < PLAN.lampR && (Math.abs(l.x - kx) > 56 || e.mode === 'vigilWalk')) { const st = l.x - (Math.sign(l.x - P.x) || 1) * 14; if (Math.abs(P.x - st) > 6) { out.gx = clamp(st); out.why = 'to his lamp'; return out; }
      out.face = Math.sign(l.x - P.x) || 1; out.gx = P.x; out.atk = P.atk < 0; out.why = 'snuff his lamp'; return out; } }
  /* 4b. WINDED (the lab's stamina rest): off him, out of the maul's reach (and off his ground) */
  if (s.rest) { let gx = clamp(kx + side * (PB.chain.reach + 64)); if (inC(gx)) gx = clamp(ci.x + side * (ci.r + 16)); out.gx = gx; out.face = Math.sign(kx - P.x) || 1; out.why = 'winded: off him'; return out; }
  /* 5. FIGHT HIM: his back when he turns from you; in his tells (committed); from a jump over his aegis (B11) - never into it */
  const committed = e.mode === 'reel' || e.mode === 'rebound' || e.mode === 'land' || e.mode === 'plant' || e.mode === 'throw' || e.mode === 'judge' || e.mode === 'smite' || e.mode === 'empower' || e.mode === 'plantTell' || e.mode === 'throwTell';
  if (committed && same && !(e.mode === 'judge')) { if (dx > hitR - 2) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in on him: committed'; return out; } swing(kx); out.gx = P.x; out.why = 'hit him: committed'; return out; }
  if (dx < hitR && same && (e.face || 1) * (P.x - kx) < -6) { swing(kx); out.gx = P.x; out.why = 'hit his back'; return out; }
  if ((S.light < PB.aegis.min) && (e.mode === 'walk' || e.mode === 'recover') && dx < hitR + 30) { if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in: his aegis fails'; return out; } swing(kx); out.gx = P.x; out.why = 'his aegis fails: hit'; return out; }
  if ((e.mode === 'walk' || e.mode === 'recover' || e.mode === 'aegis') && dx < hitR + 34) { out.face = Math.sign(kx - P.x) || 1;
    if (s.shield && same && roll('bait' + S.cycle + '_' + S.step, PLAN.bait)) { out.gx = clamp(kx + side * (hitR + 6)); out.block = Math.abs(P.x - out.gx) < 8; out.why = 'bait his maul'; return out; }
    if (dx > hitR - 4) { out.gx = clamp(kx + side * (hitR - 8)); out.why = 'in to him'; return out; }
    out.gx = P.x; if (P.ground) { out.jump = true; out.why = 'up over his aegis'; return out; } if (P.y < e.y - 14) out.atk = P.atk < 0; out.why = 'down on him from the jump'; return out; }
  let gx = clamp(kx + side * Math.max(46, hitR + 18)); if (inC(gx) && ci) gx = clamp(ci.x + side * (ci.r + 16)); out.gx = gx; out.face = Math.sign(kx - P.x) || 1; out.why = 'keep off his maul'; return out;
}
