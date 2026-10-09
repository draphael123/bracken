// tools/gate-openers.mjs - EVERY GATE THE ROAD SHUTS CAN BE OPENED (claude/kingsgate).
// Daniel, live in KINGSWOOD at 7 minutes: "This gate cannot be opened." The court's portcullis is lifted by a plate on the ledge
// beside it - and the plate had been placed at the ledge's own row, INSIDE the boards, a tile under the feet of anyone standing
// there. main.js presses a plate when a hero's feet are within 4 px of it, so it never went down and the gate never lifted.
// Fork one's high-road plate and fork two's canopy plate had the same fault (no gate on those, so nobody was walled in).
//   STATIC (Node, every level):
//     - every plate / gate-plate stands IN AIR WITH A FLOOR UNDER IT: its row is the row a hero stands in, so his feet meet it
//     - every plate / gate-plate / capstan / winch that names a gate names a column that really holds a portcullis
//     - every plate that lifts a gate is reachable from the level's START (src/reachcore.js's fill, the gate itself shut)
//     - KINGSWOOD: with the bell's gate DROPPED, the road past it is still reachable (the roof hatch)
//   RUNTIME (the real page, KINGSWOOD - every gate on its road, from every state the road can be in):
//     - the court gate: shut on a fresh run; a hero standing on the ledge plate lifts the whole column
//     - die BEFORE pressing it: after the respawn the plate still presses and the gate still lifts
//     - die AFTER pressing it: after the respawn the gate is open, or the plate is armed again and lifts it
//     - the kennel gate: shut until the Great Hound falls, open after; a death after he falls does not shut it again
//   node tools/gate-openers.mjs            both        node tools/gate-openers.mjs --static   Node only
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const fails = [], okc = [];
const ok = (c, m) => { if (!c) fails.push(m); else okc.push(m); };
const FLOOR = new Set([T.SOLID, T.ONEWAY, T.PLANK, T.CRATE, T.SHELF, T.ICE, T.CRYST, T.SOFT, T.PALISADE, T.RAIL].filter(v => v !== undefined));
const SOLIDISH = new Set([...FLOOR, T.PORT, T.SPIKE].filter(v => v !== undefined));
const portIn = (L, col) => { let n = 0; for (let y = 0; y < L.H; y++) if (L.grid[y * L.W + col] === T.PORT) n++; return n; };

for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch (e) { continue; }   /* (a level that does not build is the build check's to report) */
  const at = (x, y) => L.grid[y * L.W + x];
  let reach = null;
  for (const e of L.ents) {
    if (e.t === 'plate' || e.t === 'gplate') {
      ok(!SOLIDISH.has(at(e.x, e.y)) && FLOOR.has(at(e.x, e.y + 1)), lv.id + ': the ' + e.t + ' at ' + e.x + ',' + e.y + ' stands in air on a floor, where a hero\'s feet press it (its tile ' + at(e.x, e.y) + ', under it ' + at(e.x, e.y + 1) + ')');
      if (typeof e.gate === 'number') {
        ok(portIn(L, e.gate) > 0, lv.id + ': the ' + e.t + ' at ' + e.x + ',' + e.y + ' names gate column ' + e.gate + ', and that column holds a portcullis');
        reach = reach || floodReach(L, T, { rides: true }).seen;
        ok(reach.has(e.x + ',' + e.y) || reach.has((e.x - 1) + ',' + e.y) || reach.has((e.x + 1) + ',' + e.y), lv.id + ': the ' + e.t + ' at ' + e.x + ',' + e.y + ' that lifts gate ' + e.gate + ' is reachable from the start');
      }
    }
    if ((e.t === 'capstan' || e.t === 'winch') && typeof e.gate === 'number' && e.gy0 !== undefined)
      ok(e.gy1 >= e.gy0 && e.gate >= 0 && e.gate < L.W, lv.id + ': the ' + e.t + ' at ' + e.x + ' names a gate inside the level');
  }
}

/* KINGSWOOD: the bell's gate starts open; rung, it drops rows 15-19 at its column for 6 s. The roof hatch is the way round it. */
{ const L = LEVELS.find(l => l.id === 'kings').build(), bell = L.ents.find(e => e.t === 'bell' && typeof e.gate === 'number');
  ok(!!bell, 'kings: the first hall\'s bell and its gate are there');
  if (bell) { const grid = L.grid.slice(); for (let y = 15; y <= 19; y++) grid[y * L.W + bell.gate] = T.PORT;
    const seen = floodReach({ ...L, grid }, T, { rides: true }).seen; let past = false; for (let x = bell.gate + 1; x < bell.gate + 12 && !past; x++) for (let y = 0; y < L.H; y++) if (seen.has(x + ',' + y)) { past = true; break; }
    ok(past, 'kings: with the bell\'s gate dropped the road past column ' + bell.gate + ' is still reachable (the roof hatch)'); } }

