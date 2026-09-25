# THE LONG WATER, LONGER, AS MORE RIVER (Daniel, 2026-09-25)

> A longer Meltfalls / Ferry Run: the river stretch off Highcrown's meltwater, before Saltreach. A freshwater kit for the whole
> river. A proper place for the Bore, told before it is met. Empty the first swim pool; spread the crowded rocks.

Level review: `level-review/group-a.md` section 12. Lane `claude/longwater2`. 482 -> 570 columns.

## The rule up here
Saltreach's rule is "the tide decides where the floor is". Above it the level is a **mountain river**: it falls, it pools, and it
carries you. Three ways it says so: **falls** off every lip, **pools** you dive, and **the river pushing** (the ferry, the current,
the Bore coming up it from the sea).

## The sections (final columns)
| cols | section | what it is |
|---|---|---|
| 0-127 | THE MELTFALLS | unchanged terraces. The first pool (14-18) is EMPTY: it comes before the swim sign. Its eel goes to the second pool (34-38). |
| 128-167 | **THE LINN** (new, 40) | the last terrace pours into a deep plunge pool, 8 rows. River stones stand out of it: the leaps down a row are three tiles (the most the main road asks, RULES S2), the steps up two. A scout on the far lip covers the hops (S1). Dive it for eight coins past its eel (S7). A gravel run after it, wading, with a heron. **The Bore is told here**, on a sign in the fishers' words, before the roar can be heard. |
| 168-179 | THE DOCK | the old ferry dock, moved. Its sign loses "the singing" (no sirens now). |
| 180-317 | THE FERRY RUN | the old river, moved. The four rocks keep ONE thing each: a heron (206), the checkpoint (238), nothing (272), a netter (298). No sirens, crabs, anglers, puffers, lampreys or merrow. |
| 318-365 | **THE BORE REACH** (new, 48) | the raft lands at a staithe and the river spreads into tidal mud flats, wading deep. Four stepped **bore stones** stand on the flats. The Bore now runs from here (its mouth) up to the dock: in the reach it knocks down anyone below a stone's top. A sign on the staithe says what the stones are for. Tidebound walking up behind the sea. |
| 366- | SALTREACH on | unchanged, moved +88. The sea's life starts here. |

## Freshwater kit (0-365, `L.fresh`)
- **Props:** rushes and driftwood (exist), **river stones** (new prop, `riverStone`, 3 variants). On the bank coral and kelp become rushes
  and barnacle rock and shells river stones; under swim water all of them are river stones (`FRESH_TWIN` / `FRESH_BED`).
- **Creatures:** no `SEA_ONLY` kind is sprinkled in fresh water; the list gains the merrow. The hand-placed sirens go. The ambient
  crabs of the living water stay out of fresh water; jellies start at the turn.
- **Life:** **trout** (new, ambient) leap out of fresh swim water now and then; the heron is the GREY HERON foe the river already had, now
  also on the first ferry rock and in the Linn and the Reach. (A perched scenery heron, the marsh's, was left out: next to the foe it
  would read as a heron you cannot hit.)
- The water's colour turns from river to sea over 230-430 (was 150-330), so the Bore Reach is where the salt comes in.

## Rules kept (and RULES S, 2026-09-25)
- C1: the Bore is signed at the Linn (~160), before the dock and before its roar carries (x0 - 200 px).
- Checkpoints spaced to RULES S4 (40..100 route tiles): 4, 95, 165, 238, 319, 370, 442, 518 (the Herald door). 63, the dock and the middle rock lose theirs; the one the filler put inside the Sluice Stair (the exam, S3) is gone, because the level asks the filler for B6's 100 (`L.checkRun`) instead of 72.
- F10: no foe kind leaves the level (the sea's kinds move downstream), so its new foes stand.
- Q: no new ambush. Every new jump was measured in the page for all six heroes (a real jump is ~3.2 tiles and 3 rows).
- Everything written after the old grow at 350 uses final columns; `bore`, `fresh`, `falls`, the air list and the REVIEW/AMBUSH
  tables are moved by hand (grow does not carry them).
- S5: no free heart in the level. S6: the level's rule is the tide, not a meter. S3: the Sluice Stair (438-503) is the exam and is left as it is.
- The Bore is counted in the INDEX now (`src/threat.js`: a tile in eight of its run, as a swim pool), so the ramp sees it.
