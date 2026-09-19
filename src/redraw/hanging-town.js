// Houses hung from the trunks: warm windows, patched roofs, a porch and the ropes that carry it.
import {canvas,rect,line,fillPoly} from '../px.js';
export function bakeHangingHouse(hall=false){
  const w=hall?144:104,h=hall?108:78,[c,g]=canvas(w,h),r=(x,y,a,b,col)=>rect(g,x,y,a,b,col),base=h-1,roof=hall?29:17;
  for(const x of [12,w-16]){r(x,roof+22,4,base-roof-21,'#8c7453');line(g,x,roof+35,x+14,base-2,'#b3996b');}
  r(8,roof+10,w-16,h-roof-24,'#9c7857');
  for(let x=12;x<w-10;x+=9)r(x,roof+11,1,h-roof-27,'#775e48');
  r(8,roof+19,w-16,3,'#b09770');r(8,h-23,w-16,4,'#b09770');
  fillPoly(g,[[3,roof+13],[w/2,roof-10],[w-3,roof+13]],'#79534b');
  for(let y=roof-6;y<roof+13;y+=4){const inset=Math.abs(y-(roof+13))*1.6;r(4+inset,y,w-8-inset*2,2,'#ac7960');}
  r(w-28,roof-6,8,17,'#8f826e');r(w-30,roof-7,12,3,'#b2a58a');
  for(const x of [20,w-34]){r(x,roof+28,14,16,'#766650');r(x+2,roof+30,10,12,'#edc475');r(x+6,roof+30,1,12,'#a47c51');r(x+2,roof+35,10,1,'#a47c51');r(x-2,roof+44,18,2,'#b39972');}
  r(w/2-7,h-29,14,26,'#5e554a');r(w/2-6,h-28,12,25,'#79644e');r(w/2-2,h-15,2,2,'#d0b879');
  r(w/2-12,h-4,24,3,'#b39b74');r(5,h-21,w-10,3,'#b39b74');
  for(const x of [7,w-9]){r(x,0,2,roof+15,'#b49e72');for(let y=3;y<roof+15;y+=6)r(x-1,y,4,1,'#7f7056');}
  if(hall){r(w/2-14,2,28,22,'#a58d68');fillPoly(g,[[w/2-19,4],[w/2,-7],[w/2+19,4]],'#977358');r(w/2-8,7,16,15,'#706552');r(w/2-5,8,10,11,'#c4a061');r(w/2-8,18,16,3,'#d0b572');r(20,h-43,w-40,4,'#a89876');}
  return c;
}
export function paintHouseSmoke(g,x,y,time){
  for(let i=0;i<4;i++){const u=(time*.35+i*.25)%1;g.globalAlpha=(1-u)*.24;g.fillStyle='#cbbfaa';g.fillRect(Math.round(x+Math.sin(time*.7+i)*4+u*10),Math.round(y-u*27),4+Math.floor(u*7),3+Math.floor(u*4));}g.globalAlpha=1;
}
