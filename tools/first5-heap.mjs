// tools/first5-heap.mjs - claude/first5: JS heap + canvas count after each level load in ONE page (the headless page dies after ~3 loads on this machine). node tools/first5-heap.mjs [ids]
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false, seed: 11, args: ['--enable-precise-memory-info'] }); const E = e => pg.evalp(e);
const ids = (process.argv[2] || 'wood,hornetsnest,marsh,fenroad,stockade').split(',');
try {
  await E('BK.manualSimulation=true');
  const mem = async l => { const m = await E(`(()=>{const p=performance.memory;return {used:Math.round(p.usedJSHeapSize/1048576),total:Math.round(p.totalJSHeapSize/1048576),canv:document.querySelectorAll('canvas').length}})()`); console.log(l, JSON.stringify(m)); };
  await mem('boot');
  for (const id of ids) {
    await E(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.start();BK.god=true;BK.sim(120);})()`);
    await mem(id);
  }
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
