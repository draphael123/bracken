/* tools/gq6hitch-probe.mjs - GQ6HITCH: which tile cells really change at a burn step (by pixels), and what a full resolve does to the rest of the level. A measuring tool, not a check. */
import { openPage } from './cdp.mjs';
import { readFileSync } from 'fs';
process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1';
const src = readFileSync(new URL('./gq6hitch.mjs', import.meta.url), 'utf8');
const FN = src.slice(src.indexOf('const FN = `') + 12, src.indexOf('`;\nconst res')).replace("for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) {", "if (window.__stop) { window.__h = { hold, st, q, g, P, timed, out, keyOff }; return 1; }\n  for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) {");
const pg = await openPage({ audio: false, fonts: true, seed: 7 });
try {
  await pg.evalp('window.__stop = 1; (' + FN + ')("knight")', 900000);
  const r = await pg.evalp(`(()=>{ const h = window.__h, q = h.q, st = h.st, T = BK.tileProbe(); const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16; const c = cv.getContext('2d', { willReadFrequently: true });
    const hc = new Map(); const hash = sp => { if (!sp) return 'n'; let v = hc.get(sp); if (v) return v; c.clearRect(0, 0, 16, 16); c.drawImage(sp, 0, 0); const d = c.getImageData(0, 0, 16, 16).data; let a = 5381; for (let i = 0; i < d.length; i++) a = ((a * 33) ^ d[i]) >>> 0; v = sp.width + 'x' + sp.height + ':' + a; hc.set(sp, v); return v; };
    const snap = () => { const o = T.spr.slice(), hs = new Array(o.length); for (let i = 0; i < o.length; i++) hs[i] = hash(o[i]); return { o, hs, deep: T.deep.slice(), decor: JSON.stringify(T.decor), grid: T.grid.slice() }; };
    const out = {}; let prev = snap(); out.nSprIdentity = new Set(prev.o.filter(Boolean)).size;
    // a second full resolve with NO grid change: how many identities change, how many contents
    T.resolve(); let s2 = snap(); out.noop = { id: 0, px: 0, deep: 0, decor: s2.decor === prev.decor }; for (let i = 0; i < prev.o.length; i++) { if (prev.o[i] !== s2.o[i]) out.noop.id++; if (prev.hs[i] !== s2.hs[i]) out.noop.px++; if (prev.deep[i] !== s2.deep[i]) out.noop.deep++; }
    prev = s2; out.steps = [];
    for (const thr of [0.846, 0.696, 0.496]) { q.hp = Math.min(q.hp, q.maxHp * thr); BK.god = true; let w = 0; while (st.phase !== 'tell' && w++ < 2400) { h.hold(); BK.step(1); } BK.god = false;
      const s = snap(); const d = { id: 0, px: 0, deep: 0, grid: 0, decor: s.decor === prev.decor, bx: [1e9, -1e9], by: [1e9, -1e9], gx: [1e9, -1e9], gy: [1e9, -1e9], pxCells: [] };
      for (let i = 0; i < prev.o.length; i++) { const x = i % T.LW, y = (i / T.LW) | 0; if (prev.o[i] !== s.o[i]) d.id++; if (prev.deep[i] !== s.deep[i]) d.deep++;
        if (prev.grid[i] !== s.grid[i]) { d.grid++; d.gx = [Math.min(d.gx[0], x), Math.max(d.gx[1], x)]; d.gy = [Math.min(d.gy[0], y), Math.max(d.gy[1], y)]; }
        if (prev.hs[i] !== s.hs[i]) { d.px++; d.bx = [Math.min(d.bx[0], x), Math.max(d.bx[1], x)]; d.by = [Math.min(d.by[0], y), Math.max(d.by[1], y)]; if (d.pxCells.length < 4000) d.pxCells.push([x, y]); } }
      // distance of each pixel-changed cell to the nearest changed grid cell (Chebyshev)
      const gc = []; for (let i = 0; i < prev.o.length; i++) if (prev.grid[i] !== s.grid[i]) gc.push([i % T.LW, (i / T.LW) | 0]);
      let maxD = 0, far = []; for (const [x, y] of d.pxCells) { let m = 1e9; for (const [a, b] of gc) { const k = Math.max(Math.abs(a - x), Math.abs(b - y)); if (k < m) m = k; } if (m > maxD) maxD = m; if (m > 3 && far.length < 6) far.push([x, y, m]); }
      d.maxDistToGridChange = maxD; d.far = far; d.nPx = d.pxCells.length; delete d.pxCells; out.steps.push(d); prev = s;
      // let the step finish quickly: lift everyone up is not needed - just move on (the next threshold waits for 'on'): force by stepping until phase on via botGoal
      let f = 0; const tier0 = st.tier; while (f++ < 4200) { const rr = h.g.botGoal(h.P), k = BK.keys; k.left = k.right = k.up = k.down = false; if (rr) { const dx = rr.goal - h.P.x; k.left = dx < -3; k.right = dx > 3; k.up = !!rr.up; } h.hold(); BK.step(1); if (st.phase === 'on' && st.tier === tier0 + 1) break; } h.keyOff(); prev = snap(); }
    return out; })()`, 900000);
  console.log(JSON.stringify(r, null, 1));
} finally { pg.close(); }
