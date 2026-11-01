# claude/bogtroll2 (OPUS) - BOG TROLL 2 + FEN ROAD fixes (Daniel 11-01 07:42-07:43, "Yes this works")
Brief: scratch/brief-bogtroll2-1101.md (the 4 approved items + build notes). Branch claude/bogtroll2 off 0fe14c26 (BATCH135). Not merged, not deployed.
Stills: scratch/lane-reports/bogtroll2-shots/ (rotten-before(-zoom), pinned(-zoom), rotten-after-topple, rotten-after(-zoom), rebuilt(-zoom), wave-tell, wave-crest(-zoom), pile-tell, pile-wind(-zoom), pile-swing, stilt-bothy, stilt-lookout).

## WHAT WAS BUILT
### 1. STILT-WALKERS FLOATING -> on real footing + a lint
- Cause found: the bothy lookout (col 79, beat 3) walked his beat THROUGH the bothy hut (the "mushroom"); the lookout-deck walker (248, beat 2) strode off the deck's end
  (col 251) and stalled mid-step with a stilt planted on air (the "float"). Moved to 76/beat 2 and 246; his horn pack's spitter re-aimed onto the crib (238).
- Whole level checked: also the trench sprig spawned over the pit (now in it, 42,24) and the yard shield stood in the timber dressing (now 123).
- Runtime guard: src/stilt-walker.js never lifts a stilt toward a column with no footing (main.js passes w.ground = cvGround) - his beat turns back at an edge (reuse-safe).
- NEW tools/foe-footing.mjs: every placed foe has footing under its feet and is not inside rock; every stilt-walker's beat (+stride) is on footing and clear of dressing;
  every horn pack spawns on footing. fenroad strict (exit 1), every other level REPORT-ONLY (counts printed; mostly flyers/sea birds + foes beside sprinkled dressing).
### 2. +2 ATTACKS (one per phase, both bridge-themed, told)
- P1 THE WAVE SLAP (one dive in 4): he goes under, surfaces at the crossing's FAR edge, both arms up over the fen (pose waveTell, red !!, "JUMP THE WAVE", sound trollSlapTell,
  a ripple line runs out across the water, blinking red at its head), then SLAPS (pose waveSlap: arms flat on the water, spray; sound trollSlap + wave). A crest runs along under the
  boardwalk at 175 px/s lifting each board in turn (drawn lifted with a dark gap); a hero on the boards is thrown (10 dmg, kicked up, shoved on: "THE WAVE THROWS YOU"); a jump clears it.
- P2 THE PILING SWING (every 3 moves at most, in range): he wrenches a support post out of the wreck (pose pileTell hauling, red !!, "HE WRENCHES A POST OUT", sound trollWrenchTell ->
  trollWrench) - the board over it goes into the fen (ONE MORE GAP, chosen so every water stays <= 3 columns and every footing >= 2 boards; none left = a post from under the wreck,
  no gap) - winds it back over his shoulder (pose pileWind, the arc drawn red), swings it round (pose pileSwing, trollSwing whoosh): a 146 px arc at 12-30 px over the road
  (a standing or ducking hero is in it) - ROLL under it or JUMP it. 14 dmg + knock-back.
- marks.js rows (waveTell !!, pileTell !!, pileWind quiet second beat), answers (jump / dodge), heights. B16: each its own windup + release pose (tools/bog-troll.mjs).
### 3. THE BREAK LOOKS RIGHT + THE STUN IS CLEARLY CAUSED
- The floating signs/torches were the work-site dressing (fen_site_art) laid on any board, incl. bowed sections and the crossing. It now keeps off every board that can go
  (sections, crew gaps, peat holes, the whole crossing).
- The crossing's own props (torches on posts on each rotten section, red-X crew warning boards on the two rip stretches, pennants, end torches) BELONG TO THEIR BOARD: when it goes
  they topple sideways into the fen (splash + plop; a torch hisses out in steam, "THE TORCH HISSES OUT" once). Nothing floats (tools/fen-road.mjs).
