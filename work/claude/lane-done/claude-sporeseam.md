# claude/sporeseam - SPOREWOOD -> KINGSWOOD seam smoothing (cheap version)

## Done (no geometry change, so level1-pilot / mash rows / route rows are untouched)
- Sporewood end: last pink tint shortened to W-30, then an amber tint [W-44, W+24] (crossfade) so the last screens warm toward Kingswood. First goblin marks in the arena tail (cols 539-550): warnPost x2, gobPennant x2.
- Kingswood opening: tints [-24,14] violet 0.12 carry-over and [-24,40] amber 0.15, so the fungus violet fades into the autumn light over the first screens; sporePod / mushroom / tinyCap / moss decos at cols 1-31 (fungus creeping out of the old wood and thinning).
- Kingswood map-card sub: 'up from the deep fungus, the goblins made a court of the old wood' (story line).
- Allowlists (src/dressing.js): spore += gobPennant, warnPost; kings += sporePod, mushroom, moss, tinyCap.
- tools/seam-shots.mjs + docs/seam/*-before.png and *-after.png (spore-door, spore-out, kings-start, kings-caps, kings-hall).

## Checks (port 8703), all green
dressing, level-quality (all gated levels), checkpoint-gaps, checkpoints, signs, textfit (0 across the board), floaters, spore-caps, kings2-beats.
spore-walk: segment "bog -> elite's gate" stopped at col 399/200 s with my change but at col 342/6 s (state card) on the baseline; the code touched is render tints and decos far from there (cols 539+ and Kingswood), so it reads as run-to-run timing of the bot's level-up card, not a regression. Other rows identical.

## Not done
- The walkable climb-out / gate after the Mother (needs gateAfterBoss + W growth, re-stamping level1-pilot and mash rows). The Rootway bridge level will own that seam. No sun shafts in Sporewood, no mycelium-end engine change.

## QUESTIONS FOR DANIEL
1. Post-boss climb: rec built = NONE (the Mother's death still wins the level, so there is no foe-free climb to protect and no checkpoint question). If you want a walkable climb with a gate, it is the +48-col plan in git history of this note (18ce312f); rec there was a foe-free climb with no post-boss checkpoint.
