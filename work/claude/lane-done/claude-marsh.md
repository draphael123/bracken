# Lane report: claude/marsh (MARSH WOOD level design pass)

Branch `claude/marsh`, started from and merged with `origin/master` at cd35d24 (master had not moved by the time I
finished, so there was nothing to merge). Everything is pushed. I did not touch master, did not deploy, and did not
run the full suite (`npm run check` with no names) - only named checks, listed below.

The brief was "## 2. MARSH WOOD" of the design audit (`docs/level-design/wood-to-highcrown-design.md`, read at
`origin/claude/designaudit`) plus its "GAME-WIDE PATTERNS WORTH FIXING ONCE" item 1 (the last stretch before a boss
must be an exam), built against **current master**, not the audit's own pre-rework state. The level keeps its id
(`marsh`), its `needs: 'wood'`, and its boss (`frog`).

## Starting state (why some of the audit was already done)

Before I touched anything, I read the built level (`src/level.js`, `marshWood()`, plus the always-applied `REVIEW`
pass at the bottom of the file) rather than assume the audit's column numbers still matched. A previous pass had
already:
- broken up the audit's flagged "17-hop river, columns 226-306" into a varied big/small/bud pad crossing with told
  river eels, a pogo wasp, and raised board "stages" - the audit's plan item 1 ("Break up the river");
- removed the eel-traps quest (per the NPC-removal batch, already accounted for by the lane brief).

What was **not** done, and what this pass built:

## What changed

