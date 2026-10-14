# claude/colossusrework - THE GLASS COLOSSUS rework (Daniel's 10-13 playtest)

Base: origin/master 7d920edb (claude/flasklever NOT merged - the Colossus is exempt from its dial; global flasks untouched).
Brief: scratch/briefs-boss-reworks-1013.md section 4, built in its order. Commits: 0a821a87 (1), 08adf956 (2+3), tune, check fixes, stamps.

## 1. The platform bug (drawn as a platform = solid; not solid = not drawn)
- Cause: a respawn puts the grid back as built (main.js spawnEntitiesTail -> grid0), so every fused bed tile went back to AIR, while
  src/glass-sea-hands.js kept the beds' laid count (b.set) and the beams still held them: glass + beam drawn, nothing to stand on
  (THE STEPS' BRIDGE and the vault stair beside the last checkpoint, the head road, the first stair...).
- Fix: reset re-lays every drawn bed tile (relayBeds), the update reconciles every frame, and drawWorld draws a fused tile only while its
  cell IS glass. Mirrors/beds still keep their state through a death (the existing design), now consistently.
- New check tools/colossus-respawn.mjs (page): fuse every bed, wake him, make him WALK to another station, fire his lance, kill the hero
  mid-lance, respawn -> every drawn bed tile and hold is ONEWAY, no solid arena cell without a drawn hold, and the hero LANDS on samples
  of each. PROVED RED on 7d920edb (44 drawn-not-solid tiles, the hero fell through), green now.
- Same rule for his holds: they are re-laid every frame (layHolds), cleared when he dies (they were solid and undrawn after his death),
  and the level's generated glass pedestals no longer stand under them (src/island-posts.js honours L.machineCells - the pedestals were
  left hanging in the air when he walked).

