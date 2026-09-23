# BRACKEN — the design document

**Self-contained. Everything needed to design a level or a boss for this game, what has been decided, and what is
being built next.** Written 2026-09-24 against `codex/playtest-0919`.

Two companions, both in the repo: **`RULES-LEVELS-AND-BOSSES.md`** is the full law (626 lines, sections A–R, much of
it enforced by tools in `tools/`), and **`docs/QUEUE.md`** is the running work list. This document is the part you
need in your head before you start.

---

# PART ONE — HOW A LEVEL IS DESIGNED

## The one sentence

**F8. THE RULE IS THE LEVEL.** Before anything else, write the one sentence the level is about, and the three ways it
says it. *If the sentence is "there are more goblins", stop.*

Then say it three ways (**C4**), so a player who misses one still learns it:

> THE LAMPLIT STREET: *"light is air."* You see it in the lamps; you read it on the breath gauge; you feel it when
> the dark brings something that only comes where the light has gone.

## Length and shape

| | |
|---|---|
| **F1** | **400–700 columns, in seven named sections of 60–100.** Not one stretch. |
| **F2** | **Five landmarks, each one a PLACE** — somewhere you'd tell someone to meet you. |
| **F4** | **It alternates.** Combat, then a climb or a crossing, then combat. Never two fights with only floor between. |
| **F6** | **Distinct from its two neighbours at a glance** — different palette, different interior kind. |
| **B6** | **A checkpoint every 100 columns**, and one outside the arena walls. |
| **B7** | **Match the neighbours' density.** ~3.5–4.5 foes a screen. |

## Mechanics

- **F3. THE VERB BUDGET.** Every level uses at least four of the game's existing verbs **and puts one of them
  somewhere new.** Obstacles must fit the verbs you have — do not build a puzzle the hero cannot answer.
- **F5. ONE MACHINE YOU CONTROL.** A pump that drops the water, a winch that lifts a deck, a cableway you ride. One
  thing in the level that answers to the player and changes the room.
- **B8. Three encounters, not one encounter three times.** Authored fights, never a sprinkle.

## Enemies

- **F10. EVERY LEVEL BRINGS AT LEAST ONE FOE THE GAME HAS NEVER SEEN — AND IT IS NOT ITS BOSS.** Not a recolour, not
  the same creature with more health: a new kind with its own silhouette and its own told blow. **The median level
  brings FIVE**, so one is a floor, not a target. *Earned: THE ORE ROAD's one new creature is the Winchmaster, its
  boss — so the first draft of this rule passed the very level it came from.* **Checked** (`tools/one-new-foe.mjs`).
- **Fill gaps, not variety.** A new foe should answer a question the roster cannot currently ask.
- **Q. ONE AMBUSH ROOM A LEVEL** — a short locked fight led by an elite captain of the level's own roster.

## Legibility

- **C1.** Anything that hurts must look like it hurts, **before** it does.
- **C2.** One rule per level, readable from across the room.
- **C3.** Every hazard tells you where and when.
- **C5.** A hazard zone needs an escape **visible from inside it**.

## Geometry that must hold

**B1** the start reaches the end · **B2** nothing stands in the air · **B3** every pocket has a way out ·
**B4** a cuttable route is never the only route · **B9** geometry looks like it is holding itself up ·
**R** every dead end pays.

## Before it is finished

**F9. WALK IT BEFORE YOU DRESS IT** — start to gate, no god mode, once per hero that can reach it. Every tool in
`tools/` passes before the art goes on.

---

# PART TWO — HOW A BOSS IS DESIGNED

## The floor

- **A1. FOUR TOLD ATTACKS, MINIMUM.** Three or four distinct things it does, every one told before it lands: a named
  `<thing>Tell` mode with its own pose, its own sound, its own tell colour. **Checked by tooling.**
- **A2.** Every tell is in `windingUp()`, or the wind-up plays no sound and you cannot hear a blow off screen.
- **A3.** A cooldown never initialised does not exist — `undefined <= 0` is false forever. **Force every attack in
  the harness before calling a boss finished.**
- **A8.** A boss needs all twelve wiring points, or it breaks in ways playtesting finds slowly.

## What makes a fight rather than a damage race

- **A11. THE OPENING IS CAUSED, NOT WAITED FOR.** A window that arrives on the boss's own timer teaches nothing.
  A window the player MAKES is the whole fight. *Ring the bell. Jam the drum. Cut the chain and drop the chandelier
  on her. Land the death mark on nobody so it comes back on him.*
  **The bosses that read as "he does basically nothing" are the ones whose only opening was the rest they were always
  going to take.**
- **A6.** Every untouchable phase owes an open one — named, visible, with a damage multiplier.
- **A5.** Nothing is untouchable for longer than about two seconds. An invulnerable phase is punctuation, not a
  paragraph.
- **Concurrent layers, not a sequence.** The best fights run two or three things at once — his attacks, the room's
  own clock, and something that escalates.

