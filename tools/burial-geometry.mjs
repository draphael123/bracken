// tools/burial-geometry.mjs — THE CAVERNS STOP BEING A CORRIDOR (2026-09-21). Proves, by the map and by the page:
//   the lower crypt is the only way past the fallen ossuary wall, and the arch is the only way over the Bone Stairs wall;
//   the crypt is reachable and the green water poisons (the Falling Gallery's pits went in batch 4b);
//   a gas vent poisons only while it puffs, never while idle or hissing.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { gasVentState } from '../src/burial-expansion.js';
import { openPage } from './cdp.mjs';

const build = () => LEVELS.find(l => l.id === 'burial').build();
const reach = L => { const s = floodReach(L, T).seen; return (x, y) => s.has(x + ',' + y); };
const reachesArena = L => { const s = floodReach(L, T).seen; const t = Math.floor(L.arena.trigger / 16); return [...s].some(k => +k.split(',')[0] >= t); };

const L = build(), at = (x, y) => L.grid[y * L.W + x];
assert.ok(reachesArena(L), 'the arena is reachable');
const R = reach(L);
// A. the crypt: reachable, and the only way past the wall
assert.ok([...Array(5)].some((_, i) => R(540, 34 + i)), 'the lower crypt is reachable');
for (let y = 16; y <= 31; y++) assert.equal(at(553, y), T.SOLID, 'the ossuary wall is whole at row ' + y);
{ const S = build(); /* the hole is 504-506 and the rope at 507 runs through the floor too */ for (let x = 504; x <= 507; x++) for (const y of [32, 33]) S.grid[y * S.W + x] = T.SOLID;
  assert.ok(!reachesArena(S), 'sealing the crypt hole must cut the road: the crypt is the only way on'); }
// C. the climb: the gallery over the Bone Stairs wall is walkable end to end, and the only way past the wall is over
//    its top (two ropes lead up - the arch's and the old one at 894 - but nothing goes under or through)
for (let x = 876; x <= 905; x++) assert.ok(R(x, 23), 'the gallery can be walked at ' + x);
{ const S = build(); for (let y = 16; y <= 24; y++) for (let x = 896; x <= 898; x++) S.grid[y * S.W + x] = T.SOLID;
  assert.ok(!reachesArena(S), 'with its top sealed the Bone Stairs wall must hold: the way on is over it'); }
// B. (the Falling Gallery's three poison pits were here: its road is walled up and its floor is the way DOWN now - batch 4b,
//    tools/burial-rework.mjs proves the descent)
// D. the vent cycle, as a function
{ const v = { phase: 0, period: 3.4 }, seen = new Set();
  for (let t = 0; t < 3.4; t += .01) seen.add(gasVentState(v, t));
  assert.deepEqual([...seen].sort(), ['idle', 'puff', 'warn']);
  assert.ok(L.gasVents.length === 11 && L.gasVents.every(v => at(v.x, v.y) === T.SOLID && at(v.x, v.y - 1) !== T.SOLID), 'eleven vents, each a grate in open floor'); }

// the page: a vent hurts only in its puff, a pit poisons whoever falls in
const pg = await openPage({ audio: false, fonts: false }); try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;
   BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;for(const e of BK.enemies())e.alive=false;
   const p=BK.P,v=BK.L.gasVents.find(v=>v.x===728);BK.tp(728,31);BK.sim(4);const hits={idle:0,warn:0,puff:0};
   for(let f=0;f<420;f++){p.hp=p.maxHp||100;p.venomT=0;const h0=p.hp;BK.sim(1);if(p.hp<h0||p.venomT>0)hits[v.state]++;}
   BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;for(const e of BK.enemies())e.alive=false;
   BK.tp(412,35);let poisoned=false;   /* the Grave Causeway's green water */for(let f=0;f<60;f++){BK.sim(1);if(BK.P.venomT>0)poisoned=true;}
   return{hits,poisoned};})()`);
  assert.equal(r.hits.idle, 0, 'an idle vent never hurts'); assert.equal(r.hits.warn, 0, 'a hissing vent never hurts');
  assert.ok(r.hits.puff > 0, 'a puffing vent does'); assert.ok(r.poisoned, 'the green water poisons');
  assert.deepEqual(pg.errors, []);
  console.log('burial geometry: crypt and arch are the only ways on, pits poison, vents hurt only when puffing ' + JSON.stringify(r));
} finally { pg.close(); }
