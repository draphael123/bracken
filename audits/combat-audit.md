# BRACKEN combat audit

Findings only: nothing in the game was changed. Every number here was read off the running game (headless Chrome on port 5908, master 48b33b9) by the tools listed at the end. The ranked lists come first, then the full tables.

**Line numbers** are this branch's `src/main.js`. It is master plus read-only audit hooks, so on master:
- lines 3296-3645 are 3 lower;
- lines 3646-16767 are 5 lower;
- later lines are 6 lower.

**Kinds:** "bug" = the code does something other than it plainly intends. "design" = it works as written, and the result is unfair or unclear.

## Top findings, most unfair first

1. **[design] 55 creatures hurt you just for touching them, with no windup and no mark** (one hit every 6 frames while you overlap). The damage comes from the contact pass (main.js:5140); only the list on main.js:5139 is exempt. Measured with each creature alone and every other creature removed each frame (`tools/audit-touch.mjs`). The ones that hurt on touch:
   - **Bosses and minis:** the Queen (30 a touch, Bracken Wood), the Archmage and the Homunculus (Mage's Folly), the Captain, the Grandmother, the Tollmaster, the Lampreeve, the Windcaller, the Prise and the Golem.
   - **Mage's Folly foes, all seven:** armour, broom, imp, mimic, rook, topiary, turret.
   - **New marsh foe:** the wasp. The eel is exempt, and so are the Hexed Fields' new foes: hedge knight, crossbow, pumpkin, haunt.
2. **[design] Four windups show no `!`/`!!` and play no tell sound in natural play.** None of these modes is covered by `windingUp()` (main.js:13594):
   - the Chief's `reach` before his lunge (93 frames watched, mark never on, updateChief ~9340);
   - the Homunculus's `flyUp` before its dive (180 frames, ~8017);
   - the Golem's `drink` before its counter (72 frames, ~10977);
   - the Assassin's `lurk` before his lunge (2,552 frames, ~11724).
3. **[bug] The Death Knight's blade box reaches 24 px past the blade drawn on its live frame** (`atk:2`) for all three light cuts, and 28 px past it for the planted heavy. `attackBox()` gives the cleave 46 px. So a blow lands on air the art never reaches.
4. **[bug] The Archmage's hurt box (16x34) stands 20 px above his drawn body on frame 10**, his low pose. Swings over his head still hit.
5. **[design] Big bodies are drawn far outside small hurt boxes**, so a swing that visibly connects misses:
   - the mounted lancer: drawn 70x84 over a 22x30 box, 59 px outside it;
   - the reefmaw: 52 px outside;
   - the ploughman: 67x47 over 20x34, 47 px outside;
   - the Buried Prince: 42 px outside.
6. **[bug] Standing blows land past the weapon drawn on their live frame:**
   - the tollmaster's `ledgerTell`: 17.5 px past (main.js:6669);
   - the sailor's `hookTell`: 14 px (6471);
   - the lance's `sweepTell`: 13 px (11905);
   - the tideguard's `thrustTell`: 12 px (6588);
   - the heron's `strikeTell`: 11 px (6567).
7. **[design] Early inputs are thrown away, not queued.** The swing buffer is 0.15 s, the dodge buffer 0.12 s.
   - **Swing pressed during a swing:** lost unless pressed in its last 7 frames. The Death Knight loses 44 of 52 frames, the paladin 24 of 32, the knight and pyromancer 10 of 18, the freebooter 5 of 13.
   - **Dodge pressed during a swing:** lost before the cancel point, in frames 1-25 for the Death Knight, 1-13 for the paladin, 1-4 for the knight.
   - **Swing pressed during a roll:** lost in the roll's first 11-13 frames, for every hero.
   - **Jump pressed during a swing:** by contrast, taken on every frame.
8. **[design] Tell timings are typed at each call site, not read from one table.** 201 of the 243 places a `...Tell` mode starts type its length as a number on that line. The timings themselves hold up: the median lead from mark to first landed frame is 39 frames (0.65 s) over 125 attacks, no watched attack landed under 0.25 s after its mark, and none left under 6 frames before its next mark or blow.
9. **[design] Different blows feel the same on a foe.**
   - The knight's light 1, light 2 and riposte share every number: 10 damage, 0.052 s hitstop, 1.5 shake, 6 px knock. The same holds for the pyromancer (7 / 0.046) and the Death Knight (16 / 0.089).
   - The freebooter's light 2 equals his riposte.
   - The riposte only differs against a boss: poise +24.5 instead of +8.5.
10. **[bug, minor] Coyote time and jump buffer each hold 5 frames for every hero.** The timers are set to 0.1 s (6 frames) and 0.12 s (7 frames), but they tick down before they are read.

**Also measured, not ranked:**
- The boss hitstop factor holds at exactly 0.8 for like-for-like light blows (0.052 to 0.042 s).
- Against a boss-flagged body, the knight's shield bash knocks at 136 px/s, against 53 px/s on a foe.
- The hedge knight's `swingTell` also lands on a hero standing behind it.

## What could not be measured

- **Does the knight's SHIELD CHARGE turn a yellow blow during the brace or the rush?** Unmeasured. In every run his bash (22 damage, 0.154 s stop, 0.88 s stagger) landed first. The forced sprig bite and hedge knight swing never reached him; against the berserker he was hit before the brace began. The table at the end of section 3 has the runs.
- **Creatures not measured by the sweep:**
  - own draw path: the king, the kraken, the sweep;
  - the harness's forced modes threw inside their update: the grub queen, the roc, the scarecrow king;
  - did not spawn: the eel, the masthead.

  The "not measured" list in section 1's table is mostly furniture the level scan picked up (anvils, barrels, doors) and is not a finding.
- **Reach against art is not compared for charges, lunges and missiles**, because the body or the missile has moved when the blow lands. That covers the great hound's pounce, the lancer's and ploughman's charges, the ram lord's butt, and every thrown or spat blow.
- **Frame data for tells that never came up in natural play** (marked "forced") is a reading, not a finding. The harness starts the mode with its own timer.
- **Feel rows that never landed:** several skills against the boss-flagged target, and the pyromancer's held heavy against it. Listed in the table.
- **Audit 4 used one hero state:** flat ground in Bracken Wood, no talents, stamina refilled, jump assist off.
- **The "touch hits" column in section 1's table** counts contact hits from any body near the pinned hero, adds included. Finding 1 above is the clean count.

## Tools, sheets and how to re-run

**Tools** (each has a usage header; run from the worktree root in Git Bash):
- `tools/audit-hitboxes.mjs`: the creature sweep (hitboxes, forced reach, frame data, hurt/death/turn frames, silhouettes) plus the heroes' attack boxes.
- `tools/audit-touch.mjs`: which bodies hurt on touch.
- `tools/audit-feel.mjs`: hitstop, shake, kick, poise, knock and voices per hero blow, and the knight's shield test.
- `tools/audit-input.mjs`: coyote time, jump buffer, swing and dodge queueing, turn-round.
- `tools/audit-report.mjs`: builds the tables and ranked lists from their JSON.
- `tools/audit-lib.mjs`: shared by all of them.

```
SCRATCH=<dir> OUT=<dir> PORT=5908 node tools/audit-hitboxes.mjs
SCRATCH=<same dir> PORT=5908 node tools/audit-touch.mjs
SCRATCH=<dir> RUSH=sprig:bite,hedgeknight:swing,berserker:swing PORT=5908 node tools/audit-feel.mjs
SCRATCH=<dir> PORT=5908 node tools/audit-input.mjs
COMBAT=<dir> FEEL=<dir> INPUT=<dir> CONTACT=<dir> ANIM=<dir> node tools/audit-report.mjs <outdir>
```

**Sheets.** One PNG per creature: every frame with its hurt box (yellow) and opaque box (cyan), and every windup with a map of where it lands. Together they come to 6.7 MB, over the 3 MB limit, so they are not in git. They are in the session scratchpad, `C:/Users/danie/AppData/Local/Temp/claude/C--Users-danie-OneDrive-Desktop-Claude-Cowork/a33bc100-61df-41bc-b6c4-648830f76229/scratchpad/`:
- `combat/` holds the first sweep, plus `creatures.json`, `touch.json` and `habitats.json`;
- `combat2/` holds the 52 creatures re-run with the camera on them;
- `combat3/` holds the arena bosses;
- `feel/feel.json` and `input/input.json`.

## 1. Hitboxes against sprites

Measured 106 creatures; not measured: anvil (did not spawn), ballast (did not spawn), barrel (did not spawn), bell (did not spawn), boiler (did not spawn), brazier (did not spawn), bridge (did not spawn), bulkhead (did not spawn), cage (did not spawn), cannon (did not spawn), capstan (did not spawn), cargo (did not spawn), cargowall (did not spawn), carpet (did not spawn), cart (did not spawn), cascade (did not spawn), catapult (did not spawn), chainpost (did not spawn), check (did not spawn), chimpot (did not spawn), coin (did not spawn), crank (did not spawn), croppole (did not spawn), crystal (did not spawn), davit (did not spawn), deadfall (did not spawn), dog (did not spawn), door (did not spawn), doorway (did not spawn), dropcage (did not spawn), eel (did not spawn), felltree (did not spawn), firepit (did not spawn), firevent (did not spawn), flagpost (did not spawn), font (did not spawn), gas (did not spawn), gate (did not spawn), glow (did not spawn), glowbud (did not spawn), glyph (did not spawn), gplate (did not spawn), gqueen (threw: TypeError: Cannot read properties of undefined (reading 'sx0')), hammer (did not spawn), hexspill (did not spawn), hotplate (did not spawn), keg (did not spawn), key (did not spawn), king (not drawn through the creature draw (e.lastSet never set)), knell (did not spawn), kraken (not drawn through the creature draw (e.lastSet never set)), lantern (did not spawn), lever (did not spawn), lockgate (did not spawn), loosegun (did not spawn), mend (did not spawn), minerlamp (did not spawn), mirror (did not spawn), mover (did not spawn), nest (did not spawn), plank (did not spawn), plate (did not spawn), puffball (did not spawn), pump (did not spawn), rack (did not spawn), ram (did not spawn), relic (did not spawn), resonance (did not spawn), roc (threw: TypeError: Cannot read properties of undefined (reading 'length')), rockfall (did not spawn), rod (did not spawn), roller (did not spawn), rune (did not spawn), runearch (did not spawn), scaffold (did not spawn), seabell (did not spawn), silver (did not spawn), skybolt (did not spawn), sluice (did not spawn), stal (did not spawn), stormkite (did not spawn), strawking (threw: TypeError: Failed to execute 'createLinearGradient' on 'CanvasRenderingContext2D': The provided double value is non-finite.), stray (did not spawn), support (did not spawn), sweep (not drawn through the creature draw (e.lastSet never set)), thresher (did not spawn), throne (did not spawn), tidebell (did not spawn), timber (did not spawn), torch (did not spawn), towertop (did not spawn), treehouse (did not spawn), vatspit (did not spawn), vent (did not spawn), weight (did not spawn), well (did not spawn), winch (did not spawn), window (did not spawn), wisp (did not spawn), masthead (no habitat).

| creature | level | hurt box | body (frame 0) | worst air px (frame) | worst body-outside-box px | touch hits | told blows: reach / drawn front px |
|---|---|---|---|---|---|---|---|
| angler | longwater | 20x14 | 35x23 | -3 (f3) | 11 | 0 | biteTell 10/21 |
| archer | marsh | 8x10 | 13x14 | 0 (f2) | 4 | 18 |  |
| archmage | mage | 16x34 | 25x50 | 20 (f10) | 16 | 0 | boltTell: never landed; blinkTell: never landed; wardTell: never landed; rendTell 59/- !!; swipeTell 59/14; slamTell 59/14; spitTell 59/11; openTell: never landed |
| armour | mage | 12x26 | 28x39 | -7 (f0) | 14 | 221 | swingTell 27/20 |
| assassin | underleaf | 9x15 | 12x13 | 2.5 (f5) | 4.5 | 10 | markTell 3/6 !!; stabTell 11/9 |
| bat | spire | 10x6 | 10x10 | 1 (f0) | 4 | 0 |  |
| berserker | underleaf | 14x20 | 23.8x17.5 | 3.8 (f6) | 9.3 | 252 | windTell 27/16.3 !!; flailTell 59/16.3 !! |
| boarder | flotilla | 12x20 | 19x26 | -1 (f4) | 13 | 0 | throwTell 15/10 |
| bosun | flotilla | 12x20 | 18x24 | 0 (f6) | 13 | 0 | swingTell 26/19 |
| broom | mage | 12x10 | 25x14 | -5 (f1) | 9 | 196 | dashTell 5/11 |
| brute | stockade | 12x16 | 20x18 | -1 (f3) | 5 | 0 |  |
| captain | hurricane | 18x28 | 33.8x42.9 | -5.3 (f3) | 26.1 | 271 | sabreTell 51/35.1 !!; hookTell 59/19.5 !!; kegTell 59/- !!; shootTell 59/29.9 !! |
| chief | stockade | 22x34 | 43x50 | -4 (f0) | 25 | 0 |  |
| clinger | undercrown | 10x11 | 10x12 | 1 (f0) | 2 | 0 |  |
| closedhelm | waymeet | 24x50 | 36x66 | -5 (f0) | 31 | 0 | cutTell 58/36; thrustTell 54/50; bashTell 25/39 !!; judgeTell 59/21 |
| crab | longwater | 14x9 | 25x14 | 0 (f7) | 6 | 0 | pinchTell 19/13 |
| crossbow | waymeet | 10x12 | 14x14 | -1 (f0) | 6 | 0 |  |
| crow | wood | 9x5 | 15x9 | 3 (f2) | 3.5 | 0 |  |
| cutlass | flotilla | 10x18 | 18x23 | 2 (f7) | 12 | 0 | slashTell 26/11 |
| cutter | hanging | 10x13 | 11x12 | 0 (f0) | 1 | 414 |  |
| drone | spore | 9x7 | 12x10 | -1.5 (f0) | 4 | 7 |  |
| drownedking | deep | 30x32 | 32x32 | 3 (f10) | 25 | 0 | anchorTell 59/24 !!; ramTell 68/30 !!; diveTell 57/25 !!; haulTell 59/25 !!; debtTell 59/14 !!; slamTell 59/16 !! |
| drunk | waymeet | 10x20 | 20x35 | -2 (f1) | 20 | 0 | lobTell: never landed; bottleTell: never landed |
| eel:big | longwater | 34x12 | 51x15.3 | 0 (f6) | 15.3 | 0 | lungeTell 58/32.3 !! |
| farmhand | fields | 12x22 | 23x28 | 1 (f3) | 14 | 0 | swingTell 27/20 |
| forgemaster | crown | 40x32 | 42x34 | 2 (f10) | 6 | 0 | bellowsTell 59/22; slamTell 51/26 !!; tongsTell 38/26; whirlTell 59/25 !!; leapTell: never landed; dragTell: never landed; anvilTell: never landed; ladleTell: never landed; breathTell 59/22 !!; sprayTell 59/- !!; hurlTell: never landed; dropTell: never landed; pourTell: never landed |
| frog | marsh | 40x30 | 52x40 | 1 (f6) | 14 | 274 | tongueTell 59/27; inhaleTell 19/27 |
| goat | scree | 14x11 | 17x14 | 0 (f1) | 4 | 0 |  |
| golem | spire | 30x34 | 39x38 | -2 (f0) | 6 | 0 | stompTell 59/21 !!; shroudTell: never landed; throwTell 51/- |
| grandmother | underleaf | 20x40 | 40x43 | -2 (f5) | 12 | 254 | feelTell 59/22; sweepTell 70/22 !!; fireTell 51/-; listenTell: never landed; throwTell 59/19 !!; vanishTell: never landed |
| greathound | kings | 32x17 | 46x24 | 0 (f6) | 7 | 284 | lungeTell 8/23; pounceTell -8/23; howlTell: never landed; snapTell 19/23 |
| grub | spire | 14x7 | 18x8 | 1 (f0) | 3 | 277 |  |
| harpy | scree | 12x7 | 20x15 | -4 (f4) | 6 | 0 |  |
| haunt | fields | 8x20 | 13x26 | 1 (f3) | 10 | 0 | throwTell 7/13 |
| hearthgob | storm | 10x13 | 12x15 | 0 (f2) | 3 | 274 |  |
| heavy | kings | 16x22 | 36x26 | -2 (f5) | 17 | 0 |  |
| hedgeknight | waymeet | 12x16 | 14x19 | -1 (f0) | 3 | 0 | swingTell 34/9 |
| herald | longwater | 18x36 | 33x47 | -3 (f6) | 27 | 0 | sweepTell 59/34 !!; thrustTell 59/36; hurlTell 109/16; callTell: never landed; glideTell 59/34 !!; spearTell 59/17; maelTell 72/16 |
| heronfoe | marsh | 10x20 | 25x27 | -1 (f2) | 11 | 0 | strikeTell 27/16 |
| holdfast | deep | 12x14 | 12x14 | 0 (f0) | 0 | 0 |  |
| homunculus | mage | 14x22 | 21.3x41.3 | -1.7 (f3) | 19.3 | 207 | swipeTell 27/23.8; batTell 7/20; golemTell 59/20; mouseTell 7/17.5 !! |
| hopper | wood | 8x6 | 14x10 | -1 (f2) | 3 | 66 |  |
| horn | moor | 8x10 | 11x15 | -1 (f0) | 6 | 0 |  |
| hound | stockade | 12x7 | 20x12 | -3 (f2) | 5 | 140 |  |
| imp | mage | 10x12 | 22x23 | -6 (f1) | 12 | 0 | throwTell 59/12 |
| javelin | kings | 8x12 | 16x20 | -3 (f0) | 9 | 0 |  |
| kite | spire | 10x12 | 16x12 | 1 (f0) | 3 | 373 |  |
| lampreeve | lamplit | 12x28 | 31.4x44.8 | 1.1 (f7) | 20.9 | 99 | sweepTell 59/26.9; snuffTell 59/26.9; drawTell 59/26.9; hookTell 59/26.9 |
| lance | storm | 26x30 | 29.9x43.7 | 0.4 (f25) | 16.9 | 0 | bashTell 29/20.7 !!; sweepTell 43/29.9 !!; thrustTell 59/29.9; vaultTell -4/13.8; galeTell: never landed; javTell 59/19.5; whirlTell 43/13.8 !!; guardTell 27/26.5; rushTell 13/18.4 |
| lancer | waymeet | 22x30 | 70x83.8 | -17.7 (f0) | 58.8 | 0 | swipeTell 35/41.3; chargeTell 26/53.8; cutTell: never landed |
| lookout | reef | 8x16 | 16x21 | -1 (f3) | 11 | 0 |  |
| lurker | wood | 12x12 | 13x15 | 1 (f1) | 2 | 20 |  |
| marine | flotilla | 10x18 | 18x19 | 0 (f0) | 8 | 0 | shootTell 59/13 |
| marshlight | fields | 10x10 | 12x16 | 0 (f3) | 5 | 0 | flareTell 19/5 |
| mimic | mage | 16x12 | 18x14 | -1 (f0) | 4 | 0 | biteTell 19/14 |
| miner | spire | 10x11 | 12x16 | -1 (f3) | 4 | 0 | swingTell 19/7; smashTell: never landed |
| netter | longwater | 10x18 | 18x23 | 1 (f5) | 10 | 0 | castTell 59/- !! |
| owl | hanging | 44x26 | 26x32 | 9 (f0) | 11 | 0 | hootTell 59/33 !!; screechTell 59/33; fanTell 59/13; skimTell 59/27 |
| petrel | reef | 10x8 | 21x13 | 0 (f1) | 6 | 0 |  |
| pike | stockade | 10x12 | 23x12 | 2 (f3) | 13 | 0 |  |
| ploughman | fields | 20x34 | 67x47 | -3 (f7) | 47 | 0 | goadTell 43/53; chargeTell 34/57 !!; headTell 59/- !! |
| prince | undercrown | 22x60 | 34x74 | -3 (f4) | 42 | 0 | cutTell 57/53; snuffTell 59/41 !!; callTell 59/26; sinkTell 59/30 !!; crownTell 59/33 |
| prise | deep | 14x10 | 16x10 | 1 (f1) | 2 | 342 | reachTell 19/9 |
| propman | undercrown | 12x13 | 17.5x16.3 | -1.5 (f2) | 2.8 | 0 | setTell: never landed; throwTell 51/- |
| pumpkin | fields | 14x12 | 21x16 | 0 (f3) | 14 | 0 | puffTell 16/15 !!; biteTell 19/15 |
| quarter | flotilla | 12x22 | 26.3x37.5 | -4 (f3) | 24 | 0 | slashTell 33/30; stanceTell: never landed; shootTell 59/26.3 !! |
| queen | wood | 40x20 | 54x37 | 5 (f4) | 15 | 480 |  |
| ramlord | scree | 48x32 | 71x44 | -5 (f3) | 21 | 0 | callTell: never landed; tossTell 27/30 !!; leapTell 35/32 !!; stampTell 59/30 !!; buttTell 14/30 |
| reefmaw | reef | 30x12 | 44x19 | 5 (f4) | 52 | 0 | riseTell 59/36; biteTell 59/36; spitTell 53/19 |
| rockgoblin | scree | 10x11 | 12x16 | 0 (f2) | 3 | 19 |  |
| rook | fields | 9x6 | 21x13 | -3.5 (f5) | 10 | 92 | diveTell: never landed |
| runner | waymeet | 8x12 | 10x15 | -1 (f1) | 4 | 192 | stabTell 11/8 |
| sailer | moor | 12x14 | 13x13 | 4 (f2) | 3 | 291 |  |
| sailor | reef | 10x18 | 20x25 | 1 (f7) | 15 | 0 | hookTell 34/20 |
| sapper | stockade | 8x12 | 10x14 | -1 (f0) | 2 | 4 |  |
| scarecrow | fields | 12x22 | 29x29 | -4 (f5) | 12 | 0 | swipeTell 19/18 |
| scout | longwater | 8x16 | 14x22 | -1 (f6) | 9 | 0 |  |
| sentry | spire | 8x11 | 12x16 | -1 (f0) | 4 | 330 |  |
| shaman | spore | 12x13 | 14x19 | 0 (f0) | 4 | 65 |  |
| shardling | spire | 9x11 | 11x10 | -0.5 (f2) | 1.5 | 370 |  |
| shield | wood | 10x14 | 15x16 | 0 (f4) | 4 | 0 | shoveTell 3/9 |
| siren | longwater | 12x16 | 21x21 | -1 (f0) | 8 | 0 |  |
| snuffer | hanging | 10x14 | 12x14 | 0 (f0) | 2 | 71 | swipeTell 19/7; snuffTell: never landed |
| soldier | kings | 10x14 | 23x19 | -3 (f7) | 10 | 171 | slashTell 18/15 |
| spider | spore | 10x8 | 14x10 | -1 (f0) | 2 | 0 |  |
| spider:big | spore | 20x16 | 29.4x21 | -2.6 (f5) | 4.7 | 0 | dropTell 3/14.7 |
| spit | wood | 12x12 | 16x14 | -1 (f1) | 2 | 0 |  |
| spitcap | spore | 12x14 | 14x14 | 0 (f0) | 2 | 0 |  |
| sporeling | spore | 8x10 | 12x12 | 0 (f2) | 2 | 160 |  |
| sprig | wood | 8x10 | 16x12 | 0 (f5) | 4 | 0 | biteTell 2/8 |
| stormshaman | kings | 10x14 | 15x19 | -1 (f0) | 5 | 0 |  |
| swornsword | waymeet | 10x14 | 16x17 | -1 (f0) | 4 | 0 | cutTell 18/9 |
| thief | kings | 8x11 | 11x16 | -1 (f1) | 4 | 0 |  |
| thorn | wood | 12x11 | 18x15 | -2 (f0) | 4 | 191 |  |
| tideguard | longwater | 10x20 | 16x28 | 0 (f3) | 17 | 0 | thrustTell 34/22 |
| tollmaster | lamplit | 20x30 | 43.8x35 | -3.7 (f0) | 27.5 | 0 | ledgerTell 55/37.5; darkTell: never landed; floodTell 59/32.5 !!; rodTell 59/18.8 !!; tollTell 59/33.8 !! |
| topiary | mage | 16x22 | 34x30 | -3 (f2) | 12 | 49 | swipeTell 27/20 |
| troll | scree | 18x21 | 26x25 | -2 (f4) | 9 | 0 | swatTell 35/18; throwTell 59/14 |
| turret | mage | 12x14 | 16x21 | -2 (f0) | 6 | 0 | chargeTell 59/- |
| turtle | marsh | 16x10 | 27x13 | -2 (f0) | 16 | 0 | snapTell 27/24 |
| urchin | longwater | 12x12 | 19x21 | -3 (f2) | 8 | 254 |  |
| wasp | wood | 8x6 | 12x9 | 1 (f2) | 2 | 0 |  |
| watch | lamplit | 12x22 | 16x31 | -1 (f0) | 14 | 0 | thrustTell 43/20; sweepTell 27/20 |
| weaver | spore | 10x8 | 14x10 | -1 (f0) | 2 | 0 | spitTell: never landed; dropTell: never landed; reelTell: never landed |
| wight | lamplit | 8x13 | 11x16 | 0 (f1) | 3 | 417 |  |
| windcaller | moor | 16x32 | 38x44 | -7 (f0) | 17 | 0 | stoneTell 59/23; howlTell: never landed; wallTell: never landed |

### Heroes: attack box against the weapon drawn on its live frames

| hero:blade | blow | live | box reach px | drawn front px (key:frame) | drawn minus box |
|---|---|---|---|---|---|
| knight:steel | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:steel | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:steel | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:steel | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:steel | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:steel | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:steel | plunge | 11 frames | 10 | - (null) | - |
| knight:ember | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:ember | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:ember | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:ember | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:ember | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:ember | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:ember | plunge | 11 frames | 10 | - (null) | - |
| knight:frost | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:frost | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:frost | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:frost | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:frost | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:frost | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:frost | plunge | 11 frames | 10 | - (null) | - |
| knight:gilded | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:gilded | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:gilded | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:gilded | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:gilded | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:gilded | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:gilded | plunge | 11 frames | 10 | - (null) | - |
| knight:shadow | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:shadow | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:shadow | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:shadow | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:shadow | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:shadow | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:shadow | plunge | 11 frames | 10 | - (null) | - |
| knight:thorn | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:thorn | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:thorn | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:thorn | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:thorn | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:thorn | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:thorn | plunge | 11 frames | 10 | - (null) | - |
| knight:silverleaf | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:silverleaf | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:silverleaf | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:silverleaf | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:silverleaf | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:silverleaf | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:silverleaf | plunge | 11 frames | 10 | - (null) | - |
| knight:laurelBlade | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:laurelBlade | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:laurelBlade | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:laurelBlade | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:laurelBlade | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:laurelBlade | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:laurelBlade | plunge | 11 frames | 10 | - (null) | - |
| knight:moon | light1 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:moon | light2 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:moon | light3 | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:moon | heavy | 7 frames | 22 | 18 (atk:1) | -4 |
| knight:moon | rise | 9 frames | 22 | 18 (air:1) | -4 |
| knight:moon | sweep | 8 frames | 28 | 18 (atk:1) | -10 |
| knight:moon | plunge | 11 frames | 10 | - (null) | - |
| pyro | light1 | 8 frames | 32 | 17 (atk:2) | -15 |
| pyro | light2 | 8 frames | 32 | 17 (atk:2) | -15 |
| pyro | light3 | 8 frames | 32 | 17 (atk:2) | -15 |
| pyro | heavy | 24 frames | 38 | 17 (atk:2) | -21 |
| pyro | rise | 9 frames | 28 | 16 (air:2) | -12 |
| pyro | sweep | 9 frames | 34 | 17 (atk:2) | -17 |
| pyro | plunge | 11 frames | 10 | - (null) | - |
| paladin | light1 | 15 frames | 26 | 18 (atk:2) | -8 |
| paladin | light2 | 15 frames | 26 | 18 (atk:2) | -8 |
| paladin | light3 | 15 frames | 26 | 18 (atk:2) | -8 |
| paladin | heavy | 43 frames | 32 | 18 (heavy:1) | -14 |
| paladin | rise | 17 frames | 28 | 18 (air:1) | -10 |
| paladin | sweep | 17 frames | 34 | 18 (atk:2) | -16 |
| paladin | plunge | 12 frames | 10 | - (null) | - |
| pirate | light1 | 6 frames | 22 | 18 (atk:2) | -4 |
| pirate | light2 | 6 frames | 22 | 18 (atk:2) | -4 |
| pirate | light3 | 6 frames | 22 | 18 (atk:2) | -4 |
| pirate | heavy | 6 frames | 22 | 18 (atk:2) | -4 |
| pirate | rise | 7 frames | 22 | 18 (air:2) | -4 |
| pirate | sweep | 7 frames | 28 | 18 (atk:2) | -10 |
| pirate | plunge | 11 frames | 10 | - (null) | - |
| reaper | light1 | 35 frames | 46 | 22 (atk:2) | -24 |
| reaper | light2 | 35 frames | 46 | 22 (atk:2) | -24 |
| reaper | light3 | 35 frames | 46 | 22 (atk:2) | -24 |
| reaper | heavy | 39 frames | 46 | 18.3 (heavy:2) | -27.7 |
| reaper | rise | 39 frames | 46 | 22 (air:1) | -24 |
| reaper | sweep | 39 frames | 46 | 22 (atk:2) | -24 |
| reaper | plunge | 11 frames | 10 | - (null) | - |

## 2. Frame data and tells

Norm (median lead from the mark to the first landed frame, over 125 measured attacks): **39 frames (0.65 s)**. Frames are 60 fps updates. "watched xN" = timed from N natural uses with the hero pinned in reach; "forced" = the mode was forced (it never came up naturally).

| creature | tell | source | windup f | mark lead f | active f | recovery f | lands in mode | live frames | weapon-out frames | mark |
|---|---|---|---|---|---|---|---|---|---|---|
| angler | biteTell | watched x8 | 34 | 34 | 1 | 80 | bite | 3 | 0,1,2,3 | ! |
| archmage | boltTell | watched x6 | 51 | 51 | 1 | 31 | bolt | - | - | ! |
| archmage | blinkTell | never landed | - | - | - | - | - | - | - | - |
| archmage | wardTell | never landed | - | - | - | - | - | - | - | - |
| archmage | rendTell | forced | - | - | - | - | - |  | 6,10 | - |
| archmage | swipeTell | forced | 38 | 38 | 1 | - | swipe | 0 | 6,10 | ! |
| archmage | slamTell | forced | 45 | 45 | 1 | - | slam | 0 | 6,10 | ! |
| archmage | spitTell | forced | 94 | 94 | 1 | - | wardTell | 3 | 6,10 | ! |
| archmage | openTell | never landed | - | - | - | - | - | - | - | - |
| armour | swingTell | watched x4 | 54 | 54 | 1 | 405 | swing | 4 | 4 | ! |
| assassin | markTell | watched x3 | 37 | 37 | 1 | 54 | lunge | 3 | 1,2,4 | !! |
| assassin | stabTell | forced | 25 | 25 | 1 | - | stab | 4 | 1,2,4 | ! |
| berserker | windTell | watched x5 | 35 | 35 | 1 | 100 | swing | 5,2 | 1,2,3,5 | !! |
| berserker | flailTell | watched x1 | 64 | 64 | 1 | 82 | flail | 5,2 | 1,2,3,5 | ! |
| boarder | throwTell | forced | 26 | 26 | 1 | - | walk | 0 | 6 | ! |
| bosun | swingTell | watched x16 | 31 | 31 | 1 | 115 | swing | 6 | 6 | ! |
| broom | dashTell | watched x14 | 39 | 39 | 1 | 175 | dash | 1 | 0,1,2,3,4 | ! |
| captain | sabreTell | watched x8 | 29 | 29 | 1 | 21 | sabre1 | 4,5 | 4,5 | ! |
| captain | hookTell | forced | 46 | 46 | 1 | - | hook | 9 | 4,5 | ! |
| captain | kegTell | forced | - | - | - | - | - |  | 4,5 | - |
| captain | shootTell | forced | 43 | 43 | 1 | - | shoot | 7 | 4,5 | !! |
| closedhelm | cutTell | watched x15 | 72 | 72 | 1 | 175 | cut | 4 | 6 | ! |
| closedhelm | thrustTell | forced | 38 | 38 | 1 | - | thrust | 6 | 6 | ! |
| closedhelm | bashTell | forced | 48 | 48 | 1 | - | bash | 8 | 6 | !! |
| closedhelm | judgeTell | forced | 39 | 39 | 1 | - | judge | 10 | 6 | ! |
| crab | pinchTell | watched x3 | 22 | 22 | 1 | 93 | pinch | 6 | 0,1,2,3,4,5,6,7 | ! |
| cutlass | slashTell | watched x14 | 21 | 21 | 1 | 75 | slash | 0 | 6 | ! |
| drownedking | anchorTell | watched x5 | 41 | 41 | 1 | 46 | anchor | 15 | 9,13,17 | ! |
| drownedking | ramTell | watched x4 | 58 | 58 | 1 | 20 | ram | 12,13 | 9,13,17 | !! |
| drownedking | diveTell | watched x1 | 16 | 16 | 1 | 58 | diveTell | 16,10 | 9,13,17 | !! |
| drownedking | haulTell | forced | 44 | 44 | 1 | - | haulTell | 14 | 9,13,17 | !! |
| drownedking | debtTell | forced | 44 | 44 | 1 | - | debt | 11 | 9,13,17 | !! |
| drownedking | slamTell | forced | 44 | 44 | 1 | - | slam | 3 | 9,13,17 | !! |
| drunk | lobTell | watched x3 | 86 | 86 | 1 | 116 | idle | - | - | ! |
| drunk | bottleTell | watched x2 | 100 | 100 | 1 | 76 | idle | - | - | ! |
| eel:big | lungeTell | watched x20 | 37 | 37 | 1 | 31 | lunge | 2 | 2 | ! |
| farmhand | swingTell | watched x20 | 42 | 42 | 1 | 118 | swing | 3 | 3 | ! |
| forgemaster | bellowsTell | watched x4 | 37 | 37 | 1 | 174 | bellows | 0 | 2,3,9,11,12,14 | ! |
| forgemaster | slamTell | watched x4 | 45 | 45 | 1 | 96 | slam | 2 | 2,3,9,11,12,14 | !! |
| forgemaster | tongsTell | watched x4 | 46 | 46 | 1 | 29 | tongs | 9,2 | 2,3,9,11,12,14 | ! |
| forgemaster | whirlTell | forced | 65 | 65 | 1 | - | whirl | 11 | 2,3,9,11,12,14 | !! |
| forgemaster | leapTell | never landed | - | - | - | - | - | - | - | - |
| forgemaster | dragTell | never landed | - | - | - | - | - | - | - | - |
| forgemaster | anvilTell | never landed | - | - | - | - | - | - | - | - |
| forgemaster | ladleTell | never landed | - | - | - | - | - | - | - | - |
| forgemaster | breathTell | forced | 48 | 48 | 97 | - | breath | 6 | 2,3,9,11,12,14 | !! |
| forgemaster | sprayTell | forced | - | - | - | - | - |  | 2,3,9,11,12,14 | - |
| forgemaster | hurlTell | never landed | - | - | - | - | - | - | - | - |
| forgemaster | dropTell | never landed | - | - | - | - | - | - | - | - |
| forgemaster | pourTell | never landed | - | - | - | - | - | - | - | - |
| frog | tongueTell | watched x2 | 98 | 98 | 1 | 262 | tongue | 2 | 6 | ! |
| frog | inhaleTell | watched x1 | 189 | 189 | 1 | 144 | spit | 0 | 6 | ! |
| golem | stompTell | watched x5 | 47 | 47 | 1 | 365 | stomp | 3 | 0,1,2,3,4,5,6,7,8 | !! |
| golem | shroudTell | watched x1 | 136 | 136 | 1 | - | counter | - | - | ! |
| golem | throwTell | forced | - | - | - | - | - |  | 0,1,2,3,4,5,6,7,8 | - |
| grandmother | feelTell | watched x7 | 31 | 31 | 1 | 25 | feel | 5 | 0,1,2,3,5,9 | ! |
| grandmother | sweepTell | watched x6 | 37 | 37 | 1 | 246 | sweep | 5 | 0,1,2,3,5,9 | !! |
| grandmother | fireTell | watched x2 | 82 | 82 | 1 | 129 | fireTell |  | 0,1,2,3,5,9 | ! |
| grandmother | listenTell | watched x2 | 93 | 93 | 1 | 6 | listen | - | - | ! |
| grandmother | throwTell | watched x2 | 45 | 45 | 1 | 13 | thrown | 6 | 0,1,2,3,5,9 | !! |
| grandmother | vanishTell | never landed | - | - | - | - | - | - | - | - |
| greathound | lungeTell | watched x4 | 42 | 42 | 1 | 104 | lunge | 1 | 0,1,2,3,4,5,6 | ! |
| greathound | pounceTell | watched x1 | 74 | 74 | 1 | 78 | landed | 6 | 0,1,2,3,4,5,6 | ! |
| greathound | howlTell | never landed | - | - | - | - | - | - | - | - |
| greathound | snapTell | forced | 38 | 38 | 1 | - | idle | 0 | 0,1,2,3,4,5,6 | ! |
| haunt | throwTell | watched x10 | 57 | 57 | 1 | 278 | throw | 3 | 2,3 | ! |
| hedgeknight | swingTell | watched x19 | 34 | 34 | 1 | 113 | swing | 3 | 0,1,2,3,4 | ! |
| herald | sweepTell | watched x6 | 39 | 39 | 1 | 224 | sweep | 4 | 4,6 | !! |
| herald | thrustTell | watched x2 | 34 | 34 | 1 | 169 | thrust | 6 | 4,6 | ! |
| herald | hurlTell | forced | 49 | 49 | 1 | - | hurl | 2 | 4,6 | ! |
| herald | callTell | never landed | - | - | - | - | - | - | - | - |
| herald | glideTell | forced | 65 | 65 | 1 | - | sweepTell | 3,4,0 | 4,6 | ! |
| herald | spearTell | forced | 78 | 78 | 1 | - | spear | 0,1 | 4,6 | ! |
| herald | maelTell | forced | 64 | 64 | 1 | - | mael | 0 | 4,6 | ! |
| heronfoe | strikeTell | watched x14 | 31 | 31 | 1 | 121 | strike | 3 | 3,4,5 | ! |
| homunculus | swipeTell | watched x7 | 34 | 34 | 1 | 121 | swipe | 4 | 4 | ! |
| homunculus | batTell | watched x4 | 94 | 94 | 1 | 377 | dive | 8 | 4 | ! |
| homunculus | golemTell | watched x1 | 59 | 59 | 1 | 174 | slam | 10 | 4 | ! |
| homunculus | mouseTell | forced | 51 | 51 | 1 | - | scurry | 6 | 4 | !! |
| imp | throwTell | watched x14 | 63 | 63 | 1 | 166 | throw | 3 | 0,1,2,3,4,5 | ! |
| lampreeve | sweepTell | watched x6 | 31 | 31 | 1 | 215 | sweep | 9 | 4,5,7,8,9 | ! |
| lampreeve | snuffTell | forced | 83 | - | 1 | - | douse | 9 | 4,5,7,8,9 | ! |
| lampreeve | drawTell | forced | 83 | - | 1 | - | douse | 9 | 4,5,7,8,9 | ! |
| lampreeve | hookTell | forced | 83 | - | 1 | - | douse | 9 | 4,5,7,8,9 | ! |
| lance | bashTell | watched x6 | 29 | 29 | 1 | 104 | bash | 26 | 5,6,7,9,11 | !! |
| lance | sweepTell | watched x6 | 31 | 31 | 1 | 205 | sweep | 11 | 5,6,7,9,11 | !! |
| lance | thrustTell | watched x4 | 34 | 34 | 1 | 219 | thrust | 9 | 5,6,7,9,11 | ! |
| lance | vaultTell | forced | 0 | 0 | 1 | - | vaultTell | 20 | 5,6,7,9,11 | ! |
| lance | galeTell | never landed | - | - | - | - | - | - | - | - |
| lance | javTell | forced | 86 | 86 | 1 | - | javThrow | 23 | 5,6,7,9,11 | ! |
| lance | whirlTell | forced | 38 | 38 | 1 | - | whirl | 0 | 5,6,7,9,11 | !! |
| lance | guardTell | forced | 38 | 38 | 1 | - | guardSwing | 15 | 5,6,7,9,11 | ! |
| lance | rushTell | forced | 52 | 52 | 1 | - | rush | 16 | 5,6,7,9,11 | ! |
| lancer | swipeTell | watched x4 | 37 | 37 | 1 | 163 | swipe | 7 | 2,3 | ! |
| lancer | chargeTell | watched x3 | 57 | 57 | 1 | 188 | charge | 2 | 2,3 | ! |
| lancer | cutTell | never landed | - | - | - | - | - | - | - | - |
| marine | shootTell | watched x20 | 38 | 38 | 1 | 151 | shoot | 3 | 0,1,2,3 | ! |
| marshlight | flareTell | watched x1 | 36 | 36 | 1 | - | flare | 3 | 4,5 | ! |
| mimic | biteTell | forced | 36 | - | 1 | - | bite | 3 | 2,3,5 | ! |
| miner | swingTell | watched x25 | 34 | 34 | 1 | 72 | swing | 3 | 0,1,2,3 | ! |
| miner | smashTell | never landed | - | - | - | - | - | - | - | - |
| netter | castTell | forced | - | - | - | - | - |  | 5 | - |
| owl | hootTell | watched x4 | 31 | 31 | 1 | 134 | screech | 3 | 1,2,3,4,5,7,8,9,10 | ! |
| owl | screechTell | forced | 4 | 4 | 7 | - | screechTell | 3 | 1,2,3,4,5,7,8,9,10 | ! |
| owl | fanTell | watched x4 | 48 | 48 | 1 | 112 | sit | 0 | 1,2,3,4,5,7,8,9,10 | ! |
| owl | skimTell | forced | 4 | 4 | 7 | - | skimTell | 6 | 1,2,3,4,5,7,8,9,10 | ! |
| ploughman | goadTell | watched x14 | 37 | 37 | 1 | 133 | goad | 7 | 4 | ! |
| ploughman | chargeTell | watched x1 | 78 | 78 | 1 | 282 | charge | 4 | 4 | !! |
| ploughman | headTell | watched x1 | 104 | 104 | 1 | 204 | walk |  | 4 | ! |
| prince | cutTell | watched x15 | 39 | 39 | 1 | 187 | cut | 6 | 6,21 | ! |
| prince | snuffTell | forced | 38 | 38 | 1 | - | snuff | 15 | 6,21 | !! |
| prince | callTell | forced | 34 | 34 | 1 | - | callTell | 10,11 | 6,21 | ! |
| prince | sinkTell | forced | 34 | 34 | 1 | - | sinkTell | 7,8 | 6,21 | ! |
| prince | crownTell | forced | 34 | 34 | 1 | - | crownTell | 12,13 | 6,21 | ! |
| prise | reachTell | watched x3 | 184 | 184 | 1 | - | snap | 3 | 0,1,2,3 | ! |
| propman | setTell | watched x3 | 175 | 175 | 1 | 102 | swing | - | - | ! |
| propman | throwTell | watched x3 | 81 | 81 | 1 | 57 | walk |  | 0,1,2,3 | ! |
| pumpkin | puffTell | watched x2 | 63 | 63 | 1 | 28 | burst | 2,3 | 3 | !! |
| pumpkin | biteTell | watched x18 | 28 | 28 | 1 | 87 | bite | 3 | 3 | ! |
| quarter | slashTell | watched x12 | 29 | 29 | 1 | 157 | slash | 4 | 4 | ! |
| quarter | stanceTell | never landed | - | - | - | - | - | - | - | - |
| quarter | shootTell | watched x3 | 43 | 43 | 1 | 195 | shoot | 6 | 4 | !! |
| ramlord | callTell | never landed | - | - | - | - | - | - | - | - |
| ramlord | tossTell | watched x7 | 31 | 31 | 1 | 78 | toss | 5 | 0,3 | !! |
| ramlord | leapTell | watched x1 | 90 | 90 | 1 | 96 | land | 4 | 0,3 | !! |
| ramlord | stampTell | watched x1 | 51 | 51 | 1 | 61 | stamp | 5 | 0,3 | !! |
| ramlord | buttTell | watched x1 | 56 | 56 | 1 | 59 | butt | 5 | 0,3 | ! |
| reefmaw | riseTell | forced | 116 | 116 | 1 | - | bite | 4 | 5 | ! |
| reefmaw | biteTell | watched x10 | 37 | 37 | 1 | 162 | bite | 4 | 5 | ! |
| reefmaw | spitTell | watched x1 | 81 | 81 | 1 | 95 | sink | 7 | 5 | ! |
| rook | diveTell | never landed | - | - | - | - | - | - | - | - |
| runner | stabTell | watched x6 | 20 | 20 | 1 | 70 | stab | 3 | 1,2,3 | ! |
| sailor | hookTell | watched x19 | 31 | 31 | 1 | 116 | hook | 6 | 6 | ! |
| scarecrow | swipeTell | watched x5 | 34 | 34 | 1 | 102 | swipe | 6 | 0,1,3,4,6 | ! |
| shield | shoveTell | watched x15 | 32 | 32 | 1 | 112 | shove | 6 | 0,1,2,3,6,7 | ! |
| snuffer | swipeTell | watched x3 | 22 | 22 | 1 | 75 | swipe | 3 | 0,1,2,3 | ! |
| snuffer | snuffTell | never landed | - | - | - | - | - | - | - | - |
| soldier | slashTell | watched x10 | 31 | 31 | 1 | 87 | slash | 6 | 6 | ! |
| spider:big | dropTell | watched x4 | 38 | 38 | 37 | - | drop | 1 | 0,1,2,3,4 | ! |
| sprig | biteTell | watched x19 | 33 | 33 | 1 | 102 | bite | 6 | 0,1,2,3,4,5,6,7 | ! |
| swornsword | cutTell | watched x20 | 37 | 37 | 1 | 91 | cut | 3 | 0,1,2,3,4,5,6,7 | ! |
| tideguard | thrustTell | watched x19 | 34 | 34 | 1 | 102 | thrust | 6 | 6 | ! |
| tollmaster | ledgerTell | watched x12 | 34 | 34 | 1 | 195 | ledger | 2 | 2,3 | ! |
| tollmaster | darkTell | never landed | - | - | - | - | - | - | - | - |
| tollmaster | floodTell | forced | 8 | 8 | 1 | - | floodTell | 10 | 2,3 | !! |
| tollmaster | rodTell | forced | 44 | 44 | 1 | - | rod | 7 | 2,3 | !! |
| tollmaster | tollTell | forced | 40 | 40 | 1 | - | toll | 4 | 2,3 | !! |
| topiary | swipeTell | watched x5 | 34 | 34 | 1 | 108 | swipe | 5 | 0,1,2,3,4,5,6 | ! |
| troll | swatTell | watched x15 | 31 | 31 | 1 | 69 | swat | 4 | 4 | ! |
| troll | throwTell | forced | 21 | 21 | 1 | - | throwTell | 3 | 4 | ! |
| turret | chargeTell | watched x15 | 73 | 73 | 1 | 156 | fire |  | 1,2 | ! |
| turtle | snapTell | watched x16 | 25 | 25 | 1 | 105 | snap | 2 | 2 | ! |
| watch | thrustTell | watched x15 | 26 | 26 | 1 | 112 | thrust | 6 | 6,7 | ! |
| watch | sweepTell | forced | 35 | 35 | 1 | - | sweep | 6 | 6,7 | ! |
| weaver | spitTell | never landed | - | - | - | - | - | - | - | - |
| weaver | dropTell | never landed | - | - | - | - | - | - | - | - |
| weaver | reelTell | never landed | - | - | - | - | - | - | - | - |
| windcaller | stoneTell | watched x5 | 56 | 56 | 1 | 57 | stone | 0 | 0,1,3,4 | ! |
| windcaller | howlTell | never landed | - | - | - | - | - | - | - | - |
| windcaller | wallTell | never landed | - | - | - | - | - | - | - | - |

**Timing from one table?** No. Of 243 places a `...Tell` mode is entered, 201 type the tell's length as a number at that line (e.g. updateStormCaller callTell = 1.25 (main.js:5926); updateGullFlock diveTell = 0.35 (main.js:5956); updateFrog inhaleTell = 0.15 (main.js:6210); updateTroop slashTell = 0.5 (main.js:6275); updateTroop grabTell = 0.5 (main.js:6300); updateCrew slashTell = 0.34 (main.js:6415)). The rest read a variable or expression.

| update function | tell sites with a typed number |
|---|---|
| updateForgemaster | 13 |
| updateGQueen | 13 |
| updateLance | 11 |
| updateStrawKing | 9 |
| updateArchmage | 9 |
| updateKraken | 9 |
| updateHerald | 7 |
| updateKing | 7 |
| updateShore | 5 |
| updatePrince | 5 |
| updateSuncatcher | 5 |
| updateGrandmother | 5 |
| updateRam | 5 |
| updateMaster | 5 |
| updateCrew | 4 |
| updateTollmaster | 4 |
| updateHomunculus | 4 |
| updateOwl | 4 |
| updateDrownedKing | 4 |
| updateRoc | 4 |
| updateReef | 3 |
| updateLampreeve | 3 |
| updateCaptain | 3 |
| updateMaw | 3 |
| updateWindcaller | 3 |

## 3. Combat feel numbers

Against a sprig in Bracken Wood (hp 9999); "[boss]" is the same sprig carrying maxHp, the field every boss rule in the code tests. stop = hitstop s (BK.stop after the landing frame), shake/kick = camera values, poise = stagger bar added, vx = knock velocity on the landing frame, knock = px travelled in the next 20 frames.

| hero | blow | target | dmg | stop s | shake | kick | poise + | vx | knock px | swing voice | hit voice |
|---|---|---|---|---|---|---|---|---|---|---|---|
| knight | light 1 | foe | 10 | 0.052 | 1.5 | 1.5 | 0 | 66 | 6 | pSlash/swingUp | impact/hurtOf:sprig/yelp |
| knight | light 1 | boss | 10 | 0.042 | 1.5 | 1.51 | 8.5 | 66 | 7 | pSlash/swingUp/pEffort | impact/hurtOf:sprig |
| knight | light 2 | foe | 10 | 0.052 | 1.5 | 1.71 | 0 | 66 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| knight | light 2 | boss | 10 | 0.042 | 1.5 | 1.71 | 8.5 | 66 | 7 | pSlash/swingUp | impact/hurtOf:sprig |
| knight | light 3 | foe | 15 | 0.088 | 2.5 | 3.74 | 0 | 76 | 7 | pSlash/swingUp/heavy | impact/hurtOf:sprig |
| knight | light 3 | boss | 15 | 0.071 | 2.5 | 3.74 | 37.8 | 76 | 7 | pSlash/swingUp/heavy/pEffort | impact/hurtOf:sprig |
| knight | heavy (held) | foe | 22 | 0.154 | 4 | 9.02 | 0 | 53 | 26 |  | swingUp/shieldSlam/impact/hurtOf:sprig/yelp |
| knight | heavy (held) | boss | 22 | 0.123 | 4 | 9.02 | 39.5 | 136 | 12 |  | swingUp/shieldSlam/impact/hurtOf:sprig |
| knight | dash strike | foe | 6 | 0.088 | 1.5 | 1.53 | 0 | 44 | 29 |  | impact/hurtOf:sprig/yelp |
| knight | dash strike | boss | 6 | 0.071 | 1.5 | 1.51 | 21.5 | 58 | 6 |  | impact/hurtOf:sprig |
| knight | dash attack | foe | 16 | 0.086 | 1.5 | 1.5 | 0 | 44 | 29 | pSlash/swingUp/heavy | impact/hurtOf:sprig/yelp |
| knight | dash attack | boss | 16 | 0.068 | 1.5 | 1.51 | 24 | 78 | 7 | pSlash/swingUp/heavy | impact/hurtOf:sprig |
| knight | rising cut | foe | 11 | 0.054 | 1.5 | 1.51 | 0 | 7 | 5 | pSlash/swingUp/pEffort/pJump | impact/hurtOf:sprig/yelp |
| knight | rising cut | boss | 11 | 0.044 | 1.5 | 1.51 | 8.8 | 68 | 7 | pSlash/swingUp/pJump | impact/hurtOf:sprig |
| knight | low sweep | foe | 10 | 0.08 | 3.7 | 1.51 | 0 | 0 | 0 | pSlash/swingUp/pEffort/skid | impact/hurtOf:sprig/yelp/poiseBreak |
| knight | low sweep | boss | 10 | 0.042 | 1.5 | 1.51 | 8.5 | 66 | 7 | pSlash/swingUp/pEffort/skid | impact/hurtOf:sprig |
| knight | plunge | foe | 20 | 0.074 | 1.5 | 1.5 | 0 | 26 | 2 |  | impact/hurtOf:sprig/pPogo |
| knight | plunge | boss | 20 | 0.06 | 1.5 | 1.5 | 23 | 26 | 3 |  | impact/hurtOf:sprig/pPogo |
| knight | riposte | foe | 10 | 0.052 | 1.5 | 1.51 | 0 | 66 | 6 | pSlash/swingUp/pEffort | impact/hurtOf:sprig/yelp |
| knight | riposte | boss | 10 | 0.042 | 1.5 | 1.51 | 24.5 | 66 | 7 | pSlash/swingUp/pEffort | impact/hurtOf:sprig |
| knight | skill risingCut | foe | no hit |  |  |  |  |  |  |  |  |
| knight | skill risingCut | boss | no hit |  |  |  |  |  |  |  |  |
| knight | skill lunge | foe | 20 | 0.074 | 1.5 | 1.5 | 0 | 87 | 8 | slash/throwWhoosh | impact/hurtOf:sprig/yelp |
| knight | skill lunge | boss | no hit |  |  |  |  |  |  |  |  |
| knight | skill shieldThrow | foe | 10 | 0.052 | 1.5 | 1.5 | 0 | 76 | 7 |  | throwWhoosh/impact/hurtOf:sprig/yelp/clank |
| knight | skill shieldThrow | boss | no hit |  |  |  |  |  |  |  |  |
| knight | skill warCry | foe | no hit |  |  |  |  |  |  |  |  |
| knight | skill warCry | boss | no hit |  |  |  |  |  |  |  |  |
| knight | skill groundSlam | foe | 15 | 0.063 | 7 | 1.5 | 0 | 88 | 33 |  | heavy/stone/impact/hurtOf:sprig/yelp |
| knight | skill groundSlam | boss | no hit |  |  |  |  |  |  |  |  |
| knight | skill whirlwind | foe | 9 | 0.05 | 1.5 | 1.5 | 0 | 64 | 9 |  | slash/throwWhoosh/impact/hurtOf:sprig/yelp |
| knight | skill whirlwind | boss | no hit |  |  |  |  |  |  |  |  |
| pyro | light 1 | foe | 7 | 0.046 | 1.5 | 1.5 | 0 | 60 | 6 | pSlash/swingUp/pEffort | impact/hurtOf:sprig/yelp |
| pyro | light 1 | boss | 7 | 0.036 | 1.5 | 1.51 | 7.8 | 60 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pyro | light 2 | foe | 7 | 0.046 | 1.5 | 1.71 | 0 | 60 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pyro | light 2 | boss | 7 | 0.036 | 1.5 | 1.71 | 7.8 | 60 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pyro | light 3 | foe | 11 | 0.079 | 2.5 | 3.74 | 0 | 68 | 7 | pSlash/swingUp/heavy | impact/hurtOf:sprig |
| pyro | light 3 | boss | 11 | 0.064 | 2.5 | 3.74 | 36.8 | 68 | 7 | pSlash/swingUp/heavy | impact/hurtOf:sprig |
| pyro | heavy (held) | foe | 3 | 0.112 | 3 | 7.21 | 0 | 89 | 14 |  | tell/swingUp/heavy/foeRelease/impact/hurtOf:sprig |
| pyro | heavy (held) | boss | no hit |  |  |  |  |  |  |  |  |
| pyro | dash strike | foe | 4 | 0.134 | 3 | 3 | 0 | 44 | 23 |  | impact/hurtOf:sprig/yelp |
| pyro | dash strike | boss | 4 | 0.107 | 3 | 3.01 | 21 | 80 | 7 |  | impact/hurtOf:sprig |
| pyro | dash attack | foe | 11 | 0.124 | 3 | 4.52 | 0 | 44 | 25 | pSlash/swingUp/heavy | impact/hurtOf:sprig/yelp |
| pyro | dash attack | boss | 11 | 0.06 | 1.5 | 1.52 | 22.8 | 68 | 7 | pSlash/swingUp/heavy | impact/hurtOf:sprig |
| pyro | rising cut | foe | 8 | 0.05 | 1.5 | 1.51 | 0 | 7 | 5 | pSlash/swingUp/pJump | impact/hurtOf:sprig/yelp |
| pyro | rising cut | boss | 8 | 0.038 | 1.5 | 1.51 | 8 | 62 | 6 | pSlash/swingUp/pJump | impact/hurtOf:sprig |
| pyro | low sweep | foe | 7 | 0.08 | 3.7 | 1.51 | 0 | 0 | 0 | pSlash/swingUp/skid | impact/hurtOf:sprig/yelp/poiseBreak |
| pyro | low sweep | boss | 7 | 0.036 | 1.5 | 1.51 | 7.8 | 60 | 6 | pSlash/swingUp/skid | impact/hurtOf:sprig |
| pyro | plunge | foe | 4 | 0.039 | 1.5 | 1.5 | 0 | -62 | 5 | puff | impact/hurtOf:sprig |
| pyro | plunge | boss | 3 | 0.029 | 1.5 | 1.51 | 16.8 | -59 | 3 | puff | impact/hurtOf:sprig |
| pyro | riposte | foe | 7 | 0.046 | 1.5 | 1.49 | 0 | 60 | 6 | pSlash/swingUp/pEffort | impact/hurtOf:sprig/yelp |
| pyro | riposte | boss | 7 | 0.036 | 1.5 | 1.5 | 23.8 | 60 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pyro | skill vent | foe | no hit |  |  |  |  |  |  |  |  |
| pyro | skill vent | boss | no hit |  |  |  |  |  |  |  |  |
| pyro | skill meteor | foe | 27 | 0.09 | 6 | 1.5 | 0 | -117 | 6 | stormChant | heavy/puff/impact/hurtOf:sprig |
| pyro | skill meteor | boss | no hit |  |  |  |  |  |  |  |  |
| pyro | skill wisp | foe | 8 | 0.048 | 1.5 | 1.5 | 0 | 71 | 7 | spark/puff | impact/hurtOf:sprig/yelp/spark |
| pyro | skill wisp | boss | 4 | 0.031 | 1.5 | 1.5 | 7 | 62 | 6 |  | impact/hurtOf:sprig/spark |
| pyro | skill flameRing | foe | 12 | 0.057 | 1.5 | 1.51 | 0 | 200 | 51 |  | puff/heavy/impact/hurtOf:sprig/yelp |
| pyro | skill flameRing | boss | 4 | 0.031 | 1.5 | 1.5 | 7 | 62 | 6 |  | impact/hurtOf:sprig/spark |
| pyro | skill fireWall | foe | 10 | 0.052 | 1.5 | 1.5 | 0 | 76 | 7 | heavy/puff | impact/hurtOf:sprig/yelp |
| pyro | skill fireWall | boss | 4 | 0.031 | 1.5 | 1.5 | 17 | -62 | 6 |  | impact/hurtOf:sprig/spark |
| pyro | skill cinderStep | foe | 10 | 0.052 | 1.5 | 1.5 | 0 | 76 | 7 | throwWhoosh | impact/hurtOf:sprig |
| pyro | skill cinderStep | boss | no hit |  |  |  |  |  |  |  |  |
| paladin | light 1 | foe | 14 | 0.083 | 1.7 | 3.16 | 0 | 74 | 7 | pSlash/swingUp | impact/hurtOf:sprig/yelp |
| paladin | light 1 | boss | 14 | 0.066 | 1.7 | 3.17 | 9.5 | 74 | 7 | pSlash/swingUp | impact/hurtOf:sprig |
| paladin | light 2 | foe | no hit |  |  |  |  |  |  |  |  |
| paladin | light 2 | boss | 14 | 0.066 | 1.7 | 3.26 | 9.5 | 74 | 7 | pSlash/swingUp | impact/hurtOf:sprig |
| paladin | light 3 | foe | no hit |  |  |  |  |  |  |  |  |
| paladin | light 3 | boss | 21 | 0.11 | 2.5 | 5.07 | 39.3 | 89 | 8 | pSlash/swingUp/heavy/pEffort | impact/hurtOf:sprig |
| paladin | heavy (held) | foe | 15 | 0.187 | 5 | 5 | 0 | 132 | 14 |  | tell/swingUp/heavy/thud/stone/foeRelease/impact/hurtOf:sprig |
| paladin | heavy (held) | boss | no hit |  |  |  |  |  |  |  |  |
| paladin | dash strike | foe | 8 | 0.193 | 3 | 3 | 0 | 44 | 18 |  | impact/hurtOf:sprig/yelp |
| paladin | dash strike | boss | 8 | 0.154 | 3 | 3.02 | 22 | 93 | 8 |  | impact/hurtOf:sprig |
| paladin | dash attack | foe | 22 | 0.201 | 3 | 6.32 | 0 | 53 | 19 | pSlash/swingUp/heavy | impact/hurtOf:sprig/yelp |
| paladin | dash attack | boss | 22 | 0.161 | 3 | 6.35 | 25.5 | 136 | 11 | pSlash/swingUp/pEffort/heavy | impact/hurtOf:sprig |
| paladin | rising cut | foe | 15 | 0.153 | 3 | 6.36 | 0 | 7 | 4 | pSlash/swingUp/clank/pJump | impact/hurtOf:sprig/yelp |
| paladin | rising cut | boss | 15 | 0.122 | 3 | 6.36 | 9.8 | 114 | 10 | pSlash/swingUp/clank/pJump | impact/hurtOf:sprig |
| paladin | low sweep | foe | 14 | 0.15 | 3.7 | 6.35 | 0 | 0 | 0 | pSlash/swingUp/pEffort/thud/skid | impact/hurtOf:sprig/yelp/poiseBreak |
| paladin | low sweep | boss | 14 | 0.12 | 3 | 6.36 | 9.5 | 111 | 10 | pSlash/swingUp/thud/skid | impact/hurtOf:sprig |
| paladin | plunge | foe | 20 | 0.168 | 3 | 3.01 | 0 | 44 | 20 |  | impact/hurtOf:sprig/pPogo |
| paladin | plunge | boss | 20 | 0.134 | 3 | 3.01 | 23 | 26 | 2 |  | impact/hurtOf:sprig/pPogo |
| paladin | riposte | foe | 14 | 0.15 | 3 | 6.33 | 0 | 44 | 22 | pSlash/swingUp | impact/hurtOf:sprig/yelp |
| paladin | riposte | boss | 14 | 0.12 | 3 | 6.35 | 25.5 | 111 | 10 | pSlash/swingUp/pEffort | impact/hurtOf:sprig |
| paladin | skill consecrate | foe | 4 | 0.12 | 3 | 3.05 | 0 | 92 | 26 |  | mend/heavy/impact/hurtOf:sprig/yelp |
| paladin | skill consecrate | boss | 4 | 0.096 | 3 | 3.02 | 7 | 92 | 9 |  | impact/hurtOf:sprig |
| paladin | skill lightLance | foe | 22 | 0.174 | 3 | 7.23 | 0 | 92 | 20 |  | impact/hurtOf:sprig/yelp/lightFull/aegis |
| paladin | skill lightLance | boss | 4 | 0.096 | 3 | 3.05 | 7 | 92 | 9 |  | impact/hurtOf:sprig |
| paladin | skill holyCharge | foe | 4 | 0.12 | 3 | 3.02 | 0 | 92 | 9 |  | throwWhoosh/aegis/impact/hurtOf:sprig/yelp |
| paladin | skill holyCharge | boss | no hit |  |  |  |  |  |  |  |  |
| paladin | skill divineShield | foe | no hit |  |  |  |  |  |  |  |  |
| paladin | skill divineShield | boss | no hit |  |  |  |  |  |  |  |  |
| paladin | skill blessedHammer | foe | 9 | 0.135 | 3 | 3 | 0 | 110 | 24 | throwWhoosh/lightFull | impact/hurtOf:sprig/yelp |
| paladin | skill blessedHammer | boss | no hit |  |  |  |  |  |  |  |  |
| paladin | skill hammerLeap | foe | 15 | 0.153 | 3 | 3 | 0 | -132 | 22 | pJump/throwWhoosh | impact/hurtOf:sprig |
| paladin | skill hammerLeap | boss | no hit |  |  |  |  |  |  |  |  |
| pirate | light 1 | foe | 8 | 0.078 | 3 | 4.51 | 0 | 44 | 31 | pSlash/swingUp/pEffort | impact/hurtOf:sprig/yelp |
| pirate | light 1 | boss | 8 | 0.031 | 1.5 | 1.52 | 8 | 62 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pirate | light 2 | foe | 8 | 0.038 | 1.5 | 1.85 | 0 | 62 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pirate | light 2 | boss | 8 | 0.031 | 1.5 | 1.85 | 8 | 62 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pirate | light 3 | foe | 12 | 0.065 | 2.5 | 3.93 | 0 | 70 | 7 | pSlash/swingUp/heavy/pEffort | impact/hurtOf:sprig |
| pirate | light 3 | boss | 12 | 0.052 | 2.5 | 3.94 | 37 | 70 | 7 | pSlash/swingUp/heavy/pEffort | impact/hurtOf:sprig |
| pirate | heavy (held) | foe | 38 | 0.1 | 5 | 4.5 | 0 | 300 | 28 |  | tell/crack/heavy/impact/hurtOf:sprig |
| pirate | heavy (held) | boss | 38 | 0.08 | 5 | 4.5 | 23.5 | 143 | 14 |  | tell/crack/heavy/impact/hurtOf:sprig |
| pirate | dash strike | foe | 5 | 0.069 | 1.5 | 1.51 | 0 | 44 | 31 |  | impact/hurtOf:sprig/yelp |
| pirate | dash strike | boss | 5 | 0.055 | 1.5 | 1.5 | 21.3 | 55 | 5 |  | impact/hurtOf:sprig |
| pirate | dash attack | foe | 13 | 0.063 | 1.5 | 1.5 | 0 | 44 | 32 | pSlash/swingUp/heavy | impact/hurtOf:sprig/yelp |
| pirate | dash attack | boss | 13 | 0.05 | 1.5 | 1.51 | 23.3 | 72 | 7 | pSlash/swingUp/heavy | impact/hurtOf:sprig |
| pirate | rising cut | foe | 9 | 0.05 | 1.5 | 1.51 | 0 | 7 | 5 |  | pSlash/swingUp/pEffort/pJump/impact/hurtOf:sprig/yelp |
| pirate | rising cut | boss | 9 | 0.032 | 1.5 | 1.51 | 8.3 | 64 | 6 |  | pSlash/swingUp/pEffort/pJump/impact/hurtOf:sprig |
| pirate | low sweep | foe | 8 | 0.08 | 3.7 | 1.51 | 0 | 0 | 0 |  | pSlash/swingUp/skid/impact/hurtOf:sprig/yelp/poiseBreak |
| pirate | low sweep | boss | 8 | 0.031 | 1.5 | 1.51 | 8 | 62 | 6 |  | pSlash/swingUp/pEffort/skid/impact/hurtOf:sprig |
| pirate | plunge | foe | 20 | 0.06 | 1.5 | 1.5 | 0 | 26 | 3 |  | impact/hurtOf:sprig/pPogo |
| pirate | plunge | boss | 20 | 0.048 | 1.5 | 1.5 | 23 | 26 | 3 |  | impact/hurtOf:sprig/pPogo |
| pirate | riposte | foe | 8 | 0.038 | 1.5 | 1.51 | 0 | 62 | 6 | pSlash/swingUp | impact/hurtOf:sprig/yelp |
| pirate | riposte | boss | 8 | 0.031 | 1.5 | 1.51 | 24 | 62 | 6 | pSlash/swingUp | impact/hurtOf:sprig |
| pirate | skill grapeshot | foe | 14 | 0.05 | 6 | 4.51 | 0 | 173 | 17 |  | crack/heavy/impact/hurtOf:sprig/yelp |
| pirate | skill grapeshot | boss | no hit |  |  |  |  |  |  |  |  |
| pirate | skill broadside | foe | 22 | 0.063 | 7.7 | 4.96 | 0 | 208 | 20 |  | impact/hurtOf:sprig/yelp/crack/heavy/skid |
| pirate | skill broadside | boss | no hit |  |  |  |  |  |  |  |  |
| pirate | skill rum | foe | no hit |  |  |  |  |  |  |  |  |
| pirate | skill rum | boss | no hit |  |  |  |  |  |  |  |  |
| pirate | skill blackSpot | foe | no hit |  |  |  |  |  |  |  |  |
| pirate | skill blackSpot | boss | no hit |  |  |  |  |  |  |  |  |
| pirate | skill boarding | foe | 17 | 0.054 | 1.5 | 1.5 | 0 | 156 | 15 | pDodge | impact/hurtOf:sprig/yelp |
| pirate | skill boarding | boss | no hit |  |  |  |  |  |  |  |  |
| pirate | skill keelhaul | foe | 19 | 0.058 | 4.7 | 1.5 | 0 | -113 | 11 |  | impact/hurtOf:sprig/yelp/ropeHaul/thud |
| pirate | skill keelhaul | boss | no hit |  |  |  |  |  |  |  |  |
| reaper | light 1 | foe | 16 | 0.089 | 1.5 | 1.5 | 0 | 78 | 7 | pSlash/swingUp/pEffort | impact/hurtOf:sprig/yelp |
| reaper | light 1 | boss | 16 | 0.071 | 1.5 | 1.5 | 10 | 78 | 7 | pSlash/swingUp | impact/hurtOf:sprig |
| reaper | light 2 | foe | 16 | 0.089 | 1.5 | 1.51 | 0 | 78 | 7 | pSlash/swingUp | impact/hurtOf:sprig |
| reaper | light 2 | boss | 16 | 0.071 | 1.5 | 1.51 | 10 | 78 | 7 | pSlash/swingUp/pEffort/foeRelease | impact/hurtOf:sprig |
| reaper | light 3 | foe | 24 | 0.146 | 2.5 | 3.51 | 0 | 95 | 8 | pSlash/swingUp/heavy/foeRelease | impact/hurtOf:sprig |
| reaper | light 3 | boss | 24 | 0.117 | 2.5 | 3.51 | 40 | 95 | 8 | pSlash/swingUp/heavy/pEffort/foeRelease | impact/hurtOf:sprig |
| reaper | heavy (held) | foe | 34 | 0.236 | 3 | 6.4 | 0 | 68 | 18 |  | impact/hurtOf:sprig |
| reaper | heavy (held) | boss | no hit |  |  |  |  |  |  |  |  |
| reaper | dash strike | foe | 10 | 0.199 | 3 | 3 | 0 | 44 | 18 |  | impact/hurtOf:sprig/yelp |
| reaper | dash strike | boss | 10 | 0.159 | 3 | 3.02 | 22.5 | 99 | 8 |  | impact/hurtOf:sprig |
| reaper | dash attack | foe | no hit |  |  |  |  |  |  |  |  |
| reaper | dash attack | boss | 26 | 0.116 | 1.5 | 1.5 | 36.5 | -99 | 9 | pSlash/swingUp/heavy | impact/hurtOf:sprig |
| reaper | rising cut | foe | 18 | 0.095 | 1.5 | 1.49 | 0 | 7 | 5 | pSlash/swingUp/pJump | impact/hurtOf:sprig/yelp |
| reaper | rising cut | boss | 18 | 0.076 | 1.5 | 1.51 | 10.5 | 83 | 8 | pSlash/swingUp/pJump | impact/hurtOf:sprig |
| reaper | low sweep | foe | 16 | 0.089 | 3.7 | 1.51 | 0 | 0 | 0 | pSlash/swingUp/pEffort/skid | impact/hurtOf:sprig/yelp/poiseBreak |
| reaper | low sweep | boss | 16 | 0.071 | 1.5 | 1.51 | 10 | 78 | 7 | pSlash/swingUp/skid | impact/hurtOf:sprig |
| reaper | plunge | foe | 1 | 0.044 | 1.5 | 1.5 | 0 | 26 | 4 |  | impact/hurtOf:sprig/hiss/pPogo |
| reaper | plunge | boss | 1 | 0.035 | 1.5 | 1.51 | 18.3 | 26 | 3 |  | impact/hurtOf:sprig/hiss/pPogo |
| reaper | riposte | foe | 16 | 0.089 | 1.5 | 1.52 | 0 | 78 | 7 | pSlash/swingUp | impact/hurtOf:sprig/yelp |
| reaper | riposte | boss | 16 | 0.071 | 1.5 | 1.5 | 26 | 78 | 7 | pSlash/swingUp/pEffort | impact/hurtOf:sprig |
| reaper | skill harvestMoon | foe | 9 | 0.068 | 1.5 | 1.5 | 0 | 74 | 7 | squelch/puff | impact/hurtOf:sprig/yelp/slash |
| reaper | skill harvestMoon | boss | no hit |  |  |  |  |  |  |  |  |
| reaper | skill graveTide | foe | no hit |  |  |  |  |  |  |  |  |
| reaper | skill graveTide | boss | no hit |  |  |  |  |  |  |  |  |
| reaper | skill unholyGround | foe | 3 | 0.05 | 3 | 1.5 | 0 | 59 | 6 |  | crack/hiss/impact/hurtOf:sprig/yelp |
| reaper | skill unholyGround | boss | no hit |  |  |  |  |  |  |  |  |
| reaper | skill gravecall | foe | 2 | 0.046 | 1.5 | 1.5 | 0 | -57 | 6 | gobDie/heavy | impact/hurtOf:sprig/foeSlash |
| reaper | skill gravecall | boss | no hit |  |  |  |  |  |  |  |  |
| reaper | skill scytheThrown | foe | 14 | 0.083 | 1.5 | 1.5 | 0 | 86 | 8 |  | pSlash/impact/hurtOf:sprig/yelp/squelch |
| reaper | skill scytheThrown | boss | no hit |  |  |  |  |  |  |  |  |
| reaper | skill deathGrip | foe | 6 | 0.059 | 1.5 | 1.5 | 0 | 0 | 4 |  | hiss/clank/ui/impact/hurtOf:sprig/yelp |
| reaper | skill deathGrip | boss | no hit |  |  |  |  |  |  |  |  |

### The knight's shield against a forced blow

| blow | knight was | forced at f | rush started f | hp lost | what the game logged |
|---|---|---|---|---|---|
| sprig:bite | nothing | 10 | - | 0 |  |
| sprig:bite | block | 10 | - | 0 |  |
| sprig:bite | brace | 19 | - | 0 | bash 22@27 |
| sprig:bite | rush | 27 | 27 | 0 | bash 22@39 |
| sprig:bite | rush (bull rush) | 27 | 27 | 0 | bash 22@39 |
| hedgeknight:swing | nothing | 10 | - | 0 |  |
| hedgeknight:swing | block | 10 | - | 0 |  |
| hedgeknight:swing | brace | 19 | - | 0 | bash 22@28 |
| hedgeknight:swing | rush | 27 | 27 | 0 | bash 22@39; bash 22@109 |
| hedgeknight:swing | rush (bull rush) | -1 | - | 0 |  |
| berserker:swing | nothing | 10 | - | 45 | hit 12@43; hit 26@50 !!; hit 18@97 !! |
| berserker:swing | block | 10 | - | 71 | blocked 12@43; hit 26@49 !!; hit 12@58; hit 12@64; hit 12@70; hit 12@76; hit 12@82 |
| berserker:swing | brace | -1 | - | 21 | hit 26@80 !! |
| berserker:swing | rush | -1 | - | 0 |  |
| berserker:swing | rush (bull rush) | -1 | - | 0 |  |

## 4. Input and response

Frames at 60 fps. "k:now" = the press at frame k acted on that frame; "k:fN" = it waited and acted on frame N; "k:DROP" = it did nothing and was lost.

| hero | coyote f | jump buffer f | swing f | swing pressed during swing | dodge pressed during swing | roll f | swing pressed during roll | jump pressed during swing | turn at a run: face / move f |
|---|---|---|---|---|---|---|---|---|---|
| knight | 5 | 5 | 18 | drop 1-10; queued 11-17 (acts at f19) | drop 1-4; queued 5-9 (acts at f11) | 19 | drop 1-11; queued 12-18 (acts at f20) | drop none | 0 / 5 |
| pyro | 5 | 5 | 18 | drop 1-10; queued 11-17 (acts at f19) | drop 1-4; queued 5-9 (acts at f11) | 21 | drop 1-13; queued 14-20 (acts at f22) | drop none | 0 / 6 |
| paladin | 5 | 5 | 32 | drop 1-24; queued 25-31 (acts at f33) | drop 1-13; queued 14-18 (acts at f20) | 16 | drop 1-8; queued 9-15 (acts at f17) | drop none | 0 / 4 |
| pirate | 5 | 5 | 13 | drop 1-5; queued 6-12 (acts at f14) | drop 1-1; queued 2-6 (acts at f8) | 19 | drop 1-11; queued 12-18 (acts at f20) | drop none | 0 / 5 |
| reaper | 5 | 5 | 52 | drop 1-44; queued 45-51 (acts at f53) | drop 1-25; queued 26-30 (acts at f32) | 19 | drop 1-11; queued 12-18 (acts at f20) | drop none | 0 / 4 |
