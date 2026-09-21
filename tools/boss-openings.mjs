/* tools/boss-openings.mjs — THE WINDOW THE PLAYER MAKES.
   All four of the levels added in the Codex pass shipped a boss that chose its attacks with turn++%n and handed out a
   timed rest after every one of them, so nothing the player did ever opened anything: docs/audit-new-levels-0920.md.
   Each of them now has one opening the player causes, and this proves it is caused - the same boss, left alone through
   the same attack, must NOT open.
     THE BURIED DEAD   slam him down on the ground he already erupted through
     THE BREAKWATER WARDEN  turn the anchor on the shield
     THE VAULT KEEPER  cut him while the bell is swinging
     THE UNDEAD ARCHMAGE  fly out of his DEATH MARK: the mark that finds no one comes back on him (batch 4, the sky fight) */
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

  assert.deepEqual(pg.errors, []);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
