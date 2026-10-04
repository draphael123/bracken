/* tools/burial3-keys.mjs — THE BURIAL CAVERNS ROUND 3, IN THE PAGE, WITH REAL KEYS AND NO GOD MODE (claude/burial3, 2026-09-27).
   The Node half is tools/burial3.mjs. This one proves in the running game:
     1. THE ARCADE WALK is crossed end to end with real keys by the heroes named (default knight, pyro, pirate - the Pyromancer and the
        Freebooter as the guide asks): off the west pier onto the chain, up it, along nine stone ledges jumping every gap, to the hoard;
     2. a FLOATING BIER a hero lands on holds, then sinks, and the hero is in the water;
     3. a DROWNED HAND is told, then grabs a hero swimming over it (health lost);
     4. in the lair, GRAVE HANDS do not hurt a hero standing in a burning vent's light, and do hurt him out of it;
     5. GRAVE BREATH puts out every burning vent in the lair and the fire in the hero's hand, and a candle at the wall gives it back.
   usage: node tools/burial3-keys.mjs [heroes]   */
import assert from 'node:assert/strict'; import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,pyro,pirate').split(',');
const pg = await openPage({ audio: false, fonts: false }); try {
 const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const{WALK,DESCENT}=await import('/src/burial-caverns.js');BK.manualSimulation=true;BK.SET.speed=1;
 const idx=LEVELS.findIndex(l=>l.id==='burial'),TS=16,out={walk:[]};
 const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=false;BK.sim(2);return BK.L;};
 const clear=()=>{for(const e of BK.enemies())if(e!==BK.boss&&e.alive&&!e.mini&&!(e.dying>0)&&Math.abs(e.x-BK.P.x)<400)BKT.hurtEnemy(e,99999,e.x-10,false);};
 /* 1. THE ARCADE WALK */
 for(const h of ${JSON.stringify(heroes)}){const L=boot(h),P=BK.P,K=BK.keys,segs=WALK.segs;BK.tp(DESCENT.piers[0][0]+2,DESCENT.pier-1);BK.sim(10);const coins0=BK.stats().got;let hold=0,f=0,best=0,log=[],onChain=true;
  for(f=0;f<60*90&&!P.dead;f++){if(BK.state==='card')BK.cardClose();clear();P.hp=Math.max(P.hp,P.maxHp*0.5);for(const k in K)K[k]=false;const tx=P.x/TS,ty=P.y/TS;
   if(onChain&&P.ground&&ty<=WALK.top+1.2&&tx>WALK.chain+0.8)onChain=false;if(onChain){ if(tx<WALK.chain+0.5&&!P.climb)K.right=true; else if(tx>WALK.chain+0.7&&!P.climb)K.left=true; K.up=true; if(P.climb&&ty<WALK.top+0.6){K.right=true;BK.press('jump');hold=10;} }   /* to the chain, up it, and off its top onto the first ledge */
   else { K.right=true; const s=segs.find(q=>tx>=q[0]-0.2&&tx<=q[1]+1); if(P.ground&&s&&tx>s[1]+0.55&&s!==segs[segs.length-1]){BK.press('jump');hold=26;} }   /* a gap ahead: a held jump from the lip */
   if(hold>0){K.jump=true;hold--;}BK.sim(1);best=Math.max(best,P.ground&&P.y<=(WALK.top+1)*TS?P.x/TS:0);
   if(f%30===0){log.push(tx.toFixed(1)+','+ty.toFixed(1)+(P.climb?'c':'')+(P.ground?'g':'')+(P.swim?'s':''));if(log.length>12)log.shift();}
   if(P.ground&&P.x/TS>=segs[segs.length-1][1]-1&&P.y<=(WALK.top)*TS+1)break;}
  const end=segs[segs.length-1];out.walk.push({h,reached:P.ground&&P.x/TS>=end[1]-1&&P.y<=WALK.top*TS+1,secs:+(f/60).toFixed(1),best:+best.toFixed(1),at:[+(P.x/TS).toFixed(1),+(P.y/TS).toFixed(1)],coins:coins0===null?null:(BK.stats().got-coins0),trace:log});}
 /* 2. A FLOATING BIER */
 {const L=boot('knight'),P=BK.P;for(const e of BK.enemies())e.alive=false;const m=BK.movers?BK.movers().find(q=>q.bier):null;out.bierHandle=!!m;
  if(m){P.x=m.x+m.w/2;P.y=m.y-1;P.vy=0;let st=new Set(),swim=false,t0=null;for(let f=0;f<60*3;f++){P.hp=P.maxHp;BK.sim(1);st.add(m.state);if(m.state==='sink'&&t0===null)t0=f;if(P.swim)swim=true;}
   out.bier={states:[...st],holdF:t0,swim,sunk:Math.round(m.y-m.y0)};}}
 /* 3. A DROWNED HAND */
 {const L=boot('knight'),P=BK.P;for(const e of BK.enemies())e.alive=false;const h=L.drownedHands[0];BK.god=false;let told=false,hp0=P.hp,lost=0;
  for(let f=0;f<60*3;f++){P.x=h.x;P.y=h.y+18;P.vx=0;BK.sim(1);if(h.tellT>0)told=true;if(P.hp<hp0){lost+=hp0-P.hp;}hp0=P.hp;}
  out.hand={told,lost,swim:!!P.swim};}
 /* 4-5. THE LAIR */
 const lair=()=>{const L=boot('knight'),A=L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);for(const e of BK.enemies())if(e!==BK.boss)e.alive=false;return {L,A,b:BK.boss};};
 const handsAt=(light)=>{const{L,A,b}=lair(),P=BK.P,vs=L.gasVents.filter(v=>v.x*16>A.x0&&v.x*16<A.x1).sort((p,q)=>p.x-q.x),v=vs[vs.length-1];
  b.x=vs[0].x*16+8+40;b.mode='walk';b.modeT=5;P.x=v.x*16+8+20;P.y=A.floor;for(const w of vs)w.litT=0;if(light)v.litT=15;
  b.handLine=null;b.mode='handsTell';b.modeT=0;b.turn=0;const hp0=P.hp;let lines=0;
  b.handLine={dir:1,t:0,arms:[],hit:false};for(let x=b.x+34;x<A.x1-8;x+=22)b.handLine.arms.push({x,at:(x-b.x-34)/22*.06});
  for(let f=0;f<90;f++){if(light)v.litT=Math.max(v.litT,10);P.x=v.x*16+8+20;P.y=A.floor;BK.sim(1);if(b.handLine)lines++;}return {lost:hp0-P.hp,lines};};
 out.handsLit=handsAt(true);out.handsDark=handsAt(false);
 {const{L,A,b}=lair(),P=BK.P,vs=L.gasVents.filter(v=>v.x*16>A.x0&&v.x*16<A.x1);for(const v of vs){v.litT=15;v.burnt=true;}P.candle=10;b.phase=2;b.mode='breathTell';b.modeT=0;
  for(let f=0;f<150;f++){BK.sim(1);}out.breath={lit:vs.filter(v=>v.litT>0).length,candle:P.candle||0};
  const c=L.candles.filter(k=>k.x*16>=A.x0&&k.x*16<A.x1).sort((p,q)=>p.x-q.x)[0];b.mode='rest';b.modeT=30;BK.tp(c.x,c.y);BK.sim(10);out.breath.relit=+(P.candle||0).toFixed(1);}
 return out;})()`, 1800000);
 console.log(JSON.stringify(r));
 for (const w of r.walk) assert(w.reached, w.h + ' could not cross THE ARCADE WALK with real keys: best ' + w.best + ', stopped at ' + w.at + ' ' + JSON.stringify(w.trace));
 assert(r.bierHandle, 'BK.movers() is missing: the page cannot show a bier');
 assert(r.bier.states.includes('hold') && r.bier.states.includes('sink') && r.bier.holdF >= 25, 'a bier stood on did not hold a moment and then sink: ' + JSON.stringify(r.bier));
 assert(r.bier.swim && r.bier.sunk > 20, 'the bier went down without taking the hero into the water: ' + JSON.stringify(r.bier));
 assert(r.hand.told && r.hand.lost > 0, 'a drowned hand did not tell and then grab a swimmer: ' + JSON.stringify(r.hand));
 assert.equal(r.handsLit.lost, 0, 'GRAVE HANDS hurt a hero standing in a burning vent\'s light: ' + JSON.stringify(r.handsLit));
 assert(r.handsDark.lost > 0, 'GRAVE HANDS did not reach the same hero with the vent cold: ' + JSON.stringify(r.handsDark));
 assert(r.breath.lit === 0 && r.breath.candle === 0, 'GRAVE BREATH left fire burning: ' + JSON.stringify(r.breath));
 assert(r.breath.relit > 10, 'the candle at the lair\'s wall does not give the fire back: ' + JSON.stringify(r.breath));
 assert.deepEqual(pg.errors, []);
 console.log('burial3-keys  THE ARCADE WALK crossed with real keys by ' + r.walk.map(w => w.h + ' (' + w.secs + ' s' + (w.coins !== null ? ', ' + w.coins + ' coins' : '') + ')').join(', ') + '; a bier holds ' + (r.bier.holdF / 60).toFixed(2) + ' s then sinks ' + r.bier.sunk + ' px into the water; a drowned hand tells and grabs (' + r.hand.lost + ' hp); GRAVE HANDS 0 in the light / ' + r.handsDark.lost + ' out of it; GRAVE BREATH snuffs the lair and the hand, a wall candle relights (' + r.breath.relit + ' s)');
} finally { pg.close(); }
