import { openPage } from '../../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = true; BK.sim(30); BK.tp(101, 36); BK.sim(10);
    const H = BK.buriedCityHands(), F = H.flip, P = BK.P; const ok = F.interact(P); BK.sim(20);
    const K = BK.buriedCity(); const g = K.glasses.find(q => q.id === 'stair');
    return { ok, t: g.t, linkT: g.linkT, by: g.byHero, targets: F.targetsOf('stair'), cam: F.cam(), px: P.x, py: P.y, gx: g.x, gy: g.y }; })()`);
  console.log(JSON.stringify(r));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
