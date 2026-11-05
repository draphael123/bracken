// tools/sky-art-shots.mjs - THE SKY FIGHT in the skylab (claude/skyart): ONE headless browser; shoots the 3 altitudes, the King's poses per phase, bolts, returns, imps, a bank.
// node tools/sky-art-shots.mjs  -> scratch/lane-reports/skyart-*.png   (only with >= 1500 MB free; one browser at a time)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'skyart-' + n + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot', n); };
const force = (mode, ph, T = 0.7, mT = 0.45) => E(`(()=>{const f=BK.demonKing.f();if(!f)return 'nof';f.ph=${ph};f.mode='${mode}';f.T=${T};f.mT=${mT};f.rest=99;BK.draw1();return 'ok'})()`);
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__IDX=LEVELS.findIndex(l=>l.id==='skylab');BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=true;BK.sim(30);})()`);
  await E('BK.sim(300)'); await shot('rim-p1-idle');
  let n = 0; while (n++ < 60 && !(await E(`!!(BK.demonKing.f()&&BK.demonKing.f().bolts.some(b=>b.st==='in'))`))) await E('BK.sim(12)');
  await shot('bolt-in-flight');
  await E('BK.demonKing.knock()'); await E('BK.sim(10)'); await shot('return-flying');
  await E('BK.skyMount.bank(1)'); await E('BK.sim(75)'); await shot('bank-tell'); await E('BK.sim(60)'); await shot('bank-tilt');
  for (const [m, ph] of [['boltTell', 1], ['boltRelease', 1], ['swoopTell', 1], ['whipTell', 2], ['feintTell', 2], ['doubleTell', 2], ['downed', 2], ['repulseTell', 2], ['tumble', 2], ['summonTell', 3], ['downed', 3]]) { const r = await force(m, ph); if (r !== 'ok') { console.log(m, r); continue; } await shot('king-' + m + '-p' + ph); }
  await E('BK.skyMount.phase(2)'); await E('BK.sim(420)'); await force('float', 2); await shot('high-p2');
  await E('BK.skyMount.phase(3)'); await E('BK.sim(420)'); await force('float', 3); await shot('ash-p3');
  await force('summonTell', 3, 1.0, 0.8); await shot('p3-glyph'); await E(`(()=>{const f=BK.demonKing.f();f.mode='summon';f.mT=0;f.T=0.4;})()`); await E('BK.sim(90)'); await shot('p3-imps');
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
