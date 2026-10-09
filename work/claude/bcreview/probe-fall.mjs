import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16; const out = { tr: [] };
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = false; BK.sim(5);
    const P = () => BK.P, k = BK.keys; const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    for (const e of BK.enemies()) e.alive = false;
    BK.tp(449, 29); const hp0 = P().hp, d0 = BK.stats().deaths; out.hp0 = hp0;
    for (let i=0;i<400;i++) { clear(); k.right = true; BK.sim(1); if (i%15===0) out.tr.push([i, +(P().x/TS).toFixed(1), +(P().y/TS).toFixed(1), P().hp, BK.state]); if (BK.state!=='play') {out.state=BK.state; out.tr.push([i,'state',BK.state]); break;} }
    out.deaths = BK.stats().deaths - d0; out.final = [P().x/TS, P().y/TS, P().hp, BK.state];
    return out; })()`, 120000);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
