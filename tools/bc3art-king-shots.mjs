// tools/bc3art-king-shots.mjs - THE HOURGLASS KING's new art in the real page (claude/bc3art), for eyes: each move's tell + release, phase two's tide/blocks, phase three's great hourglass flip. -> work/claude/shots/bc3art/king-*.png + king-sheet.png.
// Not in the suite. PORT from the environment. ONE page, one level load (the throne room only).
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/bc3art'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'buriedcity'); const res = [];
    BK.load(i); BK.start(); BK.god = true; try { BK.SET.hud = 'minimal'; } catch (e) {} BK.sim(300); BK.tp(756, 31); BK.sim(200);
    const H = BK.buriedCityHands ? null : null, KH = BK.hourglassKingHands(); const S = () => KH.show(), E = () => BK.boss;
    const shot = (name, mode, t, fn, sims = 6) => { const e = E(); if (!e) return; e.mode = mode; e.modeT = t; if (fn) fn(e, S()); BK.sim(sims); BK.step(1); const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png')]); };
    BK.sim(150); const e0 = E(); if (!e0) return { err: 'no boss', res: [] };
    const x0 = S().G.x0, G = S().G; const P = BK.P; P.hp = P.maxHp || 100;
    const place = (e) => { e.x = G.x0 + 22 * 16; e.face = 1; P.x = e.x + 70; P.y = G.floorY; };
    const keep = () => { P.hp = P.maxHp; E().hp = E().maxHp; };
    shot('surge-tell', 'surgeTell', 0.9, e => { place(e); }, 3); shot('surge-slam', 'recover', 0.5, (e, s) => { place(e); s.lastMove = 'surge'; s.waves.push({ x: e.x + 30, dir: 1, key: 'zz', k: 'surge', h: 26, v: 0, w: 12, dmg: 0 }); }, 1);
    shot('grasp-tell', 'graspTell', 0.9, (e, s) => { place(e); s.mark = { x: P.x, k: 'grasp' }; }, 3); shot('grasp-release', 'recover', 0.5, (e, s) => { place(e); s.lastMove = 'grasp'; s.grasp = { x: P.x, t: 0.2, key: 'zz' }; }, 1);
    shot('rain-tell', 'rainTell', 1.0, (e, s) => { place(e); s.rain = { xs: [P.x, P.x - 60, P.x + 60], t: 0, fall: false, key: 'zz' }; }, 3); shot('rain-release', 'recover', 0.5, (e, s) => { place(e); s.lastMove = 'rain'; s.rain = { xs: [P.x, P.x - 60, P.x + 60], t: 0.1, fall: true, key: 'zz' }; }, 1);
    shot('slip-tell', 'slipTell', 0.9, (e, s) => { place(e); s.echo = { x: e.x - 60 }; }, 3); shot('slip-strike', 'slipStrike', 0.12, (e, s) => { place(e); s.echo = null; }, 1);
    shot('hour-tell', 'hourTell', 0.95, e => { place(e); }, 3); shot('hour-release', 'recover', 0.5, (e, s) => { place(e); s.lastMove = 'hour'; s.waves.push({ x: e.x + 40, dir: 1, key: 'h1' }, { x: e.x - 40, dir: -1, key: 'h2' }); }, 1);
    shot('held', 'walk', 5, (e, s) => { place(e); P.hkHold = 1; P.hkHoldX = P.x; }, 1); P.hkHold = 0;
    shot('tide-warn', 'walk', 5, (e, s) => { place(e); s.ph = 2; s.tide.on = false; s.tide.warned = true; s.tide.t = 0.5; }, 2);
    shot('tide-on', 'walk', 5, (e, s) => { place(e); s.ph = 2; s.tide.on = true; s.tide.t = 2; s.drift = true; }, 2);
    shot('p3-great-ready', 'walk', 5, (e, s) => { place(e); s.ph = 3; s.tide.on = false; s.tide.warned = false; s.tide.t = 5; s.great.cd = 0; s.ward = 0; P.x = G.great - 50; }, 2);
    shot('p3-great-turn', 'stall', 5, (e, s) => { s.ph = 3; s.great.run = 4.6; s.great.cd = 9; e.open = 4; e.x = G.great + 22; e.face = -1; }, 1);
    shot('p3-great-pour', 'stall', 5, (e, s) => { s.ph = 3; s.great.run = 3; s.great.cd = 9; e.open = 3; e.x = G.great + 22; e.face = -1; }, 1);
    shot('p3-pours', 'walk', 5, (e, s) => { place(e); s.ph = 3; s.great.run = 0; s.great.cd = 5; }, 2);
    return { res }; })()`, 600000);
  if (r.err) { console.log(r.err); }
  const names = []; for (const [n, d] of r.res) { writeFileSync(join(out, 'king-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); names.push(n); }
  const d = await pg.evalp(`(async () => { const items = ${JSON.stringify(r.res)}; const cols = 3, cw = 640, ch = 360, rows = Math.ceil(items.length / cols); const c = document.createElement('canvas'); c.width = cw * cols; c.height = ch * rows; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let k = 0; k < items.length; k++) { const im = new Image(); im.src = items[k][1]; await im.decode(); const x = (k % cols) * cw, y = Math.floor(k / cols) * ch; g.drawImage(im, x, y); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y + ch - 14, 130, 14); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(items[k][0], x + 4, y + ch - 4); } return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'king-sheet.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(names.join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
