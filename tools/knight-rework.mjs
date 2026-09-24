// tools/knight-rework.mjs — THE KNIGHT REWORK DOES WHAT ITS BRIEF SAYS (docs/briefs/knight-rework.md).
// Played through the real input on a flat floor, the blows delivered through damagePlayer as a foe's would be:
//   riposte  a PERFECT GUARD (the shield raised as the blow lands) opens a window, and the next cut inside it is HEAVY - a
//            third cut, whatever its place in the run, and it hits harder than the plain first cut. A guard raised EARLY (held
//            before the blow) and one raised LATE (after it landed) open nothing, and a cut after the window is plain again.
//            PERFECT GUARD still doubles the window; COUNTERSTROKE still strikes back by itself.
//   third    THE THIRD CUT PAYS FOR WHERE YOU FINISH: a third cut that throws a foe against a wall, onto the spikes, off an edge or
//            into another foe pays (its own word, sound and a second blow), and one into open air - or a first cut into a wall - does not
//   guard    BLOCKING IS A CHOICE: holding the shield drains wind steadily (STEADY ARM halves it), a timed guard costs nothing,
//            a heavy blow on the shield pushes him back further than a light one, and timing guards beats holding one up
//   lesson   THE BRACKEN WOOD teaches it: a 'parry' lesson stretch with a sign in it and the slow lesson swordsman on its flat
// Every case was run against the code before the rework and FAILED there (see the commit that added it).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
const WANT = process.argv[2] ? process.argv[2].split(',') : ['lesson', 'riposte', 'third', 'guard'];

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
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;BK.P.combo=0;BK.P.riposteT=0;BK.P.riposteHeavy=false;BK.P.thirdPays=0;BK.P.thirdPayLast=null;
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
      return {res,win:+win.toFixed(3),rh,counter,heavy,combo,dmg:5000-e.hp};};
    /* THE THIRD CUT, thrown at something: 'open' (flat floor and air), 'wall' (rock three tiles behind him), 'spikes' (the floor behind
       him), 'pit' (no floor behind him, to the bottom of the level), 'foe' (another behind him). nth: which cut of a run it is. */
    const T=(await import('/src/level.js')).T;
    window.__third=(kind,nth)=>{const fs=__kn([],kind==='foe'?[['sprig',18],['sprig',46]]:[['sprig',18]]),[e,f2]=fs;const L=BK.L,P=BK.P,tx=Math.floor((P.x+18)/16);
      if(kind==='wall'||kind==='wallFirst')for(let y=8;y<22;y++)L.grid[y*L.W+tx+3]=1;
      if(kind==='spikes')for(let x=tx+2;x<tx+9;x++)L.grid[22*L.W+x]=T.SPIKE;
      if(kind==='pit')for(let x=tx+2;x<tx+12;x++)for(let y=22;y<L.H;y++)L.grid[y*L.W+x]=0;
      P.mixedT=0;P.combo=(kind==='wallFirst'?1:nth||3)-1;   /* (MIXED UP, armed by the cases before, would BREAK him where he stands instead of throwing him) */ P.swingEndT=BK.time;P.lastSwingT=BK.time;e.x=P.x+18;e.vx=0;P.face=1;
      BK.press('atk');for(let i=0;i<20&&!(P.atk>=0);i++)BK.sim(1);const third=!!P.heavySwing;BK.sim(150);
      return {third,pays:P.thirdPays||0,kind:P.thirdPayLast,dmg:e.alive?5000-e.hp:'dead',alive:e.alive,other:f2?5000-f2.hp:0};};
    /* THE GUARD: hold it for 'frames' with nothing landing; or take n blows of 'dmg' one second apart, the guard held all the way
       (turtle) or raised two frames before each (timed). What it cost in wind, and how hard the last blow pushed him. */
    window.__hold=(ids,frames)=>{__kn(ids,[]);const P=BK.P;P.st=P.maxSt;BK.keys.block=true;BK.sim(frames);const up=P.block;BK.keys.block=false;return {spent:+(P.maxSt-P.st).toFixed(2),up};};
    window.__blows=(style,n,dmg)=>{__kn([],[['sprig',60]]);const P=BK.P;P.st=P.maxSt;let push=0,res=[];
      for(let i=0;i<n;i++){if(style==='turtle')BK.keys.block=true;else{BK.keys.block=false;BK.sim(56);BK.keys.block=true;BK.sim(2);}
        if(style==='turtle')BK.sim(58);P.inv=0;P.face=1;res.push(BKT.damagePlayer(P.x+14,dmg,{}));push=Math.abs(P.vx);BK.sim(2);}
      BK.keys.block=false;return {st:+P.st.toFixed(2),push,res};};
    return 1})()`);
  const out = {};
  if (WANT.includes('riposte')) out.riposte = await pg.evalp(`(()=>({
      perfect: __guard([],2,2), early: __guard([],30,2), late: __guard([],-3,2), none: __guard([],null,2), plain: __guard([],'noblow',2),
      afterWindow: __guard([],2,44), passive: __guard(['parry'],10,2), noPassive: __guard([],10,2), counter: __guard(['counterstroke'],2,2)}))()`);
  if (WANT.includes('third')) out.third = await pg.evalp(`(()=>({open:__third('open'),wall:__third('wall'),spikes:__third('spikes'),pit:__third('pit'),foe:__third('foe'),wallFirst:__third('wallFirst')}))()`);
  if (WANT.includes('guard')) out.guard = await pg.evalp(`(()=>({hold:__hold([],120),steady:__hold(['holdLine'],120),tap:__hold([],4),
      light:__blows('timed',1,8),lightTurtle:__blows('turtle',1,8),heavy:__blows('turtle',1,30),turtle:__blows('turtle',5,12),timed:__blows('timed',5,12)}))()`);
  if (out.third) { const t = out.third; console.log('third', JSON.stringify(t));
    assert(t.open.third && t.open.pays === 0, 'a third cut into OPEN AIR throws, and pays nothing');
    assert(t.wall.pays === 1 && t.wall.kind === 'wall', 'a third cut that throws him AGAINST A WALL pays (' + JSON.stringify(t.wall) + ')');
    assert(typeof t.open.dmg === 'number' && t.wall.dmg > t.open.dmg, 'and the wall is a second, bigger blow (' + t.wall.dmg + ' against ' + t.open.dmg + ')');
    assert(t.spikes.pays === 1 && t.spikes.kind === 'spikes' && !t.spikes.alive, 'onto THE SPIKES: it pays, and they kill it');
    assert(t.pit.pays === 1 && t.pit.kind === 'pit' && !t.pit.alive, 'OFF THE EDGE: it pays, and the drop kills it');
    assert(t.foe.pays === 1 && t.foe.kind === 'foe' && t.foe.other > 0, 'INTO ANOTHER FOE: it pays, and the other one takes a blow too (' + t.foe.other + ')');
    assert(!t.wallFirst.third && t.wallFirst.pays === 0, 'a FIRST cut near a wall is not a third cut, and pays nothing'); }
  if (out.guard) { const g = out.guard; console.log('guard', JSON.stringify(g));
    assert(g.hold.up && g.hold.spent >= 24, 'holding the shield up two seconds drains wind steadily (' + g.hold.spent + ' of 100)');
    assert(g.steady.spent > 0 && Math.abs(g.steady.spent - g.hold.spent / 2) < 2, 'STEADY ARM: holding costs half (' + g.steady.spent + ' against ' + g.hold.spent + ')');
    assert.equal(g.tap.spent, 0, 'a guard raised on the beat costs nothing to raise');
    assert(g.light.res[0] === 'blocked' && g.light.st >= 100, 'a TIMED guard costs no wind: the perfect guard turns the blow and the bar is full after it (' + g.light.st + ')');
    assert(g.heavy.res[0] === 'blocked' && g.heavy.push > g.lightTurtle.push, 'a HEAVY blow on the shield pushes him back further than a light one (' + g.heavy.push + ' against ' + g.lightTurtle.push + ')');
    assert(g.timed.res.every(r => r === 'blocked'), 'the timed knight turned all five blows (' + g.timed.res + '; the turtle: ' + g.turtle.res + ')');
    assert(g.timed.st > g.turtle.st + 30, 'TIMING THE GUARD BEATS TURTLING: five blows, and the timed knight has far more wind left (' + g.timed.st + ' against ' + g.turtle.st + ')'); }
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
