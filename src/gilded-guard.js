// src/gilded-guard.js - THE GILDED GUARD, THE KING'S PYRAMID's one new foe (claude/kingspyramid, 11-06; plan-desert-1105 s1.11 + Q8: "the light strips his shield").
// Pure rule, no DOM. He IS the proven shield machine (main.js 'shield': the front guard that turns every blow from the front, shoves, comes round) in gold, with
// two differences, both told:
//   GOLD PLATE   from behind (or a blast, a burn) his plate still turns part of a blow: x GG.backMul ("GOLD"). The shield machine's front guard is unchanged.
//   THE LIGHT    a sun shaft, a carried sun (a sun-room's beam) or the King's capstone light on him STRIPS HIS SHIELD: dazzled GG.dazzle s (a flinch, told by the
//                flash and the word), then STRIPPED for GG.strip s - no front guard (main.js reads e.disarmed: throughGuard), his blows soft (DISARMED_TAKE), and
//                every blow lands x GG.stripMul. The light must leave him and come back to strip him again (GG.rearm s in the dark first) - no lock.
// The lesson he teaches is the act's: LURE HIM INTO THE LIGHT (the Sunless Door's shaft teaches it, the mirror room tests it, the hub remixes it).
export const GG = { strip: 3.2, dazzle: 0.5, rearm: 0.6, backMul: 0.6, stripMul: 1.25, hpMul: 1.6 };
export const GG_SAY = { strip: 'THE LIGHT STRIPS HIS SHIELD', gold: 'GOLD', back: 'HIS SHIELD IS BACK UP', name: 'THE GILDED GUARD' };
export const newGG = () => ({ strip: 0, dazzle: 0, dark: GG.rearm, n: { strips: 0 } });
/* one frame: lit = is his body in a light this frame. -> 'strip' on the frame the light takes his shield, 'back' when it returns, else null */
export function ggStep(st, lit, dt) {
  let ev = null;
  st.dazzle = Math.max(0, st.dazzle - dt);
  if (st.strip > 0) { st.strip -= dt; if (st.strip <= 0) { st.strip = 0; ev = 'back'; } }
  if (lit) { if (st.strip <= 0 && st.dark >= GG.rearm) { st.strip = GG.strip; st.dazzle = GG.dazzle; st.n.strips++; ev = 'strip'; } st.dark = 0; }
  else st.dark += dt;
  return ev;
}
export const ggStripped = st => st.strip > 0;
/* a blow that reached him (the shield machine already turned a frontal one): stripped x stripMul, else his gold plate x backMul (never 0) */
export function ggTake(st, dmg) {
  if (dmg <= 0) return [0, null];
  if (st.strip > 0) return [Math.round(dmg * GG.stripMul), null];
  return [Math.max(1, Math.round(dmg * GG.backMul)), GG_SAY.gold];
}
