const bounds = new WeakMap();
let closed = true, skipped = 0, requests = 0;
const native = f => typeof f === 'function' && /\[native code\]/.test(Function.prototype.toString.call(f));
export function checkInvisibleForegroundPipeline(g) {
  const p = HTMLCanvasElement.prototype, w = Object.getOwnPropertyDescriptor(p,'width'), h = Object.getOwnPropertyDescriptor(p,'height');
  if (![document.createElement,p.getContext,w.get,w.set,h.get,h.set,CanvasRenderingContext2D.prototype.drawImage,CanvasRenderingContext2D.prototype.getImageData,...(g?[g.drawImage,g.getTransform]:[])].every(native)) closed = false;
  return closed;
}
export function freshInvisibleForeground(build) {
  const eligible = checkInvisibleForegroundPipeline(), c = build();
  if (!eligible || !c.width || !c.height || c.width*c.height > 1048576) return c;
  const g=c.getContext('2d'), a=g.getContextAttributes();
  if (!a.willReadFrequently || !a.alpha || a.colorSpace!=='srgb' || (a.colorType&&a.colorType!=='unorm8') || g.isContextLost()) return c;
  const data=g.getImageData(0,0,c.width,c.height).data;
  let top=c.height, bottom=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]){top=Math.min(top,y);bottom=y+1;break;}
  bounds.set(c,{width:c.width,height:c.height,top,bottom});
  const invalidate=e=>bounds.delete(e.currentTarget);
  c.addEventListener('contextlost',invalidate);c.addEventListener('contextrestored',invalidate);
  return c;
}
export function foregroundWhollyInvisible(g,c,y,height) {
  requests++;
  const b=bounds.get(c),t=g.getTransform();
  if(!closed||!b||!c.width||!c.height||b.width!==c.width||b.height!==c.height||!Number.isInteger(y)||!Number.isInteger(height)||height<=0||
     g.isContextLost()||g.globalCompositeOperation!=='source-over'||g.filter!=='none'||g.shadowBlur||g.shadowOffsetX||g.shadowOffsetY||g.shadowColor!=='rgba(0, 0, 0, 0)'||
     t.a!==1||t.b||t.c||t.d!==1||!Number.isInteger(t.e)||!Number.isInteger(t.f))return false;
  if(b.bottom===0||b.bottom+y<=0||b.top+y>=height){skipped++;return true;}
  return false;
}
export function invisibleForegroundInfo(){return{closed,skipped,requests};}
