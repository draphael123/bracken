// tools/heart-scenes-shots.mjs - WALKS THE LAB ROAD and shoots the key frames (lane SC SCENES, claude/scenes). ONE headless Chrome (tools/cdp.mjs), simulated frames.
//   node tools/heart-scenes-shots.mjs [--reduce] [--seats=3]   ->  scratch/lane-reports/scenes-*.png  (SHOTS=<dir> to move them)
// The road: drakelab (the drake spared through the game's own hurtEnemy -> BEATEN -> the clear is credited) -> SCENE A (sealed row, shots) -> skylab loads (the checkpoint: mount-up) -> a death restarts the
// fight (checked) -> the King is knocked down (his last return) -> SCENE B (shots, the card) -> the MAP. Then a replay: both rows with transSeen set must still carry the road (forceSkip), ending at skylab / the map.
// Prints the state at each step; exit 1 if the road breaks.
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports'); mkdirSync(OUT, { recursive: true });
const REDUCE = process.argv.includes('--reduce'), SEATS = +((process.argv.find(a => a.startsWith('--seats=')) || '--seats=1').slice(8));
const tag = (REDUCE ? 'r' : '') + (SEATS > 1 ? 's' + SEATS : '');
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = (e, t) => pg.evalp(e, t || 600000);
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const shot = async n => { await E('BK.draw1()'); await new Promise(r => setTimeout(r, 120)); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'scenes-' + (tag ? tag + '-' : '') + n + '.png'), Buffer.from(r.result.data, 'base64')); };
const S = () => E(`(()=>{const t=BK.trans.tr;return t?{state:BK.state,scene:t.entry.scene,beat:BK.trans.TRM.phase(t.tl),pt:+t.tl.pt.toFixed(2),t:+t.tl.t.toFixed(2),skipped:t.tl.skipped,done:t.tl.done,sceneFlag:t.scene}:{state:BK.state,level:BK.trans.levelId()};})()`);
const until = async (pred, what, max = 3000) => { for (let i = 0; i < max; i++) { const s = await S(); if (pred(s)) return s; await E('(()=>{BK.sim(6);})()'); } ok(false, 'timeout: ' + what); return await S(); };
const simTo = async (sec, key) => { for (let i = 0; i < 400; i++) { const s = await S(); if (!s.scene || s.t >= sec) return s; await E('(()=>{BK.sim(' + (s.t + 0.5 < sec ? 6 : 1) + ');})()'); } };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__LV=id=>LEVELS.findIndex(l=>l.id===id);BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.applyUpgrades();
    delete BK.PROG.transSeen; BK.SET.transitions='first'; BK.SET.reduceMotion=${REDUCE}; BK.trans.force(true); BK.load(__LV('drakelab'));BK.start();BK.god=true;BK.sim(10);
    ${SEATS > 1 ? `BK.coopStart('warden', false, ${SEATS > 2 ? "[{ hero: 'pyro' }, { hero: 'knight' }]" : 'undefined'}); BK.sim(4);` : ''} })()`);
  // wake the drake and put it at the verge of the end
  await E(`(()=>{const p=BK.players()[0];p.x=19*16;p.y=17*16+15.99;p.vx=0;p.vy=0;p.ground=true;p.face=1;BK.sim(40);p.x=25*16;BK.sim(200);})()`);
  await E(`(()=>{const b=BK.enemies().find(e=>e.t==='firedrake');b.hp=40;BK.players().forEach(p=>{p.inv=99;});for(let i=0;i<4;i++)BKT.hurtEnemy(b,99999,b.x-10,false);})()`);
  let s = await until(x => x.scene === 'seal', 'scene A begins (the drake beaten, the clear credited)', 4000);
  ok(s.scene === 'seal' && s.sceneFlag === true, 'scene A began on its own off the drake\'s defeat: ' + JSON.stringify(s));
  const cleared = await E(`!!(BK.PROG.drakelab&&BK.PROG.drakelab.cleared)`); ok(cleared, 'the drake\'s clear was CREDITED before the scene');
  for (const [n, t] of [['a0-lies', 0.9], ['a1-light', 2.4], ['a2-fire', 4.3], ['a3-king', 5.2], ['a4-erupt', 6.4], ['a5-stir', 7.6], ['a6-kneel', 8.6], ['a7-climb', 9.2], ['a8-takeoff', 10.6]]) { await simTo(t); await shot(n); }
  s = await until(x => x.level === 'skylab' && x.state !== 'win', 'the sky fight loads', 4000); ok(s.level === 'skylab', 'scene A ended in the SKY FIGHT (skylab): ' + JSON.stringify(s));
  await E('(()=>{BK.sim(60);})()'); await shot('a9-mounted');
  const f0 = await E(`(()=>{const f=BK.demonKing&&BK.demonKing.f();return f?{ph:f.ph,hp:f.hp,bar:f.bar,mode:f.mode}:null;})()`); ok(!!f0 && f0.ph === 1, 'the sky fight is fresh at mount-up: ' + JSON.stringify(f0));
  // the checkpoint: hurt the King, kill the hero, the fight restarts at mount-up
  await E(`(()=>{BK.demonKing.f().hp=1500;BK.sim(2);})()`); const f1 = await E(`Math.round(BK.demonKing.f().hp)`);
  await E(`(()=>{BK.god=false;const p=BK.players()[0];p.inv=0;p.hp=1;BKT.damagePlayer(p.x-10,9999,{});BK.sim(2);})()`);
  await E(`(()=>{for(let i=0;i<60&&BK.P.dead;i++)BK.sim(10);BK.sim(40);BK.god=true;})()`);
  const f2 = await E(`(()=>{const f=BK.demonKing&&BK.demonKing.f();return f?{ph:f.ph,hp:f.hp,bar:f.bar,mode:f.mode}:null;})()`); console.log('after the death: phase', f1, '->', JSON.stringify(f2));
  ok(f1 < 1600 && !!f2 && f2.ph === 1 && f2.hp === 3 * f2.bar, 'a death in the sky fight RESTARTS it at mount-up (King at ' + f1 + ' hp -> fresh phase 1, full bars)');
  // the end of the sky fight: his last return
  await E(`(()=>{BK.players().forEach(p=>{p.inv=99;});const f=BK.demonKing.f();f.ph=3;f.hp=f.bar;f.mode='downed';f.mT=0;f.T=99;BKT.dkTake&&BKT.dkTake(f);})()`);
  await E(`(async()=>{const DKM=await import('/src/demon-king.js');const f=BK.demonKing.f();DKM.take(f,1e9,DKM.DK.returnTag);BK.sim(20);})()`);
  s = await until(x => x.scene === 'escape', 'scene B begins (the King knocked down, the clear credited)', 3000); ok(s.scene === 'escape', 'scene B began on its own after the King\'s fall: ' + JSON.stringify(s));
  for (const [n, t] of [['b0-neck', 0.8], ['b1-run', 2.0], ['b2-twist', 3.2], ['b3-blast', 4.0], ['b4-flung', 4.9], ['b5-wings', 6.2], ['b6-pan', 7.4], ['b7-dive', 8.2], ['b8-crack', 9.3], ['b9-glide', 10.8], ['b10-land', 12.6], ['b11-stepoff', 13.3], ['b12-card', 15.5]]) { await simTo(t); await shot(n); }
  s = await until(x => !x.scene && x.state !== 'win', 'scene B ends', 4000);
  const end = await E(`({state:BK.state,trn:!!BK.trans.tr,level:BK.trans.levelId()})`); ok(end.state === 'map' && !end.trn, 'scene B ended ON THE MAP, nothing auto-loaded: ' + JSON.stringify(end));
  await E('(()=>{for(let i=0;i<20;i++)BK.sim(1);})()'); await shot('b11-map');
  // REPLAY: seen -> the pictures are dropped, the road holds
  await E(`(async()=>{BK.PROG.transSeen={'drakelab>skylab':1,'skylab>breach':1};BK.load(__LV('drakelab'));BK.start();BK.god=true;BK.sim(10);
    const p=BK.players()[0];p.x=19*16;p.y=17*16+15.99;p.vx=0;p.vy=0;p.ground=true;BK.sim(40);p.x=25*16;BK.sim(200);
    const b=BK.enemies().find(e=>e.t==='firedrake');b.hp=40;BK.players().forEach(p=>{p.inv=99;});for(let i=0;i<4;i++)BKT.hurtEnemy(b,99999,b.x-10,false);})()`);
  s = await until(x => x.level === 'skylab' && x.state === 'play', 'REPLAY: drakelab -> skylab with no pictures', 5000); ok(s.level === 'skylab', 'REPLAY A: straight to the sky fight: ' + JSON.stringify(s));
  const seenA = await E(`JSON.stringify(BK.PROG.transSeen)`); console.log('transSeen', seenA);
  await E(`(async()=>{const DKM=await import('/src/demon-king.js');BK.players().forEach(p=>{p.inv=99;});BK.sim(40);const f=BK.demonKing.f();f.ph=3;f.hp=f.bar;f.mode='downed';f.mT=0;f.T=99;DKM.take(f,1e9,DKM.DK.returnTag);BK.sim(20);})()`);
  s = await until(x => x.state === 'map', 'REPLAY B: the map', 4000); ok(s.state === 'map', 'REPLAY B: the fall of the King goes straight to the MAP (no pictures): ' + JSON.stringify(s));
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 6) : 'none'); if (pg.errors.length) bad++;
} catch (e) { console.log('ERR', e && e.message); bad++; } finally { pg.close(); }
process.exit(bad ? 1 : 0);
