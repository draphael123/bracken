# GQUEEN3 BUILD lane report (claude/gqueen3) - THE GOBLIN QUEEN 3, Highcrown finale

Branch `claude/gqueen3` off master d57c3475, worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-gqueen3`. **Branch tip: ff7db409.** Not merged, not deployed. CODE ONLY: no headless browser was launched (clock 10:08-10:43; the gate owns the PC's RAM). Plan: `scratch/plan-goblinqueen3-1104.md`, every recommended answer built.

## Steps done vs plan (commit order, each commit leaves the game loading - syntax-checked; the page was NOT loaded, see OWED)
| # | Plan step | Commit | State |
|---|-----------|--------|-------|
| 1 | gqueen-hands.js skeleton, ctx wiring, gqHit parry helper, BK exports, tools/gqueen3.mjs RED on master | 93f28b0e | done. Red proof: `scratch/gqueen3-red-on-master.txt` (38 fails against the master checkout, `GQ_ROOT=` run) |
| 2 | P1 crown toss + stun + marks | 506a13d9 | done |
| 3 | P1 portal shards (2/3 portals, fan of 3, one stun a cast) + marks | c4ae09ea | done |
| 4 | remove pillars / plate bar / chandelier pins / roof phase, P1a/P1b, retire queen-court + queen-chandelier from check.mjs, signs / bestiary, marks regenerated | 7a629128 | done (see deviations: chandeliers kept as scenery) |
| 5 | flee: spare, FULL HEAL (hp, stamina, flasks), persist across death | 58f57784 | done |
| 6 | escape: layout, fire floor, collapses, roof throwers, shrine, her portal, portal step; drawn | 58f57784 + 4ff50456 | done |
| 7 | east island + tower-top arena (the plan's padEast is inlined in highcrown2.js) | 58f57784 | done |
| 8 | P2 AI: lash (high/low), portal ambush, rubble geyser, quake stomp, crown toss, shards < 60%, crown storm < 30%, hatch guards at 66% / 33% | 58314577 | done |
| 9 | lab.js: parryShot / parryAt for all 9 heroes, hunt, escape climb, tower-top reactions | c7cdbcbf | done, written blind (see OWED) |
| 10 | node checks green, report, lane-done copy | 17d3b71e, ff40eee5, ff7db409 | done |

## What changed (numbers are the plan's starting numbers; tune lane next week)
- NEW `src/gqueen-hands.js` (GQ3 constants): crown (cd 7 / 5.5 s, tell 0.8, out 230 to 210 px, back 260, dmg 16, parried -> home 340 -> STUNNED 3.5 s + 4%), portal shards (cd 8 / 6, tell 1.0, 2 / 3 portals, glow 0.9, fire 0.35 apart, fan 3 x +-14 deg, 210 px/s, dmg 10; parried -> home 320 -> STUNNED 2.2 s + 3%, one stun a cast, later returns clank 1%), stun guard 1.5 s (no stunlock), flee, escape, portal step, P2 (hp 1600). Crown / shards / storm live in their OWN arrays (never `seeds`).
- `gqHit()` = one yellow `damagePlayer` + a read of the shared parry counter (`RP.stats.parries`): all nine heroes' beat paths covered with no per-hero code; never unblockable / pierce.
- main.js: `EHP.gqueen` 3300 -> 2400; `gqOpen` = pinned || stunned || stage 'roof'; `updateGQueen` rewritten (P1a 100-50%, P1b < 50% with the bell ring, 3rd portal, cooldowns x0.8; `default:` delegates to the hands; `stage 'roof'` delegates to `GQH.roofStep`); the hurtEnemy0 gate loses the plate path; lethal P1 blow -> `GQH.spare`; `gqEscapeLay` / `gqTiles` (laid in arena.laid / arena.taken so resetCastle restores the hall); arena trigger held while she is gone (`GQH.hold`); BK.gqShots / gqStage / gqPortals / gqHands. Removed: drawQPillar, gqPillar*, gqChip, gqShatter, drawGqPlate, gqShards, the qpillar prop (spawn / update / draw), the chandelier pin, the storm gust, the old crown rain, the roof phase, the shadow step (now the P2 ambush).
- level: `L.gqEscape` (tiers, start, check, portal, hall portals, slates, throwers, route, supports) and `L.arenaRoof` (the sealed tower top, cols 612-660, floor row 20) in `src/highcrown2.js`; 56 stone columns added east; pillar sign text, roof rods and qpillars gone (`src/level.js`).
- marks: 7 hand-driven rows in BY_HAND + MARK/ANSWER/HEIGHT, QUIET `updateGQueen|fleeTell`, 6 dead rows removed, `node tools/tells.mjs --write` run.
- bot: `parryShot` / `parryAt` (shield heroes release C and raise in the last 0.06 s; deflect heroes tap at 0.08 s respecting BUSY_C; pyro taps the ward at EMBER_LEAD; pirate taps at 0.06 s; LABP.parryTry decides once per shot, else duck the crown / roll a shard), the hunt, `gqEscapeBot` over L.gqEscape.route, tower-top reactions (lash high: duck, low: jump, ambush: turn + parry, geyser: jump).

## Deviations from the plan (and why)
1. **Chandeliers stay as SCENERY weights** (`scenery: true`, `gq` flag kept) instead of being dropped, so crown-exam / crown-requests (which count four gq chandeliers hanging within a jump) and the art stay untouched. Nothing strikes or pins by them (`!pr.scenery` in the cut; the pin line is gone).
2. **Tier numbers changed** after floodReach with every hero's own legs: the hall's roof is only ~2 px above a standing hero on row 11, and a jump under it is impossible. T1 561-569 r17, T2 572-582 r15, T3 585-595 r13, T4 576-584 r11 (collapsing), T5 566-575 r11 (contiguous with T4, no jump gap), plus **T6 572-575 r9, the step inside the hole** (the old rubble's last stone) so the hole is two short hops. All 9 heroes + the shared fill reach every tier, the shrine and her portal.
3. **Roof layout**: the plan's col 594 / 599 are inside the third stack / a step. Shrine at col 601, her portal at 602 (the last stretch of the roof walk), sign on the step plank at 599, throwers (javelins) on the 2nd / 3rd stack tops (581, 595), slates = roof row 8 cols 587-591 (one row of the two; a 1-tile pit, never a drop into the fire).
4. **T4 collapses per tile** (0.6 s after YOU touch each tile, back after 6 s), not as a whole at first contact: nine tiles at a run take 1.6 s, so a whole-rafter 0.6 s would have dropped everyone mid-crossing.
5. The roof shrine is a **runtime checkpoint** (a drawn brazier + `checkpoint = ...` + persist.stage 'roof'), not a `shrines[]` entry.
6. `padEast` is inline in `highcrownTwo` (no separate helper); the island has a stone ceiling at row 0 (nothing leaves it); `arenaRoof.noWall` (setWall skips it, the walls are the island's own stone).
7. P2 starts through `bossStart()` (name card, bellow, `arenaHeal`), the FT4 `chaseToHall` pattern: the hero is topped up once more at the tower top.
8. The escape's hall-portal shards are yellow + blockable; a parry only clanks (there is nobody to send it back to).
9. The plan's node list named `untold-told` and `attack-tokens` as node checks: both open a headless page (OWED, below).
10. tools/queen-court.mjs and tools/queen-chandelier.mjs are left on disk but removed from check.mjs (comment says superseded); `queen-chandelier` was in the list, `queen-court` too.
11. `tools/crown-exam.mjs` width assertion updated to 609 + 56.

## Checks RUN (node only)
- `node --check` on main.js, gqueen-hands.js, lab.js, level.js, highcrown2.js, marks.js, check.mjs: ok.
- **tools/gqueen3.mjs: RED on master (38 fails), GREEN at the tip (`ok  gqueen3`, registered in check.mjs).** LEVEL (no qpillar / rod / cuttable chandelier, bell + grate kept, five-six tiers inside the hall, escape reachable by the shared fill AND all 9 heroes' own legs, hole to the roof, shrine + portal on stone, tower top sealed both ways, shrine within 14 cols of each arena, every ledge anchored); SOURCE (gqHit door + never unblockable / pierce, chipBy.gqueen 0.4, gqOpen, 7 mark rows, QUIET flee, dead rows gone, flee full-heals incl. flasks, persist, stun guard 1.5, machinery gone, check.mjs); **HANDS in a fake world** (crown parried -> stun, 4% hp, no stunlock; plain block -> fetch, no stun; ducked crown passes; 16 yellow; P1a 2 portals / P1b 3; one stun a cast; flee spare + full heal + persist + reset keeps her out; fire floor ticks 8 and spares; T4 crumbles and comes back; shrine -> checkpoint; portal step -> tower top at 1600; lash high / low / ambush yellow / geyser / storm parry stun / hatch guards).
- tells (`--write`, then clean), answer-tags, comments, architecture, checkpoints, boss-checkpoint, anchor-lint, signs, goblin-lint, blow-tags, level-quality, crown-exam, crown-requests, boss-rows, elites, kitchengate, ore-road: all exit 0.
- dangling-paths: same 2 pre-existing reds as master (`audio/file.ogg`, `src/redraw/prior_queen_set.js`); mine (`tools/gqueen3-page.mjs`) is committed.
- curve-gate: exit 0 but the `crown` row is now **stale** (level hash changed): needs `node tools/level1-pilot.mjs crown --curve` (browser) - OWED restamp.

## OWED (browser; after the gate; one browser at a time, >= 1500 MB free)
- `tools/gqueen3-page.mjs` (written blind, first run will tune the harness): all 9 heroes parry a forced crown, a plain block does not, the flee, etc.; still to add: grate pin, death in the escape skips P1, death in P2 restarts P2 only, P2 never below 1.0x, no stunlock in play.
- untold-told, attack-tokens, textfit, curve-gate restamp (`level1-pilot.mjs crown --curve`), `pixels`/floats for the island and the new tiles; rewrite rule-openings, boss-fight-end, crown-exam page parts, boss-music, bosszoom-shots, highcrown2.mjs (the "ring" / "b15" sections assert the plate), queen-pilot / queen-shots for the 3-stage fight.
- The lab bot (src/lab.js `gqueenReact`) is untested in the page: confirm it hooks before the generic block keys, that `k.block` is not overwritten later in the frame, and that the bossLab loop (`boss.alive`) rides through the hidden-boss escape.
- Things only a page shows: the hall `routeSupports` pushed at runtime may not draw (baked art), the laid tiers use the default one-way art (tileSpr null), `e.hidden` semantics for a living, hidden boss, `P.ducking` vs crown height 14, `spare: true` on the fire tick.
- ART lane: crown toss / catch poses, stunned pose, portal glow + shards, burning rafters + slates, tower-top deck + backdrop, banner lash, geyser, crown storm, hatch; contact sheet. All current poses are frames 2/6/7/8/10/15 placeholders.
- TUNE lane: bossLab n=6 BUILT with flasks, whole fight 60-70%, 40% per-hero floor, mash 0/6; lengths P1 70-100 s, escape 30-40 s, P2 60-90 s.

## Questions for Daniel (recommended option first - all BUILT as recommended)
1. A parry on her crown also gives the shared boss riposte (`RP.parried` -> `react`: 0.5 s RIPOSTE opening) on top of the 3.5 s stun. **Rec: leave it** (it is the generic parry payoff, never a second stun). Alt: flag the gqueen crown parry so the generic react is skipped.
2. Stun costs HP (4% crown, 3% shard, 6% storm) on top of the 1.0x window. **Rec: keep for the tune lane to cut if the bar empties too fast.** Alt: 0%, the stun is only the window.
3. The roof shrine is a runtime checkpoint with a drawn brazier. **Rec: keep** (no new shrine entity, no level-quality shrine rules). Alt: lay a real `check` ent at 601 if the art lane wants the shrine sprite.
4. Her P1 rock shards and portals fire at the fire-time spot with the plan's 0.9 s glow; P1a has 2 portals. **Rec: keep.** Alt: a 1 s glow for the first cast only.
5. Chandeliers: scenery weights (kept) vs deleted. **Rec: kept as scenery** (art, crown-exam untouched). Alt: delete and update the two node tools.
