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
  overhead that plants him (hit him then), a blockable sweep (block it = PARRIED), a grab-and-throw,
  and the WHIRL: he spins across the floor with the club out for a second and ends up DIZZY (double
  damage while he reels). SWORD AND
  SHIELD: quick two-hit slashes and a shield bash; the shield turns your blade from the front, so
  parry the slash or roll behind him. BOW: he backs off and looses arrows you can parry straight
  back, or calls a VOLLEY: four or five arrows go up and come down on the marked spots a moment later,
  so step off the marks. He also leaps and stomps in any stance.
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
the floor up and you climb the rafters to the way out: THE HALL BURNS. CLIMB TO THE GATE, with a
marker on the gate; the rafters are two-tile hops on both sides, the fire stops just under the top beam,
and dying in the fire resets the fire, not the Chieftain. The fire itself does not burn you. Two plunges
in a row on the Chieftain and he shakes you off. The horn now brings five goblins and a hound;
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

**Kingswood** (unlocks when Sporewood is cleared): the goblins' own forest, a rust-and-gold dawn
under living trunks they have hollowed into halls. Townsfolk bolt for their doors and slam them.
Thieves snatch your level gold and run (catch one and it comes back with interest; the Thief Cloak
in the loft above the court stops them cold). Pikemen turn your blade from the front: jump them,
get behind, or throw the shield. Alarm bells: a goblin runs to ring one and a portcullis drops
ahead; break the bell first, or take the other road. The level forks twice into a HIGH ROAD of
canopy walkways and swinging platforms and a LOW ROAD through the burrows, where the goblins' own
traps (a lever that swings a log ram, a pressure plate that drops a cage) can be turned on them.
Midway, the kennels: the HOUND MASTER rides a great hound and whistles the pack. Block his charge
and the hound rears; plunge the rider to unseat him, and he mounts again if you are slow. The
court at the end is a red carpet, banners, a gallery of watching goblins, and KING GORM UNDERLEAF
on a palanquin carried by four bearers. Cut the bearers and the throne falls; then the sceptre,
the shout that throws you back, and goblets; at the last he stands, and the court goes quiet.
Its own music, Juhani Junkala's Retro Game Music Pack (CC0), with a second boss track for the King.
The goblins live in proper thatched houses now, the pasture has a canopy road and a rope ladder onto the
first hall's roof, and the court has galleries either side with the crowd on them. The Hound Master has a
health bar and an intro, a whip lash from the saddle and a leap (plunge him right after he lands).
King Gorm, once grounded: the sceptre bolt marks the floor and strikes, the crown comes back like a
boomerang, three cages drop from the rafters on his word, and the galleries throw goblets when he shouts.
Clearing it opens the second skill at the store: GROUND SLAM (F on the ground: a quake that runs
along the floor both ways, 15 and a stagger to everything it reaches, breaks crates; 25 stamina,
3 seconds). Skills are equipped one at a time in the SKILLS tab, so F does whichever you chose.

## The five arenas

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
skins and blades can be swapped any time. X on the map opens the **bestiary**, in two groups (FOES and BOSSES, LEFT/RIGHT to switch, each
scrolling): every foe you have
met, how to beat it, and how many you've slain.

## Medals

Each clear is graded: a time medal (bronze, silver, gold by level thresholds), ALL GOLD when every
coin is collected, and NO DAMAGE for a clear without a hit or a death. They show on the results
card and as icons on the map.

## Gamepad and touch

Any standard gamepad works: A jump, X swing, B dodge, LB/RB block, Start pause, d-pad or stick to
move. On touch devices (or with `?touch=1`) an on-screen pad appears: d-pad on the left, A/B/X/Y
on the right, pause top-right.

## Outfits and blades

Twelve outfits: Bracken Blue, Black Knight, Violet Knight, River Blue, Marsh Green, Rose Knight,
Crimson Guard, Verdant, Frost Plate, Shadow, Gilded Plate, and two you earn instead of buy: Iron
Knight (clear any level in Iron Knight mode) and Sporeborn (clear Sporewood). Seven blades, each
with a habit: Steel; Ember (foes burn after a hit); Frost (hits hold foes still); Gilded (kills
shake out a coin); Shadow Edge (light, swings cost 7 stamina); Thorn (each hit mends 2); Moonsilver
(15 a swing, shoves hard, costs 16).

## Relics

One per level, hidden in the caches, kept until you die: the HORNET CROWN in the wood (stomps strike
like plunges), the HUNTER'S CHARM in the marsh (gold comes to you), the IRON GAUNTLET on the ravine
net (swings cost no stamina), the GLOW LANTERN in the lurker grove (spores cannot put you to sleep),
the THIEF CLOAK above the court (thieves cannot take your gold).

## The Crags: world two

