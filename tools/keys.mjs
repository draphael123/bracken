// tools/keys.mjs — EVERY KEY BEFORE ITS GATE.
// src/reachcore.js's jump only treats SOLID as a wall, so its fill hops a one-tile portcullis column and never sees a
// key locked behind its own gate: Highcrown's bone key stood west of the bone gate it opens, the player comes into the
// chapel from the east, and the seal on the choir loft could never be had. This floods each level with every lock gate
// as rock until a key of its kind has been reached, opens the gates of the kinds it holds, and floods again, until
// nothing new is held. Keys are held by KIND (marks 'key:' + kind in main.js), so a second brass key opens nothing new.
//   node tools/keys.mjs              every level with a lock gate
//   node tools/keys.mjs crown,storm  only those
// FAILS when a gate stays shut, a key is never reached, a silver, stray, relic or checkpoint is only behind a gate
// that never opens, or the arena is not reached with the gates as rock.
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const want = (process.argv[2] || '').split(',').filter(Boolean);
let bad = 0, checked = 0;
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
  const L0 = lv.build();
  const gates = L0.ents.filter(e => e.t === 'lockgate'), keys = L0.ents.filter(e => e.t === 'key');
  if (!gates.length && !keys.length) continue;
  checked++;
  const held = new Set(); let R = null;
  const near = (x, y) => { for (let dy = -2; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (R.seen.has((x + dx) + ',' + (y + dy))) return true; return false; };
  for (let pass = 0; pass <= 10; pass++) {
    const grid = L0.grid.slice();
    for (const g of gates) if (!held.has(g.needs || 'brass')) for (let y = 0; y < L0.H; y++) if (grid[y * L0.W + g.x] === T.PORT) grid[y * L0.W + g.x] = T.SOLID;
    R = floodReach({ ...L0, grid }, T, { rides: true });
    let grew = false;
    for (const k of keys) if (near(k.x, k.y) && !held.has(k.kind || 'brass')) { held.add(k.kind || 'brass'); grew = true; }
    if (!grew) break;
  }
  const out = [];
  const A = L0.arena, tx = A ? Math.floor(A.trigger / 16) : L0.W - 3;
  const arenaOk = [...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= tx && (!A || Math.abs(y - (A.floor / 16 - 1)) <= 3); });
  if (!arenaOk) out.push('the arena is not reached with the gates as rock');
  for (const g of gates) if (!held.has(g.needs || 'brass')) out.push('the ' + (g.needs || 'brass') + ' gate @' + g.x + ',' + g.y + ' never opens');
  for (const k of keys) if (!near(k.x, k.y)) out.push('the ' + (k.kind || 'brass') + ' key @' + k.x + ',' + k.y + ' is never reached');
  const jn = (x, y) => { for (let dy = -2; dy <= 4; dy++) for (let dx = -2; dx <= 2; dx++) if (R.seen.has((x + dx) + ',' + (y + dy))) return true; return false; };
  for (const e of L0.ents) if (['silver', 'stray', 'relic', 'check'].includes(e.t) && !jn(e.x, e.y)) out.push(e.t + (e.kind ? ':' + e.kind : '') + ' @' + e.x + ',' + e.y + ' is only behind a gate that never opens');
  console.log((out.length ? 'FAIL ' : ' ok  ') + lv.id.padEnd(11) + gates.length + ' gate' + (gates.length === 1 ? '' : 's') + ', keys held ' + ([...held].join(',') || '-') + ' of ' + ([...new Set(keys.map(k => k.kind || 'brass'))].join(',') || '-') + (out.length ? ': ' + out.join('; ') : ''));
  bad += out.length;
}
console.log('\n' + checked + ' levels with lock gates flooded key by key. ' + (bad ? bad + ' thing(s) locked behind their own gate.' : 'every key comes before its gate.'));
process.exit(bad ? 1 : 0);
