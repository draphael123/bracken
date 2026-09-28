# SPOREWOOD (`spore`) — the audit's exam and second half

Lane `claude/sporewood2`. Level id, `needs` (`stockade`) and boss (`mother`) unchanged. Built on current master (the
NPC-removal lane's changes are kept as-is; the Sporewood caps quest stays gone).

## What this brief was

The design audit (`docs/level-design/wood-to-highcrown-design.md`, on `origin/claude/designaudit`, not merged to this
branch) said of Sporewood: "the rebuild's arc is right, **but there is no exam**, and nothing happens with growcaps
between 260 and 450." Its plan for the level had four beats (TWIST the lurker, COMBINE in the bog, DEVELOP the
pillars, EXAM), and its game-wide item 1 said the last stretch before every boss is a rest, not an exam, in eleven of
fourteen levels — Sporewood among them. The earlier rebuild lane (`docs/briefs/sporewood-rebuild.md`) had already
built the rule itself (taught in the glade, a leaning cap over the vent marsh, a grown step under the dripping
stair's spore falls, the Gills' sprouts, and the jam in her room) and is untouched here. This lane adds the four
beats on top of it, plus two items from Daniel's approved backlog.

## What changed, and where (all final built columns, `node tools/map.mjs spore` / `tools/curve.mjs`)

