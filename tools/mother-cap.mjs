import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {openPage} from './cdp.mjs';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),noop=()=>{};
const P={x:100,y:320,w:12,h:24},mother={x:0,y:320,alive:true,anim:0,mode:'idle',modeT:0,heart:{hp:8},phase:1};
const node={motherNode:true,x:-128,y:320,light:{}};let damage=0;
const c=vm.createContext({P,mother,props:[node],movers:[],bossActive:true,L:{arena:{x0:-368,x1:384,floor:320}},TS:16,DMG:{root:16},EHP:{heart:8},enemies:[],seeds:[],vines:[],number:noop,burst:noop,shakeCam:noop,SFX:new Proxy({},{get:()=>noop}),box:p=>({l:p.x-6,r:p.x+6,t:p.y-24,b:p.y}),overlap:(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t,damagePlayer:(x,d)=>{damage++;lastDmg=d;}});let lastDmg=0;
vm.runInContext(source.slice(source.indexOf('function wakeMycelium'),source.indexOf('// ---------- critters:')),c);
vm.runInContext('Math.random=(()=>{let s=12345;return()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296;})()',c);   /* her draw is weighted by where you stand: the dice are pinned so the audit is the same every run */
const MT=vm.runInContext('MOTHER_T',c);
const seen=new Set();for(let i=0;i<3600;i++){c.updateMother(mother,1/60);seen.add(mother.mode);}for(const k of ['rootFan','capClap','rootStab','seedRain','sporeVolley','floorSurge','sporeSweep'])assert(seen.has(k),k);assert(!seen.has('rootColumns'));
mother.heart.hp=4;c.updateMother(mother,1/60);assert.equal(mother.mode,'phaseRise');c.wakeMycelium(node);assert.equal(mother.mode,'phaseRise');for(let i=0;i<3600;i++){c.updateMother(mother,1/60);seen.add(mother.mode);}assert(seen.has('rootColumns')&&seen.has('sporeWheel'));assert(c.seeds.length>0);
for(const kind of ['floorSurge','sporeSweep','rootColumns']){P.x=100;P.y=320;c.motherPattern(mother,kind);damage=0;c.motherZones(mother,MT.zoneTell-.1);assert.equal(damage,0,'warning does not hurt');P.y=kind==='sporeSweep'?270:320;c.motherZones(mother,.2);assert(damage>0,kind+' must hit its marked region');}
P.y=288;c.motherPattern(mother,'floorSurge');damage=0;c.motherZones(mother,1.3);assert.equal(damage,0,'shelf clears floor surge');P.y=320;c.motherPattern(mother,'sporeSweep');damage=0;c.motherZones(mother,1.3);assert.equal(damage,0,'ground clears sweep');
const anchors=[];for(let k=0;k<4;k++){mother.mode='idle';mother.nodeRest=10;mother.nodeMove=true;for(let i=0;i<180;i++)c.updateMother(mother,1/60);anchors.push(node.x);assert.equal(node.x,node.targetX);assert.equal(node.light.x,node.x);}assert.equal(new Set(anchors).size,4);mother.mode='idle';mother.nodeRest=0;c.wakeMycelium(node);assert.equal(mother.mode,'open');assert.equal(mother.zones.length,0);
/* ---- THE HARDER MOTHER (batch 4a, .claude/briefs/mother-cap-challenge.md) ---- */
const hard={};
// 1. the downtime: barely a breath between attacks, and shorter still in phase two
assert.ok(MT.idle[1]<=1.25&&MT.idle[2]<=.95&&MT.idle[3]<=MT.idle[2],'idle '+MT.idle);assert.ok(MT.zoneTell<=.95,'the zone tells are a fifth shorter');
// 2. SHE READS YOU: a shelf brings the clap and the sweep, the floor the roots and the surge; never the same attack twice running
{const m2={x:0,phase:1},count=(y,n)=>{P.y=y;P.x=100;m2.last=null;m2.since={};const t={};let prev=null,rep=0;for(let i=0;i<n;i++){const k=c.motherPick(m2);t[k]=(t[k]||0)+1;if(k===prev)rep++;prev=k;}return{t,rep};};
 const hi=count(280,300),lo=count(320,300),share=(r,ks)=>ks.reduce((a,k)=>a+(r.t[k]||0),0)/300;
 hard.shelf=+share(hi,['capClap','sporeSweep']).toFixed(2);hard.floor=+share(lo,['capClap','sporeSweep']).toFixed(2);hard.floorRoots=+share(lo,['rootStab','floorSurge','rootFan']).toFixed(2);
 assert.ok(hard.shelf>=.4,'on a shelf, the clap and the sweep come most: '+hard.shelf);assert.ok(hard.floor<=.2,'on the floor, they come least: '+hard.floor);assert.ok(hard.floorRoots>=.45,'on the floor, the roots come: '+hard.floorRoots);
 assert.equal(hi.rep+lo.rep,0,'never the same attack twice running');for(const k of ['rootFan','capClap','rootStab','seedRain','sporeVolley','floorSurge','sporeSweep'])assert.ok(lo.t[k]>0&&hi.t[k]>0,'nothing is skipped for long: '+k);P.x=100;P.y=320;}
// 6. the hits: the zones 22, the clap 24
P.x=100;P.y=320;c.motherPattern(mother,'floorSurge');damage=0;c.motherZones(mother,MT.zoneTell+.05);assert.equal(lastDmg,22,'a root zone hurts 22');assert.equal(MT.clap,24,'the clap hurts 24');
// 3. PHASE TWO LAYERS: a floor surge comes with a volley; the gills drop sporelings, never more than three
{mother.phase=2;mother.heart.hp=4;const s0=c.seeds.length;c.motherPattern(mother,'floorSurge');assert.equal(mother.layer,'sporeVolley');mother.modeT=0;c.updateMother(mother,1/60);hard.layered=c.seeds.length-s0;assert.ok(hard.layered>=3,'the surge brings a volley: '+hard.layered);
 let most=0;for(let i=0;i<60*40;i++){c.updateMother(mother,1/60);most=Math.max(most,c.enemies.filter(q=>q.alive&&q.fromMother).length);}hard.spores=most;assert.ok(most>0&&most<=2,'sporelings, never more than two: '+most);
// 4. THE MYCELIUM: in from the walls, it poisons who stands on it, never reaches a knot
 const A=c.L.arena;hard.creep=+mother.creep.toFixed(1);assert.ok(mother.creep>20&&mother.creep<=MT.creepMax,'the mycelium creeps in: '+mother.creep);
 for(const x of [-128,160,-256,272])assert.ok(x-A.x0>mother.creep+10&&A.x1-x>mother.creep+10,'it never reaches a knot at '+x);
 P.venomT=0;P.x=A.x0+4;P.y=320;c.updateMother(mother,1/60);assert.ok(P.venomT>0,'standing on it poisons');P.venomT=0;P.x=0;c.updateMother(mother,1/60);assert.ok(!(P.venomT>0),'the middle is clean');P.x=100;
// 5. PHASE THREE: the rain the whole time, and the heart open for less
 mother.heart.hp=2;for(let i=0;i<60*8;i++)c.updateMother(mother,1/60);assert.equal(mother.phase,3);hard.rain=c.seeds.filter(q=>q.mrain).length;assert.ok(hard.rain>=4,'seed rain the whole time in phase three: '+hard.rain);
 mother.mode='idle';mother.modeT=9;mother.nodeRest=0;c.wakeMycelium(node);assert.equal(mother.mode,'open');hard.open3=mother.modeT;assert.ok(mother.modeT<MT.open[1],'the heart opens for less: '+mother.modeT);}
console.log(JSON.stringify({hard}));
const pg=await openPage({audio:false,fonts:false});try{
 const r=await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const idx=LEVELS.findIndex(l=>l.id==='spore'),rows=[];
 for(const h of ['knight','pyro','paladin','pirate','reaper','warden']){BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.ambushes().forEach(a=>a.st='done');BK.enemies().forEach(e=>e.alive=false);const p=BK.P,m=BK.boss,A=BK.L.arena,mx=m.x/16-.5,fy=A.floor/16,landings=[];
 for(const side of [-1,1]){for(const k in BK.keys)BK.keys[k]=false;BK.tp(mx+(side<0?-20:21),fy-1);BK.sim(30);const targets=side<0?[[-17,2],[-13,4],[-9,6]]:[[17,2],[13,4],[9,6]];
 for(const [dx,dy]of targets){const x=(mx+dx)*16+8;BK.keys.jump=true;BK.press('jump');let air=false,land=false,minY=p.y;const start=[p.x,p.y,p.st,p.ground];for(let f=0;f<150;f++){BK.keys.right=p.x<x-2;BK.keys.left=p.x>x+2;BK.sim(1);minY=Math.min(minY,p.y);if(!p.ground)air=true;if(air&&p.ground){land=true;break;}}BK.keys.left=BK.keys.right=BK.keys.jump=false;BK.sim(3);if(!land||Math.abs(p.y-(fy-dy)*16)>1)throw Error(h+' shelf '+dx+' got '+p.x+','+p.y+' start '+JSON.stringify(start)+' minY '+minY+' tile '+BK.L.grid[(fy-dy)*BK.L.W+Math.floor(mx+dx)]+' state '+BK.state+' dead '+p.dead+' expected '+(fy-dy)*16);landings.push([Math.round(p.x),p.y]);for(let f=0;f<30;f++){BK.keys.right=p.x<x-2;BK.keys.left=p.x>x+2;BK.sim(1);}BK.keys.left=BK.keys.right=false;BK.sim(6);}}
 rows.push({hero:h,landings});}
 BK.load(idx);BK.state='play';BK.tp(BK.L.arena.trigger/16+1,BK.L.arena.floor/16-1);BK.sim(240);BK.god=true;const m=BK.boss;BK.tp(m.x/16-8,BK.L.arena.floor/16-1);m.mode='idle';m.modeT=99;BK.step(120);BK.step(1);return{rows,width:BK.L.arena.x1-BK.L.arena.x0,png:BK.view.buf.toDataURL()};})()`);
 assert.equal(r.rows.length,6);assert.equal(r.width,752);assert.deepEqual(pg.errors,[]);if(process.env.MOTHER_SCREEN)writeFileSync(process.env.MOTHER_SCREEN,Buffer.from(r.png.split(',')[1],'base64'));console.log(JSON.stringify({phases:[7,9],anchors,warningAndSafeLaneChecks:true,platforms:r.rows}));
}finally{pg.close();}


