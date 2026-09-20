const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function updateVaultKeeper(e,dt,c){
 const {P,A,move,hit,seed,say,sound}=c;if(!c.active||P.dead||!e.alive)return;
 e.anim+=dt;e.modeT-=dt;e.open=Math.max(0,(e.open||0)-dt);e.fxT=Math.max(0,(e.fxT||0)-dt);e.vx=e.vy=0;
 const rest=()=>{e.mode='vaultRest';e.modeT=1.7;e.open=1.7;};
 if(e.phase===1&&e.hp<=e.hp0*.5){e.phase=2;e.mode='vaultRally';e.modeT=1.5;e.vaultTurn=0;say('THE VAULT RESONATES',true);sound('seaBell');return;}
 if(e.mode==='vaultRest'||e.mode==='vaultRally'){if(e.modeT<=0){e.mode='walk';e.modeT=1.2;}return;}
 if(e.mode==='walk'){
  const dx=P.x-e.x,dy=P.y-e.y;e.face=Math.sign(dx)||e.face;e.vx=Math.abs(dx)>44?Math.sign(dx)*38:0;e.vy=Math.abs(dy)>18?Math.sign(dy)*38:0;move(e,e.vx*dt,e.vy*dt);e.x=clamp(e.x,A.x0+22,A.x1-22);e.y=clamp(e.y,A.y0+48,A.floor);
  if(e.modeT>0)return;
  const moves=e.phase===2?['band','spear','pressure','ring','hook']:['hook','spear','ring','pressure'];const m=moves[e.vaultTurn++%moves.length];e.mode='vault'+m[0].toUpperCase()+m.slice(1)+'Tell';e.modeT=m==='hook'?.8:1.15;e.aimX=P.x;e.aimY=P.y-10;
  say(({hook:'HOOK: GUARD',spear:'SPEAR: GUARD OR SWIM ASIDE',ring:'BELL RING: SWIM AWAY',pressure:'PRESSURE: LEAVE THE CIRCLE',band:'PRESSURE BAND: SWIM UP OR DOWN'})[m],!['hook','spear'].includes(m));sound('seaBell');return;
 }
 if(!e.mode.endsWith('Tell')||e.modeT>0)return;
 const m=e.mode;e.fx=m;e.fxT=.4;
 if(m==='vaultHookTell'){if(Math.hypot(P.x-e.x,P.y-e.y)<65)hit(e.x,16,false);sound('clank');}
 if(m==='vaultSpearTell'){
  const x=e.x,y=e.y-18,angle=Math.atan2(e.aimY-y,e.aimX-x);
  for(const offset of e.phase===2?[-.18,0,.18]:[0])seed({x,y,vx:Math.cos(angle+offset)*175,vy:Math.sin(angle+offset)*175,g:0,life:2.5,shot:true,dmg:12,owner:e,vaultShot:true});sound('grapple');
 }
 if(m==='vaultRingTell'){if(Math.hypot(P.x-e.x,P.y-10-(e.y-18))<88)hit(e.x,18,true);sound('seaBell');}
 if(m==='vaultPressureTell'){if(Math.hypot(P.x-e.aimX,P.y-10-e.aimY)<34)hit(e.aimX,18,true);sound('splash');}
 if(m==='vaultBandTell'){if(Math.abs(P.y-10-e.aimY)<22)hit(e.x,18,true);sound('waveCrash');}
 rest();
}
export function drawVaultKeeper(g,e,A,cx,cy,time){
 if(!e?.alive)return;const tell=e.mode.endsWith('Tell'),fx=e.fxT>0,m=tell?e.mode:e.fx;if(!tell&&!fx)return;
 g.save();g.globalCompositeOperation='source-over';g.strokeStyle=fx?'#efffff':'#ffbc95';g.fillStyle='#f58d8f';g.lineWidth=2;g.globalAlpha=fx?.7:.65;
 const circle=(x,y,r)=>{g.beginPath();g.arc(x-cx,y-cy,r,0,Math.PI*2);g.stroke();};
 if(m==='vaultRingTell')circle(e.x,e.y-18,88);
 if(m==='vaultPressureTell'){circle(e.aimX,e.aimY,34);g.globalAlpha=.18;g.beginPath();g.arc(e.aimX-cx,e.aimY-cy,34,0,Math.PI*2);g.fill();}
 if(m==='vaultBandTell'){g.globalAlpha=.22;g.fillRect(A.x0-cx,e.aimY-22-cy,A.x1-A.x0,44);g.globalAlpha=.8;g.strokeRect(A.x0-cx,e.aimY-22-cy,A.x1-A.x0,44);}
 if(m==='vaultSpearTell'){g.strokeStyle='#ffe49b';g.setLineDash([3,4]);g.beginPath();g.moveTo(e.x-cx,e.y-18-cy);g.lineTo(e.aimX-cx,e.aimY-cy);g.stroke();}
 g.restore();
}
