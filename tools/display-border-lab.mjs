// Candidate experiment only. It does not change the game's renderer or any registered check.
export function installDisplayBorderLab() {
 const original=CanvasRenderingContext2D.prototype.fillRect,display=document.getElementById('c');
 const counts=window.__borderLab={frames:0,baselinePixels:0,candidatePixels:0};
 CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){
  if(this.canvas!==display||x!==0||y!==0||w!==display.width||h!==display.height||this.fillStyle!=='#0b1410')return original.call(this,x,y,w,h);
  const view=BK.view;let scale=Math.max(1,Math.floor(Math.min(w/view.VW,h/view.VH)));
  if(BK.SET.scale!=='auto')scale=Math.min(scale,BK.SET.scale);
  const left=Math.floor((w-view.VW*scale)/2),top=Math.floor((h-view.VH*scale)/2),right=left+view.VW*scale,bottom=top+view.VH*scale;
  counts.frames++;counts.baselinePixels+=w*h;
  const paint=(x,y,w,h)=>{if(w>0&&h>0){counts.candidatePixels+=w*h;original.call(this,x,y,w,h);}};
  paint(0,0,w,top);paint(0,bottom,w,h-bottom);paint(0,top,left,bottom-top);paint(right,top,w-right,bottom-top);
 };
}
