# LABADDS-d - the boss-lab bot fights a boss's ADDS, in general (branch claude/labadds-d off claude/gq5tune-d 956177720)
Lab-only. No boss number changed. The switch is OFF by default; with it off every row is byte-for-byte what it was.
All numbers: flags OFF (= master + GQ5TUNE), practiced, kit flasks, profile human, knight/warden/pyro, n=6 per hero (n=12 where marked), same seeds OFF and ON.

## What was built
- `src/lab.js`: THE ADDS, IN GENERAL (`addPick`, `addRoute`, `addCensus`). One layer at the top of the boss loop, before every boss plan:
  - an ADD is anything alive in the fight that was not there when it began (the lab kills all but the boss at the start, so this catches every spawn path: spawnEnt, ctx.spawn*, enemies.push, raise, puppets...).
  - the hands turn to an add when (a) the boss is NOT THERE (hidden, invuln, or an off-field mode: hide/away/gone/sunk/submerged/burrow/flee/retreat/offstage), or (b) an add is a real threat in reach: on his level, inside 48 px, and at his BACK (far side from the boss) or nearer than the boss with the boss out of his reach. Never while the boss is open, never while the boss tells inside 140 px, never carrying a device, swimming, plunging.
  - fighting it = the elite lab's duel hands (`labBotFrame`: duck / ward / low guard / block / roll its told blow, cut otherwise - the bait/block/cut of GQ5TUNE in general form). It reads the add through the same eyes as the boss (src/lab-perceive.js tracks every foe within 360 px: reaction-late, misreads), and humanSwingOk / humanRollOk still gate every press. No superhuman read.
  - reaching it (gate case only): down off a deck (DOWN on a one-way, else lowerFooting), up a ladder (NET column that climbs to its row), or a hop onto a low deck. 12 s on one add without a scratch = leave it 4 s.
  - `ADD_DUTY` (left exactly as they were, the layer never runs there): gprincess, gqueen (GQ5TUNE duties), gravewarden, hedgewarden, burieddead, bloodknight, matriarch, hornetqueen, hawkmistress, wickerqueen, bellcrab, grandmother, abbot, lance, queen. `ADD_PART`: krakenarm (his body). `ADD_SKIP`: batteringbeast (measured worse, below).
- Switch: `bossLab opts.adds` (hands + census), `opts.addsLog` (census only). `tools/boss-run.mjs`: `BOSS_ADDS=on` / `BOSS_ADDS=log`; unset = the page script is the same string as before.
- Census on the row (`adds`): n seen, kinds, killed, gone, still live, max at once, seconds with one up, damage taken with an add the nearest foe, and (ON) seconds of duty threat/gate/route.

## Proof the switch-off path is unchanged
marsh + fields, knight + warden, seeds 1-2 (8 fights): base worktree (wt-gq5tune @ 956177720) vs this branch unset: every result line IDENTICAL (diff empty). Census-only (BOSS_ADDS=log) vs unset: IDENTICAL once the appended `adds {...}` is stripped. The OFF columns below are census-only runs. Raw: bracken-scratch/desktop-out/labadds/proof-*.txt.

## Audit - which fights have adds (two searches)
1. Static (grep by MECHANISM, not name): every `spawnEnt(` / `enemies.push(` site in main.js outside the factory (2990-3532) and the level-load call, with its enclosing update function; every ctx property that creates foes (spawn, spawnFoe, spawnGuard, spawnBrood, spawnDrone, addEnemy, raise, whelp, sprout) mapped to its hands module; every module's `X.(spawn*|summon*|addEnemy|raise|sprout|whelp|brood)(`, plus brood/summon/fakes/hatch/spawnCorpse/spawnPuppet keyword passes; then the lab grepped for each add flag.
2. Runtime census (catches any path): all 65 rows, knight + pyro seed 1, BOSS_ADDS=log - every new live foe in the fight is logged.
Bosses with NO add seen in the census and none found statically are not listed (38 rows). No boss is invulnerable while its adds live (grep of the measured modules found no gate; the design rule holds) - adds are pressure, the "gate" case barely fires (0.2 s a fight at most in r2).

