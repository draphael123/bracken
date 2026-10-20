// src/blood-kit.js — THE BLOOD KNIGHT'S BLOOD KIT (claude/bloodknight, Daniel 10-17 live "yes, do what you propose", scratch/brief-bloodknight-1017.md 2-5).
// The hero 'reaper' and the boss 'bloodknight' are THE BLOOD KNIGHT (ids unchanged: saves, hashes and rows hold). His sustain is ONE mechanic:
//   BLOOD DEBT (the rally)   a blow that lands on him leaves debt.share of what it took as a RED SEGMENT on his health bar, past the health he has.
//                            It drains away over debt.drainT s (debt.hold s held first). Every blow of his that lands RECLAIMS part of it as health
//                            (debt.reclaim x the blow, never more than the segment: he never heals above where he was before the hit). Any other
//                            heal (a flask, the nova) fills the segment first. Capped at debt.cap of his max health. No other passive heal: the
//                            drag's drink, the crescent's drink-back and the crouch harvest are gone (this replaces generic lifesteal).
//                            A WARD-RELEASE PARRY or a BLOOD SPIKE reclaims ALL of it. T4/T5 heavies SPEND it as power instead.
//   BLOOD PRICE (DOWN+C)     on his knee he opens a vein: price.pct of his max health (never his last point) goes ON THE BAR AS DEBT, and for
//                            price.buffT s his blade is BLOOD-EDGED (x price.mul). Pay, then hit to win it back - or spend it on a T4/T5 heavy.
//   THE FIVE-TIER HEAVY      HOLD X; let go any time past T1 and that tier comes down. The blade glows deeper each tier, with a tick.
//    (hold X)                 T1 REND ~0.3 s a fast cleave | T2 SUNDER ~0.6 s overhead, cracks a guard / poise | T3 CRIMSON CRESCENT ~1.0 s a short
//                            travelling blood wave | T4 EXSANGUINATE ~1.4 s a lunging impale - NEEDS debt (tiers.need[4]) and SPENDS it all |
//                            T5 BLOOD MOON ~1.9 s a ground slam + geyser that bleeds all it hits - needs a BIG debt (tiers.need[5]). T1-3 are free.
//                            Every heavy BLEEDS what it lands on. While the blade is held the debt does not drain (the blade holds the blood).
//   BLOOD SPIKE (crouch)     the crouch is still the low block (the greatsword planted point-down). A LOW blow blocked ON THE BEAT (the kneel
//                            begun within spike.beat s of it landing) erupts crimson spikes round the blade: damage + stagger the attacker, a wind
//                            refund, ALL the debt reclaimed. His LOW parry, beside the ward-release HIGH parry. No corpse harvesting.
// main.js binds it (the hooks marked claude/bloodknight); tools/blood-kit.mjs checks the rules here and in the page.
export const BLOOD = {
  /* share: the part of a blow taken that becomes debt; cap: of max hp; drainT: s from a new debt to empty; hold: s before it starts to drain;
     reclaim: x the damage of his landed blow that comes back (min reclaimMin hp, never past the segment) */
  debt: { share: 0.5, cap: 0.25, drainT: 3, hold: 0.45, reclaim: 0.45, reclaimMin: 1 },
  /* BLOOD PRICE: pct of max health, on the bar as debt; buffT s of BLOOD-EDGED blades at mul; cd s between prices */
  price: { pct: 0.10, buffT: 6, mul: 1.2, cd: 1.2 },
  /* THE TIERS: at = held s (from the press, as the knight's CUT_AT) for T1..T5; auto = held this long, the best tier he may have comes down by itself;
     mul = the blow's multiplier per tier; need = debt (fraction of max hp) a tier needs; spendMul: a T4/T5 adds spent/maxHp x this to its multiplier;
     bleed = seconds of bleed per tier (bleedN 1, 2 from T4) */
  tiers: { at: [0.3, 0.6, 1.0, 1.4, 1.9], auto: 2.5, mul: [0, 1.5, 1.8, 2.0, 2.4, 2.6], need: [0, 0, 0, 0, 0.06, 0.14], spendMul: 4, bleed: [0, 2, 2.5, 2.5, 3, 4],
    names: ['', 'REND', 'SUNDER', 'CRIMSON CRESCENT', 'EXSANGUINATE', 'BLOOD MOON'],
    cols: [null, '#ff9aa6', '#ff6b6b', '#ff4a5a', '#d0182c', '#8a0a1a'] },
  /* T3's travelling wave: px/s, life s, multiplier of the sword's blow; T4's lunge px/s while the art runs to lungeTo; T5's geyser reach px */
  wave: { sp: 270, life: 0.4, mul: 1.1 },
  lunge: { v: 210, from: 0.1, to: 0.22 },   /* the drive runs with the live box (from..to of the art clock) and stops the moment the point goes in */
  moon: { reach: 58, mul: 0.9 },
  /* BLOOD SPIKE: beat s; the spikes hit mul x the sword's blow, stagger s, knock px/s (not a big one), st wind refund (held to commit.js refundCap) */
  spike: { beat: 0.22, mul: 1.2, stagger: 0.8, knock: 200, st: 12 },
};

