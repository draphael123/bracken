# THE QUEEN'S LANCE: slower, two more lookouts, and bowmen he calls (brief)

Daniel, 2026-09-25: *"I'd like the goblin knight boss to be a little slower as well, but have occasional archer support
since he lacks ranged moves. I'd like some platforms to be available to jump on as well."* He approved the defaults below.
Boss: `case 'lance'` / `updateLance` in `src/main.js`. Arena: section 4 of `stormhold()` in `src/level.js` (302-429).

## What is there now (measured on master 0264d19)

- He walks at 52 px/s (phase one) and 78 (phase two), charges at 250, and his phase-two shield rush runs at 230 for 0.55 s.
- The bridge already has FIVE lookouts, one on each tower pier from 320 to 392 (`plat(px0, BY - 3, 5)` under a
  `bridgetower`). The two end piers, 302 and 410, have none: a charge that pins you at either end of the bridge has
  nothing to hop onto.
- Every hero's full jump is 3.17 tiles (measured in the page, held jump, all seven heroes). A lookout three rows over
  the deck clears it by 0.17 of a tile - the five existing lookouts already live at exactly that height.
- Three fire archers and a rock goblin already stand on the bridge deck inside his walls (322, 358, 394, 412) when he
  wakes. The boss lab kills them before it fights, so no pilot number has ever included them.

## 1. Slower (about 15%)

| | before | after |
|---|---|---|
| phase-one walk | 52 | 44 |
| the charge | 250 | 212 |
| phase-two walk (behind the shield) | 78 | 66 |
| the shield rush | 230 for 0.55 s | 196 for 0.65 s |

The rush was aimed: it starts 44-130 px off and ran 126 px. At 196 it would run 108 and stop short of where it was
told, so it runs a tenth of a second longer and reaches as far as before. The charge keeps its 3.2 s (678 px at the new
speed, still more than half the bridge; he plants on passing you long before). Every windup (couch 0.8, rush tell 0.5,
thrust 0.5, ...) is a time, not a distance, and is unchanged. His vault is a leap aimed at where you stand, not a walk,
and is unchanged.

## 2. Two lookouts at the bridge ends

A lookout on the first pier (302-306) and the last (410-414), built the same way as the five in the middle: a
five-tile one-way deck three rows over the boards (row 27), a `bridgetower` standing on the pier under it, and a
brazier on it. Reached with the same full jump as the others. They are what the end of a charge gives you to stand on,
and they are where his bowmen come to.

The new lookouts are added by `src/lance-support.js` from the arena's own first pier, so the held Stormhold rebuild
(`claude/stormhold`, where the bridge starts at 544) takes them with one call.

## 3. The Queen's bows

- **Every 15 s while he lives** (the first 12 s after he wakes), he calls a bowman, if fewer than two of his are up.
- **Told (C1).** A horn on the tower (the Stockade's rising horn note), THE QUEEN'S BOWS over the end lookout it is
  coming to and a column of amber sparks on that lookout for 1.2 s. Then the bowman drops onto it from the tower
  roof with a thump and dust. He does not shoot for his first second on the boards.
- **Which lookout:** the end one nearer you, unless one of his bowmen already holds it; never the one you stand on.
  (Nearer, not farther: a foe more than 420 px from you is not updated at all, and a bowman at the far end of the
  bridge would stand there frozen.)
- **What he is:** a plain goblin ARCHER (no new kind: one-new-foe and F10 are untouched; not a fire archer), with the
  archer's own 10 health and its told `!` draw. No XP (he has no placed key), so the call cannot be farmed.
- **When the Lance dies** his bowmen throw down their bows and are gone with a puff (`bossEnd`). They are not bosses and
  nothing about the fight's end waits on them. A death resets them with the rest of the fight.

## Bot and numbers

The boss lab's hands (`src/lab.js`) cut a bowman down when he is on a lookout the bot can get to and the Lance is not
coming at it; otherwise they take arrows on a shield or step out of them. Piloted with `tools/lance-pilot.mjs`
(the ranking's settings: refill health, 150 s cap, plus one pass at normal health), every hero, before and after.
No tuning to hit a number: numbers are reported and the questions go to Daniel.
