// Original pixel art: a scavenger wearing a brass diving bell as its shell.
import {canvas,rect,line,circle,fillPoly,outline,flipX,whiten} from './px.js';
export function bakeBellcrab(){
 const R=Array.from({length:12},(_,frame)=>{
  const [c,g]=canvas(88,58), tell=[2,4,6,8].includes(frame),open=frame===10,hurt=frame===11;
  const copper=hurt?'#c4bbb1':'#b7833e',light='#f3d28a',dark='#634b32',flesh=open?'#ef9177':'#ac5845';
  const bob=frame===1?1:0,cy=36+bob;
  // Six jointed legs keep the same foot row in every pose.
  for(const side of [-1,1])for(let k=0;k<3;k++){
   const x=40+side*(13+k*3),tip=40+side*(24+k*4),joint=tip-side*4;
   line(g,x,cy+5,joint,48-k*2,dark,4);line(g,joint,48-k*2,tip,55,flesh,3);rect(g,tip-2,54,4,2,light);
  }
  fillPoly(g,[[18,43],[22,22+bob],[29,10+bob],[48,10+bob],[57,23+bob],[61,43]],dark);
  fillPoly(g,[[21,40],[25,23+bob],[31,13+bob],[47,13+bob],[54,24+bob],[58,40]],copper);
  rect(g,29,18+bob,3,19,light);rect(g,51,23+bob,3,17,'#876333');
  rect(g,20,39,40,5,light);rect(g,18,44,44,3,dark);rect(g,22,43,36,2,copper);
  for(const x of [24,32,40,48,56])rect(g,x,40,2,2,dark);
  // Hoisting eye and dark glass porthole; pressure flashes cyan through the glass.
  circle(g,39,8,5,dark);circle(g,39,8,3,copper);rect(g,38,6,3,4,'#132630');
  circle(g,40,29+bob,10,dark);circle(g,40,29+bob,8,light);circle(g,40,29+bob,6,frame===7?'#e7ffff':'#244f59');
  rect(g,37,25+bob,3,3,'#a1dbdf');rect(g,42,30+bob,2,4,'#407c85');
  if(open){rect(g,27,44,27,6,flesh);for(const x of [31,37,43,49])rect(g,x,45,3,2,'#ffd9ae');}
  // Eye stalks and asymmetric crusher/cutter claws are outside the metal shell.
  for(const x of [53,58]){line(g,x,38,x+3,33,flesh,2);rect(g,x+2,31,3,3,tell?'#fff1a5':'#aaf5d5');}
  for(const side of [-1,1]){
   const raised=frame===4?-10:frame===2&&side===1?-14:frame===8?3:frame===5?6:0;
   const reach=(frame===3&&side===1)?5:0,ax=40+side*23,tip=40+side*(31+reach),yy=38+raised;
   line(g,40+side*17,44,ax,yy+5,dark,5);line(g,ax,yy+5,tip,yy,flesh,4);
   fillPoly(g,[[tip-side*5,yy-3],[tip+side*2,yy-7],[tip+side*5,yy-4],[tip+side*1,yy],[tip+side*5,yy+3],[tip,yy+6],[tip-side*5,yy+3]],flesh);
   line(g,tip-side*2,yy-3,tip+side*2,yy-5,light,2);
  }
  if(frame===6||frame===7)for(const x of [27,35,45])rect(g,x,18-(x%3)*3,2,3,'#bcf3ee');
  outline(c,'#132126');return c;
 });
 const L=R.map(flipX),white=R.map(c=>whiten(c));
 return {R,L,white:{R:white,L:white.map(flipX)},ax:40,ay:57,w:42,h:43};
}

export function bakeBellguard(){
 const R=Array.from({length:6},(_,f)=>{const[c,g]=canvas(38,42),brass=f===5?'#dbd7c0':'#b88b4a',suit='#426661',dark='#1b3338',step=f===1?3:0;
 rect(g,10,22,16,11,suit);rect(g,12,31,5,8,dark);rect(g,21,31-step,5,8+step,dark);rect(g,8,38,10,3,brass);rect(g,21,38,10,3,brass);
 circle(g,18,16,12,dark);circle(g,18,16,10,brass);rect(g,8,24,20,3,'#e1c47b');circle(g,21,15,6,'#183a44');rect(g,19,12,3,3,f===3?'#ff7970':'#96e8e3');
 for(const x of [10,15,25])rect(g,x,8,2,2,'#eeddaa');line(g,9,21,5,31,suit,4);line(g,26,25,31,f===2?17:29,suit,4);
 line(g,32,f===2?8:19,32,35,brass,2);line(g,32,f===2?8:19,36,f===2?8:19,brass,2);line(g,36,f===2?8:19,36,f===2?13:24,brass,2);
 if(f===3){rect(g,15,3,6,2,'#ffb090');rect(g,17,0,2,3,'#ff6b6b');}if(f===4)rect(g,12,24,12,5,'#83b6a4');outline(c,'#12242a');return c;});
 const L=R.map(flipX),w=R.map(whiten);return{R,L,white:{R:w,L:w.map(flipX)},ax:18,ay:42,w:20,h:33};
}
