CW3ART DONE 11-07 (code-only art pass for Causeway 2, behind the same ?cw3=1 flag; browser stills OWED) - tip 4d3220e09 (pushed)

# claude/cw3art - THE DROWNED CAUSEWAY 2: ART PASS (11-07, code-only, no browser)

Branch `claude/cw3art` off `claude/causeway3w` aa0c3a114. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-cw3art`. Pushed. NOT merged, NOT deployed. Kraken boss files untouched (no src/kraken*, no arena code).
The art is on `L.cw3Kit` (set only in the ON build in src/causeway3.js): flag OFF = master's Causeway unchanged (tools/causeway3.mjs hash check green).

## What was drawn (all new files except the wiring)
| file | what |
|---|---|
| `src/redraw/causeway3_tiles.js` | TILE KIT `cw3Tile`. Pilgrim stone by act: I late-day limestone, DRY (salt crust, moss, worn rut, cut pilgrim crosses); II dusk violet, TIDE-WASHED (algae film, barnacles); III night blue-black with a cold sheen; the light's own whitewash + red bands + lit windows + granite steps with BRASS NOSINGS. By cell: the WRECK hull (tarred storm timber, ribs, copper-green waterline, flaked red wale; timber is on-theme), FALLEN TOWERS (ashlar, arrow-slits, ragged broken head), CHAPEL (slate roof, buttresses, lit lancets), UNDERSEA vault stone for the crypt + sea arch (voussoir ceilings, silt floors, weed), cove/basin MUD, SEA BED, stepping-stone coping, ledges = stone slabs on corbels, lamp gallery = iron grating, shrouds = tarred rope + ratlines, rungs = iron chain ladders (no wood), THE PILGRIMS' GATE = iron-barred gate with a cross on the lintel. x>=933 (Kraken's reach) returns null: master's own art. Tide line baked on piers: salt above act I's high water, weed + shells below. |
| `src/redraw/causeway3_back.js` | SKY by stage (9 baked columns cross-faded by progress: pewter dusk -> violet dusk -> night), a CLOUD WALL (dusk + night bakes, lit lower lips, rain curtains), the FAR SHORE with the CAUSEWAY ITSELF going out on piers with storm lamps, and THE LIGHTHOUSE on the horizon from screen one: baked at 3 sizes (one per act), nearer/higher/clearer with k, lamp room lit, beam wedges sweeping (brightest when facing you), a glimmer path on the sea. LIGHTNING: `glow` (main.js skyGlow) lifts the clouds white-blue and draws a forked bolt cloud->sea; night has a heat flicker. |
| `src/redraw/causeway3_art.js` | PIECES: BELL (stone gibbet, bronze + verdigris, swing, ring flash), SLUICE WHEEL (8 spokes, brass hub, chain, spins, brass hold bar), FLOODGATE LEVER (slotted plate, up/down), GUN (iron barrel on a tarred truck carriage, breeching rope, barnacles, breech glint; fired = rocked back), STORM LAMP (iron post, caged glass; lit = flame + halo + rain glints; dark = cold glass + spark; gate lamp = brass plate), FERRY (clinker hull, red-lead wale, plank deck, stem/stern irons, mast stump, rope coil, stern lantern), iron RING, AIR POCKET (silver skin, ripples, bubbles), KRAKEN ARM told (shadow, bulge in the stone, cracks, red chevron) + the arm itself (taper, curled tip, suckers, spray, smash flash), WARNED LIGHTNING STRIKE MARK (ward-ring shrinking on the stone, sparks drawn in, leader, hair standing), COLLAPSE CRUMBLE (cracking column: amber seams -> red, shake, dust; the front's dust/spray), WET ROAD (flags darken + glint while a tide stands on them, dry off over ~7 s; live), cottage, waymark, gulls, brass TIDE GAUGE (one drawing; fold into pfart's drawGauge when claude/pfart merges). |
| `tools/cw3art-sheet.mjs` | node-only software-raster contact sheets (no browser). `node tools/cw3art-sheet.mjs [outdir]` -> `work/claude/lane-done/cw3art-sheet.png` (all), `cw3art-tiles.png` + `cw3art-tiles-1..9.png` (real level spans), `cw3art-sky.png` (5 stages + a lightning frame), `cw3art-pieces.png`. Copies in scratch\lane-reports\cw3art-*.png. |

## Wiring (small, one-line hooks; merge-friendly)
src/main.js: one import line; tile hook `if (L.cw3Kit) CW3T.cw3Tile(...)` before `tileSpr[...] = s`; backdrop `else if (L.cw3Kit) CW3B.drawBackdrop(...)` (passes skyGlow); `lantern` prop -> CW3S.drawLamp; `cannon` prop -> CW3S.drawGun; drawStrike -> CW3S.drawStrike when cw3Kit. src/causeway3-hands.js: drawSky/drawBack/drawMover/drawOver branch to the art when L.cw3Kit (the greybox draws stay as the fallback), plus a per-tide wetness tracker. src/causeway3.js: `cw3Kit: true` on the ON build only.

## Node results (no browser, no puppeteer/CDP; RAM >= 2.8 GB free at each run)
- `node --check` on every file touched: ok.
- `node tools/causeway3.mjs`: **98 ok** (flag-off hash still the base's).
- `node tools/cw3art-sheet.mjs`: renders all sheets (every piece and tile builder executes; no invalid colours after fixing 3-digit hex in the sheet's raster).
- Eyeballed the sheets: sky stages read (cloud wall -> night, lighthouse growing, forked bolt), pieces read, tile spans read (act I dry, wreck hull, chapel, undersea vault, mud, light's steps).

## OWED (browser, after the suite): stills at ?cw3=1&level=causeway
1. Landing (x~10), the stones/sluice (~100-145), the cove ferry at low vs high water (~160-176), the gun + fallen tower (~230-246), act I look overall.
2. Wreck + shrouds (~315-340), chapel (~372-404), undercroft drained vs flooded (~406-432), the sea arch with a ring + air pocket (~433-496), act II dusk.
3. Dark mile lamps lit/dark + the Pilgrims' Gate (~606-700), the last bell (~704-766), a lightning flash on the clouds + a warned strike mark, act III night.
4. Arm tell and slam, COLLAPSE crack front (~805-903), the lighthouse steps + tower (~904-932), the wet road drying after a tide.
Check specifically: (a) the backdrop chain actually reaches `L.cw3Kit` (it sits inside the `SET.parallax !== 'off'` branch after the towpath line; an earlier branch could catch the level first); (b) the cw3 backdrop vs SEA.seaFar / leviathan ordering (sky is opaque, drawn before seaFar); (c) master's storm lantern + deco props (waystone, wayShrine, brokenArch, figurehead, mastStump, seaChest, tent, lanternPost, fencePosts) still draw master's generic art - I did not replace deco kinds; (d) lamp glow overlap with the main.js darkZones lighting; (e) the lighthouse beam alpha at night.

## Not done / notes for Daniel
- deco kinds (waystone, wayShrine, brokenArch, figurehead, mastStump, seaChest, tent, lanternPost) keep master's generic drawers; the figurehead/mastStump/seaChest are ship pieces so they are fine, the waystone/wayShrine could get pilgrim-stone variants (small follow-up).
- The tide gauge dial duplicates pfart's `drawGauge` in spirit; fold after claude/pfart merges.
- Kraken's reach (933+) is deliberately master's art; KRAKEN 3's lane owns it.
