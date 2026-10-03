# claude/mobile - TOUCH SUPPORT, ALL OF IT (Sonnet, 2026-10-02)

Base: claude/batch56 46d26d3d (= master + batch56). Nothing on origin/batch56 or origin/master moved while this ran (merge is a no-op).
Pictures: `work/claude/mobile/*.png` (landscape phone, 844x390 at 2x, made by `node tools/touch-shots.mjs`).

## What changed (plain words)

New modules, small hooks in main.js (the old zone/dpad code, ~35 lines, is gone):
- `src/touch.js` - everything a thumb does: the floating stick, the buttons, the pill buttons and tap boxes for menus, the layout editor, the TOUCH settings rows, the assists, the haptics.
- `src/touch-interact.js` - "what would INTERACT do right now": the verb for the contextual action button, plus `VERB_HOOKS` (exposed as `BK.touchVerbs`) so a level with its own use pushes one function and needs no edit anywhere else.
- `index.html` (viewport-fit=cover kept, a safe-area probe div, manifest + icon links, service-worker registration), `manifest.webmanifest`, `sw.js`, `icons/*.png` (drawn in code by `tools/make-icons.mjs`, a gold pixel B on the wood green - a PLACEHOLDER for real art).
- main.js hooks: the glue block where the old touch code was (press names, the verb question, auto-face), `TCH.beginFrame/draw/tick/keyUsed`, tap boxes registered where menus already draw their rows (title, save slots, map nodes, store tabs + rows, settings tabs + rows), 3 buffer multipliers, 3 haptic calls (`damagePlayer`, `levelUp`), the map's walk-to-node goal, and one shared `lockedSay` for the map's LOCKED / NOT YET (so hint-shown still counts those literals once).

### 1. Floating joystick
A thumb down anywhere on the left 45% of the screen is the stick's centre (right 45% when left-handed). Eight directions in 45-degree sectors with 5 degrees of hysteresis, a dead zone (0.3 of the base radius), UP and DOWN are real zones (the base shows two arcs that light up). Held directions set `keys.left/right/up/down` and nothing else in play (a rising edge is NOT sent as a left/right press in play: that would count toward the double-tap dodge). In menus a rising edge is a press and a held direction repeats (0.4 s, then 0.16 s). Dragged well past the base, the base follows the thumb. Releases on touchend, touchcancel, blur and visibility change; each finger is tracked by id, so stick + buttons together is safe.

### 2. Contextual action button
Appears ONLY when INTERACT would do something, labelled with its verb: READ (sign), TALK, CALL (raft winch), TAKE (torch bracket, bucket), ENTER / OPEN (doorway, barred or not), SHOP (counter in a shop room only), LEAVE (shop exit), PAY (ferryman), LIFT (hoist load). Audit of every `talkPress` use in main.js (talkers, doorway, keeper, exit, ferryman, vbucket, loads; the tab-step uses of E are covered by tap tabs): all are mapped. Not on the button, by design: ringdoor (it opens as you walk into it), levers/plates (struck with a swing), R / M / H / Q / TAB (pause menu has Back to shrine, Music, Skills, Map).
WELL TOWN IS NOT ON THIS BRANCH (the waterskin FILL / POUR / DRINK lives in claude/welltown). It registers on `BK.touchVerbs`: `BK.touchVerbs.push(() => nearWell ? { verb: 'FILL', key: 'talk' } : canPour ? { verb: 'POUR', key: <its press> } : canDrink ? { verb: 'DRINK', key: <its press> } : null)`. `tools/touch.mjs` proves the hook path with a stand-in for all three verbs and the three different presses (talk / throw / skill2). The welltown lane should add its real conditions to that array when it merges.

### 3. Right-hand layout
Unit s = 14.5% of the short side (x touch size). From the thumb's rest point: ATTACK (big) at the corner, JUMP (big) above it, DODGE and BLOCK arced to its left, the four skill buttons (letters F G 3 4, shown only when that slot holds a skill) on an outer arc, the action button above the skills' arc, PAUSE top corner. Safe-area insets (env(safe-area-inset-*) read through a hidden probe; `?safe=t,r,b,l` fakes a notch for the test) keep every button off the notch and the home bar. ATTACK held still holds `keys.atk` (the heavy swing). A thumb sliding from one button into another hands over (attack -> jump); sliding into the gap keeps the old one. No two buttons overlap at size 70%, 100%, 140%, either hand, with or without a notch (asserted).

