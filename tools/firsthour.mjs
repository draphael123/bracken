// tools/firsthour.mjs — THE FIRST HOUR'S TWO BOSSES, THE WEAK-BOSS PATTERN FIXED (claude/firsthour, Daniel's backlog item 9).
// The Hornet Queen and the Bullfrog King each opened on their own timer (winded after EVERY dive, dazed after EVERY leap), and
// the King's spit left his mouth with no windup at all. (claude/oldtusker) THE HORNET QUEEN is PARKED: the Lumber Trail's boss is OLD TUSKER, and this asks of him,
// in the page, the same thing - his openings are CAUSED, never a timer:
//   OLD TUSKER        - his hide turns a cut outside his openings (x0.4, never nothing); four strokes on a marked pine of his clearing with him under its
//                       line bring it down ON HIM: PINNED, and a blow there bites x2; (claude/tuskerfix) his charge runs past standing pines, and a FELLED trunk in his path he RAMS (DAZED, it splinters);
//                       a pine felled on him in his ward bounces off; and at half health his blood is up (phase two: the stomp)
//   THE BULLFROG KING - every venom spit is told: the frame a spit of his leaves his mouth he has been in 'spitTell' (a yellow !,
//                       src/marks.js) within the last second. (claude/frogking2) THE PAD CHASE: his leap carries him to the NEXT royal pad;
//                       landing on the hero opens nothing, landing on a raised shield TURNS him (DAZED); on his pad he has NO hide (a blow
//                       lands whole), in the air a blow takes 0.4x (B15), dazed x2; and at half health his pond stirs (the pads sink faster).
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
   out.otHide={walk:blow('walk'),pinned:blow('pinned'),rammed:blow('rammed')};
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
   /* (claude/tuskerfix, Daniel 10-21) the ram: a FELLED trunk lying on the floor stops his charge - he rams it, DAZED, and it splinters */
   const q2=S.pines.filter(z=>z.dir<0).sort((x,y)=>x.x-y.x)[0];for(const z of S.pines){z.st='stand';z.hp=4;z.t=0;}q2.st='down';q2.t=20;S.ward=0;S.trunk=null;
   const lo2=q2.x-q2.len*16;e.x=A.x0+90;e.face=1;e.mode='chargeTell';e.modeT=0.01;let saw='',at=0;
   for(let i=0;i<180;i++){park();BK.sim(1);if(e.mode==='rammed'){saw='rammed';at=e.x;break;}}
   out.ram={mode:saw,atEnd:Math.abs(at-(lo2-26))<=2,trunk:q2.st};
   /* and with every pine standing, the charge runs past them all to the wall (no standing pine stops or dazes him) */
   for(const z of S.pines){z.st='stand';z.hp=4;z.t=0;}e.x=(A.x0+A.x1)/2;e.face=-1;e.mode='chargeTell';e.modeT=0.01;saw='';at=0;
   for(let i=0;i<180;i++){P.x=A.x1-20;P.y=fl;P.hp=P.maxHp;BK.sim(1);if(e.mode==='rammed'){saw='rammed';at=e.x;break;}}
   out.wall={mode:saw,pastPines:at<Math.min(...S.pines.map(z=>z.x)),x:Math.round(at)};
   /* half health: phase two */
   e.mode='walk';e.modeT=0;S.restT=0;e.hp=e.maxHp*0.49;for(let i=0;i<10;i++){park();BK.sim(1);}out.otHalf={ph:S.ph,mode:e.mode};}
  /* ---- THE BULLFROG KING ---- */
  {const f=boot('marsh');const A=BK.L.arena,fl=A.floor;
   const killHop=()=>{for(const e of BK.enemies())if(e.alive&&e.t==='hopper'&&e.drone)e.alive=false;};
   /* every spit told: 60 s of him left to choose, the hero standing off; each new venom seed of his must follow a spitTell */
   f.phase=1;f.hp=f.maxHp;f.mode='idle';f.modeT=0.5;let lastTell=-99,spits=0,untold=0,tells=0,was=false;const known=new Set(BK.seeds());
   for(let i=0;i<60*60;i++){const now=i/60;BK.P.x=f.x-40;BK.P.y=fl;BK.P.hp=BK.P.maxHp;f.hp=f.maxHp;killHop();BK.sim(1);
     if(f.mode==='spitTell'){lastTell=now;if(!was)tells++;}was=f.mode==='spitTell';
     for(const s of BK.seeds())if(!known.has(s)){known.add(s);if(s.venom&&Math.abs(s.x-f.x)<40){spits++;if(now-lastTell>1)untold++;}}}
   out.spit={spits,untold,tells};
   /* the leap (claude/frogking2): from his first royal pad to the second - onto the hero (nothing opens), onto a raised shield (TURNED: DAZED) */
   const leap=shield=>{killHop();BK.god=false;f.st=0;f.tst=undefined;f.stHp0=f.hp;f.stT=0;f.x=A.royal[0].cx;f.y=fl;f.vx=0;f.vy=0;f.mode='idle';f.modeT=9;BK.sim(2);
     const to=A.royal[1];BK.P.x=to.cx;BK.P.y=fl;BK.P.vx=0;BK.P.face=-1;BK.keys.block=!!shield;BK.sim(2);
     f.tst=1;f.mode='crouch';f.modeT=0.01;const seen=new Set();
     for(let i=0;i<240;i++){BK.P.x=to.cx;BK.P.face=-1;BK.P.hp=BK.P.maxHp;BK.sim(1);seen.add(f.mode);if(f.mode!=='crouch'&&f.mode!=='leap')break;}
     BK.keys.block=false;BK.god=true;return {mode:f.mode,st:f.st,modes:[...seen]};};
   out.leapTaken=leap(false);out.leapShield=leap(true);
   /* no hide on his pad: the same blow on his pad, in the air, and dazed */
   const hit=mode=>{f.mode=mode;f.modeT=5;f.hp=f.maxHp;f.phase=1;f.openHp0=f.hp;const h0=f.hp;BKT.hurtEnemy(f,10,f.x-20,false);const t=h0-f.hp;f.mode='idle';f.modeT=5;return t;};
   out.hide={idle:hit('idle'),air:hit('leap'),dazed:hit('dazed')};
   /* half health: his pond stirs */
   killHop();f.st=0;f.x=A.royal[0].cx;f.mode='idle';f.modeT=1;f.phase=1;f.hp=f.maxHp*0.52;f.stHp0=f.hp;BKT.hurtEnemy(f,Math.ceil(f.maxHp*0.06),f.x-20,false);
   for(let i=0;i<30;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);}const C=BK.frogCourt&&BK.frogCourt();out.half={hpPct:Math.round(100*f.hp/f.maxHp),phase:f.phase,mode:f.mode,sinkK:C?C.sinkK:0};}
  return out;})()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
