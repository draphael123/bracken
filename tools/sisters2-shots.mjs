/* tools/sisters2-shots.mjs [only,tags] - real-page stills of THE SHRIEK SISTERS' SIGNATURE MOVES (claude/sisters2, Daniel 10-25): every new move at its TELL and its RELEASE,
   each saved whole (640x360) and as a 2x crop round the sister (-z), plus a contact sheet of the new poses per sister (sisters2-poses.png). Headless Chrome through
   tools/cdp.mjs, the knight in god mode on the summit, the fight woken, the sister set into the mode and two frames run. Not in the suite.
   OUT=<dir> (default scratch/lane-reports beside the repo's parent)   PORT=<port> node tools/sisters2-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, '..', 'scratch', 'lane-reports');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* set role r into mode m: the others hover still; x/y are expressions (P = the hero, F = the floor's y, G = the summit) */
const set = (r, m, t, x, y, extra = '', foc = '') => `{const SH=BK.shriekSistersHands(),S=SH.show(),P=BK.P,G=S.G,F=G.floorY;S.grabCd=99;S.snatchCd=99;
  for(const q of ['diver','shrieker','snatcher']){S.sis[q].cd=99;if(q!=='${r}'){S.sis[q].mode=q==='snatcher'?'fly':'hover';}}
  const s=S.sis['${r}'];s.mode='${m}';s.modeT=${t};s.openT0=${t}+0.4;s.x=${x};s.y=${y};s.face=-1;s.ward=0;${extra};__foc=s;${foc}}`;
