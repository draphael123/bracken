// tools/queen-court.mjs — THE GOBLIN QUEEN HOLDS COURT, AND YOU BRING HER HALL DOWN ON HER (Daniel, 2026-09-29: "she's basically the Ram
// Lord - just ramming into walls"; docs/briefs/goblin-queen-court.md). It replaces the retired queen-pillars check (her charge into a pillar). In the page:
//   chain     no charge anywhere in her: updateGQueen never enters chargeTell, charge or dazed, and forty seconds of each round never shows one
//   quake     her leap is told (a red !! row, answered JUMP, HEIGHT low, her shadow on e.tx through the tell and the flight) and its landing is
//             a quake: a hero standing beside it is hurt, the same hero in the air is not
//   court     round one: she leaps to hold court BESIDE a standing pillar (the far side from the hero) and points for the hold
//   pillar    three blows crack it (blows 1, 2, then tottering for the grace), it falls TOWARD HER and she is PINNED by 'pillar' - for every hero;
//             a blow on the pillar counts even with her body over it (her plate never eats it); broken with her elsewhere it is wasted: rubble
//             that is drawn floor, and no pin
//   plate     round two: the pillars stay down; her plate bar (GQC.plate) is chipped ONLY by a chandelier on her (2) or a blow while she points
//             (her back, or heavy) (1); a blow while she stands, from front or back, chips nothing and does nothing
//   shatter   when it empties she is open for the rest of the round: every blow lands; plate off, her leaps come AT you
//   roof      round three: her pillars stand again, her plate is whole, and her shadow step still comes first
//   lab       the boss-lab hands (src/lab.js) pin her under a pillar in round one within ninety seconds, with the knight
// PROVED RED FIRST (2026-09-29) on d78b15e (batch46): she charged, nothing here existed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';

