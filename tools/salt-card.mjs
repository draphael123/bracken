// PAGE TOOL: launches headless Chrome
// tools/salt-card.mjs - THE FIRST-DEATH CARD (claude/onboard1, Daniel 11-06).
//   A save's FIRST death that drops something is followed, after the respawn, by ONE card (src/salt-card.js): what was dropped, where it lies,
//   how to get it back, what a second death does. Dismissed with the confirm key (not before ARM_S). Once per save (PROG.deathCost.card).
//   NOTHING     a first death that carries nothing shows no card (and does not use the save's one card up)
//   CARD        the first death with a carry: the card is up after the respawn, the world holds still, and its words say the amount and the place
//   KEY         a mashed key inside ARM_S does not skip it; the confirm key after it does; the flag is in the save
//   ONCE        the next death shows no card; the hint line speaks again as before
//   SAVE        the flag survives normalizeDeathCost (a save that has seen the card keeps it)
// usage: node tools/salt-card.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { normalizeDeathCost } from '../src/death-cost.js';
import { amountOf, whereLine, ARM_S } from '../src/salt-card.js';

{ const p = { xp: { knight: 10 }, coins: 5, deathCost: { v: 1, carried: { xp: {}, purse: 0 }, bundle: null, card: 1 } }; normalizeDeathCost(p); assert.equal(p.deathCost.card, 1, 'the flag survives the save normalizer');
  const q = { xp: {}, coins: 0 }; normalizeDeathCost(q); assert.equal(q.deathCost.card, undefined, 'a save that has not seen it has no flag'); }
assert.equal(amountOf({ coins: 3, purse: 4, xp: 60 }), '7 GOLD AND 60 XP'); assert.equal(amountOf({ coins: 0, purse: 0, xp: 5 }), '5 XP');
assert.ok(whereLine({ where: 'foe', name: 'BANDIT' })[0].includes('BANDIT')); assert.ok(whereLine({ where: 'door' })[0].includes('ARENA DOOR')); assert.ok(whereLine({ where: 'spot', fell: true })[0].includes('WHERE YOU FELL'));

const pg = await openPage({ audio: false, fonts: false }); const fails = [], out = {};
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js'),SC=await import('/src/salt-card.js');BK.manualSimulation=true;BK.saltForce=true;const fails=[],out={};
const W=id=>LEVELS.findIndex(l=>l.id===id),dc=BK.dc;
const fresh=(id,h)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h||'knight');BK.reset({fresh:true});BKT.PROG.xp[h||'knight']=BKT.PROG.xp[h||'knight']||0;BK.load(W(id));BK.start();BK.god=false;BK.sim(20);};
const coin=()=>{const q=BK.players()[0];BK.acorns().push({x:q.x,y:q.y-7,got:false,ph:0});BK.sim(1);};
const hit=()=>{const q=BK.players()[0];q.inv=0;q.hurt=0;dc.hit(0,null);};
const respawn=()=>{for(let i=0;i<200&&BK.P.dead>0;i++)BK.sim(1);BK.sim(2);};
fresh('wood');
/* NOTHING */ hit();respawn();if(BK.saltCard())fails.push('a first death with nothing carried showed the card');if(BKT.PROG.deathCost.card)fails.push('and used the one card up');
/* CARD */ fresh('wood');for(let i=0;i<4;i++)coin();BK.gainXp(40);hit();BK.sim(1);if(!BK.saltPend())fails.push('no card owed after a first drop');respawn();
const c=BK.saltCard();if(!c)fails.push('no card after the respawn');else{out.info=c.info;out.words=SC.lines(c.info,s=>s.length*6,240).map(l=>l[0]);
 const x0=BK.P.x;for(let i=0;i<30;i++)BK.sim(1);if(Math.abs(BK.P.x-x0)>0.01)fails.push('the world moved under the card');
 BK.saltConfirm();BK.sim(1);if(!BK.saltCard())fails.push('a press inside ARM_S dismissed the card');}
if(!BKT.PROG.deathCost.card)fails.push('the save has no card flag');
for(let i=0;i<70;i++)BK.sim(1);BK.saltConfirm();BK.sim(1);if(BK.saltCard())fails.push('the confirm key did not dismiss the card');
/* ONCE */ for(let i=0;i<5;i++)coin();hit();BK.sim(1);if(BK.saltPend())fails.push('a second drop owed the card again');respawn();if(BK.saltCard())fails.push('a second death showed the card');
return {fails,out};})()`);
  fails.push(...r.fails); Object.assign(out, r.out);
} finally { pg.close(); }
console.log(JSON.stringify(out, null, 1));
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('salt-card: ok');
