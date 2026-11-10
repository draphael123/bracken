// src/dirmoves.js - DIRMOVES CORE (lane DMCORE, plan scratch/lane-reports/dirmoves-plan.md sections 3-5, 7; Daniel 11-09: every REC accepted).
// UP is the anti-air + launcher, DOWN goes under high guards + trips, PLUNGE pogoes / cracks helms / staggers heavies. This module is the NUMBERS and
// the PURE RULES for them; main.js calls the hooks below behind `DM.on` (default FALSE: with the flag off every hook is a no-op and the game plays
// exactly as before). Later lanes (DMFOES, DMCHARGE, DMHEROES, DMBOSS...) read DM, they do not re-declare numbers.
//
// What lane 1 builds: DM.flow (the three flow links), DM.pvp (the duel-pit caps), DM.clash (UP=jump / DOWN=duck input guards, both seats), the
// plunge air refresh. The `foe`, `charge` and `boss` blocks are the SHARED NUMBERS the later lanes fill in / read (declared here so one table owns them).

export const DM = {
  on: false,   /* THE FLAG (plan Q8: off until all 9 heroes + act I-II openings are proven, then one flip) */

  flow: {
    /* LAUNCHER -> AIR HITS */
    launchCancel: 0.20,   /* s from the hit: a rise that LAUNCHED may be jump-cancelled (the JUMP key, not UP) */
    hang: 0.25,           /* s of extra hang per air blow on a launched foe */
    hangMax: 2,           /* hangs per launch; the NEXT air blow knocks it down */
    airMul: 1.3,          /* OFF THE GROUND stays (main.js hurt), listed for the audit */
    /* PLUNGE BOUNCE -> AIR DASH */
    refreshOnHit: true,   /* a pogo off a head/shell, the Warden's vault off a head, the Freebooter's boarding leap: dashedAir=false, airDashN=0 (needs a HIT; bare floor never) */
    refreshAirJump: false,/* the air JUMP is NOT refreshed */
    /* DOWN TRIP -> GROUND HIT */
    tripCancel: 0.15,     /* s: a sweep that TRIPPED has this wide a cancel window into the next ground swing (commit.js WINDOW is 0.06) */
    trippedMul: 1.5,      /* FLOORED x1.5 as today (main.js: later blows on a tripped foe) */
  },

  pvp: {   /* the duel pit: no infinites */
    launchHeight: 0.5,    /* a launch on a hero is half height */
    hang: false,          /* no hang */
    juggle: false,        /* no air juggle (pvp-duel.js DUEL.juggle stays the damage backstop) */
  },

  clash: {   /* section 7 / 5 input guards the core owns (UP = jump, DOWN = duck) */
    heldAtk: 0.14,        /* HEAVY_START: X held this long = a winding charge, the UP-key jump waits (extends UP_SLASH grace) */
  },

  /* shared numbers for the lanes that follow (not read by lane 1 code) */
  foe: { leapSwatFloor: 1.0, leapSwatMul: 1.5, highGuardUp: 1.5, helmCrackLight: 1.0, beastStagger: 0.6, beastPoiseLean: 1.5 },
  charge: { step: 0.45, scale: { pirate: 0.85, ranger: 0.85, knight: 1, warden: 1, pyro: 1, geomancer: 1, berserker: 1, paladin: 1.2, reaper: 1.2 }, launcherMul: 2.0, slamMul: 1.6, launchT: 1.6, slamHalfW: 40, tripBeast: 0.7, guardBreak: 1.4 },
};

/* the one gate every hook asks */
export const dmOn = () => DM.on === true;

/* ==== FLOW 1: LAUNCHER -> AIR HITS ==== */
/* a rise that LAUNCHED (hero P, foe e, game time `now`): stamp the cancel window and reset the foe's hang count */
export function onLaunch(P, e, now) { if (!dmOn()) return; P.dmLaunchAt = now; P.dmLaunchFoe = e || null; if (e) e.dmHang = 0; }
/* may a jump (the JUMP key, never an UP-key jump) cancel the rise's swing right now? */
export function jumpCancelOpen(P, now, jbufUp = false) {
  return dmOn() && !jbufUp && P.swingKind === 'rise' && (P.atk >= 0 || (P.atkRec || 0) > 0) && P.dmLaunchAt != null && now - P.dmLaunchAt >= 0 && now - P.dmLaunchAt <= DM.flow.launchCancel;
}
/* an AIR blow lands on a launched foe (e.launchedT > now). Returns { launchedT, down }: 'hang' extends launchedT, the third knocks it down. */
export function airBlow(e, now, { pvp = false } = {}) {
  if (!dmOn() || !(e.launchedT > now)) return null;
  if (pvp && !DM.pvp.hang) return null;   /* a hero is never hung */
  const n = e.dmHang || 0;
  if (n >= DM.flow.hangMax) return { launchedT: now, down: true };
  e.dmHang = n + 1; return { launchedT: e.launchedT + DM.flow.hang, down: false };
}
/* a launch's vertical speed on a target: heroes (the duel proxy) get the cap */
export const launchVy = (vy, targetIsHero) => dmOn() && targetIsHero ? vy * DM.pvp.launchHeight : vy;
export const isHeroTarget = e => !!(e && (e.t === 'duelist' || e.pvpSeat));

/* ==== FLOW 2: PLUNGE BOUNCE -> AIR DASH ==== */
/* P just rebounded off something it HIT (hit=true). Refreshes the air dash only; the air jump is left alone. Returns true when it refreshed. */
export function refreshAirDash(P, hit = true) {
  if (!dmOn() || !hit || !DM.flow.refreshOnHit) return false;
  P.dashedAir = false; P.airDashN = 0; P.airRolled = false;
  if (DM.flow.refreshAirJump) P.airJump = 1;
  return true;
}

/* ==== FLOW 3: DOWN TRIP -> GROUND HIT ==== */
/* a sweep TRIPPED a foe: the recovery cancels into the next ground swing for tripCancel s (commit.js reads P.dmWin) */
export function onTrip(P, now) { if (!dmOn()) return; P.dmWin = DM.flow.tripCancel; P.dmWinUntil = now + 1; }
/* P.dmWin is dropped once the swing after it starts, or a second passes (called once a frame); commit.js: windowOf(P) */
export function tickWindow(P, now) { if (P.dmWin && (P.atk >= 0 && P.swingKind !== 'sweep' || now > (P.dmWinUntil || 0))) { P.dmWin = 0; P.dmWinUntil = 0; } }

/* ==== CLASHES (section 7 / 5): the INPUT guards ====
   s = { atkHeld (s X has been held), charge, upKeyJump (this jump press came from an UP key), ground } */
/* while X is held past HEAVY_START an UP-key jump is suppressed (the Z/space jump still jumps and cancels the charge) */
export const upJumpSuppressed = s => dmOn() && !!s.upKeyJump && !!s.ground && ((s.atkHeld || 0) >= DM.clash.heldAtk || (s.charge || 0) > 0);
/* while a charge is winding, the duck's twists (stone skin, prayer, coil, ember ward, low guard/poke, BK low block) are suspended, and ladder/door UP-grabs are ignored */
export const duckTwistSuspended = s => dmOn() && ((s.charge || 0) > 0 || (s.atkHeld || 0) >= DM.clash.heldAtk);
export const upGrabIgnored = s => dmOn() && ((s.charge || 0) > 0 || (s.atkHeld || 0) >= DM.clash.heldAtk);
/* drop-through stays DOWN+JUMP: a held DOWN while winding never drops the hero through a one-way floor */
export const dropThroughAllowed = s => !dmOn() || (!!s.jump && !!s.down);
