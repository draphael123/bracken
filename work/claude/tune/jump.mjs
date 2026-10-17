import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const idx=LEVELS.findIndex(l=>l.id==='flotilla');const out={};
 for(const h of ['knight','warden','pyro','ranger','paladin','reaper','geomancer']){BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=false;BK.sim(5);for(const e of BK.enemies())e.alive=false;const P=BK.P,K=BK.keys;
  BK.tp(112,23);BK.sim(30);P.x=110*16+4;BK.sim(2);const x0=P.x,y0=P.y;let best=0,mx=0;
  // flat-ground running jump: run 20 frames right, then jump held 18 frames
  for(let f=0;f<20;f++){K.right=true;BK.sim(1);} const xs=P.x; BK.press('jump');K.jump=true;K.right=true;let minY=P.y;
  for(let i=0;i<90;i++){K.jump=i<18;K.right=true;BK.sim(1);minY=Math.min(minY,P.y);if(P.ground&&i>4)break;}
  // standing jump
  BK.tp(112,23);BK.sim(30);P.x=110*16+4;BK.sim(2);const xs2=P.x,ys2=P.y;BK.press('jump');K.jump=true;K.right=true;let minY2=P.y;
  for(let i=0;i<90;i++){K.jump=i<18;K.right=true;BK.sim(1);minY2=Math.min(minY2,P.y);if(P.ground&&i>4)break;}
  out[h]={run:Math.round(P.x-xs),standing:Math.round(P.x-xs2),rise:Math.round(ys2-minY2),maxHp:P.maxHp};
  K.right=K.jump=false;}
 return out;})()`, 600000); console.log(JSON.stringify(R)); } finally { pg.close(); }
