# Lane report: claude/hanging (THE HANGING VILLAGE rework)

Branch `claude/hanging`. It is master (52cfebb) plus the commits below; `origin/master` was re-merged at the end with
nothing new. The design is in `docs/briefs/hanging-village-rework.md` (written first, then corrected to what was built).
The level keeps its id, `needs: 'scree'`, its map node and its campaign place.

| chunk | sha | what |
|---|---|---|
| brief | b5bf6fe | the design, before any build |
| 1 | cbd84fe | each floor its own place, and the cliff drawn behind them |
| 2 | 500a309 | the hoist you load, and the Owl Reeve cuts its rope in phase two |
| 3 | d2cb051 | the Weaver's room gets a shape and a reason |
| 4 | e5fa294 | the 162-tile gap closed, and a route-based checkpoint check |

## The sentence, and the floors

**THE VILLAGE HANGS ON ROPES, AND A ROPE CAN BE CUT.** This is the banner's rule line now. You see it everywhere:
houses on ropes, rope ladders, swings, hoists, spider threads. You use it: you load a hoist, and you cut pegs. It is
used against you: spiders drop, the Weaver reels you in, and the Reeve cuts the hoist.

Each floor has its own ground set (`L.groundZones`: top, rock, the bough's underside, ledges, scatter), its own
house style and its own landmark. The cliff face behind every floor is baked per floor and drawn world-anchored
behind the tiles (`src/hanging-village.js`):

- **THE ROOTS**: moss and wet rock, turf shanties, and the root arch over the Web Hole.
- **THE ROPEWALK**: hemp earth, rope sheds, and the ropewalk frame and wheel. The hoist is taught here.
- **THE MARKET**: cobbles, stalls and the hall.
- **THE MILL LEDGE**: chalk, millers' cottages, and a mill tower behind the sails. The sails used to be loose Scree
  props.
- **THE ROOKERY**: granite streaked with guano, the dovecote, and nest boxes.
- **THE LANTERN STAIR**: slate, and a stair of lamps.
- **THE CROWN**: a dead pine whose limbs and ropes finally hold up the arena's floating ledges (B9).

The Scree Path's purple haze and the stamped pillars and struts are gone.

## The lift, as built (THE HOIST)

A deck on a rope over a wheel, with a basket in a well-head beside it.

- **Loading.** DOWN picks up a load (a coil, a sack or a stone); DOWN again sets it down. You walk slowly while
  carrying (`P.ballast`), and a blow knocks the load out of your hands.
- **Riding.** Walk the load to the well and it drops into the basket. The basket sinks and the deck rises.
- **At the top.** The deck holds while you stand on it. Once you are off, the basket tips, the load goes home, and
  the deck comes back down.
- **Four uses:**
  - **Taught at the ropewalk.** It is the only way up, takes one coil, and nothing shoots at you (the archer's nest
    was moved east).
  - **Cut at the mill.** A sack hangs on a peg over the well: cut the peg and the deck lifts you to the lamp. This
    teaches the crown's peg-cut somewhere safe.
  - **Under threat at the rookery.** It takes two sacks, and one comes down off the springy bough under the spiders.
    It pays the spurs relic.
  - **Paid off in the crown.** One stone lifts you level with the Reeve's middle perch.
- **Two lessons found by walking it, both now checked:**
  - Walking onto a load used to pick it up. A stone in the crown then slowed every hero who crossed it mid-fight, so
    pickup is on DOWN.
  - A well on the near side of the deck took the load as you passed, and the deck left without you. Every well is
    now on the far side.

## The Owl Reeve's phase two (A10)

The first thing phase two does is fly to the hoist's wheel.

- **Told.** "THE ROPE" appears, a ring plays on the wheel, and she spends a 1.2 s quiet windup there. It is on the
  QUIET list in marks.js because it strikes nobody.
- **The cut.** The deck falls as firewood, doing no damage. The iron block is left hanging by its brake line over the
  floor. Cut its peg while she is low under it and it pins her for 3.4 s at 8% of her blood, once (A11).
- **Defending the rope.** A lamp lit by the wheel dazzles her off it, and she comes back later.
- **Her kit** is otherwise unchanged, and DOUSE stays.
- **A12 and B4 hold.** The side climbs and vines still reach the perches.
- **One sentence:** "at half blood she cuts the hoist: no more ride to her perch, but its block hangs over the floor
  for you to drop on her."

## The Weaver's room

- **The reason: her larder.** The hoists' missing loads, and a goat, hang webbed from the roots.
- **The shape:**
  - A low web tunnel leads in, and its mouth shuts behind you.
  - The room is 38 wide, against 55 before (A7). She hangs 11 tiles from the door, so she is on screen.
  - Three climbable roots answer her reel ("THE LINE HOLDS" is in her code, and the room never had a net: an A12
    hole).
  - Two web shelves and a web bridge.
  - You leave through her larder.
- **Her kit is not changed.**

## Pilots and INDEX

- **The Owl Reeve** (bossLab, 6 heroes, 2 salted passes, dice pinned):
  - Before: 12/12 wins, median 56.7 s, 112 damage per minute.
  - After: 12/12 wins, median 63.1 s, 100 per minute.
  - The rope was cut in 11 of the 12 fights. Nothing hit the hero while she went for it.
  - The bot never cuts pegs (it didn't before either), so the block's pin is unmeasured by the bot. The in-page probe
    showed it pinning for 3.40 s and taking 8%.
- **The Weaver:**
  - Before: 12/12, median 46.7 s, 118 damage per minute.
  - After: 12/12, median 30.1 s, 260 damage per minute. Median damage per fight went from 88 to 124.
  - The spit and reel hits went to 0. The drop and floor-scuttle hits rose, because in a smaller room she is always
    over you.
  - After the rework both passes came out identical per hero; before, they differed for some heroes. So this is
    effectively 6 distinct fights.
- **INDEX: 93 before, 92 after** (`tools/curve.mjs`). One small spider fewer: the hollow's three became one in the
  tunnel. Raising INDEX was not in the approved plan.
- **F9 (playtest bot, knight and warden, no god mode):** walked 69% before, 85% after.
  - Findings before and after: one BLANK sweep frame and a snuffer RUNTIMEFLOAT at 32,66, both already there.
  - New: a SLOW p90 of 38 ms. It is the machine. Measured in the page, the cliff costs about 0.3 ms a frame (10.2 ms
    against 9.8 ms per step), and other lanes' suites were running at the time.
  - The bot cannot play a switchback level (it walks toward the gate's column), so it never reaches a hoist.
    `tools/hanging-hoist-walk.mjs` drives all four hoists with real keys instead, for the knight and the warden:
    32/32 steps ok.

## Captures

`docs/hanging/before-01..15` and `after-01..19`, all real page. The after set adds the web bridge, the crown hoist
ridden up, the rope tell and the cut.

## Checks (green at every push; subsets only, never the full suite)

- **Level checks:** audit, content-audit, traps, killzones, collectables, spawns, deadends, floaters, checkpoints,
  skins, dressing, signs, pixels, map-grammar, one-new-foe, threat-holes, elites, ambush-single, additional-areas and
  its runtime check.
- **Fight checks:** tells, boss-openings, boss-fight-end, arena-supplies.
- **Hygiene:** textfit, comments, syntax, homepaths, dangling-paths.
- **Hanging's own:** owl-lamps, readability, runtime-footing, levelling-runtime.
- **New:** hanging-hoist, checkpoint-gaps.
- **Re-runs:**
  - tells failed once until `tools/tells.mjs --write` regenerated the MARK table for `ropeTell`.
  - dangling-paths failed until the new files were tracked.
- **New checks, each proved red first:**
  - `tools/hanging-hoist.mjs` fails on the old code, on five hoist and Reeve mutations, on the 55-wide room, and on
    the room without roots.
  - `tools/checkpoint-gaps.mjs` fails on this level at 162.
  - The zone-kit line in `tools/dressing.mjs` fails when a kind is dropped from the allowlist.

## Questions for Daniel

1. **The Weaver is now more dangerous per minute** (118 → 260 per minute, 88 → 124 damage per fight), though the fight
   is shorter. The bot stands under her drops. I recommend leaving her kit alone and play-testing it first. If it
   feels unfair, lengthen her `dropTell` in the small room (0.55 → 0.7 s) rather than widening the room back.
2. **Two other levels fail the new route-based checkpoint rule:** the Keep (495) and the Burial Caverns (206). Both
   are on a named list that has to shrink. I recommend fixing the rule at its root: make `checkpoints()` key a tall
   level on its walked route. That changes checkpoints in other levels, so it belongs to their owners or the
   integrator, not this lane.
3. **The playtest bot cannot walk switchback levels.** I recommend giving it a route to follow (pacing's route) rather
   than a gate column, so F9 means something here and on the Monastery.
4. **INDEX stays at 92,** still a −21 dip after the Scree Path. The ranking's other fix, one authored encounter per
   floor plus a rope-cutting cliff foe, was not in this plan. I recommend it as the next pass if the dip matters.
5. **The music is still the generic `town` track.**
