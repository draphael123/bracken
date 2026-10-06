# claude/sweep3 - BOSS RETUNE SWEEP, ACT III (Opus)

Base: origin/claude/bot2 38fe2c46 + claude/hedgewarden4 a8d353bc, then origin/claude/sweep1 merged (60d41207 the boss-read
helper, plus its Windcaller/Temple Guardian commits). Rows owned by other lanes were not touched (Djinn, Dune Worm, Puppeteer,
Jenny, Gorge Crab, Death Knight).

How it was measured: `PORT=8660 node tools/boss-rates.mjs <row> --ways=practiced --seeds=4 --jobs=2`. That is the standard
profile `human`, the campaign level and normal health, with n=12 per row (4 per hero). Noise is about ±14 points. "Before"
is BOT2's sweep table (same base) unless noted; the Hedge Warden was re-measured on this branch.
Order: the read first (B10-B13), then bot gaps (v2 profiles only), then numbers.

## The table

| row | read fixes (B10-B13) | bot gaps fixed (v2 only) | number changes | before kn/wa/py (%) | after kn/wa/py (%) | band |
|---|---|---|---|---|---|---|
| welltown:mini GANG LEADER | B10: turned blows say NOT INTO HIS CUTS / NOT THERE. B5: cut tell 0.42 -> 0.55 s (a reaction-late hand could not meet it) | glPlan stacked its own 0.25 s reaction and 14% misread on top of the perception layer. The warden's deflect was tapped on an 8-frame grid, and she backed off with the sweep live, which turned her shaft away; she now holds it and sweeps again for the second cut. A bottle overhead is watched from the throw and met with the rising cut. The whirl is jumped. | cut 34 -> 23, whirl 44 -> 33, riposte 28 -> 22, dash 28 -> 22 | 0/4 0/4 0/4 (0) | 3/4 2/4 3/4 (67) | mini 70-75: -3, in noise |
| mage ARCHMAGE | B12: no blink within 3 s of his own opening (ARCH.afterOpen). B10: THE RUNES HOLD / NOT THERE / REACH HIM | His yellow bolt circle is now stepped off (the guard faced him, but the bolt comes from the circle's side). Greed: the room branch swung at him on the chip, so reprisals kept coming; it now stops one blow short and steps out of the ring | small: bolt 18 -> 14, rend/crush 24 -> 20, books 12 -> 10 | 0/4 0/4 2/4 (17) | 0/4 0/4 2/4 (17) | LOW -33 (see Q2, Q3) |
| witchlight:mini HEDGE WARDEN | clean (hedgewarden4's answered opening) | - | cd 1.3 -> 0.85 (P2 0.95 -> 0.65); tells about x0.75; blows cut 16 -> 41, rush/thorn/lash 14 -> 35, roots 12 -> 28; stuck opening x1.6 -> x1.35; hp 600 -> 900 | 4/4 4/4 4/4 (100; hedgewarden4's 15/15 on the old bot) | 4/4 2/4 4/4 (83) | +8, in noise |
| burial BURIED DEAD | - (unmarked tells: Q5) | The hands walked from candle to vent through the puffs, and the gas plus its poison made up most of what was booked to his 'rest'. A hissing vent is now stepped off | none | 1/4 0/4 2/4 (25) | 2/4 2/4 4/4 (67) | +7, in noise |
| burial:mini GRAVEYARD KEEPER | - | - | hp 380 -> 800; cleave/hand 18 -> 29, clod 10 -> 16, lantern 12 -> 21, skull 12 -> 19; cd 1.4 -> 1.0 (P2 1.05 -> 0.8) | 4/4 4/4 4/4 (100) | 3/4 2/4 4/4 (75) | in band |
| fair WICKER QUEEN | - (B12 3 blinks in/after open: leap/ride, not a blink; Q5) | - | blows back to fairfix5's own (x1/0.75): stab 28, lash 24, floor 18, thrust 26, ball 22, sweep 22, stomp 20, ring 18 | 4/4 4/4 4/4 (100) | 3/4 2/4 3/4 (67) | +7, in noise |
| fields SCARECROW KING | - | The greed stop (as above). While he threw his fork or called from the pole, the hands stood at its foot where no blade reaches it | pole 4 -> 3 cuts, lashed 7.5 -> 9 s | 1/4 0/4 3/4 (33) | 2/4 2/4 3/4 (58) | in band |
| fields:mini PLOUGHMAN | - | - | hp 300 -> 520; plough 22 -> 42, goad/head 16 -> 30, furrows 20 -> 38; tells x0.85 | 3/4 4/4 4/4 (92) | 2/4 4/4 4/4 (83) | +8, in noise |
| underwell CISTERN QUEEN (Daniel 10-06) | B11/B13: never fully invulnerable. Her raised claws turn a frontal blow on the floor (GO ROUND, GUARD 'front'). Her back and flank, or her on a wall, take half; burning takes a quarter. B10: gold ring + timer while SOAKED / ON HER BACK / REARING | queenPlan's double reaction and misread. The warden's deflect was never used on pincers, sand or spit. The hands never cut her from behind | hp 1250 -> 1050, her blows x1.1, GREED.chipBy.cisternqueen 0.5, CQ.hotMul 0.5 | 0/4 0/4 4/4 (33) | 3/4 1/4 4/4 (67) | +7, in noise, no zero |
| mage:mini HOMUNCULUS | B10: NOT THERE in the smoke | - | hp 280 -> 600; swipe 16 -> 26, scuttle 22 -> 34, dive 20 -> 32, pound 22 -> 34, flask 18 -> 28, puddle 6 -> 9; tells x0.82; bareCap 0.34 -> 0.2 | 4/4 4/4 4/4 (100) | 4/4 2/4 4/4 (83) | +8, in noise |
| unburied:mini BARROW RIDER | - | - | openMul 1.6 -> 1.25, hp 720 -> 1700; ride 18 -> 40, trample 14 -> 30, fire 10 -> 22, lance 16 -> 36, thrust 14 -> 30 | 4/4 4/4 2/2 (100) | 4/4 2/4 4/4 (83) | +8, in noise |
| fallingtower UNDEAD ARCHMAGE (2800, Daniel's) | B12: "the window closes on a blink" fired 0.5 s after each opening; he now hovers 3 s first (MAGE.afterOpen) | - | hp untouched; archmage4's red +15% taken back (storm 32 -> 28, mark 38 -> 34, skull 17 -> 15, void 20 -> 18, world 25 -> 22, script 28 -> 24) | 3/4 0/4 4/4 (58) | 2/4 0/4 4/4 (50) | in band, warden 0 (Q4) |
| witchlight GATE GARGOYLE | B10: STONE | - | dive 18 -> 22, fireball 10 -> 13, breath 12 -> 15, crash 12 -> 15 | 4/4 3/4 2/4 (75) | 4/4 2/4 2/4 (67) | +7, in noise |
| fallingtower:mini SEXTON | - | - | none. A longer-fight try (hp 800, blows x0.7) went to 42% and was reverted | 3/4 1/4 4/4 (67) | 3/4 1/4 4/4 (67) | -3, in noise |

In band, or within noise of it: 13 of 14 rows. Still out: the Archmage (mage) at 17%, and he was moved by small steps only, as asked. Zero hero: the Undead Archmage's warden (0/4).

## Mash (tools/mash-bot.mjs, level THEN boss, my rows only)
0/6 on every boss and mini I changed: welltown mini, witchlight, burial, mage, fields, fair, underwell, fallingtower, and the
unburied mini (`--mini-only`, so the Death Knight's row was not touched). The Sexton mini's 3/6 is pre-existing and
report-only (MASH_REPORT_ONLY). The welltown row was not re-stamped: the Djinn lane owns it, and the Gang Leader's mash
verdict did not change (0/6, boss left 75-91%).

## Checks run (green)
tells, answer-tags, boss-greed, boss-openings, rule-openings, boss-fight-end, hint-shown, boss-read, normal-health (legacy
bot unchanged), welltown, witchlight, burial3, archmage-folly, archmage-room, archmage-rings, undead-moves, undead-realms,
tower-hall, weak-bosses, harvest-fair, cistern-queen, underwell, unburied, unburied-fights, mash-gate (the Ploughman and Barrow Rider minis now hold, so they were taken out of MASH_REPORT_ONLY and are enforced).
Reds: none of mine. archmage-folly went red twice while I worked: once on B12 "once a cycle", once on his health pin. Both
changes were reverted, so it is green, and both are now questions.

## Bot changes (src/lab.js, src/gang-leader.js, src/cistern-queen.js, src/main.js mageAdvice)
Every change rides `LABP.v2` / `s.eyes` / `s.deflect`, which are passed only on v2. The legacy path is byte-identical,
and normal-health and unburied-fights (both legacy) are green. Shared helpers: `labGreedStop` (the room branches' greed
stop), and `MA.boltStep` (advice field, ignored by legacy).

## B10 shared turned-blow word
I reused sweep1's src/boss-read.js and did not build a second helper. I added rows only: TURN_WORD archmage / gargoyle /
gangleader / homunculus, and GUARD cisternqueen 'front'.

## The Cistern Queen and the torch verb (for UNDERWELL2)
Her edits stay in her own code: src/cistern-queen.js, src/cistern-queen-hands.js, two hint lines, and one row each in
boss-read.js and boss-greed.js. None of her openings depend on the torch. They are all water: a pour on the mound or the
windlass bucket (SOAKED), a pour down her wall (ON HER BACK), and a broken grab (REARING). Her phase-2 FIRE comes from the
lamp oil she climbs through (S.burn) and is put out by water. If UNDERWELL2 lets a thrown torch light her oil, that is a
new opening route. Nothing here blocks it: H.take's burning branch is where it would plug in.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The Archmage's blinks (B12 "at most once a cycle").** tools/archmage-folly.mjs asserts his 5-6 s blink cadence. Rec:
   apply B12 in full (ARCH.blinkGap 10 s) and update that assertion. Built: only "never within 3 s of his opening", with
   blinkGap held at 0, because the test was not to be weakened.
2. **The Archmage's (mage) health.** archmage-folly pins EHP 720. At 640 the standard bot went 0/4 2/4 1/4 (25%); at 720
   it is 17%. Rec: 640 now and update the pin, then a bigger move or a bot pass on his stage-2 rooms (the acid, the
   apprentices). Built: 720 plus the small damage step. Note: the prompt's "Archmage 2800 he judges" matches the Falling
   Tower's Undead Archmage, so I kept his 2800 untouched and made only small moves on both.
3. **The Cistern Queen's 3 s ward after an opening (B3).** Daniel said "never fully invulnerable", but tools/underwell.mjs
   asserts that the ward takes 0 from blades. Rec: keep the told 3 s ward (anti-chain, B3), because it is not a waiting
   room. Built: kept.
4. **The warden's 0/4 on the Undead Archmage.** She dies at ~50% after 3 openings: she takes his yellow blows faster than
   the knight (shield) or the pyro (flare). Rec: a bot lane on the warden's deflect timing across the archmage's bolts.
   Built: nothing (his 2800 stands).
5. **Unmarked tells (B10 TELLS: Buried Dead nova/throw/body, Wicker Queen, Straw King, Cistern Queen).** The marks table
   is generated (`tools/tells.mjs --write`) and shared, so regenerating it in a sweep lane risks collisions. Rec: one small
   lane adds the BY_HAND rows and regenerates once, after the sweeps merge. Built: nothing.
6. **Minis now hit hard at Act III levels** (the Hedge Warden's cut is 41, the Barrow Rider's ride 40). The standard bot
   meets almost every told blow, so only a hit worth ~1/6 of the bar moves the rate. Rec: accept pending your playtest.
   If they feel unfair, trade damage for shorter tells. Built: the damage route.

Music: nothing new (no music in this brief).

## ADDENDUM 10-06 night: the Mage's Folly Archmage ('mage' row), Daniel's approved moves
Built: (1) B12 in full: ARCH.blinkGap 10 (one blink per ~10 s cycle; still never during or within 3 s after his own opening;
spots are the same floor spots a hero walks to). tools/archmage-folly.mjs now asserts the new cadence (>=5 blinks in 64 s, gaps
9.5-13 s) and the B12 rule; the spread of spots is sampled on its own (ten blinks, gap waived by the test's hand) because at
one blink in 10 s the old 34 s window was too short to show the room; the ward-blink assertion resets blinkAt per blink.
(2) EHP archmage 720 -> 640, pin updated.
Bot pass (v2 profiles only; legacy path unchanged - every new branch is behind LABP.v2 / the v2 arg of BK.mage):
 - the flood: he landed on a stack then flew over it into the acid (goal had already moved to the next stack) -> lands on the
   stack he is falling over (MA.landOn); waits a stride (braked, scaled to speed) before the acid when the next stack is not
   up (MA.wait); the lab's generic stuck-recovery no longer jumps him while he waits; the air-dash only from the flood's edge.
 - the runes: with all three standing he starts at the end nearest him and walks the line (not 'the one nearest the boss last');
   the labGreedStop no longer pushes him off a rune that stands beside the boss (the sword at a rune is not a swing at him);
   the bolt step-off is skipped while he is walking >48 px to a rune/goal (the circle is left behind anyway).
Rates (profile human, campaign level L29, practiced): before 0/4 0/4 2/4 = 17% (720 hp, old blinks);
 with 640 + B12 alone: 0/4 0/4 2/4 = 17% (knight/warden at 0); after the bot pass: 5/16 14/16 12/16 = 65% (HIGH +5).
 The bot pass did most of it (his stage-2 flood and the ward count were the bot's, not the player's).
QUESTION FOR DANIEL (rec first): knight 5/16 (31%) vs warden 88% / pyro 75%: the knight is slow to cut the three runes in the
 4 s stage-3 reseal (walks ~92 px/s with the shield up). Rec: leave it (overall 65% is within 5 of the band; a human bot is
 ahead of a first-time player); if you want him harder for the warden/pyro, raise his health 640 -> 700 rather than touching blinks.
Mash: level then boss re-stamped via tools/mash-bot.mjs (0/6 boss; the mini 0/6). Checks: archmage-folly, boss-read,
 boss-greed, boss-openings, mash-gate green. tells: 2 reds, both updateScalder (pourTell/ladleTell unmarked, line ~20359) - not mine.
