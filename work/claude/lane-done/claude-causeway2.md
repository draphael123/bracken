# claude/causeway2 - THE DROWNED CAUSEWAY: the Tide Reaver goes, and THE KRAKEN reworked (lane report, DONE)

Design: docs/briefs/kraken-rework.md. This lane was stopped once (Daniel, ~03:30 on 2026-09-26) and resumed. origin/master (eeaad91) is merged in.

## Commits
- b250d12 the brief.
- 38827ef 1. The Tide Reaver goes.
- f130dbb 2. The lab bot, and the BEFORE pilot.
- c44b93a 3a. THE TIDE RISES.
- f110c79 3b. Fewer free openings, and the three stages again.
- 0cbdb01 the WIP the coordinator saved when the lane was stopped. It was not checked.
- a82c587 3c. He hits harder. This is the WIP, checked, kept, and given one more assertion.
- f196a4b 3d. THE INK.
- 1d342e1 the AFTER pilot.
- 4c3af29 merge of origin/master. 0b311e1 scrubs a home path out of two check logs.
- This report.

## The WIP (0cbdb01): kept
It was part (c) of the brief, and it was complete. It did five things:
- Made the sweeps quicker: 0.9 -> 0.7 s, and 0.6 -> 0.5 s in stage 2.
- Made the slams quicker: shorter tells and cooldowns.
- Made the blows harder: slam 22 -> 26, sweep 18 -> 22, drag 20 -> 24.
- Made the grab drag you toward the sea.
- Gave kraken-rework its "hits harder" assertions.

It parsed, and kraken-rework passed on it. So I kept it, with one change. I added an assertion for a hero standing seaward of the arm that has him: he must still be dragged out to sea. The old code dragged him back to the arm (-21 px).

The assertions fail on f110c79, as they should: `rolled` false, `draggedPast` -21, sweep 0.9 s.

## What the Kraken is now
- **Stage 1, THE ARMS.** Four arms. The tide rises every 15 s. The tower bell knells him once. After that only the shrine bell on the plinth does.
- **Stage 2, AT SEA.** Two NEW arms come up. The fight ends at 35% and goes to the maw. The tide comes every 12 s.
  - **THE INK (new):** the first comes 8 s into the stage, then one every 13 s while his arms are up.
  - Each ink is told for 1.1 s: black ink gathers at his mouth with a gurgle and a hiss, the word INK appears, and two dark edges mark the stretch.
  - Then a 7-tile band of the road, full screen height, goes dark for 3.5 s. It goes on his side of you when there is room.
  - It never covers the hero's own tile or the tiles on either side. `krakenInkSpans` cuts them out every frame, even if you walk into the band.
  - It does no damage; it hides his arms. The tide's marks and the marks of his blows are drawn over it.
  - The old whole-screen vignette (`e.inkT`) had not been set by anything since the causeway was rebuilt. It is gone.
- **Stage 3, THE MAW.** The spear and two regrown arms. A cut arm comes back as a new one. The tide comes every 10 s.
- **Throughout:**
  - The tide takes the road in sections (lines at tiles 601, 591 and 584) and is told three ways.
  - If it catches you on the stones it takes, you are hit and swept to its edge. The flooded road carries you out.
  - An arm under the tide cannot be cut.
  - A knell bell pushes the tide back one section.
  - An arm cut and left alone regrows after 4 s.
  - His arms lie still during a look only if something caused the look.
  - The grab drags you seaward at 80 px/s. You can press out of it, or roll out at once with a dodge (10 stamina). It holds you at most 2.2 s.
- Kept: A11 (crates, cuts, bell, spear) and A12 (arena-supplies green).

## Pilots (tools/kraken-pilot.mjs: 7 heroes, 3 salts; boss 675 hp in the lab)
| | BEFORE | AFTER |
|---|---|---|
| refill, 150 s: wins | 8/21 | 9/21 |
| refill: median win | 134.4 s | 141.8 s |
| refill: median hp left | 3% | 2% |
| refill: median damage taken | 89 (36/min) | 112 (45/min) |
| refill: reached stage 3 (the maw) | 0/21 | 21/21 |
| normal, 300 s: wins | 13/21 | 3/21 |
| normal: deaths | 8 | 18 |
| normal: reached stage 3 | 0/21 | 18/21 |

- The bot can finish him: pirate, paladin, knight and geomancer all win on refill, and the pirate also wins on normal health.
- Every refill loss is a timeout, with 2-14% of his health left. The 150 s cap is the fight's own length now, not a weakness in the bot.
- On normal health the bot dies, and nearly always in the maw. The warden dies in stage 1 at 34 s (sweep plus slam, 90 damage).
- **Caveat:** the three salts give identical fights, before and after, so there are really 7 fights, each counted three times.
- The grab never landed on the bot (held 0 in 42 fights). The tide caught it 9 times.
- **Health:** the pilots do not call for 480 -> 650. The refill losses are only a few percent short, and normal health is now hard for the bot. I left his health alone.

## Checks
- These were green after the merge (work/causeway2/check-after-merge.log), 39 in all: kraken-rework, haunted-coast, haunted-coast-runtime, additional-areas, additional-areas-runtime, map-grammar, keep, keep-runtime, keep-expansion, keep-passages, keep-expansion-runtime, keep-rework, sea-requests, sea-runtime, skins, boss-fight-end, boss-openings, arena-supplies, mini-names, tells, one-new-foe, elites, spawns, floaters, architecture, footing-art, checkpoint-stand, checkpoints, checkpoint-gaps, signs, textfit, readability, swim-chain, deadly-water, ore-road, comments, syntax, homepaths, dangling-paths.
- Several names matched as prefixes, which is why some keep-* checks are in the list.
- kraken-rework is red on the old code for each part: tide, openings, harder blows and ink. The own-tile ink assertion also goes red when the cut-out is removed.
- The merge conflicts were:
  - DMG/EHP: merged token by token.
  - bellcrab frames: master's version, minus the Reaver line.
  - window.BK: both sides kept.
  - check.mjs: every name from both sides, minus tide-reaver.
  - marks.js: master's hand-written part minus the Reaver row, then `tells --write`.

## UNVERIFIED
- Nobody has played it. I only looked at the ink in two headless captures: the band is dark, the hero's tile is lit, and the red marks show through.
- How the ink feels to a person, and whether 7 tiles for 3.5 s is too much at 320x180, is unknown. The bot reads game state, so the ink costs it nothing and the pilots do not measure it.
- The grab never fired in the pilots. Being dragged seaward and rolling out are only proven in kraken-rework, where the grab is forced.
- The tide's surge, the swept-to-the-edge and the carried-out were tested with forced timers, not in natural play.
- The full suite was not run. That is the integrator's job.

## QUESTIONS FOR DANIEL
1. **Normal health is now much harder for the bot: 3/21 wins, down from 13/21, with most deaths in the maw.** Is that the "not too easy" you wanted?
   *Recommendation:* play it first. If it is too much, soften the maw (fewer regrown arms, or the arm comes back after 7 -> 10 s). Don't lower the harder blows in stages 1-2, which were what you asked for.
2. **His health:** the brief allows 480 -> ~650 only if the pilots say so. They don't.
   *Recommendation:* keep his health as it is.
3. **The ink:** 7 tiles, 3.5 s, every 13 s in stage 2 only.
   *Recommendation:* keep it for your playtest. If it reads as unfair, cut it to 5 tiles before cutting the time.
4. **The pilot's three salts give identical fights,** so "3 seeds" is really one.
   *Recommendation:* a small follow-up so the salt also seeds the Kraken's own picks (`pick`, cargo, far queue), so the passes differ.
