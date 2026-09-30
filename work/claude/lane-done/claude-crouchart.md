# claude-crouchart (art lane)

## What changed
1. **Floating crouch, one cause.** The plain `crouch` frame of the Knight, Warden, Freebooter, Paladin, Geomancer and Death Knight was
   built on the standing legs cut down to two rows (`LEGS.crouch`) with `legsDy` left at 0, while the body was dropped 3 px. The boots
   ended 3 px above the ground row (row 42 against 45 in the baked frame). The newer poses (lowGuard, trip, set, lowPoke, reload,
   crouchShot, kneel, sense, harvest) already passed `legsDy: 3` and were fine, as was the Pyromancer (crouch and ember ward keep her
   boots on the standing row: her hem never moved). Fix: `legsDy: 3` on those six `crouch:` entries in `src/chars.js`. It is a
   baked-frame fix, so every skin is covered (18 skins each). Hitboxes and `DUCK_H` are untouched.
2. **Lampreeve lunge pole.** Frame 13's pole started 12 px out from the anchor and ran 22 px further, off the right edge of the
   46 px canvas: the cone was cut away and only a stump showed. It is redrawn (`src/redraw/city.js`) so shaft, cone and hook all sit
   inside anchor+23 px, i.e. the cone's mouth is at the 18 px hit reach (`DMG.reeveLunge`, inside 18 px of him, unchanged) plus the
   sprite's 1.12 scale. Body a step further back, hands drawn in.
3. **New check `crouch-feet`** (`tools/crouch-feet.mjs`, registered in `tools/check.mjs`). `knightFrame` and `pyroFrame` now record
   `canvas.feet` (the boots' row, carried through the headroom pad). The check compares every crouch/duck frame of all 7 heroes, in all
   18 skins (504 frames), with that hero's standing frame. **Proven on the old code:** it failed with 108 frames off the floor
   (knight/warden/pirate/paladin/geomancer/reaper `crouch#0`, 42 vs 45, all 3 px); after the fix 0 of 504.

## Capture
`work/claude/lane-done/crouchart-before.png` and `crouchart-after.png` (`tools/crouch-sheet.mjs`): each hero standing beside his crouch with
the ground line, and the Lampreeve lunge with the 18 px reach marked in cyan.

## Checks
See the final message for the run list.

## UNVERIFIED
No live play of the crouch on real terrain, no pilots (art only). The lunge sprite was viewed as a sheet, not in the fight.

## QUESTIONS FOR DANIEL
- The crouch weapons still poke below the ground line (knight sword point 8 px below, reaper greatsword 9, paladin maul 9): the sword
  was laid down with its tip below the floor. Standing/landing frames do the same by a few px. Recommendation: raise the crouch weapon
  so its tip rests on the ground (`rest(3)` to `rest(-3)` on those six frames). Built: NOT done, feet only, as briefed.
- The lunge pole is now short by design (the hit is only 18 px). If you want it to READ longer, the hit reach (a gameplay number)
  would need to grow; recommendation: leave it.
