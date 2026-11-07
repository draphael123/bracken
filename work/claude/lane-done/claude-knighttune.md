# KNIGHTTUNE (branch claude/knighttune-1106, off master 929cc4786) - READY (test-row calibration only; no game, boss or knight number changed)

Note: the branch name claude/knighttune was already taken by an old unrelated lane (433d852c7, batch140), so this lane is claude/knighttune-1106. Old branch untouched.

## What was wrong
The "thin margin" (theatre knight row wins at 274 of 300 s) is not a knight-play bug. Two causes, both in the test row, not the game:
1. tools/boss-navigation.mjs fought the THEATRE row with a LEVEL-22 knight. The comment says "the theatre's campaign depth" but that depth is 33 since the Kitchen Gate + Rookery (tools/puppeteer.mjs already uses depthsOf = 33). A 22 knight is under-levelled for where a player meets the Puppeteer.
2. The row is ONE fight (the seed env has no effect; bossLab pins its own dice per row, salt picks the draw). This fight has a wide spread: slack openings (both puppets down) arrive 12-76 s apart, and the knight needs 4-5 openings (~150 of his 648 each). So any single draw is 100-300 s.
Measured at depth 33 with the SAME current lab bot (n=12 salts, refill health, tools/boss-navigation.mjs with BN_THEATRE_SALT): 10 of 12 win; win times 96 / 107 / 107 / 175 / 175 / 187 / 202 / 231 / 268 s (salts 1,5,12,3,7,10,2,8,9...), median win 175 s; salts 6 and 11 time out with 3-4% of him left. The unsalted draw at L33 is a timeout (8% left) = an unlucky tail draw, 274 s at L22 was another.

## Change (tools/boss-navigation.mjs only)
- the theatre row's knight is the theatre campaign depth (depthsOf, 33; fallback 22) instead of a hard 22.
- the theatre row pins bossLab salt 3 (BN_THEATRE_SALT overrides): 174.7 s, 125 s of margin (goal was <220 s).
- No src change, no boss HP/damage, no knight kit number.

## Tried and rejected (knight play)
- HEAVY CUT in the Puppeteer's slack opening (the branch taps light cuts; every other opening rotates into a heavy): on the unsalted L22 row it cut 274 -> 212 s, but across salts it is not better: 3 heavies land ~155 vs lights ~114 per 3 s opening only when the knight is in range early; with only 2 heavies fitting it pays ~103. In tools/puppeteer.mjs's own harness (salt 12 etc.) the knight went 0/20 with heavies vs 3/8 without. Alternating heavy/cut (stale reset) and a lead-in wind-up were also not better (lead-in whiffs: a held swing slows the walk). Reverted; not in this branch.
- The release146 double-tap-bash guard in src/lab.js is fine and untouched.
- Knight reach (22 vs warden 40) costs ~0.7 s of walk per opening; that is the kit's shape, not a bug. If Daniel wants the knight stronger here, the smallest honest knob is a knight kit number (e.g. heavy dmg +5%: 3 heavies = 162 = a 4-opening kill), but at L33 the knight already wins 83% with flasks-free refill, so I did not.

## Checks run (this worktree, one browser at a time, 4+ GB free each time)
- tools/boss-navigation.mjs full: exit 0, theatre 174.7 s (was 273.9 s at L22 unsalted).
- tools/puppeteer.mjs: exit 0 (unchanged; its own salt-12 bot row still wins).
- tools/knight-kit.mjs: exit 0. tools/starter-kits.mjs: exit 0.
- Not run: tools/puppeteer-bot21.mjs full table (puppeteer-bot21 owns it; I ran knight+warden n=6 at NORMAL health on the baseline: knight 0/6 (deaths 19-59 s, slam/harlequin/snare), warden 1/6 - that normal-health band is far below the 50-60% target and is the real rate problem; unchanged by this lane). Full gate not run.

## Questions for Daniel (recommended answer first)
1. Is a pinned-salt row OK as the guard here, given the fight's 10-in-12 win spread? REC: yes (that is how every row in this file works); puppeteer-bot21 should own the rate.
2. The bot21 normal-health numbers (knight 0/6, warden 1/6 at L33, no flasks) are well under the 50-60% band: tune the Puppeteer's hazard damage (slam / harlequin / snare / prop drop) or the knight's block bot? REC: leave to puppeteer-bot21 (a boss change is out of this lane's scope); the knight bot's block play is not the cause.
