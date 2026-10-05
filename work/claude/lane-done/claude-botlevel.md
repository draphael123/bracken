# BOTLEVEL report - claude/botlevel (base master 2423ff42)

Brief (Daniel, 10-05): every boss is measured at its CAMPAIGN LEVEL. This lane made the measuring tools agree, re-measured every live boss and
mini on master at that level, and explains the Death Knight gap. No boss, mini, level or threshold was touched.

## 1. Tool audit (grep of tools/ for bossLab / setHeroLevel / xpFloor / pilot)

What the hero was, per tool, BEFORE this lane:

| group | tools | hero before | now |
|---|---|---|---|
| campaign level, setHeroLevel (xp + even card spread) | combat-pilots, djinn-rates, harnesscard-rates, mash-bot, redgorge-pilot, welltown-pilot, puppeteer-bot21 and the puppeteer.mjs check (both hand-do xp + evenCard = the same thing) | right | unchanged; all but mash-bot and the puppeteer pair now also take --level=N / --hero-level=N |
| campaign level but the WRONG hero (xpFloor alone: no level-up card, a weaker hero) | **deathknight-pilot** | L27 hero without the Vigor/Endurance/Might picks | setHeroLevel; --level=N |
| opt-in only | puppeteer-pilot (`--depth`) | level 1 unless --depth | campaign level by default; `--l1` = the old level-1 hero |
| NEVER levelled (fought a fresh LEVEL-1 hero) | 32 per-boss pilots (all `*-pilot(s).mjs`): archmage, bell, botfix, burial2, buried-dead, crouch-a, crouchb, duck, duneworm, ember, fat, firsthour, folly, gargoyle, grave-warden, greenteeth, hanging, hedge-warden, kraken, lance, mother-hard, moor, pyromancer, queen, ram, reefmaw, sexton, unburied, unburied3, weakboss, wicker-queen, winchmaster | level 1 | campaign level of the boss they fight, via the shared helper |

