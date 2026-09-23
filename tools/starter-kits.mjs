// tools/starter-kits.mjs — THE STARTER KITS DO WHAT THEIR CARDS SAY (the Knight's and the Warden's bought abilities).
// Each case is played through the real input on a flat floor, and asks the one thing the ability PROMISES, not a number:
//   rise    the bought RISING CUT carries the first foe up with him, holds it in the air, and is drawn as an upward cut
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__kit=(hero,ids,foes)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.PROG.xp[hero]=xpFloor(20);
      BKT.PROG.skillOwned[hero]=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts[hero]=ids.slice(0,4);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;
      return foes.map(([t,dx])=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;return e;});};return 1})()`);
  const ALL = ['rise'], WANT = process.argv[2] ? process.argv[2].split(',') : ALL;
  const out = {};
  if (WANT.includes('rise')) out.rise = await pg.evalp(`(()=>{const [e]=__kit('knight',['risingCut'],[['sprig',6]]);const y0=e.y;BK.press('throw');let keys=new Set(),top=0,held=0;
    for(let i=0;i<80;i++){BK.step(1);keys.add(BK.P.lastKey);top=Math.max(top,y0-e.y);if(y0-e.y>30&&BK.P.riseT<=0)held++;}
    return {top:Math.round(top),held,keys:[...keys]}})()`);
  if (out.rise) { const r = out.rise;
    assert(r.top >= 40, 'the bought rising cut must carry the foe up with him (it rose ' + r.top + 'px)');
    assert(r.held >= 40, 'and HOLD it up there after the climb for an air combo (held ' + r.held + ' frames)');
    assert(r.keys.includes('rise'), 'and he must be drawn in the upward cut, not the forward swing (drew ' + r.keys.join(',') + ')'); }
  assert.deepEqual(pg.errors, []);
  console.log('starter kits: ' + JSON.stringify(out));
} finally { pg.close(); }
