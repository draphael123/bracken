import { T } from '../src/level.js';
import { buildSunkenCaravan } from '../src/draft/sunken-caravan.js';
const L = buildSunkenCaravan(T), W = L.W;
const top = x => { for (let y = 0; y < L.H; y++) { const t = L.grid[y*W+x]; if (t !== 0) return y; } return L.H; };
console.log('W', W, 'sections', JSON.stringify(L.sections)); console.log('marks', JSON.stringify(L.marks));
console.log('roofs', JSON.stringify(L.roofs));
let s = ''; for (let x = 0; x < L.sections.arena; x += 1) s += (x % 10 === 0 ? '\n' + String(x).padStart(3) + ': ' : '') + top(x).toString(16).padStart(2, '0') + ' ';
console.log(s);
console.log('walls', JSON.stringify(L.walls), 'qs', L.quicksand.map(q => q.x0/16 + '-' + (q.x1/16-1)).join(' '));
