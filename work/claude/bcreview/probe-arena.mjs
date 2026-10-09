// read-only review probe: THE HOURGLASS KING's lever reach (real keys, god mode) per hero
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const hero of ['knight', 'warden', 'pyro']) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16; const out = {};
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.god = true; BK.sim(5);
      for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      const P = () => BK.P, k = BK.keys; const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      BK.tp(527, 29); for (let i=0;i<30;i++) BK.sim(1);
      const run = (tx, max=600) => { let n=0; while (Math.abs(P().x - (tx*TS+8)) > 5 && n++ < max) { clear(); k[(tx*TS+8) > P().x ? 'right':'left'] = true; BK.sim(1);} clear(); return n/60; };
      out.start = [P().x/TS, P().y/TS];
      out.toEast = run(559); out.after = [P().x/TS, P().y/TS];
      out.toWest = run(528); out.after2 = [P().x/TS, P().y/TS];
      out.boss = BK.boss ? { alive: BK.boss.alive, mode: BK.boss.mode, x: BK.boss.x/TS } : null;
      out.spanW = (36-3)*1; out.arena = true;
      return out; })()`, 120000);
    console.log(hero, JSON.stringify(r));
  }
  if (pg.errors.length) console.log('errors', pg.errors.slice(0,3));
} finally { pg.close(); }
