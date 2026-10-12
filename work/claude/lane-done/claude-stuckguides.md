# claude/stuckguides - STUCK GUIDES for the older levels (data only)

DATA ONLY in src/stuck-spots.js: a glint + the 10 s stall nudge (shared src/stuck-guide.js) on the route verbs of the 14 zero-guide levels and the 6 one-spot levels.
Every spot is keyed by a unique id (`wd-`, `ms-`, `sp-`, ...) so a rework (wood, marsh, undercrown, towpath next week; witchlight2, hurricane2, flotilla2) can delete or rewrite a level's block in one place.
New blocks sit before `causeway:` under a `(claude/stuckguides)` comment; the six one-spot levels got their new spots appended inside their existing arrays (existing spots first, untouched).
No geometry, no signs, no ents moved; level hashes unchanged. No sign was added: every verb below already has a sign at or near its point of use (see "Verbs with no sign" at the end).
tools/stuck.mjs: ONE harness fix (runtime part only): before each spot's teleport it opens the level's crank walls (a closed palisade clamps a teleported hero west of it, so the stockade's 2nd/3rd crank, lifts and gates could not be probed). Nothing weakened.

## Per level: spots added (verbs covered)
| level | added | total now | verbs covered |
|---|---|---|---|
| wood | 3 | 3 | felltree pine at the gap, the pond's drifting log (mover), felltree pine at the hive |
| marsh | 4 | 4 | ferry crank + sluice (west), ferry crank + sluice (grove), the two vine swings |
| spore | 12 | 12 | bud caps (x4), lean caps (x3), vent + the cap it feeds, the canopy cap, the bog cap, the glowbud cluster, the last bud |
| flotilla | 6 | 6 | four swing lines, the powder-hoy plank, the flagship's gun (hole) |
| hurricane | 6 | 6 | two bulkhead + gun pairs, pump 246, pump 508, the davit winch, the loose gun + cargo wall |
| deep | 4 | 4 | the stone at the start, and the stones at the bottom / beds / prise decks (ballast carry) |
| keep | 5 | 5 | the four whirlpool levers, the cistern ballast |
| waymeet | 3 | 3 | portcullis drum (winch), hod-hoist, scaffold board |
| undercrown | 6 | 6 | six timber sets (cut -> mound). The two "going" sets (28,53 / 44,53) were dropped: they fall on their own |
| fields | 11 | 11 | troughs / sluices / buckets that grow the vines (x6), haunted furniture, mill gears + sails, barn bale, hay cart, rising headstone |
| burial | 8 | 8 | the six grave candles + the vents they light, the coffins (x2), the rotten bridges |
| mage | 13 | 13 | postern rune, sliding cases (x2), vault lock runes (steps), his own lock (steps), library shelves, counterweight, cellar key, orrery, brass lockgate, two glyph rooms, last weight |
| witchlight | 16 | 16 | drifting slabs, rune columns (x6), floating arches (x2), glyph bridges (x3), moat wind wells (x2), cracked slabs (x2) + the vents between |
| harbor | 3 | 3 | the two salvage cranes, the cargo-hall lift (shelved level) |
| stockade | 4 | 5 | cranks 2 and 3, the tower lift, the horn-tower lift (crank 1 was the old spot) |
| kings | 6 | 7 | three ram levers, three hunting-stand posts (court gate was the old spot) |
| hanging | 4 | 5 | the water wheels, the mill / nest / crown hoists (the rope hoist was the old spot) |
| oreroad | 6 | 7 | the six ore-bucket boarding ledges (cracked wall was the old spot) |
| crown | 6 | 7 | portcullis winch, ward gate key + gate, pit bucket, pit hoist, keep winch, hall iron key + gate (chapel keys were the old spot) |
| causeway | 2 | 3 | the first tide bell, the chapel tide bell (the boom bell was the old spot) |

Total: 128 spots added (100 in the 14 zero-guide levels, 28 in the 6 one-spot levels).

## Checks (PORT 8843, one at a time)
- `node tools/stuck.mjs --static`: OK (2398 checks, 277 steps in 250 spots over 37 levels).
- Page probe (a hero held 11 s at each spot, filtered to the touched levels in batches): every spot in the touched levels (129 incl. the old ones) nudges, glint and feed the way arrow. The probe found and I fixed four zone overlaps (spore buds 250/257, fields barn bucket/bale, witchlight rune columns and wind/slab zones).
- `node tools/hint-shown.mjs`: OK. `node tools/deadends.mjs`: 264 dead ends, all pay.
- `node tools/textfit.mjs`: ran to the end (8 min); no new text on any screen (nudges are hint-box lines <= 62 chars), only the tail was kept.
- Route pilot: `level-walk marsh,spore --heroes=knight --seeds=1` ran clean (no crash). The bot reports STUCK on spore at route nodes 56,11 / 205,13 / 384,14 / 488,19 (bot limit: it cannot stand still on a bud). I added the cap-52 cap to the vent spot and widened the 477 bud to the Mother's door in answer; 384,14 (the pillars) has no growcap/mover to point at and is not guided.

## Verbs with no spot, and why (decide if wanted)
- wood: the pushblock 157 (not a route gate); marsh: pads/gar/eel (foes, not verbs).
- flotilla: nets (climb tiles, no ent to point at); hurricane: the lines/ropes on the wave (no ent), the hatches.
- deep: air pockets (airRooms) - the stall nudge cannot tell "out of breath" from "stuck"; the Bell Grave stone/valve is boss arena (a stall nudge in a boss fight would nag).
- keep: siphons, bell guard (boss side).
- waymeet: the inn doorways (optional rooms), the king's-bridge refuges (no ent).
- spore: the pillars' caps (no ent), the Mother's marked root (boss arena).
- undercrown: the two "going" sets, the sentry bell (breaking it is a trap), the rail carts; tomb sets are the Prince's fight.
- oreroad: the winchmaster arena; crown: the boss pillars/winch 909, the furnace carts.

## Verbs with no sign
None added. Every verb above has an existing sign within a screen of its point of use, except two minor ones (no sign, guided only by the nudge): wood's pond log (355,12) and witchlight's drifting slab (22,81)'s partner arches are covered by the stair/aqueduct signs; the harbor cranes are covered by sign 176.

## QUESTIONS FOR DANIEL (rec first)
1. Rec: leave the glints on `stall` (they only show after the 10 s stall, so a first-time player sees nothing extra). Option: switch the keys / lockgates / levers to `always`. Built: stall everywhere except the existing always-on spots.
2. Rec: add a sign at wood's pond log (355,12) in the wood rework next week (it is the walker's drowning spot) rather than now. Built: nudge only.
