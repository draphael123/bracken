// src/blood-kit.js — THE BLOOD KNIGHT'S BLOOD KIT (claude/bloodknight, Daniel 10-17 live "yes, do what you propose", scratch/brief-bloodknight-1017.md 2-5).
// The hero 'reaper' and the boss 'bloodknight' are THE BLOOD KNIGHT (ids unchanged: saves, hashes and rows hold). His sustain is ONE mechanic:
//   BLOOD DEBT (the rally)   a blow that lands on him leaves debt.share of what it took as a RED SEGMENT on his health bar, past the health he has.
//                            It drains away over debt.drainT s (debt.hold s held first). Every blow of his that lands RECLAIMS part of it as health
//                            (debt.reclaim x the blow, never more than the segment: he never heals above where he was before the hit). Any other
//                            heal (a flask, the nova) fills the segment first. Capped at debt.cap of his max health. No other passive heal: the
//                            drag's drink, the crescent's drink-back and the crouch harvest are gone (this replaces generic lifesteal).
//                            A WARD-RELEASE PARRY or a BLOOD SPIKE reclaims ALL of it. T4/T5 heavies SPEND it as power instead.
//                            (claude/bkblood, Daniel 10-23, scratch/brief-bkblood-1023.md: LOUD + LONGER - ~5 s, more of the blow; each reclaim is a blood stream into him,
//                            a drink, a '+N'; a heartbeat + a red screen edge while he owes; a bleeding foe gives more back and its bleed ticks feed it a little.)
//   VITAE + CRIMSON FRENZY   (claude/bkblood) his meter fills ONLY from health he reclaims; full, HOLD F = CRIMSON FRENZY (frenzy.t s: every blow wins back all of itself,
//                            a capped lifesteal past the debt, quicker cuts, the armour glowing; never invulnerable). It replaced BLOOD SURGE (kills/blocks filled that bar).
//   THE BLOOD LASH           (claude/bkblood) the rhythm's third cut: the blade's blood whips out lash.reach px past the steel and bleeds what it lands on.
//   BLOOD PRICE (DOWN+C)     on his knee he opens a vein: price.pct of his max health (never his last point) goes ON THE BAR AS DEBT, and for
//                            price.buffT s his blade is BLOOD-EDGED (x price.mul). Pay, then hit to win it back - or spend it on a T4/T5 heavy.
//   THE FIVE-TIER HEAVY      HOLD X; let go any time past T1 and that tier comes down. The blade glows deeper each tier, with a tick.
//    (hold X)                 T1 REND ~0.35 s a fast cleave | T2 SUNDER ~0.8 s overhead, cracks a guard / poise | T3 CRIMSON CRESCENT ~1.3 s a short
//                            travelling blood wave | T4 EXSANGUINATE ~1.9 s a lunging impale | T5 BLOOD MOON ~2.6 s a ground slam + geyser that bleeds all
//                            it hits. (claude/bkfeel 10-21: the tiers were 0.3-1.9 s and T4/T5 NEEDED debt - Daniel saw "one or two"; now all five are reached by
//                            the hold alone and the debt EMPOWERS T4/T5 - spent into the blow, half of it drunk back when it lands.) T1-3 reclaim instead.
//                            Every heavy BLEEDS what it lands on. While the blade is held the debt does not drain (the blade holds the blood).
//   BLOOD SPIKE (crouch)     the crouch is still the low block (the greatsword planted point-down). A LOW blow blocked ON THE BEAT (the kneel
//                            begun within spike.beat s of it landing) erupts crimson spikes round the blade: damage + stagger the attacker, a wind
//                            refund, ALL the debt reclaimed. His LOW parry, beside the ward-release HIGH parry. No corpse harvesting.
// main.js binds it (the hooks marked claude/bloodknight); tools/blood-kit.mjs checks the rules here and in the page.
export const BLOOD = {
  /* share: the part of a blow taken that becomes debt; cap: of max hp; drainT: s from a new debt to empty; hold: s before it starts to drain;
     reclaim: x the damage of his landed blow that comes back (min reclaimMin hp, never past the segment) */
  /* (claude/bkblood, Daniel 10-23 "better utilize the blood theme ... like Bloodborne, where you're hit you can restore health by attacking": a LOUD, LONGER RALLY - was
     share 0.5, cap 0.25, drainT 3, hold 0.45, reclaim 0.45, reclaimMin 1; now ~5 s to win it back, more of the blow recoverable, a quick cut wins a real piece back) */
  debt: { share: 0.6, cap: 0.3, drainT: 5, hold: 0.8, reclaim: 0.5, reclaimMin: 2 },   /* (claude/bkblood rates: share 0.65 / cap 0.35 / reclaim 0.6 put him at unburied 12/12, waymeet 11/12 - trimmed, the feedback kept) */
  /* (claude/bkblood) BLEEDING FOES FEED THE RALLY: a blow of his on a bleeding foe reclaims x hitMul; each bleed tick of a foe wins `tick` hp of his debt back (a little) */
  bleed: { hitMul: 1.25, tick: 1 },
  /* (claude/bkblood) THE BLOOD LASH - the third cut of THE RED RHYTHM (the drag): the blood on the blade whips out past the steel for `reach` px more, at chest height
     (top..bot px over his feet), from `from` of the art clock to the rhythm's end; what the whip (not the steel) lands bleeds `bleed` s */
  lash: { reach: 24, top: 22, bot: 6, from: 0.15, bleed: 2 },
  /* (claude/bkblood) VITAE - his meter (it was BLOOD SURGE's harvest bar, filled by kills and blocks): it fills ONLY from the health he reclaims - aggression after being
     hit. `per` of his max health reclaimed fills it. FULL + HOLD F = CRIMSON FRENZY (it is his ULT 1 for the three-ultimates system, brief-herometers-1015 !! 10-23) */
  vitae: { per: 0.6 },   /* (~1-2 frenzies a boss fight with the bot) */
  /* (claude/bkblood) CRIMSON FRENZY: t s; every landed blow reclaims x reclaim of itself (all of it), past the debt a small lifesteal (steal x the blow, at most stealCap of
     max health a frenzy); swing x the rhythm's clock; the debt holds (no drain) while it lasts. B15 never-invuln: no invulnerability, no damage resist */
  frenzy: { t: 5, reclaim: 1, steal: 0.12, stealCap: 0.1, swing: 1.2 },
  /* (claude/bkblood) THE RALLY, FELT: a heartbeat + a red pulse at the screen's edges while he owes - from heartMin of max health, faster and redder with the debt
     (bpm lo..hi at the cap); edge = the pulse's top alpha. The edge is off with REDUCE MOTION or flashes off */
  feel: { heartMin: 0.03, bpmLo: 70, bpmHi: 140, edge: 0.45 },
  /* BLOOD PRICE: pct of max health, on the bar as debt; buffT s of BLOOD-EDGED blades at mul; cd s between prices */
  price: { pct: 0.10, buffT: 6, mul: 1.2, cd: 1.2 },
  /* THE TIERS: at = held s (from the press, as the knight's CUT_AT) for T1..T5; auto = held this long, the best tier he may have comes down by itself;
     mul = the blow's multiplier per tier; need = debt (fraction of max hp) a tier needs; spendMul: a T4/T5 adds spent/maxHp x this to its multiplier;
     bleed = seconds of bleed per tier (bleedN 1, 2 from T4) */
  /* (claude/bkfeel, Daniel 10-21 "a much longer charge ... think about how the Knight works ... five tiers"): the five spread over a 2.6 s hold (the knight's three run 0.3/0.7/1.1);
     ALL FIVE are reached by holding alone (need is 0 everywhere now). BLOOD DEBT EMPOWERS T4/T5 instead of gating them: what he owes is spent into the blow (spendMul)
     and part of it comes back into him when that blow lands (empower.heal) - the debt is power AND a heal, never a lock. mul rises so each wait pays. */
  tiers: { at: [0.35, 0.8, 1.3, 1.9, 2.6], auto: 3.3, mul: [0, 1.5, 1.9, 2.3, 2.8, 3.4], need: [0, 0, 0, 0, 0, 0], spendMul: 3, bleed: [0, 2, 2.5, 2.5, 3, 4],
    names: ['', 'REND', 'SUNDER', 'CRIMSON CRESCENT', 'EXSANGUINATE', 'BLOOD MOON'],
    cols: [null, '#ff9aa6', '#ff6b6b', '#ff4a5a', '#d0182c', '#8a0a1a'] },
  /* T3's travelling wave: px/s, life s, multiplier of the sword's blow; T4's lunge px/s while the art runs to lungeTo; T5's geyser reach px */
  wave: { sp: 270, life: 0.4, mul: 1.1 },
  lunge: { v: 210, from: 0.1, to: 0.22 },   /* the drive runs with the live box (from..to of the art clock) and stops the moment the point goes in */
  moon: { reach: 58, mul: 0.9 },
  /* (claude/bkfeel) DEBT EMPOWERS T4/T5: min = the debt (of max hp) that makes the blow BLOOD-FED (said, and the deeper glow); heal = of the spent debt that comes back into him when the
     empowered blow LANDS (never above where he was before the hits, as every reclaim) */
  empower: { min: 0.03, heal: 0.5 },
  /* (claude/bkfeel) THE WARD-RELEASE PARRY'S WEIGHT (Daniel 10-21 "make his PARRY feel more impactful - the Warden's feels good"): stop = the freeze (s; the Warden's deflect 0.07, the
     knight's perfect guard 0.09), slow = the crimson held breath after it (s of the world at slowT's 0.3 speed), flash = the crimson wash (s), push = px the foe stumbles back (it stays in the
     greatsword's reach: the old 240 px/s shove was zeroed by the shared parry reel the next frame), stagger = s it reels, window = s his riposte waits (the shared 0.6 is short for a greatsword;
     the riposte is a HEAVY third cut, as the knight's), st = wind back, tap = a C flicked too short to stand the ward up also opens the beat (the same 0.22 s window) */
  parry: { stop: 0.2, slow: 0.16, flash: 0.24, push: 18, stagger: 1.0, window: 0.9, st: 14, tap: true },
  /* BLOOD SPIKE: beat s; the spikes hit mul x the sword's blow, stagger s, knock px/s (not a big one), st wind refund (held to commit.js refundCap) */
  spike: { beat: 0.22, mul: 1.2, stagger: 0.8, knock: 200, st: 12,
    /* (claude/bkkit2, Daniel 10-21 "make the crouch's BLOOD SPIKE matter"): ANY blow from a foe that lands inside the beat is spiked - high, middling or low, from either side (a red
       one still is not: it goes through the kneel at half, as before); outside the beat only a LOW blow is turned (the plain low guard). It has the parry's weight: stop s of freeze,
       slow s of the crimson held breath, flash s of the crimson wash, its own SFX.bkSpike; reach px: the spikes strike the one who threw it only if it stands this near (an arrow's
       archer is not stabbed across the room - the blow is still turned and the debt still comes back); pose s the BLOOD SPIKE pose is held (3 beats) */
    any: true, stop: 0.16, slow: 0.12, flash: 0.2, reach: 56, pose: 0.42 },
  /* (claude/bkkit2, Daniel 10-21 "some of the abilities like summon skeleton need to be blood themed. He's not a death knight anymore. Abilities like BLOODWORM or DRAIN or
     BLOOD BOLT would be more fitting") THE RED HOST - HIS BLOOD MAGIC. No summoning is left in the hero's kit (the boss's blood thralls in the Unburied Field stay HIS).
     ONE RULE: the Red Host's spells are PAID IN BLOOD - price x his max health goes ON THE BAR AS DEBT (never his last point; shown, not taken, in a trial), the way BLOOD PRICE
     is, and what they land WINS IT BACK. Save ids are kept (old skill -> new spell):
       summonSkeleton (SUMMON THRALL)  -> BLOODWORMS   worms burst out of the ground, seek a foe, latch on and bite; every bite bleeds it and wins his debt back
       gravecall      (THE RED CALL)   -> BLOOD BOLT   a crimson bolt straight ahead; it bleeds what it hits and its price comes back when it lands
       unholyGround   (RED GROUND)     -> RED GROUND   a pool of his blood on the floor: foes in it are slowed (not a boss), bled and marked; he holds his debt standing in it,
                                                        and every bite of it wins a little back
       bidden         (BIDDEN, passive) -> DRAIN       a held tether to the nearest foe ahead: blood is pulled out of it into him - into his debt first, the rest a part of it as health
     n: worms sent; brood: with THE BROOD (press); life s a worm waits for a foe; sp px/s it crawls; bites: a worm's bites (+ THICK BLOOD a point); biteT s between; mul x the sword's
     blow a bite (min 2); spent s off the wait (SPENT BLOOD) when a worm is done; burst: BURST VESSEL's reach px and x the sword; cd/quick: the wait, and with QUICKENED BLOOD.
     bolt: sp px/s, life s, mul x the sword. pool: r px, life s, tick s, dmg a tick, slow (the foe's clock in it), bleed s. drain: range px to take hold (it lets go at x1.4), t s held,
     tick s, mul x the sword a tick (min 1), over: the part of a tick past his debt that heals him, st wind */
  /* (claude/bloodstep, Daniel 10-22 "make it a BLOOD STEP") PERFECT STEP: a blow that would have landed inside the step's untouchable window bleeds off a little of his debt (debt: of max
     hp, won back as every reclaim) and edges the blade for edge s (BLOOD PRICE's cut, paid by nobody); at most one a cd s so a held step cannot farm it */
  step: { debt: 0.05, edge: 1.2, cd: 1 },
  host: {
    worms: { price: 0.06, n: 2, brood: 3, life: 5, sp: 150, bites: 3, biteT: 0.45, mul: 0.25, bleed: 1.2, spent: 3, burst: { r: 34, mul: 0.5 }, cd: 12, quick: 8 },
    bolt: { price: 0.04, sp: 340, life: 0.65, mul: 0.75, bleed: 2, cd: 3 },   /* (first pass 0.9 x, 2.2 s: the built reaper went 6/6 at the Stockade and the Goblin Queen with ~20 bolts a fight - knight 4/6, 5/6) */
    pool: { price: 0.05, r: 52, life: 6, tick: 0.4, dmg: 3, slow: 0.5, bleed: 1.2, cd: 11 },
    drain: { range: 100, t: 1.2, tick: 0.2, mul: 0.22, over: 0.4, st: 18, cd: 9 },
  },
};
/* (claude/bkkit2) a Red Host spell's price: pct of max health, on the bar as debt (BLOOD PRICE's rule; free = shown, not taken). Returns what was paid. */
export function payBlood(p, pct, free = false) {
  const c = Math.max(1, Math.round(p.maxHp * pct));
  if (free) { debtAdd(p, c); p.bdLast = p.hp; return c; }
  const hp0 = p.hp; p.hp = hp0 <= 1 ? hp0 : Math.max(1, hp0 - c); const paid = hp0 - p.hp;
  p.bdLast = p.hp; if (paid > 0) { p.bd = (p.bd || 0) + paid; debtClamp(p); p.bdHold = BLOOD.debt.hold; p.bdRate = p.bd / Math.max(0.1, BLOOD.debt.drainT - BLOOD.debt.hold); }
  return paid;
}
/* (claude/bkkit2) DRAIN's tick of `n` blood: into the debt first (all of it), the rest heals `over` of itself. Returns the health given. */
export function drainGive(p, n) { if (!(n > 0) || !(p.hp > 0)) return 0; const r = debtReclaim(p, n), rest = Math.max(0, n - r), h = Math.min(Math.max(0, p.maxHp - p.hp), rest * BLOOD.host.drain.over);
  if (h > 0) { p.hp += h; p.bdLast = p.hp; } return r + h; }

