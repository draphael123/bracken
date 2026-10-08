# REMEASURE 10-08 (claude/stamina12, survival2: 1 flask start, shrine refills one, stamina x1.2)
Head commits on origin/claude/stamina12: c7c4bc8b (mash-bot fix + redgorge rows), 9d205f9a (curve rows), then this report.

## 1. REDGORGE - the cause was the BOT, not the level
Reproduced: `mash-bot --level redgorge` warden/pyro 46% lowest, 0 deaths, 2 blows taken, 1 ride. Tracing every blow and a pre-lift dump showed
`BK.state === 'talk'` from ~frame 1500 on, with P.inv frozen at 0.12: the bot's ride code presses `talk` every 45 frames, which opened a sign
box near the start; `mash()` only presses attack when `P.atk < 0`, so the box was never closed and the WORLD STOOD STILL (nothing moves, nothing
hits) while the bot was lifted waypoint to waypoint through a stopped level. The x1.2 regen merely changed the timing so warden/pyro hit the sign
(knight did not). Not a level weakness, so I did NOT add elites/foes: with the fix the UNCHANGED level loses for all three (also verified that
three extra shield captains on bridges two/three/five add nothing to the verdict; reverted, level hash unchanged).
Fix: tools/mash-bot.mjs `mash()` presses attack to advance a sign box when state is 'talk' (a masher's thumb does exactly that). Stricter, not
weaker (only removes free frozen time). Re-stamped redgorge level then boss: knight 3 deaths, warden 2, pyro 3 (all 0% lowest); boss 0/6 mash wins.
This bug could only have HELPED the bot elsewhere, and the full re-measure below shows no level cleared.

## 2. Level-1 curve rows (tools/level1-pilot.mjs <id> --curve; note: --curve writes without --write, so I restored the one wall row by hand)
| level | hits | deaths | lost % | verdict |
|---|---|---|---|---|
| spore | 11 | 0 | 51 | ok, written |
| kings | 25 | 3 | 201 | ok, written |
| storm | 4 | 0 | 25 | EASY for act 3 (band 100-500, deaths >=1): already on CURVE_REPORT_ONLY, written; rec: storm wants a tougher section-one foe or elite (it is the easiest level on the road) |
| unburied | 48 | 6 | 352 | ok, written |
| canal | 90 | 14 | 634 | WALL for act 4 (>600%, 14 deaths > 12): NOT written, row left stale (curve-gate prints it). Rec: one canal foe encounter lighter (it was 436% / 12 deaths before survival2) |
| redgorge | 34 | 3 | 286 | ok, written |
| underwell | 42 | 3 | 269 | ok, written |
| skyroad | 27 | 3 | 135 | ok, written |
curve-gate after: green; only canal listed as stale. Act band misses: storm (easy), canal (wall, unwritten); longwater/reef/keep/undercrown unchanged report-only.

## 3. Mash rows (no --write except redgorge: none of the other rows were stale and none cleared)
Every campaign level re-measured LEVEL mode with all three heroes at the new rules (41 + redgorge), and every boss/mini row (55 rows x 6 fights).
RESULT: no level cleared (clear = 0 deaths and lowest hp >= 40%); storm knight is the nearest (0 deaths but lowest hp 9%). No boss/mini is beaten
by the masher except the KNOWN report-only `fallingtower` mini (pyro wins 2/2, boss left 0%; already on MASH_REPORT_ONLY, not touched, not trivial).
mash-gate: 42 levels hold. Raw output: scratch/rm/*.txt|json.

### Mash LEVEL rows
| level | hero lvl | knight (deaths/lowest hp) | warden | pyro |
|---|---|---|---|---|
| redgorge (--write) | 35 | 3 / 0% | 2 / 0% | 3 / 0% |
| wood | 1 | 35 / 0% (held 99) | 35 / 0% (held 102) | 3 / 0% (held 16) |
| marsh | 1 | 29 / 0% (held 84) | 29 / 0% (held 84) | 29 / 0% (held 84) |
| stockade | 2 | 15 / 0% (held 44) | 5 / 0% (held 14) | 16 / 0% (held 44) |
| spore | 3 | 4 / 0% (held 6) | 3 / 0% (held 6) | 4 / 0% (held 9) |
| kings | 5 | 2 / 0% (held 8) | 1 / 0% (held 15) | 1 / 0% (held 7) |
| scree | 7 | 1 / 0% (held 59) | 1 / 0% (held 59) | 1 / 0% (held 58) |
| hanging | 8 | 2 / 0% | 3 / 0% (held 2) | 2 / 0% (held 8) |
| spire | 9 | 2 / 0% (held 6) | 2 / 0% (held 6) | 3 / 0% (held 3) |
| moor | 10 | 22 / 0% (held 84) | 45 / 0% (held 135) | 39 / 0% (held 117) |
| storm | 13 | 0 / 9% (held 117) | 5 / 0% (held 14) | 4 / 0% (held 13) |
| crown | 14 | 11 / 0% (held 6) | 10 / 0% (held 6) | 8 / 0% (held 8) |
| longwater | 15 | 7 / 0% (held 15) | 7 / 0% (held 22) | 4 / 0% (held 19) |
| reef | 16 | 3 / 0% (held 9) | 3 / 0% (held 9) | 3 / 0% (held 9) |
| flotilla | 17 | 1 / 0% (held 1) | 1 / 0% (held 1) | 1 / 0% (held 1) |
| hurricane | 18 | 57 / 0% (held 171) | 57 / 0% (held 171) | 57 / 0% (held 171) |
| lamplit | 19 | 2 / 0% (held 15) | 2 / 0% (held 8) | 2 / 0% (held 6) |
| underleaf | 6 | 2 / 0% | 1 / 0% | 2 / 0% |
| deep | 20 | 13 / 0% (held 39) | 15 / 0% (held 39) | 3 / 0% (held 9) |
| keep | 21 | 1 / 0% | 1 / 0% (held 3) | 2 / 0% (held 3) |
| causeway | 22 | 3 / 0% (held 22) | 3 / 0% | 3 / 0% (held 26) |
| harbor | 23 | 4 / 0% (held 18) | 3 / 0% (held 25) | 2 / 0% (held 16) |
| waymeet | 23 | 1 / 0% (held 36) | 1 / 0% (held 37) | 1 / 0% (held 40) |
| undercrown | 15 | 4 / 0% | 3 / 0% | 3 / 0% |
| fields | 27 | 5 / 0% (held 5) | 3 / 0% (held 15) | 1 / 0% (held 51) |
| burial | 28 | 3 / 0% (held 2) | 2 / 0% (held 25) | 2 / 0% (held 13) |
| mage | 30 | 3 / 0% (held 4) | 3 / 0% (held 6) | 2 / 0% (held 3) |
| fallingtower | 31 | 4 / 0% | 5 / 0% (held 1) | 4 / 0% (held 3) |
| burning | 3 | 29 / 0% (held 87) | 29 / 0% (held 87) | 3 / 0% (held 8) |
| witchlight | 29 | 2 / 0% (held 23) | 1 / 0% (held 25) | 3 / 0% (held 4) |
| oreroad | 12 | 3 / 0% | 3 / 0% | 3 / 0% |
| unburied | 30 | 2 / 0% (held 5) | 2 / 0% | 2 / 0% (held 10) |
| caravan | 32 | 2 / 0% (held 11) | 2 / 0% (held 11) | 1 / 0% (held 26) |
| fair | 26 | 7 / 0% (held 6) | 6 / 0% | 4 / 0% |
| theatre | 25 | 1 / 0% | 1 / 0% | 2 / 0% |
| canal | 24 | 11 / 0% (held 7) | 12 / 0% (held 7) | 9 / 0% (held 7) |
| welltown | 33 | 2 / 0% (held 11) | 2 / 0% (held 11) | 1 / 0% (held 48) |
| underwell | 34 | 2 / 0% (held 4) | 16 / 0% (held 45) | 3 / 0% (held 6) |
| skyroad | 11 | 1 / 0% | 1 / 0% | 1 / 0% |
| glasssea | 36 | 1 / 0% (held 1) | 1 / 0% (held 1) | 1 / 0% (held 1) |
| ksar | 37 | 2 / 0% | 2 / 0% | 2 / 0% |
| rootway | 4 | 2 / 0% (held 6) | 2 / 0% (held 6) | 1 / 0% (held 6) |

### Mash BOSS / MINI rows
| boss row | fights | mash wins | boss hp left (min) |
|---|---|---|---|
| wood | 6 | 0 | 92% |
| marsh | 6 | 0 | 48% |
| stockade | 6 | 0 | 100% |
| spore | 6 | 0 | 100% |
| kings | 6 | 0 | 100% |
| kings (mini) | 6 | 0 | 49% |
| scree | 6 | 0 | 90% |
| hanging | 6 | 0 | 59% |
| hanging (mini) | 6 | 0 | 24% |
| spire | 6 | 0 | 99% |
| spire (mini) | 6 | 0 | 91% |
| moor | 6 | 0 | 77% |
| storm | 6 | 0 | 94% |
| crown | 6 | 0 | 80% |
| crown (mini) | 6 | 0 | 22% |
| longwater | 6 | 0 | 94% |
| reef | 6 | 0 | 84% |
| flotilla | 6 | 0 | 84% |
| hurricane | 6 | 0 | 91% |
| lamplit | 6 | 0 | 95% |
| lamplit (mini) | 6 | 0 | 84% |
| underleaf | 6 | 0 | 96% |
| deep | 6 | 0 | 81% |
| keep | 6 | 0 | 81% |
| causeway | 6 | 0 | 70% |
| harbor | 6 | 0 | 72% |
| harbor (mini) | 6 | 0 | 92% |
| waymeet | 6 | 0 | 98% |
| waymeet (mini) | 6 | 0 | 75% |
| undercrown | 6 | 0 | 92% |
| fields | 6 | 0 | 99% |
| fields (mini) | 6 | 0 | 44% |
| burial | 6 | 0 | 60% |
| burial (mini) | 6 | 0 | 96% |
| mage | 6 | 0 | 87% |
| mage (mini) | 6 | 0 | 88% |
| fallingtower | 6 | 0 | 98% |
| fallingtower (mini) | 6 | 2 | 0% |
| burning | 6 | 0 | 76% |
| witchlight | 6 | 0 | 88% |
| witchlight (mini) | 6 | 0 | 80% |
| oreroad | 6 | 0 | 100% |
| unburied | 6 | 0 | 41% |
| unburied (mini) | 6 | 0 | 73% |
| caravan | 6 | 0 | 87% |
| fair | 6 | 0 | 46% |
| theatre | 6 | 0 | 100% |
| canal | 6 | 0 | 99% |
| welltown | 6 | 0 | 100% |
| welltown (mini) | 6 | 0 | 46% |
| underwell | 6 | 0 | 70% |
| skyroad | 6 | 0 | 91% |
| glasssea | 6 | 0 | 97% |
| ksar | 6 | 0 | 83% |
| rootway | 6 | 0 | 88% |

## 4. Dry boss spot check (boss-rates.mjs --profile=human+dry, practiced, 4 seeds a hero, campaign level, no tuning)
NB `BOT_PROFILE=` is NOT read by tools/boss-rates.mjs (it prints 'profile human' and the bot DRINKS); `--profile=human+dry` on boss-rates itself works. My first run with the env var was wet (kept in scratch/rm/human-wet.txt).
| boss | L | knight | warden | pyro | all | vs 50-60% |
|---|---|---|---|---|---|---|
| wood | 3 | 1/4 | 1/4 | 4/4 | 50% | in band |
| stockade | 3 | 1/4 | 4/4 | 1/4 | 50% | in band |
| kings | 5 | 2/4 | 3/4 | 3/4 | 67% | high +7 |
| skyroad | 11 | 2/4 | 4/4 | 3/4 | 75% | high +15 |
| storm | 13 | 3/4 | 3/4 | 4/4 | 83% | high +23 |
| causeway | 22 | 4/4 | 2/4 | 3/4 | 75% | high +15 |
| canal | 25 | 2/4 | 1/4 | 4/4 | 58% | in band |
| redgorge | 35 | 4/4 | 0/4 | 4/4 | 67% | high +7, WARDEN 0/4 (the Matriarch is a wall for warden dry; pyro/knight clear it) |
Pattern: act-I bosses are in band dry; mid/late bosses (storm, skyroad, causeway) sit 15-25 points high even dry, and per-hero skew is large (wood/stockade pyro vs knight/warden swing 1/4 vs 4/4; redgorge warden 0/4).

## QUESTIONS FOR DANIEL
1. Mash-bot was fixed (not Redgorge): confirm you do not also want a weightier Redgorge anyway (I tried 3 shield captains on bridges two/three/five; zero effect on the verdict, so not shipped).
2. canal is a curve WALL at survival2 (634% / 14 deaths); storm is EASY. Recommend a small canal lighten + a storm elite in the next level lane (not done here).
3. Redgorge Matriarch warden 0/4 dry: a boss tune for warden is needed (no hero at 0).
