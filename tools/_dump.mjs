import { pathToFileURL } from 'node:url'; import path from 'node:path';
const { LEVELS, T } = await import(pathToFileURL(path.resolve('src/level.js')).href);
const L = LEVELS.find(l => l.id === 'crown').build();
const [x0, x1, y0, y1] = process.argv.slice(2).map(Number);
console.log('W', L.W, 'H', L.H, 'T', JSON.stringify(T));
const ch = { [T.AIR]: '.', [T.SOLID]: '#', [T.ONEWAY]: '=', [T.NET]: 'H', [T.PORT]: 'P', [T.SPIKE]: '^' };
for (let y = y0; y <= y1; y++) { let s = String(y).padStart(2) + ' '; for (let x = x0; x <= x1; x++) s += ch[L.grid[y * L.W + x]] ?? '?'; console.log(s); }
const ents = L.ents.filter(e => e.x >= x0 && e.x <= x1 && e.y >= y0 && e.y <= y1).map(e => e.t + '@' + e.x + ',' + e.y);
console.log(ents.join(' '));
console.log('arena', JSON.stringify({ x0: L.arena.x0 / 16, x1: L.arena.x1 / 16, floor: L.arena.floor / 16, wallL: L.arena.wallL, wallR: L.arena.wallR }), 'arenaRoof', JSON.stringify({ x0: L.arenaRoof.x0 / 16, x1: L.arenaRoof.x1 / 16, floor: L.arenaRoof.floor / 16 }));
