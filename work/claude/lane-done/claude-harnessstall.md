# HARNESS STALL (tools-only) - claude/harnessstall
Tip: see `git log` (last commit cd646ab1 + this report commit). Not merged, not deployed. Touches tools/browser-profile.mjs, tools/cdp.mjs, tools/headless.mjs only.

## Root cause
1. TIMER THROTTLING (confirmed, load-leak). A headless Chrome page nobody looks at counts as hidden. After ~5 min Chrome's intensive wake-up throttling lets chained timers (setTimeout used to yield in loops) fire once a minute. load-leak's section 2 audit does 46 yields + 6 gc waits in ONE Runtime.evaluate, so after the two leak lines it sat in that evaluate until the guard killed it. Before: load-leak printed both leak lines at ~100 s, then hung (killed at my 420 s cap; gate: 900 s). No launch flag against throttling existed anywhere in tools/.
2. A WEDGED/CRASHED PAGE gives no reply, ever (pixels). Pixels (`headless.mjs floats`) has no timers at all, so throttling is not its cause. Seen once in my runs: after 62 clean levels one floatLab call (sealedpyramid) never answered and every later evaluate on that page also never answered (sealedpyramid alone: 1.4 s; the full 69-level walk re-run: no stall, 60 s). So the page itself wedges intermittently (renderer hang/crash under load; the gate was running beside me); cause inside Chrome not isolated. headless.mjs had NO wall-clock bound on send, and cdp.mjs's was 30 min, so the guard's 900 s was the only stop.

## Fix (no check's pass criteria touched)
- browser-profile.mjs launchBrowser: every `--headless*` launch gets --disable-background-timer-throttling, --disable-renderer-backgrounding, --disable-backgrounding-occluded-windows, --disable-features=IntensiveWakeUpThrottling,CalculateNativeWinOcclusion (covers cdp.mjs, headless.mjs, pool, levelvideo, profile).
- cdp.mjs + headless.mjs: Inspector.enable; Inspector.targetCrashed / socket close/error immediately rejects every pending call and all later ones ("the page CRASHED ..."); a timed-out Runtime.evaluate error now ends with `- evaluating: <first 160 chars of the expression>`. headless.mjs send gained the wall-clock bound it never had (timeout+1 s).
- headless.mjs floats: each 6-level chunk bounded to 240 s (normal chunk 5-20 s), so a wedged page fails in 4 min naming the chunk, not at the guard's 900 s.

## Timings (alone, port 8791, one browser at a time, gate 132 running)
| check | before | after |
| load-leak | stall (leak lines at ~100 s then hung; gate 900 s guard) | ok 113 s, ok 119 s |
| crouch-feet | gate: 900 s guard (stalled) | ok 64 s, ok 61 s |
| pixels | gate: 900 s guard; my pre-final-code run: 900 s guard TIMEOUT (with only the throttle flag) | ok 71 s (53 levels) |
Honest limit: pixels' stall is intermittent and I could not reproduce the wedge a second time or find its Chrome-side trigger. With the final code a recurrence now fails in <=4 min with the chunk's level list in the message (or at once if it is a crash), instead of costing 15 min. crouch-feet and windcaller-gusts both use openPage, so both get the throttle flags; both stall patterns were consistent with (1) and crouch-feet passes in ~1 min now. windcaller-gusts not run (not requested explicitly; same helper).
No real reds seen in any of the three.

## Questions for Daniel (rec first)
1. Merge these three tool files into the next integ? Rec yes (tools-only, no game content).
2. If pixels still wedges in a gate: rec add a one-shot retry of the failed chunk on a fresh page (not built; needs a real recurrence to design against).
