/* tools/underwell.mjs - THE UNDERWELL's own check (claude/underwell, the greybox; src/underwell.js, src/underwell-hands.js, docs/concepts/the-underwell.md).
   NODE (no page): the level as built - its oil lies on floors, every torch hangs over oil, every nest seals a doorway (rock over it: no way over) with oil
   against it, the cast (scorpions and sandworms in their elements: no skin over ~35%, three roles, a ranged spitter), the four new skins baked, carded,
   corpsed and named, the hint lines routed, the route list (glint + nudge) resolvable with lines that fit.
   PAGE (PORT=<yours> node tools/underwell.mjs): THE RULE does what its line says - a struck torch lights the oil and the fire runs; the nest burns away;
   standing in it hurts; a pour puts it out; WET OIL WILL NOT CATCH (the firebreak saves the rope and the drip; without it they burn, and a respawn hangs
   the rope again); THE GREAT LAMP comes down and the hall burns; THE BROOD WILL NOT CROSS FIRE; THE HEAT DRIVES A WORM UNDER; the oil scorpion's slick,
   the fire scorpion's patch lighting the oil, the dust's grit, the thirsty one's sip, the spitter's venom; THE DRY FOUNTAIN runs on three taps (its vault
   opens, it is a spring); a stall in front of a route need says its nudge.
     node tools/underwell.mjs            both       node tools/underwell.mjs --static   Node only */
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
install();
const { LEVELS, T } = await import('../src/level.js');
const { UNDERWELL, ARCS, SECTIONS } = await import('../src/underwell.js');
const { OIL } = await import('../src/underwell-hands.js');
const { STUCK_HANDS } = await import('../src/stuck-spots.js');
const { NUDGE_MAX, resolve } = await import('../src/stuck-guide.js');
const { CALL_LINES, isCallout } = await import('../src/hint-lines.js');
const ART = await import('../src/redraw/underwell_art.js');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const hands = readFileSync(new URL('../src/underwell-hands.js', import.meta.url), 'utf8');

let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const lv = LEVELS.find(l => l.id === 'underwell'), L = lv.build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const standable = t => t === T.SOLID || t === T.ONEWAY;

