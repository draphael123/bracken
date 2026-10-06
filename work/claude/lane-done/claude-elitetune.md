# ELITETUNE (claude/elitetune) - per-kind health, damage and tempo toward the human bot's 75-85%

Base: claude/elites2 1e57a2b8. Only `src/elite-kit.js` rows (the new `TUNE` table: hp, dmg, tell, every multipliers per kind) plus three
one-line hooks in `src/main.js` (import `tuneOf`; hp at elite make; dmg in `damagePlayer0`). No new moves, no AI change, no boss change.
`tell` is windup length (shortened never under 0.5 s, never longer than built), `every` is the gap between his moves.

## Method and the noise
The human bot is near-deterministic: per kind only ~3 distinct outcomes (one per hero), so a rate is 0/33/67/100% and "75-85%" is only
reachable as 5/6 (83%) with the repeated seeds. Six passes (2 seeds x 3 heroes), final pass with mash x3. Run-to-run the same kind moved
+-1 hero with no change at all (shield, pike, armour, husk flipped 83<->100). I counted a kind IN BAND when it sat at 83% in the majority of passes.

## Table (human wins of 6; before = docs/elite-lab.json of ELITES2; after = final pass; band = 75-85)
| kind | before | after | change (TUNE row) | band |
|---|---|---|---|---|
| shield | 100 | 83-100 (83 in 3 of 4 passes) | dmg 1.25, tell .85, every .85 | in (borderline) |
| thorn | 50 | 83 | dmg .7, hp .85 | in |
| brute | 100 | 83 | dmg 1.5, tell .85, every .7 | in |
| troll | 100 | 100 (83 in one pass) | hp 1.2, dmg 2.8, tell .85, every .6 | OUT (too easy) |
| goat | 67 | 67 (50-56 in others) | dmg .4, hp 1.0, every 1.6 | OUT (too hard; warden/pyro die to the call) |
| pike | 83 | 83-100 | dmg .85 | in (borderline) |
| heavy | 100 | 83 | dmg 2.2, tell .85, every .5 | in |
| hearthgob | 100 | 100 | hp 1.2, dmg 1.5, tell .85, every .5 | OUT: the bot is never hit |
| tideguard | 100 | 100 | hp 1.2, dmg 1.5, tell .85, every .5 | OUT: never hit |
| boarder | 100 | 83 | hp 1.3, dmg 1.8, tell .85, every .55 | in |
| cutlass | 67 | 67 | hp .8, dmg .7, every 1.5 | OUT: knight cannot catch a SWIFT first mate (timeouts) |
| watch | 100 | 100 | hp 1.2, dmg 1.5, tell .85, every .5 | OUT: never hit |
| hedgeknight | 100 | 100 | dmg 2.2->2.6, tell .85, every .55 | OUT: easy |
| scarecrow | 83 | 83 | dmg .85, every 1.1 | in |
| husk | 67 | 67-100 (83 in 3 passes) | dmg 1.2 | borderline |
| armour | 83 | 83-100 | none | in (borderline) |
| cutthroat | 100 | 100 | dmg 2.6, tell .85, every .55 | OUT: easy |
| hobbyhorse | 50 | 50 | dmg 1.15 (see below) | OUT: its SWIFT charge cannot be caught (timeouts) |
| gaffer | 100 | 83 | hp 1.4, dmg 1.6, tell .85, every .6 | in |
| scorpion | 67 | 67 | hp 1.1, dmg .85 | OUT (a hero short) |
| archer | 33 | 67 | hp .5, dmg .6 | OUT (knight cannot reach him: timeout) |
| apprentice | 67 | 67 | dmg 1.0, tell .85, every .8 | OUT (a hero short) |
| barker, drownedcaptain | - | untouched | report-only | - |

In band at the end: thorn, brute, heavy, boarder, scarecrow, gaffer (83 on the final pass) and shield, pike, armour, husk (83 in most passes).
Out: troll, hearthgob, tideguard, watch, hedgeknight, cutthroat (still 100%); goat, cutlass, hobbyhorse, scorpion, archer, apprentice (50-67%).
Mash: 0 wins on every kind but the two report-only (final pass; goat and hobbyhorse re-measured at mash x3 each hero: 0).

## Why the rest do not move (needs a move change, out of scope)
- hearthgob, tideguard, watch (and mostly hedgeknight/cutthroat): hero hp is 100% on nearly every win. His told blows never land on the
  bot, so damage and cadence do nothing; the tells are already 0.5-0.55 s (the floor), so they cannot be shortened. Lifting hp to chase
  it only pushed fights to 45-50 s, so hp was brought back.
- cutlass, hobbyhorse, archer: the lab's knight times out (60 s) against a SWIFT first mate, the hobby-horse's charge and the archer's kiting:
  an unreachable-opening problem (a move/AI fix, not a number).
- hobbyhorse: a mash-bot win (pyro, 5% hp left) appeared once at hp x.7 and once untuned, so it got dmg 1.15 as a margin; its human rate stays 50%.

## Checks run (all exit 0)
elites (48 elites ok), tells, answer-tags, combat-part2, mash-gate green. curve-gate exits 0 but says storm, crown, witchlight, unburied, fair
rows are "stale" (not measured; no level data changed here). tells lists two pre-existing unmarked windups in updateScalder (a non-elite).
docs/elite-lab.json re-stamped by the tool.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. hearthgob/tideguard/watch/hedgeknight/cutthroat/troll are at 100%: only a move change (a faster second move, a cut that cannot be
   perfectly read at human speed) can fix them. Rec: a small follow-up lane that changes one move per kind, or accept them as "easy elite".
2. cutlass/hobbyhorse/archer need an opening for a melee hero (a told stop or a slower SWIFT). Rec: drop SWIFT on the hobby-horse and first mate.
3. The bot gives 3 distinct outcomes per kind, so the 75-85% band cannot be measured finer than 83%/67%. Rec: your playtest of one elite per act.
