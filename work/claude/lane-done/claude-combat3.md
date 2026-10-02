# claude/combat3: the combat pass (Opus, overnight 2026-10-01)

Daniel's target: Hollow Knight / Salt and Sanctuary. On master, the mash bot (`tools/mash-bot.mjs`) beat 18 of 34 bosses and 12 of 13 minis, and bosses took full damage outside their openings ("the boss is just attack, attack").

Branch `claude/combat3`, based on master 3fd06c78. origin/master (canal + Jenny Greenteeth) is merged in. Nothing here ships without Daniel's review.

## Headline numbers (mash bot, `docs/mash-bot.json`, re-run with `--all --l1 --probe`)

| | before (master) | after |
|---|---|---|
| bosses the mash bot beats at least once | **18 of 34** | **9 of 34** (Greenteeth, new from master, holds: 0/6) |
| boss fights won by mashing | 56 of 204 | 21 of 204 |
| minis the mash bot beats at least once | 12 of 13 | 12 of 13 |
| mini fights won by mashing | 66 of 78 | 44 of 78 |
| levels a mashing knight clears (no death, never under 40%) | 5 of 34 | 4 of 34 |

**What the global boss rule alone fixed.** These nine bosses were beaten by mashing before and now hold in every fight:

| boss | before | after |
|---|---|---|
| Blood Knight | 6/6 | 0/6 |
| Captain | 6/6 | 0/6 |
| Harbormaster | 4/6 | 0/6 |
| Dune Worm | 4/6 | 0/6 |
| Abbot | 3/6 | 0/6 |
| Buried Dead | 2/6 | 0/6 |
| Pyromancer | 2/6 | 0/6 |
| Reefmaw | 1/6 | 0/6 |
| Bellcrab | 1/6 | 0/6 |

Two more bosses improved but are still beaten sometimes:
- Wicker Queen: 4/6 to 1/6
- Tollmaster: 5/6 to 2/6

The boss table is almost all the boss rule's doing. The foe changes touch only the adds' common blows.

**Remaining worst list, for the boss waves** (the mash bot still wins):
- Puppeteer 5/6. His own x0.05 ward was already there; mashing his puppets drops him into his own opening.
- Windcaller 4/6. `callerOpen` counts his casting modes as open, so he is open a lot of the time.
- Ram, Owl, Tollmaster, Grandmother (no opening: exempt), Drowned King: 2/6 each.
- Spore Mother, Wicker Queen: 1/6 each.
- Minis: Greathound 6/6, Bosun 6/6, Lancer 6/6, Homunculus 5/6, Lampreeve 4/6, Ploughman 4/6, Spider 3/6, Sexton 3/6, Gravewarden 2/6, Hedgewarden 2/6, Barrowrider 2/6, Forgemaster 1/6, Golem 0/6.
  - Minis keep full damage taken, as the brief asked. The greed punish and harder hits raised the hero's losses a lot: the Greathound mash cost 0-14% before and 28-63% after.
- Levels a mashing knight still clears: storm, keep, causeway, deep.
  - The level-mode numbers are noisy, because the bot is lifted past gaps.
  - Longwater (44% to 28%) and theatre (49% to 39%) now hold.

**Human-speed bot** (`node tools/combat-pilots.mjs`, new). This is `BK.bossLab` at NORMAL health (the hero can die), with the hero at the level's campaign depth and no skills. Knight, warden and pyro, one seed each. Before is master in a throwaway worktree.

| boss | before | after |
|---|---|---|
| wood (Hornet Queen) | 2/3 | 2/3 |
| marsh (Bullfrog) | 2/3 | 2/3 |
| stockade (Chief) | 3/3 | 2/3 |
| hurricane (Captain) | 3/3 | 2/3 |
| unburied (Blood Knight) | 3/3 | 3/3 |
| lamplit (Tollmaster) | 2/3 | 3/3 |
| harbor (Harbormaster) | 3/3 | 3/3 |
| moor (Windcaller) | 2/3 | 2/3 |
| spire (Abbot) | 3/3 | 2/3 |
| fair (Wicker Queen) | 3/3 | 3/3 |
| burning (Pyromancer) | 3/3 | 2/3 |
| longwater (Herald) | - | 1/3 |
| **total** | **29/33 = 88%** | **26/33 = 79%** (27/36 with longwater) |

