// tools/touch-shots.mjs - CAPTURES OF THE PHONE HUD (landscape, 844x390 at 2x), for the lane report.   node tools/touch-shots.mjs [outdir]
// Writes work/claude/mobile/*.png: the play HUD (idle, stick held, with the action button), left-handed, with a notch, and the tap menus.
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../work/claude/mobile/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const E = (e, t = 120000) => pg.evalp(e, t);
const DPR = 2;
try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: DPR, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const goto = async (q = '') => { await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw' + q }); await sleep(1500); for (let i = 0; i < 160 && !(await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)); i++) await sleep(300); await sleep(1500); };
  const shot = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + name + '.png', Buffer.from(r.result.data, 'base64')); console.log('wrote ' + name + '.png'); };
  const pts = new Map();
  const send = (type, list) => pg.send('Input.dispatchTouchEvent', { type, touchPoints: list.map(p => ({ x: p.x, y: p.y, id: p.id })) });
  const down = async (id, x, y) => { pts.set(id, { id, x, y }); await send('touchStart', [...pts.values()]); await sleep(60); };
  const move = async (id, x, y) => { pts.set(id, { id, x, y }); await send('touchMove', [...pts.values()]); await sleep(60); };
  const up = async id => { const p = pts.get(id); pts.delete(id); await send('touchEnd', [p]); await sleep(60); };
  const tapGame = async i => { const hs = await E('BK.touch.hitBoxes()'), h = hs[i]; const [x, y] = await E(`BK.touch.gameToClient(${h.x + h.w / 2}, ${h.y + h.h / 2})`); await down(9, x, y); await up(9); await sleep(400); };
  const toPlay = async () => { await E(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.state = 'play'; BK.manualSimulation = true; BK.sim(150); BK.step(2); })()`); };
  await goto();
  await sleep(1500); await shot('title');
  const items = await E('BK.ui.titleItems()'); await tapGame(items.indexOf('SETTINGS')); await sleep(400);
  await tapGame(5); await sleep(300); await shot('settings-touch-tab');
  const rows = await E('BK.ui.menuRows()'); const rb = n => 6 + rows.filter(r => r[0] !== '-' && r !== '@TABS' && r !== 'Back').indexOf(n);
  await tapGame(rb('Edit layout')); await sleep(400); await shot('edit-layout');
  const d0 = await E('BK.touch.debug()'); await E('BK.touch.endEdit()');
  void d0;
  await goto(); await toPlay();
  await E('BK.touch.tick(0.1)'); await E('BK.step(2)'); await shot('hud-play-idle');
  await down(1, 200, 280); await move(1, 270, 250); await E('BK.step(2)'); await shot('hud-play-stick-up-right');
  await move(1, 200, 340); await E('BK.step(2)'); await shot('hud-play-stick-down');
  await up(1);
  await E(`(() => { const P = BK.P; BK.props().push({ t: 'torchbracket', x: P.x, y: P.y }); BK.touch.tick(0.1); BK.touch.tick(0.1); BK.step(2); })()`); await shot('hud-play-action-button-TAKE');
  await E(`BK.touchVerbs.push(() => ({ verb: 'drink', key: 'talk' })); BK.touch.tick(0.1); BK.touch.tick(0.1); BK.step(2)`); await shot('hud-play-action-button-DRINK');
  await E('BK.SET.touchLeft = true; BK.touch.relayout(); BK.step(2)'); await shot('hud-play-left-handed'); await E('BK.SET.touchLeft = false; BK.touch.relayout()');
  await goto('&safe=8,44,21,44'); await toPlay(); await E('BK.step(2)'); await shot('hud-play-notch-insets');
  await goto(); await sleep(1200);
  const it2 = await E('BK.ui.titleItems()'), k = it2.findIndex(x => x === 'NEW GAME' || x === 'CHOOSE A SAVE'); await tapGame(k); await sleep(500); await shot('save-slots');
  await E(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.SET.godmode = true; BK.mapLook('wood'); })()`); await sleep(1200); await shot('map');
  await E('BK.ui.storeOpen("map", "heroes")'); await sleep(900); await shot('store');
} finally { await pg.close(); }
