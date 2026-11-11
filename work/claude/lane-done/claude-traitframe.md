# claude/traitframe - TRAITFRAME (plan passiveplan.md section 7 lane 1) - READY (node-checked; browser checks owed)
Everything is DARK behind `TRAITS_SHIP=false` (src/traits.js). Flag off = today's game exactly (tools/traits.mjs asserts passiveOn identical for all 9 heroes x every passive x levels x owned/not). No version bump (still 2); p.traits is an extra key.

## Built
- NEW src/traits.js (pure; imports only the catalog): TRAITS_SHIP, traitsShip()/setTraitsShip() (tools/lab only), RANK [0.70,0.85,1.0], RANK_AT [0,10,20], traitRank/traitMul, TRAIT_SLOT_LEVELS [0,20], traitSlotsAt, SHARED_TRAITS (6 rows, unlock = first clear by any hero via p.done), TRAIT_SPLIT (knight seeded, the other 8 null), kindOf/learned/wornOf/traitGate/sharedOn/traitScale, validateTraits, migrateTraits, wearTrait, traitRows/rowLabel (menu), traitUpText (level-up line), setPvpEvenTraits, setLabTraits.
- progression.js: passiveOn = old line when flag off or hero unsplit; else traitGate. validateProgress drops bad p.traits entries (never throws). migrateTraits runs in both migrateProgress paths (no-op while the flag is off, so saves stay byte-identical). Exports TRT, wearTrait, migrateTraits, traitSlotsAt.
- main.js: `tal()` reads shared traits (worn + unlocked) first; `trk(id)` = rank scale for effect sites; TRAITS tab (treeBranch 1) replaces PASSIVES for a split hero: top = SLOT 1 / SLOT 2 (LV 20), rows core / traits / shared with CORE | S1 II | LV n | CLEAR region labels, F/G wear slot 1/2, X wears into the first free slot (or takes it off), swap anywhere outside a fight (the store's own rule); 'Passives are always on' line replaced; levelUpLine says TRAIT LEARNED / YOUR TRAITS GROW (RANK II/III) / A SECOND TRAIT SLOT; lab URL `?traits=on|off|core|def|id,id`.
- bot-profile.js BOT_TRAITS + traitsFor(); campaign-kit.js kitPre: bots wear defaults (c.traits = 'core' | [ids] override); coop-save.js PER_HERO += 'traits' (snapshot + overlay); pvp-duel.js: EVEN L1 = core only (setPvpEvenTraits at match start, reset in end()), YOUR LEVEL = worn traits.
- tools/traits.mjs (node only).

## The API lanes 2-4 fill (src/traits.js TRAIT_SPLIT[hero] = {...}; null = unsplit = all passives on as today)
core:[ids] | traits:[ids] | merged:{host:[ids]} | folded:{id:'forkKey:side'} | retired:[ids] | shared:[ids that left his list] | defaults:[a,b] | learnAt:{id:level<=18}
Every catalog passive of a split hero must appear somewhere (tools/traits.mjs fails on an unlisted one: an unlisted id is a CUT = off). Lane 2/3 also add the rank number at effect sites: multiply the trait's ONE number by `trk(id)` (main.js) or `TRT.traitScale`. Lane 4 (SHARED): make the knight-only paths for airRoll/airDash/lightStep/momentum/hangCut/execute hero-agnostic; tal() already returns 1 for a worn+unlocked shared id on any hero; verify the region ids in SHARED_TRAITS (stockade kings moor spire fields are real level ids; 'folly' for the Mage's Folly is a GUESS).

## Checks run (node, no browser)
tools/traits.mjs ok; talents.mjs ok; hero-ledger ok; progression.mjs ok (all 36 legacy fixtures); coop-progress.mjs ok; architecture.mjs ok; node --check on every touched file. NOT run: textfit scopes, any browser tool, check.mjs, boss-rates (RAM rule; owed).

## Owed (browser, a later gate)
1. Skills menu TRAITS tab visual + textfit (card/tree scopes) with `?traits=on` on knight L5, L20, L24: row labels, slot header, 'CLEAR THE HEXED FIELDS' label width.
2. Level-up line wrap at L2 / L10 / L20 with the flag on (extra `head + trt` fallback try added).
3. A co-op + PvP duel smoke with the flag on (profile overlay carries p.traits).

## Questions (rec first)
1. Knight's DEFAULT trait vengeance was learned L9 in the catalog; I seeded learnAt vengeance 2, bounding 4, plated 5, evasion 7, bleed 8, bash 10, flurry 12, unbroken 14, counterstroke 16, endlessSky 18 so slot-1's default exists at L2. REC keep (TRAITDATA-A may re-spread, but every DEFAULT must arrive by L10).
2. While the flag is on and TRAITDATA-A is not merged, the knight's shared six (airRoll...) are off unless worn (they are unlocked by first clears). REC accept: the flag does not flip before lane 4 merges.
3. Unlisted passive = off (a cut). REC yes, it forces every lane to account for every id.
