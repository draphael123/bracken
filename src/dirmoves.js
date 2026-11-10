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

/* ==== FOES (lane DMFOES, plan section 8 items 1-5): HIGH GUARD, HELM CRACK, LEAP-SWAT, the family edits, the codex lines, the first-meet hints ====
   Everything below is a no-op while DM.on is false. State lives on the foe (e.dm*), never on e.mode (no new tell-table rows). */
import { heroAbove } from './foe-react.js';
const blowHas = (b, v) => !!b && (b === v || (Array.isArray(b) && b.includes(v)));

/* the guard family (shield, soldier, heavy, watch, pike, turtle, tideguard, merrowbrute; NOT the crab: its job is the plunge, item 5) and the shield uniques
   (they are skins of 'shield': e.cnSkin, or their own type) */
export const HIGH_GUARD = new Set(['shield', 'soldier', 'heavy', 'watch', 'pike', 'turtle', 'tideguard', 'merrowbrute', 'glasssentinel', 'kingsshield', 'myconidguard', 'herbwarden', 'shieldguard']);
/* the helmed (a plunge cracks it): the plate family that wears a helm, plus the helmed goblin (shield) and the king's household shield */
export const HELM = new Set(['shield', 'bellguard', 'sentry', 'armour', 'swornsword', 'hedgeknight', 'boarder', 'bosun', 'kingsshield']);
export const guardsHighKind = e => !!e && (HIGH_GUARD.has(e.t) || HIGH_GUARD.has(e.cnSkin));
export const helmedKind = e => !!e && (HELM.has(e.t) || HELM.has(e.cnSkin));
const bossLike = e => !!(e.maxHp || e.mini || e.elite || e.xpRole || e.big || e.trainer || e.turncoat);   /* (the family table's own exclusions: those have gates of their own) */

/* ---- HIGH GUARD (item 2) ---- */
DM.foe.highGuardAbove = 0.35;   /* s a hero must hang above within highGuardNear before the shield goes up (told) */
DM.foe.highGuardNear = 48;      /* px = 3 tiles each side */
DM.foe.highGuardCd = 0.6;       /* s between one high guard and the next */
DM.foe.highGuardTurns = 2;      /* front blows turned ... */
DM.foe.highGuardTurnWin = 2;    /* ... inside this many s raise it too */
const raiseHigh = (e, now) => { e.dmHighUntil = now + DM.foe.highGuardUp; e.dmHighCd = now + DM.foe.highGuardUp + DM.foe.highGuardCd; e.dmAbove = 0; e.dmTurns = null; };
export const highGuardUp = (e, now) => dmOn() && (e.dmHighUntil || 0) > now && !(e.broken > 0);
/* once a frame per foe: heroes = the party. busy = the foe is mid-windup / mid-attack (it cannot raise its shield). Returns 'lift' on the frame it goes up. */
export function highGuardTick(e, heroes, now, dt, busy = false) {
  if (!dmOn() || !e.alive || !guardsHighKind(e) || bossLike(e)) return null;
  if (e.broken > 0 || e.stagger > 0.3 || e.disarmed || busy) { e.dmAbove = 0; return null; }
  if ((e.dmHighUntil || 0) > now || now < (e.dmHighCd || 0)) return null;
  let above = false; for (const h of heroes || []) if (h && heroAbove(e, h, { dx: DM.foe.highGuardNear, dy: 130 })) { above = true; break; }
  e.dmAbove = above ? (e.dmAbove || 0) + dt : 0;
  if (e.dmAbove >= DM.foe.highGuardAbove) { raiseHigh(e, now); return 'lift'; }
  return null;
}
/* a FRONT blow was turned (guardTurned): two inside the window raise the shield too. true = it went up on this turn */
export function noteTurn(e, now, busy = false) {
  if (!dmOn() || !guardsHighKind(e) || bossLike(e) || busy || e.broken > 0 || (e.dmHighUntil || 0) > now || now < (e.dmHighCd || 0)) return false;
  const t = (e.dmTurns || []).filter(x => now - x <= DM.foe.highGuardTurnWin); t.push(now); e.dmTurns = t;
  if (t.length >= DM.foe.highGuardTurns) { raiseHigh(e, now); return true; }
  return false;
}
/* a PLUNGE or a STOMP landing on him: turned (clank, the hero pogoes off, NO damage). */
export const highGuardTurns = (e, now) => highGuardUp(e, now) && guardsHighKind(e);
/* what the raised shield does to the other verbs: a rising cut (and a plain cut) from the front glances off; the SWEEP from the front goes under it (the family key) */
export const highGuardGlances = (e, blow, fromFront, now) => highGuardUp(e, now) && !!fromFront && !blowHas(blow, 'sweep') && !blowHas(blow, 'heavy') && (blowHas(blow, 'rise') || blowHas(blow, 'light'));
/* a charged sweep (DMCHARGE tags it ['sweep','heavy']) on a raised guard BREAKS it (guardBreak s); a plain sweep trips as today */
export const highGuardBreak = (e, blow, now) => highGuardUp(e, now) && blowHas(blow, 'sweep') && blowHas(blow, 'heavy') ? DM.charge.guardBreak : 0;
/* a little steel plate over the head while it is up (v1 placeholder for the shield-lift pose; the art lane draws the real one) */
export function drawHigh(g, e, cx, cy, now) {
  if (!(e.dmHighUntil > now)) return;
  const x = Math.round(e.x - cx), y = Math.round(e.y - (e.h || 14) - 4 - cy), k = Math.min(1, (e.dmHighUntil - now) / 0.15);
  g.fillStyle = '#2a3038'; g.fillRect(x - 8, y - 1, 16, 5); g.fillStyle = k < 1 ? '#8a94a0' : '#c9d1dc'; g.fillRect(x - 7, y - 2, 14, 3); g.fillStyle = '#eef4fa'; g.fillRect(x - 5, y - 2, 4, 1);
}

