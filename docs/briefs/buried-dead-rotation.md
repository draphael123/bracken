# THE BURIED DEAD — the enraged rotation

**This is a proposal. Nothing here is built.** Read it, strike out what you don't want, and I'll build what's left.

**It is not a fix, and the thing it was originally written to fix was not real.** An agent on the second machine
reported on 2026-09-24 that he fails A10 and rebuilt his enraged rotation on that. He does not fail A10: his phase
two widens the slam from 145 to 175 (`src/buried-dead.js:40`), doubles the summon (`:51`) and adds `bodyTell` to the
turn list (`:29`). Three changes. The agent compared only the two `turns` arrays and never read the resolve branches,
which is where two of the three live. That change has been reverted byte-for-byte and he is back to what is in
production.

What survived the retraction is one measurement, which is real, and which is the reason this document exists.

---

## 1. The one thing that is actually wrong

**His only player-caused opening has never been reachable before he is enraged.**

The punish is good, and it is exactly what A11 asks for. Stand over the hole he erupted from, let the slam come down
on it, and his arm goes in to the shoulder — `e.mode='stuck'`, `e.open=3.4`, against the 2.2 his ordinary rest gives.
A window you set up, worth more than one you wait for.

It has two conditions (`src/buried-dead.js:44`):

```js
if (e.brokeT > 0 && Math.abs(e.x - e.brokeX) < 30) { e.mode='stuck'; e.modeT=3.4; e.open=3.4; ... }
```

The broken ground lives **14 seconds** (`e.brokeT=14`, set when the erupt resolves at `:55`). A turn of his costs
`rest 2.2 + walk 0.9 + the tell's own wind-up`, so the gap from the erupt to the next slam is arithmetic:

| | rotation from the erupt to the next slam | | |
|---|---|---|---|
| **phase one** | nova 4.3 · claw 4.1 · cleave 4.1 · call 4.4 · slam 4.1 | **21.0 s** | vs 14 s — **never** |
| **phase two** | cleave 4.1 · call 4.4 · slam 4.1 | **12.6 s** | vs 14 s — with 1.4 s to spare |

`sinkTell` sits at index 2 of seven in phase one and index 5 of eight in phase two. Four turns separate the erupt
from the slam before he is enraged; two separate them after. **The fight's signature answer is only in the fight for
its second half, and nothing says so.** A player who never takes him below half health never sees it exist.

That it works at all in phase two is luck: 12.6 against 14 is a 1.4-second margin nobody chose.

---

## 2. Three options

### A. MAKE THE PUNISH REACHABLE — the small one

Move `sinkTell` later in the phase-one rotation so the erupt lands within the broken ground's own lifetime, the way
phase two already does by accident:

```
phase one, now:      slam · throw · SINK · nova · claw · cleave · call         erupt→slam 21.0 s
phase one, proposed: slam · throw · nova · claw · cleave · SINK · call         erupt→slam  8.5 s
```

One array reordered. No new attack, no attack removed, no number retuned, no art, and the room is not touched. It
makes an opening that already exists in the code available in the half of the fight where a player is still learning
what the fight is about.

**This is the one I would build.** It fixes something verifiably broken, it is the smallest change that does, and it
needs no taste call from you.

The 1.4-second margin in phase two is worth a second look while in there — it is not a bug, but it is unchosen.

### B. THE ROTATION REDESIGN — the large one, and the one you asked to see written up

The agent's proposal, stated fairly, minus the false premise it was attached to:

> **The sentence a player says crossing half health: "the poison stopped and the hands come twice."**

The mechanism is real and it is built on geometry that is already in the room. His nova reaches **80 px** above the
floor (`:37`). The ossuary's tiers stand at **0, 48 and 96 px** — so the high tier is nova-safe on purpose, and the
code says so: *"the ossuary grew a nova-safe upper tier."* The hands (`clawTell`) come up through whatever you were
standing on when he wound up, floor or ledge, and are the **only** attack of his that reaches the high tier.

So the high tier is currently *where you go to wait out the poison*. Take the poison away at half health and double
the hands, and the same ledge stops being a refuge and becomes the place he hunts — **without moving a single tile**.
What the room is *for* changes rather than what the room *is*. That is a genuinely elegant idea and it is why this is
worth writing down rather than discarding with the mistake that produced it.

**The case against, which is why it is your call and not mine:**

- **It takes his signature away.** The venom is his: `P.venomT` is set by nothing else in this fight. Removing it at
  enrage means the second half of the Buried Dead has no poison in it, which is a strange thing to say about him.
- **He is live.** This is in production and you have not played it. It is also the one live thing you have not seen,
  alongside the Paladin's slower charge.
- **A10 does not ask for it.** He passes. This is quality, not compliance, and it competes with eleven briefed levels.
- **It is three coupled changes**, not one: an attack removed, one doubled, and the order rebuilt. Each needs piloting
  and none of them has been.

### C. DO NOTHING

Defensible. He passes A10, he is live, and the Burial Caverns rework is already parked for being the vaguest item in
the queue. But §1 is a real defect and it costs one line, so C means shipping a known-unreachable opening on purpose.

---

## 3. What B would cost, if you want it

- `src/buried-dead.js`, the phase-two `turns` array and the `novaTell` guard. No other file.
- **A pilot, which he has never had.** The three unpiloted bosses in `docs/QUEUE.md` §6 are the Winchmaster, the
  Pyromancer and the False Abbot; the Buried Dead is not on that list but his enraged rotation would be new.
- `tools/buried-attacks.mjs` and `tools/buried-dead.mjs` both assert against his turn lists — expect both to need
  updating, and **check what they assert before changing them**, because a test edited to match a change proves
  nothing.
- A10 is **ADVISED**, not checked: `tools/phase-two.mjs` is a reading aid and it cannot be a gate. Three attempts
  established that (ternaries alone failed 17 healthy bosses; any comparison still failed 9; some bosses keep no
  phase number at all). So nothing will catch a regression here automatically. A human reads it or nobody does.

---

## 4. What I am not deciding

- **Whether B goes in at all.** It removes his poison from half the fight.
- **Whether the phase-two margin (12.6 vs 14) should be made deliberate** rather than left where it landed.
- **Whether A is worth doing on its own**, today, independently of B — I think plainly yes, but it edits a boss that
  is live, and you have said nothing ships without you.
