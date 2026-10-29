// src/map-blurbs.js - THE MAP CARD'S ONE-LINE BLURBS (claude/mapscale). The card has one line for what a place is; a level's own `sub` (src/level.js, also on the
// level-select list and the loading card) is sometimes longer than that line, and a sentence cut mid-way ("only blue in") is worse than a shorter whole one. A level
// listed here is said whole in less; the rest use their `sub` as written. tools/map-scale.mjs measures every one in the face the card is drawn in and fails when any does not fit.
export const MAP_BLURB = {
  kitchengate: "the castle's kitchens",
  warcairn: 'the clan that holds the peak',   /* (claude/warcairn) */
  rookery: "the harpies' crags",
  kings: "the goblins' court in the old wood",
  wood: 'a logging trail to the hive',
  hornetsnest: 'the paper nest in the great pine',
  rootway: "the way up out of the fungus",
  palisadewood: 'an autumn wood being walled off',
  fenroad: 'the boardwalk to the stockade',
  fair: 'abandoned mid-festival, at sundown',
  waymeet: 'where the roads meet',
  theatre: 'where the masks are made',
  underwell: 'the dry cisterns under the town',
  church: "the paladins' sworn chapel",
  towpath: 'the river road, lock by lock',
  ksar: "the raiders' fortress on the road",
};
