// tools/ui-hud-shots.mjs - BEFORE / AFTER STILLS FOR THE HUD + MENUS LANE (claude/uihud).   node tools/ui-hud-shots.mjs <outdir> [prefix]
// Runs on any checkout (it uses only what master already has): the caravan, the well town and the red gorge at their first frames (the
// CATCHING UP toast and the sun/skin/flood rows), the caravan in shade and in the sun's bite, the pause menu, the settings tabs, and the
// phone HUD (?touch=1). Each still is the 320x180 game frame, scaled x3 with no smoothing. Not in the suite.
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2] || 'work/claude/lane-done/uihud', PRE = process.argv[3] || '';
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const E = (e, t = 120000) => pg.evalp(e, t);
const frame = async name => { const url = await E(`(() => { const b = BK.view.buf, c = document.createElement('canvas'); c.width = b.width * 3; c.height = b.height * 3; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(b, 0, 0, c.width, c.height); return c.toDataURL(); })()`);
  writeFileSync(OUT + '/' + PRE + name + '.png', Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + PRE + name); };
const lvl = id => E(`(async () => { const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === '${id}'); BK.load(i); BK.start(); BK.god = true; BK.sim(90); BK.step(1); return i; })()`);
try {
  await lvl('caravan'); await frame('hud-caravan-start');
  /* in the shade: stand in the first shade zone, a few frames */
  await E(`(() => { const z = BK.L.shadeArt[0]; BK.P.x = (z[0] + z[1]) / 2; BK.P.y = z[3] - 2; BK.P.vx = BK.P.vy = 0; BK.P.sun = { v: 0.5, tick: 0, n: 0 }; BK.sim(20); BK.step(1); })()`); await frame('hud-caravan-shade');
  /* in the sun's bite: out in the open, the build at full */
  await lvl('caravan');
  await E(`(() => { BK.P.sun = { v: 1, tick: 0, n: 0 }; for (let i = 0; i < 30; i++) { BK.P.sun.v = 1; BK.sim(1); } BK.step(1); })()`); await frame('hud-caravan-heat');
  await lvl('welltown'); await frame('hud-welltown-start');
  await lvl('redgorge'); await frame('hud-redgorge-start');
  await lvl('wood'); await E(`BK.step(120)`); await frame('hud-wood-idle');
  /* the pause menu and the settings tabs */
  await E(`(() => { BK.ui.openMenu('play'); BK.ui.menuI = 0; BK.step(40); })()`); await frame('pause');
  await E(`(() => { BK.ui.menuKind = 'settings'; for (const t of ['display', 'access']) { BK.ui.settingsTab = t; BK.ui.menuI = 1; BK.step(30); } })()`).catch(() => {});
  for (const t of ['display', 'access']) { await E(`(() => { BK.ui.menuKind = 'settings'; BK.ui.settingsTab = '${t}'; BK.ui.menuI = 1; BK.step(30); })()`); await frame('settings-' + t); }
  /* the phone: the same wood, touch on */
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw' }); await sleep(2500);
  for (let i = 0; i < 160 && !(await E('typeof window.BK !== "undefined"').catch(() => false)); i++) await sleep(250);
  await lvl('welltown'); await frame('hud-phone-welltown');
} finally { console.log('errors', JSON.stringify(pg.errors.slice(0, 5))); pg.close(); }