/* which tier a hold of `held` s reaches, with `debt` hp of debt on a max health of `maxHp` (a tier that needs more debt than he has is not reached) */
export function tierFor(held, debt, maxHp, quick = 1) {
  const T = BLOOD.tiers; let st = 0;
  for (let i = 0; i < 5; i++) { if (held < T.at[i] * quick) break; const need = T.need[i + 1] * maxHp; if (need > 0 && (debt || 0) + 1e-6 < need) break; st = i + 1; }
  return st;
}
/* the tier the hold has reached on time alone (claude/bkfeel: the same as tierFor now - no tier needs debt; kept for the tools) */
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
export function debtReclaim(p, n) { if (!(p.bd > 0) || !(n > 0) || !(p.hp > 0)) return 0; const r = Math.min(p.bd, n, Math.max(0, p.maxHp - p.hp)); p.hp += r; p.bd -= r; p.bdLast = p.hp;
  if (r > 0) p.bkVitIn = (p.bkVitIn || 0) + r;   /* (claude/bkblood) every reclaimed point is VITAE (main.js vitaeStep drinks it into the bar) */
  return r; }
/* (claude/bkblood) what a landed blow of `dmg` wins back: x debt.reclaim, x bleed.hitMul on a bleeding foe, all of it in a CRIMSON FRENZY */
export const reclaimOf = (dmg, o = {}) => Math.max(BLOOD.debt.reclaimMin, dmg * (o.frenzy ? BLOOD.frenzy.reclaim : BLOOD.debt.reclaim) * (o.bleeding ? BLOOD.bleed.hitMul : 1));
/* (claude/bkblood) VITAE: the meter points (0-100) `hp` reclaimed health is worth on a max health of maxHp */
export const vitaeOf = (hp, maxHp) => Math.max(0, hp) * 100 / Math.max(1, BLOOD.vitae.per * maxHp);
/* (claude/bkblood) CRIMSON FRENZY's lifesteal past the debt: steal x the blow, never past stealCap x maxHp a frenzy (p.bkStole counts it), never above max health. Returns the heal. */
export function frenzySteal(p, dmg) { const F = BLOOD.frenzy, room = Math.max(0, F.stealCap * p.maxHp - (p.bkStole || 0)), h = Math.min(room, Math.max(0, dmg) * F.steal, Math.max(0, p.maxHp - p.hp));
  if (!(h > 0) || !(p.hp > 0)) return 0; p.hp += h; p.bdLast = p.hp; p.bkStole = (p.bkStole || 0) + h; return h; }
