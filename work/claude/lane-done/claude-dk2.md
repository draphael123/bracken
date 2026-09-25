# Lane DK2: the Death Knight follow-ups

Branch `claude/dk2`, cut from `origin/claude/batch16` (which includes `claude/dkmother`).

| item | commit | what |
|---|---|---|
| 1. The Mother Cap's last quarter | `2277490` | phase-three heart window 5.5 s → 6.5 s (the boss, not the hero) |
| 2. Small-add check | `f8c7455` | small-foe ledger on every bossLab row, and the new check `small-adds` |
| 3. Crown and reef | `5815afc` | pilot fix: the generic strike no longer swings facing away from the boss |

Instruments added: `work/claude/dk2-mother.mjs`, `work/claude/dk2-small-survey.mjs` and `work/claude/dk2-boss-diag.mjs`.

## 1. The Mother Cap's last quarter

### What was measured
I built both approved options behind a temporary switch. The switch was never committed. Each option was run with:
- 7 heroes (the six in mother-pilot's order, then the geomancer),
- refill mode and normal (one-life) mode,
- the pinned roll and salts 1-3.

That is 56 fights per option. Times are in seconds. X means timed out at 180 s. D means died (one life).

In both options the reaper's swing, root and walk are unchanged.

**Refill**
| option | roll | knight | pyro | paladin | pirate | reaper | warden | geomancer |
|---|---|---|---|---|---|---|---|---|
| base | pinned | 118.7 | 122.2 | 119.4 | 105.8 | 143.9 | 124.4 | 105.3 |
| base | 1 | 117.3 | 106.9 | 120.5 | 107.3 | 142.4 | 111.4 | 107.6 |
| base | 2 | 116.4 | 119.2 | 116 | 107.3 | 141.8 | 124.4 | 107.5 |
| base | 3 | 114.3 | 120.4 | 133.2 | 105.9 | **180 X** | 125.7 | 106.6 |
| knot kept near | pinned | 106.4 | 102.9 | 106.6 | 102.3 | 111.6 | 109.1 | 102.4 |
| knot kept near | 1 | 107.8 | 106.4 | 103.6 | 104.5 | 113.9 | 109.9 | 103.2 |
| knot kept near | 2 | 106 | 104.1 | 106.2 | 102.6 | 112.7 | 106.2 | 107.2 |
| knot kept near | 3 | 111.6 | 103.2 | 104.7 | 102.5 | 113.9 | 108.8 | 103 |
| 6.5 s window | pinned | 120.8 | 107 | 109.9 | 105.3 | 131.9 | 125.7 | 106.2 |
| 6.5 s window | 1 | 110.3 | 109.5 | 105.9 | 109.8 | 119 | 110.8 | 103.7 |
| 6.5 s window | 2 | 110.9 | 102.9 | 107.6 | 123.3 | 134.6 | 110.9 | 105.3 |
| 6.5 s window | 3 | 108.3 | 107.6 | 109.3 | 105.3 | 118 | 110.6 | 109.2 |

**Normal (one life)**
| option | roll | knight | pyro | paladin | pirate | reaper | warden | geomancer |
|---|---|---|---|---|---|---|---|---|
| base | pinned | 117.1 | 104.9 | 107.1 | 105.2 | 90.1 D | 120.1 | 105.6 |
| base | 1 | 114.4 D | 85 D | 107.6 | 101.9 | 145.8 | 122.9 | 107.8 |
| base | 2 | 119.9 | 103 | 89.8 D | 106.7 | 112.5 D | 121.9 | 90.7 D |
| base | 3 | 111.6 | 106.4 | 108.5 | 106.2 | 101.4 D | 111.4 | 107.9 |
| knot kept near | pinned | 110.4 | 106.9 | 104.8 | 103.5 | 110.5 D | 106.4 | 105.1 |
| knot kept near | 1 | 105.8 | 105 | 104.1 | 104.7 | 112.3 | 91 D | 102.5 |
| knot kept near | 2 | 106.8 | 104.2 | 109.2 | 101.5 | 112.9 | 107.9 | 104 |
| knot kept near | 3 | 109.9 | 104.2 | 106 | 103.3 | 113.5 | 107.5 | 102.6 |
| 6.5 s window | pinned | 114 D | 123.4 | 113.6 | 106 | 114.9 D | 126.7 | 107.5 |
| 6.5 s window | 1 | 108 | 104.8 | 89.6 D | 105 | 115.8 | 112.1 | 105.7 |
| 6.5 s window | 2 | 109.2 | 102.9 D | 107.7 | 83.9 D | 117.2 | 117.6 D | 91.1 D |
| 6.5 s window | 3 | 104.1 | 105.7 | 110.5 | 106 | 117 D | 108.5 | 91.5 D |

### How much each option moves the other six heroes
These figures cover every hero except the reaper, per roll, against base.

| | mean \|Δ\| refill | worst \|Δ\| refill | mean \|Δ\| one-life | worst \|Δ\| one-life | mean shift refill | one-life wins, all 7 heroes |
|---|---|---|---|---|---|---|
| knot kept near | 9.7 | 28.5 | 7.7 | 31.9 | −9.7 (easier) | 26/28 (93%) |
| **6.5 s window** | **7.7** | **23.9** | **7.6** | **22.8** | −5.3 | 20/28 (71%) |
| base | – | – | – | – | – | 21/28 (75%) |

### Choice: the 6.5 s window (`2277490`, `MOTHER_T.open[3]`)
- **It moves the other heroes least** on all four measures (mean and worst change, in both modes).
- **Keeping the knot near makes the fight easier for everyone.** It takes about 10 s off every hero, and the one-life win rate rises from 75% to 93%. The harder-Mother brief (`tools/mother-hard-pilot.mjs`) aims for 60-75%, so this would push her above that band. With the 6.5 s window she stays inside it (71%).
- **For the reaper, keeping the knot near is the bigger help** (about 113 s, against 118-134.6 s). But the brief was to move the others least.
- **With 6.5 s, the reaper no longer times out on any roll.** Refill: 131.9 / 119 / 134.6 / 118, where base was 143.9 / 142.4 / 141.8 / 180 X. He still misses about one far-anchor window on two of the four rolls.
- **One caveat on one-life deaths.** With 6.5 s the other six heroes died 7 times in 24 fights, against 4 in base. Keeping the knot near gave 1 death. In one-life runs, a single different early roll changes the whole fight (dkmother saw the same), so 24 fights cannot separate 4 from 7. I have flagged this below.

`mother-pilot` (unmodified) passes: 120.8 / 107 / 109.9 / 105.3 / **131.9** / 125.7 (window 90-150). `mother-cap` passes too: its check that the heart opens for less in phase three still holds (6.5 < 8).

## 2. The small-foe check (`f8c7455`, `tools/small-adds.mjs`, added to `tools/check.mjs`; all 121 existing names kept)

### The ledger
Every bossLab row now carries `smallSwings` and `smallMissed`.
- **What counts as a swing at a small foe:** a swing that starts with a small foe (FAMILY `small`, read through `BK.keyOf`) in front of the hero, in reach, and nearer than the boss.
- **What counts as a miss:** the swing touched no small foe (`P.hitSet`), and the foe it was aimed at lost nothing.
- **What is left out:** a swing that struck something else instead (the boss, the heart, the knot) was aimed at that, so it is not counted.
- **It only watches.** The Mother rows replay to the tenth of a second as before.

### Which bosses put small foes in front of the bot
I surveyed every arena: 31 levels × 7 heroes, refill, pinned. The only bosses where the bot swings at small foes are:
- Mother (sporelings),
- False Abbot (his congregation),
- Grandmother,
- Bullfrog (hoppers),
- Owl (0-1 swings per row, left out of the check).

### The check
It runs those four bosses for all seven heroes. It takes about 2.5 minutes.

A row fails if it has **at least 4 swings at small foes and misses more than one in three**. There is also a guard against passing with nothing counted: at least 20 swings at the Mother's sporelings, and at least 60 swings in the whole table.

How the threshold was derived:
- **Today's heroes, before the item-3 fix:** 12 of 119 swings missed. The worst judged row was 20% (warden on the Bullfrog, 1 of 5). The Abbot rows were 18% (pirate, 2/11) and 14% (pyro, 3/21).
- **After the item-3 fix:** 7 of 124 missed. The worst judged row is 23%.
- **Proved red:** with dkmother's sweep taken back out (the pre-dkmother bot), it fails on exactly one row, `spore/mother reaper: missed 5 of 12` (42%).

### What it found across all bosses
No boss's pilot is misplaying its small adds today. Before this lane's refinement, the Bullfrog seemed to show 40% misses for the pirate. The cause was swings aimed at the frog with a hopper nearby, which is why "nearer than the boss" is now part of the rule. The other bosses' add branches (Grave Warden, Hedge Warden, Gargoyle, Abbot) still use the plain cut at adds. Their small foes are few, and all their rows are under the limit.

## 3. Crown and reef: the diagnosis

The instrument is `work/claude/dk2-boss-diag.mjs`. For each boss mode it records:
- the seconds spent in it and the damage dealt in it,
- the swings started and the swings that touched the boss,
- each vulnerable window: where the hero stood when it opened, when his first swing came, and whether it drew blood.

### Reef (Reefmaw): the pilot was misplaying him, and everyone else too. Fixed in the bot (`5815afc`).
Before the fix (pinned, refill):
- The reaper got the jaw stuck **8 times** (more than any other hero), but drew blood in only **4**.
- In the stuck windows he had 22 swings in 33.3 s, and only 5 touched the boss.
- Every window followed the same pattern:
  - his **first swing came at dx −22 facing −1**, which is facing away from the boss, and missed;
  - he was then rooted 0.78 s, in a window of 2.2 s (1.6 s in phase three);
  - his second swing came about 1.5 s later and hit, for 32 damage.
- He ended at 35% of the boss's health, timed out. The knight showed the same whiffs facing away, but his short blade recovered in time.

The cause is in the pilot:
- It closes in and then walks back to its preferred standing spot (`LAB_STAND`). Standing too close, it holds the away key.
- The game turns the hero to the held key before a swing starts (`updatePlayer`: `if (!attacking) P.face = move`).
- So a swing pressed on that frame went out behind him.

A player never swings with his back to the boss, so this is a misplay, not a weakness. **The fix:** on the frame it swings, the generic strike lets go of the key that points away from the boss. That is one line in `runbossLab`, and the hero is unchanged.

Reef, refill, after the fix:

| roll | knight | pyro | paladin | pirate | reaper | warden | geomancer |
|---|---|---|---|---|---|---|---|
| before, pinned | 85 | 120 X | 120 X | 81.8 | **120 X** | 120 X | 67.6 |
| pinned | 49.9 | 103.9 | 37 | 30.9 | **67.9** | 76.7 | 23.4 |
| salt 1 | 50.4 | 86.7 | 48.8 | 70.2 | **52.5** | 70.1 | 30.4 |
| salt 2 | 58.4 | 51.2 | 62.9 | 44.3 | **44.4** | 68.9 | 33.3 |
| salt 3 | 31.6 | 43.6 | 42.7 | 50.7 | **53.8** | 78.1 | 30.7 |

**This is a wide change.** The line is the generic strike, so it moves every boss fought through it.
- Over the 217 bossLab rows, **112 change**: 76 are faster and 36 slower.
- Kills go from **156 to 165**: 10 new kills and 1 lost.
- The lost kill is Stockade pyro, 38.7 s → 120 X. His changed path left him hopping in place off his route for most of the fight, which is a navigation weakness this exposed.
- The Death Knight's other rows move both ways: wood 43.7 → 67.3, lamplit 111.9 → 57.1, storm 120 X → 96.4, longwater and waymeet timeouts → kills, crown 59.8 → 89.6.
- Every check that uses the lab stays green.
- **Any balance baseline taken from bossLab before `5815afc` is stale.**

### Crown (Goblin Queen): the reaper is not failing any more. The other heroes are.
The chandelier work (polish lane) came after dkmother's table. On batch16 the reaper **kills her** on every roll:
- before the item-3 fix: 59.8 pinned, 59.8 / 57.5 / 57.5 on salts 1-3;
- after it: 89.6 pinned.

Now the knight, pyro, pirate and warden **time out on every roll**. The paladin kills on salts 1-3 only, and the geomancer kills.

Where the time goes (pinned, before the fix):
- She only takes damage while `pinned` under her own chandelier (`gqOpen`).
- Every hero spends 25-48 s of the 120 s with her pinned. What differs is the damage done in that time:

| | reaper | geomancer | knight | pirate | warden |
|---|---|---|---|---|---|
| damage while pinned | 541 | 409 | 90 | 268 | 322 |

- The knight made 9 swings in 32.8 s of her being pinned. So the bot is rarely swinging at her while she is open.
- This is not the reaper, so per the brief **he was not changed**, and I did not change the Crown pilot either.

**Recommendation:** open a Crown pilot lane. The question for it is why the generic "open → go to her and strike" path lands so few blows while she is pinned for most heroes. A candidate is the step-down rule, which sets `strike=false` when she is more than 24 px below the hero.

## Checks (subsets only, never the full `npm run check`)
Everything below passed on the first run, with no re-runs needed.

**After `5815afc`:**
- the 17-check keep-green list: `mother-pilot`, `mother-cap`, `boss-openings`, `boss-fight-end`, `reaper-input`, `pilot-actions`, `starter-kits`, `combat-feel`, `attack-animation`, `queen-comb`, `crown-route`, `gallery-runtime`, `arena-supplies`, `tells`, `textfit`, `comments`, `syntax`;
- `queen-chandelier`, run directly with `node tools/queen-chandelier.mjs`, because the name filter did not pick it up;
- the checks that use the lab: `boss-navigation`, `combat-replay`, `herald-pirate`, `pyre-pilot`, `normal-health`, `lab-clock` and `small-adds`.

**Earlier in the lane:**
- after `2277490`: `mother-pilot`, `mother-cap`, `boss-openings`, `boss-fight-end`, `tells`, `gallery-runtime`;
- after `f8c7455`: `normal-health`, `lab-clock`, `boss-navigation`, `pilot-actions`.

## Questions for Daniel
1. **Should the 6.5 s window stand, given the one-life deaths?** It won on every time measure. But the other heroes died 7 times in 24 one-life fights, against 4 in base. Keeping the knot near would make her about 10 s easier and lift the one-life win rate to 93%, above the harder-Mother band.
   - *Recommendation:* keep 6.5 s. Run `tools/mother-hard-pilot.mjs` (24 one-life fights) at integration to confirm the win rate sits in the 60-75% band.
2. **Should the facing-away fix merge?** `5815afc` is right as a rule, but it changes 112 of 217 bossLab rows, and any balance number taken before it is stale.
   - *Recommendation:* merge it, and re-baseline bossLab tables after it. Separately, look at the Stockade pyro navigation hole it exposed.
3. **The Crown now fails for four heroes on every roll, and the paladin on one.** The reaper is fine.
   - *Recommendation:* a Crown pilot lane (see section 3). Do not change the Queen until the pilot is known to hit her while she is pinned.
4. **Should the other add branches use the key verb?** The Grave Warden, Hedge Warden and Gargoyle branches still cut adds with the plain cut. Their adds are not in the FAMILY `small` table, so `small-adds` does not judge them, and the pilot never hit this problem there.
   - *Recommendation:* move them onto `keyVerb` the next time a lane is in those branches.
