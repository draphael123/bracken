# Look and feel: Bracken Wood to Highcrown (2026-09-26)

Daniel's ask: "I'd like the levels to feel more polished and feel and look better. Let's look at the first levels
ending at Highcrown for improvements." This is polish only. It proposes no new levels and no new mechanics.

## SUMMARY: most needs polish first

| # | level | the one-line verdict |
|---|---|---|
| 1 | **STORMHOLD** | Grey on grey (spread 20, chroma 9), no platforming on the route, one screen where the footing disappears into the dark. The held `claude/stormhold` rebuild answers most of it, so decide that branch first. |
| 2 | **THE ORE ROAD** | The most washed-out level in scope (chroma 4.9). Cold white lamps, foes that read as pale ghosts, and a dark boss shaft where the Winchmaster can't be seen. Its boss track is a shared loop. |
| 3 | **GALE MOOR** | The rework fixed the wind but not the look: the moor still wears the Scree Path's purple dusk hills and sun. Both tracks are borrowed (a store menu tune, and a 32 s stage-select loop for the boss). |
| 4 | **THE HANGING VILLAGE** | The floors now differ, but one flat cliff wall sits behind all of them. There is no sky and no drop, so the height doesn't read. The lantern stair is an empty wall with a ladder. Its music is the store's menu tune. |
| 5 | **THE MONASTERY** | Still the most colourless climb (chroma 4-7 on half the screens). Both tracks belong to the removed Sunspire and Roc. The opening screen is a grey brick wall. |
| 6 | **THE STOCKADE** | No stockade in view: the camp is drawn over the Wood's night tree wall, on grass. The first screen is murk. The Kennel Yard is still blown out by bloom. |
| 7 | **HIGHCROWN** | Grey stone murk. The castle's middle (cols 468-854) plays forest birdsong. It opens on a brick wall, and the Burning Village's house front stands inside the castle. |
| 8 | **UNDERLEAF** | The Burning Village's kit without the fire: the same skyline, cobbles and stone lanterns, and no leaves over "the king's own village". |
| 9 | **THE BURNING VILLAGE** | Strong skyline, but both tracks are borrowed from the Quarry Pass, the ambience is forest birdsong, and a stone lantern stands in the barn. |
| 10 | **THE SCREE PATH** | Looks good. The Crag Climb is still one flat striped face. The last 48 route tiles before the Ram Lord are quiet (fails S3). |
| 11 | **SPOREWOOD** | Now its own place, but the same violet screen from start to finish. The level track is credited to the Mineworks. |
| 12 | **THE HIGH STORE** | A dark stone vault (spread 17.6, no warm pool). It reads as a cellar, not a mountain trading post. |
| 13 | **MARSH WOOD** | Rain and boardwalks work. It uses the Wood's tree wall, recoloured, and there are 56 quiet tiles between the last test and the Frog King. |
| 14 | **KINGSWOOD** | The best-looking wood. It is warm everywhere (warmth 0.86) with no cool accent. The mini gets the generic boss track, and board stripes are still buried in the dirt. |
| 15 | **BRACKEN WOOD** | In good shape. What it shares with every level: 40% of the frame is dirt, and the ending is a card dropped on the arena. |

**The four fixes worth the most, game-wide** (details at the end):
1. The camera and the fill: 40% of every flat screen is fill below the floor.
2. A far/mid backdrop set per crag level, instead of one set for seven.
3. A level and boss track of its own for the eight levels that borrow one.
4. An ending you walk out of, instead of a card dropped on the arena.

## How this was looked at

- **Captures.** Every picture is from the real page: headless Chrome through `tools/cdp.mjs`, the page's own
  320x180 buffer saved at 2x.
  - Tool: `tools/lookfeel-shots.mjs`. It is a capture script, not a check, and is not in `tools/check.mjs`.
  - Per level: `NN-opening` (the title card over the first screen), then 10 shots `route1..10` evenly along the
    `tools/pacing.mjs` main route. After those come the `mini` room, the `boss` arena once the fight is up, the `kill`
    and the `after` (the win card).
  - The level is reloaded before every shot, because an ambush room holds the hero once it shuts. Foes are left
    alive. The knight is in god mode at about level 15.
  - The between-level shots are `map-*.png`, from `tools/lookfeel-map.mjs`.
  - All captures are in `work/lookfeel/`. `shots.json` holds each picture's position, the music the page asked for,
    the ambience, and the screen numbers.
