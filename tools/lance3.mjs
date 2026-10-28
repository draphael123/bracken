// tools/lance3.mjs - THE QUEEN'S LANCE, REWORKED (claude/stormhold3; scratch/brief-stormhold3-1024.md, Daniel's 10-25 appendix). Replaces
// the old lance-support check (now tools/lance3.mjs) (his horn and its archers are gone: the Hornsman's trick now). Node for the bridge he fights on and his numbers;
// the page for the fight itself, every move forced and its effect read back:
//   1. THE BRIDGE: a lookout on every one of the seven piers (3 rows up, one-way, towered); a fire cage hung off the west end of six of them,
//      its foot at the lookout's height (cut from the lookout as he rides under, where his charge cannot reach you); spans to tear; the gorge
//      under the spans bites (spikes) and does not kill; the main gate's column; a fall costs less in his fight (fallPct).
//   2. HIS NUMBERS: every tell told long enough to read (>= 0.6 s); a torn gap is a jump for every hero; the phases in order; no archer support.
//   3. IN THE PAGE: MOUNTED (the charger drawn, the barding at 0.4x); THE CHARGE tears a told gap (crack first, then air) and ends in a WHEEL
//      that is open; THE CAGE UNHORSES him (phase two, open); THE SPEAR VOLLEY marks before it lands and hurts where it lands; THE PENNANT
//      calls the BALLISTA (a line, then a bolt that hits a standing hero and not one on a lookout) and the OIL (a strip, then fire); THE LANCE
//      VAULT goes up onto a lookout and comes down point-first, planted and open; THE SHIELD WALL shoves a hero in front of it and is TURNED
//      (open) when he gets behind; THE LAST STAND at a third: he falls back toward the main gate as it comes down; his death SLAMS it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T, TS } from '../src/level.js';
import { LANCE3 } from '../src/lance-support.js';
import { openPage } from './cdp.mjs';

// ---- 1. THE BRIDGE ----
const L = LEVELS.find(l => l.id === 'storm').build(), A = L.arena, G = (x, y) => L.grid[y * L.W + x], deck = A.floor / TS;
assert.ok(A && A.boss === 'lance', 'Stormhold has the Lance\'s arena');
assert.equal(A.lookouts.length, 7, 'a lookout on every pier');
for (const [x0, x1, row] of A.lookouts) { assert.equal(deck - row, 3, 'a lookout is one held jump (3 rows) over the boards');
  for (let x = x0; x <= x1; x++) { assert.equal(G(x, row), T.ONEWAY, 'a one-way deck at ' + x); assert.equal(G(x, deck), T.SOLID, 'on a pier at ' + x); }
  assert.ok(L.ents.some(e => e.t === 'deco' && e.kind === 'bridgetower' && e.x > x0 && e.x < x1), 'a bridgetower holds up the lookout at ' + x0); }
const cages = L.ents.filter(e => e.t === 'weight' && e.lamp && e.x * TS > A.x0);
assert.equal(cages.length, 6, 'six fire cages on the bridge');
for (const c of cages) { assert.ok(A.lookouts.some(([x0, , row]) => x0 - c.x === 1 && c.y + c.len === row), 'cage @' + c.x + ' hangs off a lookout\'s west end, its foot at the lookout\'s height'); }
assert.ok(A.spans.length >= 6, 'spans to tear');
for (const [s0, s1] of A.spans) { for (let x = s0; x <= s1; x++) { assert.equal(G(x, deck), T.PLANK, 'planks at ' + x); assert.equal(G(x, 43), T.SPIKE, 'the gorge\'s teeth under ' + x + ' (a bite, not a death)'); } }
assert.ok(A.mainGate > (A.lookouts[6][1]) && A.mainGate * TS < A.x1, 'the main gate stands at the bridge\'s end, inside his walls');
assert.ok(A.fallPct > 0 && A.fallPct < 0.27, 'a fall through a gap he tore bites less than a pit walked into: ' + A.fallPct);

