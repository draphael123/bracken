# BATCH97 INTEG (10-17) - final SHA 5aa1decd on origin/claude/batch97 (leakfix 74bc7014 merged first, tooling only)

NOT READY because: boss-fight-end and no-hidden-hits (~50 min each) were NOT rerun, corpses (tools/corpses.mjs) times out at 600 s on this PC (each level passes alone), and textfit "plates" still times out here. Everything else below is green alone.

## Fixed (game or tool, with reason)
- check.mjs (leakfix bug): the RSS sampler child kept check.mjs alive forever after its last line -> sampler.unref(). Every rerun hung until killed.
- talents: paladin/warded had no consumer (PALADIN 4's Light-ward is all-round). Re-pointed per the paladin4 report's rec: WARDED = Sanctuary Step patch lasts 3.5 s not 2 (main.js + catalog desc).
- arena-supplies: undercrown/prince 'up 48' guard is the no-safe-perch punish, only fires on dropped tomb slabs (dynamic ground the flood cannot see). Narrow reasoned exemption in the tool (prince + slabs only).
- hint-shown: 16 short words added to MOVE_WORDS (hero-pass/ranger feats, DAWNFALL, UNDER IT), 9 Undercrown boss lines routed in src/hint-lines.js, silent list --write.
- signs: 6 trial-yard signs shortened to 2 lines. pixels: undercrown sign 84->83 (clipped the wall), church chantry sign 185->184 (touched the choir stall boards); pixels is clean on master so both were ours.
- architecture: church chantry hall declared down to its trough row + the sacristy passage declared as a hall (src/lit-church.js); roof/floor no longer "in the air". Green on master, so ours.
- modulepreload --write. minecart tool: CRAG_PATH now an expression (UC_ROAD splice). ore-road tool: Highcrown needs Undercrown when it is on the road.
- crouch-hint: paladin's own PRAYER teach (crouch-b.js) now pre-empts the first-crouch line by design; test accepts it (told 0, flag 1, msg PRAYER:).
- geomancer: gShrug (hero-pass art, 2 frames) added to the frame baseline.
- crouch-feet: war hammer haft butt ran 5 rows under the boots in the paladin kneel -> knightFrame butt param (kneel butt 3).
- store: golden stock re-baselined: paladin feat 'boss:church' (church2: hero opens after the Paladin) - approved design.
- rootway-probe THE HIT CAP, village-water (bucket choice, ward step), weak-bosses (lunge roll): stale expectations after claude/difficulty (stale blows x0.85, break bar leaks) and HERO PASS A (one dodge: knight step inv 0.14 s) - tests start each measured blow clean / dodge as the lunge arrives. Not weakened.
- textfit: glasssea 'TO THE SKY' / 'TURN THE MIRROR TO HIM' - gradient fillRect glows were recorded as plates; textfit now ignores non-flat fills (flat colours still record). church 'LIGHT' +6: label clamped over the reredos panel, above the bar at the edge. paladin controls row shortened ('SUN 5'). soundtest #108 credit shortened. Scoped textfit (boss, settings, soundtest, menu, pick, tree, card, hud, glasssea+church plates) = 0 issues.

## Pre-existing (fail identically on master 7ade0605) - report only
dune-worm (stun 26 not 28), bells (undercrown 'works' sentry never rings), rule-openings POISE {0,0,0}, slopes-trace kings frame 715, berserker double chop 57.6 < 60. owl-swoop passes alone (flake). weak-bosses flaked once on master (page never up), passes there.

## Not rerun / remaining
- boss-fight-end, no-hidden-hits: not rerun (50 min each, PC shared). profile-leaks: flake, not rerun.
- corpses: 7 levels checked alone (undercrown, sealedpyramid, buriedcity, flotilla, lamplit, rootway ok); full run exceeds 600 s on this PC: batch97 loads are slow (loadleak fix is in BATCH98). Recommend merging loadleak before the suite or rerunning on a quiet PC.
- textfit "plates"/"talk" full scopes time out under load (report-only). Church plate/glasssea fixes verified by scoped run.
- visible-supports-strict: report-only. architecture/pixels/hint-shown/talents/signs/crouch-hint/geomancer/arena-supplies/ore-road/minecart/lit-church/solid-islands/floaters/hero-trials/progression/skill-icons/crouch-feet/store/village-water/rootway-probe/weak-bosses green alone.
- memguard killed 2 test browsers 09:01/09:07 during parallel reruns (mine + others); no check was lost to it, no real leak found.

## Recommendation (no wait)
Merge loadleak into the batch before deploy (corpses time, plates). Daniel: WARDED now lengthens the Sanctuary Step light patch - change if you want a different perk.
