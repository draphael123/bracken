# claude/fenroad - THE FEN ROAD + THE BOG TROLL + THE GOBLIN STILT-WALKER (opus greybox)

Base: origin/master b4dfa014 (BATCH109). Brief: scratch/brief-fenroad-1020.md (every rec Daniel-approved 10-20). PORT 8781, one headless Chrome at a time,
RAM checked before each (3.8-5.8 GB free all session; no memguard kill seen). Helpers in work/tmp-fenroad/ (uncommitted). Not merged, not deployed.
Branch claude/fenroad; the sha is the commit that carries this report (see the final message).

## WHAT LANDED

### 1. THE FEN ROAD (src/fen-road.js level, src/fen-road-hands.js its machines) - marsh -> fenroad -> stockade
- **Road**: `LEVELS` entry APPENDED (saves count levels by index) with `needs: 'marsh'`; **the Stockade now needs 'fenroad'**. Act I list (src/foe-react.js
  ACTS: wood, marsh, **fenroad**, stockade ...), TIER/TIER_BOSS 0.22 (between marsh 0.15 and stockade 0.3; tools/curve-shape.mjs FROZEN map), MEDALS
  [420, 600, 860] (estimate), map node (268,94) on the marsh->stockade bend + WOOD_PATH, map blurb, exit-gate kind 'marsh', island-post kit (POST_LEVELS),
  dressing kit + allowlist (src/dressing.js), level-quality GATE, one-new-foe NEW_EXACTLY ['stiltwalker'], boss row (tools/boss-rows.mjs), act cards
  (they read ACTS: green), tools/fixtures/campaign-xp.json gets a **fenroad row only** (BK.xpSim: run 509) - see QUESTION 4.
- **Rule (A1, says what the code does)**: "BOWED BOARDS SINK UNDER YOU. STRIKE A LASHING AND THEY GO AT ONCE."
- **The verb (A2/A3)**: a SAG section (ents 'sag', 2-4 rotten boards) bows under a hero's weight - a creak, the boards drawn bending, a shiver near the end -
  and after its hold (1.1 s; 1.4 s on the stilt-post steps) its cells are air for 3.2 s (whoever stands on it goes into the biting water), then it floats
  back. A goblin is too light to bow one. Its LASHING (a post at its near end, a rope to the boards, a gold glint while a body stands on its section):
  a hero's blow parts it and the section goes AT ONCE - with the crew on it, or with THE BARRICADE stacked on it (gone for good). Plunge/heavy not needed.
- **Fen water** = the game's lethal-look swim water (A13 drain, src/main.js DEAD_SWIM): you swim and jump out. src/fen-road-hands.js keeps P.safe on the
  last SOUND board (never a bowed, laid or ripped one).
- **Layout** (FINAL columns; tools/fen-road.mjs pins the beats), a shrine closing each area (A10c) + one before the boss (4 shrines, 107 route tiles each):

| area | cols | arc | what is in it |
|---|---|---|---|
| THE PEAT CUTTINGS | 0-104 | TEACH | first bowed boards over cheap water; the peat trench and its 3-deep pit (cut steps out; a silver shelf); THE FIRST LASHING (a crew pair comes over the bowed boards); THE FIRST STILT-WALKER on dry ground - his horn calls two sprigs only (THE HORN TAUGHT WARM); two bowed sections under a bowman; shrine 101 |
| THE WORK CREWS | 105-210 | TEST | CREW GAP 1 (the layer lays the road plank by plank toward you while he works - or hop the piles), a lashing under a bowman, THE PLANK YARD (stacks to a silver), a gaff fight on the flat (stilt-walker), CREW GAP 2, **THE BARRICADE** (five road-planks high on a bowed section, stakes under it: the REQUIRED use - strike its lashing), the exam's **elite** (SWIFT shield captain on the crew's landing, the bowed section and the fen at his back, gate 201); shrine 206 |
| THE STILT POSTS | 211-310 | REMIX (A14 platforming) | the road is down: bowed 2-board steps, stilt decks, the LOOKOUT CRIBS up to the lookout walk (row 8) where a horn lookout calls a bowman and a spitter, down again over bowed steps under a spitter and a wasp; shrine 307 |
| THE PALISADE ROAD | 311-404 | EXAM | far war horns, the palisade grown on the skyline; a lashing under a crew; **SOMETHING UNDER THE ROAD** (bubbles, then an arm takes a crewman under - the troll foreshadowed, B8); a stilt-walker; CREW GAP 3 under a bowman; a horn stilt-walker with a real crew (shield + sprig); a crew's cache silver; shrine 400 |
| THE TROLL'S CROSSING | 405-451 | BOSS | a wide boardwalk over the fen, three ROTTEN sections (ents 'rotten': a 3.6 s hold - stand on one to lure), the troll's hoard on the bed; the exit is THE STOCKADE'S GATE at the east end (gateAfterBoss: it opens when he falls, you walk to it - checked in the page) |

