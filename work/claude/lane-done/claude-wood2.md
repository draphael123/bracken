# claude/wood2 — BRACKEN WOOD, design-audit beats

Brief: the design audit's BRACKEN WOOD section (plan items 1-4) plus game-wide pattern 1 ("the last stretch
before the boss is a rest, not an exam") as it applies to this level, built on current master (post
NPC-removal, post combat-pass/throwables/push-blocks). First level: kept gentle and teaching-first. The
push-block demo (wasp pit, cols 104-109) is untouched. The Hornet Queen's arena headroom (kings2's fix,
`updateQueen` hover heights) is untouched — kept, not redone.

Design audit source (unmerged, cited as such — `git show origin/claude/designaudit:docs/level-design/
wood-to-highcrown-design.md`, not a path this branch can cite from a fresh clone; `dangling-paths` forgives
this the way it forgives every other lane's citation of that branch).

## What changed (src/level.js, brackenWood())

All three coordinates below are the level's BUILT (final) columns, after every `grow()` splice — not the
raw numbers written in the function's own source (which are pre-shift; see the comments left in place).

1. **DEVELOP the badger** (plan item 1). A third badger — after the taught one (217) and the sett's one
   (235), previously the last — now stands on the tarn's far bank (451,14), right where the existing felled
   pine (435,14, len 14) lands. It charges back along that one-tile log toward whoever is crossing it; a hit
   throws the player the way the badger is running (`P.vx = e.face * 190`), i.e. back over the water. Miss
   the jump (or the block) and it's a swim and a walk back, not a harder hit than anything else in the
   level. No new mechanic, no new terrain — the log and the pool it bridges already existed (the wasp-pogo
   alternative is untouched).
2. **COMBINE thorns and a jump that can fail** (plan item 2). A thorn on each lip of the hollow's existing
   3-tile stream (408,14 face 1 and 412,14 face -1, around the pool at 409-411) — the same stream the level
   already asks you to cross, now flanked so the "A HELD JUMP IS HIGHER THAN A TAPPED ONE" sign at 392
   finally has a crossing that punishes a tapped jump (`JUMPV*0.72` peaks well short of the far bank) instead
   of only ever being background flavor text. A miss is a swim, same cost as item 1 — gentle, not punishing,
   for the first level.
3. **TWIST the felled pine** (plan item 3). A second dead pine at the Hornet Queen's west wall (519,6, len
   10, dir 1) — inside the vine walls (wallL 517) but short of the fight's own trigger (522), so it can be
   felled any time, not just mid-fight. Four strokes (already taught at the tarn, item 1's log) lay it
   across the near comb (522-524) as a third perch near the Queen's own height (row 3-6), extending the
   level's own machine into the fight it built toward. Scoped down from the audit's "lies across the two
   combs": I built a perch reaching past the near comb only (10 tiles, not a full 27-tile span to the far
   comb at 545) to avoid turning the whole arena ceiling into one continuous plank — see QUESTIONS.
4. **EXAM** (plan item 4): kept as built. The helm pit (four shieldbearers on posts over spikes, cols
   485-495) already combines pogo, shields, spikes and a fall — the audit calls it the one level in scope
   that passes S3 as built, and nothing here changes it.

## Game-wide pattern 1 (last stretch is a rest, not an exam)

No change needed for this level specifically — the audit's own text says "Only Bracken Wood's helm pit and
the Monastery's crawl really examine the level," i.e. Wood already passes before this lane's changes. The
new west-wall pine (item 3) adds one more set-piece token to the last stretch anyway (see pacing numbers
below). The audit's proposed FIX — a generic `exam` check in `pacing.mjs`/`checkpoint-gaps`-style, run
against every level's last 80 route tiles — is cross-level infrastructure spanning all 14 levels, not a
Wood-only fix; see QUESTIONS (same call kings2 made for the same pattern).

## A new check (tools/wood2-beats.mjs)

