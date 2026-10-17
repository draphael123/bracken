import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const idx=LEVELS.findIndex(l=>l.id==='flotilla');BK.setHero('pyro');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);for(const e of BK.enemies())e.alive=false;
 const P=BK.P,K=BK.keys;BK.tp(358,7);BK.sim(20);const tr=[];
 // stand on yard361, jump right toward yard368
 const y1=BK.movers().find(q=>q.flot==='yard'&&Math.round(q.x0/16)===361);
 for(let i=0;i<400&&!(P.onMover&&P.onMover===y1);i++){BK.sim(1);} 
 for(let i=0;i<300;i++){ if(P.onMover===y1&&P.x>y1.x+30)break; K.right=P.x<y1.x+34; BK.sim(1);} K.right=false;BK.sim(10);
 const y2=BK.movers().find(q=>q.flot==='yard'&&Math.round(q.x0/16)===368);tr.push(['start',Math.round(P.x),Math.round(P.y),'y361',Math.round(y1.x),'y368',Math.round(y2.x),Math.round(y2.y)]);
 BK.press('jump');K.jump=true;K.right=true;
 for(let i=0;i<60;i++){K.jump=i<18;K.right=P.x<y2.x+6;BK.sim(1);tr.push([i,Math.round(P.x),Math.round(P.y),Math.round(P.vx),Math.round(P.vy),P.ground?1:0,Math.round(y2.x)]);if(P.ground&&i>4)break;}
 return tr;})()`, 600000); for (const r of R) console.log(r.join(',')); } finally { pg.close(); }
