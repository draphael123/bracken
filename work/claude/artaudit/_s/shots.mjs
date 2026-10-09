// node shots.mjs <profile> [sections,comma]   profile: desktop | phone | phone-portrait
import { open, reboot, sleep } from './lib.mjs';
const profile = process.argv[2] || 'desktop', only = (process.argv[3] || '').split(',').filter(Boolean);
const want = s => !only.length || only.includes(s);
const h = await open(profile); const { E, shot } = h;
const snap = async (name, n = 30) => { await E(`BK.step(${n})`); await shot(name); };
const sec = async (name, fn) => { if (!want(name)) return; try { await fn(); } catch (e) { console.log('SECTION FAIL', name, e.message); } };
const key = k => E(`(()=>{dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)}}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:${JSON.stringify(k)}}));BK.step(1);})()`);
const levelPlay = async (id, o = '') => E(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.load(LEVELS.findIndex(l=>l.id==='${id}'));BK.state='play';BK.sim(10);${o};BK.step(2);})()`);
const fresh = async (hero = 'knight', xp = 0) => E(`(async()=>{const {xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});${xp ? `BKT.PROG.xp.${hero}=xpFloor(${xp});` : ''}BK.applyUpgrades&&BK.applyUpgrades();})()`);
try {
  await sec('boot', async () => {
    // mid-boot, slow: capture the page while loading (noWait page)
    const hb = await open(profile, { noWait: true, fonts: true });
    await hb.pg.send('Page.navigate', { url: 'http://localhost:' + hb.pg.PORT + '/?' + (hb.phone ? 'touch=1&' : '') + 'nosw=1&boot=' + Date.now() });
    let i = 0, ready = false;
    for (const t of [150, 500, 1000, 2000, 3500, 5500, 8000, 12000]) { await sleep(t - (i ? [150, 500, 1000, 2000, 3500, 5500, 8000, 12000][i - 1] : 0)); ready = await hb.E('typeof window.BK==="object"&&!!window.BK.lookPass', 2000).catch(() => false); await hb.shot('boot-' + String(i++).padStart(2, '0') + '-' + t + 'ms' + (ready ? '-READY' : '')); }
    console.log('boot texts', await hb.E('JSON.stringify({boot:(document.getElementById("boot")||{}).textContent, ls:window.BKLoad&&BKLoad.state&&{shown:BKLoad.state.shown,t:BKLoad.state.true}})', 3000).catch(e => e.message));
    await hb.pg.close();
    // forced dev message: block main.js for 9 s
    const hd = await open(profile, { noWait: true });
    await hd.pg.send('Network.enable'); await hd.pg.send('Network.setBlockedURLs', { urls: ['*/src/main.js'] });
    await hd.pg.send('Page.navigate', { url: 'http://localhost:' + hd.pg.PORT + '/?nosw=1&dev=' + Date.now() }); await sleep(9500);
    await hd.shot('boot-dev-message-8s'); console.log('dev text', await hd.E('document.getElementById("boot")&&document.getElementById("boot").textContent', 3000).catch(e => e.message)); await hd.pg.close();
  });
  await reboot(h); await E('BK.manualSimulation=true');
  await sec('title', async () => {
    await E('BK.step(2)'); await shot('title-noaudio-banner');   // before any key: PRESS A KEY FOR SOUND banner?
    await h.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 }); await h.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 });
    await snap('title-after-key', 60);
    await E(`BK.ui.titleI=1`); await key('Enter'); await snap('saves', 20);
    console.log('state after enter', await E('BK.state'));
    await key('Escape'); await E('BK.state="title"'); await E('BK.ui.titleI=6'); await key('Enter'); await snap('controls-page', 10); console.log('state', await E('BK.state'));
    await E('BK.state="title"'); await E(`BK.ui.titleI=7`); await key('Enter'); await snap('credits-1', 20);
    for (let p = 2; p <= 4; p++) { await key('ArrowRight'); await snap('credits-' + p, 20); }
    await E('BK.state="title"'); await E(`BK.ui.titleI=5`); await key('Enter'); await snap('sound-test', 10);
    await E('BK.state="title"'); await E(`BK.ui.titleI=3`); await key('Enter'); await snap('practice', 10);
    await E('BK.state="title"'); await E(`BK.ui.titleI=2`); await key('Enter'); await snap('coop-pick', 10);
  });
  await sec('hero', async () => {
    await E('localStorage.clear()'); await reboot(h); await E('BK.manualSimulation=true;BK.step(5)');
    await E('BK.ui.titleI=1'); await key('Enter'); await E('BK.ui.slotI=1'); await key('z'); await snap('heropick-knight', 60);
    await key('ArrowRight'); await snap('heropick-warden', 40); await E('BK.ui.heroPickI=3'); await snap('heropick-pyro', 40);
    await key('z'); await snap('hero-trial-prompt', 60); await key('x'); await snap('after-straight-to-map', 90);
  });
  await sec('playnoaudio', async () => {
    await reboot(h, '&noaudio=1'); await E('BK.manualSimulation=true'); await levelPlay('wood'); await E('(()=>{for(let i=0;i<60;i++)BK.sim(1)})()'); await snap('play-first-wood-banner', 3);
  });
} finally { await h.pg.close(); }
