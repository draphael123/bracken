# REL165 (11-12 08:15-09:00) - PART A LIVE, PART B READY
## PART A - batch165 = ROOTWAY (Huntmaster) TUNE ALONE: **LIVE**, sha ba893b255
- Worktree bracken-rel165 off origin/master c2424c597 + merge claude/roottune 5908ac741 + What's New 165 (wn-add, 3 lines, tag rootway): "Rootway's Huntmaster opens up for longer..." / "His staggered openings last about 0.8 s longer" / "A little more life on the Huntmaster...". Pushed as claude/batch165 (FORCE-replaced: the old CF1 batch165 tip 4c6697ae8 was first saved as claude/batch166, nothing lost).
- QUICK gate (deploy tier + combat-replay,demo-impact, shard 1/2 then 2/2 sequential via launch-detached, RAM 6.7 / 6.4 GB at launch): shard 1 = 120 of 120 ok; shard 2 = 121 ok + 1 FAIL map-footer ("dev server did not come up", infra) which PASSES ALONE (map-footer ok, 4 variants) = 122 of 122. demo-impact + combat-replay green. RESTAMPS: none needed (no demo pilot/curve/mash number moved; nothing got harder). Logs: rel165b/gate-s1.log, gate-s2.log (gate165b.ps1 wrote its live copy in rel165/).
- release.sh --deploy batch165: master = origin/master = ba893b255. First vercel attempt failed, retry ok ("ready"), verify 1/1 changed files match live.
- LIVE checks (bracken-nine.vercel.app): title loads (state 'title'), 0 console errors, src/build.js sha ba893b2 = master, docs/updates.json top entry batch 165 with the 3 lines (loadUpdates), src/huntmaster.js on live: stagLong 3.9, blowRef 20, hp 1145. Still: rel165b/live-title.jpg; live-updates.txt.
- Cleanup: removed worktrees bracken-rel165 and bracken-roottune (clean, merged). No branch deleted. df -h /c 15 GB free (94%).
## PART B - CF1 prep, branch claude/batch166 (pushed 4bdc218e7; NOT merged, NOT deployed)
Branch = old batch165 (CF1 ON, glint for all heroes) + merge of new master + What's New renumbered 165 -> 166 (wn-add add 166, 6 lines unchanged, check ok; master's 165 Rootway entry kept below it). CF1_SHIPS = true (src/cf-impact.js:7). Worktree bracken-batch165 (now on batch166) kept.
### Sight check (tools/cf1-sight.mjs, extended: SIGHT_HEROES=..., counts half edges and distinct flash values; real CDP 'x' key, sim hand-stepped, one 150-frame hold (reaper 520)). Stills in rel165b\sight\heavy-<hero>.png, sight.json, sight-ranger.json
| hero | glint (half) | flash (full) | once per charge? |
| knight | frame 29 | frame 50 (quake ready) | yes, 1/1 per charge (maxWhite 30, subtle) |
| ranger | 33 (after fix) | 38 (after fix) | yes after fix: 1 glint + 1 flash per draw, 2 draws in the hold |
| berserker | 54 | 83 | yes 1/1 |
| geomancer | 37 | 67 | yes 1/1 |
| reaper | 72 | 142 (tier 5 reached), 2nd cycle 365/435 | yes, 1/1 per cycle |
| pyro | 18 | 26 | yes, 1/1 per cycle (hold re-charges after the auto heavy: 2nd cycle 101/109) |
| warden | 18 | 26 | yes, 1/1 per cycle (maxWhite 25 = faint on the warden's pale scene; see Q) |
BUG FOUND + FIXED (4bdc218e7): the ranger flash could NEVER fire. rgTier() only returns 0/1/2, cf1fix called cf1Stage(st, 2, 3). Now (1, 2): glint at the full draw, flash at the steady window. src/main.js:10391 + tools/cf1.mjs (ranger tiers [0,1,2]); cf1.mjs OK. No kit/damage/timing change.
(Earlier flagged still true: warden tip stop 110 ms vs brief 65; shield throw/javelin heavy = CF1.1.)
### Boss rates, CF1 ON, merged branch, bare build WITH flasks (practiced, human, secs 420, seeds 1-12, --jobs=1, n=36 each; no retune). logs rates-<boss>-ON-n36.log/json
| boss | knight | warden | pyro | pooled |
| rootway (Huntmaster, with the tune) | 4/12 | 9/12 | 8/12 | 21/36 = 58% [42-73] |
| palisadewood | 10/12 | 8/12 | 4/12 | 22/36 = 61% [45-75] in band |
Rootway was 64% (flag off, roottune) and 42% (CF1 on, before the tune): CF1 costs ~-6 pts, inside noise; both rows keep every hero above 0. Palisadewood pyro 4/12 is the weak cell (knight 10/12), not tuned.
### Node/feel checks on batch166 (each alone, exit 0): cf1, juice, juice2, boss-openings, riposte, hero-pass all green (chk-*.log).
### VERDICT: READY for a CF1 release (flag already ON on this branch) - to do at release: merge/ff to master, QUICK gate (deploy tier + combat-replay,demo-impact, both shards), What's New 166 is in, deploy. Not verified: the gate itself on this branch, human eyes on the glint/flash (knight and warden flashes are faint by pixel count), co-op, sound, demo zip untouched.
## Questions (rec first)
1. Ship CF1 as batch166? REC yes (rates 58% / 61%, checks green, ranger fixed). 2. Knight/warden flash is faint (30 / 25 white px vs 200+ for others): REC leave, a human looks after deploy. 3. Palisadewood pyro 4/12: REC leave for the next boss-tune pass.
