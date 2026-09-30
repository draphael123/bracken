# LEVEL QUALITY - the bar a new level must clear

Daniel called the Harvest Fair "a prototype - just walk right", and it had passed about twenty checks. Those checks ask whether a
promise was kept; none asked whether the level was any good. `tools/level-quality.mjs` reads a level's data (its grid, entities, gadgets and
the walked main route from `tools/pacing.mjs`) and measures it against THE MAGE'S FOLLY, Daniel's benchmark. No browser, a few seconds a level.

    node tools/level-quality.mjs               the gated levels (registered in tools/check.mjs as `level-quality`)
    node tools/level-quality.mjs <id> [<id>]   any level, in full
    node tools/level-quality.mjs --all         a table of every campaign level (a report, exit 0; about 80 s, run it rarely)

**Gated levels** are the new or reworked ones: `GATE` at the top of the tool (today `theatre`, `fair`). Add your level's id in the lane that builds
or reworks it. A gated id that is not built yet is skipped with a note. The old campaign is NOT gated: many of its levels miss the bar (see `--all`).

## The ten measures (limit; the Folly's own number)

| measure | what it counts | limit | Folly |
|---|---|---|---|
| flat | share of the route columns lying in runs of 20+ columns where the floor stays within 2 rows and there is no gap, spike, foe (8 cols / 6 rows), gadget or arena. Also the same ignoring foes ("level ground") | empty runs <= 30%, level ground <= 60% | 11%, 33% |
| bands | distinct 4-row height bands the route uses; share of columns whose reachable footing spans more than one band | >= 5 bands, >= 40% of width | 8, 61% |
| mechanics | level-specific gadgets: known machine kinds (lever, winch, lock, rune, plate...), moving platforms (`moversExtra` kinds), the level's own machine arrays (gusts, hoists, crumbles, locks...), and any zero-threat kind used by <= 3 levels. A "place" is a cluster of columns 12 apart. Taught, developed, twisted = 3+ places | >= 5 kinds, >= 3 of them in 3+ places | 12 kinds, 4 developed |
| music | its own track, and its boss room's: each is a real track (a file in `audio/`, or a track `src/audio.js` composes itself by name) and BORROWED from nobody - no other campaign level, boss arena or mini plays it, and it is not a stock stand-in (`STOCK_MUSIC`: `marketday`). A boss room may play the level's own track or one of the generic boss pool (`BOSS_POOL`), never another boss's own. Exceptions: `SHARED_MUSIC` | own tracks | musUnder, boss4 |
| secrets | silvers and relics OFF the route (pacing's off-route loot) | >= 2 | 3 |
| checks | checkpoints, and route tiles per checkpoint (Daniel wants fewer). Not "2-4": a 700-column level cannot keep four and stay under the 200-tile rule | >= 2, >= 90 tiles each | 7, 103 |
| encounters | a DESIGNED encounter in every 200 columns: a squad-tagged or elite foe, an ambush room, the mini, or a hand-placed knot of three foes within ten columns | none missing | all four sections |
| density | DESIGNED ENCOUNTERS a screen (24 columns), not bodies: a squad (all its members), an elite, an ambush room, the mini, or a clump of other foes within 8 columns of each other each count once; and the share of screens with no foe | 0.8-2.0, <= 30% empty | 1.03, 23% |
| route | the walked route drops/climbs 8+ rows or doubles back 8+ tiles, AND has 2+ dead-end pockets (branches) | both | 30 rows, 5 pockets |
| slopes | every slope collision cell (ids 20-25) needs drawn diagonal art. Baked sprites are checked against `heightAt`; the level must be one the tile painter reaches (the guard in `src/main.js` before `cvTile`, read by the tool) | no invisible slope | no slopes |

Tall levels (floors, not a walk: Hanging Village, Spire, Deep, Falling Tower, Undercrown, Crown, Keep, Burial, Witchlight) skip flat and density.

## Why the limits sit where they do

Each is set so the Folly clears it with room and the old 672-column Harvest Fair does not (flat 49%/87%, 2 bands, one gadget, no designed
encounter in three sections, 0.5 foes a screen, 24 slope cells with no art, a flat route). The density floor is 2.0, not the 2.5 of DESIGN B7: that
bar was written counting every non-pickup entity (runes and glyphs too); counting foes only the Folly reads 2.4.

**Density counts encounters, not bodies** (claude/fairfix, 2026-09-30). Counted in bodies, this bar and "fewer, better foes" (LEVEL-DESIGN-GUIDE section 2)
pulled against each other: the rebuilt fair had every foe in a designed encounter and failed density at 0.6 foes a screen, and the cheap way to pass
was padding. Now a squad of three is one encounter, a lone elite is one, a sprinkle's clump is one. The Folly reads 1.03 encounters a screen (32
encounters, 2.4 bodies); the campaign's walking levels read 0.68-1.56. The floor is 0.8, the ceiling 2.0; the empty-screen share is unchanged.

**Music is judged on what is borrowed** (claude/fairfix). The first version passed any level with a track name set whose file existed, so the fair passed
on `marketday` (a stock tune) and its boss room on the Houndmaster's own track. Now a stock stand-in fails, another level's or boss's track fails, and a
track the synth composes (the fair's `harvestfair` and `wickerqueen`) counts as real.

## What it does not judge

It cannot see whether a level is fun. It catches the failures that are visible in data: flat, one-idea, empty, unmusical, invisible. A level can clear
it and still be dull; a level that misses it is not ready to be called done. The fair's music passes on its own band organ (`harvestfair`, the boss room
`wickerqueen`); on `marketday` it fails.
