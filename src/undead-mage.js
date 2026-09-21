import {canvas,flipX,whiten} from './px.js';
export function smallerFamiliar(s){
 const scale=c=>{const[n,g]=canvas(Math.round(c.width*.7),Math.round(c.height*.7));g.drawImage(c,0,0,n.width,n.height);return n;};
 return {...s,R:s.R.map(scale),L:s.L.map(scale),white:{R:s.white.R.map(scale),L:s.white.L.map(scale)},ax:Math.round(s.ax*.7),ay:Math.round(s.ay*.7),w:39,h:42};
}
export function bakeUndeadMage(s){
 const R=s.R.map((c,frame)=>{const[n,g]=canvas(c.width,c.height);g.drawImage(c,0,0);const d=g.getImageData(0,0,n.width,n.height);for(let i=0;i<d.data.length;i+=4){if(!d.data[i+3])continue;const r=d.data[i],b=d.data[i+2];d.data[i]=Math.min(220,r*.65+28);d.data[i+1]=Math.min(240,b*.75+25);d.data[i+2]=Math.min(250,b*.8+35);}g.putImageData(d,0,0);if(frame!==10){const y=frame===8?24:frame===1?13:15;g.fillStyle='#d9ddc5';g.fillRect(21,y-2,9,6);g.fillRect(23,y+4,5,3);g.fillStyle='#293941';g.fillRect(22,y,2,2);g.fillRect(27,y,2,2);g.fillRect(25,y+3,1,2);g.fillStyle='#9febdc';g.fillRect(22,y,1,1);g.fillRect(27,y,1,1);}return n;});const W=R.map(c=>whiten(c));return {...s,R,L:R.map(flipX),white:{R:W,L:W.map(flipX)}};
}
export function liveTowerBounds(slabs){let lo=13*16,hi=99*16;for(const z of slabs)if(z.down){if(z.x0<48)lo=Math.max(lo,(z.x1+1)*16);else hi=Math.min(hi,z.x0*16);}return[lo,hi];}
export function updateUndeadMage(e,dt,c){
 const{P,A,slabs,change,hit,say,sound}=c;if(!e.alive||P.dead||e.mode==='sleep')return;
 e.flashT=Math.max(0,(e.flashT||0)-dt);e.anim+=dt;e.modeT-=dt;e.open=Math.max(0,(e.open||0)-dt);e.shots??=[];e.stage??=0;e.turn??=0;
 const bounds=()=>liveTowerBounds(slabs),rest=()=>{e.mode='rest';e.modeT=2.5;e.open=2.5;};
 for(const q of e.shots){q.t-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(!q.hit&&Math.abs(P.x-q.x)<q.r+5&&Math.abs(P.y-9-q.y)<q.r+9){hit(q.x,q.dmg,false);q.hit=true;q.t=0;}}e.shots=e.shots.filter(q=>q.t>0);
 if(e.mode==='collapse'){
  /* THE SPELL CAN BE BROKEN. He holds the floor down with both hands and was untouchable while he did it; cut him
     here and the far slab survives the stage - the footing the player keeps is the footing he fought for. */
  if(e.castHit>=2){e.castHit=0;const kept=slabs.filter(z=>z.stage===e.stage+1&&!z.down).sort((a,b)=>b.t-a.t)[0];
   if(kept)kept.t=-1;e.mode='reel';e.modeT=3;e.open=3;e.stage++;say('THE SPELL BREAKS',true);sound('crack');return;}
  for(const z of slabs)if(z.stage===e.stage+1&&!z.down){z.t-=dt;if(z.t<=0){z.down=true;for(let x=z.x0;x<=z.x1;x++)for(let y=40;y<48;y++)change(x,y);}}
  if(e.modeT<=0){e.stage++;const[lo,hi]=bounds();e.x=Math.max(lo+24,Math.min(hi-24,e.x));e.y=A.floor;sound('stone');rest();}return;
 }
 if(e.stage<3&&e.hp<=e.hp0*(.75-.25*e.stage)+.01){e.mode='collapse';e.modeT=3;e.open=0;e.castHit=0;e.shots=[];for(const z of slabs)if(z.stage===e.stage+1)z.t=3;say('THE FLOOR BREAKS: MOVE IN',true);sound('crack');return;}
 if(e.mode==='reel'){if(e.modeT<=0){const[lo,hi]=bounds();e.x=Math.max(lo+24,Math.min(hi-24,e.x));e.y=A.floor;rest();}return;}
 if(e.mode==='wake'){if(e.modeT<=0)rest();return;}
 if(e.mode==='rest'){
  if(e.modeT>0)return;const[lo,hi]=bounds();const spots=[Math.max(lo+30,Math.min(hi-30,P.x-130)),(lo+hi)/2,Math.max(lo+30,Math.min(hi-30,P.x+130))];e.teleX=spots[(e.turn+1)%3];if(Math.abs(e.teleX-P.x)<36)e.teleX=spots.find(x=>Math.abs(x-P.x)>40)??spots[1];e.mode='blink';e.modeT=.7;say('TELEPORT',false);return;
 }
 if(e.mode==='blink'){if(e.modeT<=0){e.x=e.teleX;e.y=A.floor;e.face=Math.sign(P.x-e.x)||1;e.mode=['fireTell','iceTell','stormTell'][e.turn++%3];e.modeT=e.mode==='stormTell'?1.25:1;e.markX=P.x;say({fireTell:'FIRE: GUARD OR ROLL',iceTell:'FROST: JUMP',stormTell:'LIGHTNING: LEAVE THE MARK'}[e.mode],e.mode==='stormTell');}return;}
 if(e.modeT>0)return;
 const shot=(vx,vy,y,r,col,dmg)=>e.shots.push({x:e.x,y,vx,vy,r,col,dmg,t:4});
 if(e.mode==='fireTell'){for(const v of [-28,0,28])shot(e.face*125,v,e.y-18,5,'#ff9b49',16);sound('mageBolt');rest();}
 else if(e.mode==='iceTell'){shot(-105,0,e.y-5,5,'#9be2ff',14);shot(105,0,e.y-5,5,'#9be2ff',14);sound('hiss');rest();}
 else if(e.mode==='stormTell'){if(Math.abs(P.x-e.markX)<18&&P.y>A.y0)hit(e.markX,24,true);e.flashX=e.markX;e.flashT=.3;sound('heavy');rest();}
 e.flashT=Math.max(0,(e.flashT||0)-dt);
}
export function drawUndeadMage(g,e,A,slabs,cx,cy,time){
 if(!e?.alive)return;g.save();
 for(const z of slabs)if(z.t>0&&!z.down){g.fillStyle=Math.floor(time*8)%2?'#ffbd70':'#e7604a';g.fillRect(z.x0*16-cx,A.floor-cy-3,(z.x1-z.x0+1)*16,3);for(let x=z.x0;x<=z.x1;x+=2)g.fillRect(x*16-cx,A.floor-cy-12,2,9);}
 if(e.mode==='blink'){g.strokeStyle='#bce8fa';g.strokeRect(e.teleX-cx-12,A.floor-cy-36,24,36);}
 if(e.mode==='stormTell'||e.flashT>0){g.fillStyle=e.mode==='stormTell'?'rgba(210,209,255,.3)':'#e9e9ff';g.fillRect((e.mode==='stormTell'?e.markX:e.flashX)-cx-18,A.y0-cy,36,A.floor-A.y0);}
 for(const q of e.shots||[]){g.fillStyle=q.col;g.fillRect(q.x-cx-q.r,q.y-cy-q.r,q.r*2,q.r*2);}
 g.restore();
}
