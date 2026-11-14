// PAGE TOOL: launches headless Chrome
// tools/pyrocharge.mjs - THE PYRO'S CHARGING FIREBALL (claude/pyrocharge, Daniel 11-04): the ball GROWS while C is held (radius 3 -> 16 at full charge), a charge meter
// over her head like the knight's, and at 10 s THE LITTLE SUN (huge, crawling, one great blast; a boss takes <= sunCap of his health; no blow-up).
//   node tools/pyrocharge.mjs [outDir]     frame strips -> outDir (default ../scratch/lane-reports) as pyrocharge-*.png, numbers -> stdout (JSON)
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const out = resolve(process.argv[2] || '../scratch/lane-reports'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const save = (name, png) => { const f = join(out, 'pyrocharge-' + name + '.png'); writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log(f); };
try {
  await pg.reload();
  const R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    const out = { bad: [] };
    BK.setHero('pyro'); BK.reset({ fresh: true }); BKT.setHeroLevel('pyro', 10); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(700);
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x]; let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 40 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 34 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6, 7, 8].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 5, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const P = () => BK.P, Kt = () => BK.pyroKit();
    const home = () => { clear(); none(); for (const q of BK.fires()) q.life = 0; BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; Object.assign(P(), { hp: P().maxHp, st: P().maxSt, vx: 0, heat: 0, heatGrace: 0, hurt: 0, face: 1, fwCd: 0, fwRec: 0, full: false, fullT: 0, dodge: 0, dodgeCd: 0 }); BK.sim(30); Object.assign(P(), { heat: 0, heatGrace: 0, st: P().maxSt, full: false }); };
    const foe = (t, dx, hp) => { const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); if (hp) { f.hp = hp; if (f.maxHp) f.maxHp = hp; } f.frozen = 0; return f; };
    const freeze = f => { f.vx = 0; f.mode = 'idle'; f.modeT = 9; f.cd = 9; };
    const sw = BKT.swordDmg(); out.sw = sw;
    const snap = (frames) => { const w = 190, h = 110, c = document.createElement('canvas'); c.width = w * 2 * frames.length; c.height = h * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      frames.forEach((fr, i) => g.drawImage(fr, 0, 0, w, h, i * w * 2, 0, w * 2, h * 2)); return c.toDataURL('image/png'); };
    const grab = () => { BK.step(1); const c = document.createElement('canvas'); c.width = BK.buf.width; c.height = BK.buf.height; c.getContext('2d').drawImage(BK.buf, 0, 0); return c; };
    /* the crop: centre on the hero's screen position (the camera follows her, so she sits near the middle) */
    const crop = (src) => { const c = document.createElement('canvas'); c.width = 190; c.height = 110; const px = Math.round(src.width / 2) - 55, py = Math.round(src.height / 2) - 70; c.getContext("2d").drawImage(src, px, py, 190, 110, 0, 0, 160, 110); return c; };
    out.bufSize = [BK.buf.width, BK.buf.height];
    const strip = (name, marks, after) => { home(); P().face = 1; K.block = true; const frames = [], info = []; let f = 0;
      for (const m of marks) { while (f < m * 100) { BK.sim(1); f++; } frames.push(crop(grab())); const k = Kt(); info.push({ t: m, step: k.fbHold, held: +(P().cHeld || 0).toFixed(2), r: BK.fbRadius ? BK.fbRadius(P().cHeld || 0) : null, x: Math.round(P().x) }); }
      if (after) after(frames, info); out['strip_' + name] = info; return snap(frames); };
    const keep = {};
    keep.charge = strip('charge', [0.3, 0.9, 1.5, 2.0, 2.4]);
    keep.full = strip('full', [2.6, 4, 6, 8, 9.8]);
    // sun: hold past 10 s, then release and watch it crawl and go off on a foe
    home(); P().face = 1; const target = foe('topiary', 12, 99999); target.maxHp = undefined; K.block = true; const fr3 = [], ifo = [];
    for (let f = 0; f < 10.6 * 100; f++) { BK.sim(1); freeze(target); if (f === Math.round(10.1 * 100)) { fr3.push(crop(grab())); } }
    fr3.push(crop(grab())); const held = P().cHeld, stepAt = Kt().fbHold, x0 = P().x; out.sunHold = { held: +held.toFixed(2), step: stepAt };
    K.block = false; const h0 = target.hp; BK.sim(2); out.sunBall = Kt().balls.map(b => ({ fb: b.fb, r: b.r, vx: b.vx, life: +b.life.toFixed(1) }));
    fr3.push(crop(grab())); let boomF = -1;
    for (let f = 0; f < 800; f++) { BK.sim(1); freeze(target); if (f === 120) fr3.push(crop(grab())); if (boomF < 0 && target.hp < h0) { boomF = f; } if (boomF >= 0 && f === boomF + 6) { fr3.push(crop(grab())); } if (boomF >= 0 && f === boomF + 30) { fr3.push(crop(grab())); break; } }
    out.sunHit = { frames: boomF, lost: h0 - target.hp, sunX: null, mult: +((h0 - target.hp) / sw).toFixed(1) };
    keep.sun = snap(fr3);
    /* DAMAGE CURVE: hold t, let go on one fresh foe */
    out.curve = [];
    for (const t of [0.3, 0.9, 1.5, 2.0, 2.5, 4, 8]) { home(); P().face = 1; const f = foe('topiary', 4, 99999); f.maxHp = undefined; freeze(f); const h = f.hp; K.block = true; for (let k = 0; k < t * 100; k++) { BK.sim(1); freeze(f); } const st = Kt().fbHold, rr = Kt().balls.length; K.block = false; for (let k = 0; k < 200 && f.hp === h; k++) { BK.sim(1); freeze(f); } out.curve.push({ hold: t, step: st, took: h - f.hp, xSw: +((h - f.hp) / sw).toFixed(2) }); f.alive = false; }
    /* BOSS CAP: a foe with maxHp (what the caps read) takes at most sunCap of it */
    home(); P().face = 1; { const b = foe('topiary', 9, 5000); b.maxHp = 5000; b.hp = 5000; K.block = true; for (let k = 0; k < 10.5 * 100; k++) { BK.sim(1); freeze(b); } K.block = false; const h = b.hp; for (let k = 0; k < 900 && b.hp === h; k++) { BK.sim(1); freeze(b); } for (let k = 0; k < 30; k++) { BK.sim(1); freeze(b); } out.bossCap = { maxHp: 5000, lost: 5000 - b.hp, pct: +((5000 - b.hp) / 50).toFixed(1) }; b.alive = false; }
    /* CAN THE FIGHTER DODGE IT: a foe that walks away at 90 px/s is never touched (the sun crawls at 38) */
    home(); P().face = 1; { const f = foe('topiary', 7, 99999); f.maxHp = undefined; K.block = true; for (let k = 0; k < 10.5 * 100; k++) { BK.sim(1); freeze(f); } K.block = false; const h = f.hp; for (let k = 0; k < 600; k++) { BK.sim(1); freeze(f); f.x += 90 / 100; } out.walkaway = { lost: h - f.hp }; f.alive = false; }
    /* DPS: the staff chain (hits per second on a dummy) over 8 s */
    home(); P().face = 1; { const f = foe('topiary', 14, 999999); f.maxHp = undefined; const h = f.hp; BK.log = []; for (let n = 0; n < 8 * 100; n++) { if (n % 20 === 0) BK.press('atk'); BK.sim(1); freeze(f); f.x = P().x + 14; } const dealt = (BK.log || []).filter(q => q.k === 'dmgE' && q.e === f).reduce((a, q) => a + q.dmg, 0); BK.log = null; out.staffDps = { dealt, xSwPerSec: +(dealt / 8 / sw).toFixed(2) }; f.alive = false; }
    /* DPS of the sun on a PACK (5 foes within the blast): total over hold + flight */
    home(); P().face = 1; { const fs = [12, 12.5, 13, 13.5, 14].map((d, i) => { const f = foe('topiary', d, 99999); f.maxHp = undefined; return f; }); const h = fs.map(f => f.hp); K.block = true; let n = 0;
      for (; n < 10.5 * 100; n++) { BK.sim(1); fs.forEach(f => freeze(f)); } K.block = false; let t1 = 0; for (; t1 < 900; t1++) { BK.sim(1); fs.forEach(f => freeze(f)); if (fs.some((f, i) => f.hp < h[i])) break; } for (let k = 0; k < 40; k++) { BK.sim(1); fs.forEach(f => freeze(f)); }
      const lost = fs.reduce((a, f, i) => a + h[i] - f.hp, 0); const secs = (n + t1) / 100; out.sunPack = { foes: 5, lost, secs: +secs.toFixed(1), xSwPerSec: +(lost / sw / secs).toFixed(2) }; fs.forEach(f => f.alive = false); }
    /* the sun on ONE foe */
    out.sunSingle = { lost: out.sunHit.lost, secs: +((10.6 * 100 + boomF) / 100).toFixed(1), xSwPerSec: +(out.sunHit.lost / sw / ((10.6 * 100 + boomF) / 100)).toFixed(2) };
    /* a hit during the hold drops it; a dodge drops it */
    home(); P().face = 1; K.block = true; BK.sim(300); const before = Kt().fbHold; BK.press('dodge'); BK.sim(3); out.dodgeDrops = { before, after: Kt().fbHold, balls: Kt().balls.length }; K.block = false; BK.sim(3);
    /* the walk speed with the ball */
    const walk = (hold) => { home(); P().face = 1; K.block = true; BK.sim(Math.round(hold * 100)); const x1 = P().x; K.right = true; BK.sim(30); const d = P().x - x1; K.right = false; K.block = false; BK.sim(2); return Math.round(d / 0.3); };
    out.walkPxPerSec = { tap1s: walk(1.0), full3s: walk(3), sun10_5: walk(10.5) };
    out.keep = keep; return out; })()`);
  if (R.err) { console.log('ERR', R.err); process.exitCode = 1; }
  else { for (const [k, v] of Object.entries(R.keep)) save(k, v); delete R.keep; console.log(JSON.stringify(R, null, 1)); }
} finally { pg.close(); }
