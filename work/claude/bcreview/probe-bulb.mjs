import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of ['pyro']) {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16; const out = { tr: [] };
    BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = true; BK.sim(5);
    const P = () => BK.P, k = BK.keys; const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    for (const e of BK.enemies()) e.alive = false;
    BK.tp(245, 29); for (let i=0;i<20;i++) BK.sim(1); const H = BK.buriedCityHands(); H.interact(P());
    for (let i=0;i<600;i++) BK.sim(1);
    const K = BK.buriedCity(); out.rooms = K.rooms.filter(r=>/bulb/.test(r.id)).map(r=>[r.id, r.level, r.gate]);
    let lx=-1, still=0;
    for (let i=0;i<1500;i++) { clear(); k.right = true; BK.sim(1); const x = P().x/TS; if (Math.abs(x-lx)<0.01) still++; else still=0; lx=x; if (still===10 && P().ground) BK.press('jump'); if (i%60===0) out.tr.push([+x.toFixed(1), +(P().y/TS).toFixed(1), P().ground]); if (x>312) break; }
    out.final = [P().x/TS, P().y/TS];
    return out; })()`, 120000);
  console.log(hero, JSON.stringify(r)); }
} finally { pg.close(); }
