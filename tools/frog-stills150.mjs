// PAGE TOOL: launches headless Chrome
// tools/frog-stills150.mjs - stills of the Bullfrog King's moves as he really plays them (claude/bosstune150; a capture tool, not a check).
// God-mode hero stands by him; every sim frame we watch his mode and grab a zoomed crop around him the first time each wanted mode shows (and a few frames in).
// usage: node tools/frog-stills150.mjs <outdir> [hero]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/frog150', hero = process.argv[3] || 'knight'; mkdirSync(out, { recursive: true });
const pg = await openPage();
try {
  const R = await pg.evalp(`(async () => {
    const M = await import('/src/level.js'); const i = M.LEVELS.findIndex(l => l.id === 'marsh'); const R = {}, seen = {};
    BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.god = true; BK.sim(10); BK.reset();
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round((A.floor !== undefined ? A.floor : A.y1) / 16) - 1);
    for (let k = 0; k < 300 && !BK.bossActive; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
    const crop = () => { BK.step(1); const v = BK.view, b = BK.boss, S = 4, w = 200, h = 110, c = document.createElement('canvas'); c.width = w * S; c.height = h * S; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const sx = Math.max(0, Math.round(b.x - v.x) - w / 2), sy = Math.max(0, Math.round(b.y - v.y) - h * 0.7); g.drawImage(v.buf, sx, sy, w, h, 0, 0, w * S, h * S); return c.toDataURL('image/png'); };
    const want = { bellowTell: 3, bellyUp: 3, bellow: 3, tongueTell: 2, tongue: 4, snap: 2, spitTell: 1, flopRest: 1, swarm: 2 };
    const keep = () => { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; };
    let sacDone = false;
    for (let k = 0; k < 6000; k++) { keep(); const b = BK.boss; if (!b) break;
      const d = b.x - BK.P.x; BK.keys.right = d > 40; BK.keys.left = d < -40;
      BK.sim(1); BK.step(1);
      const m = b.mode; seen[m] = (seen[m] || 0) + 1;
      if (want[m] && seen[m] === 1 + Math.floor((want[m] - 1) * 0) ) { R[m + '-1'] = crop(); }
      if (m === 'bellowTell' && [10,40,70].includes(seen[m])) R['bellowTell-s' + seen[m]] = crop();
      if (m === 'tongue' && seen[m] === 12) R['tongue-12'] = crop();
      if (m === 'bellowTell' && seen[m] === 55) { b.sacHits = 2; R['bellowTell-2cracks'] = crop(); b.sacHits = 0; } if (m === 'bellyUp' && seen[m] === 30) R['bellyUp-30'] = crop();
      if (m === 'bellow' && seen[m] === 14) R['bellow-14'] = crop();
      if (Object.keys(R).length >= 12) break; }
    R.seen = seen; return R; })()`);
  for (const [k, v] of Object.entries(R)) if (typeof v === 'string' && v.startsWith('data:')) { writeFileSync(join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log('saved', k); }
  console.log('modes seen', JSON.stringify(R.seen));
} finally { pg.close(); }
