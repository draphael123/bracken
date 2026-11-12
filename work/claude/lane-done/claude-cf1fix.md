# CF1FIX (06:41 11-12) - branch claude/batch165 (same worktree bracken-batch165), commit 4c6697ae8 pushed. NOT merged, NOT deployed.
## Brief intent
prepcf1.md proof step 4: "One 8 s clip per demo hero ... heavy (glint at half charge, white flash on hero at full" and What's New "heavy swings flash when fully charged" = every hero. The only limiter was claude-cf1.md line 13 (design note: knight's cut-stage rings 'already give the 50/full read'), not a rule. So all five staged heroes done, knight included.
## Change
- src/cf-impact.js:75-77 new pure stageCue(st, halfSt, fullSt, state) (flag off = nothing; glint once, flash once).
- src/main.js: cf1Stage() helper ~11027 (glint particle + P.cf1FlashAt); call lines 10391 ranger, 10399 berserker, 10406 geomancer, 10415 reaper, 10423 knight, each 'if (CF1_SHIPS) cf1Stage(...)' before that path's return; import line 175; reset of P.cf1Full beside P.cf1Half in updateCharge else (10430ish).
- No damage, stop, kick, tier, timing change. Visual only (1 particle, 1 tint window).
## Hook coverage (glint tier / flash tier)
| hero | path | glint | flash |
| pyro, warden, paladin, others | plain k (glintDue) | k>=0.5 | k>=1 (unchanged) |
| knight | cutStage 0/2/3 | stage 2 | stage 3 (only if quake ready; else stage 2 is the max) |
| ranger | rgTier 1-3 | tier 2 | tier 3 |
| berserker | bzTier 1-3 | tier 2 | tier 3 |
| geomancer | geoTier 1-3 | tier 2 | tier 3 |
| reaper | bkTier 1-5 | tier 3 | tier 5 |
Tier choices are mine (middle / top tier); say if Daniel wants the first tier for ranger (its 'full draw' is T1).
## Tests (node only)
tools/cf1.mjs +15 lines: per hero ON = exactly 1 glint at half tier + 1 flash at top tier over 30 frames per tier, a fresh charge cues again, below top no flash; OFF = 0 cues, state untouched; greps: each path has exactly one flag-guarded call before its return. node tools/cf1.mjs OK, juice2 OK, node --check main OK, modulepreload ok, whatsnew data ok.
## What's New 165
6 lines, all <= 83 chars, unchanged; line 4 'heavy swings flash when fully charged' now true for all heroes. No edit needed.
## Disclosure
I ran tools/whatsnew.mjs to check the data line; it opens a headless page (cdp openPage), my mistake (grep'd juice2 only). It passed and exited; no Chrome of mine remains; no kills.
## Browser checks still owed (RAM permitting, one at a time)
node tools/cf1-sight.mjs for each of knight, ranger, berserker, geomancer, reaper (flag ON): probe cf1Half true at the half tier, cf1FlashAt set at the top tier, near-white px count rises, and nothing repeats per frame; plus pyro/warden regression. Ranger/reaper: confirm the top tier is reachable in the scene (reaper T5 needs a long hold). QUICK gate, Rootway question from rel165 still open.
