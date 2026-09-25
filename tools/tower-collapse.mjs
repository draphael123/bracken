/* tools/tower-collapse.mjs — FAILING STONE, THE FALLING TOWER's own rule (docs/briefs/falling-tower-rework.md §2, src/tower-collapse.js).
   "THE TOWER IS FALLING: STONE THAT CRACKS COUNTS DOWN, AND THEN IT GOES." This proves the rule is what the brief promises:
     TOLD     weight starts a count; a crack on each whole second (3, 2, 1) - the count is the tell, and nothing goes without one
     FAIR     it comes back (B4): four seconds after it fell, never into a body standing in its tiles, and whole again on a respawn
     SAFE     a fall off every section lands on footing that is not a spike or a deadly pool, and the climb back is there (C5)
     VARIED   its uses in route order, each a different question: taught safe over the library floor, the gallery floor that is
              the only way down into the orrery pit (`opens`, and the reach model is told), a stair that fails from the bottom up,
              a landing you must leave in time
     IN PLAY  the page: the lesson drops you and comes back, the gallery drops you into the pit, the stair fails behind a climber
              and stands again, the landing counts on landing, and a death puts every section back */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { CRUMBLE, crumbleInit, crumbleStep, crumbleStart, crumbleBreak, standsOn } from '../src/tower-collapse.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), W = L.W, at = (x, y) => L.grid[y * W + x];
const C = crumbleInit(L), kinds = C.map(c => c.kind);
const floorOf = y => L.towerFloors.find(f => y >= f.top && y < f.bot);
// ---- VARIED: the uses, in route order (bottom of the tower to the top) ----
const order = [...new Set(C.slice().sort((a, b) => b.row - a.row).map(c => c.kind))];
assert.deepEqual(order.slice(0, 4), ['teach', 'gallery', 'stair', 'landing'], 'the uses in route order: ' + order);
assert.equal(floorOf(C.find(c => c.kind === 'teach').row).name, 'THE LIBRARY STACKS', 'the rule is taught on the first floor');
assert.ok(C.filter(c => c.kind === 'stair').length >= 5 && new Set(C.filter(c => c.kind === 'stair').map(c => c.chain)).size === 1, 'the failing stair is one chain of five or more');
for (const c of C) for (let x = c.x0; x <= c.x1; x++) assert.notEqual(at(x, c.row), T.AIR, c.kind + ': a failing section is built as floor');
// ---- SAFE (C5): under every section that is not the way on, footing within reach that does not hurt, and the climb back ----
const deadly = (x, y) => (L.pools || []).some(p => p.deadly && x * 16 >= p.x0 && x * 16 < p.x1 && y * 16 >= p.y - 16 && y * 16 <= p.bottom);
for (const c of C) {
  const mid = (c.x0 + c.x1) >> 1; let y = c.row + c.rows; while (y < L.H && at(mid, y) === T.AIR) y++;
  assert.ok(y - c.row < 14, c.kind + ': the fall off it is ' + (y - c.row) + ' rows');
  assert.notEqual(at(mid, y), T.SPIKE, c.kind + ': it drops you on spikes'); assert.ok(!deadly(mid, y - 1), c.kind + ': it drops you in poison');
  if (c.opens) continue;
  const R = floodReach({ ...L, START: { x: mid, y: y - 1 } }, T, { rides: true });
  assert.ok(R.jumpNear(mid, c.row - 1), c.kind + ': from where it drops you (' + mid + ',' + (y - 1) + ') the climb back to it is not there');
}
// ---- the way down is the way on: take the `opens` away and the pit is not reached ----
{ const gal = C.find(c => c.opens); assert.ok(gal, 'a section is the way on');
  const pit = { x: 40, y: floorOf(gal.row).bot - 1 };
  assert.ok(floodReach(L, T, { rides: true }).jumpNear(pit.x, pit.y), 'the reach model drops through the gallery floor into the pit');
  const shut = floodReach({ ...L, crumbles: C.map(c => ({ ...c, opens: false })) }, T, { rides: true });
  assert.ok(!shut.jumpNear(pit.x, pit.y), 'the pit is reached WITHOUT the gallery floor giving way: the collapse is not the way on'); }
