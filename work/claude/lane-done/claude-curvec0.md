# claude/curvec0 - CURVE FIX C0: stale boss re-measure (measure only, no tuning)
Base 45d7d8a1 (BATCH103). Profile human WITH flasks (kit), campaign level, practiced way, Normal. Flasks n=12/hero (36/row); DRY (human+dry) n=6/hero (18/row). Heroes knight/warden/pyro (k/w/p).
Data: docs/boss-band-1019.json (rows: boss, level, act, n and wins per hero for flasks + dry, mean fight secs, band, verdict, floorMiss).
Band = brief-curvefix-1018 2e (acts I bosses 60-70 as stated, minis I 75-85; II bosses 62-68, finale Highcrown 60-65, minis 74-82; III bosses 60-65). Verdict on flasks pooled %.

| row | act | L | flasks k/w/p | flasks % | dry k/w/p (n=6) | dry % | mean s | band | verdict |
|---|---|---|---|---|---|---|---|---|---|
| spore | I | 3 | 11/12 11/12 9/12 | 86 | 3 4 2 /6 -> 3/6 3/6 2/6 | 44 | 105 | 60-70 | HIGH +16 |
| kings | I | 5 | 7 12 10 | 81 | 1/6 4/6 3/6 | 44 | 54 | 60-70 | HIGH +11 |
| kings:mini (Great Hound) | I | 5 | 9 10 11 | 83 | 2/6 5/6 6/6 | 72 | 28 | 75-85 | IN |
| moor | II | 10 | 1 12 0 | 36 | 0/6 4/6 0/6 | 22 | 100 | 62-68 | LOW -26, floor miss k+p |
| skyroad | II | 11 | 7 7 7 | 58 | 2/6 4/6 1/6 | 39 | 79 | 62-68 | LOW -4 |
| oreroad | II | 12 | 8 6 7 | 58 | 1/6 2/6 4/6 | 39 | 102 | 62-68 | LOW -4 |
| storm | II | 14 | 9 7 10 | 72 | 2/6 2/6 5/6 | 50 | 49 | 62-68 | HIGH +4 |
| crown (Goblin Queen, FINALE) | II | 16 | 12 11 10 | 92 | 5/6 3/6 3/6 | 61 | 44 | 60-65 | HIGH +27 |
| crown:mini (Forgemaster) | II | 16 | 8 12 11 | 86 | 2/6 6/6 4/6 | 67 | 45 | 74-82 | HIGH +4 |
| spire:mini (Golem) | II | 9 | 10 12 4 | 72 | 0/6 4/6 1/6 | 28 | 80 | 74-82 | LOW -2 |
| hanging:mini (Spider) | II | 8 | 12 8 11 | 86 | 4/6 2/6 5/6 | 61 | 33 | 74-82 | HIGH +4 |
| longwater | III | 17 | 9 11 7 | 75 | 0/6 4/6 0/6 | 22 | 35 | 60-65 | HIGH +10 |
| reef | III | 18 | 7 8 10 | 69 | 3/6 3/6 2/6 | 44 | 37 | 60-65 | HIGH +4 |
(k/w/p wins are out of 12 for flasks; dry columns are out of 6.)

## Suspicious / notes
- MOOR PYRO 0/12 (knight 1/12, warden 12/12): the pyro dies in 33-100 s with the boss still at 70-87% hp, taking ~180-224 (its whole hp) every time; looks like a hero/boss mismatch (pyro cannot pressure him) or a pyro-hands bug vs moor rather than a smooth rate. Warden 12/12 vs pyro 0/12 on the same boss is the biggest spread in the set. Check before trimming.
- Dry is far below flasks everywhere (22-72%): longwater and moor dry 22%, spire Golem dry 28%; flasks are carrying these rows, longwater knight/pyro 0/6 dry.
- Spire Golem pyro 4/12 drags the mini to 72% (knight/warden fine); hanging Spider is back near the band (86%, was 89%).
- Crown (Goblin Queen finale) 92% is far above the 60-65 finale band: biggest trim for C4a. Spore/kings (act I) are above 70 as well; Q9 style trims.
- No errored fights (errs 0). Fights ran serially, one headless Chrome, PORT 8759. DRY n=6 not 12 (time); flasks n=12 per brief.
- No source changes; only docs/boss-band-1019.json + this report committed.
