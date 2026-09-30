# claude/theatreart - THE MASKWRIGHT'S THEATRE: the art and music pass

Base: claude/theatre e96aee0 (the greybox after its review fixes). Geometry, machinery and encounters are untouched; the pictures are in work/claude/theatreart/.

## What changed
- TILE KIT (src/redraw/theatre_tiles.js, one hook in main.js resolveTiles). Plum brick in the house, timber-brown backstage, near-black stone under the stage. Floors have a lit lip: dark stage boards, an oxblood runner with a gold thread in the house, velvet seats on the raked stalls, wet flags under the stage. Iron grating for the grid, fly floor and lighting bridge. Gilt-fringed timber for the boxes. Stage TRAPS are hatches (hazard chevrons, hinges, a brass ring). The kettle drums have a cream skin with brass lugs, the star trap a red spring leaf. Ropes are hemp with knots. Spikes are steel with warm tips.
- ROOMS (src/redraw/theatre_rooms.js). Foyer, stage-door passage, costume store (hat boxes, a rail of costumes), dressing rooms and mirror room, mask workshop (a wall of masks, plaster heads), scene dock, fly tower, the stage (backcloth, black borders and legs), under-stage, wings (pin rail, belayed lines, sandbags). THE HOUSE is a parallax backdrop: dome, the gods, two tiers of boxes, in two layers sliding against the camera. Rooms are baked once.
- MACHINES AND DRESSING (src/redraw/theatre_props.js, called from theatre-hands.js; the old greybox drawing is gone).
  - Limelights are brass barrels that aim at their pool. Beams carry dust; pools are cream ellipses with a bright rim and a spike mark.
  - Flats are painted scenes (forest, castle, sea, a door, a floor cloth, the cloth). Each flat's TRACK is always drawn. It turns amber, pulses and runs chevrons in the direction of travel when the flat is about to move. A cued flat has a gilt edge and a cue bulb that goes red.
  - Every fly line has a COLOUR TAG (A red, B blue, D gold, E green, G violet, H orange, CH brass). Its rope-lock, both ends of its batten and its sandbag wear it, so which lock runs which line is never a guess. The lever on a rope-lock shows whether the line is out.
  - Winches have a cranking drum. The prompt desk has a signal lamp, green or red.
  - The chandelier has crystal drops and a glow.
  - The curtain is velvet folds with a gold hem and fringe, a swagged valance and gilt proscenium pilasters. It gathers up into the valance and a red glow spills while it hangs. Footlights run along the stage floor.
  - The strings on the cast are now drawn. They were not before: the greybox matched `e.squad`, which spawnEnt never copies, so they never showed. They match `e.cast` now.
  - The box audience are masked patrons behind the box fronts, with opera glasses that catch the light. HIS silhouette in the rigging is a long coat and a high hat with a control bar.
