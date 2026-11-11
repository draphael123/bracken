AIRSHIP DONE 11-06 READY (code-only greybox, behind its flag; browser / art / music / tune owed - listed below)

# claude/airship - THE DESERT AIRSHIP + THE WYRMLING + THE THUNDER WYRM (OPUS greybox, code-only, 11-06)

Branch `claude/airship` off `claude/greatdune` 11ba89e65 (has src/route-insert.js; off colossus4). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-airship`.
NOT merged, NOT deployed. Nothing played in a browser (none allowed tonight). Sources: brief-desertairship-1104, plan-desert-1105 s1.12 / s3d / s3h / s3i / s4.

## FLAG / URL
`src/airship.js` `AS_SHIPS = false`. OFF: level.js appends no row (LEVELS = the base array; proved in a child process). ON: `?airship=1&level=airship`, `globalThis.BRACKEN_AS`, or `AS=1`
for node tools: the row is appended LAST, HIDDEN, needing `kingspyramid` if that row exists, else `sealedpyramid`. Road insert = src/route-insert.js's airship row, now `live: AS_SHIPS`.

## What was built
| file | what |
|---|---|
| `src/airship.js` (new, pure) | flag, rule, numbers (STOKE / ALT / COLD / BRUSH), THE SHIP (`newShip` / `holdAt` / `shipStep` / `bandLeaving`), `coldStep`, `brushStep`, the level (426 x 40), `lintAirship` |
| `src/wyrmling.js` (new, pure) | THE WYRMLING: hover/slither AI, SPIT `!!` (0.7 s tell) + COIL/BITE `!` (0.55 s), ELEMENT table shock / frost / fire (only SHOCK `ships`), element on a hero (shock = jitter + stamina sap; frost chill / fire burn rows for the mountain), cleanse by roll or warmth, 7 poses + sound keys |
| `src/thunder-wyrm.js` (new, pure) | THE THUNDER WYRM: strike / slam / roar / tail / brood (all told, own pose + sound keys), THE LURE (a mark within 44 px of a STOKED burner grounds in it: burner spent, OPEN 4 s x1.8, cap 9% a window, then a 2.5 s told WARD), stance (HIGH: slam can't reach, HEAD UP x1.0 1.6 s; LOW: rests x0.7 + a tail after each slam), floor 0.45x everywhere else, P2 at 55% (storm, 2 burners fail, one gutters every 14 s, roar + brood cap 2) |
| `src/airship-hands.js` (new) | world binding + greybox draw: hold E (or UP) = stoke / vent, the altitude + told band edges, banded spars/gangways laid as one-way planks (blink before they go), KEEL BRUSH, THE COLD on src/drain.js (`BRD`, source id `cold`, floor 1), wyrmling hits + element, the wyrm's world, HUD (lift gauge, altitude arrow, band word, COLD bar, element word), THE CRASH card |
| `src/main.js` | 15 one-line hunks, inert off the airship: import; EHP rows; MEDALS.airship; spawnEntities clear; spawn cases wyrmling / thunderwyrm / asburner+asvent; wardedDamage take; updateEnemies; foe draw; world draw; updateProps; constructor; HUD; touch-skip (told blows only); bar name; boss death case (THE CRASH) |
| `src/level.js` | import + the flagged hidden row (before `applyInserts`) |
| `src/route-insert.js` | airship row `live: AS_SHIPS`, `alt: 'sealedpyramid'`; applyInserts: an insert whose `after` row does not exist hangs off `alt` (1 line, inert for the others) |
| `src/marks.js` / `src/threat.js` / `tools/level-quality.mjs` | MARK / ANSWER / HEIGHT rows (wyrmling spit/coil, wyrm strike/slam/roar/tail/brood); threat thunderwyrm 6, wyrmling 2.5, stations 0; LQ SYSTEM_ARRAYS asStations/bandDecks/keelBrush, ROLES.ranged wyrmling |
| `tools/airship.mjs` (new) | **94 ok** (+ `--duel` toy duel) |

### The level (columns; deck floor row 26)
- **0-70 LAUNCH DECK** (teach): rule sign, STOKE sign, two burners, brazier, cargo, quarterdeck (slinger + archer), the boarders, the boarding zip over the hatch.
- **71-150 CARGO HOLD** (LOW test): hatch down; two burners; two hull breaches = THE KEEL BRUSH at LOW (shadow 0.9 s, then the sand, 12 dmg); shelf, net, cargo, lanterns; 3 raider knots (incl. a shield guard); companion stair up. **CHECKPOINT 152.**
- **151-250 THE RIGGING** (platforming 1, no foe): forecastle bulkhead blocks the deck - go over: ratline A, fighting-top burner, yard, HIGH spar A-B (19 tiles), zip B->C top, ratline C (burner), THE PIVOTING YARD (swing mover), HIGH spar to the bulkhead top, net down. Crow's-nest silver over mast B.
- **251-340 THE CLOUD LINE**: cloud veil 255-326 (lightning flicker, no hit). Burners x2, net, HIGH cloud spar one, ledge burner, net down, THE VENT, two BURNT GAPS (11 / 10 tiles) crossed on LOW gangways (a fall = the bilge walk + ladder, never a death), burners x2, HIGH cloud spar two, the envelope rib, net down; then the wyrmling deck 327-340 (4 wyrmlings + 2 raiders as one squad, a brazier).
- **341-380 THE BRIDGE** (breather): cabin, chart sign (the wyrm's sighting), brazier, coins, cabin-roof zip, **CHECKPOINT 372** (pre-boss), the lure sign.
- **381-424 THE STORM DECK**: arena 382-422, 4 burners (388/396/410/418), mast stump (3 rows: brace / stand on), the wyrm, gate after the boss.
- Shrines: start + 2 (gaps 152 / 220 / ~10 to the arena). Raiders 16 (cutthroat, slinger, archer, shield w/ `cnSkin: 'shieldguard'`, all `skyRaider: true`), wyrmlings 4.

## Node results (no browser; RAM checked)
- `node tools/airship.mjs` **94 ok**: flag both ways; route-insert airship row + alt + no migration at the road's end; lintAirship clean (no soft-lock: every station on a solid/one-way floor, banded pieces air as built, a floor under every band gap, wyrmlings only at the cloud line, no foe in the platforming sections, 12-16 raiders, 4-6 wyrmlings); platforming >= 5 beats / >= 24 tiles both; ship (1 burner MID, 2 HIGH in <6 s, burners out -> LOW and stays, vent -> LOW in ~4 s, hysteresis); cold (fills 10 s, drains to exactly 1 hp after 200 s, warmth clears in <2 s, HIGH only); keel brush told 0.9 s, never at MID/HIGH; hands on a fake world (stoke, bands exclude each other, cold on/off, keel lands, respawn resets); wyrmling tells >= 0.5 s, bite, shock sap, roll/warm cleanse; wyrm: every tell >= 0.7 s, poses, lure -> OPEN + burner spent, cap, ward, **floor min 0.45x outside openings**, HIGH head-up / LOW slam + tail, P2 two burners fail + roar + brood; main.js/level.js wiring text checks.
- `node tools/airship.mjs --duel` (TOY, a GUESS): **12/12 wins, ~91 s, 0.8 of 3 flasks, ~7 openings, 67% of damage in openings** (bot hp 420, 34/blow every 0.45 s, misreads a lure 3 in 10).
- `AS=1 node tools/level-quality.mjs airship`: ok checks, slopes, ranged, unlocks, ruleFight, route, mechanics, secrets, encounters, roles. **FAIL flat** (29% flat ok, 64% level ground > 60), **FAIL bands** (5 bands ok, 38% second height < 40), **FAIL density** (0.73/screen: the brief keeps both platforming sections foe-free), **FAIL music** (borrowed). WARN blocking (report-only).
- `node tools/route-insert.mjs` **38 ok**, `node tools/great-dune.mjs` **77 ok** (no regression). `node --check` main.js + every new file.
- SKIPPED (free RAM fell to ~480 MB under tonight's demo suite): answer-tags, one-new-foe, goblin-lint, platforming-lint, checkpoint-gaps/-stand, threat-holes, foe-glue, floaters, comments, flag-off level-quality (all levels). Run them on the branch first thing.

## Browser owed (one at a time, >= 1500 MB, memguard first; ?airship=1&level=airship)
1. STOKE/VENT in the real game: E vs UP at a station, the hold bar, bots (keys.talk is never a bot's - UP is also accepted); band planks appearing/vanishing under feet (one-way), the blink read.
2. Reach: every hero across spars / burnt gaps (11 and 10 tiles - must be past every jump incl. gliders/jets), the swing yard's arc (period 3.6, arm 5), the 3 zips, ratlines through one-way tops, the crow's nest.
3. Cold: HUD placement under the health, co-op seats (the drain is the lead hero's only), glider heroes count; keel brush hitbox in the hold.
4. The wyrm: head box reach for every hero, the slam vs the mast stump top, roar brace rule, tail toward the rail, the lure read (gold line from mark to burner), the P2 storm overlay, brood spawn spots; bossStart/walls/camLock with a noGrav boss; THE CRASH -> gate.
5. Then: mark-integrity / untold-told / hint-shown, level1-pilot airship --write, mash-bot, reach-heroes, boss-rates n=6, QUICK gate.

## Art / music owed (art before live)
Ship (silk envelope, lacquered brass-banded hull, masts, rigging, nets, burners with lift flames, vents), deck/hold/rigging/cloud tiles + parallax (dunes far below, cloud sea, storm violet), cold fx (breath frost), keel-brush sand, sky-raider reskins (goggles, harnesses, glider cloaks) incl. the shield guard, THE WYRMLING (7 poses wl*, shock glow; frost/fire palettes later), THE THUNDER WYRM (head, 3 coils, glow, 15 poses tw*), crash stills + card, bestiary cards (wyrmling, thunderwyrm - no bestiary/BOSS_T/BEAST_SHORT/COLS/BOSS_FELL rows yet), map plate. Sounds: the keys in WYRM_SOUNDS / TW_SOUNDS + stoke/steam/creak/sandBlast/shock (missing ones are silent). Music: `skyroad` + `boss3` borrowed; own level track + wyrm P1/P2.

## Merge notes
- Base is claude/greatdune (colossus4 + desertkit under it): merge after those. Hunks sit beside greatdune's own (same anchors) - expect trivial adjacency conflicts with other desert lanes that append at the MARK/ANSWER/HEIGHT tops, EHP head, and before `applyInserts(LEVELS)`.
- route-insert: the airship row is `live: AS_SHIPS` + `alt`; applyInserts gained the `alt` line. When King's Pyramid merges its row exists and the airship needs it automatically.
- **THE HEART LANE (claude/heartlevel)**: its Heart of the Mountain uses `needs: 'sealedpyramid'` as a PLACEHOLDER. At this merge that must become the mountain chain (airship -> Frostfall Pass (F1, from the wreck) -> ... -> Heart), and the Heart stays hidden until the mountain sheet exists. NOT wired here. Frostfall's brief needs its one-line TODO: F1 starts FROM THE WRECK.
- Flag-off game = the base's (no row, no insert live, every hunk asks ASH.on()/owns()).

## Questions for Daniel (recommended answer first; each built as the rec)
1. **"Drop to LOW" needed a verb**: added THE VENT (a brass valve, hold E: every burner out, she sinks ~4 s). Without it LOW = wait for 25 s of fuel (a waiting room). REC keep. Alt: no vent, shorter fuel.
2. **Cloud line split**: the brief wants wyrmlings at the cloud line AND no fight inside platforming 2 - climbs 255-326 are foe-free, the wyrmlings + 2 raiders hold the open deck 327-340. REC keep.
3. **Sky raiders**: the Falconer / Plated Bandit skins are Ksar-bound (src/ksar-hands.js); built cutthroat / slinger / archer + the gorge SHIELD GUARD (cnSkin shieldguard; the bare 'shield' is a goblin). REC reskin-only art; generalise ksar-hands later if you want the falconer aboard.
4. **Stance** (brief Q3): HIGH = his slam can't reach, his HEAD RISES (x1.0 window) but the cold drains; LOW = warm, faster (rests x0.7, a tail after every slam). REC keep. Cold does NOT slow him (brief Q4 rec NO).
5. **HIGH takes two burners** (0.5 lift each, 25 s fuel). REC keep; tune lane may move fuel.
6. **Toy duel too kind** (12/12, 0.8 flasks): REC the tune lane runs boss-rates n=6 and first narrows lureR 44 -> 32 or raises blows ~15% before touching hp (3400 now).
7. **LQ fails** flat / bands / density / music. REC the SONNET reviewer vs Mage's Folly judges; density + bands REPORT_ONLY for airship (the brief's foe-free climbs and a ship's single deck), music at the art lane.
8. **Name**: built 'THE DESERT AIRSHIP' (AS_NAME); REC 'THE DUSKWING' as the ship's name on the card (brief Q2). One-line change.
9. **The cold is the lead hero's** (BRD is bound to P). REC the browser lane checks co-op and extends if needed.
10. **The crash** is greybox: shake + three told lines + the gate. REC the art lane's stills + the 'THE ROAD CONTINUES - FROSTFALL PASS (COMING SOON)' card.

## Final tip
claude/airship FINAL TIP = the commit that adds this file (see scratch/lane-reports/airship.md for the sha). Play: ?airship=1&level=airship. Proof: node tools/airship.mjs (94 ok).
