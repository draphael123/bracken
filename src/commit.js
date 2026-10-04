/* src/commit.js - WEIGHT (Daniel 2026-10-02): COMMITMENT + STAMINA, the one Salt & Sanctuary pillar (scratch brief-weight, audit-weight).
   Flasks, parry and foe stagger are NOT this module's business.

   1. COMMIT. Once a swing is let go it is SEEN THROUGH: after the swing's art ends a RECOVERY runs (P.atkRec, the retired Weighty mode's
      separate timer, revived - no hit box and no swing frame is changed, the draw holds the swing's last pose). Heavier heroes and heavier
      verbs recover longer (COMMIT). Nothing - roll, jump, the next cut, a skill, the C button - comes out before the LAST WINDOW seconds of
      that recovery (the CANCEL WINDOW), and a press made earlier is HELD and comes out on the window's first frame: never dropped
      (holdPresses). One predicate, committed(P), is what every gate in main.js asks.
   2. STAMINA. No regen while committed, rolling or holding a guard; a longer delay and a slower refill; LAST WIND (an action at any
      stamina above 0 overdraws to 0); EXHAUSTED at 0 (no regen for a beat, a slow refill to 30%, no roll and no guard until then);
      a knight's block costs what the blow weighed; per-hero roll costs and partial roll i-frames.
   3. THE SEAM (shared with the LEVELING lane): staminaOf(P) is the ONE place max / regen / roll-cost growth is read. main.js binds the
      level hooks (bindStamina) - this module never hard-codes the level numbers, and LEVELING's ENDURANCE feeds P.maxSt. */

export const WINDOW = 0.06;   /* s: the last four frames of a recovery are the cancel window, for everything */

/* RECOVERY ADDED AFTER THE SWING'S ART ENDS (s), per hero x verb. Light totals press-to-free: freebooter 0.33, knight/warden/pyro 0.46,
   geomancer 0.48, paladin 0.72, death knight 1.05 (they were 0.23 / 0.32 / 0.32 / 0.55 / 0.88). `up` is the up-slash and the low sweep. */
export const COMMIT = {
  pirate:    { light: 0.10, third: 0.14, up: 0.10, heavy: 0 },      /* his held blow is the pistol: PISTOL_BLAST, not a swing */
  knight:    { light: 0.14, third: 0.20, up: 0.14, heavy: 0.25 },   /* the heavy cut */
  warden:    { light: 0.14, third: 0.20, up: 0.14, heavy: 0.22 },   /* the run-through */
  pyro:      { light: 0.14, third: 0.20, up: 0.14, heavy: 0.25 },   /* the bellows */
  geomancer: { light: 0.16, third: 0.22, up: 0.16, heavy: 0.28 },   /* the fault line */
  paladin:   { light: 0.17, third: 0.22, up: 0.17, heavy: 0.30 },
  reaper:    { light: 0.17, third: 0.22, up: 0.17, heavy: 0.30 },
};
export const PISTOL_BLAST = 0.45;   /* the freebooter's shot: blastT 0.34 -> 0.45, and it is a commit like a swing */
export const PLUNGE_WHIFF = 0.10;   /* a plunge that met nothing lands this much heavier (a CAUGHT plunge - the pogo - is untouched) */

/* THE SWING'S ART: P.atk runs 0 -> lim at this rate (main.js advances it with artRate, so the two can never disagree) */
export const artLim = heavy => heavy ? 0.42 : 0.3;
export const artRate = (h, heavy) => (h === 'paladin' ? 0.56 : h === 'pirate' ? 1.35 : h === 'reaper' ? (heavy ? 0.24 : 0.34) : 1) * (heavy && h !== 'reaper' ? 0.72 : 1);

/* how long the recovery after a swing's art is. An AIR swing adds none (the plunge may follow it once its active frames are out); the
   dash cut keeps its own rooted dashRec; a crouched blow (crouch-a) is a light one */
export function recoveryFor(h, { heavy = false, third = false, kind = null, air = false, dashCut = false } = {}) {
  if (air || dashCut || kind === 'airUp') return 0;
  const c = COMMIT[h] || COMMIT.knight;
  if (heavy) return c.heavy;
  if (kind === 'rise' || kind === 'sweep') return c.up;
  return third ? c.third : c.light;
}
/* the whole commit of the swing he is in, press to free (the greed exemption reads it: a blow he cannot roll out of in GREED.tell) */
export const swingTotal = (h, P) => artLim(!!P.heavy) / artRate(h, !!P.heavy) + recoveryFor(h, { heavy: !!P.heavy, third: !!P.heavySwing, kind: P.swingKind, air: !P.ground && !P.swim, dashCut: !!P.dashCut });

