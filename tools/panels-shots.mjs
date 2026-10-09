// tools/panels-shots.mjs - pictures of every panel (claude/panels, PANEL-SHAPES). Not in the suite.
// usage: PORT=<free port> node tools/panels-shots.mjs <worktree> <outdir>      (run once on the base tree, once on this one)
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const WT = process.argv[2], OUT = process.argv[3] + '/'; mkdirSync(OUT, { recursive: true });
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
const pg = await openPage({ audio: false });
const E = (e, t = 120000) => pg.evalp(e, t);
const shot = async n => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + n + '.png', Buffer.from(r.result.data, 'base64')); console.log('wrote', n); };
const snap = async (n, k = 20) => { await E(`BK.step(${k}); 0`); await shot(n); };
const only = (process.env.SECS || '').split(',').filter(Boolean);
const sec = async (n, f) => { if (only.length && !only.includes(n)) return; try { await E(`BK.state='title';BK.step(2);0`); await f(); } catch (e) { console.log('FAIL', n, e.message); } };
const fresh = (xp = 0) => `const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.ui.pressCard=false;`;
try {
  await E('BK.manualSimulation=true;BK.step(5);0');
  await sec('title', async () => { await E(`BK.reset({fresh:true});BK.ui.pressCard=false;BK.state='title';BK.step(150);0`); await shot('title');
    const has = await E(`BK.ui.titleItems().includes('OPTIONS')`); if (has) { await E(`BK.ui.titleI=BK.ui.titleItems().indexOf('OPTIONS');BK.press('confirm');BK.step(20);0`); await shot('title-options'); await E(`BK.press('pause');BK.step(3);0`); } });
  await sec('saves', async () => { await E(`BK.state='slots';BK.ui.slotI=0;0`); await snap('saves'); });
  await sec('erase', async () => { await E(`BK.state='slots';BK.ui.slotI=0;BK.ui.eraseAsk=0;0`); await snap('erase'); await E(`BK.ui.eraseAsk=-1;0`); });
  await sec('pause', async () => { await E(`(async()=>{${fresh()}BK.load(0);BK.state='play';BK.sim(10);BK.ui.openMenu('play');})()`); await snap('pause', 40); });
  await sec('settings', async () => { await E(`BK.state='title';BK.ui.menuKind='settings';BK.state='menu';0`); await snap('settings', 12); });
  await sec('store', async () => { await E(`(async()=>{${fresh()}BKT.PROG.coins=400;BK.load(0);BK.state='map';})()`); await E('BK.ui.storeOpen("map",undefined);BK.ui.storeTab=1;BK.step(2);0'); await snap('store', 20); });
  await sec('bestiary', async () => { await E(`BK.state='bestiary';BK.ui.bestTab=0;BK.ui.bestI=2;0`); await snap('bestiary', 20); });
  await sec('credits', async () => { await E(`BK.creditsPage=0;BK.state='credits';0`); await snap('credits', 20); });
  await sec('soundtest', async () => { await E(`BK.state='soundtest';BK.soundCat=1;BK.soundI=0;0`); await snap('soundtest', 20); });
  await sec('controls', async () => { await E(`BK.state='controls';0`); await snap('controls', 8); });
  await sec('practice', async () => { await E(`BK.state='practice';BK.ui.practiceI=1;0`); await snap('practice', 20); });
  await sec('herocard', async () => { await E(`(async()=>{${fresh()}BK.load(0);BK.state='herocard';})()`); await snap('herocard', 20); });
  await sec('win', async () => { await E(`(async()=>{${fresh()}const idx=LEVELS.findIndex(l=>l.id==='welltown');BK.load(idx);BK.state='play';BK.sim(10);BK.god=true;BK.xpWin();for(let i=0;i<240;i++)BK.step(1);})()`); await snap('level-complete', 20); });
  await sec('death', async () => { await E(`(async()=>{${fresh()}BK.load(LEVELS.findIndex(l=>l.id==='welltown'));BK.state='play';BK.sim(150);BK.god=false;const e=BK.enemies().find(e=>e.alive&&!e.mini);BK.P.hp=BK.P.maxHp;BK.P.dead=0;BK.P.inv=0;BK.P.killer=null;BK.damagePlayer(BK.P.x,99999,{who:e,blow:'THE SHIELD CHARGE',unblockable:true});let f=0;while(BK.P.dead>0.9&&f<200){BK.sim(1);f++;}BK.P.dead=0.6;})()`); await snap('death', 3); });
  await sec('talk', async () => { await E(`(async()=>{${fresh()}BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.state='play';BK.sim(10);BK.god=true;const TL=BK.textLab;const t=TL.talkers().find(t=>/sign/i.test(t.kind))||TL.talkers()[0];TL.talk(t.lines.filter(Boolean),t.name);})()`); await snap('talk', 10); });
  await sec('mapcard', async () => { await E(`(async()=>{${fresh()}BKT.PROG.coins=100;BK.load(0);BK.state='map';BK.step(30);BK.mapLook('welltown');})()`); await snap('mapcard', 40); });
  await sec('pausemap', async () => { await E(`(async()=>{${fresh()}BK.load(0);BK.state='play';BK.sim(10);BK.ui.openMenu('play');BK.ui.mapOpen();})()`); await snap('pausemap', 20); });
  await sec('bossjump', async () => { await E(`BK.state='bossjump';0`); await snap('bossjump', 12); });
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { await pg.close(); }