- **Foreshadowing**: the Stockade's palisade + two horn towers grow on the skyline the further east you are (FRH.drawSky); from the Palisade Road on a far
  war horn sounds every 10-17 s (SFX.farHorn); the palisade and a horn tower stand round the exit gate.
- **Guides (A6)**: src/stuck-spots.js fenroad - the barricade's lashing (glint + nudge until its load is gone, FRH.props feeds the guide) and the peat pit's steps.

### 2. THE BOG TROLL (src/bog-troll.js pure fight + bot plan, src/bog-troll-hands.js world + greybox poses) - not a goblin
- **Header (B1/B11/B14/B15)**: a beast with a rule opening. Out of the water his PEAT HIDE takes x0.4 (clank + PEAT HIDE; first time a hint says what to do);
  under the boards he is out of reach (a told move between moves: bubbles where he swims, never a waiting room). **THE OPENING IS THE LEVEL'S VERB**: he feels
  your weight and bursts up under you - stand on a ROTTEN section while he hunts, step off as the bulge SETS (it follows you amber, then stops and turns
  red with a !!) - he bursts through rotten boards that give way round him: **STUCK** waist-deep (gold ring + timer bar, B10), x2, at most 17% of him a
  stuck (he tears free early, told). The wreck's end boards hold (you strike him from them); the section floats back after 14 s. **WARD (B3)**: tearing free,
  a told 3 s ward (x0.4, WARDED; a rotten section burst through his ward breaks on him but does not hold him). B15 floor everywhere.
- **Moves, each told with its own windup + release pose (B16) and sound**: P1 THE BURST UP (bubbles, a bulging plank, red !!, step off), THE DRAG (arm up
  and back dripping weed, a red !!, a red line along the boards to its 118 px reach: JUMP or ROLL it - a hit drags you in), THE PEAT HURL (a scoop, a red !!,
  a red ring where the clod lands). **P2 at 50%: RIP THE ROAD** (the two stretches flash red 1.4 s, he tears them away: three plank islands over the fen,
  every gap 3 columns - a jump for every hero), two clods a hurl. No adds.
- **SFX** (src/audio.js, recorded clips under synth): trollRoar (roar + ogre kit pitched down), trollGroan, trollBubble, trollBulge, trollBurst, trollDragTell,
  trollDrag, trollScoop, trollHurl, trollRip; voice kit ogre @0.55. Boss music: 'boss3' from the BOSS_POOL until Daniel picks (MUSIC NOTES).
- **Wired**: spawn, take, update/draw owners, drawOver, barName, BOSS_T, BEAST_SHORT, COLS, POISE/KNOCK_SKIP, BOSS_FELL 'THE ROAD IS QUIET' + his fall,
  wake roar, boss list, bestiary row + card, boss-greed OPEN_RULE/OWN_WARD (without it greed fired DURING his stuck), boss-read, marks (BY_HAND, MARK by
  tools/tells.mjs --write, ANSWER, HEIGHT), threat, hint-lines SAY_LINES, lab.js bot branch (btPlan: the lure, the bulge, the drag jump, the rip, swims out).

### 3. THE GOBLIN STILT-WALKER (src/stilt-walker.js) - a GENERAL bestiary foe
- `ent('stiltwalker', x, y, { face, horn: true, pack: [{ dx, y, t }] })` anywhere: a CV machine (main.js updateDesertFoe runs stiltStep). Reach frontliner
  (keeps a gaff's length, backs off a closing hero, slow on stilts). **Told DOWNWARD GAFF JAB** (yellow !, its own windup pose: gaff up and back over his
  head): it comes down at a standing hero's head and shoulders - a DUCKED hero is under its box, a shield/parry turns it; SIG row (src/told-attacks.js)
  `duck`: answered by a duck it overreaches. **A LOW blow (the low sweep, the running slide, a heavy from the ground) CUTS A STILT**: he topples (floorFoe:
  BROKEN, drawn down) - the next blow is the foe-pass finisher; up again he is a stiltless goblin with a knife (told stab). **HIS HORN**: seeing you (on
  screen) he winds the Stockade's horn (the same bar, drawHornTell); a stagger knocks the breath out of it; if it sounds his pack comes (hornSounds, packOnly).