/* ---------- THE LEVEL ---------- */
ok(lv.needs === 'welltown' && LEVELS.find(l => l.id === 'redgorge').needs === 'underwell', 'on the road: THE WELL TOWN > THE UNDERWELL > THE RED GORGE');
ok(/STRIKE A TORCH AND THE OIL BURNS/.test(lv.rule) && /BROOD WON'T CROSS FIRE/.test(lv.rule) && /POUR WATER WHERE THE FIRE MUST NOT GO/.test(lv.rule) && !/ONLY WATER/.test(lv.rule), 'its rule line says both verbs as the code has them (a torch lights the oil, it burns out by itself; a pour is a firebreak): "' + lv.rule + '"');
ok(L.underwell && L.skinRule && L.W === UNDERWELL.W && SECTIONS.length === 6, 'built: ' + L.W + 'x' + L.H + ', ' + SECTIONS.length + ' sections, the skin rule on');
ok(Object.values(ARCS).every(a => Object.keys(a).length >= 2) && Object.keys(ARCS.light).length >= 4, 'each verb has an arc (light: ' + Object.keys(ARCS.light).join(' > ') + ')');
/* the oil lies on floors */
const cells = []; for (const [x0, x1, y] of L.seeps) for (let x = x0; x <= x1; x++) cells.push([x, y]);
const piped = (x, y) => L.lines.some(([lx, a, b]) => lx === x && y + 1 >= a && y + 1 <= b);   /* (a gutter's end over its pipe) */
const floating = cells.filter(([x, y]) => !((at(x, y) === T.AIR || at(x, y) === T.NET) && standable(at(x, y + 1))) && !(at(x, y + 1) === T.SOLID && at(x, y - 1) === T.SOLID) && !piped(x, y) && !L.nests.some(m => x >= m.x0 && x <= m.x1 && y >= m.y0 && y <= m.y1));   /* (a gutter cell: rock over and under; a rope's foot; under a nest, the oil it is soaked in) */
ok(cells.length > 300 && floating.length === 0, cells.length + ' cells of oil, every one on a floor or in a gutter' + (floating.length ? ' - off: ' + JSON.stringify(floating.slice(0, 6)) : ''));
const has = (x, y) => cells.some(c => c[0] === x && c[1] === y) || L.lines.some(([lx, a, b]) => lx === x && y >= a && y <= b);
/* every torch over oil */
const sconces = L.ents.filter(e => e.t === 'sconce');
const hung = sconces.map(s => { for (let y = s.y; y < s.y + 5; y++) if (has(s.x, y)) return y - s.y; return -1; });
ok(sconces.length === 7 && hung.every(d => d >= 1 && d <= 4), sconces.length + ' wall torches, each one to four rows over oil (' + hung.join(',') + ')');
/* every nest seals a doorway */
const nestOk = L.nests.map(m => { const sealed = [...Array(m.x1 - m.x0 + 1)].every((_, i) => at(m.x0 + i, m.y0 - 1) === T.SOLID) && at(m.x0, m.y1 + 1) === T.SOLID;
  const oil = [...Array(m.y1 - m.y0 + 2)].some((_, i) => has(m.x0 - 1, m.y0 + i) || has(m.x1 + 1, m.y0 + i)); return sealed && oil && m.y1 - m.y0 >= 4; });
ok(L.nests.length === 4 && nestOk.every(Boolean), 'four brood nests (the shaft, the hall, the works, the exam), each five rows in a doorway with rock over it (no way over) and oil against it (' + nestOk.join(',') + ')');
ok(L.ropes.length === 2 && L.ropes.every(r => has(r.x, r.y1)), 'the oil works\' rope and the exam\'s stand in the oil (the firebreak\'s reason, twice)');
/* THE REQUIRED REMIXES (fix pass): the works' nest is fed only by the pipe from the torch's floor; the exam's nest seals floor A; the exam's spring is past it */
{ const wn = L.nests.find(m => m.id === 'works'), en = L.nests.find(m => m.id === 'exam'), wt = sconces.find(s => s.id === 'works'), rope = L.ropes.find(r => r.id === 'exam');
  const springs = L.ents.filter(e => e.t === 'skinwell' && e.spring).map(e => e.x), fires = L.ents.filter(e => e.t === 'oilfire' && e.x > 400 && e.x < 440).map(e => e.x), drips = L.ents.filter(e => e.t === 'skinwell' && e.drip);
  ok(wn && wn.y1 === 29 && L.lines.some(([x, a, b]) => x === 216 && a === 30 && b >= 42) && wt.x > 160, 'THE WORKS\' NEST (upper works) is fed by the old pipe from the torch\'s floor, and the torch is past the rope: pour first');
  ok(en && rope && rope.x < 364 && springs.some(x => x > en.x1 && x < 410) && fires.length === 2 && drips.some(d => d.x > 410 && d.x < 420), 'THE EXAM: the rope up is west of the torch (firebreak), the spring past the nest, a drip after the thirsty one before two old fires (water guaranteed)');
  ok(L.queenOil && L.queenOil.W && L.queenOil.E && sconces.filter(s => s.x >= 452 && s.x <= 491).length === 2, 'THE QUEEN\'S HALL has lamp oil streaked down both walls and two wall torches over floor oil (LIGHT in her fight)');
  const sump = L.ents.filter(e => e.t === 'sandworm' && e.x >= 262 && e.x <= 335).length;
  ok(sump === 5 && !L.grid.slice(44 * L.W + 262, 44 * L.W + 336).some(t => t === T.SOLID), 'THE SUMP: five sandworms share the floor, no mound to rest on (the burning gutter is the answer)'); }
/* the cast */
const foes = L.ents.filter(e => ['scorpion', 'slinger', 'sandworm'].includes(e.t)), kind = e => e.cnSkin || (e.elite ? 'elite' : e.t);
const count = {}; for (const e of foes) count[kind(e)] = (count[kind(e)] || 0) + 1;
const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
ok(foes.length === L.ents.filter(e => e.squad || e.elite).length, 'every foe is a scorpion, a spitter or a sandworm (Daniel 10-05: scorpions and sandworms, in elements): ' + JSON.stringify(count));
ok(top[1] / foes.length <= 0.36, 'no one kind over ~35%: ' + top[0] + ' ' + Math.round(100 * top[1] / foes.length) + '%');
ok(['oilscorpion', 'dustscorpion', 'thirstscorpion', 'spitscorpion', 'firescorpion', 'venomscorpion', 'sandworm'].every(k => count[k] >= 2) && count.elite === 1, 'all seven: oil, dust, thirsty, spitting, fire, venom scorpions and the sandworm, two or more each, and THE OLD STINGER');
ok(L.ents.filter(e => e.cnSkin === 'spitscorpion').every(e => e.t === 'slinger'), 'the spitting scorpion runs the slinger\'s machine (the reskinned ranged foe)');
/* the four new skins */
{ const base = (await import('../src/redraw/desert_foes.js')).bakeScorpion(); const sets = { oil: ART.bakeOilScorpion(base), dust: ART.bakeDustScorpion(base), thirst: ART.bakeThirstScorpion(base), spit: ART.bakeSpitScorpion(base) };
  ok(Object.values(sets).every(s => s.R.length === 7 && s.L.length === 7), 'the four skins bake seven frames each (the spitter in the slinger\'s order: ' + ART.SPIT_ORDER.join(',') + ')');
  const px = c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const diff = (a, b) => { const p = px(a), q = px(b); let n = 0; for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 60) n++; return n; };
  const ks = Object.keys(sets); let apart = true; for (let i = 0; i < ks.length; i++) { if (diff(sets[ks[i]].R[0], base.R[0]) < 40) apart = false; for (let j = i + 1; j < 3; j++) if (diff(sets[ks[i]].R[0], sets[ks[j]].R[0]) < 40) apart = false; }
  ok(apart, 'they read apart from the desert scorpion and from each other'); }
