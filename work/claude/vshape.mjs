// vshape.mjs <level> [srcRoot] - shape.mjs for a level that goes DOWN: walkable surface, foes, wall kinds, route.
const root=process.argv[3]||'../../bracken/src/';
const { LEVELS, T } = await import(new URL(root+'level.js',import.meta.url));
const { floodReach } = await import(new URL(root+'reachcore.js',import.meta.url));
const id=process.argv[2];const L=LEVELS.find(l=>l.id===id).build();const R=floodReach(L,T);const st=[...R.seen].map(s=>s.split(',').map(Number));
const non=new Set(['check','sign','coin','deco','torch','silver','key','stray','npc','stal','web','gate','lockgate','minerlamp','timber','cart','bell']);
const foes=(L.ents||[]).filter(e=>!non.has(e.t));
const A=L.arena||{x0:0,floor:0},ax=Math.floor(A.x0/16)+4,ay=Math.floor(A.floor/16)-1;
const arenaReached=st.some(([x,y])=>Math.abs(x-ax)<3&&Math.abs(y-ay)<2);
const kinds=new Set((L.interiors||[]).map(i=>i[4]));
const bands=[];for(let y=0;y<L.H;y+=12){const n=st.filter(([,sy])=>sy>=y&&sy<y+12).length;if(n)bands.push(n);}
console.log(JSON.stringify({id,W:L.W,H:L.H,standCells:st.length,foes:foes.length,foeKinds:[...new Set(foes.map(e=>e.t))].length,wallKinds:[...kinds],cryst:L.grid.filter(t=>t===T.CRYST).length,pools:(L.pools||[]).length,arenaReached,screensWithFloor:bands.length}));
