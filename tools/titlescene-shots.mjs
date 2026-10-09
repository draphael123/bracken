// tools/titlescene-shots.mjs - pictures of the title, the hero pick and the map's first frames (claude/titlescene). Not in the suite.
// usage: PORT=<free port> node tools/titlescene-shots.mjs <outdir> <tag>
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.argv[2] || 'work/claude/titlescene'), tag = process.argv[3] || 'shot'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
const snap = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(out, tag + '-' + name + '.png'), Buffer.from(r.result.data, 'base64')); console.log(tag + '-' + name + '.png'); };
const pause = ms => new Promise(r => setTimeout(r, ms));
try {
  await pg.evalp(`BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.ui.pressCard = false; BK.state = 'title'; BK.step(150); 0`); await pause(150); await snap('title');
  await pg.evalp(`BK.ui.titleI = 4; BK.step(10); 0`); await pause(150); await snap('title-sel4');
  for (let i = 0; i < 3; i++) { await pg.evalp(`BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = ${i}; BK.step(30); 0`); await pause(150); await snap('heropick-' + i); }
  await pg.evalp(`BK.mapLook('wood'); 0`); await pause(100); await snap('map-first-frame');
  await pg.evalp(`BK.step(1); 0`); await pause(100); await snap('map-frame1');
  await pg.evalp(`BK.step(30); 0`); await pause(100); await snap('map-frame30');
  await pg.evalp(`BK.step(60); 0`); await pause(100); await snap('map-settled');
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
