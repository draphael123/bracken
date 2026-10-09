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
    out.ph = B.phase;
    // stand on the ledge (local 8..13 => cols 532..537, row 27), walk west & jump the gap
    BK.tp(533, 26); for (let i=0;i<40;i++) BK.sim(1); out.onLedge = [P().x/TS, P().y/TS, P().ground];
    const H = BK.buriedCityHands(); let reached = false;
    for (let i=0;i<400;i++) { clear(); k.left = true; if (P().x/TS < 532.3 && P().x/TS > 530 && P().ground) BK.press('jump'); if (P().x/TS < 528.6) clear(); BK.sim(1); const x = P().x/TS, y = P().y/TS;
      if (i%20===0) out.trace.push([+x.toFixed(1), +y.toFixed(2), P().ground]);
      if (x < 529 && P().ground && !out.top) out.top = [x, y]; if (x < 528.7 && x > 526.3 && P().ground && !out.pull) { out.pull = H.interact(P()); out.pullPos = [x,y]; } }
    out.final = [P().x/TS, P().y/TS];
    return out; })()`, 120000);
  console.log(hero, JSON.stringify(r)); }
} finally { pg.close(); }
