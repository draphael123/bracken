# HIGHLINES-KIT lane report (claude/highlines-kit, 11-05) - THE LINE KIT for THE HIGH LINES
Branch `claude/highlines-kit` off master 929cc4786 (BATCH146). Code tip 9622a0874 (+ this report commit). POST-DEMO, CODE-ONLY: nothing wired
into main.js, no live level touched, src/zipline.js untouched. NOT merged, NOT deployed. No browser, no Chrome started, no PIDs left.

## What changed (all new files except one check.mjs line)
- `work/claude/highlines-kit-plan.md` (57 lines): the design plan (line types, rider, wind, co-op, respawn, foe hooks, questions).
- `src/line-kit.js` (pure, 433 lines): WINCH up-lines (grip = every blow while hanging is a 40 px crank stroke, ratchet never slides back;
  post = strike the station post, the line runs 2.4 s for every seat), FREE + fast GLIDE down-lines (BACK = brake), POINTS junctions (UP = branch),
  SNAP lines (1.0 s told creak), THE GONDOLA set piece (snap -> the cab falls and hooks onto a lower line -> docks with everyone aboard),
  COUNTERWEIGHT pairs (hopper stone 9 > any party; or ride weight A down to send cage B up), SIDE lines to secrets, CUTTABLE lines, told WIND
  sections + lee rocks (tail x1.35 / head x0.6 on free/glide, rider SWAY, air carry), foe hooks (lineCut, foeRide, ridersOn, leadPoint, riderHit),
  lineRespawn, lintLines (22 rules), greybox drawLines/drawRider, landingsFromTiles. Feel numbers copied from zipline (hang 12, reach 24/4, kick -240).
- `src/linekit-lab.js`: data-only lab room (on no level list): foothold winch over nets -> junction + secret glide -> wind gorge glide between lee
  rocks -> counterweight hopper lift -> gondola snap set piece -> cuttable exam winch -> cave-mouth exit. 3 checkpoints.
- `tools/line-kit.mjs`: node proof, 648 checks, ~55 s. `docs/linekit.md`: level API + main.js wiring sketch + what is owed.
- `tools/check.mjs`: one line, `take('line-kit')` -> tools/line-kit.mjs.

## Checks run (only these)
- `node tools/line-kit.mjs` -> **648 checks OK (55.7 s)**: every part (grip/post winch 1-4 seats, glide/brake, points per seat, kick line-to-line,
  snap tell, gondola 1-4 seats + jump-out mid-fall, counterweight 1-4 seats + co-op ride-down, wind tell/lee/tail/head/sway/air, Hookjack cut at 4 points
  drops a level, archer lead, guard/knock, respawn calm >= 3 s); every device home within 15 s unattended; THE SWEEP: all 9 heroes on master
  (HERO_MOVE_IDS) x 1-4 seats, ~110 states each - exit from all 3 checkpoints, 0 soft-locks, 0 stuck states, secret reached (+ negative tests: a
  missing hopper is seen, the graph read finds a closed loop); 372 drops (every hand line, every 16 px, calm + gust) all land; lint clean on the lab
  + 22 broken cases each caught + exam-wind opt-in.
- `node tools/dangling-paths.mjs` -> ok (12287 tracked files).
- NOT run: tools/check.mjs (full suite), any browser tool. Ad-block names checked: line-kit.js / linekit-lab.js / line-kit.mjs / linekit.md are clean.

## Design choices (built as rec)
- Kit lines are SEPARATE from L.zipLines (zipline.js serves 6 live levels; zero risk to them). The kit places a hanging seat itself (`P.lkHeld`).
- Strike to haul = ONE button: your attack while hanging on a grip winch is the stroke (so fighting a Hookjack and climbing share the key - tension).
- Points take on UP only; DOWN always drops. A stone always outweighs a full party (co-op safe). Gondola/snap/cut lines restring after 8 s.
- Wind never touches winch speed; lint forbids a winch inside a wind box unless the box says `exam: true` (Daniel's band 8: winch + wind + Hookjacks).
- Checkpoints must stand on a landing and out of the wind (lint). lineRespawn only on a party wipe/reload; the existing LEASH handles a fallen seat.

## Questions for Daniel (rec first; the kit builds the rec)
1. HAUL KEY: REC any blow while hanging = a crank stroke (one button, ranged heroes too). ALT: UP = crank, attack stays attack.
2. JUNCTIONS: REC hold UP to take the branch, DOWN always means drop. ALT: UP/DOWN pick up/down branches (DOWN no longer always drops).
3. COUNTERWEIGHT STONE: REC weighs 9 (any party rides up). ALT: party size + 0.5 (a 4-seat party needs two stones - a co-op puzzle).
4. GONDOLA: REC a new cab is home 8 s after the last one empties (replayable). ALT: once per checkpoint.
5. EXAM WIND: REC only boxes marked `exam` may stack wind on winches (the rider sways, a stroke is still a stroke). ALT: gusts also stall winches in the exam.

## Owed
- **Browser (greybox lane):** wire per docs/linekit.md; prove per hero IN THE PAGE that the line swing / tap C / stroke start while hanging
  (main.js gating while `P.cling` is unproven - zipclimb-plan.md 2c); moving floors as one-way platforms; camera look-up on winches.
- **Heroes:** master has 9 (HERO_MOVE_IDS); Rimebinder / Demon Hunter / Desert Priest are not on master - the sweep picks them up from that list.
- **Art (art before live):** winch drum + crank grip/pawl, post + lever, points board, glide trolley, snap fray/whip, gondola cab (iron + canvas, no
  generic wood), cage + weight + hopper + stone, lee rock, gust streaks/sway, cargo nets; SFX: ratchet, clunk, clack, creak, snap, cab catch, hopper.
- **Next lane:** the HIGH LINES greybox + Hookjack (opus), using this kit; amend zipclimb-plan.md to the 11-05 15:27 order/variety (week of 11-09).
