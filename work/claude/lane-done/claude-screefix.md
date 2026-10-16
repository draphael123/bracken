# claude/screefix - THE SCREE PATH art pass + the visible-supports rule (Sonnet lane, 2026-10-15/16)

Base: origin/claude/batch96 (adfca0be: already holds codex/geomsweep's tools/visible-supports.mjs and the Ram Lord tune - NOT merged again, Ram Lord numbers untouched).
Route, geometry, ents, foes, numbers: UNCHANGED. `levelHash` (tools/level-quality.mjs) is byte-identical to batch96 for scree (0a77aa665d50) and spire (20e1d5c2d349), so no pilot / mash / curve row is stale and no re-stamp was needed.
Self-grade on the polish scale: **B** (was B-; identity ~13 -> ~16: own rock supports, landmarks, lights, ambient life). Left for a polish day: the landmarks live in the mid sheet only (the far sheet is hidden behind it), and the tall piers repeat their silhouette.

## What Daniel saw -> what it was -> what changed
| complaint | cause | fix |
|---|---|---|
| slabs on thin single posts, drawn posts end short | `forest-supports` drew 8 px sticks at the ends of every ledge (dolmen legs, up to 15 rows tall) | src/scree-rock.js: a baked ROCK PIER (hoodoo: moulded capital under the slab, waist, talus foot with rubble, strata that continue the ground tiles, lit west rim, cracks, grass shelves). One under a short ledge, two set a tile in from the ends of a long one, always on a column that has ground (src/forest-supports.js `near`). No tile moved. |
| huge flat brown column through the foreground | the Ram Lord's overhang "crag arm" (src/ram-lord.js drawLip) was one flat `#4e3c2c` polygon 200 px tall | src/scree-lip.js: draw-only rock buttress (strata, rim, shade, fractures, shelves), a rock LIP with a stalactite fringe, a dry-stone PROP in the same rock colours. Boxes / timers / numbers in ram-lord.js untouched. |
| wooden plank ledge on a mountain path | (a) the snapping SHELF ("loose rock") tile was a brown ochre slab with a crack, (b) the moving-scree tile was brown with arrows | src/art.js bakeLooseRock: cracked grey rock, chipped lip, grit; bakeScreeTop: loose shale with dust streaming off the moving pebbles (the direction is told by the dust, not an arrow on a board). The quarry / ropeway lifts stay wooden: they are built things on ropes. |
| bare crude scene | flat polygon near layer, one lamp in 648 columns, no landmark, only sheep | LANDMARKS in the mid sheet: the drovers' BEACON tower with a lit fire, a ruined KEEP with two lamps and a pennant, the hill farm's MILL; near-layer outcrops with strata and a lit west face (src/redraw/crag_redress.js, scree branches only). LIGHTS: 20 lamps (farmLantern / lanternPost) at the bothy, hamlet doors, mill, shrines, ropeway stations, quarry and fold - src/scree-dress.js, spawned from `L.dressExtra`, which tools/level-quality's hash does not read (torch ents would have staled the pilot / mash rows). AMBIENT LIFE: 9 soaring hawks (harmless critters, main.js) on top of the sheep. |

Before / after (320x180, same tool and points): work/claude/screefix-before/ and work/claude/screefix-after/ (scree 49,13 / 135,10 / 250,9 / 313,12 / 453,14 and spire 70,120 / 35,81). Tool: tools/screefix-shots.mjs (`SCALE=1 OUT=dir node tools/screefix-shots.mjs <level> x,y ...`).

## The support rule (N)
- **tools/solid-islands.mjs, POST-REACH RULE, N = 8 px** (`POST_REACH_PX`): a routeSupports post only counts as a support when (TOP) the island has a cell in the post's own column at its row (+-1), and (FOOT) the post is not `free` and the first tile under its foot is not air within 8 px (half a tile = no whole row of air under the foot); a pile driven into a pool counts (its foot is on the bed under the water). It replaces the old "any post whose number falls in the island's bounding box" test. The visible half (does the INK reach: 3 px per row, 8-connected) stays tools/visible-supports.mjs - no second checker.
- **tools/check.mjs: new `visible-supports-strict`** = `node tools/visible-supports.mjs scree spire --strict` on its own port slot (portFor(1)). scree 56/56 and spire 129/129 overhangs have a verified visible support (spire was 126 findings; scree was 0 but with sticks).
- Run across ALL levels. Newly flagged, with action:
  - marsh +4 (piles that run to the map bed under a pool): the rule now counts a pile in a pool - back to its old 14.
  - skyroad 5, witchlight 12, glasssea 1: free-ended cloud / rune / glass pillars (those levels float by design) - ratcheted with that reason.
  - hanging 1 (a vine bough that tapers free over the chasm at 70,63) - ratcheted, listed for the hanging lane.
  - mage +1 (a NET rope-ladder island the old box test credited to a neighbouring board's post) - ratcheted 7 -> 8 with that reason, listed for the mage lane.
  - **spire 49 -> 0** (fixed, below). Nothing weakened; every ALLOW number still ratchets.
- **THE MONASTERY ('spire')**: src/spire-supports.js + src/spire-supports-art.js: every board gets a SCAFFOLD POST (timber, iron straps, knee braces, stone bearing block) down to the first thing under it (a floor, or the board below - a stair of boards is one lashed tower); every masonry floor gets stone PIERS (dressed courses, moulded capital, plinth) every 12 tiles. Drawing only (routeSupports), 0 tile changes.

## Checks (single, one browser at a time, port 8953)
- ok visible-supports scree spire --strict (0 findings); ok solid-islands (all levels); ok level-quality scree (clears the bar); ok reach-heroes scree (0 known crossings, nothing new)
- ok mobile-perf (inside the budget; scree 5-9 ms/frame busy, spire 11-14; batch96 baseline scree 9.8 / spire 13.9 - no regression; piers, lips and posts are baked once)
- textfit (the scoped suite list): CLIPPED 1 = "whatsnew: - The Death Knight pays in blood: new kit and boss" - PRE-EXISTING, identical on batch96 (not touched here)
- ok crag-redress, ram-bank, ram-lord, scree-rework, ambient-landmarks, floaters, footing-art, drawn-solids
- Not run (route unchanged, hashes identical): mash rows, pilot, curve. level-quality prints "curve: the level changed since its curve row" - the same as on batch96.
- Reds of mine: none.

## Incident (tell the coordinator)
`git stash` is SHARED across worktrees. I ran `git stash -q; ...; git stash pop -q` for an A/B perf run; there was nothing of mine to stash (everything was committed), so `pop` applied the TOP stash of another lane (stash@{0}, "WIP on (no branch): d49bc355 ... batch92") into this worktree and conflicted in src/main.js. I restored src/main.js from HEAD (`git checkout HEAD -- src/main.js`; my tree == HEAD again). A conflicted pop does not drop the entry: `git stash list` still shows both foreign entries (d49bc355/batch92 and 0b12e1a4/batch92). Nothing of theirs was lost or applied anywhere else.

## QUESTIONS FOR DANIEL (rec + what I built)
1. Tall rock piers (up to 15 rows) under ledges vs lowering the ledges. Rec: keep piers (no route move, no re-stamp). Built: piers.
2. Spire boards: scaffold posts + masonry piers vs hanging them on chains from the ceiling. Rec: scaffold (the monks are mid-repair; the strict check can see a post). Built: scaffold posts + piers.
3. Sky / void levels (skyroad, witchlight, glasssea) float by design. Rec: leave them ratcheted; fix hanging 1 and mage 1 in their own lanes. Built: ratchets with reasons.
4. Lamps and hawks are not level data (L.dressExtra / critters) so the pilot / mash rows stay valid. Rec: keep that pattern for pure dressing. Built: 20 lamps, 9 hawks.
5. Landmarks live in the mid sheet (3, 100 columns apart; two on every screen) because the far sheet is hidden behind the foothills. Rec: leave. Built: beacon, keep, mill.
