# claude/beast3 - BATTERING BEAST 3 (Palisade Wood boss rework, OPUS)
Brief: scratch/brief-beast3-1101.md (Daniel live 11-01 11:31 "Build as described"). Base origin/master 0fe14c26 + origin/claude/palisadesteps merged.
Not merged, not deployed.

## BUILT, PER ITEM
1. **LOOK - a war-ox in a siege harness.** Slate-iron hide (no boar brown), a riveted plate barding skirt down both flanks with a rust rim,
   iron-capped horns (kept), **the ram slung UNDER him** on short chains from his girth rings (between his legs, its iron head out under the
   chest - it swings back/forward under him for SWING THE RAM), **war banners**: a tall crimson banner with a gold ram's head at the
   gantry's tail + a black/red pennant at his shoulder (P2: the pole snapped, the banner torn). Every pose re-baked (pose sheet below).
2. **P1 NEW - THE VOLLEY ORDER.** The gantry's second handler is THE HORNSMAN (src/hornsman.js look: kettle hat, red crest, order horn).
   Tell 1.1 s: the horn goes up (a bar fills over him, the climbing note SFX.hornDraw, THE ORDER, !!, a pulsing box round him), the
   palisade's archers (one on the old gate's lintel, one on the palisade's next rank) draw. Blast (SFX.hornBlast + sound rings), and the
   arrows come down in **two waves of lanes** marked on the floor from the first beat (wave 1 red "1", wave 2 orange "2" in its gaps;
   44 px lanes; 1.5 s to wave 1, +0.75 s to wave 2; the column is tinted - a deck is no shelter). **Hit the Hornsman while the horn is up**
   (any blow box or a ranger arrow in his box over the gantry - a jump reaches it, a standing cut does not) = **ORDER LOST**: the lanes
   are wiped and the beast stands unsteered 1.2 s (a short opening, x1.25 - added in tuning). Two lost orders and **THE HORNSMAN FALLS**
   off the gantry: no more volley orders (the gantry is drawn with one handler from then on). STAKES stays, picked less often.
3. **P2 - THE CHAINS SNAP + THE WALL BREAKER.** The snap/LOOSE set piece stays; he now slams the palisade and it HOLDS, cracked. Then he
   goes after the WALL: **THE WALL BREAKER** - he wheels on the palisade (told: turns, paws, HE TURNS ON THE PALISADE first time, red run
   line + end mark), runs it (anything in his road is hit; **a wreck in his road still sticks him - the rule works in P2**), SLAMS it (the
   section leans in), then **ROLLING TIMBERS** (2 logs, 1 s apart) drop off the wall and roll the whole floor west - jump them; a deck is over
   them; a wreck on the floor stops them. He **reels off the wall (DAZED)** while they roll (added in tuning). **The first slam leaves THE
   BREACH for the rest of the fight**: the palisade end drawn with snapped stumps and the forest through the gap, and a **RUBBLE STEP**
   (4 solid cells, one row, against the east wall; heroes/crew standing there are lifted onto it; cleared on a retry) - the timbers never
   reach it, his wall run does; his charge east now crashes into the rubble. Later slams widen the breach. Flail + buck kept; the charge
   is the rare P2 move; the wall breaker never twice in three moves and has a 6 s cooldown.
4. **THE TRAMPLE IS CUT** - BB.trample, trampleTell/trample modes, S.waves + stepWaves, both pose tables, the art, the bot's wave/back-off
   code, the shots tools' trample shot and the art check's need list. tools/palisadewood.mjs asserts it is gone (code + art minus comments).
Kept: the rule opening (scaffold prop -> STUCK x2, capped), DAZED off the wall/gate, armour 0.45x (B15 >= 0.4), the ward after STUCK, LOOSE.
The palisade's end is now drawn just inside the east wall (the boss camera stops at the wall, so the old end was always off-screen).

## DEMO
src/level.js needs chain: stockade -> spore -> rootway -> underleaf -> **palisadewood** -> kings; the demo slice runs up through Kingswood
(Daniel 11-01 09:17) -> **the Palisade Wood is IN the demo slice.** Built today (11-01); greybox-plus art. READY by end of 11-03 is achievable IF an art-polish lane (11-02) and a tune/confirm run (11-03) get machine time; otherwise it ships after the demo and the demo keeps today's beast.

