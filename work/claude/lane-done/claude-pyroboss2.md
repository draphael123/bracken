# claude/pyroboss2 - PYROMANCER BOSS 2 + GOBLIN FIRE MAGE (OPUS, SUN 11-01) - pushed, NOT merged/deployed
Brief: scratch/brief-pyroboss2-firemage-1101.md (Daniel 11-01 09:07 "You can build both"). Branch off origin/master 0fe14c26 + origin/claude/pyrocontrols (7db56663) merged first.
claude/smallfix7 was NOT on origin while I worked: no merge. Overlap = one line in src/fire-spread.js (SPREADERS + 'firemage') and the Burning Village level file (two fire mages + the door sign); smallfix7 touches village-hands.js / fire-spread.js douse visuals - expect a trivial merge.

## PART A - THE PYROMANCER on the new kit (src/pyro-boss.js numbers + main.js updatePyromancer/draw, lab.js bot)
- KEPT: his identity + arena (the square, stalls, hop to your floor, buckets/jug, the heat bar = his meter lighting the square in P1, FIREPROOF, unlocks the Pyro hero, the staff run of three = the hero's X).
- REMOVED: THE BELLOWS, the ember volley, VENT/OVERHEAT, the read-guard ("HE READS YOU"), water = always-stun.
- FLAME WARD (his guard): you swing at him in reach (or a shot flies at him) -> 55/70% (P1/P2) he raises the hero's own dome (pyro-art dome, scaled). A blow into it: CLANK + WARDED, lands at 0.4 (B15, never 0), and scorches you; the last 0.35 s GUTTERS (red fading dome + ebb pose) -> SPENT 1.0 s OPEN x1.5. Water puts a raised ward out -> spent.
- STEPPED FIREBALL: 5 steps on his staff (pyro-art held(): sizes, swell, READY), a step / 0.45 s; mark '!' steps 1-2 (shield takes it), switches to '!!' at step 3 (explodes, r 34/42/54) with a RED RING on the floor where it lands. P1 lets go at 2-3, P2 at 3-5. A blow or water mid-charge = FIZZLED, open 1.5 s.
- PHOENIX RISE: far off (>170 px) -> red !! crouch in rising flame, burning dash to your spot (<=230 px, hurts), landing burst r 40, open 0.7 s as he rises.
- STOKE: meter < 40 and you > 110 px away -> crouched refill (hero stoke pose + crown) = OPEN; a bucket/jug while he stokes = WINDED 3.5 s x2, then his told steam ward 2.5 s at 0.4 (the old 0x steam ward is gone). Water at any other time: meter -40, no stun.
- P2 (<= 50%): THE SQUARE COOLS / HIS MARKS BURN - fireball landings, blasts, wards and Phoenix landings leave burn marks (max 8, 16 s; a bucket puts one out). Full meter -> CONFLAGRATION: red !!, staff up + word, marks pulse white, then every mark erupts (r 18, unblockable); then SPENT 2 s. Full meter with < 2 marks (or P1) -> a READY step-5 ball.
- B10/B15: OPEN/WINDED = gold ring + bar; steam = pale shell; never below 0.4x. Marks/answers/heights in src/marks.js (tells audit green). Bestiary text, door sign ("WATER WHILE HE STOKES WINDS HIM. STRIKE HIS CHARGING FIRE AND IT FIZZLES."), hint lines (PB_SAY) updated.
- Pronoun: the code/game call him HE (bestiary, rule line, signs); the lane prompt said "she" - kept HE for consistency.

## PART B - THE GOBLIN FIRE MAGE (src/fire-mage.js rules, src/fire-mage-hands.js, src/redraw/fire_mage_art.js greybox)
- cnSkin 'firemage' on t 'gobmage' (the proven AI: 90-150 px band, one told cast, a blow in the windup throws it off). Human reskin cnSkin 'cinderacolyte' (same AI, ash hood + ember sash) - carded, voiced, sprited, PLACED NOWHERE.
- FIRE BOLT 'lobTell' (yellow !, staff drawn back, own windup + release frames): lobbed to where you stand; shield/ward takes it. Burning PATCH where it lands (28 px, 5 s, burns heroes and non-mage foes). Spreads ONLY on what burns: in the village it ignites the fire grid (SPREADERS + 'firemage'); elsewhere on GRASSY palettes it runs a tile each way, 3 gens max (her own GRASS CATCHES rule), never indoors/over water; on stone (Kitchen Gate) it stays.
- FLAME WARD POP when rushed (<44 px, coming at him / swinging / rolling): 0.5 s dome, blows turned whole (a foe's guard) + a touch burns you; then SPENT 1.2 s x1.5. 5 s cd.
- DOUSED 3 s (bucket/jug hit, the desert POUR, wading in): steam, DOUSED, no casts/ward, x1.5; relights told.
- Buckets now work outside the village (updateBuckets/drawBuckets + a plain water-butt draw when there is no fire grid).
- Elite: an elite fire mage is named THE EMBER-SHAMAN (THE CINDER PRIOR for the acolyte) - the gobmage elite row is the church's Archdeacon. Poise: the gobmage 'shooter' class. Death: his own skin's corpse (reskinSet). Voice: CAST firemage (goblin) / cinderacolyte (ev).
- PLACED (road order checked on the needs: chain; depth rootway 6 .. crown 21):
  - THE ROOTWAY (TEACH, his first level): alone (squad fireTeach) on the road at 184,31 below the bough's steps, a rain butt + bucket at 177.
  - THE PALISADE WOOD: in the Stake Yard's yardCart pack (184,28).
  - KINGSWOOD: with the Cage Grove's boughPlate crew (230,22).
  - THE KITCHEN GATE: up on the grease pot's racks with the pot squad (built x 331,17).
  - THE BURNING VILLAGE: Long Street at the captive house (192,S) and the barn loft (333,19 - hay).
  - None past the Goblin Queen (tools/fire-mage.mjs asserts it). tools/one-new-foe.mjs: the Rootway's sanctioned new foes now include the mage machine (cnSkin firemage).

## WIN RATES (boss-rates, practiced, profile human, flasks kit, campaign L5)
- Old 1500 hp, new kit: knight 3/5 (+1 page crash), warden 5/5, pyro 6/6 = 88% (n=16) - HIGH. Warden wins in 21-49 s.
- Tune 1 committed (1900 hp, stoke rarer, ward a bit more often): SEE "RATES AFTER TUNE 1" below (filled if the browser hold lifted in time).
- Other heroes (paladin, freebooter, reaper, geomancer, berserker, ranger): NOT MEASURED (machine RAM: memguard killing pages; coordinator BROWSER HOLD from ~14:00).

## CHECKS
GREEN: tools/pyro-duel.mjs (rewritten for the new kit), tools/village-water.mjs (boss part rewritten), tools/fire-mage.mjs (new; static + FM_PAGE game), tools/tells.mjs (+ --write table), tools/blow-tags.mjs (pyroTakes), tools/goblin-lint.mjs, tools/one-new-foe.mjs, tools/elites.mjs, level-quality (rootway/palisade/kings/kitchen/burning: all rows but pilot/mash; burning clears).
NOT RUN / STALE (need the browser): level1-pilot --write --curve + mash-bot --write for rootway, palisadewood, kings, kitchengate (level hashes changed); burning pilot; level-reach for the 5 levels; mark-integrity (burning); textfit (new strings); corpses; the stills (tools/pyroboss2-shots.mjs ready).

## ART LANE NEXT
1. Fire mage + cinder acolyte sheets (greybox grid, 9 frames: idle, walk x2, LOB windup/release, spare, hurt, WARD, DOUSED) - real goblin robe/staff, flame on the tip, a proper cinder acolyte head/hood; bestiary cards.
2. His lob ball + burning patch sprites (patch uses desert drawPatch for now); the mage ward dome (circles now).
3. Boss: a phoenix-rise pose (roll frames now) + flame trail; CONFLAGRATION staff-up pose (blast frame); burn-mark floor scorch art; the red landing ring.
4. The water butt outside the village (plain draw now).

## QUESTIONS FOR DANIEL (built as rec)
1. PHOENIX RISE is a boss-only move - you turned it down for the hero 10-30 ("not fitting") and approved it for the boss 11-01. Keep it boss-only? (rec: yes.)
2. Fire mage patches spread on GRASSY palettes (same rule as her grass) - so in the Rootway/Palisade/Kingswood they creep a few tiles. OK, or only on the village grid? (rec: keep - it is "flammable ground" and it burns out.)
3. His ward turns a blow WHOLE (a common foe's guard) - B15's 0.4 floor is a boss rule. OK? (rec: yes; it lasts 0.5 s and is followed by a 1.2 s helpless window.)
4. Water outside his stoke only drains his meter (no stun) - the stoke is the big water opening per your rec. OK? (rec: yes.)
