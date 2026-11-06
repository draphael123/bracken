// tools/pvp-duel-flow.mjs - DUEL (BETA) end-to-end in the real page (claude/proof146b). Not in the suite. usage: PORT=8681 node tools/pvp-duel-flow.mjs <outdir>
//   title DUEL (BETA) row -> the inn with the card up -> FIGHT (bot) -> hand-played rounds (P1 on BK.press/keys) -> rankings -> winner screen -> E back to the inn at the pit; stills + self-hit stats + console errors
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
const R = {};
const out = resolve(process.argv[2] || 'duelflow'); mkdirSync(out, { recursive: true });
const pg = await openPage({ duelBeta: true, audio: false, fonts: false }); const sleep = ms => new Promise(r => setTimeout(r, ms)); const E = (e, t) => pg.evalp(e, t || 120000);
const key = async (k, code) => { await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code }); await sleep(60); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code }); await sleep(250); };
const ec = () => pg.errors.length; const shot = async name => { R.ec = R.ec || {}; R.ec[name] = ec(); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(out, name + '.png'), Buffer.from(r.result.data, 'base64')); };
const buf = async name => { R.ec = R.ec || {}; R.ec[name] = ec(); const d = await E(`(()=>{BK.step&&BK.step(1);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');})()`); writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); };

try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?nosw' }); await sleep(1500);
  for (let i = 0; i < 160 && !(await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)); i++) await sleep(300);
  await sleep(1500); await key('x', 'KeyX'); await sleep(2500);
  await E('(()=>{const o=CanvasRenderingContext2D.prototype.drawImage;window.__bad=[];CanvasRenderingContext2D.prototype.drawImage=function(im,...a){if(im==null||im===undefined){window.__bad.push({st:BK.state,pk:Object.keys(BK.PROP).length,id:BK.L&&BK.L.id,ent:BK.L&&BK.L.entities&&BK.L.entities.length,inst:new Error().stack.split(String.fromCharCode(10))[2].slice(-30),t:Math.round(performance.now()),duel:BK.duel().debug().on});}return o.call(this,im,...a);};return 1})()'); R.titleItems = await E('BK.ui.titleItems()'); R.titleState = await E('BK.state'); await shot('1-title');
  const idx = R.titleItems.indexOf('DUEL (BETA)'); R.duelRowIdx = idx;
  for (let i = 0; i < idx; i++) await key('ArrowDown', 'ArrowDown');
  await shot('2-title-on-duel'); await key('x', 'KeyX'); await sleep(2500);
  R.ecAfterTitleX = ec(); R.afterTitle = await E('({st:BK.state,lvl:BK.L&&BK.L.id,card:BK.duel().debug().card,ships:BK.duel().ships})'); await shot('3-inn-card');
  /* the card: FIGHT (row 0) with one human -> a bot of the picked hero */
  R.ecBeforeFight = ec(); await key(' ', 'Space'); await sleep(2500); R.ecAfterFight = ec();
  R.entered = await E('({st:BK.state,on:BK.duel().debug().on,seats:BK.duel().debug().seats.map(s=>s.hero+(s.bot?"(bot)":"")),lvl:BK.L&&BK.L.id})'); await shot('4-fight-start');
  R.propAtStart = await E('(()=>{const P=BK.PROP;return {n:Object.keys(P).length,heart:!!P.heart,torch:!!P.torch,carpet:!!P.carpet}})()'); await sleep(20000); R.errsBeforeManual = ec(); await E('BK.manualSimulation=true;1');
  /* hand play: P1 walks at the foe and strikes, blocks now and then, until the match is over (cap 6 min sim) */
  const play = async (tag) => {
    let f = 0, shots = 0, lastRound = 0, cap = 6 * 60 * 60;
    while (f < cap) {
      const s = await E(`(()=>{const D=BK.duel().debug();if(!D.m||D.m.phase==='over')return {over:true,m:D.m};const [a,b]=D.seats;const dx=b.x-a.x;const K=BK.keys;K.left=K.right=K.atk=K.block=false;
        if(Math.abs(dx)>22){K[dx>0?'right':'left']=true;}else{BK.press('atk');}
        if(Math.floor(performance.now()/1000)%5===0)K.block=true;
        BK.sim(6);return {over:false,ph:D.m.phase,round:D.m.log.length,hp:D.seats.map(q=>q.hp),clock:D.m.clock};})()`);
      f += 6; if (s.over) break;
      if (s.round !== lastRound) { lastRound = s.round; if (shots < 3) { await buf('5-round-' + s.round + '-banner'); shots++; } }
      if (f === 600) await buf('5-mid-fight-hud');
    }
  };
  await play('m1');
  R.rounds = await E('BK.duel().debug().m.log'); R.winner = await E('BK.duel().debug().m.winner'); await E('BK.sim(40);1'); await buf('6-winner-screen');
  R.stats = await E('BK.duel().debug().stats');
  R.m1Result = await E('BK.duel().debug().result');
  await E('BK.press("jump");BK.sim(90);1'); R.rematch = await E('(()=>{const d=BK.duel().debug();return {phase:d.m&&d.m.phase,round:d.m&&d.m.round,log:d.m&&d.m.log.length,hp:d.seats.map(s=>s.hp)}})()'); await buf('6b-rematch-count'); await play('m2'); R.m2Result = await E('BK.duel().debug().result'); await E('BK.sim(40);1'); await buf('6c-winner-screen-2');
   R.seatsEnd = await E('BK.duel().debug().seats');
  R.rankings = await E('(()=>{try{return localStorage.getItem("bracken.duelRanks")}catch(e){return "n/a"}})()');
  /* back to the inn at the pit: E */
  await E('BK.manualSimulation=false;BK.press("talk");1'); await sleep(3000); R.errAfterLeave = ec(); R.prop = await E('(()=>{const P=BK.PROP;return {n:Object.keys(P).length,heart:!!P.heart,torch:!!P.torch,carpet:!!P.carpet}})()'); R.propAtStart = R.propAtStart; R.back = await E('({st:BK.state,on:BK.duel().debug().on,lvl:BK.L&&BK.L.id,px:Math.round(BK.P.x),pitX:(BK.tavern.debug().stations.find(s=>s.id==="arena")||{}).x,card:BK.duel().debug().card})'); await buf('7-back-in-inn');
  R.bad = await E('window.__bad'); R.errors = pg.errors.length; R.errs = pg.errors.slice(0, 3).map(e => String(e).slice(0, 1400));
  console.log(JSON.stringify(R, null, 1));
} finally { await pg.close(); }
