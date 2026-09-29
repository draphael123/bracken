// tools/firsthour.mjs — THE FIRST HOUR'S TWO BOSSES, THE WEAK-BOSS PATTERN FIXED (claude/firsthour, Daniel's backlog item 9).
// The Hornet Queen and the Bullfrog King each opened on their own timer (winded after EVERY dive, dazed after EVERY leap), and
// the King's spit left his mouth with no windup at all. This asks, in the page, that
//   THE HORNET QUEEN  - a dive into bare earth opens nothing (she skims and is up); a dive onto WOOD (a comb's perch or the felled
//                       pine) with the hero leaving late sticks her sting in it: STUCK, open, and a blow through two drones bites
//                       whole there where it glances off her in the skim; and at half health she goes up into her comb - her
//                       hover over the floor rises out of reach and she no longer slams (a second phase that changes the fight)
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
  /* ---- THE HORNET QUEEN ---- */
  {const q=boot('wood');const A=BK.L.arena,L=BK.L,fl=A.floor;
   const kill=()=>{for(const d of drones())d.alive=false;};
   /* the wood: a one-way perch or a plank inside the clearing, over its floor, with air on top */
   const wood=[];for(let ty=Math.floor(fl/16)-5;ty<Math.floor(fl/16);ty++)for(let tx=Math.ceil(A.x0/16)+1;tx<Math.floor(A.x1/16)-1;tx++){const t=L.grid[ty*L.W+tx];if((t===T.ONEWAY||t===T.PLANK)&&L.grid[(ty-1)*L.W+tx]===0)wood.push([tx,ty]);}
   const dive=(x,y,late)=>{kill();q.phase=1;q.hp=q.maxHp;q.mode='hover';q.modeT=9;q.x=x;q.y=fl-74;q.vx=q.vy=0;BK.sim(2);
     BK.P.x=x;BK.P.y=y;BK.P.vx=BK.P.vy=0;BK.sim(3);q.mode='aim';q.modeT=0.01;const seen=new Set();let left=false;
     for(let i=0;i<150;i++){if(!left&&late&&q.mode==='dive'){left=true;BK.P.x=x+90;}if(!left){BK.P.x=x;}BK.sim(1);seen.add(q.mode);if(q.mode==='stuck'||q.mode==='rise'||q.mode==='hover')break;}
     return {modes:[...seen],mode:q.mode};};
   const mid=(A.x0+A.x1)/2;let bare=null;for(let x=A.x0+60;x<A.x1-60;x+=8){const tx=Math.floor(x/16);if(![1,2,3,4,5].some(k=>{const t=L.grid[(Math.floor(fl/16)-k)*L.W+tx];return t===T.ONEWAY||t===T.PLANK;})){bare=x;break;}}
   out.bareStay=dive(bare,fl,false);out.bareLate=dive(bare,fl,true);
   const w=wood.sort((a,b)=>Math.abs(a[0]*16-mid)-Math.abs(b[0]*16-mid))[0];
   out.woodLate=w?dive(w[0]*16+8,w[1]*16,true):{mode:'NO WOOD'};out.wood=wood.length;
   /* a blow through two drones: in her skim, and stuck */
   const bite=mode=>{kill();BK.spawnFoe({t:'wasp',x:Math.floor(q.x/16),y:Math.floor(fl/16)-3,drone:true});BK.spawnFoe({t:'wasp',x:Math.floor(q.x/16)+2,y:Math.floor(fl/16)-3,drone:true});
     for(const d of BK.enemies())if(d.t==='wasp'&&d.alive&&!d.drone&&Math.abs(d.x-q.x)<60)d.drone=true;
     q.mode=mode;q.modeT=5;q.hp=q.maxHp;const h0=q.hp;BKT.hurtEnemy(q,10,q.x-20,false);return {n:drones().length,took:h0-q.hp};};
   out.biteSkim=bite('skim');out.biteStuck=bite('stuck');
   /* half health: up into the comb, and no slam */
   kill();q.mode='hover';q.modeT=1;q.hp=q.maxHp*0.52;q.phase=1;BKT.hurtEnemy(q,Math.ceil(q.maxHp*0.05),q.x-20,false);
   /* (her drones are left up: with none she only calls. Her hover is read once she has settled in it, a second after she entered it) */
   const seen={},ys=[];let hov=0,inHov=0;for(let i=0;i<60*30;i++){BK.P.x=mid;BK.P.y=fl;BK.P.hp=BK.P.maxHp;q.hp=Math.max(q.hp,q.maxHp*0.3);BK.sim(1);seen[q.mode]=1;inHov=q.mode==='hover'?inHov+1:0;if(inHov>60){hov++;ys.push(q.y);}}
   ys.sort((a,b)=>b-a);out.p2={phase:q.phase,modes:Object.keys(seen),hoverLow:Math.round(fl-(ys[Math.floor(ys.length*0.05)]||fl)),hov};}
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
if (!(Q.wood > 0)) bad.push('the Hornet Queen\'s clearing has no wood (a perch or a plank) to lure her dive onto');
if (Q.bareStay.mode === 'stuck' || Q.bareStay.modes.includes('winded') || Q.bareStay.modes.includes('stuck')) bad.push('a dive taken on bare earth opened her (A11: the rest after her own blow): ' + JSON.stringify(Q.bareStay));
if (Q.bareLate.modes.includes('winded') || Q.bareLate.modes.includes('stuck')) bad.push('a dive left late on bare earth opened her - only wood holds her sting: ' + JSON.stringify(Q.bareLate));
if (Q.woodLate.mode !== 'stuck') bad.push('a dive onto wood, left late, did not stick her sting in it: ' + JSON.stringify(Q.woodLate));
if (!(Q.biteStuck.n >= 2 && Q.biteSkim.n >= 2)) bad.push('the drone test did not raise two drones: ' + JSON.stringify([Q.biteSkim, Q.biteStuck]));
else if (!(Q.biteStuck.took >= 10 && Q.biteSkim.took < 10)) bad.push('through two drones a blow must glance in her skim and bite whole (and more) while she is stuck: ' + JSON.stringify([Q.biteSkim, Q.biteStuck]));
if (Q.p2.phase !== 2) bad.push('she did not turn at half health: ' + JSON.stringify(Q.p2));
if (Q.p2.modes.includes('slamUp') || Q.p2.modes.includes('slam')) bad.push('in her comb (phase two) she still slams: ' + JSON.stringify(Q.p2));
if (!(Q.p2.hov > 0 && Q.p2.hoverLow >= 80)) bad.push('in her comb (phase two) her hover must stay out of reach of the floor (80 px up or more): ' + JSON.stringify(Q.p2));
if (!Q.p2.modes.includes('dive')) bad.push('in her comb she must still come down to sting: ' + JSON.stringify(Q.p2));
if (!(Q.spit.spits > 0)) bad.push('the Bullfrog King never spat in a minute: ' + JSON.stringify(Q.spit));
if (Q.spit.untold > 0) bad.push('an untold spit: venom left his mouth with no spitTell in the second before it: ' + JSON.stringify(Q.spit));
if (Q.leapTaken.mode === 'dazed') bad.push('a leap that lands on the hero dazed him (A11: the rest after his own blow): ' + JSON.stringify(Q.leapTaken));
if (Q.leapLate.mode !== 'dazed') bad.push('a leap left late (on the spot at take-off, gone at landing) did not flop him: ' + JSON.stringify(Q.leapLate));
if (!(Q.hide.idle < Q.hide.dazed / 2)) bad.push('his hide must turn half a blow out of his openings (idle vs dazed): ' + JSON.stringify(Q.hide));
if (!(Q.half.drained && Q.half.hpPct >= 45)) bad.push('the court must go out at half his health (it waited for a third): ' + JSON.stringify(Q.half));
assert.deepEqual(bad, [], 'THE FIRST HOUR\'S BOSSES:\n  ' + bad.join('\n  '));
console.log('THE HORNET QUEEN: bare earth skims (' + Q.bareLate.mode + '), wood sticks her sting (' + Q.woodLate.mode + ', ' + Q.wood + ' wood tiles), a blow through two drones ' + Q.biteSkim.took + ' in the skim and ' + Q.biteStuck.took + ' stuck; at half she hangs ' + Q.p2.hoverLow + ' px up and never slams.');
console.log('THE BULLFROG KING: ' + Q.spit.spits + ' spits, all told; a leap taken -> ' + Q.leapTaken.mode + ', left late -> ' + Q.leapLate.mode + '; hide ' + Q.hide.idle + ' vs open ' + Q.hide.dazed + '; the court goes out at ' + Q.half.hpPct + '%.');
