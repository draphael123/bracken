// THE POSE KEEPS THE BLOW'S TIME. This chooses art only; stamina, movement and live boxes remain in combat.
/* THE ATTACK-ANIMATION BEAT TABLE (heroanim lane, 2026-10-10; art only, every window is combat's). Seconds on the swing clock P.atk -> the frame of
   the hero's atk / atkB / atkC list (0 anticipation, 1 strike (smear), 2 extended, 3 recover, 4 settle); then the recovery clock (P.atkRec, set by
   commit.js recoveryFor and kept in P.atkRecMax) plays K.R.follow: frame 0 in its first half, 1 in its second (a finisher's flourishT hold and a
   heavy keep their own poses; an air swing has no recovery).
     hero       0 -> 1   1 -> 2   2 -> 3   3 -> 4     recovery (s)   follow[0] = spent weapon carried low   follow[1] = back to guard
     knight     .04      .10      .16      .24        .084 (.12 3rd)  blade low-forward, plume flying        blade down to the turf point
     warden     .04      .10      .18      .24        .084 (.12)      spear swept low, point out front       spear drawn back to the slope
     pyro       .04      .10      .18      .24        .084 (.12)      staff trailed low, hem swinging        staff up to her shoulder
     paladin    .06      .10      .18      .25        .102 (.132)     maul head down-forward                 maul hauled to the hip
     pirate     .03      .07      .15      .24        .06 (.084)      cutlass low, pistol still in the belt  cutlass to rest
     reaper     .12      .15      .24      .28        .102 (.132)     greatsword dragged low and long        point set toward the ground
     geomancer  .05      .10      .18      .25        .096 (.132)     stave swung across low                 butt set, stave upright */
const LIGHT = {
  knight: [.04, .10, .16, .24], warden: [.04, .10, .18, .24],
  pyro: [.04, .10, .18, .24], paladin: [.06, .10, .18, .25],
  pirate: [.03, .07, .15, .24], reaper: [.12, .15, .24, .28],
  geomancer: [.05, .10, .18, .25],   /* the stave: a beat longer to lift than a sword, the stone lands on the same frame as the spear */
};
export function attackPose(hero, p, frames) {
  const directional = p.swingKind === 'rise' || p.swingKind === 'sweep' || p.swingKind === 'airUp';   /* (claude/combat3: the air up-slash) */
  const combo = (p.combo || 1) % 3;
  let desired = directional ? p.swingKind : !p.ground && frames.air ? 'air' : combo === 2 ? 'atkB' : combo === 0 ? (hero === 'reaper' && frames.bloodLash && !p.heavy ? 'bloodLash' : 'atkC') : 'atk';   /* (claude/bkblood) the Blood Knight's third cut is THE BLOOD LASH */
  /* (claude/berserker2) THE BERSERKER'S FLURRY: left axe, right axe, and the run's fifth the CROSS-CHOP; in the air both axes spin. Each of his keys falls back to the
     frame list it borrows until the barbarian lane draws it (chars.js) */
  if (hero === 'berserker' && !directional) { const want = !p.ground ? 'bzAirSpin' : p.heavySwing ? 'bzCross' : (p.combo || 1) % 2 ? 'bzFlurryL' : 'bzFlurryR';
    desired = frames[want] ? want : !p.ground && frames.air ? 'air' : p.heavySwing ? 'atkC' : (p.combo || 1) % 2 ? 'atk' : 'atkB'; }
  const key = frames[desired] ? desired : desired === 'airUp' && frames.rise ? 'rise' : 'atk';
  const beats = directional ? [.02, .08, p.swingKind === 'sweep' ? .15 : .17, .24] : LIGHT[hero] || LIGHT.knight;
  const frame = beats.findIndex(t => p.atk < t);
  return { key, frame: frame < 0 ? 4 : frame };
}
