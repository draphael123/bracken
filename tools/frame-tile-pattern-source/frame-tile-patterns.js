// No retained tile/canvas/pattern cache. Every pattern and path belongs to this call.
const native = f => typeof f === 'function' && /\[native code\]/.test(Function.prototype.toString.call(f));
export function drawFrameTilePatterns(g,L,tileSpr,LW,LH,TS,cx,cy,VW,VH,WRD,T) {
  if(TS!==16||L.edgeLit||WRD.size||!Number.isInteger(cx)||!Number.isInteger(cy)||
     !Array.isArray(tileSpr)||!Array.isArray(L.grid)||Object.getPrototypeOf(tileSpr)!==Array.prototype||Object.getPrototypeOf(L.grid)!==Array.prototype||
     g.globalAlpha!==1||g.globalCompositeOperation!=='source-over'||g.filter!=='none'||g.imageSmoothingEnabled||
     g.shadowBlur||g.shadowOffsetX||g.shadowOffsetY||g.shadowColor!=='rgba(0, 0, 0, 0)'||g.isContextLost())return false;
  const proto=CanvasRenderingContext2D.prototype,cp=HTMLCanvasElement.prototype,pp=CanvasPattern.prototype,w=Object.getOwnPropertyDescriptor(cp,'width'),h=Object.getOwnPropertyDescriptor(cp,'height');
  if(Object.getOwnPropertyDescriptor(g,'fillStyle')||![g.drawImage,g.createPattern,g.fill,g.getTransform,g.isContextLost,cp.getContext,w?.get,w?.set,h?.get,h?.set,proto.getImageData,proto.isContextLost,pp.setTransform,Path2D,Path2D.prototype.rect].every(native))return false;
  const tr=g.getTransform();if(tr.a!==1||tr.b||tr.c||tr.d!==1||!Number.isInteger(tr.e)||!Number.isInteger(tr.f))return false;
  const tx0=Math.floor(cx/TS),ty0=Math.floor(cy/TS),x1=tx0+Math.ceil(VW/TS)+1,y1=ty0+Math.ceil(VH/TS)+1;
  if((x1-tx0+1)*(y1-ty0+1)>4096)return false;
  const groups=new Map();
  // Complete eligibility scan before painting. In-place source repainting is observed anew each frame.
  for(let ty=ty0;ty<=y1;ty++)for(let tx=tx0;tx<=x1;tx++){
    if(tx<0||ty<0||tx>=LW||ty>=LH)continue;
    const i=ty*LW+tx,sd=Object.getOwnPropertyDescriptor(tileSpr,String(i));
    if(!sd){if(i in tileSpr)return false;continue;}if(!('value'in sd))return false;
    const s=sd.value;if(!s)continue;
    const td=Object.getOwnPropertyDescriptor(L.grid,String(i));if(!td||!('value'in td)||td.value===T.REED)return false;
    if(!(s instanceof HTMLCanvasElement)||s===g.canvas||Object.getPrototypeOf(s)!==cp||Object.getOwnPropertyDescriptor(s,'width')||Object.getOwnPropertyDescriptor(s,'height')||s.width!==TS||s.height!==TS||s.getContext!==cp.getContext)return false;
    let group=groups.get(s);if(!group){const context=s.getContext('2d');if(!context||context.isContextLost!==proto.isContextLost||context.isContextLost())return false;group={path:new Path2D(),pattern:null};groups.set(s,group);}
    group.path.rect(tx*TS-cx,ty*TS-cy,TS,TS);
  }
  // Pattern creation cannot draw. An unsupported source falls back before any destination pixels change.
  try{for(const[s,group]of groups){group.pattern=g.createPattern(s,'repeat');if(!group.pattern)return false;group.pattern.setTransform({a:1,b:0,c:0,d:1,e:-cx,f:-cy});}}catch{return false;}
  const style=g.fillStyle;try{for(const group of groups.values()){g.fillStyle=group.pattern;g.fill(group.path);}}finally{g.fillStyle=style;}
  return true;
}
