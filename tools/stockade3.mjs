// tools/stockade3.mjs - PINS THE STOCKADE 3's NEW BEATS (claude/stockade3-1101, scratch/brief-stockade3-1101.md; report work/claude/lane-done/claude-stockade3-1101.md)
// Daniel 11-01: "the level and the boss should better use the level's mechanics" - the captured horn's lure, the log pile's crush and the barred gate, together.
// STATIC (node, the built level):
//   early horn   the level's FIRST horn blower (the Watchpost, in THE OUTER CAMP) drops his horn - the verb starts in the first area
//   a pile each  every area but the tunnel (the held breath) has a log pile for the horn to pull a crew under: outer camp, yard, wall walk + kennels, the
//                watchtowers (cook fire, gate, tower three) and the hall (two, each on a floor peg)
//   the fork     THE BARRED GATE's pile is tied off at a floor peg and lands as a STAIR; THE GATE WALK over the gate is out of a jump from the floor.
//                REACH, BOTH CHOICES, EVERY HERO (src/reachcore.js, each hero's own legs): gate open + no stair reaches the hall; gate SHUT + the stair laid
//                reaches the hall (the quiet way: never a soft-lock without a horn); gate shut + no stair does NOT reach past the gate (the lock is real)
//   the cranks   the camp's crank gates are still there for the horn to open (>= 3)
//   the hall     two hall piles over the floor inside the arena, their pegs clear of the war tower's pegs and the racks
// PAGE (one headless page):
//   the early horn taken off the Watchpost blower; the gantry teach (blown on the boards, the cooks run under, one blow on the lashing crushes them)
//   a crank gate opens to the horn; the fork both ways (the peg first: a stair laid, the crew asleep, the stair still down after a reset; the loud way: the
//   horn opens the gate, the crew run under the logs, the peg crushes them); the Chieftain HEARS THE HORN (lured to the hall pile by where it was blown),
//   the peg drops it on him (CRUSHED: planted, x2), a second blow inside the cooldown is IGNORED; his war horn's crew crushed under a hall pile drip health;
//   a fight begun without a horn is handed the hall's
// PROVED RED FIRST on origin/master 0fe14c26 (none of these beats exist there).
import assert from 'node:assert/strict';
import { LEVELS, T, TS } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';
import { CHIEF_LURE, CRUSH, PILE } from '../src/stockade-hands.js';
import { openPage } from './cdp.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const lv = LEVELS.find(l => l.id === 'stockade'), L = lv.build(), S = L.stockade || {}, A = L.arena, W = L.W;
const at = (x, y) => L.grid[y * W + x];
// ---- STATIC ----
const blowers = L.ents.filter(e => e.t === 'archer' && e.horn).sort((a, b) => a.x - b.x);
ok(blowers[0] && blowers[0].stk && blowers[0].stk.drops && blowers[0].x < 131, 'early horn: the first horn blower (' + (blowers[0] && blowers[0].x) + ') does not drop his horn in THE OUTER CAMP');
const piles = L.ents.filter(e => e.t === 'logpile'), areas = S.areas || [];
const areaOf = x => { const a = areas.find(([, x0, x1]) => x >= x0 && x < x1); return a ? a[0] : '?'; };
for (const a of areas.filter(([n]) => !/TUNNEL/.test(n))) ok(piles.some(p => p.x >= a[1] && p.x < a[2]), 'a pile each: ' + a[0] + ' has no log pile');
const gp = piles.find(p => p.id === 'pile-2'), G = S.gate;
ok(gp && gp.cleat !== undefined && Array.isArray(gp.ramp) && gp.ramp.length >= 4, 'fork: the gate pile is not tied off at a peg with a stair (' + JSON.stringify(gp) + ')');
let wk = 0; if (G) for (let x = G.x - 1; x <= G.x + 10; x++) if (at(x, G.y0 - 1) === T.PLANK) wk++;
ok(G && wk >= 10, 'fork: no gate walk over the gate (' + wk + ' boards on row ' + (G && G.y0 - 1) + ')');
const hallSeen = R => { for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (x > A.x0 / TS + 3 && x < A.x1 / TS - 3 && y >= A.floor / TS - 3) return true; } return false; };
const pastGate = R => { for (const k of R.seen) { const [x, y] = k.split(',').map(Number); if (x > G.x + 2 && x < G.x + 12 && y <= A.floor / TS) return true; } return false; };
const variant = (open, stair) => { const g = L.grid.slice(); if (!open) for (let y = G.y0; y <= G.y1; y++) g[y * W + G.x] = T.SOLID;   /* shut: a wall (the fill's jumps pass any gate - src/reachcore.js across: only rock stops a jump) */
  if (stair && gp) for (const [du, row] of gp.ramp) { const i = row * W + gp.x + du; if (g[i] === T.AIR) g[i] = T.PLANK; }
  return { ...L, grid: g, reachDoors: open ? L.reachDoors : (L.reachDoors || []).filter(d => !(d.x0 <= G.x && d.x1 >= G.x)) }; };
