// tools/arena-shut.mjs - THE ARENA IS SHUT (claude/colossus3). Daniel, 10-07, after playing THE GLASS COLOSSUS: "nearby enemies throw bombs into the
// arena - it makes the fight unnecessarily difficult". The cause was shared: a boss's (or a mini's) walls are six rows high and shut only the way in, and
// every level foe outside them kept its AI - a thrower's arc goes over a six-row wall. src/main.js arenaShut/arenaHeld now HOLD every level foe standing
// outside the walls while the fight is live. (The boss bot never saw the leak: src/lab.js clears the level's foes before a fight.)
// In the page, for every level with an arena (and every mini), with the level's own foes LEFT IN: walk in, wake the fight, then for 6 s
//   - every level foe that stood outside the walls is held, is never carried into the arena, and throws nothing (a sling's stone in flight is the throw we can see);
//   - CONTROL (THE GLASS SEA): with the hold lifted every frame, the Colossus Steps' shard-throwers DO sling into the arena - the leak the hold closes.
//   PORT=<your port> node tools/arena-shut.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`globalThis.__only=${JSON.stringify(process.env.ONLY ? process.env.ONLY.split(',') : null)};(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const rows=[];
const run=(i,kind,lift)=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(i);BK.start();BK.god=true;BK.sim(10);
  const L=BK.L,A=kind==='boss'?L.arena:L.mini,live=()=>kind==='boss'?BK.bossActive:BK.miniActive;if(!A||A.x0===undefined||A.carpet)return null;
  const e=BK.enemies().find(q=>q.t===A.boss&&q.alive&&(kind==='boss'||q.mini||q.t==='greathound'));if(!e)return null;
  BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);let f=0;for(;f<240&&!live();f++){BK.P.inv=99;BK.P.hp=BK.P.maxHp;BK.sim(1);}
  if(!live())return {started:false};
  const out=BK.enemies().filter(q=>q.alive&&q!==e&&!q.maxHp&&!q.mini&&(q.x<A.x0-2||q.x>A.x1+2)),x0=out.map(q=>q.x);let held=out.filter(q=>q.arenaHeld).length,moved=0,stones=0;
  for(let k=0;k<360;k++){if(lift)for(const q of out)q.arenaHeld=false;BK.P.inv=99;BK.P.hp=BK.P.maxHp;BK.sim(1);
    for(const q of out)if(q.alive&&q.st&&q.st.stone&&q.st.stone.t<0.05)stones++;}
  const mv=[];out.forEach((q,j)=>{if(q.alive&&Math.abs(q.x-x0[j])>1){moved++;mv.push(q.t+":"+Math.round(q.x-x0[j])+(q.x>=A.x0&&q.x<=A.x1?"IN":""));}});
  return {started:true,mv:mv.join(" "),out:out.length,held,moved,stones,ts:[...new Set(out.map(q=>q.t))].join('/')};};
for(const [i,lv] of LEVELS.entries()){if(globalThis.__only&&!__only.includes(lv.id))continue;let b;try{b=lv.build();}catch{continue;}
 for(const kind of ['boss','mini']){const A0=kind==='boss'?b.arena:b.mini;if(!A0)continue;
  const x=run(i,kind,false);if(x)rows.push({lv:lv.id,kind,...x});await new Promise(r=>setTimeout(r,0));}}
const gi=LEVELS.findIndex(l=>l.id==='glasssea');const control=run(gi,'boss',true);
return {rows,control};})()`, 3600000);
} finally { pg.close(); }
let bad = 0;
for (const x of r.rows) { const fail = x.started && (x.held !== x.out || /IN/.test(x.mv) || x.stones);   /* (a held foe may still be carried - a current, a tide, a gate's nudge: never INTO the arena) */ if (fail) bad++;
  if (fail || (x.started && x.out)) console.log((fail ? 'FAIL ' : 'ok   ') + x.lv.padEnd(13) + x.kind.padEnd(5) + (x.started ? x.out + ' outside (' + x.ts + '), ' + x.held + ' held, ' + x.moved + ' carried (water, a gate), ' + x.stones + ' stones slung' + (x.mv ? ' [' + x.mv + ']' : '') : 'the fight never started (not this check\'s to judge)')); }
const c = r.control; const leak = c && c.started && c.stones > 0;
console.log((leak ? 'ok   ' : 'FAIL ') + 'CONTROL: THE GLASS SEA with the hold lifted - ' + (c ? c.out + ' outside, ' + c.stones + ' stones slung into the arena' : 'no fight') + ' (the leak is real, and the hold is what closes it)');
if (!leak) bad++;
if (bad) { console.log('ARENA-SHUT: ' + bad + ' problem(s)'); process.exit(1); }
console.log('ARENA-SHUT OK: in ' + r.rows.filter(x => x.started).length + ' boss and mini fights every level foe outside the walls is held - nothing is thrown in');
