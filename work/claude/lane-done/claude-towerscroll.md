# claude/towerscroll - THE SPIRAL STAIR BECOMES AN UPWARD AUTO-SCROLLER

Branch `claude/towerscroll`, off master d78b15e (batch46). Opus lane.
Daniel played it on 2026-09-29 and said "the fire looks odd". He approved replacing the stair's brazier fire walls with an upward auto-scroller.

## What changed

**1. The rising dark.** The climb is now src/chase.js's chaser. The level hands it one chase: `RISE` in src/spiral-chase.js, set as `L.chases` in src/tower-ascent.js.
- **The pick:** his DARK MAGIC floods up the stairwell. I chose this over "the tower collapsing". It is his ring's green-black, the colour of every door he opens, and a collapse would fall down rather than rise up.
- **What it does:** it rises on the y axis with autoscroll on, and it KILLS on contact, like a cave-in.
- **When it runs:** it starts when you stand on the first step. It stops just under the top floor, so the stair behind you is drowned and the carpet floor stays dry.
- **Where it runs:** a `zone` keeps it to the stair tower, because the Falling Tower's own floors share those rows.
- **How it looks:** a new chaser look, `dark`. The surface is a slow swell with a bright green rim, a haze and sparks above it, and a dark body filling to the foot of the screen. The danger wash at the screen edge is now his green, not fire red: a look can now carry its own `wash` colour.

**2. Its speed is told and kept fair.**
- **Speeds:** 11, then 13, then 15 px/s. Each speed-up is warned first with the engine's banner, thunder and flashing line ("THE DARK QUICKENS", "IT RISES FASTER").
- **When you are behind:** the rubber band slows it to 0.8x once it is within 96 px (6 rows) of you.
- **When you are ahead:** `rubber.catch` is 1, so it never runs faster than its told speed. Its top speed (15) is under the slowest hero's own climb (17.5 px/s, the paladin, measured). The leash (180 x 1.25 = 225 px) keeps it on the screen's side of you.
- **Standing still:** a hero who stands on the stair is caught in about 28 s.

**3. The camera rises with it.** I added two optional fields to the engine's `chaseCam`:
- `show`: keeps the dark's surface 16-40 px up from the screen's bottom, so you see what is coming.
- `showKeep`: the hero always keeps 60% of the screen over him, so the Archmage waiting over the next landing stays in frame and can still cast. If you are far ahead, the dark drops below the frame and the green edge wash tells you it is there.

The camera never shows under the stair's floor while the dark is still in the stone.

**4. Removed cleanly:**
- His three wards, the braziers, the fire walls, the snuff and the relight brazier.
- `SEAL`, `wardOf`, `sealPerch`, `lightBrazier`, `updateSeals` and `drawSeals` (src/spiral-chase.js).
- The `ward` ents and the reach fill's ward rule (src/reachcore.js).
- The brazier-strike, the ward reset on retry and the seal drawing (src/main.js).
- The teaching sign.
- `magechase|snuffTell` in src/marks.js (the table was rewritten by `tells --write`).
- The bot's brazier, fire-jump and ward-wait code (src/lab.js `chaseClimb`).
- The seal pictures in tools/realm-shots.mjs and the seal columns in tools/archmage-pilot.mjs.

**5. Kept:**
- His music from the first step and on into the fight.
- Him above you casting his told spells: fire alone on flight 1, and his firebolts in pairs from flight 3.
- All six flights and their shapes.
- The portal and carpet at the top, unchanged.

**6. One checkpoint, at the stair's FOOT.** It stands at (84, 123), beside the ring you arrive through, just under the dark's start line. That is the engine's rule, and the lint passes. It was on the middle landing before. A death restarts the whole climb, which is short (32-38 s for the bot). src/checkpoint-thin.js now pins (84,123) in place of (104,96).

**7. The 3-tile gaps are 2 tiles now.** The paladin cleared them by a hair, and under a rising kill a missed jump is a death. The changes, all in src/spiral-chase.js `FLIGHTS`:
- Flight 2's middle step is now [90,5,111]. It also stops a fall from the failing step above dropping 17 rows.
- Flight 4's stones are at 98, 94, 90 and 86.
- Flight 6's failing step is now [91,4,81].

No flight's shape repeats. tower-collapse's "the fall off any failing step is under 14 rows" still holds.

**8. main.js edits** are small and local to the stair and the chase hook. There are no realm, mage-realms.js or Folly edits:
- Imports.
- `chaseMage` no longer handles braziers.
- The idle chase waits for its zone.
- The start banner is `sp.say` ("HIS DARK MAGIC RISES: CLIMB!").
- Boarding the carpet resets the stair's chase.

## Checks

