// tools/chief-stills150.mjs - stills of the Chieftain's fight as it plays (claude/bosstune150; a capture tool, not a check).
// usage: node tools/chief-stills150.mjs <outdir>   (god-mode knight beside him; a zoomed crop the first time each of his modes shows)
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/chief150'; mkdirSync(out, { recursive: true });
const pg = await openPage();
try {
  const R = await pg.evalp(`(async () => {
    const M = await import('/src/level.js'); const i = M.LEVELS.findIndex(l => l.id === 'stockade'); const R = {}, seen = {};
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.god = true; BK.sim(10); BK.reset();
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round((A.floor !== undefined ? A.floor : A.y1) / 16) - 1);
    for (let k = 0; k < 300 && !BK.bossActive; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
    const crop = (tag, w = 240, h = 130) => { BK.step(1); const v = BK.view, b = BK.enemies().find(e => e.alive && e.t === 'chief') || BK.boss, S = 3, c = document.createElement('canvas'); c.width = w * S; c.height = h * S; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const sx = Math.max(0, Math.round(b.x - v.x) - w / 2), sy = Math.max(0, Math.round(b.y - v.y) - h * 0.7); g.drawImage(v.buf, sx, sy, w, h, 0, 0, w * S, h * S); R[tag] = c.toDataURL('image/png'); };
    let n = 0;
    for (let k = 0; k < 14000 && n < 16; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; const b = BK.enemies().find(e => e.alive && e.t === 'chief') || BK.boss; if (!b) break; R.bt = b.t;
      const d = b.x - BK.P.x; if (Math.abs(d) > 90 && k % 40 === 0) { BK.P.x = b.x - 45 * Math.sign(d || 1); BK.P.y = b.y; BK.P.vy = 0; BK.P.vx = 0; } BK.keys.right = d > 40; BK.keys.left = d < -40; BK.sim(1); BK.step(1);
      const m = b.mode + (b.chain ? '-chain' : ''); seen[m] = (seen[m] || 0) + 1; if (seen[m] === 6 && n < 16) { crop(m); n++; } }
    /* the squad: enemies near him by type */
    R.seen = seen; R.foes = BK.enemies().filter(e => e.alive).map(e => e.t + ':' + (e.mode || '')).slice(0, 20); return R; })()`);
  for (const [k, v] of Object.entries(R)) if (typeof v === 'string' && v.startsWith('data:')) { writeFileSync(join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log('saved', k); }
  console.log('bossType', R.bt, 'modes', JSON.stringify(R.seen), 'foes', JSON.stringify(R.foes));
} finally { pg.close(); }
