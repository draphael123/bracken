# claude/screenfit - Screen fit + Resolution (Daniel 11-08)

## What changed
- NEW src/screenfit.js: pure maths (pictureScale, pictureRect, resFactor, cleanFit/cleanRes, cycle, toGamePx, wholeScale).
- src/main.js: resize() uses it. SET.fit 'sharp'|'fill' (default sharp), SET.res 'native'|1280x720|1600x900|1920x1080|2560x1440|3840x2160 (default native); readSettings cleans both (old saves -> SHARP/NATIVE).
  Rows 'Screen fit' and 'Resolution' (menu handler, value text, tooltip lines). Draw sites use the rounded picture size PW/PH instead of VW*S/VH*S (identical under SHARP). Scanline pattern period = round(S). Mouse toGame uses disp.width / rect.width (exact for any backing size).
- src/settings-ui.js: rows added in PICTURE after Full screen. src/touch.js: layout cache key uses round(S*100) (S|0 would not refresh on a float S). docs/updates.json: batch 155 entry with the requested line (coordinator: fold into the real batch number). tools/screenfit.mjs + wired into tools/check.mjs pure-node list.

## Decisions
- RESOLUTION lowers the DPR factor (same mechanism as the phone half-res path): backing = native x min(1, rw/nativeW, rh/nativeH), CSS size stays the window; index.html already has image-rendering pixelated/crisp-edges (verified in the page: computed 'crisp-edges'). lowRes() (phones) skips it: phone path wins.
- Under SHARP, RESOLUTION still floors the scale on the smaller canvas (e.g. 3440x1440 at 1280x720 -> backing 1280x536, S=2, borders). It is meant to be paired with FILL.
- 'Pixel scale' row stays: it caps SHARP. Under FILL the row shows N/A and left/right does nothing.
- FILL at non-integer S: nearest-neighbour, so some game pixels are 1px wider/narrower (inherent). Picture is 16:9 so an ultrawide still has side bars; FILL fills the height (3440x1440: S=8 both modes, so SHARP and FILL are IDENTICAL there - 1440/180 is whole). FILL only differs when the height is not a multiple of 180 (1366x768, 1920x1200, 1080p laptops at odd zoom).
- online-guest.js has its own separate geometry (already supports fractional S); untouched.

## Checks
- node tools/screenfit.mjs: ok. node --check src/main.js touch.js tools/check.mjs: ok. tools/ship-fixes.mjs: ok. Full suite NOT run (per primer); tools/settings-tabs.mjs (needs Chrome) not run - LEGACY_ROWS unaffected (rows only added).
- Stills (one headless Chrome, 3.3 GB free), scratch/lane-reports/screenfit-stills/: 3440x1440-sharp.png, 3440x1440-fill.png (identical, see above), 3440x1440-fill-res1280x720.png (backing 1280x536, CSS 3440x1440), 3440x1440-sharp-res1280x720.png, 1366x768-sharp.png / 1366x768-fill.png (S 4 vs 4.27).

## Unverified
- Not played through in a browser with touch/pad menus: Settings row cycling, touch overlay at FILL + RESOLUTION, scanlines at float S looked at only by code. The menu row values on the DISPLAY tab were not screenshotted.
- docs/updates.json batch number 155 is a guess.