// ---- 2. HIS NUMBERS ----
const X = LANCE3;
for (const [k, v] of [['couch', X.couch], ['rearTell', X.rearTell], ['volley', X.volley.tell], ['pennant', X.pennant.tell], ['vault', X.vault.tell], ['wall', X.wall.tell], ['ballista', X.ballista.tell], ['oil', X.oil.tell], ['crack', X.crack.tell]]) assert.ok(v >= 0.6, k + ' is told long enough to read: ' + v);
assert.ok(X.volley.fall >= 0.9, 'a spear\'s shadow is on the deck a second before it lands');
assert.ok(X.crack.w <= 3, 'a torn gap is a jump for every hero (' + X.crack.w + ' planks)');
assert.ok(X.founder > X.lastStand && X.founder < 1 && X.lastStand > 0.15, 'the phases in order: mounted, on foot, the last stand');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(!/lanceBow|lanceSupport|LANCE_SUPPORT/.test(main), 'no horn and no archers: the pennant calls the gatehouse now');
const marks = readFileSync(new URL('../src/marks.js', import.meta.url), 'utf8');
for (const m of ['couch', 'rearTell', 'volleyTell', 'vaultTell', 'wallTell', 'thrustTell', 'sweepTell', 'bashTell', 'pennantTell']) assert.ok(marks.includes("'lance|" + m + "'"), 'the mark table names his ' + m);
console.log('  the bridge: 7 lookouts, 6 cages off their ends, ' + A.spans.length + ' spans over teeth, the main gate at ' + A.mainGate + '; tells >= 0.6 s; gaps of ' + X.crack.w);

