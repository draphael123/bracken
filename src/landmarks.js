/* src/landmarks.js - WHICH LANDMARK PROPS A LEVEL'S FLATS CARRY (claude/identity0, Daniel 2026-10-03, from the identity audit).
   placeLandmarks() (src/main.js) used to hand EVERY dress:'village' level the same six big props - dovecote, lychgate, two yews, stocks and
   trough - so the Fair, Underleaf, the Hexed Fields, the Mage's Folly, the Witchlight Stair, the Burning Village and the Theatre all stood
   on Waymeet's furniture. That set is WAYMEET'S ALONE now: nowhere else gets it (nothing in its place: a level's own kit and set pieces
   carry it). And Kingswood is a goblin court, not an orchard: no beehives or birdhouses on its flats.
   tools/ambient-landmarks.mjs holds both rules. Each entry is [PROP name, index in that prop's variants or -1, dx]. */
export const WAYMEET_ID = 'waymeet';
export const WAYMEET_SET = [['dovecote', -1, 14], ['lychgate', -1, 20], ['yew', 0, 8], ['yew', 1, 40], ['stocks', -1, 26], ['trough', -1, 52]];
export const GOBLIN_COURT = ['kings'];   /* levels that drop the wood kit's hives and birdhouses */
export function villageLandmarks(levelId, dress) { return dress === 'village' && levelId === WAYMEET_ID ? WAYMEET_SET : []; }
export function woodLandmarks(levelId) {
  const court = GOBLIN_COURT.includes(levelId);
  return [['oldOak', 0, 8], ['oldOak', 1, 8], ...(court ? [] : [['beehive', -1, 10], ['beehive', -1, 30], ['birdhouse', -1, 20], ['birdhouse', -1, 50]]), ['lanternPost', -1, 40]];
}
