# THE FOG CANAL - brief (claude/canal, the greybox)

**Id** `canal`. **Road**: the main road inland, WAYMEET -> THE FOG CANAL -> (THE MASKWRIGHT'S THEATRE, claude/theatre) -> THE HARVEST FAIR.
On this branch the theatre does not exist, so the canal `needs: 'waymeet'` and the fair `needs: 'canal'`. **At the merge with claude/theatre**:
the theatre's `needs` becomes `'canal'`, the fair keeps `needs: 'theatre'`, and the inland map runs waymeet (40,162) -> canal (50,154) ->
theatre (move it from (56,154) to about (62,151), so the two do not crowd) -> fair (72,148).
**Boss**: JENNY GREENTEETH (claude/lockkeeper, boss id `greenteeth`), in the lock chamber at the end. **Music**: its own track, `canal`
(`audio/canal.ogg`, made by `tools/canal-music.mjs`: a slow barcarolle in A minor, 6/8, musette accordion and hurdy-gurdy; a placeholder
for the art/music lane). **Code**: `src/fog-canal.js` (the level), `src/canal-rig.js` (the machinery, pure), `src/canal-hands.js` (its hands
in the game), `src/canal-foes.js` (the two new foes). **Checks**: `tools/canal.mjs` (the rule, pure + level + page), `tools/canal-pilot.mjs`
(the route with real keys), `tools/canal-shots.mjs` (pictures).

## The premise and the rule

You leave Waymeet by night on a barge along a fog-choked canal into the old town's theatre quarter; the theatre's lit windows glow ahead
through the fog the whole way (a warm glow in the fog layer that grows as you near it).
**THE BARGE GOES WHERE THE WATER LETS IT. A LANTERN SHOWS YOU - TO THEM TOO.**

The canal water is Jenny's: **it bites what falls in and hands it back** (20 health, back on the barge if you fell off her, else on the
last dry ground: `L.waterHurts`, told on the quay's sign). So the barge is the way across every stretch of water, and the level's
machines are the things that let her go.

## The four machines (each taught -> developed -> twisted -> examined, and each the LOCK somewhere)

| machine | what it does | teach | develop | twist | exam | where it is the lock |
|---|---|---|---|---|---|---|
| THE BARGE | a hull on the water with a lantern on a pole; drifts while you ride her or stand ahead of her, never away from you; stops at a shut gate, a swing bridge across, a thick fog bank | the Waymeet quay (board, ride, duck the low bridge, hop onto the towpath and back) | the first lock and the mill (she rises with the water; she waits under the mill for you) | THE LONG ARCH: she goes through without you (too low for anyone standing) - over the rooftops and catch her on the far side | the basin | everywhere there is water: the reach model cannot reach the gate with no barge (`tools/canal.mjs`) |
| THE LOCK GATES | a paddle struck fills (or empties) its chamber at 34 px/s; a gate stands open only while the water either side is level, and never shuts on the barge or a body in it | THE FIRST LOCK: the paddle on the upper gate's face, at her bow | THE FLIGHT: three locks in a staircase up the hill, each paddle somewhere the last one was not (the gate's face; a balance beam up a ladder; across a swing bridge at the summit) | the summit's gate BURSTS when she reaches it: the weir run | THE BASIN LOCK: the theatre's door is four rows over the basin, and only the full chamber puts her deck in reach | the mill is not reached with no lock rising (the reach model) |
| THE FOG, THE LANTERN, THE FOGHORN | in fog, what stands in a lantern's light (a post's, or the barge's own) is SEEN: archers loose only at a lit hero, a grindylow under the water shows its shadow only in the light. A lantern post struck is doused (struck again, lit). A THICK bank stops the barge; a FOGHORN clears it for 9 s, then it rolls back, and the horn must wind up (10 s, a gauge on the post) | the fog's edge past the mill bridge: lanterns on posts, the first wisp (a sign) | THE LONG ARCH's rooftops: posts by the light-well, an archer on the belfry who sees you only when you pass them | THE FOG WALL: a thick bank she will not enter; the horn on the bank clears it (a second one on a pier, if it comes back on you) - and while it is clear, the archer over it sees everything | the basin: the bridge is in thick fog, the horn past it | THE FOG WALL (she will not go into it without the horn) |
| THE SWING BRIDGE | a deck across the water at towpath height (walk it; her lantern pole will not pass under it) or swung clear (she passes, and there is no way across): never both | THE MILL BRIDGE: she waits under the mill; swing it from its far end and drop onto her as she passes | THE BRIDGE GARRISON: two archers stand on it - swing it and they go into the canal | THE SUMMIT BRIDGE: across, it is YOUR way over the weed to the last paddle; then it holds her, and must be swung behind you | the basin: walk it to the island, then swing it from the island | THE MILL BRIDGE and THE SUMMIT BRIDGE (she cannot pass until they are swung) |

## Section beats

