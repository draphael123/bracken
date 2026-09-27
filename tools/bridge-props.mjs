import assert from 'node:assert/strict';
import {LEVELS,BRIDGE_STANDING,bridgeSpanUnder} from '../src/level.js';
const bad=[];let n=0;
/* ON THE SPAN, ANY ROW OF IT (level review, 2026-09-24): the old test asked only the row over the deck, and a rope bridge sags, so the
   Stockade's trophy rack stood IN the planks midway along. Asked here in the tool's own words, so a narrower rule in level.js cannot pass it. */
const onSpan=(L,e)=>bridgeSpanUnder(L,e)||(L.ents||[]).find(b=>b.t==='bridge'&&e!==b&&e.x>=b.x&&e.x<=(b.x1??b.x)&&e.y+1>=b.y&&e.y<=b.y+3);
for(const lv of LEVELS){const L=lv.build();for(const e of L.ents){if(BRIDGE_STANDING.has(e.t)&&!e.hang&&!e.perch){n++;if(onSpan(L,e))bad.push(lv.id+' '+(e.kind||e.t)+'@'+e.x+','+e.y);}}}
assert.deepEqual(bad,[]);const L=LEVELS.find(l=>l.id==='kings').build();assert.deepEqual(L.playtestSections.map(s=>s.name),['THE HUNTING STANDS','THE OLD STONE']);assert(L.timber,'cuttable stand update must be enabled');assert(L.ents.some(e=>e.t==='timber'&&e.x>=354&&e.x<=401),'a cuttable hunting stand');console.log(n+' standing props clear of breakable spans; both Kingswood sections and cuttable stand present.');
