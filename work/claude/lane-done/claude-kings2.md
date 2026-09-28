# claude/kings2 — KINGSWOOD, design-audit beats

Brief: the design audit's KINGSWOOD section (plan items 1-4), built on current master (post NPC-removal,
post combat-pass/throwables/push-blocks). Also the approved backlog: THE HORNET QUEEN's arena headroom,
THE GREAT HOUND weak-boss plan, and game-wide pattern 1 (the last stretch before the boss is an exam) as
it applies to Kingswood specifically.

Design audit source (unmerged, cited as such — `git show origin/claude/designaudit:docs/level-design/
wood-to-highcrown-design.md`, not a path this branch can cite from a fresh clone; `dangling-paths`
forgives this the way it forgives every other lane's citation of that branch).

## What changed (src/level.js, kingswood())

1. **A plate and cage on fork one's high road** (final columns 159-166, over the thief who already stood
   there at 160,7). The thief's floating ledge is now solid (`block` instead of `plat`) so a dropped cage
   has something to land on; a plate on the ledge road at 166,9 drops a cage from 160,3. Fixes the audit's
   named GAP: before this, a high-road-only player met the plate-and-cage mechanic for the first time in
   the boss fight.
2. **TWIST fork two** (final columns ~397-467): inverted. The plate moved from the roots up to the canopy
   (454,9, on the existing ledge road), its cage now hangs high in the canopy (454,4) and falls through a
   new two-tile hatch cut in the roof (453-454, rows 12-15) onto the roots floor, landing on the brute who
   is now "the patrol." A second cracked timber post (418-422) opens over the pike, mirroring the level's
   one existing post (hunting stands) instead of leaving it a one-off in this fork too.
3. **DEVELOP the hunting stands** (354-401, previously the level's longest quiet stretch): a second
   cracked post (355-359) now drops its deck on a sprig patrol at the section's own start, and both stand
   archers face the rope walk between the towers (previously only the far one did — the near one faced
   away from it).
4. **EXAM the processional** (final columns ~578-583): the sign already promised "fire archers light the
   grass, braziers tip" — now built. A brazier and a hanging cage sit with the carpet guards (580,13 /
   580,5), a plate on the loft step drops the cage (583,8), and a firepit burns in the grass by the fire
   archer (578,13).

King Gorm's own **phase-3 rockfall**, `if (false && ...)` and dead since before this branch, is deleted
(src/main.js ~18890): Kingswood's rule is fire (roof vents, the Fired Wood, tipping braziers, fire
archers), not rocks — reviving a rock-drop would fight the level's own theme rather than use it. The
throne room's own EXAM above carries the fire rule into the last stretch instead.

Level id `kings`, `needs: 'spore'`, and the boss (`king`, arena unchanged) are untouched. `L.mini`
(the Great Hound) is untouched geometrically.

## THE GREAT HOUND, weak-boss plan (src/main.js)

- **A blocked lunge skids him, stunned, x2**: the skid/stagger window on a blocked lunge doubled, 1.0s
  → 2.0s (`updateGreatHound`, the `lunge` case) — a real punish window for the counterplay the level's
  own sign already teaches ("A BLOCK SKIDS IT").
- **Less damage otherwise**: `DMG.greathound` 20→15, `DMG.pounce` 25→19, `DMG.snap` 15→11 (~25% down
  each; the skid-stun interaction above deals no damage regardless).
- **Phase 2, a pack howl**: past half his blood, his howl calls three pups (down the middle plus both
  kennel doors) instead of two — a real phase-2 escalation instead of just faster timers.
- **His missing `mini:true`**: already fixed on master (`src/level.js` line ~1075, dated 2026-09-24) —
  nothing to do here.

## THE HORNET QUEEN's arena headroom (backlog, approved)

She is in **Bracken Wood** (`brackenWood()`), not Kingswood — her hive clearing's arena floor sits only 9
rows under the top of the level's own grid (144px), and her `volleyUp`/`volley` hover height was
`floor - 110` (row ~2.1), two rows short of the map's own top edge. Fixed **where she is**, not in
Kingswood: her `slamUp`/`slamHang` and `volleyUp`/`volley` hover heights come down one tile each
(`floor - 96` → `floor - 80`, `floor - 110` → `floor - 94`, src/main.js `updateQueen`). No terrain moved —
`slopes-trace` for `wood` is unchanged (confirmed below) — only her own operating heights, which now sit
comfortably clear of the world's top edge instead of nearly touching it.

## A new check (tools/kings2-beats.mjs)

Pins all four plan items' entities by their BUILT (final, post-`grow()`-splice) coordinates: the fork-one
plate/cage/solid-ledge, the fork-two canopy plate/cage/hatch/second post, the hunting stands' second post
and archer facing, and the processional's plate/cage/brazier/firepit. Proved red on old master (`21fcea4`,
this branch's own base, via a throwaway `git worktree`, never `git stash`) before trusting it green here.
Added to `tools/check.mjs`'s list.

