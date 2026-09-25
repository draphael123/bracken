# HIGHCROWN: EVERY HALL'S BELL, AND ONE AMBUSH ROOM (brief)

Daniel, 2026-09-25, on the level review (group A, section 11): **"needs work"**. Approved: write the design first,
then one commit per chunk. The Goblin Queen's fight is **not** touched (a separate lane is on her numbers).

## What is wrong, measured on the built level (origin/master e7846f3)

The level's rule line is **"EVERY HALL HAS A BELL, AND A GATE THAT DROPS WITH IT."** The built grid is 940 x 100.

| hall | bell | sentries | alarm section | what a sentry does today |
|---|---|---|---|---|
| THE OUTER WARD (the barracks) | 304,63 `ward` | 286 | **none** | just fights |
| THE ENTRANCE HALL (keep, floor 63) | 730,63 `hall` | 706 | **none** | just fights |
| THE CHAPEL (keep, floor 19) | 730,19 `chapel` | 720, 740 | **none** | just fights |
| THE LEADS (the bell turret) | 878,11 `leads` | 879 | `leads`, gate 880 rows 10-15 | runs, rings, gate drops, watch turns out |

`L.alarms` holds only `leads`. The other three sections were deleted on 2026-09-11 (6c9176c, "keys instead of body
counts") when their three gates became key portcullises on **the same columns** (322, 736, 714). The bells, the
sentries' `section` tags and four signs were left behind, so three of the four halls promise a gate that never drops.

**Why they cannot simply come back as they were:** an alarm gate is laid by `closeGate` (AIR to PORT) and lifted by
`openGate` (PORT to AIR over its rows). Laid on a lock gate's column, the lift would take the lock gate up with it, and
the key would stop mattering. So every new alarm gate stands on its **own** column, in front of (never on) a lock gate.

## The rule each bell keeps

Every hall's bell does what the rule line says, and all four keep the same four promises:

1. **Told.** A sentry who sees you shouts SEEN and runs; the HUD shows the bell, the watch still up and the time left;
   a red plate stands over every dropped gate. (All already built: `drawAlarmHud`, `drawGateHints`.)
2. **Stoppable.** Catch the sentry before he has rung for a second, or break the bell (three blows), and the hall stays
   quiet.
3. **Fair.** The turned-out watch stands on your side of the gate, on its own footing.
4. **Never cuts the route (B4).** A dropped gate lifts when the watch is down **or after twenty seconds**, whatever is
   left; dying puts the hall back (`resetCastle`). No alarm gate is ever the only way on for longer than that.

## Each hall, a different take

| hall | the take | the gate | who answers |
|---|---|---|---|
| **THE OUTER WARD** - the barracks bell | **the chase.** One sentry, a long run (18 tiles) across the open yard to a bell that stands in the open. The first bell of the level: the plain version. | a drop-grate in the inner gate's arch, **321** rows 58-63, in front of the barred gate (322). The wall is over it. | **the barracks turns out of its own door** (315): two soldiers and a javelin, under the counterweight that hangs over that door - cut it on them. |
| **THE ENTRANCE HALL** - "the gate by the stair" | **the hall turns on you.** Nobody new comes. The bell turns out the watch already walking the hall, and the stair gate stays down until the hall is clear. | the stair grate, **735** rows 54-63 (to the ceiling), in front of the iron gate (736). | **the hall itself**: every foe standing in the hall (678-735, rows 54-63) is marked as the watch. None left, and it lifts at once. |
| **THE CHAPEL** - "this bell is the loudest" | **two sentries, one bell.** One either side of it, so you can catch one of them at most; the other rings unless the bell is broken first. The loudest bell is heard on the keep roof. | the grate before the bone gate, **715** rows 10-19 (to the ceiling): the way to the altar and her key. | **the roof watch comes down the hatch** (748-750): two soldiers and a javelin. |
| **THE LEADS** - the bell turret | **no run at all** (unchanged). He stands one step from his bell: reach him before he rings. | off the turret, 880 rows 10-15. | the watch, on the turret. |

The signs over the ward, the hall and the chapel say what their bell drops and who comes, in two lines each.

**The check (so a dead bell cannot come back):** `tools/bells.mjs`, in `npm run check`. For every level: every bell or
sentry that carries a `section` belongs to an alarm; every alarm has a bell and a sentry; every gate cell is AIR in
the built grid with rock over its top (or ten rows of it), and no gate column is a lock gate's; every garrison foe
stands on footing. Then in the page, for every alarm: its own sentry sees the hero, runs, rings, the gate drops, the
watch turns out, the gate lifts when they are down; a broken bell keeps a hall quiet; the twenty-second lift works;
death puts the hall back. Proved red on the old code first (three sections missing).

**Fix the rule, not the row: the check found a fifth dead bell.** THE UNDERCROWN's works bell (44,33, sentry at 66) has
had a `section: 'works'` and a sign saying "everything below here can hear it" since the level was built (c5ef01e), and
never an alarm. It is wired the same way: rung, the gallery's end (85, rows 30-33, rock over it) drops shut over the
shaft down, and the works come up it - a miner, a rock goblin and a sprig. Twenty seconds at most, like the rest.

## THE AMBUSH ROOM (rule Q): THE BANQUET HALL

The review asked for one in the Outer Ward or the Captains Hall. **Neither, and why:**
- **The Outer Ward** comes straight after the siege yard's elite (THE KING'S CHAMPION, 208), which would put the room
  back to back with an elite (Q2). It also already carries the barracks bell, the road picket and the key fight, so a
  fourth thing there would teach the same lesson again.
