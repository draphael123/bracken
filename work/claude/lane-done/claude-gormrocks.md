# GORM ROCKS (sonnet, claude/gormrocks off claude/batch142 b595af13) - 11-03
Daniel (11-03): "Why are there rocks in Gorm's room?" -> REMOVE the rocks. Not merged, not deployed. Level hash UNCHANGED (kings 4fa2c72f5952 = stamped), no restamp.

## Removed (clean removal, no GORM.rocks gate needed)
- src/gorm-hands.js: the rock block (heldRock/heapNear/rockTarget/arcFor/aimAt, H.interact = E take/set-down, rocksStep = throw/lob flight, knock-off), S.rocks/took/rockCd/near/arc, stats n.rocks/n.knocked, the 'courtrock' carry kind registration, the heap draw + gold ring + "E: A ROCK" label, the rock in flight and its told arc, rocks/heaps/arc/held/aim from H.read, the CT (carry-throw) import. The carry-throw module itself is untouched (other bosses use it).
- src/gorm.js: GORM.rock numbers; GORM_SAY rock / dropRock / throwBows. ('knocked' kept: the log trap's KNOCKED DOWN uses it.)
- src/main.js: the GMH.interact(P) E-press line. src/throwables.js: the courtrock row.
- src/kingswood.js: L.gorm.hall.heaps data (the two heaps). src/redraw/gorm_hall.js: heap() and rock() sprites.
- src/lab-gorm.js: the bot's "set the rock down" line (the bot never took one in the sim runs - see rates). src/lab.js comment.
- Hint (ropeHint, shown when the first pair files in): was '...ARCHERS ARE ONLY PRESSURE (E AT A HEAP TAKES A ROCK TO KNOCK ONE DOWN).' now '...ARCHERS ARE ONLY PRESSURE: CUT THEM DOWN FROM THE SCAFFOLD IF THEY BOTHER YOU.' (shorter than before; verified in the hall still shot, 2 lines in its box). The heapHint and the 'rock' GORM_SAY line are gone. The kingswood sign ('HIS ARCHERS ARE ONLY PRESSURE') never mentioned rocks.
- Tools: gorm2.mjs now asserts "no heaps, no GORM.rock"; gorm2-probe.mjs lost its three rock steps (it kills the archers with hurtEnemy as the scaffold would).
- NOTE the design today: since claude/kingsfix2 every cage rope is FREE at any moment (ropeLocked() = false), so the archers are pure pressure, not a lock. Removing the rocks does not touch the cage loop; killing archers was already optional.

## Hero reach to the archers (tools/gorm-scaffold-reach.mjs, NEW, Node, registered in tools/check.mjs list)
Each hero's own legs (src/reach-hero.js) flood the hall from its floor; all 10 archer marks (2 per rope x 5, row 5 decks) must be reached. Scaffold = three 3-row tiers (rows 11, 8, 5).
| hero | archer marks reached | note |
|---|---|---|
| shared fill (any hero) | 10/10 | |
| knight, warden, pyro, geomancer, ranger | 10/10 each | the five demo heroes |
| berserker (optional, Act II), paladin, pirate, reaper | 10/10 each | |
Co-op: reach is geometry, per seat, so the same (each seat has its own legs); the cage loop is untouched (ropes free at any moment; gorm2.mjs + gorm2-probe: file in -> arrows -> rope free -> real blow on the peg -> HELD x2 all ok). No scaffold fix needed.

## Gorm rate, BUILT n=6, kit flasks, normal, row `kings`, seeds 1-6, L9 (botbuilt kit measured in throwaway worktrees of batch142+botbuilt vs gormrocks+botbuilt; both removed)
| hero | BEFORE (rocks on) | AFTER (rocks off) |
|---|---|---|
| knight | 6/6 | 6/6 (s3 crashed once - infra 'page CRASHED' - rerun alone: win 88s, identical) |
| warden | 0/6 | 0/6 |
| pyro | 6/6 | 6/6 |
| geomancer | 6/6 | 6/6 |
| ranger | 5/6 | 5/6 |
| ALL | 23/30 = 77% [59-88] | 23/30 = 77% [59-88] |
Every one of the 30 fight lines is IDENTICAL before vs after (same seconds, same damage, same casts): the bot never used the rocks, so removing them moves nothing. NO retune made.
Out of band: overall 77% (> 70 edge, interval 59-88 spans it), and the warden is 0/6 (dies with 30-69% left; his bare row was 4/6 on 11-03 botbuilt). That warden hole is the one botbuilt already flagged (the skill hand spams javelin, 31-39 casts a fight, blind to Gorm's hall/glade choreography), a BOT issue, not the rocks.
Recommend ONE knob, no change made: do not retune Gorm for this lane. Rate truth for a human = the practiced column (78% n=18 on 11-03, also high). If Daniel wants Gorm P1 nearer 65%: the single knob is GORM.archers.every (arrow cadence, src/gorm.js) - a longer gap makes the archers weaker though, so the harder direction is P1 hp (GORM.hp1) -5%. Recommend leaving it till the botbuilt skill-hand yield fix lands and the warden row is real.

## Checks run (all green unless noted)
- node tools/gorm2.mjs ok, tools/gorm3.mjs ok, tools/kingswood2.mjs ok, tools/gorm-scaffold-reach.mjs ok (new). node --check on every touched file.
- Browser: tools/gorm2-probe.mjs: all hall/flee/fire/death checks ok, 0 page errors; 2 FAILs (log-trap peg KNOCKED DOWN, "his death ends the fight") are IDENTICAL on batch142 before my change (pre-existing, glade-end probe drift) - not touched.
- textfit: node tools/textfit.mjs hints,boss exited 0 with no report line (it printed nothing); a full run got a page crash on a first try and was not repeated (RAM). The only changed player text is the hall hint above (shorter than the old line; shown wrapped in 2 lines in the hall still).
- NOT run: tools/check.mjs (full suite, per the brief), gorm-reenter/gorm-unlock browser tools.
- Screenshots: scratch\lane-reports\gormrocks\before-hall-west-fight.png (heap beside the west door) / after-hall-west-fight.png (the heap is gone).
- Hash: levelHash(kings) = 4fa2c72f5952, same as the stamped docs row; level-quality kings green. No restamp.

## What's New line
KING GORM'S HALL: the heaps of rocks are gone. Cut the rafter archers down from the scaffold (or ignore them) and strike a cage rope when he walks under it.

## Questions for Daniel (rec first; lanes never block)
1. Warden 0/6 BUILT on Gorm (before and after): treat as a bot defect, fix the skill hand to yield to gormHands (botbuilt Q2) before any Gorm retune? REC: yes.
2. Gorm P1 overall BUILT 77% is above the 60-70 band: retune now or wait for the corrected warden row? REC: wait (one knob: P1 hp -5%).
3. Leave the 2 pre-existing gorm2-probe FAILs (log-trap peg, glade death) for a small probe-fix lane? REC: yes, after the demo cut.
