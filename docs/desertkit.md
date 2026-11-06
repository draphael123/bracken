# THE DESERT KIT (claude/desertkit, 11-05)

Five pure modules that let a desert level declare its rules in DATA, built ON the desert's existing rules (no rebuild, plan-desert-1105 section 3):

| module | built on | level field | Node proof |
|---|---|---|---|
| `src/sun-kit.js` | `sunstroke.js` (the meter, the drain) + `drain.js` | `L.sunKit` | `tools/sun-kit.mjs` |
| `src/storm-kit.js` | `desert-rules.js` STORM | `L.storms` | `tools/storm-kit.mjs` |
| `src/sink-sand.js` | `quicksand.js` | `L.sinkSand` | `tools/sink-sand.mjs` |
| `src/mirage-kit.js` | `desert-rules.js` MIRAGE | `L.mirages` | `tools/mirage-kit.mjs` |
| `src/sun-puzzle.js` | `light.js` (trace, templeSun, burn) | `L.sunRooms` | `tools/sun-puzzle.mjs` |

`src/desertkit-lab.js` = THE SUN COURT (LAB), one data-only room using every feature (on no level list). Copy blocks from it.
All boxes are TILES `[x0, y0, x1, y1]` inclusive (sunstroke's old `L.shade` px rects still work beside them). Every tool lints every `LEVELS` entry that declares its field.
Nothing in main.js calls the kit yet: the first level lane that uses a module wires it (sketch below). Every hero, 1-4 seats: each body carries its own state.

## 1. THE SUN KIT (heat / shade)
```js
sunKit: { profile: 'glare',                       // open | glare (x1.25 fill) | dusk (x0.6) | night | interior (no sun)
  cool: [[0,17,6,21]], water: [[15,20,19,21]],    // shade boxes; water cools x2.5 faster than shade
  hot: [[20,21,27,21]],                           // sun-glass / furnace mouth: fills x1.6
  zones: [{ box: [62,0,71,21], profile: 'interior' }] }
```
- `S = sunKitInit(L)`; per frame `const m = sunSeats(S, players, dt, { inWater: p => p.swim, shaded: cvShaded })` -> Map(hero -> { rate, stage, swim, exposure, struck }).
- Feed `m.get(p).rate` into the existing drain exactly as sun-hands does (`DR.set(p, 'sun', rate, { floor: 1 })`). The penalty is the existing one: the DRAIN, 1.2% -> 4.5% max hp a second, floor 1 hp. **It never kills, never stuns.** At a full meter `struck` is true: `heatRead(r)` says `SUNSTRUCK - FIND SHADE`.
- `sunReset(p)` on respawn / level change. `lintSun(L, route)` keeps every sun walk within `SUN.maxWalk` (scaled by profile and hot glass).
- **THE DESERT PRIEST HOOK** (plan Q4 rec: no immunity, the sun feeds him): in the claude/desertpriest kit's radiance line, multiply the fill:
  `gain(p, (lit ? fill * (api.sunFeed ? api.sunFeed(p) : 1) : -drain) * dt)` with main.js `api.sunFeed = p => sunFeed(SUNKIT_RES.get(p))` -> x1.5 in open sun (full in 4 s, not 6), x1.8 on hot glass, x1 in shade/water/night. Also count `exposure === 'sun' | 'hot'` as lit in `lightsHere`.

## 2. THE STORM KIT (sandstorm)
```js
storms: [{ id: 'court', box: [28,8,52,21], dirs: [1,-1], cycle: { calm: 3.2, warn: 1.4, gust: 1.6 },
  push: 150, sight: { calm: 260, gust: 120 }, lee: [[49,17,50,21]], phase: 0, weight: { hero: 1, foe: 0.6 } }]
```
- `K = stormInit(L)`; per frame `for (const e of stormKitStep(K, dt))` say the tell (`warn`: hiss + `THE STORM >>  BRACE (BLOCK)`), then
  `stormBodies(K, [...players, ...foes], dt, { braced: p => keys.block && p.ground, grounded: b => b.ground, kind: b => b.isFoe ? (b.heavy ? 'heavy' : 'foe') : 'hero', move: (b, dx) => moveBody(b, dx, 0) })`, `stormShots(K, seeds, dt)`.
- Draw: `stormView(K, players)` -> one sight circle per live seat; darken outside their union. `stormSight(K, x, y)` for a single point.
- Defaults = desert-rules frame for frame. Lint: warn >= 1.2 s, gust sight >= 96 px, braced drift < a tile, lee inside the storm.
- Fold the two hand-run storms (main.js CV.storm / sealed-pyramid-hands stepStorm, one shared remainder for one hero) when their levels are next touched.

## 3. SINKING SAND
```js
sinkSand: [{ id: 'pit', x0: 38, x1: 42, y: 22, mode: 'pit' },     // surface row AIR, rock under (= quicksand.js)
           { id: 'dune', x0: 43, x1: 52, y: 22, mode: 'dune' }]    // THE GREAT DUNE: footing while you run; slow 0.35 s and it takes you
```
- `K = sinkInit(L)`; per frame `sinkBodies(K, players, foes, dt, { input: p => ({ move, jumpPress }), speed: SET.speed })`.
  For a hero result: `footing` -> treat as ground; `held` -> no coyote, no ground (as main.js does today); `ripple` 0..1 -> draw the told ripple.
- Foes: held = no walk (it may still strike: not a stun), out after 2.4 s (heavy x2) the way it faces; `SAND_KIN` (scorpions, worm, grasper, skiff riders, flyers) never sink. Never killed by sand.
- Same verb everywhere: JUMP AND KEEP JUMPING. Lint: rock under, footing to jump out onto both sides, no spikes in reach.

## 4. MIRAGES
```js
mirages: [{ id: 'bridge', kind: 'ledge', box: [54,22,56,22] }, { id: 'door', kind: 'door', box: [58,19,58,21] },
          { id: 'oasis', kind: 'oasis', box: [59,20,61,21] }, { id: 'well', kind: 'oasis', box: [15,20,19,21], real: true }]
```
- `M = mirageInit(L)`; per frame `mirageStep(M, dt, { seats: players, time, profile, gust })` -> each entry's `alpha` + `shimmer` (px) to draw; `seen` events for a once-a-level line `A MIRAGE - IT SHIMMERS`.
- Never footing (`mirageSolid()` is false: never put a mirage in the grid). A real thing never shimmers. No mirage at night/indoors/in a gust.
- **SHADE STALKER** look for the 11-06 wiring lane: `stalkerLook(exposureAtFoe, commitT)` -> alpha (0.08 in glare, 1 in shade) + a 0.4 s told shimmer before it strikes.
- Lint: a trick, never a trap (the fall under a ledge/oasis lands within 4 rows, climbable, no spikes); a door is walkable.

## 5. SUN / LIGHT PUZZLES
```js
sunRooms: [{ id: 'hall', box: [62,1,70,21],
  sources: [{ x: 66, y: 0, dir: 'S' }],                          // or { windows: [...], day: 40 } = the Sun Temple's moving sun
  mirrors: [{ x: 66, y: 9, state: '/' }, { x: 70, y: 9, state: '/' }],
  doors: [{ id: 'sundoor', kind: 'sun', eye: [70,15], opens: [71,19,71,21], mode: 'latch' },   // or 'hold' (told, then shuts - never on a body)
          { id: 'cache', kind: 'cache', eye: [69,5], opens: [70,4,70,6], optional: true },      // DESERT PRIEST only (plan Q5)
          { id: 'lamp', kind: 'lamp', eye: [62,9] }] }]                                          // either light
```
- `R = sunRoomsInit(L)`; on every landed blow / shot box: `strikeMirrors(R, box)`; per frame `sunRoomsStep(R, dt, { tileAt, opaque: makeOpaque(T, isSlope), priestBeams, bodyIn })` -> events (`open`, `tell`, `shut`, `lamp`).
  `priestBeams` = the priest's beam as tile rays `[{ x, y, dir }]` (his row E/W, or N for his UP beam).
- Collision: use `gridOf(R, tileAt)` (shut leaves are solid). The beam drawing takes `R.rooms[i].res.segs` (sun) and `.pres.segs` (priest) -> the beam-path module.
- `sunBurn(R, body, dt)` = the sun burning the dead in its light. **The rule:** sun-doors answer to the SUN only; caches to the PRIEST only.
- Lint: solvable (`solveRoom`, latched chains), not solved as it stands, every turnable mirror struck from footing, caches optional and beamable from footing.

## Wiring sketch (main.js, for the first level lane)
At level load: `DK = { sun: sunKitInit(L), storm: stormInit(L), sink: sinkInit(L), mir: mirageInit(L), rooms: sunRoomsInit(L) }`.
In the play update (after movement, before damage): the five steps above, one line each; respawn: `sunReset(p)`, `p.qsDepth = 0`, `p.gustAcc = {}`.
Keep the existing quicksand loop for `L.quicksand` levels until each is folded (a `sinkSand` pit is the same rule).
