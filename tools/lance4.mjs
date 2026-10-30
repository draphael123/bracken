// tools/lance4.mjs - THE QUEEN'S LANCE 4 (claude/lance4; scratch/brief-lance4-1029.md, Daniel 10-29 20:04: all recs). Replaces tools/lance3.mjs
// (the mounted Lance). Node for his bridge, his numbers and the pure bell / rope machinery; the page for the fight, every device forced and
// its effect read back:
//   1. THE BRIDGE: a lookout on every pier; NO fire cage on the bridge (Q3); THREE GATE TOWERS (piers 1, 3, 5) - a bell on the lookout, its
//      portcullis column under it across the deck, a tower top one held jump over the lookout; THREE SIGNAL ROPES from each tower top down
//      to the next pier's lookout, over his head mid-run, a post on that pier's deck; THE GREAT BELL on the gatehouse hoarding, one jump up
//      from the last lookout; the main gate at the bridge's end; spans over teeth.
//   2. HIS NUMBERS: the tempo classes (LIGHT ~0.4 s, MEDIUM 0.6-0.85, HEAVY 0.95-1.1), a guard after a heavy, his openings 1.5-2x and the
//      shieldless floor >= 0.4 (B15); three tolls over 1.2 s; bells wind back; a cut rope is re-strung; no bash, no horse anywhere.
//   3. IN THE PAGE (LANCE4_NODE=1 skips it): ON FOOT (one 26x40 box); a bell rung with him under its gate PINS him (3 s+, open); rung
//      with him away HE ANSWERS THE BELL (a charge at that tower) and runs into the dropped gate (OVERRUN, open); a whiffed charge OVERRUNS;
//      at 67% HE STOPS THE BELLS (hauled up, they do nothing); a plunge on his helm RINGS it (open); a rope post struck with him under its run
//      WHIPS him (open, and it breaks a shield wall); at 33% he falls back under the main gate; THE GREAT BELL pins him there (x2) and SPLITS
//      HIS SHIELD (two-handed after, x0.7 from the front); THE STONES ring the deck and break the planks they land on; his death SLAMS the gate.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T, TS } from '../src/level.js';
import { LANCE4, HEAVY_MODES, bellStrike, bellStep, ropeFray, ropeTick } from '../src/lance-support.js';
import * as ZL from '../src/zipline.js';

// ---- 1. THE BRIDGE ----
const L = LEVELS.find(l => l.id === 'storm').build(), A = L.arena, G = (x, y) => L.grid[y * L.W + x], deck = A.floor / TS;
assert.ok(A && A.boss === 'lance', 'Stormhold has the Lance\'s arena');
assert.equal(A.lookouts.length, 7, 'a lookout on every pier');
for (const [x0, x1, row] of A.lookouts) { assert.equal(deck - row, 3, 'a lookout is one held jump (3 rows) over the boards');
  for (let x = x0; x <= x1; x++) { assert.equal(G(x, row), T.ONEWAY, 'a one-way deck at ' + x); assert.equal(G(x, deck), T.SOLID, 'on a pier at ' + x); } }
assert.equal(L.ents.filter(e => e.t === 'weight' && e.lamp && e.x * TS > A.x0).length, 0, 'no fire cage on the bridge (Q3: the bells, the gates and the ropes are the fight)');
assert.ok(!L.ents.some(e => e.t === 'winch' && e.bossGate && e.x * TS > A.x0), 'the old bridge-gate winch is gone (the gate towers\' bells replace it)');
const bells = L.ents.filter(e => e.t === 'lancebell' && !e.great), great = L.ents.filter(e => e.t === 'lancebell' && e.great);
assert.equal(bells.length, 3, 'three gate towers'); assert.deepEqual(bells.map(b => b.tower), [1, 3, 5], 'on piers 1, 3 and 5');
for (const b of bells) { const lk = A.lookouts[b.tower];
  assert.ok(b.x >= lk[0] && b.x <= lk[1] && b.y + 1 === lk[2], 'tower ' + b.tower + '\'s bell stands on its lookout');
  assert.ok(b.gate > lk[0] && b.gate < lk[1] && b.gy0 === deck - 2 && b.gy1 === deck - 1, 'its portcullis hangs under the lookout across the deck');
  for (let y = b.gy0; y <= b.gy1; y++) assert.equal(G(b.gate, y), T.AIR, 'the gate\'s column is open until it drops (' + b.gate + ',' + y + ')');
  for (let x = lk[0] + 1; x <= lk[0] + 3; x++) assert.equal(G(x, deck - 6), T.ONEWAY, 'tower ' + b.tower + ' has a top one held jump over its lookout'); }
