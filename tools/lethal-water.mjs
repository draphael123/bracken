// tools/lethal-water.mjs - LETHAL WATER MUST READ AS LETHAL (claude/towpathchurch, Daniel 10-16, live photo of the Towpath: "the lock water looks like the water you swim").
// A pool you can neither swim nor wade (no `swim`, not `shallow`) bites or drowns whoever falls in (main.js: the inPool pass - waterHurts hands you back at ~27% elsewhere
// DROWNED). Such a pool must LOOK like it: src/main.js drawDeadWater draws it near-black under a pale fog-skin, with churning froth, sucking eddies, drowned wreckage and a
// reaching hand, and says THE LOCK WATER DROWNS / THIS WATER DROWNS the first time it is on the screen. THIS CHECK is the list: every level's pools that take that look are
// pinned here, so a NEW lethal pool in a level not listed fails until it is read here on purpose (and the pools with their own look - fire, poison, deadly, tarn, mud, rapids,
// capped - stay out of it).
//   node tools/lethal-water.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { isCallout } from '../src/hint-lines.js';
const OWN_LOOK = p => p.harm || p.fire || p.mud || p.rapids || p.tarn || p.capped || p.streetTide;
const LISTED = { wood: 2, marsh: 16,   /* (claude/frogking2: + the King's court, three lanes of biting water between his royal pads) */   /* (claude/marsh3: + the reed run's channel, the boom's water, the night pads' water) */   /* (claude/lumbertrail: the ford's deep pool under the raft, the tarn) (claude/marsh2: + the sluice house's far basin, deep until its gate is broken) */ canal: 11, towpath: 13 };   /* levels with pools drawn by drawDeadWater, and how many */
const found = {};
for (const l of LEVELS) { let L; try { L = l.build(); } catch (e) { continue; }
  const n = (L.pools || []).filter(p => !p.swim && !p.shallow && !p.dry && !OWN_LOOK(p)).length; if (n) found[l.id] = n; }
console.log('lethal-looking water by level:', JSON.stringify(found));
assert.deepEqual(found, LISTED, 'a level gained or lost pools you can neither swim nor wade: list it here (and read it: the lethal look is src/main.js drawDeadWater)');
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const fn = src.slice(src.indexOf('function drawDeadWater('), src.indexOf('// AND THE CURRENT, DRAWN'));
for (const [what, re] of [['a pale fog-skin', /fog-skin/], ['churning froth', /churn/], ['sucking eddies', /eddies/], ['drowned wreckage and a hand', /pale hand reaching/], ['a told first sight', /L\.drownTold/]]) assert.ok(re.test(fn), 'drawDeadWater lacks ' + what);
assert.ok(isCallout('THE LOCK WATER DROWNS') && isCallout('THIS WATER DROWNS'), 'the drowning lines are hint lines (they draw in the hint box)');
assert.ok(!/ p\.swim && !p\.shallow\) \{[^}]*drawDeadWater/.test(src), 'a swimmable pool is never drawn lethal');
const tp = LEVELS.find(l => l.id === 'towpath').build(); assert.ok(tp.waterHurts, 'the Towpath\'s water still bites and hands you back (waterHurts)');
console.log('lethal-water (static): ok');
/* DEADLY WATER IS A QUIET DRAIN (claude/deadwater, Daniel 10-18, after playing BATCH100: the tick used to shake and shove him, so climbing out was a fight).
   DESIGN CHANGE: while the hero is in a lethal / poison / foul pool he LOSES ~9% of MAX health a REAL second at Normal (src/main.js WATER_DRAIN 0.11 base, the shared environment drain of A13 - same as the breath),
   with NO knockback, NO stagger, NO hurt pose, NO mercy window, NO hand-back to the bank; the lethal-look pools (no swim flag) are swum and climbed out of like any pool. A short dip hurts, ~11 s kills.
   (The pools with their own rule keep it: fire, deadly = the Falling Tower trap, mud, tarn, rapids, capped; the Admiral's Champion's gap haul is the gap's own rule.)
   PAGE: PORT=<port> node tools/lethal-water.mjs   - PAGE=0 runs the static half only. */