// ---- TOLD and FAIR, the rule alone ----
{ const S = { crumbles: [{ x0: 2, x1: 5, row: 10 }, { x0: 2, x1: 5, row: 7, chain: 'a' }, { x0: 6, x1: 9, row: 4, chain: 'a' }] }; crumbleInit(S);
  const tiles = new Map(), change = (x, y, how) => tiles.set(x + ',' + y, how), me = { x: 3 * 16 + 8, y: 160, ground: true }, gone = { x: -99, y: 0 };
  const ev = []; for (let i = 0; i < 500; i++) ev.push(...crumbleStep(S, [i < 30 ? me : gone], 1 / 60, change).map(v => v.t + (v.n || '')));
  assert.deepEqual(ev.slice(0, 4), ['start', 'tick2', 'tick1', 'fall'], 'weight, then 3 2 1 and it goes: ' + ev);
  assert.equal(tiles.get('3,10'), 'restore', 'and it comes back');
  const a = S.crumbles[0]; crumbleStart(a, 0.1); for (let i = 0; i < 20; i++) crumbleStep(S, [], 1 / 60, change); assert.equal(a.st, 'down');
  const inIt = { x: 3 * 16 + 8, y: 11 * 16, ground: true }; for (let i = 0; i < 60 * (CRUMBLE.back + 2); i++) crumbleStep(S, [inIt], 1 / 60, change);
  assert.equal(a.st, 'down', 'it grows back into a body standing in its tiles');
  for (let i = 0; i < 10; i++) crumbleStep(S, [], 1 / 60, change); assert.equal(a.st, 'whole');
  // the chain fails from the bottom up
  const [, lo, hi] = S.crumbles; crumbleStep(S, [{ x: hi.x0 * 16 + 20, y: hi.row * 16, ground: true }], 1 / 60, change);
  assert.equal(lo.st, 'count', 'weight on the top of a failing stair starts it at its FOOT'); assert.equal(hi.st, 'whole');
  for (let i = 0; i < 60 * 3.2; i++) crumbleStep(S, [], 1 / 60, change); assert.equal(lo.st, 'down'); assert.equal(hi.st, 'count', 'and the next goes after it');
  assert.ok(crumbleBreak(a) && (crumbleStep(S, [], 1 / 60, change), a.st === 'down'), 'a charge breaks it at once');
  assert.ok(standsOn({ x0: 2, x1: 5, row: 10 }, { x: 40, y: 160 }) && !standsOn({ x0: 2, x1: 5, row: 10 }, { x: 40, y: 150 })); }
console.log('failing stone: ' + C.length + ' sections, uses in route order ' + order.join(' > '));

// ---- IN PLAY ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
   BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
   const L=BK.L,W=L.W,at=(x,y)=>L.grid[y*W+x],C=L.crumbles,row=()=>Math.round(BK.P.y/16);
   const t=C.find(c=>c.kind==='teach');BK.tp(t.x0+2,t.row-1);BK.sim(20);out.teach=[t.st];BK.sim(200);out.teach.push(t.st,at(t.x0+1,t.row),row()>t.row);
   BK.tp(t.x1+4,t.row+2);BK.sim(300);out.teach.push(t.st,at(t.x0+1,t.row)!==0);
   const gl=C.find(c=>c.opens);BK.tp(gl.x0+2,gl.row-1);BK.sim(400);out.gallery=[gl.st,row(),BK.P.ground];
   const st=C.filter(c=>c.chain).sort((a,b)=>b.row-a.row);BK.tp(st[0].x0+2,st[0].row-1);BK.sim(20);out.race=[st.map(c=>c.st).join()];
   const fell=new Set();for(let i=0;i<60*(1.8+1.1*st.length)+30;i++){BK.sim(1);st.forEach((c,k)=>{if(c.st==='down')fell.add(k);});}out.race.push(fell.size===st.length,row());BK.sim(60*6);out.race.push(st.map(c=>c.st).join());
   const ld=C.find(c=>c.kind==='landing');BK.tp(ld.x0+2,ld.row-1);BK.sim(5);out.landing=[ld.st,ld.t];
   /* a death: every section whole again */
   BK.tp(t.x0+2,t.row-1);BK.sim(20);BK.tp(st[0].x0+2,st[0].row-1);BK.sim(200);out.before=C.map(c=>c.st).join();
   BK.god=false;BK.P.hp=0;BK.P.dead=0.01;BK.sim(400);out.after=C.map(c=>c.st).join();out.tiles=C.every(c=>at(c.x0,c.row)!==0);
   return out;})()`, 240000);
  assert.deepEqual(r.teach, ['count', 'down', 0, true, 'whole', true], 'the lesson: counts, goes, drops you, comes back: ' + JSON.stringify(r.teach));
  assert.equal(r.gallery[0], 'down'); assert.ok(r.gallery[1] > 220 && r.gallery[2], 'the gallery floor put you in the pit: ' + JSON.stringify(r.gallery));
  assert.ok(r.race[0].startsWith('count,whole'), 'the stair starts at its foot: ' + r.race[0]); assert.ok(r.race[1], 'and a hero who stands still is left behind: all of it goes');
  assert.ok(!r.race[3].includes('down') || r.race[3].split(',').filter(s => s === 'whole').length >= 4, 'and it stands again after: ' + r.race[3]);
  assert.equal(r.landing[0], 'count', 'the landing counts the moment you are on it');
  assert.ok(r.before.includes('down') || r.before.includes('count'), 'something was falling before the death: ' + r.before);
  assert.ok(!r.after.includes('down') && !r.after.includes('count') && r.tiles, 'a death puts every section back: ' + r.after);
  assert.deepEqual(pg.errors, []);
  console.log('in play: ' + JSON.stringify(r));
} finally { pg.close(); }
