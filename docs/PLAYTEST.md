# Playtest: jumping straight into a boss

A hidden shortcut for playtesting a boss or mini-boss fight without walking the wood to it. It is not a player-facing
feature (the real Boss Select menu comes later, with the UI lane) and it does not touch the parked Boss Rush.

## The URL

    http://localhost:<port>/?boss=<id>[&hero=<id>]

- `<id>` is the boss's own id: `queen`, `frog`, `chief`, `mother`, `king`, `ram`, `owl`, `abbot`, `gqueen`, `drownedking`,
  `kraken`, `pyromancer`, ... A level's mini is `<level>:mini` (`kings:mini` is the Great Hound, `spire:mini` the Temple
  Guardian). A bare level id (`?boss=wood`) is that level's boss.
- `&hero=<id>` picks the hero (`knight`, `warden`, `pyro`, `paladin`, `pirate`, `reaper`, ...). Left out, it is the hero
  in the saved slot. A hero id that does not exist is ignored.
- An id that matches nothing leaves the title screen alone and prints the full list of known ids to the browser console.

The hero stands one tile inside the fight's own trigger (the same spot `bossLab` uses) so the fight wakes at once, with
full health, no god mode, and the level exactly as a player reaches it. That spot is his checkpoint: a death puts him at
the door again, which makes a quick retry loop. The Falling Tower's sky fight (undeadmage) starts on the carpet, as it does in the lab.

## The chord

On the **title screen**, press **Shift+B**. A list of every boss and mini opens (name on the left, its wood on the
right; gold rows are minis, in campaign order, each wood's mini before its boss).

| key | does |
| --- | --- |
| Up / Down | move through the list (wraps) |
| Left / Right | change the hero (starts as the saved hero) |
| Enter or Z | jump into the fight |
| Esc | back to the title |

Shift+B clashes with nothing: on the title screen B is otherwise unbound (it is the throw key in play, and Shift is not
part of any binding).

## The list is the game's own

The list is built from every level's own `arena` and `mini` (`LEVELS[i].build()`), so a new boss or mini appears in the
list and in the URL by being built into a level. Nothing is written into a separate table. Build time is a few seconds
the first time the list is opened (it shows LISTING THE BOSSES).

## It never writes your save

`saveProgress()` is the only function that writes a save slot (music heard, medals, unlocks, the level-clear, banked
coins, the hero all go through it). The jump sets `bossJumpOn` before it changes anything, and `saveProgress()` returns at
once while it is set. It stays set for the life of the page, so winning the fight, dying, or going back to the map never
persists anything. Reload the page to play for real. Settings (volume, look) still save, since they are not progress.
Progress in memory can change during a jump (the map will show a boss down); it is discarded when the page reloads.

`tools/boss-jump.mjs` proves it: it seeds a save, jumps into every boss and mini through `?boss=`, cuts each down through
the end of its fight, and requires every `localStorage` key and value to be byte-identical afterwards.

## For harnesses

`BK.bossJump.table()` (the rows), `BK.bossJump.go(id, hero)`, `BK.bossJump.open()`, `BK.bossJump.on`.
`node tools/boss-jump.mjs` and `node tools/textfit.mjs bossjump` cover it.

## The chase demo

    http://localhost:<port>/?chase=demo[&hero=<id>]

A short corridor cut into the first level in memory (never saved, like `?boss=`): one chaser (src/chase.js) that starts when you cross the line, warns before it speeds up, pushes the camera, kills on contact, and one timed low beam to duck. Nothing in a real level uses it; `tools/chase.mjs` holds the rules.
