// tools/geomancer.mjs — THE GEOMANCER'S STONE NEVER TRAPS AND NEVER STAYS (docs/briefs/geomancer.md, A12 and C1). Played through
// her real input in the real page:
//   cap       five pieces raised as fast as she can: never more than three stand (four with THE FOURTH STONE)
//   crumble   every piece is gone after its life, and the level's grid is byte-for-byte what it was before she touched it
//   lift      a pillar that comes up under a small foe LIFTS it onto its top (nothing is ever inside the rock), and one that comes up
//             under a boss stops short under it
//   body      a foe that turns up inside standing stone (spawned, thrown) crumbles that stone the next frame
//   reload    a level left while stone stands takes the stone with it: the new level's grid is untouched
//   levels    in three real early levels, at every 5th tile of floor she can stand on: wall, pillar and step raised, and every frame
//             no living body is inside her rock and, seven seconds on, the level's grid is exactly what it was (no route blocked)
// PROVED RED FIRST (2026-09-24): with the body test taken out of freeCell and RULE 4 disabled in src/geomancer.js, `lift` and `body`
// fail (a sprig buried in the pillar; the stone that a foe was spawned into stood on) - the guards are what makes this green.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__geo=(ids,flat=true,lv=0)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BKT.PROG.xp.geomancer=xpFloor(20);
      BKT.PROG.skillOwned.geomancer=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.geomancer=ids.slice(0,2);BK.applyUpgrades();BK.load(lv);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;
      if(flat){for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);}
      BK.sim(30);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;};
    window.__inside=()=>{const G=BK.geo(),P=BK.P,bs=[P,...BK.enemies().filter(e=>e.alive&&!(e.gone>0))].map(b=>({l:b.x-b.w/2,r:b.x+b.w/2,t:b.y-b.h,b:b.y}));
      for(const p of G.pieces())if(p.tile===1)for(const c of p.cells){const cb={l:c.tx*16,r:c.tx*16+16,t:c.ty*16,b:c.ty*16+16};if(bs.some(b=>b.l<cb.r&&b.r>cb.l&&b.t<cb.b&&b.b>cb.t))return true;}return false;};
    window.__raise=()=>{const P=BK.P;P.st=P.maxSt;BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.sim(2);P.face=-P.face;};
    return 1})()`);
  const out = {};
  out.cap = await pg.evalp(`(()=>{const run=n=>{let most=0;for(let k=0;k<n;k++){BK.tp(5+k*5,21);BK.sim(3);BK.P.face=1;__raise();BK.sim(4);most=Math.max(most,BK.geo().pieces().length);}return most;};
    __geo([]);const three=run(5);__geo(['geoFourth']);return {three,four:run(6)}})()`);
  out.crumble = await pg.evalp(`(()=>{__geo([]);const g0=Array.from(BK.L.grid);__raise();BK.keys.atk=true;BK.sim(30);BK.keys.atk=false;BK.sim(5);const n=BK.geo().pieces().length;
    let cracked=false;for(let i=0;i<60*5;i++){BK.sim(1);}const g1=Array.from(BK.L.grid);return {raised:n,left:BK.geo().pieces().length,same:g0.every((v,i)=>v===g1[i])}})()`);
  out.lift = await pg.evalp(`(()=>{__geo([]);BK.spawnEnt({t:'sprig',x:(BK.P.x+66)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;BK.sim(2);const y0=e.y;
    BK.keys.atk=true;BK.sim(40);BK.keys.atk=false;let inside=false,top=0;for(let i=0;i<40;i++){BK.sim(1);inside=inside||__inside();top=Math.max(top,y0-e.y);}
    __geo([]);BK.spawnEnt({t:'sprig',x:(BK.P.x+66)/16,y:21});const b=BK.enemies().at(-1);b.hp=b.hp0=5000;b.cd=99;b.mini=true;BK.sim(2);BK.keys.atk=true;BK.sim(40);BK.keys.atk=false;let bin=false;for(let i=0;i<20;i++){BK.sim(1);bin=bin||__inside();}
    return {rose:Math.round(top),inside,bossInside:bin,pieces:BK.geo().pieces().length}})()`);
  out.body = await pg.evalp(`(()=>{__geo([]);BK.keys.atk=true;BK.sim(40);BK.keys.atk=false;BK.sim(3);const p=BK.geo().pieces()[0];if(!p)return {none:true};const c=p.cells[0];
    BK.spawnEnt({t:'sprig',x:(c.tx*16+8)/16,y:c.ty+1});const e=BK.enemies().at(-1);e.x=c.tx*16+8;e.y=c.ty*16+12;BK.sim(1);return {stood:BK.geo().pieces().includes(p),inside:__inside()}})()`);
  out.reload = await pg.evalp(`(()=>{__geo([]);__raise();BK.keys.atk=true;BK.sim(40);BK.keys.atk=false;BK.sim(2);const had=BK.geo().pieces().length;BK.load(0);const L=BK.L;const g0=Array.from(L.grid);BK.sim(5);
    return {had,after:BK.geo().pieces().length,same:g0.every((v,i)=>v===L.grid[i])}})()`);
  /* THE REAL LEVELS: the first three of the campaign */
  out.levels = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const ids=LEVELS.map((l,i)=>[l.id,i]).filter(([id])=>!/^trial|^practice|^draft/.test(id)).slice(0,3);const rows=[];
    for(const [id,i] of ids){__geo(['stoneStep'],false,i);const L=BK.L,W=L.W,H=L.H;const g0=Array.from(L.grid);let tried=0,inside=0,raised=0;
      for(let x=3;x<W-3&&tried<24;x+=5){let fy=-1;for(let y=2;y<H-1;y++){const t=L.grid[y*W+x];if(t===0&&L.grid[(y+1)*W+x]===1&&L.grid[(y-1)*W+x]===0){fy=y;break;}}if(fy<0)continue;
        tried++;BK.tp(x,fy);BK.P.vx=0;BK.P.vy=0;BK.sim(3);if(!BK.P.ground)continue;BK.P.st=BK.P.maxSt;BK.P.face=tried%2?1:-1;__raise();BK.keys.atk=true;BK.sim(36);BK.keys.atk=false;BK.sim(2);BK.P.cds={};BK.press('throw');BK.sim(2);
        raised+=BK.geo().pieces().length;for(let f=0;f<60*7;f++){BK.sim(1);if(f%6===0&&__inside())inside++;}}
      rows.push({id,tried,raised,inside,same:g0.every((v,k)=>v===L.grid[k]),left:BK.geo().pieces().length});}
    return rows})()`);
  console.log(JSON.stringify(out));
  assert.equal(out.cap.three, 3, 'THE CAP: never more than three pieces stand at once (' + out.cap.three + ')');
  assert.equal(out.cap.four, 4, 'THE FOURTH STONE: four (' + out.cap.four + ')');
  assert(out.crumble.raised >= 2 && out.crumble.left === 0, 'every piece crumbles on its own (' + JSON.stringify(out.crumble) + ')');
  assert(out.crumble.same, 'and the level is exactly what it was');
  assert(out.lift.rose >= 20 && !out.lift.inside, 'a pillar under a small foe LIFTS it, never buries it (' + JSON.stringify(out.lift) + ')');
  assert(!out.lift.bossInside, 'and one under a boss stops short under it');
  assert(!out.body.none && !out.body.stood && !out.body.inside, 'stone a foe turns up inside crumbles at once (' + JSON.stringify(out.body) + ')');
  assert(out.reload.had >= 1 && out.reload.after === 0 && out.reload.same, 'a level left takes its stone with it (' + JSON.stringify(out.reload) + ')');
  for (const r of out.levels) { assert(r.tried >= 5 && r.raised > 0, r.id + ': she raised stone there (' + JSON.stringify(r) + ')'); assert.equal(r.inside, 0, r.id + ': nobody was ever inside her rock'); assert(r.same && r.left === 0, r.id + ': and seven seconds on the level is exactly as it was: no route blocked'); }
  assert.deepEqual(pg.errors, []);
  console.log('geomancer: the cap holds (3, 4 with the passive), every piece crumbles and gives the grid back, nothing is ever buried, and ' + out.levels.length + ' real levels end as they began');
} finally { pg.close(); }
