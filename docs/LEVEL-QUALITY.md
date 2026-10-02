# LEVEL QUALITY - the bar a new level must clear

Daniel called the Harvest Fair "a prototype - just walk right", and it had passed about twenty checks. Those checks ask whether a
promise was kept; none asked whether the level was any good. `tools/level-quality.mjs` reads a level's data (its grid, entities, gadgets and
the walked main route from `tools/pacing.mjs`) and measures it against THE MAGE'S FOLLY, Daniel's benchmark. No browser, a few seconds a level.

    node tools/level-quality.mjs               the gated levels (registered in tools/check.mjs as `level-quality`)
    node tools/level-quality.mjs <id> [<id>]   any level, in full
    node tools/level-quality.mjs --all         a table of every campaign level (a report, exit 0; about 80 s, run it rarely)

**Gated levels** are the new or reworked ones: `GATE` at the top of the tool (today `theatre`; the fair is re-gated when FAIRFIX2 ships). Add your level's id in the lane that builds
or reworks it. A gated id that is not built yet is skipped with a note. The old campaign is NOT gated: many of its levels miss the bar (see `--all`).

The process and the lessons behind these numbers are in `docs/NEW-LEVEL-CHECKLIST.md` (concept, Opus greybox, review against the Folly, fixes, Sonnet art and music, this gate).

## The fourteen measures (limit; the Folly's own number)

| measure | what it counts | limit | Folly |
|---|---|---|---|
| flat | share of the route columns lying in runs of 20+ columns where the floor stays within 2 rows and there is no gap, spike, foe (8 cols / 6 rows), gadget or arena. Also the same ignoring foes ("level ground") | empty runs <= 30%, level ground <= 60% | 11%, 33% |
| bands | distinct 4-row height bands the route uses; share of columns whose reachable footing spans more than one band | >= 5 bands, >= 40% of width | 8, 61% |
| mechanics | level-specific gadgets: known machine kinds (lever, winch, lock, rune, plate...), moving platforms (`moversExtra` kinds), the level's own machine arrays (gusts, hoists, crumbles, locks...), and any zero-threat kind used by <= 3 levels. A "place" is a cluster of columns 12 apart. Taught, developed, twisted = 3+ places | >= 5 kinds, >= 3 of them in 3+ places | 12 kinds, 4 developed |
| music | its own track, and its boss room's: each is a real track (a file in `audio/`, or a track `src/audio.js` composes itself by name) and BORROWED from nobody - no other campaign level, boss arena or mini plays it, and it is not a stock stand-in (`STOCK_MUSIC`: `marketday`). A boss room may play the level's own track or one of the generic boss pool (`BOSS_POOL`), never another boss's own. Exceptions: `SHARED_MUSIC` | own tracks | musUnder, boss4 |
| secrets | silvers and relics OFF the route (pacing's off-route loot) | >= 2 | 3 |
| checks | checkpoints, and route tiles per checkpoint (Daniel wants fewer). Not "2-4": a 700-column level cannot keep four and stay under the 200-tile rule | >= 2, >= 90 tiles each | 7, 103 |
| encounters | a DESIGNED encounter in every 200 columns: a squad-tagged or elite foe, an ambush room, the mini, or a hand-placed knot of three foes within ten columns | none missing | all four sections |
| density | DESIGNED ENCOUNTERS a screen (24 columns), not bodies: a squad (all its members), an elite, an ambush room, the mini, or a clump of other foes within 8 columns of each other each count once; and the share of screens with no foe | 0.8-2.5, <= 30% empty | 1.03, 23% |
| ranged | a RANGED foe is present among the foes and ambush waves. Roles are named in `ROLES` in the tool (the game has no role field): ranged = shoots, throws, lobs or casts (archer, crossbow, javelin, drunk, scout, rockgoblin, apprentice, priest...) | >= 1 | apprentice x7 |
| roles | distinct foe roles among melee (everything not listed), ranged, support (healer, horn, banner, snuffer), heavy (plate, a big told swing) and runner (thief, hound, bomb carrier) | >= 3 | melee, heavy, ranged |
| unlocks | every collectible kind (key, stray, quest, pickup, chest, or anything flagged `collect`) is either known (`COLLECT_KNOWN`) or declared on the level as `L.unlocks = [{ kind, opens, hud }]` (`opens` = what it opens, `hud` = the line the player sees; the tool checks the entry is complete and the kind is in the level, a reviewer reads the line in play); a key needs a lock gate; an interactive (lever, winch, rune, plate...) needs something in the level to open | no orphan kind | key + 4 rune kinds, all with locks |
| pilot | the LEVEL-1 NO-ABILITY pilot (below): a fresh knight with no talents or skills, walked along the main route with the play bot and no god mode, takes real blows. GATED LEVELS ONLY; read from `docs/level1-pilot.json`, never run live | >= 2 blows over 3 runs; a gated level with no row, or a stale one, fails | 3 (theatre 16) |
| route | the walked route drops/climbs 8+ rows or doubles back 8+ tiles, AND has 2+ dead-end pockets (branches) | both | 30 rows, 5 pockets |
| slopes | every slope collision cell (ids 20-25) needs drawn diagonal art. Baked sprites are checked against `heightAt`; the level must be one the tile painter reaches (the guard in `src/main.js` before `cvTile`, read by the tool) | no invisible slope | no slopes |

### The level-1 no-ability pilot, and why it is cached

`node tools/level1-pilot.mjs <id> [<id>] [--write] [--runs=3] [--steps=30000] [--hero=knight]` opens headless Chrome, starts a FRESH save (level 1, no
talents, no skills; the tool prints NOT BARE if it is not), loads the level with no god mode, and walks the level's main route (`tools/pacing.mjs`, a waypoint every
~8 columns) with the play bot's hands. The bot cannot work locks, winches or levers, so where it makes no progress in 4 s it is LIFTED to the next waypoint (counted and
printed: the Folly needs about 48 a run, the theatre 21); every stretch of the level is still met by the hero, and what the foes there do to him is counted. Three runs
are summed because one run is noisy (the Folly read 2, 1, 1, then 3 over its three). A damage count that is a floor, not a target: it proves the level is not a walk;
it does not say the level is fair. Deaths are reported, not required.

