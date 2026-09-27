# THE KRAKEN — the rework (and the Tide Reaver goes)

Daniel, 2026-09-25: the Causeway's mini "doesn't make sense... we can do without the mini-boss"; and THE KRAKEN IS TOO EASY.
The ranking (2026-09-24) had him at **1/6, 150 s+, 19 %hp/min** - "the bot cannot finish him - difficulty not measured".

## 0. What the code actually does today (read before the design)
- **Stage 1, THE ARMS**: four arms out of the four arm holes; every cut on an arm lying on the road is a cut on him. Sever
  all four (30% of him) and he rises.
- **Stage 2, AT SEA**: since 2026-09-19 ("permanent Kraken arms") a severed arm stays severed - so the two "thinner,
  quicker" arms stage 2 was written for never come back (`a.two` is only set on an arm that is NOT severed, and all four
  are). Stage 2 is armless: crates, chests, the far water (jet, volley, spout) and his breath (the bell knells him). His
  floor is 0, so he DIES in stage 2 and **stage 3 (the maw, the spear, the waystones) is unreachable.** The knell's limp
  arms and the look's still arms are lying still on nothing.
- So the fight is ~2/3 a crate clock (a crate every 4 s, 18 a hit) and the bot times out at 150 s, a few % short.

## 1. The Tide Reaver goes
His elite `tidemarauder` (src/tide-reaver.js, reaverTake, the mini room and its PORT gate at column 533, the sign, the lab
branch, his MARK rows, his check and pilot). The ordinary Tide Marauder foe, his bestiary row and his two placements stay.

## 2. The bot first, then a BEFORE
The lab bot learns what it lacks, and a BEFORE is recorded: 7 heroes, refill health, 150 s cap, 3 salts; and normal
health, 300 s (`tools/kraken-pilot.mjs`, into `work/causeway2/`).

## 3. The design (Daniel's four changes, and the one repair they need)
- **REPAIR: the three stages again.** Stage 2's two arms come back up out of the sea as NEW arms (cut ones stay cut, as
  Daniel asked on 9/19); stage 2 ends at 35% and the maw is fought again - the spear, the waystones, two regrown arms.
- **a. THE TIDE RISES.** On a clock through the whole fight he drags the sea up the road a SECTION at a time, from his end:
  three lines (tiles 601, 591, 584); it never takes the tower, the twelve stones in front of it, or waystone 583 (the
  spear-stick stays). TOLD: the tide bells toll by themselves, a foam line stands up where the water will stand, and the
  bar says THE TIDE COMES. Caught on the stones it takes, you are hit and SWEPT to its edge; flooded road will not hold
  your feet (a current carries you out to the edge) and an arm lying under the tide cannot be cut. The plinth, the tower
  and the wreck stand out of it. **The bells are yours:** a knell bell struck when it is not knelling him pushes the tide
  back a section. Each new stage starts with the road clear, and the tide comes faster.
- **b. FEWER FREE OPENINGS.** The bell knells him (arms limp) ONCE A STAGE from the tower; after that the tower bell is
  SPENT for the stage (drawn dull) and only the shrine bell on the plinth - in his reach, in the tide - knells him. An arm
  cut and left REGROWS to whole after 4 s. He looks with his arms lying still only if the look was CAUSED: a crate, chest
  or ball of his own water put into him since the last look.
- **c. HE HITS HARDER.** Faster sweeps and slams, harder blows; the grab DRAGS YOU TOWARD THE SEA (seaward, quicker) -
  escaped by pressing (as now) or at once by a dodge; never longer than ~2 s. Health 480 -> ~650 only if the pilots say he
  is short: reported, not tuned.
- **d. INK (stage 2).** A gather of ink at his mouth and a sound, then part of the screen - a band of road that never
  holds the hero's own tile - goes dark for ~3.5 s. The marks of his blows still show through it.
- **Kept (A11):** crates into him while he is up; cutting arms where they lie; the bell; the waystone spear-stick. **A12:**
  the plinth, the tower and the wreck are the room's answers to the tide; `arena-supplies` must still pass.

## 4. After
Same pilots, same settings. Report the numbers; tune only what the pilots show is broken, and ask Daniel the rest.