if (process.env.PAGE !== '0') {
  const { openPage } = await import('./cdp.mjs');
  const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
  const pg = await openPage({ audio: false, fonts: false }); const E = (e, t = 300000) => pg.evalp(e, t);
  const BOOT = idx => `BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(${idx});BK.state='play';BK.start();BK.god=false;BK.SET.invincible=false;BK.SET.godmode=false;BK.enemies().forEach(e=>{e.alive=false;});BK.sim(20);const P=BK.P;`;
  const DEAD = '!q.dry&&!q.shallow&&!q.swim&&!q.harm&&!q.mud&&!q.tarn&&!q.rapids&&!q.capped&&!q.streetTide&&!q.fire&&!q.canal&&!q.leWater';   /* (batch101 integ: the Fog Canal's barge water and the Lantern-Eater's basin keep their hand-back: DEAD_SWIM in src/main.js) */
  try {
    await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/' });
    for (let i = 0; i < 300; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await new Promise(r => setTimeout(r, 200)); }
    for (const [id, sel] of [['towpath', DEAD], ['marsh', DEAD], ['burial', '!q.dry&&q.harm&&q.swim']]) {
      const idx = LEVELS.findIndex(l => l.id === id);
      const r = await E(`(()=>{${BOOT(idx)}const pools=(BK.L.pools||[]).filter(q=>${sel});
        for(const p of pools)for(const f of [0.5,0.3,0.7,0.2,0.85]){P.x=p.x0+(p.x1-p.x0)*f;P.y=p.y+30;P.vx=0;P.vy=0;P.hp=P.maxHp;P.inv=0;P.hurt=0;P.dead=0;P.drains&&P.drains.clear();BK.sim(2);
          if(!P.swim)continue;const x0=P.x,h0=P.hp,t0=BK.time;let hurt=0,inv=0,vx=0;for(let i=0;i<120&&!P.dead;i++){P.y=Math.max(P.y,p.y+30);BK.sim(1);hurt=Math.max(hurt,P.hurt||0);inv=Math.max(inv,P.inv||0);vx=Math.max(vx,Math.abs(P.vx||0));}
          return {found:true,maxHp:P.maxHp,lost:h0-P.hp,secs:BK.time-t0,hurt,inv,vx,moved:Math.abs(P.x-x0),swim:P.swim,dead:!!P.dead};}
        return {found:false};})()`);
      console.log(id + ' ' + JSON.stringify(r));
      ok(r.found, id + ': no lethal pool the hero could be put in'); if (!r.found) continue;
      const perSec = r.lost / r.secs / r.maxHp;
      ok(perSec > 0.06 && perSec < 0.14, id + ': drain is ' + (perSec * 100).toFixed(1) + '% of max hp a second, want about 9%');
      ok(r.hurt === 0 && r.inv === 0, id + ': the water made a hurt pose or a mercy window ' + JSON.stringify(r));
      ok(r.vx < 20 && r.moved < 30, id + ': the water shoved the hero (vx ' + r.vx + ', moved ' + r.moved + ')');
    }
    /* climbing out: at the surface the jump key takes him up and out of the pool (no hand-back: he is where he climbed) */
    const idxT = LEVELS.findIndex(l => l.id === 'towpath');
    const c = await E(`(()=>{${BOOT(idxT)}const p=(BK.L.pools||[]).find(q=>${DEAD});P.x=p.x0+(p.x1-p.x0)/2;P.y=p.y+30;P.vx=0;P.vy=0;P.hp=P.maxHp;P.inv=0;P.dead=0;BK.sim(2);
      let outAt=null;for(let i=0;i<240&&!P.dead;i++){BK.keys.up=true;if((P.y-p.y)<30)BK.press('jump');BK.sim(1);if(!P.swim&&P.y<p.y+4){outAt=i;break;}}BK.keys.up=false;return {outAt,hp:P.hp,maxHp:P.maxHp,y:P.y,surface:p.y};})()`);
    console.log('climb out: ' + JSON.stringify(c)); ok(c.outAt !== null, 'the hero cannot swim up and jump out of lethal water: ' + JSON.stringify(c));
    /* and a long dip kills, by name */
    const k = await E(`(()=>{${BOOT(idxT)}const p=(BK.L.pools||[]).find(q=>${DEAD});P.x=p.x0+(p.x1-p.x0)/2;P.y=p.y+30;P.vx=0;P.vy=0;P.hp=P.maxHp;P.inv=0;P.dead=0;
      for(let i=0;i<1200&&!P.dead;i++){P.y=Math.max(P.y,p.y+30);BK.sim(1);}return {dead:!!P.dead,hp:P.hp,killer:P.killer&&P.killer.name};})()`);
    console.log('long dip: ' + JSON.stringify(k)); ok(k.dead, 'a long dip in lethal water does not kill: ' + JSON.stringify(k));
  } finally { pg.close(); }
  if (fails.length) { console.error('lethal-water: FAIL\n' + fails.join('\n')); process.exit(1); }
  console.log('lethal-water: ok');
}
