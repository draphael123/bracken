/* tools/bc5-smoke.mjs - BC5 PROOF (claude/bc5proof): BURIED CITY 5 with the SHIPPED default (no ?bc5, no env, window.BRACKEN_BC5 untouched): a new game's Buried City loads with the race kit,
   runs 900 frames with a clean console, and each of its shrines lights when touched and is where a death puts the hero back.   node tools/bc5-smoke.mjs */
import { openPage } from './cdp.mjs';
const pg = await openPage();
try {
  const r = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'buriedcity'); BK.load(i); BK.state = 'play'; BK.start(); BK.god = false; BK.reset(); BK.sim(900);
    const out = { flagGlobal: String(window.BRACKEN_BC5), url: location.search, idx: i, id: LEVELS[i].id, W: BK.L.W, bc5: !!BK.L.bc5, glasses: BK.L.glasses.map(g => g.id).join(','), doors: (BK.L.doors || []).length, mini: BK.L.mini ? [BK.L.mini.x0, BK.L.mini.x1].join('-') : null, state: BK.state, cps: [] };
    const SH = BK.shrines().slice().sort((a, b) => a.x - b.x); out.n = SH.length;
    for (const s of SH) { BK.state === 'play' || (BK.state = 'play'); BK.god = true; BK.P.x = s.x; BK.P.y = s.y; BK.P.vx = BK.P.vy = 0; BK.sim(20); const cp = BK.checkpointAt(), lit = !!s.lit;
      BK.god = false; BK.P.hp = Math.min(BK.P.hp, BK.P.maxHp); BK.tp(Math.round(s.x / 16) + 12 > 880 ? 20 : Math.round(s.x / 16) + 12, 32); BK.sim(5);
      BK.damagePlayer(BK.P.x - 8, 99999, {}); for (let k = 0; k < 120; k++) { if (BK.state !== 'play') BK.press('confirm'); BK.sim(2); }
      out.cps.push({ col: Math.round(s.x / 16), lit, cpCol: Math.round(cp.x / 16), backAt: Math.round(BK.P.x / 16), state: BK.state, ok: lit && Math.abs(BK.P.x - cp.x) < 40 }); }
    return out; })()`, 300000);
  console.log(JSON.stringify({ ...r, cps: undefined })); for (const c of r.cps) console.log(JSON.stringify(c));
  console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
