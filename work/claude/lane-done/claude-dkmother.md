# Lane DK MOTHER: the Death Knight and the Mother Cap

Branch `claude/dkmother`. The fix is commit `ae49cdf`, which also adds the instrument `work/claude/dkmother-diag.mjs`.

## Verdict: (a) the pilot misplayed him, with a smaller (b) left over

### How the fight's time is spent
The fight is not a damage race. The heart takes 8 cuts of 1 damage each. After every cut the knot rests for 10 s, so about 72-78 s of every fight is waiting that no hero can shorten. What varies between heroes is:
- how long the knot takes to open once its rest ends;
- how long the hero takes to cut the heart once it is open;
- how many open windows the hero misses (8 s each, or 5.5 s once the heart is under a quarter).

### Before the fix
Refill mode, dice pinned exactly as mother-pilot pins them. Times are game seconds.

| hero | total | knot ready → open | windows missed (s) | chasing sporelings | hit windows |
|---|---|---|---|---|---|
| knight | 117.0 | 6.1 | 1 (5.5) | 5.7 | 30.0 |
| pyro | 117.7 | 5.6 | 1 (5.5) | 12.3 | 31.0 |
| paladin | 112.2 | 7.9 | 0 | 5.9 | 32.1 |
| pirate | 107.8 | 6.1 | 0 | 8.9 | 29.4 |
| **reaper** | **154.0** | **30.5** | **2 (11.1)** | **25.1** | 34.0 |
| warden | 121.5 | 7.6 | 1 (5.6) | 4.4 | 32.9 |

Where the reaper's extra ~39 s went:
- About 24 s went on getting the knot open.
- About 9 s went on one extra missed window and the knot moving afterwards.
- About 3 s were lost in the heart windows themselves.

Nearly all of the knot delay came from **phase-two sporelings**. The Mother pilot (`src/lab.js`, the `boss.t==='mother'` branch) had only one blow for them: the plain cut, swung from `LAB_REACH+add.w/2+2` = 35 px. The Death Knight's cut:
- lands late, at atk 0.12 with atk rising at 0.34/s, so about 0.35 s after the press;
- roots him until it finishes (0.78 s, against 0.21-0.47 s for the others);
- reaches only 22 px at first, then 31 px.

A sporeling that is still walking is gone by the time the blade arrives. Result: **8 of his 14 swings at sporelings missed**, while the other heroes missed 0-5 of 4-15. Because the pilot kept its goal pinned to the sporeling it was chasing, he followed them up to 280 px away from the knot. In one cycle it took 14 s to get back and open it.

Why this is a misplay and not a weakness of the hero: the game's own family table (`FAMILY` in `src/main.js`) lists the sporeling as `small`, and for small foes the right blow is the low sweep. `strike()` in `src/lab.js`, the shared pilot for common foes, already uses the sweep for every hero. The Death Knight's sweep reaches 34 px, hits from atk 0.02 (about 0.06 s after the press), and counts as the right blow, so it does 1.5x damage. The Mother branch was the only pilot that never used it. For heroes with a fast cut that barely mattered; for the Death Knight it was the whole gap.

### The fix (`ae49cdf`, one line in `src/lab.js`)
When the Mother pilot swings at a sporeling, it now holds down, which makes the swing a low sweep, if:
- the hero is on the ground,
- `keyVerb()` says `sweep`,
- and he has the stamina.

This applies to all six heroes, because it is the same rule `strike()` already follows. Nothing else changed: no boss or hero numbers, and no test.

After the fix the reaper's sweeps kill 8 of 9 sporelings (11 of 11 on salt 3). Time spent chasing sporelings drops from 25.1 s to 9.5 s, and knot ready → open drops from 30.5 s to 18.5 s.

### The (b) that remains
He is still about 25 s behind the others (143.9 against 105.8-124.4). The remaining causes are real properties of the hero:
- his strike roots him for 0.78 s;
- he moves at 0.8× ground speed (`RUN*0.8`, "heavy on his feet", on purpose);
- his heart cut needs a 0.35 s lead.

