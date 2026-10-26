# claude/hurricane3 - THE HURRICANE DECK 3: the storm changes the level + THE CAPTAIN atop the mainmast (Opus greybox, 2026-10-26)

**Base:** claude/flotilla3 5bee569f (it shares the ship kit; the deadly-water drain is already on the base).
**Brief:** scratch/brief-hurricane3-1018.md, folded with the approved review scratch/review-hurricane-1018.md. Daniel approved all recs on 10-18 10:18.
**Status:** NOT merged, NOT deployed. GREYBOX: an art pass must merge before it goes live (art list below).

## Reviewer pass (vs Mage's Folly)
- The 10-18 Opus review (scratch/review-hurricane-1018.md) still holds on this base.
- I re-ran `level-quality hurricane mage` before changing anything. H2 cleared the bar on paper, but:
  - mechanics: 5 gadget kinds vs the Folly's 12;
  - longest level run: 56 vs 12;
  - the storm was a hazard, not a state;
  - no sinking; no wind;
  - his arena was a flat deck.
- So this lane built the review's fix list rather than writing a second review.

**Before / after on the bar (level-quality, the H3 row):**
| row | before | after |
|---|---|---|
| gadget kinds | 5 kinds, 3 developed | 7 kinds, 3 developed: cask x5, gusts x3, rollGaps x3, lightrod x2, felled x2, loosegun, cargowall |
| flat share | 19% | 0% |
| level ground | 47%, longest 56 | 7%, longest 14/21 |
| route span | 22 rows | 23 rows, 281 tiles back (she is walked out and back) |
| density | 1.13 | 1.18, 2 empty screens = 18% |

## What changed

### The level (src/level.js theHurricane, 540 x 60)
**Rule line:** "THE STORM TELLS YOU WHEN: JUMP WITH HER ROLL AND THE WIND, SWIM WHEN SHE FLOODS - AND CLIMB, SHE IS GOING DOWN."

**The road:** bow to stern on deck, then back forward through her rigging to the mainmast top.
1. **THE FORECASTLE.** The roll is taught here:
   - a loose cask;
   - the fore hatch, only cleared jumping downhill;
   - a lashed cask: strike it free and the heel runs it to the fore house, where it is the only step up (required);
   - exam: a tideguard with a cask uphill of him;
   - shrine.
2. **THE WAIST.** It floods and drains on a told cycle:
   - swim up onto the galley roof (required);
   - the hold under it pays a silver when it is drained;
   - exam: a boarder elite on the galley roof, in a gust you brace against;
   - the sky fells the foremast across the breach onto her boats;
   - shrine.
3. **THE MAIN DECK.**
   - The ambush.
   - A second roll gap.
   - **Rod 1:** strike the chain onto the hatch iron, stand clear, and the bolt burns the tarred net (required). The sea witch at the mast makes it charge faster.
   - Down into the dark gun deck: the loose gun on the roll smashes the cargo.
   - Up into the eye.
4. **THE EYE.** Calm and stars; shrine; his cabin and log ("I AM GOING UP HER MAIN").
5. **THE QUARTERDECK.**
   - She goes down by the stern (the stern well floods).
   - The wind taught over the skylight.
   - A third roll gap.
   - Stern exam.
   - Up the mizzen to the shrine on the mizzen top.
6. **THE STAYS.**
   - **Rod 2:** its bolt fells the mizzen topmast into a ramp (required).
   - Two told gust gaps over hammock nets.
   - The topmast run, breaking behind you.
   - The boarder elite on the main yard; he holds the boarding net (gate 310).
   - Up the shrouds to the main top shrine.
   - All the way, THE RISING SEA chases you up.
7. **THE MAINMAST TOP:** the Captain.

**src/hurricane3.js** is new. It runs these systems:
- **She sinks:** 4 told steps plus the rubber-banded rising sea. The HUD gauge reads SHE SINKS, and a respawn wakes at the shrine's step.
- **The waist flood.**
- **Casks:** lashing, heel-driven slide, hazard while running, a step when stopped.
- **Rods:** charge, told tail, the chain verb, burn or fell.
- **Sails** that snap through a gust's tell, and rain that slants in it.
- **Area banners.**
- **Greybox drawing:** masts, stays, davits, the tarred net.

