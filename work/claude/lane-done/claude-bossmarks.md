# claude/bossmarks - told marks for the unmarked boss windups (Sonnet)

Base origin/claude/batch74 0c0b69aa. On inspection tells.mjs reported only the Scalder's two windups as unmarked; the
Wicker Queen, Straw King and Cistern Queen already had MARK rows for every blow (only the Straw King lacked ANSWER/HEIGHT).
The real gap was the Buried Dead's nova / throw / body slam (a module-file boss, no BY_HAND rows).

## Added
- BY_HAND: burieddead|novaTell '!!' (poison ring, hit unblockable), throwTell '!' (thrown body, hit blockable), bodyTell '!!' (slam, unblockable)
- ANSWER + HEIGHT: burieddead nova dodge/low, throw block/low, body dodge/low
- ANSWER + HEIGHT: strawking fork block, slam block, sweep jump, bale jump, lantern dodge, leap dodge (all low)
- Scalder pourTell '!!' / ladleTell '!': marks were already called but on the next source line, which tells.mjs cannot see; joined them onto the mode line in src/main.js (no behaviour change)
- MARK regenerated once with tools/tells.mjs --write (734 rows). QUIET list untouched.

## Checks (green)
tells (no unmarked left), answer-tags, untold-told, verb-matrix, boss-read, hint-shown.
Reds: none.
