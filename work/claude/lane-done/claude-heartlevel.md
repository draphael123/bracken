# claude/heartlevel - THE HEART OF THE MOUNTAIN, the level (OPUS GREYBOX, code-only) - 11-05
Branch claude/heartlevel off claude/heartinteg 71691be6c. Worktree bracken-heartlevel. NOT merged, NOT deployed (art before live). No browser opened on purpose (see "Browser owed": one tool did open one by accident).

## Plan (rule, route, roster)
THE RULE: THE MOUNTAIN'S HEART BEATS. ON THE BEAT THE CRUST MELTS AND THE VENTS BLOW. STRIKE A WARD-STONE AND THE CRUST AROUND IT HOLDS.
- THE BEAT: one told clock (1.2 s glow + rumble, then a 1.4 s SURGE). Period by zone - the eruption builds: 7.0 s (throat) > 6.0 (gallery) > 5.2 (lake) > 4.5 (seal's door). None in the caldera.
- CRUST: one-way spans lying on the magma (fire pools). The surge melts them; a hero on one drops in: BURNED, handed back to the last bank (existing L.waterHurts fire-pool path - the Salt & Sanctuary-ish cost is the hp + the walk back). A foe on one burns (hazardFoe).
- WARD-STONE (the verb): any blow holds its crusts 10 s, beat or no beat (struck mid-surge: they harden at once; the hold waits a surge out; flickers its last 2 s; then spent 2.5 s).
- HEART VENTS: existing heat-vent props, blow only in the surge (one main.js line) - three are the only way up a wall.
- THE SEAL'S CHAINS: T.CLIMB columns from the roof to pockets (silvers / coins). BASALT RAFTS: existing stone movers on the lake.
- ONE NEW FOE: THE MAGMA LEAPER (e.t 'leaper', 18 hp): lives in its channel's magma; on the tell rises under a hero over its channel (bubbles, red !!), leaps on the beat (body blow 14), lands and thrashes on footing (a HELD crust is where you kill it), snaps (!) at your jaw, flops back after <=3 s; melted footing drops it back in.
- Roster (no goblins): wights, bone archers, husks (an ELITE husk keeps the caldera door), ember wisps, leapers. Roles melee/ranged/runner.
Route (columns): 0-104 THE THROAT (teach crust, vent, leaper) | 105-196 THE CHAIN GALLERY (THE WARD LOCK: a 40-tile crust; test) | 197-282 THE MAGMA LAKE (SHRINE 1; rafts, pillars, a pillar ward, 3 leapers) | 283-349 THE SEAL'S DOOR (exam: 4-span crust floor, 2 wards, vent to a pocket, 2 leapers, elite; SHRINE 2 at the door) | 350-389 THE CALDERA (drakelab geometry moved: 32 tiles, seal centred, two ledges outside the P2 ring; THE FIRE DRAKE).
Shrines: 2 (+ the drake's own by the split seal when beaten; sky fight checkpoint = mount-up).

## Built (files)
- NEW src/heart-mountain.js (level), src/heart-mountain-hands.js (rule + leaper + greybox draw), tools/heart-level.mjs (node check, 118 checks).
- src/level.js: rows 'heart' (hidden, needs 'sealedpyramid' PLACEHOLDER) and 'heartsky' (skylab arena under the Heart's name, hidden).
- src/heart-scenes.js: rows heart>heartsky (scene A), heartsky>breach (scene B, ends on the map); checkpointOf('heartsky'). Lab rows kept.
- src/main.js: HRT hands (reset/update/strike/drawWorld/vents/structures), leaper spawn + own machine + draw, EHP/DMG leaper, AMPHIB/BODY_BLOW/KNOCK_SKIP, TIER/TIER_BOSS heart+heartsky, caldera kit via L.caldKit (also src/redraw/caldera_tiles.js).
- foe-react act 7 levels, threat.js, marks.js (leapTell !!, biteTell !), hint-lines HM_SAY, dressing kits, stuck-spots (3 vents + the ward glint/nudge).
- Map hooks: HEART_NODES in src/heart-mountain.js (THE HEART + THE BREACH node rows) for the map lane's mountain/demon sheet. NOT pushed onto NODES (no mountain sheet exists; the level stays hidden).
- Tools: level-quality GATE + REPORT_ONLY heart [music, pilot, mash] + ROLES runner leaper; anchor-lint GATE heart; floating-geometry FIXED heart (+ reads a hidden level by id, + L.floatMachines for the drake's sinking ledges); one-new-foe NEW_EXACTLY heart:['leaper'] and skips heartsky; rule-state hmCrust; heart-scenes "four chain rows".

## Lint results (pure node only)
PASS (pure node): tools/heart-level.mjs 117/117 (road, geometry, theme, beat, ward, THE LOCK math, leaper, every hero reaches the caldera) | level-quality heart CLEARS THE BAR (flat 0%, bands 7 / 47%, mechanics 5 kinds 4 developed, 4 secrets, 2 shrines @198 route tiles, density 1.29, roles 3, route 27 rows / 14 pockets; REPORT-ONLY: music, pilot, mash) | anchor-lint heart 0 faults (gated) | floating-geometry heart ok (gated) | one-new-foe ok (heart = exactly the leaper) | checkpoint-stand, checkpoint-gaps, checkpoint-thin, checkpoint-rule, checkpoints ok | reach-heroes heart ok (0 crossings) | platforming-lint, foe-pass, foe-footing, lethal-water, content-audit, solid-islands, newlevel, answer-tags, dressing, architecture, skins, goblin-lint, ambush-listed, barriers-inventory ok | heart-scenes 97 ok (updated: four chain rows) | fire-drake 78, fire-drake-hands, sky-mount, demon-king, reflect-kit ok | stuck.mjs static part OK (3312 checks incl. the 4 heart spots) | node --check every touched src file.
RED, NOT MINE (pre-existing from heartinteg's merge): hint-shown flags 6 number() lines in src/demon-king-hands.js / src/sky-mount-hands.js (CHIP - KNOCK HIM DOWN, THE DRAKE BANKS >, ...) - route them in hint-lines or call them flavour (the sky lanes').
NOT RUN: tools/check.mjs (as told); every tool that opens a page.

## Browser owed (exact checks)
1. tools/level1-pilot.mjs heart --write (level-quality 'pilot' row; REPORT_ONLY until then).
2. tools/mash-bot.mjs heart --level heart --write (level-quality 'mash' row).
3. Walk it: ?level=heart - the beat (crust melts/cools, glow tell), BURNED + hand-back on a melted crust, ward hold/harden/flicker/spent, the three heart vents carry every hero up (knight, reaper = slowest, pyro), the 40-tile crust on a hold with the reaper, leaper tell/leap/thrash/bite/flop, wights/husks falling in on the beat, the stall glints.
4. The caldera: FDH fight runs in 'heart' (arena.seal/ledges), ledges sink in P3 and the hmColumn posts vanish with them; beaten -> scene A -> 'heartsky' loads -> death restarts at mount-up -> scene B -> map. Co-op 2-4 seats on the crust/vents.
5. tools/heart-scenes-shots.mjs / heart-proof.mjs pointed at heart/heartsky (they use the lab ids today).
6. mark-integrity, mini-names, foe-tempo, lab-reach (they use tools/cdp.mjs) - not run (mark-integrity WAS run once by accident at ~08:51, see below).
INCIDENT (sorry): tools that open a headless page through tools/cdp.mjs by a dynamic import slipped my first grep and were run: demo-transitions (~08:40, its page part), mark-integrity (~08:51), hint-shown (~08:53) and stuck.mjs (~09:15, its page part CRASHED - probably memguard). Each closed or died on its own; I killed nothing. After the coordinator's note every run was grepped for cdp/openPage/headless.

## Art owed (art before live)
Basalt/magma crust (cooled skin, glowing cracks, melt anim, held frost tint), ward-stone (obsidian + rune, lit/flicker/spent), chains (links hung from rock), heart vent (fumarole + surge column), basalt raft sprite, the LEAPER (magma eel-fish: under shadow, tell bubbles, leap arc, thrash, bite, flop, death), caldera ledge columns, a Heart backdrop (the cone's inside; it borrows the caldera backdrop now), level music (CC0 - Daniel's pick; plays stock musMountain), leaper sounds (uses dkEruption/rumble/splash), bestiary card for the leaper.

## Questions for Daniel (rec first - built as rec)
1. The ward holds for TIME (10 s) not "one beat"? REC yes: hero speeds differ 1.65x (pyro sprint 122 px/s vs blood knight 74), so a one-beat hold could not both lock out the fastest run and carry the slowest. Built.
2. Falling in the magma = burned + back to the last bank (not death)? REC yes (the existing fire-pool rule; death cost stays at the shrines: only 2 + the drake's). Built.
3. The level's predecessor: needs 'sealedpyramid' is a placeholder; REC: re-point to V2 THE LAVA TUBES when the mountain is built, and keep it hidden until then + art. Built hidden.
4. Roster: undead (wights, bone archers, husks) as the Skeleton King's master's dead marching on the seal + ember wisps + the leaper; no demons/imps before the seal breaks? REC yes (imps stay the King's reveal in the sky fight). Built.
5. A real support foe? REC none for now (the undead priest/paladin are the Lit Church's credited new foes and the one-new-foe walk would steal them); add an ash-cultist support in the art/foe pass if wanted.
6. Map: THE HEART and THE BREACH node rows are data only (HEART_NODES) until the map lane lays the mountain/demon sheet. REC keep.

## Final tip
TIP_LINE
