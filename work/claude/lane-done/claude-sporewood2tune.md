# SPOREWOOD2TUNE (claude/sporewood2tune, off claude/sporewood2art 84dd1f28)

PROBLEM: walker 0 deaths / 77-100% arrival, 24-73% of the route measured (the walker stalled on terrace / shaft / bog).

## What was wrong (found, not guessed)
- The bog exam "bottomless" gap (252-259) was not bottomless: a nook (260-263) dug into the next stalk caught every fall on its floor with no way out (not dead, just stuck): the walker stalled there in 5 of 6 runs. Nook removed (and 231-232 left as wall) - a miss is now THE FALL.
- The walker ran past every LEANING cap and jumped the gap flat out. New walker hint (src/sporewood-hands.js walkHint, bot side only): hop onto the cap, stand, ride (counted, max ~7 s a cap).
- The drone's only blow was a red !! (no answer): foe-pass red.

## Level (src/sporewood.js; hash 4ed9... -> f48637fe943d)
Three REAL bottomless falls, each told (sign, warning posts), each with a pillar of bounce caps to hop on, each taught before by a version with a floor (glade pit, stalk-one lean):
1. THE TERRACE'S FALL (glade exam, 91-96, six wide): spitcap + brute on the near lip, spitcap on the far lip, a told spore drop on the lip; shrine 97 -> 100.
2. THE BOUNCE STALK (bog, 233-235 and 239-240 either side of the cap pillar, no floor, no stub): timed bounce; lurker + lantern on the high stalk landing.
3. HER APPROACH (392-398, seven wide, cap pillar): heavy waits on the far lip.
+ 2 spore archers (pit far, dark shaft), lurker at a landing spot (with its lantern: every lurker still stands in a lantern's light), shaft entry shield -> sporeling (walker stall). Debuffers 13 (check range 8-12 -> 8-14).
Plank shelves split so none bridges a gap; solid-islands 0 (a floating cap row was caught and given a pillar).

## Foe pass red fixed
`drone`: puffTell (yellow !, 0.5 s: swells, white flash, floats away) then a 0.3 s lunge along the line it drew; a shield turns it (SIG drone: puffTell, parry; marks MARK/ANSWER/HEIGHT; the red !! swell stays for a missed lunge). tools/told-sweep12.mjs has the drone case (standing: -12 hp, shield: 0).

## Walker (level-walk, campaign L4 typical build, human+first, 3 seeds a hero)
| | deaths knight / warden / pyro | mean | arrival | route measured |
|---|---|---|---|---|
| before (84dd1f28) | 0 / 0 / 0 | 0.0 | 77-100% | 24-73% |
| after | 1.3 / 0.7 / 0.3 | 0.8 (band 0.5-1.5) | 87% (like Rootway 81, Wood 89; arrival "soft" > 65 for every act-I level) | 83% |
Deaths are all THE FALL (terrace, bounce stalk, her approach, plus an occasional lean).

## Boss (code untouched; re-measured)
With flasks (human) k4 w6 p2 /6 = 67% (was 61%, same band 60-70); dry (human+dry) 44% (was 33%); mash 0/6 level + boss.

## Checks
sporewood2 (node, range edits), sporewood2-probe, sporewood2art (hash re-pointed), foe-pass, told-sweep12, answer-tags, architecture, checkpoints, checkpoint-stand, skins, dangling-paths, npc-removal, killzones, goblin-lint, corpses (CORPSES_ONLY=spore), solid-islands 0, level-quality spore CLEARS THE BAR (pilot 12 blows/1 death, curve 40% / 0 deaths, mash 0/6), pilot / curve / mash level + boss restamped, docs/walk-curve.json spore row.
NOT RUN (PC memory 1.3 GB free, memguard): the 65-fight boss-fight-end and textfit (the boss, its arena and text are untouched).
Red, pre-existing elsewhere: slopes-trace.

## Remaining walker stalls (unmeasured sections, ~17%)
Shield (myconid guard) duels at the larder / bog stalk two / her door (the walker's shield weakness shows everywhere, e.g. Stockade), the dark shaft's lantern timing, the first lean over the bog with a floor. Not level faults.

## Pictures
work/claude/lane-done/sporewood2art-fall-terrace.png, -fall-bounce-stalk.png, -fall-her-approach.png

## QUESTIONS FOR DANIEL
1. Arrival stays ~87% (soft vs 65) like every other act-I level; the death band is met. Rec (built): leave; lowering arrival means more damage in every act-I level, a game-wide lever.
2. Three real falls = a death costs the walk back to the shrine (up to ~45 tiles). Rec (built): keep, all told. Alt: add a catch ledge under the bounce stalk.
