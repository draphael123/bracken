# batch143-qasweep (11-04) - claude/qasweep off claude/batch143 (3bd984d6); code tip 8c1b8326 (+ this report commit on top)
Worktree bracken-qasweep. Not merged / deployed / published. Build under test: `node tools/build-itch.mjs` of 3bd984d6 + my one touch.js fix (922 files, 60.7 MB). Full suite NOT run. All browser runs headless, ONE at a time, >= 1500 MB free checked before each (a retry wrapper waited out two dips; the PC was at ~60% CPU with the boss lane running, so every timing below is a LOADED-PC number).
Shots: scratch\lane-reports\batch143-qasweep-shots\ (d* desktop, m* phone, l* load, c* co-op). New tools (not in the suite): tools/itch-qa-{lib,desktop,mobile,load,coop,paths,probe}.mjs.

## RESULT TABLE (inside the 960x540 cross-site iframe, itch's `allow` list)
| Area | Result | Detail |
|---|---|---|
| Load to title, cold | PASS (slow) | 12.6 s on this loaded PC (8-12 s on earlier runs); 28 requests, ~11 MB body uncompressed |
| Load, warm (itch cache headers) | PASS (no gain) | 12.7 s - the time is CPU (parse 7.9 MB main.js + art bake), not network |
| Load, CPU x4 + slow 4G, cold | PASS (very slow) | 59.8 s to title; main.js alone 12.7 s over 9 Mbps; the bar sat at 2% for 12.8 s while main.js downloaded |
| Loading bar stalls | PASS unthrottled | longest flat stretch 3.5 s ("LAYING OUT THE WOOD", 83%); never stuck |
| Content blocker (24 EasyList/EasyPrivacy URL patterns blocked at the network layer) | PASS | title in 12.5 s, 0 requests blocked/failed |
| Ad-block filename check (tools/itch-qa-paths.mjs) | PASS | 922 paths, none matches a blocker word; top level = index.html, loading-screen.js, main.js, online-guest.js, 38 hashed chunks, audio/, docs/, fonts/, icons/ |
| Third-party hosts at runtime | NOTE | only online co-op: cdnjs (PeerJS 1.5.5), 0.peerjs.com broker, stun.l.google.com / stun.cloudflare.com |
| localStorage in the frame | PASS | progress/slot/settings/roster written; all 7 keys + a marker survive a frame reload |
| Audio starts after first input | PASS | 0 AudioContexts before input; after click+key 1 context RUNNING; theme.ogg then the level's own track (lumbertrail) and 876 sfx fetched; phone: running after the first TAP |
| Keyboard route title > map > Lumber Trail | PASS | Z only; Right moves the hero in real time (61 fps); jump + swing accepted |
| Gamepad (emulated standard pad, __pad hook) | PASS | A alone takes title > map > play; left stick and d-pad move; Start pauses |
| First levels | PASS | BK.load + 300 frames of Lumber Trail, Marsh, Stockade, Sporewood, Kingswood: no errors, own music each, 1.1-3.0 s per level load |
| King Gorm win -> end card | PASS | END OF THE DEMO card; KEEP YOUR PROGRESS built 3633 bytes and Chrome raised thornroad-demo-progress.json; BACK TO THE MAP works (a level-up card opens first - intended); MAIN MENU / CREDITS / FEEDBACK buttons present |
| Locked map past Kingswood | PASS | every node from the Scree Path on is locked in the map data; pushing on / Z does not enter one; caption THE ROAD CONTINUES... shows (cosmetic overlap, see bugs) |
| Phone 375x812 portrait | PASS | "TURN IT SIDEWAYS ... PLAY IT UPRIGHT ANYWAY" gate; no horizontal scroll |
| Phone 812x375 landscape + touch | PASS | touch layer on; tap-only route title > map > play works; every level button >= 44 CSS px (atk 59, jump 52, defend 48, skill 46, pause 44), d-pad 78; d-pad moves, jump/attack fire, nothing stuck after release |
| Touch menu rows | FAIL (soft) | title rows are 18 CSS px tall at 812x375 (HIG 44) - see bugs |
| Online co-op ?join= in the embed | PASS with flakes | host (cross-site frame) + guest frame on ?join=CODE over the REAL internet path: PeerJS loaded from cdnjs inside the frame, broker gave a code, guest joined, picked a hero, host seated player two, guest got a 640x360 picture, guest keys moved player two (x 70 > 170), guest leaving dropped to 1 player. 4 runs: 2 clean, 1 guest stuck on "opening a direct link" for 40 s, 1 host call stalled 30 s after seating. Same-PC loopback; not two real devices |
| Edge (Chromium 156, local) | PASS | whole desktop sweep identical to Chrome |
| Console / network | PASS | 0 errors, 0 failed or 4xx requests in every run (one Chrome map-draw exception, see bugs) |
| Firefox | OWED | no local copy (checked Program Files x86/x64, LocalAppData) and no downloads allowed |
| Safari / iOS | OWED | Daniel's private itch draft (list below) |