console.log(JSON.stringify(r));
const bad = [];
const Q = r;
if (Q.t !== 'oldtusker') bad.push('the Lumber Trail\'s boss is not OLD TUSKER: ' + Q.t);
if (!(Q.otHide.walk >= 4 && Q.otHide.walk < Q.otHide.pinned / 3 && Q.otHide.pinned >= 19 && Q.otHide.rammed > Q.otHide.walk)) bad.push('his hide: x0.4 outside his openings (never nothing), x2 pinned, more dazed: ' + JSON.stringify(Q.otHide));
if (Q.fall !== 'fall' || Q.pinned !== 'pinned') bad.push('four strokes on a marked pine with him under its line did not PIN him: ' + JSON.stringify([Q.fall, Q.pinned]));
if (!(Q.bounced >= 1)) bad.push('a pine felled on him in his ward must bounce off (B3): ' + Q.bounced);
if (!(Q.ram.mode === 'rammed' && Q.ram.atEnd && Q.ram.trunk === 'spent')) bad.push('his charge did not RAM the felled trunk (dazed at its end, the trunk splintered): ' + JSON.stringify(Q.ram));
if (!(Q.wall.mode === 'rammed' && Q.wall.pastPines)) bad.push('his charge must run past the standing pines to the wall: ' + JSON.stringify(Q.wall));
if (!(Q.otHalf.ph === 2)) bad.push('his blood is not up at half health (phase two): ' + JSON.stringify(Q.otHalf));
if (!(Q.spit.spits > 0)) bad.push('the Bullfrog King never spat in a minute: ' + JSON.stringify(Q.spit));
if (Q.spit.untold > 0) bad.push('an untold spit: venom left his mouth with no spitTell in the second before it: ' + JSON.stringify(Q.spit));
if (Q.leapTaken.mode === 'dazed' || Q.leapTaken.st !== 1) bad.push('his leap must carry him to the next royal pad, and landing on the hero opens nothing (A11): ' + JSON.stringify(Q.leapTaken));
if (Q.leapShield.mode !== 'dazed') bad.push('a landing on a raised shield did not TURN him (DAZED): ' + JSON.stringify(Q.leapShield));
if (!(Q.hide.idle >= 9 && Q.hide.air >= 4 && Q.hide.air < Q.hide.idle && Q.hide.dazed >= Q.hide.idle * 1.5)) bad.push('no hide on his pad (a blow whole), 0.4x+ in the air (B15), x2 dazed: ' + JSON.stringify(Q.hide));
if (!(Q.half.phase === 2 && Q.half.hpPct >= 45 && Q.half.sinkK > 1)) bad.push('his pond must stir at half his health (phase two, the pads sink faster): ' + JSON.stringify(Q.half));
assert.deepEqual(bad, [], 'THE FIRST HOUR\'S BOSSES:\n  ' + bad.join('\n  '));
console.log('OLD TUSKER: hide ' + Q.otHide.walk + ' / pinned ' + Q.otHide.pinned + ' / dazed ' + Q.otHide.rammed + '; four strokes -> ' + Q.pinned + '; warded pines bounce (' + Q.bounced + '); a charge into a felled trunk -> ' + Q.ram.mode + ' (trunk ' + Q.ram.trunk + '), past the standing pines -> ' + Q.wall.mode + ' at the wall' + '; at half, phase ' + Q.otHalf.ph + '.');
console.log('THE BULLFROG KING: ' + Q.spit.spits + ' spits, all told; a leap onto the hero -> ' + Q.leapTaken.mode + ' (royal pad ' + Q.leapTaken.st + '), onto a shield -> ' + Q.leapShield.mode + '; a blow on his pad ' + Q.hide.idle + ' / in the air ' + Q.hide.air + ' / dazed ' + Q.hide.dazed + '; his pond stirs at ' + Q.half.hpPct + '% (sink x' + Q.half.sinkK + ').');
