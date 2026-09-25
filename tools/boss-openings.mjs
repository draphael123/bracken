/* tools/boss-openings.mjs — THE WINDOW THE PLAYER MAKES.
   All four of the levels added in the Codex pass shipped a boss that chose its attacks with turn++%n and handed out a
   timed rest after every one of them, so nothing the player did ever opened anything: docs/audit-new-levels-0920.md.
   Each of them now has one opening the player causes, and this proves it is caused - the same boss, left alone through
   the same attack, must NOT open.
     THE BURIED DEAD   slam him down on the ground he already erupted through
     THE BREAKWATER WARDEN  turn the anchor on the shield
     THE VAULT KEEPER  cut him while the bell is swinging
     THE UNDEAD ARCHMAGE  fly out of his DEATH MARK: the mark that finds no one comes back on him (batch 4, the sky fight)
     THE PYROMANDER    keep hitting him while he runs hot: he cannot vent, and his own fire takes him over the top (batch 5)
     THE GRAVE WARDEN  let his dig mark you beside an open grave and leave late: the spade goes in and he kneels (batch 4b)
     THE HEDGE WARDEN  cut him down beside a witchlight brazier: the stump burns, open, and cannot regrow while it does (batch 4c)
     THE GATE GARGOYLE  stand on a CRACKED slab and leave it late: his dive goes through it and he hangs from the next one's edge;
                        the same dive on a solid slab opens nothing, and leaving early only moves his aim (the stair's top, 2026-09-22)
     THE FIRST DEATH KNIGHT  the hero's own rule: fill his BLOOD WARD and strike it again, and it breaks - he is open; a ward
                             left to run out opens nothing (2026-09-24: he fights with the class's kit)
     THE WINDCALLER    brace through his howl (the guard key held on the ground): his own wind fails him and he falls, open; the
                       same howl left to blow walks you to the wall and opens nothing (Gale Moor rework, 2026-09-25)
     THE DUNE WORM     wind the hollow's awning out and let his breach come up under it: he comes up INTO the canvas, tangled, and
                       the awning comes down; the same breach in the open sand, or under the awning rolled IN, opens nothing (2026-09-25)
     THE SEXTON        make him rush you across a counting plank: it breaks under his charge and he is caught in the bell pit (2026-09-25)
     THE BARROW RIDER  strike him as he rides through and he is out of the saddle, open; a ride left alone opens nothing - and in
                       his second phase, the bones crawling back struck twice scatter, and he is open on foot; left alone he remounts */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
  const boot=(id,hero)=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;
    const A=BK.L.arena;if(A.carpet){BK.board();BK.sim(150);return BK.boss;}BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};

  /* THE BURIED DEAD: the slam onto his own broken ground */
  {const b=boot('burial');const A=BK.L.arena;
   // left alone, the same slam is just a slam
   b.brokeT=0;BK.P.x=b.x-260;for(let i=0;i<8&&b.mode!=='rest';i++){b.mode='slamTell';b.modeT=0;BK.sim(1);}const alone=b.mode;
   // and with the hole under him it takes his arm
   for(let i=0;i<8&&!(b.brokeT>0);i++){b.mode='eruptTell';b.markX=b.x;b.modeT=0;BK.sim(1);}const broke=b.brokeX;
   for(let i=0;i<8&&b.mode!=='stuck';i++){b.mode='slamTell';b.modeT=0;BK.sim(1);}
   out.buried={alone,broke:Math.round(broke-b.x),mode:b.mode,open:+b.open.toFixed(1)};}

  /* THE BREAKWATER WARDEN: the anchor turned on the shield */
  {const b=boot('harbor');
   b.open=0;for(let i=0;i<8&&b.open===0;i++){b.mode='anchorTell';b.modeT=0;BK.P.x=b.x+40*b.face;BK.P.face=-b.face;BK.keys.block=false;BK.sim(1);}const unguarded=+b.open.toFixed(1);
   /* god mode never reports a block, and the block IS the mechanic: the unguarded pass above runs untouchable, this one does not */
   BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.dead=0;
   b.open=0;BK.keys.block=true;BK.sim(10);for(let i=0;i<10&&b.open===0;i++){b.mode='anchorTell';b.modeT=0;BK.P.hp=BK.P.maxHp;BK.P.dead=0;BK.P.x=b.x+40*b.face;BK.P.face=-b.face;BK.keys.block=true;BK.sim(1);}
   out.warden={unguarded,guarded:+b.open.toFixed(1),mode:b.mode};BK.keys.block=false;BK.god=true;}

  /* THE VAULT KEEPER: the bell cut out of his hands */
  {/* he is the keep's MINI, in his own room: the arena here belongs to the Drowned King */
   BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='keep'));BK.state='play';BK.god=true;
   const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+(M.reverse?-1:1),Math.round(M.floor/16)-1);BK.sim(240);
   const b=BK.enemies().find(e=>e.alive&&e.vaultKeeper);
   if(!b)return{error:'no vault keeper',mini:BK.miniActive};
   b.mode='vaultRingTell';b.modeT=.6;BK.sim(3);const ringing=b.mode;
   BKT.hurtEnemy(b,3,b.x-20,false);for(let i=0;i<10&&b.mode!=='vaultStunned';i++)BK.sim(1);
   out.keeper={ringing,mode:b.mode,open:+b.open.toFixed(1),mini:BK.miniActive};}

  /* THE UNDEAD ARCHMAGE: the death mark, left to land and then flown out of */
  {const b=boot('fallingtower');const hold=()=>{BK.P.vx=BK.P.vy=0;};
   const lay=()=>{b.mode='markTell';b.spell='mark';b.modeT=0;b.deathMark=null;b.shots=[];b.clouds=[];b.blinkT=99;BK.sim(2);return !!b.deathMark;};
   // left to land: he is NOT open
   BK.god=false;BK.P.hp=BK.P.maxHp;const laid1=lay();const m1=b.deathMark&&{x:b.deathMark.x,y:b.deathMark.y};for(let i=0;i<200&&b.deathMark;i++){if(m1){BK.P.x=m1.x;BK.P.y=m1.y+8;}hold();BK.sim(1);}
   const landed={mode:b.mode,open:+(b.open||0).toFixed(1),hurt:BK.P.hp<BK.P.maxHp};BK.P.hp=BK.P.maxHp;BK.god=true;
   // flown out of: it comes back on him
   b.mode='hover';b.modeT=1;BK.sim(5);const laid2=lay();const m2=b.deathMark&&{x:b.deathMark.x,y:b.deathMark.y};for(let i=0;i<200&&b.deathMark;i++){if(m2){BK.P.x=m2.x+b.deathMark.r+40;BK.P.y=m2.y+8;}hold();BK.sim(1);}
   out.mage={laid:laid1&&laid2,landed,mode:b.mode,open:+(b.open||0).toFixed(1)};}
  /* THE PYROMANDER: the same hot boss, left alone (he vents) and struck (he overheats) */
  {const b=boot('burning');BK.P.x=b.x-110;
   b.heat=75;b.calmT=5;b.mode='stalk';b.cd=0;b.open=0;let openA=0;for(let i=0;i<240;i++){BK.sim(1);openA=Math.max(openA,b.open||0);}
   const alone={open:+openA.toFixed(1),heat:Math.round(b.heat)};
   b.heat=75;b.calmT=0;b.mode='stalk';b.cd=0;b.open=0;let openS=0;for(let i=0;i<600&&!(b.open>0);i++){if(i%30===0)BKT.hurtEnemy(b,1,b.x-20,false);BK.sim(1);}openS=b.open||0;
   out.pyro={alone,mode:b.mode,open:+openS.toFixed(1)};}
  /* THE GRAVE WARDEN: his dig, on solid floor and then beside an open grave, the hero gone from the mark both times */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=true;
   const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='gravewarden');
   const dig=markX=>{w.mode='digTell';w.modeT=0;w.markX=markX;w.cd=99;BK.P.x=markX+90;BK.sim(3);return {mode:w.mode,open:+(w.open||0).toFixed(1)};};
   const solid=dig(734*16);w.mode='stalk';w.modeT=0;BK.sim(2);const grave=dig((742+1)*16+6);
   out.graveWarden={solid,grave};}
  /* THE HEDGE WARDEN: felled on the open lawn, then felled beside a brazier - the same blow, the hero standing off both times */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='witchlight'));BK.state='play';BK.god=true;
   const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='hedgewarden'&&e.mini);
   const third=w.maxHp/3,root=w.maxHp-third+w.maxHp*0.16;
   const fell=x=>{w.mode='stalk';w.cd=99;w.burnT=0;w.growth=0;w.hp=Math.ceil(root)+2;w.x=x;BK.P.x=x-150;BKT.hurtEnemy(w,Math.ceil(third),w.x-20,false);BK.sim(20);return {mode:w.mode,open:+(w.open||0).toFixed(1)};};
   const lawn=fell(143*16);BK.P.x=w.x-150;BK.sim(330);const grew={mode:w.mode,hp:Math.round(w.hp),full:Math.round(w.maxHp)};
   const fire=fell(BK.L.witch.braziers[0][0]*16+20);BK.P.x=w.x-150;BK.sim(120);const burning={mode:w.mode,open:+(w.open||0).toFixed(1)};
   out.hedgeWarden={lawn,grew,fire,burning};}
  /* THE GATE GARGOYLE: the same dive three times - on a solid slab left late, on a cracked slab left late, on a cracked slab left early */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='witchlight'));BK.state='play';BK.god=true;
   const g=BK.enemies().find(e=>e.t==='gargoyle');for(const e of BK.enemies())if(e!==g)e.alive=false;const sl=BK.movers().filter(m=>m.arena);
   const on=m=>{BK.P.x=m.x+m.w/2;BK.P.y=m.y;BK.P.vy=0;BK.P.onMover=m;BK.P.ground=true;};
   on(sl[0]);BK.sim(90);
   const next=m=>sl.filter(q=>q!==m&&!q.broken&&!q.cracked).sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x))[0];
   const dive=(m,late)=>{g.mode='hover';g.hp=g.maxHp;g.phase=1;BK.sim(2);on(m);g.mode='diveTell';g.modeT=0.4;g.tgt=m;g.off=m.w/2;g.cd=99;g.queue=[];
     if(!late)on(next(m));for(let i=0;i<120&&g.mode==='diveTell';i++){if(late)on(m);BK.sim(1);}
     if(late)on(next(m));for(let i=0;i<120&&g.mode==='dive';i++)BK.sim(1);const o={mode:g.mode,open:+(g.open||0).toFixed(1),broken:!!m.broken,aim:g.tgt===m};g.mode='hover';g.modeT=0;return o;};
   const solid=dive(sl.find(m=>!m.cracked),true),early=dive(sl.find(m=>m.cracked&&!m.broken),false),cracked=dive(sl.find(m=>m.cracked&&!m.broken),true);
   out.gargoyle={solid,early,cracked};}
  /* THE FIRST DEATH KNIGHT: the BLOOD WARD twice - left to run out into its nova, then filled and struck once more through the
     game's own hurtEnemy (so unbHurt's wiring is asked too) */
  {const b=boot('unburied');const A=BK.L.arena;for(const e of BK.enemies())if(e!==b&&e.t==='corpse')e.alive=false;b.cd=99;
   const ward=hits=>{b.mode='stalk';b.open=0;b.cd=99;BK.P.x=b.x-140;BK.P.y=A.floor-40;BK.P.vy=0;BK.unbU.dkForce(b,'ward',{P:BK.P,A,say:()=>{},sound:()=>{}});b.modeT=0.02;
     for(let i=0;i<10&&b.mode!=='ward';i++)BK.sim(1);const hp0=b.hp;let open=0;for(let k=0;k<hits;k++){BKT.hurtEnemy(b,10,b.x-20,true);BK.sim(2);}
     for(let i=0;i<60*4&&b.mode!=='open'&&b.mode!=='stalk';i++){BK.sim(1);b.cd=99;}open=b.open||0;return {mode:b.mode,open:+open.toFixed(1),kept:hp0-b.hp};};
   const alone=ward(0),broke=ward(BK.unbU.UNB.dk.wardFull+1);out.deathKnight={alone,broke};}
  /* THE BARROW RIDER: a ride left alone, then a ride struck as it passes (the game's own hurtEnemy, so unbHurt's wiring is asked
     too); then, past half, a remount left alone and a remount whose crawling bones are cut twice by the hero's own swings */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='unburied'));BK.state='play';BK.god=true;
   const M=BK.L.mini,A={x0:M.x0,x1:M.x1,floor:M.floor},c={P:BK.P,A,say:()=>{},sound:()=>{}};BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='barrowrider');
   const ride=hit=>{w.mode='stalk';w.mounted=true;w.cd=99;w.x=A.x1-60;BK.P.x=A.x0+120;BK.P.y=A.floor-60;BK.P.vy=0;BK.unbU.brForce(w,'ride',c);w.modeT=0.02;let open=0,struck=false;
     for(let i=0;i<150;i++){BK.P.y=A.floor-60;BK.P.vy=0;if(hit&&!struck&&w.mode==='ride'&&Math.abs(w.x-BK.P.x)<40){struck=true;BKT.hurtEnemy(w,8,BK.P.x,true);}BK.sim(1);w.cd=99;open=Math.max(open,w.open||0);}
     return {mode:w.mode,open:+open.toFixed(1),mounted:w.mounted};};
   const alone=ride(false),struck=ride(true);
   const remount=cut=>{w.mode='stalk';w.phase=2;w.hp=Math.round(w.maxHp*0.4);w.mounted=false;w.footLeft=0;w.cd=0;w.x=(A.x0+A.x1)/2;BK.P.x=w.x-70;BK.P.y=A.floor;BK.P.vy=0;BK.sim(2);
     let open=0,swings=0;for(let i=0;i<60*3&&w.mode!=='scattered';i++){if(cut&&w.mode==='remountTell'&&i%24===0&&Number.isFinite(w.bonesX)){swings++;BK.P.x=w.bonesX-14;BK.P.face=1;BK.P.y=A.floor;BK.press('atk');}BK.sim(1);open=Math.max(open,w.open||0);}
     return {mode:w.mode,open:+open.toFixed(1),mounted:w.mounted,swings};};
   const left=remount(false),cut=remount(true);
   out.rider={alone,struck,left,cut};}
  /* THE WINDCALLER: his howl twice - left to blow (it walks you to the wall and he blinks away) and braced through, the guard key
     held on the ground (his wind fails him and he falls, open): the moor's own lesson, docs/briefs/gale-moor-rework.md §4 */
  {const b=boot('moor');const A=BK.L.arena;for(const e of BK.enemies())if(e!==b&&!e.maxHp)e.alive=false;
   const howl=brace=>{b.mode='howlTell';b.modeT=0.01;b.hits=0;b.howlT=99;b.stoneT=99;b.wallT=99;b.specialT=99;b.braceT=0;BK.P.x=(A.x0+A.x1)/2+60;BK.P.y=A.floor;BK.P.vy=0;BK.P.vx=0;
     let fell=false,moved=0;const x0=BK.P.x;for(let i=0;i<60*3;i++){BK.keys.block=brace;BK.sim(1);moved=Math.max(moved,Math.abs(BK.P.x-x0));if(b.mode==='fallen'){fell=true;break;}if(b.mode==='blink'||b.mode==='appear')break;}
     BK.keys.block=false;const o={mode:b.mode,fell,moved:Math.round(moved),braceT:+(b.braceT||0).toFixed(2)};b.mode='cast';b.modeT=9;BK.sim(5);return o;};
   const left=howl(false),held=howl(true);out.windcaller={left,held};}

  /* THE DUNE WORM: one breach, three ways. The hero stands where it will lock and leaves LATE (after the commit), as a player baits it */
  {const b=boot('caravan');const A=BK.L.arena;const w=BK.caravan().winches.find(q=>q.hollow);
   for(let i=0;i<200&&(b.mode==='wake'||!b.st);i++)BK.sim(1);
   const mid=(w.canopy.x0+w.canopy.x1+1)*8,open=A.x1-90;
   const breach=(x,rolled)=>{w.out=w.k=rolled;w.cd=0;const W=b.st;W.mode='under';W.t=0;W.i=0;W.ripples=[];let tangled=0,left=false,opened=0;
     for(let f=0;f<60*5;f++){BK.P.hp=BK.P.maxHp;if(!left){BK.P.x=x;BK.P.y=A.floor;BK.P.vx=0;}
       if(!left&&W.mode==='rippleTell'&&W.ripples.some(r=>r.real&&r.commit)){left=true;BK.P.x=x+60;}
       BK.sim(1);if(b.mode==='tangled')tangled++;if(BK.bossOpen(b))opened++;if(W.mode==='dive'||W.mode==='surfaced'&&tangled===0&&f>60)break;}
     return {tangled:+(tangled/60).toFixed(1),open:+(opened/60).toFixed(1),awning:w.out,mode:b.mode};};
   out.worm={openSand:breach(open,1),rolledIn:breach(mid,0),rolledOut:breach(mid,1)};}
  /* THE SEXTON (the Falling Tower's mini): his rush over WHOLE planks is only a rush; over a COUNTING plank it breaks it and he is caught in the bell pit */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;const D=BK.L.bellDeck;BK.tp(43,D.deck+2);BK.sim(120);
   const s=BK.enemies().find(e=>e.alive&&e.t==='sexton');if(!s)return{error:'no sexton',mini:BK.miniActive};const planks=BK.L.crumbles.filter(c=>c.kind==='deck');
   const rush=count=>{for(const c of planks){c.st='whole';c.t=0;}s.mode='stalk';s.cd=99;s.y=BK.L.mini.floor;s.x=24*16;s.face=1;BK.P.x=39*16+8;BK.P.y=D.deck*16-32;BK.sim(2);
     if(count){const c=planks.find(q=>q.x0===27);c.st='count';c.t=2.5;}s.mode='rushTell';s.modeT=0;let pit=0;for(let i=0;i<50;i++){BK.P.x=39*16+8;BK.sim(1);pit=Math.max(pit,s.mode==='pit'?s.open:0);}return{mode:s.mode,open:+pit.toFixed(1)};};
   out.sexton={whole:rush(false),counting:rush(true)};}
  return out;})()`, 300000);

  assert.notEqual(r.buried.alone, 'stuck', 'the slam alone must not open him');
  assert.equal(r.buried.mode, 'stuck', 'slamming onto his own broken ground must bury his arm');
  assert.ok(r.buried.open > 3, 'the arm in the ground is the long window: ' + r.buried.open);

  assert.ok(r.warden.unguarded < 2.1, 'an anchor nobody turned is only his own rest: ' + r.warden.unguarded);
  assert.ok(r.warden.guarded > 3, 'turning the anchor must tear it loose: ' + r.warden.guarded);

  assert.equal(r.keeper.ringing, 'vaultRingTell', 'the bell must still be swinging when it is struck');
  assert.equal(r.keeper.mode, 'vaultStunned', 'cutting him through the bell must break the note');
  assert.ok(r.keeper.open > 2.5, 'the cracked bell is the window: ' + r.keeper.open);

  assert.ok(r.mage.laid, 'the death mark must be laid');
  assert.ok(r.mage.landed.hurt, 'left on it, the mark must land: ' + JSON.stringify(r.mage.landed));
  assert.notEqual(r.mage.landed.mode, 'gather', 'a mark that lands opens nothing: ' + JSON.stringify(r.mage.landed));
  assert.equal(r.mage.mode, 'gather', 'flown out of, the mark must come back on him');
  assert.ok(r.mage.open > 2, 'the gathering is the window: ' + r.mage.open);

  assert.equal(r.pyro.alone.open, 0, 'left alone while hot, he vents and opens nothing: ' + JSON.stringify(r.pyro.alone));
  assert.equal(r.pyro.mode, 'overheat', 'struck while hot, he overheats: ' + JSON.stringify(r.pyro));
  assert.ok(r.pyro.open > 2, 'the overheat is the window: ' + r.pyro.open);

  assert.notEqual(r.graveWarden.solid.mode, 'kneel', 'a dig that misses on solid floor opens nothing: ' + JSON.stringify(r.graveWarden));
  assert.equal(r.graveWarden.grave.mode, 'kneel', 'a dig into an open grave puts him on his knees: ' + JSON.stringify(r.graveWarden));
  assert.ok(r.graveWarden.grave.open > 2, 'the kneel is the window: ' + JSON.stringify(r.graveWarden));
  assert.equal(r.hedgeWarden.lawn.mode, 'felled', 'a blow through his root fells him: ' + JSON.stringify(r.hedgeWarden));
  assert.equal(r.hedgeWarden.lawn.open, 0, 'felled on the open lawn, the stump is not open: ' + JSON.stringify(r.hedgeWarden));
  assert.ok(!['felled', 'stump'].includes(r.hedgeWarden.grew.mode) && r.hedgeWarden.grew.hp === r.hedgeWarden.grew.full, 'a stump left alone grows him back whole: ' + JSON.stringify(r.hedgeWarden));
  assert.ok(r.gargoyle.solid.mode === 'land' && r.gargoyle.solid.open === 0 && !r.gargoyle.solid.broken, 'his dive on a solid slab opens nothing: ' + JSON.stringify(r.gargoyle));
  assert.ok(!r.gargoyle.early.aim && !r.gargoyle.early.broken && r.gargoyle.early.open === 0, 'leaving a cracked slab early only moves his aim: ' + JSON.stringify(r.gargoyle));
  assert.ok(r.gargoyle.cracked.mode === 'hang' && r.gargoyle.cracked.open > 2 && r.gargoyle.cracked.broken, 'left late, a cracked slab breaks under him and he hangs, open: ' + JSON.stringify(r.gargoyle));
  assert.ok(r.hedgeWarden.fire.open > 2, 'felled beside a brazier, the stump burns open: ' + JSON.stringify(r.hedgeWarden));
  assert.ok(r.hedgeWarden.burning.mode === 'stump' && r.hedgeWarden.burning.open > 0, 'a burning stump does not regrow: ' + JSON.stringify(r.hedgeWarden));

  assert.notEqual(r.deathKnight.alone.mode, 'open', 'A11: a blood ward left to run out opens nothing: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.deathKnight.broke.mode, 'open', 'A11: a FULL ward struck again breaks and leaves him open: ' + JSON.stringify(r.deathKnight));
  assert.ok(r.deathKnight.broke.open > 3, 'the window: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.deathKnight.broke.kept, 0, 'the blows on the ward are kept, not taken: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.rider.alone.open, 0, 'a ride-through left alone opens nothing: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.alone.mounted, 'and leaves him in the saddle: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.struck.open > 3, 'struck as he rides through, he is out of the saddle and open: ' + JSON.stringify(r.rider));
  assert.equal(r.rider.left.open, 0, 'a remount left alone opens nothing: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.left.mounted, 'and puts him back in the saddle: ' + JSON.stringify(r.rider));
  assert.equal(r.rider.cut.mode, 'scattered', 'the crawling bones cut by the hero\'s swings scatter: ' + JSON.stringify(r.rider));
  assert.ok(r.rider.cut.open > 3, 'and he is open on foot: ' + JSON.stringify(r.rider));
  assert.ok(!r.windcaller.left.fell, 'A11: a howl left to blow opens nothing: ' + JSON.stringify(r.windcaller));
  assert.ok(r.windcaller.left.moved > 40, 'and it walks an unbraced hero across the room: ' + JSON.stringify(r.windcaller));
  assert.ok(r.windcaller.held.fell, 'A11: braced through his howl, his own wind fails him and he falls, open: ' + JSON.stringify(r.windcaller));
  assert.equal(r.worm.openSand.tangled, 0, 'THE DUNE WORM: a breach in the open sand opens nothing: ' + JSON.stringify(r.worm));
  assert.equal(r.worm.rolledIn.tangled, 0, 'a breach under his awning ROLLED IN opens nothing: ' + JSON.stringify(r.worm));
  assert.ok(r.worm.rolledOut.tangled >= 2.4 && r.worm.rolledOut.open >= 2.4, 'a breach under the awning rolled OUT comes up into it: tangled and open, the window: ' + JSON.stringify(r.worm));
  assert.equal(r.worm.rolledOut.awning, 0, 'and the awning comes down onto him: it has to be wound out again: ' + JSON.stringify(r.worm));
  assert.equal(r.sexton.whole.open, 0, 'THE SEXTON: a rush over whole planks opens nothing: ' + JSON.stringify(r.sexton));
  assert.ok(r.sexton.counting.open > 2, 'a rush over a counting plank breaks it and he is caught in the bell pit, open: ' + JSON.stringify(r.sexton));
  assert.deepEqual(pg.errors, []);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