/* which tier a hold of `held` s reaches, with `debt` hp of debt on a max health of `maxHp` (a tier that needs more debt than he has is not reached) */
export function tierFor(held, debt, maxHp, quick = 1) {
  const T = BLOOD.tiers; let st = 0;
  for (let i = 0; i < 5; i++) { if (held < T.at[i] * quick) break; const need = T.need[i + 1] * maxHp; if (need > 0 && (debt || 0) + 1e-6 < need) break; st = i + 1; }
  return st;
}
/* the tier the hold has reached on time alone (to say "NEEDS BLOOD DEBT" when the debt holds it back) */
export const tierByTime = (held, quick = 1) => { let st = 0; for (let i = 0; i < 5; i++) if (held >= BLOOD.tiers.at[i] * quick) st = i + 1; return st; };

/* THE DEBT on a hero-like object p (p.hp, p.maxHp; p.bd the debt, p.bdRate, p.bdHold, p.bdLast the health last frame).
   Called every frame for him. A drop in health since last frame becomes debt (share), a rise fills it; freeze holds the drain (the blade wound). */
export function debtStep(p, dt, { freeze = false, dead = false } = {}) {
  const D = BLOOD.debt;
  if (dead) { debtClear(p); return; }
  if (p.bdLast === undefined || p.bdLast === null) p.bdLast = p.hp;
  const d = p.hp - p.bdLast;
  if (d < 0) debtAdd(p, -d * D.share);
  else if (d > 0) p.bd = Math.max(0, (p.bd || 0) - d);   /* any heal fills the segment first */
  p.bdLast = p.hp;
  debtClamp(p);
  if (!(p.bd > 0)) { p.bd = 0; return; }
  if (freeze) return;
  if ((p.bdHold || 0) > 0) { p.bdHold -= dt; return; }
  p.bd = Math.max(0, p.bd - (p.bdRate || p.bd / D.drainT) * dt);
}
export function debtAdd(p, n) { const D = BLOOD.debt; if (!(n > 0)) return; p.bd = (p.bd || 0) + n; debtClamp(p); p.bdHold = D.hold; p.bdRate = p.bd / Math.max(0.1, D.drainT - D.hold); }
export function debtClamp(p) { const D = BLOOD.debt; p.bd = Math.max(0, Math.min(p.bd || 0, D.cap * p.maxHp, Math.max(0, p.maxHp - p.hp))); }
/* a landed blow of his that did `dmg`: part of the segment comes back as health. Returns the health given. */
export function debtReclaim(p, n) { if (!(p.bd > 0) || !(n > 0) || !(p.hp > 0)) return 0; const r = Math.min(p.bd, n, Math.max(0, p.maxHp - p.hp)); p.hp += r; p.bd -= r; p.bdLast = p.hp; return r; }
export const reclaimOf = dmg => Math.max(BLOOD.debt.reclaimMin, dmg * BLOOD.debt.reclaim);
/* ALL of it back (the parries) */
export const debtReclaimAll = p => debtReclaim(p, p.bd || 0);
/* T4/T5 spend it: the segment is gone, the blow is that much harder. Returns what was spent. */
export function debtSpend(p) { const s = p.bd || 0; p.bd = 0; p.bdHold = 0; return s; }
export function debtClear(p) { p.bd = 0; p.bdHold = 0; p.bdRate = 0; p.bdLast = p.hp; }
/* BLOOD PRICE on p: what it costs (never his last point), put on the bar as debt. Returns what was paid. */
export function payPrice(p, free = false) {
  const c = Math.max(1, Math.round(p.maxHp * BLOOD.price.pct));
  if (free) { debtAdd(p, c); p.bdLast = p.hp; return c; }
  const hp0 = p.hp; p.hp = hp0 <= 1 ? hp0 : Math.max(1, hp0 - c); const paid = hp0 - p.hp;
  p.bdLast = p.hp; if (paid > 0) { p.bd = (p.bd || 0) + paid; debtClamp(p); p.bdHold = BLOOD.debt.hold; p.bdRate = p.bd / Math.max(0.1, BLOOD.debt.drainT - BLOOD.debt.hold); }
  return paid;
}
/* a T4/T5's multiplier for what was spent */
export const spendMul = (spent, maxHp) => 1 + BLOOD.tiers.spendMul * Math.max(0, spent) / Math.max(1, maxHp);

/* THE HEAVIES' BOXES (x, y the hero's feet, face +-1, atk P.atk; the art clock and live window are the old crescent's, DK2.price) */
export function heavyBox(x, y, face, atk, tier, longHaft, live) {
  if (atk < live[0] || atk >= live[1]) return null;
  const lh = 14 * (longHaft || 0);
  const r = ([0, 36, 34, 40, 48, 30][tier] || 36) + lh, top = [0, 30, 44, 40, 26, 30][tier] || 36, back = tier === 5 ? 30 : tier === 3 ? 6 : 2;   /* REND wide and low, SUNDER tall (overhead), the CRESCENT round the front, EXSANGUINATE long and level, the MOON both sides */
  return face > 0 ? { l: x - back, r: x + r, t: y - top, b: y + 4 } : { l: x - r, r: x + back, t: y - top, b: y + 4 };
}
