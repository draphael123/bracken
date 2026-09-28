// src/boss-view.js - WHICH FIGHTS ARE FOUGHT ZOOMED OUT. One list, read twice: once when a boss wakes (setView('zoom'))
// and every frame after that by desiredView(), which render() asks each frame. Before this list the two were written
// out separately and drifted: ten bosses (the Harbormaster, the Pyromancer, the Bellcrab, the Closed Helm, the Drowned
// King, the Prince, the Grandmother, the Troll, the Straw King and the Mage's Folly's Archmage, 'archmage') zoomed out
// at their wake and were back to the normal view by the first drawn frame (found by the Gate Gargoyle's lane; fixed
// 2026-09-27). tools/zoom-coverage.mjs holds main.js to it: no wake zooms a boss this list does not keep zoomed.
// The Undead Archmage ('undeadmage', the Falling Tower's own hall) was never on either list - only the Folly's
// Archmage was - so his own carpet fight never zoomed out at all. Added to ZOOM_BOSSES 2026-09-27 (claude/ft3 follow-up).
//
// 2026-09-28 (Daniel, claude/bosszoom): "boss battles in general need to be more zoomed out, since otherwise it can
// be hard to see." EVERY boss fight (and every mini with its own arena) now zooms out by default - the old list above
// was opt-IN and quietly left new bosses at the normal view unless someone remembered to add them here. It is an
// opt-OUT list now: bossZooms()/miniZooms() are true unless the fight is named in ZOOM_BOSS_EXCLUDE/ZOOM_MINI_EXCLUDE,
// and every name there carries the reason (a truly vertical/tall arena the zoomed camera cannot frame, or a fight
// whose camera is scripted around the normal view). Narrow arenas (an arena thinner than the zoomed viewport) do NOT
// need an opt-out: updateCamera's zoom clamp (main.js) centers the camera on an arena narrower than the view instead
// of pinning it to the west wall, so a narrow arena stays framed rather than running off past its east wall.
export const ZOOM_BOSS_EXCLUDE = new Set([
  // (none yet - every boss fight zooms out)
]);
export const ZOOM_MINI_EXCLUDE = new Set([
  // (none yet - every mini with its own arena zooms out)
]);
export const bossZooms = t => !ZOOM_BOSS_EXCLUDE.has(t);
export const miniZooms = t => !ZOOM_MINI_EXCLUDE.has(t);
