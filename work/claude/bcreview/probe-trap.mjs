import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of ['knight','warden','pyro']) {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const TS = 16; const out = {};
    BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = false; BK.sim(5);
    const P = () => BK.P, k = BK.keys; const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
    for (const e of BK.enemies()) if (!(Math.abs(e.x/TS-447)<6 || Math.abs(e.x/TS-443)<6)) e.alive = false;
    BK.tp(449, 29); P().face = -1; let maxX = 0, fell = false, d0 = BK.stats().deaths, hits = 0, hp0 = P().hp; let lastHp = P().hp;
    for (let i=0;i<900;i++) { clear(); BK.sim(1); maxX = Math.max(maxX, P().x/TS); if (P().hp < lastHp) { hits++; out['hit'+hits] = [i, +(P().x/TS).toFixed(1), P().hp]; } lastHp = P().hp; if (P().y/TS > 33) { fell = true; out.fellAt = i; break; } }
    out.maxX = maxX; out.fell = fell; out.deaths = BK.stats().deaths - d0; out.hits = hits; out.hpLeft = P().hp/P().maxHp; out.foes = BK.enemies().filter(e=>e.alive).map(e=>e.t+'@'+Math.round(e.x/TS));
    return out; })()`, 120000);
  console.log(hero, JSON.stringify(r)); }
} finally { pg.close(); }
