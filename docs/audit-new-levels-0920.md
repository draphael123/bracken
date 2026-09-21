# Why the new levels are boring — an audit with numbers

Daniel's report, 2026-09-20: the four levels added in the Codex pass (Stormwreck Harbor, the Underwater
Keep, the Burial Caverns, the Falling Tower) are boring, their bosses are poor, they have no music of
their own worth the name, and they miss the core game feel. The Falling Tower is the old tower walked
backwards. The Burial Caverns look right and do nothing. Its poison water does not read as poison.

This is the evidence, the cause, and what to do about each one. Measurements come from
`work/claude/shape.mjs` (reach-flood shape per 24-tile screen), `work/claude/ents.mjs` (what is actually
placed), `work/claude/tour.mjs` (screenshots every N tiles) and runtime probes.

## 1. The one cause behind all of it

**The levels were made longer instead of fuller.** Harbor went 360 -> 1,080 tiles, the Keep 200 -> 600,
Burial 380 -> 1,140. The content did not triple with them, so everything per screen fell by about two
thirds. Length was the target that got hit; density was the target nobody was holding.

Enemies placed per 24-tile screen (a screen is about what you see at once):

| built before | /screen | built in the Codex pass | /screen |
|---|---|---|---|
| Sporewood | 5.5 | Stormwreck Harbor | **1.6** |
| The Lamplit Street | 5.5 | The Underwater Keep | **1.7** |
| Kingswood | 4.8 | The Burial Caverns | **1.4** |
| The Drowned Causeway | 4.4 | The Falling Tower | **2.3** |
| Highcrown | 4.4 | | |
| The Mage's Folly | 3.7 | | |

Screens that are flat (two or fewer standable heights in the whole screen): Kingswood 4%, Sporewood 15%,
Lamplit 15% — Burial **53%**, Falling Tower **42%**. Half of the Burial Caverns is a floor.

And the kit is thin. What is placed in each level, ignoring coins and pure decoration:

- **Kingswood**: 16 creature types *and* a working toy chest — 7 drop cages, 3 levers, 8 fire pits, 6 fire
  vents, 7 pressure plates, 4 doors, 2 bridges, a bell, a chain post, a relic, a cage.
- **Burial Caverns**: 4 creature types (zombie x44 — 70% of everything alive, bat x11, boo x7, spider x3)
  and **no interactive prop of any kind**. 51 torches and 18 signs are the dressing budget. More signs
  than mechanics.
- **Stormwreck Harbor**: 11 creature types, all borrowed from the coast levels, nothing new except the
  boss; no interactive prop despite a "pump basin" and a "drydock" in the design notes.
- **Falling Tower**: the Mage's Folly roster minus its elites, plus 10 falling stalactites.

That is the whole diagnosis: **more floor, fewer things on it, nothing to touch.**

## 2. The Falling Tower is literally the same level

`src/tower-return.js` does not build a tower. It takes the Mage's Folly grid and edits it:

```
L.ents = L.ents.filter(e => e.x >= 118 && !['archmage','homunculus','check','sign','silver','key',
                            'lockgate','stray','npc','glyph','gplate','rune'].includes(e.t) && !e.elite);
L.START = {x:695, y:15};            // start at the far end
L.calm = [[0, L.W-1, 0, L.H-1]];    // and quiet the whole map
```

So the return trip is the same 712 tiles, with the puzzle pieces (glyphs, runes, plates, keys, gates),
every elite and every checkpoint stripped out, three holes cut in the floors, ten stalactites hung from
the ceilings, and the whole level marked `calm`. It is the old level with its content deleted and a
start position at the other end. That is exactly what it feels like, because that is what it is.

It also is not collapsing. The only collapse is six slabs inside the boss arena and four floor breaks.
Between them the tower is stable, quiet and lit, and the Undead Archmage is fought **outside on grass**
with dead trees behind him (screenshot `work/claude/tour/fallingtower/07-x13.png`) — the "tower" fight
does not happen in the tower.

There are no undead in it. The roster is armour, broom, imp, haunt, vatspit, mimic, turret, crow, bat,
spider — the living tower's staff, minus the interesting ones.

### What it should be instead

Keep the assets and the rooms; throw away the route. A collapsing tower is a **descent under pressure**,
not a walk:

1. **One continuous fall, not a traverse.** The route should read top-to-bottom, not right-to-left: the
   study at the top, then down through the observatory, orrery, alchemy, library, to the front door. The
   existing rooms can stay where they are on the grid; what changes is that the *way through each one is
   downward* — chains, broken stairwells, holes burned through floors.
