# THE FALSE ABBOT — the Monastery's boss, in place of the Roc (Daniel, 2026-09-22)

> "I think I'd like a different boss than the roc in the monastery. Maybe a goblin priest or something like that? What
> do you think makes sense?" — and then: "Let's build that boss please."

## Why this one, and not the priest as he stands

The goblin priest **cannot be a boss as he is**. `DMG.gobpriest` is literally `0`: his entire verb is the rite — he lifts
the censer, mends the goblins near him and gives them `blessT` (six seconds of taking half of every blow), and any blow
that lands on him mid-rite breaks it. He is a support unit. Promote him unchanged and you get a healer you chase round
an empty roof, with nothing to read and nothing to answer.

But the level already has an engine, and the level's own rule line says so: **"WHAT THE MONKS BUILT STILL ANSWERS A
BLOW. CLIMB."** It teaches one sentence twice before the top:

- the golem: *stone does not bleed — strike a bell while it stands under it, and the note cracks it*;
- the Roc: *strike the nest bell when she is over it, and the note goes through her*.

So the boss that belongs here is the one the bells answer. THE FALSE ABBOT is the priest's rite made into a fight, with
the monastery's own great bell as the thing that beats it — and the Roc, a giant bird, is a good fight in the wrong
building.

## The room: the belfry, with its roof ON

The summit arena is already the belfry (`arena` x 2-94, floor row 30, y0 row 24), and `drawBelfry` puts a **roof over
it** which the Roc tears off mid-fight (`roofTell` → `L.belfry.roofGone`). She is why it is a nest and why it ends up
open to the sky. Without her:

- the roof **stays on**. It is a room, not a summit — which is what a belfry is, and what an abbot would be found in.
- the great bell hangs where the nest bell hung (x 56, row 29): `tbell` gains an `abbot: true` case beside `span`,
  `guard` and `roc` — the same switch, the level's own idiom.
- the **beam walk** above (plats at rows 24 and 27, the rope at x 58) is already built: it is where the congregation
  comes in, and where you can get over him.
- the spikes at x 4-12 and x 80-90 on row 29 are the room's teeth, and stay.
- the **nest dressing goes** (four eyries, the bones, the skull piles): a nest is hers. The roof re-dresses as a
  ringing floor — rope ends, a bier, the abbot's chair, spilled censers, the monks' own gear where the goblins left it.

## THE FIGHT: three layers, all at once

Not turns. (The rule that keeps being right: a boss is layers running concurrently, or it is a pattern you memorise.)

**1. THE CONGREGATION.** Goblins come up the belfry ladder and along the beam walk in a steady trickle — never a wave
you can clear, never more than four on the floor. They share **one aggro token**, so exactly one of them is ever
winding up: they are pressure and footing, not a second fight. Killing them is not how you win.

**2. THE RITE.** On his cadence he lifts the censer and blesses everything near him — the shipped machinery: `hp`
mended by `PRIEST.mend`, `blessT = PRIEST.bless`, and a blessed thing takes `PRIEST.take` (half) of every blow. **And
he blesses himself.** That is the whole difference between him and the priest below: a blessed Abbot takes half from
everything, so you cannot out-swing the rite either. Breaking his windup with a blow still spoils that one rite (as
the priest's does) — but it is a delay, not an answer, because he simply starts again.

**3. THE BELL — and it is the opening YOU make.** Ring the great bell while he stands under it and the note goes
through the rite: the censer spills, **every blessing on the roof breaks at once**, the congregation is dazed, and he
is DOWNED and takes double until he is up. That is the fight: not "hit him until he dies" but "get him under the bell".

### How you move him under the bell

This is what makes it a fight and not a chore. Two of his attacks **commit him to a place**, and both of them are
things he chooses to do to you:

- **THE CAST** (`!`) — the censer thrown flat on its chain and hauled back. Take it on the shield and the chain snaps
  taut against the boards: *he* is pulled a long step toward you. Stand past the bell and his own chain walks him
  under it. (An honest reason to stand in the dangerous place.)
- **THE PROCESSION** (`✕`) — he walks a straight line across the ringing floor swinging the censer, and does not turn.
  Bait it from the far side and he crosses under the bell on his own.

So the bell is never free: you buy it with a block you have to time, or with a red attack you have to bait and then
get over.

## HIS MOVES (five and the rite; frame data is the table, not the clips)

| | mark | what it does |
|---|---|---|
| `censerTell` → `censer` | `!` | the censer swung at head height, the chain's reach past his body. A shield turns it; it shoves you. |
| `castTell` → `cast` | `!` | thrown flat and hauled back. **Blocked, it pulls HIM** (see above). Taken, it pulls YOU in and the swing follows. |
| `processTell` → `process` | `✕` | he walks a line, censer whirling, and nothing turns it. Go over him, or round. |
| `coalTell` → `coals` | `✕` | he tips the censer: burning coals fall along the boards and lie there burning. Floor fire — no shield turns fire on the floor. |
| `riteTell` → `rite` | *(none)* | it throws no blow, so it wears no mark — the `QUIET` list, exactly like `gobpriest\|riteTell`. It says THE RITE instead. |
| `knellTell` → `knell` | `✕` | **phase two only:** he rings the great bell himself. The note hurts everything on the roof that is not blessed — and it puts the bell on cooldown, which is the price of letting him reach it. |

**PHASE TWO (under half):** the congregation comes faster, the rite is shorter and reaches further, and he starts
contesting the bell with the knell — so the room's one answer becomes something you have to take from him.

**Touching him never hurts** (the touch rule): his damage is the censer, the chain, the coals and the knell.

## What has to be true when it is done

- **The opening is CAUSED** (`tools/boss-openings.mjs`): a bell rung with him under it downs him; the same bell rung
  with him anywhere else does nothing but put itself on cooldown. Proved both ways.
- **Every windup is answerable in a human quarter-second**, two ways where the mark is yellow (the shield, and a step
  or a jump), one way where it is red.
- **One windup at a time** across the congregation (the aggro token).
- **Hyperarmour** on the procession and the knell: they are committed, and mashing must not stop them.
- **A pilot of 21+ runs** at normal health for all six heroes, target **60-75%** wins (the band the Mother Cap and the
  Hedge Warden were tuned to).
- **`node tools/tells.mjs --write`** after the marks rows; `markOf` must know every mode.
- The silhouette reads at 320x180: tall, broad at the shoulder from the cope, a hard mitre point, and **the censer out
  on its chain** — the reach you can see before it arrives. (A creature at this size is its silhouette.)

## THE ROC: moved, not deleted

She is 1100 hp with her own music, her own mark rows, `rocOverFork`, `updateRoc`, `drawRocArch`, the roof she tears
off and the boards her talons stick in. None of that is wasted — she is simply not a monastery fight. **The code all
stays**; this batch only stops the Monastery pointing at her. Where she lands afterwards is Daniel's call (an
open-sky level is the obvious home), and it is its own small batch.

## ALSO IN THIS BATCH (Daniel, same breath)

- **THE GROUNDING PASS + THE SAND CASTLES.** "Come up with a grounding patch for the monastery and remove the weird
  sand castles." To be led by screenshots of every act of the level, not by guessing: the likely culprits are the
  monks' stacked-stone props (`stoneLantern`, `shrine`) and the crag `cairn`, all of which are tapering stacks of
  warm-grey blobs that read as sandcastles at 320x180 — but the screenshots decide, not this paragraph.
- **The level changes the new boss needs**: the summit's re-dress (above), the `sub` line ("on the cliff the roc
  took") and the two nest signs, which all name her.
