// tools/hornetsnestart-shots.mjs - THE HORNET'S NEST ART PASS for eyes (claude/hornetsnestart): the level at fixed spots, the foes, the queen.
// TAG=before|after PORT=<port> node tools/hornetsnestart-shots.mjs  ->  work/claude/lane-done/hornetsnestart-<TAG>-*.png   (ONLY=a,b limits the named shots)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after', ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const SPOTS = [['foot', 4, 65], ['buttress', 45, 61], ['hollow', 70, 55], ['mouth', 92, 53], ['cells', 113, 33], ['wax', 150, 28], ['guard', 158, 31], ['stair', 175, 27], ['core', 195, 19], ['top', 232, 7], ['brood', 270, 9], ['hall', 310, 21], ['fall', 345, 42], ['pine', 370, 65], ['lastcomb', 386, 61]];
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = []; const ONLY = ${JSON.stringify(ONLY)};
    const want = n => !ONLY || ONLY.includes(n);
    const load = () => { BK.setHero(${JSON.stringify(process.env.HERO || 'knight')}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(120); };
    const snap = (name, z = 2) => { if (!want(name)) return; BK.step(1); const c = document.createElement('canvas'), b = BK.buf; c.width = b.width * z; c.height = b.height * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const at = (col, row, face = 1) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = face; BK.sim(50); };
    load(); for (const [n, c, r] of ${JSON.stringify(SPOTS)}) { if (!want(n)) continue; at(c, r); snap(n); }
    if (!ONLY || ONLY.some(n => /^(stand|swarm|comb|pot|cloud|brood)/.test(n))) {
      load(); at(4, 65); snap('stand', 3);
      load(); at(17, 64); snap('swarm-idle', 3); BK.P.x = 19 * 16; BK.sim(45); snap('swarm-rise', 3); BK.sim(30); snap('swarm-angry', 3);
      load(); at(34, 65); snap('comb-hang'); BK.press('jump'); BK.sim(7); BK.press('atk'); BK.sim(14); snap('comb-fall'); BK.sim(90); snap('comb-landed');
      load(); at(4, 65); BK.press('talk'); BK.sim(12); snap('pot-carry', 4);
      BK.P.x = 15 * 16; BK.P.y = 65 * 16; BK.sim(50); snap('swarm-calm', 3); BK.press('atk'); BK.sim(25); snap('pot-thrown', 3); BK.sim(40); snap('cloud', 3);
      load(); at(106, 33); BK.sim(30); snap('brood-pulse', 3); BK.sim(110); snap('brood-hatched', 3);
    }
    if (!ONLY || ONLY.some(n => /^foe-/.test(n))) {
      load(); at(66, 55); BK.enemies().forEach(e => { if (e.alive && !e.elite && Math.abs(e.x - BK.P.x) > 150) e.alive = false; }); BK.sim(30); snap('foe-hollow', 4);
      load(); at(150, 28); BK.enemies().forEach(e => { if (e.alive && !e.elite && Math.abs(e.x - BK.P.x) > 150) e.alive = false; }); BK.P.x = 153 * 16; BK.sim(20); snap('foe-guard', 4);
    }
    if (!ONLY || ONLY.some(n => /^q-/.test(n))) {
      load(); BK.tp(301, 21); BK.sim(60); const E = () => BK.boss; BK.P.hp = BK.P.maxHp || 100;
      const place = (m, dx = 70, dy = -50) => { const e = E(); if (!e) return; e.mode = m; e.modeT = 9; e.x = BK.P.x + dx; e.y = BK.P.y + dy; e.vx = 0; e.vy = 0; };
      for (const m of ['hover', 'aim', 'dive', 'stuck', 'dazed', 'winded', 'sweepTell', 'sweep', 'buzzTell', 'tearTell', 'volleyTell', 'volley', 'cloakTell', 'thrash']) { if (!want('q-' + m)) continue; place(m); if (m === 'cloakTell') { try { E().cloak = 5; } catch (e) {} } snap('q-' + m, 3); }
    }
    return { res: shots }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'hornetsnestart-' + TAG + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
