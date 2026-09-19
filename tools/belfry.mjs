import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {LEVELS,T} from '../src/level.js';
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),L=LEVELS.find(l=>l.id==='spire').build();
assert(L.belfry);assert(L.ents.some(p=>p.t==='tbell'&&p.roc));assert.equal(L.grid[26*L.W+58],T.NET);assert.equal(L.grid[24*L.W+45],T.ONEWAY);
const noop=()=>{},props=[{t:'tbell',roc:true,x:904,y:480}],rocks=[],P={x:904,y:480,dead:false,ground:true,vx:0,vy:0,dodge:0};let hurts=0;
const c=vm.createContext({L,props,rocks,P,TS:16,seeds:[],parts:[],DMG:{rocRake:10,rocDive:10,rocShriek:10},SFX:new Proxy({},{get:()=>noop}),number:noop,ringAt:noop,dust:noop,shakeCam:noop,damagePlayer:()=>hurts++});
vm.runInContext(s.slice(s.indexOf('function updateRoc(e, dt)'),s.indexOf('// THE RIMEWRIGHT',s.indexOf('function updateRoc(e, dt)'))),c);
const b={mode:'wake',modeT:0,hp:1100,maxHp:1100,phase:1,anim:0};const modes=new Set();for(let i=0;i<3000;i++){c.updateRoc(b,1/60);modes.add(b.mode);if(b.mode==='carry')b.hp--;}
for(const m of ['gust','talon','shed','carry','shriek'])assert(modes.has(m),m+' occurs');
assert(hurts>0);b.hp=500;c.updateRoc(b,1/60);assert.equal(b.mode,'roofTell');for(let i=0;i<80;i++)c.updateRoc(b,1/60);assert(L.belfry.roofGone&&rocks.length===7);assert(rocks.every(r=>r.roof&&r.delay>=.5));
assert(!s.slice(s.indexOf('function updateRoc'),s.indexOf('// THE RIMEWRIGHT')).includes('openHp'),'no damage-window cap');
console.log('Belfry beam/ladder, five attacks, hit-to-break carry, and seven warned phase-two roof tiles verified.');
