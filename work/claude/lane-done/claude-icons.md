# Lane report: icons (claude/icons)

Source: `docs/ability-audit.md` (196 skills, 23 ranked changes). This lane did the icon and description items and nothing else. No behaviour or balance changed.

## What changed
- **One passive icon table**: new `src/skill-glyphs.js`, `PASSIVE_GLYPH[hero][id]`, 144 rows (keyed by hero because the id `sunder` is five different skills). `TAL_KIND`/`talIcon`/`talCat` in `src/main.js` read it first. The Geomancer's ten passives now wear ten different glyphs (seven new ones drawn in her stone/moss/amber: pillar, slab, fall, stones, shards, rune, wave). RUMBLE no longer a coin, SECOND BARREL no longer a skull, CUTTHROAT/TURNCOAT no longer both the grapnel, LONG REACH and THE SECOND VOLLEY on the sword glyph. The cross-hero regexes (`rum`, `second`, `hook`) are removed; the regex fallback now only serves growth nodes and old tree ids.
- **Eight borrowed active icons drawn**: SKEWER, SET THE SPEARS, HARRIER, BLOOD BOIL, GRAVECALL, BROADSIDE, THE BLACK SPOT, KEELHAUL in `MORE_ICONS`; `SKILL_KIN` deleted. All 52 actives now have distinct pixels.
- **Descriptions fixed to the code**: HOLY CHARGE ("lower the maul and charge"), CONSECRATE (holy tick, the dead burn), DEEP POCKETS and NO QUARTER ("PLUNDER bar"; DEEP POCKETS now says everything that fills the bar, because `gainPlunder` scales every gain), Geomancer BULWARK (adds the STONE WALL half). Hero cards: Freebooter (tap C parry, hold C hook, rum is a bought skill), Death Knight (F summon, G equipped skill, hold F blood surge), Knight (RESOLVE from blocks and heavy cuts, not third cuts).
- **STOKE audit item was wrong**: the code refunds 17 wind and calls `gainHeat(6)`, so its text is true; left alone and noted in the audit.
- `docs/ability-audit.md`: new section 0 (status, what was fixed, the question) and FIXED marks on items 1, 2, 3, 4, 17 (icons half), 18, 19, 20, 21.
- `BKT` in main.js gained lazy `skillIcon`, `talIcon`, `TAL_KIND` (lazy because BKT is built before those consts).

## New check: `tools/skill-icons.mjs` (in `tools/check.mjs`, after skill-passives)
Asserts: 52 actives, none on the default flame, no two share pixels; 144 passives each have a table row and the game agrees with the table, no stale rows; Geomancer's ten are distinct and none is a sword; the five `sunder`s do not all match; the pirate's C is driven in the game (tap parries, hold hooks) and the hero card must say so; the Knight, Death Knight, HOLY CHARGE, CONSECRATE, DEEP POCKETS/NO QUARTER and Geomancer BULWARK text must not contain the old wrong claims.
**Proved on the old code**: on a worktree of 5d25df0 (plus only the check, the table file and the BKT hook) it fails at "actives that share an icon" (lightLance/skewer, grapeshot/broadside/blackSpot, and more). The description regexes were also run against the old text: every old wrong phrase matched (hold C RUM, third cuts fill RESOLVE, TAP F for the equipped skill, shield-first, holy fire, purse).

## Checks (all green on 76f8038; master is still 5d25df0)
skill-icons, settings-tabs, skins, dangling-paths, skill-menu, skill-passives, progression, progression-runtime, architecture, ability-poses (52 of 52, debt 0), hint-shown, homepaths, comments. (dangling-paths failed once before the new files were committed, since it reads `git ls-files`; green after.)

## UNVERIFIED
- The art is judged from one contact sheet of the eight new active icons and ten Geomancer glyphs (readable at 5x; SKEWER is the weakest). No in-game before/after screen capture: the skill list screens do not draw the icons, and I did not open the store/loadout icon views.
- I did not run the full suite (rules), or the level/boss checks (no level or boss changed).
- Item 17's id renames (`scytheThrown`, `harvestMoon`) are not done (they need a save migration); only the icons changed.

## QUESTIONS FOR DANIEL
1. **Nothing to buy after level 8 (pyro, paladin, freebooter, death knight; audit item 5).** Not built. Recommendation: yes, add two capstone actives each at about levels 14 and 20 (360 to 520 coins), each tied to the hero's bar, as its own designed lane with art and poses (the pose ratchet and skill-icons will catch a missing one). Cheaper option needing no art: let two existing passives per hero become buyable actives.
2. Passives share glyphs inside a hero (about 20 glyphs for 144 skills; a glyph says what the skill does). Only the Geomancer's ten are fully distinct. Do you want every passive to have a truly unique picture? Recommendation: no, it is roughly 100 more drawings for little gain; the current rule (verb glyphs, explicit row per skill) is what the check enforces.
3. `PYRO_ICONS.kindle` is drawn but never shown (passives use `talIcon`). Recommendation: delete it in the next Pyromancer pass; left in place here.
