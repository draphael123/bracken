# claude/dustscorp - the Underwell's dust scorpion, its twist tied to the rule (2026-10-06 night)

Base: master 85e13368. Small, local edits.

## What changed
The dust scorpion kept its grit claw (blinds 2.2 s) and gained a rule twist: ITS DUST CLOUD SMOTHERS LIT OIL. The brood will not cross fire, so it stops at the
edge of your firebreak; its cloud (CAST.smotherR 30 px) then chokes burning oil beside it, one cell per CAST.smotherEvery 0.45 s, only cells that have burned
CAST.smotherAge 0.7 s (so a spreading fire front still passes it - the Great Lamp set piece is unchanged). A smothered cell is spent (seeps back after OIL.back 25 s).
The decision: a thin or short fire in front of a dust scorpion is eaten from behind and it walks on; a deep gutter outlasts it; or kill it first, or light behind it.
Told: hint line ITS DUST SMOTHERS THE FIRE (src/hint-lines.js), bestiary card text (src/main.js). Drawn: a haze of grit about every dust scorpion, thick for
half a second after it chokes a cell, plus a grit burst and hiss on the cell.
Files: src/underwell-hands.js (CAST, update loop, drawWorld, n.smothered), src/hint-lines.js, src/main.js (card text only), tools/underwell.mjs (new page check + told/drawn check), docs/concepts/the-underwell.md.

## Checks (PORT 8647)
GREEN: underwell (page + static, incl. new "a DUST SCORPION cloud SMOTHERS the fire" and "twist is told and drawn"), underwell-aloft, level-quality underwell (clears the bar),
mash-gate, comments, homepaths, hint-shown. Mash rows not re-stamped (difficulty effectively unchanged; mash-gate green).
RED, NOT MINE: tells (updateScalder pourTell wants !!) - same on the base sha.
First draft smothered cells at once and broke the Great Lamp brood-burn check (the front was cut); fixed by the 0.7 s age gate, no test weakened.

## QUESTIONS FOR DANIEL
- Is "eaten from behind, deep gutters outlast it" the right strength? Rec: keep (built); raise smotherEvery to 0.7 if it feels punishing in the oil works.
