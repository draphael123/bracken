/* tools/warcairn2-shots.mjs - real-page stills of WAR CAIRN 2's new pieces (claude/warcairn2, the greybox): the hatchet's told arc at the gorge, the bridge cut down, the hanging
   stone / totem / nests, the ring's stone, and THE CHIEFTAIN 2 (his hatchet in the floor with its grab ring, his frenzy with RING A DRUM, the hero-style RAGE bar, the summit cairn
   and its drum braziers). Knight, god mode.   PORT=<port> PREFIX=warcairn2 OUT=<dir> node tools/warcairn2-shots.mjs   Writes <OUT>/<PREFIX>-<tag>.png (640x360). Not in the suite. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'lane-done'), PRE = process.env.PREFIX || 'warcairn2';
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='warcairn');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(120);};
    const P=()=>BK.P,out=[],shot=(tag,n=8)=>{for(let k=0;k<n;k++)BK.step(1);out.push({tag,png:snap()});};
    const go=(x,y,s=120)=>{BK.tp(x,y);P().vx=0;P().vy=0;BK.sim(s);};
    const take=r=>{const R=BK.L.wcRacks.find(q=>q.id===r);go(R.x,R.f,30);BK.press('talk');BK.sim(4);};
    /* the gorge: a hatchet in hand at the lip, UP held - the told arc to the rope post */
    load();take('shoulder');go(63,68,10);P().face=1;BK.keys.up=true;BK.sim(4);shot('gorge-arc');BK.press('atk');BK.sim(30);shot('gorge-throw',2);BK.sim(120);BK.keys.up=false;shot('gorge-down');
    /* the yard's hanging stone (a hatchet in hand: the glint rings) */
    load();take('yard');go(189,39,20);P().face=1;shot('yard-stone');
    const WH=BK.warCairnHands(),HX=WH.hatchets();HX.cut('yard');BK.sim(90);shot('yard-fallen');
    /* the totem over the guard, the high line's nest */
    load();take('face');go(276,33,20);P().face=1;shot('totem');
    load();go(293,33,60);shot('nest-face');
    load();take('ring');go(358,27,20);P().face=1;shot('ring-stone');
    /* THE CHIEFTAIN 2 */
    load();const A=BK.L.arena;go(Math.floor(A.trigger/16)+1,Math.floor(A.floor/16)-1,260);const b=BK.boss,BH=BK.bzchiefHands(),S=BH&&BH.show();
    if(b&&S){P().x=b.x-150;S.throwCd=0;S.axe=null;S.oneHand=false;b.face=-1;b.mode='throwTell';b.modeT=0.01;for(let i=0;i<80;i++){BK.sim(1);if(S.axe&&!S.axe.fly)break;}shot('chief-hatchet',4);
      BK.sim(200);b.mode='walk';b.modeT=2;S.ward=0;S.rage=70;S.ph=2;shot('chief-rage');S.frenzy=8;S.rage=0;b.phase=2;shot('chief-frenzy');
      P().x=A.x0+60;shot('summit-braziers',2);}
    BK.manualSimulation=false;return out;})()`, 600000);
  for (const s of r) { writeFileSync(join(OUT, PRE + '-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(PRE + '-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