assert.equal(great.length, 1, 'the great bell'); { const gb = great[0];
  assert.equal(gb.gate, A.mainGate, 'the great bell drops the main gate');
  assert.equal(G(gb.x, gb.y + 1), T.ONEWAY, 'it stands on the hoarding');
  const last = A.lookouts[6]; assert.ok(last[2] - (gb.y + 1) <= 3 && gb.x - last[1] <= 8, 'the hoarding is a jump from the last lookout'); }
const ropes = L.zipLines.filter(z => z.signal !== undefined);
assert.equal(ropes.length, 3, 'three signal ropes'); for (const z of ropes) { ZL.norm(z);
  const k = z.signal, top = A.lookouts[k], next = A.lookouts[k + 1];
  assert.ok(z.dir === 1, 'signal rope ' + k + ' rides east, downhill');
  assert.ok(ZL.inReach(z, { x: z.x0 + 6, y: (deck - 6) * TS, face: 1 }), 'it is taken from its tower top');
  assert.equal(z.y1 + 12, next[2] * TS, 'it lands its rider on the next pier\'s lookout');
  assert.ok(z.x1 >= next[0] * TS && z.x1 <= (next[1] + 1) * TS, 'its low end is over that lookout');
  const mid = ZL.lineY(z, (z.x0 + z.x1) / 2), head = A.floor - 40; assert.ok(head - mid >= 24 && head - mid <= 56, 'mid-run it is 2-3 rows over his head: ' + (head - mid));
  assert.ok(z.post && Math.abs(z.post[1] - A.floor) < 1 && G(Math.floor(z.post[0] / TS), deck) === T.SOLID, 'its post stands on a pier\'s deck'); }
for (const [s0, s1] of A.spans) for (let x = s0; x <= s1; x++) { assert.equal(G(x, deck), T.PLANK, 'planks at ' + x); assert.equal(G(x, 43), T.SPIKE, 'teeth under ' + x); }
assert.ok(A.fallPct > 0 && A.fallPct < 0.27, 'a fall through a gap he tore bites less than a walked-into pit');

// ---- 2. HIS NUMBERS ----
const X = LANCE4;
assert.ok(X.thrust.tell >= 0.35 && X.thrust.tell <= 0.45 && X.thrust.tell3 < X.thrust.tell, 'LIGHT: the thrust ~0.4 s (shieldless faster)');
for (const [k, v] of [['sweep', X.sweep.tell], ['wall', X.wall.tell], ['volley', X.volley.tell]]) assert.ok(v >= 0.6 && v <= 0.85, 'MEDIUM ' + k + ' tell 0.6-0.85: ' + v);
for (const [k, v] of [['couch', X.couch], ['vault', X.vault.tell]]) assert.ok(v >= 0.95 && v <= 1.1, 'HEAVY ' + k + ' tell 0.95-1.1: ' + v);
assert.ok(X.heavyGap >= 0.8 && HEAVY_MODES.has('couch') && HEAVY_MODES.has('vaultTell'), 'a guard after every heavy');
assert.ok(X.overrun >= 1.5 && X.bell.pin >= 3 && X.great.pin >= 3 && X.rung >= 2 && X.whipped >= 1.5 && X.vault.planted >= 1.5, 'his openings are long enough to take');
for (const [k, m] of Object.entries(X.open)) assert.ok(m >= 1.5 && m <= 2, 'opening ' + k + ' pays 1.5-2x: ' + m);
assert.ok(X.bell.mul >= 1.5 && X.great.mul <= 2 && X.bare >= 0.4 && X.bare < 1, 'B15: pinned 1.5-2x, shieldless >= 0.4');
assert.ok(X.p2 > X.p3 && X.p2 < 1 && X.p3 > 0.15, 'the phases in order');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(!/lanceUnhorse|drawLanceHorse|SPR\.lanceHorse|LANCE3|e\.t === 'lance' && e\.mounted/.test(main), 'no horse anywhere (Q1)');
assert.ok(!/case 'bashTell': e\.face = Math\.sign\(d\) \|\| e\.face; want = -e\.face \* 16/.test(main), 'the shield bash is cut');
const marks = readFileSync(new URL('../src/marks.js', import.meta.url), 'utf8');
for (const m of ['couch', 'volleyTell', 'vaultTell', 'wallTell', 'thrustTell', 'sweepTell', 'pennantTell']) assert.ok(marks.includes("'lance|" + m + "'"), 'the mark table names his ' + m);
for (const m of ['bashTell', 'rearTell']) assert.ok(!marks.includes("'lance|" + m + "'"), 'no mark for the cut ' + m);
/* the bell, pure: three tolls over 1.2 s, the third the drop; then it winds back */
{ const b = { ringT: -1 }; assert.ok(bellStrike(b), 'a ready bell rings'); let ev = [], t = 0; for (; t < 2; t += 1 / 60) { for (const x of bellStep(b, 1 / 60)) ev.push([x, +t.toFixed(2)]); }
  assert.deepEqual(ev.map(x => x[0]), ['toll', 'toll', 'drop'], 'three tolls, the last drops the gate'); assert.ok(Math.abs(ev[2][1] - 1.2) < 0.05, 'the drop at 1.2 s: ' + ev[2][1]);
  assert.ok(!bellStrike(b), 'it cannot be rung while it winds back'); for (let i = 0; i < 60 * 10; i++) bellStep(b, 1 / 60); assert.ok(bellStrike(b), 'wound back in ' + X.bell.rewind + ' s, it rings again');
  const up = { ringT: -1, up: true }; assert.ok(!bellStrike(up), 'a hauled-up bell cannot be rung'); const gb = { ringT: -1, great: true }; bellStrike(gb); assert.deepEqual(bellStep(gb, 1 / 60), ['drop'], 'the great bell drops its gate at once'); }