2. **Collapse as the clock, everywhere.** Rather than 10 scripted breaks, the tower sheds continuously
   behind you: each room's floor starts cracking a fixed time after you enter it, with dust, then a
   warning creak, then it goes. Going back the way you came should stop being possible. That single rule
   converts the whole level from a corridor into a chase, and it costs one system, not 700 tiles of
   authoring.
3. **The dead staff.** The wizard's people did not leave. Reuse the existing `armour`, `broom`, `mimic`
   and `vatspit` but raise them: the burial pass already has `zombie`, `boo` and the `haunt`; a dead
   apprentice (zombie reskin with the apprentice palette), a **crawling hand** cut from the familiar
   sprite, and the **Undead Archmage's students** — three robed wights that use the mage's own telegraphed
   fire/frost bolts at a third of the damage. Four undead types, all from sprites that exist.
4. **Fight the Archmage inside his falling tower.** Move the arena back into the tower's base hall (the
   library floor), keep the eleven-tile final platform idea, and let the collapse rule above be the
   phase driver: every third of his health, another ring of the floor goes, so the fight ends on the
   footing the level has been taking away from you the whole descent.

## 3. The Burial Caverns look right and do nothing

The look is genuinely good — the ossuary wall, the candle light, the bone stairs. The problems are all
content:

- **One wallpaper.** The same skull-niche pattern tiles the entire 1,140 tiles at the same height and the
  same brightness. Every screen from x=120 to x=1,000 is the same picture (see the contact sheet
  `work/claude/tour/sheet-burial.png`). Kingswood changes its backdrop four times in 600 tiles.
- **One enemy.** 44 zombies, all identical, all walking at you. Nothing shoots, nothing flies at you
  except 11 bats, nothing forces a different answer from you.
- **No props to use.** No lever, no cage, no plate, no rope, no breakable — nothing the player operates.
- **The poison water does not read as poison** (measured, see §5).
- **Nothing is ever taken away.** No dark, no air limit, no timer, no lock.

### What it should be instead

A burial ground's fantasy is *the dead do not stay put, and the ground is not solid*. Concretely:

1. **Candles as a resource.** The level's rule text already says "FOLLOW THE CANDLES". Make that a
   mechanic: the caverns go dark between candle-light, and the `boo` and the grabbers are only dangerous
   in the dark. The game already has light-carrying (`lantern`, `minerlamp`, the Tollmaster's darkness
   attacks) — use it.
2. **Three more of the dead, from sprites that exist**: a **bone-thrower** (skeleton that lobs skulls,
   `skull` seeds already exist with damage), a **barrow wight** (the Keep's `wight`, which already has an
   attack loop), and **grave hands** that grab in packs on open ground so the floor itself is hostile.
3. **Collapsing graves.** The one good idea in the level (emerging grabbers) should be everywhere: coffin
   lids as one-way floors that break on the second landing, so routes across the ossuary are consumed as
   you use them.
4. **The poison is a river, not a puddle.** Four separate 2-tile-wide puddles do nothing. One long poison
   channel with stepping stones, a current, and a rising level (tied to a lever the player pulls to drain
   it) is a set piece.

## 4. Harbor and the Keep — the same disease, milder

**Stormwreck Harbor** (1.6/screen). The look is right and the rain sells it. But: the entire roster is
borrowed from the Reef/Flotilla, so it plays like a level you have already played; the "storm market",
"pump basin" and "drydock" exist as *scenery with no verbs* — there is no pump to work, no crane to drop,
no gate to wind. Fixes, cheapest first: (a) raise density to ~4/screen by using the Causeway's tide
marauders and the Lamplit's lantern shades; (b) make the storm a mechanic — periodic squalls that blow
the player (the moor already has `wind`), so traversal has a rhythm; (c) give the drydock ship one
working crane the player rides, and the pump basin a lever that drains it to open a low route.

**The Underwater Keep** (1.7/screen) is the best of the four, because breath is a real clock and the
currents/sluices/thermals/ballast/clam are real verbs — that is exactly the right instinct. Its problem is
**spacing**: 600 tiles with 7 sections means each mechanic appears once or twice and never combines. The
fix is not more tiles; it is **combination** — a current that pushes you across a thermal while a
bellguard rings, a ballast carried through a sluice on a timer. One combined room is worth five
single-mechanic corridors.

