# BOSS AUDIT - the mash bot against every boss, mini and level (claude/mashbot, 2026-10-01)

Daniel, of three levels in a row: "no challenge... the boss is just attack, attack". `tools/mash-bot.mjs` is a player who ONLY MASHES ATTACK: it walks at the boss and presses the basic attack every free frame, and never blocks, dodges, jumps on purpose, uses a heavy blow, a skill, a mechanic or an opening. Target (Hollow Knight / Salt and Sanctuary): it LOSES every boss with every hero, and in a level it dies or drops under 40% health. Data: `docs/mash-bot.json` (regenerate this file with `node tools/mash-audit.mjs`).

Method: a fresh hero (no skills, no talents) at the level's expected hero level (its depth on the gate chain), one life, normal health, no god mode, the boss lab's setup. Three heroes (knight, warden, pyromancer) x two seeds per boss; a level-1 variant is one seed per hero. LEVEL mode holds toward the next waypoint and mashes, and is LIFTED to the next waypoint where it makes no progress in 4 s (a gap, a wall or a machine: it never jumps), counted as lifts, so a stretch is met but not always crossed. Chip multiplier: a 40-point blow landed on the boss at four moments in the knight's fight while he was not open, measured and given back (x1.0 is a full hit; the rule is x0.05; a number with "(open)" would be his opening). Greed punish: "y" when a quarter or more of the hero's damage arrived within half a second of the mash bot's own blow on a boss that was not mid-attack (a reprisal, a counter) - a heuristic, not a proof.

## Summary

- Fights audited: 47 (bosses and minis). The mash bot BEATS 30 of them with at least one hero (12 with every fight).
- Levels mashed: 34; it clears 5 without dying or dropping under 40% health.

## Bosses and minis, worst first (a mash WIN is the worst)

