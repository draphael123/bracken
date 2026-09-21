import {canvas,outline,flipX,whiten} from './px.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function updateBuriedDead(e,dt,c){
 const{P,A,hit,summon,say,sound}=c;if(!e.alive||P.dead||e.mode==='sleep')return;
 e.anim+=dt;e.modeT-=dt;e.open=Math.max(0,(e.open||0)-dt);e.effectT=Math.max(0,(e.effectT||0)-dt);e.y=A.floor;e.vx=e.vy=0;
 const rest=()=>{e.mode='rest';e.modeT=2.2;e.open=2.2;};
 if(e.phase===1&&e.hp<=e.hp0*.5&&e.mode!=='burrow'&&e.mode!=='eruptTell'){e.phase=2;e.mode='rally';e.modeT=1.5;e.turn=0;say('THE GRAVES ANSWER',true);sound('roar');return;}
 e.brokeT=Math.max(0,(e.brokeT||0)-dt);
 if(e.mode==='stuck'){if(e.modeT<=0){e.mode='walk';e.modeT=.9;say('HE TEARS IT FREE',false);}return;}
 if(['wake','rest','rally'].includes(e.mode)){if(e.modeT<=0){e.mode='walk';e.modeT=.9;}return;}
 if(e.mode==='burrow'){
  e.x=clamp(e.x+Math.sign(P.x-e.x)*Math.min(Math.abs(P.x-e.x),120*dt),A.x0+38,A.x1-38);
  if(e.modeT<=0){e.mode='eruptTell';e.modeT=1.1;e.markX=e.x;say('THE EARTH BREAKS: MOVE',true);sound('charge');}return;
 }
 if(e.mode==='walk'){
  const dx=P.x-e.x;e.face=Math.sign(dx)||e.face;if(Math.abs(dx)>58){e.vx=e.face*36;e.x=clamp(e.x+e.vx*dt,A.x0+38,A.x1-38);}if(e.modeT>0)return;
  const m=['slamTell','callTell','sinkTell','cleaveTell'][e.turn++%4];e.mode=m;e.modeT=m==='callTell'?1.3:1;e.markX=e.x;
  say(({slamTell:'SLAM: JUMP',callTell:'THE DEAD RISE',sinkTell:'FOLLOW THE SHADOW',cleaveTell:'SWEEP: GUARD OR RETREAT'})[m],m==='slamTell');sound('charge');return;
 }
 if(e.modeT>0||!e.mode.endsWith('Tell'))return;
 const m=e.mode;e.effect=m;e.effectT=.35;
 if(m==='sinkTell'){e.mode='burrow';e.modeT=.7;sound('hiss');return;}
 if(m==='slamTell'){if(Math.abs(P.x-e.x)<(e.phase===2?175:145)&&P.y>A.floor-25)hit(e.x,24,true);sound('heavy');
  /* THE GROUND HE ALREADY BROKE WILL NOT HOLD HIS FIST. Every opening he had was the rest he takes anyway, so there was
     nothing in this fight the player caused: stand over the hole he erupted from, let the slam come down on it, and the
     arm goes in to the shoulder. That is a punish you set up, and it is twice the window his own rest gives. */
  if(e.brokeT>0&&Math.abs(e.x-e.brokeX)<30){e.mode='stuck';e.modeT=3.4;e.open=3.4;e.brokeT=0;say('HIS ARM IS IN THE GROUND',true);sound('crack');return;}}
 if(m==='cleaveTell'){if(Math.abs(P.x-e.x)<82&&Math.abs(P.y-e.y)<58)hit(e.x,20,false);sound('heavy');}
 if(m==='callTell'){summon(e.phase===2?2:1);sound('roar');}
 if(m==='eruptTell'){if(Math.abs(P.x-e.markX)<42&&P.y>A.floor-90)hit(e.markX,26,true);sound('heavy');e.brokeX=e.markX;e.brokeT=14;}
 rest();
}
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
 if(e.mode==='buried'){if(Math.abs(P.x-e.x)<85&&Math.abs(P.y-e.y)<60){e.mode='riseTell';e.modeT=1.1;say('MOVING EARTH',false);}return;}
 if(e.mode==='riseTell'){if(e.modeT<=0){e.mode='walk';e.modeT=.7;}return;}
 if(e.mode==='grabTell'){if(e.modeT<=0){if(Math.abs(P.x-e.x)<28&&Math.abs(P.y-e.y)<28){if(hit(e.x,12,false)==='hit')snare(.75);}e.mode='rest';e.modeT=1;}return;}
 if(e.mode==='rest'){if(e.modeT<=0)e.mode='walk';return;}
 e.face=Math.sign(P.x-e.x)||e.face;e.vy=Math.min(320,(e.vy||0)+1000*dt);
 if(Math.abs(P.x-e.x)<25&&Math.abs(P.y-e.y)<25){e.mode='grabTell';e.modeT=.7;say('GRAB',false);return;}
 e.vx=solid(e.x+e.face*16,e.y+4)?e.face*(e.husk?17:e.apprentice?22:25):0;if(move(e,e.vx*dt,e.vy*dt)?.ground)e.vy=0;
}
export function deadFrame(e){return e.mode==='stuck'?5:e.mode==='burrow'||e.mode==='eruptTell'||e.mode==='buried'||e.mode==='riseTell'?6:e.open>0?5:e.mode==='slamTell'?3:e.mode==='callTell'?4:e.mode?.endsWith('Tell')?2:Math.abs(e.vx)>2?Math.floor(e.anim*5)%2:0;}
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
export function drawBuriedDead(g,e,A,cx,cy,time){
 if(!e?.alive||!A)return;const x=e.x-cx,y=A.floor-cy;g.save();g.globalCompositeOperation='source-over';
 if(['burrow','eruptTell','sinkTell'].includes(e.mode)){const locked=e.mode==='eruptTell';g.fillStyle=locked?'#a86048':'#292320';g.beginPath();g.ellipse(x,y-2,locked?42:28,6,0,0,7);g.fill();g.strokeStyle=locked?'#ffd36b':'#b29e78';g.lineWidth=2;g.stroke();for(let k=-20;k<=20;k+=10)g.fillRect(x+k,y-5-Math.sin(time*12+k)*3,3,3);}
 if(e.mode==='slamTell'||e.effect==='slamTell'&&e.effectT>0){const r=e.phase===2?175:145;g.fillStyle='rgba(244,126,85,.28)';g.fillRect(x-r,y-25,r*2,25);g.strokeStyle='#ffc082';g.strokeRect(x-r,y-25,r*2,25);}
 g.restore();
}