- **Screen numbers.** Beside each picture, the page measured the art-direction rules on its own buffer: L\* spread
  p10-p90, median chroma, and warm-minus-cool share. The HUD is in the frame, so compare levels with each other,
  not against the rule thresholds exactly.

  | level | spread (median/min) | chroma | warmth | mean L\* |
  |---|---|---|---|---|
  | wood | 61.8 / 7.9 | 18.6 | 0.20 | 35.8 |
  | marsh | 54.8 / 49 | 10.6 | -0.32 | 39.0 |
  | stockade | 26.8 / 17.5 | 10.1 | 0.05 | 19.7 |
  | burning | 28.9 / 22.5 | 8.8 | 0.30 | 15.9 |
  | spore | 23.1 / 20.4 | 12.5 | 0.26 | 22.9 |
  | kings | 35.8 / 32.9 | 24.4 | **0.86** | 27.5 |
  | underleaf | 23.6 / 19.1 | 10.2 | 0.29 | 16.8 |
  | scree | 34.3 / 31.3 | 17.4 | 0.73 | 34.3 |
  | hanging | 31.4 / **12.2** | 8.8 | 0.64 | 28.6 |
  | High Store | **17.6** / 17.2 | 10.5 | -0.15 | 15.2 |
  | spire | 46.1 / 29.6 | **7.0** | 0.06 | 38.9 |
  | moor | 36.7 / 31.9 | 13.4 | 0.68 | 31.0 |
  | oreroad | 25.6 / 17.2 | **4.9** | -0.01 | 15.0 |
  | storm | **20.2** / 16.7 | 8.7 | -0.02 | 21.0 |
  | crown | 25.4 / 19.0 | 10.8 | 0.03 | 18.9 |
- **Static reads.**
  - Pacing: `work/lookfeel/pacing.txt` (and `.json`).
  - Density: `work/lookfeel/quality.txt`.
  - Props: `floaters.mjs` and `architecture.mjs` are both clean now. No floating props anywhere in scope, so none
    are listed below.
  - Music and ambience per level were dumped from the built `LEVELS`, and the audio credits were read.
- **Against the 2026-09-24 review (group A).**
  - Reworked since, and not repeated here: the Hanging Village (floors, hoist, cliff), the Monastery (grounded,
    eleven places), the Ore Road (mine life), Sporewood (rule, canopy, shelf fungus), Highcrown (bells, ambush),
    Gale Moor (cut to 703, told gusts), the Burning Village, and the ground-shading stripe.
  - Still true and repeated here only where it is a look or feel item: the Scree Path's Crag Climb face, the
    Kennel Yard bloom, Kingswood's buried board stripes, the checkpoint near-pairs, Gale Moor's backdrop, and the
    Monastery's chroma and borrowed music.

Tags: **[ART-S]** cheap art or dressing · **[ART-M]** new art · **[LAYOUT]** moves tiles (or one camera number) ·
**[AUDIO]**. **Recurs:** the same problem in other levels. Fix it once, game-wide (see the end).

---

## 1. STORMHOLD (`storm`)

The rework for this level already exists and is held on `claude/stormhold` (longer, key towers, walkways). Every
item below is either what that branch must be checked for, or the minimum if it doesn't ship.

1. **Grey on grey, with no warm pool.** Spread 17-24 across the route, chroma 8-10, and the snow-grey grass sits on
   a grey street under grey crag hills ([storm-03](../../work/lookfeel/storm-03-route3.png),
   [storm-00 opening](../../work/lookfeel/storm-00-opening.png)).
   - Fix: lit windows and braziers along the street (rule 2), and a warm-lit gate on the skyline as the arrival
     landmark. **[ART-S]**
   - Recurs: Highcrown, the Ore Road, the High Store.
2. **The footing vanishes.** In the halls under the crag the hero stands on a floor drawn in the backdrop's own
   value ([storm-09](../../work/lookfeel/storm-09-route9.png)).
   - Fix: a lit top edge on that floor, or a darker back wall behind it (rule 3). Run `tools/lookpass.mjs storm`
     on the held branch before it merges. **[ART-S]**
3. **No platforming at all.** The pacing strip reads `F-R---R-F--XAAAAAAASF-FFFX-F-FF--F-FRBBBBBBBBB` (0 P
   stretches), and the exam before the Lance (S3) is fights only.
   - Fix: this is the held branch's job. It is a reason to ship it, not something to patch here. **[LAYOUT]**
4. **The boss plays `musCastle`,** a 32-second stage-select jingle, after a level track of its own.
   - Fix: a Queen's Lance track. **[AUDIO]**
   - Recurs: Gale Moor (`musMountain`) and every generic `boss`/`boss2`/`boss3`.
