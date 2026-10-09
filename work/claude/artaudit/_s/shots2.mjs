// node shots2.mjs <profile> [sections]  : map, settings, pause, hud, toast, boss, death, win, store, best
import { open, reboot, sleep } from './lib.mjs';
const profile = process.argv[2] || 'desktop', only = (process.argv[3] || '').split(',').filter(Boolean);
const want = s => !only.length || only.includes(s);
const h = await open(profile); const { E, shot } = h;
const snap = async (name, n = 30) => { await E(`BK.manualSimulation&&BK.state==='play'&&BK.step(0);BK.step(${n})`); await shot(name); };
const sec = async (name, fn) => { if (!want(name)) return; try { await fn(); } catch (e) { console.log('SECTION FAIL', name, e.message); } };
const freshJS = (hero = 'knight', xp = 0) => `const {xpFloor}=await import('/src/xp.js');const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});${xp ? `BKT.PROG.xp.${hero}=xpFloor(${xp});` : ''}BK.applyUpgrades&&BK.applyUpgrades();`;
const play = async (id, hero = 'knight', xp = 0, extra = '') => E(`(async()=>{${freshJS(hero, xp)}BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);${extra};BK.step(2);})()`);
const run = (n, god = true) => E(`(()=>{for(let i=0;i<${n};i++){${god ? 'BK.P.hp=BK.P.maxHp;' : ''}BK.sim(1)}BK.step(2)})()`);
try {
  await reboot(h); await E('BK.manualSimulation=true;BK.step(3)');
  await sec('map', async () => {
    await E(`(async()=>{${freshJS('knight', 20)}for(const l of LEVELS.slice(0,8)) BKT.PROG[l.id]={cleared:true,medal:2,silver:3};BKT.PROG.coins=120;BK.mapLook('wood');})()`);
    await snap('map-wood', 60);
    for (const id of ['welltown', 'canal', 'theatre']) { await E(`BK.mapLook('${id}')`); await snap('map-' + id, 60); }
    console.log('nodes', await E('JSON.stringify(BK.mapNodes().ids)'));
  });
  await sec('settings', async () => {
    await E(`(async()=>{${freshJS('knight', 20)}BK.state='title';BK.ui.openMenu('title');})()`);
    for (const t of ['audio', 'display', 'gameplay', 'controls', 'access']) {
      await E(`BK.ui.settingsTab=${JSON.stringify(t)};BK.ui.menuI=1;BK.step(2)`);
      const rows = JSON.parse(await E('JSON.stringify(BK.ui.menuRows())')); console.log(t, rows.length, 'rows');
      await snap('settings-' + t + '-top', 5);
      for (const [lab, i] of [['mid', Math.floor(rows.length / 2)], ['end', rows.length - 1]]) { await E(`BK.ui.menuI=${i};BK.step(3)`); await snap('settings-' + t + '-' + lab, 10); }
    }
  });
  await sec('pause', async () => {
    await play('welltown', 'knight', 30); await E('BK.ui.openMenu("play")'); await snap('pause', 10);
    await E(`BK.ui.menuI=14`); await snap('pause-bottom', 10);
  });
  await sec('hud', async () => {
    for (const id of ['welltown', 'redgorge', 'canal', 'theatre', 'reef']) {
      await play(id, 'knight', 40, 'BK.god=true'); await E(`(()=>{BK.P.hp=BK.P.maxHp*0.7})()`); await run(40, false);
      await snap('hud-' + id + '-full', 4);
      await E('BK.SET.hud="minimal";BK.step(3)'); await snap('hud-' + id + '-minimal', 3); await E('BK.SET.hud="full"');
    }
    await play('welltown', 'knight', 40, 'BK.god=true;BK.tp(70,29)'); await run(90); await snap('hud-welltown-shade', 3);
    await play('redgorge', 'knight', 40, 'BK.god=true'); await run(600); await snap('hud-redgorge-600', 3);
  });
  await sec('toast', async () => {
    await play('welltown', 'knight', 1, 'BK.xpStart()'); await run(8); await snap('toast-catchingup', 3); console.log('hint', await E('JSON.stringify(BK.hint)'));
    await play('welltown','knight',1,'BK.xpStart();BK.SET.hud="minimal"'); await snap('toast-catchingup-minimal-hud', 3); await E('BK.SET.hud="full"');
    await play('wood', 'knight', 0, 'BK.xpStart()'); await run(60); await snap('toast-first-wood-hint', 3);
    await E('BK.gainXp(900);BK.step(10)'); await snap('toast-xp-gain', 20);
  });
  await sec('boss', async () => {
    for (const mode of ['bar', 'pct', 'num', 'both']) {
      await play('welltown', 'knight', 40, 'BK.god=true'); await E(`(()=>{BK.SET.bossHp='${mode}';for(const e of BK.enemies()) if(!e.mini&&e!==BK.boss)e.alive=false;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+3,Math.round(A.floor/16)-1)})()`); await run(260);
      await E('(()=>{const b=BK.boss;if(b)b.hp=b.maxHp*0.62;BK.step(3)})()'); await snap('boss-welltown-' + mode, 3);
    }
    await play('redgorge', 'knight', 40, 'BK.god=true'); await E(`(()=>{BK.SET.bossHp='both';const A=BK.L.arena;if(A)BK.tp(Math.round(A.trigger/16)+3,Math.round(A.floor/16)-1)})()`); await run(260); await snap('boss-redgorge-both', 3);
    await play('welltown', 'knight', 40, 'BK.god=true'); await E(`(()=>{BK.SET.bossHp='both';const M=BK.L.mini;for(const e of BK.enemies()) if(e.t!=='gangleader')e.alive=false;BK.tp(Math.round(M.trigger/16)+2,Math.round(M.floor/16)-1)})()`); await run(120); await snap('boss-mini-gangleader-both', 3);
  });
  await sec('death', async () => {
    await play('welltown', 'knight', 40, '');
    console.log('dmg keys', await E(`Object.keys(BK).filter(k=>/hurt|dam|kill|die|dead/i.test(k)).join()`));
    await E(`(()=>{const e=BK.enemies().find(e=>e.alive&&!e.mini);BK.damagePlayer(e.x,9999,{who:e,blow:'shield charge',unblockable:true})})()`); console.log('dead?', await E('BK.P.dead'));
    for (const n of [15, 30, 30, 40]) { await E(`BK.sim(${n})`); await snap('death-' + n + '-' + Math.random().toString(36).slice(2,4), 2); }
    await E('(()=>{for(let i=0;i<400&&BK.state==="play";i++)BK.sim(1);BK.step(2)})()'); console.log('state after death', await E('BK.state')); await snap('death-after', 60);
  });
  await sec('win', async () => {
    await play('welltown', 'knight', 40, 'BK.god=true'); await E('BK.xpWin();BK.step(5)'); for (const n of [40,120,200,300]) { await E(`(()=>{for(let i=0;i<${n};i++)BK.step(1)})()`); await snap('win-'+n, 1); }
  });
  await sec('store', async () => {
    await E(`(async()=>{${freshJS('knight', 20)}BKT.PROG.coins=400;BK.load(0);BK.state='map';})()`);
    for (let t = 0; t < 6; t++) { await E(`BK.ui.storeOpen('map',undefined);BK.ui.storeTab=${t};BK.step(2)`); await snap('store-tab' + t, 20); }
  });
  await sec('best', async () => {
    await E(`(async()=>{${freshJS('knight', 20)}BK.load(0);BK.state='bestiary';})()`); await snap('bestiary-0', 20);
    await E('BK.ui.bestTab=1'); await snap('bestiary-tab1', 10); await E('BK.ui.bestI=5'); await snap('bestiary-i5', 10);
  });
} finally { await h.pg.close(); }
