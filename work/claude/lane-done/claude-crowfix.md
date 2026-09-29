# claude/crowfix - the crow's untold hit

## Cause
The storm crow (updateCrow, src/main.js) told ONCE, with a red !! when it woke 330 px out, then flew straight at the hero. Foes run at about 0.6 of
screen time here, so a crow woken from far away reached the hero three to five seconds after its caw. A hero who stood and waited (the
tools/untold-told hero does) was hurt by a crow that had said nothing for over three seconds. tools/untold-told is right: the last caw was
more than three seconds before the hit. It was intermittent only because the crow's arrival time straddles the 3 s line (sine height decides
which frame the boxes first touch): the probe showed first hits at 3.7 s, 3.95 s, or none.
No hit path skipped a tell (a hang in diveTell cannot hurt: bodyAttacking ignores *Tell modes); the tell just went stale.

## Fix (src/main.js, updateCrow only; marks/answer tables untouched)
A crow closing on the hero (within 100 px, moving toward him) whose caw is 0.5 s or more behind it hangs on the wind and caws again, once
(red !!, same diveTell mode, 0.4 s), then comes on. A crow that woke within 140 px does not double-caw. Same mark, same 'crow|diveTell' row.

## Numbers
- untold-told BEFORE (master 5e8a219, detached worktree): 5 fails of 6 (plus 1 of 3 in this worktree earlier); all the crow line.
- untold-told AFTER: 0 fails of 8.
- Probe (6 crows, same setup): before, hits 3.70-4.60 s after spawn with the last caw about 0.9 s; after, the re-caw at ~2.5 s, first hit at 4.38 s
  (about 1.4 s after a caw). Forced bad branch = the probe itself (the late arrival is deterministic in the hero-still setup; no random branch).

## Checks green
untold-told x8, tells, answer-tags, attack-tokens, stockade-horns, architecture, checkpoints, skins, dangling-paths, boss-fight-end,
slopes-trace, npc-removal.

## UNVERIFIED
No human playtest of the second caw's feel. I accidentally started one full `check.mjs` (no names) for a few minutes and stopped it via its
task; the release suite's own run was untouched.

## QUESTIONS FOR DANIEL
1. The second caw makes every crow pause 0.4 s (screen time) about 100 px before you. Recommendation: keep (it is the shield-duck cue right when
   it matters). Alternative: no pause, only the red !! flashing on the fly - not built, since a hit needs a told windup mode.
