import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {LEVELS} from '../src/level.js';
import {AMBUSH_LEADERS,AMBUSH_TARGET} from '../src/ambush.js';
let count=0;
for(const lv of LEVELS)for(const A of lv.build().ambushes||[]){assert.equal(A.waves.length,1,lv.id);const w=A.waves[0];assert(w.length>=3&&w.length<=5,lv.id);const lead=w.filter(f=>f[3]?.elite);assert.equal(lead.length,1,lv.id);assert(AMBUSH_LEADERS.has(lead[0][0]));assert(!w.some(f=>['nest','shaman'].includes(f[0])),lv.id+' summons');count++;}
assert.deepEqual(AMBUSH_TARGET,{min:15,max:35});
const src=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const start=src.slice(src.indexOf('function ambushStart('),src.indexOf('function ambushSpawn('));
assert(start.includes('ambushShut(A); ambushSpawn(A)'));assert(start.includes('ELITE[A.leader.t].name'));
const run=src.slice(src.indexOf('function ambushRun('),src.indexOf('function updateAmbush('));
assert(!run.includes('A.wave++'));assert(!run.includes('AMB.beat'));assert(!run.includes('A.t <= 0'));
const ctx={AMB_FLY:new Set(),TS:16,LH:100,T:{SPIKE:9},tileAt:()=>0,ambushCarts(){},ambushHold(){},ambushPen(){},hazardFoe(){},ambushClear(A){A.st='done';}};vm.createContext(ctx);vm.runInContext(run,ctx);
const leader={alive:true,x:80,y:80},minor={alive:true,x:96,y:80};ctx.A={st:'fight',t:-100,wallL:0,wallR:20,leader,foes:[leader,minor]};vm.runInContext('ambushRun(A,1)',ctx);assert.equal(ctx.A.st,'fight','timer must not clear a living captain');leader.alive=false;vm.runInContext('ambushRun(A,1)',ctx);assert.equal(ctx.A.st,'done');assert(minor.alive,'leader death ends room without killing remaining minions');assert(src.includes('e.fleeT=2;e.harmless=true'));assert(src.includes("(e.ambushMove||0)%2?'lunge':'slam'"));
console.log(count+' single-wave rooms: one captain, 2-4 minions, immediate roster, named lock and leader-only clear.');
