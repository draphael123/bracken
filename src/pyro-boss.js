// src/pyro-boss.js - THE PYROMANCER 2: the boss's NEW KIT, as numbers and pure rules (claude/pyroboss2, Daniel 11-01 09:05 + 09:07 "You can build both";
// scratch/brief-pyroboss2-firemage-1101.md). The renegade in the Burning Village square fought with the OLD pyro kit (the run of three, THE BELLOWS,
// the ember volley, the vent/overheat, a guard that READ a run). The hero's kit changed (BATCH135 pyrokit + claude/pyrocontrols), so the mirror
// changes with it. main.js (updatePyromancer and its draw) owns the world; this file owns the numbers and the parts a node test can drive.
//
//   THE STAFF        kept: the run of three cuts is still the hero's X (PYRO_DUEL in main.js).
//   FLAME WARD       her GUARD: a blow into the dome is TURNED at WARD.mul (B15's 0.4 floor, never 0) and SCORCHES the striker; the last WARD.gutter
//                    of it GUTTERS (the red fading dome, told), then she is SPENT: OPEN WARD.spent (gold ring, x OPEN_MUL). Water puts it out -> SPENT.
//   THE FIREBALL     the 5-step charge on her staff (the hero's own sizes, src/pyro-art.js held()). Steps 1-2 a shield takes ('!'); from step 3 it
//                    EXPLODES where it lands ('!!', a red ring on the floor there first). A BLOW or WATER while she charges CANCELS it: she staggers
//                    OPEN CHARGE.cancelOpen.
//   PHOENIX RISE     the gap-closer: a told crouch in rising flame, a burning dash to your spot, a LANDING BURST. Recovery after is open.
//   STOKE            her refill: crouched on the planted staff, the meter climbs - she is OPEN while she does it. WATER while she stokes WINDS her:
//                    WIND.t down at WIND.mul, then her told STEAM WARD (B3) at STEAM.mul (B15 - the old steam ward turned everything at 0x).
//   P2: HER MARKS    the square floor cools (it burned with her meter in P1); every fireball landing, blast, ward and Phoenix landing leaves a BURN
//                    MARK on the floor. A full meter = CONFLAGRATION: told (staff up, the marks pulse white), then every mark ERUPTS - step off them.
//                    She is SPENT after it. Water on a mark puts it out.
export const OPEN_MUL = 1.5;                 // every opening (spent, cancelled, stoking, the rise's recovery): x this
export const WARD = { up: 1.0, gutter: 0.35, spent: 1.2, cd: [3.4, 2.6], chance: [0.5, 0.65], mul: 0.4, scorch: 7, scorchCd: 0.35, reach: 64, heat: 6 };
export const CHARGE = {
  stepT: 0.45,                               // a step every this long (the hero's 0.18/0.9/1.5/2.0/2.5 s scaled to a boss's read)
  fastT: 0.3,                                // ...the READY ball a full P1 meter throws, quicker
  goal: [[2, 3], [3, 5]],                    // the step she lets go at, by phase: [lo, hi]
  cancelOpen: 1.5,                           // a blow or water mid-charge: open this long
  v: [0, 200, 215, 225, 235, 245],           // flight speed by step
  r: [0, 3, 5, 8, 10, 13],                   // the ball's radius (pyro-art BALL_R)
  dmg: [0, 8, 10, 12, 13, 15],               // a direct hit (steps 1-2: a shield takes it)
  boomR: [0, 0, 0, 34, 42, 54],              // steps 3+ EXPLODE: the hero's own radii
  boomDmg: [0, 0, 0, 12, 14, 17],            // ...and no shield turns the blast
  life: 2.2, heat: 10,
};
export const RISE = { tell: 0.6, v: 430, max: 230, dmg: 11, burstR: 40, burst: 12, rec: 0.7, far: 170, mul: 0.4 };
export const STOKE = { rate: 32, max: 2.5, at: 45, near: 90, cd: 6 };
export const WIND = { t: 3.5, mul: 2 };
export const STEAM = { t: 2.5, mul: 0.4 };
export const WATER = { heat: 40 };           // water outside the stoke: this much meter gone, a raised ward out, a charge cancelled
export const CONFLAG = { tell: 1.1, r: 18, dmg: 15, spent: 2.0 };
export const MARKS = { max: 8, life: 16, douseR: 24 };
export const HEAT = { hit: 12, cut: 6 };     // her meter: a blow of hers that lands, each cut thrown

