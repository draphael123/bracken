import assert from 'node:assert/strict';
import {updateUndeadMage,liveTowerBounds} from '../src/undead-mage.js';
import {LEVELS,T} from '../src/level.js';
const L=LEVELS.find(l=>l.id==='fallingtower').build(),original=LEVELS.find(l=>l.id==='mage').build();
assert(!L.ents.some(e=>e.t==='lockgate'),'old keyed doors are broken open on return');assert.equal(L.W,original.W);assert.equal(L.W,712);assert(L.START.x>680);assert(L.mini.reverse&&L.arena.reverse);
for(const [x,y]of [[125,13],[300,21],[420,5],[594,1]])assert.equal(L.grid[y*L.W+x],original.grid[y*L.W+x],'original tower masonry');
for(const e of L.ents.filter(e=>e.t==='stal'&&e.stone)){let y=e.y-1;assert.equal(L.grid[y*L.W+e.x],T.SOLID);while(y>0&&L.grid[(y-1)*L.W+e.x]===T.SOLID)y--;assert(y<=22,'falling stone is connected to tower ceiling');}
const P={x:53*16,y:640},e={alive:true,hp:75,hp0:100,x:54*16,y:640,anim:0,mode:'rest',modeT:0,stage:0,turn:0},slabs=L.towerSlabs;let changes=[],hits=[];
const c={P,A:L.arena,slabs,change:(...v)=>changes.push(v),hit:(...v)=>hits.push(v),say:()=>{},sound:()=>{}};
for(let stage=0;stage<3;stage++){e.hp=75-stage*25;updateUndeadMage(e,.01,c);assert.equal(e.mode,'collapse');const before=changes.length;updateUndeadMage(e,1,c);assert.equal(changes.length,before,'slabs warn before falling');updateUndeadMage(e,2.1,c);assert.equal(e.stage,stage+1);assert.equal(slabs.filter(z=>z.down).length,(stage+1)*2);}
assert.deepEqual(liveTowerBounds(slabs),[48*16,59*16]);assert(!changes.some(([x])=>x>=48&&x<=58),'central platform survives');
for(let i=0;i<6;i++){e.mode='rest';e.modeT=0;P.x=(48+i)*16;updateUndeadMage(e,.1,c);assert(e.teleX>=48*16+24&&e.teleX<=59*16-24);updateUndeadMage(e,.8,c);assert.equal(e.x,e.teleX);}
e.mode='stormTell';e.modeT=.5;e.markX=P.x;hits=[];updateUndeadMage(e,.2,c);assert.equal(hits.length,0);P.x+=50;updateUndeadMage(e,.4,c);assert.equal(hits.length,0,'locked lightning can be escaped');
e.mode='fireTell';e.modeT=0;e.face=1;e.shots=[];updateUndeadMage(e,.01,c);assert.equal(e.shots.length,3);assert(e.open>2);
e.mode='iceTell';e.modeT=0;e.shots=[];updateUndeadMage(e,.01,c);assert.equal(e.shots.length,2);assert(e.shots.every(q=>q.y===e.y-5));
console.log('Original 712-tile reverse tower, three warned slab collapses, surviving narrow platform, safe teleports and elemental counters pass.');
