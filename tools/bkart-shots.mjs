// tools/bkart-shots.mjs - THE BLOOD KNIGHT's crimson art in the real page (claude/bloodknightart), for eyes: each tier's wind + release as the game draws them (with the
// blade glow, the crescent wave sprite, BLOOD MOON's geysers), BLOOD SPIKE, BLOOD PRICE, the hatched BLOOD DEBT bar at three fills (and low health), and the boss at 1.5x.
// -> work/claude/lane-done/bkart-*.png (small).   PORT=<port> node tools/bkart-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.SET.speed = 1; BK.manualSimulation = true;
    const D = () => BK.dk2(), B = () => BK.dk2().blood(), P = () => BK.P, shots = [];
    BK.setHero('reaper'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.state = 'play'; BK.god = false; BK.sim(5); for (const e of D().enemies) e.alive = false;
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x]; let spot = null;
    for (let x0 = 8; x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0); if (ok) spot = { x: x0 + 8, y }; }
    if (!spot) return { err: 'no floor' };
    const keysOff = () => { for (const k in BK.keys) BK.keys[k] = false; };
    const place = hp => { const p = P(); p.x = spot.x * 16 + 8; p.y = (spot.y + 1) * 16; p.vx = p.vy = 0; p.face = 1; p.hp = hp ?? p.maxHp; p.st = p.maxSt; p.atk = -1; p.atkRec = 0; p.heavy = false; p.combo = 0; p.dodge = 0; p.hurt = 0; p.inv = 0; p.bd = 0; p.bdLast = p.hp; p.bkEdgeT = 0; p.bkPriceCd = 0; keysOff(); BK.sim(20); p.bd = 0; p.bdLast = p.hp; };
    const snap = (name, w = 120, h = 64, z = 4, dx = 0, hud = false) => { const v = BK.view, c = document.createElement('canvas'); c.width = w * z; c.height = h * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const sx = hud ? 0 : Math.round(P().x - v.x - w / 2 + dx), sy = hud ? 0 : Math.round(P().y - v.y - h + 14); g.drawImage(BK.buf, sx, sy, w, h, 0, 0, w * z, h * z); shots.push([name, c.toDataURL('image/png')]); };
    const T = B().BLOOD.tiers, quick = B().quick;
    const dummy = dx => { const n0 = D().enemies.length; D().spawn({ t: 'dummy', x: spot.x + dx, y: spot.y }); const e = D().enemies[n0]; e.x = P().x + dx * 16; e.y = P().y; e.hp = e.maxHp = 9999; return e; };
    for (const [i, nm] of ['rend', 'sunder', 'crescent', 'exsanguinate', 'bloodMoon'].entries()) {
      place(P().maxHp - 40); if (i >= 3) { P().bd = Math.min(P().maxHp * B().BLOOD.debt.cap, T.need[i + 1] * P().maxHp + 3); P().bdLast = P().hp; }
      const d2 = dummy(3); BK.keys.atk = true; const N = Math.round((T.at[i] * quick + 0.04) * 60); for (let n = 0; n < N; n++) { BK.sim(1); if (P().heavy) break; }
      BK.step(1); if (i) snap(nm + '-wind'); BK.keys.atk = false; BK.sim(1);
      for (let k = 0; k < 60; k++) { BK.step(1); if (k === 6 || k === 12 || k === 18 || k === 26 || (i === 4 && k >= 20 && k % 3 === 1 && k < 40)) snap(nm + '-rel' + k, 130, 70, 4, 24); }
      d2.alive = false; BK.sim(60); }
    place(); { const p = P(); p.bkTier = 5; }
    /* the debt bar at three fills + a low-health flash, as the HUD draws it */
    for (const [nm, hp, bd] of [['debt-high', 0.8, 0.2], ['debt-mid', 0.5, 0.2], ['debt-low', 0.2, 0.2]]) { place(Math.round(P().maxHp * hp)); P().bd = Math.round(P().maxHp * bd); P().bdLast = P().hp; P().bdHold = 1; BK.step(2); snap(nm, 80, 24, 6, 0, true); }
    return { res: shots }; })()`);
  if (r.err) throw new Error(r.err);
  for (const [n, d] of r.res) writeFileSync(join(out, 'bkart-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots', 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
