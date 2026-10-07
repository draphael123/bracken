# Lane report: claude/rootway - FIX PASS (2026-10-07, after scratch/review-rootway.md)

Merged origin/claude/walker (tools/level-walk.mjs) first (one conflict: the tools/check.mjs list; both sides kept). PORT 8705 for every page run
except two slips noted below. Measures are DRY: claude/survival is NOT on this branch, so profile `human` never drinks (Daniel's dry band). There is
no `human+dry` profile here.

## MUST-FIX status
1. **Exam pits are real falls - DONE.** The lookout chasm (304-311) and the last leaning cap's gap (341-350) have no floor (THE FALL, back to
   checkpoint three). Told: a sign at checkpoint three ("NO ROOTS UNDER THE CANOPY: FROM HERE A FALL IS THE END."), a warning post on each near lip.
   Taught: the span (cellar pit) and the leaning cap (root gap) are both first met over cheap floored wells; every well before col 296 stays cheap.
   tools/rootway.mjs: the cheap-well list drops those two (Daniel's A10 amendment) and gains "exam gaps have no floor / a warning post / the sign
   tells it / no floorless column before the exam" (same strictness, more asserts).
   **Found and fixed a real soft-lock:** a death rebuilt the grid, but a span or cage that "stays down" kept state 'down' with no cells - the lookout
   span vanished and could never be cut again. src/rootway-hands.js reset now lays those cells again; tools/rootway-probe.mjs asserts it (fails without the fix).
2. **High cleat / buds / larder - DONE.** Measured: a standing swing from the cap reaches the cleat only at row 21 (knight) or 22 (all three, but then a
   ground jump-swing reaches it too, breaking the "grow a cap to reach it" lock). A JUMP and a swing from the cap at row 19 cuts it for every hero from
   almost anywhere on the cap (knight 16/20, warden 20/20, pyro 20/20 positions x timings). So the cleat stays at row 19 and the sign and nudge say
   JUMP ("GROW THE CAP UNDER IT, THEN JUMP AND STRIKE"; the nudge glints the cleat itself). The bud sign/nudges say "JUMP ONTO IT AND STAND STILL".
   Larder cages land flush against the next stump (no 1-column slots). Also found: the high-cleat bud and the hunter's bud stood one column off their
   root walls, leaving a 1-column corner a hero fell into and could not leave; both buds now stand flush (the tests follow the coordinate).
3. **Huntmaster spread - PARTIAL.** Overall in band (57%), knight 40%, pyro 40%, the WARDEN 90%. See the rates table.
   Tried and measured, then reverted: the reviewer's knife 36 -> 50 did nothing to the bot warden (0 knives: her stand-off is 62 px and his knife is
   only chosen between moves); a knife that cancels his draw hit knight/pyro more than her; "his bow turns an arm's-length blow while he draws" turned
   pyro's blows 20 times and hers 8. Kept: (a) a PARRY (the warden's sweep) turns a gold arrow home but only STAGGERS him; a BLADE strike breaks his
   gear (told once: "A PARRY ONLY STAGGERS HIM: STRIKE IT"); (b) an arrow is struck back close in only (30 px from the hero; strike box 12 -> 16) -
   every hero's window the same width; (c) an opening closes after 4.5% of his blood (the fastest blade feels it most); (d) phases at 75% / 40% (red
   arrows sooner), red 10, poison tick 4, gold 6; (e) hp 1150 (1100 before). Her fights went from 46-70 s to 97-127 s and she takes 50-100 of 124 hp,
   but she still wins.
   **The bot gap the reviewer asked about:** striking back works at 22-70 px for every hero whenever the bot is READY (measured 6/6 at every distance);
   the misses were the bot mid-swing when an arrow arrived - it neither struck nor guarded, it ate it. The v2 bot now blocks (knight), sweeps (warden)
   or rolls (pyro) a gold arrow it cannot meet. Pyro went 20% -> 40-50% from that alone.
   **The cage (B1) now happens:** a perch every P1 cycle (and 2 of 3 P2 cycles), 6 s on it, a told line each time ("HIS CAGE HANGS OVER HIM: JUMP AND
   CUT ITS ROPE"), and the perch cleats moved to the arena side of each perch AT PERCH HEIGHT (a jump and a cut): floor-level cleats were being cut
   by stray blows, dropping the cage on nothing so it was winched away when he perched. Catches a fight: 0-1 -> 1-4 for pyro; knight/warden still 0-1.
   **Red arrow barbed - DONE:** a 5 px barbed head with swept barbs and a dark fletch; gold keeps the square glinting head.
4. **Level-1 pilot extension - DONE in makeBot; the pilot's lift count did NOT drop.** src/playtest.js makeBot now cuts any uncut hoist cleat within
   6 tiles (walks to the tile before it, faces it, swings; a held jump-swing when it is over his head; drops through a ledge to a cleat below), stands
   on the lookout lip and strikes an arrow back, rides a LEANING bud whose root shelves fooled its gap test, and never drops through a bridge over a
   floorless fall. The campaign walker (no lifts) now walks 91-94% of the route for every hero (3% before). The level-1 pilot still counts 86-93
   lifts in 3 runs: its budget is 4 s a waypoint (every 8 columns) and the fights/buds/cuts eat it - the hero is 1-5 tiles short at most of the 28
   lifts a run I logged. Real blind spots left: the lookout wait (for the arrow) and a hero shoved into a well (the bot does not climb back west).
5. **Section-end exams for sections 2 and 3 - DONE**, checkpoint after each. THE GREAT ROOTS: the gap-span landing held by a shield, a trophy-hunter
   and a scout on the root step over them (sign "THE GOBLINS HOLD THE FAR SIDE..."; cp 193 after). THE HOIST YARD: up the hunter's bud into a
   shield, a scout on the bough, the sapper and a trophy-hunter (sign; cp 290 after). No elite or mini (as the reviewer recommended).
6. **Heavier front half - BUILT; the walker target is NOT met.** Foes at platforming moments: a lurker and a roof spider on the cellar wall top, a
   spitcap and a roof spider over the cellar span, weavers in the first squads, a lurker where the 3-row jump lands, spitcaps/archers on shelves over
   the road, a spitcap over the leaning cap's landing, a shield before the gap span, a hunter on the larder's far lip, a shield on the high root by its
   well, a trophy-hunter hanging over the lookout lip (he rides down BEHIND you while you wait for the arrow), a hunter where the last cap lands, two
   bows on the last cap's ride, and Sporewood's told spore drops on a beat where you stop to work (cleats, lips). About 24 -> 45 foes; level-quality CLEARS.

## WALKER (tools/level-walk.mjs, campaign L4, human+first, 2 seeds a hero)
| | deaths | arrive % mean/min | gross hp lost a section | route measured |
|---|---|---|---|---|
| BEFORE (greybox), all three | 0 | - (no section measured) | 0 | **3%** (every section STUCK: no cleat or lean hands) |
| AFTER knight | 0.5 (THE FALL, last chasm) | 93 / 79 | 43% | 93% |
| AFTER warden | 0 | 90 / 52 | 13% (one run 179% in the exam, a tonic drunk) | 69% |
| AFTER pyro | 0 | 97 / 80 | 10% | 83% |
The act-I target (~1 foe death, arrive < ~60%) is NOT met. The gross loss a section is real (12-179%), but heals give back about half on this
branch (kill heals, hearts, a level-up mid-level is a full heal), and arrival is read net. The SURVIVAL lane's caps (kill heals capped, shrines that
do not heal, manual flasks) move this number; re-measure once it lands. Level-1 real-keys route (walker --level=1 --profile=none, no lifts): all
three heroes reach the arena door (94% walked), knight 1 death (THE FALL, the last chasm), arrivals 25-100%.

