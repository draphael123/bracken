// work/claude/coast-tail-search.mjs — scratch tool, not part of the check suite. Finds the CAUSEWAY -> exit tail
// on the COAST sheet that avoids both FLOTILLA->HURRICANE and HURRICANE->LAMPLIT; see the comment on COAST_PATH
// in src/main.js.
function orient(p,q,r){return (q[1]-p[1])*(r[0]-q[0])-(q[0]-p[0])*(r[1]-q[1]);}
function onSeg(p,q,r){return Math.min(p[0],r[0])<=q[0]&&q[0]<=Math.max(p[0],r[0])&&Math.min(p[1],r[1])<=q[1]&&q[1]<=Math.max(p[1],r[1]);}
function cross(p1,p2,p3,p4){
  const o1=orient(p1,p2,p3),o2=orient(p1,p2,p4),o3=orient(p3,p4,p1),o4=orient(p3,p4,p2);
  if(o1!==0&&o2!==0&&o3!==0&&o4!==0) return (o1>0)!==(o2>0)&&(o3>0)!==(o4>0);
  if(o1===0&&onSeg(p1,p3,p2))return true; if(o2===0&&onSeg(p1,p4,p2))return true;
  if(o3===0&&onSeg(p3,p1,p4))return true; if(o4===0&&onSeg(p3,p2,p4))return true;
  return false;
}
const MARGIN=24, W=320,H=180;
function marginOk(p){ return p[0]>=MARGIN && p[0]<=W-MARGIN && p[1]>=MARGIN && p[1]<=H-MARGIN; }
const head = [[48,172],[95,155],[140,140],[190,135],[240,125],[258,112],[265,95],[245,75],[220,55],[175,38],[130,25],[85,32],[40,45],[42,70],[50,95],[105,80],[160,100]]; // entry..causeway FIXED
function test(bend){
  const full = [...head, bend, [140,8]];
  if (!marginOk(bend)) return false;
  const segs=[]; for(let i=0;i+1<full.length;i++) segs.push([full[i],full[i+1]]);
  for(let i=0;i<segs.length;i++) for(let j=i+2;j<segs.length;j++) if (cross(segs[i][0],segs[i][1],segs[j][0],segs[j][1])) return false;
  return true;
}
let good=[];
for (let x=24;x<=200;x+=2) for (let y=24;y<=150;y+=2) if (test([x,y])) good.push([x,y]);
console.log('found', good.length);
console.log(good.slice(0,40));

console.log('--- 2-bend search ---');
function test2(b1,b2){
  const full = [...head, b1, b2, [140,8]];
  if (!marginOk(b1)||!marginOk(b2)) return false;
  const segs=[]; for(let i=0;i+1<full.length;i++) segs.push([full[i],full[i+1]]);
  for(let i=0;i<segs.length;i++) for(let j=i+2;j<segs.length;j++) if (cross(segs[i][0],segs[i][1],segs[j][0],segs[j][1])) return false;
  return true;
}
let good2=[];
for (let x1=24;x1<=200;x1+=6) for (let y1=24;y1<=150;y1+=6)
  for (let x2=24;x2<=200;x2+=6) for (let y2=24;y2<=150;y2+=6) {
    if (test2([x1,y1],[x2,y2])) good2.push([x1,y1,x2,y2]);
  }
console.log('found', good2.length);
console.log(good2.slice(0,20));

console.log('check (30,90),(30,26):', test2([30,90],[30,26]));
console.log('check (24,96),(24,24):', test2([24,96],[24,24]));
console.log('check (26,96),(26,26):', test2([26,96],[26,26]));
