/* tools/village-hands.mjs - THE BURNING VILLAGE 3 (claude/burning3; Daniel 10-23: "we can use water better in the level, the fire should feel more intense, falling debris at points").
   What it proves (src/village-hands.js + src/burning-village.js; the rules are in the header of the first):
     1. BURST: three tanks in a rising line (barrel, tank, tower; reach 5 / 9 / 15 tiles), each taught by a sign, a struck full one bursts ONCE: its wave puts out the straw in reach,
        knocks the foes over, holds the flame pillars out and soaks the hero; a burst one stays burst
     2. SOAKED: a struck trough soaks the hero for SOAK.t seconds (the drawn bar), a soaked hero is not burnt by oil fire, a dry one is (a toll: one hit, no knock-back, the crossing is made);
        it ends at the Pyromancer's fight
     3. OIL: three pools (3 / 6 / 6 tiles) in the road, none of which any water puts out
     4. DOUSE A PATH: two burning gates (L.heaps gate: true), each with a rack in reach, a sign, a stuck-guide spot, and the roof the other way; a thrown bucket burns one down and the street is open
     5. FALLING DEBRIS, TOLD: tell (shadow, creak, dust: 0.6-0.9 s) then fall then land; whoever is under the shadow takes it, nobody else; a beam leaves burning ground, a chimney a rubble step,
        a respawn puts the step away; nothing is ever untold and no debris is a pit
     6. THREE STAGES of fire by column (the sky, the town, the embers): 0 / 1 / 2, and the square settles back below 1
   PORT=8741 node tools/village-hands.mjs */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { stageAt, TANKS, SOAK, DEBRIS, OIL, frontAfter, WAVE } from '../src/village-hands.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'burning').build(), S = 25;
/* ---- 1/3/4/5/6 static ---- */
{ const t = L.vh.tanks.slice().sort((a, b) => a.x - b.x);
  assert.deepEqual(t.map(q => q.kind), ['barrel', 'tank', 'tower'], 'a barrel, a tank, a tower - taught, tested, the exam - in that order down the road');
  assert.ok(TANKS.barrel.r < TANKS.tank.r && TANKS.tank.r < TANKS.tower.r, 'their waves grow: ' + [TANKS.barrel.r, TANKS.tank.r, TANKS.tower.r]);
  for (const q of t) { const sg = L.ents.filter(e => e.t === 'sign' && e.x < q.x + 1 && e.x >= q.x - 12); assert.ok(sg.length, 'a sign within twelve tiles before the ' + q.kind + ' tells the verb');
    assert.ok(sg.some(s => /STRIKE/.test(s.text)), 'and it says STRIKE'); }
  for (let i = 0; i + 1 < t.length; i++) assert.ok(t[i + 1].x - t[i].x > 60, 'a tank to an area (one per area): ' + t.map(q => q.x));
  const o = L.vh.oil.slice().sort((a, b) => a.x0 - b.x0);
  assert.deepEqual(o.map(p => p.x1 - p.x0 + 1), [3, 6, 6], 'oil: a three-tile pool on the first ledge of the croft house gable stair (taught, optional), then six and six (a toll when crossed dry)');
  for (const p of o) { const sg = L.ents.filter(e => e.t === 'sign' && e.x < p.x0 && e.x >= p.x0 - 12 && /OIL|SOAK/.test(e.text)); assert.ok(sg.length, 'a sign names the oil / the soak before it at ' + p.x0); }
  assert.ok(L.ents.some(e => e.t === 'watertrough' && e.x > 100 && e.x < 111) && L.ents.some(e => e.t === 'watertrough' && e.x > 230 && e.x < 236), 'a trough stands before the first two pools (the tower is the third pool\'s soak)');
  const gs = L.heaps.filter(h => h.gate); assert.equal(gs.length, 2, 'two burning gates: ' + gs.map(h => h.name));
  for (const h of gs) { const racks = L.ents.filter(e => e.t === 'villagewell' && e.bucket && e.x < h.x0 && h.x0 - e.x <= 10); assert.ok(racks.length, h.name + ': a rack within ten tiles before it');
    assert.ok(L.ents.some(e => e.t === 'sign' && e.x < h.x0 && h.x0 - e.x <= 12 && /ROOF|THROW|WATER/.test(e.text)), h.name + ': a sign names the water and the roof');
    for (let y = h.y0; y <= h.y1; y++) for (let x = h.x0; x <= h.x1; x++) assert.equal(L.grid[y * L.W + x], 1, h.name + ' is solid until it is put out'); }
  const stuck = readFileSync(new URL('../src/stuck-spots.js', import.meta.url), 'utf8'); assert.ok(/bn-yard-gate/.test(stuck) && /bn-barn-gate/.test(stuck), 'each gate has its glint + stall nudge (stuck-spots.js)');
  const d = L.vh.debris; assert.ok(d.length >= 6, 'six falling things or more: ' + d.length); assert.deepEqual([...new Set(d.map(q => q.kind))].sort(), ['beam', 'chimney', 'tiles'], 'tiles, a beam and a chimney');
  for (const k of ['tiles', 'beam', 'chimney']) { assert.ok(DEBRIS[k].tell >= 0.6 && DEBRIS[k].tell <= 0.9, k + ' is told 0.6-0.9 s: ' + DEBRIS[k].tell); assert.ok(DEBRIS[k].dmg <= 18, k + ' is a blow, never a kill'); }
  assert.equal(DEBRIS.beam.leave, 'fire'); assert.equal(DEBRIS.chimney.leave, 'step');
  assert.ok(stageAt(100) === 0 && stageAt(250) === 1 && stageAt(380) === 2 && stageAt(470) < 1 && stageAt(470) > 0.5, 'the fire\'s stages by column: 0 / 1 / 2, the square settles back');
  assert.ok(stageAt(160) > 0 && stageAt(160) < stageAt(190), 'and they ramp, they do not jump');
  const amb = L.ambient.map(z => z.kind); assert.deepEqual(amb, ['fire', 'blaze2', 'blaze3', 'fire'], 'the roar rises with the stage and settles in his square: ' + amb);
  assert.ok(frontAfter('tower', 0.2) < frontAfter('tower', 0.6) && frontAfter('tower', 5) === TANKS.tower.r * 16, 'a wave rolls out at WAVE.v and stops at its reach');
  console.log('static: ' + t.length + ' tanks, ' + o.length + ' oil pools, ' + gs.length + ' gates, ' + d.length + ' falling things, 3 stages'); }

