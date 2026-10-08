# claude/scree2 - THE SCREE PATH 2 (polish pass; scratch/brief-scree2.md)
Branch claude/scree2 off claude/underleafroad c53ece88. PORT 8741.

## What was built
1. ICE -> OCHRE STONE. The Glass Quarry is THE STONE QUARRY: the T.CRYST seam (the cut Suncatcher's floor, cols 543-565 now) is plain floor, with a worked
   quarry face, three stacks of cut blocks (chisel marks, drill lines) and a shear-legs derrick (src/scree-art.js); sign "THE OLD QUARRY...". Everything else
   that read as ice was a scree-only blue-grey bake, all now ochre: scree tops (art.js bakeScreeTop), loose rock (bakeLooseRock + its snap burst), the
   menhirs (main.js bakeMenhir - L.stone is scree-only), the 'stone' standing stones (ochre variant for the scree only), the fold gateposts, the level's dirt
   palette, the old slide's grey boulders. Left as is: the arena's grey-brick shut walls (generic, every boss) - see Q4.
2. THE ROCKSLIDE CHASE (src/scree-chase.js, on src/chase.js's engine). The old slope (265-338) repainted and 96 columns grown in after it: 175 columns crest
   to gorge bank, scree runs, 2-3 wide pits (real deaths), steps up, told rocks off the cliff ahead (6), a FORK (low chute: quick, broken stone at its drops,
   ends in a 3-wide pit / high ledges: slower, two of them loose rock, a thrower on one), harpies and a ram at platforming moments. Front: an ochre boulder heap
   under dust, kept on screen (show), faster than a walk and slowed under you (rubber band) - a hero who stops ~1 s is hit (30, unblockable); never kills,
   the pits do. Told: signs at the shrine, grit off the crest, THE HILL COMES DOWN: RUN!, two warned surges. Shrine before (262) and AFTER (441, the bank);
   re-armed on every death. Run time with real keys 35-51 s (reaper slowest). tools/scree-chase.mjs (in check.mjs): every hero x both lines with real keys.
3. THE RAM LORD (src/ram-lord.js): beast duelist off the chip (FULL_DAMAGE + reason), horns guard by angle (GUARD 'horns': front at his height turned with
   GO ROUND; behind/flank/above land). RULE OPENING: two loose overhangs on dry-stone props in the fold - the prop glints gold (and its fall line shows) while
   he stands under it; knock it out -> ~0.5 s -> STUNNED 3.4 s, gold ring + timer bar, x2. Wall crash = bonus opening, gold now (x1.5, rocks fewer and told).
   3 s told WARD after each (shell + WARDED). P1 his kit (flock call removed: no adds); P2 (66%) the fold's floor becomes scree running to the bank + off the
   wall; P3 (33%) told rock rain + HORN SWEEP (jump it). Burn outside openings x0.35. HP 1950. tools/ram-lord.mjs (in check.mjs). Lab hands play it.
   The overhang is TAUGHT on the road first (B14): 'overhang' gadgets at the cairn field ram pen (teach, sign), the terraces' troll, the bank's elite exam,
   the quarry exam - a foe under one is BURIED.
4. ATMOSPHERE: its own 'foothills' synth bed (gusts, sheep bells, trickling scree, far rockfall, a hawk), dusk light shafts + drifting dust; windmill kept.
5. LEVEL: difficulty v2 - shrines 262 / 441 / 592 (+166), the pasture's and the ropeway's dropped; knolls + stone ledges, quarrymen's lifts, loose rock by
   place; GATED in level-quality (clears: flat 46/51%, bands 41%, mechanics 3 developed). Stuck spots: ropeway lift, crag climb rock.

## Checks (PORT 8741)
green: scree-chase (7 heroes), ram-lord, scree-rework, chase, checkpoints, checkpoint-gaps, signs, boss-greed, boss-read, ram-bank, boss-openings,
rule-openings, weak-bosses, ward-vs-guard, tells, level-quality scree, one-new-foe, goblin-lint, homepaths, level-reach, rule-state.
red NOT mine (pre-existing): dressing (ksar ground kit), sprinkle-cap (rootway squads), dangling-paths (35 cited paths), stuck runtime (rw-cellar-span),
level-quality canal pilot hash / rootway mash.
Tests changed for the brief's approved design (same strictness): boss-greed DUELISTS += ram (+ huntmaster, already in FULL_DAMAGE - that row was red),
boss-read (ram guard 'horns': behind OR air), ram-bank (VM gets ram-lord), scree-rework (loose/broken stone counted on the chase hillside), chase (scree in
the chase list). Fixed: tools/boss-level.mjs --profile regex ([\w+]+).

## Numbers
RAM LORD (L7, campaign level, harnesscard-rates --mode=new, 4 seeds/hero, HP 1950). TARGET CHANGED mid-lane (B6): WITH FLASKS (BOT_PROFILE=human) 60-70%:
- WITH FLASKS (human): knight 2/4, warden 2/4, pyro 4/4 = 8/12 (67%), in band, no hero 0/N; fights 57-125 s (pyro 57-72).
- DRY (human+dry): knight 1/4, warden 3/4, pyro 3/4 = 7/12 (58%).
- Mash 0/6 (re-stamped, level row first then boss). Before: 75% dry (k1 w4 p4), fights 20-54 s, on the chip at 360 hp.
- Tuning path: 1500->1300->1700->1400->1750 (dry 58%), then flasks 1750 = 92% -> 2100 = 58% -> 1950 = 67%.
Level: walker (campaign L7, human+first, 1 seed) deaths knight 1 / warden 1 / pyro 0 (base: 3/0/3), arrivals 56-79% (base 54-82%); STUCK spots 210,4
(the mill ridge) and 523,13 (crag climb) are the walker's on base too. Mash LEVEL: no hero clears (deaths 16/1/2), BOSS 0/6. Pilot + curve rows written.

## QUESTIONS FOR DANIEL
1. PLAYTEST GATE: the reworked Ram Lord needs your play (B9). Built as above.
2. Chase length: 35-51 s real-key runs (brief 30-40). Rec: keep (a person is slower than the bot, a hesitation costs a hit). Alt: SPAN 96 -> 72.
3. The knight's bot braces the charge on its shield (the slope's sign says BLOCK TO BRACE). Rec: keep - a shield SHOULD stop a charge (no wall opening then).
4. The arena's shut walls are the generic grey brick (every boss) - they still read a little icy here. Rec: an ochre dry-stone skin for this fold only (art lane).
5. Pyro is the strongest hero here (fast kills even with burn x0.35 outside openings). Rec: watch in playtest before any hero-specific number.
6. Music (download nothing): level - "Mountain Theme Loop", beardalaxy, CC0, https://opengameart.org/content/mountain-theme-loop ; "Mist Covered Mountains",
   Bo Jingles, CC-BY 3.0, https://opengameart.org/node/123220 ; Ram Lord - "Heavy Boss Battle 1", MintoDog, CC0 (per search: read the page's licence before
   use), https://opengameart.org/node/183631 .