5. **Ambience is wind only** in a hold with a hearth hall and a smithy.
   - Fix: a `hold`/`hall` zone over the interiors (the room layer already maps `wind` to `hall` inside
     `interiors`), and a `town` bed on the street. **[AUDIO]**, data only.

## 2. THE ORE ROAD (`oreroad`)

1. **The most washed-out level in scope.** Median chroma 4.9 (rule 4 asks for 7), mean L\* 15, and cold
   blue-white lamps ([oreroad-05](../../work/lookfeel/oreroad-05-route5.png),
   [oreroad-02](../../work/lookfeel/oreroad-02-route2.png)).
   - Fix: amber lamp light, and the ore glints (gold, copper, the purple seams) two steps brighter. The mine then
     has warm pools and a colour of its own. **[ART-S]**
   - Recurs: Stormhold, Highcrown, the High Store.
2. **Foes read as pale ghosts.** Heavies, miners and the King's Champion draw nearly white under the edge-lit
   lamps ([oreroad-10](../../work/lookfeel/oreroad-10-route10.png),
   [oreroad-07](../../work/lookfeel/oreroad-07-route7.png)).
   - Fix: cap the edge light on characters, or tint it warm, so goblins stay green (rule 8 cuts both ways).
     **[ART-S]**
3. **The Winchmaster's shaft is a dark void.** Spread 13.9 in the boss shot: the buckets hang in black and the boss
   isn't in the frame ([oreroad-11](../../work/lookfeel/oreroad-11-boss.png)).
   - Fix: light the drum house (a brazier at the drum, lamps on the cable towers) and frame the fight so the drum
     is in view. **[ART-S]**
4. **The boss track is `boss3`,** shared with the Deep, the Keep and the Burial Caverns.
   - Fix: a Winchmaster track. **[AUDIO]**
   - Recurs: see the game-wide music list.
5. **Cairns in a mine** (4 dressed, plus `cairn` in the ore road kit, `dressing.js:259`). This item is still open
   in the queue.
   - Fix: swap them for mine pieces (props, sleepers, ore sacks). **[ART-S]**
   - Recurs: Highcrown (3 cairns in a castle), the Monastery and Gale Moor (by design there).

## 3. GALE MOOR (`moor`)

1. **The Scree Path's backdrop.** `far/mid/near = crag`: the same purple dusk hills and sun disc as the Scree Path
   two levels back ([moor-02](../../work/lookfeel/moor-02-route2.png) against
   [scree-05](../../work/lookfeel/scree-05-route5.png)). F6 fails in a thumbnail. The palette's own sky
   (`[126,148,182]`, grey-blue) is lost under the dusk bands.
   - Fix: a moor set: a low grey-blue sky with scudding cloud, heather ridges in two bands, no sun disc, and the
     standing stones as the landmark silhouette. **[ART-M]**
   - Recurs: every crag level (game-wide fix 2).
2. **Both tracks are borrowed.** `adventure.mp3` is a store menu tune, and the Windcaller plays `musMountain`, a
   32 s stage-select loop.
   - Fix: a moor track and a Windcaller track. **[AUDIO]**
3. **The updraft vents draw as columns of pale pink squares** in the Windcaller's arena
   ([moor-11](../../work/lookfeel/moor-11-boss.png)). At 1x they read as a rendering fault, not rising air.
   - Fix: thin streaks and lifted grass and chaff instead of filled squares. **[ART-S]**
4. **The Marsh's dirt under the moor.** The same brown fill with orange root sprigs
   ([moor-06](../../work/lookfeel/moor-06-route6.png)).
   - Fix: peat: a darker, redder fill with stone, and heather tufts on the lip. **[ART-S]**
   - Recurs: game-wide fix 1 (the fill).
5. **A 105-route-tile checkpoint gap** from route 552 (into the Sky Road), and a near-pair at 399/406.
   - Fix: drop 406. **[LAYOUT]**

## 4. THE HANGING VILLAGE (`hanging`)

1. **One wall behind every floor.** The rework drew the cliff, but as a flat cracked stone wall that fills the
   whole backdrop on every tier ([hanging-01](../../work/lookfeel/hanging-01-route1.png),
   [hanging-06](../../work/lookfeel/hanging-06-route6.png),
   [hanging-09](../../work/lookfeel/hanging-09-route9.png)). You never see sky or the drop, so "a town on a
   cliff" reads as "a town in a cave".
   - Fix: cut the cliff back on the open side of each tier so the valley shows beyond the ledge (the Scree Path far
     below, cloud and birds). Add a far band that sinks as you climb. **[ART-M]**
   - Recurs: the Monastery's tower interiors, less badly.
