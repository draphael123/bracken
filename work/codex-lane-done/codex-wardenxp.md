# codex/wardenxp — Road Warden elite XP

Base: `origin/master` at `7ade0605` (2026-10-16). For coordinator merge only; not merged or deployed.

## Cause and fix

The four Warden bodies had `XP_THREAT: 0` although `THREAT` already weighed each at 4. Restoring their normal elite pay (4 threat × 4 XP × elite multiplier 5 = 80 XP) reproduced the `order-knights` stall: on Ore Road, the killing blow crossed a level threshold, `levelHealTick()` opened the level card synchronously inside `xpKill()`, and the paused simulation never reached `eliteWatch()` to lift the dead Warden's gate.

The level-up heal/card now waits while a Warden is fighting nearby or a dead Warden is pending `eliteWatch()`. The gate and purse settle first, then the owed heal and card can open. No test assertion or difficulty number changed.

## Evidence

Before: Wood's Briar Maul paid 0 XP versus the replaced shield elite's 40. Act-II Scree Maul paid 0 XP versus the replaced troll elite's 80. With XP restored but before the level-up ordering fix, `node tools/order-knights.mjs levels` failed at Ore Road: `dead:true, lifted:false`.

After: each Warden body pays 80 XP as an elite. Wood's Briar Maul now pays 80 and Scree Maul now pays 80. `node tools/order-knights.mjs levels` passed all 43 checks; Ore Road changed to `dead:true, lifted:true`, and no page errors appeared.

## Checks

`node tools/check.mjs order-knights,elites,levelling,levelling-runtime,progression,progression-runtime,leveling,normal-health,mash-gate,textfit,mobile-perf` completed: 11 checks passed, one failed. The passing checks included `order-knights` (300 assertions), `elites` (84), progression and levelling, mash-gate, textfit (zero pictures), and mobile performance at 4x CPU. `normal-health` failed its Pyro/Bullfrog win assertion (`death !== win`). A standalone rerun failed identically on this branch, on `codex/whatsnewpin` (clean `origin/master` game code), and even on historical `cd8a7c6c`, the commit that introduced the Pyro expectation. This is a pre-existing red, not caused by Warden XP or a verified later game change. A current seeded probe found Paladin win with 20 damage taken and Reaper win with 63 damage taken, but the row was left untouched: its historical claim needs separate diagnosis rather than an unproved expectation swap. The complete Task J check set is not green.

## QUESTIONS FOR DANIEL

- The Warden's fixed 4-threat elite value pays 80 XP even in an act-I slot previously occupied by a shield elite worth 40. Recommendation: keep 80, matching the Warden's already approved threat weight and the game-wide elite formula. Built: all four bodies use that formula; no per-level XP exceptions.
