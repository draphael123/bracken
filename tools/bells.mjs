// tools/bells.mjs — EVERY SIGNED BELL IS LIVE: a sentry who sees you runs for it, it drops its hall's gate and turns out the
// watch, and the gate lifts again. (Daniel, 2026-09-25, on the level review: HIGHCROWN's rule is "EVERY HALL HAS A BELL, AND A
// GATE THAT DROPS WITH IT", and only the Leads' bell did anything. The ward's, the entrance hall's and the chapel's were signed,
// hung and guarded, and dead: their alarm sections went on 2026-09-11 when the three gates became key portcullises, and the bells,
// the sentries' `section` tags and four signs were left promising what nothing did. docs/briefs/highcrown-bells.md.)
// A convention nothing checks is a wish, so this asks it of every level, in two halves:
//   IN NODE, off the built level:
//     tagged    every bell and every sentry carrying a `section` belongs to an alarm in L.alarms (a section with no alarm is a
//               dead bell: the sentry just fights), and every alarm has its bell and its sentry
//     gates     every alarm gate cell is AIR in the built grid (closeGate lays PORT over AIR only), with rock over its top or four
//               rows of it, and never on a lock gate's column - openGate lifts every PORT in its rows, so a gate laid on a lock
//               gate would take the lock up with it and the key would stop mattering
//     watch     every garrison foe it turns out stands on footing, and an alarm turns out SOMEBODY (a garrison or a hall to wake)
//     signs     in a level with alarms, a sign that names a bell stands within 60 columns of a live one (the level's own preface
//               at its start excepted)
//   IN THE PAGE, for every sentry of every alarm (the real update, the real bell):
//     rung      shown the hero, he runs, rings, and the gate drops (every cell PORT), and the watch is out
//     lifts     the watch cut down, the gate lifts - and a lock gate beside it is still shut
//     quiet     a broken bell keeps the hall quiet: he fights instead of running
//     clock     left standing, the watch does not keep the gate down past twenty seconds (B4: never the only route for long)
//     reset     a death puts the hall back: the gate up, the alarm unrung
// PROVED RED FIRST (2026-09-25, on e7846f3): tagged failed for crown's ward, hall and chapel; rung failed for their four sentries.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { openPage } from './cdp.mjs';

const fails = [], live = [];
const FLOOR = new Set([T.SOLID, T.ONEWAY, T.PLANK, T.SHELF, T.RAIL, T.NET]);
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || lv.id === 'custom' || !lv.build) continue;
  const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
  const alarms = L.alarms || [], ids = new Set(alarms.map(a => a.id));
  const bells = L.ents.filter(e => e.t === 'bell' && e.section), sentries = L.ents.filter(e => e.t === 'sentry' && e.section);
  for (const e of [...bells, ...sentries]) if (!ids.has(e.section)) fails.push(lv.id + ' tagged: the ' + e.t + ' at ' + e.x + ',' + e.y + ' is in section "' + e.section + '", and no alarm has that id: a dead bell');
  const locks = new Set(L.ents.filter(e => e.t === 'lockgate').map(e => e.x));
  for (const a of alarms) {
    const tag = lv.id + ' ' + a.id;
    if (!bells.some(b => b.section === a.id)) fails.push(tag + ' tagged: no bell rings this alarm');
    if (!sentries.some(s => s.section === a.id)) fails.push(tag + ' tagged: no sentry runs for its bell');
    if (!(a.gates || []).length) fails.push(tag + ' gates: it drops nothing');
    for (const [col, y0, y1] of a.gates || []) {
      for (let y = y0; y <= y1; y++) if (at(col, y) !== T.AIR) fails.push(tag + ' gates: ' + col + ',' + y + ' is not AIR, so nothing drops there');
      if (at(col, y0 - 1) !== T.SOLID && y1 - y0 + 1 < 4) fails.push(tag + ' gates: the gate at ' + col + ' is ' + (y1 - y0 + 1) + ' rows with open air over it - a jump clears it');
      if (locks.has(col)) fails.push(tag + ' gates: ' + col + ' is a lock gate\'s column - lifting the alarm would lift the lock');
    }
    for (const gd of a.garrison || []) if (at(gd.x, gd.y) === T.SOLID || !FLOOR.has(at(gd.x, gd.y + 1))) fails.push(tag + ' watch: the ' + gd.t + ' at ' + gd.x + ',' + gd.y + ' stands on nothing');
    if (!(a.garrison || []).length && !a.wake) fails.push(tag + ' watch: it turns out nobody');
    live.push([lv.id, a.id]);
  }
  if (alarms.length) for (const s of L.ents.filter(e => e.t === 'sign' && /\bBELLS?\b/.test(e.text || ''))) {
    if (Math.abs(s.x - L.START.x) <= 30 && Math.abs(s.y - L.START.y) <= 12) continue;   /* the level's preface, at its start */
    if (!bells.some(b => ids.has(b.section) && Math.abs(b.x - s.x) <= 60 && Math.abs(b.y - s.y) <= 20)) fails.push(lv.id + ' signs: the sign at ' + s.x + ',' + s.y + ' names a bell, and no live one hangs within 60 columns');
  }
}

