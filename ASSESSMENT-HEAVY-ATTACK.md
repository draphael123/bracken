# Assessment: more attacks, and a heavy attack, built into the talent trees

Asked: should BRACKEN add attacks and a heavy-attack option, given to all three classes through the talent tree?

**Short answer: yes to one heavy attack as a new universal verb, no to a menu of new attacks.** The combat's
real gap is not the number of moves — it is that the basic swing has no *decision* in it. A heavy attack is the
cheapest way to put a decision on the attack button. A dozen new actives would only widen a tree that is
already 22 nodes deep per class.

## What is already in the game

- **One attack** (X), with a combo counter (`startSwing()`): swings inside 0.75 s of each other chain.
- **A heavy hit already exists in code** — `P.heavySwing` / `P.swingMul` (×1.5, ×2 on a riposte), it shoves,
  it staggers small foes, and EXECUTION reads it. It is just never the player's *choice*: it is granted by
  THIRD CUT (knight, every third swing), CONCUSSION (paladin, every third maul blow), RIPOSTE (after a block),
  EVASION (after a dodge through a blow).
- **Skills** on F, and a second on G once BOTH HANDS / TWO FLAMES / TWO OATHS is learned. Nine actives across
  the three trees per hero.
- **Keys in use**: Z jump, X attack, C block, V dodge, F skill, G second skill, E talk, Q talents.
  Down+X in the air is the plunge. **Down+X on the ground is free. Holding X does nothing.**

So the machinery for a heavier blow is built, tested and balanced against every foe in the game. What is
missing is an input and a cost.

## The recommendation, in order of value

### 1. THE HEAVY BLOW — hold X. One verb, all three heroes, differentiated by class.
Hold the attack for ~0.35 s and release: a slower swing that costs more stamina, hits through a guard, and
staggers. Concretely:

| | wind-up | cost | what it does |
|---|---|---|---|
| Knight | 0.35 s | 2× a swing | ×2 damage, breaks a shield guard, shoves — the existing `heavySwing` path |
| Pyro | 0.35 s (heat rises while held) | 2× | a short cone of flame, applies burn, +heat |
| Paladin | 0.45 s | 2.5× | an overhead that quakes the ground both ways (a small `hammerfall`) |

Why it is the right first move:
- **No new key.** Holding the attack is dead input today.
- **It reuses `P.swingMul`, the stagger rules and the guard-break rule**, so it cannot desync from the
  existing foe set.
- **It gives the attack button a decision**: mash for tempo, or commit for a break. That is the same shape as
  the block/dodge decision the game already teaches.
- **It answers three shipped problems**: shield goblins and the Quartermaster's guard currently want a
  *specific talent or a cannon*; the Drowned Bosun's beach window wants a big committed blow; and mashing is
  the dominant strategy in every bot run I have measured.

Risks and how to answer them:
- **Hold-to-charge fights buffering.** `P.abuf` fires the swing on press. The charge must start on press and
  the light swing must fire on *release inside the window*, or quick tapping will feel sticky. Implement as:
  press → light swing queued; if still held at 0.35 s → cancel the queue and charge; release → heavy.
- **It shifts every fight's DPS.** Everything is tuned against the light swing. Pin it: `tools/balance.mjs`
  and the mindless bot across the three sea levels before and after, and keep the heavy's damage-per-second
  *lower* than mashing — it buys the break, not the throughput.
- **It must not replace the plunge.** Keep it ground-only at first; an air heavy is a second question.

### 2. THE CHAIN — two talents per class, not nine.
Rather than new buttons, extend what the combo already counts:
- **FOURTH CUT / FOURTH BLOW** (1 point, one per class): the run of quick swings goes to four, and the fourth
  is a heavy one automatically. Pairs with the existing THIRD CUT.
- **FOLLOW THROUGH** (3 points): a heavy blow that kills refunds its stamina and keeps the chain alive.
Both are numbers on systems that exist. Neither needs art.

### 3. WHAT I WOULD NOT DO
- **A menu of new actives.** There are already nine per hero and the trees are the thing you rebuilt for
  legibility. Every new active competes for one key and dilutes the ones that exist.
- **A separate heavy-attack key.** Eight keys are in use; a ninth is where a control scheme stops being
  learnable on a keyboard.
- **Class-unique heavy *inputs*.** One verb, three flavours. If the knight charges and the pyro taps twice,
  nobody learns either.

## Where it goes in the trees

One root node per class, in the first branch, three points:

- Knight, branch 0 row 0: **HEAVY BLOW** — "hold X: a committed swing that breaks a guard" (then THIRD CUT
  reads as its tempo alternative).
- Pyro, branch 0 row 0: **BELLOWS** — "hold X: a cone of flame, and the heat rises while you hold it".
- Paladin, branch 2 row 0: **OVERHEAD** — "hold X: bring the maul down and the ground carries it".

Each class's second point in the same node shortens the wind-up, the third adds the stagger. That is the
existing 3-point node shape, so the UI needs nothing new.

## Cost to build

- Input and charge state: small, in `updatePlayer` next to `P.abuf` — half a day with tuning.
- Three class behaviours: the knight's is the existing path; the pyro's is a short `jet` burst; the paladin's
  is a one-wave `hammerfall`. Each is a few lines against systems that exist.
- Three talent nodes plus two chain talents: trivial (`N(...)` rows).
- **The real cost is re-measuring the balance**: every boss TTK and the mindless-bot sweep, before and after.
  Budget more time for that than for the feature.

## Verdict

Build the heavy blow on hold-X for all three heroes, gate it behind one 3-point talent per class, and add the
two chain talents. Do not add more actives. Re-run the bots before calling it done.
