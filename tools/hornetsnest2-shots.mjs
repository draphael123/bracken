// tools/hornetsnest2-shots.mjs - THE HORNET'S NEST 2 for eyes (claude/hornetsnest2): ONE ARENA (the hall in P1, the hall torn in P2: honey, the torn combs, THE LAST COMB, a pin),
// THE FALLING NEST after her death, THE MARSH EDGE, the old pines at the start, THE FAT HONEY HORNET's poses in play.
// PORT=<port> node tools/hornetsnest2-shots.mjs  ->  work/claude/lane-done/hornetsnest2-*.png   (ONLY=a,b limits the named shots)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUT || join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });   /* OUT=<dir> sends the shots elsewhere (claude/hornetsnest2: scratch/lane-reports/hornetsnest2-shots) */
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const SPOTS = [['stinger', 96, 33], ['foot', 4, 65], ['gallery-in', 172, 31], ['gallery-pillar', 193, 29], ['gallery-ledge', 208, 29], ['well-in', 300, 11], ['well-bed', 320, 47], ['well-rungs', 336, 44], ['well-overhang', 337, 26], ['well-exit', 343, 9], ['hall', 410, 21], ['edge-roots', 460, 65], ['edge-water', 472, 65], ['edge-gate', 505, 65]];
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
    /* THE FOG DROPS HER (claude/hornetsnest2): the pot on her, the fall, the grounded stun; the stand empty and regrowing; a honey drip swelling */
    if (!ONLY || ONLY.some(n => /^fog-/.test(n))) {
      load(); BK.tp(401, 21); BK.sim(120); const e = BK.boss, N = BK.nestHands(), S = BK.hornetQueenHands().show(); if (e) { S.ward = 0; e.ward = 0; e.smokeCd = 0; e.mode = 'hover'; e.modeT = 9; e.x = S.G.h.mid; e.y = S.G.h.floor - 70; BK.P.x = S.G.h.mid - 60; BK.P.y = S.G.h.floor; BK.sim(1);
        N.lob(e.x, e.y - 8, 0, 0); BK.sim(8); snap('fog-hit'); BK.sim(15); snap('fog-fall'); BK.sim(60); snap('fog-grounded'); BK.sim(140); snap('fog-stun-end');
        const st = N.stands().find(s => s.hall); e.smokeCd = 0; e.mode = 'skim'; e.modeT = 9; e.x = st.x + 2; e.y = st.y - 4; BK.sim(30); snap('fog-burst'); BK.sim(600); snap('fog-stand-empty'); BK.sim(260); snap('fog-stand-regrown'); }
      load(); BK.tp(185, 28); BK.P.face = 1; BK.sim(300); { const D = BK.nestHands().drips(), d = D.find(q => q.x === 185); BK.P.x = 183 * 16; for (const q of D) q.t = 0; d.st = 'swell'; d.s = 0.5; BK.sim(1); snap('fog-drip-swell', 3); d.st = 'fall'; d.y = d.y0 * 16 + 4 + 60; d.vy = 150; BK.P.x = 189 * 16; BK.sim(2); snap('fog-drip-fall', 3); }
    }
    /* HER HALL: P1, the tear, P2 (honey, the torn combs, the last comb), a pin, her death and THE FALLING NEST */
    if (!ONLY || ONLY.some(n => /^q2-/.test(n))) {
      load(); BK.tp(401, 21); BK.sim(90); const E = () => BK.boss; snap('q2-p1');
      const e = E(); if (e) { const QH0 = BK.hornetQueenHands(); e.hp = Math.ceil(e.maxHp * 0.55); e.mode = 'hover'; e.modeT = 0.2; for (let k = 0; k < 400 && e.mode !== 'tearTell'; k++) BK.sim(1); BK.sim(60); snap('q2-tearTell'); for (let k = 0; k < 400 && e.mode !== 'tear'; k++) BK.sim(1); BK.sim(20); snap('q2-tear'); for (let k = 0; k < 600 && QH0.show().stage !== 2; k++) BK.sim(1); BK.sim(60); BK.P.x = 409 * 16; BK.P.y = 22 * 16; BK.sim(10); snap('q2-honey');
        const QH = BK.hornetQueenHands(), N = BK.nestHands(); N.cut('tornW'); BK.sim(120); BK.P.x = 406 * 16 + 4; BK.P.y = 20 * 16; BK.sim(20); snap('q2-heap');
        e.mode = 'dazed'; e.modeT = 9; e.x = 413 * 16; e.y = 22 * 16; BK.sim(2); N.cut('last'); for (let k = 0; k < 200 && e.mode !== 'pinned'; k++) BK.sim(1); BK.sim(30); snap('q2-pinLast'); void QH;
        e.hp = 1; e.mode = 'pinned'; BK.P.x = e.x - 20; BK.P.y = 22 * 16; BK.P.face = 1; for (let k = 0; k < 30 && e.alive; k++) { BK.press('atk'); BK.sim(10); } BK.sim(200); if (BK.cardClose) try { BK.cardClose(); } catch (x) {} BK.state = 'play'; BK.sim(5); snap('q2-dead');
        BK.P.x = 434 * 16; BK.P.y = 22 * 16; BK.sim(30); BK.P.x = 443 * 16; BK.P.y = 29 * 16; BK.sim(40); if (BK.cardClose) try { BK.cardClose(); } catch (x) {} BK.state = 'play'; BK.sim(5); snap('q2-falling'); }
    }
    return { res: shots }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'hornetsnest2-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
