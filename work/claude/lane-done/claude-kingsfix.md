# claude/kingsfix - KINGSWOOD 2 SHIP-CLEAN (sonnet, small)
Base claude/gorm2art ea9dad1c, PORT 8785. Not merged, not deployed. Helpers (uncommitted) in work/tmp-kingsfix/.

## 1. HALL FPS (mobile-perf 4x CPU, 915x412@2.625)
PROFILE (CDP sampling + a drawImage census): Gorm's own draws (ropes, pegs, decks, archers, boss) are ~3% of the hall frame (gorm-hands drawWorld + drawFront). The hall costs more than the run because a boss fight ZOOMS the view out to 640x360 (4x the pixels of 320x180):
- the 16x16 TILE loop: ~550 drawImage calls a frame = ~40% of the frame (ablation: skipping them took the hall from ~19 to ~11 ms busy);
- on a phone the zoomed view is Sd 3, which the "phone draws at half resolution" rule skipped (it only halves at Sd >= 4), so the display canvas was 2402x1081 (2.6 MP) in every boss fight.
FIXES (generic, src/main.js; level hash, boss numbers, art unchanged - nothing hall-specific needed baking):
- **THE TILE CHUNKS** (drawTileChunks): the tile grid is drawn once per 8x8-cell chunk (padded window, same row-major order, so overhanging sprites land as before) onto a chunk canvas and a frame blits ~24 chunks. Re-bakes a chunk when any sprite in its window changed (gates, crumbles, cellSet); falls back to the per-tile loop for a lit lip, a water dip, a reed, an oversize sprite, a fractional camera (and BK.tileChunks(false)). Cap 200 chunks.
- phone display canvas: `Sd >= 3` (was 4): the boss view's canvas is 1280x720 (0.9 MP), the same non-integer browser step Sd 5 and 6 already take.
**New tool tools/tile-chunks.mjs (in check.mjs, check-timings.json)**: draws frames of 10 levels x 4 spots x normal/zoomed view with the chunk path and the per-tile path and compares every pixel (pixels that move between two draws of the SAME path are masked; the 24 px left/top edge is skipped: a 2 px sprite overhang from the column left of the view that the per-tile loop never drew). 64 frames, 0 differing pixels (a one-pixel mote flake retried once). load-leak, frame-cost green.
BEFORE / AFTER (busy ms per frame / fps; 2 runs each, alternating original and fixed main.js on a PC shared with other lanes):
| scene | before | after |
|---|---|---|
| THE HALL (kings@430:13, fight on) | busy 19.9-26.7 (21.8 mean), fps 24-45 (this base: 34-43 in gorm2art) | busy 13.2-16.8, fps 48-54 (6 runs, none under 44) |
| THE RUN (kings@520:13) | busy 18-24, fps 38-47 | busy 12-18, fps 46-56 |
| THE GLADE (kings@615:13, skipTo glade) | busy 18.5-19.9, fps 42-45 | busy 13-15, fps 50-56 |
Official tools/mobile-perf.mjs (MP_SCENES=kings,kings@430:13,kings@615:13,kings@520:13): kings 48 / hall 56.0 / glade 55.7 / run 55.7 fps, busy 13.3 / 14.5 / 12.5 ms, input 0.1 ms. (One run of its `kings` scene showed a 709 ms frame; two more on the original and fixed code did not - load-time noise, not repeatable.) A one-off 0.3-0.5 s frame at the boss's start (setView -> bakeBackdrop, the plate's first glyphs) still turns up sometimes under contention; it is the base's too and I left it (intro card is up).

## 2. SIGN vs PROMPT
- src/main.js: `hudMeter = state === 'talk' ? null : hudMeterLabel()` - the HUD hides every hero's C prompt (TAP C DEFLECT / HOLD C WARD / SMITE: C ...) while a sign or talk page is open, game-wide.
- The second finding in the same screen (COVERS 1): the area banner "THE ROYAL ROAD" (kingswood-hands, 3.4 s on entering) is the same words as the sign's first words, so the textfit cover test counted it as part of the sign's box (title at the top, text at the bottom, hero between). Rewording the sign broke kingswood2's "a sign names THE ROYAL ROAD at its entrance", so the banner now hides under a talk page too (kingswood-hands.js, ctx.talking).
- Proof, textfit scoped (TEXTFIT_LEVELS=<lv> talk,hud,plates): kings 180 screens, wood 144, waymeet 192 - OFFCENTRE/OVERFLOW/OFFSCREEN/CLIPPED/TRUNCATED/COVERS/COLLIDE/OVERDRAWN/SMUDGE/ERROR all 0 (was COVERS 1 COLLIDE 2 on kings). Per level (a combined kings,wood,waymeet run hung 481 s on talk[pirate]; one `hud` scope on wood hung once at 301 s and passed on retry - flaky harness, not the change).

## 3. HALL SIGN (kings@416, 2 lines)
"KING GORM: ARCHERS HOLD THE CAGE ROPES. BRING THEM DOWN, THEN CUT A PEG WHEN HE IS UNDER." (was 96 chars / 3 lines). signs: 1005 signs, all <= 2 lines. NOTE: this changes the kings level hash (a sign's text is in it); every other number is untouched, but kings' hash-keyed stamps (level-quality pilot/curve/mash) need the coordinator's usual re-stamp.

## 4. HANGING BRANCH
The burning branch hung from a 22 px charred stub that ended in mid-air; it now hangs from a charred vine up to the top of the view (gorm-hands.js drawWorld, one line). Picture: work/claude/lane-done/kingsfix-after-branch.png (second branch, top right). The boar corpse flipped frame: left.

## CHECKS (PORT 8785)
green: gorm2 (Node), gorm2-probe (page, 0 errors), kingswood2, signs, textfit scoped (above), tile-chunks (64 frames), load-leak, frame-cost, ui-hud, hud-default, touch, mobile-perf kings scenes, syntax.
Reds: **tools/gorm2.mjs was already red on the gorm2art base** (`document is not defined`: gorm_frames.js / kingswood_areas.js bake when imported). Fixed in the tool, not the game: tools/gorm2-dom.mjs (node-canvas + no-op gradients/paths) imported first. Not run: the full suite; elites (kings|brute#2 @295 no affix) is the base's own red.

## QUESTIONS FOR DANIEL
1. The hall's fps was never Gorm's draws: it is the zoomed boss view (4x pixels). Built: tile chunks + a half-resolution display canvas at the boss zoom on a phone. Rec: keep both. Alt: cap the phone boss zoom below 640x360 (changes how much of the arena you see).
2. The area banner now hides under a talk page (rec built); alt: leave the banner and change the sign's first words (kingswood2's check names the area at the entrance).
3. The hall sign lost "HIS" / "IT" ("ARCHERS HOLD THE CAGE ROPES ... WHEN HE IS UNDER"). Same meaning; say if you prefer other words.
