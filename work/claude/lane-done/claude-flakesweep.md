# FLAKESWEEP (claude/flakesweep) - the suite's known flakes, fixed at the cause

Evidence base: batch69/70/71-check.log (batch7x-release.log does not exist). Only four of the ten names ever FAILED in those three
logs (undercrown-variety + ember-flare + profile-cleanup + profile-leaks, all in batch69; profile-leaks again in batch70). The others
(attack-tokens, ability-poses, mother-pilot, spore-caps, cdp-recovery, ore-ride) are green in all three logs; they are on the list for
being slow (20-210 s) and exposed to the same two causes below, so they got the same fixes. Assertions were not touched anywhere.

| check | cause | fix | verified how |
|---|---|---|---|
| ember-flare ("the page never put up window.BK", 416 s) | the DevTools port was `9300 + random(400)`: two browsers (six lanes) picked the same port, the tool then talked to - and navigated away - ANOTHER session's page, whose evals timed out for the whole 120-poll loop | `--remote-debugging-port=auto`: Chrome binds port 0, the tool reads `<profile>/DevToolsActivePort` (`run.devtoolsPort()` in tools/browser-profile.mjs); cdp.mjs, headless.mjs, profile.mjs, levelvideo.mjs all use it. This is the one root cause behind every "never put up BK / did not answer" red | cdp-recovery (20 fresh pages), spore-caps, ore-ride, undercrown-variety, ability-poses, mother-pilot all run through it and pass |
| undercrown-variety ("and grows back once he is off it") | a broken crystal regrows after `-(4 + Math.random()*2)` s = 400-600 sim frames; the check waited exactly 600. Measured over 12 seeds: 414-595 frames, so a roll near the top of the range failed it | page `Math.random` seeded (new `openPage({seed})`, injected with addScriptToEvaluateOnNewDocument so it survives reload); wait loop 600 -> 800 frames (the regrowth delay's ceiling plus a blocked-regrowth retry). The assertion is the same | ran green seeded (26 tiles break and grow back) |
| profile-cleanup ("killed" left 1; later "normal/failure left a profile behind") | (a) it counted EVERY new bracken-* profile in Temp, so another lane's/suite's just-launched browser (profile made, not yet on a command line) read as this case's leak; (b) after a hard kill `taskkill /T` returns before the tree is gone, and the sweep's one process snapshot still saw the renderers "in use"; (c) fixed port 5991 for every checkout; (d) a 120 s "hung" limit on a page that takes 50 s to open at 100% CPU | (a) each case runs under its own `BRACKEN_RUN` tag (browser-profile writes it into the name) and only that tag is counted, the sweep is called with `--run TAG`; (b) profile-sweep `--kill-orphans` now polls until none of the killed trees is left (condition, not sleep); (c) PORT = env PORT or this checkout's slot `portFor(2)`; (d) hang limit 360 s (still fails a real hang) | see "Run results" below |
| profile-leaks (5-12 leaked profiles, batch69/70) | downstream: a browser whose tool died while its profile was still locked. Under load `removeProfileSync` gave up after ~5 s because orphaned renderers (taskkill /T cannot reach children of an already-dead main process) kept files open | `killHoldersSync()` in browser-profile.mjs: on the 2nd/4th failed delete, end processes whose command line names that profile (only for a profile `isOurProfile` accepts), used by both sync and async removal | not reproducible on demand; passes in batch71. Combined with the DevTools-port fix (no more cross-session navigations/hangs that ended in kills) |
| attack-tokens | already seeds Math.random in the page; no failure in any log (19-93 s, load only) | none needed | n/a |
| ability-poses | no failure logged; unseeded page Math.random during real draw | seeded via `openPage({seed})` | ran green: 60 of 60 |
| mother-pilot | no failure logged; boss fight bot is Math.random-driven | seeded via `openPage({seed})` | refill + normal both win (the check asserts kills) |
| spore-caps | no failure logged; falling clumps / jams use Math.random | seeded | ran green |
| cdp-recovery | no failure logged; reload() waited 120 x 100 ms (~12 s) for a fresh page | wait is a 90 s wall-clock deadline polling the same condition | ran green: 20/20 |
| ore-ride | no failure logged; falling rocks use Math.random | seeded | ran green |

## Harness profile keying (your note about stale cached scripts)
The Chrome profile is already NOT keyed by port: `browser-profile.mjs` makes a fresh `mkdtemp` directory per launch and deletes it, so
nothing is cached between runs; and `cdp.mjs` refuses a server whose `src/lookpass.js` differs from the checkout's. The stale-script
case was a lane running a hand-started Chrome with a port-keyed `--user-data-dir`: that is outside the tools. Nothing to change in the
harness; for hand-started browsers, key the profile dir by checkout path + port.

## Not fixed / learned
- The suite is CPU bound when six lanes run: 50 s to open one page at 100% CPU (observed). Everything that waits on a page now waits on the
  condition with a wall-clock bound, but a 40-minute suite on a loaded machine will still be slow.
- profile-leaks cannot be made deterministic against an outside TerminateProcess of a tool; the sweep is the net, now more patient.
