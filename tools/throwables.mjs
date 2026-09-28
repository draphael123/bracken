// tools/throwables.mjs — CARRY & THROW (Daniel, 2026-09-28): src/throwables.js's own promises, proved once, generically,
// so a barrel or a pot built on this table later inherits the same guarantees without re-proving them by hand.
//   1. THE TABLE ITSELF is sane: every kind arcs (positive speed, positive gravity), respawns, and hits a fire foe harder
//      than a plain one; FIRE_FOES names the burning goblin and the ember wisp, and not the Pyromancer (his own duel decides
//      what a thrown bucket costs him - decision 3, PYRO_HIT_FIELD is the hook, not a damage number here).
//   2. EVERY FIRE HAS A RACK IN RANGE (Daniel, follow-up to the first pass, 2026-09-28): every told beam and log, every
//      heap and the barn roof's barrier fire keeps a bucket rack within ~6 tiles of it, on the same floor - never a long
//      carry away, wherever the route puts you when you first meet it. What doesn't (the trench's fallback fire patches,
//      the village's own flame pillars) says why, in the same pass, not by omission.
//   3. IN THE PAGE: walk onto a bucket and INTERACT takes it; ATTACK throws it in an arc that douses a fire kind not proved
//      by tools/burning-village.mjs's own bucket section (the barn roof's barrier fire); a hero who dies mid-carry drops it,
//      and it is back at its rack about THROW_KIND.bucket.respawn seconds after it lands, same as every other beat.
import assert from 'node:assert/strict';
import { THROW_KIND, FIRE_FOES, isFireFoe, throwDamage, PYRO_HIT_FIELD } from '../src/throwables.js';
import { LEVELS, T } from '../src/level.js';
import { openPage } from './cdp.mjs';

// ---- 1. THE TABLE ----
assert.ok(THROW_KIND.bucket, 'the bucket is a row in THROW_KIND');
for (const [name, k] of Object.entries(THROW_KIND)) {
  assert.ok(k.vx > 0 && k.g > 0, name + ' arcs: a forward speed and a real gravity');
  assert.ok(k.respawn > 0 && k.respawn <= 8, name + ' waits a real, short while before its rack is filled again: ' + k.respawn);
  assert.ok(k.hitFire > k.hitSmall && k.hitSmall > 0, name + ' does more to a fire foe than a plain one, and a plain one is still hurt: ' + JSON.stringify(k));
}
assert.ok(FIRE_FOES.has('burngob') && FIRE_FOES.has('emberwisp'), 'FIRE_FOES names the burning goblin and the ember wisp');
assert.ok(!FIRE_FOES.has('pyromancer'), 'not the Pyromancer - his own duel decides what a thrown bucket costs him (decision 3)');
assert.equal(isFireFoe('burngob'), true); assert.equal(isFireFoe('sprig'), false);
assert.equal(throwDamage('bucket', 'burngob'), THROW_KIND.bucket.hitFire, 'a fire foe takes the fire number');
assert.equal(throwDamage('bucket', 'sprig'), THROW_KIND.bucket.hitSmall, 'anything else takes the small number');
assert.equal(typeof PYRO_HIT_FIELD, 'string', 'the Pyromancer hook is a named field, for the boss lane to read - not a behaviour built here');
console.log('the table: ' + Object.keys(THROW_KIND).join(', '));

// ---- 2. EVERY FIRE HAS A RACK IN RANGE ----
const TS = 16, lv = LEVELS.find(l => l.id === 'burning'), L = lv.build();
const wells = L.ents.filter(e => e.t === 'villagewell' && e.bucket).map(w => ({ x: w.x, y: w.y }));
assert.ok(wells.length >= 5, 'the village keeps a bucket at every rack the design calls for: ' + wells.length);
const RACK_CLOSE = 6;   /* tiles, on the same floor - "an easy throw", not "a carry" (decision 2's own words: "near every fire area") */
const nearestWell = (x, y) => Math.min(...wells.map(w => Math.abs(w.y - y) > 3 ? 999 : Math.abs(w.x - x)));   /* same floor: a rack three rows off is not "in range" even if its x lines up */
const near = (x, y, d) => nearestWell(x, y) <= d;
/* EVERY TOLD BEAM OR LOG - the only fires you can stand ON, and so the only ones a douse changes the shape of the route
   for (a doused beam holds; a log is never the only way, but the same rule applies to it) - except the very first one
   (45-48, THE ROAD IN's ember pit, a plain log break with no onTop/fuse): it sits BEFORE the croft well where the
   bucket is first taught (90), by design (docs/briefs/burning-village-rework.md §4, "TAUGHT SAFELY") - a player has
   met no bucket yet when they meet it, it is a standard four-tile pit a jump clears the same as any other (unlike the
   told, onTop beams), and giving it a rack would mean teaching the bucket before its own dedicated lesson does. */
