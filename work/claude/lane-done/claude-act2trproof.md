STATUS: IN PROGRESS (11-04). Master 42a1d4cd merged into claude/act2tr (tip bafde6ef, pushed); node checks 337/337 + woodmarsh 31/31 green after merge. Browser run (demo-transitions --browser --perf --shots) started; log scratch/lane-reports/act2trproof-run1.log, shots in act2trproof-shots/. If cut: next coordinator reads that log (ends with "EXIT n").

## Merge
Conflicts only in src/transitions.js (barIn/barOut: kept lane C's `bar` param on both; smoke maths: kept master's smokeStance/smokePan/smokeRise/smokeGlow/smokeWord, dropped lane's old smokeRise/Glow copy, kept lane C scene block) and src/transitions-art.js (import line: union incl. smokeStance, smokePan, isBareKind + lane C imports). main.js auto-merged; calls to barIn/barOut already pass entry.bar.