/* the rope, pure: struck it frays, parts (the whip), hangs slack, and is strung again; nobody takes a parted line */
{ const z = ZL.norm({ x0: 0, y0: 0, x1: 300, y1: 60 }); assert.ok(ropeFray(z) && !ropeFray(z), 'a post struck frays the line (once)'); let parted = null;
  for (let t = 0; t < 1; t += 1 / 60) if (ropeTick(z, 1 / 60) === 'parted') parted = +t.toFixed(2);
  assert.ok(parted !== null && Math.abs(parted - X.fray) < 0.05 && z.cut > 0 && z.whip > 0, 'it parts after the fray, and whips: ' + parted);
  const Pz = { x: 100, y: ZL.lineY(z, 100) + 14, ground: false, face: 1 }; assert.equal(ZL.findCatch({ zipLines: [z] }, Pz, true, false), null, 'a parted line holds nobody');
  for (let i = 0; i < 60 * (X.restring + 1); i++) ropeTick(z, 1 / 60); assert.ok(!(z.cut > 0), 're-strung in ' + X.restring + ' s'); assert.equal(ZL.findCatch({ zipLines: [z] }, Pz, true, false), z, 'and it holds again'); }
console.log('  the bridge: 7 lookouts, no cages, 3 gate towers (bells 1/3/5), 3 signal ropes, the great bell on the hoarding; tempo L ' + X.thrust.tell + ' / M ' + X.sweep.tell + '-' + X.volley.tell + ' / H ' + X.couch + '-' + X.vault.tell + '; bells and ropes pure');
if (process.env.LANCE4_NODE) { console.log('THE QUEEN\'S LANCE 4 (node): ok'); process.exit(0); }

