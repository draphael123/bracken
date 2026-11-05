import { install } from './node-canvas.mjs'; install();
const { LEVELS } = await import('../src/level.js'); const { PLAIN_KEYS } = await import('../src/cast-pass.js');
for (const id of process.argv.slice(2)) { const L = LEVELS.find(l => l.id === id).build(); const c = {};
  for (const e of L.ents) if (['sprig','archer','shield','pike','hound','brute','rockgoblin'].includes(e.t)) for (const k of Object.keys(e)) if (!PLAIN_KEYS.has(k)) c[k + '=' + JSON.stringify(e[k]).slice(0, 14)] = (c[k + '=' + JSON.stringify(e[k]).slice(0, 14)] || 0) + 1;
  console.log(id, JSON.stringify(c)); }