1. **TWIST THE RULE** (audit plan item 2). The grove raft crossing (raw cols 297-328, final 393-424) was a raft
   with frogs and nothing else - the ferry's pay-or-drain choice was made once, at the ferry, and never again. I
   added a floor under the channel (`block(297,328,22,27)`, matching the ferry's own recipe) and a second
   crank+sluice pair beside the existing raft crank, so you can now ride the raft dry under the two archers, or
   break the sluice and wade the drained channel - where a gar and an eel (`ifDrained: 297`) wait in the mud. This
   time the drained road is the harder one, as the audit asked.
2. **THE EXAM** (audit plan item 4; GAME-WIDE PATTERNS #1). The mud flats (raw 345-358, final 441-454) were an
   explicitly emptied "breath before the boss" - 56-ish quiet tiles with nothing in them, the exact pattern the
   audit's game-wide item 1 calls out across five levels (`-R.-BBB` in Marsh's case). I rebuilt them as the exam:
   two sinking pads over a new gar hole in biting water, a hopper on the landing reed, and (spilling into the first
   few columns of the Croaking Court, before its pond) a spitter in the reeds under a small patch of fog with its
   own wisp. The checkpoint at 344 (final 440) already sat right at the door - one column before the exam starts -
   so I left it there rather than move it; no checkpoint stands inside the exam (441-462).
3. **Took the REVIEW pads out of the shallows** (audit plan item 3). `REVIEW.marsh` (a post-hoc patch applied to
   every build, `src/level.js` ~7500) was laying lily pads across the wading shallows at cols 115-127 - review noise
   from before the shallows were redesigned to be hopper-only, undercutting "the wading lesson teaches wading". I
   removed those nine `pad`/`coin` pairs; the four pads it lays over the King's own shallow pond (465-474) are
   untouched, since those are a legitimate reward crossing, not the audit's complaint.
4. **More swinging ropes/vines** (Daniel's approved backlog item, folded in where it fit the audit's beats). Added
   two `kind:'swing', vine:true` movers over the river's widest pad gaps (raw cols ~212 and ~245), hung well above
   the pads (row 9, matching the game's existing vine-over-a-gap recipe used elsewhere) so grabbing one is a real
   jump, not a free ride. They are an alternate way across - the pads still carry the required route - and neither
   crosses a told eel or the pogo wasp.

Shared code: **none changed.** All edits are inside `marshWood()` and the `REVIEW.marsh` entry in `src/level.js`,
which is Marsh Wood's own level code; I did not touch `grow()`, the shared painter, or anything Sporewood's
`claude/sporewood2` lane would also be editing.

## New check

`tools/marsh-exam.mjs` (added to `tools/check.mjs`'s list). It fails if: the exam (last checkpoint short of the
arena to the arena's trigger) is under 12 columns, holds no checkpoint-free confirmation, or is missing a pad, a
gar, a spitter, a wisp with fog reaching it, or a foe near the pad landing; if the grove crank has no sluice beside
it, or the drained grove has no gar and no eel waiting; or if the REVIEW pass has put pads back over the wading
shallows (111-130).

```
marsh-exam  S3: the exam 440-462, 2 pad(s), 1 gar, 1 spitter, 1 wisp; TWIST: the grove sluice at 390 drains 393 to
row 21 (2 foe(s) wait for it); no review pads in the wading shallows (111-130).
```

## Checks run (all green)

`node tools/check.mjs architecture,checkpoints,skins,dangling-paths,boss-fight-end,slopes-trace,npc-removal,marsh-exam,signs,reed-island,floaters`

- **architecture** - 44 levels, 348 built pieces declared, everything built stands on something.
- **checkpoints** - 427 checkpoints, all on floor, none in rock, none in an arena/mini/ambush room.
- **skins** - all indoor stone claimed; forest kit names its own dress; roofs sit on their slabs.
- **dangling-paths** - 2367 tracked files, every cited repo path resolves (6 pre-existing known holes, none mine).
- **boss-fight-end** - all 45 boss/mini fights end when the boss dies (Marsh's frog king included, unchanged).
- **slopes-trace** - every frame of every level identical to the pre-slopes build (marsh's own trace unchanged too,
  so no `--rebase` was needed).
- **npc-removal** - no NPC with dialogue outside a shop; the ferryman stays as a mechanic, no dialogue.
- **marsh-exam** (new, this lane) - see above.
- **signs** - all 615 signs (including the four new ones I wrote) fit on two lines; no level repeats a sentence.
- **reed-island** - Marsh's existing ambush-room check (headless browser sim), untouched section, still passes.
- **floaters** - 2801 standing things checked, everything can be set down (the new pit/floor/pads didn't strand
  anything).

I also ran `tools/marsh-exam.mjs` and `tools/checkpoints.mjs` standalone after a late sign-text fix (see below) to
confirm the fix didn't regress anything, before the final combined run above.

## UNVERIFIED

- No bot pilot capture was run. The brief's changes are level-geometry and placement only - no boss AI, no new foe
  kind - so per the cost rules ("bot pilots only for a boss that changed") this wasn't in scope. The frog king boss
  itself is untouched.
- I did not play the level by hand in a browser; verification is the check suite above plus reading the built
  entity/pool/fog data directly (`node -e` dumps of `LEVELS.find(l=>l.id==='marsh').build()`), which is how I
  caught and fixed the grove sign running to four lines before the `signs` check ever ran red.
- The two new swing movers' exact grab height (row 9, arm 76px) follows an existing in-game recipe (a vine hung over
  a gap, used elsewhere for river/gorge crossings) but I did not hand-play them to confirm the grab feels right at
  the marsh's specific hop timing.

## QUESTIONS FOR DANIEL

1. **The exam's width.** I extended the exam from the old "mud flats" block into the first few columns of the
   Croaking Court (before its pond), because 345-358 alone (14 columns) wasn't wide enough to hold pads + gar +
   spitter + fog + a landing foe without cramming them on top of each other. The final exam is 22 columns raw
   (441-462 final). *Recommendation: keep it as built* - it still ends well before the pond and the arena trigger,
   and the check enforces it stays checkpoint-free.
2. **Grove twist's difficulty.** I made the drained road "the harder one" per the audit (a gar and an eel in tight
   mud, vs. a dry raft ride under archers you can already handle from the ferry). *Recommendation: keep it* - but
   if playtesting finds the eel+gar combo in a narrow drained channel too punishing next to the ferry's version,
   the fix is moving the eel further from the gar, not removing either.
3. **Swing placement.** I picked the two widest pad gaps (212, 245) for the new vine swings, purely as alternate
   routes. *Recommendation: keep as optional alt-routes* - if Daniel wants them load-bearing (i.e., part of the
   required path) instead, that's a bigger change I did not make, since removing pads to force the swing would
   touch the `marsh-exam`-adjacent river variety the previous lane already built.

Final commit: pushed to `origin/claude/marsh`.
