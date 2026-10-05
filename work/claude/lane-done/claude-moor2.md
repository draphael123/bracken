# Lane report: claude/moor2 (GALE MOOR 2: the Wind Rocks and the Goblin Scaffolds)

Branch `claude/moor2`, from master 2423ff42 (batch68). Brief: `scratch/brief-moor2.md` (Daniel 2026-10-03). Opus greybox lane.
No boss changes. No foe AI changes (COMBAT PART 2 owns those): foe edits are placement only.

## What changed

**The kite ride is gone.** Section 7 (THE KITE POST & THE SKY ROAD, cols 535-646: the stormkite, the flight, its harpy strings,
skybolts and kite goblins) is removed, because flight belongs to the Sky Road level now. Gale Moor stays a ground level of sideways
told gusts. The level is still 703 columns, and the landing shelf (647-654, with its checkpoint outside the Windcaller's wall)
and the summit are unchanged. The Kite Field quest is untouched.

**THE WIND ROCKS (535-584)**, a climb over tors and a boulder stack:
- **CREVICES** (new, `src/moor-rocks-hands.js`): a `vent` ent with `crevice: true`. It whistles (`SFX.gustRise`, plus streaks drawn
  in toward the crack and a blinking chevron) for 1.2 s, then gives a single 0.5 s burst that throws a hero standing in its mouth
  straight up. It is a timed bounce, not a column you ride, which keeps it distinct from the Sky Road's thermals.
- The first crevice is taught safely: 6 rows of tor face, and a miss only costs you a wait.
- THE RIDGE: a told tailwind shoves you along it and off its end into a tarn. Brace, or cross in the still. Tor B is a 2-tile jump.
- THE HIGH TOR: its crevice bursts twice per gust turn. One burst lands you on the boulder top in the lull of the headwind up
  there; the other throws you into the gust and you are blown back down. The boulders (2-3 wide with cracks) are crossed in the
  still, or braced.
- Foes: a rock goblin on Tor A (throws at you while you wait), a harpy over the ridge gust, a goat on Tor B where you land (a
  butt sends you back into the tarn), and an archer on the boulders. Checkpoint on the high tor (583).

**THE GOBLIN SCAFFOLDS (585-646)**, goblins raising a windmill on timber over a black tarn:
- **GUST SHAFTS** (the crevice burst, in timber) throw you from the yard to the first deck and from there to the top deck (4 rows
  each, one more than any jump).
- **THE WIND AS YOUR WEAPON:** a goblin struck while a scaffold gust blows over him is carried off the deck the way the gust blows,
  down through the planks into the tarn (drowned by main.js `hazardFoe`). His AI is not touched: while the wind has him, main.js
  hands his body to `MRH.blow()`. A shield goblin who takes the blow on his shield is not carried off (no hit lands).
- **THE HALF-BUILT FRAME** (ent `gustframe`): a 14-tile windmill frame stands on one guy-rope. Strike the rope while the east gust
  blows and the wind lays the frame over the 7-tile gap as your bridge to the landing. Struck in the still, it only sways ("IT
  SWAYS BACK: IT WANTS THE GUST"). The frame's gust stops 12 tiles short of the landing, so no carried jump can cross the gap.
  Once the frame has fallen, that is read off the grid, so it stays down after a respawn.
- Hornblowers on the top deck (one stands by the gap), a shield goblin and an archer on the first deck, and a brute in the yard.
  The scaffold is drawn with posts, cross-braces, goblin banners that stream with the wind, and loose planks that lift in a gust.
- **TARNS:** `L.waterHurts` + `L.noWade` on the moor. The only deep water is the two new tarns. A fall in costs 21 hp and hands
  you back to your last dry footing, and the reach model does not let you walk the tarn bed. Every other moor pool is still a
  shallow bog.

**THEME FIT:** checked. Gale Moor is before the Goblin Queen (moor > oreroad > storm > crown), so living goblins are fine here
(the brief says so too). The timber, rope and banners are the moor's own drawing, not Highcrown's `scaffold` prop.

**House rule (glint + 10 s nudge):** `src/stuck-spots.js` gets a `moor` list with both crevices, both gust shafts, and the frame's
rope (until it falls; the frame's state is fed to the guide through `extra`). Signs at the point of use name the verbs.

## Files
- `src/moor-rocks-hands.js` (new): the crevices, the wind taking goblins, the frame, and the drawing.
- `src/level.js` galeMoor: the new sections, tarns, `moorRocks`, `waterHurts`/`noWade`, flight removed. The Cairn Ridge sign now points
  to the Wind Rocks.
- `src/main.js`, small local hooks:
  - the import and `MRH` construction
  - `crevice`/`shaft` flags on vent props, and crevices skip the sustained vent lift
  - a crevice draw branch
  - reset, update, drawWorld and strike calls
  - one line in `updateEnemies` for a blown foe
  - the guide's `extra` props
- `src/reachcore.js`: `gustframe` is pre-filled like a boarding plank (one line).
- `src/threat.js`: `gustframe: 0` (appended at the end of the table).
- `src/hint-lines.js`: the four new teaching lines.
- `src/stuck-spots.js`: the moor list.
- Tools:
  - `tools/moor-rocks.mjs` (new, in the check list)
  - `tools/moor-wind.mjs`: the kite-landing asserts are replaced by stricter ones (no kite or flight; the frame's span ends on the
    landing; the landing is a shelf with a checkpoint west of the wall)
  - `tools/relics.mjs`: the moor's skip ("flight, roosts cannot be walked") is removed. The relic-free fill now walks the moor and
    reaches every gate and checkpoint.
  - `tools/checkpoint-stand.mjs` and `tools/death-cost.mjs`: the moor's stale MODEL_GAPS entry (652,12) is deleted. The landing is
    reached with a real jump now, and the tool itself demanded the deletion.
  - `tools/moor-gusts-walk.mjs`: zones marked `along: true` (the ridge and both scaffold decks blow over footing, not over a
    crossing) are skipped, and `moor-rocks` walks them. Every crossing the walk did before is still walked.
  - `tools/moor-shots.mjs` skips the kite shot when there is no kite.

## Numbers before / after
- Mash bot, LEVEL mode (re-stamped with `tools/mash-bot.mjs --level moor --write`, then the boss): knight dies 1 → 2 (lowest hp 0%),
  warden dies 1 → 1 (0%), pyro dies 3 → 2 (0%). The mash bot does not clear the level with any of the three heroes.
- Boss (Windcaller) mash row, re-stamped after the level row (`tools/mash-bot.mjs moor --write`): 0/6 wins, as before. Boss left 77-99% (before: 79-99%). The boss itself is unchanged.
- `tools/curve.mjs` INDEX: 101 → 89. The Sky Road's harpy strings and skybolts counted heavily. I added the goat and the brute
  (84 → 89). Moor is now "10 easier than the Monastery" (curve is informational, and many levels sit below their predecessor).
- level-quality moor (moor is not gated): density 1.15 → 1.30 encounters/screen, empty screens 11% → 4%, ranged foes 6 → 8,
  supports 2 → 4. The same two old misses remain: bands 7 (>=5 ok) but a second height on only 11% of the width, and route
  branches 1.
- route-breaks moor: the landing checkpoint 652 used to be "out of reach" in the model, and now it is reached. The Kite Field
  silver at 200,15 is unchanged (pre-existing).

## Checks run (all with PORT=8616)
Green:
- moor-wind, moor-gusts, moor-rocks (static, plus runtime for knight, warden and pyro: 11 asserts each)
- stuck (static + runtime), relics, hint-shown, signs
- checkpoints, checkpoint-gaps, checkpoint-stand, death-cost
- architecture, skins, dangling-paths, npc-removal, boss-fight-end, slopes-trace
- one-new-foe, audio-assets, collectables

Not green:
- route-breaks: report only, exit 0.
- moor-gusts-walk: knight's walk shows the Tumble headwind 495-533 FAIL. This is **pre-existing**: the same row fails on the
  untouched base 2423ff42. Every other crossing is ok, and the new high-tor crossing is ok too.

**slopes-trace:** the Gale Moor trace did NOT change, because the moor is not one of the traced levels (wood, kings, keep,
burial, canal, welltown). No rebase was needed.

## UNVERIFIED
- A human eye on feel: crevice burst height and timing, the wind-taken goblin's arc, and how readable the frame fall is. The
  art is greybox-plus: the scaffold and frame are plain canvas shapes. A Sonnet art pass should give the crevice a proper sprite,
  and the fallen frame's lattice lies mostly under the bridge's plank tiles.
- The level-1 pilot and the human-bot pilots were not run (the boss did not change).

## QUESTIONS FOR DANIEL (each built as recommended)
1. **The moor's difficulty INDEX fell 101 → 89** with the Sky Road gone. Rec: keep it. The mash bot still dies with every hero,
   and the scaffold's goblins are deadlier by placement. If you want it back over the Monastery, add one designed encounter
   rather than sprinkle (a hornblower on the high tor, blowing you back off the boulders).
2. **A shield goblin who blocks your blow is not taken by the wind.** Rec: keep it. It teaches you to go round the shield, and
   the archer behind him can be blown.
3. **Should the moor be added to level-quality's GATE?** It still misses two old measures in sections this lane did not touch
   (second-height share, branches). Rec: not in this lane.
