# claude/burial — lane report (2026-09-24)

All four of Daniel's requests are on `claude/burial` and pushed. I did not touch master or deploy, and I did not run the full suite.

## Commits

| sha | chunk |
|---|---|
| `39c96bb` | merge origin/master (the only conflict was check.mjs: kept every name, added `mini-names`) |
| `db7a9fc` | Burial Caverns variety + THE GRAVEYARD KEEPER (finishes the frozen WIP) |
| `2242ebe` | THE BURIED DEAD: platforming arena + THE SKULLS |
| `92a1322` | THE BURIED DEAD's own sprite (sheet + real-page captures) |
| `b9ec0d6` | the pilot now counts the camper's skull damage on its own |

## What changed

**The WIP commit.** It parsed, and most of it worked. Three things were broken:
- The same patch had been run three times, so `additional-areas.js` spread `...variety` three times. It spreads once now.
- burial-variety's dark test compared 28 against 29. `BK.step(90)` draws only once, while the dark eases in the draw. The test also read pixels from the letterboxed canvas at the wrong scale. It now steps one frame at a time and reads `BK.view.buf`: dark on 34, off 54; a vent at idle 27, puffing 63.
- Three signs ran to 3 lines, so I shortened them.

`buried-dead.mjs` expected 5 green pools. The two bridges make it 7, and every one is still told. `burial-variety` is now registered in check.mjs.

**1. More variety in the Burial Caverns:**
- **THE BLIND VAULT** (cols 322–405) and **THE UNLIT CRYPT** (503–590) are dark zones at 0.6, with lamps no more than 22 cols apart. Buried dead lie in the dark stretches; their marks are drawn over the dark. Vents and anything thrown light up in the dark.
- **THE ROTTEN BRIDGES** (933–978) are two spans over green water. A board shows a crack and plays a sound, holds 0.55 s, then drops. There are chains at every end (C5). A span rebuilds 5 s after it goes quiet, and on every respawn (B4). With every board gone, the arena can still be reached.
- Proof in the real page: walking crosses a span; standing on it drops you into the poison; the span comes back in 4.4 s; a respawn finds it whole.

**2. The rename to THE GRAVEYARD KEEPER** covers the bestiary, `BEAST_SHORT`, `MINI_NAME`, `L.mini.name` (the card and the bar) and the sign. The id is still `gravewarden`. `miniName()` now falls back to the bestiary the way `bossTitle` does: he used to announce himself as "THE BEAST". The new `tools/mini-names.mjs` checks every level's mini.

**3. The Buried Dead:**
- **Platforms.** A step at each wall (row 29) and a crown bier hung on chains at row 24 (128 px), right over his grave. The route wall step → low → high → crown → high → low → wall step never touches the floor, and the reach model walks it. A12 still holds: nova 80 px, the hands reach any footing, and the arm-in-the-ground punish works (arena-supplies, buried-dead, boss-openings are green).
- **Unique sprite.** `src/buried-dead-art.js` is a half-risen corpse-king in 18 frames, 112×118:
  - one pose per tell, including the new skull tell;
  - the blow frames (slam, sweep, thrown);
  - OPEN, BURIED (he sleeps as a mound) and STUCK.

  The sheet is `docs/burial/buried-dead-sheet.png`. The real-page captures are `docs/burial/page-*.png`: arena, skullTell, skull, slamTell, novaTell, clawTell, stuck, bridge, vault. `tools/buried-dead-art.mjs` (added to check.mjs) fails if:
  - a frame is off the anchor;
  - a tell wears his rest pose or shares another tell's pose;
  - the sprite goes back to the zombie baker.
- **The skull throw.** 2 s up on a tier (>30 px) or more than 150 px away starts it. The tell lasts 0.9 s: a lit-skull pose, a green ring closing on where you stood, a bone clatter, "SKULL: GUARD IT". He throws 1 skull, or 2 once enraged, with a 7 s cooldown. It does not use up a rotation turn, so SINK stays sixth (option A) and the punish keeps its timing. It is in `windingUp()`, and its clocks start at 0 when he spawns (A3).
  - **Shield rule: YELLOW (the shield turns it).** A camper on a four-tile ledge has nowhere to step. An unblockable answer to camping would make the high tier a trap. THE HANDS stay the unblockable way to reach the ledge. So the two ranged answers ask different things: the hands your feet, the skull your shield.
  - Forced in `tools/buried-attacks.mjs`: unguarded loses 18, guarded 0, and 2 skulls fly when he is enraged. Camping the ledge or the far wall draws a skull; fighting close on the floor never does.
  - The lab bot guards a skull in flight.

## Pilot (bossLab, normal, dice pinned, 4 passes × 6 heroes) and INDEX

| | before (origin/master) | after |
|---|---|---|
| bot fights | 24, **0 wins** | 24, **0 wins** (identical rows) |
| damage by mode | rest 708, nova 572, hands 380, body slam 232, sweep 36 | the same |
| camper, top perch, 60 s still | 96 px up: died (hands 26/52, sweep 26, zombies) | 128 px up: died; **3–4 skulls thrown, 54/72 of the 100 was skull damage** |
| `curve.mjs` burial | foes 183, threat 434, hazard 44, **INDEX 108** | foes 186, threat 440, hazard 52, **INDEX 110** |

The bot fights on the floor, close in, so it never meets the skulls or the platforms. That is why its rows are identical.

## Checks (on the final tree)

**Green:** syntax, comments, buried-dead, buried-attacks, buried-dead-art, burial-variety, mini-names, burial-geometry, burial-route, burial-rework, additional-areas, additional-areas-runtime, arena-supplies, boss-openings, boss-fight-end, audit, traps, killzones, collectables, spawns, deadends, floaters, checkpoints, skins, dressing, signs, tells, one-new-foe, threat-holes, textfit.

**Re-runs:**
- signs failed once on the 3-line signs; green after I shortened them.
- buried-dead failed once on the pool count (5→7); green after.
- tells needed `--write` for the new mark row.
- buried-attacks failed once: a forced skull had no aim point. It now has its own `skullAt`.

**Red first:**
- burial-variety without the spread: "two named dark places".
- mini-names with the old naming: "announced as THE BEAST".
- buried-attacks on the old boss: `{"skulls":0}`.
- buried-dead on the old room: "crown bier missing".
- buried-dead-art before wiring: "still the zombie baker".

The fight commit (`2242ebe`) was split out of the combined tree. Its checks ran with the sprite in place too; the sprite only changes drawing.

## Parked questions
1. **The pilot bot loses every fight, before and after (0/24).** Most of the damage is "rest" (708): mostly grave-zombie bites while he rests, plus the nova. Is he too hard at normal health, or does the bot just not handle the adds? I did not retune him.
2. **Skull numbers** (2 s camp clock, 150 px, 7 s cooldown, 14 dmg) are unpiloted by a human. Even before the skulls, a still camper on the top tier died in 60 s, from the hands and zombies. The skull speeds that up rather than creating it.
3. The bier's chains are drawn only; they are not climbable. Should they become NET, as a second way up?
4. At some platform heights the camera cuts his lower half off when you are on the high tier (see `page-skull.png`).
5. A10: the skulls add one nameable phase-two change (two skulls instead of one) on top of what he already had. Nothing else in his enraged rotation was touched.
