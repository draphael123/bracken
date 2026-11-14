// PAGE TOOL: launches headless Chrome
/* tools/foeproof-frames.mjs - frame time with the variant archers (claude/foevariety proof, 11-05). Palisade (9 variant archers) and stockade, real rAF loop, 1x and 4x CPU, god-mode knight
   put beside the densest cluster of fire/rock archers; also counts console.error/warn and page exceptions. node tools/foeproof-frames.mjs   (not in the suite) */
import { openPage } from './cdp.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  for (const lv of (process.argv[2] || 'palisadewood,stockade,fenroad').split(',')) {
    const info = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__ce=[];const oe=console.error;console.error=(...a)=>{window.__ce.push(a.join(' ').slice(0,200));oe(...a)};
      BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='${lv}'));BK.start();BK.god=true;BK.sim(200);
      const v=BK.enemies().filter(e=>e.alive&&e.t==='archer'&&['firearcher','rockarcher','venomarcher'].includes(e.cnSkin));
      let best=null;for(const a of v){const n=v.filter(b=>Math.abs(b.x-a.x)<640).length;if(!best||n>best.n)best={n,x:a.x,y:a.y};}
      if(best)BK.tp(Math.round(best.x/16)-6,Math.round(best.y/16)-1);BK.manualSimulation=false;return {variants:v.length,cluster:best&&best.n};})()`, 60000);
    for (const cpu of [1, 4]) {
      await pg.send('Emulation.setCPUThrottlingRate', { rate: cpu });
      await pg.evalp(`(()=>{BK.god=true;BK.P.hp=BK.P.maxHp;return 1})()`); await sleep(1500);
      await pg.evalp(`(()=>{const a=window.__fr={n:0,dts:[],last:performance.now(),on:true};window.__t0=performance.now();const f=t=>{if(!a.on)return;a.n++;a.dts.push(t-a.last);a.last=t;requestAnimationFrame(f)};requestAnimationFrame(f);return 1})()`);
      await sleep(6000);
      const r = await pg.evalp(`(()=>{const a=window.__fr;a.on=false;BK.P.hp=BK.P.maxHp;const d=a.dts.slice().sort((x,y)=>x-y);return {n:a.n,wall:(performance.now()-window.__t0)/1000,p50:d[Math.floor(d.length*.5)],p95:d[Math.floor(d.length*.95)],worst:d[d.length-1]}})()`);
      console.log(lv, JSON.stringify(info), 'cpu', cpu + 'x', 'fps', (r.n / r.wall).toFixed(1), 'p50', r.p50.toFixed(1), 'p95', r.p95.toFixed(1), 'worst', r.worst.toFixed(1));
    }
    await pg.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const ce = await pg.evalp('window.__ce'); console.log(lv, 'console.error', ce.length, JSON.stringify(ce.slice(0, 3)));
    if (ce.length) bad++;
  }
  console.log('page exceptions', pg.errors.length, JSON.stringify(pg.errors.slice(0, 3))); if (pg.errors.length) bad++;
} finally { await pg.close(); }
process.exit(bad ? 1 : 0);