2. **The lantern stair is an empty wall and a ladder** ([hanging-10](../../work/lookfeel/hanging-10-route10.png):
   spread 12, the lowest in scope).
   - Fix: the lanterns this stair is named for, hung on the wall, lit as you pass, plus rope, nests and a window of
     sky. **[ART-S]**
3. **Low chroma on the tiers** (5-9; the opening is 5.5).
   - Fix: warmer rock under the pale morning, as the art-direction note already did for the redress. Lift the
     house trims and the lamps. **[ART-S]**
4. **The level track is `town.mp3`,** a menu tune sold at the store. The rework brief says "No music" was left open.
   - Fix: a village track (a hurdy-gurdy or pipe tune). **[AUDIO]**
   - Recurs: Gale Moor.
5. **The Weaver's room is a dim brown box** ([hanging-11](../../work/lookfeel/hanging-11-mini.png)), and the
   Weaver plays the generic `boss` track.
   - Fix: webs across the back wall and the larder silhouettes lit from the shaft above. **[ART-S]**
   - Recurs: every mini plays `boss`.

## 5. THE MONASTERY (`spire`)

1. **Colourless.** Chroma 4-7 on half the route (spire-02 4.1, spire-07 5.5, spire-08 5.3): beige stone, grey fog,
   pale sky ([spire-02](../../work/lookfeel/spire-02-route2.png),
   [spire-08](../../work/lookfeel/spire-08-route8.png)).
   - Fix: saffron and red in the prayer flags, hangings and doors; warm lamplight in the refectory and scriptorium;
     less grey fog over the cloister. **[ART-S]**
   - Recurs: the Hanging Village and the Ore Road (rule 4).
2. **Both tracks belong to levels that no longer exist.** The level plays `sunspire`; the False Abbot plays `roc`
   (the old Roc's), and the golem plays `boss`.
   - Fix: at least give the Abbot his own. A chant-like loop would suit the level. **[AUDIO]**
3. **It opens on a grey brick wall** ([spire-00](../../work/lookfeel/spire-00-opening.png)). The climb's goal (the
   monastery above the clouds) is never shown at the start.
   - Fix: open on the gate with the towers rising behind it on the far band. **[ART-S]**
   - Recurs: Highcrown, the Hanging Village and Stormhold (game-wide fix 6).
4. **The cloud sea through a floor gap draws as a flat pale-blue slab** that reads as ice water
   ([spire-07](../../work/lookfeel/spire-07-route7.png)).
   - Fix: cloud tops with soft edges and a little motion in that window. **[ART-S]**

## 6. THE STOCKADE (`stockade`)

1. **No stockade.** The camp is drawn over the Wood's night tree wall, on grass and dirt. No palisade, stake wall
   or gate is in the backdrop on any route shot ([stockade-01](../../work/lookfeel/stockade-01-route1.png),
   [stockade-02](../../work/lookfeel/stockade-02-route2.png),
   [stockade-10](../../work/lookfeel/stockade-10-route10.png)).
   - Fix: a mid band of sharpened stakes and watch platforms with torches, and trampled mud for the grass.
     **[ART-M]**
   - Recurs: the Wood and the Marsh share the same tree wall (game-wide fix 2).
2. **The arrival is murk.** The opening screen's spread is 17.5, the darkest opening in scope
   ([stockade-00](../../work/lookfeel/stockade-00-opening.png)).
   - Fix: start at the camp gate, with two torches and the first horn tower on the skyline. That is the level's
     rule shown before it is read. **[ART-S]**
3. **The Kennel Yard bloom** (still true from 09-24). Three brazier glows blow out the ambush floor and the hero
   ([stockade-05](../../work/lookfeel/stockade-05-route5.png)).
   - Fix: halve the glow radius or alpha there. **[ART-S]**
4. **The Chieftain plays `boss2`,** shared with the Harbour and the Caravan.
   - Fix: a Chieftain track (war drums). **[AUDIO]**

## 7. HIGHCROWN (`crown`)

1. **Forest birdsong in the castle.** `L.ambient` covers only 0-468 and 854-890 (wind). Between them the page falls
   back to its default `'forest'` (main.js ~21855), so the kitchens, gallery and chapel play the wood's ambience
   outside the interiors rectangles ([crown-07](../../work/lookfeel/crown-07-route7.png) was recorded with
   `amb: forest`).
   - Fix: a `hall` or `wind` zone over the whole castle. Better, make the default `null`, not `'forest'`.
     **[AUDIO]**, data. See game-wide fix 5.
