# claude/sporewebs - Sporewood's pillars: the webbed cap comes back, off the real jump's arc

## What changed

Daniel: bring the webbed bounce-caps back at Sporewood's pillars, but somewhere the web doesn't block the route -
an optional side reward, or the web placed above the jump's arc, or a cap that isn't on the only way through.

The two floor caps among the pillars (373-398, found by their own sign "THE PILLARS...") are both on the only way
through - removing either one from the model (or webbing it at the wrong height) drops the checkpoint past them
out of the real-jump reach fill. Neither is optional, so the "side reward" and "a cap not on the only way through"
options were out. That left "above the jump's arc," which the numbers back up:

- `checkpoint-stand.mjs`'s real jump (`across: 5`, not the route model's 6) only fails to stand at the checkpoint
  past the pillars when the web spans row 12 down through row 14-18 (any span reaching that band, full 3 columns,
  on either cap). Rows 8-11 and rows 15-17 are both clear of it - tested by mutating a fresh `LEVELS.find(spore).build()`
  and re-running `floodReach(L, T, { rides: true, across: 5 })` for every row-span from 8 to 18.
- Rows 15-17 is the one that still means something in play: `GRAV = 1000`, a spring cap's normal launch
  (`vy -400`) apexes 80px = 5 tiles up (row 14 from a row-19 cap), a plunged one (`vy -560`) apexes ~157px ≈ 9.8
  tiles up (row ~9). A curtain at rows 15-17 catches either one within two tiles of leaving the cap - "cut it
  before it springs you" still reads true, it just doesn't gate at row 18 (touching the cap) like the first,
  reverted try did.
- Each pillar already trails a single-column curtain of its own (x385, x394, rows 12-17 - "curtains strung between
  the pillars," from the original drone-gauntlet build, untouched). The new web only fills in the rest of each
  cap's 3-column width at rows 15-17, so cutting a cap's web is one continuous curtain top to bottom, not two
  separate ones stacked.

`src/level.js`, the pillars' `-- 3. DEVELOP` block: `RS(383, 384, 15, 17, T.WEB); RS(395, 397, 15, 17, T.WEB);`
(x385 and x394 are already WEB). No entities added, no engine change - reuses `T.WEB` and the existing cut/burn
mechanic exactly as everywhere else in the level.

`tools/spore-exam.mjs` extended (per the brief) to pin this so it fails locally, not just in the batch suite:
- Finds the two floor caps dynamically (a run of 3+ `BOUNCER` tiles on the pit floor within the pillars' 40-column
  span, not a hardcoded column - the section drifts with every `grow()` upstream of it) and asserts a `WEB` run
  spans each cap's full width somewhere in the 12 rows above it.
- Asserts the real-jump fill (`across: 5`) still stands at both webbed caps' own columns.
- Asserts a checkpoint exists past the pillars and the same fill still reaches it (this is the exact assertion
  that would have caught the original bug - proved: reverting to `git show HEAD:src/level.js` while keeping the
  new test fails with "the floor cap at 383-385 has no web over it"; the reachability assertions below it would
  have failed the same way on the first, row-18 version, had this test existed then).

## Checks run

- `node tools/checkpoint-stand.mjs` - **ok**: 427 checkpoints, 44 levels, every one stood at with a real jump (5
  columns), 3 known model gaps listed, none new.
- `node tools/check.mjs -- architecture,checkpoints,skins,dangling-paths,boss-fight-end,slopes-trace,npc-removal,spore-exam,spore-caps,spore-loop,checkpoint-gaps`
  (the 7 REQUIRED CHECKS plus this level's own three, one combined run) - **all 12 ok**, 0 failed. Run twice
  (once as a sanity re-run), both green.
- `node tools/spore-exam.mjs` alone - **ok**, and proved to fail on the pre-edit level (temporarily swapped in
  `git show HEAD:src/level.js`, re-ran, got `AssertionError: the floor cap at 383-385 has no web over it`, then
  restored the edited file) - the new assertion is real, not vacuous.

## UNVERIFIED

- `npm run check` with no arguments (the full suite) was not run, per the lane rules.
- No bot-pilot capture: this is a level-geometry change (tile placement only, no new entities, no boss touched),
  so the lane rules' bot-pilot requirement ("only for a boss that changed") doesn't apply.
- Not verified in the live game with Chrome/a screenshot - the reachability model (the same one `checkpoint-stand.mjs`
  gates every checkpoint in the game on) and the spring-height arithmetic above are the evidence; a visual check
  would need a Chrome session and was skipped to keep this lane's run short (the PC runs 2 other lanes).

## QUESTIONS FOR DANIEL

1. The pillars' curtain now drapes each cap at rows 15-17 instead of row 18. It still stops a normal spring
   (apex row 14) about two tiles off the cap, and a plunged one (apex ~row 9) well short of its peak - so cutting
   it still matters for getting real height off either cap, just not for the flat crossing itself (which was
   always the floor-level jump the model needed, not the vertical spring). Recommend: keep it - this is the only
   height band that both reads as "the web caps the spring" and doesn't sit in the real jump's arc. The
   alternative the brief also named - moving the whole feature off the pillars entirely, to an optional side
   reward elsewhere in the level - would avoid the pillars' fragility altogether but drops "at the pillars," which
   is where Daniel and sporewood2 both wanted it; built the pillars version since the numbers hold up.
2. Nothing else about the pillars changed - same lurker (387,19), same swing (added by sporewood2's own backlog
   item, untouched), same top caps. Recommend: leave it there; the section was already dense before this lane.
