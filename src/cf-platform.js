// src/cf-platform.js - CF2 PLATFORM FEEL (claude/cf2, plan scratch/lane-reports/cf-plan-1111.md sec. 3). ONE FLAG, default OFF: CF2_SHIPS false = batch158's
// updatePlayer byte for byte (every main.js call below is `CF2_SHIPS ? CF2.x(..) : <the old expression>`).
// HARD RULE: base movement stays frozen. Nothing here touches hero-move.js MOVE (JUMPV, GRAV, RUN, FALL_G, MAX_FALL, HERO_RUN...). The FULL HELD jump
// (jump held from launch to landing) never meets a CF2 number, so its height, airtime and reach are identical ON and OFF - src/reach-hero.js flies that
// jump and every level's gaps are measured on it. CF2 only changes what happens AFTER the player lets go (the short hop), plus two forgiveness nudges.
//   cut(vy)       eased jump cut: released while rising faster than JUMP_CUT, the rise is cut over 2 world frames (x0.45 then to JUMP_CUT), not 1 snap
//   apexG(held,P) the apex's light gravity (0.62) stays while the jump is HELD; a short hop (the cut fired: P.cfHop) drops with 0.85 through its apex
//   CORNER        head-bonk list gains +-6 after +-3/+-5
//   lipNudge      rising, blocked by a ledge whose top is <= 3 px above the feet: step up onto it (the mantle covers the falling case)
// Buffering through locks (plan item 4) is ALREADY true in batch158 and is left alone: a press during hit-stop is read before `if (stop > 0) return`
// and jbuf only decays inside updatePlayer; the commit jump-lock KEEPS the press (jumpHeld: kept for the whole window, then fires on its first free
// frame; the lock itself stays, Daniel 10-02 WEIGHT); a jump out of a roll/dash is allowed (`!dodging || P.dash > 0`). Landing has no lock.
// Art beats (apex hold, run-start kick) live in jump-feel.js / air-motion.js and read, never write, physics: owed to a later commit (see the lane report).
import { MOVE } from './hero-move.js';
export let CF2_SHIPS = true;                                    /* the one-line switch. OFF until the browser proofs pass (Daniel 11-11) */
export const setCF2 = on => { CF2_SHIPS = !!on; };
export const CF2 = {
  cutMul: 0.45,                                                 /* first cut frame: vy x 0.45 (never slower than JUMP_CUT) */
  hopApexG: 0.85,                                               /* a short hop's apex gravity once the jump is released (held full jump: MOVE.APEX_G 0.62) */
  corner: [-3, 3, -5, 5, -6, 6],                                /* head-bonk nudges, px */
  lipMax: 3,                                                    /* a ledge top at most this far above the feet is stepped onto */
  lipStep: 2,                                                   /* ... and the body is carried this far toward it, px */
};
/** the rise after a release: vy is negative (up). OFF = the old snap straight to JUMP_CUT. Marks the jump as a hop for apexG. */
export const cutVy = (vy, P) => { if (!CF2_SHIPS) return MOVE.JUMP_CUT; if (P) P.cfHop = true; return Math.min(vy * CF2.cutMul, MOVE.JUMP_CUT); };
/** gravity multiplier inside the apex band (|vy| < APEX_VY). */
export const apexG = (held, P) => (CF2_SHIPS && !held && P && P.cfHop) ? CF2.hopApexG : MOVE.APEX_G;
export const cornerList = () => CF2_SHIPS ? CF2.corner : [-3, 3, -5, 5];
/** side lip: solid(x,y) = tile test; returns { dy, dx } to apply or null. feetY = P.y, move = -1/0/1 the stick, TS tile size. Conditions are checked by the caller's r.hitX. */
export function lipNudge(solid, x, feetY, move, vy, TS = 16, half = 5) {
  if (!CF2_SHIPS || !move || vy >= 0) return null;
  const fx = Math.floor((x + move * (half + 2)) / TS), fy = Math.floor((feetY - 1) / TS), top = fy * TS;   /* the tile the body is leaning on, beside the feet */
  if (!solid(fx, fy) || solid(fx, fy - 1) || solid(fx, fy - 2)) return null;
  const over = feetY - top;                                     /* how far the feet are BELOW the ledge top */
  if (over <= 0 || over > CF2.lipMax) return null;
  return { dy: -over, dx: move * CF2.lipStep };
}
/** one world frame of the vertical arc, exactly updatePlayer's (gravity gk, cap), for the node check. s = { vy, cfHop }; held = jump held. Returns new vy. */
export function arcStep(s, held, canCut = true, dt = MOVE.DT) {
  if (!held && canCut && s.vy < MOVE.JUMP_CUT) s.vy = cutVy(s.vy, s);
  const rising = s.vy < 0, apex = Math.abs(s.vy) < MOVE.APEX_VY;
  s.vy += MOVE.GRAV * dt * (apex ? apexG(held, s) : rising ? 1 : MOVE.FALL_G);
  if (s.vy > MOVE.MAX_FALL) s.vy = MOVE.MAX_FALL;
  return s.vy;
}
