// a lane's eyes (claude/bc4fix): THE SAND RISES in the King's phase two, and drains in phase three. Not in the suite. PORT from the environment.
import { openPage } from '../../../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'buriedcity'); const res = [], log = [];
    BK.manualSimulation = true; BKT.setHeroLevel('knight', 40); BK.setHero('knight'); BK.reset({ fresh: false }); BK.applyUpgrades && BK.applyUpgrades(); BK.load(i); BK.state = 'play'; BK.god = true; try { BK.SET.hud = 'minimal'; } catch (e) {}
    BK.sim(300); BK.tp(860, 32); for (let k = 0; k < 200; k++) { if (BK.state === 'card') BK.cardClose(); BK.step(1); }
    const KH = BK.hourglassKingHands(), S = () => KH.show(), P = BK.P;
    const snap = name => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png')]); };
    const step = n => { for (let k = 0; k < n; k++) { if (BK.state === 'card') BK.cardClose(); P.hp = P.maxHp; BK.step(1); } };
    const e = BK.boss; if (!e) return { err: 'no boss', log };
    e.hp = e.maxHp * 0.55; step(120); log.push('ph ' + S().ph + ' sand ' + S().sand);
    for (let w = 0; w < 3; w++) { S().wdT = 0; S().glass = S().glassMax; let shot = false;
      for (let k = 0; k < 60 * 30; k++) { step(1); S().glass = Math.max(S().glass, S().glassMax * 0.8); if (!shot && e.mode === 'glide') { step(14); snap('heave' + w); shot = true; } if (shot && e.mode === 'recover') break; }
      log.push('withdraw ' + w + ': sand ' + S().sand + ' floorY ' + S().G.floorY + ' P.y ' + Math.round(P.y) + ' king y ' + Math.round(e.y)); snap('after' + w); }
    e.hp = e.maxHp * 0.2; step(60 * 3); snap('p3a'); step(60 * 3); snap('p3b'); log.push('p3: ph ' + S().ph + ' sand ' + S().sand + ' floorY ' + S().G.floorY + ' P.y ' + Math.round(P.y));
    return { res, log }; })()`, 900000);
  if (r.err) console.log(r.err);
  for (const [n, d] of (r.res || [])) writeFileSync(new URL('./ks-' + n + '.png', import.meta.url), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.log.join('\n')); console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
