// tools/heropassaart-shots.mjs - HERO PASS A ART in the game (claude/heropassaart; not in the suite): on a flat floor, a strip of crops round the hero (3x) for each new move.
//   usage: PORT=8966 node tools/heropassaart-shots.mjs <outdir> [scenario,scenario...]  -> <outdir>/<scenario>.png
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/heropassaart/shots', only = (process.argv[3] || '').split(',').filter(Boolean);
mkdirSync(out, { recursive: true });
const page = async (only, COLS, SCALE) => {
  const setup = (h, foes, o = {}) => { for (const k in BK.keys) BK.keys[k] = false; BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero(h); BK.reset({ fresh: true }); BKT.setHeroLevel(h, o.lv || 1);
    BKT.PROG.skillOwned[h] = {}; BKT.PROG.loadouts[h] = []; BK.applyUpgrades(); BK.load(0); BK.state = 'play'; BK.enemies().forEach(e => e.alive = false); BK.ambushes().forEach(a => a.st = 'done'); BK.SET.hud = 'minimal';
    const L = BK.L; for (let x = 2; x < 60; x++) for (let y = 1; y < L.H; y++) L.grid[y * L.W + x] = y >= 22 ? 1 : (o.wall && x === o.wall && y >= 8) ? 1 : 0; BK.tp(o.wall ? 8 : 10, 21); BK.sim(260); BK.god = !!o.god; const P = BK.P;
    Object.assign(P, { hp: P.maxHp, inv: 0, hurt: 0, st: P.maxSt, face: 1, vx: 0, dodge: 0, dodgeCd: 0, dash: 0, dashCd: 0, riposteT: 0, combo: 0, resolve: 0, vigil: 0 }); BK.sim(1); P.st = P.maxSt;
    return foes.map(([t, dx, fo]) => { BK.spawnEnt({ t, x: (P.x + dx) / 16, y: 21, ...(fo || {}) }); const e = BK.enemies().at(-1); e.hp = e.hp0 = 5000; e.cd = 99; e.elT = 99; e.face = -1; return e; }); };
  const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
  const shots = [], VW = BK.view.VW, VH = BK.view.VH, CW = 110, CH = 64;
  const grab = () => { const P = BK.P, v = BK.view, sx = Math.max(0, Math.min(VW - CW, Math.round(P.x - v.x - CW / 2))), sy = Math.max(0, Math.min(VH - CH, Math.round(P.y - v.y - 48))); const c = document.createElement('canvas'); c.width = CW; c.height = CH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, CW, CH, 0, 0, CW, CH); shots.push(c); };
  const run = (n, every, fn) => { for (let i = 0; i < n; i++) { if (fn) fn(i); BK.step(1); if (i % every === 0) grab(); } };
  const hold = (e, dx) => { e.x = BK.P.x + dx; e.vx = 0; };
  const dodgeRun = (h, dir, n = 22, ev = 2, foes = []) => () => { const fs = setup(h, foes); BK.sim(2); none(); if (dir) K[dir > 0 ? 'right' : 'left'] = true; BK.press('dodge'); run(n, ev); none(); run(8, 4); };
  const SC = {
    kstep: dodgeRun('knight', 1, 26, 2, [['sprig', 70]]),
    kbash: () => { const [f] = setup('knight', [['sprig', 22]]); f.speed = 0; BK.sim(2); none(); K.up = true; K.block = true; BK.sim(2); K.block = false; run(22, 2, () => { f.vx = 0; }); K.up = false; },
    valiant: () => { setup('knight', [['sprig', 22]], { god: true }); BK.P.resolve = 100; BK.sim(3); none(); K.atk = true; run(46, 3); K.atk = false; run(20, 4); },
    whop: dodgeRun('warden', 1, 26),
    wplant: () => { setup('warden', [], { wall: 12, god: true }); const p = BK.P; p.face = 1; K.right = true; BK.press('jump'); K.jump = true; for (let f = 0; f < 14; f++) { BK.step(1); if (f % 3 === 0) grab(); } K.jump = false; K.block = true; BK.step(1); grab(); K.block = false; K.right = false; run(36, 3); BK.press('jump'); run(18, 3); },
    wtip: () => { const [f] = setup('warden', [['sprig', 40]]); f.speed = 0; none(); BK.sim(2); K.right = false; BK.press('atk'); run(20, 2, () => { f.vx = 0; }); },
    eblink: dodgeRun('pyro', 1, 20, 1),
    powder: dodgeRun('pirate', 1, 28, 2, [['sprig', 34]]),
    shadow: dodgeRun('reaper', 1, 24, 2),
    shrug: () => { setup('geomancer', []); BK.press('jump'); K.jump = true; BK.sim(8); none(); BK.press('dodge'); run(26, 2); },
    barge: dodgeRun('berserker', 1, 26, 2, [['sprig', 38]]),
    snatch: () => { setup('ranger', []); BK.P.face = 1; BKT.PROG && 0; BK.sim(2); const P = BK.P; P.rgQ = Math.max(0, (P.rgQ || 0) - 3); run(4, 4); BK.P.rgSnatchFx = { x: P.x + 30, y: P.y - 12, hx: P.x + 14, t: 0.34, max: 0.34, fling: false }; P.kPoseK = 'rgSnatch'; P.kPoseT = 0.22; P.kPoseMax = 0.22; run(22, 2); },
    kdraw: () => { setup('ranger', []); none(); BK.sim(2); K.down = true; BK.sim(14); K.atk = true; run(40, 4); K.atk = false; run(10, 5); },
  };
  const names = Object.keys(SC).filter(k => !only.length || only.includes(k)), res = {};
  for (const nm of names) { shots.length = 0; try { SC[nm](); } catch (e) { res[nm] = 'ERR ' + e.message; continue; } const cols = COLS, rows = Math.ceil(shots.length / cols), c = document.createElement('canvas'); c.width = cols * CW * SCALE; c.height = rows * CH * SCALE; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    shots.forEach((s, i) => g.drawImage(s, (i % cols) * CW * SCALE, Math.floor(i / cols) * CH * SCALE, CW * SCALE, CH * SCALE)); res[nm] = c.toDataURL('image/png'); }
  return res;
};
const pg = await openPage({ audio: false, fonts: true });
try {
  await pg.reload();
  const r = await pg.evalp(`(${page.toString()})(${JSON.stringify(only)}, ${+(process.env.COLS || 5)}, ${+(process.env.SCALE || 2)})`, 600000);
  for (const [k, v] of Object.entries(r)) { if (v.startsWith('ERR')) { console.log(k + ' ' + v); continue; } writeFileSync(join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log(join(out, k + '.png')); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
