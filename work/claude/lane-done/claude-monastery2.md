# claude/monastery2 — lane report (2026-09-25)

The Monastery (`spire`, `theMonastery()` in `src/level.js`) reworked in three chunks, on `claude/batch17` with
`origin/master` merged in before finishing. Brief: `docs/briefs/monastery-rework.md`. Captures: `docs/monastery/`.
Nothing touched master, nothing deployed, the full suite was not run (subsets only, listed below).

## Commits

| sha | chunk |
|---|---|
| `b477605` | brief: `docs/briefs/monastery-rework.md` |
| `191a2ca` | 1. `tools/architecture.mjs` (new check, in the suite list) and the Monastery grounded |
| `48ed13d` | 2. eleven places up the mountain, zoned ground kits, Tam's lines about the Abbot and the bells |
| `c37212a` | 3. the goblin priest's kit (+ `tools/gob-priest.mjs`), and the Abbot's congregation kept out of the thorns |
| `bf95beb` | merge `origin/master` (the bridge-prop banking fix) |

## 1. The architecture check, across ALL levels

`tools/architecture.mjs` runs a load path from the bottom of every level up through what the level says was BUILT
(`masonry`, `facades`, `structures`/`watchtowers`, `houses`, `stone`). A cell is held from below (natural rock, held
structure, or a grounded room); a lintel carries 4 tiles, and a lintel between two piers carries the wall above it; a
`spans: true` facade is one arch standing on its two springings; a doorway head is held only when the door leads into a
room; a foot under an opaque pool is hidden. Natural rock is not judged.

