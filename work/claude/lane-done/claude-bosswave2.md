# BOSS WAVE 2 (claude/bosswave2, Opus, 2026-10-05)

Base: master 2423ff42 (batch68). Master did not move during the lane.

## What changed

### Game-wide (Daniel's BOSS WAVE 2 interview)
- **Poise from heavies only, outside an opening.** A boss or a mini that is not open now fills his poise bar only from weight: a held heavy blow, a plunge, a riposte, a dash cut, the right tool, the third cut. This is the small-tier formula. Inside an opening, any blow still fills it. Before this, a tap filled about 6 of his 100 and a mash broke him open. (`src/main.js` addPoise)
- **A mini's opening is worth a third of him at most.** A hero's blows in one opening come out of a pool worth `MINI_CAP` (1/3) of his health. The blow that empties it lands what is left, and he says "HE GATHERS HIMSELF". He is then shut until that opening ends:
  - a mini on the chip (`CHIP_MINI`) takes the chip;
  - any other mini takes his plain blow, without the opening's bonus.

  The pool refills when the opening ends (`capStep`). The Hound, the Homunculus and the Gang Leader already cap their own windows, so they are left alone (`MINI_OWN_CAP`). (`src/boss-greed.js` miniCap / capStep / openOf)
- **The pyro's ember flare counts as "blocked".** This was already true in code: `damagePlayer0` returns `'blocked'` for a flare catch, so every opening that reads the result opens for her. One exception is checked below. The salvage captain's gap (wave 1, Q2) is the lab bot not flaring, not the rule. Nothing changed.

### Rule-based openings (the audit's retrofit)
- **STORMHOLD, the Lance: THE BRIDGE GATE.**
  - A portcullis hangs under the first tower lookout (pier 1) on its own winch. It is the Keep Gate's `winch` prop with `bossGate`.
  - From the lookout, where his charge can't reach you, strike the winch as he runs under it. The bars come down on him: planted 3.4 s, open (x1.6), plus the bars' own 40.
  - Struck early or late, it only shuts the lane (its tiles close), and he runs into it on the far side.
  - Glints while it is up. A sign at the point of use.
  - Files: `src/lance-support.js` LANCE_GATE / gateCatch / drawLanceGate, `src/stormhold-town.js`.
- **HIGHCROWN, the Goblin Queen: THE HALL BELL.**
  - A grate hangs between her middle pillars on the hall bell's rope. It is the same prop, with `bell`.
  - Strike the bell while she stands under it and she is pinned: `gqPin` by 'grate', 4.6 s, 7%, plate open, as a pillar or a chandelier pins her.
  - Rung while she is elsewhere, it only shuts the hall.
  - The bell glints and swings. A sign is placed (`src/level.js`).
- **WITCHLIGHT, the Gate Gargoyle: THE RUNE COLUMN.**
  - A column of runed light stands between the middle slabs, from the spikes to the sky.
  - Strike it from either tier and it flares for 1 s. If he is flying in it, it turns him over: crash, then stunned on the spikes, which is his existing opening and his existing stomp.
  - Then it is dark for 9 s, with a bar refilling at its foot.
  - Signed at the arena's lip. (`src/gate-gargoyle.js` RUNE / runeStep / drawRune, `src/witchlight.js`)
- **Lab bot** (`src/lab.js`), each use is a real swing:
  - climbs the gate's lookout when he levels the lance within 220 px, and strikes the winch a beat ahead of him;
  - rings the bell when she stands under it and it is in reach;
  - strikes the rune when he flies in it and it is in reach.
- **New check `tools/rule-openings.mjs`** (in check.mjs). It covers all three openings both ways, the Herald's mire cap, the poise rule, and the mini cap (node).
  - Proved red on 2423ff42: the page rows 8/8 FAIL, and the node rows throw.

