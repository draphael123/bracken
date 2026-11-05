# claude/harpypass - ROOKERY HARPY PASS (opus, 11-05 ~07:50 ->). Branch off master 42a1d4cd. Pushed, NOT merged, NOT deployed.
Daniel's line: priority-1016 '!! 11-02 21:49 / 21:51' + '!! 11-05 07:44' (pulled forward), and the sisters notes '!! 11-01 17:23' / '11-02 21:49'.

## 1. DESIGN PLAN
**What already existed.** `src/gale-harpy.js` (the GALE HARPY, rookery2): she holds a perch and beats a **cone** that shoves whatever stands in it; a blow in her tell breaks the gust. It already covered "a harpy that pushes you". The GUST HARPY is **new behaviour in the same shared file**: what's new is listed below. CATCH A RIDE (rookery2) needed a harpy to **dive, be blocked or dodged, lie downed, and then lift** before you could grab her talons. That's the "awkward" part Daniel named, and the CARRIER HARPY replaces it.

**THE GUST HARPY** (new: `GUST`, `gustStep`, `drawBlasts`, `gustFrame` in src/gale-harpy.js; foe kind `gustharpy`)
- She hovers on a short beat (±18 px). She keeps her **lane about a jump over your feet**: 22 px over them, and never more than 30 px off her home.
- **Tell** (0.62 s, MEDIUM): wings raised, a yellow `!`, a dashed gold lane with chevrons, her whistle. She can be hit during it.
- **Blast**: a crescent of wind that **travels** along the lane (150 px/s, 1.35 s). It does **no damage**; it only pushes:
  - **in the air**: thrown 245 px/s along it, which knocks you off the line of your jump;
  - **on your feet**: you only lean (x0.25);
  - **guard up**: you brace (x0.4, in the air too).
- One blast alive at a time. She never blasts in a dive's window.
- **Knock her down to stop her**: any blow knocks her **out of the air** (melee, jump strike, arrow, bolt, fireball, hook), whether she is hovering, telling, clapping or climbing back. She tumbles to the footing under her and lies **grounded 5.5 s**, so you cross then. Then she climbs back (1.4 s). HP 22 (two blows). Knocked over a void, she is gone.
- **Turn it back**: your perfect guard (`rpAnswerUp`, the per-hero perfect answer) reverses the blast. If it reaches her, she is knocked down.
- **Counters, every hero**:
  - All 9 heroes can (a) wait on their feet, since grounded heroes only lean, and (b) turn the blast back with their perfect guard. tools/harpypass.mjs asserts that `rpAnswerUp` covers all 9: Knight perfect block, Paladin aegis tap, Pirate hook catch, Warden deflect tap, Berserker/Ranger on the beat, Pyro flame-ward perfect, Geomancer ward perfect, Reaper ward on the beat.
  - Ranged heroes (Warden's arrows, Pyro's fire, Geomancer's stones, Pirate's hook) knock her down from range.
  - Melee heroes do it with a jump strike: her lane sits a jump over their feet.
- She runs **anywhere**: main.js `gustWorld()` drives her outside the Rookery (Gale Moor, the Sky Road), and her blast is drawn anywhere.

