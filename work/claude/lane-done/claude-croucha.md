# claude/croucha - PER-HERO CROUCH TWISTS, PART A (the knight, the warden, the freebooter)

Base: claude/batch48 5b0ec84. Opus lane. Built as Daniel approved it in the HANDOFF's CROUCH PLAN (item 14). Part B (paladin,
geomancer, death knight) is claude/crouchb; the pyromancer's crouch is the ember ward and was not touched.

## What changed
All three still use the plain duck exactly as before (src/duck.js: the hurt box drops to DUCK_H and a HIGH blow goes over). Each gets
one twist on top of it. They all live in ONE module, **src/crouch-a.js** (one file, not three, because all three share the same hooks
and state). main.js only calls into it: 1 import, `let CA`, the binding, and one-line hooks in damagePlayer0, updatePlayer (after
P.ducking is set), lowSweep, attackBox, swingKindHit, firePistol, the windup's first frame, and the hero draw.

- **KNIGHT - LOW GUARD.** When he is crouched, a YELLOW blow from the front that did not already go over him (so every low blow:
  sweeps, bites, charges at the legs) is turned by his shield. It costs a raised shield's wind (ST.blockHit, reduced by STEADY) and gives
  8 RESOLVE. There is **no knockback**: he is not slid back the way a standing guard slides him (guardPush). Out of wind the guard breaks
  (half the blow lands, he reels). A RED blow goes through, and so does a piercing bolt. A blow from behind lands, unless he has PLATED,
  which works the same as it does standing. The low guard is not a parry; parrying stays with the standing shield on the beat.
  - **SHIELD TRIP**: X while crouched and still is a short, low shield bash. It is his low sweep's kind of blow, so the family table's
    sweep key and the rule that lets a sweep pass under a guard both still apply. Damage is 0.8 of a swing. A standing common foe is
    **knocked down** for 1.2 s (floorFoe: on its back and open). Because a windup it was in is re-told when it gets up
    (poise-break.js `broke`), the trip is safe against tells. It is not tripped again for 3.2 s. Anything POISE counts as heavy
    (POISE_HEAVY, POISE_EXTRA_HEAVY, elite, big, mini, boss) **holds**: the bash puts 18 on its bar and rocks it for 0.25 s. The beast
    family (brute, troll...) glances off a sweep as before.
  - Walking with down + X is still the old low sweep.
- **WARDEN - SET THE SPEAR.** When she is crouched, the spear is levelled low and the point sits at 44 px. A foe that CHARGES or
  LEAPS onto it is **impaled** if all of these are true: it is moving at her faster than 70 px/s, its body crosses the low spear line,
  its near edge is at the point, and its told blow is YELLOW (or it is a run her brace always stopped: BRACE_STOPS). Impaled means main.js
  `impale` (broken 2.2 s, stopped dead, tip ring, VIGIL) plus the set point's own 0.9-swing bite. **Bosses and minis** take one plain
  swing's hit and are **not stopped**, unless their own rule stops them: BRACE_STOPS (the Lance's rush, the Ram Lord, the Hound
  Master) impales them as it always has. **A RED charge runs straight through**, keeping the brace's absolute rule.
  - **LOW POKE**: X while crouched and still is a flat thrust along the floor at ankle height, out to 46 px. It passes **under a
    shield** held in front: shieldbearer, soldier, watch, pike, turtle, crab, tideguard and merrow brute (the heavy knight's plate still
    turns it). Where the point lands, the tip rule pays. It is a thrust, so it trips nothing. Walking with down + X is still her sweep.
- **FREEBOOTER - DUCK AND RELOAD.** Crouched with the pistol empty, he **reloads 2x as fast** (8 s becomes 4 s) and works a ramrod.
  A shot fired from the crouch is **STEADY**: it reaches **1.5x as far** (150 px becomes 225, and 300 becomes 450 with LONG BARREL),
  it does **not throw him back** (a standing shot moves him 60 px/s backwards), and the muzzle sits 3 px lower. The ball is a
  hit-scan line (firePistol), so a "faster ball" would change nothing; the steadier shot is the longer, recoil-free one.