## RATES (boss-rates practiced, profile human, flasks kit, campaign L8)
| run | change | knight | warden | pyro | other | pooled |
|---|---|---|---|---|---|---|
| base | origin/master beast UNCHANGED, hp 1350 | 0/4 | 2/4 | - | - | 25% (master drifted since 10-25's 67%) |
| r0 | first build, hp 1350 | 0/4 | 0/4 | 0/4 | | 0% |
| r1 | hp 1250, walls rarer, timbers/flail softer | 0/4 | 0/4 | 0/2 (2 page crashes) | | 0% |
| r2 | hp 1050, ORDER LOST + reel off the wall = openings, charge 18, sweep 22 | 1/3 | 0/4 | 0/4 | | 9% |
| r3 | wall cooldown 6 s, timbers 1 s apart, sweep 19, flail 18 | 2/3 | 0/4 | 0/4 | | 18% |
| r4 | hp 880, pyro 0.85x (stopped by the coordinator's hold) | 1/4 (3 timeouts) | 2/4 | - | | 38% |
| r5 | DAZED x1.5, STUCK cap 14%, hp 880 | 3/4 | 3/4 | 4/4 | | 83% HIGH |
| **r6 (current)** | **hp 960** (stopped part-way by the coordinator: gate137 needed RAM) | **2/6** | **6/6** | **3/6** | paladin 1/4 | **k/w/p 11/18 = 61% in band**; with paladin 12/22 = 55% |
Not measured (gate/RAM holds): pirate, reaper, geomancer, berserker, ranger; dry; mash. n is small: re-run r6's all-hero set n=6-12 before the freeze.
Fight length (r6 wins): 68-236 s, median ~140 s (knight wins run long: 200-236 s; deaths 78-198 s). Over the ~2 min target for the knight.
Hurt ledger at r2 (probe): timbers + flail were the killers (up to 98 + 69 a fight) and the wall breaker fired 14-16 times in a long P2 -> cooldown + never twice in three; volley order lanes cost 0-22 a fight (the bot reads the lanes) and the knight cut the Hornsman 1-2x a fight.

## CHECKS
- tools/palisadewood.mjs: all green (new: trample cut, volley order lanes/waves/no-overlap, Hornsman box reach, ORDER LOST + opening, Hornsman falls -> no more orders, hands route blow + arrow, wall breaker run/slam/reel, breach + rubble cells + wallX, timbers roll/hit floor not deck/stop at wreck and gate, wreck in his wall road = STUCK, B16 poses for every new move in both tables).
- palisadewood after merging origin/claude/palisadesteps: green.
- NOT RUN (page tools, held by the coordinator's BROWSER-HOLD then gate137's RAM): hornsman, mark-integrity, boss-openings, mash, textfit, level-reach, palisadeart. Lane-side risk notes: mark-integrity sees 'orderTell' (!!) - the pose differs (horn up) and lanes land; 'wallTell' (!!) - run line + run. tools/palisadeart.mjs need list updated (trample out; order/lost/wall* in) and asserts the level hash 344234fcd689 - the palisadesteps merge may change that hash (its lane's to restamp). The rubble is set at run time (cellSet), never in the level data, so the hash is unchanged by this lane.

## STILLS (scratch/lane-reports/beast3-shots/)
beast3-vs-tusker.png (side by side, 3x), beast3-poses.png (every frame, 2x), beast3-look-walk(-zoom), beast3-volley-horn(-zoom),
beast3-volley-arrows(-zoom), beast3-volley-lost, beast3-wall-tell, beast3-wall-slam(-zoom), beast3-wall-breach(-zoom), beast3-p2-flail.
Re-shoot: `node tools/beast3-shots.mjs [tags]` (not in the suite).

## ART LANE NOTES (polish list)
- His head reads too dark against the slate barding - lift the chamfron/skull values, a lit horn base; the eye slit brighter.
- The girths (brown leather) read as wooden posts down the flank at 1x - thinner, darker, with the iron rings visible.
- The under-slung ram: give it a proper sway in walk (2 frames) and chain links that catch light; a shadow under it on the floor.
- Banners: a 2-frame flutter on the big banner (it only shifts its tail now); torn-banner rag in P2 hangs too stiff.
- The Hornsman on the gantry is tiny at 1x - a bigger, brighter horn bell, and a reel pose (he is just "flail" arms now); a fall-off
  animation for THE HORNSMAN FALLS (now a burst).
- Archers on the walls are 22 px stick figures - draw them like the level's scaffold archer; loose pose needs the arrow streak up.
- Lane marks: floor stripes + "1"/"2" + column tint; a better arrow-rain sprite (arrows are 1 px shafts).
- Rolling timbers are end-on discs: add bark texture + a dust trail; the teeter on the wall top before they drop.
- The breach: the stumps/gap are simple rects; the rubble heap over the solid cells needs a real pile sprite (it covers the tile).
- wallHit has splinters only - add an impact flash/dust ring at the wall; wallBack shares the "stars" read with dazed.

## 1. **HP 1350 -> 960** (and DAZED x1.5, STUCK cap 14%). The unchanged master beast already measured 25% at L8, so the drop is mostly drift. Rec: accept; the tune lane confirms with all 9 heroes.
2. **ORDER LOST and reeling off the wall are short openings** (x1.5, 1.2-1.4 s). Not in the brief; added because the new moves gave the player nothing to earn and fights ran 170 s+. Rec: keep (both are earned by the player - cut the horn, or let him slam the wall).
3. **STAKES kept beside the volley order** (picked less often). Rec: keep for variety; cut it if P1 feels busy in your playtest.
4. **The breach terrain = a rubble STEP against the east wall** (4 cols), not a gap/pit (a pit risks soft-locks and falls in an Act I boss). Rec: keep.
5. **Two lost orders knock the Hornsman off** (no more volley orders). Rec: keep - it is "or kill him".
6. **Demo:** the Palisade Wood is in the slice. The rework is built and k/w/p is in band at n=18, but the all-hero rates, mash and mark-integrity have not run (holds) and the art is greybox-plus. Rec: art-polish sonnet 11-02 + a tune/confirm sonnet 11-03 (all 9 heroes, mash, mark-integrity) -> READY for the 11-05 freeze; if either slips, the demo keeps today's beast and this ships after.
7. Paladin 1/4 (partial) and knight wins run 200 s+. Rec: the tune lane looks at both (the knight bot walks to props a lot - noted on 10-25 too). FOR DANIEL (rec + what I built)
QUESTIONS
