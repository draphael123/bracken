# claude/uihud - UI POLISH A (menus + HUD), Sonnet 5.5, overnight 2026-10-05/06

Base: master 85e13368. Scope: brief group 3 only (menus + HUD). Boot/loading, title card, intro, hero pick, map panel, death screen, level-complete screen and save-slot cards are lane B's and were not touched.
New code lives in `src/ui-hud.js` (pure, asserted); `src/main.js` edits are small and local (~50 lines changed).

## What changed

1. **ONE toast queue in a safe zone** (`toastQueue`, `toastZone`, `toastBox`). The ~80 `hintMsg`/`hintT` sites are unchanged (hint-shown still reads them); the draw now takes a message that arrives while another is showing and WAITS (max 3 waiting, oldest dropped, each shows at least 1.6 s, then a short tail, stale ones are dropped, a level change clears it). The box is centred in the zone to the RIGHT of the left cluster (the plate, the skill slots and the water/flood row, whose right edge main.js now reads back from the hands) and UNDER the coin panel; when the hero stands in that band it drops to the foot, above the boss bar (36 px up with a boss or mini up). Before: the toast sat under the plate at the same y as the SKIN row and drew over "SKIN / FILL AT A WELL".
2. **Status effects are ICONS** by the sun meter: a parasol in the shade, a bolt in the worm's storm, a flame (white-hot flash, a pip per stage) as the sun builds; a drop for the water skin, a horn / wave / parched sun for the Red Gorge's flood clock. The words SHADE, STORM, BURNING, HOTTER, SCORCHING, SKIN, DRY, FLOOD, HORN are no longer drawn (the interaction prompts "FILL AT A WELL" and "E: DRINK" stay: they are verbs, not statuses). A status CHANGE is said once as a toast through the queue ("THE SUN BITES", "HOTTER: FIND SHADE", "SCORCHING: SHADE, NOW", "IN THE SHADE: THE SUN LETS GO"); standing in shade at the start says nothing. Venom already had its drop icon.
3. **Idle counters fade**: the coin panel (after 3.5 s without a change), the XP line (5 s) and the run clock (after 6 s of the level) settle to 38-50% opacity and come back to full when they change. Slimmer plate on phones (110 wide instead of 116 when no hero meter widens it).
4. **Settings**: a `Graphics` row (LOW / MEDIUM / HIGH / CUSTOM) at the top of DISPLAY sets particles, backdrop layers, air, arena tint, weather, ambient life, grain, the dark edge and scanlines together (HIGH is exactly what a new save has; one change by hand reads CUSTOM). The ACCESSIBILITY tab now holds READING (Big text, Timer, Colour tells, Foe outline) and MOTION AND FLASHES (Reduce motion, Flashes, Screen shake, Shake strength); Timer, Screen shake and Shake strength moved off DISPLAY (every row is still on exactly one tab, saves are keyed by the same SET fields). A position counter ("12/36") shows in the corner of any menu longer than its window.
5. **Pause menu**: the first screen is Resume / Map / Skills / Settings / Return to map, then the level's own rows, the sound rows, co-op (kept, the settings-tabs check opens the guide from it), Quit to title. Return to map and Quit to title ASK ONCE ("press again to leave this level") when you are in a level.
6. **UI sounds**: the menu already had move (`ui`), select (`uiSel`), open and close; Settings' Back now plays the close sound like every other way back. No new audio files.
7. **Controller / touch**: the rows I touched keep their tap targets (`TCH.hit` on every row, the tab strip); LB/RB and Q/E still change tabs; the new Graphics row turns with left/right, a tap on its value, or the pad's d-pad like any value row. No new nav model was needed.

## Checks (all on port 8649)
- NEW `tools/ui-hud.mjs` (in `tools/check.mjs`'s list): queue order, the zone never overlaps any HUD rect / water row / boss bar, icons instead of words (proved to FAIL on master: master draws "SHADE"), the change toast, the idle fade, Graphics round trip, ACCESS rows, pause first screen and leave-confirm. GREEN.
- `settings-tabs` GREEN (5 tabs, 76 rows), `hint-shown` GREEN, `touch` GREEN (one early red was the shared port-8649 browser profile serving a stale script cached by the BASE checkout I ran for the before shots; green on re-run), `loading-screen` GREEN, `modulepreload` (275 listed, budget 15 for unlisted; `ui-hud.js` added to index.html), `audio-assets`, `comments`, `homepaths`, `dangling-paths`, `floaters` GREEN. `store-ui` ran (prints per-hero rows, no failure line).
- `mobile-perf`: red on frame-rate and worst-frame budgets in two runs, both while 5-6 lanes were running; MASTER fails the same budget (redgorge 34 fps) on the same loaded PC and my tree's script ms per frame were lower than master's in the quiet run. Treat as load noise; the coordinator should re-run it when the PC is quiet.
- `textfit --strict` ALL scopes (7869 screens, 82801 strings): OVERFLOW 0, OFFSCREEN 0, TRUNCATED 0, COVERS 0, COLLIDE 0, SMUDGE 0; the one CLIPPED was my own Graphics tip (shortened; settings, menu and hud scopes re-run clean). The one LONGHINT (main.js:1280, the co-op down hint) is on master and only reports.

## Stills (work/claude/lane-done/uihud/, before-* from master, after-* from this branch)
hud-caravan-start / -shade / -heat, hud-welltown-start, hud-redgorge-start, hud-wood-idle, pause, settings-display, settings-access, hud-phone-welltown. Regenerate with `node tools/ui-hud-shots.mjs <dir> <prefix>` (runs on any checkout).

## UNVERIFIED / not done
- Real phone hardware; the phone still shows the keyboard footers on screens other than the ones I touched (lane B / MOBILE3).
- The sound banner (title-card lane) is already top centre on this base; the toast zone starts at y 48 so they never meet.
- A real boss fight with a toast up was asserted statically (the box stays above VH-36 whenever a boss or mini is up) and not played.
- A text-size scale beyond the existing Big text on/off was not built (see questions).

## QUESTIONS FOR DANIEL (each built with the recommendation)
1. Text size: Big text is ON/OFF today. Rec (built): keep it, it now sits first on the ACCESSIBILITY tab with the clock. Alternative: a three-step TEXT SIZE (normal / large / huge) - a bigger job across every screen's layout; only worth it after lane B's screens settle.
2. Pause menu: Co-op and Co-op guide are always listed (the settings-tabs check needs the guide row). Rec (built): move them below the sound rows instead of hiding them. Alternative: hide both while there is one player and add "Co-op" to Settings.
3. Leave-confirm on Return to map / Quit to title: rec (built) ask once. Skip it if you find the extra press annoying.
4. Idle fade floor: coins 38%, clock 50%, XP 45%. Rec (built): fade, never hide. A "never fade" accessibility switch is easy to add if wanted.