- Rotten sections read rotten BEFORE use: greener-black mossy cracked boards, and X-braced CROSSBEAMS with weed drawn under them down into the water (drawn in the troll's overlay
  pass so the fen's surface does not hide them). Wrecked: the beams hang snapped into the water, splinters at the breaks.
- STUCK = PINNED: the stuck pose carries the section's two crossbeams across his shoulders + boards on his head, stars circling; "PINNED UNDER THE WRECK" (bar still says STUCK).
### 4. THE ROAD DOES NOT REPAIR
- SAG.regrow removed. A crossing section that breaks (his burst, your weight past its hold, a ward-bounce, the rip) is wrecked FOR GOOD: middle boards in the fen, end boards hang on.
- The crossing now has two PEAT BANKS (407-409, 446-450) with a crews' PLANK BUNDLE on each: stock 3, refills one per 6 s (drawn: planks left, a refill tick) - never a soft-lock.
- Every open stretch of the crossing is a LAY slot (wreck hole, rip stretch, post gap); a laid plank is an arena section that SAGS like a rotten one (3.6 s hold) = his next lure;
  he can burst under it and be pinned again. Never laid on top of him (trollAt). Hint once as he tears free of the first wreck: "THE ROAD DOES NOT MEND. TAKE A PLANK ...".
- P2 RIP THE ROAD tears the two stretches AND every section still standing - rebuild your lures from the islands.
- Never stranded: water gaps are always <= 3 columns (a jump for every hero; carrying, you lay it instead), the banks are solid, the safe-spot return lands on sound boards.
- Bot (src/lab.js + btPlan): fetches a plank when <= 1 lure stands, lays it at the nearest broken edge (E), never swings/jumps with it; jumps the wave's crest; rolls/jumps the post.
### Numbers changed
BT.hp 680 (unchanged - 640/660 were tried: 77%/74%), stuck cap 0.20 -> 0.25 (the lures are finite now; 4 pins + chip kill him), new BT.wave / BT.pile blocks. Ward 3 s, hide 0.4, stuck x2 unchanged (B15 intact).

## RATES (profile human, campaign L3, kit flasks, tools/boss-rates.mjs practiced)
FINAL (hp 680, purse 0.25, wave 10 dmg / every 4th dive, swing 14 dmg / every 3 moves, bundles 3 + 1 per 6 s):
| run | kn | wa | py | pa | pi | re | ge | be | ra | pooled |
|---|---|---|---|---|---|---|---|---|---|---|
| 9 heroes x4 (5 page crashes from memguard under RAM pressure -> n=31) | 3/4 | 1/4 | 3/4 | 3/4 | 2/3 | 1/2 | 2/3 | 3/3 | 3/4 | **21/31 = 68% in band** |
| + kn/wa/py x6 (n=16) | 4/5 | 2/6 | 3/5 | | | | | | | 9/16 = 56% |
| **pooled hp 680, n=47** | 7/9 | **3/10** | 6/9 | 3/4 | 2/3 | 1/2 | 2/3 | 3/3 | 3/4 | **30/47 = 64%** |
- Fight length: wins median **97 s** (48-148), deaths median 120 s (was ~91 s on master: the finite lures add a plank run or two).
- No hero at 0; the WARDEN is the weak one (3/10) - her bot holds a long point, gets dragged and pays the post's arc; flagged for the tune lane (n is small).
- Tuning path: first pass 17% (finite lures, bot fetched a plank only at zero lures, purse 0.20) -> 50% (bot pre-fetch at <=1 lure, bundles 3/6 s, purse 0.25, wave every 4th) ->
  56% k/w/p (swing 18->14 + every 3, wave 12->10) -> hp 640 77% / 660 74% (9 heroes) -> back to 680: 68% / pooled 64%.
- Mash: boss 0/6 (boss left 70-95%), level re-stamped. Dry not run (time; tune lane).

## CHECKS
- tools/bog-troll.mjs 63/63 (new: wave told + crest throws grounded / clears jumping, swing P2-only + told + post pulled + box duck-in/jump-clear, B16 poses, PINNED, bot crest/post/planks)
- tools/fen-road.mjs 215/215 (new section I: wreck stays 40 s, wreck = slot, lay -> sags -> wrecked again, rip tears standing sections, post keeps gaps <=3 / footing >=2,
  bundles run out + refill, props topple + hiss, site dressing off breakable boards; stilt-walker never strides onto nothing)
- tools/foe-footing.mjs (NEW) fenroad clean (found 5: bothy beat, deck-edge beat, pack spitter, trench sprig, yard shield - all fixed)
- level-quality fenroad CLEARS THE BAR (pilot re-stamped: 240% hp lost a run / 4 deaths over 3 runs, in band 40-250; mash level + boss re-stamped)
- level-reach ok; reach-heroes fenroad 0 for all 9; solid-islands ok; floaters ok; tells ok (marks rows added); dressing ok
- mark-integrity (MI_ONLY=bogtroll): drag/burst/hurl/WAVE told, posed, land (the piling swing not reached in its short run)
- boss-rates as above
- textfit: hints scope ok (101 screens); boss scope did not complete (page crash / Input timeout twice under RAM pressure from the other lanes) - NOT RUN; new strings are
  floating callouts (no box) and one hint the length of the existing troll hint.
- Process note: I mistakenly ran tools/check.mjs --list during gate136 (it starts the suite) and stopped it within ~2 min before it spawned anything; nothing of the gate was touched.
  Two headless runs (pilot, final stills) started with free RAM just under 1500 MB.

## ART LANE - next (sonnet)
- Redraw the greybox: POSES waveTell (arms high, water pouring off, roaring), waveSlap (both palms flat on the fen, a wall of spray), pileTell (hauling a post up out of the wreck,
  braced), pileWind (the post back over his shoulder), pileSwing (the swing's follow-through, smear frame), PINNED (the beams/boards across shoulders + head - now drawn as boxes
  in src/redraw/bog_troll_art.js p.pinned; stars from bog-troll-hands drawOver).
- PROPS: the support post (black pile, peat foot, frayed lashing); the crew warning board (red X) and the topple/sink animation (src/redraw/fen_site_art.js drawProp), a steam puff sprite.
- THE CROSSING: crossbeams under rotten sections (src/redraw/fen_road_art.js drawCrossbeams) - real timber bracing with moss/weed; the snapped hanging beams; the two peat banks'
  edge tiles; the wave crest (lifted boards, swell, spray - drawn in bog-troll-hands drawOver); the empty-bundle sawhorses + stock pips.
- SOUND: the new SFX are synth placeholders (audio.js trollSlapTell/trollSlap/trollWrenchTell/trollWrench/trollSwing/propPlop/torchHiss) - real recordings if the sound lane has them.

## QUESTIONS FOR DANIEL (rec built)
1. P2 rip tears EVERY standing section too ("tears what's left") - so P2 always starts with a plank run. REC + BUILT: yes, as approved. ALT: rip only the two stretches.
2. Your weight past its hold also wrecks a crossing section for good (consistent "nothing repairs"); stand too long and you spend your own lure. REC + BUILT: yes. ALT: crossing
   sections only bow under you, only he breaks them.
3. Bundles refill one plank per 6 s, stock 3 each bank. REC + BUILT. ALT: endless bundles (no waiting, less tension).
4. The post gap is 1 column (always a hop). REC + BUILT: keeps every hero safe. ALT: 2 columns (more road lost, a jump each).
5. Stuck purse 0.20 -> 0.25 (HP kept 680) so the finite-lure loop lands near the band; the tune lane sets final numbers. REC + BUILT.
