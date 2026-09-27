# THE SHIPWRECK REEF, LONGER, AND THE REEFMAW ON LAND (Daniel, 2026-09-25)

Lane `claude/reef2`. From the level review (`level-review/group-a.md` section 13) and Daniel's decisions of 2026-09-25.
Coordinates below are FINAL built columns unless marked "old".

## The level: 460 -> about 550 columns
The level's rule stays: **BREATH IS THE CLOCK. THE AIR IS IN BELLS, A SWIM APART.** Everything added says it again.

1. **THE BELL-POOL (new, 20 columns at old 213, final 213-232).** Out of the carrack's breach you walk down two steps into a
   basin with water over your head and a FLOOR under your feet: an open surface, a diving bell standing in the middle, and a
   sign. The breath gauge drains while you stand there, the bell fills it, and you can walk out. It is the breath lesson with
   nothing at stake, before the shelf where it matters. The old breath sign moves here.
2. **THE HALF-SUNK WRECK (new, 60 columns at old 235, final 255-314).** The empty 88-tile swim is broken by a PLACE: a hulk
   lying on the shelf with her upper deck stood up into a hollow in the reef roof. Her deck is AIR (an air room, so the breath
   clock says so), with a checkpoint on it (final ~270; it closes the old 200-270 gap) and a CAPSTAN. Her hold under the deck is
   flooded; the way on runs out of her hold through a GRATE (iron bars, PORT tiles) that the capstan lifts. Three turns, the
   grate goes up with a clank and stays up. That is the level's second capstan (the first hoists the carrack's pallet), and it
   changes the room: the only way on to the rest of the shelf is through her hold. The reach model counts the grate as open,
   the way it counts a winch gate (they are laid at load, not in the built grid).
3. **Clean-up.** The decorative bells and capstans (old 104,23; 142,12; 388,20) become non-interactive WRECK JUNK (a broken
   capstan drum, a cracked bell on her side: new bakers in `src/reef_props.js`), so only the working ones look like machines.
   The coral fan buried at old 277,36 is moved out of the rock. The stale Flotilla oar-deck `interiors` rectangle goes.
   **The reef gets its own quest: THE MANIFEST** - three pages of the tribute ship's manifest (what she carried, and to
   whom: "what they take is not gold"), a new item with its own art. ROYAL SEALS stays Highcrown's.

## The Reefmaw: phases 1 and 2 as they are, phase 3 on LAND
- **Phases 1-2 do not change**: four holes, bubbles say which, the bite that hits coral sticks and is the opening, the water
  rises each phase.
- **Phase 3 (under a third): THE TIDE GOES OUT.** Told first (C1): he smashes the reef (roar, shake, `THE TIDE IS GOING OUT`
  over a 1.4 s tell with the water streaming down into his holes), then the water drains below the floor over about two
  seconds, and he HAULS himself out of his hole onto the dry reef and fights like a crocodile until he dies:
  - **THE LUNGE** (`lungeTell`, red `LOW`, unblockable): he coils back low, then drives along the floor about ten tiles.
    Jump it, or be up on a ledge. If it catches you: THE DEATH ROLL.
  - **THE BEACHING (the opening, A11):** a lunge that goes PAST you - you jumped it, or stood on a ledge over it - overshoots,
    and he beaches himself belly-up for about 2 s, soft side open, double damage (a green ring, like every other opening).
    A lunge that stops short of you (you were out of range) does NOT beach him: the player causes it by dodging it.
  - **THE TAIL SWEEP** (`tailTell`, yellow `!`, blockable): stand behind him and the tail comes round. It is what punishes
    staying behind him after he rights himself from a beaching.
  - **THE REAR** (the old thrash, on land): up on a ledge within his reach he rears and snaps up at you, so the ledges are a
    dodge, not a place to wait.
  - **THE DEATH ROLL** (caught by the lunge): he rolls, dragging you toward the nearest hole (the water). Escapable: three
    swings or a dodge breaks it; it lets go on its own after 1.6 s. Small damage ticks, a bite if he gets you to the hole, then
    you are thrown clear with a moment's grace, and he cannot grab again for 4 s (not a stun-lock).
- **Land art:** a new horizontal sheet for him (crawl x2, lunge-coil, lunge, tail sweep, roll, belly-up), drawn in the same
  baker as his water frames (`src/redraw/reef.js`), checked on a capture.
- **Health:** EHP 360 -> 500. Measured with the bot and reported; not tuned past that to hit a number.
- **Arena:** 28 -> 40 tiles (A7). The three solid coral stools become three LONGER coral ledges (7-8 tiles, two rows up, on
  posts) he can pass under, so there is room to jump a lunge and to land. Four holes spread across the wider floor. A12 kept.

## How it is proved
- New check `tools/reefmaw-land.mjs` (page): phase 3 drains the tide and he reaches land; a lunge dodged beaches him; a lunge
  that stops short does not; a lunge that catches you starts the roll and the roll lets go; the tail hits behind him.
- `tools/reefmaw-pilot.mjs`: bossLab, all seven heroes, refill health, 150 s cap (the ranking's settings), before and after:
  wins, median time, damage taken, stuck jaws, beachings. The boss-lab hands (`src/lab.js`) learn the land phase.
- `tools/reef-walk.mjs`: the F9 play bot before and after. Before/after captures in `work/reef2/`.

## Numbers before (master 0264d19)
Reefmaw, bossLab refill 150 s, 7 heroes: 7/7 wins, median 53.3 s, median damage taken 175, 22 stuck jaws, boss 454 hp in play.
Walk (knight): reach 98%, walked 56% (STUCK on the shelf), 66 foes, 17 kinds.
