# TOKENSFIX2 - attack-tokens waymeet "2 hedgeknights stood still"

Cause (not the token purse): the hedge knight's leap (src/main.js updateRoadman, case 'leap') carries him ~75-100 px past a hero who stands still. He landed still facing AWAY, stood through the 0.9 s rest, then through faceHim's ~0.3 s turn (behindT) and the speed ramp - a plain-mode "waiting" second with under 4 px of travel (18.6 s and 33.3 s, both just after a leap over the hero). Tokens held, rest and deny timers were all normal.
Fix (game code, one line): on landing he turns to the hero (e.face = sign(d)). The assertion is untouched.
Proof: node tools/attack-tokens.mjs failed before (waymeet 2 of 151 still) and passes after (0 still). Green: foe-tempo, foe-tactics, commitment, untold-told, architecture, dangling-paths, ambush-single.