/* THE ONE PREDICATE. Committed: the swing is out, or its recovery has more than the window left. */
export const committed = P => P.atk >= 0 || (P.atkRec || 0) > WINDOW + 1e-6;
export const canBreak = P => !committed(P);
/* the same question asked one frame ahead (the press pass runs before the frame that ages the recovery) */
export const committedNext = (P, dt) => P.atk >= 0 || (P.atkRec || 0) - dt > WINDOW + 1e-6;
export const inRecovery = P => !(P.atk >= 0) && (P.atkRec || 0) > WINDOW + 1e-6;

/* THE HELD BUFFER. While committed, a press of roll / jump / attack / a skill is KEPT (its buffer is held up, not aged) and only the
   LATEST press survives to the window - so a roll pressed at swing frame 2 comes out on the window's first frame, and an attack pressed
   before it does not also fire. `hold` is each buffer's full value; P.holdK remembers which press came last. Call once a frame, before
   the gates read the buffers. */
const BUFS = ['dbuf', 'jbuf', 'abuf'];
export function holdPresses(P, hold) {
  if (!committed(P) || !STAM.hold) { P.holdK = null; P.holdPrev = null; return; }
  const prev = P.holdPrev || {};
  for (const k of BUFS) if ((P[k] || 0) > (prev[k] || 0) + 1e-9) P.holdK = k;   /* a fresh press: its buffer jumped up */
  if (P.sbufFresh) { P.holdK = 'sbuf'; P.sbufFresh = false; }
  for (const k of BUFS) if (P[k] > 0) { if (P.holdK && k !== P.holdK) P[k] = 0; else P[k] = Math.max(P[k], hold[k] || 0.12); }
  if (P.sbuf && P.holdK && P.holdK !== 'sbuf') P.sbuf = null;
  P.holdPrev = { dbuf: P.dbuf || 0, jbuf: P.jbuf || 0, abuf: P.abuf || 0 };
}

/* ==== STAMINA ==== */
export const STAM = {
  regen: 55,          /* /s (was 75): a full bar in ~1.8 s */
  delay: 0.5,         /* s of no regen after a spend (was 0.2) - and it is counted from the END of a commit, a roll or a guard */
  exhausted: 1.0,     /* s of no regen when the bar hits 0 */
  windedMul: 0.6,     /* the regen until the bar is back to WINDED_TO */
  windedTo: 0.3,      /* of the max: until here, no roll and no guard */
  refundCap: 12,      /* the most any one stamina refund gives (EVASION, FREE HAND, MERCY, PERFECT GUARD, PARRY, STOKE, RANSOM ...) */
  breakStagger: 0.9, breakTired: 1.2,
  pauseRecovery: true,
  rollInv: 0.20,                       /* s of grace at the start of a roll (the TAIL is hittable) */
  blockBase: 8, blockPerDmg: 0.6, blockCap: 35,   /* the shield's price: base + perDmg x the blow, capped */
  busyRegen: 0,        /* the share of the regen that still runs while committed, rolling or guarding (0: none, as briefed) */
  hold: true,          /* a press made in a commit is HELD for the window (false: it ages out as it always did) */
  jumpLock: true,      /* no jump out of a commit (Daniel 10-02, Q5) */
  plungeWhiff: 0.10,   /* a plunge that met nothing lands this much heavier */
  stepFree: true, stepDelay: 0.2,   /* THE WARDEN'S STEP (coordinator 10-04: she collapsed under WEIGHT): her short back-step is spacing - it keeps the regen running and only a 0.2 s delay */   /* no regen through a swing's recovery either (false: only through the swing itself) - a tuning knob, see the lane report */   /* a guard broken: staggered, then the guard stays down */
};
/* THE ROLL: what it costs and how long it is untouchable. Heavy heroes roll heavier (Daniel 10-02, Q4) */
export const ROLL_COST = { knight: 24, warden: 24, pyro: 24, geomancer: 24, pirate: 22, paladin: 28, reaper: 28 };
export const STEP_BACK_COST = 15;   /* the warden's back-step (it was 13) */
export const ROLL_LEN = { knight: 0.30, warden: 0.18, pyro: 0.34, geomancer: 0.30, pirate: 0.30, paladin: 0.30, reaper: 0.32 };
export const ROLL_INV = 0.20;       /* the first 0.20 s; the TAIL is hittable (the warden's step keeps her own STEP_INV) */
export const ROLL_SHAVE_CAP = 4;    /* the most the shaves (level ranks, LIGHT STEP) take off a roll's base cost */
/* AN INVULNERABLE DASH (Lunge, Cinder Step, Holy Charge, Boarding Party, Harrier) follows the roll's rules: its grace is the roll's share of
   it, never more than the roll's, and it costs at least the hero's roll + 4 */
