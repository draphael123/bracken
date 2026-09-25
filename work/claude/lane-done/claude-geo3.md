# Lane geo3: THE GEOMANCER, ROUND 3 (branch `claude/geo3`, off master 52cfebb)

Daniel played her live and approved all four items. The colour scheme is kept. There is one commit per item. Each commit
was green on the keep-green subset before it was pushed, and docs/briefs/geomancer.md ("ROUND 3") was updated with each.

| item | sha | what |
|---|---|---|
| 1 FAULT LINE (heavy) | 68484bf | Her held X is now a crack that races along the floor and hits everything on it. It replaces UPHEAVAL. |
| 4 guard not drawn while walking | 63b751d | The guard is drawn only while C holds it up. |
| 2 RUNE-WARD (guard) | 4340830 | A sidegrade of the Knight's guard. It replaces the two-hit rock shield and the DOWN+C mend. |
| 3 THE STAFF | a8de28c | A tall gnarled staff with an amber geode in stone claws. Stones orbit the geode while she casts. |

Item 4 went in before item 2, so that its red test could run against the old rock shield's draw.

## 1. FAULT LINE (GEO.fault in src/geomancer.js)
- **Length:** `22 + 138 * wound` px, so 22 px at the quickest release and 160 px at a full wind.
- **Damage:** `1.0 + 0.4 * wound` of her blow.
- **Speed:** the crack runs at 520 px/s and its seam lingers 0.35 s.
- **Wind:** stays 0.5 s. Any release past the first beat fires.
- **Contact:** a foe touching her is hit in the release frame.
- **Full wind (98% or more):** the crack ends in a rock spike at the tip. The spike deals +0.6 of her blow and launches what it
  hits (vy -360, or -440 with HIGHER GROUND). Bosses, flyers and pinned foes are hit and staggered, not thrown.
- **It follows the floor:** it stops at the first gap and the first wall, so it never crosses a pit and never climbs rock (A12).
- **It writes no rock.**
- **Telegraph (C1):** while she winds, amber dashes on the floor show the path it will take. The line ends in a bar where it
  will stop at a wall or gap, and in a spike point at full wind.
- **Removed:** the pillar and its shatter, the foot spike, and BEDROCK's pillar exception.
- **Yard:** the station is now FAULT LINE: "catch both in one", two straw men five tiles apart, done twice.
- **Renamed:** the bought level-14 FAULT LINE is now **THE RIFT**. Its id, price and behaviour are unchanged, so saves still work.
- **Re-worded:** HIGHER GROUND, BEDROCK, THROWN DOWN, the branch title THE STONES, the cards, the keys, the pick line and
  the move sheet.
- **Test (tools/geomancer.mjs `heavy`):** every assertion was red on the UPHEAVAL code:
  - full damage 0;
  - 0 px of crack;
  - [0, 0, 68] damage along the line;
  - the far foe was not launched.
- **Test results on the new code:**
  - contact hit: 24 damage;
  - full charge on the same foe: 34;
  - full length: 160 px;
  - the crack stops 86 px short of a pit or a wall 88 px out, and the foe beyond takes 0;
  - three foes in a line are all hit;
  - the end spike lifts its foe 93 px;
  - a 0.6 charge that runs past a foe does not launch it.

## 2. THE RUNE-WARD (GEO.ward) beside the Knight's guard
I read his code first: `ST.blockHit` 11, `perfectWindow` 0.11 s, `knightHold` 15/s after the window, `guardPush`, walking
at guard pace, and the riposte.

Hers:
- **Timing:** raise 0.10 s; perfect window 0.07 s, opening only once the ward is up.
- **Wind:** 16 per blocked blow or shot; holding drains 15/s once the beat has passed.
- **Rooted:** she can turn on the planted staff but cannot walk.
- **Guard break:** out of wind, the ward breaks (GUARD BREAK) and she takes half the blow. It cannot be raised again for 0.6 s.
- **Red blows** break through the ward. BULWARK halves the damage.
- **Perfect ward:** costs nothing, staggers the attacker, and throws a shot back. It also makes her EMPOWERED for 3 s: every
  blow ×1.25 (through swordDmg), TREMOR ×2, amber runes turning round her, and "EMPOWERED" where her bar is.