### The retunes (all measured under WEIGHT, BKT.setHeroLevel cards)
- **THE TIDE HERALD.** One mire is worth at most `HERALD_MIRE_TAKE` 0.25 of him; then "HE DRAGS HIMSELF OUT". His blows land a quarter harder (spear 15->19, maelstrom 12->15, sweep 18->23, thrust 16->20, wave 18). Health 320 -> 340. His fight is the tide's rhythm now (4-5 waves ridden), not two mires in 24 s. Bulk alone could not do it: at 480 hp the level-1 refill-mode pilots (pyre-pilot, boss-navigation's reaper) timed out at 15-18% left, and at 400 without the harder blows the human bot won 81%.
- **The first act's three bosses.** Under WEIGHT, plus the heavies-only poise, the bot was dying in 4-5 blows and its swarms killed it.
  - **Hornet Queen:**
    - the dive's aim tell 0.8/0.6 -> 1.0/0.75;
    - stuck in the wood 2.2/1.8 -> 3.0/2.6;
    - winded 1.5/1.1 -> 2.0/1.6;
    - body 30 -> 24;
    - health 220 -> 105.
  - **Bullfrog:**
    - flop / mud 1.8/1.4/2.2 -> 3.0/2.6/3.0;
    - a choked bite 1.2 -> 2.2;
    - each window capped at `FROG_TAKE` 0.3 ("HE SHAKES IT OFF");
    - bite / tongue 25 -> 20;
    - health 280 -> 180.
  - **Chieftain:**
    - planted 1.4/1.0 -> 2.6/2.2, parried 0.8/0.9 -> 1.6, dizzy 1.2/0.9 -> 2.2/1.8, each capped at a quarter of him;
    - tells a beat longer: slash 0.38/0.28 -> 0.46/0.38, bash 0.45 -> 0.55, leap 0.55/0.4 -> 0.7/0.55;
    - body / stomp / sweep / grab 25/35/20/20 -> 20/28/16/16;
    - health 400 -> 215.
  - **Their drones** (the Queen's wasps, the Frog's hoppers) touch for `DRONE_HIT` x0.55. The damage-source probe showed they did most of the dying: a drone touch was 24 of 110.
