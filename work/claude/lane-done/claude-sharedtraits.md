# sharedtraits - READY (node-checked, dark behind TRAITS_SHIP=false) branch claude/sharedtraits off claude/traitframe f00464b6c
## Built
- Region ids VERIFIED against src/level.js LEVELS: stockade, kings, spire, moor, fields are real; the Mage's Folly id is `mage` ('folly' was a guess; fixed in SHARED_TRAITS). Unlock = first clear by ANY hero (PROG.done[h][levelId]), account-wide.
- Map: AIR ROLL=stockade, LIGHT STEP=kings, MOMENTUM=moor, HANGING CUT=spire, SLIPSTREAM(airDash)=fields, EXECUTIONER(execute)=mage. legacy rows: airRoll pirate:'swash', execute reaper:'winnow'.
- main.js (flag-on paths; flag off is the old line byte for byte in effect): tal() already routes a shared id to worn+unlocked for any hero, so airRoll/airDash/lightStep/momentum/hangCut had no hero test left (the air dodge, hang, sprint streak and dodge cost are generic). EXECUTIONER site: flag on = any hero's heavy/finisher (heavySwing or charged heavy), commons + elites, never a boss or a mini; flag off = knight line (not pyro/paladin) unchanged. Reaper winnow and pirate swash stay off under the flag (they ride the shared rows; swash -> AIR ROLL, winnow -> EXECUTIONER).
- Rank (trk) on the ONE number: momentum bonus, light step shave, air roll lift, execute reach on the finisher. HANGING CUT and SLIPSTREAM are booleans (no number; same at every rank).
- tools/traits.mjs: 6 rows x region id vs level.js text, account-wide + own-region-only unlock, every split hero can wear each, no shared id is ever a default (sidegrade rule), slot 2 needs L20, legacy ids exist, swash/winnow off under the flag, rank 0.7/0.85/1 on any hero, source asserts for the EXECUTIONER line and trk reads.
## Checks (node only): traits, talents, hero-ledger, progression (36 fixtures), coop-progress, architecture ok; node --check main.js traits.js. NOT run: check.mjs, any browser, textfit, boss-rates.
## Owed
1. After traitdata-a/b merge, re-run traits.mjs: its hero loops then cover all 9 heroes (only knight is split on this branch). Merge conflict risk: SHARED_TRAITS legacy lines in traits.js (b may add none) and four one-line edits in main.js.
2. Browser (later gate): pirate/reaper/warden air roll + executioner feel with ?traits=airRoll,execute on a cleared account; EXECUTION text on non-knights.
3. Tune: tune lane to check no hero's best pair is two shared traits (assert covers defaults only).
## Questions (rec first)
1. EXECUTIONER via charged heavy as well as the 3rd cut for non-knights? REC yes (a Blood Knight/Ranger has no 'heavySwing' finisher otherwise).
2. Duplicate layer: LIGHT STEP vs FLEET perk vs LEAN ROLL threshold stack? REC leave (trait = sidegrade; perks stay numbers); trait is rank-scaled so I/II are weaker.
3. Existing knights lose their old airRoll etc. when the flag flips until they wear them (defaults vengeance/bash). REC accept + the CHOOSE YOUR TRAITS banner.
