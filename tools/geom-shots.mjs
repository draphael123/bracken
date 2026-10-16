/* Capture one native-resolution game crop for every coordinate in the two report-only sweep receipts. The yellow square
   names the tile at the file's column and row; the rest of the crop is the real settled game frame around it. These are
   evidence for art review, not a new drawing of the level. Run after the two --json sweeps in work/codex-lane-done. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';

const root = new URL('../work/codex-lane-done/', import.meta.url), dir = new URL('../work/codex/shots/geomsweep/', import.meta.url);
const first = name => JSON.parse(readFileSync(new URL(name, root), 'utf8').split(/\r?\n/)[0]);
const drawn = first('geomsweep-drawn-raw.log').rows, supports = first('geomsweep-support-raw.log');
const places = new Map();
const put = (id, x, y) => { if (!places.has(id)) places.set(id, new Set()); places.get(id).add(x + ',' + y); };
for (const r of drawn) for (const p of r.ph || []) for (const c of p.cells || []) put(r.id, c[0], c[1]);
for (const r of drawn) for (const c of r.movers || []) put(r.id, c[0], c[1]);
for (const r of supports) for (const f of r.findings || []) put(r.id, f.x0, f.row);
mkdirSync(dir, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
let total = 0;
try {
  for (const [id, set] of places) {
    const coords = [...set].map(s => s.split(',').map(Number));
    const shots = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const i=LEVELS.findIndex(l=>l.id===${JSON.stringify(id)});
      if(i<0)throw Error('no level ${id}');BK.load(i);BK.start();BK.god=true;BK.sim(60);BK.hideHero=true;const out=[];
      for(const [x,y] of ${JSON.stringify(coords)}){const v=BK.look(x,y),c=document.createElement('canvas');c.width=128;c.height=96;
        const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.view.buf,x*16-v.cx-64,y*16-v.cy-32,128,96,0,0,128,96);
        g.strokeStyle='#ffdb45';g.lineWidth=1;g.strokeRect(64.5,32.5,15,15);out.push([x,y,c.toDataURL('image/png')]);}
      return out;})()`, 1800000);
    for (const [x, y, uri] of shots) { writeFileSync(new URL(id + '-' + x + '-' + y + '.png', dir), Buffer.from(uri.split(',')[1], 'base64')); total++; }
    console.log(id + ': ' + shots.length + ' crops');
  }
} finally { await pg.close(); }
console.log('geom-shots: ' + total + ' real-render crops in work/codex/shots/geomsweep');
