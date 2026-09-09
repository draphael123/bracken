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
- **Spike goblin** — a goblin in a spiked iron helm and back plate. Winds up with a "!" and
  charges. Block the charge to stagger him, or dodge through and hit him while he rests. Stomping
  the spikes hurts you: sword only.
- **Goblin archer** (Marsh Wood) — keeps its distance and looses arcing arrows after a draw. Block
  them, or slash one to send it straight back and kill the archer. It won't cross water.
- **Hopper** (Marsh Wood) — a marsh frog that leaps at you in long arcs and leaps aboard the raft
  from the river. Swing when it lands, stomp it, or block the leap.
- **The Bullfrog King** (Marsh Wood boss) — big, and sits on a mud dais. Stomp or plunge him while he's
  up and you pay for it. Tongue lash at head height (block it to bite it and daze him), a leap that
  shakes the ground (jump the waves, then hit him dazed, when his head is fair game), a croak that
  calls flies out of the reeds (strike the swollen throat for double), venom spit, and he hops away
  when you crowd him. His BREATH IN drags you toward his teeth: block to dig your heels in (he chokes and
  is dazed), or get bitten and thrown.
- **Sapper** (Stockade) — runs at you with a lit bomb and drops it at your feet. Block him and he
  drops it on himself; dodge through and it lands where you were.
- **Brute** (Stockade) — a club goblin. A double mark is the unblockable overhead (dodge it); a
  single mark is the sweep (block it). Hit him while the club is up or while he rests.
- **War hound** (Stockade) — a straight-line chaser that leaps low. Stomp it, or put fire between you.
- **Sporeling** (Sporewood) — a walking cap. Kill it and it bursts into a spore cloud that slows
  and tires you, so finish it at range or step back.
- **Lurker** (Sporewood) — looks like scenery until you pass, then lunges. Swing at plump caps.
- **Spore drone** (Sporewood) — a floating puffball that drifts at you and bursts. Swords bounce
  off it: stomp it out of the air or plunge it.
- **Toad shaman** (Sporewood) — raises sporelings from the ground and blinks away when struck.
- **The Mother Cap** (Sporewood boss) — a sick giant that never moves; the hollow is her. Her brood
  seals her gills: kill every sporeling and drone she calls and the gills open for a while before she
  calls more. Roots stab up through the floor on a rhythm, she belches rolling sleep clouds, and when
  she shakes, spore clumps rain down (block them). Bounce off the caps under her to slash the four
  gill pods while they are open; then she tips, her heart shows at the top of the stalk, and only the
  plunge can pierce it (three times). The hollow is shown zoomed out
  so you can see her whole, and landing a hit on her never costs you: you are safe for a moment after.
- **The Goblin Chieftain** (Stockade boss) — swaps weapons every few swings. CLUB: an unblockable
  overhead that plants him (hit him then) and a blockable sweep (block it = PARRIED). SWORD AND
  SHIELD: quick two-hit slashes and a shield bash; the shield turns your blade from the front, so
  parry the slash or roll behind him. BOW: he backs off and looses arrows you can parry straight
  back at him. Any stance: when he crouches he leaps and stomps where you stand (shockwaves both
  ways). At half health he kicks the brazier and two short strips of floor burn by the walls.
- **The Hornet Queen** — the boss in the hive clearing past the gate. She hovers out of reach,
  calls drones you can pogo off to get up to her, dives at you (block it and she's staggered on
  the floor, where she takes double damage), sweeps the floor at head height (jump or block),
  hangs high and rains a fan of venom (step through the gaps or slash it), and slams the floor
  sending shockwaves both ways (jump them, then hit her while she recovers). Half health and
  she's enraged: faster, more venom, double sweeps.

## Level (the first one, in short)

Glade → pits and crates → spitter ledge and shieldbearer step → shrine → wasp pit (pogo chain)
→ thorn climb on logs → plateau with a moving log → arena → the hollow (drop, stream, shrine) →
the ridge (log climb under fire, wasp gap, last stand) → gate at dusk → the hive clearing and the
Queen. Shrines are checkpoints and heal. Gold coins are the collectible. Deep water drowns you; shallows just slow you down and drain stamina.

## Levels

**Bracken Wood**: glade → pits and crates → spitter ledge and shieldbearer step → shrine → wasp
pit (pogo chain) → thorn climb → plateau with a moving log → arena → the hollow (stream, shrine)
→ the ridge → the HELM PIT (three shieldbearers on posts over spikes: their helms are the stepping
stones) → a quiet walk to the gate at dusk → the hive clearing and the Queen, who now has two low
combs to fight from. Pollen in the glade, mist in the hollow, rain and lightning over the hive.

**Marsh Wood** (unlocks when the wood is cleared): the bank → lily pads that sink under you →
reed climb under an archer → archer islands → wading shallows (a dip in the ground, slow and
tiring, hoppers waiting) → drifting logs against the current → the long river on a big raft, with
hoppers leaping aboard → the flooded grove (a dip full of hoppers) → a second, slower raft under
two archers, finished on sinking pads with the frogs leaping after you → short mud flats → the Croaking Court: a shallow pond, reed perches and the
King on his mud dais. It rains the whole way.

