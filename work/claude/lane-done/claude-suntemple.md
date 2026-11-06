SUNTEMPLE DONE 11-06 10:09 READY (code-only greybox; browser look, art, music, tune owed) - branch claude/suntemple tip 05b11e1cb

# claude/suntemple - THE SUN TEMPLE + THE FALLEN SUN PRIEST + THE DESERT PRIEST UNLOCK BEAT (OPUS greybox, 11-06)

Branch `claude/suntemple` off `claude/priestart` (3c73ec89f), with `claude/colossus4` (5f28d2603) merged in first for beam-path / sunroom-hands / the Glass Sea's glyph-court find. **The merge was clean: no conflicts.**
Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-suntemple`. NOT merged to master, NOT deployed. No browser was used on purpose (there was one slip, listed below). tools/check.mjs was not run.
Sources: plan-desert-1105 s1/s2/s3/s4/s5/s6 (APPROVED 11-05 14:07), brief-suntemple (+ the 10-14 "THE BOSS IS THE HERO" line), src/draft/sun-temple.js, docs/sun-priest-rooms.md, and the desertpriest / priestart / colossus4 reports. brief-temple2.md turned out to be the Monastery's Temple Guardian, so it did not apply.

## Dev flag / URL
- `src/sun-temple.js` has `TEMPLE_SHIPS = false`. `templeOn()` is true from `?temple=1`, from `globalThis.BRACKEN_TEMPLE`, or from `BRACKEN_TEMPLE=1` in a Node tool's env.
- With the flag OFF, `suntemple` is still APPENDED to LEVELS (its own `LEVELS.push` line, so no save index moves), but it is `hidden: true`. It gets no map node and has nothing on the live road.
- With the flag ON:
  - It is a spur off THE GLASS SEA (`needs` + `spurOf: 'glasssea'`, `classFor: 'sunpriest'`).
  - It is appended LAST to DESERT_NODES at (26,150) with `plate: 'below'` and `spur: true`. It is drawn once the Glass Sea is cleared.
  - The can't-miss find on the road is the Colossus 4 lane's GLYPH COURT (`L.templeSpur`, behind `?col4=1`).
- Play the level: `?temple=1&level=suntemple&hero=knight` (add `&priest=1` or `hero=sunpriest` for the Desert Priest).
- Play the boss: `?boss=fallensun&hero=knight`. This works with the flag off too, because the boss table reads every level.

## What was built
| file | what |
|---|---|
| `src/sun-temple.js` (new) | The flag, the level (328x40) and the sanctum stage. **THE RULE: THE SUN MOVES.** The halls are `L.sunRooms` from the desert kit; there is no new light system. |
| `src/fallen-sun.js` (new) | THE FALLEN SUN PRIEST: a pure fight on the Desert Priest's own kit. It also holds `selfCheck` and the node bot flow sim `simFights`. |
| `src/fallen-sun-hands.js` (new) | Binds him to the world:<br>- the sanctum's light is SRH room `sanctum`, and its shutters set sources `off`;<br>- cords drop shutters;<br>- the beam is drawn with beam-path (dotted while told, solid while it burns);<br>- the radiance sun over him, the B10 read, and the beat. |
| `src/sun-temple-hands.js` (new) | THE DIAL: a HUD band with five windows, the sun's disc, and "THE SUN COMES TO YOUR WINDOW IN n".<br>Also: the glint on mirrors a hall still needs, the 10 s nudge, the sun mends heroes and burns the dead, and the DUSK SIEGE (windows go out one by one). |
| `src/sun-puzzle.js` | `solveRoom` now solves a moving-sun room at every HOUR (it used to try clock 0 only) and returns `hour`. New `hoursOf` and `hoursOpen`. The kit's 77 checks still pass. |
| `src/sunroom-hands.js` | New reads: `room(id)`, `rooms()`, `litBox(box, id)`. |
| `src/main.js` | Wiring, done with an all-or-nothing exact-match patcher: imports, EHP, names, colours, roar, quiet word, touch rule, BOSS_T, clear, spawn, take, update, frame, scale, drawOver/drawWorld/drawHud, strike (cords), STH.update, bar name, the death case (the beat), SPR.fallensun = the hero's own sheet (`bakeSunPriest`, 22 poses), the bestiary card, and the DESERT_NODES node (flag only).<br>**`PRIEST_RAYS()` is now defined**: the Desert Priest's beam as tile rays. Before this it was undefined, so every priest cache in every level stayed sealed.<br>**THE UNLOCK (Q3):** `sunpriest` is now `feat: 'boss:suntemple'` + 10 silver, and **the 800-gold path is removed**. PRIEST_SHIPS stays false. |
| `src/level.js` | The appended LEVELS row. |
| `src/marks.js` | His BY_HAND / MARK / ANSWER rows. |
| `tools/level-quality.mjs` | Now counts sun-room pieces (mirror / door / hold door / cache / lamp / shaft / windows) as gadgets. This is the "tool gap" the colossus4 lane named. The gated run is still green. |
| `tools/sun-temple.mjs` (new) | 82 node checks, plus `--sim=N`. |

## The level (sections by column; fewer checkpoints: 2)
1. **0 THE STAIR OF DAWN** (teach): outside steps up to the porch. THE GATE OF DAWN has one fixed shaft on a mirror turned the wrong way: strike it and the door opens. The porch roof is a climb off the route, with a silver.
2. **48 THE HALL OF WINDOWS** (the moving sun taught): five windows and one mirror under window 4. Turn it, then wait for the sun (30 s day, the dial counts it down). Meanwhile the shafts burn the dead. A gallery climb leads to a silver.
3. **100 THE SUNDIAL COURT** (A14 platforming section: pacing.mjs counts 7 beats over 48 tiles; no foe in the climb):
   - an open court climbed ledge to ledge over sun-spikes;
   - a two-mirror chain (low mirror across, high mirror up to the eye) that works at ONE hour;
   - **THE PRIEST CACHE**: a sun-seal in the west wall that only his UP beam from the low ledge breaks, with a silver behind it.
4. **140 THE CLOISTER OF NOON**, CHECKPOINT 1: a HOLD door. It stands open only while the sun is on its eye (20 s day), is told 0.8 s before it shuts, and never shuts on a body. The fallen temple guard waits in the sunken garden, and there are sun-spikes before the door.
5. **200 THE DUSK HALL**: THE DUSK SIEGE, an ambush room with 2 waves of the dead. The windows go out one by one (east at 14 s, centre at 28 s). The west window is the last light; two mirrors sweep it across the floor to burn them.
6. **251 THE HIGH ALTAR**: a dais. CHECKPOINT 2 is the shrine before him.
7. **280 THE SANCTUM**:
   - 44 wide;
   - three roof windows, each with a SHUTTER on a CORD (strike it);
   - two MIRRORS on posts that, as built, throw the outer shafts INWARD, so the light is all his;
   - two low galleries to stand on over his beam.

**Cast: 0 new foes.**
- sun acolyte = gobmage under the bandit-mystic skin (ART owed: an acolyte skin);
- mummy and tomb skeleton;
- bone archer;
- deadpriest (the kill-first support);
- deadpaladin as the elite "fallen temple guard";
- jackals.

No goblins, and no wood.

## The boss (plan s5; boss law)
**Radiance:**
- It fills at 0.4/s in the sanctum's sun or on his own consecrated ground, and drains at 0.08/s in shade.
- Every cast except the staff costs radiance.
- **OPEN = put him in SHADE:**
  - FIZZLE: a cast whose wind-up ends in shade with too little bar opens him (x1.7, capped at 12% of him, 3.2 s on his knees, gold ring + timer).
  - GUTTER: his bar running dry in shade opens him the same way.
- After an opening comes a **told WARD of 2.5 s at x0.4**. **He is never fully invulnerable.**
- On guard, his DISC turns blows from his FRONT at x0.4 and takes blows from behind whole (B11). Committed blows land whole.

**His AI:**
- He SEEKS THE LIGHT: before a cast in shade he walks to the nearest lit floor (twice), then casts where he stands.
- **P2 THE NOON:** he walks to a turned mirror or a shut window and TURNS IT BACK. This is told, and a blow that lands in the wind-up stays his hand. From P2 his beam also stops at the first mirror in its path.
- **P3:** SUNRISE comes off a FULL bar: every shutter opens and every mirror returns to him for 6 s, with beams x1.5. **When the sun sets on him he is OPEN.**

**Moves** (each has its own windup and release pose from the hero sheet): staff run (blockable, a riposte on the beat), SUNBEAM (told by a dotted line), FLARE (when you swing in his face), CONSECRATE, SUNFALL (told by a red ring).

**Numbers:** hp 1900, scale 1.5. These are greybox numbers; the tune lane owns them.

**THE BEAT:**
1. He falls.
2. His sun-disc rolls to your feet.
3. The windows relight.
4. The card reads "THE DESERT PRIEST WILL WALK WITH YOU / THE SUN-DISC IS YOURS: HE WAITS IN THE STORE".

`PROG.bossDown.suntemple` is set by the generic code, and that is what the store feat reads.

**The boss is a full greybox, not a stub.**

## Node results (one at a time; no check.mjs)
- `tools/sun-temple.mjs`: **82 ok**. It covers:
  - the flag both ways, plus the node and unlock wiring;
  - lintSunRooms is clean;
  - the hour each hall opens at: gate h0+1 turn, hall h3+1, court h1+2, cloister h3+1 hold;
  - no hall is open as built at any hour;
  - the cache answers only to his beam, never the sun;
  - the hold door's open/tell/shut;
  - floodReach: the shut doors block the way, and with them open the way runs START to the sanctum; every mirror can be struck; the silvers are reachable; the cache silver only after the seal breaks;
  - 2 checkpoints, the siege, the cast;
  - the sanctum light: 29 of 44 columns lit as built; mirrors turned leave 1 middle column; the centre shutter leaves 0;
  - the fight's self-check (21 rows);
  - **the hands run in a node stub world**: the hall played through (strike, wait, the door opens); a mummy burns 36 hp in 2 s; a hero mends; he spawns and takes blows; cords drop shutters, and a shut shutter turns the room's source off; the beat.
- `node tools/sun-temple.mjs --sim=6` is the node bot flow sim. It is a pace read, not the rate. The bot: a knight-ish hero, 3 flasks, blocks half his yellow blows, and takes the light from him. Result: **5/6, about 80 s, all reach P3, 7-8 opens (all fizzles)**, 0-1 flasks left. The bot never lets him fill to SUNRISE (it denies the light).
- `level-quality suntemple`: everything passes except **music** (it borrows glasssea until the music lane) and ruleFight (report-only):
  - bands 7, flat 0%;
  - 7 gadget kinds, 4 of them developed;
  - secrets 3;
  - 2 checkpoints at 155 tiles each;
  - density 1.18;
  - roles 3+;
  - route 22 rows and 3 pockets;
  - unlocks ok.
- `level-quality` (gated run): every gated level still clears the bar.
- Platforming: 1 jump section (the court).
- Other tools:
  - `anchor-lint` lists 42 for suntemple (report-only, not gated): roof/lattice segments between windows, ledges with no drawn corbels, and porch/lip cantilevers. These are for the art lane.
  - sun-puzzle 77, sun-kit 79, beam-path 11, colossus4 48, desert-priest 82, goblin-lint ok, floaters ok, comments ok.
  - `node --check` passes on every touched file.
- `dangling-paths` FAILS, but not from this lane: `src/desert-priest.js:21 -> src/reflect-kit.js` comes from claude/desertpriest. Fix it at the desertpriest/reflectkit integration.
- **SLIP:** I ran `tools/mark-integrity.mjs` to check the marks rows. It turned out to be a cdp page tool. I killed exactly its own process tree: node 25668, its timeout wrappers 24512/4076, and headless chrome 23356 with its 8 children. Its `serve.mjs` (29416) had already exited. No result was taken from it.

## Browser owed (one at a time, memguard first)
1. `?temple=1&level=suntemple`, walked by eye with the knight and the priest:
   - the dial;
   - glints and nudges;
   - the gate teach;
   - the hall wait;
   - the court climb and the chain;
   - the hold door's timing (a 4 s window at a 20 s day: is it fair?);
   - the siege lighting;
   - the cache with `hero=sunpriest`.
2. `level1-pilot suntemple --write`, `mash-bot suntemple`.
3. bossLab n=6: `?boss=fallensun`, `BRACKEN_TEMPLE=1 ... boss-rates.mjs suntemple --seeds=6`, target 60-70% with flasks, mash 0/6.
4. map-spacing / map-grammar for the (26,150) node; textfit for the new lines; mark-integrity and tells for his rows; boss-greed / boss-read rows (not added: `src/boss-greed.js`, `src/boss-read.js`, `src/audio.js` vox, `src/lab.js` bot plan).
5. Then the tune.

## Art / music owed (sonnet; art before live)
- the temple's tiles: white limestone, gold leaf, the five windows;
- window wells, shutters, cords, mirror posts, the sun-glyph eyes, the sun-seal, the gnomon, the porch;
- corbels under every ledge (this clears the anchor-lint list);
- a sun-acolyte skin;
- his FALLEN palette (he wears the hero's colours now);
- his radiance sun art;
- the shutter slab;
- the beat's disc;
- the level's own track and his.

The backdrop set `SETS.suntemple` already exists.

## Questions for Daniel (rec first; the rec is built)
1. **Opening model.** REC (built): a cast that ends in shade with his bar too low FIZZLES (open), he also GUTTERS if the bar runs dry in shade, and he seeks the light first, so the verb is to take the light as he arrives or as he winds up. Alt: shade alone opens him after N s.
2. **The verbs to darken.** REC (built): strike a CORD to drop a window's shutter (9 s in P1, 7 s later, told before it reopens), and strike a MIRROR to throw its window's light the other way (it stays until he turns it back in P2). Alt: mirrors only.
3. **His disc.** REC (built): x0.4 from the front on guard, whole from behind, and the post-opening ward at x0.4, not 0, to honour the resist-floor memory strictly. Alt: the usual 2 s ward at 0.
4. **Sun mends and burns.** REC (built): in the halls the sun mends heroes (+2 per 0.5 s) and burns the dead; not in the sanctum, where the light is his. Alt: it mends in the sanctum too (it gets easier).
5. **Hold-door window.** REC: keep the 4 s hold window (20 s day) and have the browser lane judge it. Alt: a 30 s day (6 s window, longer waits).
6. **The siege.** REC (built): an ambush room plus dusk going out by window. Alt: a timed survival with no ambush walls.
7. **Desert Priest store.** The 800-gold path is removed per Q3. REC: no change. If you want a gold path back it is a one-line change.