- **Art** (src/chars.js, the house knightFrame / KF style, 2 frames each): knight `lowGuard` (kite square across his shins with the
  sword kept back; on a block the rim goes white and rocks) and `trip` (kite drawn in, then driven out low with a white edge and dust).
  Warden `set` (heel bitten into the turf, haft levelled over her knee, point a hand off the floor; flashes white when something runs
  onto it) and `lowPoke` (drawn in, then driven flat to 46 px). Freebooter `reload` (on one knee, pistol muzzle-up, ramrod in and out)
  and `crouchShot` (arm braced level, flash, barrel barely lifted). The module draws a small glint on the set spear's point. The new
  frames stand on the ground line. The existing plain `crouch` frames sit about 3 px high with the blade in the turf; I left those
  alone.
- **SFX** (src/audio.js, synth only): lowGuard, shieldTrip, spearSet, lowPoke, ramrod, pistolSeat. The trip also uses shieldSlam, and
  the poke under a shield uses tipRing.
- **Tells: no new marks.** The yellow ! already means "a shield turns it", and that is what the low guard and the set spear do. The
  added part is the **teaching**, once per level and twice per save, on the first relevant event:
  - knight: a yellow non-high tell near him.
  - warden: a yellow charge/leap/lunge/rush tell near her.
  - freebooter: his pistol first running dry.
  The floating words the module says (LOW GUARD, IMPALED, STEADY...) are **not** on MOVE_WORDS, so in play they are hidden like the
  ember ward's. The sound, sparks and pose carry the feedback.
- **Bot** (src/lab.js, common-foe frame only; the boss frame is untouched):
  - `lowGuardNow`: the knight holds down for a yellow non-high windup in its last 0.35 s, or for 0.2 s after it, instead of standing
    behind the shield.
  - `setSpearNow`: the warden sets the spear for a yellow charge-type tell in front of her, or for the run itself.
  - `reloadCrouchNow`: the freebooter kneels and reloads when he is empty and the foe is walking in on him from 60-170 px.
  - The knight's and warden's family-table sweep is thrown stood still, so it becomes the trip or the poke.
  - The bot does **not** wind the pistol from the crouch. On three pinned Kennel Yard seeds that cost him 12-29 more taken, so the
    steady shot is a player tool.
- **Other heroes unchanged**: pyromancer (ember ward), paladin, death knight and geomancer. tools/crouch-a.mjs checks that the last
  three still duck, have no part-A twist, and still sweep on a crouched X.

## Checks (named, all green on the final code)
**crouch-a** (new). It is red on the base: "no BK.crouchA: there are no crouch twists". It proves:
- knight:
  - a soldier's yellow slash is low-guarded twice, with 0 lost and 0 px drift
  - the armour's high swing still goes over by the duck and does not touch the guard
  - a hound's red pounce gets through
  - a slash from behind lands
  - a crouched X floors a sprig that is winding its bite, and the bite never lands while the sprig is down
  - a soldier holds
  - walking + down + X is still the sweep
- warden:
  - a badger's yellow charge is impaled (dead, 0 taken)
  - a badger flagged mini takes a plain hit and is not stopped
  - a hound's red pounce is not impaled
  - the crouched poke hits a shield from the front (12) and is counted as going under it, while a standing thrust at the same
    shield does 0
  - walking + down + X is still the sweep
- freebooter:
  - the crouched reload runs at exactly 2.0x standing and seats a ball
  - a crouched shot hits a foe 190 px away that a standing shot misses, with vx 0 against -60 standing
- paladin, death knight, geomancer: plain duck and plain sweep

Also green: duck, ember-ward, tells, answer-tags, untold-told, combat-feel, juice, ability-poses, attack-tokens, audio-assets,
comments, homepaths, and the 7 REQUIRED: architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (every level
identical), npc-removal.