/* ---- HELM CRACK (item 3) ---- */
/* a real PLUNGE (down+swing: realPlunge = the hero's P.plunge, NOT a stomp) cracks the helm of a helmed common foe. true on the cracking blow. */
export function helmCrack(e, blow, realPlunge) {
  if (!dmOn() || !realPlunge || !blowHas(blow, 'plunge') || !helmedKind(e) || bossLike(e) || e.dmHelmGone) return false;
  e.dmHelmGone = true; return true;
}
/* a cracked helm: light cuts land full (the family glance no longer applies) */
export const helmGone = e => dmOn() && !!e.dmHelmGone;

/* ---- FAMILY EDITS (item 1) ---- */
/* shell gains 'plunge' as a key; beast gains it too (plus the stagger below). Other keys unchanged. */
export function familyKey(famName, key) {
  if (!dmOn() || (famName !== 'shell' && famName !== 'beast')) return key;
  const k = [].concat(key); return k.includes('plunge') ? k : k.concat('plunge');
}
/* beast + plunge: STAGGER 0.6 s and a lean x1.5 on the poise bar - never a launch. null = not this case. */
export const beastPlunge = (famName, blow) => dmOn() && famName === 'beast' && blowHas(blow, 'plunge') ? { stagger: DM.foe.beastStagger, poiseMul: DM.foe.beastPoiseLean } : null;
/* wing + a CHARGED rise (DMCHARGE tags it ['rise','heavy']) = GROUNDED: knocked down, not launched */
export const wingGrounded = (famName, blow) => dmOn() && famName === 'wing' && blowHas(blow, 'rise') && blowHas(blow, 'heavy');
DM.foe.wingGroundT = 1.2;

/* ---- LEAP-SWAT (item 4) ----
   the common foes that LEAP / POUNCE / DIVE / HOP / DROP, and how to tell it is in the air right now:
   { air: true } = e.air (the ground goblin dogs and frogs), { modes } = e.mode is one of them. Wing-family foes are NOT here: a rise is already their KEY. */