/* (claude/bkblood) THE HEARTBEAT: beats a second for a debt of `bd` on maxHp (0 = no heartbeat), and the edge pulse's strength 0..1 */
export function heartOf(bd, maxHp) { const F = BLOOD.feel, k = (bd || 0) / Math.max(1, maxHp); if (k < F.heartMin) return { bps: 0, k: 0 };
  const t = Math.min(1, (k - F.heartMin) / Math.max(0.01, BLOOD.debt.cap - F.heartMin)); return { bps: (F.bpmLo + (F.bpmHi - F.bpmLo) * t) / 60, k: 0.35 + 0.65 * t }; }
/* (claude/bkblood) WHAT COMES OFF A STRUCK FOE: 'blood' from flesh, 'sparks' from stone, metal, glass, shell, wood and the made things (no blood from a construct), 'dust' from bone/chitin/fungus/spirit */
const BLOODLESS = new Set(['construct', 'turret', 'hourglass', 'hourglassking', 'colossus', 'golem', 'rockgoblin', 'gargoyle', 'tome', 'piece', 'broom', 'armour', 'dummy', 'bale', 'statue', 'shardling', 'suncatcher', 'greatdrill', 'minecart', 'gatekeeper', 'homunculus']);
export function sprayKind(t, mat) { if (BLOODLESS.has(t) || ['stone', 'metal', 'crystal', 'shell', 'wood', 'clockwork', 'glass'].includes(mat)) return 'sparks';
  if (['bone', 'chitin', 'fungus', 'spirit'].includes(mat)) return 'dust'; return 'blood'; }