- LIT v. UNLIT (the reviewer's note). A caught mummer stands in a ring of light. The HERO in a pool gets a cream ring at his feet and a watching EYE badge over his head (over the bodies, `drawFront`), so it is plain at a glance that he is seen.
- CAST (src/redraw/theatre_foes.js):
  - Box drunks are MASKED PATRONS: bakeDrunk('patron') in waymeet.js, same frames, evening black, porcelain mask, opera hat, a programme to throw.
  - The usher is oxblood livery, pillbox cap with a bell, half-mask, a shuttered lantern. He carries `usher: true` in the level data.
  - The stagehand has new frames (apron, rolled sleeves, red neckerchief, sack on its line).
  - The shy dead are a sheeted dead patron in an opera mask and ruff. The haunts are flying stage daggers in a pale ring.
  - Mummers are untouched.
- MUSIC. The placeholder audio/theatre.ogg, its renderer tools/theatre-music.mjs and its credit line are removed. `theatre` is now a SYNTH track in src/audio.js (`scheduleTheatre`): a creaky D-minor music-hall overture waltz. It has two desks of bowed strings (detuned pairs, vibrato, each note a few cents off, one note in thirty-two bars sagging flat), a harpsichord on the off-beats, a plucked bass, a door creaking mid-tune and a seat tipping up. A told music change per act, via `music.act(n)` from theatre-hands.js:
  - 0 overture: slow and unsteady.
  - 1 CURTAIN UP: the same tune lifted to D major, a flute doubling, faster.
  - 2 ACT TWO: faster, with a snare.
  - 3 ACT THREE: a drum on every bar.
  - Each change is a cymbal and a bell.
  - tools/audio-assets.mjs lists `theatre` in NO_FILE_BY_DESIGN. tools/level-quality.mjs now counts a synth branch in audio.js as the level's own track. tools/theatre.mjs asserts the synth and the absence of the file.
- src/dressing.js gained the theatre's (empty) ground kit and its deco allowlist. The dressing check had been failing on the theatre's missing entry.
- Footing and dressing by hand: nothing is sprinkled in the theatre (density 0).

## Captures (work/claude/theatreart/, from tools/theatreart-shots.mjs)
- Stills of every section: 0-the-house, 0a-the-foyer, 0b-the-pit, 1-, 1b-, 2-, 2b-, 2c-, 2d-, 3-, 4-, 4b- (the curtain from the fly floor), 5-, 5b-, 6-, 7-, 8-the-cast (every baked frame of the new foes, 3x), 8b-lit-hero.
- IN MOTION (filmstrips, frames labelled with the second): strip-curtain-up, strip-ride-the-weight, strip-chandelier-drop, strip-scene-change-act-two, strip-trap. The music cannot be captured; the synth ran 14 s through all four acts in the page with no errors.
- full-level.png: the whole level after art, the show running, stitched from the game's own frames with the dark zones off. The game still dims each frame in a disc round the hero, so each tile is a round window; it is a map, not a playtest. The stills are the truer picture.

## Checks (named, lane rules)
GREEN: theatre, skins, pixels, readability, footing-art, render-layers, dressing, occluders, light-support, ground-depth, audio-assets, signs, architecture, comments, homepaths, hint-shown, dangling-paths (only known holes, plus a stale citation in docs/audit-new-levels-0920.md that was not mine; two citations of the removed files in the old theatre report were reworded).
level-quality: THEATRE 10/10. The check is red overall only because of THE HARVEST FAIR (the old fair, reworked on another lane).
No pilots: nothing moved. Only one level-data flag was added (`usher: true`) and no geometry.

## UNVERIFIED
- Nobody has heard the waltz. It is synth and the chords and melody are reasoned on paper (D minor, A7 cadences). Tune by ear.
- The house's parallax backdrop is dark by design; in a playtest on a dim monitor the boxes may need another notch of brightness (one constant in theatre_rooms.js houseFar).
- The HERO-in-a-pool eye badge and the mummer rings are new UI-ish marks; look at 8b-lit-hero.png.
- The main stage room (thMain) is deliberately plain for the Puppeteer's lane to dress.
- Not run: the full suite, slopes-trace (the theatre was taken out of it earlier), pilots.

## QUESTIONS FOR DANIEL (recommendation built)
1. Patron mask: a porcelain white half-mask and an opera hat. Rec: keep. Alternative: a full-face plague-doctor beak for variety.
2. The lit-hero EYE badge. Rec: keep, since it answers the reviewer's note. Alternative: only the ring at his feet, if the eye is too much.
3. The waltz changes per act (faster and major). Rec: keep, it is cheap. Alternative: one constant tempo.
4. Masks on the workshop walls are dimmed to 60 percent so they stay wallpaper. Rec: keep. Alternative: full strength for a louder room.
5. The under-stage floor flat reads as grey flagstones (a painted floor cloth would be the theatrical read). Rec: keep, since the grey is legible against the near-black. Alternative: paint a sea on it.
