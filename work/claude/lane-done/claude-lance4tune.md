# claude/lance4 - LANCE 4 TUNE lane (merge, page checks, restamps, boss band)

Branch `claude/lance4`, code tip 3a0d10b1 (+ this note's commit). Not merged, not deployed. Becomes BATCH133 with claude/harnessstall (f9f74bd5).

## Commits (on top of f42cf184)
- 0650a8db  Merge master 204a22d4 (BATCH132, claude/zipregrab). Conflicts: hint-lines.js (kept lance4's SAY/CALL sets + master's FT4_SAY / CHAIR_SAY / vault lines), marks.js (master's table minus lance|bashTell / lance|rearTell), check.mjs (lance4 + stormhold4 + master's boss-checkpoint), playtest.js (kitchen hop + the bot's rope transfer), zipline.js.
  - zipline.js: the Stormhold-only regrab gate (`xfer` / L.zipTransfer inside the take-hold block) is DROPPED. Master's game-wide rule is used as is (kick/drop locks only the rope just left; end/snap = full lockout via zipHard). Kept only lance4's `z.cut > 0` (a parted line holds nobody, is never caught) and the cut-fall. `L.zipTransfer` stays as the reach model's / the bot's opt-in only (reachcore.js, playtest.js); it no longer touches the game's rope rules.
- acca7c76  tools/zipline.mjs: the "hop clear, lands, not re-caught" rows now only forbid re-catching the SAME rope (game-wide regrab lets a neighbouring storm rope take you; that was 14 red rows = rope 3 jump + down x 7 heroes).
- 042849e0  tools/bells.mjs: gatebell / lancebell ents count as live bells for the signs that name them (4 reds: storm signs at 585/642/670/685).
- 52bf805c  tools/walk-controls.mjs: frames iron 4800 -> 6000, bone 7200 -> 9600 (were 37% < 38% and 90% < 92%; the haul-line walk is slower; now 46% / 92% / 87%, pass).
- 5fa95008  LEVEL restamps: docs/level1-pilot.json, level1-curve.json, mash-bot.json (level mode).
- 616165b2  campaign-xp restamp (storm foe xp 864 -> 896; the storm boss level stays L18).
- 3a0d10b1  BOSS tune + mash boss row restamp (below).

## Page checks (one browser at a time, free RAM 6.0-6.5 GB every time)
- zipline.mjs: GREEN after the row fix (full 7-hero run: gantry + rootway all ok, no timeout this time; storm knight re-run 39/39 after the fix).
- walk-controls GREEN (after the frame bump). bells GREEN (after the sign fix). hint-shown GREEN.
- lance4 (node + page) GREEN, and again after the tune. boss-openings GREEN (first run: page CRASHED, harness; re-run ok). rule-openings, boss-read, combat-feel GREEN.
- reach-heroes storm GREEN (0 known crossings, 11 route targets, every hero 0 unreached).
- level-walk storm (k/w/p): reaches the boss, walked 92%, 1 death each. The walker reports STUCK at route node 88 (next tile 563,36 from hero 460,24, the haul-line crossing / ditch) for all three, then resumes (knight death THE SPIKES@453,43). It is a walker limitation (it does not chain the haul ropes like the tools bot does), not a gate. Arrival 97/88/75% = MISS vs the act target (report only, as before).
- level1-pilot storm: walked 100%, 1 death, 18 kills (--write); --curve: curve-gate GREEN (0 out of band).
- textfit (the check.mjs scoped list, --strict): all scopes GREEN except `bossjump`, which twice hit a Runtime.evaluate stall of 481 s inside the long run (harness stall; it passes alone in 4 s). Run alone it reports ONE TRUNCATED row: bossjump #63 "LORD GRUBBAG THE GLUTTON" -> "LORD GRUBBAG THE GLUTTO", from master's kitchengateart (4fb12d66), not this lane. bossselect, secrets, soundtest, whatsnew green.
- mobile-perf GREEN (inside the budget at 4x CPU, 915x412).
- pixels (`headless.mjs floats`) GREEN, 53 levels / 3188 sprites, no hash restamp needed (first attempt: page CRASHED, harness).
- HARNESS NOTE: the whole-game `BK.xpSim()` page (boss-level.mjs --write-xp) crashes (Inspector.targetCrashed, ~40 s in) about every other try; the first attempt also sat 25 min (timer throttling). I ran it with the claude/harnessstall tools patch (browser-profile/cdp/headless) applied to the WORKING TREE ONLY (reverted, not committed) and retried; it succeeded on the 2nd try. Looks like page memory near its limit.

## BOSS TUNE (storm / the Queen's Lance 4, L18, boss-rates --ways=practiced --profile=human, flasks kit; seeds 1-36 for k/w/p; the sim is deterministic per seed)
Diagnosis: HP alone is a bad lever. The first cut (4500) was 83%; 4650-4700 sat at 58-61% overall but with knight 21-38% / warden 63-67% / pyro 83-88% (the knight has to live inside his reach; pyro stands off while he is pinned and wins in 60-90 s). The spread, not the average, was the problem.

| setting | n | knight | warden | pyro | all |
|---|---|---|---|---|---|
| HP 4700 (no hero terms) | 72 | 9/24 | 15/24 | 20/24 | 61% |
| HP 4650 (no hero terms) | 72 | 5/24 | 16/24 | 21/24 | 58% |
| HP 4650 + DUEL knight 0.6 pyro 2.2 | 72 | 20/24 | 14/24 | 14/24 | 67% |
| same, knight 0.75 pyro 1.8 | 72 | 9/24 | 12/24 | 21/24 | 58% |
| + heroDmg k1.2 w1 p0.75, DUEL k0.8 w1.3 p1.55 | 72 | 17/24 | 14/24 | 21/24 | 72% |
| HP 4850, heroDmg k1.2 w1.1 p0.65 | 72 | 21/24 | 17/24 | 15/24 | 74% |
| HP 4850, heroDmg k1.1 w1.05 p0.65, DUEL k0.9 | 72 | 9/24 | 15/24 | 15/24 | 54% |
| **FINAL: HP 4850, heroDmg k1.15 w1.05 p0.65, DUEL k0.85 w1.3 p1.55** | **108** | **22/36 = 61%** | **22/36 = 61%** | **25/36 = 69%** | **69/108 = 64%, in band** |

- FINAL wins last 59-182 s over the 108 (mean about 117 s; the three 12-seed batches 115 / 118 / 115 s). Roughly 80% of wins fall in 90-150 s; the rest are a few quick pyro/warden kills (60-88 s) and a few long knight ones (160-184 s).
- Mash (`tools/mash-bot.mjs storm --write`): 0/6, dead in 23 s with the boss at 98%. No button-mash win. Row restamped.
- Resist floor intact: the shield front stays x0.4, shieldless x0.7, openings still pay 1.5-2x, nothing new is invulnerable. heroDmg is a per-hero damage factor (0.65-1.15).
- Built: `EHP.lance` 4850 (src/main.js); `LANCE4.heroDmg {knight 1.15, warden 1.05, pyro 0.65}` (src/lance-support.js; applied in hurtEnemy for the lance); `DUEL_HERO.lance {knight 0.85, warden 1.3, pyro 1.55}` (his blows on the hero; was 1 / 1.25 / 1.55).

## Not done / caveats
- The zipline.mjs full 7-hero storm re-run after the row edit was run for the knight only (the rows are hero-independent; the first full run had exactly 14 identical storm reds = 2 rows x 7 heroes; every other level/hero green).
- Pyro's wins are still the shortest (median about 100 s), the knight's the longest.
- The knight is a cliff hero: heroDmg 1.2 / DUEL 0.8 gives about 85%, 1.1 / 0.9 gives about 38%. Re-check him if any boss number moves.
- The full suite was not run (not this lane's).

## QUESTIONS FOR DANIEL (rec built)
1. Per-hero boss tuning (heroDmg / DUEL_HERO) instead of HP alone. REC (built): keep; it brought k/w/p to 61/61/69 and tightened win times. ALT: HP 4650-4700 with no hero terms (58-61% but knight 21-38%).
2. level-walk STUCK at the haul crossing (node 88). REC: leave it (walker only; the L1 pilot walks 100%). ALT: teach src/walk-graph.js the rope-to-rope chain.
3. textfit bossjump truncation "LORD GRUBBAG THE GLUTTON" (master, kitchengateart). REC: shorten the row name or widen the plate (not this lane).
4. The whole-game xpSim page crashes about half the time (harness/memory). REC: let the harnessstall lane look, or split xpSim into two ranges.
