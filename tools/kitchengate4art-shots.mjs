// PAGE TOOL: launches headless Chrome
/* tools/kitchengate4art-shots.mjs <before|after> [tags] - (claude/kitchengate4art) zoomed real-page stills of the Kitchen Gate's arena art: the coal trench (banked / glow / lit),
   the two hook rails (the red hop stretch, the cauldron over the upper rail's end), the platter drop, the second helping, the belly swell, ORDER UP's attendants.
   Writes work/claude/lane-done/kitchengate4art-<before|after>-<tag>.png (crop of the 640x360 frame, scaled). Not in the suite.
     PORT=<port> node tools/kitchengate4art-shots.mjs after */
import { openPage } from './cdp.mjs';
import { oldCol } from '../src/kitchen-gate.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done');
const which = process.argv[2] || 'after', only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const O = oldCol;
const gb = (m, t, extra) => `BK.tp(${O(398)},21);for(let k=0;k<320;k++){BK.sim(1);BK.P.hp=BK.P.maxHp;}const GH=BK.grubbagHands(),S=GH&&GH.show(),b=BK.boss;if(S&&b){S.restT=99;S.waves=[];S.throws=[];S.flings=[];S.sweeps=[];S.burns=[];S.items=[];S.lineT=99;S.stove.st='cold';BK.tp(${O(412)},21);b.mode='${m}';b.modeT=${t};b.openT0=${t};b.face=-1;${extra || ''}}`;
const hook = k => "const z=S.G.rails[" + k + "];BK.P.x=z.x0+40;BK.P.y=z.y0+12+(z.y1-z.y0)*40/(z.x1-z.x0);BK.P.vy=0;BK.keys.up=true;BK.step(2);BK.keys.up=false;BK.step(6);";
const hookAt = (k, px) => "const z=S.G.rails[" + k + "];BK.P.x=z.x0+40;BK.P.y=z.y0+12+(z.y1-z.y0)*40/(z.x1-z.x0);BK.P.vy=0;BK.keys.up=true;BK.step(2);BK.keys.up=false;for(let q=0;q<400&&BK.P.x<" + px + ";q++){BK.step(1);BK.P.hp=BK.P.maxHp;}";
/* tag, setup, crop [x,y,w,h] of the 640x360 frame, scale */
const SHOTS = [
  ['trench', gb('sit', 1, 'BK.tp(' + O(406) + ',24);'), [180, 215, 200, 105], 4],
  ['trench-glow', gb('sit', 1, 'S.coal.glow=0.4;BK.tp(' + O(402) + ',23);'), [180, 215, 200, 105], 4],
  ['trench-lit', gb('sit', 1, 'S.coal.lit=4;BK.tp(' + O(402) + ',23);'), [180, 195, 200, 125], 4],
  ['trench-lit-end', gb('sit', 1, 'S.coal.lit=0.8;BK.tp(' + O(402) + ',23);'), [180, 195, 200, 125], 4],
  ['hookA', gb('sit', 1, hook(0)), [90, 120, 300, 150], 3],
  ['hookB', gb('sit', 1, hook(1)), [90, 120, 300, 150], 3],
  ['hook-end', gb('sit', 1, hookAt(1, 'z.xb-60')), [230, 20, 190, 200], 4],
  ['drop', gb('drop', 2.6, "S.dropFx={x:S.G.platter.x0+20,t:0.5};S.items.push({id:95,kind:'dish',x:S.G.belt.x0+120,state:'fall',y:S.G.belt.y-30,vx:-60,vy:-90},{id:96,kind:'bomb',x:S.G.belt.x0+60,state:'fall',y:S.G.belt.y-20,vx:-40,vy:-60});BK.P.x=S.G.platter.x0+20;BK.P.y=S.G.platter.y;"), [90, 40, 550, 230], 2],
  ['second', gb('lobTell', 0.5, "S.secondOn='lob';"), [330, 0, 310, 270], 2],
  ['second-fling', gb('flingTell', 0.4, "S.secondOn='fling';"), [330, 0, 310, 270], 2],
  ['swell', gb('eat', 0.6, "b.eating={kind:'dish'};S.swellT=0.35;S.heal={n:180,t:1.0};"), [330, 20, 310, 250], 2],
  ['bell-hooks', gb('bellTell', 0.01, "S.ph=2;S.adds=[];for(let k=0;k<75;k++){BK.step(1);BK.P.hp=BK.P.maxHp;S.restT=99;}"), [60, 100, 360, 210], 3],
  ['bell-coals', gb('bellTell', 0.01, "S.ph=2;S.adds=[];for(let k=0;k<75;k++){BK.step(1);BK.P.hp=BK.P.maxHp;S.restT=99;}for(const a of S.adds){if(a){a.gbRide=null;a.x=S.G.trench.x0+60;a.y=S.G.trench.y;a.vy=0;}}for(let k=0;k<14;k++){BK.step(1);BK.P.hp=BK.P.maxHp;S.restT=99;}"), [150, 170, 260, 160], 3],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='kitchengate');BK.manualSimulation=true;
    const snap=(cr,sc)=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);const d=document.createElement('canvas');d.width=cr[2]*sc;d.height=cr[3]*sc;const h=d.getContext('2d');h.imageSmoothingEnabled=false;h.drawImage(c,cr[0],cr[1],cr[2],cr[3],0,0,cr[2]*sc,cr[3]*sc);return d.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(60);};
    const out=[];for(const [tag,extra,cr,sc] of ${JSON.stringify(SHOTS)}){load();BK.sim(20);eval(extra);for(let k=0;k<2;k++)BK.step(1);out.push({tag,png:snap(cr,sc)});}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'kitchengate4art-' + which + '-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('kitchengate4art-' + which + '-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
