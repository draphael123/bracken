import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {openPage} from './cdp.mjs';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),noop=()=>{};
const P={x:100,y:320,w:12,h:24},mother={x:0,y:320,alive:true,anim:0,mode:'idle',modeT:0,heart:{hp:8},phase:1};
const node={motherNode:true,x:-128,y:320,light:{}};let damage=0;
const c=vm.createContext({P,mother,props:[node],movers:[],bossActive:true,L:{arena:{x0:-368,x1:384,floor:320}},TS:16,DMG:{root:16},EHP:{heart:8},enemies:[],seeds:[],vines:[],number:noop,burst:noop,shakeCam:noop,SFX:new Proxy({},{get:()=>noop}),box:p=>({l:p.x-6,r:p.x+6,t:p.y-24,b:p.y}),overlap:(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t,damagePlayer:()=>damage++});
vm.runInContext(source.slice(source.indexOf('function wakeMycelium'),source.indexOf('// ---------- critters:')),c);
const seen=new Set();for(let i=0;i<3600;i++){c.updateMother(mother,1/60);seen.add(mother.mode);}for(const k of ['rootFan','capClap','rootStab','seedRain','sporeVolley','floorSurge','sporeSweep'])assert(seen.has(k),k);assert(!seen.has('rootColumns'));
mother.heart.hp=4;c.updateMother(mother,1/60);assert.equal(mother.mode,'phaseRise');c.wakeMycelium(node);assert.equal(mother.mode,'phaseRise');for(let i=0;i<3600;i++){c.updateMother(mother,1/60);seen.add(mother.mode);}assert(seen.has('rootColumns')&&seen.has('sporeWheel'));assert(c.seeds.length>0);
for(const kind of ['floorSurge','sporeSweep','rootColumns']){P.x=100;P.y=320;c.motherPattern(mother,kind);damage=0;c.motherZones(mother,1);assert.equal(damage,0,'warning does not hurt');P.y=kind==='sporeSweep'?270:320;c.motherZones(mother,.2);assert(damage>0,kind+' must hit its marked region');}
P.y=288;c.motherPattern(mother,'floorSurge');damage=0;c.motherZones(mother,1.3);assert.equal(damage,0,'shelf clears floor surge');P.y=320;c.motherPattern(mother,'sporeSweep');damage=0;c.motherZones(mother,1.3);assert.equal(damage,0,'ground clears sweep');
const anchors=[];for(let k=0;k<4;k++){mother.mode='idle';mother.nodeRest=10;mother.nodeMove=true;for(let i=0;i<180;i++)c.updateMother(mother,1/60);anchors.push(node.x);assert.equal(node.x,node.targetX);assert.equal(node.light.x,node.x);}assert.equal(new Set(anchors).size,4);mother.mode='idle';mother.nodeRest=0;c.wakeMycelium(node);assert.equal(mother.mode,'open');assert.equal(mother.zones.length,0);
const pg=await openPage({audio:false,fonts:false});try{
 const r=await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const idx=LEVELS.findIndex(l=>l.id==='spore'),rows=[];
 for(const h of ['knight','pyro','paladin','pirate','reaper','warden']){BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.ambushes().forEach(a=>a.st='done');BK.enemies().forEach(e=>e.alive=false);const p=BK.P,m=BK.boss,A=BK.L.arena,mx=m.x/16-.5,fy=A.floor/16,landings=[];
 for(const side of [-1,1]){for(const k in BK.keys)BK.keys[k]=false;BK.tp(mx+(side<0?-20:21),fy-1);BK.sim(30);const targets=side<0?[[-17,2],[-13,4],[-9,6]]:[[17,2],[13,4],[9,6]];
 for(const [dx,dy]of targets){const x=(mx+dx)*16+8;BK.keys.jump=true;BK.press('jump');let air=false,land=false,minY=p.y;const start=[p.x,p.y,p.st,p.ground];for(let f=0;f<150;f++){BK.keys.right=p.x<x-2;BK.keys.left=p.x>x+2;BK.sim(1);minY=Math.min(minY,p.y);if(!p.ground)air=true;if(air&&p.ground){land=true;break;}}BK.keys.left=BK.keys.right=BK.keys.jump=false;BK.sim(3);if(!land||Math.abs(p.y-(fy-dy)*16)>1)throw Error(h+' shelf '+dx+' got '+p.x+','+p.y+' start '+JSON.stringify(start)+' minY '+minY+' tile '+BK.L.grid[(fy-dy)*BK.L.W+Math.floor(mx+dx)]+' state '+BK.state+' dead '+p.dead+' expected '+(fy-dy)*16);landings.push([Math.round(p.x),p.y]);for(let f=0;f<30;f++){BK.keys.right=p.x<x-2;BK.keys.left=p.x>x+2;BK.sim(1);}BK.keys.left=BK.keys.right=false;BK.sim(6);}}
 rows.push({hero:h,landings});}
 BK.load(idx);BK.state='play';BK.tp(BK.L.arena.trigger/16+1,BK.L.arena.floor/16-1);BK.sim(240);BK.god=true;const m=BK.boss;BK.tp(m.x/16-8,BK.L.arena.floor/16-1);m.mode='idle';m.modeT=99;BK.step(120);BK.step(1);return{rows,width:BK.L.arena.x1-BK.L.arena.x0,png:BK.view.buf.toDataURL()};})()`);
 assert.equal(r.rows.length,6);assert.equal(r.width,752);assert.deepEqual(pg.errors,[]);if(process.env.MOTHER_SCREEN)writeFileSync(process.env.MOTHER_SCREEN,Buffer.from(r.png.split(',')[1],'base64'));console.log(JSON.stringify({phases:[7,9],anchors,warningAndSafeLaneChecks:true,platforms:r.rows}));
}finally{pg.close();}