const SHOTS = [
  /* THE DIVER */
  ['chainTell', set('diver', 'chainTell', 0.5, 'P.x+40', 'F-150', "s.chain={n:3,i:0,hit:0};s.face=-1")],
  ['chain-dive2', set('diver', 'diveTell', 0.18, 'P.x+60', 'F-118', "G.slabs[1].st='rubble';G.slabs[1].t=8;s.chain={n:3,i:1,hit:1};s.aim={x:P.x,y:F,lock:true,n:2,of:3}")],
  ['chain-jar', set('diver', 'jar', 0.3, 'G.slabs[1].x', 'F', "G.slabs[1].st='rubble';G.slabs[1].t=8;s.chain={n:3,i:1,hit:1};P.x=G.slabs[1].x+50")],
  ['chain-exhausted', set('diver', 'stuck', 3.6, 'G.slabs[1].x', 'F', "G.slabs[1].st='rubble';G.slabs[1].t=8;s.big=true;s.purse=999;s.openT0=4.0;P.x=G.slabs[1].x+40")],
  ['rakeTell', set('diver', 'rakeTell', 0.35, 'P.x+80', 'F', "s.rDir=-1;s.raked=true")],
  ['rake', set('diver', 'rake', 0.4, 'P.x+44', 'F', "s.rDir=-1;s.raked=true;s.hitKey='zz'")],
  /* THE SHRIEKER */
  ['screamTell', set('shrieker', 'screamTell', 0.5, 'P.x+40', 'F-150', '', '__foc={x:P.x+40,y:F-60}')],
  ['shockTell', set('shrieker', 'shockTell', 0.3, 'P.x+64', 'F-30', "s.shSide=1;s.shX=P.x+64")],
  ['shock', set('shrieker', 'shock', 0.35, 'P.x+64', 'F-30', "")],
  ['teeter', set('shrieker', 'hover', 1, 'G.x0+140', 'F-140', "P.x=G.x0+12;P.ssShove={t:0.9,dir:-1}", '__foc={x:G.x0+150,y:F-40}')],
  ['echoTell', set('shrieker', 'echoTell', 0.35, 'P.x+20', 'F-110', "s.echoX=P.x+56;s.face=1", '__foc={x:P.x+40,y:F-60}')],
  ['echo', set('shrieker', 'echo', 0.3, 'P.x+22', 'F-108', "s.echoX=P.x+56;s.face=1;S.echoes.push({x:P.x+56,t:8})", '__foc={x:P.x+40,y:F-60}')],
  ['echo-crack', set('shrieker', 'rise', 0.6, 'P.x+40', 'F-140', "S.echoes.push({x:P.x+56,t:8})", '__foc={x:P.x+40,y:F-50}')],
  /* THE SNATCHER */
  ['boulder-carry', set('snatcher', 'carry', 2, 'P.x+20', 'F-118', "s.target=P.x+20;s.rocks=1", '__foc={x:P.x+20,y:F-70}')],
  ['boulder-dropTell', set('snatcher', 'dropTell', 0.35, 'P.x+30', 'F-118', "s.dropX=P.x+30;s.rocks=1", '__foc={x:P.x+30,y:F-70}')],
  ['boulder-fall', set('snatcher', 'drop', 0.3, 'P.x+30', 'F-118', "s.rocks=0;S.rocks.push({x:P.x+30,y0:F-112,t:0.38,T:0.62,key:'zb'})", '__foc={x:P.x+30,y:F-60}')],
  ['grabTell', set('snatcher', 'grabTell', 0.35, 'P.x-110', 'F-36', "s.gDir=1;s.gX=P.x-110;s.face=1")],
  ['grab', set('snatcher', 'grab', 0.6, 'P.x-60', 'F-6', "s.gDir=1;s.face=1;s.hitKey='zg'+Math.random()")],
  ['grab-hold', set('snatcher', 'hold', 0.9, 'P.x', 'F-84', "s.face=1;S.held={pp:P,t:0.7,strikes:1,last:-9};P.ssHeld=true")],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='rookery');BK.manualSimulation=true;let __foc=null;
    const snap=(z)=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      if(z&&__foc){const [cx,cy]=BK.cam;let sx=Math.round(__foc.x-cx-160),sy=Math.round(__foc.y-cy-110);sx=Math.max(0,Math.min(BK.buf.width-320,sx));sy=Math.max(0,Math.min(BK.buf.height-180,sy));g.drawImage(BK.buf,sx,sy,320,180,0,0,640,360);}
      else g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);BK.tp(380,10);BK.sim(300);};
    const out=[];for(const [tag,extra] of ${JSON.stringify(SHOTS)}){load();BK.P.x=BK.shriekSistersHands().show().G.mid-60;BK.sim(2);eval(extra);for(let k=0;k<2;k++)BK.step(1);out.push({tag,png:snap(false)});out.push({tag:tag+'-z',png:snap(true)});}
    /* the contact sheet: every NEW pose, per sister, x3 */
    const SA=await import('/src/redraw/shriek_sisters_art.js'),SH=await import('/src/shriek-sisters-hands.js');const all=SA.SHEET(SH.POSE);
    const NEW=['chainTell','jar','rakeTell','rake','shockTell','shock','echoTell','echo','grabTell','grab','lift','hold','carry','dropTell','pick'];const roles=['diver','shrieker','snatcher'];
    const Z=2,cw=116*Z,ch=70*Z;const cv=document.createElement('canvas');cv.width=NEW.length*cw/2+20;cv.height=roles.length*2*(ch+14)+10;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#4e4a58';g.fillRect(0,0,cv.width,cv.height);
    NEW.forEach((m,i)=>roles.forEach((r,j)=>{const c=all[r+'-'+m];if(!c)return;const col=i%8,row=j*2+(i>=8?1:0);const px=10+col*cw*0.95,py=6+row*(ch+14);g.fillStyle='#5c5868';g.fillRect(px,py,cw-6,ch);g.drawImage(c,px,py,cw,ch);g.fillStyle='#fff';g.font='10px monospace';g.fillText(r+' '+m,px+2,py+ch+10);}));
    out.push({tag:'poses',png:cv.toDataURL('image/png')});
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'sisters2-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('sisters2-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 5));
} finally { await pg.close(); }
process.exit(0);
