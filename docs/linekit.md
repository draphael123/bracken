# THE LINE KIT — level API (claude/highlines-kit, 11-05)

The one engine for THE HIGH LINES (Sky Road -> HIGH LINES -> Ore Road; scratch/lane-reports/zipclimb-plan.md as amended by Daniel 11-05 15:27):
"mostly on the lines, mostly up", one rule (lines) varied every band. `src/line-kit.js` is a **pure module** (no DOM, no main.js). A level
declares data; main.js hands in the seats, their keys and the attack box, and draws from the state + events. Worked example: `src/linekit-lab.js`
(a data-only test room, on no level list). Proof: `node tools/line-kit.mjs` (Node only, no browser, ~55 s). Plan: `work/claude/highlines-kit-plan.md`.

**Status (claude/highlines1, 11-05):** WIRED. THE HIGH LINES greybox (src/highlines.js, DEV ONLY: ?level=highlines) runs on the kit through src/highlines-hands.js (main.js: load/reset/world/seat/held/mover hooks, the Hookjack as a main.js foe). Proof: node tools/highlines.mjs. Still owed: the page (browser) proof below.

_Was:_ module + lab + node proof only. main.js does not call it and no live level uses it (see "Wiring" — the HIGH LINES greybox lane does it).
The kit's lines are its own (`L.lineKit.lines`), never pushed into `L.zipLines`, so `src/zipline.js` and the six levels riding it are untouched.

## Declaring lines

```js
L.lineKit = {
  lines: [
    { id: 'W1', kind: 'winch', a: [12, 75], b: [34, 61] },                 // grip winch: each blow while hanging = a 40 px stroke up
    { id: 'W5', kind: 'winch', a: [..], b: [..], drive: 'post', posts: [[14, 75]] },   // post winch: strike the post, the line runs 2.4 s
    { id: 'W2', kind: 'winch', a: [40, 61], b: [66, 48], points: [{ at: 52, to: 'S1' }] },   // junction: UP held past x 52 -> S1
    { id: 'S1', kind: 'glide', a: [50, 54.6], b: [66, 58.6], secret: true },   // fast DOWN-line (300 px/s, BACK = brake) to a secret
    { id: 'F_r', kind: 'free', a: [68, 58.9], b: [45, 61] },               // today's rope feel (210 px/s downhill)
    { id: 'GD', kind: 'free', a: [25, 22.5], b: [58, 8], dir: 1, snap: { at: 40 }, cab: { onto: 'LO' } },   // THE GONDOLA set piece
    { id: 'W4', kind: 'winch', a: [69, 26], b: [44, 8], cut: true },        // a Hookjack may cut it (lint: a catch under every point)
  ],
  weights: [{ id: 'lift', a: { x0: 2, x1: 5, top: 25, bot: 41 }, b: { x0: 8, x1: 11, top: 25, bot: 41 }, rest: 0, tare: 0.5, hopper: [12, 40] }],
  winds: [{ id: 'gorge', box: [42, 38, 60, 49], dir: -1, period: 4, on: 2, told: 1.2, shove: 240, sway: 10 }],
  lee: [[61, 40, 72, 49], [33, 44, 41, 52]],
  anchors: [[50, 54.6], [36, 20.5], [58, 8]],                              // pylons a line end may hang from (else it must be over a landing)
};
// for the lint + the sweep the level also gives: L.landings [[x0, top, x1, bottom]] (landingsFromTiles(w, h, solid) builds these from tiles),
// L.nets (same shape: a cargo net), L.checkpoints [{ x, y }] (y = the landing's top row), L.secrets [[tx, ty]], L.exit [x0, y0, x1, y1]
```

All coordinates are TILES (fractions allowed); a line's `y` is the rope; the rider hangs 12 px under it (zipline's numbers).

