/* tools/spore-shots.mjs <suffix> [only,tags] — real-page captures of SPOREWOOD for the rebuild (docs/briefs/sporewood-rebuild.md).
   Headless Chrome through tools/cdp.mjs, the knight in god mode, the level reloaded before each shot so nothing carries over.
   Writes docs/sporewood/<tag>-<suffix>.png at 2x (640x360). Run it with `before` on the old code and `after` on the new one:
   the tags are PLACES (the glade's step, the vent marsh, the Tumble...), so each pair shows the same ground. Not in the suite. */
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = join(ROOT, 'docs', 'sporewood');
const suffix = process.argv[2] || 'now', only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* [tag, column, extra script run after the hero is placed (the view settles 40 frames after it)] */
const SHOTS = [
  ['glade-step', 36, ''],
  ['shelf-climb', 97, ''],
  ['vent-marsh', 186, ''],
  ['tumble', 256, ''],
  ['terrace', 300, ''],
  ['bog', 348, ''],
  ['pillars', 380, ''],
  ['gills', 452, ''],
  ['mother-room', 511, 'BK.boss&&(BK.boss.mode="idle",BK.boss.modeT=99);'],
  /* the rule in motion (the rebuild only): a hero halfway over the gap on a leaning cap, and her fold jammed on a grown room cap */
  ['lean-ride', 177, 'const m=BK.movers().find(q=>q.lean&&Math.abs(q.bx/16-177)<1);if(m){m.state="grow";m.k=.55;BK.P.x=m.bx+m.k*m.lean+16;BK.P.y=m.y0-m.k*m.rise;BK.P.vy=0;BK.SET.speed=0.001;}'],
  ['jam', 500, 'BK.god=true;BK.sim(240);const b=BK.boss,m=BK.movers().find(q=>q.mother&&q.x<b.x);if(b&&m){m.state=\"up\";m.k=1;m.upT=99;m.y=m.y0-m.rise;b.nodeRest=0;b.mode=\"capClapTell\";b.modeT=.05;BK.P.x=m.x-24;BK.P.y=m.y0+8;BK.sim(14);BK.SET.speed=0.02;}'],
].filter(s => !only || only.has(s[0]));
const pg = await openPage();
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='spore');
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(450);};
    /* the standing row at a column: the lowest air tile with footing under it that the start's reach could use is overkill here - the
       topmost open tile over solid ground is where a walker is */
    const foot=x=>{const L=BK.L;for(let y=1;y<L.H-1;y++){const t=L.grid[y*L.W+x],u=L.grid[(y+1)*L.W+x];if(t===0&&u!==0&&u!==17)return y;}return 13;};
    const out=[];for(const [tag,x,extra] of ${JSON.stringify(SHOTS)}){load();const y=foot(x);BK.tp(x,y);BK.sim(20);eval(extra);for(let k=0;k<50;k++)BK.step(1);out.push({tag,x,y,png:snap()});}
    return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, s.tag + '-' + suffix + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(s.tag + '-' + suffix + '.png  @' + s.x + ',' + s.y); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
