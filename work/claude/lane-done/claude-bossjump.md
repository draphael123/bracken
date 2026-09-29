# claude/bossjump - a hidden playtest boss shortcut

## What changed

A way to stand at any boss's or mini's door for playtesting. Two doors in, one function (`bossJump` in `src/main.js`):

- **URL:** `http://localhost:<port>/?boss=<id>` and optionally `&hero=<id>`.
  - `<id>` is the boss's own id (`queen`, `frog`, `chief`, `king`, `abbot`, `gqueen`, `drownedking`, `duneworm`, ...), a level id for that level's boss (`?boss=kings`), or `<level>:mini` for a level's mini (`?boss=kings:mini` is the Great Hound).
  - `&hero=` takes any hero id (`knight`, `warden`, `pyro`, `paladin`, `pirate`, `reaper`). A bad hero id falls back to the saved hero. A bad boss id leaves the title alone and lists the known ids in the console.
- **Key chord:** **Shift+B on the title screen.** It clashes with nothing (B is only the throw key in play, and no binding uses Shift). Opens a scrollable list of all 45 bosses and minis (name, and its wood on the right; minis in gold, each mini just before its boss). Up/Down move (wrap), Left/Right change hero, Enter or Z jumps, Esc backs out.

The hero arrives at the same spot `bossLab` uses (one tile inside the fight's trigger; on the carpet for the Falling Tower's sky fight), at full health, with god mode off, and the level as a player reaches it (nothing culled). That spot becomes his checkpoint, so a death restarts at the door. A mini the saved slot already has down is fought again (in memory only).

The list is read from the levels' own `arena` / `mini` (`LEVELS[i].build()`), so a new boss shows up in the list and the URL by being built into a level. The first open builds every level (about 5 seconds in the page, shown as "LISTING THE BOSSES").

## How it never writes progress

Every write of a save slot goes through `saveProgress()` (music heard, medals, unlocks, level clears, banked coins). `bossJump` sets `bossJumpOn` before doing anything else and `saveProgress()` returns at once while it is set. It stays set for the life of the page (reload to play for real), so nothing done during or after a jump, including winning the fight and going back to the map, is persisted. Settings still save (they are not progress). In-memory progress can change during a jump (the map may show a boss down); a reload discards it.

## Checks

New `boss-jump` (`tools/boss-jump.mjs`, added to `tools/check.mjs`): seeds a real save, then for every one of the 45 rows jumps in, requires the level's arena/mini to be that boss, the boss on the board and alive, full health, no god mode, and the fight awake at the door; cuts the boss down and runs the fight out; and requires every `localStorage` key and value byte-identical to before. It also asserts the table is exactly what the levels build, ids are unique, the real URL works (first boss, a mini, the carpet sky fight, the last row), `&hero=`, a level id, `<level>:mini`, a bad hero and a bad id, and the Shift+B list (plain B does not open it, scroll, hero change, Esc, Enter jumps with the chosen hero, no save written).

Proof the save assertion bites: with the `bossJumpOn` guard removed from `saveProgress`, `BJ_ONLY=queen,frog node tools/boss-jump.mjs` fails with "THE SAVE CHANGED". With the guard, all 45 rows plus the URL and chord cases pass.

`node tools/textfit.mjs bossjump --strict` (new screen: every row selected in turn, every hero on the hero line): 0 overflow, 0 truncated. It first found 15 truncated names and wood names; fixed by dropping the leading "THE " on the list and widening the panel.

Also run (see the final message for results): architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace, npc-removal, zoom-coverage, syntax, comments, homepaths, tells.

Docs: `docs/PLAYTEST.md` (new).

## Numbers

45 rows: 32 bosses and 13 minis across the levels (all ids unique). Each row jumps in and the fight wakes within 1 to 20 frames of standing at the door. 39 of 45 were cut down and run out by the check's script; 6 (`king`, `gqueen`, `kraken`, `closedhelm`, `gargoyle` and the `hedgewarden` mini) have openings the script does not force, so for those the save is compared after 500 frames of the live fight, not after a kill (`boss-fight-end` is what proves their deaths end them).

## UNVERIFIED

- I did not watch the list screen with my own eyes, only measured it with textfit (no overflow, no truncation, no collision). The look of the gold minis and the hero line is unjudged.
- Playing a jumped fight by hand through to the end and dying/retrying at the door was not done; the checkpoint-at-the-door behaviour is exercised only by construction (respawn from the checkpoint).
- Audio: a jump from the title does not switch the music itself; the fight's own arena music takes over when it wakes (untested by ear).

## QUESTIONS FOR DANIEL

1. **Checkpoint at the door:** I made the jump spot his checkpoint so a death restarts the fight immediately (best for tuning a boss). The alternative is the level's first shrine. Recommendation: keep the door (built).
2. **Chord:** Shift+B on the title. If you would rather have a typed word or a different key, say so. Recommendation: keep.
3. **Should the jump use the saved slot's talents/levels** (built: yes, so you fight with the loadout you have) **or a neutral level-1 hero?** Recommendation: keep the saved loadout; use a fresh slot for a clean test.
