# PREPBC5 - Buried City 5 onto master f280bc535 (11-13), code-only
Branch claude/prepbc5 tip af2e22185 (pushed), worktree bracken-prepbc5. = origin/master (batch175) + merge of claude/bc5art 2773794d9 + ships-flag commit. Not merged, not deployed.
FLAG: src/buried-city5.js BC5_SHIPS = true. Lab override: ?bc5=0 / BRACKEN_BC5=0 / globalThis.BRACKEN_BC5=false = OFF (old street); ?bc5=1 still forces ON. tools/buried-city5.mjs asserts ships true and builds OFF via env '0'; mini-walls.mjs runs the Glassblower room unless =0; cdp.mjs sets window.BRACKEN_BC5=false for =0; bc5-art-lint allows only the flag lines to differ in buried-city5.js.

## What BC5 changes for the player
Buried City gains RACE THE GLASS: doors, bridges and lifts that hold only while a glass runs (R1 optional teach gallery, R2 pit span, R3 lift chain, R4 antechamber door); THE GLASSBLOWER mini replaces the Glass Works relay exam in place (cols 389-407); 3 Sand Graspers; extra foes/coins on thin stretches; carved sandstone signs; full art pass (Glassblower rig, grasper, race kit, finish lines).

## Conflicts
None. The merge was clean (ort), main.js auto-merged (import + 2 sign call sites). Master already carried the older flag-off BC5.

## Old vs new save
Level id, campaign slot and width (887) unchanged, so a new save and an old save reach Buried City the same way. A checkpoint is per-run state (reset to START on load, not persisted), so no old checkpoint can be stranded. The level replaces the relay in place: checkpoints go 6 -> 7 (relay shrine 407 -> 406, new kiln shrine 386 before the mini's drop; shrine 408 kept). Level-quality: 7 checkpoints, one per 135 route tiles. Cleared-level and unlock data untouched.

## Node proofs
node --check main/buried-city5/buried-city/flip/glassblower-hands/level/cdp OK. buried-city5 157 (ON; toy duel 6/6), buried-city 408 (399/408 same as before), bc5-art-lint 446 ok, reach-heroes 0 crossings, level-quality clears (buriedcity ON), signs ok, tells ok, answer-tags ok, solid-islands ok, architecture ok, cf1 OK, cf3 OK, cf4 ok, title-bake ok, comments ok, dangling-paths ok, modulepreload ok (1 unlisted reachable, budget 15; --write at release adds buried_city_bc5_art.js etc.), content-audit ok (518 info), checkpoint-gaps ok, goblin-lint, foe-cast-lint, anchor-lint, drawn-solids ok.
Not run: mini-walls, buried-city-route (need a page), any browser check, full suite. Nothing red.

## BROWSER OWED
1. Glassblower win-rate n=36 pooled (band 60-70%, every hero can win; tonight n=18 gave 72%, knight 4/6, warden 3/6, pyro 6/6; the warden bot was found weak tonight, see wardenbot.md).
2. Ranger hand/bot check of races R3/R4 (bow tap cannot strike in the driver; needs E by hand).
3. Post-strike camera look by eye (CAM5 0.6 s hold, lets go when running).
4. Pilot/mash restamp: level-quality WARN, hash e414f94b1e60 -> 6604eaf0c9f8 (level1-pilot.mjs buriedcity --write; mash-bot.mjs buriedcity --level buriedcity --write; pilot --curve).
5. mini-walls + buried-city-route in page (BC5 now default; route runs the BC5 legs).
6. Glassblower not lost against dark hall walls; curled grasper hands at 1x.

## Restamps expected
pilot, mash, curve (buriedcity); modulepreload at release; docs/updates.json is master's (What's New needed).

## Questions (rec first)
1. Keep the extra kiln shrine at 386 despite fewer-checkpoints direction? REC yes (it is the shrine before a mini arena; net 7 per 135 tiles).
2. Ship after owed 1-5? REC yes; pooled rate over 70 -> openT 4.5 -> 4.2 first.
Suggested What's New: "Buried City: race the hourglass - doors, bridges and lifts that stand only while the sand runs. Meet the Glassblower and the Sand Grasper."
