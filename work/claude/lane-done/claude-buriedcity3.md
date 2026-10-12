# claude/buriedcity3 - BURIED CITY 3 (OPUS: level mechanics + boss AI, 2026-10-12) - base origin/master 4099648d (batch87)

Brief: scratch/brief-buriedcity3.md (Daniel played BC2 live 10-12; photo scratch/daniel-bc2-hourglass-1012.jpg). This lane STOPS before 12-seed boss tuning:
the SONNET art lane (the ART LIST below) and the SONNET tune lane follow. New pieces wear readable PLACEHOLDER art. Ships at >= B, art before live.

## 1. THE INVISIBLE PLATFORMS (fixed first, proved red)
- Cause: the city's hands write the grid while you play (rooms fill/drain, the sinking street's deck, heaps, the trap plate) through main.js `cellSet`,
  which only clears the cell's picture (`tileSpr = null`) - nothing re-picked it. The photo's platform is THE UPPER BULB's pipe shelf (284-289, row 29):
  under sand on load, drained -> a real ONEWAY with no picture, beside the Hourglass Tower backdrop. Also the street's roofs and the lower bulb's pipes.
- Fix: `bcRetile` in main.js re-picks the written cell and its 8 neighbours from the city's own kit (src/redraw/buried_city_tiles.js bcTile); the king's
  hands use it too (banks, drift, blocks).
- New check **tools/drawn-solids.mjs** (in tools/check.mjs): every SOLID/ONEWAY/SPIKE/PLANK... cell must have an INKED picture - as loaded, after every
  gate thrown and thrown back, the great gate drained, every chute swung and back, every hourglass flipped and run out, a respawn. RED on 4099648d
  (87 / 78 / 232 undrawn cells, log scratch/bc3-drawn-red.log), green now. (tools/footing-art.mjs never saw it: it skips every L.caravan level.)

## 2. THE FLIP - the level's second verb (src/buried-city-flip.js, new)
STRIKE AN HOURGLASS (any blow) or turn it (E): its sand runs BACKWARD for its seconds - a gauge on the glass AND over your head drains, the last 2 s told
(red gauge, ticks, shaking roofs, "THE GLASS RUNS OUT"); struck again while running it refills. Everything it governs runs the other way:
RISERS (buried roofs/domes rise out of the sand; a body in them is lifted on), SINKERS (a standing roof sinks), BANKS (a drift wall runs out; it drifts back
only when nobody stands in it), DUNE FALLS (flow UP and carry you; idle they beat you down). THE SAND SEA between the rooftops swallows: a 27% bite and
back to your last fixed footing - the exam's sea is a real death (A10 amended, taught twice before).
Rule line (LEVELS + header, stated change): "PULL A SAND-GATE AND A ROOM DRAINS; SHUT IT AND THE SAND RISES AND CARRIES YOU. STRIKE AN HOURGLASS AND THE SAND RUNS BACKWARD."
| arc | where | use |
|---|---|---|
| TEACH (safe, REQUIRED) | Sand Stair 98-111 | a fallen house (5 rows) blocks the street; the glass raises a buried roof as a step. No foe within 10 |
| TEST | Hourglass Halls 310-315 | a bank of sand shuts the corridor before the halls' elite; 6 s glass |
| REMIX 1 | Rooftops 646-662 | the glass on the dome turns the dune fall UP: ride it 8 rows to the high dune |
| REMIX 2 (chain) | Rooftops 672-712 | glass 1 raises three roofs to a minaret stub; its glass raises the last two; a slinger throws from the far bank |
| EXAM | Rooftops 713-736 | the last glass SINKS the one roof that stands and raises three others, over the lethal sea; 6 s |
| BOSS | throne room | phase three: THE GREAT HOURGLASS |
A4: 5 distinct uses (rise, bank, fall-up, chain, sink). Reach model: risers count risen, the fall as rungs; buried-city.mjs proves each REQUIRED
(teach, fall, both chain glasses, exam). Glint + 10 s nudge: 6 new stuck spots (handsState glass.<id>); walker hints (BK.walkHint). Great hourglass
(backdrop tower) SHRUNK: 0.36-0.48 scale, ~15-20% of the view, hazed (was 0.8-1.3, 52-72% of the view).