- hp 32, jab 14, stab 8. Bestiary row, threat 2.2, heavy role, hurt/death voices (gobbig @1.35), marks/answer/height rows, greybox 13-frame sheet.

## CHECKS (PORT 8781)
- NEW, registered in tools/check.mjs: **fen-road** (56: the road/acts/shrines, bow/sink/float/lashing/barricade/footing in a fake world, the barricade as the
  REQUIRED use by the plain fill, crew gaps, the stilt-walker's told jab/duck/topple/horn, the crossing's islands) and **bog-troll** (39: B15/ward/stuck purse,
  the lure three ways, the rip once and told, B16 poses, the bot, routed lines). Both green.
- **level-quality fenroad CLEARS** (all rows ok; ruleFight WARN report-only for every level; music row ok on the placeholder, REPORT_ONLY kept as the TODO).
- green (node): solid-islands (0 bare), signs, tells (MARK regenerated), answer-tags, voices-check, threat-holes, foe-pass, one-new-foe, dressing, deadends
  (every pocket pays), collectables, floaters, killzones, checkpoints, elites, spawns, comments, dangling-paths, curve-shape, curve-gate, mash-gate,
  map-spacing, map-grammar, map-scale, zoom-coverage, checkpoint-gaps (DENSE report only: shrines 94-104 route tiles, the A10c area structure), stuck --static,
  reach-heroes (all 9 heroes reach every route target with their own legs), boss-music, old-tusker, lumber-trail, marsh2-beats, act-cards, boss-read,
  campaign-order, level-walk-selftest.
