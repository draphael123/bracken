import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {LEVELS} from '../src/level.js';
import {AMBUSH_LEADERS,AMBUSH_TARGET,AMBUSH_CAPTAINS} from '../src/ambush.js';
let count=0;
for(const lv of LEVELS)for(const A of lv.build().ambushes||[]){assert.equal(A.waves.length,1,lv.id);const w=A.waves[0];assert(w.length>=3&&w.length<=5,lv.id);const lead=w.filter(f=>f[3]?.elite);assert.equal(lead.length,1,lv.id);assert(AMBUSH_LEADERS.has(lead[0][0]));assert(!w.some(f=>['nest','shaman'].includes(f[0])),lv.id+' summons');count++;}
assert.deepEqual(AMBUSH_TARGET,{min:15,max:35});
// ambush-listed audit Q1 (approved, ambushfix 2026-09-28): singleAmbush() (src/ambush.js) resolves the captain
// FIRST via AMBUSH_CAPTAINS[id] (by type name, ignoring any elite flag), THEN via the first elite-flagged
// AMBUSH_LEADERS member, THEN via a fallback search - and separately, its "rest" filter excludes ANY tuple whose
// own {elite:true} is set (`!f[3]?.elite`), win or lose the captaincy search. So whenever AMBUSH_CAPTAINS[id] is
// set, a DIFFERENT tuple that still carries its own {elite:true} can never spawn either way: AMBUSH_CAPTAINS
// already claimed the captain slot by name, and the flag disqualifies that other tuple from every rest slot too.
// This silently orphaned Kingswood's shield (AMBUSH_CAPTAINS.kings='archer', but shield carried the flag) and
// Gale Moor's troll (AMBUSH_CAPTAINS.moor='goat', but troll carried the flag) before the audit's fix - in both
// cases the room only ever had ONE literal elite:true tuple, so counting flags would have missed this; the bug
// is the flag landing on the WRONG type. Assert it can't recur: for every ambush whose id has an AMBUSH_CAPTAINS
// override, no source tuple of a DIFFERENT type may carry elite:true.
{
  const AMBUSH_FILES=['level.js','ore-road.js','burial-caverns.js','sunken-caravan.js','unburied-field.js'];
  function findBalanced(text,start){let depth=0;for(let i=start;i<text.length;i++){if(text[i]==='[')depth++;else if(text[i]===']'){depth--;if(depth===0)return text.slice(start,i+1);}}throw new Error('unbalanced brackets at '+start);}
  // name -> id, read off the real built levels (ambush-listed.mjs uses the same trick) rather than re-deriving
  // id from source position, since some ambushes (moor, mage) are pushed inline inside a build function, not
  // keyed by id in the static AMBUSH{} object.
  const nameToId=new Map();
  for(const lv of LEVELS){let L;try{L=lv.build();}catch{continue;}for(const A of L.ambushes||[])nameToId.set(A.name,lv.id);}
  for(const file of AMBUSH_FILES){
    const text=readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
    const re=/waves:\s*(\[)/g; let m;
    while((m=re.exec(text))){
      const start=m.index+m[0].length-1;
      const block=findBalanced(text,start);
      const before=text.slice(Math.max(0,m.index-2000),m.index);
      const names=[...before.matchAll(/name:\s*(?:'([^']+)'|"([^"]+)")/g)];
      const name=names.length?(names[names.length-1][1]??names[names.length-1][2]):null;
      if(!name)continue;
      const id=nameToId.get(name);
      const captain=id&&AMBUSH_CAPTAINS[id];
      if(!captain)continue;   // no id override to conflict with - AMBUSH_LEADERS/elite-flag search picks the captain on its own
      const tuples=[...block.matchAll(/\[\s*'([a-zA-Z]+)'[^\]]*\]/g)];
      const strayElites=tuples.filter(t=>t[1]!==captain&&/elite:\s*true/.test(t[0]));
      assert.equal(strayElites.length,0,name+' (captain '+captain+' via AMBUSH_CAPTAINS.'+id+'): '+
        strayElites.map(t=>t[1]).join(',')+" also carries elite:true - it can never spawn (see comment above), "+
        'remove the flag or make it the room\'s actual captain');
    }
  }
}
const src=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const start=src.slice(src.indexOf('function ambushStart('),src.indexOf('function ambushSpawn('));
assert(start.includes('ambushShut(A); ambushSpawn(A)'));assert(start.includes('ELITE[A.leader.t].name'));
const run=src.slice(src.indexOf('function ambushRun('),src.indexOf('function updateAmbush('));
assert(!run.includes('A.wave++'));assert(!run.includes('AMB.beat'));assert(!run.includes('A.t <= 0'));
const ctx={AMB_FLY:new Set(),TS:16,LH:100,T:{SPIKE:9},tileAt:()=>0,ambushCarts(){},ambushHold(){},ambushPen(){},ambushRow:(A,t,y)=>y,enemies:[],hazardFoe(){},ambushClear(A){A.st='done';}};vm.createContext(ctx);vm.runInContext(run,ctx);
const leader={alive:true,x:80,y:80},minor={alive:true,x:96,y:80};ctx.A={st:'fight',t:-100,wallL:0,wallR:20,waves:[[['soldier',5,4,{elite:true}]]],leader,foes:[leader,minor]};vm.runInContext('ambushRun(A,1)',ctx);assert.equal(ctx.A.st,'fight','timer must not clear a living captain');leader.x=999;vm.runInContext('ambushRun(A,1)',ctx);assert.equal(ctx.A.st,'fight');assert.equal(leader.x,88);leader.alive=false;vm.runInContext('ambushRun(A,1)',ctx);assert(leader.alive,'despawn must recover captain');assert.equal(ctx.A.st,'fight');leader.alive=false;leader.defeated=true;vm.runInContext('ambushRun(A,1)',ctx);assert.equal(ctx.A.st,'done');assert(minor.alive,'leader death ends room without killing remaining minions');assert(src.includes('e.fleeT=2;e.harmless=true'));assert(src.includes("(e.ambushMove||0)%2?'lunge':'slam'"));
console.log(count+' single-wave rooms: one captain, 2-4 minions, immediate roster, named lock and leader-only clear.');
