/* tools/motherface-shots.mjs - THE MOTHER CAP 2's EVERY STATE at game zoom (claude/motherface): idle, each tell + release, open, ward, P2 (net), wither, wake, death, rise. Real-page 640x360 stills, knight in god mode.
   OUT=<dir> PREFIX=<name-> PORT=<port> node tools/motherface-shots.mjs [only,tags]   (run it in two checkouts for a before / after; not in the suite) */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = resolve(process.env.OUT || join(ROOT, 'work', 'tmp-motherface', 'shots')), PRE = process.env.PREFIX || 'mf-';
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const st = (mode, modeT, extra = '', pt0 = 0.9) => `BK.tp(424,14);BK.sim(200);const b=BK.enemies().find(e=>e.t==='mother');if(b){b.mode='${mode}';b.poseMode='${mode}';b.modeT=${modeT};b.poseT0=${pt0};${extra}}BK.SET.speed=0.001;`;
const SHOTS = [
  ['idle', st('idle', 5)],
  ['lashTell', st('lashTell', 0.12, 'b.lashDir=-1;')], ['lash', st('lash', 0.7, 'b.lashDir=-1;b.lashes=[{x:b.x-90,d:-1,hit:new Set()}];', 1)],
  ['crushTell', st('crushTell', 0.12, 'b.crushX=BK.P.x;')], ['crush', st('crush', 0.7, '', 1)],
  ['bloomTell', st('bloomTell', 0.12, 'b.blooms=[{x:BK.P.x,y:BK.P.y-12,t:0.6,live:false,tickT:0}];')], ['bloom', st('bloom', 0.7, '', 1)],
  ['broodTell', st('broodTell', 0.12)], ['brood', st('brood', 0.7, '', 1)],
  ['witherTell', st('witherTell', 0.12)], ['wither', st('wither', 0.7, '', 1)],
  ['open', st('open', 2, 'b.openK=1;')], ['ward', st('idle', 5, 'b.ward=3;')],
  ['p2-idle', `BK.tp(424,14);BK.sim(200);const b=BK.enemies().find(e=>e.t==='mother');b.phase=2;b.hp=b.maxHp*0.4;b.net={ph:"off",t:0};BK.sim(240);b.mode='idle';b.poseMode='idle';b.modeT=5;b.poseT0=0.9;BK.SET.speed=0.001;`], ['p2-lashTell', `BK.tp(424,14);BK.sim(200);const b=BK.enemies().find(e=>e.t==='mother');b.phase=2;b.hp=b.maxHp*0.4;b.net={ph:"off",t:0};BK.sim(240);b.mode='lashTell';b.poseMode='lashTell';b.modeT=0.12;b.poseT0=0.9;b.lashDir=-1;BK.SET.speed=0.001;`],
  ['wake', st('wake', 0.3, '', 1.6)], ['rise', st('phaseRise', 0.5, 'b.phase=2;', 1.4)],
  ['death', `BK.tp(424,14);BK.sim(200);const b=BK.enemies().find(e=>e.t==='mother');if(b){b.mode='idle';b.modeT=5;b.alive=false;b.hp=0;}BK.sim(20);BK.SET.speed=0.001;`],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='spore');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);};
    const out=[];for(const [tag,extra] of ${JSON.stringify(SHOTS)}){load();BK.sim(20);eval(extra);for(let k=0;k<40;k++)BK.step(1);out.push({tag,png:snap()});BK.SET.speed=1;}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, PRE + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(PRE + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
