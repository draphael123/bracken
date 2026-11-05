# RESINFIX lane report (claude/resinfix, base claude/batch143 3bd984d6)
Root cause: the earlier nestresin lane renamed honey->resin in names/text, but the ART kept the bright honey-orange palette (HONEY_PAL #e38a23/#f6aa50/#f8c882 etc.) and the level had a warm orange tint. So the drips, platform-top beds and hanging beads all still read as honey. Art-only change: no hitbox, timing, hand logic or geometry touched.

## Sources found and converted (dark amber resin: #2a1408 #4a2a0e #6a4014 #8a5a1e #a87a34, soft gloss #c9a46a)
Photo section (Sagging Gallery, ~col 169-218) - all three things in the photo:
1. Falling/swelling drip beads + strings: hornets_nest_sag.js drip/nub/string (via HONEY_PAL) -> dark amber.
2. Orange blobs on platform tops: sag.js bed() (resin skin) + hornets_nest_honey.js patch() (glob splash patches) -> dark amber, glossy highlight kept soft.
3. Beads hanging under platform undersides: hornets_nest_props.js glintDrips + hornets_nest_tiles.js 'drip of resin under a ceiling' (#d08a2a) -> #7a4e1a.
Everywhere else in the level:
4. Sump/well capped-cell wall: resin cells + the orange stain gradient rgba(227,138,35,.34) -> dark brown (sag.js wallPat/wallSprite).
5. Amber hornet's glob in flight + its resin sac/drop: hornets_nest_honey.js glob; honey_hornet_art.js HONEYC. (hornet body AM palette left: that is the hornet.)
6. Backdrop: resin beads and bark seeps on the ancient pine, comb-curtain drips (backdrop.js, #d09040/#8a4a14/#c9782a/#d98a38...).
7. Bursts/particles: drip landing + glob splash (hornets-nest-hands.js 153/154, main.js glob hook ~30064), comb-fall burst (hands 129, main.js 21592 '#d08a2a'), queen hands splash/tear/comb bursts (hornet-queen-hands.js 93/94/104/108/109).
8. Hornet Queen arena, the Resin Hall P2: floor flood, crest glints, bubbles, threads, drips from the tear, torn/last comb stalks, comb-drop splash crown, pin resin (hornets_nest_hall.js; also #76410d/#9e5a16/#ba6e20/#f7b86b leftovers).
9. Level-wide warm light tints in hornets-nest.js (L.tints, art-only overlay): gallery/stair/well/brood/hall segments were golden-orange (226,176,80 .15 .. 220,150,50 .18) -> muted brown-tan (170,140,100 .13 .. 170,125,85 .14; brood 170,100,70 .16). Segments 0-168 and 433+ unchanged.
Player-visible 'honey' strings: grep in src for the nest level/queen text found NONE left (only internal identifiers: addHoney, HONEY_PAL, honeyhornet, comments). src/art.js bakeHoneyDrip / bakeHoneyPot (shared props) are not used by the Hornet's Nest level and were left.

## Left on purpose (not honey)
Queen's red-orange jewels + gold crown medallion on the royal comb (it is the queen's regalia); smoke-pot ember/fire oranges; hornet bodies amber/black; daylight beam through the tear; coins.

## Shots (scratch\lane-reports\resinfix\, same spots before/after, 3x)
before-/after- 01-start 02-cells 03-waxfloor 04-gallery (the photo's spot) 05-gallery2 06-well 07-well-top 08-brood 09-hall-p1 10-hall-p2-flood 11-hall-p2-b. Tool: tools/resinfix-shots.mjs (TAG, OUT).
Note: the 'after' set was re-taken after the tint + wall-stain fix; 'before' is batch143 unchanged.

## Checks
node --check on every touched file ok; tools/hornets-nest.mjs 267 checks ok; demo-floats ok; demo-cut green. No suite, no merge, no deploy. Level hashes: tints/art only, no tile/ent change (no restamp expected; owed: whoever merges should confirm the level-hash check).

## Questions (recommended first)
1. Are the dark-amber resin + muted tints dark enough? Rec: yes ship; if still too warm, push the 'in-nest' tints (segments 219-432) to neutral grey-brown (alpha .10).
2. Royal comb jewels (red-orange glow) + crown hex: keep as queen regalia? Rec: keep.
3. The hall's back wall/vault is still a warm brown (paper/wood palette, not resin) - rec: leave; cooler grey-tan is a separate art pass if wanted.
