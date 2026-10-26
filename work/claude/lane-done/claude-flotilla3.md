# claude/flotilla3 - THE FLOTILLA 3 + THE ADMIRAL (Opus greybox, 2026-10-25 15:10-18:20) - PAUSED by the coordinator (18:20, gate122 needs RAM)

## SESSION 2 (2026-10-26 07:35-09:45, Opus, PORT 6601): NEXT STEPS DONE. GREYBOX COMPLETE. READY FOR THE ART SONNET.
- **Status:** all checks are green. Head commit: see the branch tip (claude/flotilla3). Not merged and not deployed. **NOT LIVE-READY:** the art pass must merge first.
- **Rates on the FINAL TUNE** (boss-rates flotilla, human profile, kit flasks, campaign L22, practiced, n=12):

| Hero | Wins |
|---|---|
| knight | 9/12 |
| warden | 8/12 |
| pyro | 10/12 |
| paladin | 9/12 |
| pirate | 7/12 |
| reaper | 7/12 |
| geomancer | 7/12 |
| berserker | 8/12 |
| ranger | 8/12 |
| **Total** | **73/108 = 68%, IN BAND** |

  - How it was measured: the full run (r5) gave 71%. I then re-tuned pyro and pirate, and re-measured only those two heroes on the final TUNE. A hero's TUNE only moves that hero's row.
  - Pyro is the high outlier at 83%. He barely moved between in 1.2 and in 1.3 (11/12, then 10/12 at out 0.85).
  - No hero is at 0. Winning fights took ~93 s on average (practiced).
  - **Final TUNE:** pyro in 1.3 / out 0.85; pirate in 0.95 / out 1.0. Every other hero is unchanged.
- **DRY** (bare flasks, n=4 a hero): 1/4 each for pyro, paladin, pirate, geomancer and ranger; 0/4 for knight, warden, reaper and berserker. That is 5/36 = 14%. It is report-only: the band is read with flasks.
  - That is a big gap between flasks and dry. In this fight the flasks carry the hero.
- **Mash 0/6:** the mash heroes die at 96-98% of his health. The level row was re-stamped too, so the mash table is level THEN boss again.
- **Green:**
  - boss-fight-end: it was RED and I fixed it in the tool. His plate floor read as UNKILLABLE BY SCRIPT, so the tool now holds him bare and staggered, like the other bosses' openings. All 52 arena levels pass, run one level a page.
  - textfit bestiary --strict: 0 issues.
  - mobile-perf flotilla: inside the budget.
  - ambush-listed, ambush-reach, elites, spawns.
  - signs: it was RED (4 Flotilla signs ran to 3 lines) and I cut all four to 2 lines.
  - stuck (static + runtime).
  - corpses: run one level at a time, all 30 levels ok, including the flotilla reskins.
  - killzones flotilla, boss-music, lab-reach, tools/admiral.mjs (all 9 heroes).
  - level1-pilot and curve re-stamped. level-quality: FLOTILLA CLEARS THE BAR.
- **A note for the gate:**
  - boss-fight-end and corpses each STALLED as one whole-game page in my runs. The page sat idle with CPU ~0 until the evaluate timed out (601 s for corpses, and >30 min for boss-fight-end before I killed it).
  - Split one level a page, every level passes.
  - Watch both in the nightly suite. They may stall there too: I saw it twice in two runs. I did not find the cause.