**The Scree Path** (level 6, needs Kingswood) climbs out of the forest into the foothills at dusk:
slate, heather, gold grass, and a rose sky with snow on the far peaks. The pasture has sheep that
scatter, dry-stone walls, and the shepherd's bothy: she has lost three ewes up the hill, and finding
all three (one on the terrace ledge, one in the windmill loft, one below the scree) drops the GOLDEN
FLEECE relic where the last one stood, plus five gold. Then the terraces, where boulders come off the
cliff on a rhythm (a dust warning, then the fall; they shatter on you or on goblins), the windmill,
whose sails are rotating platforms that lift you to the loft and the high path, and the scree slope:
loose stone that carries you downhill unless you brace with block or bounce over it. New foes: the
CRAG HARPY (hangs in the wind, screams, dives in a line; block the dive and she is stunned on the
ground for a plunge) and the GOAT RIDER (charges, hops walls and ledges; block the charge and the
goat bucks its rider off). The boss is THE RAM LORD in the walled fold on the plateau: his horns turn
the blade from the front, so dodge the charge and let him hit the wall, then cut him from behind or
plunge between the horns while he reels. He stamps (shockwaves) and hops at you; at half health he
charges twice and rocks fall from the cliff. Its own music: Juhani Junkala's Retro Game Music Pack
"Level 1" (CC0), and a wind ambience.


## The long way round: every level grew a section

Each level is about thirty seconds longer, with one new set piece slotted into its middle (the rest of
the level slides right to make room; nothing after it changed):
- **Bracken Wood: the Wasp Orchard.** A fallen giant lies across the path: go through the hollow past
  thorns and a spitter, or over the top through the wasps. Then a hive glade where three wasps over a
  thorn bed are the only way across (pogo them).
- **Marsh Wood: the Drowned Village.** Stilt planks over deep water with sinking pads in the gaps, two
  archers on the roofs, wasps, and lookout huts in the trees.
- **The Stockade: the Sappers' Tunnel.** A mound blocks the surface; the goblins' own tunnel runs under it:
  torches, barrels to roll into sappers and a brute, spikes, and a rope ladder up the far shaft.
- **Sporewood: the Puffball Bog.** Three sinks in the ground with caps at the bottom (fall in, plunge the
  caps, bounce out), lurkers and puffballs between them, spore geysers, drones overhead, a shaman.
- **Kingswood: the Toll Bridge.** A rope bridge over a bone-strewn gorge held by pikemen and a thief; a
  cutter waits at the far post and saws through once you are out over the drop. If it falls, ledges
  lead back up from the gorge floor.
- **The Scree Path: the Cairn Field.** Standing stones and cairns, a gully whose scree drags you back
  toward its wall (jump the far ledge), rocks off the cliff, a goat pen, harpies on the wind.
Signs wrap to two lines now, so every one can be read.

## Skills

The store's SKILLS tab opens once the Stockade is cleared (the results card and the map point you
there). SHIELD THROW (80 gold): press F (B on a gamepad) to hurl the shield forward. It costs 20
stamina and comes back to you after about half a screen or on hitting a wall; anything it passes
hits the first thing it meets: 15 to archers, spitters, shamans, wasps, drones and thieves, 10 to
anything else; arrows and seeds in its path are swatted down, and puffballs pop. Two and a half
seconds of cooldown from the catch, and you cannot block while it is away. Made for archers, spitters and shamans
on ledges you would rather not climb.

## HUD, menus and map

The HUD sits on dark plates: heart and health bar with a number and quarter ticks, stamina bar,
timer, coins, the shield's cooldown once you own the throw, and three knight heads under Iron
Knight. Every level opens on a name banner with a short fanfare. Boss bars carry a skull plate with
ten ticks. Menus share one framed panel with corner studs, and the pause menu names the level and
your time. The map is framed like a parchment, every node is labelled, each wood dresses its own corner (reeds
and a pond, stakes and a tent, mushrooms, autumn trees and a crown), the store's chimney smokes,
every boss lounges by its node until beaten, the card shows the relic you found there, and a
compass sits in the corner.

## Iron Knight

An opt-in mode in Settings: three lives per level. Lose them all and the knight falls, the level
is not cleared, and you are back on the map (gold you picked up is kept). Clear a level with it on
and the map card shows an iron shield beside the medals.

## Saves

Three save slots, picked after the title screen (LEFT/RIGHT, Z to play, X twice to erase). Each
slot keeps its own levels, medals, purse, skins, swords, upgrades, bestiary and map position. An
older single save is picked up as slot 1.

## Pause and settings (Esc)

In a level, Esc opens a short PAUSE menu: Resume, Back to shrine, Restart level, Return to map,
the two volume sliders, Settings, Quit to title. The full settings list lives behind Settings, and
on the title screen (Esc there). The sound test is on the title screen's settings only.

### Settings

Difficulty (easy, normal, hard: damage taken and enemy health scale), a SOUND TEST (every effect,
music track and ambience bed, grouped, Z to play), music on/off, music
volume and effects volume (independent), sound FX files or synth, a Z/X swap for jump and swing,
screen shake, hit stop, damage numbers, the timer, ambient life (leaves, fireflies, crickets),
grouped under GAME / AUDIO / VIDEO / SAVE: a CONTROLS page, gamepad rumble, look-down camera on/off,
HUD full or minimal (the plates hide when nothing is happening), a SCREEN FILTER (warm, cool, sepia,
night), boss intro bars, health bars over hurt foes, timer tenths, block HOLD or TOGGLE, tips (the little words over
the action) on/off, intro text speed, REDUCE MOTION (one switch for shake, hit stop, flashes and
zoom), flashes, vignette, weather, impact FX, CRT scanlines, a pixel-scale cap, CAMERA (close, or wide: the view shows up to twice the world at a
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
