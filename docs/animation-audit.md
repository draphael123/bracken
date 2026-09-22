# Animation audit, 2026-09-22: the foes you meet most, and how thin their animation is

Measured in the game (this branch's copy of the live code): every sprite set in `SPR` (185), its distinct frames (identical canvases
counted once), whether it has a HURT frame (`HAS_HURT`), and how often it is met across the 25 campaign levels (the foes each level
spawns). Ranked by `met x thinness` (thinness: <=3 distinct frames 3, <=5 2, <=7 1, plus 1 with no hurt frame). Contact sheets of
the top 24 at x3: `docs/audit/anim-0..2.png`.

- **75 of 185 sets have 4 frames or fewer**, 23 have 1-2 (some are townsfolk, where it is fine).
- **126 of 185 have no hurt frame**: they flash white. It works, and it is much of why hits feel alike.
- **The apprentice is the zombie's body recoloured** (met 18 + 69 times; the whole of the Mage's tower).

| # | foe | met | distinct frames | hurt frame | what reads thin |
|---|---|---|---|---|---|
| 1 | bat | 59 | 3 | no | three tiny poses; no dive tell to speak of |
| 2 | eel | 74 | 7 | no | fine motion; no hurt |
| 3 | petrel | 48 | 4 | no | a dark stick of a bird; the dive reads as a line |
| 4 | zombie | 69 | 6 | no | a block with a head; arms barely part from the body |
| 5 | wight | 43 | 4 | no | four near-identical sheets: nothing moves |
| 6 | urchin | 39 | 4 | no | fine for what it is; no hurt |
| 7 | crow | 24 | 3 | no | three small near-identical poses |
| 8 | angler | 45 | 5 | yes | fine |
| 9 | wasp | 41 | 4 | yes | tiny; the sting tell is one pixel |
| 10 | siren | 25 | 4 | no | good shapes, no hurt |
| 11 | netter | 33 | 7 | no | good |
| 12 | thief | 16 | 3 | no | three near-identical frames: he does not run |
| 13 | harpy | 62 | 6 | yes | good |
| 14 | bonecorsair | 20 | 3 of 6 | yes | three frames repeated |
| 15 | hedgeknight | 20 | 5 | no | five near-identical boxes |
| 16+ | puffer, lurker, boo, crossbow, jelly, haunt, apprentice, lookout, snuffer | | 3-5 | mostly no | |

**The redraw pass takes the ones that read worst for how often they are met:** bat, zombie, apprentice (its own body at last), wight,
thief, hedge knight, crow, petrel, wasp, snuffer. `src/redraw/foes_v2.js` (next commit).

## The redraw pass, done (not wired): `src/redraw/foes_v2.js`, before/after in `docs/foes-v2.png`
Ten sets: **bat** (membrane wings, a three-beat stroke, hurt, death), **zombie** and **the apprentice** (one posed body, two people: the
apprentice in his violet robe and hood with a satchel, no longer the zombie recoloured; every old pose kept - flung, throw tell, nova
tell, stuck, buried - plus a second walk step, hurt, death), **wight** (a shroud that moves, hollow eyes, streaming tatters, hurt,
unravelling), **thief** (a four-beat run with the sack, a glance back, hurt with the sack flying), **hedge knight** (helm with its
leaf crest, a real shield and sword, a raised-blade tell, the cut, the leap, a second step, hurt behind the shield), **crow** (glide,
hurt), **petrel** (reads as a seabird: white belly, yellow beak; the dive a dart; hurt), **wasp** (bands, a stinger that shows),
**snuffer** (hooded, the snuffer's cup on its pole: raised to the lamp as the tell, swung as the swipe; second step, hurt).
**The contract:** each keeps its old frame indices meaning what they meant, its anchor and its hit box (checked against the game:
all ten OK), and appends the new frames. `FRAMES_V2` gives each foe's baker, its kept and added frames, and the one change to its
frame pick in main.js. Wiring is one line to swap the baker and one to the frame pick, per foe. (The hurt frames want a hurt timer
tested at the head of each pick; most foes set `e.flash` on a hit, which will do.)