| cols | section | beat | what happens |
|---|---|---|---|
| 0-67 | THE WAYMEET QUAY | TEACH barge, the two weeds, grindylow | NOT A WALK: the dead street ends in the warehouse's broken floor, three drops down (or up the ladder onto the roof: the loft's silver and an archer). The wet dock: BRIGHT and DARK weed side by side over water too shallow to hurt (a sign). The quay: a grindylow under its edge, alone (a sign). The barge; the towpath bargees hooking down at her; the low bridge (duck, or over it on the towpath) |
| 68-121 | THE FIRST LOCK AND THE MILL | TEACH lock + bridge, DEVELOP barge | she stops at the upper gate: strike the paddle at her bow (a grindylow on the lock steps under it); she rises seven rows. The mill is built over the pound: she waits under it, held by the mill bridge; up through the wharf floor and the mill's four floors (two bargees and an archer), CHECKPOINT ONE at the top, out of the miller's door to the bridge, swing it from its far end and drop onto her |
| 122-185 | THE FOG BANK | TWIST barge, TEACH/DEVELOP/TWIST fog, DEVELOP bridge | the weed reach and the first wisp; off at the loading step before THE LONG ARCH (she goes through without you); the rooftops (the light-well with a wisp over it and a silver down it, lantern posts, the belfry archer, a bargee); the bridge garrison (swing it: its archers into the canal); THE FOG WALL (the horn; a wisp; a grindylow under the stopped barge; an archer on a high footbridge) |
| 186-247 | THE FLIGHT | DEVELOP lock, TWIST bridge | three locks up the hill with the bargees waiting at each (a ledge over the first chamber, the balance beam, the summit); the summit bridge crossed and swung; CHECKPOINT TWO on the summit, by the keeper's hut; a wisp over the summit weed (the weir approach) |
| 248-325 | THE WEIR | SET PIECE (a chase, `src/chase.js`) | the summit gate bursts and she runs LOOSE down the race with the flood behind (rubber-banded, hurts on contact). Two ramps down under a low footbridge (duck), then THE JUNCTION: her TILLER (amidships, its arrow shows the helm; told on the summit's sign and when the gate bursts) steers THE MILL CUT (three more low beams, two archers and a bargee on the cut's bridges, four gentle drops into the basin) or THE WEIR (one plunge that jars whoever is standing when she lands - 22, or be in the air - then the lower river's rapids and two grindylows, and a silver on a ledge only that way). Thrown off, you wade on down the shallow race with the flood at your back |
| 326-369 | THE THEATRE BASIN | EXAM | one space, all of it: she stops in THICK fog; the bridge stands across (walk it; it holds her); on the island past it, THE DECK FOREMAN (the elite, the lock door's gate), the HORN (the fog over the bridge) and the bridge's CAPSTAN; the THEATRE BRIDGE's two archers see only the lit (her lantern, the island's post - and everything, while the horn has the fog cleared; a ladder up to them); a wisp over the weed shines like the lock's own lamp; bright and dark weed; a grindylow under her in the fog and one on the lock steps. Clear the fog, swing the bridge, be on her when she passes under the island (the fog's back in 9 s), fill THE BASIN LOCK at its upper gate, and step up into the lock door |
| 370-431 | JENNY'S LOCK | the boss (claude/lockkeeper) | the corridor through the lock's head (the foreman's gate), CHECKPOINT THREE just outside her west door, her footprint kept free, the theatre quarter's quay past her east door |

## The foes (fewer, better; every one in a named encounter; every type bound to the level's machines)

- **THE GRINDYLOW** (new): Jenny Greenteeth's weed-imp brood, her grab in miniature. Under the water: ripples and bubbles only (its shadow
  in a lantern's light), and nothing finds it. At a low edge (the quay, the lock steps, the barge's ends) it rings the water (!!, jump it -
  or strike the ring and knock it up out of the water), then grabs your ankle and pulls you toward the canal: three presses break it.
  Out of the water (dazed, or STRANDED when a lock drains away under it) it is weak and takes double.
- **THE WILL-O'-THE-WISP** (new): a false lantern in the fog - cold green, and no post under it (every real lantern is yellow on a post).
  It drifts on ahead along a line of its own as if it marked the way (off the bank, onto the weed), gutters (!) and flares close to (a
  shield turns it; duck it), and pops at one blow. In air a horn has cleared it shies back to where it started.
- **THE BARGEE**: the Ore Road's gaffer (the boat-hook goblin; reskin in the art notes) on the towpaths, hooking DOWN at the barge
  passing under him (!!: duck on the deck and the hook goes over, a hook that lands takes you off her). The basin's is the elite.
