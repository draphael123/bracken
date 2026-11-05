// src/paladin-tech.js - THE PALADIN'S L25-L50 TECHNIQUES, numbers and pure rules (claude/paladinpack; the data and card text are src/tech-paladin.js).
// No world in here: main.js calls these beside his code (the parry, the ward, smite, the hammer, the step, the plunge, verdict, the aura, SUNFALL, the hammer's cast).
// His resource is CONVICTION (P.light 0-100, five pips of 20). Both capstones spend a FULL five pips: A rides SUNFALL (tap C at five pips, as ever), B is the one ultimate input
// (UP+C at five pips) - HEAVEN'S LANCES. A pick of neither leaves his kit exactly as shipped (UP+C at three or four pips is the hammer either way).
// THE LAW (brief-l50abilities sec 4): every new blow is swordDmg x k; a boss takes the damage and its resist floor, never a free stagger, a pin or an immunity; a foe takes
// at most LANCE.cap lances in one cast; no new heal; nobody is made untouchable (THE LONG NOON is a fifth off the blows he takes, on his own ground). FX dice are Math.random on particles only.
export const PT = {
  steel: { t: 3, mul: 1.3 },                         /* L25 HALLOWED STEEL: after a PERFECT guard the next swing inside 3 s lands x1.3 (once) */
  nova: { every: 3, r: 56, k: 0.5, stagger: 0.6 },   /* L30 A WARD NOVA: every 3rd blow the ward turns rings out: small foes within 56 px take x0.5 and 0.6 s down (a boss/mini/elite: the x0.5 only) */
  brand: { t: 4, mul: 1.25 },                        /* L30 B BRANDING LIGHT: smite brands, the next maul blow on a branded foe inside 4 s lands x1.25 (spent) */
  home: { mul: 1.3, pip: 1 },                        /* L35 HAMMER HOMECOMING: the hammer's way back x1.3; a catch after a strike pays one pip */
  sun: { speed: 1.25, patch: 1.75 },                 /* L40 A SUNSTEP: the step x1.25 faster, its patch of light stands x1.75 as long */
  pillar: { r: 46, mul: 0.9, aura: 4 },              /* L40 B PILLAR UNBOUND: the dawnfall pillar r 30 -> 46, swordDmg x 0.9 (was 0.6), the aura lit 4 s (was 2) */
  eye: { reach: 160, max: 6, pip: 1 },               /* L45 JUDGE'S EYE: verdict reaches 160 px (was 110), six sigils (was four), a strike on a boss pays one pip a cast */
  noon: { t: 8, blow: 1.25, take: 0.8 },             /* L50 A THE LONG NOON: 8 s: his blows x1.25, the blows he takes x0.8, the aura kept lit */
  lance: { n: 5, k: 1.5, cap: 3, reach: 260, gap: 0.14, stagger: 0.7 },   /* L50 B HEAVEN'S LANCES: five lances, each x1.5, spread round-robin on the nearest foes ahead, one foe takes 3 at most, 0.14 s apart */
};
/* upgrade multipliers by rank 0 / I / II */
export const UP = { faith: [1, 1.1, 1.2], ward: [1, 0.85, 0.7], hammer: [1, 1.2, 1.4], smite: [1, 1.15, 1.3], step: [1, 1.25, 1.5] };
export const TRUE_PIPS = [0, 0.5, 1], LONG_AURA = [0, 1, 2], COOL_CUT = [0, 0.5, 1];
const rank = r => Math.max(0, Math.min(2, r | 0));
export const upMul = (key, r) => UP[key][rank(r)];
export const truePips = r => TRUE_PIPS[rank(r)], auraAdd = r => LONG_AURA[rank(r)], coolCut = r => COOL_CUT[rank(r)];
/* L25 HALLOWED STEEL: the swing's multiplier while the parry's light lasts (armedAt = the time the perfect guard armed it; 0 = none) */
export const steelMul = (owned, armedAt, now) => owned && armedAt > 0 && now - armedAt <= PT.steel.t ? PT.steel.mul : 1;
/* L30 A WARD NOVA: is this turned blow (the n-th) the one that rings; who it reaches (candidates {x, y}) */
export const novaDue = (owned, n) => !!owned && n > 0 && n % PT.nova.every === 0;
export const novaTargets = (foes, px, py) => foes.filter(e => Math.abs(e.x - px) <= PT.nova.r && Math.abs(e.y - py) <= 40);
/* L30 B BRANDING LIGHT: a brand lasts to `until`; the multiplier on a blow at `now` (1 once spent / out of time) */
export const brandUntil = (owned, now) => owned ? now + PT.brand.t : 0;
export const brandMul = (owned, until, now) => owned && until > 0 && now <= until ? PT.brand.mul : 1;
/* L35 HAMMER HOMECOMING: the multiplier on a leg (back = the way home), and what the catch pays */
export const homeMul = (owned, back) => owned && back ? PT.home.mul : 1;
export const homePip = (owned, struck) => owned && struck > 0 ? PT.home.pip : 0;
/* L40 A SUNSTEP: the step's speed and the patch's life (base = the shipped life, r = STEP+) */
export const stepSpeed = (base, owned) => owned ? base * PT.sun.speed : base;
export const patchLife = (base, owned, r) => base * (owned ? PT.sun.patch : 1) * upMul('step', r);
/* L40 B PILLAR UNBOUND: the dawnfall's numbers */
export const pillar = (base, owned) => owned ? { ...base, r: PT.pillar.r, mul: PT.pillar.mul, aura: PT.pillar.aura } : base;
/* L45 JUDGE'S EYE: verdict's numbers, and what a strike on a big foe pays (once a cast: paid = already paid) */
export const verdictNums = (base, owned) => owned ? { ...base, reach: PT.eye.reach, max: PT.eye.max } : base;
export const eyePip = (owned, struckBig, paid) => owned && struckBig && !paid ? PT.eye.pip : 0;
/* L50 A THE LONG NOON: his blow multiplier and the multiplier on what he takes while it runs (t = seconds left) */
export const noonBlow = (owned, t) => owned && t > 0 ? PT.noon.blow : 1;
export const noonTake = (owned, t) => owned && t > 0 ? PT.noon.take : 1;
/* L50 B HEAVEN'S LANCES: ready (he owns it and holds five pips), and who each lance falls on: the foes ahead (candidates {x}) nearest first, round-robin, <= cap each.
   Returns n entries: the foe, or null when none is left for that lance (it falls on bare ground ahead). */
export const lanceReady = (owned, pips) => !!owned && pips >= 5;
export function lanceTargets(foes, px, face) {
  const ahead = foes.filter(e => (e.x - px) * face >= -6 && Math.abs(e.x - px) <= PT.lance.reach).sort((a, b) => Math.abs(a.x - px) - Math.abs(b.x - px));
  const out = [], took = new Map();
  for (let i = 0; i < PT.lance.n; i++) { let pick = null;
    for (let j = 0; j < ahead.length; j++) { const e = ahead[(i + j) % ahead.length]; if ((took.get(e) || 0) < PT.lance.cap) { pick = e; break; } }
    if (pick) took.set(pick, (took.get(pick) || 0) + 1); out.push(pick); }
  return out;
}
