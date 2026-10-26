# labkeys phase 2: boss rates after the stuck-key fix (claude/labkeys b08b84e6)
BOT_PROFILE=human, flasks kit, practiced, normal, n=12 per hero (k/w/p), campaign level per tools/boss-level.mjs. Raw: demo.log/json, act1.log/json.
Old = latest stamped rate found in scratch/*.log (n and exact level vary; "-" = none found). Band bosses 60-70, minis 75-85.

| boss | L | new k/w/p | new % | old % (source) | band |
|---|---|---|---|---|---|
| wood (Hornet Queen) | 3 | 11/12 12/12 11/12 | 94 | 67-81 (dkfeel) | HIGH +24 |
| marsh | 3 | 9/12 12/12 10/12 | 86 | 89-92 (dkfeel) | HIGH +16 |
| fenroad (Bog Troll, already clean) | 3 | 11/12 7/12 8/12 | 72 | - | HIGH +2 |
| stockade | 4 | 5/12 9/12 5/12 | 53 | 39-42 (dkfeel), 61 (b104), 78 (b102 n=6) | LOW -7 |
| spore | 5 | 8/12 12/12 1/12 | 58 | - | LOW -2 (pyro 1/12) |
| burning | 5 | 8/12 11/12 7/12 | 72 | 88-89 (dkfeel) | HIGH +2 |
| rootway | 6 | 0/12 8/12 8/12 | 44 | - | LOW -16 (knight 0/12) |
| palisadewood | 7 | 12/12 12/12 12/12 | 100 | 64 (rates121) | HIGH +30 |
| kings | 8 | 6/12 12/12 9/12 | 75 | - | HIGH +5 |
| scree | 9 | 11/12 10/12 12/12 | 92 | 89 (rates121, L8) | HIGH +22 |
| underleaf | 10 | 11/12 8/12 12/12 | 86 | 92 (rates121, L9) | HIGH +16 |
| hanging | 11 | 7/12 10/12 6/12 | 64 | 50 (b102, old) | in band |
| spire (Monastery) | 12 | 7/12 12/12 12/12 | 86 | - | HIGH +16 |
| kings:mini | 8 | 12/12 10/12 11/12 | 92 | - | HIGH +7 |
| spire:mini | 12 | 11/12 11/12 9/12 | 86 | - | in band (+1) |
