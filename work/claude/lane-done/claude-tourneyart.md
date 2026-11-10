# tourneyart: art + music pass for THE TOURNEY (branch claude/tourneyart off claude/tourney 09db53e10)
Status: READY (code-only, flag stays OFF; node-checked; no browser). Not merged, not deployed. Report copy: scratch/lane-reports/tourneyart.md

## Drawn (src/redraw/ty_art.js, rect-based, baked + outlined, flipped for facing left)
- Barded chargers: hero's bay (blue/cream caparison, chanfron, peytral, crinet, plume), the Champion's ivory (full plate bard, gold fringe), the horse archer's unarmoured grey. Each: stand, walk x4, gallop x4, rear (hurdle balk / wheel).
- Mounted hero: his own sprite sits at -8 on the horse; the seat (caparison patch, saddle flap, stirrup boot) is laid over his legs; lance drawn spiral-striped with vamplate, steel head, fluttering pennon (rest / lowering / couched with gold tip lit at pace / tired).
- THE CHAMPION: great helm + plume, tabard + gold bend, kite shield with the GOLD BOSS glint (the told lance), arm, spiral lance, flail ball + chain, horn; mounted on the ivory charger and on foot (greaves, walk), UNHORSED heap. All 23 POSE modes draw. Squire (run / wait / drop), horse archer (mounted, on foot, down, string drawn / loosed), arrows.
- Set dressing: pavilions/tents (stripes, valance, doorway, pennant; grand gold one for the Champion), pie stall, stable loft (stalls, hay), royal box (purple, gilt, canopy), crow's nest, brush hurdles, rings on posts, straw targets (broken when taken), quintains (shield + sandbag arm), tilt rail (painted, swags), lists fence along the rides, crowd on the 5 stand tiers (2-frame cheer) with blue fascia, 15 heraldic banner standards (cosmetic props added in src/tourney.js).
## Music (src/boss-music.js; original synth, no files; Sound Test + credits rows added)
- `tourneyfest` (level): C major 4/4 at 120, 32 s; side drum + roll, fife (piccolo double 2nd half), brass herald's call, oom-pah bass, crowd swell + clapping.
- `tychampion` (arena P1): D Dorian march at 108, 35.6 s, massed brass, snare, timpani. `tychampion:p2` (on foot, fired by his rise via ctx.music in main.js): 138, brass up a tone with the flat second, galloping kick, snare every eighth, chain rattle, pulsing bass.
## Checks (node only): tools/tourney-music.mjs ok; tools/ty-art-draw.mjs ok (36 cameras, 23 poses); tools/tourney.mjs all ok (flag off = master, flag on); level-quality tourney clears; audio-assets ok flag on and off; boss-music ok. Sheet: tools/ty-art-sheet.mjs -> scratch/lane-reports/tourneyart-sheet.png
## Owed
- Browser stills/walk: horse seat height vs each hero's sprite (dY -8), lance grip position, Champion scale vs hitbox, crowd/banners vs foreground readability, music loudness in-game (BOSS_SYNTH_GAIN 0.62).
- Tune n=6 still the tune lane's. Not drawn: Waymeet's wall, water jump (still a dry ditch), map node art/blurb, transition rows, bestiary cards, a roll animation suppressed in saddle.
## Questions (rec = built)
1. Music: ORIGINAL synth tracks built per Daniel 11-09; swap for CC0 later is a one-line L.music change. Rec: keep.
2. Hero horse is one look for all heroes (bay, blue/cream). Rec: keep.
3. Horse head reads a bit long/donkey-ish at 1x; a 2nd pass in browser may refine. Rec: judge in-game first.
