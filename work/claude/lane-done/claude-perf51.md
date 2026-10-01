# claude/perf51: "Why is the game so laggy now?"

## What was measured
Headless Chrome on this machine (it uses the real GPU, so "2d_canvas: enabled"), visible tab, nothing throttled. Each scene was measured for 10-20 s on
5d25df0 (batch49), 0dcceec1 (batch50) and 7cbde596 (batch51, live). The numbers are time spent in the game's frame callback (mean / p95), long tasks,
GPU-process CPU, draw calls a frame, canvases made a second, getImageData a second and live audio sources.

| scene | 5d25df0 | 0dcceec1 | 7cbde596 |
|---|---|---|---|
| title | 1.6 / 2.7 ms | 1.7 / 2.8 | 1.7 / 2.8 |
| map | 2.4 / 4.1 | 2.4 / 4.0 | 2.3 / 3.9 |
| store | 1.4 / 2.8 | 1.5 / 2.6 | 1.6 / 3.0 |
| wood (play) | 7.3 / 10.8 | 7.6 / 11.3 | 7.1 / 10.5 |
| waymeet | 6.9 / 10.6 | 7.0 / 9.7 | 6.6 / 9.9 |
| undercrown | 10.4 / 14.6 | 10.3 / 14.7 | 10.6 / 15.0 |
| burial | 8.1 / 12.7 | 7.7 / 11.3 | 7.7 / 11.6 |
| boss: mage | 10.0 / 13.8, 4 live sources | 10.2 / 13.7, 4 | 10.5 / 14.2, 29 (synth theme) |
| boss: kings | 9.6 / 13.3 | 11.1 / 14.0 | 9.3 / 12.2 |
| theatre | - | - | 6.0 / 8.2, 200-280 new canvases a second, 0.6 s of long tasks per 15 s |

Draw calls a frame, GPU-process CPU, heap and audio creation rates were the same in every non-boss scene on all three builds. The other things
checked were all the same on the three builds too: entering a wood from the map through the loading screen (also with the CPU slowed 8x so the bar
shows), a save with a full loadout, every hero, the WIDE camera, the way arrow, 1920x1080 at DPR 2, a headed window, and the live site.
A sweep of all 37 levels found no exceptions. The loading screen is clean: once it hides it is display:none and no frame loop is left running.

**Today's two releases did not add a cost you pay every frame in play.** The synth boss themes create 3-6x more audio nodes, but the number
alive stays between 14 and 25 over 60 s, so nothing builds up. The theatre makes canvases all the time (fixed below).

## What does make the game laggy (on every build, and fixed here)
1. **A GPU read-back every frame** (main.js `drawFront`, since 09-15/09-19). A diagnostic coverage test read the foreground sheet with
   getImageData. Because of that the sheet was kept on the CPU, so Chrome had to pull the near layer's GPU art back to the CPU every frame.
   The profile puts ~3 ms of a 7 ms frame there. When the GPU is busy (other Chrome tabs, other lanes' headless runs) single frames take
   100-600 ms. That fits "the GPU process is busy". The sheet now stays on the GPU, and the test only runs under `BK.frontProbe`, which
   src/lookpass.js sets because it is the one tool that reads it.
2. **A full re-bake on every view change** (main.js `setView`, since 09-09): every tile and prop, 1-2 s with the game frozen. It happens when a
   zooming boss wakes, at each respawn in that fight, and with the WIDE camera at every level entry, menu and death. Only the backdrop depends on
   the view size, so setView now calls `bakeBackdrop` (split out of bakeAllG with no changes).
3. **The theatre's tile trim** (src/redraw/theatre_tiles.js): when a flat lands, all tiles are resolved again, and every side-lit block was
   copied to a new canvas each time (5326 canvases in 25 s). There is now one copy per tile and edge set.
4. **The frame loop survives an exception** (main.js `frame`). Before, one throw ended the requestAnimationFrame chain and the game kept going
   only on the 125 ms fallback, at about 4 fps until a reload. That looks like lag, not like a crash.

## Before / after (7cbde596 -> this branch)
- wood: 7.2-7.8 ms -> 4.3-5.1 ms a frame (renderer CPU 78% -> 70%). Read-backs 56/s -> 0. Long tasks ~100-600 ms -> none in most runs.
- boss mage, 40 s: 11.6 -> 8.8 ms a frame. Long tasks 4.1 s -> 0.5 s. Janky frames 15 -> 8.
- theatre: 6.0 -> 4.6 ms. New canvases 200/s -> 25/s. Long tasks 0.57 s -> 0.
- Screens: frames captured after a wide/close view switch in mage and harbor-close are byte-identical before and after. Frames that differ from
  one run to the next on the old build (motes) also differ here.

## New check
`tools/frame-cost.mjs` (in check.mjs) counts all three costs in the page. On 7cbde596 it fails: 120 read-backs in 120 frames, 755 canvases
for one view change (a level load makes 744), 5326 canvases in the theatre. Here it passes: 0, 18 and 1.

## Checks run (alone, all green)
frame-cost, render-layers, comments, homepaths, dangling-paths, audio-assets, boss-music, loading-screen, soundtest, store, store-ui (and
store-preview), theatre, skins, puppeteer, readability, pixels, zoom-coverage, camera-fill, boss-jump; tools/lookpass.mjs wood runs and still reports the coverage through BK.frontProbe.

## UNVERIFIED
- Daniel's own save and settings were not available, and his lag was never reproduced as a difference between builds. If it started today, the
  likeliest reasons are a busier GPU, which makes stall 1 much worse, or an exception that dropped the loop to 4 fps (cause 4). Neither
  could be checked on his machine.
- Still costly and not touched: Undercrown draws ~20,000 calls a frame (all builds); a level load is 1-1.7 s; the HUD timer with tenths
  stamps ~25 new text canvases a second.

## QUESTIONS FOR DANIEL
- When it lags, does the browser console (F12) show a red error? Recommendation: if it does, send it; cause 4 hides any such error as slowness.
- Is the camera on WIDE in Settings? Recommendation: keep it. Before this fix WIDE froze the game for 1-2 s at every level entry, menu and death.
