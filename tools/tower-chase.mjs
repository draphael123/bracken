// tools/tower-chase.mjs - THE SPIRAL STAIR: THE UNDEAD ARCHMAGE CHASED UP TO HIS CARPET (src/spiral-chase.js; Daniel, 2026-09-29: "a section
// climbing up the tower after the mini boss (the Sexton) where you go through a PORTAL and CHASE THE ARCHMAGE UP A SPIRAL TOWER as he shoots
// bolts at you like the fight. You eventually reach a PORTAL with a MAGIC CARPET and the fight commences as usual.")
//   PORTAL   the crown's parapet holds HIS RING (a ringdoor) where the door into his hall stood, and it lets you out at the spiral's foot; the
//            reach fill follows it, and it is LOAD-BEARING - take its `to` away and neither the stair nor the carpet is reached
//   SPIRAL   six flights round a newel, turning at the walls; walkable with a REAL jump (tools/checkpoint-stand.mjs's model, 5 columns): the
//            fill from the foot stands on every step, every landing and the carpet. THE RULE BITES: with a jump of 3 columns it does not get
//            up - the gaps are jumps, not walks. Two checkpoints (Daniel: fewer): the middle landing and the top; no creature but him
//   SPELLS   his chase in Node: asleep until you are through; over the landing ahead of you, never within reach; he casts nothing while he
//            or you are off the screen; every spell from its fight's tell, and only what the flight teaches (the first: fire alone); fire and
//            ice turn on a shield, the death mark does not - and stepped out of it finds no one and he flinches open; a stone wall stops a
//            bolt; he moves on when you reach his landing; at the top he goes through the door and is gone. The marks are his fight's
//   PAGE     walk into the ring on the parapet and come out at the foot, zoomed out; climb all six flights with the game's own physics
//            (a jump at every edge, god mode); every tell begins with him on the screen; the carpet at the top starts his fight as it
//            always did (bossActive, on the carpet, in his hall); a death after the middle landing wakes you there, and him ahead of you
// usage: node tools/tower-chase.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { TOWER } from '../src/tower-ascent.js';
import { SPIRAL, FLIGHTS, TOP, CHASE, perchOf, updateMageChase } from '../src/spiral-chase.js';
import { MAGE } from '../src/undead-mage.js';
import { MARK, ANSWER } from '../src/marks.js';
import { carpetBox } from '../src/carpet.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), W = L.W, TS = 16, at = (x, y) => L.grid[y * W + x];
const S = L.spiral, inS = e => e.x >= S.x0 && e.x <= S.x1 && e.y >= S.top && e.y < S.floor;
const std = (x, y) => [T.SOLID, T.ONEWAY, T.PLANK].includes(at(x, y + 1)) && at(x, y) === T.AIR;   /* somewhere to stand: floor under, air in */
// ---- PORTAL ----
const rings = L.ents.filter(e => e.t === 'ringdoor'), way = rings.find(e => e.to), foot = rings.find(e => e.id === (way && way.to));
assert.ok(way && foot && rings.length === 2, 'his ring on the parapet and the one it lets you out of: ' + JSON.stringify(rings));
assert.ok(way.x === 36 && way.y === TOWER.SKY && at(way.x, way.y + 1) === T.SOLID, 'his ring stands on the parapet where the door into his hall stood: ' + way.x + ',' + way.y);
assert.ok(inS(foot) && std(foot.x, foot.y) && foot.y === S.floor - 1, 'it lets you out on the spiral stair\'s floor: ' + foot.x + ',' + foot.y);
assert.ok(W > TOWER.W && S.x0 > TOWER.W + 4, 'the stair tower stands east of the tower\'s own wall, solid rock between: ' + S.x0);
for (let y = S.top; y < S.floor; y++) for (let x = TOWER.X1 + 1; x < S.x0; x++) assert.equal(at(x, y), T.SOLID, 'rock between the tower and the stair at ' + x + ',' + y);
assert.ok(L.sanctum.rug && L.carpetAt.x === L.sanctum.in.x && L.carpetAt.y === L.sanctum.in.y, 'the carpet lies at the door into his hall');
assert.ok(L.carpetAt.x >= S.x0 * TS && L.carpetAt.x <= S.x1 * TS && L.carpetAt.y === TOP.row * TS, 'and both are at the top of the spiral stair, not on the parapet: ' + JSON.stringify(L.carpetAt));
const R = floodReach(L, T, { rides: true, across: 5 });
assert.ok(R.seen.has(foot.x + ',' + foot.y), 'the fill (a real jump) does not come through his ring to the stair\'s foot');
assert.ok(R.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the fill does not climb the stair to the carpet');
{ const shut = floodReach({ ...L, ents: L.ents.map(e => e === way ? { ...e, to: null } : e) }, T, { rides: true });
  assert.ok(![...shut.seen].some(k => { const [x, y] = k.split(',').map(Number); return inS({ x, y }); }), 'the stair is reached WITHOUT his ring: the portal is not the way in');
  assert.ok(!shut.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the carpet is reached without his ring'); }
// ---- SPIRAL ----
assert.ok(L.interiors.some(i => i[4] === 'spiral' && i[0] === S.x0 && i[1] === S.x1), 'the stair tower is a room of its own (the newel is painted: fallen_tower.js \'spiral\')');
assert.equal(FLIGHTS.length, 6, 'six flights'); FLIGHTS.forEach((F, k) => { if (k) assert.equal(F.dir, -FLIGHTS[k - 1].dir, F.name + ' runs the same way as the flight under it: it does not wind');
  const [lx, ll] = F.land; assert.ok(lx === S.x0 || lx + ll - 1 === S.x1, F.name + '\'s landing is not against a wall');
  if (k) assert.ok(F.land[2] < FLIGHTS[k - 1].land[2], F.name + ' does not climb'); });
assert.equal(new Set(FLIGHTS.map(F => JSON.stringify(F.steps.map(s => [s[1], s[3] || ''])))).size, 6, 'two flights are the same shape (no repeated shapes in a level)');
const up = floodReach({ ...L, START: { x: foot.x, y: foot.y } }, T, { rides: true, across: 5 });
for (const F of FLIGHTS) { for (const [x0, len, row] of [...F.steps, F.land]) assert.ok([...Array(len)].some((_, i) => up.seen.has((x0 + i) + ',' + (row - 1))), F.name + ': the step at ' + x0 + ',' + row + ' is never stood on with a real jump'); }
assert.ok(up.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'from the foot, a real jump does not reach the carpet');
{ const short = floodReach({ ...L, START: { x: foot.x, y: foot.y } }, T, { rides: true, across: 3 });
  assert.ok(!short.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'THE RULE BITES: a jump of three columns climbs the whole stair - its gaps are walks, not jumps'); }
const checks = L.ents.filter(e => e.t === 'check' && inS(e)), h0 = S.floor - 1, h1 = TOP.row;
assert.equal(checks.length, 2, 'two checkpoints on the stair (Daniel: fewer checkpoints): ' + checks.map(e => e.x + ',' + e.y));
assert.ok(checks.some(e => e.y === TOP.row) && checks.some(e => (h0 - e.y) / (h0 - h1) > 0.4 && (h0 - e.y) / (h0 - h1) < 0.7), 'one in the middle of the climb and one at the top: ' + checks.map(e => e.y));
for (const e of checks) assert.ok(std(e.x, e.y) && up.seen.has(e.x + ',' + e.y), 'a checkpoint nobody stands at: ' + e.x + ',' + e.y);
assert.ok(std(L.carpetAt.x / TS - 5, TOP.row), 'the carpet\'s retry spot (five tiles back from it) is not on the top floor');
assert.ok(L.crumbles.filter(c => c.kind === 'spiral').length >= 3, 'the tower\'s failing stone is on the stair (its last use)');
const foes = L.ents.filter(e => inS(e) && !['check', 'sign', 'coin', 'silver', 'ringdoor', 'mend', 'deco'].includes(e.t));
assert.deepEqual(foes.map(e => e.t), ['magechase'], 'the stair is his chase and nothing else\'s: ' + foes.map(e => e.t));
// ---- SPELLS: the chase in Node ----
assert.ok(MARK['magechase|fireTell'] === '!' && MARK['magechase|iceTell'] === '!' && MARK['magechase|markTell'] === '!!', 'his marks are not his fight\'s');
assert.ok(ANSWER['magechase|fireTell'] === 'block' && ANSWER['magechase|markTell'] === 'dodge', 'the answers: guard the fire, step out of the mark');
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(/\(e\.t === 'magechase' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)\)/.test(src.split('\n').find(l => l.startsWith('const windingUp =')) || ''), 'his tells are not windups: no mark is drawn over him');
  assert.ok(/function hurtEnemy0\([^)]*\) \{[\s\S]{0,600}if\(e\.t==='magechase'\)return;/.test(src), 'a blow that reaches him does something: he is chased, not fought'); }
const rig = (o = {}) => { const P = { x: foot.x * TS + 8, y: (foot.y + 1) * TS, ground: true, dead: 0 }, hits = [], said = [];
  const e = { t: 'magechase', alive: true, mode: 'sleep', modeT: 0, x: 0, y: 0, face: -1, anim: 0 };
  const c = { P, hit: (x, y, d, hard, blow) => hits.push({ d, hard, blow }), say: m => said.push(m), sound: () => {}, onScreen: () => o.seen !== false,
    solid: (x, y) => at(Math.floor(x / TS), Math.floor(y / TS)) === T.SOLID, inSpiral: p => p.x >= S.x0 * TS && p.x < (S.x1 + 1) * TS && p.y >= S.top * TS && p.y <= S.floor * TS };
  const run = (s, each) => { for (let i = 0; i < s * 60; i++) { updateMageChase(e, 1 / 60, c); if (each) each(); } };
  return { P, e, c, hits, said, run }; };
const stand = (P, x, row) => { P.x = x * TS + 8; P.y = row * TS; P.ground = true; };
{ const r = rig(); r.P.x = 20 * TS; r.P.y = 60 * TS; r.run(3); assert.equal(r.e.mode, 'sleep', 'he wakes before you are through his ring');
  stand(r.P, foot.x, foot.y + 1); r.run(0.1); const p = perchOf(0); assert.ok(r.e.mode === 'wake' && r.e.x === p.x && r.e.y === p.y, 'through the ring, he is not over the first landing: ' + [r.e.mode, r.e.x, r.e.y]); }
{ const r = rig({ seen: false }), tells = new Set(); stand(r.P, 96, 118); r.run(20, () => { if (/Tell$/.test(r.e.mode)) tells.add(r.e.mode); });
  assert.equal(tells.size + r.e.shots.length + r.hits.length, 0, 'he casts from off the screen: ' + [...tells]); }
{ const r = rig(), tells = new Set(), starts = []; let last = ''; stand(r.P, 96, 118);
  r.run(20, () => { if (/Tell$/.test(r.e.mode)) { tells.add(r.e.mode); if (r.e.mode !== last) starts.push(r.e.modeT); } last = r.e.mode; });
  assert.deepEqual([...tells], ['fireTell'], 'the first flight is FIRE alone, and it is cast: ' + [...tells]);
  assert.ok(starts.every(t => t >= MAGE.tell.fire - 0.02), 'the fire is told for less than his fight tells it: ' + starts);
  assert.ok(r.hits.length >= 3 && r.hits.every(h => !h.hard && h.blow === 'fire' && h.d === MAGE.dmg.fire), 'the fire lands as his fight\'s own blockable bolt: ' + JSON.stringify(r.hits.slice(0, 3)));
  const p = perchOf(0), [, , lr] = FLIGHTS[0].land; assert.ok(p.y <= (lr - CHASE.up) * TS && (lr * TS - p.y) / TS >= 4, 'he waits within reach of his landing');
  stand(r.P, FLIGHTS[0].land[0] + 1, lr); r.run(0.05); assert.equal(r.e.mode, 'fly', 'you reach his landing and he does not move on');
  r.run(3); const q = perchOf(1); assert.ok(Math.hypot(r.e.x - q.x, r.e.y - q.y) < 6, 'he does not wait over the next landing'); }
{ const r = rig(); stand(r.P, FLIGHTS[0].land[0] + 1, FLIGHTS[0].land[2]); r.run(0.1); r.e.reached = 0; stand(r.P, 92, 111); const kinds = new Set(); r.run(12, () => { for (const s of r.e.shots) kinds.add(s.kind); });
  assert.ok(kinds.has('ice') && kinds.has('fire'), 'the broken stair is fire and frost: ' + [...kinds]); assert.ok(r.hits.every(h => !h.hard), 'the frost is not blockable'); }
{ const q = rig(); stand(q.P, FLIGHTS[1].land[0] + 1, FLIGHTS[1].land[2]); q.run(0.1); stand(q.P, 94, 101); let laid = false;
  for (let i = 0; i < 600 && !q.e.deathMark; i++) updateMageChase(q.e, 1 / 60, q.c); laid = !!q.e.deathMark; assert.ok(laid, 'the failing stair has no death mark');
  q.run(CHASE.markFuse + 0.1); assert.ok(q.hits.some(h => h.blow === 'mark' && h.hard && h.d === MAGE.dmg.mark), 'left in it, the mark does not land unblockable');
  const s = rig(); stand(s.P, FLIGHTS[1].land[0] + 1, FLIGHTS[1].land[2]); s.run(0.1); stand(s.P, 94, 101);
  for (let i = 0; i < 600 && !s.e.deathMark; i++) updateMageChase(s.e, 1 / 60, s.c); stand(s.P, 99, 99); s.run(CHASE.markFuse + 0.1);
  assert.ok(!s.hits.some(h => h.blow === 'mark'), 'stepped out of, the mark still lands'); assert.equal(s.e.mode, 'gather', 'the mark that finds no one does not open him (the fight\'s opening, shown)'); }
{ const r = rig(); stand(r.P, 96, 118); r.run(0.1); r.e.shots.push({ x: (S.x1 + 0.5) * TS, y: 115 * TS, vx: 150, vy: 0, r: 5, dmg: 14, kind: 'fire', t: 4 }); r.run(0.2); assert.ok(!r.e.shots.some(q => q.x > (S.x1 + 1) * TS), 'a bolt flies on through the stone wall'); }
{ const r = rig(); stand(r.P, TOP.check, TOP.row + 1); r.run(0.1); assert.ok(!r.e.alive, 'a retry at the top finds him still on the stair: he is through his door');
  const q = rig(); stand(q.P, FLIGHTS[4].land[0] + 1, FLIGHTS[4].land[2]); q.run(0.1); stand(q.P, TOP.check + 2, TOP.row + 1); q.run(4); assert.ok(!q.e.alive, 'you reach the top and he does not go through his door'); }

// ---- PAGE ----
const CI = FLIGHTS.findIndex(F => F.check), CK = FLIGHTS[CI], CKX = checks.find(e => e.y === CK.land[2] - 1).x;
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const SC=await import('/src/spiral-chase.js');BK.manualSimulation=true;const out={casts:[],offCast:0};
   const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);};
   boot();BK.tp(33,${TOWER.SKY});BK.sim(5);for(let i=0;i<90;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;BK.sim(20);BK.step(1);
   out.foot=[Math.floor(BK.P.x/16),Math.round(BK.P.y/16)-1];out.view=BK.view.VW;
   const m=BK.enemies().find(e=>e.t==='magechase');out.woke=m&&m.mode!=='sleep';
   const F=SC.FLIGHTS,G=BK.L.grid,W=BK.L.W;let jh=0,last='',t=0;
   for(;t<60*150&&!BK.carpet();t++){
     const k=Math.max(-1,m.alive?(m.reached??-1):5),dir=F[Math.min(F.length-1,k+1)].dir;BK.keys.right=dir>0;BK.keys.left=dir<0;
     const fx=Math.floor((BK.P.x+dir*7)/16),fy=Math.floor(BK.P.y/16);let up=false;for(let c=0;c<=1;c++)for(let q=1;q<=3;q++)if(G[(fy-q)*W+fx+dir*c]===2)up=true;
     if(BK.P.ground&&(!G[fy*W+fx]||up)&&!(jh>0)){BK.press('jump');jh=16;}BK.keys.jump=jh>0;jh--;
     BK.sim(1);if(t%3===0)BK.step(1);
     if(m.alive&&/Tell$/.test(m.mode)&&m.mode!==last){const v=BK.view,on=m.x>v.x&&m.x<v.x+v.VW&&m.y-46>v.y&&m.y<v.y+v.VH;out.casts.push(m.mode+(BK.telling(m)?BK.markOf(m):'?'));if(!on)out.offCast++;}
     last=m.alive?m.mode:'gone';}
   BK.keys.right=BK.keys.left=BK.keys.jump=false;out.secs=Math.round(t/60);
   BK.sim(30);const A=BK.L.arena;out.fight=!!BK.bossActive;out.carpet=!!BK.carpet();out.inHall=BK.P.x>A.x0&&BK.P.x<A.x1&&BK.P.y>A.y0&&BK.P.y<A.floor;out.chaseGone=!m.alive;
   boot();BK.tp(${CKX},${CK.land[2] - 1});BK.sim(30);BK.tp(${FLIGHTS[CI + 1].steps[0][0] + 1},${FLIGHTS[CI + 1].steps[0][2] - 1});BK.sim(2);BK.god=false;BK.P.hp=0;BK.P.dead=0.01;BK.sim(400);BK.god=true;BK.sim(60);
   const m2=BK.enemies().find(e=>e.t==='magechase');out.respawn=[Math.floor(BK.P.x/16),Math.round(BK.P.y/16)-1];out.m2=m2&&[m2.mode,Math.round(m2.x/16),Math.round(m2.y/16)];
   return out;})()`, 600000);
} finally { pg.close(); }
assert.ok(Math.abs(r.foot[0] - foot.x) <= 2 && r.foot[1] === foot.y, 'walking into his ring on the parapet does not put you at the spiral\'s foot: ' + JSON.stringify(r));
assert.ok(r.woke, 'he does not wake when you come through'); assert.ok(r.view > 320, 'the stair is not seen zoomed out: ' + r.view);
assert.ok(r.fight && r.carpet && r.inHall && r.chaseGone, 'the climb with the game\'s own jump does not reach the carpet, or the carpet does not start his fight: ' + JSON.stringify(r));
assert.ok(r.casts.length >= 4 && r.casts.some(c => c.startsWith('fireTell')) && r.casts.some(c => c.startsWith('markTell')), 'he hardly casts on the way up: ' + r.casts);
assert.ok(r.casts.every(c => (c.startsWith('markTell') ? c.endsWith('!!') : c.endsWith('!') && !c.endsWith('!!'))), 'a spell told with the wrong mark (or none): ' + r.casts);
assert.equal(r.offCast, 0, 'a spell begun with him off the screen');
const mid = CK.land, p4 = perchOf(CI + 1);
assert.ok(r.respawn[1] === mid[2] - 1 && r.respawn[0] >= mid[0] - 1 && r.respawn[0] <= mid[0] + mid[1], 'a death after the middle landing does not wake you there: ' + JSON.stringify(r.respawn));
assert.ok(r.m2 && r.m2[0] !== 'sleep' && Math.abs(r.m2[1] * TS - p4.x) < 24 && Math.abs(r.m2[2] * TS - p4.y) < 24, 'after it he is not waiting over the next landing: ' + JSON.stringify(r.m2));
console.log(`ok  tower-chase   his ring on the parapet to a ${S.x1 - S.x0 + 1}x${S.floor - S.top}-tile spiral stair (six flights, climbed with a real jump in ${r.secs} s), ${r.casts.length} told casts on the way (${[...new Set(r.casts)].join(' ')}), none off the screen, and the carpet at the top starts his fight`);
