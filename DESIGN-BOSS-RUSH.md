# Boss rush: how it should work in BRACKEN

Asked: how would a boss rush work, and do we need separate portals after each boss to load each boss room,
since some bosses have mechanics only their room provides?

**Short answer: no portals, and no new rooms. Load the real level, teleport to its arena, fight, and when the
boss dies, load the next level.** One mode, fifteen fights, no duplicated geometry. The reason is in the table.

## What each boss actually needs from its room

| boss | level | arena width | needs from the room |
|---|---|---|---|
| Hornet Queen | wood | 33 | nothing |
| Frog King | marsh | 42 | its dais |
| Goblin Chieftain | stockade | 34 | nothing |
| Mother Cap | spore | 77 | nothing (her gills and stump are entities) |
| King Gorm | kings | 54 | nothing (his scaffold is ordinary tiles) |
| Ram Lord | scree | 16 | nothing |
| Owl Reeve | hanging | 70 | nothing |
| The Roc | spire | 92 | nothing |
| The Windcaller | moor | 44 | nothing (his stones are entities) |
| The Lance | storm | 127 | nothing |
| Goblin Queen | crown | 43 | her gallery, the hole in her floor, her rubble |
| Tide Herald | longwater | 40 | the square's tide pool |
| The Reefmaw | reef | 28 | its four holes + the tide pool |
| The Quartermaster | flotilla | 116 | her three decks and the two lines she cuts |
| The Captain | hurricane | 42 | the wash, the lightning, her masts |

Only five of fifteen need anything, and **everything they need is already a field on the level object**
(`arena.holes`, `arena.decks`, `arena.cuts`, `arena.gallery`, `L.wash`, `L.storm2`, `L.masts`, a pool with
`arenaTide`). None of it is separate geometry you could hand-build in a rush arena without rebuilding the
level. Copying those rooms into a new "rush" level would mean maintaining every boss room **twice** — and the
last two months of playtest notes are almost all "this room needed fixing".

So: don't copy the rooms. **Visit them.**

## The shape I would build

**`RUSH` is a mode, not a level.**

```
PROG.rush = { on: true, i: 0, hp: <carried>, deaths: 0, t: <elapsed>, order: [...] }
```

1. From the map (a node at the end, or a menu item unlocked by beating Highcrown), start the rush.
2. `loadLevel(order[i])` as normal, then immediately:
   - teleport the player into the arena (`arena.trigger` + a few tiles), set the checkpoint there;
   - call `bossStart()` so the walls are up and the music is the boss's;
   - strip the level of everything that isn't the fight: `enemies = enemies.filter(boss or called)`,
     clear `acorns`, `silvers`, `strays`, `props` that are quest or shop, and hide the HUD's level quest.
   - the level's own systems keep running, which is the whole point: the Captain still gets his wave, the
     Reefmaw still gets its tide, the Quartermaster still gets her decks to cut.
3. On the boss's death (the existing `queenDies` → `bossEnd` path), instead of `winLevel()`:
   - roll credit: time, hits taken, deaths;
   - **a short breather**: the arena drops its walls, one heart and a stamina flask spawn, and a "NEXT: THE
     FROG KING" plate counts down 4 seconds — this is where a portal would have gone, and it does not need to
     be a place;
   - `i++` and load the next.
4. Death ends the run (or costs a life — see the variants). Finishing it writes a record: best time, best
   no-death, best no-hit.

That is roughly **one screen of code** plus the strip-the-level function, because `loadLevel`, `bossStart`,
`bossEnd` and the arena walls already do the work.

## Why not portals

A portal after each boss implies a hub you stand in and rooms you walk into, which means:
- a fifteenth-and-a-half level to author and dress,
- every boss room duplicated (and five of them re-authored, badly, because their mechanics are level-wide),
- two copies of every future fix to a boss arena.

The only thing a portal buys is *ceremony*, and a four-second "NEXT:" plate with the next boss's silhouette
buys the same ceremony for nothing. If you want the hub feeling later, the map itself can be the hub: after
each kill, drop the player on the world map with the next node lit and walk them to it automatically. Same
code, no new geometry.

## The order, and why

Not the story order — the story order front-loads three easy fights. Rushes want a ramp with rhythm:

1. Hornet Queen (a warm-up that teaches the pogo again)
2. Goblin Chieftain (a straight duel)
3. Frog King (the first real read)
4. Mother Cap (a puzzle boss, breaks the rhythm early)
5. Great Hound *(mini)* — short, fast, resets the pulse
6. Ram Lord
7. Owl Reeve
8. King Gorm
9. Tide Herald
10. The Reefmaw
11. The Windcaller
12. The Roc
13. The Quartermaster
14. The Captain
15. The Lance
16. The Goblin Queen (the ending stays the ending)

Minis (Great Hound, the Web Spider, the Forgemaster, the Drowned Bosun) make excellent palate cleansers at
every fourth slot; they are already `mini` arenas with the same machinery, so they cost nothing extra.

## Rules worth arguing about (my picks in bold)

- **Health between fights**: **carry it, and drop one heart per win.** Full heal trivialises the ramp; no heal
  at all makes it a memorisation exercise. The heart makes the earlier fights worth playing cleanly.
- **Stamina and skills**: **full stamina each fight**, and the hero is the one you started the rush with.
- **Talents**: **the run uses your saved tree**, and a rush-only "loadout" screen before you start (it is the
  talent screen with FORGET ALL free, which already exists).
- **Deaths**: **three lives for the whole run**, not per fight. A boss rush with infinite retries is a list of
  chores; one death per run is a slot machine.
- **Relics**: off. They are level rewards and half of them are level-specific.
- **The record**: time, lives left, hits taken. Show the three on the map node like a medal.

## What it would cost

- Strip-the-level + start/advance/end plumbing: half a day.
- The between-fights plate and the breather: an hour.
- The rush node on the map, the loadout screen hook, the records in `PROG`: a couple of hours.
- **The real work is balance**: every boss is currently tuned against a player who arrives with the level's
  relics, full health and a checkpoint thirty seconds back. Expect two passes of the bot sweep
  (`tools/balance.mjs`) to get the ramp honest.

## One extra mode that falls out of this for free

Once a boss can be loaded straight into its own arena, **"practise this boss"** costs nothing: the same entry
point with `rush.single = id`, reachable from the bestiary page of any boss you have already beaten. That is
probably the more-played feature of the two.