In **phase-three windows (5.5 s)**, when the knot sits at a far anchor (−16 or +17 tiles, about 300 px from the spring), his minimum is about 0.8 s rooted + 3.8 s walking + 1 s spring and cut, which is more than 5.5 s. He misses those windows every time. The other heroes need about 4.4 s and make them. That is why he still misses 2 windows per fight, where the others miss 0-1.

## mother-pilot, refill mode (unchanged test, window 90-150)
| | knight | pyro | paladin | pirate | reaper | warden |
|---|---|---|---|---|---|---|
| before | 117.0 | 117.7 | 112.2 | 107.8 | **154.0 FAIL** | 121.5 |
| after | 118.7 | 122.2 | 119.4 | 105.8 | **143.9** | 124.4 |

Normal mode, one life (mother-pilot only checks that health adds up): before, knight 113.7, pyro 107.8 X, paladin 112.8 X, pirate 101.6, reaper 141.1, warden 109.9 X; after, 117.1, 104.9, 107.1, 105.2, **reaper 90.1 X**, 120.1 (X = died). In a single-life run, one different early roll changes the whole fight, so these swing both ways.

### Other pinned rolls (the diagnostic with `opts.salt`, all six heroes in the pilot's order)
| salt | reaper before | reaper after | others after |
|---|---|---|---|
| 1 | 153.5 | 142.4 | 106.9-120.5 |
| 2 | 150.0 | 141.8 | 107.3-124.4 |
| 3 | **180 (timed out, 7/8)** | **180 (timed out, 7/8)** | 105.9-133.2 |

Salt 3 times out both before and after the fix. Six missed windows: every late window whose knot sat at a far anchor. That is the remaining (b).

Note: a row's result depends on the rows run before it on the same page. The reaper fought alone gives 144.4 on the old code, but 154 when he fights after the other heroes. Only the full six-hero order reproduces mother-pilot's numbers.

## The Death Knight on the usual bosses (bossLab, dice pinned, refill mode, maxSecs 120)
Identical before and after, as expected: the change is inside the Mother branch only.

| wood | kings | spire | crown | reef | flotilla | hurricane | deep | waymeet | undercrown |
|---|---|---|---|---|---|---|---|---|---|
| 45.0 | 56.2 | 74.0 | 120 X | 120 X | 81.4 | 50.3 | 110.1 | 95.3 | 64.7 |

He already failed to kill crown and reef within 120 s before this change; this lane did not touch them.

## Checks
`npm run check -- mother-pilot,boss-openings,boss-fight-end,reaper-input,starter-kits,ability-poses,attack-animation,combat-feel,skill-passives,talents,levelling,pilot-actions,tells,textfit,comments,syntax`: **17 of 17 ok** (the name filter also ran `levelling-runtime`), first time, no re-runs needed. The same checks failed before the fix only on mother-pilot (reaper 154). No new assertion was added.

## Questions for Daniel
1. **Do you want to fix the phase-three race?** Salt 3 still times out, and he still misses 2 windows per fight. The leftover gap is his deliberate slowness running into a fixed 5.5 s window with a knot that can be about 300 px away.
   - My recommendation: change the boss, not the hero. Don't let a phase-three knot move to the two far anchors (−16 and +17), or give phase three 6.5 s instead of 5.5 s.
   - Either of those changes the fight for every hero, so it is your call.
   - I would not make his swing faster or his feet quicker; that slowness is his identity.
2. **Should a check guard this?** The rule "the Mother pilot uses the key verb on her sporelings" has nothing enforcing it. mother-pilot catches a regression only for the Death Knight and only indirectly.
   - My recommendation: add a whiff-rate field to the bossLab row, and have mother-pilot or a small new check assert it. That means touching `tools/check.mjs`, so ask the integrator.
3. **The reaper times out on crown and reef in bossLab at 120 s.** This is pre-existing and was not in this lane's scope. It is worth a pilot lane like this one, because it may be the same slow-cut misplay.
