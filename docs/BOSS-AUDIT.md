# BOSS AUDIT - the mash bot against every boss, mini and level (claude/mashbot, 2026-10-01)

Daniel, of three levels in a row: "no challenge... the boss is just attack, attack". `tools/mash-bot.mjs` is a player who ONLY MASHES ATTACK: it walks at the boss and presses the basic attack every free frame, and never blocks, dodges, jumps on purpose, uses a heavy blow, a skill, a mechanic or an opening. Target (Hollow Knight / Salt and Sanctuary): it LOSES every boss with every hero, and in a level it dies or drops under 40% health. Data: `docs/mash-bot.json` (regenerate this file with `node tools/mash-audit.mjs`).

Method: a fresh hero (no skills, no talents) at the level's expected hero level (its depth on the gate chain), one life, normal health, no god mode, the boss lab's setup. Three heroes (knight, warden, pyromancer) x two seeds per boss; a level-1 variant is one seed per hero. LEVEL mode holds toward the next waypoint and mashes, and is LIFTED to the next waypoint where it makes no progress in 4 s (a gap, a wall or a machine: it never jumps), counted as lifts, so a stretch is met but not always crossed. Chip multiplier: a 40-point blow landed on the boss at four moments in the knight's fight while he was not open, measured and given back (x1.0 is a full hit; the rule is x0.05; a number with "(open)" would be his opening). Greed punish: "y" when a quarter or more of the hero's damage arrived within half a second of the mash bot's own blow on a boss that was not mid-attack (a reprisal, a counter) - a heuristic, not a proof.

## Summary

- Fights audited: 47 (bosses and minis). The mash bot BEATS 21 of them with at least one hero (3 with every fight).
- Levels mashed: 34; it clears 4 without dying or dropping under 40% health.

## Bosses and minis, worst first (a mash WIN is the worst)

