# claude/ksarfix (SONNET, part A of scratch/brief-ksarfix-1014.md) - off master 2cf3294b

## 1. Hawk-Mistress room entry
CAUSE (measured, tools/ksarfix-shots.mjs): the boss wake intro (main.js updateCamera, "THE BOSS INTRO") slides the camera onto the boss and pushes in 1.5x
(bossZoom). Her courtyard is 46 tiles wide and she stands at its far end, so the camera ran east to her and the hero, just over the door at col 814, ended up
100-180 px OFF THE LEFT EDGE of the picture (hero screen x -99 desktop / -105 mobile-size / -179 at 1080p) for the whole wake; the 320 -> 480-640 view widening
also jumps the camera ~100 px on that same frame. Every other arena is narrow enough that the hero stays in frame.
FIX (src/main.js, intro block, L.arena.hm only): no push-in, and the camera target is the hero/boss midpoint held so the hero stays >= 48 px inside the frame.
Hero off-screen frames in the walk-in: 4 of 26 samples -> 0 of 26 (min screen x 44) at all three sizes (work/ksarfix/{before,after}-{desk,mobile,1920x1080}-herox.json).
Screenshots (door w01 = unchanged, intro w08, mid-room): work/ksarfix/{before,after}-{desk,mobile,1920x1080}-*.png. The courtyard backdrop itself (src/redraw/ksar_set.js
drawCourtyard) spans exactly the arena (x0..x0+46 tiles) and the camera lock keeps the view inside it at every zoom size 320-640: I found no seam/clamp fault there.
NOTE: the headless emulation of a phone does not change the game's internal view (it is the same 640x360 zoom buffer, scaled by CSS), so "mobile" = the 915x412 inner size.

## 2. More shade (tools/ksar-sun.mjs: stretch = a maximal walk along the route out of shade at RUN pace, costed with the real meter from cool; campaign level 39 max hp knight/warden 282, pyro 270, berserker 287)
| | before | after |
|---|---|---|
| sun stretches / shade boxes | 53 / 46 | 74 / 68 (+22 awnings, src/ksar.js, each on a flat spot of the route found by the tool) |
| stretches over 2 s (the drain's start) / over 3 s | 18 / 7 | 0 / 0 (longest 4.0 s -> 1.7 s) |
| worst single stretch, hp (knight/warden/pyro/berserker) | 13.2 / 13.2 / 12.7 / 13.5 | 0 / 0 / 0 / 0 |
| all stretches run through, total hp | 76.5 / 76.5 / 73.3 / 77.9 | 0 / 0 / 0 / 0 |
| a 4 s fight in a stretch: worst / mean hp (knight) | 62.5 / 31.7 | 33.8 / 23.5 (pyro 59.9->32.3; berserker 63.6->34.4) |
| level-1 knight pilot (curve row, report-only) | 671% hp lost a run, 17 deaths | 556%, 15 deaths (hp inside the 150-700% band; deaths 15 vs act-5 want <= 12, report-only) |
Awnings are also cover from the hawks (ksar-hands underCanvas) - more cloth = a little easier hawk fights; flagged. Drifting cloud shadows (BC4 cloudAt) NOT built: moving shade would
make the static stretch rule/walker nondeterministic; static cloth only (question 1).

## 3. SUN NEVER KILLS
src/drain.js: a drain source may carry `floor: n` - D.step never takes the hero below n hp (hp(pp) read through a new optional `hp` accessor, default pp.hp). src/sun-hands.js sets
`floor: 1` on the sun source ('sun' is the only sun path: Caravan, Well Town, Glass Sea, Ksar, Buried City all use makeSunHands). Breath is not a drain source (it has its own code) and an
unfloored source still kills - checked. New check tools/sun-floor.mjs (registered in tools/check.mjs): 30 s and 60 s in open sun from full / 8 / 3 / 1 hp -> hp 1, never dead, no further
damage at 1 hp; shade drains nothing; unfloored 'breath' source drowns; sun + breath together still dies of breath.

## Checks (all green)
node subset via check.mjs: hint-shown, level-quality (gated), welltown 42, curve-gate (3 report-only out of band), glasssea 153 + aloft + slide, ksar 235 + ksar-aloft, caravan/level/slides/worms,
buried-city 278 + levers 30, sun-floor; level-quality ksar CLEARS (curve WARN report-only); scoped textfit --strict: 0 on every column (3321 screens); mobile-perf ksar: 60 fps, p95 17.5 ms, inside budget.
Not run: the full suite, the unscoped textfit.

## Reds: none.

## QUESTIONS FOR DANIEL
1. Cloud shadows: built static awnings only (deterministic for the checks). Want BC4-style drifting cloud shade too (cosmetic-only or a real shade)? Rec: later, cosmetic only.
2. The boss wake now has no push-in on the Hawk-Mistress (every other boss still pushes in): ok, or do you want the push-in back with a camera that frames both?
3. The Ksar curve row is still 15 deaths (act 5 wants <= 12; report-only): the remaining deaths are fights, not sun.
