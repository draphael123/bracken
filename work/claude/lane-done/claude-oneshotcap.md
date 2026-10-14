# claude-oneshotcap - one-blow ceiling on the boss pressure dial

## What was built
- `src/boss-pressure.js`: `BLOW_CAP = 0.45` + `capBoost(before, boosted, maxHp, fin)`. Applied in `src/main.js` damagePlayer0 right after the dial: if the dial's boost makes one blow of a boss/mini
  land (after the difficulty x tier chain that still runs) for more than 45% of the player's max hp, the boosted number is cut back to the ceiling - but never below the un-dialled tuned number.
  Hazard-share (`pct`) blows are untouched. DIAL_EXEMPT bosses get dmgFactor 1 so never reach it.
- `tools/blow-census.mjs` (+ BLOW_CENSUS hook in `tools/boss-run.mjs`, `BK.blowRec` in main.js): plays boss-rates fights (campaign level, kit flasks, profile human, knight, 1 seed) and records the biggest single blow per boss/mini
  and blow name (landed, blocked or dodged), after BOSS_HIT, the dial, tier and difficulty. `tools/hero-hp.mjs`: max hp of every hero at a campaign level.
- `tools/boss-greed.mjs`: the mini-multiplier line now measures on a 400 hp bar (so the ceiling cannot touch the greed x dial ratio it asserts - assertion unchanged) + a NEW assertion that the ceiling holds (a 25 blow, 1.3x1.65 = 54 uncapped, lands <= ~45 on a 100 hp hero).

