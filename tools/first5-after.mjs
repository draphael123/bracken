// tools/first5-after.mjs - claude/first5: Lumber Trail with the first-run cards ON (saltForce: a headless page turns them off): the skills card after a calm stretch, then the level WON with XP owed:
// win card -> Z -> level-up explainer -> choice card -> map. Stills + state at each step. node tools/first5-after.mjs <outDir>
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11, speed: false, hints: 'medium' }); const E = e => pg.evalp(e);
let n = 0;
const shot = async name => { await E('BK.draw1&&BK.draw1()').catch(() => {}); await sleep(150); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + String(++n).padStart(2, '0') + '-' + name + '.png', Buffer.from(r.data || r.result.data, 'base64')); console.log('shot', n, name); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); };
const info = async l => console.log(l, await E(`JSON.stringify({state:BK.state,lvl:BK.L&&BK.L.id,teach:BK.teach().card&&BK.teach().card.id,q:BK.teach().q})`));
try {
  const origin = await E('location.origin');
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(400); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) {}
  await pg.send('Page.navigate', { url: origin + '/?demo=1' });
  for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await sleep(250); }
  await sleep(2500);
  for (let i = 0; i < 7; i++) { await key('Enter', 13); await sleep(1100); }
  await E('BK.manualSimulation=true;BK.saltForce=true;BK.sim(40)');
  await E(`BK.lesson().leave(true)`); for (let i = 0; i < 500 && !(await E('!!(BK.L&&BK.L.tavern)')); i++) { await E('BK.sim(1)'); await sleep(5); }
  await E('BK.sim(200)');
  await E(`(()=>{const p=BK.players()[0];p.x=36*16+8;p.vx=0;BK.sim(40);BK.press('talk');})()`);
  for (let i = 0; i < 400 && (await E('BK.state')) !== 'map'; i++) { await E('BK.sim(2)'); await sleep(5); }
  await E('BK.sim(60)'); await E(`BK.press('confirm');BK.sim(5)`);
  for (let i = 0; i < 600 && (await E('BK.state')) !== 'play'; i++) { await E('BK.sim(3)'); await sleep(5); }
  await E('BK.sim(120)'); await info('wood');
  for (let i = 0; i < 40 && !(await E('!!BK.teach().card')); i++) await E('BK.sim(30)');
  await info('card'); await E('BK.sim(70)'); await shot('wood-skills-card');
  await E('(()=>{for(let i=0;i<60;i++)BK.sim(1);BK.teachConfirm();BK.sim(5);})()'); await info('dismissed');
  // a flask card: hurt with a flask
  await E(`(()=>{const P=BK.players()[0];P.hp=P.maxHp*0.4;BK.sim(200);})()`); await info('hurt'); await shot('wood-hurt'); 
  // win with XP owed
  await E(`(()=>{BK.god=true;const P=BKT.PROG;P.xp=P.xp||{};P.xp.knight=(P.xp.knight||0)+120;BK.sim(5);})()`);
  await E('BK.coopSave.win();BK.sim(200)'); await info('won'); await shot('win-card');
  for (let i = 0; i < 8; i++) { await E('BK.sim(70)'); await E('BK.press("confirm");BK.sim(150)'); await info('confirm ' + (i + 1)); await shot('after-win-' + (i + 1)); if ((await E('BK.state')) === 'map') break; }
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
