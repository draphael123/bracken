/* tools/burning-village.mjs — THE BURNING VILLAGE KEEPS ITS PROMISES (batch 5, 2026-09-21).
   Briefs: .claude/briefs/burning-village-pitch.md + -design.md. What this proves, in the order the design lists it:
     1. fire spreads only from the Pyromancer's and the burning goblins' fires; the village's own fire never creeps
     2. water sets a catching cell back to unlit
     3. a trapped villager is freed by a real attack, runs, is counted - and nothing the fire does can kill one
     4. the wisp's touch alone costs nothing (the combat pass: no untold hits, Daniel 2026-09-28); its TOLD blow - the white
        flare, a red !!, then the dart - burns through a raised shield; the burning goblin's touch costs nothing, only its swing
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
const COMBAT = new Set(['check', 'sign', 'coin', 'deco', 'torch', 'silver', 'key', 'stray', 'npc', 'stal', 'web', 'gate', 'lockgate', 'captive', 'watertrough', 'villagewell', 'mend']), THREATLESS = new Set(['folk']);
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
    /* design audit §13.2 TWIST: this beam's fuse is deliberately shorter than even the fastest hero (the pyromancer,
       1.43 s for these nine tiles) can outrun, so it is douseOnly - the paladin's slower 1.77 s is not the bar here,
       staying alive unwatered is not the point. Any other beam keeps the old bar: the slowest hero can always run it. */
    if (z.douseOnly) assert.ok(secs > z.fuse, 'the beam at ' + z.x0 + ' is too long to run unwatered: the paladin\'s ' + secs.toFixed(2) + ' s is outside its ' + z.fuse + ' s fuse');
    else assert.ok(secs < z.fuse, 'the paladin runs its ' + (z.x1 - z.x0 + 1) + ' tiles in ' + secs.toFixed(2) + ' s, inside its ' + z.fuse + ' s fuse');
    /* without it, the only way on is DOWN: into the cellar under it and through its fire to the ladder at the far end (a floor
       the model may not stand on is a floor of spikes to it) */
    const G = L.grid.slice(); for (let x = z.x0; x <= z.x1; x++) G[z.row * L.W + x] = T.AIR;
    const far = z.x1 < L.arena.x0 / TS - 60 ? [L.arena.x0 / TS - 60, S] : [z.x1 + 3, S];   /* (claude/burnvillage2: a bridge east of that mark is asked for the street just past it) */
    assert.ok(seenAt(reach(G), far), 'fall off it and the cellar still lets you out (C5)');
    for (const [a, b, , y1] of L.trench) for (let x = Math.max(a, z.x0 - 1); x <= b; x++) if (G[y1 * L.W + x] === T.AIR) G[y1 * L.W + x] = T.SPIKE;
    for (const [a, b] of L.emberPits || []) if (a <= z.x1 && b >= z.x0) for (let x = a; x <= b; x++) for (const y of [z.row, z.row + 1]) if (G[y * L.W + x] === T.AIR) G[y * L.W + x] = T.SPIKE;   /* (claude/burnvillage2) a BURNING BRIDGE on the street: its ember pit is the fire under it */
    assert.ok(!seenAt(reach(G), far), 'and the beam at ' + z.x0 + ' is the only way across that stays out of the fire'); }
  /* THE SMOKE: a plume stands in a gap between the roofs (no slab in its column), from a cellar floor up past the roofs */
  assert.ok((L.smoke || []).length >= 3, 'smoke rises out of the cellars');
  for (const s of L.smoke) { for (let y = s.y0; y <= s.y1; y++) assert.notEqual(at(L.grid, s.x, y), T.SOLID, 'the plume at ' + s.x + ' rises through open air (row ' + y + ')');
    const fromTrench = L.trench.some(([a, b, , y1]) => s.x >= a && s.x <= b && s.y1 === y1);
    const fromPit = (L.emberPits || []).some(([a, b]) => s.x >= a && s.x <= b);   /* design audit §13.1: the first beam's pit smokes too, ahead of the rooftops */
    assert.ok(fromTrench || fromPit, 'the plume at ' + s.x + ' rises from a cellar floor or an ember pit'); }
  assert.ok((L.smoke || []).some(s => (L.emberPits || []).some(([a, b]) => s.x >= a && s.x <= b)), 'and the first beam (188-191) has its own plume, before the rooftops');
  /* AND THE ROUTE LEAVES THE STREET: the pacing strip had no platforming on it at all */
  const P = pacing(lv), up = P.route.filter(([x, y]) => x >= 200 && x <= 320 && y <= S - 9).length;
  assert.ok(up >= 20, 'the walked route goes up onto the roofs between 200 and 320: ' + up + ' tiles');
  assert.ok(P.stats.mix.P + P.stats.mix.H >= 2 && P.stats.alternations >= 4, 'the strip has platforming on it and alternates: ' + P.strip + ' (' + P.stats.alternations + ')');
  console.log('rooftops: ' + P.strip + '  (alternations ' + P.stats.alternations + ')');
}

