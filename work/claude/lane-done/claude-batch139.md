# claude/batch139 - BATCH139 INTEGRATION PREP + KING GORM TUNE (11-02/03)
Branch claude/batch139 (worktree bracken-batch139) from master ca825000. NOT merged to master, NOT deployed. Tip: `git rev-parse claude/batch139`.

## Merges (hand resolutions)
1. claude/jointtune139 (c3e915f2; contains hornetsnest2art, beast3art, smallfix9/heroestune, BOSS_TRIM). Conflicts in 3 files:
   - src/main.js (imports): kept master's juice.js import (HEAVY_TAGS) + jointtune's progression.js import (SECOND_SLOT_LEVEL, techOn, upgRank, milestoneName, isTechLevel, isUpgradeLevel, techniqueById).
   - src/pyro-art.js: fx() life table = master's (land, fizzle) + bigblast 0.62; both drawFx branches kept (land/fizzle AND bigblast).
   - tools/check.mjs: master's check list + 'hornetsnest-fog'.
2. claude/demotransitionsart (87d4916d): one conflict, tools/check.mjs list: took the side with 'demo-transitions' (superset). src/main.js, transitions.js auto-merged.
   No generated tables (marks.js) changed by either branch: nothing to regenerate.

## Wiring done
- Hornet's nest L.crumbles: ALREADY wired in jointtune139 (crumbleInit + updateCrumbles for L.hornetsNest); nothing more to do. hornets-nest 267 + fog 15 green.
- SFX.gormRage now plays at Gorm's rageTell start (src/gorm-king.js rage branch: gormRage, falling back to warCry/roar). It already played at the P1 flee (gorm-hands).
- docs/updates.json: batch 139 entry (5 lines, 2026-11-04 placeholder date - set the real ship date).
- Restamp: no level hash changed by this batch (src/level.js diff is trial-yard text only, trials are excluded). `restamp --all --dry` lists 14 stale pre-existing rows (wood/spore/hanging/spire/moor/flotilla/causeway/oreroad/underwell/minecart curve/pilot) = same set master carries; NOT restamped (not touched by this batch; wood curve is the one the Old Tusker trim could move).

## King Gorm tune (BOSS_TRIM king)
Gorm (kings, L9, practiced, human profile, flasks kit, normal), pooled n=60 per row (kn/wa/ra/py/ge):
| state | knight | warden | ranger | pyro | geomancer | pooled |
|---|---|---|---|---|---|---|
| jointtune139 (pre-Gorm-3 rework) | 6/6 | 6/6 | 6/6 | 6/6 | 5/6 | 97% (n=6) |
| BEFORE (batch139, no trim), n=12 | 8/12 | 7/12 | 6/12 | 9/12 | 3/12 | 33/60 = 55% (LOW) |
| trim dmg 0.9, n=12 | 9/12 | 10/12 | 8/12 | 10/12 | 5/12 | 42/60 = 70% |
| FINAL trim dmg 0.95, n=12 | 8/12 | 11/12 | 10/12 | 10/12 | 4/12 | 43/60 = 72% (top edge) |
Lever: src/boss-pressure.js BOSS_TRIM { king: { dmg: 0.95 } } (eases the damage dial 5%; no resist/tell/opening change, floor untouched). Gorm 3 rework had already moved him from 97% to 55%; the trim lifts him into the band top. Rounds swing +-10 (0.9 and 0.95 are statistically the same); 0.95 kept as the smaller change. Geomancer is the low hero on every boss (4/12 here).
Burning Pyromancer (burning, L5, no change, n=6 per hero): kn 3, wa 6, ra 2, py 5, ge 1 = 17/30 = 57% (just under band; mash deaths fell after the 138 restamp). Not tuned.
Logs: scratch\lane-reports\batch139\ (g0,g1 before; h0,h6 at 0.9; i12,i18 at 0.95; p0 pyromancer).

## Checks (one at a time)
GREEN: whatsnew, level-quality, curve-gate, mash-gate, demo-transitions (113), gorm3, gorm2, gorm-reenter, hornets-nest (267), hornetsnest-fog (15), node --check on every merged file.
RED (pre-existing in jointtune139, passes on master ca825000): tools/boss-openings.mjs A11 (moor windcaller): "braced through his howl, his own wind fails him and he falls" - the held case never falls (braceT 1, mode goes on to hurl/devilTell). Likely the knight's block became the 'shield' guard chain (controls.js, claude/knightid) so BK.keys.block brace no longer counts as a brace. Owed: fix test (brace with the hero's brace key) or the windcaller's brace read. Not fixed here (out of scope); same failure on bracken-jointtune139.
NOT RUN: full suite, textfit, perf, mark-integrity, any gate.

## Owed / questions (rec built)
1. boss-openings A11 red (above). REC: a small fix lane before the gate.
2. Gorm rate 72% is at the top of the band with geomancer 4/12: REC accept; geomancer tune lane (also hornet/tusker/beast).
3. Stale pilot/curve rows (14) pre-existing: REC one restamp lane after BATCH139 (wood curve first).
4. updates.json date: REC set to the actual ship day.
5. Burning Pyromancer 57%: REC leave (inside noise of 60).

## FINISH (geotune merge)
Merged claude/geotune (conflict only in tools/boss-run.mjs, resolved). A11 windcaller red fixed: anti-kite clock was shortening the howl and the fall (src/main.js windingUp + kite skip). Geomancer restamp: no gated rows use her; docs/geomancer/pilots.json refreshed. Hornet Queen pooled 78% -> 76% with BOSS_TRIM dmg 2.0 (still >70, Ranger 12/12). All 12 listed checks green (page crashes retried). Full detail: scratch\lane-reports\batch139-integ.md.