2. **Grey stone murk.** Spread 19-25 on most of the route, chroma 11, and the torch pools are small
   ([crown-02](../../work/lookfeel/crown-02-route2.png),
   [crown-04](../../work/lookfeel/crown-04-route4.png)). The Forgemaster's armoury is still dark
   ([crown-11](../../work/lookfeel/crown-11-mini.png)).
   - Fix: bigger warm pools under the banners and in the forge, and a lighter mortar line so the wall isn't one
     value. **[ART-S]**
   - Recurs: Stormhold and the Ore Road.
3. **It opens on a brick wall** ([crown-00](../../work/lookfeel/crown-00-opening.png)). This is the goblin queen's
   castle, the end of the road, and its first screen shows no castle.
   - Fix: the first 20 columns outside the walls, with the keep on the skyline. **[ART-S]** or small
     **[LAYOUT]**.
4. **The Burning Village's house front, with its fire-lit windows, stands inside the castle**
   ([crown-07](../../work/lookfeel/crown-07-route7.png)).
   - Fix: a stone or timber hall front of the castle's own. If the burnt look is meant for the kitchens, make it
     masonry. **[ART-S]**
5. **Checkpoint near-pairs** 682/696 and 750/756 (S4), and 10 loot heaps and 3 cairns as filler.
   - Fix: drop 696 and 756, and swap the cairns. **[LAYOUT]** + **[ART-S]**

## 8. UNDERLEAF (`underleaf`)

1. **It is the Burning Village without the fire.** Both use `set: village`: the same skyline silhouettes, the same
   cobbled street, the same stone lanterns ([underleaf-09](../../work/lookfeel/underleaf-09-route9.png) against
   [burning-02](../../work/lookfeel/burning-02-route2.png)). The two are neighbours on the wood sheet (F6).
   - Fix: this is "the king's own village" under the leaves. Give it the Kingswood canopy overhead in a night
     palette, roots over the rooftops, and moss on the cobbles. **[ART-M]**
   - Recurs: game-wide fix 2.
2. **Dark without pools.** Spread 19-28, and every window is dark.
   - Fix: a few banked-fire windows and hanging lamps, still hushed, so there are warm pools (rule 2). **[ART-S]**
3. **The boss nameplate sits on the hero.** The Grandmother's arena camera (`camBelow`) puts the floor at the foot
   of the screen, under the boss bar ([underleaf-11](../../work/lookfeel/underleaf-11-boss.png)).
   - Fix: raise the frame by the bar's height in that arena. **[LAYOUT]** (camera number)
4. **Forest ambience.** The level is `hush`, so it should have a night bed: crickets, a far owl, one creak.
   **[AUDIO]**

## 9. THE BURNING VILLAGE (`burning`)

1. **Both tracks are borrowed** from THE QUARRY PASS: `quarry` for the level and `hilltroll` for the Pyromancer.
   - Fix: a Pyromancer track at least. It is the class level that sells a hero. **[AUDIO]**
2. **Forest birdsong in a burning village** (`amb: forest`).
   - Fix: a fire-and-crowd bed: crackle, a bell ringing, shouts far off. **[AUDIO]**
3. **A grey stone lantern (the `lanternPost` prop) stands in the barn and on the street**
   ([burning-08](../../work/lookfeel/burning-08-route8.png),
   [burning-06](../../work/lookfeel/burning-06-route6.png)). It reads as a Japanese stone lantern.
   - Fix: redraw `lanternPost` as a timber post with an iron lamp, or keep it out of the village kit. **[ART-S]**
   - Recurs: the Wood, the Marsh and Underleaf (game-wide fix 7).
4. **Half the screen is a black speckle** under the cobbled street ([burning-02](../../work/lookfeel/burning-02-route2.png)).
   - Fix: cellars and foundations in the fill (the level already has `cellarFires`), fading to black. **[ART-S]**
   - Recurs: game-wide fix 1.

## 10. THE SCREE PATH (`scree`)

1. **The Crag Climb is one flat striped face** that fills 60% of the screen (still true from 09-24,
   [scree-09](../../work/lookfeel/scree-09-route9.png)).
   - Fix: ledges, roots and a nest, and break the stripes with a crack line. **[ART-S]**
