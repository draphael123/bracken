// tools/lance-support.mjs - THE QUEEN'S LANCE, as Daniel asked for him on 2026-09-25 (docs/briefs/lance-support.md): slower, two
// end lookouts on his bridge, and the bowmen he calls to them. Node for the room and the call's rules; the page for the rest.
//   1. THE LOOKOUTS: the arena carries two `bows` lookouts, on the first pier and the last, each a five-tile one-way deck exactly
//      three rows over the boards (every hero's held jump is 3.17 tiles - measured, 2026-09-25), with a bridgetower standing
//      on the pier under it (B2/B9: not floating) and the deck under it solid.
//   2. THE CALL (lanceSupport, driven with a fake world): nothing for the first 12 s; then TOLD - a call with the lookout in it,
//      announced, for the whole tell (1.2 s) before anyone arrives (C1); the lookout nearer the hero, never the one he stands on;
//      never a third while two are up; one every 15 s.
//   3. IN THE PAGE: his walk and his charge are the slower numbers; a bowman called in the real fight is an ARCHER (no new kind),
//      lands on the lookout, pays no XP, and is gone when the Lance dies - and the fight still ends (bossActive false).
import assert from 'node:assert/strict';
import { LEVELS, T, TS } from '../src/level.js';
import { lanceSupport, LANCE_SUPPORT } from '../src/lance-support.js';
import { openPage } from './cdp.mjs';

// ---- 1. the lookouts ----
const L = LEVELS.find(l => l.id === 'storm').build(), A = L.arena, G = (x, y) => L.grid[y * L.W + x];
assert.ok(A && A.boss === 'lance', 'Stormhold has the Lance\'s arena');
assert.equal((A.bows || []).length, 2, 'two end lookouts for his bowmen');
const deck = A.floor / TS;
for (const [x0, x1, row] of A.bows) {
  assert.equal(x1 - x0, 4, 'a lookout is five tiles, like the five in the middle');
  assert.equal(deck - row, 3, 'three rows over the boards: one held jump (3.17 tiles) and no more');
  for (let x = x0; x <= x1; x++) { assert.equal(G(x, row), T.ONEWAY, 'a one-way deck you jump up through at ' + x); assert.equal(G(x, row - 1), T.AIR, 'room to stand on it'); assert.equal(G(x, deck), T.SOLID, 'on a pier: solid under it at ' + x); }
  assert.ok(L.ents.some(e => e.t === 'deco' && e.kind === 'bridgetower' && e.x > x0 && e.x < x1 && e.y === deck - 1), 'a bridgetower holds up the lookout at ' + x0);
  assert.ok(x0 * TS >= A.x0 && (x1 + 1) * TS <= A.x1, 'inside his walls');
}
assert.ok(A.bows[0][0] * TS - A.x0 < 3 * TS && A.x1 - (A.bows[1][1] + 1) * TS < 20 * TS, 'at the ENDS of the bridge');

// ---- 2. the call ----
const lk = A.bows, W = { t: 0, bows: [], ann: [], fx: 0 }, P = { x: lk[0][0] * TS + 40 * TS, y: A.floor };
const io = { P, TS, lookouts: lk, bows: () => W.bows, announce: c => W.ann.push({ t: W.t, x: c.x }), tellFx: () => { W.fx++; },
  arrive: c => W.bows.push({ x: c.x, y: c.y, at: W.t, told: W.t - W.ann[W.ann.length - 1].t }) };
