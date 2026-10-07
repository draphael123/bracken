# claude/underwell3 - THE UNDERWELL / CISTERN QUEEN, Daniel 10-07 (Opus) - WIP (credits ran out)

## STATUS
DONE (code in, Node-checked; tools/cistern-queen.mjs 107/107 green; page smoke via boss-rates, no page errors):
- STINGER = weak point: src/cistern-queen.js TAIL/tailPose/tipOf/tipBox (one tail table; the art draws it). A blow on her
  stinger wherever her tail holds it lands whole (CQ.tipMul), never turned (burning or not), outside her 3 s ward. Gold ring
  on the tip (B10 OPEN), bigger ring + white star + clock on a stuck/planted/flung stinger. Blades that meet the tip outside
  her body box land via a new ctx.strike hook (src/main.js CQH ctx, one line). boss-greed OPEN_RULE.cisternqueen asks
  e.cqBare() (blow on the stinger) and e.scorch.
- STINGER SLAM ('sslam', sslamTell red !! dodge low; marks.js BY_HAND/MARK/ANSWER/HEIGHT rows): word on her bar
  "STINGER SLAM!", hint line the first two times, red ring on the floor spot, hits 28 px either side, stinger PLANTED 2.6 s
  (plantR 22, cap 10%). In P1 (3 of 4 cycles), P2 (she drops off her wall, slams, climbs back), P3, enraged.
- FIRE ON THE OIL: burning floor oil under her body -> SCORCHED 6 s (body whole from any side, she fights on), told, gold
  ring + clock, then the told ward. Burrow into fire = surfaces SCORCHED (was the DRIVEN UP opening). Her hall's oil seeps
  back in OIL.arenaBack 12 s (told, bubbles drawn); her torches relight told (src/underwell-hands.js).
- WATER ON HER EXIT: a pour on the mound -> 'slip' opening (3.4 s, all open x openMul, stinger flung flat behind her x stingMul).
  Bucket still SOAKS. Bar: SLIPPED / SCORCHED / STINGER PLANTED.
- Art: scorch cracks, slip sprawl, slam pose (src/redraw/cistern_queen_art.js). New hint lines in src/hint-lines.js.
- Bot v2 rows (queenPlanV3 in src/cistern-queen.js, lab.js labCqFire + UH.arcFor): cut when scorched, take a cresset torch
  and throw it on the pool she is crossing, jump + UP-cut the tip, set the torch down for openings. Smoke (1 seed/hero):
  every new opening is used; fights ~60-70 s, 1/3 won with her at 0-3% left.

NOT DONE:
- Numbers: she is now too SHORT a fight (60-70 s). Rec next: hp 1150 -> ~1650 and her dmg x0.7, then
  `PORT=8696 node tools/boss-rates.mjs underwell --ways=practiced --seeds=8 --jobs=2 --profile=human` to 50-60%, no hero 0.
- Assertions to update (Daniel's design change, say so): tools/underwell.mjs line ~249 (DRIVEN UP soaked -> SCORCHED),
  tools/boss-openings.mjs cisternqueen take('soaked' via mound pour) -> 'slip'. Run underwell, underwell-aloft,
  cistern-queen, boss-openings, boss-fight-end, boss-greed, boss-read, tells, answer-tags, hint-shown, throwables, corpses, stuck, signs.
- INVISIBLE ROPE: not found yet. Probed: every NET cell has a tile picture fresh / burnt / re-hung / respawn / boss fight;
  only climbables are T.NET (cols 160, 356, 554, 581). Next: real-key walk (tools/underwell-route.mjs) in the Lamp
  Stair -> Drowned Cistern -> her corridor; suspect visual (supports/bucket rope look like ropes) or a state not covered.
- TWO MORE WATER SECTIONS: not started. Plan: splice columns at x=244 (between the works and the sump) and x=346 (before the
  Lamp Stair), export uwX() from src/underwell.js and map SECTIONS/ARCS/stuck-spots/tool literals through it.
- level-quality, level-1 curve, mash rows (level THEN boss via tools/mash-bot.mjs), report.

## QUESTIONS FOR DANIEL (rec first)
1. Tip damage x1.0 any time (outside ward) - rec keep; if too easy, 0.7.
2. Pour on the mound now SLIPS her (was SOAKED); the bucket still soaks. Rec keep.
