# claude/paladintune - PALADIN TUNE (Sonnet, 10-15/16). Base origin/claude/paladin4art b04fe64d. Port 8958.

## STEP 1 - HEALS CUT ~80% (built)
| Source | Before | After |
|---|---|---|
| Hallowed aura / circle, owner (HG.heal) | 2.0% max hp/s, any circle | 0.4%/s, ONLY in the aura (the circle lit by SPENDING Conviction); a plain stamina-planted circle no longer mends its owner |
| LITANY (x2 of the above) | 4%/s | 0.8%/s |
| Partner in a circle / in a step or Verdict patch | 1%/s / 3%/s | 0.2%/s / 0.6%/s |
| RADIANCE+ (4 pips spent) | +6% max hp | +1.2% |
| SANCTUARY talent (holding the ward) | 3 hp/s | 0.6 hp/s (desc reworded) |
| HOLY WRATH skill | 1.5% per blow | 0.3% per blow |
Prayer/kneel give Conviction, never health (unchanged). What remains is tied to spending Conviction (aura, Radiance+) or to a talent/skill you pay for.

## RATES (12 seeds, boss-rates practiced, --profile=human, L3 bosses, --jobs=1; knight untouched)
| Boss | Knight | Paladin (step 1, kept) |
|---|---|---|
| wood | 10/12 | 9/12 |
| stockade | 5/12 | 6/12 |
| marsh | 11/12 | 12/12 |
| burning | 8/12 | 10/12 |
Total 34 vs 37. Paladin 4 was 12/12 (3 seeds) so step 1 alone brought him within 0-2 seeds of the knight on each boss, never 0/N. L1 normal-health row (Bullfrog/marsh): the paladin wins again (37.6 s, 104 of 120 taken, 19 left) - the row is MOVED BACK to the paladin in tools/normal-health.mjs (assertions unchanged).

## STEP 2 - TRIED, NOT KEPT (measured, 12 seeds, paladin only)
- Light-ward big 0.25 -> 0.18 alone: wood 9, stockade 10, marsh 12, burning 10 (no weaker than 0.25 - seeds shuffle; the break rarely fires on L3 bosses). Reverted to 0.25.
- + bot taps Twin Smite at 2 pips in smite reach: wood 10, stockade 9, marsh 12, burning 12 (stronger). Reverted.
- Dawnfall mul 0.6 -> 0.4: rates identical (the bot almost never plunges), so no evidence; reverted.
Final state = step 1 only (+ the normal-health row move).

## CHECKS (port 8958, one at a time) - all green
paladin-kit, normal-health (paladin row), hero-trials, mash-gate (47 levels), commitment (238 rows), boss-openings, textfit hints,hud,practice,pick,tree,store --strict (all 0). Reds: none (one transient 'fresh lab page did not initialize' on a paladin-kit run, green on rerun).
TEST-EXPECTATION CHANGES (design change, stated): paladin-kit aura mend > 0.5 -> > 0.1 over a second, Radiance+ mend >= 4 -> >= 1 (the mends are 5x smaller by design); normal-health row hero pyro -> paladin.
Note: the first 48 fights ran as a background job that died once mid-marsh; marsh+burning were rerun in full.

## QUESTIONS FOR DANIEL (rec = built)
1. Heals: 80% cut, aura-only for the owner. Rec: keep; if he still feels sturdy, next lever is Radiance+ mend to 0 or aura 0.4 -> 0.2%/s. Alt: remove the aura mend outright.
2. Light-ward break 0.18 not applied (no measurable change). Rec: leave 0.25. Alt: apply 0.18 anyway for feel (heavies break the ward more often).
3. Bot Twin Smite at 2 pips: not taught (it inflated his rates). Rec: leave out of the standard bot; players will use it, so the real paladin may feel stronger than the bot says.
4. Rates here are the lab bot on L3 bosses only; a human-feel check on the late bosses is still owed.