export const LEAP_SWAT = {
  hound: { air: true }, hopper: { air: true },
  spider: { modes: ['drop'] }, clinger: { modes: ['drop'] },
  gar: { modes: ['lunge'] }, lurker: { modes: ['lunge'] },
  puffer: { modes: ['dive'] }, urchin: { modes: ['dive'] }, netter: { modes: ['dive'] }, sailor: { modes: ['dive'] }, jelly: { modes: ['dive'] },
  hedgeknight: { modes: ['leap'] }, swornsword: { modes: ['leap'] }, crossbow: { modes: ['leap'] }, runner: { modes: ['leap'] },
};
/* the four reasons a marks.js row the regex finds is NOT a swat target (tools/dirmoves-foes.mjs asserts every such row is a target or has one) */
export const LEAP_EXEMPT = {
  wing: 'wing family: a rise is already its key (x1.5)',
  boss: 'a boss, mini or arena foe: its own gate',
  tell: 'a windup, not the leap itself (the Tell row is the warning)',
  module: 'moves in its own module (mummy, raptor, marionette...): no shared e.mode to read; listed in the lane report',
};
export const LEAP_RE = /leap|pounce|dive|hop|jump|drop/i;
export function leapActive(e) {
  const r = LEAP_SWAT[e.t]; if (!r || e.stagger > 0.3) return false;
  return r.air ? !!e.air : r.modes.includes(e.mode);
}
/* a RISE hits a common foe in an active leap: SWATTED. Returns true the first time per leap (1 s). The caller applies x leapSwatMul, floors it, cancels its bite. */
export function swatHit(e, blow, now) {
  if (!dmOn() || !blowHas(blow, 'rise') || bossLike(e) || !leapActive(e) || now - (e.dmSwatAt ?? -9) < 1) return false;
  e.dmSwatAt = now; return true;
}

/* ---- CODEX (the bestiary page): the lines that change with this lane. codex(t, desc) = the description as it reads under DM.on ---- */
export const CODEX_ADD = {};
const addLine = (t, s) => { CODEX_ADD[t] = (CODEX_ADD[t] || '') + s; };
for (const t of HIGH_GUARD) addLine(t, ' He lifts his guard high when you hang over him: a plunge bounces off. Go low (down+swing) to trip him.');
for (const t of HELM) addLine(t, ' A plunge cracks the helm; after that light cuts land full.');
for (const t of Object.keys(LEAP_SWAT)) addLine(t, ' A rising cut swats it out of the leap.');
for (const t of ['urchin', 'prise', 'holdfast', 'clinger', 'mimic']) addLine(t, ' A plunge is a key to the shell too.');
for (const t of ['brute', 'troll', 'berserker', 'goat', 'hearthgob', 'scarecrow', 'farmhand', 'topiary', 'propman', 'miner', 'fledgling', 'thorn', 'temperer', 'scalder']) addLine(t, ' A plunge staggers it (it never launches).');
export const CODEX_FIX = { shield: [['or plunge from above. Stomps clank off the helm.', '. Hang over him and he lifts his shield: go low. A plunge cracks the helm when the shield is down.']] };
export function codex(t, desc) {
  if (!dmOn()) return desc;
  let d = desc; for (const [a, b] of CODEX_FIX[t] || []) d = d.replace(a, b);
  return d + (CODEX_ADD[t] || '');
}

/* ---- FIRST-MEET HINTS (twice per save, plan section 10) ---- */
export const HINTS = {
  highguard: 'HE GUARDS HIGH: GO LOW. DOWN+SWING GOES UNDER THE SHIELD.',
  helm: 'HELM CRACKED. LIGHT CUTS LAND FULL NOW.',
  swat: 'SWATTED. A RISING CUT KNOCKS A LEAPER OUT OF THE AIR.',
  grounded: 'GROUNDED. A CHARGED RISE DRAGS A FLIER DOWN.',
  airdash: 'AIR DASH BACK. A BOUNCE OFF A HEAD GIVES YOUR DASH BACK.',
};
export const hintDue = (PROG, kind) => dmOn() && !!HINTS[kind] && ((PROG.dmHints = PROG.dmHints || {})[kind] || 0) < 2;
export function hintTake(PROG, kind) { if (!hintDue(PROG, kind)) return null; PROG.dmHints[kind] = (PROG.dmHints[kind] || 0) + 1; return HINTS[kind]; }

/* ---- THE DESERT KINDS THAT SIT IN NO FAMILY (coordinator add-on from DMLINT): classified only while DM.on, so the three jobs reach acts IV-V ---- */
export const FAMILY_ADD = {
  scorpion: 'small', skitter: 'small', stray: 'small',   /* low: DOWN (sweep) or come down on it */
  vulture: 'wing', raptor: 'wing',                        /* in the air: UP (rise) or throw */
  mummy: 'beast', sandworm: 'beast',                      /* weight: rock it; a plunge staggers it (PLUNGE) */
  cutthroat: 'crew', ambusher: 'crew', slinger: 'shooter',
};
export const famNameOf = (famOf, t) => famOf[t] || (dmOn() ? FAMILY_ADD[t] : undefined);