| row | boss.t | adds (census kinds; static site) | bot today (switch off) |
|---|---|---|---|
| marsh | frog | hopper (main.js frogCallAdds, bellow) | ignores (small-foe sweep only if one is in front) |
| kitchengate | grubbag | attendant gbAdd (grubbag.js:188) | ignores |
| rootway | huntmaster | perched scout archers hmAdd (huntmaster.js:201) | dodges their arrows (hmPlan), never goes for them |
| palisadewood | batteringbeast | sprig (battering-beast-hands.js:87) | ignores |
| burial | burieddead | zombie graveAdd | duty lab.js (graveAdd) |
| causeway | kraken | krakenarm = his BODY, not adds | n/a |
| mage | archmage | apprentice (main.js updateArchmage portal) | ignores |
| fields | strawking | rook flock x3 | ignores |
| underleaf | grandmother | sprig broodOf (potion-hands.js:240) | duty lab.js (PH.broodOf) |
| kings | king (Gorm) | archer, royalboar, hound (gorm-hands.js 82/252/253) | ignores (lab-gorm: rocks/pegs only) |
| longwater | herald | tideguard (main.js updateHerald) | ignores |
| unburied | bloodknight | risen corpse q.from===boss | duty lab.js (corpse) |
| undercrown | prince | courtier diggers | ignores |
| kings:mini | greathound | hound pups | ignores |
| spore | mother | sporeling (mother-cap2.js:109, gill snap) | ignores (sweep if in front) |
| hanging | owl | spider (census; static named "screech spawns") | ignores |
| crown:mini | gprincess | soldier, javelin gpGuard | duty (GQ5TUNE labDuty) |
| crown | gqueen | soldier, javelin | duty (GQ5TUNE labDuty, GQ4Q only) |
| burial:mini | gravewarden | zombie fromWarden | duty lab.js |
| redgorge | matriarch | raptor rmBrood | duty (matPlan brood) |
| spire | abbot | sprig / archer (summon) | generic add pick in abbot branch |
| stockade | chief | pike crew (stockade-hands.js:326 horn crew; main.js:9891 sapper wave) | incidental (dodges sapper fire only) |
| witchlight | gargoyle | whelp fromGarg | ignores |
| minecart:mini2 | forgemaster | miner, archer, gobmage (furnace adds main.js:23042) | ignores (they never come in reach: dmg near adds 0) |
| theatre | puppeteer | masterpiece (puppeteer.js c.summon) | ignores |
| church:mini | deacon | haunt, wight (census only - MISSED by the static pass) | ignores |
| sealedpyramid | tombking | mummy, tkdead (tomb-king-hands.js:106) | ignores |
| static only, none seen at s1 | scree ram goats (callTell), unburied:mini barrowrider raise, storm lance bows, fair wickerqueen mummers/fakes, deep bellcrab brood, witchlight:mini topiary, sealedpyramid:mini brood (path not found) | scree + unburied:mini measured: 0 adds, ON = OFF; others have duties |
No row: hornetsnest (hornetqueen drones, duty), ksar (hawkmistress guards, duty), silk (cryptmother sklings), manor (castellan suits).

