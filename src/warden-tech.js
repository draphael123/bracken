// src/warden-tech.js - THE WARDEN'S L25-L50 TECHNIQUES, numbers and pure rules (claude/wardenpack; the data and card text are src/tech-warden.js). No world in here: main.js owns the frame
// and calls these where the Warden's own code already is (swingDmg / tipPay, the deflect turn, wthThrow / wthHit, phalanxCast, the pole-vault landing, wardenLongPost, the ultimate).
// THE LAW (brief-l50abilities sec 4): every blow is swordDmg x k x amul (never a flat hit); a boss takes the damage and its resist floor, never a free stagger, a pin or an immunity;
// a foe takes at most one hit of a technique per use; nothing here heals; FX dice are Math.random on particles only. Her resource is the REACH BAND (P.vigil): both capstones are
// the one ultimate input (UP+C at a FULL band), and a pick replaces WARDEN'S REACH as it was (A reshapes it, B throws the great javelin instead). Both empty the band.
import { WID } from './warden-id.js';
export const WT = {
  point: { mul: 1.2, t: 2.5, tip: 1.3 },                          /* L25 POINTED: a tip hit (a pay of 1.3 or more) marks the foe; the next blow on it is x1.2 and spends the mark */
  keep: { stagger: 0.5, band: 8, to: WID.long.keep, recoil: 55 },   /* L30 A KEEP-OFF: a beat-turned blow shoves a small attacker out to the point (the long thrust's keep), a boss gives her recoil instead */
  twin: { k: 0.6, wait: 0.18, cost: 6 },                          /* L30 B TWIN JAVELIN: the quick throw (tier 1) looses a second spear 0.18 s later at x0.6 */
  far: { from: 70, mul: 1.3, band: 12, range: 1.2 },              /* L35 FAR POINT: a javelin that strikes from 70+ px: x1.3, +12 band, and it flies 20% further */
  thru: { k: 0.6, len: 52 },                                      /* L45 RUN THROUGH: the long thrust's second foe, within 52 px past the first, takes x0.6 */
  ring: { back: 120 },                                            /* L40 A ROUND ROW: the phalanx's short row behind her, 120 px (the long row ahead is 300) */
  spring: { cdMul: 0.5, k: 0.8, r: 44, band: 15, cap: 3 },        /* L40 B SPRING POINT: pole-vault cd x0.5, the landing stabs up to 3 more foes within 44 px of the vaulted one at x0.8, +15 band */
  longline: { t: 9, mul: 2.4, perHit: 0.8, finalLen: 260, final: 3.0 },   /* L50 A THE LONG LINE: WARDEN'S REACH 6 s -> 9 s, x2 -> x2.4 stretch, hits x1.0 -> x0.8, the closing thrust 220 -> 260 px and x2.5 -> x3.0 */
  great: { k: 5.0, splash: 1.5, r: 44, speed: 620, range: 320, knock: 220, stagger: 0.6, bossStagger: 0 },   /* L50 B THE GREAT JAVELIN: one heavy blow on the first foe, a burst of x1.5 around it (small foes thrown back + staggered; a boss/mini: damage only) */
};
/* upgrade multipliers by rank 0 / I / II */
export const UP = {
  band: [1, 1.2, 1.4], haft: [0, 0.5, 1.0], tip: [1, 1.06, 1.12], shaft: [1, 0.85, 0.75], jav: [1, 1.2, 1.4], row: [1, 0.85, 0.7], vault: [1, 0.85, 0.7], long: [1, 1.12, 1.24],
};
const rank = r => Math.max(0, Math.min(2, r | 0));
export const upMul = (key, r) => UP[key][rank(r)];
/* the pay at which a tip hit counts for POINTED (haft is 0.3, the shaft 0.7, a band-0 tip ~1.5) */
export const isTipPay = pay => pay >= WT.point.tip;
/* L25 POINTED (+ SWEET POINT): `pay` is what tipPay returned for this blow, markUntil the foe's mark clock; returns the multiplier for THIS blow and the new mark clock */
export function pointedHit(owned, pay, markUntil, now, tipRank = 0) {
  let mul = 1, until = markUntil || 0;
  if (owned && until > now && pay > 0.5) { mul *= WT.point.mul; until = 0; }   /* a blow on the haft (0.3) neither spends nor earns it */
  if (isTipPay(pay)) { mul *= upMul('tip', tipRank); if (owned) until = now + WT.point.t; }
  return { mul, until };
}
/* L30 A KEEP-OFF: what a beat-turned blow does to the attacker (dist = edge gap to her): a small foe is driven to rest at the point, a boss/mini gives her a step; the band pays either way */
export function keepOff(big, dist) {
  if (big) return { recoil: WT.keep.recoil, kick: 0, stagger: 0, band: WT.keep.band };
  return { recoil: 0, kick: dist >= WT.keep.to - 2 ? 0 : Math.max(120, (WT.keep.to - dist) / 0.335 + 40), stagger: WT.keep.stagger, band: WT.keep.band };
}
/* L30 B TWIN JAVELIN: the second spear of a quick throw (null when not owned or the tier is not the quick one) */
export const twinSpear = (owned, tier) => owned && tier === 1 ? { wait: WT.twin.wait, k: WT.twin.k, cost: WT.twin.cost } : null;
/* L35 FAR POINT: how far a javelin flies, and what a strike from `dist` px pays (mul on the blow, band on the bar) */
export const javRange = (owned, base) => owned ? Math.round(base * WT.far.range) : base;
export const farHit = (owned, dist) => owned && dist >= WT.far.from ? { mul: WT.far.mul, band: WT.far.band } : { mul: 1, band: 0 };
/* the javelin's blow multiplier: the tier's k x the twin's own k x the far-point pay x JAVELIN+ (the quick/heavy/pin tiers themselves are warden-throw.js) */
export const javMul = (tierK, spearK, far, jav) => tierK * (spearK == null ? 1 : spearK) * far.mul * upMul('jav', jav);
/* L45 RUN THROUGH: the one foe behind the first, within `len` px past its far edge on her line (nearest wins); candidates are {x, w}; firstEdge = the first foe's far edge x */
export function thruTarget(foes, face, firstEdge) {
  let best = null, bd = 1e9;
  for (const e of foes) { const half = (e.w || 12) / 2, d = face > 0 ? (e.x - half) - firstEdge : firstEdge - (e.x + half); if (d < -4 || d > WT.thru.len) continue; if (d < bd) { bd = d; best = e; } }
  return best;
}
/* L40 A ROUND ROW: the rows the phalanx sets (ahead always, behind with the technique; reach null = the skill's own) */
export const rowDirs = (owned, face) => owned ? [{ dir: face, reach: null }, { dir: -face, reach: WT.ring.back }] : [{ dir: face, reach: null }];
/* L40 B SPRING POINT: up to `cap` others within `r` px of the vaulted foe take the landing too; the cd rules */
export function springTargets(foes, he, owned) {
  if (!owned || !he) return [];
  return foes.filter(e => e !== he && Math.abs(e.x - he.x) <= WT.spring.r && Math.abs(e.y - he.y) <= 40).sort((a, b) => Math.abs(a.x - he.x) - Math.abs(b.x - he.x)).slice(0, WT.spring.cap);
}
export const vaultCd = (base, owned, r) => base * (owned ? WT.spring.cdMul : 1) * upMul('vault', r);
export const rowCd = (base, r) => base * upMul('row', r);
/* STEADY SHAFT: the deflect's wind cost; HAFT KEEPER: the haft drain's wait; DEEP BAND: the band's fill */
export const deflectCost = (base, r) => Math.max(3, Math.round(base * upMul('shaft', r)));
export const haftAfter = r => WID.band.after + UP.haft[rank(r)];
export const bandGain = (n, r) => n * upMul('band', r);
/* L50 A: the Reach's numbers as THE LONG LINE reshapes them, or as WID.reach / K_WARDEN_REACH (skill-k.js) have them */
export function reachNums(owned, K) {
  return owned ? { t: WT.longline.t, mul: WT.longline.mul, perHit: WT.longline.perHit, finalLen: WT.longline.finalLen, final: WT.longline.final }
    : { t: WID.reach.t, mul: WID.reach.mul, perHit: K.perHit, finalLen: WID.reach.finalLen, final: K.final };
}
/* L50 B: the burst around the great javelin's first foe; a boss/mini takes the damage only (no stagger, no throw-back) */
export const greatBurst = big => ({ k: WT.great.splash, knock: big ? 0 : WT.great.knock, stagger: big ? WT.great.bossStagger : WT.great.stagger });
