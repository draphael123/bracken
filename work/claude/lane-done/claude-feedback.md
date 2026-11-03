# claude/feedback - IN-GAME GIVE FEEDBACK form (sonnet lane, 11-03)
Branch claude/feedback (off claude/batch141 0f030403). Not merged, not deployed, no gate started.

## Built
- src/feedback-form.js: the form, plain DOM over the canvas in the game's own board style (online-ui.js, same pattern as the bug board). 1-5 rating; HERO / LEVEL / BUILD auto-filled and shown read-only (no input fields); 10 LIKED + 10 FRUSTRATING chips (combat, bosses, platforming, co-op, heroes, difficulty, controls, art, music, performance); one textarea (16px, so a phone's on-screen keyboard works; 1000-char cap + counter; the draft survives Back); SEND; BACK. Line on screen: 'Sends only what you type, plus build, level and hero.'
- Input: keyboard (arrows walk spatially rating>liked>frustrating>text>send, wrapping; Z/Enter/Space tick; X/ESC back), gamepad (own rAF poll: d-pad/stick walk, A takes, B closes; main.js pollGamepad stands down while the form is up), mouse and touch (real buttons). A visible focus ring (class kf) even in an unfocused window.
- src/feedback-config.js = the ONE config spot: FEEDBACK_FORM_URL ('' now), FEEDBACK_FIELDS (7 entry ids, empty), FEEDBACK_TOPICS (chip order = Google Form option order), FEEDBACK_MAX_CHARS 1000, FEEDBACK_GAP_MS 60000.
- Send: URL empty -> 'Thanks!', NO network, note kept in localStorage 'bracken-fb-local' (last 5, try/catch). URL set (must match https://docs.google.com/forms/d/e/<id>/formResponse) -> one fetch POST, mode no-cors, credentials omit, referrerPolicy no-referrer, URLSearchParams body (checkbox keys repeat). Offline/reject = quiet 'Thanks!' + kept locally. 1 send per minute (localStorage 'bracken-fb-last'). Rating is required.
- Entries: title menu top level row GIVE FEEDBACK (between OPTIONS and CREDITS; board is 10 rows, titlescene.mjs updated 9 -> 10); pause menu row 'Give feedback' (after 'Report a bug', PAUSE_ROWS in src/ui-hud.js, with a one-line tip). The end-of-demo screen does NOT exist on this base (demo cut + end card lane unmerged): it only needs a button calling openFeedback() in src/main.js (title rows already use it). OWED to that lane.
- Names ad-block-safe (feedback-form.js, feedback-config.js, ids fbform/fbsend/fbback/fbtext, classes fb*); modulepreload lines added to index.html.
- scratch\feedback-form-questions.md: the exact Google Form questions, the 'Get pre-filled link' steps, what to paste.

## Checks (all one browser at a time, RAM >= 3.4 GB free each)
- tools/feedback-form.mjs (new, 7 stages): all ok. A static (rows, URL empty, 7 fields, names clean); B form from title + from pause in a level ('HERO PYRO LEVEL THE LUMBER TRAIL BUILD BATCH140...'); C real key events; D fake gamepad; E no network (0 fetch/XHR/beacon/img/ws, note kept, 1/min, 1000 cap); F POST shape against a dummy URL intercepted in-page (POST, no-cors, 7 entries, checkboxes repeated, no save marker; offline reject quiet); G fit at 1280x720, 960x540 (card scrolls 542/491), 640x360, 375x667: nothing sideways, SEND reachable.
- textfit title,menu,press: 24 screens, 430 strings, all counters 0 (title shows 10 rows; the pause menu rows incl. the new one). The form itself is DOM (textfit records canvas text), so stage G is its fit proof.
- titlescene OK (10 rows), bug-report OK, title-region OK, tavern-menu OK, soundtest OK, settings-tabs OK (one crash on first run, passed on rerun alone).
- tools/touch.mjs: page CRASHED (Inspector.targetCrashed) here AND on untouched claude/batch141 (same fault, environment) - OWED on a healthier machine.
- Not run: tools/check.mjs (per brief), gate. Not registered in check.mjs (merge lane: add tools/feedback-form.mjs).

## Screenshots (scratch\lane-reports\feedback\)
form-keyboard-focus.png (best), form-gamepad-focus.png, form-title-open.png, form-pause-level.png, form-itch-embed.png (960x540), form-phone.png, title-row.png.

## Questions (rec built)
1. Rating required to send? Rec (built): yes, 'PICK A RATING FROM 1 TO 5 FIRST'.
2. Title row position: top-level 'GIVE FEEDBACK' above CREDITS (built). Alt: under OPTIONS only (fewer rows).
3. The demo-cut lane should add the end-card button (openFeedback). Rec: coordinator tells that lane.
4. The existing 'Report a bug' board says 'Nothing is sent anywhere' - still true; no change.
