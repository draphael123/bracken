// tools/herocolors-pick.mjs - the hero pick with three heroes selected + a locked one, and a contact sheet of every banner (claude/herocolors). usage: PORT=8919 node tools/herocolors-pick.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ROSTER_KEY, rosterText } from '../src/hero-roster.js';
const out = join(ROOT, 'work/claude/shots/herocolors'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
const pause = ms => new Promise(r => setTimeout(r, ms));
const shot = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(out, name + '.png'), Buffer.from(r.result.data, 'base64')); console.log(name + '.png'); };
try {
  await pg.evalp(`BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); 0`);
  for (const [i, n] of [[0, 'knight'], [3, 'ranger'], [5, 'pyro'], [4, 'berserker-locked']]) { await pg.evalp(`BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = ${i}; BK.step(40); 0`); await pause(200); await shot('pick-' + n); }
  for (const [i, n] of [[6, 'paladin'], [7, 'pirate'], [8, 'reaper'], [1, 'warden'], [2, 'geomancer']]) { await pg.evalp(`BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = ${i}; BK.step(40); 0`); await pause(200); await shot('pick-' + n); }
  await pg.evalp(`localStorage.setItem(${JSON.stringify(ROSTER_KEY)}, ${JSON.stringify(rosterText(['knight','warden','geomancer','ranger','berserker','pyro','paladin','pirate','reaper']))}); setTimeout(() => location.assign('/?noopening=1'), 50); 1`); for (let i = 0; i < 60; i++) { await pause(500); if (await pg.evalp('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)) break; }
  await pg.evalp(`BK.manualSimulation = true; BK.reset({ fresh: true }); BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 8; BK.step(40); 0`); await pause(300); await shot('contact-all-banners-open');
  if (pg.errors.length) console.log(pg.errors.slice(0, 3));
} finally { pg.close(); }
