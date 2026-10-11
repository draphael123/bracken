import { LEVELS, T } from '../src/level.js';
const L = LEVELS.find(l => l.id === 'rootway').build();
const [x0, x1, y0, y1] = process.argv.slice(2).map(Number);
const ch = {}; ch[T.AIR] = '.'; ch[T.SOLID] = '#'; ch[T.ONEWAY] = '=';
const ents = {}; for (const e of L.ents) ents[e.x + ',' + e.y] = e.t[0];
for (let y = y0; y <= y1; y++) { let r = String(y).padStart(2) + ' '; for (let x = x0; x <= x1; x++) { r += ents[x + ',' + y] ? ents[x + ',' + y] : (ch[L.grid[y * L.W + x]] || '?'); } console.log(r); }
console.log('darkLocal', JSON.stringify(L.darkLocal), 'darkZones', JSON.stringify(L.darkZones), 'tints', JSON.stringify(L.tints), 'sections', JSON.stringify((L.sections||[]).map(s=>[s.name,s.x0,s.x1])), JSON.stringify(L.decor).slice(0,500), 'podCaps', JSON.stringify(L.podCaps), 'jaws', JSON.stringify(L.jaws), 'nets', JSON.stringify(L.nets));
