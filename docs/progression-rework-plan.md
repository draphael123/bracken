# BRACKEN progression redesign — review draft, not implemented

Replace the talent trees with automatic level growth, coin purchases and a small equipped skill loadout. Keep each hero's basic attack, held attack, defence, dash attack and plunge available from the start. The store sells additional choices rather than repairs to the basic controls.

## Proposed player rules

- Keep per-hero XP and the existing XP curve initially. Level-ups automatically raise HP, stamina and damage. Start from the current hero base stats and consolidate existing level bonuses into one stat table; do not stack a second growth system over `applyUpgrades`, `LV_GROW` and damage helpers.
- Give every owned skill the hero's level damage multiplier. Healing and shields use bounded fractions of maximum HP; movement distances and invulnerability durations stay fixed. Cooldowns stay fixed initially so growth does not erase the combat rhythm.
- Buy skills from the existing shared coin wallet; skill ownership is per hero. Suggested price bands: 60 coins at level 1, 120 at level 4, 220 at level 8 and 360 at level 12. These are tuning proposals, pending a full campaign coin-income simulation; quest keys, healing and hero unlocks must remain affordable.
- Start with two equipped skills. Unlock the third slot at level 8 and fourth at level 16. Purchased skills remain owned when unequipped. Change equipment in the shop, map or safe checkpoint; never during a locked fight. Keep F/G for slots one/two and make slots three/four rebindable, with equivalent controller and touch access.
- Show level requirement, price, owned/equipped state, slot limit, current-level effect and cooldown on each shop card. Replace the tree page with a loadout page. A level-up says exactly which stats increased and whether a slot opened.
- Fold passive stat talents into automatic growth. Convert distinctive passive rules into explicitly priced, equippable techniques sharing the slot budget; retain essential movement verbs as baseline. Produce an explicit mapping for every current TREE node before removing any node reader.

## Save migration

Use a new `progressionVersion` independent of `talentVersion` (currently 6). Copy the raw source save to a versioned backup before running old normalizers that discard unknown nodes or reset older trees. Validate the transformed copy, then write it atomically where possible. Retain the original backup and a migration receipt.

Preserve XP, coins, silver, heroes, campaign/quest completion, cosmetics, inventory and settings. Convert talent entitlements to coins once: for each hero, refund 25 coins times that hero's legitimate earned talent-point total, capped at the old 30-point limit. This includes allocated and unspent points; do not add allocated points a second time. Use historical node costs and ranks only to reconcile old saves, never the god-mode `ptsTotal()` result of 99. Flag inconsistent saves rather than silently inventing an entitlement.

Proposed treatment of learned active skills: preserve their ownership for free, including any skill above the hero's new shop level gate. The gate restricts new purchases, not legacy ownership. Refund talent points as above, so an existing player keeps the moves they know and receives the requested currency refund. Preserve F/G assignments if valid; remove duplicates, fill remaining unlocked slots deterministically, and leave excess owned skills unequipped. No automatic coin spending.

Record old/new versions, per-hero point entitlements, total refund, skill mappings and a source-save checksum in the migration receipt. A rerun with the same migration version credits zero coins. Imported backups migrate once against their own source identity. Co-op borrowed levels never earn migration refunds for the guest.

## Implementation and acceptance sequence

1. Freeze a complete node-to-baseline/skill/retired mapping and approve prices, slot levels, controls and the refund rate.
2. Add pure growth, ownership, equip and migration modules with fixtures for all six heroes and every supported save version. Prove exact coin deltas, repeat-load idempotence, export/import round trips, corrupted-save handling and rollback.
3. Update skill resolution and scaling, then shop/loadout/level-up UI, tutorials and controller/touch bindings. Remove tree readers only after each node has a migration destination.
4. Run the full check suite, text-fit/screenshots, XP and coin simulations, pogo routes, six-hero boss labs and fresh/legacy/co-op playthrough samples. Verify that level scaling and slot unlocks do not invalidate attack commitments or stamina costs.
5. Ship only after Daniel reviews this plan and the mapping. No progression code or save migration has been built in this pass.

Review decisions: 25 coins per earned point; grandfather learned skills; slots at levels 1/8/16; active and passive techniques sharing the same slots. The safest first release retains the current stat curve and tunes prices from measured campaign income.
