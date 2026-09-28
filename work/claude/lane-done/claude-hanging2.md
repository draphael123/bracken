# Lane report: claude/hanging2 (THE HANGING VILLAGE, the design-audit section + the pre-boss exam pattern)

Branch `claude/hanging2`, on top of master (cd35d24). The level keeps its id `hanging`, its `needs: 'scree'` and its boss
(the Owl Reeve / the Weaver). Nothing about either boss's AI is touched here - THE WEAVER's approved changes belong to a
boss lane, not this one, and are listed as a question below.

## What this reads from

- The design audit's HANGING VILLAGE section (`docs/level-design/wood-to-highcrown-design.md`, written against a build
  before batch34's NPC removal) plus its game-wide pattern 1: "the last stretch before the boss is a rest, not an exam."
- The level as it stands on current master today: the `claude/hanging` rework (seven floors, four hoists, the Reeve's
  rope, the Weaver's larder) is already built and merged. The audit's GAP - "the rope-cutter never cuts a rope" - no
  longer exists in its old form (there was no cutter left in the level at all after the rework), but the level's own
  garrison list still asks for two `cutter`s and one ambush wave puts a third, none with a bridge to cut - see the
  questions below.
- Daniel's approved backlog for this level: FAILING STONE reused as floors that give, and more swinging ropes between
  tiers (the existing `swing` mover).

## What changed

**THE EXAM (game-wide pattern 1) and TWIST the cutter (design audit §7 Plan 1), combined.** The lantern stair (row 37,
tier 5) was already the level's busiest tier, but the run from its last checkpoint up to the crown (`5 -> crown: the
long rope`, an 18-row ladder shaft, cols 3-4) was bare: no foe, no mechanic, nothing but a climb - exactly the pattern
the audit's item 1 names. It sits directly against the boss's own checkpoint, so it is the level's actual "last stretch."

- A twelve-tile rope bridge (cols 64-75, row 37/38) now crosses the open stretch a spider already drops onto, with a
  cutter (a `sprig` with `cutter: true`, the proven pattern from Kingswood's toll bridge) posted at its near end who
  saws through the rope once a hero is out over its middle. The bridge is wide enough that a normal walking pace
  actually spends the ~1s inside the game's own cut zone (`src/main.js`, `br.cutT`) that the rope needs to go - a
  narrower one would let a "cutter" sit there forever and never cut anything, which is the exact GAP this is fixing.
- Falling through the cut span is not a dead end (B4): it drops square onto the upper boughs' own floor below, with no
  spikes in it. No vine was added under it on purpose - one straight back up to the same floor a fall already lands on
  would just be a second, shorter way past that floor's own content (the squirrel knight, the nest hoist), which
  is not what B4 asks for and is not something this brief asked for either. (Tried first with a vine: it shortened the
  level's main route from 539 to 475 route tiles and tripped the F9 bot on a stuck-heuristic at the bridge - both went
  away the moment the vine came back out. See UNVERIFIED.)
- A spider now hangs over the final rope-ladder shaft (col 7, row 29) so the climb itself is not silent either.
- A new check, `tools/hanging-exam.mjs`, pins all of this: the bridge exists and is wide enough to ever cut, a cutter
  stands in the game's own 60px range of it, it sits between the stair's two checkpoints, a fall from it is not fatal,
  there are at least two failing-stone sections and none of them carries a load a hero needs, and a foe stands on the
  final climb. It fails on unmodified master (proved via a throwaway `git worktree` of `origin/master`) because none of
  this exists there.

**FAILING STONE, reused (Daniel's backlog).** `src/tower-collapse.js`'s rule (`L.crumbles`) is generic - any level can
use it, and `src/main.js` already steps and draws it for whichever level supplies it; nothing else had to be wired up.
Two existing platforms now give after a couple of seconds' weight and come back four seconds later: one on the windy
bough (tier 3, cols 40-42) and one on the market (tier 2, cols 78-80). Both are plain hop platforms with only a coin
near them - neither carries a load, relic or anything else that would be stranded or lost when the stone falls (the
new check asserts this for any crumbling section this level ever gets).

**More swinging ropes (Daniel's backlog).** Two new `swing` movers, purely additive (nothing existing was removed, so
no route or reach-model check that depended on the old crossing changes):
- Tier 3, over the west sliding-bough gap (cols 36-40): an alternate to the mover, not only a ride.
- Tier 5, over the sliding-bough gap at cols 14-18, right at the exam's tail, alongside the existing mover.

## Numbers, before/after

- `tools/pacing.mjs hanging`: route length **unchanged at 539 tiles**, 9/9 checkpoints on the route, worst gap still 85.
  The ten pacing stretches immediately before the boss's own checkpoint went from `S---HR---S` (mostly rest and light)
  to `XF-HSFPP--` - a set-piece (the new bridge) and platforming/fight stretches, not a silent run in.
- `tools/hanging-exam.mjs` (new): `bridge 64-75 cut by a sprig at 77 (1.31s in the cut zone at a walk); 2 failing-stone
  floors; a foe on the crown climb; pacing window before the boss: XF-HSFPP--R`.
- `tools/hanging-hoist.mjs`: unchanged, green - 4 hoists, every well still on the far side of its deck, the Reeve's cut
  still told/fair/once.
- `tools/hanging-hoist-walk.mjs` (real page, real keys, no god mode), knight and warden: all 32 steps ok, both heroes.
- `tools/hanging-walk.mjs` (F9 bot, knight): 1 bug, 2 odd, 6 notes - the SAME bug (one BLANK sweep frame) and the SAME
  odd (a snuffer RUNTIMEFLOAT at 32,66) as an unmodified-master run of the same tool, both pre-existing and not
  introduced here. See UNVERIFIED for the one number that moved (walked%).

## Checks (green)

- **This lane's own:** `hanging-exam` (new - proved red on `origin/master` first), `hanging-hoist`.
- **REQUIRED (common.md):** architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace, npc-removal.
- **Level checks named in the brief:** `hanging-hoist-walk` (knight + warden, real page), `hanging-walk` (F9 bot,
  knight, real page).
- **Broader level-specific sweep** (not strictly required, run because this lane changed the level's geometry):
  checkpoint-gaps, deadends, collectables, spawns, floaters, traps, audit, dressing, readability, runtime-footing,
  owl-lamps, levelling-runtime, one-new-foe, threat-holes, elites, ambush-single, additional-areas,
  additional-areas-runtime, map-grammar, signs, pixels, killzones, content-audit - all green (24/24 in that run).

## UNVERIFIED

- `tools/hanging-walk.mjs` (the F9 bot) reached 77% of the level's width on this build against 92% on an unmodified-
  master run of the same tool, with no new BUG/ODD finding (same 1 bug + 2 odd as baseline). The bot cannot fight
  (RULES M) and this tool is explicitly "not in the suite... proves nothing crashes, floats or strands - not that the
  level is completable." My read: the stationary cutter at the bridge's near post is something the bot cannot get past
  without killing it, where a real player just fights through (the same as any of Kingswood's toll-bridge cutters). Not
  re-run for the warden hero (cost).
- `tools/hanging-walk.mjs` warden was not run (knight only, per the brief's cost rules); `hanging-hoist-walk.mjs` was
  run for both heroes and is green for both.

## QUESTIONS FOR DANIEL

1. **The garrison and one ambush wave still place a `cutter` with nothing to cut** (`GARRISON.hanging: [['cutter', 2]]`
   in `src/level.js`, plus one more in the "THE CLIFF HALL" ambush at row 65). This is the exact bug the design audit
   named ("Cutters with no rope... the Hanging Village x2"), just reintroduced in a new form after the NPC-removal
   rework rebuilt the level. It is not fatal - a cutter with no bridge in reach just acts as a slow-approaching goblin,
   per `updateCutter`'s own fallback - but it is not what it looks like either. **I left it alone**: fixing it for real
   is the game-wide pattern 2 fix ("a foe placed without the thing its behaviour needs"), which is a different,
   unassigned item, and touching the garrison list or the ambush wave risked scope creep into another lane's check
   surface (`ambush-single`, `one-new-foe`). Recommend either dropping `cutter` from `GARRISON.hanging` (swap its two
   slots for `rockgoblin`, already in the set) and giving the ambush's cutter a short bridge of its own, or folding it
   into whichever lane does the game-wide pattern-2 fix.
2. **The Weaver's arena.** Her AI is unchanged, as the brief asked. Daniel's approved changes for her belong to a boss
   lane; if that lane wants her arena reshaped, the current room is 38 tiles wide (A7), her larder's reason (the
   hoists' missing loads) is unchanged, and nothing here touched her nets, her shelves or her web bridge.
3. **The F9 bot's walked% dropped (92% -> 77%) with no new bug flagged** - see UNVERIFIED above. If it turns out to be
   more than the bot's inability to fight a stationary foe, the conservative fallback is to move the cutter a few tiles
   further from the bridge's mid zone so the bot's own path-finding does not have to path around him at all; I did not
   do this by default because it would also make the twist easier to walk past.
4. **INDEX** (`tools/curve.mjs`): not run this lane (out of scope; the brief did not ask for it and this lane adds
   content rather than removing it, so a rise if any is expected, not a concern).

Final commit: PLACEHOLDER-SHA (filled in at push time).
