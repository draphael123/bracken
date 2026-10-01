# Lane CHECKLIST (Sonnet): report

## What changed
- docs/NEW-LEVEL-CHECKLIST.md: the process (concept, Opus greybox, review against the Folly, fixes, Sonnet art and music, gate), a one-page concept template (example: docs/concepts/the-lit-church.md), every lesson as a tickable box (shape and pace, set pieces, signs, foes, collectibles, level-1 feel, music, playtest jump, boss, lane hygiene) and a reviewer's pass. Linked from docs/LEVEL-DESIGN-GUIDE.md and docs/LEVEL-QUALITY.md.
- docs/concepts/the-lit-church.md and the-lit-church-brief.md committed as they were (grepped: no local paths or personal data). Both cite tools/lit-church.mjs, not built yet: added one honest line to MISSING in tools/dangling-paths.mjs (delete when the church lane commits it).
- tools/level-quality.mjs: four new measures, `ranged`, `roles`, `unlocks`, `pilot`; REPORT_ONLY (per-level soft measures, printed WARN); `levelHash`.
- tools/level1-pilot.mjs (new) + docs/level1-pilot.json (the cache).
- docs/LEVEL-QUALITY.md updated (now fourteen measures; pilot, cache and report-only sections; what the new measures cannot see).

## The new measures
- ranged: >= 1 ranged foe. Roles are a hand table (ROLES in the tool; the game has no role field; unlisted = melee).
- roles: >= 3 of melee / ranged / support / heavy / runner.
- unlocks: each collectible kind (key, stray, quest, pickup, chest, anything flagged collect) is in COLLECT_KNOWN or declared on the level as L.unlocks = [{ kind, opens, hud }]; a key needs a lock gate; each interactive (lever, winch, rune, plate...) needs something to open. Proven to fail: an undeclared `candle` collectible on a copy of wood fails; declared passes.
- pilot: a fresh level-1 knight (no talents or skills; the tool prints NOT BARE otherwise), no god mode, walks the main route (pacing waypoints every ~8 columns) with the play-bot hands, 3 runs summed. Floor 2 blows. My first attempt used the stock playtest play pass: it reached 2% of the Folly and 37% of the theatre with 0 hits (it cannot work locks), so I wrote a waypoint walker that LIFTS the bot over what it cannot work (counted and printed).
- Why cached, not live: level-quality is a no-browser check of seconds; the pilot needs Chrome and 30-60 s a level. The pilot writes docs/level1-pilot.json with a hash of the level data; the gate reads it for GATED levels only and fails on a missing row, a stale row (level edited since) or a row under the floor, with the command to run. Build lanes run it once at the end and commit the file.

## Numbers
- Pilot, 3 runs summed: mage 3 blows (0 deaths, 142 lifts); theatre 16 (0 deaths, 63 lifts). Single Folly runs read 2, 1, 1: noisy, hence the sum and the low floor.
- MAGE'S FOLLY passes all 14 measures (pilot row cached; `ranged` 7 apprentices, roles 3: heavy, melee, ranged; unlocks: key plus rune/glyph/lockrune with locks).
- Theatre (the gate): passes everything except `roles` (2 roles: melee 38, ranged 3 drunks). Kept the measure; marked REPORT-ONLY for the theatre with a TODO. Gate green.
- --all (new columns rng = ranged foes, roles, unlk, pilot): 4 of 34 clear the whole bar (crown, keep, mage, burning; theatre clears with its WARN). Ranged: only `fair` has 0 (also fair fails roles, 1). Roles under 3: marsh 2, flotilla 2, undercrown 2, burial 2, caravan 2, fair 1, theatre 2. Unlocks: every level OK (all collectible kinds known, all interactives have a target). Full table in the commit's `node tools/level-quality.mjs --all`.
- The fair is not gated (FAIRFIX2).

## Checks (named, run in this worktree after the last edit)
level-quality, dangling-paths, comments, architecture, homepaths: all green. (No game code touched; the pilot tool is not in the suite.)

## UNVERIFIED
- The `unlocks` measure is declarative: it cannot tell a HUD line is actually shown or that a lever is wired to the thing it should open.
- `ROLES` kinds were classified from foe names and a read of a few AIs (sapper, javelin, spitcap, scout); not every AI was read.
- The pilot is a noisy bot; floor 2 over 3 runs is a smoke test, not a balance number. Only knight was piloted.
- Checkpoint rule wording: I wrote "at most about one per 200 route tiles" as given, and also the measured floor (90 tiles each) and the 175-tile walked-gap rule.

## QUESTIONS FOR DANIEL (recommendation first; the conservative option is built)
1. Theatre `roles`: it has melee and ranged only. Rec: give it one support or runner foe (a stagehand that cues, or a thief-like prop runner) in the next theatre pass and delete the REPORT_ONLY line; built: report-only.
2. Checkpoint rule: "max 1 per ~200 route tiles" reads two ways (a ceiling on count, or a spacing floor). Rec: keep the measured floor 90 tiles each plus no walked gap over 175; built as that.
3. Pilot floor 2 blows (3 runs). Rec: keep it low until a smarter pilot exists (one that can work levers), then raise to ~10. Alternative: a per-level scripted pilot like theatre-pilot for each gated level.
4. Should the church concept's "LEVEL-1 NO-ABILITY pilot" use the pilot above, or a human playtest? Rec: both; this one gates, you decide.