| # | boss | level | mash wins | knight | warden | pyro | chip x (not open) | greed punish | notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | bosun (mini) | harbor | 6/6 | WIN/WIN (hp lost 0/0%, boss left 0/0%) | WIN/WIN (hp lost 0/0%, boss left 0/0%) | WIN/WIN (hp lost 0/0%, boss left 0/0%) | n/a | n (0%) | level-1 hero: 2/3 mash wins |
| 2 | greathound (mini) | kings | 6/6 | WIN/WIN (hp lost 0/10%, boss left 0/0%) | WIN/WIN (hp lost 0/0%, boss left 0/0%) | WIN/WIN (hp lost 11/11%, boss left 0/0%) | x1 | n (0%) | level-1 hero: 3/3 mash wins |
| 3 | hedgewarden (mini) | witchlight | 6/6 | WIN/WIN (hp lost 8/16%, boss left 0/0%) | WIN/WIN (hp lost 71/7%, boss left 0/0%) | WIN/WIN (hp lost 12/8%, boss left 0/0%) | x0.25 | n (0%) | level-1 hero: 0/3 mash wins |
| 4 | lancer (mini) | waymeet | 6/6 | WIN/WIN (hp lost 34/29%, boss left 0/0%) | WIN/WIN (hp lost 17/17%, boss left 0/0%) | WIN/WIN (hp lost 45/45%, boss left 0/0%) | x0.6 | n (0%) | level-1 hero: 1/3 mash wins |
| 5 | homunculus (mini) | mage | 6/6 | WIN/WIN (hp lost 46/71%, boss left 0/0%) | WIN/WIN (hp lost 12/12%, boss left 0/0%) | WIN/WIN (hp lost 45/45%, boss left 0/0%) | x0.35 | y (25%) | level-1 hero: 0/3 mash wins |
| 6 | lampreeve (mini) | lamplit | 6/6 | WIN/WIN (hp lost 47/22%, boss left 0/0%) | WIN/WIN (hp lost 62/62%, boss left 0/0%) | WIN/WIN (hp lost 21/21%, boss left 0/0%) | x0.25 | n (0%) | level-1 hero: 2/3 mash wins |
| 7 | spider (mini) | hanging | 6/6 | WIN/WIN (hp lost 26/26%, boss left 0/0%) | WIN/WIN (hp lost 70/70%, boss left 0/0%) | WIN/WIN (hp lost 29/29%, boss left 0/0%) | x1 | y (31%) | level-1 hero: 1/3 mash wins |
| 8 | ploughman (mini) | fields | 6/6 | WIN/WIN (hp lost 65/65%, boss left 0/0%) | WIN/WIN (hp lost 15/15%, boss left 0/0%) | WIN/WIN (hp lost 49/49%, boss left 0/0%) | x0.4 | n (0%) | level-1 hero: 0/3 mash wins |
| 9 | barrowrider (mini) | unburied | 6/6 | WIN/WIN (hp lost 83/83%, boss left 0/0%) | WIN/WIN (hp lost 38/38%, boss left 0/0%) | WIN/WIN (hp lost 34/34%, boss left 0/0%) | x1 | n (5%) | level-1 hero: 0/3 mash wins |
| 10 | bloodknight | unburied | 6/6 | WIN/WIN (hp lost 81/61%, boss left 0/0%) | WIN/WIN (hp lost 59/59%, boss left 0/0%) | WIN/WIN (hp lost 59/59%, boss left 0/0%) | x1 | n (20%) | level-1 hero: 0/3 mash wins |
| 11 | gravewarden (mini) | burial | 6/6 | WIN/WIN (hp lost 79/79%, boss left 0/0%) | WIN/WIN (hp lost 80/73%, boss left 0/0%) | WIN/WIN (hp lost 66/69%, boss left 0/0%) | x1 | n (7%) | level-1 hero: 0/3 mash wins |
| 12 | captain | hurricane | 6/6 | WIN/WIN (hp lost 85/99%, boss left 0/0%) | WIN/WIN (hp lost 90/90%, boss left 0/0%) | WIN/WIN (hp lost 83/83%, boss left 0/0%) | x1 | n (25%) | level-1 hero: 0/3 mash wins |
| 13 | puppeteer | theatre | 5/6 | WIN/WIN (hp lost 21/32%, boss left 0/0%) | WIN/timeout (hp lost 14/19%, boss left 0/6%) | WIN/WIN (hp lost 67/44%, boss left 0/0%) | x0.05 | n (3%) | level-1 hero: 0/3 mash wins; 1 timeouts (the mash bot neither won nor died in the time allowed) |
| 14 | tollmaster | lamplit | 5/6 | died/WIN (hp lost 100/93%, boss left 42/0%) | WIN/WIN (hp lost 38/64%, boss left 0/0%) | WIN/WIN (hp lost 48/48%, boss left 0/0%) | x0.7 | n (14%) | level-1 hero: 1/3 mash wins |
| 15 | sexton (mini) | fallingtower | 4/6 | WIN/died (hp lost 55/100%, boss left 0/3%) | WIN/died (hp lost 34/100%, boss left 0/9%) | WIN/WIN (hp lost 72/81%, boss left 0/0%) | x1 | y (27%) | level-1 hero: 1/3 mash wins |
| 16 | harbormaster | harbor | 4/6 | WIN/WIN (hp lost 72/43%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 40/16%) | WIN/WIN (hp lost 39/75%, boss left 0/0%) | x1 | n (5%) | level-1 hero: 0/3 mash wins |
| 17 | wickerqueen | fair | 4/6 | WIN/WIN (hp lost 60/57%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 39/51%) | WIN/WIN (hp lost 63/43%, boss left 0/0%) | x0.25 | n (24%) | level-1 hero: 0/3 mash wins |
| 18 | windcaller | moor | 4/6 | died/died (hp lost 100/100%, boss left 45/53%) | WIN/WIN (hp lost 90/81%, boss left 0/0%) | WIN/WIN (hp lost 72/72%, boss left 0/0%) | x1 | n (0%) | level-1 hero: 0/3 mash wins |
| 19 | duneworm | caravan | 4/6 | WIN/WIN (hp lost 87/89%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 71/61%) | WIN/WIN (hp lost 82/90%, boss left 0/0%) | x0 | n (15%) | level-1 hero: 0/3 mash wins |
| 20 | abbot | spire | 3/6 | died/WIN (hp lost 100/43%, boss left 10/0%) | died/died (hp lost 100/100%, boss left 45/29%) | WIN/WIN (hp lost 79/75%, boss left 0/0%) | x1 | y (56%) | level-1 hero: 0/3 mash wins |
| 21 | grandmother | underleaf | 3/6 | died/WIN (hp lost 100/68%, boss left 33/0%) | WIN/WIN (hp lost 93/97%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 70/45%) | x1 | n (0%) | level-1 hero: 0/3 mash wins |
| 22 | forgemaster (mini) | crown | 2/6 | WIN/WIN (hp lost 36/99%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 30/30%) | died/died (hp lost 100/100%, boss left 5/5%) | x0.5 | y (33%) | level-1 hero: 0/3 mash wins |
| 23 | burieddead | burial | 2/6 | died/died (hp lost 100/100%, boss left 69/70%) | died/died (hp lost 100/100%, boss left 9/9%) | WIN/WIN (hp lost 92/97%, boss left 0/0%) | x1 | n (5%) | level-1 hero: 0/3 mash wins |
| 24 | pyromancer | burning | 2/6 | died/died (hp lost 100/100%, boss left 7/43%) | WIN/WIN (hp lost 87/77%, boss left 0/0%) | died/died (hp lost 100/100%, boss left 65/45%) | x1 | n (9%) | level-1 hero: 0/3 mash wins |
| 25 | owl | hanging | 2/6 | timeout/timeout (hp lost 81/89%, boss left 44/51%) | died/WIN (hp lost 100/36%, boss left 22/0%) | died/WIN (hp lost 100/39%, boss left 50/0%) | x1 | y (44%) | level-1 hero: 0/3 mash wins; 2 timeouts (the mash bot neither won nor died in the time allowed) |
| 26 | ram | scree | 2/6 | WIN/died (hp lost 85/100%, boss left 0/83%) | died/WIN (hp lost 100/98%, boss left 79/0%) | died/died (hp lost 100/100%, boss left 76/77%) | x1 | n (9%) | mash landed 2 or fewer blows in 1/6 fights; level-1 hero: 1/3 mash wins |
| 27 | reefmaw | reef | 1/6 | died/died (hp lost 100/100%, boss left 46/54%) | WIN/died (hp lost 38/100%, boss left 0/45%) | died/died (hp lost 100/100%, boss left 52/46%) | x0.5 | n (1%) | level-1 hero: 0/3 mash wins |
| 28 | bellcrab | deep | 1/6 | WIN/died (hp lost 86/100%, boss left 0/51%) | died/died (hp lost 100/100%, boss left 80/80%) | died/died (hp lost 100/100%, boss left 87/87%) | x0.45 | n (12%) | level-1 hero: 0/3 mash wins |
| 29 | drownedking | keep | 1/6 | died/died (hp lost 100/100%, boss left 98/100%) | WIN/died (hp lost 78/100%, boss left 0/45%) | died/died (hp lost 100/100%, boss left 88/92%) | x1 | n (10%) | mash landed 2 or fewer blows in 1/6 fights; level-1 hero: 0/3 mash wins |
| 30 | mother | spore | 1/6 | WIN/died (hp lost 0/100%, boss left 0/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x1 | n (0%) | mash landed 2 or fewer blows in 5/6 fights; level-1 hero: 0/3 mash wins |
| 31 | prince | undercrown | 0/6 | died/died (hp lost 100/100%, boss left 40/34%) | died/died (hp lost 100/100%, boss left 53/53%) | died/died (hp lost 100/100%, boss left 29/29%) | x1 | n (4%) | level-1 hero: 0/3 mash wins |
| 32 | quarter | flotilla | 0/6 | timeout/timeout (hp lost 74/42%, boss left 63/49%) | timeout/timeout (hp lost 29/29%, boss left 46/46%) | timeout/timeout (hp lost 17/17%, boss left 56/56%) | x1 | n (5%) | level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 33 | gqueen | crown | 0/6 | died/died (hp lost 100/100%, boss left 60/60%) | died/died (hp lost 100/100%, boss left 62/62%) | died/died (hp lost 100/100%, boss left 46/37%) | x0 | n (2%) | level-1 hero: 0/3 mash wins |
| 34 | undeadmage | fallingtower | 0/6 | died/died (hp lost 100/100%, boss left 46/71%) | died/died (hp lost 100/100%, boss left 72/79%) | died/died (hp lost 100/100%, boss left 34/29%) | x1 | n (11%) | level-1 hero: 0/3 mash wins |
| 35 | queen | wood | 0/6 | died/died (hp lost 100/100%, boss left 93/46%) | died/died (hp lost 100/100%, boss left 92/87%) | died/died (hp lost 100/100%, boss left 67/65%) | x1 | n (0%) | mash landed 2 or fewer blows in 1/6 fights; level-1 hero: 0/3 mash wins |
| 36 | lance | storm | 0/6 | died/died (hp lost 100/100%, boss left 86/76%) | died/died (hp lost 100/100%, boss left 98/98%) | died/died (hp lost 100/100%, boss left 79/79%) | x0 | n (0%) | mash landed 2 or fewer blows in 2/6 fights; level-1 hero: 0/3 mash wins |
| 37 | kraken | causeway | 0/6 | timeout/timeout (hp lost 59/59%, boss left 86/86%) | died/died (hp lost 100/100%, boss left 87/87%) | died/died (hp lost 100/100%, boss left 86/86%) | x0 | n (0%) | level-1 hero: 0/3 mash wins; 2 timeouts (the mash bot neither won nor died in the time allowed) |
| 38 | frog | marsh | 0/6 | died/died (hp lost 100/100%, boss left 100/91%) | died/died (hp lost 100/100%, boss left 98/61%) | died/died (hp lost 100/100%, boss left 89/100%) | x0.5 | n (0%) | mash landed 2 or fewer blows in 3/6 fights; level-1 hero: 0/3 mash wins |
| 39 | golem (mini) | spire | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 82/82%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |
| 40 | strawking | fields | 0/6 | timeout/timeout (hp lost 0/0%, boss left 97/100%) | timeout/timeout (hp lost 0/0%, boss left 86/85%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | x0.45 | n (0%) | mash landed 2 or fewer blows in 3/6 fights; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 41 | herald | longwater | 0/6 | timeout/timeout (hp lost 56/59%, boss left 97/100%) | timeout/timeout (hp lost 56/67%, boss left 98/98%) | timeout/timeout (hp lost 89/77%, boss left 90/90%) | x0.35 | n (0%) | mash landed 2 or fewer blows in 3/6 fights; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 42 | closedhelm | waymeet | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 88/88%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |
| 43 | archmage | mage | 0/6 | died/died (hp lost 100/100%, boss left 99/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/99%) | x0 | n (0%) | mash landed 2 or fewer blows in 4/6 fights; level-1 hero: 0/3 mash wins |
| 44 | chief | stockade | 0/6 | timeout/timeout (hp lost 0/0%, boss left 100/100%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | timeout/timeout (hp lost 0/0%, boss left 100/100%) | x1 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 45 | winchmaster | oreroad | 0/6 | timeout/timeout (hp lost 99/99%, boss left 100/100%) | timeout/timeout (hp lost 99/99%, boss left 100/100%) | timeout/timeout (hp lost 99/99%, boss left 100/100%) | x0.5 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins; 6 timeouts (the mash bot neither won nor died in the time allowed) |
| 46 | king | kings | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x0 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins |
| 47 | gargoyle | witchlight | 0/6 | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | died/died (hp lost 100/100%, boss left 100/100%) | x0 | n (0%) | UNREACHABLE: the mash bot landed 2 or fewer blows in every fight (he flies, swims, sits out of reach, is shielded, or needs a jump or a mechanic first); the hero dies or times out regardless; level-1 hero: 0/3 mash wins |

## Levels (knight-first; the best mash hero shown), worst first (cleared = it neither died nor dropped under 40%)

| level | hero level | best mash hero | lowest hp | hp lost (sum) | deaths | waypoints walked | lifts | cleared the level? |
|---|---|---|---|---|---|---|---|---|
| storm | 10 | knight | 74% | 26% | 0 | 100% | 58 | YES (a walk) |
| keep | 18 | knight | 61% | 83% | 0 | 100% | 25 | YES (a walk) |
| causeway | 19 | knight | 51% | 49% | 0 | 100% | 45 | YES (a walk) |
| theatre | 21 | knight | 49% | 69% | 0 | 100% | 48 | YES (a walk) |
| longwater | 12 | knight | 44% | 97% | 0 | 100% | 44 | YES (a walk) |
| spore | 3 | knight | 26% | 96% | 0 | 100% | 45 | no |
| marsh | 1 | knight | 19% | 221% | 0 | 100% | 37 | no |
| deep | 17 | knight | 13% | 131% | 0 | 100% | 21 | no |
| unburied | 26 | knight | 4% | 132% | 0 | 100% | 41 | no |
| oreroad | 9 | knight | 3% | 99% | 0 | 100% | 27 | no |
| fields | 23 | knight | 1% | 99% | 0 | 100% | 68 | no |
| wood | 1 | knight | 0% | 194% | 1 | 100% | 47 | no |
| stockade | 2 | knight | 0% | 241% | 2 | 100% | 43 | no |
| kings | 4 | knight | 0% | 100% | 1 | 100% | 56 | no |
| scree | 5 | knight | 0% | 202% | 1 | 100% | 47 | no |
| hanging | 6 | knight | 0% | 125% | 1 | 100% | 42 | no |
| spire | 7 | knight | 0% | 100% | 1 | 100% | 40 | no |
| moor | 8 | knight | 0% | 330% | 2 | 100% | 61 | no |
| crown | 11 | knight | 0% | 630% | 5 | 100% | 103 | no |
| reef | 13 | knight | 0% | 118% | 1 | 100% | 34 | no |
| flotilla | 14 | knight | 0% | 183% | 1 | 100% | 28 | no |
| hurricane | 15 | knight | 0% | 245% | 1 | 100% | 52 | no |
| lamplit | 16 | knight | 0% | 153% | 1 | 100% | 58 | no |
| underleaf | 5 | knight | 0% | 146% | 1 | 100% | 41 | no |
| harbor | 20 | knight | 0% | 329% | 3 | 100% | 84 | no |
| waymeet | 20 | knight | 0% | 180% | 1 | 100% | 63 | no |
| undercrown | 12 | knight | 0% | 326% | 3 | 100% | 40 | no |
| burial | 24 | knight | 0% | 163% | 1 | 100% | 63 | no |
| mage | 26 | knight | 0% | 285% | 2 | 100% | 59 | no |
| fallingtower | 27 | knight | 0% | 211% | 2 | 100% | 59 | no |
| burning | 3 | knight | 0% | 183% | 1 | 100% | 41 | no |
| witchlight | 25 | knight | 0% | 168% | 1 | 100% | 53 | no |
| caravan | 28 | knight | 0% | 203% | 1 | 100% | 50 | no |
| fair | 22 | knight | 0% | 202% | 1 | 100% | 58 | no |

Caveats: LEVEL mode lifts the hero past every stretch it cannot cross (gaps, walls, machines), so its hp numbers are a floor on the danger a real mash player meets, not a ceiling. "hp lost (sum)" counts every point lost, so healing in the level lets it pass 100%. The mash bot cannot jump, so a boss that flies or sits on a ledge may simply be out of its reach (the notes say so); that is a real answer to "does mashing win" but not a measure of how hard the boss is to a thinking player. The chip number is the boss's own damage gate at the moment of the probe, and some bosses change it by phase. The cache is stamped with the level's data, so a boss-module change needs a re-run.
