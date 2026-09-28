// tools/stockade-horns.mjs — PINS THE STOCKADE'S FOUR AUDIT BEATS (work/claude/lane-done/claude-stockade.md), so a later
// merge can't silently drop them:
//   twist     tower 3's horn archer starts on the ground, short of his own climb column, and a real NET column stands
//             there; a second, non-horn archer still covers the tower while he runs
//   combine   the kennel tower's horn carries the 2-hound pack it wakes behind its crank gate, and no static hound
//             sits there regardless of the horn
//   boss-horn a rafters archer stands by the Chieftain, flagged so only the boss-phase hook can sound him - and, in
//             the page: that hook fires a sapper wave when the Chieftain hits phase two, does NOT fire it if the
//             archer is down first, and does NOT fire for a different phase-two boss (the Hornet Queen)
//   exam      a sapper waits at the high bridge's far end, and a hound stands at the foot of the second lift
// PROVED RED FIRST on origin/master (cd35d24, before claude/stockade): none of the four beats exist there - see the
// lane's report for the before/after this pins.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { openPage } from './cdp.mjs';

const fails = [];
const lv = LEVELS.find(l => l.id === 'stockade');
if (!lv) { console.log('stockade-horns: no stockade level in LEVELS'); process.exit(1); }
const L = lv.build();
const archers = L.ents.filter(e => e.t === 'archer');
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];

// ---- 1. THE TWIST, tower 3 ----
const blower = archers.find(e => e.horn && e.runTo);
/* runTo's dx/climbDx are OFFSETS from the blower's OWN (already-shifted) x - grow() shifts an entity's own x but never
   a nested field, and this level grows sections in ahead of tower 3, so an absolute stored column would drift. Resolve
   the real target the same way main.js's spawnEnt does. */
const target = blower && { x: blower.x + blower.runTo.dx, y: blower.runTo.y, climbX: blower.x + blower.runTo.climbDx };
if (!blower) fails.push('twist: no horn archer carries a runTo - tower 3\'s blower is gone');
else {
  if (blower.x >= target.climbX) fails.push('twist: the blower at ' + blower.x + ',' + blower.y + ' does not stand short of his own climb column (' + target.climbX + ') - he is not starting on the ground, away from the tower');
  if (target.x <= target.climbX) fails.push('twist: the horn (' + target.x + ') is not past the climb column (' + target.climbX + ') - the climb does not lead up to the tower');
  let netRows = 0; for (let y = 0; y < L.H; y++) if (at(target.climbX, y) === T.NET) netRows++;
  if (netRows < 3) fails.push('twist: column ' + target.climbX + ' (the blower\'s own climb column) has ' + netRows + ' NET tiles - no real net to climb');
  const cover = archers.find(e => e !== blower && !e.horn && Math.abs(e.x - target.x) <= 6 && Math.abs(e.y - target.y) <= 6);
  if (!cover) fails.push('twist: no second, non-horn archer stands near the tower (' + target.x + ',' + target.y + ') to fire while the blower runs');
}

// ---- 2. THE COMBINE, the kennel tower + its crank gate ----
const kennel = archers.find(e => e.horn && e.pack);
if (!kennel) fails.push('combine: no horn archer carries a pack - the kennel tower no longer calls its hounds');
else {
  if (!Array.isArray(kennel.pack) || kennel.pack.length !== 2) fails.push('combine: the kennel horn\'s pack is ' + JSON.stringify(kennel.pack) + ', not the 2 hounds the audit calls for');
  const packXs = (kennel.pack || []).map(p => kennel.x + p.dx);
  const crank = L.ents.find(e => e.t === 'crank' && packXs.some(x => Math.abs(x - e.x) < 30));
  if (!crank) fails.push('combine: no crank gate stands near where the kennel horn\'s pack wakes');
  const staticHound = L.ents.find(e => e.t === 'hound' && crank && e.x > kennel.x && e.x < kennel.x + 60 && !packXs.some(x => Math.abs(x - e.x) < 2));
  if (staticHound) fails.push('combine: a static hound at ' + staticHound.x + ',' + staticHound.y + ' still stands behind the gate regardless of the horn - it should only be the pack');
}

