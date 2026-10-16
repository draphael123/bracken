# claude/undercrown2 - THE UNDERCROWN 2 + the main-road change (Opus lane, 10-15/16)

Base: origin/claude/batch95 (835128a2; master did not have it yet) + origin/claude/mapforks (merged; one conflict in tools/check.mjs, both lists kept).
Port 8963. Greybox. **Locked behind `ROAD_OPEN.undercrown = false` (src/level.js)**: the art lane flips it.

## What was built
1. **SLABS, not mounds** (new `src/undercrown-slabs.js` + glue in main.js). A roof span sits on a timber post at EACH end.
   - Cut ONE post: that end swings down on the other post (0.5 s animated hinge) and lands as a **tilted ramp** whose collision is the
     drawn slab: slope tiles (gentle / steep / boards spread evenly) along the straight line from the hinge to its foot. Moving bodies take
     the slope path on a slab level (`SLAB_PHYS`); the tile painter never draws the ramp cells (`SLAB_MASK`), `drawSlabs` does.
   - Cut BOTH (or the second post of a ramp): it **drops flat**, `thick` courses: a **bridge** over a gap, a **wall** across a gallery.
   - Kills/staggers what is under the part that comes down; the player under it takes the roof (and is lifted on top, never embedded).
   - Rubble = loose rocks + dust + a small drawn heap (no collision, no stair mounds).
   - Tell (A3): a post that has taken blows makes ITS end sag (drawn wedge + orange edge) and drops dust off that half, with a creak.
   - Persistence: posts via `marks`, cells via `destroyed`, so a death keeps what you brought down. Tomb slabs reset per attempt.
