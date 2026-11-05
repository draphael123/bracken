// tools/heart-cam-shots.mjs (claude/heartproof): skylab camera + parallax pictures at the real view; the hero must stay in frame (checked) at each zoom/phase/parallax setting.
//   node tools/heart-cam-shots.mjs     ->  work/claude/heartproof/cam-*.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const DIR = join(ROOT, 'work', 'claude', 'heartproof'); mkdirSync(DIR, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const E = (e, t) => pg.evalp(e, t || 300000);
const shot = async n => { await E('BK.draw1()'); await new Promise(r => setTimeout(r, 120)); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(DIR, 'cam-' + n + '.png'), Buffer.from(r.result.data, 'base64')); };
try {
  await E(`(async()=>{ const { LEVELS } = await import('/src/level.js'); window.__IDX = id => LEVELS.findIndex(l => l.id === id); BK.manualSimulation = true; for (const k in BK.keys) BK.keys[k] = false; BK.setHero('knight'); BK.reset({ fresh: true }); BK.applyUpgrades(); BK.load(__IDX('skylab')); BK.state = 'play'; BK.god = true; BK.sim(200); })()`);
  console.log(JSON.stringify(await E("BK.tavern.cam()")));
  for (const par of ['full', 'low', 'off']) {
    await E(`BK.SET.parallax = ${JSON.stringify(par)}; BK.sim(30)`);
    await shot('p1-' + par);
      }
  await E(`BK.SET.parallax = 'full'; BK.skyMount.bank(1); BK.sim(200)`); await shot('bank-neck');
  await E(`BK.skyMount.bank(-1); BK.sim(260)`); await shot('bank-tail');
  await E(`BK.skyMount.phase(2); BK.sim(120)`); await shot('climb-p2');
  await E(`BK.sim(500)`); await shot('p2');
  await E(`BK.skyMount.phase(3); BK.sim(500)`); await shot('p3');
  await E(`BK.SET.zoom = 'wide'; BK.sim(40); BK.draw1()`); console.log(JSON.stringify(await E('BK.tavern.cam()'))); await shot('wide-p3'); await E(`BK.skyMount.phase(1); BK.sim(300)`); await shot('wide-p1'); await E(`BK.skyMount.bank(1); BK.sim(200)`); await shot('wide-bank');
  ok(true, 'pictures taken'); const errs = pg.errors.filter(e => !/favicon|ERR_|Failed to load resource/.test(e)); ok(!errs.length, 'no page errors ' + JSON.stringify(errs).slice(0, 300));
} catch (e) { ok(false, 'threw ' + e.message); }
await pg.close(); process.exit(bad ? 1 : 0);