export const dashInv = len => Math.min(STAM.rollInv, len * STAM.rollInv / 0.30);
export const dashCost = (h, base) => Math.max(base, (ROLL_COST[h] || 24) + 4);

let BIND = { lvGrow: () => 0, lungs: () => false, fleet: () => false };
export const bindStamina = o => { BIND = { ...BIND, ...o }; };
/* THE SEAM: everything the level / card / perks grow about stamina, read in one place */
export function staminaOf(P) {
  return { max: P.maxSt, regenMul: (1 + 0.07 * BIND.lvGrow()) * (BIND.lungs() ? 1.2 : 1), rollCostMul: BIND.fleet() ? 0.75 : 1 };
}
export function rollCost(P, h, { back = false, shave = 0 } = {}) {
  const base = back ? STEP_BACK_COST : (ROLL_COST[h] || 24);
  return Math.max(6, Math.round((base - Math.min(ROLL_SHAVE_CAP, shave)) * staminaOf(P).rollCostMul));
}

export const winded = P => !!P.winded;
/* a fresh start (a reset, a respawn, a new level): no recovery, no held press, not winded */
export function clearCommit(P) { P.atkRec = 0; P.winded = false; P.exhaustT = 0; P.windedNew = false; P.sbuf = null; P.sbufFresh = false; P.holdK = null; P.holdPrev = null; }
export function exhaust(P) { P.st = 0; P.winded = true; P.exhaustT = STAM.exhausted; P.windedNew = true; }
/* SPEND, WITH LAST WIND: enough - pay it; not enough but something left and not winded - pay it all and be exhausted; else refused */
export function trySpend(P, cost) {
  if (P.st >= cost) { P.st -= cost; P.stDelay = Math.max(P.stDelay || 0, STAM.delay); if (P.st <= 1e-6 && cost > 0) exhaust(P); return true; }
  if (P.st > 0 && !P.winded) { exhaust(P); P.stDelay = Math.max(P.stDelay || 0, STAM.delay); return true; }
  P.stFlash = 0.35; return false;
}
/* A REFUND (never while the exhausted beat runs, never more than refundCap) */
export function refund(P, n) { if ((P.exhaustT || 0) > 0 || !(n > 0)) return 0; const g = Math.min(n, STAM.refundCap); P.st = Math.min(P.maxSt, P.st + g); return g; }
/* the knight's shield: what a blocked blow costs (the perfect guard stays free) */
export const blockCost = (dmg, steady = 0) => Math.round(Math.min(STAM.blockCap, STAM.blockBase + STAM.blockPerDmg * Math.max(0, dmg || 0)) * (1 - 0.15 * steady));
/* may a guard (shield, aegis, ward, rune-ward) be RAISED? */
export const guardOk = P => !P.winded;
/* regen is paused while he is committed (the whole recovery, window and all), rolling or holding a guard */
export const regenPaused = P => P.atk >= 0 || (STAM.pauseRecovery && (P.atkRec || 0) > 0) || (P.dodge > 0 && !(STAM.stepFree && (P.dodgeMax || 0) <= 0.2)) || !!P.block || !!P.aegis || !!P.warding || !!P.geoGuard;

/* ONE FRAME OF THE BAR (every player-update path calls this instead of its own regen line). `extra` multiplies the regen
   (the venom's slow); `hold` is true where regen must wait anyway (a live plunge chain). */
export function staminaTick(P, dt, { extra = 1, hold = false } = {}) {
  if (P.st <= 1e-6 && !P.winded) exhaust(P);
  P.regenOff = false;
  if ((P.exhaustT || 0) > 0) { P.exhaustT = Math.max(0, P.exhaustT - dt); P.regenOff = true; return; }
  const paused = regenPaused(P);
  if (paused && !(STAM.busyRegen > 0)) { P.stDelay = Math.max(P.stDelay || 0, STAM.delay); P.regenOff = true; return; }
  if (P.stDelay > 0 || hold) { P.regenOff = true; return; }
  if (P.st < P.maxSt) P.st = Math.min(P.maxSt, P.st + STAM.regen * staminaOf(P).regenMul * (P.winded ? STAM.windedMul : 1) * (paused ? STAM.busyRegen : 1) * extra * dt);
  if (P.winded && P.st >= STAM.windedTo * P.maxSt) P.winded = false;
}
