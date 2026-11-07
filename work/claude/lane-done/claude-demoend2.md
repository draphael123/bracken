# DEMOEND2 + DEVOFF (11-07) - branch claude/demoend2, off master 95bc267a4 (worktree bracken-demoend2)

## Changed
END CARD 2 (src/demo-end.js, demo-end-config.js, NEW src/demo-teaser.js)
- "WHAT'S IN THE FULL GAME" strip: 5 vignettes (THE BURIED CITY, HIGHCROWN, THE LONG WATER, THE DRAKE, THE DEMON KING) baked in code (64x36 RGBA, seeded, deterministic, no image files, nothing to preload) and painted to small canvases scaled crisp. Grid 5 across, 3 across under 420 px; card already scrolls (max-height 92vh).
- WISHLIST / FOLLOW button next to KEEP YOUR PROGRESS: FOLLOW_URL blank (ships blank) = shut, non-focusable "WISHLIST / FOLLOW: COMING SOON" + plain line "THE FULL GAME HAS NO PAGE YET. IT IS COMING." (the old follow line promised a page); FOLLOW_URL an https address = live button (window.open noopener) + the old link line. followUrlOk refuses http/javascript:/spaces.
- KEEP YOUR PROGRESS / GIVE FEEDBACK / CREDITS / BACK TO THE MAP / MAIN MENU untouched (keep() export code unchanged). Keys/pad/touch/mouse: same walker (disabled button is skipped).
- index.html modulepreload for demo-teaser.js.
DEVOFF
- settings-ui.js: DEMO_DEV_ROWS = FPS counter, Hitboxes, "- TESTING -" header; tabRows(id, from, demo) filters them under DS.DEMO.
- main.js: FPS/UPDATE/DRAW draw (L37411) gated `SET.fps && !DS.DEMO` (covers ?fps=1 and a saved true); drawBoxes returns under DS.DEMO. Settings are never rewritten (gate is at the draw).
- tools/demo-cut.mjs: 2 new pins, DEVOFF + CARD2 blocks, demo-teaser.js in NAMES. tools/demo-end-page.mjs asserts 5 painted canvases + shut follow button (browser, owed).

## Dev-only rows a demo player could see in Settings (list)
Hidden now: FPS counter (Display), Hitboxes (Gameplay) + the TESTING header. Already hidden: Unlock everything (?dev=1 only). God mode + Unlock all levels: DEMOLOCK lane on claude/demohide (not merged here); my DEMO_DEV_ROWS is a superset-free separate list, so after both merge tabRows needs one combined filter (both add `&& !xHidden(k, demo)`: trivial textual conflict in settings-ui.js tabRows + import line). Left visible on purpose: Game speed (an accessibility/assist), Sound test, Erase/Import/Export save.
URL-only dev switches still live in the demo (not readouts, need a hand-typed URL): ?level= ?boss= ?unlock= ?playtest= ?chase= ?rush= ?mode= ?modes=. Rec: leave (they are the test harness).

## Verified (no Chrome launched)
- node --check src/main.js, settings-ui.js, demo-end.js, demo-teaser.js, tools/demo-cut.mjs, demo-end-page.mjs: ok
- node tools/demo-cut.mjs: all green (15 pinned uses of the flag incl. the 2 new)
- Rendered the 5 vignettes to a PNG with node (zlib) and looked at them: all read well.
## OWED (browser)
- node tools/demo-end-page.mjs <dir> (opens the card; 5 canvases painted; follow button shut; Down+Enter feedback; KEEP file) - cdp, launches Chrome.
- Eyeball the card at 360x640 phone and 1280x720; Settings > Display/Gameplay under ?demo=1 (no FPS counter/Hitboxes/TESTING); ?demo=1&fps=1 draws no readout.
- Real stills: swap the baked vignettes for captures of the later levels once BATCH levels are live (scratch\trailer\stills-v3 are trailer frames incl. demo content, not suitable for a spoiler-light teaser).

## Questions (recs built)
1. Need the itch URL: put it in src/demo-end-config.js FOLLOW_URL (https only); until then the card shows COMING SOON. Rec: leave blank for Sunday if no page yet.
2. Are DRAKE and DEMON KING OK to show (mild spoilers of the late-game arcs)? Rec: yes, silhouettes only.
3. Vignettes are mood art, not captures. Rec: ship them; replace with real stills in a later patch.
