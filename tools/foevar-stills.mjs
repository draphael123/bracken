// tools/foevar-stills.mjs - THE CAST PASS STILLS WALK (claude/foevar-d; not in the suite): for each swapped foe of a level (the manifest comes from diffing build() with and without CAST_SWAPS[id])
// stand a god-mode knight 5 tiles off it, let 20 frames run, save a 2x picture and a JSON row (is it on footing, did it wake, where is it after 3 s).
//   usage: PORT=.. node tools/foevar-stills.mjs <level> [outdir] [--only=kind,kind] [--side=-1|1]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
const args = process.argv.slice(2), id = args[0], outd = args[1] && !args[1].startsWith('--') ? args[1] : join(ROOT, '../bracken-scratch/desktop-out/foevar-stills', id);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const mxOnly = opt('mx', ''), hero = opt('hero', ''), settle = +opt('settle', 70), only = opt('only', ''), side = +opt('side', -1), dist = +opt('dist', 4);
mkdirSync(outd, { recursive: true });
const man = JSON.parse(readFileSync(join(ROOT, '../bracken-scratch/foevar-work/manifest.json'), 'utf8'))[id].filter(s => !only || only.split(',').some(k => s.to.startsWith(k))).filter(s => !mxOnly || mxOnly.split(',').includes(String(s.x)));
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [], rows = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const li = LEVELS.findIndex(l => l.id === ${JSON.stringify(id)}); const man = ${JSON.stringify(man)};
    const foes = () => typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies;
    for (const m of man) {
      BK.load(li); BK.state = 'play'; BK.god = true; BK.sim(240);
      const L = BK.L, T = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? 1 : L.grid[y * L.W + x];
      const [kind, skin] = m.to.split('/'), cand = foes().filter(e => e.alive && e.t === kind && (!skin || e.cnSkin === skin));
      let f = cand.sort((a, b) => Math.hypot(a.x - (m.x * 16 + 8), a.y - (m.y * 16 + 16)) - Math.hypot(b.x - (m.x * 16 + 8), b.y - (m.y * 16 + 16)))[0];
      const row = { to: m.to, from: m.from, mx: m.x, my: m.y, found: !!f };
      if (f) { row.x0 = Math.round(f.x), row.y0 = Math.round(f.y); const fx = Math.round(f.x / 16), fy = Math.round(f.y / 16);
        row.under = [T(fx, Math.floor((f.y + 2) / 16)), T(fx, Math.floor((f.y + 2) / 16) + 1)];   /* tile at the feet row and the one below */
        row.body = T(fx, Math.floor((f.y - 8) / 16));
        let hx = fx + ${side} * ${dist}, hy = Math.round(f.y / 16) - 1; let tries = 0; while (tries++ < 12 && (T(hx, hy) !== 0 || T(hx, hy - 1) !== 0)) hx += ${side} * -1;   /* nudge toward the foe until the hero's tile is clear */
        const HERO = ${JSON.stringify(hero)}; if (HERO) { const [a, b] = HERO.split(',').map(Number); hx = fx + a; hy = Math.round(f.y / 16) + b; } BK.tp(hx, hy); for (let k = 0; k < ${settle}; k++) BK.step(1);
        const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height);
        res.push([m.to.replace('/', '-') + '_' + m.x + '_' + m.y, c.toDataURL('image/png')]);
        row.hero = [Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)];
        for (let k = 0; k < 180; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
        row.x3 = Math.round(f.x), row.y3 = Math.round(f.y), row.alive3 = f.alive, row.hp = f.hp, row.st = f.st && f.st.state || f.state || null; }
      rows.push(row); }
    const cols = 2, W = 640, H = 360, rowsN = Math.ceil(res.length / cols), sheet = document.createElement('canvas'); sheet.width = W * cols; sheet.height = H * rowsN; const sg = sheet.getContext('2d'); sg.imageSmoothingEnabled = false;
    for (let i = 0; i < res.length; i++) { const im = new Image(); im.src = res[i][1]; await im.decode(); const x = (i % cols) * W, y = Math.floor(i / cols) * H; sg.drawImage(im, x, y); sg.fillStyle = 'rgba(0,0,0,.65)'; sg.fillRect(x, y, 230, 14); sg.fillStyle = '#fff'; sg.font = '11px monospace'; sg.fillText(i + ' ' + res[i][0], x + 3, y + 11); }
    res.push(['_sheet', sheet.toDataURL('image/png')]);
    return [res, rows]; })()`, 900000);
  const [shots, rows] = r; for (const [name, d] of shots) writeFileSync(join(outd, name + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  writeFileSync(join(outd, 'rows.json'), JSON.stringify(rows, null, 1)); for (const w of rows) console.log(JSON.stringify(w));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
