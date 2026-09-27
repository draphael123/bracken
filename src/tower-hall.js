// src/tower-hall.js - THE UNDEAD ARCHMAGE'S HALL, AT THE TOP OF THE TOWER (Falling Tower round 3, Daniel 2026-09-27).
// Two rules, one of the map and one of the frame:
//   THE GAP   his hall's floor stands HALL_GAP rows or more over the highest ground anything can walk to below it (the crown's
//             parapet and its merlons) - more than twice the best jump any walker has, so nothing afoot can climb, hop or be
//             carried into it. src/tower-ascent.js places it (HALL); tools/tower-hall.mjs measures it on the built grid.
//   THE DOOR  the hall is reached through the door on the parapet, and while his fight is on nothing below its floor is in it:
//             the tower's creatures are not updated (hallHolds). The freeze at 420 px is HORIZONTAL (main.js), and the crown's
//             tomes and imps stand well inside 420 px of a hero over the crown's middle - so before this a flyer from the last
//             tiers could rise straight up into his fire.
export const HALL_GAP = 8;   /* rows, floor to highest walkable ground under it: a hero's best jump is 4.5 tiles, a walker's less */
export const hallHolds = (A, fighting, e, boss) => !!(A && A.hall && fighting && e && e !== boss && !e.mini && e.y > A.floor);
