VERDICT: NEEDS DANIEL (small numbers change on claude/bc5post, measured 61% n=18; live master 76a8cca26 is at 47% n=36 pooled by this lane's re-measure)
# BC5POST (sonnet) - claude/bc5post off master 76a8cca26. NOT merged, NOT deployed.
Caveats first: the live Glassblower (hp 1700, openT 4.2, plus the rel176 OPEN_RULE) read 17/36 = 47% [32-63] here, UNDER the 60-70 band, not the 67% shipped. The tune on the branch (hp 1500, openT 4.5) read 11/18 = 61% [39-80] (n=18 only, point in band, interval still spans both edges). Warden is 3/6 here (old weak lab bot, not chased). No human playtest.

## 1. Restamps - DONE
level1-pilot (3 runs: 20 hits, 4 deaths, 6 kills, 306% hp lost), mash-bot level row (all heroes die or drop), level1-curve (6 runs, mean 336%) written with --write. level-quality: Buried City clears, no stale-hash line (other levels' "curve changed" info lines are pre-existing). Commit e5f3c7a54.

## 2. What fix (b) changed in the fight (one sentence)
OPEN_RULE.glassblower (src/boss-greed.js) makes boss-greed read him as OPEN while buried, so the opening now also feeds the global mini machinery (the 1/3-of-his-health purse per opening via miniCap, then he "gathers himself" and loses the x1.75, plus the open-aware stale-pay, poise and riposte reads) - it was NOT a pure assert fix, and his own damage numbers were untouched.

## 3. Glassblower win rate (boss-rates buriedcity:mini, practiced, flasks kit, L51, jobs=1, fresh seeds 601.., 701.., 801..)
Live numbers (hp 1700, openT 4.2, OPEN_RULE on):
| set | knight | warden | pyro | pooled |
| A (s601-606) | 3/6 | 2/6 | 3/6 | 8/18 44% [25-66] |
| B (s701-706) | 3/6 | 4/6 | 2/6 | 9/18 50% [29-71] |
| A+B n=36 | 6/12 | 6/12 | 5/12 | 17/36 47% [32-63] - outside 60-70 |
(bc5proof before the OPEN_RULE: 36/54 = 67%.) Floor 4/12: all heroes pass (5-6/12).
ONE tune (revert of the bc5proof tune): GB.hp 1700 -> 1500, GB.openT 4.2 -> 4.5. Nothing else (rest 0.5, floor 0.4, openMul 1.75, tells, damage, capFrac untouched). Asserts updated: tools/buried-city5.mjs (openT 4.5), tools/bc5-art-lint.mjs (hp 1500 / openT 4.5). Commit 71dc8a114.
After the tune, fresh seeds 801-806 per hero, n=18:
| hero | wins | avg win secs | avg damage taken |
| knight | 4/6 | 56 | 492 |
| warden | 3/6 | 55 | 554 |
| pyro | 4/6 | 43 | 497 |
| OVERALL | 11/18 = 61% [39-80] | | |
Not conclusive: n=18 interval spans both edges (tool: ~48 more fights to clear). Pooled with nothing else (different config).

## 4. In page (headless, tools/bc5-post.mjs, logs bc5post-page2.log; level-1 save, god for the kill)
- Shrines: 167,330,387,409,579,694,843. The after-hall shrine is at col 409 (the build placed 408; shrine lit shows at x+1), NOT 406: the mini's walls end at 407 (px 6512), so it is outside the hall. Kiln shrine 387 is before the arena.
- Kill, touch shrine 409, die: back at col 409 (cp 409, lit, x > mini x1, hp refilled), then 43 cols east walked on (crude walker stalls at 452 for no reason tied to the hall: not a door, doors are at 178 and 841 only). The real keys route (tools/buried-city-route.mjs knight god, BC5 default) walks the whole level incl. "THE GLASSBLOWER ... out by the lifted gate to the shrine" (406,32 tile, 58 s), 0 deaths, 0 lifts, 1 retry at the unrelated Sand-Fall leg.
- Death DURING the fight (mini active at col 398): respawn at kiln shrine col 387, before the arena, state play. PASS.
- Observation (not a bug I changed): the kill is not banked by a death. Die after the kill WITHOUT touching 409: back at 387 and the Glassblower is alive again, mini re-arms when you walk in. Touching the shrine at 409 first, then dying: foe alive in the page too after respawn but you wake outside the hall and are not forced back in. Standard checkpoint semantics.

## 5. Node proofs (all after the tune, exit 0)
buried-city5 157 green, checkpoints (290, none inside a mini's walls), boss-greed (58 bosses/17 minis), bc5-art-lint 446 ok, level-quality clears. NOTE: boss-greed starts its own headless page; the first run overlapped a boss-rates run (6.7 GB free, no harm, still a breach of one-at-a-time).

## What was not checked
Hand playtest; other heroes than knight/warden/pyro; the fixed warden bot; a second n=18 after the tune; the full QUICK gate (never run check.mjs); mobile. Rate measured with the same bot/profile as bc5proof, not by a human.

## Questions for Daniel (rec first)
1. Ship the branch tune (hp 1500, openT 4.5, 61% n=18)? REC yes after one more n=18 on it (a lane can run it) or accept now; a hot release is a small flag-free number change.
2. Or drop OPEN_RULE.glassblower from boss-greed.js (rec no: boss-greed check needs it; alternative is to add 'glassblower' to MINI_OWN_CAP so the 1/3 purse does not apply, which may restore the old 67% with hp 1700).
3. Keep the kill un-banked on death (rec yes, same as the other minis).
