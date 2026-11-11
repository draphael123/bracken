# traitbatch - READY (code-only, node-checked; flags still OFF)
Branch claude/traitbatch, worktree bracken-traitbatch. Base claude/batch157 0c362dbec; merged claude/traits 2bc1c3614 then claude/charms2 a1cd954e9 (both --no-ff). Not merged to master, not deployed. Tip: see `git rev-parse claude/traitbatch` (pushed).
## Conflicts
None. Both merges were clean (charms2 auto-merged src/main.js; traits touched files batch157 did not conflict with). TRAITS_SHIP=false, CHARMS2_SHIP=false unchanged. No code edits made.
## Checks (node only)
- node --check: main, traits, traits-b, progression, charms2, store, unlocks, art, geomancer, berserker all ok.
- FLAG OFF, exit 0: traits, charms2, save-safety, save-future-guard, level-quality, skill-passives, progression (180 nodes/36 fixtures), talents, hero-ledger, coop-progress, architecture, unlocks, shop-gates, progression-runtime.
- FLAG ON: traits.mjs and charms2.mjs force the flags on themselves (setTraitsShip/setCharms2Ship) and pass. The rest re-run through scratch\tb\on.mjs (sets both flags, then imports the tool): all exit 0. Caveat: most of those tools do not read the flags, so the ON re-run adds little beyond traits/charms2.
- progression-economy.mjs is a BROWSER tool (I ran it by mistake): page crashed (Inspector.targetCrashed) identically on bracken-batch157, so not a merge issue; owed. It exited quickly; I started no other processes.
- tools/check.mjs NOT run.
## TRAITTUNE needs next (browser, after the gate)
- Bosses (passiveplan sec 6, 8): FROG KING (L3), CHIEFTAIN (L4), GOBLIN QUEEN, CRUSADER, MAGE'S FOLLY boss, DEATH KNIGHT, KRAKEN, RAM LORD (campaign levels via boss-level.mjs).
- Baseline rows: tools/boss-rates.mjs practiced + built, NORMAL, kit flasks, n=6, heroes knight/warden/pyro (+ ranger, geomancer on L20+ fights), TRAITS_SHIP off vs on (bots wear defaults via ?traits= / campaign-kit). Expect early ~0 change; widen to n=12 only where a boss leaves 60-70% with flasks. Levers: trait numbers (rank III = today, never buff above), boss damage/tells, never resist < 0.4x; forks OFF.
- Owed browser items from traitmerge/charms2: geomancer.mjs, berserker.mjs, crouch tools, textfit for TRAITS tab + CHARMS rows (14 charms, phone width), level-up line wrap L2/L10/L20, feel (air roll, executioner, jetWalk, looter, ?charm=...), co-op + PvP smoke flag on, store.mjs/store-ui, tune check that no hero's BEST pair is two shared traits.
- Daniel playtest: Goblin Queen, Mage's Folly, Death Knight on the flipped build before the flip is live (bot never pogos/air-rolls/plays purse).
## Open questions (rec first)
1. Flip order for the demo: TRAITS_SHIP only after TRAITTUNE + playtest; CHARMS2_SHIP independent, after Daniel OKs scratch\lane-reports\charms2-icons.png and a phone-width shop check. REC yes.
2. Paladin stays unsplit (all passives on) while TRAITS_SHIP is on. REC yes until the paladin rework lane lands; do not flip before that, or accept the demo with paladin unsplit.
3. progression-economy.mjs crashes the page on both batch157 and traitbatch: REC re-run after the gate with RAM free before treating it as a regression.
