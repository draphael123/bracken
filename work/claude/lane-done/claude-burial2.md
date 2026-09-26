# claude/burial2 — lane report (2026-09-26)

Daniel, 2026-09-25: *"The level with the buried boss still feels too long and repetitive."* He chose the whole plan from the
level review. Everything is on `claude/burial2` and pushed. I did not touch master, did not deploy, and did not run the full suite.
Brief: `docs/briefs/burial-rework-2.md`.

## Commits

| sha | what |
|---|---|
| `c4f7f8b` | the brief |
| `31363d5` | the cut, the five backdrops, the gas-vent machine, the Buried Dead's caused opening, the earth floor tile, barrow soldiers, the checkpoint fix, rule S, and the new checks |
| `b0c7dae` | the real-keys walk tool, the bone-wall backdrop redraw, and the before/after pilots, walks and captures |
| `01fb49d` | local paths scrubbed from the committed logs |
| (report) | this file |

`origin/master` had not moved since `eeaad91`, so there was nothing to merge.

## What I built

**1. The cut.** THE BURIAL CAVERNS is now one builder, `src/burial-caverns.js`. It was four layers (`additional-areas` + `burial-expansion` + `burial-rework` + `burial-variety`), and each layer added a stretch without taking one away. It is 528 x 74 now. The Grave Causeway, Restless Rows, Falling Gallery, Plague Vault, Bone Stairs and Last Procession are gone. The descent is packed under the road, the way it always was.

Seven sections (F1):

| # | section | columns | backdrop |
|---|---|---|---|
| 1 | THE CANDLE PATH | 0-99 | barrow |
| 2 | THE OSSUARY (with THE BLIND VAULT) | 100-187 | ossuary |
| 3 | THE CHARNEL GALLERIES (two galleries, east then west, THE CHARNEL HOUSE ambush) | 184-296 | bone stair |
| 4 | THE DROWNED OSSUARY | 178-302 | crypt |
| 5 | THE GRAVEYARD KEEPER (his vault and the shaft up) | 303-366 | bone stair |
| 6 | THE ROTTEN BRIDGES (the exam, dark) | 367-466 | barrow |
| 7 | THE BURIED DEAD'S LAIR | 467-527 | processional hall |

Five landmarks (F2): the first vent (the lesson), the Blind Vault, the Charnel House, the Keeper's vault, and the bridges.

**2. One backdrop a section.** `src/burial-looks.js` paints four new backdrops:
- **barrow:** an earth cut with strata, shrouded bodies in niches, a dry-stone foot and timber props.
- **crypt:** a round-arch arcade with a tide line.
- **bone stair:** a wall of stacked long bones with a skull stair climbing it.
- **procession:** pillars, a crowned effigy in a niche, and swaying banners.

The skull-niche wall stays, and only THE OSSUARY uses it. The builder finds every side-by-side seam between two backdrops and puts a pillar on it. There are 4 seams and every one has a pillar.

**3. The machine: gas vents you light** (`src/burial-expansion.js`).
- **Candles:** walk into a candle's light and you have FIRE IN HAND for 14 s. A blow puts it out, and so does water.
- **Lighting a vent:** swing at a vent with fire in hand and it burns for 20 s. While it burns:
  - it gives off no gas;
  - it lights the dark like a lamp;
  - any of the dead standing in its flame burn;
  - buried dead inside its light (96 px) stay down, and the Buried Dead's summons do not rise there;
  - you can take fire from it, so in the Blind Vault you light your way from vent to vent.
- **How it is taught and used:**
  - It is taught safely on open ground: a candle, a vent, a sign, and one buried dead in the vent's light.
  - It is used to see (two dark vaults), to keep the dead down (6 buried dead placed in a vent's light), and to clear a path (a vent sits in the exam's low pass, the only way on).
- **The boss (A11):** the Buried Dead's rest no longer opens him. A burning vent under him SCORCHES him: he is open for 3.4 s at x1.3, once per lighting. His lair has three floor vents and a candle at each wall. The arm-in-the-ground punish stays.

