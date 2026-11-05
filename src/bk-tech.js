// src/bk-tech.js - THE BLOOD KNIGHT'S L25-L50 TECHNIQUES, the numbers and the pure rules (claude/bkpack; data in src/tech-bloodknight.js, effects in src/main.js beside the bkrework blood
// code). Nothing here touches the page, so tools/bk-tech.mjs plays every rule in node. THE LAW (brief-l50abilities sec 4): every blow is swordDmg x k, no flat damage; a boss takes the damage
// and its resist floor, never a free stagger, pin or immunity; no heal is added (debt reclaim stays the only one); one hit-stop per cast; FX dice are Math.random on particles only.
export const BT = {
  /* L25 REAP THE BLEED: the REND (T1) on a bleeding foe: k x the bleed left (a bleed of `full` s or more pays all of k, a thin one at least `min` of it) */
  reap: { k: 1.2, full: 3, min: 0.34 },
  /* L30 A CRIMSON REACH: the lash is `px` long (was BLOOD.lash.reach 24); hooks up to `n` small foes, drawn to `pull` px before him at `sp` px/s; the whip's far end (past `steel` px) hits `far` of the blow */
  reach: { px: 120, n: 3, pull: 12, gap: 7, sp: 760, steel: 58, far: 0.5 },
  /* L30 B WARD LANCE: k = k0 + per x (the chip the ward drank, as a share of max health), at most kMax; flies sp px/s for life s; bleeds bleed s; a lance is not a reclaim */
  lance: { k0: 0.6, per: 6, kMax: 1.6, sp: 430, life: 0.5, bleed: 2 },
  /* L35 PLANT THE BLADE: held `hold` s on DOWN+C; a rite of radius r for life s, foes in it bleed (bleed s, refreshed every tick s); he inside: the debt drains drain x as fast and at most
     healCap of max health comes back as health from it, per plant */
  plant: { hold: 0.6, r: 120, band: 44, life: 6, cd: 25, tick: 0.5, bleed: 1.5, drain: 2, healCap: 0.03 },
  /* L40 A PAY IT FORWARD: needs debt >= min of max health; the wave k = k0 + per x (debt / max health) (the debt caps at 0.4: 1.76 at the full bar); flies sp px/s for life s (= reach px) */
  forward: { min: 0.3, k0: 0.8, per: 2.4, sp: 360, life: 0.56, cd: 14 },
  /* L40 B MORTGAGE: a second BLOOD PRICE within win s of the first; pays pct of max health more as debt; the next n blows land mul harder, for at most t s; cd s */
  mort: { win: 0.8, pct: 0.17, n: 3, mul: 1.4, t: 10, cd: 8 },
  /* L45 BLOOD ECHO: in HEMORRHAGE each rhythm cut repeats after delay s at k */
  echo: { delay: 0.25, k: 0.4 },
  /* L50 A REQUIEM UNBOUND: each blow on a branded foe adds per s to the HEMORRHAGE clock (at most cap s left); it ends in a nova of radius r (k); he takes take x damage throughout */
  unbound: { per: 0.4, cap: 12, r: 92, k: 0.9, take: 1.25 },
  /* L50 B THE RECKONING: t s; each blow he takes is returned as a bleed on its attacker: back x the blow over over s (4 ticks), at most cap sword-hits per foe in one Reckoning; the debt does
     not drain; at the end repay of the debt is health (the rest is burned) */
  reckon: { t: 8, back: 0.8, over: 2, ticks: 4, cap: 6, repay: 0.5 },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* the damage of a hit of multiplier k on a sword of `sword` damage and a skill multiplier `mult` (the hero's growth, main.js amul0) */
export const dmgOf = (sword, k, mult = 1) => Math.max(1, Math.round(sword * k * mult));
/* REAP: the share of the bleed left that pays (a foe with `bleedLeft` s of bleed) */
export const reapShare = bleedLeft => bleedLeft > 0 ? clamp(bleedLeft / BT.reap.full, BT.reap.min, 1) : 0;
export const reapK = bleedLeft => BT.reap.k * reapShare(bleedLeft);
/* CRIMSON REACH: which foes the whip hooks - the nearest `n` of those ahead (xs: their x, face +-1 from px) that are hookable; returns their indices in order (nearest first) */
export function hookPick(px, face, foes) {
  return foes.map((f, i) => ({ i, d: (f.x - px) * face })).filter(o => o.d > 0 && o.d <= BT.reach.px + 24 && foes[o.i].hookable).sort((a, b) => a.d - b.d).slice(0, BT.reach.n).map(o => o.i);
}
/* where hooked foe number n (0 = nearest) ends: a heap before him, `gap` px apart */
export const hookSpot = (px, face, n) => px + face * (BT.reach.pull + BT.reach.gap * n);
/* the far end of the whip is lighter (`far` of the blow beyond `steel` px from him) */
export const lashFarMul = (dx, reachOwned) => reachOwned && Math.abs(dx) > BT.reach.steel ? BT.reach.far : 1;
/* WARD LANCE: the chip the guard drank (hp) on a max health -> k */
export const lanceK = (chip, maxHp) => chip > 0 ? Math.min(BT.lance.kMax, BT.lance.k0 + BT.lance.per * chip / Math.max(1, maxHp)) : 0;
/* PAY IT FORWARD */
export const forwardReady = (debt, maxHp) => debt >= BT.forward.min * maxHp;
export const forwardK = (debt, maxHp) => forwardReady(debt, maxHp) ? BT.forward.k0 + BT.forward.per * clamp(debt / Math.max(1, maxHp), 0, 0.4) : 0;
/* PLANT THE BLADE: the extra debt drained in dt s by a normal drain rate `rate` (hp/s), and how much of it may be health (budget left `left` hp) */
export const riteExtra = (rate, dt) => Math.max(0, rate) * (BT.plant.drain - 1) * dt;
export const riteHealBudget = maxHp => BT.plant.healCap * maxHp;
/* MORTGAGE: can this DOWN+C be the second one? (since = s since the first price, cdLeft = s left on the mortgage cooldown) */
export const mortReady = (since, cdLeft) => since >= 0 && since <= BT.mort.win && !(cdLeft > 0);
/* BLOOD ECHO: the echo's k of a cut that did `dmg` */
export const echoDmg = dmg => Math.max(1, Math.round(dmg * BT.echo.k / 1));
/* REQUIEM UNBOUND: the hemorrhage clock after a landed blow (left s remain) */
export const unboundClock = left => Math.min(BT.unbound.cap, left + BT.unbound.per);
/* THE RECKONING: the bleed a blow of `dmg` returns, per tick, and the cap on one foe */
export const reckonTick = dmg => Math.max(1, Math.round(dmg * BT.reckon.back / BT.reckon.ticks));
export const reckonCap = sword => BT.reckon.cap * sword;
export const reckonRepay = debt => Math.max(0, debt) * BT.reckon.repay;
/* the upgrades' numbers (rank 0, 1, 2) */
export const UP = {
  notchNeed: r => r >= 1 ? 2 : 3, notchLife: r => r >= 2 ? 20 : 12, lashBleed: r => r >= 1 ? 1 : 0, lashMark: r => r >= 2, wardMul: r => [1, 0.8, 0.667][clamp(r | 0, 0, 2)],
  debtHold: r => [0, 1, 2][clamp(r | 0, 0, 2)], waveMul: r => [1, 1.2, 1.4][clamp(r | 0, 0, 2)], poolMul: r => [1, 1.2, 1.4][clamp(r | 0, 0, 2)], mailMul: r => [1, 0.85, 0.7][clamp(r | 0, 0, 2)], lastVitae: r => [0, 10, 20][clamp(r | 0, 0, 2)],
};
