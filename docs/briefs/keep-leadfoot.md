# THE LEADFOOT — a new foe for THE UNDERWATER KEEP (brief)

> **REMOVED 2026-09-25.** Daniel: "the single scuba enemy" - he is out of the Keep and out of the code. THE DROWNED KNIGHT
> (docs/briefs/keep-rework-2.md) is the Keep's new foe. This brief is kept as the history of why he was built.


Daniel, 2026-09-24, on the Keep and Highcrown: *"underwater keep should probably bring a new foe, as should
highcrown's level."* This is the Keep's.

**BUILT on `claude/leadfoot`.** `SPR.leadfoot`/`bakeLeadfoot` in `src/chars.js`, `updateLeadfoot` and his tables in
`src/main.js`, weight 3.5 in `src/threat.js`, voice in `src/audio.js`, three of him placed in `src/keep-expansion.js`,
and `tools/keep.mjs` now forces all three of his tells, their counters and his footing. **THE UNDERWATER KEEP HAS LEFT
THE GRANDFATHER LIST in `tools/one-new-foe.mjs`.** Two things below are still Daniel's and are NOT settled by the
build: **his name** (he ships as THE LEADFOOT, the id `leadfoot`), and **the anchor haul**, which is built as the
pull-toward-him this brief names as the likely better idea and NOT as a pin to the floor — see the last section.

Rule it satisfies: **F10** — every level brings at least one foe the game has never seen, and it is not its boss.
The Keep failed F10 before him: its only new creature was the Drowned King.

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

### What the build did with those two, and why (2026-09-23, still yours to settle)

- **The name is unchanged and unbuilt-on.** He is `leadfoot` in the code and THE LEADFOOT on the bestiary page. The
  display name is two rows (`BEAST_SHORT` and the bestiary entry, both `src/main.js`); the id is a rename across
  eleven sites. Neither is expensive, but neither is mine.
- **The anchor is the pull, not the pin.** Built as this brief's own second option: it is red, unblockable, it hauls
  you 58 px toward him and nothing else — no pin, no lock, no input taken. It is also aimed **where you were when the
  windup started** and only catches within 28 px of that spot, so moving in the 0.8 s beats it outright. Two reasons
  beyond the brief's own worry: a pin is control taken away, and the Drowned King in the room at the end of this same
  level already has **THE ANCHOR** and **THE UNDERTOW** — a rank-and-file foe doing both of his boss's tricks reads as
  a smaller Drowned King, which is not what this creature is for. The pin is a one-line change if you want it back:
  `LEAD.haul` and the `case 'anchor'` branch in `updateLeadfoot`.
- **He has no fourth attack and no phase**, on purpose: A1's four is a boss's floor, and this brief's three is his.
