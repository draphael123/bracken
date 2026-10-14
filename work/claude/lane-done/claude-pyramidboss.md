# claude/pyramidboss - THE SEALED PYRAMID: THE TOMB-KING'S SARCOPHAGUS + THE SCARAB MOTHER AS THE MINI (Opus, 2026-10-13) - LANE B of scratch/briefs-sealedpyramid-1013.md

Base: claude/pyramidlevel 71df4ee2 (lane A). Port 8895. **Art is placeholder** for every new piece (readable greybox poses, each move its own windup + release). Art before live: lane C draws them (list below).

## What changed

### THE TOMB-KING'S SARCOPHAGUS (new boss, L.arena in BOSS_SLOT, `tombking`)
- `src/tomb-king.js` (pure: numbers, moves, phases, the flip, the switches, `tkPlan` the bot) + `src/tomb-king-hands.js` (world binding, chain/sand/dead, placeholder drawing).
- A man-sized stone coffin on stone legs; the pharaoh shows only when the lid is off. A CONSTRUCT / PUZZLE boss (B11/B14).
- **Damage (B15):** closed lid x0.4 (told clank + "SEALED: TIP HIM WITH A SWITCH", later "SEALED"); phase three (lid cracked) x0.55; lid thrown x0.4 ("HIS ARMS GUARD HIM"); ward x0.4. **FLIPPED** = open 3.6 s, x1.7, gold ring + timer bar (B10); the window's purse is 12% of him, counted in `wardedDamage` after every multiplier (damage-caps holds it). Then the lid CLAMPS (0.6 s) and a told 3 s ward (B3): a trap/counterweight in it glances off.
- **The flip is the level's mechanic (B1/B17), never a timer:**
  - THE SWITCHES: a lever on each wall at its side ledge's end, struck from the ledge (or a jump from the floor under it), swings that side's COUNTERWEIGHT across the floor's near half - in its sweep he is TIPPED OVER. From phase one (it teaches the rule); levers reset 9 s, 4.5 s in phase three (twice as fast).
  - THE PLATES (from phase two: THE TRAPS ARM): the three pale plates fire the chamber's traps - the west block, the east block (ceiling slots), the middle plate's two dart walls. Each plate stands before its reach (the level's rule). A trap that lands on him flips him; a plate HE stands on (a windup, a landing, the end of a roll - he steps over plates while he walks) fires on him, and on you if you stand in its reach. His thrown lid presses the plates it rolls over; his Grave Call's mummies tread them.
- **11 told attacks** (one windup at a time; picked by where you stand: ledge / close / mid / far + the platform-dwell timer; never the same twice running; gap walk 1.6/1.5/1.15 s):
  - P1: LID SLAM `!` (+ shock line along the floor), BANDAGE LASH `!` (floor or ledge, pulls a step), COFFIN LEAP `!!` (the platform you stood on > 4 s; shadow + roar, 0.9 s tell), CHAIN REEL `!` (hauls you in; a blow cuts it).
  - P2 (60%): GRAVE CALL (told, no blow: 2 dead, max 3, from the floor alcoves; mummies press plates), LID THROW `!` (disc to the wall and back: answered twice), CANOPIC VOLLEY `!` (four marked jars, poison clouds).
  - P3 (30%): TOMB ROLL `!!` (the floor's length; over a plate he trips on it), SAND BREATH `!` (cone: screen-edge blind 1 s + slow), SAND PIT `!` (your spot: a bite, then sucking sand), CURSE MARK `!!` (your spot, a sand column 1.5 s later).
  - Reds are only the leap, the roll and the curse. **STATED CHANGE to B5** (one new move a phase -> 3 and 4, the brief asks for eleven): asserted in tools/sealed-pyramid.mjs G.
- Arena (`src/sealed-pyramid-tombs.js` BOSS_SLOT, the burial chamber): **the side ledges came down from row 17 to row 21** - at 17 (7 rows up) no hero could reach them (JUMP_UP 3); probed: knight/warden/pyro all land on them from the floor. Levers at the ledge ends (cols 1008/1045, rows 18-20), counterweight sweeps 1007-1022 / 1031-1046, four floor alcoves, the four traps on lane A's plates/slots, `tk:` inert until phase two. The placeholder great-sarcophagus prop, switch-mount and pale-plate decor are replaced by the real pieces.
- Registered everywhere: EHP, spawn, BEASTS card, BOSS_T, BEAST_SHORT, COLS, KNOCK_SKIP, touch rule, roar, death (THE KING SLEEPS), BOSS_FELL, bar name, BK.tombKing/tombKingHands, boss-greed (OPEN_RULE tkOpen, OWN_WARD), boss-read (SEALED), marks.js (BY_HAND/MARK/ANSWER/HEIGHT), threat, boss-music (`tombking` = the tomb theme placeholder + p2/p3 variants until lane C), audio-assets, hint lines (TK_SAY spread into SAY_LINES).

### THE SCARAB MOTHER -> THE LEVEL'S MINI (L.mini in MINI_SLOT)
- `stageScarabMother` returns `mini` (wallL 451, **gate 492**: her east door is now a PORTCULLIS her death lifts - PORT cells; was an open door her arena wall shut). Her ent is `mini: true`; she never takes the boss slot.
- Hands are mini-aware (her room is L.mini, her fight reads miniActive, her music plays in a mini); main.js wakes her on the mini trigger and clears her brood/marks on her death; MINI_DONE "HER DOOR LIFTS: THE WAY UP TO THE KING".
- Mini numbers: hp 2900 -> 1500 (B6 minis), her opening caps unchanged (+ the mini's third cap, no finisher one-shot of a mini).
- **Two new moves that answer crowding** (off her cycles, by where you stand - so each phase still adds one cycle move, B5 holds for her): LEAP-SLAM `!!` (on her ledge > 2.6 s or one spot > 4 s: crouch, shadow on your platform + shake, she lands on it; on the ledge she perches then drops) and BURROW-UP `!!` (phase two on, one spot > 3.5 s: she digs in, a dust trail runs under you - the ledge too - stops in a ring, and she erupts straight up to the ledge's height). Placeholder poses (transforms of her baked frames).

### Lane A's scaffolding deleted
- `arena.until` (main.js bossStart + sealed-pyramid.js), `L.routePastBoss` (sealed-pyramid.js, tools/pacing.mjs, tools/level-walk.mjs, tools/elites.mjs - reversed to their pre-lane-A lines). tools/sealed-pyramid.mjs F now asserts they are gone (stated change).

### Bot (src/lab.js)
- `tombking` branch (tkPlan): human eyes; climbs the ledge of the half he is in and strikes the switch when he walks into its sweep; from P2 treads a plate whose reach he is in; leaves the leap's platform; jumps the roll/lid/shock line; off the jars/curse/pit marks; cuts the chain; warden deflects (brief: "warden deflect/step back").
- smPlan: leaves the platform her leap's shadow is on; steps out of the burrow-up's ring.
- tools/boss-rows.mjs: `sealedpyramid:mini` added.

(RATES / CHECKS / RE-STAMPS / ART / QUESTIONS: below)

### Level touches outside the arena (stated)
- `L.reachDoors`: her portcullis reads open in the reach model (her death lifts it).
- **Second-height shelves in lane A's long flat runs** (sealed-pyramid-tombs.js, one block): with the boss room now at the far end, level-quality measures the whole second half for the first time (it stopped at her lair before) and `bands` failed (33% of the width offers a second height, bar 40%). 13 shelves / stepped pairs (494-503, 537-541, 561-564, 578-584, 591-597, 619-627, 691-699, 741-751, 761-766, 833-838, 953-960) -> 41%. One first try (852-860) let the oil warden's gate @853 be walked round (tools/elites.mjs) and was moved.

## Rates (tools/boss-rates.mjs, practiced, campaign L41, human profile, flasks=kit, jobs=1)

| row | flasks (6 seeds) k / w / p | dry (3 seeds, human+dry) k / w / p | mash |
|---|---|---|---|
| **sealedpyramid** (THE TOMB-KING) | 4/6 3/6 4/6 = **61%** (band 60-70) | 0/3 0/3 0/3 = 0% | 0/6 (boss left 94-99%) |
| **sealedpyramid:mini** (THE SCARAB MOTHER) | 3/6 5/6 6/6 = **78%** (band 75-85) | 0/3 1/3 2/3 = 33% | 0/6 (left 61-91%) |

- Fights: boss 106-229 s (warden the longest - near the 240 s cap), mini 57-103 s.
- Tuning path (logs in work/claude/pyramidboss/rates-r1..r5): the knight won 6/6 three passes running because the switch flipped the boss every ~12 s and the windows alone killed him; the fix was a smaller window purse (12% -> 9%) and slower levers (9 -> 13 s; 6.5 in P3, still twice as fast), then harder reds (the knight's shield turns the yellows).
- Dry is harsh (0/9 boss): that is the flask target's known gap (dry 50-60 bosses read 90-100 with flasks). Reported only.
- **AT MERGE: add `sealedpyramid` (THE TOMB-KING) to DIAL_EXEMPT in src/boss-pressure.js on claude/flasklever** - he was tuned here to 60-70% with flasks and must not be dialled again. (The mini row too if the dial touches minis.)
- Final numbers: TK hp 5000, gaps 1.6/1.5/1.15, purse 0.09, levers 13/13/6.5 s, dmg slam 42 lash 31 leap 64 roll 62 curse 66 (the rest in TK.dmg). Mother hp 1500, charge 30.

## Checks (PORT 8895, one browser at a time) - all green
- node: sealed-pyramid **240/240** (new G: 11 attacks, reds only leap/roll/curse, phases 4/3/4 STATED CHANGE to B5, left alone never opens, every blow told, the flip opens >= 3 s at 1.5-2x capped then a told ward, both switches tip him in their sweep / nothing outside it / P3 twice as fast, the chamber's traps are the level's own and arm in P2, he picks by where you stand, the Mother as a mini + both new moves land); tells (935 rows, rewritten by --write), answer-tags, boss-read, hint-shown, deadends, drawn-solids, solid-islands, architecture, signs, floaters, spawns, killzones, collectables, checkpoint-gaps, elites, one-new-foe, level-reach, reach-heroes, stuck --static.
- page: **boss-openings** (the Mother as the mini: block/darts/stone + glance; the Tomb-King: alone 0, west switch, glance in ward, P2 west block plate, the plate under him), **damage-caps** (his window under chain/riposte/broken/x2: 9 caps hold), **boss-fight-end** (63 fights incl. both), **mark-integrity** MI_ONLY=tombking,scarabmother (every mark posed + landed), untold-told, hint-shown, sealed-pyramid-stuck 8/8, **textfit --strict** bestiary/bossjump/boss/hints: 0 issues.
- **level-quality: CLEARS THE BAR** after the re-stamps (LEVEL THEN BOSS): docs/level1-pilot.json (24 blows, 6 deaths, walked 100%), docs/level1-curve.json (557% a run, 12 deaths - inside act 5's band 150-700% / 2-12, but at its top edge), docs/mash-bot.json (level: every hero dies; boss 0/6; mini 0/6). Only sealedpyramid rows changed.

## Reds / notes
- Curve deaths 12 in 3 runs = the band's top edge (the walker now fights the Mother as a mini and the burial chamber's switches/plates are live). Watch it in the suite.
- cast-poses.mjs does not exist on this branch (placeholders are distinct per mode; mark-integrity proves the windups move).
- Pre-existing (lane A): warden/pyro walkers never finish the first half (walker hands).

## ART needs for LANE C (placeholders today) - 26 frames + pieces
1. **THE TOMB-KING** (src/tomb-king-hands.js POSE table is the contract: every mode its own pose): 11 attacks x windup + release = 22 frames - slamTell (reared, lid lifted) / slam (body brought down) + the shock line; lashTell (arm drawn back, bandage trailing) / lash (whip out); leapTell (crouch, red glow) / leap (airborne) + perch/drop; reelTell (chest chain coiled) / reel (chain thrown) + the chain; callTell (lid cracked, green glow) / call (arms out); throwTell (lid lifted) / throw (lid thrown) + lidless (arms crossed, pharaoh showing) + catch + the spinning lid; volleyTell (two jars raised) / volley + the jars and the poison clouds; rollTell (tipping) / roll (on his side, rolling) + rollEnd; breathTell (face-slot glow) / breath + the sand cone; pitTell (raised foot) / pit (stomp) + the sinkhole; curseTell (red glow) / curse + the sand column and its mark.
2. **His lid-off / FLIPPED state** (on his back, the pharaoh's linen and gold mask), clamp, the P3 cracked lid, walk cycle, sleep/wake, hurt flash; his bestiary card (today two placeholder poses).
3. **The burial chamber**: the two wall SWITCHES (lever, ready / thrown / winding gauge) and their COUNTERWEIGHTS on chains (rest + swing), the side ledges on chains, the four floor ALCOVES (his dead climb out), the two ceiling block slots, the dart holes either side; his blind vignette.
4. **THE SCARAB MOTHER's two new moves**: LEAP-SLAM crouch + jump (today her skid frame squashed / charge frame tilted), BURROW-UP dig + eruption (today burrowTell sunk / burrowUp tilted) and its dust trail + ring = 4 frames.
5. **Music**: `tombking` (+ :p2/:p3) plays the Mother's tomb theme as a placeholder; he needs his own (brief LANE C 1).

## QUESTIONS FOR DANIEL (rec first = what is built)
1. **His name.** Rec: **THE COFFIN KING** (short, reads in the bar and the boss-jump list). Built: bestiary/bar "THE TOMB-KING" (the full "THE TOMB-KING'S SARCOPHAGUS" truncated in the boss-jump row). Alts: THE SEALED KING, KING IN STONE.
2. **Side ledges lowered 17 -> 21** (no hero could reach row 17). Rec: keep (built). Alt: keep them high and add a step per side.
3. **Lid Throw** leaves him lidless while the disc flies - rec: his crossed arms guard (x0.4, "HIS ARMS GUARD HIM": no timer opening, B13) (built). Alt: x1.0 while lidless as a risk/reward.
4. **He steps over plates while walking** and only presses one he stops on (a windup, a landing, a roll). Rec: keep (built) - luring him to stop on one is the skill. Alt: any step presses.
5. **Grave Call adds** (2 in P2, 3 in P3, max 3; mummies tread plates). Daniel dislikes adds generally; the brief asks for this one. Rec: keep (built, lighter dead at 55% hp). Alt: cut it to 10 attacks.
6. **The mini's portcullis**: her east door is now a portcullis her death lifts (lane A had it open, walled by the arena). Rec: keep (built - the standard mini contract).
7. **Second-height shelves** added in lane A's flat runs so level-quality's bands bar holds now the whole level is measured. Rec: keep (built); lane C may dress them as tomb shelves.
