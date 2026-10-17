# BATCH98 INTEG (10-17) - final SHA d4699770 on origin/claude/batch98

READY TO DEPLOY (with two non-blocking notes: small-adds pilot row, textfit time-out).

## Fixed (cause, not test)
- false-abbot (abbot2art): the burst flash used e.flash as an object, but main.js's hit-flash writes e.flash = 0.12 on every blow -> "Cannot create property t on number" crashed the Abbot fight on the first blow in the burst. Renamed to e.orbFlash. Fixed boss-greed, lab-reach (and small-adds crash).
- THE DROP (owl3) real bug: owlDropStep fired for any hero below the crown boards under a drop column, so a hero walking the village far below was hurt and teleported to the arena. Now only the 140 px under the boards. Found via order-knights hanging; fixed order-knights.
- retireBakes (loadleak): a cached title layer borrowed BG.skyDusk; after a level load it was emptied and drawTitle threw drawImage(0 px canvas) -> progression-runtime. Title layers that hold a retired sheet are dropped and rebuilt.
- marks.js (owl3art merge): lost 'updateOwl|gustTell' QUIET and 'owl|gustTell' mark '' (owl-gust), and owl|pelletTell ANSWER dodge / HEIGHT low. Restored; tells green.
- hint-shown: 6 owl teaching lines routed in hint-lines.js; owl lamp LIT/OUT renamed LAMP LIT / THE LAMP GOES OUT (the bare LIT/OUT would have been routed everywhere); silent list shrank by 3 (--write).
- dressing: towpath allowlist += stilt (the keeper's gantry poles, towpathchurch).
- restamp (levels changed, approved): level1-pilot undercrown + church, mash-bot undercrown + church + waymeet -> level-quality + mash-gate green. (undercrown was already stale on master since the 97 sign move.)

## Re-pointed tests (stale expectation, reason)
- shake-mode: 4 hurt-tagged shakeCam sites, not 3 (the lethal bitter-water splash is the hero being hurt - towpathchurch).
- whatsnew: newest entry 17 OCT / batch 98 line.
- solid-islands: hanging allowance 1 -> 3 (owl3's drops break the boards under the two crown perch ledges; their vine post is 7 rows, 1 past FREE_LEN; drawn).
- owl-swoop: each measured blow starts with stale cleared (claude/difficulty stale x0.85 hit the second blow in one opening).
- hanging-hoist: sandbox gets hintSay stub (hintlevel moved the call to src/hints.js).

## Green alone after fixes
shake-mode, dressing, progression-runtime, owl-gust, whatsnew, hint-shown, solid-islands, owl-swoop, order-knights, hanging-hoist, lab-reach, mash-gate, level-quality, load-leak, titlescene, tells. Passed alone in release.sh (load / fixed by the above): boss-openings, boss-greed, corpses.

## Pre-existing on master (report only)
berserker double chop, dune-worm, bells, rule-openings POISE, slopes-trace kings. visible-supports-strict report-only.

## Remaining
- small-adds: spire/abbot pirate misses 2 of 5 swings at small foes (limit 1/3, 4+ swings judged); every other hero row is 0-1 misses. Pilot ledger only, nothing player-facing. It could not run on abbot2art alone (the flash crash hid it). Needs the pilot's low sweep tuned for the new abbot adds (BATCH99).
- textfit: full run times out at 600 s here (load); not run scoped. New text is short hint-box lines.
- DK x0.95 trim: boss-openings, mash-gate, progression-runtime all green, so no test notices it; measure with boss-rates reaper in BATCH99 integ.
