// tools/audit.mjs — builds every level and flags: signs/NPCs/props not standing on ground, one-way ledges no jump can reach.
// usage: node tools/audit.mjs [levelId]
import { LEVELS, T, TS } from '../src/level.js';
const want = process.argv[2];
const RUN = 100, JUMPV = -320, G = 1000, COY = 0.1;
const solidT = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PLANK || t === T.PORT || t === T.SHELF || t === T.RAIL || t === T.SOFT || t === T.BOUNCER || t === T.CRYST;
const standT = t => solidT(t) || t === T.ONEWAY || t === T.REED;
for (const lv of LEVELS) {
  if (lv.hidden) continue; if (want && lv.id !== want) continue;
  const L = lv.build(); const W = L.W, H = L.H, g = L.grid; const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  const out = [];
  // 1. floating props: anything placed at (x, y) should have ground at (x, y+1) — the DSL places ents on the tile they stand on
  for (const e of L.ents) {
    if (!['sign', 'npc', 'shrine', 'check', 'torch', 'deco', 'crate', 'brazier', 'well', 'door', 'folk', 'sprig', 'pike', 'brute', 'thief', 'plate', 'exit', 'relic', 'bell', 'cage', 'squire', 'stray', 'goat', 'ram', 'troll', 'miner'].includes(e.t)) continue;
    if (e.hang || e.ride || e.kind === 'hangCage' || e.t === 'torch' || (e.t === 'deco' && ['banner', 'axle', 'timber', 'pillar', 'strut', 'sailRag', 'rigging', 'pennant', 'gunport', 'hallWindow', 'hammock', 'washing', 'boardingNet', 'sternWindows', 'crowNest', 'mastTall', 'buoy', 'lanternBuoy', 'airBell'].includes(e.kind))) continue;
    if (!standT(at(e.x, e.y + 1))) out.push(`FLOAT ${e.t}${e.kind ? ':' + e.kind : ''} at ${e.x},${e.y} (below=${at(e.x, e.y + 1)})${e.text ? ' "' + e.text.slice(0, 40) + '"' : ''}`);
  }
  // 2. reach: from every standable tile, mark where a jump (with the run) can land; a ONEWAY tile nobody can land on is flagged
  const stand = new Set(); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (standT(at(x, y)) && !solidT(at(x, y - 1)) && at(x, y - 1) !== T.SPIKE) stand.add(x + ',' + (y - 1));
  const canStand = (x, y) => stand.has(x + ',' + y);
  const climb = (x, y) => at(x, y) === T.NET || at(x, y) === T.CLIMB;
  const seen = new Set(); const q = []; const st = L.START || { x: 2, y: 2 };
  // find the first standable under the start
  let sy = st.y; while (sy < H - 1 && !canStand(st.x, sy)) sy++; q.push([st.x, sy]); seen.add(st.x + ',' + sy);
  const push = (x, y) => { const k = x + ',' + y; if (!seen.has(k) && (canStand(x, y) || climb(x, y))) { seen.add(k); q.push([x, y]); } };
  const free = (x, y) => !solidT(at(x, y));
  // simulate jump arcs from a tile: the player is ~16 tall, 10 wide; sample a few horizontal speeds
  const arcs = (x0, y0) => { const res = []; for (const vx of [-RUN, -60, 0, 60, RUN]) { for (const v0 of [JUMPV, JUMPV * 0.6]) { let px = x0 * TS + 8, py = (y0 + 1) * TS, vy = v0, t = 0; let ok = true; for (let i = 0; i < 90 && ok; i++) { const dt = 1 / 60; vy += G * dt; px += vx * dt; py += vy * dt; t += dt; const tx = Math.floor(px / TS), ty = Math.floor((py - 1) / TS), hy = Math.floor((py - 15) / TS); if (!free(tx, hy)) { vy = Math.max(vy, 0); } if (!free(tx, ty) && solidT(at(tx, ty))) { ok = false; break; } if (vy > 0 && canStand(tx, Math.floor(py / TS) - 1) && standT(at(tx, Math.floor(py / TS)))) { res.push([tx, Math.floor(py / TS) - 1]); break; } if (vy > 0 && at(tx, Math.floor(py / TS)) === T.SPIKE) { ok = false; break; } } } } return res; };
  while (q.length) {
    const [x, y] = q.shift();
    // walk
    for (const dx of [-1, 1]) { const nx = x + dx; if (canStand(nx, y)) push(nx, y); else if (free(nx, y) && free(nx, y - 1)) { let fy = y; while (fy < H - 1 && !canStand(nx, fy) && free(nx, fy + 1)) fy++; if (canStand(nx, fy)) push(nx, fy); } }
    // climb
    if (climb(x, y)) { for (const dy of [-1, 1]) if (climb(x, y + dy) || canStand(x, y + dy)) push(x, y + dy); for (const dx of [-1, 1]) if (canStand(x + dx, y) || canStand(x + dx, y - 1)) { push(x + dx, y); push(x + dx, y - 1); } }
    else { for (const dx of [-1, 0, 1]) for (let dy = -4; dy <= 0; dy++) if (climb(x + dx, y + dy) && free(x + dx, y + dy)) push(x + dx, y + dy); }
    // jump
    for (const [lx, ly] of arcs(x, y)) push(lx, ly);
    // drop through oneway
    if (at(x, y + 1) === T.ONEWAY) { let fy = y + 1; while (fy < H - 1 && !canStand(x, fy)) fy++; if (canStand(x, fy)) push(x, fy); }
  }
  const un = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y) === T.ONEWAY && !seen.has(x + ',' + (y - 1))) un.push([x, y]);
  // group runs
  const runs = []; for (const [x, y] of un) { const r = runs[runs.length - 1]; if (r && r.y === y && r.x1 === x - 1) r.x1 = x; else runs.push({ x0: x, x1: x, y }); }
  for (const r of runs) out.push(`UNREACHED ledge ${r.x0}-${r.x1} row ${r.y}`);
  console.log(`== ${lv.id} (${W}x${H}) ${out.length ? '' : 'clean'}`); for (const o of out) console.log('  ' + o);
}
