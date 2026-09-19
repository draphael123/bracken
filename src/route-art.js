import {canvas} from './px.js';
export function bakeRouteLedges(){
 const out={};for(const kind of ['cargo','awning']){const a=[];for(let v=0;v<3;v++){const[c,g]=canvas(16,16);g.fillStyle='#251e1a';g.fillRect(0,0,16,7);g.fillStyle=kind==='cargo'?'#ae8552':'#a57b56';g.fillRect(0,0,16,3);g.fillStyle='#e2c59a';g.fillRect(0,0,16,1);g.fillStyle=kind==='cargo'?'#67482f':'#813b47';g.fillRect(0,3,16,3);if(kind==='awning'){g.fillStyle='#c6a575';g.fillRect(v*4,3,4,3);}else{g.fillStyle='#526367';g.fillRect(3+v*4,1,2,5);g.fillStyle='#afc5c4';g.fillRect(3+v*4,1,1,1);}a.push(c);}out[kind]={ledge:a,ledgeL:a[0],ledgeR:a[2]};}return out;
}
export function drawRouteSupports(g,L,cx,cy){
 for(const p of L.routeSupports||[]){const x=Math.round(p.x*16+6-cx),y=Math.round(p.y*16+5-cy),bottom=Math.round(p.bottom*16-cy);if(x < -4||x>g.canvas.width+4||bottom<0||y>g.canvas.height)continue;
 g.fillStyle='#46382c';g.fillRect(x,y,4,bottom-y);g.fillStyle='#806746';g.fillRect(x,y,1,bottom-y);g.fillStyle='#b2a186';g.fillRect(x-1,y+5,6,2);
 }
}
export function drawWorkPlatform(g,m,cx,cy,style,L){
 const x=Math.round(m.x-cx),y=Math.round(m.y-cy),w=m.w,ax=Math.round((m.x0??m.x)+w/2-cx),top=Math.round((Math.min(m.y0??m.y,m.y1??m.y)-48)-cy);
 const tx=Math.max(0,Math.min(L.W-1,Math.floor((ax+cx-9)/16)));let by=Math.max(0,Math.floor(Math.max(m.y0??m.y,m.y1??m.y,m.y)/16)+1);while(by<L.H-1&&![1,8].includes(L.grid[by*L.W+tx]))by++;
 const base=by*16-cy;g.fillStyle='#453629';g.fillRect(ax-11,top-3,5,Math.max(4,base-top+3));g.fillStyle='#8f7150';g.fillRect(ax-11,top-3,1,Math.max(4,base-top+3));g.fillStyle='#55565a';g.fillRect(ax-12,base-8,7,3);
 g.strokeStyle='#96846a';g.lineWidth=1;g.beginPath();g.moveTo(ax,top);g.lineTo(x+3,y);g.moveTo(ax,top);g.lineTo(x+w-3,y);g.stroke();
 g.fillStyle='#4b3424';g.fillRect(ax-6,top-3,12,4);g.fillStyle='#c2a56d';g.fillRect(ax-1,top-2,2,3);
 g.fillStyle='#322b25';g.fillRect(x,y,w,8);g.fillStyle=style==='town'?'#bd9b72':'#9c855b';g.fillRect(x,y,w,2);g.fillStyle=style==='town'?'#783b4b':'#62523b';g.fillRect(x+1,y+3,w-2,4);g.fillStyle='#c8b892';for(let k=4;k<w;k+=12)g.fillRect(x+k,y+3,2,2);
}