## 5. The poison water — measured

It *does* damage (`work/claude/poison-walk.mjs`): standing in it costs 12 HP every 0.6s, 100 -> 40 in
three seconds. But it does not read as damage, which is why it feels broken:

- The hero **floats upright at the surface** (y stays at 33.0–33.6, the waterline) so it looks like
  standing on a green floor, not drowning in poison.
- The damage is dealt with `noKnock` and no label. Every other hazard in this game shouts — "TRIPPED",
  "THE WATER IS FOUL", "STUCK". Poison says nothing at all.
- It is 2-tile-wide gaps between 3-tile pillars, so the player bobs in a slot until a net pulls them out.
  There is no moment of decision.

Fix: a `POISONED` number and a green flash on entry, a lingering poison tick for ~2s after climbing out
(so it has a cost you carry), sinking instead of floating, and the §3.4 redesign of the crossing itself.

## 6. The world map is mountains all the way inland

`src/main.js` bakes the inland sheet — Waymeet, the Hexed Fields, the Burial Caverns, the Mage's Folly,
the Falling Tower — with `style: 'crag'`, the same rock style as the Sunspire road. `src/art.js` has
exactly three map styles: `wood`, `crag`, `coast`. So everything past the water is grey rock.

Fix: a fourth style, `haunted` — a dead town under fog. Crooked roofs and a broken steeple for Waymeet,
hedge-and-furrow for the Fields, a walled graveyard over the Burial Caverns, a leaning tower for the
Folly, and the same tower broken in half for the Falling Tower, over a washed-out grey-green ground with
fog banks and bare trees. Same node and path code; only `bakeMap`'s style branch is new.

## 7. The music is not really music

The four new tracks are **22.05 kHz mono 16-bit WAVs, 40–60s**, synthesised by script. Every other track
in the game is a composed CC0 chiptune at 44.1 kHz stereo. At 22 kHz there is nothing above 11 kHz, so
they sound muffled and flat next to the rest, and raising the gain (the last checkpoint took them to
3.5–5.0x) makes them louder, not better.

Two ways out: source four more CC0 chiptunes from the same OpenGameArt packs the game already credits
(free, consistent, proven — the route every other level took), or generate original tracks with
ElevenLabs (real instrumentation, but a licence and a house-style question). Recommend the first for
consistency, with ElevenLabs as the option if Daniel wants something unique.

## 8. The rule this should leave behind

A level is not finished because it is long. Before a new level counts as built it should hold, per
24-tile screen: **≥3.5 placed creatures**, **≥3 standable heights on at least 80% of screens**, **≥1
prop the player operates every 3 screens**, and **≥4 creature types with different answers** (one that
closes, one that shoots, one that flies or drops, one that must be opened up). A boss needs a **loop the
player drives** — Gorm's cages, the Mother's root and heart, the Kraken's arms — not a round-robin of
four tells on flat ground, which is what all four of the new bosses are
(`e.turn++ % 4` in `src/buried-dead.js` is the literal implementation).

`tools/` should grow a `density.mjs` check that fails the suite when a campaign level falls under those
numbers, so this cannot happen again quietly.

---

# What was done about it, 2026-09-20 (Claude)

## The structural cause, found and fixed

The audit above blamed "longer instead of fuller". The mechanism turned out to be three lines of code:

1. **`GARRISON` had no row for any of the four levels.** Every other campaign level is populated by
   `garrison()` in `src/level.js` from a weighted roster (Lamplit has 16 kinds, the Reef 17). The four new
   levels had none, so they were only ever the creatures their builder placed by hand.
2. **Harbor and Burial marked the WHOLE level `calm`** (`calm:[[0,1080,0,44]]`, `calm:[[0,1140,0,60]]`), and
   the Falling Tower did the same (`L.calm=[[0,L.W-1,0,L.H-1]]`). `garrison()` skips anything inside a calm,
   so even with a roster they would have stayed empty.
3. **`ELITES` had no row for them either**, so none of the four had the one big fight every other level has
   on the way to its boss.

Fixed: rosters added for all four (undead-led for Burial and the Tower), the blanket calms removed, elites
placed. The Keep also needed `L.swimGarrison` - it is submerged end to end, and the sprinkler will only put a
creature in a wet spot if it is on the swimmers list, so its own drowned garrison could not be placed at all.

**Enemies per screen:** Harbor 1.6 -> 3.5, the Keep 1.7 -> 4.2, Burial 1.4 -> 3.4, the Falling Tower 2.3 -> 3.4.
(Kingswood, the benchmark, is 4.8.)

