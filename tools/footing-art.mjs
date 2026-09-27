// tools/footing-art.mjs — NOTHING STANDS ON AN INVISIBLE PLATFORM. Every floor a hero or a creature can stand on is DRAWN.
//
// Daniel, 2026-09-25, of Highcrown: "towards the end of the level enemies on some invisible platforms. Can we fix that?"
// They were standing on real tiles. The gallery and chapel ledges (one-way runs of 13 and 18 tiles) are inside the
// castle's L.masonry, so resolveTiles picked their picture from LEDGE_SETS.masonry - whose `ledge` list held ONE picture -
// with `ledge[(rnd() * 3) | 0]`. Two middle tiles in three came back `undefined`, were never drawn, and a javelin and an
// archer stood on the gaps. Nothing looked: tools/floaters.mjs and newlevel.mjs read the GRID (the tile is there, so the
// foe is standing), and floatLab reads the PROPS. Nobody asked whether the floor had a picture.
//
// This loads every level in the page, lets resolveTiles run as the game runs it, and asks of every cell you can STAND ON
// (a solid or ledge tile with open air over it) whether it has a tile sprite. It fails on any that does not, listing the
// creatures (and checkpoints, silvers, strays) stood on one first - they are what a player notices - then every bare floor cell.
// Exempt, because something else paints them (each says where):
//   L.caravan  the Sunken Caravan paints its own sand (cvTile)             L.fields   the phantom planks (drawFieldsTiles)
//   L.mage     the Mage's Folly skins its tower (drawMageTiles)            L.sanctum  the hall is painted, not tiled (src/sanctum.js)
//   L.stone    a menhir is drawn whole over its column                     slopes     src/slopes.js draws ids 20-25
//   an ambush or alarm gate is laid at runtime (PORT) and has its own art the moment it is laid
// PROVED RED FIRST (2026-09-25): on the old LEDGE_SETS.masonry it failed Highcrown (the gallery at row 34, the chapel at
// row 14) and every other level with a ledge run inside L.masonry.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const want = process.argv.slice(2).filter(a => !a.startsWith('-'));
const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');const res=[];
    const want=${JSON.stringify(want)};
    const SOLID=new Set([T.SOLID,T.CRATE,T.PALISADE,T.PORT,T.CLIMB,T.SOFT,T.ICE,T.WEB]),LEDGE=new Set([T.ONEWAY,T.REED,T.PLANK,T.BOUNCER,T.SHELF,T.RAIL,T.CRYST]);
    const FLY=new Set(['bat','crow','wasp','harpy','kite','petrel','vulture','boo','haunt','imp','tome','broom','emberwisp','fledgling','gull','jelly','lanternshade','familiar','owl']);
    for(let i=0;i<LEVELS.length;i++){const lv=LEVELS[i];if((lv.hidden&&!lv.secret)||lv.id==='custom'||(want.length&&!want.includes(lv.id)))continue;
      try{BK.load(i);}catch(err){res.push({id:lv.id,err:String(err.message||err)});continue;}
      const L=BK.L,W=L.W,H=L.H,G=L.grid,S=BK.tileSpr();
      if(L.caravan||L.fields||L.mage||L.sanctum){res.push({id:lv.id,skip:L.caravan?'caravan':L.fields?'fields':L.mage?'mage':'sanctum'});continue;}
      const inStone=(x,y)=>(L.stone||[]).some(z=>x>=z[0]&&x<=z[1]&&y>=z[2]&&y<=z[3]);
      const floor=t=>SOLID.has(t)||LEDGE.has(t),open=t=>!SOLID.has(t);
      const bare=new Set();for(let y=1;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,t=G[k];if(!floor(t)||!open(G[k-W])||S[k]||inStone(x,y))continue;bare.add(k);}
      /* the creatures on them: the level's own, its ambush waves and its alarm garrisons, as placed (feet on row y, floor on y+1) */
      const on=[];const look=(t,x,y,from)=>{if(FLY.has(t))return;const k=(y+1)*W+x;if(bare.has(k))on.push(t+'@'+x+','+y+(from||''));};
      for(const e of L.ents)if(e.t!=='coin'&&e.t!=='deco')look(e.t,e.x,e.y);
      for(const a of (L.ambushes||[]))for(const w of a.waves)for(const [t,x,y] of w)look(t,x,y==null?a.row:y,' (ambush '+a.name+')');
      for(const a of (L.alarms||[]))for(const g of (a.garrison||[]))look(g.t,g.x,g.y,' (alarm '+a.id+')');
      const cells=[...bare].map(k=>(k%W)+','+Math.floor(k/W));res.push({id:lv.id,bare:cells.length,on,cells:cells.slice(0,12)});}
    return res;})()`, 1800000);
  out = { rows: out, errors: pg.errors.slice(0, 3) };
} finally { pg.close(); }
const fails = [];
for (const r of out.rows) {
  if (r.err) { fails.push(r.id + ': will not load: ' + r.err); continue; }
  if (r.skip) continue;
  if (r.on.length) fails.push(r.id + ': ' + r.on.length + ' thing(s) placed on a floor with no picture: ' + r.on.join(' '));
  if (r.bare) fails.push(r.id + ': ' + r.bare + ' floor cell(s) with no picture, e.g. ' + r.cells.join(' '));
}
if (out.errors.length) fails.push('page errors ' + JSON.stringify(out.errors));
for (const f of fails) console.log(f);
const n = out.rows.filter(r => !r.skip && !r.err).length, skipped = out.rows.filter(r => r.skip).map(r => r.id + ' (' + r.skip + ')');
assert.deepEqual(fails, [], 'floor you cannot see');
console.log('footing-art: every floor cell you can stand on is drawn, in ' + n + ' levels' + (skipped.length ? '; painted by their own code: ' + skipped.join(', ') : ''));
