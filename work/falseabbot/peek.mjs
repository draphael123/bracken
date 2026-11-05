// work/falseabbot/peek.mjs - what the built Monastery keeps in rows 0-31 (lane helper). MON3=1 node work/falseabbot/peek.mjs
import { LEVELS } from '../../src/level.js';
const L = LEVELS.find(l => l.id === 'spire').build(), top = r => r[2] <= 31;
console.log('facades', JSON.stringify((L.facades || []).filter(top)));
console.log('masonry', JSON.stringify((L.masonry || []).filter(top)));
console.log('interiors', JSON.stringify((L.interiors || []).filter(top)));
console.log('hangers', JSON.stringify(((L.monk || {}).hangers || []).filter(h => h[1] <= 31)));
console.log('flags', JSON.stringify(((L.monk || {}).flags || []).filter(f => Math.min(f[1], f[3]) <= 31)));
console.log('crumbles', JSON.stringify((L.crumbles || []).filter(c => c.row <= 31)));
console.log('movers', JSON.stringify((L.moversExtra || []).filter(m => m.y / 16 <= 31)));
console.log('ents', JSON.stringify(L.ents.filter(e => e.y <= 31).map(e => [e.t, e.x, e.y, e.kind || ''])));
console.log('keys', Object.keys(L).join(','));
console.log('islands', JSON.stringify((L.islands||[]).filter(i => i[2] <= 31)));
console.log('arena', JSON.stringify(L.arena));
