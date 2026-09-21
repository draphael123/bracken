import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {LEVELS,T} from '../src/level.js';
import {floodReach} from '../src/reachcore.js';
import {airBoxes} from '../src/deepair.js';
const deep=LEVELS.find(l=>l.id==='deep').build(),keep=LEVELS.find(l=>l.id==='keep').build();
assert.equal(deep.arena.boss,'bellcrab');assert.equal(keep.arena.boss,'drownedking');assert.equal(LEVELS.find(l=>l.id==='keep').needs,'deep');assert.equal(LEVELS.find(l=>l.id==='causeway').needs,'keep');
assert.equal(deep.ents.filter(e=>e.t==='stray').length,3);assert(!deep.ents.some(e=>e.t==='drownedking'));assert.equal(keep.ents.filter(e=>e.t==='bellguard').length,3);assert.equal(keep.ents.filter(e=>e.t==='silver').length,3);
for(const L of [deep,keep]){const reach=floodReach(L,T,{rides:true});for(const e of L.ents.filter(e=>['gate','silver','stray','check'].includes(e.t)))assert(reach.jumpNear(e.x,e.y),e.t+' '+e.x+','+e.y);
 for(const e of L.ents)assert(e.x>=0&&e.x<L.W&&e.y>=0&&e.y<L.H,e.t+' outside crop');
 for(const z of L.deep.zones)assert(z.x0>=0&&z.x1<L.W&&z.y0>=0&&z.y1<L.H);
 for(const r of airBoxes(L))assert(r.l>=-16&&r.r<=(L.W+1)*16&&r.t>=-16&&r.b<=(L.H+1)*16);
}
const shut={...keep,grid:keep.grid.slice()};for(let y=52;y<=58;y++)shut.grid[y*keep.W+669]=T.SOLID;const closed=floodReach(shut,T,{rides:true});assert(closed.jumpNear(661,58),'keeper reachable with door shut');assert(!closed.jumpNear(738,51),'keeper door blocks throne room');
const start={x:keep.START.x*16+8,y:(keep.START.y+1)*16-8};assert(airBoxes(keep).some(r=>start.x>r.l&&start.x<r.r&&start.y>r.t&&start.y<r.b),'Keep arrival breath');
const s=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),noop=()=>{},hits=[];
const c=vm.createContext({L:{arena:{x0:0,x1:640,floor:320}},P:{x:330,y:320,dead:false},DMG:{bellClaw:20,bellSlam:28,bellPressure:18,bellCharge:26,bellHook:16,bellKnell:20},SFX:new Proxy({},{get:()=>noop}),number:noop,shakeCam:noop,ringAt:noop,burst:noop,moveBody:()=>({ground:true}),damagePlayer:(x,d,o)=>hits.push({x,d,o})});
vm.runInContext(s.slice(s.indexOf('function updateBellcrab('),s.indexOf('function drawBellcrabMarks('))+s.slice(s.indexOf('function updateBellguard('),s.indexOf('function updateDrownedKing(')),c);
const enemy=mode=>({x:300,y:320,vx:0,vy:0,face:1,phase:1,mode,modeT:0,open:0,turn:0,cd:0,hit:false,bellMark:{x:330,y:310}});
for(const [mode,hard]of[['clawTell',false],['ballastTell',true],['pressureTell',false],['scuttle',true]]){hits.length=0;c.P.x=330;c.P.y=320;const e=enemy(mode);c.updateBellcrab(e,.01);assert.equal(hits.length,1,mode);assert.equal(!!hits[0].o?.unblockable,hard,mode);for(let i=0;i<35;i++)c.updateBellcrab(e,.01);assert(e.open>0,mode+' must expose shell');}
for(const [mode,x,y]of[['ballastTell',330,280],['pressureTell',390,320],['clawTell',270,320],['scuttle',330,250]]){hits.length=0;c.P.x=x;c.P.y=y;c.updateBellcrab(enemy(mode),.01);assert.equal(hits.length,0,mode+' counter');}
for(const[mode,hard]of[['hookTell',false],['knellTell',true]]){hits.length=0;c.P.x=330;c.P.y=320;const e=enemy(mode);c.updateBellguard(e,.01);assert.equal(hits.length,1);assert.equal(!!hits[0].o?.unblockable,hard);assert.equal(e.mode,'rest');}
console.log('Deep/Keep crop metadata, tribute, rewards, arrival air, campaign order, four crab attacks and counters, two Bellguard tells pass.');
