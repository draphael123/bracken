# claude/pyramidart - THE SEALED PYRAMID ART + MUSIC (Sonnet, 2026-10-13) - LANE C of scratch/briefs-sealedpyramid-1013.md

Base: claude/pyramidboss c1f434fd. Port 8902. Art/draw/audio only: collision, hp, damage, timing and the level hash are unchanged (no level code touched; level-quality still CLEARS THE BAR, no re-stamp needed).

## Rename (Daniel 10-13)
THE TOMB-KING -> **THE COFFIN KING** everywhere player-facing (boss bar, bestiary name + BEAST_SHORT for the boss-jump row, wake line, comments, tool messages). Internal id `tombking` kept. Grave Call adds and the 0.4x lid-off guard untouched.

## Music
- **THE COFFIN KING's own synth theme** (src/boss-music.js `tombking`, + `tombking:p2` THE TRAPS ARM 91 bpm, + `tombking:p3` THE LID CRACKS 107 bpm): B Phrygian dominant funeral march at 76 bpm, 16 bars = 50 s: lid-drum + coffin knock, chain rattle, dirge organ (major third joins in the second half, the flat second leans every 4th bar), tolled bell, a falling reedy lament; P2 adds dart ticks + a ratcheting gear and lifts the lament an octave; P3 adds a drum roll into every bar, a sand wind swell, a B-C grind and a second bell. Own synth, no file; credited in audio/CREDITS.txt. tools/boss-music + audio-assets green.
- **Level bed**: kept 'Forgoten tomb ambience' (kindland, CC0). Gain check (tools/pyramidart-music.mjs, RMS as played, file = x0.45, synth = x0.62): sealedpyramid.ogg 0.104 vs buriedcity 0.041, ksar 0.055, burial 0.073, caravan 0.030, fields 0.086 - clearly audible, louder than its neighbours. The Coffin King: 0.056 / 0.064 / 0.075 over his phases (hawkmistress 0.047, cisternqueen 0.054; the Scarab Mother's theme is the quiet one at 0.029 - not touched).
- **Level-track candidates (NOT downloaded; all OpenGameArt; length not listed on any page - check on download)**
  1. "Evil temple Ambiance loop" - Brandon Morris - https://opengameart.org/content/evil-temple-ambiance-loop - listed "OGA-BY 3.0" and "CC0" (pick the CC0 grant); OGG 5.3 MB; described as an ambient loop with sung pad (loop seam unconfirmed).
  2. "Dark Cavern Ambient" - Paul Wortmann - https://opengameart.org/content/dark-cavern-ambient - listed "CC0"; two 1.7 MB OGGs, `_002` is "a continuous loop" (`_001` fades in/out).
  3. "dungeon ambience" - yd - https://opengameart.org/content/dungeon-ambience - listed "CC0"; dungeon002.ogg 1.2 MB; a commenter calls it a great loop (not stated by the author).
  Rec: keep the current kindland bed (it is a tomb and is already levelled); of the three, #2 `_002` is the only one explicitly a loop, but it is a cave, not a pyramid.

## Art (everything in lanes A/B's ART lists)
New files: src/redraw/sealed_pyramid_king.js (THE COFFIN KING + chamber pieces + his attack pieces), src/redraw/sealed_pyramid_tombart.js (tombs, hazards, fittings, callback). Edited: src/tomb-king-hands.js, src/sealed-pyramid-hands.js (drawTombHalf now calls the art), sealed_pyramid_cast.js (guard), sealed_pyramid_mother.js, scarab-mother-hands.js, sealed_pyramid_tiles.js, sealed_pyramid_backdrop.js.
- **THE COFFIN KING**: anthropoid sandstone sarcophagus on thick bronze-anklet legs; gilt mask under a lapis-striped nemes, usekh collar, crook + flail crossed, hieroglyph trough; stone arms with bandaged wrists. Every POSE in the table has its own picture (sleep, wake, walk, recover, slam/lash/leap(perch,drop)/reel/call/throw/volley/roll/breath/pit/curse each windup + release, lidless, catch, clamp); LID OFF = the old king inside (linen, gold death mask, crossed hands); FLIPPED = on his back, legs in the air; ROLL = the coffin on its side with the stripes turning; **P3 cracked lid** (fissures + a chip) from phase 3; a lid-lift light line; bestiary card 2 frames. His pieces: bandage lash, chain, thrown lid disc, canopic jars + fumes + the told X marks, poison clouds, sand pit funnel, curse sand column, breath cone.
- **The chamber**: wall switches (housing, slot, bronze lever up/thrown, winding gauge), counterweights on chains (stone with ankh, bronze corners), floor alcoves (grated grave slots, lit when they spill), chain links on the ledges, switch mounts, ceiling slots + plates via the set's own pieces. Room style `pyBurial`: dusk-violet courses, gilt sun-discs over lapis, a gold dado.
- **Tombs**: carved niche frame with a gilt frieze; shut lid (gilt mummy mask / bone ankh + skull for the guard), cracking (shake, fissures, falling dust, edge glow, "!"), open (slab fallen at the sill, embers / pale sockets).
- **Tomb guard**: 8 frames redone on the mummy's contract - striped nemes, usekh, linen kilt in lapis, greaves, round bronze shield, hooked khopesh; cut/leap windup and release distinct; hurt frame with a dark rib.
- **Gas**: bronze verdigris jet grates, armed wisps, rolling cloud with a drifting skull (the 'GAS' word is gone). **Oil**: channel with kerbs and a crawling sheen, gutter, bronze brazier upright/tipped/pouring, running flame front, burning oil-fall curtain. **Sluices**: carved frame + bronze grille (water light when open), foam-crest bore (the 'THE BORE' word is gone), gauge. **Robbers' callback** at 501: bones + sack + broken hourglass + key.
- **Per-section tile palettes** (hall, gas, oil, crypt, stair, royal) and **room styles** (pyTombs niches, pyGas verdigris, pyOil soot, pyCrypt tide line, pyStair light slits, pyBurial).
- **The Scarab Mother's 4 frames**: leapTell (every leg coiled, body sunk), leap (all feet off the floor, forelegs out, mandibles wide), digTell (sunk to the shoulders), eruptUp (thrown up out of the floor); the placeholder squash/tilt transforms are mostly gone.
- NOT redrawn (existing art kept, reads fine in the shots): the King's Stair giving courses (caverns' crumble style) and the scarab well; the dart wall (the set's bronze dart holes); the water pool (default clear pool, now under the crypt's blue room palette).

