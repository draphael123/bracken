# traitmerge - READY (node-checked; dark behind TRAITS_SHIP=false)
Branch claude/traits off claude/traitframe f00464b6c; merged traitdata-a (clean), traitdata-b, sharedtraits. Worktree bracken-traits. Not merged to master, not deployed.

## Conflicts and resolution (every lane's rows kept)
- traitdata-b merge, src/traits.js: NEW_TRAITS block (A) + `Object.assign(TRAIT_SPLIT, TRAIT_SPLIT_B)` (B) both kept. The `pyro: null,...` stub line auto-merged (B's rows override via Object.assign after the literal).
- src/traits.js traitRows row() and traitUpText: A's `traitWord` (words overrides) and B's `nameOf`/`tagOf` both exist. Resolved: row = Object.assign({}, traitWord(h,id), {name: nameOf, tag: tagOf, ...}); nameOf now also honours split.words[id].name (flag on only), so geoBulwark DEEP ROOTS and bzPrice RED FEAST both show. Level-up text uses nameOf.
- main.js ~31560 (rg/bz damage lines): took B's bzSplit `1 + trk('bzSplit')` and A's rgLast `trm(2,'rgLast')`.
- sharedtraits merge, main.js ~9390: kept A/B's ranked turncoat/brand/emberHeart lines + shared lane's EXECUTIONER line (flag on = any hero's heavy/finisher, never boss/mini). tools/traits.mjs: both imports + console line.
## Fixes
- parryCut rank: counterCut(f,'RIPOSTE', trk('parryCut')); counterLand already scales by c.k, so it shares the function with COUNTERSTROKE per wearer (70/85/100% of a swing; flag off trk=1 = today). parryCut removed from the rankless exemption.
- swash / winnow: already ride the shared rows (airRoll legacy pirate:'swash', execute legacy reaper:'winnow'); the AIR ROLL site reads tal('airRoll') generically and EXECUTIONER is hero-agnostic, so no extra main.js change. Asserted.
## tools/traits.mjs additions
All 8 split heroes (paladin stays null): exact split set; two distinct defaults, each his own trait, never shared, no pair of two shared; defaults on at L20, shared six off unworn; every catalog passive accounted for; rank 0.7/1.0 on every trait id; pirate wears shared AIR ROLL / reaper wears shared EXECUTIONER; parryCut site; FLAG OFF: traitScale exactly 1 for every trait/folded/merged id at L1/10/20/40 and catalog names unchanged for all 8.
## Checks (node): traits, talents, hero-ledger, skill-passives, progression (36 fixtures), coop-progress, architecture ok; node --check main.js traits.js traits-b.js progression.js ok.
## Owed (browser / tune lanes)
geomancer.mjs, berserker.mjs, crouch tools, textfit for TRAITS tab (DEEP ROOTS, RED FEAST, tags NEEDS THE JET / NEEDS BLOODWORMS, CLEAR region labels), level-up line wrap at L2/L10/L20, jetWalk pace rank I/II, looter/dueRites chance feel, worm radius, pirate/reaper/warden air roll + executioner feel (?traits=airRoll,execute), co-op + PvP smoke with flag on, boss-rates trait on/off (TRAITTUNE), tune check that no hero's BEST pair is two shared traits (assert only covers defaults), check.mjs full suite.
## Questions (rec first)
1. Paladin stays unsplit (all passives on) while the flag is on? REC yes until the rework lane lands; flag must not flip before that.
2. Pirate/Reaper folded ids (parryCut, turncoat) are wearable folded rows with provisional fork keys. REC fine until FORKFRAME.
