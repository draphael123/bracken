# ACT II TRANSITIONS - LANE A (claude/act2tr, off master d57c3475) - 11-04
Status: CODE-ONLY, node checks green, NO browser run (suite window) - browser checks OWED below. Not merged, not deployed.
Tip: the branch's last commit (`git log -1 claude/act2tr`; the report commit sits on top of the code commit). Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-act2tr.

## Rows built (src/transitions.js TABLE, after kings>scree; all dialogue-free, 4.5 s, arrive walk 1.3 s)
| # | row | kind | opening (tiles checked against the built levels) |
|---|-----|------|-----|
| 1 | scree > hanging | WALK-OUT, open kind `cairn` (BARE: Scree's arena has NO east wall, open ground to col 647) | two cairns rise at col 634, walk.to 640 |
| 2 | hanging > spire | open kind `rope` | col 109 (the village's real east wall), rows 14-19 |
| 3 | spire > moor | open kind `bell` (great doors) | col 95, rows 24-29. Built on TODAY's arena - MONASTERY 3 (11-16) re-points this one row + its test |
| 4 | moor > rookery | open kind `ledge` (BARE: summit lip has no wall) + `open.fill` | col 751 (last), rows 8-12; fill closes the 3-tile PIT at cols 739-741 (rows 13-15) so the walk has a floor |
| 5 | rookery > skyroad | open kind `crumble` | col 487 (real wall), rows 5-10 |
| 6 | skyroad > oreroad | GATE-END (L.gateAfterBoss, gate col 456): walk + fade, no open beat | none |
Brief deltas: the brief's old wall columns (343 etc.) are stale - rows use today's levels. Scree and Moor have no wall to open, so those two are BARE (light + cairns) not "wall opens".

## Code
- src/transitions.js: 6 rows; `BARE_KINDS` / `isBareKind` (light, cairn, ledge); `DUST` (per-kind dust colours).
- src/main.js (trnOpenWay + trnUpdate, 3 small edits): `open.fill` (bridges a pit: tiles AIR->SOLID, sprite copied from the floor tile beside), bare kinds throw light not rubble, no hop over a bare opening, per-kind dust. Nothing else; arena data untouched.
- src/transitions-art.js: GATE_PAL kinds `rope`, `bell`, `crumble` (recoloured pine rails - GREYBOX-PLUS) + a cairn sprite for the bare kinds. Real gate art = lane C.
- tools/demo-transitions.mjs (extended, not forked; already in tools/check.mjs): 214 checks (was ~113+), incl. an ACT II block: road chain DERIVED from `needs:` scree..longwater (fails loud on a road change), no row touches a spur / side path, per-row geometry replayed on the BUILT levels (gap is a real wall for walls / all air for bare, bottom = arena floor, east of wallR, pit fill valid, floor + clear air under the whole walk, ARRIVAL spot of the next level for 4 seats: solid, clear, no spike), art/dust kinds known. Browser section: loops all TABLE rows automatically; added the pit-bridged assertion, skips (scree/moor open, hanging/skyroad walk), 4-seat/3-seat/reduce rows.
- `ACT2_BUILT = ['A']` in that file: pairs of lanes not in it report "pending" (green); a lane adds its letter when it merges, then a missing row is RED.

## Checks run
node --check (main, transitions, transitions-art, demo-transitions): ok. `node tools/demo-transitions.mjs`: all 214 green. `node tools/transition-woodmarsh.mjs`: 31 green. No browser, no check.mjs.

## OWED (after 19:00, one browser at a time, >= 1500 MB free)
1. `node tools/demo-transitions.mjs --browser` (loops all 17 rows, ~20+ min): the 6 new rows play, clear credited+saved first, gap air after kill, moor pit bridged, arrival solid/clear/unhurt, skips, 3-4 seats, reduce, console clean. Add `--shots=<dir>` for pictures of the 5 gates.
2. EYES on: spire row (the hall's low dais, row 29 cols 79-91, and two small pillars at cols 87/91 sit on the walk line - heroes pass IN FRONT of them, not through a gap); moor (a 1-tile rock at cols 747-749 on the walk line); scree/moor cairn placement and camera hold; the 'bell' door look.
3. Confirm each boss kill actually reaches the standard winLevel+trnBegin path (ram, owl, abbot, windcaller, shriek sisters; ROC via the gate) - code reading says yes, unrun.

## Notes for lanes B / C
- Append rows IN ROAD ORDER under the "ACT II" comment in TABLE; add your letter to ACT2_BUILT in tools/demo-transitions.mjs; the ACT II block already lists your pairs (B: oreroad>minecart, minecart>storm [gate-end + S1], storm>undercrown [S2], undercrown>kitchengate, kitchengate>crown; C: crown>longwater [S3]).
- The static geometry check needs `arena.wallR`, a bottom row = arena floor, and (gate-end) a gate ent + L.gateAfterBoss; if your row is a scene/drop (arrive.drop) it will need an exemption in that loop (it asserts `!e.scene` only in the label, and the arrival replay assumes arrive.ferry=false walks in from the left).
- Hero y during the walk is FIXED at the kill floor (kinematic): pits/rocks on the walk line show, so use `open.fill` (pit) and check the walk line with the static block.
- New open kinds: add the colour set to GATE_PAL (+ DUST) or add to BARE_KINDS; the check fails if the art does not know the kind.
- Row 3 (spire) is the one Monastery 3 must re-point.
- Do not name new files ad/banner/track-like.

## Questions (recommended first)
Q1. Scree and Moor have no east wall, so cairns / a ledge stand in for a gate. REC: keep (no level-data change). Alt: add a real bank-wall column to Scree's and Moor's arenas so a wall can fall (level lane, riskier).
Q2. Spire>moor: ship now against today's arena (REC, as approved Q4). Alt: hold the row to 11-16.