**tools/tower-chase.mjs was rewritten.** Every new assert was red on the base d78b15e. The first failure there is "a gap on the stair is wider than 2 tiles". A probe of the base also shows no `L.chases`, the seal exports and 3 ward ents still present, `magechase|snuffTell` still in the marks, and the checkpoint at (104,96), not the foot. On this branch it is green and asserts:
- There are no brazier, seal, snuff or ward remnants in the module, level, marks, main.js, the bot or the reach fill.
- Exactly one chase runs on axis y, going up, with autoscroll, KILL, the `dark` look, and a zone kept to the stair.
- The engine's lint passes with the level's checkpoints, and the checkpoint is at the foot, just under the start line.
- The dark starts on the first step and stops under the top floor.
- It quickens at least twice, each time told.
- In Node, a hero standing still is caught, and a slow, steady climber (14 px/s) never is.
- In the page, the camera never shows more than the edge under the front, and it never loses the hero or an in-range dark off the screen. It rises about 616 px.
- A speed-up is told before it comes.
- The bot (god mode) reaches the carpet in about 27 s with 6 told casts, none off the screen.
- The fight starts and the dark is gone.
- **All 7 heroes** climb under the scroll with no god mode (health held up) and are never caught: 32-38 s each.
- The dark's top speed is at or under the slowest hero's climb.
- A hero who stands on the stair is killed (about 28 s) and wakes at the foot, with the dark at rest and him over the first landing again.
- All the old spell rigs still pass.

**tools/chase.mjs:** "no level has L.chases" became "only the Falling Tower has L.chases, and each listed level passes the lint with its own checkpoints".

**Green on this branch:**
- tower-chase and chase.
- The level's own checks: tower-ascent, tower-collapse, checkpoint-stand, checkpoint-gaps and checkpoints.
- checkpoint-rule (exit 0).
- tells, undead-realms (untouched), untold-told, boss-fight-end (all 45), archmage-rings, tower-cutouts, sprinkle-cap.
- The required checks: architecture, skins, dangling-paths, slopes-trace (every level identical, no rebase needed), npc-removal and boss-fight-end.
- boss-jump (all 45 fights load through ?boss=).

## Pilots

These use the new tools/stair-pilot.mjs: the lab's stair bot, NORMAL health, no god mode, no refill. On a death it goes again from wherever it wakes. There is one seed per hero (the stair has no dice). BEFORE was run on d78b15e.

| hero | BEFORE time | BEFORE damage | BEFORE deaths | AFTER time | AFTER damage | AFTER deaths |
|---|---|---|---|---|---|---|
| knight | 78 s | 48 | 0 | 35 s | 0 | 0 |
| warden | 78 s | 48 | 0 | 35 s | 0 | 0 |
| pyro | 68 s | 48 | 0 | 32 s | 0 | 0 |

- **What the numbers mean:** the bot never stops, so it outruns his casting. He casts only when he has settled over the landing ahead with you on the screen, and the bot is on that landing before he has settled. Before, the wards held you under him, and each brazier's fire burnt you. A careful-hand variant (`GUARD=1`, which stands and guards through every fire and frost tell) gave the same numbers: knight 35 s, 0, 0.
- **What still bites:** the dark kills a hero who dawdles or falls. In Node a hero is caught standing in about 28 s, and a fall from a failing step onto the flight below lands close to it.
- **A pilot bug, fixed:** an early after-run fed the bot in 3 s chunks and let go of the jump key mid-jump. Its one pyro death was that bug. `chaseClimb` now takes a `stop()` so the pilot drives it in one call.

## Captures

Made with `node tools/chase-shots.mjs towerscroll`. They are 2x PNGs in work/undeadchase/towerscroll/:
- `02-dark-rising.png`: flight 1, his green-black flood risen over the stair's floor under you, the screen edge washed green, him over the first landing.
- `03-dark-told.png`: "THE DARK QUICKENS" banner, told before the speed-up.

## UNVERIFIED

- **No hands on it.** The pace (11/13/15 px/s, 0.8x creep, caught in about 28 s standing) is tuned on the bot and Node only. A human who guards every tell and waits on the failing stone climbs much slower than the bot; that is exactly where the dark presses.
- **Small windows.** The camera tie assumes the stair's zoomed view is at least about 300 px tall; it is 311 at 1280x720. In a much shorter window the hero-keep wins and the dark drops below the frame sooner.
- Co-op was not tried; the engine reads player one.
- Reduce-motion: the glow is steady by the engine's rule, but the swell is not checked.
- The foot checkpoint lights when you walk past it (x84). You do on the way to the first step, but arriving through the ring alone does not light it.

## QUESTIONS FOR DANIEL (the recommendation is built)

1. **His spells barely land now.** A climber who never stops is on his landing before he settles. Built: his rule unchanged (he casts from the landing ahead, told, on the screen). Rec: try it by hand first. If he feels harmless, let him cast one told firebolt on the wing between landings. That is a small change in updateMageChase.
2. **The dark's pace:** 11, 13 and 15 px/s, a 0.8x creep inside 6 rows, and you are caught in about 28 s standing still. Rec: keep for first hands. If it is too soft, raise the creep to 1.0x rather than the top speed; the top already sits just under the slowest hero's climb.
3. **Kill or hurt:** built KILL, and the pilots show no deaths for a clean climb. Rec: keep. Switch to hurt plus a push up only if deaths from falls feel cheap in hand.
4. **What rises:** built his dark magic, a green-black flood. The alternative is the tower collapsing up the stairwell as rock (the engine's `rock` look). Rec: keep the dark; it is his, and nothing reads as fire.
5. **The checkpoint is at the foot**, so a death anywhere restarts the whole stair, about 35-80 s. Rec: keep, as briefed. The alternative is the middle landing, as before.
