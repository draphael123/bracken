import { LEVELS, T } from '../../src/level.js';
const lv = LEVELS.find(l => l.id === 'hurricane'), L = lv.build();
console.log('T keys', Object.keys(T).join(' '));
for (let y = 0; y < L.H; y++) { let x = 0; while (x < L.W) { if (L.grid[y*L.W+x] === T.ONEWAY) { let x0 = x; while (x < L.W && L.grid[y*L.W+x] === T.ONEWAY) x++; console.log('ONEWAY row', y, x0, x-1); } else x++; } }
console.log('tiers', JSON.stringify(L.arena.tiers), 'nets', JSON.stringify(L.arena.nets), 'rod', JSON.stringify(L.arena.rod), L.arena.x0, L.arena.x1);
console.log('masts', JSON.stringify(L.ents.filter(e => e.t === 'mast')));
console.log('sails', JSON.stringify(L.h3.sails)); console.log('rods', JSON.stringify(L.h3.rods)); console.log('sections', JSON.stringify(L.h3.sections));
console.log('pools', JSON.stringify(L.pools.map(p=>({x0:p.x0,x1:p.x1,y:p.y,h3sea:p.h3sea,h3flood:p.h3flood,loY:p.loY,hiY:p.hiY}))));
console.log('felled', JSON.stringify(L.felled)); console.log('sink', JSON.stringify(L.h3.sink)); console.log(Object.keys(L).join(' '));
