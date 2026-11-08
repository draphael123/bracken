// tools/first5-play.mjs - a NEW PLAYER'S FIRST FIVE MINUTES on ?demo=1 with a fresh save (claude/first5): real keys through title -> new save -> hero pick -> opening, then the lesson walked station by station (stills at each),
// the inn, the map. node tools/first5-play.mjs <outDir>
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false, seed: 11, speed: false, hints: 'medium' }); const E = e => pg.evalp(e);
let n = 0;
const shot = async name => { await E('BK.draw1&&BK.draw1()').catch(() => {}); await sleep(150); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + String(++n).padStart(2, '0') + '-' + name + '.png', Buffer.from(r.data || r.result.data, 'base64')); console.log('shot', n, name); };
const key = async (k, code) => { for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); };
const info = async l => console.log(l, await E(`JSON.stringify({state:BK.state,lvl:BK.L&&BK.L.id,i:BK.lesson&&BK.lesson().O&&BK.lesson().O.st&&BK.lesson().O.st.i})`));
try {
  const origin = await E('location.origin');
  await pg.send('Page.navigate', { url: 'about:blank' }); await sleep(400); try { await pg.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' }); } catch (e) {}
  await pg.send('Page.navigate', { url: origin + '/?demo=1' });
  for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await sleep(250); }
  await sleep(2500);
  for (let i = 0; i < 7; i++) { await key('Enter', 13); await sleep(1100); }
  await info('lesson start');
  await E(`(async()=>{const {LEVELS,T}=await import('/src/level.js');window.__T=T;window.__p=()=>BK.players()[0];window.__O=()=>BK.lesson().O;
    window.__stand=(col,face)=>{const p=__p();p.x=col*16+8;p.y=20*16-0.01;p.vx=0;p.vy=0;p.face=face||1;p.ground=true;};
    window.__gateOpen=col=>{const L=BK.L;return L.grid[15*L.W+col]!==__T.PORT;};
    window.__walk=(toCol,maxF)=>{const K=BK.keys,p=__p();let jf=0;for(let f=0;f<maxF&&p.x<toCol*16;f++){K.right=true;const x=p.x;if(p.ground&&jf<=0){ if(x>=19*16-14&&x<19*16-4){jf=10;BK.press('jump');} else if(x>=23*16-10&&x<23*16+2){jf=16;BK.press('jump');} else if(x>=32*16-20&&x<32*16-8){jf=34;BK.press('jump');} }
      if(jf>0){K.jump=true;jf--;}else K.jump=false;BK.sim(1);}K.right=false;K.jump=false;};
    window.__rep=n=>{for(let i=0;i<n;i++){BK.press('atk');BK.sim(18);}};BK.manualSimulation=true;})()`);
  await E('BK.sim(60)'); await shot('lesson-move');
  await E('__walk(15,900)'); await E('BK.sim(20)'); await shot('lesson-jump');
  await E('__walk(27.6,1200)'); await E('BK.sim(20)'); await shot('lesson-high');
  await E('__walk(37,1500)'); await E('BK.sim(20)'); await shot('lesson-attack');
  await E('__stand(41,1);BK.sim(20);__rep(12);BK.sim(20)'); await shot('lesson-attack-done');
  await E('__stand(53,1);BK.sim(30)'); await shot('lesson-heavy');
  const strike = {
    heavy: `(()=>{BK.keys.atk=true;BK.sim(60);BK.keys.atk=false;BK.sim(40);})()`,
    rise: `(()=>{BK.keys.up=true;BK.press('atk');BK.sim(20);BK.keys.up=false;BK.sim(30);})()`,
    sweep: `(()=>{BK.keys.down=true;BK.press('atk');BK.sim(20);BK.keys.down=false;BK.sim(30);})()`,
    plunge: `(()=>{const p=__p();p.x=98*16+8-6;BK.press('jump');BK.sim(18);BK.keys.down=true;BK.press('atk');BK.sim(40);BK.keys.down=false;BK.sim(30);})()`,
  };
  const at = { heavy: 56, rise: 69, sweep: 82, plunge: 97 };
  for (const m of ['heavy', 'rise', 'sweep', 'plunge']) {
    await E(`__stand(${at[m]},1);BK.sim(25)`); if (m !== 'heavy') await shot('lesson-' + m);
    for (let k = 0; k < 6 && !(await E(`!!__O().st.done.${m}`)); k++) { await E(strike[m]); if (k === 0) await shot('lesson-' + m + '-strike'); }
    console.log(m, await E(`__O().st.done.${m}`), 'gateOpen', await E(`__gateOpen(${{ heavy: 63, rise: 75, sweep: 87, plunge: 101 }[m]})`));
  }
  await E('__stand(103,1);BK.sim(60)'); await shot('lesson-block');
  let blocked = false; for (let k = 0; k < 400 && !blocked; k++) { await E(`(()=>{const K=BK.keys,p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>p.x-40).sort((a,b)=>a.x-b.x)[0];K.block=!!(f&&Math.abs(f.x-p.x)<64&&(f.mode==='cutTell'||f.mode==='cut'));K.right=!!((f&&f.x-p.x>34&&p.x/16<113)||p.x/16<102.8);BK.sim(8);K.right=false;})()`); blocked = await E('__O().st.done.block!==undefined'); }
  await E('BK.keys.block=false'); console.log('block', blocked); await shot('lesson-block-done');
  await E('__stand(116,1);BK.sim(120)'); await shot('lesson-dodge');
  let dodged = false; for (let k = 0; k < 700 && !dodged; k++) { await E(`(()=>{const p=__p(),f=BK.enemies().filter(e=>e.t==='swornsword'&&e.x>116*16).sort((a,b)=>a.x-b.x)[0];if(f&&Math.abs(f.x-p.x)<70&&(f.mode==='cutTell'&&f.modeT<0.3||f.mode==='cut')){BK.keys.right=true;BK.press('dodge');BK.sim(2);BK.keys.right=false;}else if(f&&f.x-p.x>44){BK.keys.right=true;}BK.sim(3);BK.keys.right=false;})()`); dodged = await E('__O().st.done.dodge!==undefined'); }
  console.log('dodge', dodged);
  await E('__stand(130,1);BK.sim(80)'); await shot('lesson-flask');
  await E(`(()=>{BK.press('flask');BK.sim(150);})()`); await shot('lesson-flask-done');
  await E('__walk(144.4,600);BK.sim(30)'); await shot('lesson-shrine');
  await E('__stand(155,1);BK.sim(10)'); await shot('lesson-door');
  await E(`BK.press('talk')`); for (let i = 0; i < 500 && !(await E('!!(BK.L&&BK.L.tavern)')); i++) { await E('BK.sim(1)'); await sleep(5); }
  await E('BK.sim(60)'); await info('inn'); await shot('inn-card');
  console.log('PROG', await E('JSON.stringify(BK.lesson().PROG())'));
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { pg.close(); }
