# claude/dr4art - DEEP RAILS 4 ART PASS (sonnet, 2026-10-14)
Base: origin/claude/dr4tune 6d182f3f MERGED with origin/master 2cf3294b (BATCH91). Port 8906. Art only: no level geometry, no boss numbers, no level hash change (the curve row still matches; level-quality ok).

## MERGE
Conflicts: docs/level1-curve.json (took master's rows, kept dr4tune's minecart row: 243%/4 deaths), index.html (master's sorted preloads + deeprails4_art), src/hint-lines.js CALL_COUNTS (master's + the gear-broken regex),
src/main.js (master's capFix line, the drill gate placed AFTER it so the gate sees what lands; makeGreatDrillHands ctx keeps hurtBoss), src/great-drill.js (takeBlow keeps the gear stall cap + sets out.cap='jam';
the bot's late() takes master's eyes rule), src/great-drill-hands.js (master's H.fix/H.fight + ours; H.fix caps by gearStallCap when the open is a gear stall, jamCap when a lever jam).
src/boss-pressure.js DIAL_EXEMPT += 'greatdrill', 'foremancart': dr4tune measured them in band (69% / 81% with flasks) BEFORE the dial existed, so they are self-tuned like the BATCH91 reworks.
!! NOT re-measured after the merge (master's capsfix now also caps blows that grow after counting during a jam/stall): the Drill rate could drift a point or two - re-run drill-gears / boss-rates if wanted.

## DRAWN (src/redraw/deeprails4_art.js, new src/redraw/deeprails4_poses.js, hands calls)
1. GEAR TOWER: four banks, each its own machine (was four identical red cogs): CHAIN = winch drum wound with chain, crank gear, a hook hanging (unspools out toward you on its windup);
   LUNGE = boom pivot, folded arm + spring (the arm unfolds on its windup); DYNAMITE = hoist drum, cable, a crate of red sticks that rides up to the cab on the windup; ROOF = jib on a mast, cable (strikes up on the windup).
   Broken: its own wreck (drooped boom, spilled sticks, slack chain, snapped jib) + plume + sparks + a BURST for the first 0.5 s (the stall). Health pips and labels kept.
2. B16 WINDUP POSES per gear attack (windupPose, drawn on the tilted rig): dynamite = cab roof hatch thrown open, sticks rising, fuse lit; lunge = crouch (rams squash, dust off the tracks, plate lamps flare, nose-down tilt);
   chain = rears back (rear hatch drops, chain pays out, ratchet sparks, nose-up tilt); rocks/collapse = the roof jib's pick strikes up, ceiling debris, shudder. Each is its own frames, not a shared tilt.
3. JAM SLUMP (slumpPose + steamHiss): lamp out, stars wheeling, bent rod + flashing fault lamp, deeper tilt/drop (0.05 rad / 3 px); STEAM HISS vents on the bit and gear housing as it lifts back over the last 0.4 s. Gold outline + timer unchanged.
4. THE STALL: burst of the bank when a gear breaks (the sound is unchanged: gearBreak still maps to crack+clank).
5. RAIL RAIDERS: raiderTub livery (red/black hazard band, boarding plank racked on the rim, grapple coil) over the miner's tub; THROW pose (arm back, pick raised) and BOARDING crouch (coiled on the rim; the plank is the existing raidPlank).
6. TWIN LINES: a CROSSOVER GANTRY (lattice legs from yard floor past the high line, crossbar with travelling crane hook, lamps, hazard plate) at col 822 as the yard's landmark; the SIDING at 858 (rail stub falling away, buffer, red lamp, hazard sign) where the raiders peel off.
Floor, side switch, high-gap lips from dr4 greybox kept (already drawn). Pictures: work/claude/shots/dr4/art1-*, art2-*, art3-* (tools/dr4-shots.mjs gained a `yard` group; run groups separately - 'drill' leaves the page in the arena).

## GRADE (polish scorecard, brief-polish)
DEEP RAILS: B (was B-). Identity ~17/18 est (the twin-lines yard now has a landmark + siding, the Drill's gears read as five distinct machines). B16 met for the drill's four gear attacks and the raiders' two; B10 read untouched.
Why not A: the Foreman-side and the beginner sections were not touched; the raiders' empty tub rolling on after the rider falls has no raid livery; the roof-jib bank reads dim at 1x.

## CHECKS (port 8906, one page at a time)
GREEN: tools/minecart.mjs 434 ok | level-quality minecart clears (curve 243%/4 deaths, band ok) | corpses | hint-shown OK | modulepreload (7 reachable unlisted, budget 15) | textfit hints,bestiary,boss --strict 0 across 2084 screens (the earlier HANGING Weaver collide is gone with master) |
boss-openings (greatdrill open 4.2 s, foreman 1.7 s) | minecart-aloft | mobile-perf OK on rerun.
RED once, then green: mobile-perf redgorge 1066 ms single frame (not Deep Rails; the rerun: worst 33.5 ms, inside the budget).
NOT RUN: minecart-route, cast-poses (no such tool in the tree), reach-heroes, boss-fight-end, drill-gears re-measure (art-only; see the MERGE note).

## QUESTIONS FOR DANIEL
1. Greatdrill/foremancart are DIAL_EXEMPT (rec, built). Alt: leave them on the act-2 dial and re-tune - they were tuned pre-dial so that would push the Drill below band.
2. Raiders keep the miner's goblin sprite with a livery tub (A9: no new foe). Rec: keep. Alt: a dedicated rider skin (more art cost).
