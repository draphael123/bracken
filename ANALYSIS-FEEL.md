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

## The recommendations as written — all twelve are now in

They are kept here because the reasoning is the useful part, and because the numbers say what was changed and
why: the melee parry (the block button had no read in it), hit reactions (a white flash was all the impact a
hit had), air combat (the air swing had no consequence, so fights collapsed to the ground), visible combo
escalation (THIRD CUT drove off an invisible counter), knockback that respects the blow (a flat 80 for
everything), the ledge mantle (the last fairness gap), an earned top speed (a flat 100 with instant
turnaround), a dash that is distance rather than safety, momentum out of ropes and rafts, a cancellable
landing, a camera that leads velocity, and a held frame as a boss commits.

## What I would not do

- **More screen shake.** It is already at the right level and there is a setting for people who want less.
- **Longer hitstop on ordinary hits.** Weighted is enough; more would make the ordinary swing feel gluey.
- **A double jump.** The pyromancer had one and it was removed for a reason: it flattens every level's
  vertical design, and the game has springs, vents, gusts, the rising cut and now a dash for reach.

## The next tier, in the order I would take it

1. **Hurt poses for the rest of the common foes**: the shield goblin, the soldier, the brute, the hound. Six
   are done; these four are the next most-met.
2. **A tell colour channel on the parry**, so the window can be learned by eye and not by feel.
3. **Skid and turn frames** to go with the earned run: the sound exists, the pose does not.
4. **Playtest the new verbs against the old levels.** The dash and the mantle change what a gap means, and the
   fourteen levels were authored without them. Nothing became unreachable (the whole suite reports identical
   numbers) but some gaps may now be trivial, and that is a design question rather than a bug.
