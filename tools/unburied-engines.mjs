/* tools/unburied-engines.mjs - THE UNBURIED FIELD'S TWO NEW VERBS, DRIVEN IN THE PAGE (claude/unburiedart, Daniel 2026-10-03/04).
     THE MANGONEL AT THE BRIDGEHEAD: strike it and its stone smashes the bowmen's palisade on the far bank - the top row goes (the bottom stays as a step), the two bowmen of THE FAR BANK are thrown down
       (hurtFoe, as the ballista does). Never required (tools/unburied.mjs holds that: the palisade is two rows, a hop).
     THE STANDING TOWER'S DRAWBRIDGE: strike the cleat on the deck and the leaf runs down - seven ONEWAY cells across the gap to the gatehouse's gallery - and the hero walks across it. The Rider's gate STAYS SHUT
       when the Rider is beaten, and on a return to the level (the tower's bridge is the way into the chapel, not a shortcut). A respawn puts the bridge back up.
   node tools/unburied-engines.mjs   (PORT=<free port> to pick the page's server) */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.hud='minimal';const out={};
    const fi=LEVELS.findIndex(l=>l.id==='unburied');const fresh=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(200);BK.step(1);};
    const G=36,TS=16,at=(x,y)=>BK.L.grid[y*BK.L.W+x];
    /* the mangonel */
    fresh();{ const F=BK.unbField(),m=F.engines.find(e=>e.t==='mangonel');out.mgFound=!!m;out.palBefore=[at(320,G-1),at(320,G),at(321,G-1),at(321,G)];
      const archers=BK.enemies().filter(e=>e.t==='archer'&&e.x>5100&&e.x<5400);out.archers=archers.length;
      BK.tp(266,G);BK.look(266,G);BK.P.face=1;BK.press('atk');for(let i=0;i<40;i++)BK.sim(1);out.mgWind=m.state;
      for(let i=0;i<400&&!F.farbank;i++)BK.sim(1);out.farbank=!!F.farbank;out.palAfter=[at(320,G-1),at(320,G),at(321,G-1),at(321,G)];
      for(let i=0;i<30;i++)BK.sim(1);out.archersDown=archers.filter(a=>!a.alive).length;out.mgState=m.state; }
    /* the drawbridge */
    fresh();{ const F=BK.unbField(),d=F.engines.find(e=>e.t==='drawbridge');out.dbFound=!!d;out.leafBefore=[347,350,353].map(x=>at(x,24));
      BK.tp(345,23);BK.look(345,23);BK.P.face=1;BK.P.vx=0;for(let i=0;i<20;i++)BK.sim(1);out.onDeck=Math.abs(BK.P.y-24*TS)<4;BK.press('atk');for(let i=0;i<40;i++)BK.sim(1);out.dbDrop=d.state;
      for(let i=0;i<260&&d.state!=='down';i++)BK.sim(1);out.dbState=d.state;out.leafAfter=[347,350,353].map(x=>at(x,24));
      BK.K=null;const K=BK.keys;K.right=true;for(let i=0;i<260;i++)BK.sim(1);K.right=false;out.crossedX=Math.round(BK.P.x/TS);out.crossedY=Math.round(BK.P.y/TS);
      /* a respawn puts the bridge back up */
      BKT.respawn();BK.sim(10);out.leafReset=[347,350,353].map(x=>at(x,24)); }
    /* the Rider's gate stays shut: a return to the level with the Rider already beaten */
    BK.PROG.unburied=Object.assign(BK.PROG.unburied||{},{mini:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(20);out.gateAfterMini=[G-4,G-2,G].map(y=>at(UF_GATE,y));
    return out;})()`.replace('UF_GATE', '356'), 600000);
  ok(r.mgFound && r.dbFound, 'the level has its mangonel and its standing tower with a drawbridge');
  ok(r.palBefore.every(t => t === 7), 'the far bank palisade stands before the stone: ' + JSON.stringify(r.palBefore));
  ok(r.farbank && r.palAfter[0] === 0 && r.palAfter[2] === 0 && r.palAfter[1] === 7 && r.palAfter[3] === 7, 'struck, the mangonel smashes the palisade: the top row is gone, the bottom stays a step ' + JSON.stringify(r.palAfter));
  ok(r.archers >= 2 && r.archersDown >= 2, 'the two bowmen of THE FAR BANK are thrown down (' + r.archersDown + ' of ' + r.archers + ')');
  ok(r.leafBefore.every(t => t === 0), 'the leaf is up before the cleat is struck (no floor across the gap)');
  ok(r.onDeck && r.dbState === 'down' && r.leafAfter.every(t => t === 2), 'struck on the deck, the drawbridge runs down: seven ONEWAY cells across the gap (' + r.dbDrop + ' then ' + r.dbState + ', ' + JSON.stringify(r.leafAfter) + ')');
  ok(r.crossedX >= 354 && r.crossedY <= 25, 'and the hero walks across it onto the gatehouse gallery (x ' + r.crossedX + ', row ' + r.crossedY + ')');
  ok(r.leafReset.every(t => t === 0), 'a respawn puts the bridge back up');
  ok(r.gateAfterMini.every(t => t === 12), "the Rider's gate stays shut on a return to the level with the Rider beaten: the tower's bridge is the way in " + JSON.stringify(r.gateAfterMini));
} finally { pg.close(); }
console.log(fails ? '\nFAIL: ' + fails : '\nok  unburied-engines  the mangonel smashes the far bank, the drawbridge is the way in, the gate stays shut');
process.exit(fails ? 1 : 0);
