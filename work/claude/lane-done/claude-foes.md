# claude/foes - SIX NEW FOES (frost beasts + skeleton set), CODE-ONLY, FLAGS OFF - lane report 11-08

Branch `claude/foes` off master 85d152eb8, worktree `bracken-lanes/bracken-foes`. Code commit **96a5bb3fb** (WIP 2d27853c6 before it). Not merged, not deployed. No headless browser was started, no full suite.
Built from `scratch/lane-reports/wolves-plan.md`, every open question as its REC. **Live behaviour with the flags off is unchanged**: no level places any of the six, no bestiary card, the
sheets are baked only on a spawn (the pen / tools), and `src/level.js` wraps the two levels' build() with `bonesPlace` ONLY inside `if (BONES_SHIPS)`.

## What changed (files)
New: `src/beasts.js` (pure rules, `BEASTS_SHIPS = false`), `src/beasts-hands.js`, `src/bones.js` (pure rules, `BONES_SHIPS = false`), `src/bones-hands.js`, `src/foe-hands-kit.js` (the shared binding:
once-per-hero-per-attack strikes, seats, sfx stand-ins), `src/bones-placements.js` (the 7 rows), `src/dev-pen.js` (the pens), `src/redraw/beasts_art.js` + `src/redraw/bones_art.js` (CODE PLACEHOLDER sheets),
`tools/beasts.mjs`, `tools/bones.mjs`, `tools/foe-ctx-fake.mjs` (a fake ctx so node drives the real hands).
Edited (one tagged `(claude/foes)` line each): `src/main.js` (import, EHP, DMG, 6 spawn cases, dispatch, frame, leap lift in `bob`, `hurtEnemy0` hook, HAS_HURT, corpse cases, BEAST_SHORT, COLS, poise
sets, cards pushed only behind the flags, the ctx + hands construction, `devPen` + `bakeNewFoes`, boot hook `?dev=1&pen=`, `BK.pen`), `src/level.js`, `src/marks.js` (BY_HAND + ANSWER + HEIGHT, then
`tells --write`), `src/combat.js` (COMMON_BLOWS), `src/poise-break.js`, `src/threat.js`, `src/told-attacks.js` (SIG), `src/death-fx.js`, `src/foe-react.js` (ROSTER act IV + a new act 6), `src/audio.js` (CAST rows,
existing kits), `tools/check.mjs` (beasts, bones in the node list), `tools/level-quality.mjs` (ROLES), `index.html` (modulepreload block regenerated: +9 modules would have broken the 15-module budget; on merge re-run `node tools/modulepreload.mjs --write`).
New filenames checked against the ad-block lists (no ad / track / banner / promo substrings).

## The six (BASE numbers; act IV x3.0 dmg / x1.05 hp, act VI x3.75 / x1.15 on top)
| foe | hp | attack A (tell, mark, answer) | attack B | notes |
|---|---|---|---|---|
| SNOWRUNNER 18x10 | 18 | SNAP 0.40 s, !, 6, BLOCK (parry: yelps, flung 1.0 s open), then runs out | THROAT LEAP 0.55 s, !!, 8, DUCK (HEIGHT high; a miss lands behind and skids 0.5 s open) | orbits 60-110 px, switches sides; 2-3 a pack, one bites at a time; leader dead -> hesitates 1.2 s; co-op: spreads across seats; snap calls the chill shim (0.15, no-op until chill.js) |
| GREYMANE 26x15 | 70 | CRUSHING BITE 0.65 s, !, 12, BLOCK (pushes 20 px; parry = staggered 1.2 s) | POUNCE 0.85 s, !!, 14 + PIN 0.6 s (P.snare: mash, or any hit on him frees), DODGE out of the frost RING (floor ring drawn); a miss = WINDED 1.0 s | light bar (POISE_EXTRA); runners hold while he tells |
| BRUIN 28x16 (22 up) | 120 | MAUL 0.9 s stands up + ROARS, !, 14, BLOCK (parry = on his back legs 1.5 s) | CHARGE 0.8 s (red lane on the floor), !!, 16 + knockdown, ROLL through (too tall to jump); wall = dazed 1.2 s, open = skid 0.6 s | POISE_HEAVY; braced (no cancel, full damage) while charging; cnSkin key for the pale coat is `bruinfrost` |
| SKELETON SOLDIER 10x20 | 44 | THRUST 0.5 s, !, 10, BLOCK (parry = shield arm wide, open 1.2 s, guard down) | SHIELD RUSH 0.7 s, !!, 8 + shove, JUMP over (his back is open 0.6 s: he does not turn) | SHIELD GUARD: front x0.4 (never immune); broken by a heavy blow (1.5 s), a parry, a blow from behind or a plunge |
| SKELETON ARCHER 10x20 | 22 | AIMED SHOT 0.8 s + glint line, !, 9, BLOCK or DUCK (flat arrow, HEIGHT high; flies over a ducker) | ARC VOLLEY 1.0 s, !!, 3 x 6, DODGE off three bone-dust marks (each lob lands ON its mark) | keeps 100-200 px, backs off, never off a ledge |
| SKELETON MAGE 10x20 | 18 | BONE WISP 0.9 s, !, 9, BLOCK or STRIKE it (pops); weakly homing (60 deg/s cap, 2.5 s life) | GRAVE ROW 0.8 s, !!, 10, JUMP the crest (180 px/s, 160 px) | told BACKSTEP (0.3 s puff, 80-120 px, clear of ALL heroes, onto a floor, 4 s cd); any blow cancels a cast |
Answer mix: beasts block + duck + dodge; bones block + jump + dodge. The pens: `?dev=1&pen=wolves|bear|bones|all` (Stockade flat floor, cleared) or `BK.pen(name)`; both unreachable without `isDev()`.
Placements (only when `BONES_SHIPS`): Mage's Folly zombie (221,5) -> soldier, apprentice (317,5) -> archer, zombie (471,9) -> mage; Falling Tower zombie (44,281) / (42,217) -> soldier, apprentice (32,257) -> archer, zombie (19,134) -> mage. Squad/face keys are kept.

