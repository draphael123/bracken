# THE LEADFOOT — a new foe for THE UNDERWATER KEEP (brief)

Daniel, 2026-09-24, on the Keep and Highcrown: *"underwater keep should probably bring a new foe, as should
highcrown's level."* This is the Keep's. **Nothing is built.**

Rule it satisfies: **F10** — every level brings at least one foe the game has never seen, and it is not its boss.
The Keep currently fails F10: its only new creature is the Drowned King.

---

## The gap, measured

THE UNDERWATER KEEP places sixteen foe kinds and **every single one of them swims**:

> eel · wight · watch · tideguard · angler · jelly · siren · puffer · merrowspear · merrowbrute · merrowcaller ·
> manta · urchin · lamprey · ballast · bellguard

Its rule is *"FOLLOW THE AIR THROUGH THE FLOODED VAULTS"*, and the fights it stages are all fought in open water,
where the player is at his most mobile and his least committed — you can always simply swim away and up.

**There is nobody in that level who denies you the floor.**

## The one line

**A drowned man-at-arms in sealed plate, who walks.** He does not swim, cannot be knocked back, and the current does
not move him.

## What he asks of the player

He turns a vault from open water into a **room with a floor you cannot use**. Two answers, and both cost:

- **Fight him on the ground**, which means dropping into the one medium where you are slowest, committed, and out of
  the current — and where your breath is running the whole time.
- **Swim over him**, which is free of damage and **costs you air**, because the long way round is the long way round.

That is the level's own rule doing the work (**A4**: the signature is the room's) without being *about* air, which
matters — the lamprey already takes your breath, and two foes with the same currency is one too many.

## Told attacks (F10 wants a real creature, not a wall)

Three, which is the floor for a rank-and-file foe with this much presence:

1. **THE HALBERD SWEEP** *(yellow, blockable)* — a long low arc along the floor. Punishes standing on his ground.
2. **THE PLANT** *(yellow)* — he sets himself and swings upward into the water above him, so swimming directly over
   him is the wrong crossing. You go round, not over.
3. **THE ANCHOR THROW** *(red, unblockable)* — he hurls the anchor on its chain at a swimmer and **hauls them down to
   the floor**, which is the one thing in the level that takes your choice away. Rare, well told, and the reason he is
   not simply avoidable.

**He has no answer to being ignored at range**, which is deliberate: he is a denial of space, not a duellist.

## Silhouette

He must read as **heavy and upright in a level of horizontal swimmers** — the tallest thing on the screen, vertical
where everything else is a long shape, with a helm shut and no face. Air escapes from the seams of the plate in a slow
line of bubbles, which is his tell at distance: you can see where he is from across a flooded hall by the bubble
trail alone, in a level built on holding your breath.

## Where he goes

The flooded vaults, not the open water: **rooms with a floor worth denying.** Two or three of them, never a crowd —
one Leadfoot and the room's existing swimmers is the encounter, because his job is to change how you fight the others.

Not in the Drowned King's arena.

## What to check

- `tools/one-new-foe.mjs` — the Keep should **leave the grandfather list** when he lands. The tool fails if a level is
  on that list without needing to be, so this is self-cleaning.
- `src/threat.js` — he needs a weight the day he is placed (`tools/threat-holes.mjs` will fail otherwise). Compare
  him against `tideguard: 3` and `merrowbrute: 3`; he is slower than both and harder to leave, so **3.5**.
- `tools/tells.mjs` — three tells, three marks: two `!` and one `!!`.

## What I have not decided

- **His name.** "Leadfoot" is a description, not a name. The game's sea foes are the Tideguard, the Bone Corsair, the
  Merrow Brute — he wants something in that register.
- **Whether the anchor haul is a good idea at all.** It takes control away from the player, and this game has been
  careful about that. It may be better as a pull *toward* him rather than a pin to the floor.
