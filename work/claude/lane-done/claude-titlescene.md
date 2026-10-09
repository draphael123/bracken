# claude/titlescene - TITLE-SCENE lane (2026-10-09), base claude/batch80 a998a005

Shots: work/claude/titlescene/{before,after}-*.png (tools/titlescene-shots.mjs).

## Built
1. TITLE as one scene (src/main.js, `state === 'title'` block). Sign hangs across the top, whole (was off the left edge), its tagline is carved into the
   plank's foot on a dark strip (no longer floating on the art). The menu is a wayside board on two posts standing on the same road as the camp (dark
   plate, wood frame, four nails), not a panel over the arch; camp (gate, fire, knight) moved 12px left so the board covers neither the gate nor the knight.
   Footer line dropped (audit). Second hand-drawn BRACKEN shadow dropped (textfit read it as a collision).
2. HERO PICK: a row of the heroes' own idle frames at one integer scale (2x). Picked hero is lifted 4px, lit (green wash + floor mark); the rest stand back, dimmed, still breathing. Name (8) + one-line role (6) under each; keys/gamepad unchanged, a tap on a portrait picks it, a tap on the picked one takes him. Signature-move window kept where uiscreens measures it.
3. MAP FIRST FRAME: the screen change fade into the map now starts at 0.62 (38% dark), so frame 0 is the map. (The audit's pure-black shot was frame 0 of the usual full-black fade.)

## Checks (alone, PORT 8782)
textfit scoped --strict incl. new `title` scope: 0 findings (3066 screens). uiscreens ok. tools/titlescene.mjs (new, in check.mjs list) ok. save-slots, soundtest, modulepreload, dangling-paths, map-footer, map-grammar, architecture, comments, settings-tabs ok.
touch.mjs: full run passes (exit 0) when the machine is not starved; one earlier run under load timed out on its first evaluate and was not a code fault (press-card+title pass alone, base tree passes).
textfit --full not run (8+ min, no title/pick changes beyond the scoped scenes).

## Not done / notes
- Menu grouping (audit: CONTINUE/SAVES/CO-OP/PRACTICE/OPTIONS/CREDITS) NOT done: tools (touch, soundtest, save-slots, playtest) address SETTINGS / SOUND TEST / CONTROLS as top-level titleItems(). Board is sized for 8 rows.
- Font calls all go through text()/textW()/fitText(); no new font names.

## QUESTIONS FOR DANIEL
- Group SETTINGS / SOUND TEST / CONTROLS under one OPTIONS row (6-row board)? Rec: yes, later; needs the tools above updated. Built: flat 8 rows.
- Footer key hint dropped on the title (rec). Keep a single "Z enter" line instead?
- Hero row shows 3 heroes today (DEFAULT_HEROES); built to scale to 7 (names stack, roles hide under 70px cells).
