# claude/frogking2 - RAFT RECALL + THE FROG KING'S PAD CHASE (opus)

Base: live master 5586a595 (BATCH110). Brief: scratch/brief-playtest-1021b.md item 2. PORT 8791, one headless Chrome at a time (RAM-gated), only my own PIDs.
Helpers in work/tmp-frogking2/ (uncommitted). Not merged, not deployed.

## 1. RAFT RECALL (src/main.js recallRafts; new check tools/raft-recall.mjs, in the suite)
- **What was wrong:** a DEATH already rebuilt every raft at her dock (spawnEntities). A FALL did not: the marsh's biting water is a swim since claude/deadwater
  (a drain, no hand-back), so you swam out to the bank and she was left out on the water - a called raft crawled home ('COMING BACK' at 0.6x her pace,
  half a minute on the grove raft), and a raft on the CURRENT (reed run, boom) never came home at all: a soft-lock until you died.
- **Now:** whenever a hero stands up on a raft's DOCK SIDE - out of the water after any swim, a hazard hand-back (other waterHurts levels), or a respawn -
  every raft nobody living rides is AT HER DOCK THAT FRAME ('THE RAFT IS BACK', a splash): toll stays paid, frogs that climbed aboard drop off, the boom
  raft's state resets. A ridden raft is never recalled; climbing out on the FAR side leaves her where she is.
- Shared system -> applied to every raft in the game: marsh grove raft (callId), marsh ferry, reed-run + boom current rafts, the Long Water's free ferry.
- **tools/raft-recall.mjs (page):** per raft: fall mid-crossing -> swim -> out on the dock side -> docked that frame, frog off, toll kept; ridden raft kept;
  far side kept; death mid-crossing -> wakes with her docked. GREEN 5 rafts / 2 levels. tools/rafts.mjs (the slow-return contract for a hero who simply
  walks off) and tools/raft-call.mjs stay green.

## 2. THE FROG KING: THE PAD CHASE (rec build)
**The court (src/frog-court.js, applied after marsh3):** the shallow pond + dais are gone. 77 columns (+33) of the marsh's BITING WATER with THREE ROYAL PADS
(solid, 7/7/12 cols: 705-711, 726-732, 747-758 throne bank) and a LANE of four lily pads before each (691-704, 712-725, 733-746) - the level's verb: yellow
leaves SINK, cool-green ones HOLD (each lane starts with a mix). Entry bank 683-690 (wake trigger 689); shrine 667 before it as before.

**The fight (src/frog-king.js FK + header; machine updateFrog in src/main.js):** he wakes on royal pad I. On his pad he is ALWAYS HITTABLE at 1x (no hide,
B13). Take FK.quota (22%) of him there - or stand on his pad FK.stay (20 s / 16 s in P2) - and he LEAPS (told crouch '!', a 1.2 s arc) to the next
royal pad, on along the court and back (I -> II -> III -> II -> I ...). As he lands the LANES RESHUFFLE: every leaf in a lane no hero is in goes under
0.9 s and comes up re-spaced, firm/sinking re-dealt (FK.firm 2 of 4 hold in P1, 1 in P2). Falling in = the marsh's drain swim (climb out, recall-safe).
Told moves (B10/B16/B17 four+), each its own windup + release pose:
1. **TONGUE LASH** tongueTell '!' (frames 7/8): aimed at the height you stood at - shield (bites his tongue: DAZED x2) or jump it. Taken: on his pad it reels
   you to his feet; anywhere else it drops you IN THE WATER. 12 dmg (own number now, FK.tongue.dmg; was DMG.tongue 20).
2. **SPIT** spitTell '!' (NEW poses 18/19, greybox): three globs LOBBED onto where you stand (crosses the lanes), twice in P2 - shield or move.
3. **BELLY-FLOP** flopTell '!!' (9/10): a shockwave both ways over the whole court - on a bank/royal pad it hurts (jump), on a leaf it SINKS THAT LEAF
   under you ('THE WAVE SINKS YOUR PAD'). Then he lies WINDED 1.6 s (x1.5) - the reward for being on his pad.
