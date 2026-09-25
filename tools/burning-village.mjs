/* tools/burning-village.mjs — THE BURNING VILLAGE KEEPS ITS PROMISES (batch 5, 2026-09-21).
   Briefs: .claude/briefs/burning-village-pitch.md + -design.md. What this proves, in the order the design lists it:
     1. fire spreads only from the Pyromancer's and the burning goblins' fires; the village's own fire never creeps
     2. water sets a catching cell back to unlit
     3. a trapped villager is freed by a real attack, runs, is counted - and nothing the fire does can kill one
     4. the wisp hurts on contact and nothing turns it; the burning goblin's touch costs nothing, only its swing
     5. the Pyromancer's heat rises with his attacks; struck, he overheats and OPENS; left alone he vents and does not;
        the square burns with his bar and clears when he vents
     6. the level meets the density bar (3.5-4.5 foes a screen, no run of flat screens), is plugged in (garrison, elite,
        three silvers, checkpoints), and clearing it opens the Pyromancer for coins (~800) beside her ten silver
   The pilot (all six heroes, normal health, 21+ runs) is tools/pyromancer-pilot.mjs: it is too long for the suite. */
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { fireGrid, ignite, stepFire, douse, squareHeat, SPREADERS, UNLIT, CATCHING, ALIGHT, count } from '../src/fire-spread.js';
import { openPage } from './cdp.mjs';
import { pacing } from './pacing.mjs';

const TS = 16, lv = LEVELS.find(l => l.id === 'burning');
assert.ok(lv, 'THE BURNING VILLAGE is in LEVELS');
assert.equal(lv.needs, 'stockade', 'it opens off the Stockade');
const L = lv.build();

// ---- 1. ONLY HIS FIRE SPREADS ----
{ const G = fireGrid(L);
  assert.ok(G.cells.length > 300, 'the village has burnable ground: ' + G.cells.length);
  for (let t = 0; t < 60 * 60; t++) stepFire(G, 1 / 60);   /* a minute with nobody lighting anything */
  assert.equal(G.cells.filter(c => c.s !== UNLIT).length, 0, 'the village\'s own fire never creeps into the grid');
  for (const [x, y] of L.stillFires) assert.ok(!G.get(x, y), 'an authored fire at ' + x + ' stands on bare ground, not straw');
  for (const src of [undefined, 'village', 'still', 'player', 'pyro']) assert.equal(ignite(G, 30, 25, src), false, 'nothing but a spreader lights the straw: ' + src);
  assert.ok(ignite(G, 28, 25, 'burngob'), 'a burning goblin lights straw');
  for (let t = 0; t < 60 * 15; t++) stepFire(G, 1 / 60);
  const lit = G.cells.filter(c => c.s !== UNLIT);
  assert.ok(lit.length >= 5, 'and what it lights spreads: ' + lit.length);
  assert.ok(lit.every(c => c.x >= 26 && c.x <= 30), 'along its bale and no further: the road between bales is bare, so a fire never shuts the whole street: ' + lit.map(c => c.x).join(','));
  assert.ok(lit.every(c => SPREADERS.has(c.src)), 'every flame traces back to a spreader');
  // ---- 2. WATER ----
  const G2 = fireGrid(L); ignite(G2, 116, 25, 'pyromancer'); stepFire(G2, 0.5);
  assert.equal(G2.get(116, 25).s, CATCHING, 'lit, it is catching first (the warning)');
  assert.ok(douse(G2, 117, 25, 4) >= 1, 'water reaches it'); assert.equal(G2.get(116, 25).s, UNLIT, 'water sets a catching cell back to unlit');
  ignite(G2, 116, 25, 'pyromancer'); stepFire(G2, 2); assert.equal(G2.get(116, 25).s, ALIGHT); douse(G2, 114, 25, 4); assert.equal(G2.get(116, 25).s, UNLIT, 'and a burning one');
  // ---- the square follows his bar ----
  const G3 = fireGrid(L), sq = G3.cells.filter(c => c.square);
  assert.ok(sq.length >= 30, 'the square is burnable ground: ' + sq.length);
  squareHeat(G3, 50); stepFire(G3, 1.5); const half = sq.filter(c => c.s === ALIGHT).length;
  squareHeat(G3, 100); stepFire(G3, 1.5); const full = sq.filter(c => c.s === ALIGHT).length;
  assert.ok(half > 0 && full > half, 'the square burns as his heat climbs: ' + half + ' -> ' + full);
  assert.ok(full <= sq.length * 0.75, 'and there is always floor left: ' + full + ' of ' + sq.length);
  squareHeat(G3, 0); assert.equal(sq.filter(c => c.s !== UNLIT).length, 0, 'it clears when he vents');
}

