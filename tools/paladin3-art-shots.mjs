// tools/paladin3-art-shots.mjs - THE PALADIN 3 art in the game (claude/paladin3art; not in the suite): on a flat Stockade floor with the real keys, a strip of crops round him (3x) for each
// of the new effects: the aura (lit, travelling), SMITE, RADIANCE, SUNFALL, VERDICT (wind, hold + sigils, release), HEAVEN'S ARC, the perfect guard's flash, BULWARK ADVANCE, the hammer throw.
//   usage: PORT=8942 node tools/paladin3-art-shots.mjs <outdir> [scenario,scenario...]  -> <outdir>/<scenario>.png
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/paladin3art/shots', only = (process.argv[3] || '').split(',').filter(Boolean);
mkdirSync(out, { recursive: true });
const page = async (only, COLS, SCALE) => {
  const { LEVELS } = await import('/src/level.js'); const { HG } = await import('/src/holy-ground.js');
  BK.SET.speed = 1; BK.setHero('paladin'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); BK.SET.hud = 'minimal';
  const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x];
  let spot = null;
  for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) {
    let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].every(k => at(x, y - k) === 0);
    if (ok) spot = [x0 + 9, y]; }
  if (!spot) return { err: 'no flat floor' };
  const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
  const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
  const home = () => { clear(); none(); BK.holyHands().clear(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.st = P.maxSt; P.vx = 0; P.hurt = 0; P.face = 1; P.light = 0; P.inv = 0; P.verdict = []; BK.sim(20); };
  const foe = (dx, o = {}) => { const [f] = BK.spawnFoe({ t: o.t || 'sprig', x: spot[0] + dx, y: spot[1] - (o.up || 0), face: -1 }); f.hp = f.maxHp = 9000; f.stagger = 9; f.cd = 99; return f; };
  const hold = (f, dx) => { f.x = (spot[0] + dx) * 16 + 8; f.stagger = 9; };
  const tap = (o = {}) => { none(); if (o.up) K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(2); K.up = false; };
  const shots = [], VW = BK.view.VW, VH = BK.view.VH, CW = 120, CH = 84;
  const grab = () => { const P = BK.P, v = BK.view, sx = Math.max(0, Math.min(VW - CW, Math.round(P.x - v.x - CW / 2))), sy = Math.max(0, Math.min(VH - CH, Math.round(P.y - v.y - 66))); const c = document.createElement('canvas'); c.width = CW; c.height = CH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, CW, CH, 0, 0, CW, CH); shots.push(c); };
  const run = (n, every, fn) => { for (let i = 0; i < n; i++) { if (fn) fn(i); BK.step(1); if (i % every === 0) grab(); } };
  const hudShot = () => { const c = document.createElement('canvas'); c.width = 112; c.height = 44; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 112, 44, 0, 0, 112, 44); shots.push(c); };
  const SC = {
    hud: () => { BK.SET.hud = 'normal'; home(); BK.sim(400); for (const l of [0, 20, 30, 40, 50, 60, 79, 80, 100]) { BK.P.light = l; BK.step(1); BK.step(1); hudShot(); } BK.SET.hud = 'minimal'; },
    aura: () => { home(); BK.P.light = 60; tap(); BK.step(1); run(70, 5, i => { if (i > 20) { K.right = true; } }); none(); },
    smite: () => { home(); foe(2); BK.P.light = 40; tap(); run(24, 2); },
    radiance: () => { home(); foe(2); foe(-3); BK.P.light = 60; tap(); run(34, 3); },
    sunfall: () => { home(); foe(3); BK.P.light = 100; tap(); run(40, 3); },
    verdict: () => { home(); const fs = [foe(3), foe(5), foe(6)]; none(); BK.press('atk'); K.atk = true; run(110, 5, () => fs.forEach((f, i) => hold(f, [3, 5, 6][i]))); K.atk = false; run(30, 3, () => fs.forEach((f, i) => hold(f, [3, 5, 6][i]))); },
    arc: () => { home(); const P = BK.P, f = foe(0, { up: 2 }); f.noGrav = true; f.fly = true; none(); K.jump = true; BK.press('jump'); BK.sim(16); K.jump = false; K.up = true; BK.press('atk'); run(30, 2, () => { f.x = P.x + P.face * 4; f.y = P.y - 26; f.vy = 0; f.stagger = 9; }); K.up = false; },
    guard: () => { home(); const P = BK.P, f = foe(2); hold(f, 2); f.stagger = 0; none(); K.block = true; for (let k = 0; k < 30 && !P.aegis; k++) BK.sim(1); BK.sim(1); BK.holyHurt(P, f.x, 10, {}); run(24, 2); K.block = false; },
    bulwark: () => { home(); const P = BK.P, f = foe(3); delete f.maxHp; f.stagger = 0; none(); K.block = true; BK.sim(30); K.right = true; run(60, 5); K.right = false; K.block = false; },
    throw: () => { home(); const f = foe(7); BK.P.light = 60; tap({ up: true }); run(60, 4, () => hold(f, 7)); },
    swing: () => { home(); foe(1); none(); BK.press('atk'); run(26, 2); },
  };
  const names = Object.keys(SC).filter(k => !only.length || only.includes(k)), res = {};
  home(); BK.sim(700);
  for (const nm of names) { shots.length = 0; SC[nm](); const cols = nm === 'hud' ? 3 : COLS, rows = Math.ceil(shots.length / cols), S = 3, c = document.createElement('canvas'); const cw0 = nm === 'hud' ? 112 : CW, ch0 = nm === 'hud' ? 44 : CH, sc = nm === 'hud' ? 3 : SCALE; c.width = cols * cw0 * sc; c.height = rows * ch0 * sc; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    shots.forEach((s, i) => g.drawImage(s, (i % cols) * cw0 * sc, Math.floor(i / cols) * ch0 * sc, cw0 * sc, ch0 * sc)); res[nm] = c.toDataURL('image/png'); }
  return res;
};
const pg = await openPage({ audio: false, fonts: true });
try {
  await pg.reload();
  const r = await pg.evalp(`(${page.toString()})(${JSON.stringify(only)}, ${+(process.env.COLS || 6)}, ${+(process.env.SCALE || 2)})`, 600000);
  if (r.err) console.log('FAIL ' + r.err); else for (const [k, v] of Object.entries(r)) { writeFileSync(join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log(join(out, k + '.png')); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
