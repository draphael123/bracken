/* tools/weak-bosses.mjs — THE WEAK BOSSES GET CAUSED OPENINGS (claude/weakboss, Daniel's HANDOFF item 15: "the opening arrives on its
   own, they are harmless, phase 2 is just faster"). In the page, for each of the three minis, it asks:
   THE LAMPREEVE (the Lamplit Street)
     - a hood left alone on a lamp opens NOTHING (the lamp goes out, he walks on, e.open never set)
     - the same hood, the lamp STRUCK while it is on: the lamp flares, he is BLINDED and open, and a blow lands double
     - out of the flare his coat takes half a blow
     - THE LUNGE FROM THE DARK is told (lungeTell, red !!), is only asked of a hero out of the light, hits a hero who stands, and
       misses a hero who rolls through it
     - PHASE TWO takes your light: playerLight() shrinks, the fire in hand is gone, and a burning lamp gives it back
   (the Ploughman and the Homunculus are asked below.)
   Red on the base (5b0ec84): the Lampreeve's reach opened him with nobody touching a lamp, there was no lunge and no taken light.
     node tools/weak-bosses.mjs            (PORT from tools/ports.mjs)  WB_ONLY=reeve|plough|hom  runs one */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const ONLY = process.env.WB_ONLY || '';
const pg = await openPage({ audio: false, fonts: false }); const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const ONLY=${JSON.stringify(ONLY)};
  const boot=(id,hero)=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.start();BK.god=true;BK.sim(5);BK.reset();
    const M=BK.L.mini;const b=BK.enemies().find(e=>e.t===M.boss&&e.alive&&e.mini);for(const e of BK.enemies())if(e!==b&&!e.maxHp&&!e.mini)e.alive=false;
    BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(150);return b;};
  const hold=()=>{const k=BK.keys;k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=false;};
  if(!ONLY||ONLY==='reeve'){const b=boot('lamplit');const M=BK.L.mini,o={};
    const lampsIn=()=>BK.props().filter(p=>p.t==='lantern'&&p.city&&p.x>M.x0-8&&p.x<M.x1+8);
    o.lamps=lampsIn().length;o.mode0=b.mode;
    /* the hood left alone */
    const hood=()=>{b.mode='stalk';b.open=0;b.snuffT=0;b.lungeT=99;b.sweepT=99;b.douseT=99;b.hookT=99;for(const p of lampsIn()){p.lit=true;p.gut=0;}
      const t=lampsIn().sort((a,c)=>Math.abs(a.x-b.x)-Math.abs(c.x-b.x))[0];b.x=t.x+30;BK.P.x=t.x-60;BK.P.wick=14;return t;};
    let t=hood(),openA=0,sawSnuff=false;for(let i=0;i<360;i++){hold();BK.P.x=t.x-60;BK.P.wick=14;BK.sim(1);if(b.mode==='snuff')sawSnuff=true;openA=Math.max(openA,b.open||0);if(sawSnuff&&b.mode==='stalk')break;}
    o.alone={sawSnuff,open:+openA.toFixed(2),lampLit:!!t.lit,gut:+(t.gut||0).toFixed(2),mode:b.mode};BK.sim(90);o.alone.lampOut=!t.lit;
    /* the same hood, the lamp struck under it */
    t=hood();let struck=false,modeB=null,openB=0;for(let i=0;i<360&&!struck;i++){hold();BK.P.wick=14;
      if(b.mode==='snuff'&&b.target===t){BK.P.x=t.x-14;BK.P.y=M.floor;BK.P.face=1;if(BK.P.atk<0&&i%4===0)BK.press('atk');}else BK.P.x=t.x-60;
      BK.sim(1);if(b.mode==='blinded'){struck=true;modeB=b.mode;openB=b.open;}}
    o.struck={struck,mode:modeB,open:+openB.toFixed(2),lampLit:!!t.lit&&!(t.gut>0),flares:b.flares||0};
    /* a blow open, and a blow out of the flare */
    const h0=b.hp;BKT.hurtEnemy(b,10,b.x-20,false);o.openBlow=Math.round(h0-b.hp);BK.sim(200);b.open=0;b.mode='stalk';const h1=b.hp;BKT.hurtEnemy(b,10,b.x-20,false);o.shutBlow=Math.round(h1-b.hp);
    /* THE LUNGE: a hero in the light is not lunged at; a hero in the dark is, and it is told red */
    for(const p of lampsIn()){p.lit=false;p.gut=0;}const far=lampsIn()[0];far.lit=true;
    const lunge=(roll)=>{BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.wick=0;b.mode='stalk';b.modeT=0;b.snuffT=99;b.sweepT=99;b.douseT=99;b.hookT=99;b.lungeT=0;b.x=(M.x0+M.x1)/2;BK.P.x=b.x+(b.x>far.x?-120:120);if(Math.abs(BK.P.x-far.x)<130)BK.P.x=b.x-(BK.P.x-b.x);BK.P.y=M.floor;
      let told=null,mark=null,hp0=BK.P.hp;for(let i=0;i<120;i++){hold();if(b.mode==='lungeTell'){told=b.mode;mark=BK.markShown(b);if(roll&&b.modeT<0.1&&i%3===0){BK.keys[b.x<BK.P.x?'left':'right']=true;BK.press('dodge');}}BK.sim(1);if(b.mode==='lungeEnd'||b.mode==='stalk'&&told)break;}
      const r={told,mark,hurt:Math.round(hp0-BK.P.hp),light:BK.litNear?BK.litNear(BK.P.x,BK.P.y-10,110):null};BK.god=true;return r;};
    o.lungeStand=lunge(false);o.lungeRoll=lunge(true);
    {b.mode='stalk';b.lungeT=0;b.snuffT=99;b.sweepT=99;b.douseT=99;b.hookT=99;BK.P.x=far.x;BK.P.wick=14;b.x=far.x+120;let seen=false;for(let i=0;i<120;i++){hold();BK.P.x=far.x;BK.P.wick=14;BK.sim(1);if(b.mode==='lungeTell')seen=true;}o.lungeInLight=seen;}
    /* PHASE TWO: your light */
    const lit0=(BK.playerLight?BK.playerLight():null);b.mode='stalk';b.phase=1;b.hp=Math.floor(b.maxHp*0.45);BK.P.wick=14;BK.P.x=b.x-120;let took=false;for(let i=0;i<200&&!took;i++){hold();BK.sim(1);if(BK.P.snuffed)took=true;}
    o.p2={phase:b.phase,took,wick:+(BK.P.wick||0).toFixed(1),light:(BK.playerLight?BK.playerLight():null),lit0};
    BK.P.x=far.x;BK.P.y=M.floor;for(let i=0;i<20;i++){hold();BK.P.x=far.x;BK.sim(1);}o.p2.relit=!BK.P.snuffed;o.p2.lightAfter=(BK.playerLight?BK.playerLight():null);
    out.reeve=o;}
  if(!ONLY||ONLY==='plough'){const b=boot('fields');const M=BK.L.mini,o={};const bx=(M.baits||[]).map(([tx,k])=>[tx*16+8,k]);o.baits=bx.map(q=>q[1]);const HP0=b.hp;
    const fresh=()=>{b.mode='walk';b.open=0;b.hp=HP0;BK.P.inv=0;BK.P.dead=0;b.phase=1;b.furrows=[];b.T={charge:99,goad:99,head:99,furrow:99};b.vx=0;BK.P.hp=BK.P.maxHp;};
    /* a charge driven over open ground (the hero between the baits, well short of either) */
    const charge=(bx0,px)=>{fresh();b.x=bx0;b.y=M.floor;BK.P.x=px;BK.P.y=M.floor;b.face=Math.sign(px-bx0);b.mode='chargeTell';b.modeT=0;let open=0,stuck=null,seen={};
      for(let i=0;i<240;i++){hold();BK.P.x=px;BK.P.y=M.floor;BK.P.inv=99;BK.sim(1);seen[b.mode]=1;open=Math.max(open,b.open||0);if(b.mode==='stuck')stuck=b.stuckIn;if(b.mode==='walk'&&i>10)break;}
      return {open:+open.toFixed(2),stuck,turned:!!seen.turn,furrows:(b.furrows||[]).length};};
    const tr=bx.find(q=>q[1]==='trough')[0],fe=bx.find(q=>q[1]==='fence')[0],mid=(tr+fe)/2;
    o.open=charge(fe-40,mid+10);
    o.trough=charge(fe-40,tr+20);
    o.fence=charge(tr+40,fe+20);
    { const h0=b.hp;b.open=0;BKT.hurtEnemy(b,10,b.x-20,false);o.shutBlow=Math.round(h0-b.hp);BK.sim(30);const h1=b.hp;b.open=2;BKT.hurtEnemy(b,10,b.x-20,false);o.openBlow=Math.round(h1-b.hp);b.open=0;BK.sim(30); }
    /* THE HEAD: told red, and lands where the ring is - a hero on the ring is burnt, one who leaves it late is not */
    const head=(leave)=>{fresh();BK.P.x=M.x1-30;BK.sim(200);fresh();BK.god=false;   /* (the last head's fire burnt out first) */b.x=M.x0+60;b.face=1;const px=b.x+130;BK.P.x=px;BK.P.y=M.floor;b.mode='headTell';b.modeT=1;b.headAt=px;let mark=null,hp0=BK.P.hp,ring=null;
      for(let i=0;i<200;i++){hold();if(b.mode==='headTell'){mark=mark||BK.markShown(b);ring=b.headAt;}if(leave&&b.mode!=='headTell')BK.P.x=px+70;else BK.P.x=px;BK.sim(1);if(b.mode==='walk')for(let j=0;j<90;j++){hold();BK.sim(1);} if(b.mode==='walk')break;}
      const r={mark,ring:Math.round(ring-px),hurt:Math.round(hp0-BK.P.hp)};BK.god=true;return r;};
    o.headStand=head(false);o.headLeave=head(true);
    /* PHASE TWO: the furrows. None are called in phase one; in phase two they are told red and burn a hero on one, not a hero off them */
    { fresh();b.furrows=[{x0:M.x0+40,x1:M.x0+160,t:20}];b.T.furrow=0;b.x=M.x1-60;BK.P.x=M.x0+100;let seen=false;for(let i=0;i<120;i++){hold();BK.sim(1);if(b.mode==='furrowTell')seen=true;b.T.charge=99;b.T.head=99;b.T.goad=99;}o.p1Furrow=seen; }
    const furrow=(on)=>{fresh();BK.god=false;b.phase=2;b.hp=HP0*0.4;b.furrows=[{x0:M.x0+40,x1:M.x0+160,t:20}];b.x=M.x1-60;const px=on?M.x0+100:M.x0+220;b.T.furrow=0;let mark=null,hp0=BK.P.hp,told=false;
      for(let i=0;i<150;i++){hold();BK.P.x=px;BK.P.y=M.floor;b.T.charge=99;b.T.head=99;b.T.goad=99;if(b.mode==='furrowTell'){told=true;mark=mark||BK.markShown(b);}BK.sim(1);if(told&&b.mode==='walk')break;}
      const r={told,mark,hurt:Math.round(hp0-BK.P.hp)};BK.god=true;return r;};
    o.furrowOn=furrow(true);o.furrowOff=furrow(false);
    out.plough=o;}
  if(!ONLY||ONLY==='hom'){const b=boot('mage');const M=BK.L.mini,o={};const HP0=b.hp;
    const fresh=()=>{b.mode='walk';b.open=0;b.hp=HP0;b.phase=1;b.chain=0;b.trick=null;b.queue=null;b.smoked=false;b.T={swipe:99,trick:99};b.aimX=null;b.hidden=false;b.vx=0;b.x=(M.x0+M.x1)/2;b.y=M.floor;BK.P.inv=0;BK.P.dead=0;BK.P.hp=BK.P.maxHp;BK.mg().smokes=[];BK.mg().puddles=[];};
    /* one trick, the hero either standing in it or out of it; 'force' puts the trick's tell on him */
    const trick=(tell,where,opt={})=>{fresh();BK.god=false;if(opt.phase2){b.phase=2;b.hp=HP0*0.4;b.chain=1;}const px=b.x+(opt.dx||40);BK.P.x=px;BK.P.y=M.floor;b.face=1;b.mode=tell;b.modeT=opt.tellT||0.5;b.trick=opt.trick;b.trickHit=false;if(tell==='flaskTell')b.flaskAt=px;
      let mark=null,modes={},hp0=BK.P.hp,aim=null,held=0,ringP=null;
      for(let i=0;i<260;i++){hold();if(/Tell$/.test(b.mode)){mark=mark||BK.markShown(b);if(b.modeT>0.3)ringP=BK.P.x;}modes[b.mode]=1;if(b.aimX!=null&&aim===null&&!/Tell$/.test(b.mode))aim=b.aimX;
        if(where==='away'&&!/Tell$/.test(b.mode))BK.P.x=Math.min(M.x1-12,px+120);else if(where==='up'&&!/Tell$/.test(b.mode)&&BK.P.ground&&!held){BK.press('jump');held=24;}if(held>0){held--;BK.keys.jump=true;}
        if(opt.block){BK.keys.block=true;BK.P.face=-1;}BK.sim(1);if(b.mode==='bare'||b.mode==='gloat')break;}
      const r={mark,mode:b.mode,open:+(b.open||0).toFixed(2),hurt:Math.round(hp0-BK.P.hp),aim:aim===null?null:Math.round(aim-(ringP??px)),modes:Object.keys(modes)};BK.god=true;BK.keys.block=false;return r;};
    o.scuttleHit=trick('scuttleTell','stand',{trick:'scuttle'});o.scuttleMiss=trick('scuttleTell','up',{trick:'scuttle'});
    o.flaskHit=trick('flaskTell','stand',{trick:'flask',dx:90,tellT:0.9});o.flaskMiss=trick('flaskTell','away',{trick:'flask',dx:90,tellT:0.9});
    o.pounceHit=trick('pounceTell','stand',{trick:'pounce',dx:60});o.pounceMiss=trick('pounceTell','away',{trick:'pounce',dx:60});
    o.poundHit=trick('poundTell','stand',{trick:'pound',dx:50});o.poundMiss=trick('poundTell','up',{trick:'pound',dx:50});
    o.swipeHit=trick('swipeTell','stand',{trick:'swipe',dx:20});o.swipeBlocked=trick('swipeTell','stand',{trick:'swipe',dx:20,block:true});
    { fresh();b.mode='bare';b.modeT=5;b.open=2;const h0=b.hp;BKT.hurtEnemy(b,10,b.x-20,false);o.bareBlow=Math.round(h0-b.hp);BK.sim(30);fresh();const h1=b.hp;BKT.hurtEnemy(b,10,b.x-20,false);o.jarBlow=Math.round(h1-b.hp);BK.sim(30); }
    /* PHASE TWO: the first trick of a pair missed opens nothing - the second comes, told; its miss breaks the jar, leaves smoke, and it hides there */
    { fresh();BK.god=true;b.phase=2;b.hp=HP0*0.4;b.T.trick=0;b.T.swipe=99;BK.P.x=b.x+60;BK.P.y=M.floor;const seq=[];let held=0,hideBlow=null,smoke=0;
      for(let i=0;i<1400;i++){hold();const m=b.mode;if(seq[seq.length-1]!==m)seq.push(m);b.T.swipe=99;
        /* the hero dodges everything: over the scuttle and the waves, out from under the pounce and the flask */
        if((m==='scurry'||m==='pound'||m==='poundTell')&&BK.P.ground&&!(held>0)){BK.press('jump');held=24;}if(held>0){held--;BK.keys.jump=true;}
        if(m==='dive'||m==='lob')BK.P.x=b.x+(BK.P.x>b.x?1:-1)*140;BK.P.x=Math.max(M.x0+14,Math.min(M.x1-14,BK.P.x));
        if((BK.mg().smokes||[]).length)smoke=1;if(m==='hide'&&hideBlow===null){const h=b.hp;BKT.hurtEnemy(b,10,b.x-20,false);hideBlow=Math.round(h-b.hp);}
        BK.sim(1);if(seq.includes('hide')&&seq[seq.length-1]==='scuttleTell'&&seq.indexOf('hide')<seq.length-1)break;}
      const tells=seq.map((m,i)=>[m,i]).filter(([m])=>/Tell$/.test(m));const firstBare=seq.indexOf('bare');const tellsBefore=tells.filter(([,i])=>i<firstBare).length;
      o.pair={seq:seq.slice(0,24),tellsBefore,smoke,hideBlow,hideThenScuttle:seq.indexOf('hide')>=0&&seq[seq.indexOf('hide')+1]==='scuttleTell'}; }
    out.hom=o;}
  /* THE DEATH KNIGHT (Daniel: 'a bit too easy'): the stuck blade holds him a shorter while, and his phase two comes sooner - never more health.
     His fight itself is asked by tools/unburied-fights.mjs and tools/boss-openings.mjs; this asks the two numbers, and that his health did not move */
  if(!ONLY||ONLY==='dk'){const U=await import('/src/unburied-foes.js');out.dk={stuckT:U.UNB.bk.stuckT,p2At:U.UNB.bk.p2At,hp:U.UNB.hp.bloodknight};}
  return out;})()`, 600000);
  console.log(JSON.stringify(r, null, 1));
  if (r.reeve) { const o = r.reeve;
    ok(o.lamps >= 3, 'the Lampreeve\'s hall has its lamps: ' + o.lamps);
    ok(o.alone.sawSnuff && o.alone.open === 0 && o.alone.lampOut, 'a hood left alone opens nothing and the lamp goes out: ' + JSON.stringify(o.alone));
    ok(o.struck.struck && o.struck.open > 1.5 && o.struck.lampLit, 'a lamp struck under the hood flares, he is blinded and open, the lamp burns on: ' + JSON.stringify(o.struck));
    ok(o.openBlow >= 2 * o.shutBlow && o.shutBlow <= 5, 'blind he takes the blow, out of the flare his coat takes most of it: ' + o.openBlow + ' vs ' + o.shutBlow);
    ok(o.lungeStand.told === 'lungeTell' && o.lungeStand.hurt > 0, 'the lunge from the dark is told and hurts a hero who stands: ' + JSON.stringify(o.lungeStand));
    ok(o.lungeRoll.told === 'lungeTell' && o.lungeRoll.hurt === 0, 'a hero who rolls through the lunge is not hurt: ' + JSON.stringify(o.lungeRoll));
    ok(!o.lungeInLight, 'he never lunges at a hero in the light');
    ok(o.p2.phase === 2 && o.p2.took && o.p2.wick === 0 && o.p2.light < 20, 'phase two takes your light: ' + JSON.stringify(o.p2));
    ok(o.p2.relit && o.p2.lightAfter > 60, 'a burning lamp gives your light back: ' + JSON.stringify(o.p2));
    ok(o.lungeStand.mark === '!!', 'the lunge wears the red mark: ' + o.lungeStand.mark); }
  if (r.plough) { const o = r.plough;
    ok(o.baits.includes('trough') && o.baits.includes('fence'), 'his field stands a trough and a fence: ' + o.baits);
    ok(o.open.open === 0 && !o.open.stuck && o.open.turned, 'a charge over open ground opens nothing - he turns it: ' + JSON.stringify(o.open));
    ok(o.trough.stuck === 'trough' && o.trough.open > 1.5, 'baited into the trough the share sticks and he is open: ' + JSON.stringify(o.trough));
    ok(o.fence.stuck === 'fence' && o.fence.open > 1.5, 'baited into the fence the share sticks and he is open: ' + JSON.stringify(o.fence));
    ok(o.open.furrows > 0, 'a run of the plough leaves a furrow');
    ok(o.openBlow > 3 * o.shutBlow, 'stuck he takes the blow, behind the plough he does not: ' + o.openBlow + ' vs ' + o.shutBlow);
    ok(o.headStand.mark === '!!' && o.headStand.hurt > 0 && Math.abs(o.headStand.ring) < 4, 'the head is told red and comes down on the ring: ' + JSON.stringify(o.headStand));
    ok(o.headLeave.hurt === 0, 'a hero who leaves the ring late is not burnt: ' + JSON.stringify(o.headLeave));
    ok(!o.p1Furrow, 'in phase one the furrows are only earth');
    ok(o.furrowOn.told && o.furrowOn.mark === '!!' && o.furrowOn.hurt > 0, 'phase two: the furrows are told red and burn a hero on one: ' + JSON.stringify(o.furrowOn));
    ok(o.furrowOff.told && o.furrowOff.hurt === 0, 'phase two: a hero off the furrows is not touched: ' + JSON.stringify(o.furrowOff)); }
  if (r.hom) { const o = r.hom;
    for (const t of ['scuttle', 'flask', 'pounce', 'pound', 'swipe']) { const hit = o[t + 'Hit'], miss = o[t + 'Miss'] || o[t + 'Blocked'];
      ok(hit.hurt > 0 && hit.mode === 'gloat' && hit.open === 0, 'its ' + t + ' that lands opens nothing: ' + JSON.stringify(hit));
      ok(miss.hurt === 0 && miss.mode === 'bare' && miss.open > 1, 'its ' + t + ' that misses breaks the jar - it is bare and open: ' + JSON.stringify(miss));
      ok(hit.mark === (t === 'pounce' || t === 'swipe' ? '!' : '!!'), 'its ' + t + ' is told with its mark: ' + hit.mark); }
    ok(o.flaskMiss.aim !== null && Math.abs(o.flaskMiss.aim) < 6, 'the flask smashes where you were: ' + o.flaskMiss.aim);
    ok(o.bareBlow > 3 * o.jarBlow, 'bare it takes the blow, in its jar most glances: ' + o.bareBlow + ' vs ' + o.jarBlow);
    ok(o.pair.tellsBefore >= 2, 'phase two: a missed first trick opens nothing - a second is told before the jar breaks: ' + JSON.stringify(o.pair));
    ok(o.pair.smoke > 0 && o.pair.hideBlow === 0 && o.pair.hideThenScuttle, 'phase two: the broken jar leaves smoke, it hides there untouchable, and comes out on a told scuttle: ' + JSON.stringify(o.pair)); }
  if (r.dk) { ok(r.dk.stuckT <= 1.5, 'the Death Knight stuck blade holds him 1.5 s at most: ' + r.dk.stuckT); ok(r.dk.p2At >= 0.6, 'his phase two comes at three-fifths: ' + r.dk.p2At); ok(r.dk.hp === 950, 'his health is not the lever (950, as it was): ' + r.dk.hp); }
  ok(!pg.errors.length, 'page errors: ' + JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
if (fails.length) { for (const f of fails) console.log('FAIL', f); process.exit(1); }
console.log('weak-bosses: OK');
