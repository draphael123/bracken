/* tools/kitchengate2art-sheet.mjs - contact sheets for the KITCHEN GATE 2 art pass (claude/kitchengate2art): the 8 dressing props, the serving line / griddle / meat rail,
   the attendant's 7 frames, the boss's hall pieces (hatch, belt, platter, cauldron, burn, dishes, ham, plate, pepper stove) and every Grubbag pose. Nearest-neighbour upscaled.
   Writes work/claude/lane-done/kitchengate2art-<name>.png. Headless Chrome through tools/cdp.mjs, ONE page, closed at the end. Not in the suite.
     [PORT=<port>] node tools/kitchengate2art-sheet.mjs [props,mech,attendant,hall,poses] [tag] */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null, tag = process.argv[3] || 'after';
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const KA=await import('/src/redraw/kitchen_art.js');const GA=await import('/src/redraw/grubbag_art.js');const GH=await import('/src/grubbag-hands.js');
    const only=${JSON.stringify(only ? [...only] : null)},want=n=>!only||only.includes(n);
    const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return [c,g];};
    const up=(c,k)=>{const [o,g]=mkc(c.width*k,c.height*k);g.imageSmoothingEnabled=false;g.drawImage(c,0,0,c.width*k,c.height*k);return o.toDataURL('image/png');};
    const label=(g,t,x,y)=>{g.font='8px monospace';g.fillStyle='#f2ece0';g.fillText(t,x,y);};
    const bg=(g,w,h,fy)=>{g.fillStyle='#2a2430';g.fillRect(0,0,w,h);g.fillStyle='#4a3a42';g.fillRect(0,fy,w,h-fy);g.fillStyle='#6a5058';g.fillRect(0,fy,w,1);};
    const out={};
    if(want('props')){const kinds=['oven','spices','flour','block','vent','basin','hatch','pans'];const [c,g]=mkc(8*84,120);bg(g,c.width,120,100);kinds.forEach((k,i)=>{const x=42+i*84;KA.drawProp(g,k,x,k==='pans'?18:100,1.3,i+2);label(g,k,x-18,114);});out.props=up(c,3);}
    if(want('mech')){const [c,g]=mkc(420,230);bg(g,420,230,60);
      KA.drawLine(g,10,170,50,3,1,false,1);label(g,'floor line',12,12);KA.drawLine(g,190,400,50,9,-1,true,1);label(g,'counter line (west)',192,12);
      const fy=130;g.fillStyle='#4a3a42';g.fillRect(0,fy,420,30);
      KA.drawFlare(g,10,70,fy,'cold',0,0,1);KA.drawFlare(g,90,150,fy,'glow',0.5,30,1.1);KA.drawFlare(g,170,230,fy,'glow',0.95,30,1.2);KA.drawFlare(g,250,310,fy,'flame',0.5,34,1.3);label(g,'griddle: cold, glow .5, glow .95, flame',12,172);
      KA.drawMeatRail(g,{x0:10,y0:196,x1:400,y1:196,dir:1,meat:1},0,0,0.4);label(g,'meat rail',12,224);out.mech=up(c,3);}
    if(want('attendant')){const A=KA.bakeAttendant();const [c,g]=mkc(7*40,50);bg(g,c.width,50,44);['idle','walk0','walk1','aim','throw','guard','bash'].forEach((n,i)=>{g.drawImage(A.R[i],10+i*40-A.ax+12,44-A.ay);label(g,n,6+i*40,10);});out.attendant=up(c,6);}
    if(want('hall')){const [c,g]=mkc(520,250);bg(g,520,250,230);
      GA.drawHatch(g,60,100,1.2);GA.drawBelt(g,60,300,100,230,12,1);GA.drawPlatter(g,300,380,100,230,1);GA.drawCauldron(g,430,70,0,0,1);GA.drawCauldron(g,480,70,0,0.8,1);
      GA.drawOven(g,60,230,'cold',1,0);GA.drawOven(g,150,230,'bake',1.2,0);GA.drawBurn(g,180,330,230,1.1);
      [['dish',100],['bomb',130],['chilli',160],['pie',190]].forEach(([k,x])=>GA.dish(g,false,x,160,k,0.1));GA.dish(g,false,100,200,'bomb',0.0);
      GA.drawHam(g,420,160,0.6);GA.drawPlateFlat(g,460,160,1);GA.drawChain(g,300,120,360,150);out.hall=up(c,3);}
    if(want('poses')){const P=GH.POSE,names=Object.keys(P),cols=4,cw=380,ch=236,[c,g]=mkc(cols*cw,Math.ceil(names.length/cols)*ch);g.fillStyle='#2b2230';g.fillRect(0,0,c.width,c.height);
      names.forEach((n,i)=>{const x=(i%cols)*cw,y=Math.floor(i/cols)*ch;g.save();g.translate(x+170,y+222);GH._drawGrubbag(g,P[n],false,0.4,P[n].item==='dish'?'dish':null);g.restore();g.fillStyle='#4a3a42';g.fillRect(x,y+222,cw,14);label(g,n,x+4,y+10);});out.poses=up(c,1);}
    return out;})()`, 120000);
  for (const [k, v] of Object.entries(r)) { writeFileSync(join(OUT, 'kitchengate2art-' + tag + '-' + k + '.png'), Buffer.from(v.split(',')[1], 'base64')); console.log('kitchengate2art-' + tag + '-' + k + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