- **After shots:** work/claude/shots/flotilla3/after/{galley,hull,prize,hold,topgun,doors,arena}.png.
  - Before shots: work/claude/shots/flotilla2art/a1/*.png and a2/.
- **Not done:**
  - The SHIP KIT hand-off commit for Hurricane 3 (checklist item 5). It was not in NEXT STEPS, and Hurricane 3 is already running.
  - Ambient gulls and creak, the skiff, and the quarterdeck swivel. They are still for the art lane (list below).


Base 1dacbb8d (BATCH121 LIVE). Brief: scratch/brief-flotilla3-1018.md parts C + D, folded with the approved review scratch/review-flotilla-1018.md.
Part A (deadly water) was not touched. Part B (Champion -> Keep mini) was not done. The Champion is **off the Flotilla but still fully registered**: his fight, hands, art, music, marks, greed and bestiary are all still wired. No level places him until KEEP 2.
Port block 6600 (I used 6601). One browser at a time. No processes of mine are left running. Paused cleanly; everything is committed and pushed. **NOT LIVE-READY: greybox, and the art pass must merge first.**

## Done

### THE ADMIRAL (new boss)
Files:
- src/admiral.js: the fight, pure.
- src/admiral-hands.js: binds him to the world.
- src/redraw/admiral_art.js: greybox art.

**The armour.** Three salvaged hull plates: CHEST, BACK, PAULDRONS.
- A deck gun's round shot, with him in its line, BLOWS A PLATE OFF. A struck-back keg does it too.
- Each blown plate staggers him: OPEN for 1.9 s, then a told 3 s ward.
- There is no refit. All three gone = bare = phase two.
- While armoured, blades CHIP for x0.15 / 0.25 / 0.35 by plates left, with sparks and the word IRON PLATE. This is Daniel's approved exception to the floor.
- While armoured, his plate holds him above 50% health, so the guns are required.
- Openings pay x1 while armoured and x1.6 bare. Outside openings, bare, he takes x1.
- Bare, a ball knocks him FLAT (capped at 6% of his health a knockdown).

**Phase one (armoured).** Every move has its own windup + release pose key (B16):
- CUTLASS, `!`: two cuts.
- BRACE OF PISTOLS, `!!`: an aim line that locks, two shots, then a RELOAD = an opening.
- POWDER KEG, `!!`: he rolls it at you. Jump it, or STRIKE IT BACK and it blows a plate on him.
- BROADSIDE CALL, `!!`: a whistle, then red deck cells, then the shot comes down on them.
- GRAPNEL SWING, `!!`: a landing mark. Cut his line mid-swing and he falls; over the lashing he climbs out SOAKED and OPEN.

**Phase two (bare).**
- A told FIXED LIST: the flagship's deck heels toward the lashing and you slide unless you walk. No rolling deck.
- BOARDING FLURRY, `!`: four cutlass and axe cuts, then THE AXE, `!!`. Missed, the axe sticks = OPEN.
- All the phase-one moves stay.

**Arena and music.** The Champion's lashings stage is kept, with a deck gun at each end and the main yard over the gap. Music is admiral.ogg.

**Wired into the game:**
- main.js: spawn, EHP, update, draw, death, ball, bar, BK hooks, bestiary.
- Everything else: lab.js bot branch (adPlan), marks (BY_HAND / ANSWER / HEIGHT), boss-greed (OPEN_RULE + FULL_DAMAGE), boss-read, boss-pressure, threat, the audio voice, hint-lines (AD_SAY), the modulepreloads.

### THE FLOTILLA 3 (level, src/level.js theFlotilla + src/flotilla3.js + src/redraw/pirate_skins.js)
- **The rule line is the guns:** "STRIKE A BREECH AND THE GUN CLEARS ITS LINE. WHEN HIS FLAG RUNS RED, HIS GUNS CLEAR YOURS."
- **His broadside (src/flotilla3.js), 6 zones:** rock (harmless, the shot falls short), galley, hull wells, chain shot over the rigging, the powder doors, and the exam lane.
  - The tell: a red signal hoist in the play plane, the flagship landmark's hoist running red, the marked row, the gunports glowing, then ~2.5 s to the shot.
  - Cover is anything solid between you and her (new mantlets on the galley and hull decks), or being off the row.
  - A ball costs 25% health with a shove along the deck. It kills his own men and BLOWS COPPER DOORS (the far powder door).
- **THE PRIZE (209-288) replaces the hulk's rot planks:**
  - TEACH: grapnel boarders swing down at you; cut their lines.
  - TEST: fight on the sloop's low deck.
  - REMIX: her SWIVEL, laid down at the hulk's rotten deck with its target drawn first, blows it open. That is the only way past the hulk's deckhouse: down, under it through the flooded hold, up the after ladder.
  - EXAM: a grapnel boarder off the mizzen, a pistoleer, and the SWIFT elite.
- **RIGGING RUN:** the TOP GUN, laid up at a yard's lift, drops a static bridge. This is required and replaces the first moving yard. Then chain shot on his flag.
- **New foe: the GRAPNEL BOARDER.** It is the one new foe (A9).
- **Reskins:**
  - PISTOLEER (marine): two shots, then a reload with x1.6 taken.
  - KEG ROLLER (powder monkey): rolls a keg that can be struck back.
  - PLATED BOSUN (the powder-ship exam heavy).
- **No crabs.** The sailors became cutlasses. The waist ambush is now a pistoleer and a keg roller.
- **Light:** L.tints step from golden hour to night at the lashings.
- **Track gain:** TRACK_GAIN.flotilla 1.0 -> 1.41 (+3 dB).
- **Shrines:** 57 (the waist door), 207, 304 (THE PRIZE's, on mast 302's top), 390, 535.
- **reachcore** knows a laid gun's hole and bridge, and the walker hint fires them.

### Tools
- **New: tools/admiral.mjs**, registered in check.mjs. It has pure, level and page parts; the page part covers all 9 heroes.
- **tools/admirals-champion.mjs** is pure-only until a level places the Champion.
- **Re-pointed:** boss-navigation (his swing), flotilla-route (all 9 heroes; the static top-gun yard), lab-reach, newlevel and boss-greed's DUELISTS list.

## Checks

**Green:**
- **tools/admiral.mjs:** pure, level and page, all 9 heroes.
- **Level-quality: flotilla CLEARS THE BAR.** Every gated level clears.
- **Pilot:** the level1-pilot row (29 blows, 7 deaths) and the curve row (302%, 5 deaths) were re-stamped.
- **Mash:** re-stamped level then boss. The boss holds 0/6 (the mash heroes die at 92-98% of him) and the level holds.
- **Geometry and checkpoints:** solid-islands 0, checkpoint-gaps / stand / checkpoints.
- **Reach:** reach-heroes (all 9 heroes, 0 missing route targets), flotilla-route (all 9 heroes).
- **Foes and marks:** one-new-foe, tells (the MARK table regenerated).
- **Bosses:** boss-read, boss-greed (page), boss-openings (no failure printed), boss-navigation (the Admiral row: a knight win in 158 s, no assert).
- **Files and lines:** blow-tags, modulepreload, dangling-paths, hint-shown, audio-assets.

**Not run (left, because of the pause):**
- boss-fight-end: it was mid-run and I stopped it.
- textfit bestiary --strict.
- mobile-perf flotilla (fps at 4x).
- ambush-listed / ambush-reach / spawns / elites / signs / stuck / corpses / killzones.
- The map-* tools. The road is unchanged, so I expect no change there.
- boss-music. It was started in a batch and its result was not seen.

## Rates (boss-rates flotilla, human profile, kit flasks, campaign L22, practiced, n=12)

| Hero | Wins |
|---|---|
| knight | 9/12 |
| warden | 5/12 |
| pyro | 12/12 |
| paladin | 9/12 |
| pirate | 4/12 |
| reaper | 7/12 |
| geomancer | 7/12 |
| berserker | 8/12 |
| ranger | 8/12 |
| **Total** | **69/108 = 64%, IN BAND** |

- Winning fights lasted 54-159 s, 96 s on average.
- After this run I re-balanced the per-hero TUNE in src/admiral.js:
  - harder for pyro (in x1.2, out x0.95);
  - easier for warden (in x0.9, out x1.05) and pirate (in x0.85, out x1.1).
- **That TUNE is NOT re-measured yet.** The 64% row is for the previous TUNE (commit 94380b0c's numbers + knight/paladin/reaper/geomancer/ranger tune).
- **DRY (bare flasks) not run yet.**

## Reds / known gaps
- Rates need a re-run on the final TUNE (n=12 x 9) plus dry alongside.
- Review fix 6 (move the waist shrine after the ambush) conflicts with checkpoint-gaps' NO DOOR rule. I kept the door shrine at 57; see the questions.
- THE PRIZE's shrine sits on a mast top (304,8). It passes checkpoint-stand, but it is an odd place; checkpoint-gaps' 80-tile MIN is why.
- Ambient additions (gulls, rigging creak, distant guns) were not built. The ship bed is a .ogg file.
- The fisherfolk skiff and the play-plane gulls were not built. Both are cosmetic.
- No swivel on his quarterdeck rail (review item 9).
- Before 15:55 I ran one headless page (hint-shown, ~15:44, 6.4 GB free) before the gate log existed. The gate started at 15:49.

## NEXT STEPS (exact, after gate122)
1. Run these, one browser at a time, each as `PORT=6601 node tools/<t>.mjs`:
   - boss-fight-end
   - `textfit.mjs bestiary --strict`
   - `mobile-perf.mjs flotilla`
   - ambush-listed, ambush-reach, elites, spawns, signs, stuck, corpses, killzones
   - boss-music
   - lab-reach
2. Re-measure the rates on the final TUNE:
   - `PORT=6601 node tools/boss-rates.mjs flotilla --ways=practiced --heroes=knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker,ranger --seeds=12 --profile=human --jobs=1`
   - then the same with `--flasks=bare --seeds=4` (dry).
   - Keep 60-70% and no hero at 0. The levers are src/admiral.js AD.hp (3250), AD.dmg and TUNE.
3. Take after shots: `OUT=work/claude/shots/flotilla3/after PORT=6601 node tools/flotilla2art-shots.mjs galley:60:23 hull:120:23 prize:240:25 hold:258:21 topgun:285:8 doors:488:24 arena:560:24:400`
   - Before shots: work/claude/shots/flotilla2art/a1/*.png and a2/arena.png, fight1.png (the live look).
4. Commit and push. Hand the art list below to an ART sonnet.

## ART SONNET (next)
- **The Admiral's full sheet (src/redraw/admiral_art.js):**
  - coat, tricorn and beard;
  - three riveted hull plates, each removable;
  - every pose key in its header;
  - his death and his card.
- **His arena:**
  - the main yard over the lashing, the grapnel line, the keg, the pistol aim and shot, the broadside cells, the list (the deck heeled), plates falling into the harbour;
  - night lanterns;
  - the flagship stern and gate.
- **The grapnel boarder's sheet:** greybox in flotilla3.js drawBoarder and pirate_skins.js.
- **Real redraws of the reskins:** the pistoleer, keg roller and plated bosun are only tinted recolours today.
- **The flagship and his flags:** the signal hoists, and the FLAGSHIP landmark on harbour.js far/mid with its red hoist. It is a greybox silhouette in flotilla3 drawBack today.
- **The laid guns:** the swivel and the top gun, and the yard cocked on its lift before firing.
- **THE PRIZE:** the sloop hull and raised poop, the hulk deckhouse, the rotten deck patch, the mantlets.
- **Harbour life and audio:**
  - gulls in the play plane, and the petrels redrawn as gulls;
  - the fisherfolk skiff;
  - ambient gulls, creak and distant guns (shared with the Hurricane).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The waist shrine.** The review said to move it after the ambush (~95), but the checkpoint gate wants a shrine before every ambush room.
   - Rec: keep it at 57 (built).
   - Alt: drop the waist's lock-in so it is not an "ambush room".
2. **P2 when bare.** Outside his openings he takes x1 ("full damage" read literally).
   - Rec: keep (built). It is tuned with health.
3. **The top gun is REQUIRED** (the moving teach yard is gone), and the far powder door can be opened by HIS broadside.
   - Rec: keep both (built).
4. **The plate hp floor.** Armoured, he can't be cut below 50% health, so the guns are needed.
   - Rec: keep (built).
5. **The dry rate.** Dry is 14 0x0p+0gainst 68