/* ==== (claude/dmcharge) ONE CHARGED GRAMMAR (plan section 5, 6): HOLD UP+X = the CHARGED LAUNCHER, HOLD DOWN+X = the CHARGED SLAM / SWEEP ====
   Ground only. The press already swung (a tap), the hold winds, the direction is read LIVE (the aim glyph) and the one HELD AT RELEASE fires.
   ONE step, no tiers: ready at HEAVY_START + DM.charge.step x the hero's scale. Let go before it = nothing more (SFX.ui). Every number is DM.charge. */
export const CHARGE_HEROES_OFF = new Set(['ranger']);   /* her kneel draw IS hold + down: DMHEROES-C retunes it, so no directional charge for her yet */
export const chargeOn = heroId => dmOn() && !CHARGE_HEROES_OFF.has(heroId);
/* the direction a held key pair asks for: UP and DOWN both held = nothing */
export const chargeDir = (up, down) => up && !down ? 'up' : down && !up ? 'down' : null;
export const chargeReadyAt = (heroId, heavyStart) => heavyStart + DM.charge.step * (DM.charge.scale[heroId] || 1);
export const chargeReady = (held, heroId, heavyStart) => held >= chargeReadyAt(heroId, heavyStart);
/* the blow tags: arrays (verb first, then 'heavy': never stale; the family table reads arrays) */
export const chargedBlow = dir => dir === 'up' ? ['rise', 'heavy'] : ['sweep', 'heavy'];
export const chargedMul = dir => dir === 'up' ? DM.charge.launcherMul : DM.charge.slamMul;
/* the live window of the swing's box (P.atk units), the same for both */
export const CHARGE_LIVE = [0.02, 0.2];
/* the box, per hero row (face = +1 / -1). Launcher: the hero's rise box +24 px tall; slam: ground AoE +-slamHalfW both sides.
   WARDEN: POLE HOIST = the tip under the foe (narrow, reach), HAMSTRING = the shaft along the floor, ONE side, full reach. */
export function chargeBox(dir, heroId, x, y, face, atk) {
  if (atk < CHARGE_LIVE[0] || atk >= CHARGE_LIVE[1]) return null;
  const f = face >= 0 ? 1 : -1, W = DM.charge.slamHalfW, mk = (a, b, t, bt) => f > 0 ? { l: x + a, r: x + b, t: y + t, b: y + bt } : { l: x - b, r: x - a, t: y + t, b: y + bt };
  if (dir === 'up') {
    if (heroId === 'warden') return mk(-4, 22, -68, 4);                          /* the tip under the foe: tall, narrow */
    const r = heroId === 'paladin' ? 24 : heroId === 'pyro' || heroId === 'reaper' ? 28 : 22;
    return mk(-4, r + 4, -64, 14);                                              /* the rise box (-40) + 24 tall */
  }
  if (heroId === 'warden') return mk(-6, 58, -8, 2);                             /* HAMSTRING: one side, the shaft at full reach */
  return { l: x - W, r: x + W, t: y - 8, b: y + 2 };                             /* both sides, 2.5 tiles */
}
export const CHARGE_NAME = {
  knight: { up: 'HEAVEN CUT', down: 'SHIELD DRIVE' }, warden: { up: 'POLE HOIST', down: 'HAMSTRING' },
  _: { up: 'CHARGED LAUNCH', down: 'CHARGED SWEEP' },
};
export const chargeName = (heroId, dir) => (CHARGE_NAME[heroId] || CHARGE_NAME._)[dir];
/* per-hero feel of the release: the knight HOPS after his cut (flows into air hits), the warden hoists / hamstrings at her reach */
export const CHARGE_MOVE = {
  knight: { up: { vx: 40, vy: -190 }, down: { vx: 200, vy: 0 } },
  warden: { up: { vx: 20, vy: 0 }, down: { vx: 60, vy: 0 } },
  _: { up: { vx: 30, vy: 0 }, down: { vx: 100, vy: 0 } },
};
export const chargeMove = (heroId, dir) => (CHARGE_MOVE[heroId] || CHARGE_MOVE._)[dir];
/* the foe side of a charged blow, as plain numbers: weight of the launch (any common incl. beast/brute; elite 0.6; boss / mini never), the trip time (a beast 0.7) */
export const launchWeight = e => !e || e.maxHp || e.mini ? 0 : e.elite ? 0.6 : 1.0;
export const tripTime = (e, heavyBody) => heavyBody ? DM.charge.tripBeast : 1.1;
/* the aim glyph: which way, and whether the one step is there */
export const aimGlyph = (dir, ready) => ({ dir, ready: !!ready });
