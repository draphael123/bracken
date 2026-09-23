import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {LEVELS,T} from '../src/level.js';
import {floodReach} from '../src/reachcore.js';
import {airBoxes} from '../src/deepair.js';
import {SFX as REAL_SFX} from '../src/audio.js';   /* the real sound table: audio.js imports clean in Node, nothing is built until a sound is asked for */
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
/* THE LEADFOOT (src/main.js updateLeadfoot; docs/briefs/keep-leadfoot.md). Rule A3: an attack nobody has FORCED is an
   attack that may never once have fired. Each of his three is reached from his own walk on the geometry that should
   reach it, each lands where it is meant to, each misses where the answer is, and nothing shoves him off his floor -
   which is the whole creature. His placements are counted too: he denies floors, and there must not be a crowd of him. */
assert.equal(keep.ents.filter(e=>e.t==='leadfoot').length,3,'THE LEADFOOT: two or three, never a crowd');
for(const e of keep.ents.filter(e=>e.t==='leadfoot')){assert(e.x<560,'not in the Drowned King\'s arena');assert.equal(keep.grid[59*keep.W+e.x],T.SOLID,'he needs a floor at '+e.x);}
const lfHits=[],lp={x:330,y:320,dead:false,swim:true,vx:0,vy:0};
/* HIS SOUNDS MUST BE SOUNDS THAT EXIST. A stub that answers to any name at all cannot tell you that SFX.chain is not
   a sound - which is exactly what it did, until the running game threw on his first anchor. Unguarded names only:
   `SFX.x ? SFX.x() : SFX.y()` is a deliberate optional, and there are seven of those in main.js. */
const lc=vm.createContext({P:lp,TS:16,T:{AIR:0,SPIKE:9},parts:[],DMG:{leadSweep:18,leadPlant:16,leadAnchor:14},
  SFX:new Proxy({},{get:(_,k)=>{if(typeof k!=='string')return noop;
    assert.equal(typeof REAL_SFX[k],'function','SFX.'+k+' is not a sound, and calling it throws in play');
    /* AND IT MUST BE GIVEN WHAT IT TAKES. SFX.swingUp(k) bare puts undefined through Math.min and NaN into an
       AudioParam, which throws - in the browser only, because in Node every sound returns at `if (!ac)`. */
    return (...a)=>{assert(a.length>=REAL_SFX[k].length,'SFX.'+k+' takes '+REAL_SFX[k].length+' argument(s) and was called with '+a.length+': that is a NaN in an AudioParam in play');};}}),
  number:noop,dust:noop,shakeCam:noop,tileAt:()=>1,damagePlayer:(x,d,o)=>{lfHits.push({x,d,o});return 'hit';},
  moveBody:(q,dx,dy)=>{q.x+=dx;q.y+=dy;return{ground:true,hitX:false};}});
vm.runInContext(s.slice(s.indexOf('const LEAD = {'),s.indexOf('const reefHome =')),lc);
const lf=(mode,o={})=>({t:'leadfoot',x:300,y:320,vx:0,vy:0,face:1,w:12,h:22,speed:18,mode,modeT:0,hit:false,stagger:0,anim:0,aimX:300,aimY:320,bubT:9,...o});
/* reached from walk: on his ground -> the sweep; over his head with the sweep spent -> the plant; a swimmer at range -> the anchor */
for(const [want,x,y,o]of[['sweepTell',322,320,{}],['plantTell',305,300,{sweepCd:2}],['anchorTell',400,280,{}]]){
  lp.x=x;lp.y=y;const e=lf('walk',o);lc.updateLeadfoot(e,.01);assert.equal(e.mode,want,'walk -> '+want);}
/* every windup RESOLVES into its blow - which is also the only way the sounds it plays are ever called */
for(const [tell,blow,x,y,o]of[['sweepTell','sweep',330,320,{}],['plantTell','plant',305,300,{}],['anchorTell','anchor',360,300,{aimX:360,aimY:300}]]){
  lp.x=x;lp.y=y;const e=lf(tell,{modeT:0.9,...o});let k=0;while(e.mode===tell&&k++<300)lc.updateLeadfoot(e,1/60);
  assert.equal(e.mode,blow,tell+' must resolve into '+blow);}
/* each blow lands where it is meant to, and the anchor is the only one no shield turns */
for(const [mode,x,y,hard,o]of[['sweep',330,320,false,{}],['plant',305,300,false,{}],['anchor',360,300,true,{aimX:360,aimY:300}]]){
  lfHits.length=0;lp.x=x;lp.y=y;const e=lf(mode,o);lc.updateLeadfoot(e,.01);
  assert.equal(lfHits.length,1,mode+' must land');assert.equal(!!lfHits[0].o?.unblockable,hard,mode+' blockable?');}
/* and each one MISSES its own answer: swim over the sweep, stand off the plant, leave the spot the anchor was thrown at */
for(const [mode,x,y,o]of[['sweep',330,280,{}],['plant',305,320,{}],['anchor',360,340,{aimX:360,aimY:300}]]){
  lfHits.length=0;lp.x=x;lp.y=y;lc.updateLeadfoot(lf(mode,o),.01);assert.equal(lfHits.length,0,mode+' counter');}
/* NOTHING SHOVES HIM: a heavy blow writes 400 into vx and he still holds his ground */
{const e=lf('rest',{vx:400,modeT:1});lc.updateLeadfoot(e,1/60);assert(Math.abs(e.vx)<=60,'knocked back at '+e.vx);}
console.log('Deep/Keep crop metadata, tribute, rewards, arrival air, campaign order, four crab attacks and counters, two Bellguard tells, and the Leadfoot\'s three tells, counters and footing pass.');
