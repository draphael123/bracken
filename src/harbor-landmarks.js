// Landmarks sit behind the playable terrain, with every mast and tower foot on its deck.
export function drawHarborLandmarks(g,L,cx,cy){
 if(!L.harborSections)return;
 const r=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x-cx),Math.round(y-cy),w,h);};
 if(cx<640*16&&cx+960>578*16){
  for(const x of [589,609,630]){const xx=x*16;r(xx,12*16,5,10*16,'#66553d');r(xx+1,12*16,1,10*16,'#a08b59');r(xx-30,14*16,65,4,'#7b6947');
   for(let y=0;y<40;y++)r(xx-27+y*.18,14*16+4+y,51-y*.35,1,y%8===0?'#697276':'#85857a');
   g.strokeStyle='#5f645b';g.beginPath();g.moveTo(xx-cx,12*16-cy);g.lineTo(xx-70-cx,22*16-cy);g.moveTo(xx-cx,12*16-cy);g.lineTo(xx+70-cx,22*16-cy);g.stroke();
  }
 }
 if(cx<982*16&&cx+960>956*16){
  const x=962*16,top=10*16,base=22*16;r(x-28,top+28,56,base-top-28,'#535e60');r(x-24,top+28,9,base-top-28,'#6f7a76');
  for(let y=top+36;y<base;y+=12){r(x-28,y,56,1,'#384b51');for(let xx=x-28+(y%24?0:14);xx<x+28;xx+=28)r(xx,y-11,1,11,'#394c50');}
  r(x-34,top+25,68,5,'#8a8d7a');r(x-24,top+5,48,20,'#253d45');r(x-19,top+8,38,14,'#d6b86f');for(const xx of [x-22,x-2,x+20])r(xx,top+5,3,21,'#4c625e');
  for(let y=0;y<8;y++)r(x-31+y*3,top-3+y,62-y*6,1,'#566b66');
  for(const yy of [top+50,top+90,top+130])r(x-4,yy,8,14,'#293f49');r(x-8,base-25,16,25,'#293a3c');
 }
}
