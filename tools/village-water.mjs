/* tools/village-water.mjs - THE BURNING VILLAGE, BRIEF 10-07 (claude/burnvillage2; Daniel approved 2026-10-07 20:07). What it proves:
     1. THROW WATER: two throwables on one system (src/throwables.js THROW_KIND + src/carry-throw.js KINDS: the arc told is the arc flown;
        the bucket's plain throw is the one it always had), every rack HIGHLIGHTED (an outline and a glint at rest, the told arc in the hand)
        with a FIRST-USE SIGN at the first rack of each kind; water puts out his fire (a bucket two tiles, a jug one), holds a burning
        bridge, douses a burning goblin, puts out a wisp and a foe alight
     2. THE PYROMANCER IS NEVER INVULNERABLE (B11/B13): a hero's blow lands whole in every mode of his kit outside the told steam ward;
        WATER STUNS HIM - the shared read (B10: BK.bossOpen, the gold read and its bar), x2 - then a TOLD ~3 s STEAM WARD (B3) that turns the
        blade and the water and says so; after it he is whole-hittable and the water stuns again; overheated he still takes x1.5
     3. BURNING BRIDGES ON THE ROUTE, taught then tested: wider than any jump, runnable by the slowest hero inside the fuse, the taught
        one slower and signed, the tested one shorter with a foe over it, water within reach of each
     4. THE TOWN BEHIND BURNS: every building goes roof -> walls -> collapse -> shell (src/village-blaze.js), the front moves east over
        the level's clock, and the page draws it off the level's own clock (more fire in the far town later than at the start, A3: the
        grid's fire is still the rule - the backdrop never lights a cell)
   PORT=8733 node tools/village-water.mjs */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { THROW_KIND } from '../src/throwables.js';
import { KINDS, launchOf } from '../src/carry-throw.js';
import { SPLASH, STUN, WARD, OVER, waterOn, pyroMul, pyroRead } from '../src/village-water.js';
import { BLAZE, FRONT, STAGES, stageOf, blazeAt, igniteAt, frontAt } from '../src/village-blaze.js';
import { BRIDGE } from '../src/burning-village.js';
import { openPage } from './cdp.mjs';