**The Stockade** (unlocks when the marsh is cleared): the goblin camp at night. Watchtowers with
horns (silence the archer or the camp comes running), rope bridges a goblin cuts under you with a
net below, a palisade gate you crank open or blow open with a rolling barrel bomb, cages of birds
and foxes (a freed fox fights beside you), braziers you tip to spill fire, pulley lifts, and the
THE YARD (one room, every tool: free the fox to fight the hounds, tip the brazier to hold them,
roll the barrel into the inner gate or crank it), the kennels and armoury, pulley lifts, and the
great hall where the Chieftain waits. The level does not end when he falls: the hall burns from
the floor up and you climb the rafters to the way out. The horn now brings five goblins and a hound;
the watchtower can be climbed from either side. Bridges you lose stay lost for the attempt, but there is
always a net and a set of ledges to climb back out. Spent barrels come back after a few seconds.

**Sporewood** (unlocks when the stockade is cleared): a dusk forest overrun by giant mushrooms.
Red caps are BOUNCERS (land on one, hold jump for extra height); shelf fungus snaps after you stand
on it for a second and regrows later; puffballs burst into a spore cloud that slows you and drains
stamina (slash them from range instead of walking into them); barrel-sized puffballs ROLL along the
floor (slash to pop, stomp to bounce); spore VENTS breathe an updraft on a timer that carries you up;
some caps ride moving ledges; plunging into any cap springs you higher than a held jump; violet SLEEP SPORES put you to sleep
if you linger, so block to hold your breath and mash to wake; glow mushrooms light the way. The
mycelium glade → the bouncer canyon → the lurker grove → the shelf climb under a toad shaman → the
sleep marsh (ride the vents from shelf to shelf over the violet, blocking between gusts) → the
mycelium tunnels (low roof, no plunge) → the lantern terrace → the drone gauntlet (caps on pillars
over a drop, or the low road of shelves that give way; the pit has a floor with caps that spring you
back) → the hollow and the Mother Cap. When she tips, the hollow goes violet and the glow caps die.
No drop in Sporewood is bottomless any more: the shelf trap lands you on a cap, the pillars have a
floor. The lantern terrace is a SPORE STORM: sleep clouds roll in from the right and only a lit glow
cap keeps them off you, so run haven to haven, or block between them.

## Dressing and life

Every level dresses its ground from its own kit: ferns, stumps and rocks in the wood (butterflies
rest on the stumps and scatter when you run past), cattails and dragonflies in the marsh, skull
posts, tents and campfires in the camp (crows perch on the posts and take off as you approach),
tiny glowing caps and hanging moss in Sporewood. Each level also gets a landmark or two placed
on flat ground: a hollow old oak, a sunken boat and a heron standing in the shallows (it lifts off
as you wade near), goblin war totems, a fallen giant cap. A haze sits between the far trees and the play
layer so the parallax reads as depth. Hits leave an impact star and squash the foe, kills ring out,
a plunge landing sends a shockwave through the dust, a parried blow flashes steel, and turning at a
run kicks up a skid.

## The four arenas

Each boss fights somewhere that looks like nowhere else. The hive clearing is walled by vines and
hung with papery combs that drip honey while bees drift through amber light. The Croaking Court is
ringed by mossy stone frogs and lily lanterns glowing on the pond. The great hall is hung with war
banners and cages, a throne of bones behind the Chieftain, embers rising. The hollow is roots,
glowing spore pods and the bones of what the Mother Cap has eaten, under a violet haze. While she
gasps with her gills open, she does nothing else: that window is yours.

## Caches and shrines

Every level has an optional cache off the main path: a ledge above the plateau you reach by pogoing
the wasp, a reed climb over the shallows, coins lying on the ravine net, a shelf in the lurker grove
reached by a lone cap. Shrines are spaced so no stretch runs more than about eighty tiles without one.

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

## Skills

The store's SKILLS tab opens once the Stockade is cleared (the results card and the map point you
there). SHIELD THROW (80 gold): press F (B on a gamepad) to hurl the shield forward. It costs 20
stamina and comes back to you after about half a screen or on hitting a wall; anything it passes
through takes 15, arrows and seeds in its path are swatted down, and puffballs pop. Two and a half
seconds of cooldown, and you cannot block while it is away. Made for archers, spitters and shamans
on ledges you would rather not climb.

## Iron Knight

An opt-in mode in Settings: three lives per level. Lose them all and the knight falls, the level
is not cleared, and you are back on the map (gold you picked up is kept). Clear a level with it on
and the map card shows an iron shield beside the medals.

## Saves

Three save slots, picked after the title screen (LEFT/RIGHT, Z to play, X twice to erase). Each
slot keeps its own levels, medals, purse, skins, swords, upgrades, bestiary and map position. An
older single save is picked up as slot 1.

## Settings (Esc)

Difficulty (easy, normal, hard: damage taken and enemy health scale), music on/off, music
volume and effects volume (independent), sound FX files or synth, a Z/X swap for jump and swing,
screen shake, hit stop, damage numbers, the timer, ambient life (leaves, fireflies, crickets),
CRT scanlines, a pixel-scale cap, CAMERA (close, or wide: the view shows up to twice the world at a
smaller pixel scale, picked from your display so it never shrinks on screen), IRON KNIGHT, BACK TO SHRINE (counts as a death), RESTART LEVEL, and a reset
of the current save slot.

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