**Changes in src/main.js:**
- The roll carries you in the air (R.air): downhill long, uphill short.
- Roll bands: her decks plus the gun deck.
- Felled rows are generalised.
- The eye is y-aware, so her stays over it stay in the storm.
- Rain has a yMax.
- The H2 art module keeps only its generic pieces (h3 gate).

**reachcore** now knows roll carries, cask steps and the killing sea. The killing sea is no road (p.seaKill).

### The Captain 3 (src/main.js updateCaptain; bot src/captain3-plan.js plus a lab.js branch)
He fights on three yards: T1 topsail, T2 topgallant, T3 royal. The mast and the end shrouds join them and are his lines. He climbs to follow you; he never teleports.

**Moves (B16 own modes, B17 seven answers):**
- sabre (!) — in P3 it is the SWAY lunge (!), and her heel at the masthead is x1.6;
- pistols (!!) — they also reach across yards;
- grapnel (!) — wind-drifted;
- **BRACE! (!!)** — he makes for a line, and the sea plus a gust sweeps every yard. Off a line you are KNOCKED FLAT (drain, thrown along the yard but never off its end). Take his line and he is flat: OPEN x2.
- keg (P2+, carried by the wind);
- **WATER-LUNGE (!!, P2+)** — he dives into the drowned yard and comes up at a ring under you.

**Openings:**
- **THE MASTHEAD ROD** is the main one. It charges for 9.5 s; the last 2 s are told by a glow, a crackle and the blue column on every yard. He won't wait in the column, but he follows a man he is pressing into it. Lead him in and step out: STRUCK, OPEN x1.5.
- Knocked flat off his line: x2.
- Turned on a shield: x1.5.
- After any opening, a 3 s ward.
- The floor is 0.4, with B11's wall from the front.

**The sea is his phases:**
- at 62% it takes the topsail yard;
- at 32% the topgallant (deadly drain);
- the royal is never drowned.

**Removed:** his whistle / "calls the sea" (approved retire). The deck wave is off in his fight.

### Tools
- **New:** tools/hurricane3.mjs (Node). Each required use is the only way on; the sinking steps only rise; the shrines name their steps; the yards are joined and under the rod.
- **Rewritten:** tools/fixtures/ship-browser.js (6 page rows) and storm-ship.mjs.
- **elites.mjs:** the arena-reach test is bounded to the arena's own columns.
- **level-quality:** counts L.rollGaps / L.felled as systems.
- **Data updated:** stuck-spots (11 spots), marks (MARK regenerated: braceTell, diveTell, surgeTell, swayTell; THROWN braceTell), elite-kit affixes, relics vault, THREAT lightrod, walk-hints (hurricane).

## Boss rates (boss-rates hurricane, practiced, profile human, kit flasks, L23, n=12)
| knight | warden | pyro | paladin | pirate | reaper | geomancer | berserker | ranger | total |
|---|---|---|---|---|---|---|---|---|---|
| 10/12 | 11/12 | 7/12 | 9/12 | 7/12 | 11/12 | 7/12 | 10/12 | 4/12 | **76/108 = 70%** |

- IN BAND, at the top edge. No hero is at 0.
- Wins last 54-178 s, 92 s on average.
- **Levers:**
  - CAP2.hpK 0.62;
  - CAP_HERO per hero (his blows on that hero): knight 1, warden 0.62, pyro 0.85, paladin 0.7, pirate 0.45, reaper 1.15, geo 0.6, berserker 0.55, ranger 0.5;
  - CAP_OPEN: pirate 1.2, ranger 1.3, berserker 1.1.
- **Dry** (bare flasks, n=4): knight 3/4, warden 2/4, pyro 2/4 = 58%. Report only.
- **Mash:** the boss holds at 0/6 (the mash pyro dies with the boss at 50-71%). The level mash dies (the best mash hero, the knight, takes 2 deaths).
- **Level-1 pilot:** 25 blows, 9 deaths over 3 runs, 100% walked. Curve: act III, 395% a run, 9 deaths (in band).
- **Rows restamped** in docs/mash-bot.json, level1-pilot.json and level1-curve.json, in the order level then boss.