- green (page): **textfit --strict levelcard,mapcard,bestiary,plates,bossjump: 0 issues**; **hint-shown**; boss-select; boss-openings; damage-caps;
  untold-told; save-safety; **boss-jump with BJ_ONLY=bogtroll,oldtusker,frog,chief**; **mark-integrity MI_ONLY=bogtroll** (burst/drag/hurl seen, posed, landed);
  boss-greed; audio-assets; the exit flow probe (troll down -> card -> walk to the Stockade's gate -> win).

## STAMPS (level hash final)
- docs/level1-pilot.json fenroad: 13 hits, **0 deaths, 72% hp a run** (3 runs). docs/level1-curve.json: **105% hp, 1 death** in 3 (act I band 40-250% / 0-3).
- docs/mash-bot.json: LEVEL knight/warden/pyro die 4/5/4 times (lowest hp 0%); BOSS **0/6** (boss left 87-91%).

## BOSS RATES (practiced, campaign L3, kit flasks, tools/boss-rates.mjs)
| run | knight | warden | pyro | total | band |
|---|---|---|---|---|---|
| **with flasks, hp 720 (final), 12 seeds** | **8/12** | **7/12** | **7/12** | **61%** | **in band** |
| with flasks, the other six (hp 720, 4 seeds) | paladin 4/4, pirate **0/4**, reaper 3/4 | geomancer 2/4, berserker 1/4 | ranger 4/4 | 58% | (pirate's fights end at 15% left) |
| dry (human+dry, hp 720, 6 seeds) | 2/6 | 2/6 | 2/6 | 33% | reported only |
| mash bot boss | 0/2 | 0/2 | 0/2 | 0/6 | holds |
- FIGHT LENGTH (with flasks): wins 71-144 s, median ~110 s (deaths 49-114 s) - a little over the ~90 s target (QUESTION 2).
- Tuning path (n 4-12 each, noise ~+-15%): hp 1500 -> 1150 -> 1000 -> 900 -> 820 -> 760 -> 720; stuck 3.6 -> 4.2 s, purse 15 -> 17%; burst 16 -> 24, drag
  12 -> 15, hurl 11 -> 15; lock 0.5 -> 0.65 s; rest/swim shortened; one move a surfacing in P1. Found + fixed on the way: greed reprisals firing during his
  stuck (no OPEN_RULE), the hole too wide to reach him from (the wreck's ends now hold, his stuck box is 52 wide), the lab bot holding atk into the bulge.
- hurt by move (diag, tools/bogtroll-diag.mjs): the drag and the burst are what kill (each ~45-60% of what a hero loses); the fen's drain is small.

## LEVEL WALK (tools/level-walk.mjs, campaign L3, human+first, 1 seed a hero, final layout)
All 9 reach the boss; 7 of 9 measured 95% of the route. Deaths 0 for all (act I target 0.5-1.5: soft). Mean shrine arrival: knight 45, pyro 93,
paladin 56, pirate 69, reaper 89, warden 56, geomancer 64, berserker 47, ranger 59 (target <= 65). Left: pyro STUCK once at the elite's gate (202,17),
ranger once at the peat pit (55,17) - bot limits on runs that also passed for others. Walker fix (shared, tools/level-walk.mjs): a swimmer whose route is
above him presses + holds jump (the up key only swam: every fen bank stood him in the water for good) - water levels' walker numbers can move.

## REDS / NOT MINE / NOT RUN
- textfit talk,hints --strict: 4 hits, all in other levels (stockade sign@4 COLLIDE "THE OUTER CAMP" x the warden/reaper control line; fallingtower and fair
  sign COVERS) - not verified on master (no spare master checkout).
- boss-jump full sweep: the page stopped answering mid-list twice (after redgorge, after ksar - a long-run slowdown); BJ_ONLY run incl. bogtroll green.
- NOT RUN: the full suite / QUICK gate, stuck runtime, corpses, foe-pass-page, mobile-perf/frame-cost of the crossing, cast-poses (no such tool on master).

## DOWNSTREAM EFFECTS (merge care)
- Every boss after the Fen Road measures one campaign level higher (campaign-xp: spore 3->4, kings 5->6 ... sealedpyramid 42->43; rootway unchanged):
  the XP of one more level is real. The Stockade is depth 4 now (was 3). No downstream row is re-stamped (their level hashes did not move) - QUESTION 4.
- Shared files: src/main.js (wiring), src/lab.js (bot branch), src/audio.js (SFX + CAST), src/marks.js, src/told-attacks.js, src/boss-greed.js, src/boss-read.js,
  src/elite-kit.js, src/hint-lines.js, src/stuck-spots.js, src/dressing.js, src/threat.js, src/foe-react.js, src/island-posts.js, src/exit-gates.js,
  src/map-blurbs.js, src/level.js (entry, stockade needs, ELITES), tools/level-walk.mjs (swim exit), tools/level-quality.mjs (GATE, roles, REPORT_ONLY),
  tools/one-new-foe.mjs, tools/boss-rows.mjs, tools/curve-shape.mjs, tools/check.mjs, tools/fixtures/campaign-xp.json.
- TRANSITIONS (claude/transwm table, not on master): the Fen Road gets **no transition row yet**. When the table merges, the Wood->Marsh row stands; Marsh's
  next level is the Fen Road now (Marsh->Fen Road and Fen Road->Stockade are new pairs for a later row).

## ART NOTES (the sonnet art lane - everything is greybox; tools/fenroad-shots.mjs [cols] shoots the level and the troll's poses)
- **THE BOG TROLL** (src/bog-troll-hands.js drawTroll + POSE - POSE is the contract; draw from the road's top, the fen line 16 px under it clips him):
  a hunched mossy bulk ~40x56 standing waist-deep, peat caked on him, a small head slung forward, underbite + two tusks, long arms; weed standing off his
  back in P2. Poses (own windup + release, B16): up (hands on the boards), wake/burst (arms up through splintering boards), dragTell (one arm up and back,
  weed dripping) / drag (arm flung flat along the boards, the full reach), hurlTell (leaning down, a hand in the fen, a clod) / hurl (arm thrown forward),
  stuck (sunk to the chest in broken boards, arms flailing, head back, mouth open) / heave (both hands pushing off), ripTell (both hands gripping the road's
  edge) / rip (a length of road torn up over his head), sink, roar. Bestiary card (bakeBogTrollCard). His fall. The BULGE (boards lifting over him, amber ->
  red), bubbles where he swims, the clod + its red ring, the drag's red reach line, the rip's red boards, the splinters, the wreck boards round a stuck.
- **THE STILT-WALKER** (src/stilt-walker.js bakeStiltWalker - 13 frames, the contract): a goblin on two strapped poles with a long boat-hook gaff and a horn at
  his belt. 0 idle, 1-2 stilt stride, 3 JAB WINDUP (gaff up and back over his head), 4 JAB (driven down-forward), 5 HORN (gaff grounded, horn to mouth),
  6 TOPPLE (a stilt snapped, tipping), 7 DOWN (on his back, stilts broken), 8-9 stiltless walk, 10 STAB WINDUP, 11 STAB, 12 hurt. Corpse in his own sheet.
- **THE BOARDWALK KIT**: the goblins' road (T.PLANK runs; today the stockade plank sprite) - split-log boards on lashed pole trestles; the BOWED sections
  (src/fen-road-hands.js drawWorld: rotten darker boards that bend, shiver, sink and float back) and the crossing's ROTTEN ones (a sicker, mossier board);
  the LASHING post (a stake, a coil, the rope to the boards, the frayed stub when cut, its gold glint); the CREW GAPS' piles (today plain dirt columns: draw
  driven stakes) and the freshly laid planks; THE BARRICADE (today a plank stack: road-planks on end, roped, stakes under the water); the crew's landing; the
  LOOKOUT CRIBS (today four earth blocks: draw them as lashed log cribs) and the lookout walk + its crow's nest; the peat trench (cut peat walls, stacked
  peat turves, a cutter's spade, the cutter's shelf); the arm out of the water (SOMETHING UNDER THE ROAD).
- **THE HORIZON PALISADE** (FRH.drawSky): stakes + two horn towers with red pennants on the skyline, small at the start, close at the crossing; the palisade
  and horn tower round the exit gate (the level's exit gate itself is src/exit-gates.js 'marsh': the lashed-timber stockade gate - fits).
- Fen dressing: peat, reeds, cattail, mist (weather), a cold green-brown palette (L.palette dress 'marsh' today), the tints per area in L.tints.

## MUSIC NOTES (Daniel picks; nothing downloaded)
- Level: **placeholder 'sleepers'** (benched "Haunting Chiptune Loop [Void Estate]", Zane Little Music, CC0 - Underleaf's old theme). Candidates (licence to
  be re-read on the page before any download): REC **"Diabolical swamp" - Android128, CC-BY 3.0** (already in scratch/music-dl-1019/2-3-diabolical-swamp.mp3,
  the bolder percussion-led swampy one marsh3 offered for the Frog King); ALT a slow boggy march - OpenGameArt search "swamp march" / "bog" (not searched).
- THE BOG TROLL: **'boss3'** from the BOSS_POOL until picked. REC **"Drums in the Deepwood" - Elyvilon, CC-BY 4.0** (scratch/music-dl-1019/2-2-deepwood-drums.mp3:
  leather drums, heavy - a troll), ALT cynicmusic's "Battle Theme A" (CC0, the sibling of Old Tusker's Theme B) or a composed synth troll theme in
  src/boss-music.js.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **THE LASHING as the verb**: the brief's verb is the sagging boards; to make it a verb you DO (A2) every crew section has a lashing you strike to drop it,
   and the barricade is the required use. REC + BUILT: keep. ALT: a plunge on a bowed section drops it too (no post).
2. **Troll fight length**: wins 71-144 s (median ~110), with flasks 61% (k/w/p 8/7/7 of 12). REC + BUILT: accept for the greybox; the tune lane trims his
   cycle (a shorter ward or swim) after Daniel plays. ALT: hp 600 + harder hits now (rates swing +-15% at 12 seeds).
3. **The other six heroes**: pirate 0/4 and berserker 1/4 (close: 2-15% left), paladin/ranger 4/4. REC: re-measure the six at 8 seeds in the tune lane
   (the lab bot's pirate/berserker hands are weaker); BUILT: nothing hero-specific.
4. **Downstream campaign levels +1** (one more level's XP before every later boss) and the Stockade at depth 4. REC + BUILT: the fenroad XP row only
   (xpSim 509); re-measure downstream bosses in the next act sweeps, not now. ALT: run boss-level --write-xp at integration (it rewrites every row on this base).
5. **Walker deaths 0** (act I target 0.5-1.5; arrivals ~45-93%): REC: leave it for the playtest (the pilot sits in band at 72-105% hp); ALT: one more
   weighty foe per area exam.
6. **Music**: REC Diabolical swamp (level) + Drums in the Deepwood (troll); placeholders built (sleepers / boss3).
7. **Rotten sections float back after 14 s** (so the lure stays possible to the end). REC + BUILT: keep. ALT: once collapsed, gone (the arena shrinks with the fight).
8. **The elite** of the work crews is a SWIFT shield captain (a SHIELDED shield could not be beaten by the walker - double guard). REC + BUILT: SWIFT.
