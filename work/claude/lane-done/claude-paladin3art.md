# claude/paladin3art - PALADIN 3 ART (Sonnet art lane, 10-15): the war hammer, Conviction pips, the Hallowed Aura, every tier's own poses

Base: master 7a1c0793 (BATCH94 LIVE, Paladin 3 in greybox). Port 8942. Art-only except the swing-reach shrink Daniel OK'd (10-15). Self-grade: **B** (the polish scale, >= B).

## THE REACH SHRINK (the war hammer, ~15%) - the only number that moved
| box (src/main.js attackBox) | was | now |
|---|---|---|
| light swing (all three of the chain) | 26 | **22** |
| rising cut (up + X, ground) | 28 | **24** |
| low sweep | 34 | **29** |
| held-X box (the old heavy; Verdict has no swing, kept in step) | 32 | **27** |
| dash attack (the ram) | 30 | **26** |
| Heaven's Arc box half-width (UP_SLASH.air.paladin.w) | 15 | **13** |
| bot's LAB_REACH.paladin (src/lab.js, the lab stand distance) | 24 | **20** |
The drawn swing trails (sweep / rise crescents) and the directionalPoses' maul reach follow (34 -> 29, the rise's x x0.85). The hammer throw's range (112), SMITE's reach (28), RADIANCE r 56, Verdict reach 110 are spells/projectiles, NOT swing reach: unchanged. Every other number (costs, damage, stamina, pips, aura life) is untouched.

## WHAT WAS DRAWN (all 7 items)
1. **THE WAR HAMMER** (src/chars.js knightFrame `maul`, one renderer, so every pose that shows it changed at once - idle, swings, rise, sweep, dash, plunge, aegis, kneel, dances, every kit pose): a compact SQUARE head (6 x 7 block, bright strike face with a rim, a narrower back, a gold collar, a rivet band; the weapon skin still tints the head only) on a LONG haft whose butt now stands 8 px behind the hand with a gold cap. Head area ~35 px vs the old ~90 (head ~70% of the old reach-side size; the haft is the weapon). The thrown hammer (src/holy-fx.js bakeHammer) is the same war hammer: 11 x 11, square head on a long haft, eight turns, trail and bloom scaled to it.
2. **CONVICTION HUD** (main.js, in the same footprint so textfit is unchanged): five 7 x 7 SUN pips in a dark socket - unlit = a dim cold sun, the next one FILLS from the bottom up as the Light climbs to it, lit = the full gold sun with a white heart (all five held = the row breathes), tier notches over 1 / 3 / 5 that light when that tier can be spent.
3. **THE HALLOWED AURA** (src/holy-ground.js drawAura, only for `c.aura`; the boss circle is untouched): a soft radial floor-glow (brightest in the middle), a thin outer rim, a ring of long dashes slowly running round it so a still ring reads alive, six orbiting motes with a tail, light rising off it, a 0.7 s soft fade (no blink, no runes, no posts). **THE FLARE when lit**: two rings run out past the rim, a cross glint, the floor brightens - on the first spend AND on every spend while it stands (HGR.flare).
4. **SMITE / RADIANCE / SUNFALL**: three NEW poses (smiteQ: hammer drawn back at the hip, snapped forward-up with the head lit; radiance: hammer stood upright and the light gathering -> helm thrown back + a ring of spokes round the chest -> settle; sunfall: on his toes under a sun of spokes -> lifted on the light with the sun full -> hammer driven into the turf, kneeling, columns up either side), each its own windup + release (B16), none borrowing 'sanctify'/'hallowQ'. FX (holy-fx.js): RADIANCE a flat ring running out to r 56 with 16 spokes; SUNFALL five heads of light falling out of the sky with a streak behind, each landing as a column + ring; SMITE keeps palart's column.
5. **VERDICT**: windup (vWind, 3 beats by how far the hold has come: hammer lifted -> stood at the shoulder -> carried up with a halo opening), hold (vHold, 2 frames, halo turning + brighter), release (vRel, the head brought level and pointed at them like a gavel, light leaving it in lines - no swing). **SIGILS** (HFX.sigil): open from a point, gold diamond with a cross, four ticks going round, a dotted plumb line to the foe. **STRIKE COLUMNS** (HFX.verdict): a narrow tall gold column with a white core + a flat sigil ring on the floor.
6. **HEAVEN'S ARC**: new whirl frames (airUp for the maul only: cocked low front -> over the head and behind -> the second pass over the top -> follow-through; the same four beats the timing already has, hit 1 = frame 1, hit 2 = frame 2) + a **golden trail** drawn as TWO crescents (the first pass dimming as the second sweeps wider), white at the leading edge, a mote shed off each head (main.js drawHeavenArc).
7. **PERFECT GUARD HOLY FLASH** (HFX.flash): a four-point star at the aegis (long level + plumb spokes, short diagonals, white heart, a ring running out, motes). **BULWARK ADVANCE**: a 4-frame stride cycle behind the hammer stood upright before him, shoulder leaning in, a leaf of light standing ahead of the haft (key 'bulwark', drawn while P.bulwark).

