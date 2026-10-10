/* tools/dune-worm.mjs — THE DUNE WORM IN THE PAGE (docs/briefs/dune-worm.md; reworked by claude/caravan2 from Daniel's 10-09 playtest,
   scratch/brief-caravan2.md part B). tools/caravan.mjs proves his machine in Node; this proves the game that wraps it, because every rule
   below is a rule about the WORLD around the machine, and a machine can be right while its hands are wrong:
     A3   every one of his five attacks, FORCED, winds up (a Tell the game hears: windingUp, the mark the table gives it) and then lands on a
          hero who stands in it - the breach, the sand breath, the lunge, the swallow's bite and the tail's sweep - and every timer he carries is
          a number at spawn; the breath that lands throws grit in your eyes
     C1   what hurts is where it is drawn: the breach lands only on the locked spot, and a hero one step off it is not touched
     HIS HIDE (Daniel's B15 exception): a hero's blow on him up out of the sand - front, back, reared - takes NOTHING and is answered (the clank
          and HIDE TOO THICK / MAKE HIM HIT A LEDGE); under the sand nothing; STUNNED on a ledge, x1.5
     THE LEDGES in the page: a ledge he raises becomes one-way rock-shelf footing when it stands (a hero lands on it) and is gone again when it
          sinks; it is SHADE (the sun does not build under it); a ripple left late under one stuns him for real (the gold read: BK.bossOpen)
     A10  THE STORM IS HIS AND IS PHASE TWO'S: none before half, then gusts that move a hero in his hollow, gone again the moment a death takes you
          out of it (and the ledges with it); the sun goes in under it; and it is gone when he dies
     the level's rule still bites in his hollow in phase one: the open sand builds sunstroke
     THE GATE AFTER HIS DEATH: the gate across the hollow does not end the level while he lives, and does once he is dead
   Page, one Chrome, this checkout's own port. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
  const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='caravan'));BK.state='play';BK.god=true;BK.sim(10);
    for(const e of BK.enemies())if(e!==BK.boss&&!e.maxHp)e.alive=false;return BK.boss;};
  let b=boot();const A=BK.L.arena,P=BK.P,TS=16;
  out.spawn={t:b.t,mode:b.mode,timers:['modeT','cd','pullAcc','hurtT','phase'].map(k=>[k,b[k]])};
  BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(30);out.active=BK.bossActive;
  for(let i=0;i<200&&(b.mode==='wake'||!b.st);i++)BK.sim(1);
  const W=b.st;
  out.winch=(BK.caravan().winches||[]).filter(q=>q.hollow).length;
  const noLedges=()=>{W.ledgeT=999;W.ledges=W.ledges.filter(l=>l.state==='up');for(const l of W.ledges)l.t=0;const m=W.mode;W.mode='sleepy';BK.sim(1);W.mode=m;W.ledges=[];};   /* a test that wants open sand: no ledge up, none coming */
  /* A3: each attack forced from the chain's own index, a hero (not god) standing where it lands. EACH TEST STARTS COOL (the sun keeps working
     in the hollow, its own test is below): P.sun is put back to cool where each test starts, so each measures its own blow */
  const force=(idx,what,stand)=>{BK.god=false;P.hp=P.maxHp;P.dead=0;P.inv=0;P.sun={v:0};P.dwGrit=0;noLedges();W.mode='under';W.t=0;W.i=idx;W.order=['breath','lunge','swallow','sweep'];W.ripples=[];let tell=null,mark=null,heard=false,blow=null,took=0,grit=0;
    for(let f=0;f<60*5;f++){P.inv=0;BK.keys.block=false;P.block=false;const tx=stand();if(tx!==null){P.x=tx;P.y=A.floor;P.vx=0;}const before=P.hp;BK.sim(1);took+=Math.max(0,before-P.hp);P.hp=Math.max(P.hp,40);grit=Math.max(grit,P.dwGrit||0);
      if(/Tell$/.test(b.mode)&&!tell){tell=b.mode;mark=BK.markOf(b);heard=BK.telling(b);}
      if(tell&&!/Tell$/.test(b.mode)&&!blow)blow=b.mode;
      if(tell&&blow&&took>0)break;}
    BK.god=true;return {what,tell,mark,heard,blow,took,grit:+grit.toFixed(2)};};
  out.ripple=force(0,'ripple',()=>A.x0+200);
  out.breath=force(1,'breath',()=>W.mode==='breathTell'||W.mode==='breath'?W.x+(W.breathFace||W.face)*60:null);
  out.lunge=force(3,'lunge',()=>W.mode==='lunge'||W.mode==='lungeTell'?W.lungeTo:A.x0+300);
  out.swallow=force(5,'swallow',()=>W.pit?W.pit.x:A.x0+250);
  out.sweep=force(7,'sweep',()=>A.x0+250);
  /* HIS HIDE: through the game's own blow (hurtAs: the hero's light cut, the chip and greed rule behind it) */
  {const hit=(mode,dx)=>{W.mode=mode;W.t=9;W.face=1;b.mode=mode;b.greedLog=[];b.greedT=0;b.chipAcc=0;b.poise=0;b.broken=0;b.dwSaidT=0;const h0=b.hp;BKT.hurtAs('light',b,20,b.x+dx,false);const d=h0-b.hp;b.hp=h0;return {d,said:b.dwSaidT>0};};
   BK.sim(1);noLedges();const fr=hit('surfaced',14),bk=hit('surfaced',-14),br=hit('breathTell',14),tl=hit('sweepTell',-14),un=hit('under',-14),st=hit('stunned',14);
   out.hide={front:fr.d,back:bk.d,breathTell:br.d,sweepTell:tl.d,under:un.d,stunned:st.d,told:fr.said&&bk.said&&br.said,underTold:un.said};
   W.mode='under';W.t=0;}
  /* THE LEDGES IN THE PAGE: one forced up where we say; it stands as one-way footing, it is shade, and it goes when it sinks */
  {noLedges();W.mode='sleepy';const x0=A.x0+20*TS,row=Math.round(A.floor/TS)-3;W.ledges=[{id:901,x0,x1:x0+48,state:'rise',t:0.02,life:30}];
   for(let f=0;f<60&&W.ledges[0].state!=='up';f++){W.mode='sleepy';BK.sim(1);}const dbg=JSON.stringify(W.ledges)+' bm '+b.mode+' x0 '+x0+' row '+row;
   const cells=[0,1,2].map(c=>BK.L.grid[row*BK.L.W+Math.round(x0/TS)+c]);
   P.x=x0+24;P.y=A.floor-80;P.vy=0;P.vx=0;let stood=false;for(let f=0;f<90;f++){W.mode='sleepy';P.vx=0;BK.keys.left=BK.keys.right=false;BK.sim(1);if(P.ground&&Math.abs(P.y-row*TS)<2)stood=true;}const fell={y:P.y,g:P.ground,x:P.x};
   P.sun={v:0};for(let f=0;f<240;f++){P.x=x0+24;P.y=A.floor;P.vx=0;W.mode='sleepy';BK.sim(1);}const shade=+P.sun.v.toFixed(2);
   W.ledges[0].state='up';W.ledges[0].t=0;for(let f=0;f<60;f++){W.mode='sleepy';BK.sim(1);}
   const after=[0,1,2].map(c=>BK.L.grid[row*BK.L.W+Math.round(x0/TS)+c]);
   out.ledge={cells,stood,shade,after,oneway:T.ONEWAY,gone:W.ledges.length,st:BK.state,act:BK.bossActive,dead:P.dead,same:W===b.st,dbg,fell};}
  /* THE STUN for real: a ledge up, the hero at its edge, a ripple forced; at the commit (a human beat) he steps off 40 px - the breach comes up
     under the ledge: stunned, the gold read on, and a blow lands x1.5 */
  {BK.god=false;P.hp=P.maxHp;P.sun={v:0};noLedges();const x0=A.x0+20*TS;W.ledges=[{id:902,x0,x1:x0+48,state:'up',t:30,life:30}];W.ward=0;W.mode='under';W.t=0;W.i=0;W.ripples=[];
   let left=false,stun=false,openRead=false,took=0;for(let f=0;f<60*4&&!stun;f++){P.inv=0;if(!left){P.x=x0+10;P.y=A.floor;P.vx=0;}if(!left&&W.ripples.some(q=>q.real&&q.commit)){left=true;P.x=x0-34;}const h0=P.hp;BK.sim(1);took+=Math.max(0,h0-P.hp);if(b.mode==='stunned'){stun=true;openRead=!!BK.bossOpen&&BK.bossOpen(b);}}
   b.greedLog=[];b.greedT=0;const h0=b.hp;BKT.hurtAs('light',b,20,b.x-14,false);const dealt=h0-b.hp;b.hp=h0;
   out.stun={stun,openRead,dealt,took,mode:b.mode};BK.god=true;W.mode='under';W.t=0;W.ward=0;}
  /* C1: one step off the locked spot and the breach does not touch you */
  {BK.god=false;P.hp=P.maxHp;P.dead=0;P.sun={v:0};noLedges();W.mode='under';W.t=0;W.i=0;W.ripples=[];let took=0,left=false;
   for(let f=0;f<60*3&&W.mode!=='surfaced';f++){P.inv=0;if(!left){P.x=A.x0+220;P.y=A.floor;}if(!left&&W.ripples.some(q=>q.real&&q.commit)){left=true;P.x=A.x0+220+40;}const h0=P.hp;BK.sim(1);took+=Math.max(0,h0-P.hp);}
   out.offSpot={took};BK.god=true;}
  /* THE SUN in phase one: open sand builds it */
  const sunAt=(x,secs)=>{noLedges();P.sun={v:0};for(let f=0;f<secs*60;f++){P.x=x;P.y=A.floor;P.vx=0;W.mode='sleepy';BK.sim(1);}return +P.sun.v.toFixed(2);};
  out.sun={open:sunAt(A.x0+20*TS,4),storm0:!!BK.caravan().storm};
  /* A10: the storm - none before half; at half he calls it; a gust moves a hero in the hollow */
  W.mode='under';W.t=0;b.hp=Math.floor(b.maxHp*0.45);BK.sim(2);const cv=BK.caravan();out.storm={called:!!cv.storm,phase:b.phase};
  const gust=()=>{cv.storm.phase='gust';cv.storm.t=1.6;cv.storm.dir=1;let moved=0;for(let f=0;f<50;f++){W.mode='sleepy';P.y=A.floor;const x0=P.x;BK.sim(1);moved+=P.x-x0;}return Math.round(moved);};
  P.x=A.x0+200;P.y=A.floor;out.storm.inHollow=gust();
  P.sun={v:0};for(let f=0;f<240;f++){P.x=A.x1-60;P.y=A.floor;W.mode='sleepy';BK.sim(1);}out.storm.sunInStorm=+P.sun.v.toFixed(2);
  /* AND IT NEVER LEAVES HIS HOLLOW: a death - the only way out mid-fight - wakes you at the shrine outside with the fight put back, the storm
     and every ledge with it */
  {W.ledges=[{id:903,x0:A.x0+24*TS,x1:A.x0+24*TS+48,state:'rise',t:0.01,life:30}];for(let f=0;f<4;f++){W.mode='sleepy';BK.sim(1);}
   const row=Math.round(A.floor/TS)-3,ow=()=>{let n=0;for(let c=Math.round(A.x0/TS);c<Math.round(A.x1/TS);c++)if(BK.L.grid[row*BK.L.W+c]===T.ONEWAY)n++;return n;},before=ow();
   BKT.respawn();BK.sim(2);const b2=BK.boss;out.storm.retry={storm:!!BK.caravan().storm,active:BK.bossActive,outside:BK.P.x<A.x0,mode:b2&&b2.mode,ledgeCellsBefore:before,ledgeCellsAfter:ow()};
   b=b2;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(30);for(let i=0;i<200&&(b.mode==='wake'||!b.st);i++)BK.sim(1);}
  const W2=b.st;
  /* THE GATE: not while he lives; once he is dead, yes */
  const G=BK.L.ents.find(e=>e.t==='gate');const stand=()=>{P.x=G.x*16+8;P.y=(G.y+1)*16;P.vx=0;};
  W2.mode='sleepy';for(let f=0;f<60;f++){stand();W2.mode='sleepy';BK.sim(1);}out.gate={alive:BK.state};
  W2.mode='stunned';W2.t=9;BKT.hurtEnemy(b,99999,b.x-10,false);   /* his head on a ledge, where a blow lands */for(let f=0;f<60*4&&!BK.L.gateOpen;f++){if(BK.state==='card')BK.cardClose();BK.sim(1);}out.gate.dead=b.alive;out.gate.open=!!BK.L.gateOpen;out.gate.stormAfter=!!BK.caravan().storm;
  for(let f=0;f<60*3&&(BK.state==='play'||BK.state==='card');f++){if(BK.state==='card')BK.cardClose();stand();BK.sim(1);}out.gate.after=BK.state;
  return out;})()`, 600000);
  console.log(JSON.stringify(r));
  assert.equal(r.spawn.t, 'duneworm'); assert.equal(r.spawn.mode, 'sleep', 'he sleeps under the sand until the hollow is crossed');
  for (const [k, v] of r.spawn.timers) assert.ok(typeof v === 'number' && Number.isFinite(v), 'A3: every timer a number at spawn: ' + k + '=' + v);
  assert.ok(r.active, 'crossing the trigger starts the fight');
  assert.equal(r.winch, 0, 'the hollow\'s awning and its winch are gone (the ledges are the opening now)');
  const want = { ripple: ['rippleTell', '!!', 'breach'], breath: ['breathTell', '!', 'breath'], lunge: ['lungeTell', '!!', 'lunge'], swallow: ['swallowTell', '!!', 'swallow'], sweep: ['sweepTell', '!!', 'sweep'] };
  for (const [k, [tell, mark, blow]] of Object.entries(want)) { const x = r[k];
    assert.equal(x.tell, tell, 'A1/A3: ' + k + ' is told by ' + tell + ': ' + JSON.stringify(x));
    assert.equal(x.mark, mark, k + ': the mark over it is ' + mark + ' (src/marks.js): ' + JSON.stringify(x));
    assert.ok(x.heard, 'A2: ' + k + ' winds up in windingUp() (its sound): ' + JSON.stringify(x));
    assert.equal(x.blow, blow, k + ': the tell hands to its blow: ' + JSON.stringify(x));
    assert.ok(x.took > 0, 'A3: ' + k + ' FIRES: it lands on a hero standing in it: ' + JSON.stringify(x)); }
  assert.ok(r.breath.grit > 0.5, 'THE SAND BREATH landed throws grit in your eyes (the view sand-blind a moment): ' + JSON.stringify(r.breath));
  { const h = r.hide; assert.ok(h.front === 0 && h.back === 0 && h.breathTell === 0 && h.sweepTell === 0 && h.under === 0 && h.stunned >= 28 && h.told && !h.underTold,
      'HIS HIDE (Daniel\'s B15 exception): a 20 blow up out of the sand takes nothing from any side and is answered (HIDE TOO THICK); through the sand nothing (and nothing said); stunned on a ledge it lands x1.5: ' + JSON.stringify(h)); }
  { const L = r.ledge; assert.ok(L.cells.every(c => c === L.oneway) && L.stood && L.shade === 0 && L.after.every(c => c !== L.oneway) && L.gone === 0,
      'THE LEDGES: a standing ledge is one-way footing a hero lands on, the sand under it is shade (the sun does not build), and once it sinks its cells are open again: ' + JSON.stringify(L)); }
  { const s = r.stun; assert.ok(s.stun && s.openRead && s.dealt >= 28 && s.took === 0, 'THE OPENING in the page: a ripple left late at a ledge\'s edge comes up under it - stunned, the shared gold read on (bossOpen), a 20 blow lands x1.5, and the hero who stepped off took nothing: ' + JSON.stringify(s)); }
  assert.equal(r.offSpot.took, 0, 'C1: one step off the locked spot, the breach does not touch you: ' + JSON.stringify(r.offSpot));
  assert.ok(r.sun.open > 0.3 && !r.sun.storm0, 'phase one: the sun works in his hollow: ' + JSON.stringify(r.sun));
  assert.ok(r.storm.called && r.storm.phase === 2, 'A10: at half he calls the storm: ' + JSON.stringify(r.storm));
  assert.ok(Math.abs(r.storm.inHollow) > 20, 'a gust moves a hero in his hollow: ' + JSON.stringify(r.storm));
  assert.ok(!r.storm.retry.storm && !r.storm.retry.active && r.storm.retry.outside && r.storm.retry.mode === 'sleep' && r.storm.retry.ledgeCellsBefore === 3 && r.storm.retry.ledgeCellsAfter === 0,
    'a death wakes you outside his hollow with no storm, no ledge left standing and the fight put back: ' + JSON.stringify(r.storm));
  assert.equal(r.storm.sunInStorm, 0, 'the sun goes in under his storm: ' + JSON.stringify(r.storm));
  assert.equal(r.gate.alive, 'play', 'the gate across the hollow does not end the level while he lives: ' + JSON.stringify(r.gate));
  assert.ok(!r.gate.dead && r.gate.open && !r.gate.stormAfter, 'he dies, the gate opens and his storm goes with him: ' + JSON.stringify(r.gate));
  assert.notEqual(r.gate.after, 'play', 'and the gate ends the level: ' + JSON.stringify(r.gate));
  assert.deepEqual(pg.errors, []);
  console.log('dune-worm: five told attacks forced and landed (the breath blinds), his hide turns every blade but the stun, the ledges are footing and shade and his opening, the breach true to its spot, the storm his and phase two\'s, the sun in his hollow, the gate after his death.');
} finally { pg.close(); }
