# claude/winch4: lane report (2026-09-28)

THE WINCHMASTER, round six: Daniel's two decisions of 2026-09-29 for the Ore Road's boss (`src/winchmaster.js`, arena
`OR.ARENA` in `src/ore-road.js`). The branch is `claude/winch4`, off master a840ae8 (batch40). I didn't touch master, didn't
deploy and didn't run the full suite.

## What changed

### 1. A clearer jam (the fight's one rule made obvious)

- **Live skips glow.** A skip that will jam him if you ride it in is "live": loaded, sound (not rusted), not falling, and on a
  line running into the drum he stands on. The rule is `winchLive` in `src/winchmaster.js`. `src/main.js` `updateBucket` sets
  `m.live` every frame, and `src/ore-road.js` `drawBucket` draws it: a warm halo pulsing over the ore, a lit rim, and ore
  sparks winking. Dead skips have none of it. That covers rusted skips, skips on a line bound away from him, and every skip
  once he is off his drums (phase three).
- **Rumble.** A rider on a skip that will jam hears a low rumble (`SFX.skipRumble`, new in `src/audio.js`) every 0.42 s.
  "Will jam" means loaded, sound, boarded at least `WINCH.rideIn` px out, and coming in. A skip boarded at the drum's mouth
  has no weight behind it and stays silent. `winchC.riding` now reports `armed` by `updateBucket`'s own jam rule.
- **The jam is told.** Inside `WINCH.jamWarn` (110 px) of his drum, gold chevrons flash on the drum's mouth, pointing into it.
  IT WILL JAM HIS DRUM: RIDE IT IN is said once per ride.
- **The crash and the stall.** The jam does four things:
  - It stops the world for a beat: `hitstop` 0.12 s, through a new `c.stall`.
  - It plays its own sound (`SFX.drumJam`: the crack, iron grinding down, and the cable humming) and shakes the screen harder
    (9, up from 7), with a bigger zoom kick and sparks off the drum both ways.
  - For 1.2 s the jammed line's cable is drawn snapped taut: straight, white-hot and shivering, with sparks off the stopped
    drum.
  - He is flung off the housing: his arc onto the ledge now rises 40 px instead of 24.

### 2. Phase three: he comes down

**At 25% of his health.** His retreat already counts quarters: he leaves a housing at 75%, 50% and 25%. Phase two starts at
half. So the last quarter was the one retreat with nowhere new to go. It becomes the descent. Each phase gets a quarter of his
health or more, and a quarter taken at full damage on foot is a short duel, not a second fight.

- **Told:** HE COMES DOWN in red, a 1.0 s crouch, and a red ring on the deck where he lands. The landing hurts anyone in the
  ring. He then leaps off whatever he is on to the middle of the entrance deck (under the Head Frame).
- **Drops everything in progress.** He stops from any windup, and a downed man tears free (so the duel always comes). He
  never starts it mid-air: if he is thrown, on the cable or leaping, he lands first. Buckets still waiting to be sent and
  rocks still waiting to fall are dropped.
- **On foot** he walks at you (`walkFoot` 40) and uses the blows below. Each is on its own frame from his existing sheet, and
  each is drawn so that what hurts is what you see.

| blow | mark | answer | what it does |
|---|---|---|---|
| THE HOOK SWUNG (`whirlTell` 0.75 s) | !! | dodge | The hook whirls over his head, with a red ring on the floor at its reach (`whirlR` 50). Then it goes round him and catches anyone inside the ring. Step out, roll through, or be over it. |
| THE WRENCH (`wrenchTell` 0.55 s) | ! | block | A yellow arc in front of him (`wrenchHit` 46). The shield turns it. It then BITES THE PLANKS for 0.9 s, which is the window. |
| HE TAKES A SKIP (`rideTell` 0.8 s) | !! | jump | If you are not on his floor (you are on the low line or on the other floor), red dashes run down the low line. He then rides a skip along it at 240 px/s to the floor you are on. The skip takes you at its height, like a SEND. |
| HE COMES DOWN (`descendTell` 1.0 s) | !! | dodge | The ring on the deck. |
| THE HOOK, thrown | !! | jump | The existing throw, used only at a hero out of his floor's reach. |

