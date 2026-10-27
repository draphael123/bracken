# claude/kitchengate: THE KITCHEN GATE + LORD GRUBBAG THE GLUTTON (opus greybox, level + boss)

Base 22ae4cf0 (master, BATCH120). Branch `claude/kitchengate`, worktree `bracken-kitchengate`. Not merged, not deployed. Brief: scratch/concept-kitchengate.md (10-01 + the 10-08 update), Daniel's 10-24 road line.
PORT 6331 (this worktree's block, tools/ports.mjs). One headless Chrome at a time, free RAM checked before each (4.3-6.5 GB free). Helpers in work/tmp-kitchengate/ (not committed). GREYBOX: the art lane follows; art comes before live.

## What landed
- **src/kitchen-gate.js** is the level, laid by hand (420 x 48), carved out of one block of castle rock (no floating masonry). **src/kitchen-hands.js** is its rule, machines, THE BUTCHER and the greybox drawing.
- **src/grubbag.js** is the fight, pure, with the bot plan. **src/grubbag-hands.js** binds it to the world and draws him (POSE table, B16).
- **Road:** THE UNDERCROWN -> THE KITCHEN GATE -> HIGHCROWN. `LEVELS.push(...)` under the array (append-only). `crown.needs` is now `'kitchengate'`; the Undercrown's `leadsTo` is `'kitchengate'`.
  - Map: a node at (241,30) between the Undercrown and Highcrown. The Undercrown node moved (230,40) -> (222,44) to make room (map-spacing/map-grammar green). Map blurb + plate spot added.
- **Old saves:** `progDefaults` migrates once (`PROG.kitchenRoadMig`): a save with the Undercrown or Highcrown cleared gets `PROG.crownOpen` (the existing Highcrown clause - no new levelLocked clause). The kitchens need only the Undercrown, so a save past them finds them UNLOCKED as an extra, never a new requirement. Proven over fake PROGs (tools/kitchengate.mjs) and in the page (tools/map-forks.mjs, updated for the new road + a kitchen grandfathering case).
- **Rule line (true to the code):** STRIKE A BELLOWS AND ITS FIRE ROARS: THE SPIT OVER IT TURNS, THE COPPER ON IT STEAMS, THE GREASE BY IT BURNS.
  - Every fire is banked (embers). A blow on its BELLOWS (L.hoists cleat shape, so the pilot and the guide read it) makes it ROAR for 8 s; a HEAT GAUGE over the bellows drains (the rule's state, drawn).
  - **copper:** a steam column lifts you while it roars. **great spit:** a turnspit frame of two spits over a coal pit turns while it roars and stops when it dies - ride a spit up. **trail:** the grease trail catches, the flame runs along it burning whoever stands on it, and the TALLOW DOOR at its end melts (stays melted through a death). A trail with no door greases back over in 5 s.
  - The kitchens' ground: GREASE FLOORS (L.slick, slide), MEAT-HOOK RAILS (src/zipline.js, UP to take a hook), THE OVERTURNED POT set piece (the great grease pot tips; the fire runs east behind you along the grease - LOW route slides the grease, HIGH route takes the hook rail over it; rearms on a death).
  - A banked great spit is no stair (two opposite spits: one rests in the pit, one at the top) - proven by the fill.
- **THE BUTCHER** (the one new foe, `butcher`, heavy): THE CLEAVER (red !!, unblockable), THE HACK (yellow !, blockable); on grease his chop slides him past you; BURNING GREASE stops him (stunned in the flames, blades x2). Placed on trails both times. Greybox: the club goblin's frames tinted meat-red + apron/cleaver overlay.
- **Five named areas**, a banner each, a shrine closing each exam (A10c):

| area | cols | arc | contents |
|---|---|---|---|
| THE UNDERCELLARS | 0-104 | TEACH | root cellar (page 1); THE COLD STORE carcass rail over the cold pit (REQUIRED, a fall is a climb; silver 1 in the pit); THE SCULLERY COPPER (first bellows, REQUIRED, safe); wine vaults; exam THE BREWHOUSE COPPER under a pot-thrower (REQUIRED); shrine 100 |
| THE SPIT HALL | 104-201 | TEST | THE FIRST SPIT (REQUIRED); page 2 up the pot racks; THE SECOND SPIT under cooks (REQUIRED); remix THE STEAM AND THE HOOK - the copper's steam is the only way up to the rail over the fire trench (REQUIRED); shrine 198 |
| THE GREASE KITCHENS | 201-300 | REMIX | grease slide over a coal pit; THE TALLOW DOOR (REQUIRED); THE OVERTURNED POT (two routes, page 3 on the high one); exam THE BUTCHER on a stove trail; shrine 299 |
| THE FEAST HALL | 300-372 | EXAM | THE THIRD SPIT to the minstrels' gallery (REQUIRED); THE HEARTH TRENCH on the hooks (REQUIRED); grease + butcher + thrower + cook before THE BUTTERY DOOR (REQUIRED); THE SPICE VAULT (3 recipe pages open its grate: silver 2); shrine 368 |
| GRUBBAG'S TABLE | 372-420 | BOSS | LORD GRUBBAG THE GLUTTON (hall 390-416) |

- **Foes:** goblin cooks reused (sprig, hearthgob), the pot-thrower is the rock goblin, bats in the cellars, two butchers. Roles: melee, ranged, heavy. No generic wood. Goblins are fine here (before the Goblin Queen).
- **Wiring:** main.js (imports, TIER 1.4, migration, spawn cases + no-op machine kinds, the butcher's own machine, damage hooks, movers `m.kg`, draw/update/strike hooks, bestiary cards, BOSS_T/POISE/KNOCK tables, boss select, bossEnd, bar name, BK accessors `kitchen()`, `grubbagHands()`, `grubbag()`), level.js, lab.js (gbPlan block, PLAN_CLOCKS, rest exclusion), reachcore (bellows effects as done, the spits' turn as stations, steam-to-hook perch), playtest (bellows as cleats), stuck-spots (8 required bellows), threat, hint-lines, boss-greed (OPEN_RULE, OWN_WARD), boss-read, marks (BY_HAND + tells --write), foe-react (act 2), exit-gates, dressing, island-posts, level-quality (GATE, music REPORT_ONLY, heavy role), boss-rows, check.mjs + check-timings.

## LORD GRUBBAG THE GLUTTON (header in src/grubbag.js: a PUZZLE BOSS, the level's rule is his opening)
- He never leaves his reinforced chair. **Never invulnerable (B15):** WELL FED x0.45 (told), HUNGRY x0.7, from above x0.7, WARDED x0.4, CHOKING x2 (capped 7%).
- **Opening (B1/B17, the level's verb + its hooks):** strike THE PIE OVEN's BELLOWS by the kitchen hatch: it bakes a POWDER PIE (gauge) that rides THE SERVING LINE (a hook rail under the roof) to him. He eats whatever reaches him - the pie goes off in him (11% of him, the blast's own) and he CHOKES 6.5 s (gold ring + bar), then coughs it up behind a told WARD (2.6 s) and a 2.2 s pause before his next blow. The oven cools 2.5 s.
- **Starve him:** every other dish heals him 1% and powers his next blow (x1.3). A JUMPING blow knocks a dish off the line: it smashes, he goes HUNGRY (x0.7 taken, faster cooldowns). Strike the pie on the line and it bursts (singes you, oven must cool).
- **Six told moves, each its own windup/release pose (B16):** P1 THE BELCH (red !!, a floor ring both ways: jump), THROWN FOOD (yellow !, red rings: move off), THE GIANT FORK (yellow !, low stab along the floor: block or jump), THE TABLE SLAM (red !!, plates + the table end shakes: get off it). P2 (62%) the dishes come faster + THE GRAVY FLOOD (yellow !, a wave west, slow slick floor: jump or a bench). P3 (30%) THE GRAB (red !!, his arm along the floor: jump or roll; caught, he bites and throws you). Never the same move three times.
- **No adds** (the serving line stands in for the concept's servers - see questions). Music: the pool's `boss3`.

## Rates (BOT_PROFILE human, campaign L19, practiced, flasks = the campaign kit, n=12 per hero)
| | knight | warden | pyro | total |
|---|---|---|---|---|
| **with flasks** | 12/12 | 10/12 | 1/12 | **64%, in band** |
| dry (human+dry, n=4) | 3/4 | 2/4 | 0/4 | 42% |
| mash (boss) | 0/2 | 0/2 | 0/2 | **0/6** (boss left 77-98%) |
- **Fight length (with flasks):** knight 68-86 s, warden 66-92 s, pyro win 95 s (deaths 106-180 s).
- **Tuning path (n=4 unless said):** first build 0% (dishes healed 1500 hp, the choke cap ended it in 4 hits, the bot walked away while he ate the pie) -> cap 0.2 / heal 1% -> smaller hall (42 -> 27 tiles) 58% -> the pie's blast share 67% (pyro 0) -> longer choke, lower cap, lower ring damage, the bot jumps the low fork 64-75% -> n=12: 75% (12/12 12/12 3/12) -> faster cadence 58% -> middle cadence n=12 **64%**. A blast-heavier variant (cap 5% / blast 13% / +20% damage) measured the same 64% and was not kept.

## Checks (single runs on this branch; the full suite NOT run - a BATCH gate was running beside me)
- **Green:**
  - `tools/kitchengate.mjs` (new, Node, registered): road + append + map node + rule + gate + 5 areas; old saves over fake PROGs; the fill reaches every shrine/silver/page/boss; every REQUIRED machine a LOCK (3 coppers, 3 great spits, 2 tallow doors, 3 hook rails), the race rail optional; a banked great spit is no stair (x3); 3 rule kinds taught/tested/remixed/examined in order; the hands in a fake world (roar, steam lift, turn, trail -> door melt, cook burns, butcher x2, regrease, the pot, pages -> vault, a reset keeps door/vault/pages); the boss pure (B15 every mode, WARDED, WELL FED, HUNGRY, oven -> pie -> choke, x2 + cap, ward, oven cools, dish heal + power, smash -> hungry, pie burst, phases add flood / grab, never thrice, B16 poses for all six, B17, the bot goes to the oven).
  - `tools/kitchengate-probe.mjs` (new page smoke, registered): lands in play; a REAL blow stokes; steam lifts 19 rows; the spit still/turns/stops and carries a rider up 8 rows; the trail melts the door, cooks burn; a death keeps the door; the pot's fire runs; the butcher burns x2; pages open the vault; banners; Grubbag wakes, x0.45 fed, a REAL blow on the oven bakes a pie, he eats it and chokes, x2, ward x0.4; no page error.
  - **level-quality kitchengate CLEARS THE BAR** (music REPORT_ONLY placeholder; blocking report-only 39%).
  - solid-islands 0 left; reach-heroes **all 9 heroes, 0 crossings**; checkpoint-gaps (DENSE report only, gaps 103/99/88/62); one-new-foe (the butcher); map-spacing, map-grammar, map-forks (incl. the new road + grandfathering); stuck --static; hint-shown --static.
  - tells (after `--write`; Grubbag's + the butcher's marks in BY_HAND); boss-read; boss-greed (page + node); boss-fight-end; boss-openings.
  - textfit bestiary --strict (0 issues); **mobile-perf at 4x CPU: kitchengate 60 fps (p95 16.8 ms)**.
- **Stamps on the final hash:** docs/level1-pilot.json (3 runs: 28 hits, 1 death, walked 100%, 61 lifts, 120% hp a run); docs/level1-curve.json; docs/mash-bot.json LEVEL rows (k/w/p each die, lowest hp 0%) then BOSS rows 0/6.
- **Not run:** the full suite; the walker (level-walk); corpses; untold-told; boss-jump/boss-select; the 'first' and 'built' rate ways.

## REDS
- **Hero spread:** knight 12/12, warden 10/12, **pyro 1/12** (in band overall, no hero at 0, but pyro is weak). The pyro bot's cycles are slow (it dies at 106-133 s with 9-20% left); the fight is cycle-limited, so HP and damage levers moved every hero together. Lever if wanted: a longer choke for everyone helps pyro most (the knight hits the cap); or a pyro-side review of its lab hands.
- **Knight/warden fights 66-92 s**, under the 90-150 target (the pie's cycle sets the pace).
- **tools/fixtures/campaign-xp.json has no kitchengate row**; campaignLevel reads L19 by depth. I did not run `boss-level.mjs --write-xp` (it rewrites every row). Re-run at integ.
- **Merge friction:** src/marks.js MARK table re-flowed by `tells --write` (re-run at integ after merging); the shared main.js heads (BOSS_T, POISE_SKIP, TIER, EHP literal, the BBH/PWH lines I anchored on), check.mjs, check-timings, level-quality GATE. Keep both sides. The rookery branch also touches the crag map path and levelLocked (I did not touch levelLocked).
- The level plays the benched 'cave' track and the shared 'cave' ambient bed (REPORT_ONLY music); no tile kit of its own (default stone + interior back walls: cellar / keep / royal).

## STILLS (greybox, god-mode knight; the level is new: no "before")
In work/claude/lane-done/, 640x360, tool tools/kitchengate-shots.mjs:
- **The level:** `kitchengate-{cellar, cold-store, scullery, scullery-steam, vaults, brewhouse, spit-hall, first-spit-turning, second-spit, steam-hook, fire-trench, grease, tallow-door, tallow-burning, tallow-melted, grease-pot, grease-pot-fire, butcher, butcher-burning, feast-hall, gallery, hearth-trench, buttery, spice-vault}.png`
- **The boss:** `kitchengate-gb-{sit, belchTell, belch, throwTell, throw, forkTell, fork, slamTell, slam, floodTell, flood, grabTell, grab, pie, eat, choke, ward}.png`

## ART NOTES (sonnet art lane; nothing here changes the level hash)
- **No tile kit of its own yet**: rooms carved from one rock block, default stone, interior back walls ('cellar', 'keep', 'royal' styles). Wants: cellar vaults (brick, barrel racks, ice house frost), the spit hall (soot stone, great hearths), the grease kitchens (fat-glazed tiles, copper pans), the feast hall (banners, long tables, a carved gallery rail), the high table in the queen's colours. The pit floors are SPIKE tiles: draw them as coals.
- **src/kitchen-hands.js drawWorld** (greybox): fires (embers / flames), BELLOWS (heaves when struck) + the HEAT GAUGE (keep it - it is the rule's state), coppers + steam, THE GREAT SPITS (hub, spokes, two iron spits with roasts, post into the pit), grease trails (gloss -> flames -> char), grease floors (gloss), tallow doors (melting from the top), the great pot (tips), recipe pages, the spice vault grate (+ page count). The meat-hook rails are src/zipline.js lines: draw iron rails with S-hooks, carcasses along the cold store's.
- **THE BUTCHER**: SPR.butcher = the brute set tinted + KGH.butcherOver (apron, cleaver, flames). Wants his own sheet: CLEAVER windup (raised) / release (buried), HACK windup (cocked low) / release (across), the grease SLIDE, BURNING.
- **src/grubbag-hands.js**: POSE is the contract (every move its own windup and release). drawGrubbag: chair, robe, belly, jowls, gold circlet, arms, giant fork, gravy cauldron; the hall's pie oven + kitchen hatch, the oven bellows + gauge, the serving line + hooks, dishes and the POWDER PIE (red, sparking fuse), the high table; rings, food/plates in flight, the gravy wave and floor, the grab's arm; CHOKING gold ring + bar, WARDED, WELL FED / HUNGRY. bakeGrubbagCard = his bestiary card.
- **Still wanted:** the level's own ambient bed (kitchen clatter, fires), a CC0/CC-BY level track and a boss track.

## QUESTIONS FOR DANIEL (rec + what I built)
1. **Where on the road?** Your 10-24 line says Stormhold -> Kitchen Gate -> Highcrown; the 10-08 concept says it starts underground, coming up out of the Undercrown.
   - Rec, built: **Stormhold -> the Undercrown -> THE KITCHEN GATE -> Highcrown** (the Undercrown stays where it is, the kitchens are still the first time INSIDE the castle, and the level opens in the cellars as the 10-08 plan says).
   - Alternative: Stormhold -> Kitchen Gate -> Highcrown with the Undercrown moved off the road (a one-line `needs` change + map).
2. **One rule for three mechanics:** I made the verb STOKE (strike a bellows: its fire works the spit, the copper or the trail). Hooks and grease are the kitchens' ground, not the verb. Rec: keep.
3. **The great spits are a turning frame of two spits** (four spits made a banked spit a free stair for every hero). Rec: keep two.
4. **The serving line instead of servers:** dishes ride a hook rail to him (no adds); you starve him by knocking a dish off with a jumping blow. The concept's "trip servers" would need goblin servers in the fight (adds). Rec: keep the line; say if you want servers.
5. **The powder pie's blast** takes 11% of him whoever stoked it, plus a 6.5 s choke at x2 (capped 7%). This is what made the pyro winnable at all. Rec: keep.
6. **Hero spread** (knight 12/12, warden 10/12, pyro 1/12 = 64%). Rec: accept for the greybox, re-check after art; the lever is a longer choke.
7. **Recipe pages -> the spice vault pays silver** (one silver, a cellar under the feast hall floor). Rec: keep.
8. **Highcrown's start** still has its old crag climb (Highcrown 2 is its own lane); the kitchens end at the high table, not at Highcrown's gate. Rec: the Highcrown 2 lane opens it "up the kitchen stair".
