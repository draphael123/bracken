// tools/hornetsnest2-shots.mjs - THE HORNET'S NEST 2 for eyes (claude/hornetsnest2): ONE ARENA (the hall in P1, the hall torn in P2: honey, the torn combs, THE LAST COMB, a pin),
// THE FALLING NEST after her death, THE MARSH EDGE, the old pines at the start, THE FAT HONEY HORNET's poses in play.
// PORT=<port> node tools/hornetsnest2-shots.mjs  ->  work/claude/lane-done/hornetsnest2-*.png   (ONLY=a,b limits the named shots)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const SPOTS = [['stinger', 96, 33], ['foot', 4, 65], ['hall', 310, 21], ['edge-roots', 360, 65], ['edge-water', 372, 65], ['edge-gate', 405, 65]];
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = []; const ONLY = ${JSON.stringify(ONLY)};
    const want = n => !ONLY || ONLY.includes(n);
    const load = () => { BK.setHero(${JSON.stringify(process.env.HERO || 'knight')}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(120); };
    const snap = (name, z = 2) => { if (!want(name)) return; BK.step(1); const c = document.createElement('canvas'), b = BK.buf; c.width = b.width * z; c.height = b.height * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const at = (col, row, face = 1) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = face; BK.sim(50); };
    for (const [n, c, r] of ${JSON.stringify(SPOTS)}) { if (!want(n)) continue; load(); at(c, r); snap(n); }
    /* THE FAT HONEY HORNET in play: the cells chamber's (col 104) */
    if (!ONLY || ONLY.some(n => /^hh-/.test(n))) {
      const hh = () => BK.enemies().find(e => e.alive && e.t === 'honeyhornet');
      for (const [m, t] of [['patrol', 0], ['dripTell', 0.4], ['drop', 0.1], ['ramTell', 0.5], ['ram', 0.2], ['reel', 0.6], ['drowsy', 1.5]]) { if (!want('hh-' + m)) continue;
        load(); at(100, 33); BK.enemies().forEach(e => { if (e.alive && e.t !== 'honeyhornet') e.alive = false; }); const e = hh(); if (!e) continue;
        e.x = BK.P.x + (m === 'dripTell' || m === 'drop' ? 4 : 60); e.y = m === 'drowsy' ? BK.P.y : m === 'dripTell' || m === 'drop' ? BK.P.y - 60 : BK.P.y - 14; e.face = -1; e.mode = m; e.modeT = 9; e.cd = 9; e.drowsyT = 9;
        if (m === 'drop') e.globs = [{ x: e.x, y: e.y + 20, vy: 100 }]; BK.step(2); snap('hh-' + m, 4); }
      if (want('hh-dead')) { load(); at(100, 33); BK.enemies().forEach(e => { if (e.alive && e.t !== 'honeyhornet') e.alive = false; }); const e = hh(); if (e) { e.x = BK.P.x + 40; e.y = BK.P.y - 10; BK.P.face = 1; for (let k = 0; k < 60 && e.alive; k++) { e.hp = 1; BK.press('atk'); BK.sim(12); e.x = BK.P.x + 20; e.y = BK.P.y - 6; } BK.sim(60); snap('hh-dead', 4); } }
      if (want('hh-patch')) { load(); at(150, 31); BK.enemies().forEach(e => { if (e.alive && e.t !== 'honeyhornet') e.alive = false; }); const N = BK.nestHands(); N.addHoney(BK.P.x - 14, BK.P.x + 14, 32, 6); BK.sim(20); snap('hh-patch', 4); }
    }
    /* HER HALL: P1, the tear, P2 (honey, the torn combs, the last comb), a pin, her death and THE FALLING NEST */
    if (!ONLY || ONLY.some(n => /^q2-/.test(n))) {
      load(); BK.tp(301, 21); BK.sim(90); const E = () => BK.boss; snap('q2-p1');
      const e = E(); if (e) { const QH0 = BK.hornetQueenHands(); e.hp = Math.ceil(e.maxHp * 0.55); e.mode = 'hover'; e.modeT = 0.2; for (let k = 0; k < 400 && e.mode !== 'tearTell'; k++) BK.sim(1); BK.sim(60); snap('q2-tearTell'); for (let k = 0; k < 400 && e.mode !== 'tear'; k++) BK.sim(1); BK.sim(20); snap('q2-tear'); for (let k = 0; k < 600 && QH0.show().stage !== 2; k++) BK.sim(1); BK.sim(60); BK.P.x = 309 * 16; BK.P.y = 22 * 16; BK.sim(10); snap('q2-honey');
        const QH = BK.hornetQueenHands(), N = BK.nestHands(); N.cut('tornW'); BK.sim(120); BK.P.x = 306 * 16 + 4; BK.P.y = 20 * 16; BK.sim(20); snap('q2-heap');
        e.mode = 'dazed'; e.modeT = 9; e.x = 313 * 16; e.y = 22 * 16; BK.sim(2); N.cut('last'); for (let k = 0; k < 200 && e.mode !== 'pinned'; k++) BK.sim(1); BK.sim(30); snap('q2-pinLast'); void QH;
        e.hp = 1; e.mode = 'pinned'; BK.P.x = e.x - 20; BK.P.y = 22 * 16; BK.P.face = 1; for (let k = 0; k < 30 && e.alive; k++) { BK.press('atk'); BK.sim(10); } BK.sim(200); if (BK.cardClose) try { BK.cardClose(); } catch (x) {} BK.state = 'play'; BK.sim(5); snap('q2-dead');
        BK.P.x = 334 * 16; BK.P.y = 22 * 16; BK.sim(30); BK.P.x = 343 * 16; BK.P.y = 29 * 16; BK.sim(40); if (BK.cardClose) try { BK.cardClose(); } catch (x) {} BK.state = 'play'; BK.sim(5); snap('q2-falling'); }
    }
    return { res: shots }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'hornetsnest2-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
