// src/hook-catch.js - THE FREEBOOTER'S HOOK CATCH (claude/heroblocksa, Daniel 10-30 21:56 "yes this makes sense"; scratch/brief-pyrokit-1101.md 7a).
// His block. TAP C throws the grapnel up across his body for a ~0.4 s SNAP (not holdable: it goes slack and he is open until it is back). HOLD C past
// CATCH.hold is still the hook THROW, so a tap is a catch and a hold is a throw.
//   THE FIRST CATCH.perfect s OF THE SNAP is a PERFECT CATCH: a yellow blow is stopped dead and the grapnel SNAGS the weapon (the foe is staggered,
//     a boss a little); a thrown thing (an arrow, a bolt, a spit, a flung stone) is CAUGHT out of the air and FLUNG BACK at whoever threw it; the
//     pistol reloads, a little wind comes back, plunder, the riposte window opens - and THE NEXT PISTOL SHOT within CATCH.shotT s is instant (no
//     wind) and a POINT-BLANK shot (x CATCH.shotMul) when its mark is within CATCH.pbR px.
//   THE REST OF THE SNAP is a plain CATCH: it blocks a yellow blow at a block's price in wind (the shared block row of src/juice.js); a projectile
//     is caught and dropped, not flung. A HEAVY blow (CATCH.heavy or more, raw) BREAKS THROUGH it: half lands and it SHOVES him back.
//   A RED blow is never caught (it goes through at its whole weight) and a bolt that pierces is only caught on the beat.
export const CATCH = {
  snap: 0.4,       // the whole snap, from the press
  perfect: 0.2,    // the first part of it: the PERFECT catch (the riposte beat, riposte.js PARRY.tap)
  hold: 0.2,       // keep C down this long and it is the HOOK THROW, not a catch
  cd: 0.85,        // from the press to the next catch
  heavy: 26,       // a raw blow this big breaks through a plain (not perfect) catch
  shove: 1.9,      // x the usual knock when a heavy breaks through
  snag: { stagger: 1.0, boss: 0.45, push: 200 },   // the weapon snagged: s staggered (a boss), px/s the foe is hauled off its feet
  refund: 14,      // wind back on a perfect catch (held to commit.js refundCap)
  plunder: 3,
  shotT: 3.0,      // s the point-blank shot waits
  shotMul: 1.5,    // x the ball's damage
  pbR: 56,         // px: a mark this near is point-blank
  reach: 26,       // px ahead of him a thrown thing is caught (the body's box is the floor)
};
/* what the snap makes of a blow met `age` s after the press: 'perfect' | 'block' | 'heavy' | 'none'.
   dmg is the raw blow; front whether it came at his face; red a blow nothing catches; pierce a bolt that goes through a guard. */
export function catchVerdict({ age, dmg = 0, front = true, red = false, pierce = false, perfect = CATCH.perfect } = {}) {
  if (!(age >= 0) || age > CATCH.snap + 1e-6 || !front || red) return 'none';
  if (age <= perfect + 1e-6) return 'perfect';
  if (pierce) return 'none';
  return dmg >= CATCH.heavy ? 'heavy' : 'block';
}
/* a thrown thing met in the snap: 'fling' on the beat, 'drop' after it, 'none' if nothing catches it (red / piercing / out of the snap) */
export function seedVerdict({ age, red = false, pierce = false, perfect = CATCH.perfect } = {}) {
  if (!(age >= 0) || age > CATCH.snap + 1e-6 || red) return 'none';
  if (age <= perfect + 1e-6) return 'fling';
  return pierce ? 'none' : 'drop';
}
/* the pistol after a perfect catch: wind (s), and the ball's multiplier for a mark `d` px away */
export const shotWind = (live, normal) => live ? 0.04 : normal;
export const shotMulFor = (live, d) => live && d <= CATCH.pbR ? CATCH.shotMul : 1;
