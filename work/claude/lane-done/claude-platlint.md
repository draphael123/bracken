# PLATFORMING LINT lane report (claude/platlint, base 416af6c2)
Built: platforming(r) + PLAT in tools/pacing.mjs (pacing() now also returns kind, foot, spikeSeen, Lref; --json strips them); tools/platforming-lint.mjs (REPORT-ONLY, exit 0 always; table, --where <id>, --json=, --self-test with 7 fixture checks: pass / fail / fight-inside / two clumps / hazard swim / plain swim / swim with fight). Runtime ~11 s, no browser.
Hazard swim (Daniel 10-31) = 48+ route tiles of swimming, no fight stretch, touching harm-water pools, L.deep currents, hot vents or spikes. Plain swims do not count (shown as plainSwims in --where).
NEW TOTALS (0 / 1 / 2+ of 53): jump-only 21 / 12 / 20 (matches the audit); WITH hazard swims 17 / 14 / 22.
Swim sections found: Long Water (1), Reef (1), Deep (2), Keep (2). Long Water and Reef move 0->1; Deep and Keep 0->2+. Harbor has no harm/current/spike swim: still 0.
Still 0 (17): wood rootway burning hanging oreroad minecart warcairn hurricane causeway harbor canal theatre fair church caravan welltown glasssea.
Exactly 1 (14): hornetsnest fenroad spore palisadewood kings rookery undercrown kitchengate longwater reef flotilla lamplit towpath underwell.
Suite: NOT added to tools/check.mjs (it has no report-only category; rule-state.mjs report-only lists are per-rule maps for level-quality/curve). Run by hand.
QUESTIONS: (1) swim length 48 tiles (6 stretches) per the audit rec - OK? (2) Long Water/Reef/Flotilla swims were already flagged hazard by pool.harm/flow; Deep/Keep via L.deep.currents - confirm currents should count as "current" (assumed yes).
