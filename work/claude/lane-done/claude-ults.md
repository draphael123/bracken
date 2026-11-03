# claude/ults - STARTER ULTIMATES (11-01): one input, three ultimates
Branch claude/ults = origin/master 0fe14c26 + skillslots + knightid + geoid + rangerid (NOT wardenid, NOT pyrokit2). Not merged, not deployed.
STATUS: code + static checks done. BROWSER CHECKS NOT RUN (coordinator BROWSER-HOLD.flag, RAM) - see CHECKS.

## Merge conflicts (kept every side)
src/main.js: GEO_LIFE0 line (geoid's GEO_K.stone.gnaw + HEAD's cdOf/amul with the knight upgrades); trialName/fillMeter (HEAD's knight links + geoid's board fill); DUEL_HERO/LP_HERO/CAP_HERO (HEAD's 1.0 rows, geomancer 1.0, ranger rows removed);
third-cut swingMul (HEAD's knight riders + geoid's GEO_K.fist.mul); hint line (shield bash + stone fist + push kick); HERO_LOOP ranger (rangerid) / geomancer (mine); heroCut (knight rider + RGK.kickHit).
src/bzchief.js heroHp/Dmg (knight 1, geomancer 1.0, ranger 1), flotilla-boss TUNE (knight 1/1, geomancer 1/1, ranger 1/1), admirals-champion TUNE (ranger 1/1), controls.js third-cut row (shield bash / stone fist / push kick).

## The shared piece (hero-agnostic)
- src/ultimate.js: registry `ultRegister(hero,{name,ready,fire})`, `ultCue`, static `ULT_NAMES` / `ultRow` for the cards. A hero's lane adds ONE entry in ULT_NAMES + ONE ultRegister line (main.js, next to lastCharge) - Warden's Reach and Meteor Fall drop in with nothing else.
- main.js updatePlayer: ONE dispatcher before the hero C blocks: C pressed with UP held, hero registered, frame free (not stunned/dodging/attacking/plunging/thrown/rushing/drawing) and ready -> fires; it eats the C press for that frame (P.cWas) and the held C until released (P.ultHold: no ward/guard/shield rides on it). Heroes with no ult (or not ready) fall through to their own UP+C (Paladin hammer throw, Berserker axe throw, knight shield bash below 3 links).
- Shared HUD cue "ULT READY: UP+C" (hudMeterLabel, first, for every registered hero). Controls card / keys sheet: ONE row "ultimate  UP+C: <NAME>" for every hero that has one (ultRow); the per-hero 3-links/topple/mark rows are gone. Hero cards, loop lines, trial yard lines, tutorial hint, passives and catalog descs reworded.
- Bots: lab.js ULT_BOT (geomancer: full board, foe within 220; ranger: full Focus, foe 50-300 in line, not in a tell) + the knight's charge press now sends UP+C.

## KNIGHT
SHIELD CHARGE moved from tap C to UP+C at 3 links (the riposte FINISHER choice untouched; a plain tap of C at 3 links does nothing special now; UP+C below 3 links is still the shield bash). In the air at 3 links UP+C says "NEEDS FOOTING" once.

## GEOMANCER - AVALANCHE (replaces Topple; the 2.5 s cheap topple is REMOVED)
- Ready at a FULL board = cap stones standing (3; 4 with FOURTH STONE). No cooldown: the cost is the stones.
- Each stone ERUPTS where it stands (0.5 s pillar, drawn rising from a ground crack): the common foe in its column (+-22 px) is thrown up (vy -380, stagger 0.7) and hit for swordDmg x0.9; a boss/mini in it takes x0.9 and 0.3 s stagger.
- Then each stone ROLLS away from her as a boulder (230 px/s, 3.8 s, r 9, one wall bounce), bowling common foes over (x2.0, pierces them) and hitting a BOSS / MINI for swordDmg x3.0 PER STONE (x4.5 with THE WIDE QUAKE) + 0.7 s stagger + shake, the boulder ending on it. Stones consumed, board rebuilt by hand.
- Passives rewired: RUMBLE = boulders roll half as far again (was topple cd -1 s); THE WIDE QUAKE = boulders hit half again as hard (unchanged). fillBoard (trial yard) now fills to the cap.
- Bosses: 3 stones on a boss = ~9x swordDmg boulders + ~2.7x eruption ~ 12x total in ~2 s. Tune lane to adjust GEO.avalanche.boss / erupt.

## RANGER - GREAT ARROW
- UP+C at a FULL Focus on the ground: ~0.5 s rooted draw (only she is rooted; no world slow; a hit, a swing or leaving the ground breaks it and KEEPS the Focus), then a huge gold arrow flies a screen width (320 px = the view width), 900 px/s, pierces everything in its line, stops at a wall.
- Damage grows with distance flown: swordDmg x2.0 at her feet -> x4.5 at the far edge; a boss/mini x1.5 on top and staggered 1.0 s (mini 0.8 s) + poise lean + hit-stop; common foes staggered 0.8 and shoved. Focus spent as it leaves; free arrow (not picked up).
- HUNTER'S MARK new home (rec taken, folded away): a STEADY SHOT that lands MARKS its quarry for 5 s (x1.33 on every blow; techniques LONG MARK / APEX still apply). No new input, no new skill slot. The old "FOCUS n%: sweet-spot hits fill it" line stays on UP+C below full.
- Art: chars.js rgGreat (3-beat rooted draw, shaft lengthens, head burns brighter) + rgGreatLoose (draw hand flung back, gold streak), poses in hero-poses.js; a long gold shaft + white-hot head + bright trail drawn in ranger.js render.

## Art notes (greybox, art lane to redraw)
Geomancer: pillar = the existing stone spike (drawSpike) + ground crack + amber rune; boulder = existing drawBoulder; wants a chunkier eruption (rubble spray, 3-frame rise) and a lit boulder trail. Ranger: the rgGreat frames are KF pixel bits like her other draws; the arrow is code-drawn. Knight: no new art (reuses the charge).

## CHECKS
Static (run): node --check on every touched file; tools/progression.mjs (save migration, 181 nodes) GREEN; tools/tech-cards.mjs GREEN; tools/keys.mjs GREEN.
Browser checks NOT RUN - coordinator BROWSER-HOLD.flag (RAM 0.3-0.9 GB). Tools UPDATED and ready for the gate: tools/knight-chain.mjs (UP+C charge, tap C at 3 does nothing), tools/geo-board.mjs (3 stones erupt+roll, 2 stones nothing), tools/ranger.mjs (great arrow rooted/through three/focus spent/broken-keeps-focus; mark via steady/set), tools/hero-trials.mjs (meter stations press UP+C), tools/skill-passives.mjs (RUMBLE). OWED: those four + geomancer.mjs, textfit (pick,menu,hints,hud,trial + controls card), a 2-boss sanity per hero (Old Tusker + Hornet Queen), mark-integrity, co-op. Risks to look at first: textfit on the longer hero-card strings (geo/ranger descs), ranger.mjs 'great' damage ordering with dummies, geo-board timing of erupt->roll.

## QUESTIONS FOR DANIEL (built as recommended)
1. Geomancer AVALANCHE boss hit x3.0 per stone (~12x for three) - REC keep, the tune lane trims.
2. Ranger mark folded into the STEADY SHOT (5 s) rather than a cooldown skill - REC keep (no new input).
3. A plain tap of C at 3 links no longer charges the knight - REC keep (one clear input).
4. Great Arrow breaks if she is hit mid-draw (Focus kept) - REC keep; 0.5 s root is the only price.
