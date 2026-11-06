# THE WATER KIT — level API (claude/waterkit, 11-05)

Two shared systems for the sea arc (scratch/plan-water-1105.md §3a/3b). Both are **pure modules** (no DOM, no main.js): a level declares data,
main.js hands in its pieces (poolLevel, the attack box, the seats, a collision-aware move) and draws from the events. Worked example of both:
`src/waterkit-lab.js` (THE TIDE BASIN, a data-only test room). Proof: `node tools/tide-kit.mjs`, `node tools/pull-field.mjs` (Node only, no browser).

**Status:** WIRED (claude/water1, 11-05): `src/pirate-fleet-hands.js` runs the kit for ANY level that declares `L.tides` / `L.pulls` (main.js `PFH`: clear on load/respawn, update, strike, mover, draw, hud). First user: THE PIRATE FLEET (hidden, dev only). The kit tools now lint the BUILT level of every LEVELS row. Not yet folded: the old per-level tides listed at the end.

## TIDE KIT — `src/tide-kit.js`

```js
L.tides = [{
  id: 'saltreach', pools: ['harbour'],            // pools it drives (pool.id), or give a pool `tide: 'saltreach'`
  lo: 40, hi: 31,                                 // water line at LOW / HIGH, tile rows (hi < lo)
  cycle: { low: 9, warn: 3, rise: 3, high: 7, turn: 2, fall: 3 },   // seconds; warn + turn are THE TELLS
  rate: 1,                                        // per-act tempo (<= 2.5); tells never drop under 1.5 s
  safe: 'low', grace: 6,                          // a respawn: this phase, >= grace s before it moves
  floods: [{ x0, y0, x1, y1, from }],             // tile boxes under water (below the line, or k >= from)
  floats: [{ id, x0, x1, y, top, free: 4 }],      // ride the surface between rest row y and top row; deck `free` px proud
  lifts:  [{ id, x0, x1, yLo, yHi }],             // driven by k (0 low -> 1 high), not the surface
  bites:  [{ x0, y0, x1, y1, when: 'low'|'high', at, kind }],      // hazards live only at one end
  foes:   { crab: 'low', eel: 'swim', sailor: 'flee', bonegob: 'drown' },
  verbs:  [{ t: 'bell', x, y }, { t: 'sluice', x, y, hold: 6 }],   // props the player strikes
}, {
  id: 'vault', mode: 'manual', flip: 'fill', lo: 40, hi: 33, cycle: { rise: 2.5 },   // A CHAMBER: moves only by its lever
  floods: [...], verbs: [{ t: 'lever', x, y, swim: false }],
}];
```

The cycle: `low -> warn (3 tolls) -> rise -> high -> turn (1 toll) -> fall -> low`. Rise and fall ease (slow, then all at once, then slow).

| verb | what it does |
|---|---|
| **bell** | at low water: the warn starts now (shortened to 2 s, still 3 tolls, never untold). Later in the cycle it is only a bell. |
| **sluice** | a rising/high tide turns back from where it is and is held out at low for `hold` s; `released` event when it lets go. |
| **lever** | a manual chamber fills/drains at its rise rate. Its mark key (`tide:<id>:lever:x,y`) survives death + reload. |

