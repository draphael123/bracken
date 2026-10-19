# claude/tavernart - THE CROSSROADS INN, ART PASS (sonnet)

Branch `claude/tavernart` off `claude/tavern` 4ace9885. Art only: geometry, ents, stations and the level hash are untouched (src/level.js not edited; STATIONS/ROOM/DUMMIES/TARGET unchanged).

## WHAT IS DRAWN (per ART LIST id)
- **tiles** (`src/redraw/tavern_tiles.js`): worn-oak floorboards (lit lip, seams, sill beam), a hearth-stone flagstone apron under the fire (soot in the middle slabs), the yard's packed sand with straw and pebbles, the ceiling's dark boards, corner posts over limewash, and the CELLAR under the floor (coursed stone; a cask niche with stacked barrels and a lamp every eight tiles). The cellar is what shows under the floor line, so it carries the inn's identity instead of blank rock.
- **dressing / room** (`src/redraw/tavern_backdrop.js`, baked once into two layers + live parts): limewash wall in shade, timber frame (plate, posts, braces, rail), oak wainscot, a stone chimney breast with mantel (plates, candlestick, stag antlers), firebox with iron back, logs, andirons, log stack, poker and tongs; the **fire** (7 flame tongues, bed, rising sparks, a swinging cauldron that steams, warm light breathing on the wall); the **window onto the road** (parallax view: far hills, treeline and cottages, a crossroads signpost, a lit lamp-post, a carter with a lantern crossing every 36 s; the sky cycles dusk, night, dawn every 2 min; leaded diamonds, gloss, curtains, a sill with candle and herbs); **two long tables + benches** with eight **drinkers** (six Waymeet folk: straw-hat farmer, carter in cap, old woman in shawl, red-hooded merchant, bareheaded lad, hooded traveller; 3-frame idle loop each on its own clock: rest / sip / laugh); the **bar** (back-shelving of bottles and tankards, chalk price board, oak-panelled counter, brass foot rail, three taps, kegs) with the **barkeep** (polishes a tankard, now and then nods); hanging iron **lanterns** with gutter and glow.
- **door** (`src/tavern-art.js door`): oak with iron straps under a stone arch and a lit bracket lamp; 2 states (shut / open): open shows the night road, a lamp-post, the signpost and a traveller's silhouette.
- **board**: cork in timber, pinned bills, wax seal, chalk slate: blank dashes until a room is open, then the 4-letter code (with a chalk twinkle).
- **table**: a tilted map board on trestles, the world map (land/water/crossroads), pins, a rolled chart, a candle (live flame).
- **wardrobe**: painted green-blue cupboard, doors swung open, four cloaks hanging in the party colours (red/blue/green/violet), sword + axe + staff rack, cheval mirror (with a moving shine).
- **drills board**: chalkboard on posts, three drills chalked (THROW arc, REVIVE cross, TEAM HIT), live chalk tallies per drill (a strike-through at five).
- **bell**: brass bell on a post arm with a pull rope; rest + swinging (clapper, ringing arcs).
- **dummies**: two own SPR sets (`dummySet`): a sack head with a stitched face, and a dented pot helm; 2 frames + white hit frames, same anchors/size as the old straw man (hook: main.js enemy sprite pick, `L.tavern && e.t === 'dummy'`).
- **target**: painted rings on the yard floor (gold/cream/red/centre that blinks) between hay bales (static, in the room bake) with a third bale on top.
- **practice**: stone gatehouse arch, oak leaves ajar, warm yard light flickering in the opening with a straw man silhouetted, a lamp on a bracket.
- **arena**: oak kerb ring and sanded pit let into the floor (raked furrows, shaded back wall), a rope on brass-capped posts, the COMING SOON board (oxblood, chalk lettering, a glint sweeps it) on two posts, and the empty VERSUS stage slate in a chained frame beside it.
- **yard**: open arcade of stone piers under dark rafters, a low coped stone wall, night sky with moon and twinkling stars, the roofs of Waymeet in silhouette with lit windows, a weapon rack, a sack of sand.
- **glint**: a bobbing gold plate with a mark on it + a 4-corner sparkle over each unused station.
- **rings**: pixel floor ring (rx 9 / ry 3), far half behind the hero, near half over the floor with a faint fill and a dark rim (reads on the pale sand), 2-frame shimmer. Uses the hero's exact colour pixels (tools/tavern.mjs counts them).
- **tag**: dark slate plate edged in his colour with a pointer; "P1..P4" is still drawn by the game's own `text()` (tavern.mjs reads that); the AI partner's plate is violet.

