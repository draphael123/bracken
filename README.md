# BRACKEN

A 16-bit forest platformer: a knight, a sword, a shield, and a plunge. Three levels, three bosses.

    node serve.mjs      →  http://localhost:5860

No dependencies. Plain canvas 2D at 320×180, integer-scaled, every sprite baked at load.

## Controls

| Action | Keys |
|---|---|
| Move | Arrows / WASD / d-pad |
| Jump (hold for height) | Z / Space / W / K |
| Swing | X / J / Enter |
| Block (hold; drains stamina, slow walk, no jumping) | C / L |
| Dodge roll | V / Shift |
| Plunge | Down + X while airborne |
| Drop through a log | Down + jump |
| Settings / pause | Esc / P |
| Music toggle | M |
| Restart at shrine | R |

## Health and stamina

Health is a 100-point bar. Stamina is spent by swinging, plunging, dodging, holding the shield up,
and taking a hit on it. It regenerates after half a second of not spending. Run the bar dry while
blocking and the arm drops for a moment ("TIRED"); take a hit on the shield with too little
stamina and it's a **guard break**: half damage and a stagger. With the shield up you walk slowly
and cannot jump.

## The hook

The sword does one thing the jump can't: **the plunge**. Down + X in the air drives the blade
down. Landing it on a foe or a crate bounces you higher than a jump, so a row of wasps over a
pit is a bridge, a shieldbearer is safest from above, and crates are springs.

Plain jumps count too: land on a soft foe's head (sprig, spitter, wasp) and it dies with a small
bounce. Helmed foes (the shieldbearer) just clank and bounce you off. Spined ones hurt.

Not everything can be plunged. The **Thornback** has a spined back. The blade skates off, you
eat the spines, and only the sword will do.

## Enemies (each demands a different answer)

- **Sprig** — goblin walker. Swing, or block and shove.
- **Shieldbearer** — blocks anything from the front with a clank. He turns slowly, so cross
  behind him and strike, or plunge from a log above.
- **Spitter** — toadstool on a ledge. Spits a seed straight at your chest. Step aside, jump,
  block, or slash it out of the air.
- **Wasp** — hovers over pits. Pogo fodder.
- **Thornback** — armoured beetle. Winds up with a "!" and charges. Block the charge to stagger
  it, or dodge through and hit it while it rests. Sword only.
- **Goblin archer** (Marsh Wood) — keeps its distance and looses arcing arrows after a draw. Block
  them, or slash one to send it straight back and kill the archer. It won't cross water.
- **Hopper** (Marsh Wood) — a marsh frog that leaps at you in long arcs and leaps aboard the raft
  from the river. Swing when it lands, stomp it, or block the leap.
- **The Bullfrog King** (Marsh Wood boss) — wears a crown of thorns: stomp or plunge him while he's
  up and you pay for it. Tongue lash at head height (block it to bite it and daze him), a leap that
  shakes the ground (jump the waves, then hit him dazed, when his head is fair game), a croak that
  calls flies out of the reeds (strike the swollen throat for double), venom spit, and he hops away
  when you crowd him.
- **Sapper** (Stockade) — runs at you with a lit bomb and drops it at your feet. Block him and he
  drops it on himself; dodge through and it lands where you were.
- **Brute** (Stockade) — a club goblin. A double mark is the unblockable overhead (dodge it); a
  single mark is the sweep (block it). Hit him while the club is up or while he rests.
- **War hound** (Stockade) — a straight-line chaser that leaps low. Stomp it, or put fire between you.
- **The Goblin Chieftain** (Stockade boss) — a slow unblockable overhead that plants him for a
  moment (double damage), a blockable sweep, and a grab that throws you. No plunging his helm. At
  half health he kicks the brazier and the hall burns; take to the rafters.
- **The Hornet Queen** — the boss in the hive clearing past the gate. She hovers out of reach,
  calls drones you can pogo off to get up to her, dives at you (block it and she's staggered on
  the floor, where she takes double damage), sweeps the floor at head height (jump or block),
  hangs high and rains a fan of venom (step through the gaps or slash it), and slams the floor
  sending shockwaves both ways (jump them, then hit her while she recovers). Half health and
  she's enraged: faster, more venom, double sweeps.

