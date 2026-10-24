// tools/hornets2art-shots.mjs - THE HORNET'S NEST 2 ART PASS for eyes (claude/hornets2art): the fat honey hornet's poses close up, the glob and the sticky patch, the hall's P2 (the tear,
// the flood, the torn combs, THE LAST COMB, the queen pinned), the stinger, the transitions (old pines, the marsh edge, the far pine on the neighbours), the map landmark.
// TAG=after PORT=<port> node tools/hornets2art-shots.mjs  ->  work/claude/lane-done/hornets2art-<TAG>-<name>.png   (ONLY=a,b limits the named shots; HERO=knight|warden|pyro)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after', ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const SPOTS = [['stinger', 96, 33], ['foot', 4, 65], ['hall', 310, 21], ['edge-roots', 360, 65], ['edge-water', 372, 65], ['edge-gate', 405, 65], ['pines', 30, 65], ['pines2', 55, 56]];
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = []; const ONLY = ${JSON.stringify(ONLY)};
    const want = n => !ONLY || ONLY.includes(n);
    const load = (id = 'hornetsnest') => { BK.setHero(${JSON.stringify(process.env.HERO || 'knight')}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === id)); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(120); };
    /* z: scale; crop = [dx, dy, w, h] around the screen centre (the hero) when given */
    const snap = (name, z = 2, crop) => { if (!want(name)) return; BK.step(1); const b = BK.buf; const [dx, dy, cw, ch] = crop || [-b.width / 2, -b.height / 2, b.width, b.height]; const c = document.createElement('canvas'); c.width = cw * z; c.height = ch * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const hx = crop ? Math.round(BK.P.x - BK.cam[0]) : b.width / 2, hy = crop ? Math.round(BK.P.y - BK.cam[1]) : b.height / 2; g.drawImage(b, hx + dx, hy + dy, cw, ch, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const at = (col, row, face = 1) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = face; BK.sim(50); };
    for (const [n, c, r] of ${JSON.stringify(SPOTS)}) { if (!want(n)) continue; load(); at(c, r); snap(n); }
    /* THE FAT HONEY HORNET in play, close: the cells chamber's (col 104) */
    if (!ONLY || ONLY.some(n => /^hh-/.test(n))) {
      const hh = () => BK.enemies().find(e => e.alive && e.t === 'honeyhornet');
      const prep = () => { load(); at(100, 33); BK.enemies().forEach(e => { if (e.alive && e.t !== 'honeyhornet') e.alive = false; }); BK.sim(260); return hh(); };
      for (const [m, t] of [['patrol', 0], ['dripTell', 0.4], ['drop', 0.1], ['ramTell', 0.5], ['ram', 0.2], ['reel', 0.6], ['drowsy', 1.5]]) { if (!want('hh-' + m)) continue;
        const e = prep(); if (!e) continue;
        e.x = BK.P.x + (m === 'dripTell' || m === 'drop' ? 4 : 56); e.y = m === 'drowsy' ? BK.P.y : m === 'dripTell' || m === 'drop' ? BK.P.y - 56 : BK.P.y - 14; e.face = -1; e.mode = m; e.modeT = 9; e.cd = 9; e.drowsyT = 9;
        if (m === 'drop') e.globs = [{ x: e.x, y: e.y + 20, vy: 100 }]; BK.step(2); snap('hh-' + m, 4, [-60, -90, 190, 110]); }
      if (want('hh-dead')) { const e = prep(); if (e) { e.x = BK.P.x + 40; e.y = BK.P.y - 10; BK.P.face = 1; for (let k = 0; k < 60 && e.alive; k++) { e.hp = 1; BK.press('atk'); BK.sim(12); e.x = BK.P.x + 20; e.y = BK.P.y - 6; } BK.sim(60); snap('hh-dead', 5, [-20, -60, 140, 80]); } }
      if (want('hh-patch')) { prep(); const N = BK.nestHands(); N.addHoney(BK.P.x - 14, BK.P.x + 14, 34, 6); BK.sim(14); snap('hh-patch', 5, [-30, -50, 100, 70]); BK.sim(40); snap('hh-patch2', 5, [-30, -50, 100, 70]); }
      if (want('hh-glob')) { const e = prep(); if (e) { e.x = BK.P.x + 30; e.y = BK.P.y - 60; e.mode = 'drop'; e.modeT = 9; e.cd = 9; e.globs = [{ x: e.x, y: e.y + 10, vy: 160 }]; BK.step(4); snap('hh-glob', 5, [-10, -80, 80, 100]); } }
    }
    /* HER HALL: P1, the tear (told, then ripped), P2 (the flood, the torn combs, THE LAST COMB), a pin, a comb landing in the honey, her death */
    if (!ONLY || ONLY.some(n => /^q2-/.test(n))) {
      load(); BK.tp(301, 21); BK.sim(90); const E = () => BK.boss; snap('q2-p1');
      const e = E(); if (e) { e.hp = Math.ceil(e.maxHp * 0.55); e.mode = 'hover'; e.modeT = 0.2; for (let k = 0; k < 400 && e.mode !== 'tearTell'; k++) BK.sim(1); for (let k = 0; k < 200 && e.modeT > 0.9; k++) BK.sim(1); snap('q2-tearTell'); for (let k = 0; k < 200 && e.modeT > 0.25; k++) BK.sim(1); snap('q2-tearTell2');
        for (let k = 0; k < 400 && e.mode !== 'tear'; k++) BK.sim(1); BK.sim(12); snap('q2-tear'); const QH0 = BK.hornetQueenHands(); for (let k = 0; k < 600 && QH0.show().stage !== 2; k++) BK.sim(1); BK.sim(60); BK.P.x = 309 * 16; BK.P.y = 22 * 16; BK.sim(10); snap('q2-honey');
        const N = BK.nestHands(); N.cut('tornW'); BK.sim(24); snap('q2-splash'); BK.sim(100); BK.P.x = 306 * 16 + 4; BK.P.y = 20 * 16; BK.sim(20); snap('q2-heap');
        e.mode = 'dazed'; e.modeT = 9; e.x = 313 * 16; e.y = 22 * 16; BK.sim(2); N.cut('last'); BK.sim(20); snap('q2-lastfall'); for (let k = 0; k < 200 && e.mode !== 'pinned'; k++) BK.sim(1); BK.sim(30); snap('q2-pinLast');
        e.hp = 1; e.mode = 'pinned'; BK.P.x = e.x - 20; BK.P.y = 22 * 16; BK.P.face = 1; for (let k = 0; k < 30 && e.alive; k++) { BK.press('atk'); BK.sim(10); } BK.sim(200); if (BK.cardClose) try { BK.cardClose(); } catch (x) {} BK.state = 'play'; BK.sim(5); snap('q2-dead'); }
    }
    return { res: shots }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'hornets2art-' + TAG + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
