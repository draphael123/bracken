# Lane report: claude/galemoor (the GALE MOOR rework)

The branch is `claude/galemoor`. It started from master at e7846f3, and `origin/master` was merged in twice (the second
merge is at 9963ca4). Everything is pushed. I did not touch master, did not deploy, and did not run the full suite.

The design is in `docs/briefs/gale-moor-rework.md`. It was written before anything was built and corrected afterwards
to match what was built. The level keeps its id (`moor`), its place in `LEVELS`, `needs: 'spire'` and its map node.

| part | sha | what |
|---|---|---|
| brief | f484cfc | the design, plus before captures, pilots and walk |
| 1 | 0a73329 | the cut: 996 → 703 columns, every column final, no hand-written column tables |
| 2 | 01e6b58 | told gusts that shove: ride, cross, brace; the Windcaller's howl is one |
| 3 | 1c5f632 | a landing shelf outside the walls; INSIDE_OK can only shrink |
| fix | 33e90d9 | hags only in the bog; no skybolt inside rock (found by the walks) |
| merge | e4445a6 | origin/master (Monastery, Ore Road mine life, Dune Worm, architecture check) |
| captures | 7dfdde4 | after set; the gust streaks made readable from the bank |
| merge | 9963ca4 | origin/master (Highcrown, Sporewood) |

## 1. The cut: 996 → 703 columns

Before, the builder was 908 columns wide and then grew twice. The ambush table, the elites table, moor-wind,
route-breaks and checkpoints.mjs all held the grown columns by hand. Now:

- Each section is written from its own origin in final columns, and `grow()` is gone.
- The ambush and both elites are built inside the builder.
- `L.sections` names every section.
- moor-wind and route-breaks read every column off the built level.

**Kept:**
- the Gate, the Causeway, the Stone Circle and its silver, the Bothy
- the Kite Field with its three kites, the Wind Rivers
- the Gallery, the Downdraft Cliff (now next to the Mills, as the review asked), the Mills
- the Cairn Ridge ambush, the Tumble, the Kite Post, the Sky Road, the Summit

**Cut:**
- the Ridge Run (60 columns). Its climb became the Bracing Stones.
- the Howling Gap (96) and the Whistle Stones (72). They asked the same thing as the Gallery.
- 98 of the Sky Road's 194 columns (8 of them went to the landing shelf). Each of its four stretches keeps its best part.

**Also changed:**
- The Gate and the Bothy are calm boxes, so no foes stand in the lees.
- The elite goat moved from the Bothy to the Kite Field.
- The garrison went from 23 to 16, so the density stays the same.

Pacing: 19 EMPTY stretches before, 5 after.

## 2. The gusts, as built

- **Told:** 1.2 s before a gust blows:
  - the flags lift
  - streaks gather at the upwind edge and move in over the pit
  - a yellow chevron blinks
  - `SFX.gustRise` plays if you are within 260 px
  - the screen-edge warning runs for the whole 1.2 s
  - Every gust on the moor is told, including the Downdraft Cliff's.
- **Shove:** while a gust blows, your speed is pulled toward the gust's own speed. This happens in `updateMoorWind`, after the legs and the ground's friction, so it actually moves you.
- **Brace:** hold the guard key (C) on the ground and the gust cannot move you. You can still shuffle at 40 px/s. It is the same key for every hero.
- **Rhythm:** every shoving gust uses the same beat: a 5 s period, 1.8 s blowing, 1.2 s building up.

**Where the gusts are used:**

| where | columns | what it asks | ground below |
|---|---|---|---|
| Causeway, first gap | 38–45 | ride an 8-tile gap (a jump clears 6) | bog |
| Causeway, posts | 55–64 | 3 hops over 2 posts; one still spell is enough | bog |
| Bracing Stones | 259–288 | 7 stones, 8 hops into a headwind; you have to brace on a stone | thorns |
| Gallery, pit | 298–305 | ride an 8-tile pit | thorns |
| Gallery, posts | 313–326 | 3 posts, 4 hops into a headwind | thorns |

The reach model now follows a ride: a gust zone with a `carry` value lets a jump go that many tiles further.

**Proof:**
- `tools/moor-gusts.mjs` (new, in the suite) was red on the part-1 code. It also failed on two mutations: a brace that does nothing, and a gust that is not told.
- `tools/moor-gusts-walk.mjs` drives the page with real keys and no god mode. For the knight and the warden, 10 of 10 crossings succeed when done the sign's way, and fail when done the wrong way.

## 3. The Windcaller: what changed and why

His four told attacks, their windups and his phase two are all unchanged. Three things changed:

