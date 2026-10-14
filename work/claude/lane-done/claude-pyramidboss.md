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
