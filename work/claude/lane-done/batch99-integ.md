# BATCH99 INTEG (10-18) - final SHA 169eeb83 on origin/claude/batch99

READY TO DEPLOY (non-blocking: small-adds pilot row, one random-spread flake in archmage-folly).

## Fixed (cause, not test)
- blow-tags: main.js hurtEnemy0 called tollHurt(e, dmg, fromX, blow) without the blow tag; now passes tag (function takes it).
- dangling-paths: tools/lamplit2-art.mjs and lamplit2-world-sheet.mjs cite docs/lamplit2-art.png / lamplit2-world.png that were never committed; regenerated with the tools and committed.
- hint-shown: 16 new number() lines from lamplit2 (toll, oil, wax, air, flare) routed in src/hint-lines.js; 2 routed lines follyfix deleted (THE BOOK TURNS: CUT HIM, THE ROD: JUMP) removed; silent list shrank by 8 (--write).
- mash-gate: restamped mage (level mode, then boss/mini mode) after follyfix's exit gate; lamplit was already current.
## Re-pointed tests (stated)
- archmage-folly: reseal expectations 6 s / 4 s are now x ARCH_TUNE.knight.reseal (1.25: measured 7.22 / 4.72; the test plays the knight), and the wait for the reseal scales the same. Reason: follyfix's per-hero ARCH_TUNE (approved design).
- lit-church: TRACK_INTRO regex no longer assumes litchurch is the first key (master's kraken now leads the table); same three values asserted.

## Pre-existing on master (report only)
berserker, dune-worm, bells, rule-openings, slopes-trace (kings). visible-supports-strict report-only.

## Remaining / flake
- small-adds: spire/abbot pirate 2 of 5 swings missed (limit 1/3, 4+ judged). Not fixed: needs the pirate's low sweep tuned for the abbot adds in the pilot; bot ledger only.
- archmage-folly "the spots are spread across the room": blink spot choice uses Math.random (archBlinkTell), 10 draws sometimes span 278 px < 300. Failed 1 run in ~4 here; code and test unchanged by the batch. Flake; a seeded draw in the test would fix it.
- tollHurt vs master tollmaster multipliers, prince hp 2550 / tollmaster hp 2850: no check red.

## Measurements
- PYRO on Mage's Folly (row `mage`, hp 1.55, 12 seeds, flasks kit, L33): 7/12 = 58% (wins 100-199 s). hp 2.0 also 7/12 = 58%; left at 1.55 (inside noise of 60-70). (Row `mage:mini` is a different fight: 11/12 = 92%, ignore.)
- DK x0.95 trim, boss-rates reaper, 12 seeds practiced: forced --level=3 on rootway/burial/causeway/deep = 0/12 each, oreroad 2/12, and knight at forced L3 is 0/6 too, so forced L3 is not a usable gauge. At each boss's natural level: rootway(L5) 0/12, burial(L31) 12/12, causeway(L24) 2/11, deep(L22) 2/12, oreroad(L12) 7/12. No ~75% reading; the bot/rows do not give a clean answer, trim left as is. Needs a decision on which bosses count as "L3 bosses".

## Green alone after fixes
dangling-paths, blow-tags, lit-church, hint-shown, mash-gate, level-quality, archmage-folly (one random-spread flake).
