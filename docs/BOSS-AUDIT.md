# BOSS AUDIT - the mash bot against every boss, mini and level (claude/mashbot, 2026-10-01)

Daniel, of three levels in a row: "no challenge... the boss is just attack, attack". `tools/mash-bot.mjs` is a player who ONLY MASHES ATTACK: it walks at the boss and presses the basic attack every free frame, and never blocks, dodges, jumps on purpose, uses a heavy blow, a skill, a mechanic or an opening. Target (Hollow Knight / Salt and Sanctuary): it LOSES every boss with every hero, and in a level it dies or drops under 40% health. Data: `docs/mash-bot.json` (regenerate this file with `node tools/mash-audit.mjs`).

Method: a fresh hero (no skills, no talents) at the level's expected hero level (its depth on the gate chain), one life, normal health, no god mode, the boss lab's setup. Three heroes (knight, warden, pyromancer) x two seeds per boss; a level-1 variant is one seed per hero. LEVEL mode holds toward the next waypoint and mashes, and is LIFTED to the next waypoint where it makes no progress in 4 s (a gap, a wall or a machine: it never jumps), counted as lifts, so a stretch is met but not always crossed. Chip multiplier: a 40-point blow landed on the boss at four moments in the knight's fight while he was not open, measured and given back (x1.0 is a full hit; the rule is x0.05; a number with "(open)" would be his opening). Greed punish: "y" when a quarter or more of the hero's damage arrived within half a second of the mash bot's own blow on a boss that was not mid-attack (a reprisal, a counter) - a heuristic, not a proof.

## Summary

- Fights audited: 53 (bosses and minis). The mash bot BEATS 5 of them with at least one hero (0 with every fight).
- Levels mashed: 39; it clears 0 without dying or dropping under 40% health.

## Bosses and minis, worst first (a mash WIN is the worst)