## 3. THE ROOFTOPS - outside + platforming (630-749; the throne room moves 630 -> 750, W 672 -> 792; same level id, road order unchanged)
Up a BREACH in the throne street's roof (ledges on its walls, shade at its foot) onto the open desert city under THE SUN (A13 drain, shade under 3
awnings): house roofs, a dome, a minaret stub over THE SAND SEA; the fall that flows up; the high dune; the chain; the exam; down a COURTYARD under a
collapsed dome (ribs to the floor, shade under its shell) where the 4th ELITE (construct, SWIFT) fights in the sun with a slinger on a rib; CP5 (748) at
the throne door. Backdrop: the sky over L.outside, the tower on the horizon. A14: a required platforming section with its own exam.

## 4. THE HOURGLASS KING (src/hourglass-king.js, -hands.js; look kept)
Faster (walk 42 -> 64). Four new TOLD moves, each word + colour + sound + its OWN greybox pose (cast frames 14-19, B16):
SAND SURGE (tall wave from a slam - jump), GLASS RAIN (shards in 3 told marks incl. yours - step out), BURIAL GRASP (sand hands under you: struck and
HELD till you jump/roll), TIME SLIP (violet glow; his ECHO where he stood 2 s ago; he snaps back swinging, then stands a beat - punish).
Phases change the arena: P1 throne floor (pend, gear, surge, stream). P2 the SAND TIDE (told 1.3 s) takes the floor as drift for 2.8 s every 7 s - get on
the chained ledges or the sandstone block that is up (two blocks rise/sink by turns, told); grasp + rain new; a lever stall drains the drift. P3 the gates
are DRY; STRIKE THE GREAT HOURGLASS (E or a blow): the sand pours up and drags him into the flow - his big opening (5 s, 12% cap); it runs back down
(9 s, drawn gauge); slip + hour new; pours from the roof. B3 ward, B10 read, B12 drag-to-you, B15 floor (0.45) unchanged. hkPlan (lab bot) reads all of it.
STATED DESIGN CHANGE: B5's "one new move a phase" -> two per phase (the brief asks 2-3+ more attacks); buried-city.mjs updated to say so.
Tool: tools/hk-probe.mjs (one fight with his ledger: phase, moves, damage by move).

## CHECKS (PORT 8867)
See RESULTS below.

## ART LIST (for the SONNET art lane - every item is PLACEHOLDER now)
1. THE HOURGLASSES (6): brass stand, two bulbs, the sand running both ways, a TURN-OVER animation on a strike, idle glow; the gauge built into the frame.
2. RISERS / SINKER: buried roofs, domes, a house top rising out of sand (sand streaming off), the sunk parapet tip + ghost outline, the warn shake + sand pour.
   Their tiles use the house/dome kit already (L.plats kinds).
3. THE BANK (halls 314-315): a drift wall that runs out and drifts back.
4. THE DUNE FALL (660-661): sand curtain off the high dune's lip; its UP state (rising grains, light, chevrons today).
5. THE SAND SEA (646-662, 681-712, 723-736 lethal): deep rippling sand, whirls, the lethal one darker with bones; 'bcBuried' bodies of the buildings
   going down into it (hands drawStructure).
