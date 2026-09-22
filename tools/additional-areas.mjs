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
for(let i=0;i<NODES.length;i++){assert(PATH[NODE_AT[i]]);assert(Math.hypot(PATH[NODE_AT[i]][0]-NODES[i].x,PATH[NODE_AT[i]][1]-NODES[i].y)<1,NODES[i].id+' map path mismatch');}
for(const [a,b] of [['causeway','waymeet'],['waymeet','fields'],['fields','burial'],['burial','mage']]){assert.equal(LEVELS.find(l=>l.id===b).needs,a);assert(NODES.findIndex(n=>n.id===a)<NODES.findIndex(n=>n.id===b));}
console.log('Both areas have reachable rewards; Burial has its final boss and Harbor retains its guardian; all map nodes meet their paths and campaign links follow the intended order.');
