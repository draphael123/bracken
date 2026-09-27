/* tools/whelps.mjs — THE GARGOYLE WHELP and THE BATTLEMENTS (docs/briefs/witchlight-whelps.md; Daniel, 2026-09-26: "a section with
   small gargoyle enemies before the boss. It could last around a minute. Boss is good, but he should summon those minis rather than
   the demons."). It asks, in Node and then on the page:
     1. THE WHELP IS A CREATURE: its own sheet (perched, watching, crouch, swoop, two flying, landed, crumble, hurt), every frame inside
        its own canvas (E6); its health, its blow, its spawn, its bestiary row, its short name, its colours, its update and its frame
        in main.js; its own death voice and hurt voice (E9); a threat weight; its tell a yellow mark in the table the screen reads and a
        windup windingUp() hears (A2).
     2. THE BATTLEMENTS: a place of its own between the Hedge Warden's gate and the Gargoyle's lip, the arena moved right whole and
        unchanged; whelps placed where the footing is narrow (S1: one over the breach, a pair over the narrow ledge, one over the
        exam's slabs); jumps of 2.5-3 tiles over a fall (S2); a checkpoint 40+ tiles before the exam and one outside the lip, none
        inside it (S3/S4); every moat with a rope up its near wall and none up its far wall, so a fall costs the climb and skips nothing.
     3. THE GATE GARGOYLE calls whelps and no imps, at the same cap and cadence.
     4. ON THE PAGE: perched it is stone (a blow is a chip); seen, it crouches and screeches, then swoops; unguarded, the swoop hurts and
        SHOVES; guarded, it clangs off DAZED and costs nothing; landed it takes every blow; it flies home and hardens; broken it
        crumbles. The Gargoyle's shriek brings two or three whelps (never more than three up), and they crumble when he dies.
   Every assertion is SOFT and all are printed, so a run on the old code lists everything it did not do. */
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { markOf } from '../src/marks.js';
import { openPage } from './cdp.mjs';
install();
const fails = [], ok = (c, m) => { if (!c) fails.push(m); console.log((c ? '  ok   ' : '  FAIL ') + m); };
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const main = read('src/main.js'), audio = read('src/audio.js'), gg = read('src/gate-gargoyle.js'), threat = read('src/threat.js');
let WHF = null; try { WHF = await import('../src/gargoyle-whelp.js'); } catch (err) { ok(false, 'src/gargoyle-whelp.js loads: ' + err.message); }
// 1. a creature
if (WHF) { const S = WHF.bakeWhelp();
  ok(S.R.length >= 9 && Object.keys(WHF.WHELP_F).length >= 9, 'its own sheet, nine poses: ' + S.R.length);
  ok(WHF.WHELP_CLIPPED.length === 0, 'E6 at bake time: no pixel put off its grid: ' + WHF.WHELP_CLIPPED.slice(0, 4).join(' '));
  const edge = S.R.map((c, f) => { const d = c._d, W = c.width, H = c.height; let n = 0; for (let x = 0; x < W; x++) if (d[x * 4 + 3]) n++;
    for (let y = 0; y < H; y++) { if (d[(y * W) * 4 + 3]) n++; if (d[(y * W + W - 1) * 4 + 3]) n++; } return n ? f + ':' + n : null; }).filter(Boolean);
  ok(edge.length === 0, 'E6: no frame touches the top or the sides of its canvas: ' + (edge.join(' ') || 'none'));
  const fr = m => WHF.whelpFrame({ mode: m, anim: 0 }); ok(new Set(['perch', 'crouchTell', 'swoop', 'landed', 'home'].map(fr)).size === 5 && fr('crouchTell') === WHF.WHELP_F.crouch, 'a frame of its own for each thing it does');
  ok(WHF.whelpStone({ mode: 'perch' }) && WHF.whelpStone({ mode: 'crouchTell' }) && !WHF.whelpStone({ mode: 'landed' }) && WHF.whelpOpen({ mode: 'landed' }), 'stone on its perch, soft where it lands'); }
