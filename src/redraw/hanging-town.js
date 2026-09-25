// Houses hung from the trunks: warm windows, patched roofs, a porch and the ropes that carry it.
// ONE STYLE A FLOOR (docs/briefs/hanging-village-rework.md §2): the review found the same stilt house eleven times over, so a
// house now says which floor it is on - a turf-roofed shanty in the roots, a rope-maker's shed hung with coils, the timber
// market house (the old one), a whitewashed miller's cottage, a tall rookery house with nest boxes, a lantern-maker's with
// every window lit. The hall is the market's and the roots' public building, as before.
import {canvas,rect,line,fillPoly} from '../px.js';
const STYLES={
  market:{wall:'#9c7857',board:'#775e48',trim:'#b09770',roof:'#79534b',tile:'#ac7960',post:'#8c7453',brace:'#b3996b',win:'#edc475',door:'#79644e',rope:'#b49e72'},
  roots:{wall:'#5a4a3a',board:'#46382c',trim:'#6e5a44',roof:'#3e5a2e',tile:'#5a7a3e',post:'#4a3826',brace:'#6a5038',win:'#e8b860',door:'#3e3024',rope:'#7a6a4a',turf:true,low:true},
  rope:{wall:'#8a6a44',board:'#6a5034',trim:'#b8946a',roof:'#6a4a34',tile:'#8a6448',post:'#6a5034',brace:'#9a7a52',win:'#edc475',door:'#5a4430',rope:'#c8a860',coils:true},
  mill:{wall:'#d8d4c8',board:'#b8b4a8',trim:'#e8e4d8',roof:'#4a4e5a',tile:'#62667a',post:'#8a867a',brace:'#a4a094',win:'#f0d080',door:'#6a5a44',rope:'#b4b0a2',stone:true},
  rook:{wall:'#6e7078',board:'#5a5c64',trim:'#8a8c94',roof:'#2e2a34',tile:'#44404c',post:'#4e5058',brace:'#7a7c84',win:'#e8c878',door:'#3a3440',rope:'#9a9ca4',tall:true,boxes:true},
  lantern:{wall:'#3e3446',board:'#2e2636',trim:'#5a4c5e',roof:'#2a2230',tile:'#3e3444',post:'#3a3040',brace:'#5a4c5e',win:'#ffc860',door:'#2a2030',rope:'#8a7a6a',lit:true},
};
export function bakeHangingHouse(hall=false,style='market'){
  const S=STYLES[style]||STYLES.market,w=hall?144:104,h=hall?108:(S.tall?92:S.low?64:78),[c,g]=canvas(w,h),r=(x,y,a,b,col)=>rect(g,x,y,a,b,col),base=h-1,roof=hall?29:S.tall?25:S.low?15:17;
  for(const x of [12,w-16]){r(x,roof+22,4,base-roof-21,S.post);line(g,x,roof+35,x+14,base-2,S.brace);}
  r(8,roof+10,w-16,h-roof-24,S.wall);
  if(S.stone){for(let y=roof+12;y<h-14;y+=6)for(let x=10+((y/6)%2)*5;x<w-12;x+=10)r(x,y,1,5,S.board);}
  else for(let x=12;x<w-10;x+=9)r(x,roof+11,1,h-roof-27,S.board);
  r(8,roof+19,w-16,3,S.trim);r(8,h-23,w-16,4,S.trim);
  fillPoly(g,[[3,roof+13],[w/2,roof-(S.tall?16:10)],[w-3,roof+13]],S.roof);
  for(let y=roof-6;y<roof+13;y+=4){const inset=Math.abs(y-(roof+13))*1.6;r(4+inset,y,w-8-inset*2,2,S.tile);}
  if(S.turf)for(let x=6;x<w-6;x+=3)r(x,roof+10-((x*7)%4),2,3,'#6a9a4a');   /* the roots' roofs are sod, and grass grows on them */
  r(w-28,roof-6,8,17,S.stone?'#a49e90':'#8f826e');r(w-30,roof-7,12,3,S.stone?'#c8c2b4':'#b2a58a');
  const winY=roof+28;for(const x of [20,w-34]){r(x,winY,14,16,S.board);r(x+2,winY+2,10,12,S.win);r(x+6,winY+2,1,12,'#a47c51');r(x+2,winY+7,10,1,'#a47c51');r(x-2,winY+16,18,2,S.trim);}
  if(S.lit){g.globalAlpha=.35;r(14,winY-4,26,26,'#ffc860');r(w-40,winY-4,26,26,'#ffc860');g.globalAlpha=1;r(w/2-2,roof+14,4,6,'#ffc860');}   /* a lantern-maker keeps every window lit */
  if(S.tall){r(w/2-7,roof+14,14,10,S.board);r(w/2-5,roof+16,10,6,S.win);}
  r(w/2-7,h-29,14,26,'#5e554a');r(w/2-6,h-28,12,25,S.door);r(w/2-2,h-15,2,2,'#d0b879');
  r(w/2-12,h-4,24,3,S.trim);r(5,h-21,w-10,3,S.trim);
  if(S.coils)for(const x of [16,w-22]){for(let k=0;k<3;k++){r(x,h-40+k*3,8,2,k%2?'#a88848':'#c8a860');}r(x+3,h-42,2,3,'#6a5034');}   /* coils hung on the rope-maker's walls */
  if(S.boxes)for(const [x,y] of [[10,roof+12],[w-18,roof+12],[w/2+14,roof-2]]){r(x,y,8,7,'#7a5a3c');r(x+2,y+2,4,4,'#1e1e24');r(x-1,y-1,10,2,'#5a4430');}   /* nest boxes under the eaves */
  for(const x of [7,w-9]){r(x,0,2,roof+15,S.rope);for(let y=3;y<roof+15;y+=6)r(x-1,y,4,1,'#7f7056');}
  if(hall){r(w/2-14,2,28,22,'#a58d68');fillPoly(g,[[w/2-19,4],[w/2,-7],[w/2+19,4]],'#977358');r(w/2-8,7,16,15,'#706552');r(w/2-5,8,10,11,'#c4a061');r(w/2-8,18,16,3,'#d0b572');r(20,h-43,w-40,4,'#a89876');}
  return c;
}
export const HOUSE_STYLES=Object.keys(STYLES);
export function paintHouseSmoke(g,x,y,time){
  for(let i=0;i<4;i++){const u=(time*.35+i*.25)%1;g.globalAlpha=(1-u)*.24;g.fillStyle='#cbbfaa';g.fillRect(Math.round(x+Math.sin(time*.7+i)*4+u*10),Math.round(y-u*27),4+Math.floor(u*7),3+Math.floor(u*4));}g.globalAlpha=1;
}
