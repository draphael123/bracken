# foevar2 (lane F2, canal / towpath / fair) - 11-10, code-only, branch claude/foevar2 (from claude/foevar1 7665d5cd), pushed
Change: src/cast-pass.js only. castSwaps gains a `drop` key (role objects such as e.canal / e.tp are allowed on the foe and deleted on swap) and `fromSkin` now also reads the skin off e.canal.cnSkin. 10 new rows over towpath, canal, fair. Only foes the road already introduced (one-new-foe green). No water-bound foe placed (eel/turtle/heron/feeler need water tiles: builder work, see Q1); the grindylow stays in its water.

## Per level (kinds / variety score, before -> after; curve INDEX before -> after)
- towpath 9/7.3 -> 11/9.2 (INDEX 69 -> 76): fogwraith 7->5 (+1 runner in the yard, +1 lanternshade under the arches; the first wraith, race pit, sunk basin and flying ones stay), watchman archer 6->4 (+2 crossbow, the perched shooter, T2->3).
- canal 8/5.7 -> 11/7.5 (86 -> 96): watchman archer 11->8 (+3 crossbow), bargeman 10->6 (+4 sworn sword, 3.5 for 3.5; boarding gang and island garrison stay bargees), lamplighter snuffer 3->1 (+2 lanternshade, the lamplit canal's ghost with a lantern). Grindylow still 33% (cannot move it).
- fair 9/6.3 -> 13/9.8 (130 -> 141): mummer 16->11 (+2 stagehand from the Theatre, +1 armour, +1 haunt, +1 boo), strongman 5->3 (+2 armour: a tin-man act). Plain mummers only; cover/scare/ride mummers, hobbyhorses, jugglers untouched.
Theatre and fields: not touched (fields stays).

## Checks (node only; no browser started)
OK: foe-cast-lint, one-new-foe, threat-holes, goblin-lint (canal/fair/theatre all-reskinned rule holds), foe-footing (my levels clean: a first runner at the 186 flier slot failed it, moved to 130), tools/towpath.mjs (321 ok; it needs >= 5 fog wraiths, so the wraith swaps stop at 2), canal-water, canal-aloft, fair-map, node --check cast-pass.js.
curve.mjs: 22 steps out of line before and after (no new wall; theatre-over-canal wall 44 -> 34). BUT the per-level INDEX is NOT within +-2: +7 towpath, +10 canal, +11 fair. Cause: indexOf counts `kinds * 3`, so every new kind is +3 by formula (threat itself moved +3/+1/-6). Variety and the +-2 rule conflict by construction; I took variety. Fallback if Daniel wants +-2: drop the runner + lanternshade (towpath), the lanternshade row (canal), haunt + boo rows (fair) = about -3 kinds each.
RED / owed: level-quality pilot+mash (hash stale) for towpath, canal, fair. Pre-existing and untouched: canal-map.mjs crashes in master too (W undefined).
Skipped (cdp): canal.mjs, canal-pilot, towpath-route/probe/exits, fair-folk/route/pilot, harvest-fair.mjs, save-safety, QUICK gate.

## Owed browser (after the gate)
- pilot/mash --write for towpath, canal, fair (level1-pilot.mjs <id> --write; mash-bot.mjs <id> --level <id> --write).
- Stills walk: towpath crossbow on the f3Beam (194,9) and 388,11 perches; runner shout fetching sworn swords at the yard (130); lanternshade at 315 and in canal 153/369; canal crossbows on the low bridge/mill bridge/theatre bridge, sworn swords on the wharves (can they patrol their ledges without walking off? gaffers share the walker AI, footing lint is clean); fair stagehand (269,527) swing/drop telling, armour at 330 + strongman spots, haunt at 406 elevator, boo at 540 (fair is "creepy" already).
- Check that the canal's gate/boarding scripts do not read e.canal on the swapped ents (only plain-squad bargemen were swapped).

## Questions (rec first)
1. Water foes (eel, turtle, heron, feeler, leech) in canal/towpath need a builder pass (waterHome). Rec: a small builder lane after the walk, only if the walk says canal still reads grindylow-heavy.
2. INDEX +7/+10/+11 (kinds term). Rec accept (no new wall); or ask the curve owner to cap the kinds term.
3. Stagehand outside the Theatre (unblockable 18 front + 16 drop) at a fair: rec keep, 2 of them replace 5-threat mummers.
4. Runner/sworn swords at the towpath: rec keep (the runner's shout is the lesson of Waymeet).