- **Not included:** no riposte and no stone pulse.

Side by side (tools/ward-vs-guard.mjs; level 1; Math.random pinned; docs/geomancer/round3/ward-vs-guard.json):

| | Knight's guard | her RUNE-WARD |
|---|---|---|
| raise (frames to the first block) | 1 | 7 |
| perfect window (frames after C) | 1-6 (0.11 s) | 7-11 (0.07 s) |
| wind: per blocked blow / per second held | 11 / 14 | 16 / 15 |
| coverage box | front half-plane | front + overhead (a 7x35 face and a 20x7 lip over her hood); not behind |
| piercing bolt into a raised guard | goes through | blocked |
| a 40-damage blow pushes the hero | 29 px | 0 |
| walking with it up | 32 px/s | 0 (rooted) |
| CLOSE MELEE (10 blows of 12, 0.2 s apart) | lost 25 | **lost 45: worse** |
| RANGED (6 arrows + 2 dropped on the head) | lost 14 | **lost 7: better** |
| BIG (three 40s) | lost 0, pushed 86 px, 27 wind left | lost 0, **pushed 0**, 10 wind left |

- **At level 20** his passives change the picture. PERFECT GUARD gives a 13-frame window, STEADY ARM 9 wind a block, PLATED
  covers behind, HOLD THE LINE 7/s, and SEND IT BACK reflects arrows. Neither hero loses health in the three fights there. She
  ends the close flurry with 8 wind to his 99, and the volley reflects 8 shots to his 7.
- **Boss damage taken per minute** (boss lab, 120 s cap, same seeds):

  | boss | Knight | Geomancer |
  |---|---|---|
  | queen | 138 | 68 |
  | king | 36 | 0 |
  | abbot | 83 | 0 |

- **Bots:** she is in `SHIELDED` now, so every boss branch holds her ward the way it holds his guard. In the generic branch she
  plants it at 0.17 s before the blow, against his 0.14. The tap-and-mend rules are gone.
- **Passive wordings (new):**
  - STONEFACE: "her ward throws back every shot that strikes it, not only one met on the beat"
  - SHRAPNEL: "a ward that breaks - out of wind, or a RED blow through it - bursts into shards that fly at the nearest foe"
  - BULWARK: "a RED blow that breaks through her ward finds her at half its force"
  - The branch is renamed SHIELD → WARD, and its title is now "THE WARD: WHAT IT TURNS BACK".
- **Other words:**
  - the pick text;
  - the keys: "rune-ward / HOLD C (SHE IS PLANTED)";
  - the card: "HOLD C: A RUNE-WARD. SHE IS PLANTED, AND ON THE BEAT IT EMPOWERS HER. HOLD X: A FAULT LINE.";
  - the yard stations THE WARD (the flash now comes at raise+perfect before the blow) and the marks;
  - the drill line.
- **Removed:** the hit count, THE MEND and its gMend pose.
- **Test (`ward`):** red on the rock shield. There, the blow the frame after C was blocked, the third yellow blow landed, RIGHT
  walked her 24 px, holding cost no wind, a blow over her head landed, out of wind it still blocked, and there was no EMPOWERED.

## 3. THE STAFF
- **Look:** a gnarled 1-px shaft that wanders a pixel off straight, with lit knots and an iron butt. An amber geode sits in two
  curling stone claws at the top, with a moss tuft.
- **Poses:** she carries it nearly upright, with the geode over her hood, and plants it for the ward.
- **Unchanged:** the swing endpoints, so the attack boxes are unchanged, and all 40 keys keep master's frame counts.
- **Casting:** stones orbit the geode wherever each frame puts it (`c.tip`, via main.js `staffTip`). They replace the grit that
  floated round her body.
- **Test (`staff`):** red on the old stave: 0 amber pixels over the hood, and no tip.