## The Falling Tower

- **It sheds behind you.** Every run of walkable floor along the route is a `deckBreaks` span with a new
  `behind` flag: it arms when the hero has been on it and then left it, and goes 1.1s later. 39 spans, so the
  way back closes continuously as you descend instead of three scripted holes in 712 tiles.
- **The fight is inside the tower.** `mage.outside` was 118, so everything left of it - including the whole
  boss arena - was still the Folly's outdoor approach: the dead Archmage was fought on grass under the sky
  while his tower came down off screen. The masonry now runs to the front door and the hall is roofed.
- **The dead staff.** The tower's roster is undead-led (apprentices, zombies, husks, ghosts) beside the
  brooms and imps it already had, and the Folly itself now keeps a few apprentices, so the sequel's undead
  are not a surprise it invents.

## The Burial Caverns

- **An upper gallery**: coffin shelves over the road with ladders up to them, so the flat screens fell from
  53% to 33% and the standable-height count went 4.8 -> 6.3.
- **The poison now reads as poison**: a POISONED label, it pulls you under instead of floating you upright at
  the surface, and it leaves a 2.4s poison on you that keeps ticking after you climb out. It yields to a
  swimmer holding up, so it is never a slot you cannot get out of. (It always *did* damage - 12 HP every 0.6s
  - which is why this was a feedback bug, not a damage bug.)
- **The crossing** is 4-tile slabs with a 2-tile channel instead of 3-tile slabs. A 3-tile channel was tried
  and measured: from a standing jump all six heroes land in the poison, so it was rejected. The green river
  with a drain lever from section 3.4 above is still the bigger job, not done.
- **Two more of the dead**: the GRAVE HUSK (below) and the skeleton pirates - bone corsairs and lantern
  shades - washed under the hill from the Lamplit Street.

## Two new undead, and the bosses

- **THE GRAVE HUSK** - the caverns' second dead man: bigger, slower, twice the health, and it bursts when it
  dies. Killed at arm's length the gas costs health and leaves the same poison the green water carries;
  killed from across the room it costs nothing. (`tools/undead-foes.mjs` proves both.)
- **THE DEAD APPRENTICE** - the tower's own, in the robe he died in, and the only one of the dead with a
  reach: he throws an ember. Both reuse `updateZombie`, and both have their own baked frames, so neither is a
  recoloured zombie.
- **Every one of the four bosses now has an opening the player makes**, where before each one chose attacks
  with `turn++%n` and handed out a timed rest:
  - THE BURIED DEAD: slam him down onto the ground he already erupted through and his arm goes in (3.4s).
  - THE BREAKWATER WARDEN: turn the anchor on a shield and it is torn out of his hands (1.8s -> 3.4s).
  - THE VAULT KEEPER: cut him while the bell is still swinging and the note breaks (2.9s).
  - THE UNDEAD ARCHMAGE: two blows while he holds the floor down break the spell, and the slab he was
    pulling away survives (3s). His health is stage-gated so no damage is possible there - the blows land on
    his concentration instead, and he is no longer immune through the collapse, only through the blink.
  `tools/boss-openings.mjs` proves each one is *caused*: the same boss, left alone through the same attack,
  does not open.

## The map and the music

- **The world map inland sheet** is a new `haunted` style instead of `crag`: a dead town under fog, with a
  broken steeple over Waymeet, hedged closes at the Fields, a barrow and a walled graveyard over the Burial
  Caverns, and the Folly's tower leaning at one node and snapped in half at the next.
- **The music is composed again.** The four 22 kHz mono synthesised WAVs are replaced by CC0 tracks, three
  from packs already credited here, each lowpassed at 9 kHz and levelled to -15 LUFS like the rest of the
  library. Track gains go back to ~1.0 from the 3.5-5.0 a script needed to make thin mono loops carry.

## Still open

- Harbor and the Keep got density and a boss loop, but not the *verbs* section 4 asks for: no working crane,
  pump or squall in the harbour, and the Keep's mechanics still appear one at a time rather than combined.
- The Burial poison river with a drain lever (3.4), the candle/darkness resource (3.1) and collapsing coffin
  lids (3.3) are not built.
- A skeleton goblin, and the Burning Village's burning goblins and touch-damaging wisps, are a single enemy
  pass still to do (`.claude/briefs/burning-village-pitch.md`).
