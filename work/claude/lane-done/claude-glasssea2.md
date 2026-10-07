# claude/glasssea2 - THE GLASS SEA after Daniel's 10-07 playtest (Opus, 2026-10-07) - STOPPED EARLY (credits)

Base: origin/master b4300130 (batch75). Branch claude/glasssea2. Port 8695 only.

## STATUS

### DONE (committed + pushed, each step green on its own checks)
1. bca7aa1e MIRROR LIGHT (Daniel: "the light clips through the mirrors"). Fixed in the draw, where the problem started:
   - src/glass-sea-hands.js `beamPath`. A beam is drawn from where its light comes from to where it lands:
     - the sun's shaft comes down out of the open sky, and the sunset ray comes in from the west;
     - a fire beam starts at the flame top, and the gaze starts at the wall;
     - a beam ends at a receiver's ring, on the face of a disc turned to the sky (a soft glow and no ring, where before a ring floated above the mirror), or on the face of a wall.
   - The draw order is now: the mirror's post or tripod, then the beams, then the glass, then the mirror's face and dial. So no beam crosses the bronze any more.
   - Every bounce gets a glint.
   - A hood mirror over a fire is open underneath.
   - Mirrors with light going up into them or down out of them (chainB, gaze) stand on a side bracket (`side: 1`).
   - New check in tools/glasssea.mjs: no beam runs up a mirror's post.
2. 2173992d THE CRACK SWARM made obvious:
   - The skitter is bigger and stronger: a 20x14 sprite and a 13x9 body, hp 12, speed 84. It has a violet glow and red-hot eyes drawn over the night's dark.
   - The swarm now first appears at DUSK on the main road. A seam at 329-331, by the obelisk's foot, says "THE CRACK STIRS" with a hiss and a glow, and 3 skitters climb out.
   - The teach beat is a fire at 320 under the shelf, a sign, and a line told where it happens: "THE SWARM WILL NOT CROSS FIRELIGHT". The swarm's twist is unchanged.
   - The bestiary text is updated.
3. 06cabffd TWO MIRROR-PLATFORMING SECTIONS (rocking mirrors). You TURN the mirror, and then its beam HOLDS / FLICKERS / DROPS on the level clock. A gold timer over the disc shows the hold, then the flicker warning in red and white, then the wait. The beam and the glass flicker with it.
   - A (teach), after checkpoint one: mirror pulseA at 170 and a 9-wide SOFT pit at 172-180. A fall costs nothing and puts you back on the lip. The pit is crossed on two glass steps.
   - B, THE HAWK GAP (remix), at 262-283: mirror hawkX lights the west steps up to a pillar at 271-273, and mirror hawkY on the pillar lights the east steps. The two keep one rhythm, out of step: you wait on the pillar. Both gaps are real cracks, with 2 vultures overhead.
   - The section-B foes moved past the gap. The spire overhang went onto the far lip. The terraces were adjusted so nothing bypasses either gap, and the bands row is back to 42%.
   - Glint + nudge spots gs-pulseA and gs-hawk, two signs, and ARCS.pulse.
   - Checks: 16 new asserts in tools/glasssea.mjs (92 in all). The route pilot (tools/glasssea-route.mjs, new turnSet/skip legs, god mode, no foes) has all 7 heroes walking the route on base movement, with 0 falls, 0 lifts and 0 deaths.
   - Green at that point: glasssea, glasssea-aloft, signs, stuck (static + runtime, 73 spots), hint-shown, corpses, one-new-foe.

### NOT DONE
- **THE COLOSSUS rework (item 4)**: nothing has changed in src/glass-colossus*.js. The planned COL block is drafted in my scratchpad (not in the repo):
  - hp 680 and openCap 0.2;
  - tells about 15% quicker: lance 0.98/0.85, stomp 0.72, shards 0.85, shake 0.85, swarm 1.02, wave 0.85;
  - gaps 0.55/0.47/0.38;
  - a new SHARD SWEEP in P1: its arm reaches to the wall and drags back along the floor, !!, jump it or stand on a hold. Tell 0.75 s, 26 damage;
  - a new GLASS QUAKE in P2: the marked floor plates heave up, !!, then stay slick tilted shards for 3 s, pushing you 70 px/s. Tell 0.9 s, 24 damage;
  - the new chains: P1 lance/stomp/sweep/shards/lance/sweep/shards/stomp; P2 swarm/quake/shards/stomp/swarm/quake/stomp; P3 lance/shards/wave/sweep/lance/stomp/quake.