## Pilots (1 pinned seed each; BEFORE = base 5b0ec84 in a separate worktree, AFTER = this branch; tools/crouch-a-pilot.mjs)
| hero | Queen's Lance (bossLab, refill, 150 s cap, salt duck-1) BEFORE -> AFTER | Stockade KENNEL YARD ambush (seed 2024) BEFORE -> AFTER |
|---|---|---|
| knight | win 66.1 s, taken 129 -> win 66.1 s, taken 129 | 56.3 s, taken 76 -> 56.3 s, taken 76 |
| warden | win 69.5 s, taken 194 -> win 69.5 s, taken 194 | 51.4 s, taken 96 -> 51.4 s, taken 96 |
| freebooter | win 135.3 s, taken 301 -> win 135.3 s, taken 301 | 43.7 s, taken 40 -> 43.7 s, taken 40 |

None got worse. The results are identical because, on these two maps and seeds, **no twist changed a hit that decided the fight**:
- The Lance's blows are high, red or boss rows, and his rush has no yellow tell for the set spear.
- The Kennel Yard's threats are an archer (high), a hound (red), a sprig and a shield the bots killed before a low-guard beat came up.
- The warden set the spear 3 times against the Lance and in the room, and impaled nothing there.

To show the twists doing work in the bot's hands, I added a small fightLab run (tools/crouch-a-fights.mjs, Bracken Wood: shieldbearer,
badger and sprig against each of the three heroes, seed 2024, keepAlive):
- **Total: taken 10 -> 0, kill seconds 11.3 -> 10.9.**
- Counters: 1 low-guard block and 1 trip by the knight; 2 sets and 1 impale (the badger) by the warden.
- Per fight:
  - warden vs badger: 2.32 s / 10 taken -> 1.65 s / 0 taken
  - knight vs sprig: 1.62 s -> 1.90 s (0 taken both)
  - every other fight identical

## UNVERIFIED
- Not played by hand. The art was checked in one still capture of all six new poses beside the plain crouch, not in motion.
- Co-op: the state is on the hero (P.ca*) and a second hero carries his own. Not exercised.
- The steady shot and the crouched reload are proved by the check only. The pilots never needed them: with the plan as built, the bot's
  pistol reload never came up while a foe was walking in on him.
- The warden's LOW POKE was not thrown in the pilots (pokes 0). The fightLab shieldbearer died to her first thrust.

## QUESTIONS FOR DANIEL (built: the recommendation)
1. **Red low blows.** The handoff describes the low guard as covering "the ones a standing guard doesn't turn - sweeps, rolls, bites
   at the feet". In the game every one of those (the bale's roll, the hound's pounce, the tide marauder's rake, the troll's rip, the
   Lance's sweep) is RED and answered with a jump, and a standing guard already turns every YELLOW blow. Built: the low guard turns
   yellow only, so the one rule of the marks (red: no shield) still holds. Alternative: the crouched knight also turns red JUMP-lane
   blows. That would need a new mark or lane so the red !! does not lie to him. Rec: keep yellow only.
2. **Low guard cost.** Built: a raised shield's wind per blow, with no hold drain (the duck is free for every hero) and no parry. Rec:
   keep. If crouching becomes the knight's best defence in play, add the hold drain (18.75/s, as standing).
3. **Freebooter numbers.** Built: reload 2x crouched; steady shot 1.5x reach and no recoil. Rec: keep. 1.4x reach if it outranges
   archers too easily.
4. **Trip damage.** Built: 0.8 of a swing (0.6 made the bot knight measurably slower on a sprig), knock-down 1.2 s, no second trip for
   3.2 s. Rec: keep.
5. **Words.** LOW GUARD / IMPALED / UNDER THE SHIELD / STEADY are hidden in play (not on MOVE_WORDS), like the ember ward's words.
   Rec: add IMPALED and UNDER THE SHIELD to MOVE_WORDS so the two twists that are hard to see get named; I left that to you because
   the list's own note says PINNED is the only word her spear may say.
6. **The plain crouch frames** of all heroes float about 3 px with the weapon in the turf (they predate this lane). Rec: an art lane
   grounds them the way the new frames are.