/* THE MARKS (P2): a list of { x, y, t } on the boss. add keeps the newest MARKS.max and never stacks two inside 12 px (a refresh instead) */
export function addMark(list, x, y, now) {
  const near = list.find(m => Math.abs(m.x - x) < 12 && Math.abs(m.y - y) < 8);
  if (near) { near.t = now; return near; }
  const m = { x, y, t: now }; list.push(m); while (list.length > MARKS.max) list.shift(); return m;
}
export function ageMarks(list, now) { for (let i = list.length - 1; i >= 0; i--) if (now - list[i].t > MARKS.life) list.splice(i, 1); }
/* water on the floor at (x, y): every mark within douseR goes out; returns how many */
export function douseMarks(list, x, y) { let n = 0; for (let i = list.length - 1; i >= 0; i--) if (Math.abs(list[i].x - x) < MARKS.douseR && Math.abs(list[i].y - y) < 24) { list.splice(i, 1); n++; } return n; }
/* does an eruption at the marks reach a hero standing at (x, y feet)? */
export const onMark = (list, x, y) => list.some(m => Math.abs(m.x - x) < CONFLAG.r && Math.abs(m.y - y) < 20);
/* the charge step after t seconds of charging (1..5) */
export const stepAt = (t, stepT = CHARGE.stepT) => Math.max(1, Math.min(5, 1 + Math.floor(t / stepT)));
/* the step she will let go at this charge (phase 1|2, a 0..1 roll) */
export const goalOf = (phase, roll) => { const [lo, hi] = CHARGE.goal[phase === 2 ? 1 : 0]; return lo + Math.min(hi - lo, Math.floor(roll * (hi - lo + 1))); };
export const big = step => step >= 3;
/* what a thrown water does to her now: 'wake' (not in the fight), 'turned' (her steam ward), 'cool' (already winded), 'wind' (stoking: the big one),
   'douse' (anything else: the meter down, a ward out, a charge cancelled) */
export function waterOn(e) {
  if (!e) return null;
  if (e.mode === 'sleep' || e.mode === 'wake') return 'wake';
  if (e.ward > 0) return 'turned';
  if (e.mode === 'winded') return 'cool';
  if (e.mode === 'stoke') return 'wind';
  return 'douse';
}
/* the multiplier on a hero's blow: B15 - never below 0.4 */
export function takeMul(e) {
  if (e.ward > 0) return STEAM.mul;
  if (e.mode === 'ward') return WARD.mul;
  if (e.mode === 'rise') return RISE.mul;
  if (e.mode === 'winded') return WIND.mul;
  if (e.open > 0) return OPEN_MUL;
  return 1;
}
/* B10's shared read: 'winded' (gold, bar on WIND.t), 'open' (gold, bar on openMax), 'steam' (the pale shell, bar on STEAM.t), or null */
export function readOf(e) {
  if (!e || !e.alive) return null;
  if (e.ward > 0) return { st: 'steam', k: Math.max(0, Math.min(1, e.ward / STEAM.t)) };
  if (e.mode === 'winded') return { st: 'winded', k: Math.max(0, Math.min(1, e.modeT / WIND.t)) };
  if (e.open > 0) return { st: 'open', k: Math.max(0, Math.min(1, e.open / (e.openMax || e.open))) };
  return null;
}
/* THE LINES SHE SAYS (src/hint-lines.js routes them to the hint box: number() drops every capital line it does not know) */
export const PB_SAY = ['HE STOKES', 'HIS MARKS BURN', 'SPENT', 'FIZZLED', 'HIS WARD GOES OUT', 'DOUSED', 'CONFLAGRATION', 'THE SQUARE COOLS'];