const SRC = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const fnAt = SRC.indexOf('function updateGQueen('), fnBody = fnAt < 0 ? '' : SRC.slice(fnAt, SRC.indexOf('\nconst rocOpen', fnAt));
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');const lv=LEVELS.findIndex(l=>l.id==='crown');const res={};
    const setup=(h)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.load(lv);BK.state='play';BK.god=false;BK.sim(5);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<260;i++){BK.P.hp=BK.P.maxHp;BK.P.inv=9;BK.sim(1);}
      const q=BK.enemies().find(e=>e.t==='gqueen'&&e.alive);return {A,q};};
    const pillars=()=>BK.props().filter(p=>p.t==='qpillar').sort((a,b)=>a.x-b.x);
    const hold=(px)=>{BK.P.x=px;BK.P.vx=0;BK.P.hp=BK.P.maxHp;BK.P.inv=9;};
    /* only the one attack asked about is ready: every other cooldown held */
    const only=(q,keep)=>{q.slamT=q.sweepT=q.chandT=q.decreeT=q.throwT2=q.gLeapT=q.shadowT=q.courtT=q.hLeapT=99;for(const k of keep)q[k]=0;q.mode='stand';q.modeT=0;q.vx=0;};
    /* a real swing at the pillar from the hero's side, face on, until it counts */
    const blow=(p,side)=>{const n0=p.blows||0;for(let i=0;i<40&&(p.blows||0)===n0&&!(p.totter>0);i++){hold(p.x-side*15);BK.P.face=side;BK.P.y=BK.L.arena.floor;if(BK.P.atk<0&&i%2===0)BK.press('atk');BK.sim(1);}res.lastTotter=+(p.totter||0).toFixed(2);for(let i=0;i<24;i++){hold(p.x-side*15);BK.sim(1);}return p.blows||0;};
    /* her in court beside p, the hero on the other side */
    const courtBy=(q,p,side)=>{BK.P.x=p.x-side*15;BK.P.y=BK.L.arena.floor;only(q,['courtT']);q.x=p.x-side*140;q.y=BK.L.arena.floor;let seen=null;
      for(let i=0;i<180&&q.mode!=='point';i++){hold(p.x-side*15);if(q.mode==='hallLeapTell'&&!seen)seen={tx:Math.round(q.tx-p.x),courtP:q.courtP===p};BK.sim(1);}return seen;};
    const modes=new Set();
    /* ---- round one ---- */
    { const {A,q}=setup('knight');const ps=pillars();res.pillars=ps.length;if(ps.length<3)return res;
      /* the leap and its quake: a hero standing by her landing is hurt, one in the air is not */
      BK.god=false;only(q,['hLeapT']);q.x=A.x0+120;q.y=A.floor;BK.P.x=A.x0+300;BK.P.y=A.floor;let told=null;
      for(let i=0;i<60&&q.mode!=='hallLeap';i++){hold(A.x0+300);BK.P.inv=0;if(q.mode==='hallLeapTell'&&!told)told={tx:q.tx};BK.sim(1);}
      res.leap={told,tx:told&&Math.round(told.tx)};let hurtStand=0;const tx=q.tx;
      for(let i=0;i<90&&q.mode!=='quake';i++){BK.P.x=tx+30;BK.P.vx=0;BK.P.inv=0;BK.P.hp=BK.P.maxHp;BK.sim(1);if(BK.P.hp<BK.P.maxHp)hurtStand=1;}
      res.leap.standHurt=hurtStand||(BK.P.hp<BK.P.maxHp);res.leap.landed=q.mode;
      /* the first quake's two waves (royal, 1.4 s) are still running the hall: let them die with the hero shielded, or one that rolls over the second test's hero reads as the quake hurting a jumper (it flaked whenever her second landing fell on the far side of the first) */
      only(q,[]);for(let i=0;i<100;i++){hold(A.x0+300);BK.sim(1);}
      only(q,['hLeapT']);q.x=A.x0+120;BK.P.x=A.x0+300;for(let i=0;i<60&&q.mode!=='hallLeap';i++){hold(A.x0+300);BK.P.inv=0;BK.sim(1);}
      let air=0,hurtAir=0;const tx2=q.tx;for(let i=0;i<90&&q.mode!=='quake';i++){BK.P.x=tx2+30;BK.P.vx=0;BK.P.inv=0;BK.P.hp=BK.P.maxHp;if(q.modeT-0.8<0.2&&BK.P.ground&&!air){BK.press('jump');BK.keys.jump=true;air=1;}BK.sim(1);if(BK.P.hp<BK.P.maxHp)hurtAir=1;}
      for(let i=0;i<30;i++){BK.P.hp=BK.P.maxHp;BK.P.inv=9;BK.sim(1);}BK.keys.jump=false;res.leap.airHurt=hurtAir;
      /* court beside the middle pillar, the hero left of it: three blows, the crack, the totter, the fall, the pin */
      const p=ps[1];BK.P.hp=BK.P.maxHp;const seen=courtBy(q,p,1);res.court={seen,mode:q.mode,dx:Math.round(q.x-p.x),holdT:+q.modeT.toFixed(2),faceAway:q.face===Math.sign(q.x-BK.P.x)};
      const hp0=q.hp;res.blows=[blow(p,1),blow(p,1)];res.tookFromBlows=hp0-q.hp;const b3=blow(p,1);res.blows.push(b3);res.totter=res.lastTotter;res.brokeAt3=!!p.broken;
      let pinned=false,fellAt=0;for(let i=0;i<200&&!pinned;i++){hold(p.x-15);BK.sim(1);if(p.broken&&!fellAt)fellAt=i;if(q.mode==='pinned')pinned=true;}
      res.fall={fellAfter:+((fellAt+24)/60).toFixed(2),   /* (from the third blow: blow() stands 24 frames after it) */pinned,by:q.pinBy,dir:p.fallDir,toward:p.fallDir===Math.sign(q.x-p.x),modeT:+q.modeT.toFixed(2),took:hp0-q.hp,want:Math.round(q.maxHp*0.07)};
      /* the plate never eats a blow on the pillar: her body over the pillar, the hero's swing on both */
      for(let i=0;i<300&&q.mode==='pinned';i++){hold(A.x0+30);BK.sim(1);}
      const p2=ps[0];only(q,[]);q.mode='rec';q.modeT=9;q.x=p2.x+12;q.y=A.floor;const h1=q.hp;const n1=blow(p2,1);res.overlap={blows:n1,tookHer:h1-q.hp};
      /* broken while she is elsewhere: wasted - rubble, and no pin */
      const p3=ps[2];q.x=A.x0+30;q.mode='rec';q.modeT=99;blow(p3,1);blow(p3,1);blow(p3,1);for(let i=0;i<200&&!(p3.broken&&p3.fallT<=0);i++){hold(p3.x-15);q.mode='rec';q.modeT=99;BK.sim(1);}
      const W=BK.L.W,G=BK.L.grid,S=BK.tileSpr(),ty=Math.floor(p3.y/16)-1,cx=Math.floor(p3.x/16);
      res.wasted={broken:p3.broken,mode:q.mode,rubble:[-1,0,1].map(dd=>G[ty*W+cx+dd]===T.ONEWAY&&!!S[ty*W+cx+dd])};
      /* round two: the pillars stay down (none stands again), the plate bar is full */
      const before=pillars().filter(pp=>!pp.broken).length;q.mode='stand';q.modeT=5;q.hp=Math.floor(q.maxHp*0.64);BK.P.x=A.x0+30;for(let i=0;i<5;i++)BK.sim(1);
      res.round2={phase:q.phase,plate:q.plate,standing:pillars().filter(pp=>!pp.broken).length,before};
      /* what does NOT chip it: a blow while she stands, from her front and from her back */
      only(q,[]);q.mode='rec';q.modeT=9;q.x=A.x0+200;q.face=1;BK.P.x=q.x+40;const hpS=q.hp;BK.combat2().strike(q,'light',20);BK.P.x=q.x-40;BK.combat2().strike(q,'heavy',20);
      res.standChip={plate:q.plate,took:hpS-q.hp};
      /* a blow to her back while she points: one piece; a heavy one from her front while she points: one piece */
      only(q,[]);q.mode='point';q.modeT=9;q.volleyT=9;BK.P.x=q.x-40;BK.sim(1);q.chipCd=0;const f1=q.face;BK.combat2().strike(q,'light',20);const a1=q.plate;
      q.chipCd=0;q.face=-Math.sign(q.x-BK.P.x);BK.P.x=q.x+40;q.face=1;BK.combat2().strike(q,'heavy',20);const a2=q.plate;res.pointChip={faceAway:f1===Math.sign(q.x-(q.x-40)),back:a1,heavy:a2,took:hpS-q.hp};
      /* a chandelier on her: pinned, and two pieces */
      const c=BK.props().filter(pp=>pp.t==='weight'&&pp.gq&&pp.state==='hang').sort((a,b)=>a.x-b.x)[1];only(q,[]);q.mode='rec';q.modeT=9;q.x=c.x;BK.P.x=c.x-120;c.state='fall';c.fy=c.y+c.len;c.vy=0;
      for(let i=0;i<90&&q.mode!=='pinned';i++){hold(c.x-120);q.x=c.x;BK.sim(1);}res.chand={mode:q.mode,plate:q.plate};
      for(let i=0;i<300&&q.mode==='pinned';i++){hold(A.x0+30);BK.sim(1);}
      /* the last pieces: SHATTER, and every blow lands */
      only(q,[]);q.mode='point';q.modeT=9;q.volleyT=9;q.x=A.x0+220;BK.P.x=q.x-40;BK.sim(1);let n=0;while(q.plate>0&&n<10){q.chipCd=0;BK.combat2().strike(q,'light',20);n++;}
      res.shatter={plateOff:!!q.plateOff,shards:BK.gqShards?BK.gqShards().length:-1,open:BK.bossOpen(q)};
      only(q,[]);q.mode='rec';q.modeT=9;BK.P.x=q.x+40;q.face=-1;const hpO=q.hp;BK.combat2().strike(q,'light',20);res.shatter.front=hpO-q.hp;
      /* plate off, her leap comes AT you */
      only(q,['hLeapT']);BK.P.x=q.x+160;for(let i=0;i<30&&q.mode!=='hallLeapTell';i++){hold(q.x+160);BK.sim(1);}res.shatter.leapAt=q.mode==='hallLeapTell'?Math.round(q.tx-BK.P.x):null;
      /* round three: the pillars stand again, the plate is whole, and the shadow step comes first */
      for(let i=0;i<60;i++){hold(A.x0+30);BK.sim(1);}only(q,[]);q.mode='stand';q.modeT=5;q.hp=Math.floor(q.maxHp*0.3);for(let i=0;i<5;i++){hold(A.x0+30);BK.sim(1);}
      res.round3={phase:q.phase,standing:pillars().filter(pp=>!pp.broken).length,open:BK.bossOpen(q)};
      only(q,['shadowT','courtT']);q.x=A.x0+300;BK.P.x=A.x0+100;for(let i=0;i<10&&q.mode==='stand';i++){hold(A.x0+100);BK.sim(1);}res.round3.first=q.mode;
      const hpR=q.hp;q.mode='rec';q.modeT=9;BK.combat2().strike(q,'light',20);res.round3.took=hpR-q.hp; }
    /* no charge in any round: each round run by itself for forty seconds with the hero standing about */
    for(const ph of [1,2,3]){const {A,q}=setup('knight');BK.god=true;q.hp=Math.floor(q.maxHp*(ph===1?1:ph===2?0.6:0.3));q.mode='stand';q.modeT=0.5;
      for(let i=0;i<2400;i++){const t=i/60;hold(A.x0+80+((t*37)%500));BK.sim(1);modes.add(q.mode);}}
    res.modes=[...modes];
    /* every hero: court beside the middle pillar, three blows, pinned */
    res.every={};for(const h of ['knight','warden','geomancer','pyro','paladin','pirate','reaper']){const {q}=setup(h);BK.god=false;const p=pillars()[1];courtBy(q,p,1);
      blow(p,1);blow(p,1);blow(p,1);let pinned=false;for(let i=0;i<200&&!pinned;i++){hold(p.x-15);BK.sim(1);if(q.mode==='pinned'&&q.pinBy==='pillar')pinned=true;}res.every[h]=pinned;}
    /* THE HANDS PLAY IT (src/lab.js): the boss lab, one knight, ninety seconds - it must pin her under a pillar */
    { const pins={pillar:0,chandelier:0};let last=null;const o=await BK.bossLab({bosses:['crown'],heroes:['knight'],maxSecs:90,onFrame:({boss})=>{if(boss.mode==='pinned'&&last!=='pinned')pins[boss.pinBy||'other']=(pins[boss.pinBy||'other']||0)+1;last=boss.mode;}});res.lab=pins; }
    return res;})()`, 1800000);
  out.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
console.log(JSON.stringify(out));
const fails = [];
const f = (c, m) => { if (!c) fails.push(m); };
/* chain */
f(fnBody && !/e\.mode = '(chargeTell|charge|dazed)'/.test(fnBody), 'chain: updateGQueen still enters chargeTell, charge or dazed');
f(out.modes && !out.modes.some(m => ['chargeTell', 'charge', 'dazed'].includes(m)), 'chain: she charged in play ' + JSON.stringify(out.modes));
f(out.modes && out.modes.includes('hallLeapTell') && out.modes.includes('quake') && out.modes.includes('point'), 'chain: forty seconds a round never showed her leap, quake and court ' + JSON.stringify(out.modes));
/* quake */
f(MARK['gqueen|hallLeapTell'] === '!!' && ANSWER['gqueen|hallLeapTell'] === 'jump' && HEIGHT['gqueen|hallLeapTell'] === 'low', 'quake: her leap is not a red !! answered jump, low');
f(out.leap && out.leap.told && out.leap.tx !== undefined, 'quake: no landing spot (her shadow) through the tell ' + JSON.stringify(out.leap));
f(out.leap && out.leap.standHurt, 'quake: a hero standing by her landing was not hurt ' + JSON.stringify(out.leap));
f(out.leap && !out.leap.airHurt, 'quake: a hero in the air over it was hurt - it must be jumpable ' + JSON.stringify(out.leap));
/* court and pillar */
f(out.pillars === 3, 'court: ' + out.pillars + ' pillars stand in her hall, not 3');
f(out.court && out.court.mode === 'point' && out.court.seen && out.court.seen.courtP && Math.abs(out.court.dx) < 70 && Math.sign(out.court.dx) === 1, 'court: she did not leap to point beside the pillar, on its far side ' + JSON.stringify(out.court));
f(out.court && out.court.holdT >= 3 && out.court.holdT <= 4, 'court: she holds it ' + (out.court && out.court.holdT) + ' s, not 3-4');
f(out.court && out.court.faceAway, 'court: she points with her face to the hero, not her back');
f(JSON.stringify(out.blows) === '[1,2,3]', 'pillar: three blows counted ' + JSON.stringify(out.blows));
f(out.totter > 1.4 && out.totter <= 2 && !out.brokeAt3, 'pillar: the third blow did not leave it tottering 1.5-2 s ' + out.totter);
f(!(out.tookFromBlows > 0), 'pillar: blows on the pillar hurt her through her plate');
f(out.fall && out.fall.pinned && out.fall.by === 'pillar' && out.fall.toward, 'pillar: it did not fall toward her and pin her ' + JSON.stringify(out.fall));
f(out.fall && out.fall.fellAfter >= 1.3 && out.fall.fellAfter <= 2.1, 'pillar: it fell ' + (out.fall && out.fall.fellAfter) + ' s after the third blow, not after the grace');
f(out.fall && out.fall.modeT > 4.3 && out.fall.modeT <= 4.61 && Math.abs(out.fall.took - out.fall.want) <= 1, 'pillar: not the chandelier\'s pin (4.6 s, 7%) ' + JSON.stringify(out.fall));
f(out.overlap && out.overlap.blows === 1 && !(out.overlap.tookHer > 0), 'pillar: with her body over it, the blow was eaten by her plate ' + JSON.stringify(out.overlap));
f(out.wasted && out.wasted.broken && out.wasted.mode !== 'pinned' && out.wasted.rubble.every(Boolean), 'pillar: broken with her elsewhere it is not wasted rubble ' + JSON.stringify(out.wasted));
for (const [h, v] of Object.entries(out.every || {})) f(v, 'every: ' + h + ' could not bring a pillar down on her');
/* plate */
f(out.round2 && out.round2.phase === 2 && out.round2.plate === 6 && out.round2.standing === out.round2.before && out.round2.before < 3, 'plate: round two did not start with a full plate and no pillar stood again ' + JSON.stringify(out.round2));
f(out.standChip && out.standChip.plate === 6 && out.standChip.took === 0, 'plate: a blow while she stands chipped it or hurt her ' + JSON.stringify(out.standChip));
f(out.pointChip && out.pointChip.back === 5 && out.pointChip.heavy === 4 && out.pointChip.took === 0, 'plate: a back blow and a heavy blow while she points did not take a piece each ' + JSON.stringify(out.pointChip));
f(out.chand && out.chand.mode === 'pinned' && out.chand.plate === 2, 'plate: a chandelier on her did not pin her and take two ' + JSON.stringify(out.chand));
f(out.shatter && out.shatter.plateOff && out.shatter.shards > 10 && out.shatter.open, 'shatter: the plate did not break in pieces and open her ' + JSON.stringify(out.shatter));
f(out.shatter && out.shatter.front >= 18, 'shatter: a blow to her face after the plate broke did not land ' + JSON.stringify(out.shatter));
f(out.shatter && out.shatter.leapAt !== null && Math.abs(out.shatter.leapAt) <= 2, 'shatter: plate off, her leap did not come at the hero ' + JSON.stringify(out.shatter));
/* roof round */
f(out.round3 && out.round3.phase === 3 && out.round3.standing === 3 && !out.round3.open && out.round3.took === 0, 'roof: round three did not stand her pillars and close her plate ' + JSON.stringify(out.round3));
f(out.round3 && out.round3.first === 'shadowTell', 'roof: her shadow step no longer comes first in round three ' + JSON.stringify(out.round3));
f(out.lab && out.lab.pillar >= 1, 'lab: in ninety seconds the boss-lab knight brought no pillar down on her ' + JSON.stringify(out.lab));
f(!out.errors.length, 'page errors ' + JSON.stringify(out.errors));
assert.deepEqual(fails, []);
console.log('queen-court: no charge; her leap is a told, jumpable quake; she holds court beside a pillar, and three blows bring it down on her (every hero); her round-two plate breaks only to a chandelier or her back while she points, and then every blow lands; round three as it was');
