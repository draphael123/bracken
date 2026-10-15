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
// `node tools/drawn-solids.mjs [levelId ...]` keeps the Buried City gate. `--all --report-only` sweeps every LEVELS entry for the
// art lanes without changing that gate. `--selftest-red` removes one live tile picture in the page and proves this audit sees it.
// PORT comes from the environment. PROVED RED FIRST on master 4099648d (see the lane report).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const want = process.argv.slice(2).filter(a => !a.startsWith('-'));
const all = process.argv.includes('--all'), reportOnly = process.argv.includes('--report-only'), json = process.argv.includes('--json');
const selftest = process.argv.includes('--selftest-red');
const ids = want.length ? want : all ? null : ['buriedcity'];
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');const res=[];
    const DRAWN=new Set([T.SOLID,T.ONEWAY,T.SPIKE,T.PLANK,T.CRATE,T.PORT,T.SHELF,T.RAIL,T.PALISADE,T.CLIMB,T.SOFT,T.ICE,T.WEB,T.REED,T.BOUNCER,T.CRYST].filter(v=>v!==undefined));
    const ink=new Map();const hasInk=c=>{if(!c||!c.width)return false;if(ink.has(c))return ink.get(c);const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let a=0;for(let i=3;i<d.length;i+=4)a+=d[i]>8?1:0;const v=a>=8;ink.set(c,v);return v;};
    const top=new Map();const topInk=(c,start=0)=>{if(!c||!c.width)return false;let memo=top.get(c);if(memo&&start in memo)return memo[start];
      const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let good=false;
      for(let y=start;y<Math.min(start+4,c.height)&&!good;y++){let run=0;for(let x=0;x<c.width;x++){run=d[(y*c.width+x)*4+3]>128?run+1:0;if(run>=3){good=true;break;}}}
      if(!memo){memo={};top.set(c,memo);}memo[start]=good;return good;};
    const inBox=(a,x,y)=>a&&a.some(z=>x>=z[0]&&x<=z[1]&&y>=z[2]&&y<=z[3]);
    /* These are not missing pictures: each exact coordinate is handed to a second, foreground painter below the tile
       loop in main.js. Match the metadata that painter reads, not a blanket level exemption. */
    const custom=(L,x,y,t)=>
      inBox(L.stone,x,y)?'menhir':
      L.fields&&t===T.PLANK&&(L.fields.phantoms||[]).some(z=>x>=z[0]&&x<=z[1]&&y===z[2])?'fields phantom plank':
      L.fields&&inBox(L.fields.skins,x,y)?'fields skin':
      L.mage&&inBox(L.mage.skins,x,y)?'mage skin':
      L.canal&&t===T.ONEWAY&&(L.canal.weeds||[]).some(z=>x>=z[0]&&x<=z[1]&&y===z[2])?'canal weed mat':null;
    const scan=(phase)=>{const L=BK.L,W=L.W,H=L.H,G=L.grid,S=BK.tileSpr();const bad=[],other={};
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,t=G[k];if(!DRAWN.has(t))continue;if(t===T.PORT||t===T.SOFT)continue;
        /* The old City gate still examines every solid cell. The whole-game sweep asks about standable TOP surfaces; a buried
           wall cell behind a painted bookshelf is not a platform and must not be counted as one. */
        if(${all}&&(!y||G[k-W]!==T.AIR||t===T.SPIKE))continue;   /* a spike hurts; it is not a standable platform */
        /* A reed's sprite is drawn eight pixels ABOVE its collision cell (drawWorld); sample the sprite rows that really
           land on the cell's top instead of mistaking its high fronds for a missing footing. */
        if(!(${all}?topInk(S[k],t===T.REED?8:0):hasInk(S[k]))){const why=${all}?custom(L,x,y,t):null;if(why)other[why]=(other[why]||0)+1;else bad.push([x,y,t]);}}
      return {phase,bad:bad.length,cells:bad,custom:other};};
    for(const id of (${JSON.stringify(ids)}||LEVELS.map(l=>l.id))){const i=LEVELS.findIndex(l=>l.id===id);if(i<0){res.push({id,err:'no such level'});continue;}
      BK.load(i);BK.start();BK.god=true;BK.sim(${all?60:30});const ph=[scan('as loaded')],move=[];
      if(${all}){BK.hideHero=true;const W=BK.view.VW,H=BK.view.VH;
        for(const m of BK.movers()){if(!Number.isFinite(m.x)||!Number.isFinite(m.y)||!m.w||m.x+m.w<0||m.x>BK.L.W*16||m.y+m.h<0||m.y>BK.L.H*16)continue;
          if(m.kind==='lane'||m.broken||m.gone||(m.kind==='bucket'&&!m.vis))continue;   /* a reach-model lane and a hidden or broken carrier are not solid footing */
          const px=m.x,py=m.y,col=Math.floor(px/16),row=Math.floor(py/16),at=Math.floor((px+m.w/2)/16),v=BK.look(at,row);
          const A=BK.view.buf.getContext('2d').getImageData(0,0,W,H).data.slice();m.x=-1000000;m.y=-1000000;BK.look(at,row);
          const B=BK.view.buf.getContext('2d').getImageData(0,0,W,H).data;m.x=px;m.y=py;let good=false;
          for(let yy=-2;yy<=3&&!good;yy++){let run=0;for(let xx=Math.max(0,Math.floor((m.w-16)/2));xx<Math.min(m.w,Math.floor((m.w+16)/2));xx++){
            const sx=Math.round(px+xx-v.cx),sy=Math.round(py+yy-v.cy);if(sx<0||sy<0||sx>=W||sy>=H){run=0;continue;}
            const j=(sy*W+sx)*4,d=Math.abs(A[j]-B[j])+Math.abs(A[j+1]-B[j+1])+Math.abs(A[j+2]-B[j+2]);run=d>=3?run+1:0;if(run>=3){good=true;break;}}}
          if(!good)move.push([col,row,m.kind||'platform']);}
        BK.hideHero=false;}
      if(${selftest}){const W=BK.L.W,G=BK.L.grid,S=BK.tileSpr(),k=G.findIndex((t,j)=>j>=W&&t===T.SOLID&&G[j-W]===T.AIR&&S[j]);if(k<0){res.push({id,err:'no pictured standable solid to remove for selftest'});continue;}const before=S[k];S[k]=null;const red=scan('scratch picture removed');S[k]=before;ph.push(red);}
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
      /* a death: the respawn puts every small room back as built. The long settle is needed only for the City's moving sand. */
      BK.respawn();BK.sim(60);ph.push(scan('after a respawn'));if(K&&K.L===BK.L){BK.sim(600);ph.push(scan('after a respawn, settled'));}
      res.push({id,ph,movers:move});}
    return res;})()`, 1800000);
  out = { rows: out, errors: pg.errors.slice(0, 3) };
} finally { pg.close(); }
const fails = [];
for (const r of out.rows) {
  if (r.err) { fails.push(r.id + ': ' + r.err); continue; }
  for (const p of r.ph) { if (!json) console.log(r.id, '-', p.phase + ':', p.bad ? p.bad + ' undrawn solid cell(s), e.g. ' + p.cells.slice(0,14).map(c=>c.join(',')).join(' ') : 'every solid cell drawn'); if (p.bad) fails.push(r.id + ' ' + p.phase + ': ' + p.bad + ' undrawn'); }
  if (r.movers?.length) { if (!json) console.log(r.id, '- movers: ' + r.movers.length + ' with no visible top, e.g. ' + r.movers.slice(0,14).map(c=>c.join(',')).join(' ')); fails.push(r.id + ': ' + r.movers.length + ' undrawn mover(s)'); }
}
if (out.errors.length) fails.push('page errors ' + JSON.stringify(out.errors));
if (json) console.log(JSON.stringify(out));
if (reportOnly) { console.log('drawn-solids REPORT-ONLY: ' + fails.length + ' phase(s) with undrawn cells in ' + out.rows.length + ' level(s)'); process.exit(0); }
assert.deepEqual(fails, [], 'solid cells with no picture (an invisible platform)');
console.log('drawn-solids: every solid, ledge and stake cell has a picture, as built and after the rule moved it, in ' + out.rows.length + ' level(s)');
