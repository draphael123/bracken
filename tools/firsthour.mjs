// tools/firsthour.mjs — THE FIRST HOUR'S TWO BOSSES, THE WEAK-BOSS PATTERN FIXED (claude/firsthour, Daniel's backlog item 9).
// The Hornet Queen and the Bullfrog King each opened on their own timer (winded after EVERY dive, dazed after EVERY leap), and
// the King's spit left his mouth with no windup at all. (claude/oldtusker) THE HORNET QUEEN is PARKED: the Lumber Trail's boss is OLD TUSKER, and this asks of him,
// in the page, the same thing - his openings are CAUSED, never a timer:
//   OLD TUSKER        - his hide turns a cut outside his openings (x0.4, never nothing); four strokes on a marked pine of his clearing with him under its
//                       line bring it down ON HIM: PINNED, and a blow there bites x2; his charge stops at a standing pine and he reels (DAZED) under it;
//                       a pine felled on him in his ward bounces off; and at half health his blood is up (phase two: the stomp)
//   THE BULLFROG KING - every venom spit is told: the frame a spit of his leaves his mouth he has been in 'spitTell' (a yellow !,
//                       src/marks.js) within the last second; a leap that lands on the hero opens nothing, the same leap left
//                       late (the hero on the spot at take-off, gone at landing) flops him DAZED; his hide turns half a blow out
//                       of his openings; and at half health the court goes out (the drain, his pit) - it waited for a third.
//   node tools/firsthour.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');const {T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
  const boot=id=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
  const drones=()=>BK.enemies().filter(q=>q.alive&&q.t==='wasp'&&q.drone);
  /* ---- OLD TUSKER (claude/oldtusker) ---- */
  {const e=boot('wood');const H=BK.oldTuskerHands(),S=H.show(),A=BK.L.arena,fl=A.floor;out.t=e&&e.t;
   const P=BK.P;const park=()=>{P.x=A.x0+6;P.y=fl;P.vx=P.vy=0;P.hp=P.maxHp;};
   const blow=mode=>{e.mode=mode;e.modeT=5;S.ward=0;S.purse=999;e.hp=e.maxHp;const h0=e.hp;BKT.hurtEnemy(e,10,e.x-20,false);const t=h0-e.hp;return t;};
   out.hide={walk:blow('walk'),pinned:blow('pinned'),rammed:blow('rammed')};
   /* the rule: four strokes on the west inner pine with him in its line */
   const p=S.pines.filter(q=>q.dir>0).sort((x,y)=>y.x-x.x)[0];const [lo,hi]=[p.x+8,p.x+p.len*16];
   e.mode='walk';e.modeT=0;S.ward=0;e.x=(lo+hi)/2;e.y=fl;S.restT=99;
   for(let k=0;k<4;k++){park();P.hitSet=new Set();H.strike({l:p.x-6,r:p.x+6,t:fl-30,b:fl-10});}
   out.fall=p.st;for(let i=0;i<60;i++){park();S.restT=99;if(e.mode!=='pinned'&&e.mode!=='walk')e.mode='walk';e.x=(lo+hi)/2;BK.sim(1);if(e.mode==='pinned')break;}
   out.pinned=e.mode;
   /* the ward: a pine felled on him bounces off */
   const q=S.pines.filter(z=>z.dir<0).sort((x,y)=>x.x-y.x)[0];e.mode='walk';S.ward=3;e.x=q.x-60;const b0=S.n.bounced;
   for(let k=0;k<4;k++){park();P.hitSet=new Set();H.strike({l:q.x-6,r:q.x+6,t:fl-30,b:fl-10});}
   for(let i=0;i<60;i++){park();S.restT=99;S.ward=Math.max(S.ward,1);e.mode='walk';e.x=q.x-60;BK.sim(1);}
   out.bounced=S.n.bounced-b0;
   /* the ram: a charge from the middle toward a standing pine stops at it, dazed */
   const r=S.pines.find(z=>z.st==='stand'&&z.dir<0);S.ward=0;e.x=(A.x0+A.x1)/2-20;e.face=1;e.mode='chargeTell';e.modeT=0.01;let saw='';
   for(let i=0;i<180;i++){park();BK.sim(1);if(e.mode==='rammed'){saw='rammed';break;}}
   out.ram={mode:saw,under:r?(e.x>r.x+r.dir*r.len*16-30&&e.x<r.x):null};
   /* half health: phase two */
   e.mode='walk';e.modeT=0;S.restT=0;e.hp=e.maxHp*0.49;for(let i=0;i<10;i++){park();BK.sim(1);}out.half={ph:S.ph,mode:e.mode};}
  /* ---- THE BULLFROG KING ---- */
  {const f=boot('marsh');const A=BK.L.arena,fl=A.floor;
   const killHop=()=>{for(const e of BK.enemies())if(e.alive&&e.t==='hopper'&&e.drone)e.alive=false;};
   /* every spit told: 60 s of him left to choose, the hero standing off; each new venom seed of his must follow a spitTell */
   f.phase=1;f.hp=f.maxHp;f.mode='idle';f.modeT=0.5;let lastTell=-99,spits=0,untold=0,tells=0,was=false;const known=new Set(BK.seeds());
   for(let i=0;i<60*60;i++){const now=i/60;BK.P.x=f.x-120;BK.P.y=fl;BK.P.hp=BK.P.maxHp;f.hp=f.maxHp;killHop();BK.sim(1);
     if(f.mode==='spitTell'){lastTell=now;if(!was)tells++;}was=f.mode==='spitTell';
     for(const s of BK.seeds())if(!known.has(s)){known.add(s);if(s.venom&&Math.abs(s.x-f.x)<40){spits++;if(now-lastTell>1)untold++;}}}
   out.spit={spits,untold,tells};
   /* the leap, three ways: taken (the hero stays), left late (on the spot at take-off, gone after) */
   const leap=late=>{killHop();f.mode='idle';f.modeT=9;f.vault=false;f.vaultT=9;f.x=(A.x0+A.x1)/2-60;f.y=fl;BK.sim(2);const x0=f.x+70;BK.P.x=x0;BK.P.y=fl;BK.P.vx=0;BK.sim(2);
     f.mode='crouch';f.modeT=0.01;f.vault=false;let left=false;const seen=new Set();
     for(let i=0;i<150;i++){if(late&&!left&&f.mode==='leap'&&f.vy>0){left=true;BK.P.x=x0+80;}if(!left)BK.P.x=x0;BK.sim(1);seen.add(f.mode);if(f.mode!=='crouch'&&f.mode!=='leap')break;}
     return {mode:f.mode,modes:[...seen]};};
   out.leapTaken=leap(false);out.leapLate=leap(true);
   /* his hide: the same blow, out of an opening and in one */
   const hit=mode=>{f.mode=mode;f.modeT=5;f.hp=f.maxHp;f.phase=1;const h0=f.hp;BKT.hurtEnemy(f,10,f.x-20,false);const t=h0-f.hp;f.mode='idle';f.modeT=5;return t;};
   out.hide={idle:hit('idle'),dazed:hit('dazed')};
   /* half health: the court goes out */
   killHop();f.mode='idle';f.modeT=1;f.phase=1;f.hp=f.maxHp*0.52;f.drained=false;BKT.hurtEnemy(f,Math.ceil(f.maxHp*0.06),f.x-20,false);
   for(let i=0;i<30;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}out.half={hpPct:Math.round(100*f.hp/f.maxHp),phase:f.phase,drained:!!f.drained};}
  return out;})()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(r));
