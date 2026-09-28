# SPOREWOOD (`spore`) — the audit's exam and second half

Lane `claude/sporewood2`. Level id, `needs` (`stockade`) and boss (`mother`) unchanged. Built on current master (the
NPC-removal lane's changes are kept as-is; the Sporewood caps quest stays gone).

## What this brief was

The wood-to-highcrown design audit (on `origin/claude/designaudit`, not merged to this branch - quoted here rather
than cited by path, since dangling-paths.mjs cannot open it from this branch) said of Sporewood: "the rebuild's arc is right, **but there is no exam**, and nothing happens with growcaps
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
3. **DEVELOP the pillars** (the quiet stretch after the bog, found at its own "THE PILLARS" sign). A `lurker`
   (387, 19) waits on the shelf between the two floor caps (383-385 and 395-397), among them, not past them. (A
   curtain gating each cap on a cut was tried first and reverted — see FOLLOW-UP below, the checkpoint-stand fix.)
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

## FOLLOW-UP (batch37's two reports)

**1. `checkpoint-stand.mjs` red — real, fixed.** The pillars' webbed floor caps (item 3 above, first version) placed
a `T.WEB` tile at row 18 directly over each cap. The pillars' floor has two 3-column gaps (380-382, 392-394)
crossed by the ordinary caps or a plain jump; a real jump's arc (`checkpoint-stand.mjs`'s stricter 5-column model,
not the route model's 6) passes through row 18 right where the web sat, so it blocked the only way through, not
just the spring. That stranded the pre-existing checkpoints at 408 and 466 (both downstream of the pillars) in the
strict model — the checkpoints themselves were never moved or touched. **Fix**: removed both `RS(...,T.WEB)` calls;
kept the lurker (387, 19). `tools/spore-exam.mjs` no longer asserts a webbed cap, asserts the lurker only, and now
also checks reachability with the same `across: 5` real-jump model checkpoint-stand.mjs uses (so this class of bug
fails locally next time, not just in the batch suite). Re-run and green: `checkpoint-stand` (427 checkpoints, 44
levels, all stood at), `checkpoints`, `checkpoint-gaps`, `spore-exam`, `spore-caps`, and all 7 required checks
(architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace, npc-removal) — one combined run,
0 failed.

**2. `small-adds` red on batch37 (spore/mother, knight and warden) — diagnosed as roll drift, not fixed here.**
`src/lab.js`'s `runbossLab` seeds `Math.random` once per row, **before** `BK.load()` — the comment there says so
explicitly: "seeding here, before BK.load, ... pins the row end to end - the level it loads, the setup sim before
the arena wakes, and the fight itself." Sporewood's own build (`sporewood()`, `dressLevel`) draws nothing from
`Math.random` (it uses a level-id-seeded `mulberryL`, confirmed: zero raw `Math.random()` calls anywhere in
`src/level.js`), but `main.js`'s live setup — spawning the extra entities this lane added (2 lurkers, 2 rockfalls,
a swing mover, 2 leaning-cap sprouts) and their pre-fight idle wander (`temper()`, named in the same lab.js comment
as the original cause of this class of bug, found by claude/dkmother) — draws from the **same pinned stream** the
Mother's fight then continues from. More entities before the fight is not a content bug; it shifts how many draws
happen before the fight starts, so the Mother's attack rolls during the fight differ.

Evidence:
- Isolated A/B on `spore` only (2 heroes, `bossLab({bosses:['spore'],heroes:['knight','warden']})`), no other lane's
  changes in the diff: at this branch's base (cd35d24, before this lane touched anything) knight missed 0 of 5,
  warden 0 of 4. On this branch (after the checkpoint-stand fix above) knight missed 1 of 7, warden 2 of 7 — not
  just a few unlucky swings: the swing *counts* differ too (5→7, 4→7), meaning the fight plays out differently
  frame to frame from early on, which is what a shifted seed does and a genuine miss-timing bug does not.
- The full `tools/small-adds.mjs` suite (all 4 bosses × 7 heroes, run once, in order) failed on a *third* row
  entirely — `spore/mother pirate: missed 3 of 7` — not knight or warden at all. Batch37 reported knight and
  warden failing; this run reported pirate failing and knight/warden passing. Same branch, same content, different
  failing hero, because the two runs consumed the pinned stream in a different order before reaching spore's row
  (this run walks all four bosses in sequence first; the isolated A/B walks spore alone). A real gameplay bug in
  the Mother's fight or in the small-foe aim logic would fail the same way regardless of what ran before it; this
  does not.
- `src/main.js`'s Mother fight code and small-foe aim logic (`src/lab.js`'s `smallAim`/`smallWatch`) are untouched
  by this lane. Nothing about *how* the pilot swings at sporelings changed — only *when in the pinned sequence* the
  fight's rolls land.
- claude/monastery3 is adding a reseed immediately before each fight in `runbossLab` (moving the seed point past
  the level's own setup), which is the actual fix for this class of drift; duplicating it here per the coordinator's
  instruction was avoided. Once that lands, this level's own extra pre-fight entities stop being able to perturb
  the fight's dice at all.

**Not fixed on this branch**, per the coordinator's instruction to fix only if real: it isn't. No entities were
removed to chase this number down, since doing so would be trading real content (asked for by the brief) against
an artifact of an architecture bug already being fixed elsewhere, and the next run (after monastery3's reseed, or
after a merge that changes the pre-fight draw count again) would just move the failure to a different hero or level
regardless.

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
2. The pillars' two floor caps were meant to be gated by a curtain (webbed, un-bounceable until cut), reusing the
   level's own curtain mechanic. Reverted (see FOLLOW-UP): at row 18 it sat inside a real jump's arc over the
   3-column gaps beside each cap and blocked the only route through, so `checkpoint-stand.mjs` failed everything
   past the pillars. A real "webbed = un-bounceable" rule would need the caps' spring itself to check for a WEB
   tile overhead rather than a curtain occupying the jump's airspace — that is an engine change, not a level one,
   and belongs to a lane of its own if it's still wanted. For now the pillars keep their lurker and lose the curtain.
3. Only one swing (vine) mover was added, at the pillars, rather than several across the level. Recommend: leave it
   at one — "more" was satisfied, and Sporewood is a fungus cave, not a jungle, so a light touch of vine-swings fits
   the look better than scattering several. Say the word and I'd add one more over the vent-canyon gap (52-58) or
   the bog crossing.