## Phases

**A10. PHASE TWO MUST CHANGE SOMETHING YOU CAN NAME.** Half health is a number, not a phase. Crossing it must alter
what the fight **asks of you** — a new told attack, an attack that stops, a room that moves, a speed the old reads no
longer fit — and a player who has just crossed it should be able to say what changed in one sentence.
**An extra attack bolted onto the same rotation is the floor, not the plan.**

## The room

- **A12. THE ARENA MUST SUPPLY WHAT THE ATTACKS ASSUME.** If an attack carries a height condition, a distance, a
  wall, a hazard or a prop, the room must HAVE it. *Earned twice in one day: the Buried Dead's nova only lands within
  80px of the floor and his room's only tier was 48px up; the Paladin's bash only lands within 44px and his yard was
  eleven rows of open air over a flat street. Both fights were WRITTEN for height and neither room had any.*
- **A4.** The signature mechanic must be the room's, and the room must be able to give it.
- **A7.** An arena is about forty tiles. Past ~44 the boss can be off screen.
- **A9.** A level of 450+ columns wants a named mid-level fight too, not trash-to-boss.

---

# PART THREE — DECIDED, 2026-09-24

1. **All three class levels gate their hero.** THE UNBURIED FIELD gates the Death Knight, THE POWDER DECK the
   Freebooter, THE CHURCH the Paladin — each needs a `coinNeeds` on its hero the day its level is placed, as `pyro`
   has today. **The Warden is the deliberate exception** and stays unlocked from the start.
2. **Abilities are bought; passives come with levels.** The shop sells **active abilities only**. Passives unlock
   automatically at hero levels, and the hero menu shows which arrive when. Exactly one existing skill is passive
   (`kindle`), so migrating what exists is a single item.
3. **The Paladin's charge is final** — 145px/s behind a 1.6s tell, 4.7s of total warning. Do not re-tune.
4. **The Death Knight's art grows to meet his hitbox**, not the reverse. His reach does not change; the picture of it
   stops lying.
5. **The four bosses written `0` in `src/threat.js` become `6`** (closedhelm, bellcrab, drownedking, prince).
6. **Fire respects invulnerability and the open bonus** — nothing while the Archmage is invulnerable, doubled while
   the Undead Archmage is open.
7. **The Queen's walkway goes; the chandelier replaces it.** Cut its chain and it drops on her and pins her exactly
   as the gallery did. She already has a chandelier attack, so the room owns the prop.
8. **Optional levels sit on spurs** (`spur: true`), required levels on the road. The three unbuilt class levels each
   get a spur the day they are placed. **STORMWRECK HARBOR is shelved on purpose — leave it alone.**

**Still open, deliberately:** flattening the campaign ramp. Every measurement of it was read off a threat table that
was missing five common foes; it is being re-measured, and nobody should rebalance shipped levels on the old numbers.

---

# PART FOUR — WHAT TO BUILD, IN ORDER

**First, three checks and one fix.** A10, A12 and F10 are all checkable and none is checked — and every problem they
describe was found by playing the game, which is the most expensive way to find anything.

1. **F10** — a set difference: every level's roster against the union of every earlier level's.
2. **A10** — compare the two turn lists on any boss picking from `phase === 2 ? [...] : [...]`; fail when they differ
   only by an append.
3. **A12** — read an attack's guard conditions against the arena's standable rows; fail when nothing in the room can
   satisfy a condition an attack tests.
4. **Fix THE BURIED DEAD, who fails A10 today** — seven turns before enrage, eight after, the extra one appended and
   nothing else changed.

**Then the content.** The game has **30 real levels; 11 are queued — a 37% expansion.** All eight desert levels have
greyboxes, and the arc carries its own class (the Sun Priest) and world boss (the Skeleton King): it is a whole new
act, and the sandy path at the end of THE FALLING TOWER is its doorway.

| | | why here |
|---|---|---|
| 1 | **THE ORE ROAD REWORK** | it is live and rejected. Fixing a bad level beats adding good ones. Brief written and approved. |
| 2 | **THE MAP REDESIGN** | **before the levels, not after.** 29 nodes become 41, most in a region the map has never held. A layout built for 29 and stretched is how the mandatory Ore Road already came to read as a detour. |
| 3 | **THE UNBURIED FIELD** | brief *and* greybox, gates the Death Knight, self-contained. The cheapest real win. |
| 4 | **THE DESERT ARC** | one sustained push — eight greyboxed levels sharing a tileset, a class and a boss want continuity. |
| 5 | **THE POWDER DECK, THE CHURCH** | least specified of the three class levels. |

**Parked:** the Burial Caverns rework. Its INDEX is fine (108) once the threat table was fixed; "it is boring" is real
but it is the vaguest item here and it competes with eleven levels that already have briefs.

**On scope, honestly:** eleven levels is months at the pace this has gone. If only a subset matters for shipping,
saying so aims the work far better than working the list top to bottom.