## Polish scorecard: B
Identity: every new section has its own palette, motif and hazard drawing; every windup/release pose of the boss, guard and Mother is distinct; hazards are told by picture not word. Held below A: the boss and his pieces are procedural rects (the tilt poses rotate, so edges soften), the stair's giving courses are not restyled, and the pool is still the default.

## Checks (PORT 8902, one browser at a time) - all green
sealed-pyramid 240/240, tells (935 rows), boss-read, drawn-solids (sealedpyramid, 3 states), mark-integrity MI_ONLY=tombking,scarabmother (every mark seen, posed, lands), boss-fight-end (63 fights), boss-openings, damage-caps (9), untold-told, hint-shown, sealed-pyramid-stuck 8/8, boss-music + audio-assets, level-quality CLEARS THE BAR, **textfit --strict hints,bestiary,bossjump,boss: 0 issues** (the full sweep was killed at the coordinator's order for RAM; scoped runs only).
- footing-art: sealedpyramid paints its own (caravan), nothing to check. cast-poses.mjs does not exist on this branch (mark-integrity + pose sheets used).
- **Mobile perf spot** (tools/mobile-perf.mjs, 4x CPU, 915x412, boss room via new `level@col:row` scene): this lane 50.1 fps, 19.0 ms busy/frame, p95 35 ms; the same room before the art (c1f434fd) 53.2 fps / 17.7 ms; redgorge reference 56 fps / 12.8 ms. The room is the whole chamber at once (zoomed out). +1.3 ms is the new lever/counterweight/alcove drawing; the 40 fps budget holds. Input latency 0.8 ms.
- Contact sheets in work/claude/shots/pyramidart/: before/ and after/ (sheet.png, 23 spots), states/ (tombs/gas/oil/flood mid-fire), king-1.png / king-3.png (every pose, phase 1 and 3), kingfight/ + kingfight23/ (the real fight, a frame per mode), cast-tombskel.png, mother/.
- Tools added (not in the suite): pyramidart-shots, -states, -king-sheet, -kingfight, -cast-sheet, -music.

## Reds
None from this lane. Known/pre-existing: lane A's walker never finishes the first half for warden/pyro.

## QUESTIONS FOR DANIEL (rec first)
1. Level track: keep the kindland bed (rec) or swap to a candidate above? No download made.
2. Restyle the King's Stair giving courses and the water pool as tomb stone / crypt water in a follow-up? Rec: yes, a small lane; they are the only A-list items left on old art.
3. His tilt poses rotate the drawing (soft edges at 2x). Rec: accept; a pixel-snapped redraw per tilt only if it bugs you in play.
