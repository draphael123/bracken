// tools/queen-pillars.mjs — THE GOBLIN QUEEN BREAKS HER OWN PILLARS (Daniel, 2026-09-25; docs/briefs/queen-pillars.md). Played in the real page:
//   pillars  three cracked pillars stand on her hall floor (and no gallery came back with them)
//   bait     with a pillar between you and her, more than 100 px off, her charge is the FIRST thing she reaches for - ahead of her decree
//            and her sceptre, both left ready (E2) - and the pillar in her line shakes through the tell (C1)
//   pinned   the charge breaks the pillar and pins her exactly as the chandelier does: 'pinned' by 'pillar', 4.6 s, 7% of her health,
//            her plate open for it; every hero, from either side of the hall
//   rubble   the pillar leaves one-way rubble that is drawn (a tile sprite on every cell) and that a hero stands on
//   wall     a charge with no pillar in it ends at the hall's end DAZED, and her plate still turns a blade: a wall is no opening
//   round    when her round changes the pillar stands again and its rubble goes
//   lab      the boss-lab hands (src/lab.js) bait at least one charge into a pillar in sixty seconds, with the knight
// PROVED RED FIRST (2026-09-25) on the build before them: no pillars, and the charge ran through to the wall.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');const lv=LEVELS.findIndex(l=>l.id==='crown');const res={};
    const setup=(h)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.load(lv);BK.state='play';BK.god=false;BK.sim(5);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<260;i++){BK.P.hp=BK.P.maxHp;BK.P.inv=9;BK.sim(1);}
      const q=BK.enemies().find(e=>e.t==='gqueen'&&e.alive);return {A,q};};
    const pillars=()=>BK.props().filter(p=>p.t==='qpillar').sort((a,b)=>a.x-b.x);
    /* her, stood at qx and ready to charge (every other told attack held, unless keep says otherwise), and the hero at px, still */
    const ready=(q,qx,px,keep)=>{const P=BK.P;q.x=qx;q.y=BK.L.arena.floor;q.vx=0;q.vy=0;q.mode='stand';q.modeT=0;q.phase=q.phase||1;q.slamT=q.sweepT=q.chandT=q.gLeapT=q.shadowT=99;q.chargeT=0;
      if(!keep){q.decreeT=q.throwT2=99;}else{q.decreeT=0;q.throwT2=0;}P.x=px;P.y=BK.L.arena.floor;P.vx=0;P.vy=0;};
    const hold=(px)=>{BK.P.x=px;BK.P.vx=0;BK.P.hp=BK.P.maxHp;BK.P.inv=9;};
    { const {A,q}=setup('knight');const ps=pillars();res.pillars=ps.length;res.gallery=A.gallery?1:0;res.cols=ps.map(p=>Math.floor(p.x/16));if(ps.length<3)return res;
      /* the bait, with her decree and sceptre ready too: she must choose the charge */
      const p=ps[2];ready(q,p.x+60,p.x-70,true);let first=null,shook=0;
      for(let i=0;i<40&&!first;i++){hold(p.x-70);BK.sim(1);if(q.mode!=='stand')first=q.mode;}
      for(let i=0;i<60&&q.mode==='chargeTell';i++){hold(p.x-70);BK.sim(1);if(p.shake>0)shook++;}
      res.first=first;res.shook=shook;
      const hp0=q.hp;for(let i=0;i<120&&q.mode!=='pinned';i++){hold(p.x-70);BK.sim(1);}
      res.mode=q.mode;res.by=q.pinBy;res.modeT=+q.modeT.toFixed(2);res.took=hp0-q.hp;res.want=Math.round(q.maxHp*0.07);res.broke=p.broken;
      const h1=q.hp;BKT.hurtEnemy(q,20,q.x-10,false);res.pinnedTook=h1-q.hp;
      /* the rubble: drawn, and stood on */
      const W=BK.L.W,G=BK.L.grid,S=BK.tileSpr(),ty=Math.floor(p.y/16)-1,cx=Math.floor(p.x/16);res.rubble=[-1,0,1].map(d=>G[ty*W+cx+d]===T.ONEWAY&&!!S[ty*W+cx+d]);
      for(let i=0;i<300&&q.mode==='pinned';i++)BK.sim(1);q.x=A.x0+40;q.mode='rec';q.modeT=9;BK.P.x=p.x;BK.P.y=ty*16-20;BK.P.vx=0;BK.P.vy=0;for(let i=0;i<40;i++){BK.P.x=p.x;BK.P.hp=BK.P.maxHp;BK.sim(1);}
      res.stood={ground:!!BK.P.ground,y:Math.round(BK.P.y),top:ty*16};
      /* her round changes: it stands again, the rubble goes */
      q.mode='stand';q.modeT=5;q.phase=1;q.hp=Math.floor(q.maxHp*0.6);BK.P.x=A.x0+30;for(let i=0;i<5;i++)BK.sim(1);
      res.round={phase:q.phase,standing:!p.broken,rubble:[-1,0,1].map(d=>G[ty*W+cx+d])};
      /* a wall: every pillar down, and her charge runs to the hall's end - dazed, and the plate still turns a blade */
      for(const pp of pillars())pp.broken=true;q.hp=q.maxHp;q.phase=2;ready(q,A.x0+200,A.x0+60,false);let dz=0;for(let i=0;i<260&&q.mode!=='dazed';i++){hold(A.x0+60);BK.sim(1);if(q.mode==='pinned')dz=-1;}
      res.wall=q.mode;res.wallPinned=dz<0;const h2=q.hp;BKT.hurtEnemy(q,20,q.x-10,false);res.dazedTook=h2-q.hp; }
    /* every hero, from both sides of the hall: bait a charge into the middle pillar */
    res.every={};for(const h of ['knight','warden','geomancer','pyro','paladin','pirate','reaper'])for(const side of [-1,1]){const {q}=setup(h);const p=pillars()[1];
      ready(q,p.x+side*50,p.x-side*70,false);for(let i=0;i<260&&q.mode!=='pinned';i++){hold(p.x-side*70);BK.sim(1);}
      res.every[h+(side<0?'<':'>')]=q.mode==='pinned'&&q.pinBy==='pillar'&&p.broken;}
    /* THE HANDS PLAY IT (src/lab.js): the boss lab, one knight, sixty seconds - it must bait at least one charge into a pillar by standing past it */
    { const pins={pillar:0,chandelier:0};let last=null;const o=await BK.bossLab({bosses:['crown'],heroes:['knight'],maxSecs:60,onFrame:({boss})=>{if(boss.mode==='pinned'&&last!=='pinned')pins[boss.pinBy||'other']=(pins[boss.pinBy||'other']||0)+1;last=boss.mode;}});res.lab=pins; }
    return res;})()`);
  out.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
console.log(JSON.stringify(out));
const fails = [];
if (out.pillars !== 3) fails.push('pillars: ' + out.pillars + ' stand in her hall, not 3');
if (out.gallery) fails.push('pillars: her gallery came back');
if (out.first !== 'chargeTell') fails.push('bait: with a pillar between, she chose ' + out.first + ' before her charge');
if (!(out.shook > 20)) fails.push('bait: the pillar in her line shook ' + out.shook + ' frames of her 48-frame tell');
if (out.mode !== 'pinned' || out.by !== 'pillar') fails.push('pinned: the charge left her ' + out.mode + ' (by ' + out.by + '), not pinned by the pillar');
if (!out.broke) fails.push('pinned: the pillar did not break');
if (out.modeT < 4.4 || out.modeT > 4.61) fails.push('pinned: for ' + out.modeT + ' s, not the chandelier\'s 4.6');
if (Math.abs(out.took - out.want) > 1) fails.push('pinned: it took ' + out.took + ', the chandelier takes ' + out.want);
if (!(out.pinnedTook > 0)) fails.push('pinned: a blade did nothing while she was pinned');
if (!out.rubble || out.rubble.some(v => !v)) fails.push('rubble: the three cells are not all drawn one-way floor ' + JSON.stringify(out.rubble));
if (!out.stood || !out.stood.ground || Math.abs(out.stood.y - out.stood.top) > 1) fails.push('rubble: a hero does not stand on it ' + JSON.stringify(out.stood));
if (!out.round || out.round.phase !== 2 || !out.round.standing || out.round.rubble.some(t => t !== 0)) fails.push('round: at her round change the pillar did not stand again and clear ' + JSON.stringify(out.round));
if (out.wall !== 'dazed' || out.wallPinned) fails.push('wall: a charge into the hall\'s end left her ' + out.wall + (out.wallPinned ? ' (and pinned her)' : ''));
if (out.dazedTook > 0) fails.push('wall: dazed, her plate let ' + out.dazedTook + ' through - a wall must be no opening');
if (!(out.lab && out.lab.pillar >= 1)) fails.push('lab: in sixty seconds the boss-lab knight baited no charge into a pillar ' + JSON.stringify(out.lab));
for (const [k, v] of Object.entries(out.every || {})) if (!v) fails.push('every: ' + k + ' could not bait her charge into a pillar');
if (out.errors.length) fails.push('page errors ' + JSON.stringify(out.errors));
assert.deepEqual(fails, []);
console.log('queen-pillars: three pillars; her charge goes first at a hero behind one, breaks it and pins her as the chandelier does (4.6 s, 7%, plate open), for every hero from both sides; the rubble is drawn floor; a wall only dazes her; her round change stands it again');
