# claude/tuskerbz - THE WHIRL rename + OLD TUSKER vs the Berserker (sonnet, 10-22)

Base claude/chargetiers2 0403b492. PORT 8789.

## 1. THE WHEEL -> THE WHIRL (Berserker tier 2)
Player-facing name (tier meter `names[2]` in src/berserker.js, hero desc in src/main.js), comments, and the berserker check text. Ids unchanged. The Warden's bought skill THE WHEEL is untouched.

## 2. OLD TUSKER (the boss, not the tiers)
**Change:** `OT.bz = { hurt: 2.2 }` (src/old-tusker.js); src/old-tusker-hands.js multiplies Tusker's damage to the player by it when the hero is the Berserker (`bzD`, via a new `heroId` on the hands ctx in main.js). Hero-keyed, so no other hero's fight changes (verified: knight/warden/pyro/ranger/geomancer rates identical before/after). B15 floor untouched (hide 0.4, never invulnerable, pin x2, daze x1.25).

**Why this lever.** Instrumented a fight: the Berserker deals ~80% of his damage in the daze/pin windows, mostly flurry chops, and takes few hits' worth of damage through frenzy absorb + flasks (taken 11-124 of 105 hp + flasks, 18-20 charge hits eaten on some seeds). Things tried that did NOT move the rate (wood, human, kit flasks, n=12, berserker):
| try | rate |
|---|---|
| baseline | 11/12 |
| daze damage purse (cap 11% of him per daze, early shake-off) | 10/12 (and pyro 5 -> 2/12, so dropped) |
| T2/T3 tier blow on a dazed Tusker shortens the reel 0.9 s | 11/12 |
| Berserker's blows in daze x1.0 / pin x1.6 instead of 1.25 / 2 | 12/12 (fights only ~5% longer: waiting for openings dominates, not damage per opening) |
| Tusker hits the Berserker x1.5 / x1.8 / **x2.2** | 9/12 / 10/12 / **16/24 = 67%** |
The Berserker just sustains too well against Tusker's 10-14 dmg hits, so the knob is how hard the boss hits HIM.

## RATES (wood, L3, human, kit flasks, practiced)
| hero | before | after |
|---|---|---|
| berserker | 11/12 (92%) | **16/24 (67%)** (n=24; earlier n=12 at x2.2 unmeasured separately) |
| knight | 11/12 | 11/12 |
| warden | 7/12 | 7/12 |
| pyro | 5/12 | 5/12 |
| ranger (n=6) | 3/6 | 3/6 |
| geomancer (n=6) | 2/6 | 2/6 |
| berserker DRY (human+dry, n=12) | 11/12 | 9/12 (75%) |
| mash berserker (n=3) | - | 0/3 (boss left 60%) |
Row (knight/warden/pyro) = 64% in band, unchanged. Ranger/geomancer (42%) and warden/pyro were already low or unchanged; this lane did not touch them. Knight 92% stays HIGH (not asked).

## CHECKS (PORT 8789)
GREEN: old-tusker (35, +1 for OT.bz), boss-greed, boss-openings, boss-read, textfit skills,hud,hints,trial --strict (131 screens, 0), textfit store,pick,tree --strict.
RED, not mine: berserker `double chop 57.6 < 60` (pre-existing on master, left as told); mash-gate `oreroad: level changed since the mash bot ran` (oreroad, not wood; the wood mash row is fine and the boss module edit does not stale it).
No wood boss row needed re-stamping (levelHash is level data; unchanged).

## QUESTIONS FOR DANIEL
1. The fix is hero-keyed (Tusker bites the Berserker x2.2). REC and BUILT. Alternative: raise the boss's own damage a bit for everyone, but that would push warden/pyro (already 58%/42%) lower.
2. Knight is 11/12 (92%) on the same boss; a similar knob (`bz`-style) could be added for the knight if you want it in band too.
3. Berserker deaths now come from charges: if x2.2 reads as too punishing in play, x1.8 gives ~80% at n=12 (noisy).
