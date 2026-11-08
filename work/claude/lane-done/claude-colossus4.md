# claude/colossus4 - THE GLASS SEA + COLOSSUS 4 (11-05, OPUS greybox, unattended, code-only)

Branch `claude/colossus4` off `claude/desertkit` (6dfb815bd). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-colossus4`. Pushed. NOT merged, NOT deployed.
Sources: scratch/plan-desert-1105.md (PHASE A "OPUS beam-path + Colossus 4", s1.5, s2, s3a/3j, s5, Q5/Q6), brief-colossus4-1014.md, desertkit report + docs/desertkit.md, level-review-1105.md (Glass Sea 5.7, 0 sections).

## Build plan (as run)
1. `src/beam-path.js`: the drawn light, built once (path, light.js segs -> polylines, clip, at, the instant edge, painter + floor marker).
2. `src/colossus4.js`: the flag (`COL4_SHIPS = false`) + the x1.6 stage + the light numbers. Off = master byte-for-byte.
3. Colossus 4 in `src/glass-colossus.js` (all behind `G.c4`): x1.6, the light lands on him = instant open, HE COMES TO THE LIGHT, lance-next, the B15 floor. Bot (colPlan) climbs 5 rows and works the new light.
4. Hands: draw every light with beam-path, scale the body, the flash, the words.
5. The level (behind the flag): THE SHATTER-PANES section, THE GLYPH COURT (Temple find + priest cache, via sun-puzzle), one checkpoint fewer, a mirage entry.
6. `src/sunroom-hands.js` + main.js wiring (generic `L.sunRooms`). The desert kit, wired once for every later level.
7. Node tools: `tools/colossus4.mjs` (48 checks + node bot flow sim), `tools/beam-path.mjs` (11). The cdp env hook so bossLab can run the flag. Lints.

## Built
| file | what |
|---|---|
| `src/colossus4.js` (new) | `COL4_SHIPS=false`. `col4On()` is true from `?col4=1`, from `globalThis.BRACKEN_COL4`, or from `BRACKEN_COL4=1` in Node's env. STAGE4 (80 wide; stations 20/40/60; mirrors 10/30/50/70; braziers on each mirror's outer side; holds at rows 3/6/9/12/15; crown 19). COL4 (115x320, the scaled reaches, B15 floor 0.4). LIGHT4 (the words). |
| `src/beam-path.js` (new) | `path`, `fromSegs` (light.js / sun-puzzle segments), `clip`, `at`, `edge`, `drawBeam` (solid + glints / dotted preview / landing ring), `drawMarker`. |
| `src/glass-colossus.js` | `useCol4(on)` lays STAGE4/COL4 on or restores master's snapshot. `c4Lights(S)`: P2 a mirror TO THE FIRE throws its brazier's light **inward** along the floor. P3 a mirror TO THE SKY throws the dawn (east sun, parallel rays) **west** onto a crown. Each light lands on one fixed station (fire 10->20, 30->40, 50->40, 70->60; dawn 30->20, 50->40, 70->60; 10 -> the wall). **THE INSTANT**: a light landing on his station opens him the same frame ("THE DAWN BURNS HIM" / "THE FIRE BURNS HIM", flash + shatter). It cuts any tell. It waits only for a walk mid-stride, a shake, or a phase. **HE COMES TO THE LIGHT**: a light lined up on another station makes his next move a walk there, a station at a time; he burns on arrival. **P1/P3 LANCE NEXT**: a mirror FACING him on your side brings the lance forward, at most once every 6 s. **Ward end**: every light still on him is knocked round (no chain-lock with two fires on the middle station), and the B12 lockout applies. **B15**: outside openings and the told ward, blows land at 0.4x with the word (master is 0 once the leg purse is spent). Bot: `climb4` ladder; P2/P3 turn the mirror that lands on his station. |
| `src/glass-colossus-hands.js` | `drawLight4`: every light drawn brazier/sun -> mirror -> landing, with a ring + the HE COMES TO THE LIGHT marker on an empty station, or "falls on the wall". The P1 lance preview + HIS LANCE COMES NEXT. The 0.35 s white flash. The body scaled x1.6 about his feet. The burn fx. The eye line follows `G.eyeH`. Words wait until they fit (textfit). `H.fix` passes floor blows through. |
| `src/redraw/glass_colossus_art.js` | The gaze eye height reads `G.eyeH` (175 = master). |
| `src/glass-sea.js` | Off: identical (checked: grid, ents and arena equal desertkit's). On: W 688, arena 80. **THE SHATTER-PANES** (x383-419): the skull's back is split; six T.CRYST panes (they craze under you and grow back), each on a fused-glass spire from the chasm floor (anchored). Drop, gap, 2-row hop UP, drop, gap, drop, the skull's knuckle and a steep SLICK run, so the slick remix stays. A fall is THE CRACK (20, back to the crown). No foe inside: the crown hunter moved to 371 and the skull's foot moved 14 east. **THE GLYPH COURT** (x296-312, on the main road before the sunset): a sun shaft on a strike-mirror; struck, it lights the SUN-GLYPH lamp on the Temple door ("THE SUN-GLYPH BURNS: THE SUN TEMPLE LIES BEYOND THE FORK"); `L.templeSpur` data for the Temple lane. **PRIEST CACHE**: a sun-seal in the floor (302-303) that only his UP beam opens, with a silver under it. The checkpoint at 548 is removed (5 -> 4). A light-touch mirage (false shade, data only: the mirage lane wires it). `hasCryst`. |
| `src/sunroom-hands.js` (new) + `src/main.js` | Generic `L.sunRooms` hands: sun-puzzle step, blows turn mirrors (`hb` strike hook), doors/caches open as tile changes, lamp events, beam-path drawing. `PRIEST_RAYS()` is the hook the claude/desertpriest merge defines (until then a cache stays sealed). No master level declares sunRooms, so nothing live changes. |
| `tools/cdp.mjs` | `BRACKEN_COL4=1` injects the flag into every page document, so the lab's reloads keep it. **The bossLab hook:** `BRACKEN_COL4=1 PORT=<port> node tools/boss-rates.mjs glasssea --seeds=6`. |
| `tools/colossus4.mjs`, `tools/beam-path.mjs` (new), `tools/check.mjs` | Two lines (beam-path, `colossus4 --checks`). The node bot sim: `node tools/colossus4.mjs --sim=N`. |

## Node / lint results (one at a time; no tools/check.mjs)
- `node tools/colossus4.mjs`: **48 ok**. Covered: the flag both ways (and no leak when it is flipped back); x1.6; five 3-row climbs per side, every one with 32+ px to stand under; holds clear of mirrors at every station; the light map; the instant (cuts a gaze tell / a crack tell); HE COMES TO THE LIGHT (walk + burn in exactly the walk's time); the ward knocks both fires; the lockout; lance-next only with a facing mirror; the B15 floor; the panes; lintSunRooms + lintMirages clean on the built level; the Temple find before the sunset; the cache.
- **Node bot flow sim** (same colPlan the lab uses, one knight-physics hero, hp 300 / 18 dmg / 3 flasks, n=6): MASTER 4/6, avg 123 s; **C4 ON 6/6, avg 98 s**, every phase reached, 12 burns, opens cracked/blazing/dazzled 30/12/6. This is not the rate, but it says C4 is easier and faster (the waits are gone).
- `node tools/beam-path.mjs`: 11 ok. `tools/glasssea.mjs`: flag off 153 ok. With the flag on, every level check passes (rule, beams, day/night walks, cast, slopes) up to master's 64-wide arena asserts, which `colossus4.mjs` replaces for the flag.
- `platforming-lint --where glasssea`: off 0 sections (3 near-misses). **On 1 SECTION 6b/40t x385-419.** Still a WARN; the slide-gap near-miss (x136-148) is the second, owed.
- `level-quality glasssea`: off all ok. On: every row ok except **pilot + mash STALE** (level hash changed; both re-runs are page tools, owed). Checkpoints 4, one per 165 route tiles.
- `anchor-lint glasssea`: on = master (26). `floating-geometry`: the only new groups are his own walking holds (thigh/collar rows: machine cells, drawn on his body; master's are listed the same way). The panes are anchored on spires. `floaters`: clean.
- `sun-puzzle` 77 / `mirage-kit` 66 / `sun-kit` 79 ok. These kit tools read LEVELS rows unbuilt, so they never see a built level's sunRooms/mirages; colossus4.mjs lints the built level instead. **Tool gap** for the kit's owner.
- `dangling-paths` ok; `comments` no swallowed code; `node --check` on every touched file; filenames (beam-path, colossus4, sunroom-hands) are clean against the ad-block words.
- **Slip:** I ran `tools/damage-caps.mjs` without grepping it first; it opens a page through cdp. I stopped it within about 2 minutes and killed only its two orphaned headless Chromes (PIDs 23208, 5952; their parent was my stopped node). Its result is listed under "Browser owed".

## Browser owed
- **bossLab rate, n=6, with the flag**: `BRACKEN_COL4=1 PORT=.. node tools/boss-rates.mjs glasssea --seeds=6` (60-70% with flasks). Also mash 0/6.
- `level1-pilot glasssea --write` + `mash-bot glasssea --write` with the flag (level-quality pilot/mash rows). `damage-caps`. `colossus-respawn` (his walking holds at 5 rows).
- An eye pass:
  - camera framing: a 320 px giant on a 180 px screen; from the floor you see to his hip, and the dawn light runs off the top of the screen;
  - the scaled art;
  - the beam drawings and the marker;
  - the CRYST panes in the glare palette;
  - the glyph court;
  - seats 2-4 striking the glyph mirror;
  - textfit / hint-shown on the new lines.

## Art owed (sonnet, after the check)
- A native x1.6 Colossus (now it is the old art scaled about its feet), plus the brief's item 3 redraws (gaze, shard lunge, hail).
- Thigh/collar hold slabs.
- The backdrop silhouette walking in (intro touch, brief item 2).
- Fused-green-glass panes + spires (CRYST currently uses the Undercrown crystal sprite).
- The glyph court: stele, the sun-glyph on the Temple door lit/dark, the bronze strike-mirror on its post, the cache's sun-seal.
- Beam glow polish.

## Questions for Daniel (recommended answer first; I built the rec)
1. **P2 opening is instant too**: fire on his crack opens him at once, and the crack line becomes just an attack. REC yes (brief: "the moment the light hits him"). Alt: keep the old "fire holds the crack as the spikes finish".
2. **Directional light**: fire inward, dawn west, so each mirror lands on ONE station you can see. This replaces "either flank mirror". REC yes. Alt: either flank, drawn.
3. **P1 lance-next**: a facing mirror on your side brings the lance forward, max once every 6 s. REC yes. Alt: drawn preview only, chain order unchanged.
4. **B15 floor 0.4x for the Colossus** (master gives 0 once the leg purse is spent). REC yes. Alt: name him a resist-floor exception.
5. **Camera**: REC a gentle look-up in his arena (about 40 px) for the browser lane. Alt: leave it.
6. **Tune start**: node sim says C4 is easier than master. REC the tune lane starts at hp 680 -> ~800 (or openT 5.2 -> 4.4), then bossLab n=6.
7. **Checkpoint removed**: 548 (the alpha's; the steps' checkpoint is 52 tiles on). REC yes. Alt: drop 165 instead.
8. **Second platforming section**: REC the sonnet review lane adds 2 beats at the slide-gap landing (x148-160) for "ideally 2".
9. **Temple spur**: REC the Temple lane reads `L.templeSpur` and draws the spur once the Glass Sea is cleared (the find is on the road, it can't be missed). This lane draws no map node.

## Final tip
`node tools/colossus4.mjs` (seconds) proves both sides of the flag. `--sim=12` gives a quick OFF-vs-ON pace read. The real rate is `BRACKEN_COL4=1 ... boss-rates.mjs glasssea`. Any later light level (KP mirror room, Sun Temple) only has to declare `L.sunRooms`: the hands and the drawing are already wired.