2. **The level relaid** (src/level.js `undercrown()`): TEACH adit (one post, other end keyed - the ramp up is the ONLY way on) -> TEST first
   workings (two posts, a squad + timberman under the span; the warden's bell shuts the gallery and the working overhead is the way round) ->
   REMIX flooded level (planks stop short: near post = ramp, far post struck from the ramp's top = the slab down flat as the BRIDGE) -> EXAM great
   stope (dead water in the bottom, a hung walkway slab: cut its near post, ramp over the gap; a crag troll holds the far walkway) -> last drift
   (both posts = a WALL behind you; one post = a ramp up into **THE PRINCE'S TITHE**, the new secret silver) -> the tomb.
   Roof-drop with fights under it in workings / flood / stope / drift / tomb (5 places). Roles 4 (melee, ranged, support = lamp-snuffers
   reskinned `lampsnuffer`, heavy = crag troll). Foes cut ~35%. Dead water now `waterHurts` (A10: hurt + hand back), not an instant death.
   Stuck guides on every required post (src/stuck-spots.js). Signs are the way IN, under the castle.
3. **THE GOBLIN PRINCE in a propped throne chamber**: three tomb slabs on posts. Cut the post on HIS side while he is under a span -> it
   swings down on him -> **PINNED** (gold ring + timer bar, x2, 3.2/2.8/2.4 s by phase) -> he throws it off and the slab breaks.
   - Between phases his **diggers** rise at the winch beside a fallen slab and prop it again in 3.5 s (killed first, it stays down); P2 re-props
     on 1-blow posts. No court summons any more (no add spam: diggers only, only for a slab that is down).
   - **P3 (<30%): THE WHOLE ROOF IS COMING DOWN** - told chunks (red ring, 0.95 s) on wherever you stand; on him too = pinned; every post on its last blow.
   - Dropped slabs reshape the arena (ramps to a perch in the roof hole, 2-high walls he climbs); **no safe perch**: sat up a fallen slab he
     HEAVES it off its hinge (told !!, 0.8 s). Diggers never re-prop over a hero in the slab's hole.
   - B15: shrouded multiplier 0.35 -> 0.45 (>= 0.4 floor). Out of openings 1.0x. Sink/crown sooner at range (a kiting pyro was never closed on).
   - HP 2000 -> 3150. Lab bot (src/lab.js princeTarget) cuts the post on his side from outside the span.
4. **Main road** (folded in from lane-undercrownroad): `ROAD_OPEN.undercrown`. Flipped: undercrown `needs: 'storm', leadsTo: 'crown'`, no
   hidden/secret/needsKills; Highcrown `needs: 'undercrown'`; a node at (230,40) on the crag road between Stormhold and Highcrown (listed before
   Highcrown when open; saves find nodes by id); **grandfathering**: `PROG.ucRoadMig` once - a save with Stormhold or Highcrown cleared gets
   `PROG.crownOpen` and keeps Highcrown open. tools/map-forks.mjs reads the flag (both branches tested). With the flag TRUE I ran: map-grammar,
   map-spacing, map-scale, map-forks (incl. grandfathering), class-spurs, crown-route, crown-requests, level-jump, save-slots, save-safety: all green.
   Flag false (committed): same set green.
5. Tools: level-quality GATE += undercrown; CURVE_REPORT_ONLY -= undercrown (back in band); reachcore reads `L.reachSlabs` (the route's ramps as
   solid steps, the flood as its bridge); level1-pilot + level-walk get slab hands (src/walk-hints.js `slabHint`, like the cart pilot's).

## Numbers
- Boss, WITH flasks (human, campaign L16, 12 seeds): **knight 5/12, warden 9/12, pyro 10/12, paladin 6/12 = 63% (in band)**, no hero at 0,
  0 timeouts, median fight 82 s (max 173).
- Dry alongside (human+dry, 12 seeds): knight 0/12, warden 3/12, pyro 5/12 = 22%.
- Mash boss 0/6 (boss left 100%). Mash level: dies (2 deaths/hero).
- Level-1 curve: **209% lost, 4 deaths / 3 runs** (act 2 band 70-400%, 0-6) - was 345% / 9.
- level-quality undercrown: CLEARS THE BAR (mechanics 3 in 3+, secrets 2, roles 4, ruleFight 2/2, curve ok, pilot ok, mash ok).

## Checks run (this branch)
green: level-quality undercrown, undercrown-variety, slopes --quick, goblin-lint, signs (undercrown 0 over), stuck (static+runtime 250 spots),
boss-openings, boss-read, boss-fight-end, mash-gate, checkpoint-gaps, deadly-water, spawns, one-new-foe, reach-heroes undercrown, map-grammar,
map-spacing, map-scale, map-forks, class-spurs, crown-route, crown-requests, level-jump, save-slots, save-safety, mobile-perf.
textfit: every scope fits (hints, bestiary incl. the new Prince line, store, tree, pick, trial, erase, opening, press, title) EXCEPT the "plates" (world-map) scope, which never answered (481 s, then 1101 s with TEXTFIT_SCOPE_TIMEOUT=1100) - NOT VERIFIED; with the flag false the map node table is unchanged, so I suspect machine load, but it is an open red for the integrator.
level-walk undercrown (k/w/p, 1 seed): 0-0 deaths, still STUCK at the flooded west shaft top (10,56) and once at the tomb shaft (15,166) -
both are ladder DESCENTS the walker does not take (the shafts are unchanged from the old level); slab hands work (adit, flood, stope crossed).
## Reds (not mine)
- level-reach: `burning: the shut road does not SHOW its rule and the player best time` - also red on the base (76507309, verified in a scratch
  worktree): the 10-15 Burning Village change.
- signs / elites exit 1 on the base too (elites: buriedcity constructs).

## Art for the SONNET ART lane (before the flag flips)
- Own tile kit (mine rock, timbered galleries) - today it wears the crag palette + mine staging.
- Landmark: Highcrown's foundations overhead in the backdrop on most screens (the castle balanced on the hole).
- Slab art: the slab (rock course with a timber cap), the post per blow (split/sag frames), hinge iron, the swing, the ramp lying with its
  foot, the flat bridge/wall, rubble heap sprite, sag dust.
- Tomb: the propped throne chamber (three slabs + posts), the diggers' winch (windlass, rope to the roof), digger crank pose, roof-chunk sprite,
  the Prince's PINNED pose and his HEAVE pose (B16: today heaveTell borrows the sinkTell frame).
- The Prince's Tithe chamber dressing; lamp-snuffer and crag-troll fit check.
- After flipping ROAD_OPEN: Highcrown and everything after it sit one deeper on the road - re-stamp campaign levels / boss rows the flip moves
  (and the 'Prince exception' in design-standard is no longer needed: he now comes before the Queen).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. The flooded crossing: one post gives a ramp you can drop off the top of to cross; the intended bridge needs both posts. **Rec: keep both
   ways** (creative). Built: both work.
2. Dry is 22% (knight 0/12 dry) while with flasks is 63%. **Rec: accept (flasks are the target, B6)**. Built: tuned with flasks only.
3. Dead water: now hurts + hands you back (A10) everywhere, including the stope exam. **Rec: keep for act 2**; built that way.
4. The Prince's "call the court" add is gone (only diggers for a fallen slab). **Rec: keep** - built.
5. ROAD_OPEN stays false until the art passes; **rec: the art lane flips it and re-stamps** - built the flag + tests for both states.