Fairness target is 60-75%:
- **Easy-side outliers (3/3):** Blood Knight, Tollmaster, Harbormaster, Wicker Queen.
- **Hard-side outlier:** the Herald at 1/3.
- All the fights got longer. The Blood Knight now takes 56-107 s; it was 32-40 s.

## What changed (every knob, old -> new)

### 1. The global boss rule: `src/boss-greed.js` (new)
- **One opening predicate per boss and mini (`OPEN_RULE`).** It covers all 35 campaign bosses (with Greenteeth) and all 13 minis. These are the windows each boss's own code already paid more for.
  - `BK.bossOpen` now asks this table first, so the lab bot, the mash probe and the chip all read the same predicate.
  - A boss broken by his poise bar (`e.broken`) counts as open.
- **The chip.** A hero's blow on THE boss outside an opening lands at x0.05 of the raw blow.
  - Only a hero's blow is chipped: one that went through `hurtAs`, plus his burn. Damage from the room is a mechanic and lands whole (cannons, kegs, chandeliers, crates, `BKT.hurtEnemy`).
  - Fractions are carried, not rounded up.
  - The chip is applied by `bossChip()`, which wraps the untouched `wardedDamage()`. The false-abbot check pins that function's text.
- **No stacking.** The result is the smaller of what the boss's own code gave and the chip. Bosses with their own twentieth keep their own number (`OWN_WARD`: puppeteer, wickerqueen, greenteeth).
- **Exempt, as boss-wave TODOs (`NO_OPENING`):**
  - Grandmother: no opening in code, so she is left at full damage.
  - Spore Mother and Kraken: no blade reaches the body; their openings are the heart and the arms.
  - The minis bosun, greathound and spider have no opening rule. Every blow on them counts toward greed.
- **Bosses with their own chip (`GREED.chipBy`), each tuned by the human-bot pilot.** All three are questions below.
  - Hornet Queen, the first boss: x1 (her own swarm armour stays). At 0.05, 0.25 and 0.5 the bot won only 0-1 of 3.
  - Pyromancer: x0.25. Hitting him is his mechanic. At 0.05 the bot won 1/3; at 0.25, 2/3.
  - Herald: x0.2 (he was x0.35 outside mired/reel). At 0.05 his fight ran 121-365 s, and `pyre-pilot` and `boss-navigation` failed their 180 s rows. At 0.2 it runs 63-247 s and both checks are green.
- **The greed reprisal (new; nothing like it existed).**
  - A boss answers `GREED.n` = 4 hero blows outside an opening within 2.5 s. A red `!!` goes up over him and a red ring closes on him for 0.6 s (`GREED.tell`). Then a burst of 16 base damage (unblockable; step or roll out) hits within 60 px of his body, and the line `TOO GREEDY: HE HITS BACK` shows. Cooldown 3 s.
  - It runs beside his own AI, so every boss has it without touching his code.
  - Blows inside an opening never count.
  - The Pyromancer is excluded from greed (`NO_GREED`), because blows are what open him.
- **Minis:**
  - They keep full damage taken.
  - Greed: 4 blows (`nMini`), a 26-damage burst (`dmgMini`), 1.5 s cooldown (`coolMini`).
  - Their own blows land x1.3 (`GREED.miniHit`, in `damagePlayer0`).
- **Feedback:**
  - A chipped blow clanks with a grey spark and shows no "0".
  - The first time, `A SCRATCH: WAIT FOR HIS OPENING` shows, plus a two-time hint. Both lines are in `src/hint-lines.js`.
