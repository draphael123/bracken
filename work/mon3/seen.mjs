import { LEVELS, T } from '../../src/level.js'; import { floodReach } from '../../src/reachcore.js';
const L = LEVELS.find(l => l.id === 'spire').build(); const R = floodReach(L, T, { rides: true });
const [x0,x1,y0,y1]=process.argv.slice(2).map(Number);
const ch={[T.AIR]:' ',[T.SOLID]:'#',[T.ONEWAY]:'=',[T.NET]:'H',[T.CRATE]:'c',[T.SPIKE]:'^',[T.CLIMB]:'%',[T.PLANK]:'_',[T.PORT]:'|'};
for(let y=y0;y<=y1;y++){let r='';for(let x=x0;x<=x1;x++)r+=R.seen.has(x+','+y)?'*':(ch[L.grid[y*L.W+x]]??'?');console.log(String(y).padStart(3)+' '+r);}
console.log(Object.keys(R).join(','));
