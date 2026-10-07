/* tools/seam-shots.mjs <suffix> [only,tags] - real-page stills of THE SPOREWOOD -> KINGSWOOD SEAM (claude/sporeseam): the Mother's last stretch and the
   climb out of the fungus (Sporewood's end), and Kingswood's opening screens. Headless Chrome through tools/cdp.mjs (PORT env), the knight in god mode.
   Writes docs/seam/<tag>-<suffix>.png at 2x (640x360). Run it with `before` on the old code and `after` on the new: a column past the level's width is skipped. Not in the suite. */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'docs', 'seam');
const suffix = process.argv[2] || 'now', only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* [tag, level, column, extra script run after the hero is placed] */
const SHOTS = [
  ['spore-door', 'spore', 478, ''],
  ['spore-out', 'spore', 544, ''],
  ['spore-camp', 'spore', 566, ''],
  ['spore-canopy', 'spore', 580, ''],
  ['spore-gate', 'spore', 592, ''],
  ['kings-start', 'kings', 6, ''],
  ['kings-caps', 'kings', 26, ''],
  ['kings-hall', 'kings', 52, ''],
].filter(s => !only || only.has(s[0]));
const pg = await openPage();
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const foot=x=>{const L=BK.L;for(let y=1;y<L.H-1;y++){const t=L.grid[y*L.W+x],u=L.grid[(y+1)*L.W+x];if(t===0&&u!==0&&u!==17)return y;}return 13;};
    const out=[];for(const [tag,lid,x,extra] of ${JSON.stringify(SHOTS)}){const idx=LV.findIndex(l=>l.id===lid);BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(450);
      if(x>=BK.L.W-2)continue; if(lid==='spore'&&x>536)BK.L.arena.trigger=1e9; const y=foot(x);BK.tp(x,y);BK.sim(20);eval(extra);for(let k=0;k<50;k++)BK.step(1);out.push({tag,x,y,png:snap()});}
    return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, s.tag + '-' + suffix + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(s.tag + '-' + suffix + '.png  @' + s.x + ',' + s.y); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