/* (claude/bkblood) THE BLOOD LASH's box: past the drag's steel (rhythmBox step 2) the whip reaches lash.reach more at chest height, from lash.from of the art clock */
export function lashBox(x, y, face, atk, steelR) { const L = BLOOD.lash; if (atk < L.from || atk >= 0.24) return null; const r0 = steelR - 2, r1 = steelR + L.reach;
  return face > 0 ? { l: x + r0, r: x + r1, t: y - L.top, b: y - L.bot } : { l: x - r1, r: x - r0, t: y - L.top, b: y - L.bot }; }
/* ALL of it back (the parries) */
export const debtReclaimAll = p => debtReclaim(p, p.bd || 0);
/* T4/T5 spend it: the segment is gone, the blow is that much harder. Returns what was spent. */
export function debtSpend(p) { const s = p.bd || 0; p.bd = 0; p.bdHold = 0; return s; }
export function debtClear(p) { p.bd = 0; p.bdHold = 0; p.bdRate = 0; p.bdLast = p.hp; }
/* BLOOD PRICE on p: what it costs (never his last point), put on the bar as debt. Returns what was paid. */
export const payPrice = (p, free = false) => payBlood(p, BLOOD.price.pct, free);
/* a T4/T5's multiplier for what was spent */
export const spendMul = (spent, maxHp) => 1 + BLOOD.tiers.spendMul * Math.max(0, spent) / Math.max(1, maxHp);

/* THE HEAVIES' BOXES (x, y the hero's feet, face +-1, atk P.atk; the art clock and live window are the old crescent's, DK2.price) */
export function heavyBox(x, y, face, atk, tier, longHaft, live) {
  if (atk < live[0] || atk >= live[1]) return null;
  const lh = 14 * (longHaft || 0);
  const r = ([0, 36, 34, 40, 48, 30][tier] || 36) + lh, top = [0, 30, 44, 40, 26, 30][tier] || 36, back = tier === 5 ? 30 : tier === 3 ? 6 : 2;   /* REND wide and low, SUNDER tall (overhead), the CRESCENT round the front, EXSANGUINATE long and level, the MOON both sides */
  return face > 0 ? { l: x - back, r: x + r, t: y - top, b: y + 4 } : { l: x - r, r: x + back, t: y - top, b: y + 4 };
}