// ---- 7. THE ROOFTOPS (docs/briefs/burning-village-rework.md §3): the street is climbed round, not walked ----
{ const at = (G, x, y) => G[y * L.W + x], S = 25, JUMP_UP = 3;
  const reach = G => floodReach({ ...L, grid: G }, T, { rides: true });
  /* THE FALLEN HOUSE: rock across the street taller than any jump, alight, and the roofs are the way round it */
  const H0 = (L.heaps || []).find(h => h.name === 'THE FALLEN HOUSE');
  assert.ok(H0, 'THE FALLEN HOUSE lies across the long street');
  assert.ok(H0.y1 - H0.y0 + 1 > JUMP_UP, 'it is taller than a jump: ' + (H0.y1 - H0.y0 + 1) + ' rows');
  for (let x = H0.x0; x <= H0.x1; x++) for (let y = H0.y0; y <= H0.y1; y++) assert.equal(at(L.grid, x, y), T.SOLID, 'the heap is rock at ' + x + ',' + y);
  const east = [H0.x1 + 2, S], seenAt = (R, [x, y]) => R.seen.has(x + ',' + y);
  assert.ok(seenAt(reach(L.grid), east), 'the street beyond it is reached');
  { const G = L.grid.slice(); for (const [x0, x1, y] of L.roofs) if (x1 >= H0.x0 - 20 && x0 <= H0.x1 + 20) for (let x = x0; x <= x1; x++) for (let r = y; r <= y + 2; r++) G[r * L.W + x] = T.AIR;
    assert.ok(!seenAt(reach(G), east), 'and only over the roofs: with the two roofs beside it gone, the street beyond is cut off'); }
  /* THE TRENCH: the street fallen into its cellars, a ladder out of every cellar, and the houses over it stand on its floor */
  assert.ok((L.trench || []).length, 'the street falls into its cellars');
  for (const [a, b, y0, y1] of L.trench) {
    for (let x = a; x <= b; x++) assert.notEqual(at(L.grid, x, y1 + 1), T.AIR, 'the cellar has a floor at ' + x);
    const cellars = []; let cur = null;
    for (let x = a; x <= b; x++) { const open = at(L.grid, x, y1) !== T.SOLID; if (open && !cur) cellars.push(cur = [x, x]); else if (open) cur[1] = x; else cur = null; }
    for (const [c0, c1] of cellars) { let ladder = false; for (let x = c0; x <= c1; x++) if (at(L.grid, x, y1) === T.NET) ladder = true;
      assert.ok(ladder, 'the cellar ' + c0 + '-' + c1 + ' has a ladder out of it (C5)'); }
    for (const h of L.houses) if (h.x1 >= a && h.x0 <= b) assert.ok(h.y1 >= y1, 'the house over the cellar at ' + h.x0 + ' stands on its floor (B9): front to row ' + h.y1); }
  /* THE BURNING BEAM: the only way across the second cellar, told, and it can be run by the slowest hero before it goes */
  const beams = (L.deckBreaks || []).filter(z => z.beam);
  assert.ok(beams.length, 'a burning beam spans a gap');
  for (const z of beams) {
    assert.ok(z.onTop && z.regrow && z.fuse > 0, 'it burns from the moment it is stood on, and grows back: ' + JSON.stringify(z));
    const secs = (z.x1 - z.x0 + 1) * TS / (92 * 0.9);
    assert.ok(secs < z.fuse, 'the paladin runs its ' + (z.x1 - z.x0 + 1) + ' tiles in ' + secs.toFixed(2) + ' s, inside its ' + z.fuse + ' s fuse');
    /* without it, the only way on is DOWN: into the cellar under it and through its fire to the ladder at the far end (a floor
       the model may not stand on is a floor of spikes to it) */
    const G = L.grid.slice(); for (let x = z.x0; x <= z.x1; x++) G[z.row * L.W + x] = T.AIR;
    assert.ok(seenAt(reach(G), [L.arena.x0 / TS - 60, S]), 'fall off it and the cellar still lets you out (C5)');
    for (const [a, b, , y1] of L.trench) for (let x = Math.max(a, z.x0 - 1); x <= b; x++) if (G[y1 * L.W + x] === T.AIR) G[y1 * L.W + x] = T.SPIKE;
    assert.ok(!seenAt(reach(G), [L.arena.x0 / TS - 60, S]), 'and the beam is the only way across that stays out of the fire'); }
  /* THE SMOKE: a plume stands in a gap between the roofs (no slab in its column), from a cellar floor up past the roofs */
  assert.ok((L.smoke || []).length >= 3, 'smoke rises out of the cellars');
  for (const s of L.smoke) { for (let y = s.y0; y <= s.y1; y++) assert.notEqual(at(L.grid, s.x, y), T.SOLID, 'the plume at ' + s.x + ' rises through open air (row ' + y + ')');
    assert.ok(L.trench.some(([a, b, , y1]) => s.x >= a && s.x <= b && s.y1 === y1), 'the plume at ' + s.x + ' rises from a cellar floor'); }
  /* AND THE ROUTE LEAVES THE STREET: the pacing strip had no platforming on it at all */
  const P = pacing(lv), up = P.route.filter(([x, y]) => x >= 200 && x <= 320 && y <= S - 9).length;
  assert.ok(up >= 20, 'the walked route goes up onto the roofs between 200 and 320: ' + up + ' tiles');
  assert.ok(P.stats.mix.P + P.stats.mix.H >= 2 && P.stats.alternations >= 4, 'the strip has platforming on it and alternates: ' + P.strip + ' (' + P.stats.alternations + ')');
  console.log('rooftops: ' + P.strip + '  (alternations ' + P.stats.alternations + ')');
}