| # | boss | level | mash wins | knight | warden | pyro | chip x (not open) | greed punish | notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | hedgewarden (mini) | witchlight | 5/6 | WIN/WIN (hp lost 57/34%, boss left 0/0%) | WIN/died (hp lost 87/100%, boss left 0/18%) | WIN/WIN (hp lost 28/49%, boss left 0/0%) | n/a | n (0%) |  |
| 2 | sexton (mini) | fallingtower | 3/6 | died/WIN (hp lost 100/100%, boss left 27/0%) | died/died (hp lost 100/100%, boss left 78/59%) | WIN/WIN (hp lost 92/99%, boss left 0/0%) | n/a | n (22%) |  |
| 3 | ploughman (mini) | fields | 2/6 | died/died (hp lost 100/100%, boss left 30/31%) | died/died (hp lost 100/100%, boss left 54/53%) | WIN/WIN (hp lost 14/14%, boss left 0/0%) | x0.4 | n (15%) | level-1 hero: 0/3 mash wins |
| 4 | barrowrider (mini) | unburied | 2/6 | died/died (hp lost 100/100%, boss left 37/37%) | died/died (hp lost 100/100%, boss left 54/54%) | WIN/WIN (hp lost 78/78%, boss left 0/0%) | n/a | n (0%) |  |
| 5 | mother | spore | 1/6 | WIN/died (hp lost 0/100%, boss left 0/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x1 | n (0%) | mash landed 2 or fewer blows in 5/6 fights; level-1 hero: 0/3 mash wins |
| 6 | lampreeve (mini) | lamplit | 0/6 | died/died (hp lost 100/100%, boss left 29/35%) | died/died (hp lost 100/100%, boss left 66/66%) | died/died (hp lost 100/100%, boss left 18/18%) | x0.25 | n (18%) | level-1 hero: 0/3 mash wins |
| 7 | forgemaster (mini) | crown | 0/6 | died/died (hp lost 100/100%, boss left 66/66%) | died/died (hp lost 100/100%, boss left 72/72%) | died/died (hp lost 100/100%, boss left 15/15%) | n/a | n (13%) |  |
| 8 | roc | skyroad | 0/6 | died/died (hp lost 100/100%, boss left 62/62%) | died/died (hp lost 100/100%, boss left 63/63%) | died/died (hp lost 100/100%, boss left 67/67%) | n/a | n (0%) |  |
| 9 | spider (mini) | hanging | 0/6 | died/died (hp lost 100/100%, boss left 40/67%) | died/died (hp lost 100/100%, boss left 86/86%) | died/died (hp lost 100/100%, boss left 56/56%) | x1 | n (11%) | level-1 hero: 0/3 mash wins |
| 10 | ram | scree | 0/6 | died/died (hp lost 100/100%, boss left 35/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 36/38%) | x0.05 | n (0%) | mash landed 2 or fewer blows in 3/6 fights; level-1 hero: 0/3 mash wins |
| 11 | greathound (mini) | kings | 0/6 | died/died (hp lost 100/100%, boss left 69/69%) | died/died (hp lost 100/100%, boss left 61/86%) | died/died (hp lost 100/100%, boss left 65/63%) | x0.05 | n (1%) | level-1 hero: 0/3 mash wins |
| 12 | wickerqueen | fair | 0/6 | died/died (hp lost 100/100%, boss left 66/66%) | died/died (hp lost 100/100%, boss left 88/88%) | died/died (hp lost 100/100%, boss left 56/56%) | n/a | n (24%) |  |
| 13 | harbormaster | harbor | 0/6 | died/died (hp lost 100/100%, boss left 74/75%) | died/died (hp lost 100/100%, boss left 82/82%) | died/died (hp lost 100/100%, boss left 68/68%) | x0.05 | n (1%) | level-1 hero: 0/3 mash wins |
| 14 | bloodknight | unburied | 0/6 | died/died (hp lost 100/100%, boss left 86/86%) | died/died (hp lost 100/100%, boss left 83/88%) | died/died (hp lost 100/100%, boss left 53/56%) | n/a | n (2%) |  |
| 15 | lancer (mini) | waymeet | 0/6 | timeout/timeout (hp lost 19/19%, boss left 52/54%) | timeout/timeout (hp lost 33/33%, boss left 89/89%) | timeout/timeout (hp lost 32/32%, boss left 85/85%) | x0.05 | n (0%) | level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 16 | reefmaw | reef | 0/6 | died/died (hp lost 100/100%, boss left 78/78%) | died/died (hp lost 100/100%, boss left 78/78%) | died/died (hp lost 100/100%, boss left 75/75%) | x0.05 | n (4%) | level-1 hero: 0/3 mash wins |
| 17 | homunculus (mini) | mage | 0/6 | died/died (hp lost 100/100%, boss left 73/89%) | died/died (hp lost 100/100%, boss left 86/86%) | died/died (hp lost 100/100%, boss left 69/69%) | x0.05 | n (6%) | level-1 hero: 0/3 mash wins |
| 18 | gangleader (mini) | welltown | 0/6 | died/died (hp lost 100/100%, boss left 66/66%) | died/died (hp lost 100/100%, boss left 89/89%) | died/died (hp lost 100/100%, boss left 84/86%) | n/a | n (4%) |  |
| 19 | queen | wood | 0/6 | died/died (hp lost 100/100%, boss left 63/74%) | died/died (hp lost 100/100%, boss left 96/89%) | died/died (hp lost 100/100%, boss left 77/91%) | n/a | n (0%) |  |
| 20 | quarter | flotilla | 0/6 | died/died (hp lost 100/100%, boss left 78/89%) | died/died (hp lost 100/100%, boss left 77/77%) | died/died (hp lost 100/100%, boss left 85/85%) | x0.05 | n (4%) | level-1 hero: 0/3 mash wins |
| 21 | owl | hanging | 0/6 | died/died (hp lost 100/100%, boss left 76/76%) | died/died (hp lost 100/100%, boss left 96/91%) | died/died (hp lost 100/100%, boss left 79/86%) | x0.05 | n (3%) | level-1 hero: 0/3 mash wins |
| 22 | burieddead | burial | 0/6 | died/died (hp lost 100/100%, boss left 91/92%) | died/died (hp lost 100/100%, boss left 99/99%) | died/died (hp lost 100/100%, boss left 69/69%) | x0.05 | n (13%) | level-1 hero: 0/3 mash wins |
| 23 | bellcrab | deep | 0/6 | died/died (hp lost 100/100%, boss left 80/83%) | died/died (hp lost 100/100%, boss left 95/95%) | died/died (hp lost 100/100%, boss left 89/89%) | x0.05 | n (4%) | level-1 hero: 0/3 mash wins |
| 24 | greenteeth | canal | 0/6 | died/died (hp lost 100/100%, boss left 84/84%) | died/died (hp lost 100/100%, boss left 97/97%) | died/died (hp lost 100/100%, boss left 86/86%) | n/a | n (0%) |  |
| 25 | tollmaster | lamplit | 0/6 | died/died (hp lost 100/100%, boss left 83/84%) | died/died (hp lost 100/100%, boss left 97/97%) | died/died (hp lost 100/100%, boss left 88/88%) | x0.05 | n (5%) | level-1 hero: 0/3 mash wins |
| 26 | gqueen | crown | 0/6 | died/died (hp lost 100/100%, boss left 85/100%) | died/died (hp lost 100/100%, boss left 91/91%) | died/died (hp lost 100/100%, boss left 87/87%) | n/a | n (0%) | mash landed 2 or fewer blows in 1/6 fights |
| 27 | pyromancer | burning | 0/6 | died/died (hp lost 100/100%, boss left 93/91%) | died/died (hp lost 100/100%, boss left 88/92%) | died/died (hp lost 100/100%, boss left 96/84%) | x0.25 | n (2%) | level-1 hero: 0/3 mash wins |
| 28 | cisternqueen | underwell | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 99/99%) | died/died (hp lost 100/100%, boss left 78/78%) | n/a | n (0%) | mash landed 2 or fewer blows in 4/6 fights |
| 29 | kraken | causeway | 0/6 | died/died (hp lost 100/100%, boss left 82/82%) | died/died (hp lost 100/100%, boss left 98/98%) | died/died (hp lost 100/100%, boss left 98/98%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |
| 30 | windcaller | moor | 0/6 | died/died (hp lost 100/100%, boss left 99/93%) | died/died (hp lost 100/100%, boss left 99/77%) | died/died (hp lost 100/100%, boss left 95/95%) | n/a | n (2%) | mash landed 2 or fewer blows in 2/6 fights |
| 31 | drownedking | keep | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 84/78%) | died/died (hp lost 100/100%, boss left 98/98%) | n/a | n (5%) | mash landed 2 or fewer blows in 2/6 fights |
| 32 | prince | undercrown | 0/6 | died/died (hp lost 100/100%, boss left 85/90%) | died/died (hp lost 100/100%, boss left 97/97%) | died/died (hp lost 100/100%, boss left 95/95%) | x0.05 | n (11%) | level-1 hero: 0/3 mash wins |
| 33 | bosun (mini) | harbor | 0/6 | died/died (hp lost 100/100%, boss left 87/91%) | died/died (hp lost 100/100%, boss left 97/97%) | died/died (hp lost 100/100%, boss left 95/95%) | x0.05 | n (15%) | level-1 hero: 0/3 mash wins |
| 34 | gargoyle | witchlight | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 76/88%) | n/a | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless |
| 35 | archmage | mage | 0/6 | timeout/timeout (hp lost 43/68%, boss left 96/97%) | died/timeout (hp lost 100/61%, boss left 95/95%) | timeout/timeout (hp lost 99/64%, boss left 90/94%) | x0 | n (0%) | level-1 hero: 0/3 mash wins; 5 timeouts (the mash bot neither won nor died in the time allowed) |
| 36 | frog | marsh | 0/6 | died/died (hp lost 100/100%, boss left 99/77%) | died/died (hp lost 100/100%, boss left 95/99%) | died/died (hp lost 100/100%, boss left 100/99%) | n/a | n (0%) | mash landed 2 or fewer blows in 4/6 fights |
| 37 | golem (mini) | spire | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 86/86%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |
| 38 | lance | storm | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 88/88%) | n/a | n (0%) | mash landed 2 or fewer blows in 4/6 fights |
| 39 | captain | hurricane | 0/6 | died/died (hp lost 100/100%, boss left 92/93%) | died/died (hp lost 100/100%, boss left 99/99%) | died/died (hp lost 100/100%, boss left 97/97%) | x0.05 | n (6%) | level-1 hero: 0/3 mash wins |
| 40 | gravewarden (mini) | burial | 0/6 | died/died (hp lost 100/100%, boss left 96/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 91/91%) | x1 | n (2%) | mash landed 2 or fewer blows in 3/6 fights; level-1 hero: 0/3 mash wins |
| 41 | duneworm | caravan | 0/6 | died/died (hp lost 100/100%, boss left 97/94%) | died/died (hp lost 100/100%, boss left 98/99%) | died/died (hp lost 100/100%, boss left 97/93%) | n/a | n (0%) | mash landed 2 or fewer blows in 1/6 fights |
| 42 | herald | longwater | 0/6 | timeout/timeout (hp lost 65/65%, boss left 100/100%) | timeout/timeout (hp lost 52/62%, boss left 99/99%) | timeout/timeout (hp lost 81/70%, boss left 93/93%) | n/a | n (0%) | mash landed 2 or fewer blows in 4/6 fights; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 43 | gorgecrab | redgorge | 0/6 | died/died (hp lost 100/100%, boss left 98/98%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 95/95%) | x0.05 | n (17%) | level-1 hero: 0/3 mash wins |
| 44 | grandmother | underleaf | 0/6 | died/died (hp lost 100/100%, boss left 93/99%) | died/died (hp lost 100/100%, boss left 99/99%) | died/died (hp lost 100/100%, boss left 99/99%) | x0.05 | n (0%) | level-1 hero: 0/3 mash wins |
| 45 | undeadmage | fallingtower | 0/6 | died/died (hp lost 100/100%, boss left 99/96%) | died/died (hp lost 100/100%, boss left 100/99%) | died/died (hp lost 100/100%, boss left 96/99%) | n/a | n (7%) |  |
| 46 | abbot | spire | 0/6 | died/died (hp lost 100/100%, boss left 99/99%) | died/died (hp lost 100/100%, boss left 99/99%) | died/died (hp lost 100/100%, boss left 97/99%) | x0.05 | n (7%) | level-1 hero: 0/3 mash wins |
| 47 | strawking | fields | 0/6 | timeout/timeout (hp lost 0/0%, boss left 97/100%) | timeout/timeout (hp lost 0/0%, boss left 99/99%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | x0.05 | n (0%) | mash landed 2 or fewer blows in 3/6 fights; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 48 | puppeteer | theatre | 0/6 | died/died (hp lost 100/100%, boss left 97/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x0.05 | n (3%) | mash landed 2 or fewer blows in 5/6 fights; level-1 hero: 0/3 mash wins |
| 49 | chief | stockade | 0/6 | timeout/timeout (hp lost 0/0%, boss left 100/100%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | x0.05 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 50 | king | kings | 0/6 | timeout/timeout (hp lost 29/29%, boss left 100/100%) | timeout/timeout (hp lost 42/42%, boss left 100/100%) | timeout/timeout (hp lost 13/13%, boss left 100/100%) | x0 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 51 | winchmaster | oreroad | 0/6 | timeout/timeout (hp lost 99/99%, boss left 100/100%) | timeout/timeout (hp lost 99/99%, boss left 100/100%) | timeout/timeout (hp lost 99/99%, boss left 100/100%) | x0.05 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 52 | closedhelm | waymeet | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |
| 53 | djinn | welltown | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | n/a | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless |

## Levels (knight-first; the best mash hero shown), worst first (cleared = it neither died nor dropped under 40%)

| level | hero level | best mash hero | lowest hp | hp lost (sum) | deaths | waypoints walked | lifts | cleared the level? |
|---|---|---|---|---|---|---|---|---|
| storm | 10 | warden | 63% | 59% | 0 | 100% | 58 | no |
| longwater | 12 | pyro | 42% | 151% | 0 | 100% | 42 | no |
| underwell | 31 | warden | 35% | 124% | 0 | 100% | 41 | no |
| causeway | 19 | pyro | 33% | 88% | 0 | 100% | 46 | no |
| keep | 18 | warden | 30% | 167% | 0 | 100% | 60 | no |
| redgorge | 31 | warden | 29% | 71% | 0 | 100% | 27 | no |
| underleaf | 5 | pyro | 28% | 237% | 0 | 100% | 38 | no |
| spore | 3 | warden | 25% | 145% | 0 | 100% | 27 | no |
| witchlight | 26 | warden | 20% | 158% | 0 | 100% | 56 | no |
| burning | 3 | pyro | 13% | 234% | 0 | 100% | 34 | no |
| skyroad | 9 | knight | 7% | 173% | 0 | 100% | 22 | no |
| deep | 17 | warden | 3% | 143% | 0 | 100% | 53 | no |
| unburied | 27 | pyro | 3% | 170% | 0 | 100% | 42 | no |
| fair | 23 | pyro | 3% | 220% | 0 | 100% | 37 | no |
| theatre | 22 | pyro | 2% | 114% | 0 | 100% | 32 | no |
| wood | 1 | knight | 0% | 374% | 2 | 100% | 46 | no |
| marsh | 1 | knight | 0% | 3205% | 32 | 100% | 35 | no |
| stockade | 2 | knight | 0% | 239% | 2 | 100% | 36 | no |
| kings | 4 | knight | 0% | 260% | 2 | 100% | 45 | no |
| scree | 5 | knight | 0% | 215% | 1 | 100% | 44 | no |
| hanging | 6 | knight | 0% | 219% | 2 | 100% | 43 | no |
| spire | 7 | knight | 0% | 241% | 1 | 100% | 49 | no |
| moor | 8 | knight | 0% | 2524% | 24 | 100% | 61 | no |
| crown | 11 | knight | 0% | 846% | 7 | 100% | 103 | no |
| reef | 13 | knight | 0% | 240% | 2 | 100% | 30 | no |
| flotilla | 14 | knight | 0% | 296% | 2 | 100% | 25 | no |
| hurricane | 15 | knight | 0% | 280% | 1 | 100% | 39 | no |
| lamplit | 16 | knight | 0% | 188% | 1 | 100% | 54 | no |
| harbor | 20 | knight | 0% | 272% | 1 | 100% | 78 | no |
| waymeet | 20 | knight | 0% | 169% | 1 | 100% | 63 | no |
| undercrown | 12 | knight | 0% | 422% | 4 | 100% | 40 | no |
| fields | 24 | knight | 0% | 140% | 1 | 100% | 63 | no |
| burial | 25 | knight | 0% | 300% | 1 | 100% | 62 | no |
| mage | 27 | knight | 0% | 344% | 2 | 100% | 53 | no |
| fallingtower | 28 | knight | 0% | 477% | 4 | 100% | 74 | no |
| oreroad | 9 | knight | 0% | 275% | 2 | 100% | 24 | no |
| caravan | 29 | knight | 0% | 178% | 1 | 100% | 49 | no |
| canal | 21 | knight | 0% | 482% | 5 | 100% | 33 | no |
| welltown | 30 | knight | 0% | 214% | 1 | 100% | 58 | no |

Caveats: LEVEL mode lifts the hero past every stretch it cannot cross (gaps, walls, machines), so its hp numbers are a floor on the danger a real mash player meets, not a ceiling. "hp lost (sum)" counts every point lost, so healing in the level lets it pass 100%. The mash bot cannot jump, so a boss that flies or sits on a ledge may simply be out of its reach (the notes say so); that is a real answer to "does mashing win" but not a measure of how hard the boss is to a thinking player. The chip number is the boss's own damage gate at the moment of the probe, and some bosses change it by phase. The cache is stamped with the level's data, so a boss-module change needs a re-run.
