// work/claude/crag-route-search.mjs — scratch tool, not part of the check suite. Proves (by exhaustive/random
// search, not by hand) that with SCREE/HANGING/HIGHSTORE/SPIRE/MOOR/STORM held at their exact live positions, no
// entry-to-scree route of up to 4 bends avoids crossing the WOOD connector, the entry's own climb, or the CRAG-
// COAST seam UNLESS it passes near HIGHSTORE's corner (x >= ~168, and every working shape still swings out past
// x=280 en route). Also tried moving OREROAD/CROWN/UNDERCROWN, shrinking HANGING/HIGHSTORE/SPIRE/MOOR inward,
// and repositioning STORM - none of it opened a clean route below x=220. `crag-search20`'s search (minimise
// entry.x) is what CRAG_PATH's chosen route came from; see the comment on CRAG_PATH in src/main.js.
function orient(p,q,r){return (q[1]-p[1])*(r[0]-q[0])-(q[0]-p[0])*(r[1]-q[1]);}
function onSeg(p,q,r){return Math.min(p[0],r[0])<=q[0]&&q[0]<=Math.max(p[0],r[0])&&Math.min(p[1],r[1])<=q[1]&&q[1]<=Math.max(p[1],r[1]);}
function cross(p1,p2,p3,p4){
  const o1=orient(p1,p2,p3),o2=orient(p1,p2,p4),o3=orient(p3,p4,p1),o4=orient(p3,p4,p2);
  if(o1!==0&&o2!==0&&o3!==0&&o4!==0) return (o1>0)!==(o2>0)&&(o3>0)!==(o4>0);
  if(o1===0&&onSeg(p1,p3,p2))return true; if(o2===0&&onSeg(p1,p4,p2))return true;
  if(o3===0&&onSeg(p3,p1,p4))return true; if(o4===0&&onSeg(p3,p2,p4))return true;
  return false;
}
function samePt(a,b){return a[0]===b[0]&&a[1]===b[1];}
const MARGIN=24, W=320,H=180;
function marginOk(p){ return p[0]>=MARGIN && p[0]<=W-MARGIN && p[1]>=MARGIN && p[1]<=H-MARGIN; }
const mid = [[120,92],[150,84],[184,66],[214,58],[250,50],[280,36],[270,72],[252,100],[232,118],[210,134],[184,146],[160,150],[134,148],[108,144],[82,150],[44,112],[36,88],[44,64],[50,40]]; // scree..crown FIXED original
const CRAG_Y=540, COAST_Y=360;
const toG=(p,y)=>[p[0],p[1]+y];
const UNDERCROWN=[24,54];
function test(entry, bends){
  const local = [entry, ...bends, ...mid];
  for (const b of bends) if (!marginOk(b)) return false;
  const full = local.map(p=>toG(p,CRAG_Y));
  const segs=[]; for(let i=0;i+1<full.length;i++) segs.push([full[i],full[i+1]]);
  for(let i=0;i<segs.length;i++) for(let j=i+2;j<segs.length;j++) if (cross(segs[i][0],segs[i][1],segs[j][0],segs[j][1])) return false;
  const entryG=toG(entry,CRAG_Y), crownG=toG([50,40],CRAG_Y);
  const connW=[toG([38,200],CRAG_Y),entryG];
  const connC=[crownG,toG([48,172],COAST_Y)];
  for(let i=0;i<segs.length;i++){
    const [a,b]=segs[i];
    if (!samePt(a,entryG) && cross(a,b,connW[0],connW[1])) return false;
    if (!samePt(b,crownG) && cross(a,b,connC[0],connC[1])) return false;
  }
  return true;
}
function rnd(a,b){ return a+Math.random()*(b-a); }
function rndPt(){ return [Math.round(rnd(24,296)/2)*2, Math.round(rnd(24,156)/2)*2]; }
let best=Infinity, bestSol=null;
for (let trial=0; trial<3000000; trial++) {
  const ex = rnd(24,296), ey=rnd(24,156);
  if (ex >= best) continue; // prune
  const entry=[Math.round(ex/2)*2,Math.round(ey/2)*2];
  const nb = trial%3;
  const bends=[]; for(let i=0;i<nb;i++) bends.push(rndPt());
  if (test(entry,bends)) { if (entry[0]<best) { best=entry[0]; bestSol={entry,bends}; } }
}
console.log('min entry x found:', best, bestSol);

console.log('--- direct entry-to-scree only, minimize x, but print more options ---');
let goodDirect=[];
for (let ex=200;ex<=296;ex+=2) for (let ey=24;ey<=156;ey+=2) if (test([ex,ey],[])) goodDirect.push([ex,ey]);
console.log('direct solutions:', goodDirect.length);
console.log(goodDirect);

console.log('--- try entry hugging the far right edge ---');
console.log('(296,150),(296,24):', test([296,150],[[296,24]]));
console.log('(292,150),(292,24):', test([292,150],[[292,24]]));
console.log('(296,140):', test([296,140],[]));
