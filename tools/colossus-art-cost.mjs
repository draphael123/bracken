// tools/colossus-art-cost.mjs - ms per drawn frame in THE GLASS COLOSSUS's arena (claude/colart; the art pass's mobile-perf spot, not in the suite).
//   usage: PORT=8899 node tools/colossus-art-cost.mjs [cpu-throttle=4]    -> ms per BK.step(1) (sim + draw) for the idle, walk, gaze and lunge moments, the CPU throttled like tools/mobile-perf.mjs
import { openPage } from './cdp.mjs';
const CPU = +(process.argv[2] || 4);
const pg = await openPage({ audio: true });
try {
  await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    BK.load(LEVELS.findIndex(l => l.id === 'glasssea')); BK.state = 'play'; BK.god = true; BK.sim(4); BK.tp(612, 33); for (let i = 0; i < 90; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); }
    BK.hideHero = true; BK.look(630, 33); const CO = BK.colossusHands(), S = CO.show(), e = BK.boss; e.mode = 'idle'; S.cd = 99; for (let i = 0; i < 150; i++) { BK.sim(1); if (i % 10 === 0) BK.step(1); }
    const MOVES = { idle: [1, 'idle', 0, null], walk: [1, 'walk', 0, (e, S) => { e.face = 1; S.walk = { st: 2, to: S.G.stations[2], dir: 1, from: S.G.cx, stepT: 0.3, n: 0, id: 1 }; }], gaze: [1, 'gazeTell', 1.15, (e, S) => { e.face = -1; S.mirrors[1].notch = 'face'; S.gaze = { dir: -1, x: S.G.x1 - 6, id: 1, live: false, caught: -1 }; }], lunge: [2, 'lungeTell', 0.95, (e, S) => { e.face = -1; S.lunge = { x: S.mirrors[1].x, mirror: 1, id: 1 }; }] };
    const out = {};
    for (const [name, [ph, mode, dur, pre]] of Object.entries(MOVES)) { S.ph = ph; e.phase = ph; e.mode = mode; if (dur) e.modeT = dur; if (pre) pre(e, S); S.cd = 99;
      const ts = []; for (let i = 0; i < 90; i++) { const t0 = performance.now(); BK.sim(1); S.cd = 99; BK.step(1); ts.push(performance.now() - t0); if (name === 'gaze' && i === 60) e.modeT = 0; }
      ts.sort((a, b) => a - b); out[name] = { med: +ts[45].toFixed(1), p90: +ts[80].toFixed(1), max: +ts[89].toFixed(1) }; }
    return out; })()`, 600000);
  console.log('cpu x' + CPU + ': ' + JSON.stringify(r));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
