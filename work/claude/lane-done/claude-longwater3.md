LONGWATER3 DONE 11-07 READY (code-only greybox behind LW3_SHIPS / ?lw3=1; browser walk, lab bot, n=6 tune, art pass owed - art before live)

# claude/longwater3 - THE LONG WATER 3: SALTREACH "THE TIDE DECIDES WHERE THE FLOOR IS." + THE TIDE-POOL CRAB + THE TIDE HERALD 2 (OPUS greybox, code-only)

Branch `claude/longwater3` off `claude/waterkit` e08836df8. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-longwater3`. Pushed. NOT merged, NOT deployed.
Sources: scratch/plan-water-1105.md item 1 + s2/s3a/s4 (the plan won), scratch/brief-longwater3-1015.md. No browser opened, no page tool run.
Full report: scratch/lane-reports/longwater3.md (the same text plus the tip sha).

## Flag
`src/longwater3.js` `LW3_SHIPS = false`. OFF: the 'longwater' row builds master's Long Water exactly (tools/longwater3.mjs: build hash 67cda4d5033f = the base's, in a child process).
ON (`?lw3=1&level=longwater`, `globalThis.BRACKEN_LW3`, `LW3=1` for Node tools): the SAME road slot ('longwater', needs 'crown') builds LONG WATER 3 - master's cols 0-365 cell for cell
(Meltfalls, Linn, ferry run, the Bore Reach = the S3 raft arrival bank), SALTREACH rebuilt on the tide kit in cols 366-705 (W 570 -> 706). The level tables that name master's
Saltreach by column (AMBUSH, ELITES, CHECK_DROP, the dead-end STASH, TIDE_CRABS, STUCK, STUCK_SIGNS) read LW3 rows through a getter while the flag is on (`shadowLongwater`).

## Built
- src/longwater3.js (level + flag + table shadows + lintLongWater3), src/longwater3-hands.js (the kit wiring + binding), src/pool-crab.js (new foe, pure), src/tide-herald.js (boss, pure), tools/longwater3.mjs (91 ok).
- src/main.js 15 one-line hunks (one existing line prefixed: the Herald's take), src/level.js 3 lines, src/marks.js, src/threat.js, tools/level-quality.mjs, tools/check.mjs one line each.

## Checks (Node only)
node tools/longwater3.mjs 91 ok (+ --sim=6 toy duels: readers 4/4 won 87-102 s, greedy 0/2 (400 s timeout)); LW3=1 level-quality longwater CLEARS THE BAR (master misses mechanics + secrets);
gated level-quality both ways exit 0; tide-kit 2019 ok; flag ON and OFF ok: one-new-foe, goblin-lint, threat-holes, answer-tags, tells, blow-tags, comments, solid-islands, foe-glue, map-grammar,
checkpoints, checkpoint-gaps, checkpoint-stand, boss-checkpoint, elites, ambush-reach, longwater-river, deadends, anchor-lint (only master's 2 airBells listed), dangling-paths.
foe-footing red both ways on MASTER's river foes only (3 off / 2 on). NOT run: tools/check.mjs, every page tool (longwater-walk, herald-pirate, mark-integrity, level1-pilot, mash-bot, boss-rates).

## Owed
Browser walk + per-hero routes, lab hook + boss-rates n=6 WITH flasks (60-70%), mash/pilot re-stamp, Mage's Folly reviewer, art pass (own tile kit) + music picks. Questions: see the scratch report.