// ---- 3a. THE RULE IN THE BOSS, structurally ----
const rafters = archers.find(e => e.horn && e.rafters);
const chiefEnt = L.ents.find(e => e.t === 'chief');
if (!rafters) fails.push('boss-horn: no rafters archer stands in the Chieftain\'s hall');
else if (!chiefEnt) fails.push('boss-horn: the level has no chief to hold a phase two');
else if (Math.abs(rafters.x - chiefEnt.x) > 40) fails.push('boss-horn: the rafters archer at ' + rafters.x + ',' + rafters.y + ' is nowhere near the Chieftain (' + chiefEnt.x + ',' + chiefEnt.y + ')');

// ---- 4. THE EXAM, the bridge and the lift ----
if (blower) {
  const bridgeSapper = L.ents.find(e => e.t === 'sapper' && e.x > 285 && e.x < target.climbX);
  if (!bridgeSapper) fails.push('exam: no sapper waits between the bridge and tower 3\'s climb');
}
const liftHound = rafters && L.ents.find(e => e.t === 'hound' && e.x > 316 && e.x < rafters.x - 10);
if (!liftHound) fails.push('exam: no hound stands at the foot of the second lift, before the hall');

console.log('stockade-horns (static): blower ' + (blower ? blower.x + ',' + blower.y + ' -> ' + JSON.stringify(target) : 'MISSING') +
  ' | kennel pack ' + (kennel ? JSON.stringify(kennel.pack) : 'MISSING') + ' | rafters ' + (rafters ? rafters.x + ',' + rafters.y : 'MISSING') +
  ' | bridge sapper ' + (blower && L.ents.some(e => e.t === 'sapper' && e.x > 285 && e.x < target.climbX)) + ' | lift hound ' + !!liftHound);

// ---- 3b. THE RULE IN THE BOSS, live: the sapper wave fires for the Chieftain, only for the Chieftain, and only if the rafters archer is still up ----
const pg = await openPage({ audio: false, fonts: false });
let page = {};
try {
  page = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;
    const idx=id=>LEVELS.findIndex(l=>l.id===id);
    const load=(id)=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx(id));BK.start();BK.god=true;BK.sim(10);BK.reset();};
    const enter=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);};
    const sappers=()=>BK.enemies().filter(q=>q.alive&&q.t==='sapper').length;
    const half=(e)=>{e.inv=0;const before=sappers();BKT.hurtEnemy(e,e.hp-Math.round(e.maxHp*0.4),e.x-10,false);BK.sim(10);return {before,after:sappers(),phase:e.phase};};
    const res={};
    // (a) the rafters blower left alone: the Chieftain's phase two calls the wave
    load('stockade');enter();
    { const chief=BK.enemies().find(q=>q.t==='chief'&&q.alive); res.chiefWave=chief?half(chief):null; }
    // (b) the rafters blower already down: phase two calls nothing
    load('stockade');enter();
    { const chief=BK.enemies().find(q=>q.t==='chief'&&q.alive);
      const rb=BK.enemies().find(q=>q.t==='archer'&&q.rafters); if (rb) rb.alive=false;
      const r=chief?half(chief):null; res.chiefSilenced=r?{...r,hadBlower:!!rb}:null; }
    // (c) a DIFFERENT phase-two boss (the Hornet Queen, Bracken Wood): the hook does not touch her
    load('wood');enter();
    { const queen=BK.enemies().find(q=>q.t==='queen'&&q.alive); res.queenPhase2=queen?half(queen):null; }
    return res;})()`, 60000);
  page.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }

const errors = page.errors || []; delete page.errors;
console.log('stockade-horns (page): ' + JSON.stringify(page));
const cw = page.chiefWave, cs = page.chiefSilenced, qp = page.queenPhase2;
if (!cw || cw.phase !== 2 || cw.after <= cw.before) fails.push('boss-horn: the Chieftain hit phase two and no sapper wave came (' + JSON.stringify(cw) + ')');
if (!cs || !cs.hadBlower || cs.after !== cs.before) fails.push('boss-horn: with the rafters blower already down, phase two still spawned sappers (' + JSON.stringify(cs) + ')');
if (!qp || qp.after !== qp.before) fails.push('boss-horn: a different boss\'s phase two (the Hornet Queen) spawned sappers too - the hook is not chief-only (' + JSON.stringify(qp) + ')');
if (errors.length) fails.push('page errors ' + JSON.stringify(errors));

if (fails.length) console.log(fails.join('\n'));
assert.deepEqual(fails, []);
console.log('stockade-horns: all four beats hold - the tower-3 twist, the kennel combine, the boss horn (chief-only), and the exam.');