## 4. Guard not drawn while walking
- Nothing is drawn on her arm unless C holds the guard up.
- **Test (`drawn`):** on the real render, 0 of 30 walking frames, 0 of 30 standing and 30 of 30 held. Red on the old code:
  30 walking and 30 standing.

## Her lab numbers (tools/geomancer-pilots.mjs fight,boss; bots; a report, not tuning evidence)

| | master (before) | after items 1-2 |
|---|---|---|
| fight TTK: sprig / shield / swornsword / archer / hedgeknight (s) | 1.38 / 0.72 / 0.69 / 0.89 / 4.04 | 1.40 / 0.72 / 0.70 / 0.89 / **1.96** |
| boss: queen (secs, taken/min) | win 43.5, 68 | win 43.5, 68 |
| boss: king | win 34.6, 0 | win 34.6, 0 |
| boss: abbot | win 55.2, 38 | win 58.0, **0** |

- The hedge knight halved: the crack reaches him while he winds up.
- The Abbot's damage fell to 0 because the bot holds the ward through his blows.
- She took 0% in every fight row, before and after.
- The Knight's rows in the same runs moved a little without any change to his code (swornsword 1.1 → 1.42; abbot 73 s/71 →
  80 s/83). That is run-order noise, and it is the scale to read hers against.

## Pictures (docs/geomancer/round3/)
- frames-before.png → frames-after.png: every frame.
- look-before.png → look-after.png: 5x beside the Pyromancer and the Knight, then in the first level standing, running,
  winding and with C held.
- moves-before.png → moves-after.png: every move from the real page.
- ward-vs-guard.json.
- tools/geomancer-sheet.mjs, geomancer-look.mjs and geomancer-shots.mjs now take an output path.

## Checks
- **Every item:** the keep-green subset passed: geomancer, starter-kits, ability-poses, attack-animation, combat-feel,
  render-layers, skill-menu, skill-passives, talents, levelling (+runtime), progression (+runtime), tells, textfit,
  boss-openings, arena-supplies, hero-trials, one-dodge, pilot-actions, mother-pilot, knight-rework, comments, syntax,
  homepaths, dangling-paths and signs. For item 3 it also ran pixels.
- **Item 4 subset:** item 4 alone got a narrower subset (geomancer, render-layers, attack-animation, textfit, hero-trials,
  starter-kits, comments, homepaths, dangling-paths) because it is a single draw condition. The full subset then ran on the
  commits after it.
- **One re-run:** on item 1, dangling-paths failed because a comment I wrote cited moves-after.png before that file existed.
  I re-worded the comment and re-ran dangling-paths alone: green.
- **one-dodge is not in the subset:** naming it in a subset runs nothing, because tools/check.mjs line 77 passes 'one-dodge' as an ARGUMENT to every check instead of listing it as a check of its own - worth fixing on master. I ran `node tools/one-dodge.mjs` directly on the final commit: green ("the Geomancer burrows").
- **Not run:** the full `npm run check` and any deploy.

## Questions for Daniel (with recommendations)
1. **THE RIFT (the bought level-14 ability)** is now a close cousin of her heavy: both are cracks along the floor.
   Recommendation: replace it with something that is not a line, for example a TREMOR SPIKE that roots everything within 60 px.
   Failing that, make it run both ways from her and cross gaps.
2. **Wind against big blows.** Her ward costs a flat 16 wind whatever the blow, so against 40-damage blows she drains faster
   than he does (10 wind left to his 27). Her advantage there is zero push, overhead cover and bolts. Recommendation: keep it;
   big blows are usually red, and red breaks both guards anyway.
3. **Should a perfect ward stagger?** It uses the Knight's stagger values (the blow bounces). Recommendation: keep it, so it
   reads as a parry, now that the stone pulse is gone.
4. **The perfect window is 0.07 s against his 0.11.** Recommendation: play it. If it feels unfair, raise it to 0.09 before
   touching the raise time.
5. **She can turn while rooted** (on the planted staff). Recommendation: keep it; otherwise a foe that walks behind her is a
   free kill.
