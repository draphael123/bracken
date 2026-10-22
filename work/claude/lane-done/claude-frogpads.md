# claude/frogpads - THE FROG KING'S ROYAL PADS 2x (sonnet)

Base master 5e44cddd, PORT 8787. Daniel 10-22: "royal pads ~2x bigger so he is easier to dodge".

## What changed
- src/frog-court.js: royal pads 7 / 7 / 12 cols -> **14 / 14 / 20** cols (112/112/192 px -> 224/224/320 px). The lanes keep their 14 cols (leaf spacing,
  leap/crossing distances unchanged); the court is 77 -> **99** cols (GROW 33 -> 55), THRONE_DX 71 -> 89, the King wakes at pad I centre (+6).
  Lane leaves (24 px) left as they were: the ask was the royal pads, and the dodge fights (tongue, spit, flop, swarm, leap) all happen on the royal pads.
- src/redraw/frog_court_art.js: giant royal lily pads scale with the hitbox (padTile is parametric by width; stems added for 14 and 20 cols, throne lotus
  centred from THRONE_DX instead of a hardcoded 71). Pictures: work/claude/lane-done/frogpads-before-padI.png / -padIII.png and frogpads-after-padI.png / -padIII.png.
- Dodge space: tongue reach 175/210 px, flop wave 170 px/s (jump on a pad), spit spread, flies orbit and the leap landing spot all now have a pad wider than
  the tongue is long (224 px) - you can stand clear of the leap landing spot and still be on his pad. The leap rules read as before (told crouch, landing spot, shield).
  No FK numbers touched.

## Rates (boss-rates marsh, campaign L3, practiced)
| run | knight | warden | pyro | total |
|---|---|---|---|---|
| WITH flasks (profile human, kit) n=12 each | 9/12 | 11/12 | 4/12 | **67%** (in band 60-70) |
| before (frogking2, hp 1500, n=24) | 12/24 | 23/24 | 10/24 | 63% |
| dry (human+dry) n=6 | 5/6 | 3/6 | 0/6 | 44% (reported; before 56% at n=6) |
| mash bot boss (--write) | 0/2 | 0/2 | 0/2 | **0/6** |
No retune needed: the bot's rate moved +4 points, in band. (The bot clamps its stand spot to the pad, so the wider pad helps a human more than the bot.)
Pyro is the weak hero (4/12 with flasks, 0/6 dry) - same shape as before (10/24), flagged not changed.

## Checks
level-quality marsh CLEARS; marsh2-beats ok; solid-islands, lethal-water (node+page), checkpoints, checkpoint-gaps, deadends, threat-holes, stuck --static ok;
page: raft-recall GREEN (5 rafts / 2 levels), firsthour (King section: told spits, leap onto hero/shield, pond stirs 46%), boss-openings ok;
textfit hints,bestiary,boss,worldplates --strict: 0 new (1 known OFFSCREEN '!' in the minecart mini, main.js:28191, not mine);
mobile-perf: inside budget (title 56.6 fps, wood/welltown/redgorge 55.7-56 fps; court art is baked once, unchanged cost).
Re-stamped (level hash moved): docs/level1-pilot.json marsh (knight 161% / 1 death), docs/level1-curve.json marsh (172% / 3), docs/mash-bot.json marsh level + boss.
Not run: the full suite, mash-gate, per-hero all-9 route.

## QUESTIONS FOR DANIEL
1. Lane leaves are still 24 px in 14-col lanes. Rec: leave (the crossing is the tension); built: unchanged. Say if the leaves should grow too.
