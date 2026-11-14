# CF2 PLATFORM feel (claude/cf2) - code-only, flag OFF

**Flag:** `CF2_SHIPS = false` in the new `src/cf-platform.js` (`setCF2`). Preview: `?cf2=on`. No settings rows. Not registered in check.mjs.

## Measured first (node, no browser; world frames at 60 Hz, real = world / speed)
Already in batch158 and met, so untouched: coyote 6 world = **10.0 real @60%** / 6 @100% (target >= 8 at 60%: met); buffer 6-7 world = ~10-11.7 real @60% (met); accel to cap 5.5 world = 9.2 real @60% / 5.5 @100%; stop 5.0 world = 8.3 real @60% / 5.0 @100%. Turn is not derived from constants: the browser audit-input table still owes it. At 100% (SPEED 1.0 = the old 0.6x scale) every grace is the world frame count, ie shorter in real time than at 60%; that is the floaty-vs-snap trade, left as is (Q4 rec: keep 60%).
Full held jump, every hero (JUMPV -320): peak 49.42 px, airtime 42 frames, reach (running) 58.1 paladin / 64.3-64.7 most / 74.3 pyro, standing 0. Apex hang (|vy|<62) counted by the sim. Knight short hop by release frame (peak px off->on, airtime off->on): f1 11.31->12.52, 20->19; f3 20.58->20.98, 25->23; f6 32.42->31.64, 31->28; f10 44.31->43.53, 38->35; f14 (no cut) identical.
Because the browser is off-limits for this lane, these are the module's own arc step cross-checked against `src/reach-hero.js flight().rise` (within 1.5 px) and a hand-copy of batch158's arc (exact). The audit-input / feel-platform tables at 60% and 100% are owed in the browser.

## Changes (all under CF2_SHIPS, main.js hunks small)
1. Eased cut: release while rising faster than JUMP_CUT -> vy = min(vy*0.45, JUMP_CUT) (frame 1 not the snap, frame 2 reaches the cut). Note: the plan's `max(...)` form would be the old snap on frame 1, so min of the negatives is used.
2. Held-only apex hang: 0.62 stays while jump is held; a short hop (the cut fired, `P.cfHop`) uses 0.85 inside its apex band. A walk-off fall or a never-cut jump keeps 0.62, so reach models of falls/held jumps do not change. Net short hop: peak within +1.2 / -0.8 px, airtime 1-3 frames shorter (crisper drop).
3. Corner correction list gains +-6; new side lip nudge: rising, blocked sideways by a ledge whose top is <= 3 px above the feet and 2 free rows above it -> step up onto it, carried 2 px. Gives leniency only.
4. Buffer through locks: ALREADY true in batch158, no code (press during hit-stop read before the stop return and jbuf only decays in updatePlayer; the commit jump-lock keeps the press via jumpHeld and fires on the first free frame; jump out of roll/dash allowed; landing has no lock). Commit jump-lock kept.
5. Art beats (apex frame hold, run-start kick): NOT built this pass (jump-feel.js / air-motion.js untouched). Owed to a follow-up; needs a browser strip to judge.

## Node results
`node tools/cf2.mjs`: OK. OFF == batch158 for 9 heroes x stand/run x 5 release frames (peak, airtime, reach exact). ON: full held jump (height, airtime, reach, apex hang frames) identical for all 9 heroes x stand/run (18 rows), also for late releases; short hops within 3 px and never longer in the air; corner/lip tables; wiring greps; hero-move.js untouched. `node --check` on main.js and the module passes.

## Browser proof owed (after release158, one browser at a time, memguard, >= 1500 MB)
reach-heroes (0 new crossings), level-jump, feel-platform, audit-input (the table again at 60% and 100%, OFF and ?cf2=on), herofeel-rookery, boss-jump, jumpfeel timing proof (MISMATCHES 0 for held jumps), one 10 s clip per demo hero: short hop, full jump, bonk-and-slide, a ledge lip at 60%.

## Questions (rec first, builders took the rec)
1. Keep commit jump-lock? REC: keep (done). 2. Keep 60% default, report 100%? REC: yes. 3. Lip nudge feels too helpful in the clip? REC: judge in the ?cf2=on clip, drop lipStep to 1 if so. 4. Build the art beats (apex hold, run kick) as a second CF2 commit? REC: yes, after the browser strip shows the physics part.