Tools (not in the suite): tools/paladin3-art-sheet.mjs (every pose key, 3x, + the hammer's eight turns), tools/paladin3-art-shots.mjs (the effects in the real game, strips of crops - hud, aura, smite, radiance, sunfall, verdict, arc, guard, bulwark, throw, swing).

## CHECKS (port 8942, one page at a time) - all GREEN
paladin-kit | ability-poses | skill-icons (76 / 188) | hero-trials (9 heroes) | attack-animation | blow-tags | riposte | settings-tabs | mobile-perf (inside the budget at 4x CPU) | commitment | flip-actions | normal-health | lab-reach (72 pairs) | textfit hints,hud,practice,pick --strict (138 screens, every class 0). paladin-kit re-run after the last FX edit. Nothing weakened; no red.

## normal-health / the Bullfrog (for the PALADIN 3 TUNE lane)
The check's rows (deep/knight, marsh/pyro, longwater/knight) all hold; the paladin is not a row. Run ad hoc on the marsh Bullfrog, level-1 paladin, normal health, the check's seed: **WIN in 17.6 s, 26 of 120 taken** (batch94's integ note: a death, 39 s, 120 of 120 on master). I can NOT attribute that to the reach shrink alone: the art's particles call Math.random(), and the harness seeds Math.random, so ANY art change shifts the RNG stream and the fight - a one-seed row is noise here. The tune lane should measure the paladin over several seeds/foes, not this one. (The three seeds I tried gave the identical run - the harness's own seeding wins - so there is no spread to quote.)

## HONEST GRADE NOTES (B)
Good: the hammer reads as a hammer at game scale (square head, long haft), every Conviction tier has its own body + effect, the HUD pips read as suns, the aura is soft and alive. Not an A: poses are pixel-array pose work on the knight rig (no new body frames), the strike/sunfall columns read pale on a night level (gold edge, pale body) and sunfall stacks with the old judgement pillars (busy), the Verdict wind bar overlaps the halo, the hammer-head is small enough that its shading is 3 tones.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. I also shrank the **dash attack (30 -> 26)**, the held-X box (32 -> 27, unused by Verdict) and the **Heaven's Arc half-width (15 -> 13)** and the bot's LAB_REACH (24 -> 20) with the swing, so every weapon-reach number is consistently ~15% shorter. Rec: keep. Alt: leave the dash / arc at their old reach (only the three ground swings shrink).
2. The war hammer's head is ~35 px of pixels vs ~90 (about 40% the area, ~70% each side). Rec: keep (reads clean). Alt: a 1 px bigger block if it looks small on the card.
3. SUNFALL still plays the old Judgement's tall pillars as well as the new falling heads (kept: they are the damage's read). Rec: keep. Alt: drop the old pillars so only the five falling suns show.
