# ACT II TRANSITIONS - LANE C (claude/act2tr, on top of lane B 0800e77e) - 11-04
Status: CODE-ONLY, node checks green, NO browser run (release gate running: scratch/GATE-RUNNING.flag). Not merged, not deployed. Tip = `git log -1 claude/act2tr`. ACT2_BUILT = ['A','B','C'].

## The 3 big scenes (src/transitions.js TABLE; TODO-LANE-C placeholders gone)
All: thin letterbox bars (entry.bar 12), ONE caption line drawn by main.js (entry.caption {text, at}), skippable after 0.8 s, dialogue-free, ARRIVE into the next level (no endOnMap), 1-4 seats, reduce-motion handled.
| row | scene | length | what | caption |
|---|---|---|---|---|
| 8 minecart>storm | `daylight` (S1) | walk 1.6 + 5.6 + fade | gate-end walk, then the party climbs onto the last cart in the tunnel (timbers + torch flecks), the mouth ahead grows to a coin of light, the cart rolls OUT into dawn: gorge, Stormhold on the far rim growing out of the haze, the Long Bridge's piers | OUT OF THE MOUNTAIN |
| 9 storm>undercrown | `drop` (S2) | open 1.5 + walk + 5.2 + fade | the end wall gives, then the Long Bridge deck cracks (cracks race out), goes in pieces, the world scrolls UP past the falling party (castle underside, torch windows, ash), the grey light goes out; arrive.drop = dust + thud on the Undercrown ledge (no real fall: the ledge's ceiling is solid) | THE BRIDGE GIVES |
| 12 crown>longwater (act II -> III hand-off) | `descent` (S3) | open 1.4 + walk + 6.6 + fade | the Banquet Hall's east wall (cols 603-608, rows 12-17, REAL wall) is the broken gate; walk.follow walks the party up the dais steps; then the camera pulls up and back (castle small on its peak), a raft takes them down into broad grey water; arrive.raft = the raft beached on the Long Water's first bank, step off | DOWN TO THE SEA |
Reduce-motion: S1 slower scroll, S2 gentle fall (no shake, no particles), S3 the pull is a STEP with a dip to dark (never a slide).

## Code
- transitions.js: rows 8/9/12, pure maths (DAYLIGHT/DROP/DESCENT constants + daylight*/drop*/descent*/captionAlpha), `barIn(t, bar)`, `barOut(t, dur, bar)`.
- transitions-art.js: drawDaylightScene, drawDropScene, drawDescentScene, drawArrivalRaft (GREYBOX-PLUS: rects, gradients, existing halo + hero sprites). Still writes no text.
- main.js (small, CRLF kept): scene dispatch, `trnDrawCaption`, per-scene ambience (mineworks / wind / water), thin bars in+out, walk.follow (heroes start where they stand; y eases to the first solid tile under them), arrive.drop (dust + thud + shake), arrive.raft.
- MERGE NOTE: claude/kingscene (902bf820) edits the same trnDrawOverlay lines (thin bar). My barIn/drawBars-in edits use the IDENTICAL text as its, so a conflict there resolves by taking either; its barIn signature is the same `(t, bar = BAR)`.
- tools/demo-transitions.mjs (extended): ACT2_BUILT + C; ferry-arrival replay (x0 12, goal 92); open.w <= 6; new LANE C block (35 checks): row shape/length/caption/skip-at-every-0.11-s with reduce, pure maths per scene for 4 seats, S2/S3 arrival standing room on the built Undercrown / Long Water, the crown gate = real wall + dais walk line + follow-scan replay, main.js wiring, art exports, reduce, no TODO-LANE-C left. Browser section: 3 skip-in-scene runs + the 3 scenes in --perf.

## Checks run
node --check (main, transitions, transitions-art, demo-transitions): ok. `node tools/demo-transitions.mjs`: 330/330 green (was 284). `node tools/transition-woodmarsh.mjs`: 31/31. Stub-canvas dry run of the 3 scenes + raft (1-4 seats x reduce x every 0.1 s): no throw, no NaN into any rect/draw call. No browser, no check.mjs.

## OWED (after the gate; flag gone, >= 1500 MB free, one browser)
1. `node tools/demo-transitions.mjs --browser --shots=<dir>` (all rows incl. 8, 9, 12 and the 3 new skip runs) and `--perf` (the 3 new scenes, phone 915x412, 4x CPU, >= 40 fps).
2. EYES (never seen rendered): S1 cart + hero feet vs the front panel; S2 deck/crack/falling pieces and the heroes' jump frame; S3 mountain/castle pull-back, raft/water; the caption's position above the thin bar; the raft arrival art vs the bank; walk.follow on the dais steps (cols 588-591); minecart gate-end hand-over into the scene.
3. Confirm the boss kills reach winLevel + trnBegin for Lance and the Goblin Queen (code reading says yes) and that the Highcrown boss kill's win card / ACT III card order is unchanged (card still shows once after the hand-off).

## Art needs (one ART lane, art before live)
Real kits for: S1 mine cart sprite + tunnel timbers + mouth + Stormhold skyline (reuse the Stormhold level backdrop) + Long Bridge; S2 bridge deck/rubble pieces + castle underside (Undercrown kit); S3 Highcrown mountain + castle-on-peak silhouette (the map castle sprite PROP.castle can be reused) + river/raft + sea haze; the arrival raft; and the 'crumble' gate for rows 9 and 12 (still the recoloured pine rails).

## Questions (recommended first)
Q1. Brief said the hand-off (and the kingscene style) could end on the map; I built ARRIVAL for all three (the act-II rows must load the next level; the Act II brief's rule). REC keep. Alt: S3 ends on the map with the Long Water node lit.
Q2. The ACT VIDEO hook (once per save before the 'ACT III' card) is NOT built here: it is the player lane's (no player or files exist). S3 is the fallback and replay version. REC unchanged.
Q3. Captions: OUT OF THE MOUNTAIN / THE BRIDGE GIVES / DOWN TO THE SEA. REC keep (one line each); Alt: drop the S1 line.
Q4. S2's real "fall" is only visual (the Undercrown's start ledge has a solid ceiling). REC keep (dust + thud on landing). Alt: a level lane opens a shaft above the ledge.