## Node results (all green, nothing browser)
`node --check` on every touched file; `tells` (1144 rows, every mark agrees); `answer-tags`; `blow-tags` (56 hooks get the tag: `BNH.take`/`BSH.take` take `tag`); `beasts` (103 checks: the step, the tables, the sheets, 11 of them through the real hands on a fake ctx);
`bones` (104 checks: the step, the tables, the sheets, the hands on a fake ctx, the 7 placement rows found in the live builds, and the live build() with the flag off identical across builds); `one-new-foe`; `deploy-surface`; `modulepreload` (after --write: 762 listed, 0 missing);
also `spawns`, `threat-holes`, `architecture`, `comments`, `voices-check`, `death-fx`, `foe-cast-lint`, `foe-pass`, `undead-foes` (all ok). `tools/check.mjs --only/--list` not used.

## Owed (nothing of this was run)
1. BROWSER: stills per tell / release / hit for each foe from the pen (`tools/beasts-shots.mjs`, `tools/bones-shots.mjs` do not exist yet); a first real-page run of the pen (sprite bake, `damagePlayer` with the real parry window `P.parryT`,
   the duck path (`blowHigh` off `e.toldK`) for the leap and the aimed shot, the token purse's put-back of a turned-away tell, `drawTells` marks off the generic `...Tell` clause); `tools/foe-tempo.mjs` will now loop six more kinds (expected fine: the tells count down in the pure state, not `modeT`).
2. n=6-style checks: `BK.fightLab({ levels:['stockade'], foes:[...6 ids] })` per hero row for time-to-kill + hp cost (targets: a runner 2-3 cuts, Greymane / soldier a real 1v1, Bruin the room's anchor) and `node tools/blow-census.mjs --walk=...` at the tune lane (no blow over COMMON_BLOW_CAP 25%; the numbers are starting values).
3. ART: the sheets are placeholders in the right silhouettes (13 / 14 / 16 frames; 13 / 12 / 14 for the bones: lists in the file headers) - a Frog King bar pass, the bruin frost coat (`SPR.bruinfrost` is a tint), bestiary portraits, real SFX (stand-in kits now).
4. BEFORE `BONES_SHIPS` flips (a separate lane): a curve restamp of mage + fallingtower, `node tools/level-quality.mjs mage|fallingtower`, and a real-hero browser WALK of both (swaps are near-like in threat: zombie 38 -> soldier 44, apprentice 34 -> archer 22); the art lane merged first. Later rows: half the Burial Caverns / Witchlight `bonearcher` -> `skelarcher`.
5. BEFORE `BEASTS_SHIPS` flips: the mountain level lanes place them (wolves in F1 Frostfall Pass replacing the frostbite hound, Bruin in F2 the Crevasse den); move the sprite bake to load time with the flag; a thin-ice weight-2 hook for the Greymane is left to that lane.
6. Merge note: `index.html` modulepreload block (re-run --write), `src/marks.js` MARK block (re-run `node tools/tells.mjs --write` after any merge that touches marks).

## Questions for Daniel (each BUILT as the rec)
1. Names SNOWRUNNER / GREYMANE / BRUIN / SKELETON SOLDIER / ARCHER / MAGE - built. Alt WHITE WOLF / DIRE WOLF / CAVE BEAR is a find-and-replace of ids + cards.
2. Two family flags (BEASTS_SHIPS, BONES_SHIPS) - built; both false.
3. Wolves replace the FROSTBITE HOUND in F1; Bruin in F2 - recorded, placed by the mountain lanes (not this build).
4. Skeletons do not reassemble (a heap, frame 7) - built.
5. Greymane's PIN kept (0.6 s, mash or any hit on him frees) - built on the existing `P.snare` mash.
6. Snowrunner chill via a shim (0.15, no-op) - built.
7. NEW: runners orbit by RUNNING THROUGH the hero to switch sides (no foe/hero collision exists). Rec: keep for now; a polish pass can have them vault.
8. NEW: Bruin's dazed-at-a-wall uses the same footing test every ground foe uses (`fairStep`: a ledge or a solid tile stops him) - a snowdrift is a wall only if it is a solid tile; a level lane that wants a soft drift needs its own hook. Rec: solid drift tiles.
9. NEW: the archer's volley arrows are lobbed on arcs that land ON the three marks (the plan said lobbed, not falling from the sky). Rec: keep.
