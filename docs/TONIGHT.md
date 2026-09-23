# Overnight run, 2026-09-23 → 24

Daniel: *"I have a lot of extra credits, and I'd like you to work autonomously on the to-do list."* Rules he set:
**park anything ambiguous and move on** rather than guessing; the other session is parked; **nothing is deployed**;
everything stays on `claude/archroom` until he has seen it.

My own rule on top: **I do not build a level he has not seen a brief for.** My notes are full of pitches he rejected
(Witchlight, the tilt-ball games, the DYNAMO track). Briefs are cheap; a rejected level is a wasted night.

---

## Done

- [x] **Suite throughput, part 1** — `tools/ports.mjs`. The suite never needed Chrome to itself; it needed its own
      port. Each checkout gets a block of ten from a hash of its path (bracken 6450, archroom 6400, slopes 6330), and
      browser profiles carry a per-run tag so another session's *crashed* browser can't be counted as this run's leak.
      *Not yet browser-proven* — the next full run is the test.
- [x] **Fire walked through every ward in the game.** The burn tick wrote `e.hp -= 2` straight into the boss while
      every ward lived inline in `hurtEnemy0`. The False Abbot's rite wards him to a *fifth*, so fire did five times
      its intended damage to him — which is why the Pyromancer kept finishing 4/4 against him. Now `wardedDamage()`,
      called by both. Pinned at the source, verified against the old code.
- [x] **334 more grass cells.** The rule that found the parapet and the crenellations, applied to the whole tower:
      the cistern floor, the library bookcases and **the Reading Room gallery I built two days ago** were all bare
      tower stone wearing `palette.grass`. Fixed by a sweep rather than a list, and `tools/skins.mjs` now asserts the
      rule across every level that paints its own stone.
- [x] **The Ore Road brief** — `docs/briefs/ore-road-rework.md`. INDEX **59** walked straight after Highcrown's 120.

## Blocked on the machine

- [ ] **The Archmage's room: full suite + merge.** Built, played end to end, pushed — but never gate-verified,
      because the other session held the machine all evening. This is first the moment it frees.
- [ ] **Regenerate the audits.** `audits/` is dated **2026-09-16**; `src/main.js` has changed as late as 09-22. I
      started working the audit backlog and found its first item (*"the plunge starts silent for four heroes"*)
      **already fixed**. The list is six days stale and has to be re-run before it is worth anything.

## Queue

- [ ] **THE BURIED DEAD: a model of his own.** Daniel, tonight: *"the buried dead boss needs a unique model."* He is
      right in the most literal way — `SPR.burieddead = bakeDead(true)`, the same baker as the zombie, the husk and
      the apprentice. A boss that is a flagged common enemy. Buildable tonight and renderable to PNG in Node, so he
      can approve the look from an image without the machine.
- [ ] **THE BURIAL CAVERNS, brief.** Also tonight: *"the level he is in is also still pretty boring, and needs more
      mechanics/interesting landmarks/scenery."* Measured, it is the worst case of this in the game:

      | level  | cols | foes | kinds | thr/100 | INDEX |
      |--------|------|------|-------|---------|-------|
      | deep   |  684 |  101 |    24 |    35.3 |   150 |
      | keep   |  862 |  115 |    15 |    34.0 |   132 |
      | harbor | 1122 |  149 |    16 |    32.6 |   120 |
      | burial | 1386 |   87 |     7 |    14.3 |    56 |

      The **longest level in the game** with the **fewest foe kinds**, at less than half its neighbours' density,
      scoring 56 after harbour's 120. Brief only — I will not rebuild a 69-screen level unseen.
- [ ] **Gale Moor / Hanging Town / the tower's INDEX.** Level quality against measured targets.
- [ ] **Briefs: the four missing hero kits and class levels.** Four of six heroes have **no talents at all** — the
      Death Knight, the Freebooter, the Paladin and the Warden — and only the Pyromancer has a class level.
      Daniel also asked specifically for **more abilities for the Warden**.
- [ ] **Suite throughput, part 2** — run the checks several at a time. The five slowest are nine minutes between
      them; this is where the thirty minutes actually goes.

## Parked for Daniel (judgement calls I did not make)

1. **Burn and the two non-ward multipliers.** `wardedDamage` folds in the five *wards*. It deliberately does not fold
   in the Archmage's stage gate (`archHurt`, which can refuse a blow outright) or the Undead Archmage's `gather`
   bonus. Those are not wards — one refuses damage, the other rewards you for having opened him — so routing
   damage-over-time through them is a balance change rather than a bug fix.
2. **The Abbot's 38%** was measured while fire was bypassing his ward, so it means as little as the Pyromancer's 4/4
   did. He needs re-piloting before anyone tunes him.
3. **The Death Knight's hitbox** (audit: reaches 24 px past the blade the art draws). Fixable by shortening the box
   *or* lengthening the art — that is a design call about his reach, not a bug with one answer.
4. **Tower flyers drift into the Archmage's sanctum** mid-fight. Pre-existing, but now they are inside a *painted*
   room and can appear to float through its walls.
