# THE UNBURIED FIELD — optional Death Knight level, brief (queued AFTER THE WITCHLIGHT STAIR; agreed with Daniel 2026-09-21)

## What Daniel asked for
"An optional level to unlock the death knight that has its optional fork created after beating [the Witchlight Stair]."
He approved the structure, the distinct features, the platforming and the hazards below.

## Where it sits, and what it opens
- A side road off THE WITCHLIGHT STAIR on the world map, revealed when the Stair is cleared. Optional: it gates nothing
  (the Mage's Folly needs only the Stair). `{ id: 'unburied', name: 'THE UNBURIED FIELD', needs: 'witchlight', optional }`.
- **Clearing it opens THE DEATH KNIGHT (hero 'reaper') for COINS (~800).** Same rule as the other class levels (burning
  village / powder deck / lit church): heroes otherwise cost 10 silver; NO consolation prize for owners.
- Playable by any hero; it rewards crowd-fighting, which is the Death Knight's strength, without locking anyone out.

## The idea: THE GHOST BATTLE IS STILL BEING FOUGHT
An old battlefield on the far side of the tower's hill: a war ended there and nobody buried the dead, and every dusk they
fight it again. Almost everything new comes out of that battle - it is the danger, the cover and the way up.

### THE DEAD WON'T STAY DOWN (the enemy rule)
Fallen soldiers lie across the field. When a BANNER-BEARER raises his standard, the dead near it rise and rejoin. Cut the
bearers to stop it, or fight a growing crowd. Burned or scythed corpses do not rise again.

### What makes it distinct (beyond the rising)
1. **THE VOLLEYS.** Spectral archers on the ridge loose volleys across the field on a rhythm, a war-horn before each. Cover:
   upturned shields, wagons, siege mantlets. Crossing becomes cover-to-cover timing.
2. **SIEGE ENGINES YOU WORK** (a prop every ~3 screens, the audit bar): a loaded ballista (a bolt down a trench of dead), a
   trebuchet (smashes a stake wall / opens a route).
3. **BATTLEFIELD GROUND.** Trenches to drop into and climb out of, stake lines that hurt, churned mud that slows (the Hexed
   Fields' bog), craters. HIGH ROUTE over the wreckage = dry but exposed to volleys; LOW ROUTE through the trenches =
   sheltered but slow and crowded.
4. **LOOK AND SOUND.** Red-gold dusk, the tower on the skyline behind, torn banners, arms littering the field; the ghost
   armies clashing faintly in the background; horns and the old battle under the music.
5. **THE FIELD CHANGES AS YOU GO.** Each banner-bearer killed takes his part of the ghost army with him: that stretch of
   ridge stops firing and the background battle there goes quiet. By the chapel you have ended the battle behind you.

### Platforming
- **THE TOPPLED SIEGE TOWER**: a wrecked siege tower lying at an angle across act 2 - a vertical climb (ladders/NET, ropes,
  broken decks). A trebuchet shot knocks part of it loose: a new route opens and the old one falls away.
- **ARROW PEGS (new, the signature)**: a volley that hits a wooden wall/palisade leaves its arrows standing in it for a few
  seconds, and you can stand on them. Wait under cover, then climb the arrows before they fade.
- **CATAPULT ARMS AND CHAINS**: swing across trench gaps (existing swings).
- **CORPSE MOUNDS** that give way into mass-grave pits (the Burial's crumbling floors) - the fast, risky line.

### Hazards
- **THE GHOST CAVALRY CHARGE (new, red ✕)**: horns, dust on the horizon, then a line of spectral cavalry across a lane.
  Get off the ground (wreck, mound, arrow pegs). It sweeps enemies away too.
- **BURNING PITCH**: knock over a siege-oil barrel and it spills a line of fire (the burning-ditch fire) - hazard and tool.
- **STAKE LINES** and **SIEGE DEBRIS** that shakes before it drops (the tower's falling stones).
- **THE VOLLEYS** (above): timed, horn-warned, blocked by cover.

## The route, three acts
1. **THE BARROW LINE** — trenches and grave mounds; the banner rule taught on small fights; first volleys and cover.
2. **THE BROKEN CHARGE** — open field, wrecked siege engines, heavy crowds, the toppled siege tower, the cavalry lanes;
   high route vs low route. **THE STANDARD-BEARER** mini here.
3. **THE CHAPEL OF THE FALLEN ORDER** — a ruined knightly chapel, a sealed-crypt ambush, then the boss.

## THE STANDARD-BEARER (mini)
A huge undead herald with the army's great banner. Every time he PLANTS it a wave rises: take the banner from him to stop it.
Build detail: his tells (`!`/red ✕), the touch rule, a player-made opening (e.g. the plant is the window - cut the banner
while it is in the ground), new baker, pilot >= 21 runs.

## THE FIRST DEATH KNIGHT (boss)
The one whose armour and scythe the class inherits. His fight TEACHES the class by turning its kit on you:
- **THE SWATHE** — a wide arc whose INSIDE barely cuts: close in to be safe.
- **THE REAPING** — a full circle that drags you in.
- **THE PASSING** — he steps through you and leaves a mark that goes off (red ✕: leave it).
- **RAISE** — calls up the dead you have killed.
- **THE OPENING (player-made):** let his Reaping drag in a raised corpse and he cuts his own dead - he is left open.
  Unprovoked, the Reaping opens nothing (tools/boss-openings.mjs proves it).
- Beating him opens the Death Knight purchase. Touch rule; one clear answer per attack; new baker; pilot >= 21 runs.

## Rules every level keeps
GARRISON row + no blanket calm; ELITES row; 3.5-4.5 foes/screen; checkpoints; 3 silvers; dead ends pay; deadly water only
if marked (tools/deadly-water.mjs); `tools/unburied.mjs` in check.mjs. Likely two sessions (level + mini, then boss + unlock).
