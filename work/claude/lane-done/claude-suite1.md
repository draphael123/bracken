# SUITE1 11-11 - tiers, retire, shard (tools only; branch claude/suite1 @ 2e2aed8e5, pushed, not merged, no browser/suite run)
Base master c395681de. Verified with node --check on check.mjs / godmode.mjs and `node tools/check.mjs --dry ...` (new flag: prints the chosen list + committed timings, spawns nothing, not even the profile sweep).

## Retired (Q6 + audit RETIRE list)
- Unregistered from check.mjs (files kept): relics (47 s), drawn-solids-sweep (185 s).
- godmode: browser half deleted (44 s -> ~0); the 10-07 rename asserts stay in Node (tools/godmode.mjs). Now a deploy node check.
- zipline: gate runs 3 heroes (knight,warden,pyro) via CHECK_ARGS in check.mjs: 323 s -> ~100 s (timings map set to 100000 as an ESTIMATE until a timed run; godmode set to 300 ms). `node tools/zipline.mjs` alone still plays 7.
- textfit (scoped) + textfit-levelcard: out of nightly -> FEATURE(textfit); textfit-full stays nightly. (849 s)
- infra four (profile-cleanup, cdp-recovery, load-leak, profile-leaks): out of nightly -> FEATURE(infra) + WEEKLY (758 s).
- BUG FIXED on the way: the maker list line in check.mjs repeated the whole check list and passed every maker tool the stray argv `num-display lives unlocks starter-skill sporeclear-locks gormburn`, which maker-sweep / maker-bosses / maker-fuzz read as their filter / op count (likely part of why maker-sweep and maker-bosses were "perennial reds"). Now 18 clean maker lines. Watch the first weekly maker run: they may now go green, or show a real red that was hidden.

## Tiers (tools/check-tiers.json; no tag = nightly only; a check absent from check-timings.json is also deploy)
`node tools/check.mjs --tier=nightly|deploy|weekly|all|feature:<maker|textfit|infra> [--also=a,b] [--shard i/n] [--jobs --max-browsers] [--dry]`
- DEFAULT (no args, so `npm run check` and scratch/nightly.sh) = nightly tier. Naming checks (`-- tower,tome`) runs them whatever their tier, as before.
- Shard balance now counts only registered checks in the chosen tier (retired ones left in the timings map no longer take a slot). Shards 1/2 and 2/2 verified disjoint.
- DEPLOY: syntax parses only files changed vs origin/master (falls back to all if git fails) + 210 node checks + 19 browser smoke pages (firsthour, level-complete, save-safety, save-slots, death-screen, uiscreens, settings-tabs, loading-screen, ui-hud, fonts, map-footer, music-start, admiral, pyro-kit, blood-kit, one-dodge, weak-bosses, boss-greed, rule-openings) + new checks + --also. boss-music (120 s node), syntax full parse, railsparallax, checkpoint-gaps are nightly-only (unless --also).
- WEEKLY (weekly-only extras): 18 maker-* + the infra four. FEATURE(maker) = the 18 maker checks.

## Projected minutes (committed timings, serial CPU; --dry output)
| tier | checks | serial min |
|---|---|---|
| DEPLOY (no --also) | 231 | 14.7 (target < 15 met; +each --also check, e.g. boss-jump +9 min) |
| NIGHTLY (all) | 484 | 233.9 (was 277) |
| NIGHTLY shard 1/2 | 242 | 117.0 |
| NIGHTLY shard 2/2 | 242 | 117.0 |
| WEEKLY extras | 22 | 20.3 (maker 18 = 7.6, infra 4 = 12.7) |
| FEATURE textfit | 2 | 14.1; FEATURE maker 18 = 7.6 |
Wall: 117 min per PC serial; with --jobs=3 --max-browsers=2 (audit factor ~1.7) ~ 70 min per shard. To reach < 60 min the merge lanes below must land (they take ~45 min of serial CPU off).

## release.sh (scratch/release.sh, backup release.sh.pre-suite1) - DONE, small + backward compatible
QUICK=1 now runs `node tools/check.mjs --tier=deploy --also=<tool names the batch changed>` when tools/check.mjs has the tier option; otherwise (old branch) it falls back to quicklist.cjs exactly as before. quicklist.cjs is now unused for new checkouts. nightly.sh needs NO change (default = nightly); for two PCs run `npm run check -- --shard 1/2 --jobs=3 --max-browsers=2` on the laptop and `2/2` on the desktop (SA11 recipe + prove serial==parallel verdict).
Note: a nightly red is rerun alone by nightly.sh via `node tools/<name>.mjs`; weekly/maker reds work the same.
Owed: scratch/weekly.sh does not exist - one weekly job should run `npm run check -- --tier=weekly`. The deploy node set is an explicit list (generated from the audit's node/browser classifier): a NEW node check is covered by the "not in timings" rule only until its first timed run; SA4 should make the timings updater keep the deploy tag.

## Follow-up lanes (not done here)
1. Shared-page runner merges (audit section 3): boss sweep, per-level sweeps (room-kills / no-hidden-hits / corpses / small-adds), maker-* into 2 pages, crouch family (7), hero-kit pages, buried, probe/runtime, UI/HUD, music, visible-supports + strict (177 s: fold in one run).
2. SA4: boss-music 120 s in a "node" check (find why), syntax cost, timings updater keeps tiers.
3. Brittle-number rewrites (section 4): levelling, drowned-knights, commitment, riposte, boss-openings, geomancer, gear-tiers, level-quality / foe-glue warn-not-fail, etc. (Q3: ranges/invariants unless a '!!' line).
4. SA1 proof of the page-GC default is already on master (Q4); boss-openings x3 / riposte x3 crash proof still owed.
5. After the first timed nightly: refresh check-timings.json (zipline/godmode estimates), re-balance shards.