4. **FLY SWARM + SNAP** swarmTell (quiet) / snapTell '!' (11/12/17): lead the flies onto his head on his pad -> he BITES HIMSELF (DAZED x2).
5. **THE LEAP** crouch '!' (3/4/5): land on the hero = a blow, nothing opens; land on a raised SHIELD = TURNED (DAZED). In the air he takes 0.4x ('IN THE
   AIR', B15 floor).
- **P2 at 50% - HIS POND STIRS** (croak2, pose 13): yellow leaves sink 1.6x faster, only one leaf in four holds, tongue reach 175 -> 210, spit twice, gaps
  1.0 -> 0.8 s, stay 20 -> 16 s. (Raft-as-P2 NOT built - question 1.)
- Openings DAZED x2 / WINDED x1.5, each window capped at FK.take (8%) of him, overflow at 1x. HP 1500 at campaign L3 (was 740 with a 0.5x hide).
- Kept: his music fix (frogking.ogg, untouched), his sprite + poses 0-17, the flies, the tongue reel. Retired: the shallow pond, croak-deep phase, plug
  drain + pit, croak ripple / tipped-pad fling, the slap, the breath-in, hopAway, the hoppers he croaked up (no adds now).
- Bot hands (frogPlan) rewritten: crossing leaf to leaf (waits for reshuffles, backs off sinking leaves, waits on firm footing for his blows), swims out
  to the nearest footing, fights on his pad.

## NUMBERS (boss-rates practiced, profile human, kit flasks, campaign L3)
| run | knight | warden | pyro | total | band | fight (wins / all) |
|---|---|---|---|---|---|---|
| **with flasks n=24 (final, hp 1500)** | 12/24 | 23/24 | 10/24 | **63%** | in band | 75 s / 79 s |
| with flasks n=12 (hp 1250, before the tongue went 20->12) | 8/12 | 10/12 | 6/12 | 67% | | 68 s |
| dry (human+dry) n=6 | 3/6 | 6/6 | 1/6 | 56% | reported | 74 s |
| mash bot boss (--write) | 0/2 | 0/2 | 0/2 | **0/6** | holds | boss left 100% (dies in the water) |

**All 9 heroes route and win >= 2/6** (n=6, hp 1500): paladin 4/6, pirate 3/6, reaper 4/6, geomancer 2/6, berserker 2/6, ranger 2/6 (+ k/w/p above).
Geomancer at n=12 (hp 1250) was 4/12 - he is the weakest (low DPS, long fights ~84 s).

## CHECKS (green unless noted)
node: marsh2-beats (King section RE-PINNED to the chase: told moves + marks, own poses incl. spit 18/19, no hide, 0.4x air, quota/stay/leap/reshuffle,
P2 stir, court = 3 royal pads over 3 biting lanes with firm+sinking leaves, King on pad I, throne on pad III, raft recall present), tells (MARK
regenerated --write), answer-tags (stale breath/ripple/slap rows removed), hint-shown (new lines routed; silent list shrunk --write), boss-read, rafts,
lethal-water (marsh 13 -> 16: the court's three lanes, listed), signs, solid-islands, checkpoints, checkpoint-gaps, elites, spawns, one-new-foe, marsh-exam,
level-quality marsh (CLEARS), stuck --static, boss-music, music-priority, audio-assets, deadends, collectables, threat-holes, firedrop-plunge, comments,
dangling-paths, node --check on every touched file.
page: raft-recall (new), raft-call, lethal-water (page), boss-openings, reed-island, firsthour (RE-PINNED: spits all told; leap carries him to pad II, onto the hero -> no opening, onto a
shield -> DAZED; a blow on his pad 10 / in the air 4 / dazed 20; pond stirs at 46%, sink x1.6), boss-greed (all bosses hold), hint-shown runtime,
textfit hints,bestiary,boss,worldplates --strict (0 issues of mine; 1 OFFSCREEN '!' in the MINECART mini, main.js ~27981 - not frog, not touched here).
NOT RUN: the full suite, cast-poses, mark-integrity, boss-jump/boss-select, walker per hero over the whole marsh.

## RE-STAMPS (level hash moved: the court)
docs/level1-pilot.json marsh (L1 knight 138%/0 deaths), docs/level1-curve.json marsh (167%/2), docs/mash-bot.json marsh LEVEL then BOSS (level: all die;
boss 0/6).

## REDS / KNOWN
- Fight length ~75 s on a win (brief: ~90 s). Longer by hp pushed the rate under the band; 75-80 s is where 63% sits.
- Hero spread is wide: warden 23/24, knight 12/24, pyro 10/24 (the warden's long reach works the narrow royal pads best); geomancer/berserker/ranger 2/6.
- Bot noise run to run is +-10 points at n=12 (fixed seeds, but every bot change moves them); the n=24 is the number to read.
- The court's water draws with the lethal look (drawDeadWater) like the rest of the marsh - fine, but the ROYAL PADS are plain dirt tops (art lane).

## ART NOTES (sonnet art lane)
1. ROYAL PADS (src/frog-court.js ROYAL, cols 705-711, 726-732, 747-758 rows 18+): today solid dirt blocks - draw each as a GIANT ROYAL LILY PAD standing on
   a thick stem/root out of the water (deep green, gold-veined, a notch, a lotus flower; III = his throne bank with the throne on it).
2. LANE LEAVES: src/redraw/lilypad.js already tints sink (yellow-olive) vs hold (cool green) - add the RESHUFFLE read: a leaf going under with a swirl and
   coming up somewhere else (shufTo set while slapT > 0), and the ROCK when the flop's wave passes (m.rockT).
3. THE FLOP WAVE over water: M2A.flopCrest runs along the water now too - a water-ring crest over the lanes (not dirt clods) when w.y is over a lane.
4. NEW POSES (src/redraw/frogking.js 18/19, greybox): SPIT windup (cheeks blown green, head back) and release (head thrown forward, three globs).
5. THE LEAP between royal pads: frames 4/5 at a 165 px arc - a trailing water spray and a big splash-down ring on landing; HIS POND STIRS (pose 13) wants a
   whole-court ripple.
6. 'THE RAFT IS BACK': a small splash at the dock is all it draws - a pole-man/raft bump art optional.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. P2: REC + BUILT "HIS POND STIRS" (yellow leaves sink 1.6x faster, 1 in 4 holds). ALT (your alternate): a big steerable raft with pad sections for P2 -
   a second lane-sized build (raft steering + his attacks on it); say so and it is its own lane.
2. Fight length ~75 s vs your ~90 s. REC keep (in band at 63%). ALT: hp 1700 + a gentler spit (~90 s, rate ~60%).
3. The stay timer (he leaps after 20 s with you on his pad even if you have not hurt him). REC keep ("on a timer" from the brief). ALT: quota only.
4. Raft recall also fires when you swim back to the dock side WITHOUT having been on her (e.g. any swim near a dock) - REC keep (harmless: she just waits
   at her dock). ALT: only the raft you fell off.
5. Croak summons: NOT built (no adds - B-rule). REC keep it add-free.

## FILES
src/frog-court.js (new), src/frog-king.js, src/main.js, src/lab.js, src/level.js, src/redraw/frogking.js, src/marks.js, src/hint-lines.js, src/boss-read.js,
tools/raft-recall.mjs (new), tools/check.mjs, tools/marsh2-beats.mjs, tools/firsthour.mjs, tools/lethal-water.mjs, tools/hint-shown-silent.txt,
docs/level1-pilot.json, docs/level1-curve.json, docs/mash-bot.json.