The shared helper is `tools/boss-level.mjs`: `campaignLevel(id)` (depth on the gate chain, min 1), `levelOverride()` (`--level=N`, `--hero-level=N` or env
HERO_LEVEL=N; N = the hero's level, `--level=1` is the old behaviour) and `openLevelPage` - `openPage` that, before any evalp calling `BK.bossLab(`, sets EVERY hero to
`campaignLevel(<the one boss named in bosses:[..]>)` with `BKT.setHeroLevel`, no skills, no talents. A pilot already calling setHeroLevel is left alone; a run of
several bosses in one call cannot have one level, so it is left at the page default with a console note. The 32 pilots only changed their import line
(`import { openLevelPage as openPage }`), so a reopen after a crash keeps the rule. Verified: greenteeth-pilot warden salt 1 = 75.6 s win (same as
combat-pilots at L21); with `--level=1` it dies at 144 s.
`tools/harnesscard-rates.mjs` also got `--from=S` (first seed, to re-run one row). None of the edited tools is in the suite (check.mjs) and none is spawned by a check.

NOT changed - checks and probes that fight a level-1 hero on purpose or assert a level-1 number (listed, not loosened): audit-audio, boss-navigation (all
levels at L1 except theatre/knight L22), combat-acceptance, combat-replay, normal-health, small-adds, lab-reach, lab-clock, queen-court, popclutter,
mother-pilot, pyre-pilot, herald-pirate, headless (boss lab sweep), geomancer-pilots, fair-pilot and level1-pilot (level 0/1 by design), levelling-balance
(sets every hero to the level it is sweeping, on purpose). Their thresholds were calibrated on level-1 heroes; moving them to campaign level needs a
suite run and re-derived (never loosened) thresholds - a coordinator decision, so I did not.

## 2. Every live boss and mini at campaign level (master 2423ff42)

Tool: `node tools/harnesscard-rates.mjs <level>[:mini] --mode=new --seeds=6 --secs=240` (setHeroLevel at the level's depth, no skills, normal health, bossLab
human bot ~250 ms, the seed passed into bossLab so each seed is a different fight). 6 seeds x knight/warden/pyro = 18 fights per row, 918 fights, same
settings for all 51 rows. 23 fights were lost to the page (dynamic-import fetch / lab-init failures under load) and re-run singly with `--from`; every row is
real fights. Noise at n=18 is about +-12 points (n=6 per hero about +-20): read ranks, not decimals. Boss names are the arena ids' common names. Bands:
bosses 50-60% overall with no hero at 0; minis 70-75%. "out of band" = points beyond the band edge (+ above, - below).

Ranked retune list (all-three-heroes-zero first, then zero-hero rows, then by distance):

| # | level : boss | hero L | knight | warden | pyro | overall | band | out of band | zero hero |
|---|---|---|---|---|---|---|---|---|---|
| 1 | spire: Golem (mini) | 7 | 0/6 | 0/6 | 0/6 | 0/18 = 0% | 70-75 | -70 | knight, warden, pyro |
| 2 | burial: Buried Dead | 25 | 0/6 | 0/6 | 0/6 | 0/18 = 0% | 50-60 | -50 | knight, warden, pyro |
| 3 | causeway: Kraken | 19 | 0/6 | 0/6 | 0/6 | 0/18 = 0% (all timeouts) | 50-60 | -50 | knight, warden, pyro |
| 4 | deep: Bell Crab | 17 | 0/6 | 0/6 | 0/6 | 0/18 = 0% | 50-60 | -50 | knight, warden, pyro |
| 5 | oreroad: Winchmaster | 9 | 0/6 | 0/6 | 0/6 | 0/18 = 0% | 50-60 | -50 | knight, warden, pyro |
| 6 | storm: Queen's Lance | 10 | 0/6 | 0/6 | 0/6 | 0/18 = 0% | 50-60 | -50 | knight, warden, pyro |
| 7 | wood: Hornet Queen | 1 | 0/6 | 0/6 | 0/6 | 0/18 = 0% | 50-60 | -50 | knight, warden, pyro |
| 8 | mage: Archmage (Folly) | 27 | 0/6 | 0/6 | 1/6 | 1/18 = 6% | 50-60 | -44 | knight, warden |
| 9 | fields: Straw King | 24 | 0/6 | 0/6 | 2/6 | 2/18 = 11% | 50-60 | -39 | knight, warden |
| 10 | underleaf: Grandmother (secret) | 5 | 0/6 | 2/6 | 0/6 | 2/18 = 11% | 50-60 | -39 | knight, pyro |
| 11 | scree: Scree ram | 5 | 0/6 | 0/6 | 4/6 | 4/18 = 22% | 50-60 | -28 | knight, warden |
| 12 | canal: Jenny Greenteeth | 21 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 13 | fair: Wicker Queen | 23 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 14 | flotilla: Quartermaster | 14 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 15 | harbor: Harbormaster | 20 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 16 | kings: Drowned Kings (king) | 4 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 17 | lamplit: Tollmaster | 16 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 18 | longwater: Herald | 12 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 19 | unburied: Death Knight | 27 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 20 | undercrown: Prince (secret) | 12 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 21 | waymeet: Closed Helm | 20 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 50-60 | +40 | - |
| 22 | kings: Greathound (mini) | 4 | 3/6 | 0/6 | 6/6 | 9/18 = 50% | 70-75 | -20 | warden |
| 23 | reef: Reefmaw | 13 | 6/6 | 6/6 | 5/6 | 17/18 = 94% | 50-60 | +34 | - |
| 24 | spore: Spore Mother | 3 | 6/6 | 6/6 | 5/6 | 17/18 = 94% | 50-60 | +34 | - |
| 25 | hanging: Owl Reeve | 6 | 2/6 | 4/6 | 0/6 | 6/18 = 33% | 50-60 | -17 | pyro |
| 26 | crown: Goblin Queen | 11 | 3/6 | 0/6 | 4/6 | 7/18 = 39% | 50-60 | -11 | warden |
| 27 | keep: Drowned King (keep) | 18 | 5/6 | 0/6 | 2/6 | 7/18 = 39% | 50-60 | -11 | warden |
| 28 | burial: Grave Warden (mini) | 25 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 70-75 | +25 | - |
| 29 | fields: Ploughman (mini) | 24 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 70-75 | +25 | - |
| 30 | lamplit: Lampreeve (mini) | 16 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 70-75 | +25 | - |
| 31 | mage: Homunculus (mini) | 27 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 70-75 | +25 | - |
| 32 | unburied: Barrow Rider (mini) | 27 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 70-75 | +25 | - |
| 33 | waymeet: Lancer (mini) | 20 | 6/6 | 6/6 | 6/6 | 18/18 = 100% | 70-75 | +25 | - |
| 34 | hurricane: Captain | 15 | 6/6 | 6/6 | 0/6 | 12/18 = 67% | 50-60 | +7 | pyro |
| 35 | marsh: Bullfrog King | 1 | 1/6 | 1/6 | 3/6 | 5/18 = 28% | 50-60 | -22 | - |
| 36 | moor: Windcaller | 8 | 3/6 | 1/6 | 1/6 | 5/18 = 28% | 50-60 | -22 | - |
| 37 | witchlight: Hedge Warden (mini) | 26 | 1/6 | 3/6 | 5/6 | 9/18 = 50% | 70-75 | -20 | - |
| 38 | hanging: Spider (mini) | 6 | 6/6 | 0/6 | 6/6 | 12/18 = 67% | 70-75 | -3 | warden |
| 39 | harbor: Bosun (mini) | 20 | 6/6 | 6/6 | 0/6 | 12/18 = 67% | 70-75 | -3 | pyro |
| 40 | redgorge: Red Crab | 31 | 5/6 | 3/6 | 6/6 | 14/18 = 78% | 50-60 | +18 | - |
| 41 | spire: False Abbot | 7 | 3/6 | 6/6 | 5/6 | 14/18 = 78% | 50-60 | +18 | - |
| 42 | caravan: Dune Worm | 29 | 6/6 | 1/6 | 6/6 | 13/18 = 72% | 50-60 | +12 | - |
| 43 | stockade: Stockade chief | 2 | 1/6 | 3/6 | 3/6 | 7/18 = 39% | 50-60 | -11 | - |
| 44 | welltown: Gang Leader (mini) | 30 | 3/6 | 3/6 | 5/6 | 11/18 = 61% | 70-75 | -9 | - |
| 45 | fallingtower: Undead Archmage | 28 | 6/6 | 1/6 | 5/6 | 12/18 = 67% | 50-60 | +7 | - |
| 46 | witchlight: Gargoyle | 26 | 6/6 | 2/6 | 4/6 | 12/18 = 67% | 50-60 | +7 | - |
| 47 | crown: Forgemaster (mini) | 11 | 3/6 | 6/6 | 5/6 | 14/18 = 78% | 70-75 | +3 | - |
| 48 | fallingtower: Sexton (mini) | 28 | 4/6 | 4/6 | 4/6 | 12/18 = 67% | 70-75 | -3 | - |
| 49 | burning: Pyromancer | 3 | 3/6 | 2/6 | 6/6 | 11/18 = 61% | 50-60 | +1 | - |
| 50 | theatre: Puppeteer | 22 | 3/6 | 4/6 | 3/6 | 10/18 = 56% | 50-60 | in band | - |
| 51 | welltown: Djinn | 30 | 4/6 | 1/6 | 5/6 | 10/18 = 56% | 50-60 | in band | - |

(The ordering inside the table is "zero-hero rows weighted +15 on top of the distance"; rows 34-49 are the near-band ones.)

Summary: bosses 2/37 in band (Puppeteer 56%, Djinn 56%); 19 above 60%, 16 below 50%. Minis 0/14 in band; 7 above 75%, 7 below 70%.

### Read this table with these caveats
1. **Seven rows are 0/18 across all three heroes** (spire mini Golem, burial, causeway/Kraken, deep/Bell Crab, oreroad/Winchmaster, storm/Lance, wood).
   Kraken is 18/18 TIMEOUTS (boss left 82%): the lab bot never gets a fight going. Bell Crab, Winchmaster, Burial, Lance and the Golem use special-cased bot
   branches in src/lab.js. Before retuning any of them, run the boss's own pilot at campaign level (the pilots do that now by default). These may be BOT gaps,
   not balance; I did not tell them apart.
2. **Wood (depth 0) and Marsh (depth 1) are measured with a LEVEL-1 hero** because depthsOf gives them 0 and 1. A real player reaches the Hornet Queen with
   some XP from the level. Wood is 0/18 (hero hp 110). See question 1.
3. **Warden is the worst hero**: 0/6 on Kings mini, Crown, Keep, Hanging mini, Fields, Mage, Scree, Burial; 1/6 on Djinn, Dune Worm, Undead Archmage, Marsh,
   Moor. Health cannot fix that (INTEG67 said the same): warden-kit work. Pyro is 0/6 on Hanging, Hurricane, Harbor mini.
4. **Above band at 100%** (18/18): Jenny, Wicker Queen, Quartermaster, Harbormaster, Drowned King, Tollmaster, Herald, Death Knight, Prince, Closed Helm and six
   minis. Herald, Jenny, Wicker Queen and the Death Knight were retuned at level 1 or on the XP-only hero; at campaign level they are all too easy. JENNY3
   retunes Jenny on its own branch (not on master).
5. Rank for a coordinator, biggest gap first: the all-zero rows (maybe bot); Archmage (Folly) 6%; Straw King 11%; Grandmother 11%; Scree ram 22%;
   Greathound mini 50% (warden 0/6); Owl Reeve 33% (pyro 0); Marsh and Moor 28%; on the easy side the eleven 100% bosses at +40, Reefmaw/Spore Mother 94%, the
   six 100% minis at +25, Red Crab 78%, False Abbot 78%.

## 3. The Death Knight gap, concretely (21/21 vs 57%)

Same tree (master), the Death Knight (unburied boss), knight/warden/pyro, salts 1-4 (12 fights each):

| hero setup | tool | result |
|---|---|---|
| level 27 by `P0.xp[h]=xpFloor(27)` only (no level-up card) | tools/deathknight-pilot.mjs as it was | **7/12 = 58%** (knight 4/4, warden 0/4, pyro 3/4) = INTEG67's 57% |
| level 27 by BKT.setHeroLevel (xp + even card) | deathknight-pilot fixed (= what combat-pilots does) | **12/12 = 100%** (4/4 each) = UNBURIED4's 21/21 |
| level 1 | `--level=1` | **0/12** |

So the gap is the hero, not the boss or the seeds: deathknight-pilot levelled the hero by XP alone (the pre-HARNESSCARD harness: no Vigor/Endurance/Might
picks), combat-pilots by setHeroLevel (real-play stats). The card spread is worth about 40 points on this boss (warden 0/4 to 4/4). DK3's hp 1700 (and every
"after retune" number INTEG67 gave for the DK) was tuned on the weaker hero. The full 18-fight measurement above agrees with UNBURIED4: 18/18.
tools/puppeteer.mjs (a check) and puppeteer-bot21 hand-do xp + evenCard, which equals setHeroLevel; only deathknight-pilot lacked the card.

