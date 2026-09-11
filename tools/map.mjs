// tools/map.mjs — print a patch of a built level as text, with the reach fill marked: node tools/map.mjs <id> x0 x1 y0 y1
// (* = a tile the knight can stand on and get to, # = rock, . = air, letters = other tiles by id: B oneway, H net, L port, N rail)
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
const [id, x0, x1, y0, y1] = process.argv.slice(2); const L = LEVELS.find(l => l.id === id).build();
const R = floodReach(L, T);
for (let y=+y0;y<=+y1;y++){let s='';for(let x=+x0;x<=+x1;x++){const t=L.grid[y*L.W+x];s+=R.seen.has(x+','+y)?'*':t===T.SOLID?'#':t===0?'.':String.fromCharCode(64+t);}console.log(String(y).padStart(3),s);}
console.log((L.ents||[]).filter(e=>e.x>=+x0&&e.x<=+x1&&e.y>=+y0&&e.y<=+y1&&!['coin','deco'].includes(e.t)).map(e=>e.t+'@'+e.x+','+e.y).join(' '));
