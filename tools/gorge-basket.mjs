// tools/gorge-basket.mjs - THE RED GORGE's baskets and ropes, the soft-lock Daniel hit on bridge two (claude/gorgebasket, 10-03).
// His basket "did not get low enough": it sank 36 px/s but a flood comes every ~10 s, so after its first ride the ledges basket (18 rows) was
// wound up again before it ever reached the bridge and hung out of reach for good. Asserts, for each gorge basket, over six floods with a hero
// standing by it (no ride): after EVERY flood the basket is back at its foot (y0, flush with the bridge) for at least MIN_DWELL s before the next
// flood lifts it. And the ropes: the glint is on the falls' rope from its terrace and on the narrows' rope from its landing, and the told prompt
// ('CLIMB THE ROPE: UP') fires the first time the hero comes to a rope's foot.   node tools/gorge-basket.mjs
import { openPage } from './cdp.mjs';
const MIN_DWELL = 2.0;
const pg = await openPage({ audio: false, fonts: false }); let bad = 0;
const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='redgorge'));BK.state='play';BK.god=true;BK.sim(30);
    for(const e of BK.enemies())e.alive=false;
    const G=()=>BK.redgorge(),out={baskets:{}};
    for(const id of ['mouth','ledges','narrows']){const m=BK.movers().find(q=>q.gorge===id);BK.tp(m.x/16+6,Math.round(m.y0/16)-1);BK.sim(4);
      let floods=0,prev='',dwell=0,best=[],cur=0,lowest=1e9;
      for(let i=0;i<60*75&&floods<7;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);const ph=G().phase;
        if(ph==='flood'&&prev!=='flood'){floods++;if(floods>1)best.push(+(cur/60).toFixed(2));cur=0;}
        if(m.y>=m.y0-0.5)cur++; prev=ph;}
      out.baskets[id]={rows:[m.y0/16,m.y1/16],dwells:best};}
    /* the ropes: the glint, the told prompt */
    BK.god=true;BK.tp(30,135);BK.sim(3);out.glintFalls=G().glint&&G().glint.key;
    BK.tp(18,64);BK.sim(3);out.glintNarrows=G().glint&&G().glint.key;
    BK.tp(21,135);BK.sim(5);out.toldRope=!!G().said.rope;
    return out;})()`, 240000);
  for (const [id, b] of Object.entries(r.baskets)) ok(b.dwells.length >= 3 && b.dwells.every(d => d >= MIN_DWELL), 'basket ' + id + ' (rows ' + b.rows.join('->') + '): back at its foot for >= ' + MIN_DWELL + ' s before each flood: ' + JSON.stringify(b.dwells));
  ok(r.glintFalls === 'fallsRope', 'the falls rope glints from its terrace: ' + r.glintFalls);
  ok(r.glintNarrows === 'narrowsRope', 'the narrows rope glints from its landing: ' + r.glintNarrows);
  ok(r.toldRope, 'the told prompt CLIMB THE ROPE fired at the first rope foot');
  if (pg.errors.length) { console.log('page errors: ' + pg.errors.slice(0, 3).join(' | ')); bad++; }
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
