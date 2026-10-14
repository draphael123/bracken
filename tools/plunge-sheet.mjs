// tools/plunge-sheet.mjs - THE FOUR NEW PLUNGES' FRAMES ON ONE SHEET (docs/plunges/frames.png): for each hero a row a key - idle and the old plunge for scale, then his own windup/fall, release and ride/spin
// frames (claude/plunges, B16: each ability its own windup + release pose). Also an assertion: every key must exist, with the frame counts src/main.js draws.
//   node tools/plunge-sheet.mjs [out.png] [--scale=4]       (PORT for the page)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import assert from 'node:assert/strict';
import { openPage, ROOT } from './cdp.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const outArg = args.find(a => !a.startsWith('--'));
/* [hero, key, frames the page draws] - the windup is frame 0 of the first (plunge start), the fall frame 1; the release plays through kitPose */
const KEYS = { paladin: [['hammerWind', 2], ['hammerHit', 2]], pirate: [['boardFall', 2], ['boardRide', 2], ['boardLeap', 2]], geomancer: [['earthWind', 2], ['earthHit', 2]], berserker: [['bzPlunge', 3], ['bzAxeSpin', 4], ['bzSpinEnd', 2]] };
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const KEYS=${JSON.stringify(KEYS)},SC=${+opt('scale', 4)};const rows=[],miss=[];
    for(const [hero,list] of Object.entries(KEYS)){const K=BKT.heroSet('bracken','steel',false,hero);
      for(const k of ['idle','plunge']){const v=K.R[k];rows.push({k:hero+' '+k,f:(Array.isArray(v)?v:[v]).filter(Boolean)});}
      for(const [k,n] of list){const v=K.R[k];const f=(Array.isArray(v)?v:[v]).filter(Boolean);if(f.length!==n)miss.push(hero+' '+k+': '+f.length+' frames, the page draws '+n);rows.push({k:hero+' '+k,f});}}
    const cw=Math.max(...rows.flatMap(r=>r.f.map(c=>c.width)))*SC, ch=Math.max(...rows.flatMap(r=>r.f.map(c=>c.height)))*SC, per=6;
    const lines=rows.reduce((n,r)=>n+Math.ceil(r.f.length/per),0);
    const c=document.createElement('canvas');c.width=150+per*(cw+4);c.height=lines*(ch+4)+4;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#3a4a3a';g.fillRect(0,0,c.width,c.height);let y=2;g.font='12px monospace';
    for(const r of rows){for(let i=0;i<r.f.length;i++){if(i&&i%per===0)y+=ch+4;const x=150+(i%per)*(cw+4),f=r.f[i];
        g.fillStyle=i%2?'#465a46':'#4e624e';g.fillRect(x,y,cw,ch);g.drawImage(f,0,0,f.width,f.height,x,y+ch-f.height*SC,f.width*SC,f.height*SC);}
      g.fillStyle='#e8e2cc';g.fillText(r.k+' ('+r.f.length+')',4,y+ch/2);y+=ch+4;}
    return {png:c.toDataURL(),miss};})()`);
  const out = join(ROOT, outArg || 'docs/plunges/frames.png'); mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(r.png.split(',')[1], 'base64')); console.log('wrote ' + out);
  assert.deepEqual(r.miss, [], 'frames missing: ' + r.miss.join('; '));
  assert.deepEqual(pg.errors, [], 'page errors');
  console.log('plunge-sheet: every new plunge has its own windup, release and ride/spin frames');
} finally { pg.close(); }