6. THE ROOFTOPS: outside backdrop (the dunes' sunset, distant buried domes/minarets, the tower on the horizon), the breach's torn roof edge, the 3 awnings
   (shade casters), the COURTYARD's collapsed dome shell (decor 'shell', a few arcs today), the fallen house at the teach (house tiles today).
7. THE KING: keyframe poses 14 SURGE TELL / 15 SURGE SLAM / 16 GRASP TELL / 17 RAIN TELL / 18 SLIP TELL / 19 SLIP STRIKE (greybox today); the echo
   ghost; the surge wave; the sand hands + the held hero's sand; the rain's marks, cracks in the glass roof, shards; the tide's warning glow and the drift
   floor; the two sandstone blocks; THE GREAT HOURGLASS (a brass frame on a pivot, a turn animation, the column pouring UP, its gauge).
8. The shared sun overlay tints the whole screen orange in the long outside stretch - heavy next to the city's palette (see Q3).

## RESULTS (PORT 8867; page checks one at a time after the 15:55 reboot; stopped at 16:47 on the coordinator's low-memory order)
- **drawn-solids: RED on 4099648d (87/78/232 undrawn), GREEN now** (as built, every gate both ways, great gate, chutes, every hourglass flipped + run out, respawn).
- tools/buried-city.mjs **278 green** (incl. flip required x4, A4 5 uses, the flip in the fake world, the king's new moves/arena in the pure model; stated test changes: 10 sections, 4 elites, 2 new moves a phase).
- **Route pilot, real keys, base movement, god, no foes: ALL 8 HEROES walk every leg incl. THE ROOFTOPS** (knight, warden, pyro, paladin, pirate, reaper, geomancer, berserker; pyro's first run hit a tool-hand slip at the teach - fixed in the tool, re-run green).
- reach-heroes (8 heroes, 0 misses), level-reach, deadends, stuck (static 2398 + runtime 250 spots, incl. 6 new glass spots), solid-islands, modulepreload, desert-rules (sun), tells, signs, checkpoints, checkpoint-stand, checkpoint-gaps (5 shrines 166/339/524/644/797; one DENSE note 506->621, pre-existing), elites (courtyard elite SWIFT), one-new-foe, goblin-lint, threat-holes, answer-tags, blow-tags, floaters, killzones, spawns, collectables, keys, relics, comments, homepaths, hint-shown: green.
- **Re-stamped LEVEL then BOSS**: pilot 9 deaths / 3 runs (374% hp a run, act-5 band 150-700%), **mash level 0/3 clear, mash boss 0/6**. **level-quality buriedcity CLEARS** (gate-wide: every gated level clears).
- Page: boss-read ok, untold-told ok, boss-fight-end (61 fights) ok, corpses ok, drawn-solids ok; boss-openings ran (table printed, tail showed no FAIL - re-run when pages are allowed); mark-integrity = the known undeadmage phantom only (not this lane).
- **NOT RUN / NOT GREEN: textfit** timed out under the load (Runtime.evaluate > 480 s on talk[knight]) - re-run when PAGES OK. architecture prints "1 level with structure standing on nothing" (exit 0) - check it is not buriedcity's 'bcBuried'.

### 3-SEED BOSS SPOT (boss-rates practiced, profile human, flasks kit, L40, jobs=1; cut at 8 of 9 fights by the stop order)
| | knight | warden | pyro | all |
|---|---|---|---|---|
| BC3 king (hp 3500, numbers untouched) | 1/3 | 0/3 | 1/2 | **2/8 = 25%** |
Fights 80-160 s (wins 127, 160 s). LOW: the target is 60-70% - for the SONNET tune lane (12 seeds). tools/hk-probe.mjs knight/warden/pyro: damage by move - the SURGE (knight 244), the RAIN (94-188) and the PENDULUM (warden 375) carry it; bots reach phase 3 and use THE GREAT HOURGLASS (1-2 flips). Rec for the tune lane: rain dmg 34 -> ~24, surge 44 -> ~34 and its jump window a touch wider (surgeTell 0.8 -> 0.9), then hp; not the tide.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **The king has 4 new moves, two arriving in each of phases two and three** (B5 says one a phase). Rec: keep (the brief asked for 2-3+ more and phase differences). Alt: hold the HOUR back (P3 then adds only the slip).
2. **The exam's sand sea is a real death** (the two seas before it bite 27% and put you back). Rec: keep (A10 amended; taught twice). Alt: a 40% bite there too.
3. **The shared sun overlay tints the whole screen orange on the long outside stretch** (~60 s of rooftops). Rec: the art lane softens the city's tint (L.palette) and keeps the drain as is. Alt: more awning shade.
4. **Phase two's SAND TIDE** (told, every 7 s for 2.8 s the floor is drift - fight from the ledges/blocks) replaced a permanent drift floor that the bots could not survive. Rec: keep the tide. Alt: permanent drift with shallower sinking.
5. **The throne room moved 630 -> 750 (W 792)** for THE ROOFTOPS; old saves and the road order are untouched (same id), CP5 sits at the throne door. Rec: keep.
