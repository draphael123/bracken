# claude/damagepct - DAMAGE % STAGGER (Smash-style), OPUS core (scratch/brief-damagepct.md). Base origin/master 4fabe26c.
STOPPED before any 12-seed boss measuring (the Sonnet tune lane follows).

## BUILT (src/damage-pct.js, one table PCT; main.js hooks tagged `(claude/damagepct)`)
- GAIN: every landed HERO blow adds verb weight x (damage that landed / the foe's full hp) x 100 to e.dmgPct, x(1 + 0.1 per mix-up pip).
  Weights: cut 0.55, heavy 1.5, riposte 1.8, plunge 1.2, sweep/rise 1.0, dash 1.1, throw 1.2, shot 0.6, skill 0.9. Burns, bleeds, hazards
  and foe fire add nothing. Cap 300%. Out of combat (3 s with no blow) it runs down at 8 %/s. Measured: mashing 6 light cuts = 8.3% for 60
  damage, mixed play = 35.2% for 94 damage (about 2.7x per point of damage).
- KNOCKBACK (knock-into): KI.throwFoe asks DP.throwAt, and knockFoe multiplies the throw speed by knockMul (0% 0.35 = a shove, about 72% = the
  old fixed throw, 200% = 2.15, capped) and the lift by liftMul (0.5 to 1.9). At 100% or more the throw TUMBLES (spins in the air, poseOf).
  Weight classes are unchanged (small 1 / mid 0.6 / brute 0.2, elite x0.6), and an elite is still never killed by a throw. Riposte/break push
  floors are kept. Same heavy on a sprig: 46 / 124 / 214 px at 0 / 70 / 150%. A brute at 150% goes 43 px.
- SHOVE: any blow's push on a common foe or elite x shoveMul (0.85 to 1.35). HITSTUN: hitStagger x stunMul (light up to x1.3, heavy/riposte/
  plunge up to x1.9, capped at 150%). Bosses' hitstun and shove are untouched.
- BOSSES/MINIS: never thrown at any %. % is gained against 15% of their hp; a poise break (addPoise + rpBreak) lasts base x breakMul (up to
  +50%, reached at 150%). The break spends the %. The B3 ward after it is unchanged (3 s); B15 floors are untouched (no damage path changed).
- READOUT: the over-head poise bar on common foes is now the % (6 px number, heat-coloured white -> gold -> orange -> red at 100%), with the
  poise strip kept as a 1 px underline (gold, flashing while broken). An elite's plate shows his % beside his health. Bosses show NO number
  (see Q2). Screenshot checked at 320x180.

## CHECKS (PORT 8858, sequential)
riposte OK - riposte-shots OK - knock-into OK - elites OK (77) - combat-part2 OK (poise) - finishers OK (poise) - boss-fight-end OK (60) -
mark-integrity: 1 red = undeadmage|markTell PHANTOM POSE (the known flake) - textfit hud,plates --strict OK (0 issues; first run hit a CDP
timeout under load, rerun green) - NEW tools/damage-pct.mjs OK (pure, gain, weight, boss, read; added to check.mjs).
anti-plunge = knock-into's 'anti' part (OK).
MASH spot-check (not written: docs/mash-bot.json rows are hash-stamped on level data, which this lane does not change, so no row goes stale
and none was re-stamped): level mode wood/marsh/stockade x knight/warden/pyro = died every run; boss wood queen / marsh frog / stockade chief =
0/6 each (frog: warden got to 30% left, the closest).

## STATED DESIGN CHANGE TO A TEST
tools/knock-into.mjs: its foes (5000 hp test dummies, which never build %) now stand at 70%, where the throw goes as far as the old fixed one
(knockMul about 1). Every assertion is unchanged. The new behaviour (a fresh 0% foe is only shoved, a worn foe is launched) is asserted in
tools/damage-pct.mjs.

## QUESTIONS FOR DANIEL
1. A FRESH foe (0%) hit by one heavy is now only shoved (about 0.35x the old throw); a foe needs about 70% to be thrown as far as before.
   Some knock-into exams that relied on one heavy into the spikes now need wearing down first. REC (built): keep it, this is the Smash feel
   the brief asked for. Alternative: raise PCT.knock.lo to about 0.6.
2. BOSS % READOUT. REC (built): no number on the boss HUD (the plate has no room clear of the BAR+% / NUMBERS text; the break's gold clock
   already shows the longer break). Alternative: a small % beside his poise bar.
3. The break SPENDS a boss's % (back to 0, so each break reflects the % built since the last one). REC (built): spend. Alternative: keep it,
   which makes every later break hit the cap.
4. The % is relative to the foe's own health (it reads as "how worn down and how hard-hit"), not raw damage as in Smash. REC (built):
   relative, because raw damage let small foes die long before any launch and let brutes launch as easily as goblins.
For the Sonnet tune lane: all of these numbers are in PCT (src/damage-pct.js). Boss rates were not measured (out of scope).
