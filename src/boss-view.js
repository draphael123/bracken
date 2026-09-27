// src/boss-view.js - WHICH FIGHTS ARE FOUGHT ZOOMED OUT. One list, read twice: once when a boss wakes (setView('zoom'))
// and every frame after that by desiredView(), which render() asks each frame. Before this list the two were written
// out separately and drifted: ten bosses (the Harbormaster, the Pyromancer, the Bellcrab, the Closed Helm, the Drowned
// King, the Prince, the Grandmother, the Troll, the Straw King and the Undead Archmage) zoomed out at their wake and
// were back to the normal view by the first drawn frame (found by the Gate Gargoyle's lane; fixed 2026-09-27).
// tools/zoom-coverage.mjs holds main.js to it: no wake zooms a boss this list does not keep zoomed.
export const ZOOM_BOSSES = new Set(['queen', 'mother', 'harbormaster', 'pyromancer', 'bellcrab', 'closedhelm', 'drownedking',
  'prince', 'owl', 'forgemaster', 'golem', 'windcaller', 'king', 'lance', 'suncatcher', 'roc', 'gqueen', 'grandmother', 'troll',
  'masthead', 'kraken', 'strawking', 'archmage', 'gargoyle']);
/* the minis that zoom out at their wake (a mini fight is `miniActive`, not `bossActive`) */
export const ZOOM_MINIS = new Set(['suncatcher', 'golem']);
export const bossZooms = t => ZOOM_BOSSES.has(t);
export const miniZooms = t => ZOOM_MINIS.has(t);