for (const z of (L.deckBreaks || [])) if ((z.beam || z.log) && z.x0 !== 45) { const d = Math.min(nearestWell(z.x0, z.row), nearestWell(z.x1, z.row));
  assert.ok(d <= RACK_CLOSE, 'a ' + (z.beam ? 'beam' : 'log') + ' at ' + z.x0 + '-' + z.x1 + ' has a rack within ' + RACK_CLOSE + ' tiles: nearest is ' + d); }
assert.ok((L.deckBreaks || []).some(z => z.x0 === 45 && z.log && !z.onTop), 'the road-in pit (45-48) is still the plain, pre-bucket log this exemption describes - if it changed, re-check whether the exemption still applies');
/* EVERY HEAP - burning timber blocking the way (THE FALLEN HOUSE) or hiding a stash under it (THE ROOT CELLAR) */
for (const h of (L.heaps || [])) { const d = Math.min(nearestWell(h.x0, h.y0), nearestWell(h.x1, h.y0));
  assert.ok(d <= RACK_CLOSE, h.name + ' at ' + h.x0 + ' has a rack within ' + RACK_CLOSE + ' tiles: nearest is ' + d); }
/* THE BARN ROOF'S BARRIER FIRE (Daniel's explicit ask: it had none before this pass) */
for (const [x, y] of (L.roofFire || [])) { const d = nearestWell(x, y);
  assert.ok(d <= RACK_CLOSE, 'the barn roof\'s fire at ' + x + ' has a rack within ' + RACK_CLOSE + ' tiles: nearest is ' + d); }
console.log('every told beam, log, heap and the barn roof\'s fire has a rack within ' + RACK_CLOSE + ' tiles (' + wells.length + ' racks)');
/* WHAT IS EXEMPT, AND WHY - not left unproved, said here so the exemption is the thing under test, not an omission */
const cellarFireTiles = [256, 266, 280, 292, 304];   /* src/burning-village.js's own list: the rooftops' trench floor, five rows below the route */
assert.ok(cellarFireTiles.every(x => (L.trench || []).some(([a, b]) => x >= a && x <= b)), 'the cellar fire patches are inside the trench, off the roofs route');
console.log('exempt, and why: the trench\'s cellar-floor fire patches - a fallback a hero who falls in gets out of by ladder or smoke (C5), never a beat meant to be doused; ' +
  'the village\'s own flame pillars (stillFires) - not the Pyromancer\'s fire, never doused by design (bucketTargets never matches a pillar, and src/burning-village.js says so directly)');
/* BURNING GOBLINS - audited, not gated: a thrown bucket douses one it hits (a bonus, FIRE_FOES), but nothing requires carrying
   water to one, since every burning goblin is an ordinary foe a sword kills regardless of the straw under it */
const gobs = L.ents.filter(e => e.t === 'burngob'), gobDists = gobs.map(g => ({ x: g.x, d: nearestWell(g.x, g.y) }));
console.log('burning goblins, tiles to the nearest rack (a bonus if in reach, never a gate): ' + gobDists.map(g => g.x + '@' + g.d).join(' '));

