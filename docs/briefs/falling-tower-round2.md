# THE FALLING TOWER, ROUND 2: a short design brief (lane claude/ft2, 2026-09-25)

> Daniel played the whole game through with the Geomancer (2026-09-25): "the falling tower level needs some minor changes".
> Three live bugs, a new ending, and the Undead Archmage learns portals. The rework's brief (`falling-tower-rework.md`) still
> stands; this adds to it. Pictures before and after: `work/ft2/before/`, `work/ft2/after/` (`node tools/ft2-shots.mjs <tag>`).

## PART 1: THE FIXES (each its own commit, so each can ship early)

**a. THE SEXTON GETS STUCK IN WALLS.** Found: his feet are pinned to the deck (`e.y = floor`) and his x was clamped only to the
room's box, so he walked, rushed and climbed out of the pit straight into the two stone RINGERS' WALKS (cols 12-14 and 38-40, two
rows proud of the deck); two of the six "joists" he climbs out onto ARE the walks. The mini's left wall (col 12) also cut a notch
in the left walk when it opened, because `setWallAt` wrote AIR over what had been stone.
- The fix: he asks the room where he can stand (`c.stands(x)`: his box at the deck, clear of rock). Walking and rushing stop at a
  walk; to get past one he LEAPS it (a committed hop that rises clear of the walk's top before it moves across); caught in the pit
  he stays inside the plank he broke; he climbs out onto the nearest place he can stand. `setWallAt` puts back what it replaced.
- The check (`tools/mini-walls.mjs`, red on the old code first): 6 seeded runs a boss, a god-mode hero thrown round the room, and no
  frame may end with the boss's box inside rock. It runs THE SEXTON and the other minis/bosses that pin their feet the same way and
  are cheap to drive (the Graveyard Keeper, the Hedge Warden).

**b. THE CHECKPOINT YOU CANNOT REACH DURING THE ARCHMAGE.** Found: the parapet checkpoint (31, 50) and its sign stand one row under
his hall's floor, and the fight's camera looks below the hall, so all fight long there is a lit lantern under the fire that the
carpet can never reach. The fix: his hall is closed at the bottom (the camera stops at the hall's floor, `arena.camBelow`) and the
checkpoint moves down onto the crown's last tier, outside everything the fight shows. The check (`tools/checkpoint-stand.mjs`,
class-wide, red on the old code first):
- REAL JUMP: every checkpoint in every level is STOOD AT by the reach fill run with a hero's real jump (`opts.across: 5`, about
  3.5 tiles of flight with a foot over each edge - inside the 3.2-4.5 measured - not the model's 6). A short list of known gaps
  in the MODEL (not the level) is kept with reasons, and a stale entry fails.
- SEEN FROM A FIGHT YOU CANNOT LEAVE: no checkpoint within view of a flight arena (a carpet fight has nowhere to stand).

**c. TILES THAT DO NOT WORK WITH THE BACKDROP.** Found: (1) the cistern's poison is drawn as bright green scum with bubbles standing
up off it - at play size a row of GRASS TILES between the stones, the same mistake the sanctum's fire once made; (2) the mini's
left wall was drawn as a wooden palisade over the tower's stone; (3) the back wall's holes (and the Reading Room's windows) were
placed at random, so ledges, ropes, the orrery's shaft wall and the dividers cut across them.
- The fix: the tower's poison is its own (violet-black witchwater under a pale scum, no tufts); a mini's wall wears the level's
  stone where it has one; the tower's palette has no grass in it at all; and every cut-out in the back wall (holes, windows) is
  placed where no tile stands in front of it, with a margin - checked by `tools/tower-cutouts.mjs` (Node: every room baked with
  the built grid, every cut-out rectangle clear of every non-air tile).

## PART 2: THE ENDING - THE PORTAL OPENS ONTO THE DESERT

After the Undead Archmage dies the way-out portal opens where he fell, as now - but it is a hole full of DESERT (the Sunken
Caravan's own sky, mesas and dunes, drawn inside the ring). Through it you stand on open sand under the Caravan's sky with the
LEVEL-END a few steps ahead. The sandstone cutting, its two walls, the rise and the sundial go: the sand runs off both edges of the
world, and the sky is the next level's. Readers kept honest: `tools/tower-ascent.mjs` (the end is unreachable without the door,
reachable through it), `tools/archmage-room.mjs` (every solid cell in the sky rows is skinned; the desert is walked to the gate),
`src/reachcore.js` (`L.sanctum` stays an assist: a portal is a ride the fill cannot follow), `tools/tower-collapse.mjs`.

## PART 3: THE UNDEAD ARCHMAGE USES PORTALS (added, not replacing: the death mark and his stages stay)

Every ring shows DESERT SAND inside it (the same desert as the ending). His rings, `e.rings`, come in pairs: an ENTRY by him and
an EXIT somewhere else.

| attack | tell (A2, `windingUp`) | mark | what it does | the answer |
|---|---|---|---|---|
| THE PORTAL STEP | `stepTell`: the EXIT ring opens near you and FLARES | `!` | he steps into his entry ring and comes out of the exit mid-cast: the next spell's tell is already half gone | get out of the flared ring's reach - or dodge through it (below) |
| BENT BOLTS | `bendTell`: an entry ring by his hand and an exit above or behind you, BOTH glowing the bolt's colour | `!` | he casts bolts into one ring and they come out of the other at you, from a new angle | guard toward the exit ring, or fly across its line |

**THE OPENING IS CAUSED (A11): HIS RINGS WORK BOTH WAYS.** DODGE THROUGH an open exit ring and you come out of his entry ring,
beside him, mid-cast: his spell is broken and he is open (`mode 'breached'`) for 2 s at double damage. Left alone, the rings
open nothing. (The death mark that finds no one still opens him too.)

**THE STAGES (A10):** 1 (over 70%): one pair at a time, the step and the bolts in his order. 2 (70-40%): "HIS RINGS STAY OPEN" -
rings live 1.6x longer and he can hold THREE (a spare exit stays open near you, and bolts can come out of any of them). 3 (under
40%, his existing enrage - faster, pairs, the storm walls): "HE FIGHTS RING TO RING" - his blink becomes a portal step, and the
bolts come across the room from ring to ring.

Pilots (`node tools/archmage-pilot.mjs`: bossLab, REFILL health, 150 s cap, salts 1-3, all seven heroes) before and after,
REPORTED, not tuned to a number. Before this lane: **12/21 (57%), median win 98 s** (warden 0/3, pyro 0/3). The bot is taught to
leave a flared exit ring, to fly across a bent bolt's line, and to dodge through an open exit ring for the opening.
