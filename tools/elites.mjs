// tools/elites.mjs — EVERY ELITE CAN BE FOUGHT, AND EVERY GATE IT HOLDS OPENS.
// An elite holding a gate is a lock with a creature for a key, so it is checked the way tools/keys.mjs checks keys: the
// gate is rock (the reach model hops a one-tile portcullis, so it is SOLID here), the level is flooded from the start,
// and the elite must be reached with it shut. The gate must also HOLD - with it shut the boss room is not reached, or
// "you need to kill it to progress" is a wish - and nothing counted may stand in its column. The gate opening on the
// elite's death, by any means, is main.js's eliteWatch, which asks only whether the elite is still alive.
//   node tools/elites.mjs              every level
//   node tools/elites.mjs wood,marsh   only those
// FAILS when an elite stands in a boss, mini or ambush room, on nothing, out of reach, too near its own gate; when a
// gate cannot be reached, can be walked round, or covers a checkpoint, sign, door, key or collectable; or when a level
// with no mini has no gated elite (a level still being rebuilt is listed as pending, not failed).
import { LEVELS, T, eliteGate } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const PENDING = new Set([]);   /* a level being rebuilt goes in here, and comes out of it when its elites land */
const want = (process.argv[2] || '').split(',').filter(Boolean);
const TS = 16;
let bad = 0, n = 0;
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || (want.length && !want.includes(lv.id))) continue;
  const L = lv.build(), els = L.ents.filter(e => e.elite), out = [];
  if (PENDING.has(lv.id) && !els.length) { console.log(' --  ' + lv.id.padEnd(11) + 'pending (being rebuilt)'); continue; }
  const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
  const A = L.arena, tx = A ? Math.floor(A.trigger / TS) : L.W - 3;
  const arenaIn = R => [...R.seen].some(k => { const [x, y] = k.split(',').map(Number); return x >= tx && (!A || Math.abs(y - (A.floor / TS - 1)) <= 3); });
  const near = (R, x, y) => { for (let dy = -2; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (R.seen.has((x + dx) + ',' + (y + dy))) return true; return false; };
  const rooms = [A, L.mini].filter(Boolean).map(Q => [Q.x0 / TS - 1, Q.x1 / TS + 1, Q.y0 !== undefined ? Q.y0 / TS - 1 : Q.floor / TS - 16, Q.floor / TS + 2])
    .concat((L.ambushes || []).map(Q => [Q.wallL - 1, Q.wallR + 1, (Q.y0 !== undefined ? Q.y0 : Q.row - 9) - 1, Q.row + 2]));
  const open = floodReach(L, T, { rides: true });
  if (!els.length && !L.mini) out.push('no mini and no elite holding a gate');
  else if (!L.mini && !els.some(e => e.gate !== undefined)) out.push('no mini, and no elite here holds a gate');
  const HELD = new Set(['check', 'sign', 'doorway', 'gate', 'lockgate', 'key', 'stray', 'silver', 'relic', 'npc', 'shrine', 'winch', 'lever']);
  for (const e of els) { n++;
    const tag = e.t + '@' + e.x + ',' + e.y;
    if (rooms.some(([a, b, c, d]) => e.x >= a && e.x <= b && e.y >= c && e.y <= d)) out.push(tag + ' stands in a boss, mini or ambush room');
    if (at(e.x, e.y) !== T.AIR || at(e.x, e.y + 1) === T.AIR) out.push(tag + ' is not stood on footing');
    if (!near(open, e.x, e.y)) out.push(tag + ' is out of reach');
    if (e.gate === undefined) continue;
    const G = eliteGate(L, e.gate, e.y);
    if (Math.abs(e.gate - e.x) < 5) out.push(tag + ' is ' + Math.abs(e.gate - e.x) + ' tiles from its gate: no room to fight in front of it');
    const grid = L.grid.slice(); for (let y = G.top; y <= G.bot; y++) grid[y * L.W + G.col] = T.SOLID; if (G.sill >= 0) grid[G.sill * L.W + G.col] = T.SOLID;
    const shut = floodReach({ ...L, grid }, T, { rides: true });
    if (!near(shut, e.x, e.y)) out.push(tag + ' cannot be reached with its gate @' + e.gate + ' shut');
    /* THE GATE HOLDS when most of what lies past it (on the side away from the elite) is only reached through it. The boss
       room is the first thing asked; where the model cannot see into it (a ride, a canopy), the ground past the gate is */
    const side = Math.sign(e.gate - e.x), past = R => [...R.seen].filter(k => (+k.split(',')[0] - e.gate) * side > 2).length;
    const walkedRound = arenaIn(open) ? arenaIn(shut) : past(shut) > past(open) * 0.25;
    if (walkedRound) out.push('the gate @' + e.gate + ' (rows ' + G.top + '-' + G.bot + ') can be walked round: ' + past(shut) + ' of ' + past(open) + ' tiles past it are still reached with it shut');
    for (const q of L.ents) if (HELD.has(q.t) && Math.abs(q.x - G.col) <= 1 && q.y >= G.top - 1 && q.y <= G.bot + 1) out.push('the gate @' + e.gate + ' comes down on a ' + q.t + ' @' + q.x + ',' + q.y);
  }
  if (out.length) bad++;
  console.log((out.length ? 'FAIL ' : ' ok  ') + lv.id.padEnd(11) + els.map(e => e.t + '@' + e.x + ',' + e.y + (e.gate !== undefined ? ' gate ' + e.gate : '')).join('; ') + (out.length ? '\n       ' + out.join('\n       ') : ''));
}
console.log('\n' + n + ' elites. ' + (bad ? bad + ' level(s) fail.' : 'every elite can be fought and every gate it holds opens onto the route.'));
process.exitCode = bad ? 1 : 0;
