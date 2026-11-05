import { install } from './node-canvas.mjs'; install();
const { LEVELS } = await import('../src/level.js'); const { PLAIN_KEYS } = await import('../src/cast-pass.js');
for (const id of process.argv.slice(2)) { const lv = LEVELS.find(l => l.id === id); const L = lv.build(); const t = {};
  for (const e of L.ents) { if (!['sprig','archer','shield','pike','hound','brute','rockgoblin','thief','sapper'].includes(e.t)) continue; const plain = Object.keys(e).every(k => PLAIN_KEYS.has(k)); (t[e.t] = t[e.t] || []).push((plain ? '' : '*') + e.x); }
  console.log(id, L.W); for (const [k, v] of Object.entries(t)) console.log('  ', k, v.length, v.join(',')); }