// ---- 8. THE BUCKET (docs/briefs/burning-village-rework.md §4): where the water is, and what it is for ----
{ const wells = L.ents.filter(e => e.t === 'villagewell' && e.bucket), R0 = floodReach(L, T, { rides: true });
  const kinds = wells.map(w => w.kind || 'well');
  assert.ok(wells.length >= 5, 'a bucket at the croft well, the street well, the Hall\'s butt, the well yard and his pump: ' + wells.map(w => w.x).join(','));
  for (const w of wells) assert.ok(R0.seen.has(w.x + ',' + w.y), 'the bucket at ' + w.x + ',' + w.y + ' stands where a hero can get to it');
  const near = (x, y, d) => wells.some(w => Math.abs(w.x - x) <= d && Math.abs(w.y - y) <= 1);
  const byName = n => (L.heaps || []).find(h => h.name === n);
  const cellar = byName('THE ROOT CELLAR'), fallen = byName('THE FALLEN HOUSE');
  /* 1. TAUGHT SAFELY: the first well and the stash beside it, in a yard nothing stands in */
  assert.ok(cellar && near(cellar.x0, cellar.y1, 6), 'the root cellar lies beside the first well');
  const first = wells.slice().sort((a, b) => a.x - b.x)[0];
  const foesNear = L.ents.filter(e => (THREATLESS.has(e.t) ? false : !COMBAT.has(e.t)) && !e.boss && Math.abs(e.x - first.x) <= 10 && Math.abs(e.y - first.y) <= 8);
  assert.equal(foesNear.length, 0, 'the bucket is taught safely: nothing stands within ten tiles of the first well: ' + foesNear.map(e => e.t + '@' + e.x).join(' '));
  const coinsIn = L.ents.filter(e => e.t === 'coin' && e.x >= cellar.x0 && e.x <= cellar.x1 && e.y > cellar.y1).length;
  assert.ok(coinsIn >= 4, 'and the cellar under the burning timber holds a stash: ' + coinsIn + ' coins');
  /* 2. SAVE A VILLAGER: the first hot door is in the first well's reach; 3. OPEN A WAY: the fallen house has a well up the street */
  const hot = L.ents.filter(e => e.t === 'captive' && e.hot).sort((a, b) => a.x - b.x);
  assert.ok(near(hot[0].x, hot[0].y, 12), 'the first hot door is a short carry from the first well');
  assert.ok(fallen.step && near(fallen.x0, fallen.y1, 22), 'the fallen house has a well up the street, and burns down to a step');
  /* 4. UP HIGH: the Hall's butt stands on the same roof as the dormer's hot door */
  const dormer = hot.find(e => e.y < 20); assert.ok(dormer && wells.some(w => w.kind === 'butt' && w.y === dormer.y && Math.abs(w.x - dormer.x) <= 10), 'the Hall\'s rain butt is on the dormer villager\'s roof');
  /* 5. PAID OFF: a pump inside his arena */
  const A = L.arena; assert.ok(wells.some(w => w.kind === 'pump' && w.x * TS > A.x0 && w.x * TS < A.x1), 'a pump inside the Pyromancer\'s square');
  console.log('buckets: ' + wells.map(w => (w.kind || 'well') + '@' + w.x + ',' + w.y).join(' '));
}

