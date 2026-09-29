// tools/orevalue-shots.mjs - THE ORE ROAD value-separation pass (lane claude/orevalue): per section, the luminance (L*) of what you must READ
// (the foes on screen, the footing = the top rows of every walkable tile in view, the hazards = spikes, the pickups = coins/loot) against the
// BACKDROP (the median L* of the open-air pixels behind the play), in one page session, rows 40-330 of a 640x360 capture. Pictures to
// work/orevalue/<tag>/, numbers to stdout. Not in the suite. usage: node tools/orevalue-shots.mjs <tag> [place ...]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'shot', want = process.argv.slice(3);
const out = join(ROOT, 'work/orevalue', tag); mkdirSync(out, { recursive: true });
const SPOTS = [['yard', 6, 36], ['crusher', 26, 34], ['loading-house', 47, 36], ['first-span', 100, 36], ['sorting-yard', 137, 36],
  ['sorting-floor', 150, 28], ['tower-top', 186, 21], ['tipple-house', 229, 27], ['collapsed-span', 286, 32], ['wreck-head', 326, 30],
  ['brakemans-hut', 350, 20], ['winch-house', 412, 12], ['drum-yard', 446, 12], ['drum-house', 478, 12], ['boss-shaft', 500, 12]];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS, T } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'oreroad'), want = ${JSON.stringify(want)}, res = [];
    const Lst = (r, g, b) => { const c = [r, g, b].map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); const Y = c[0] * .2126 + c[1] * .7152 + c[2] * .0722; return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y; };
    const med = a => { if (!a.length) return null; const s = Float64Array.from(a).sort(); return s[s.length >> 1]; }, pct = (a, p) => { if (!a.length) return null; const s = Float64Array.from(a).sort(); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
    for (const [name, x, y] of ${JSON.stringify(SPOTS)}) { if (want.length && !want.includes(name)) continue;
      BK.setHero('knight'); BK.load(i); BK.start(); BK.god = true; BK.sim(240);
      BK.tp(x, y); for (let k = 0; k < 90; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      const D = g.getImageData(0, 0, 640, 360).data, [cx, cy] = BK.cam, L = BK.level, S = 2;
      const Lat = (px, py) => { const o = (py * 640 + px) * 4; return Lst(D[o], D[o + 1], D[o + 2]); };
      const inBand = py => py >= 40 && py < 330;
      const taken = new Uint8Array(640 * 360);
      const region = (x0, y0, x1, y1, keep) => { const v = []; for (let py = Math.max(40, Math.floor(y0)); py < Math.min(330, Math.ceil(y1)); py++) for (let px = Math.max(0, Math.floor(x0)); px < Math.min(640, Math.ceil(x1)); px++) { v.push(Lat(px, py)); if (keep) taken[py * 640 + px] = 1; } return v; };
      /* FOES: each on-screen living foe's box; its silhouette value = the 75th percentile of L* in the box (the body, not the empty corners) */
      const foes = []; for (const e of BK.enemies()) { if (!e.alive) continue; const w = e.w || 16, h = e.h || 16, sx = (e.x - cx) * S, sy = (e.y - cy) * S;
        const x0 = sx - w * S / 2, y0 = sy - h * S, x1 = sx + w * S / 2, y1 = sy; if (x1 < 0 || x0 > 640 || y1 < 40 || y0 > 330) continue;
        const v = region(x0, y0, x1, y1, true); if (v.length > 30) foes.push(pct(v, 0.75)); }
      /* FOOTING: the top 3 source rows of every walkable tile (solid or one-way with open air above) in view */
      const foot = [], haz = [];
      const tx0 = Math.floor(cx / 16), tx1 = Math.ceil((cx + 320) / 16), ty0 = Math.floor(cy / 16), ty1 = Math.ceil((cy + 180) / 16);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) { if (tx < 0 || ty < 1 || tx >= L.W || ty >= L.H) continue; const t = L.grid[ty * L.W + tx], up = L.grid[(ty - 1) * L.W + tx];
        const sx = (tx * 16 - cx) * S, sy = (ty * 16 - cy) * S;
        if ((t === T.SOLID || t === T.ONEWAY || t === T.PLANK) && up === T.AIR) { const v = region(sx, sy, sx + 32, sy + 6, true); if (v.length) foot.push(med(v)); }
        if (t === T.SPIKE) { const v = region(sx, sy, sx + 32, sy + 32, true); if (v.length) haz.push(pct(v, 0.75)); } }
      /* PICKUPS: coins / loot standing free */
      const pick = []; for (const p of (BK.pickups ? BK.pickups() : [])) { const sx = (p.x - cx) * S, sy = (p.y - cy) * S; if (sx < 0 || sx > 640 || sy < 40 || sy > 330) continue; const v = region(sx - 8, sy - 8, sx + 8, sy + 8, false); if (v.length) pick.push(pct(v, 0.75)); }
      /* BACKDROP: open-air pixels (AIR tile cells) not already counted as a foe/footing/hazard */
      const bd = []; for (let py = 40; py < 330; py += 2) for (let px = 0; px < 640; px += 2) { if (taken[py * 640 + px]) continue; const tx = Math.floor((px / S + cx) / 16), ty = Math.floor((py / S + cy) / 16); if (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) continue; if (L.grid[ty * L.W + tx] !== T.AIR) continue; bd.push(Lat(px, py)); }
      res.push([name, c.toDataURL('image/png'), { bd: med(bd), bdHi: pct(bd, .9), foe: med(foes), nFoe: foes.length, foot: med(foot), nFoot: foot.length, haz: med(haz), nHaz: haz.length, pick: med(pick), nPick: pick.length }]); }
    return res;
  })()`, 900000);
  const f = v => v === null || v === undefined ? '  -  ' : v.toFixed(1).padStart(5), d = (a, b) => a === null || b === null ? '  -  ' : (a - b).toFixed(1).padStart(5);
  const tot = { foeD: [], footD: [] };
  console.log('place'.padEnd(15), 'backdrop(p90)', ' foe(n)  dFoe', ' foot(n)  dFoot', ' hazard dHaz', ' pick dPick');
  for (const [name, dd, m] of r) { const n = SPOTS.findIndex(s => s[0] === name); writeFileSync(join(out, String(n).padStart(2, '0') + '-' + name + '.png'), Buffer.from(dd.split(',')[1], 'base64'));
    if (m.foe !== null) tot.foeD.push(m.foe - m.bd); if (m.foot !== null) tot.footD.push(m.foot - m.bd);
    console.log(name.padEnd(15), f(m.bd), '(' + f(m.bdHi) + ')', f(m.foe), '(' + m.nFoe + ')', d(m.foe, m.bd), ' ', f(m.foot), '(' + m.nFoot + ')', d(m.foot, m.bd), ' ', f(m.haz), d(m.haz, m.bd), ' ', f(m.pick), d(m.pick, m.bd)); }
  const mean = a => a.length ? (a.reduce((s, v) => s + v, 0) / a.length).toFixed(1) : '-';
  console.log('MEAN dFoe', mean(tot.foeD), ' dFoot', mean(tot.footD), ' (L* units: subject minus backdrop)');
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