const bad = [];
const Q = r;
if (Q.t !== 'oldtusker') bad.push('the Lumber Trail\'s boss is not OLD TUSKER: ' + Q.t);
if (!(Q.hide.walk >= 4 && Q.hide.walk < Q.hide.pinned / 3 && Q.hide.pinned >= 19 && Q.hide.rammed > Q.hide.walk)) bad.push('his hide: x0.4 outside his openings (never nothing), x2 pinned, more dazed: ' + JSON.stringify(Q.hide));
if (Q.fall !== 'fall' || Q.pinned !== 'pinned') bad.push('four strokes on a marked pine with him under its line did not PIN him: ' + JSON.stringify([Q.fall, Q.pinned]));
if (!(Q.bounced >= 1)) bad.push('a pine felled on him in his ward must bounce off (B3): ' + Q.bounced);
if (Q.ram.mode !== 'rammed') bad.push('his charge did not stop at a standing pine and daze him: ' + JSON.stringify(Q.ram));
if (!(Q.half.ph === 2)) bad.push('his blood is not up at half health (phase two): ' + JSON.stringify(Q.half));
if (!(Q.spit.spits > 0)) bad.push('the Bullfrog King never spat in a minute: ' + JSON.stringify(Q.spit));
if (Q.spit.untold > 0) bad.push('an untold spit: venom left his mouth with no spitTell in the second before it: ' + JSON.stringify(Q.spit));
if (Q.leapTaken.mode === 'dazed') bad.push('a leap that lands on the hero dazed him (A11: the rest after his own blow): ' + JSON.stringify(Q.leapTaken));
if (Q.leapLate.mode !== 'dazed') bad.push('a leap left late (on the spot at take-off, gone at landing) did not flop him: ' + JSON.stringify(Q.leapLate));
if (!(Q.hide.idle < Q.hide.dazed / 2)) bad.push('his hide must turn half a blow out of his openings (idle vs dazed): ' + JSON.stringify(Q.hide));
if (!(Q.half.drained && Q.half.hpPct >= 45)) bad.push('the court must go out at half his health (it waited for a third): ' + JSON.stringify(Q.half));
assert.deepEqual(bad, [], 'THE FIRST HOUR\'S BOSSES:\n  ' + bad.join('\n  '));
console.log('OLD TUSKER: hide ' + Q.hide.walk + ' / pinned ' + Q.hide.pinned + ' / dazed ' + Q.hide.rammed + '; four strokes -> ' + Q.pinned + '; warded pines bounce (' + Q.bounced + '); a charge -> ' + Q.ram.mode + '; at half, phase ' + Q.half.ph + '.');
console.log('THE BULLFROG KING: ' + Q.spit.spits + ' spits, all told; a leap taken -> ' + Q.leapTaken.mode + ', left late -> ' + Q.leapLate.mode + '; hide ' + Q.hide.idle + ' vs open ' + Q.hide.dazed + '; the court goes out at ' + Q.half.hpPct + '%.');
