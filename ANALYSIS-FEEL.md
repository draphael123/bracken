# Combat, impact and jumping: what BRACKEN has, what it is missing, and what I would do

An audit of how the game feels under the hands, rather than what it contains. Everything marked **DONE** is
already in and deployed; everything else is ranked by how much feel it buys per hour of work.

## What is already there (so we do not rebuild it)

**Impact**: hitstop (now weighted), camera shake with an amount setting, zoom kick, sprite squash, impact
sparks, rings, streaks, particle bursts, damage numbers, gamepad rumble, kill flash, slow-motion on a boss
kill, after-images, per-surface footstep and landing sounds, 21 creature hurt voices, a tell sound on every
boss wind-up.

**Combat**: a combo counter, the third-cut heavy, riposte after a block, projectile parries, chip damage
through a non-perfect block, a dodge roll with i-frames, the plunge and the pogo, guard-break on the new heavy
blow, stagger, sunder, bleed, execute, and packs that flank.

**Jumping**: variable jump height (release cuts it), coyote time, a jump buffer, wall cling and wall jump,
drop-through one-ways, springs, vents, gusts, swings, and now rising piers.

That is a lot. The gaps are in *how* these fire, not whether they exist.

## Done in this pass

1. **The arc.** One gravity for the whole jump is the flattest a jump can feel. The rise now eases to 0.62 g
   near the apex (12 frames of hang, measured) and the fall is 1.2×, so the top of the jump is somewhere you
   can aim from and the landing arrives when you expect it. Height unchanged (49 px, three tiles) and the whole
   reach suite reports identical numbers — nothing became unreachable.
2. **Fast fall.** Down in the air doubles gravity with its own terminal velocity (380 vs 270). The old cap was
   eating it.
3. **Coyote time off a mover.** Stepping off a raft or a rising pier gave *no* grace. That read as cheating.
4. **Corner correction.** A jump that clipped a block's lip by a pixel stopped dead; it slides past now.
5. **Weighted hitstop.** The pause scales with the damage, leans harder on a heavy blow (plus a ring and a
   steel impact), and eases off on bosses so they do not stop the world every time you touch them. A hard
   landing holds a frame. A run of swings climbs in pitch.

## Done in the second pass (all five combat items, all five platforming items, both camera items)

**Combat**
1. **The parry window**, for everyone: six frames from the shield going up (eleven with the PARRY talent). It
   costs no stamina, gives twelve back, staggers whatever swung (a boss too, briefly, and a small foe is thrown),
   leaves the next blow a riposte, and lands with a stop, a zoom kick and a ring.
2. **Hurt poses** for the six commonest creatures (sprig, pike, sporeling, deckhand, boarder, marine).
3. **Air combat**: a hit in the air holds you up; a kill in the air throws you back up.
4. **The run of blows, shown**: a chevron per swing over the shoulder, the third in gold.
5. **Knockback that is the blow's**: scaled by damage, half again on a heavy, and a heavy from below lifts them.

**Platforming**
6. **The mantle** — seven pixels short of a lip and moving into it, you catch it.
7. **The earned run** — a fifth faster after most of a second in one direction, with dust and streaks.
8. **The dash** — double-tap a direction, 265 for a sixth of a second, eight stamina, no i-frames, no new key.
9. **Momentum out of swings and rafts** — what the rope gave you, you keep.
10. **A landing you can leave early** — a jump or a dodge clears the recovery.

**Camera**
- Leads your speed as well as your shoulders.
- Holds the frame for half of one as a boss commits to its tell.

## Combat: the five I would do next

1. **A parry window on melee, not just on projectiles.** Blocking already has a perfect-block; a 6-frame
   window at the start of a block that *staggers the attacker and refunds the stamina* would turn blocking from
   a damage sponge into a read. The game already has `e.stagger`, `P.riposteT` and a parry sound — this is
   mostly a timer and a colour tell. **Biggest single combat win available.**
2. **Hit reactions on the foe, not just a flash.** Every creature has frames; almost none has a hurt pose. Two
   frames per common foe (a recoil and a stumble) would do more for impact than any camera work. Start with
   the eight foes you meet most (sprig, shield, pike, cutlass, boarder, marine, sporeling, soldier).
3. **Air combat.** A hit in the air should hold you up for a beat (an air-stall of ~0.12 s) and a killing blow
   in the air should give a small upward bounce. Right now the air swing exists but has no consequence, so
   fights collapse to the ground.
4. **Combo escalation that the player can see.** The counter drives THIRD CUT invisibly. Show it: a small
   chevron per step near the HUD, a wider blade arc on the third, and a brighter impact. It is the cheapest way
   to make ordinary swings feel like they are going somewhere.
5. **Directional knockback that respects the blow.** Every hit pushes the foe straight back at a fixed 80.
   Scale it by damage and direction (a heavy from below pops them up, a running blow throws them further) and
   the same swing starts reading as different swings.

## Jumping and platforming: the five I would do next

1. **Ledge mantle.** Miss a ledge by three pixels with upward momentum and you should catch it. This is the
   single most-felt platformer nicety after coyote time, and every level in the game has hand-placed ledges to
   benefit from it.
2. **Run acceleration with a top speed you have to earn.** Speed is a flat 100 with instant turnaround. A
   0.12 s ramp to 100 and a 0.25 s ramp to a 118 sprint would make long decks and roads feel like *travel*
   rather than a constant. (The `momentum` talent already rewards a second of running — this gives it a body.)
2b. **Skid and turn frames** to go with it: the skid sound already exists, the pose does not.
3. **A dash with a cooldown, on the ground and in the air.** The dodge roll is the closest thing, but it is a
   defensive i-frame and costs stamina. A short horizontal dash that *does not* dodge would open the level
   geometry — and the AIR ROLL talent proves the input is free.
4. **Springs, gusts and swings should carry momentum out.** Leaving a swing at the top of its arc currently
   drops your speed to the walk cap; keeping it (and showing it with a streak) would make the rigging in the
   two ship levels feel like a playground instead of a set of steps.
5. **Landing recovery you can cancel.** A hard landing has 0.16 s of `landT`; letting a jump or dodge cancel it
   (as attacks already sort of do) removes the one place the controls take the wheel from the player.

## Two cheap wins in the camera

- **Look-ahead by velocity, not just facing.** The camera leads 26 px by facing; leading by `vx * 0.22` as well
  would stop the hard turns from snapping.
- **A held-frame on a boss's wind-up.** Half a frame of stop when a boss commits to its tell would read as
  "here it comes" without a single new asset.

## What I would not do

- **More screen shake.** It is already at the right level and there is a setting for people who want less.
- **Longer hitstop on ordinary hits.** Weighted is enough; more would make the ordinary swing feel gluey.
- **A double jump.** The pyromancer had one and it was removed for a reason: it flattens every level's
  vertical design, and the game has springs, vents, gusts and the rising cut for height.

## If I could only do three

1. **The melee parry window** — turns the block button into a decision.
2. **The ledge mantle** — the last big fairness gap in the jump.
3. **Hurt poses for the eight commonest foes** — impact you can see, not just hear.