2. **The run-in to the Ram Lord is quiet.** The strip ends `PHR-S----RBB`, 48 light route tiles before the fold,
   so the level's exam (S3) happens earlier and the boss arrives after a lull.
   - Fix: bring one scree strip and a loose-rock drop into the last 60 columns, with a goat placed on the landing
     (S1). **[LAYOUT]**
   - Recurs: Marsh Wood.
3. **Stone x18, cairn x11** are the dressing. The ground kit (heather, gorse, thistle) still loses to the redress
   kit.
   - Fix: mix them. **[ART-S]**
4. **Checkpoint near-pair** 397/404 (S4). Fix: drop 404. **[LAYOUT]**

## 11. SPOREWOOD (`spore`)

1. **The same violet screen from start to finish.** The glade, the bog, the hollow and the terrace all sit on one
   cap-forest backdrop ([spore-02](../../work/lookfeel/spore-02-route2.png),
   [spore-05](../../work/lookfeel/spore-05-route5.png),
   [spore-10](../../work/lookfeel/spore-10-route10.png)).
   - Fix: a light progression through the level: pale morning in the glade, green bog gas in the middle, deep
     magenta toward the Mother. The seven `tints` bands already exist, so push them further apart. **[ART-S]**
2. **No warm pool** (spread 20-30, glowbuds cyan).
   - Fix: a few amber spore lamps (the `sporePod` light) so the cool screen has its warm accent (rule 5).
     **[ART-S]**
3. **The level track `cave.mp3` is credited as "the Mineworks theme".** It is the only cave-style track on a wood
   level.
   - Fix: a fungus-wood track. **[AUDIO]**, low priority.
4. **The web pylons** (cobweb columns) read as steel lattice towers at 1x
   ([spore-02](../../work/lookfeel/spore-02-route2.png)).
   - Fix: sag the strands and drop the straight cross-bracing. **[ART-S]**

## 12. THE HIGH STORE (`shopCrag`)

1. **A murky cellar.** Spread 17.6 with one small wall lamp
   ([shopCrag-01](../../work/lookfeel/shopCrag-01-inside.png)). It is the store on the mountain road, and it reads
   as a dungeon.
   - Fix: a lodge: a timber wall, a hearth (the `hearth` light already exists), furs, rope, and a window with the
     crags outside. **[ART-S/M]**
   - Recurs: rule 2 (Stormhold, Highcrown).
2. **All three stores play one tune** (`store.wav`).
   - Fix: a crag variant, or at least the crag wind under it. **[AUDIO]**, low priority.

## 13. MARSH WOOD (`marsh`)

1. **It uses the Wood's tree wall, recoloured** ([marsh-05](../../work/lookfeel/marsh-05-route5.png) against
   [wood-04](../../work/lookfeel/wood-04-route4.png)). The boardwalk stilt village
   ([marsh-08](../../work/lookfeel/marsh-08-route8.png)) is the look the whole level should have.
   - Fix: a marsh far band of drowned trunks, reeds and mist, with the stilt houses on the mid band. **[ART-M]**
   - Recurs: game-wide fix 2.
