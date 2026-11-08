# FASTLOAD (claude/fastload) - code-only, no browser. NOT merged, NOT deployed.
Branch claude/fastload, worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-fastload, off master 95bc267a4. Tip: see `git log -1` on the branch (one commit).

## (a) What loads before the title is playable (measured from code + a real itch build, 95bc267a)
The surprise: most of the lazy / slice work already existed. Findings:
- BOOT PAYLOAD = 23 script files, 11.56 MB (main.js alone 8.33 MB, c-VNCDUQA4 1.85 MB, c-ZRJBQGVR 0.6 MB, c-MBFKOQPO 0.32 MB, rest tiny) + the title track theme.ogg 1.69 MB (fetched at the first press, initAudio -> loadTrack(wantTrack)) = **13.25 MB**. Art is baked procedurally in JS (no image sheets), so there is no art payload; the boot cost beyond bytes is CPU (the baking steps the existing bar already weighs).
- NOT at boot: music. loadTrack(name) is already on demand: title/menu track at the first press, the level's track on play, the map pre-fetches the hovered level's track, the arena boss track is preloaded 100 tiles out. Sound Test fetches its own file on demand. Nothing loads "all tracks". (Guarded now, see (c).)
- Streamed after the first press: 876 sound clips, 7.9 MB, 8 lanes, low priority, and paused whenever a music file is in flight (claude/marsh3). Of that, 372 voice clips + ambient one-shots = 4.46 MB.
- Rest of the 62.2 MB site (zip 54.9 MB) is the 37 on-demand music files + ambience beds (~43.9 MB incl. theme counted in boot above).
Before == after for the zip: **924 files, 62.2 MB, zip 54.9 MB** (this lane changes ordering, guards and the bar, not the shipped set - see (b)).

## (b) Slice cut - already complete for music; added the guard
build-itch.mjs already ships only the music the 13 DEMO_IDS levels, their arenas/glades/minis and the menus can ask for (38 of 144 tracks; 106 left out), plus all SFX, ambience, 2 fonts. No art sheets exist to cut. I did NOT prune SFX: clip names are built at run time (vo_<kit>_<act>, imp_<mat>[H], step_<mat>); 81 of 197 manifest names are not literal in the bundle and a wrong cut is a silent missing sound. Possible later win: voice kits of foes absent from the 13 levels (<= ~4 MB, 7% of the zip) - needs a foe->kit map; rec: skip for Sunday.
NEW `sliceGuard` (tools/build-itch.mjs, runs in every build and so in itch-build-check): (1) every music name a slice level asks for is a shipped file or a synth name audio.js knows (musicKnown) (30 names checked); (2) every music.play/preload('literal') in src/ that has a file is shipped, except NOT_IN_SLICE (gqjudge = Goblin Queen, with the reason) (4 literals); (3) shipped files exist. Negative-tested: removing chieftain.ogg from the keep set throws.
itch-build-check also now asserts: guard counts, window.__BOOT_FILES matches the shipped sizes/preload list, boot payload < 16 MB, audio.js keeps core-first clip order and has no eager all-tracks load.

## (c) Lazy music
Already lazy (see (a)), so the work was making the rest of the boot cheaper and proving it stays lazy:
- src/audio.js: sound clips now load in rank order - core fight/walk sounds (1.5 MB) first, footsteps + r_/bd_ recordings (1.9 MB), then voices + ambient one-shots (4.5 MB) last. Stable sort; a clip still loading plays its synth as before. `sfxLoadProgress()` exported (read-only). Sound test / music settings untouched.
- itch-build-check guards "no eager load of every track".
Full game behaviour otherwise unchanged.

## (d) Loading bar + tips
A pixel bar with %, step label and rotating tips already existed (src/loading-screen.js). Changed:
- Bar by BYTES: the itch build writes `window.__BOOT_FILES = {file: bytes}` into index.html; the 'modules' step now moves by bytes arrived (main.js = 72% of it) instead of 1 of 23 equal files (it sat near 0% until the 8 MB main.js landed). Falls back to the old count when absent (full game / ?demo=1 on vercel unchanged).
- DEMO_TIPS (6 lines, no key letters because keys rebind) shown first, then shared TIPS minus the desert-sun tip; full game uses the exact old TIPS list and random start. All lines wrap to 2 rows (<= 121 chars).
  Lines: THE DEMO: THE ROAD UP TO KING GORM / saves in this browser / boss blows are told (windup) / five heroes + CHANGE HERO AT THE INN WARDROBE / local co-op on title / first load is longest.

## Verified (all node-only, no browser)
node --check on all 4 edited files + main.js; `node tools/itch-build-check.mjs` ok (924 files, boot 12.6 MiB, zip 54.9 MB, CRCs good, repo untouched); `node tools/demo-cut.mjs` green; `node tools/audio-assets.mjs` ok; `node tools/modulepreload.mjs` ok (9 missing, budget 15); tipList(true/false) sanity script. NOT run: tools/check.mjs, uiscreens.mjs (uses cdp.mjs/Chrome), loading-screen.mjs, music-priority.mjs, soundtest.mjs (browsers).

## OWED (browser, once a slot is free)
1. `node tools/itch-embed-page.mjs` + itch-qa-load.mjs on the fresh zip: confirm the bar climbs by bytes (no stall at ~0%), demo tips show, title plays, music starts in level 1, no console 404.
2. tools/uiscreens.mjs (static tips assert imports TIPS) and tools/loading-screen.mjs once (the page-level bar test).
3. A throttled (Fast 3G) itch load to see real time-to-title; I cannot measure seconds without a browser.

## Risks
- The 8.3 MB main.js (one bundle of the whole game, incl. non-slice levels) is 72% of boot and is the real first-start cost; itch should gzip it (unverified here). Real fix = trimming it: lazy `import()` of non-slice level modules in the demo build or esbuild splitting per level - bigger lane, not safe for Sunday.
- Disk was at 0% free during this lane (C: full); I removed only my own scratch builds. Worth a df check before the Sunday build.
- loading-screen.js now imports demo-flag.js (2 tiny modules): full game fetch list +0 new (already imported by main).

## Questions (rec first)
1. Ship now? Rec YES: behaviour-neutral for gameplay, bar/tips/ordering only; run owed item 1 first.
2. Lane for trimming main.js (demo-only lazy chunks for non-slice levels)? Rec YES after the demo, it is the only big lever left (could cut boot 11.6 -> ~5 MB).
3. Prune voice kits not in the slice (<= 4 MB)? Rec NO for Sunday.