- Also not done:
  - the shelf mirrors starting TO THE SKY;
  - the "TURN THE MIRROR TO HIM" line;
  - the mirror-to-weak-point guide lines and target rings;
  - the bigger OPEN read;
  - the shelf-mirror beam order fix (the same clipping fix, in the arena's drawBack);
  - the pose clock and the part-split body;
  - the bot answers;
  - the marks rows plus `tells --write`.
- **Re-stamps**: level-quality is RED only because these are stale after the level changes (pilot hash, mash hash):
  - `node tools/level1-pilot.mjs glasssea --write`;
  - then `node tools/mash-bot.mjs glasssea --level glasssea --write`;
  - then the boss: `node tools/mash-bot.mjs glasssea --write`.
- **Boss rates**: not measured (`PORT=8695 node tools/boss-rates.mjs glasssea --ways=practiced --profile=human --seeds=8 --jobs=2`).
- Not run: the full suite, and the route pilot with foes alive.

### NEXT STEPS (in this order)
1. Apply the COL block and add the sweep and quake to stepColossus:
   - sweep: a box going from the wall on the near hero's side in to its feet, height 18;
   - quake: plates at the hero's x and at plus/minus 76, then the slick, through a `c.push` world hook in the hands;
   - make newFight start the mirrors at 'sky'. Update tools/glasssea.mjs's "lance into a FACING mirror" test to turn the mirror to face first: that is the design change, not a weaker test.
2. Bot (colPlan):
   - turn a mirror to face in P1 when none faces;
   - jump the sweep (seen, at a distance under about 110 px);
   - step off a quake plate during its tell.
3. Hands drawing:
   - draw the lines and rings from a facing mirror to the chest, from fire to crack to shoulders, and from the sky mirror to the crown;
   - draw the reflected lance beam from the mirror into the chest;
   - make the OPEN read bigger (ring 30, "OPEN: STRIKE", a 60x4 bar, chevrons on the holds);
   - draw the beams before the shelf mirrors;
   - draw the sweep and quake tells.
4. Pose clock S.pose. The keys the COLOSSUS ART lane should draw to:
   - poses: idle (weight shift: lean ±3, the free foot lifting 3-4 px, arms swaying ±2, a 1 px bob), lanceWind, lanceFire, stompRaise, stompDown, sweepWind, sweep, shardShrug, quakeRaise, quakeSlam, swarmCall, shake, waveRoll, phase, stagger (open: slumped, a tremble of 1 px or less: B4), sleep, wake;
   - fields: { key, lean, bob, footL, footR, armL:[dx,dy], armR:[dx,dy] }.
5. Add rows to src/marks.js: BY_HAND (line ~76), answer (~377: jump), height (~622: low) for colossus|sweepTell and colossus|quakeTell. Then run `node tools/tells.mjs --write` once. Route the new lines in src/hint-lines.js.
6. Run boss-rates (8 seeds per hero, campaign level). Tune to 50-60%, with no hero at 0. Then do the re-stamps, level THEN boss. The checks to run: mash 0/6, level-quality, glasssea, glasssea-aloft, glasssea-route, stuck, signs, hint-shown, boss-*.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. The rocking mirrors need a TURN before they rock: the verb stays the level's verb. Rec: keep. Alt: they rock on their own, no turn.
2. The teaching pit (A) is soft: a fall costs nothing. THE HAWK GAP's cracks are real. Rec: keep.
3. The swarm teach sits at the obelisk at dusk (seam + fire). Rec: keep. Alt: put it at the skull's foot, but that is already night.
