// src/map-blurbs.js - THE MAP CARD'S ONE-LINE BLURBS (claude/mapscale). The card has one line for what a place is; a level's own `sub` (src/level.js, also on the
// level-select list and the loading card) is sometimes longer than that line, and a sentence cut mid-way ("only blue in") is worse than a shorter whole one. A level
// listed here is said whole in less; the rest use their `sub` as written. tools/map-scale.mjs measures every one in the face the card is drawn in and fails when any does not fit.
export const MAP_BLURB = {
  kings: "the goblins' court in the old wood",
  rootway: "the way up out of the fungus",
  fair: 'abandoned mid-festival, at sundown',
  waymeet: 'where the roads meet',
  theatre: 'where the masks are made',
  underwell: 'the dry cisterns under the town',
  church: "the paladins' sworn chapel",
  towpath: 'the river road, lock by lock',
  ksar: "the raiders' fortress on the road",
};