const TS = 16, L = LEVELS.find(l => l.id === 'burning').build(), S = 25, R = 26;
// ---- 1 (static): THE THROWABLES ----
for (const k of ['bucket', 'jug']) {
  assert.ok(THROW_KIND[k] && KINDS[k], k + ': a row in THROW_KIND and in carry-throw KINDS (one system)');
  assert.equal(KINDS[k].g, THROW_KIND[k].g, k + ': the told arc falls as the thrown one does');
  assert.deepEqual(KINDS[k].aims.mid, { vx: THROW_KIND[k].vx, vy: THROW_KIND[k].vy }, k + ': the plain throw (no UP, no DOWN) is the kind\'s own');
  assert.ok(KINDS[k].aims.high.vy < KINDS[k].aims.mid.vy && KINDS[k].aims.low.vx < KINDS[k].aims.mid.vx, k + ': UP lobs, DOWN tosses short');
  assert.ok(SPLASH[k] >= 1, k + ': a splash');
}
assert.deepEqual(launchOf('bucket', { face: -1 }, {}), { vx: -210, vy: -70 }, 'the bucket thrown with nothing held flies as it always did (the boss bot\'s throw is unchanged)');
assert.ok(THROW_KIND.jug.carrySpeed > THROW_KIND.bucket.carrySpeed && SPLASH.jug < SPLASH.bucket, 'the jug is light (nearly a run) and puts out less');
const racks = L.ents.filter(e => e.t === 'villagewell' && e.bucket), signs = L.ents.filter(e => e.t === 'sign');
const kindOf = e => e.kind === 'jug' ? 'jug' : 'bucket';
for (const k of ['bucket', 'jug']) {
  const first = racks.filter(r => kindOf(r) === k).sort((a, b) => a.x - b.x)[0];
  assert.ok(first, 'there is a ' + k + ' rack');
  const sg = signs.find(s => Math.abs(s.x - first.x) <= 4 && Math.abs(s.y - first.y) <= 2 && new RegExp(k.toUpperCase()).test(s.text));
  assert.ok(sg, 'a first-use sign at the first ' + k + ' (' + first.x + '), naming it: ' + signs.filter(s => Math.abs(s.x - first.x) < 12).map(s => s.x + ' ' + s.text).join(' | '));
}
assert.ok(racks.filter(r => kindOf(r) === 'jug').length >= 3, 'jugs on the route and in his square: ' + racks.filter(r => kindOf(r) === 'jug').map(r => r.x).join(' '));
// ---- 3 (static): THE BURNING BRIDGES ----
const bridges = (L.deckBreaks || []).filter(z => z.bridge).sort((a, b) => a.x0 - b.x0);
assert.ok(bridges.length >= 2, 'a couple more burning bridges: ' + bridges.length);
const slow = 92 * 0.9;   /* the paladin's pace, px/s (tools/burning-village.mjs's bar) */
for (const z of bridges) {
  const w = z.x1 - z.x0 + 1;
  assert.equal(z.row, R, 'the bridge at ' + z.x0 + ' is on the street, the route');
  assert.ok(w >= 7, 'the bridge at ' + z.x0 + ' is wider than any jump (the reach model\'s six): ' + w);
  assert.ok(z.onTop && z.regrow && z.beam, 'it is a told burning beam (onTop) that grows back');
  assert.ok(w * TS / slow < z.fuse, 'the slowest hero runs its ' + w + ' tiles inside its ' + z.fuse + ' s fuse (' + (w * TS / slow).toFixed(2) + ' s)');
  for (let x = z.x0; x <= z.x1; x++) assert.equal(L.grid[z.row * L.W + x], T.ONEWAY, 'its timber at ' + x);
  assert.ok(racks.some(r => Math.abs(r.x - z.x0) <= 8 || Math.abs(r.x - z.x1) <= 8), 'water within reach of the bridge at ' + z.x0);
}
const [taught, tested] = bridges;
assert.equal(taught.fuse, BRIDGE.taught); assert.equal(tested.fuse, BRIDGE.tested);
assert.ok(taught.fuse > tested.fuse, 'TAUGHT slow, TESTED shorter: ' + taught.fuse + ' then ' + tested.fuse);
assert.ok(signs.some(s => s.x >= taught.x0 - 8 && s.x < taught.x0 && /BURNING BRIDGE/.test(s.text)), 'the first one is signed where you meet it');
assert.ok(L.ents.some(e => ['emberwisp', 'archer', 'sprig', 'burngob'].includes(e.t) && e.x >= tested.x0 - 1 && e.x <= tested.x1 + 1), 'the tested one is crossed under a foe');
// ---- 2 (pure): HIS WATER ----
assert.equal(waterOn({ mode: 'stalk' }), 'stun'); assert.equal(waterOn({ mode: 'doused' }), 'cool'); assert.equal(waterOn({ mode: 'stalk', ward: 1 }), 'ward'); assert.equal(waterOn({ mode: 'sleep' }), 'wake');
assert.equal(pyroMul({ mode: 'stalk', open: 0 }), 1, 'outside every opening: WHOLE (never invulnerable)');
assert.equal(pyroMul({ mode: 'doused', open: 2 }), STUN.mul); assert.equal(STUN.mul, 2, 'stunned, x2');
assert.equal(pyroMul({ mode: 'overheat', open: 2 }), OVER.mul); assert.equal(pyroMul({ mode: 'stalk', ward: 1 }), 0);
assert.ok(STUN.t >= 2.5 && WARD.t >= 2.5 && WARD.t <= 3.5, 'a stun worth taking, a ward of ~3 s: ' + STUN.t + ' / ' + WARD.t);
assert.equal(pyroRead({ alive: true, mode: 'doused', open: STUN.t }).st, 'stunned');
// ---- 4 (pure): THE BLAZE ----
{ const seen = new Set(); let last = -1;
  for (let t = -20; t < 200; t += 0.5) { const st = stageOf(t).st, i = STAGES.indexOf(st); assert.ok(i >= last, 'a building only goes forward through its fire: ' + st + ' at ' + t); last = i; seen.add(st); }
  assert.deepEqual([...seen], STAGES, 'roof -> walls -> collapse -> shell, every one: ' + [...seen]);
  assert.ok(frontAt(300) > frontAt(0) + 200, 'the front moves across the level over time');
  const far = [], near = [];
  for (let k = 1; k < 200; k++) if (k % FRONT.ahead) { const wx = 30 + k * 4; (wx > 300 ? far : near).push(igniteAt(wx, k)); }
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  assert.ok(mean(far) > mean(near) + 100, 'the fire reaches the far end of the village later: ' + mean(near).toFixed(0) + ' s near, ' + mean(far).toFixed(0) + ' s far');
  assert.equal(blazeAt(480, 1, 0).st, 'unlit', 'the square\'s end of the town is not yet burning at the start');
  assert.ok(['walls', 'collapse', 'shell'].includes(blazeAt(480, 1, 600).st), 'and ten minutes on it is: ' + blazeAt(480, 1, 600).st); }

