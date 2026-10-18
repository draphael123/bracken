# claude/hurricane2art: HURRICANE DECK 2, art pass (Sonnet art lane, 10-17)
Base origin/claude/hurricane2 a23fed35. Art only: no numbers, timings, tiles or entities changed (src/level.js untouched; level-quality prints the same hash 31e107d77e05 here and on the base).
Self-grade: greybox / stock D -> **B-** (the Captain's sheet B; the ship pieces B-; the underwater and the store seams only checked on a world sheet, not in a fight).

## DRAWN (ART LIST 1-9; 10 partly)
1. FOREMAST: standing pole (round, hooped, crosstrees, cap, truck), ratline shrouds (tarred shroud lines with ratlines and deadeyes, replacing the plain ladder), the fore yard (spar, iron caps, seizings, clewed-up torn sail, footrope on stirrups, lifts), forestay and backstay. Its FALL: a hooped pole from the stump to the galley roof with the cracked yard still lashed at the head, a torn sail draped over it, shrouds trailing slack, a split stump with the shrouds' dead ends hanging.
2. MAIN YARD on its three lifts: spar tile, parrel at the mast, sail and footrope under it, lifts now laid rope with hand-knots and a block, hung from a top yard (not walkable) with its topping lift; the main stay to the yard's end.
3. HATCH COVERS (all 7): lashed gratings (slats, cross-batten, iron-bound ends, lashing turns, ring-bolt) slung on a bridle and one hawser up out of sight; rain runs off the slats and drips on the heave.
4. BREACHES (4): stove-in planking down both sides (ragged strake ends, end grain, the net slung over her side), broken frames standing on the bar, a keel timber, sand drifts, weed, planks adrift; the bar is sand (ripples, shells) the length of the level.
5. MIZZEN: a round pole from the bar to its top (teal under the sea, weed, barnacles), stays; the broken topmast is a woolded spar with backstays, and each span cracks (grain lights, zig-zag crack, splinters, a lashing parting) instead of the old flashing bar; the stern stay is shroud ratlines. Crossjack yard hung from a stay off the mizzen top; the mizzen top is a grating on cross-trees. Spanker mast and gaff for the arena with stays to the arena's lines.
6. ROPE SWINGS (3): a laid fall from a block, a bridle, a slung grating seat; the first hangs from a derrick stepped on the forecastle head, the second from the mizzen's gaff, the third from the spanker gaff.
7. GALLEY deckhouse (boarded walls, port, caulked roof, stove-pipe and smoke, skylight) and POOP BREAK house (boarding, four ports, an iron-strapped door, roof, companion hatch, two ventilator cowls). DARK POWDER STORE: deck seams, a hanging chain; the sky comes down the seams in light shafts while the lightning is on.
8. CARGO: crates (lashed, ring-bolt, stencil) and casks (hooped); the wall across her waist is a stack under a cargo net with three hawsers and ring-bolts, and its wreck (staves, stove cask, torn net) is drawn when the gun goes through; the aft gun is a carriage gun (cheeks, trucks, hooped barrel, muzzle swell) on breechings and a tackle, strands parting as it strains; loose, the breeching trails frayed and the trucks turn.
9. THE CAPTAIN (src/redraw/pirates.js bakeCaptain, now 20 frames): own pose for HELD on a line (both fists on the shrouds, head down), BRACE (running at the line, hand reaching), STRUCK (head back, arms flung, the bolt through him), KEG windup (the lit keg heaved back) and KEG release (arm through, puff), TURNED (a cut thrown off the shield: blade flung high), FLAT (on his back, hat rolled off, sabre loose, boots cocked). Sabre, pistols, grapnel and the call keep their own poses. The WARD is a faceted shell (double rim in turning dashes, lattice, glint); THE LINE HE WANTS is lit with chevrons running to it and 'HIS LINE'; sea runs off him when he is flat.
10. SOUND: CAUGHT now creaks (SFX.ropeHaul) and each topmast span cracks (SFX.crack). Wave knockdown, Captain flat, struck and ward already had existing SFX.
Tools: tools/hurricane2art-sheet.mjs (Captain's frames), hurricane2art-world-sheet.mjs (the world art alone, all draw paths, GLOW=1), hurricane2art-shots.mjs (in-level shots; SEQ/FIN for set-ups). Shots in work/claude/shots/hurricane2art/{before,t1..t6}.
Edits outside art files: src/main.js, one-line hooks (import, H2A ctx, tile pass, drawBack after drawWater, mover loop, drawSea: topmast crack, felled mast, cargo/gun/wall, deco skip for mastTall, Captain frame map and capRead, two SFX); src/redraw/pirates.js bakeCaptain only.

## CHECKS (targeted, one page at a time)
Green: storm-ship, storm-ship-runtime (foremast, wave, line, topmast, Captain flat/ward/struck), frame-cost (no read-backs; 8-14 canvases are the one-time bakes), boss-read, solid-islands, floating-geometry, floaters, node --check on every file touched. A hurricane page run: no page errors in any shot.
Same as the base (not this lane): tells reports the Captain's call '!' teal mark and the src/marks.js table (a23fed35 prints the same); level-quality hurricane says the pilot and mash rows are stale against hash 31e107d77e05 on a23fed35 too. textfit has no hurricane scope (0 screens). No cast-poses tool or pixels check existed in this tree.
Not run: the full suite, boss-rates (nothing numeric changed), mark-integrity.

## NOT DONE / HONEST
- Underwater and the bar are seen only through the water pass's heavy tint: ribs and keel read faintly. The hull under the waterline outside the breaches is still the stock hull tile.
- The store's light shafts were checked on the world sheet, not in a live strike (the dark pass dims them too).
- The knocked-flat pose is a drawn lying figure, not an animated fall; no get-up frame (he returns to stride).
- Standalone shrouds' (rail, 62/80/98 etc.) heads still end on a deadeye with no stay above them.
- Hatch covers hang from hawsers that go out of sight: honest as slung cargo, but the stern covers have nothing visible above them.
- The boss plate still says BEACHED (hurricane2 question 5).

## QUESTIONS FOR DANIEL (rec = built)
1. The stern's hatch covers are slung on hawsers going up out of sight (nothing above them to hang from). Rec: keep; a gantry or the crossjack yard overhead would need level edits.
2. The Captain's frame 12 (kneeling, the old beached pose) is kept unused. Rec: delete at integration.
3. A mixed-ending file: src/hurricane2-art.js is new LF; git will CRLF it. Rec: nothing.
