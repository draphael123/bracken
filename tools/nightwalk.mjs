/* tools/nightwalk.mjs (claude/nightwalk) THE BROWSER PROOF OF ONE FLAG-OFF ROAD AREA, its flag on in the page only (BRACKEN_ROAD, tools/cdp.mjs).
     BRACKEN_ROAD=ww,sk,mn,ac PORT=8731 OUT=<dir> node tools/nightwalk.mjs wispwood|silk|manor|academy
   Per area, in ONE page: (b) stills of the section starts, the arena and the boss mid-fight (hitbox rectangle drawn over it: green = the hitbox, yellow = a hurtbox
   the blow reaches), (c) the ART's drawn size against the hitbox (a frame with the thing, a frame with it moved off screen: the pixels that differ are the art), the Widow's
   lantern reclaim box drawn at WD.reclaim, (d) the dead boss: is it still in enemies() and still drawn, frame by frame after the kill, (e) tile contrast under the dark mask
   (solid cells' luminance against the air cells', away from the hero's light). Writes <OUT>/<area>-*.png and <OUT>/<area>.json. A measuring tool, not a gate. */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const AREA = process.argv[2], OUT = process.env.OUT || 'scratch/lane-reports/nightwalk'; mkdirSync(OUT, { recursive: true });
const CFG = {
  wispwood: { secs: [[0], [48, 25], [120, 23], [180, 27], [265, 26]], boss: 'lanternwidow', foes: ['wwthief'], rows: 'W' },
  silk: { secs: [[0], [60, 28], [140, 23], [210, 23], [282, 20]], boss: 'cryptmother', foes: ['silklurker', 'skling', 'skspitter'] },
  manor: { secs: [[0], [60, 29], [140, 29], [210, 27], [280, 29]], boss: 'castellan', foes: ['mnsuit', 'poltergeist', 'mnshade'] },
  academy: { secs: [[0], [18, 39], [100, 25], [180, 39], [250, 35], [296, 39]], boss: 'headmistress', foes: ['acbooks', 'imp', 'apprentice'] },
}[AREA];
if (!CFG) { console.log('usage: node tools/nightwalk.mjs wispwood|silk|manor|academy'); process.exit(2); }
const pg = await openPage({ fonts: false, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS, T } = await import('/src/level.js'); const CFG = ${JSON.stringify(CFG)}, AREA = ${JSON.stringify(AREA)}; BK.manualSimulation = true;
    const shots = [], num = {}; const TS = 16;
    const idx = LEVELS.findIndex(l => l.id === AREA); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.state = 'play'; BK.god = true; BK.sim(40);
    const VW = BK.view.VW, VH = BK.view.VH; let BW = VW, BH = VH;   /* a boss fight pulls the view back: BK.buf is then wider than VW x VH (629x311 in the Mother's arena), but the world->buf map keeps the camera as its top-left corner (checked against the hero's feet: the cyan dot) */
    const sync = () => { BW = BK.buf.width; BH = BK.buf.height; }, CX = () => BK.cam[0], CY = () => BK.cam[1];
    const canv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
    const full = (name, z = 3, over) => { BK.step(1); sync(); const [c, g] = canv(BW * z, BH * z); g.drawImage(BK.buf, 0, 0, c.width, c.height); if (over) over(g, z, 0, 0); shots.push([name, c.toDataURL('image/png')]); };
    const crop = (name, cx, cy, W, H, z, over) => { BK.step(1); sync(); const x0 = Math.max(0, Math.min(BW - W, Math.round(cx - CX() - W / 2))), y0 = Math.max(0, Math.min(BH - H, Math.round(cy - CY() - H / 2))); const [c, g] = canv(W * z, H * z); g.fillStyle = '#222'; g.fillRect(0, 0, c.width, c.height); g.drawImage(BK.buf, x0, y0, W, H, 0, 0, c.width, c.height); if (over) over(g, z, x0, y0); shots.push([name, c.toDataURL('image/png')]); };
    const frameData = () => { BK.step(1); sync(); const [c, g] = canv(BW, BH); g.drawImage(BK.buf, 0, 0); return g.getImageData(0, 0, BW, BH); };
    const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    const stand = (col, row) => { const P = BK.P; P.x = col * TS + 8; P.y = (row + 1) * TS; P.vx = P.vy = 0; BK.sim(30); P.vx = P.vy = 0; BK.sim(2); };
    /* (e) tile contrast on the frame now on screen: solid cells (a surface: an air cell above) vs air cells, 70+ px from the hero */
    const contrast = () => { const d = frameData().data, L = BK.L, W = L.W, H = L.H, cx0 = Math.floor(CX() / TS), cy0 = Math.floor(CY() / TS), ox = Math.round(cx0 * TS - CX()), oy = Math.round(cy0 * TS - CY());
      const hx = BK.P.x - CX(), hy = BK.P.y - 12 - CY(); const sol = [], air = [], dark = { n: 0, of: 0 };
      for (let j = 0; j <= Math.ceil(BH / TS); j++) for (let i = 0; i <= Math.ceil(BW / TS); i++) { const gx = cx0 + i, gy = cy0 + j; if (gx < 0 || gy < 1 || gx >= W || gy >= H) continue;
        const px = ox + i * TS + 8, py = oy + j * TS + 8; if (px < 4 || py < 4 || px > BW - 4 || py > BH - 4) continue; if (Math.hypot(px - hx, py - hy) < 70) continue;
        const t = L.grid[gy * W + gx], up = L.grid[(gy - 1) * W + gx]; let s = 0, n = 0; for (let yy = oy + j * TS + 3; yy < oy + j * TS + 13; yy += 2) for (let xx = ox + i * TS + 3; xx < ox + i * TS + 13; xx += 2) { if (xx < 0 || yy < 0 || xx >= BW || yy >= BH) continue; s += lum(d, (yy * BW + xx) * 4); n++; } if (!n) continue; const m = s / n;
        if ((t === T.SOLID || t === T.ONEWAY) && up === T.AIR) { sol.push(m); dark.of++; if (m < 14) dark.n++; } else if (t === T.AIR) air.push(m); }
      const avg = a => a.length ? a.reduce((p, q) => p + q, 0) / a.length : 0; const sa = avg(sol), aa = avg(air);
      return { solid: +sa.toFixed(1), air: +aa.toFixed(1), ratio: aa > 0 ? +(sa / aa).toFixed(2) : null, delta: +(sa - aa).toFixed(1), nSolid: sol.length, nAir: air.length, nearBlackSurfaces: dark.n + '/' + dark.of }; };
    /* (c) the art's drawn box: the frame with the entity, and the frame with it moved off screen; the pixels that differ near it are its art (+ its light/shadow) */
    const artBox = (e, pad = 90) => { const a = frameData().data, sx = e.x, sy = e.y; e.x += 4000; const b = frameData().data; e.x = sx; e.y = sy;
      const ex = Math.round(sx - CX()), ey = Math.round(sy - CY()); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0, hx0 = 1e9, hy0 = 1e9, hx1 = -1, hy1 = -1;
      for (let y = Math.max(0, ey - pad); y < Math.min(BH, ey + 30); y++) for (let x = Math.max(0, ex - pad); x < Math.min(BW, ex + pad); x++) { const i = (y * BW + x) * 4; const dd = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
        if (dd > 90) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } if (dd > 200) { if (x < hx0) hx0 = x; if (x > hx1) hx1 = x; if (y < hy0) hy0 = y; if (y > hy1) hy1 = y; } }
      return n ? { w: x1 - x0 + 1, h: y1 - y0 + 1, bright: hx1 >= 0 ? { w: hx1 - hx0 + 1, h: hy1 - hy0 + 1 } : null, n, left: x0 - ex, right: x1 - ex, top: y0 - ey, bottom: y1 - ey } : null; };
    const hit = (g, z, x0, y0, e, col = '#3f3') => { g.fillStyle = '#0ff'; g.fillRect(Math.round(BK.P.x - CX() - x0) * z - 2, Math.round(BK.P.y - CY() - y0) * z - 2, 5, 5); /* cyan dot: the hero's feet (checks the world->screen map) */ g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(Math.round(e.x - e.w / 2 - CX() - x0) * z, Math.round(e.y - e.h - CY() - y0) * z, e.w * z, e.h * z); };
    /* (a)/(b) the scenes */
    num.scenes = {}; BK.cam; const start = [BK.P.x, BK.P.y];
    for (let k = 0; k < CFG.secs.length; k++) { const [col, row] = CFG.secs[k]; if (k === 0) { BK.P.x = start[0]; BK.P.y = start[1]; BK.P.vx = BK.P.vy = 0; BK.sim(40); } else stand(col + 2, row);
      BK.sim(20); full('scene' + k + '-col' + col); num.scenes['s' + k] = { col, tile: contrast() }; }
    /* the foes the area brought, as drawn */
    num.foes = {}; const seen = new Set();
    for (const t of CFG.foes) { const e = BK.enemies().find(q => q.t === t && q.alive); if (!e) { num.foes[t] = 'none in the level'; continue; }
      BK.P.x = e.x - 50; BK.P.y = e.y; BK.P.vx = BK.P.vy = 0; BK.sim(25); BK.P.x = e.x - 50; BK.sim(1); const ee = BK.enemies().find(q => q === e) || e;
      num.foes[t] = { hit: [ee.w, ee.h], art: artBox(ee, 60) }; crop('foe-' + t, ee.x, ee.y - ee.h / 2, 100, 70, 6, (g, z, x0, y0) => hit(g, z, x0, y0, ee)); }
    /* the boss: an aerial one (hung on the ceiling / a rafter) is fought from the nearest platform under it, or the camera never frames her */
    const spot = e => { const L = BK.L, W = L.W; let best = null; for (let cx = Math.floor((e.x - 110) / TS); cx <= Math.floor((e.x + 110) / TS); cx++) for (let gy = Math.floor((e.y + 40) / TS); gy <= Math.floor((e.y + 170) / TS); gy++) { const t = L.grid[gy * W + cx], up = L.grid[(gy - 1) * W + cx]; if ((t === T.ONEWAY || t === T.SOLID) && up === T.AIR) { const d = Math.abs(cx * TS + 8 - e.x) + Math.abs(gy * TS - e.y - 100) * 0.5; if (!best || d < best.d) best = { d, x: cx * TS + 8, y: gy * TS }; } } return best; };
    /* the boss */
    const lv = BK.L, A = lv.arena; num.arena = { x0: A.x0, x1: A.x1, floor: A.floor, trigger: A.trigger };
    BK.P.x = A.trigger + 30; BK.P.y = A.floor; BK.P.vx = BK.P.vy = 0; BK.sim(10); BK.P.x = A.trigger + 30; BK.sim(150);
    full('arena-' + CFG.boss, 3);
    let b = BK.boss; num.boss = { found: !!b, t: b && b.t, active: !!BK.bossActive, hit: b && [b.w, b.h], hp: b && [b.hp, b.maxHp] };
    const WDM = AREA === 'wispwood' ? await import('/src/lantern-widow.js') : null;
    if (b) { const modes = new Set(), log = []; let n = 0;
      for (let f = 0; f < 1500 && BK.boss && BK.boss.alive; f += 12) { const e = BK.boss; BK.P.hp = BK.P.maxHp || 100; BK.sim(12); BK.P.x = Math.max(A.x0 + 40, Math.min(A.x1 - 40, e.x - 70 * (e.x > A.trigger + 400 ? 1 : -1))); if (e.y < A.floor - 150) { const sp = spot(e); if (sp) { BK.P.x = sp.x; BK.P.y = sp.y; BK.P.vx = BK.P.vy = 0; num.boss.aerialSpot = sp; } }
        if (!BK.boss) break; const m = String(BK.boss.mode); log.push(m); if (!modes.has(m) && n < 7) { modes.add(m); n++;
          const e2 = BK.boss; const ab = artBox(e2, 130); (num.boss.art = num.boss.art || {})[m] = ab;
          full('boss-' + String(n).padStart(2, '0') + '-' + m, 3, (g, z, x0, y0) => { hit(g, z, x0, y0, e2);
            if (WDM) { const lp = WDM.lanternAt(e2), r = 14; g.strokeStyle = '#ff0'; g.lineWidth = 2; g.beginPath(); g.arc((lp.x - CX() - x0) * z, (lp.y - CY() - y0) * z, r * z, 0, 7); g.stroke(); } }); } }
      num.boss.modes = [...modes]; num.boss.modeLog = log.slice(0, 80).join(',');
      /* (d) the death */
      const e = BK.boss; if (e) { num.death = { hpBefore: e.hp }; BK.P.x = e.x - 40; BK.P.hp = BK.P.maxHp || 100; let kills = 0; for (let k = 0; k < 400 && e.alive; k++) { BKT.hurtEnemy(e, 1e6, e.x - 10, false); kills++; BK.P.hp = BK.P.maxHp || 100; BK.sim(8); try { if (BK.cardNow && BK.cardNow()) BK.cardClose(); } catch {} } num.death.hitsToKill = kills; num.death.aliveAfterHit = !!e.alive; num.death.hpNow = e.hp;
        const track = []; let shot = 0; const marks = [0.3, 1.5, 3, 4.5, 6]; const tap = () => { try { if (BK.cardNow && BK.cardNow()) BK.cardClose(); } catch {} }; const states = new Set(); tap(); for (let f = 0; f <= 480; f += 6) { tap(); BK.sim(6); states.add(BK.state); tap(); const inList = BK.enemies().includes(e), sec = (f + 6) / 60; const ab = artBox(e, 130);
          track.push([+sec.toFixed(1), inList ? 1 : 0, e.alive ? 1 : 0, ab ? ab.n : 0]); while (shot < marks.length && sec >= marks[shot]) { full('dead-' + marks[shot] + 's', 3, (g, z, x0, y0) => hit(g, z, x0, y0, e, '#f6f')); shot++; } }
        num.death.states = [...states].join(','); num.death.track = track.map(t => t.join(':')).join(' '); num.death.lastDrawnS = (track.filter(t => t[3] > 30).pop() || [0])[0]; num.death.lastInListS = (track.filter(t => t[1]).pop() || [0])[0]; }
    }
    return { shots, num, errs: 0 }; })()`, 900000);
  for (const [n, d] of r.shots) writeFileSync(join(OUT, AREA + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  writeFileSync(join(OUT, AREA + '.json'), JSON.stringify(r.num, null, 1));
  console.log(JSON.stringify(r.num, null, 1)); console.log(r.shots.length + ' stills', 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
