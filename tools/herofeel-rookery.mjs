// tools/herofeel-rookery.mjs (claude/herofeel, Daniel 11-02: stuck in the rookery gorge): every cell the reach fill can stand in must still reach the boss floor (directed moves, vents counted). Node only. node tools/herofeel-rookery.mjs [levelId]
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
const L = LEVELS.find(l => l.id === (process.argv[2]||'rookery')).build();
const W=L.W,H=L.H;
const R = floodReach(L, T, { rides: true });
const parse = k => { const c = k.indexOf(','); return [+k.slice(0, c), +k.slice(c + 1)]; };
const foot=new Uint8Array(W*H), node=new Uint8Array(W*H);
for (const k of R.footing){const [x,y]=parse(k); if(x>=0&&y>=0&&x<W&&y<H)foot[y*W+x]=1;}
for (const k of R.seen){const [x,y]=parse(k); if(x>=0&&y>=0&&x<W&&y<H&&foot[y*W+x])node[y*W+x]=1;}
const rev=new Map(); const add=(a,b)=>{if(!rev.has(b))rev.set(b,[]);rev.get(b).push(a);};
let n=0;
for(let i=0;i<W*H;i++) if(node[i]) {n++; R.expand(i%W,(i/W)|0,(nx,ny)=>{if(nx<0||ny<0||nx>=W||ny>=H)return;const v=ny*W+nx;if(foot[v])add(i,v);});}
const settle=(x,y)=>{let yy=y;while(yy<H-1&&!foot[yy*W+x])yy++;return yy*W+x;};
const A=L.arena; const goal=settle(Math.round((A.x0+A.x1)/32),Math.round(A.floor/16)-1);
const seen=new Set([goal]),st=[goal];
while(st.length){const u=st.pop();for(const a of rev.get(u)||[])if(!seen.has(a)){seen.add(a);st.push(a);}}
const bad=[];for(let i=0;i<W*H;i++)if(node[i]&&!seen.has(i))bad.push([i%W,(i/W)|0]);
console.log('nodes',n,'goal',goal%W,(goal/W)|0,'reachGoal',seen.size,'trapped',bad.length);
// cluster by x ranges
const cols=[...new Set(bad.map(b=>b[0]))].sort((a,b)=>a-b);let runs=[],s=cols[0],p=cols[0];for(const c of cols.slice(1)){if(c!==p+1){runs.push([s,p]);s=c;}p=c;}if(cols.length)runs.push([s,p]);
console.log(runs.map(r=>r.join('-')+' rows '+Math.min(...bad.filter(b=>b[0]>=r[0]&&b[0]<=r[1]).map(b=>b[1]))+'..'+Math.max(...bad.filter(b=>b[0]>=r[0]&&b[0]<=r[1]).map(b=>b[1]))).join('\n'));
if (bad.length) { console.error('FAIL: ' + bad.length + ' standable cells in ' + (process.argv[2]||'rookery') + ' cannot reach the goal (a softlock pocket)'); process.exit(1); }
console.log('ok: no softlock pocket in ' + (process.argv[2]||'rookery'));
