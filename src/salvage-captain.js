// Stormwreck Harbor's named boatswain: cargo, grapnel and the two quay guns.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function updateSalvageCaptain(e,dt,c){
 const {P,A,active,hit,seed,say,sound}=c;
 if(!active||!e.alive||P.dead)return;
 e.impactT=Math.max(0,(e.impactT||0)-dt);e.anim+=dt;e.modeT-=dt;e.vx=e.vy=0;e.y=A.floor;
 const rest=(t=1.25)=>{e.mode='salvageRest';e.modeT=t;e.cargo=[];};
 if(e.phase===1&&e.hp<=e.hp0*.5){e.phase=2;e.mode='salvageRally';e.modeT=1.5;e.salvageN=0;e.cargo=[];say('BOTH GUNS!',true);sound('whistleCall');return;}
 if(e.mode==='salvageRally'){if(e.modeT<=0)rest(.6);return;}
 if(e.mode==='salvageRest'){if(e.modeT<=0){e.mode='salvageAdvance';e.modeT=1;}return;}
 if(e.mode==='walk'||e.mode==='salvageAdvance'){
  const dx=P.x-e.x;e.face=Math.sign(dx)||e.face;
  if(Math.abs(dx)>42&&!(e.stagger>0)){e.vx=e.face*48;e.x=clamp(e.x+e.vx*dt,A.x0+48,A.x1-48);}
  if(e.modeT>0||e.stagger>0)return;
  const rotation=e.phase===2?['crossfire','pin','cargo','hook','broadside','cargo']:['pin','hook','cargo','broadside'];
  const move=rotation[e.salvageN++%rotation.length];
  e.mode='salvage'+move[0].toUpperCase()+move.slice(1)+'Tell';e.modeT=move==='cargo'?1.15:move==='pin'?.65:1;
  e.aimX=P.x;e.aimY=P.y-10;e.gunSide=P.x<(A.x0+A.x1)/2?-1:1;
  if(move==='cargo')e.cargo=(e.phase===2?[-64,0,64]:[0]).map(dx=>clamp(P.x+dx,A.x0+52,A.x1-52));
  say(({pin:'THE BELAYING PIN',hook:'THE GRAPNEL',cargo:'CARGO: LEAVE THE MARKS',broadside:'LOW SHOTS: JUMP',crossfire:'BOTH SIDES: JUMP'})[move],!['pin','hook'].includes(move));sound(move==='cargo'?'ropeHaul':'charge');return;
 }
 if(e.mode==='salvagePinTell'&&e.modeT<=0){
  if(Math.sign(P.x-e.x)===e.face&&Math.abs(P.x-e.x)<48&&Math.abs(P.y-e.y)<26){const res=hit(e.x,c.pinDamage,false);if(res==='blocked'){rest(1.8);say('PARRIED: STRIKE',false);return;}}
  sound('heavy');e.mode='salvagePin';e.modeT=.25;return;
 }
 if(e.mode==='salvageHookTell'&&e.modeT<=0){const x=e.x+e.face*12,y=e.y-18,d=Math.hypot(e.aimX-x,e.aimY-y)||1;seed({x,y,vx:(e.aimX-x)/d*260,vy:(e.aimY-y)/d*260,g:0,life:1.35,chain:true,boot:true,from:e});sound('grapple');rest(1.5);return;}
 if(e.mode==='salvageCargoTell'&&e.modeT<=0){e.mode='salvageCargo';e.modeT=.32;sound('ropeHaul');return;}
 if(e.mode==='salvageCargo'&&e.modeT<=0){
  for(const x of e.cargo)if(Math.abs(P.x-x)<22&&P.y>A.floor-38&&P.y-P.h<A.floor)hit(x,c.cargoDamage,true);
  e.impactMarks=[...e.cargo];e.impactT=.35;sound('thud');rest(1.6);return;
 }
 if((e.mode==='salvageBroadsideTell'||e.mode==='salvageCrossfireTell')&&e.modeT<=0){e.cross=e.mode==='salvageCrossfireTell';e.mode='salvageGuns';e.modeT=0;e.salvo=0;return;}
 if(e.mode==='salvageGuns'&&e.modeT<=0){
  const sides=e.cross?[-1,1]:[e.gunSide];
  for(const side of sides)seed({x:side<0?A.x0+36:A.x1-36,y:A.floor-9,vx:-side*210,vy:0,g:0,life:2.5,shot:true,unblockable:true,dmg:c.shotDamage,owner:e,salvageShot:true});
  sound('crack');e.salvo++;if(e.salvo>=2)rest(1.7);else e.modeT=.18;return;
 }
 if(e.mode==='salvagePin'&&e.modeT<=0)rest();
}
export function drawSalvageCaptain(g,e,A,cx,cy,time){
 if(!A?.salvage)return;
 const floor=Math.round(A.floor-cy),top=Math.round(A.y0-cy);
 g.save();
 for(const side of [-1,1]){const x=Math.round((side<0?A.x0+24:A.x1-24)-cx);g.fillStyle='#503b2b';g.fillRect(x-10,floor-7,20,7);g.fillStyle='#969d9d';g.fillRect(x-9,floor-14,18,7);g.fillStyle='#303b42';g.fillRect(x+(side<0?5:-14),floor-13,9,5);g.fillStyle='#252733';g.fillRect(x-7,floor-5,5,5);g.fillRect(x+3,floor-5,5,5);}
 if(e?.alive){
  if(e.impactT>0)for(const wx of e.impactMarks||[]){const x=Math.round(wx-cx);g.globalAlpha=e.impactT/.35;g.fillStyle='#d7b078';for(let j=-3;j<=3;j++)g.fillRect(x+j*7,floor-4-Math.abs(j)*2,4,3);g.globalAlpha=1;}
  if(e.mode==='salvageCargoTell'||e.mode==='salvageCargo')for(const wx of e.cargo||[]){const x=Math.round(wx-cx),fall=e.mode==='salvageCargo'?clamp(1-e.modeT/.32,0,1):0,y=Math.round(top+20+(floor-top-36)*fall);g.fillStyle='#ff6b6b';g.globalAlpha=.22+.12*Math.sin(time*16);g.fillRect(x-22,top,44,floor-top);g.globalAlpha=1;g.fillRect(x-22,floor-2,44,2);g.fillStyle='#aca48c';g.fillRect(x-1,top,2,y-top);g.fillStyle='#765236';g.fillRect(x-13,y,26,16);g.strokeStyle='#dfbd83';g.strokeRect(x-12.5,y+.5,25,15);g.beginPath();g.moveTo(x-12,y+1);g.lineTo(x+12,y+15);g.stroke();}
  if(e.mode==='salvageBroadsideTell'||e.mode==='salvageCrossfireTell'){g.globalAlpha=.35+.2*Math.sin(time*16);g.fillStyle='#ff6b6b';g.fillRect(Math.round(A.x0+36-cx),floor-13,A.x1-A.x0-72,7);g.globalAlpha=1;}
  if(e.mode==='salvageHookTell'){g.strokeStyle='#ffd36b';g.setLineDash([3,4]);g.beginPath();g.moveTo(e.x+e.face*12-cx,e.y-18-cy);g.lineTo(e.aimX-cx,e.aimY-cy);g.stroke();}
 }
 g.restore();
}
