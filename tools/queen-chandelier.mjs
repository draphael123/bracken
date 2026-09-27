// tools/queen-chandelier.mjs — THE GOBLIN QUEEN IS PINNED BY HER CHANDELIER, NOT HER GALLERY (Daniel, 2026-09-24; docs/QUEUE.md §4.7,
// docs/DESIGN.md A11: "Cut the chain and drop the chandelier on her"). Played in the real page, through the real input:
//   gallery   her hall has no gallery any more: no pillar props, and nothing solid or one-way on the old gallery row
//   cut       with her stood under one of her chandeliers, a hero on the hall floor JUMPS and SWINGS: the chain is cut and it falls
//   pinned    it pins her exactly as a fallen stretch of gallery did (gqDropSection): mode 'pinned', 4.6 s (3.8 in round three),
//             7% of her health off, and not a point more from the iron
//   open      her plate turns a blade while she stands and lets it through while she is pinned (gqOpen)
//   every     every hero can cut a chain the same way, from either side
// PROVED RED FIRST (2026-09-24): on the gallery build the chandeliers hung 112 px over the floor and the cut never landed, and a
// chandelier that did fall on her only DAZED her, and only in round two.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const lv=LEVELS.findIndex(l=>l.id==='crown');const res={};
    const setup=(h)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.load(lv);BK.state='play';BK.god=false;BK.sim(5);
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let i=0;i<260;i++){BK.P.hp=BK.P.maxHp;BK.P.inv=9;BK.sim(1);}
      const q=BK.enemies().find(e=>e.t==='gqueen'&&e.alive);return {A,q};};
    const cutAt=(q,c,side)=>{const P=BK.P;q.x=c.x;q.mode='stand';q.modeT=5;q.slamT=q.sweepT=q.chargeT=q.decreeT=q.throwT2=q.chandT=q.gLeapT=q.shadowT=99;q.vx=0;
      P.x=c.x+side*18;P.vx=0;P.face=-side;BK.sim(2);P.x=c.x+side*18;P.face=-side;BK.press('jump');BK.keys.jump=true;for(let i=0;i<10;i++)BK.sim(1);BK.press('atk');
      let fell=false;for(let i=0;i<50;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);if(c.state!=='hang')fell=true;if(q.mode==='pinned')break;}BK.keys.jump=false;return fell;};
    { const {A,q}=setup('knight');const L=BK.L,G=BK.props();
      res.gallery={supports:G.filter(p=>p.t==='support').length,rowSolid:0};for(let x=Math.floor(A.x0/16);x<Math.floor(A.x1/16);x++){const t=L.grid[14*L.W+x];if(t!==0)res.gallery.rowSolid++;}
      const cs=G.filter(p=>p.t==='weight'&&p.gq).sort((a,b)=>a.x-b.x);res.chandeliers=cs.length;
      /* the plate, while she stands */ q.mode='stand';q.modeT=5;const hp0=q.hp;BKT.hurtEnemy(q,20,q.x-10,false);res.standTook=hp0-q.hp;
      q.hp=q.maxHp;const c=cs[0],before=q.hp;res.fell=cutAt(q,c,-1);res.mode=q.mode;res.modeT=+q.modeT.toFixed(2);res.took=before-q.hp;res.want=Math.round(q.maxHp*0.07);
      const hp1=q.hp;BKT.hurtEnemy(q,20,q.x-10,false);res.pinnedTook=hp1-q.hp; }
    res.every={};for(const h of ['knight','warden','geomancer','pyro','paladin','pirate','reaper'])for(const side of [-1,1]){const {q}=setup(h);const c=BK.props().filter(p=>p.t==='weight'&&p.gq).sort((a,b)=>a.x-b.x)[1];
      const fell=cutAt(q,c,side);res.every[h+(side<0?'<':'>')]=fell&&q.mode==='pinned';}
    return res;})()`);
  out.errors = pg.errors.slice(0, 3);
} finally { pg.close(); }
console.log(JSON.stringify(out));
const fails = [];
if (out.gallery.supports) fails.push('gallery: ' + out.gallery.supports + ' pillar props still stand');
if (out.gallery.rowSolid) fails.push('gallery: ' + out.gallery.rowSolid + ' cells of the old gallery row are still floor');
if (out.chandeliers !== 6) fails.push('chandeliers: ' + out.chandeliers + ', not 6');
if (!out.fell) fails.push('cut: a jump and a swing from the floor did not cut the chain');
if (out.mode !== 'pinned') fails.push('pinned: the chandelier left her ' + out.mode + ', not pinned');
if (out.modeT < 4.4 || out.modeT > 4.61) fails.push('pinned: for ' + out.modeT + ' s, not the gallery\'s 4.6');
if (Math.abs(out.took - out.want) > 1) fails.push('pinned: it took ' + out.took + ', the gallery took ' + out.want);
if (out.standTook > 0) fails.push('open: her plate let ' + out.standTook + ' through while she stood');
if (!(out.pinnedTook > 0)) fails.push('open: a blade did nothing while she was pinned');
for (const [k, v] of Object.entries(out.every)) if (!v) fails.push('every: ' + k + ' could not cut a chandelier down on her');
if (out.errors.length) fails.push('page errors ' + JSON.stringify(out.errors));
assert.deepEqual(fails, []);
console.log('queen-chandelier: no gallery; every hero cuts a chain from the floor, and it pins her as the gallery did (4.6 s, 7%, plate open)');