## Checks
- **Green (Node):**
  - level-quality: CLEARS THE BAR (pilot, mash and curve restamped);
  - reach (nothing stranded);
  - reach-heroes (all 9 heroes, 6 route targets);
  - hurricane3; storm-ship;
  - checkpoint-gaps (gaps 81/105/151/119/159; door shrine at the main top); checkpoints;
  - solid-islands (every island has a drawn support marker); elites (gate 310);
  - stuck --static; tells (MARK regenerated);
  - signs; one-new-foe; ambush-listed; ambush-reach; deadends; relics; floaters; spawns; threat-holes; keys; dressing.
- **Green (page):** storm-ship-runtime (6 rows).
- **Inherited red, not this lane:** answer-tags fails on 'grapnel' (flotilla3's new foe, base 5bee569f).
- **Not run:**
  - the full check.mjs (forbidden);
  - textfit, mobile-perf, stuck runtime, level-walk at L20, boss-greed/openings/fight-end page checks;
  - corpses, killzones, mark-integrity.
  - Next lane / integ should run them.

## Shots
- **Before** (the live H2 look): work/claude/shots/hurricane2art/t2/*.png and before/*.png in the main repo.
- **After:** work/claude/shots/hurricane3/after/*.png on this branch (16 shots, forecastle to arena).

## ART LIST (Sonnet art pass; the level ships only after it)
1. **Her hull** in the sinking sea:
   - the hull drawn under the waterline as the sea climbs;
   - the outside sea as a dark storm sea (today the foul-pool look with sea colours);
   - the stern well flooding.
2. **The masts:**
   - the mainmast deck-to-truck with tops, crosstrees and hoops;
   - the mizzen (with the topmast that falls) and the foremast (H2's felled drawing is reused);
   - the masthead rod and its conductor chains down the main and the mizzen.
3. **The yards:** topsail, topgallant, royal, main yard, crossjack/stay slings, as tarred spars with footropes. Today they are planks.
4. **The stays:** the mizzen-main stay and the lifts each stays platform hangs on, plus the hammock nets (greybox lines today).
5. **The sails** that snap in a gust's tell (greybox rectangles), and the rain slanting in a gust.
6. **Her houses and the waist:**
   - the waist well and its flood (foam line, bell);
   - the galley house; the fore house; her boats on chocks and davits;
   - the main deckhouse under the main yard; his cabin with the log.
7. **The gun deck and the hatches:**
   - the tarred net over the main hatch, and its burning;
   - the gun deck seams;
   - the skylight, the companion, the after scuttle.
8. **Casks:** lashed with a rope that parts; rolling and stopped (greybox barrel).
9. **The Captain's new poses** (B16; today they borrow frames):
   - BRACE! call (uses held / brace 12/13);
   - climbing a shroud (12);
   - water-lunge dive windup (13) and surge (4);
   - the sway lunge (3);
   - struck by the rod (14); flat (18).
10. **The rod's column FX** (blue column, charge glow) and the BRACE sweep crest across the yards.
11. **Sound:** a hull groan per sinking step; rod charging crackle; sail snap; BRACE! shout (today a whistle).

## Questions for Daniel (rec first; built the rec)
1. **The killing sea outside her.** It drains about 9% a second (the Flotilla 3 rule).
   - Rec: keep. Built.
   - Alt: hand-back like a pit.
2. **The water-lunge.** It is told by a ring and a '!!' 0.6 s before he surfaces.
   - Rec: keep the 0.6 s. Built.
3. **The knight's TURNED opening** (shield block → x1.5) makes him the strongest hero before tuning.
   - Rec: keep, tuned by CAP_HERO. Built.
4. **The sea witch at rod 1** makes the rod charge 1.8x faster.
   - Rec: keep, as the pressure on the chain verb. Built.

## NEXT STEPS
1. **Art pass (Sonnet):** the list above.
2. **Integ / next lane, the unrun page checks:** textfit hurricane --strict; stuck (runtime); boss-greed / boss-openings / boss-fight-end / boss-navigation; mobile-perf; corpses; killzones; level-walk at L20 (the walker has hurricane hints in src/walk-hints.js, untested).
3. **Merge note:** branched off claude/flotilla3 5bee569f. Merge after flotilla3. The answer-tags 'grapnel' red is flotilla3's.