const reach = {};
if (G && gp) for (const h of HERO_MOVE_IDS) {
  const loud = floodReach(variant(true, false), T, { hero: h }), quiet = floodReach(variant(false, true), T, { hero: h }), shut = floodReach(variant(false, false), T, { hero: h });
  reach[h] = [hallSeen(loud), hallSeen(quiet), pastGate(shut)];
  ok(reach[h][0], 'reach (' + h + '): the gate OPEN (the horn) does not reach the hall');
  ok(reach[h][1], 'reach (' + h + '): the gate SHUT with the stair laid (no horn, the peg first) does not reach the hall - a soft-lock');
  ok(!reach[h][2], 'reach (' + h + '): the gate shut and no stair still gets past the gate (the lock is not real - the gate walk is in a jump from the floor)'); }
const cranks = L.ents.filter(e => e.t === 'crank' && e.wall !== undefined); ok(cranks.length >= 3, 'cranks: ' + cranks.length + ' crank gates (want 3: the horn opens more than one gate)');
const hall = piles.filter(p => p.hall), pegs = (S.tower && S.tower.pegs || []).map(x => x / TS), racks = L.ents.filter(e => e.t === 'rack');
ok(hall.length === 2 && hall.every(p => p.cleat !== undefined && p.x * TS > A.x0 && p.x * TS < A.x1 && (p.x + p.cleat) * TS > A.x0 && (p.x + p.cleat) * TS < A.x1), 'hall: not two hall piles with their pegs inside the arena (' + JSON.stringify(hall) + ')');
for (const p of hall) { const c = p.x + p.cleat + 0.5; ok(pegs.every(q => Math.abs(q - c) > 1.4) && racks.every(r => Math.abs(r.x + 0.5 - c) > 1.9), 'hall: ' + p.id + '\'s peg (' + c + ') stands on a war-tower peg or a rack (' + pegs + ' / ' + racks.map(r => r.x) + ')'); }
ok(CHIEF_LURE.cd >= 6 && CHIEF_LURE.look <= 2.2 && CRUSH.open >= 2 && CRUSH.open <= 3.5, 'boss numbers: a lure every ' + CHIEF_LURE.cd + ' s at most, a look of ' + CHIEF_LURE.look + ' s, crushed open ' + CRUSH.open + ' s');
console.log('stockade3 (static): first blower ' + (blowers[0] && blowers[0].x) + ' | piles ' + piles.map(p => p.id + '@' + p.x + ' ' + areaOf(p.x)).join(', ') + ' | gate walk ' + wk + ' | reach loud/quiet/shut ' + JSON.stringify(reach));

