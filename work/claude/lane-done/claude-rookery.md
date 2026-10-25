# claude/rookery: THE ROOKERY + THE SHRIEK SISTERS (opus greybox, level + boss)

Base 10d032ea (master, BATCH119). Branch `claude/rookery`, worktree `bracken-rookery`. Not merged, not deployed. Brief: scratch/brief-rookery-1024.md.
I used PORT 6350 (this worktree's block from tools/ports.mjs). I ran one headless Chrome at a time and checked free RAM before each (4.2-5.4 GB free).
My helpers are in work/tmp-rookery/ and are not committed. This is GREYBOX: the art lane follows, and art comes before live.

## What landed
- **src/rookery.js** is the level, laid by hand (416 x 52). **src/rookery-hands.js** is its rule, the roosts, the harpy shrieker, the landmark and the greybox drawing.
- **src/shriek-sisters.js** is the fight, pure, plus the bot plan. **src/shriek-sisters-hands.js** binds it to the world and does the greybox drawing.
- **Road:** GALE MOOR -> THE ROOKERY -> THE SKY ROAD (THE ROC). Its `LEVELS.push(...)` sits under the array (append-only). `skyroad.needs` is now `'rookery'`.
  - Map node at (229,115) on the moor-to-sky-road segment. Map blurb and plate spot added.
- **Old saves:** `progDefaults` migrates once (`PROG.rookeryRoadMig`). A save with Gale Moor or the Sky Road cleared keeps the Sky Road open (`PROG.skyOpen`, a clause in `levelLocked`).
  - The rookery needs only Gale Moor, so a save already past the Roc finds it unlocked as an extra, never as a new requirement.
  - This is the palisade pattern. tools/rookery.mjs proves it over fake PROGs.
- **Rule line (true to the code):** A HARPY'S DIVE BREAKS WHAT IT HITS.
  - A cracked rock is drawn split, limed white and ringed, and the result is ghosted first.
  - It uses the L.hoists shape, so the guide, the reach fill and the pilot bot read it as they read the Rootway and Palisade data.
  - Stand on the mark and its roost's harpy screams, aims (a red dotted line), then dives at the mark. Step off or block, and the rock breaks. She then lies STUNNED IN THE RUBBLE.
  - If she is cut down mid-dive, she still breaks it.
  - If her roost's harpy is dead, the roost sends another after 4.5 s.
  - Any crag harpy's own dive that comes down on a mark breaks it too.
  - What breaks stays for the attempt. A death lays it again.
  - There are four results:
    - **drop:** the floor gives way.
    - **span:** a cracked pillar topples across as a bridge.
    - **nest:** a bone nest's arm goes and the nest drops as a platform.
    - **steps:** a cracked overhang slides down the cliff as steps.
- **THE HARPY SHRIEKER** is the one new foe, its own kind `shrieker` (EHP 14, one hit).
  - She hangs high and screams (red !!, rings), and a red ring marks your spot. Up to three harpies near her dive at the mark, one after another.
  - Stand on a crack and let her mark you: their dives break it for you. After the scream she swoops low.
  - She is classed ranged in level-quality ROLES, because she marks a spot and calls a strike on it, like the slinger's arc.
- **Five named areas.** Each has a banner and a shrine closing its exam (A10c):

| area | cols | arc | contents |
|---|---|---|---|
| THE GUANO LEDGES | 0-106 | TEACH | lone harpy (block her, she is stunned); THE FIRST CRACK, a floor over the only way under a 22-row buttress (REQUIRED, safe); swallows' pocket (silver); exam THE FIRST ROOST, a slab over a 5-row cliff (REQUIRED), harpy + fledgling + crow; shrine 104 |
| THE NEST TERRACES | 106-206 | TEST | THE FIRST NEST over a 10-wide chasm (REQUIRED); egg cache in the pit (silver); THE SHRIEKER taught; THE CRACKED PILLAR (REQUIRED); exam THE EGG LEDGES, a nest under a shrieker, crows, goat (REQUIRED); shrine 203 |
| THE UPDRAFT CHIMNEYS | 206-316 | REMIX + A14 | a timed updraft up a face no jump climbs; the slab baited on a NARROW LEDGE (REQUIRED); THE WIND GAP, rock shelves plus one timed updraft to the high shelf over the gully (a fall is a climb; silver under the updraft), a diver and crows; THE BROKEN SPAN, a pillar under a shrieker (REQUIRED); optional cracked floor into the swallows' cave; shrine 315 |
| THE BONE STAIR | 316-368 | EXAM | troll + shrieker + harpy on the lip; THE LAST NEST (REQUIRED); THE TOP SLAB (REQUIRED); shrine 362 |
| THE SISTERS' CRAG | 368-416 | BOSS | THE SHRIEK SISTERS |

- **Landmark:** THE MONASTERY's roof and bell tower lie far below and behind, sinking as you climb. THE ROC'S PEAK, with her masts, lies ahead and grows (`RKH.drawSky`, greybox silhouettes).
  - The route climbs 36 rows across 10 height bands.
- **Foes:** crag harpies lead, with crows, fledglings, goats, a bat, two trolls and the shrieker. No goblins, and no generic wood: nests are bone and twig.
- **Wiring in main.js:**
  - The RKH hands: reset, update, a harpy hook before her AI, guide props, world, sky and overlay drawing.
  - The shrieker: spawn case, update, frame, corpse, ONE_HIT, FLYERS, AMB_FLY, EHP, COLS, bestiary card, `SPR.shrieker` (tinted harpy).
  - `e.rk` copied on spawn, crack ents as no-ops, TIER 1.11, and the BK accessors `rookery()` and `shriekSistersHands()`.
- **Wiring in other files:** reachcore (cracks count as done), playtest (the pilot stands on the mark like a cleat), stuck-spots (9 required cracks), threat, hint-lines, foe-react (act II), exit-gates, forest-supports (rock), dressing, death-fx, marks, level-quality (GATE, music REPORT_ONLY, ROLES), boss-greed (OPEN_RULE, OWN_WARD), boss-read, boss-rows, check.mjs and check-timings.

## THE SHRIEK SISTERS (header in src/shriek-sisters.js: a puzzle team with the level's rule as its opening)
- **Structure:** three harpies with one bar. The boss is an ANCHOR, the game's one boss, placed out of reach; its health is the three sisters' summed. The three sisters are bodies in the foe list.
  - `hurtEnemy0` hands a sister's blow to `SSH.hit`.
  - The anchor dies through the normal path when the last sister falls, so bossEnd and the rest work as usual.
  - Tier and difficulty HP scaling on the anchor is shared out to the three.
- **Never invulnerable (B15):** on the wing a blow lands at 0.4x (told: ON THE WING). Low (skid, swoop, on the perch, the wave, the snatch) and FROM ABOVE land whole. A dive taken on a shield knocks her DOWN (x1.5).
  - The tool checks every mode of every sister is at least 0.4x. That includes a stun that is already paid out: it now takes WARDED 0.4x, not 1.
- **Opening (B1, the level's verb):** the summit has 3 cracked slabs, and every rock the snatcher drops lies as a cracked stone for 11 s.
  - A dive that comes down on cracked rock breaks it and leaves her STUNNED: x2, capped at 24% of her, 2.6 s, with the gold ring and bar. A told WARD (B3, 2.5 s, 0.4x) follows.
  - The slab is rubble for 9 s (6.5 s once the snatcher is down).
  - The Diver's red line follows you, then LOCKS 0.24 s before she drops. The read is: on a crack, wait for the lock, step off.
- **Five told moves, each with its own windup and release pose (B16, POSE):**
  - **DIVE** (red !!)
  - **SCREAM** (!!): marks your spot. The diver dives at the mark and the snatcher drops on it. The shrieker then swoops low.
  - **ROCK DROP** (!!): a red ring where it lands; the rock then lies cracked.
  - **SNATCH** (!!): a low sweep across the summit after the first fall; jump it.
  - **SHRIEK WAVE** (yellow !): a cone along the floor, once the snatcher is down; jump it or block.
- **Take one out and the others change (B5, one new move per phase):**
  - **Diver down:** the shrieker dives at her own mark and the snatcher dives after each drop, so the opening never goes.
  - **Shrieker down:** dives come in pairs and the snatcher drops two rocks per carry.
  - **Snatcher down:** slabs regrow faster and the shrieker gains the wave.
  - **Last sister:** cooldowns x0.8.
- **No adds.** Music is the generic pool track `boss2`.

## Rates (BOT_PROFILE human, campaign L13, practiced, flasks = the campaign kit, n=12 per hero)
| | knight | warden | pyro | total |
|---|---|---|---|---|
| **with flasks** | 11/12 | 5/12 | 8/12 | **67%, in band** |
| dry (human+dry, n=6) | 3/6 | 1/6 | 3/6 | 39% |
| mash (boss) | 0/2 | 0/2 | 0/2 | **0/6** (boss left 85-89%) |
- **Fight length (wins with flasks):** knight 77-98 s, warden 122-155 s, pyro 88-116 s.
- **Tuning path:**
  - First build: 100%, fights of about 60 s.
  - HP x1.6 and damage up: 100%.
  - Dive 26, rock 24, snatch 26, stun 2.6 s capped at 24%: 75%.
  - HP 920/690/790: 58% (n=8).
  - Final HP 880/660/760: **67%**.
- **Measured at L13:** campaignLevel(rookery) is 13. The Roc's (skyroad) campaign level reads L14, the same as master.

## Checks (single runs on this branch; I did not run the full suite: a release gate was running beside me)
- **Green:**
  - `tools/rookery.mjs` (new, Node, registered). It covers:
    - the road and append, the map node, the rule line, the LQ gate, the 5 areas, the sky drawing;
    - the old-save rule over fake PROGs;
    - the fill reaching every shrine, silver and the sisters; 9 REQUIRED cracks proven LOCKS and the optional cave floor not one; cells land in air, marks sit on footing, roost harpies are placed;
    - the hands in a fake world: bait, aim, dive, break and stun; a harpy cut down mid-dive still breaks it; a dead roost sends another; the shrieker marks and her callers aim at the mark;
    - the sisters, pure: the lock, the stun and its cap, the ward, the skid, knocked down, B15 every mode, the scream and mark, the snatcher's stone, each fall's change, the last sister, the 5 marks, the B16 poses, the bot reading the lock.
  - `tools/rookery-probe.mjs` (new page smoke, registered). Every required crack breaks in the real game; a death keeps them; the shrieker marks and calls 3; the banners; the sisters wake (3 bodies, 1 bar); 0.4x on the wing; a baited dive stuns on a slab and the cut is x2. No page error.
  - **level-quality rookery CLEARS THE BAR.** The music row is REPORT_ONLY (placeholder track) and the blocking row is report-only.
  - solid-islands: 0 left. reach-heroes: **all 9 heroes, 0 crossings**. checkpoint-gaps (DENSE report only, 97-130 route tiles). sprinkle-cap. signs. deadends (8, all paid). threat-holes.
  - one-new-foe (the shrieker is new). map-grammar, map-spacing, map-forks. stuck --static. hint-shown --static.
  - boss-openings, boss-greed, boss-read, boss-fight-end. tells (after `--write`; the sisters' marks are in the BY HAND block). untold-told.
  - textfit bestiary.
  - **mobile-perf at 4x CPU:** rookery 59.9 fps (p95 16.8 ms).
- **Stamps on the final hash:**
  - docs/level1-pilot.json: 3 runs, 41 hits, 4 deaths, walked 100%, 271% hp a run.
  - docs/level1-curve.json: 223% hp a run, 3 deaths in 3.
  - docs/mash-bot.json: the LEVEL rows, where knight, warden and pyro each die (lowest hp 0%), and the BOSS rows at 0/6.
- **Not run:**
  - The full suite.
  - The walker (`level-walk`): I spent the budget on the boss band.
  - corpses, floaters, boss-jump, boss-select.

## REDS
- **textfit levelcard timed out twice** (480 s and 1500 s), in the scope that loads all 65 levels in one evaluate. The rookery alone loads and steps 40 frames in 1.6 s (moor 1.3 s, skyroad 2.2 s), and the bestiary scope passes.
  - I read this as the machine being loaded by the release gate, not a rookery hang. Re-run it in the integ run.
- **Hero spread with flasks:** knight 11/12, warden 5/12. The knight bot blocks the dive (she is knocked down, x1.5) and kills fast. Warden fights run long (up to 155 s, over the 150 target).
- **Level-1 curve is 223% hp a run, 3 deaths in 3.** That is high for a fresh L1 knight, but this is an act II level (the pilot lifts the bot 70 times, mostly at the dives).
- **tools/fixtures/campaign-xp.json has no rookery row.** I did not run `node tools/boss-level.mjs --write-xp`, because it rewrites every row from the page. The Sky Road's level reads L14 as on master either way. Re-run it at the integ.
- **Expected merge friction with BATCH120 (palisadewood):** the same shared lines (levelLocked clause, spawn `e.pw` / `e.rk`, the KWH update/draw chains, the PLAN_CLOCKS, BOSS_T, POISE_SKIP and KNOCK_SKIP heads, TIER, check-timings).
  - Resolve all of them by keeping both.
- **The stills of the area shots are greybox** (the summit shots were re-taken after the shelf fix). The rookery ambient bed is the shared crag `wind`, not its own.

## STILLS (greybox, god-mode knight; no "before": the level is new)
These are in work/claude/lane-done/, 640x360.
- **The level:** `rookery-{ledges, first-floor, first-floor-aim, first-floor-after, first-roost, first-roost-after, first-nest, first-nest-after, shrieker, first-pillar, first-pillar-after, egg-ledges, chimney, ledge-slab, ledge-slab-after, wind-gap, broken-span, bone-stair, top-slab, top-slab-after}.png`
- **The boss:** `rookery-sis-{diveTell, diveLock, dive, stuck, screamTell, scream, swoop, waveTell, wave, pick, carry, dropTell, snatchTell, snatch}.png`
- The tool is tools/rookery-shots.mjs.

## ART NOTES (sonnet art lane; nothing here changes the level hash)
- **src/rookery-hands.js** is greybox. It draws:
  - the mark: the limed split, the ring and the result ghost;
  - the cracked pillar and its fallen bridge; the bone nest on its cracked arm, and the dropped platform; the slab and its steps; the drop's rubble;
  - the roosts, the egg nests, the dive lines, the shrieker's mark and crest, the banner;
  - `drawSky`, the monastery and the Roc's peak.
- **The wind-gap shelves and the summit shelves are one-way rock ledges.** Draw them as wind-cut stone jutting off pillars; forest-supports' rock kit puts piers under them.
- **src/shriek-sisters-hands.js:** POSE is the contract, and each mode has its own windup and release. It draws:
  - drawSister in each role's colour (Diver slate, Shrieker blood-red crest, Snatcher brown with a rock);
  - the slabs (cracked, rubble, regrowing), the stones, the falling rocks and their rings, the marks, the waves, the aim lines (dotted, then solid at the LOCK);
  - `bakeShriekSistersCard`.
- **Still wanted:** the level's own tile kit (guano-white ledges, wind-scoured strata), its own ambient bed, a CC0/CC-BY track and a boss track.

## QUESTIONS FOR DANIEL (rec + what I built)
1. **Where on the road?**
   - Rec, built: **Gale Moor -> THE ROOKERY -> the Sky Road (the Roc)**, so the level directly precedes the Roc's level, as "right before THE ROC" needs. The monastery is the landmark behind and below.
   - Alternative: Hanging Village -> Rookery -> Monastery, the literal "climb to the monastery". But the next boss would then be the False Abbot, not the Roc.
2. **The bait:** stand on the mark and she aims at the MARK, so stepping off still breaks the rock.
   - Rec, built: as described. A dive into you (not blocked) on the mark also breaks it, so bots and new players are never locked out.
   - A strict version (the rock breaks only if you dodged or blocked) is one line.
3. **The shrieker is a separate foe kind (`shrieker`)**, classed ranged in level-quality, so F10 counts her as new.
   - Rec: keep. Her scream is a marked strike at range, like the slinger's arc.
4. **Hero spread** (knight 11/12, warden 5/12, pyro 8/12; total 67%).
   - Rec: accept for the greybox and re-check after art. The lever, if wanted: the knocked-down x1.5 off a shield block is what lets the knight run away with it.
5. **Music:** the placeholder is Gale Moor's `northumberland` (REPORT_ONLY) with `boss2` in the arena.
   - Rec: a CC0 high-crag track plus a shrill string or choir boss track from the candidates lane.
6. **No mini** (416 columns). Rec: none.