ok(/whelp: WHF\.WH\.hp/.test(main) && /whelpSwoop: WHF\.WH\.dmg\.swoop/.test(main), 'its health and its blow are in EHP and DMG');
ok(main.includes("case 'whelp': enemies.push(") && main.includes("SPR.whelp = WHF.bakeWhelp()"), 'it spawns, and its sheet is baked');
ok(/\{ t: 'whelp', name: 'GARGOYLE WHELP'/.test(main) && main.includes("whelp:'WHELP'") && /whelp: \['#/.test(main), 'a bestiary row, a short name, its colours');
ok(/if \(e\.t === 'whelp'\) \{ beastSeen\('whelp'\); updateWhelp\(e, dt\); continue; \}/.test(main) && main.includes("else if (e.t === 'whelp') frame = WHF.whelpFrame(e);"), 'its update and its frame are dispatched');
ok(main.includes("(e.t === 'whelp' && e.mode === 'crouchTell')") && markOf({ t: 'whelp', mode: 'crouchTell' }) === '!', 'A2: its crouch is a windup windingUp() hears, under a yellow mark (a shield turns it)');
ok(/\n {2}whelp\(\) \{/.test(audio.slice(audio.indexOf('const DIE = {'), audio.indexOf('const DIE = {') + 400)) && /\n {2}whelp\(\) \{/.test(audio.slice(audio.indexOf('const HURT = {'), audio.indexOf('const HURT = {') + 400)) && audio.includes('whelpScreech()'), 'E9: it dies in its own voice, hurts in its own, and screeches its tell');
ok(/\n {2}whelp: [0-9.]+,/.test(threat), 'it has a threat weight');
ok(main.includes("case 'whelp': c.frame = WHF.WHELP_F.crumble"), 'it crumbles, in its own pose');
// 2. the battlements
const I = LEVELS.findIndex(l => l.id === 'witchlight'), L = LEVELS[I].build(), WL = (await import('../src/witchlight.js')).WL;
const [b0, b1] = (L.places && L.places.battlements) || [0, -1];
ok(b1 - b0 >= 80 && b0 > WL.MINI.gate && b1 < WL.ARENA.x0, 'THE BATTLEMENTS: a place between the Warden\'s gate and the Gargoyle\'s lip, ' + (b1 - b0 + 1) + ' columns');
{ const A = WL.ARENA, old = { x0: 346, sl: [3, 11, 16, 24, 29, 37], lifts: [15, 28, 36] };
  ok(A.x1 - A.x0 === 44 && WL.SLABS.map(s => s[0] - A.x0).join() === old.sl.join() && WL.LIFTS.map(l => l[0] - A.x0).join() === old.lifts.join() && L.W - 1 - A.x1 === 4,
    'his room moved right whole: 44 tiles, the same slabs and lifts, the tower\'s foot after it'); }
const wh = L.ents.filter(e => e.t === 'whelp'), inB = e => e.x >= b0 && e.x <= b1;
ok(wh.length >= 5 && wh.every(inB) && wh.every(e => e.enc), 'five whelps or more, all on the battlements, all in encounters: ' + wh.map(e => e.x + ',' + e.y).join(' '));
const at = (x, y) => L.grid[y * L.W + x], solid = t => t === T.SOLID, stand = t => t === T.SOLID || t === T.ONEWAY;
ok(wh.every(e => stand(at(e.x, e.y + 1))), 'every whelp perches ON something (a merlon, a spout): nothing hangs in the air');
/* the gaps a hero jumps on the route: a run of air cells at a standing row between two footings at that row, with a fall under them */
const gaps = []; for (let y = 10; y < WL.GARDEN; y++) { let x = b0; while (x <= b1) { if (stand(at(x, y + 1)) && stand(at(x - 1, y + 1)) && !stand(at(x + 1, y + 1)) && at(x + 1, y) === T.AIR) {   /* (from footing two wide: a spout's cap is a perch, not a take-off) */ let k = x + 1; while (k <= b1 && !stand(at(k, y + 1)) && k - x < 6) k++;
  if (k <= b1 && stand(at(k, y + 1)) && stand(at(k + 1, y + 1)) && k - x - 1 >= 2) { let deep = 0; for (let d = 1; d < 30 && !stand(at(x + 1, y + 1 + d)); d++) deep = d; gaps.push({ x0: x + 1, x1: k - 1, y, w: k - x - 1, deep }); } x = k; } else x++; } }
const hard = gaps.filter(g => g.w >= 2.5 && g.deep >= 4);
ok(hard.length >= 3 && gaps.every(g => g.w <= 3), 'S2: three jumps of 2.5-3 tiles over a fall, none over 3: ' + gaps.map(g => g.x0 + '-' + g.x1 + '@' + g.y + ' (' + g.w + ', ' + g.deep + ' down)').join(' '));
const near = (e, x0, x1, dx) => e.x >= x0 - dx && e.x <= x1 + dx && e.y < 40;
ok(hard.some(g => wh.some(e => near(e, g.x0, g.x1, 5) && e.y <= g.y)), 'S1: a whelp over a jump');
{ const narrow = []; for (let y = 10; y < 40; y++) for (let x = b0; x <= b1; x++) if (at(x, y + 1) === T.ONEWAY && at(x - 1, y + 1) !== T.ONEWAY) { let n = 0; while (at(x + n, y + 1) === T.ONEWAY) n++; if (n <= 2) narrow.push([x, x + n - 1, y]); }
  ok(narrow.some(([x0, x1, y]) => wh.filter(e => e.x >= x0 - 4 && e.x <= x1 + 4 && e.y < y && e.x !== x0).length >= 2 && wh.filter(e => e.x < x0).length && wh.filter(e => e.x > x1).length), 'S1: a pair of whelps over a narrow ledge, one each side: ' + JSON.stringify(narrow)); }
{ const slabs = L.ents.filter(e => e.t === 'mover' && e.slab && e.x >= b0 && e.x <= b1);
  ok(slabs.length >= 2 && slabs.some(e => e.sink) && wh.some(e => slabs.some(m => Math.abs(e.x - m.x) <= 4 && e.y < m.y)), 'S1/S3: the exam\'s slabs (one of them sinks) with a whelp over them: ' + slabs.map(m => m.x).join(' ')); }
{ const ex = WL.EXAM, cps = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b), prev = cps.filter(x => x < ex[0]).pop();
  ok(cps.includes(ex[0]) && cps.includes(ex[1]) && !cps.some(x => x > ex[0] && x < ex[1]), 'S3: a checkpoint before the exam and one outside the lip, none inside it: ' + cps.filter(x => x > 300).join(' '));
  ok(ex[0] - prev >= 40, 'S4: the exam\'s checkpoint is 40+ columns from the last: ' + prev + ' -> ' + ex[0]);
  ok(ex[1] - ex[0] >= 40 && ex[1] < WL.ARENA.x0, 'S3: the exam is 40+ columns and ends at the lip: ' + ex.join('-'));
  ok(!L.ents.some(e => e.t === 'mend' && e.x > ex[0] && e.x < ex[1]), 'S5: no free heart in the exam'); }
{ const nets = new Set(); for (let x = b0; x <= b1; x++) for (let y = 10; y <= 40; y++) if (at(x, y) === T.NET) nets.add(x);
  const moats = [WL.BATT.breach, WL.BATT.moat, [WL.BATT.exam[0], WL.BATT.exam[1]]];
  ok(moats.every(([a]) => nets.has(a)) && [...nets].every(x => moats.some(([a]) => a === x)), 'every moat has a rope up its near wall and only there: a fall costs the climb and skips nothing: ropes at ' + [...nets].join(' ')); }
// 3. the Gargoyle calls whelps
ok(/c\.whelp\(/.test(gg) && !/c\.imp\(/.test(gg) && /whelps: 3,/.test(gg) && /shriekEvery: 13,/.test(gg), 'the Gate Gargoyle\'s shriek calls whelps, not imps: three at most, every 13 s at most');
ok(/whelp: \(x, y\) => \{/.test(main) && !/\n {4}imp: \(x, y\) => \{ const n0 = enemies\.length; spawnEnt\(\{ t: 'imp'/.test(main) && main.includes('THE WHELPS HE CALLED CRUMBLE WITH HIM'), 'main.js hands him whelps, and they go when he does');
// 4. on the page
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const out={};
    const boot=keep=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(${I});BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(10);for(const e of BK.enemies())if(!keep(e))e.alive=false;};
    const W=()=>BK.enemies().find(e=>e.t==='whelp'&&e.alive&&e.x>=364*16&&e.x<366*16);
    if(!BK.enemies().some(e=>e.t==='whelp')){boot(()=>true);if(!BK.enemies().some(e=>e.t==='whelp'))return {none:true};}
    /* STONE: a blow on its perch is a chip */
    boot(e=>e.t==='whelp'&&e.x>=364*16&&e.x<366*16);let w=W();BK.tp(350,30);BK.sim(5);w.cd=99;const h0=w.hp;BKT.hurtEnemy(w,30,w.x-20,false);BK.sim(2);out.stone={took:h0-w.hp,mode:w.mode,alive:w.alive};
    /* SEEN, IT SWOOPS: the tell, then the dive; unguarded, a hit and a shove */
    const swoop=guard=>{boot(e=>e.t==='whelp'&&e.x>=364*16&&e.x<366*16);const w=W();BK.tp(362,30);BK.sim(3);w.cd=0.2;BK.god=false;BK.P.hp=BK.P.maxHp;BK.P.inv=0;const hp0=BK.P.hp;
      const seen=new Set();let shove=0,tellT=0;for(let i=0;i<150;i++){if(guard)BK.keys.block=true;BK.sim(1);seen.add(w.mode);if(w.mode==='crouchTell')tellT++;shove=Math.max(shove,Math.abs(BK.P.vx));if(w.mode==='landed'||w.mode==='dazed')break;}
      BK.keys.block=false;const o={seen:[...seen],tell:+(tellT/60).toFixed(2),mode:w.mode,hurt:hp0-BK.P.hp,shove:Math.round(shove),wound:BK.windingUpOf?null:null};BK.god=true;BK.P.hp=BK.P.maxHp;return [o,w];};
    {const [o,w]=swoop(false);out.open=o;
     /* landed, every blow counts */
     if(w.mode==='landed'||w.mode==='dazed'){const h=w.hp;BKT.hurtEnemy(w,10,w.x-20,false);out.open.soft=h-w.hp;}
     /* then home, and stone again */
     let t=0;for(;t<600&&w.mode!=='perch';t++){BK.sim(1);}out.open.home={mode:w.mode,dx:Math.round(w.x-w.home.x),dy:Math.round(w.y-w.home.y),secs:+(t/60).toFixed(1)};}
    {const [o]=swoop(true);out.guard=o;}
    /* BROKEN, IT CRUMBLES */
    {const [o,w]=swoop(false);w.hp=1;BKT.hurtEnemy(w,10,w.x-20,false);BK.sim(2);const c=(BK.corpses?BK.corpses():[]).find(q=>q.t==='whelp');out.crumble={alive:w.alive,corpse:!!c,frame:c?c.frame:null};}
    /* THE GATE GARGOYLE CALLS WHELPS */
    {boot(e=>e.t==='gargoyle');const g=BK.enemies().find(e=>e.t==='gargoyle');const s=BK.movers().filter(m=>m.arena&&!m.cracked).sort((a,b)=>a.x-b.x)[0];
     BK.P.x=s.x+s.w/2;BK.P.y=s.y-1;BK.P.vy=0;BK.sim(90);const calls=[];
     for(let k=0;k<3;k++){g.mode='perchFly';g.modeT=2.5;g.shriekCd=0;for(let i=0;i<400&&g.mode!=='hover';i++){BK.sim(1);}
       const adds=BK.enemies().filter(q=>q.alive&&q.fromGarg);calls.push({whelps:adds.filter(q=>q.t==='whelp').length,imps:adds.filter(q=>q.t==='imp').length});}
     const one=BK.enemies().find(q=>q.alive&&q.fromGarg&&q.t==='whelp');let swooped=false;if(one){BK.god=true;for(let i=0;i<600&&!swooped;i++){BK.sim(1);if(one.mode==='swoop')swooped=true;}}
     g.hp=1;BKT.hurtEnemy(g,40,g.x-20,false);BK.sim(20);out.garg={calls,swooped,after:BK.enemies().filter(q=>q.alive&&q.fromGarg).length,dead:!g.alive};}
    out.errors=(window.__errs||[]).slice(0,3);return out;})()`, 600000);
  console.log(JSON.stringify(r));
  if (r.none) ok(false, 'there are whelps on the page');
  else {
    ok(r.stone.alive && r.stone.took <= 1 && r.stone.mode !== 'landed', 'PERCHED IT IS STONE: a 30-point blow takes ' + r.stone.took);
    ok(r.open.seen.includes('crouchTell') && r.open.tell >= 0.5 && r.open.seen.includes('swoop'), 'SEEN, it crouches (' + r.open.tell + ' s), then swoops: ' + r.open.seen.join(' '));
    ok(r.open.hurt > 0 && r.open.shove >= 150, 'unguarded, the swoop hurts (' + r.open.hurt + ') and SHOVES (' + r.open.shove + ' px/s)');
    ok(r.open.soft >= 8, 'LANDED, every blow counts: ' + r.open.soft + ' of 10');
    ok(r.open.home.mode === 'perch' && Math.abs(r.open.home.dx) <= 2 && Math.abs(r.open.home.dy) <= 2, 'then it flies home and hardens: ' + JSON.stringify(r.open.home));
    ok(r.guard.mode === 'dazed' && r.guard.hurt === 0, 'GUARDED, it clangs off dazed and costs nothing: ' + JSON.stringify(r.guard));
    ok(!r.crumble.alive && r.crumble.corpse && r.crumble.frame === 7, 'BROKEN, it crumbles: ' + JSON.stringify(r.crumble));
    ok(r.garg.calls.every(c => c.imps === 0) && r.garg.calls[0].whelps >= 2 && r.garg.calls.every(c => c.whelps <= 3), 'THE GARGOYLE\'S SHRIEK brings whelps, never imps, never more than three: ' + JSON.stringify(r.garg.calls));
    ok(r.garg.swooped, 'a whelp he called swoops at you across his room');
    ok(r.garg.dead && r.garg.after === 0, 'and they crumble when he dies: ' + r.garg.after + ' left');
  }
  ok((r.errors || []).length === 0 && pg.errors.length === 0, 'no errors on the page: ' + JSON.stringify((r.errors || []).concat(pg.errors).slice(0, 3)));
} finally { pg.close(); }
console.log(fails.length ? '\n' + fails.length + ' FAILED' : '\nTHE GARGOYLE WHELP: stone on its perch, a told swoop that shoves, soft where it lands; THE BATTLEMENTS before the Gargoyle, and whelps at his call.');
process.exitCode = fails.length ? 1 : 0;
