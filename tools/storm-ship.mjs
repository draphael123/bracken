import assert from 'node:assert/strict';import{LEVELS,T}from'../src/level.js';import{updateDeckBreaks}from'../src/storm-ship.js';import{floodReach}from'../src/reachcore.js';
for(const id of ['flotilla','hurricane']){const L=LEVELS.find(l=>l.id===id).build();for(const m of L.moversExtra.filter(m=>m.kind==='swing')){assert(m.nautical);assert(m.py+m.arm>=(m.deck!==undefined?m.deck-2:id==='hurricane'?18:21)*16);}
 /* (claude/hurricane2) THE HURRICANE DECK 2 replaces the three splitting waists, the bulkhead guns and the backward gun (cut with the chores) rule for rule:
    her TOPMAST is the one thing that breaks under you - five warned spans that go only once stood on (never under a hero who has not reached them), each behind
    you while you run; after all five are down the stern is still crossable (the hatch covers, the mizzen's ratlines, the nets out of the sea), and the
    foremast the sky fells lands with its head on the galley roof, its foot at the breach where its tell is triggered. */
 if(id==='hurricane'){const B=L.deckBreaks;assert.equal(B.length,5,'five spans of topmast');let n=0;const change=(x,y)=>L.grid[y*L.W+x]=T.AIR;
  for(const z of B){assert(z.onTop&&z.reset,'a span breaks when stood on, and is whole again after a respawn');const away={x:(z.x0-6)*16,y:z.row*16,ground:true};for(let i=0;i<40;i++)updateDeckBreaks(L,away,.1,change,()=>n++);assert(!z.down,'a span never goes before it is stood on');
   const on={x:(z.x0+1)*16,y:z.row*16,ground:true};updateDeckBreaks(L,on,.1,change,()=>n++);assert(!z.down&&z.t>0,'the fuse is lit, not the span dropped');for(let i=0;i<20;i++)updateDeckBreaks(L,on,.1,change,()=>n++);assert(z.down);}
  assert.equal(n,5);const r=floodReach(L,T,{rides:true});assert(r.jumpNear(318,28)||r.jumpNear(320,28),'(claude/hurricane3) the main yard past the broken topmast run is still reached');
  const F=L.felled[0];assert(F.zone[1]<F.band[0],'its tell is triggered before the deck it lands on');assert.equal(L.grid[F.head[1]*L.W+F.head[0]],T.SOLID,'the foremast head lands on her boats past the breach');
  assert.equal(L.ents.filter(e=>['cannon','bulkhead','pump','davit'].includes(e.t)).length,0,'the chores are cut: no pump, no bulkhead gun, no davit');}}
console.log('Ship swings descend toward their boarding decks; the Hurricane topmast run breaks span by span behind a runner and the main yard stays reachable; the foremast lands on her boats across the breach.');
