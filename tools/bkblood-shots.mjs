// tools/bkblood-shots.mjs - THE BLOOD KNIGHT'S BLOOD PASS in the real page (claude/bkblood, scratch/brief-bkblood-1023.md), for eyes: THE RALLY (a hit, then the reclaiming
// cut with its stream + '+N', the debt bar and the red edge pulse - the whole screen), THE BLOOD LASH (the third cut against a goblin past the steel's reach) and CRIMSON
// FRENZY (full VITAE, HOLD F, then cutting). Runs on any branch (before: the old drag / BLOOD SURGE).
//   PORT=<port> node tools/bkblood-shots.mjs <outDir> [prefix]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/tmp-bkblood', pre = process.argv[3] || 'bkblood-'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.SET.speed = 1; BK.manualSimulation = true;
    const D = () => BK.dk2(), P = () => BK.P, shots = [];
    BK.setHero('reaper'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.state = 'play'; BK.god = false; BK.sim(5); for (const e of D().enemies) e.alive = false; BK.sim(480);   /* (the level's title cards gone) */
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x]; let spot = null;
    for (let x0 = 8; x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0); if (ok) spot = { x: x0 + 8, y }; }
    if (!spot) return { err: 'no floor' };
    const keysOff = () => { for (const k in BK.keys) BK.keys[k] = false; };
    const place = hp => { const p = P(); p.x = spot.x * 16 + 8; p.y = (spot.y + 1) * 16; p.vx = p.vy = 0; p.face = 1; p.hp = hp ?? p.maxHp; p.st = p.maxSt; p.atk = -1; p.atkRec = 0; p.heavy = false; p.combo = 0; p.dodge = 0; p.hurt = 0; p.inv = 0; p.bd = 0; p.bdLast = p.hp; p.bkEdgeT = 0; p.bkPriceCd = 0; keysOff(); BK.sim(20); p.bd = 0; p.bdLast = p.hp; };
    const snap = (name, w = 150, h = 72, z = 4, dx = 20, full = false) => { const v = BK.view, c = document.createElement('canvas'); if (full) { w = BK.buf.width; h = BK.buf.height; z = 2; } c.width = w * z; c.height = h * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const sx = full ? 0 : Math.round(P().x - v.x - w / 2 + dx), sy = full ? 0 : Math.round(P().y - v.y - h + 16); g.drawImage(BK.buf, sx, sy, w, h, 0, 0, w * z, h * z); shots.push([name, c.toDataURL('image/png')]); };
    const foe = dx => { const n0 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x + 2, y: spot.y }); const e = D().enemies[n0]; e.x = P().x + dx; e.y = P().y; e.hp = e.maxHp = 9999; e.mode = 'idle'; e.cd = 99; e.atkCd = 99; return e; };
    const freeze = e => { e.vx = 0; e.x = e.x0 ?? e.x; e.mode = 'idle'; e.cd = 99; };
    const swing = (snapAt, nm, e) => { BK.keys.atk = true; BK.press('atk'); BK.step(1); BK.keys.atk = false; for (let k = 0; k < 40; k++) { BK.step(1); if (e) { e.x = e.x0; e.vx = 0; } if (snapAt && snapAt.includes(k)) snap(nm + k); if (P().atk < 0 && !(P().atkRec > 0)) break; } BK.sim(3); };
    /* 1. THE RALLY: a hit, the debt; a cut that wins it back - the stream, the '+N', the bar; then the whole screen (the red edge pulse) */
    place(Math.round(P().maxHp * 0.9)); let e = foe(22); e.x0 = e.x; P().face = -1; P().inv = 0; D().hit(P().x - 20, 24, {}); BK.sim(30); P().face = 1; P().x = e.x0 - 22; P().vx = 0; e.x = e.x0; BK.sim(1); BK.step(2); snap('rally-debt', 150, 72, 4, 20);
    { const b0 = P().bkBeats || 0; for (let k = 0; k < 90 && (P().bkBeats || 0) === b0; k++) BK.step(1); BK.step(2); } snap('rally-screen-owing', 0, 0, 2, 0, true);   /* (on a heartbeat: the edge at its pulse) */
    { const c = document.createElement('canvas'); c.width = 80 * 6; c.height = 24 * 6; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 80, 24, 0, 0, 480, 144); shots.push(['rally-hud', c.toDataURL('image/png')]); }
    BK.keys.atk = true; BK.press('atk'); BK.step(1); BK.keys.atk = false; for (let k = 0; k < 30; k++) { BK.step(1); freeze(e); if (k === 18 || k === 22 || k === 26) snap('rally-drink' + k); if (k === 22) snap('rally-screen-drink', 0, 0, 2, 0, true); if (k === 28) snap('rally-decals', 110, 48, 6, 14); }
    e.alive = false; BK.sim(60);
    /* 2. THE THIRD CUT (THE BLOOD LASH; before: the drag) against a goblin past the steel */
    place(); P().combo = 0; e = foe(46); e.x0 = e.x; swing(null, ''); freeze(e); swing(null, ''); freeze(e); swing([14, 17, 20, 23, 26], 'lash', e); e.alive = false; BK.sim(60);
    /* 3. CRIMSON FRENZY (before: BLOOD SURGE): full bar, HOLD F; then cutting a foe while owing */
    place(Math.round(P().maxHp * 0.7)); P().bd = Math.round(P().maxHp * 0.2); P().bdLast = P().hp; e = foe(22); e.x0 = e.x; P().harvest = 100; BK.keys.throw = true; BK.press('throw'); for (let k = 0; k < 30; k++) { BK.step(1); freeze(e); if (k === 22) { snap('frenzy-start'); snap('frenzy-helm', 50, 40, 10, 2); } } BK.keys.throw = false;
    BK.step(10); freeze(e); snap('frenzy-hud', 0, 0, 2, 0, true); P().combo = 0; swing([20], 'frenzy-cut'); freeze(e); swing([20], 'frenzy-cut-b');
    /* 4. THE DRIPPING BLADE: idle, then walking - the point and the drops, close */
    place(); BK.sim(30); for (const k of [0, 1, 2, 3]) { BK.sim(14); snap('idle-drip' + k, 50, 40, 10, 6); }
    return { res: shots, frenzyT: P().bkFrenzyT || 0 }; })()`);
  if (r.err) throw new Error(r.err);
  for (const [n, d] of r.res) writeFileSync(join(out, pre + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots', 'frenzyT', r.frenzyT, 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