| part | what the player does | what the kit guarantees |
|---|---|---|
| **winch, grip** | hang on, STRIKE: every blow is a crank stroke (40 px in 0.3 s; 2 more buffer) | the RATCHET: never a pixel back between strokes; the high end hops you onto its landing |
| **winch, post** | strike the post at the low station (a blow or a shot box) | the line runs 2.4 s at 110 px/s for EVERY seat on it; then holds |
| **free / glide** | ride downhill; hold BACK = brake x0.5; JUMP = kick (carries 0.8 of the speed), DOWN = drop | the low end lets you go onto its landing; a touch catches another line at once (not the one just left) |
| **points** | hold UP riding past the board | per seat: UP = the branch, nothing = carry on (DOWN always means drop) |
| **snap** | hear the CREAK, jump off in the 1.0 s tell or fall a level | a parted line is strung again after 8 s |
| **gondola** (`cab`) | step in; it sets off 0.6 s after a seat boards | creak (told) -> snap -> the cab falls and HOOKS ONTO `onto` -> runs it to the dock with every seat in it; empty, a new cab is home 8 s later. Lint flies the fall: it must land on `onto` |
| **counterweight** | stand in cage B and strike the HOPPER (a stone, 9, outweighs any party) - or one seat rides weight A down to send B up (co-op) | heavier side goes down (seat 1, A tare 0.5); empty 4 s -> stones out -> home |
| **wind** | told gust (1.2 s); ride WITH it x1.35, AGAINST it x0.6; riders SWAY (up to `sway` px, their hitbox too); a kick or fall in a gust is carried | lee boxes are calm; lint: a lee beside every wind box, and no WINCH line inside one (wind only in its own sections) unless the box says `exam: true` (the exam band: winch + wind + Hookjacks; a winch rider only sways) |
| **side line** (`secret`) | a branch to a pickup | lint: its run ends on a landing that holds a secret |