2. **56 quiet tiles before the Frog King.** The strip ends `AAX.S-R.-BBB`, so the archer crossing and the sinking
   pads (the level's own exam) finish well before the door (S3).
   - Fix: move one pad crossing under archer cover into the last 50 columns. **[LAYOUT]**
   - Recurs: the Scree Path.
3. **A cool level with little warm answer** (warmth -0.32).
   - Fix: light the lily lanterns (4 today) and put windows on the stilt houses (rule 5). **[ART-S]**
4. **Checkpoint near-pair** 206/216. Fix: drop one. **[LAYOUT]**

## 14. KINGSWOOD (`kings`)

1. **Warm everywhere** (warmth 0.73-0.96 on every shot, the highest in scope). Rule 5 asks a warm level for a cool
   accent ([kings-02](../../work/lookfeel/kings-02-route2.png)).
   - Fix: blue dusk shadow under the stands, cool lamp glass, a stream. **[ART-S]**
2. **Board stripes buried in the dirt** under the court road (still true,
   [kings-08](../../work/lookfeel/kings-08-route8.png)).
   - Fix: plain earth fill, or show the boards as a revealed buried palisade with a lit edge if they are meant.
     **[ART-S]**
3. **The Great Hound's room** is a flat strip that plays the generic `boss` track
   ([kings-11](../../work/lookfeel/kings-11-mini.png)).
   - Fix: kennels and chains framing it. A hound track can be shared with the Hound Master's. **[ART-S]** +
     **[AUDIO]**
4. **Checkpoint near-pair** 400/405 (S4). Fix: drop 405. **[LAYOUT]**

## 15. BRACKEN WOOD (`wood`)

1. **The Queen's arena is half dirt.** The camera frames the Queen at the top edge and 50% of the screen is fill
   ([wood-11](../../work/lookfeel/wood-11-boss.png)).
   - Fix: game-wide fix 1, plus an arena `camY` offset for a flier. **[LAYOUT]**
2. **Stone lanterns in the forest** (`lanternPost`: [wood-04](../../work/lookfeel/wood-04-route4.png),
   [wood-06](../../work/lookfeel/wood-06-route6.png)). Game-wide fix 7. **[ART-S]**
3. **The Hornet Queen plays the generic `boss` track.** The first boss of the game should sound like one.
   **[AUDIO]**
4. **Checkpoint near-pairs** 108/126, 166/175 and 266/281 (S4). **[LAYOUT]**

---

## GAME-WIDE FIXES (do once)

1. **The camera and the fill.**
   - The problem: `updateCamera` keeps the hero's feet at 58% of the screen (`ty = P.y - VH*0.58`). On every flat
     level, about 40% of the frame is the fill under the floor: a single noisy dirt or speckle texture. The
     backdrops, where most of the polish lives, get the top third.
   - Worst in: wood, marsh, stockade, spore, burning, underleaf, moor, and the boss arenas of the wood and Highcrown.
   - Fix (a): feet at about 0.66-0.70 when grounded; keep `lookDown` and the fall peek. **[LAYOUT]**, one number.
     Tall levels need a play check.
   - Fix (b): fade the fill to a flat dark tone 2-3 rows below the surface, so the lower frame is quiet rather than
     busy. **[ART-S]**
2. **One backdrop set for many levels.**
   - `far/mid = crag` (purple dusk hills and sun) is under seven levels: Scree, Hanging, Monastery, Gale Moor, the
     Ore Road, Stormhold, and Highcrown's far band. The forest tree wall is under Wood, Marsh and Stockade.
     `set: village` is under both the Burning Village and Underleaf.
   - Fix: a far/mid pair per level, cheapest first:
     - Gale Moor: open sky and heather.
     - Stockade: a palisade band.
     - Underleaf: a night canopy.
     - Stormhold: snow peaks at night.
     - Highcrown: ramparts and towers.
     - Marsh: drowned trunks.
   - **[ART-M]** each; one lane can do them as a set.
3. **Music.**
   - Eight levels borrow a track:
     - Burning: `quarry` + `hilltroll`, both the Quarry Pass's.
     - Hanging: `town`, and Gale Moor: `adventure`. Both are store menu tunes.
     - Monastery: `sunspire` + `roc`, both from the removed Sunspire and Roc.
     - Sporewood: `cave`, the Mineworks theme.
     - Gale Moor's boss (`musMountain`) and Stormhold's boss (`musCastle`) are 32 s stage-select loops.
   - Shared boss tracks: `boss2` (the Chieftain, the Harbour and the Caravan) and `boss3` (the Winchmaster, the Deep,
     the Keep and the Burial Caverns). The Hornet Queen and every mini play the generic `boss`: the Great Hound, the
     Weaver, the Facet and the Forgemaster.
   - Fix, in order of return:
     - the Hornet Queen (the first boss);
     - the Pyromancer (a class level);
     - a mini-boss track shared by all the minis (one file, five rooms);
     - the Winchmaster, the Chieftain, the Windcaller and the Lance;
     - the Hanging Village and Gale Moor level tracks.
   - **[AUDIO]**. Each file needs Daniel's yes, with a named CC0 source (HANDOFF rule).
4. **Endings.**
   - The problem: every scope level ends on the kill. `bossWon` runs out, `winLevel()` fires, and the card drops
     over the arena ([wood-13](../../work/lookfeel/wood-13-after.png)). There is no walk out, no gate and no vista.
   - `L.gateAfterBoss` already exists (the Sunken Caravan uses it).
   - Fix: on the kill, open the arena's far wall onto 10-20 columns of road to a gate with the next level's
     landmark on the skyline: the crags after Kingswood, the castle after Stormhold. **[LAYOUT]** per level, small.
     The mechanism is built.
5. **The ambience default is `'forest'`** (main.js ~21855). Any column no zone covers plays birdsong.
   - It is heard in Highcrown's middle, and it is set explicitly on the Burning Village and Underleaf.
   - Fix: default to none, and give each level a bed: the castle `hall`/`wind`, the village a fire/crowd bed,
     Underleaf a night bed, the Hanging Village and Stormhold `town` under their `wind`. **[AUDIO]**, data only.
6. **Openings.**
   - The title card itself is good. But the first screen behind it is a wall or murk on the Monastery, Highcrown, the
     Hanging Village, Stormhold and the Stockade.
   - Fix: the first 20 columns show the level's landmark: the monastery above, the castle keep, the camp gate, the
     hold. **[ART-S]**, mostly far-band dressing.
7. **The `lanternPost` sprite** is a grey stone lantern and reads as a Japanese tōrō.
   - It stands in the Wood, the Marsh, the Burning Village's barn and street, and Underleaf.
   - Fix: redraw it once as a timber or iron lamp post with a lit lamp. **[ART-S]**
8. **Dark levels with no warm pools (rule 2)** and colourless levels (rule 4).
   - Dark: Stormhold, the Ore Road, Highcrown, the High Store, Underleaf, and the Stockade's opening.
   - Colourless: the Monastery, the Ore Road, the Hanging Village.
   - Fix: warm the light colour and add pools. **[ART-S]** each, but the same recipe.
9. **The map panel.**
   - The node panel cuts Tam's line and the subtitle ("TAM: THE MARSH NEXT. A KING CROAK",
     "the court under the lea").
   - "UNDERLEA" is cut by the panel, and the footer hints overprint ("X BEA…LOOP OFF")
     ([map-wood-01](../../work/lookfeel/map-wood-01-map.png),
     [map-kings-01](../../work/lookfeel/map-kings-01-map.png),
     [map-scree-02](../../work/lookfeel/map-scree-02-map-later.png)).
   - Fix: wrap to two lines or scroll the line; clip the footer. **[ART-S]** (UI).
