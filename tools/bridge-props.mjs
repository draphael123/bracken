import assert from 'node:assert/strict';
import {LEVELS,BRIDGE_STANDING,bridgeSpanUnder} from '../src/level.js';
const bad=[];let n=0;
for(const lv of LEVELS){const L=lv.build();for(const e of L.ents){if(BRIDGE_STANDING.has(e.t)&&!e.hang&&!e.perch){n++;if(bridgeSpanUnder(L,e))bad.push(lv.id+' '+(e.kind||e.t)+'@'+e.x+','+e.y);}}}
assert.deepEqual(bad,[]);const L=LEVELS.find(l=>l.id==='kings').build();assert.deepEqual(L.playtestSections.map(s=>s.name),['THE HUNTING STANDS','THE OLD STONE']);assert(L.timber,'cuttable stand update must be enabled');assert(L.ents.some(e=>e.t==='timber'&&e.x>=354&&e.x<=401),'a cuttable hunting stand');console.log(n+' standing props clear of breakable spans; both Kingswood sections and cuttable stand present.');
