import{canvas,rect,line,circle,fillPoly,flipX,whiten,outline}from'./px.js';
export function bakeCoastalFoe(kind){const R=Array.from({length:6},(_,f)=>{const[c,g]=canvas(56,44),bone='#d2d1b1',dark='#18343b',cyan='#a6f0e8',wind=f===2||f===3,step=f===1?3:0;
 if(kind==='lanternshade'){
  fillPoly(g,[[15,15],[28,10],[37,18],[40,35],[32,31],[27,39],[22,33],[14,37],[17,26]],'#417f87');fillPoly(g,[[18,17],[29,13],[33,21],[34,32],[27,29],[22,35],[19,30]],'#8fc2c7');circle(g,26,13,8,dark);circle(g,26,12,6,'#c7ddd4');rect(g,24,10,2,3,dark);rect(g,29,10,2,3,dark);line(g,33,21,43,wind?13:26,cyan,2);rect(g,41,wind?7:20,8,11,'#665b40');rect(g,43,wind?9:22,4,6,wind?'#ffe394':'#a6f0e8');line(g,44,wind?4:17,44,wind?7:20,bone,1);
 }else{
  const coat=kind==='bonecorsair'?'#794352':'#39706c';rect(g,19,22,13,10,coat);line(g,21,30,18,41,bone,3);line(g,29,30,32,41-step,bone,3);rect(g,15,40,8,3,dark);rect(g,29,40-step,8,3,dark);circle(g,25,15,7,bone);rect(g,21,12,3,4,dark);rect(g,28,12,3,4,dark);rect(g,23,19,6,2,dark);for(let k=0;k<3;k++)rect(g,22,24+k*3,7,1,bone);
  if(kind==='bonecorsair'){fillPoly(g,[[14,9],[19,3],[25,6],[34,3],[39,10]],'#342c3a');rect(g,24,6,3,2,bone);line(g,32,24,wind?44:40,wind?16:28,bone,3);line(g,wind?43:41,wind?6:13,wind?47:45,wind?22:32,'#b8d4d7',3);rect(g,38,wind?22:31,11,2,'#ba9555');}
  else{rect(g,16,7,20,3,'#566959');rect(g,19,4,14,4,'#70846d');line(g,18,24,11,27,bone,3);circle(g,11,26,8,'#3c4e49');circle(g,11,26,5,'#8c9c8c');line(g,32,24,40,wind?16:26,bone,3);line(g,36,wind?13:26,53,wind?13:26,'#a68b66',2);fillPoly(g,[[52,wind?9:22],[55,wind?13:26],[52,wind?17:30]],cyan);}
 }
 outline(c,'#152a31');return c;});const L=R.map(flipX),w=R.map(whiten);return{R,L,white:{R:w,L:w.map(flipX)},ax:25,ay:43,w:22,h:34};}
