# Responsive attacks and honest survival checks

The existing 150 ms attack buffer now remembers whether UP or DOWN was held when the attack was pressed. Releasing that direction during the previous swing's recovery no longer turns a queued rising cut or ground sweep into a plain swing. Each co-op hero retains independent intent. Attack commitment, buffer lifetime, stamina, damage and plunge rules are unchanged.

`node tools/attack-buffer.mjs` exercises all six heroes, both facings, both directional cuts, expired presses, committed swings and independent co-op inputs.

`BK.bossLab({healthMode:'normal', bosses:['longwater'], heroes:['knight']})` starts each isolated encounter at full health, then stops on the first death without refilling health. Rows report `outcome` (win/death/trade/timeout), starting and ending HP, net health lost and net health recovered. Recovery includes ordinary XP growth and lifesteal. Sampling is once per simulated frame, so simultaneous healing and damage are net changes, not gross hit totals. Existing environmental pilot assists still apply; this is not a campaign or human survival test.

The default `healthMode:'refill'` remains the timing lab and is now explicitly labelled in results. Its timing results must not be presented as normal-health survival evidence. `node tools/normal-health.mjs` checks a real first-death stop, an underwater win with normal health, HP reconciliation and distinct refill behavior.

Both regressions are part of `npm run check`. Historical checkpoint 39 timing results are retained as historical evidence; the global input change does not make those rows a fresh measurement of this checkpoint.
