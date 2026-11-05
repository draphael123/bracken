// src/ranger-tech.js - THE RANGER'S L25-L50 TECHNIQUES, numbers and pure rules (claude/rangerpack; the data and card text are src/tech-ranger.js). No world in here: ranger.js / main.js
// own the frame and call these where her own code already is (arrowHit, release, the bash turn, the volley, the flip, greatArrow).
// THE LAW (brief-l50abilities sec 4): every blow is swordDmg x k (x amul for a skill), never a flat hit; a boss takes damage and its resist floor, never a free stagger, a pin or an immunity;
// nothing here heals; FX dice are Math.random on particles only. Her resource is HUNTER'S FOCUS (P.rgFocus): both capstones are the one ultimate input (UP+C at a FULL focus) and a pick
// reshapes (A) or replaces (B) THE GREAT ARROW. Both empty the focus as the great arrow did.
export const RT = {
  flight: { focus: 10, back: 1 },                                /* L25 TRUE FLIGHT: a landed steady shot returns its arrow at once and pays +10 focus */
  nock: { focus: 20, arrows: 1 },                                /* L30 A COUNTER-NOCK: a beat-turned blow pays +1 arrow and +20 focus (a boss blow too; no stagger, no kick beyond the parry's own) */
  split: { k: 0.6, wait: 0.15, cost: 6 },                        /* L30 B SPLIT SHOT: a full draw looses a free second arrow 0.15 s later at x0.6, +6 wind */
  far: { from: 140, mul: 1.2, focus: 14 },                       /* L35 LONG EYE: a landed arrow from 140+ px hits x1.2 and pays focus (the sweet spot is 52-138, so this is the far half) */
  barb: { stagger: 0.4, mark: 4 },                               /* L40 A BARBED VOLLEY: a common/elite foe struck by a volley arrow is staggered 0.4 s and marked 4 s; bosses and minis: damage only */
  part: { k: 0.9, flip: 4 / 3, stagger: 0.35 },                  /* L40 B PARTING SHOT: the backflip x1.33 further; X in it looses a x0.9 arrow (a quick shot is x0.6), staggers a small foe 0.35 s */
  breath: { win: 0.2, range: 1.25 },                             /* L45 STEADY BREATH: +0.2 s on the steady window (x the wind's quickness), +25% steady-shot range */
  long: { draw: 0.7, range: 1.9, dmg1: 6.0, minRange: 520 },     /* L50 A THE LONG DRAW: draw 0.5 -> 0.7 s, range x1.9 of the screen's own (cap 520 px), far-end pay 4.5 -> 6.0 swords (a boss x1.5 on top, as before) */
  storm: { n: 12, k: 0.8, from: 90, to: 290, over: 1.5, r: 15, draw: 0.5, stagger: 0.5, fall: 0.22 },   /* L50 B THE ARROW STORM: 12 arrows land across 90-290 px ahead over 1.5 s, x0.8 each, +-r px wide, small foes staggered 0.5 s */
};
/* upgrade multipliers by rank 0 / I / II */
export const UP = { fletch: [1, 0.85, 0.7], focus: [1, 1.15, 1.3], stead: [0, 0.05, 0.1], dist: [1, 1.06, 1.12], bash: [1, 0.85, 0.75], volley: [1, 0.85, 0.7], head: [1, 1.05, 1.1], quiver: [0, 1, 2] };
const rank = r => Math.max(0, Math.min(2, r | 0));
export const upMul = (key, r) => UP[key][rank(r)];
/* the steady window's extra seconds (before x the wind's quickness): STEADY BREATH + STILL HAND */
export const winExtra = (breath, stead) => (breath ? RT.breath.win : 0) + upMul('stead', stead);
/* the distance bonus with LONG SIGHT: only the part over x1.0 grows */
export const distBonus = (m, r) => m > 1 ? 1 + (m - 1) * upMul('dist', r) : m;
/* L35 LONG EYE: what an arrow landing from `d` px pays (mul on the blow, focus on the bar) */
export const farEye = (owned, d) => owned && d >= RT.far.from ? { mul: RT.far.mul, focus: RT.far.focus } : { mul: 1, focus: 0 };
/* L25 TRUE FLIGHT: a landed steady shot comes home and pays focus (null when not owned / not steady / missed) */
export const trueFlight = (owned, emp, landed) => owned && emp && landed ? { back: RT.flight.back, focus: RT.flight.focus } : null;
/* L30 A COUNTER-NOCK: the pay of a beat-turned blow */
export const counterNock = owned => owned ? { arrows: RT.nock.arrows, focus: RT.nock.focus } : null;
/* L30 B SPLIT SHOT: the second arrow of a FULL long-shot draw (the steady pierce is not split) */
export const splitArrow = (owned, full, steady) => owned && full && !steady ? { wait: RT.split.wait, k: RT.split.k, cost: RT.split.cost } : null;
/* L40 A BARBED VOLLEY: what a volley arrow does to the foe it strikes (a boss / mini takes damage only) */
export const barbed = (owned, big) => owned && !big ? { stagger: RT.barb.stagger, mark: RT.barb.mark } : null;
/* L40 B PARTING SHOT: the flip's reach and the shot's k (null = the quick shot's own) */
export const flipReach = owned => owned ? RT.part.flip : 1;
export const partingK = (owned, dodging) => owned && dodging ? RT.part.k : null;
/* L45 STEADY BREATH: the steady shot's range */
export const steadyRange = (base, owned) => owned ? Math.round(base * RT.breath.range) : base;
/* L50 A THE LONG DRAW: the draw, the range (view = the screen's width) and the far-end pay */
export const greatDraw = (long, base) => long ? RT.long.draw : base;
export const greatRange = (long, base, view) => long ? Math.min(RT.long.minRange, Math.round((view || base) * RT.long.range)) : Math.min(base, view || base);
export const greatPay = (long, base) => long ? { ...base, dmg1: RT.long.dmg1 } : base;
/* L50 B THE ARROW STORM: n landing spots spread over from..to px ahead, each with its own wait inside `over` s (a deterministic spread; ranger.js adds the jitter) */
export function stormPlan(face) {
  const S = RT.storm, out = [];
  for (let i = 0; i < S.n; i++) { const u = ((i * 5) % S.n) / (S.n - 1); out.push({ dx: face * (S.from + (S.to - S.from) * u), at: S.fall + (S.over - S.fall) * (i / (S.n - 1)), done: false }); }
  return out;
}
