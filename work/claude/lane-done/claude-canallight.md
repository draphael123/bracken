# claude/canallight - THE FOG CANAL curve (L23, act 4): NOT FIXED BY FOES - the wall is the level-1 pilot's lifts landing in water

Branch claude/canallight off claude/towpath 625e5925. No level change shipped, no curve/mash row written (src/fog-canal.js and docs/ untouched).

## Re-measure (this branch, port 8757)
- tools/level1-pilot.mjs canal --curve: 646% hp lost, 15 deaths, 91 hits, 12 kills, 114 lifts (band 600% / 12). Still a WALL. (The level hash differs from the stale 436%/12 row: the Lantern-Eater arena changed the level since; that row was already stale.)
- tools/level-walk.mjs canal --heroes=knight,warden,pyro --seeds=3 (L23, 3 flasks, heart charm): all 9 runs hit the 8-death cap, 0% of the route measured. The walker's on-foot bot cannot work the canal (it needs the barge): it dies at the mill wharf (x80-104, the bargemen / water) and the fog wall (x170). Not a usable canal number; pyro STUCK at node 12/74 (86,32), knight STUCK at 15/74 (92,23).

## Where the pilot's loss really comes from (instrumented copy of the pilot, deleted afterwards)
Per-event log of every hp drop >= 12% in the 3 pilot runs: ~20 of ~23 events per run are 27% (= SV.HAZARD.pct, the water splash) and in 220-330 the hero is moved 210+ tiles on that frame (returned to P.safe far back). They fall at the SAME waypoints every run (43,51,38 y41; 81,37; 182/195 y34; 220,229,239,247,255,266,271,288,294,319,330 y19-29). That is a lift (tp to the next route waypoint after 240 frames) dropping a barge-less level-1 knight into canal water: 27% + a safe-point return, again and again. ~1/3 of the whole loss is the tunnel (239-330), where there is no towpath and no foe is involved. Foes cause roughly 3 events per run.
Before survival2 the splash went through the damage chain (cheap); the pct path (27%) is what turned 436% into ~640%, with the same 111-114 lifts.

## Lightening tried (all reverted)
Pilot, 3 runs, lost% / deaths: baseline 646/15. Nest 4 grindylows -> 2: 606/14 (best). Nest-2 plus any of: fog wall water grindylow out 618/15, set-lock grindylow out 614/14, second chamber + tunnel mouth out 620/14, stop-planks + deep lock one each 633/14, stop-planks both + set lock out 631/15; balance-beam bargee out 661/15. Single edits move it +-30 (the run is chaotic, deterministic per layout), none gets under 600% AND 12 deaths, because foes are not the cost. The boarding gang cannot be thinned (tools/canal.mjs asserts >= 3 boarders; never weakened). So nothing was shipped; shipping the nest change would re-hash the level and force a canal mash re-stamp for no band result.

## Recommendation (tools/gate owner, not this lane)
The pilot (tools/level1-pilot.mjs) should not lift a hero into canal water without the barge: either put the barge under the waypoint on a lift (BK canal API) / lift onto the nearest ledge, or exempt lift-landing splashes from `lost` on levels whose route is a mover. After that the canal row should be re-measured (expected near its old 436%) and written with --curve. Same artifact likely inflates any water-route level (longwater, reef) - worth a check. Until then canal stays a stale row in curve-gate (as before).

## Checks
No code changed, so level-quality/curve-gate/mash-gate/slopes-trace/lantern-eater/canal were not re-run (tree identical to 625e5925 plus this report).

## QUESTIONS FOR DANIEL
1. Rec: fix the pilot's lift (barge-aware) rather than strip canal foes - built: nothing (reported). OK to hand to a tools lane?
2. Optional: nest 4 -> 2 grindylows is a real but small lightening (-40 points); not shipped because it does not reach band.
