import assert from 'node:assert/strict';
import {LEVELS,DRESS} from '../src/level.js';
import {GROUND_KITS,ALLOWED_DECORATIONS} from '../src/dressing.js';
let count=0;const bad=[];
export function permitted(id,kind){return (ALLOWED_DECORATIONS[id]||[]).includes(kind);}
for(const lv of LEVELS){assert(GROUND_KITS[lv.id],lv.id+' needs its own ground kit');assert(ALLOWED_DECORATIONS[lv.id],lv.id+' needs an allowlist');const L=lv.build();for(const kind of [...GROUND_KITS[lv.id].kinds,...(DRESS[lv.id]||[]).map(x=>x[0]),...L.ents.filter(e=>e.t==='deco').map(e=>e.kind)]){count++;if(!permitted(lv.id,kind))bad.push(lv.id+': '+kind);}}
assert(!permitted('storm','thistle')&&!permitted('storm','gorse'),'moor plants do not belong to Stormhold');
assert(!permitted('spire','tent'),'pilgrims use a lean-to');
assert(!permitted('wood','unreviewed_kind'),'unlisted additions fail closed');
assert.deepEqual(bad,[]);console.log(count+' scatter, dressing and hand-placed decorations use their level allowlist.');
