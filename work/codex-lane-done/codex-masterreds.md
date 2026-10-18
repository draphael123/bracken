# codex/masterreds — October 18, 2026

Base: `origin/master` at `e0436ee8`. This branch fixes pre-existing release reds; it is not a merge or deployment.

## Verified step: Berserker double chop

The universal boss/mini break-bar path now supplies 15.6 poise to a held heavy outside an opening. The Berserker's existing 30 x 1.4 bonus brought that to 57.6, below the unchanged 60-point assertion. Raising only its boss/mini multiplier to 1.5 restores the intended held-heavy impact without changing the test.

Before: `tools/berserker.mjs` exit 1, `double chop ... most:57.6, heavy:true`.
After: `tools/berserker.mjs` exit 0, `most:60.6, heavy:true`; `tools/anti-mash.mjs` exit 0 (`stale table, break bar on 47 bosses + 17 minis, finisher, varied refill`). Logs are outside git at `../masterreds-berserker-before.log`, `../masterreds-berserker-after.log`, and `../masterreds-anti-mash-after.log`.

## Remaining work

Reproduce and fix dune-worm, bells, rule-openings POISE, slopes-trace Kingswood, small-adds Pirate/Abbot, and archmage-folly spots spread. Run the relevant gates and report each result before this branch is ready for a merge.

## QUESTIONS FOR DANIEL

- **Recommended: keep the Berserker's 60-point held-heavy expectation.** The player-facing kit says the double chop breaks big poise especially well; the narrow multiplier repair restores that behavior.
