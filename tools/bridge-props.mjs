import assert from 'node:assert/strict';
import {LEVELS,BRIDGE_STANDING,bridgeSpanUnder} from '../src/level.js';
const bad=[];let n=0;
/* ON THE SPAN, ANY ROW OF IT (level review, 2026-09-24): the old test asked only the row over the deck, and a rope bridge sags, so the
   Stockade's trophy rack stood IN the planks midway along. Asked here in the tool's own words, so a narrower rule in level.js cannot pass it. */
const onSpan=(L,e)=>bridgeSpanUnder(L,e)||(L.ents||[]).find(b=>b.t==='bridge'&&e!==b&&e.x>=b.x&&e.x<=(b.x1??b.x)&&e.y+1>=b.y&&e.y<=b.y+3);
for(const lv of LEVELS){const L=lv.build();for(const e of L.ents){if(BRIDGE_STANDING.has(e.t)&&!e.hang&&!e.perch){n++;if(onSpan(L,e))bad.push(lv.id+' '+(e.kind||e.t)+'@'+e.x+','+e.y);}}}
assert.deepEqual(bad,[]);const L=LEVELS.find(l=>l.id==='kings').build();/* (claude/kingswood2) KINGSWOOD 2: the old wood's playtest sections (the hunting stands' cracked posts, the old stone) went with it - its stands' gap is crossed by a dropped LOG SPAN now, and nothing stands on the span's cells */assert(L.sections.some(s=>s.name==='THE HUNTING STANDS'),'Kingswood keeps THE HUNTING STANDS');const sp=L.hoists.find(h=>h.id==='standSpan');assert(sp&&!L.ents.some(e=>BRIDGE_STANDING.has(e.t)&&e.y===sp.span[2]-1&&e.x>=sp.span[0]&&e.x<=sp.span[1]),'nothing stands on the log span over the stands gap');console.log(n+' standing props clear of breakable spans; the Kingswood stands and their log span clear.');
