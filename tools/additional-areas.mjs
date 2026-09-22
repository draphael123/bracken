import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {LEVELS,T} from '../src/level.js';
import {floodReach} from '../src/reachcore.js';
import {findDeadEnds} from '../src/deadends.js';
for(const id of ['harbor','burial']){
 const L=LEVELS.find(l=>l.id===id).build(),reach=floodReach(L,T,{rides:true}),exit=L.ents.find(e=>e.t==='gate');
 for(const e of L.ents.filter(e=>['check','silver','gate'].includes(e.t)))assert(reach.jumpNear(e.x,e.y),id+' unreachable '+JSON.stringify(e));
 assert.equal(findDeadEnds(L,T).pockets.filter(p=>!p.paid).length,0);
 if(id==='burial'){assert.equal(L.mini.boss,'gravewarden','THE GRAVE WARDEN holds the ossuary (batch 4b)');assert.equal(L.arena.boss,'burieddead');assert.equal(L.W,1140);assert(reach.jumpNear(exit.x,exit.y),'burial exit reachable after boss');}   /* and on through the guardian checks: his door must hold */
 const shut={...L,grid:L.grid.slice()};for(let i=0;i<shut.grid.length;i++)if(shut.grid[i]===T.PORT)shut.grid[i]=T.SOLID;
 const closed=floodReach(shut,T,{rides:true});assert(!closed.near(exit.x,exit.y),id+' guardian gate must hold the exit');
 const mini=L.ents.find(e=>e.mini);assert(closed.jumpNear(mini.x,mini.y),id+' guardian must be reachable with gate shut');
}
const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),ctx=vm.createContext({LEVELS});
vm.runInContext(main.slice(main.indexOf('const MAPW ='),main.indexOf('const MAPC ='))+'\nglobalThis.route={NODES,NODE_AT,PATH};',ctx);
const {NODES,NODE_AT,PATH}=ctx.route;
assert.equal(NODES.length,NODE_AT.length);
/* THE ROAD AND ITS SPURS (2026-09-22). This used to say "every node sits exactly on the road", which is the very rule
   an optional level has to break to look optional. Both halves are checked now: a node ON the road is on it to the
   pixel, and a SPUR node is OFF it - far enough to read as a branch, near enough that the dashed line is a spur and
   not a second road. NODE_AT still snaps it to its junction, which is what the walk uses. */
for(let i=0;i<NODES.length;i++){ const n=NODES[i]; assert(PATH[NODE_AT[i]], n.id+' has no road point');
  const d=Math.hypot(PATH[NODE_AT[i]][0]-n.x, PATH[NODE_AT[i]][1]-n.y);
  if(n.spur) assert(d>4&&d<44, n.id+' is a SPUR and must hang OFF the road: it is '+d.toFixed(1)+'px from its junction, wanted 4-44');
  else assert(d<1, n.id+' map path mismatch'); }
{ const spurs=NODES.filter(n=>n.spur); assert(spurs.length>=3, 'the optional levels hang off the road: '+spurs.map(n=>n.id).join(', '));
  for(const n of spurs) assert(!PATH.some(p=>Math.hypot(p[0]-n.x,p[1]-n.y)<1), n.id+' is still a point ON the road'); }
for(const [a,b] of [['causeway','waymeet'],['waymeet','fields'],['fields','burial'],['burial','witchlight'],['witchlight','mage']]   /* (batch 4c: the Witchlight Stair between the caverns and the Folly) */){assert.equal(LEVELS.find(l=>l.id===b).needs,a);assert(NODES.findIndex(n=>n.id===a)<NODES.findIndex(n=>n.id===b));}
console.log('Both areas have reachable rewards; Burial has its final boss and Harbor retains its guardian; all map nodes meet their paths and campaign links follow the intended order.');
