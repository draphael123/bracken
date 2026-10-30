/* tools/warcairn2art-shots.mjs - real-page stills of WAR CAIRN 2's ART PASS 2 (claude/warcairn2art): before/after of the slate-and-snow palette, banners, camps, totems, the
   hatchet kit, the gorge bridge (hauled / swinging / down), stones, totem, nests, the summit cairn and braziers, the Chieftain's rage bar / counter / frenzy / stagger.
   PORT=<port> PREFIX=warcairn2art-after OUT=<dir> [ONLY=a,b] node tools/warcairn2art-shots.mjs   Writes <OUT>/<PREFIX>-<tag>.png (640x360). Not in the suite. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'lane-done'), PRE = process.env.PREFIX || 'warcairn2art';
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='warcairn');BK.manualSimulation=true;
    const only=${JSON.stringify(process.env.ONLY ? process.env.ONLY.split(',') : null)};const want=t=>!only||only.includes(t);
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(120);};
    const P=()=>BK.P,out=[],shot=(tag,n=8)=>{for(let k=0;k<n;k++)BK.step(1);out.push({tag,png:snap()});};
    const go=(x,y,s=120)=>{BK.tp(x,y);P().vx=0;P().vy=0;BK.sim(s);};
    const take=r=>{const R=BK.L.wcRacks.find(q=>q.id===r);go(R.x,R.f,30);BK.press('talk');BK.sim(4);};
    const at=(tag,x,f,face=1)=>{if(!want(tag))return;load();go(x,f,150);P().face=face;shot(tag);};
    /* the climb: start, gully terraces, shoulder + watchtower nest, gorge, area starts, camps, summit */
    at('start',14,95);at('gully-t2',22,88);at('gully-t4',30,75);at('shoulder',58,68);at('gorge-lip',63,68);at('gorge-far',84,62);
    at('gates-start',112,57);at('chimney',143,48);at('yard-camp',222,39);at('face-start',232,39);at("face-mid",266,33);at('totem-306',304,27);at('totem-338',336,27);
    at('ring-rim',352,24);at('ring-camp',366,24);at('summit-start',392,24);at('summit-stair',404,19,1);
    /* the gorge: hatchet in hand at the lip - the told arc, in flight, the bridge swinging, down */
    if(want('gorge-arc')){load();take('shoulder');go(63,68,10);P().face=1;BK.keys.up=true;BK.sim(4);shot('gorge-arc');BK.press('atk');const HXg=BK.warCairnHands().hatchets();for(let i=0;i<14;i++)BK.sim(1);shot('gorge-fly',1);let n=0;while(HXg.state('gorge')==='hang'&&n++<120)BK.sim(1);shot('gorge-swing',1);BK.sim(7);shot('gorge-swing2',1);BK.sim(5);shot('gorge-swing3',1);BK.sim(120);BK.keys.up=false;shot('gorge-down');}
    if(want('rack')){load();go(62,68,60);P().x=BK.L.wcRacks[0].x*16+8-22;shot('rack',2);}
    if(want('yard-stone')){load();take('yard');go(189,39,20);P().face=1;shot('yard-stone');const HX=BK.warCairnHands().hatchets();HX.cut('yard');BK.sim(20);shot('yard-falling',1);BK.sim(90);shot('yard-fallen');}
    if(want('totem-hang')){load();take('face');go(276,33,20);P().face=1;shot('totem-hang');const HX=BK.warCairnHands().hatchets();HX.cut('guard');BK.sim(14);shot('totem-fall',1);BK.sim(60);shot('totem-shatter');}
    if(want('nest')){load();go(52,68,30);shot('nest-tower');const HX=BK.warCairnHands().hatchets();HX.cut('tower');BK.sim(8);shot('nest-falling',1);BK.sim(60);shot('nest-down');load();go(293,33,60);shot('nest-face');}
    if(want('ring-stone')){load();take('ring');go(358,27,20);P().face=1;shot('ring-stone');}
    if(want('hatchet-held')){load();take('shoulder');go(64,68,10);P().face=1;shot('hatchet-held',2);}
    if(want('elite')){load();go(214,39,50);P().face=1;shot('elite-yard',2);load();go(291,33,50);P().face=1;shot('elite-lowline',2);load();go(355,27,50);P().face=1;shot('elite-champ',2);}
    /* THE CHIEFTAIN 2 */
    const A=BK.L.arena;
    if(want('chief')){load();go(Math.floor(A.trigger/16)+1,Math.floor(A.floor/16)-1,260);const b=BK.boss,BH=BK.bzchiefHands(),S=BH&&BH.show();
      if(b&&S){P().x=b.x-150;S.throwCd=0;S.axe=null;S.oneHand=false;b.face=-1;b.mode='throwTell';b.modeT=0.01;for(let i=0;i<80;i++){BK.sim(1);if(S.axe&&!S.axe.fly)break;}shot('chief-hatchet',4);
        BK.sim(200);b.mode='walk';b.modeT=2;S.ward=0;S.rage=40;S.ph=2;shot('chief-rage-lo');S.rage=85;shot('chief-rage-hi');S.frenzy=8;S.rage=0;b.phase=2;shot('chief-frenzy');
        P().x=A.x0+60;shot('summit-braziers',2);P().x=A.x1-150;shot('summit-cairn',2);}}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, PRE + '-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(PRE + '-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
