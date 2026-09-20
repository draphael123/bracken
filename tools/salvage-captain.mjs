import assert from 'node:assert/strict';
import {updateSalvageCaptain} from '../src/salvage-captain.js';
const A={x0:0,x1:528,floor:480,y0:320},P={x:280,y:480,h:24,dead:0},e={alive:true,x:240,y:480,hp:500,hp0:500,phase:1,mode:'walk',modeT:0,salvageN:0,anim:0,face:1,stagger:0};
const shots=[],hits=[],c={A,P,active:true,pinDamage:16,cargoDamage:18,shotDamage:12,hit:(...x)=>{hits.push(x);return 'hit';},seed:s=>shots.push(s),say:()=>{},sound:()=>{}};
const modes=new Set();for(let i=0;i<3600;i++){updateSalvageCaptain(e,1/60,c);modes.add(e.mode);}
for(const m of ['Pin','Hook','Cargo','Broadside'])assert(modes.has('salvage'+m+'Tell'),m);assert(!modes.has('salvageCrossfireTell'));
e.hp=250;updateSalvageCaptain(e,1/60,c);assert.equal(e.mode,'salvageRally');assert.equal(e.cargo.length,0);
for(let i=0;i<3600;i++){updateSalvageCaptain(e,1/60,c);modes.add(e.mode);}assert(modes.has('salvageCrossfireTell'));assert(shots.some(s=>s.chain&&s.from===e));assert(shots.some(s=>s.salvageShot&&s.vx>0));assert(shots.some(s=>s.salvageShot&&s.vx<0));
e.mode='salvageCargoTell';e.modeT=.5;e.cargo=[280];hits.length=0;updateSalvageCaptain(e,.2,c);assert.equal(hits.length,0,'warning cannot hurt');
e.mode='salvageCargo';e.modeT=.01;P.x=280;P.y=480;updateSalvageCaptain(e,.02,c);assert.equal(hits.length,1,'marked landing hits');assert.equal(hits[0][2],true);
e.mode='salvageCargo';e.modeT=.01;e.cargo=[280];P.x=314;hits.length=0;updateSalvageCaptain(e,.02,c);assert.equal(hits.length,0,'stepping off the mark is safe');
e.mode='salvageCargo';e.modeT=.01;e.cargo=[280];P.x=280;P.y=420;updateSalvageCaptain(e,.02,c);assert.equal(hits.length,0,'jump clears the impact');
e.mode='salvageBroadsideTell';e.modeT=.01;c.active=false;const n=shots.length;updateSalvageCaptain(e,2,c);assert.equal(shots.length,n);assert.equal(e.mode,'salvageBroadsideTell');
console.log('Salvage Captain: four base attacks, phase-two crossfire, non-damaging warnings, cargo escape lanes, and inactive encounter gate verified.');