- **The lines still matter.** The low line runs to whichever floor he is on: the deck, or the Great Drum's ledge after a
  ride. So from the other floor you can always ride to him. The high line runs home to the Head Frame's ledge, whose ladder
  goes down to the deck, so nobody is stranded on the Tail Wheel.
- **Half damage ends.** `winchTake` returns 1 in phase three, and `winchJam` refuses (he has no drum on foot).
- **A clean duel.** There is no roof, no rust, no sends and no leaps in phase three.
- **No stun-locks.** `cdP3` is 1.1 s between blows, and blows on foot knock you back a step (`footShove` 115), not a throw.
  In the pilot's first run a 200 px/s shove sent the warden off the deck into the drum pit twice, a fall on top of the hit,
  so I cut it. The tool proves the rest: stood beside him for 30 s, 12 blows, every one out of its own full tell, the closest
  two 2.03 s apart.

He stays FIRST in POISE_SKIP.

### Files
- `src/winchmaster.js`: `WINCH` (round six numbers), `winchLive`, `winchFloors`, `winchTake`, `winchJam`, `comeDown`,
  `stepFoot`, `throwHook`, the rumble and jam warning in `updateWinchmaster`, the new frames and fx, and the header.
- `src/main.js`: the import, `m.live` in `updateBucket`, and `winchC`: the sounds, `stall`, and `riding().armed`.
  `winchJamWorld` got the sparks.
- `src/ore-road.js`: `drawBucket`'s glow.
- `src/audio.js`: `skipRumble` and `drumJam`.
- `src/marks.js`: BY_HAND rows for the four new tells, the regenerated MARK (`node tools/tells.mjs --write`), and ANSWER rows
  for all eight of his blows.
- `src/lab.js`: the phase-three hands. They still read `OR.ARENA` through `winchFloors`, with no literals.
- `tools/ore-road.mjs`: ROUND SIX.
- `work/claude/winch4-pilot.mjs`: the 3-hero pilot.

## New assertions (`tools/ore-road.mjs`, ROUND SIX): proved red first

**Part 1 (the clearer jam):**
- the live-skip rule, and what makes a skip dead
- the glow drawn live and absent when dead
- `updateBucket` wiring it
- the rumble on a ride that will jam, and none on one that will not
- the jam told inside `jamWarn`, with chevrons, and never for a ride that won't jam
- the stall, the jam sound and the hard shake
- the taut cable for `jamFx`
- the 40 px fling
- main.js's sound, stall and `armed` wiring

**Part 2 (phase three):**
- still on his drums at 27%
- comes down under 25%, told: a red say, the ring, a 1.0 s tell
- lands on foot on the deck
- half damage off, and no jam
- the lines driven to him
- no roof, sends or leaps
- downed tears free, but never out of the air
- THE HOOK SWUNG: told 0.75 s, unblockable, missed by stepping out
- THE WRENCH: shielded, no shove; bites the planks; knocks back unshielded
- HE TAKES A SKIP: told 0.8 s, unblockable, lands him on the ledge with the line turned, missed by a jump
- no stun-lock and no untold hit
- the marks, and answer tags asking for both a dodge and a block

**How I proved them red.** I made a throwaway `git worktree` at a840ae8, copied in the new `tools/ore-road.mjs` and ran it.
Every new assertion but one failed, then it crashed (`winchFloors` does not exist there). The one exception is "a ride that
will NOT jam is never told", which is true of the old code by absence. I removed the worktree afterwards and never used
`git stash`.

