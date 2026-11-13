# SEAWALK-2 - Saltreach walk + Tide Herald tune, Deep 3 walk (11-13, one headless browser at a time)

Branch `claude/seawalk2` = claude/sea6 b700125ad + 1 bug fix, tools, Herald tune. Worktree `LANES\bracken-seawalk2`. Pushed. NOT merged, NOT deployed, no flag flipped. Stills + logs: `scratch/lane-reports/seawalk2/`.

## Tools added (not in the suite)
- tools/cdp.mjs: `BRACKEN_LW3=1` and `BRACKEN_DEEP3=1` env hooks (same pattern as BRACKEN_CW3): the flag on in THIS page only. Set `LW3=1` / `DEEP3=1` too for the node half. Without them a lab/walk run measures master's Long Water / Deep.
- tools/seawalk-probe.mjs `<level> "<js>"` (eval in the page after load); tools/seawalk-verb.mjs and tools/seawalk-seq.mjs (a player's hand at a verb: tp, face, strike, wait, still, print); tools/seawalk-stills.mjs now takes SEAWALK_OUT=<dir>.

## BUG FIXED (real, game code)
`src/main.js` kill burst (hurtEnemy0, `burst(..., COLS[e.t], ...)`): a foe with no COLS row crashed its own kill ("cols.length of undefined"). The new TIDE-POOL CRAB (poolcrab) had no row, so killing one threw in the real page (level-walk warden and pyro both ERR'd on it; the knight happened not to kill one). Fix: `COLS[e.t] || (poolcrab shell colours | default)`. One line. Flag-off identical (every master foe has a row).

## 1. SALTREACH (id `longwater`, `BRACKEN_LW3=1 LW3=1`, W 706)
**Walk verdict: loads clean (0 console errors), reaches the Herald, no softlock found. The deaths-per-run target is NOT measurable with the walker.** level-walk (L23, typical build, 1 seed each): knight / warden / pyro all reach BOSS, 0 deaths, 293 / 310 / 297 s, 97% of the route walked, 5 STUCKs each, "measured 2%". Three of the STUCKs are master's own river (cols 0-365, same nodes on master); two are Saltreach's:
- node 462,28 (the MILL RACE): the race is flooded until the wheel at 460,27 is struck. The wheel is at the foot of a ladder (x453) the route does not use. The bot has no tide verbs, so it cannot pass; I tried a WALK_HINTS entry and backed it out (the walker's hint only fires within 2 rows of the wheel, and the route never goes down the ladder).
- node 626,23 (the PIERS exam): quay to pier head needs the wheel, the boat's mooring cut, and the bell.

**By hand in the page (tools/seawalk-verb / seq): the verbs work for a player.** Race: stand at the wheel (459,28), the foot of the bank is flooded; one blow; 6 s later the race bed is bare (stills race2-pres.png / race2-6s.png). Piers: a blow at the mooring (619,29-30, in the water) floats boat b4 from row 30 to 25.5 in 5 s (pier4-y30.png); its deck then sits 1.5 rows under the pier head (row 24): a jump. The mooring is only hit from IN the water (a swimmer at the surface, row 28.7, misses it; rows 29-31 hit): a player has to dive; the sign says CUT THE BOAT LOOSE but not that the rope is under the surface. Small tell candidate (Q3).

Deaths per run: 0 on all three heroes, but only ~2% of the route is measured, so this is not a verdict on the act target 1.5-2; Saltreach is probably too easy (the elite Tideguard at 577 was won in 6-10 s). Checkpoints: 5 on 706 columns (level-quality: one per 135 route tiles, ok). Not checked: bell and cove boat in motion, tide-pool crabs in the flats, trap drops, jellies on the flood, co-op, pilot --write, mash level mode.
Gates (node, flag on): tools/longwater3.mjs 91 ok; level-quality longwater CLEARS THE BAR. No level data changed, so no pilot / mash / curve restamp (level-quality's note "the level changed since its curve row" is the flag-on hash vs master's row, pre-existing).

## 2. THE TIDE HERALD (src/tide-herald.js; flasks ON = kit default, L23, practiced, human profile, `BRACKEN_LW3=1 LW3=1`, --secs=300)
| round | change | knight | warden | pyro | pooled | win times |
|---|---|---|---|---|---|---|
| r0 as found | hp 1300, sweep 22 / thrust 18 / spear 16 / wave 20 / bite 18 | 1/6 | 3/6 | 2/6 | 6/18 = 33% [16-56] LOW | 17-63 s |
| r1 | hp 1700, dmg ~-20% (17/15/14/17/15), sweep tell .65->.75, thrust tell .55->.62 | 1/6 | 5/6 | 3/6 | 9/18 = 50% [29-71] | 16-67 s |
| r2 | hp 1900, sweep 13 r70->62 tell .85, thrust 13, mire 3.4->4.0 (P2 3.8->4.2) | 2/6 | 6/6 | 2/6 | 10/18 = 56% [34-75] | 31-95 s |
| r3 (SHIPPED) | sweep 11, thrust 11, spear 12, wave 14, undertow bite 12 | 2/6 | 5/6 | 3/6 | 10/18 = 56% [34-75] | 32-97 s |
| r3 confirm (seeds 7-12) | none | 1/6 | 6/6 | 5/6 | 12/18 = 67% [44-84] | 35-96 s |

**FINAL (r3 config, n=36 pooled): knight 3/12 (25%), warden 11/12 (92%), pyro 8/12 (67%) = 22/36 = 61%.** In the 60-70 band pooled. Mash-bot 0/6 (every hero dead in 20-27 s, boss 99-100% left).
Caveats, honestly:
- The KNIGHT is under 1/3 (25%): he loses 9 of 12, typically with 15-50% of the Herald left, hit by the glaive sweep (the "!! JUMP it" low blow) 8-12 times a fight; the fast deaths have 0 opening hits. The warden is the opposite (11/12, some wins in 32 s), so the pooled number is carried by the warden. NOT every hero can win.
- Fights are 32-97 s, under the 90-150 s target. Lengthening (more hp) cost the knight more than the damage cuts gave back (every loss reads taken 399: the hero bar plus flasks).
- 3 tunes spent as instructed. Nothing under k 0.4 (TH.k untouched: floor/ward 0.4, body .5, mud .45, mired 1.5; longwater3 proof 91 ok incl. the resist floor). Openings, ward and verbs (bell, sluice) unchanged.

## 3. DEEP 3 (id `deep`, `BRACKEN_DEEP3=1 DEEP3=1`, W 162 H 298; walk only)
Walker (L28, 1 seed each): knight 1 death (an ANGLER bite at 62,88, master's wreck stack), STUCK at 50,31, run ended at the first section; warden and pyro 0 deaths, STUCK at 58,42, ended at 9% of the route. Master's Deep sticks at the SAME node 58,42 (pyro, flag off) but RESUMES at a later shrine and reaches the boss; with the flag on the run ends there because Deep 3 has fewer checkpoints (Daniel 11-06) and the first one is far on. So the bot cannot reach the new Drowned Tower: that is the walker, not a Deep 3 break.
By stills (pacing route, hero on 28 waypoints, flag on, 0 console errors): wreck shelf, wreck stack, kelp forest, coral garden, the Tower floors (rows 160-220) and the arena row 287 all load and read (d3r-19 whale-bone shelf at the top of the Tower, d3r-24 a slab, d3r-27 the sunken hull at the arena). Not walked by bot or by hand: currents, rot vents, settling stone, bell ride, wall eel. No boss table (as asked).

## Checks run (node, one at a time, no browser of mine open)
main.js and tide-herald `node --check`; longwater3 91; level-quality longwater (LW3=1) clear; kraken3 217; tide-kit 2022; pirate-fleet 136; architecture ok; comments ok; mash-bot longwater boss 0/6. NOT run: check.mjs (never), deep3 / whale / siren-rocks proofs (no Deep 3 data changed), pilot / curve / mash --write (no level data changed).

## Not checked / owed
Saltreach: a human look at the wheel ladder and the mooring dive, co-op, bot tide verbs. Herald: a real-player read of the sweep, Mage's Folly reviewer, co-op. Deep 3: a walker that can resume past 58,42, the Tower by hand.

## Questions (recs first)
1. Herald knight 3/12. REC: keep these numbers and give the knight a lane (the low sweep is his killer: a longer sweep tell for a shield hero, or a knight answer to the low blow like his shield on the thrust); do not tune the boss further on the warden's back. Alt: one more tune (sweep dmg 9, hp 1700), which makes the warden trivial (she already wins in 32 s).
2. Fight length 32-97 s vs 90-150 s. REC: accept for now (warden / pyro speed is a hero-DPS issue, the same lab-bot story as the Freebooter row); lengthening costs the knight.
3. Mooring: make the cut reachable from the surface, or a rope tell above water. REC yes, small, flag-gated.
4. Walker: teach tools/level-walk the tide verbs (WALK_HINTS rows keyed on L.lw3Sluices / lw3Bells / moors, plus a route down the wheel's ladder). REC yes, a bot lane; until then Saltreach's act-target deaths cannot be measured.
5. Deep 3: the walker ends at the first STUCK because the next shrine is far. REC a resume-at option in level-walk, or one early shrine near row 60.

## HERALD-2 (11-13, knight floor + fight length; flasks on, L23, practiced, human profile, `BRACKEN_LW3=1 LW3=1`, --secs=300; logs `scratch/lane-reports/seawalk2/h2/`)
**Cause (knight 3/12): the lab bot, not the fight.** HITLOG on two knight losses (h2/hl0): every sweep hit landed with the knight at 15-26 px of the Herald (inside the 62 px sweep box), mostly mid-swing (atk > 0) and not blocking; 7-8 sweeps and 5-6 thrusts a fight, 25-33 a hit, ~14 hits to die. The sweep is the told low blow "!! JUMP IT" (tide-herald thPlan says jump), but src/lab.js had no Saltreach hands: the generic herald branch (`goal = boss.x; strike = true`) swings through the tell, and the HARD-tell dodge only runs while not mid-swing. Second find: in most sweeps the hero was `P.ground` false (swimming in the flooded flats, or in a rise hop), so a ground-only jump could not fire. Warden and pyro have the same hands but their kits shrug a 1-2 s of lost tempo; the knight's melee stand-in-reach is exactly where the sweep lands.
**Changes (3, all flag-gated: boss.lw3 / tide-herald only; flag-off identical)**
1. LAB BOT (src/lab.js, herald branch, `boss.lw3` only): jump the told sweep once in the tell's last 0.3 s (ground OR swimming), held 16 frames, no swing started. Same thing a player is asked to do. Sweep hits per knight fight 7-8 -> 3.
2. r1 (src/tide-herald.js): hp 1900 -> 2600 (wins were 32-97 s), thrust tell .62 -> .70 (the guard window), dmg thrust 11 -> 9, spear 12 -> 10, wave 14 -> 12, bite 12 -> 10.
3. r2: dmg sweep 11 -> 10, thrust 8, spear 9, wave 11, bite 9 (hp 2600 kept). Nothing under k 0.4; openings, ward, verbs, TH.k untouched.
| round | change | knight | warden | pyro | pooled | win times |
|---|---|---|---|---|---|---|
| start | (seawalk2 final, n=36) | 3/12 | 11/12 | 8/12 | 22/36 = 61% | 32-97 s |
| m1 | bot jumps the sweep | 3/6 | 6/6 | 5/6 | 14/18 = 78% | knight 64-88, warden 43-83, pyro 38-75 |
| m2 | hp 2600, thrust tell .70, dmg -20% | 2/6 | 6/6 | 2/6 | 10/18 = 56% | knight 108-129, warden 57-80, pyro 66-101 |
| m3 (SHIPPED) | dmg -10% more | 3/6 | 6/6 | 3/6 | 12/18 = 67% | knight 119-144, warden 57-71, pyro 66-101 |
| m3 confirm (seeds 7-12) | none | 4/6 | 6/6 | 4/6 | 14/18 = 78% | knight 102-115, warden 51-75, pyro 53-102 |
**FINAL (m3 config, n=36 pooled): knight 7/12 (58%), warden 12/12 (100%), pyro 7/12 (58%) = 26/36 = 72%.** 95% interval about 56-85: straddles the 60-70 band, point 2 pts over. Every hero >= 4/12 (floor met). Knight wins now 102-144 s (target met); pyro 53-102 s; warden 51-75 s (still short: her kit, not the boss). Mash bot 0/6 (every hero dead 29-40 s or timeout, boss 93-100% left).
Verdict: **READY on the knight floor and fight length for knight / pyro; pooled 72% is a hair over the band** (warden 12/12 carries it; one more nudge, hp 2600 -> 2900 or dmg +5%, would centre it, but the 3-change cap is spent). Only the bot is "fixed"; no hero got easier by a boss number the knight did not need.
Checks: node --check lab.js / tide-herald.js; longwater3 91 ok; level-quality longwater clear; tide-kit 2023 ok; architecture ok; comments ok; mash-bot longwater 0/6. No level data changed: no restamp (mash-bot reports the level hash changed vs its row: pre-existing flag-on hash).
Not checked: a human look at the jump read (the tell's last 0.3 s while wading), sweep when the hero is mid-air on a rise, co-op, Mage's Folly reviewer, pilot / curve / mash --write, check.mjs (never).
Questions (recs first): (1) Accept 72% pooled? REC yes (in the interval); alt: one more tune, hp 2900. (2) Warden wins 51-75 s: REC accept (hero DPS, same as the Freebooter row). (3) Does the lab's jump-the-sweep hand belong in the shared lab for every Saltreach-style low sweep? REC yes later, as a general low-blow verb (a bot lane).