Calls: `tideInit(L, { off: marks })`, `tideStep(kit, dt) -> events` (`toll`, `phase`, `turn`, `float {dy}`, `released`), `tideApply(kit, L.pools, poolLevel)`,
`tideStrike(kit, hb)` (any seat's attack box), `tideRespawn(kit)` (**call on a party wipe or checkpoint reload only, not when one co-op seat falls**),
`gauge(kit, id)` (the one A3 water-line dial: `{ k, ph, next, left, tell, held, coming }`), `lineY`, `kOf`, `flooded(kit, tx, ty)`, `bites(kit, tx, ty)`,
`floatY`, `liftY`, `riders(bodies, dy, x0, x1, top)` (every seat standing on it moves), `foeTide(kit, e)` (`{ active, buried, swim, lineY, flee, drown }`),
`lintTide(L, { run })`.

**Lint (tools/tide-kit.mjs runs it on every level with `L.tides`):** hi above lo; declared tells >= 1.5 s at the rate; rate <= 2.5; pools exist;
floats/lifts move; bell/sluice above high water; chamber lever reachable full (or `swim: true`); a manual chamber has a lever; every checkpoint inside
a flood box is dry at high water OR names `dryX` and the slowest hero reaches it inside grace + warn.

## PULL FIELD — `src/pull-field.js`

```js
L.pulls = [{
  id: 'rip1', kind: 'current' | 'toward' | 'away' | 'whirl',
  box: [x0, y0, x1, y1] /* or */ ring: [x, y, r],  // tiles; a ring's eye = tile centre; `at: [x, y]` moves the eye
  dir: [1, 0],                                     // current only
  strength: 60, curve: 'flat'|'linear'|'ease'|'edge'|'core', swirl: 0.6,   // px/s at full; whirl: share that goes round
  cycle: { off: 3, tell: 1.5, on: 4 },             // optional told pulse; off = THE RELEASE WINDOW
  water: true,                                     // false = it takes the dry too (a gust)
  weight: { hero: 1, foe: 0.6, shot: 1 },          // e.heavy halves, e.anchored / e.noPull skip; s.heavy halves a shot
  posts: [[x, y]],                                 // grab posts (a body holding within 14 px is anchored)
  tide: 'saltreach', phases: { rise: -1, fall: 1 }, // optional: flow sign by tide phase; slack otherwise
  lethal: false, col, tellCol,
}];
```

**Classes** by grip at the core (whirl: `strength * sqrt(1 - swirl^2)`), against SWIM 96: **drift** <= 48, **strong** <= 82 (you swim up it slowly),
**rip** above (you need an answer). **Answers:** swim against (drift/strong), **hold a post**, **dash/roll** (takes 15%, then 50% for 0.25 s), **block/aegis**
(50%), **the release window** (`cycle.off`). In its tell a field stirs at 15% (drawn faint, felt as a nudge, never a grab).

Calls: `pullInit(L, { off })`, `pullStep(F, dt, { tidePh }) -> events` (`tell`, `on`, `off`), `pullBodies(F, bodies, dt, io)` with
`io = { inWater(b), holding(b), dashing(b), move(b, dx, dy), kind(b) }` (defaults read `b.swim`, `b.hold`, `b.dashT/rolling/dash`, `b.foe`) -> events
(`enter`, `leave`, `grab` per body), `pullShots(F, shots, dt)`, `flowAt(F, x, y, who)`, `flowParts(F, dt, view, rand)` (placeholder flow specks,
main.js `parts` format), `classOf`, `gripOf`, `postNear`, `pullStill(F, id)` (returns the mark `pull:<id>`), `lintPulls(L)`.

**Co-op:** each body keeps its own sub-pixel carry (a WeakMap) — the old `src/whirlpools.js` shared one accumulator across seats. A post anchors only
the seat holding it. The dead are left alone. Enter/leave/grab events are per body.

**Lint:** unique ids; known kind and curve; a reach; tells >= 1 s; release window >= 1 s; posts inside their field; every rip has a post, a release
window, or is at most two dashes across (or `dashOut: true`); no field a dash cannot slip; a lethal core needs a post or a window.

## Wiring (owed to the first level that uses it)

In main.js, once per level load / respawn / step (sketch — not yet in the game):

```js
TK = tideInit(L, { off: marks }); PF = pullInit(L, { off: marks });                         // level load
for (const e of tideStep(TK, dt)) { if (e.t === 'toll') SFX.seaBell(); /* foam line on 'turn' */ }
tideApply(TK, L.pools, poolLevel);
const v = tideStrike(TK, hb); if (v && v.t === 'lever') marks.add(v.key);
pullStep(PF, dt, { tidePh: gauge(TK)?.ph });
pullBodies(PF, [P, ...partners, ...enemies], dt, { inWater: b => !!b.swim, holding: b => b === P && keys.up, move: (b, dx, dy) => moveBody(b, dx, dy, false) });
pullShots(PF, shots, dt); parts.push(...flowParts(PF, dt, { x0: camX, y0: camY, x1: camX + VW, y1: camY + VH }));
// party wipe / checkpoint reload only: tideRespawn(TK)
```

Existing tides to fold in when their levels are next touched: Saltreach `streetTide`, the Causeway `causeTide`/`CT`, the Herald `arenaTide`,
the Tollmaster `rising` square, Keep `whirlpools.js` (-> a `whirl` field + `pullStill` on its lever; the plan benches it after Keep 2).
