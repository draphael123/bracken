import { LEVELS, T } from '../../bracken/src/level.js';
for(const id of process.argv[2].split(',')){const L=LEVELS.find(l=>l.id===id).build();const c={};
 for(const e of L.ents||[])c[e.t]=(c[e.t]||0)+1;
 const skip=new Set(['coin','deco']);
 console.log('\n== '+id+'  W='+L.W+' sections='+((L.burialSections||L.harborSections||L.keepSections||[]).length||'-')+' movers='+((L.moversExtra||[]).length));
 console.log(Object.entries(c).filter(([k])=>!skip.has(k)).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+':'+v).join(' '));
 const keys=['graveAdd','rocks','sluice','thermal','ballast','clam','current','pump','drydock','towerSlabs','deckBreaks','burialGraves','falls'];
 console.log(keys.filter(k=>L[k]).map(k=>k+'='+(Array.isArray(L[k])?L[k].length:1)).join(' '), 'pools='+(L.pools||[]).length);}
