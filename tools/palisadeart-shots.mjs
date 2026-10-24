/* tools/palisadeart-shots.mjs [only,tags] - real-page stills of THE PALISADE WOOD and THE BATTERING BEAST (claude/palisadeart: the art pass, same shots as the greybox's) for the lane report and the art lane:
   each named area at its point of use, a prop before (its result ghosted) and after, the stake-setter's wall, and the beast's every move at its windup / release (B16) and STUCK.
   Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot. Writes work/claude/lane-done/palisadewood-<tag>.png (640x360).
   Not in the suite.   PORT=<port> node tools/palisadeart-shots.mjs */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'work', 'claude', 'lane-done');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const knock = id => `BK.pwood().knockProp('${id}');for(let k=0;k<90;k++)BK.step(1);`;
const boss = (m, t) => `BK.tp(402,24);BK.sim(260);const b=BK.boss;if(b){b.mode='${m}';b.modeT=${t || 0.5};b.x=418*16;b.face=-1;}`;
const SHOTS = [
  ['edge', 12, 37, ''], ['edge-ramp-after', 16, 37, knock('edgeRamp')], ['crew', 27, 32, ''],
  ['yard-stakes', 106, 31, ''], ['yard-tower', 138, 31, ''], ['yard-tower-after', 140, 31, knock('yardTower')],
  ['setter-wall', 133, 31, "BK.god=false;for(let k=0;k<200;k++){BK.step(1);BK.P.hp=BK.P.maxHp;if(BK.pwood().read().walls.length)break;}BK.god=true;"],
  ['scaffolds', 208, 25, ''], ['wall-ramp-after', 209, 19, knock('wallRamp')], ['wall-top', 232, 12, ''], ['unbuilt-span', 247, 12, ''],
  ['gatehouse', 322, 24, ''], ['gate-passage', 340, 24, ''],
  ['beast-walk', 0, 0, boss('walk')], ['beast-chargeTell', 0, 0, boss('chargeTell', 0.8)], ['beast-charge', 0, 0, boss('charge', 3)], ['beast-sweepTell', 0, 0, boss('sweepTell', 0.6)],
  ['beast-sweep', 0, 0, boss('sweep', 0.3)], ['beast-volleyTell', 0, 0, boss('volleyTell', 0.8)], ['beast-trampleTell', 0, 0, boss('trampleTell', 0.8)], ['beast-stuck', 0, 0, boss('stuck', 3)],
  ['beast-loose', 0, 0, boss('loose', 3)],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='palisadewood');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);};
    const out=[];for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();if(x)BK.tp(x,y);BK.sim(20);eval(extra);for(let k=0;k<20;k++)BK.step(1);out.push({tag,png:snap()});BK.SET.speed=1;}
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'palisadeart-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('palisadeart-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
