/* tools/walk-controls.mjs - THE WALKER'S OWN HANDS CAN DO WHAT THE LEVELS ASK (claude/walkerctl, Daniel 10-09).
   The campaign walker (tools/level-walk.mjs + src/walk-graph.js) used to get stuck at STORMHOLD on its OWN controls, not the level: it only fetched
   keys on its own floor, could not climb the rope nets out of the chimney slots, could not take the zigzag one-way stair, and struck a kennel winch
   that drops a gate on its own road. This check keeps the four moves taught (generically - nothing here is Stormhold-only in the walker):
   A (node) the movement graph finds, for every lockgate on the route whose key stands off the floor, a way route -> key and back onto the route,
            and the zigzag stair's top from its foot;
   B (page, short walks from the spot - not the whole level):
        1 THE KEY UP A TOWER: Stormhold from col 37, the brass key (44,22) behind a net and a plank, a scalder on the net's top - the walk fetches it ("subs"
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
  let best = null; for (let a = Math.max(0, gi - 12); a < gi; a++) { const p = G.path(G.cell(R[a][0], R[a][1]), v => v === kc); if (p && (!best || p.length < best.length)) best = p; }
  ok(best, g.needs + ' key (' + k.x + ',' + k.y + '): no way from the route');
  const back = kc >= 0 ? G.path(kc, v => cellIdx.has(v) && cellIdx.get(v) > Math.max(0, gi - 12)) : null; ok(back, g.needs + ' key: no way back onto the route');
  if (best) console.log('  ' + g.needs + ' key trip: ' + best.length + ' cells there, ' + (back ? back.length : '?') + ' back');
}
const foot = G.settle(486, 43), top = G.settle(493, 28); ok(foot >= 0 && top >= 0 && G.path(foot, v => v === top), 'the zigzag stair: no way from its foot to its top in the graph');
/* B: short page walks */
const W = (o, id = 'storm', hero = 'knight') => walkCfg(id, hero, 1, { stuck: 1500, ...o });
const rows = await runWalks([W({ from: 37, frames: 4400 }), W({ from: 481, frames: 3000, nofoes: [470, 520] }), W({ from: 219, frames: 3000 }, 'storm', 'pyro'), W({ from: 376, frames: 2600 })], { jobs: 1 });
const [kr, sr, pr, wr] = rows;
for (const r of rows) if (!r || r.err) fails.push('a walk failed: ' + (r && r.err));
if (kr && !kr.err) { const t = (kr.subs || []).find(s => s.kind === 'key' && s.got); ok(t, '1 the brass key was not fetched (subs ' + JSON.stringify((kr.subs || []).map(s => [s.kind, s.key, s.ok, s.got, s.secs])) + ')'); console.log('  1 key: ' + (t ? 'got in ' + t.secs + ' s' : 'NO')); }
if (sr && !sr.err) { ok(sr.walked >= 78, '2 the zigzag stair was not climbed (walked ' + sr.walked + '%, the top is node 93 of 120 = 78%)'); console.log('  2 stair: walked ' + sr.walked + '%'); }
if (pr && !pr.err) { ok(pr.walked >= 38, '3 out of the chimney slots: the walk stalled (walked ' + pr.walked + '%; col 258 is node 46 of 120 = 38%)'); console.log('  3 slots: walked ' + pr.walked + '%'); }
if (wr && !wr.err) { ok(wr.walked >= 60, '4 the kennel winch: the walk did not pass col 410 (walked ' + wr.walked + '%; node 72 of 120 = 60%)'); console.log('  4 winch: walked ' + wr.walked + '%'); }
if (fails.length) { console.log('walk-controls: FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('walk-controls: ok');
