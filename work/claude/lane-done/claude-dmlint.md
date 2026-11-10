# DMLINT - READY (code + node proof; no browser), branch claude/dmlint off claude/dmcore 9f55d12aa

## Built
- tools/dir-mix.mjs: per ACTS level, does the foe mix hold >= 1 UP / DOWN / PLUNGE asker (plan section 8 item 6). FAMILY read from main.js (so DMFOES edits flow in).
  UP = wing family + leap-swat kinds (every common foe with an ANSWER row whose mode matches leap|pounce|dive|hop|jump|drop; boss/mini and elite-kit rows excluded; 'chop' is not 'hop'; plus hound/hopper/spider/lurker/raptor/harpy/gar by name).
  DOWN = high-guard kinds (guard family + shield uniques) + small family. PLUNGE = plate + shell + helm kinds + beast family.
  Flags: default = DM.on true (flip state), --live = DM.on false (ships today), --quiet, --strict (exit 1 on a miss in --act=1,2 default), --act=.
- Swaps: src/cast-pass.js DM_SWAPS (rows applied only while DM.on; the existing cast-pass machinery; optional dy lifts a flier). src/level.js wraps a level that has DM_SWAPS rows.
  - underleaf (act I, UP miss): the plain sprig at x350-362 -> wasp, lifted 4 tiles (potion garden wasp).
  - rookery (act II, DOWN miss): the gully fledgling (x<=80) -> rockgoblin (crag kind, before the Goblin Queen; scree/spire/moor already hold it).

## Lint results (53 ACTS levels)
- BEFORE (--live, nothing swapped): 13 levels miss. Acts I-II: underleaf (UP), rookery (DOWN). Acts IV-V: towpath DOWN; canal UP+DOWN+PLUNGE; fair UP+DOWN; burial PLUNGE; unburied PLUNGE; caravan, welltown, buriedcity UP+DOWN+PLUNGE; underwell DOWN+PLUNGE; glasssea UP; sealedpyramid PLUNGE. Act III: none.
- AFTER (DM.on): 11 miss; acts I-II = 0 (`node tools/dir-mix.mjs --strict` exits 0). Remaining are acts IV-V, out of this lane's scope (unbuilt/not act I-II).
- Proof it is flag-gated: with DM.on false the built levels hash identically (level-quality underleaf rookery: CLEARS THE BAR, pilot/mash hashes still valid); tools/dirmoves.mjs 58 OK. With DM.on true: level-quality rows all ok EXCEPT pilot + mash, which fail only as "level changed since its pilot ran" (stamp hash) - re-stamp at flip (browser). foe-cast-lint, goblin-lint, answer-tags, pack-mix unchanged/green with DM.on true.

## Listed, NOT applied (acts IV-V; recs, level lanes own them)
- Many act V misses are because desert kinds sit in no FAMILY (scorpion, slinger, cutthroat, stray, vulture, ambusher, sandworm, skitter, mummy): DMFOES/foe lane should classify them (rec: scorpion + skitter = small (DOWN), vulture = wing (UP), mummy/construct = plate or beast (PLUNGE), cutthroat = crew); that clears caravan/welltown/glasssea/sealedpyramid/underwell without touching a level. buriedcity too.
- towpath DOWN: swap a plain archer -> sapper-free 'wight' or a 'heavy' (guard) behind a lock; canal: needs all three (grindylow/willowisp/snuffer/archer only): rec snuffer->watch (high guard), willowisp->petrel-style wing already UP-ish only if a wing kind exists in water (eel/angler), add 'urchin' (shell, PLUNGE); fair: mummer->watch? no - rec hobbyhorse/stringjack classified small (DOWN) and a bat/haunt as UP; burial/unburied PLUNGE: swap one zombie -> armour (plate, undead-plausible) ; these are theme calls, not applied.
- Lint caveat: the high-guard/helm lists are the plan's; DMFOES may extend them. Lint reads FAMILY live, DM-only sets are constants at the top of tools/dir-mix.mjs.

## Owed / questions (rec first)
1. Browser walk of underleaf + rookery with DM.on true (wasp placement over the yard end; rockgoblin at the gully floor reachable/fair), then re-stamp pilot + mash. (Rec: fold into the DMFLIP lane proof.)
2. Classify the desert kinds into FAMILY (rec yes, DMFOES follow-up) - cheaper than 8 level swaps.
3. Make dir-mix --strict a gate in tools/check.mjs for acts I-II after merge (rec yes; not done here, check.mjs forbidden this lane).
