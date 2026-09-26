# THE DEEP, REWORKED (brief, 2026-09-25)

Daniel, 2026-09-25: "The deep level is too short, and the boss is too easy." His choices, built to RULES-LEVELS-AND-BOSSES.md
A1/A2/A6/A10/A11/A12, B9, C1, E, F10, N and section S. The level review (group B) called the middle holds "the same room,
three times" and a deck on "a mossy stone slab that ends in a square edge in open water"; the ranking gave the Diving Bell 3
("vents after every single attack").

**The one sentence (F8) stays: YOU ARE TOO LIGHT TO BE DOWN HERE.** Carry a stone to sink and walk; jump to let it go.

## 1. The middle holds: three ships, three rooms
The twelve holds of the Wreck Stack, the Kelp Forest and the Coral Garden were one interior (`'ship'`: plank wall, a gunport
and a lantern every 120 px). Each section's wrecks are now one kind of ship's room, painted by `src/deep-holds.js`:
- **THE WRECK STACK: CARGO HOLDS.** Unplaned frames, cargo nets on the wall, crates and sacks stacked and lashed, a hoist hook.
- **THE KELP FOREST: GALLEYS.** A smoke-black bulkhead, the brick firebox with its hood and copper, pots and ladles on a rail,
  the mess table, and weed through the seams.
- **THE CORAL GARDEN: GUN DECKS.** The gun-deck red of a warship's inner hull, gunports with their lids hanging, shot racks and
  rammers, and **a cannon on its side**, thrown off its carriage when she went down.
- **A HULL STRAKE UNDER EVERY DECK (B9, rule N):** the two courses under each deck board are `L.hullZones` and draw as the
  ship's own timber, not as reef rock ending square in open water.

## 2. THE SUNK TRIBUTE SHIP (a new depth band, ~+25%)
"The trench the tribute went into": the Queen's tribute ship, upright on the trench floor, between the Coral Garden and the
Glowing Drop. The Deep's rows from 158 down move 44 rows lower (`src/tribute-ship.js`, `insertRows`, on the Deep only: the
Keep crops the shared source before it and does not move). You come out of the garden's last throat over her masthead and
**climb down through her decks**:
- **HER RIGGING** (open water): the mast, its yards (one-way footing), the crow's nest with a bell of air in it.
- **THE WEATHER DECK** (stern cabin with its windows; forecastle): the main hatch is shut by her own breath - a **HOT column
  from the vents she sank onto blows up through her hatches**. Unweighted you are thrown back up it; **carrying a stone** you
  walk down through it (the vent current already lets ballast through at a quarter).
- **THE TRIBUTE HOLD** ('tween deck): chests of tribute lashed in rows, a goblin banner; stones in the ballast racks and
  **the prise** waiting at them; a drowned knight between you and the next hatch.
- **THE ORLOP AND THE BILGE**: the magazine (L.cabins), low air, a stove-in bilge that lets you out into the Glowing Drop.
Air, as the level gives it: a bell in the crow's nest, air under her deck beams (pockets), a clam, a kelp bladder off her rail,
and the vents themselves. A checkpoint at her masthead and one in the tribute hold (S4: at least 40 route tiles apart).

## 3. DROWNED KNIGHTS in the Deep (S1)
Reusing `src/drowned-knights.js` (`drownedKnight(x, y)`), three of them, each where the ground makes him worse: one at the foot
of the tribute ship's hot hatch (you arrive heavy and slow), one in the tribute hold between the prise and the next hatch, one
on a gun deck over the Coral Garden's throat. **No Drowned Captain**: he is THE UNDERWATER KEEP's new foe (F10), and the Keep
would have none if the Deep met him first (a question for Daniel).

## 4. THE DIVING BELL: HE VENTS ONLY WHEN YOU DROP A STONE ON HIS CROWN (A11)
- `vent()` comes off the end of every attack and off the wall-stop of his charge. The one way to open him: **a ballast stone,
  let go above him, landing on the valve on his crown.** Then THE BELL VENTS (open 3 s, damage x2.2); shut, he takes x0.45.
- **A12, the room supplies it:** three stone racks on hung platforms (rope to the ceiling, B9) over the floor he walks. A rack
  sets another stone on its platform whenever its last one is spent or lies on the floor. When you are above him he comes to
  stand under you (he wants you in his pressure bell), so the pressure tell pushes you off the rack and over his crown.
- The bot (src/lab.js) does it: takes a rack stone, waits for him under it, steps off, lets go over the valve.

## 5. THE DIVING BELL: HARDER, AND A THIRD PHASE
- His told attacks hit harder (claw 26, slam 34, pressure 24, charge 32) and come faster (tells ~20% shorter, the rest between
  attacks 0.35 s now there is no vent after each). Health stays 750 unless the pilots say otherwise (reported, not tuned).
- **PHASE 3, THE BELL CRACKS AND HE COMES OUT** (a third of his health): the cracked bell stays on the floor and the crab runs
  out of it - fast, soft (x1.3 always, no vent), desperate: told snips (claw), a told scuttle, and a told LEAP at you. Own art.
- **PHASE 2 (Daniel, option (a)): THE PRISE POUR OUT OF HIS BELL** at half health - told (his rim lifts, 1.1 s), three prise that swim for the stone in your hands; each vent in phase two tops them back up to two.

## 6. Measured (S8)
The Bell piloted with all 7 heroes (bossLab, refill, 150 s, 3 seeds) before and after (`tools/bell-pilot.mjs`), the level walked
by the F9 bot before and after (`tools/deep-walk.mjs`, costed per section), captures in `work/deep2/`.
