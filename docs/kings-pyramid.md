# THE KING'S PYRAMID - the act-V exam (claude/kingspyramid, OPUS greybox 11-06)

Behind a flag: `src/kings-pyramid.js` `KP_SHIPS = false`. Off, `src/level.js` does not append the row (LEVELS = master).
On (`?kp=1`, `globalThis.BRACKEN_KP`, `KP=1` in Node) the row is appended HIDDEN: play with `?kp=1&level=kingspyramid`.

| file | what |
|---|---|
| `src/kings-pyramid.js` | the flag, the level (SUNLESS DOOR -> HALL OF DOORS + 5 rooms -> DESCENT -> arena), `L.kp` room data, the mirror room as `L.sunRooms` |
| `src/kp-rooms.js` | pure room engine: linen, cracked stone + hung ledge, weights/cleats, gates, sliding presses (+ jam), switches, spike floors, sun shutters, THE DEATHLESS (doomed only by the tomb), keys + great door, the descent (told debris, end-only boarders), `lintKP` |
| `src/gilded-guard.js` | THE GILDED GUARD rule: lit = stripped (`e.disarmed`), gold plate x0.6, x1.25 stripped, must leave the light to be stripped again |
| `src/five-seals-king.js` | THE KING OF FIVE SEALS (pure): 4 phases, verbs mirror / fire+keg / press / any (one at a time), B15 x0.4, x2 openings + purse, ward, seal breathers, 7 told moves + boulders, court, storm, `ksPlan` bot |
| `src/kp-hands.js` | world binding + greybox drawing; carried FIREBRAND / KEG on main.js's `P.carry` protocol and `src/carry-throw.js` arcs |
| `tools/kings-pyramid.mjs` | node proofs (flag both ways, reach as built / as played, rooms, guard, King, hands smoke, toy duel) |

main.js: 15 one-line hunks, each gated on `KPH && KPH.on()` (only a level with `L.kingspyramid`) or on the boss type `kingseals` / the `kp` foe tag.