Calls: `lineInit(L)`, `riderStep(kit, P, inp, dt)` (per seat: `inp = { up, down, left, right, upPress, jumpPress, strike, hb }` -> events `take`, `kick`,
`drop`, `stroke`, `strike`, `points`, `creak`, `top`, `end`, `parted`, `lost`), `kitStep(kit, seats, dt)` (world -> `gust`, `gustTell`, `calm`, `snap`,
`restrung`, `cabBoard`, `cabGo`, `cabCatch`, `cabDock`, `cabHome`, `cabLost`, `cwStart`, `cwStop`, `stonesOut`), `kitStrike(kit, hb)` (any seat's blow
or a projectile's box on a post), `windAt(kit, x, y)`, `windPush(kit, P, dt)`, `platforms(kit)` (moving floors: cab floors, weight tops),
`lineRespawn(kit, seats)` (**party wipe / checkpoint reload only**: lines strung, cab + weights home, winds calm >= 3 s and told), `lintLines(L)`,
`drawLines` / `drawRider` (greybox shapes).

Foe hooks: `lineCut(kit, id, s)` (THE HOOKJACK: riders fall a level, strung again after s), `foeRide(kit, e, dt)` (a foe trolley rides either way:
`e = { line, x, dir, speed }`, returns `turn` / `fell`), `ridersOn(kit, seats, id)`, `leadPoint(kit, P, t)` (an ARCHER aims at where a rider will be
in t s - a winch rider's lead stops where his strokes end; draw it as the mangonel's ring), `riderHit(kit, P, { guard, from })` (`guarded`: kept the
grip, pushed back 24 px; `knocked`: off the line). Gust harpies (src/gale-harpy.js) read `windAt` / push `r.swayV` for their shove.

## Wiring (main.js sketch — DONE in claude/highlines1: src/highlines-hands.js + 16 one-line hooks tagged claude/highlines1)

```js
import * as LKT from './line-kit.js';
// level load:   L.lineKitState = L.lineKit ? LKT.lineInit(L) : null;
// update, beside updateTowerSlides (src/main.js ~18954, after ZL.zipStep):
if (L.lineKitState) { const kit = L.lineKitState, seats = partySeats();          // P, P2.. (the same list the leash uses)
  for (const e of LKT.kitStep(kit, seats, dt)) lineSfx(e);                      // gust whistle, creak, snap, cab clunk, ratchet...
  for (const S of seats) {
    const k = keysOf(S), struck = S.atk === 0 && S.atkT === 0;                  // a blow STARTED this frame (grip stroke / post / hopper)
    const hb = struck ? attackBox() : null;                                     // the seat's own attack box (src/main.js attackBox ~10514)
    if (hb && !S.lk) LKT.kitStrike(kit, hb);                                    // hopper / brake / post from the ground
    for (const e of LKT.riderStep(kit, S, { up: k.up, down: k.down, left: k.left, right: k.right, upPress: S.upPress, jumpPress: S.jumpPress, strike: struck, hb }, dt)) lineSfx(e);
    if (!S.lk) LKT.windPush(kit, S, dt);                                        // the air carries in a gust (Gale Moor's rule)
  }
  for (const shot of shots) if (shot.mine) LKT.kitStrike(kit, shotBox(shot));  // ranged heroes work posts from range
}
// movement: skip moveBody/gravity for a seat while S.lkHeld (the kit placed it); treat LKT.platforms(kit) as one-way floors (like rafts/lifts)
// attack gating: allow the forward swing while S.lk (a LINE SWING: no lunge/step); moves that move the hero (lunge, dash, plunge, vault, leap)
//   call S.lk = null first (let go). Tap C works on a line; a held guard that blocks a rider hit calls LKT.riderHit(kit, S, { guard: true }).
// respawn: on a party wipe / checkpoint reload call LKT.lineRespawn(kit, seats) (not when one co-op seat falls - the leash handles that)
// camera: while any seat S.lk is on a winch, raise CAM_FOOT 0.68 -> 0.80 (look up the line) - zipclimb-plan.md 2d
// draw: LKT.drawLines(g, kit, cx, cy, VW, VH, time) beside ZL.drawZips (~34221); LKT.drawRider(g, kit, S, cx, cy) after each seat (~35361)
```

## THE SWITCH RULE (claude/hlswitch, flag HL_SWITCH - level side not built yet; the kit is dormant until a level sets the rule)
`L.lineKit.rule = 'switch'` turns on ONE BLOW, THE WHOLE WAY and lever switches. Rule absent = every frame as before (the stroke rules above).
- **Latch.** The first blow while hanging on a winch sets `r.latch` and fires `latch`; the rider then runs at `LK.LATCH_SPEED` (120 px/s, or the line's own `speed`) to the high end and the usual top hop. Later blows are `swing`s (they can strike levers and posts, `kitStrike(kit, hb, 'line')`). Only a cut, hit, kick or drop takes him off; a new take needs a new blow (`r.latch` starts false). No blow = he hangs still (the ratchet). `STROKE`/`STROKE_T`/`STROKE_BUF` are unused under the rule.
- **Post lines.** A struck post sets `z.posted`: every seat on that line runs while any seat is on it, then `LK.POST_IDLE` (1 s). A hanging blow also latches the striker, so no walk back to the post. `POST_RUN` is unused under the rule.
- **Held glide.** `{ kind: 'glide', hold: true }` parks the trolley until one blow, then it is a normal glide. Lint: `hold` only on a glide, only under the rule.
- **Switches.** `lineKit.switches: [{ id, at: [tx, ty], states: 2, init: 0, from: 'foot'|'line'|'both', spring: 0, tag }]`; `lines[].points: [{ at, to, sw, on }]` is live iff `kit.sw[sw].state === on`. A `sw` point ignores UP (hold-UP is retired); the branch is decided when the rider crosses `at`. A point with no `sw` is a lint error under the rule. Each lever is a post of kind `'lever'` (foot blow / line swing per `from`).
- **API.** `kitThrow(kit, id)` toggles / advances the state (`states` > 2 wraps), cools `LK.SW_COOL` (0.4 s), returns `{ t: 'throw', id, state }` or null; a `spring` s > 0 returns the lever to `init` after that long (event has `spring: true`). A blow's throw is reported by the next `kitStep`. The level's `hllever` props (slice L) call `kitThrow` directly for shots. `lineRespawn` puts every lever at `init` and clears post runs. `switchConfigs(L)` + `setSwitches(kit, state)` give the soft-lock sweep its configurations (init, each switch in each other state, all thrown).
- **Lint** (`lintSwitches`): unique ids, `points.sw` names a switch, `on`/`init` < `states`, every switch drives a board, a foot lever stands on a landing / a line lever is within swing reach of a line, lever-to-board within `SW_REACH` (22 tiles across, 10 rows), no two switches on one board, no sw-less points, `hold` only on a glide, switches need the rule.
- **Foes never throw levers** (nothing in the kit lets them); `leadPoint` for a latched rider is `v*t`.

## Owed (not this lane)
- **Browser:** nothing here has run in the page. The greybox lane wires it and proves per hero in the page that the line swing, tap C and the
  stroke work while hanging (zipclimb-plan.md 2c: whether main.js starts swings while `P.cling` is set is UNPROVEN).
- **Art:** winch drum + crank grip (ratchet pawl), post winch + lever, points board (UP arrow), glide trolley, snap fray/whip, gondola cab
  (iron + canvas, no generic wood), counterweight cage + weight + hopper + stone, lee rock, gust streaks/sway, cargo net. Sounds: crank ratchet,
  post clunk, points clack, creak, snap, cab clunk/catch, hopper rumble, gust whistle (existing gustRise).
