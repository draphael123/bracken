# HEROROSTER (claude/heroroster2, off master 95bc267a4) - Daniel 11-07

Branch is claude/heroroster2: the old claude/heroroster (10-12) already exists, merged.

## Changes
1. Account-wide unlocks. src/hero-roster.js: the roster file now also carries `own` (heroes some save owns; starters only when owned, so an unbought starter is still buyable per save) and `feats` (boss:unburied, boss:church, boss:warcairn done in ANY save). New noteRoster, rosterOwned, parseOwn/parseFeats, ownedInSlots, featsInSlots. Migration seeds own+feats from slots; old rosters upgrade on load; .lastgood/.corrupt/rebuild keep both. main.js: owns()/heroOwned() = god | this save | ROSTER_OWN; swapHeroTo, swap rows/swapWhy, store list (OWNED, equip never charges, no refunds), setSeatHero, tavHeroes, coopPickList, boss select, title camp all read it. A save ADOPTS a roster hero into PROG.heroes the first time it plays him (setEquip/tavSetHero) so every PROG.heroes reader works. A hero's sale lock reads the device feats (lockOfK/featDoneH). Gold route (coinRoute) still needs the boss in THIS save (gold is per save). rosterNote runs on every save write. coop-save.js heroesOf/slotSummary/snapshotOf/freshSeat/seatFromSlot take roster extras; applyCredit adopts a roster hero (not xpOnly); online-guest picker + snapshot use rosterOwned; host seat check follows seat.heroes (unchanged).
2. Catch-up XP (src/xp.js xpGrant): paid = max(old rule [x3 curve catch-up, else soft cap], x2 below this save's highest hero level), capped at that level's XP floor, never above LV_MAX, never stacked. CHOICE: the soft cap applies first (roster x2 doubles the soft-capped amount), so over-levelled farming is no more farmable. '2X XP' tag on swap cards (CELL_H 52->60, caption says until level N), HUD bar ' x2' (x3 keeps priority), start-of-wood hint, wood summary shows the real multiplier.
3. Labels: store button 'F: SWAP HERO' (pad glyph via CTL.labelFor); tavern wardrobe station -> SWAP HERO / verb SWAP / new first-visit line, card header SWAP HERO; title row SWAP HERO (only when the save is started): loads the current save, opens the panel over the title, a pick or ESC returns to the TITLE (hero saved, line shown top of title; CONTINUE then plays him - least surprising); controls card row 'swap hero'; pause row kept.
4. Tests: new node tools/hero-account.mjs (registered in check.mjs): roster A->B, feats, old roster, damaged/rebuilt, full disk, co-op seat + credit adoption, source checks for no double charge/title/tavern/controls, xpGrant math. Updated tools/hero-roster.mjs (stored text now has own) and tools/tavern.mjs (first line says SWAP HERO).

## Verified
node --check on every touched file; node tools/hero-account.mjs ok; coop-progress ok; tavern-menu ok; progression/leveling/levelling/warcairn ok. tools/warden-id.mjs RED 'DUEL_HERO: no warden row' is pre-existing on master. No browsers, no check.mjs.

## OWED (browser)
Stills: store SWAP HERO button (kb + pad), tavern SWAP HERO station + card, title SWAP HERO row (row count +1: RH may drop 8->7 with 13 rows) + swap panel + toast, '2X XP' tag on cards + HUD. Page runs: tools/hero-roster.mjs, tavern.mjs, hero-swap.mjs (its 'Geomancer refused' case should still hold since unbought starters stay unowned), settings-tabs (controls card now +1 row, step shrinks), textfit. Online co-op guest check (roster hero pick from a save that never owned him).

## Questions (recs built)
- A starter picked free at new game is recorded as owned, so it is free in every save. Rec: keep.
- Gold route for Reaper/Paladin/Berserker still per save. Rec: keep (gold is per save).
- Title swap returns to title (not Continue). Rec: keep.
