# claude/towpathchurch - TOWPATH FIX + CHURCH ROAD (SONNET lane, 10-16)

Base: origin/master 7ade0605 (BATCH96, not moved). Brief: scratch/lane-towpathchurch-1016.md, scratch/brief-crusader2-1016.md section 3, scratch/brief-church2.md section 1.

## PART 1 - THE TOWPATH
- **1a MISSED BOAT (soft-lock).** Cause: the aqueduct's barge (`trough('aq')`). Strike the west sluice and do not board: the barge floats to the east stop, docks empty, and the only sluice
  that sends it back is the east one - across the broken span. FIX (src/towpath-hands.js, TP.bargeBackT = 4 s): a barge docked EMPTY with a living hero at the other end of the span is poled
  back to him ("THE BARGEMAN POLES THE BARGE BACK TO YOU"); a hero aboard, or at the barge's own end, is never robbed of it; the far-sluice line now says WAIT, THE BARGEMAN POLES IT BACK.
  Every other ride was checked and has a way back: punts (a paddle on the bank and on the punt), the sack hoist (a winch each floor), the crane hook (a capstan quay and roof), swing bridges
  (a capstan each bank). Only the barge was one-ended. Caught by: tools/towpath.mjs (fake world: miss, comes back, again, a rider is not robbed) and tools/towpath-exits.mjs (REAL KEYS, 5 heroes:
  strike, do not board, it docks, it comes back, board with a running jump, ride, walk off east).
- **1b LETHAL WATER MUST READ.** src/main.js `drawDeadWater` (the look of every pool you can neither swim nor wade): near-black fill under a sickly-green tint, a pale fog-skin with a sick glow on it,
  churning froth, froth heaped at the gates and banks, sucking eddies (rings turning), drowned planks and staves and a pale hand reaching up. Told once a level, the first time one is on screen
  (A3): THE LOCK WATER DROWNS (the Towpath), THIS WATER DROWNS (elsewhere); a sign on the first screen says it too. Contact: grey-green spray, a hard splash and a hurt shake (was the bright
  blue splash of swimmable water) on top of the existing bite-and-hand-back. **Non-swimmable water that now reads lethal (tools/lethal-water.mjs pins the list):** wood 5 pools, marsh 9,
  canal 11 (locks, cuts, the Lantern Eater's), towpath 13 (locks, pounds, the river, the Fog Knight's cut and lock). Left with their own looks: fire (crown), poison/deadly (undercrown,
  falling tower), tarns (moor), rapids (red gorge), mud, capped. Lock A's low water is `shallowLo` (a wade by design) and still reads as water you wade.
- **1c FOG KNIGHT EXIT.** The gate stood at `AX + W - 2, AR - 1` = INSIDE the upper quay's solid block (rows hi..., the quay is filled to the wall): buried, no hero could ever reach it.
  It now stands on the arena floor (FK_STAGE.exit = col 38: east of the cut and its bridge, west of the lock gate, clear air, floor under it). tools/towpath.mjs asserts the geometry;
  tools/towpath-exits.mjs plays it with real keys (he falls, the gate opens, RIGHT held with a jump over the bollards: level won, 5 heroes). The full room / fog-weir rework is next week.
- The hill path boards (the first screen's second height) went with the church fork, which dropped the Towpath's "second height" share under 40% - **the keeper's gantry** (a plank walk
  over the bank and the river path, on its poles, coins) replaces it: 42%. level-quality towpath: every gated level clears.

## PART 2 - CHURCH ROAD
- THE LIT CHURCH row: `needs: 'waymeet', spurOf: 'waymeet', votiveLamps: 'waymeet'` (was needs towpath + opensOn towpath bronze). The Towpath's first-screen church door, hill path and
  `tpchurch` hooks/ctx.enterLevel are gone (the lychgate stays as scenery).
- WAYMEET: three dark votive lamps on short lofts over the street (ladder, plank on poles, lamp on the plank) with a brazier a few steps from each: v1 the west road (col 16), v2 the market
  cross before its hall (col 90), v3 the beer garden (col 296) - one in each fight-free stretch, 60+ columns apart, none on the critical path. src/votive-hands.js: E at a brazier
  takes a flame, E at a dark lamp with it lights it; lit lamps SAVED (PROG.votive); the third sets PROG.churchOpen. Glint + 10 s stall nudge (STUCK_HANDS.waymeet, A6); "ONE / TWO OF THREE
  VOTIVE LAMPS BURN", "THE THIRD LAMP BURNS: THE HILL ROAD TO THE LIT CHURCH IS OPEN".