// ---- 3. IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const I=LEVELS.findIndex(l=>l.id==='burning');
  const boot=hero=>{BK.setHero(hero||'paladin');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(5);};
  const clear=()=>{for(const e of BK.enemies())if(!e.boss)e.alive=false;};
  const V=BK.village(),B=()=>V.buckets();
  /* WALK ONTO IT AND PRESS INTERACT (a different hero than tools/burning-village.mjs used, to prove it is not knight-only) */
  boot('paladin');clear();const b1=B().sort((a,b)=>a.hx-b.hx)[0];BK.tp(Math.floor(b1.hx/16),Math.round(b1.hy/16)-1);BK.P.face=1;BK.sim(5);BK.press('talk');BK.sim(4);
  out.pickup={onWalkOn:BK.P.carry===b1};
  /* ATTACK THROWS IT IN AN ARC: it leaves the hand, rises then falls - a straight line would never rise */
  BK.tp(60,25);BK.P.face=1;BK.sim(5);const y0=BK.P.carry?null:null;BK.press('atk');let minY=1e9,sawRise=false,sawFall=false;const pr=b1;const startY=pr.y;
  for(let i=0;i<40;i++){BK.sim(1);if(pr.y<startY-1)sawRise=true;if(sawRise&&pr.y>minY+0.4)sawFall=true;minY=Math.min(minY,pr.y);}
  out.arc={sawRise,sawFall,leftHand:BK.P.carry!==b1};
  /* DOUSES A FIRE KIND tools/burning-village.mjs's own bucket section never throws at: THE BARN's roof, a barrier fire */
  clear();const rf=BK.fires().find(f=>f.barrier&&!f.heap);
  BK.tp(384,9);BK.P.face=1;BK.sim(5);V.take(B().sort((a,b)=>a.hx-b.hx)[0]);BK.sim(5);BK.press('atk');BK.sim(50);
  out.barn={before:!!rf,after:BK.fires().filter(f=>f.barrier&&!f.heap).every(f=>f.delay>0)};
  /* A HERO WHO DIES MID-CARRY DROPS IT (the generic rule: a hit or a death) */
  boot('paladin');clear();BK.god=false;const b2=B().sort((a,b)=>a.hx-b.hx)[0];V.take(b2);BK.sim(5);const had=BK.P.carry===b2;
  BK.P.hp=1;BK.P.inv=0;BK.damagePlayer(BK.P.x,9999,{unblockable:true});BK.sim(90);
  out.death={had,dropped:BK.P.carry!==b2,state:b2.state};
  /* RESPAWN, ~3s - a second, independent proof beside tools/burning-village.mjs's own (a plain throw at open ground, not a target) */
  boot('paladin');clear();const b3=B().sort((a,b)=>a.hx-b.hx)[0];BK.tp(200,25);BK.P.face=1;V.take(b3);BK.sim(5);BK.press('atk');
  let f0=0;for(f0=0;f0<120&&b3.state!=='return';f0++)BK.sim(1);const landed=b3.state==='return';
  BK.sim(Math.round(2.9*60));const before3=b3.state==='return';BK.sim(Math.round(0.4*60));const after3=b3.state==='rest';
  out.respawn={landed,before3,after3};
  return out;})()`, 300000);
  console.log(JSON.stringify(r));
  assert.ok(r.pickup.onWalkOn, 'walk onto it and INTERACT takes it: ' + JSON.stringify(r.pickup));
  assert.ok(r.arc.sawRise && r.arc.sawFall && r.arc.leftHand, 'ATTACK throws it in an arc - up, then down, out of the hand: ' + JSON.stringify(r.arc));
  assert.ok(r.barn.before && r.barn.after, "a thrown bucket douses the barn roof's barrier fire, the one kind burning-village.mjs does not throw at: " + JSON.stringify(r.barn));
  assert.ok(r.death.had && r.death.dropped && r.death.state === 'return', 'a death mid-carry drops it, same as a blow: ' + JSON.stringify(r.death));
  assert.ok(r.respawn.landed && r.respawn.before3 && r.respawn.after3, 'a thrown bucket is back at its rack about ' + THROW_KIND.bucket.respawn + 's after it lands, never sooner: ' + JSON.stringify(r.respawn));
  assert.deepEqual(pg.errors, []);
  console.log('CARRY & THROW keeps its promises.');
} finally { pg.close(); }
