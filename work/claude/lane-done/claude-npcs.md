# Lane report: claude/npcs (removing every decorative NPC and quest-giver outside the shops)

Branch `claude/npcs`, started from `origin/master` at 119d8ae (no merge needed - the brief said to skip that step
since the lane started from it already). Everything is pushed. I did not touch master, did not deploy, and did
not run the full suite (`npm run check` with no arguments).

Commits: 9d8f728 (the removal itself), 6670963 (a follow-up pass rewording in-level signs and comments that still
named the removed cast).

## What changed

Daniel's decision (2026-09-26, "they don't add much"): remove every decorative talker and every quest-giver NPC
in the levels, keep only the NPCs that are a mechanic without dialogue, and move each former quest's relic reward
into the level as a direct pickup.

**Removed, everywhere:**
- **Tam**, the wandering squire (`kind: 'squire'`) - the trailhead greeter at the start of every level, his own
  cage-and-kit side-quest in the Stockade, and his three lines on the map screen. `TAM_LINES`, `TAM_QUEST` and
  `TAM_MAP` (three tables in `src/main.js`, ~50 lines) are gone, along with every place they were drawn or read.
- The woodsman (Bracken Wood), the elder (Sporewood, Underleaf), the shepherd (The Scree Path, The Hexed Fields),
  the cook (Kingswood), the lamplighter (The Hanging Village, The Lamplit Street), the foreman (Quarry Pass -
  a benched/unused level, see below), the apprentice (The Mage's Folly), and the "company" NPCs that stood in the
  three shop rooms for flavor only: the bard, the old knight, the barkeep, a second decorative shepherd and a
  second decorative ferryman (in The Chandler, distinct from the marsh ferryman mechanic).
- Four purely decorative ghost/pilgrim NPCs with their own inline dialogue: two "pilgrims" in The Drowned Causeway
  (one of them also using `kind: 'ferryman'` for its sprite only - not the marsh mechanic), the farmhand and the
  three Hollis ghosts in The Hexed Fields.
- 50 `ent('npc', ...)` placements removed from `src/level.js` in total (54 before, 4 after); 0 remain outside the
  shop keeper and the marsh ferryman.

**Kept, as mechanics without dialogue:**
- The **marsh ferryman** (Marsh Wood): still poles you across for a toll or lets the sluice drain the channel.
  Removed from the talk system entirely (`talkers()` in `src/main.js` now excludes `kind === 'ferryman'`
  unconditionally, same as it already excluded the shop keeper) so pressing the talk key near him no longer opens
  a dialogue box; the pay/drain interaction itself (a separate code path keyed on the talk press, not on the
  dialogue system) is untouched and still works.
- The **shop keeper** in the three store rooms - unchanged.
- The **Burning Village captives** already had no dialogue (they are their own entity type, `t: 'captive'`, never
  `t: 'npc'`); confirmed, not changed.

**Relics: moved from a 3-item scavenger hunt turned in to an NPC, to a direct pickup.** For every former quest
whose reward was a named relic, I removed the NPC, removed two of the three scattered "stray" collectibles, and
turned the third into an `ent('relic', ...)` at the same spot (already an off-the-route, hidden position, since
that is what a quest stray always was) - `soles`, `sunshard`, `shoes`, `banner`, `gauntlet`, `windcloak`
(×2 - Gale Moor and The Mage's Folly already used the same relic id before my change), `tidecharm`, `diverlamp`,
`blackflag`, `stormline`, `wick`, `spurs`, `fleece`, and `lamp` (×2 - The Hexed Fields; Quarry Pass is benched).
Verified reachable: `tools/collectables.mjs` (green - "every pickup can be picked up from some ground") and the
new `tools/npc-removal.mjs`.

**Former quests with no relic reward** (only a full-heal "thanks" message, no item ever entered the player's
inventory): Bracken Wood (honey pots), Marsh Wood (eel traps - the ferryman's own), the Stockade (Tam's kit,
3 coffers - his cage is gone too), Sporewood (clean caps), Kingswood (gold cups), The Hanging Village (lamps),
The Drowned Causeway (the pilgrims). These lost their NPC, their quest field, and all three scattered
collectibles - there is nothing left to turn them in to, so nothing is left to collect. See Question 1.

**Screaming Scree Path exception:** used the game's *implicit* quest fallback (`strays: 3` with no `L.quest`
object, defaulting to `fleece`), not an explicit `npc` field, but was still driven by the shepherd + Tam. Treated
the same as a relic quest: shepherd, her dog (a pure quest-support prop, "walks with you and barks when a ewe is
near" - removed with her, since it had no other purpose) and Tam removed; kept the last of the three "ewe" strays
as a direct `fleece` relic pickup.

**Benched/unused code, touched anyway for consistency:** `theHunt`, `quarryPass`, `theFrostfell` and `theSkyShip`
(functions in `src/level.js`) are defined but not referenced by anything in `LEVELS` - they build no live level
today (confirmed by running every `LEVELS[].build()` and diffing against a text search of the whole `src/` tree).
I removed their NPCs and converted their relic quests the same way as every live level, so if one of them is ever
un-benched it is already consistent with the new rule. `tools/npc-removal.mjs`'s static source-text scan checks
these too (it reads `src/level.js` as text, not just what `LEVELS` builds), so this is enforced going forward.

**In-level signs and section comments** that spoke directly to a removed quest or NPC were reworded (a separate
pass, commit 6670963, found by rereading every touched level rather than by a check - none of the checks read
sign text against a removed quest): Stockade's "TAM WENT AHEAD TO COUNT GOBLINS...", the Scree Path's "THE
SHEPHERD PAYS IN FLEECE", the Reef's "BRING BACK HER THREE MANIFEST PAGES", the Hurricane's "BRING THEM BACK FOR
HER LIGHTS", Gale Moor's "THREE LOST KITES... RIDE UP TO THEM" (now one), and a few section-header comments
naming a squire, shepherd, bard or old knight that no longer stands there.

## Numbers

| | before | after |
|---|---|---|
| `ent('npc', ...)` placements in `src/level.js` | 54 | 4 (the marsh ferryman + one shop keeper each in the three store rooms) |
| distinct npc `kind`s outside the shops | 17 (squire, woodsman, elder, shepherd, cook, lamplighter, foreman, apprentice, bard, oldknight, barkeep, hillfolk, ghostfarmer, ghostwife, ghostchild, ferryman-decorative, ferryman-mechanic) | 1 (`ferryman`, no dialogue) |
| lines of Tam-specific tables/dialogue in `src/main.js` (`TAM_LINES`, `TAM_QUEST`, `TAM_MAP`, the old `NPC_LINES`) | ~85 | 0 (`NPC_LINES` is now `pr => pr.lines \|\| ['...']`, 1 line) |
| relic pickups placed directly in a level (no NPC turn-in) that did not exist before | 0 | 14 |
| `src/level.js` diff | - | +336 / -336 lines touched across two commits (net near-zero: removed content, added relics, reworded text) |
| `src/main.js` diff | - | -93 lines net |

## Checks run and their result

- **`npc-removal`** (new, wired into `tools/check.mjs`'s list): green. Proved it fails on unmodified
  `origin/master` first (115 failures) before trusting it green on this branch, per the rules.
- Every tool I edited: **`tools/content-audit.mjs`** (its per-level report treated "no quest" as a gap; rewrote it
  - no quest is the new normal outside the shops, and along the way fixed a pre-existing false positive where the
  Burning Village's captive-rescue count was compared against a stray count it never had) - green/clean.
  **`tools/hanging-hoist-walk.mjs`** (the mill-hoist walk-test asserted "stepped onto the ledge and took the
  lamp"; the lamp is gone, so it now asserts the ledge itself is reached) - ran it for real (knight, live CDP
  walk): every step green, including the unrelated nest/crown hoists and the pre-existing `spurs` relic, so
  nothing else in that machine broke.
- `syntax`, `comments`, `dangling-paths`, `signs`, `pixels` (`node tools/headless.mjs floats`), `architecture`,
  `occluders`, `levelling` (+ `levelling-runtime`), `progression` (+ `progression-runtime`), the store/shop checks
  (`shop-gates`, `shop-theme`, `store-preview`), the map check (`map-grammar`), `checkpoint-gaps`, `textfit`: all
  green, run as a named subset (`npm run check -- <names>`), never the full suite.
- Extra, not on the required list but directly relevant so I ran them anyway: **`tools/collectables.mjs`** (green
  - every relic I placed is reachable) and **`tools/musthave.mjs`** (3 pre-existing failures, unrelated to this
  change and unchanged from master - `wood`'s and `moor`'s arenas and `fallingtower`'s arena all needed a
  creature to bounce off before my change too; my change actually *removed* 4 other failures that existed on
  master, where a kite or a lamp stray sat somewhere nothing could reach without a wasp to pogo off - those
  strays are gone now, so the failures are gone with them).
- **Save checks:** no dedicated tool exists in `tools/` for this (grepped for one; none). Verified by reading the
  code instead: `questOf()` falls back to a harmless default (`{item:'none'}`) when a level has no `L.quest`,
  which is now true almost everywhere; a level-select card reading a stale `PROG[id].quest === true` or
  `PROG[id].relic` from an old save still renders exactly as it did before (the "DONE" badge, the relic icon) -
  neither ever required the level to still define a quest. Nothing reads `L.quest.npc` or an NPC kind from a
  save. I did not add an automated test for this since none of the existing tools cover save-migration scenarios
  by hand-building a fixture; see Question 3 below.

## UNVERIFIED

- **`tools/hanging-hoist-walk.mjs`** ran for the `knight` only (not the default `knight,warden` pair) to keep the
  one CDP/browser run I did short, per the cost rules. The assertion I rewrote is hero-agnostic (it checks
  position, not stats), so I'm confident, but the `warden` pass was not literally run.
- I did not play the game by hand in a browser. Everything above is checked by the suite's own tools (geometry,
  static text scan, and one live walked test), not by a human pressing keys.
- Several relic pickups (`marsh`'s `charm`, `moor`'s `windcloak`) show as "ASSISTED" in `tools/collectables.mjs`'s
  route notes, meaning the reach-fill model needs a ride/pogo/fly to get there rather than a plain walk - this is
  pre-existing behavior for those two specific relics (unrelated to anything I moved) and the tool treats it as a
  note, not a failure.

## QUESTIONS FOR DANIEL

1. **Former quests with only a "thanks" (heal) reward, no relic, got nothing to replace them** (Bracken Wood's
   honey pots, the Marsh Ferryman's eel traps, the Stockade's coffers/Tam's kit, Sporewood's clean caps,
   Kingswood's gold cups, The Hanging Village's lamps, The Drowned Causeway's pilgrims). The brief said relic
   rewards move into the level as pickups; these never had a relic to move. **My recommendation:** leave them
   removed with nothing in their place, which is what I did - a full heal tied to an NPC conversation is exactly
   the kind of "doesn't add much" content the decision is about, and there is no relic id sitting unused in the
   `RELICS` table to give them instead. If you'd rather one or two of these become a coin cache or a stash prop
   (matching RULES R's "every dead end pays"), tell me which ones and I'll place them the same way as the relic
   pickups.
2. **Two relic ids are now given out by two different levels each** (`soles`: Underleaf and The Undercrown;
   `windcloak`: Gale Moor and The Mage's Folly; `lamp`: The Hexed Fields and the benched Quarry Pass; `fleece`:
   The Scree Path and the benched The Hunt). This was **already true before my change** for `soles` and
   `windcloak` (the original quest data already specified the same relic twice) - I did not introduce it. No
   recommendation needed unless you want it changed, in which case it's a pre-existing design question, not one
   this lane created.
3. **No automated save-migration test exists** in the suite for "an old save with a stale `PROG[id].quest` or a
   quest-item flag from a level that no longer has a quest." I verified this by reading the code paths instead of
   running one. If you want a standing check for this (the brief's own wording: "a save part-way through a quest
   must not break"), it would need a fixture save file and a small tool, which I did not build since none of the
   existing tools cover save fixtures and it wasn't in the list of checks to get green. Recommend adding one if
   this class of regression matters going forward - I can build it in a follow-up if wanted.
4. **The level-select and results-screen "quest" badge** (`text(p.quest ? 'DONE' : 'OPEN', ...)`) still exists and
   is still meaningful for the two levels that keep their own NPC-less quest (The Burial Caverns' candles, The
   Burning Village's rescue count) but will simply always read "OPEN" for every other level from now on, since no
   other level defines `L.quest` any more. I left it as-is (it isn't broken, just quieter) rather than redesign
   that screen, since the brief said "don't redesign levels." **My recommendation:** leave it; it costs nothing
   and still works for the two levels that use it.
