# claude/monastery3 — THE MONASTERY, design-audit beats

Brief: the design audit's THE MONASTERY section (plan items 1-4) plus game-wide pattern 1 (the last
stretch before the boss is an exam), built on current master (post NPC-removal). Also folded in
Daniel's backlog: FAILING STONE, PUSHABLE BLOCKS + PRESSURE PLATES, and the washed-out-palette fix.

## What changed (src/level.js, theMonastery())

1. **DEVELOP the drawbridge** (bell yard, row 117, 17-40): a harpy and a fledgling now fly over the
   broken floor, and a goblin priest waits on the second tower's own floor (41-48) at the bridge's
   far end - blessing the fledgling (the harpy is a one-hit bird, never a rite's flock).
2. **COMBINE incense and loose masonry** (the bellows, rows 61-79): a short rock lip is cut into the
   shaft over the first plume's landing (block 16-18,67), with a loose stone hanging off it
   (`stal(17,68)`) that shivers as you ride the first brazier past it.
3. **TWIST the prayer wheel** (the crawl's right hollow, row 35): a third wheel (`wheel(35,77,34,1,'b')`)
   between two priests' flocks - the existing priest at 80 (flock: rockgoblin 84, sentry 88) and a new
   one at 71 (flock: a troll at 73, plus the garrison's own bats). Flip it with one of them on the
   stair and it drops out from under him.
4. **THE EXAM** (rows 29-40, the crawl to the belfry door): a small brazier (74,35) carries you up past
   the third wheel, so the last stretch before the Abbot now holds incense, a wheel, a priest, a troll
   and (garrison's own) a harpy in the same 80 route tiles - matching the audit's "only Bracken Wood's
   helm pit and the Monastery's crawl really examine the level," now built out rather than left thin.
5. **FAILING STONE, in the upper ruins** (Daniel's backlog): one board of the east-face scaffold
   (59-62,72) is now `L.crumbles` - weight starts its 3-count, it drops, and it's whole again 4s later
   (src/tower-collapse.js, the Falling Tower's own rule - reused as-is, nothing new written).
6. **PRESSURE PLATES, generalised from Kingswood** (Daniel's backlog, "if cheap"): it was cheap - the
   `plate`/`dropcage` prop pair is already level-agnostic engine code (main.js reads `L.ents`, not
   Kingswood specifically). Replanted one in the bell yard (60,131 / 60,127): a stone on a chain the
   monks left set, same as Kingswood's fox and bird cages.
7. **PUSHABLE BLOCKS**: NOT built. There is no pushable-block mechanic anywhere in the engine today
   (checked: T.CRATE is breakable, not pushable; no push-physics code exists). Building one is a real
   engine feature, not a level-content fold-in, and outside a level-design lane's budget - see
   QUESTIONS.
8. **The washed-out palette**: a small warmth fix, not a rework - `dirt`/`dirtL`/`dirtD` and `canopy`
   nudged out of grey toward the sky's own warm stop; `haze` and the sky's high-noon stop nudged the
   same way. Still `'crag'` (shared with Scree/Highcrown/Sunspire), so nothing else moves.

Level id, `needs: 'hanging'`, and the boss (`abbot`, arena/mini unchanged) are untouched.

## Numbers, before -> after
- Goblin priests in the level: 6 -> 9 (gob-priest.mjs's own count).
- Loose masonry (`stal`): 12 -> 13.
- Prayer wheels: 2 -> 3.
- `L.crumbles`: 0 -> 1 failing section.
- Checkpoints: unchanged at 427 (checkpoints.mjs, whole game).

## A new pin check
`tools/monastery3-beats.mjs`, wired into `tools/check.mjs`'s list. Asserts each of the six beats above
by shape (entity coordinates, the crumble section, the wheel's pivot, the plate/cage pair, and that the
palette's dirt/canopy are no longer the old washed-out values). Proved red on master first: ran it
against a throwaway `git worktree` at `cd35d24` (never `git stash`), where it failed on the very first
assertion (no harpy on the drawbridge); removed the worktree after.

## Checks run (all green except one, see UNVERIFIED)
architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace, npc-removal (every
REQUIRED CHECK) - all ok. Plus every check naming spire/monastery
(`grep -ln -i 'spire\|monaster' tools/*.mjs`): belfry, checkpoints, dressing, false-abbot-art*,
floaters, fodder-tuning*, geomancer-pilots*, gob-priest, headless*, lab-reach, pacing*, popclutter*,
quality*, redress-shots, redress2, small-adds, monastery3-beats (own). (*: these six are not actually
registered names in `tools/check.mjs` - they only matched the grep because their source text mentions
"spire"/"monastery" in passing; nothing to run.) architecture, belfry, checkpoints, dangling-paths,
dressing, floaters, gob-priest, lab-reach, npc-removal, redress-shots, redress2, skins, slopes-trace,
boss-fight-end, monastery3-beats: all ok.

`gob-priest` failed once, genuinely, on my own change: the drawbridge's new priest (42,117) had its
one candidate ally (the fledgling) just outside the rite's 60px vertical reach. Fixed by moving the
fledgling from (34,113) to (36,114) - now within reach; re-ran green (9 priests, each with a flock).

## UNVERIFIED: small-adds (not in the REQUIRED list; caught by the spire/monaster grep)
`small-adds` fails on this branch: `spire/abbot knight: missed 3 of 6 swings at small foes` (>33%).
Diagnosed, not papered over:
- Ran the identical check against an unmodified `origin/master` throwaway worktree (`cd35d24`): it
  passes clean (worst row 25%, spire/abbot/knight itself: 5 swings, 0 missed). So this is caused by
  something in this branch, not a pre-existing flake - I did not assume "under load" and stop there.
- Traced the mechanism: the Abbot's own congregation add (`src/main.js` ~14784, `summon: () => {...
  Math.random() < 0.4 ? 'archer' : 'sprig' ...}`) rolls plain `Math.random()` to pick which small ally
  he calls up. `tools/small-adds.mjs`/`src/lab.js` seed `Math.random` once per row, at level LOAD, and
  never re-seed before the fight - so the exact archer/sprig draws the Abbot makes later depend on
  every `Math.random()` call anything in the WHOLE 96x222 level makes during the load-time settle
  (`BK.sim(10)`, before non-boss enemies are culled for the fight). Any change to the level's enemy
  count or layout - mine or any other lane's - shifts how many of those draws happen before the fight,
  which shifts the Abbot's later sprig/archer rolls, which shifts this row's small-foe sample and its
  miss rate. `boss-fight-end` (45/45, spire included) confirms the Abbot fight itself still ends
  correctly; this is a sampling artifact of the test's seeding, not a break in the fight, the arena, or
  the bot.
- I did not chase a fix by trial-and-error removing content to dodge one seed: the coupling is to
  total level population, so any future lane touching this level (or one of the other three levels
  small-adds tests) can flip it again regardless of what I do here. A real fix belongs in
  `src/lab.js`/`tools/small-adds.mjs` (re-seed immediately before the fight, not at load) or in the
  Abbot's own `summon()` (its own small seeded roll, independent of the shared stream) - flagged as a
  background task rather than done here, since it touches shared test/boss code outside this lane's
  level-design brief.

## QUESTIONS FOR DANIEL

1. **Pushable blocks.** No such mechanic exists in the engine (T.CRATE only breaks). Building one
   (push detection, a movable-block prop, collision against plates/gaps) is real engine work, not a
   level fold-in. **Recommendation:** built as its own small engineering task, then Monastery (or
   whichever level fits best) gets the first one - rather than a level lane inventing ad hoc pushable-
   block code under a "keep it cheap" budget. Left undone here; the pressure-plate half is done.
2. **small-adds' seeding.** Confirmed fragile to any change in this level's population (see above).
   **Recommendation:** a small, separate fix - re-seed `Math.random` right before `runbossLab`'s fight
   loop starts (after the non-boss cull), not at `BK.load`. I did not make this change myself: it is
   shared test code every lane's suite run depends on, outside my brief, and worth its own review
   rather than a one-line patch buried in a level-content commit.
3. **The exam's "belfry door" routing.** The audit's plan 4 describes incense and a bellows carrying
   you "past the wheel, to the belfry door." I built a small incense assist (rise ~3 rows) right at the
   wheel rather than re-routing the crawl's main stair through it, because the crawl's headroom there
   is only 3 rows before the Nest's own floor slab (masonry, load-bearing for the arena above) -
   rebuilding that would risk the boss room's own architecture. **Recommendation:** conservative
   version (built) stands; a fuller re-route is a separate, larger pass if Daniel wants it.

## Follow-up: Q2 (small-adds' seeding), fixed - batch38

Question 2 above is now built, per the coordinator's follow-up (it was already on Daniel's approved
backlog, and batch38 needed it green tonight).

**Change (`src/lab.js`, `runbossLab`):** `Math.random` is now reseeded a second time, on the identical
`seedOf(lvId + '|' + h + '|' + healthMode + ...)` string, immediately before the fight loop starts (the
`for (; f < maxF ...)` loop) - after the non-boss-enemy cull, the teleport into the arena/mini room, and
its settle sim. The seed BEFORE `BK.load` still stands (so a level's load and its walk into the arena
replay identically on a retry); this second reseed means the recorded FIGHT no longer inherits however
many `Math.random()` calls the rest of the level's now-culled enemies happened to make first. Minimal:
one line, same seed formula, no new state, nothing touched in any check's thresholds.

**Why this was right, not a workaround:** the Abbot's own congregation `summon()` in `src/main.js`
(~14784) rolls plain `Math.random() < 0.4 ? 'archer' : 'sprig'`. Before this fix, that roll's exact
result depended on the total count of `Math.random()` calls made by EVERY enemy anywhere in the level
during the pre-fight settle - so any lane's unrelated level-content change could flip which small ally
the Abbot calls up, and therefore this row's small-foe sample, with nothing about the fight, the boss,
or the level's difficulty having changed. This wasn't specific to spire/abbot: any boss whose kit rolls
`Math.random()` (a summon, a random side, a random target) was exposed to the same coupling.

**Numbers, before -> after (this branch, with the Monastery content from the section above):**
- `small-adds`: FAIL -> PASS. `spire/abbot knight` was 6 swings/3 missed (50%, over the 33% limit);
  after the reseed, the whole suite ran 20 rows/84 swings/5 missed (6% overall, worst judged row 20%).
  I did not chase the exact new spire/abbot/knight numbers in isolation - the full-suite pass is what
  the check asserts, and re-running only that one row would reseed it into a different opts.salt-free
  context than the suite gives it.
- `boss-fight-end`: 45/45 fights still end on their boss's death, unmoved (it was never broken - the
  Abbot fight always ended correctly; only which small ally showed up changed).
- `mother-pilot`, `boss-openings`, `normal-health`, `herald-pirate`, `boss-navigation`, `lab-reach`: all
  still pass. These assert RANGES (e.g. the Mother's refill-mode clear time, 90-150s) or reconciliation
  invariants (health ledgers), not single pinned numbers, so I could not detect a sub-threshold shift in
  their exact frame-by-frame traces without instrumenting each one - nothing in their own assertions or
  printed summaries moved outside what was already passing. I did not weaken or loosen any of them to
  get there; every one that is green is green on its own existing assertions, unchanged.
- `architecture`, `checkpoints`, `skins`, `dangling-paths`, `slopes-trace`, `npc-removal`,
  `monastery3-beats`, `gob-priest`: unaffected (none of them run `bossLab`), all green.

One incidental fix alongside this: `dangling-paths` briefly failed because my own
`tools/monastery3-beats.mjs` header comment cited
`docs/level-design/wood-to-highcrown-design.md` - the design audit doc, which lives only on the
unmerged `origin/claude/designaudit` branch and is not a path this branch's fresh clone can open.
Reworded the comment to say so in prose instead of citing the path (matching how `docs/INTEGRATOR.md`
already handles the same audit-branch situation elsewhere in this repo) - not a threshold change, a
citation fix.

Background task filed for this in the earlier section (Q2) is superseded by this commit - built, not
just proposed.