// ---- 3. IN THE PAGE ----
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const out={};
    for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='storm'));BK.state='play';BK.god=false;BK.sim(5);
    const A=BK.L.arena,P=BK.P,fl=A.floor,row=fl/16;BK.tp(Math.round(A.trigger/16)+1,row-1);for(let i=0;i<200;i++){P.hp=P.maxHp;P.inv=9;BK.sim(1);}
    const b=BK.enemies().find(e=>e.t==='lance'&&e.alive);for(const e of BK.enemies())if(e!==b&&!e.maxHp)e.alive=false;out.active=BK.bossActive;out.box=[b.w,b.h];out.mounted=!!b.mounted;
    const hold=()=>{for(const k of ['chargeT','volleyT','thrustT','sweepT','vaultT','wallT'])b[k]=99;b.penT=99;};
    const safe=()=>{P.hp=P.maxHp;P.inv=9;};const run=(n,each)=>{for(let i=0;i<n;i++){if(each)each(i);BK.sim(1);}};
    const bells=BK.props().filter(p=>p.t==='lancebell'),tb=k=>bells.find(p=>p.tower===k),gb=bells.find(p=>p.great);
    const ring=(pr)=>{P.x=pr.x-10;P.y=pr.y;P.vx=P.vy=0;P.face=1;P.atk=-1;BK.press('atk');run(14,()=>{safe();P.x=pr.x-10;P.y=pr.y;});};
    const reset=()=>{hold();b.mode='guard';b.modeT=0.3;b.guardHold=0;b.answer=null;b.lastHeavy=false;b.vx=0;b.y=fl;for(const p of bells){p.rewind=0;p.ringT=-1;}run(2,safe);};
    /* THE BELL with him under its gate: three tolls, then PINNED */
    { reset();const pr=tb(1);b.x=pr.gx;ring(pr);let pin=0,open=false;run(140,()=>{safe();P.x=pr.x-10;P.y=pr.y;if(b.mode!=='pinned'&&!pin){b.x=pr.gx;b.vx=0;hold();b.answer=null;if(b.mode!=='guard'){b.mode='guard';}}if(b.mode==='pinned'){pin=Math.max(pin,b.modeT);open=open||BK.bossOpen(b);}});
      out.under={pin:+pin.toFixed(2),open,mul:b.pinMul||0}; run(260,()=>{safe();hold();}); }
    /* THE BELL with him away: HE ANSWERS (a charge at the tower), the gate drops ahead of him, he runs into it - OVERRUN */
    { reset();const pr=tb(3);b.x=pr.gx-150;b.face=1;ring(pr);let couch=null,over=0,open=false,closed=false;
      run(300,()=>{safe();P.x=pr.x-10;P.y=pr.y;if(b.mode==='couch'&&!couch)couch={toward:Math.sign(pr.gx-b.x)===b.face};if(BK.L.grid[pr.gy1*BK.L.W+pr.gate]!==0)closed=true;if(b.mode==='overrun'){over=Math.max(over,b.modeT);open=open||BK.bossOpen(b);}if(over&&b.mode!=='overrun')hold();});
      out.away={couch,closed,over:+over.toFixed(2),open,x:Math.round(b.x-pr.gx)}; run(200,()=>{safe();hold();}); }
    /* A WHIFFED CHARGE: OVERRUN */
    { reset();b.x=A.x0+100;P.x=b.x+200;P.y=fl;b.face=1;b.mode='couch';b.modeT=0.01;b.chargeAt=null;let over=0;run(260,()=>{safe();if(b.mode==='charge'||b.mode==='couch'){P.y=fl-48;P.x=Math.min(P.x,b.x+200);}if(b.mode==='overrun')over=Math.max(over,b.modeT);if(over&&b.mode!=='overrun')hold();});out.whiff={over:+over.toFixed(2)}; }
    /* P2: HE STOPS THE BELLS */
    { reset();b.x=A.x0+300;P.x=b.x-40;P.y=fl;b.hp=Math.round(b.maxHp*0.68);BKT.hurtAs('cut',b,Math.round(b.maxHp*0.02),b.x+10,false);out.p2={phase:b.phase,mode:b.mode,up:bells.filter(p=>!p.great).every(p=>p.up)};run(90,()=>{safe();hold();});
      const pr=tb(1);reset();b.x=pr.gx;ring(pr);run(100,()=>{safe();hold();b.x=pr.gx;});out.p2.bellAfter=b.mode; }
    /* P2: HELM RUNG - a plunge onto his helm */
    { reset();b.rungAt=-99;b.x=A.x0+300;P.x=b.x;P.y=fl-60;P.ground=false;const h0=b.hp;BKT.hurtAs('plunge',b,20,b.x,true);out.rung={mode:b.mode,t:+b.modeT.toFixed(2),open:BK.bossOpen(b)};run(160,()=>{safe();hold();}); }
    /* P2: THE ROPE CUT with him under its run: WHIPPED (and it breaks a shield wall) */
    { reset();const z=BK.L.zipLines.find(q=>q.signal===1);b.x=(z.x0+z.x1)/2;b.mode='shieldwall';b.modeT=9;b.face=-1;P.x=z.post[0]-12;P.y=fl;P.face=1;P.atk=-1;BK.press('atk');let wh=0,open=false;
      run(80,()=>{safe();P.x=z.post[0]-12;P.y=fl;if(b.mode==='shieldwall'){b.x=(z.x0+z.x1)/2;b.vx=0;}if(b.mode==='whipped'){wh=Math.max(wh,b.modeT);open=open||BK.bossOpen(b);}});
      out.whip={wh:+wh.toFixed(2),open,cut:z.cut>0,from:'shieldwall'}; run(120,()=>{safe();hold();}); }
    /* P3: back to the main gate; the great bell pins him (x2) and splits the shield */
    { reset();b.x=A.x1-300;P.x=b.x-60;P.y=fl;b.hp=Math.round(b.maxHp*0.34);BKT.hurtAs('cut',b,Math.round(b.maxHp*0.02),b.x-10,false);out.p3={phase:b.phase,mode:b.mode};
      run(400,()=>{safe();hold();P.x=b.x-70;P.y=fl;});out.p3.home=Math.round(b.x-gb.gx);gb.rewind=0;gb.ringT=-1;
      let pin=0,mul=0;ring(gb);run(30,()=>{safe();if(b.mode==='pinned'){pin=Math.max(pin,b.modeT);mul=b.pinMul;}});out.great={pin:+pin.toFixed(2),mul};
      run(320,()=>{safe();hold();P.x=b.x-70;P.y=fl;});out.great.bare=!!b.bare;
      const h0=b.hp;b.mode='guard';hold();P.x=b.x+(b.face>0?20:-20);P.face=-b.face;BKT.hurtAs('cut',b,100,P.x,false);out.great.front=h0-b.hp; }
    /* P3: THE STONES ring the deck and break the planks */
    { reset();const s=A.spans[3];P.x=(s[0]+s[1]+1)*8;P.y=fl;b.lz.pen=1;b.mode='pennantTell';b.modeT=0.01;run(2);const n=b.lz.stones.length,g0=b.lz.gaps.size;run(120,()=>{safe();hold();P.vx=0;});out.stones={n,gaps:b.lz.gaps.size-g0}; }
    /* the slam */
    { for(let i=0;i<80&&b.alive;i++){b.hp=1;b.mode='pinned';BKT.hurtEnemy(b,1e6,b.x-10,false);BK.sim(2);} out.dead=!b.alive;out.slam=b.lz.slam;BK.sim(200);out.activeAfter=BK.bossActive; }
    return out;})()`, 300000);
  r.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
console.log(JSON.stringify(r));
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
ok(r.active === true && !r.mounted && r.box[0] === 26 && r.box[1] === 40, 'the fight starts, ON FOOT, one 26x40 box: ' + JSON.stringify(r.box));
ok(r.under.pin >= 3 && r.under.open && r.under.mul >= 1.5, 'a bell rung with him under its gate PINS him, 3 s+, open: ' + JSON.stringify(r.under));
ok(r.away.couch && r.away.couch.toward && r.away.closed && r.away.over >= 1.4 && r.away.open, 'rung with him away: HE ANSWERS THE BELL, and runs into the dropped gate (OVERRUN): ' + JSON.stringify(r.away));
ok(r.whiff.over >= 1.4, 'a whiffed charge ends OVERRUN: ' + JSON.stringify(r.whiff));
ok(r.p2.phase === 2 && r.p2.mode === 'haul' && r.p2.up && r.p2.bellAfter !== 'pinned', 'at 67% HE STOPS THE BELLS, and a hauled-up bell does nothing: ' + JSON.stringify(r.p2));
ok(r.rung.mode === 'rung' && r.rung.t >= 2 && r.rung.open, 'a plunge on his helm RINGS it: ' + JSON.stringify(r.rung));
ok(r.whip.wh >= 1.4 && r.whip.open && r.whip.cut, 'a rope post struck with him under its run WHIPS him, out of his shield wall: ' + JSON.stringify(r.whip));
ok(r.p3.phase === 3 && r.p3.mode === 'fallback' && Math.abs(r.p3.home) < 30, 'at 33% he falls back under the main gate: ' + JSON.stringify(r.p3));
ok(r.great.pin >= 3.5 && r.great.mul >= 2 && r.great.bare, 'THE GREAT BELL pins him (x2) and its bars SPLIT his shield: ' + JSON.stringify(r.great));
ok(r.great.front >= 40 && r.great.front <= 85, 'shieldless, a front blow lands at ~0.7 (no wall, B15): ' + r.great.front);
ok(r.stones.n >= 2 && r.stones.gaps >= 1, 'THE STONES ring the deck and break the planks: ' + JSON.stringify(r.stones));
ok(r.dead && r.slam === 1 && r.activeAfter === false, 'his death slams the main gate and ends the fight');
ok(!r.errors.length, 'page errors: ' + JSON.stringify(r.errors));
if (fails.length) { for (const f of fails) console.error('FAIL ' + f); process.exit(1); }
console.log('THE QUEEN\'S LANCE 4: on foot; the bells pin him or drop a gate he runs into; he stops the bells; the helm rings; the line whips; the great bell pins him and splits his shield; the stones; the slam - all hold.');
