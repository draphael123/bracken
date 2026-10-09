import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of ['knight','warden','pyro']) {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16; const out = { trace: [] };
    BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = true; BK.sim(5);
    for (const e of BK.enemies()) if (!e.boss) e.alive = false;
    const P = () => BK.P, k = BK.keys; const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    BK.tp(540, 29); for (let i=0;i<120;i++) BK.sim(1);
    const B = BK.boss; B.hp = B.maxHp * 0.55; for (let i=0;i<600;i++) BK.sim(1);
    out.ph = B.phase; BK.tp(535, 29); for (let i=0;i<30;i++) BK.sim(1);
    const H = BK.buriedCityHands(); let best = 99, onTop = 0;
    for (let i=0;i<900;i++) { clear(); k.left = true; if (i%25===0) BK.press('jump'); BK.sim(1); const y = P().y/TS, x = P().x/TS; if (x < 531) { onTop++; best = Math.min(best, y); if (i%60==0) out.trace.push([+x.toFixed(1), +y.toFixed(2), P().ground]); } if (x < 530 && P().ground && !out.pull) { out.pull = H.interact(P()); out.pullPos = [x, y]; } }
    out.bestY = best; out.onTop = onTop; out.finalX = P().x/TS; out.finalY = P().y/TS;
    return out; })()`, 120000);
  console.log(hero, JSON.stringify(r)); }
} finally { pg.close(); }