### 4. Tap menus
Title: tap an item = go in. Save slots, map nodes, store rows, SETTINGS rows: tap = pick, tap the picked one = go in (settings rows turn at once: a plain row goes in, a row with a value steps it, the left half of the value box steps it back; the tab strip and the store tabs are tappable). MAP: a node is walked to along the road (`mapGoal`), a side road is jumped to the way the panel does, a locked node says LOCKED. Anything with no tap boxes gets pill buttons in the thumb's corner: OK / the state's own extras (map: ENTER STORE BEASTS LEVELS CO-OP; slots: PLAY ERASE; store: SELECT MORE) and a BACK pill (ESC). Cards (talk, intro, win, victory, game over...) go on with a tap anywhere. The stick still walks any list. NOT tappable: the skills tree inside the store (tabs and OK / BACK work; the tree itself is stick + OK), the hero pick and the co-op pick (stick left/right + OK), the rebind screen.

### 5. TOUCH settings tab (touch devices and `?touch=1` only; desktop keeps five tabs)
Touch size (70-130%), Touch opacity (25-100%), Left-handed (clears dragged spots), Edit layout (a full-screen editor: drag any button, RESET, DONE; positions are stored as fractions of the screen in `SET.touchPos`), Reset layout, Touch assists, Haptics, Lighter effects. All saved in SET. On a phone the strip reads AUDIO DISPLAY GAME CTRL ACCESS TOUCH so six fit.

### 6. Assists (touch only; a key press puts both back at 1x at once)
Input buffer x1.4 on jump / attack / dodge presses. ATTACK by touch turns the hero to the nearest foe within 1.5 tiles BEHIND him when none is that close in front. Keyboard and pad never see either (asserted: a key attack does not turn him).

### 7. Haptics
`navigator.vibrate` on a hit taken (45 ms), a block (14), a parry (12-36-22), a level-up; a setting turns it off. Android Chrome only: iOS has no vibrate, the call silently does nothing.

### 8. Performance
A phone's first run (SET.touchInit unset, particles and parallax still at their defaults) switches to few particles, near parallax, no drifting motes; "Lighter effects" re-applies or undoes it. The touch overlay costs 0.03-0.04 ms a frame. Measured with the phone emulated: update+draw in the Wood 10.3 ms lighter vs 10.0 ms with MANY particles + full parallax (no difference in a quiet room; the preset only pays where particles and layers are heavy, and a headless desktop GPU is not a phone - UNVERIFIED on a real phone). `tools/frame-cost.mjs` still passes.

