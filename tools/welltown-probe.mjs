// tools/welltown-probe.mjs - THE WELL TOWN in the page, quickly (claude/welltown): it loads, the skin fills at a well and pours a mud wall open,
// a fire out, the windlass sends the bucket down and back, the dry cistern opens its vault on four skins, a water-thief's cut takes a sip, and
// THE BANDIT KING wakes, tells, burns and opens to a pour. A smoke test for the lane, not a suite check: node tools/welltown-probe.mjs
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
  const id=LEVELS.findIndex(l=>l.id==='welltown');BK.setHero('knight');BK.reset({fresh:true});BK.load(id);BK.state='play';BK.god=true;BK.sim(30);
  const W=()=>BK.welltown(),P=BK.P,tp=(x,y)=>{BK.tp(x,y);BK.sim(2);};
  out.loaded={W:!!W(),wells:W().wells.length,walls:W().walls.length,fires:W().fires.length,sips:P.skin&&P.skin.sips};
  tp(11,29);BK.press('talk');BK.sim(2);out.fill=P.skin.sips;
  tp(259,29);P.face=1;BK.press('talk');BK.sim(2);out.wall1={open:W().walls.find(m=>m.x0===262).open,sips:P.skin.sips};
  tp(119,29);P.face=1;BK.press('talk');BK.sim(2);out.stall={lit:W().fires.find(f=>f.x0===121).lit,sips:P.skin.sips};
  const m=BK.movers().find(q=>q.windlass);tp(176,25);BK.sim(10);P.face=-1;BK.press('atk');BK.sim(10);out.bucketDir=m.dir;for(let i=0;i<300&&m.dir;i++)BK.sim(1);out.bucket={y:m.y,y1:m.y1,P:[Math.round(P.x/16),Math.round(P.y/16)]};
  tp(184,39);BK.sim(5);P.face=1;BK.press('atk');BK.sim(5);for(let i=0;i<400&&m.dir;i++)BK.sim(1);out.bucketUp={y:m.y,y0:m.y0};
  for(const pr of BK.props().filter(p=>p.t==='stray'&&!p.got)){BK.P.x=pr.x;BK.P.y=pr.y;BK.sim(3);}out.skins=BK.village().saved();
  tp(436,32);BK.press('talk');BK.sim(3);out.cistern={full:W().cistern.full,vault:W().vault.map(v=>v.open)};
  /* the water-thief */
  BK.god=false;P.hp=P.maxHp;P.skin.sips=3;const th=BK.enemies().find(e=>e.t==='waterthief'&&e.alive);tp(Math.floor(th.x/16)-2,Math.floor(th.y/16));let stole=0;for(let i=0;i<600&&!stole;i++){P.hp=P.maxHp;BK.keys.block=false;BK.sim(1);if(th.st.carry)stole=1;}
  out.thief={stole,sips:P.skin.sips,mode:th.st.mode};BK.god=true;
  /* THE BANDIT KING */
  const A=BK.L.arena;tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(120);const b=BK.boss;out.king={active:BK.bossActive,t:b&&b.t,mode:b&&b.mode,hp:b&&b.hp};
  const modes=new Set();let burned=0,opened=0;const F=BK.banditKingHands().fight();
  for(let i=0;i<60*40&&!opened;i++){P.hp=P.maxHp;modes.add(b.mode);if(b.burning>0){burned++;P.skin.sips=3;P.x=b.x-20;P.face=1;BK.press('talk');}BK.sim(1);if(b.mode==='open')opened=1;}
  out.king2={modes:[...modes],burned,opened,open:b.open,n:BK.banditKing().n};
  const h0=b.hp;BKT.hurtEnemy(b,40,b.x-10,false);out.openHit=+(h0-b.hp).toFixed(2);for(let i=0;i<300&&b.mode==='open';i++)BK.sim(1);const h1=b.hp;BKT.hurtEnemy(b,40,b.x-10,false);out.chipHit=+(h1-b.hp).toFixed(2);
  return out;})()`, 300000);
  console.log(JSON.stringify(r, null, 1));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
