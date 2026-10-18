# codex/masterreds — October 18, 2026

Base: `origin/master` at `e0436ee8`. This branch fixes pre-existing release reds; it is not a merge or deployment.

## Verified step: Berserker double chop

The universal boss/mini break-bar path now supplies 15.6 poise to a held heavy outside an opening. The Berserker's existing 30 x 1.4 bonus brought that to 57.6, below the unchanged 60-point assertion. Raising only its boss/mini multiplier to 1.5 restores the intended held-heavy impact without changing the test.

Before: `tools/berserker.mjs` exit 1, `double chop ... most:57.6, heavy:true`.
After: `tools/berserker.mjs` exit 0, `most:60.6, heavy:true`; `tools/anti-mash.mjs` exit 0 (`stale table, break bar on 47 bosses + 17 minis, finisher, varied refill`). Logs are outside git at `../masterreds-berserker-before.log`, `../masterreds-berserker-after.log`, and `../masterreds-anti-mash-after.log`.

## Remaining work

### Verified step: Dune Worm opening

`amFrame` samples openings before a boss updates. When the Worm becomes stunned during that update, a blow on that same frame could reuse the previous opening's stale-hit count: its 20-point blow dealt 26 instead of 30. `antiMash` now records a new opening immediately before the blow's stale calculation; the existing per-frame sampler still handles openings with no hit.

Before: `tools/dune-worm.mjs` exit 1, `stun.dealt:26` with `stun:true`, `openRead:true`, and `took:0`.
After: `tools/dune-worm.mjs` exit 0, `stun.dealt:30`; `tools/anti-mash.mjs` exit 0. Logs: `../masterreds-dune-worm-before.log`, `../masterreds-dune-worm-after.log`, `../masterreds-anti-mash-dune.log`.

### Verified step: UnderCrown bell

The automatic mine cart starts two tiles east of the bell sentry and runs him down 25 frames after he sees the hero, before his `spot` windup can finish. The bell and alarm were intact. Moving that sentry five tiles east places him behind the departing cart, while leaving his bell and the cart's route in place.

Before: `tools/bells.mjs` exit 1; `undercrown works#0` had `ran:false`, `on:false`. Temporary diagnostic showed `alive:false`, `hp:-8`, cart within 8 px at frame 25. After: the unmodified `tools/bells.mjs` exits 0; UnderCrown sentry runs, rings at frame 208, drops the gate, calls two guards, lifts, stays quiet when broken, and resets after death. `tools/level1-pilot.mjs undercrown --write`, `tools/mash-bot.mjs undercrown --level undercrown --write`, and `tools/mash-bot.mjs undercrown --write` refreshed the changed level hash; `tools/level-quality.mjs undercrown` exits 0. No checker assertion changed. Short logs: `../masterreds-bells-before.log`, `../masterreds-bells-after.log`, `../masterreds-undercrown-pilot.log`, `../masterreds-undercrown-mash.log`, `../masterreds-undercrown-mash-boss.log`, `../masterreds-undercrown-quality-after.log`.

### Verified step: POISE checker

Commit `97206a12` deliberately replaced the old boss poise calculation with the verb-based universal break bar (`src/anti-mash.js`). The older `rule-openings` harness called untagged `hurtEnemy`, so all three measured values were zero. It now delivers real tagged cut/heavy blows in independent fresh fights. The old `heavy >= 30` expectation was for the retired bar; this deliberate game change sets a heavy outside an opening to exactly `26 x 0.6 = 15.6`, and a cut inside to exactly 3. These exact values, plus the zero outside cut, remain asserted. No boss tuning was changed for this check.

Before: `tools/rule-openings.mjs` exit 1, `poise:{tap:0,heavy:0,inOpen:0}`. After: exit 0, `poise:{tap:0,heavy:15.6,inOpen:3}`; other gate/bell/rune and mini cap assertions stayed green. Logs: `../masterreds-rule-openings-before.log` and `../masterreds-rule-openings-after2.log`.

### Verified step: Pirate versus Abbot small adds

The Abbot pilot's special add branch pressed attack whenever an add was horizontally close, bypassing the vertical sweep/cut reach check already used by the general small-foe pilot. It now waits when both attack bands miss and selects the cut when only the cut band reaches. This changes the pilot's inputs, not the checker threshold or the game kit.

Before: `tools/small-adds.mjs` exit 1, Pirate versus Abbot missed 2 of 5. After: exit 0 over all four bosses and nine heroes: 4 of 110 small-foe swings missed (4%), worst judged row 20% against the unchanged 33% cap. Logs: `../masterreds-small-adds-before.log` and `../masterreds-small-adds-band.log`.

### Verified step: Archmage blink spots

The `archmage-folly` test left live rAF frames running during an awaited module import, then let the game's random stream choose blink locations. Freezing live frames before the import and seeding the same LCG used by other page checks makes the spread repeatable without changing the Archmage or the unchanged spread assertion.

Three standalone runs all exit 0 and report the same ten locations: `[12388,12208,12478,12208,12388,12298,12388,12208,12388,12576]`. Logs: `../masterreds-archmage-freeze-1.log` through `-3.log`.

Remaining: resolve slopes-trace Kingswood and run the relevant gates before this branch is ready for a merge.

## QUESTIONS FOR DANIEL

- **Recommended: keep the Berserker's 60-point held-heavy expectation.** The player-facing kit says the double chop breaks big poise especially well; the narrow multiplier repair restores that behavior.
