/* tools/foeproof-shots.mjs - stills of the foe variants (claude/foevariety proof lane, 11-05). Headless Chrome via tools/cdp.mjs, knight in god mode.
   For each skin: the first live foe of that skin in its level, the player placed 9 tiles away facing it, a still at idle, then mid-draw / mid-flight / the tell.
   node tools/foeproof-shots.mjs [skin,skin]   -> <OUT>/foeproof-<skin>-<phase>.png  (OUT = SHOT_OUT or audits/lane-shots). Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const OUT = process.env.SHOT_OUT || join(ROOT, 'audits', 'lane-shots'); mkdirSync(OUT, { recursive: true });
const ROWS = [['firearcher', 'palisadewood'], ['rockarcher', 'palisadewood'], ['venomarcher', 'fenroad'], ['clubsprig', 'fenroad']];
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out=[];
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    for(const [skin,lv] of ${JSON.stringify(ROWS.filter(r => !only || only.has(r[0])))}){
      const idx=LEVELS.findIndex(l=>l.id===lv);BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(200);
      const e=BK.enemies().find(q=>q.cnSkin===skin&&q.alive&&!q.dozing&&!q.horn);if(!e){out.push({tag:skin+'-MISSING',png:snap()});continue;}
      BK.tp(Math.round(e.x/16)-7,Math.round(e.y/16)-1);BK.sim(20);out.push({tag:skin+'-idle',png:snap()});
      for(let k=0;k<900;k++){BK.step(1);const d=e.draw>0.3||e.mode==='biteTell'||(e.mode==='tell')||(e.tellT>0);if(d){out.push({tag:skin+'-tell',png:snap()});break;}}
      for(let k=0;k<20;k++)BK.step(1);out.push({tag:skin+'-after',png:snap()});
      for(let k=0;k<30;k++)BK.step(1);out.push({tag:skin+'-later',png:snap()});
    }
    BK.manualSimulation=false;return out;})()`, 600000);
  for (const s of r) { writeFileSync(join(OUT, 'foeproof-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('foeproof-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
