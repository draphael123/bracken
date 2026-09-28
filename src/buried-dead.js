import {canvas,outline,flipX,whiten} from './px.js';
import {VENT,ventLit} from './burial-expansion.js';
/* THE SKULLS (Daniel, 2026-09-24: "a ranged skull throw when the player platform-camps or stays far away"). The ossuary's
   high tier is nova-safe on purpose and THE HANDS were the only thing that reached it, once a rotation: so a hero who
   climbed and waited, or stood off at the far wall, could let most of the fight go by. Stay up there, or stay away, for
   `after` seconds and he tears a lit skull off the mound and throws it - one before he is enraged, two after, at where you
   stood when he wound up. It does not take a turn out of his rotation (so SINK keeps its place and the arm-in-the-ground
   punish its timing), and it waits `cd` between throws.
   THE SHIELD TURNS IT - a YELLOW mark. The skull is the answer to camping, and a camper on a four-tile ledge has nowhere
   to step: a blow he can only dodge would make the high tier a trap, not a choice. So it is answered where you stand, by
   guarding (or by stepping off its line, since it goes where you were). THE HANDS stay the unblockable reach to the ledge,
   so the two ranged answers ask different things of you: the hands your feet, the skull your shield. */
export const SKULL={after:2,cd:7,tell:.9,speed:230,dmg:14,far:150,r:11};
function stepSkulls(e,dt,P,A,hit){
 for(const q of e.skulls){if(q.t<0){q.t+=dt;continue;}q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.spin=(q.spin||0)+dt*14;
  if(!q.done&&!P.dead&&Math.abs(P.x-q.x)<SKULL.r&&Math.abs(P.y-10-q.y)<SKULL.r+4){q.done=true;hit(q.x,SKULL.dmg,false);}
  if(q.t>2.4||q.x<A.x0-16||q.x>A.x1+16||q.y>A.floor)q.done=true;}
 e.skulls=e.skulls.filter(q=>!q.done);
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* GRAVE HANDS (Daniel, 2026-09-27; claude/burial3). A LINE of the dead's arms comes up out of the floor, one after another, running from
   him towards where you stood - told by the earth cracking along that line first (the crack runs out over the wind-up, so you can
   see how far it goes). Unblockable: the answer is your feet (jump the arm that is under you, get up a tier) OR THE LEVEL'S RULE: THE
   DEAD WILL NOT RISE INSIDE A BURNING VENT'S LIGHT (VENT.light px), so no arm comes up in a lit vent's light, and the crack goes
   round it. Not an opening: he rests after it as he does after anything, and it opens nothing (A11 - his windows are the gas and the arm
   in the ground). In PHASE ONE, from the start: it is the fight's first reason to light a vent for yourself, not only under him.
   GRAVE BREATH (the same day). A cold wave off him, both ways, across the whole lair: it SNUFFS every burning vent it passes and the
   FIRE IN YOUR HAND. Close in, the cold bites (a shield turns it). The answer is the lair's own: THE CANDLES AT ITS WALLS - take fire
   again and light again. PHASE TWO ONLY: it is what changes when he is enraged (A10) - the vents you lit stop staying lit. */
export const HANDS={tell:1.1,first:34,step:22,gap:.06,up:.45,bite:.25,reach:13,high:34,dmg:18};
export const BREATH={tell:1.3,speed:320,near:110,dmg:10};
function stepHandLine(e,dt,P,A,hit,vents){const q=e.handLine;if(!q)return;q.t+=dt;if(q.t<0)return;let live=false;
 for(const a of q.arms){if(q.t<a.at){live=true;continue;}const k=q.t-a.at;if(k<HANDS.up)live=true;
  if(a.blocked===undefined)a.blocked=ventLit(vents,a.x,A.floor);   /* asked the moment it would come up: a vent lit during the tell still stops it */
  if(!a.blocked&&k<HANDS.bite&&!q.hit&&!P.dead&&Math.abs(P.x-a.x)<HANDS.reach&&P.y>A.floor-HANDS.high){q.hit=true;hit(a.x,HANDS.dmg,true);}}
 if(!live)e.handLine=null;}
function stepBreath(e,dt,P,A,hit,c){const b=e.breath;if(!b)return;b.r+=BREATH.speed*dt;
 for(const v of c.vents||[])if(v.litT>0&&Math.abs(v.x*16+8-b.x)<=b.r){v.litT=0;v.burnt=false;if(c.snuff)c.snuff(v);}
 if(!b.passed&&Math.abs(P.x-b.x)<=b.r){b.passed=true;if(P.candle>0){P.candle=0;if(c.snuffHand)c.snuffHand();}
  if(!P.dead&&Math.abs(P.x-b.x)<BREATH.near&&P.y>A.floor-70)hit(b.x,BREATH.dmg,false);}
 if(b.r>A.x1-A.x0+32)e.breath=null;}
export function updateBuriedDead(e,dt,c){
 const{P,A,hit,summon,say,sound}=c;if(!e.alive||P.dead||e.mode==='sleep')return;
 const ring=c.ring||(()=>{}),throwZombie=c.throwZombie||(()=>{}),shake=c.shake||(()=>{});
 e.anim+=dt;e.modeT-=dt;e.open=Math.max(0,(e.open||0)-dt);e.effectT=Math.max(0,(e.effectT||0)-dt);e.y=A.floor;e.vx=e.vy=0;
 /* HIS REST OPENS NOTHING (claude/burial2, A11). It used to: every attack ended in 2.2 s of open, the window arriving on his own timer
    whatever you did. His openings now are the two you make: THE GAS (a vent burning under him, below) and his arm in the ground. */
 const rest=()=>{e.mode='rest';e.modeT=2.2;};
 /* SCORCHED: a burning vent in his floor, and he walks into its flame (or you light it under him). Once a lighting (v.burnt), not while
    he is under the ground or in the air, and never over a window already open. */
 if(!['burrow','eruptTell','bodyFly','stuck','scorched','wake','rally'].includes(e.mode)&&!(e.open>0))for(const v of c.vents||[])if(v.litT>0&&!v.burnt&&Math.abs(e.x-(v.x*16+8))<VENT.scorchR){
  v.burnt=true;if(e.handLine&&e.handLine.t<0)e.handLine=null;e.mode='scorched';e.modeT=VENT.scorch;e.open=VENT.scorch;e.effect=null;say('THE GAS TAKES HIM: STRIKE',true);sound('roar');ring(e.x,A.floor-30,40,'#ffd36b');shake(4);break;}
 if(e.phase===1&&e.hp<=e.hp0*.5&&e.mode!=='burrow'&&e.mode!=='eruptTell'){e.phase=2;e.mode='rally';e.modeT=1.5;e.turn=0;say('THE GRAVES ANSWER',true);sound('roar');return;}
 e.brokeT=Math.max(0,(e.brokeT||0)-dt);
 /* THE CAMP CLOCK: up on a tier (30 px is over the low step's lip) or out past his reach, and it runs; come down and close, and it stops */
 const camping=P.y<A.floor-30||Math.abs(P.x-e.x)>SKULL.far;e.campT=camping?(e.campT||0)+dt:0;e.skullCd=Math.max(0,(e.skullCd??0)-dt);
 if(e.skulls&&e.skulls.length)stepSkulls(e,dt,P,A,hit);
 stepHandLine(e,dt,P,A,hit,c.vents);stepBreath(e,dt,P,A,hit,c);
 if(e.flying){const q=e.flying;q.t+=dt;q.vy+=560*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.spin+=dt*9;
  if(q.y>=A.floor-2){e.flying=null;shake(3);sound('heavy');
   if(Math.abs(P.x-q.x)<22&&P.y>A.floor-30)hit(q.x,14,false);
   throwZombie(clamp(q.x,A.x0+30,A.x1-30));}}
 /* THE BODY SLAM IN THE AIR: he goes up and over to where you were standing, and comes down on it */
 if(e.mode==='bodyFly'){const k=1-Math.max(0,e.modeT)/.6;e.x=e.flyX0+(e.markX-e.flyX0)*k;e.y=A.floor-Math.sin(Math.min(1,k)*Math.PI)*56;
  if(e.modeT<=0){e.x=e.markX;e.y=A.floor;shake(9);sound('heavy');ring(e.x,A.floor-6,80,'#ff9a5c');
   if(Math.abs(P.x-e.x)<78&&P.y>A.floor-44)hit(e.x,28,true);e.mode='rest';e.modeT=2.4;}return;}
 if(e.mode==='stuck'){if(e.modeT<=0){e.mode='walk';e.modeT=.9;say('HE TEARS IT FREE',false);}return;}
 if(e.mode==='scorched'){if(e.modeT<=0){e.mode='walk';e.modeT=.9;say('THE FIRE DIES ON HIM',false);}return;}
 if(['wake','rest','rally'].includes(e.mode)){if(e.modeT<=0){e.mode='walk';e.modeT=.9;}return;}
 if(e.mode==='burrow'){
  e.x=clamp(e.x+Math.sign(P.x-e.x)*Math.min(Math.abs(P.x-e.x),120*dt),A.x0+38,A.x1-38);
  if(e.modeT<=0){e.mode='eruptTell';e.modeT=1.1;e.markX=e.x;say('THE EARTH BREAKS: MOVE',true);sound('charge');}return;
 }
 if(e.mode==='walk'){
  const dx=P.x-e.x;e.face=Math.sign(dx)||e.face;if(Math.abs(dx)>58){e.vx=e.face*36;e.x=clamp(e.x+e.vx*dt,A.x0+38,A.x1-38);}if(e.modeT>0)return;
  /* THE HANDS are in BOTH turns, so he has seven before he is enraged and eight after (Daniel: "he can use just one
     more attack pre-enrage"). They exist because the ossuary grew a nova-safe upper tier: high ground that nothing
     could answer would be a camp, not a choice. */
  const turns=e.phase===2?['slamTell','breathTell','throwTell','bodyTell','handsTell','novaTell','clawTell','sinkTell','cleaveTell','callTell']:['slamTell','throwTell','handsTell','novaTell','clawTell','cleaveTell','sinkTell','callTell'];   /* claude/burial3: GRAVE HANDS from the start, GRAVE BREATH once enraged; sink stays three turns before the slam (sink, then two, then slam) */
  /* SINK SITS SIXTH IN PHASE ONE, NOT THIRD (Daniel approved, docs/briefs/buried-dead-rotation.md option A). His one caused
     opening needs the slam to land while the ground he broke still lives (brokeT 14 s). Third, four turns stood between the
     erupt and the next slam - 21.0 s - so the arm-in-the-ground punish was never reachable before enrage. Sixth, it is 8.5 s. */
  const skull=e.campT>=SKULL.after&&e.skullCd<=0,m=skull?'skullTell':turns[e.turn++%turns.length];if(skull){e.skullCd=SKULL.cd;e.campT=0;}   /* the skull cuts in; it does not use up a turn */
  e.mode=m;e.modeT=m==='handsTell'?HANDS.tell:m==='breathTell'?BREATH.tell:m==='skullTell'?SKULL.tell:m==='callTell'?1.3:m==='novaTell'?1.2:m==='bodyTell'?1.05:m==='clawTell'?1:m==='throwTell'?.85:1;e.markX=m==='bodyTell'?clamp(P.x,A.x0+40,A.x1-40):m==='clawTell'?clamp(P.x,A.x0+20,A.x1-20):e.x;if(m==='clawTell')e.markY=Number.isFinite(P.y)?P.y:A.floor;if(m==='skullTell'){e.skullAt={x:P.x,y:P.y-10};sound('clatter');}if(m==='handsTell')e.handLine=handLine(e,P,A);if(m==='breathTell')sound('hiss');   /* its own mark: the hands' markY is a different promise */   /* WHERE YOU ARE STANDING WHEN HE WINDS UP, floor or ledge: leaving is the answer, exactly as the erupt works */
  say(({slamTell:'SLAM: JUMP',callTell:'THE DEAD RISE',sinkTell:'FOLLOW THE SHADOW',cleaveTell:'SWEEP: GUARD OR RETREAT',novaTell:'POISON NOVA: GET CLEAR',throwTell:'HE THROWS THE DEAD',bodyTell:'BODY SLAM: MOVE',clawTell:'THE HANDS COME UP: MOVE YOUR FEET',skullTell:'SKULL: GUARD IT',handsTell:'GRAVE HANDS: JUMP THEM, OR STAND IN THE FIRE',breathTell:'GRAVE BREATH: THE FIRE WILL GO OUT'})[m],m==='slamTell'||m==='novaTell'||m==='bodyTell'||m==='clawTell'||m==='handsTell');sound('charge');return;
 }
 if(e.modeT>0||!e.mode.endsWith('Tell'))return;
 const m=e.mode;e.effect=m;e.effectT=.35;
 if(m==='sinkTell'){e.mode='burrow';e.modeT=.7;sound('hiss');return;}
 if(m==='handsTell'){if(!e.handLine)e.handLine=handLine(e,P,A);e.handLine.t=Math.max(0,e.handLine.t);ring(e.x+e.handLine.dir*40,A.floor-6,30,'#d8cfb0');shake(3);sound('crack');}   /* forced without its wind-up (A3), it still has a line */
 if(m==='breathTell'){e.breath={x:e.x,r:0,passed:false};ring(e.x,A.floor-40,60,'#bfe6f5');sound('puff');}
 if(m==='skullTell'){const n=e.phase===2?2:1,hx=e.x+(e.face||1)*6,hy=A.floor-96,at=e.skullAt||{x:P.x,y:P.y-10};e.skullAt=null;e.skulls=e.skulls||[];   /* a tell forced without its wind-up (the harness, A3) aims where you are */
  for(let i=0;i<n;i++){const tx=at.x+(i?Math.sign(at.x-e.x||1)*32:0),ty=at.y,d=Math.hypot(tx-hx,ty-hy)||1;   /* the second, enraged, goes where you would step back to */
   e.skulls.push({x:hx,y:hy,vx:(tx-hx)/d*SKULL.speed,vy:(ty-hy)/d*SKULL.speed,t:-i*.2});}
  sound('skullThrow');}
 if(m==='novaTell'){ring(e.x,A.floor-20,112,'#a6e04a');sound('hiss');
  if(Math.abs(P.x-e.x)<112&&P.y>A.floor-80){hit(e.x,18,true);P.venomT=Math.max(P.venomT||0,2.4);}}
 if(m==='throwTell'){const tx=clamp(P.x,A.x0+30,A.x1-30),T=.85;e.flying={x:e.x+e.face*20,y:A.floor-70,vx:(tx-(e.x+e.face*20))/T,vy:(70-.5*560*T*T)/T,t:0,spin:0};   /* from 70 above the floor to the floor in T under 560 gravity: it lands where you were standing */sound('charge');}
 if(m==='bodyTell'){e.flyX0=e.x;if(!Number.isFinite(e.markX))e.markX=clamp(P.x,A.x0+40,A.x1-40);e.mode='bodyFly';e.modeT=.6;sound('roar');return;}   /* the mark is where you stood when he wound up; a slam with no mark would send him to NaN */
 if(m==='slamTell'){if(Math.abs(P.x-e.x)<(e.phase===2?175:145)&&P.y>A.floor-25)hit(e.x,24,true);sound('heavy');
  /* THE GROUND HE ALREADY BROKE WILL NOT HOLD HIS FIST. Every opening he had was the rest he takes anyway, so there was
     nothing in this fight the player caused: stand over the hole he erupted from, let the slam come down on it, and the
     arm goes in to the shoulder. That is a punish you set up, and it is twice the window his own rest gives. */
  if(e.brokeT>0&&Math.abs(e.x-e.brokeX)<30){e.mode='stuck';e.modeT=3.4;e.open=3.4;e.brokeT=0;say('HIS ARM IS IN THE GROUND',true);sound('crack');return;}}
 /* THE HANDS. They come up through whatever you were standing on when he wound up - the floor, or the ledge you
    climbed to get away from the poison. This is the one attack in the fight that reaches the high tier, and it is why
    the high tier is a decision rather than a roof. Unblockable on purpose: the answer is your feet, not your shield. */
 if(m==='clawTell'){const gy=Number.isFinite(e.markY)?e.markY:A.floor;ring(e.markX,gy-6,46,'#a6e04a');sound('hiss');
  if(Math.abs(P.x-e.markX)<34&&Math.abs(P.y-gy)<30)hit(e.markX,20,true);}
 if(m==='cleaveTell'){if(Math.abs(P.x-e.x)<82&&Math.abs(P.y-e.y)<58)hit(e.x,20,false);sound('heavy');}
 if(m==='callTell'){summon(e.phase===2?2:1);sound('roar');}
 if(m==='eruptTell'){if(Math.abs(P.x-e.markX)<42&&P.y>A.floor-90)hit(e.markX,26,true);sound('heavy');e.brokeX=e.markX;e.brokeT=14;}
 rest();
}
/* the line, laid at the wind-up: from beside him to the far wall on your side, an arm every HANDS.step px; t counts UP to 0 over the tell */
function handLine(e,P,A){const dir=Math.sign(P.x-e.x)||e.face||1,arms=[];
 for(let i=0,x=e.x+dir*HANDS.first;x>A.x0+8&&x<A.x1-8;i++,x+=dir*HANDS.step)arms.push({x,at:i*HANDS.gap});
 return {dir,t:-HANDS.tell,arms,hit:false};}
export function updateZombie(e,dt,c){
 const{P,move,hit,snare,say,solid,shot}=c;e.anim+=dt;e.modeT-=dt;e.vx=0;
 /* THE APPRENTICE STILL THROWS. He is the only one of the dead with a reach, so the caverns and the tower are not one
    answer over and over: close on the husk, but do not stand still in front of him. */
 if(e.apprentice&&shot){
  if(e.mode==='castTell'){if(e.modeT<=0){shot(e);e.mode='rest';e.modeT=1.5;}return;}
  const ad=Math.abs(P.x-e.x);
  if(e.mode==='walk'&&ad>52&&ad<190&&Math.abs(P.y-e.y)<40&&!P.dead&&(e.castCd=(e.castCd||0)-dt)<=0){
   e.castCd=3.2+Math.random();e.face=Math.sign(P.x-e.x)||e.face;e.mode='castTell';e.modeT=.75;say&&say('EMBER',false);return;}
 }
 if(e.mode==='buried'){if(c.lit&&c.lit(e.x,e.y))return;   /* THE DEAD WILL NOT RISE INSIDE A BURNING VENT'S LIGHT (burial-expansion.js) */
  if(Math.abs(P.x-e.x)<85&&Math.abs(P.y-e.y)<60){e.mode='riseTell';e.modeT=1.1;say('MOVING EARTH',false);}return;}
 if(e.mode==='riseTell'){if(e.modeT<=0){e.mode='walk';e.modeT=.7;}return;}
 if(e.mode==='grabTell'){if(e.modeT<=0){if(Math.abs(P.x-e.x)<28&&Math.abs(P.y-e.y)<28){if(hit(e.x,12,false)==='hit')snare(.75);}e.mode='rest';e.modeT=1;}return;}
 if(e.mode==='rest'){if(e.modeT<=0)e.mode='walk';return;}
 e.face=Math.sign(P.x-e.x)||e.face;e.vy=Math.min(320,(e.vy||0)+1000*dt);
 if(Math.abs(P.x-e.x)<25&&Math.abs(P.y-e.y)<25){e.mode='grabTell';e.modeT=.7;say('GRAB',false);return;}
 e.vx=solid(e.x+e.face*16,e.y+4)?e.face*(e.husk?17:e.apprentice?22:25):0;if(move(e,e.vx*dt,e.vy*dt)?.ground)e.vy=0;
}
export function deadFrame(e){return e.mode==='novaTell'?4:e.mode==='throwTell'||e.mode==='bodyTell'?3:e.mode==='bodyFly'?2:e.mode==='stuck'||e.mode==='scorched'?5:e.mode==='burrow'||e.mode==='eruptTell'||e.mode==='buried'||e.mode==='riseTell'?6:e.open>0?5:e.mode==='slamTell'?3:e.mode==='callTell'?4:e.mode?.endsWith('Tell')?2:Math.abs(e.vx)>2?Math.floor(e.anim*5)%2:0;}
/* THE SAME DEAD MAN, RAISED SOMEWHERE ELSE. kind picks who got up: the caverns' bloated husk, swollen and green and
   a head taller, and the tower's apprentice, still in the robe he died in. One silhouette is not two enemies, so the
   husk carries its own bulk and the apprentice his hood - the tint alone would only have made a recoloured zombie. */
export function bakeDead(big=false,kind=''){
 const husk=kind==='husk',app=kind==='apprentice';
 const R=[],w=big?78:husk?32:26,h=big?98:husk?38:32,s=big?3:husk?1.2:1;
 for(let f=0;f<7;f++){const[c,g]=canvas(w,h);g.save();g.scale(s,s);const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
 if(f===6){r(3,big?28:29,21,2,'#716249');r(10,big?26:27,6,3,'#8b9b67');}
 else{const step=f===1?1:0;r(7,22,5,8-step,'#575846');r(15,22,5,8+step,'#444434');r(5,29-step,8,2,'#312e2b');r(14,29+step,8,2,'#312e2b');r(6,12,15,13,'#748459');r(9,13,11,10,'#849769');r(7,20,5,5,'#684244');r(17,17,4,8,'#393e31');r(9,4,11,10,'#98a374');r(10,3,8,3,'#626849');r(15,7,3,2,'#f1d476');r(17,11,4,2,'#443d36');r(6,f===3?3:14,4,f===3?13:8,'#859767');r(20,f===3?2:f===4?7:15,4,f===3?13:9,'#7d8f5c');if(f===5)r(11,14,6,4,'#cab1a0');}
 g.restore();
 if(big&&f!==6){const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  r(34,45,21,22,'#454731');for(let k=0;k<4;k++){r(35,47+k*5,17-k*2,2,'#b3ad85');r(36,49+k*5,2,2,'#8c8869');}r(42,46,3,21,'#d1c4a0');
  r(29,17,5,12,'#66734f');r(31,17,8,2,'#b2b98a');r(48,21,5,3,'#f0de85');r(49,21,2,2,'#fff2bb');r(47,33,13,6,'#363027');for(let x=48;x<59;x+=4)r(x,33,2,3,'#c7bea0');
  r(26,10,5,6,'#514d3e');r(29,8,6,3,'#bab694');r(36,10,3,4,'#514d3e');r(24,68,9,4,'#5b3638');r(27,70,3,6,'#947d68');
  for(const[x,y]of [[24,82],[48,85],[52,73],[23,40],[59,46]]){r(x,y,5,2,'#514835');r(x+2,y-3,2,4,'#656e47');}
 }
 if(husk&&f!==6){const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};   // the swollen belly, and the gas coming off it
  r(8,17,16,12,'#7c9a4a');r(10,19,11,8,'#8fb257');r(12,21,5,3,'#a6e04a');r(6,14,4,3,'#5c8a24');r(21,15,4,3,'#5c8a24');}
 if(app&&f!==6){const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};   // the hood and the sleeves of the tower's own
  r(7,10,14,16,'#3b3a63');r(8,12,12,12,'#4a4a7c');r(8,2,12,9,'#3b3a63');r(9,3,10,6,'#2b2a4b');r(10,6,3,2,'#9be2ff');r(16,6,3,2,'#9be2ff');
  r(5,17,4,9,'#3b3a63');r(19,17,4,9,'#3b3a63');r(12,26,4,5,'#2b2a4b');}
 R.push(outline(c));}
 const W=R.map(c=>whiten(c));return{R,L:R.map(flipX),white:{R:W,L:W.map(flipX)},ax:big?39:husk?16:13,ay:big?95:husk?38:32,w,h};
}
export function drawBuriedDead(g,e,A,cx,cy,time,vents){
 if(!e?.alive||!A)return;const x=e.x-cx,y=A.floor-cy;g.save();g.globalCompositeOperation='source-over';
 if(['burrow','eruptTell','sinkTell'].includes(e.mode)){const locked=e.mode==='eruptTell';g.fillStyle=locked?'#a86048':'#292320';g.beginPath();g.ellipse(x,y-2,locked?42:28,6,0,0,7);g.fill();g.strokeStyle=locked?'#ffd36b':'#b29e78';g.lineWidth=2;g.stroke();for(let k=-20;k<=20;k+=10)g.fillRect(x+k,y-5-Math.sin(time*12+k)*3,3,3);}
 if(e.mode==='novaTell'){const k=1-Math.max(0,e.modeT)/1.2;g.strokeStyle='rgba(166,224,74,'+(.35+.4*k)+')';g.lineWidth=2;g.beginPath();g.ellipse(x,y-20,112*k,26*k+8,0,0,7);g.stroke();g.fillStyle='rgba(92,138,36,'+(.12+.12*k)+')';g.fill();}
 if(e.mode==='bodyTell'||e.mode==='bodyFly'){const mx=e.markX-cx;g.fillStyle='rgba(255,107,107,.3)';g.beginPath();g.ellipse(mx,y-2,78,7,0,0,7);g.fill();g.strokeStyle='#ff9a5c';g.lineWidth=2;g.stroke();}
 if(e.flying){const q=e.flying,fx=q.x-cx,fy=q.y-cy;g.save();g.translate(fx,fy);g.rotate(q.spin);g.fillStyle='#748459';g.fillRect(-5,-10,10,14);g.fillStyle='#98a374';g.fillRect(-4,-16,8,7);g.fillStyle='#575846';g.fillRect(-5,4,4,6);g.fillRect(1,4,4,6);g.restore();
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(q.x+q.vx*.2-cx,y-1,10,3,0,0,7);g.fill();}
 if(e.mode==='skullTell'&&e.skullAt){const k=1-Math.max(0,e.modeT)/SKULL.tell;g.strokeStyle='rgba(166,224,74,'+(.3+.5*k).toFixed(2)+')';g.lineWidth=1;g.beginPath();g.arc(e.skullAt.x-cx,e.skullAt.y-cy,6+8*(1-k),0,7);g.stroke();}   /* where it will go: a green ring closing on the spot you stood */
 for(const q of e.skulls||[])if(q.t>=0){const sx=Math.round(q.x-cx),sy=Math.round(q.y-cy);g.fillStyle='rgba(166,224,74,.4)';g.fillRect(sx-Math.round(q.vx*.04)-2,sy-Math.round(q.vy*.04)-2,4,4);
  g.fillStyle='#5c8a24';g.fillRect(sx-4,sy-4,8,7);g.fillStyle='#e8e0c4';g.fillRect(sx-3,sy-3,6,5);g.fillStyle='#5c8a24';g.fillRect(sx-2,sy-1,2,2);g.fillRect(sx+1,sy-1,2,2);g.fillStyle='#a89e80';g.fillRect(sx-2,sy+2,4,1);}
 /* GRAVE HANDS: over the tell the earth cracks out along the line (it stops short where a vent's light will keep them down); then the arms */
 if(e.handLine){const q=e.handLine,k=q.t<0?1+q.t/HANDS.tell:1,n=Math.ceil(q.arms.length*k);
  for(let i=0;i<q.arms.length;i++){const a=q.arms[i],ax=Math.round(a.x-cx);
   if(q.t<0){if(i>=n)break;const lit=ventLit(vents,a.x,A.floor);if(lit)continue;g.fillStyle='#1a1410';g.fillRect(ax-9,y-2,18,2);g.fillStyle='#d8cfb0';for(let j=-8;j<=8;j+=4)g.fillRect(ax+j,y-3-((i+j)&1),2,1);
    if(i===n-1){g.fillStyle='#a86048';g.fillRect(ax-2,y-5-Math.round(Math.sin(time*30)),4,3);}continue;}
   const t=q.t-a.at;if(t<0||t>HANDS.up)continue;
   if(a.blocked){if(t<.2){g.globalAlpha=.6*(1-t/.2);g.fillStyle='#6a6a60';g.fillRect(ax-4,y-6-t*30,8,4);g.globalAlpha=1;}continue;}   /* in the light: a puff of grave dust, and nothing comes up */
   const h=Math.round(28*Math.sin(Math.PI*Math.min(1,t/HANDS.up)));g.fillStyle='#1a1410';g.fillRect(ax-7,y-2,14,3);
   g.fillStyle='#4e5a3c';g.fillRect(ax-2,y-h,5,h);g.fillStyle='#d8cfb0';g.fillRect(ax-1,y-h,2,h);
   g.fillStyle='#d8cfb0';for(let j=-3;j<=3;j+=2)g.fillRect(ax+j,y-h-5,1,5);g.fillRect(ax-4,y-h-1,9,2);}}
 /* GRAVE BREATH: a pale cold wall going out both ways from him, frost on the floor behind it */
 if(e.mode==='breathTell'){const k=1-Math.max(0,e.modeT)/BREATH.tell;g.fillStyle='rgba(191,230,245,'+(.15+.3*k).toFixed(2)+')';for(let i=0;i<8;i++){const a=i/8*Math.PI*2+time*3,r=40*(1-k)+6;g.fillRect(Math.round(x+Math.cos(a)*r+8),Math.round(y-70+Math.sin(a)*r*.5),2,2);}}
 if(e.breath){const b=e.breath;for(const s of [-1,1]){const bx=Math.round(b.x+s*b.r-cx);g.fillStyle='rgba(191,230,245,.35)';g.fillRect(bx-(s>0?10:0),y-96,10,96);g.fillStyle='rgba(232,248,255,.6)';g.fillRect(bx-(s>0?2:0),y-96,2,96);}
  g.fillStyle='rgba(191,230,245,.25)';g.fillRect(Math.round(b.x-b.r-cx),y-2,Math.round(b.r*2),2);}
 if(e.mode==='slamTell'||e.effect==='slamTell'&&e.effectT>0){const r=e.phase===2?175:145;g.fillStyle='rgba(244,126,85,.28)';g.fillRect(x-r,y-25,r*2,25);g.strokeStyle='#ffc082';g.strokeRect(x-r,y-25,r*2,25);}
 g.restore();
}