const e = {}, dt = 1 / 60, run = s => { for (let i = 0; i < s * 60; i++) { W.t += dt; lanceSupport(e, dt, io); } };
run(LANCE_SUPPORT.first - 0.1); assert.equal(W.ann.length, 0, 'nothing in his first 12 s');
run(0.2); assert.equal(W.ann.length, 1, 'the first call comes at 12 s'); assert.equal(W.bows.length, 0, 'and nobody has arrived yet: it is told first');
run(LANCE_SUPPORT.tell + 0.05); assert.equal(W.bows.length, 1, 'the bowman arrives after the tell');
assert.ok(W.bows[0].told >= LANCE_SUPPORT.tell - 0.02 && LANCE_SUPPORT.tell >= 1, 'told for ' + W.bows[0].told.toFixed(2) + ' s before he lands (C1)'); assert.ok(W.fx > 50, 'the tell is drawn every frame of it');
const mid = k => (lk[k][0] + lk[k][1] + 1) * TS / 2, near = Math.abs(mid(0) - P.x) < Math.abs(mid(1) - P.x) ? 0 : 1;
assert.equal(W.bows[0].x, mid(near), 'he comes to the lookout NEARER you (a far one is past the 420 px update cull)');
run(LANCE_SUPPORT.every + 0.2); assert.equal(W.bows.length, 2, 'a second 15 s on, to the other lookout (the first is held)'); assert.notEqual(W.bows[1].x, W.bows[0].x);
run(LANCE_SUPPORT.every * 2); assert.equal(W.bows.length, 2, 'never a third while two are up');
W.bows.length = 0; P.x = mid(near); P.y = lk[near][2] * TS;   /* the hero up on the near lookout */
run(LANCE_SUPPORT.retry + LANCE_SUPPORT.tell + 0.2); assert.equal(W.bows.length, 1); assert.equal(W.bows[0].x, mid(1 - near), 'never onto the lookout you are standing on');
console.log('  lookouts: two, on the end piers, 3 rows up, towered; the call: 12 s, told ' + LANCE_SUPPORT.tell + ' s, nearer lookout, never yours, two at most, every 15 s');

// ---- 3. in the page ----
const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});
    BK.load(LEVELS.findIndex(l=>l.id==='storm'));BK.start();BK.god=true;BK.sim(10);BK.reset();for(const q of BK.enemies())if(!q.maxHp)q.alive=false;
    const b=BK.boss;BK.tp(Math.round(BK.L.arena.trigger/16)+1,29);BK.sim(30);const out={active:BK.bossActive};
    /* his walk: pace with him far off, measured over a second */
    b.mode='pace';b.chargeT=b.thrustT=b.vaultT=b.javT=b.galeT=b.sweepT=b.bashT=99;b.x=BK.P.x+200;b.vx=0;BK.P.inv=99;BK.sim(60);out.walk=Math.round(Math.abs(b.vx));
    b.mode='couch';b.modeT=0.01;b.x=BK.P.x+300;BK.sim(3);out.charge=Math.round(Math.abs(b.vx));
    b.mode='pace';b.modeT=0.5;b.x=BK.P.x+160;b.supportT=0.01;let calledAt=-1,came=null;
    for(let f=0;f<240&&!came;f++){b.chargeT=b.thrustT=b.vaultT=b.javT=b.galeT=99;BK.P.inv=99;BK.sim(1);if(calledAt<0&&b.bowCall)calledAt=f;came=BK.enemies().find(q=>q.alive&&q.lanceBow)||null;}
    out.calledAt=calledAt;out.kind=came&&came.t;out.fire=came&&!!came.fire;out.xpKey=came?came.xpKey||null:'none';
    BK.sim(60);out.landedRow=came?+(came.y/16).toFixed(2):null;
    for(let i=0;i<60&&b.alive;i++){b.hp=1;b.mode='planted';b.inv=0;BKT.hurtEnemy(b,1e6,b.x-10,false);BK.sim(2);}
    BK.sim(200);out.bossDead=!b.alive;out.bowsAfter=BK.enemies().filter(q=>q.alive&&q.lanceBow).length;out.activeAfter=BK.bossActive;return out;})()`, 300000);
} finally { pg.close(); }
assert.equal(r.active, true, 'the fight starts');
assert.ok(r.walk >= 40 && r.walk <= 46, 'his walk is the slower one (44, was 52): ' + r.walk);
assert.ok(r.charge >= 205 && r.charge <= 215, 'his charge is the slower one (212, was 250): ' + r.charge);
assert.ok(r.calledAt >= 0, 'a bowman is called in the real fight');
assert.equal(r.kind, 'archer', 'and he is an ARCHER - no new kind (one-new-foe)'); assert.equal(r.fire, false, 'a plain one, not a fire archer');
assert.equal(r.xpKey, null, 'he pays no XP: the call cannot be farmed');
assert.ok(A.bows.some(b => Math.abs(r.landedRow - b[2]) < 0.2),'he lands on a lookout (row ' + r.landedRow + ')');
assert.equal(r.bossDead, true); assert.equal(r.bowsAfter, 0, 'his bowmen are gone when he dies'); assert.equal(r.activeAfter, false, 'and the fight ends');
console.log('  in the page: walk ' + r.walk + ', charge ' + r.charge + '; a plain archer, no XP, lands on the lookout, gone at his death, the fight ends');
console.log('THE QUEEN\'S LANCE: slower, two end lookouts, his bowmen told and cleared - all hold.');
