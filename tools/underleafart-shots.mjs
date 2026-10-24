/* tools/underleafart-shots.mjs [only,tags] - real-page stills of UNDERLEAF 3 (claude/underleafart): each named area at its point of use, the three jars and their patches, the
   thorn-beast with and without its coat, and THE GRANDMOTHER 3 at each of her moves. Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot.
   Writes work/claude/lane-done/underleafart/<PREFIX>-<tag>.png at 2x (640x360), PREFIX = before | after (env PREFIX). Not in the suite.   PORT=<port> PREFIX=after node tools/underleafart-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done', 'underleafart'), PFX = process.env.PREFIX || 'after';
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const boss = (m, extra = '') => `BK.tp(444,29);BK.sim(60);const b=BK.enemies().find(e=>e.t==='grandmother');if(b){b.mode='${m}';b.modeT=9;b.x=BK.P.x+64;b.face=-1;BK.P.face=1;${extra}}`;
const SHOTS = [
  ['1-garden-teach', 7, 29, ''], ['2-ditch-bridge', 48, 29, ''], ['3-float-well', 102, 29, ''], ['4-hanging-racks', 129, 19, ''], ['5-thorn-hedge', 195, 29, ''],
  ['6-thorn-beast', 222, 32, ''], ['7-cauldron-yard', 300, 22, ''], ['8-leaf-bridge', 322, 15, ''], ['9-great-leaf', 388, 29, ''], ['10-her-stoop', 421, 17, ''],
  ['11-boss-idle', 0, 0, boss('walk')], ['12-boss-broodTell', 0, 0, boss('broodTell')], ['13-boss-fireballTell', 0, 0, boss('fireballTell')], ['14-boss-jarTell-green', 0, 0, boss('jarTell', "b.hurlCol='green';")],
  ['15-boss-jarTell-red', 0, 0, boss('jarTell', "b.hurlCol='red';")], ['16-boss-staffTell', 0, 0, boss('staffTell')], ['17-boss-floated', 0, 0, boss('floated', 'b.floatLen=3.2;b.floatY0=b.y;b.modeT=2.6;')], ['18-boss-stirTell', 0, 0, boss('stirTell', 'b.phase=2;')],
  ['19-boss-warded', 0, 0, boss('walk', 'b.ward=2;')],
  ['20-jars-green', 8, 29, "const H=BK.potions();"], ['21-red-fire', 196, 29, "const H=BK.potions();const j=H.state().jars.find(q=>q.col==='red');j.state='fly';j.x=BK.P.x+30;j.y=BK.P.y-4;j.vx=0;j.vy=40;BK.sim(8);"],
].filter(s => !only || only.has(s[0]) || only.has(s[0].split('-')[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  var r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='underleaf');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(200);};
    const out=[];for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();if(x)BK.tp(x,y);BK.sim(20);try{eval(extra);}catch(e){out.push({tag:tag+'-ERR',png:snap(),err:String(e)});}for(let k=0;k<30;k++)BK.step(1);out.push({tag,png:snap()});BK.SET.speed=1;}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, PFX + '-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(PFX + '-' + s.tag + '.png' + (s.err ? ' ' + s.err : '')); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
