# claude/litchurch - THE LIT CHURCH + THE PALADIN, the SONNET ART + MUSIC pass (2026-10-08)

Built on 768d658a (the Opus greybox). No gameplay, tuning, hitbox, timing or read was changed: the Paladin's fight code (src/paladin-boss.js) and the level's geometry (src/lit-church.js) are untouched
except ONE visual line (`nightA: 0.1` in the level return: the shared night wash was 0.42 and buried every wall). Pictures: work/claude/church-art/before (greybox) and /after.

## MUSIC (Daniel approved the download; both licences re-read on the pages at download, 2026-10-08)
- **audio/litchurch.ogg** = "Cathedral" by Umplix, **CC0** (https://opengameart.org/content/cathedral-0): mono, +2.5 dB (about -20 LUFS, level with the other level tracks), OGG Vorbis q4, 72 s.
- **audio/paladin.ogg** = "Church combat" by Centurion_of_war, **CC-BY 4.0** (https://opengameart.org/content/church-combat): stereo, -3 dB (about -14 LUFS), q4, 69 s. Credit: author + licence + link on the credits page.
- Wired as TRACKS.litchurch / TRACKS.paladin; the composed 'litchurch' bed and 'paladin' theme (and its :p2/:p3) are deleted from src/boss-music.js; the Paladin's phase calls no longer switch tracks
  (BOSS_PHASE.paladin still tracks the phase). Credited in audio/CREDITS.txt, MUSIC_CREDITS (+ the Sound Test row), src/credits.js CC_BY (credits page; textfit clean). tools/lit-church.mjs now asserts
  the files and the credits (a deliberate design change, not a weakened test).
- Ambient bed (src/audio.js litchurch(), registered in AMBIENT_NAMES/SOURCES, level 0.24): an ORGAN DRONE (held D/A/D, breathing), WIND IN THE TOWER (swelling gust + a louvre whistle), the CRYPT's DRIP,
  a pew's creak, a candle's spit, the far bell.

## ART
- **Tile kit** (src/redraw/church_tiles.js, hooked in main.js beside the Ksar's): cut-stone ASHLAR with a hanging cornice, chequered marble FLAGS on every floor top, white MARBLE with a gilt inlay for the
  sanctuary, the crypt's cold blue-grey stone with OSSUARY NICHES (skulls / long bones), night TURF over bone-flecked soil, BONE SPIKES (ribs and femurs, iron-tipped), and ledges by role: carved-oak PEWS,
  corbelled stone TRIFORIUM, bone-laden OSSUARY SHELVES, iron-grated WELL LANDINGS, oak RAILS, the sanctuary's CHOIR STALLS. 8143 cells, none falls through to the shared sheet.
- **The set** (src/redraw/church_set.js + church_props.js, ~55 baked props): behind the tiles - the night sky, MOON and the lit SPIRE over the graves (parallax), then per region the far wall (nave stone, gallery,
  tower, crypt brick, sanctuary), STAINED-GLASS LANCETS, THREE ROSE WINDOWS (north transept, south transept, over the altar: they brighten with the chapel lamps lit, the altar's with the sanctuary's, and go dark when
  he falls), PILLARS with VAULT RIBS, banners between the bays, saints in niches, THE ORGAN'S FACADE (ranks of gilt pipes over the transept, a chest and a cornice), the tower's GREAT BELL and ropes, the crypt's
  groin-vault piers, chains and webs, the well's seep, the sanctuary's apse columns and gilt reredos. Over the tiles - pews, pulpit, tombs, headstones, crosses, yews, candle racks, a font, confessionals,
  bone piles, coffins, sarcophagi, charnel-pit bones, the Archdeacon's cathedra, the reliquary's five candle sockets (they light as stubs are carried), the altar, kneelers, the gilt floor cross.
  The rule's pieces are redrawn (lampstand, chapel candelabrum, wall sconce, rood sconce, the silver SEAL LAMP on its chain, brazier, votive stand, vigil candle, bellows, the organ's key desk, grates, doors).
  The CANDLE STUB find has its own icon (it was the mushroom default).
- **LIT vs DARK (A3)**: a lit room - warm halos, burning candles on every rack/sconce/chandelier, lancets and roses jewel-bright; a dark room - candles out, windows a dull night blue with cold shafts of moonlight,
  the dark pass over it. Dressing candles are the ROOM's (they burn only while a lamp in the room burns) and are holes in the dark (H.holes). The shared brick `interiors` room that used to cover the church is skipped.
- **Cast** (src/redraw/church_art.js; church_skins.js re-exports): the priest (cream alb, gold hem, stole, breast cross, gold-edged hood), the archdeacon (violet cope, gold orphrey, a MITRE), the acolyte (white surplice
  over a red cassock), chapel knight / templar / crossbow (white with a red cross). Recolours of the proven sheets plus hand pixels; frames, anchors and boxes are the bases' own, cnSkin as before - corpses die in the
  skin (tools/corpses.mjs green).
- **THE PALADIN** (src/redraw/paladin_art.js; hands in src/paladin-boss-hands.js): a pose RIG, not rectangles - plate with a gilt cross, a great helm with a plume and a glowing visor slit, a surcoat and a red mantle
  that sway and lag, a gilt-rimmed kite AEGIS, a great maul. Every mode has a target pose and the numbers glide toward it (exponential, per-mode rate), so a told blow RISES, a slam FALLS in 2-3 frames, a bash THRUSTS,
  the kneel (sleep / mend / FALTER: one knee, head bowed, the maul's head on the floor) settles - no pops. A NIMBUS behind his head and his hammer's glow follow the light bar; the plate cracks and shows light in
  phase three; the light bar is a gilt frame with quarter ticks, a bright leading edge, a gold flare up and a red notch down; RADIANCE is a real column (core, sides, motes, a cross flare, a pool); the HOLY FLOOR is
  gold flame tongues with embers; his ward arc glows while he guards. His hitbox, timings, marks and reads are the greybox's.

## Checks (PORT 8742 only)
Green: lit-church (324), lit-church-aloft (NEW, in check.mjs: kit on every cell, props/lights on tops, windows in air, the whole set paints every screen lit and dark in Node, the six skins' frame counts, the Paladin
rig glides through all 19 modes), level-quality church (clears the bar), audio-assets, boss-music, corpses, skins, signs, floaters, render-layers, readability, comments, homepaths, architecture, boss-greed, stuck (static),
textfit credits + soundtest (0 truncated, 0 overflow), soundtest; dressing (church added to GROUND_KITS/ALLOWED_DECORATIONS: `church` density 0, nothing sprinkled). frame-cost (shared tool: no read-back in play) and the new
tools/lit-church-cost.mjs: ms/frame wood 5.8 | nave 6.5 | gallery 5.0 | crypt 4.7 | sanctuary 9.9 | beside the Paladin 10.9 (the Paladin's figure is baked per frame: 96x96, one outline pass).
Not mine, red on the base too: dressing.mjs stops at **ksar** ("ksar needs its own ground kit": GROUND_KITS/ALLOWED_DECORATIONS have no `ksar` - the Ksar lane's to add; church is fixed here); stuck (runtime)
sk-reel (a Sky Road spot). Not run: the 40-minute suite; mash/pilot/curve rows (no tile, foe, timing moved, so nothing to re-stamp).
Helper tools (not in the suite): tools/lit-church-art-shots.mjs (before/after, lit/dark pairs, window/rose close-ups, the Paladin), tools/lit-church-art-sheet.mjs (tiles/props/foes/paladin sheets),
tools/paladin-art-shots.mjs, tools/lit-church-cost.mjs.

## Identity estimate (scratch/audit-identity.md, 9 x 0-2): 16-17 / 18
KIT 2, PAL 2 (cold moon-blue vs candle-gold, jewel glass, oxblood), PLAT 2 (pews, triforium, organ pipes' stairs, ossuary shelves, well landings, bellows lifts), LMK 2 (rose windows, the organ's facade, the lit spire,
the bell), SET 2 (the organ, the bell, the reliquary, the dark well - the greybox's verbs), DRESS 2, LIGHT 2 (room-linked candles, 31 dressing lights + 22 lamps + fires), AMB 2, THEME 1-2 (church timber only: pews,
the organ; no forest wood, no goblins). Honest figure 16; 17 if your eye likes the cast.

## UNVERIFIED / known soft spots
- No human playtest (B9 still stands for the Paladin); every picture is mine from a headless frame.
- The cast is recolours + pixels (the bases' silhouettes are the same men): a priest is still the mystic's hooded body; the archdeacon's mitre sits on a hood. A redraw would be the next step.
- The walls are a flat far layer (no parallax); the crypt has no landmark (vault piers and niches only).
- The charnel pit's void is plain dark (bones on its lips only); the well is dim by design.
- The clergy RELIGHT lamps quickly, so a dark shot with a priest in the room is lit again within about 2 s (the rule, not a bug) - the d* "dark" pictures can show a relit room.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. Rose windows brighten with the lit chapel lamps and the altar's with the sanctuary's lamps (dim when the lamps are snuffed / he is dead). Rec: keep. Alt: the sanctuary rose stays lit.
2. "Church combat" is one loop for all three phases (the composed theme had p2/p3 voicings). Rec: keep. Alt: a second track for the last phase.
3. The shared night wash on this level was cut from 0.42 to 0.1 (visual only; the dark/lit rooms carry the mood). Rec: keep.
4. Redraw the clergy from scratch (own sheets, a bowing priest, a swinging censer)? Rec: a later polish lane.
