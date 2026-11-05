// src/pyro-tech.js - THE PYROMANCER'S L25-L50 TECHNIQUES, numbers and pure rules (claude/pyropack; the data and card text are src/tech-pyro.js). No world in here: main.js's pyro block
// (pyDetonate, the ward's parried hook, castFireball, castMeteorFall, the dodge) owns the frame and calls these.
// THE LAW (brief-l50abilities sec 4): every blow is swordDmg x k (x amul x heat), never a flat hit; a boss takes capped damage and its resist floor, never a free stagger, a pin or an immunity;
// nothing here heals. Her resource is HEAT (P.heat): both capstones are the one ultimate input (UP+C at a FULL bar) and a pick reshapes (A) or replaces (B) METEOR FALL. Both empty the bar.
export const PT = {
  kindle: { heat: 5 },                                      /* L25 KINDLING: every living-bomb burst pays +5 heat (a raw add: bursts never refill through gainHeat) */
  nova: { k: 0.8, R: 70, pips: 1 },                         /* L30 A WARD NOVA: a parry bursts a ring R px: small foes take x0.8 x heat + a pip; a boss/mini a pip only */
  trail: { step: 1, wait: 0.25 },                           /* L30 B TRAILING EMBER: a step 3-5 ball is followed 0.25 s later by a free step-1 ember (k 0.9 from the ball table) */
  white: { fullT: 3 },                                      /* L35 WHITE HEAT: the full bar holds +3 s */
  conc: { stagger: 0.5 },                                   /* L40 A CONCUSSIVE BURST: a burst staggers a common/elite foe 0.5 s (boss/mini: none) */
  step: { dodge: 1.25, burn: 1.5, near: 14 },               /* L40 B PHOENIX STEP: the dodge x1.25, a pip + burn to small foes within 14 px of the body while it lasts */
  fuse: { life: 10, reach: 16 },                            /* L45 SLOW FUSE: pips last 10 s (was 6), a burst's reach +16 px */
  star: { tell: 1.2, R: 88, mul: 1.5, capPct: 0.05, capMini: 0.12 },       /* L50 A STAR FALL: tell 0.9 -> 1.2 s, R 56 -> 88, x1.5 on k 3.0, boss cap 4 -> 5%, mini 10 -> 12% */
  shower: { n: 5, from: 60, to: 300, gap: 0.3, tell: 0.7, R: 34, k: 1.0, capPct: 0.014, capMini: 0.035, pips: 2, snap: 40 },   /* L50 B METEOR SHOWER: 5 meteors 60-300 px ahead 0.3 s apart, each R 34, x1.0, a boss 1.4% / a mini 3.5% each, 2 pips each */
};
/* upgrade multipliers by rank 0 / I / II */
export const UP = { stoke: [1, 1.15, 1.3], parry: [0, 3, 6], cost: [1, 0.9, 0.8], burn: [1, 1.2, 1.4], heat: [1, 1.1, 1.2], fire: [1, 1.05, 1.1], reach: [0, 8, 16], fuel: [1, 0.85, 0.7] };
const rank = r => Math.max(0, Math.min(2, r | 0));
export const upMul = (key, r) => UP[key][rank(r)];
/* L25 KINDLING: the heat a burst pays */
export const kindle = owned => owned ? PT.kindle.heat : 0;
/* L30 A WARD NOVA: what a parry's ring does to one foe (null = nothing; big = a boss / mini: a pip only) */
export const nova = (owned, big, dist) => owned && dist <= PT.nova.R ? { dmg: big ? 0 : PT.nova.k, pips: PT.nova.pips } : null;
/* L30 B TRAILING EMBER: after a released ball of this step (null = none) */
export const trail = (owned, step) => owned && step >= 3 && step <= 5 ? { step: PT.trail.step, wait: PT.trail.wait } : null;
/* L35 WHITE HEAT: how long the full bar holds (base 5 / 10 with BLAZE) */
export const fullHold = (base, owned) => base + (owned ? PT.white.fullT : 0);
/* L40 A CONCUSSIVE BURST: the stagger a burst adds (a boss / mini none) */
export const conc = (owned, big) => owned && !big ? PT.conc.stagger : 0;
/* L40 B PHOENIX STEP: the dodge's speed factor, and whether a foe is caught by the wake (small foes only) */
export const stepMul = owned => owned ? PT.step.dodge : 1;
export const wakeCatch = (owned, big, dx, dy) => !!owned && !big && Math.abs(dx) <= PT.step.near + 6 && Math.abs(dy) <= 24;
/* L45 SLOW FUSE: a pip's life and a burst's extra reach (+ WIDE BURST) */
export const pipLife = (base, owned) => owned ? PT.fuse.life : base;
export const burstReach = (base, owned, ureach) => base + (owned ? PT.fuse.reach : 0) + upMul('reach', ureach);
/* L50: what UP+C casts. null = the old METEOR FALL exactly */
export const capstone = (star, shower) => star ? 'star' : shower ? 'shower' : null;
export const meteorShape = (base, star) => star ? { ...base, tell: PT.star.tell, R: PT.star.R, capPct: PT.star.capPct, capMini: PT.star.capMini, mul: PT.star.mul } : { ...base, mul: 1 };
/* L50 B METEOR SHOWER: n spots across from..to px ahead, each with its own start inside n x gap (foes within snap px of a spot pull it onto them: `xs` = the x of each foe in front) */
export function showerPlan(face, x0, xs) {
  const S = PT.shower, out = [];
  for (let i = 0; i < S.n; i++) {
    const x = x0 + face * (S.from + (S.to - S.from) * (i / (S.n - 1)));
    let best = null; for (const fx of xs || []) if (Math.abs(fx - x) <= S.snap && (best === null || Math.abs(fx - x) < Math.abs(best - x))) best = fx;
    out.push({ x: best === null ? x : best, snapped: best !== null, at: i * S.gap, done: false });
  }
  return out;
}