- **The howl now shoves.** It used to add 210 px/s² from inside his own update, and friction reduced that to about 17 px/s. Now it uses the same shove as the level's gusts, and plays the level's build-up whistle over his howlTell.
- **A second opening you cause (A11).** If you brace through most of his howl (1.6 of its 2.2 s), "HIS WIND FAILS" and he falls, open (`knockCaller`). If you don't brace, the howl pushes you across the room and nothing opens.
- **The room's own gust is told** as well.

**Why:** the review said his only opening had to be waited for. This rewards the lesson the level has just taught, and adds no new attack.

**Proof:** `tools/boss-openings.mjs` has a new row for him. On the old code it was red (the hero moved 34 px and he never fell). Now it is green: unbraced, the hero moves 286 px and he does not fall; braced, the hero moves 0 px and he falls.

## 4. Checkpoints

- **The landing shelf.** An 8-tile shelf now sits west of his wall. The kite string is cut over it (`flight.x1` = 649), and a checkpoint stands on it at 652.
  - Probed in the page: the kite puts you down at 649, and dying in the fight wakes you at 652.
- **The 952 question: decided, moved out.** The levelfix report recommended keeping the checkpoint inside the walls because there was no ground outside them. The shelf removes that reason. B6 now holds strictly, and dying in the fight still costs only the fight.
- **Worst gap:** the longest run without a checkpoint is now 105 route tiles (it was 187). Gale Moor's KNOWN line is deleted; the cut made it stale in part 1.
- **The kite-ride soft-lock stays fixed.** The filler still skips the flight's columns, and checkpoints.mjs still fails any checkpoint on the ride.
- **INSIDE_OK is empty**, and an entry that no longer excuses a real checkpoint now fails the check. It was red with the moor's old [659,12] still listed.

## 5. Measurements

| | before | after |
|---|---|---|
| columns | 996 | 703 |
| INDEX (`tools/curve.mjs`) | 115 (Monastery 92, Ore Road 114) | 98 (Monastery 95 after its own rework, Ore Road 114). None of the three is flagged. |
| Windcaller pilot (bossLab, 6 heroes × 2 salted passes, dice pinned) | 12/12 wins, median 62.7 s, median 125 taken, opened 12 | 12/12 wins, median 43.9 s, median 82 taken, opened 12 |
| F9 play bot (knight + warden, no god mode) | walked 28%, stuck at 198, LONGGAP 209 | walked 40%, 4 deaths, stuck at 267 |
| gust crossings (real keys) | — | 10/10 |

Notes on the table:
- The after-pilot was run on the part-3 code, before either merge. His code has not changed since.
- The bot gets stuck at 267 on the Bracing Stones because it cannot read a tell or brace (RULES M).
- The bot also found:
  - a skybolt inside a stack. It is fixed, and `spawns.mjs` now checks skybolts.
  - an unexplained RUNTIMEFLOAT on a hare at 101,22 in the Stone Circle. It is rated "odd", and I suspect the vent lifts it, but I have not verified that.

**Captures:** `docs/galemoor/before-01..17` and `after-01..18`, all from the real page. The after set adds the Bracing Stones, the Landing, and a gust in its build-up and while blowing.

## 6. Checks

Every push was green on these checks, each run on its own:
- **Level checks:** audit, content-audit, traps, killzones, collectables, spawns, deadends, floaters, checkpoints, checkpoint-gaps, skins, dressing, signs, map-grammar, one-new-foe, threat-holes, elites, ambush-single, ambush-reach, occluders, ground-depth, route-breaks, and architecture (after the merge that brought it).
- **Moor checks:** moor-wind and moor-gusts.
- **Fight and code checks:** tells, arena-supplies, comments, homepaths, dangling-paths.
- **Page subset** (`check.mjs syntax,pixels,textfit,boss-fight-end,boss-openings`), run after each part and after each merge.

**Re-runs:**
- During part 2, one page-subset run failed with a CDP websocket error, and I did not capture which check it was. The same subset passed straight after. Another suite was sharing the machine.
- The elites check failed once in part 1: the troll was out of reach before the reach model knew about rides. I moved the troll.

## 7. Questions for Daniel

1. **The Windcaller is faster and less damaging to beat now** (median 62.7 → 43.9 s, damage taken 125 → 82). *Recommend:* play it before tuning anything. If it feels soft, raise HOWL_BRACE from 1.6 toward 2.0 s before touching his health.
2. **The backdrop is still the crag set**, the same as the Scree Path's (review, F6). The rework was not approved for art. *Recommend:* a small art pass: an open sky and a heather-ridge far/mid band.
3. **Practising the kite** (review item 4, a 20-column hop before the Sky Road) is not built. `L.flight` supports only one ride per level. *Recommend:* leave it. The ride is 96 columns now and dying on it costs little.
4. **The INDEX ignores wind.** Gusts are not counted as hazards, so the moor reads softer than it plays. *Recommend:* leave it until the ramp is re-measured (DESIGN part three says that is still open).
