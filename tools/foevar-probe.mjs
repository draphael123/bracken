// tools/foevar-probe.mjs - cast-pass behaviour probes (claude/foevar-d; not in the suite).
//   node tools/foevar-probe.mjs paladin <waymeet|warcairn>   gleam cadence of each order paladin (hero god, stands 3 tiles off, 30 s)
//   node tools/foevar-probe.mjs kite                         rookery: where the kites go in 25 s with the hero near, and the closest a kite gets to a diving harpy
import { openPage } from './cdp.mjs';
const [mode, id] = process.argv.slice(2);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const out = [];
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const foes = () => typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies;
    const MODE = ${JSON.stringify(mode)}, ID = ${JSON.stringify(id || 'rookery')};
    const li = LEVELS.findIndex(l => l.id === (MODE === 'kite' ? 'rookery' : ID));
    if (MODE === 'paladin') {
      const n = (() => { BK.load(li); BK.state = 'play'; BK.sim(5); return foes().filter(e => e.t === 'orderpaladin').length; })();
      for (let k = 0; k < n; k++) { BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(240);
        const e = foes().filter(x => x.t === 'orderpaladin').sort((a, b) => a.x - b.x)[k]; const row = { k, x: Math.round(e.x / 16), y: Math.round(e.y / 16), shield0: e.shield };
        BK.tp(Math.round(e.x / 16) - 3, Math.round(e.y / 16) - 1); let prev = '', tells = [], t = 0;
        for (let f = 0; f < 60 * 30; f++) { BK.P.hp = BK.P.maxHp; BK.sim(1); t = f / 60; if (e.mode === 'gleamTell' && prev !== 'gleamTell') tells.push(+t.toFixed(1)); prev = e.mode; if (!e.alive) break; }
        row.gleamTells = tells; row.gaps = tells.slice(1).map((v, i) => +(v - tells[i]).toFixed(1)); row.alive = e.alive; row.swings = e.swings; row.opl = e.opl; row.dx = Math.round(e.x / 16) - row.x; out.push(row); }
    } else if (MODE === 'kite') {
      BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(240);
      const kites = foes().filter(e => e.t === 'kite');
      for (const kt of kites) { BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(240);
        const k = foes().filter(e => e.t === 'kite').sort((a, b) => Math.hypot(a.x - kt.x, a.y - kt.y) - Math.hypot(b.x - kt.x, b.y - kt.y))[0]; const x0 = k.x, y0 = k.y;
        BK.tp(Math.round(k.x / 16) - 6, Math.round(k.y / 16) + 3); let minD = 1e9, minX = k.x, maxX = k.x, minY = k.y, maxY = k.y, dives = 0, kd = 0;
        for (let f = 0; f < 60 * 25; f++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (!k.alive) { kd = f / 60; break; } minX = Math.min(minX, k.x); maxX = Math.max(maxX, k.x); minY = Math.min(minY, k.y); maxY = Math.max(maxY, k.y);
          for (const h of foes()) if (h.alive && h.t === 'harpy') { const d = Math.hypot(h.x - k.x, h.y - k.y); if (d < minD) minD = d; if (/dive|swoop|stoop/i.test(h.mode || '')) dives++; } }
        out.push({ at: [Math.round(x0 / 16), Math.round(y0 / 16)], rangeX: Math.round((maxX - minX) / 16), rangeY: Math.round((maxY - minY) / 16), minHarpyDist: Math.round(minD), harpyDiveFrames: dives, diedAtS: kd || null, mode: k.mode }); }
    }
    return out; })()`, 900000);
  for (const w of r) console.log(JSON.stringify(w));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
