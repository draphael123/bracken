// PAGE TOOL: launches headless Chrome
// tools/hornetsnest2art-shots.mjs - THE HORNET'S NEST 2 ART LANE's close-ups (claude/hornetsnest2art): the SAGGING COMB (whole / counting / hot / gone / back), the RESIN DRIP (nub, bead steps, fall),
// the empty SMOKE STAND, the pot's BURST, the GROUNDED Queen. OUT=<dir> sends the shots elsewhere; ONLY=a,b limits them.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUT || join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = []; const ONLY = ${JSON.stringify(ONLY)}; const want = n => !ONLY || ONLY.includes(n);
    const load = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(120); };
    /* a close-up: the middle of the screen, w x h, scaled z */
    const snap = (name, z = 5, w = 128, h = 72, dx = 0, dy = 0) => { if (!want(name)) return; BK.step(1); const b = BK.buf, c = document.createElement('canvas'); c.width = w * z; c.height = h * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, Math.round((b.width - w) / 2) + dx, Math.round((b.height - h) / 2) + dy, w, h, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const hold = (x, y, n = 40) => { for (let k = 0; k < n; k++) { BK.P.x = x; BK.P.y = y; BK.P.vx = BK.P.vy = 0; BK.sim(1); } };
    const at = (col, row, face = 1) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = face; BK.sim(30); };
    const cr = () => BK.L.crumbles.find(c => c.x0 === 178), info = () => { const c = cr(); return c ? c.st + ' t=' + (c.t || 0).toFixed(2) + ' downT=' + (c.downT || 0).toFixed(1) : 'none'; };
    const log = [];
    /* NOTE (claude/hornetsnest2art): main.js never runs updateCrumbles / crumbleInit for the nest (see the lane report), so the states are FORCED here to draw the art */
    if (['sag-whole', 'sag-count1', 'sag-count2', 'sag-hot', 'sag-gone', 'sag-back'].some(want)) { load();
      const cs = BK.L.crumbles.filter(c => c.x0 > 169 && c.x0 < 219); for (const c of cs) Object.assign(c, { rows: 1, st: 'whole', t: 0, downT: 0, gone: false });
      const pose = (st, t, dT) => { for (const c of cs) Object.assign(c, { st, t, downT: dT || 0 }); hold(176 * 16, 30 * 16, 30); };
      pose('whole', 0); snap('sag-whole', 3, 320, 180, 0, 0); pose('count', 1.4); snap('sag-count1', 3, 320, 180, 0, 0); pose('count', 0.9); snap('sag-count2', 3, 320, 180, 0, 0); pose('count', 0.45); snap('sag-hot', 3, 320, 180, 0, 0);
      pose('down', 0, 0.6); snap('sag-gone', 3, 320, 180, 0, 0); pose('down', 0, 3.4); snap('sag-back', 3, 320, 180, 0, 0); }
    if (['drip-wait', 'drip-s1', 'drip-s2', 'drip-s3', 'drip-s4', 'drip-fall'].some(want)) { load(); BK.tp(185, 28); BK.P.face = 1; BK.sim(300); const D = BK.nestHands().drips(), d = D.find(q => q.x === 185); for (const q of D) q.t = 0;
      const go = (name, st, s) => { d.st = st; d.s = s; hold(185 * 16 - 26, d.y0 * 16 + 44, 25); snap(name, 8, 80, 45, 26, -8); };
      go('drip-wait', 'wait', 0); go('drip-s1', 'swell', 0.12); go('drip-s2', 'swell', 0.3); go('drip-s3', 'swell', 0.5); go('drip-s4', 'swell', 0.69); d.st = 'fall'; d.y = d.y0 * 16 + 4 + 30; d.vy = 120; hold(185 * 16 - 26, d.y0 * 16 + 44, 1); snap('drip-fall', 8, 80, 45, 26, -8); log.push('drip y0 ' + d.y0); }
    return { res: shots, log }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'hornetsnest2art-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(JSON.stringify(r.log)); console.log(r.res.length + ' shots: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