- **Shared flame verb**: src/flame.js (FLAME, take, burn-down/blow-out, hole, hand) - src/lit-church-hands.js now calls it (behaviour identical, lit-church 330 checks unchanged); the votive hands call
  the same module. Art is the church's own lamp-stand and brazier (church_set.js).
- Map: the church node hangs off WAYMEET (x 8, y 168, between Waymeet and the Towpath's side of the sheet; spur band, node boxes, plates re-solved with tools/map-plates-solve.mjs). Locked tip:
  "LIGHT WAYMEET'S VOTIVE LAMPS n/3". map-forks: church waymeet --left/down--> church --right/up--> waymeet.
- **Grandfathered**: progDefaults `churchMig` - a save with a Towpath medal of bronze or better, or the church cleared, keeps it open (PROG.churchOpen). A fresh save with a Towpath gold medal
  and every level cleared does NOT (tools/church-road.mjs).

## STATED ASSERTION / TOOL CHANGES (deliberate design changes, nothing weakened)
- tools/towpath.mjs: the first screen has no church door and no `fork`; the church row hangs off WAYMEET.
- tools/lit-church.mjs + src/lit-church.js FORK: the road is a spur off WAYMEET opened by the lamps (was "needs waymeet / towpath, opensOn towpath").
- tools/level-reach.mjs: a votive road is shut (with the tip) until the lamps burn, steps on after; the sim lights the three once Waymeet is cleared (they are lit inside it: tools/church-road.mjs).
- tools/reach-heroes.mjs: WAYMEET's lamps and braziers are route targets for every hero (all 9 reach them, 0 crossings).
- STATED re-stamps (docs/): towpath mash row (level + boss rows unchanged otherwise), towpath pilot and curve, waymeet pilot and curve.

## CHECKS RUN (PORT 8974, one browser at a time)
towpath 323, lit-church 330, lethal-water, church-road 41 (A node, B page: shut with Towpath gold, flame/lamp/saved/reload, blow + burn-out, 1/3 2/3 3/3, old saves, real-key climb x3 heroes),
towpath-exits 45 (5 heroes), map-forks, class-spurs, level-reach, save-safety, map-spacing/scale/grammar, solid-islands, reach-heroes (waymeet+towpath+church), stuck (static + runtime),
level-quality towpath (gate: every gated level clears), hint-shown, signs, textfit hints/mapcard/hud/whatsnew/press, mobile-perf (one 750 ms map frame in the first of three runs: noise; two reruns
and the master checkout were 16.8 ms), level-walk towpath (knight: 26% at the frame cap; master 28% - same, pre-existing), waymeet-cleanup, additional-areas, architecture, floaters, relics, canal,
theatre, harvest-fair, boss-rows, combat-damage, curve (16 out of line, same as master), campaign-order.

## REDS (none new)
- level-quality WAYMEET (not gated): bands / mechanics / secrets / route miss - the same four as master (bands now 42% second height, was 40%).
- level-walk towpath ends at the frame cap in the first ~26% for the walker (master 28%).

## QUESTIONS FOR DANIEL (rec first)
1. After a trip the aqueduct's water stays full, so the poled-back barge floats two rows over the west walkway: boarding is a running jump (every hero has the rise). REC (built): keep. Alternative: drain the trough when the barge docks empty so it sits on its bed again.
2. The votive lamps use the church's own lamp-stand and brazier art and greybox lofts (ladder + plank). REC: a small art pass for a "wayside shrine" lamp (a votive niche), not blocking.
3. The Towpath lychgate remains as scenery with no church behind it. REC: leave until the Towpath art/room rework next week, then re-skin it as the town gate.

## ADDENDUM (coordinator restart)
drawDeadWater specks are batched into one path per colour (textfit records every fillRect: the talk scope hung >1700 s per hero with ~hundreds a frame; now 377 s, 4800 screens, 0 issues, same 2 pre-existing COVERS as master). Re-run: node --check, lethal-water ok, towpath 323 ok, textfit talk ok, mobile-perf no FAIL (welltown/redgorge 16 ms busy while a suite ran beside it).
