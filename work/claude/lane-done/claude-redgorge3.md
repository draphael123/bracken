REDGORGE3 DONE 11-06 READY (code-only greybox behind its flag; browser look, art, bossLab tune owed - listed below)

# claude/redgorge3 - RED GORGE 3: THE MATRIARCH'S NEW ARENA, THE THREE FALLS (OPUS greybox, code-only, 11-06)

Branch `claude/redgorge3` off `claude/colossus4` 5f28d2603 (contains claude/desertkit). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-redgorge3`. Pushed. NOT merged, NOT deployed. No browser, no tools/check.mjs, no mark-integrity.
Sources: plan-desert-1105 s1.4 / s2 / s3 / s4 / s6 (approved 11-05 14:07), brief-redgorge3-1014, brief-raptormatriarch (plan wins where they differ), the kingspyramid / suntemple reports (structure copied: flag module, node tool, hooks only on own ids).

## DEV FLAG / URL
`src/gorge-falls.js` `RG3_SHIPS = false`; `rg3On()` = `?rg3=1` on the page, `globalThis.BRACKEN_RG3 = true`, or `BRACKEN_RG3=1` in a Node tool.
OFF = master cell for cell: the level hash (grid + ents + movers + arena) equals 5f28d2603's (`a427447a75`), her fight is RG2's (lever wave stun, two baskets, bridges, ward 0). Proved in tools/redgorge3.mjs; tools/raptor-matriarch.mjs 37 ok + tools/redgorge.mjs 56 ok unchanged.
ON: play `?rg3=1&level=redgorge` (walk to her door) or the boss jump `?rg3=1&boss=matriarch` if the boss table jump lands in the level's arena (unverified - browser owed). No main.js change at all: every hook is in her own files (raptor-matriarch*.js, red-gorge.js) behind `G.falls` / `st.v3`.

## What was built
| file | what |
|---|---|
| `src/gorge-falls.js` (new, pure) | the flag; STAGE3 (the 48-wide arena); F3 numbers; SAY3 words; RG3's passes; the falls' water (trickle -> pour -> refill -> full), pullFall, fallOver/pourOver, shyShift, easeRide |
| `src/gorge-falls-draw.js` (new) | GREYBOX draw: each sluice at the lip + its refill GAUGE, the fall (wet streak / told trickle + 'FALL!' / white pour), the levers (letter, up = full), the standpipe + brass basket deck, the loose stone slabs, P3 water; over: a gold E marker on the lever whose full fall she stands under + a dashed line to the fall, 'SHE KNOWS IT' over the shy fall |
| `src/raptor-matriarch.js` | stageMatriarch/geom/pitsOf take a stage (default = RG2's); newFight (sluices A/B/C + the falls); THE FALL STUN in stepMatriarch; the SHY (walk stops, leap lands beside); pull -> pullFall; no lure; RG3 passes; basketY eased; `wardTake` (RG3 x0.4); `fallsPlan` = the human bot's kite + pull (matPlan dispatches on G.falls, so src/lab.js needs no change) |
| `src/raptor-matriarch-hands.js` | levers read their own height (floor/ledge/bank); RG3 words; a hero under a pour takes 10 once a pour (told by the trickle); 'SHE IS UNDER THE FALL: PULL ITS LEVER (E)'; ward x0.4 on the falls; leverDue '' on the falls (the stuck-spots glint sits on RG2's lever cells); greybox draw on the falls |
| `src/red-gorge.js` | flag on: the level 8 columns wider east (152), stageMatriarch with STAGE3, one basket + two slabs from STAGE3, the exit gate moved east, the RG3 mlever unlock row |
| `src/redraw/matriarch_ledge.js` | the nest backdrop reads the arena's own width (`q.W`, only set on RG3) |
| `tools/redgorge3.mjs` (new) | **38 ok** node proofs (+2 with `--sim=N`, the toy duel) |

### THE ARENA (local columns 0-47; every top two rows over the channel, as RG2)
W bank 0-3 | FALL A over the floor (c 8), **lever A LOW** on the channel floor (col 4, 56 px from the fall) | N1 12-13 | B1 18-21 with a one-way sandstone LIP 3 rows over it: **lever B ON THE LEDGE** (col 20, 56 px) | FALL B over the centre floor (c 24) + THE STANDPIPE BASKET | B2 26-29 | N2 34-35 | FALL C (c 40) | E bank 44-47: **lever C ACROSS THE FLOOR** (col 44, 72 px). reachcore: the knight's legs reach all three levers.

### THE FIGHT (two verbs: KITE + PULL)
- **P1**: she stalks you and pounces where you stand (skids on a whiff), rakes (+ RG2's follow-up), sweeps, kicks scree - 4 told attacks + follow-up, every mark unchanged (no new move names). The LURE, the HORN's leap and the SCREECH are trimmed. Pull a lever: its sluice creaks open, a TRICKLE runs 0.5 s (the tell), then the fall CRASHES 1.1 s: under it on the ground she is **STUNNED** (open 5.5 s, the verb's cap 10%), then her told ward 3 s at **x0.4**; in the air it misses (said); in her ward it is shrugged off (said). A hero under a pour takes a blow. **She SHIES** from the fall that stunned her (won't walk in, her leap lands beside it, said once) - use another. Each sluice refills on its own told 7 s gauge. THE HOLD (won't break past 60% until a fall has stunned her) kept, reworded.
- **P2**: walls as RG2 minus the perch/bridges (trimmed): run, dive (stun on whiff), volley, brood. ANY full lever fills THE ONE STANDPIPE under the centre fall; the basket rides up EASED (smoothstep) to her wall; a blow from it knocks her off, STUNNED (RG2's verb).
- **P3**: the dam cracks as RG2 (all three falls run, the floor floods, pillar tops, rider, chain, surge); the sluices are drowned.
- Boss law: >= 0.4x outside openings (hide 0.5 / talons 0.4), ward 0.4x (was 0), the hold is broken by an action (a fall). Still 0: sleep/wake and the P3 flood rider while under the water (2.4 s, she is not in the world) - Q4.

## Node results (one at a time; no browser)
- `node tools/redgorge3.mjs` **38 ok** (40 with --sim=6) (flag off = master hash; flag on: arena, tops, falls over the floor + spread, levers low/ledge/across + in reach + reachcore, one basket, no new checkpoint, exit moved, bridges trimmed; no pull = nothing big, horn ignored, trickle -> stun, cap + ward 3 s, shy, B15 x0.4, refill + 'empty', air miss, shy walk + leap + another fall stuns, hold, P2 standpipe busy/eased/knock, P3 drowned, passes, marks).
- TOY DUEL `--sim=6` (kinematic point-knight, hp 300, 18 a swing, 3 flasks): 0/6 wins, ~145 s, every duel 1-2 fall stuns (A and B used), 1-2 basket knocks, she ends at 45-104 hp; every loss is in P3 (the toy hero has no real pillar-hopping). NOT the rate - the pace (90-150 s band) and the verbs work; bossLab owed.
- `BRACKEN_RG3=1 node tools/level-quality.mjs redgorge`: only **pilot** + **mash** red = 'the level changed since its pilot/mash ran' (page tools, owed). Flag off: CLEARS THE BAR unchanged.
- Flag on vs off, identical exit 0: checkpoint-stand / -gaps / -thin / checkpoints, floaters, anchor-lint, solid-islands, goblin-lint, reach, desert-bosses, answer-tags, dangling-paths. floating-geometry (report) lists the new ledge lip (ONEWAY x4 @114-117,19) - the art lane anchors it (a bracket / a carved lip off a rock column).
- `node --check` every touched file. Filenames gorge-falls / gorge-falls-draw / redgorge3 clean vs ad/banner/track/pixel/promo/analytics/admiral.

## Browser owed (one at a time, >= 1500 MB, memguard first; all with ?rg3=1)
1. Walk in + fight: the lever heights (floor / ledge / bank) answer E; the ledge jump for every hero (reachcore says the knight; check the reaper + a ranged hero); the trickle reads; she skids under a fall; the shy word; the basket ride feel; the stuck-spots glint stays quiet on the falls.
2. bossLab `boss-rates redgorge` n=6 WITH flasks (60-70%) via matPlan -> fallsPlan (lab.js unchanged), mash 0/6; boss-openings / damage-caps / untold-told / hint-shown; then `level1-pilot redgorge --write`, `mash-bot redgorge --write` (the level-quality reds), reach-heroes.
3. The QUICK gate on the branch.

## Art owed (art before live)
The three falls (white water on rust rock, foam pools), three sluice gates at the lip + gauges, three levers (incl. the ledge's), the ledge's sandstone lip (anchored), the standpipe + basket (brass deck, rope cradle; no wood), the loose STONE slabs (RG2's timbers drew as wood - on the falls they are broken sluice stone), the backdrop (matriarch_ledge's nest backdrop still draws RG2's two gate arches over a 40-wide frame), the stuck-spots lever glint cells for the three levers.

## Questions for Daniel (recommended answer first; built as rec)
1. **Lever placement**: A low on the floor (56 px), B on a ledge (56 px + a jump), C across on the east bank (72 px). REC keep - short runs for the knight's 92 px/s inside her 1.25 s skid. Alt: put each lever on the far side of the arena from its fall (harder, more kiting).
2. **She shies only from the LAST fall that stunned her** (one at a time). REC yes - with three falls you always have two. Alt: she shies from every fall used this phase (forces the rotation).
3. **P2 trims the rope bridges/perch** and keeps ONE eased basket fed by any lever. REC yes (brief: "one clear, smooth ride"; plan: two verbs). Alt: keep the bridges as a P2 extra.
4. **Never invulnerable**: on the falls her post-opening ward is now x0.4 (RG2 keeps 0 with the flag off). The P3 flood rider is still untouchable while under the water (2.4 s, not in the world). REC leave the rider (it's an absence, told FOAM!), flip RG2's ward to 0.4 when RG3 ships. Alt: give the foam line a 0.4x hitbox.
5. **Fewer checkpoints**: the arena adds none; the level keeps its 3 (Daniel 10-14: "Red Gorge is good"). REC keep. Alt: drop the bridge-four shrine (40,69).
6. **The horn on her floor**: on the falls her arena ignores the gorge's horn (no flood leaps). REC yes - the falls are the arena's water. Alt: the horn also refills every sluice at once.

## Final tip
see the scratch copy (scratch\lane-reports\redgorge3.md) / `git log -1 claude/redgorge3`.