## Level

Glade → pits and crates → spitter ledge and shieldbearer step → shrine → wasp pit (pogo chain)
→ thorn climb on logs → plateau with a moving log → arena → the hollow (drop, stream, shrine) →
the ridge (log climb under fire, wasp gap, last stand) → gate at dusk → the hive clearing and the
Queen. Shrines are checkpoints and heal. Gold coins are the collectible. Deep water drowns you; shallows just slow you down and drain stamina.

## Levels

**Bracken Wood**: glade → pits and crates → spitter ledge and shieldbearer step → shrine → wasp
pit (pogo chain) → thorn climb → plateau with a moving log → arena → the hollow (stream, shrine)
→ the ridge → gate at dusk → the hive clearing and the Queen. Pollen in the glade, mist in the
hollow, rain and lightning over the hive.

**Marsh Wood** (unlocks when the wood is cleared): the bank → lily pads that sink under you →
reed climb under an archer → archer islands → wading shallows (a dip in the ground, slow and
tiring, hoppers waiting) → drifting logs against the current → the long river on a big raft, with
hoppers leaping aboard and two archers on perches overhead → the flooded grove (pools, pads,
hoppers, a thornback) → mud flats → the frog pond and the Bullfrog King. It rains the whole way.

**The Stockade** (unlocks when the marsh is cleared): the goblin camp at night. Watchtowers with
horns (silence the archer or the camp comes running), rope bridges a goblin cuts under you with a
net below, a palisade gate you crank open or blow open with a rolling barrel bomb, cages of birds
and foxes (a freed fox fights beside you), braziers you tip to spill fire, pulley lifts, and the
great hall where the Chieftain waits.

## World map, purse, and store

Any key on the title opens the world map. Walk the knight along the path with the arrows and
press Z on a node: Bracken Wood, the Store hut, Marsh Wood (locked until the wood is cleared).
Best time, gold, and a CLEARED flag are saved per level. Gold you finish a level with goes into
your purse. The store has three tabs: knight skins (Black, Violet, River Blue), sword blades
(Ember, Frost, Gilded), and upgrades (Heart of Oak: +25 health, Second Wind: +30 stamina). Owned
skins and blades can be swapped any time. X on the map opens the **bestiary**: every foe you have
met, how to beat it, and how many you've slain.

## Medals

Each clear is graded: a time medal (bronze, silver, gold by level thresholds), ALL GOLD when every
coin is collected, and NO DAMAGE for a clear without a hit or a death. They show on the results
card and as icons on the map.

## Gamepad and touch

Any standard gamepad works: A jump, X swing, B dodge, LB/RB block, Start pause, d-pad or stick to
move. On touch devices (or with `?touch=1`) an on-screen pad appears: d-pad on the left, A/B/X/Y
on the right, pause top-right.

## Settings (Esc)

Difficulty (easy, normal, hard: damage taken and enemy health scale), music on/off and music
volume, sound volume, sound FX files or synth, a Z/X swap for jump and swing, screen shake, hit
stop, damage numbers, the timer, ambient life (leaves, fireflies, crickets), CRT scanlines, a
pixel-scale cap, and a reset of saved progress.

## Files

- `src/level.js` — the level registry; each level paints its map with `floor / block / plat / spikes / crate / ent`.
- `src/main.js` — physics, combat, enemies, camera, render, intro, menu, screens.
- `src/chars.js` — knight frames (text grids + drawn sword) and enemy sprites.
- `src/art.js` — tiles, props, parallax layers.
- `src/audio.js` — CC0 sample playback (`audio/manifest.json`) with synth fallbacks; four music tracks (wood / marsh / boss / select), ambient beds (forest birds, water, hive drone, rain), and music ducking while something winds up. See `audio/CREDITS.txt`.

## Debug

`window.BK` exposes `P` (player), `step(n)` (deterministic sim steps), `tp(tx, ty)`, `reset()`,
`respawnEnemies()`, `enemies()`, `stats()`, `god`, `SET`, and `sheet` (sprite sheet view).
`?tx=N&ty=M` starts at a tile and skips the intro.
