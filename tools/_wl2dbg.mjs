import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
const I = LEVELS.findIndex(l => l.id === 'witchlight');
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.sim(10);
  for(const e of BK.enemies())if(e.t!=='gargoyle')e.alive=false;const g=BK.enemies().find(e=>e.t==='gargoyle');const s=BK.movers().filter(m=>m.arena&&!m.cracked).sort((a,b)=>a.x-b.x)[0];
  BK.P.x=s.x+s.w/2;BK.P.y=s.y-1;BK.P.vy=0;BK.sim(90);g.mode='perchFly';g.modeT=2.5;g.shriekCd=0;for(let i=0;i<400&&g.mode!=='hover';i++)BK.sim(1);
  const ws=BK.enemies().filter(q=>q.alive&&q.fromGarg);const tr=[];for(let i=0;i<300;i++){BK.sim(1);if(i%20===0)tr.push(ws.map(w=>w.mode+'@'+Math.round(w.x)+','+Math.round(w.y)+' cd'+(w.cd||0).toFixed(1)+' an'+(w.anim||0).toFixed(2)+' st'+(w.stagger||0).toFixed(2)+' fr'+(w.frozen||0)+' pin'+(w.pinT||0)+' al'+w.alive+' bk'+(w.broken||0)).join(';')+' P'+Math.round(BK.P.x)+','+Math.round(BK.P.y));}
  return tr.join(' | ');})()`, 60000); console.log(r); } finally { pg.close(); }
