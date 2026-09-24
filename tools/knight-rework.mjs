// tools/knight-rework.mjs — THE KNIGHT REWORK DOES WHAT ITS BRIEF SAYS (docs/briefs/knight-rework.md).
// Played through the real input on a flat floor, the blows delivered through damagePlayer as a foe's would be:
//   riposte  a PERFECT GUARD (the shield raised as the blow lands) opens a window, and the next cut inside it is HEAVY - a
//            third cut, whatever its place in the run, and it hits harder than the plain first cut. A guard raised EARLY (held
//            before the blow) and one raised LATE (after it landed) open nothing, and a cut after the window is plain again.
//            PERFECT GUARD still doubles the window; COUNTERSTROKE still strikes back by itself.
//   lesson   THE BRACKEN WOOD teaches it: a 'parry' lesson stretch with a sign in it and the slow lesson swordsman on its flat
// Every case was run against the code before the rework and FAILED there (see the commit that added it).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['lesson', 'riposte'];

if (WANT.includes('lesson')) {
  const R = LEVELS.find(l => l.id === 'wood').build(), z = (R.lessons || []).find(q => q.kind === 'parry');
  assert(z, 'THE BRACKEN WOOD has a PERFECT GUARD lesson stretch (L.lessons, kind parry)');
  const inside = e => e.x >= z.x0 && e.x <= z.x1;
  const foe = R.ents.find(e => e.t === 'swornsword' && e.lesson === 'parry' && inside(e));
  assert(foe, 'with the slow lesson swordsman standing in it');
  const sign = R.ents.find(e => e.t === 'sign' && inside(e) && /PERFECT GUARD/.test(e.text) && e.x < foe.x);
  assert(sign, 'and a sign before him that names the perfect guard');
  assert(R.grid[(foe.y + 1) * R.W + foe.x] !== 0, 'and he stands on the floor, not in the air');
  console.log('lesson: wood columns ' + z.x0 + '-' + z.x1 + ', sign at ' + sign.x + ', swordsman at ' + foe.x);
}

const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__kn=(ids,foes)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(20);
      BKT.PROG.skillOwned.knight=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.knight=ids.slice(0,4);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;BK.P.combo=0;BK.P.riposteT=0;BK.P.riposteHeavy=false;
      return foes.map(([t,dx])=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;return e;});};
    /* raise the guard 'lead' frames before a blow lands (null: never raised; negative: raised that many frames AFTER it landed;
       'noblow': no blow at all, the plain first cut to measure against),
       then wait 'wait' frames and swing once. What came of the blow, of the swing, and what the swing did to the foe. */
    window.__guard=(ids,lead,wait)=>{const [e]=__kn(ids,[['sprig',18]]);const P=BK.P;
      if(lead!==null&&lead>0){BK.keys.block=true;BK.sim(lead);}
      P.inv=0;const res=lead==='noblow'?null:BKT.damagePlayer(P.x+14,10,{});
      if(lead!==null&&lead<0){BK.sim(-lead);BK.keys.block=true;BK.sim(2);}
      BK.keys.block=false;const win=P.riposteT,rh=!!P.riposteHeavy,counter=!!P.counter;BK.sim(wait);
      e.x=P.x+18;e.vx=0;e.stagger=0;e.hp=5000;P.face=1;P.inv=0;BK.press('atk');for(let i=0;i<20&&!(P.atk>=0);i++)BK.sim(1);const heavy=P.atk>=0&&!!P.heavySwing,combo=P.atk>=0?P.combo:-1;BK.sim(24);   /* (a parry holds the frame a moment: the swing starts when the stop ends) */
      return {res,win:+win.toFixed(3),rh,counter,heavy,combo,dmg:5000-e.hp};};return 1})()`);
  const out = {};
  if (WANT.includes('riposte')) out.riposte = await pg.evalp(`(()=>({
      perfect: __guard([],2,2), early: __guard([],30,2), late: __guard([],-3,2), none: __guard([],null,2), plain: __guard([],'noblow',2),
      afterWindow: __guard([],2,44), passive: __guard(['parry'],10,2), noPassive: __guard([],10,2), counter: __guard(['counterstroke'],2,2)}))()`);
  if (out.riposte) { const r = out.riposte; console.log('riposte', JSON.stringify(r));
    assert.equal(r.perfect.res, 'blocked', 'the perfect guard turns the blow');
    assert(r.perfect.rh && r.perfect.win > 0 && r.perfect.win <= 0.6, 'a PERFECT GUARD opens the riposte window, about 0.6 s long (' + r.perfect.win + ')');
    assert(r.perfect.heavy && r.perfect.combo % 3 === 0, 'and the next cut inside it is HEAVY - a third cut, though it was the first of a run (combo ' + r.perfect.combo + ')');
    assert(r.plain.dmg > 0 && r.perfect.dmg > r.plain.dmg, 'and it hits harder than the plain first cut (' + r.perfect.dmg + ' against ' + r.plain.dmg + ')');
    assert.equal(r.early.res, 'blocked', '(a guard held up early still blocks)');
    assert(!r.early.rh && !r.early.heavy, 'but a guard raised EARLY opens nothing: the next cut is a plain first cut');
    assert(r.late.res === 'hit' && !r.late.rh && !r.late.heavy, 'and one raised LATE is a blow taken, and opens nothing');
    assert(!r.plain.heavy, '(the first cut of a run, with no guard, is not heavy)');
    assert(!r.afterWindow.heavy, 'the window closes: a cut started after it is plain');
    assert(!r.noPassive.rh && r.passive.rh && r.passive.heavy, 'PERFECT GUARD still doubles the window: raised 10 frames before the blow is a perfect guard with it and not without');
    assert(r.counter.counter, 'COUNTERSTROKE still strikes back by itself');
  }
  assert.deepEqual(pg.errors, [], 'no page errors');
  console.log('the knight rework: ' + WANT.join(', ') + ' hold.');
} finally { pg.close(); }
