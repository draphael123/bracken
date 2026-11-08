// tools/titlemenu-shots.mjs - stills of the six-row title, each submenu and the demo (?demo=1) title (claude/titlemenu, Daniel 11-08). Not in the suite.
// usage: PORT=<free port> node tools/titlemenu-shots.mjs <outdir>
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
const out = resolve(process.argv[2] || 'titlemenu-shots'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: true });
const pause = ms => new Promise(r => setTimeout(r, ms));
const snap = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); const f = join(out, name + '.png'); writeFileSync(f, Buffer.from(r.result.data, 'base64')); console.log(f); };
const E = s => pg.evalp(s);
const show = async (name, js) => { await E('BK.ui.pressCard = false; BK.state = "title"; ' + js + '; BK.step(120); for (let i = 0; i < 60; i++) BK.draw1(); 0'); await pause(150); await snap(name); };
/* (claude/titlemenu2) PLAY WITH AI: ENTER on the row opens the party board on its AI PARTNER picker; ESC closes it */
const aiShot = async name => { await E('BK.ui.pressCard = false; BK.state = "title"; BK.ui.titleSelect("PLAY WITH AI"); BK.step(120); for (let i = 0; i < 60; i++) BK.draw1(); BK.press("confirm"); BK.step(3); 0'); await pause(400); await snap(name); await E('window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); 0'); await pause(100); };
const started = 'BK.PROG.heroPicked = true; BK.PROG.xp = { knight: 50 }; BKT.PROG.heroPicked = true; BKT.PROG.xp = { knight: 50 }; BKT.saveNow()';
try {
  await E('BK.manualSimulation = true; BK.setHero("knight"); BK.reset({ fresh: true }); 0');
  await show('1-top-newgame', 'BK.ui.titleSub = null; BK.ui.titleI = 0');
  await E(started + '; 0');
  await show('2-top-continue', 'BK.ui.titleSub = null; BK.ui.titleI = 0');
  await show('3-top-extras-badge', 'BK.ui.titleSub = null; BK.ui.titleI = BK.ui.titleTop().indexOf("EXTRAS")');
  for (const g of ['PLAY TOGETHER', 'MORE MODES', 'EXTRAS', 'OPTIONS']) await show('4-sub-' + g.toLowerCase().replace(/ /g, '-'), 'BK.ui.titleSub = ' + JSON.stringify(g) + '; BK.ui.titleI = 0');
  /* after up/down inside submenus: the bar must follow the cursor */
  for (const g of ['EXTRAS', 'MORE MODES', 'PLAY TOGETHER']) { await show('4b-' + g.toLowerCase().replace(/ /g, '-') + '-after-down-down', 'BK.ui.titleSub = ' + JSON.stringify(g) + '; BK.ui.titleI = 0; BK.press("down"); BK.step(3); BK.press("down"); BK.step(3)'); console.log(g, await E('BK.ui.titleItems()[BK.ui.titleI]')); }
  await aiShot('4c-play-with-ai-picker');
  console.log(JSON.stringify({ top: await E('BK.ui.titleTop()') }));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
  /* the demo build: ?demo=1 */
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?demo=1&noopening=1&nosw' });
  for (let i = 0; i < 160 && !(await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)); i++) await pause(300);
  await pause(1500);
  await E('BK.manualSimulation = true; BK.setHero("knight"); BK.reset({ fresh: true }); 0');
  await show('5-demo-top', 'BK.ui.titleSub = null; BK.ui.titleI = 0');
  const demo = await E('JSON.stringify({ top: BK.ui.titleTop(), demo: new URLSearchParams(location.search).get("demo") })'); console.log(demo);
  for (const g of ['PLAY TOGETHER', 'MORE MODES', 'EXTRAS']) { if (JSON.parse(demo).top.includes(g)) await show('6-demo-sub-' + g.toLowerCase().replace(/ /g, '-'), 'BK.ui.titleSub = ' + JSON.stringify(g) + '; BK.ui.titleI = 0'); }
  if ((await E('BK.ui.titleTop()')).includes('PLAY TOGETHER')) await aiShot('7-demo-play-with-ai-picker');
  console.log(await E('JSON.stringify({ more: (BK.ui.titleSub = "MORE MODES", BK.ui.titleItems()), extras: (BK.ui.titleSub = "EXTRAS", BK.ui.titleItems()) })'));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
