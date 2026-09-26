# THE GATE GARGOYLE, REWORKED (brief, 2026-09-25)

Daniel played the Witchlight Stair, 2026-09-25: "The level is generally good. The boss needs to be much further zoomed out,
and the platforms don't need to be quite as high up. I'd like the boss to be bigger, and also be able to smash through
platforms and fall on the floor and get stunned if he does this." Built to RULES-LEVELS-AND-BOSSES.md A1/A2/A5/A6/A7/A10/A11/
A12, C1, E6 and section S. The ranking gave him 6 ("right shape, low danger", arena 79 tiles, opening "hang x10"). **The rest
of the Witchlight Stair stays as it is.**

## 1. Zoomed out, and a smaller room
- **The zoomed-out view comes on when he wakes**, as it does for the Hornet Queen and Mother Cap (`setView('zoom')`), and goes
  off when he falls or you leave.
- **His room is compressed.** It was 79 tiles wide (A7 says about forty) with the slabs 11-13 rows over the garden. Now:
  - the arena is **44 tiles** (c 346-390); the tower's foot moves in to c 391 and the level ends there (nothing else moves);
  - the slabs sit **6-7 rows over the garden floor** (rows 34-35, were 28-30), the lip and his perch come down with them;
  - the whole fight - garden floor, slabs, his hover and his gate - is about one zoomed screen high and 1.1-1.5 wide.
- **The camera frames him and you together** (`gargCam`, gate-gargoyle.js): the point between you, weighted to you, always
  keeping you on screen and the garden floor in the frame.
- The rune columns still lift you from the garden back to the slabs (A12: every hero can get down to him and back up).

## 2. Bigger
**About 1.5x: 30 -> 45 px**, drawn again at the new size (not scaled): wings, dive, crash and stunned poses, a 126x96 sheet.
His hitbox, his dive's reach, his mouth, his hover heights, the marks under him - every read of his size follows `GARG.K`.
E6: a new check asserts no frame touches its canvas's edges.

## 3. He smashes through the slabs (his opening, A11)
- **THE STONE DIVE, left late:** his shadow finds your slab and the aim is his until he drops. Still there when he lands: it
  hits you (no shield turns it) and he lands on the slab. **Gone when he lands: he SMASHES THROUGH IT and CRASHES to the
  garden floor, STUNNED 2.5 s, and every blow counts twice.** This replaces "hangs from the next slab's edge".
- **Any slab breaks**, not only cracked ones: one constant, `GARG.smashAny` (false = only CRACKED slabs give; the others he
  lands on, as before). The cracked slabs stay in the room.
- **The broken slab grows back** after 6 s (11 s in phase two), and never fewer than three slabs stand: the room does not run out
  of footing.
- **Told (C1):** the red shadow on the slab, and a second one on the garden under it once the slab is empty; the crack spreading
  across it before it gives; the crash (shake, dust, rubble, a thud); a stunned mark (circling stars in a green ring) for as long
  as he is open. A hero under the slab when he comes through it is hit.
- **The garden floor is where you punish him.** Drop off your slab, cut him, go back up by a rune column.

## 4. Phase two (A10), unchanged in kind
The slabs drift faster, dives come in pairs (after one that hits you), every glyph flare comes with a gust, and a slab he breaks
takes nearly twice as long to grow back.

## 5. Proof
- New check `gargoyle-smash` (red on the old code first): the zoom comes on at the wake; a slab left late breaks and he reaches
  the floor stunned, open 2.5 s, x2; a slab kept is a hit and a landing; left early moves his aim; the slab regrows (slower in
  phase two); size 45; every frame fits its canvas; the arena is <= 46 tiles and its slabs <= 7 rows over its floor.
- boss-openings, witchlight and the rest updated to the new opening.
- Re-pilot with all 7 heroes (bossLab, refill, 150 s cap, 3 seeds) BEFORE and AFTER; the bot learns to leave late, drop, punish
  and climb back. Before/after captures of the zoomed fight in `work/gargoyle/`.
