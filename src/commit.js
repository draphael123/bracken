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

/* RECOVERY ADDED AFTER THE SWING'S ART ENDS (s), per hero x verb. Light totals press-to-free (WEIGHT-T): freebooter 0.29, knight/warden/pyro 0.40,
   geomancer 0.42, paladin 0.65, death knight 0.98 (the brief's: 0.33 / 0.46 / 0.48 / 0.72 / 1.05; they were 0.23 / 0.32 / 0.32 / 0.55 / 0.88). `up` is the up-slash and the low sweep. */
export const COMMIT = {   /* WEIGHT-T (10-04): the brief's numbers x0.6, measured against the human-speed bot (see the lane report) */
  pirate:    { light: 0.06, third: 0.084, up: 0.06, heavy: 0 },      /* his held blow is the pistol: PISTOL_BLAST, not a swing */
  knight:    { light: 0.084, third: 0.12, up: 0.084, heavy: 0.15 },   /* the heavy cut */
  warden:    { light: 0.084, third: 0.12, up: 0.084, heavy: 0.132 },  /* the run-through */
  pyro:      { light: 0.084, third: 0.12, up: 0.084, heavy: 0.15 },   /* the bellows */
  geomancer: { light: 0.096, third: 0.132, up: 0.096, heavy: 0.168 }, /* the fault line */
  paladin:   { light: 0.102, third: 0.132, up: 0.102, heavy: 0.18 },
  reaper:    { light: 0.102, third: 0.132, up: 0.102, heavy: 0.18 },
};
/* THE LIGHT SWING'S PRICE for the heroes whose swing is not their sword's (the rest pay sword().cost): the freebooter 9 -> 10 (brief) */
export const SWING_COST = { paladin: 22, pirate: 10, reaper: 23 };   /* the paladin 28 -> 22 (10-04, with STAM.busyRegenBy: 0/8 -> 4/8 of eight boss fights on the human bot; 6/8 before WEIGHT) */
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
/* THE DEATH KNIGHT'S WARD CUTS THE END OF A SWING (claude/dkhero, Daniel 10-06): the ward may be raised out of the last DK_WARD_CUT seconds of his swing
   (the art's tail and the recovery behind it: his recovery alone is only 0.1 s), so a Bloodknight blow is not always a hit. swingLeft = time to free. */
export const DK_WARD_CUT = 0.25;
export const swingLeft = (h, P) => P.atk >= 0 ? Math.max(0, artLim(!!P.heavy) - P.atk) / artRate(h, !!P.heavy) + (recoveryFor(h, { heavy: !!P.heavy, third: !!P.heavySwing, kind: P.swingKind, air: !P.ground && !P.swim, dashCut: !!P.dashCut })) : (P.atkRec || 0);

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
/* THE BAR. WEIGHT-T (coordinator 10-04: under the brief's numbers the human-speed bot fell from 71% to 33% of 24 boss fights with an even
   level-card spread; these are the numbers that bring it to 58% - every knob below is runtime-tunable and the report lists both sets).
   The brief's value is in the comment where it differs. */
export const STAM = {
  regen: 75,          /* /s (brief 55; it was 75) */
  delay: 0.3,         /* s of no regen after a spend (brief 0.5; it was 0.2) */
  exhausted: 0.6,     /* s of no regen when the bar hits 0 (brief 1.0) */
  windedMul: 0.6,     /* the regen until the bar is back to windedTo */
  windedTo: 0.2,      /* of the max: until here, no roll and no guard (brief 0.3) */
  refundCap: 12,      /* the most any one stamina refund gives (EVASION, FREE HAND, MERCY, PERFECT GUARD, PARRY, STOKE, RANSOM ...) */
  breakStagger: 0.9, breakTired: 1.2,   /* a guard broken: staggered, then the guard stays down */
  pauseRecovery: false, /* no regen through the swing itself; true: through its recovery too (brief: true) */
  busyRegen: 0,         /* the share of the regen that still runs while swinging, rolling or guarding (0: none, as briefed) */
  busyRegenBy: { paladin: 0.5 },   /* THE PALADIN (10-04): his 0.55 s maul swing with no regen in it took him from 10/12 to 4/12 with the human bot - half the regen runs through it */
  rollInv: 0.26,        /* s of grace at the start of a roll; the TAIL is hittable (brief 0.20) */
  blockBase: 6, blockPerDmg: 0.4, blockCap: 25,   /* the shield's price: base + perDmg x the blow, capped (brief 8 + 0.6 x, cap 35) */
  hold: true,           /* a press made in a commit is HELD for the window (false: it ages out as it always did) */
  jumpLock: true,       /* no jump out of a commit (Daniel 10-02, Q5) */
  plungeWhiff: 0.10,    /* a plunge that met nothing lands this much heavier */
  stepFree: true, stepDelay: 0.2,   /* THE WARDEN'S BACK-STEP is spacing, not a roll: it keeps the regen running, with a 0.2 s delay */
};
/* THE ROLL: what it costs and how long it is untouchable. Heavy heroes roll heavier (Daniel 10-02, Q4). WEIGHT-T: the brief's x0.9 */
export const ROLL_COST = { knight: 22, warden: 22, pyro: 22, geomancer: 22, pirate: 20, paladin: 25, reaper: 25 };
export const STEP_BACK_COST = 15;   /* the warden's back-step (it was 13) */
export const ROLL_LEN = { knight: 0.30, warden: 0.18, pyro: 0.34, geomancer: 0.30, pirate: 0.30, paladin: 0.30, reaper: 0.32 };
export const ROLL_SHAVE_CAP = 4;    /* the most the shaves (level ranks, LIGHT STEP) take off a roll's base cost */
/* AN INVULNERABLE DASH (Lunge, Cinder Step, Holy Charge, Boarding Party, Harrier) follows the roll's rules: its grace is the roll's share of
   it, never more than the roll's, and it costs at least the hero's roll + 4 */
