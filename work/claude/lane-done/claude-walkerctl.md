# claude/walkerctl - WALKER CONTROLS (2026-10-09, sonnet, PORT 8795) - test tooling only, no level changed

Daniel 10-09: the campaign WALKER (tools/level-walk.mjs) was stuck at Stormhold on its OWN controls, not the level (reachcore's diagnosis). Taught generically.
Branch `claude/walkerctl` (off batch80 master + `origin/claude/reachcore`). Files: `src/walk-graph.js` (new), `tools/level-walk.mjs`, `src/playtest.js` (3 opt-out flags on
the bot), `tools/walk-controls.mjs` (new check, registered in `tools/check.mjs`), `tools/reach-heroes.mjs` (syntax fix, below).

## What the walker can do now (all generic; nothing Stormhold-only; no walk-hints used)
1. OFF-FLOOR KEYS (`src/walk-graph.js` = the reach fill's own edges + a Dijkstra; page side in level-walk.mjs "SUB-ROUTES"): for a shut lockgate on the route whose key stands off the
   floor, the graph gives route -> key -> back onto the route; the hands walk it node by node (a node counts when reached within a tile and a row), the key first, and once it is in
   the pack straight back onto the route. Brass key (44,22): net + plank + a scalder on the net's top; iron key (299,20): the Bell Watch zigzag of nets; bone key (528,21).
   Also planned from where he stands if a dash carried him past the planned start.
2. NETS: up a net of any height (the chimney slots are 12 rows), off it sideways with the game's net jump (clears ~2 rows; a higher ledge: on up until within one), to the top rung.
   A pit escape (2.5 s off the route by > 4 rows) routes back onto it from where he stands (graph path), re-routing if he is knocked off the path.
3. THE ZIGZAG ONE-WAY STAIR (484-499): a gap hop between ledges is a RUNNING LEAP (from rest the arc is 3 tiles and lands short): walk back along the ledge for the run, leap at the
   tip, flown without the bot (its own hop at every landing cut the leap short). Used only once the plain hops have stalled (200 frames without a new best node), never with a foe
   at the elbow, never with a wall between the ledges.
4. THE ONE-WAY PLANK at 572,26: not reproduced as its own stuck any more (the key trip + drop rules take him past); `noDrop` keeps the bot from dropping through a ledge when
   the way on is not under him (it dropped off the brass-key plank mid-fight), but looks four nodes ahead so a reef plank in the water still drops.
5. Walker bugs found on the way (each cost a minute of a minute-long walk): it STRUCK the kennel (drop) winch at 393,29 and shut the gate on its own road; the bot's door-hunting
   ("still 60 frames: walk to the nearest door") took a hero 40 tiles back west every time a pike held him (now off on a level whose keys are off the floor); a stale
   "climb the ledges under a shut portcullis" plan outlived an ambush wall and made him jump under a plank for ever; **the progress clock could be re-earned for ever by a door loop**
   (a teleport lowered riSince, so every lap counted as progress and the walk ended 'frames' at 36000 frames instead of STUCK) - progress is now a NEW best route node.
- Switches: `--subs=0` (no side trips/escapes), `--legacy=net,drop,climbx,keywalk` (turn single hands back off, for bisecting), `--nofoes=x0-x1` (read the footwork alone),
  `--dk` (trace the keys at three points of the hands). Trace tags: S<k|e> sub-route, h<phase><node><dir> leap, R rope, H/W/K/U/L who set the goal, F<foe>.

## Stormhold (id `storm`), campaign level 13, typical build, human+first - walked % vs MEASURED %
| hero | before (master + reachcore) | after, seed 1 | after, seed 2 |
|---|---|---|---|
| knight | STUCK, 5 stucks (67,35 290,31 344,31 475,43 576,29), walked 90, measured 18 | BOSS, 0 stucks, walked 91, measured 91 | BOSS, 0 stucks, 91 / 91 |
| warden | LOCKED at the first gate, walked 14, measured 0 | BOSS, 0 stucks, 91 / 91 | BOSS, 0 stucks, 91 / 91 |
| pyro | LOCKED, walked 33, measured 0 (2 stucks) | BOSS, 0 stucks, 92 / 92 | BOSS, 0 stucks, 92 / 92 |
6 of 6 final walks (seeds 1-2), 0 STUCK, 0 deaths, to the boss, measured = walked. Before: 18 / 0 / 0 % measured.

## Other levels, knight / warden / pyro, seed 1, before -> after (end, walked %, measured %, stucks, deaths)
| level | knight | warden | pyro |
|---|---|---|---|
| ksar | boss 97/97 s0 -> same | boss 97/**77** s1 -> boss 97/**97** s0 | boss 97/97 -> same |
| hanging | FRAMES 9/0 -> **boss 93/1, 5 stucks** | FRAMES 9/0 -> boss 93/1, 5 stucks | FRAMES 9/0 -> boss 93/10, 4 stucks |
| spire (the monastery) | stuck 67/12 s3 -> stuck 71/12 s3 | stuck 69/12 s3 -> 67/11 s3 | stuck 68/12 s3 -> **90**/12 s3 |
| glasssea | FRAMES 26/25 -> same | FRAMES 26/25 d1 -> same | FRAMES 73/46 s1 d3 -> **boss 97/47 s2 d0** |
| rootway | boss 94/94 -> same | boss 94/**31** s2 -> boss 94/**94** s0 | boss 94/94 -> same |
| crown | route 99/78 s2 d3 -> wall 58/47 s1 d8 | wall 21/19 d8 -> same | wall 46/39 d8 -> frames 87/55 s3 d3 |
| reef | boss 96/18 s1 -> same | boss 96/37 s1 -> same | boss 96/18 s1 -> same |
Better: storm, hanging (from a frozen walk to the boss), ksar warden, rootway warden, glasssea pyro, spire pyro, crown pyro. Equal: the rest. Worse: **crown knight** (3 deaths and the
route end -> 8 deaths at the shaft's falls); the crown shaft (x 379-426, y 45-63, nets and planks over a drop to the map bottom) kills knight AND pyro in both runs
(baseline pyro 8 deaths there too) - the knight before got through on a lucky third go; with `--from=384` the new and old walker progress the same (60 / 59 %). Treat as noise
on a hard shaft, not as a regression of the controls - one seed each, I did not measure it 5 times.

## What still sticks (the walker's hands or the level - NO level changed, reported only)
- reef 266,14 (all 3 heroes, before and after): an eel lunges at the gap 261->266; the hero stands at 261 for 1500 frames. Hands (wait out the lunge) or level.
- spire: vent at 76,177 (a steam vent the hero should ride; the hands do not know vents), 23,117 / 29,117, 28,90 `pwheel` (a machine the walker does not work).
- hanging: 52,104 / 52,101 (a 14-row net at col 52 next to a door at 60,107; the bot's door-hunting pulls him to the goblin doorways), 101,67 / 103,69, 38,37, 3,33.
- glasssea knight/warden: FRAMES at 26 % - a hint HOLD (the mirrors) resets the stuck clock every frame, so a hold that never ends is never a STUCK (pre-existing; not touched).
- crown: the shaft above (deaths, not a stuck), and `THE FIRE` at 123-140,69 kills the warden 8 times (both runs).

## Checks (all on PORT 8795 / node, this branch)
- `tools/walk-controls.mjs` NEW (node: the graph finds every Stormhold key trip + the stair; page: brass key got in 18 s, stair climbed, chimney slots out, winch left alone): ok.
- `tools/level-walk-selftest.mjs` ok. `tools/dangling-paths.mjs` ok. `tools/modulepreload.mjs` ok (353 listed, 2 reachable unlisted, budget 15 - unchanged; walk-graph.js is imported only by the walker).
- `tools/reach-heroes.mjs`: **it did not parse on the reachcore tip** (an apostrophe in `claude/scree2's rework` in three KNOWN reasons broke the syntax gate); fixed here (the word `'s` dropped,
  nothing weakened) -> ok, 114 known crossings, nothing new. REACHCORE will hit the same three lines when it merges (trivial).
- `node --check` on every file touched. Not run: the full suite (`tools/check.mjs`; PORT 8795 only, the suite wants its own port block) - the integ run covers it.
- Reds: none from this lane. Disclosure: I ran one `pkill -f reach-heroes` by mistake (no such process was running, so it should have killed nothing; if another lane's reach-heroes
  died around 19:40 on 10-09 this is why). Every other kill was by PID of my own chain/node (a stale chain and one hung level-walk).

## QUESTIONS FOR DANIEL
1. The new controls are ON by default (`--subs=0` turns the trips off). The stuck clock is stricter (a new best route node), so levels a door loop used to hide (hanging) now READ as stuck:
   REC keep. Built: yes.
2. The remaining sticks above are walker-hand gaps more than level faults (vents, a pwheel, hint holds, an eel lunge, door-hunting). A second small hands lane (sonnet)? REC yes: vents + hold timeout
   (a `hold` older than 60 s counts as stuck) first. Built: report only.
3. Crown's shaft kills knight + pyro in the walker (and the fire kills the warden): level or hands? Not changed; REC: the crown lane looks at it with `--from=384 --nofoes` first.