## Numbers, before → after (tools/pacing.mjs kings)

- Set-piece stretches: 15 → 20 (fewer, better foes — no new foe types, only new plate/cage/timber
  placements and one relocation).
- Fights near a landing/jump: 5 → 7 (archer@117,9 stormshaman@255,13 sprig@345,11 archer@351,13
  thief@431,6 archer@437,8 brute@561,13).
- Last 80 route tiles (game-wide pattern 1): was `F-PRSXSF--RP-F-XH-FSRBBBB`'s tail `XH-FSRBBBB` (one H,
  one X, then a bare rest into the boss). Now `XH-HXRBBBB` — two H (fight+platform) and two X (set-piece:
  our new EXAM plate/cage plus the existing lever/ram/ambush), still one rest checkpoint before the arena.
  Kingswood's own last stretch now examines the level instead of resting it, matching the audit's
  game-wide pattern 1 without touching the generic `pacing.mjs`/`exam` infrastructure the audit proposes
  for every level (out of this lane's scope — see QUESTIONS).
- `checkpoint-gaps`: worst gap still 130 route tiles (kings), unchanged, within the 150 limit.
- `answer-tags`: kings already asks ≥3 answers (not in the "fewer than three" list before or after).

## Checks run

Named checks only, per the lane rules (never the full suite):

- `architecture`, `checkpoints`, `skins`, `dangling-paths`, `npc-removal`, `checkpoint-stand`,
  `checkpoint-gaps`, `answer-tags`, `attack-tokens`, `kings2-beats`, `king-refill`, `boss-fight-end` — **green**.
- `slopes-trace`: **kings' own trace changed** (the fork-one high-road ledge went from one-way to solid,
  on purpose, for the new plate/cage — a real physics change at that one spot). Rebased with
  `node tools/slopes-trace.mjs --rebase=kings`; `wood`, `keep`, `burial` (the model's other three sample
  levels) are byte-identical to the pre-slopes baseline, confirming the Hornet Queen's hover-height tweak
  didn't move `wood`'s own trace.
- One retry: `attack-tokens` failed once under load with "only 2 red !! blows... nothing to measure" on
  `stockade`/`waymeet` (unrelated to Kingswood, not in common.md's named flake list but reproduced as
  flaky here); a standalone re-run passed clean twice. Likely load-sensitive timing on this machine (2
  other lanes running), not a regression from this branch.
- Boss lab, King (`tools/headless.mjs boss kings`, knight/warden/pyro/paladin/pirate/reaper, one seed):
  identical before (base `21fcea4`, throwaway worktree) and after — 19.2s/18.7s/16.1s (knight/warden/pyro),
  0 taken/min on all three. Expected: the only King-side change was deleting dead `if (false...)` code.

## UNVERIFIED

- No dedicated bot pilot for the Great Hound mini fight itself: `tools/headless.mjs boss kings` drives
  the King (the level's `arena` boss), not `L.mini`, and I did not find a mini-specific pilot tool cheap
  enough to justify building one for three number tweaks and a bigger phase-2 howl. `boss-fight-end` does
  cover him generically (45 of 45 boss/mini fights still end when their boss dies, Great Hound included).
  Recommend a manual playtest pass on the mini fight before release if there's time.
- The Hornet Queen's `volleyUp`/`slamUp` heights are unverified in a live browser (no pilot run against
  `wood` — out of scope for a Kingswood lane's cost budget); `slopes-trace` confirms no terrain moved, and
  the change is a pure number nudge on an existing hover routine, not new logic.

## QUESTIONS FOR DANIEL

1. **Game-wide pattern 1's generic `exam` check** (an automatic check that the last 80 route tiles of
   EVERY level hold ≥2 P/H stretches, one rule mechanic, and a foe near a jump/landing, with a shrinking
   grandfather list) is a cross-level infrastructure piece, not a Kingswood-only fix. I built Kingswood's
   own last-stretch content (item 4/EXAM) and pinned it in `kings2-beats.mjs`, but did not build the
   generic `pacing.mjs`-based check for all 14 levels — that's a "fix once" job spanning levels this lane
   doesn't own. **Recommend**: a dedicated small lane (or the integrator) builds the generic check once
   Marsh/Sporewood/Scree/Burning's own EXAM fixes land too, so it can grandfather in the ones not yet done
   rather than fail the whole batch. Built conservatively (Kingswood's own beat only) in the meantime.
2. **The Great Hound's phase-2 pack howl (3 pups instead of 2)**: I read "weak-boss plan" as making him
   fairer (bigger punish window, less raw damage) while keeping phase 2 interesting via a bigger howl
   rather than raw numbers. If the intent was the opposite (phase 2 should also be easier, not add a
   third pup), the fix is a one-line revert (`const sides = p2 ? [-1, 0, 1] : [-1, 1]` → always `[-1, 1]`).
   **Recommend**: keep the third pup — the level's own kennels theme (multiple hounds) supports it, and
   `boss-fight-end` still confirms the fight always ends.