// ---- 3. IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const out={};
    for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='storm'));BK.state='play';BK.god=false;BK.sim(5);
    const A=BK.L.arena,P=BK.P,fl=A.floor,row=fl/16;BK.tp(Math.round(A.trigger/16)+1,row-1);for(let i=0;i<200;i++){P.hp=P.maxHp;P.inv=9;BK.sim(1);}
    const b=BK.enemies().find(e=>e.t==='lance'&&e.alive);for(const e of BK.enemies())if(e!==b&&!e.maxHp)e.alive=false;out.active=BK.bossActive;
    const hold=()=>{for(const k of ['chargeT','rearT','volleyT','thrustT','sweepT','bashT','vaultT','wallT'])b[k]=99;b.penT=99;};
    const safe=()=>{P.hp=P.maxHp;P.inv=9;};
    const run=(n,each)=>{for(let i=0;i<n;i++){if(each)each(i);BK.sim(1);}};
    out.mounted=!!b.mounted;
    /* THE BARDING: mounted, a cut from behind lands at 0.4 (no angle beats it) */
    { hold();b.mode='ride';b.modeT=99;b.x=P.x+30;b.face=1;const h0=b.hp;P.face=1;P.inv=9;BKT.hurtAs('cut',b,100,P.x,false);out.barding=h0-b.hp; b.hp=h0; }
    /* THE CHARGE: from the far end at a hero on a lookout - a crack, then a gap, and the wheel (open) */
    { hold();const lk=A.lookouts[3];P.x=(lk[0]+2)*16;P.y=lk[2]*16;P.vx=P.vy=0;b.x=A.x1-60;b.y=fl;b.mode='couch';b.modeT=0.01;b.face=-1;let cracked=0,wheel=null,maxGaps=0;
      run(420,()=>{safe();P.x=(lk[0]+2)*16;P.y=lk[2]*16;const Z=b.lz;if(Z&&Z.cracks.length)cracked++;if(Z)maxGaps=Math.max(maxGaps,Z.gaps.size);if(b.mode==='wheel'&&!wheel)wheel={open:BK.bossOpen(b),t:+b.modeT.toFixed(2)};if(b.mode==='wheel')hold();});
      out.charge={cracked,gaps:maxGaps,wheel};
      const gx=b.lz?[...b.lz.gaps]:[];out.gapTiles=gx.map(i=>{const s=A.spans[i];let n=0;for(let x=s[0];x<=s[1];x++)if(BK.L.grid[row*BK.L.W+x]===0)n++;return n;}); }
    /* THE CAGE UNHORSES HIM */
    { hold();const c=BK.props().find(p=>p.t==='weight'&&p.lamp&&p.x>A.x0&&p.state==='hang');b.mode='ride';b.modeT=99;b.x=c.x;b.y=fl;b.vx=0;c.state='fall';c.fy=c.y+c.len;c.vy=0;
      let thrown=0,open=false;run(40,i=>{safe();if(b.mode==='ride'){b.x=c.x;b.vx=0;}if(b.mode==='thrown'){thrown=Math.max(thrown,b.modeT);open=open||BK.bossOpen(b);}});
      out.cage={mounted:!!b.mounted,phase:b.phase,thrown:+thrown.toFixed(2),open}; run(Math.ceil((thrown+1.2)*60),()=>{safe();hold();}); out.afterCage=b.mode; }
    /* THE SPEAR VOLLEY: shadows first, then a spear where you stood */
    { hold();P.x=b.x-90;P.y=fl;P.vx=0;P.inv=0;P.hp=P.maxHp;b.mode='volleyTell';b.modeT=0.01;run(2);const Z=b.lz,n=Z.spears.length,t0=n?Math.min(...Z.spears.map(s=>s.t)):0,hp0=P.hp;
      run(Math.ceil((t0+0.2)*60),()=>{hold();if(b.mode==='guard'){b.vx=0;}P.vx=0;BK.keys.left=BK.keys.right=false;});out.volley={n,t0:+t0.toFixed(2),hurt:hp0-P.hp}; safe(); }
    /* THE PENNANT, a hero on the deck: the ballista's line, then its bolt; then a hero on a lookout: the oil */
    { hold();b.lz.pen=0;P.x=b.x-120;P.y=fl;P.inv=0;P.hp=P.maxHp;b.mode='pennantTell';b.modeT=0.01;run(2);const B=b.lz.bolt;out.ballista={called:!!B,tell:B?+B.t.toFixed(2):0};const hp0=P.hp;
      run(400,()=>{hold();b.vx=0;P.vx=0;});out.ballista.hurt=hp0-P.hp;safe();
      const lk=A.lookouts[1];P.x=(lk[0]+2)*16;P.y=lk[2]*16;P.inv=0;P.hp=P.maxHp;b.lz.bolt=null;b.lz.pen=0;b.mode='pennantTell';b.modeT=0.01;run(2);const O=b.lz.oil;out.oil={called:!!O,onLookout:O?Math.abs(O.y-lk[2]*16)<2:false,bolt:!!b.lz.bolt};
      const hp1=P.hp;run(Math.ceil(((O?O.t:0)+0.4)*60),()=>{hold();b.vx=0;P.x=(lk[0]+2)*16;P.y=lk[2]*16;P.vx=P.vy=0;});out.oil.hurt=hp1-P.hp;safe(); run(200,()=>{safe();hold();}); }
    /* THE LANCE VAULT: up onto a lookout, then down point-first; planted and open */
    { hold();b.mode='guard';b.modeT=0.5;b.x=A.x0+250;b.y=fl;b.vx=0;P.x=b.x+110;P.y=fl;P.vx=0;b.vaultT=0;let up=null,planted=0,open=false,stab=null;
      run(240,()=>{safe();for(const k of ['thrustT','sweepT','bashT','wallT','volleyT'])b[k]=99;b.penT=99;if(b.mode==='perch'&&!up){up={row:+(b.y/16).toFixed(2)};stab=b.stab;}if(b.mode==='planted'){planted=Math.max(planted,b.modeT);open=open||BK.bossOpen(b);b.vaultT=99;}});
      out.vault={up,planted:+planted.toFixed(2),open,stabY:stab?+(stab.y/16).toFixed(2):null}; }
    /* THE SHIELD WALL: shoves a hero in front of it; a hero behind it turns it (open) */
    { hold();run(30,()=>{safe();hold();});b.mode='wallTell';b.modeT=0.01;b.y=fl;b.x=A.x0+300;b.face=1;P.x=b.x+30;P.y=fl;P.vx=0;const px0=P.x;
      run(60,()=>{safe();hold();BK.keys.left=BK.keys.right=false;});out.wall={shoved:Math.round(P.x-px0),mode:b.mode};
      P.x=b.x-24;P.y=fl;run(6,()=>{safe();hold();});out.wall.turned=b.mode;out.wall.open=BK.bossOpen(b); run(120,()=>{safe();hold();}); }
    /* THE LAST STAND: under a third he falls back toward the main gate as it comes down */
    { hold();b.mode='guard';b.hp=Math.round(b.maxHp*0.36);P.x=b.x+20;P.y=fl;P.face=-1;P.inv=9;BKT.hurtAs('cut',b,Math.round(b.maxHp*0.05),P.x,false);out.last={phase:b.phase,mode:b.mode};const x0=b.x;
      run(240,()=>{safe();hold();P.x=b.x-60;});out.last.moved=Math.round(b.x-x0);out.last.gateK=+b.lz.gateK.toFixed(3);
      for(let i=0;i<80&&b.alive;i++){b.hp=1;b.mode='planted';BKT.hurtEnemy(b,1e6,b.x-10,false);BK.sim(2);}
      out.dead=!b.alive;out.slam=b.lz.slam;BK.sim(200);out.activeAfter=BK.bossActive; }
    return out;})()`, 300000);
} finally { pg.close(); }
console.log(JSON.stringify(r));
assert.equal(r.active, true, 'the fight starts');
assert.equal(r.mounted, true, 'phase one is MOUNTED');
assert.ok(r.barding >= 30 && r.barding <= 50, 'the barding turns a blow from behind to ~0.4 (B15 floor): ' + r.barding + ' of 100');
assert.ok(r.charge.cracked > 0 && r.charge.gaps >= 1, 'the charge tears the bridge, told (a crack first): ' + JSON.stringify(r.charge));
assert.ok(r.gapTiles.every(n => n >= 1 && n <= 3), 'every gap is a jump: ' + r.gapTiles);
assert.ok(r.charge.wheel && r.charge.wheel.open && r.charge.wheel.t >= 1, 'the charge ends in a wheel, open: ' + JSON.stringify(r.charge.wheel));
assert.ok(!r.cage.mounted && r.cage.phase === 2 && r.cage.open && r.cage.thrown >= 2.5, 'the cage unhorses him: phase two, thrown and open ' + JSON.stringify(r.cage));
assert.ok(r.volley.n >= 3 && r.volley.t0 >= 0.9 && r.volley.hurt > 0, 'the spear volley marks first and lands where you stood: ' + JSON.stringify(r.volley));
assert.ok(r.ballista.called && r.ballista.tell >= 1 && r.ballista.hurt > 0, 'the pennant calls the ballista on a hero on the deck, told, and it hits: ' + JSON.stringify(r.ballista));
assert.ok(r.oil.called && r.oil.onLookout && !r.oil.bolt && r.oil.hurt > 0, 'on a lookout the pennant pours the oil there (no bolt), and it burns: ' + JSON.stringify(r.oil));
assert.ok(r.vault.up && Math.abs(r.vault.up.row - 27) < 0.2 && r.vault.planted >= 1.2 && r.vault.open, 'the lance vault: up onto a lookout, down planted and open ' + JSON.stringify(r.vault));
assert.ok(r.wall.shoved >= 12 && r.wall.turned === 'wallTurned' && r.wall.open, 'the shield wall shoves you along and is turned from behind: ' + JSON.stringify(r.wall));
assert.ok(r.last.phase === 3 && r.last.moved > 20 && r.last.gateK > 0, 'the last stand: back toward the main gate as it comes down ' + JSON.stringify(r.last));
assert.ok(r.dead && r.slam === 1 && r.activeAfter === false, 'his death slams the main gate and ends the fight');
console.log('THE QUEEN\'S LANCE (rework): mounted, the charge tears the bridge (told), the cage unhorses him, the volley, the ballista and the oil, the vault, the shield wall, the last stand and the slam - all hold.');