## MUSIC + PEN WALL (2026-10-08, screemusic lane; Daniel approved the download)
- Licences READ ON THE PAGES: "Mountain Theme Loop" (beardalaxy) CC0; "Heavy Boss Battle 1" (MintoDog) CC0 (page, not just search results).
- audio/mountain.ogg = Mountain Theme Loop (12.3 s loop, stereo, +3.5 dB w/ limiter, vorbis q5, -14.5 LUFS) -> THE SCREE PATH level music (was theme4 Junkala "Level 1": retired, file + TRACK_GAIN + sound-test entry removed).
- audio/ramlord.ogg overwritten with Heavy Boss Battle 1 (108 s, -2.3 dB, q5, -13.3 LUFS) -> Ram Lord boss music (was HydroGene "Strong Boss"). Key names unchanged for the boss; new 'mountain' key for the level.
- Credited: audio/CREDITS.txt, MUSIC_CREDITS (+ sound test), src/credits.js CC0 rows (credits page).
- The 'foothills' synth AMBIENT bed (gusts, sheep bells, scree) is kept: it is the atmosphere under the music, as the Rootway keeps its bed under its track.
- ART: src/scree-art.js bakeOchreWall + TILE.ochreWall; the Ram's arena walls use it (setWall, boss 'ram' only); other bosses keep the grey drystone.
- Checks green: audio-assets, boss-music, soundtest.
