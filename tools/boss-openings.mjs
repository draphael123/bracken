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
     THE HEDGE WARDEN  cut him down beside a witchlight brazier: the stump burns, open, and cannot regrow while it does (batch 4c) */
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
   const lay=()=>{b.mode='markTell';b.spell='mark';b.modeT=0;b.mark=null;b.shots=[];b.clouds=[];b.blinkT=99;BK.sim(2);return !!b.mark;};
   // left to land: he is NOT open
   BK.god=false;BK.P.hp=BK.P.maxHp;const laid1=lay();const m1=b.mark&&{x:b.mark.x,y:b.mark.y};for(let i=0;i<200&&b.mark;i++){if(m1){BK.P.x=m1.x;BK.P.y=m1.y+8;}hold();BK.sim(1);}
   const landed={mode:b.mode,open:+(b.open||0).toFixed(1),hurt:BK.P.hp<BK.P.maxHp};BK.P.hp=BK.P.maxHp;BK.god=true;
   // flown out of: it comes back on him
   b.mode='hover';b.modeT=1;BK.sim(5);const laid2=lay();const m2=b.mark&&{x:b.mark.x,y:b.mark.y};for(let i=0;i<200&&b.mark;i++){if(m2){BK.P.x=m2.x+b.mark.r+40;BK.P.y=m2.y+8;}hold();BK.sim(1);}
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
  assert.ok(r.hedgeWarden.fire.open > 2, 'felled beside a brazier, the stump burns open: ' + JSON.stringify(r.hedgeWarden));
  assert.ok(r.hedgeWarden.burning.mode === 'stump' && r.hedgeWarden.burning.open > 0, 'a burning stump does not regrow: ' + JSON.stringify(r.hedgeWarden));

  assert.deepEqual(pg.errors, []);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
