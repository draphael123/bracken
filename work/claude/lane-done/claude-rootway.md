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