## PALETTE (src/redraw/tavern_pal.js, Waymeet's own)
Oak `#24170e/#3a2618/#5a3e28/#7a5634/#9a6e3e/#c08a50` (town_art OAK + ramps), limewash `#5e4a36..#e4d2ae` (town_art LIME in candlelight), hearth stone `#24202c..#aaa4b4` (the town hearth's `#6a6474/#5e5868/#77707f`), fire `#b83c1c/#ff8a3c/#ffd36b/#fff6c8`, brass `#c9962a/#ffe27a`, iron `#1e1e24..#8a919c`, sand `#8a6c44..#dcc38c`, hay `#9a7e38/#c9a040/#e0c070`. Outline `ART.OUT`. Two accents added: oxblood curtains and the wardrobe's green-blue paint.

## ANIMATIONS
Fire + sparks + cauldron steam, wall glow breathing, 8 drinkers (3 frames, own clocks), barkeep (3), hanging lanterns (swing, gutter), door lamp, gate lamp + light, candles (sill, map), window (sky cycle, parallax, carter, stars), yard stars, bell swing, sign glint, mirror shine, glints, ring shimmer.

## HOOKS (the only game-code touches; all `L.tavern`-gated except the ring/tag)
`src/main.js`: three imports; tile pick (`TVT.tavernTile`); the interior loop calls `TVB.drawRoom` for the inn instead of the shared plank room; `drawScenery` skips the greybox furniture kinds the room paints itself (hearth, longTable, bench, counter, caskRack, mugShelf, kegStack, hallWindow; their LIGHTS are still pushed, so the lighting is unchanged); the old beer-garden guests are not drawn in the inn (the room draws its own seated drinkers); the enemy sprite pick for the dummies; `drawPartyMarks` uses `TVA.ring` / `TVA.tag` (all co-op, not only the inn). `src/tavern.js`: `draw` calls the station art instead of plain fills.

## SELF-GRADE vs design-standard A8 (a fixed room, not a level)
Own tile kit + palette: yes. Landmark in view: the chimney breast with the live fire, and the window. Lights: fire, hanging lanterns, candles, lamps, wall glow (plus the game's own hearth/torch/counter lights). Own ambient bed: already `tavern`. Set pieces that are also verbs: the bell (rings), the board (chalks the code), the wardrobe (open doors, party cloaks), the arena sign. Dressing with contrast: dark wainscot behind light hero silhouettes, bright fire/window against warm limewash. No floating platforms, no plank platforms; timber is furniture and frame only. Self-grade: identity 15/18, polish 8/10, NOT yet seen in the game (see checks).

## CHECKS RUN
- `node --check` on every touched file (src/main.js, src/tavern.js, src/tavern-art.js, src/redraw/tavern_{tiles,backdrop,pal}.js): clean.
- A headless-canvas bake of the tile kit, the room, every station state (door shut/open, board blank/coded, bell rest/ringing, 4 rings + tags) and the dummies, and `makeTavern(...).draw` against a stub api: runs clean (scratch harness work/tmp-tavernart, not committed).
- NOT RUN (BATCH101 gate still running, no-browser rule): tools/tavern.mjs (116 asserts incl. the rings/tags/ART-list ones), tools/check.mjs, any page screenshot, a frame-time check. **The first browser run must be tools/tavern.mjs plus one look at the room.** Most likely to need a nudge once seen in-game: the warm-glow strength under the game's own light layer, and how the floor-standing torch poles sit against the new wall.
- Hash: no level data touched; STATIONS, ROOM and ents unchanged.

## SCREENSHOTS
Headless-canvas renders at 400x225 (x3): tile kit + room + stations + four sample rings/tags; NOT in-game frames: `work/claude/lane-done/claude-tavernart-west.png` (door, board with code, fire, window), `claude-tavernart-hall.png` (window, tables and drinkers, bar, map table, wardrobe), `claude-tavernart-yard.png` (drills board, bell swinging, hay, gate, arena pit and sign).

## KNOWN GAPS / NOTES
- The torch ents (tiles 11/33/43/60) still draw as the game's floor-standing pole torches in front of the new wall; not replaced (art only, no ent moves).
- The arena pit is painted into the floor line (the floor tiles stay flat, no geometry change): a sanded ring inside rope, not a hole.
- The window cycle runs on game time, not the real clock.
- New files are LF; git normalises per the repo's autocrlf.

## QUESTIONS FOR DANIEL (rec first; what is built)
1. Window onto the road: a slow dusk-night-dawn cycle (2 min). Rec: keep. Built: yes.
2. The wardrobe's four cloaks are a fixed red/blue/green/violet, not the seats' chosen colours. Rec: keep ("a cloak for every friend"). Built: fixed.
3. The ring/tag redraw also applies in the woods (co-op), not just the inn. Rec: keep (one look for the party everywhere). Built: yes.
