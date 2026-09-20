import assert from 'node:assert/strict';
import {LEVELS,T} from '../src/level.js';
import {breathCapacity,airBoxes} from '../src/deepair.js';
import {updateVaultKeeper} from '../src/vault-keeper.js';
const L=LEVELS.find(l=>l.id==='keep').build();
assert.equal(L.W,600);assert.equal(L.keepSections.length,7);
for(const r of [null,'diverlamp','tidecharm']){assert.equal(breathCapacity(L,r),3*breathCapacity({},r));assert.equal(breathCapacity(LEVELS.find(l=>l.id==='deep').build(),r),breathCapacity({},r));}
assert(L.airRooms.length>=20);assert.equal(L.ents.filter(e=>e.vaultKeeper).length,1);
for(const x of [219,245]){assert.equal(L.grid[40*L.W+x],T.PORT);assert.equal(L.grid[30*L.W+x],T.AIR);assert(L.deep.gates.some(q=>q.col===x));}
assert(L.ents.filter(e=>e.t==='ballast').length>=2);assert(L.deep.currents.length>=4);assert(L.deep.clams.some(e=>e.x===355));
const A={x0:0,x1:500,y0:0,floor:300},P={x:250,y:280,dead:false};let hits=[],shots=[];
const c={P,A,active:true,move:()=>{},hit:(...v)=>hits.push(v),seed:s=>shots.push(s),say:()=>{},sound:()=>{}};
const boss=m=>({alive:true,hp:100,hp0:100,x:250,y:280,phase:1,vaultTurn:0,anim:0,mode:m,modeT:.5,aimX:250,aimY:270});
for(const m of ['Hook','Spear','Ring','Pressure','Band']){const e=boss('vault'+m+'Tell');hits=[];shots=[];updateVaultKeeper(e,.25,c);assert.equal(hits.length+shots.length,0);updateVaultKeeper(e,.3,c);assert.equal(e.mode,'vaultRest');assert(e.open>1);assert.equal(hits.length+shots.length,1);if(m==='Spear')assert(!shots[0].unblockable);else assert.equal(hits[0][2],m!=='Hook');}
for(const [m,x,y]of [['Hook',350,280],['Ring',350,280],['Pressure',300,280],['Band',250,220]]){P.x=x;P.y=y;hits=[];updateVaultKeeper(boss('vault'+m+'Tell'),.6,c);assert.equal(hits.length,0,m+' safe response');}
P.x=250;P.y=280;const e=boss('walk');e.hp=50;updateVaultKeeper(e,.01,c);assert.equal(e.phase,2);assert.equal(e.mode,'vaultRally');const seen=new Set();for(let f=0;f<6000;f++){updateVaultKeeper(e,1/60,c);seen.add(e.mode);}for(const m of ['Hook','Spear','Ring','Pressure','Band'])assert(seen.has('vault'+m+'Tell'));
console.log('Keep triples width and scoped breath; air refuges, sluices and ballast exist; five Keeper tells, counters, openings and phase-two rotation pass.');
