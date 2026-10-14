# claude/sptune - THE SCARAB MOTHER tune (Sonnet, numbers only) - on claude/spart

Measured: tools/boss-rates.mjs sealedpyramid --profile=human --flasks=kit --ways=practiced --seeds=12 (knight/warden/pyro, L41, jobs 2, PORT 8873).

| step | numbers | knight | warden | pyro | all |
|---|---|---|---|---|---|
| before | gap [0.45,0.35,0.25]; dmg charge 46 snap 40 spit 30 burrow 44 quake 40 | 6/12 | 3/12 | 9/12 | 18/36 = 50% |
| try 1 | gap [0.55,0.45,0.35]; dmg 40/35/27/38/35 | 7/12 | 7/12 | 7/12 | 58% |
| try 2 | dmg 37/32/25/35/32 | 4/12 | 8/12 | 8/12 | 56% (noise: knight swung 7 to 4) |
| FINAL | gap [0.65,0.55,0.45]; dmg charge 35 snap 30 spit 24 burrow 33 quake 30 (puddle 8, brood 10 unchanged) | 7/12 | 5/12 | 10/12 | **22/36 = 61%, in band, no hero at 0** |

Only SM.gap and SM.dmg in src/scarab-mother.js changed (pressure only; hp 2900, trap openings, ward, tells untouched).
Fight times (final): min 74.5 / avg ~103 / max 146 s (knight avg 98, warden 114, pyro 96); wins avg 90-111 s. Before: avg 91-97, 62-116 s.
Seeds are noisy at n=12 per hero (+-1 hero swing of 3 between tries); the three-hero total is the read.

DRY (human+dry, 6 seeds, reported only): before knight 0/6 warden 0/6 pyro 3/6 = 17%; after knight 0/6 warden 0/6 pyro 2/6 = 11% (fights 36-91 s). Dry is not the standard (B6 amended); flasks are what carry the knight and warden.

TOMB-WARDEN elite (tools/elite-lab.mjs --kinds=mummy, 6 human seeds + 2 mash): not touched (the brief tunes her numbers only). The tool's seeds repeat, so rows are identical: human wins every hero (~15-50 s), mash dies (0 wins). That is ABOVE the 75-85 elite band; flagged below, not changed.

Re-stamp: docs/mash-bot.json LEVEL then BOSS: level every hero dies (knight 5, warden 8, pyro 6 deaths); boss mash 0/6 (boss left 91/94/67%). docs/level1-curve.json and level1-pilot.json not re-stamped: they hash the level data, which is unchanged.

Checks (PORT 8873, one page tool at a time): sealed-pyramid 82/82, boss-openings ok, boss-read ok, boss-fight-end ok (62 fights), tells ok (917 rows), untold-told ok (23 incl. mummy), mark-integrity MI_ONLY=scarabmother ok (charge/snap/spit seen, landed, posed; no phantom this run). No reds.

## QUESTIONS FOR DANIEL
1. TOMB-WARDEN elite wins 100% for the human bot (band 75-85). Rec: a tune lane raises the mummy's damage/hp for that elite once the seeds are varied; built nothing (out of scope).