// ---- PAGE ---- (--static: the node half only)
if (process.argv.includes('--static')) { if (fails.length) console.log(fails.map(f => '  FAIL ' + f).join(String.fromCharCode(10))); assert.deepEqual(fails, []); console.log('stockade3 (static) holds'); process.exit(0); }
const pg = await openPage({ audio: false, fonts: false }); let p = {};
try { p = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='stockade');
  const o={};const S=()=>BK.stockade();const E=()=>BK.enemies();const P=()=>BK.P;const H=()=>BKT.stk();let k=0;const pile=id=>S().piles.find(q=>q.id===id);
  const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(10);};
  const strikeAt=(x,face)=>{P().x=x;P().face=face;P().vx=0;BK.sim(3);BK.press('atk');BK.sim(14);};
  /* the early horn */
  load();const wb=E().find(e=>e.drops&&!e.dozing);o.wbX=wb&&Math.round(wb.x/16);BKT.hurtEnemy(wb,999,P().x,false);BK.sim(60);const pk=S().pickups[0];o.wbDropped=!!pk;if(pk){BK.tp(Math.floor(pk.x/16),Math.floor(pk.y/16)-1);BK.sim(20);}o.earlyHeld=S().held;
  /* the gantry teach */
  { const p0=pile('pile-0');BK.tp(Math.floor(p0.x/16)-2,Math.floor(p0.y/16)-1);BK.sim(10);const cooks=()=>E().filter(e=>e.alive&&e.cook!==undefined&&Math.abs(e.x-p0.x)<12*16&&e.y>p0.y+40);const c0=cooks().length;
    H().blow();BK.sim(160);o.gantryUnder=cooks().filter(e=>Math.abs(e.x-p0.x)<26).length;o.gantryCooks=c0;strikeAt(p0.x-12,1);BK.sim(80);o.gantryPile=pile('pile-0').st;o.gantryCrushed=c0-cooks().length; }
  /* a crank gate opens to the horn */
  { const cr=BK.props().find(q=>q.t==='crank'&&!q.open);o.crankWall=cr&&cr.wall;BK.tp(cr.wall-6,19);BK.sim(150);BK.sim(5);H().blow();BK.sim(60);o.crankOpen=!!cr.open&&BK.L.grid[17*BK.L.W+cr.wall]===0; }
  /* the fork, the quiet way: the peg first */
  load();const g=BK.L.stockade.gate,p2=pile('pile-2');o.peg=Math.round(p2.cleat/16);
  BK.tp(Math.floor(p2.cleat/16)-1,19);BK.sim(20);strikeAt(p2.cleat-14,1);BK.sim(90);o.quietPile=pile('pile-2').st;o.stair=[[g.x-1,17],[g.x-2,18],[g.x-3,19]].map(([x,y])=>BK.L.grid[y*BK.L.W+x]);
  o.crewAsleep=E().filter(e=>e.alive&&e.gateGuard===true).length;o.gateStillShut=BK.L.grid[g.y0*BK.L.W+g.x]!==0;H().reset();BK.sim(5);o.stairAfterReset=pile('pile-2').st+':'+BK.L.grid[17*BK.L.W+g.x-1];
  /* the fork, the loud way: the horn opens the gate, the crew run under the logs, the peg */
  load();H().give();BK.tp(Math.floor(p2.cleat/16)-1,19);BK.sim(20);const crew=()=>E().filter(e=>e.alive&&e.gateGuard!==undefined&&e.gateGuard!==false||e.alive&&e.gateGuard==='out');const n0=E().filter(e=>e.alive&&e.gateGuard).length;
  P().x=p2.cleat-14;P().face=1;H().blow();k=0;while(k++<400&&E().filter(e=>e.alive&&e.gateGuard==='out'&&Math.abs(e.x-p2.x)<26).length<2)BK.sim(1);o.loudOpen=S().gateOpen;o.loudUnder=E().filter(e=>e.alive&&e.gateGuard==='out'&&Math.abs(e.x-p2.x)<26).length;
  P().face=1;BK.press('atk');k=0;while(k++<240&&pile('pile-2').st!=='down')BK.sim(1);BK.sim(5);o.loudCrushed=n0-E().filter(e=>e.alive&&e.gateGuard).length;o.loudPile=pile('pile-2').st;
  /* the Chieftain: the hall's horn, HE HEARS THE HORN, the peg, CRUSHED, the cooldown */
  const fight=()=>{load();const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);const ch=E().find(q=>q.t==='chief'&&q.alive);ch.inv=0;ch.hornCd=99;ch.kegCd=99;return ch;};
  let ch=fight();o.hallHorn=S().held;const hl=pile('hall-l'),spot=hl.cleat+14;
  P().x=spot;P().y=BK.L.arena.floor;ch.x=spot+90;ch.mode='walk';ch.modeT=1;ch.lureCd=0;BK.sim(2);o.lureable=S().chiefLureable;H().blow();o.lured=ch.mode==='lured';
  k=0;while(k++<300&&!(ch.mode==='lured'&&ch.lureLook))BK.sim(1);o.lureLook=ch.mode==='lured'&&ch.lureLook;o.lureAt=Math.round(ch.x-hl.x);
  P().x=spot;P().face=-1;BK.sim(1);BK.press('atk');k=0;while(k++<120&&ch.mode!=='planted')BK.sim(1);o.crushed=ch.mode==='planted'&&ch.poseKind==='crushed';ch.inv=0;let h0=ch.hp;BKT.hurtAs('light',ch,20,ch.x+12,false);o.crushTake=(h0-ch.hp)/20;
  k=0;while(k++<400&&ch.mode==='planted')BK.sim(1);ch.mode='walk';ch.modeT=1;BK.sim(2);H().blow();o.ignored=ch.mode!=='lured'&&S().lure.ignored>=1;
  /* his crew under a hall pile: CRUSHED and a drip of health */
  ch=fight();const hr=pile('hall-r');ch.x=hl.x+40;ch.mode='walk';ch.modeT=0;P().x=ch.x-60;P().hp=Math.round(P().maxHp*0.4);const hp0=P().hp;BKT.stk().update(0);
  { const q=BKT.stk(); } ch.hornCd=0;k=0;while(k++<300&&ch.mode!=='horn')BK.sim(1);k=0;while(k++<400&&ch.mode==='horn')BK.sim(1);BK.sim(2);
  const cw=E().filter(e=>e.alive&&e.chiefCrew);o.crewN=cw.length;for(const e of cw){e.x=hr.x+(cw.indexOf(e)?6:-6);e.lureT=5;e.lureX=e.x;}ch.x=hl.x;ch.mode='walk';ch.modeT=9;
  P().x=hr.cleat-14;P().face=1;P().y=BK.L.arena.floor;BK.sim(1);BK.press('atk');BK.sim(80);o.crewCrushed=cw.filter(e=>!e.alive).length;o.drip=P().hp-hp0;o.fodder=S().lure.fodder;
  return o;})()`, 240000); p.errors = pg.errors.slice(0, 3); } finally { pg.close(); }
ok(p.wbDropped && p.earlyHeld, 'early horn: the Watchpost blower did not drop a horn you can take (' + JSON.stringify({ x: p.wbX, dropped: p.wbDropped, held: p.earlyHeld }) + ')');
ok(p.gantryCooks >= 2 && p.gantryUnder >= 2 && p.gantryPile === 'down' && p.gantryCrushed >= 2, 'teach: blown on the gantry, the cooks did not run under the logs and die to one blow on the lashing (' + JSON.stringify({ n: p.gantryCooks, under: p.gantryUnder, pile: p.gantryPile, crushed: p.gantryCrushed }) + ')');
ok(p.crankOpen, 'cranks: a horn blown by a crank gate (' + p.crankWall + ') did not open it');
ok(p.quietPile === 'down' && (p.stair || []).every(t => t === T.PLANK) && p.crewAsleep >= 3 && p.gateStillShut && /^down:/.test(p.stairAfterReset) && +p.stairAfterReset.split(':')[1] === T.PLANK,
  'fork (quiet): the peg first did not lay the stair with the crew asleep and the gate shut, or the stair did not stay down (' + JSON.stringify({ pile: p.quietPile, stair: p.stair, asleep: p.crewAsleep, shut: p.gateStillShut, after: p.stairAfterReset }) + ')');
ok(p.loudOpen && p.loudUnder >= 2 && p.loudCrushed >= 2 && p.loudPile === 'down', 'fork (loud): the horn did not open the gate and bring the crew under the logs for the peg (' + JSON.stringify({ open: p.loudOpen, under: p.loudUnder, crushed: p.loudCrushed, pile: p.loudPile }) + ')');
ok(p.hallHorn, 'hall: a fight begun without a horn is not handed the hall\'s');
ok(p.lureable && p.lured && p.lureLook && Math.abs(p.lureAt) < 10, 'boss: blown by the left peg the Chieftain did not hear it and go to stand under its logs (' + JSON.stringify({ able: p.lureable, lured: p.lured, look: p.lureLook, at: p.lureAt }) + ')');
ok(p.crushed && p.crushTake >= 1.5, 'boss: the peg did not drop the logs on him - CRUSHED, planted, x2 (' + JSON.stringify({ crushed: p.crushed, x: p.crushTake }) + ')');
ok(p.ignored, 'boss: a horn blown inside his cooldown still lured him (want HE IGNORES IT)');
ok(p.crewN >= 1 && p.crewCrushed >= 1 && p.drip > 0 && p.fodder >= 1, 'boss: his crew crushed under a hall pile did not die and drip health (' + JSON.stringify({ crew: p.crewN, crushed: p.crewCrushed, drip: p.drip, fodder: p.fodder }) + ')');
ok(!(p.errors || []).length, 'page errors ' + JSON.stringify(p.errors));
console.log('stockade3 (page): ' + JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'errors'))));
if (fails.length) console.log(fails.map(f => '  FAIL ' + f).join('\n'));
assert.deepEqual(fails, []);
console.log('stockade3: the early horn, a pile in every area, the gate fork both ways (reach proved per hero), the cranks, and the Chieftain lured + crushed + his crew as fodder all hold');
