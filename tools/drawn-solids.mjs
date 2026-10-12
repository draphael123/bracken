// tools/drawn-solids.mjs - EVERY SOLID TILE IS DRAWN, AS BUILT AND AFTER THE RULE HAS MOVED IT (claude/buriedcity3, 2026-10-12).
//
// Daniel, 10-12, played THE BURIED CITY live: "INVISIBLE PLATFORMS in the Hourglass Tower room" (scratch/daniel-bc2-hourglass-1012.jpg: he stands on
// nothing beside the great hourglass). tools/footing-art.mjs asks the same question of every level AS LOADED - but it skips every L.caravan level
// (the Sunken Caravan paints its own sand), and the Buried City wears L.caravan for the desert's hands. And the city's hands WRITE THE GRID while you
// play: a sand room fills (T.SOFT) and drains back to its built cells, the sinking street rides its deck up and down, a heap piles and goes flat, a
// trap hall's floor-gate shuts. The hands wrote those cells through main.js cellSet, which only clears the cell's picture (tileSpr = null) - and
// nothing re-picked it: the pipe shelf in the upper bulb, the lower bulb's pipes and beam after a respawn, the street's roofs after it moved, the
// trap hall's plate were real floor with no picture.
//
// This loads the level, then works its rule the way a player does - every room's gate thrown and the sand let run, every chute swung and the heap let
// pile, a respawn - and after each asks of EVERY solid, ledge and stake cell whether it has a picture with ink in it. T.SOFT (a room's sand) is drawn
// by the sand body over it (src/buried-city-hands.js drawWorld) and is exempt; nothing else is.
// `node tools/drawn-solids.mjs [levelId ...]` (default buriedcity). PORT from the environment. PROVED RED FIRST on master 4099648d (see the lane report).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const want = process.argv.slice(2).filter(a => !a.startsWith('-'));
const ids = want.length ? want : ['buriedcity'];
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');const res=[];
    const DRAWN=new Set([T.SOLID,T.ONEWAY,T.SPIKE,T.PLANK,T.CRATE,T.PORT,T.SHELF,T.RAIL].filter(v=>v!==undefined));
    const ink=new Map();const hasInk=c=>{if(!c||!c.width)return false;if(ink.has(c))return ink.get(c);const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let a=0;for(let i=3;i<d.length;i+=4)a+=d[i]>8?1:0;const v=a>=8;ink.set(c,v);return v;};
    const scan=(phase)=>{const L=BK.L,W=L.W,H=L.H,G=L.grid,S=BK.tileSpr();const bad=[];
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,t=G[k];if(!DRAWN.has(t))continue;if(t===T.PORT)continue;if(!hasInk(S[k]))bad.push(x+','+y+':'+t);}
      return {phase,bad:bad.length,cells:bad.slice(0,14)};};
    for(const id of ${JSON.stringify(ids)}){const i=LEVELS.findIndex(l=>l.id===id);if(i<0){res.push({id,err:'no such level'});continue;}
      BK.load(i);BK.start();BK.god=true;BK.sim(30);const ph=[scan('as loaded')];
      const K=BK.buriedCity?BK.buriedCity():null;
      if(K&&K.L===BK.L){
        /* every room: throw its gate, let the sand run (fill or drain to the end), and throw it back */
        for(const r of K.rooms){if(r.great)continue;r.gate=r.gate==='open'?'shut':'open';BK.sim(900);}
        ph.push(scan('every gate thrown once'));
        for(const r of K.rooms){if(r.great)continue;r.gate=r.gate==='open'?'shut':'open';BK.sim(900);}
        ph.push(scan('every gate thrown back'));
        /* THE GREAT SAND-GATE drained */
        const gr=K.rooms.find(r=>r.great);if(gr){gr.gate='open';gr.drain=4;BK.sim(900);ph.push(scan('the great gate drained'));}
        /* every chute swung, the heaps let pile, and swung back */
        for(const c of K.chutes){c.at=c.other[c.at];}BK.sim(900);ph.push(scan('every chute swung'));
        for(const c of K.chutes){c.at=c.other[c.at];}BK.sim(300);ph.push(scan('every chute swung back'));
        /* the new verb (claude/buriedcity3): every hourglass flipped, run out, and sunk back */
        if(K.glasses&&BK.flipAll){BK.flipAll();BK.sim(240);ph.push(scan('every hourglass flipped'));BK.sim(2400);ph.push(scan('every flip run out'));}
      }
      /* a death: the respawn puts every small room back as built */
      BK.respawn();BK.sim(60);ph.push(scan('after a respawn'));BK.sim(600);ph.push(scan('after a respawn, settled'));
      res.push({id,ph});}
    return res;})()`, 1800000);
  out = { rows: out, errors: pg.errors.slice(0, 3) };
} finally { pg.close(); }
const fails = [];
for (const r of out.rows) {
  if (r.err) { fails.push(r.id + ': ' + r.err); continue; }
  for (const p of r.ph) { console.log(r.id, '-', p.phase + ':', p.bad ? p.bad + ' undrawn solid cell(s), e.g. ' + p.cells.join(' ') : 'every solid cell drawn'); if (p.bad) fails.push(r.id + ' ' + p.phase + ': ' + p.bad + ' undrawn'); }
}
if (out.errors.length) fails.push('page errors ' + JSON.stringify(out.errors));
assert.deepEqual(fails, [], 'solid cells with no picture (an invisible platform)');
console.log('drawn-solids: every solid, ledge and stake cell has a picture, as built and after the rule moved it, in ' + out.rows.length + ' level(s)');
