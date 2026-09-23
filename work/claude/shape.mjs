import { LEVELS, T } from '../../bracken/src/level.js';
import { floodReach } from '../../bracken/src/reachcore.js';
const ids=process.argv[2].split(',');const W0=24;const rows=[];
for(const id of ids){const L=LEVELS.find(l=>l.id===id).build();const R=floodReach(L,T);const st=[...R.seen].map(s=>s.split(',').map(Number));
 const rev=L.arena&&L.arena.reverse;
 const xmin=rev?L.arena.x1/16:0, xmax=rev?L.START.x:(L.arena?Math.min(L.W,L.arena.x0/16):L.W);
 let win=0,hs=0,flat=0,ens=0,hazard=0;const combat=new Set(['check','sign','coin','deco','torch','silver','key','stray','npc','stal','web','gate','lockgate']);
 for(let x=xmin;x+W0<=xmax;x+=W0){win++;const ys=new Set(st.filter(([sx])=>sx>=x&&sx<x+W0).map(([,y])=>y));const n=ys.size;hs+=n;if(n<=2)flat++;
  ens+=(L.ents||[]).filter(e=>e.x>=x&&e.x<x+W0&&!combat.has(e.t)).length;}
 const trapT=[T.SPIKE].filter(v=>v!==undefined);let sp=0;for(let i=0;i<L.grid.length;i++)if(trapT.includes(L.grid[i]))sp++;
 rows.push([id,Math.round(xmax-xmin),win,(hs/win).toFixed(1),Math.round(100*flat/win)+'%',(ens/win).toFixed(1),sp,(L.pools||[]).length,(L.movers||L.moversExtra||[]).length]);}
console.log('level len windows avgStandHeights flatWindows% foesPerScreen spikes pools movers');for(const r of rows)console.log(r.join('\t'));
