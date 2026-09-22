# THE SUN PRIEST: class design (draft for the class batch)

Unlocked by clearing **THE SUN TEMPLE** (the optional level off THE GLASS SEA, `docs/desert-arc-brief.md`), then bought for
**~800 coins**. Heroes otherwise cost 10 silver, and there's no consolation prize for owners, as with every class level.
Concept art: `src/redraw/sun_priest.js`, rendered by `node tools/sun-priest-art.mjs` to `docs/sun-priest-concept.png`.
It is concept only: the class batch bakes the full hero frame set to the hero contract.

## The idea in one line
**He fights with the light in the room, and he is weaker where there is none.** Every other hero brings their power with them. The
Sun Priest takes it from sunlit tiles, lit rooms and his own beams, so he is the best hero in the light levels (the Sun Temple, the
King's Pyramid) and has to work for it in the dark (the Undercrown, the Burial Caverns, the tombs of the Sealed Pyramid).

## Hero card text (the house form, as in `HEROES` in main.js ~287)
> a sun-staff, and 85 health. HE FIGHTS WITH THE LIGHT. a run of three with the staff, the third a flash. HOLD X: THE SUNBEAM - the
> staff planted and a beam along the ground to the first wall (UP to send it up a column); it burns the dead and lights what it
> crosses, and a mirror turns it. standing in light fills RADIANCE, the dark drains it, and his blows and beam are as strong as the
> bar is full. tap C: CONSECRATE, a patch of sunlight laid on the ground - it mends him, burns the dead that cross it, and lights the
> dark. hold C: THE FLARE, a blinding flash that stops a wind-up in its tracks. a full bar and C again: SUNRISE - for six seconds
> the whole screen is in the light. the plunge is SUNFALL, a ring of light where he lands. X early in a dash: THE GLARE STEP, through
> small foes, and a guard is thrown wide. no shield: the disc turns a yellow blow met on the beat, and throws a missile back.

## The kit, and what each piece is for
| verb | what it does | numbers (first pass) | why |
|---|---|---|---|
| X, a run of three | staff: a jab, a sweep, the third a FLASH (a short burst of light, 1 tile) | 9 / 9 / 14, light and quick | the plain fight; the flash is a small light source (it counts for RADIANCE for a moment) |
| **HOLD X: THE SUNBEAM** | a beam along the row to the first opaque tile (UP+hold: up the column). It is a real light source in `src/light.js`: it lights the dark, and mirrors turn it | 20 st to plant, 22/s to the dead, 6/s to the living, x(0.75..1.15) by RADIANCE | his signature, and the arc's light puzzles become his to solve without the sun. It **chips** THE SKELETON KING but does **not** open him: only the sun does (so the world boss stays the same fight for everyone) |
| RADIANCE (the bar) | fills standing in a lit tile (sun, a beam, a consecrated patch, a lamp) and when his beam burns; drains slowly in the dark | fills 0 to full in ~6 s in light; drains full to 0 in ~20 s in the dark; damage x0.75 empty, x1.15 full | **weaker in the dark**, as a number he can see and fix |
| tap C: CONSECRATE | a 3-tile patch of sunlight on the ground for 6 s: mends him standing in it, burns undead crossing it, lights it | a third of the bar; mends 4/s; burns 12/s | carries light into dark levels (his answer to the dark); a place to stand in a fight |
| hold C: THE FLARE | a flash round him (3 tiles): stops any wind-up in range, dazzles the living for 0.8 s | half the bar; one flare per foe per 8 s (no lock) | the save; it answers a red ✕ he can't dodge, at a price |
| full bar + C: SUNRISE | 6 s of the whole screen in light: every beam burns double, he mends in it, and a dark room is lit | the whole bar | the big one, like JUDGEMENT and THE PYRE |
| plunge: SUNFALL | lands in a 2-tile ring of light: burns, lights, and counts as a consecrated patch for 2 s | as others' plunges | |
| dash + early X: THE GLARE STEP | through small foes, a guard thrown wide | as others' | the house dash-attack |
| no shield: THE DISC | turns a yellow blow met on the beat (a parry), and throws a missile back along its line | the Freebooter's parry window | he has a defence, and it is timing, not a wall |

## Talent branches (three, as `TBR` / `TREE_WHO` in main.js ~339)
- **DAWN: THE BEAM, AND WHERE IT GOES**: a longer plant, the beam piercing a second foe, UP+beam burning a column at full strength
  (no mirror of his own: Daniel).
- **NOON: THE LIGHT THAT MENDS**: bigger and longer CONSECRATE, RADIANCE filling faster, SUNFALL leaving a patch, SUNRISE mending more.
- **DUSK: A LIGHT IN THE DARK**: a carried glow (he lights a tile round him), less drain in the dark, THE FLARE cheaper, the disc
  throwing a missile back lit (it burns).

## Where he sits among the six
- **Not the Paladin.** The Paladin is a heavy maul with holy light up close (120 health, AEGIS a wall). The Priest is light at
  range, a lighter body (85), and his defence is timing.
- **Not the Pyromancer.** The Pyromancer is fire and heat that builds while she runs hot. The Priest's bar depends on where he
  stands, not on what he does.
- **His weakness is real:** in a dark level he starts at 0.75x and has to make his own light (CONSECRATE, the beam) to climb.

## What the class batch must measure (numbers before feel)
1. `tools/skill-balance-probe.mjs` against the six heroes in a lit room and a dark one. **Target:** within the spread of the others
   lit, and in the bottom third dark but not last.
2. The Sun Temple and the King's Pyramid with the Priest: his beam must not make any room's puzzle trivial in a way that skips its
   landmark. `src/light.js solve()` with his beam as an extra source shows which rooms he solves alone. That's a design decision
   per room (a Priest shortcut is fine if the room still says what it says).
3. THE SKELETON KING: confirm the beam chips and never opens him (`tools/skeleton-king.mjs` with a beam source added).
4. The dark levels (Undercrown, Burial, Keep, the Sealed Pyramid): one full run each at normal health, to see that his weakness is
   a weakness and not a wall.

## Decided (Daniel, 2026-09-21)
- **Sun-doors and plates answer to the SUN only.** His beam lights the dark, burns the dead, fills his bar and chips the Skeleton
  King, but never opens a door or a plate: as first designed it opened all 35 light rooms with no mirror turned
  (`docs/sun-priest-rooms.md`). `src/sun-priest.js` `doorsLit`; checked by `tools/sun-priest.mjs` (0 of 35 open to his beam).
- **No mirror of his own.** DAWN's capstone is not a placeable mirror: the rooms' mirrors stay the rooms' (the puzzles stay puzzles).
  DAWN's last node is the beam piercing a second foe and burning a column (UP+beam) at full strength.
- **The look is right:** white and gold robes, a gilt sun-disc on the staff, a bronze face under a hood (`docs/sun-priest-concept.png`).