### 9. Installable app
`manifest.webmanifest` (fullscreen, landscape, theme/background #0b1410, 192 / 512 / maskable icons, display_override fullscreen then standalone), apple-touch-icon, `sw.js`: NETWORK FIRST for page, scripts, json, images (a deploy always wins; the cached copy answers only when the network fails, so a session never mixes new and old scripts), cache named by `VERSION` (bump to throw every old copy away), audio (126 MB) never cached, the pixel fonts cached. It registers only on https (or `?sw=1` on localhost, never with `?nosw`). The test proves: registers + activates, the page is controlled, 229 shell files cached, no audio cached, a poisoned cached script LOSES to the network, and the game boots with the network emulated off.

## Checks run (named, never the suite)
- `node tools/touch.mjs` (new, in the check list): GREEN. Sections: title taps, settings tabs + rows + persistence, layout editor drag / reset / done, BACK pill, save slots (tap picks, second tap opens, ERASE pill), map (tap walks, tap enters), store (tabs, rows, BACK), reload keeps the settings, stick 8 directions + dead zone + zone edges + outside-zone + multi-touch + touchcancel, buttons (hold, slide, heavy charge, pause), layout fit (3 sizes x 2 hands + a notch: no overlap, inside the safe area, no button in the stick zone), action button (ENTER OPEN SHOP LEAVE TALK TAKE; keeper outside a shop shows nothing; hook FILL POUR DRINK with the right presses; a tap really takes a torch; hidden while hurt), card tap, assists (buffer, auto-face, keyboard untouched), haptics, first-run lighter preset + overlay cost, keyboard path unchanged, a desktop page has no touch UI, PWA files + live.
- PROVEN TO FAIL ON THE BASE: the same file run on a worktree of 46d26d3d (the 9 sections that can run there) gave 26 FAIL lines: BK.touch missing, all 8 stick directions wrong (the old pad has a d-pad, not a stick), no stick at the screen edges, no haptic on a hit, no icons / manifest link / safe-area probe / apple-touch-icon.
- GREEN: frame-cost, settings-tabs, save-slots, map-spacing, hint-shown, architecture, dangling-paths, loading-screen, textfit (menu,settings,slots,store,pick: 826 screens, 0 overflow / offscreen / clipped / truncated / collide).
- Not run (not needed): level/boss checks (no level, boss or foe touched).

## Found on the way (NOT mine, base bug, task chip raised)
`drawMap` throws one TypeError (`PROP.castle.height`) for one frame when a level load starts from the map while a DIFFERENT level is already loaded (PROP is rebuilt in chunks and the map draws between them). Reproduces on 46d26d3d with `BK.press` only. `tools/touch.mjs` therefore tries "tap again goes in" on the node of the wood that is already loaded.

## UNVERIFIED (needs a real phone)
iOS Safari fullscreen / home-screen install / safe areas on a real notch; Android install prompt; haptics; true offline (the emulated one switches the page's network, not the worker's own, so it proves the cache boots, not that a dead network falls through to it - the fallback is a 3-line `.catch`); multi-touch with a real hand; real-phone frame cost; the orientation lock.

## QUESTIONS FOR DANIEL (recommendation built unless it says otherwise)
1. Menus: tap = pick, tap again = go in (slots, map, store); title and settings go in at once. Built. Rec: keep; if you want slots to open on one tap it is one line (the slot hit box).
2. Stick zone is the left 45% and the UP sector is 45 degrees wide (it is also up-slash and ladder). Jump is ONLY the button on touch (ArrowUp-as-jump is a key habit). Rec: keep; widen UP if up-slashes feel hard to get.
3. Assist numbers: buffer x1.4, auto-face 1.5 tiles, haptic lengths. Rec: ship, tune after you hold it.
4. Skill buttons show F / G / 3 / 4, not the skill's glyph (src/skill-glyphs.js has them). Rec: swap to glyphs next, small job.
5. Well Town's FILL / POUR / DRINK needs the welltown lane to push its conditions onto `BK.touchVerbs` (see 2 above). Rec: ask that lane to add it in its own merge, one function.
6. PWA: network-first only, so an installed copy opens as fast as the web, and OFFLINE it starts silent (audio is 126 MB and not cached). Rec: keep; a timed cache fallback would be faster on bad signal but can serve half a deploy.
7. The app icon is a code-drawn placeholder. Rec: real art when you have it (replace `icons/*.png`, bump nothing).
8. Left-handed mirrors the whole layout and clears dragged spots. Rec: keep; per-hand saved layouts would be a small follow-up.

## HOW TO TEST ON YOUR PHONE
1. Same Wi-Fi: on the PC run `node serve.mjs` in this branch's folder, then on the phone open `http://<the PC's LAN address>:5860/` in Chrome (Android) or Safari (iPhone). Touch works over plain http (the service worker and install need https, so use a deploy for those). Add `?touch=1` on a desktop browser with a touch screen if the UI does not come up.
2. Turn the phone sideways and tap once (full screen + landscape lock). Left thumb anywhere on the left half: run, flick up / down (up-slash, crouch, ladders). Right thumb: attack (hold it for the heavy), jump, dodge, block.
3. Walk up to a sign, a door or a torch: the action button appears with its verb.
4. Pause (top corner) > Settings > TOUCH: size, opacity, left-handed, Edit layout (drag the buttons), Haptics (Android only), Lighter effects.
5. Install: open the https deploy, Chrome menu > Install app (Safari: Share > Add to Home Screen), launch from the icon: it should be fullscreen and landscape.