## OFF vs ON (r2 hands = the committed ones; wins/n per hero kn/wa/py)
| row | boss | L | OFF | OFF % | ON | ON % | d wins | adds/fight OFF->ON | killed | s with adds up | dmg near adds | taken | ON duty s (threat/gate/route) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| stockade (n=12) | chief | 4 | 8/12 1/12 5/12 | 39% | 11/12 7/12 9/12 | **75%** | **+13** | 1.0 -> 1.5 | 0.4 -> 1.2 | 25 -> 33 | **45 -> 9** | 120 -> 97 | 0.5/0/0 |
| kings:mini (n=12) | greathound | 9 | 12/12 10/12 5/12 | 75% | 10/12 9/12 9/12 | 78% | +1 (pyro 5->9) | 3.7 -> 3.6 | 3.3 -> 3.3 | 9 -> 7 | 25 -> 10 | 113 -> 102 | 1.5/0/0 |
| spore (n=12) | mother | 5 | 8/12 9/12 6/12 | 64% | 6/12 12/12 4/12 | 61% | -1 | 6.6 -> 7.0 | 5.2 -> 5.6 | 60 -> 62 | 25 -> 23 | 149 -> 159 | 2.0/0/0 |
| mage (n=12) | archmage | 42 | 7/12 7/12 8/12 | 61% | 5/12 8/12 9/12 | 61% | 0 | 3.5 -> 4.1 | 2.8 -> 3.6 | 41 -> 29 | 24 -> 14 | 400 -> 393 | 3.2/0/0 |
| palisadewood (n=12) | batteringbeast | 8 | 8/12 4/12 2/12 | 39% | 6/12 1/12 3/12 | 28% | -4 | 2 -> 2 | 1.9 -> 1.9 | 24 -> 21 | 22 -> 17 | 187 -> 187 | 1.7/0/0 -> now SKIPPED |
| marsh | frog | 3 | 3/6 1/6 5/6 | 50% | 1/6 2/6 6/6 | 50% | 0 | 5.3 -> 7.7 | 1.2 -> 3.6 | 19 -> 22 | 19 -> 15 | 100 -> 110 | 1.7/0/0 |
| kings | king | 9 | 5/6 5/6 5/6 | 83% | 4/6 6/6 6/6 | 89% | +1 | 11.9 -> 11.4 | 3.2 -> 3.4 | 52 -> 50 | 33 -> 32 | 156 -> 157 | 1.2/0/0 |
| kitchengate | grubbag | 20 | 4/6 1/6 3/6 | 44% | 4/6 1/6 2/6 | 39% | -1 | 0.9 -> 1.1 | 0.9 -> 0.8 | 7 -> 7 | 2 -> 5 | 251 -> 248 | 0.9/0/0 |
| rootway | huntmaster | 6 | 0/6 2/6 5/6 | 39% | 0/6 2/6 6/6 | 44% | +1 | 4.9 -> 4.8 | 3.8 -> 3.7 | 122 -> 120 | 0 -> 2 | 169 -> 163 | 0.1/0/0 |
| fields | strawking | 35 | 5/6 6/6 6/6 | 94% | 6/6 6/6 6/6 | 100% | +1 | 18.8 -> 16 | 7.9 -> 10.6 | 50 -> 39 | 8 -> 14 | 312 -> 306 | 1.9/0/0 |
| hanging | owl | 11 | 6/6 4/6 6/6 | 89% | 5/6 5/6 6/6 | 89% | 0 | 1.9 -> 1.8 | 0.1 -> 0.2 | 48 -> 50 | 1 -> 4 | 124 -> 146 | 0.8/0/0.2 |
| longwater | herald | 22 | 6/6 6/6 6/6 | 100% | 6/6 6/6 6/6 | 100% | 0 | 1.4 | 0.2 -> 0.3 | 10 -> 10 | 2 -> 6 | 126 -> 129 | 0.2/0/0 |
| undercrown | prince | 19 | 4/6 6/6 5/6 | 83% | 5/6 6/6 5/6 | 89% | +1 | 1.4 | 0 | 6 -> 7 | 0 | 111 -> 104 | 0/0.2/0 |
| church:mini | deacon | 31 | 6/6 5/6 6/6 | 94% | 6/6 4/6 6/6 | 89% | -1 | 3.2 -> 3.3 | 0.2 -> 0.3 | 38 -> 39 | 9 -> 5 | 182 -> 200 | 0.2/0/0 |
| minecart:mini2 | forgemaster | 17 | 4/6 6/6 2/6 | 67% | same | 67% | 0 | 5 | 2 | 36 | 0 | 176 | 0/0/0 (adds never in reach) |
| sealedpyramid | tombking | 51 | 2/6 3/6 0/6 | 28% | 2/6 2/6 0/6 | 22% | -1 | 2.3 | 1.7 | 20 -> 24 | 19 -> 9 | 579 -> 585 | 0.4/0/0 |
| witchlight | gargoyle | 40 | 0/6 0/6 0/6 | 0% | 0/6 0/6 0/6 | 0% | 0 | 1.0 | 0 | 54 -> 56 | 8 -> 7 | 555 -> 557 | 0.6/0/0 |
| theatre | puppeteer | 33 | 0/6 0/6 0/6 | 0% | 0/6 0/6 0/6 | 0% | 0 | 0.4 | 0 | 2 | 6 -> 5 | 488 | 0.8/0/0 |
| scree | ram | 10 | 3/6 5/6 6/6 | 78% | same | 78% | 0 | 0 adds | | | | | |
| unburied:mini | barrowrider | 41 | 5/6 6/6 5/6 | 89% | same | 89% | 0 | 0 adds | | | | | |

### Round 1 (rejected, kept in labadds/r1/)
r1's gate read "boss far (>220 px) or high (>56 px)" as "not there": spore 78 -> 17%, hanging 89 -> 56%, kings 83 -> 67%, marsh 50 -> 33% (hanging: 29 s a fight routing to spiders while the Owl flew; spore: the Mother's cap left for her brood). A flight, a perch or a high cap is part of the boss's own plan, so r2 counts only modes that take the boss off the field, and fights a threat only at his back or with the boss out of reach.