## BOSS RATES (tools/boss-rates.mjs rootway --ways=practiced --profile=human = DRY; campaign L4, normal health)
| config | knight | warden | pyro | total | fights (s) |
|---|---|---|---|---|---|
| greybox (lane) hp 1100 | 2/5 | 5/5 | 2/5 | 60% | K 90-121, W 46-70, P 107-124 |
| **FINAL hp 1150, 10 seeds** | **4/10** | **9/10** | **4/10** | **57% in band** | K 142-194, W 97-127, P 127-171 |
Intermediate configs (git history, scratch logs): 67%, 92%, 58%, 53%, 67%, 68%, 63%. About 50 seeds a hero went in across configs (over the ~20
cap: the spread needed it). Drinking rate: not available (no drinking profile on this branch). Mash boss 0/6 (89-92% left).
Fights for knight and pyro run long (to ~190 s): the 4.5% opening cap lengthens them; a later pass could trade some of it for hp.

## Re-stamped (own rows only)
Level-1 pilot (9 hits / 0 deaths / 92 lifts), curve (in band, 0 deaths), mash LEVEL then BOSS (level: knight 4% / warden dies / pyro dies; boss
0/6). level-quality rootway CLEARS; mash-gate and curve-gate green. `node tools/boss-level.mjs --write-xp` rewrites nearly every row on this base
(master drift), not only rootway/kings: NOT committed - for integration.

