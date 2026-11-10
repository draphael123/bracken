/* tools/nightwalk-probe.mjs (claude/nightwalk) what the page exposes with the four road flags on. BRACKEN_ROAD=ww,sk,mn,ac PORT=n node tools/nightwalk-probe.mjs */
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const out = { levels: LEVELS.map(l=>l.id).join(','), bk: Object.keys(BK).join(','), bkt: typeof BKT==='object'?Object.keys(BKT).join(','):null, per: {} };
    for (const id of ['wispwood','silk','manor','academy']) { const i = LEVELS.findIndex(l=>l.id===id); BK.setHero('knight'); BK.reset({fresh:true}); BK.load(i); BK.state='play'; BK.sim(30);
      const L = BK.L; out.per[id] = { i, keys: Object.keys(L).join(','), W: L.W||L.w, boss: LEVELS[i].boss||null, arena: L.arena||null, en: BK.enemies().length, P: [BK.P.x,BK.P.y] }; }
    return out; })()`, 300000);
  console.log(JSON.stringify(r, null, 1)); console.log('errors', JSON.stringify(pg.errors.slice(0,4)));
} finally { pg.close(); }
