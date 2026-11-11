# charms2 - READY (node-checked; dark behind CHARMS2_SHIP=false)
Branch claude/charms2 off claude/traits 2bc1c3614. Worktree bracken-charms2. Not merged, not deployed. No browser was started.

## The 8 charms as built (src/charms2.js; ONE worn per hero, PROG.charmOf[h]; shop CHARMS tab; gate = store lockOf needs/feat)
| id | name | price | unlock | effect (hook in main.js) |
|---|---|---|---|---|
| thorn | THORN CHARM | 80 | feat: clear the Lumber Trail (level id `wood`) | a melee foe whose blow lands takes 1 back (damagePlayer0; not bosses, not hazards, not bolts from afar >44px) |
| stone | STONE CHARM | 80 | needs the Stockade | a blow <= max(6, 10% max hp) no longer throws you (knockback skipped; still hurts) |
| hound | HOUND'S TOOTH | 90 | feat: 15 medals | first blow on a never-hit foe x1.15 ('FIRST BITE'); never a boss or mini (hurtEnemy0) |
| gambler | GAMBLER'S COIN | 70 | needs Gale Moor | +25% gold into the purse (fraction carried, 100 coins pay 125), +10% damage taken (not hazards) |
| salt | SALT CHARM | 40 | feat: fall 10 times | purse glows bigger, edge-of-screen bag + arrow when off screen, bag by its wood on the world map |
| quiet | QUIET BOOTS | 90 | needs the Monastery | foes notice 30% later: x0.7 on the 7 stock chase checks + the sleeper wake radius |
| lantern | LANTERN CHARM | 80 | feat: find 10 secrets | sparkle on every breakable wall within 6 tiles (L.walls) |
| pilgrim | PILGRIM'S KNOT | 100 | feat: own 3 heroes | +15% XP while this hero is 5+ levels under your best hero (gainXp) |
New feat kinds deaths:N / secrets:N / heroes:N: featDone, unlocks.js (featLevel, featProgress words 'N OF M FALLS/SECRETS/HEROES'), store.js comment. Counters live in PROG.c2 ({deaths, secrets:{levelid:x,y:1}}), written ONLY with the flag on (die(), breakWall of a 'secret' wall; the same wall is counted once though walls mend). Unknown top-level save keys already pass validate: no version bump.
Icons: art.js bakeCharms (10x12, existing style) for all 8; sheet scratch\lane-reports\charms2-icons.png (tools/charms2-sheet.mjs, node only, tiny canvas stand-in).
Flag off = exactly today's shop and play: C2.rows()=[] (CHARMS.push of nothing), worn()=null, every multiplier is 1 (x1 / x1.0 exact), noteDeath/noteSecret write nothing.

## Duplicates vs traits/perks (plan risk 5) - trait stays the sidegrade
- STONE CHARM vs UNFLINCHING / IRONCLAD / bzIron family: the traits keep their own bigger rules for their heroes; the charm is a small-blow no-knockback for anyone. Stacks with nothing.
- THORN CHARM vs Pyro EMBER SKIN (burns the attacker): different payoff; no change.
- PILGRIM'S KNOT vs the roster XP catch-up (xpGrant x2 below best hero): additive on the raw gain before xpGrant; flagged for the tune lane (catch-up + 15% together).
- Nothing reduces damage beyond IRON CHARM; GAMBLER is the only one that adds damage taken (the trade).

## Checks (node)
tools/charms2.mjs NEW (flag off inert; flag on: 8 rows, ids unique, one of needs/feat, needs = real level, plan's unlock table, gates lock/open via store lockOf, counters, one-worn string per hero, save round-trip through migrateProgress/validateProgress, co-op PER_HERO has charmOf, every hook string present in main.js, icons present, numbers). progression (180 nodes, 36 fixtures), architecture, unlocks, shop-gates, traits, talents, coop-progress all exit 0. node --check main/art/charms2/store/unlocks ok.
Skipped (browser, RAM night): tools/store.mjs / store-ui, skill-passives, textfit scope for the CHARMS tab (longest row: SALT CHARM desc ~100 chars; unlock rows 'FALL 10 TIMES', 'FIND 10 SECRETS'), check.mjs.

## Owed (browser / later lanes)
- Feel in a real level with ?charm=... (no lab hook added): THORN pop number, FIRST BITE popup, QUIET radii on archers/sleepers (only 7 stock chase sites + sleepers changed; boss/special AIs and noiseAt wakes are untouched), LANTERN sparkle density, SALT edge arrow/world-map bag position (nd.x+8, nd.y-6, unchecked on the map), STONE with armoured/pyro hero.
- textfit on the CHARMS shop rows and UNLOCKS 'other' rows with 14 charms (the list gets taller; scroll behaviour).
- art-before-live: icons are in; the flag flips only after Daniel OKs the icon sheet.
- CHARMS2_SHIP flip also needs: the shop tab at 15 rows (NONE + 14) checked on phone width.
## Questions (rec first)
1. Flip CHARMS2_SHIP now that icons exist? REC: after the sheet is approved + the browser smoke above; independent of TRAITS_SHIP.
2. THORN CHARM first-wood feat = Lumber Trail (`wood`); plan said 'Thornroad's first wood'. REC yes.
3. LANTERN secrets count = secret breakable walls only (not hero-secret pieces / lost banners). REC yes; widen later if 10 is too slow.
4. Lantern also glints plain ORE walls (they already tell). REC yes, one sparkle rule.