- **THE ARCHERS**: on bridges, the belfry and the hut; in the fog they loose only at a lit hero.
- No mummers (the theatre's). The one-new-foe rule is lifted to two for the canal and `tools/one-new-foe.mjs` holds it to exactly these two.

## JENNY GREENTEETH (claude/lockkeeper 80de5c17's contract)

Her footprint is kept free: **sx = 376, R = 41** - columns 376-415 (her gates at 376 and 415, her water 377-414), rows 25-42 (she lays rows
41 and 42; row 43 is solid), her doors at rows 35-40 in each gate; the west door opens off the corridor at bed level; CHECKPOINT THREE is
just outside it (375, 40); rows 28-32 over her walkways are open air. The call, in `src/fog-canal.js` section 7:

    import { stageGreenteeth } from './jenny-greenteeth.js';
    const { arena, movers: gm, pools: gp } = stageGreenteeth({ set, block, plat: boards, ent }, T, TS, 376, 41);
    movers.push(...gm); pools.push(...gp);   // into moversExtra and pools
    // and in the return: arena, gateAfterBoss: true, and the level's gate moved out past her east door (onto the quay, x 420, row 40)

Until then a placeholder floor lies on her bed row and the level's gate stands just inside her west door.
**Foreshadowed, cheap and told**: eyes that open in the fog now and then (four places), a child's shoe on the quay's edge and on the
lock door's step, bubbles by the bank where nothing lives, the grindylows (her grab in miniature), and THE TWO WEEDS taught side by side
over shallow water in the warehouse dock (a sign) and again in the basin: BRIGHT weed holds you 2.5 s and gives way; DARK weed is only water.

## Numbers (tools/level-quality.mjs) and the comparison with THE MAGE'S FOLLY

| measure | limit | THE MAGE'S FOLLY | THE FOG CANAL | (the theatre, for reference) |
|---|---|---|---|---|
| width / route | - | 808 cols / 723 tiles | 432 cols / 402 tiles | 344 / 442 |
| flat (empty / level ground) | <=30% / <=60% | 11% / 33% | 13% / 13% | 14% / 20% |
| height bands / 2nd height | >=5 / >=40% | 8 / 61% | 7 / 59% | 7 / 58% |
| gadget kinds / in 3+ places | >=5 / >=3 | 12 / 4 | 6 / 3 (lantern posts 8, paddles 4, capstans 4, horns 2, the barge, the chase) | 7 / 4 |
| music | own | musUnder | canal | theatre |
| secrets off the route | >=2 | 3 | 2 (plus a third silver on the rooftops' light-well that the walked route passes) | 3 |
| checkpoints / tiles each | >=2 / >=90 | 7 / 103 | 3 / 134 | 3 / 147 |
| encounters | every 200 cols | all | all | all |
| density / empty screens | 2-4.5 / <=30% | 2.39 / 23% | 2.22 / 17% | 2.36 / 14% |
| route span / pockets | >=8 / >=2 | 30 rows / 5 | 27 rows / 2 | 30 / 8 |
| set pieces | - | the library's flying books, the orrery's planets, the room turned over, the observatory | THE LONG ARCH (she goes on without you), THE FOG WALL (the horn), THE WEIR RUN (a chase with a helm) | the performance |
| machines | - | warded runes, runeshelves, flying books, the counterweight grating, planets, glyph floor-flip, rotten boards, a brass key | the barge, lock gates and paddles, swing bridges, fog + lanterns + foghorns, the two weeds, the tiller | fly lines, flats, limelights, traps |
| a mini / an ambush room | - | the Homunculus / the reading room | neither (the basin's elite) | neither |

Honest reading: the canal clears every bar the Folly clears, but it is half the Folly's length and has fewer machine KINDS (6 against 12)
and fewer pockets (2 against 5); where the Folly layers many small machines, the canal carries four big ones all the way. Its checkpoints
are fewer (3) as Daniel asked. It has no mini and no ambush room.

## Art notes (for the art lane; nothing here is final)

- **Tile kit**: wet brick quays and lock walls (dark red-brown, green algae line at every water level a lock can stand at), black timber
  lock gates with balance beams and white-painted ends, cast-iron paddle gear (a rack and a wheel), a swing bridge with a white railing and a
  pivot drum, warehouse fronts with loading doors and hoists, slate roofs, a brick mill with a waterwheel, the keeper's hut at the summit.
- **Palette**: night, cold blue-green greys (the fog `#96a8a6`, thick `#b0bebc`), warm lantern yellow `#ffcf6a` as the ONLY warm light
  near the water, the theatre's glow amber `#ffc46e` far off. The wisps are the only cold green light (`#a0ffd2`) - keep that contrast:
  it is the read. Bright weed `#8ad060` (fresh, springy), dark weed `#1e3424` (rotting, flat).
- **The fog**: layered and drifting (two scrolling noise layers), thicker low over the water; thick banks a wall with a lip; the
  lantern pools soft-edged and warm-tinted, silhouettes (not hidden foes) beyond them.
- **The barge**: a narrowboat with a cabin cut low, a hinged lantern pole at the stern (it folds under a low beam), the tiller amidships
  in the greybox (move it to the stern with a longer reach in art), painted roses and castles on the cabin side.
- **The bargee** reuses the gaffer: redraw as a human bargeman (flat cap, waistcoat, boat hook). **The grindylow**: long thin green
  arms, needle teeth, weed hair; the ripple ring is its tell. **The wisp**: a flame with no wick, a faint face in it close up.
- **Jenny's foreshadowing**: the eyes in the fog should be green and low, at water level; the child's shoe a small red-brown buckle shoe.

## What is deliberately not here

No NPCs (the barge has no bargeman), no mummers, no slopes (so the slope guard in main.js is not widened), no new tiles.
