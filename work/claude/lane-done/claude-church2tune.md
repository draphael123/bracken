# claude/church2tune - verify + report (lane 10-16)

## What ce021edd changed (src/deacon.js only, DC table)
hp 1500 -> 1650; walk 58 -> 66; gap [0.5,0.42] -> [0.4,0.32]; light drain 8 -> 6, drainHeavy 14 -> 11 (his lamps' fall-off is gentler);
sweep dmg 40 -> 47; hook jab 34 -> 42; arc dmg 13 -> 15. More pressure and more hp, kinder light drain.

## This lane
- Merged origin/master (7d89836b, BATCH95) cleanly (no conflicts); no further Deacon change needed.
- Deacon = church:mini (L26, mini band 75-85% with flasks). tools/boss-rates.mjs church:mini --ways=practiced --seeds=12 --profile=human --jobs=1:
  WITH FLASKS (kit): knight 12/12, warden 10/12, pyro 8/12 = 30/36 = 83%, IN BAND, no hero at 0.
  DRY (human+dry, 6 seeds): knight 5/6, warden 0/6, pyro 3/6 = 8/18 = 44% (informational; warden 0 dry). No paladin hero in the rates kit.
- Fixed a red from church2art (tools/lit-church-aloft.mjs C): the Deacon's two chandelier lamps (dcChanW/E, hang:true) hang in air by design and
  were tested as standing on a top. The check now requires a hang lamp to be held by a solid within 16 rows (same rule as the dressing chandeliers). Test strengthened for hang lamps, not weakened.

## Checks (port 8968, single runs)
green: lit-church (355), lit-church-aloft (after the fix), paladin-boss (132), boss-openings, boss-read, boss-fight-end (64 fights), tells, corpses, mash-gate (47 levels, no re-stamp needed), level-quality church, textfit (boss scope re-run alone: 0 issues; first full run's boss scope timed out at 480s under memory pressure), mobile-perf (re-run green; first runs red from low free RAM ~3 GB: 31 fps / protocol timeout).
reds: none outstanding.

## Not touched
The Paladin boss still uses the Paladin 2 kit (re-point to Paladin 4 is a separate opus lane).

## Questions for Daniel
- Deacon dry warden is 0/6 (44% dry overall). Rec: leave it; bosses/minis are tuned with flasks per the standing target.
