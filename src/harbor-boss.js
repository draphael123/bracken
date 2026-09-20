import {canvas,outline,flipX,whiten} from './px.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function updateWarden(e,dt,c){
 const {P,A,hit,seed,say,sound}=c;
 if(!e.alive||P.dead||e.mode==='sleep')return;
 e.anim+=dt;e.modeT-=dt;e.open=Math.max(0,(e.open||0)-dt);e.effectT=Math.max(0,(e.effectT||0)-dt);e.y=A.floor;e.vx=e.vy=0;
 const rest=(t=1.8)=>{e.mode='vent';e.modeT=t;e.open=t;e.marks=[];say('HELMET OPEN',false);sound('hiss');};
 if(e.phase===1&&e.hp<=e.hp0*.5){e.phase=2;e.mode='rally';e.modeT=1.8;e.marks=[];e.turn=0;say('HIGH TIDE',true);sound('seaBell');return;}
 if(['wake','rally','vent'].includes(e.mode)){if(e.modeT<=0){e.mode='advance';e.modeT=1;}return;}
 if(e.mode==='advance'){
  const dx=P.x-e.x;e.face=Math.sign(dx)||e.face;
  if(Math.abs(dx)>45){e.vx=e.face*52;e.x=clamp(e.x+e.vx*dt,A.x0+42,A.x1-42);}
  if(e.modeT>0)return;
  const moves=e.phase===2?['high','anchor','twin','harpoon','low','pressure']:['anchor','low','harpoon','pressure'];
  const move=moves[e.turn++%moves.length];e.mode=move+'Tell';e.modeT=move==='anchor'?.85:1.2;
  e.aimX=P.x;e.aimY=P.y-10;e.marks=(move==='twin'?[-48,48]:[0]).map(dx=>clamp(P.x+dx,A.x0+24,A.x1-24));
  say(({anchor:'ANCHOR: GUARD',low:'LOW SURGE: JUMP',harpoon:'HARPOON: GUARD',pressure:'PRESSURE: MOVE',twin:'TWIN VENTS: FIND THE GAP',high:'HIGH SURGE: STAY LOW'})[move],!['anchor','harpoon'].includes(move));sound('charge');return;
 }
 if(!e.mode.endsWith('Tell')||e.modeT>0)return;
 const move=e.mode.slice(0,-4);e.effect=move;e.effectT=.35;e.effectMarks=[...e.marks];
 if(move==='anchor'){
  if(Math.sign(P.x-e.x)===e.face&&Math.abs(P.x-e.x)<66&&Math.abs(P.y-e.y)<48){if(hit(e.x,20,false)==='blocked'){rest(2.3);return;}}sound('heavy');
 }else if(move==='harpoon'){
  const x=e.x+e.face*18,y=e.y-30,d=Math.hypot(e.aimX-x,e.aimY-y)||1;
  seed({x,y,vx:(e.aimX-x)/d*220,vy:(e.aimY-y)/d*220,g:0,life:2,shot:true,dmg:16,owner:e,wardenShot:true});sound('grapple');
 }else if(move==='pressure'||move==='twin'){
  for(const x of e.marks)if(Math.abs(P.x-x)<24)hit(x,20,true);sound('splash');
 }else{
  const high=move==='high';if(high?P.y-P.h<A.floor-30&&P.y>A.floor-86:P.y>A.floor-24)hit(e.x,18,true);sound('waveCrash');
 }
 rest();
}
export function wardenFrame(e){return e.open>0?7:e.mode==='anchorTell'?3:e.mode==='harpoonTell'?5:e.mode?.endsWith('Tell')?6:e.effectT>0?4:Math.abs(e.vx)>2?1+Math.floor(e.anim*7)%2:0;}
export function bakeHarbormaster(){
 const R=[];
 for(let f=0;f<8;f++){
  const [c,g]=canvas(72,68),r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);},step=f===1?2:f===2?-2:0;
  r(23,42,10,19+step,'#315c61');r(36,42,10,19-step,'#23454e');r(19,59+step,16,5,'#b69755');r(35,59-step,17,5,'#806a43');
  r(20,26,29,25,'#29464c');r(22,27,25,19,'#427d79');r(24,28,4,15,'#72a49a');r(19,46,31,5,'#bea363');r(30,45,8,7,'#e7ce86');
  r(22,14,24,17,'#9a793d');r(25,11,18,22,'#c1a05c');r(27,12,12,3,'#ead697');r(29,17,15,11,f===7?'#81e6c0':'#1e353f');r(32,19,9,6,f===7?'#e1ffe1':'#4c8290');
  for(const x of [25,42])for(const y of [16,28])r(x,y,2,2,'#f3d995');r(19,31,6,12,'#bda46d');r(46,30,7,12,'#8a724b');
  const ax=f===3?55:f===4?62:55,ay=f===3?12:f===4?34:39;
  r(ax-1,ay,3,20,'#c7c9bc');r(ax-7,ay+4,15,3,'#697c80');r(ax-8,ay+15,3,6,'#adb7ad');r(ax+6,ay+15,3,6,'#adb7ad');r(ax-7,ay+20,15,3,'#7f9695');
  if(f===5){r(46,29,21,4,'#adbdc2');r(64,27,4,8,'#d6d8bd');}else if(f===6){r(12,23,7,15,'#bba36f');r(12,20,7,4,'#72c5bf');}
  if(f===7){r(25,7,4,3,'#bcebe1');r(38,5,3,5,'#82c7c7');}
  R.push(outline(c));
 }
 const W=R.map(c=>whiten(c));return {R,L:R.map(flipX),white:{R:W,L:W.map(flipX)},ax:35,ay:64,w:72,h:68};
}
export function drawWarden(g,e,A,cx,cy,time){
 if(!e?.alive||!A)return;
 const fl=A.floor-cy,left=A.x0-cx,width=A.x1-A.x0,tell=e.mode.endsWith('Tell'),effect=e.effectT>0,m=effect?e.effect:e.mode.slice(0,-4);
 if(!tell&&!effect)return;
 g.save();g.globalCompositeOperation='source-over';g.fillStyle=effect?'#b9f1eb':'#ff7674';g.globalAlpha=effect?.55:.3+.08*Math.sin(time*12);
 if(m==='low'||m==='high'){const y=fl-(m==='high'?86:24);g.fillRect(left,y,width,m==='high'?56:24);g.globalAlpha=.85;g.fillRect(left,y,width,2);}
 if(m==='pressure'||m==='twin')for(const x of effect?e.effectMarks:e.marks){g.fillRect(x-cx-24,fl-145,48,145);g.globalAlpha=.8;g.fillRect(x-cx-24,fl-3,48,3);g.strokeStyle='#ffe5b3';g.strokeRect(Math.round(x-cx-24)+.5,Math.round(fl-145)+.5,47,144);g.globalAlpha=effect?.55:.3;}
 if(m==='harpoon'){g.globalAlpha=.8;g.strokeStyle='#ffd36b';g.setLineDash([4,4]);g.beginPath();g.moveTo(e.x-cx,e.y-30-cy);g.lineTo(e.aimX-cx,e.aimY-cy);g.stroke();}
 if(m==='anchor'){g.globalAlpha=.4;g.fillStyle='#ffd36b';g.fillRect(e.x-cx+(e.face<0?-66:0),fl-45,66,45);}
 g.restore();
}