// ---- the page ----
const want = [...new Set(live.map(([id]) => id))];
let out = {};
if (want.length) {
  const pg = await openPage({ audio: false, fonts: false });
  try {
    out = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const res={};
      const PORT=${T.PORT}, AIR=${T.AIR};
      const cell=(c,y)=>BK.L.grid[y*BK.L.W+c];
      const load=(id)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=false;BK.sim(5);};
      const hold=()=>{BK.P.hp=BK.P.maxHp;BK.P.inv=0.5;};
      const show=(s)=>{BK.P.x=s.x+(s.face||1)*24;BK.P.y=s.y;BK.P.vx=0;BK.P.vy=0;};   /* inside his 34 px: he sees you whichever way he faces */
      const ringBy=(sec,s,frames)=>{show(s);let ran=false;for(let i=0;i<frames;i++){hold();BK.sim(1);if(s.mode==='run')ran=true;if(sec.on)return {ran,f:i};}return {ran,f:null};};
      const gateIs=(sec,t)=>sec.gates.every(([c,y0,y1])=>{for(let y=y0;y<=y1;y++)if(cell(c,y)!==t)return false;return true;});
      for (const id of ${JSON.stringify(want)}) {
        load(id);const ids=(BK.L.alarms||[]).map(a=>a.id);
        for (const sid of ids) {
          const nS=BK.enemies().filter(e=>e.t==='sentry'&&e.section===sid).length;
          for (let k=0;k<nS;k++) { const r={};
            /* rung, then lifts */
            load(id);let sec=BK.L.alarms.find(a=>a.id===sid),s=BK.enemies().filter(e=>e.t==='sentry'&&e.section===sid)[k];
            const locks=BK.L.ents.filter(e=>e.t==='lockgate').map(e=>{const ys=[];for(let y=0;y<BK.L.H;y++)if(cell(e.x,y)===PORT)ys.push(y);return [e.x,ys];});
            const g=ringBy(sec,s,900);r.ran=g.ran;r.rungF=g.f;r.on=!!sec.on;r.dropped=sec.on&&gateIs(sec,PORT);
            const watch=BK.enemies().filter(e=>e.alive&&e.garrison===sid);r.watch=watch.length;
            for(const e of watch){BKT.hurtEnemy(e,9999,e.x,true);}for(let i=0;i<90;i++){hold();BK.sim(1);if(sec.done)break;}
            for(const e of BK.enemies().filter(e=>e.alive&&e.garrison===sid))e.alive=false;for(let i=0;i<30&&!sec.done;i++){hold();BK.sim(1);}
            r.done=!!sec.done;r.lifted=gateIs(sec,AIR);
            r.locksHeld=locks.every(([c,ys])=>ys.every(y=>cell(c,y)===PORT));
            /* quiet: the bell broken */
            load(id);sec=BK.L.alarms.find(a=>a.id===sid);s=BK.enemies().filter(e=>e.t==='sentry'&&e.section===sid)[k];
            for(const b of BK.props())if(b.t==='bell'&&b.section===sid){b.broken=true;b.hp=0;}
            const q=ringBy(sec,s,420);r.quiet=!sec.on&&!q.ran;
            /* clock: rung, and the watch left standing */
            load(id);sec=BK.L.alarms.find(a=>a.id===sid);s=BK.enemies().filter(e=>e.t==='sentry'&&e.section===sid)[k];
            ringBy(sec,s,900);BK.god=true;let t=0;for(;t<60*24&&!sec.done;t++){BK.P.x=s.x;BK.sim(1);}BK.god=false;r.clockS=+(t/60).toFixed(1);r.clockLifted=sec.done&&gateIs(sec,AIR);
            /* reset: a death with the hall shut */
            load(id);sec=BK.L.alarms.find(a=>a.id===sid);s=BK.enemies().filter(e=>e.t==='sentry'&&e.section===sid)[k];
            ringBy(sec,s,900);const was=sec.on;BKT.respawn();BK.sim(2);r.reset=was&&!sec.on&&gateIs(sec,AIR);
            res[id+' '+sid+'#'+k]=r; }
        }
      }
      return res;})()`);
    out.errors = pg.errors.slice(0, 3);
  } finally { pg.close(); }
}
const errors = out.errors || []; delete out.errors;
console.log(JSON.stringify(out));
for (const [k, r] of Object.entries(out)) {
  if (!r.ran) fails.push(k + ' rung: shown the hero, the sentry never ran for his bell');
  if (!r.on) fails.push(k + ' rung: the bell was never rung');
  else if (!r.dropped) fails.push(k + ' rung: rung, and its gate did not drop');
  if (r.on && !r.watch) fails.push(k + ' rung: rung, and nobody turned out');
  if (r.on && !(r.done && r.lifted)) fails.push(k + ' lifts: the watch is down and the gate stayed shut');
  if (!r.locksHeld) fails.push(k + ' lifts: lifting the alarm lifted a lock gate');
  if (!r.quiet) fails.push(k + ' quiet: with the bell broken, the hall still rang (or he still ran)');
  if (r.on && !(r.clockLifted && r.clockS <= 21)) fails.push(k + ' clock: the watch left standing kept the gate down ' + r.clockS + ' s');
  if (r.on && !r.reset) fails.push(k + ' reset: a death did not put the hall back');
}
if (errors.length) fails.push('page errors ' + JSON.stringify(errors));
if (fails.length) console.log(fails.join('\n'));
assert.deepEqual(fails, []);
console.log('bells: ' + live.length + ' alarm(s) (' + live.map(a => a.join(' ')).join(', ') + '): every signed bell has its alarm, its gates drop on air and lift, and every sentry rings his');