**THE CARRIER HARPY** (new shared module `src/carrier-harpy.js`)
- She **sits on her perch** (the ride's mount), wings folded, with a gold "saddle glint". When a hero is near, gold brackets and `JUMP ON` appear.
- **Jump on her back** (falling onto her), or press **UP** beside her (same key as the old grab), and she flies her fixed, feather-trailed path with you **standing on her back**. At the landing ring she **sets you down**, then flies home empty (1.35x faster) and sits again (0.6 s rest).
- **JUMP lets go** mid-flight, and she turns home from there.
- No dive, no knock-down first. A blow only **startles** her: she flaps up for 0.6 s and settles. She never dies of it; if something kills her outright, the roost still sends another.
- The gale's gust and the gust harpy's blast still shove her off line, and she springs back. A crag harpy's dive that finds the rider still knocks him off.
- **Every Rookery ride (six) is a carrier now.** Same mount, path and landing, so reach and route are unchanged.

**THE SISTERS REWORK** (the mechanical half of Daniel's 11-01 17:23 list; the redraw is the art lane's)
1. **The nests hatch.** A nest still **hanging** on its arm hatches a harpy chick: a **ROC FLEDGLING**, the Rookery's existing small weak foe, so hit, death, bestiary and art come for free.
   - The egg **rocks in the nest** for 1.4 s first (greybox egg with a growing crack, a yellow `!`, and the first one says `A NEST HATCHES: KNOCK IT DOWN TO STOP IT`).
   - First egg 10 s after the wake, then every 15 s, **max 1 chick alive** (built as 8 / 11 / cap 2, cut after the bossLab: see 3).
   - A nest **knocked down** never hatches again, so the main opening is now also the way to stop the adds. An egg whose nest falls mid-rock is lost.
   - The chicks are removed when the fight ends.
2. **The yellow projectile (the Shrieker's SHRIEK WAVE): 25% slower and a longer tell.**
   - Speed 230 -> 172 px/s.
   - Tell 0.7 -> 1.0 s, so its tempo class goes MEDIUM -> **HEAVY**. The Shrieker still has one heavy, one medium and one light move.
   - Life 1.8 -> 2.4 s, so it still runs 414 px.
3. **The harpy-woman redraw**, bigger sprites and the shriek pose: **owed to the art lane** (below).
4. I did **not** add a carrier perch inside the arena. The overhang steps and the vents already lead to the Shrieker's perch, and a third free way up would make the cornered opening cheap. See Q3.

## 2. BUILT (files)
- `src/gale-harpy.js`: + the GUST HARPY.
- `src/carrier-harpy.js`: NEW, the CARRIER HARPY.
- `src/rookery-hands.js`: rides become carriers: perch, board by landing, `tryGrab` = UP beside her, the rider on her back, let go turns her home, gust shoves her off line. Also routes and draws the gust harpy (`gustW`), and the shrieker never calls a carrier to dive.
- `src/rookery.js`: two **gust harpies**, each replacing a crow:
  - THE WIND GAP, col 277 (taught: sign at 248, where a fall is a climb);
  - THE GALE SPIRES, col 376 (with the gale harpy ahead; the gorge updrafts lift a fall back).
  - First-ride sign changed to "A CARRIER HARPY SITS BY THE FACE. JUMP ON HER BACK: SHE FLIES YOU UP."
- `src/main.js`: gustharpy spawn case, HP, sprite, bestiary card, flyer/hurt/death sets, `gustWorld` + `updateHarpy` routing outside the Rookery, frame, blast draw, Rookery ctx `guarding` / `answering`, SSH ctx `enemies` / `spawnFoe`.
- `src/shriek-sisters.js`: `SS.chick`, `stepHatch`, `SS.wave`, the egg line.
- `src/shriek-sisters-hands.js`: hatch / chicks world, the rocking egg drawn, chicks cleared on end.
- `src/marks.js`:
  - tables for `gustharpy|gustTell` (`!`, block, high) and `|aim`;
  - `waveTell` -> heavy;
  - `tells --write`.
- Registration tables: `src/threat.js`, `src/told-attacks.js`, `src/death-fx.js`, `src/audio.js`, `src/hint-lines.js`.
- `src/redraw/rookery_foes.js`: `bakeGustHarpy` (greybox storm-blue harpy).
- `src/playtest.js`: the pilot bot walks to a sitting carrier and presses UP.
- `tools/harpypass.mjs` (NEW): gust + carrier pure checks, wiring, placement, every hero's answer.
- `tools/rookery.mjs`:
  - ride checks rewritten for the carrier;
  - gust in the Rookery's hands;
  - hatch and wave checks.
- `tools/rookery-probe.mjs`: the page ride probe is now carrier-style.
- New filenames `carrier-harpy.js` and `harpypass.mjs` checked against the ad-block patterns (none of ad/admiral/banner/track/pixel/analytics).

## 3. RESULTS
- Node checks, each run alone, all green:
  - `tools/harpypass.mjs` (42 ok);
  - `tools/rookery.mjs` (243 ok, 0 FAIL, incl. the single-hunter, support-overlap and tempo-band asserts);
  - `tools/tells.mjs` (after `--write`), `tools/untold-told.mjs`, `tools/boss-read.mjs`;
  - `tools/anchor-lint.mjs` (rookery gated ok), `tools/herofeel-rookery.mjs` (no softlock pocket), `tools/gale-stair.mjs`, `tools/sprinkle-cap.mjs`;
  - `tools/platforming-lint.mjs --where rookery`: still **2 sections**; the Gale Spires one still counts with the gust harpy in it.
- `tools/level-quality.mjs rookery`: every metric ok **except the pilot / mash stamps** (the level hash changed). Restamp owed below.
- **Page smoke** `tools/rookery-probe.mjs`: all ok.
  - All six rides in the real game: perch > carry > home, set down on the land.
  - The hung nest is broken by the carrier's flight.
  - Every cracked rock, the shrieker, the gale harpy, and the sisters' wake / stun / 0.4x all pass. No page error.
- **Sisters bossLab n=6** (`boss-rates.mjs rookery --ways=practiced --seeds=2`, profile human, kit flasks, L14), as built with **chicks cap 2 / every 11 s**: **0/6 (0% [0-39]) LOW**.
  - The bot died at 85-147 s with the sisters at 1-66% left; it took 250-268 each fight.
  - The 11-01 rookery4tune final (n=24/hero, same tool and profile) read **68%**, with deaths ~136 s and wins at 160-215 s. So the bot now dies ~30-50 s sooner.
  - Most likely cause: **the chicks**. Two fledglings peck for 10 each, and the boss bot does not swat adds. The slower wave only comes after the Snatcher falls, so it should not have mattered.
  - Not proven: no master baseline was run, because of the browser cap. Bot changes since 11-01 (botbuilt / botstats 11-03) are the other suspect.
  - **What I changed after the run:** chicks cut to **cap 1, first 10 s, every 15 s**. This is UNMEASURED.
  - **The tune lane must:** (1) run master n=6 as a baseline, (2) run this branch, (3) teach the boss bot to swat a chick (or give chicks a lower peck), then tune to 60-70% with flasks.

## 4. OWED
- **ART (sonnet):**
  - the GUST HARPY's own sheet: storm-blue, wings-up tell, clap, knocked-down and grounded flapping, and a proper blast crescent;
  - the CARRIER HARPY's sitting pose (wings folded, saddle-worn back, a rider on her back) plus her flight-with-rider pose; she wears the crag-harpy frames now;
  - the rocking egg and the hatch;
  - the **harpy-women redraw of the three Sisters** (Daniel 11-01 #3);
  - bestiary card art for the gust harpy.
  - Art before live.
- **TUNE (sonnet):** sisters 60-70% WITH flasks, rerun after the chicks and the slower wave. The chicks add pressure and the slower wave removes some; n=6 here is a sanity read, not a tune. Gust harpy numbers (push 245, down 5.5 s, cd 2.9) want a human feel pass.
- **Restamps:** `node tools/level1-pilot.mjs rookery --write --curve` and `node tools/mash-bot.mjs rookery --level rookery --write`. Both are browser runs, kept off this lane by the brief's browser cap. Do them at integ or in the tune lane.
- **Not run:**
  - an in-page gust-harpy check (it is only checked in Node: pure plus the Rookery's hands with a fake world);
  - `tools/corpses.mjs` (ran to its 300 s timeout without printing a verdict: inconclusive);
  - `reach-heroes` (no tiles changed);
  - mark-integrity (the rookery4tune note says it can't see the sisters).
- **Reuse:** gust harpies in Gale Moor and the Sky Road (Daniel's list) are NOT placed. The module and `gustWorld` are ready: `ent('gustharpy', x, y, {perch:true})` in the level file. Carriers outside the Rookery need a level's hands to call carryStep, which the Rookery's do; the Sky Road would want a small binding.

## 5. QUESTIONS (rec first; built as rec)
1. **Every Rookery ride becomes a sitting carrier (REC, built)**, or keep the dive-then-grab ride somewhere as a harder variant? Rec: all carriers. The dive-first ride was the awkward part.
2. **Gust harpy: knocked down = grounded 5.5 s, then she flies back (REC, built)**, or knocked down = dead? Rec: 5.5 s; two blows still kill her.
3. **A perched carrier in the Sisters' arena** to the Shrieker's perch? Rec **no** (built: no). The overhang steps and the post-Snatcher vents already go there, and a free lift would cheapen the cornered opening.
4. **"Burn a nest"**: the nests stop hatching only when **knocked down** (the arm-break opening). Rec: keep that as the one way (built); a pyro-burn rule can come with the redraw if wanted.
5. **Shriek wave HEAVY at 1.0 s (REC, built)**, or keep it MEDIUM at 0.76 s, the band top (only ~9% longer)? Rec heavy: it is the move Daniel named.
7. **Chick numbers**: rec **cap 1, every 15 s** (now set, unmeasured) and the tune lane decides. Alternative: cap 2 as Daniel's note said, with the sisters' HP trimmed to pay for it.
6. **Wind Gap and Gale Spires crows -> gust harpies (REC, built)**, or add them on top of the crows? Rec replace: the same foe count, the new threat.
