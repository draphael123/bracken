# claude/mothermarks - the Mother Cap's phantom tells (LIVE bug) + a mark-integrity check for every boss and mini

Base: master 56c2cf92. Port 8726 only. Every server and Chrome was started by openPage and closed by it.

## The bug (Daniel 10-07)
"the mother root has red and yellow hitboxes at points, but there's actually no animation or nothing that comes out."

## Cause (reproduced on a page probe, ?boss=spore / BK.load('spore'), every mode logged over three phases)
Her MARK table was honest: every marked windup (rootFan, capClap, rootStab, seedRain, sporeVolley, floorSurge, sporeSweep,
rootColumns, sporeWheel) led to a real blow (hits, seeds, vines all logged). What was missing was everything you SEE:
- `drawMother` never read her mode for an attack. Not one windup moved her body (the render at a tell was pixel-identical to
  the render in idle: 0 px on every tell).
- The three zone attacks (floor surge, spore sweep, root columns) were drawn as a yellow-outlined box during the tell and a
  red box while live. Nothing came out of the ground and no spores came out of her - those were the "hitboxes".
- The root stab was a small dust puff hidden behind the hero.

## Fix (src/main.js, drawing only - her simulation and dice are untouched, so the pilot and the mash rows are unchanged)
- `motherPose`: the cap REARS (lifts 22 px, tilts, shudders) for the clap and SLAMS down with a ring; she BEARS DOWN with
  writhing roots at the stalk's foot for every root move; she SWELLS with lit gills and spores gathering under the cap for
  every spore move. The move's length is read as it starts (`poseT0`, set in updateMother).
- `drawMotherZones`: the warning is a dashed line with glowing cracks and thrown dirt (roots) or a drifting haze (sweep);
  the strike is the thing itself - a hedge of root spikes along the floor, twisting root pillars in the marked columns, a
  rolling spore cloud along the sweep - with a faint red wash kept over the live area so where it hurts still reads, and a
  burst of earth or spores as it breaks (thrown from the draw, so the fight's dice are not touched).
- The stab: cracks open under the mark during the tell; a cluster of three root spikes, as wide as the blow (18 px each
  side), comes up on the strike. The fan's cracks run out along the floor before the vines go.
- Zones now carry their `kind`.

## New check: tools/mark-integrity.mjs (added to tools/check.mjs right after `tells`)
Plays every boss and mini from BK.bossJump.table() (40 s each, ~4.5 min total). For every marked windup seen:
1. POSE - the frame at the windup is rendered twice at the same instant, once as it is and once with the creature put back
   in the mode it was in before the windup; the mark is hidden in both (its MARK row blanked for the render) and the dice
   pinned. Identical pictures = PHANTOM POSE.
2. LANDING - within the windup + 1.5 s: the hero hurt or thrown, something put in the world (seeds, vines, movers, waves,
   fires, rocks, bombs, spear rain, roots, creatures, a burst of 8+ particles, an impact ring), the boss's own arrays grow
   (her zones, the Prince's crowns, the cargo marks), the boss body moves (charge/leap), or the strike is DRAWN (4 frames
   after, against the mode before). Never landing over every sighting = PHANTOM MARK.
Proved: run against master's main.js it fails the Mother on 5 tells (0 px each); with the fix every Mother tell poses
(600-2100 px) and lands. KNOWN list (allowed failures) is empty.

## Other bosses it caught
- FIXED: **KING GORM UNDERLEAF `king|chargeTell`** (phase 1-2, on the litter): a !! over a litter that sat perfectly still
  (0 px). The bearers now dig in and rock the litter back, with dust, before the charge.
- Looked at and NOT bugs (the first pass flagged them on 1-2 sightings; the check was then sharpened, and all pass now):
  the Bosun's cargo drop and the Buried Prince's crown throw (the blow fell where the hero was not; it is drawn and spawned),
  the Lance's sweep, the Lampreeve's draw, the Blood Knight's blade, the Cistern Queen's pincer/snap (misses on some
  sightings, landed on others at 120 s).
- Final full run: 183 marked windups seen across every boss and mini, every one drawn and landing. Nothing left to list.
- Not covered by the check: **the Puppeteer** shows no marked windup on himself in 40 s (his puppets carry the tells -
  they are other enemies), and any tell not drawn in a 40 s sample (rare moves) is simply not seen. `MI_SECS=120` widens it.

## Checks (all on port 8726)
- tells: every mark agrees with the blow behind it (792 rows) - green
- answer-tags: 477 told blows answered, 0 untold - green
- boss-read: ok - green
- boss-fight-end: 54 fights (40 bosses, 14 minis) end when the boss dies - green
- mother-cap: green (vm + page)
- mother-pilot: green (refill + normal, 6 heroes; her sim untouched)
- hint-shown: green (no new silent lines)
- mark-integrity (new): green, every boss and mini
- mash: NOT re-stamped - the fight did not change (draw-only; no Math.random added to her update)

## Red
Nothing of mine. One mark-integrity start hit "Runtime.enable did not answer within 15000ms" on a busy PC (the browser
start, not the check); the re-run was clean.

## QUESTIONS FOR DANIEL
1. The live zones keep a faint red wash (22%) under the roots/spores so the hurt area still reads. Rec: keep it. Built: kept.
   (Alternative: drop it entirely and let the roots/cloud alone show the area.)
2. Playtest gate (B9): her blows and timings are unchanged, only how they look - rec: a quick look at ?boss=mother rather
   than a full playtest.