// ---- THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');const F=await import('/src/fire-spread.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const I=LEVELS.findIndex(l=>l.id==='burning');
  const V=()=>BK.village(),P=()=>BK.P,K=BK.keys;
  const boot=(hero,x,y,keep)=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;if(x!==undefined){BK.tp(x,y);BK.sim(keep?2:30);}if(!keep)for(const e of BK.enemies())if(!e.boss&&e!==BK.boss)e.alive=false;};
  const near=(kind,x)=>V().buckets().filter(q=>q.thrKind===kind&&q.state==='rest').sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];
  /* toss the nearest water of a kind from where the hero stands, facing face, holding up/down */
  const toss=(kind,face,aim)=>{const pr=near(kind,P().x);V().take(pr);P().face=face;K.up=aim==='high';K.down=aim==='low';BK.step(1);const arc=BK.villageWater.arc();BK.press('atk');let n=0;for(;n<150&&pr.state==='fly'||n<2;n++)BK.sim(1);K.up=K.down=false;return {pr,arc,state:pr.state,n};};
  /* 1. HIGHLIGHTED: a resting rack is drawn with its outline and glint; the told arc in the hand */
  {boot('knight',150,25);for(let i=0;i<6;i++)BK.step(1);const jug=near('jug',P().x);out.glint={jug:!!(jug&&jug.glint),kind:jug&&jug.thrKind};
   V().take(jug);for(let i=0;i<4;i++)BK.step(1);out.glint.arcHeld=!!(jug.arc&&jug.arc.land);K.up=true;const hi=BK.villageWater.arc();K.up=false;K.down=true;const lo=BK.villageWater.arc();K.down=false;const mid=BK.villageWater.arc();
   out.glint.arcs={hi:hi&&hi.land&&Math.round(hi.land.x-P().x),mid:mid&&mid.land&&Math.round(mid.land.x-P().x),lo:lo&&lo.land&&Math.round(lo.land.x-P().x)};}
  /* 1. THE SPLASH: a jug puts out one tile either side, a bucket two */
  for(const kind of ['jug','bucket']){boot('knight',114,25);const G=V().G();const cells=G.cells.filter(c=>!c.square&&c.y===25&&c.x>=114&&c.x<=128);
   for(const c of cells){c.s=F.ALIGHT;c.t=0;c.spread=true;}const pr=near(kind,P().x);V().take(pr);P().x=106*16;P().face=1;for(let i=0;i<3;i++)BK.sim(1);
   /* thrown onto the middle of the burning strip */
   pr.state='fly';pr.x=121*16+8;pr.y=26*16-6;pr.vx=1;pr.vy=60;BK.sim(1);const lit=G.cells.filter(c=>!c.square&&c.y===25&&c.x>=114&&c.x<=128&&c.s===F.ALIGHT).length;
   out['splash_'+kind]={was:cells.length,out:cells.length-lit};}
  /* 1. A BURNING BRIDGE watered holds; unwatered it burns through under a hero stood on it */
  {boot('knight',150,25);const z=BK.L.deckBreaks.find(q=>q.bridge);const mid=(z.x0+z.x1)/2;
   BK.tp(Math.round(mid),25);P().vx=0;let down=false;for(let i=0;i<60*3&&!down;i++){P().x=mid*16;P().vx=0;BK.sim(1);down=z.down;}out.bridgeDry={down,fuse:z.fuse};
   boot('knight',150,25);const z2=BK.L.deckBreaks.find(q=>q.bridge);const pr=near('jug',P().x);V().take(pr);pr.state='fly';pr.x=(z2.x0+3)*16;pr.y=z2.row*16-4;pr.vx=1;pr.vy=40;BK.sim(2);
   const wet=z2.wet||0;BK.tp(Math.round((z2.x0+z2.x1)/2),25);let down2=false;for(let i=0;i<60*3&&!down2;i++){P().x=(z2.x0+z2.x1)/2*16;P().vx=0;BK.sim(1);down2=z2.down;}out.bridgeWet={wet:+wet.toFixed(1),down:down2};}
  /* 1. FOES: a burning goblin doused, a wisp put out, a foe alight put out */
  {boot('knight',100,25,true);
   const res={};for(const t of ['burngob','emberwisp','sprig']){const e=BK.enemies().filter(q=>q.alive&&q.t===t).sort((a,b)=>Math.abs(a.x-P().x)-Math.abs(b.x-P().x))[0];if(!e){res[t]='none';continue;}e.alive=true;e.hp=Math.max(e.hp,8);if(t==='sprig'){e.burn=3;}
     for(const c of V().G().cells)if(!c.square){c.s=F.UNLIT;c.t=0;}const pr=near('bucket',P().x)||near('jug',P().x);V().take(pr);pr.state='fly';pr.x=e.x;pr.y=e.y-Math.round(e.h/2);pr.vx=1;pr.vy=0;e.vx=0;for(let i=0;i<12&&pr.state==='fly';i++){if(i){pr.x=e.x;pr.y=e.y-Math.round(e.h/2);pr.vy=0;}BK.sim(1);}res[t]={alive:e.alive,doused:e.doused||0,burn:e.burn||0,pr:pr.state,ex:Math.round(e.x),ey:Math.round(e.y),px:Math.round(pr.x),py:Math.round(pr.y),hp:e.hp};}
   out.foes=res;}
  /* 2. THE PYROMANCER */
  {boot('knight');const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;for(const e of BK.enemies())if(e!==b)e.alive=false;out.bossAlive=b.alive&&BK.bossActive;
   const freeze=()=>{b.cd=99;b.vx=0;};const blow=(n,tag)=>{const h=b.hp;b.readN=0;b.readAt=-99;BKT.hurtAs(tag||'heavy',b,n,b.x-12,false);const d=h-b.hp;b.hp=h;return d;};
   /* NEVER INVULNERABLE: every mode of his kit, outside the ward, takes a hero's blow whole */
   const modes=['stalk','cutTell','cut','cutEnd','bellowsTell','bellows','emberTell','ember','hopCrouch','hop','land','ventTell','vent'];const whole={};
   for(const m of modes){b.mode=m;b.modeT=9;b.open=0;b.ward=0;whole[m]=blow(40);}b.mode='stalk';out.whole=whole;
   out.light=blow(40,'light');
   /* WATER STUNS HIM: thrown from his floor */
   b.mode='stalk';b.heat=40;b.open=0;b.ward=0;b.wetT=0;b.wetSeen=undefined;freeze();P().x=b.x-50;P().y=A.floor;P().vy=0;
   const pr=V().buckets().filter(q=>q.state==='rest'&&q.thrKind==='bucket')[0];V().take(pr);P().face=1;for(let i=0;i<6;i++){P().x=b.x-50;freeze();BK.sim(1);}BK.press('atk');let st=false;for(let i=0;i<60&&!st;i++){P().x=b.x-50;freeze();BK.sim(1);st=b.mode==='doused';}
   for(let i=0;i<2;i++){freeze();BK.step(1);}
   out.stun={mode:b.mode,open:+(b.open||0).toFixed(2),bossOpen:BK.bossOpen(b),read:b.readNow,x2:blow(20,'light'),hint:BKT.hintNow.msg,words:BK.textLab.nums().map(n=>n.txt)};
   /* the stun runs out: THE STEAM WARD, told */
   for(let i=0;i<60*4&&b.mode==='doused';i++){freeze();BK.sim(1);}
   for(let i=0;i<2;i++){freeze();BK.step(1);}
   const words=BK.textLab.nums().map(n=>n.txt);
   const wardBlade=blow(40);const wordsAfter=BK.textLab?BK.textLab.nums().map(n=>n.txt):[];
   /* water in the ward: turned, no stun */
   const pr2=V().buckets().filter(q=>q.state==='rest'&&q.thrKind==='bucket')[0];V().take(pr2);pr2.state='fly';pr2.x=b.x;pr2.y=b.y-12;pr2.vx=1;pr2.vy=10;for(let i=0;i<12&&pr2.state==='fly';i++){if(i){pr2.x=b.x;pr2.y=b.y-12;pr2.vy=10;}freeze();BK.sim(1);}const hit2=pr2.state;
   out.ward={ward:+(b.ward||0).toFixed(2),mode:b.mode,read:b.readNow,told:words,blade:wardBlade,said:wordsAfter,waterMode:b.mode,hit:hit2,bossOpen:BK.bossOpen(b)};
   for(let i=0;i<60*4&&b.ward>0;i++){freeze();BK.sim(1);}
   out.after={ward:b.ward,blow:blow(40)};
   const pr3=V().buckets().filter(q=>q.state==='rest'&&q.thrKind==='bucket')[0];V().take(pr3);pr3.state='fly';pr3.x=b.x;pr3.y=b.y-12;pr3.vx=1;pr3.vy=10;for(let i=0;i<12&&b.mode!=='doused';i++){if(pr3.state==='fly'){pr3.x=b.x;pr3.y=b.y-12;pr3.vy=10;}freeze();BK.sim(1);}out.again=b.mode;
   b.mode='overheat';b.modeT=3;b.open=3;b.ward=0;out.over=blow(20);}
  /* 4. THE TOWN BEHIND BURNS on the level's clock: the far town's fire pixels at the start and later */
  {boot('knight',300,25);const fireAt=t=>{let sum=0;for(let k=0;k<8;k++){BK.villageWater.levelTime(t);for(let i=0;i<5;i++)BK.step(1);sum+=one();}return Math.round(sum/8);};const one=()=>{const c=BK.buf.getContext('2d').getImageData(0,0,320,110).data;let n=0;for(let i=0;i<c.length;i+=4){const r=c[i],g=c[i+1],bb=c[i+2];if(r>200&&g>90&&bb<120)n++;}return n;};
   const t0=fireAt(1),t1=fireAt(330);out.town={t0,t1};}
  return out;})()`, 900000);
  console.log(JSON.stringify(r));
  /* 1 */
  assert.ok(r.glint.jug && r.glint.kind === 'jug', 'a resting jug is drawn highlighted (its outline and glint): ' + JSON.stringify(r.glint));
  assert.ok(r.glint.arcHeld, 'in the hand its told arc is drawn, with where it lands');
  assert.ok(r.glint.arcs.hi > r.glint.arcs.lo && r.glint.arcs.mid > r.glint.arcs.lo, 'UP throws further than DOWN, the plain throw between: ' + JSON.stringify(r.glint.arcs));
  assert.ok(r.splash_jug.out >= 2 && r.splash_jug.out < r.splash_bucket.out, 'a jug puts out a little, a bucket more: ' + JSON.stringify([r.splash_jug, r.splash_bucket]));
  assert.ok(r.bridgeDry.down, 'a burning bridge stood on burns through: ' + JSON.stringify(r.bridgeDry));
  assert.ok(r.bridgeWet.wet > 0 && !r.bridgeWet.down, 'watered, it holds: ' + JSON.stringify(r.bridgeWet));
  if (r.foes.burngob !== 'none') assert.ok(r.foes.burngob.doused > 0, 'a burning goblin is doused: ' + JSON.stringify(r.foes));
  if (r.foes.emberwisp !== 'none') assert.ok(!r.foes.emberwisp.alive, 'a wisp is put out: ' + JSON.stringify(r.foes));
  if (r.foes.sprig !== 'none') assert.equal(r.foes.sprig.burn, 0, 'a foe alight is put out: ' + JSON.stringify(r.foes));
  assert.ok(Object.values(r.foes).filter(v => v !== 'none').length >= 2, 'the foes were there to douse: ' + JSON.stringify(r.foes));
  /* 2 */
  assert.ok(r.bossAlive, 'his fight is on');
  for (const [m, d] of Object.entries(r.whole)) assert.ok(d >= 36, 'NEVER INVULNERABLE: in ' + m + ' a heavy blow of 40 lands whole (took ' + d + ')');
  assert.ok(r.light >= 36, 'and a light one (the first of a run) lands whole: ' + r.light);
  assert.equal(r.stun.mode, 'doused', 'a thrown bucket STUNS him: ' + JSON.stringify(r.stun));
  assert.ok(r.stun.open >= STUN.t - 0.3 && r.stun.bossOpen === true && r.stun.read === 'stunned', 'the shared read (B10): open, the gold ring and its bar: ' + JSON.stringify(r.stun));
  assert.ok(r.stun.x2 >= 38, 'stunned, a blow of 20 lands double: ' + r.stun.x2);
  assert.ok(/STUN/.test(r.stun.hint) && r.stun.words.includes('STUNNED'), 'and it is said, over him and in the hint box: ' + JSON.stringify([r.stun.hint, r.stun.words]));
  assert.ok(r.ward.ward >= WARD.t - 0.4 && r.ward.read === 'ward', 'the stun over, the STEAM WARD is up (B3): ' + JSON.stringify(r.ward));
  assert.ok(r.ward.told.includes('STEAM WARD'), 'TOLD as it rises (the word over him, the pale shell and its bar): ' + r.ward.told);
  assert.equal(r.ward.blade, 0, 'a blade in the ward takes nothing...');
  assert.ok(r.ward.said.includes('WARDED'), '...and says so (B10: a turned blow is never silent): ' + r.ward.said);
  assert.ok(r.ward.hit === 'return' && r.ward.waterMode !== 'doused' && r.ward.bossOpen === false, 'water in the ward is turned: no stun, no lock: ' + JSON.stringify(r.ward));
  assert.ok(!r.after.ward && r.after.blow >= 36, 'the ward over, a blow lands whole again: ' + JSON.stringify(r.after));
  assert.equal(r.again, 'doused', 'and water stuns him again');
  assert.ok(r.over >= 28 && r.over <= 32, 'overheated (his own opening) he takes x1.5: ' + r.over);
  /* 4 */
  assert.ok(r.town.t1 > r.town.t0 + 40, 'the town behind burns on the level\'s clock - the far town is alight five and a half minutes on, not at the start: ' + JSON.stringify(r.town));
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no page errors');
  console.log('village-water: the water, the stun and its ward, the bridges and the burning town all hold');
} finally { pg.close(); }
