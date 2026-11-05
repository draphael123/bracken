# claude/waterkit — THE TIDE KIT + THE PULL FIELD (11-05, unattended, code-only)

Branch `claude/waterkit` off master 42a1d4cdb (rel144). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-waterkit`. NOT merged, NOT deployed.
Built from scratch/plan-water-1105.md section 3a/3b (the plan's shared systems).

## What changed
| file | what |
|---|---|
| `src/tide-kit.js` (new) | THE TIDE KIT: a declared tide runs `low -> warn (3 tolls) -> rise -> high -> turn (1 toll) -> fall`, eased; rate per act (tells never < 1.5 s); verbs BELL (calls it in through a short told warn), SLUICE (turns it back, holds it out `hold` s), LEVER (manual chamber fills/drains, mark survives death + reload); floods (tile boxes), floats (ride the surface in a range), lifts (driven by k), bites (live only at low/high), foe table (`low`/`high`/`swim`/`flee`/`drown`); `riders()` carries every seat on a float; `tideRespawn` = safe phase + grace; `gauge()` for the one A3 dial; `lintTide`. |
| `src/pull-field.js` (new) | THE PULL FIELD: `current`/`toward`/`away`/`whirl` in a box or ring; 5 strength curves; told pulse cycle (tell 15% nudge, on, off = release window); classes by core grip vs SWIM 96 (drift <= 48, strong <= 82, rip above); answers: swim against, hold a post (anchors only that seat), dash (15%, then 50% for 0.25 s), brace (50%), release window; heroes/foes (0.6)/heavy (half)/anchored/shots (bend velocity); water-only or air too; tide-driven flow sign; per-body carry (co-op safe); placeholder flow specks; `pullStill` + mark; `lintPulls`. |
| `src/waterkit-lab.js` (new) | THE TIDE BASIN (LAB): data-only test room using every feature (basin tide + vault chamber, pontoon, counterweight lift, crab flats, bell, sluice, drift / tide channel / whirl rip with post + window / air gust). Not on the road, not on any level list. |
| `tools/tide-kit.mjs`, `tools/pull-field.mjs` (new) | Node-only proofs (no page, no browser). |
| `tools/check.mjs` | two own lines (`tide-kit`, `pull-field`) after powder-monkey. |
| `docs/waterkit.md` (new) | the level API + a main.js wiring sketch. |

No main.js / level.js change: nothing in the game calls the kit yet.

## Checks run (Node only, one at a time)
- `node tools/tide-kit.mjs` — **2019 checks ok** (cycle order + tolls, monotone rise, rate floor, bell/sluice/lever, pools via poolLevel, float + 4 seats riding (not the one beside, not the dead), lift, bites, foe table, respawn from 7 moments, SOFT-LOCK SWEEP: 2 checkpoints x 9 heroes (own HERO_RUN) x 1-4 seats x 54 respawn moments, plus a negative case the sweep catches; lint clean on the lab + 8 broken cases caught; every LEVELS entry with `tides` (none yet)).
- `node tools/pull-field.mjs` — **76 checks ok** (classes, curves, drift/strong swum up by all 9 heroes, whirl in + round, rip not swum out of, post/dash/brace, told cycle, tell is a nudge, all 9 heroes out in the release window, weights, water-only vs gust, shots, 4-seat co-op, tide-driven channel, flow specks, still + mark, lint clean + 8 broken cases, every LEVELS entry with `pulls` (none yet)).
- `node tools/dangling-paths.mjs` ok; `node tools/comments.mjs` no swallowed code. NOT run: tools/check.mjs (per brief), any page tool.
- New filenames (tide-kit, pull-field, waterkit-lab, waterkit.md) checked: no ad/admiral/pixel/banner/track/promo words.

## Browser owed
- None opened. Owed: the first lane that wires it into main.js (docs/waterkit.md "Wiring") should hang the lab room on the dev level list and feel it: the tide tells read (bell x3, foam, dial), the pontoon carries P1+P2, the post grab key feels right, the rip is answerable for every hero, flow specks read on each palette.

## Art owed (placeholder now)
- The A3 water-line gauge dial (one drawing for all levels; `gauge()` feeds it). The foam line on `turn`/`warn`.
- Per-level props: tide bell, sluice wheel, chamber lever (Keep 2 verdigris; Whale = flesh skin), mooring post per kit (iron ring / coral / rib), pontoon (tarred hull plank or stone, NO loose logs), counterweight.
- Flow streak sprites per skin (sea current, siren-song notes, whale-breath gust, Kraken whirl), and the tell vs bite look. Today: 1-px specks (`flowParts`).

## Questions for Daniel (recommended answer first; I built the rec)
1. **Who wires it into main.js?** REC: the first sea lane that uses it (Keep 2 floodgates or LW3) wires it with the docs sketch and folds that level's old tide. Alt: a small wiring lane before THU 11-12.
2. **The post-grab key.** REC: hold UP (the climb key) in reach of a post. Alt: auto-grab on touch (less control, no input to learn).
3. **Co-op deaths.** REC: `tideRespawn` only on a party wipe / checkpoint reload; a single fallen seat revives at his partner into the tide as it is. Alt: every death resets it (easy to farm the low).
4. **Fold the old tides** (Saltreach streetTide, Causeway CT, Herald arenaTide, Tollmaster square, Keep whirlpools.js). REC: each when its level is next touched (LW3, Causeway 2, Keep 2), no separate refactor. Note: `src/whirlpools.js` keeps one sub-pixel remainder for all seats; the kit fixes that by design.
5. **Answer numbers** (tide tell >= 1.5 s, pull tell >= 1 s, release window >= 1 s, dash keeps 15%, brace 50%, rip > 82 px/s grip). REC: keep as the floors; tune lanes set per-level values above them.

## Final tip
Read `docs/waterkit.md` first, copy a block from `src/waterkit-lab.js`, and run `node tools/tide-kit.mjs` + `node tools/pull-field.mjs` (both pure Node, ~seconds): a level that declares `L.tides` / `L.pulls` is linted automatically.