export const dashInv = len => Math.min(STAM.rollInv, len * STAM.rollInv / 0.30);
export const dashCost = (h, base) => Math.max(base, (ROLL_COST[h] || 24) + 4);

let BIND = { lvGrow: () => 0, lungs: () => false, fleet: () => false, rest: () => false, lean: () => false, wind: () => false };   /* (LEVELING2: rest = STEADY BREATH, lean = ENDURANCE 10, wind = ENDURANCE 20) */
export const bindStamina = o => { BIND = { ...BIND, ...o }; };
/* THE SEAM: everything the level / card / perks grow about stamina, read in one place */
export function staminaOf(P) {
  return { max: P.maxSt, regenMul: (1 + 0.07 * BIND.lvGrow()) * (BIND.lungs() ? 1.2 : 1), rollCostMul: BIND.fleet() ? 0.75 : 1 };
}
/* LEVELING2: the wait before stamina returns (STEADY BREATH shortens it a fifth) and ENDURANCE 10's lean roll (a fifth cheaper below half a bar) */
export const delayOf = () => STAM.delay * (BIND.rest() ? 0.8 : 1);
export const leanMul = P => (BIND.lean() && P.st < P.maxSt / 2) ? 0.8 : 1;
export const SECOND_WIND = { to: 0.4, wait: 45 };   /* ENDURANCE 20: the first time the bar would empty, it comes back to 40%, and again no sooner than 45 s later */
export function rollCost(P, h, { back = false, shave = 0 } = {}) {
  const base = back ? STEP_BACK_COST : (ROLL_COST[h] || 24);
  return Math.max(6, Math.round((base - Math.min(ROLL_SHAVE_CAP, shave)) * staminaOf(P).rollCostMul * leanMul(P)));
}

export const winded = P => !!P.winded;
/* a fresh start (a reset, a respawn, a new level): no recovery, no held press, not winded */
export function clearCommit(P) { P.windUsedT = 0; P.atkRec = 0; P.winded = false; P.exhaustT = 0; P.windedNew = false; P.sbuf = null; P.sbufFresh = false; P.holdK = null; P.holdPrev = null; }
export function exhaust(P) { if (BIND.wind() && !(P.windUsedT > 0)) { P.windUsedT = SECOND_WIND.wait; P.st = SECOND_WIND.to * P.maxSt; P.winded = false; P.exhaustT = 0; P.windSurge = true; return; }   /* SECOND WIND (ENDURANCE 20) */
  P.st = 0; P.winded = true; P.exhaustT = STAM.exhausted; P.windedNew = true; }
/* SPEND, WITH LAST WIND: enough - pay it; not enough but something left and not winded - pay it all and be exhausted; else refused */
export function trySpend(P, cost) {
  if (P.st >= cost) { P.st -= cost; P.stDelay = Math.max(P.stDelay || 0, delayOf()); if (P.st <= 1e-6 && cost > 0) exhaust(P); return true; }
  if (P.st > 0 && !P.winded) { exhaust(P); P.stDelay = Math.max(P.stDelay || 0, delayOf()); return true; }
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
export function staminaTick(P, dt, { extra = 1, hold = false, hero = null } = {}) {
  if (P.st <= 1e-6 && !P.winded) exhaust(P);
  P.regenOff = false;
  if ((P.exhaustT || 0) > 0) { P.exhaustT = Math.max(0, P.exhaustT - dt); P.regenOff = true; return; }
  const paused = regenPaused(P), busy = (hero && STAM.busyRegenBy[hero] !== undefined) ? STAM.busyRegenBy[hero] : STAM.busyRegen;
  if (P.windUsedT > 0) P.windUsedT = Math.max(0, P.windUsedT - dt);
  if (paused && !(busy > 0)) { P.stDelay = Math.max(P.stDelay || 0, delayOf()); P.regenOff = true; return; }
  if (P.stDelay > 0 || hold) { P.regenOff = true; return; }
  if (P.st < P.maxSt) P.st = Math.min(P.maxSt, P.st + STAM.regen * staminaOf(P).regenMul * (P.winded ? STAM.windedMul : 1) * (paused ? busy : 1) * extra * dt);
  if (P.winded && P.st >= STAM.windedTo * P.maxSt) P.winded = false;
}