## Checks run (green)
rootway, rootway-probe (+ the respawn assert), boss-openings, boss-rows, level-quality, mash-gate, curve-gate, stuck --static, signs, spawns,
floaters, dressing, collectables, deadends, killzones, checkpoints, checkpoint-gaps, one-new-foe, threat-holes, answer-tags, tells, elites,
hint-shown, textfit (0 issues). traps: 20 (pre-existing, none in the Rootway). NOT run: the suite.
Port slips: hint-shown and one textfit ran on this checkout's default port block (nothing foreign was served) before I set PORT=8705.

## Shared code touched (merge care)
src/playtest.js makeBot: the Rootway hoist hands are gated on L.rootway, but the LEANING-bud rule and the never-drop-into-a-void rule are generic -
they can move other levels' pilot/mash numbers slightly (Sporewood's leaning buds). tools/level-walk.mjs: yields to a hoist job; takes a level-up
card instead of ending the walk. src/hint-lines.js: three Huntmaster lines.

## QUESTIONS FOR DANIEL (each built as recommended)
1. **The warden still beats the Huntmaster 9/10.** Every hero-neutral counter I tried bit knight/pyro as much or more (logged above). Her kit - a
   40 px spear that meets arrows early and a sweep that turns arrows AND his knife - is a hard counter to a ranged duelist. *Rec (built):* overall
   57% with knight/pyro at 40%. Options: (a) accept a warden-favoured boss (she is the arrow hero); (b) a told move a sweep cannot turn (an
   unblockable '!!' shove after a parry); (c) a boss-standard pass on the warden's sweep against projectiles across all bosses.
2. **Act-I campaign difficulty is gated by healing, not by foes.** Gross loss a section is 12-179%; net arrivals 79-100% because kills, hearts and a
   mid-level level-up heal it back. *Rec:* re-measure after claude/survival lands, before adding more foes (the level has about 45 now).
3. **The level-1 pilot's 4 s a waypoint** counts fights and bud/cleat work as lifts on a hoist level (86-93 in 3 runs). *Rec:* read the walker for
   the Rootway (no lifts, 91-94% walked); consider a waypoint budget that grows with the fights in it.
