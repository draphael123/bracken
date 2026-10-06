// tools/death-screen.mjs - THE DEATH SCREEN (claude/uiscreens, 2026-10-06). It was one 6 px line ("<FOE>  <blow>  RED: DODGE IT"). Now a card, and the check asks for its CONTENT:
//   1. TIMING     a death still starts the old 1.2 s clock (P.dead; the card sits on the same frames and the respawn is not held: the retry loop is the game's pace).
//   2. WHO + BLOW the killer's bestiary name and the name of the blow are drawn, under a YOU FELL headline.
//   3. THE TELL   the mark that warned you and the one thing that answers it: RED !! -> a dodge, YELLOW ! -> the shield, a piercing bolt -> a parry; a hazard says what to mind.
//   4. THE COST   the death cost is on the card (NOTHING DROPPED, or the DROPPED line), never blank.
//   5. THE RECAP  after the respawn a line under the timer says FELLED BY ... for a few seconds, then is gone.
//   6. SIZE       the headline is 12 px, the killer 8 px (the rest 6 px: the game's small hand); nothing is cut (tools/textfit.mjs 'death' measures the fit).
// usage: node tools/death-screen.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { tellOf } from '../src/death-card.js';

/* ---- the rules, no page ---- */
assert.match(tellOf({ name: 'X', red: true, rule: 'DODGE IT' }).long, /RED !! WARNED YOU: ONLY A DODGE/, 'a red blow says a dodge answers it');
assert.match(tellOf({ name: 'X', red: true, rule: 'DODGE IT' }, true).long, /BLUE !!/, 'and says BLUE in the colour-safe palette');
assert.match(tellOf({ name: 'X', red: false, rule: 'THE SHIELD TURNS IT' }).long, /YELLOW ! WARNED YOU: RAISE THE SHIELD/, 'a yellow blow says the shield');
assert.match(tellOf({ name: 'X', red: false, rule: 'PARRY IT' }).long, /PARRY/, 'a piercing blow says a parry');
assert.match(tellOf({ name: 'THE FALL', red: false, rule: '' }).long, /MIND THE EDGE/, 'a pit says to mind the edge');
assert.equal(tellOf({ name: 'SOMETHING ELSE', red: false, rule: '' }), null, 'a blow with no mark and no known hazard has no tell line (never a made-up one)');
console.log('ok  rules          the tell for red, yellow, piercing, a pit and the unknown');

const pg = await openPage({});
try {
  const R = await pg.evalp(`(async()=>{
    const {LEVELS}=await import('/src/level.js'); BK.manualSimulation=true; BK.setHero('knight'); BK.reset({fresh:true});
    BK.load(LEVELS.findIndex(l=>l.id==='welltown')); BK.state='play'; BK.sim(10); BK.god=false;
    const texts=()=>{window.__textRec=[]; BK.step(1); const r=window.__textRec.filter(t=>t.kind==='text'); window.__textRec=null; return r;};
    const out={};
    const kill=k=>{ BK.P.hp=BK.P.maxHp; BK.P.dead=0; BK.P.inv=0; BK.P.killer=null; BK.damagePlayer(BK.P.x, 99999, k); };
    const e=BK.enemies().find(e=>e.alive&&!e.mini);
    kill({who:e, blow:'THE SHIELD CHARGE', unblockable:true}); out.dead0=BK.P.dead; out.killer=BK.P.killer&&BK.P.killer.name;
    let frames=0; while(BK.P.dead>0.9&&frames<200){BK.sim(1);frames++;}
    let r=texts(); out.red=r.map(t=>t.s+'|'+t.size);
    let n=0; while(BK.P.dead>0&&n<300){BK.sim(1);n++;} out.deadFrames=frames+n;
    r=texts(); out.recap=r.map(t=>t.s); out.recapState=BK.ui.deathRecap&&BK.ui.deathRecap.k.name;
    for(const e of BK.enemies()) e.alive=false; BK.P.hp=BK.P.maxHp; BK.god=true; for(let i=0;i<230;i++)BK.step(1); out.recapGone=BK.ui.deathRecap?{t:BK.ui.deathRecap.t,dead:BK.P.dead,state:BK.state}:null;
    for(const [key,k] of [['yellow',{name:'BANDIT   THE CUT',red:false,rule:'THE SHIELD TURNS IT'}],['pierce',{name:'ARROW   THE BOLT',red:false,rule:'PARRY IT'}],['fall',{name:'THE FALL',red:false,rule:''}]]){
      BK.P.dead=0.5; BK.P.killer=k; out[key]=texts().map(t=>t.s); BK.P.dead=0; }
    return out; })()`);
  assert.ok(R.dead0 > 1.0 && R.dead0 <= 1.25, 'a death is still ~1.2 s long (was ' + R.dead0 + '): the card must not hold the respawn');
  assert.ok(R.deadFrames > 0 && R.deadFrames < 300, 'and the respawn comes (' + R.deadFrames + ' sim frames: the death has its own slow-motion, the card adds none)');
  console.log('ok  timing         the death lasts ' + R.dead0.toFixed(2) + ' s, ' + R.deadFrames + ' frames to the respawn');
  const has = (arr, re) => arr.some(s => re.test(s));
  assert.ok(has(R.red, /^YOU FELL\|12$/), 'the headline YOU FELL at 12 px: ' + R.red.join(' / '));
  assert.ok(R.killer && has(R.red, new RegExp('^' + R.killer.split('   ')[0].replace(/[^A-Z ]/g, '.') + '\\|8$')), 'the killer (' + R.killer + ') at 8 px: ' + R.red.join(' / '));
  assert.ok(R.killer.includes('   ') ? has(R.red, new RegExp(R.killer.split('   ')[1].replace(/[^A-Z ]/g, '.'))) : true, 'the name of the blow');
  assert.ok(has(R.red, /RED !! WARNED YOU: ONLY A DODGE TURNS IT/), 'the tell for a red blow: ' + R.red.join(' / '));
  assert.ok(has(R.red, /NOTHING DROPPED|DROPPED/), 'the cost line: ' + R.red.join(' / '));
  console.log('ok  content        YOU FELL / ' + R.killer + ' / the red tell / the cost');
  assert.ok(has(R.yellow, /YELLOW ! WARNED YOU: RAISE THE SHIELD/), 'yellow: ' + R.yellow.join(' / '));
  assert.ok(has(R.pierce, /PARRY/), 'piercing: ' + R.pierce.join(' / '));
  assert.ok(has(R.fall, /MIND THE EDGE/), 'a fall: ' + R.fall.join(' / '));
  console.log('ok  tells          yellow -> the shield, piercing -> a parry, a pit -> mind the edge');
  assert.ok(has(R.recap, /^FELLED BY /), 'the recap after the respawn: ' + R.recap.join(' / '));
  assert.equal(R.recapGone, null, 'and it is gone after its few seconds: ' + JSON.stringify(R.recapGone));
  console.log('ok  recap          "FELLED BY ..." after the respawn, gone after ~3 s');
  assert.deepEqual(pg.errors, [], 'no page errors');
  console.log('ok  console        no page errors');
} finally { await pg.close(); }
