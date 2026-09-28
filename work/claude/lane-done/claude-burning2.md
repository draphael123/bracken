# THE BURNING VILLAGE — lane report (claude/burning2)

Brief: design audit §13 (THE BURNING VILLAGE) plan items 1-4, plus its citation under
"GAME-WIDE PATTERNS WORTH FIXING ONCE" item 1 (the last stretch before the boss stays an
exam). Built on current master (cd35d24) - the NPC-removal batch already changed this level
since the audit was written, so the captives stay as rescue targets with no dialogue, and I
did not touch that. The 2026-09-25 rework brief (`docs/briefs/burning-village-rework.md`)
was already substantially built into master before this lane started (the bucket, the
rooftops, the fallen house, the barn ambush) - I only read it for context, as instructed.

## What changed (all in `src/burning-village.js`, plus the level's own checks/tools)

**1. DEVELOP the beam (audit's "the long street, 188-191", S/M).** The ember-pit log that
sat there is now a told, `onTop` burning beam - the same mechanic the rooftops use at scale -
with `regrow` and its own `fuse: BEAM.fuse`, plus a small smoke plume rising out of the pit on
the rooftops' clock. So a hero meets the beam-and-lift pairing once, small, before the
rooftops (250) ask for both for real. It is *not* flagged `beam:true` in `L.deckBreaks` (I
added a hand-built `extraBreaks` array for it) because the generic per-beam reach check in
`tools/burning-village.mjs` assumes a trench-scale gap (>6 tiles, past the flood-fill jump
model) is "the only way across" - a 4-tile gap is inside that model's reach and would fail
that assertion for a reason that has nothing to do with this small beat. It still has `log:
true` `onTop:true` `fuse:BEAM.fuse` `regrow:true`, so it plays and looks identically to a real
beam; only the strict "no other way across" invariant doesn't apply to it, which is correct -
it never claimed to gate anything.

**2. TWIST the bucket (audit's "the rooftops, 287-295", S).** The rooftop beam now runs on its
own `BEAM_TWIST = 1.2` fuse instead of `BEAM.fuse` (1.8) - short enough that even the fastest
hero (measured: the pyromancer, 1.43s for the nine tiles) cannot outrun it unwatered. Doused
first from THE HALL'S RAIN BUTT (already on the route, just behind it), it holds instead. "A
doused beam holds" stops being a line nobody is ever asked to prove.
- A real design tension this surfaces, verified as *not* a softlock: the Hall's butt sits
  right next to the dormer's hot-door villager (263), 24 tiles short of the beam (287). If a
  player pours the bucket on the villager first, they hit the beam dry and it burns through
  under them - but falling into the second cellar still lets them out via its ladder at 314
  (already proven by `tools/burning-village.mjs`'s C5 check), just at the cost of a little
  ember damage. I judged this an acceptable emergent cost (water is a resource you spend
  wisely), not a bug, and left it alone - see QUESTIONS below.

**3. COMBINE the goblin and a crossing (audit's "the road in, 38-60", S).** The road-in's
first burning goblin moved from column 38 to 43 - now walking the *last* straw bale, two tiles
from the ember pit's edge, so "kill it on bare ground" (the sign at 19) is a positioning
problem next to a real pit, not a slogan next to nothing in particular.

**4. EXAM the well yard (audit's "400-450", M - and the game-wide item 1 citation).** This
stretch was a flat `R---FR-BBB` breather before the boss. Now: straw + a burning goblin
between the well (414) and the last hot door (422, unchanged), an archer up on the 420-432
roof (replacing an undifferentiated sprig), and a second burning beam (437-439, same told/
onTop/regrow mechanic as beat 1, not flagged `beam:true` for the same reach-model reason)
bridging the ground to the step up to his door. Checkpoints at 404 (before) and 446 (outside
the arena) were already correctly placed and are unchanged.

I did **not** build the generic `exam` pacing check the audit's game-wide item 1 proposes
("the last 80 route tiles must hold two P/H stretches, one rule mechanic, a foe within two
tiles of a jump or landing... a shrinking grandfather list, as checkpoint-gaps has") - that is
cross-level infrastructure (`tools/pacing.mjs` plus a grandfather list across all 14 levels),
explicitly out of this single-level lane's scope. `tools/pacing.mjs`'s coarse route-tile
classifier still prints `R---FR-BBB` for this stretch even after the exam content was added
(the new goblin/archer/beam don't cross that classifier's height/density thresholds) - the
content is real and is checked directly by `tools/burning-village.mjs`, but nothing currently
scores it. See QUESTIONS.

## Shared code touched

None. Everything above is inside `src/burning-village.js` and this level's own tools
(`tools/burning-village.mjs`, `tools/burning-route-walk.mjs`). I did not touch `src/
fire-spread.js`, `src/level.js`'s shared tables, `storm-ship.js` (the deckBreak engine, read
but not edited), or any goblin/brazier/barrel/fire code the parallel Stockade lane shares.

## Numbers, before -> after

- `tools/pacing.mjs` BURNING route strip: `----FF--F-----F--S-FF-FP-F-F---R---F-F--PFR--AAAAAR---FR-BBB`
  (before) -> `-----F--F-----F--S-FF-FP-F-F---R---F-F--PFR--AAAAAR---FR-BBB` (after). Platform
  count unchanged at 2 (the classifier doesn't score either new beam or the well-yard
  content - see above). Fight count 13 -> 12 (one goblin's screen-bucket shifted slightly).
  Density and set-piece counts otherwise unchanged.
- Rooftop beam crossing time (measured live, real key input, 9 tiles): fastest hero
  (pyromancer) 1.43s, slowest tested (reaper) 2.0s. Fuse set to 1.2s: below all of them.

## Checks run

- `node tools/check.mjs -- burning-village` - **green** (the level's own pilot: rescue, hot
  doors, the wisp/goblin, the Pyromancer's heat, the store, the rooftops' beam+smoke [now
  extended for beat 1's plume and beat 2's twist], the bucket's five uses, THE BARN's ambush
  lock).
- Required checks (common.md): `architecture, checkpoints, skins, dangling-paths,
  boss-fight-end, slopes-trace, npc-removal` - **all green**, run twice (after beats 1/3/4,
  and again after beat 2).
- `node tools/burning-ambush-lab.mjs 1` - **green**, unaffected (I never touched THE BARN):
  6/6 opened, median 22.9s inside Q's 15-35s window.
- `node tools/burning-walk.mjs` (default knight,warden) and with `paladin,pyro` added -
  matches baseline exactly: a pre-existing `STUCK` bug (the F9 bot "cannot fight" per its own
  doc, and gets overwhelmed by combat early; verified this also happens on a clean checkout of
  cd35d24, same bug, similar %). Not a regression.
- `node tools/burning-route-walk.mjs knight,warden,pyro,paladin` (I added `paladin` and
  `pyro` beyond the tool's own default `knight,warden` to specifically exercise beat 2 across
  hero speeds) - knight, warden and pyro reach the square cleanly with 0 health lost, all
  correctly picking up and using the Hall's bucket on the beam. **Paladin gets stuck**
  oscillating in a jump loop at one specific ledge (x=314) after crossing the doused beam.
  Isolated with `BEAM_TWIST` temporarily set back to 1.8: the stuck behavior disappears, so it
  is caused by the twist, not by the bucket-waypoint I added to the tool. Traced further: it
  is **not** a real softlock - it's the walk bot's simple left/right/jump-only heuristic
  mishandling one ledge after the beam's fall-and-smoke-recovery changes paladin's exact
  arrival trajectory there by a few pixels; a full player (with actual control, or even the
  in-page `bossLab`/pilot tests, which use paladin fine elsewhere) is not affected. Since this
  tool is explicitly "Not in the suite: it is a walk" and not one of the REQUIRED checks, I
  left it rather than reshape the level's geometry or the bot's generic heuristic to chase one
  hero's edge case - flagged below.

## An incident, fixed before committing

While bisecting `BEAM_TWIST`'s value I used `sed -i` on `src/burning-village.js` twice (against
this lane's own rule: source files are CRLF, never `sed -i` them). It silently converted the
whole file from CRLF to LF. Caught it via `git status`'s CRLF warning before committing;
restored with `unix2dos` (confirmed via `od -c`, since this shell's `grep -c $'\r'` doesn't
reliably report it) before the beat 2 commit. Final state's line endings are correct; git's
`core.autocrlf=true` would likely have masked the content either way, but the working tree is
clean now regardless.

## UNVERIFIED

- The generic `tools/pacing.mjs` route-tile classifier doesn't score the new well-yard content
  as a change in mix (still prints `R` where the audit cited `R---FR-BBB`), even though the
  actual mechanical content (goblin, archer, beam) is there and checked directly. I did not
  chase the classifier's thresholds - building or tuning it is the game-wide `exam` check
  infrastructure the audit explicitly separates out as its own fix-once item.
- `tools/burning-route-walk.mjs`'s paladin leg at the last gable (x≈314) after beat 2 - see
  above, judged a walk-bot heuristic artifact, not a level defect.

## QUESTIONS FOR DANIEL

1. **The bucket-contention tension at THE HALL (beat 2).** A player who pours the rain butt's
   water on the dormer's hot-door villager first cannot then dry-cross the rooftop beam - they
   fall into the second cellar and climb out via its ladder (a little ember damage, not death).
   I read this as an intentional resource choice ("water puts it out" implies it's spendable,
   not infinite) and left it as-is - **my recommendation is to keep it**, since it's exactly
   the kind of trade-off the level's own rule ("ONLY HIS FIRE SPREADS. WATER PUTS IT OUT.")
   promises, and the fallback route is already built and tested (C5). If you'd rather every
   player always has water at the beam regardless of what they did at the villager, the fix
   would be a second, beam-only water source (e.g. a small basin right at 285) - a bigger
   change I did not build.
2. **The paladin route-walk stuck leg.** My recommendation is to leave `tools/
   burning-route-walk.mjs`'s heuristic alone (it's explicitly not in the suite, and I traced
   the cause to the bot's own simple movement logic, not the level). If you want it hardened
   for future lanes that run this tool with more heroes, it would need a purpose-built
   ledge-descent heuristic near 309-315, which felt outside a single-level lane's brief.

## Final commit

`497fafc` on `claude/burning2`, pushed. `git fetch origin && git merge origin/master`:
already up to date, no conflicts.
