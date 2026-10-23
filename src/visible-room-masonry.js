// Keep the original wet ashlar and its world-relative courses; omit only cells outside the canvas.
export function drawVisibleRoomMasonry(g, sx, sy, w, h) {
  let left=sx, top=sy, right=sx+w, bottom=sy+h;
  const m=g.getTransform(), det=m.a*m.d-m.b*m.c;
  if(w>0 && h>0 && Number.isFinite(det) && Math.abs(det)>1e-12) {
    // Include a device-pixel border before inverting, including rotated, skewed and scaled views.
    const corners=[[-1,-1],[g.canvas.width+1,-1],[-1,g.canvas.height+1],[g.canvas.width+1,g.canvas.height+1]];
    const points=corners.map(([x,y])=>[(m.d*(x-m.e)-m.c*(y-m.f))/det,(-m.b*(x-m.e)+m.a*(y-m.f))/det]);
    if(points.flat().every(Number.isFinite)) {
      left=Math.max(sx,Math.min(...points.map(p=>p[0])));
      right=Math.min(sx+w,Math.max(...points.map(p=>p[0])));
      top=Math.max(sy,Math.min(...points.map(p=>p[1])));
      bottom=Math.min(sy+h,Math.max(...points.map(p=>p[1])));
    }
  }
  g.fillStyle='#16262a'; g.fillRect(sx,sy,w,h);
  const firstY=sy+Math.max(0,Math.floor((top-sy)/8)-1)*8;
  for(let yy=firstY;yy<Math.min(sy+h,bottom+8);yy+=8) {
    const origin=sx+(((yy / 8) & 1)?12:0);
    const firstX=origin+Math.max(0,Math.floor((left-origin)/24)-1)*24;
    for(let xx=firstX;xx<Math.min(sx+w,right+24);xx+=24) {
      g.fillStyle='#1e343a'; g.fillRect(xx,yy,22,7);
      g.fillStyle='#152a2e'; g.fillRect(xx,yy+6,22,1);
    }
    g.fillStyle='#0e1c1e'; g.fillRect(sx,yy+7,w,1);
  }
  if(h>0)g.fillStyle='#0e1c1e';
}
