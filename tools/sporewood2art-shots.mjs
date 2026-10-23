/* tools/sporewood2art-shots.mjs [only,tags] - real-page stills of SPOREWOOD 2 and THE MOTHER CAP 2 (claude/sporewood2) for the lane report and the art lane:
   each named area at its point of use, the rule in motion (a lit dark bud, a spring spore, the seed stair, the root knot), and her every move at its windup
   (B16: each its own pose) and her knot open. Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot.
   Writes work/claude/lane-done/sporewood2-<tag>.png at 2x (640x360). Not in the suite.   PORT=<port> node tools/sporewood2art-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* [tag, tile x, tile y (feet, built rows), script after the hero is placed] */
const boss = m => `BK.tp(424,14);BK.sim(200);const b=BK.enemies().find(e=>e.t==='mother');if(b){b.mode='${m}';b.poseMode='${m}';b.modeT=${m === 'open' ? 2 : 0.12};b.poseT0=0.9;${m === 'crushTell' ? 'b.crushX=BK.P.x;' : ''}${m === 'bloomTell' ? 'b.blooms=[{x:BK.P.x,y:BK.P.y-12,t:0.6,live:false,tickT:0}];' : ''}${m === 'lash' ? 'b.lashes=[{x:b.x-90,d:-1,hit:new Set()}];' : ''}${m === 'open' ? 'b.openK=1;' : ''}}BK.SET.speed=0.001;`;
const SHOTS = [
  ['v0', 10, 40, ''], ['v1', 60, 36, ''], ['v2', 140, 38, ''], ['v3', 175, 36, ''], ['v4', 230, 26, ''], ['v5', 275, 18, ''], ['v6', 320, 19, ''], ['v7', 380, 11, ''], ['v8', 425, 14, ''],
  ['glade', 26, 40, ''], ['bounce-pit', 56, 36, ''], ['terrace', 80, 32, ''],
  ['fall-terrace', 89, 28, ''], ['fall-bounce-stalk', 233, 22, ''], ['fall-her-approach', 389, 5, ''], ['hollows', 120, 38, ''], ['dark-bud-lit', 133, 38, "const g=BK.props().find(p=>p.t==='glowbud'&&Math.abs(p.x/16-133.5)<1);if(g)g.lit=12;"],
  ['dark-shaft', 176, 36, "for(const p of BK.props())if(p.t==='glowbud'&&p.x/16>160&&p.x/16<190)p.lit=12;"],
  ['bog', 214, 26, ''], ['spring-spore', 202, 28, "BK.sporewood().addSpring(202*16+8,28*16+8,8);"], ['cap-ladder', 266, 18, ''],
  ['larder', 310, 19, ''], ['spore-mage', 340, 11, ''],
  ['seed-stair', 361, 11, "for(const m of BK.movers())if(m.pair==='door'){m.state='up';m.k=1;m.upT=99;m.y=m.y0-m.rise;}"], ['root-knot', 374, 5, ''],
  ['her-door', 400, 5, ''],
  ['mother-idle', 0, 0, boss('idle')], ['mother-lashTell', 0, 0, boss('lashTell')], ['mother-lash', 0, 0, boss('lash')], ['mother-crushTell', 0, 0, boss('crushTell')],
  ['mother-brood', 0, 0, boss('broodTell').replace('BK.SET.speed=0.001;', '') + 'BK.sim(70);'], ['mother-net', 0, 0, "BK.tp(424,14);BK.sim(200);const b=BK.enemies().find(e=>e.t==='mother');if(b){b.phase=2;b.hp=b.maxHp*0.4;b.mode='idle';b.modeT=5;b.net={ph:'live',t:2.5};}BK.sim(6);"],
  ['mother-bloomTell', 0, 0, boss('bloomTell')], ['mother-broodTell', 0, 0, boss('broodTell')], ['mother-witherTell', 0, 0, boss('witherTell')], ['mother-open', 0, 0, boss('open')],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  var r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='spore');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);};
    const out=[];for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();if(x)BK.tp(x,y);BK.sim(20);eval(extra);for(let k=0;k<40;k++)BK.step(1);out.push({tag,png:snap()});BK.SET.speed=1;}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'sporewood2art-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('sporewood2art-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
if (process.env.SHEET) { /* a contact sheet: every shot half size, 3 across */
  const sp = await openPage({ audio: false, fonts: false }); try { const sheet = await sp.evalp('(async()=>{const imgs=' + JSON.stringify(r.map(x => x.png)) + ';const cols=3,w=320,h=180,rows=Math.ceil(imgs.length/cols);const c=document.createElement("canvas");c.width=cols*w;c.height=rows*h;const g=c.getContext("2d");g.imageSmoothingEnabled=false;for(let i=0;i<imgs.length;i++){const im=new Image();await new Promise(r=>{im.onload=r;im.src=imgs[i];});g.drawImage(im,(i%cols)*w,Math.floor(i/cols)*h,w,h);}return c.toDataURL("image/png");})()', 60000);
    writeFileSync(join(OUT, 'sporewood2art-sheet-' + process.env.SHEET + '.png'), Buffer.from(sheet.split(',')[1], 'base64')); console.log('sheet ' + process.env.SHEET); } finally { await sp.close(); } }
process.exit(0);
