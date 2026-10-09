/* tools/pyro-duel.mjs — THE PYROMANCER AS A MIRROR DUEL (Daniel, 2026-09-28: "the Pyromancer boss should be a tad harder and
   play more like a duel where they jump on platforms and use their regular/heavy attacks").
     1. THE MIRROR   he fights with the Pyromancer hero's own run of three staff cuts and her own held blow (THE BELLOWS), on the
                     hero's own frames (attack-animation.js's attackPose over her baked kit), with ONE of her fire spells (the
                     ember) - the jet, the cinder step, the fire wall and the wisp are gone - and he HOPS between the square's
                     stalls to meet you on your own floor
     2. HE READS YOU  the third light blow in a row is turned; a heavy still goes through
     3. THE BUCKET    a thrown water bucket that hits him douses his flames (his heat to nothing) and STUNS him OPEN - and a
                     second one inside the stun does not lengthen it; the stun over, his told STEAM WARD (claude/burnvillage2,
                     Daniel 10-07, design standard B3) turns the next water outright (no lock); a rack is always in reach of every
                     tile of his square, and one stands off the burning floor, on a stall
     4. A TAD HARDER  ~15% more health than the 510 he had; every blow told (the marks table: a yellow ! over the cuts and the
                     ember, a red !! over the Bellows and the vent), and a cut that lands ends his run - no second blow into a
                     hero still reeling from the first
   Red on the old boss (claude/throwables 02b2a64): proved in a throwaway worktree before the duel was built. */
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { MARK } from '../src/marks.js';
import { readFileSync } from 'fs';
import { openPage } from './cdp.mjs';

