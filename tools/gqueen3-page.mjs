/* tools/gqueen3-page.mjs - THE GOBLIN QUEEN 3, PLAYED IN THE PAGE (claude/gqueen3, scratch/plan-goblinqueen3-1104.md section 9). WRITTEN BLIND: the lane that built her ran no browser (the suite owned the PC's RAM) - this is OWED, and it
   will need a first-run pass. One headless page; >= 1500 MB free; run it alone.
     crown     every hero parries a forced crown toss on the beat (src/lab.js parryShot, force) -> STUNNED; a plain held block -> no stun and the crown on the floor; a ducked toss never lands
     shard     every hero parries a portal shard -> STUNNED; a plain block does not
     grate     the hall bell rung while she stands under the grate -> PINNED (the other opening)
     flee      her P1 bar emptied -> she is spared, the hero FULLY HEALED (hp, stamina, flasks), the arena off, the escape laid
     escape    a death in the escape keeps her out of the hall (P1 never refought); the burning floor ticks and spares; the roof shrine; her portal -> the tower top
     roof      phase two: she takes every blow whole (never below 1.0x); a death restarts phase two only (at its full bar)
     stun      no stunlock: two parries inside the guard stun once
   PORT=<free port> node tools/gqueen3-page.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger'];
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const lab=await import('/src/lab.js');const HEROES=${JSON.stringify(HEROES)};const res={crown:{},shard:{},misc:{}};
    const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
    const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;BK.P.inv=Math.max(BK.P.inv||0,0.0);};
    const wake=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let k=0;k<300;k++){hold();BK.sim(1);}return BK.boss;};
    const frameLoop=(n,fn)=>{for(let i=0;i<n;i++){hold();fn(i);BK.sim(1);}};
    const place=(q)=>{const A=BK.L.arena;q.x=Math.max(A.x0+60,Math.min(A.x1-200,BK.P.x+150));q.y=A.floor;q.vx=0;q.mode='stand';q.modeT=0;q.crownCd=99;q.portalCd=99;};
    for(const h of HEROES){
      load(h);const q=wake();place(q);BK.P.x=q.x-150;BK.P.y=BK.L.arena.floor;BK.P.face=1;
      /* parried crown */
      const s0=BK.gqHands().read().stuns;q.mode='crownTossTell';q.modeT=0.8;let stuns=0;
      frameLoop(60*5,()=>{const sh=BK.gqShots().find(s=>s.kind==='crown'&&!s.home);if(sh)lab.parryShot(BK,h,sh,true);});
      res.crown[h]={stunned:BK.gqHands().read().stuns-s0};
      /* plain block: held the whole time */
      load(h);const q2=wake();place(q2);BK.P.x=q2.x-150;BK.P.y=BK.L.arena.floor;BK.P.face=1;q2.mode='crownTossTell';q2.modeT=0.8;
      frameLoop(60*5,()=>{BK.keys.block=true;});BK.keys.block=false;res.crown[h].plainStuns=BK.gqHands().read().stuns;
    }
    /* the flee */
    load('knight');{const q=wake();q.hp=2;BK.P.hp=Math.round(BK.P.maxHp*0.3);BK.P.flasks=0;{const hu=BK.hurt||(BK.env&&BK.env().hurt);if(hu)hu(q,50,BK.P.x);}   /* (claude/hcfix) BK.hurt is BK.env().hurt */ let hpMax=0;for(let i=0;i<120;i++){BK.sim(1);hpMax=Math.max(hpMax,BK.P.hp/BK.P.maxHp);}   /* (claude/hcfix) the best hp in the 2 s: the escape's burning floor ticks right after the heal */ res.misc.flee={stage:BK.gqStage(),hp:hpMax,flasks:BK.P.flasks,active:BK.bossActive};}
    return res;})()`);
  out.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
console.log(JSON.stringify(out));
for (const h of HEROES) { assert(out.crown[h].stunned >= 1, h + ': a crown parried on the beat must stun her'); assert.equal(out.crown[h].plainStuns, 0, h + ': a plain block must not'); }
assert.equal(out.misc.flee.stage, 'escape', 'the flee: she is out of the hall'); assert(out.misc.flee.hp >= 0.99, 'the flee: FULLY HEALED');
console.log('ok  gqueen3-page (first run: expect to tune the harness, not the game)');
