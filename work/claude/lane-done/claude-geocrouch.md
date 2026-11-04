# claude/geocrouch - GEOMANCER: jab-3 UPPERCUT + STONE SKIN crouch (11-03, Daniel-approved plan-geocrouch-1103 RECS 1-7)

Branch claude/geocrouch off claude/batch142 5aca0612. NOT merged, NOT deployed. tools/check.mjs NOT run.

## What changed
A) UPPERCUT (switch `GEO.pop.upper`, default true)
- src/chars.js F.gFist redrawn, same 5 beats / same cutoffs (0.05/0.10/0.18/0.25) / same attack box: GATHER (sunk, fist at the knee, rock gathering), FORM (gauntlet closes past the hip), THRUST (up on the toes, arm up, big rock fist over the head, knuckle flash, staff tucked), CRUMBLE (fist at the top, chips falling), then the plain recovery. The art is not switchable (the switch gates the behaviour).
- src/geomancer.js: `fistSpike(x, y)` = a vis-only entry in the existing `spikes` list (dmg 0, no stagger, no cell, never solid), 30 px tall (two tiles) / 9 wide, rise 0.06 s, hold, sink 0.25 s (`end` 0.55), dust ring + 6 grit chips thrown up (vy -180). Under the foe the fist hits (in `fistHit`, bosses too); on a WHIFF (no hit by the 0.17 s plant frame) at the knee-stone's plant cell. `drawSpike` takes per-spike rise/sink.
- kvx P.face*25 -> P.face*8 on commons (`GEO.fist.kvx` 25 / `kvxUpper` 8). Bosses/minis unchanged (reel 0.3 s).
B) STONE SKIN (switch `GEO.pop.skin`, default true; false = EARTH SENSE exactly as before)
- src/crouch-b.js `SKIN = { settle 0.15, mulCommon 0.5, mulBoss 0.75, hp 3, reform 3.0, regenMul 1.5 }`; `skin()` replaces `sense()` (kept behind the switch); `takes()` is called from main.js damagePlayer0 right after the duck (hazard `pct` shares and a skin not yet set are not its business).
  YELLOW blow: dmg x0.5 (x0.75 from a boss / mini), no knock-back, P.hurt stays 0 so she is NOT stood up; the 3rd cracks it (she flinches/stands, 4 shards, 3.0 s re-form). RED (unblockable): full damage, thrown as ever, breaks it at once (3.0 s re-form). High blows still go over (duck). Exits: release DOWN, X (sweep), C (ward / DOWN+C detonate), jump. Blows are counted for 3 s after she lets go, so tapping DOWN is not a fresh skin.
- Stamina regen x1.5 while skinned (P.skinRegen read in commit.js staminaTick).
- chars.js `F.gSkin` (2 frames: knee down, staff planted, head bowed, mantle/back/hood stone HI #b9b6a4 / M / S #5f5d54 with amber seams breathing). crouch-b.js draw: 1-3 amber crack seams (one per blow) and a grey re-form bar under her.
- FX/SFX from repo samples (no new files): audio.js geoSkinSet (r_thud + sub), geoGlance (bd_stone clink), geoSkinCrack (crack_rock + stone_geo); settle = grey ripple + grit; glance = 3 chips + 'GLANCE'; crack = 4 shards + 'CRACKED'; red = 'SKIN BROKEN'.
- crouch hint: FIRST.geomancer = 'HOLD DOWN: STONE SKIN. BLOWS GLANCE OFF.' (40 chars); the old line is FIRST_SENSE (said only with skin=false); the old senseTold flag no longer suppresses the new line.
- tools/geocrouch-gif.mjs, tools/geocrouch-frames.mjs (look tools).

## Checks run (all green, one browser at a time, RAM >= 7 GB free each time)
- tools/crouch-b.mjs: EARTH SENSE cases now run with skin=false; NEW skin cases - numbers == plan; no skin before 0.15 s; pose gSkin; yellow x0.5 (9 taken vs 17 for the same blow standing), boss x0.75, no throw, still down; 2 hits keep it, 3rd cracks + stands her + 3 s re-form (mid 0.33 s left at 2.5 s, up again after); red lands whole + breaks; hazard pct ignored; regen 27 vs 18 = 1.5x; release/jump exit; blows kept across a tap; high swing still ducked; bot still looks (a skin set).
- tools/geomancer.mjs: fist plant + frame timing unchanged; new POP upper cases (spike under foe, vis only dmg 0; whiff spike at the plant cell; kvx 7.8 vs old 24.4; switch off = no spike + old kvx); STAFF_FRAMES gSkin:2; POP switches list updated.
- tools/crouch-hint.mjs green (nine distinct lines, once each); tools/textfit.mjs hints --strict 0 problems (107 screens; FIRST_SENSE added to its table); tools/arena-yard.mjs all ok.

## Rate check (Geomancer BUILT, WITH flasks, n=6, throwaway worktree = geocrouch + botbuilt; removed after, botbuilt NOT merged)
| boss | L | geocrouch skin ON | skin OFF (same seeds, GEO_POP skin=0) | geopop-tune POP ON | geopop-tune baseline (all POP off) |
|---|---|---|---|---|---|
| stockade | 4 | 6/6 100% | 6/6 | 4/6 67% | 6/6 |
| underleaf | 7 | 3/6 50% | 3/6 | 3/6 50% | 3/6 |
| spore | 5 | 6/6 100% | 6/6 | 3/6 50% | 6/6 |
| marsh | 3 | 5/6 83% | 5/6 | 4/6 67% | 6/6 |
| TOTAL | | 20/24 = 83% [64-93] | 20/24 = 83% | 14/24 = 58% | 21/24 = 88% |
Reading: the pooled point estimate is above 80, so the plan's trigger fired - but skin ON and skin OFF are identical fight by fight: the bot never crouches in a fight (crouchBPlan only looks when CALM, nothing within 130 px, and takes no blow), so skin cannot be what moved the numbers; the lift over geopop-tune's POP-ON row is run-to-run noise / the newer batch142 base (stockade and spore are back to their baseline 100%). I did NOT lower mulBoss (0.75 stays): there is nothing to lower it against. This rate check CANNOT measure skin; the turtling risk (x0.75 + 3 hits) is only proven by the unit cases, not by the bot. underleaf 3/6 is the same 50% as before and with the pass off.

## What's New line (suggested; docs/updates.json is the release lane's)
"Geomancer: her third jab is a rising uppercut that raises a stone spike, and crouching (DOWN) turns her skin to STONE - blows glance off, three cracks it"

## Questions (build the rec; none blocks)
1. Keep mulBoss 0.75? REC yes - the bot cannot test it; if a human playtest finds boss turtling, set SKIN.mulBoss 0.85 (one number) before the cut.
2. Teach the bot to use skin (crouch under a told yellow melee blow at < 3 stones)? REC not pre-demo (plan: bot need not learn skin); it would make the built-geo rates a real read of skin later.
3. Uppercut art is not behind a switch (only its behaviour is). REC fine; if the look is disliked it is a one-frame-set revert in chars.js F.gFist.
4. Spike height 30 px (2 tiles) is visual only; if Daniel later wants it to hit, that is a damage change -> post-demo (plan Q3).