Pins all three beats by their BUILT (final) coordinates: the tarn badger (position, facing, and that the
pool and the felled pine it depends on are still there), the stream's two flanking thorns (position, facing,
that the pool between them and the "held jump" sign upstream both still exist), and the west-wall pine
(position, length, direction, that it sits inside the wall but before the trigger, and that it doesn't touch
row 3 — `queen-comb`'s own ceiling-footing check). Proved **red** on old `claude/kings2` HEAD (`7065bf7`,
this branch's own base, via a throwaway `git worktree`, never `git stash`) before trusting it green here.
Added to `tools/check.mjs`'s list.

## Numbers, before → after (tools/pacing.mjs wood)

- Route tail: `...-RF-F---R-XFRFP--F--RBBB` → `...-RF-F-R-XFFFP--F--XBBB` — the last stretch before the
  Queen now reads `XBBB` (set-piece into the fight) instead of `RBBB` (a rest right before her), from the
  new west-wall pine.
- Mix: fight 7→9, platform 5→5, set-piece 9→10, rest 11→9, light 36→35 (the new badger and thorns add two
  fights' worth of stakes to what used to be pure light-quiet route; no foe count went up without a placed
  reason — the badger and the two thorns are all DESIGNED beats, not filler).
- `checkpoint-gaps`: 13/13 checkpoints on the route both before and after, worst gap still 64 route tiles
  (well under the 150 limit) — none of the new content is far enough from an existing checkpoint to widen a
  gap.
- `answer-tags`: wood already asked 3 answers before this lane (`block dodge ---- duck`) and still does
  after — the badger's told charge is answered `block` (already in `src/marks.js`'s ANSWER table), so no
  marks.js change was needed.

## Checks run

Named checks only, per the lane rules (never the full suite):

- `syntax`, `architecture`, `checkpoints`, `skins`, `dangling-paths`, `boss-fight-end`, `slopes-trace`,
  `npc-removal` (the 7 REQUIRED CHECKS) — **green**.
- `queen-comb`, `push-blocks`, `checkpoint-stand`, `checkpoint-gaps`, `answer-tags`, `attack-tokens` (the
  level's own / directly relevant checks) — **green**.
- `wood2-beats` (new, pins this lane's three beats) — **green**, and proved red on old code first.
- `spawns`, `floaters`, `killzones`, `collectables`, `deadends`, `elites` (general safety net for the new
  entities/terrain) — **green**.
- `signs`: 1 failure, but it's `kings @355` (a 3-line sign in Kingswood, from `claude/kings2`), unrelated to
  this lane's changes (which touch only `brackenWood()`). Not fixed here — out of scope for this branch, and
  the sign in question predates this lane's own HEAD.
- Re-ran the full named subset again after merging `origin/claude/batch39` (fast-forward — no new commits on
  batch39 since this branch's own base, so the merge only replayed the parent history; one unrelated 1-line
  diff in `src/main.js` came in through the merge commit itself). All green after the merge too.

## UNVERIFIED

- No bot pilot / live playtest of the tarn badger's knockback (`P.vx = e.face * 190`) actually landing the
  player back in the water rather than on the far bank — read from `updateBadger`'s own code
  (`src/main.js`), not observed in a running browser. This is a foe-placement change on the first level, not
  a boss, so per the lane rules' COST RULES (bot pilots are for a changed boss only) I did not spin up a
  pilot run for it. If the knockback distance turns out too short/long in practice, the fix is a placement
  nudge (`G0.ent('badger', 257, 14, ...)`, a few tiles either way), not a mechanic change.
- Same caveat for the two new thorns at the stream: read from the jump-height code (`JUMPV*0.72` vs full
  `JUMPV`), not observed live.

## QUESTIONS FOR DANIEL

1. **The west-wall pine's span** (item 3, TWIST): the audit says it "lies across the two combs" (a ~27-tile
   span end to end, 522 to 547). I built a shorter one (10 tiles, reaching just past the near comb at
   522-524) to avoid turning the whole arena ceiling into one continuous plank, which felt like it could
   flatten the fight's up/down rhythm between the two combs. **Recommend**: keep the shorter span — it's the
   conservative option and still gives the "third perch" the audit asked for; if you want the full-width
   version, it's a one-line `len` change (10 → ~26) plus re-checking `queen-comb`'s row-3 ceiling-footing
   assertion still holds (the plank stays at row 6, well clear of row 3, either way).
2. **Game-wide pattern 1's generic `exam` check**: same call kings2 made — this is cross-level
   infrastructure (a `pacing.mjs`-based check across all 14 levels with a shrinking grandfather list), not a
   Wood-only fix, and Wood already passes it without one. **Recommend**: a dedicated small lane (or the
   integrator) builds it once every level's own EXAM beat has landed, so it can grandfather in the ones not
   done yet rather than fail the whole batch.
