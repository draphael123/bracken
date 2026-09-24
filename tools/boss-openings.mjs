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
     THE FIRST DEATH KNIGHT  let his Reaping drag one of his own risen dead in: he cuts it and is open; alone it opens nothing
     THE STANDARD-BEARER  cut his banner while it stands in the ground: it tears and he is open; left alone the plant opens nothing */
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
  /* THE FIRST DEATH KNIGHT: the same Reaping twice - with nothing of his in the circle, then with one of his own risen dead in it */
  {const b=boot('unburied');const A=BK.L.arena;for(const e of BK.enemies())if(e!==b&&e.t==='corpse')e.alive=false;b.cd=99;
   const reap=()=>{b.mode='stalk';b.open=0;b.cd=99;BK.P.x=b.x-70;BK.P.y=A.floor-40;BK.P.vy=0;BK.unbU.dkForce(b,'reap',{P:BK.P,A,say:()=>{}});b.modeT=0.02;for(let i=0;i<40&&b.mode==='reapTell';i++)BK.sim(1);for(let i=0;i<5;i++)BK.sim(1);return {mode:b.mode,open:+(b.open||0).toFixed(1)};};
   const alone=reap();
   BK.unbSpawn({t:'corpse',x:Math.floor((b.x+60)/16),y:Math.round(A.floor/16)-1});const add=BK.enemies()[BK.enemies().length-1];add.mode='walk';add.h=24;add.from=b;add.raisedBy=b;
   const drag=reap();out.deathKnight={alone,drag,addCut:!add.alive};}
  /* THE STANDARD-BEARER: a plant left to run out, then a plant whose banner is cut three times */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='unburied'));BK.state='play';BK.god=true;
   const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+1,Math.round(M.floor/16)-1);BK.sim(120);const w=BK.enemies().find(e=>e.t==='standardbearer');
   const plant=()=>{w.mode='plantTell';w.modeT=0;w.cd=99;BK.P.x=w.x-120;BK.sim(2);};
   plant();let openA=0;for(let i=0;i<60*5;i++){BK.sim(1);w.cd=99;openA=Math.max(openA,w.open||0);BK.P.x=w.x-120;}const alone={mode:w.mode,open:+openA.toFixed(1)};
   plant();const fx=w.flagX;let swings=0;for(let k=0;k<8&&w.mode!=='torn';k++){swings++;BK.P.x=fx-12;BK.P.face=1;BK.P.y=M.floor;BK.press('atk');for(let i=0;i<24;i++){BK.sim(1);w.cd=99;}}
   out.standard={alone,mode:w.mode,open:+(w.open||0).toFixed(1),hits:w.flagHits,swings};}
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

  assert.notEqual(r.deathKnight.alone.mode, 'open', 'A11: his Reaping with nothing of his in it opens nothing: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.deathKnight.drag.mode, 'open', 'A11: a Reaping that cuts one of his own risen dead leaves him open: ' + JSON.stringify(r.deathKnight));
  assert.ok(r.deathKnight.drag.open > 3 && r.deathKnight.addCut, 'the window, and the dead man cut: ' + JSON.stringify(r.deathKnight));
  assert.equal(r.standard.alone.open, 0, 'a plant left alone opens nothing: ' + JSON.stringify(r.standard));
  assert.equal(r.standard.mode, 'torn', 'three cuts on the planted banner tear it: ' + JSON.stringify(r.standard));
  assert.ok(r.standard.open > 2, 'the torn banner is the window: ' + JSON.stringify(r.standard));
  assert.deepEqual(pg.errors, []);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
