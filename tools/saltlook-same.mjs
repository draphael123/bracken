/* tools/saltlook-same.mjs - THE BAKED BOAT / LIGHTHOUSE DRAW THE SAME PIXELS AS THE PER-FRAME PASS (claude/saltlook). Not in the suite. Needs a copy of the pre-bake art module saved beside it as _old_ + lw3_art.js in src/redraw (git show of sea6's lw3_art.js); delete it after. */
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const N = await import('/src/redraw/lw3_art.js'), O = await import('/src/redraw/' + '_old_' + 'lw3_art.js'); const out = [];
    const paint = (M, fn) => { const c = document.createElement('canvas'); c.width = 320; c.height = 240; const g = c.getContext('2d'); for (let y = 0; y < 240; y += 8) { g.fillStyle = y % 16 ? '#e8c9a0' : '#7a8fb0'; g.fillRect(0, y, 320, 8); } g.fillStyle = '#335'; for (let x = 0; x < 320; x += 12) g.fillRect(x, 0, 3, 240); fn(M, g); return g.getImageData(0, 0, 320, 240).data; };
    const cases = { boat112: (M, g) => M.drawBoat(g, 60, 150, 112, 0.7, {}), boat48dark: (M, g) => M.drawBoat(g, 60, 150, 48, 0.7, { lit: false }), boat224loose: (M, g) => M.drawBoat(g, 30, 150, 224, 1.9, { loose: true }),
      lightNear: (M, g) => M.drawLighthouse(g, 160, 200, { k: 0.5, ph: 'warn', t: 1 }, 1.3, false), lightFarAlpha: (M, g) => { g.globalAlpha = 0.7; M.drawLighthouse(g, 160, 200, { k: 0.2 }, 2.1, true); g.globalAlpha = 1; } };
    for (const k in cases) { const a = paint(N, cases[k]), b = paint(O, cases[k]); let d = 0, mx = 0; for (let i = 0; i < a.length; i++) { const e = Math.abs(a[i] - b[i]); if (e) { d++; mx = Math.max(mx, e); } } out.push(k + ': ' + d + ' channel diffs, max ' + mx); }
    /* a second draw (the cached path) must equal the first */
    return out; })()`);
  console.log(r.join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { await pg.close(); }