- **The Captains Hall** (762-809) was the first choice. But its three balcony goblins are its own tested
  encounter (`tools/gallery-runtime.mjs` wants all three), and `ambushRooms` empties a room of its creatures when it
  is built.

**The banquet hall next door** (810-853; floor row 25; the vault is sixteen rows high; the high table stands on a dais
at 842-849). It is a place, not a corridor. It has two chandeliers on long chains over its floor ("cut one down on
whoever is under it"): these are the room's own machinery for knocking the crowd into. The story: when the bells ring,
her captain and his guard are sitting down to eat.

- **Gates 816 and 852** (36 tiles apart, Q1). West: on the floor at the foot of the steps down from the Captains Hall,
  ten rows high. East: the door to the leads, under the hall's east wall.
- **Door checkpoint 809,19**, at the Captains Hall's east end. It is outside the walls and clear of the sign on the landing.
- **The captain: THE GOBLIN CAPTAIN** (`brute`, elite, with its own moves). Storm's room is led by a pike and the Long
  Water's by a tideguard, so this is a different captain from both neighbours (Q3). The brute is Highcrown's own kind
  (the kitchen's).
  A heavy was considered and rejected: its elite name is THE KING'S CHAMPION, which Highcrown's siege-yard elite
  already carries, so the level would give two different men the same name (E7).
- **The crowd:** a soldier and a cook on the floor, and a javelin on the dais. That is three, all from the roster.
- **Measured with `BK.ambushLab`** (all six heroes, three runs each), against Q's 15-35 s. `AMBUSH_HEALTH.crown` is
  2.6: at 1 the room took 4-14 s, and at 3 two runs ran past 38 s.
- It is not back to back with an elite (Highcrown's are at 208 and 710) and it is not in a boss or mini room. The leads
  stand between it and the Queen.

## And from the review's list (what the level-fix lane did not already do)

- **Two places named THE LEADS** (signs at 710 and 855): the one over the keep is **THE KEEP ROOF**.
- **`R.calm` was never shifted by the last two grows** (the furnace line, 40, and the Captains Hall, 48): its
  banquet-roof box still says 722-765 while the roof it meant is now 810-853, and the sprinkler has stood a heavy on the
  Captains Hall roof at 797,7 where nobody can reach him. Fixed at the rule: `grow()` shifts `calm` like every other
  tile box, so the next level that grows after its calm is written cannot drift.
- **The Temperer brief** still says "Nothing is built": it is built (`tools/temperer.mjs`).
- **The ELITES comment** says the Leads' alarm gate is at 792; it is at 880.
- **Checkpoints bunched** at 756/764: 764 goes, now that the banquet room has its door checkpoint at 809.

Not done here, and why: the Forgemaster's dark armoury (art, and his room is the polish lane's); the ten loot heaps
(dressing counts, a question for Daniel).

## How it will be proved

F9 walk with the knight and the warden (start to gate, no god mode); INDEX before and after (`tools/curve.mjs`,
before: 124); real-page before/after captures in `docs/highcrown/`; every level check the lane list names.
