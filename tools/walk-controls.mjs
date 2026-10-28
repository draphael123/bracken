/* tools/walk-controls.mjs - THE WALKER'S OWN HANDS CAN DO WHAT THE LEVELS ASK (claude/walkerctl, Daniel 10-09).
   The campaign walker (tools/level-walk.mjs + src/walk-graph.js) used to get stuck at STORMHOLD on its OWN controls, not the level: it only fetched
   keys on its own floor, could not climb the rope nets out of the chimney slots, could not take the zigzag one-way stair, and struck a kennel winch
   that drops a gate on its own road. This check keeps the four moves taught (generically - nothing here is Stormhold-only in the walker):
   A (node) the movement graph finds, for every lockgate on the route whose key stands off the floor, a way route -> key and back onto the route,
            and the zigzag stair's top from its foot;
   B (page, short walks from the spot - not the whole level):
        1 THE KEY UP A TOWER: Stormhold from col 285, the IRON key (299,20) four rows above the road (batch83 integ: stormtough's relayout put the brass key ON the road's own tower deck - the route climbs it, keyFirst takes it, no side trip - so the test is re-aimed at the iron key, which is still an off-floor key on a real side trip; same strictness) - the walk fetches it ("subs"
          has a key trip with got = true);
        2 THE ZIGZAG STAIR (484-499, rows 29-43), foes removed to read the footwork alone: the hero is at the top (route node >= 93);
        3 OUT OF A CHIMNEY SLOT: Pyro from col 219 falls into a slot (or jumps clear) and is past col 258 within 3000 frames - the net climb works;
        4 THE KENNEL WINCH (393,29) is left alone: the walk from col 376 gets past col 410 (the gate drops only if struck).
   PORT=8795 node tools/walk-controls.mjs */
import { LEVELS, T } from '../src/level.js';
import { makeGraph } from '../src/walk-graph.js';
import { routeOf, walkCfg, runWalks } from './level-walk.mjs';
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const lv = LEVELS.find(l => l.id === 'storm'), L = lv.build(), G = makeGraph(L, T), R = routeOf(lv);
const cellIdx = new Map(R.map((n, i) => [G.cell(n[0], n[1]), i]));
/* A: every key trip exists */
for (const g of L.ents.filter(e => e.t === 'lockgate')) {
  const k = L.ents.find(e => e.t === 'key' && e.kind === g.needs); if (!k) { ok(false, 'no key for the ' + g.needs + ' lockgate'); continue; }
  const kc = G.settle(k.x, k.y); ok(kc >= 0, g.needs + ' key has no footing');
  const gi = R.findIndex((n, i) => Math.abs(n[0] - g.x) <= 3 && Math.abs(n[1] - g.y) <= 3); ok(gi > 0, g.needs + ' gate is on the route');
  /* (batch125 integ, STORMHOLD 3) a key is no longer always beside its gate (the Wall Watch's bone key stands ~100 columns before its gate): the trip starts from the route nodes NEAR THE KEY when it lies before the gate, else from the 12 before the gate */
  let ki = -1, kd = 1e9; R.forEach((n, i) => { const d = Math.abs(n[0] - k.x); if (i < gi && d < kd) { kd = d; ki = i; } });
  const near = ki >= 0 && Math.abs(R[ki][0] - k.x) <= 12 && ki < gi - 12, lo = near ? Math.max(0, ki - 6) : Math.max(0, gi - 12), hi = near ? Math.min(gi, ki + 7) : gi;
  let best = null; for (let a = lo; a < hi; a++) { const p = G.path(G.cell(R[a][0], R[a][1]), v => v === kc); if (p && (!best || p.length < best.length)) best = p; }
  ok(best, g.needs + ' key (' + k.x + ',' + k.y + '): no way from the route');
  const back = kc >= 0 ? G.path(kc, v => cellIdx.has(v) && cellIdx.get(v) > lo) : null; ok(back, g.needs + ' key: no way back onto the route');
  if (best) console.log('  ' + g.needs + ' key trip: ' + best.length + ' cells there, ' + (back ? back.length : '?') + ' back');
}
//(batch125 integ) the zigzag one-way stair went with the old Stormhold (STORMHOLD 3 has no houses); the stair check is retired with it
/* B: short page walks (batch125 integ: retargeted to STORMHOLD 3 - the iron key up THE BELL WATCH (222,17), the bone key up THE WALL WATCH (391,19), and the winch at 410,29 left alone;
   the old zigzag stair, chimney slots and kennel went with the old castle town; the thresholds are read off the route, not hard-coded) */
const pct = col => { const i = R.findIndex(n => n[0] >= col); return Math.floor(100 * (i < 0 ? R.length : i) / R.length); };
const W = (o, id = 'storm', hero = 'knight') => walkCfg(id, hero, 1, { stuck: 1500, ...o });
const rows = await runWalks([W({ from: 200, frames: 4800 }), W({ from: 366, frames: 3000 }), W({ from: 396, frames: 2600 })], { jobs: 1 });
const [kr, br, wr] = rows;
for (const r of rows) if (!r || r.err) fails.push('a walk failed: ' + (r && r.err));
/* the key is fetched when the walk gets PAST its lock gate (the route climbs the tower itself, keyFirst takes the key - no side trip: subs stay empty) */
const pastGate = (r, name, col, n) => { if (r && !r.err) { const need = pct(col + 6); ok(r.walked >= need, n + ' the ' + name + ' key was not fetched: the walk did not get past its gate at col ' + col + ' (walked ' + r.walked + '%, needs ' + need + '%)'); console.log('  ' + n + ' ' + name + ' key: walked ' + r.walked + '% (past the gate at ' + col + ' = ' + need + '%)'); } };
pastGate(kr, 'iron', 262, 1); pastGate(br, 'bone', 488, 2);
if (wr && !wr.err) { const need = pct(420); ok(wr.walked >= need, '3 the winch: the walk did not pass col 420 (walked ' + wr.walked + '%; col 420 is ' + need + '% of the route)'); console.log('  3 winch: walked ' + wr.walked + '% (col 420 = ' + need + '%)'); }
if (fails.length) { console.log('walk-controls: FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('walk-controls: ok');
