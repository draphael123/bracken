// PAGE TOOL: launches headless Chrome
/* tools/pyro-duel.mjs — THE PYROMANCER 2: THE MIRROR DUEL ON THE NEW KIT (claude/pyroboss2, Daniel 11-01 09:05 + 09:07 "You can build both";
   scratch/brief-pyroboss2-firemage-1101.md). It was the old-kit mirror (the run of three, THE BELLOWS, the ember volley, the read-guard, the vent);
   the hero's kit changed (BATCH135 pyrokit + claude/pyrocontrols) and the boss with it. What it proves:
     1. THE STAFF        kept: a run of three cuts on the hero's own frames, each told (a yellow !), a cut that lands ends the run (no stun-lock)
     2. FLAME WARD       his guard: a blow into it is turned at 0.4 (B15, never 0) with WARDED and scorches the striker; the last of it GUTTERS (told), then
                         he is SPENT - open, x1.5 (B10's gold ring + bar)
     3. THE FIREBALL     five steps grow on his staff; '!' at steps 1-2, '!!' from step 3 (it explodes: a red ring where it lands, drawn before release);
                         a blow while he charges CANCELS it - FIZZLED, open; left alone it flies and a big one goes off
     4. PHOENIX RISE     told (red !!), a burning dash to your spot that hurts on the way, a landing burst, open as he rises from it
     5. STOKE            low on fire and you far off, he crouches to refill - open the whole time
     6. P2 MARKS         past half the square cools; his fire marks the floor; a full meter is CONFLAGRATION (red !!): every mark erupts at once - a hero
                         on a mark is burned, one off them is not; then he is SPENT
     7. HE HOPS          to your stall and back down to your floor (his identity kept); THE RACKS: water is always in reach of his square
     8. THE KIT          forty seconds of the fight show only the new kit's modes - no bellows, no ember volley, no vent, no read
   The water (stoke -> WINDED, the steam ward at 0.4) is tools/village-water.mjs's. PORT=<port> node tools/pyro-duel.mjs */
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { MARK, ANSWER } from '../src/marks.js';
import { readFileSync } from 'fs';
import { openPage } from './cdp.mjs';
import { WARD, CHARGE, RISE, CONFLAG, OPEN_MUL, STOKE } from '../src/pyro-boss.js';