4. **Spore drops on the beat** (Sporewood's told rockfall, spore variant) at the places you stop to work or wait are what makes the mash bot lose the
   level (pyro was clearing it at 70%+). *Rec:* keep; the art pass gives them a root-canopy source.
5. Kingswood's campaign XP: `--write-xp` at integration (it rewrites every row on this base).

## ART PASS LIST (Sonnet)
- Music: the level plays "Lanterns in the Hollowed Forest" (Tsorthan Grove, CC0, approved by Daniel) instead of the 'cave' placeholder; the
  Huntmaster keeps a composed synth theme ('boss3' placeholder now).
- KIT: root bark walls, cap flesh for buds and caps, lashed timber spans, rope + pulley + cleat sprites (keep the cleat glint and the lookout's gold ring).
- The CHASMS: a dark canopy drop with mist and no floor, so a floorless gap reads differently from the cheap floored wells; a better warning post.
- The barbed RED arrow (shape done in greybox: keep it barbed with a dark fletch); the gold arrow's glint; the poisoned floor.
- Spore drops: a root-canopy clump over each (they fall from the top row or the cellar roof now).
- The trophy-hunter sprite (a CV machine), the scouts' cnSkin 'gobscout'; weaver, spider and lurker in the root palette.
- The Huntmaster: mask, quiver strap and bracer states; the perch cages and their high cleats (a jump-height peg on a post beside each perch); CAUGHT bars.
- LMK: a constant great-root silhouette and the hoists' gallows on the skyline; LIGHT: a lantern-lit larder, shafts in the canopy; the sky warms with the tints.

---

# Lane report: claude/rootway (THE ROOTWAY + THE GOBLIN HUNTMASTER, Opus GREYBOX)

Branch `claude/rootway` from origin/master b4300130 (+ the .claude/briefs commit). Brief: `.claude/briefs/brief-rootway.md`
(copy of `scratch/brief-rootway.md`). Greybox only: the Sonnet art/music pass follows the read-only review. Nothing ships
without Daniel's playtest (B9).

## Placement (Daniel-approved design change: Sporewood > THE ROOTWAY > Kingswood)
- `src/level.js`: appended `{ id: 'rootway', needs: 'spore' }`; **`kings.needs` is now `'rootway'`**.
- No test pinned the literal spore -> kings order (searched tools/ and src/). What moved with it, and is said here:
  - `src/foe-react.js` ACTS: act I lists rootway between spore and kings.
  - `tools/one-new-foe.mjs` walks the gate chain: Kingswood is now measured after the Rootway (it still brings new foes;
    the Rootway brings exactly one, NEW_EXACTLY rootway: ['trophyhunter']). Green.
  - Kingswood's campaign level for the boss bot (tools/boss-level.mjs) rises: its depth is 5 now, and
    tools/fixtures/campaign-xp.json has no rootway row (it never had skyroad's either), so the King is measured from
    depth until `node tools/boss-level.mjs --write-xp` is re-run at integration (QUESTION 4).
- Map: wood sheet node (222,66), plate right; WOOD_PATH spore (199,38) -> (222,66) -> kings (141,24). It is the only spot
  near the two that map-spacing passes (searched exhaustively over 120-230 x 24-80): the road dips south to it and climbs
  back to Kingswood. map-grammar + map-spacing green (QUESTION 5).
- TIER 0.52, MEDALS [470, 650, 920] (an estimate), gated by level-quality, REPORT_ONLY music.

## The level (src/rootway.js; rule and machines src/rootway-hands.js)
RULE (L.rule): "THE CAPS GROW INTO STEPS; THE GOBLINS' HOISTS DROP WHAT THEY HOLD. STOP ON A BUD TO GROW IT; CUT A HOIST'S
ROPE TO DROP ITS LOAD." - what the code does: buds are Sporewood's growcap movers; a hoist (L.hoists) drops its load when its
CLEAT is struck (or, at the lookout, when an arrow struck back flies through its rope): a SPAN lands as a bridge (one-way
cells), a CAGE crushes what is under it and stays as a 2x2 step, a HUNTER falls dazed. Rope, cleat glint and a dotted plumb
line to the landing are drawn (A3). What a hoist drops stays for the attempt (a death keeps the spans and cages).

| Section | Cols | Arc |
|---|---|---|
| THE ROOT CELLAR | 0-96 | TEACH: a 4-row root wall and its bud (first required use); a span over a cheap pit (bud back to the near lip); a hollow with silver one |
| THE GREAT ROOTS | 96-196 | TEST: a leaning cap over a root gap; a cage cut onto two scouts; THE TROPHY-HUNTER rides a hoist down; a span over a real gap |
| THE HOIST YARD | 196-296 | REMIX: SET PIECE A, THE TROPHY LARDER (three stumps 4 rows apart; each cage lands as a half-step: the stair appears); a cleat struck only from its grown cap; a hunter hanging over the bud you must grow |
| THE CANOPY LOOKOUT | 296-386 | EXAM: SET PIECE B, THE LOOKOUT (strike the scout's arrow back: it cuts the rope, the span drops - the boss's key, required); a leaning cap under a scout's fire; the trophy loft |
| THE HUNTMASTER'S STAND | 388-446 | boss |

- Climb: row 42 (fungus floor) to row 18 (canopy). Tints carry fungus violet -> autumn amber (L.tints) - the seam the
  sporeseam lane left to this level.
- Checkpoints 92, 193, 290, 384 (door): one per 104 route tiles. Three silvers off the route (the cellar hollow, a root
  pocket over the larder's far lip, THE TROPHY LOFT - four TROPHY TAGS, E at the loft). Never a relic.
- Every well has a root-shelf stair back to its near lip only; the lookout's scout is replaced if he dies before the
  span drops (never a soft-lock).
- Foes: sporeling, spitcap, lurker (fungus, thinning out by col ~360); archers (scouts), shield, brute, sapper (goblins);
  THE GOBLIN TROPHY-HUNTER (new, a CV machine: told lunge and jab a shield turns; rides a hoist down; cut down, dazed).
  Roles 4 (melee, ranged x10, heavy, runner).
- level-quality rootway: CLEARS (flat 0%/18%, 7 bands, 49% second height, 6 gadget kinds / 3 developed, 3 secrets,
  1.63 encounters a screen, 13/26 encounters in the rule, route spans 24 rows). Level-1 pilot: 10 hits, 0 deaths, walked
  100% (74 lifts: the pilot cannot work buds or cleats). Mash LEVEL: knight dies, warden lowest 19%, pyro dies.

## THE GOBLIN HUNTMASTER (src/huntmaster.js; DUELIST, B11)
- Always hittable; GUARDS BY ANGLE between moves (bow across him): a blow from his front at his height is turned (clank,
  GO ROUND through src/boss-read.js TURN_WORD); from behind, from the air, or while he draws/slashes/leaps it lands whole.
  FULL_DAMAGE (no chip), greed still counted (mash reprisal). He turns to you a beat late (0.35 s).
- KEY (B14, PR-reflect): a GOLD arrow struck back (any blade, or the warden's sweep) flies home and breaks the phase's weak
  point - P1 QUIVER STRAP (volleys lose an arrow), P2 BRACER (draw x1.45 slower), P3 MASK (5 s x2, THE BIG OPENING); P1/P2
  break 3.5 s x1.5; once broken, a gold arrow home staggers him 1.2 s x1.25. RED (poisoned) arrows no blade turns:
  'POISON: DODGE IT'. Read: gold glint + yellow ! / red trail + red !!.
- LEVEL VERB (B1): cut a boss hoist's cleat while he stands under its cage (his perches sit under the side cages): CAUGHT,
  3 s x1.5. Cages are winched back after 8 s.
- B3 ward 3 s after a break or a catch (1.5 s after a stagger): blades turned (HE GUARDS), arrows glance off.
- Phases: P1 aim / volley / knife / leap (a perch, once a cycle in three; a bud under each perch); P2 (67%) NEW the
  POISONED SPLIT SHOT (red outers leave poisoned floor 3 s); P3 (34%) NEW the HOIST-DROP SHOT (the cage nearest you, its
  shadow first).
- Numbers: hp 1100, arrow 7, red 8 + poison, knife 12, his cage on you 16 + caged 1 s.
- Bot (src/lab.js branch, plan hmPlan): v2 strikes gold arrows back (per-arrow 30% let-go), rolls/jumps red ones, stands
  off his knife and cuts him as he draws, jumps over his guard, cuts a perch rope when he is under its cage, climbs a bud.
- boss-openings asserts: a minute with his arrows taken on a guard opens nothing; a gold arrow home opens him 3 s+.

RATES (tools/boss-rates.mjs rootway, profile human, practiced, campaign level L4, NORMAL health):
| Config | knight | warden | pyro | total |
|---|---|---|---|---|
| hp 1000, arrows 7 (per-arrow rolls fixed) | 2/4 | 4/4 | 3/4 | 75% |
| hp 1080 (+ the warden's sweep rolled like a blade) | 2/4 | 4/4 | 1/4 | 58% |
| hp 1080, 7 seeds | 3/7 | 7/7 | 3/7 | 62% |
| hp 1120, 5 seeds | 2/5 | 5/5 | 0/5 | 47% |
| **FINAL hp 1100, 5 seeds** | **2/5** | **5/5** | **2/5** | **60% (in band)** |
Fight length: knight 90-121 s, pyro 107-124 s, **warden 46-70 s (under the 90 s floor: QUESTION 1)**. Mash boss 0/6 (90-96% left).
I stopped at the ~20-seed cap. Earlier configs (hp 760-1100, arrows 8-10, a shared-roll bot bug) are in git history.

## Files
New: src/rootway.js, src/rootway-hands.js, src/huntmaster.js, src/redraw/rootway_art.js, tools/rootway.mjs,
tools/rootway-probe.mjs, tools/huntmaster-diag.mjs (measuring tool), .claude/briefs/brief-rootway.md.
Edited (small, local): src/main.js (imports, EHP/TIER/MEDALS, spawn cases, reset/update/strike/interact/draw hooks, the CV
rows, the hurt/update/draw/bar/death hooks, bestiary cards, BK accessors, the map node), src/level.js, src/reachcore.js
(hoist landings + the loft door count as done when L.rootway), src/lab.js (the branch), src/boss-greed.js (OPEN_RULE,
FULL_DAMAGE), src/boss-read.js (TURN_WORD), src/marks.js (BY_HAND/ANSWER/HEIGHT + tells --write), src/hint-lines.js,
src/stuck-spots.js, src/threat.js, src/dressing.js, src/foe-react.js; tools: check.mjs (rootway, rootway-probe),
level-quality (GATE, runner role, REPORT_ONLY music), one-new-foe, boss-rows, boss-openings, elites (PENDING), corpses;
docs: mash-bot.json, level1-pilot.json, level1-curve.json (rootway rows only).

## Music picks (CC0 / CC-BY - nothing downloaded; Daniel picks)
1. "Lanterns in the Hollowed Forest" - Tsorthan Grove - CC0 - https://opengameart.org/content/lanterns-in-the-hollowed-forest (the fungus foot: soft, foggy, looping)
2. "Forest Exploration" - Tsorthan Grove - CC-BY 4.0 - https://opengameart.org/content/forest-exploration (the climb: an ambient exploration loop, 90 BPM)
3. "Quirky Goblins (Looping)" - Eric Matyas - CC-BY 3.0 - https://opengameart.org/content/quirky-goblins-looping (the goblin canopy / a Huntmaster stand-in)
Placeholders now: the level plays the benched 'cave' track, the boss room 'boss3' (BOSS_POOL); a composed Huntmaster
synth theme is the music pass's.

## Checks run (PORT 8705 only; all green)
rootway, rootway-probe (13 asserts in the page), boss-openings (the Huntmaster row added), level-quality (every gated level), mash-gate, curve-gate,
one-new-foe, checkpoints, checkpoint-gaps, elites, dressing, map-grammar, map-spacing, threat-holes, tells (+ --write), answer-tags, stuck (static +
runtime), hint-shown, signs, boss-music, audio-assets, collectables, floaters, spawns, architecture, skins, deadends, killzones, keys, textfit
(bestiary,hints --strict). traps: 20 (pre-existing on master; the Rootway's three larder slots were found by it and closed).
NOT run: the full suite (the coordinator's), textfit-full, slopes-trace.

## Red / unverified
- Nothing red that I know of from my changes. Pre-existing: traps lists 20 pockets in other levels; curve-gate's report-only list (kings among them).
- Not played by hand; greybox art (plain shapes: hoists, cages, the hunter and the Huntmaster drawn live, the scouts are plain archers).
- The level-1 pilot is lifted ~73 times a run (it cannot grow buds or cut cleats): its 9 hits are a floor, not a measure.
- Per-hero reach on base movement is proven by the reach model (tools/rootway.mjs) and the page probe, not by a scripted walk with real keys per hero.

## QUESTIONS FOR DANIEL (each built as recommended)
1. **The warden beats the Huntmaster too easily (5/5, 46-70 s).** Her 40 px reach cuts him while he draws from outside his knife, and her sweep turns
   his arrows. The total is in band (60%) with knight 2/5 and pyro 2/5. *Rec:* keep for the greybox; the reviewer or the fix pass gives him a told
   counter to reach (e.g. he steps back off a spear point before he draws) rather than more health, which only punishes the knight and pyro.
2. **No mini and no gatekeeper elite** (elites.mjs lists rootway PENDING, as the Sky Road and the Glass Sea). *Rec:* an elite TROPHY-HUNTER holding the
   lookout road's gate in the fix pass, or none (it is a bridge level).
3. **The trophy-hunter is the one new foe** (a CV machine; rides a hoist down, lunge/jab). *Rec:* keep. The scouts' own reskin (cnSkin 'gobscout')
   is left to the art pass.
4. **Kingswood's campaign level for the boss bot moves** (depth 5 now; tools/fixtures/campaign-xp.json has no rootway row, as it has no skyroad row).
   *Rec:* re-run node tools/boss-level.mjs --write-xp at integration, and re-measure the King and the Great Hound there.
5. **Map node (222,66)**, south of the Sporewood-Kingswood line: the only spot near them map-spacing passes, so the road dips to it and climbs to
   Kingswood. *Rec:* keep for the greybox; the map lane may relay the wood sheet.
6. **Music**: placeholders ('cave' for the level, 'boss3' for the stand). *Rec:* pick one of the three above; a composed Huntmaster synth theme in the
   music pass.
7. **The Huntmaster's key is not strictly required** (he is a duelist: blades win too). The level's LOOKOUT makes the struck-back arrow REQUIRED once
   before him. *Rec:* keep (B14 exempts duelists; the key is the big opening).