| # | boss | level | mash wins | knight | warden | pyro | chip x (not open) | greed punish | notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | bosun (mini) | harbor | 6/6 | WIN/WIN (hp lost 35/50%, boss left 0/0%) | WIN/WIN (hp lost 20/20%, boss left 0/0%) | WIN/WIN (hp lost 31/45%, boss left 0/0%) | x1 | y (48%) | level-1 hero: 0/3 mash wins |
| 2 | lancer (mini) | waymeet | 6/6 | WIN/WIN (hp lost 39/39%, boss left 0/0%) | WIN/WIN (hp lost 22/22%, boss left 0/0%) | WIN/WIN (hp lost 78/60%, boss left 0/0%) | x0.6 | n (0%) | level-1 hero: 1/3 mash wins |
| 3 | greathound (mini) | kings | 6/6 | WIN/WIN (hp lost 7/28%, boss left 0/0%) | WIN/WIN (hp lost 57/48%, boss left 0/0%) | WIN/WIN (hp lost 63/63%, boss left 0/0%) | x1 | n (0%) | level-1 hero: 3/3 mash wins |
| 4 | puppeteer | theatre | 5/6 | WIN/WIN (hp lost 21/32%, boss left 0/0%) | WIN/timeout (hp lost 14/19%, boss left 0/6%) | WIN/WIN (hp lost 67/44%, boss left 0/0%) | x0.05 | n (3%) | level-1 hero: 0/3 mash wins; 1 timeouts (the mash bot neither won nor died in the time allowed) |
| 5 | homunculus (mini) | mage | 5/6 | died/WIN (hp lost 100/90%, boss left 37/0%) | WIN/WIN (hp lost 73/73%, boss left 0/0%) | WIN/WIN (hp lost 64/64%, boss left 0/0%) | x0.35 | y (33%) | level-1 hero: 0/3 mash wins |
| 6 | lampreeve (mini) | lamplit | 4/6 | WIN/WIN (hp lost 58/86%, boss left 0/0%) | WIN/WIN (hp lost 95/95%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 9/9%) | x0.25 | n (13%) | level-1 hero: 0/3 mash wins |
| 7 | ploughman (mini) | fields | 4/6 | died/died (hp lost 100/100%, boss left 52/31%) | WIN/WIN (hp lost 61/61%, boss left 0/0%) | WIN/WIN (hp lost 95/95%, boss left 0/0%) | x0.4 | n (11%) | level-1 hero: 0/3 mash wins |
| 8 | windcaller | moor | 4/6 | WIN/died (hp lost 81/100%, boss left 0/86%) | WIN/timeout (hp lost 65/86%, boss left 0/10%) | WIN/WIN (hp lost 55/72%, boss left 0/0%) | n/a | n (0%) | mash landed 2 or fewer blows in 1/6 fights; level-1 hero: 0/3 mash wins; 1 timeouts (the mash bot neither won nor died in the time allowed) |
| 9 | spider (mini) | hanging | 3/6 | WIN/died (hp lost 34/100%, boss left 0/14%) | died/died (hp lost 100/100%, boss left 34/34%) | WIN/WIN (hp lost 62/62%, boss left 0/0%) | x1 | y (40%) | level-1 hero: 0/3 mash wins |
| 10 | sexton (mini) | fallingtower | 3/6 | died/WIN (hp lost 100/90%, boss left 36/0%) | died/died (hp lost 100/100%, boss left 57/64%) | WIN/WIN (hp lost 89/91%, boss left 0/0%) | x1 | n (20%) | level-1 hero: 0/3 mash wins |
| 11 | barrowrider (mini) | unburied | 2/6 | died/died (hp lost 100/100%, boss left 26/27%) | died/died (hp lost 100/100%, boss left 8/8%) | WIN/WIN (hp lost 77/77%, boss left 0/0%) | x1 | n (21%) | level-1 hero: 0/3 mash wins |
| 12 | owl | hanging | 2/6 | WIN/died (hp lost 20/100%, boss left 0/26%) | timeout/WIN (hp lost 40/70%, boss left 24/0%) | died/died (hp lost 100/100%, boss left 10/28%) | x0.05 | y (47%) | level-1 hero: 1/3 mash wins; 1 timeouts (the mash bot neither won nor died in the time allowed) |
| 13 | tollmaster | lamplit | 2/6 | WIN/WIN (hp lost 23/29%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 7/13%) | died/died (hp lost 100/100%, boss left 37/37%) | x0.05 | n (18%) | level-1 hero: 0/3 mash wins |
| 14 | hedgewarden (mini) | witchlight | 2/6 | died/died (hp lost 100/100%, boss left 49/14%) | died/WIN (hp lost 100/60%, boss left 20/0%) | died/WIN (hp lost 100/36%, boss left 14/0%) | x0.25 | y (40%) | level-1 hero: 0/3 mash wins |
| 15 | grandmother | underleaf | 2/6 | died/died (hp lost 100/100%, boss left 33/24%) | WIN/WIN (hp lost 16/99%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 48/46%) | x1 | n (0%) | level-1 hero: 0/3 mash wins |
| 16 | gravewarden (mini) | burial | 2/6 | died/died (hp lost 100/100%, boss left 48/51%) | died/died (hp lost 100/100%, boss left 49/49%) | WIN/WIN (hp lost 94/94%, boss left 0/0%) | x1 | n (4%) | level-1 hero: 0/3 mash wins |
| 17 | ram | scree | 2/6 | WIN/WIN (hp lost 60/97%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 47/31%) | died/died (hp lost 100/100%, boss left 83/83%) | x0.05 | n (0%) | level-1 hero: 0/3 mash wins |
| 18 | drownedking | keep | 2/6 | died/died (hp lost 100/100%, boss left 98/100%) | WIN/WIN (hp lost 88/99%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 98/99%) | x0.05 | n (4%) | mash landed 2 or fewer blows in 1/6 fights; level-1 hero: 0/3 mash wins |
| 19 | forgemaster (mini) | crown | 1/6 | WIN/died (hp lost 46/100%, boss left 0/71%) | died/died (hp lost 100/100%, boss left 30/30%) | died/died (hp lost 100/100%, boss left 12/12%) | x0.5 | y (30%) | level-1 hero: 0/3 mash wins |
| 20 | wickerqueen | fair | 1/6 | WIN/died (hp lost 99/100%, boss left 0/25%) | died/died (hp lost 100/100%, boss left 65/65%) | died/died (hp lost 100/100%, boss left 16/16%) | x0.05 | n (20%) | level-1 hero: 0/3 mash wins |
| 21 | mother | spore | 1/6 | WIN/died (hp lost 0/100%, boss left 0/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x1 | n (0%) | mash landed 2 or fewer blows in 5/6 fights; level-1 hero: 0/3 mash wins |
| 22 | harbormaster | harbor | 0/6 | died/died (hp lost 100/100%, boss left 67/68%) | died/died (hp lost 100/100%, boss left 68/68%) | died/died (hp lost 100/100%, boss left 31/31%) | x0.05 | n (3%) | level-1 hero: 0/3 mash wins |
| 23 | gqueen | crown | 0/6 | died/died (hp lost 100/100%, boss left 60/60%) | died/died (hp lost 100/100%, boss left 62/66%) | died/died (hp lost 100/100%, boss left 51/55%) | x0 | n (3%) | level-1 hero: 0/3 mash wins |
| 24 | pyromancer | burning | 0/6 | died/died (hp lost 100/100%, boss left 45/82%) | died/died (hp lost 100/100%, boss left 47/47%) | died/died (hp lost 100/100%, boss left 73/73%) | x0.25 | n (11%) | level-1 hero: 0/3 mash wins |
| 25 | quarter | flotilla | 0/6 | died/timeout (hp lost 100/42%, boss left 75/58%) | timeout/timeout (hp lost 42/42%, boss left 63/63%) | timeout/timeout (hp lost 17/17%, boss left 63/63%) | x0.05 | n (5%) | level-1 hero: 0/3 mash wins; 5 timeouts (the mash bot neither won nor died in the time allowed) |
| 26 | prince | undercrown | 0/6 | died/died (hp lost 100/100%, boss left 63/48%) | died/died (hp lost 100/100%, boss left 95/95%) | died/died (hp lost 100/100%, boss left 65/65%) | x0.05 | y (25%) | level-1 hero: 0/3 mash wins |
| 27 | reefmaw | reef | 0/6 | died/died (hp lost 100/100%, boss left 89/94%) | died/died (hp lost 100/100%, boss left 42/73%) | died/died (hp lost 100/100%, boss left 67/71%) | x0 | n (4%) | level-1 hero: 0/3 mash wins |
| 28 | queen | wood | 0/6 | died/died (hp lost 100/100%, boss left 47/78%) | timeout/died (hp lost 94/100%, boss left 83/82%) | died/died (hp lost 100/100%, boss left 98/80%) | x1 | n (0%) | mash landed 2 or fewer blows in 1/6 fights; level-1 hero: 0/3 mash wins; 1 timeouts (the mash bot neither won nor died in the time allowed) |
| 29 | kraken | causeway | 0/6 | timeout/timeout (hp lost 59/59%, boss left 86/86%) | died/died (hp lost 100/100%, boss left 87/87%) | died/died (hp lost 100/100%, boss left 86/86%) | x0 | n (0%) | level-1 hero: 0/3 mash wins; 2 timeouts (the mash bot neither won nor died in the time allowed) |
| 30 | undeadmage | fallingtower | 0/6 | died/died (hp lost 100/100%, boss left 93/96%) | died/died (hp lost 100/100%, boss left 99/99%) | died/died (hp lost 100/100%, boss left 38/95%) | x0.05 | n (7%) | level-1 hero: 0/3 mash wins |
| 31 | bloodknight | unburied | 0/6 | died/died (hp lost 100/100%, boss left 91/91%) | died/died (hp lost 100/100%, boss left 95/95%) | died/died (hp lost 100/100%, boss left 84/84%) | x0.05 | n (10%) | level-1 hero: 0/3 mash wins |
| 32 | duneworm | caravan | 0/6 | died/died (hp lost 100/100%, boss left 95/72%) | died/died (hp lost 100/100%, boss left 98/98%) | died/died (hp lost 100/100%, boss left 89/89%) | x0 | n (2%) | level-1 hero: 0/3 mash wins |
| 33 | lance | storm | 0/6 | died/died (hp lost 100/100%, boss left 86/76%) | died/died (hp lost 100/100%, boss left 98/98%) | died/died (hp lost 100/100%, boss left 93/93%) | x0 | n (0%) | mash landed 2 or fewer blows in 2/6 fights; level-1 hero: 0/3 mash wins |
| 34 | bellcrab | deep | 0/6 | died/died (hp lost 100/100%, boss left 77/86%) | died/died (hp lost 100/100%, boss left 97/97%) | died/died (hp lost 100/100%, boss left 95/95%) | x0.05 | n (16%) | level-1 hero: 0/3 mash wins |
| 35 | herald | longwater | 0/6 | timeout/timeout (hp lost 56/59%, boss left 96/100%) | timeout/timeout (hp lost 48/48%, boss left 92/92%) | timeout/timeout (hp lost 77/77%, boss left 95/95%) | x0.2 | n (0%) | mash landed 2 or fewer blows in 1/6 fights; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 36 | captain | hurricane | 0/6 | died/died (hp lost 100/100%, boss left 91/93%) | died/died (hp lost 100/100%, boss left 97/97%) | died/died (hp lost 100/100%, boss left 96/96%) | x0.05 | n (23%) | level-1 hero: 0/3 mash wins |
| 37 | burieddead | burial | 0/6 | died/died (hp lost 100/100%, boss left 96/98%) | died/died (hp lost 100/100%, boss left 98/98%) | died/died (hp lost 100/100%, boss left 91/91%) | x0.05 | n (7%) | level-1 hero: 0/3 mash wins |
| 38 | frog | marsh | 0/6 | died/timeout (hp lost 100/97%, boss left 100/94%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/84%) | x0.05 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins; 1 timeouts (the mash bot neither won nor died in the time allowed) |
| 39 | golem (mini) | spire | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 89/89%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |
| 40 | abbot | spire | 0/6 | died/died (hp lost 100/100%, boss left 100/98%) | died/died (hp lost 100/100%, boss left 98/100%) | died/died (hp lost 100/100%, boss left 86/98%) | x0.05 | y (27%) | level-1 hero: 0/3 mash wins |
| 41 | gargoyle | witchlight | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/86%) | x0 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins |
| 42 | strawking | fields | 0/6 | timeout/timeout (hp lost 0/0%, boss left 97/100%) | timeout/timeout (hp lost 0/0%, boss left 98/99%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | x0.05 | n (0%) | mash landed 2 or fewer blows in 3/6 fights; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 43 | archmage | mage | 0/6 | died/died (hp lost 100/100%, boss left 99/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x0 | n (0%) | mash landed 2 or fewer blows in 5/6 fights; level-1 hero: 0/3 mash wins |
| 44 | chief | stockade | 0/6 | timeout/timeout (hp lost 0/0%, boss left 100/100%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | x0.05 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 45 | winchmaster | oreroad | 0/6 | timeout/timeout (hp lost 99/99%, boss left 100/100%) | timeout/timeout (hp lost 99/99%, boss left 100/100%) | timeout/timeout (hp lost 99/99%, boss left 100/100%) | x0.05 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 46 | king | kings | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x0 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins |
| 47 | closedhelm | waymeet | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |

## Levels (knight-first; the best mash hero shown), worst first (cleared = it neither died nor dropped under 40%)

| level | hero level | best mash hero | lowest hp | hp lost (sum) | deaths | waypoints walked | lifts | cleared the level? |
|---|---|---|---|---|---|---|---|---|
| storm | 10 | knight | 70% | 30% | 0 | 100% | 58 | YES (a walk) |
| keep | 18 | knight | 60% | 101% | 0 | 100% | 25 | YES (a walk) |
| causeway | 19 | knight | 59% | 41% | 0 | 100% | 45 | YES (a walk) |
| deep | 17 | knight | 45% | 135% | 0 | 100% | 31 | YES (a walk) |
| theatre | 21 | knight | 39% | 80% | 0 | 100% | 48 | no |
| longwater | 12 | knight | 28% | 115% | 0 | 100% | 44 | no |
| spore | 3 | knight | 24% | 131% | 0 | 100% | 45 | no |
| spire | 7 | knight | 20% | 120% | 0 | 100% | 43 | no |
| marsh | 1 | knight | 18% | 179% | 0 | 100% | 37 | no |
| wood | 1 | knight | 0% | 161% | 1 | 100% | 47 | no |
| stockade | 2 | knight | 0% | 243% | 2 | 100% | 43 | no |
| kings | 4 | knight | 0% | 134% | 1 | 100% | 56 | no |
| scree | 5 | knight | 0% | 296% | 2 | 100% | 47 | no |
| hanging | 6 | knight | 0% | 145% | 1 | 100% | 42 | no |
| moor | 8 | knight | 0% | 340% | 2 | 100% | 60 | no |
| crown | 11 | knight | 0% | 653% | 6 | 100% | 104 | no |
| reef | 13 | knight | 0% | 133% | 1 | 100% | 34 | no |
| flotilla | 14 | knight | 0% | 192% | 1 | 100% | 28 | no |
| hurricane | 15 | knight | 0% | 270% | 2 | 100% | 54 | no |
| lamplit | 16 | knight | 0% | 162% | 1 | 100% | 58 | no |
| underleaf | 5 | knight | 0% | 197% | 1 | 100% | 41 | no |
| harbor | 20 | knight | 0% | 325% | 3 | 100% | 85 | no |
| waymeet | 20 | knight | 0% | 161% | 1 | 100% | 63 | no |
| undercrown | 12 | knight | 0% | 345% | 3 | 100% | 40 | no |
| fields | 23 | knight | 0% | 246% | 2 | 100% | 65 | no |
| burial | 24 | knight | 0% | 153% | 1 | 100% | 63 | no |
| mage | 26 | knight | 0% | 334% | 2 | 100% | 59 | no |
| fallingtower | 27 | knight | 0% | 212% | 2 | 100% | 57 | no |
| burning | 3 | knight | 0% | 188% | 1 | 100% | 41 | no |
| witchlight | 25 | knight | 0% | 143% | 1 | 100% | 52 | no |
| oreroad | 9 | knight | 0% | 102% | 1 | 100% | 27 | no |
| unburied | 26 | knight | 0% | 158% | 1 | 100% | 41 | no |
| caravan | 28 | knight | 0% | 203% | 1 | 100% | 50 | no |
| fair | 22 | knight | 0% | 154% | 1 | 100% | 61 | no |

Caveats: LEVEL mode lifts the hero past every stretch it cannot cross (gaps, walls, machines), so its hp numbers are a floor on the danger a real mash player meets, not a ceiling. "hp lost (sum)" counts every point lost, so healing in the level lets it pass 100%. The mash bot cannot jump, so a boss that flies or sits on a ledge may simply be out of its reach (the notes say so); that is a real answer to "does mashing win" but not a measure of how hard the boss is to a thinking player. The chip number is the boss's own damage gate at the moment of the probe, and some bosses change it by phase. The cache is stamped with the level's data, so a boss-module change needs a re-run.
