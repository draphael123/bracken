# THE KING'S PYRAMID: desert arc level 7, the finale (brief)

Greybox: `src/draft/kings-pyramid.js`, all checks passing (`node tools/draft-level.mjs kings-pyramid`, map `docs/draft-kings-pyramid.png`).
World boss: `src/skeleton-king.js` (`node tools/skeleton-king.mjs`), on `src/light.js`.

## Where it sits
Level 7, the end of the desert arc; `needs: 'sealedpyramid'`. **A climb in the dark**: 21 galleries up the heart of the king's own
pyramid to his chamber under the capstone. Black, gold, white sunbeams.

## THE RULE: the king's light
The pyramid is black: as built, **0%** of its floor can be seen. Sunlight comes down light-wells from the apex into each gallery
through a **PORT** in its roof. The way up out of each gallery is shut by a **SUN-DOOR** in the roof, which lifts when its **PLATE**
is lit. So every gallery is a mirror room: turn the mirrors to carry the port's beam to the plate. **Sunlight burns the dead:** the
beams are also your weapon against the court. The light that hurt you in level 1 is the weapon now.

## Seven sections (bottom to top)
THE SUNLESS DOOR · THE GALLERY OF MIRRORS · THE GRAND GALLERY (no mini: the long build-up) · THE QUEEN'S CHAMBER · THE AIR SHAFTS ·
THE KING'S STAIR · THE CAPSTONE WAY · then THE SKELETON KING.
- **Verbs:** turning mirrors, the stair of ledges to each door, light as a weapon, block. A carried lamp (the build's choice) is the
  answer to "I can't see".
- **THE MACHINE (F5), for the build:** the **CAPSTONE WINCH** in the Air Shafts. It opens a light-well's cap to send the apex sun
  straight down a whole stack of galleries at once, lighting them for 30 s.

## Creatures (the king's court)
**GILDED SKELETON GUARDS** (shields; the light makes them drop their guard), **PRIESTS OF THE KING** (they RE-WRAP the fallen: a
dead guard rises again unless burned by a beam), **SHADOW THINGS** (they live only in the dark and die in a beam; in the light they
flee). Draft GARRISON: 21 of each, three a gallery.

## THE SKELETON KING (world boss)
Designed and checked in `src/skeleton-king.js` (see `docs/desert-arc-brief.md`):
- **The room:** the capstone shaft, the altar mirror, two wall mirrors, two shuttered windows.
- **His armour:** his gold and linen turn blows, 60% until a beam burns him, then 200%. The fight is the light. (Decided with Daniel.)
- **Attacks:** CROOK HOOK `!`, FLAIL SWEEP red ✕, SAND SPIKES red ✕ (marked tiles), and in phase 3 SUN FLARE red ✕ (out of the beams).
- **The opening:** a beam turned onto him; he burns for 3 s. Only the sun opens him: the Sun Priest's beam chips him and never opens him.
- **Phase 2:** the capstone shuts, and it's dark. Only the side windows you open light the room, and his court's priest shuts them.
- **Phase 3:** the capstone torn off, and the storm pours in (`gustDrift`).
- **Checked:** four told attacks, all fired; never untouchable over 1.2 s; the layers at once; the opening caused (baiting him under
  the wall beams burned him 7 times, only swinging 0); the mirror fighter wins in 65 s to the swinger's 90; reacting in 0.25 s takes 0 hits.

## What the draft proved
- **Every gallery opens:** all 21 sun-doors can be opened with the mirrors in them (the light solver), none is open as built, and
  **the puzzles grow**: about 1 turn a gallery in the first sections, about 2.4 at the top.
- **The pyramid is black:** 0% of the floor can be seen as built.
- 7 sections of 27–29 rows, 3–6 foes per 12 rows, everything reachable.
- Caught: each stair's first ledge was 4 rows up; the puzzles cycled instead of growing; three rows of rock separated the last door from the king.

## The build still owes
The dark (a visibility mask from `visible()`), beams drawn from `trace()`, mirrors and plates as props, sun-doors, the court's
bakers and behaviour, the capstone winch, the Skeleton King's baker, his twelve wiring points and a pilot (≥ 21 runs at normal
health). About 2 sessions for the level and 2 for the king.
