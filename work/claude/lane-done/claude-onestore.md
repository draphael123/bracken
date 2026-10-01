# claude-onestore: ONE STORE

Base: master 0dcceec1 (batch50). Branch claude/onestore.

## What changed, in plain words
There were three ways to spend coins (the walk-in shop rooms, the EQUIP board from the map/pause menu, and the skills screen). There is one now.

- **src/store.js** (new, no game in it): the tab list, every entry point, the start tab of each walk-in room, TAB/Q stepping, the fight refusal, the "where may coins be spent" rule, and `lockOf` (the one place a line's lock is judged: a level cleared, or a feat).
- **src/main.js** (net fewer lines): state `'store'` is the only one. The old `'tree'` screen is now the SKILLS tab (same loadout on F and G, same live previews, same ACTIVES/PASSIVES). `storeMode`, `equipFrom`, `treeFrom`, `openEquip`, `learnTalent`, `EQUIP_TABS`, the dead training-rank branches, the `TALENTS` placeholder and the old `state === 'tree'/'equip'` paths are gone. Every way in calls one `openStore(back, tab)`.
- **Tabs:** HEROES, SKINS, WEAPONS, CHARMS, SKILLS (Daniel's five, in that order), then SMITH, MUSIC, PRACTICE (the three the walk-in store also carried: SMITH holds real stock, see the table). Two rows of four, nine pixels tall each, so the skills tab still fits.
- **Entries (all open the same store):** map V (HEROES), map Q (SKILLS), Q in a wood (SKILLS), pause menu Store (HEROES) and Skills (SKILLS), the keeper's counter in all three shop rooms (THE STORE opens on HEROES, THE HIGH STORE on SMITH, THE CHANDLER on CHARMS: flavour only, every tab is in all three). The pause menu's "Equip" row is now "Store".
- **Keys:** TAB or E (LB on a pad) next tab, Q (RB) the tab before, wrapping: the settings' own keys. LEFT/RIGHT turn the tabs too, except on SKILLS where they switch ACTIVES/PASSIVES (as before). ESC goes back to where you came from (map, pause menu, or the wood). Q from outside still opens skills.
- **Outside combat only:** the store refuses to open with a boss, a mini-boss room, a live ambush, or a hostile foe within 140x70 px ("not in a fight" in the menu, NOT IN A FIGHT in the wood).
- **Walk-in shop levels stay on the map** and open the same store.
- Footers and menu tips rewritten to fit (textfit strict is clean).

## STOCK RULE (answer to item 2)
**The three rooms never had different stock.** All three keepers opened the same eight tabs from the same lists (verified in code and held by the check: the three rooms and the map store return byte-identical rows). So nothing had to be moved into progress gating. The rule, now written down:

> A line of the store opens when ITS OWN gate is met: a level cleared (`needs`), or a feat done (`feat`: a boss beaten, N medals, an iron run), or silver (`silver`, with a coin route for the class heroes). The room you buy in never gated a coin's worth of stock. The High Store and the Chandler still need Scree and the Reef to WALK to (their map nodes), as before; that is flavour, not stock.

| tab | gated line | price | its gate (unchanged) |
|---|---|---|---|
| SMITH | RAZOR EDGE | 160g | clear Sporewood |
| SMITH | MASTERWORK EDGE | 260g | clear the Monastery |
| SMITH | RINGMAIL | 150g | clear Kingswood |
| SMITH | PLATE | 280g | clear Gale Moor |
| HEROES | THE DEATH KNIGHT | 10 silver (or 800g once he is beaten) | beat the Death Knight in the Unburied Field |
| SKINS | IRON skin | 0 | iron run |
| SKINS | SPORE skin | 0 | feat "spore" |
| SKINS | LAUREL skin | 40g | 15 medals |
| WEAPONS | LAUREL BLADE | 70g | 30 medals |
| CHARMS | RUNNER'S RIBBON | 90g | 45 medals |

Silver-priced (no gate beyond silver): six heroes (10 silver each; the knight starts owned), SILVER KNIGHT skin (4), SILVERLEAF sword (8).
Everything else (35 of the 53 lines, plus the NONE charm line) is open from the start at its old price. The full table is `tools/store-stock.json` and is asserted by `tools/store.mjs` (prices and gates). **The item arrays (HEROES, SKINS, SWORDS, UPGRADES, CHARMS, MENU_MUSIC, PRACTICE) were not touched** (git diff of those lines is empty), so prices are unchanged.

**Items whose availability changes: none.** What changes is WHERE and WHEN coins can be spent:
1. Buying used to need a shop room (the first room is reachable from the start, so nothing is early). Now it works from the map and from a shop room, anywhere.
2. In a wood, away from a shrine, the store opens but **buying (and slotting a skill) is refused**: "buy at a shrine, the map or a shop". Reason: the death cost (src/death-cost.js) leaves carried coins at risk between shrines; if the store sold mid-wood, carried coins could be spent to dodge it. Equipping what you own still works anywhere outside a fight. At a lit shrine buying works (the skills loadout already had exactly this rule).
3. The skills tree could be opened (view only) in a fight. It now cannot (store refuses in a fight). Question 1.

## Saves
No save field was added or changed, so there is nothing to migrate: browsing writes nothing. The migration test seeds two saves written by hand (a batch50-era one and a version-0 one with bought skills as items, training ranks and talent-era fields), loads each through `BK.loadSlot`, and checks through all six doors that everything owned is owned, what was worn is equipped, what was buyable is buyable (locked lines stay locked unless that level is cleared in the save), the skills/loadout/tonics are intact, coins never go down, and the whole save and the slot's text are byte-identical after every tab and every row has been browsed.

## Checks
New: **tools/store.mjs** (registered in tools/check.mjs). A: tab list agrees with main.js; rules table. B: no dead paths left. C: six doors by real keys open the one store on the right tab and ESC returns; three rooms equal the map store. D: a foe beside you refuses Q and the menu; wood buys nothing away from a shrine. E: TAB/E/Q wrap, LEFT/RIGHT, SKILLS branch switch. F: each locked line opens exactly when its level is cleared; stock == golden. G: two old saves, six doors. H: buying a skin, an edge, a tonic, a weapon and an ability works; locked ringmail does not sell; browsing is free.
**Proved to fail on the base (0dcceec1):** run on a worktree of the base with src/store.js copied in it stops at A (`main.js STORE_TABS and src/store.js TABS disagree`); with A and B stripped, the page part fails at once (`BK.ui.storeRows is not a function`; no Store row, no openStore). It passes on this branch.

Adapted (not weakened) for the merged screen: store-ui (opens skills through the store; preview box moved), store-preview (tab walk uses E, because RIGHT on SKILLS is ACTIVES/PASSIVES), textfit (store from map/menu + skills tab), levelling-runtime and tools/fixtures/progression-browser.js (Q lands on the store's SKILLS tab), playtest.js screen sweep (no 'equip'/'tree' screens; skills rows in the store).

Green (run alone, this branch): store, store-ui, store-preview, skill-menu, skill-icons, settings-tabs, shop-gates, shop-theme, progression, progression-runtime, starter-kits, talents, skill-passives, levelling, levelling-runtime, textfit (hints,bestiary,store,tree,menu,hud,pick,practice,plates,soundtest --strict: OVERFLOW 0 CLIPPED 0 TRUNCATED 0, 317 s), skins, dangling-paths, homepaths, comments, hint-shown.
Two textfit findings on the way, both fixed: my Store menu tip clipped (shortened), and a bare `LV 6` header tripped levelling-runtime's ladder count (now `LEVEL 6`).

## Captures (work/claude/onestore/)
`before-*.png` from a worktree at 0dcceec1, `after-*.png` from this branch: map-V, map-Q, wood-Q, pause-Skills, pause-Store (before: the Equip row), shop-keeper. Made by `node tools/onestore-shots.mjs <prefix>` (real keys). Before: map-V/pause-Store/shop-keeper are the old store (two different modes), the other three the tree screen. After: all six are the one store.

## UNVERIFIED
- Gamepad LB/RB: they reach the store through the same `rose('map'/'talk'/'talents')` the settings tabs use (settings-tabs is green) but no pad was pressed in the store.
- Touch: the F/G touch buttons are shown on the SKILLS tab (the zone test now reads the store state); not tried on a phone.
- Buying at a *lit shrine* in a wood is covered by the rule test (mayBuy), not by a live shrine in the page.
- The map footer has no hint for V (there was none before; it does not fit next to the co-op label).

## QUESTIONS FOR DANIEL (built as recommended)
1. **Skills mid-fight.** Q in a fight used to show the tree view-only; now the store refuses in a fight. Recommend keep (you said outside combat). Alternative: open only the SKILLS tab, view-only, in a fight.
2. **Buying in a wood.** Recommend as built: buy only on the map, in a shop room or at a lit shrine (protects the death cost). Alternative: allow buying anywhere outside a fight (then carried coins can be spent to dodge a death).
3. **SMITH, MUSIC, PRACTICE tabs.** You named five tabs; the old walk-in store also sold SMITH's edges/armour/tonics (real stock), MUSIC and the PRACTICE entrances, so they are tabs 6-8. Recommend keep. Alternative: fold MUSIC and PRACTICE into the pause menu and keep SMITH as tab 6.
4. **Start tab of each shop room.** THE STORE HEROES, HIGH STORE SMITH, CHANDLER CHARMS: flavour only. Recommend keep; say if you want all three on HEROES or want room-specific stock later (then the rule would become "stock by the room's region").
5. **Pause menu.** Both "Skills" and "Store" rows stay (Skills opens the same store on SKILLS). Recommend keep for discoverability; or drop "Skills" and rely on Q.
6. **Stock premise.** You expected per-shop stock gated by progress; there was none (all three identical, each line already gated). If you want the High Store and the Chandler to sell something the first store does not, that is a new design (say what).
