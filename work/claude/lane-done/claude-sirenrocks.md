SIRENROCKS DONE 11-06 13:10 READY (code-only greybox: hidden row + SR_SHIPS off; browser walk, boss tune, art, music owed)

# claude/sirenrocks - SIREN ROCKS "THE SONG PULLS YOU." + THE NAGA GUARD + THE NAGA QUEEN (OPUS greybox, code-only, 11-06)

Branch `claude/sirenrocks` off `claude/waterkit` e08836df8. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-sirenrocks`. Pushed. NOT merged, NOT deployed.
Sources: scratch/plan-water-1105.md item 4 + s2/s3/s4 (the water arc pulled forward 11-06), scratch/brief-sirenrocks-1024.md (Daniel 10-24; the plan won where they differ).
No browser opened (release gate running). Code tip: cd75e58aa (the report commit after it changes no code).

## FLAG / URL
- A NEW level: `LEVELS.push({ id: 'sirenrocks', ..., hidden: true, needs: 'reef' })` APPENDED after arena_yard (saves count by index). Hidden = no map node, not on the road, not on the demo list. Dev only: `?level=sirenrocks`.
- `src/siren-rocks.js` `SR_SHIPS = false` is the road switch. **Flag off = live unchanged**: the row is hidden, nothing needs it, every main.js hunk is behind `SRH.on()` (= `L.sirenRocks`) or the new ent types, so no other level runs a line of it (tools/siren-rocks.mjs proves the hands are inert on the Reef).
- Road insert (plan Q1 rec: REEF -> SIREN ROCKS -> FLOTILLA): src/route-insert.js is on claude/greatdune, NOT on this base, so no migration written. The row to add there when it lands: `{ id: 'sirenrocks', after: 'reef', before: 'flotilla', live: SR_SHIPS }` (+ a COAST_NODES map node at flip time).

## What was built
| file | what |
|---|---|
| `src/siren-rocks.js` (new) | SR_SHIPS, the level (410 x 40, data only), signs, SONG/COVE/SPOUT numbers, `lintSirenRocks` |
| `src/naga-guard.js` (new, pure) | THE NAGA GUARD - the one new foe: serpent-tailed spear, ANCHORED (the song never moves it: it coils to the rock). THE SPEAR (! 0.55 s, a guard turns it -> it reels x1.5), THE LUNGE (!! 0.8 s coil, low spring along the rock, jump it -> SPENT x1.5). hp 56 (placeholder) |
| `src/naga-queen.js` (new, pure) | THE NAGA QUEEN brain: phases, told moves, `takeAt`/`takeK` (floor 0.4), `stoneStruck`, `nqPlan` (bot reading for a later lab hook). hp 3600 PLACEHOLDER |
| `src/siren-rocks-hands.js` (new) | the world binding + the level's own WATER KIT wiring (tide kit + pull field), stones (break / silent / told regrow), blowholes, pumice rafts, the tide bell, guard + Queen spawn/step/take, GREYBOX drawing, A3 gauge |
| `src/main.js` | **15 hunks = 19 new lines, no existing line edited** (import; EHP literal line; clear; spawn cases; wardedDamage take; bossEnd case; updateEnemies dispatch; strike+update; mover; drawBack; mover draw; foe draw; drawOver; bar-name ternary line; hands construction + `window.BK_SIREN`). Anchors chosen to sit at least one line away from water1/deep3/keepfloods hunks |
| `src/level.js` | import + the appended hidden row (water1 also appends a row at the end: the integ keeps both, any order - neither is live) |
| `src/threat.js` | one line: nagaguard 2.5, nagaqueen 6, singstone/blowhole/tidebell 0 |
| `src/marks.js` | one appended loop line: MARK/ANSWER/HEIGHT for the guard's 2 tells and the Queen's 6 |
| `src/boss-greed.js` | 2 lines: OPEN_RULE nagaqueen (e.open > 0, so greed/mash reprisal counts) + FULL_DAMAGE nagaqueen (her own numbers, never the x0.05 chip) |
| `tools/level-quality.mjs` | one line: `SYSTEM_ARRAYS.push('srCurrents'); GATE.push('sirenrocks'); REPORT_ONLY.sirenrocks = ['music','pilot','mash']` |
| `tools/siren-rocks.mjs` (new) | **781 ok** (~3 s), Node only |
| `tools/check.mjs` | own line (not run) |

### The level - "THE SONG PULLS YOU. JUMP WHILE A STONE SINGS AND IT CARRIES YOU OVER. STRIKE IT AND IT FALLS SILENT."
- **SINGING STONE** = the pull field, kind `toward`, in the air too (strength 200, ease curve, eye a row over the stone): SILENT 2.2 s (release window) -> HUM 1.5 s (tell, 15% nudge, glow) -> SONG 2.6 s. Gaps of 8-11 tiles: no hero jumps them silent; a jump from ~0.2 s into the song carries every hero over (tools/siren-rocks.mjs flies all 9 heroes on hero-move.js numbers). A song ending over the surf drops you in it: the surf drifts you back to KELP on the rock you left (every gap, every stack) - the cost is the climb back.
- **STRIKE A STONE** -> SILENT for 8 s (9 s in the arena), told before it sings again (hum swells 1.5 s). Not a mark: a death brings every stone back (no soft-lock).
- **THE SONG TAKES THEM TOO**: foes in a song are carried at 0.6 (the brute on the lip at 149 goes into the surf). The naga never (anchored).
- **TIDE KIT** (kept under `L.srTides`): THE WRECK COVE (low 5 / warn 2.5 / rise 2.5 / high 6 / turn 2 / fall 2.5; pumice rafts float on it; THE TIDE BELL on the wreck's stern calls it in; the wreck's hold floods at high) + THE SPIRE (manual chamber the Queen floods in P2).
- **BLOWHOLES** x3: quiet 2.6 -> BOOM 1.2 (tell, spray) -> SPOUT 0.7 (vy -560: throws you up a chimney/onto a ledge).

| cols | area | what |
|---|---|---|
| 0-99 | THE SINGING SHORE (teach) | st1 over 10 tiles (nothing else), a siren on a stack, st2 down a step; SECRET 1: dive under rock D (silver in a sea pocket); THE CALLER'S SPEARS squad |
| 100-189 | THE HUSH (test) | THE SHAFT: st3's song carries a jump to the roof pocket; drop in its silence or break it -> plain fall to THE GROTTO; the NAGA GUARD taught alone; BLOWHOLE bh1 the only way up; st4 takes THE BRUTE off the lip; THE HEADLAND climbs in 2-row steps to its crown (row 20): SHRINE ONE (180,19); bh2 to a pocket ledge |
| 190-289 | THE WRECK COVE (remix) | ca + cb: two songs in a chain over the cove via a 4-wide stack (offset 3.1 s); THE WRECK (deck 27, hatch to a flooding hold with a naga, mast + crow's nest = SECRET 2); pumice rafts on the tide (ring the bell); THE HOLDING STONE: sings you BACK along the urchin bridge (two holes, a naga anchored mid-bridge) - no hero crosses by timing, broken every hero crosses in its silence |
| 290-351 | THE CHOIR (exam) | c1-c4 over open surf on a 2.1 s rhythm (stacks K1 4-wide, K2 with a naga on it, K3), a siren's rock under the last gap; bh3 on the landing = SECRET 3; SHRINE TWO = the boss door (346,27) |
| 352-409 | THE COILED SPIRE | arena floor row 30 (352-397), two shelves (top 27) each with a singing stone (A1 355, A2 394); gate 404 |

Checkpoints: START + 2 (fewer, Daniel). Foes: siren, merrow spearfisher/caller/brute, crab, petrel, NAGA GUARD (new) - no goblins; timber only as the wreck. Palette: violet dusk greybox (reef set, tinted).

### THE NAGA QUEEN (numbers PLACEHOLDER, hp 3600)
- P1 ON THE ROCK: HER SONG (!! 1.1 s: she rears, the arena's stones glow with her -> 2.6 s pull to her coils at 70 px/s, walkable against, braced at half; coils bite once a song) - **OPENING: strike a stone while she sings -> THE SONG BREAKS, OPEN x1.0 for 2.8 s**; THE TAIL SWEEP (!! 0.85 s, low, r 84 - jump); THE VENOM ARC (! 0.7 s lobbed glob, guard it, leaves venom on the rock 2 s - step out).
- P2 (<50%): THE TIDE COMES IN (told: toll + word, 1.8 s; the spire chamber floods the floor 2 rows, shelves dry) and she sinks. NEW MOVE: THE DROWNING SONG (!! 1.3 s bubbles -> 3.2 s, 70 px/s + 30 more for swimmers). She surfaces to spit (! 0.8 s). **OPENING: both stones silent at once -> DRAGGED UP onto the rock, OPEN x1.25 for 3.4 s, the tide drains**; then ward and the tide comes back.
- Resist: scales x0.6, under the tide x0.4 (a swimmer reaches her), ward x0.4 for 1.6 s after each opening, never under 0.4 (checked for every mode/ward/phase). Gold ring + timer when open, grey ring warded, tell word over her head. Every tell has a marks.js row.

## Checks (Node only, one at a time, >= 1500 MB free; no browser, no tools/check.mjs, no mark-integrity / untold-told / floaters)
- `node tools/siren-rocks.mjs` **781 ok**: row appended/hidden/needs reef/no map node/SR_SHIPS off; lintSirenRocks + lintPulls + lintTide clean; all 10 song crossings x 9 heroes NOT jumpable silent and crossed in the song (windows 2.1-3.1 s, table below); the shaft (plain fall when broken); the holding song x 9 heroes; 3 blowholes clear their ledges; reach (fill with rides) START -> both shrines -> arena -> gate + 3 silvers; guard told-before-every-blow, anchored, low lunge; Queen 0.4 floor, marks rows, P2 move, toy flow n=6 (all won, avg 192 s, ~12 reels / 14 drags - a perfect-read bot, NOT the rate); the HANDS run a minute per area + the fight in a stub world (no throw), inert on the Reef.
- `node tools/level-quality.mjs sirenrocks`: **CLEARS THE BAR** (bands 5, multi-height 54%, mechanics 6 kinds / 4 in 3+ places, secrets 3, checks 1 per 184, density 1.07, roles 4, encounters, ruleFight 13/15, route 6 pockets; REPORT-ONLY music/pilot/mash). Full gated run: every gated level clears, exit 0.
- ok: one-new-foe (nagaguard counted; sirenrocks forks off the reef with the flotilla), threat-holes, answer-tags (4 answers), goblin-lint, checkpoint-stand (real 5-col jump), boss-checkpoint, floating-geometry, anchor-lint, solid-islands, foe-footing, checkpoints, checkpoint-gaps, foe-glue, comments, dangling-paths, tide-kit 2019 ok, pull-field 76 ok, `node --check` on every touched file. New filenames (siren-rocks, siren-rocks-hands, naga-guard, naga-queen) clean of ad/admiral/track/analytics/banner/pixel/promo.

Song windows (knight / paladin; '#' = a jump at that moment crosses, tau -1.0 .. +2.6 s from the song's start):
st1 2.2/2.2, st2 2.2/2.1, st3 3.1/3.0, st4 2.7/2.4, ca 2.6/2.5, cb 2.5/2.4, c1 2.4/2.3, c2 2.8/2.6, c3 2.6/2.4, c4 2.6/2.4.

## Owed
**Browser (one at a time, memguard, >= 1500 MB), all `?level=sirenrocks`:** first load + walk (main.js wiring is unproven in a page: the pull on P and foes, the stone strike box, the blowhole vy kick, pumice movers + riders, pool lines moving, the gauge); feel the song (strength 200 may be too much on the ground: it yanks a runner off a lip - Q4); real-key per-hero routes; reach-heroes, lethal-water, breath (the dive pocket ~3.7 s round trip), level1-pilot --write, mash-bot --write, mark-integrity, untold-told, textfit (sign/tell words), hint lines; a bossLab hook for `nagaqueen` (nqPlan exists, lab.js branch NOT written) then boss-rates n=6 WITH (swim) flasks toward 60-70%; the READ-ONLY reviewer vs Mage's Folly (plan rule for every opus greybox); the QUICK gate on the branch.
**Art (art before live):** the level's own kit (violet-dusk sea caves, wet black rock, pearl veins, kelp ropes, the coiled spire landmark on the horizon), singing stone (glow/hum/song/shattered/regrow), song streaks (today 1-px flow specks), blowhole + spout, pumice rafts, the tide bell, the wreck (tarred hull, mast, crow's nest), the A3 gauge dial (shared), NAGA GUARD sheet (slither, spear windup/thrust, coil/lunge, spent, hurt, die, card), NAGA QUEEN sheet (coils, rear, song, tail windup/sweep, venom windup/spit, reel, under-water shape, drown song, dragged, death) + her fall; music (borrows 'reef' + boss pool 'boss2').
**Merge:** when claude/water1 (the generic kit wiring, pirate-fleet-hands.js) and this both merge, fold to one wiring (see Q2). The appended LEVELS row conflicts only textually with water1's appended row.

## Questions for Daniel (recommended answer first; each built as the rec)
1. **Slot**: main road REEF -> SIREN ROCKS -> FLOTILLA (plan Q1 rec). REC yes (built as `needs: 'reef'`; the Flotilla re-gates through the route-insert row above at flip). Alt: optional spur off the Reef.
2. **One kit wiring or two**: this level keeps its tides/pulls on `L.srTides` / `L.srPulls` so water1's generic wiring (any level with L.tides/L.pulls) can never step it twice. REC: after both merge, a small integ step renames them to L.tides/L.pulls and drops this hands' own kit stepping. Alt: leave them separate (works, two copies of the stepping code).
3. **THE HUSH teach is a choice, not a forced break** (the shaft: wait for its 1.6 s silence or break it); the forced breaks are THE HOLDING STONE (urchin bridge) and both boss openings. A constant stone over a vertical shaft cannot hold a falling body without trapping it in the air. REC keep. Alt: a forced break in the test too (a short holding stone on the headland).
4. **Song windows are generous** (any jump from ~0.2 s in, 2.1-3.1 s of a 2.6 s song) and strength 200 yanks a runner on the ground. REC tune after the first walk (the tune lane: on 1.8-2.2 s, strength 170-200). Alt: shorten the song to 1.8 s now.
5. **Broken stones are not marks** (every stone sings again after its silence and after any death). REC keep (no soft-lock; Salt & Sanctuary's cost is the climb back from the surf). Alt: a broken stone stays broken until a death.
6. **Queen P2 opening = BOTH stones silent at once** (9 s each in the arena; solo you break one and cross ~39 tiles, ~6.8 s). REC keep for the greybox, tune measures it. Alt: one stone per drowning song (easier), or a third stone mid-arena.
7. **Numbers are placeholders** (Queen hp 3600, P2 at 50%; guard hp 56, spear 16, lunge 18). REC the tune lane sets them by boss-rates WITH flasks (60-70%, mash 0/6, 90-150 s - the toy bot's 192 s says she is long at 3600). Alt: start at 3000.
8. **Music**: borrows the Reef's track and the boss pool's boss2 (REPORT-ONLY in level-quality). REC the art lane brings two CC0/CC-BY candidates (a siren choir for the level, a song-led boss theme). Alt: keep the Reef's.