10. **Checkpoint near-pairs (S4).**
    - Wood 108/126, 166/175, 266/281 · Marsh 206/216 · Spore 127/132 · Kingswood 400/405 · Scree 397/404 ·
      Moor 399/406 · Highcrown 682/696, 750/756.
    - Fix: one data pass. **[LAYOUT]**, small.

## PROPOSED POLISH LANES (cheapest with most impact first)

1. **Lane A: data and audio beds.**
   - Game-wide 5: the ambience default and a bed per level.
   - Game-wide 10: the checkpoint near-pairs.
   - Game-wide 9: the map panel text.
   - Highcrown's birdsong goes with the first item.
   - No new art, touches every level in scope, about a day.
2. **Lane B: light and colour.**
   - Game-wide 8 on the Ore Road, Stormhold (if the held branch isn't shipping) and the Monastery: warm lamps, ore
     and hangings, and the edge-light cap on the Ore Road's foes.
   - The Kennel Yard bloom.
   - Levels 1, 2 and 5 on the list. **[ART-S]**
3. **Lane C: the camera and the fill.**
   - Game-wide 1: the one camera number, plus the fill fade.
   - The Hornet Queen's and the Grandmother's arena framing.
   - Every level at once. Needs a play check on the tall levels.
4. **Lane D: Gale Moor + the Stockade + Underleaf backdrops.**
   - Game-wide 2 for the three levels whose borrowed set shows most: open moor sky and heather, a palisade band, a
     night canopy.
   - Plus the `lanternPost` redraw (game-wide 7). **[ART-M]**
5. **Lane E: the Hanging Village + the Monastery + the High Store.**
   - Open the cliff to the valley.
   - Dress the lantern stair.
   - Chroma on the tiers and the monastery.
   - Open the Monastery on its gate.
   - The High Store as a lodge. **[ART-S/M]**
6. **Lane F: endings and openings.**
   - Game-wide 4 and 6 on the road levels, using `gateAfterBoss`.
   - Highcrown's outer approach, Stormhold's gate and the Stockade's camp gate.
   - **[LAYOUT]** + **[ART-S]**
7. **Lane G: music** (needs Daniel's per-file yes first).
   - The Hornet Queen, the Pyromancer, one shared mini track, the Winchmaster, the Chieftain, the Windcaller and
     the Lance, then the Hanging Village and Gale Moor.
   - Can run beside any lane above.
8. **Lane H: exams and the last details.**
   - The Scree Path's and the Marsh's run-ins (S3).
   - The Crag Climb face, Sporewood's light progression, Kingswood's cool accent and buried boards.
   - Highcrown's house front and cairns. **[LAYOUT]** + **[ART-S]**

Stormhold's items go to whoever reviews `claude/stormhold`: check the held branch for 1, 2 and 5 before it merges.