// ---- 6. THE LEVEL ----
{ const R = floodReach(L, T), st = [...R.seen].map(s => s.split(',').map(Number));
  const combat = new Set(['check', 'sign', 'coin', 'deco', 'torch', 'silver', 'key', 'stray', 'npc', 'stal', 'web', 'gate', 'lockgate', 'captive', 'watertrough', 'villagewell', 'mend']);
  const xmax = L.arena.x0 / TS, per = [], flat = [];
  for (let x = 0; x + 24 <= xmax; x += 24) { per.push(L.ents.filter(e => e.x >= x && e.x < x + 24 && !combat.has(e.t) && !e.boss).length);
    flat.push(new Set(st.filter(([sx]) => sx >= x && sx < x + 24).map(([, y]) => y)).size <= 2); }
  const avg = per.reduce((a, b) => a + b, 0) / per.length;
  assert.ok(avg >= 3.5 && avg <= 4.5, 'foes a screen ' + avg.toFixed(2) + ' (the bar is 3.5-4.5): ' + per.join(' '));
  assert.ok(!flat.some((f, i) => f && flat[i + 1] && flat[i + 2]), 'no run of three flat screens: ' + flat.map(f => f ? 'F' : '.').join(''));
  assert.equal(L.ents.filter(e => e.t === 'silver').length, 3, 'three silvers');
  assert.equal(L.ents.filter(e => e.t === 'captive').length, 6, 'six villagers to save');
  assert.ok(L.ents.some(e => e.elite && e.gate), 'an elite holds a gate');
  assert.ok(L.ents.filter(e => e.t === 'check').length >= 5, 'checkpoints');
  const kinds = new Set(L.ents.map(e => e.t)); for (const k of ['burngob', 'emberwisp', 'pyromancer', 'sprig', 'archer']) assert.ok(kinds.has(k), 'it places ' + k);
  const lsrc = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
  assert.match(lsrc, /\n  burning: \[\['/, 'a GARRISON row for the village');
  const calm = L.calm || []; assert.ok(!calm.some(([a, b]) => b - a > 80), 'no blanket calm');
  assert.ok(!(L.pools || []).length, 'no water to drown in: the troughs are props');
  console.log('density ' + avg.toFixed(2) + ' a screen [' + per.join(' ') + '], flat ' + flat.map(f => f ? 'F' : '.').join(''));
}

// ---- 3, 4, 5 and the store, in the page ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};const I=LEVELS.findIndex(l=>l.id==='burning');
  const boot=hero=>{BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=false;BK.P.hp=BK.P.maxHp;BK.sim(5);};
  const clear=()=>{for(const e of BK.enemies())if(!e.boss)e.alive=false;};
  /* 3. THE FIRST VILLAGER: cut free by the sword, counted, running - and the fire under her feet does nothing */
  {boot();clear();const V=BK.village();const cap=BK.props().find(p=>p.t==='captive'&&!p.hot&&!p.freed);
   BK.tp(Math.round(cap.x/16)-1,Math.round(cap.y/16)-1);BK.P.face=1;BK.sim(5);const before=V.saved();
   for(let i=0;i<10&&!cap.freed;i++){BK.press('atk');BK.sim(24);}
   const runner=BK.props().find(p=>p.t==='vrunner');const at=runner&&runner.x;
   if(runner){const c=V.G().get(Math.floor(runner.x/16),Math.floor(runner.y/16)-1);if(c){c.s=2;c.t=0;}BK.sim(60);}
   out.rescue={freed:cap.freed,before,after:V.saved(),total:V.total(),ran:runner?Math.round(runner.x-at):null,runnerHp:runner?runner.hp:'none',stillThere:runner?BK.props().includes(runner)||runner.home:false};}
  /* the hot door: cut open unwatered it blows out; watered first it does not */
  {boot();clear();const cap=BK.props().find(p=>p.t==='captive'&&p.hot);BK.tp(Math.round(cap.x/16)-1,Math.round(cap.y/16)-1);BK.P.face=1;BK.sim(5);
   const hp0=BK.P.hp;for(let i=0;i<10&&!cap.freed;i++){BK.press('atk');BK.sim(24);}BK.sim(60);const hot={freed:cap.freed,lost:hp0-BK.P.hp};
   boot();clear();const cap2=BK.props().find(p=>p.t==='captive'&&p.hot);const tr=BK.props().filter(p=>p.t==='vtrough').sort((a,b)=>Math.abs(a.x-cap2.x)-Math.abs(b.x-cap2.x))[0];
   BK.tp(Math.round(tr.x/16)-1,Math.round(tr.y/16)-1);BK.P.face=1;BK.sim(5);for(let i=0;i<4&&tr.water>0;i++){BK.press('atk');BK.sim(24);}
   BK.tp(Math.round(cap2.x/16)-1,Math.round(cap2.y/16)-1);BK.P.face=1;BK.sim(5);const hp1=BK.P.hp;for(let i=0;i<10&&!cap2.freed;i++){BK.press('atk');BK.sim(24);}BK.sim(60);
   out.hotDoor={hot,watered:{cooled:!!cap2.cooled,freed:cap2.freed,lost:hp1-BK.P.hp}};}
  /* 4. THE WISP'S TOUCH, with the shield up; THE BURNING GOBLIN'S touch, walking, and then its swing */
  {boot();const w=BK.enemies().find(e=>e.t==='emberwisp');clear();w.alive=true;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;BK.P.x=w.x;BK.P.y=w.y+8;BK.keys.block=true;BK.P.face=1;BK.sim(2);   /* the baseline BEFORE the first touch: it lands on the first frame */
   for(let i=0;i<40&&BK.P.hp===hp0;i++){BK.P.x=w.x;BK.P.y=w.y+8;BK.sim(1);}BK.keys.block=false;out.wisp={lost:hp0-BK.P.hp,mark:BK.markOver(w)};}
  {boot();const gb=BK.enemies().find(e=>e.t==='burngob');clear();gb.alive=true;gb.mode='walk';gb.cd=99;gb.swingT=99;BK.P.hp=BK.P.maxHp;const hp0=BK.P.hp;
   for(let i=0;i<45;i++){BK.P.x=gb.x;BK.P.y=gb.y;gb.cd=99;gb.swingT=99;if(gb.mode!=='walk')gb.mode='walk';BK.sim(1);}const touch=hp0-BK.P.hp;
   BK.P.hp=BK.P.maxHp;BK.P.inv=0;gb.cd=0;gb.swingT=0;BK.P.x=gb.x+12*gb.face;for(let i=0;i<90&&BK.P.hp===BK.P.maxHp;i++){BK.P.x=gb.x+12*gb.face;BK.P.y=gb.y;BK.sim(1);}
   const lit=BK.village().G().cells.filter(c=>c.s>0).length;out.gob={touch,swing:BK.P.maxHp-BK.P.hp,lit};}
  /* 5. THE PYROMANCER */
  {boot();const A=BK.L.arena;BK.god=true;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const b=BK.boss;
   const G=()=>BK.village().G(),sqLit=()=>G().cells.filter(c=>c.square&&c.s===2).length;
   // his attacks heat him
   b.heat=0;b.cd=0;BK.P.x=b.x-120;let h0=b.heat;for(let i=0;i<400&&b.heat===h0;i++)BK.sim(1);const rose=b.heat-h0;
   // left alone near the top, he vents: no opening, the square clears
   b.heat=90;b.calmT=0;b.mode='stalk';b.cd=99;BK.sim(90);const litHot=sqLit();   /* held hot (struck a moment ago, no attack due): the square burns */
   b.calmT=5;b.cd=0;for(let i=0;i<400&&b.mode!=='vent';i++)BK.sim(1);for(let i=0;i<200&&b.mode==='vent';i++)BK.sim(1);   /* then let alone: he vents, and it is measured the moment the vent is over */
   const alone={mode:b.mode,open:+(b.open||0).toFixed(1),heat:Math.round(b.heat),litHot,litAfter:sqLit()};
   // struck while he runs hot, he cannot vent: his own fire takes him over the top and he OPENS
   b.heat=80;b.mode='stalk';b.cd=0;b.open=0;let opened=0;
   for(let i=0;i<900&&!(b.open>0);i++){if(i%40===0)BKT.hurtEnemy(b,1,b.x-20,false);BK.sim(1);}opened=+(b.open||0).toFixed(1);
   out.pyro={rose,alone,struck:{mode:b.mode,open:opened,heat:Math.round(b.heat),lit:sqLit()},hp:b.hp,max:b.maxHp};}
  /* THE COIN ROUTE: the Pyromancer is ten silver until the village is cleared, and then she is also 800 coins */
  {const S=BK.store;const P0=BKT.PROG;P0.heroes=P0.heroes||{};delete P0.heroes.pyro;P0.burning=P0.burning||{};P0.burning.cleared=false;
   const shut=S.coinRoute('pyro');P0.burning.cleared=true;const open=S.coinRoute('pyro');P0.coins=900;const s0=S.silverLeft();const ok=S.buy('pyro');
   out.store={shut,open,bought:!!P0.heroes.pyro,coins:P0.coins,silverSpent:s0-S.silverLeft()};delete P0.heroes.pyro;P0.burning.cleared=false;}
  /* 7. THE ROOFTOPS, in the page. THE BEAM: told from the first frame it is stood on, run end to end by the paladin with the
     right held, it holds; stood still on, it burns through and drops you into the cellar; and it comes back */
  {const z=()=>BK.L.deckBreaks.find(q=>q.beam);
   boot('paladin');clear();const Z=z();BK.tp(Z.x0-2,Z.row-1);BK.P.face=1;BK.sim(10);
   BK.keys.right=true;let told=null,on=null,maxY=0,f=0;for(;f<240&&BK.P.x<(Z.x1+2)*16;f++){BK.sim(1);if(on===null&&BK.P.ground&&BK.P.x>=Z.x0*16)on=f;if(told===null&&Z.t>=0)told=f;if(BK.P.x>Z.x0*16)maxY=Math.max(maxY,BK.P.y);}BK.keys.right=false;
   const ran={told:told-on,crossed:BK.P.x>=(Z.x1+1)*16,maxY:Math.round(maxY),rowY:Z.row*16};
   boot('knight');clear();const Z2=z();BK.tp(Z2.x0+1,Z2.row-1);   /* (clear of the plume under its middle, which would carry a falling hero straight back up) */BK.sim(2);const t0=Z2.t;BK.sim(Math.round(Z2.fuse*60)+20);const stood={t0:+t0.toFixed(2),down:Z2.down,y:Math.round(BK.P.y),row:Z2.row};
   BK.tp(Z2.x0-2,Z2.row-1);BK.sim(Math.round((5+1)*60));out.beam={ran,stood,back:!Z2.down};}
  /* THE SMOKE: a hero who jumps into a plume while it is up is carried up out of the cellar, past the roofs' eaves */
  {boot('knight');clear();const s=BK.L.smoke[0],V=BK.village();BK.tp(s.x,s.y1);BK.sim(5);
   for(let i=0;i<600&&V.smokeUp(s);i++)BK.sim(1);for(let i=0;i<600&&!V.smokeUp(s);i++)BK.sim(1);
   const y0=BK.P.y;BK.press('jump');BK.keys.jump=true;let top=y0;for(let i=0;i<120;i++){BK.sim(1);top=Math.min(top,BK.P.y);}BK.keys.jump=false;
   out.smoke={from:Math.round(y0/16),top:Math.round(top/16),limit:s.y0};}
  return out;})()`, 600000);
  console.log(JSON.stringify(r));

  assert.ok(r.rescue.freed, 'the sword cuts her free: ' + JSON.stringify(r.rescue));
  assert.equal(r.rescue.after, r.rescue.before + 1, 'and she is counted at once');
  assert.equal(r.rescue.total, 6, 'out of six');
  assert.ok(r.rescue.ran < -20, 'she runs for the gate (back down the road): ' + r.rescue.ran);
  assert.equal(r.rescue.runnerHp, undefined, 'a villager has no health for the fire to take');

  assert.ok(r.hotDoor.hot.freed && r.hotDoor.hot.lost > 0, 'a hot door cut open unwatered blows out: ' + JSON.stringify(r.hotDoor.hot));
  assert.ok(r.hotDoor.watered.cooled && r.hotDoor.watered.freed && r.hotDoor.watered.lost === 0, 'watered first, it opens quietly: ' + JSON.stringify(r.hotDoor.watered));

  assert.ok(r.wisp.lost > 0, 'the wisp hurts on contact, through a raised shield: ' + JSON.stringify(r.wisp));
  assert.equal(r.wisp.mark, '!!', 'and it wears the red cross');
  assert.equal(r.gob.touch, 0, 'walking into a burning goblin costs nothing');
  assert.ok(r.gob.swing > 0, 'its swing does: ' + JSON.stringify(r.gob));
  assert.ok(r.gob.lit > 0, 'and the straw it walks on catches');

  assert.ok(r.pyro.rose >= 8, 'his attacks heat him: ' + r.pyro.rose);
  assert.ok(r.pyro.alone.litHot > 0, 'hot, the square burns: ' + JSON.stringify(r.pyro.alone));
  assert.equal(r.pyro.alone.open, 0, 'left alone he vents and does not open: ' + JSON.stringify(r.pyro.alone));
  assert.ok(r.pyro.alone.heat < 20 && r.pyro.alone.litAfter === 0, 'the vent clears the square: ' + JSON.stringify(r.pyro.alone));
  assert.ok(r.pyro.struck.open > 2, 'struck while hot he overheats and OPENS: ' + JSON.stringify(r.pyro.struck));

  assert.equal(r.store.shut, false, 'before the village, silver only');
  assert.equal(r.store.open, true, 'after it, coins too');
  assert.ok(r.store.bought && r.store.coins === 100 && r.store.silverSpent === 0, 'bought for 800 coins, no silver: ' + JSON.stringify(r.store));
  assert.equal(r.beam.ran.told, 0, 'the beam is told the frame it is stood on (and not before): ' + JSON.stringify(r.beam));
  assert.ok(r.beam.ran.crossed && r.beam.ran.maxY <= r.beam.ran.rowY + 2, 'the paladin runs it end to end and it holds: ' + JSON.stringify(r.beam.ran));
  assert.ok(r.beam.stood.down && r.beam.stood.y > (r.beam.stood.row + 2) * 16, 'stand still on it and it burns through into the cellar: ' + JSON.stringify(r.beam.stood));
  assert.ok(r.beam.back, 'and it is back after it has burned through');
  assert.ok(r.smoke.top <= 12 && r.smoke.from - r.smoke.top >= 12, 'the smoke carries a hero up out of the cellar, past the eaves: ' + JSON.stringify(r.smoke));
  assert.deepEqual(pg.errors, []);
  console.log('the burning village keeps its promises.');
} finally { pg.close(); }
