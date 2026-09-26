# Lane report: `claude/sandledge` — THE SUNKEN CARAVAN's ONEWAY/PLANK art: sand and stone, not wood

Daniel, 2026-09-26, of the Sunken Caravan: "it's good but uses wood platforms at a point. It should use sand platforms or more
appropriate terrain." ART ONLY: no tile was moved, no collision changed. Everything below is on `claude/sandledge`, off
`origin/master` `b3dec71` (nothing new landed on master while this ran, so no merge was needed at the end - checked with
`git fetch origin master`, still `b3dec71`).

## What was actually wrong

The level has 79 `T.ONEWAY` tiles and 13 `T.PLANK` tiles. `main.js`'s generic tile dispatch had no idea it was in a desert:
- **65 of the 79 ONEWAY tiles** (every ledge inside a tower, a house or the caravanserai - `L.masonry`) drew `LEDGE_SETS.masonry`,
  the CASTLE's grey coping stone (the fix `footing-art.mjs` earned on Highcrown, Kingswood, the Monastery), not the ruin's own
  pale ashlar.
- **The other 14** (THE GREAT RIBCAGE's spine, over the quicksand basin - not inside any wall, not against any cliff) drew
  `TILE.log`, the game's default felled-timber ledge.
- **All 13 PLANK tiles** drew `TILE.plank` (also the default) - but all 13 are real wood: the lead wagon's tipped bed (4), a
  market stall's board (4) and the trader's tent platform (5). Nothing needed to change here; I checked each run (below).

So "wood platforms at a point" understates it a little (some of it was generic castle stone, not wood) but the diagnosis is the
same either way: nothing on that list looked like the desert it's built in.

## The fix

**`L.ledgeKit = 'desert'`** (`src/sunken-caravan.js`) is a level option, not a caravan special case - any later desert level can
set it. `main.js`'s ONEWAY and PLANK dispatch (`resolveTiles`, ~line 850-940) now asks, per tile, where it actually sits:

| where | art | baked in |
|---|---|---|
| inside `L.masonry` (a tower, a house, the caravanserai) | `LEDGE_SETS.ruinLedge` — a broken course of the same pale ashlar the walls are, joints and a crack | `bakeRuinLedge()`, `src/redraw/caravan_ruins.js` |
| against `L.rockZones` (the arch, the rim's overhang) | `LEDGE_SETS.rockShelf` — layered sandstone, the same `ROCK` palette as the slopes, strata running through it | `bakeRockShelf()`, `src/redraw/desert.js` |
| neither (open sand) | `LEDGE_SETS.sandLip` — a weathered lip in `DESERT` dune colours, wind-pitted, an undercut shadow | `bakeSandstoneLip()`, `src/redraw/desert.js` |

Each is the same 16x16 shape as the game's other ledge sets (a body, `ledgeL`/`ledgeR` end caps, three body variants so a run
doesn't repeat one picture) so a run of them tiles exactly the way `TILE.log`/`LEDGE_SETS.masonry` always did. The desert kit
wins over the generic castle-masonry check (`crownT`) — a ruin is not a keep, even though both set `L.masonry`.

**Real timber stays wood, on purpose, not by falling through the cracks.** `src/draft/sunken-caravan.js` now records every
`T.PLANK` run it lays as `L.timberPlanks` (a `timber(x0,x1,y)` call next to each `set(..., T.PLANK)`): the lead wagon's bed,
the market stall's board, the trader's platform, and (for a future level) a sunk wagon's top. `main.js`'s PLANK dispatch only
applies the desert kit where the tile is *not* one of these - RULES B9, it has to look like what it is.

There was no `T.ONEWAY` tile against `L.rockZones` in this level (the rock zones so far - the arch, the overhang - are built of
`T.SOLID`, already skinned as rock by the caravan's own `cvTile`), so `rockShelf` isn't exercised here yet; it's there for the
next desert level that puts a one-way ledge on a natural cliff.

## Files changed

- `src/main.js` — `resolveTiles()`: three new `LEDGE_SETS` entries baked lazily (`sandLip`, `rockShelf`, `ruinLedge`); a
  `desertLedgeAt(x,y)` helper; the ONEWAY branch takes it over `crownT`; the PLANK branch takes it unless the tile is in
  `L.timberPlanks`. Also added `BK.tileArt()` (exposes `TILE`/`LEDGE_SETS` by reference) so a check can ask "which picture,
  by identity" instead of eyeballing a screenshot.
- `src/redraw/desert.js` — `bakeSandstoneLip(seed, end)`, `bakeRockShelf(seed, end)`.
- `src/redraw/caravan_ruins.js` — `bakeRuinLedge(seed, end)`.
- `src/draft/sunken-caravan.js` — `timber(x0,x1,y)` / `L.timberPlanks`, called at each of the four `T.PLANK` sites. No tile
  moved; this only records what was already there.
- `src/sunken-caravan.js` — `L.ledgeKit = 'desert'`.
- `tools/desert-ledge-art.mjs` — the new check (below).
- `tools/check.mjs` — `desert-ledge-art` appended inside the existing list (checked `grep -q "\['tools/' + t + '.mjs'\]"` still
  matches; nothing added at the front).

## The check: `tools/desert-ledge-art.mjs`

Loads THE SUNKEN CARAVAN for real (`resolveTiles`, as the game runs it) and asks of every ONEWAY/PLANK tile: is its drawn
picture (by object identity via `BK.tileArt()`, not by eye) the game's default wood (`TILE.log*`/`TILE.plank*`)? Allowed only
inside `L.timberPlanks`.

**Proved red first (2026-09-26):** stashed the five source changes and ran it - failed (`BK.tileArt() is not exposed`, since
that hook is part of the fix). Before that, with a throwaway debug hook, the actual old-code identity counts were
`{masonry: 65, log: 14, plank: 13}` against zero `L.timberPlanks` (it didn't exist yet) - i.e. every one of the 92 tiles would
have failed a "no default wood unless real timber" check, and 65 of them would have failed it even harder (they weren't wood,
they were the wrong stone). After the fix: `{ruin: 65, lip: 14, plank: 13}`, all 13 plank tiles inside `L.timberPlanks`, check
green.

Added to `tools/check.mjs`'s list (append, not front - checked the grep the lessons file asks for).

## Checks run (named subset, never the full suite)

`npm run check -- caravan-level,draft-level,dune-worm,uphill,readability,footing-art,dressing,skins,pixels,audit,content-audit,architecture,comments,syntax,homepaths,dangling-paths,desert-ledge-art`

```
 ok  syntax             0ms  7 files parse
 ok  comments         142ms  no swallowed code found.
 ok  homepaths        187ms  483 source and tool files, none hardcodes a path under a user's home directory.
 ok  dangling-paths   257ms  2091 tracked files, every repo path they cite resolves in a fresh clone (6 known holes, pre-existing)
 ok  audit           4657ms  caravan (578x40) clean
 ok  content-audit   7603ms  20 things to look at. (pre-existing, unrelated to this change)
 ok  skins          16182ms  every roof picture sits on the slab you stand on.
 ok  dressing       11613ms  no sprinkled decoration within three tiles of a fire on the floor.
 ok  readability      214ms  scenery behind tiles, softened outline-free art, wall-grip feedback, 13 homes and two landmarks.
 ok  dune-worm      19612ms  four told attacks forced and landed, the breach true to its spot, the storm his and phase two's.
 ok  architecture    3819ms  44 levels, 321 built pieces declared; 3 grandfathered (harbor, waymeet, unburied).
 ok  footing-art    62295ms  every floor cell you can stand on is drawn, in 27 levels.
 ok  uphill         19420ms  steep 63 up / 101 down, gentle 74 / 101
 ok  desert-ledge-art 17400ms  no ONEWAY/PLANK tile in THE SUNKEN CARAVAN draws the default plank art unless it is real timber (13 timber tile(s) exempt)
 ok  pixels         65589ms  32 levels, 2721 sprites. nothing in the air, through the ground or out of the water.
```

15 named + the new one, all green. `caravan-level` and `draft-level` are unaffected (art-only change; the greybox and its
measurements never touched a pixel). One caught-and-fixed mistake along the way: my first version of the code comment in
`main.js` read `src/redraw/desert.js/caravan_ruins.js` (two paths run together with a slash) and `dangling-paths` correctly
called it a citation to a path that resolves nowhere - fixed to two separate names in the comment, re-ran, green.

## Captures

`work/sandledge/` — `before-*`/`after-*` pairs at the three named spots, 640x360, rendered the same way `tools/caravan-shots.mjs`
does (`BK.step`, god mode, real render, not `node-canvas.mjs`, which doesn't draw light and lied about this once before per
`docs/AGENT-HANDOFF.md`):
- `sandstone-lip` — THE GREAT RIBCAGE's spine (col 203, row 23): before, a wood-log walkway over the quicksand basin; after,
  a weathered tan sandstone lip that matches the dune it hangs over.
- `tower-lintel` — inside THE WATCHTOWER (col 148, row 24): before, cold grey castle-coping ledges against the warm ruin wall;
  after, the ledges are cut from the same pale ashlar the wall is, and read as one structure instead of two.
- `wagon-top` — THE LEAD WAGON's tipped bed (col 97, row 27): unchanged in both, on purpose - it's a wagon.
`work/sandledge/shots.mjs` is the scratch script that took them (not a check, not added to `tools/`).

## UNVERIFIED

- I did not play this by hand (no god-mode-off walkthrough); the captures and the checks are automated. `dune-worm` and
  `footing-art` both passed, which is the strongest automated signal that nothing about standing, jumping or the worm's
  fight changed - but a person's eye on the new stone-vs-sand contrast (does the ruin ledge read clearly enough against the
  wall behind it, at speed, mid-fight) is worth a real playtest.
- `rockShelf` (the third kit) has no ONEWAY tile to exercise it anywhere in this level today - I baked and wired it because
  the task asked for it and a future desert level will have one, but nobody has looked at it rendered in place, only in the
  captures' absence. Worth a quick render if/when the next desert level uses a one-way ledge on a natural cliff.
- I did not re-measure `tools/content-audit.mjs`'s "20 things to look at" against a pre-existing baseline - it was already
  passing (the check is informational, not a hard fail) and nothing in this change touches content, only art, so I read it
  as unrelated, but I didn't diff it against master to be certain the count didn't move.

## QUESTIONS FOR DANIEL

1. **PLANK exceptions beyond wagons.** Your instruction named "the wagon tops... and any other real timber the level builds,
   e.g. scaffolds if any" for what stays wood, but the pass/fail check you asked for is phrased more narrowly ("unless it is
   on a wagon"). Two of the 13 PLANK tiles are the market stall's board and the trader's tent platform - not wagons, but
   built wood furniture in the traders' own camp. I kept both as wood (they're real timber the level built, matching the
   broader instruction) and wrote the check against `L.timberPlanks` (an explicit, itemized list: wagon bed, sunk wagon
   tops, stall board, tent platform) rather than literally "is this tile on a wagon". **Recommendation:** keep them wood -
   a market stall and a tent platform in a trading camp are exactly the "any other real timber" case, and re-skinning a
   plank floor under a tent's own relic as sand would look like a mistake, not a fix. Say so if you'd rather those two also
   went to sandstone.
2. **The generic castle-masonry ledge (`LEDGE_SETS.masonry`) is used by any level with `L.masonry` and no more specific
   kit** - this fix only carves the desert out of that rule. Highcrown, Kingswood, the Monastery and the Unburied Field
   still get it, which is presumably fine (a castle IS a castle), but it means the same "wrong stone for the place" issue
   this lane fixed for the desert could in principle exist anywhere else `L.masonry` is used generically. Not touched here
   (out of scope: this lane's brief was the caravan only) - flagging in case it's worth a look later.
