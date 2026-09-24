// tools/audit.mjs — builds every level and flags: signs/NPCs/props not standing on ground, one-way ledges no jump can reach.
// usage: node tools/audit.mjs [levelId]
import { LEVELS, T, TS } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
const want = process.argv[2];
const RUN = 100, JUMPV = -320, G = 1000, COY = 0.1;
const solidT = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PLANK || t === T.PORT || t === T.SHELF || t === T.RAIL || t === T.SOFT || t === T.BOUNCER || t === T.CRYST || t === T.ICE;   /* ice is a floor: the Frostfell's rams and trolls stand on its tarns */
const standT = t => solidT(t) || t === T.ONEWAY || t === T.REED || (t >= 20 && t <= 25);   /* a SLOPE (ids 20-25, src/slopes.js) is a floor: THE SUNKEN CARAVAN's checkpoints on the dunes stand on one */
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue; if (want && lv.id !== want) continue;
  const L = lv.build(); const W = L.W, H = L.H, g = L.grid; const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const out = [];
  // 1. floating props: anything placed at (x, y) should have ground at (x, y+1) — the DSL places ents on the tile they stand on
  for (const e of L.ents) {
    if (!['sign', 'npc', 'shrine', 'check', 'torch', 'deco', 'crate', 'brazier', 'well', 'door', 'folk', 'sprig', 'pike', 'brute', 'thief', 'plate', 'exit', 'relic', 'bell', 'cage', 'squire', 'stray', 'goat', 'ram', 'troll', 'miner'].includes(e.t)) continue;
    if (e.hang || e.ride || e.kind === 'hangCage' || e.t === 'torch' || (e.t === 'deco' && ['banner', 'axle', 'timber', 'pillar', 'strut', 'sailRag', 'rigging', 'pennant', 'gunport', 'hallWindow', 'hammock', 'washing', 'boardingNet', 'sternWindows', 'crowNest', 'mastTall', 'buoy', 'lanternBuoy', 'airBell'].includes(e.kind))) continue;
    if (!standT(at(e.x, e.y + 1))) out.push(`FLOAT ${e.t}${e.kind ? ':' + e.kind : ''} at ${e.x},${e.y} (below=${at(e.x, e.y + 1)})${e.text ? ' "' + e.text.slice(0, 40) + '"' : ''}`);
  }
  // 2. reach: ONE model for the whole toolchain. This file used to carry its own hand-rolled flood, and it
  //    disagreed with src/reachcore.js - the model the bot and reach.mjs run on - by whole sections: it could
  //    not go DOWN a rope, could not ride a lift, could not follow a door and did not know what swims. It
  //    called half the Undercrown and the floor of the Deep unreachable, and got ignored for it. A second
  //    opinion nobody trusts is worse than no opinion at all.
  const { seen, assisted } = floodReach(L, T);
  const un = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) === T.ONEWAY && !seen.has(x + ',' + (y - 1))) un.push([x, y]);
  const runs = []; for (const [x, y] of un) { const r = runs[runs.length - 1]; if (r && r.y === y && r.x1 === x - 1) r.x1 = x; else runs.push({ x0: x, x1: x, y }); }
  for (const r of runs) out.push(`UNREACHED ledge ${r.x0}-${r.x1} row ${r.y}`);
  if (assisted && runs.length) out.push('(ASSISTED: this level has movers, gusts or doors the model cannot follow - the ledges above may be a ride away)');
  console.log(`== ${lv.id} (${W}x${H}) ${out.length ? '' : 'clean'}`); for (const o of out) console.log('  ' + o);
}
