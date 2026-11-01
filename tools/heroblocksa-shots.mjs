// tools/heroblocksa-shots.mjs - THE HOOK CATCH + THE BLOOD KNIGHT'S BLOCK in the real page, for eyes (claude/heroblocksa). Each event is a CONTACT STRIP of frames (left to right, 3 frames apart
// unless said): the perfect Hook Catch on a blow (snag), the arrow FLUNG BACK, the late catch + the heavy breaking through; the Blood Knight's held ward taking three blows (debt flash, notches, glow),
// the drunk blade's heavy, and the CRIMSON PARRY.
//   PORT=<port> node tools/heroblocksa-shots.mjs <outDir> [prefix]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/heroblocksa-shots', pre = process.argv[3] || 'hb-'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.SET.speed = 1; BK.manualSimulation = true;
    const D = () => BK.dk2(), P = () => BK.P, shots = [];
    const boot = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.state = 'play'; BK.god = false; BK.sim(5); for (const e of D().enemies) e.alive = false; BK.sim(480); };
    const findSpot = () => { const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x]; let spot = null;
      for (let x0 = 8; x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0); if (ok) spot = { x: x0 + 8, y }; } return spot; };
    let spot; const keysOff = () => { for (const k in BK.keys) BK.keys[k] = false; };
    const place = hp => { const p = P(); p.x = spot.x * 16 + 8; p.y = (spot.y + 1) * 16; p.vx = p.vy = 0; p.face = 1; p.hp = hp ?? p.maxHp; p.st = p.maxSt; p.atk = -1; p.atkRec = 0; p.heavy = false; p.combo = 0; p.dodge = 0; p.hurt = 0; p.inv = 0; p.parryW = 0; p.parryCd = 0; p.hookCd = 0; p.hookT = null; p.catchShotT = 0; p.catchHit = false; p.cHeld = 0; p.cWas = false; p.bd = 0; p.bdLast = p.hp; p.bkNotch = 0; p.wardG = 0; p.novaCd = 0; keysOff(); BK.sim(20); p.bd = 0; p.bdLast = p.hp; p.parryW = 0; p.parryCd = 0; };
    const foe = (dx, t) => { const n0 = D().enemies.length; D().spawn({ t: t || 'brute', x: spot.x + 2, y: spot.y }); const e = D().enemies[n0]; delete e.maxHp; e.x = P().x + dx; e.y = P().y; e.hp = 9999; e.mode = 'idle'; e.cd = 99; e.atkCd = 99; e.x0 = e.x; return e; };
    const hold = e => { if (e && e.alive) { e.cd = 99; e.atkCd = 99; } };
    const grab = (w, h, z) => { const v = BK.view, c = document.createElement('canvas'); c.width = w * z; c.height = h * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(BK.buf, Math.round(P().x - v.x - w / 2 + 14), Math.round(P().y - v.y - h + 22), w, h, 0, 0, w * z, h * z); return c; };
    const strip = (name, frames, w = 96, h = 64, z = 3) => { const c = document.createElement('canvas'); c.width = frames.length * w * z; c.height = h * z; const g = c.getContext('2d'); frames.forEach((f, i) => g.drawImage(f, i * w * z, 0)); shots.push([name, c.toDataURL('image/png')]); };
    const run = (n, every, each, e) => { const fr = []; for (let k = 0; k < n; k++) { each && each(k); hold(e); BK.step(1); if (k % every === 0) fr.push(grab(96, 64, 3)); } return fr; };
    /* ---- FREEBOOTER ---- */
    boot('pirate'); spot = findSpot(); if (!spot) return { err: 'no floor' };
    place(); let e = foe(22); P().loaded = false;
    { let fr = []; BK.keys.block = true; fr = fr.concat(run(2, 1, null, e)); BK.keys.block = false; fr = fr.concat(run(4, 2, k => { if (k === 3) { P().inv = 0; P().hurt = 0; D().hit(P().x + 20, 12, { who: e }); } }, e)); fr = fr.concat(run(24, 4, null, e)); strip('catch-perfect-snag', fr.slice(0, 8)); }
    e.alive = false;
    place(); e = foe(120, 'archer');
    { const sd = { x: P().x + 60, y: P().y - 8, vx: -120, vy: 0, g: 0, life: 3, dead: false, arrow: true, owner: e }; BK.seeds().push(sd); let fr = []; fr = fr.concat(run(8, 4, null, e)); BK.keys.block = true; fr = fr.concat(run(2, 1, null, e)); BK.keys.block = false; fr = fr.concat(run(28, 3, null, e)); strip('catch-arrow-flung-back', fr.slice(0, 9)); sd.dead = true; }
    e.alive = false;
    place(); e = foe(22);
    { let fr = []; BK.keys.block = true; fr = fr.concat(run(2, 1, null, e)); BK.keys.block = false; fr = fr.concat(run(12, 6, null, e)); fr = fr.concat(run(8, 2, k => { if (k === 0) { P().inv = 0; P().hurt = 0; D().hit(P().x + 20, 34, { who: e }); } }, e)); strip('catch-late-heavy-breaks-through', fr.slice(0, 8)); }
    e.alive = false;
    /* ---- BLOOD KNIGHT ---- */
    boot('reaper'); spot = findSpot();
    place(); e = foe(22); P().face = 1;
    { let fr = []; BK.keys.block = true; fr = fr.concat(run(14, 7, null, e)); for (let b = 0; b < 3; b++) { fr = fr.concat(run(8, 4, k => { if (k === 0) { P().inv = 0; P().hurt = 0; D().hit(P().x + 20, 16, { who: e }); } }, e)); } strip('bk-ward-three-blows', fr.slice(0, 8), 96, 64, 3);
      const f2 = []; f2.push(grab(96, 64, 3)); strip('bk-ward-notched-full', [grab(96, 64, 3), grab(96, 64, 3)]); }
    BK.keys.block = false; BK.sim(10); e.alive = false;
    place(70); e = foe(22); P().bd = 12; P().bdLast = P().hp;
    { let fr = []; BK.keys.block = true; fr = fr.concat(run(12, 6, null, e)); BK.keys.block = false; fr = fr.concat(run(2, 1, null, e)); fr = fr.concat(run(36, 3, k => { if (k === 0) { P().inv = 0; P().hurt = 0; D().hit(P().x + 20, 12, { who: e }); } }, e)); strip('bk-crimson-parry', fr.slice(0, 10), 96, 64, 3); }
    return { shots: shots.length, data: shots }; })()`, 240000);
  if (r.err) throw new Error(r.err);
  for (const [name, url] of r.data) { writeFileSync(join(out, pre + name + '.png'), Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', join(out, pre + name + '.png')); }
} finally { try { pg.close(); } catch {} }