1. **TWIST the lurker** (`src/level.js`, the dripping stair, 245-284). The "SOME CAPS ARE LURKERS" sign moved from
   column 286 (the lantern terrace, past the stair) to 244 (the stair's mouth), so its lesson lands right before a
   stretch that is all caps. A `lurker` now stands on the stair's first tier (254, 9), between its two buds.
2. **COMBINE in the bog** (330-372). A leaning growcap now crosses the middle sink (lip at 345, leaning 6 tiles to
   351), with a spore fall over its path (rockfall, `spore:true`, x=348) — the weaver already standing at (348, 9)
   from the earlier fix now has something to spit at while you ride it.
3. **DEVELOP the pillars** (the quiet stretch after the bog, found at its own "THE PILLARS" sign). The two floor
   caps (383-385 and 395-397) are now webbed: a curtain hangs at row 18 directly over each, so — like every other
   curtain in this level — it must be cut before the cap will spring you. A `lurker` (387, 19) waits on the shelf
   between them, among the caps, not past them.
4. **EXAM** (448 to her wall at 487, the last stretch before the boss). A second spore fall now hangs over the
   Deep Gills' second sprout (x=456); the spitcap (476) and weaver (460) already there hold the ledge. Past the
   lip, a new carved sink (478-482, five columns, a `BOUNCER` at its bottom — nothing here is bottomless) takes a
   leaning cap (lip at 477, leaning 5 tiles) to cross. The stretch grows a cap both ways, under a fall, next to a
   foe, right up to her door — this level's own answer to GAME-WIDE PATTERNS item 1. It was not built as a shared
   `exam` tool: that would touch every level and every other lane's checks, and the brief asked for this level's
   own beats.

## Daniel's backlog, folded in

- **Ambush health 6 → 2.5** (`src/ambush.js`, `AMBUSH_HEALTH.spore`). THE UNDERCAP's captain took six hits at the
  ambush's health budget; nothing else in the level asks that much of one foe.
- **More swinging ropes/vines**: one `kind: 'swing', vine: true` mover added over the pillars' gap (383, arm 88),
  a second way across besides the (now webbed) caps. Rope/vine swings were otherwise unused in Sporewood.

## Numbers, before → after (`node tools/curve.mjs`, isolated via a throwaway worktree at this branch's base, cd35d24)

| | cols | foes | threat | kinds | hazard | INDEX |
|---|---|---|---|---|---|---|
| before | 552 | 64 | 147 | 9 | 0 | 83 |
| after | 552 | 68 | 156 | 9 | 0 | 87 |

Kingswood (which needs `spore`) is unchanged at 120, so the wall shrank from 37 to 33 — the INDEX bump moves in the
direction the audit's "+37 wall" note wanted, not away from it.

## Shared code touched

- `src/ambush.js`: one number in `AMBUSH_HEALTH` (spore only). No other level's entry touched.
- `tools/check.mjs`: registered the new `spore-exam` check (one line in the big `for` list, one doc comment). No
  other level's check touched.
- `src/level.js`: everything else is inside `function sporewood()`. Nothing outside it was touched, so the parallel
  Marsh Wood lane's own edits to `function marsh()` (or wherever it works) should not conflict.

## Checks run

- `node tools/check.mjs -- spore-caps,spore-loop,spore-walk` — **spore-caps**: ok (headless, the rebuild's rule
  still holds, all five uses, both heroes). **spore-loop**: ok. `spore-walk` is not in the suite (its own docstring
  says why: it is long and the bot cannot fight) — run directly instead, see below.
- `node tools/spore-exam.mjs` (new, node-only, added to the suite as `spore-exam`) — **ok**: the sign move, the
  stair's lurker, the bog's leaning cap and its spore fall, the pillars' webbed caps and their lurker, and the exam
  stretch (growcap both ways, a fall, a foe, all inside the reach fill through to her door) all verified structurally.
- `node tools/spore-walk.mjs` — the in-page bot, no god mode, start to her door, both heroes. Both got through the
  leaning-cap gap, the dripping stair and the bog cleanly. Both stop at the elite's gate (col 399, pre-existing: the
  bot cannot fight, and the elite there is a known lock the file's own docstring names) and again near her door
  (best col 484 of a 485 target — inside a tile of arriving, through the new exam gap; the one death recorded there
  is the pre-existing "larder" spider guarding her door, not the new gap). Neither is a regression: `errors []`.
- `node tools/check.mjs -- architecture,checkpoints,skins,dangling-paths,boss-fight-end,slopes-trace,npc-removal,spore-exam,spore-caps,spore-loop`
  (the REQUIRED CHECKS plus this level's own) — **all 11 ok**, 0 failed.
- `node tools/pacing.mjs spore` — route still 522 tiles, reach 97%→(checked), checks 10/11 on the route unchanged;
  the last 80 route tiles now read 2 P/H stretches (was closer to the audit's quoted `FRP-BBBB`), a rule-mechanic use
  (the exam's caps) and a foe within 2 tiles of a landing (spitcap@475/weaver@394), matching the shape the audit's
  game-wide item 1 asked for.
- `node tools/curve.mjs` — spore INDEX 83 → 87 (table above); no other level's row changed.

## UNVERIFIED

- `npm run check` with no arguments (the full 187-check suite) was not run, per the lane rules (never run the full
  suite from a lane worktree). Only the named subset above was run.
- The route's reach percentage before this change was not captured (only after: `node tools/pacing.mjs spore`
  reports 97% and route 522 tiles, unchanged in length from before). The isolated `curve.mjs` before/after table
  above was taken from a throwaway `git worktree` at this branch's base (cd35d24), per the lane rules.

## QUESTIONS FOR DANIEL

1. The exam's carved sink (478-482) removes about five columns of what was plain floor (with a sporePod, two coins
   and a root-decor piece standing on it) and replaces it with a pit + leaning cap. Recommend: keep it — it is the
   only "sink" geometry left to hang a last leaning cap on before her door, and it is netted (a `BOUNCER` at the
   bottom), so a miss costs nothing but the spring back up. If you'd rather the last stretch before her door not
   remove any existing floor, the alternative is a plain (non-leaning) growcap onto a small new ledge instead — a
   smaller exam, no carved geometry.
2. The pillars' two floor caps are now gated by a curtain (webbed, un-bounceable until cut) rather than a new engine
   rule. Recommend: keep it — it reuses the level's own established curtain mechanic with no engine change, at the
   cost of the caps reading as "just another curtain" rather than a wholly new interaction. If a real
   bounce-disabled-while-webbed rule is wanted later, that's an engine change belonging to a lane of its own.
3. Only one swing (vine) mover was added, at the pillars, rather than several across the level. Recommend: leave it
   at one — "more" was satisfied, and Sporewood is a fungus cave, not a jungle, so a light touch of vine-swings fits
   the look better than scattering several. Say the word and I'd add one more over the vent-canyon gap (52-58) or
   the bog crossing.