## Checks
syntax and homepaths green. dangling-paths was red only because the new tools/boss-level.mjs was not yet committed (it is in this commit). No suite run: this
is a measurement lane and no game file or threshold changed.

## UNVERIFIED
- The 0/18 rows: bot gap or boss? Boss names in the table are the common names for the arena ids.
- Noise: 18 fights per row; one fight is 5-17 points.
- Wood/Marsh/Stockade/Spore/Burning (depth 0-3) with a more realistic hero (question 1).

## QUESTIONS FOR DANIEL (recommendation first)
1. Wood/Marsh/Stockade/Spore/Burning sit at depth 0-3, so the "campaign level" hero is level 1-3, but a player has real XP from the level before the boss.
   Rec: use depth + the XP of the level just played (or a floor of L3), then re-measure those rows. Built: depth only, as briefed.
2. The seven 0/18 rows. Rec: a bot-vs-boss triage lane first (does the lab bot play Kraken, Bell Crab, Winchmaster, Lance at all?) before any retune.
3. Move the suite checks listed under "NOT changed" to campaign level? Rec: yes, one at a time with thresholds re-derived (never loosened), a separate lane.
4. Warden is at 0-1/6 on 14 rows. Rec: a warden-kit (survival) lane, not boss hp.
5. Many bosses retuned this week (DK 1700, Archmage 2000, Wicker Queen 2140, Jenny 755) were tuned on the level-1 or XP-only hero and are now 95-100%.
   Rec: the retune lanes re-measure at campaign level with the fixed tools before the next hp change.
