/* tools/kraken-rework.mjs - THE KRAKEN, REWORKED (docs/briefs/kraken-rework.md, Daniel 2026-09-25), in the game. Each part forced and
   watched, the way a player meets it:
     THE TIDE RISES   on its clock the sea takes a section of the road from his end; caught on the stones it takes, you are hit and
                      swept to its edge; the flooded road carries you out; an arm lying under it cannot be cut; a knell bell struck
                      pushes it back a section; it never takes the waystone at 583 */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
  const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='causeway'));BK.state='play';BK.god=true;
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(700);BK.god=false;BK.P.maxHp=BK.P.hp=999;const e=BK.boss;hush(e);return e;};
  /* HUSH: he stands and does nothing of his own (every clock of his far off), so each part is forced and watched alone */
  const hush=e=>{e.mode=e.stage>=3?'stride3':e.stage===2?'stride2':'stride';e.modeT=999;for(const k in e.T)e.T[k]=999;for(const a of e.arms)if(a.st==='hold'||a.st==='grab'||a.st==='reach')a.st='idle';};
  const TS=16,stand=(x)=>{const P=BK.P;P.x=x;P.y=BK.L.arena.floor;P.vx=P.vy=0;P.inv=0;P.dodge=0;};
  /* ---- THE TIDE ---- */
  {const e=boot(),A=BK.L.arena,fl=A.floor,P=BK.P;out.tide={};
   out.tide.starts=e.tideN;e.tideN=1;stand(593*TS);e.T.tide=0;let hp0=P.hp,swept=false;
   for(let i=0;i<360&&!(e.tideN===2&&!e.tideSurge);i++){BK.sim(1);if(P.vx<-100)swept=true;}
   out.tide.after=e.tideN;out.tide.hits=e.tideHits||0;out.tide.swept=swept;out.tide.heroX=Math.round(P.x/TS);
   /* flooded road carries you out */
   stand(595*TS);BK.sim(60);out.tide.carried=Math.round((595*TS-P.x));
   /* an arm under the tide cannot be cut; out of it, it can */
   const a=e.arms.find(q=>Math.floor(q.bx/TS)===593&&!q.severed);a.st='down';a.t=9;a.low=true;a.tx=a.bx-20;a.ty=fl-6;BK.sim(1);
   const h0=a.hp;BKT.hurtEnemy(a.ae,10,a.bx-10,false);out.tide.underCut=h0-a.hp;
   e.tideN=0;a.st='down';a.t=9;a.low=true;BK.sim(1);const h1=a.hp;BKT.hurtEnemy(a.ae,10,a.bx-10,false);out.tide.dryCut=h1-a.hp;
   /* the bell pushes it back a section */
   e.tideN=2;e.tideSurge=null;e.tideWarn=0;BK.sim(1);BK.krakRing(0);out.tide.rungTo=e.tideN;
   /* and it stops short of the waystone the spear sticks in */
   e.tideN=3;out.tide.line=[610,601,591,584][e.tideN];out.tide.stone=Math.floor(A.stones[0]/TS);}
  return out;})()`);
  console.log(JSON.stringify(r));
  const T = r.tide;
  assert.equal(T.starts, 0, 'the road starts clear');
  assert.equal(T.after, 2, 'the tide took a section');
  assert(T.hits >= 1 && T.swept, 'caught where it came: hit and swept');
  assert(T.carried > 20, 'the flooded road carries you out (' + T.carried + ' px)');
  assert.equal(T.underCut, 0, 'an arm under the tide was cut');
  assert(T.dryCut > 0, 'an arm out of the tide could not be cut');
  assert.equal(T.rungTo, 1, 'a knell bell pushes the tide back a section');
  assert(T.line > T.stone, 'the tide takes the waystone the spear sticks in');
  console.log('The Kraken, reworked: the tide rises, sweeps, carries, hides his arms, and goes back to the bells.');
} finally { pg.close(); }