## Blow table (BEFORE the cap; biggest blow seen, after the dial, at campaign level; % of each hero's max hp; "py" is the lowest-hp hero of knight/warden/pyro, and of all 8 heroes)
| row | L | hp kn/wa/py | biggest blow | % kn | % wa | % py |
|---|---|---|---|---|---|---|
| rootway | 5 | 126/126/114 | huntmaster THE RED ARROW 13 | 10 | 10 | 11 |
| spire:mini | 9 | 142/142/130 | golem:mini ? 55 | 39 | 39 | 42 |
| burial | 30 | 240/240/228 | burieddead ? 31 | 13 | 13 | 14 |
| causeway | 23 | 210/210/198 | kraken ? 82 | 39 | 39 | 41 |
| deep | 21 | 198/198/186 | bellcrab ? 79 | 40 | 40 | 42 |
| oreroad | 12 | 156/156/144 | winchmaster THE BRAKE BAR 43 | 28 | 28 | 30 |
| storm | 14 | 168/168/156 | lance ? 33 | 20 | 20 | 21 |
| wood | 3 | 114/114/102 | queen ? 25 | 22 | 22 | 25 |
| mage | 32 | 252/252/240 | archmage ? 45 | 18 | 18 | 19 |
| fields | 29 | 238/238/226 | strawking ? 47 | 20 | 20 | 21 |
| underleaf | 6 | 128/128/116 | grandmother THE SWEEP 19 | 15 | 15 | 16 |
| scree | 7 | 138/138/126 | ram ? 29 | 21 | 21 | 23 |
| canal | 26 | 224/224/212 | lanterneater THE SNAP 130 | 58 | 58 | 61 OVER |
| fair | 28 | 236/236/224 | wickerqueen HER SPEAR 34 | 14 | 14 | 15 |
| flotilla | 18 | 184/184/172 | quarter ? 50 | 27 | 27 | 29 |
| harbor | 24 | 212/212/200 | harbormaster ? 42 | 20 | 20 | 21 |
| kings | 5 | 126/126/114 | king ? 50 | 40 | 40 | 44 |
| lamplit | 20 | 196/196/184 | tollmaster ? 53 | 27 | 27 | 29 |
| longwater | 16 | 180/180/168 | herald ? 69 | 38 | 38 | 41 |
| unburied | 32 | 252/252/240 | bloodknight THE CLEAVE 50 | 20 | 20 | 21 |
| undercrown | 16 | 180/180/168 | prince ? 35 | 19 | 19 | 21 |
| waymeet | 24 | 212/212/200 | closedhelm ? 83 | 39 | 39 | 42 |
| kings:mini | 5 | 126/126/114 | greathound:mini ? 36 | 29 | 29 | 32 |
| reef | 17 | 182/182/170 | reefmaw ? 53 | 29 | 29 | 31 |
| spore | 3 | 114/114/102 | mother ? 23 | 20 | 20 | 23 |
| hanging | 8 | 140/140/128 | owl ? 78 | 56 | 56 | 61 OVER |
| crown | 15 | 170/170/158 | gqueen ? 31 | 18 | 18 | 20 |
| keep | 22 | 208/208/196 | drownedking ? 55 | 26 | 26 | 28 |
| burial:mini | 30 | 240/240/228 | gravewarden:mini THE SPADE 70 | 29 | 29 | 31 |
| fields:mini | 29 | 238/238/226 | ploughman:mini ? 155 | 65 | 65 | 69 OVER |
| lamplit:mini | 20 | 196/196/184 | lampreeve:mini ? 96 | 49 | 49 | 52 OVER |
| mage:mini | 32 | 252/252/240 | homunculus:mini ? 99 | 39 | 39 | 41 |
| unburied:mini | 32 | 252/252/240 | barrowrider:mini THE REARING TRAMPLE 89 | 35 | 35 | 37 |
| waymeet:mini | 24 | 212/212/200 | lancer:mini ? 110 | 52 | 52 | 55 OVER |
| hurricane | 19 | 194/194/182 | captain ? 13 | 7 | 7 | 7 |
| marsh | 3 | 114/114/102 | frog ? 20 | 18 | 18 | 20 |
| moor | 10 | 152/152/140 | windcaller THE BOLT 32 | 21 | 21 | 23 |
| witchlight:mini | 31 | 250/250/238 | hedgewarden:mini THE CUT 96 | 38 | 38 | 40 |
| hanging:mini | 8 | 140/140/128 | spider:mini ? 30 | 21 | 21 | 23 |
| harbor:mini | 24 | 212/212/200 | bosun:mini HIS REPRISAL 74 | 35 | 35 | 37 |
| redgorge | 37 | 278/278/266 | matriarch HER TALONS 50 | 18 | 18 | 19 |
| spire | 9 | 142/142/130 | abbot THE CENSER 44 | 31 | 31 | 34 |
| caravan | 34 | 264/264/252 | duneworm THE TAIL 55 | 21 | 21 | 22 |
| stockade | 3 | 114/114/102 | chief ? 29 | 25 | 25 | 28 |
| welltown:mini | 35 | 266/266/254 | gangleader:mini THE WHIRL 67 | 25 | 25 | 26 |
| fallingtower | 33 | 254/254/242 | undeadmage THE GRAVE SCRIPT 97 | 38 | 38 | 40 |
| witchlight | 31 | 250/250/238 | gargoyle THE STONE DIVE 38 | 15 | 15 | 16 |
| crown:mini | 15 | 170/170/158 | forgemaster:mini ? 64 | 38 | 38 | 41 |
| fallingtower:mini | 33 | 254/254/242 | sexton:mini HIS REPRISAL 77 | 30 | 30 | 32 |
| burning | 3 | 114/114/102 | pyromancer THE BELLOWS 12 | 11 | 11 | 12 |
| theatre | 27 | 226/226/214 | puppeteer THE SLAM 62 | 27 | 27 | 29 |
| welltown | 35 | 266/266/254 | djinn THE WAVE 45 | 17 | 17 | 18 |
| underwell | 36 | 268/268/256 | cisternqueen HER STINGER 86 | 32 | 32 | 34 |
| skyroad | 11 | 154/154/142 | roc HER TALONS 50 | 32 | 32 | 35 |
| towpath | 25 | 222/222/210 | fogknight THE FOG LUNGE 80 | 36 | 36 | 38 |
| church | 26 | 224/224/212 | paladinboss HIS AEGIS 76 | 34 | 34 | 36 |
| buriedcity | 40 | 292/292/280 | hourglassking HIS PENDULUM 47 | 16 | 16 | 17 |
| sealedpyramid | 41 | 294/294/282 | scarabmother HER CHARGE 74 | 25 | 25 | 26 |

