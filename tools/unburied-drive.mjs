/* tools/unburied-drive.mjs [startTile] [heroes] - a scripted hand on THE UNBURIED FIELD, NO god mode: holds right, swings at
   anything within 40px, hops stake lines and anything above it, strikes the trebuchet once. Not the play bot (tools/unburied-walk.mjs):
   a dumber hand that keeps going, for F9. It cannot climb (the tower) or read a tell. Not in the suite. */
import { openPage } from './cdp.mjs';
const START = +(process.argv[2]||0), HEROES=(process.argv[3]||'knight,warden').split(',');
const pg = await openPage({ audio: false, fonts: false });
try { for (const hero of HEROES) {
  const r = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('${hero}');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='unburied'));BK.state='play';BK.god=false;BK.reset();if(${START})BK.tp(${START},36);
   const K=BK.keys,P=BK.P;let maxX=0,deaths=0,wasDead=false,still=0,lastX=P.x,log=[],jumpT=0;const marks=[];
   for(let f=0;f<60*700;f++){
     const dead=!!P.dead;if(dead&&!wasDead){deaths++;log.push('died @'+Math.round(P.x/16)+','+Math.round(P.y/16)+' by '+(P.killer&&P.killer.name||P.killer&&P.killer.t||'?'));}wasDead=dead;
     K.right=true;K.down=false;
     /* strike anything near, low or high; finish the fallen */
     if(!marks.treb&&P.x>230*16-20){marks.treb=1;K.right=false;for(let k=0;k<20;k++)BK.sim(1);P.face=1;BK.press('atk');for(let k=0;k<30;k++){K.right=false;BK.sim(1);}for(let k=0;k<200;k++){K.right=false;BK.sim(1);}log.push('struck the trebuchet, breach '+BK.unbField().breach+' at x '+Math.round(P.x/16));}
     const near=BK.enemies().filter(e=>e.alive&&Math.abs(e.x-P.x)<40&&Math.abs(e.y-P.y)<40);
     if(near.length&&f%12===0){P.face=Math.sign(near[0].x-P.x)||1;K.right=near[0].x>P.x+18;if(near[0].t==='corpse'&&near[0].mode==='down')K.down=false;BK.press('atk');}
     if(Math.abs(P.x-lastX)<0.3)still++;else still=0;lastX=P.x;const L=BK.L,tx=Math.floor(P.x/16),ty=Math.floor(P.y/16);let spk=false;for(let d=1;d<=2;d++)for(let dy=0;dy<=1;dy++)if(L.grid[(ty+dy)*L.W+tx+d]===T.SPIKE)spk=true;if(spk&&P.ground&&jumpT<=0){BK.press('jump');K.jump=true;jumpT=22;}const up=near.find(e=>e.y<P.y-20);if(up&&P.ground&&jumpT<=0&&f%30===0){BK.press('jump');K.jump=true;jumpT=18;}
     if(still>8&&jumpT<=0){BK.press('jump');K.jump=true;jumpT=22;}if(jumpT>0){jumpT--;if(jumpT===0)K.jump=false;}
     BK.sim(1);maxX=Math.max(maxX,P.x);
     if(f%600===0)marks.push(Math.round(P.x/16));
     if(BK.state!=='play')break;
   }
   const F=BK.unbField();return {breach:F.breach,volleysQuiet:F.volleys.map(v=>v.quiet).join(),mini:BK.miniActive,hero:'${hero}',maxTile:Math.round(maxX/16),deaths,state:BK.state,boss:BK.boss&&{alive:BK.boss.alive,hp:BK.boss.hp},every10s:marks.join(' '),log:log.slice(0,12)};})()`, 900000);
  console.log(JSON.stringify(r)); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