if (fails.length) { console.log('gate-openers (static): ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('gate-openers (static) OK: ' + okc.length + ' checks - every plate stands where a hero\'s feet press it, every gate a plate names is a real portcullis the plate can be reached for, and the Kingswood bell gate has its way round');
if (process.argv.includes('--static')) process.exit(0);

const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{const{LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;const li=LEVELS.findIndex(l=>l.id==='kings');const out={};
    const fresh=()=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.load(li);BK.start();BK.state='play';BK.god=true;BK.sim(30);};
    const L=()=>typeof BK.L==='function'?BK.L():BK.L, port=c=>{const l=L();let n=0;for(let y=0;y<l.H;y++)if(l.grid[y*l.W+c]===T.PORT)n++;return n;};
    const plate=()=>BK.props().find(p=>p.t==='plate'&&p.gate===585);
    const stand=(c,r,n)=>{BK.tp(c,r);BK.P.vx=0;BK.P.vy=0;BK.sim(n||40);};
    const die=()=>{BK.god=false;const P=BK.P;P.inv=0;P.hurt=0;BK.damagePlayer(P.x,99999,{unblockable:true,up:true});for(let i=0;i<600&&!(BK.P.dead>0);i++)BK.sim(1);const died=BK.P.dead>0;for(let i=0;i<600&&BK.P.dead>0;i++)BK.sim(1);BK.sim(5);BK.god=true;return died;};
    /* 1. the court gate, fresh */
    fresh(); out.shut0=port(585); stand(583,7); out.press=[!!plate().down,port(585),Math.round(BK.P.y)];
    /* 2. die before pressing */
    fresh(); stand(574,13,10); out.d1=die(); out.d1at=[Math.round(BK.P.x/16),Math.round(BK.P.y/16)]; out.d1shut=port(585); out.d1plate=!!plate().down; stand(583,7); out.d1press=[!!plate().down,port(585)];
    /* 3. die after pressing, before passing */
    fresh(); stand(583,7); out.d2pre=port(585); stand(575,13,10); out.d2=die(); out.d2shut=port(585); out.d2plate=!!plate().down; if(out.d2shut){stand(583,7);} out.d2after=port(585);
    stand(584,13,5); BK.keys.right=true; BK.sim(90); BK.keys.right=false; out.d2walk=Math.round(BK.P.x/16);
    /* 4. the kennel gate (the Great Hound's) */
    fresh(); const m=L().mini; out.k0=port(m.gate); stand(Math.floor(m.trigger/16)+3,13,60); out.kOn=!!BK.miniActive; const hound=()=>(typeof BK.enemies==='function'?BK.enemies():BK.enemies).find(e=>e.alive&&e.t==='greathound');out.kHound=!!hound();for(let i=0;i<40&&hound();i++){const h=hound();h.guard=false;BKT.hurtEnemy(h,99999,h.x-20,false);BK.sim(2);}out.kSlay=!hound(); BK.sim(240); out.k1=port(m.gate); out.kd=die(); out.k2=port(m.gate);
    return out;})()`, 600000);
} finally { await pg.close(); }
const r = R;
ok(r.shut0 === 14, 'court gate: shut on a fresh run (14 bars, ' + r.shut0 + ')');
ok(r.press[0] && r.press[1] === 0, 'court gate: a hero standing on the ledge plate presses it and the whole column lifts ' + JSON.stringify(r.press));
ok(r.d1 && r.d1shut === 14 && !r.d1plate && r.d1press[0] && r.d1press[1] === 0, 'court gate: a death before the plate - after the respawn the plate still presses and the gate lifts ' + JSON.stringify([r.d1, r.d1at, r.d1shut, r.d1plate, r.d1press]));
ok(r.d2pre === 0 && r.d2 && r.d2after === 0, 'court gate: a death after the plate - after the respawn the gate is open, or the plate presses again and lifts it ' + JSON.stringify([r.d2pre, r.d2, r.d2shut, r.d2plate, r.d2after]));
ok(r.d2walk > 586, 'court gate: and the hero walks through its column (to ' + r.d2walk + ')');
ok(r.k0 > 0 && r.kOn && r.k1 === 0, 'kennel gate: shut until the Great Hound falls, open after ' + JSON.stringify([r.k0, r.kOn, r.kSlay, r.k1]));
ok(r.kd && r.k2 === 0, 'kennel gate: a death after he falls does not shut it again ' + JSON.stringify([r.kd, r.k2]));
if (fails.length) { console.log('gate-openers (runtime): ' + fails.length + ' failure(s)\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('gate-openers (runtime) OK: Kingswood\'s court gate lifts from its ledge plate fresh, after a death before the plate and after a death past it; the kennel gate opens on the Great Hound and stays open through a death');
