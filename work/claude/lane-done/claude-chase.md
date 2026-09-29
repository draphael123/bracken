# claude/chase: THE CHASE ENGINE

Branch claude/chase (based on claude/duck 5aeaf3c). Engine only: no level uses it, no existing level changes behaviour.

## What changed
- src/chase.js (new, pure): the chaser, rubber band, speed curve with warnings, contact, autoscroll, start/end lines, beams, level lint, drawing.
- src/main.js (small hook): L.chases opt-in (chasesLoad / updateChase / chaseRespawn / drawChase / drawChaseGlow), camera push in updateCamera, BK.chase for tools, ?chase=demo.
- The cart beam and the boat (lifeboat) beam now ask duckClears instead of reading the down key. Their beam height is pinned at 11 px above the riding hero's feet (a stander at 14 is hit, a ducker at 8 clears), so where they hurt did not move; only what answers them did (holding down while unable to duck, e.g. mid-swing or just hurt, no longer passes).
- tools/chase.mjs (new check `chase`, registered at the end of the tools/check.mjs list); docs/PLAYTEST.md gets a `?chase=demo` note.
- Existing L.slide (Scree rockslide) and the flood are untouched and still their own code.

## API FOR THE LEVEL LANES
Add `chases: [ spec ]` to what build() returns. Positions are world px along the axis (tile = 16). Full field list is the header of src/chase.js. The short form:

    { id:'cavein', name:'THE CAVE-IN', axis:'x'|'y', dir:1|-1,
      trigger:<px start line>, end:<px safe line>, gap0:200,
      curve:[[0,60],[300,80,'THE ROOF GROANS'],[700,100,'IT QUICKENS']],   // [distance travelled, px/s, warning]; every row after the first NEEDS a warning
      rubber:{min:110,max:260,slow:0.35,catch:1.5}, contact:'kill'|'hurt', dmg:45,
      autoscroll:true, look:'rock'|'fire'|'drill', music:'boss',
      beams:[{x0,x1,y /*lowest point px*/,th:6,dmg:14,period:3,up:1.2}] }

- Chaser: advances at the curve speed; rubber band keeps the gap between min (slowed to `slow` x speed, so a hero who runs pulls away) and max (sped to `catch` x, and a leash at max x 1.25 for a hero who outruns it). A hero who stops is caught. gap0 and rubber.min are floored at 64 px.
- Warning: the banner, thunder, shake and a flashing line at the top of the screen come `lead` (1.6 s) of travel BEFORE the speed-up, and the speed-up waits for it. The red glow on the screen edge and a rumble (shakeCam, so the juice budget and reduce-motion apply; gamepad rumble too) rise as the front closes (`glow` px, default 300).
- Contact: 'kill' = damagePlayer 9999 unblockable (death line names `name`, respects god mode); 'hurt' = `dmg` unblockable, the chaser falls back to rubber.min and holds 0.7 s.
- Vertical: axis:'y', dir:1 is down (the Rockslide), dir:-1 is up. The hero's position on the axis is his centre (P.y - 7).
- Autoscroll: the camera's edge is pushed by the front (edge 24 px) and the camera cannot run so far ahead that the hero is off it; only while the chase runs.
- Start / end / checkpoint: crossing `trigger` in the chase direction starts it (chaser at `from`, default trigger - gap0); crossing `end` ends it (banner SAFE, chaser runs on and crashes at the line); a hero already past `end` never starts it. A death puts every chase back to IDLE (chaseReset) unless the hero respawns past the safe line. Put a shrine within 240 px (15 tiles) before `trigger`; `BK.chase.problems()` / chaseProblems(list, checkpoints) lints it, plus a missing warning, rubber.max over 300, a safe line behind the start, a chaser too fast for a hero to pull away from.
- Music: `music:'<TRACKS name>'` plays at the start; the level's own track returns at the end and on respawn.
- Beams: hit test is `beamHit(duckBox(P), duckClears(P, beam.y), beam, time)`. IMPORTANT: the duck only works standing still or while carried (P.ducking needs no walking input). So a beam on FOOT is a wall to wait under: give it period/up so it is raised part of the time, and use plain low beams only where the hero rides (cart, boat).
- Co-op: the engine reads player one (P) and the shared camera only.

## Numbers / checks
Check `chase` was red on the base (5aeaf3c: src/chase.js does not exist, the tool cannot even import) and is green now. Its page part covers: no level's build has L.chases (44 levels), the page without the param has no chase and is not in playtest mode, ?chase=demo is up with bossJump.on set and the save byte-identical after a full run, demo start/warning-before-speed-up/camera invariant every frame/end/crash, a standing hero killed, a death resets the chaser to idle at the checkpoint before the line, hurt config hurts (24 of 30 after the difficulty scale) and holds, a standing hero under a beam is hurt and a ducked one is not, cart and boat beams read duckClears in the source.
Green: chase, duck, juice, boss-jump (all 45), tower-chase, and the 7 required: architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (unchanged, no rebase), npc-removal. ore-ride (the cart) was NOT run (load flake, and the cost rule).

## UNVERIFIED
- The cart and boat beams were changed on reasoning and a source assertion; ore-ride (which rides the cart) is listed below if it ran. A real cart ride under a beam by hand was not played.
- The drawn chaser is a plain jagged dark wall with debris; only checked to not throw (pure test) and that the demo runs. Nobody has looked at it on screen; art is the level lanes' call (look: rock / fire / drill).
- Not tried on vertical chases in the page (pure test only), or in co-op.

## QUESTIONS FOR DANIEL
1. Ducking on foot needs standing still, so a plain overhead beam cannot be walked under while ducked. Built: beams can be timed (period/up) and are intended for the cart/boat where the hero rides. Recommendation: keep; if you want crouch-walking under low ceilings in the Minecart-less chases (Rockslide, Ore Road) that is a change to the duck lane (a slow duck-walk at ~40 px/s).
2. Should the checkpoint rule also MOVE the hero's checkpoint automatically (a silent one at the start line)? Built: no, it is a lint (a real shrine within 15 tiles before the line), because your death-cost direction says shrines are earned. Recommendation: keep the lint.
3. Contact 'hurt' vs 'kill' per chase: built as a per-chase choice, default 'kill'. Recommendation: cave-in and avalanche kill (told, fair, near-instant restart), the Great Drill hurts (45) so the boss chase reads as a fight, not a wall.
4. Beam height for the cart and boat is pinned to the ride (11 px over the feet) rather than the drawn beam's own pixels, which did not line up with the old hit test. Recommendation: keep; the level lane can move it if it redraws the beam.