## Per-boss recommendation (band: main 60-70%, minis 70-80%, with flasks)
- **THE GOBLIN CHIEFTAIN (stockade): CANDIDATE TO GET DIFFICULTY BACK.** Honest bot 75% (27/36), above 60-70. The OFF bot ate the pike crew's blows (45 a fight near adds -> 9). The past tunes look like bot compensation: bosstune150 chief (2ba5472e4: EHP 640 -> 590, CHIEF_OPEN slam 2.0 / chain 2.6, **HORN.crewMax 2 -> 1** - the crew cut to one a hero), then chief540 (321b63db6, EHP 590 -> 540; 500 tried, no gain). REC: give back one step at a time, measured with BOSS_ADDS=on: crewMax first, then EHP 540 -> 590.
- **THE BULLFROG KING (marsh):** 50% both ways (n=6); the honest bot kills 3x the hoppers but wins no more. bosstune150 frog (8aa9b2d2b) cut adds [2,3] -> [1,2], maxAlive 4 -> 3 with HP/ring/tell - the bot's add blindness was not what held him under band. Not a candidate; still under band (separate tune).
- **THE GREAT HOUND (kings:mini):** 75% -> 78% (in the 70-80 band), and it fixes the pyro seat (5/12 -> 9/12) the OFF bot lost to pups. No change. (hound146 raised HP 765 -> 1150, a raise, not a nerf.)
- **THE MOTHER CAP (spore), THE ARCHMAGE (mage):** no change (64 -> 61, 61 -> 61 at n=12). Adds are not distorting them.
- **THE BATTERING BEAST (palisadewood):** the general hands made the bot worse (39 -> 28%, n=12: sprig fights put him under timbers and the wall run), so the beast keeps the boss plan (ADD_SKIP). Under band either way. Its beast3 r1-r6 HP cuts (1050 -> 880 -> 960) are not shown to be add compensation.
- **Gorm (kings), Straw King (fields), Herald (longwater), Prince (undercrown), Owl (hanging), Deacon (church:mini), Barrow Rider (unburied:mini):** ABOVE band with the switch OFF already (83-100%, n=6); the adds change nothing (+-1). Over band, but not because of the bot's add blindness: a separate tune question.
- **Grubbag (kitchengate), Huntmaster (rootway), Tomb King (sealedpyramid):** under band both ways, +-1. Adds are not the cause.
- **Forgemaster (minecart:mini2), Ram (scree):** the layer never fires (adds never in reach / none spawned); identical.

## Could not measure
- **witchlight (Gate Gargoyle, L40) and theatre (Puppeteer, L33): 0/18 OFF and ON** - the lab bot cannot win these rows at all today (taken 555 / 488 a fight), so the add effect cannot be read. Worth its own lane (bot or boss).
- Bosses with per-boss duties (ADD_DUTY list) are not measured: the switch does not touch them by design.
- Static-only adds that never appeared at seed 1 (lance bows, wickerqueen mummers, bellcrab brood, hedgewarden topiary, scarabmother brood): all have duties or no row.

## Not verified / owed
- n=6 on most rows (n=12 only on the five rows that moved 3+ wins or sat on an edge). No row besides stockade moved outside noise.
- Flags OFF only (master fights). The Queen/Princess (GQ4 flags) use their own duties, untouched.
- The ladder/deck routing (`addRoute`) is exercised only in the gate case, which r2 almost never enters (route 0.2 s a fight at most), so it is lightly tested.
- "dmg near adds" is a proximity attribution (an add nearer than the boss and within 48 px when the hit landed), not the game's own source tag.
- No suite checks run (none touch the switch; tools/check.mjs not allowed). No boss retuned. No merge, no deploy.

## Questions for Daniel (rec first)
1. Make BOSS_ADDS=on the boss-rates default (after a full-table restamp)? REC yes, in a release lane: it changes only rows whose adds come into reach, and the chief row shows that is where the old number lied.
2. Give the Chieftain back his crew (crewMax) and HP 590? REC yes, measured with the switch on, one lever at a time, aiming at 65%.
3. witchlight and theatre at 0/18: REC a separate lab lane before any tune; the bot, not the boss, is the first suspect (both sit on 500+ damage taken a fight).