## FIXES MADE (claude/qasweep)
- 80d2bf00 src/touch.js: the screen wake lock is only requested when the frame's permissions policy allows it. itch's `allow` list has no screen-wake-lock, so every touch device in the embed logged "Permissions policy violation: screen-wake-lock is not allowed" as a console error (the request was already .catch'd, so players saw nothing). Verified: phone run now 0 errors. One-line, touch-only.
- Test tools only otherwise.

## OPEN BUGS, RANKED
1. LOAD TIME. Title takes 8-13 s unthrottled and ~60 s at 4x CPU + 9 Mbps; the brief's target (< 4 s at 4x CPU) is far off. Cost is CPU: a 7.9 MB main.js (3.0 MB gzipped) parsed, then the art bake ("LAYING OUT THE WOOD" + tiles); the 2nd visit is no faster. Top 3: main.js (7.9 MB parse/compile), c-YHDIIEA7.js (1.7 MB, 0.7 MB gz), the bake steps at 83-95%. Unknown: whether itch's CDN gzips the zip's JS (it usually does); measure on the private draft before optimising. Not small.
2. iOS AUDIO UNLOCK (unverified, high risk): initAudio() runs on keydown, touchstart and pointerdown; iOS Safari has historically only unlocked WebAudio on touchend/click. Test first on the iPhone.
3. TOUCH MENU ROWS 18 CSS px tall (title; the other list menus use the same 9-11 game-px rows). Rows touch, so no dead gaps, but easy to mis-tap. Fix = taller rows or bigger menu scale when touch is on; medium lane.
4. ONE-FRAME TypeError in the map draw (`PROP.castle` is undefined, src/main.js:5468 `PROP.castle.width`): pressing Z on a map node for the 2nd+ level load (reproduced launching the Burning Village after Kingswood, Chrome and Edge). bakeAllG reassigns PROP at the start of every level bake and the map is drawn once before castle is re-baked. Invisible to the player (one frame, game carries on) but it is a console error on every such launch; fix = `PROP.castle &&` guard in the map draw. I did not touch main.js (hot file, not demo-specific, not checked on master).
5. Map cosmetics: the THE ROAD CONTINUES... plate sits over the Kingswood node label when Kingswood is at the top of the view; map header still counts full-game totals (10/53 woods, 3/159 gold) - already question 2 of the itch-build report.
6. Co-op flakes (see table): a connect that sits on "OPENING A DIRECT LINK" is the 40 s case; the guest has CANCEL, the host keeps waiting. Probably the headless same-PC loopback; needs real devices to rule in or out.
7. Harness note: headless's default viewport (978x486) cuts the 540-tall frame; the new tools set 1000x600 (tools/itch-qa-lib.mjs). The earlier batch143-shots are cropped for that reason.

## OWED TO DANIEL'S PRIVATE ITCH DRAFT (Safari/iOS + real sandbox)
iPhone Safari (and iPadOS): audio after the first tap (bug 2); landscape lock / the "turn it sideways" gate; fullscreen button; touch buttons vs the home bar and notch (?safe= was only emulated); localStorage in an iframe (Safari ITP partitions third-party storage: confirm saves survive closing the tab and reopening the page); KEEP YOUR PROGRESS download from a sandboxed frame (iOS may open the JSON in a tab instead of saving); load time on a real phone. Desktop Safari and Firefox: title, audio, saves, gamepad. Real itch iframe: if itch adds `sandbox`, downloads and popups (FEEDBACK / credits links) may need allow-downloads / allow-popups; two real devices for ?join= (one on mobile data) incl. a restrictive NAT (the build has STUN only, no TURN).

## QUESTIONS FOR DANIEL (recommended first)
1. Keep ONLINE CO-OP in the demo? REC: yes - it works inside the embed (code, join, picture, input, drop-out); confirm on two real devices on the private draft and hide it with the demo flag only if that fails. Alternative: hide it now.
2. Is a ~10 s title acceptable? REC: measure on the private draft first (itch's gzip may cut the download; the CPU part stays); only if it is > 15 s on a mid phone, run a load-trim lane (defer the bake behind the title, split main.js).
3. One small lane for bugs 3-5 (PROP.castle guard, touch menu rows, caption position, demo map counters)? REC: yes, one sonnet lane after the freeze.
4. Run the iOS audio check before anything else on the draft? REC: yes - it decides whether phones get sound at all.