- **Red on the old Monastery:** 6 pieces, 838 cells (the belfry floor/roof 30-34, the chapel's floor 56-58, the cloister
  and its slab 91-102, the scriptorium's floor slab 172-174). Green after.
- **Everywhere else, 4 levels, grandfathered with a reason each and a ratchet** (a listed level that passes fails
  until its entry comes out):
  - **keep** (300 cells): THE SUNKEN TOWER facade (602-613, rows 10-47) stops over the open water passage and never
    reaches the bed. `docs/monastery/architecture-keep-tower.png`.
  - **harbor** (33 cols): the jetty's timber frame (478-510) ends at the water line; the bed is 11 rows lower. Shelved on
    purpose, left alone. `architecture-harbor-jetty.png`.
  - **waymeet** (83): the town-wall arcade (477-535) is a flat two-row lintel over 12-tile openings; four town houses
    (358-443) stand on the canal. `architecture-waymeet.png`.
  - **unburied** (52): the broken tower (348-350) hovers two rows over the road with sky behind it; a timber column
    (363-364) stands over the pit. The road runs under the first, so grounding it moves the route.
    `architecture-unburied-pillar.png`.
  - Crown's castle and the Burning Village's houses in the lava were flagged by the first draft and turned out to be a
    doorway and a hidden foot: the rule learned both rather than listing them.
- None of the four is a one-tile fix, so none was touched.

## 2. The Monastery's places, in route order

Not one tile moved in chunks 1-2 (the garrison is placement-for-placement identical). Every floor is laid stone now.
Each storey's wall face runs from under the slab above down through its own floor, behind the play.

1. **THE GATEHOUSE** (217, west): gate tower, fallen portcullis, pilgrims' shelter by their stair, the guest-house arcade.
2. **THE MONKS' GRAVEYARD** (217, east): lychgate, headstones, the yew; the undercroft under the trapdoor is its ossuary.
3. **THE HERB GARDEN AND ORCHARD** (195): three fruit trees, herb beds, bean rows, a row of skeps, a dovecote, before the
   garden's buttressed retaining wall (blind arches, espaliered pears).
4. **THE SCRIPTORIUM** (171): copyists' desks with candles, lecterns, shelves; the prayer wheel.
5. **THE REFECTORY** (151): whitewash, tall windows, the reader's texts, long tables and benches, the kitchen hearth; the
   old reading loft is the reader's pulpit, the book hoist the kitchen hoist.
6. **THE DORTER** (131, between the bell towers): a range of cell doors; the looters asleep in the monks' cots.
7. **THE BELL TOWERS** (117): the belfries are stages IN towers that rise to the cloister's floor, with great arches
   between them.
8. **THE CLOUD CLOISTER** (99): the arcade walk with the dormitory gallery over it, the garth's well and physic beds.
9. **THE UPPER SHRINES** (79): a lamp in a niche in every pier, the prayer-flag lines between them.
10. **THE CHAPEL** (55, the golem's hall): stained-glass lancets, altar candles, the rose window in the clerestory above.
11. **THE BELFRY** (29): untouched - the Abbot's room.

The sprinkler now dresses by place (`L.kits`, read in `src/main.js` and by `tools/dressing.mjs`): skeps and herb beds in
the garden only. Tam's lines (and the Hanging Village's lead-in, the bead errand, the map lines and two signs) now talk
about the goblin in the abbot's chair and the great bell; the Roc and the glass mountain are gone from them.

## 3. The goblin priest's kit

| move | mark | what it does |
|---|---|---|
| THE RITE, `riteTell` 1.5 s | none (QUIET) | unchanged: mends and blesses the goblins in the smoke (half of every blow, 6 s); any blow breaks it. Still the top of its chain. |
| THE CENSER, `censerTell` 0.65 s | `!` yellow | at 56-170 px: the pot swung back, then lobbed on the drunk's arc onto a ring where you stood (10 dmg). The Abbot's cast one size down. |
| THE BELL, `bellTell` 0.45 s | `!` yellow | inside 30 px: the hand bell raised, rung into you (7 dmg and a shove), then it gives ground. |

Ten frames (censer back, censer out, bell up, bell rung; hurt still last: `docs/monastery/priest-frames.png`), four new
sounds, marks written by `node tools/tells.mjs --write`, named in `windingUp()`, bestiary row rewritten, threat 2 -> 2.5.
`tools/gob-priest.mjs` forces every move out of `src/main.js` (red on the old code: no censer/bell cooldown), and holds
the Monastery to at least six priests, each with a flock. Forced again in the real page: both marks read `!`, the censer
hit for 10, the bell for 7, the rite blessed 4 of 4 (`after-priest-*.png`). Seven priests now: the herb garden (26,195,
with the sign that teaches it), the scriptorium (67,171, behind the troll), the refectory (16,151), the dorter (62,131),
the shrines' pair and the crawl's garrison priest. one-new-foe and threat-holes hold.

## The Abbot, before and after

bossLab, normal health, six heroes, dice pinned per row, salted passes:

| | fights | wins | median win |
|---|---|---|---|
| before (batch17), 3 passes | 18 | 4 (22%) | 60.7 s |
| before, 8 passes | 48 | 16 (33%) | 58.1 s |
| after, 3 passes | 18 | 9 (50%) | 65.7 s |
| after, 8 passes | 48 | 20 (42%) | 68 s |

**His room and his code did not change except for one fix** (below). The difference is dice: adding furniture changes
how many dice the level load draws, so every pinned row rerolls. Proof: chunk 2 alone (only furniture changed) gave 67%
on the same 3 salts. At 48 fights, 33% vs 42% is about 1.3 standard errors, and the per-hero swings (knight 2/8 -> 7/8,
pyro 7/8 -> 4/8) go both ways. I read it as unchanged.

The one change: the reroll exposed a latent bug. His congregation could be summoned into the belfry's thorn beds and
stand there unhurt for the rest of the fight (`small-adds`: the knight's pilot swung 45 times over the spikes and
missed 29). A summon that would land in a bed now steps out of it toward him. After the fix small-adds misses 1 of 137 swings across all its rows.

## INDEX

`tools/curve.mjs`: **spire 92 -> 95** (69 -> 73 foes, threat 169 -> 180: four more priests and the priest's new weight).
Gale Moor after it is still 115, so the ramp does not break.

## F9 walk (in-page bot, both passes, `?playtest` harness)

Knight and warden, before and after, same result: reach 98%, walked 101%, 0 deaths. Every finding was already there
before the lane: 1 of 14 sweep frames blank, a fledgling floating at 59,111 at runtime, one STUCK place for a plain run
(tiles 91-93, the goat path), and `mend` unweighed.

## Captures (`docs/monastery/`)

`before-level-0..5.png` / `after-level-0..5.png` (the whole level, top to bottom, no HUD), `after-priest-censer.png`,
`-censer-flight.png`, `-bell.png`, `-rite.png`, `priest-frames.png`, `before-review-belltower.png` (the review's flat-wall
shot), and the four `architecture-*.png` hits in other levels.

## Checks

Green on the last commit: architecture, gob-priest, audit, content-audit, traps, killzones, collectables, spawns,
deadends, floaters, checkpoints, skins, dressing, signs, map-grammar, one-new-foe, threat-holes, elites, ambush-single,
ambush-reach, occluders, ground-depth, additional-areas (+ runtime), tells, boss-openings, boss-fight-end,
arena-supplies, comments, syntax, homepaths, dangling-paths, belfry, false-abbot, readability, runtime-footing,
light-support, render-layers, pixels, textfit, small-adds, normal-health, boss-navigation, combat-feel.

Re-runs and notes:
- **boss-fight-end** was red on batch17 itself (hanging's mini spider): master's `97dc06f` fixes it; green after the merge.
- **small-adds** went red after chunk 2 (the dice reroll above) and was pushed red in `48ed13d`; the thorn-bed fix in
  `c37212a` makes it green. I did not know it was red when I pushed chunk 2 - it was not in my first subset.
- **dangling-paths** failed once only because a new tool was not yet added to git.
- `textfit talk --strict` (not in the suite): 7 COLLIDE on the Causeway's LOW WATER banner, none on the Monastery or the
  Hanging Village. Pre-existing.

## Questions for Daniel (each with a recommendation)

1. **Natural rock is not judged by the architecture rule.** The same load path over the mountain's own rock would catch
   a crag slab over sky, but it has to learn caves, overhangs and hanging rock first. *Recommend: yes, as a second pass
   with its own grandfather list - the Monastery showed the floating-slab look is mostly natural rock on other levels.*
2. **The four grandfathered levels.** *Recommend: the Unburied pillar first (the most visible: a tower chunk hovering
   over the road; a route decision), Waymeet's arcade next (cheap: add a pier in each opening, background only). Leave
   the Harbor (shelved) and ask the Keep's owner about the sunken tower.*
3. **The Abbot's thorn-bed fix** is a behaviour change in his fight, made because it was a bug. *Recommend: keep it; if
   you want his pilot numbers re-baselined, 8+ salted passes, not 3 - 18 fights swung 22% to 67% on dice alone.*
4. **Bot dice are drawn by the level load**, so any furniture change rerolls every pinned boss row of that level.
   *Recommend: reseed bossLab at the first frame of the fight as well as before the load, so pilots measure the fight;
   it moves every recorded row once, so it wants its own lane.*
5. **The garden wall and the arcades are warm limestone like the floors**, which is calmer than the old sky but still
   a mostly beige level. *Recommend: play it; if it reads flat, darken the storey walls one step below the cloud and
   lift the palette chroma, as the level review suggested.*
6. **The Monastery still uses the Roc's music** (`arena.music: 'roc'`). *Recommend: an Abbot track when there is one;
   nothing to do in code until then.*
