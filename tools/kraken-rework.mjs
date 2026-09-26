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
  /* ---- THE OPENINGS: new arms for stage 2 and the maw; a cut left regrows; the look lays the arms still only if caused; the tower bell once a stage ---- */
  {const e=boot(),A=BK.L.arena,fl=A.floor,P=BK.P;out.open={};stand(575*TS);
   const cut=(a,d,x)=>{a.st='down';a.t=9;a.low=true;a.tx=a.bx+(a.side||1)*30;a.ty=fl-6;BK.sim(1);const h=a.hp;BKT.hurtEnemy(a.ae,d,x===undefined?a.bx:x,false);return h-a.hp;};
   for(const a of e.arms.slice())if(!a.severed){a.hp=1;a.ae.hp=1;cut(a,5);}
   for(let i=0;i<600&&e.mode!=='stride2';i++)BK.sim(1);hush(e);
   const two=()=>e.arms.filter(a=>a.two&&!a.severed);out.open.stage=e.stage;out.open.two=two().length;out.open.floorPct=Math.round(100*e.stageFloor/e.maxHp);
   /* a cut left regrows */
   {const a=two()[0];out.open.cutBy=cut(a,6,a.bx);const h=a.hp;for(let i=0;i<300;i++){a.st='down';a.t=9;BK.sim(1);}out.open.regrew=a.hp===a.max&&h<a.max;}
   /* the look: arms still only if something stung him since the last look */
   const look=st=>{hush(e);for(const a of two()){a.st='idle';a.low=false;}e.stungSince=st;e.mode='lookTell';e.modeT=0;BK.sim(2);return two().some(a=>a.st==='stun');};
   out.open.lookFree=look(false);out.open.lookCaused=look(true);
   /* the tower bell knells him once a stage; after that only the shrine's */
   const breathe=()=>{hush(e);e.mode='breath';e.modeT=9;e.knellHit=false;for(const q of BK.props())if(q.t==='knell')q.cool=0;};
   /* (a bell struck stops the world a beat - hitstop - so each is given ten frames) */breathe();BK.krakRing(0);BK.sim(10);out.open.tower1=e.mode;breathe();BK.krakRing(0);BK.sim(10);out.open.tower2=e.mode;breathe();BK.krakRing(1);BK.sim(10);out.open.shrine=e.mode;
   /* and the maw is reached: at its floor stage 2 turns, the spear and two new arms come */
   hush(e);e.hp=e.stageFloor;for(let i=0;i<600&&e.mode!=='stride3';i++)BK.sim(1);hush(e);out.open.maw=e.stage;
   const rg=()=>e.arms.filter(a=>a.regrown&&!a.severed);out.open.spear=e.arms.some(a=>a.spear&&!a.severed);out.open.regrown=rg().length;
   /* in the maw a cut arm comes back - as a new one */
   {const a=rg()[0];a.hp=1;a.ae.hp=1;e.hp=Math.max(e.hp,200);cut(a,5);out.open.cutOne=rg().length;for(let i=0;i<500;i++){BK.sim(1);if(i%60===0)for(const k in e.T)e.T[k]=999;}out.open.back=rg().length;}}
  /* ---- HE HITS HARDER: a quicker sweep, and the grab drags you toward the sea - pressed or rolled out of, never held past ~2 s ---- */
  {const e=boot(),A=BK.L.arena,fl=A.floor,P=BK.P;out.hit={};
   const a=e.arms.find(q=>!q.severed&&q.st==='idle');const hold=()=>{hush(e);stand(576*TS+8);P.st=P.maxSt||100;e.armI=a.i;a.st='hold';a.low=true;e.mode='held';e.modeT=2.2;e.grip=5;};
   hold();const x0=P.x;BK.sim(30);out.hit.dragged=Math.round(P.x-x0);
   /* seaward of the arm that has you, it still drags you on out to sea - not back to the arm */hold();P.x=a.bx+40;const x1=P.x;BK.sim(30);out.hit.draggedPast=Math.round(P.x-x1);
   hold();BK.sim(1);BK.press('dodge');BK.sim(3);out.hit.rolled=e.mode!=='held';
   hold();let f=0;for(;f<300&&e.mode==='held';f++)BK.sim(1);out.hit.heldS=+(f/60).toFixed(2);
   hush(e);stand(569*TS+8);P.y=20*TS;/* up on the tower, out of its way: a sweep that lands stops the world a beat */const b=e.arms.find(q=>!q.severed&&q.st==='idle');e.armI=b.i;b.st='lower';e.sweepFrom=A.x0+20;e.sweepTo=A.x1-20;e.mode='sweepTell';e.modeT=0;for(let i=0;i<30&&e.mode!=='sweep';i++)BK.sim(1);let n=0;while(e.mode==='sweep'&&n<200){BK.sim(1);n++;}out.hit.sweepS=+(n/60).toFixed(2);}
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
  const O = r.open;
  assert.equal(O.stage, 2, 'the four arms cut, he goes out to sea');
  assert.equal(O.two, 2, 'two new arms come back up out of the sea in stage 2');
  assert.equal(O.floorPct, 35, 'stage 2 ends at 35%');
  assert(O.cutBy > 0 && O.regrew, 'an arm cut and left regrows');
  assert.equal(O.lookFree, false, 'his arms lay still for a look nobody caused');
  assert.equal(O.lookCaused, true, 'a caused look does not lay his arms still');
  assert.equal(O.tower1, 'knelled', 'the tower bell knells him the first time');
  assert.equal(O.tower2, 'breath', 'the tower bell knells him twice in a stage');
  assert.equal(O.shrine, 'knelled', 'the shrine bell does not knell him after the tower has');
  assert.equal(O.maw, 3, 'the maw is not reached');
  assert(O.spear && O.regrown === 2, 'the maw has no spear or no arms');
  assert(O.cutOne === 1 && O.back === 2, 'in the maw a cut arm does not come back');
  const H = r.hit;
  assert(H.dragged > 20, 'the grab does not drag you toward the sea (' + H.dragged + ' px)');
  assert(H.draggedPast > 20, 'seaward of the arm, the grab drags you back to it, not toward the sea (' + H.draggedPast + ' px)');
  assert(H.rolled, 'a dodge does not roll you out of his grip');
  assert(H.heldS > 1 && H.heldS <= 2.3, 'held ' + H.heldS + ' s: the grab is a stun-lock');
  assert(H.sweepS > 0.3 && H.sweepS <= 0.72, 'the low sweep takes ' + H.sweepS + ' s');
  console.log('The Kraken, reworked: the tide rises, sweeps, carries, hides his arms, and goes back to the bells; stage 2 has arms and ends in the maw; a cut left regrows; the look is caused; the tower bell once a stage; the sweep is quicker and the grab drags you seaward, escapably.');
} finally { pg.close(); }