const TS = 16;
// ---- 3 (static): THE RACKS ----
{ const L = LEVELS.find(l => l.id === 'burning').build(), A = L.arena, F = A.floor / TS;
  const racks = L.ents.filter(e => e.t === 'villagewell' && e.bucket && e.x * TS >= A.x0 - 4 * TS && e.x * TS <= A.x1 + 4 * TS);
  const floorR = racks.filter(r => r.y === F - 1), stallR = racks.filter(r => r.y < F - 2);
  assert.ok(floorR.length >= 2, 'a rack at each end of his square: ' + racks.map(r => r.x + ',' + r.y).join(' '));
  assert.ok(stallR.length >= 1, 'and one off the burning floor, on a stall: ' + racks.map(r => r.x + ',' + r.y).join(' '));
  let worst = 0; for (let x = A.x0 / TS; x < A.x1 / TS; x++) worst = Math.max(worst, Math.min(...racks.map(r => Math.abs(r.x - x))));
  assert.ok(worst <= 12, 'no tile of his square is more than 12 tiles from a rack: ' + worst);
  console.log('racks in his square: ' + racks.map(r => (r.kind || 'well') + '@' + r.x + ',' + r.y).join(' ') + ' (worst tile ' + worst + ' from one)');
}
// ---- 4 (static): THE MARKS ----
assert.equal(MARK['pyromancer|cutTell'], '!', 'his staff cuts are told with a yellow !');
assert.equal(MARK['pyromancer|bellowsTell'], '!!', 'THE BELLOWS goes through a guard: a red !!');
assert.equal(MARK['pyromancer|emberTell'], '!', 'his one spell, the ember, a yellow !');
for (const gone of ['jetTell', 'stepTell', 'wallTell', 'wispTell', 'staffTell']) assert.ok(!('pyromancer|' + gone in MARK), 'no ' + gone + ' left in his kit');

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const I=LEVELS.findIndex(l=>l.id==='burning');
  const boot=hero=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;for(const e of BK.enemies())if(e!==b)e.alive=false;return b;};
  const K=BK.keys,P=()=>BK.P,D=BK.pyroDuel&&BK.pyroDuel.D;
  const hold=(b,x)=>{P().x=x;P().vx=0;P().face=Math.sign(b.x-x)||1;};
  /* 4. A TAD HARDER */
  {const b=boot();out.hp={max:b.maxHp,hp:b.hp};}
  /* 1. THE MIRROR: a run of three cuts on her own frames, the third heavier, each told */
  {const b=boot('knight');const A=BK.L.arena;b.x=(A.x0+A.x1)/2;b.y=A.floor;b.mode='stalk';b.cd=0;b.heat=0;b.calmT=0;b.readN=0;b.turn=0;   /* (an odd turn: a shield up on an even one draws the Bellows instead) */
   const seq=[],poses=new Set(),tellPose=new Set();let last=null;K.block=true;
   for(let i=0;i<240;i++){hold(b,b.x-28);BK.sim(1);if(b.mode!==last){seq.push(b.mode);last=b.mode;}
     if(BK.pyroDuel){const p=BK.pyroDuel.pose(b);if(b.mode==='cut')poses.add(p[0]+p[1]);if(b.mode==='cutTell')tellPose.add(p[0]+p[1]);}
     if(seq.filter(m=>m==='cut').length>=3&&b.mode!=='cut')break;}
   K.block=false;out.combo={seq,cuts:seq.filter(m=>m==='cut').length,poses:[...poses],tellPose:[...tellPose],reach:D&&D.reach};}
  /* 4. NO STUN-LOCK: a cut that lands ends his run */
  {const b=boot('pyro');BK.god=false;const A=BK.L.arena;b.x=(A.x0+A.x1)/2;b.y=A.floor;b.mode='stalk';b.cd=0;b.heat=0;b.calmT=0;b.readN=0;
   let hits=0,hp=P().hp,seq=[],last=null,started=false;
   for(let i=0;i<300;i++){hold(b,b.x-26);P().inv=0;BK.sim(1);if(P().hp<hp)hits++;hp=P().hp;P().hp=P().maxHp;hp=P().hp;if(b.mode!==last){seq.push(b.mode);last=b.mode;}if(b.mode==='cutTell')started=true;if(started&&b.mode==='stalk')break;}
   BK.god=true;out.lock={hits,seq};}
  /* 1. THE BELLOWS: her held blow, told red, and a raised shield does not turn it */
  {const b=boot('knight');BK.god=false;const A=BK.L.arena;b.x=(A.x0+A.x1)/2;b.y=A.floor;b.mode='bellowsTell';b.modeT=D?D.bellowsTell:0.6;b.cd=99;b.heat=0;
   K.block=true;const hp0=P().hp;let pose=null;for(let i=0;i<90;i++){hold(b,b.x-54);if(BK.pyroDuel&&b.mode==='bellows'&&!pose)pose=BK.pyroDuel.pose(b);BK.sim(1);}K.block=false;BK.god=true;
   out.bellows={lost:hp0-P().hp,pose};}
  /* 1. HE HOPS TO YOUR STALL, and back down to your floor */
  {const b=boot('knight');const A=BK.L.arena,st=BK.pyroDuel?BK.pyroDuel.stalls(b):[];const s=st.slice().sort((p,q)=>Math.abs((p.l+p.r)/2-(A.x0+A.x1)/2)-Math.abs((q.l+q.r)/2-(A.x0+A.x1)/2))[0];
   const res={stalls:st.length};
   if(s){P().x=(s.l+s.r)/2;P().y=s.y;P().vy=0;b.x=(s.l+s.r)/2+110;b.y=A.floor;b.mode='stalk';b.cd=0;b.heat=0;b.calmT=0;const seen=new Set();
     for(let i=0;i<240&&!(b.onGround&&Math.abs(b.y-s.y)<2&&b.mode!=='hop');i++){P().x=(s.l+s.r)/2;P().y=s.y;P().vy=0;P().vx=0;BK.sim(1);seen.add(b.mode);}
     res.up={y:b.y,stallY:s.y,seen:[...seen]};
     b.mode='stalk';b.cd=0;const fx=b.x+(b.x<(A.x0+A.x1)/2?150:-150);
     for(let i=0;i<240&&!(b.onGround&&b.y===A.floor&&b.mode!=='hop');i++){P().x=fx;P().y=A.floor;P().vy=0;P().vx=0;BK.sim(1);}res.down={y:b.y,floor:A.floor};}
   out.hop=res;}
  /* 2. HE READS YOU: two light blows land, the third is turned; a heavy still goes through */
  {const b=boot('knight');const A=BK.L.arena;b.x=(A.x0+A.x1)/2;b.y=A.floor;b.mode='sleep';b.cd=99;b.heat=0;b.open=0;
   const swing=()=>{const h=b.hp;hold(b,b.x-22);BK.press('atk');for(let i=0;i<24;i++){hold(b,b.x-22);P().st=P().maxSt;BK.sim(1);}return h-b.hp;};
   const light=[swing(),swing(),swing()];BK.sim(150);
   swing();swing();const h=b.hp;K.atk=true;for(let i=0;i<70;i++){hold(b,b.x-22);P().st=P().maxSt;BK.sim(1);}K.atk=false;for(let i=0;i<40;i++){hold(b,b.x-22);BK.sim(1);}
   out.read={light,heavy:h-b.hp};}
  /* 3. THE BUCKET: thrown at him through his own burning floor, it douses him and he is open; a second, while he is wet, is no lock */
  {const b=boot('knight');const A=BK.L.arena,V=BK.village();b.x=(A.x0+A.x1)/2;b.y=A.floor;b.mode='stalk';b.cd=99;b.heat=60;b.calmT=0;b.open=0;
   for(const c of V.G().cells)if(c.square&&c.x*16>b.x-60&&c.x*16<b.x){c.s=2;c.t=0;}   /* the floor between you burning: the water still finds HIM */
   const toss=()=>{const pr=V.buckets().filter(q=>q.state==='rest')[0];hold(b,b.x-40);V.take(pr);for(let i=0;i<6;i++){hold(b,b.x-40);b.cd=99;BK.sim(1);}BK.press('atk');let hit=false;for(let i=0;i<40&&!hit;i++){hold(b,b.x-40);b.cd=99;BK.sim(1);hit=b.mode==='doused'||pr.state==='return';}for(let i=0;i<3;i++){hold(b,b.x-40);b.cd=99;BK.sim(1);}return pr;};
   toss();const first={mode:b.mode,open:+(b.open||0).toFixed(2),heat:Math.round(b.heat)};
   BK.sim(20);const o1=b.open;toss();const second={mode:b.mode,open:+(b.open||0).toFixed(2),grew:(b.open||0)>o1+0.01};
   for(let i=0;i<400&&b.mode==='doused';i++){b.cd=99;BK.sim(1);}const after={mode:b.mode,open:+(b.open||0).toFixed(2),wet:+(b.wetT||0).toFixed(2),ward:+(b.ward||0).toFixed(2)};
   b.heat=50;toss();const wet={mode:b.mode,open:+(b.open||0).toFixed(2),heat:Math.round(b.heat),ward:+(b.ward||0).toFixed(2)};
   for(let i=0;i<60*12;i++){b.cd=99;BK.sim(1);}b.heat=50;b.mode='stalk';toss();const dry={mode:b.mode,open:+(b.open||0).toFixed(2)};
   out.bucket={first,second,after,wet,dry};}
  /* 1. ONE SPELL: forty seconds of the fight with the hero put all over the square, and only the duel's own modes come up */
  {const b=boot('knight');const A=BK.L.arena,st=BK.pyroDuel?BK.pyroDuel.stalls(b):[];const seen={};const spots=[[A.x0+40,A.floor],[A.x1-40,A.floor],[(A.x0+A.x1)/2,A.floor]].concat(st.map(s=>[(s.l+s.r)/2,s.y]));
   for(let i=0;i<60*40;i++){if(i%150===0){const s=spots[(i/150)%spots.length];P().x=s[0];P().y=s[1];P().vy=0;K.block=(i/150)%2===1;}b.hp=b.maxHp;seen[b.mode]=(seen[b.mode]||0)+1;BK.sim(1);}
   K.block=false;out.modes=Object.keys(seen);}
  return out;})()`, 600000);
  console.log(JSON.stringify(r));
  const WAS = 510, ehpLine = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').split('\n').find(l => l.startsWith('const EHP = {')) || '';
  const ehp = +((ehpLine.match(/\bpyromancer: *(\d+)/) || [])[1]);
  /* (claude/burnvillage2, Daniel 10-07: he takes WHOLE blows now - FULL_DAMAGE, no quarter chip - so his health was measured again at campaign level,
     human+dry, 12 seeds a hero: 1225 = knight 7/12, warden 9/12, pyro 4/12, 56%. Was: 'about 15% more than the ' + WAS + ' he had', 587) */
  const NOW = 1225;
  assert.equal(ehp, NOW, 'his health is the measured ' + NOW + ': ' + ehp);
  assert.ok(r.hp.max > NOW * 0.95 && r.hp.max <= NOW * 1.05, 'and it is the health he fights with in the square: ' + r.hp.max);
  /* 1 */
  assert.equal(r.combo.cuts, 3, 'a run of three cuts, told one by one: ' + r.combo.seq.join(' > '));
  assert.ok(r.combo.seq.filter(m => m === 'cutTell').length === 3, 'every cut of the run has its own tell: ' + r.combo.seq.join(' > '));
  assert.ok(r.combo.poses.some(p => p.startsWith('atk')) && r.combo.poses.some(p => p.startsWith('atkB')), 'on her own frames, the thrust and the run\'s second cut: ' + r.combo.poses);
  assert.ok(r.combo.tellPose.every(p => /^atkB?0$/.test(p)), 'each tell is her drawn-back staff: ' + r.combo.tellPose);
  assert.ok(r.bellows.lost > 0, 'THE BELLOWS goes through a raised shield: ' + JSON.stringify(r.bellows));
  assert.ok(r.bellows.pose && r.bellows.pose[0] === 'heavy', 'and it is her own held blow on the screen: ' + JSON.stringify(r.bellows.pose));
  assert.ok(r.hop.stalls >= 3, 'he knows the square\'s stalls: ' + JSON.stringify(r.hop));
  assert.ok(r.hop.up && Math.abs(r.hop.up.y - r.hop.up.stallY) < 2 && r.hop.up.seen.includes('hop'), 'he hops up onto your stall: ' + JSON.stringify(r.hop.up));
  assert.ok(r.hop.down && r.hop.down.y === r.hop.down.floor, 'and comes down to your floor: ' + JSON.stringify(r.hop.down));
  const allowed = new Set(['sleep', 'wake', 'stalk', 'cutTell', 'cut', 'cutEnd', 'bellowsTell', 'bellows', 'emberTell', 'ember', 'hopCrouch', 'hop', 'land', 'overheat', 'ventTell', 'vent', 'doused']);
  assert.ok(r.modes.every(m => allowed.has(m)), 'nothing outside the duel\'s kit: ' + r.modes.filter(m => !allowed.has(m)));
  for (const m of ['cutTell', 'bellowsTell', 'emberTell', 'hop']) assert.ok(r.modes.includes(m), 'in forty seconds of it, he ' + m + ': ' + r.modes);
  /* 2 */
  assert.ok(r.read.light[0] > 0 && r.read.light[1] > 0, 'the first two light blows land: ' + r.read.light);
  assert.equal(r.read.light[2], 0, 'the third in a row is turned: ' + r.read.light);
  assert.ok(r.read.heavy > 0, 'a heavy still goes through: ' + JSON.stringify(r.read));
  /* 3 */
  assert.equal(r.bucket.first.mode, 'doused', 'a thrown bucket douses him, even across his own burning floor: ' + JSON.stringify(r.bucket));
  assert.ok(r.bucket.first.open >= 2.5 && r.bucket.first.heat === 0, 'his flames out and he is OPEN: ' + JSON.stringify(r.bucket.first));
  assert.ok(!r.bucket.second.grew, 'a second bucket inside the first stagger does not lengthen it: ' + JSON.stringify(r.bucket.second));
  assert.equal(r.bucket.after.mode, 'stalk', 'and he fights again when it is over: ' + JSON.stringify(r.bucket.after));
  assert.ok(r.bucket.after.ward >= 2.5, 'the stun over, his STEAM WARD is up, told (claude/burnvillage2, B3): ' + JSON.stringify(r.bucket.after));
  assert.ok(r.bucket.wet.mode !== 'doused' && r.bucket.wet.open === 0 && r.bucket.wet.ward > 0, 'in his ward a bucket is turned and staggers nothing - no lock: ' + JSON.stringify(r.bucket.wet));
  assert.equal(r.bucket.dry.mode, 'doused', 'dried out, the bucket opens him again: ' + JSON.stringify(r.bucket.dry));
  /* 4 */
  assert.equal(r.lock.hits, 1, 'a cut that lands ends his run - one blow, never a chain into a reeling hero: ' + JSON.stringify(r.lock));
  assert.ok(r.lock.seq.includes('cutEnd'), 'he steps out of it: ' + r.lock.seq.join(' > '));
  assert.deepEqual(pg.errors.slice(0, 3), [], 'no page errors');
  console.log('pyro-duel: all green');
} finally { pg.close(); }