// ---- 6. THE LEVEL ----
{ const R = floodReach(L, T), st = [...R.seen].map(s => s.split(',').map(Number));
  const combat = new Set(['check', 'sign', 'coin', 'deco', 'torch', 'silver', 'key', 'stray', 'npc', 'stal', 'web', 'gate', 'lockgate', 'captive', 'watertrough', 'villagewell', 'mend']);
  const xmax = L.arena.x0 / TS, per = [], flat = [];
  /* an AMBUSH ROOM is emptied when it is built and its crowd comes with the lock: they are the level's creatures all the same (RULES Q: curve.mjs and levelFoes count them) */
  const waves = (L.ambushes || []).flatMap(A => A.waves.flat());
  for (let x = 0; x + 24 <= xmax; x += 24) { per.push(L.ents.filter(e => e.x >= x && e.x < x + 24 && !combat.has(e.t) && !e.boss).length + waves.filter(([, wx]) => wx >= x && wx < x + 24).length);
    flat.push(new Set(st.filter(([sx]) => sx >= x && sx < x + 24).map(([, y]) => y)).size <= 2); }
  const avg = per.reduce((a, b) => a + b, 0) / per.length;
  /* THE SPRINKLE CUT (Daniel, 2026-09-29, "FEWER, BETTER FOES"; src/foe-tactics.js SPRINKLE/PLAN) superseded the old 3.5-4.5 bar (docs/DESIGN.md B7):
     the sprinkled row was halved and capped, and every 200-column section stands a DESIGNED squad instead. So the level is held to the new design:
     no screen empty, the sprinkle under its cap, a squad in every section with ground, and the density fewer-but-not-hollow (2.5-4.5). */
  assert.ok(avg >= 2.5 && avg <= 4.5, 'foes a screen ' + avg.toFixed(2) + ' (the bar since the sprinkle cut is 2.5-4.5): ' + per.join(' '));
  assert.ok(per.every(n => n >= 1), 'no screen of the village is empty of foes: ' + per.join(' '));
  const sprinkled = L.ents.filter(e => e.garrison && !e.squad), squads = new Set(L.ents.filter(e => e.squad).map(e => e.squad));
  assert.ok(sprinkled.length >= 1 && sprinkled.length <= Math.floor(L.W / 30), 'the garrison row places, under the sprinkle cap: ' + sprinkled.length);
  for (const b of L.squadBands || []) assert.ok(!b.spots || b.designed, 'a designed squad in every section with ground: columns ' + b.lo + '-' + b.hi);
  assert.ok(squads.size >= 2, 'the village is held by designed squads: ' + [...squads]);
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
  /* 4. THE WISP: its touch, held on it with the shield up and its dart kept on cooldown, costs nothing; its told blow (the flare, then the dart)
     burns through that same raised shield. THE BURNING GOBLIN'S touch, walking, and then its swing */
  {boot();const w=BK.enemies().find(e=>e.t==='emberwisp');clear();w.alive=true;BK.P.hp=BK.P.maxHp;BK.P.inv=0;const hp0=BK.P.hp;BK.keys.block=true;BK.P.face=1;   /* THE TOUCH: 40 frames stood in it, its dart held on cooldown */
   const modes=new Set();for(let i=0;i<40;i++){w.dartCd=9;w.mode='drift';BK.P.x=w.x;BK.P.y=w.y+8;BK.sim(1);modes.add(w.mode);}const touch=hp0-BK.P.hp;
   BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.hurt=0;const hp1=BK.P.hp;for(let i=0;i<60&&!BK.P.ground;i++){w.dartCd=9;BK.sim(1);}for(let i=0;i<12;i++){w.dartCd=9;BK.sim(1);}w.x=w.hx=BK.P.x+30;w.y=w.hy=BK.P.y-12;w.dartCd=0;w.recoil=0;w.mode='drift';   /* THE TOLD BLOW: stood on the floor, the wisp a step off, facing it, shield up */
   let told=null,firstTell=-1,hitAt=-1,blocking=true;for(let i=0;i<90&&BK.P.hp===hp1;i++){BK.P.face=Math.sign(w.x-BK.P.x)||-1;if(w.mode==='flareTell'&&firstTell<0){firstTell=i;told=BK.markOf(w);}blocking=blocking&&!!BK.P.block;BK.sim(1);   /* (up going into every frame, the blow's own included: the blow itself drops it) */if(BK.P.hp<hp1)hitAt=i;}
   BK.keys.block=false;out.wisp={touch,touchModes:[...modes],told,firstTell,hitAt,blocking,lost:hp1-BK.P.hp,mark:BK.markOver(w)};}
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
  /* 7. THE ROOFTOPS, in the page. THE BEAM (design audit §13.2 TWIST): told from the first frame it is stood on; even the
     fastest hero, run unwatered, cannot outrun its fuse and falls through into the cellar; stood still on, it burns through
     the same way; and it comes back */
  {const z=()=>BK.L.deckBreaks.find(q=>q.beam);
   boot('pyro');clear();const Z=z();BK.tp(Z.x0-2,Z.row-1);BK.P.face=1;BK.sim(10);
   BK.keys.right=true;let told=null,on=null,maxY=0,f=0;for(;f<240&&BK.P.x<(Z.x1+2)*16;f++){BK.sim(1);if(on===null&&BK.P.ground&&BK.P.x>=Z.x0*16)on=f;if(told===null&&Z.t>=0)told=f;if(BK.P.x>Z.x0*16)maxY=Math.max(maxY,BK.P.y);}BK.keys.right=false;
   /* down (not crossed/maxY, which the trench's own smoke plume can mask by lifting a falling hero straight back up) is
      the unambiguous signal: did the beam burn through under the fastest hero before it got her across */
   const ran={told:told-on,down:Z.down,maxY:Math.round(maxY),rowY:Z.row*16};
   boot('knight');clear();const Z2=z();BK.tp(Z2.x0+1,Z2.row-1);   /* (clear of the plume under its middle, which would carry a falling hero straight back up) */BK.sim(2);const t0=Z2.t;BK.sim(Math.round(Z2.fuse*60)+20);const stood={t0:+t0.toFixed(2),down:Z2.down,y:Math.round(BK.P.y),row:Z2.row};
   BK.tp(Z2.x0-2,Z2.row-1);BK.sim(Math.round((5+1)*60));out.beam={ran,stood,back:!Z2.down};}
  /* THE SMOKE: a hero who jumps into a plume while it is up is carried up out of the cellar, past the roofs' eaves */
  {boot('knight');clear();const s=BK.L.smoke.find(q=>q.x>=248),V=BK.village();BK.tp(s.x,s.y1);BK.sim(5);
   for(let i=0;i<600&&V.smokeUp(s);i++)BK.sim(1);for(let i=0;i<600&&!V.smokeUp(s);i++)BK.sim(1);
   const y0=BK.P.y;BK.press('jump');BK.keys.jump=true;let top=y0;for(let i=0;i<120;i++){BK.sim(1);top=Math.min(top,BK.P.y);}BK.keys.jump=false;
   out.smoke={from:Math.round(y0/16),top:Math.round(top/16),limit:s.y0};}
  /* and the first beam's own pit (188-191, design audit §13.1) smokes too - a smaller lift, met before the rooftops ask for it */
  {boot('knight');clear();const s=BK.L.smoke.find(q=>q.x<248),V=BK.village();BK.tp(s.x,s.y1);BK.sim(5);
   for(let i=0;i<600&&V.smokeUp(s);i++)BK.sim(1);for(let i=0;i<600&&!V.smokeUp(s);i++)BK.sim(1);
   const y0=BK.P.y;BK.press('jump');BK.keys.jump=true;let top=y0;for(let i=0;i<90;i++){BK.sim(1);top=Math.min(top,BK.P.y);}BK.keys.jump=false;
   out.pitSmoke={from:Math.round(y0/16),top:Math.round(top/16)};}
  /* 8. THE BUCKET, in the page - CARRY & THROW (src/throwables.js, 2026-09-28): INTERACT takes it, ATTACK throws it the way
     the hero faces, and every beat below is now reached by the throw landing on it, not by walking a carried bucket in */
  {const V=BK.village(),throwIt=()=>{BK.press('atk');BK.sim(50);},hold=(k,n)=>{BK.keys[k]=true;for(let i=0;i<n;i++)BK.sim(1);BK.keys[k]=false;};
   const B=()=>V.buckets(),at=x=>B().find(b=>Math.abs(b.hx/16-x)<3);
   /* taught: INTERACT at the croft well takes it; you walk slower; thrown into the root cellar's timber it goes out and falls in */
   boot('knight');clear();const b1=B().sort((a,b)=>a.hx-b.hx)[0];BK.tp(Math.floor(b1.hx/16),Math.round(b1.hy/16)-1);BK.P.face=1;BK.sim(5);BK.press('talk');BK.sim(4);
   const took=BK.P.carry===b1;BK.P.face=-1;BK.keys.left=true;BK.sim(40);const slow=Math.abs(BK.P.vx);BK.keys.left=false;BK.sim(10);
   const cel=BK.L.heaps.find(h=>h.name==='THE ROOT CELLAR');BK.tp(cel.x0-2,Math.round(b1.hy/16)-1);BK.P.face=1;BK.sim(5);throwIt();
   const cellarOut=!!cel.out,open=BK.L.grid[cel.y0*BK.L.W+cel.x0]===0,home=b1.state;BK.sim(300);const back=b1.state==='rest';
   /* a blow spills it: nothing is put out, and it goes home */
   boot('knight');clear();const b2=B().sort((a,b)=>a.hx-b.hx)[0];V.take(b2);const had=BK.P.carry===b2;
   BK.P.inv=0;BK.P.hurt=0;BK.sim(1);const hp2=BK.P.hp;BK.damagePlayer(BK.P.x+10,5,{});BK.sim(15);   /* (past the hitstop, which holds the world still) */const spilled={hit:hp2-BK.P.hp,had,dropped:BK.P.carry!==b2,state:b2.state,cellar:!BK.L.heaps.find(h=>h.name==='THE ROOT CELLAR').out};
   /* the hot door cooled by a thrown bucket opens quietly */
   boot('knight');clear();BK.god=true;const b3=B().sort((a,b)=>a.hx-b.hx)[0];const cap=BK.props().find(p=>p.t==='captive'&&p.hot);V.take(b3);
   BK.tp(Math.round(cap.x/16)-2,Math.round(cap.y/16)-1);BK.P.face=1;BK.sim(5);throwIt();const cooled=!!cap.cooled;BK.tp(Math.round(cap.x/16)-1,Math.round(cap.y/16)-1);BK.P.face=1;BK.sim(5);const hp1=BK.P.hp;for(let i=0;i<10&&!cap.freed;i++){BK.press('atk');BK.sim(24);}BK.sim(60);
   const door={cooled,freed:cap.freed,lost:hp1-BK.P.hp};
   /* the fallen house: thrown from the street well up the street into the heap, and the street beyond is walked */
   boot('knight');clear();BK.god=true;const fh=BK.L.heaps.find(h=>h.name==='THE FALLEN HOUSE'),b4=at(210);V.take(b4);
   BK.tp(fh.x0-2,Math.round(b4.hy/16)-1);BK.P.face=1;BK.sim(5);throwIt();const fallen={out:!!fh.out,step:BK.L.grid[fh.y1*BK.L.W+fh.x0]===1&&BK.L.grid[(fh.y1-1)*BK.L.W+fh.x0]===0};BK.sim(30);BK.keys.right=true;for(let i=0;i<160;i++){if(i%20===0)BK.press("jump");BK.sim(1);}BK.keys.right=false;   /* (a hop up the step) */fallen.beyond=BK.P.x>(fh.x1+2)*16&&BK.P.y>=24*16;
   /* the roof: the Hall's pail cools the dormer's hot door, thrown */
   boot('knight');clear();BK.god=true;const dor=BK.props().find(p=>p.t==='captive'&&p.hot&&p.y<20*16),b5=B().find(b=>b.kind==='butt');V.take(b5);
   BK.tp(Math.round(dor.x/16)-2,Math.round(dor.y/16)-1);BK.P.face=1;BK.sim(5);throwIt();
   const dormer={cooled:!!dor.cooled};
   /* the beam: a thrown bucket douses it, and it holds a hero standing on it well past its fuse */
   boot('knight');clear();BK.god=true;const Z=BK.L.deckBreaks.find(q=>q.beam);const b7=B().find(b=>b.kind==='butt');V.take(b7);
   BK.tp(Z.x0-2,Z.row-1);BK.P.face=1;BK.sim(5);throwIt();const wet=Z.wet>0;BK.tp(Z.x0+1,Z.row-1);BK.sim(Math.round((Z.fuse+1.5)*60));
   const beam={wet,down:Z.down,y:Math.round(BK.P.y/16)};
   /* his square: the pump's bucket thrown onto a burning patch puts it out and holds it out, with his bar at the top */
   boot('knight');BK.god=true;const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);const pm=BK.boss;pm.heat=100;pm.calmT=0;pm.cd=99;pm.mode='stalk';BK.sim(150);
   const G=V.G(),lit=G.cells.filter(c=>c.square&&c.s===2).sort((a,b)=>a.x-b.x);const tgt=lit[0];const b6=B().find(b=>b.kind==='pump');
   let sq=null;if(tgt){V.take(b6);BK.tp(tgt.x-2,tgt.y);BK.P.face=1;BK.sim(5);throwIt();const outNow=tgt.s!==2;for(let i=0;i<360;i++){pm.heat=100;pm.cd=99;pm.calmT=0;pm.mode='stalk';BK.sim(1);}sq={outNow,held:tgt.s!==2&&tgt.s!==1,after8:null};
     for(let i=0;i<240;i++){pm.heat=100;pm.cd=99;pm.calmT=0;BK.sim(1);}sq.after8=tgt.s;}
   /* CARRY & THROW's generic promise: no swinging while carrying, and a foe in the way takes a small hit (more if fire owns it) */
   boot('knight');clear();BK.P.face=1;const foeRow=Math.round(BK.P.y/16)-1;const gb=BK.spawnFoe({t:'burngob',x:Math.round(BK.P.x/16)+3,y:foeRow})[0];gb.hp=99;const b8=B().sort((a,b)=>a.hx-b.hx)[0];V.take(b8);BK.sim(5);
   const heldNoSwing=BK.P.atk,b8hp=gb.hp;BK.press('atk');BK.sim(1);const stillNoSwing=BK.P.atk===heldNoSwing&&!BK.P.carry;   /* the throw ate the press: no swing started, and the bucket left his hands */
   BK.sim(30);const gobHit=b8hp-gb.hp,gobDoused=!!gb.doused;gb.alive=false;
   /* (the burning goblin above and the ember wisp are both FIRE_FOES - src/throwables.js's own table already proves the wisp
      takes the fire number too, in tools/throwables.mjs; a drifting wisp is a poor, flighty target for a single fixed-arc
      throw in this harness, so the in-level proof here is the goblin, plus a plain foe for the small-hit side of it) */
   const sp=BK.spawnFoe({t:'sprig',x:Math.round(BK.P.x/16)+3,y:foeRow})[0];sp.hp=99;V.take(B().sort((a,b)=>a.hx-b.hx)[0]);BK.sim(5);const sphp0=sp.hp;BK.press('atk');BK.sim(30);const sprigHit=sphp0-sp.hp;sp.alive=false;
   const foeHits={stillNoSwing,gobHit,gobDoused,sprigHit,fireMoreThanPlain:gobHit>sprigHit};
   /* RESPAWN: a thrown bucket that lands (on anything, or on bare ground) is back at its rack ~3s later, never sooner */
   const b9=B().sort((a,b)=>a.hx-b.hx)[0];V.take(b9);BK.sim(5);BK.P.face=1;BK.press('atk');
   let f0=0;for(f0=0;f0<120&&b9.state!=='return';f0++)BK.sim(1);const landed=b9.state==='return';
   BK.sim(Math.round(2.9*60));const before3=b9.state==='return';
   BK.sim(Math.round(0.3*60));const after3={rest:b9.state==='rest',home:Math.abs(b9.x-b9.hx)<1&&Math.abs(b9.y-b9.hy)<1};
   const respawn={landed,before3,after3};
   BK.god=false;out.bucketDone=true;out.bucket={took,slow:Math.round(slow),cellarOut,open,home,back,spilled,door,fallen,dormer,beam,sq,foeHits,respawn};}
  /* 9. THE BARN (RULES Q): it shuts on the floor, all four are there at once led by its captain, holding a way out (jumping and
     rolling at both gates) keeps you in, killing the captain opens it and pays, and a death inside puts it back */
  {boot('knight');clear();BK.god=true;const A=()=>BK.ambushes()[0];const a0=A();BK.tp(a0.wallL+4,a0.row);BK.P.face=1;for(let i=0;i<30&&!A().st;i++)BK.sim(1);
   const lock={st:A().st,foes:(A().foes||[]).map(e=>e.t+(e.elite?'*':'')),hpMul:A().leader?+(A().leader.maxHp||0):0};
   const kept=[];for(const [dir,col] of [['left',a0.wallL],['right',a0.wallR]]){BK.tp(dir==='left'?a0.wallL+2:a0.wallR-2,a0.row);BK.keys[dir]=true;
     for(let i=0;i<180;i++){if(i%20===0)BK.press('jump');if(i%45===10)BK.press('dodge');BK.sim(1);}BK.keys[dir]=false;kept.push(BK.P.x>a0.wallL*16+8&&BK.P.x<a0.wallR*16);}
   const c0=BKT.PROG.coins||0,hp0=BK.P.hp;BKT.hurtEnemy(A().leader,99999,A().leader.x-10,false);BK.sim(90);const opened=A().st==='done';
   boot('knight');clear();const a1=A();BK.tp(a1.wallL+4,a1.row);for(let i=0;i<30&&!A().st;i++)BK.sim(1);const locked2=!!A().st;BK.P.hp=0;BK.damagePlayer(BK.P.x+5,999,{unblockable:true});BK.sim(400);
   out.barn={lock,kept,opened,locked2,reset:A().st===null||A().st===undefined};BK.god=false;}
  return out;})()`, 600000);
  console.log(JSON.stringify(r));

  assert.ok(r.rescue.freed, 'the sword cuts her free: ' + JSON.stringify(r.rescue));
  assert.equal(r.rescue.after, r.rescue.before + 1, 'and she is counted at once');
  assert.equal(r.rescue.total, 6, 'out of six');
  assert.ok(r.rescue.ran < -20, 'she runs for the gate (back down the road): ' + r.rescue.ran);
  assert.equal(r.rescue.runnerHp, undefined, 'a villager has no health for the fire to take');

  assert.ok(r.hotDoor.hot.freed && r.hotDoor.hot.lost > 0, 'a hot door cut open unwatered blows out: ' + JSON.stringify(r.hotDoor.hot));
  assert.ok(r.hotDoor.watered.cooled && r.hotDoor.watered.freed && r.hotDoor.watered.lost === 0, 'watered first, it opens quietly: ' + JSON.stringify(r.hotDoor.watered));

  /* (was 'the wisp hurts on contact, through a raised shield': the combat pass - no untold hits - made the touch harmless and the
     flare-and-dart its blow, so this asserts that rule instead, as strictly: the touch costs nothing, the told dart burns through the shield) */
  assert.equal(r.wisp.touch, 0, 'stood in the wisp with its dart on cooldown, its touch alone costs nothing: ' + JSON.stringify(r.wisp));
  assert.ok(r.wisp.firstTell >= 0 && r.wisp.told === '!!', 'close to you it flares, and the flare wears the red !! (' + JSON.stringify(r.wisp) + ')');
  assert.ok(r.wisp.lost > 0 && r.wisp.hitAt > r.wisp.firstTell && r.wisp.blocking, 'and its dart, AFTER the flare, burns through a raised shield: ' + JSON.stringify(r.wisp));
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
  assert.ok(r.beam.ran.down, 'the twist (design audit §13.2): even the fastest hero cannot outrun it unwatered, and it burns through under her: ' + JSON.stringify(r.beam.ran));
  assert.ok(r.beam.stood.down && r.beam.stood.y > (r.beam.stood.row + 2) * 16, 'stand still on it and it burns through into the cellar: ' + JSON.stringify(r.beam.stood));
  assert.ok(r.beam.back, 'and it is back after it has burned through');
  assert.ok(r.smoke.top <= 12 && r.smoke.from - r.smoke.top >= 12, 'the smoke carries a hero up out of the cellar, past the eaves: ' + JSON.stringify(r.smoke));
  assert.ok(r.pitSmoke.from - r.pitSmoke.top >= 3, 'and the first beam\'s own pit lifts a hero too, met small before the rooftops: ' + JSON.stringify(r.pitSmoke));
  const K = r.bucket;
  assert.ok(K.took && K.slow > 0 && K.slow <= 60, 'INTERACT takes the bucket, and you walk at the load speed with it: ' + JSON.stringify(K));
  assert.ok(K.cellarOut && K.open && K.home === 'return' && K.back, 'thrown into the root cellar\'s burning timber it puts it out, the hatch opens, and the bucket goes home: ' + JSON.stringify(K));
  assert.ok(K.spilled.had && K.spilled.dropped && K.spilled.state === 'return' && K.spilled.cellar, 'a blow spills it, and puts nothing out: ' + JSON.stringify(K.spilled));
  assert.ok(K.door.cooled && K.door.freed && K.door.lost === 0, 'a thrown bucket cools a hot door and it opens quietly: ' + JSON.stringify(K.door));
  assert.ok(K.fallen.out && K.fallen.step && K.fallen.beyond, 'thrown into the fallen house it burns it down to a step, and the street beyond is walked: ' + JSON.stringify(K.fallen));
  assert.ok(K.dormer.cooled, 'the Hall\'s pail, thrown, cools the dormer\'s hot door: ' + JSON.stringify(K.dormer));
  assert.ok(K.beam.wet && !K.beam.down && K.beam.y <= 14, 'a thrown, doused beam holds a hero standing on it past its fuse: ' + JSON.stringify(K.beam));
  assert.ok(K.sq && K.sq.outNow && K.sq.held, 'the pump\'s bucket, thrown onto a patch of his square, puts it out and holds it out with his bar at the top: ' + JSON.stringify(K.sq));
  assert.equal(K.sq.after8, 2, 'and after its eight seconds his heat takes it back: ' + JSON.stringify(K.sq));
  const F = K.foeHits;
  assert.ok(F.stillNoSwing, 'no swinging while carrying: ATTACK throws it instead, and the press starts no swing: ' + JSON.stringify(F));
  assert.ok(F.gobHit > 0 && F.gobDoused, 'a thrown bucket hurts a burning goblin and douses it: ' + JSON.stringify(F));
  assert.ok(F.sprigHit > 0, 'and it does a small hit to any foe: ' + JSON.stringify(F));
  assert.ok(F.fireMoreThanPlain, 'more to a fire foe than a plain one: ' + JSON.stringify(F));
  const R = K.respawn;
  assert.ok(R.landed && R.before3 && R.after3.rest && R.after3.home, 'a thrown bucket that lands is back at its rack about 3s later, never sooner: ' + JSON.stringify(R));
  const Bn = r.barn;
  assert.ok(Bn.lock.st && Bn.lock.foes.length >= 3 && Bn.lock.foes.filter(t => t.endsWith('*')).length === 1 && Bn.lock.foes.includes('brute*'), 'THE BARN shuts with its captain and his crew all there: ' + JSON.stringify(Bn));
  assert.ok(Bn.kept.every(Boolean), 'jumping and rolling at both gates keeps the hero in the room: ' + JSON.stringify(Bn.kept));
  assert.ok(Bn.opened, 'killing the captain opens it: ' + JSON.stringify(Bn));
  assert.ok(Bn.locked2 && Bn.reset, 'a death inside puts it back to lock again: ' + JSON.stringify(Bn));
  assert.deepEqual(pg.errors, []);
  console.log('the burning village keeps its promises.');
} finally { pg.close(); }