**Why a cache, not a live call.** `level-quality` is a no-browser check that runs in seconds inside the suite; the pilot needs Chrome and 30-60 s a level. The pilot
writes one row a level into `docs/level1-pilot.json`, stamped with a hash of the level's data (`levelHash`: size, grid, entities, movers, ambushes). The gate reads the
row: a gated level with no row, a stale row (the level changed after the pilot ran) or a row under the floor fails, and the message says which command to run. The build
lane runs the pilot once, at the end, and commits the file. A level that is not gated shows its row if it has one and is otherwise not asked.

### The mash gate (the fifteenth measure; REPORT-ONLY today)

`node tools/mash-bot.mjs <id>` runs a player who ONLY MASHES ATTACK (never blocks, dodges, jumps on purpose, or uses a mechanic or an opening) against the level's boss and
mini with the knight, warden and pyromancer, two seeds each, at the hero level the level expects (its depth on the gate chain, no skills bought); `--level <id>` holds right
and mashes through the main route (lifted where it is stuck, counted). Daniel's target is Hollow Knight / Salt and Sanctuary: a first attempt at a boss usually ends in death and
a level pushes you under half health. **THE TARGET RULE: the mash bot must LOSE to the level's boss with all three heroes, and in the level must die or drop under 40% health.**
The result is cached in `docs/mash-bot.json` (stamped with `levelHash`, like the pilot's cache; a boss-module edit does not stale it, so re-run after a boss change) and read by the
`mash` row for GATED levels; `node tools/mash-bot.mjs --assert <id>` is the same check for a boss check's own use. Since the combat pass (claude/combat3, 2026-10-01) it is ENFORCED per
part (boss, mini, level run) on every campaign level by `mashGate` (`tools/mash-gate.mjs` in the suite, and this row for gated levels): a new level is enforced from day one, and the
parts the mash bot still beats are listed in `MASH_REPORT_ONLY` in `tools/level-quality.mjs` for their boss waves. That list may only shrink. The audit of the whole campaign is `docs/BOSS-AUDIT.md`.

### Report-only measures

`REPORT_ONLY = { levelId: [measure] }` in the tool lets a measure print as WARN without failing one level, with a TODO naming who decides. Today: `theatre: ['roles']` (the
theatre has two roles, melee and ranged: no support, heavy or runner). Daniel decides whether to lift it by giving the theatre a third role or by accepting two. And `welltown: ['music']` (claude/welltown): THE WELL TOWN's greybox plays THE SUNKEN CARAVAN's track as a placeholder until Daniel picks its own file (its boss room already has its own synth hook); lift it when the track lands. And `redgorge: ['music']` (claude/redgorge): THE RED GORGE's greybox borrows the same placeholder; its boss room plays its own synth theme (`'gorgecrab'`).

Tall levels (floors, not a walk: Hanging Village, Spire, Deep, Falling Tower, Undercrown, Crown, Keep, Burial, Witchlight, the Red Gorge) skip flat and density, and on a tall level a mechanic's PLACE is a cluster of ROWS 12 apart, not of columns (claude/redgorge: a climb's machines stand one over another; the system arrays are still placed by column).