- **Goblin Queen** 650 -> 830 (her bell made her 71%).
- **Gate Gargoyle** stomps 5 -> 6. He was 86% before, and the rune is a second way onto the spikes.
- **WICKER QUEEN** (Daniel's 10-05 playtest, via the coordinator):
  - she takes x1.3 while burning: `burnMul` and `alightMul` 1.2 -> 1.56, both still equal, so the test's unified windows hold;
  - health 2140 -> 2850.
  - **The 1/7 cliff is fixed by measuring with nudged starts.** The new `combat-pilots --nudge=17` with `--salts` starts each salt 17 px further off, alternating sides. Her fight, the Herald's and the Bullfrog's use no dice the salt reaches, so they were replaying one fight per hero. The rate is now a real fraction (k/w/p x 7 starts), not 7 heroes x 1 fight.
- **THE UNDEAD ARCHMAGE: skipped, left to ARCHMAGE3.** No single number brings him from 67% into band without the warden going to 0/7. Integ67 measured warden 0/7 at 2100-2400 hp. A health raise is exactly the "warden at 0/N" the rules forbid, and ARCHMAGE3 owns his files.

## Human-speed bot, per hero (tools/combat-pilots.mjs --salts=1..7 --nudge=17, knight/warden/pyro)

| boss | before (master 2423ff42) | after |
|---|---|---|
| Herald (longwater) | 20/21 95% (k 7/7, w 6/7, p 7/7) | 13/21 62% (k 4/7, w 5/7, p 4/7) ** |
| Bullfrog (marsh) | 4/21 19% (0/7, 1/7, 3/7) | 12/21 57% (2/7, 5/7, 5/7) |
| Chieftain (stockade) | 8/21 38% (0/7, 4/7, 4/7) | 11/21 52% (2/7, 4/7, 5/7) |
| Hornet Queen (wood) | 3/21 14% (1/7, 0/7, 2/7) | 11/21 52% (5/7, 2/7, 4/7) |
| Lance (storm) | 8/21 38% (4/7, 2/7, 2/7) | 9/15 60% (3/5, 2/5, 4/5) * |
| Goblin Queen (crown) | 7/21 33% (3/7, 0/7, 4/7) | 11/21 52% (4/7, 2/7, 5/7) |
| Gate Gargoyle (witchlight) | 18/21 86% (7/7, 5/7, 6/7) | 8/15 53% (5/5, 1/5, 2/5) * |
| Wicker Queen (fair) | 16/21 76% (2/7, 7/7, 7/7) | 12/21 57% (4/7, 1/7, 7/7) |

\* 5 starts. Nothing in their fights changed after that run.

The "before" column for the Herald merges two partial runs (one start counted twice for the knight). ** One fight above the band. 355 hp gave 62% too, and it timed the reaper pilot out (boss-navigation), so the pilot test sets the floor. 340 is where pyre-pilot (138 s) and the reaper (131 s) both finish with margin. Every other boss is 52-60%, and no hero is at 0/N.

**Measuring command (campaign level, BKT.setHeroLevel):** `PORT=8612 node tools/combat-pilots.mjs <level> --salts=1,2,3,4,5,6,7 --nudge=17`. Every rate here came from it; no level-1 pilot tool was used to tune.

## Mash bot (tools/mash-bot.mjs, level THEN boss)
- **Level rows re-stamped:** storm, crown, witchlight. Their data changed with the new props and signs.
- **Boss rows** for wood, marsh, stockade, longwater, storm, crown, witchlight and fair (`--l1 --probe --write`): **every boss 0/6**, and 0/3 at level 1.
- Minis re-stamped with them:
  - crown's Forgemaster: 0/6.
  - witchlight's Hedge Warden: 5/6, unchanged in kind. WEIGHT measured it at 3/6, and it was already a mash-beaten mini; see Q4.

## Checks
**Green** (named runs, final tree; Herald 340):
- syntax, tells, dangling-paths, boss-openings, pyre-pilot, herald-pirate, boss-navigation, boss-fight-end (51 fights), hint-shown, boss-greed
- mash-gate, mash-carry, rule-openings (new), slopes-trace (unchanged, no rebase), level-quality
- level-quality failed once inside a parallel run, then passed alone. It reads docs/mash-bot.json; this is a load flake.
- Green on step 2/3 (main.js changes since then are only Herald numbers): architecture, checkpoints, skins, npc-removal, gargoyle-smash, gargoyle-stomp, gargoyle-playtest, witchlight, queen-court, queen-chandelier, crown-exam, crown-route, lance-support, stormhold2, wicker-queen, harvest-fair, firsthour, wood2-beats, marsh-exam, stockade-horns, weak-bosses, salvage-captain, signs, stuck, answer-tags, queen-comb, commitment.

**Note:** the reaper finishes the Herald in boss-navigation at 131 of 180 s. That is a margin, but a level-1 refill pilot is sensitive to his numbers.

## UNVERIFIED
Nothing was seen on screen. Not looked at:
- the bars resting on the Lance's helm;
- the hall bell's swing;
- the rune column's flare and recharge bar;
- the new sign positions.

## QUESTIONS FOR DANIEL (recommendation first; each is built)
1. **The first act's health cuts are big** (Queen 220 -> 105, Frog 280 -> 180, Chieftain 400 -> 215), alongside longer windows and tells and lighter drones.
   - Rec: keep. Under WEIGHT a level-1-3 hero lands about a third fewer blows, and taps no longer break them, so the old numbers made the first three fights 14-38%.
   - Alt: keep their health and lengthen the windows further (slower fights, more attrition).
2. **Poise from heavies outside an opening covers bosses and minis only**, not the common foes with a 40/60/80 bar.
   - Rec: leave the common foes to COMBAT PART 2.
3. **The Gargoyle's rune column is ready every 9 s**, and he needs 6 stomps now (5 before).
   - Rec: keep. Alt: 5 stomps with a 14 s rune.
4. **The Witchlight mini (Hedge Warden) still loses to the mash bot 5/6.**
   - Rec: a mini lane gives it a told 3 s opening and puts it on CHIP_MINI. The 1/3 cap only bites once it has an opening.
5. **The warden is the weak hero** on the Gargoyle (1/5) and the Wicker Queen (1/7).
   - Rec: warden-kit work (HERO KIT lane), not boss numbers. This is the same gap integ67 saw on DK, Archmage and Djinn.
6. **The Herald sits at 62%,** one fight over the band. The level-1 pilot tests (pyre-pilot, boss-navigation) are the floor on his health.
   - Rec: accept, or let BOTLEVEL decide whether those tests should run at campaign level (then he can go to ~380 hp).
7. **The Archmage was skipped** (see above). Rec: ARCHMAGE3 tunes him with the warden in view.
