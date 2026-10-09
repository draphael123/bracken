# claude/fontpair - the strict font pair (Daniel 10-09)

Base claude/batch80 a998a005. Press Start 2P = display, Silkscreen = body + HUD numbers/timer. Nothing else.

## What changed
- fonts/ (local, no CDN): PressStart2P-Regular.ttf, Silkscreen-Regular.ttf + OFL-*.txt (SIL OFL 1.1; Press Start 2P (c) Cody "CodeMan38" Boisclair, Silkscreen (c) Jason Kottke). index.html: `<link rel=preload ... crossorigin>` for both + local `@font-face` (font-display: block); Google stylesheet link and VT323 gone. sw.js caches the fonts with the shell (v2), CDN branch removed.
- src/main.js (one table, no call-site churn): `FONT` / `FONTS` = exactly the two faces; `FONT.size` is the ladder; `faceOf(size)` is the only place that decides the face: 8-11 Silkscreen x1, 9 = Press Start x1 (panel header, TYPE.head), 12-15 Silkscreen x2 (HUD numbers/timer), 16-23 Press Start x2, 24+ Press Start x3. `TYPE` keeps its old name and now reads from FONT.size. TYPE.title is 16 (was 12). The few marks Silkscreen lacks (arrows) are cut from Press Start per glyph.
- Retired: the thin 5x5 hand (ART.TINY / bakeTinyFont deleted from art.js), the Font setting (row, handler, settings-ui lists, SET.font), system monospace everywhere (index.html boot + rotate card, error overlay, touch.js overlay now Silkscreen, fair_keys ticket price, lookpass debug).
- Panel headers (MAP, THE STORE, CHOOSE A SAVE, BESTIARY, PAUSED/SETTINGS, SOUND TEST, CREDITS, CONTROLS, REBIND, practice, co-op help, palette) use TYPE.head (Press Start 2P).
- Credits: new last page "THE TYPE" naming both fonts + OFL.
- Boss/mini intro card fits against min(VW,320) so a 16px name that does not fit drops to 8.
- tools/fonts.mjs (wired into tools/check.mjs): files + licences exist, preload + @font-face, no CDN/VT323/monospace/TINY, Font setting gone, credits name both, page holds exactly the two loaded faces and fetched no remote font. playrec's external-request audit no longer forgives the font CDN.

## Checks (alone, port 8781)
textfit full: 8842 screens, 87361 strings, OVERFLOW 0 OFFSCREEN 0 CLIPPED 0 TRUNCATED 0 COVERS 0 COLLIDE 0 SMUDGE 0 ERROR 0 (one mid-run pass flagged 3 mini-boss name cards at size 16; fixed by layout, see above). signs ok (804 signs, 2 lines), hint-shown OK, modulepreload ok, audio-assets ok, dangling-paths ok, homepaths ok, fonts ok. Not run: the whole tools/check.mjs suite (40 min; no --full flag exists in textfit).
Screenshots: work/claude/fontpair/{before,after}/ (title, credits.png = title menu, saves, hud, menu, settings, sign, boss, store). Script: work/claude/fontpair/_s/shots.mjs.

## QUESTIONS FOR DANIEL
1. Font setting: built = removed (a pair is not a preference). Alternative: a "Text size" option (needs a x2 body layout pass). Rec: removed.
2. Style-guide ladder said 8/12/24; Silkscreen/Press Start only stay crisp at whole multiples of their 8px cell, so the ladder is 8 / 12 (x2 body, numbers) / 16 / 24 with a 9 rung (Press Start at x1) for panel headers. OK, or should panel headers go to 16 (needs a vertical layout pass per screen)?
3. HUD numbers (coins, timer, HP) are now thinner Silkscreen x2 where they were bold Press Start; if they read weak, the HUD-SLIM lane can bold them with a 1px outline.
4. Old saves with SET.font are ignored harmlessly.

## For the later lanes
Draw titles with TYPE.head/TYPE.title/TYPE.logo, everything else at 8 (rows/hints) or TYPE.num; never a raw font string. Silkscreen is caps-only (lower case draws as caps).
