import { LEVELS } from '../../src/level.js';
const lv = LEVELS.find(l => l.id === 'palisadewood'); const L = lv.build();
const ch = {}; const cnt = {};
for (let i = 0; i < L.grid.length; i++) cnt[L.grid[i]] = (cnt[L.grid[i]] || 0) + 1;
console.log(cnt, L.W, L.H);
const x0 = +process.argv[2] || 0, x1 = +process.argv[3] || 110;
for (let y = 0; y < L.H; y++) { let s = ''; for (let x = x0; x < x1; x++) { const t = L.grid[y * L.W + x]; s += t === 0 ? '.' : t === 1 ? '#' : String(t).slice(-1); } console.log(String(y).padStart(2), s); }
