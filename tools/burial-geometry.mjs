// tools/burial-geometry.mjs — THE CAVERNS ARE NOT A CORRIDOR (2026-09-21; re-laid for claude/burial2's cut, 2026-09-26). Proves, by the map
// and by the page:
//   the ways on are the ones the level says they are: gallery one's drop is the only way down to gallery two, and the exam's low pass - a
//   vent in a passage four rows tall - is the only way on to the bridges, so the gas there has to be lit or waited out;
//   every vent is a grate in open floor, and the cycle as a function has its three states (and a fourth, lit, that nothing else gives);
//   in the page a cold vent poisons only while it puffs, never while idle or hissing, and the green water poisons.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { gasVentState } from '../src/burial-expansion.js';
import { DESCENT } from '../src/burial-caverns.js';
import { openPage } from './cdp.mjs';

const build = () => LEVELS.find(l => l.id === 'burial').build();
const reachesArena = L => { const s = floodReach(L, T, { rides: true }).seen; const t = Math.floor(L.arena.trigger / 16); return [...s].some(k => +k.split(',')[0] >= t); };
const L = build(), at = (x, y) => L.grid[y * L.W + x];
assert.ok(reachesArena(L), 'the arena is reachable');
// A. gallery one's drop is the way down
{ const S = build(); for (let x = DESCENT.drop[0]; x <= DESCENT.drop[1]; x++) S.grid[DESCENT.g[0] * S.W + x] = T.SOLID;
  assert.ok(!reachesArena(S), 'seal gallery one\'s drop and the road must be cut: it is the way down'); }
// B. the exam's low pass, with its vent: the only way on
const pass = L.gasVents.find(v => at(v.x, v.y - 5) === T.SOLID && at(v.x, v.y - 4) === T.AIR);
assert.ok(pass, 'no vent in a low pass (four rows under a roof)');
{ const S = build(); for (let y = pass.y - 4; y < pass.y; y++) S.grid[y * S.W + pass.x] = T.SOLID;
  assert.ok(!reachesArena(S), 'the low pass at ' + pass.x + ' can be walked round: the vent in it asks nothing'); }
// C. the vents
{ const v = { phase: 0, period: 3.4 }, seen = new Set();
  for (let t = 0; t < 3.4; t += .01) seen.add(gasVentState(v, t));
  assert.deepEqual([...seen].sort(), ['idle', 'puff', 'warn']);
  assert.equal(gasVentState({ ...v, litT: 5 }, 1), 'lit');
  assert.ok(L.gasVents.length >= 10 && L.gasVents.every(v => at(v.x, v.y) === T.SOLID && at(v.x, v.y - 1) !== T.SOLID), 'every vent a grate in open floor'); }

// the page: a cold vent hurts only in its puff, a pit poisons whoever falls in
const pg = await openPage({ audio: false, fonts: false }); try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;
   BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;for(const e of BK.enemies())e.alive=false;
   const p=BK.P,v=BK.L.gasVents.find(v=>v.x===${pass.x});BK.tp(v.x,v.y-1);BK.sim(4);const hits={idle:0,warn:0,puff:0,lit:0};
   for(let f=0;f<420;f++){p.hp=p.maxHp||100;p.venomT=0;p.candle=0;const h0=p.hp;BK.sim(1);if(p.hp<h0||p.venomT>0)hits[v.state]++;}
   BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;for(const e of BK.enemies())e.alive=false;
   const pit=BK.L.pools.find(q=>q.poison);BK.P.x=(pit.x0+pit.x1)/2;BK.P.y=pit.y+24;let poisoned=false;for(let f=0;f<60;f++){BK.sim(1);if(BK.P.venomT>0)poisoned=true;}
   return{hits,poisoned};})()`);
  assert.equal(r.hits.idle, 0, 'an idle vent never hurts'); assert.equal(r.hits.warn, 0, 'a hissing vent never hurts');
  assert.ok(r.hits.puff > 0, 'a puffing vent does'); assert.ok(r.poisoned, 'the green water poisons');
  assert.deepEqual(pg.errors, []);
  console.log('burial geometry: the gallery drop and the gassed low pass are the ways on, vents are grates, a cold vent hurts only when puffing, pits poison ' + JSON.stringify(r));
} finally { pg.close(); }
