import assert from 'node:assert/strict';
import {LEVELS,DRESS} from '../src/level.js';
import {GROUND_KITS,ALLOWED_DECORATIONS} from '../src/dressing.js';
let count=0;const bad=[];
export function permitted(id,kind){return (ALLOWED_DECORATIONS[id]||[]).includes(kind);}
for(const lv of LEVELS){assert(GROUND_KITS[lv.id],lv.id+' needs its own ground kit');assert(ALLOWED_DECORATIONS[lv.id],lv.id+' needs an allowlist');const L=lv.build();for(const kind of [...GROUND_KITS[lv.id].kinds,...(L.kits||[]).flatMap(z=>z[4].kinds),...(DRESS[lv.id]||[]).map(x=>x[0]),...L.ents.filter(e=>e.t==='deco').map(e=>e.kind)]){count++;if(!permitted(lv.id,kind))bad.push(lv.id+': '+kind);}}
assert(!permitted('storm','thistle')&&!permitted('storm','gorse'),'moor plants do not belong to Stormhold');
assert(!permitted('spire','tent'),'pilgrims use a lean-to');
assert(!permitted('wood','unreviewed_kind'),'unlisted additions fail closed');
assert.deepEqual(bad,[]);console.log(count+' scatter, dressing and hand-placed decorations use their level allowlist.');
/* A POOL THAT IS NOT THE SEA IS NOT A FLOOR (level review, 2026-09-24): the sprinkler left swim pools alone on purpose - coral belongs on
   the sea bed - and so dressed the Marsh's ferry channel with moss and a frog statue and the Wood's tarn with a stump, two rows under the
   water. In a level not dressed as the sea, no sprinkled decoration stands under a pool's surface. */
{ const SEA=new Set(['reef','shore','ship','city']),TS=16,sunk=[];
  for(const lv of LEVELS){const L=lv.build(),p=L.palette||{};if(SEA.has(p.set)||SEA.has(p.dress))continue;
    for(const e of L.ents)if(e.t==='deco'&&e.dressed&&(L.pools||[]).some(q=>!q.dry&&e.x*TS>=q.x0&&e.x*TS<=q.x1&&e.y*TS+8>q.y-2&&(q.bottom===undefined||e.y*TS<q.bottom)))sunk.push(lv.id+' '+e.kind+'@'+e.x+','+e.y);}
  assert.deepEqual(sunk,[],'sprinkled onto the bed of a pool in a level that is not the sea: '+sunk.join(' '));
  console.log('no sprinkled decoration under the water of a level that is not the sea.');}
/* AND NOTHING SPRINKLED IN A FIRE'S REACH (level review, 2026-09-24): the sprinkler kept clear of torches and braziers and not of a fire
   on the floor, so Kingswood's Fired Wood grew a skull totem between its firepits. */
{ const FIRE=new Set(['firepit','firevent','hotplate','brazier']),burnt=[];
  for(const lv of LEVELS){const L=lv.build();for(const e of L.ents)if(e.t==='deco'&&e.dressed&&L.ents.some(f=>FIRE.has(f.t)&&Math.abs(f.x-e.x)<=3&&Math.abs(f.y-e.y)<=3))burnt.push(lv.id+' '+e.kind+'@'+e.x+','+e.y);}
  assert.deepEqual(burnt,[],'sprinkled into a fire\'s reach: '+burnt.join(' '));
  console.log('no sprinkled decoration within three tiles of a fire on the floor.');}