## Why the limits sit where they do

Each is set so the Folly clears it with room and the old 672-column Harvest Fair does not (flat 49%/87%, 2 bands, one gadget, no designed
encounter in three sections, 0.5 foes a screen, 24 slope cells with no art, a flat route). The density floor is 2.0, not the 2.5 of DESIGN B7: that
bar was written counting every non-pickup entity (runes and glyphs too); counting foes only the Folly reads 2.4.

**Density counts encounters, not bodies** (claude/fairfix, 2026-09-30). Counted in bodies, this bar and "fewer, better foes" (LEVEL-DESIGN-GUIDE section 2)
pulled against each other: the rebuilt fair had every foe in a designed encounter and failed density at 0.6 foes a screen, and the cheap way to pass
was padding. Now a squad of three is one encounter, a lone elite is one, a sprinkle's clump is one. The Folly reads 1.03 encounters a screen (32
encounters, 2.4 bodies); the campaign's walking levels read 0.68-1.56. The floor is 0.8. The ceiling was 2.0 until the Maskwright's Theatre merged (claude/fairfix2): built under the bodies bar (2.7 foes a screen, inside 2.0-4.5), it reads 2.13 encounters a screen because most of its foes stand alone (1.3 bodies an encounter, the Folly 2.3). The ceiling is 2.5. The empty-screen share is unchanged.

**Music is judged on what is borrowed** (claude/fairfix). The first version passed any level with a track name set whose file existed, so the fair passed
on `marketday` (a stock tune) and its boss room on the Houndmaster's own track. Now a stock stand-in fails, another level's or boss's track fails, and a
track the synth composes (the fair's `harvestfair` and `wickerqueen`) counts as real.

## What the new measures cannot see

`ranged` and `roles` read a table of foe kinds named by hand (`ROLES`): a kind that is not listed counts as melee, so a lane that builds a foe adds it there. `unlocks` knows what
it is told: it cannot tell that a declared `hud` line is actually shown or that a lever's target is the thing it is wired to (the reviewer plays it). `pilot` is a noisy bot.

## What it does not judge

It cannot see whether a level is fun. It catches the failures that are visible in data: flat, one-idea, empty, unmusical, invisible. A level can clear
it and still be dull; a level that misses it is not ready to be called done. The fair's music passes on its own band organ (`harvestfair`, the boss room
`wickerqueen`); on `marketday` it fails.
