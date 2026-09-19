import assert from 'node:assert/strict';
import {LEVELS} from '../src/level.js';
import {lightSupport} from '../src/fixtures.js';
let n=0;const bad=[];
for(const l of LEVELS){const L=l.build();for(const e of L.ents)if(e.t==='torch'||e.t==='lantern'&&e.perch){n++;if(!lightSupport(L,e.x*16+8,(e.y+1)*16-10))bad.push(l.id+' '+e.t+'@'+e.x+','+e.y);}}
assert.deepEqual(bad,[]);console.log(n+' authored torches and high lamps have a visible holder anchored in terrain.');
