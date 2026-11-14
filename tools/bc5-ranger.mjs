// PAGE TOOL: launches headless Chrome
/* tools/bc5-ranger.mjs - BC5 PROOF (claude/bc5proof): can THE RANGER trip every Buried City 5 race glass the way a player does, in time?
   Per race glass, in the real page: (A) she looses a quick arrow from 30 px and one from 60 px - does the glass run? (B) a tap of X at 10 px (point-blank rule) - arrow or knife, does it run?
   (C) E at 10 px - does it run? Then bc5-race.mjs (ranger strikes with E) gives the strike-to-end time of R2/R3/R4.
   node tools/bc5-ranger.mjs */
import { openPage } from './cdp.mjs';
const pg = await openPage();
try {
  const rows = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('ranger'); BK.reset({ fresh: true });
    const { LEVELS } = await import('/src/level.js'); const out = [];
    const setup = () => { BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.start(); BK.god = true; BK.reset(); BK.sim(900); for (const e of BK.enemies()) if (!e.boss) e.alive = false; };
    const glasses = () => { setup(); return BK.L.glasses.map(q => ({ id: q.id, x: q.x, y: q.y })); };
    const gl = glasses();
    for (const q of gl) { if (!['race1','span','r3a','r3b','ante','antepad','antefar'].includes(q.id)) continue;
      const tryIt = async (label, dx, act) => { setup(); BK.P.x = q.x * 16 + 8 + dx; BK.P.y = (q.y + 1) * 16; BK.P.vx = BK.P.vy = 0; BK.P.face = dx < 0 ? 1 : -1; BK.sim(30);
        const st = () => { const g = BK.flip().glasses.find(z => z.id === q.id); return g ? g.t : -1; };
        const arrows0 = BK.stats && BK.stats().arrows; act(); let hit = -1; for (let f = 0; f < 150; f++) { BK.sim(1); if (hit < 0 && st() > 0) hit = f; }
        return { id: q.id, how: label, struck: hit >= 0, atFrame: hit, rg: BK.stats().rg ? JSON.stringify(BK.stats().rg).slice(0, 80) : '' }; };
      out.push(await tryIt('arrow tap @30px', -30, () => BK.press('atk')));
      out.push(await tryIt('arrow tap @60px', -60, () => BK.press('atk')));
      out.push(await tryIt('X tap @10px', -10, () => BK.press('atk')));
      out.push(await tryIt('E @10px', -10, () => BK.press('talk')));
      out.push(await tryIt('E @17px', -17, () => BK.press('talk')));
    }
    return out; })()`);
  for (const r of rows) console.log(JSON.stringify(r));
  console.log('page errors:', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
