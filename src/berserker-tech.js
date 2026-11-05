// src/berserker-tech.js - THE BERSERKER'S L25-L50 TECHNIQUES, numbers and pure rules (claude/berserkerpack; the data and card text are src/tech-berserker.js).
// No world in here: src/berserker.js (his own module) and main.js call these where his code already is (kill rage, the parry, REND, the axe, the barge, the frenzy).
// His resource is RAGE (P.rage 0-100: filled by blows dealt, blows taken on the axes and parries, drained out of a fight). Both capstones spend a FULL bar:
// A rides the FRENZY (DOWN+C at a full bar, as ever), B is the one ultimate input (UP+C at a full bar) - the GREAT AXE. A pick of neither leaves his kit exactly as shipped.
// THE LAW (brief-l50abilities sec 4): every new blow is swordDmg x k (x amul where he has a skill rank); a boss takes the damage and its resist floor, never a free stagger,
// a pin or an immunity; a foe takes a technique's blow at most once per use; the only heal is the frenzy's own, as shipped. FX dice are Math.random on particles only.
// Distinct from the Demon Hunter's brand-fury: his bar is filled by being hit and by hitting, not by marks, and it is spent in his own body (a frenzy, a thrown axe), never on a mark.
export const BT = {
  scent: { rage: 15, t: 3, mul: 1.2 },                      /* L25 BLOOD SCENT: a kill (out of a frenzy) pays 15 rage and the next chop inside 3 s lands x1.2 */
  roar: { r: 70, stagger: 0.8, iron: 1.5 },                 /* L30 A BRACED ROAR: a PERFECT take-it shouts: small foes within 70 px reel 0.8 s, he cannot be flinched 1.5 s */
  veins: { rage: 50, need: 4, tideNeed: 3 },                /* L30 B OPEN VEINS: REND stacks from half a bar of rage, not only in a frenzy (the 4th still cracks; the RED TIDE frenzy cracks on the 3rd) */
  arm: { mul: 1.3, rage: 15 },                              /* L35 AXE ARM: the thrown hatchet x1.3; picking it up pays 15 rage */
  bull: { shoveMul: 1.5, stagger: 1.0, rage: 8 },           /* L40 A BULL BARGE: the barge shoves 1.5x further, 1.0 s down, +8 rage per foe */
  chain: { add: 0.5, cap: 6 },                              /* L40 B CHAINED RAGE: a kill in a frenzy +0.5 s, 6 s at most per frenzy */
  split: { k: 0.5, r: 40, cap: 2, stagger: 0.5 },           /* L45 SPLINTERING HATCHET: up to 2 small foes within 40 px of the one the hatchet struck take x0.5 and 0.5 s down; never a boss/mini */
  tide: { t: 10, mul: 1.25, take: 1.35 },                   /* L50 A THE RED TIDE: the frenzy runs 10 s (was 8), every chop x1.25, he takes x1.35 (was x1.25); REND cracks on the 3rd blow */
  great: { k: 3.0, back: 1.5, speed: 330, out: 0.8, speedBack: 420 },   /* L50 B THE GREAT AXE: UP+C at a full bar: 264 px out through every foe at x3.0, then home at x1.5; once per foe per leg */
};
/* upgrade multipliers by rank 0 / I / II */
export const UP = { stoke: [1, 1.1, 1.2], split: [1, 1.15, 1.3], axe: [1, 1.2, 1.4], price: [1, 1.25, 1.5], drain: [1, 0.8, 0.6] };
export const TAKE_BEAT = [0, 0.03, 0.06], THICK_CUT = [0, 0.05, 0.1], COOL_CUT = [0, 0.5, 1];
const rank = r => Math.max(0, Math.min(2, r | 0));
export const upMul = (key, r) => UP[key][rank(r)];
export const takeBeat = r => TAKE_BEAT[rank(r)], thickCut = r => THICK_CUT[rank(r)], coolCut = r => COOL_CUT[rank(r)];
/* L25 BLOOD SCENT: what a kill pays (a frenzy pays nothing: the bar is already spent into it), and the chop's multiplier while the scent lasts (armedAt = the time the kill armed it) */
export const scentKill = (owned, frenzy) => owned && !frenzy ? { rage: BT.scent.rage, armed: true } : { rage: 0, armed: false };
export const scentMul = (owned, armedAt, now) => owned && armedAt > 0 && now - armedAt <= BT.scent.t ? BT.scent.mul : 1;
/* L30 B OPEN VEINS (+ L50 A): does a blow stack REND, and how many stacks crack the foe */
export const rendOn = (owned, frenzy, rage, force) => !!(force || frenzy || (owned && rage >= BT.veins.rage));
export const rendNeed = (base, frenzy, tide) => frenzy && tide ? BT.veins.tideNeed : base;
/* L30 A BRACED ROAR: who the shout reels (candidates {x, dy, big}); small foes only, never a boss, mini or elite (`big`) */
export const roarTargets = (foes, px, owned) => !owned ? [] : foes.filter(e => !e.big && Math.abs(e.x - px) <= BT.roar.r && Math.abs(e.dy || 0) <= 40);
/* L35 AXE ARM (+ HATCHET+): the thrown hatchet's multiplier, and the rage a pick-up pays */
export const axeMul = (owned, r) => (owned ? BT.arm.mul : 1) * upMul('axe', r);
export const axePick = (owned, frenzy) => owned && !frenzy ? BT.arm.rage : 0;
/* L40 A BULL BARGE: the shove's speed and the stagger, and the rage per foe */
export const bargeNums = (owned, base) => owned ? { shove: Math.round(base.shove * BT.bull.shoveMul), stagger: BT.bull.stagger, rage: BT.bull.rage } : { shove: base.shove, stagger: base.stagger, rage: 0 };
/* L40 B CHAINED RAGE: how much a kill adds to a frenzy that has already had `added` s from kills */
export const chainAdd = (owned, added) => owned ? Math.max(0, Math.min(BT.chain.add, BT.chain.cap - added)) : 0;
/* L45 SPLINTERING HATCHET: up to `cap` small foes within r of the one struck (never it, never a boss/mini) */
export function splinterTargets(foes, hit, owned) {
  if (!owned || !hit || hit.big) return [];
  return foes.filter(e => e !== hit && !e.big && Math.abs(e.x - hit.x) <= BT.split.r && Math.abs(e.y - hit.y) <= 40).sort((a, b) => Math.abs(a.x - hit.x) - Math.abs(b.x - hit.x)).slice(0, BT.split.cap);
}
/* L50 A THE RED TIDE: the frenzy's length, the chop multiplier while it runs, the take multiplier (THICK SKIN+ takes its points off) */
export const frenzyLen = (base, long, tide) => (tide ? BT.tide.t : base) + long;
export const tideMul = (tide, frenzy) => tide && frenzy ? BT.tide.mul : 1;
export const frenzyTake = (base, tide, thick) => Math.max(1, (tide ? BT.tide.take : base) - thickCut(thick));
export const frenzyHeal = (base, r) => base * upMul('price', r);
/* L50 B THE GREAT AXE: which leg it is on after t s of flight (out until BT.great.out, then home), and the k each leg pays */
export const greatLeg = t => t < BT.great.out ? 'out' : 'back';
export const greatK = leg => leg === 'out' ? BT.great.k : BT.great.back;
export const greatReady = (owned, rage, frenzy, hasAxe) => !!owned && rage >= 100 && !frenzy && !hasAxe;
