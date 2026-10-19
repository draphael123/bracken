# claude/church3art - LIT CHURCH 3 ART PASS (sonnet, 2026-10-18)
Base: claude/church3 33830c91. Art only: geometry and hash unchanged, no AI or numbers touched (src/lit-church-hands.js gets two render flags: `l.snuffed`, `g.k`).

## WHAT WAS DRAWN
**New file src/redraw/church3_art.js** (px.js primitives only, so tools/church3art-sheet.mjs previews it in Node):
- THE PALADIN's three BRAZIERS: a gilt sun-rimmed bowl on a stepped, fluted stone column with a sun roundel. DARK (cold ash, a taper laid by it, a pulsing "wants a flame" pip), LIT (coal bed + flame + a floor light pool + halo), SNUFFED (bowl dented, ash spilled down the steps, embers ticking, a thread of smoke).
- THE ALTAR FIRE (stone altar, gilt cross, iron fire-trough with three flames) and the red-glass VOTIVE RACK (sanctuary door and the Deacon's crossing).
- THE CROSSING'S GRATES (stone kerb, iron cross) and THE GHOST RISING (cold light, a wisp, a face, reaching arms, built over the told seconds).
- THE DOUSED LAMP read: cold blue smoke + a pulsing ring with four ticks over the wick: HIS, yours to relight.
- Paladin live pieces: CONVICTION PIPS (five suns in a brass plaque, white flash on fill, ember notch on spend), HIS LIGHT-WARD (boss-size faceted shell, a glint, runes at his feet, flares on a turned blow), WARD BROKEN (shards and ring), the BRAZIER BREAKING flare (holy fire thrown into him), the VERDICT floor sigil, the DAWNFALL ring (cross-hatched, fills as he leaps), PRAYER (motes spiralling brazier -> him).
**Paladin body**: the SNUFF windup/release is his own pair now (src/redraw/paladin_boss_art.js snuffTell/snuff, off the hero's heavy swing: leaning over the bowl, smoke off the head; the stroke with ash and embers thrown out). Smite/twin/radiance/sunfall/spear/arc/verdict/dawnfall already had their own hero poses; the falter is church2art's.
**THE DEACON** (src/redraw/deacon_art.js): douseTell (on his toes, the pole carried up, a brass SNUFFER CAP) and douse (the cap brought down onto the lamp) are real sheet poses; the greybox cap-and-pole in deacon-hands is gone (the hands now lay a gold target ring over the lamp while it is raised and a cold puff where it lands).
**ORDER / UNDEAD PALADIN** (src/redraw/church3_foes_art.js, 10 frames each, 46x56): idle, walk x2, bash windup/release, gleam windup (mace hauled overhead, star on the shield)/release (the stroke), shattered (shield in shards), mending (kneeling, light threading back), hurt (the corpse dies in it). Living: polished plate, blue tabard with a gold sun, white-and-gold plume and cloak. Undead: grey-green rusted plate, tattered violet tabard, plume stub, a crack in the helm, bone at the gaps, a cold light in the visor, the shield cracked. DIVINE-SHIELD DOME drawn live (faceted; whole gold / cracked blue; flares back as it mends), the shatter's shards, the gleam star.
**UNDEAD PRIEST** (13 frames): skull-faced cleric in a rotted chasuble with a tarnished gold orphrey cross, a bone censer on a chain: bolt windup (swung over the head)/release (flung out), raise windup (on the knee, hands to the floor)/release (arms flung up), mend windup (hands together)/release (spread), snuff windup (fingers open on the flame)/release (the pinch, a smoke thread), flee, hurt. Grave bolt, cast glows (colour by cast) and the raise's cold claws are live in drawOver.
**Bestiary cards**: SPR.orderpaladinCard / deadpaladinCard / deadpriestCard (x2 portraits, the second frame a breath on).

## SELF-GRADE vs design-standard (A8 / B16 / B10)
- B16 every move its own windup + release pose: PASS (boss: hero rows + the new snuff pair; Deacon: douse pair; both foes: every move has a pair).
- B10 read: PASS - unchanged logic, now drawn (pips, ward shell, ward-broken shards, doused ring).
- A8 art bar: B+. Props/brazier/pips/ghost are finished; the two foes are a clear step up but are 10-13 hand-built frames with shared proportions, not a full painted-quality sheet; the dead paladin and the dead priest read at game size, the finest details (visor light, bone) only at zoom.
- Theme: lit gothic church and crypt; no wood props added, nothing floating (the brazier column stands on the floor).
## NOT DONE / HONEST GAPS
- No separate death/corpse frame: a corpse uses the hurt frame (the game's HAS_HURT rule), so I drew the hurt as a crumple.
- The risen wight's "claw-up" is the priest's raise fx (cold claws at his feet); the wight keeps its existing sheet.
- Dawnfall/verdict shots were forced modes, not played fights.
## CHECKS (PORT 8745, one page at a time, all closed)
GREEN: tells (marks unchanged, no --write needed), paladin-boss (170), lit-church (369), church3-foes (35), frame-cost, dangling-paths (my new files add no hole; the one red is pre-existing: work/claude/lane-done/batch100-integ.md cites the cast-poses tool (not in the tree), which is on no branch yet).
## SCREENSHOTS (work/claude/church3-art/)
Arenas: s01-sanctuary-start, s02-braziers-dark-lit-snuffed, s03-ward, s04-smite-windup, s05-radiance-windup, s06-falter-ward-broken, s07-prayer-at-brazier, s08-snuff-windup, s09-verdict, s10-dawn; d01-deacon-arena, d02-douse-windup, d03-douse-release, d04-dark-grates (doused rings). Foes in the crypt: f01-ossuary-undead, f02-ossuary-priest, f03-altar-paladin. Sheets: foes.png (all 33 frames), props.png, deacon.png, palboss_snuff.png. Tools: tools/church3art-sheet.mjs (Node), church3art-pal-sheet.mjs, church3art-shots.mjs (PORT=8745).
## QUESTIONS FOR DANIEL (rec first; what I built)
1. Death frames: rec - give both foes a proper collapse frame (needs the corpse path to take a dedicated frame, not the last). Built: hurt doubles as the corpse.
2. Paladin plaque: built the pips as a brass plaque of suns floating over him (the hero HUD style). Rec keep.
3. The brazier sits close in front of the choir-stall altar prop at one spot in the arena (layout is church3's, I left geometry alone). Rec: a layout nudge in the next church pass.
