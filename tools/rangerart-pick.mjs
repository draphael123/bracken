// tools/rangerart-pick.mjs - the hero pick with the Warden and the Ranger selected (claude/rangerart; not in the suite). usage: PORT=8914 node tools/rangerart-pick.mjs <tag>
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'pick', out = join(ROOT, 'work/claude/shots/rangerart'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
const pause = ms => new Promise(r => setTimeout(r, ms));
try {
  await pg.evalp(`BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); 0`);
  for (const [i, n] of [[1, 'warden'], [3, 'ranger']]) { await pg.evalp(`BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = ${i}; BK.step(40); 0`); await pause(200);
    const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(out, tag + '-' + n + '.png'), Buffer.from(r.result.data, 'base64')); console.log(tag + '-' + n + '.png'); }
  if (pg.errors.length) console.log(pg.errors.slice(0, 3));
} finally { pg.close(); }