const TS = 16;
// ---- 7 (static): THE RACKS ----
{ const L = LEVELS.find(l => l.id === 'burning').build(), A = L.arena, F = A.floor / TS;
  const racks = L.ents.filter(e => e.t === 'villagewell' && e.bucket && e.x * TS >= A.x0 - 4 * TS && e.x * TS <= A.x1 + 4 * TS);
  const floorR = racks.filter(r => r.y === F - 1), stallR = racks.filter(r => r.y < F - 2);
  assert.ok(floorR.length >= 2, 'a rack at each end of his square: ' + racks.map(r => r.x + ',' + r.y).join(' '));
  assert.ok(stallR.length >= 1, 'and one off the floor, on a stall: ' + racks.map(r => r.x + ',' + r.y).join(' '));
  let worst = 0; for (let x = A.x0 / TS; x < A.x1 / TS; x++) worst = Math.max(worst, Math.min(...racks.map(r => Math.abs(r.x - x))));
  assert.ok(worst <= 12, 'no tile of his square is more than 12 tiles from a rack: ' + worst);
  assert.ok(L.ents.some(e => e.t === 'sign' && /STOKES/.test(e.text || '') && Math.abs(e.x - A.x0 / TS) < 8), 'the sign at his door teaches the new kit (water while he stokes)');
}
// ---- 8 (static): THE MARKS ----
assert.equal(MARK['pyromancer|cutTell'], '!', 'his staff cuts: a yellow !');
assert.equal(MARK['pyromancer|chargeTell'], '!', 'a small fireball (steps 1-2): a yellow !, a shield takes it');
assert.equal(MARK['pyromancer|chargeBigTell'], '!!', 'a big one (3+) explodes: a red !!');
assert.equal(MARK['pyromancer|riseTell'], '!!', 'PHOENIX RISE: red');
assert.equal(MARK['pyromancer|conflagTell'], '!!', 'CONFLAGRATION: red');
assert.equal(ANSWER['pyromancer|riseTell'], 'jump'); assert.equal(ANSWER['pyromancer|conflagTell'], 'dodge');
for (const gone of ['bellowsTell', 'emberTell', 'ventTell', 'jetTell', 'stepTell', 'wallTell', 'wispTell', 'staffTell']) assert.ok(!('pyromancer|' + gone in MARK), 'no ' + gone + ' left in his kit');
assert.ok(WARD.mul >= 0.4 && RISE.mul >= 0.4, 'B15: never below 0.4');

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const I=LEVELS.findIndex(l=>l.id==='burning');
  const boot=hero=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;for(const e of BK.enemies())if(e!==b)e.alive=false;b.fwCd=99;b.stokeCd=99;return b;};
  const K=BK.keys,P=()=>BK.P,PD=BK.pyroDuel,D=PD&&PD.D;
  const hold=(b,x)=>{P().x=x;P().vx=0;P().face=Math.sign(b.x-x)||1;};
  const blow=(b,n,tag)=>{const h=b.hp;BK.P.mixN=0;BK.P.mixLast=null;BKT.hurtAs(tag||'heavy',b,n,b.x-12,false);const d=h-b.hp;b.hp=h;return d;};
  const mid=b=>{const A=BK.L.arena;b.x=(A.x0+A.x1)/2;b.y=A.floor;b.vx=0;b.vy=0;};
  {const b=boot();out.hp={max:b.maxHp,hp:b.hp};}
  /* 1. THE STAFF: a run of three cuts, each told, on the hero's frames */
  {const b=boot('knight');mid(b);b.mode='stalk';b.cd=0;b.heat=60;b.turn=0;
   const seq=[],poses=new Set(),tellPose=new Set();let last=null;K.block=true;
   for(let i=0;i<240;i++){hold(b,b.x-28);b.fwCd=99;b.stokeCd=99;BK.sim(1);if(b.mode!==last){seq.push(b.mode);last=b.mode;}
     const p=PD.pose(b);if(b.mode==='cut')poses.add(p[0]+p[1]);if(b.mode==='cutTell')tellPose.add(p[0]+p[1]);
     if(seq.filter(m=>m==='cut').length>=3&&b.mode!=='cut')break;}
   K.block=false;out.combo={seq,cuts:seq.filter(m=>m==='cut').length,poses:[...poses],tellPose:[...tellPose]};}
  /* 1. NO STUN-LOCK */
  {const b=boot('pyro');BK.god=false;mid(b);b.mode='stalk';b.cd=0;b.heat=60;
   let hits=0,hp=P().hp,seq=[],last=null,started=false;
   for(let i=0;i<300;i++){hold(b,b.x-26);P().inv=0;b.fwCd=99;b.stokeCd=99;BK.sim(1);if(P().hp<hp)hits++;P().hp=P().maxHp;hp=P().hp;if(b.mode!==last){seq.push(b.mode);last=b.mode;}if(b.mode==='cutTell')started=true;if(started&&b.mode==='stalk')break;}
   BK.god=true;out.lock={hits,seq};}
  /* 2. HIS FLAME WARD: raised when you swing at him in reach, a blow into it turned at 0.4 + WARDED + you scorched; it gutters, then SPENT */
  {const b=boot('knight');BK.god=false;mid(b);b.mode='stalk';b.cd=99;b.heat=60;b.fwCd=0;b.fwRollAt=-9;
   let raised=false;for(let t=0;t<12&&!raised;t++){b.fwCd=0;b.fwRollAt=-9;b.mode='stalk';hold(b,b.x-24);P().atk=-1;BK.press('atk');for(let i=0;i<3&&!raised;i++){hold(b,b.x-24);b.cd=99;BK.sim(1);raised=b.mode==='ward';}for(let i=0;i<30&&!raised;i++){hold(b,b.x-60);b.cd=99;BK.sim(1);}}
   const pose=raised?PD.pose(b):null;b.modeT=0.8;P().x=b.x-30;P().inv=0;b.scorchAt=-9;const hp0=P().hp;const d=blow(b,40);const said=BK.textLab.nums().map(n=>n.txt);const scorched=hp0-P().hp;
   let gut=null,spent=null;for(let i=0;i<120&&b.mode==='ward';i++){hold(b,b.x-70);b.cd=99;BK.sim(1);if(b.modeT<=WARD_GUT&&!gut)gut=PD.pose(b);}
   spent={mode:b.mode,open:+(b.open||0).toFixed(2),read:b.readNow,bossOpen:BK.bossOpen(b),x15:blow(b,20)};
   BK.god=true;out.ward={raised,pose,blade:d,said,scorched,gut,spent};}
  /* 3. THE FIREBALL: steps grow; the mark turns red at 3; a blow cancels (FIZZLED, open); uninterrupted, a big one flies and goes off */
  {const b=boot('knight');mid(b);b.mode='stalk';b.cd=99;b.heat=60;
   b.mode='chargeTell';b.modeT=9;b.chT=0;b.step=1;b.stepGoal=5;b.fast=false;b.face=-1;const steps=[],modes=[];let ringSeen=false;
   for(let i=0;i<60*2.2;i++){hold(b,b.x-140);BK.sim(1);if(steps[steps.length-1]!==b.step)steps.push(b.step);if(modes[modes.length-1]!==b.mode)modes.push(b.mode);if(b.mode==='chargeBigTell'&&b.aimX!==undefined)ringSeen=true;if(b.mode==='loose')break;}
   const balls=PD.balls().length;
   const cancel=(()=>{b.mode='chargeTell';b.modeT=9;b.chT=0.5;b.step=2;b.stepGoal=4;b.open=0;const d=blow(b,40,'light');return {mode:b.mode,open:+(b.open||0).toFixed(2),blade:d,said:BK.textLab.nums().map(n=>n.txt)};})();
   /* a big ball let go at a hero standing still goes off on him: no shield turns it */
   BK.god=false;b.mode='chargeTell';b.modeT=9;b.chT=0;b.step=1;b.stepGoal=3;b.open=0;K.block=true;const hp0=P().hp;P().inv=0;
   for(let i=0;i<60*3;i++){hold(b,b.x-120);P().inv=Math.min(P().inv||0,0);b.cd=99;b.fwCd=99;b.stokeCd=99;BK.sim(1);if(P().hp<hp0)break;}K.block=false;BK.god=true;
   out.fb={steps,modes,ringSeen,balls,cancel,bigHit:hp0-P().hp};}
  /* 4. PHOENIX RISE */
  {const b=boot('knight');BK.god=false;const A=BK.L.arena;b.x=A.x0+80;b.y=A.floor;b.mode='stalk';b.cd=99;b.heat=60;P().x=A.x0+290;P().y=A.floor;P().vy=0;
   b.mode='riseTell';b.modeT=0.6;b.riseX=P().x;b.face=1;const seq=[];let last=null;const hp0=P().hp;const x0=b.x;
   for(let i=0;i<120;i++){P().x=A.x0+290;P().vx=0;P().inv=0;b.cd=99;b.fwCd=99;b.stokeCd=99;BK.sim(1);if(b.mode!==last){seq.push(b.mode);last=b.mode;}if(b.mode==='stalk')break;}
   BK.god=true;out.rise={seq,moved:Math.round(b.x-x0),hurt:hp0-P().hp,open:BK.bossOpen(b)};}
  /* 5. STOKE: his fire low and you far off: he crouches to refill, OPEN */
  {const b=boot('knight');const A=BK.L.arena;mid(b);b.mode='stalk';b.cd=0;b.heat=10;b.stokeCd=0;b.fwCd=99;P().x=b.x-150;P().y=A.floor;
   let st=null;for(let i=0;i<120&&!st;i++){P().x=b.x-150;P().vx=0;b.fwCd=99;BK.sim(1);if(b.mode==='stoke')st={open:BK.bossOpen(b),read:b.readNow,pose:PD.pose(b)[0]};}
   const h0=b.heat;for(let i=0;i<30&&b.mode==='stoke';i++){P().x=b.x-150;BK.sim(1);}out.stoke={st,gained:Math.round(b.heat-h0)};}
  /* 6. P2: HIS MARKS and CONFLAGRATION */
  {const b=boot('knight');BK.god=false;const A=BK.L.arena;mid(b);b.hp=Math.floor(b.maxHp*0.45);b.mode='stalk';b.cd=99;BK.sim(2);const p2=b.phase;
   b.marks=[{x:b.x-60,y:A.floor,t:BK.time},{x:b.x+60,y:A.floor,t:BK.time},{x:b.x-120,y:A.floor,t:BK.time}];
   b.heat=100;b.mode='cutEnd';b.modeT=0;const run=(px)=>{const seq=[];let last=null;const hp0=P().hp;for(let i=0;i<150;i++){P().x=px;P().y=A.floor;P().vx=0;P().inv=0;b.cd=99;b.fwCd=99;b.stokeCd=99;BK.sim(1);if(b.mode!==last){seq.push(b.mode);last=b.mode;}if(b.mode==='spent')break;}return {seq,hurt:hp0-P().hp,marksLeft:(b.marks||[]).length,open:BK.bossOpen(b)};};
   const pulse=PD.pose(b);const on=run(b.x-60);
   b.marks=[{x:b.x-60,y:A.floor,t:BK.time},{x:b.x+60,y:A.floor,t:BK.time}];b.heat=100;b.mode='cutEnd';b.modeT=0;const off=run(b.x-30);
   BK.god=true;out.p2={phase:p2,on,off};}
  /* 7. HE HOPS TO YOUR STALL, and back down to your floor */
  {const b=boot('knight');const A=BK.L.arena,st=PD.stalls(b);const s=st.slice().sort((p,q)=>Math.abs((p.l+p.r)/2-(A.x0+A.x1)/2)-Math.abs((q.l+q.r)/2-(A.x0+A.x1)/2))[0];
   const res={stalls:st.length};
   if(s){P().x=(s.l+s.r)/2;P().y=s.y;P().vy=0;b.x=(s.l+s.r)/2+110;b.y=A.floor;b.mode='stalk';b.cd=0;b.heat=60;const seen=new Set();
     for(let i=0;i<240&&!(b.onGround&&Math.abs(b.y-s.y)<2&&b.mode!=='hop');i++){P().x=(s.l+s.r)/2;P().y=s.y;P().vy=0;P().vx=0;b.fwCd=99;b.stokeCd=99;if(b.mode==='chargeTell'||b.mode==='chargeBigTell'){b.mode='stalk';b.cd=0;}BK.sim(1);seen.add(b.mode);}
     res.up={y:b.y,stallY:s.y,seen:[...seen]};
     b.mode='stalk';b.cd=0;const fx=b.x+(b.x<(A.x0+A.x1)/2?150:-150);
     for(let i=0;i<240&&!(b.onGround&&b.y===A.floor&&b.mode!=='hop');i++){P().x=fx;P().y=A.floor;P().vy=0;P().vx=0;b.fwCd=99;b.stokeCd=99;if(b.mode!=='hop'&&b.mode!=='hopCrouch'&&b.mode!=='land'){b.mode='stalk';}BK.sim(1);}res.down={y:b.y,floor:A.floor};}
   out.hop=res;}
  /* 8. THE KIT: forty seconds with the hero put all over the square (and half of it in P2), only the new kit's modes */
  {const b=boot('knight');const A=BK.L.arena,st=PD.stalls(b);const seen={};const spots=[[A.x0+40,A.floor],[A.x1-40,A.floor],[(A.x0+A.x1)/2,A.floor]].concat(st.map(s=>[(s.l+s.r)/2,s.y]));
   for(let i=0;i<60*40;i++){if(i%150===0){const s=spots[(i/150)%spots.length];P().x=s[0];P().y=s[1];P().vy=0;K.block=(i/150)%2===1;}if(i===60*20)b.hp=Math.floor(b.maxHp*0.45);if(b.hp<b.maxHp*0.3)b.hp=Math.floor(b.maxHp*0.45);seen[b.mode]=(seen[b.mode]||0)+1;
     if(i%40===0){P().atk=-1;BK.press('atk');}BK.sim(1);}
   K.block=false;out.modes=Object.keys(seen);}
  return out;})()`.replace('WARD_GUT', String(WARD.gutter)), 600000);
  console.log(JSON.stringify(r));
  const ehpLine = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').split('\n').find(l => l.startsWith('const EHP = {')) || '';
  const ehp = +((ehpLine.match(/\bpyromancer: *(\d+)/) || [])[1]);
  const NOW = 1700;   /* (claude/pyrotune 10-24: 1500 on the old kit; claude/pyroboss2 keeps it for the first read of the new kit - the TUNE lane sets it in band) */
  assert.equal(ehp, NOW, 'his health is ' + NOW + ': ' + ehp);
  assert.ok(r.hp.max > NOW * 0.95 && r.hp.max <= NOW * 1.05, 'and it is the health he fights with in the square: ' + r.hp.max);
  /* 1 */
  assert.equal(r.combo.cuts, 3, 'a run of three cuts, told one by one: ' + r.combo.seq.join(' > '));
  assert.ok(r.combo.seq.filter(m => m === 'cutTell').length === 3, 'every cut has its own tell: ' + r.combo.seq.join(' > '));
  assert.ok(r.combo.poses.some(p => p.startsWith('atk')), 'on the hero\'s own frames: ' + r.combo.poses);
  assert.equal(r.lock.hits, 1, 'a cut that lands ends his run: ' + JSON.stringify(r.lock));
  /* 2 */
  assert.ok(r.ward.raised, 'swing at him in reach and his FLAME WARD comes up (within a dozen tries): ' + JSON.stringify(r.ward));
  assert.ok(r.ward.pose && r.ward.pose[0] === 'wardUp', 'on the hero\'s ward pose: ' + JSON.stringify(r.ward.pose));
  assert.ok(r.ward.blade >= 14 && r.ward.blade <= 18, 'a blow into it lands at 0.4 (B15): ' + r.ward.blade);
  assert.ok(r.ward.said.includes('WARDED') && r.ward.scorched > 0, 'turned, said, and the striker is scorched: ' + JSON.stringify(r.ward));
  assert.ok(r.ward.gut && r.ward.gut[1] === 2, 'the end of it GUTTERS (the ebbing ward pose; the red fading dome): ' + JSON.stringify(r.ward.gut));
  assert.ok(r.ward.spent.mode === 'spent' && r.ward.spent.bossOpen, 'then he is SPENT - the gold read: ' + JSON.stringify(r.ward.spent));
  assert.ok(r.ward.spent.x15 >= 24 && r.ward.spent.x15 <= 32, 'and a blow lands x1.5 (a stale repeat a little less): ' + r.ward.spent.x15);
  /* 3 */
  assert.deepEqual(r.fb.steps.slice(0, 5), [1, 2, 3, 4, 5], 'five steps grow on his staff: ' + r.fb.steps);
  assert.ok(r.fb.modes.includes('chargeTell') && r.fb.modes.includes('chargeBigTell') && r.fb.modes.indexOf('chargeBigTell') > r.fb.modes.indexOf('chargeTell'), 'the yellow ! turns red at step 3: ' + r.fb.modes);
  assert.ok(r.fb.ringSeen, 'a big one shows where it will land (the red ring)');
  assert.ok(r.fb.balls >= 1, 'left alone, it flies');
  assert.ok(r.fb.cancel.mode === 'spent' && r.fb.cancel.open >= 1.2, 'a blow on his charge CANCELS it: FIZZLED, open: ' + JSON.stringify(r.fb.cancel));
  assert.ok(r.fb.bigHit > 0, 'a big one goes off on a raised shield: ' + r.fb.bigHit);
  /* 4 */
  assert.ok(['riseTell', 'rise', 'riseLand'].every(m => r.rise.seq.includes(m)), 'PHOENIX RISE: told, the dash, the landing: ' + r.rise.seq);
  assert.ok(r.rise.moved >= 120, 'a gap-closer: ' + r.rise.moved + ' px');
  assert.ok(r.rise.hurt > 0, 'the dash or its landing burst burns a hero who stood there: ' + r.rise.hurt);
  /* 5 */
  assert.ok(r.stoke.st && r.stoke.st.open, 'low and far, he STOKES - open: ' + JSON.stringify(r.stoke));
  assert.ok(r.stoke.st.pose === 'stoke' && r.stoke.gained > 5, 'on the hero\'s stoke pose, his meter climbing: ' + JSON.stringify(r.stoke));
  /* 6 */
  assert.equal(r.p2.phase, 2, 'past half, phase two');
  assert.ok(r.p2.on.seq.includes('conflagTell') && r.p2.on.seq.includes('spent'), 'a full meter with his marks down: CONFLAGRATION, told, then SPENT: ' + JSON.stringify(r.p2.on));
  assert.ok(r.p2.on.hurt > 0 && r.p2.on.marksLeft === 0, 'a hero ON a mark is burned and the marks are spent: ' + JSON.stringify(r.p2.on));
  assert.equal(r.p2.off.hurt, 0, 'a hero off the marks is not: ' + JSON.stringify(r.p2.off));
  /* 7 */
  assert.ok(r.hop.stalls >= 3, 'he knows the square\'s stalls: ' + JSON.stringify(r.hop));
  assert.ok(r.hop.up && Math.abs(r.hop.up.y - r.hop.up.stallY) < 2 && r.hop.up.seen.includes('hop'), 'he hops up onto your stall: ' + JSON.stringify(r.hop.up));
  assert.ok(r.hop.down && r.hop.down.y === r.hop.down.floor, 'and comes down to your floor: ' + JSON.stringify(r.hop.down));
  /* 8 */
  const allowed = new Set(['sleep', 'wake', 'stalk', 'cutTell', 'cut', 'cutEnd', 'hopCrouch', 'hop', 'land', 'ward', 'spent', 'chargeTell', 'chargeBigTell', 'loose', 'riseTell', 'rise', 'riseLand', 'stoke', 'winded', 'conflagTell']);
  assert.ok(r.modes.every(m => allowed.has(m)), 'nothing outside the new kit: ' + r.modes.filter(m => !allowed.has(m)));
  for (const m of ['cutTell', 'chargeTell', 'hop']) assert.ok(r.modes.includes(m), 'in forty seconds of it, he ' + m + ': ' + r.modes);
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no page errors');
  console.log('pyro-duel: the new kit holds (staff, ward, stepped fireball, phoenix rise, stoke, marks + conflagration, the hop)');
} finally { pg.close(); }
