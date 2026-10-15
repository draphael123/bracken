// tools/bc4art-king-shots.mjs - THE HOURGLASS KING's BC4 moves in the real page (claude/bc4art), for eyes: the withdraw, the throws, the slabs, phase three. -> work/claude/shots/bc4art/king/*.png. Not in the suite. PORT from the environment.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/bc4art/king'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'buriedcity'); const res = [];
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 40); BK.setHero('knight'); BK.reset({ fresh: false }); BK.applyUpgrades && BK.applyUpgrades(); BK.load(i); BK.state = 'play'; BK.god = true; try { BK.SET.hud = 'minimal'; } catch (e) {}
    BK.sim(300); BK.tp(860, 32); for (let k = 0; k < 200; k++) { if (BK.state === 'card') BK.cardClose(); BK.step(1); }
    const KH = BK.hourglassKingHands(), S = () => KH.show(), P = BK.P;
    const snap = name => { if (BK.boss && /hold|raise|potRel|shardRel|withdraw/.test(name)) { const e = BK.boss; P.x = e.x - 100 * (e.x > P.x ? 1 : -1); P.y = S().G.floorY; for (let k = 0; k < 25; k++) BK.step(1); } const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png')]); };
    const keep = () => { P.hp = P.maxHp; if (BK.boss) BK.boss.hp = BK.boss.maxHp; };
    let n = 0; const seen = new Set();
    for (let f = 0; f < 3600 && n < 14; f++) { if (BK.state === 'card') BK.cardClose(); keep(); const s = S(), e = BK.boss; if (!s || !e) { BK.step(1); continue; }
      if (f === 120) { s.wdT = 0.01; s.glass = s.glassMax; }
      BK.step(1); const m = e.mode;
      if (['withdrawTell','glide','shardTell','shardRel','potTell','potRel','raiseTell','hold'].includes(m) && !seen.has(m)) { seen.add(m); for (let k = 0; k < 6; k++) BK.step(1); snap(m); n++; }
      if (m === 'hold' && seen.has('hold') && !seen.has('hold2') && e.open > 3) { seen.add('hold2'); snap('hold-slabs'); n++; }
      if (m === 'potTell' && s.mark && !seen.has('mark')) { seen.add('mark'); for (let k = 0; k < 20; k++) BK.step(1); snap('potmark'); n++; }
      if (s.pots && s.pots.length && !seen.has('pot-air')) { seen.add('pot-air'); snap('pot-air'); n++; }
      if (s.shards && s.shards.length && !seen.has('shard-air')) { seen.add('shard-air'); snap('shard-air'); n++; }
    }
    return { res, modes: [...seen] }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.modes.join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
