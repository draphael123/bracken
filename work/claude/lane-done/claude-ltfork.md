# LTFORK lane report (claude/ltfork, from master 9ff9bd70) - 11-04

## What changed
Brief lategame2-1104 sec 1 (fork framework) + the sec 2 ROAD TO L50 strip. Framework only: NO B techniques exist yet, so the Knight is still one technique per level and nothing changes in play until a hero lane adds a `{fork: [A, B]}` entry.
- src/progression.js: `FORK_LEVELS` [30,40,50], `CAPSTONE_LEVEL`, `techniquesAt(h,n)` (pair), `techniqueFor` still returns A, `techniqueById` searches both, `techniqueLevel`, `isFork`, `forkSiblings`, `forkTaken`, `forkLocked`; `techniquesArriving` flattens pairs. A fork level's card is the PAIR only (A rec, B not), no perk/upgrade to put it off; a skipped fork is re-offered as a pair on the next tech card. `pickMilestone` refuses a locked sibling. `validateProgress` ignores (drops the higher key of) a clashing sibling pair, never errors. `respecForks(p,h)` clears only fork picks (keeps stats, upgrades, fixed moves; same price). `grantForkRepick` in migrateProgress: one free re-pick (`cardFree[h]=1`) for a save holding a fork-level pick. `roadToL50(p,h,lv)` data for the strip. No new save field, no version bump. Marker: respecCard now sets `cardFree[h]=0` instead of deleting it, so 0 = "free respec already spent" and the grant is idempotent (side effect: a hero whose free respec was spent earlier and who holds a fork pick gets ONE more free re-pick when a real fork ships - intended).
- src/main.js: card title "CHOOSE YOUR PATH" and "PICK ONE, THE OTHER LOCKS" / "CAPSTONE" labels on fork options; respec: first X arms, UP/DOWN while armed toggles FORKS ONLY vs FULL (only offered when a fork pick is held), second X runs it; `drawRoadToL50` strip (six pips L25-L50, taken = green with the pick, fork shows both names with X on the locked one, L50 gold frame "CAPSTONE").
- tools/tech-cards.mjs: shape check flattened for pairs; 9 new fork checks (a synthetic pair is injected on the knight and removed): data shape, pair-only card, deferral, lock refusal, forks-only respec, free re-pick granted once, clash ignored, road data, knight unchanged.

## Commits (pushed to origin claude/ltfork)
1. ltfork 1: fork data + checks. 2. ltfork 2: card UI, respec toggle, strip. 3. this report.

## Checks run (node only; GATE flag existed, no browser)
- node tools/tech-cards.mjs: PASS (incl. new fork checks). tools/progression.mjs PASS. tools/coop-progress.mjs PASS. node --check src/main.js and progression.js OK.

## Owed (browser / not done)
- tools/textfit.mjs and a visual look at the card + strip (rows: perks line cut to 1 line when the strip shows; strip y = VH-46, pip h 31, help line at VH-12 - verify no overlap at L50 with long names). hero-keys-sheet, weapon-skins, mash-gate not run.
- tools/ability-law.mjs does not exist at this commit: the pair rules (a)-(e) asserts are NOT added; to be written with the first B techniques.
- NOT built: B techniques (incl. Knight fork pack), capstone content/effects, "HOLD X TO SEE IT" capstone preview clip, Arena Yard TRY station, co-op snapshot of tech ids / AI companions taking A (companions have no capstone), strip on the controls card and respec screen, the one-line "trade" text on fork cards (field `trade` is wired in the offer, drawn nowhere yet).

## Questions (recs held, none blocking)
- Q1 respec: built the rec (forks-only toggle on the same price). Q2/Q3/Q6/Q8 as the brief recs; Q8: framework ships dormant until the Knight B entries land.
- Knight fork pack: rec = a sonnet follow-on lane (needs B effects in main.js, not just data), after this merges.
- Forks-only respec clears fork picks only, not the fixed techs "above" them (brief wording ambiguous): rec keep.
