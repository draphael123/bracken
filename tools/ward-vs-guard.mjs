// tools/ward-vs-guard.mjs — THE GEOMANCER'S RUNE-WARD BESIDE THE KNIGHT'S GUARD, IN NUMBERS (round 3, docs/briefs/geomancer.md ROUND 3, 2).
// A REPORT, not a gate: Daniel asked for her guard to be a SIDEGRADE of his - better against big and ranged blows, worse in close
// melee - and for the two to be put side by side. Every number is measured through the real damagePlayer / seeds / input in the real
// page, with Math.random pinned (mulberry, one seed a row), both heroes at level 1 (nothing yet) and at level 20 (the passives that come with the level: his PERFECT GUARD,
// STEADY ARM, PLATED, HOLD THE LINE and SEND IT BACK; her STONEFACE, SHRAPNEL and BULWARK), no talents bought:
//   raise       frames from C going down to the first blow it blocks (at 60 fps)
//   perfect     the frames after C goes down in which a blow is a PERFECT guard (his parry, her EMPOWERED)
//   hitSt       wind a blocked yellow blow costs;  holdSt  wind a second of holding it costs, once the beat has passed
//   push        how far a blocked 40-damage blow slides the hero (px)
//   covers      a blow from the front / from right over the head (4 px behind) / from behind (24 px): blocked?
//   bolt        a piercing bolt into a guard held up: blocked?
//   walk        px walked in a second, C held and the key toward the foe held
//   flurry      CLOSE MELEE: ten yellow 12-damage blows a fifth of a second apart from 18 px in front, C held from the first: health lost,
//               and wind left
//   volley      RANGED: six arrows a quarter second apart from the front, plus two dropped on the head, C held: health lost, and
//               arrows thrown back
//   big         BIG BLOWS: three 40-damage yellow blows a second apart, C held: health lost, and px pushed
// `node tools/ward-vs-guard.mjs` prints a table and writes docs/geomancer/round3/ward-vs-guard.json.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');const {mulberry}=await import('/src/px.js');const real=Math.random;const rows={};
    const setup=(h,lv)=>{Math.random=mulberry(7);for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(lv);
      BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(20,21);BK.sim(30);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;return P;};
    const K=BK.keys,blow=(P,x,d,o={})=>{P.inv=0;P.hurt=0;return BKT.damagePlayer(x,d,o);};
    for(const lv of [1,20])for(const h of ['knight','geomancer']){const r={};const setupH=setup;const setup1=hh=>setupH(hh,lv);let P=setup1(h);
      /* raise: C down, then a blow n frames later */
      r.raise=-1;for(let n=0;n<12&&r.raise<0;n++){P=setup1(h);K.block=true;BK.sim(n);const res=blow(P,P.x+20,10);K.block=false;if(res==='blocked')r.raise=n;}
      /* perfect: which frames after C a blow is perfect */
      r.perfect=[];for(let n=0;n<20;n++){P=setup1(h);K.block=true;BK.sim(n);const pt=P.parryT||0,emp=P.geoEmpT||0;blow(P,P.x+20,10);K.block=false;if((P.parryT||0)>pt||(P.geoEmpT||0)>emp)r.perfect.push(n);}
      P=setup1(h);K.block=true;BK.sim(40);let st=P.st;blow(P,P.x+20,10);r.hitSt=Math.round(st-P.st);st=P.st;BK.sim(60);r.holdSt=Math.round(st-P.st);K.block=false;
      P=setup1(h);K.block=true;BK.sim(40);let x0=P.x;blow(P,P.x+20,40);BK.sim(30);r.push=Math.round(Math.abs(P.x-x0));K.block=false;
      r.covers={};for(const [k,dx] of [['front',20],['over',-4],['behind',-24]]){P=setup1(h);K.block=true;BK.sim(40);r.covers[k]=blow(P,P.x+dx,10)==='blocked';K.block=false;}
      P=setup1(h);K.block=true;BK.sim(40);r.bolt=blow(P,P.x+30,10,{pierce:true})==='blocked';K.block=false;
      P=setup1(h);K.block=true;K.right=true;BK.sim(20);x0=P.x;BK.sim(60);r.walk=Math.round(P.x-x0);K.right=false;K.block=false;
      /* the three fights, C held from the first */
      const fight=(n,gap,make)=>{P=setup1(h);K.block=true;BK.sim(20);const hp0=P.hp;let thrown=0;for(let i=0;i<n;i++){make(P,i);for(let f=0;f<gap;f++){BK.sim(1);}}
        for(const s of BK.seeds())if(s.reflected)thrown++;K.block=false;return {lost:hp0-P.hp,st:Math.round(P.st),thrown};};
      r.flurry=fight(10,12,P=>{blow(P,P.x+18,12);});
      r.volley=fight(8,15,(P,i)=>{const s=i<6?{x:P.x+60,y:P.y-12,vx:-240,vy:0,g:0,life:3,arrow:true}:{x:P.x-3,y:P.y-60,vx:0,vy:240,g:0,life:3,arrow:true};BK.seeds().push(s);});
      r.big=(()=>{P=setup1(h);K.block=true;BK.sim(20);const hp0=P.hp,x0=P.x;for(let i=0;i<3;i++){blow(P,P.x+20,40);BK.sim(60);}K.block=false;return {lost:hp0-P.hp,pushed:Math.round(Math.abs(P.x-x0)),st:Math.round(P.st)};})();
      rows[h+'@'+lv]=r;}
    Math.random=real;return rows;})()`);
  const cols = ['raise', 'perfect', 'hitSt', 'holdSt', 'push', 'covers', 'bolt', 'walk', 'flurry', 'volley', 'big'];
  for (const lv of [1, 20]) { console.log('--- level ' + lv); for (const c of cols) console.log(c.padEnd(8), '| knight', JSON.stringify(out['knight@' + lv][c]).padEnd(44), '| geomancer', JSON.stringify(out['geomancer@' + lv][c])); }
  writeFileSync(join(ROOT, 'docs/geomancer/round3/ward-vs-guard.json'), JSON.stringify(out, null, 1));
  if (pg.errors.length) console.log('page errors', pg.errors);
} finally { pg.close(); }
