import { LEVELS, T } from '../src/level.js';
const L = LEVELS.find(l => l.id === 'rootway').build();
console.log(L.W, L.H, JSON.stringify(L.START), Object.keys(L).join(','));
const by = {}; for (const e of L.ents) (by[e.t] = by[e.t] || []).push(e.x + ',' + e.y);
for (const k in by) console.log(k, by[k].slice(0, 14).join(' '));
console.log('hoists', JSON.stringify((L.hoists||[]).map(h=>({id:h.id,cleat:h.cleat}))));
console.log('movers', JSON.stringify((L.moversExtra||[]).map(m=>[m.kind,Math.round(m.x/16),Math.round((m.y0||0)/16)])));
console.log('zip', JSON.stringify(L.zipLines));
console.log('deco', JSON.stringify((L.deco||[]).slice(0,5)), (L.deco||[]).length);
