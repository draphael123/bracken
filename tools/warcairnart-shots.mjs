/* tools/warcairnart-shots.mjs - real-page stills of THE WAR CAIRN at its set pieces (claude/warcairnart; before/after for the art pass). Knight, god mode.
   PORT=<port> PREFIX=warcairnart-after OUT=<dir> [ONLY=a,b] node tools/warcairnart-shots.mjs     Writes <OUT>/<PREFIX>-<tag>.png (640x360). Not in the suite. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.env.OUT || join(ROOT, 'work', 'claude', 'lane-done'), PRE = process.env.PREFIX || 'warcairnart', only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='warcairn');BK.manualSimulation=true;
    const only=${JSON.stringify(process.env.ONLY ? process.env.ONLY.split(',') : null)};
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(120);};
    load();const L=BK.L,spots=[['start',L.START.x,L.START.y]];
    for(const d of L.wcDrums)spots.push(['drum-'+d.id,d.x-2,d.f]);
    for(const g of L.wcGates)spots.push(['gate-'+g.id,g.x0-4,g.y1]);
    for(const s of L.wcSlabs)spots.push(['slab-'+s.id,s.x0-1,s.y-1]);
    for(const c of L.wcCornices)spots.push(['cornice-'+c.id,c.x0-2,c.y-1]);
    for(const h of L.wcHolds.slice(0,2))spots.push(['hold-'+h.x,h.x-2,h.y]);
    for(const e of L.ents.filter(e=>e.t==='deco'&&e.kind==='totem'))spots.push(['totem-'+e.x,e.x-3,e.y]);
    const out=[];for(const [tag,x,y] of spots){if(only&&!only.includes(tag.split('-')[0])&&!only.includes(tag))continue;load();BK.tp(x,y);BK.sim(150);for(let k=0;k<8;k++)BK.step(1);out.push({tag,png:snap()});}
    BK.manualSimulation=false;return out;})()`, 600000);
  for (const s of r) { writeFileSync(join(OUT, PRE + '-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(PRE + '-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
