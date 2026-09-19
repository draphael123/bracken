// Join the painted fall to the supplying stream, without changing swim geometry.
export function fallBounds(f, pools) {
  const source=pools.find(p=>!p.dry&&Math.abs(p.y-f.y0)<=8&&p.x0<f.x0&&p.x1>=f.x0-2&&p.x1<=f.x1+4);
  const y0=source?source.y:f.y0;
  return {x0:f.x0,x1:f.x1,y0,y1:Math.max(y0+1,f.y1),joined:!!source};
}
