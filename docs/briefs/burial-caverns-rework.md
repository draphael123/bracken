# THE BURIAL CAVERNS — the rework

> **CORRECTED 2026-09-23, AFTER THE THREAT TABLE WAS FIXED.** Everything below was first written against an INDEX of
> **56**, and that number was wrong: `src/threat.js` had no entry for `zombie`, `bonegob`, `bonearcher`, `apprentice`
> or `husk`, and `curve.mjs` skips what it cannot look up. This level alone was placing 61 zombies that scored
> nothing. Re-measured, it is **foes 87 -> 183, threat 198 -> 434, INDEX 56 -> 108** - and 108 after harbour's 124 is
> a perfectly ordinary step, not the -64 collapse I reported. **THE LEVEL IS NOT EMPTY. I WAS MEASURING A BROKEN
> TABLE.** Daniel's actual complaint - that it is boring - stands on its own feet and is about SHAPE, not density:
> 1,386 columns is still the longest level in the game, and 230 columns a place with 13 kinds is still a lot of
> walking between ideas. Read §3 (what it lacks) and ignore every number in §1 and §4.
Daniel, 2026-09-23: *"the level he is in is also still pretty boring, and needs more mechanics/interesting
landmarks/scenery etc."*

**This is a brief. Nothing here is built.** The boss's fight has already been changed (two tiers and THE HANDS); this
is about the 1,386 columns leading to him.

---

## 1. What is measurably wrong

| level | cols | foes | kinds\* | thr/100 | hazard | gap | INDEX |
|---|---|---|---|---|---|---|---|
| deep | 684 | 101 | 24 | 35.3 | 28 | 28 | 150 |
| keep | 862 | 115 | 15 | 34.0 | 95 | 39 | 132 |
| harbor | 1122 | 149 | 16 | 32.6 | 21 | 72 | 120 |
| **burial** | **1386** | 87 | **7** | **14.3** | 44 | 43 | **56** |

It is **the longest level in the game** at less than half its neighbours' threat density, scoring **56 after
harbour's 120** — a −64 step where the rule of thumb allows −8. It is not short of *space*; it is short of
*anything happening in the space*.

**\*But the kinds column is lying, and so is the INDEX.** See §4 — this is the more important half of the finding.

## 2. It already has good bones

Six named places, which is more than most levels manage, plus the ossuary:

`GRAVE CAUSEWAY` · `THE RESTLESS ROWS` · `THE FALLING GALLERY` · `THE PLAGUE VAULT` · `THE BONE STAIRS` ·
`THE LAST PROCESSION`

and real machinery: 6 pools, **11 gas vents**, 15 interiors, falling stone. The problem is not that it was built
carelessly. It is that 1,386 columns divided by six places is **230 columns a place** — more than eleven screens each
— and no place has enough in it to carry eleven screens.

## 3. What I would propose

**Not "more enemies".** Raising density alone would make it a longer grind. The three things it lacks:

- **A verb of its own.** Every other strong level has one — the tower turns over, the cableway moves under you, the
  Hexed Fields glow green. The caverns have *gas vents* already and do almost nothing with them: a vent you can
  **light** would give the level a verb that is also a light source in a dark place, and the dead are exactly the
  thing that should fear it.
- **Landmarks you steer by.** Daniel asked for these by name. 230 columns with nothing to aim at is why it reads as
  long. One unmissable silhouette per place — a collapsed bell, a barrow king's door, a cave-in you tunnel under.
- **A reason to go down rather than along.** The level's own rule is *"FOLLOW THE CANDLES. THE LOWER ROAD ALWAYS
  LEADS BACK UP"* — a promise about verticality that the build mostly keeps flat.

## 4. THE MEASUREMENT IS BROKEN, AND IT IS NOT ONLY THIS LEVEL

`tools/curve.mjs` scores a foe by `THREAT[e.t]` and **skips anything not in the table**. Four of this level's foe
kinds are missing from `src/threat.js` altogether:

| foe | in this level | threat weight |
|---|---|---|
| `zombie` | **43** | *absent* |
| `bonearcher` | **20** | *absent* |
| `bonegob` | **18** | *absent* |
| `husk` | **12** | *absent* |

That is **93 foes — over half the level — counted as nothing**, including its single most common enemy. So burial's
INDEX of 56 is not a measurement of a quiet level; it is partly a measurement of a table with holes in it.

This matters well beyond the Burial Caverns, because that same INDEX is what we use to judge *every* level: the Scree
Path rework was aimed at it this afternoon, and my Ore Road targets are written in it. **Before any of this level is
rebuilt, the table needs auditing and a check needs to exist that fails when a placed foe has no threat weight.**
I have not fixed it yet because the suite is running and I will not edit under it; it is first in the queue after.

## 5. What I will not decide alone

- Whether the answer is **fewer columns** or **more content**. Cutting a 69-screen level to 45 is a different
  proposition from filling 69, and it is Daniel's call which one he wants.
- Whether the **gas vents** become the verb, or whether that is too small an idea to carry a level this size.
- Whether the missing THREAT weights should be **added** (making burial's real INDEX jump on its own) or whether
  those foes are genuinely meant to be weightless — I doubt it for a zombie, but it is a design statement either way.
