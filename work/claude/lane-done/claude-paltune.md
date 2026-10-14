# claude/paltune - PALADIN 2 boss tune (sonnet)
Only his numbers changed (src/holy-ground.js; one line in src/main.js): HG.bossBurn 0.3 (circle burn on a boss x0.3), HG.hitMul 1.2 -> 1.3, HG.bossOutMul 1.0 (inert hook, main.js swingDmg).
Method: human profile, kit flasks, campaign level, practiced, 12 seeds, --jobs=1. Paladin re-run only; knight column = base.json (knight code untouched).

| boss | knight s | paladin before | paladin after | after vs knight |
|---|---|---|---|---|
| wood | 86 | 62 (-28%) | 82 | -5% |
| stockade | 39 | 34 (-13%) | 36 | -8% |
| burning | 104 | 58 (-44%) | 72 | -31% RED |
| canal | 93 | 104 (+12%) | 98 | +5% |
| undercrown | 52 | 90 (+73%) | 91 | +75% RED |
Win rate paladin 12/12 on all five (knight 12/12, 10/12 stockade, 12/12 others); paladin sits above band (HIGH +40) as before the tune.
Checks: paladin-kit ok, skill-icons ok, settings-tabs ok. Mash spot (wood, burning, undercrown, paladin x2): all lost.
## Reds
- burning (-31%) and undercrown (+75%) are not circle-driven: bossBurn/hitMul/off-circle multiplier barely moved them (tried bossOutMul 1.35: made stockade a 8 s one-shot + one 240 s timeout, no undercrown gain; reverted). Needs a boss-specific or hero-kit fix (undercrown: why his maul is slow there), not another global knob.
- Stockade is bimodal (15-60 s) for both heroes.
- Mash stamp for wood needs re-run (level hash changed on the yard ents, pre-existing).
## QUESTIONS FOR DANIEL
1. Ship as is (REC; 3 of 5 within 20%) or hold for a per-boss fix on burning/undercrown? BUILT: ship.
2. Paladin wins 100% vs the knight's 83-100%: accept given he is a zone-holder? REC accept.
