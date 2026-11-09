# THE MAKER: which bosses work in a made-by-hand level

**Update 2026-11-09 (latest): 49 of 53 work.** Each passes `tools/maker-bosses.mjs`, which also checks that each boss's setup is really there in play.
- **Captain:** his yards and lines are a room he brings.
- **Archmage:** gets his library fields and the rising acid.
- **Dune Worm:** fights under the caravan's rules, with the sun only in his hollow.
- **Shriek Sisters, Kraken, Admiral, Gate Gargoyle:** each brings a hand-built room. They need rows below the floor you click (the Kraken 11, the Admiral 10, the Gargoyle 9), and the editor says so if there isn't room.
- **Setups added to bosses already in the palette:** the Reefmaw's and Tide Herald's tide, the Chieftain's drums, the Coffin King's traps, the Wicker Queen's carousel, and every room boss's machinery (ladders, gongs, braziers, the Fog Knight's lock, the Lantern-Eater's raft).

Still lacking compared with their home levels:
- Grubbag's hooks and conveyor.
- The Dune Worm's quicksand and shade winch.
- The Kraken's full-depth sea.
- Dressing (masts, towers).

These need a hand-played pass: the Lantern-Eater (her fight is keyed, so the test can't play it), the Dune Worm's sun, and the Gargoyle's sunk room.

**Left out (4), whole set-pieces:**
- **Bullfrog King:** the marsh is rewritten into pads and lanes.
- **Winchmaster:** needs the Ore Road's cableway.
- **False Abbot:** needs his whole belfry house; also, `claude/abbot` is held.
- **Undead Archmage:** a falling-tower chase, then a carpet ride.

---

**Update 2026-11-09 (later): 42 of 53 now work.** A research pass found the real cause for each of the 30 that failed. 19 more were fixed and each passes `tools/maker-bosses.mjs`:
- **8 get the arena record their level gives them** (`ARENA_EXTRA` / `bossLevelExtra` in src/maker-palette.js): Ram Lord, Goblin Huntmaster, Berserker Chieftain, Grubbag, Coffin King, Reefmaw, Scarecrow King, Wicker Queen. The Ram Lord was never broken: the palette placed the battering-ram prop instead of the boss.
- **11 bring their own room**, stamped into the level by their own level's builder (src/maker-stages.js): Djinn, Cistern Queen, Old Plume, Glass Colossus, Hawk-Mistress, Paladin, Fog Knight, Hourglass King, Great Drill, Lantern-Eater, Puppeteer.

What these 19 fights still lack, compared with their own levels: the Chieftain's drums; Grubbag's coal trench, hooks and conveyor; the Coffin King's plate traps; the Reefmaw's tide; the Wicker Queen's carousel; and the stage rooms' extra machinery (ladders, pools, lamps). Each fight runs and ends without them.

Still out (11):
- **Not proven to finish:** Dune Worm, Shriek Sisters, Kraken, Admiral, Gate Gargoyle.
- **Need medium work:** Captain, Archmage.
- **Whole set-pieces** (not worth it in a plain level): Bullfrog King, Winchmaster, False Abbot, Undead Archmage.

---


Swept 2026-11-09 on `claude/maker`. Re-run with `node tools/maker-bosses.mjs --report`.

## How each boss was tested

Each of the 53 bosses that has a home arena was tested the same way:

- It was placed alone in a plain 100-tile wood, with the maker's arena built around it and its dice pinned to its name.
- The knight crossed the trigger line.
- To count as BEATABLE, a boss had to:
  1. wake up,
  2. stay in the world,
  3. move or hurt the knight,
  4. die to a blow when on its last point,
  5. open the placed goal gate when it fell.

Since the latest fix, a maker boss's fall always opens the goal that was placed. Its home level's aftermath is cancelled, for example the Chieftain's hall burning and the exit moving to the Stockade's gate. That fix let the **Goblin Chieftain** and the **Owl Reeve** join.

## In the palette: 23 beatable

Old Tusker, Goblin Chieftain, Owl Reeve, Mother Cap, King Gorm, Windcaller, Queen's Lance, Goblin Queen, Tide Herald, Tollmaster, Potion Master, Diving Bell, Drowned King, Breakwater Warden, Crusader, Buried Prince, Buried Dead, Pyromancer, Blood Knight, Roc, Bog Troll, Hornet Queen, Battering Beast.

## Left out: 30, and why

### Needs its own arena (23)

These read their home level's machinery as soon as they spawn, so they crash in a plain wood. That machinery can be wells, cisterns, decks, sand, coffins, mirrors, winches, hawks' perches and so on. Each one would need its arena rebuilt as a maker piece.

Bullfrog King, Reefmaw, Admiral, Kraken, Scarecrow King, Archmage, **Undead Archmage**, Winchmaster, Dune Worm, Puppeteer, Lantern-Eater, Djinn of the Great Well, Old Plume (Matriarch), Cistern Queen, Glass Colossus, Hawk-Mistress, Great Drill, Paladin, Fog Knight, Hourglass King, Coffin King, Lord Grubbag, Berserker Chieftain.

### Never spawns alone (2)

Placing one of these does not put a boss in the arena: their level's set-up makes them, not a single piece. The exact cause is not traced yet.

- **Ram Lord**
- **Goblin Huntmaster**

### Can't be finished by blows (3)

A blow on their last point does not kill them, so their fight must end some other way in their own level. The exact cause is not traced yet.

- **False Abbot**
- **Gate Gargoyle**
- **Shriek Sisters**

### Never fights (2)

These wake up but never move or attack in a plain arena. They likely wait on something their own level gives them.

- **Captain**
- **Wicker Queen**: her own level keeps her gate shut until dusk falls on the green.

## What it would take to add more

The 23 "needs its own arena" bosses are the big group. Each one is its own job: work out what its level gives it, then either fake that in the maker's arena or make the arena a placeable piece.

The ones most likely to be cheap are those whose crash is a single missing field rather than a whole set-piece. Finding out which those are means reading each spawn error, one boss at a time.
