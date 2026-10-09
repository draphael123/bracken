# claude-underleafroad (UNDERLEAF onto the main road) - 2026-10-08

Branch claude/underleafroad (off claude/batch79). Road is now Sporewood -> The Rootway -> Kingswood -> UNDERLEAF -> The Scree Path.

## What changed
- MERGES: origin/claude/rootway (kept both sides; the Hawk-Mistress's `hmOpen/hmPlan/HMH` and the Huntmaster's clashed, so the Huntmaster's are aliased `hnOpen/hnPlan/HNH` in src/boss-greed.js, src/lab.js, src/main.js) and origin/claude/burningmap (it carries tools/level-reach.mjs + class-spurs, which were not on batch79).
- src/level.js: underleaf row is `needs: 'kings'` (was `hidden: true, secret: true, needsTime: { id: 'kings', t: 180 }`); scree is `needs: 'underleaf'`. Array position unchanged (saves count levels by index). Removed the secret-only text: the "THE SECRET LEVEL ... under three minutes" header comment on underleaf() and the "Underleaf asks you to be quick through Kingswood" comment above undercrown() (~line 2444). There was no toast/tip/achievement tied to the 3:00 rule beyond the generic needsTime machinery in src/main.js (timeLocked / secretHost / the "WALK KINGSWOOD IN 3:00" tip) - that stays as a general rule, no level uses it now (comment at src/main.js timeLocked updated).
- src/main.js world map: UNDERLEAF is a non-spur node at (60,56) plate below on the wood sheet, WOOD_PATH bends through [60,56] (was a spur at (67,70)). tools/map-grammar.mjs ok, tools/map-spacing.mjs ok (45 nodes). (First try at (98,33) failed map-spacing: Kingswood's plate lost its last free side; (60,56) leaves "left" free.)
- src/foe-react.js ACTS: underleaf moved from act II (THE CRAGS) to act I (THE GREENWOOD): the crags start at the Scree Path (LEVELS arc marker), and its curve row (55% lost, 0 deaths) is inside act I's band (40-250%, 0-3). tools/rule-state.mjs CURVE_REPORT_ONLY: underleaf removed (it was "EASY for act II"). docs/combat-tuning.md act table follows. Side effect: flask-up at Underleaf is 0 extra (act I), as for Kingswood.
- tools/level-reach.mjs: new assertion that underleaf is a plain main-road level (not hidden/secret/timed, needs kings, next is scree, on the map, not a spur). Fresh save reaches it (ran on 8737, green).
- Re-measured/re-stamped: tools/fixtures/campaign-xp.json (`boss-level.mjs --write-xp`), docs/level1-curve.json underleaf row (`level1-pilot.mjs underleaf --curve --write`), docs/mash-bot.json underleaf level row (L6) then boss row (0/6). ?level=underleaf&campaign=1 gives CAMPAIGN L6 (kings L5, scree L7) - no per-level table needed, the kit is data driven.
- Comments: tools/one-new-foe.mjs, src/campaign-order.js (one secret left).
- Save migration: none needed - levelLocked reads PROG[needs].cleared, so every save with Kingswood cleared sees Underleaf open; saves that cleared Underleaf as a secret keep it; saves that already cleared the Scree Path (or later) keep it open (cleared wins). A save mid-way with Kingswood cleared and the Scree Path not yet cleared now needs Underleaf first (the point of the change). NODES indices unchanged, so mapNode saves are fine.

## Checks (all on PORT 8737, alone)
green: map-grammar, map-spacing, level-reach, one-new-foe, levelling, curve-gate, mash-gate (underleaf), level-quality (no underleaf miss), reach/route-breaks underleaf.
red, not mine (pre-existing on the rootway merge, also red at e3ddfa2c): mash-gate + level-quality ROOTWAY mash ("mash bot beats the level", warden 61%) - the rootway lane's; level-quality CANAL pilot row stale (hash); curve-gate "stale" rows spore/kings/storm/unburied/canal/redgorge/underwell/skyroad.
red, mine (reported, not weakened): tools/xp.mjs (not in the suite): the straight-run road now ends glasssea -2 and ksar -2 against depth+1 (was -1 -1): Underleaf adds a whole depth but only ~1040 XP (58 foes, mini 0, boss 255) where a level is ~1300; Rootway already used up the slack. See QUESTIONS.

## Boss rates (human+dry, --mode=new, 4 seeds/hero, campaign level; BOT_PROFILE=human+dry because `--profile=human+dry` is silently ignored by profileOverride's regex /[w+]+/ - tools/boss-level.mjs bug, should be [\w+]+)
- THE GRANDMOTHER (underleaf, L6): knight 3/4, warden 3/4, pyro 4/4 = 10/12 (83%) - ABOVE the 50-60% band (not re-tuned; her rework is brief-underleaf2). mash 0/6.
- KING GORM (kings, L5, did not move): knight 1/4, warden 4/4, pyro 2/4 = 7/12 (58%).
- THE GREAT HOUND (kings:mini, L5): knight 3/4, warden 3/4, pyro 4/4 = 10/12 (83%), above the 70-75% mini band by a hair.
- SCREE boss (L6 -> L7): knight 1/4, warden 4/4, pyro 4/4 = 9/12 (75%).
- 35 levels' campaign level moved +1 (everything after Underleaf on the road, plus rootway L4->L5 and canal L23->L25 from the xp refresh); only the four above were re-measured, a higher hero level only makes the rest easier. List: scree hanging spire moor skyroad oreroad storm crown longwater reef flotilla hurricane lamplit deep keep causeway harbor waymeet undercrown fields burial mage fallingtower witchlight unburied caravan fair theatre canal welltown redgorge underwell glasssea ksar rootway.
- A stamina x1.4 re-stamp was NOT done anywhere.

## QUESTIONS FOR DANIEL (rec + what I built)
1. Act for Underleaf. Rec/built: act I (Greenwood), because the crags start at the Scree Path. Alternative: leave it act II, then its 55% lost / 0 deaths stays "EASY for act II" on CURVE_REPORT_ONLY.
2. XP curve. Underleaf adds depth but little XP, so a straight run is now 2 levels behind at the Glass Sea and the Ksar (tools/xp.mjs). Rec: add XP at the cause - give Underleaf real fights (it is the stealth anti-model; the brief-underleaf2 rebuild adds the sound tools and encounters) rather than retune XP_C/XP_P. Built: nothing; reported.
3. The Grandmother is 83% on the dry human bot (band 50-60%). Rec: fold it into the brief-underleaf2 boss rework (misdirection opening, bell phase) instead of a number tweak now. Built: nothing.
4. Underleaf is still the standard's anti-model (rule invisible, generic town) and is NOT gated in level-quality. Rec: keep it ungated until the brief-underleaf2 lane (sound rings, pebble throw, bell hour, wake carried into Kingswood - that "wake" idea now runs the other way: it would have to carry INTO the Scree Path, since Underleaf is after Kingswood).
5. Story: Underleaf is the king's village after Gorm falls ("the runners he sent never got home"). Rec: fine as is; sub-title kept "the king's own village, asleep".
