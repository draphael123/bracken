// src/warden-forks.js - THE WARDEN'S FORK NUMBERS AND PURE RULES (claude/wardenfork). The data (names, text) is src/forks-warden.js; the effect code is inline in src/main.js behind wb(id).
// No world here: tools/warden-forks.mjs reads these numbers and rules without a page. Every number is the one the card says.
export const WFK = {
  hop: { wind: 4, vy: 150 },                         /* L21 HOP STEP: +4 wind, a low arc, the whole step untouchable */
  setBack: { pad: 4, far: 46 },                      /* L21 SET BACK: stops when the nearest foe in front is >= tip start + pad px out (and within far px) */
  spring: { cdMul: 0.5, extra: 3, k: 0.5, reach: 64 },   /* L22 SPRING POINT: cooldown x0.5, up to 3 more foes within reach of the landing, k swords each */
  high: { vyMul: 1.414, land: 1.2, ringK: 0.4, ring: 26 },   /* L22 HIGH VAULT: 2x height (vy x sqrt2), landing stab x1.2, the foes beside take ringK swords */
  point: { sunder: 2.5 },                            /* L24 POINTED: the old OPENED (the next blow x2 for 2.5 s) */
  runthru: {},                                       /* L24 RUN THROUGH: the old SPEARHEAD (no wind-up on the held third) */
  keepoff: { cap: 150 },                             /* L27 KEEP-OFF: the drive's knock (the long thrust's own: warden-id driveSpeed) */
  haft: { sunder: 2.5, stagger: 0.6, bossOpen: 0.25 },   /* L27 HAFT CATCH: the old COUNTERPOISE + stagger on the beat, a boss's told opening */
  round: { back: 150 },                              /* L29 ROUND ROW: the row behind her */
  hedge: { reach: 200, life: 2.6 },                  /* L29 HEDGE ROW: shorter row (200 of 300 px), stands 2.6x, asks again */
  twin: { delay: 0.18, k: 0.5 },                     /* L32 TWIN JAVELIN */
  far: { range: 1.2, from: 70, mul: 1.3 },           /* L32 FAR POINT */
  band: { hungryFill: 1.4, hungryHaft: 2, idle: 6, idleAfter: 2, near: 150 },   /* L36 STEADY BAND (never drains) / HUNGRY BAND */
  wheel: { wide: { t: 0.5, reach: 60, k: 1.25 }, half: { t: 0.18, reach: 46, wind: 12 }, base: { t: 0.36, reach: 46, wind: 20 } },   /* L38 */
  plunge: { planted: { pin: 1.5, perch: 2.2 }, skewer: { k: 0.7, pin: 0.6, dx: 14, dy: 40 } },   /* L43 */
  dance: { a: { last: 1.6 }, b: { n: 4, k: 1.5, step: 14 }, base: { n: 6 } },   /* L48 RINGING SIX (last thrust x1.6) / FORWARD FOUR (x1.5 each, a step each) */
  ult: { long: { mul: 3, finalLen: 340 }, great: { t: 4.5, final: 2.0, throw: 1.25 }, base: { mul: 2, finalLen: 220, t: 6 } },   /* L50 THE LONG LINE / GREAT JAVELIN: the closing thrust x2.0, the ghost throw x1.25 */
};
/* TRAIT SIDES (rank scaled by the caller: x * trk(id), or 1 + (x - 1) * trk(id)): the printed number is rank III */
export const WTF = {
  vaulterLight: 10,        /* VAULTER A: wind = round(13 - 10 * rank) (base: 13 - 7 * rank): 3 at III */
  vaulterLong: 80,         /* VAULTER B: + 80 * rank px of carry on top of LONG VAULT's 80 * rank */
  throughDeep: 32,         /* THROUGH A: line 32 * rank (base 16 * rank) */
  throughHard: 160,        /* THROUGH B: + 160 * rank knock on top of DRIVE HOME's 160 * rank */
  giveLong: 1.0,           /* GIVE GROUND A: stagger 1.0 * rank (base 0.6 * rank) */
  giveShove: 120,          /* GIVE GROUND B: a small foe is shoved back (knock px/s) * rank */
  exactOpen: 0.5,          /* EXACTNESS A: + 0.5 s stagger * rank */
  exactFill: 15,           /* EXACTNESS B: + 15 band * rank */
  rowDeep: 180,            /* A WIDER ROW A: + 180 * rank px (base 90 * rank) */
  rowClose: 10,            /* A WIDER ROW B: spacing -10 * rank (base -5 * rank) */
  readyRefund: 6,          /* EVER READY A: + 6 * rank wind on a turn */
  readySecond: 0.3,        /* EVER READY B: + 0.3 * rank s of live sweep on a turn */
  twistBleed: 6,           /* TWIST IT A: bleed 6 * rank (base 3 * rank) */
  twistHold: 2.0,          /* TWIST IT B: hold x trm(2.0) (base 1.5) */
  handPurse: 36,           /* FREE HAND A: refund 36 * rank (base 20) */
  handStep: 20,            /* FREE HAND B: refund 20 * rank and the dodge wait is reset */
  hurlKnock: 520, hurlStag: 1.2, hurlHit: 0.25,   /* SKIRMISHER A (base 340 / 0.8) */
  hurlWide: 2,             /* SKIRMISHER B: the two nearest are bowled over */
  spitLong: 2.0,           /* SPITTED A: broken x trm(2.0) (base 1.5) */
  spitHit: 0.5,            /* SPITTED B: + 0.5 * rank blow, once a charge */
};
/* SET BACK (L21 B): should the back-step stop now? d = tipReach of the nearest foe in front (px from her point-end to its near edge), start = widTipStart(band) */
export const setBackStops = (d, start) => d != null && d >= start + WFK.setBack.pad && d <= WFK.setBack.far;
/* HIGH VAULT's launch speed from the plain one (twice the height = sqrt 2 the speed) */
export const highVy = vy => vy * WFK.high.vyMul;
/* the capstone budget on one boss: perHit swords per landed hit (n hits in the ult) + the closing thrust. A keeps both, B trades 1.5 s of hits for a final twice as big. */
export const ultBudget = (side, hitsPerSec, perHit, final) => {
  const t = side === 'B' ? WFK.ult.great.t : WFK.ult.base.t, fin = side === 'B' ? final * WFK.ult.great.final : final;
  return hitsPerSec * t * perHit + fin; };
/* the Spear Dance (L48): swords per use on one foe at the point (mul 1 = tip as authored; the base dance is six x 0.55) */
export const danceTotal = side => side === 'A' ? 5 * 0.55 + 0.55 * WFK.dance.a.last : side === 'B' ? WFK.dance.b.n * 0.55 * WFK.dance.b.k : 6 * 0.55;