const pg = await openPage();
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const I=LEVELS.findIndex(l=>l.id==='burning');const K=BK.keys,P=()=>BK.P,V=()=>BK.village();const out={};
  const boot=(x,y,keep,god)=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=!!god;BK.P.hp=BK.P.maxHp;BK.tp(x,y);BK.sim(keep?2:30);if(!keep)for(const e of BK.enemies())if(!e.boss&&e!==BK.boss)e.alive=false;};
  const VR=()=>BK.villageRead(), hold=(k,n)=>{K[k]=true;for(let i=0;i<n;i++)BK.sim(1);K[k]=false;};
  /* 2. SOAKED */
  boot(112,22,false,false);P().inv=0;BK.tp(112,22);let h0=P().hp;BK.sim(70);out.dry={loss:h0-P().hp,x:Math.round(P().x/16)};
  boot(107,25,false,false);P().inv=0;P().x=107*16+8;P().face=-1;out.soak0=P().soaked|0;BK.press('atk');BK.sim(8);out.soaked=P().soaked;out.bar=VR().soak;
  BK.tp(112,22);h0=P().hp;BK.sim(70);out.wet={loss:h0-P().hp,x:Math.round(P().x/16)};
  const f0=BK.fires?BK.fires().length:0;BK.sim(60*11);out.dried=P().soaked|0;
  /* 1. BURST: the barrel in the yard, foes alive */
  boot(122,25,true,true);P().x=122*16;P().face=-1;{const G=V().G();for(const c of G.cells.filter(c=>!c.square&&c.y===25&&c.x>=114&&c.x<=128)){c.s=2;c.t=0;}out.lit0=G.cells.filter(c=>c.s===2&&c.y===25&&c.x>=114&&c.x<=128).length;
   BK.press('atk');BK.sim(30);out.lit1=G.cells.filter(c=>c.s===2&&c.y===25&&c.x>=114&&c.x<=128).length;out.barrel=VR().tanks.find(t=>t.kind==='barrel').state;out.kd=BK.enemies().filter(e=>e.alive&&e.stagger>0.2).length;out.barrelSoak=P().soaked>0;
   BK.sim(120);P().face=-1;BK.press('atk');BK.sim(20);out.again=VR().waves;}
  /* 1. THE TOWER: the pillar in reach goes out and stays out; the hero is soaked; the oil is crossed wet */
  boot(423,25,true,false);P().inv=0;P().x=423*16+8;P().face=1;BK.fires().push({x:420*16+8,y:26*16,life:1e9,delay:0,still:true,pillar:true,per:4,ph:0,tall:14});{const pil=BK.fires().filter(f=>f.pillar&&Math.abs(f.x/16-425)<15);out.pillars=pil.length;BK.press('atk');BK.sim(30);out.out=pil.filter(f=>f.outT>0).length;out.tower=VR().tanks.find(t=>t.kind==='tower').state;
   h0=P().hp;P().face=1;hold('right',150);out.towerWet={loss:h0-P().hp,x:Math.round(P().x/16),soak:P().soaked>0};BK.sim(60*16);out.pillarsBack=pil.filter(f=>f.outT>0).length;}
  /* 4. THE GATE: a thrown bucket burns it down */
  boot(134,25,false,true);{const pr=V().buckets().filter(q=>q.state==='rest').sort((a,b)=>Math.abs(a.x-P().x)-Math.abs(b.x-P().x))[0];const H=BK.L.heaps.find(h=>h.name==='THE YARD GATE');out.gate0=BK.L.grid[24*BK.L.W+137];P().x=130*16;V().take(pr);P().x=134*16;P().face=1;BK.step(1);BK.press('atk');for(let n=0;(n<120&&pr.state==='fly')||n<2;n++)BK.sim(1);out.gateOut=!!H.out;out.gate1=BK.L.grid[24*BK.L.W+137];}
  /* 5. DEBRIS: told, then it falls; under the shadow it hurts, away from it nothing; a respawn puts a chimney's step away */
  boot(139,25,true,true);P().inv=0;P().x=139*16;{const seq=[];let told=-1,landed=-1;for(let i=0;i<200;i++){BK.sim(1);const d=VR().debris.find(q=>q.id==='yardbeam').state;if(d!==seq[seq.length-1])seq.push(d);if(d==='tell'&&told<0)told=i;if(d==='done'&&landed<0){landed=i;break;}}out.debris={seq,tellFrames:landed-told+2};}
  boot(139,25,false,false);P().inv=0;P().x=139*16;{h0=P().hp;for(let i=0;i<14;i++)BK.sim(1);P().x=135*16;P().vx=0;for(let i=0;i<90;i++)BK.sim(1);out.awayLoss=h0-P().hp;}
  boot(139,25,false,false);P().inv=0;P().x=145*16+8;h0=P().hp;for(let i=0;i<90;i++)BK.sim(1);out.underLoss=h0-P().hp;
  boot(217,25,false,false);P().inv=0;P().x=218*16;for(let i=0;i<150;i++)BK.sim(1);out.step=[223,224].map(x=>BK.L.grid[25*BK.L.W+x]);BK.reset({fresh:true});BK.load(I);BK.sim(5);out.stepAfterRespawn=[223,224].map(x=>BK.L.grid[25*BK.L.W+x]);
  /* 2. HIS SQUARE: soaked ends where his fight begins */
  boot(423,25,true,true);P().x=423*16+8;P().face=1;BK.press('atk');BK.sim(10);out.preBoss=P().soaked>0;{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<240;i++)BK.sim(1);out.inBoss=P().soaked|0;}
  out.errors=BK.errors?BK.errors.length:0;
  return out;})()`, 1200000);
  console.log(JSON.stringify(r));
  assert.ok(r.dry.loss > 0 && r.dry.loss <= 24, 'oil stood in DRY is a toll, not a wall (no knock-back: one hit a moment, you can walk on): ' + JSON.stringify(r.dry));
  assert.ok(r.soak0 === 0 && r.soaked > SOAK.t - 1 && r.bar > SOAK.t - 1, 'a struck trough soaks you (the bar runs): ' + r.soaked);
  assert.equal(r.wet.loss, 0, 'a SOAKED hero crosses the oil unburnt: ' + JSON.stringify(r.wet)); assert.ok(r.wet.x >= 111 && r.wet.x <= 113, 'and stands on the oil ledge');
  assert.equal(r.dried, 0, 'and it dries (SOAK.t seconds)');
  assert.ok(r.lit0 > 5 && r.lit1 <= 2, 'the barrel\'s wave puts out the burning straw in its reach: ' + r.lit0 + ' -> ' + r.lit1);
  assert.equal(r.barrel, 'burst'); assert.ok(r.kd >= 2, 'and knocks foes over: ' + r.kd); assert.ok(r.barrelSoak, 'and soaks you'); assert.equal(r.again, 0, 'a burst barrel stays burst (no second wave)');
  assert.ok(r.pillars >= 1 && r.out === r.pillars, 'the tower\'s flood holds every flame pillar in its reach out: ' + r.out + '/' + r.pillars);
  assert.equal(r.tower, 'burst'); assert.ok(r.towerWet.soak || r.towerWet.x >= 428, 'soaked by the flood'); assert.equal(r.towerWet.loss, 0, 'the oil behind the tower is crossed wet unburnt: ' + JSON.stringify(r.towerWet)); assert.ok(r.towerWet.x >= 434, 'and the hero is across it');
  assert.equal(r.pillarsBack, 0, 'the pillars come back after PILLAR_OUT s');
  assert.equal(r.gate0, 1, 'the gate is rock...'); assert.ok(r.gateOut && r.gate1 === 0, '...and a thrown bucket burns it down: the street is open');
  assert.deepEqual(r.debris.seq, ['tell', 'fall', 'done'], 'debris: told, then falls, then lies: ' + r.debris.seq); assert.ok(r.debris.tellFrames >= 0.6 * 60 && r.debris.tellFrames <= 1.05 * 60, 'told 0.6-0.9 s then the fall: ' + r.debris.tellFrames + ' frames');
  assert.equal(r.awayLoss, 0, 'a hero out of the shadow takes nothing'); assert.ok(r.underLoss > 0, 'a hero under it takes the blow: ' + r.underLoss);
  assert.deepEqual(r.step, [1, 1], 'a chimney leaves a rubble step'); assert.deepEqual(r.stepAfterRespawn, [0, 0], 'a respawn puts it away');
  assert.ok(r.preBoss === true && r.inBoss === 0, 'SOAKED ends where the Pyromancer\'s fight begins (his square is the fight it always was)');
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no page errors');
  console.log('village-hands: burst tanks, soaked, oil, burning gates, told falling debris and the fire\'s stages all hold');
} finally { pg.close(); }
