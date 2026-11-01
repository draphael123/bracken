import { openPage } from './cdp.mjs';
const ID = process.argv[2] || 'buriedcity', TYPES = (process.argv[3] || '').split(',').filter(Boolean);
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const id = ${JSON.stringify(ID)}; let types = ${JSON.stringify(TYPES)};
    const setup = () => { BK.setHero('pyro'); BK.reset({ fresh: true }); BKT.setHeroLevel('pyro', 40); BK.load(LEVELS.findIndex(l => l.id === id)); BK.start(); BK.god = false; BK.sim(5); };
    setup();
    if (!types.length) { const c = {}; for (const e of BK.enemies()) if (e.alive && !e.harmless && !e.maxHp) c[e.t] = (c[e.t] || 0) + 1; types = Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]); }
    const out = { id, packs: [] };
    for (const t of types) {
      setup(); for (const e of BK.enemies()) e.alive = false;
      const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
      for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 40 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 30 && ok; x++) ok = at(x, y + 1) === 1 && [0,1,2,3,4,5,6].every(k => at(x, y - k) === 0); if (ok) spot = [x0 + 4, y]; }
      if (!spot) { out.packs.push({ t, err: 'no floor' }); continue; }
      BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; Object.assign(BK.P, { hp: BK.P.maxHp, st: BK.P.maxSt, vx: 0, heat: 0, heatGrace: 9, face: 1 });
      const fs = []; for (let i = 0; i < 6; i++) { const [f] = BK.spawnFoe({ t, x: spot[0] + 5 + i, y: spot[1], face: -1 }); if (f) fs.push(f); }
      const fr = () => { for (const f of fs) { f.vx = 0; f.mode = 'idle'; f.modeT = 9; f.cd = 9; } }; fr();
      const hp0 = fs.map(f => f.hp);
      Object.assign(BK.P, { heat: 100, full: true, fullT: 5, heatGrace: 9 }); BK.keys.block = true; BK.sim(1); BK.keys.block = false;
      for (let k = 0; k < 150; k++) { BK.sim(1); fr(); }
      out.packs.push({ t, n: fs.length, hp: hp0[0], dead: fs.filter(f => !f.alive).length, leftPct: fs.map((f, i) => f.alive ? Math.round(100 * f.hp / hp0[i]) : 0) });
      for (const f of fs) f.alive = false;
    }
    return out; })()`, 600000);
  console.log(JSON.stringify(R));
} finally { pg.close(); }
