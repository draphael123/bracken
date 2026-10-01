# claude-loadbar: a loading screen with a real progress bar and a dancing hero (2026-09-30)

Base: claude/batch50 5049a98. Branch claude/loadbar.

## What changed (plain words)
- **New `src/loading-screen.js`** (loaded by `index.html` before `main.js`, so the bar is on the glass while the game's own scripts arrive). A pixel bar with the percentage, a line of what is loading (BAKING TILES, PLACING FOES...), and the player's hero dancing on a ground strip beside it. Text is drawn by a built-in 3x5 pixel font so it looks the same with or without the web font.
- **The dancer** is the hero of the current save (`PROG.hero`, in his current skin and sword), playing his own `K.R.dance` frames at 10 fps, the same frames as the H key. First boot with no save: the default hero (knight). In co-op the loading screen for a wood also shows player two's hero, mirrored on the far side of the bar (his `players[1].set`, already baked, so free).
  - Cold boot, before any hero is baked (the first fraction of a second while scripts arrive): a small hooded stand-in figure hops instead (the simplest frames there are). Once the hero exists (right after the scripts are in) it swaps to his real dance. `main.js` used to bake a plain knight at boot and the real hero at the very end; the real hero is now baked once, early (about 0.7 s into the boot), so the dance is available for almost the whole bar, and the wasted plain-knight bake is gone.
- **The bar is true.** Two step lists with weights (boot: 22 steps; wood: 6 steps). A step counts only when its work is done; the number shown catches up smoothly, never passes the true number and never goes back. Never a timer. The fetch step is driven by how many of the page's scripts have arrived, against the count the last boot saw.
- **How a blocking load was made to move:** `bakeAll` and `loadLevel` are now generators (`bakeAllG`, `loadLevelG`) with a `yield` after each stage; `bakeAll()` / `loadLevel()` are one-line synchronous wrappers, so every existing caller, tool and lab behaves exactly as before. At boot, `main.js` awaits between slices of the sprite bakes (top-level await), cutting the biggest single line (about 100 sprite bakes) and the tile and prop tables into slices.
- **Where it shows:** first boot; a wood from the map (`selectStart`); Restart level; the hero trials and practice trial. NOT changed (still synchronous): the Boss Rush (parked), `?boss=` and `?chase=` playtest jumps, the level editor, and every tool (`BK.load`). Under `BK.manualSimulation` (every tool) a drive is always synchronous.
- **No slowdown, no flash.** A load that finishes inside 150 ms runs straight through exactly as before (no frame, no hold). Past 150 ms the screen goes up and yields to paint only when 40 ms of work is waiting (a few ms per yield). While it is up the game's input is held (capture-phase listeners added first) and the main loop stands still (`LS.busy` in `tick`). Reduce-motion is not consulted: the dance stays.
- Small edits outside the new file: `main.js` about 40 lines (import, the generator split, `loadThen` helper, `LS.step` calls, tick guard, `BK.loadG/loadThen`), `index.html` one line, `tools/cdp.mjs` (`noWait`, expose `send`, for the capture), `tools/check.mjs` (name `loading-screen`).

## Every place the player waits (headless, on this busy PC with 5 other lanes running, so read these as relative)
1. **First boot: about 18-21 s here.** Steps (ms): scripts fetched and run 400-1200, hero bake 750, sprite bakes about 5.2 s (nine slices), first tile tables 3-5 s (the biggest single block), props 1.7 s, sky 0.7 s, world map and misc top-level bakes about 2.4 s, first wood 2.0 s. It used to be one frozen "booting..." for all of it (the old boot is one blocking script; the browser cannot paint at all).
2. **Every wood from the map: 1.2 s to 4.3 s** (plain load ms by wood index 0-39: 1224 1273 2101 3272 2804 2375 2776 1923 1488 1472 1887 2642 3410 3204 13468 1479 1224 1346 1318 1239 1657 1785 1779 1653 1785 1950 3112 3078 2160 2201 1594 1294 4341 1494 1651 2205 1912 2056 1971 1981). Index 14 at 13 s was one run under heavy load (UNVERIFIED that it is real; worth a look on a quiet PC). Split of the heavy wood 26: level build 1.6 s, tiles 0.1, props 1.0, sky 0.2, foes and entities 1.0 s. Most of a wood load is the palette-dependent tile, prop and backdrop re-bake (`bakeAll`), the rest is the level build and entity spawn.
3. Restart level and the hero trials: the same wood load, now behind the bar.
4. Not slow, not changed: respawn after death (no level load), the world map itself (baked once inside the boot, 0.5 s), scene changes inside a level.
5. Not covered: the Boss Rush and playtest jumps (parked / dev only). Audio is created lazily on the first key, not a wait.

## Checks
New: `tools/loading-screen.mjs` (name `loading-screen`), five groups, all green:
- wired before main.js;
- the boot bar reaches 100% only because every step ran (true progress 100% BEFORE the screen drops, never forced), monotonic, 48-88 distinct values;
- a fast load (0-1 ms) shows no frame and holds nothing;
- a 540 ms load shows the bar, it is monotonic to 100%, the hero region changes through 4+ different dance frames and is not empty, a keydown during the load does not reach the game, and the screen lets go afterwards;
- the heaviest real wood through `BK.loadThen` shows the bar, ends at 100% and builds exactly the same level as `BK.load` (grid hash, entity count, size);
- no page errors through all of it.

**Fails on the old code:** run against 5049a98 it stops at the first assertion (`src/loading-screen.js is missing: there is no loading screen`); its runtime assertion (`typeof window.BKLoad`) fails there too.

Green on this branch: loading-screen, dances, skins, settings-tabs, progression-runtime, audio-assets, dangling-paths, homepaths (see the final message for cdp-recovery).

## Capture
`work/claude/lane-done/claude-loadbar-before.png`: the old boot as the player sees it (the game script blocked, page as it stands: one dim "booting..." in a corner and nothing else, for the whole 18 s).
`work/claude/lane-done/claude-loadbar-after.png`: the loading screen at about 80% of a boot, the knight mid sword-salute beside the bar.

## UNVERIFIED
- Real-phone feel: only headless Chrome. The polling of the script count, the MessageChannel yields and the touch input hold have not been tried on a phone.
- The 150 ms rule was verified with synthetic generators (0-1 ms fast, 540 ms slow), not with an actual sub-150 ms wood (no wood loads that fast on this PC).
- The weights come from this busy PC; on a quiet machine the shape may differ a little, so the bar can be a bit uneven at the tile and prop steps.
- The co-op dancer for player two exists in code (`players[1].set`) but the check does not open a co-op wood.

## QUESTIONS FOR DANIEL (recommendation first; the conservative option is built)
1. **Show a cold-boot stand-in hero, or only the bar until the hero exists?** Built: a small hopping stand-in for the first second, then the real dance. Rec: keep the stand-in (never blank).
2. **Hold 100% for a beat so a dance finishes?** Built: the screen drops the instant the load is done (no added time). Rec: no, keep loads fast.
3. **A tip line under the bar?** Built: only what is loading. Rec: leave it (teaching text is routed by hint-lines).
4. **Cover the Boss Rush and the playtest jumps?** Left synchronous (parked / dev). Rec: leave.
5. **The first tile bake (3-5 s here) is the longest freeze left inside the bar.** Splitting the deep-dirt bake would smooth it. Rec: a small polish lane if it still feels chunky on your machine.