**Three existing assertions changed:**
- A1's list of told attacks now names nine.
- The frame table's mode list gained the new modes.
- "NO LEDGE IS A DEAD END" runs its last lap from 60% health. Before this lane its fourth quarter-loss would now bring him
  down, not round. What it proves is unchanged: the low line runs into the Great Drum again when he is back on it.
- The "3-4 retreats" line now also pins `footAt === retreat`.

None of these is weaker.

## Pilot (bossLab, normal health, seed 3100, 1 pass, knight / warden / pyro: `work/claude/winch4-pilot.mjs`)

| hero | BEFORE (a840ae8) | AFTER |
|---|---|---|
| knight | death at 184.7 s, 25% of his health left, took 100, 1 jam | **win 87.3 s**, took 38, 2 jams, phase three reached (one of each blow on foot) |
| warden | timeout 300 s, 60% left, took 19, 1 jam | **win 252.8 s**, took 82, 2 jams, phase three reached |
| pyro | win 266.8 s, took 60, 2 jams | **win 262.4 s**, took 54, 1 jam, phase three reached |

The pilot learned phase three. It goes to the floor he is on, steps out of the hook's ring (or jumps it when the deck gives
no room), shields the wrench or backs off, cuts him while the wrench is bitten, and jumps his skip.

In the phase-three duel only the warden took a blow (the wrench, 25: her shield was not up in time). Phase three is short:
the pilot saw one of each blow before he fell.

One seed is noisy. The hitstop alone changes every later frame, so this is a smoke test, not a balance band.

## Checks (all run by name)

Green:
- **The level's and the boss's own:** ore-road, ore-exam, ore-ride, ore-work, boss-openings, boss-fight-end, tells,
  answer-tags, zoom-coverage.
- **The 7 required checks:** architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace, npc-removal.

slopes-trace died once under load ("the page never put up window.BK") and passed when re-run alone. Every level's trace is
identical, so no rebase was needed.

`tools/tells.mjs` still lists two unmarked windups, the Scalder's `pourTell` and `ladleTell`. It exits 0 and they are not
this lane's.

## UNVERIFIED
- **No real-keys playtest.** The glow, the rumble, the chevrons, the taut cable and phase three are proved by the checks and
  the bot only. I made no frame capture, to keep the PC's load down. The glow's colours (ember `#ff9a3c`, gold, white-hot) are
  my choice and were never seen on the real screen.
- **The rumble is a synth tone** (a low sine and noise). Whether it is heard over the level's music is untested.
- **The drop off the deck.** The deck is 8 tiles wide and its east edge is the drum pit. A hero knocked off falls into the
  pit, which costs a fifth of their health and a climb. The shove on foot is small (115 px/s). In the AFTER pilot the pit falls
  were all booked to "PIT after a misstep" (the warden once, the pyro about three times), none to a blow on foot. I didn't
  trace which phase each was in.

## QUESTIONS FOR DANIEL
1. **Where phase three starts: 25% (built) or 33%?** *Recommend 25%.* It lines up with his quarter retreats, and it keeps the
   duel a finish, not a second fight. But the pilot saw only one of each blow on foot. If you want a longer duel, 33% (or
   phase three at full damage with the wrench's window at 1.0 s) is a one-number change: `WINCH.footAt`.
2. **Where he lands: always the entrance deck (built), or the floor nearest the housing he left?** *Recommend the deck.* It
   is the widest floor (8 tiles). The Great Drum's ledge is 3, so a duel there is cramped. He still rides a skip there when
   you go there.
3. **What glows: only skips that can jam him right now (built), or every loaded skip on his lines?** *Recommend as built.*
   Glowing only the live ones makes the glow mean exactly "this one jams him". Loaded-but-bound-away skips glowing would make
   it read as "loaded" and not "live".
4. **The told jam line, IT WILL JAM HIS DRUM: RIDE IT IN, once per ride.** Keep it, or show only the chevrons? *Recommend
   keeping it* until you have played it; the chevrons alone may be enough later.
