// tools/traps.mjs — can you always get back out?
// reach.mjs asks whether you can get somewhere; this asks the other half: from everywhere you can get to,
// can you still get to the end? A pit you can drop into and not climb out of, with nothing in it to kill
// you, is a softlock (the Stormhold chimneys were one: five shafts, one ladder). It runs the same moves as
// src/reachcore.js backwards from the goal (the boss, or the gate) and lists every reachable pocket of
// footing the goal cannot be reached from.
// usage: node tools/traps.mjs [levelId]
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const want = process.argv[2];
let bad = 0;
for (const lv of LEVELS) {
  if (lv.hidden || (want && lv.id !== want)) continue;
  const L = lv.build();
  const R = floodReach(L, T), { seen, footing, key, expand, assisted } = R;
  // the goal: the boss if there is one, else the gate
  const boss = L.arena && L.arena.boss && L.ents.find(e => e.t === L.arena.boss || e.t === L.arena.boss + 'lord'); // (the Ram Lord is placed as 'ramlord')
  const goal = boss || L.ents.find(e => e.t === 'gate');
  if (!goal) { console.log(`== ${lv.id}: no boss or gate to aim for`); continue; }
  // every move, turned round
  const back = new Map();
  for (const k of footing) { const [x, y] = k.split(',').map(Number);
    expand(x, y, (nx, ny) => { const nk = key(nx, ny); if (!footing.has(nk)) return; let a = back.get(nk); if (!a) back.set(nk, a = []); a.push(k); }); }
  // safe ground: the goal, and anywhere the level means you to be - the start and every checkpoint (between
  // those, a level may lean on a ride or a gust the model cannot follow, but a checkpoint is never a trap)
  const out = new Set(), q = [];
  const safe = [goal, L.START, ...L.ents.filter(e => e.t === 'check' || e.t === 'gate')];
  for (const s of safe) for (let dy = -2; dy <= 3; dy++) for (let dx = -2; dx <= 2; dx++) { const k = key(s.x + dx, s.y + dy); if (footing.has(k) && !out.has(k)) { out.add(k); q.push(k); } }
  while (q.length) { const k = q.pop(); for (const p of back.get(k) || []) if (!out.has(p)) { out.add(p); q.push(p); } }
  // a boss arena locks behind you on purpose: inside it the fight is the way out
  const inArena = (x) => L.arena && x >= L.arena.x0 && x <= L.arena.x1;
  const stuck = [...seen].filter(k => !out.has(k) && !inArena(+k.split(',')[0]));
  if (!stuck.length) { if (want) console.log(`== ${lv.id}: every reachable tile can still reach the ${boss ? 'boss' : 'gate'}.`); continue; }
  // group into pockets
  const left = new Set(stuck), pockets = [];
  for (const k of stuck) { if (!left.has(k)) continue; const pk = [], st = [k]; left.delete(k);
    while (st.length) { const c = st.pop(); pk.push(c); const [x, y] = c.split(',').map(Number); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) { const n = key(x + dx, y + dy); if (left.has(n)) { left.delete(n); st.push(n); } } }
    pockets.push(pk); }
  console.log(`== ${lv.id}: ${pockets.length} pocket${pockets.length > 1 ? 's' : ''} you cannot get out of${assisted ? ' (ASSISTED level: a mover or gust may be the way out)' : ''}`);
  for (const pk of pockets) { const xs = pk.map(k => +k.split(',')[0]), ys = pk.map(k => +k.split(',')[1]);
    console.log(`  ${assisted ? 'ASSISTED?  ' : 'TRAP  '}x ${Math.min(...xs)}-${Math.max(...xs)}, y ${Math.min(...ys)}-${Math.max(...ys)}  (${pk.length} tiles)`); if (!assisted) bad++; }
}
console.log(bad ? `\n${bad} trap${bad > 1 ? 's' : ''} to fix.` : '\nno traps.');