Caveat: one knight fight per row (a blow only shows if the boss threw it that fight; many fights end early), so a rare move can be missing. The cap protects regardless. Rows over 45% of the lowest-hp hero: canal (Lanterneater THE SNAP 130 = 61% py), hanging (Owl 78 = 61%), fields:mini (Ploughman 155 = 69%), lamplit:mini (Lamp-Reeve 96 = 52%), waymeet:mini (Serjeant 110 = 55%).
Near the line (not capped): kings 42%, deep 42%, causeway 41% (of pyro).

## The three named in the brief, at campaign hp
- Archmage mark: 104 at the level-1 test hero is 41% of the campaign hero (hp 240-252 at L32, base mark 34 x 1.8 x 1.9...). Archmage's biggest seen in the census 45 (19%); the mark (34 base) is ~41% -> under the ceiling at campaign hp, so NOT capped. At a level-1 hero (hp ~100) the cap would now cut it to 45.
- Lamp-Reeve lunge: the lamplit MINI (lampreeve:mini) 96 = 52% py -> CAPPED to 45%.
- Wicker Queen ring: it is a TICK hazard (18 base per 0.45 s, x0.9 x dial x tier), not a single blow: biggest single Wicker Queen blow seen is 34 (14%). Time-to-kill from the ring alone at campaign hp is ~4 s of standing in it (told 3 s, gap marked) - a per-blow ceiling does not touch it. See question 1.

## Capped bosses
Lanterneater (canal), Owl (hanging), Ploughman mini (fields), Lamp-Reeve mini (lamplit), Serjeant mini (waymeet). After the cap the census shows them at 45% (owl 58 py128, lampreeve 83, lancer 89).
DIAL_EXEMPT bosses over 45%: none (cisternqueen 32%, hourglassking 16%, matriarch 18% are the measured ones; hawkmistress and colossus have no boss-rows entry and were not measured).

## Before / after win rates (practiced, human, kit flasks; kn/wa/py)
| row | before (cap off) | after (cap on) |
|---|---|---|
| canal | 3 seeds 1/3 1/3 3/3 = 56%; 6 seeds 3/6 1/6 6/6 = 56% | 3 seeds 0/3 1/3 3/3 = 44%; 6 seeds 2/6 2/6 6/6 = 56% |
| hanging | 3 seeds 56%; 6 seeds 1/6 3/6 2/6 = 33% | 3 seeds 67%; 6 seeds 2/6 4/6 3/6 = 50% |
| fields:mini | 89% | 89% |
| lamplit:mini | 67% | 78% (in band) |
| waymeet:mini | 78% | 89% |
Canal stays 4 under the 60-70 band and hanging 10 under at n=18: the cap only removes oversized blows, it is not a retune (lanterneater/owl need their own lanes). Fields:mini +4 and waymeet:mini +4 over the 75-85 band (n=9).

## Checks (PORT=8905)
boss-openings OK, wicker-queen OK, weak-bosses OK, archmage-folly OK, damage-caps OK, boss-greed: 1 RED on first run - the test's artificial 20-dmg mini blow on the level-1 hero tripped the new ceiling (45 vs 26 expected 56/26); fixed by measuring that ratio on a 400 hp bar (assertion not weakened) and adding a ceiling assertion; green after.

## QUESTIONS FOR DANIEL
1. The Wicker Queen bonfire ring kills a hero in ~4 s of standing in it (ticks, not one blow). Rec: leave it (told 3 s, travelling gap, a horse to ride over it); built: no change. Alternative: a per-second damage ceiling on the ring tick.
2. BLOW_CAP 45% of max hp - rec kept; raising to 50% would un-cap the lamp-reeve (52% py) and the lancer (55% -> still capped).
3. Canal (Lanterneater) 56% and hanging (Owl) 50% are under band even with the cap; a tune lane for each is the rec.
