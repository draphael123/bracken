import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16; const out = { trace: [] };
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = true; BK.sim(5);
    for (const e of BK.enemies()) if (!e.boss) e.alive = false;
    const P = () => BK.P, k = BK.keys; const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    BK.tp(540, 29); for (let i=0;i<120;i++) BK.sim(1);
    const B = BK.boss; B.hp = B.maxHp * 0.55; for (let i=0;i<600;i++) BK.sim(1);
    out.ph = B.phase; BK.tp(542, 29); for (let i=0;i<30;i++) BK.sim(1);
    const H = BK.buriedCityHands(); let pulled = null;
    for (let i=0;i<500;i++) { clear(); k.left = true; BK.sim(1); if (i%20===0) out.trace.push([+(P().x/TS).toFixed(1), +(P().y/TS).toFixed(2), P().ground]); if (P().x/TS < 528.5 && pulled===null) { pulled = H.interact(P()); out.pulledAt=[P().x/TS,P().y/TS]; } }
    out.pulled = pulled; out.bossmode = B.mode;
    return out; })()`, 120000);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
