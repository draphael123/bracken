# Lane claude/botfix: two bot bugs, the stamina rework, and a full boss-lab measurement (2026-09-25/26)

Daniel, 2026-09-25: BOT BUG A (the lab hands park one pixel outside their weapon's reach), BOT BUG B (the shelf rule
fires on the bot's own hops), STAMINA for all heroes ("easier to run out of stamina but have it regenerate
quickly"), and a full before/after boss-lab measurement.

## The WIP this lane resumed, and what I did with it

The branch's head when I picked it up was `c72a009`, a coordinator-saved WIP on top of two real, already-committed
lane commits: `436827c` (BOT BUG A + B, its own new check `tools/lab-reach.mjs` green) and `af10a4a` (the STAMINA
rework, every number below). Reading `git show --stat` of the WIP against its parent (`af10a4a`) showed it touched
`src/geomancer.js`, `src/lab.js` and `src/main.js` - and the diff was a **near-total revert of both real commits**:
`LAB_STAND` back to the old hand-set table, the shelf rule's `P.ground` fix narrowed back to the Goblin Queen alone,
the general stuck-recovery block deleted outright, `GEO.ward.hitSt/holdSt` back to 16/15, and every STAMINA number
in `main.js` back to its pre-`af10a4a` value. Alongside that it added `tools/botfix-pilot.mjs` (new) and two logs,
`work/claude/pilot-before.log` (2 lines - only the boss-discovery header, no fight rows) and `pilot-after.log` (383
lines of real fight data, but captured while the tree was in the reverted state).

Read together, this is not an abandoned experiment: it is an in-progress **task 4 measurement** where the source was
rolled back to get a BEFORE run, the run only got as far as the discovery header before something stopped it (hence
the empty `pilot-before.log`), and the "AFTER" label on the log with 383 rows is a mislabelling from the same
half-finished swap - it was captured against the *reverted* (BEFORE-shaped) code, not the real fix. The lane was cut
off (Daniel, ~03:30) before the code was swapped back and a real AFTER run taken.

**What I did:** `git checkout af10a4a -- src/lab.js src/geomancer.js src/main.js` (verified byte-identical to
`af10a4a` afterward - both real fixes and every stamina number intact), dropped both pilot logs (neither is a valid
before/after pair), and kept `tools/botfix-pilot.mjs` - it matches task 4's spec exactly and is sound on inspection.
Commit `5020e9c`. Task 4's measurement below is a clean re-run, not a reuse of the WIP's logs.

## BOT BUG A: the lab hands' stand distance, derived from their real reach

`LAB_STAND` (`src/lab.js`) used to be a second, hand-set table beside `LAB_REACH` - close for six heroes but only
2 px of margin over the walk deadband (4 px) for the warden, so a flat arena floor could park him one pixel past his
own reach and he would cut at air (found on the Reefmaw alone by claude/reef2, fixed there for him only). It is now
**derived** from `LAB_REACH` for every hero: `LAB_STAND[h] = LAB_REACH[h] - STAND_MARGIN` (`STAND_MARGIN = 6`, more
than `WALK_DEADBAND`), so the worst rested spot (`LAB_STAND + WALK_DEADBAND`) is always at least 2 px inside the real
swing, for every hero and every boss that uses the generic stand formula, not only the Reefmaw.

New check `tools/lab-reach.mjs` (in the suite): parks every hero at exactly the worst-case rested distance against a
sample of 9 bosses (`wood, kings, spire, crown, reef, flotilla, hurricane, waymeet, undercrown`) and asserts the
strike lands (`P.hitSet`, not `hp` - several of these bosses only take damage through a gate, a different question).
**Proved red on the old table first** (the warden missed 2 of 9), green on the derived one - 56 of 56 pairs checked
this run.

## BOT BUG B: the shelf rule, fixed for all nine bosses it covers

"A blade cannot reach down from a step" (`boss.y > P.y + 24`) used to cancel a strike whenever a boss was more than
24 px below the hero - which fires just as reliably on the boss's OWN HOP as on a real shelf, since a jump apex is
well under 24 px of hang time. claude/queenpillars fixed this for the Goblin Queen alone (`P.ground`, Daniel: "FIX
THE BOT, not the Queen"). It now asks for the ground for all nine bosses this rule covers: chief, frog, king, ram,
windcaller, gqueen, closedhelm, prince, strawking.

## STAMINA, all heroes: every number, old -> new

Daniel: "easier to run out of stamina but have it regenerate quickly." Regen starts sooner and comes back faster;
almost every cost is about a quarter more.

- `ST.delay` (how long after a spend before regen resumes): **0.5 -> 0.2 s**
- `ST.regen`: **48 -> 75** a second
- `ST.swing` 12->15, `ST.plunge` 28->35, `ST.dodge` 16->20, `ST.blockHit` 11->14, `ST.hold` 6->7.5, `ST.knightHold` 15->18.75
- `DEF_COST` (Warden's deflect): **7 -> 9**
- Death Knight's `WARD_RAISE`/`WARD_HOLD`/`WARD_HIT`: **6/12/5 -> 8/15/6**
- Base swing for the fixed-weapon heroes: paladin **22->28**, pirate **7->9**, reaper **18->23** (also feeds
  `heavyCost()`: `sword().cost * 2.2`)
- Every sword's cost: steel/ember/frost/gilded/thorn/silverleaf **12->15**, shadow **7->9**, laurel **11->14** (own
  desc text updated), moon **16->20**
- Shoulder charge **6->8**; the perfect-ward parry-fail cost **8->10**; the aegis hold drain **22->27.5/s**; wading
  **5->6.25/s**; the spored-cloud drain **8->10/s**; the Warden's vault (both branches) **10->13**, and its
  `P.st >= 10` gate moved to **13** so it never fires under-cost; a boss's "THE LIGHT IS HEAVY" block cost
  **18->23**; the Pyromancer's ember **35->44** (her own comment updated); every hero's dash attack (`DASH_STRIKE.*.st`)
  **10->13**; the Freebooter's Hook (`throwHook`) **12->15**
- Every bought F/G skill's `spend()`: fireWall **25->31**, cinderStep/risingCut/holyCharge/wisp/flameRing/shieldThrow/
  lightLance/boarding/harvestMoon **20->25**, vent/blessedHammer **15->19**, consecrate/groundSlam/whirlwind/
  hammerLeap **25->31**, disarm **20->25**, ironclad **25->31**, lunge **18->23** (own comment updated), deathGrip
  **20->25**, graveTide **24->30**, unholyGround/scytheThrown/gravecall **26->33**, broadside **24->30**, blackSpot
  **16->20**, keelhaul/grapeshot **18->23**, skewer **18->23**, wheel/harrier **16->20**, javelin/setSpears/
  poleSpring **22->28**, fullStretch **25->31**, spearDance **30->38**, rainOfSpears/swordOfRealm **40->50**
- The Geomancer's nine: stoneStep **12->15**, boulder **16->20**, spikeRow/stoneWall **18->23**, archway **20->25**,
  entomb/faultLine **22->28**, golem **30->38**, avalanche **40->50**, and her ward (`GEO.ward.hitSt`/`holdSt`)
  **16/15 -> 20/19** (the comparison to the knight's own cost, in her own comment, updated to match)

Written with a Node patch script (`work/claude/patch-stamina.mjs`), every replacement asserted against an exact
occurrence count before the file was written. Verified after the merge that every one of these is still in place.

## Task 4: the measurement (before = origin/master `eeaad91`, after = this branch post-merge, botfix-pilot.mjs, refill, 150 s cap, 7 heroes, one run each)

322 fights both times (32 arena bosses + 14 minis x 7 heroes, minus a couple of build failures). **TOTAL: before 309/322
wins (96%), median win 37.2 s, median dmg taken 45. After: 310/322 wins (96%), median win 31.7 s, median dmg taken 35.**
Full per-boss table (`work/claude/pilot-before.log`, `pilot-after.log`):

| boss | wins before -> after | median win s before -> after | median dmg taken before -> after |
|---|---|---|---|
| arena:wood | 7/7 -> 7/7 | 60.5 -> 41 | 72 -> 44 |
| arena:marsh | 7/7 -> 7/7 | 25.8 -> 17.6 | 49 -> 21 |
| arena:stockade | 7/7 -> 7/7 | 34.6 -> 22.4 | 108 -> 34 |
| arena:spore | 6/7 -> 6/7 | 124.6 -> 113.3 | 101 -> 79 |
| arena:kings | 7/7 -> 7/7 | 22.1 -> 17.8 | 0 -> 19 |
| arena:scree | 7/7 -> 7/7 | 42.5 -> 20.4 | 106 -> 19 |
| arena:hanging | 7/7 -> 7/7 | 31.7 -> 32.6 | 25 -> 45 |
| arena:spire | 7/7 -> 7/7 | 52.8 -> 62.5 | 52 -> 64 |
| arena:moor | 7/7 -> 7/7 | 36.5 -> 26.6 | 95 -> 53 |
| arena:storm | 7/7 -> 7/7 | 68.8 -> 47.3 | 194 -> 77 |
| arena:crown | 7/7 -> 7/7 | 104.1 -> 89.8 | 310 -> 220 |
| arena:longwater | 4/7 -> 5/7 | 110.3 -> 70 | 179 -> 68 |
| arena:reef | 7/7 -> 7/7 | 46.4 -> 39 | 63 -> 28 |
| arena:flotilla | 7/7 -> 7/7 | 56.8 -> 43.9 | 100 -> 62 |
| arena:hurricane | 7/7 -> 7/7 | 40.8 -> 33.3 | 143 -> 80 |
| arena:lamplit | 7/7 -> 7/7 | 32.3 -> 45.1 | 64 -> 84 |
| arena:underleaf | 7/7 -> 7/7 | 18.7 -> 14.4 | 35 -> 0 |
| arena:deep | 4/7 -> 4/7 | 109.3 -> 109.3 | 329 -> 329 |
| arena:keep | 7/7 -> 7/7 | 48.4 -> 43.2 | 39 -> 50 |
| arena:causeway | 3/7 -> 2/7 | 127.2 -> 137.2 | 46 -> 46 |
| arena:harbor | 7/7 -> 7/7 | 66.1 -> 60.6 | 37 -> 21 |
| arena:waymeet | 6/7 -> 6/7 | 48 -> 34.3 | 59 -> 32 |
| arena:undercrown | 7/7 -> 7/7 | 38.4 -> 16.5 | 25 -> 25 |
| arena:fields | 7/7 -> 7/7 | 46 -> 38.4 | 92 -> 86 |
| arena:burial | 7/7 -> 7/7 | 42.6 -> 40.5 | 102 -> 102 |
| arena:mage | 7/7 -> 7/7 | 61.9 -> 62.2 | 96 -> 96 |
| arena:fallingtower | 7/7 -> 7/7 | 48.4 -> 54.5 | 92 -> 56 |
| arena:burning | 7/7 -> 7/7 | 37.3 -> 33.2 | 24 -> 26 |
| arena:witchlight | 7/7 -> 7/7 | 44.4 -> 58.1 | 33 -> 53 |
| arena:oreroad | 7/7 -> 7/7 | 47 -> 57.6 | 19 -> 19 |
| arena:unburied | 7/7 -> 7/7 | 38.9 -> 36.5 | 20 -> 20 |
| arena:caravan | 7/7 -> 7/7 | 47.8 -> 47.8 | 25 -> 40 |
| mini:kings | 7/7 -> 7/7 | 7.8 -> 5.8 | 0 -> 0 |
| mini:hanging | 7/7 -> 7/7 | 13.4 -> 10.5 | 10 -> 0 |
| mini:spire | 6/7 -> 7/7 | 41.3 -> 29.5 | 83 -> 40 |
| mini:crown | 7/7 -> 7/7 | 47.5 -> 42.6 | 54 -> 47 |
| mini:lamplit | 7/7 -> 7/7 | 7.2 -> 7.1 | 0 -> 0 |
| mini:causeway | 7/7 -> 7/7 | 19.7 -> 21.3 | 32 -> 36 |
| mini:harbor | 7/7 -> 7/7 | 17.1 -> 14.1 | 0 -> 0 |
| mini:waymeet | 7/7 -> 7/7 | 25.1 -> 22 | 29 -> 29 |
| mini:fields | 7/7 -> 7/7 | 20.7 -> 17.4 | 20 -> 0 |
| mini:burial | 7/7 -> 7/7 | 18.6 -> 18.4 | 29 -> 29 |
| mini:mage | 7/7 -> 7/7 | 18.6 -> 18.8 | 24 -> 24 |
| mini:fallingtower | 7/7 -> 7/7 | 11 -> 14.9 | 19 -> 19 |
| mini:witchlight | 7/7 -> 7/7 | 22.7 -> 17 | 0 -> 0 |
| mini:unburied | 7/7 -> 7/7 | 27.4 -> 24 | 40 -> 18 |

Reading it: most fights got a little faster and a little cheaper (faster stamina regen means more blocking/dodging
is affordable, so fewer hits land), which is the intended shape of "easier to run dry but quicker to fill back up."
`arena:deep`, `arena:mage`, `arena:burial` and a few minis are exactly unchanged - those fights are scripted enough
(or already cost-insensitive) that neither fix touches them. Two fights are already, and remain, the roughest in
the campaign regardless of this lane's changes: **longwater (the Herald)**, at 4/7 before and 5/7 after, and
**causeway (the Kraken)**, at 3/7 before and 2/7 after. I did not tune either boss - Daniel's standing instruction
here is to report, not tune.

## The herald-pirate check: root-caused, still red, not patched

Of the required checks, everything is green except `herald-pirate`, confirmed real by re-running it alone (not a
load artifact - `textfit`'s failure in the batch run WAS a load artifact: green alone, 1831 screens, 0 real
findings, LONGHINT 7 which is an existing odd-note, not new).

`tools/herald-pirate.mjs` runs one fixed-seed (1919) pirate-vs-Herald fight and asserts `killed === true` within its
own 180 s cap. On this branch it times out (67% of his HP left at 180 s, and still only at 62% left with the cap
raised to 300 s in a throwaway test - not merely slower, genuinely stuck for long stretches: one trace showed his HP
frozen for 30+ real seconds while the bot cycled through `stride/sweepTell/sweep/rec/raise/wave/ebb/mired` without
landing a hit). The Herald only takes full damage in `mired` (the muck phase after the tide goes out) or `reel`
(just parried) - everywhere else a hit is cut to 0.35x (`src/main.js` ~5623) - and the generic pilot in `src/lab.js`
has no herald-specific attack logic at all (only a shared warden/pirate deflect-timing branch for his blocks); it
relies on the same distance/reach heuristics every fight uses, with no awareness of his damage window.

**What I ruled out, and what's left standing:**
- Confirmed present already at `af10a4a`, before any merge with origin/master - not a merge artifact.
- Reverting `LAB_STAND.pirate` alone back to the old value (12, from the derived 14) recovers most of the gap at
  `436827c` alone (92.8 s baseline on master -> 170.8 s at `436827c` -> 108.9 s with the revert) - BOT BUG A's
  uniform margin costs this specific fight real time - but with STAMINA's numbers also in, the same revert barely
  moves the needle (still times out). Reverting the whole `ST` table back to its old values (keeping every other
  +25% cost) fixes it outright (103.3 s, a clean win) - so the base `ST.dodge`/`ST.blockHit`/`ST.plunge`/`ST.hold`
  increases are the larger of the two contributors when both are present, not `LAB_STAND`.
  - **But**: an *unseeded* run of the general pilot shows the Herald was already a coin-flip fight on master, before
    any of this lane's changes - in the `before` row above, pirate, warden AND geomancer all timeout (56%, 7%, 6% HP
    left respectively) against him in that one random run, same as several heroes still do after. **The fixed-seed
    check was sitting close to its own edge already; this lane's changes tipped that one specific seed over it.**
    This is a real, measurable side effect of an approved fix, not a bug invented from nothing.
- I did not attempt a source fix. Teaching the pilot to recognise and press the `mired` window is the honest fix,
  but it is a real feature addition to `src/lab.js` (a boss-specific attack-priority branch, the same shape as the
  existing warden/pirate deflect branch just above it), not a one-line change, and I was not confident I could add
  it and prove it safe for the other checks that also fight the Herald (`pyre-pilot` currently passes) inside this
  lane's remaining budget.

## Checks, after the merge with origin/master (eeaad91)

Ran as one named subset (`npm run check -- ...`), the full list in the task plus `lab-reach`:
**32 of 34 named checks green.** `herald-pirate` - real, see above. `textfit` - failed in the batch run (load: the
suite ran alongside other checks and possibly another lane's Chrome), confirmed green re-run alone. Full log:
`work/claude/pilot-after.log` and the checks output is not separately saved to a file in this repo, only reported
here (34 named: boss-openings, boss-fight-end, arena-supplies, hero-trials, starter-kits, knight-rework, geomancer,
combat-feel, attack-buffer, skill-balance-probe, pilot-actions, lab-clock, combat-replay, combat-results-test,
queen-pillars, queen-chandelier, reefmaw-land, lance-support, moor-gusts, gargoyle-smash, deathknight-unlock,
one-dodge, reaper-input, heat, paladin-enrage, pyre-pilot, herald-pirate, textfit, comments, syntax, homepaths,
dangling-paths, lab-reach).

## The merge with origin/master (eeaad91)

`tools/check.mjs`'s named-check list was the only conflict (both sides had appended new names at the end): kept
master's full list (through `desert-ledge-art`, `gargoyle-smash`, `deathknight-unlock`) and appended `lab-reach`
after it, per the lesson to never insert a new check name anywhere but the end. `src/lab.js` and `src/main.js`
auto-merged cleanly; verified after the merge that BOT BUG A's derived `LAB_STAND`, BOT BUG B's per-boss `P.ground`
fix, and every STAMINA number were all still intact.

## UNVERIFIED

- **`herald-pirate` is red** (see above) - a real, root-caused, unresolved finding, not a shortcut taken.
- Nobody has played the new stamina numbers by hand. The measurement above is bot-only; whether "easier to run dry,
  quicker to fill back up" *feels* right (rather than just measuring faster/cheaper on average) is a person question.
- `arena:causeway` (the Kraken) got measurably worse (3/7 -> 2/7) alongside this lane's changes. I have not
  root-caused it - it may be the same `ST` sensitivity as the Herald, or unrelated. Flagging, not fixing (out of
  this lane's scope, and Daniel's "report, don't tune bosses").
- The stuck-recovery block added in `436827c` (position+boss.hp checked every 30 frames, forces a jump/dodge after
  1.5 s of no progress) is a general floor under every boss fight, not tested against every boss - only found via
  the Herald's bouncer-tile freeze.

## QUESTIONS FOR DANIEL

1. **`herald-pirate` (and possibly `arena:causeway`/the Kraken): tune the pilot, raise the check's cap, or leave it
   red and let a future lane teach the bot the Herald's `mired` window?** Recommendation: a small follow-up lane
   scoped exactly to "teach `src/lab.js` the Herald's damage window" (mirroring the existing warden/pirate deflect
   branch) - it is a real bot gap (0.35x damage everywhere but `mired`/`reel`, and the generic pilot has zero
   awareness of it), not a balance question, and fixing it should help every hero's Herald fight, not only the
   pirate's.
2. **Does the new stamina economy feel right?** The bot measurement says fights are a little faster and a little
   cheaper on average - the opposite of "harder," even though every cost went up ~25%, because ST.regen/delay make
   recovery so much quicker that more blocking and dodging is affordable. If the goal was a harder-feeling game
   rather than a snappier one, this may need a person's playtest, not another bot number.