## 2. He moves + a wider arena
- Arena 40 -> 64 tiles (GLASS.W 648 -> 672; only the arena changed - next week's GLASS SEA 2 is free to build on the rest).
- THREE STATIONS (cols 16/32/48, wakes on 32), FOUR shelf-mirrors (8/24/40/56: +2), each with its own brazier (6/22/42/58).
- THE WALK (told): walkTell 0.9 s (weight back, IT STRIDES, ground shake, gold arrow to the station), a slow stride 54 px/s, a footfall
  every 0.6 s (step sound + shake + THE TRAMPLE: a small red bite under the landing foot, its mark drawn). Two walks a chain per phase,
  toward your side. His holds are re-seated a column at a time and carry a climber. Never mid-opening (B4), no phase change mid-stride.
- The mirrors still reach him: the lance runs to the first FACING mirror on its side; the night fire and the dawn reach him only from his
  FLANK (the mirror either side of his station) - a fire/sky mirror further off says TOO FAR FROM HIM. Moving re-plans the mirrors.

## 3. Two new attacks (B16 own poses, B10 read, not red-only)
- THE GAZE (!!, P1 + P3): gazeWind/gazeSweep poses; told 1.15 s - every disc's SHADE (and the dark beyond a FACING mirror) is laid on the
  floor, the start blinks at the far wall, "!! HIS GAZE: INTO A MIRROR'S SHADE"; then a white-hot spot sweeps wall to wall with a ray from
  his eyes. Answers: break line of sight (a disc's shade, behind a FACING mirror - "THE MIRROR CATCHES HIS GAZE"), or up on his hips.
- THE SHARD LUNGE (!, YELLOW - block/parry, P2 + P3): lungeWind/lungeThrust poses; a glass spear driven at the MIRROR nearest you (or at
  you): its mark is drawn, "! THE LUNGE: OFF THE MIRROR, OR BLOCK"; it erupts and spears that mirror round to the wrong notch
  ("IT SPEARS THE MIRROR ROUND: ..."). Drives you off the mirror you hide behind.
- B17: 10 distinct told attacks (lance, stomp, sweep, shards, shake, crack, quake, wave, gaze, lunge) + the walk; the central mechanic is
  the level's own verb (TURN the mirrors / bend the light). Marks rows added (src/marks.js).
- Lab bot (colPlan, human eyes): into the shade/caught dark for the gaze (fumbles one in five - missShade, like missBait), off the mark or
  a shield block for the lunge, out of his path on a walk, rides the holds; baits its FLANKING mirror for the lance; turns a flanking
  mirror to the fire / sky.

## Tuning (with flasks, human profile, campaign level L38) - he is exempt from the flasklever dial
Every blow ~75% harder (stomp 60->108, shards 37->74, crack 52->92, wave 53->92, sweep 47->92, quake 45->82, lance 92->124, shake 29->36;
new: gaze 90, lunge 84, trample 40), gaps 0.45/0.4/0.32 -> 0.3/0.27/0.22, an opening may take 13% (was 10%).
| run | knight | warden | pyro | total |
|---|---|---|---|---|
| BASE 7d920edb, kit (6 seeds) | 6/6 | 5/6 | 6/6 | 94% |
| BASE dry (3) | 1/3 | 2/3 | 2/3 | 56% |
| NOW kit (10 seeds) | 6/10 | 5/10 | 10/10 | **70%** (in band, top edge; mean fight 125 s) |
| NOW dry (3) | 0/3 | 0/3 | 2/3 | 22% |
Note: the pyro is the strong hero here (10/10); the warden the weakest (5/10) - none at 0/N with flasks. Dry is low by design (B6: flasks).

## Checks
green: tools/glasssea.mjs (153 checks, +27 new: stations, walk, holds re-seat, trample, gaze shade/caught/chin, lunge yellow + spear,
flank relay, B17 count, B16 poses, bot answers), colossus-respawn (new), damage-caps, boss-openings, boss-fight-end, boss-read, untold-told,
tells, mark-integrity (glasssea), hint-shown, arena-shut (glasssea), textfit --strict boss scope (0), reach-heroes glasssea, stuck --static.
Deliberate test changes (stated in code): glasssea.mjs arena forty -> sixty-four tiles; chain moves picked by name not index; the relay
test uses a FLANKING mirror and stands 280 px off (the old distance); the shake test window 5 -> 7 s (the first lance runs to a farther wall).
cast-poses: the cast-poses tool is not on master - the six new pose keys are asserted distinct in glasssea.mjs instead.
STAMPS (re-stamped level THEN boss): level1-pilot --write + --curve; mash-bot --level glasssea --write (every hero dies in the level), then mash-bot glasssea --write: the boss holds 0/6 mash wins; level-quality glasssea CLEARS THE BAR.

## Reds / not mine
- textfit --strict full run: 3 non-Colossus findings (coophelp page 2 OFFSCREEN/COLLIDE, fallingtower + fair sign COVERS) - other screens, not touched here.
- One page check (hint-shown re-run) briefly overlapped the tail of the textfit run (two headless browsers for ~1 min) - my slip, reported.

## ART (for a sonnet art lane)
1. THE WALK: real stride frames for the legs/feet (the pose clock gives walkWind/walkStride values only), a dust puff per footfall; his
   holds snap a column (16 px) at a time while the body glides - ease the slabs' drawing to his centre.
2. THE GAZE: an eye-flare for gazeWind, a proper light cone/ray and a burning floor spot (now a line + a 24 px bar), the shade bands
   (now flat violet strips) as real shadows behind the discs, a glint where a facing disc catches it.
3. THE SHARD LUNGE: a glass spear prop in his hand (now a thin line), its eruption at the mark, the spear striking the disc round.
4. The two new shelf-mirrors reuse drawShelfMirror; the four braziers are the plain campfire; TOO FAR FROM HIM wants a dim beam stub.
5. tools/colossus-art-shots.mjs now has walk / gaze / lunge sheets (filter: walk,gaze,lunge).

## QUESTIONS FOR DANIEL
1. Through a death the mirrors and the fused glass KEEP their state (now re-laid, solid). Rec: keep (no re-solving the steps each retry).
   Alternative: reset the rule on a death. BUILT: keep.
2. He walks TOWARD your side, twice per phase chain, and a footfall tramples (40, red, marked). Rec: keep the trample (it is what makes
   standing in his path matter). BUILT: as recommended.
3. The night fire and the dawn reach him only from his FLANK (the mirror beside his station); the lance from any facing mirror on its side.
   Rec: yes - his walk makes you re-turn mirrors. BUILT.
4. The difficulty came mostly from heavier blows (a sweep is ~1/3 of a L38 bar) rather than more health (fight ~125 s). Rec: keep;
   alternative is +15% health and lighter blows. BUILT: heavier blows.
5. The new moves ship on greybox placeholders (it is a rework of a boss that has art). Rec: ship when green, art lane in the next batch. 