for (const k of ['oilscorpion', 'dustscorpion', 'thirstscorpion', 'spitscorpion']) ok(new RegExp("\\{ t: '" + k + "', name: 'THE [A-Z ]+'").test(main) && new RegExp(k + ': 6').test(main.slice(main.indexOf('const DF2_CORPSE'), main.indexOf('const DF2_CORPSE') + 600)) && new RegExp('SPR\\.' + k + ' = ').test(main), k + ': a bestiary card (its name), a corpse in its own skin, its sprite');
/* the lines */
const lines = [...hands.matchAll(/ctx\.number\([^']*'([A-Z][^']+)'/g)].map(m => m[1]);
ok(lines.length >= 18 && lines.every(t => CALL_LINES.has(t)), lines.length + ' teaching lines in the hands, every one routed to the hint box' + (lines.filter(t => !CALL_LINES.has(t)).length ? ': not ' + lines.filter(t => !CALL_LINES.has(t)).join(' | ') : ''));
/* the route list */
const spots = STUCK_HANDS.underwell;
const lineFit = spots.flatMap(sp => sp.steps).every(s => s.line.length <= NUDGE_MAX && isCallout(s.line));
ok(spots.length >= 9 && lineFit, spots.length + ' route needs glint and nudge (every line <= ' + NUDGE_MAX + ' and routed)');
{ const env = { TS: 16, props: [], movers: [], hero: { x: 0, y: 0 }, state: n => ({ 'nest.shaft': 'shut', 'skin': 'some', 'fire.33': 'lit' })[n] || '' };
  const r = resolve('underwell', 16, 43, { ...env, hero: { x: 16 * 16 + 8, y: 44 * 16 } }, STUCK_HANDS); const r2 = resolve('underwell', 30, 43, { ...env, hero: { x: 30 * 16 + 8, y: 44 * 16 } }, STUCK_HANDS);
  ok(r && r.key === 'shaftTorch' && r2 && r2.key === 'shaftFire', 'the route list resolves: at the first nest the torch glints, at the old oil fire the fire (' + (r && r.key) + ', ' + (r2 && r2.key) + ')'); }
ok(OIL.burn >= 5 && OIL.burnDeep > OIL.burn && OIL.back > OIL.burnDeep && OIL.relight < OIL.back, 'nothing is lost for good: spent oil seeps back (' + OIL.back + ' s), a torch has a flame again (' + OIL.relight + ' s)');

/* ---------- THE PAGE ---------- */
if (!process.argv.includes('--static')) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    await pg.evalp('(()=>{setTimeout(()=>location.assign("/?nosw"),0);return 1})()', 8000).catch(() => {});
    for (let i = 0; i < 200; i++) { await new Promise(r => setTimeout(r, 150)); if (await pg.evalp('typeof BK==="object"&&!!BK.load', 4000).catch(() => false)) break; }
    const LOAD = `const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='underwell'));BK.state='play';BK.sim(10);
      const P=BK.P,UH=()=>BK.underwellHands(),R=()=>UH().read(),cell=(x,y)=>BK.underwell().list.find(c=>c.x===x&&c.y===y);`;
    const w = await pg.evalp(`(async()=>{${LOAD} const out={};
      /* 1. THE FIRST LESSON: strike the torch; the oil catches and the fire runs; the nest burns away; standing in it hurts (god off, health topped) */
      BK.god=false; P.hp=P.maxHp=999; BK.tp(16,43); P.face=1; BK.sim(5); BK.press('atk'); BK.sim(80);
      out.lit=R().n.lit; out.run=R().cells.fire; BK.tp(19,43); BK.sim(60); out.hurt=999-P.hp; BK.sim(120); out.nest=R().nests.find(n=>n.id==='shaft').open; out.tile=BK.tileAt?null:0;
      /* 2. A POUR: on the burning oil it goes out */
      P.skin={sips:3,max:3}; BK.tp(18,43); P.face=1; BK.sim(2); const c0=cell(19,43)||cell(20,43); const was=c0&&c0.st; BK.press('talk'); BK.sim(3); out.poured={was, now:c0&&c0.st, sips:P.skin.sips};
      /* 3. THE OLD OIL FIRE goes out on a pour */
      P.skin={sips:1,max:3}; BK.tp(31,43); P.face=1; BK.sim(3); BK.press('talk'); BK.sim(3); out.oldFire=BK.welltown().fires.find(f=>f.x0===33).lit;
      /* 4. the burnt oil seeps back */
      for(let i=0;i<OILBACK;i++)BK.sim(100); out.back=cell(18,43).st;
      return out;})()`.replace('OILBACK', String(Math.ceil(OIL.burnDeep + OIL.back + 2))), 300000);
    ok(w.lit === 1 && w.run >= 4, 'A STRUCK TORCH falls into the oil and the fire runs along it (' + w.run + ' cells burning)');
    ok(w.hurt > 0, 'standing in burning oil hurts (' + w.hurt + ')');
    ok(w.nest === true, 'the fire takes the brood\'s nest: the tunnel is open');
    ok(w.poured.now === 'wet' && w.poured.sips === 2, 'a pour on burning oil puts it out (' + w.poured.was + ' -> ' + w.poured.now + ', a sip spent)');
    ok(w.oldFire === false, 'a pour puts THE OLD OIL FIRE out (the Well Town\'s barricade, carried down)');
    ok(w.back === 'oil', 'burnt and wet oil seeps back in time (nothing is lost for good)');
    /* THE FIREBREAK: with it, the rope and the drip live; without it, they burn; a respawn hangs the rope again */
    const fb = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={}; for(const e of BK.enemies())e.alive=false;
      P.skin={sips:3,max:3}; BK.tp(172,43); P.face=-1; BK.sim(3); BK.press('talk'); BK.sim(3); out.wet=R().cells.wet; BK.tp(174,43); P.face=1; BK.sim(3); BK.press('atk'); BK.sim(400);
      out.worksNest=R().nests.find(n=>n.id==='works').open; out.with={rope:R().ropes[0].burnt, drip:BK.welltown().wells.find(w=>w.drip&&Math.floor(w.x/16)===152).left, chamber:cell(205,43)&&cell(205,43).st};
      return out;})()`, 300000);
    const nb = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={}; for(const e of BK.enemies())e.alive=false;
      BK.tp(174,43); P.face=1; BK.sim(3); BK.press('atk'); BK.sim(400); out.rope=R().ropes[0].burnt; out.ropeTile=BK.tileAt?BK.tileAt(160,40):null; out.drip=BK.welltown().wells.find(w=>w.drip&&Math.floor(w.x/16)===152).left;
      BK.god=false; P.hp=1; BK.tp(170,43); for(let i=0;i<60*6&&!P.dead;i++){ P.hp=Math.min(P.hp,1); BK.sim(1);} for(let i=0;i<60*8;i++)BK.sim(1); out.after=R().ropes[0].burnt;
      return out;})()`, 300000);
    ok(fb.worksNest === true, 'THE WORKS\' NEST burns: the torch\'s fire runs east and up the old pipe to it (the required remix)');
    ok(fb.wet === 3 && fb.with.rope === false && fb.with.drip === 1, 'WET OIL WILL NOT CATCH: a pour by the rope, then the torch - the rope and the drip live (' + JSON.stringify(fb.with) + ')');
    ok(nb.rope === true && nb.drip === 0, 'without the firebreak the fire burns the rope to ash and boils the drip dry');
    ok(nb.after === false, 'a respawn hangs the rope again (no softlock; the back scaffolds are there too)');
    /* THE EXAM (fix pass): firebreak at the rope's foot, the torch: the nest and the gutter burn, the worm goes under, the nest room's brood burn; the rope lives.
       Without the firebreak the rope is ash - and a spare comes down after OIL.rehang s */
    const ex = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={}; for(const e of BK.enemies()) if(!(e.x>393*16&&e.x<406*16)&&e.t!=='sandworm') e.alive=false;
      const room=BK.enemies().filter(e=>e.alive&&e.t!=='sandworm'); P.skin={sips:3,max:3}; BK.tp(354,42); P.face=1; BK.sim(3); BK.press('talk'); BK.sim(3); out.wet=[354,355,356].map(x=>cell(x,42)&&cell(x,42).st);
      BK.tp(362,42); P.face=1; BK.sim(3); BK.press('atk'); let deep=0; for(let i=0;i<500;i++){ BK.sim(1); const w=BK.enemies().find(e=>e.t==='sandworm'&&e.x>371*16&&e.x<393*16); if(w&&w.st&&(w.st.mode==='deep'||w.st.mode==='burrow'))deep++; }
      out.nest=R().nests.find(n=>n.id==='exam').open; out.rope=R().ropes.find(r=>r.id==='exam').burnt; out.deep=deep; out.roomDead=room.filter(e=>!e.alive).length; out.room=room.length;
      return out;})()`, 300000);
    const ex2 = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={}; for(const e of BK.enemies())e.alive=false;
      BK.tp(362,42); P.face=1; BK.sim(3); BK.press('atk'); BK.sim(300); out.burnt=R().ropes.find(r=>r.id==='exam').burnt; BK.tp(352,42);
      for(let i=0;i<3200&&R().ropes.find(r=>r.id==='exam').burnt;i++)BK.sim(1); out.back=!R().ropes.find(r=>r.id==='exam').burnt; out.line=R().lastNudge;
      return out;})()`, 300000);
    ok(ex.wet.every(s => s === 'wet') && ex.nest && ex.rope === false, 'THE EXAM: a pour at the rope\'s foot, then the torch - the nest burns and the rope lives (' + JSON.stringify(ex) + ')');
    ok(ex.deep > 60 && ex.roomDead >= 2, 'the same strike sets the gutter burning (its worm under ' + (ex.deep / 100).toFixed(1) + ' s) and the nest room\'s brood burn (' + ex.roomDead + ' of ' + ex.room + ')');
    ok(ex2.burnt === true && ex2.back === true, 'without the firebreak the exam\'s rope is ash, and a spare comes down (no softlock, a cost)');
    /* THE QUEEN'S WARD (B3, fix pass): after an opening ends she is warded, told - a pour finds nothing, the stinger takes nothing */
    const wd = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={}; const A=BK.L.arena; BK.tp(Math.round(A.trigger/16)+2,Math.round(A.floor/16)-1); BK.sim(200);
      const b=BK.enemies().find(e=>e.t==='cisternqueen'); const S=BK.cisternQueenHands().show(); if(!b||!S) return {none:true};
      b.mode='soaked'; b.open=0.05; b.modeT=0.1; for(let i=0;i<30&&!(S.ward>0);i++)BK.sim(1); out.ward=+(S.ward||0).toFixed(2);
      const Qm=await import('/src/cistern-queen.js'); S.pose='burrow'; S.mound={x:b.x}; b.mode='burrow'; out.aim=Qm.pourAim(b,S,{x:b.x-30,y:S.G.floor,face:1,onLedge:null}); S.stinger={x:b.x,y:S.G.floor-6,t:1}; const h0=b.hp; out.take=BK.cisternQueenHands().take(b,40);
      return out;})()`, 300000);
    ok(wd.ward > 2.5 && wd.aim === null && wd.take === 0, 'THE QUEEN\'S WARD: after an opening, ' + wd.ward + ' s when a pour finds nothing and a blade (the stinger too) takes nothing');
    /* THE GREAT LAMP and THE BROOD */
    const lp = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={};
      const br=BK.enemies().filter(e=>e.cnSkin==='venomscorpion'&&e.x>118*16&&e.x<132*16); out.brood=br.length;
      BK.tp(85,31); P.face=1; BK.sim(5); BK.press('atk'); BK.sim(400); out.lamp=R().lamp; out.fire=R().cells.fire; out.hallNest=R().nests.find(n=>n.id==='hall').open;
      BK.sim(400); out.dead=br.filter(e=>!e.alive).length;
      /* the brood will not cross fire: a lone one walking at a burning cell stops and turns */
      const vs=BK.enemies().find(e=>e.alive&&e.cnSkin==='venomscorpion'&&e.x>195*16&&e.x<210*16&&e.y>40*16); out.fear=null;
      if(vs){ for(const e of BK.enemies()) if(e!==vs) e.alive=false; const fx=Math.floor(vs.x/16)-3; for(let x=fx-2;x<=fx;x++){const c=cell(x,43); if(c){c.st='fire';c.t=60;c.age=0;}} BK.tp(fx-8,43); for(let i=0;i<400;i++){BK.sim(1); for(let x=fx-2;x<=fx;x++){const c=cell(x,43); if(c){c.st='fire';c.t=60;}}} out.fear={stood:Math.floor(vs.x/16)>fx, n:BK.underwell().said.fear?1:0}; }
      return out;})()`, 300000);
    ok(lp.lamp === 'down' && lp.fire > 20 && lp.hallNest, 'THE GREAT LAMP: its chain struck from the gallery, it comes down and the hall burns (' + lp.fire + ' cells) to the nest at its end');
    ok(lp.dead >= 3, 'the brood caught in it burn (' + lp.dead + ' of ' + lp.brood + ')');
    ok(lp.fear && lp.fear.stood && lp.fear.n, 'THE BROOD WILL NOT CROSS FIRE: a venom scorpion coming for you stops at it (told once)');
    /* THE WORMS and THE CAST */
    const cast = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={}; const spawn=(t,x,y,o)=>{const n0=BK.enemies().length;BK.spawnEnt(Object.assign({t,x,y,face:-1},o||{}));return BK.enemies()[n0];};
      const wA=BK.enemies().find(e=>e.t==='sandworm'&&e.x<285*16); BK.tp(255,45); P.face=1; BK.sim(5); BK.press('atk'); BK.sim(200); BK.tp(266,45); BK.sim(60); out.worm=wA.st.mode; out.flushed=R().n.flushed;
      for(const e of BK.enemies()) e.alive=false;
      /* the oil scorpion's death leaves a slick (on bare floor in the sump's stone rise) */
      const n0=BK.underwell().list.length; const o=spawn('scorpion',340,42,{cnSkin:'oilscorpion'}); BK.tp(337,42); BK.sim(5); BKT.hurtEnemy(o,999,o.x-10,false); BK.sim(5); out.slick=BK.underwell().list.length-n0;
      /* a fire scorpion's patch lights the oil */
      const f=spawn('scorpion',196,43,{cnSkin:'firescorpion'}); BK.tp(193,43); P.face=1; BK.god=false; P.hp=P.maxHp=999; for(let i=0;i<60*10&&!R().n.patchLit;i++){P.hp=999;P.x=f.x-26;BK.sim(1);} out.patchLit=R().n.patchLit; f.alive=false; BK.sim(2);
      /* the dust scorpion's claw: grit in your eyes */
      const d=spawn('scorpion',340,42,{cnSkin:'dustscorpion'}); BK.tp(338,42); for(let i=0;i<60*10&&!R().n.blinds;i++){P.hp=999;P.x=d.x-18;P.face=1;BK.sim(1);} out.blind=R().n.blinds; out.blindT=P.uwBlind; d.alive=false;
      /* the dust scorpion's cloud smothers the fire it stops at: a short burning run is eaten from its edge, the scorpion walks on (and a wet cell is no fire to eat) */
      { for(const e of BK.enemies()) e.alive=false; BK.god=true; const d2=spawn('scorpion',208,43,{cnSkin:'dustscorpion',face:-1}); const tx=Math.floor(d2.x/16)-5; const run=[]; for(let x=tx-3;x<=tx;x++){const c=cell(x,43); if(c)run.push(c);} out.runLen=run.length; BK.tp(tx-4,43); const fire=()=>{for(const c of run)if(c.st!=='spent'){c.st='fire';c.t=60;c.age=0;}}; fire(); const sm0=R().n.smothered, x0=d2.x; let crossed=false, ticks=0; for(let i=0;i<60*8;i++){ if(i<2)fire(); BK.sim(1); if(run.some(c=>c.st==='spent'))ticks++; if(d2.x<(tx-3)*16){crossed=true;break;} } out.smothered=R().n.smothered-sm0; out.crossed=crossed; out.spent=run.filter(c=>c.st==='spent').length; d2.alive=false; BK.sim(2); BK.god=false; P.hp=P.maxHp=999; }
      /* the thirsty scorpion comes for your skin from far, and a sting drinks a sip */
      P.skin={sips:3,max:3}; const th=spawn('scorpion',346,42,{cnSkin:'thirstscorpion'}); BK.tp(337,42); const x0=th.x; BK.sim(60); out.came=Math.round(x0-th.x); for(let i=0;i<60*12&&!R().n.drunk;i++){P.hp=999;BK.sim(1);} out.drunk=R().n.drunk; out.sips=P.skin.sips; th.alive=false;
      /* the spitter's glob puts venom in */
      P.cqVenom=[]; const sp=BK.enemies().find(e=>e.cnSkin==='spitscorpion'&&e.x<120*16); sp.alive=true; BK.tp(96,43); for(let i=0;i<60*14&&!R().n.spits;i++){P.hp=999;BK.sim(1);} out.spit=R().n.spits; out.venom=(P.cqVenom||[]).length;
      return out;})()`, 300000);
    ok(cast.worm === 'deep' || cast.worm === 'burrow', 'THE BURNING GUTTER: lit, the heat drives the sump\'s worm under (' + cast.worm + ', told ' + cast.flushed + ')');
    ok(cast.slick >= 2, 'an OIL SCORPION dies in a slick of oil (' + cast.slick + ' new cells)');
    ok(cast.patchLit >= 1, 'a FIRE SCORPION\'s burning patch lights the oil it lands in');
    ok(cast.blind >= 1 && cast.blindT > 0, 'a DUST SCORPION\'s claw that lands: grit in your eyes (blind ' + (cast.blindT || 0).toFixed(1) + ' s)');
    ok(cast.runLen >= 2 && cast.smothered >= 2 && cast.spent >= 2, 'a DUST SCORPION cloud SMOTHERS the fire it stops at (' + cast.smothered + ' cells of a ' + cast.runLen + '-cell run choked, spent ' + cast.spent + ')');
    ok(/smother/.test(hands) && CALL_LINES.has('ITS DUST SMOTHERS THE FIRE') && /smothers burning oil/.test(main), 'the twist is told (hint line, bestiary card) and drawn (the cloud about it)');
    ok(cast.came > 20 && cast.drunk >= 1 && cast.sips < 3, 'a THIRSTY SCORPION comes for your skin from far (' + cast.came + ' px in 0.6 s) and its sting drinks a sip');
    ok(cast.spit >= 1 && cast.venom >= 1, 'a SPITTING SCORPION\'s glob puts the Queen\'s venom in you');
    /* THE DRY FOUNTAIN and THE NUDGE */
    const ft = await pg.evalp(`(async()=>{${LOAD} BK.god=true; const out={}; for(const e of BK.enemies())e.alive=false;
      BK.tp(165,29); P.face=1; BK.sim(3); BK.press('talk'); BK.sim(3); out.before=R().fountain;
      for(const p of BK.props().filter(p=>p.t==='stray'&&p.kind==='tap')){BK.tp(Math.floor(p.x/16),Math.floor(p.y/16)-1);BK.sim(20);}
      BK.tp(165,29); BK.sim(3); BK.press('talk'); BK.sim(3); out.after=R().fountain; P.skin={sips:0,max:3}; BK.press('talk'); BK.sim(3); out.sips=P.skin.sips;
      BK.tp(152,29); for(let i=0;i<200;i++)BK.sim(1); out.silver=BK.silvers().filter(p=>Math.abs(p.x-152*16-8)<12).map(p=>p.got);
      /* a stall at the first nest: the glint, then the nudge after ten seconds */
      BK.load(LEVELS.findIndex(l=>l.id==='underwell')); BK.state='play'; BK.sim(5); for(const e of BK.enemies())e.alive=false; BK.tp(15,43); for(let i=0;i<1300;i++)BK.sim(1);   /* (a sim step is 10 ms: 13 s) */ out.glint=R().glint; out.nudge=R().lastNudge;
      return out;})()`, 300000);
    ok(ft.before === false && ft.after === true && ft.sips === 3, 'THE DRY FOUNTAIN wants three brass taps; fitted, it runs (a spring: a full skin)');
    ok(ft.silver.length === 1 && ft.silver[0], 'and its vault opens on a silver');
    ok(ft.glint === 'shaftTorch' && /TORCH/.test(ft.nudge || ''), 'a stall at the first nest: the torch glints and the nudge names it ("' + ft.nudge + '")');
    if (pg.errors.length) ok(false, 'the page threw: ' + pg.errors.slice(0, 2).map(String).join(' | '));
  } finally { await pg.close(); }
}
console.log(fails ? '\nunderwell: ' + fails + ' FAILED' : '\nok  underwell      the oil burns from a struck torch, a pour puts it out and wet oil will not catch; the nests, the lamp, the brood, the worms, the cast, the fountain and the glint all do what the rule says');
process.exit(fails ? 1 : 0);
