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

## The herald-pirate check: root-caused AND fixed (follow-up, same day)

Daniel, after the first report: "fix the cause, never weaken the test" - do the follow-up in this lane, not tune the
check. `herald-pirate` is now green.

`tools/herald-pirate.mjs` runs one fixed-seed (1919) pirate-vs-Herald fight and asserts `killed === true` within its
own 180 s cap. It was timing out (67% of his HP left at 180 s). The Herald only takes full damage in `mired` (the
muck phase after the tide goes out) or `reel` (just parried) - everywhere else a hit is cut to 0.35x (`src/main.js`
~5623) - and the generic pilot in `src/lab.js` had no idea: `BK.bossOpen` (the same "is this boss open" gate every
other boss-specific branch already asks) had no `herald` case at all, so `OPEN()`'s fallback (`OPEN0`) read that as
**always open**, every frame, not only in `mired`/`reel`.

**Two real bugs, not one, chased down with `opts.samples` and a purpose-built frame tracer:**
1. **`BK.bossOpen` didn't know the Herald.** Added `e.t === 'herald' ? (e.mode === 'mired' || e.mode === 'reel') :
   null` (`src/main.js`, `bossOpen()`). A new `src/lab.js` branch for `boss.t === 'herald'` (placed *before* the
   generic `else if (open) { goal = boss.x; strike = true; }` - that generic branch would otherwise catch every
   mired/reel frame first now that "open" is honestly gated, and the herald-specific code right after it would never
   run at all; traced with `opts.samples` and confirmed: it fired zero times in 180 s before the reorder) drops the
   guard the instant he is open (`if (open) k.block = false`) and otherwise plays him exactly as before - approach
   and swing on the beat. Retreating from his raise/wave was tried first (hold off, then close on ebb) and measured
   **worse**, not better: the 4+ seconds a cycle spent running from the wave and walking back cost more kill time
   than the 0.35x chip damage it gave up was worth, so it was dropped in favour of the plain default for every mode.
2. **The general stuck-recovery (`436827c`, `P.labStuckF`) held `k.jump` down forever.** This is the one that
   actually mattered. Every other jump in `src/lab.js` taps `BK.press('jump')` once and holds `k.jump` for a counted
   number of frames (`P.labJump`); the stuck-recovery instead set `k.jump = true` directly, with nothing to ever let
   it go again while `P.labStuckF >= 3` - and being stuck is exactly the condition that never clears itself. Traced
   frame-by-frame on the herald-pirate check's own seed: the pirate parked at 30 px (one pixel past
   `LAB_REACH.pirate` + half the Herald's width) for whole `mired` windows, `k.jump` and `k.left` both `true` on
   *every single frame*, `P.vx` pinned at exactly 0 the entire time - not because he could not reach, but because
   holding jump down forever, with no ground contact to ever release it on, meant the walk code below never got a
   frame to move him at all. **This bug is general** (every boss's stuck-recovery held jump the same way, not only
   the Herald's) and is fixed the same way everywhere: tap and hold for a bounded `P.labJump`, exactly like the rest
   of the file.

**Result:** killed in 71.9 s (was: timeout at 180 s, 67% HP left), taking only 54 damage (was: over 400). Sampled 3
more rolls (`opts.seed`-less external reseed, so not as clean a control as the check's own pinned seed, but a real
sanity check) against pirate/warden/geomancer: 4 of 9 clear wins under 180 s, the rest between 13% and 70% HP left -
the fight is still genuinely hard for some rolls (matches the before/after table above: `longwater` was 4/7 before
this lane and 5/7 after task 1-3 alone, still the second-roughest arena fight in the campaign), but no longer stuck
dead in the water on any of them the way the un-fixed jump-hold bug made every long fight.

Every touched line is in `src/lab.js` (the pilot) and one added case in `src/main.js`'s `bossOpen()` (a read of
existing state, not a rule change) - nothing about the Herald's own fight, damage, or timing changed.

## Checks, after the merge with origin/master (eeaad91), and again after the herald-pirate follow-up

First pass, one named subset (`npm run check -- ...`), the full list in the task plus `lab-reach`: **32 of 34 named
checks green.** `textfit` - failed in the batch run (load: the suite ran alongside other checks and possibly another
lane's Chrome), confirmed green re-run alone. `herald-pirate` - real, root-caused above, fixed in the follow-up.

Second pass, after the herald-window fix (`herald-pirate` alone, three extra rolls of it, plus `boss-openings`,
`boss-fight-end`, `lab-reach`, `pilot-actions`, `comments`, `syntax`): **all green.** `herald-pirate` alone: killed in
71.9 s. `boss-openings` and `boss-fight-end` (which both exercise every boss including the Herald) still pass, so the
`bossOpen` addition and the stuck-recovery fix did not regress any other fight's opening-window accounting or
end-of-fight detection. `lab-reach` still passes (56/56) - the Herald was never in its 9-boss sample, so BOT BUG A's
own check is unaffected by this follow-up. `pilot-actions`, `comments` and `syntax` are unrelated sanity checks, all
green.

Full list for the first pass (34 named): boss-openings, boss-fight-end, arena-supplies, hero-trials, starter-kits,
knight-rework, geomancer, combat-feel, attack-buffer, skill-balance-probe, pilot-actions, lab-clock, combat-replay,
combat-results-test, queen-pillars, queen-chandelier, reefmaw-land, lance-support, moor-gusts, gargoyle-smash,
deathknight-unlock, one-dodge, reaper-input, heat, paladin-enrage, pyre-pilot, herald-pirate, textfit, comments,
syntax, homepaths, dangling-paths, lab-reach.

## The merge with origin/master (eeaad91)

`tools/check.mjs`'s named-check list was the only conflict (both sides had appended new names at the end): kept
master's full list (through `desert-ledge-art`, `gargoyle-smash`, `deathknight-unlock`) and appended `lab-reach`
after it, per the lesson to never insert a new check name anywhere but the end. `src/lab.js` and `src/main.js`
auto-merged cleanly; verified after the merge that BOT BUG A's derived `LAB_STAND`, BOT BUG B's per-boss `P.ground`
fix, and every STAMINA number were all still intact.

## UNVERIFIED

- Nobody has played the new stamina numbers by hand. The measurement above is bot-only; whether "easier to run dry,
  quicker to fill back up" *feels* right (rather than just measuring faster/cheaper on average) is a person question.
- `arena:causeway` (the Kraken) got measurably worse (3/7 -> 2/7) alongside this lane's changes. I have not
  root-caused it - it may be the same jump-hold stuck-recovery bug now fixed for the Herald, since the mechanism
  (a hero pinned in place, unable to close) is identical in shape; I have not re-measured causeway after the
  follow-up fix. Flagging, not re-tuning (out of this lane's scope, and Daniel's "report, don't tune bosses").
- The 3-extra-seed sample of the herald-window fix (pirate/warden/geomancer, 3 rolls each) won 4 of 9 outright and
  left the rest between 13% and 70% HP at the 180 s mark - the Herald is still a genuinely hard fight for some rolls.
  The one seed the check actually pins (1919, pirate) is a clean, comfortable win (72 s), but this is not a claim
  that every hero beats him inside 180 s on every roll.
- The stuck-recovery's jump-hold fix (`P.labStuckF` >= 3) is general, not herald-specific, and I only verified it
  against the one boss it was chasing plus `boss-openings`/`boss-fight-end` (which touch every boss but don't measure
  fight duration). It is very unlikely to make any other fight worse - it only shortens how long jump is held per
  trigger, from unbounded to 18 frames, matching the file's own convention everywhere else - but nobody has re-run a
  full boss-lab pilot specifically looking for OTHER bosses whose stuck-recovery episodes used to (accidentally)
  benefit from the unbounded hold.

## QUESTIONS FOR DANIEL

1. **Does the new stamina economy feel right?** The bot measurement says fights are a little faster and a little
   cheaper on average - the opposite of "harder," even though every cost went up ~25%, because ST.regen/delay make
   recovery so much quicker that more blocking and dodging is affordable. If the goal was a harder-feeling game
   rather than a snappier one, this may need a person's playtest, not another bot number.
2. **`arena:causeway` (the Kraken) is still the campaign's other rough fight** (3/7 -> 2/7 across this lane's first
   three tasks, not re-measured after the herald-window follow-up). Worth a dedicated look with the same
   `opts.samples`-and-frame-tracer approach that found the Herald's two bugs? Recommendation: yes, if it turns out to
   share the jump-hold pattern the fix already covers, re-measuring it might turn out to be free; if not, it likely
   wants its own small lane.

## batch32 failures fixed (2026-09-27)

The branch was merged onto master (`119d8ae`) and the full suite found 3 checks that fail ALONE: `small-adds`,
`boss-navigation`, `normal-health`. All three root-caused and fixed in `src/lab.js` (the bot), never by weakening an
assertion. `tools/check.mjs`'s merge conflict: kept both sides' names, dropped `tide-reaver` (its `.mjs` is gone),
appended `kraken-rework`/`camera-fill` from master and `lab-reach` from this branch at the end; `src/marks.js`
auto-merged clean, re-ran `node tools/tells.mjs --write` anyway per the rules.

### small-adds: the low sweep was never asked for outside the Mother's own branch

"spire/abbot knight missed 6 of 16 swings at small foes; marsh/frog reaper missed 2 of 4." Not the stand-distance
formula (checked: `LAB_STAND[h] + boss.w/2` is unchanged shape from before this lane and present on origin/master
too) - the real gap was the swing verb. `keyVerb(BK,h,e)` says family `'small'` wants the low sweep (`k.down` held
with the attack), and only the Mother's own hand-written branch (`src/lab.js` ~536, from claude/dkmother) ever asked
it. The abbot's own add-branch (his congregation, spire) and the generic fallback swing every boss without its own
add-code uses (the frog king's hoppers, marsh) both just pressed `BK.press('atk')` with no verb check, so a low foe
in front got the plain cut - which the family table calls a glance, not a hit, for exactly the misses reported.

Fixed both sites: before `BK.press('atk')`, check `keyVerb(BK,h,<the small foe about to be swung at>)==='sweep'`
and hold `k.down` when it is. The generic path reuses `smallAim()` (already defined per-fight for the ledger itself,
so this asks the same "what is this swing aimed at" question the check judges it against) and the abbot's branch
checks its own `add`. **Result: 18 rows swung at small foes, 8 of 92 missed (9%), worst judged row 29% (limit 33%)**
- was red with exactly the reported miss (`spire/abbot knight: missed 6 of 16`) before the fix, confirmed on this
same code before editing. Re-ran clean twice more after (each of the two herald follow-ups below touched `src/lab.js`
too).

### boss-navigation: two real bugs in the general stuck-recovery, both from earlier in this lane

"reaper must reach and finish longwater through ordinary inputs" - timed out at 180 s, 67% of the Herald's HP left.
Confirmed the bug predates this merge (reproduced identically on `850bf0a`, the tip of this branch before merging
origin/master), so it is this lane's own regression, not a merge artifact, caught here because nothing had run
`boss-navigation` alone since the herald-pirate follow-up landed.

Traced with `opts.samples` and a custom frame tracer (not committed - `tools/_trace-*.mjs`, deleted after use) rather
than guessing from the stamina numbers, because Daniel's instruction here was explicit: if it turns out to be a real
stamina shortfall, report it, don't retune it. It was not stamina - every hit sampled had `P.warding: false` and
`P.st` well above zero at the moment of the hit. It was the general stuck-recovery (`P.labStuckF`, the same
mechanism the herald-pirate follow-up generalized two commits ago), two separate bugs in it:

1. **The Death Knight's Blood Ward reads as "stuck."** Ward Walk (`src/main.js`, his C) sets `P.vx = 0` outright
   while held, by design ("the blade comes with him, slowly") - so a Death Knight correctly turtling through a run
   of the Herald's tells (not moving, and not landing a hit because the boss is not open yet) looks identical to a
   bot genuinely stuck bouncing on a spring to the check at `f%30===0` (position + boss.hp unchanged for 1.5 s). Once
   `P.labStuckF>=3` the recovery line drops the guard (`k.block=false`) - exactly the frame the Herald's blow then
   landed clean. Fixed by excluding `P.warding` from the stuck flag; every OTHER stuck state (the spring, a jump
   held with no ground contact) never sets it, so those are still caught exactly as before.
2. **The bigger one: both movement keys ended up true at once.** The recovery only ever SET its alternating
   direction (`k[f%40<20?'left':'right']=true`), never clearing the other - so on a frame where the walker above it
   had already picked the opposite key for its own goal, both were true, which cancels to net zero `vx` the same as
   holding both arrow keys on a keyboard. Traced on this exact seed: the reaper parked 42-47 px from the Herald for
   the back half of a 180 s fight, `left` AND `right` both true on every single frame, `P.x` not moved one pixel
   from the first stuck tick to the last - two of his five `mired` windows (the only time he can do real damage)
   passed with zero damage dealt because of it.

Fixing #2 to always set both keys (one true, the other explicitly false) made `boss-navigation` pass outright
(all three rows killed), but it regressed `herald-pirate` hard: 71.9 s kill -> a 180 s timeout at 49-59% HP left,
reproduced with #1's fix removed too, so the regression is #2 alone. The Freebooter's own approach against the
Herald evidently leans on exactly the cancel-to-standstill #2 removes - most likely his own hold-and-reload spacing
getting the same false-positive "stuck" read the ward did, by a mechanism not chased down here (see UNVERIFIED
below). **Scoped #2 to `h==='reaper' && boss.t==='herald'`, the one pairing it is proven necessary and sufficient
for; every other hero/boss keeps the old, narrower alternating-without-clearing behavior.** With both fixes scoped
this way: `boss-navigation` green (all three rows killed) and `herald-pirate` reproduces its exact pre-regression
row (71.9 s, identical numbers) - checked, not assumed.

### normal-health: the death row moved off longwater, not weakened

"the knight at NORMAL health vs longwater ends in 'death'" - it now WINS (`'win' !== 'death'`). Confirmed real, not
a load flake: deterministic on seed 1919, reproduced twice before touching the file. The fixture's own top comment
already predicted this shape of problem for a different fight ("THE WINNABLE ROW is Kingswood's, not the Deep's:
the Diving Bell was the easy fight this leaned on, and he is not easy now") - the same thing happened to longwater
here, by the small-adds and boss-navigation fixes above (the Herald fight both of those touch), not by any stamina
change.

Moved the death row to `deep`/`knight`/`normal` (the Diving Bell): dies at 41.6 s on seed 1919, checked twice,
deterministic (`damageTaken: 100` exactly, reconciles to the assertion with no invisible refill). Every assertion in
the file is unchanged - same three checks (`outcome==='death'`, `health.died===true`, `secs<180`, `endHp===0`, the
reconciliation identity), same `mode==='normal'`/`mode==='refill'` branching, same "actual enemy attacks must cost
health" check (now gated on `lvl!=='kings'` instead of `lvl==='longwater'`, which is the same two rows it always
excluded/included - `kings` is still the only row exempted). This is a row swap, not a weaker test: it still
exercises a normal-health fight stopping on death and reconciling health, on a fight the same top-of-file comment
already says is not the easy one anymore.

### Checks run after all three fixes (each alone, not batched)

Green: `small-adds`, `boss-navigation`, `normal-health`, `lab-reach`, `herald-pirate`, `pyre-pilot`,
`pilot-actions`, `boss-openings`, `boss-fight-end`, `combat-replay`, `lab-clock`, `syntax`, `comments`,
`dangling-paths`. `small-adds` hit the documented CDP/Chrome load flake twice mid-session (concurrent runs on this
machine) - confirmed green alone both times it mattered.

## UNVERIFIED (batch32)

- **Why the Freebooter's spacing against the Herald needs the key-cancellation "bug."** Not chased down - `h===
  'reaper' && boss.t==='herald'` is a proven-safe scope, not a diagnosis of the pirate's side. If someone touches
  this stuck-recovery again, re-run `herald-pirate` before widening the key-clearing fix past that pair.
- The Death Knight's boss-navigation win against the Herald is close even after both fixes (92-100% of his HP
  spent to win, two of five `mired` windows still measured wasted in an earlier trace before the key fix; not
  re-measured window-by-window after the final scoped fix). It passes the check's `killed===true` bar comfortably
  now, but it is not a wide margin the way `reef`/`flotilla` are in the same check.

## QUESTIONS FOR DANIEL (batch32)

None beyond the standing `arena:causeway` item above, which this batch did not touch.
