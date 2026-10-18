# claude/airpockets (sonnet) - THE TOLLMASTER's BELL HOUSINGS (Daniel 10-18)

Pockets added (all in the Toll Gate square, src/level.js): FOUR iron-hooded alcoves cut up into the roof slab, at tiles x 657-659, 665-667, 677-679, 685-687 (two per half of the square; the square is x650-694, mid 672). Each is a 3-wide alcove (rows 5-7, a stone turret on the roof over it) with air from row 5 to 8. When P3 floods the square to its roof, the air stays in them.
- Breath: reuses the 10-16 underwater breath system (L.airRooms -> nearAir -> refill like surfacing). No new clock.
- Not a place to sit: a housing is SPENT after 2.5 s of drinking ("THE HOUSING IS SPENT") and fills again 14 s later ("THE HOUSING FILLS AGAIN"); four drunk in turn are 10 s, so a hero cannot rotate them forever. Idle time decays the use at 0.5/s.
- The WRIT OF DROWNING (P3 move) drowns the housings on the half it names (it names YOUR half) exactly like it drowns the lamp hoods; so the fight is: which housing, and when to cross to the other half.
- Own visuals (src/lamplit2-art.js tollHousing): riveted iron bell hood, brass collar, stone back wall; states dry / air (pale lens, water line, bubbles, sinks as you drink) / spent (dashed ghost + weed) / drowned (writ water). A pale light (ent 'airhood') makes each findable in the 0.66 dark.
- Tollmaster hp 2850 -> 3450 (main.js EHP). With the housings the bot was 75% with flasks (master baseline 63%).

Rates (tools/boss-rates.mjs lamplit --profile=human, 12 seeds/hero, campaign L21, flasks kit, normal):
| build | knight | warden | pyro | all |
| housings, hp 2850 | 4/12 | 11/12 | 12/12 | 75% HIGH |
| housings, hp 3150 | 7/12 | 10/12 | 10/12 | 75% HIGH |
| **housings, hp 3450 (shipped)** | **3/12** | **9/12** | **9/11** | **60% in band (low edge)** |
Mash bot (lamplit boss): dies with every hero (0 wins). Dry rates not measured (time).
Note: the bot does not use the housings on purpose (it only wanders into them); a human who does will be a bit easier than the bot number - hp 3450 leaves margin. Knight is the weak hero (3/12) as at master.

Checks: tools/lamplit2.mjs all green (3 new asserts: 4 housings on both halves hold air once flooded; spent after ~2.5 s and back; writ drowns the named half's housings and leaves the other; the modes probe now pins the hero to the floor); tools/tells.mjs clean; tools/textfit.mjs levelcard 0 problems (the full run timed out in the levelcard scope while a boss-rates run shared the machine; re-run alone, 0 issues; other scopes passed before the timeout); tools/breath.mjs lamplit runs (static tool: ARENA row null because the flood is runtime; unchanged REQUIRED line is the same as master); mash-bot lamplit 0/N.
Reds: none from this change. (A scratch worktree of master was used once to prove the old lamplit2 "told moves" fail was my test's hero floating up, then removed.)

## QUESTIONS FOR DANIEL (rec + what I built)
1. Four housings or three? Built 4 (two per half) so the writ always leaves two. Rec: keep 4; trim to 3 if it feels too generous.
2. Spent after 2.5 s / back 14 s: built; rec keep. Raise the back time if people still camp the roof.
3. Boss hp 3450 to offset the pockets (60% bot): rec keep until you play P3 once; the bot can't judge the puzzle.