**4. Fixes.**
- **Earth floor tile:** `ART.bakeEarthTop` and `bakeEarthEdge` are used on every level below the ground (burial, the Ore Road's mine, the Undercrown). They have no turf, no root and no moss. `skins.mjs` holds the rule and renders the tile in Node to prove it.
- **No sea dead:** there were no bone corsairs left (they became husks on 2026-09-24). The coast's lantern shades and the fields' wights are also gone. The barrow soldiers are now THE FALLEN, risen, from the Unburied roster: `L.risenDead` stands the garrison's corpses up, and one of them is an elite.
- **Checkpoint gap:** there is a checkpoint on the Drowned Ossuary's west pier, where the galleries drop you. The `checkpoint-gaps` KNOWN entry for burial is deleted.
- **Medals:** 1000/1450/2100 became 520/760/1100.
- **Bot:** the lab bot now takes fire, lights the vent nearest him, and stands past it.

## Numbers before / after

| | before | after |
|---|---|---|
| cols (curve.mjs spanOf) | 1,386 (1140 x 112) | **660** (528 x 74) |
| walked route | ~1,400 | 740 tiles |
| checkpoints | 19 | 10 |
| worst walked checkpoint gap | 206 | **110** (pier to pier across the black water) |
| free hearts | 4 | 2 |
| foes / kinds | 186 / 12 | 69 / 11 |
| **INDEX** | 108 | **97** (curve now says "32 easier than fields"; before it said 21) |
| play bot walked (knight, warden) | 8%, 2 deaths | 17%, 3 deaths, STUCK once at the first pit (the bot's jump; see UNVERIFIED) |
| real-keys walk, 7 heroes | - | all 7 reach the lair door (116-158 s); all 10 pools can be climbed out of |

**Pilot** (`tools/burial2-pilot.mjs`: 7 heroes, refill, 150 s, 3 seeds; rows in `work/burial2/pilot-*.txt`):
- **Before:** 21/21 kills, median 93.5 s. Openings: the rest window every turn, plus 27 stuck. Damage taken ran 118-174 hp/min.
- **After:** 21/21 kills, median **122.8 s**. Openings: **81 scorched**, 18 stuck. Damage taken ran 166-232 hp/min.

The fight is longer and costs more health, because every opening now has to be made.

**Per-section cost** (the route walker, knight, `work/burial2/walk-after.txt`): the most expensive stretch is the Keeper, but only because the walker cannot fight him (RULES M). On the road itself, the Charnel Galleries cost the most: 274 health, 2 deaths.

Captures:
- `work/burial2/before-*.png`: 20 checkpoints and the boss.
- `work/burial2/after-*.png`: 11 checkpoints and the boss.
- `work/burial2/look-*.png`: the galleries' bone wall, the first pit, and the Ore Road floor.

## Rule S, item by item (`tools/burial2.mjs`, `tools/burial-route.mjs`)

- **S1 (a foe where the ground makes it worse):** 14 placements, including:
  - foes at the landings of pits;
  - archers and skull-throwers over jumps;
  - the elite husk on the pier between the rotten spans, with an archer over it.
- **S2 (jumps that can fail):** 7 jumps on the road are exactly 3 tiles, all over green water, and none are wider.
  - All 7 heroes make every jump with a run-up. A jump taken 1.5 tiles early lands in the water.
  - The knight's real running jump measured **3.16 tiles**.
  - The pit chains sit under the water line on purpose: at the lip they caught short jumps and made the pits harmless (red first).
- **S3 (an exam before the boss):** THE ROTTEN BRIDGES, 100 columns, in the dark. It has:
  - four vents, one of them in the only pass;
  - two crumbling spans and two pits;
  - buried dead at the landings, an archer and a skull-thrower;
  - a checkpoint at its door, one outside the arena, and none inside or free hearts in it.
- **S4 (checkpoints spaced):** closest pair 50 route tiles, worst gap 110.
- **S5 (healing earned):** 2 free hearts for 10 checkpoints: one after the Charnel House, one after the Keeper.

## Checks

These are named checks only, never the full suite. There were **56 green** on the final tree before the last commit:
- the 52 from the baseline;
- slopes-trace, rebased for **burial only** (an intended geometry change);
- textfit;
- the two new checks, `burial2` and `burial-vents`. Both are registered inside the `check.mjs` list, before `]) if (take(t))`.

The baseline on master was all green. A final re-run of the same set was started after this report was written; see the last commit.

**Red first**, run against the old tree:
- `buried-dead`: "slamTell left him open on his own timer: 2.2" and "scorched 0 times".
- `skins`: "bakeAll still lays the surface's grass-top tile".
- `additional-areas` and `burial2`: fail on 1386 cols.
- `burial-route`'s early-jump assertion was red while the chains reached the lip.

**Tools rewritten for the new layout:**
- `burial-route`: now asserts the real jumps for all 7 heroes.
- `burial-geometry`: now proves the gallery drop and the gassed low pass are the ways on.
- `burial-rework`, `burial-variety` and `buried-dead`: coordinates now read off the arena.
- `boss-openings`: adds the gas opening, and reads the Keeper's graves off the level.
- `buried-attacks`: the body slam's landing opens nothing now.

**Not in the suite:** `tools/burial2-keys.mjs` (the real-keys walk, about 15 minutes), `burial2-pilot`, `burial2-walk`.

## UNVERIFIED

- **Nobody has played it.** The feel is unchecked:
  - how tight the 3-tile jumps are (a hero clears them with about half a tile to spare);
  - FIRE IN HAND lasting 14 s;
  - the burning vent's 96 px light radius.
- **The play bot still sticks at the first pit.** It sizes its jump for the reach model and falls short. A scripted real-key player makes every jump, and every pit can be climbed out of. It is noted as ODD, not BUG.
- The Buried Dead has not been piloted at normal health (one life). Only refill mode was run, as asked.
- I have not looked at how the backdrops read at a normal zoom beyond the captures, and not on a real screen.
- The route walker's per-section figures for the Keeper and later are the walker failing to fight, not the level.

## QUESTIONS FOR DANIEL

1. **Difficulty INDEX fell from 108 to 97.** curve.mjs now reads burial as 32 below the Hexed Fields; it was already 21 below before the rework. The pilot says the boss got harder: 93.5 s became 122.8 s, and more damage taken. *Recommendation:* play it before adding bodies. If it feels easy, add hazard on the road (more vents in passes) rather than more foes, per rule S.
2. **Should vents be lit by a swing only, or also by walking into a puffing vent while carrying fire?** Right now it is a swing, plus the Pyromancer's flare or embers. *Recommendation:* keep the swing. It is a deliberate act, and it is what the lab bot learned.
3. **Scorched: 3.4 s at x1.3, once per lighting, with three vents in the lair.** Is that the right size for his only real window? *Recommendation:* keep it until you have played it. If he feels spongy, raise the multiplier, not the time.
4. **Is THE FALLEN (the Unburied Field's dead soldiers, risen) the right barrow soldier?** It is the Unburied Field's creature, so it now appears first under the hill, one level before that field. *Recommendation:* yes. It fills the "soldier" gap without a new sprite. A dedicated barrow-soldier model could come later.
5. **The checkpoint gap is now 110 route tiles, across the black water.** B6 says 100. *Recommendation:* accept it. A checkpoint on a floating bier cannot be stood at by the reach model, and the swim is quick.
