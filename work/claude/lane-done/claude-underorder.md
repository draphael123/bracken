# claude/underorder - UNDERLEAF moves to Kingswood -> SCREE -> UNDERLEAF -> HANGING (Daniel 10-24)

Base master 10d032ea. Node-only work (a release gate was running; no browser launched by this lane).

## What the first question found (before the scope change)
In code, from 10-08 (claude/underleafroad) the chain was Kingswood -> Underleaf -> Scree -> Hanging: gates, WOOD_NODES (Underleaf at the end of the wood sheet),
the win routing (partyNextLevel walks NODES, not LEVELS[i+1]), the depths (campaign-order), the act (act I). Nothing read the LEVELS array index for
order or numbering - the map's `level:` field is an index only to FIND the level, and no label prints it. I could not reproduce "Underleaf plays after
Hanging" from the source alone (the live-build browser check was skipped: RAM + the running gate). Daniel's real wish turned out to be a new order anyway.

## New road (scope change)
Kingswood -> THE SCREE PATH -> UNDERLEAF -> THE HANGING VILLAGE.
- src/level.js: scree needs 'kings'; underleaf needs 'scree'; hanging needs 'underleaf'. LEVELS array order untouched (append log).
- src/foe-react.js ACTS: act I ends at 'kings'; act II = scree, underleaf, hanging, ... (act card = first entry into an act, so Underleaf no longer
  re-shows anything; act I demo slice loses Underleaf).
- src/main.js map: Underleaf node moved from the wood sheet to the crag sheet (64,146) between Scree and Hanging; the road polyline now goes
  Kingswood -> crags' door with no dip south; CRAG_PATH gains [64,146] between Scree and Hanging. src/map-plate-spots.js: scree/underleaf/hanging boards re-solved
  by hand (full re-run of the annealer reshuffled 37 rows and put boards over landmarks; not used).
- src/main.js TIER: underleaf 0.7 -> 0.8 (tools/curve-shape "nothing falls along the needs chain": Scree 0.75 -> Underleaf was a fall). TIER_BOSS left frozen at 0.7.
- Depth / catch-up XP / curve tools / one-new-foe / campaign level all read campaign-order, so they follow automatically (no restamp needed: the level-1 curve rows
  are keyed by level hash and measured at level 1, independent of position; campaign-xp.json rows are per-level straight runs).

## Old saves (migration table, asserted by tools/under-order.mjs from the real migration line)
Rule: a cleared level never relocks (levelLocked). One-time migration PROG.underOrderMig: if Scree is cleared and Underleaf is not -> PROG.hangingOpen=1 (Hanging stays playable).
| save | Scree | Underleaf | Hanging |
|---|---|---|---|
| cleared Kingswood only | open | locked (needs Scree) | locked |
| cleared Underleaf (10-08 era) but not Scree | open | stays cleared | OPEN (needs only Underleaf now; cannot also ask for Scree on a one-gate chain) |
| cleared Scree, never Underleaf (sitting at Hanging) | open | open | open (hangingOpen grandfathered) |
| cleared Scree + Underleaf | open | open | open |
| past Hanging, never cleared Underleaf | open | OPEN as an extra, not a requirement | open (cleared) |
| fresh save, clears Scree after the change | open | open | locked until Underleaf |
| brand-new save | not grandfathered (hangingOpen unset) | | |

## Expected campaign levels (for the BATCH121 re-measure)
Depth on the chain (the fixture has no rows for every ancestor, so campaignLevel falls back to depth):
- Ram Lord (Scree boss): was L9, now **L8**.
- Grandmother (Underleaf boss, Underleaf 3 / claude/grandpolish): was L8, now **L9**.
- Hanging L10, Spire L11 unchanged. Underleaf's foes are now act II (ACTS dmg 1.1 vs 1.0, same purse); TIER 0.8 (commons), TIER_BOSS 0.7 frozen.

## Checks (node-only)
tools/under-order.mjs NEW (29 rows green; registered in tools/check.mjs after map-forks), map-grammar, map-forks, map-spacing, map-scale, act-cards (16), save-slots, curve-shape,
curve-gate, one-new-foe, goblin-lint, title-region, additional-areas, elites, level-quality, levelling, secrets, boss-select, ending. tools/xp.mjs reports 18 problems on master too (unchanged).

## QUESTIONS FOR DANIEL
1. Underleaf's chapter knight is the Spore Chapter's Hush Lance (order-chapters 'fungus') - it now appears in the crags between the Scree Chapter and the Hanging Village. Keep? (kept)
2. Underleaf is a goblin village ("the king's own village") now in act II; theme-fit says no goblins after the Goblin Queen (act II is well before her) - kept.
3. A save with Underleaf cleared but Scree not gets Hanging open (see table). Kept as harmless.
4. I could not reproduce Underleaf-after-Hanging from the source; if you still see it on the live build after this, send a screenshot of where.