- **Lab bot (`src/lab.js`):** a human stops one blow short of greed. The bot holds its ground at sword's length and keeps answering, but stops swinging until the count drains. It steps out of a closing reprisal ring.
- **Mash probe:** now strikes with `hurtAs('light')` (a hero's blow) and restores the greed state afterwards.

### 2. Foes: `src/foe-tempo.js` (new) plus `src/combat.js`
- **One tempo knob, applied on the token grant, before the foe-tactics held beat:**
  - The windup is x0.8 (`TEMPO.tell`), never under 0.3 s (`tellFloor`).
  - A red `!!` keeps its full length.
- **Only the 54 kind|modes measured to count down on `e.modeT` are tightened (`TIGHT`).**
  - `node tools/foe-tempo.mjs --probe` finds them; each measured x0.79-0.86.
  - Left alone, and listed in the file: the sprig (its held beat makes timing noisy), foes that tell on their own clock (cutthroat, scorpion, slinger and others), foes that need water, and foes that need their own level.
- **Faster recovery:**
  - A foe's reload after its token is returned: x0.75 (floor 0.2 s).
  - `TOKENS.rest` 0.7 -> 0.55.
- **Damage:** `COMBAT.commonDamage` 1.25 -> **1.6** (+28% on every common blow).
- **Fewer hearts (`HEAL`):**
  - Crate heart chance 0.3 -> **0.1**.
  - An elite captain pays gold and **no heart** (he always dropped one before).
  - Kept, as designed rewards: the ambush room's heart, the dead-end stash hearts, and the boss-win heart.
- Attack tokens stay at 2 per hero. Death cost and checkpoints are untouched; their checks are green.

### 3. Hero verbs
- **Ground up-slash is the slash from the feet.**
  - ArrowUp and W are both jump keys. A jump from an UP key on the ground waits 3 frames (`UP_SLASH.grace` 0.05 s) for an attack. If one comes, the jump is eaten and the attack is the up-slash.
  - With no attack, he jumps 3 frames later. Z, Space, K and the pad's A jump at once, unchanged.
  - The basic `risingCut()` on the ground no longer leaps the hero (`UP_SLASH.groundLeap` false). It still launches common foes, and uses each hero's own rise frames.
  - The leaping uppercut stays for a cut thrown within 0.18 s of a jump.
  - The bought F-key Rising Cut is unchanged.
- **New air up-slash for all 7 heroes.** Up + X in the air, past the jump's first 0.18 s.
  - Each hero has his own box overhead (`UP_SLASH.air`).
  - It counts as a 'rise' blow.
  - It has OWN frames per hero: `F.airUp`, generated by `directionalPoses` in `src/chars.js` from each hero's own weapon and body. They include a crescent trail.
  - These are procedural placeholder-quality poses. A Sonnet art lane could hand-polish them (see questions).
- **Freebooter held heavy:** kept as the pistol, which is justified. His held blow already counts as `['heavy','shot']` in the family table and for any "held heavy cracks armour" weak point (verb-matrix proves it lands as heavy).
- **Verb matrix asserted** (`tools/verb-matrix.mjs`): 7 heroes x ground up (real keyboard events, no jump) / air up / plunge / held heavy / dash cut / air attack / low sweep.
  - On master it is red for all 7 heroes: the ground up-slash jumped, and there was no air up-slash.
  - Found while building it: the Pyromancer's plunge onto a head lands as an UNNAMED blow, not 'plunge'. Her firedrop spares the head she is coming down on (pogo-chain). That is a gap for a "plunge his head" weak point.

### 4. Mash gate
- `MASH_ENFORCE` is now per level and per part (boss / mini / level run), in `tools/level-quality.mjs` `mashGate`.
- **Every campaign level is enforced, a new level from day one.** The exception is `MASH_REPORT_ONLY`: 22 levels' parts that the mash bot still beats (the TODO list above). The list may only shrink: a listed part that now holds fails until it is removed.
- A level with no row, or a stale row, fails.
- New check `tools/mash-gate.mjs` covers all 35 campaign levels. The level-quality `mash` row uses the same gate.
- Docs updated: `docs/LEVEL-QUALITY.md`, `docs/NEW-LEVEL-CHECKLIST.md` (mash test, plus "x0.05 chip otherwise", which is now global).

### Rules changes to checks (each change is commented with Daniel's 10-01 decision)
- `tools/weighty.mjs`: the classic common-damage literal `1.25` -> `COMBAT.commonDamage` (1.6).
- `tools/archmage-folly.mjs`: "open in the mirrors, a blow is x3 of a shut one" -> "open lands x3 of the raw blow, and a shut blow is a chip". A shut blow was x1, and is now x0.05.

## New checks (all in `tools/check.mjs`'s list; each red on master)
- `boss-greed`: table coverage; the chip; the room's blow is not chipped; opening and poise break land whole; own ward not double-chipped; the no-opening boss is left whole; the told reprisal lands only after its tell and only near him; burn is chipped; minis.
- `foe-tempo`: TIGHT tells are x0.8 (floor 0.3), no mark is lost, nothing else is shortened.
- `verb-matrix`: as above.
- `mash-gate`: as above.

Also new: `tools/combat-pilots.mjs`, a measuring tool, not a check.

## Checks run (named, never the suite)

**Green on the final merged branch:** boss-greed, mash-gate, canal, boss-fight-end (48 fights), verb-matrix, foe-tempo, tells, hint-shown, slopes-trace (every level identical), npc-removal, architecture, checkpoints, skins, dangling-paths, level-quality, answer-tags, untold-told, foe-tactics, weighty, archmage-folly, boss-openings (one run, after merging origin/master).

**Earlier green on this branch:**
- shake-mode, starter-kits, checkpoints, skins, attack-animation, attack-buffer, ability-poses
- pogo-chain, death-cost, juice, ember-flare, crouch-a, hint-shown, slide, textfit
- foe-tactics, untold-told, answer-tags, finishers, weighty
- herald-pirate, small-adds, sexton, firsthour, wicker-queen, queen-court, weak-bosses, puppeteer
- normal-health, pyre-pilot, boss-navigation
- dangling-paths, buried-dead, boss-openings, lab-clock, combat-replay, pilot-actions, temperer, unburied-fights
- boss-fight-end, dune-worm, architecture, kraken-rework, gargoyle-playtest, harvest-fair, level-quality, theatre, mash-gate
- archmage-folly (after its rules change)

**Red, and pre-existing:** `attack-tokens` is red on master 3fd06c78 too ("only 3 red !! blows over both crowds"). It was run in a throwaway worktree with identical numbers. It is not caused by this lane, and is left for the integrator.

**Mistake:** while resolving the merge I accidentally imported `tools/check.mjs` (which starts the full suite). I stopped it within about 2 minutes, killed nothing by name, and found no stray processes of mine.

## UNVERIFIED
- Nothing was looked at on screen. Not seen:
  - the red ring and `!!` of the reprisal
  - the grey chip spark
  - the airUp frames and crescent
  - the ground up-slash pose without the leap
- The 3-frame up-key jump delay has not been felt by a human. Players who jump with ArrowUp/W get 50 ms of input lag.
- **Hero skills that bypass the chip:** skills that call `hurtEnemy` without naming a blow (the whirl, phoenix burst, consecrate ticks, graveFall, Last Charge, hammerfall, and a few others) are treated as mechanics and land whole outside openings. Melee, plunges, embers, shots and most skills go through `hurtAs` and are chipped.
- Human-bot numbers are 1 seed per hero; one run errored and was re-run.
- Level-mode mash numbers are noisy (seeded, but they diverge with any timing change).
- Co-op is unplayed: the reprisal reads the nearest hero, and `damagePlayer` applies to that hero.
- Boss Rush and the Level Editor were not touched. The rule applies to whatever `boss` is.

## QUESTIONS FOR DANIEL (the recommended option is built)
1. **The first boss is not chipped** (Hornet Queen x1, her swarm armour kept, greed reprisal kept). *Rec: keep.* The first fight teaches openings without a wall; at a twentieth the human bot lost her 2-3 of 3.
2. **Pyromancer x0.25 with no greed; Herald x0.2.** *Rec: keep* until their wave lanes give them openings that come more often.
3. **Minis are still mashable (12/13).** Their damage taken was kept, per the brief. *Rec:* let the boss waves give each mini a real opening, then put minis on the chip as well.
4. **The up-key jump waits 3 frames for an attack.** *Rec: keep.* *Alternative:* take ArrowUp/W off the jump binding (Hollow Knight style).
5. **The ground up-slash no longer leaps.** *Rec: keep.* The leaping version stays as the jump-cut.
6. **Freebooter's held heavy stays the pistol.** *Rec: keep* (it counts as heavy).
7. **commonDamage 1.6 is above weighty's 1.4**, so the opt-in weighty mode now hits SOFTER than classic. *Rec:* raise weighty to 1.8, or retire it.
8. **Elite captains drop no heart.** *Rec: keep.* *Alternative:* a heart only when the hero is under half health.
9. **Art:** the airUp frames are procedural. *Rec:* a Sonnet art lane polishes 7 heroes x 4 airUp frames (and any skins).
10. **The new mash gate fails any new campaign level with no mash row.** Tonight's canal arrived with a level row only; I stamped its boss. *Rec:* keep. That is "enforced from day one".
11. **The pre-existing `attack-tokens` failure on master.** *Rec:* a small fix lane.
