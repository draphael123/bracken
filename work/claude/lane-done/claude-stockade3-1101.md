# STOCKADE 3 (11-01) - the three verbs together + the Chieftain uses them - LANE REPORT
Branch **claude/stockade3-1101** (claude/stockade3 was taken: the merged 10-22 visuals lane; its report claude-stockade3.md is kept). Off origin/master
0fe14c26 (BATCH135), smallfix6 merged in. Brief: scratch/brief-stockade3-1101.md. Not merged, not deployed. GREYBOX for the new pieces - art lane next.

## WHAT WAS BUILT
LEVEL (src/level.js, src/stockade-hands.js, src/stuck-spots.js):
- **The horn comes early.** The Watchpost blower (the level's first horn tower, col 95, THE OUTER CAMP) drops his horn - the rule turns into the verb
  in the first area. The Watchtowers' dozer stays as the second chance, smallfix6's spare horn as the third.
- **A log pile in every area's exam** (the tunnel excepted - the held breath, underground):
  OUTER CAMP - taught safe on the gantry's end over a cook fire (2 cook sprigs; sign); THE YARD - a pile on a beam over the KENNEL YARD ambush,
  cut at a floor PEG; WALL WALK + KENNELS - a pile hung in the wall walk's breach over the ditch crew; WATCHTOWERS - the cook fire (as built), the
  gate fork (below) and tower three's deck end over the walk down (its pack, if its horn sounds); GREAT HALL - two hall piles (boss).
- **New pile kinds:** `cleat` (tied off at a floor peg, cut from the floor out from under it), `ramp` (lands as a step-heap of one-way logs and
  STAYS DOWN for the run), `floor` (lands on a walk), `hall`.
- **THE BARRED GATE is the quiet/loud fork.** The gate tower is a gallows on stilts (no rope); its logs hang over the gate's mouth, tied off at a peg
  under the gallows. LOUD: horn -> the gate opens -> the crew run out under the logs -> peg -> CRUSHED. QUIET: peg first -> the logs land as a stair ->
  climb onto THE GATE WALK (plank catwalk over a 5-high gate, row 14) -> over the sleeping crew onto tower one's rope. One pile: drop it early for
  the stair or save it for the crush. No horn = the quiet way always works.
- **The horn opens more than one gate:** the barred gate AND every crank gate (outer camp 141, yard 210, armoury 316) - their crew wind it open
  from inside (told). Cranks still work.
- Stuck guide: the fork's step points at the peg ("NO HORN? STRIKE THE PEG UNDER THE GALLOWS: THE LOGS MAKE A STAIR").
BOSS (src/stockade-hands.js chiefLure/chiefLured/crushChief, src/main.js ctx: setCells/openCrank/heal):
- **HE HEARS THE HORN:** blown while he is on his feet between blows (walk/landed/toRack/recoveries), he stops ('?' + told line), walks to the hung
  hall pile nearest where you blew (hops the dais), looks up 1.7 s (1.3 s in P2) or stands 0.8 s turned to the sound if no pile is near. A blow
  breaks it; at your elbow while he looks, he sees you. Cooldown 10 s (an early blow: HE IGNORES IT). Not during windups, not on the tower.
- **Two hall piles** on the rafters by the doors, each peg on the DOOR side (he comes from the middle and never walks past you). Landed on him:
  CRUSHED - a 4% knock + planted (x2, his quarter cap) 2.8 s. **Once an attempt each** (re-hung on a death) - the pick: two earned openings, not a loop.
- **His crew as fodder:** the war-horn crew enter at the doors under the piles; your horn now sends them home UNDER the hung logs; a crew crushed
  under a hall pile: CRUSHED: +HEALTH (10% of yours, once a pile).
- Practice/boss select: a fight begun without a horn is handed the hall's (A HORN HANGS BY THE DOOR). P2 war tower, his war horn silence, HORN
  ANSWERS HORN, kegs: unchanged. Racks moved by the throne (club 598, bow 601), brazier to 603.
- Bot (src/lab.js): goes to the peg side, blows when he is lureable and near, strikes the peg when he stands under; routed through the decision chain.

## WIN RATES (boss-rates, practiced, profile human, flasks kit, L4, normal)
| hero | knight | warden | pyro | paladin | pirate | reaper | geomancer | berserker | ranger | pooled |
|---|---|---|---|---|---|---|---|---|---|---|
| branch | 2/5 | 3/6 | 5/5 | 6/6 | 3/6 | 3/5 | 3/6 | 4/5 | 4/5 | **33/49 = 67% (in band)** |
k/w/p 10/16 = 63%. Master baseline (same tool, k/w/p n=6): 4/6 5/6 3/5 = 71%. 5 fights lost to page crashes (memguard; machine at <1 GB free).
Fight length: wins mean 72 s (master 71 s), all fights 78 s. Per fight the bot lured 1.3x, crushed him 1.1x, crushed crew 0.06x.
Spread: knight 40% LOW-ish, pyro 5/5 + paladin 6/6 HIGH (n small). Tune lane: n=12 per hero, watch knight/pyro/paladin.

## CHECKS
- GREEN: tools/stockade3.mjs (new: static + page; reach BOTH choices x 9 heroes: gate open/no stair -> hall, gate SHUT + stair -> hall, shut + no
  stair -> NOT past the gate), stockade2, chief3, stockade-horns, stockade-nohorn (smallfix6; blower selector now the dozer), level-quality stockade
  (CLEARS THE BAR after restamps), deadends (5/5 paid - the pit pocket under tower one's rope got 4 coins), reach stockade, reach-heroes stockade (0),
  signs, platforming lint (2 sections kept; tool copied from claude/platlint), mark-integrity (bzchief SKIPPED - page crash, unrelated), mash
  (boss 0/6, level not cleared), pilot/curve/mash rows restamped.
- PARTIAL: textfit (TEXTFIT_LEVELS=stockade): signs/talk scopes ok, the "bossfix" scope crashed (RAM). Re-run in the gate.
- Not run: the full suite / check.mjs (the gate's job).
- Process notes: one page run happened while GATE-RUNNING.flag was up (~08:10, 5.9 GB free - my mistake), and mark-integrity started at 1.2 GB free.
Stills: scratch/lane-reports/stockade3-shots/{fork,stair,loud,loudCrush,lured,crushed}.png (tools/stockade3-shots.mjs).

## SMALLFIX6 OVERLAP
Merged origin/claude/smallfix6. Conflicts in level.js (the gate block, L.stockade) and stockade-hands.js (STK_SAY, reset, drawWorld) resolved keeping
both: the spare horn on its post (u39) + its sign (u40) beside my peg (u37) and stair. The quiet way also removes the soft-lock independently.

## FOR THE ART LANE (sonnet, next)
1. The gallows on stilts (stkTowers body now rows 8-14; stilts to the floor), the peg + rope to the logs, THE GATE WALK over a 5-high gate (reads as a
   gatehouse fighting platform), the log STAIR (step-heap; greybox log ends drawn in stockade-hands drawRamp).
2. The pegs everywhere (yard beam pile, hall piles) - a real cleat/belay post; the yard's beam; the hall piles' rafter beams.
3. The Chieftain: a LURED pose (head turned up, '?' is greybox) and a CRUSHED pose (pinned under logs; uses the blasted frame 27 + dust now) - B16.
4. Sign at u40 (smallfix6) stands where the stair lands - consider moving it a tile left.
5. Shots to retake after art: the six above.

## QUESTIONS FOR DANIEL (built the rec)
1. Hall piles drop ONCE an attempt (no re-rig)? **Rec: yes** (built) - two openings a fight, the rest his kit; in band at 67%.
2. The horn now comes from the FIRST blower (outer camp) - the Watchtowers' "dozer teaches the horn" becomes the second chance. **Rec: keep** (built).
3. Crushing his crew heals 10% (once per pile) - or a flask sip instead? **Rec: the heal** (built; cheap, told).
4. The tunnel has no pile (it's the breather). **Rec: keep it so** (built).
5. Lure cooldown 10 s / look 1.7 s. **Rec: keep** (built) - he was crushed ~1.1x a fight by the bot; no stun-lock possible (once per pile).
