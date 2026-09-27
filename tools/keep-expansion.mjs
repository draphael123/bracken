import assert from 'node:assert/strict';
import {LEVELS,T} from '../src/level.js';
import {breathCapacity,airBoxes} from '../src/deepair.js';
import {KEEP_HALLS} from '../src/keep-expansion.js';
const L=LEVELS.find(l=>l.id==='keep').build();
assert.equal(L.W,760);assert.equal(L.keepSections.length,13);
for(const r of [null,'diverlamp','tidecharm']){assert.equal(breathCapacity(L,r),3*breathCapacity({},r));assert.equal(breathCapacity(LEVELS.find(l=>l.id==='deep').build(),r),breathCapacity({},r));}
assert(L.airRooms.length>=12);
/* THE KEEPER OF THE VAULT IS GONE (Daniel, 2026-09-25: "we don't need one"): no mini, no vault flag, no module */
assert(!L.mini,'the Keep has no mini any more');assert(!L.ents.some(e=>e.vaultKeeper||e.mini),'nothing in the Keep is a mini');
for(const x of [238,258]){assert.equal(L.grid[40*L.W+x],T.PORT);assert.equal(L.grid[30*L.W+x],T.AIR);assert(L.deep.gates.some(q=>q.col===x));}
assert(L.ents.filter(e=>e.t==='ballast').length>=2);assert(L.deep.currents.length>=4);assert(L.deep.clams.some(e=>e.x===368));
/* THE AIR HALLS: dry (no pool over their room), walked (a floor under it), with a checkpoint, a knight on the floor and failing stone */
for(const H of KEEP_HALLS){const mid=Math.round((H.x0+H.x1)/2)*16,wet=L.pools.some(p=>p.swim&&mid>p.x0&&mid<p.x1&&(H.floor-2)*16>=p.y);
 assert(!wet,H.name+' is under water');assert(L.ents.some(e=>e.t==='check'&&e.x>=H.x0&&e.x<=H.x1&&e.y===H.floor-1),H.name+' has a checkpoint on its floor');
 assert(L.ents.some(e=>e.t==='drownedknight'&&e.x>=H.x0&&e.x<=H.x1&&e.y===H.floor-1),H.name+' has a knight on its floor (F4: combat, swim, combat)');
 assert(L.crumbles.some(c=>c.x0>=H.x0&&c.x1<=H.x1),H.name+' has failing stone');assert(L.ents.some(e=>e.t==='rockfall'&&e.x>=H.x0&&e.x<=H.x1),H.name+' has told rockfalls');}
/* A CASTLE: every section of the approach has its own wall and its own landmark */
const rooms=new Set(L.interiors.filter(r=>String(r[4]).startsWith('keep')).map(r=>r[4]));assert.equal(rooms.size,8,'eight walls of their own: '+[...rooms]);
for(const r of rooms)assert(L.keepLandmarks.some(m=>m.room===r),r+' has no landmark');
assert(L.ents.filter(e=>e.t==='deco').length>=40,'a castle is furnished: '+L.ents.filter(e=>e.t==='deco').length+' decorations');
console.log('Keep triples width and scoped breath; air refuges, sluices and ballast exist; no Vault Keeper; two dry halls with a checkpoint, a knight, failing stone and rockfalls; eight walls, eight landmarks, '+L.ents.filter(e=>e.t==='deco').length+' decorations.');
