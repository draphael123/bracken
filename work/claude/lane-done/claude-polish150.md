# POLISH150 (claude/polish150 off claude/batch149 a18ce8c7e) - code-only, node --check ok (main.js, settings-ui.js, gorm.js, tools/ui-hud.mjs). NO tools run (free RAM 1.7-2.4 GB < 2.5 GB; every tool I would run launches headless Chrome).

## Changes
1. LEVEL TIMER off by default. SET.timer false; new SET.timerV marker (like hudV2): a settings file without timerV takes OFF once, then LEVEL TIMER (row renamed from 'Timer', Accessibility > READING) is an opt-in you keep. Only the top-centre level clock is gated by it; boss/trial countdowns and races are separate and untouched. Pause-menu footer clock (menu line) is unchanged.
2. COMFORT (Accessibility tab, MOTION AND FLASHES):
   - SCREEN SHAKE = 0-100% slider (step 10, default 100) = the old 'Shake strength' row. It scales shakeCam amount + kick, pullBack and zoomKick. The old 3-way mode row is renamed SHAKE WHEN (OFF / ON HIT / FULL) and kept.
   - FLASHES = 0-100% slider (step 10, default 100); SET.flashAmt, SET.flashes stays = (flashAmt > 0) so every existing on/off gate still works. Old saves: flashes false -> 0%. REDUCE MOTION sets it 0.
   - Flash painting scaled by the slider: kill/parry/hit white wash (killFlash overlay), hurt red flash, level-up cream flash (drawCard), lightning bolt flash, chase surge wash. NOT scaled (still on/off only, vanish at 0%): reaper crimson parry/spike wash + edge, enemy white hit-flash sprites, pyro drawFx flash arg.
   - LARGER TEXT (row renamed from 'Big text'; same SET.bigText): scales dialogue boxes (already did) and now the hint/toast banners (size 12, line 14, only when it wraps to <= 2 lines, else falls back to the old size). Does NOT scale: HUD plates/numbers, timer, level-complete/boss cards, menus (the pixel faces only come in x1/x2/x3 - 8->12 needs layout room those panels lack). Honest limit; a fuller pass needs per-panel layout work.
   - Touch rows: the settings list is shared with touch (same tabs, left/right + tap halves of the value), so the sliders work on touch with no extra rows.
3. CO-OP TITLE ROWS: the labels read PLAY TOGETHER (SAME SCREEN) / PLAY ONLINE WITH A FRIEND; row keys 'LOCAL CO-OP' / 'ONLINE CO-OP' unchanged (handlers, tools). The hint is the board's existing footer line (no new row; still 12 rows on unlocks): PLUG IN A PAD, PRESS JUMP TO JOIN / HOST, SHARE THE CODE (replaced 'INN: CO-OP, LOOK, TRAIN'). The board widens only as needed (mw = max(126, widest label+40, widest hint+16), capped VW-110) and fitText cuts as the last fallback.
4. NAME: bestiary 'KING GORM UNDERLEAF' -> 'KING GORM' (main.js:6399), the boss wake banner in gorm.js:61 -> 'KING GORM', README line, stale tools/hint-shown-silent.txt entry removed. Remaining 'Gorm Underleaf' strings are code comments only (chars.js, level.js, kingswood.js, gorm*.js headers).

## Verified
node --check only. Static: no remaining references to the old row names ('Timer', 'Big text', 'Shake strength') in src/tools after the rename (tools/ui-hud.mjs updated).

## OWED (browser/tools when RAM allows)
- tools/settings-tabs.mjs (every legacy row on exactly one tab: LEGACY_ROWS now has 'Larger text', 'Level timer', 'Shake when'; 'Screen shake' is the slider), tools/ui-hud.mjs, tools/hud-default.mjs, tools/shake-mode.mjs (mig cases should still pass), tools/title-region.mjs, titlescene.mjs (title board width), tools/textfit.mjs. All launch headless Chrome.
- Stills: Settings > ACCESSIBILITY (both sliders, LEVEL TIMER off), title with each co-op row selected (label + footer hint, board width at 320 and on touch), a hint toast with LARGER TEXT on in a boss band, a lightning/hit flash at 50%, a level with the timer off then on. Check a title still shows 12 rows on claude/unlocks.
- hint-shown / hint-lines silent list: confirm tools/hint-shown.mjs is happy with the removed line.

## Merge notes vs claude/batch150
- src/settings-ui.js: only the access TAB_ITEMS line + LEGACY_ROWS names changed - demohide/demoend2 filters touch tabRows (different lines); expect trivial conflicts at most.
- src/main.js hot spots: SET literal (line 337), readSettings (353 + a new flashK const above it), menuAdjust rows (~6612/6618), row value line (~36437), toast block (~37149), title board (~37268-37293, plus TITLE_LABEL/HINT consts above titleSlots). The title-items line (11913) is untouched, so claude/unlocks' 12th row merges clean.
- Anything in batch150 that shows 'Big text'/'Timer'/'Shake strength' by name needs the new names.

## Questions for Daniel (rec first)
1. The shake row now reads SCREEN SHAKE (slider) with SHAKE WHEN above it for ON HIT/FULL. Rec: keep (default ON HIT is the demo feel). Alt: fold into one slider.
2. LARGER TEXT only covers hints + dialogue; rec: ship as is for the demo, panel-by-panel pass after.
